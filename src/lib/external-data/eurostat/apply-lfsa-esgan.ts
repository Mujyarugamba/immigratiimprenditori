import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  dryRunLfsaEsgan,
  EUROSTAT_LFSA_ESGAN,
  parseLfsaEsganDataset,
  buildLfsaEsganUrl,
} from "@/lib/external-data/eurostat/lfsa-esgan";
import type { DryRunReport, NormalizedObservation } from "@/lib/external-data/types";

const INDICATOR = {
  code: "OBS-EU-SELF-CIT",
  slug: "lavoro-autonomo-per-cittadinanza",
  title: "Lavoro autonomo per cittadinanza",
  description:
    "Persone in lavoro autonomo in Italia secondo la cittadinanza (indagine sulle forze di lavoro Eurostat). Valori in migliaia di persone (THS_PER).",
  purpose_text:
    "Fornire un riferimento ufficiale sul lavoro autonomo per cittadinanza, distinto dalle imprese a controllo di persone nate all’estero (definizione camerale) e dal concetto di imprenditore immigrato.",
  methodology_summary:
    "Fonte: Eurostat dataset lfsa_esgan (Self-employed persons by citizenship). Filtri pilot: geo=IT, wstatus=SELF, unit=THS_PER (migliaia di persone), sex=T, age=Y15-64. La dimensione citizen è cittadinanza statistica, non luogo di nascita e non impresa del Registro Imprese. Unità schema prodotto: count/units con nota THS_PER.",
  value_nature: "count",
  unit_code: "units",
  periodicity: "annual",
};

const SOURCE = {
  name: "Eurostat — Self-employed persons by citizenship",
  producer_name: "Eurostat",
  publication_title: "lfsa_esgan — Self-employed persons by citizenship",
  url: "https://ec.europa.eu/eurostat/databrowser/view/lfsa_esgan/default/table",
  external_identifier: EUROSTAT_LFSA_ESGAN.sourceExternalIdentifier,
  license_note: EUROSTAT_LFSA_ESGAN.licenseNote,
  methodology_note:
    "LFS self-employed by citizenship. Attribution to Eurostat required. Free re-use with acknowledgement. Citizenship ≠ country of birth ≠ camerale foreign-controlled enterprise.",
};

export const UNIONCAMERE_BLOCKED = [
  "OBS-UC-STR-STOCK — BLOCKED/SOURCE INPUT REQUIRED (no Futurae curated file / CCIAA allowlist)",
  "OBS-UC-STR-SHARE — BLOCKED/SOURCE INPUT REQUIRED",
  "OBS-UC-STR-YOY — BLOCKED/SOURCE INPUT REQUIRED",
] as const;

export type ApplyMode = "dry-run" | "apply";

export type ApplyResult = {
  mode: ApplyMode;
  dryRun: DryRunReport;
  blocked: string[];
  sanity: { ok: boolean; notes: string[] };
  sidecarPath?: string;
  db?: {
    sourceId: string;
    indicatorId: string;
    inserted: number;
    updated: number;
    unchanged: number;
    published: boolean;
  };
};

