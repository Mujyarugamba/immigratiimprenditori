import { checksumSha256 } from "@/lib/external-data/checksum";
import type {
  DryRunCounts,
  DryRunRecord,
  DryRunReport,
  LicenseClass,
} from "@/lib/external-data/types";

/** Registry id + open-data export surface (portal Solr = Scarica JSON/CSV). */
export const INCENTIVI_GOV_OPENDATA = {
  sourceId: "incentivi-gov-opendata",
  datasetId: "incentivi-gov-catalog",
  sourceSystem: "incentivi-gov",
  licenseClass: "OPEN_REUSABLE" as LicenseClass,
  licenseNote:
    "IODL 2.0 declared on https://www.incentivi.gov.it/it/open-data — reuse with attribution; verified 2026-08-13.",
  licenseUrl: "http://www.dati.gov.it/iodl/2.0/",
  openDataPageUrl: "https://www.incentivi.gov.it/it/open-data",
  portalOrigin: "https://www.incentivi.gov.it",
  /** Official open-data export endpoint configured on the portal page. */
  solrSelectPath: "/solr/coredrupal/select",
  attribution: "Fonte: Incentivi.gov.it — Open Data (IODL 2.0)",
  autoPublish: false as const,
  pilotMax: 20,
  requiredFields: [
    "zs_nid",
    "zs_title",
    "zs_url",
  ] as const,
  priorityScopePattern:
    /internazional|digital|innova|forma|invest|imprend|start.?up|industria creativ|cultur|competen/i,
  geographyPattern: /lombardia|italia|nazionale|tutte le regioni/i,
};

export type IncentiviGovSolrDoc = {
  zs_nid?: string | number;
  zs_title?: string;
  zs_url?: string;
  zs_field_open_date?: string;
  zs_field_close_date?: string;
  zm_field_regions_value?: string | string[];
  zm_field_scopes_value?: string | string[];
  zs_field_subject_grant?: string;
  zs_field_link?: string;
  zs_body?: string;
  ds_last_update?: string;
  [key: string]: unknown;
};

export type IncentiviGovSolrResponse = {
  responseHeader?: { status?: number };
  response?: {
    numFound?: number;
    docs?: IncentiviGovSolrDoc[];
  };
  error?: { msg?: string };
};

export type TemporalAccessState =
  | "scheduled"
  | "open_or_ongoing"
  | "expired"
  | "closed_source"
  | "unknown";

export type NormalizedExternalOpportunity = {
  naturalKey: string;
  externalId: string;
  title: string;
  shortDescription: string | null;
  issuingAuthority: string | null;
  officialUrl: string;
  sourcePageUrl: string;
  regions: string[];
  scopes: string[];
  openingDate: string | null;
  deadline: string | null;
  sourceUpdatedAt: string | null;
  temporalAccessState: TemporalAccessState;
  /** Canonical AR defaults — never auto-published. */
  origin: "external";
  editorialStatus: "in_review";
  publicationStatus: "unpublished";
  visibilityLevel: "private";
  substantialStatus: "announced" | "closed";
  openEnded: boolean;
  license: string;
  attribution: string;
  checksumSha256: string;
};

export type ExistingOpportunityFingerprint = {
  naturalKey: string;
  checksumSha256: string;
};

export type ParseOptions = {
  now?: Date;
  pilotMax?: number;
  existing?: Map<string, ExistingOpportunityFingerprint>;
  /** When true, skip pilot filters (tests only). */
  skipPilotFilter?: boolean;
};

function emptyCounts(): DryRunCounts {
  return {
    fetched: 0,
    valid: 0,
    rejected: 0,
    create: 0,
    update: 0,
    unchanged: 0,
    supersede: 0,
    review_required: 0,
    errors: 0,
  };
}

export function incentiviGovNaturalKey(nid: string): string {
  const id = nid.trim();
  if (!id) throw new Error("external_id required");
  return `${INCENTIVI_GOV_OPENDATA.sourceSystem}:${id}`;
}

function asArray(value: string | string[] | undefined | null): string[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value])
    .map((v) => String(v).trim())
    .filter(Boolean);
}

