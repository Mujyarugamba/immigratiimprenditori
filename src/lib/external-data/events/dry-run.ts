import {
  assertEventsRedirectAllowed,
  assertEventsUrlAllowed,
  dedupeEventsCandidates,
  mergeCrossSourceEvents,
  normalizeEventsAcquisition,
  normalizeEventsUrl,
  type EventsAcquisitionCandidate,
  type NormalizedExternalEvent,
} from "@/lib/external-data/events/acquisition";
import {
  EVENTS_SOURCE_ALLOWLIST,
  type EventsSourceAllowlistEntry,
  type EventsSourceCode,
} from "@/lib/external-data/events/allowlist";
import * as cheerio from "cheerio";

const MAX_RESPONSE_BYTES = 2_000_000;
const REQUEST_TIMEOUT_MS = 12_000;
const PER_SOURCE_LIMIT = 4;
const FORBIDDEN_FLAGS = new Set([
  "--apply",
  "--yes",
  "--project-ref",
  "--allow-production",
]);

export type EventsDryRunArgs = {
  help: boolean;
  from: string;
  to: string;
  limit: number;
};

export type PublicResponse = {
  url: string;
  status: number;
  contentType: string;
  body: string;
};

export type PublicFetcher = (
  source: EventsSourceAllowlistEntry,
  url: string,
) => Promise<PublicResponse>;

type JsonObject = Record<string, unknown>;

const AUTHORIZED_ZONES = {
  italy: "Europe/Rome",
  italia: "Europe/Rome",
  belgium: "Europe/Brussels",
  belgio: "Europe/Brussels",
  germany: "Europe/Berlin",
  germania: "Europe/Berlin",
} as const;

export type EventsDryRunRejection = {
  source: EventsSourceCode;
  url: string;
  reason: string;
};

export type EventsDryRunOutput = {
  mode: "dry-run";
  from: string;
  to: string;
  limit: number;
  consultedSources: Array<{
    source: EventsSourceCode;
    seedUrl: string;
    fetchedPages: number;
    validCandidates: number;
    status: "ok" | "zero-results";
  }>;
  candidates: NormalizedExternalEvent[];
  rejected: EventsDryRunRejection[];
  counts: {
    total: number;
    perSource: Record<EventsSourceCode, number>;
    duplicates: number;
    published: 0;
    autoPublish: 0;
    databaseAccesses: 0;
    remoteWrites: 0;
  };
};

export function eventsDryRunUsage(): string {
  return [
    "Usage: npm run d1:d8a:dry-run -- --from YYYY-MM-DD --to YYYY-MM-DD --limit N",
    "Dry-run only. N must be between 1 and 16.",
  ].join("\n");
}

function takeValue(argv: string[], index: number, name: string) {
  const token = argv[index]!;
  const prefix = `${name}=`;
  if (token.startsWith(prefix)) {
    const value = token.slice(prefix.length);
    if (!value) throw new Error(`${name} requires a value`);
    return { value, consumed: 1 };
  }
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return { value, consumed: 2 };
}

function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(`${value}T00:00:00Z`).toISOString().startsWith(value)
  );
}

export function parseEventsDryRunArgs(argv: string[]): EventsDryRunArgs {
  const seen = new Set<string>();
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length;) {
    const token = argv[i]!;
    const name = token.split("=", 1)[0]!;
    if (FORBIDDEN_FLAGS.has(name)) {
      throw new Error(`forbidden Production flag: ${name}`);
    }
    if (!["--help", "--from", "--to", "--limit"].includes(name)) {
      throw new Error(`unknown argument: ${token}`);
    }
    if (seen.has(name)) throw new Error(`duplicate argument: ${name}`);
    seen.add(name);
    if (name === "--help") {
      if (argv.length !== 1) throw new Error("--help cannot be combined");
      return { help: true, from: "", to: "", limit: 0 };
    }
    const parsed = takeValue(argv, i, name);
    values.set(name, parsed.value);
    i += parsed.consumed;
  }
  for (const name of ["--from", "--to", "--limit"]) {
    if (!values.has(name))
      throw new Error(`missing required argument: ${name}`);
  }
  const from = values.get("--from")!;
  const to = values.get("--to")!;
  const limitRaw = values.get("--limit")!;
  if (!validDate(from) || !validDate(to))
    throw new Error("invalid date; use YYYY-MM-DD");
  if (from > to) throw new Error("--from must not be after --to");
  if (!/^\d+$/.test(limitRaw)) throw new Error("--limit must be an integer");
  const limit = Number(limitRaw);
  if (limit < 1 || limit > 16)
    throw new Error("--limit must be between 1 and 16");
  return { help: false, from, to, limit };
}

