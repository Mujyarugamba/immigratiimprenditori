import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  eurostatLfsaEsganKey,
  yearBounds,
} from "@/lib/external-data/natural-key";
import type {
  DryRunCounts,
  DryRunRecord,
  DryRunReport,
  NormalizedObservation,
} from "@/lib/external-data/types";

export const EUROSTAT_LFSA_ESGAN = {
  sourceId: "eurostat-lfsa-esgan",
  datasetId: "lfsa_esgan",
  sourceExternalIdentifier: "eurostat:lfsa_esgan",
  indicatorCode: "OBS-EU-SELF-CIT",
  licenseClass: "REUSABLE_WITH_ATTRIBUTION" as const,
  licenseNote:
    "Eurostat free re-use with attribution; state modifications if any. Verified 2026-08-13.",
  licenseUrl:
    "https://ec.europa.eu/eurostat/web/main/about-us/policies/copyright",
  apiBase:
    "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfsa_esgan",
  /** Pilot filters — do not widen without contract change. */
  allow: {
    geo: ["IT"] as const,
    unit: ["THS_PER"] as const,
    wstatus: ["SELF"] as const,
    sex: ["T"] as const,
    age: ["Y15-64"] as const,
    citizen: [
      "NAT",
      "FOR",
      "EU27_2020_FOR",
      "NEU27_2020_FOR",
      "TOTAL",
    ] as const,
  },
  /** UI/definition labels — citizenship, not birthplace / camerale. */
  citizenLabelsIt: {
    NAT: "Cittadini del paese dichiarante",
    FOR: "Cittadini stranieri",
    EU27_2020_FOR: "Cittadini UE27 (2020), esteri",
    NEU27_2020_FOR: "Cittadini extra-UE27 (2020)",
    TOTAL: "Totale",
  } as Record<string, string>,
};

type JsonStatLike = {
  label?: string;
  source?: string;
  updated?: string;
  value?: Record<string, number | null | undefined>;
  id?: string[];
  size?: number[];
  dimension?: Record<
    string,
    {
      category?: {
        index?: Record<string, number>;
        label?: Record<string, string>;
      };
    }
  >;
};

export type ParseOptions = {
  minYear?: number;
  maxYear?: number;
  existingChecksums?: Map<string, string>;
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

function dimCodes(
  dataset: JsonStatLike,
  dim: string,
): { codes: string[]; labels: Record<string, string> } {
  const cat = dataset.dimension?.[dim]?.category;
  const index = cat?.index ?? {};
  const labels = cat?.label ?? {};
  const codes = Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);
  return { codes, labels };
}

function requiredDims(dataset: JsonStatLike): string[] {
  const ids = dataset.id ?? [];
  const missing = [
    "freq",
    "unit",
    "wstatus",
    "citizen",
    "sex",
    "age",
    "geo",
    "time",
  ].filter((d) => !ids.includes(d));
  if (missing.length) {
    throw new Error(
      `Eurostat schema drift: missing dimensions ${missing.join(", ")}`,
    );
  }
  return ids;
}

