/**
 * D1-C.2 / D1-C.3 — World Bank Indicators apply (Mercati M1 support_resources).
 * Review-only / non-public. Production apply requires explicit allowProduction.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createIngestClient } from "@/lib/external-data/eurostat/apply-lfsa-esgan";
import {
  dryRunWorldBank,
  fetchWorldBankPilot,
  WORLDBANK_INDICATORS,
  type ExistingWbFingerprint,
  type NormalizedWbObservation,
} from "@/lib/external-data/worldbank/indicators";
import type { DryRunReport } from "@/lib/external-data/types";

export type ApplyMode = "dry-run" | "apply";

export type ApplyDbCounts = {
  inserted: number;
  updated: number;
  unchanged: number;
  rejected: number;
  errors: number;
  publishedCount: number;
  reviewOnlyCount: number;
  duplicates: number;
};

export type ApplyResult = {
  mode: ApplyMode;
  dryRun: DryRunReport & {
    selected: NormalizedWbObservation[];
    icePolicy: typeof WORLDBANK_INDICATORS.ice;
  };
  selected: NormalizedWbObservation[];
  retrievedAt: string;
  autoPublish: false;
  targetUrl: string;
  isLocalTarget: boolean;
  sidecarPath?: string;
  db?: ApplyDbCounts;
  marketCatalog: Array<{
    iso2: string;
    marketId: string;
    code: string;
    editorialStatus: string;
  }>;
  errors: string[];
  grantProbe?: { ok: boolean; notes: string[] };
};

const NATURAL_KEY_RE = /natural_key=(worldbank:[^\s|]+)/i;
const CHECKSUM_RE = /checksum=([a-f0-9]{64})/i;

/** Local pilot catalog codes — ISO2 lowercase URL slugs; country_ref = ISO2 upper. */
export const LOCAL_PILOT_MARKETS = [
  {
    code: "it",
    name: "Italia",
    countryRef: "IT",
    countryLabel: "Italia",
    summary: "Mercato paese Italia (catalogo pilot D1-C precondition).",
  },
  {
    code: "de",
    name: "Germania",
    countryRef: "DE",
    countryLabel: "Germania",
    summary: "Mercato paese Germania (catalogo pilot D1-C precondition).",
  },
  {
    code: "fr",
    name: "Francia",
    countryRef: "FR",
    countryLabel: "Francia",
    summary: "Mercato paese Francia (catalogo pilot D1-C precondition).",
  },
] as const;

export function isLocalSupabaseUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "127.0.0.1" ||
      u.hostname === "localhost" ||
      u.hostname === "::1"
    );
  } catch {
    return false;
  }
}

export function assertLocalOnlyTarget(url: string): void {
  if (!isLocalSupabaseUrl(url)) {
    throw new Error(
      `REFUSED: local-only target required (got ${url}). Pass allowProduction for D1-C.3.`,
    );
  }
}

export function assertApplyTarget(
  url: string,
  allowProduction: boolean,
): void {
  if (isLocalSupabaseUrl(url)) return;
  if (!allowProduction) {
    throw new Error(
      `REFUSED: Production apply blocked without allowProduction (got ${url}).`,
    );
  }
  try {
    const host = new URL(url).hostname;
    if (!host.endsWith(".supabase.co")) {
      throw new Error(`REFUSED: unexpected Production host ${host}`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("REFUSED:")) throw err;
    throw new Error(`REFUSED: invalid Production URL`);
  }
}

export function parseNaturalKey(
  contactNote: string | null | undefined,
): string | null {
  if (!contactNote) return null;
  const m = NATURAL_KEY_RE.exec(contactNote);
  return m?.[1] ?? null;
}

export function parseChecksum(
  contactNote: string | null | undefined,
): string {
  if (!contactNote) return "";
  const m = CHECKSUM_RE.exec(contactNote);
  return m?.[1] ?? "";
}

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

export function resolveTargetUrl(): string {
  loadEnvFromDotLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

function writeSidecar(payload: Record<string, unknown>): string {
  const rawId = String(payload.runId ?? `run-${Date.now()}`);
  const runId = rawId.replace(/[:.]/g, "-");
  const dir = join(process.cwd(), "artifacts", "ingestion", runId);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "manifest.json");
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return path;
}

export async function probeMercatiServiceRoleGrants(
  supabase: SupabaseClient,
): Promise<{ ok: boolean; notes: string[] }> {
  const notes: string[] = [];
  let ok = true;
  for (const table of [
    "international_markets",
    "international_market_countries",
    "international_market_support_resources",
  ] as const) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      ok = false;
      notes.push(`${table}: ${error.message}`);
    } else {
      notes.push(`${table}: SELECT ok`);
    }
  }
  return { ok, notes };
}

