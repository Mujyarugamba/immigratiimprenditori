import type { SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { checksumSha256 } from "@/lib/external-data/checksum";
import { createIngestClient } from "@/lib/external-data/eurostat/apply-lfsa-esgan";
import {
  dryRunIncentiviGov,
  fetchIncentiviGovOpenData,
  INCENTIVI_GOV_OPENDATA,
  mapIncentiviGovDoc,
  type ExistingOpportunityFingerprint,
  type IncentiviGovSolrResponse,
  type NormalizedExternalOpportunity,
} from "@/lib/external-data/incentivi-gov/opendata";
import type { DryRunReport } from "@/lib/external-data/types";

export type ApplyMode = "dry-run" | "apply";

export type ApplyDbCounts = {
  inserted: number;
  updated: number;
  unchanged: number;
  publishedCount: number;
  reviewOnlyCount: number;
  duplicates: number;
};

export type ApplyResult = {
  mode: ApplyMode;
  dryRun: DryRunReport;
  selected: NormalizedExternalOpportunity[];
  retrievedAt: string;
  endpoint: string;
  autoPublish: false;
  sidecarPath?: string;
  db?: ApplyDbCounts;
  errors: string[];
};

const CHECKSUM_RE = /checksum=([a-f0-9]{64})/i;

/** Source-controlled vs editorial-controlled (D1-B.2):
 *  SOURCE: title, substantial_status, opportunity_sources.*, time windows, territories
 *  EDITORIAL: summary (after human edit), description, purpose, editorial/publication/visibility
 *  Refresh must not overwrite a human-edited summary.
 */
function provenanceReference(row: NormalizedExternalOpportunity): string {
  const sourceSummarySha = checksumSha256(row.shortDescription ?? "");
  return [
    row.attribution,
    `Licenza: ${row.license}`,
    `source_page=${row.sourcePageUrl}`,
    row.sourceUpdatedAt
      ? `source_updated_at=${row.sourceUpdatedAt}`
      : "source_updated_at=unavailable",
    `source_summary_sha=${sourceSummarySha}`,
    `checksum=${row.checksumSha256}`,
  ].join(" | ");
}

function parseSourceSummarySha(referenceText: string | null | undefined): string {
  if (!referenceText) return "";
  const m = /source_summary_sha=([a-f0-9]{64})/i.exec(referenceText);
  return m?.[1] ?? "";
}

function parseChecksum(referenceText: string | null | undefined): string {
  if (!referenceText) return "";
  const m = CHECKSUM_RE.exec(referenceText);
  return m?.[1] ?? "";
}

function territoryLabels(regions: string[]): string[] {
  if (regions.length === 0) return [];
  const unique = [...new Set(regions.map((r) => r.trim()).filter(Boolean))];
  if (unique.length >= 15) return ["Italia (nazionale)"];
  const preferred = unique.filter((r) => /lombardia/i.test(r));
  const rest = unique.filter((r) => !/lombardia/i.test(r));
  return [...preferred, ...rest].slice(0, 5);
}

export function selectPilotOpportunities(
  payload: IncentiviGovSolrResponse,
  options?: {
    now?: Date;
    existing?: Map<string, ExistingOpportunityFingerprint>;
    pilotMax?: number;
  },
): {
  dryRun: DryRunReport;
  selected: NormalizedExternalOpportunity[];
} {
  const dryRun = dryRunIncentiviGov(payload, {
    now: options?.now,
    existing: options?.existing,
    pilotMax: options?.pilotMax ?? INCENTIVI_GOV_OPENDATA.pilotMax,
  });

  const selectedKeys = new Set<string>();
  for (const r of dryRun.records) {
    if (
      r.action !== "CREATE" &&
      r.action !== "UPDATE" &&
      r.action !== "UNCHANGED"
    ) {
      continue;
    }
    const reason = r.reason ?? "";
    const key = reason.startsWith("in_review_unpublished:")
      ? reason.slice("in_review_unpublished:".length)
      : reason.startsWith("canonical_update_in_review:")
        ? reason.slice("canonical_update_in_review:".length)
        : reason;
    if (key.startsWith(`${INCENTIVI_GOV_OPENDATA.sourceSystem}:`)) {
      selectedKeys.add(key);
    }
  }

  const selected: NormalizedExternalOpportunity[] = [];
  for (const doc of payload.response?.docs ?? []) {
    try {
      const mapped = mapIncentiviGovDoc(doc, { now: options?.now });
      if (!selectedKeys.has(mapped.naturalKey)) continue;
      selected.push(mapped);
      if (
        selected.length >= (options?.pilotMax ?? INCENTIVI_GOV_OPENDATA.pilotMax)
      ) {
        break;
      }
    } catch {
      /* already rejected in dry-run */
    }
  }
  return { dryRun, selected };
}

async function loadExistingFingerprints(
  supabase: SupabaseClient,
): Promise<Map<string, ExistingOpportunityFingerprint>> {
  const { data, error } = await supabase
    .from("opportunity_sources")
    .select("external_identifier, reference_text, status")
    .eq("status", "active")
    .like("external_identifier", "incentivi-gov:%");
  if (error) throw new Error(`load existing sources: ${error.message}`);

  const map = new Map<string, ExistingOpportunityFingerprint>();
  for (const row of data ?? []) {
    const key = row.external_identifier as string;
    if (!key) continue;
    map.set(key, {
      naturalKey: key,
      checksumSha256: parseChecksum(row.reference_text as string | null),
    });
  }
  return map;
}

async function upsertOpportunity(
  supabase: SupabaseClient,
  row: NormalizedExternalOpportunity,
  retrievedAt: string,
  existing: Map<string, ExistingOpportunityFingerprint>,
): Promise<"inserted" | "updated" | "unchanged"> {
  const prev = existing.get(row.naturalKey);
  if (prev && prev.checksumSha256 === row.checksumSha256) {
    return "unchanged";
  }

  const { data: sourceHit, error: sourceLookupError } = await supabase
    .from("opportunity_sources")
    .select("id, opportunity_id")
    .eq("external_identifier", row.naturalKey)
    .eq("status", "active")
    .maybeSingle();
  if (sourceLookupError) {
    throw new Error(`source lookup ${row.naturalKey}: ${sourceLookupError.message}`);
  }

  if (!sourceHit) {
    const { data: opp, error: oppError } = await supabase
      .from("opportunities")
      .insert({
        title: row.title,
        summary: row.shortDescription,
        description: null,
        purpose: null,
        origin: row.origin,
        substantial_status: row.substantialStatus,
        representation_status: "censused",
        editorial_status: row.editorialStatus,
        publication_status: row.publicationStatus,
        visibility_level: row.visibilityLevel,
      })
      .select("id")
      .single();
    if (oppError || !opp) {
      throw new Error(`insert opportunity ${row.naturalKey}: ${oppError?.message}`);
    }

    const { error: srcError } = await supabase.from("opportunity_sources").insert({
      opportunity_id: opp.id,
      authority: row.issuingAuthority,
      url: row.officialUrl,
      external_identifier: row.naturalKey,
      reference_text: provenanceReference(row),
      status: "active",
      is_primary: true,
      information_relation: "primary",
      language_code: "it",
      version: row.sourceUpdatedAt ?? "source_updated_at_unavailable",
      consulted_at: retrievedAt,
    });
    if (srcError) {
      throw new Error(`insert source ${row.naturalKey}: ${srcError.message}`);
    }

    const { error: winError } = await supabase.from("opportunity_time_windows").insert({
      opportunity_id: opp.id,
      kind: "access",
      opens_at: row.openingDate,
      closes_at: row.openEnded ? null : row.deadline,
      open_ended: row.openEnded,
      note: `temporal_derived=${row.temporalAccessState}`,
      sort_order: 0,
    });
    if (winError) {
      throw new Error(`insert window ${row.naturalKey}: ${winError.message}`);
    }

    const labels = territoryLabels(row.regions);
    for (let i = 0; i < labels.length; i += 1) {
      const { error: terrError } = await supabase
        .from("opportunity_market_references")
        .insert({
          opportunity_id: opp.id,
          market_id: null,
          territory_label: labels[i],
          sort_order: i,
        });
      if (terrError) {
        throw new Error(
          `insert territory ${row.naturalKey}/${labels[i]}: ${terrError.message}`,
        );
      }
    }

    return "inserted";
  }

  const opportunityId = sourceHit.opportunity_id as string;

  // Never auto-publish on update; keep unpublished review path unless already published by humans.
  const { data: currentOpp, error: curErr } = await supabase
    .from("opportunities")
    .select("publication_status, editorial_status, visibility_level, summary, description, purpose")
    .eq("id", opportunityId)
    .single();
  if (curErr || !currentOpp) {
    throw new Error(`load opportunity ${row.naturalKey}: ${curErr?.message}`);
  }

  const { data: currentSrc, error: curSrcErr } = await supabase
    .from("opportunity_sources")
    .select("reference_text")
    .eq("id", sourceHit.id)
    .single();
  if (curSrcErr) {
    throw new Error(`load source text ${row.naturalKey}: ${curSrcErr.message}`);
  }

  const prevSummarySha = parseSourceSummarySha(
    currentSrc?.reference_text as string | null,
  );
  const currentSummarySha = checksumSha256(
    (currentOpp.summary as string | null) ?? "",
  );
  const summaryLooksSourceControlled =
    !currentOpp.description &&
    !currentOpp.purpose &&
    (prevSummarySha === "" || prevSummarySha === currentSummarySha);

  const keepPublished = currentOpp.publication_status === "published";
  const oppPatch: Record<string, unknown> = {
    title: row.title,
    substantial_status: row.substantialStatus,
  };
  if (summaryLooksSourceControlled) {
    oppPatch.summary = row.shortDescription;
  }
  if (
    !keepPublished &&
    (currentOpp.editorial_status === "draft" ||
      currentOpp.editorial_status === "in_review")
  ) {
    oppPatch.editorial_status = "in_review";
    oppPatch.publication_status = "unpublished";
    oppPatch.visibility_level = "private";
  }

  const { error: updOppError } = await supabase
    .from("opportunities")
    .update(oppPatch)
    .eq("id", opportunityId);
  if (updOppError) {
    throw new Error(`update opportunity ${row.naturalKey}: ${updOppError.message}`);
  }

  const { error: updSrcError } = await supabase
    .from("opportunity_sources")
    .update({
      authority: row.issuingAuthority,
      url: row.officialUrl,
      reference_text: provenanceReference(row),
      version: row.sourceUpdatedAt ?? "source_updated_at_unavailable",
      consulted_at: retrievedAt,
      is_primary: true,
      information_relation: "primary",
    })
    .eq("id", sourceHit.id);
  if (updSrcError) {
    throw new Error(`update source ${row.naturalKey}: ${updSrcError.message}`);
  }

  const { data: windows, error: winListError } = await supabase
    .from("opportunity_time_windows")
    .select("id, opens_at, closes_at, open_ended, superseded_at")
    .eq("opportunity_id", opportunityId)
    .eq("kind", "access")
    .is("superseded_at", null)
    .order("sort_order", { ascending: true });
  if (winListError) {
    throw new Error(`list windows ${row.naturalKey}: ${winListError.message}`);
  }

  const current = windows?.[0];
  const nextCloses = row.openEnded ? null : row.deadline;
  const changedWindow =
    !current ||
    (current.opens_at ?? null) !== (row.openingDate ?? null) ||
    (current.closes_at ?? null) !== (nextCloses ?? null) ||
    Boolean(current.open_ended) !== row.openEnded;

  if (changedWindow) {
    if (current) {
      const { error: supersedeError } = await supabase
        .from("opportunity_time_windows")
        .update({ superseded_at: retrievedAt })
        .eq("id", current.id);
      if (supersedeError) {
        throw new Error(
          `supersede window ${row.naturalKey}: ${supersedeError.message}`,
        );
      }
    }
    const { error: newWinError } = await supabase
      .from("opportunity_time_windows")
      .insert({
        opportunity_id: opportunityId,
        kind: "access",
        opens_at: row.openingDate,
        closes_at: nextCloses,
        open_ended: row.openEnded,
        note: `temporal_derived=${row.temporalAccessState}`,
        sort_order: 0,
      });
    if (newWinError) {
      throw new Error(`insert new window ${row.naturalKey}: ${newWinError.message}`);
    }
  }

  return "updated";
}

export async function runIncentiviGovIngest(
  mode: ApplyMode,
): Promise<ApplyResult> {
  const fetched = await fetchIncentiviGovOpenData({ rows: 1500 });
  const errors: string[] = [];

  let existing = new Map<string, ExistingOpportunityFingerprint>();
  if (mode === "apply") {
    const supabase = createIngestClient();
    existing = await loadExistingFingerprints(supabase);
  }

  const { dryRun, selected } = selectPilotOpportunities(fetched.payload, {
    now: new Date(),
    existing,
  });

  const result: ApplyResult = {
    mode,
    dryRun,
    selected,
    retrievedAt: fetched.retrievedAt,
    endpoint: fetched.url,
    autoPublish: false,
    errors,
  };

  if (mode === "dry-run") {
    const dir = join(
      process.cwd(),
      "artifacts",
      "ingestion",
      `dry-incentivi-gov-${new Date().toISOString().replace(/[:.]/g, "-")}`,
    );
    mkdirSync(dir, { recursive: true });
    const sidecarPath = join(dir, "manifest.json");
    writeFileSync(
      sidecarPath,
      JSON.stringify(
        {
          mode,
          dbWrites: 0,
          autoPublish: false,
          ...dryRun.counts,
          selected: selected.length,
          endpoint: fetched.url,
        },
        null,
        2,
      ),
      "utf8",
    );
    result.sidecarPath = sidecarPath;
    return result;
  }

  const supabase = createIngestClient();
  const db: ApplyDbCounts = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    publishedCount: 0,
    reviewOnlyCount: 0,
    duplicates: 0,
  };

  for (const row of selected) {
    try {
      const action = await upsertOpportunity(
        supabase,
        row,
        fetched.retrievedAt,
        existing,
      );
      if (action === "inserted") db.inserted += 1;
      else if (action === "updated") db.updated += 1;
      else db.unchanged += 1;
      existing.set(row.naturalKey, {
        naturalKey: row.naturalKey,
        checksumSha256: row.checksumSha256,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(message);
    }
  }

  const { data: pilotSources, error: pilotErr } = await supabase
    .from("opportunity_sources")
    .select(
      "external_identifier, opportunity_id, opportunities!inner(publication_status, editorial_status, visibility_level, deleted_at)",
    )
    .eq("status", "active")
    .like("external_identifier", "incentivi-gov:%");
  if (pilotErr) {
    errors.push(`post-count: ${pilotErr.message}`);
  } else {
    const ids = new Set<string>();
    for (const s of pilotSources ?? []) {
      const opp = s.opportunities as unknown as {
        publication_status: string;
        editorial_status: string;
        visibility_level: string;
        deleted_at: string | null;
      };
      if (opp.deleted_at) continue;
      const oid = s.opportunity_id as string;
      if (ids.has(oid)) {
        db.duplicates += 1;
        continue;
      }
      ids.add(oid);
      if (
        opp.publication_status === "unpublished" &&
        opp.editorial_status === "in_review" &&
        opp.visibility_level === "private"
      ) {
        db.reviewOnlyCount += 1;
      }
      if (opp.publication_status === "published") {
        db.publishedCount += 1;
      }
    }
  }

  const dir = join(
    process.cwd(),
    "artifacts",
    "ingestion",
    `apply-incentivi-gov-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  );
  mkdirSync(dir, { recursive: true });
  const sidecarPath = join(dir, "manifest.json");
  writeFileSync(
    sidecarPath,
    JSON.stringify(
      {
        mode,
        autoPublish: false,
        fetched: dryRun.counts.fetched,
        valid: dryRun.counts.valid,
        rejected: dryRun.counts.rejected,
        selected: selected.length,
        db,
        naturalKeys: selected.map((s) => s.naturalKey),
        endpoint: fetched.url,
        retrievedAt: fetched.retrievedAt,
        errors,
      },
      null,
      2,
    ),
    "utf8",
  );
  result.sidecarPath = sidecarPath;
  result.db = db;
  result.errors = errors;
  return result;
}