function sourceUrlAllowed(
  entry: EventsSourceAllowlistEntry,
  rawUrl: string,
): string {
  const normalized = normalizeEventsUrl(rawUrl);
  if (!normalized.ok) throw new Error(`url rejected: ${normalized.reason}`);
  const seed = normalizeEventsUrl(entry.mainUrl);
  if (
    seed.ok &&
    entry.allowedHostnames.includes(normalized.hostname) &&
    normalized.pathname.toLowerCase() === seed.pathname.toLowerCase()
  ) {
    return normalized.canonicalUrl;
  }
  return assertEventsUrlAllowed(entry.sourceCode, rawUrl).canonicalUrl;
}

function redirectUrlAllowed(
  entry: EventsSourceAllowlistEntry,
  rawUrl: string,
): string {
  const seed = normalizeEventsUrl(entry.mainUrl);
  const normalized = normalizeEventsUrl(rawUrl);
  if (
    seed.ok &&
    normalized.ok &&
    entry.allowedHostnames.includes(normalized.hostname) &&
    normalized.pathname.toLowerCase() === seed.pathname.toLowerCase()
  ) {
    return sourceUrlAllowed(entry, rawUrl);
  }
  return assertEventsRedirectAllowed(entry.sourceCode, rawUrl).canonicalUrl;
}

export function createPublicFetcher(
  fetchImpl: typeof fetch = fetch,
  options: { timeoutMs?: number; maxBytes?: number } = {},
): PublicFetcher {
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? MAX_RESPONSE_BYTES;
  return async (source, initialUrl) => {
    let url = sourceUrlAllowed(source, initialUrl);
    for (let redirects = 0; redirects <= 5; redirects += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: { Accept: "text/html, application/xhtml+xml" },
          credentials: "omit",
        });
      } finally {
        clearTimeout(timer);
      }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("redirect without Location");
        url = redirectUrlAllowed(source, new URL(location, url).toString());
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType =
        response.headers.get("content-type")?.toLowerCase() ?? "";
      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
      ) {
        throw new Error(
          `unsupported Content-Type: ${contentType || "missing"}`,
        );
      }
      const declared = Number(response.headers.get("content-length") ?? "0");
      if (declared > maxBytes) throw new Error("response too large");
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > maxBytes) throw new Error("response too large");
      return {
        url,
        status: response.status,
        contentType,
        body: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      };
    }
    throw new Error("too many redirects");
  };
}

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function collectJsonLd(value: unknown, output: JsonObject[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonLd(item, output);
    return;
  }
  if (!value || typeof value !== "object") return;
  const object = value as JsonObject;
  if (Array.isArray(object["@graph"])) collectJsonLd(object["@graph"], output);
  const type = object["@type"];
  if (type === "Event" || (Array.isArray(type) && type.includes("Event")))
    output.push(object);
}

export function extractEventJsonLd(html: string): JsonObject[] {
  const events: JsonObject[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(re)) {
    try {
      collectJsonLd(JSON.parse(match[1]!.trim()), events);
    } catch {
      // Malformed structured data is rejected by omission.
    }
  }
  return events;
}

export function extractAllowedDetailLinks(
  source: EventsSourceAllowlistEntry,
  html: string,
  baseUrl: string,
): string[] {
  const links = new Set<string>();
  const re = /<a\b[^>]*href=["']([^"']+)["']/gi;
  for (const match of html.matchAll(re)) {
    try {
      links.add(
        assertEventsUrlAllowed(
          source.sourceCode,
          new URL(decodeHtml(match[1]!), baseUrl).toString(),
        ).canonicalUrl,
      );
    } catch {}
  }
  return [...links].sort();
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = decodeHtml(value.replace(/<[^>]+>/g, " "));
  return clean || null;
}

