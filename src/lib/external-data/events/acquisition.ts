/**
 * D1-D.6 — Authoritative Eventi acquisition contract (metadata/link only).
 * Reuses events / event_editions field names. No DB writes. No auto-publish.
 */

import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  assertKnownEventsSource,
  EVENTI_ACQUISITION,
  getEventsSource,
  type EventsSourceAllowlistEntry,
  type EventsSourceCode,
} from "@/lib/external-data/events/allowlist";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "gclsrc",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "igshid",
  "yclid",
  "_ga",
  "ref",
  "ref_src",
]);

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^\[?[0-9a-f:]+\]?$/i;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const INSTANT_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export type EventsIdentityMethod =
  | "external_id"
  | "canonical_url"
  | "fingerprint";

export type EventsProvenance = {
  sourceCode: EventsSourceCode;
  canonicalUrl: string;
  externalId: string | null;
  originalTitle: string;
  organizerLabel: string | null;
  publisherName: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  allDay: boolean;
  deliveryMode: (typeof EVENTI_ACQUISITION.allowedDeliveryModes)[number];
  venueLabel: string | null;
  addressText: string | null;
  cityText: string | null;
  provinceText: string | null;
  regionText: string | null;
  countryRef: string | null;
  onlineReference: string | null;
  /** Accessory registration link — never primary identity. */
  registrationUrl: string | null;
  language: string;
  retrievedAt: string;
  sourcePublishedAt: string | null;
  sourceUpdatedAt: string | null;
  requiredAttribution: string;
};

export type EventsEditorialMetadata = {
  titleIt: string;
  platformSummaryIt: string;
  descriptionStub: string;
  typeCode: (typeof EVENTI_ACQUISITION.allowedTypeCodes)[number];
  categoryLabels: readonly string[];
  territoryLabel: string | null;
  sourceLink: string;
};

export type EventsIdentity = {
  naturalKey: string;
  externalId: string | null;
  canonicalUrl: string;
  fingerprint: string;
  identityMethod: EventsIdentityMethod;
};

export type EventsStoragePolicy = {
  storeFullPage: false;
  storeFullHtml: false;
  storeAttachments: false;
  storeUnauthorizedImages: false;
};

export type NormalizedExternalEvent = {
  naturalKey: string;
  identityMethod: EventsIdentityMethod;
  fingerprint: string;
  /** Cross-source fingerprint (no sourceCode) for MLPS/PIM/UC merge. */
  crossSourceFingerprint: string;
  provenance: EventsProvenance;
  editorial: EventsEditorialMetadata;
  ownedByEditorial: true;
  editorialStatus: "draft";
  publicationStatus: "unpublished";
  visibilityStatus: "private";
  autoPublish: false;
  acquisitionMode: "METADATA_LINK_ONLY";
  storagePolicy: EventsStoragePolicy;
  sourceUrl: string;
  sourceLabel: string;
  checksumSha256: string;
};

export type EventsAcquisitionCandidate = {
  sourceCode: string;
  eventUrl: string;
  externalId?: string | null;
  originalTitle: string;
  organizerLabel?: string | null;
  publisherName?: string | null;
  startsAt: string;
  endsAt?: string | null;
  timezone?: string | null;
  allDay?: boolean;
  deliveryMode: (typeof EVENTI_ACQUISITION.allowedDeliveryModes)[number];
  venueLabel?: string | null;
  addressText?: string | null;
  cityText?: string | null;
  provinceText?: string | null;
  regionText?: string | null;
  countryRef?: string | null;
  onlineReference?: string | null;
  registrationUrl?: string | null;
  language?: string;
  retrievedAt?: string;
  sourcePublishedAt?: string | null;
  sourceUpdatedAt?: string | null;
  titleIt: string;
  platformSummaryIt: string;
  descriptionStub: string;
  typeCode: (typeof EVENTI_ACQUISITION.allowedTypeCodes)[number];
  categoryLabels?: readonly string[] | null;
  territoryLabel?: string | null;
  sourceFullHtml?: string | null;
  sourceAttachmentBase64?: string | null;
  unauthorizedImageUrl?: string | null;
};