/** Expand JSON-stat dense index → observation cells. */
export function parseLfsaEsganDataset(
  dataset: JsonStatLike,
  options: ParseOptions = {},
): { observations: NormalizedObservation[]; rejected: DryRunRecord[] } {
  requiredDims(dataset);
  if (dataset.label && !/self-employed/i.test(dataset.label)) {
    throw new Error(
      `Eurostat schema drift: unexpected dataset label "${dataset.label}"`,
    );
  }

  const ids = dataset.id!;
  const sizes = dataset.size!;
  if (ids.length !== sizes.length) {
    throw new Error("Eurostat schema drift: id/size length mismatch");
  }

  const dims = Object.fromEntries(
    ids.map((id) => [id, dimCodes(dataset, id)]),
  ) as Record<string, { codes: string[]; labels: Record<string, string> }>;

  const minYear = options.minYear ?? 2019;
  const maxYear = options.maxYear ?? new Date().getUTCFullYear();
  const observations: NormalizedObservation[] = [];
  const rejected: DryRunRecord[] = [];
  const values = dataset.value ?? {};

  const strides: number[] = [];
  let stride = 1;
  for (let i = sizes.length - 1; i >= 0; i -= 1) {
    strides[i] = stride;
    stride *= sizes[i];
  }

  for (const [indexStr, raw] of Object.entries(values)) {
    const flat = Number(indexStr);
    if (!Number.isInteger(flat) || flat < 0) {
      rejected.push({ action: "REJECT", reason: `bad value index ${indexStr}` });
      continue;
    }
    if (raw == null || !Number.isFinite(raw)) {
      rejected.push({
        action: "REJECT",
        reason: `non-finite value at ${indexStr}`,
      });
      continue;
    }

    const coords: Record<string, string> = {};
    let rem = flat;
    let coordsOk = true;
    for (let i = 0; i < ids.length; i += 1) {
      const dim = ids[i];
      const idx = Math.floor(rem / strides[i]);
      rem = rem % strides[i];
      const code = dims[dim].codes[idx];
      if (!code) {
        rejected.push({
          action: "REJECT",
          reason: `missing code for ${dim} at ${indexStr}`,
        });
        coordsOk = false;
        break;
      }
      coords[dim] = code;
    }
    if (!coordsOk) continue;

    const allow = EUROSTAT_LFSA_ESGAN.allow;
    if (
      !allow.geo.includes(coords.geo as (typeof allow.geo)[number]) ||
      !allow.unit.includes(coords.unit as (typeof allow.unit)[number]) ||
      !allow.wstatus.includes(coords.wstatus as (typeof allow.wstatus)[number]) ||
      !allow.sex.includes(coords.sex as (typeof allow.sex)[number]) ||
      !allow.age.includes(coords.age as (typeof allow.age)[number]) ||
      !allow.citizen.includes(coords.citizen as (typeof allow.citizen)[number])
    ) {
      rejected.push({
        action: "REJECT",
        reason: `filtered dims ${JSON.stringify(coords)}`,
      });
      continue;
    }

    const year = Number(coords.time);
    if (!Number.isInteger(year) || year < minYear || year > maxYear) {
      rejected.push({
        action: "REJECT",
        reason: `year out of range ${coords.time}`,
      });
      continue;
    }

    const { start, end } = yearBounds(year);
    const naturalKey = eurostatLfsaEsganKey({
      unit: coords.unit,
      wstatus: coords.wstatus,
      citizen: coords.citizen,
      sex: coords.sex,
      age: coords.age,
      geo: coords.geo,
      year,
    });

    const payload = {
      indicatorCode: EUROSTAT_LFSA_ESGAN.indicatorCode,
      naturalKey,
      numericValue: raw,
      periodStart: start,
      periodEnd: end,
      territoryLevel: "italy" as const,
      territoryCode: "IT",
      territoryLabel: "Italia",
      citizenshipCode: coords.citizen,
      citizenshipLabel:
        EUROSTAT_LFSA_ESGAN.citizenLabelsIt[coords.citizen] ??
        dims.citizen.labels[coords.citizen] ??
        coords.citizen,
      unitNote: "THS_PER — thousands of persons (Eurostat)",
      qualityCode: "official" as const,
      sourceExternalIdentifier: EUROSTAT_LFSA_ESGAN.sourceExternalIdentifier,
      sourceUpdated: dataset.updated,
      methodologyNote:
        "LFS self-employed by citizenship (Eurostat lfsa_esgan). Citizenship ≠ country of birth ≠ camerale foreign-controlled enterprise.",
    };

    observations.push({
      ...payload,
      checksumSha256: checksumSha256(payload),
    });
  }

  return { observations, rejected };
}

export function dryRunLfsaEsgan(
  dataset: JsonStatLike,
  options: ParseOptions = {},
): DryRunReport {
  const startedAt = new Date().toISOString();
  const counts = emptyCounts();
  const errors: string[] = [];
  const records: DryRunRecord[] = [];

  try {
    const { observations, rejected } = parseLfsaEsganDataset(dataset, options);
    counts.fetched = Object.keys(dataset.value ?? {}).length;
    counts.rejected = rejected.length;
    records.push(...rejected);

    const existing = options.existingChecksums ?? new Map();
    for (const obs of observations) {
      counts.valid += 1;
      const prev = existing.get(obs.naturalKey);
      let action: DryRunRecord["action"] = "CREATE";
      if (prev === obs.checksumSha256) action = "UNCHANGED";
      else if (prev) action = "UPDATE";

      if (action === "CREATE") counts.create += 1;
      if (action === "UPDATE") counts.update += 1;
      if (action === "UNCHANGED") counts.unchanged += 1;

      records.push({ action, observation: obs });
    }
  } catch (err) {
    counts.errors += 1;
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const endedAt = new Date().toISOString();
  return {
    runId: `dry-eurostat-lfsa_esgan-${startedAt}`,
    sourceId: EUROSTAT_LFSA_ESGAN.sourceId,
    datasetId: EUROSTAT_LFSA_ESGAN.datasetId,
    mode: "dry-run",
    startedAt,
    endedAt,
    retrievedAt: startedAt,
    licenseClass: EUROSTAT_LFSA_ESGAN.licenseClass,
    licenseNote: EUROSTAT_LFSA_ESGAN.licenseNote,
    counts,
    records,
    errors,
    dbWrites: 0,
  };
}

export function buildLfsaEsganUrl(params: {
  years?: number[];
  citizens?: string[];
}): string {
  const years = params.years ?? [2021, 2022, 2023];
  const citizens = params.citizens ?? ["NAT", "FOR"];
  const q = new URLSearchParams({
    format: "JSON",
    lang: "en",
    geo: "IT",
    freq: "A",
    wstatus: "SELF",
    unit: "THS_PER",
    sex: "T",
    age: "Y15-64",
  });
  for (const y of years) q.append("time", String(y));
  for (const c of citizens) q.append("citizen", c);
  return `${EUROSTAT_LFSA_ESGAN.apiBase}?${q.toString()}`;
}