function object(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function locationFields(event: JsonObject) {
  const location = object(
    Array.isArray(event.location) ? event.location[0] : event.location,
  );
  const address = object(location?.address);
  const modeRaw = text(event.eventAttendanceMode)?.toLowerCase() ?? "";
  const online =
    modeRaw.includes("online") ||
    text(location?.["@type"]) === "VirtualLocation";
  const offline = modeRaw.includes("offline") || !!location?.name || !!address;
  const deliveryMode =
    online && offline ? "hybrid" : online ? "online" : "in_presence";
  return {
    deliveryMode: deliveryMode as "hybrid" | "online" | "in_presence",
    venueLabel: text(location?.name),
    addressText: text(address?.streetAddress),
    cityText: text(address?.addressLocality),
    regionText: text(address?.addressRegion),
    countryRef: text(address?.addressCountry),
    onlineReference: online ? text(location?.url) : null,
  };
}

export function jsonLdToCandidate(
  source: EventsSourceAllowlistEntry,
  event: JsonObject,
  pageUrl: string,
  retrievedAt: string,
  visibleText = "",
): EventsAcquisitionCandidate {
  const title = text(event.name);
  const startsAt = text(event.startDate);
  if (!title || !startsAt) throw new Error("missing title or startDate");
  const timezone =
    text(event.timeZone) ??
    text(event.timezone) ??
    authorizedTimezone(visibleText, startsAt);
  if (!timezone) throw new Error("missing explicit IANA timezone");
  const url = text(event.url) ?? pageUrl;
  const location = locationFields(event);
  const organizer = object(event.organizer);
  return {
    sourceCode: source.sourceCode,
    eventUrl: assertEventsUrlAllowed(source.sourceCode, url).canonicalUrl,
    externalId: text(event.identifier),
    originalTitle: title,
    organizerLabel: text(organizer?.name),
    startsAt,
    endsAt: text(event.endDate),
    timezone,
    allDay: /^\d{4}-\d{2}-\d{2}$/.test(startsAt),
    ...location,
    language: text(event.inLanguage) ?? source.language,
    retrievedAt,
    sourcePublishedAt: text(event.datePublished),
    sourceUpdatedAt: text(event.dateModified),
    titleIt: title,
    platformSummaryIt: `Scheda metadata/link dalla fonte istituzionale ${source.responsiblePublisher}.`,
    descriptionStub:
      "Rinvio alla scheda ufficiale dell'evento; contenuto sorgente non memorizzato.",
    typeCode: "other",
  };
}

function timezoneOffsetMinutes(zone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const localAsUtc = Date.UTC(
    Number(value.year),
    Number(value.month) - 1,
    Number(value.day),
    Number(value.hour),
    Number(value.minute),
  );
  return Math.round((localAsUtc - instant.getTime()) / 60_000);
}

export function authorizedTimezone(
  visibleText: string,
  startsAt: string,
): string | null {
  const lower = visibleText.toLowerCase();
  const countries = Object.entries(AUTHORIZED_ZONES).filter(([name]) =>
    new RegExp(`\\b${name}\\b`, "i").test(lower),
  );
  const zones = [...new Set(countries.map(([, zone]) => zone))];
  const abbreviation = /\b(CEST|CET)\b/i.exec(visibleText)?.[1]?.toUpperCase();
  if (zones.length !== 1 || !abbreviation) return null;
  const instant = new Date(startsAt);
  if (Number.isNaN(instant.getTime())) return null;
  const expected = abbreviation === "CEST" ? 120 : 60;
  return timezoneOffsetMinutes(zones[0]!, instant) === expected
    ? zones[0]!
    : null;
}

const MONTHS: Record<string, number> = {
  gennaio: 1,
  january: 1,
  febbraio: 2,
  february: 2,
  marzo: 3,
  march: 3,
  aprile: 4,
  april: 4,
  maggio: 5,
  may: 5,
  giugno: 6,
  june: 6,
  luglio: 7,
  july: 7,
  agosto: 8,
  august: 8,
  settembre: 9,
  september: 9,
  ottobre: 10,
  october: 10,
  novembre: 11,
  november: 11,
  dicembre: 12,
  december: 12,
};

function explicitDateTime(visible: string, zone: string): string {
  const numeric =
    /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b[\s\S]{0,100}?\b(?:ore|at)?\s*(\d{1,2})[:.](\d{2})\b/i.exec(
      visible,
    );
  const named =
    /\b(\d{1,2})\s+(gennaio|january|febbraio|february|marzo|march|aprile|april|maggio|may|giugno|june|luglio|july|agosto|august|settembre|september|ottobre|october|novembre|november|dicembre|december)\s+(20\d{2})\b[\s\S]{0,100}?\b(?:ore|at)?\s*(\d{1,2})[:.](\d{2})\b/i.exec(
      visible,
    );
  const match = numeric ?? named;
  if (!match) throw new Error("missing_explicit_time");
  const day = Number(match[1]);
  const month = numeric ? Number(match[2]) : MONTHS[match[2]!.toLowerCase()];
  const year = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (!month) throw new Error("invalid event date");
  let instant = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = timezoneOffsetMinutes(zone, instant);
  instant = new Date(instant.getTime() - offset * 60_000);
  return instant.toISOString();
}

function htmlFallbackCandidate(
  source: EventsSourceAllowlistEntry,
  html: string,
  pageUrl: string,
  retrievedAt: string,
): EventsAcquisitionCandidate {
  const $ = cheerio.load(html);
  const visible = $("body").text().replace(/\s+/g, " ").trim();
  const title = $("h1").first().text().trim() || $("title").text().trim();
  if (!title) throw new Error("missing event title");
  const zone = authorizedTimezone(visible, new Date().toISOString());
  if (!zone) throw new Error("ambiguous_or_missing_timezone");
  const startsAt = explicitDateTime(visible, zone);
  const countryRef =
    zone === "Europe/Rome" ? "IT" : zone === "Europe/Brussels" ? "BE" : "DE";
  const sourceUrl = assertEventsUrlAllowed(
    source.sourceCode,
    pageUrl,
  ).canonicalUrl;
  return {
    sourceCode: source.sourceCode,
    eventUrl: sourceUrl,
    originalTitle: title,
    startsAt,
    timezone: zone,
    deliveryMode: /\bonline\b/i.test(visible) ? "online" : "in_presence",
    venueLabel: /\bonline\b/i.test(visible) ? null : visible.slice(0, 200),
    countryRef,
    onlineReference: /\bonline\b/i.test(visible) ? sourceUrl : null,
    language: source.language,
    retrievedAt,
    titleIt: title,
    platformSummaryIt: `Scheda metadata/link dalla fonte istituzionale ${source.responsiblePublisher}.`,
    descriptionStub:
      "Rinvio alla scheda ufficiale dell'evento; contenuto sorgente non memorizzato.",
    typeCode: "other",
  };
}

function inWindow(
  candidate: NormalizedExternalEvent,
  from: string,
  to: string,
): boolean {
  const date = candidate.provenance.startsAt.slice(0, 10);
  const end = candidate.provenance.endsAt?.slice(0, 10) ?? date;
  return date <= to && end >= from;
}

export function selectEventsDryRunCandidates(
  candidates: NormalizedExternalEvent[],
  args: Pick<EventsDryRunArgs, "from" | "to" | "limit">,
) {
  const filtered = candidates.filter((candidate) =>
    inWindow(candidate, args.from, args.to),
  );
  const firstDedupe = dedupeEventsCandidates(filtered);
  const merged = mergeCrossSourceEvents(firstDedupe.accepted);
  const perSource = new Map<EventsSourceCode, number>();
  const accepted = merged.groups
    .map((group) => group.primary)
    .sort(
      (a, b) =>
        a.provenance.startsAt.localeCompare(b.provenance.startsAt) ||
        a.naturalKey.localeCompare(b.naturalKey),
    )
    .filter((candidate) => {
      const source = candidate.provenance.sourceCode;
      const count = perSource.get(source) ?? 0;
      if (count >= PER_SOURCE_LIMIT) return false;
      perSource.set(source, count + 1);
      return true;
    })
    .slice(0, args.limit);
  return { accepted, rejected: [...firstDedupe.rejected, ...merged.rejected] };
}

export async function runEventsDryRun(
  args: EventsDryRunArgs,
  options: { fetcher?: PublicFetcher; retrievedAt?: string } = {},
): Promise<EventsDryRunOutput> {
  if (args.help) throw new Error("help must not execute dry-run");
  const fetcher = options.fetcher ?? createPublicFetcher();
  const retrievedAt = options.retrievedAt ?? new Date().toISOString();
  const normalized: NormalizedExternalEvent[] = [];
  const rejected: EventsDryRunRejection[] = [];
  const consultedSources: EventsDryRunOutput["consultedSources"] = [];

  for (const source of EVENTS_SOURCE_ALLOWLIST) {
    let fetchedPages = 0;
    let seed: PublicResponse;
    try {
      seed = await fetcher(source, source.mainUrl);
    } catch (error) {
      rejected.push({
        source: source.sourceCode,
        url: source.mainUrl,
        reason: error instanceof Error ? error.message : String(error),
      });
      consultedSources.push({
        source: source.sourceCode,
        seedUrl: source.mainUrl,
        fetchedPages: 0,
        validCandidates: 0,
        status: "zero-results",
      });
      continue;
    }
    fetchedPages += 1;
    const detailLinks = new Set(
      extractAllowedDetailLinks(source, seed.body, seed.url),
    );
    try {
      assertEventsUrlAllowed(source.sourceCode, seed.url);
      detailLinks.add(seed.url);
    } catch {}
    for (const url of [...detailLinks].sort().slice(0, 12)) {
      try {
        const page = url === seed.url ? seed : await fetcher(source, url);
        if (url !== seed.url) fetchedPages += 1;
        const events = extractEventJsonLd(page.body);
        const visibleText = cheerio.load(page.body)("body").text();
        let parsed = 0;
        for (const event of events) {
          try {
            normalized.push(
              normalizeEventsAcquisition(
                jsonLdToCandidate(
                  source,
                  event,
                  page.url,
                  retrievedAt,
                  visibleText,
                ),
              ),
            );
            parsed += 1;
          } catch (error) {
            rejected.push({
              source: source.sourceCode,
              url,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        }
        if (parsed === 0) {
          try {
            normalized.push(
              normalizeEventsAcquisition(
                htmlFallbackCandidate(source, page.body, page.url, retrievedAt),
              ),
            );
          } catch (error) {
            rejected.push({
              source: source.sourceCode,
              url,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } catch (error) {
        rejected.push({
          source: source.sourceCode,
          url,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    }
    consultedSources.push({
      source: source.sourceCode,
      seedUrl: seed.url,
      fetchedPages,
      validCandidates: 0,
      status: "zero-results",
    });
  }

  const selected = selectEventsDryRunCandidates(normalized, args);
  const perSource = Object.fromEntries(
    EVENTS_SOURCE_ALLOWLIST.map((source) => [source.sourceCode, 0]),
  ) as Record<EventsSourceCode, number>;
  for (const candidate of selected.accepted)
    perSource[candidate.provenance.sourceCode] += 1;
  for (const source of consultedSources) {
    source.validCandidates = perSource[source.source];
    source.status = source.validCandidates ? "ok" : "zero-results";
  }
  for (const duplicate of selected.rejected)
    rejected.push({
      source: "pim-ricerca-eventi",
      url: "",
      reason: duplicate.reason,
    });
  if (
    selected.accepted.some(
      (candidate) =>
        candidate.publicationStatus !== "unpublished" || candidate.autoPublish,
    )
  ) {
    throw new Error("published or auto-publish candidate detected");
  }
  return {
    mode: "dry-run",
    from: args.from,
    to: args.to,
    limit: args.limit,
    consultedSources,
    candidates: selected.accepted,
    rejected,
    counts: {
      total: selected.accepted.length,
      perSource,
      duplicates: selected.rejected.length,
      published: 0,
      autoPublish: 0,
      databaseAccesses: 0,
      remoteWrites: 0,
    },
  };
}
