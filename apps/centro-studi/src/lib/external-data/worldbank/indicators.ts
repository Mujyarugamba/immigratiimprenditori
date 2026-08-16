/**
 * D1-C.1 — World Bank Indicators → Mercati M1 support_resources (dry-run).
 * Stages: FETCH → VALIDATE → NORMALIZE → MAP → DIFF. WRITE disabled here.
 */

import { checksumSha256 } from "@/lib/external-data/checksum";
import { worldbankIndicatorKey, yearBounds } from "@/lib/external-data/natural-key";
import type {
  DryRunCounts,
  DryRunRecord,
  DryRunReport,
  LicenseClass,
} from "@/lib/external-data/types";

export const WORLDBANK_INDICATORS = {
  sourceId: "worldbank-indicators",
  datasetId: "world-development-indicators",
  sourceSystem: "worldbank",
  apiBase: "https://api.worldbank.org/v2",
  dataPageBase: "https://data.worldbank.org/indicator",
  licenseClass: "REUSABLE_WITH_ATTRIBUTION" as LicenseClass,
  license: "CC BY 4.0",
  licenseUrl: "https://datacatalog.worldbank.org/public-licenses",
  licenseNote:
    "World Bank Indicators — CC BY 4.0; attribution required. Verified 2026-08-13.",
  attribution: "World Bank",
  autoPublish: false as const,
  /** D1-C pilot hard caps. */
  pilotMaxCountries: 3,
  pilotMaxIndicators: 8,
  /** Default sample from D1-C determination (GO default IT+DE+FR). */
  pilotCountries: ["IT", "DE", "FR"] as const,
  /** Allowlist ≤8 from D1-C §8.1 (5 selected). */
  pilotIndicatorCodes: [
    "SP.POP.TOTL",
    "NY.GDP.MKTP.CD",
    "NY.GDP.MKTP.KD.ZG",
    "NY.GDP.PCAP.CD",
    "NE.TRD.GNFS.ZS",
  ] as const,
  /**
   * Time strategy (D1-C period unset beyond “latest available”):
   * fetch 2022:2024 to verify history/update semantics; map one resource
   * per country×indicator using the latest non-null observation year.
   */
  dateStart: 2022,
  dateEnd: 2024,
  resourceKind: "public_agency" as const,
  ice: {
    policy: "LINK_ONLY" as const,
    homeUrl: "https://www.ice.it/",
    note: "ICE is complementary link-only; no scrape/import in D1-C.1.",
  },
};

export type WbIndicatorCode =
  (typeof WORLDBANK_INDICATORS.pilotIndicatorCodes)[number];

export type WbIndicatorMeta = {
  code: WbIndicatorCode;
  originalLabel: string;
  platformLabel: string;
  definition: string;
  unit: string;
  periodicity: "annual";
  sourceOrganization: string;
  methodologyNotes: string;
  valueKind: "absolute" | "percent_rate";
};

