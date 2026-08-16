/**
 * D1-D.3 — Contenuti metadata/link-only review-only apply (CASE A).
 * Writes owned_by_editorial + draft/unpublished/private only.
 * AUTO-PUBLISH = impossible.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import dns from "node:dns";
import { checksumSha256 } from "@/lib/external-data/checksum";

// Windows/Node undici often fails on some hosts when AAAA is preferred.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore on older runtimes */
}
import {
  assertContentsRedirectAllowed,
  dedupeContentsCandidates,
  normalizeContentsAcquisition,
  planContentsRefresh,
  type ExistingContentsFingerprint,
  type NormalizedExternalContent,
} from "@/lib/external-data/contents/acquisition";
import {
  CONTENUTI_ACQUISITION,
  assertKnownContentsSource,
  type ContentsSourceCode,
} from "@/lib/external-data/contents/allowlist";
import {
  assertPilotCapsNotExceeded,
  CONTENUTI_PILOT_CANDIDATES,
  CONTENUTI_PILOT_EXCLUSIONS,
} from "@/lib/external-data/contents/pilot-manifest";
import { createIngestClient } from "@/lib/external-data/eurostat/apply-lfsa-esgan";
import { slugify } from "@/lib/editorial/slug";
import type { DryRunCounts, DryRunRecord, DryRunReport } from "@/lib/external-data/types";

export type ApplyMode = "dry-run" | "apply";

const ITALIAN_LANGUAGE_ID = 1;
const NATURAL_KEY_RE = /d1d_natural_key:\s*(\S+)/;
const CHECKSUM_RE = /d1d_checksum:\s*([a-f0-9]{64})/i;
const TITLE_SHA_RE = /d1d_title_sha:\s*([a-f0-9]{64})/i;
const SUMMARY_SHA_RE = /d1d_summary_sha:\s*([a-f0-9]{64})/i;
const PROD_HOST_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i;

export type ApplyDbCounts = {
  inserted: number;
  updated: number;
  unchanged: number;
  reviewOnlyCount: number;
  publicCount: number;
  scheduledCount: number;
  publishedAtSet: number;
  duplicates: number;
  offAllowlistUrls: number;
};

export type ContentsApplyResult = {
  mode: ApplyMode;
  targetUrl: string;
  isLocalTarget: boolean;
  allowProduction: boolean;
  autoPublish: false;
  dryRun: DryRunReport;
  selected: NormalizedExternalContent[];
  perSource: Record<string, number>;
  exclusions: typeof CONTENUTI_PILOT_EXCLUSIONS;
  redirectChecks: { url: string; finalUrl: string; ok: boolean; reason?: string }[];
  db?: ApplyDbCounts;
  errors: string[];
  sidecarPath?: string;
  retrievedAt: string;
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

export function resolveContentsTargetUrl(): string {
  loadEnvFromDotLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

export function isLocalSupabaseUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "127.0.0.1" ||
      u.hostname === "localhost" ||
      u.hostname === "0.0.0.0"
    );
  } catch {
    return false;
  }
}

function assertProductionGate(targetUrl: string, allowProduction: boolean): void {
  if (isLocalSupabaseUrl(targetUrl)) return;
  if (!PROD_HOST_RE.test(targetUrl.replace(/\/$/, ""))) {
    throw new Error(`refusing unknown non-local target: ${targetUrl}`);
  }
  if (!allowProduction) {
    throw new Error(
      "Production target requires --allow-production (D1-D.3 remote gate)",
    );
  }
}

function provenanceTrailer(row: NormalizedExternalContent): string {
  return [
    "",
    "---",
    `d1d_natural_key: ${row.naturalKey}`,
    `d1d_fingerprint: ${row.fingerprint}`,
    `d1d_checksum: ${row.checksumSha256}`,
    `d1d_source_code: ${row.provenance.sourceCode}`,
    `d1d_identity_method: ${row.identityMethod}`,
    `d1d_document_type: ${row.provenance.documentType}`,
    `d1d_retrieved_at: ${row.provenance.retrievedAt}`,
    `d1d_published_on: ${row.provenance.publishedOn ?? ""}`,
    `d1d_updated_on: ${row.provenance.updatedOn ?? ""}`,
    `d1d_external_id: ${row.provenance.externalId ?? ""}`,
    `d1d_title_sha: ${checksumSha256(row.editorial.titleIt)}`,
    `d1d_summary_sha: ${checksumSha256(row.editorial.platformSummaryIt)}`,
    `d1d_acquisition_mode: METADATA_LINK_ONLY`,
    `d1d_auto_publish: false`,
  ].join("\n");
}