export async function loadMarketCatalogByIso2(
  supabase: SupabaseClient,
  iso2List: readonly string[] = WORLDBANK_INDICATORS.pilotCountries,
): Promise<
  Map<
    string,
    { marketId: string; code: string; editorialStatus: string; countryRef: string }
  >
> {
  const wanted = new Set(iso2List.map((c) => c.toUpperCase()));
  const { data, error } = await supabase
    .from("international_market_countries")
    .select(
      "country_ref, market_id, international_markets!inner(id, code, editorial_status, market_kind)",
    );
  if (error) throw new Error(`load market catalog: ${error.message}`);

  const map = new Map<
    string,
    { marketId: string; code: string; editorialStatus: string; countryRef: string }
  >();

  for (const row of data ?? []) {
    const ref = String(row.country_ref ?? "")
      .trim()
      .toUpperCase();
    if (!wanted.has(ref)) continue;
    const market = Array.isArray(row.international_markets)
      ? row.international_markets[0]
      : row.international_markets;
    if (!market || typeof market !== "object") continue;
    const m = market as {
      id: string;
      code: string;
      editorial_status: string;
      market_kind: string;
    };
    if (m.market_kind !== "country") continue;
    // Prefer exact code==iso2.lower match if duplicates ever appear.
    const prev = map.get(ref);
    if (prev && prev.code === ref.toLowerCase()) continue;
    map.set(ref, {
      marketId: m.id,
      code: m.code,
      editorialStatus: m.editorial_status,
      countryRef: ref,
    });
  }
  return map;
}

/**
 * Editorial catalog seed for IT/DE/FR (drafting, never published).
 * Not a migration. Local by default; Production only when allowProduction.
 */
export async function ensurePilotMarketCatalog(
  supabase: SupabaseClient,
  targetUrl: string,
  allowProduction = false,
): Promise<{ created: string[]; existing: string[] }> {
  assertApplyTarget(targetUrl, allowProduction);
  const created: string[] = [];
  const existing: string[] = [];

  for (const seed of LOCAL_PILOT_MARKETS) {
    const { data: byCode, error: codeErr } = await supabase
      .from("international_markets")
      .select("id, code")
      .eq("code", seed.code)
      .maybeSingle();
    if (codeErr) throw new Error(`market code lookup ${seed.code}: ${codeErr.message}`);

    let marketId = byCode?.id as string | undefined;
    if (!marketId) {
      const { data: inserted, error: insErr } = await supabase
        .from("international_markets")
        .insert({
          code: seed.code,
          name: seed.name,
          summary: seed.summary,
          market_kind: "country",
          substantial_status: "proposed",
          editorial_status: "drafting",
          geographic_note: `country_ref=${seed.countryRef}`,
        })
        .select("id")
        .single();
      if (insErr || !inserted) {
        throw new Error(
          `seed market ${seed.code}: ${insErr?.message ?? "no row"}`,
        );
      }
      marketId = inserted.id as string;
      created.push(seed.code);
    } else {
      existing.push(seed.code);
    }

    const { data: countryHit, error: cErr } = await supabase
      .from("international_market_countries")
      .select("id")
      .eq("market_id", marketId)
      .eq("country_ref", seed.countryRef)
      .maybeSingle();
    if (cErr) {
      throw new Error(`country lookup ${seed.countryRef}: ${cErr.message}`);
    }
    if (!countryHit) {
      const { error: cinErr } = await supabase
        .from("international_market_countries")
        .insert({
          market_id: marketId,
          country_ref: seed.countryRef,
          country_label: seed.countryLabel,
          is_primary: true,
          sort_order: 0,
        });
      if (cinErr) {
        throw new Error(
          `seed country ${seed.countryRef}: ${cinErr.message}`,
        );
      }
    }
  }

  return { created, existing };
}