/** Per-indicator contract — do not merge distinct semantics. */
export const WB_INDICATOR_CATALOG: Record<WbIndicatorCode, WbIndicatorMeta> = {
  "SP.POP.TOTL": {
    code: "SP.POP.TOTL",
    originalLabel: "Population, total",
    platformLabel: "Popolazione totale",
    definition:
      "Total population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
    unit: "persons",
    periodicity: "annual",
    sourceOrganization: "World Bank / UN Population Division (via WDI)",
    methodologyNotes:
      "Stock count of persons. Not a flow. Do not treat as labour force.",
    valueKind: "absolute",
  },
  "NY.GDP.MKTP.CD": {
    code: "NY.GDP.MKTP.CD",
    originalLabel: "GDP (current US$)",
    platformLabel: "PIL (US$ correnti)",
    definition:
      "GDP at purchaser's prices in current U.S. dollars. Not constant, not PPP.",
    unit: "current US$",
    periodicity: "annual",
    sourceOrganization: "World Bank national accounts / OECD",
    methodologyNotes:
      "CURRENT USD only. Do not convert to constant USD or PPP silently.",
    valueKind: "absolute",
  },
  "NY.GDP.MKTP.KD.ZG": {
    code: "NY.GDP.MKTP.KD.ZG",
    originalLabel: "GDP growth (annual %)",
    platformLabel: "Crescita PIL (variazione % annua)",
    definition:
      "Annual percentage growth rate of GDP at market prices based on constant local currency.",
    unit: "percent (annual growth)",
    periodicity: "annual",
    sourceOrganization: "World Bank national accounts / OECD",
    methodologyNotes:
      "Percent growth rate — not percentage points of a level, not a fraction (0.02).",
    valueKind: "percent_rate",
  },
  "NY.GDP.PCAP.CD": {
    code: "NY.GDP.PCAP.CD",
    originalLabel: "GDP per capita (current US$)",
    platformLabel: "PIL pro capite (US$ correnti)",
    definition:
      "GDP divided by midyear population, current U.S. dollars. Not PPP.",
    unit: "current US$ per person",
    periodicity: "annual",
    sourceOrganization: "World Bank national accounts",
    methodologyNotes: "CURRENT USD per capita. Distinct from PPP per capita series.",
    valueKind: "absolute",
  },
  "NE.TRD.GNFS.ZS": {
    code: "NE.TRD.GNFS.ZS",
    originalLabel: "Trade (% of GDP)",
    platformLabel: "Commercio (% del PIL)",
    definition:
      "Sum of exports and imports of goods and services as a share of GDP.",
    unit: "percent of GDP",
    periodicity: "annual",
    sourceOrganization: "World Bank / national accounts / OECD",
    methodologyNotes:
      "Percent of GDP (0–100+ scale as published). Do not divide by 100 into a fraction.",
    valueKind: "percent_rate",
  },
};

export type WbApiObservation = {
  indicator?: { id?: string; value?: string };
  country?: { id?: string; value?: string };
  countryiso3code?: string;
  date?: string;
  value?: number | null;
  unit?: string;
  obs_status?: string;
  decimal?: number;
};

export type WbApiPageMeta = {
  page?: number;
  pages?: number;
  per_page?: number | string;
  total?: number;
  sourceid?: string;
  lastupdated?: string;
};

export type WbApiPayload = [WbApiPageMeta, WbApiObservation[] | null];

export type CountryNorm = {
  iso2: string;
  iso3: string | null;
  labelEn: string | null;
  canonicalRef: string;
};

export type NormalizedWbObservation = {
  naturalKey: string;
  indicatorCode: WbIndicatorCode;
  originalLabel: string;
  platformLabel: string;
  definition: string;
  countryIso2: string;
  countryIso3: string | null;
  countryLabel: string | null;
  countryRef: string;
  year: number;
  periodStart: string;
  periodEnd: string;
  /** Explicit null when WB published null — never coerced to 0. */
  numericValue: number | null;
  valueStatus: "numeric" | "null_published" | "missing_unsupported";
  unit: string;
  decimal: number | null;
  periodicity: "annual";
  sourceOrganization: string;
  methodologyNotes: string;
  websiteUrl: string;
  apiEndpoint: string;
  sourceLastUpdated: string | null;
  license: string;
  attribution: string;
  retrievedAt: string;
  /** Future apply editorial axes (Mercati support_resources). */
  resourceKind: "public_agency";
  name: string;
  summary: string;
  contactNote: string;
  territorialScopeNote: string;
  substantialStatus: "signaled";
  verificationStatus: "in_review";
  visibilityStatus: "editorial";
  autoPublish: false;
  marketCodeHint: string;
  checksumSha256: string;
};

export type ExistingWbFingerprint = {
  naturalKey: string;
  checksumSha256: string;
};