function bodyWithProvenance(row: NormalizedExternalContent): string {
  return `${row.bodyStub}${provenanceTrailer(row)}`;
}

function parseFromBody(body: string | null | undefined): {
  naturalKey: string;
  checksumSha256: string;
  sourceTitleSha256: string;
  sourceSummarySha256: string;
} {
  const text = body ?? "";
  return {
    naturalKey: NATURAL_KEY_RE.exec(text)?.[1] ?? "",
    checksumSha256: CHECKSUM_RE.exec(text)?.[1] ?? "",
    sourceTitleSha256: TITLE_SHA_RE.exec(text)?.[1] ?? "",
    sourceSummarySha256: SUMMARY_SHA_RE.exec(text)?.[1] ?? "",
  };
}

function buildSlug(row: NormalizedExternalContent): string {
  const short = row.provenance.sourceCode
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const titlePart = slugify(row.editorial.titleIt).slice(0, 48) || "scheda";
  const hash = row.fingerprint.slice(0, 8);
  const raw = `ext-${short}-${titlePart}-${hash}`.replace(/-+/g, "-");
  return raw.slice(0, 120).replace(/-$/, "");
}

/**
 * D1-D.2 canonicalization prefers apex when both apex+www are allowlisted.
 * Some institutional hosts only answer on www (emnitalyncp.it). For fetch and
 * user-facing source_url, prefer www when it is explicitly allowlisted.
 * Natural keys remain external-id based and unchanged.
 */
export function preferFetchableContentsUrl(
  sourceCode: string,
  canonicalUrl: string,
): string {
  const entry = assertKnownContentsSource(sourceCode);
  let parsed: URL;
  try {
    parsed = new URL(canonicalUrl);
  } catch {
    return canonicalUrl;
  }
  const host = parsed.hostname.toLowerCase();
  if (host.startsWith("www.")) return canonicalUrl;
  const www = `www.${host}`;
  const allowed = new Set(entry.allowedHostnames.map((h) => h.toLowerCase()));
  if (!allowed.has(www)) return canonicalUrl;
  parsed.hostname = www;
  return parsed.toString();
}