/** @deprecated Use ensurePilotMarketCatalog */
export async function ensureLocalPilotMarketCatalog(
  supabase: SupabaseClient,
  targetUrl: string,
): Promise<{ created: string[]; existing: string[] }> {
  return ensurePilotMarketCatalog(supabase, targetUrl, false);
}

export async function loadExistingWbFingerprints(
  supabase: SupabaseClient,
): Promise<Map<string, ExistingWbFingerprint & { id: string; marketId: string }>> {
  const { data, error } = await supabase
    .from("international_market_support_resources")
    .select("id, market_id, contact_note, name, visibility_status, verification_status")
    .ilike("contact_note", "%natural_key=worldbank:%");
  if (error) throw new Error(`load existing WB resources: ${error.message}`);

  const map = new Map<
    string,
    ExistingWbFingerprint & { id: string; marketId: string }
  >();
  for (const row of data ?? []) {
    const key = parseNaturalKey(row.contact_note as string | null);
    if (!key) continue;
    map.set(key, {
      id: row.id as string,
      marketId: row.market_id as string,
      naturalKey: key,
      checksumSha256: parseChecksum(row.contact_note as string | null),
    });
  }
  return map;
}

async function upsertSupportResource(
  supabase: SupabaseClient,
  obs: NormalizedWbObservation,
  marketId: string,
  existing: Map<string, ExistingWbFingerprint & { id: string; marketId: string }>,
): Promise<"inserted" | "updated" | "unchanged"> {
  const prev = existing.get(obs.naturalKey);
  if (prev && prev.checksumSha256 === obs.checksumSha256) {
    return "unchanged";
  }

  const row = {
    market_id: marketId,
    name: obs.name,
    resource_kind: obs.resourceKind,
    summary: obs.summary,
    website_url: obs.websiteUrl,
    contact_note: obs.contactNote,
    territorial_scope_note: obs.territorialScopeNote,
    substantial_status: obs.substantialStatus,
    verification_status: obs.verificationStatus,
    visibility_status: obs.visibilityStatus,
  };

  // Hard guard: never auto-publish (runtime string check — literals are review-only).
  const visibility = String(row.visibility_status);
  const verification = String(row.verification_status);
  if (
    visibility === "public" ||
    verification === "confirmed" ||
    WORLDBANK_INDICATORS.autoPublish
  ) {
    throw new Error(`auto-publish guard tripped for ${obs.naturalKey}`);
  }

  if (!prev) {
    const { data, error } = await supabase
      .from("international_market_support_resources")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) {
      throw new Error(`insert ${obs.naturalKey}: ${error?.message ?? "no row"}`);
    }
    existing.set(obs.naturalKey, {
      id: data.id as string,
      marketId,
      naturalKey: obs.naturalKey,
      checksumSha256: obs.checksumSha256,
    });
    return "inserted";
  }

  // Refresh updates content/provenance only. Editorial axes are preserved so a
  // later human review/publish is not silently reset (and never auto-published).
  const { error } = await supabase
    .from("international_market_support_resources")
    .update({
      market_id: marketId,
      name: row.name,
      resource_kind: row.resource_kind,
      summary: row.summary,
      website_url: row.website_url,
      contact_note: row.contact_note,
      territorial_scope_note: row.territorial_scope_note,
    })
    .eq("id", prev.id);
  if (error) throw new Error(`update ${obs.naturalKey}: ${error.message}`);
  existing.set(obs.naturalKey, {
    ...prev,
    marketId,
    checksumSha256: obs.checksumSha256,
  });
  return "updated";
}

export type RunOptions = {
  mode: ApplyMode;
  ensureLocalCatalog?: boolean;
  /** Explicit GO for D1-C.3 Production apply / Production-aware dry-run. */
  allowProduction?: boolean;
  countries?: readonly string[];
  indicators?: readonly (typeof WORLDBANK_INDICATORS.pilotIndicatorCodes)[number][];
  fetchImpl?: typeof fetch;
  /** Inject client (tests). */
  supabase?: SupabaseClient;
};

