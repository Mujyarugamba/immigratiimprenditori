/**
 * D1-B.2 Production review-only ingest harness.
 * Loads service_role via `supabase projects api-keys` (no key printed).
 *
 *   node artifacts/ingestion/d1b2-prod-ingest.mjs
 *   node artifacts/ingestion/d1b2-prod-ingest.mjs --apply --yes --project-ref hvfvfatlaspcpszgizhg
 */
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import {
  PRODUCTION_PROJECT_REF,
  parseGuardedCommand,
  productionUsage,
} from "./production-write-guard.mjs";

const REF = PRODUCTION_PROJECT_REF;
const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "D1-B.2 Production ingest",
  modes: null,
  writeModes: [],
  defaultMode: "dry-run",
});
if (command.help) {
  console.log(productionUsage({ script: "artifacts/ingestion/d1b2-prod-ingest.mjs" }));
  process.exit(0);
}
const mode = command.authorizedWrite ? "apply" : "dry-run";

function loadServiceRole() {
  const r = spawnSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
    { encoding: "utf8", shell: true },
  );
  if (r.status !== 0) {
    throw new Error(`api-keys failed: ${r.stderr || r.stdout}`);
  }
  const keys = JSON.parse(r.stdout);
  const svc = keys.find((k) => k.name === "service_role" && k.api_key);
  if (!svc?.api_key) throw new Error("service_role key not found");
  return svc.api_key;
}

const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${REF}.supabase.co`;
process.env.SUPABASE_SERVICE_ROLE_KEY = loadServiceRole();

try {
  const r = spawnSync(
    "npx",
    ["tsx", "scripts/external-data/ingest-incentivi-gov-opendata.ts", `--${mode === "apply" ? "apply" : "dry-run"}`],
    { encoding: "utf8", shell: true, env: process.env },
  );
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) process.exit(r.status ?? 1);

  if (mode === "apply") {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );
    const { data: sources, error } = await sb
      .from("opportunity_sources")
      .select(
        "external_identifier, url, authority, consulted_at, opportunities!inner(id, title, editorial_status, publication_status, visibility_level, origin)",
      )
      .eq("status", "active")
      .like("external_identifier", "incentivi-gov:%");
    if (error) throw error;
    const rows = sources ?? [];
    const ids = rows.map((r) => r.opportunities.id);
    const anonKeyProc = spawnSync(
      "npx",
      ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
      { encoding: "utf8", shell: true },
    );
    const anon = JSON.parse(anonKeyProc.stdout).find((k) => k.name === "anon")?.api_key;
    let publicVisible = null;
    if (anon && ids.length) {
      const pub = createClient(`https://${REF}.supabase.co`, anon, {
        auth: { persistSession: false },
      });
      const { count } = await pub
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .in("id", ids);
      publicVisible = count;
    }
    console.log(
      JSON.stringify(
        {
          postValidate: {
            total: rows.length,
            reviewOnly: rows.filter(
              (r) =>
                r.opportunities.editorial_status === "in_review" &&
                r.opportunities.publication_status === "unpublished" &&
                r.opportunities.visibility_level === "private",
            ).length,
            published: rows.filter(
              (r) => r.opportunities.publication_status === "published",
            ).length,
            missingUrl: rows.filter((r) => !String(r.url || "").startsWith("http"))
              .length,
            uniqueKeys: new Set(rows.map((r) => r.external_identifier)).size,
            publicVisibleImported: publicVisible,
          },
        },
        null,
        2,
      ),
    );
  }
} finally {
  if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
  else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
  else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
}