async function fetchOnce(
  url: string,
  method: "HEAD" | "GET",
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "immigrati-imprenditori-d1d3/1.0" },
    });
    return res.url || url;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveFinalUrl(url: string): Promise<string> {
  const looksHeavy = /\.(pdf|docx?)(?:$|\?)/i.test(url);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Prefer HEAD; never download full PDFs/docs for redirect proof.
      return await fetchOnce(url, "HEAD", looksHeavy ? 20000 : 30000);
    } catch (headErr) {
      lastErr = headErr;
      if (looksHeavy) {
        // For heavy assets, fall back to a ranged GET (first byte only).
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 20000);
          try {
            const res = await fetch(url, {
              method: "GET",
              redirect: "follow",
              signal: controller.signal,
              headers: {
                "user-agent": "immigrati-imprenditori-d1d3/1.0",
                range: "bytes=0-0",
              },
            });
            return res.url || url;
          } finally {
            clearTimeout(timer);
          }
        } catch (rangeErr) {
          lastErr = rangeErr;
        }
      } else {
        try {
          return await fetchOnce(url, "GET", 30000);
        } catch (getErr) {
          lastErr = getErr;
        }
      }
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function checkPilotRedirects(
  records: readonly NormalizedExternalContent[],
): Promise<{
  redirectChecks: ContentsApplyResult["redirectChecks"];
  errors: string[];
}> {
  const redirectChecks: ContentsApplyResult["redirectChecks"] = [];
  const errors: string[] = [];
  for (const rec of records) {
    const probeUrl = preferFetchableContentsUrl(
      rec.provenance.sourceCode,
      rec.sourceUrl,
    );
    try {
      const finalUrl = await resolveFinalUrl(probeUrl);
      try {
        const ok = assertContentsRedirectAllowed(
          rec.provenance.sourceCode,
          finalUrl,
        );
        redirectChecks.push({
          url: probeUrl,
          finalUrl: ok.canonicalUrl,
          ok: true,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        redirectChecks.push({
          url: probeUrl,
          finalUrl,
          ok: false,
          reason,
        });
        errors.push(`redirect rejected ${rec.naturalKey}: ${reason}`);
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      redirectChecks.push({
        url: probeUrl,
        finalUrl: probeUrl,
        ok: false,
        reason,
      });
      errors.push(`redirect fetch failed ${rec.naturalKey}: ${reason}`);
    }
  }
  return { redirectChecks, errors };
}

export function normalizePilotBatch(
  candidates = CONTENUTI_PILOT_CANDIDATES,
): {
  selected: NormalizedExternalContent[];
  rejectedDuplicates: { naturalKey: string; reason: string }[];
  errors: string[];
} {
  assertPilotCapsNotExceeded(candidates);
  const errors: string[] = [];
  const normalized: NormalizedExternalContent[] = [];
  for (const c of candidates) {
    try {
      const row = normalizeContentsAcquisition(c);
      if (row.autoPublish !== false) {
        throw new Error("autoPublish must be false");
      }
      if (row.publicationStatus !== "unpublished") {
        throw new Error("publicationStatus must be unpublished");
      }
      if (row.visibilityStatus !== "private") {
        throw new Error("visibilityStatus must be private");
      }
      if (row.editorialStatus !== "draft") {
        throw new Error("editorialStatus must be draft");
      }
      if (!row.ownedByEditorial) {
        throw new Error("ownedByEditorial required");
      }
      normalized.push(row);
    } catch (err) {
      errors.push(
        `${c.sourceCode} ${c.contentUrl}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
  const { unique, rejectedDuplicates } = dedupeContentsCandidates(normalized);
  return { selected: unique, rejectedDuplicates, errors };
}

async function loadExistingByNaturalKey(
  supabase: SupabaseClient,
): Promise<Map<string, ExistingContentsFingerprint & { id: string; body: string; sourceUrl: string | null }>> {
  const { data, error } = await supabase
    .from("contents")
    .select(
      "id, title, abstract, body, source_url, source_label, primary_category_code, editorial_status, publication_status, visibility_status, owned_by_editorial",
    )
    .eq("owned_by_editorial", true)
    .like("body", "%d1d_natural_key:%");
  if (error) throw new Error(`load existing contents: ${error.message}`);

  const map = new Map<
    string,
    ExistingContentsFingerprint & { id: string; body: string; sourceUrl: string | null }
  >();
  for (const row of data ?? []) {
    const parsed = parseFromBody(row.body as string);
    if (!parsed.naturalKey) continue;
    map.set(parsed.naturalKey, {
      id: row.id as string,
      body: row.body as string,
      sourceUrl: (row.source_url as string | null) ?? null,
      naturalKey: parsed.naturalKey,
      checksumSha256: parsed.checksumSha256,
      editorialStatus: row.editorial_status as ExistingContentsFingerprint["editorialStatus"],
      publicationStatus:
        row.publication_status as ExistingContentsFingerprint["publicationStatus"],
      visibilityStatus:
        row.visibility_status as ExistingContentsFingerprint["visibilityStatus"],
      title: row.title as string,
      abstract: (row.abstract as string | null) ?? null,
      primaryCategoryCode: (row.primary_category_code as string | null) ?? null,
      sourceTitleSha256: parsed.sourceTitleSha256,
      sourceSummarySha256: parsed.sourceSummarySha256,
    });
  }
  return map;
}

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

export function buildContentsDryRun(input: {
  selected: NormalizedExternalContent[];
  existing: Map<string, ExistingContentsFingerprint>;
  rejectedDuplicates: { naturalKey: string; reason: string }[];
  normalizeErrors: string[];
  startedAt: string;
}): DryRunReport {
  const counts = emptyCounts();
  counts.fetched = CONTENUTI_PILOT_CANDIDATES.length + CONTENUTI_PILOT_EXCLUSIONS.length;
  const records: DryRunRecord[] = [];
  const errors = [...input.normalizeErrors];

  for (const dup of input.rejectedDuplicates) {
    counts.rejected += 1;
    records.push({
      action: "REJECT",
      reason: `duplicate:${dup.naturalKey}:${dup.reason}`,
    });
  }

  for (const row of input.selected) {
    counts.valid += 1;
    const plan = planContentsRefresh({
      incoming: row,
      existing: input.existing.get(row.naturalKey) ?? null,
    });
    if (plan.action === "CREATE") counts.create += 1;
    else if (plan.action === "UPDATE") counts.update += 1;
    else counts.unchanged += 1;
    if (plan.autoPublish) {
      errors.push(`autoPublish leaked for ${row.naturalKey}`);
      counts.errors += 1;
    }
    records.push({
      action: plan.action,
      reason: `${plan.action.toLowerCase()}:${row.naturalKey}`,
    });
  }

  for (const ex of CONTENUTI_PILOT_EXCLUSIONS) {
    counts.rejected += 1;
    records.push({
      action: "REJECT",
      reason: `excluded:${ex.url}:${ex.reason}`,
    });
  }

  return {
    runId: `contenuti-pilot-${input.startedAt}`,
    sourceId: "contenuti-pilot-allowlist",
    datasetId: "d1-d3-metadata-link-only",
    mode: "dry-run",
    startedAt: input.startedAt,
    endedAt: new Date().toISOString(),
    retrievedAt: input.selected[0]?.provenance.retrievedAt ?? input.startedAt,
    licenseClass: "CURATED_ONLY",
    licenseNote: "Metadata/link only — no full-text storage",
    counts,
    records,
    errors,
    dbWrites: 0,
  };
}

async function upsertContent(
  supabase: SupabaseClient,
  row: NormalizedExternalContent,
  existing: Map<
    string,
    ExistingContentsFingerprint & { id: string; body: string; sourceUrl: string | null }
  >,
): Promise<"inserted" | "updated" | "unchanged"> {
  const prior = existing.get(row.naturalKey) ?? null;
  const plan = planContentsRefresh({ incoming: row, existing: prior });
  if (plan.autoPublish) {
    throw new Error(`autoPublish forbidden for ${row.naturalKey}`);
  }

  if (plan.action === "CREATE" || !prior) {
    const fetchableUrl = preferFetchableContentsUrl(
      row.provenance.sourceCode,
      row.sourceUrl,
    );
    const rowForStorage: NormalizedExternalContent = {
      ...row,
      sourceUrl: fetchableUrl,
      editorial: { ...row.editorial, sourceLink: fetchableUrl },
      provenance: { ...row.provenance, canonicalUrl: row.provenance.canonicalUrl },
      bodyStub: row.bodyStub.replace(row.sourceUrl, fetchableUrl),
    };
    const insert = {
      owned_by_editorial: true,
      owner_person_id: null,
      owner_business_id: null,
      type_code: row.editorial.typeCode,
      primary_category_code: row.editorial.primaryCategoryCode,
      language_id: ITALIAN_LANGUAGE_ID,
      title: row.editorial.titleIt,
      subtitle: null,
      abstract: row.editorial.platformSummaryIt,
      body: bodyWithProvenance(rowForStorage),
      body_format: "markdown",
      slug: buildSlug(row),
      cover_url: row.editorial.coverUrl,
      source_url: fetchableUrl,
      source_label: row.sourceLabel,
      editorial_status: CONTENUTI_ACQUISITION.ingestDefaults.editorialStatus,
      publication_status: CONTENUTI_ACQUISITION.ingestDefaults.publicationStatus,
      visibility_status: CONTENUTI_ACQUISITION.ingestDefaults.visibilityStatus,
      is_featured: false,
      published_at: null,
      withdrawn_at: null,
      archived_at: null,
    };
    const { data, error } = await supabase
      .from("contents")
      .insert(insert)
      .select("id")
      .single();
    if (error) throw new Error(`insert ${row.naturalKey}: ${error.message}`);
    existing.set(row.naturalKey, {
      id: data.id as string,
      body: insert.body,
      sourceUrl: insert.source_url,
      naturalKey: row.naturalKey,
      checksumSha256: row.checksumSha256,
      editorialStatus: "draft",
      publicationStatus: "unpublished",
      visibilityStatus: "private",
      title: insert.title,
      abstract: insert.abstract,
      primaryCategoryCode: insert.primary_category_code,
      sourceTitleSha256: checksumSha256(row.editorial.titleIt),
      sourceSummarySha256: checksumSha256(row.editorial.platformSummaryIt),
    });
    return "inserted";
  }

  if (plan.action === "UNCHANGED") return "unchanged";

  // Refresh: never upgrade publish axes; preserve human editorial fields.
  const fetchableUrl = preferFetchableContentsUrl(
    row.provenance.sourceCode,
    plan.refreshable.sourceUrl,
  );
  const nextBody = bodyWithProvenance({
    ...row,
    sourceUrl: fetchableUrl,
    editorial: {
      ...row.editorial,
      sourceLink: fetchableUrl,
      titleIt: plan.preserved.title,
      platformSummaryIt:
        plan.preserved.abstract ?? row.editorial.platformSummaryIt,
      primaryCategoryCode:
        (plan.preserved.primaryCategoryCode as typeof row.editorial.primaryCategoryCode) ??
        row.editorial.primaryCategoryCode,
    },
    bodyStub: row.bodyStub.replace(row.sourceUrl, fetchableUrl),
  });

  const patch: Record<string, unknown> = {
    source_url: fetchableUrl,
    source_label: plan.refreshable.sourceLabel,
    body: nextBody,
  };
  if (plan.titleFromSource) patch.title = plan.preserved.title;
  if (plan.summaryFromSource) patch.abstract = plan.preserved.abstract;
  // Explicitly do NOT set publication_status / visibility / published_at / editorial_status.

  const { error } = await supabase
    .from("contents")
    .update(patch)
    .eq("id", prior.id)
    .eq("owned_by_editorial", true);
  if (error) throw new Error(`update ${row.naturalKey}: ${error.message}`);
  return "updated";
}

export async function countPilotContents(
  supabase: SupabaseClient,
): Promise<ApplyDbCounts & { perSource: Record<string, number>; ids: string[] }> {
  const { data, error } = await supabase
    .from("contents")
    .select(
      "id, body, source_url, editorial_status, publication_status, visibility_status, published_at",
    )
    .eq("owned_by_editorial", true)
    .like("body", "%d1d_natural_key:%");
  if (error) throw new Error(`count pilot contents: ${error.message}`);

  const db: ApplyDbCounts = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    reviewOnlyCount: 0,
    publicCount: 0,
    scheduledCount: 0,
    publishedAtSet: 0,
    duplicates: 0,
    offAllowlistUrls: 0,
  };
  const perSource: Record<string, number> = {};
  const seenKeys = new Set<string>();
  const ids: string[] = [];

  for (const row of data ?? []) {
    const parsed = parseFromBody(row.body as string);
    if (!parsed.naturalKey.startsWith("ismu-") &&
      !parsed.naturalKey.startsWith("minlavoro-") &&
      !parsed.naturalKey.startsWith("emn-") &&
      !parsed.naturalKey.startsWith("futurae-")) {
      continue;
    }
    ids.push(row.id as string);
    if (seenKeys.has(parsed.naturalKey)) {
      db.duplicates += 1;
      continue;
    }
    seenKeys.add(parsed.naturalKey);
    const source = parsed.naturalKey.split(":")[0] ?? "unknown";
    perSource[source] = (perSource[source] ?? 0) + 1;

    const reviewOnly =
      row.editorial_status === "draft" &&
      row.publication_status === "unpublished" &&
      row.visibility_status === "private" &&
      row.published_at == null;
    if (reviewOnly) db.reviewOnlyCount += 1;
    if (
      row.publication_status === "published" &&
      row.visibility_status === "public"
    ) {
      db.publicCount += 1;
    }
    if (row.published_at != null) db.publishedAtSet += 1;

    const sourceUrl = row.source_url as string | null;
    if (sourceUrl) {
      try {
        assertContentsRedirectAllowed(source as ContentsSourceCode, sourceUrl);
      } catch {
        db.offAllowlistUrls += 1;
      }
    }
  }

  return { ...db, perSource, ids };
}

function writeSidecar(payload: Record<string, unknown>): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(
    process.cwd(),
    "artifacts",
    "ingestion",
    `${payload.mode === "apply" ? "apply" : "dry"}-contenuti-pilot-${stamp}`,
  );
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "manifest.json");
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return path;
}

export async function runContentsPilotIngest(options: {
  mode: ApplyMode;
  allowProduction?: boolean;
  skipRedirectCheck?: boolean;
  supabase?: SupabaseClient | null;
}): Promise<ContentsApplyResult> {
  const startedAt = new Date().toISOString();
  const allowProduction = options.allowProduction === true;
  const targetUrl = resolveContentsTargetUrl();
  const isLocalTarget = isLocalSupabaseUrl(targetUrl);
  assertProductionGate(targetUrl, allowProduction);

  const { selected, rejectedDuplicates, errors: normalizeErrors } =
    normalizePilotBatch();
  const errors = [...normalizeErrors];

  let existing = new Map<
    string,
    ExistingContentsFingerprint & { id: string; body: string; sourceUrl: string | null }
  >();
  // Default: use env ingest client for dry-run + apply (DB fingerprint compare).
  // Tests may pass supabase: null to stay offline.
  const supabase =
    options.supabase === null
      ? null
      : (options.supabase ?? createIngestClient());

  if (supabase) {
    try {
      existing = await loadExistingByNaturalKey(supabase);
    } catch (err) {
      if (options.mode === "apply") throw err;
      errors.push(
        `existing load skipped: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  const dryRun = buildContentsDryRun({
    selected,
    existing,
    rejectedDuplicates,
    normalizeErrors,
    startedAt,
  });
  errors.push(...dryRun.errors);

  let redirectChecks: ContentsApplyResult["redirectChecks"] = [];
  if (!options.skipRedirectCheck) {
    const redirect = await checkPilotRedirects(selected);
    redirectChecks = redirect.redirectChecks;
    errors.push(...redirect.errors);
  }

  const perSource: Record<string, number> = {};
  for (const row of selected) {
    const code = row.provenance.sourceCode;
    perSource[code] = (perSource[code] ?? 0) + 1;
  }

  const result: ContentsApplyResult = {
    mode: options.mode,
    targetUrl,
    isLocalTarget,
    allowProduction,
    autoPublish: false,
    dryRun,
    selected,
    perSource,
    exclusions: CONTENUTI_PILOT_EXCLUSIONS,
    redirectChecks,
    errors,
    retrievedAt: dryRun.retrievedAt,
  };

  if (options.mode === "dry-run") {
    result.sidecarPath = writeSidecar({
      mode: "dry-run",
      dbWrites: 0,
      autoPublish: false,
      targetUrl,
      isLocalTarget,
      selected: selected.length,
      perSource,
      counts: dryRun.counts,
      naturalKeys: selected.map((s) => s.naturalKey),
      records: selected.map((s) => ({
        sourceCode: s.provenance.sourceCode,
        title: s.editorial.titleIt,
        publishedOn: s.provenance.publishedOn,
        canonicalUrl: s.provenance.canonicalUrl,
        naturalKey: s.naturalKey,
        fingerprint: s.fingerprint,
        editorialStatus: s.editorialStatus,
        publicationStatus: s.publicationStatus,
        visibilityStatus: s.visibilityStatus,
      })),
      exclusions: CONTENUTI_PILOT_EXCLUSIONS,
      redirectChecks,
      errors,
    });
    return result;
  }

  if (!supabase) throw new Error("supabase client required for apply");
  if (errors.some((e) => e.includes("redirect rejected") || e.includes("autoPublish"))) {
    throw new Error("refusing apply with redirect/autoPublish errors");
  }

  const db: ApplyDbCounts = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    reviewOnlyCount: 0,
    publicCount: 0,
    scheduledCount: 0,
    publishedAtSet: 0,
    duplicates: 0,
    offAllowlistUrls: 0,
  };

  for (const row of selected) {
    try {
      const action = await upsertContent(supabase, row, existing);
      if (action === "inserted") db.inserted += 1;
      else if (action === "updated") db.updated += 1;
      else db.unchanged += 1;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  const post = await countPilotContents(supabase);
  db.reviewOnlyCount = post.reviewOnlyCount;
  db.publicCount = post.publicCount;
  db.scheduledCount = post.scheduledCount;
  db.publishedAtSet = post.publishedAtSet;
  db.duplicates = post.duplicates;
  db.offAllowlistUrls = post.offAllowlistUrls;
  result.db = db;
  result.perSource = post.perSource;

  result.sidecarPath = writeSidecar({
    mode: "apply",
    dbWrites: db.inserted + db.updated,
    autoPublish: false,
    targetUrl,
    isLocalTarget,
    selected: selected.length,
    perSource: post.perSource,
    db,
    naturalKeys: selected.map((s) => s.naturalKey),
    records: selected.map((s) => ({
      sourceCode: s.provenance.sourceCode,
      title: s.editorial.titleIt,
      publishedOn: s.provenance.publishedOn,
      canonicalUrl: s.provenance.canonicalUrl,
      naturalKey: s.naturalKey,
    })),
    errors,
  });

  return result;
}