export type ExistingEventsFingerprint = {
  naturalKey: string;
  checksumSha256: string;
  editorialStatus: "draft" | "ready";
  publicationStatus: "unpublished" | "published" | "withdrawn";
  visibilityStatus: "private" | "public";
  title: string;
  summary: string | null;
  typeCode: string;
  sourceTitleSha256: string;
  sourceSummarySha256: string;
};

export type EventsRefreshPlan = {
  action: "CREATE" | "UPDATE" | "UNCHANGED";
  naturalKey: string;
  refreshable: {
    sourceUrl: string;
    sourceLabel: string;
    checksumSha256: string;
    acquiredAt: string;
    sourceUpdatedAt: string | null;
    canonicalUrl: string;
    acquisitionFingerprint: string;
    startsAt: string;
    endsAt: string | null;
    timezone: string;
    deliveryMode: string;
    venueLabel: string | null;
    addressText: string | null;
    cityText: string | null;
    countryRef: string | null;
    onlineReference: string | null;
    occurrenceHint:
      | "scheduled"
      | "postponed"
      | "cancelled"
      | "venue_changed"
      | null;
  };
  preserved: {
    editorialStatus: ExistingEventsFingerprint["editorialStatus"];
    publicationStatus: ExistingEventsFingerprint["publicationStatus"];
    visibilityStatus: ExistingEventsFingerprint["visibilityStatus"];
    title: string;
    summary: string | null;
    typeCode: string;
  };
  titleFromSource: boolean;
  summaryFromSource: boolean;
  autoPublish: false;
};

export type UrlSecurityOk = {
  ok: true;
  canonicalUrl: string;
  hostname: string;
  pathname: string;
};

export type UrlSecurityErr = { ok: false; reason: string };
export type UrlSecurityResult = UrlSecurityOk | UrlSecurityErr;

export type CrossSourceEventGroup = {
  crossSourceFingerprint: string;
  primary: NormalizedExternalEvent;
  linkedProvenances: EventsProvenance[];
};

function isLiteralIpHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "");
  if (IPV4_RE.test(h)) return true;
  if (h.includes(":") && IPV6_RE.test(h)) return true;
  return false;
}

function hostnameMatchesAllowlist(
  hostname: string,
  allowed: readonly string[],
): boolean {
  const host = hostname.toLowerCase();
  return allowed.some((a) => a.toLowerCase() === host);
}

function canonicalHostname(
  hostname: string,
  allowed: readonly string[],
): string {
  const host = hostname.toLowerCase();
  const allowedSet = new Set(allowed.map((a) => a.toLowerCase()));
  if (host.startsWith("www.")) {
    const apex = host.slice(4);
    if (allowedSet.has(apex)) return apex;
  }
  return host;
}

function pathAllowed(
  entry: EventsSourceAllowlistEntry,
  hostname: string,
  pathname: string,
): boolean {
  const host = hostname.toLowerCase();
  const rules = entry.hostPathRules.filter(
    (r) => r.hostname.toLowerCase() === host,
  );
  if (rules.length === 0) return true;
  const path = pathname.toLowerCase() || "/";
  return rules.some((rule) => {
    if (
      rule.pathExclusions?.some((ex) => {
        const e = ex.toLowerCase().replace(/\/+$/, "") || "/";
        return path === e || path.startsWith(`${e}/`);
      })
    ) {
      return false;
    }
    return rule.pathPrefixes.some((prefix) => {
      const p = prefix.toLowerCase().replace(/\/+$/, "") || "/";
      return path === p || path.startsWith(`${p}/`) || path.startsWith(p);
    });
  });
}