export type ParseOptions = {
  retrievedAt?: string;
  existing?: Map<string, ExistingWbFingerprint>;
  /** ISO2 → market code for binding diagnostics (no DB write). */
  marketCatalog?: Map<string, string>;
  countries?: readonly string[];
  indicators?: readonly WbIndicatorCode[];
  /** When true, keep all years in range; default keeps latest non-null only. */
  keepFullSeries?: boolean;
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

export function assertPilotBounds(input: {
  countries: readonly string[];
  indicators: readonly string[];
}): void {
  if (input.countries.length > WORLDBANK_INDICATORS.pilotMaxCountries) {
    throw new Error(
      `pilot country cap exceeded: ${input.countries.length} > ${WORLDBANK_INDICATORS.pilotMaxCountries}`,
    );
  }
  if (input.indicators.length > WORLDBANK_INDICATORS.pilotMaxIndicators) {
    throw new Error(
      `pilot indicator cap exceeded: ${input.indicators.length} > ${WORLDBANK_INDICATORS.pilotMaxIndicators}`,
    );
  }
  if (input.countries.length === 0 || input.indicators.length === 0) {
    throw new Error("pilot requires ≥1 country and ≥1 indicator");
  }
}

/** Canonical country normalization — ISO2 is the platform country_ref convention. */
export function normalizeCountryCode(input: {
  iso2?: string | null;
  iso3?: string | null;
  label?: string | null;
}): CountryNorm {
  const iso2 = String(input.iso2 ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso2)) {
    throw new Error(`unsupported country code (need ISO2): ${input.iso2}`);
  }
  const iso3 = input.iso3
    ? String(input.iso3).trim().toUpperCase()
    : null;
  if (iso3 && !/^[A-Z]{3}$/.test(iso3)) {
    throw new Error(`malformed ISO3: ${input.iso3}`);
  }
  return {
    iso2,
    iso3,
    labelEn: input.label ? String(input.label).trim() : null,
    canonicalRef: iso2,
  };
}

export function buildWorldBankIndicatorUrl(params: {
  countries: readonly string[];
  indicator: string;
  dateStart?: number;
  dateEnd?: number;
  perPage?: number;
}): string {
  const countries = params.countries.map((c) => c.trim().toUpperCase());
  for (const c of countries) {
    if (!/^[A-Z]{2}$/.test(c)) throw new Error(`bad ISO2 in URL: ${c}`);
  }
  const start = params.dateStart ?? WORLDBANK_INDICATORS.dateStart;
  const end = params.dateEnd ?? WORLDBANK_INDICATORS.dateEnd;
  const q = new URLSearchParams({
    format: "json",
    per_page: String(params.perPage ?? 200),
    date: `${start}:${end}`,
  });
  return `${WORLDBANK_INDICATORS.apiBase}/country/${countries.join(";")}/indicator/${params.indicator}?${q.toString()}`;
}

export function assertWorldBankPayload(payload: unknown): asserts payload is WbApiPayload {
  if (!Array.isArray(payload) || payload.length < 2) {
    throw new Error("World Bank schema drift: expected [meta, data[]] array");
  }
  const meta = payload[0];
  if (!meta || typeof meta !== "object") {
    throw new Error("World Bank schema drift: missing page meta object");
  }
  const data = payload[1];
  if (data != null && !Array.isArray(data)) {
    throw new Error("World Bank schema drift: data must be array or null");
  }
}

export function classifyValue(
  raw: unknown,
): {
  numericValue: number | null;
  valueStatus: NormalizedWbObservation["valueStatus"];
} {
  if (raw === null) {
    return { numericValue: null, valueStatus: "null_published" };
  }
  if (raw === undefined) {
    return { numericValue: null, valueStatus: "missing_unsupported" };
  }
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    throw new Error(`non-numeric World Bank value: ${String(raw)}`);
  }
  // Explicit guard: never coerce null→0; 0 is only valid if WB sent 0.
  return { numericValue: raw, valueStatus: "numeric" };
}

function formatSummary(obs: {
  platformLabel: string;
  year: number;
  numericValue: number | null;
  unit: string;
  valueStatus: string;
}): string {
  if (obs.numericValue == null) {
    return `${obs.platformLabel} (${obs.year}): valore non disponibile nella fonte (status=${obs.valueStatus}). Unità: ${obs.unit}.`;
  }
  return `${obs.platformLabel} (${obs.year}): ${obs.numericValue} ${obs.unit}.`;
}

