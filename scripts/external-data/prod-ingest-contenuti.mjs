/**
 * D1-D.3 Production harness — Contenti metadata/link-only review-only pilot.
 * Loads service_role via `supabase projects api-keys` (never prints keys).
 *
 *   node scripts/external-data/prod-ingest-contenuti.mjs dry-run
 *   node scripts/external-data/prod-ingest-contenuti.mjs apply
 *   node scripts/external-data/prod-ingest-contenuti.mjs verify
 */

import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const REF = "hvfvfatlaspcpszgizhg";
const modeArg = process.argv[2] ?? "dry-run";
const mode =
  modeArg === "apply" ? "apply" : modeArg === "verify" ? "verify" : "dry-run";

function loadKeys() {
  const r = spawnSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
    { encoding: "utf8", shell: true },
  );
  if (r.status !== 0) {
    throw new Error(`api-keys failed: ${r.stderr || r.stdout}`);
  }
  const keys = JSON.parse(r.stdout);
  const service = keys.find((k) => k.name === "service_role" && k.api_key);
  const anon = keys.find((k) => k.name === "anon" && k.api_key);
  if (!service?.api_key) throw new Error("service_role key not found");
  return { service: service.api_key, anon: anon?.api_key ?? null };
}

function withProdEnv(fn) {
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { service, anon } = loadKeys();
  process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${REF}.supabase.co`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = service;
  try {
    return fn({ anon });
  } finally {
    if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
    else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
    else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
}

async function verify({ anon }) {
  const url = `https://${REF}.supabase.co`;
  const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await sb
    .from("contents")
    .select(
      "id, title, source_url, source_label, body, editorial_status, publication_status, visibility_status, published_at, owned_by_editorial, type_code, primary_category_code, cover_url",
    )
    .eq("owned_by_editorial", true)
    .like("body", "%d1d_natural_key:%");
  if (error) throw error;

  const rows = data ?? [];
  const perSource = {};
  const naturalKeys = [];
  let reviewOnly = 0;
  let publicCount = 0;
  let publishedAtSet = 0;
  let fullTextSuspect = 0;
  let coverSet = 0;
  const seen = new Set();
  let duplicates = 0;

  for (const row of rows) {
    const m = /d1d_natural_key:\s*(\S+)/.exec(row.body ?? "");
    const key = m?.[1] ?? "";
    if (!key) continue;
    if (seen.has(key)) duplicates += 1;
    else seen.add(key);
    naturalKeys.push(key);
    const source = key.split(":")[0] ?? "unknown";
    perSource[source] = (perSource[source] ?? 0) + 1;
    if (
      row.editorial_status === "draft" &&
      row.publication_status === "unpublished" &&
      row.visibility_status === "private" &&
      row.published_at == null
    ) {
      reviewOnly += 1;
    }
    if (
      row.publication_status === "published" &&
      row.visibility_status === "public"
    ) {
      publicCount += 1;
    }
    if (row.published_at != null) publishedAtSet += 1;
    if (row.cover_url) coverSet += 1;
    if ((row.body ?? "").length > 4000 && !/d1d_acquisition_mode/.test(row.body)) {
      fullTextSuspect += 1;
    }
  }

  let anonVisible = null;
  if (anon && rows.length) {
    const pub = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const ids = rows.map((r) => r.id);
    const { count, error: anonErr } = await pub
      .from("contents")
      .select("id", { count: "exact", head: true })
      .in("id", ids);
    if (anonErr) throw anonErr;
    anonVisible = count;
  }

  const out = {
    targetUrl: url,
    total: rows.length,
    perSource,
    reviewOnly,
    publicCount,
    publishedAtSet,
    scheduledCount: 0,
    duplicates,
    coverSet,
    fullTextSuspect,
    anonVisiblePilotIds: anonVisible,
    sample: rows.slice(0, 5).map((r) => ({
      title: r.title,
      source_url: r.source_url,
      editorial_status: r.editorial_status,
      publication_status: r.publication_status,
      visibility_status: r.visibility_status,
    })),
    naturalKeys,
  };
  console.log(JSON.stringify(out, null, 2));
  if (
    publicCount > 0 ||
    publishedAtSet > 0 ||
    duplicates > 0 ||
    (anonVisible ?? 0) > 0
  ) {
    process.exit(1);
  }
}

await withProdEnv(async ({ anon }) => {
  if (mode === "verify") {
    await verify({ anon });
    return;
  }

  const flag = mode === "apply" ? "--apply" : "--dry-run";
  const r = spawnSync(
    "npx",
    [
      "tsx",
      "scripts/external-data/ingest-contenuti-pilot.ts",
      flag,
      "--allow-production",
    ],
    { encoding: "utf8", shell: true, env: process.env },
  );
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) process.exit(r.status ?? 1);

  if (mode === "apply") {
    await verify({ anon });
  }
});