export function normalizeEventsUrl(raw: string): UrlSecurityResult {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { ok: false, reason: "empty url" };
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: "malformed url" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "https required" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "embedded credentials rejected" };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) return { ok: false, reason: "missing hostname" };
  if (isLiteralIpHost(hostname)) {
    return { ok: false, reason: "literal ip rejected" };
  }
  if (hostname.includes(" ") || hostname.includes("@")) {
    return { ok: false, reason: "invalid hostname" };
  }

  const clean = new URL(parsed.toString());
  clean.hash = "";
  clean.username = "";
  clean.password = "";
  clean.hostname = hostname;
  if (clean.port === "443") clean.port = "";

  const kept = new URLSearchParams();
  for (const [key, value] of clean.searchParams.entries()) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) continue;
    kept.append(key, value);
  }
  clean.search = kept.toString() ? `?${kept.toString()}` : "";

  let pathname = clean.pathname || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
  }
  clean.pathname = pathname;

  return {
    ok: true,
    canonicalUrl: clean.toString(),
    hostname,
    pathname: clean.pathname,
  };
}

export function assertEventsUrlAllowed(
  sourceCode: string,
  rawUrl: string,
): UrlSecurityOk {
  const entry = assertKnownEventsSource(sourceCode);
  const normalized = normalizeEventsUrl(rawUrl);
  if (!normalized.ok) {
    throw new Error(`url rejected: ${normalized.reason}`);
  }
  if (!hostnameMatchesAllowlist(normalized.hostname, entry.allowedHostnames)) {
    throw new Error(
      `host not in allowlist for ${entry.sourceCode}: ${normalized.hostname}`,
    );
  }
  if (!pathAllowed(entry, normalized.hostname, normalized.pathname)) {
    throw new Error(
      `path not allowed for ${entry.sourceCode} on ${normalized.hostname}: ${normalized.pathname}`,
    );
  }
  const canonHost = canonicalHostname(
    normalized.hostname,
    entry.allowedHostnames,
  );
  if (canonHost !== normalized.hostname) {
    const rewritten = new URL(normalized.canonicalUrl);
    rewritten.hostname = canonHost;
    return {
      ok: true,
      canonicalUrl: rewritten.toString(),
      hostname: canonHost,
      pathname: normalized.pathname,
    };
  }
  return {
    ok: true,
    canonicalUrl: normalized.canonicalUrl,
    hostname: normalized.hostname,
    pathname: normalized.pathname,
  };
}

/** Final URL after redirects must still be on the same source allowlist. */
export function assertEventsRedirectAllowed(
  sourceCode: string,
  finalUrl: string,
): UrlSecurityOk {
  return assertEventsUrlAllowed(sourceCode, finalUrl);
}