export async function runWorldBankIngest(
  options: RunOptions,
): Promise<ApplyResult> {
  const countries = options.countries ?? WORLDBANK_INDICATORS.pilotCountries;
  const indicators =
    options.indicators ?? WORLDBANK_INDICATORS.pilotIndicatorCodes;
  const allowProduction = options.allowProduction === true;
  const targetUrl = resolveTargetUrl();
  const isLocalTarget = isLocalSupabaseUrl(targetUrl);
  const errors: string[] = [];

  if (options.mode === "apply") {
    assertApplyTarget(targetUrl, allowProduction);
  } else if (!isLocalTarget && !allowProduction) {
    // Dry-run against a remote URL still needs an explicit flag so env mistakes
    // do not silently probe Production.
    throw new Error(
      `REFUSED: non-local dry-run requires allowProduction (got ${targetUrl}).`,
    );
  }

  const fetched = await fetchWorldBankPilot({
    countries,
    indicators,
    fetchImpl: options.fetchImpl,
  });

  // Dry-run loads fingerprints/catalog when possible so post-import
  // wouldInsert/unchanged reflect DB state (dbWrites remain 0).
  const shouldUseDb =
    options.mode === "apply" ||
    options.ensureLocalCatalog === true ||
    (options.mode === "dry-run" && (isLocalTarget || allowProduction));

  const supabase =
    options.supabase ?? (shouldUseDb ? createIngestClient() : null);

  let grantProbe: { ok: boolean; notes: string[] } | undefined;
  const marketCatalogList: ApplyResult["marketCatalog"] = [];
  let existing = new Map<
    string,
    ExistingWbFingerprint & { id: string; marketId: string }
  >();
  const marketByIso = new Map<string, string>();

  if (supabase) {
    grantProbe = await probeMercatiServiceRoleGrants(supabase);
    if (options.mode === "apply" && !grantProbe.ok) {
      throw new Error(
        `GRANT GAP: service_role cannot access Mercati tables. Details: ${grantProbe.notes.join("; ")}`,
      );
    }
    if (options.ensureLocalCatalog) {
      await ensurePilotMarketCatalog(supabase, targetUrl, allowProduction);
    }
    if (grantProbe.ok) {
      const catalog = await loadMarketCatalogByIso2(supabase, countries);
      for (const [iso2, m] of catalog) {
        marketByIso.set(iso2, m.marketId);
        marketCatalogList.push({
          iso2,
          marketId: m.marketId,
          code: m.code,
          editorialStatus: m.editorialStatus,
        });
      }
      existing = await loadExistingWbFingerprints(supabase);
    } else if (options.mode === "dry-run") {
      // Non-blocking for dry-run without grants: report without existing map.
      errors.push(
        `grant probe soft-fail on dry-run: ${grantProbe.notes.join("; ")}`,
      );
    }
  }

  const marketCatalogForDry = new Map(
    [...marketByIso.entries()].map(([iso]) => {
      const hit = marketCatalogList.find((m) => m.iso2 === iso);
      return [iso, hit?.code ?? `market:${iso}`] as const;
    }),
  );

  const dryRun = dryRunWorldBank(fetched.payloads, {
    retrievedAt: fetched.retrievedAt,
    countries,
    indicators,
    marketCatalog: marketCatalogForDry,
    existing: new Map(
      [...existing.entries()].map(([k, v]) => [
        k,
        { naturalKey: v.naturalKey, checksumSha256: v.checksumSha256 },
      ]),
    ),
  });

  const selected = dryRun.selected;
  const result: ApplyResult = {
    mode: options.mode,
    dryRun,
    selected,
    retrievedAt: fetched.retrievedAt,
    autoPublish: false,
    targetUrl,
    isLocalTarget,
    marketCatalog: marketCatalogList,
    errors,
    grantProbe,
  };

  if (options.mode === "dry-run") {
    result.sidecarPath = writeSidecar({
      runId: `dry-worldbank-indicators-${fetched.retrievedAt}`,
      mode: "dry-run",
      dbWrites: 0,
      autoPublish: false,
      source: WORLDBANK_INDICATORS.sourceId,
      dataset: WORLDBANK_INDICATORS.datasetId,
      countries: [...countries],
      indicators: [...indicators],
      fetched: dryRun.counts.fetched,
      validated: dryRun.counts.valid,
      rejected: dryRun.counts.rejected,
      wouldInsert: dryRun.counts.create,
      wouldUpdate: dryRun.counts.update,
      unchanged: dryRun.counts.unchanged,
      marketCatalog: marketCatalogList,
      ice: WORLDBANK_INDICATORS.ice,
      provenanceClass: "P-D",
      selectedNaturalKeys: selected.map((s) => s.naturalKey),
    });
    return result;
  }

  if (!supabase) throw new Error("apply requires supabase client");

  const missingMarkets = countries.filter(
    (c) => !marketByIso.has(c.toUpperCase()),
  );
  if (missingMarkets.length) {
    throw new Error(
      `MARKET CATALOG MISSING for ${missingMarkets.join(",")}. Seed local drafting markets (ensureLocalCatalog) or STOP.`,
    );
  }

  const db: ApplyDbCounts = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    rejected: 0,
    errors: 0,
    publishedCount: 0,
    reviewOnlyCount: 0,
    duplicates: 0,
  };

  for (const obs of selected) {
    try {
      const marketId = marketByIso.get(obs.countryIso2);
      if (!marketId) {
        db.rejected += 1;
        errors.push(`no market for ${obs.countryIso2} / ${obs.naturalKey}`);
        continue;
      }
      const action = await upsertSupportResource(
        supabase,
        obs,
        marketId,
        existing,
      );
      if (action === "inserted") db.inserted += 1;
      if (action === "updated") db.updated += 1;
      if (action === "unchanged") db.unchanged += 1;
      db.reviewOnlyCount += 1;
    } catch (err) {
      db.errors += 1;
      errors.push(
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  // Post-write duplicate / auto-publish guards.
  const { data: written, error: wErr } = await supabase
    .from("international_market_support_resources")
    .select("id, contact_note, visibility_status, verification_status")
    .ilike("contact_note", "%natural_key=worldbank:%");
  if (wErr) throw new Error(`post-write load: ${wErr.message}`);

  const keys = new Map<string, number>();
  for (const row of written ?? []) {
    const key = parseNaturalKey(row.contact_note as string | null);
    if (!key) continue;
    keys.set(key, (keys.get(key) ?? 0) + 1);
    if (row.visibility_status === "public") {
      throw new Error(`BLOCKING: auto/public visibility on ${key}`);
    }
    if (row.verification_status === "confirmed") {
      throw new Error(`BLOCKING: confirmed verification on ${key}`);
    }
  }
  for (const [key, n] of keys) {
    if (n > 1) {
      db.duplicates += n - 1;
      errors.push(`duplicate natural key rows: ${key} count=${n}`);
    }
  }
  db.publishedCount = (written ?? []).filter(
    (r) => r.visibility_status === "public",
  ).length;

  result.db = db;
  result.errors = errors;
  result.sidecarPath = writeSidecar({
    runId: `apply-worldbank-indicators-${fetched.retrievedAt}`,
    mode: "apply",
    dbWrites: db.inserted + db.updated,
    autoPublish: false,
    targetUrl,
    isLocalTarget,
    allowProduction,
    source: WORLDBANK_INDICATORS.sourceId,
    dataset: WORLDBANK_INDICATORS.datasetId,
    countries: [...countries],
    indicators: [...indicators],
    fetched: dryRun.counts.fetched,
    validated: dryRun.counts.valid,
    rejected: dryRun.counts.rejected,
    inserted: db.inserted,
    updated: db.updated,
    unchanged: db.unchanged,
    reviewOnlyCount: db.reviewOnlyCount,
    publishedCount: db.publishedCount,
    duplicates: db.duplicates,
    marketCatalog: marketCatalogList,
    ice: WORLDBANK_INDICATORS.ice,
    provenanceClass: "P-D",
    selectedNaturalKeys: selected.map((s) => s.naturalKey),
    errors,
  });

  if (db.publishedCount > 0) {
    throw new Error("BLOCKING: publishedCount > 0 after apply");
  }
  if (db.duplicates > 0) {
    throw new Error("BLOCKING: duplicate natural keys after apply");
  }
  if (errors.length) {
    throw new Error(`apply completed with errors: ${errors.join("; ")}`);
  }

  return result;
}