function buildContactNote(input: {
  naturalKey: string;
  indicatorCode: string;
  apiEndpoint: string;
  retrievedAt: string;
  sourceLastUpdated: string | null;
  license: string;
  attribution: string;
  checksumSha256: string;
}): string {
  return [
    `natural_key=${input.naturalKey}`,
    `source=${WORLDBANK_INDICATORS.sourceId}`,
    `dataset=${WORLDBANK_INDICATORS.datasetId}`,
    `indicator=${input.indicatorCode}`,
    `api=${input.apiEndpoint}`,
    `retrieved_at=${input.retrievedAt}`,
    input.sourceLastUpdated
      ? `source_lastupdated=${input.sourceLastUpdated}`
      : "source_lastupdated=unavailable",
    `license=${input.license}`,
    `attribution=${input.attribution}`,
    `checksum=${input.checksumSha256}`,
  ].join(" | ");
}

export function mapWorldBankObservation(
  row: WbApiObservation,
  options: {
    retrievedAt: string;
    apiEndpoint: string;
    sourceLastUpdated: string | null;
    marketCatalog?: Map<string, string>;
  },
): { observation?: NormalizedWbObservation; reject?: DryRunRecord } {
  const indicatorId = String(row.indicator?.id ?? "").trim();
  if (
    !(WORLDBANK_INDICATORS.pilotIndicatorCodes as readonly string[]).includes(
      indicatorId,
    )
  ) {
    return {
      reject: {
        action: "REJECT",
        reason: `indicator not in pilot allowlist: ${indicatorId || "(missing)"}`,
      },
    };
  }
  const meta = WB_INDICATOR_CATALOG[indicatorId as WbIndicatorCode];

  let country: CountryNorm;
  try {
    country = normalizeCountryCode({
      iso2: row.country?.id,
      iso3: row.countryiso3code,
      label: row.country?.value,
    });
  } catch (err) {
    return {
      reject: {
        action: "REJECT",
        reason: err instanceof Error ? err.message : String(err),
      },
    };
  }

  const year = Number(row.date);
  if (!Number.isInteger(year)) {
    return {
      reject: { action: "REJECT", reason: `bad year/period: ${row.date}` },
    };
  }
  if (
    year < WORLDBANK_INDICATORS.dateStart ||
    year > WORLDBANK_INDICATORS.dateEnd
  ) {
    return {
      reject: { action: "REJECT", reason: `year out of pilot range: ${year}` },
    };
  }

  let classified: ReturnType<typeof classifyValue>;
  try {
    classified = classifyValue(row.value);
  } catch (err) {
    return {
      reject: {
        action: "REJECT",
        reason: err instanceof Error ? err.message : String(err),
      },
    };
  }

  // API may omit unit; catalog unit is authoritative for semantics (no silent conversion).
  const apiUnit = String(row.unit ?? "").trim();
  if (apiUnit && apiUnit !== meta.unit) {
    // Observable mismatch — reject rather than silent remap.
    return {
      reject: {
        action: "REJECT",
        reason: `unit mismatch api="${apiUnit}" catalog="${meta.unit}" for ${indicatorId}`,
      },
    };
  }

  const { start, end } = yearBounds(year);
  const naturalKey = worldbankIndicatorKey({
    indicatorCode: meta.code,
    countryIso2: country.iso2,
    year,
  });
  const websiteUrl = `${WORLDBANK_INDICATORS.dataPageBase}/${meta.code}`;
  const name = `World Bank — ${meta.originalLabel} (${year})`;
  const summary = formatSummary({
    platformLabel: meta.platformLabel,
    year,
    numericValue: classified.numericValue,
    unit: meta.unit,
    valueStatus: classified.valueStatus,
  });
  const marketCodeHint =
    options.marketCatalog?.get(country.canonicalRef) ?? `market:${country.iso2}`;

  const payloadCore = {
    indicatorCode: meta.code,
    originalLabel: meta.originalLabel,
    platformLabel: meta.platformLabel,
    definition: meta.definition,
    countryIso2: country.iso2,
    countryIso3: country.iso3,
    countryLabel: country.labelEn,
    countryRef: country.canonicalRef,
    year,
    periodStart: start,
    periodEnd: end,
    numericValue: classified.numericValue,
    valueStatus: classified.valueStatus,
    unit: meta.unit,
    decimal: typeof row.decimal === "number" ? row.decimal : null,
    periodicity: meta.periodicity,
    sourceOrganization: meta.sourceOrganization,
    methodologyNotes: meta.methodologyNotes,
    websiteUrl,
    apiEndpoint: options.apiEndpoint,
    sourceLastUpdated: options.sourceLastUpdated,
    license: WORLDBANK_INDICATORS.license,
    attribution: WORLDBANK_INDICATORS.attribution,
    resourceKind: WORLDBANK_INDICATORS.resourceKind,
    name,
    summary,
    territorialScopeNote: `country_ref=${country.canonicalRef}; iso3=${country.iso3 ?? "n/a"}`,
    substantialStatus: "signaled" as const,
    verificationStatus: "in_review" as const,
    visibilityStatus: "editorial" as const,
    autoPublish: false as const,
    marketCodeHint,
  };

  // retrievedAt is provenance-only — excluded from checksum for idempotency.
  const checksum = checksumSha256(payloadCore);
  const contactNote = buildContactNote({
    naturalKey,
    indicatorCode: meta.code,
    apiEndpoint: options.apiEndpoint,
    retrievedAt: options.retrievedAt,
    sourceLastUpdated: options.sourceLastUpdated,
    license: WORLDBANK_INDICATORS.license,
    attribution: WORLDBANK_INDICATORS.attribution,
    checksumSha256: checksum,
  });

  if (
    !contactNote.includes("retrieved_at=") ||
    !contactNote.includes("license=") ||
    !contactNote.includes(`indicator=${meta.code}`)
  ) {
    return {
      reject: {
        action: "REJECT",
        reason: "incomplete provenance contact_note",
      },
    };
  }

  // Null-published latest values are kept as REVIEW_REQUIRED (not invent/interpolate).
  if (classified.valueStatus !== "numeric") {
    return {
      reject: {
        action: "REVIEW_REQUIRED",
        reason: `null/missing value for ${naturalKey} (status=${classified.valueStatus}); never coerced to 0`,
        observation: undefined,
      },
    };
  }

  const observation: NormalizedWbObservation = {
    ...payloadCore,
    retrievedAt: options.retrievedAt,
    naturalKey,
    contactNote,
    checksumSha256: checksum,
  };

  return { observation };
}