export function extractEventsExternalId(
  sourceCode: string,
  canonicalUrl: string,
  provided?: string | null,
): string | null {
  const trimmed = provided?.trim() || null;
  if (trimmed) return trimmed;
  try {
    const u = new URL(canonicalUrl);
    const path = u.pathname;
    if (sourceCode === "pim-ricerca-eventi") {
      const m = path.match(/\/dettaglio-evento\/id\/(\d+)/i);
      return m?.[1] ?? null;
    }
    if (sourceCode === "minlavoro-eventi") {
      const m = path.match(/\/eventi\/pagine\/([^/]+)$/i);
      return m?.[1] ?? null;
    }
    if (sourceCode === "unioncamere-agenda") {
      const m = path.match(/\/agenda\/([^/]+)$/i);
      return m?.[1] ?? null;
    }
    if (sourceCode === "emn-home-affairs-events") {
      const m = path.match(/\/whats-new\/events\/([^/]+)$/i);
      return m?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function eventsFingerprint(input: {
  sourceCode: string;
  originalTitle: string;
  startsAt: string;
  organizerLabel?: string | null;
  venueOrOnline?: string | null;
  deliveryMode: string;
}): string {
  return checksumSha256({
    sourceCode: input.sourceCode.trim(),
    originalTitle: input.originalTitle.trim().toLowerCase(),
    startsAt: input.startsAt.trim(),
    organizerLabel: input.organizerLabel?.trim().toLowerCase() || null,
    venueOrOnline: input.venueOrOnline?.trim().toLowerCase() || null,
    deliveryMode: input.deliveryMode,
  });
}

/** Cross-source fingerprint: title + start + organizer + venue|online (no sourceCode). */
export function eventsCrossSourceFingerprint(input: {
  originalTitle: string;
  startsAt: string;
  organizerLabel?: string | null;
  venueOrOnline?: string | null;
}): string {
  return checksumSha256({
    originalTitle: input.originalTitle.trim().toLowerCase(),
    startsAt: normalizeTemporalKey(input.startsAt),
    organizerLabel: input.organizerLabel?.trim().toLowerCase() || null,
    venueOrOnline: input.venueOrOnline?.trim().toLowerCase() || null,
  });
}

function venueOrOnlineKey(candidate: {
  deliveryMode: string;
  venueLabel?: string | null;
  onlineReference?: string | null;
  cityText?: string | null;
}): string | null {
  if (candidate.deliveryMode === "online") {
    return candidate.onlineReference?.trim() || "online";
  }
  return (
    candidate.venueLabel?.trim() ||
    candidate.cityText?.trim() ||
    candidate.onlineReference?.trim() ||
    null
  );
}

/** Identity precedence: external id > canonical URL > fingerprint. */
export function eventsNaturalKey(input: {
  sourceCode: string;
  externalId?: string | null;
  canonicalUrl?: string | null;
  fingerprint: string;
}): EventsIdentity {
  const externalId = input.externalId?.trim() || null;
  if (externalId) {
    return {
      naturalKey: `${input.sourceCode}:id:${externalId}`,
      externalId,
      canonicalUrl: input.canonicalUrl?.trim() || "",
      fingerprint: input.fingerprint,
      identityMethod: "external_id",
    };
  }
  const url = input.canonicalUrl?.trim() || "";
  if (url) {
    return {
      naturalKey: `${input.sourceCode}:url:${url}`,
      externalId: null,
      canonicalUrl: url,
      fingerprint: input.fingerprint,
      identityMethod: "canonical_url",
    };
  }
  return {
    naturalKey: `${input.sourceCode}:fp:${input.fingerprint}`,
    externalId: null,
    canonicalUrl: "",
    fingerprint: input.fingerprint,
    identityMethod: "fingerprint",
  };
}

export function assertMetadataOnlyEventPayload(candidate: {
  sourceFullHtml?: string | null;
  sourceAttachmentBase64?: string | null;
  unauthorizedImageUrl?: string | null;
}): void {
  if (candidate.sourceFullHtml?.trim()) {
    throw new Error("full source HTML is not storable");
  }
  if (candidate.sourceAttachmentBase64?.trim()) {
    throw new Error("attachments are not storable");
  }
  if (candidate.unauthorizedImageUrl?.trim()) {
    throw new Error("unauthorized images are not storable");
  }
}

function normalizeTemporalKey(value: string): string {
  const v = value.trim();
  if (DATE_ONLY_RE.test(v)) return v;
  const d = Date.parse(v);
  if (Number.isNaN(d)) return v.toLowerCase();
  return new Date(d).toISOString();
}

function assertTemporalRules(candidate: EventsAcquisitionCandidate): {
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  allDay: boolean;
} {
  const startsRaw = candidate.startsAt?.trim();
  if (!startsRaw) throw new Error("startsAt is required");

  const dateOnly = DATE_ONLY_RE.test(startsRaw);
  const instant = INSTANT_RE.test(startsRaw);
  if (!dateOnly && !instant) {
    throw new Error(
      "startsAt must be YYYY-MM-DD or an ISO-8601 instant with timezone offset/Z",
    );
  }

  const allDay = candidate.allDay === true || dateOnly;
  if (!allDay && !instant) {
    throw new Error("timed events require an ISO-8601 instant with timezone");
  }

  const timezone = candidate.timezone?.trim() || "";
  if (!timezone) {
    throw new Error(
      "timezone is required (IANA label; required for editions even when all-day)",
    );
  }
  if (instant && !/[Zz]|[+-]\d{2}:\d{2}$/.test(startsRaw)) {
    throw new Error("timed startsAt must carry an explicit timezone offset or Z");
  }

  const endsRaw = candidate.endsAt?.trim() || null;
  if (endsRaw) {
    const endDateOnly = DATE_ONLY_RE.test(endsRaw);
    const endInstant = INSTANT_RE.test(endsRaw);
    if (!endDateOnly && !endInstant) {
      throw new Error(
        "endsAt must be YYYY-MM-DD or an ISO-8601 instant with timezone offset/Z",
      );
    }
    if (allDay && !endDateOnly && endInstant) {
      // allow; compare as instants
    }
    const startMs = Date.parse(
      dateOnly ? `${startsRaw}T00:00:00Z` : startsRaw,
    );
    const endMs = Date.parse(endDateOnly ? `${endsRaw}T00:00:00Z` : endsRaw);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      throw new Error("invalid startsAt/endsAt temporal value");
    }
    if (endMs < startMs) {
      throw new Error("endsAt must not be before startsAt");
    }
  }

  return {
    startsAt: startsRaw,
    endsAt: endsRaw,
    timezone,
    allDay,
  };
}

function assertDeliveryCoherence(candidate: EventsAcquisitionCandidate): void {
  const mode = candidate.deliveryMode;
  if (
    !(EVENTI_ACQUISITION.allowedDeliveryModes as readonly string[]).includes(
      mode,
    )
  ) {
    throw new Error(`invalid delivery_mode: ${mode}`);
  }
  if (mode === "in_presence") {
    const hasPlace =
      Boolean(candidate.venueLabel?.trim()) ||
      Boolean(candidate.addressText?.trim()) ||
      Boolean(candidate.cityText?.trim()) ||
      Boolean(candidate.countryRef?.trim());
    if (!hasPlace) {
      throw new Error("in_presence requires venue/address/city/country declaration");
    }
  }
  if (mode === "online" && !candidate.onlineReference?.trim()) {
    throw new Error("online requires online_reference");
  }
  if (mode === "hybrid") {
    const hasPlace =
      Boolean(candidate.venueLabel?.trim()) ||
      Boolean(candidate.addressText?.trim()) ||
      Boolean(candidate.cityText?.trim()) ||
      Boolean(candidate.countryRef?.trim()) ||
      Boolean(candidate.onlineReference?.trim());
    if (!hasPlace) {
      throw new Error("hybrid requires venue or online_reference");
    }
  }
}

function normalizeAccessoryRegistrationUrl(
  sourceCode: string,
  raw?: string | null,
): string | null {
  if (!raw?.trim()) return null;
  // Registration links may be on the same allowlisted host; off-allowlist
  // registration hosts are rejected (accessory must not become rogue identity).
  try {
    return assertEventsUrlAllowed(sourceCode, raw).canonicalUrl;
  } catch {
    throw new Error(
      "registrationUrl must stay on the same source allowlist (accessory, not primary identity)",
    );
  }
}

export function eventsPublishAuthorization(): {
  importerMayPublish: false;
  requiresEditorialDecision: true;
} {
  return { importerMayPublish: false, requiresEditorialDecision: true };
}

/**
 * Normalize a candidate against the closed D1-D.6 allowlist.
 * Does not write to DB. Never sets published/public. autoPublish always false.
 */
export function normalizeEventsAcquisition(
  candidate: EventsAcquisitionCandidate,
): NormalizedExternalEvent {
  assertMetadataOnlyEventPayload(candidate);
  const entry = assertKnownEventsSource(candidate.sourceCode);
  if (
    !(EVENTI_ACQUISITION.allowedTypeCodes as readonly string[]).includes(
      candidate.typeCode,
    )
  ) {
    throw new Error(`invalid type_code: ${candidate.typeCode}`);
  }
  assertDeliveryCoherence(candidate);
  const temporal = assertTemporalRules(candidate);

  const titleIt = candidate.titleIt.trim();
  const platformSummaryIt = candidate.platformSummaryIt.trim();
  const descriptionStub = candidate.descriptionStub.trim();
  if (!titleIt || !platformSummaryIt || !descriptionStub) {
    throw new Error("title, summary and description stub are required");
  }
  if (!candidate.originalTitle.trim()) {
    throw new Error("originalTitle required");
  }

  const urlOk = assertEventsUrlAllowed(candidate.sourceCode, candidate.eventUrl);
  const externalId = extractEventsExternalId(
    entry.sourceCode,
    urlOk.canonicalUrl,
    candidate.externalId,
  );
  const registrationUrl = normalizeAccessoryRegistrationUrl(
    entry.sourceCode,
    candidate.registrationUrl,
  );
  const venueKey = venueOrOnlineKey(candidate);
  const fingerprint = eventsFingerprint({
    sourceCode: entry.sourceCode,
    originalTitle: candidate.originalTitle,
    startsAt: temporal.startsAt,
    organizerLabel: candidate.organizerLabel,
    venueOrOnline: venueKey,
    deliveryMode: candidate.deliveryMode,
  });
  const crossSourceFingerprint = eventsCrossSourceFingerprint({
    originalTitle: candidate.originalTitle,
    startsAt: temporal.startsAt,
    organizerLabel: candidate.organizerLabel,
    venueOrOnline: venueKey,
  });
  const identity = eventsNaturalKey({
    sourceCode: entry.sourceCode,
    externalId,
    canonicalUrl: urlOk.canonicalUrl,
    fingerprint,
  });

  const retrievedAt =
    candidate.retrievedAt?.trim() || new Date().toISOString();
  const sourceLabel = entry.attribution;
  const publisherName =
    candidate.publisherName?.trim() || entry.responsiblePublisher;

  const normalized: NormalizedExternalEvent = {
    naturalKey: identity.naturalKey,
    identityMethod: identity.identityMethod,
    fingerprint: identity.fingerprint,
    crossSourceFingerprint,
    provenance: {
      sourceCode: entry.sourceCode,
      canonicalUrl: urlOk.canonicalUrl,
      externalId: identity.externalId,
      originalTitle: candidate.originalTitle.trim(),
      organizerLabel: candidate.organizerLabel?.trim() || null,
      publisherName,
      startsAt: temporal.startsAt,
      endsAt: temporal.endsAt,
      timezone: temporal.timezone,
      allDay: temporal.allDay,
      deliveryMode: candidate.deliveryMode,
      venueLabel: candidate.venueLabel?.trim() || null,
      addressText: candidate.addressText?.trim() || null,
      cityText: candidate.cityText?.trim() || null,
      provinceText: candidate.provinceText?.trim() || null,
      regionText: candidate.regionText?.trim() || null,
      countryRef: candidate.countryRef?.trim() || null,
      onlineReference: candidate.onlineReference?.trim() || null,
      registrationUrl,
      language: (candidate.language ?? entry.language).trim() || entry.language,
      retrievedAt,
      sourcePublishedAt: candidate.sourcePublishedAt?.trim() || null,
      sourceUpdatedAt: candidate.sourceUpdatedAt?.trim() || null,
      requiredAttribution: sourceLabel,
    },
    editorial: {
      titleIt,
      platformSummaryIt,
      descriptionStub,
      typeCode: candidate.typeCode,
      categoryLabels: [...(candidate.categoryLabels ?? [])],
      territoryLabel: candidate.territoryLabel?.trim() || null,
      sourceLink: urlOk.canonicalUrl,
    },
    ownedByEditorial: true,
    editorialStatus: EVENTI_ACQUISITION.ingestDefaults.editorialStatus,
    publicationStatus: EVENTI_ACQUISITION.ingestDefaults.publicationStatus,
    visibilityStatus: EVENTI_ACQUISITION.ingestDefaults.visibilityStatus,
    autoPublish: false,
    acquisitionMode: "METADATA_LINK_ONLY",
    storagePolicy: {
      storeFullPage: false,
      storeFullHtml: false,
      storeAttachments: false,
      storeUnauthorizedImages: false,
    },
    sourceUrl: urlOk.canonicalUrl,
    sourceLabel,
    checksumSha256: checksumSha256({
      naturalKey: identity.naturalKey,
      fingerprint: identity.fingerprint,
      startsAt: temporal.startsAt,
      endsAt: temporal.endsAt,
      titleIt,
      platformSummaryIt,
      typeCode: candidate.typeCode,
      deliveryMode: candidate.deliveryMode,
    }),
  };

  if (normalized.autoPublish !== false) {
    throw new Error("auto-publish is forbidden");
  }
  return normalized;
}

export function dedupeEventsCandidates(
  candidates: NormalizedExternalEvent[],
): {
  accepted: NormalizedExternalEvent[];
  rejected: { naturalKey: string; reason: string }[];
} {
  const seenKeys = new Set<string>();
  const seenUrls = new Set<string>();
  const seenFp = new Set<string>();
  const accepted: NormalizedExternalEvent[] = [];
  const rejected: { naturalKey: string; reason: string }[] = [];

  for (const c of candidates) {
    if (seenKeys.has(c.naturalKey)) {
      rejected.push({
        naturalKey: c.naturalKey,
        reason: "duplicate natural key",
      });
      continue;
    }
    const url = c.provenance.canonicalUrl;
    if (url && seenUrls.has(url)) {
      rejected.push({
        naturalKey: c.naturalKey,
        reason: "duplicate canonical url",
      });
      continue;
    }
    if (seenFp.has(c.fingerprint)) {
      rejected.push({
        naturalKey: c.naturalKey,
        reason: "duplicate acquisition fingerprint",
      });
      continue;
    }
    seenKeys.add(c.naturalKey);
    if (url) seenUrls.add(url);
    seenFp.add(c.fingerprint);
    accepted.push(c);
  }
  return { accepted, rejected };
}

/**
 * Cross-source merge: same event on PIM/MLPS/Unioncamere/EMN → one primary
 * editorial card + linked provenances (no second card).
 */
export function mergeCrossSourceEvents(
  candidates: readonly NormalizedExternalEvent[],
): {
  groups: CrossSourceEventGroup[];
  rejected: { naturalKey: string; reason: string }[];
} {
  const byCross = new Map<string, NormalizedExternalEvent[]>();
  for (const c of candidates) {
    const list = byCross.get(c.crossSourceFingerprint) ?? [];
    list.push(c);
    byCross.set(c.crossSourceFingerprint, list);
  }

  const groups: CrossSourceEventGroup[] = [];
  const rejected: { naturalKey: string; reason: string }[] = [];

  for (const [fp, list] of byCross) {
    const ranked = [...list].sort((a, b) => {
      const pa =
        getEventsSource(a.provenance.sourceCode)?.crossSourcePriority ?? 99;
      const pb =
        getEventsSource(b.provenance.sourceCode)?.crossSourcePriority ?? 99;
      return pa - pb;
    });
    const primary = ranked[0]!;
    const linked = ranked.slice(1);
    for (const extra of linked) {
      rejected.push({
        naturalKey: extra.naturalKey,
        reason: `cross-source duplicate of ${primary.naturalKey}; linked as secondary provenance`,
      });
    }
    groups.push({
      crossSourceFingerprint: fp,
      primary,
      linkedProvenances: linked.map((x) => x.provenance),
    });
  }
  return { groups, rejected };
}

export function planEventsRefresh(
  incoming: NormalizedExternalEvent,
  existing: ExistingEventsFingerprint | null,
  options?: {
    occurrenceHint?:
      | "scheduled"
      | "postponed"
      | "cancelled"
      | "venue_changed"
      | null;
  },
): EventsRefreshPlan {
  if (incoming.autoPublish !== false) {
    throw new Error("auto-publish is forbidden on refresh");
  }
  const occurrenceHint = options?.occurrenceHint ?? null;

  if (!existing) {
    return {
      action: "CREATE",
      naturalKey: incoming.naturalKey,
      refreshable: {
        sourceUrl: incoming.sourceUrl,
        sourceLabel: incoming.sourceLabel,
        checksumSha256: incoming.checksumSha256,
        acquiredAt: incoming.provenance.retrievedAt,
        sourceUpdatedAt: incoming.provenance.sourceUpdatedAt,
        canonicalUrl: incoming.provenance.canonicalUrl,
        acquisitionFingerprint: incoming.fingerprint,
        startsAt: incoming.provenance.startsAt,
        endsAt: incoming.provenance.endsAt,
        timezone: incoming.provenance.timezone,
        deliveryMode: incoming.provenance.deliveryMode,
        venueLabel: incoming.provenance.venueLabel,
        addressText: incoming.provenance.addressText,
        cityText: incoming.provenance.cityText,
        countryRef: incoming.provenance.countryRef,
        onlineReference: incoming.provenance.onlineReference,
        occurrenceHint,
      },
      preserved: {
        editorialStatus: "draft",
        publicationStatus: "unpublished",
        visibilityStatus: "private",
        title: incoming.editorial.titleIt,
        summary: incoming.editorial.platformSummaryIt,
        typeCode: incoming.editorial.typeCode,
      },
      titleFromSource: true,
      summaryFromSource: true,
      autoPublish: false,
    };
  }

  if (existing.naturalKey !== incoming.naturalKey) {
    throw new Error(
      `natural key mismatch on refresh: ${existing.naturalKey} vs ${incoming.naturalKey}`,
    );
  }

  const titleFromSource =
    !existing.sourceTitleSha256 ||
    checksumSha256(existing.title) === existing.sourceTitleSha256;
  const summaryFromSource =
    !existing.sourceSummarySha256 ||
    checksumSha256(existing.summary ?? "") === existing.sourceSummarySha256;

  const unchanged =
    existing.checksumSha256 === incoming.checksumSha256 &&
    existing.naturalKey === incoming.naturalKey;

  return {
    action: unchanged ? "UNCHANGED" : "UPDATE",
    naturalKey: incoming.naturalKey,
    refreshable: {
      sourceUrl: incoming.sourceUrl,
      sourceLabel: incoming.sourceLabel,
      checksumSha256: incoming.checksumSha256,
      acquiredAt: incoming.provenance.retrievedAt,
      sourceUpdatedAt: incoming.provenance.sourceUpdatedAt,
      canonicalUrl: incoming.provenance.canonicalUrl,
      acquisitionFingerprint: incoming.fingerprint,
      startsAt: incoming.provenance.startsAt,
      endsAt: incoming.provenance.endsAt,
      timezone: incoming.provenance.timezone,
      deliveryMode: incoming.provenance.deliveryMode,
      venueLabel: incoming.provenance.venueLabel,
      addressText: incoming.provenance.addressText,
      cityText: incoming.provenance.cityText,
      countryRef: incoming.provenance.countryRef,
      onlineReference: incoming.provenance.onlineReference,
      occurrenceHint,
    },
    preserved: {
      editorialStatus: existing.editorialStatus,
      publicationStatus: existing.publicationStatus,
      visibilityStatus: existing.visibilityStatus,
      title: titleFromSource ? incoming.editorial.titleIt : existing.title,
      summary: summaryFromSource
        ? incoming.editorial.platformSummaryIt
        : existing.summary,
      typeCode: existing.typeCode,
    },
    titleFromSource,
    summaryFromSource,
    autoPublish: false,
  };
}