function loadEnvFromDotLocal(): void {
  try {
    const file = join(process.cwd(), ".env.local");
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

export function createIngestClient(): SupabaseClient {
  loadEnvFromDotLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchLfsaEsganLive(years = [2021, 2022, 2023]) {
  const url = buildLfsaEsganUrl({
    years,
    citizens: ["NAT", "FOR"],
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Eurostat HTTP ${res.status}`);
  return (await res.json()) as Parameters<typeof parseLfsaEsganDataset>[0];
}

export function sanityCheck(obs: NormalizedObservation[]): {
  ok: boolean;
  notes: string[];
} {
  const notes: string[] = [];
  let hardFail = false;
  const keys = new Set<string>();

  for (const o of obs) {
    if (!(o.numericValue >= 0)) {
      notes.push(`negative ${o.naturalKey}`);
      hardFail = true;
    }
    if (keys.has(o.naturalKey)) {
      notes.push(`duplicate key ${o.naturalKey}`);
      hardFail = true;
    }
    keys.add(o.naturalKey);
    if (o.territoryCode !== "IT" || o.territoryLevel !== "italy") {
      notes.push(`bad geo ${o.naturalKey}`);
      hardFail = true;
    }
    if (!o.sourceExternalIdentifier) {
      notes.push(`missing source ${o.naturalKey}`);
      hardFail = true;
    }
    if (o.qualityCode !== "official") {
      notes.push(`unexpected quality ${o.naturalKey}`);
      hardFail = true;
    }
  }

  const for2023 = obs.find(
    (o) => o.citizenshipCode === "FOR" && o.periodStart.startsWith("2023"),
  );
  if (for2023) {
    const delta = Math.abs(for2023.numericValue - 287.7);
    if (delta > 0.05) {
      notes.push(
        `sanity FOR/IT/2023 expected ~287.7 got ${for2023.numericValue}`,
      );
      hardFail = true;
    } else {
      notes.push(`sanity FOR/IT/2023 ok (${for2023.numericValue})`);
    }
  } else {
    notes.push("missing FOR/IT/2023 for sanity check");
    hardFail = true;
  }

  if (obs.length === 0) {
    notes.push("no observations");
    hardFail = true;
  }

  return { ok: !hardFail, notes };
}

function writeSidecar(payload: Record<string, unknown>): string {
  const rawId = String(payload.runId ?? `run-${Date.now()}`);
  // Windows-safe path segment (ISO timestamps contain ':').
  const runId = rawId.replace(/[:]/g, "-");
  const dir = join(process.cwd(), "artifacts", "ingestion", runId);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "manifest.json");
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return path;
}

async function ensureSource(
  supabase: SupabaseClient,
  editionLabel: string | undefined,
): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("observatory_statistical_sources")
    .select("id")
    .eq("external_identifier", SOURCE.external_identifier)
    .maybeSingle();
  if (selErr) throw new Error(`source select: ${selErr.message}`);
  if (existing?.id) {
    const { error } = await supabase
      .from("observatory_statistical_sources")
      .update({
        edition_label: editionLabel ?? null,
        license_note: SOURCE.license_note,
        methodology_note: SOURCE.methodology_note,
        url: SOURCE.url,
        lifecycle_status: "active",
      })
      .eq("id", existing.id);
    if (error) throw new Error(`source update: ${error.message}`);
    return existing.id as string;
  }
  const { data, error } = await supabase
    .from("observatory_statistical_sources")
    .insert({
      ...SOURCE,
      edition_label: editionLabel ?? null,
      lifecycle_status: "active",
    })
    .select("id")
    .single();
  if (error) throw new Error(`source insert: ${error.message}`);
  return data.id as string;
}

async function ensureIndicator(supabase: SupabaseClient): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("observatory_indicators")
    .select("id, publication_status")
    .eq("code", INDICATOR.code)
    .maybeSingle();
  if (selErr) throw new Error(`indicator select: ${selErr.message}`);
  if (existing?.id) {
    const { error } = await supabase
      .from("observatory_indicators")
      .update({
        title: INDICATOR.title,
        description: INDICATOR.description,
        purpose_text: INDICATOR.purpose_text,
        methodology_summary: INDICATOR.methodology_summary,
        operational_status: "active",
      })
      .eq("id", existing.id);
    if (error) throw new Error(`indicator update: ${error.message}`);
    return existing.id as string;
  }
  const { data, error } = await supabase
    .from("observatory_indicators")
    .insert({
      ...INDICATOR,
      operational_status: "active",
      publication_status: "unpublished",
    })
    .select("id")
    .single();
  if (error) throw new Error(`indicator insert: ${error.message}`);
  return data.id as string;
}

async function upsertValue(
  supabase: SupabaseClient,
  indicatorId: string,
  sourceId: string,
  obs: NormalizedObservation,
): Promise<"inserted" | "updated" | "unchanged"> {
  const { data: current, error: selErr } = await supabase
    .from("observatory_indicator_values")
    .select("id, numeric_value, methodology_note")
    .eq("indicator_id", indicatorId)
    .eq("period_start", obs.periodStart)
    .eq("period_end", obs.periodEnd)
    .eq("territory_level", obs.territoryLevel)
    .eq("territory_code", obs.territoryCode)
    .eq("country_code", obs.citizenshipCode!)
    .neq("status", "withdrawn")
    .maybeSingle();
  if (selErr) throw new Error(`value select: ${selErr.message}`);

  const note = `${obs.methodologyNote} | natural_key=${obs.naturalKey} | checksum=${obs.checksumSha256.slice(0, 16)} | unit=${obs.unitNote}`;

  if (!current) {
    const { error } = await supabase.from("observatory_indicator_values").insert({
      indicator_id: indicatorId,
      source_id: sourceId,
      numeric_value: obs.numericValue,
      period_start: obs.periodStart,
      period_end: obs.periodEnd,
      status: "final",
      quality_code: obs.qualityCode,
      territory_level: obs.territoryLevel,
      territory_code: obs.territoryCode,
      territory_label: obs.territoryLabel,
      country_code: obs.citizenshipCode ?? null,
      country_label: obs.citizenshipLabel ?? null,
      methodology_note: note,
      published_at: new Date().toISOString(),
    });
    if (error) throw new Error(`value insert: ${error.message}`);
    return "inserted";
  }

  if (Number(current.numeric_value) === obs.numericValue) return "unchanged";

  const now = new Date().toISOString();
  const { error: wErr } = await supabase
    .from("observatory_indicator_values")
    .update({ status: "withdrawn", withdrawn_at: now })
    .eq("id", current.id);
  if (wErr) throw new Error(`value withdraw: ${wErr.message}`);
  const { error: iErr } = await supabase.from("observatory_indicator_values").insert({
    indicator_id: indicatorId,
    source_id: sourceId,
    numeric_value: obs.numericValue,
    period_start: obs.periodStart,
    period_end: obs.periodEnd,
    status: "revised",
    quality_code: obs.qualityCode,
    territory_level: obs.territoryLevel,
    territory_code: obs.territoryCode,
    territory_label: obs.territoryLabel,
    country_code: obs.citizenshipCode ?? null,
    country_label: obs.citizenshipLabel ?? null,
    methodology_note: note,
    supersedes_value_id: current.id,
    published_at: now,
    revised_at: now,
  });
  if (iErr) throw new Error(`value revise: ${iErr.message}`);
  return "updated";
}

export async function runEurostatIngest(mode: ApplyMode): Promise<ApplyResult> {
  const blocked = [...UNIONCAMERE_BLOCKED];
  const retrievedAt = new Date().toISOString();
  const dataset = await fetchLfsaEsganLive([2021, 2022, 2023]);
  const dryRun = dryRunLfsaEsgan(dataset, { minYear: 2021, maxYear: 2023 });
  dryRun.retrievedAt = retrievedAt;

  const { observations } = parseLfsaEsganDataset(dataset, {
    minYear: 2021,
    maxYear: 2023,
  });
  const sanity = sanityCheck(observations);

  const sidecarPath = writeSidecar({
    runId: dryRun.runId.replace("dry-", mode === "apply" ? "apply-" : "dry-"),
    mode,
    dbWrites: mode === "dry-run" ? 0 : "pending",
    sourceId: EUROSTAT_LFSA_ESGAN.sourceId,
    datasetId: EUROSTAT_LFSA_ESGAN.datasetId,
    indicatorCode: INDICATOR.code,
    retrievedAt,
    sourceUpdated: dataset.updated ?? null,
    licenseClass: EUROSTAT_LFSA_ESGAN.licenseClass,
    licenseNote: EUROSTAT_LFSA_ESGAN.licenseNote,
    counts: dryRun.counts,
    sanity,
    blocked,
    sampleNaturalKeys: observations.map((o) => ({
      naturalKey: o.naturalKey,
      value: o.numericValue,
      checksum: o.checksumSha256,
    })),
  });

  if (mode === "dry-run") {
    return { mode, dryRun, blocked, sanity, sidecarPath };
  }

  if (!sanity.ok) {
    throw new Error(`Sanity failed: ${sanity.notes.join("; ")}`);
  }

  const supabase = createIngestClient();
  const sourceId = await ensureSource(supabase, dataset.updated);
  const indicatorId = await ensureIndicator(supabase);

  // Keep indicator unpublished until post-import verify (IMPORT → VERIFY → PUBLISH).
  await supabase
    .from("observatory_indicators")
    .update({ publication_status: "unpublished", withdrawn_at: null })
    .eq("id", indicatorId);

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  for (const obs of observations) {
    const action = await upsertValue(supabase, indicatorId, sourceId, obs);
    if (action === "inserted") inserted += 1;
    if (action === "updated") updated += 1;
    if (action === "unchanged") unchanged += 1;
  }

  const { count, error: countErr } = await supabase
    .from("observatory_indicator_values")
    .select("id", { count: "exact", head: true })
    .eq("indicator_id", indicatorId)
    .neq("status", "withdrawn");
  if (countErr) throw new Error(`post-write count: ${countErr.message}`);

  if ((count ?? 0) < observations.length) {
    throw new Error(
      `Post-write verify failed: expected ≥${observations.length} current values, got ${count}`,
    );
  }

  const now = new Date().toISOString();
  const { error: pubErr } = await supabase
    .from("observatory_indicators")
    .update({
      publication_status: "published",
      published_at: now,
      withdrawn_at: null,
      operational_status: "active",
    })
    .eq("id", indicatorId);
  if (pubErr) throw new Error(`publish: ${pubErr.message}`);

  writeSidecar({
    runId: dryRun.runId.replace("dry-", "apply-"),
    mode: "apply",
    dbWrites: inserted + updated,
    retrievedAt,
    sourceUpdated: dataset.updated ?? null,
    sourceId,
    indicatorId,
    inserted,
    updated,
    unchanged,
    published: true,
    sanity,
    blocked,
  });

  return {
    mode,
    dryRun,
    blocked,
    sanity,
    sidecarPath,
    db: {
      sourceId,
      indicatorId,
      inserted,
      updated,
      unchanged,
      published: true,
    },
  };
}