function stripHtml(input: string | undefined | null): string {
  return String(input ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTimestamp(raw: string | undefined | null): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const ms = Date.parse(String(raw));
  if (Number.isNaN(ms)) {
    throw new Error(`malformed date: ${raw}`);
  }
  return new Date(ms).toISOString();
}

export function assertIncentiviGovSchema(
  payload: IncentiviGovSolrResponse,
): void {
  if (payload.error) {
    throw new Error(
      `Incentivi.gov schema/API error: ${payload.error.msg ?? "unknown"}`,
    );
  }
  if (!payload.response || !Array.isArray(payload.response.docs)) {
    throw new Error(
      "Incentivi.gov schema drift: missing response.docs array",
    );
  }
}

export function resolveOfficialUrl(doc: IncentiviGovSolrDoc): string {
  const link = String(doc.zs_field_link ?? "").trim();
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }
  const path = String(doc.zs_url ?? "").trim();
  if (!path) {
    throw new Error("missing official url (zs_url / zs_field_link)");
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${INCENTIVI_GOV_OPENDATA.portalOrigin}${normalized}`;
}

export function deriveTemporalAccessState(input: {
  openingDate: string | null;
  deadline: string | null;
  now?: Date;
}): TemporalAccessState {
  const now = (input.now ?? new Date()).getTime();
  if (input.deadline) {
    const close = Date.parse(input.deadline);
    if (!Number.isNaN(close) && close < now) return "expired";
  }
  if (input.openingDate) {
    const open = Date.parse(input.openingDate);
    if (!Number.isNaN(open) && open > now) return "scheduled";
  }
  if (input.openingDate || input.deadline) return "open_or_ongoing";
  return "unknown";
}

function matchesPilot(doc: {
  title: string;
  scopes: string[];
  regions: string[];
}): boolean {
  const scopeHit =
    doc.scopes.some((s) =>
      INCENTIVI_GOV_OPENDATA.priorityScopePattern.test(s),
    ) || INCENTIVI_GOV_OPENDATA.priorityScopePattern.test(doc.title);
  if (!scopeHit) return false;
  if (doc.regions.length === 0) return true;
  return doc.regions.some((r) =>
    INCENTIVI_GOV_OPENDATA.geographyPattern.test(r),
  );
}

export function mapIncentiviGovDoc(
  doc: IncentiviGovSolrDoc,
  options: ParseOptions = {},
): NormalizedExternalOpportunity {
  for (const field of INCENTIVI_GOV_OPENDATA.requiredFields) {
    if (doc[field] == null || String(doc[field]).trim() === "") {
      throw new Error(`missing required field ${field}`);
    }
  }

  const externalId = String(doc.zs_nid).trim();
  const title = stripHtml(doc.zs_title);
  if (!title) throw new Error("blank title after normalize");

  const openingDate = parseTimestamp(doc.zs_field_open_date ?? null);
  const deadline = parseTimestamp(doc.zs_field_close_date ?? null);
  const temporal = deriveTemporalAccessState({
    openingDate,
    deadline,
    now: options.now,
  });

  const body = stripHtml(doc.zs_body);
  const shortDescription =
    body.length > 0 ? body.slice(0, 400) : null;

  const officialUrl = resolveOfficialUrl(doc);
  const sourcePageUrl = (() => {
    const path = String(doc.zs_url).trim();
    if (path.startsWith("http")) return path;
    return `${INCENTIVI_GOV_OPENDATA.portalOrigin}${path.startsWith("/") ? path : `/${path}`}`;
  })();

  const regions = asArray(doc.zm_field_regions_value);
  const scopes = asArray(doc.zm_field_scopes_value);
  const naturalKey = incentiviGovNaturalKey(externalId);

  const substantialStatus: "announced" | "closed" =
    temporal === "expired" ? "closed" : "announced";

  const normalized: NormalizedExternalOpportunity = {
    naturalKey,
    externalId,
    title,
    shortDescription,
    issuingAuthority: stripHtml(doc.zs_field_subject_grant) || null,
    officialUrl,
    sourcePageUrl,
    regions,
    scopes,
    openingDate,
    deadline,
    sourceUpdatedAt: parseTimestamp(doc.ds_last_update ?? null),
    temporalAccessState: temporal,
    origin: "external",
    editorialStatus: "in_review",
    publicationStatus: "unpublished",
    visibilityLevel: "private",
    substantialStatus,
    openEnded: !deadline,
    license: "IODL-2.0",
    attribution: INCENTIVI_GOV_OPENDATA.attribution,
    checksumSha256: "",
  };

  normalized.checksumSha256 = checksumSha256({
    naturalKey: normalized.naturalKey,
    title: normalized.title,
    shortDescription: normalized.shortDescription,
    issuingAuthority: normalized.issuingAuthority,
    officialUrl: normalized.officialUrl,
    openingDate: normalized.openingDate,
    deadline: normalized.deadline,
    sourceUpdatedAt: normalized.sourceUpdatedAt,
    regions: normalized.regions,
    scopes: normalized.scopes,
    substantialStatus: normalized.substantialStatus,
  });

  return normalized;
}

export function dryRunIncentiviGov(
  payload: IncentiviGovSolrResponse,
  options: ParseOptions = {},
): DryRunReport {
  const startedAt = new Date().toISOString();
  const retrievedAt = startedAt;
  const counts = emptyCounts();
  const records: DryRunRecord[] = [];
  const errors: string[] = [];
  const pilotMax = options.pilotMax ?? INCENTIVI_GOV_OPENDATA.pilotMax;
  const existing = options.existing ?? new Map();

  try {
    assertIncentiviGovSchema(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(message);
    counts.errors += 1;
    return {
      runId: `dry-incentivi-gov-${Date.now()}`,
      sourceId: INCENTIVI_GOV_OPENDATA.sourceId,
      datasetId: INCENTIVI_GOV_OPENDATA.datasetId,
      mode: "dry-run",
      startedAt,
      endedAt: new Date().toISOString(),
      retrievedAt,
      licenseClass: INCENTIVI_GOV_OPENDATA.licenseClass,
      licenseNote: INCENTIVI_GOV_OPENDATA.licenseNote,
      counts,
      records,
      errors,
      dbWrites: 0,
    };
  }

  const docs = payload.response?.docs ?? [];
  counts.fetched = docs.length;

  const seen = new Set<string>();
  let pilotAccepted = 0;

  for (const doc of docs) {
    try {
      const mapped = mapIncentiviGovDoc(doc, options);
      if (
        !options.skipPilotFilter &&
        !matchesPilot({
          title: mapped.title,
          scopes: mapped.scopes,
          regions: mapped.regions,
        })
      ) {
        counts.rejected += 1;
        records.push({
          action: "REJECT",
          reason: "outside_pilot_filter",
        });
        continue;
      }

      // Pilot prefers active/recent: exclude expired/closed from the first wave.
      if (
        !options.skipPilotFilter &&
        (mapped.temporalAccessState === "expired" ||
          mapped.substantialStatus === "closed")
      ) {
        counts.rejected += 1;
        records.push({
          action: "REJECT",
          reason: "pilot_excludes_expired",
        });
        continue;
      }

      if (seen.has(mapped.naturalKey)) {
        counts.rejected += 1;
        records.push({
          action: "REJECT",
          reason: `duplicate_in_batch:${mapped.naturalKey}`,
        });
        continue;
      }
      seen.add(mapped.naturalKey);

      if (!options.skipPilotFilter && pilotAccepted >= pilotMax) {
        counts.rejected += 1;
        records.push({
          action: "REJECT",
          reason: "pilot_max_exceeded",
        });
        continue;
      }

      // Never treat expired as publishable-open; still valid for review/history.
      counts.valid += 1;
      pilotAccepted += 1;
      counts.review_required += 1;

      const prev = existing.get(mapped.naturalKey);
      if (!prev) {
        counts.create += 1;
        records.push({
          action: "CREATE",
          reason: `in_review_unpublished:${mapped.naturalKey}`,
        });
      } else if (prev.checksumSha256 === mapped.checksumSha256) {
        counts.unchanged += 1;
        records.push({
          action: "UNCHANGED",
          reason: mapped.naturalKey,
        });
      } else {
        counts.update += 1;
        records.push({
          action: "UPDATE",
          reason: `canonical_update_in_review:${mapped.naturalKey}`,
        });
      }
    } catch (err) {
      // Per-document validation failures are rejects, not run-level fatal errors.
      counts.rejected += 1;
      const message = err instanceof Error ? err.message : String(err);
      records.push({ action: "REJECT", reason: message });
    }
  }

  return {
    runId: `dry-incentivi-gov-${Date.now()}`,
    sourceId: INCENTIVI_GOV_OPENDATA.sourceId,
    datasetId: INCENTIVI_GOV_OPENDATA.datasetId,
    mode: "dry-run",
    startedAt,
    endedAt: new Date().toISOString(),
    retrievedAt,
    licenseClass: INCENTIVI_GOV_OPENDATA.licenseClass,
    licenseNote: INCENTIVI_GOV_OPENDATA.licenseNote,
    counts,
    records,
    errors,
    dbWrites: 0,
  };
}

export function buildSolrSelectUrl(params: {
  rows?: number;
  start?: number;
  fl?: string[];
}): string {
  const rows = params.rows ?? 200;
  const start = params.start ?? 0;
  const fl = (
    params.fl ?? [
      "zs_nid",
      "zs_title",
      "zs_url",
      "zs_field_open_date",
      "zs_field_close_date",
      "zm_field_regions_value",
      "zm_field_scopes_value",
      "zs_field_subject_grant",
      "zs_field_link",
      "zs_body",
      "ds_last_update",
    ]
  ).join(",");
  const qs = new URLSearchParams({
    q: "*:*",
    rows: String(rows),
    start: String(start),
    wt: "json",
    fl,
  });
  return `${INCENTIVI_GOV_OPENDATA.portalOrigin}${INCENTIVI_GOV_OPENDATA.solrSelectPath}?${qs.toString()}`;
}

export async function fetchIncentiviGovOpenData(options?: {
  rows?: number;
  fetchImpl?: typeof fetch;
}): Promise<{
  url: string;
  retrievedAt: string;
  payload: IncentiviGovSolrResponse;
}> {
  const url = buildSolrSelectUrl({ rows: options?.rows ?? 200 });
  const fetchImpl = options?.fetchImpl ?? fetch;
  const res = await fetchImpl(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Incentivi.gov fetch failed: HTTP ${res.status}`);
  }
  const payload = (await res.json()) as IncentiviGovSolrResponse;
  assertIncentiviGovSchema(payload);
  return {
    url,
    retrievedAt: new Date().toISOString(),
    payload,
  };
}