/**
 * Select latest non-null observation per country×indicator (pilot resource grain).
 * Full series retained only when keepFullSeries=true (tests / diagnostics).
 */
export function selectPilotObservations(
  observations: NormalizedWbObservation[],
  keepFullSeries = false,
): NormalizedWbObservation[] {
  if (keepFullSeries) return observations;
  const best = new Map<string, NormalizedWbObservation>();
  for (const obs of observations) {
    if (obs.valueStatus !== "numeric" || obs.numericValue == null) continue;
    const k = `${obs.indicatorCode}:${obs.countryIso2}`;
    const prev = best.get(k);
    if (!prev || obs.year > prev.year) best.set(k, obs);
  }
  return [...best.values()].sort((a, b) =>
    a.naturalKey.localeCompare(b.naturalKey),
  );
}

export function parseWorldBankPayload(
  payload: unknown,
  options: ParseOptions & { apiEndpoint: string },
): {
  observations: NormalizedWbObservation[];
  rejected: DryRunRecord[];
  sourceLastUpdated: string | null;
  fetched: number;
} {
  assertWorldBankPayload(payload);
  const meta = payload[0];
  const rows = payload[1] ?? [];
  const retrievedAt = options.retrievedAt ?? new Date().toISOString();
  const sourceLastUpdated = meta.lastupdated
    ? String(meta.lastupdated)
    : null;

  const rejected: DryRunRecord[] = [];
  const mapped: NormalizedWbObservation[] = [];
  const allowCountries = new Set(
    (options.countries ?? WORLDBANK_INDICATORS.pilotCountries).map((c) =>
      c.toUpperCase(),
    ),
  );
  const allowIndicators = new Set(
    options.indicators ?? WORLDBANK_INDICATORS.pilotIndicatorCodes,
  );

  for (const row of rows) {
    const iso2 = String(row.country?.id ?? "")
      .trim()
      .toUpperCase();
    const ind = String(row.indicator?.id ?? "").trim();
    if (iso2 && !allowCountries.has(iso2)) {
      rejected.push({
        action: "REJECT",
        reason: `country filtered: ${iso2}`,
      });
      continue;
    }
    if (ind && !allowIndicators.has(ind as WbIndicatorCode)) {
      rejected.push({
        action: "REJECT",
        reason: `indicator filtered: ${ind}`,
      });
      continue;
    }

    const result = mapWorldBankObservation(row, {
      retrievedAt,
      apiEndpoint: options.apiEndpoint,
      sourceLastUpdated,
      marketCatalog: options.marketCatalog,
    });
    if (result.reject) {
      rejected.push(result.reject);
      continue;
    }
    if (result.observation) mapped.push(result.observation);
  }

  const observations = selectPilotObservations(
    mapped,
    options.keepFullSeries === true,
  );

  return {
    observations,
    rejected,
    sourceLastUpdated,
    fetched: rows.length,
  };
}

