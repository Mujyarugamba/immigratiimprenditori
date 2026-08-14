/**
 * D1-B.3 — Importer refresh regression against Production editorial state.
 * Snapshots → apply → re-snapshot. Never prints secrets.
 *
 *   node artifacts/ingestion/d1b3-importer-regression.mjs --apply --yes --project-ref hvfvfatlaspcpszgizhg
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  PRODUCTION_PROJECT_REF,
  parseGuardedCommand,
  productionUsage,
} from "./production-write-guard.mjs";

const REF = PRODUCTION_PROJECT_REF;
const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "D1-B.3 importer regression apply",
  modes: null,
  writeModes: [],
});
if (command.help) {
  console.log(productionUsage({ script: "artifacts/ingestion/d1b3-importer-regression.mjs" }));
  process.exit(0);
}
if (!command.authorizedWrite) {
  throw new Error("REFUSED: importer regression has no dry-run; pass the complete Production authorization");
}

function loadServiceRole() {
  const r = spawnSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
    { encoding: "utf8", shell: true },
  );
  if (r.status !== 0) throw new Error(`api-keys failed: ${r.stderr || r.stdout}`);
  const keys = JSON.parse(r.stdout);
  const svc = keys.find((k) => k.name === "service_role" && k.api_key);
  if (!svc?.api_key) throw new Error("service_role key not found");
  return svc.api_key;
}

async function snapshot(sb) {
  const { data, error } = await sb
    .from("opportunity_sources")
    .select(
      `external_identifier, url, authority, reference_text,
       opportunities!inner(id, title, summary, purpose, description, editorial_status, publication_status, visibility_level, platform_published_at)`,
    )
    .eq("status", "active")
    .like("external_identifier", "incentivi-gov:%")
    .order("external_identifier");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    externalId: r.external_identifier,
    id: r.opportunities.id,
    title: r.opportunities.title,
    summary: r.opportunities.summary,
    purpose: r.opportunities.purpose,
    description: r.opportunities.description,
    editorial: r.opportunities.editorial_status,
    publication: r.opportunities.publication_status,
    visibility: r.opportunities.visibility_level,
    publishedAt: r.opportunities.platform_published_at,
    url: r.url,
    authority: r.authority,
    hasSummarySha: /source_summary_sha=[a-f0-9]{64}/i.test(r.reference_text || ""),
  }));
}

const key = loadServiceRole();
const sb = createClient(`https://${REF}.supabase.co`, key, {
  auth: { persistSession: false },
});

const before = await snapshot(sb);

const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${REF}.supabase.co`;
process.env.SUPABASE_SERVICE_ROLE_KEY = key;

let applyOut = "";
try {
  const r = spawnSync(
    "npx",
    ["tsx", "scripts/external-data/ingest-incentivi-gov-opendata.ts", "--apply"],
    { encoding: "utf8", shell: true, env: process.env },
  );
  applyOut = r.stdout || "";
  if (r.status !== 0) {
    throw new Error(`apply failed: ${r.stderr || r.stdout}`);
  }
} finally {
  if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
  else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
  else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
}

const after = await snapshot(sb);
const beforeBy = new Map(before.map((r) => [r.externalId, r]));
const afterBy = new Map(after.map((r) => [r.externalId, r]));

const comparisons = [];
for (const ext of beforeBy.keys()) {
  const b = beforeBy.get(ext);
  const a = afterBy.get(ext);
  comparisons.push({
    externalId: ext,
    idStable: a?.id === b.id,
    summaryPreserved: a?.summary === b.summary,
    purposePreserved: a?.purpose === b.purpose,
    publicationPreserved: a?.publication === b.publication,
    editorialPreserved: a?.editorial === b.editorial,
    visibilityPreserved: a?.visibility === b.visibility,
    urlPreserved: a?.url === b.url,
    before: {
      editorial: b.editorial,
      publication: b.publication,
      summaryHead: (b.summary || "").slice(0, 60),
    },
    after: {
      editorial: a?.editorial,
      publication: a?.publication,
      summaryHead: (a?.summary || "").slice(0, 60),
    },
  });
}

const applyJson = (() => {
  try {
    return JSON.parse(applyOut);
  } catch {
    return { raw: applyOut.slice(0, 2000) };
  }
})();

const report = {
  beforeCount: before.length,
  afterCount: after.length,
  uniqueBefore: new Set(before.map((r) => r.externalId)).size,
  uniqueAfter: new Set(after.map((r) => r.externalId)).size,
  apply: {
    inserted: applyJson.inserted,
    updated: applyJson.updated,
    unchanged: applyJson.unchanged,
    publishedCount: applyJson.publishedCount,
    reviewOnlyCount: applyJson.reviewOnlyCount,
    duplicates: applyJson.duplicates,
    dbWrites: applyJson.dbWrites,
    errors: applyJson.errors,
  },
  gates: {
    noDuplicates: after.length === new Set(after.map((r) => r.externalId)).size,
    countStable: before.length === after.length && after.length === 20,
    allIdsStable: comparisons.every((c) => c.idStable),
    allSummariesPreserved: comparisons.every((c) => c.summaryPreserved),
    allPublicationPreserved: comparisons.every((c) => c.publicationPreserved),
    allEditorialPreserved: comparisons.every((c) => c.editorialPreserved),
    publishedStillPublic: after.filter((r) => r.publication === "published")
      .length,
    rejectedStillRejected: after.filter((r) => r.editorial === "rejected")
      .length,
    reviewOnlyStill: after.filter(
      (r) =>
        r.editorial === "in_review" &&
        r.publication === "unpublished" &&
        r.visibility === "private",
    ).length,
  },
  comparisons,
};

writeFileSync(
  "artifacts/ingestion/d1b3-importer-regression-out.json",
  JSON.stringify(report, null, 2),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      apply: report.apply,
      gates: report.gates,
      failures: comparisons.filter(
        (c) =>
          !c.idStable ||
          !c.summaryPreserved ||
          !c.publicationPreserved ||
          !c.editorialPreserved,
      ),
    },
    null,
    2,
  ),
);
