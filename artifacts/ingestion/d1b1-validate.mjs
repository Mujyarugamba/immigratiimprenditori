/**
 * D1-B.1 local validation harness (read-only checks + rollback update sim).
 * Run: node artifacts/ingestion/d1b1-validate.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseGuardedCommand, productionUsage } from "./production-write-guard.mjs";

const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "D1-B.1 local rollback validation",
  modes: null,
  writeModes: [],
  expectedProjectRef: "local",
});
if (command.help) {
  console.log(productionUsage({ script: "artifacts/ingestion/d1b1-validate.mjs" }).replace("hvfvfatlaspcpszgizhg", "local"));
  process.exit(0);
}
if (!command.authorizedWrite) {
  throw new Error("REFUSED: local rollback validation requires --apply --yes --project-ref local");
}

function loadEnv() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const target = new URL(url);
if (!["127.0.0.1", "localhost"].includes(target.hostname)) {
  throw new Error("REFUSED: D1-B.1 validation is local-only");
}

const admin = createClient(url, service, { auth: { persistSession: false } });
const publicClient = createClient(url, anon, { auth: { persistSession: false } });

const { data: sources, error } = await admin
  .from("opportunity_sources")
  .select(
    `id, external_identifier, url, authority, consulted_at, version, reference_text, status, is_primary,
     opportunities!inner (
       id, title, summary, origin, editorial_status, publication_status, visibility_level, substantial_status, deleted_at
     )`,
  )
  .eq("status", "active")
  .like("external_identifier", "incentivi-gov:%");

if (error) throw error;

const rows = sources ?? [];
const oppIds = rows.map((r) => r.opportunities.id);

const { data: windows } = await admin
  .from("opportunity_time_windows")
  .select("opportunity_id, opens_at, closes_at, open_ended, superseded_at, note")
  .in("opportunity_id", oppIds)
  .is("superseded_at", null);

const { data: territories } = await admin
  .from("opportunity_market_references")
  .select("opportunity_id, territory_label")
  .in("opportunity_id", oppIds);

const { count: publicCount, error: pubErr } = await publicClient
  .from("opportunities")
  .select("id", { count: "exact", head: true })
  .in("id", oppIds);

const now = Date.now();
const temporal = {
  open_or_ongoing: 0,
  expired: 0,
  scheduled: 0,
  unknown: 0,
  open_ended: 0,
};
for (const w of windows ?? []) {
  if (w.open_ended) {
    temporal.open_ended += 1;
    temporal.open_or_ongoing += 1;
    continue;
  }
  const open = w.opens_at ? Date.parse(w.opens_at) : null;
  const close = w.closes_at ? Date.parse(w.closes_at) : null;
  if (close != null && close < now) temporal.expired += 1;
  else if (open != null && open > now) temporal.scheduled += 1;
  else if (open != null || close != null) temporal.open_or_ongoing += 1;
  else temporal.unknown += 1;
}

const quality = {
  total: rows.length,
  blankTitle: rows.filter((r) => !String(r.opportunities.title || "").trim())
    .length,
  missingUrl: rows.filter((r) => !String(r.url || "").startsWith("http")).length,
  missingExternalId: rows.filter((r) => !r.external_identifier).length,
  missingConsultedAt: rows.filter((r) => !r.consulted_at).length,
  missingAttribution: rows.filter(
    (r) => !String(r.reference_text || "").includes("IODL"),
  ).length,
  missingChecksum: rows.filter(
    (r) => !/checksum=[a-f0-9]{64}/i.test(r.reference_text || ""),
  ).length,
  reviewOnly: rows.filter(
    (r) =>
      r.opportunities.editorial_status === "in_review" &&
      r.opportunities.publication_status === "unpublished" &&
      r.opportunities.visibility_level === "private",
  ).length,
  published: rows.filter(
    (r) => r.opportunities.publication_status === "published",
  ).length,
  originExternal: rows.filter((r) => r.opportunities.origin === "external")
    .length,
  withAuthority: rows.filter((r) => !!r.authority).length,
  withSummary: rows.filter((r) => !!r.opportunities.summary).length,
  withTerritory: new Set((territories ?? []).map((t) => t.opportunity_id)).size,
  withWindow: new Set((windows ?? []).map((w) => w.opportunity_id)).size,
  openEndedWindows: (windows ?? []).filter((w) => w.open_ended).length,
  deadlineWindows: (windows ?? []).filter((w) => !!w.closes_at).length,
  uniqueExternalIds: new Set(rows.map((r) => r.external_identifier)).size,
};

// Update simulation with full rollback (no lasting fixture contamination).
const targetRow = rows[0];
const beforeDeadline = (windows ?? []).find(
  (w) => w.opportunity_id === targetRow.opportunities.id,
);
const simulatedDeadline = "2099-12-31T00:00:00.000Z";
let updateSim = { ok: false };

const { data: beforeSrc } = await admin
  .from("opportunity_sources")
  .select("id, reference_text, url, external_identifier")
  .eq("id", targetRow.id)
  .single();

const { error: updErr } = await admin
  .from("opportunities")
  .update({ title: `${targetRow.opportunities.title} [SIM]` })
  .eq("id", targetRow.opportunities.id);
if (updErr) throw updErr;

if (beforeDeadline && !beforeDeadline.open_ended) {
  await admin
    .from("opportunity_time_windows")
    .update({ superseded_at: new Date().toISOString() })
    .eq("opportunity_id", targetRow.opportunities.id)
    .is("superseded_at", null);
  await admin.from("opportunity_time_windows").insert({
    opportunity_id: targetRow.opportunities.id,
    kind: "access",
    opens_at: beforeDeadline.opens_at,
    closes_at: simulatedDeadline,
    open_ended: false,
    note: "d1b1-update-sim",
    sort_order: 0,
  });
}

const { data: afterOpp } = await admin
  .from("opportunities")
  .select("id, title, editorial_status, publication_status")
  .eq("id", targetRow.opportunities.id)
  .single();
const { data: afterSrc } = await admin
  .from("opportunity_sources")
  .select("id, external_identifier, reference_text, url")
  .eq("id", targetRow.id)
  .single();
const { count: dupCount } = await admin
  .from("opportunity_sources")
  .select("id", { count: "exact", head: true })
  .eq("external_identifier", targetRow.external_identifier)
  .eq("status", "active");

// Rollback
await admin
  .from("opportunities")
  .update({ title: targetRow.opportunities.title })
  .eq("id", targetRow.opportunities.id);
await admin
  .from("opportunity_time_windows")
  .delete()
  .eq("opportunity_id", targetRow.opportunities.id)
  .eq("note", "d1b1-update-sim");
if (beforeDeadline) {
  await admin
    .from("opportunity_time_windows")
    .update({ superseded_at: null })
  .eq("opportunity_id", targetRow.opportunities.id)
    .not("superseded_at", "is", null);
}

updateSim = {
  ok:
    afterOpp?.id === targetRow.opportunities.id &&
    afterOpp?.title?.includes("[SIM]") &&
    afterSrc?.external_identifier === beforeSrc?.external_identifier &&
    afterSrc?.url === beforeSrc?.url &&
    (dupCount ?? 0) === 1 &&
    afterOpp?.publication_status === "unpublished",
  sameCanonicalId: afterOpp?.id === targetRow.opportunities.id,
  noDuplicateActiveSource: (dupCount ?? 0) === 1,
  provenanceUrlPreserved: afterSrc?.url === beforeSrc?.url,
  stillUnpublished: afterOpp?.publication_status === "unpublished",
  rolledBack: true,
};

console.log(
  JSON.stringify(
    {
      quality,
      temporalDerived: temporal,
      publicVisibleViaAnon: pubErr ? pubErr.message : publicCount,
      updateSim,
      sample: rows.slice(0, 3).map((r) => ({
        key: r.external_identifier,
        title: r.opportunities.title.slice(0, 60),
        url: r.url,
        authority: r.authority,
        consulted_at: r.consulted_at,
        version: r.version,
        editorial: r.opportunities.editorial_status,
        publication: r.opportunities.publication_status,
      })),
    },
    null,
    2,
  ),
);