export function dryRunWorldBank(
  payloads: Array<{ payload: unknown; apiEndpoint: string }>,
  options: ParseOptions = {},
): DryRunReport & {
  selected: NormalizedWbObservation[];
  icePolicy: typeof WORLDBANK_INDICATORS.ice;
} {
  const startedAt = new Date().toISOString();
  const counts = emptyCounts();
  const errors: string[] = [];
  const records: DryRunRecord[] = [];
  const selected: NormalizedWbObservation[] = [];
  const existing = options.existing ?? new Map();

  try {
    const countries = options.countries ?? WORLDBANK_INDICATORS.pilotCountries;
    const indicators =
      options.indicators ?? WORLDBANK_INDICATORS.pilotIndicatorCodes;
    assertPilotBounds({ countries, indicators });

    const allMapped: NormalizedWbObservation[] = [];
    for (const item of payloads) {
      const parsed = parseWorldBankPayload(item.payload, {
        ...options,
        apiEndpoint: item.apiEndpoint,
        countries,
        indicators,
        keepFullSeries: true,
      });
      counts.fetched += parsed.fetched;
      counts.rejected += parsed.rejected.length;
      records.push(...parsed.rejected);
      allMapped.push(...parsed.observations);
    }

    const pilotRows = selectPilotObservations(
      allMapped,
      options.keepFullSeries === true,
    );

    // Deduplicate by natural key (idempotent mapping).
    const byKey = new Map<string, NormalizedWbObservation>();
    for (const obs of pilotRows) {
      const prev = byKey.get(obs.naturalKey);
      if (prev && prev.checksumSha256 !== obs.checksumSha256) {
        counts.errors += 1;
        errors.push(`duplicate natural key conflict: ${obs.naturalKey}`);
        continue;
      }
      byKey.set(obs.naturalKey, obs);
    }

    for (const obs of byKey.values()) {
      counts.valid += 1;
      const prev = existing.get(obs.naturalKey);
      let action: DryRunRecord["action"] = "CREATE";
      if (prev?.checksumSha256 === obs.checksumSha256) action = "UNCHANGED";
      else if (prev) action = "UPDATE";

      if (action === "CREATE") counts.create += 1;
      if (action === "UPDATE") counts.update += 1;
      if (action === "UNCHANGED") counts.unchanged += 1;
      // Future apply state is always review-only.
      counts.review_required += 1;

      selected.push(obs);
      records.push({ action, observation: obs as never });
    }
  } catch (err) {
    counts.errors += 1;
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const endedAt = new Date().toISOString();
  return {
    runId: `dry-worldbank-indicators-${startedAt}`,
    sourceId: WORLDBANK_INDICATORS.sourceId,
    datasetId: WORLDBANK_INDICATORS.datasetId,
    mode: "dry-run",
    startedAt,
    endedAt,
    retrievedAt: options.retrievedAt ?? startedAt,
    licenseClass: WORLDBANK_INDICATORS.licenseClass,
    licenseNote: WORLDBANK_INDICATORS.licenseNote,
    counts,
    records,
    errors,
    dbWrites: 0,
    selected,
    icePolicy: WORLDBANK_INDICATORS.ice,
  };
}

export async function fetchWorldBankIndicator(params: {
  countries: readonly string[];
  indicator: string;
  dateStart?: number;
  dateEnd?: number;
  fetchImpl?: typeof fetch;
}): Promise<{ payload: WbApiPayload; apiEndpoint: string; retrievedAt: string }> {
  const apiEndpoint = buildWorldBankIndicatorUrl(params);
  const fetchImpl = params.fetchImpl ?? fetch;
  const res = await fetchImpl(apiEndpoint, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`World Bank API HTTP ${res.status} for ${apiEndpoint}`);
  }
  const payload = (await res.json()) as unknown;
  assertWorldBankPayload(payload);
  return {
    payload,
    apiEndpoint,
    retrievedAt: new Date().toISOString(),
  };
}

export async function fetchWorldBankPilot(options?: {
  countries?: readonly string[];
  indicators?: readonly WbIndicatorCode[];
  fetchImpl?: typeof fetch;
}): Promise<{
  payloads: Array<{ payload: WbApiPayload; apiEndpoint: string }>;
  retrievedAt: string;
  countries: readonly string[];
  indicators: readonly WbIndicatorCode[];
}> {
  const countries = options?.countries ?? WORLDBANK_INDICATORS.pilotCountries;
  const indicators =
    options?.indicators ?? WORLDBANK_INDICATORS.pilotIndicatorCodes;
  assertPilotBounds({ countries, indicators });

  const payloads: Array<{ payload: WbApiPayload; apiEndpoint: string }> = [];
  let retrievedAt = new Date().toISOString();
  for (const indicator of indicators) {
    const result = await fetchWorldBankIndicator({
      countries,
      indicator,
      fetchImpl: options?.fetchImpl,
    });
    payloads.push({
      payload: result.payload,
      apiEndpoint: result.apiEndpoint,
    });
    retrievedAt = result.retrievedAt;
  }
  return { payloads, retrievedAt, countries, indicators };
}

/** In-memory revision simulation — no DB. */
export function simulateRevision(
  base: NormalizedWbObservation,
  newValue: number,
): NormalizedWbObservation {
  const numericValue = newValue;
  const summary = formatSummary({
    platformLabel: base.platformLabel,
    year: base.year,
    numericValue,
    unit: base.unit,
    valueStatus: "numeric",
  });
  const payloadCore = {
    indicatorCode: base.indicatorCode,
    originalLabel: base.originalLabel,
    platformLabel: base.platformLabel,
    definition: base.definition,
    countryIso2: base.countryIso2,
    countryIso3: base.countryIso3,
    countryLabel: base.countryLabel,
    countryRef: base.countryRef,
    year: base.year,
    periodStart: base.periodStart,
    periodEnd: base.periodEnd,
    numericValue,
    valueStatus: "numeric" as const,
    unit: base.unit,
    decimal: base.decimal,
    periodicity: base.periodicity,
    sourceOrganization: base.sourceOrganization,
    methodologyNotes: base.methodologyNotes,
    websiteUrl: base.websiteUrl,
    apiEndpoint: base.apiEndpoint,
    sourceLastUpdated: base.sourceLastUpdated,
    license: base.license,
    attribution: base.attribution,
    resourceKind: base.resourceKind,
    name: base.name,
    summary,
    territorialScopeNote: base.territorialScopeNote,
    substantialStatus: base.substantialStatus,
    verificationStatus: base.verificationStatus,
    visibilityStatus: base.visibilityStatus,
    autoPublish: false as const,
    marketCodeHint: base.marketCodeHint,
  };
  const nextChecksum = checksumSha256(payloadCore);
  return {
    ...payloadCore,
    retrievedAt: base.retrievedAt,
    naturalKey: base.naturalKey,
    contactNote: buildContactNote({
      naturalKey: base.naturalKey,
      indicatorCode: base.indicatorCode,
      apiEndpoint: base.apiEndpoint,
      retrievedAt: base.retrievedAt,
      sourceLastUpdated: base.sourceLastUpdated,
      license: base.license,
      attribution: base.attribution,
      checksumSha256: nextChecksum,
    }),
    checksumSha256: nextChecksum,
  };
}
