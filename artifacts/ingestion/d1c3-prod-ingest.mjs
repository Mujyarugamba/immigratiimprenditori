/**
 * D1-C.3 Production review-only World Bank ingest harness.
 * Loads service_role via `supabase projects api-keys` (no key printed).
 *
 *   node artifacts/ingestion/d1c3-prod-ingest.mjs dry-run
 *   node artifacts/ingestion/d1c3-prod-ingest.mjs apply
 *   node artifacts/ingestion/d1c3-prod-ingest.mjs validate
 */
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const REF = "hvfvfatlaspcpszgizhg";
const modeArg = process.argv[2] ?? "dry-run";
const mode =
  modeArg === "apply"
    ? "apply"
    : modeArg === "validate"
      ? "validate"
      : "dry-run";

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
  if (!anon?.api_key) throw new Error("anon key not found");
  return { service: service.api_key, anon: anon.api_key };
}

function parseNaturalKey(contactNote) {
  const m = /natural_key=(worldbank:[^\s|]+)/i.exec(contactNote ?? "");
  return m?.[1] ?? null;
}

async function validate(url, serviceKey, anonKey) {
  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb
    .from("international_market_support_resources")
    .select(
      "id, name, summary, website_url, contact_note, territorial_scope_note, visibility_status, verification_status, substantial_status, market_id, international_markets!inner(code, name, editorial_status)",
    )
    .ilike("contact_note", "%natural_key=worldbank:%");
  if (error) throw new Error(`validate load: ${error.message}`);

  const rows = data ?? [];
  const keys = new Map();
  let reviewOnly = 0;
  let publicVis = 0;
  let confirmed = 0;
  const countries = new Set();
  const indicators = new Set();
  let provenanceOk = 0;
  for (const row of rows) {
    const nk = parseNaturalKey(row.contact_note);
    if (nk) keys.set(nk, (keys.get(nk) ?? 0) + 1);
    if (
      row.visibility_status === "editorial" &&
      row.verification_status === "in_review" &&
      row.substantial_status === "signaled"
    ) {
      reviewOnly += 1;
    }
    if (row.visibility_status === "public") publicVis += 1;
    if (row.verification_status === "confirmed") confirmed += 1;
    const note = String(row.contact_note ?? "");
    if (
      note.includes("natural_key=") &&
      note.includes("source=worldbank-indicators") &&
      note.includes("license=CC BY 4.0") &&
      note.includes("attribution=World Bank") &&
      note.includes("checksum=") &&
      note.includes("retrieved_at=") &&
      note.includes("api=")
    ) {
      provenanceOk += 1;
    }
    const m = /worldbank:([^:]+):([A-Z]{2}):(\d{4})/.exec(nk ?? "");
    if (m) {
      indicators.add(m[1]);
      countries.add(m[2]);
    }
  }
  const duplicates = [...keys.values()].filter((n) => n > 1).length;

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { count: anonMarkets } = await anon
    .from("international_markets")
    .select("id", { count: "exact", head: true })
    .in("code", ["it", "de", "fr"]);
  const { count: anonResources } = await anon
    .from("international_market_support_resources")
    .select("id", { count: "exact", head: true })
    .ilike("contact_note", "%natural_key=worldbank:%");

  const { data: catalog } = await sb
    .from("international_markets")
    .select("code, editorial_status, international_market_countries(country_ref)")
    .in("code", ["it", "de", "fr"]);

  console.log(
    JSON.stringify(
      {
        postValidate: {
          totalWb: rows.length,
          uniqueKeys: keys.size,
          duplicates,
          reviewOnly,
          publicVis,
          confirmed,
          provenanceOk,
          countries: [...countries].sort(),
          indicators: [...indicators].sort(),
          catalog: (catalog ?? []).map((c) => ({
            code: c.code,
            editorial_status: c.editorial_status,
            country_refs: (c.international_market_countries ?? []).map(
              (x) => x.country_ref,
            ),
          })),
          anonPilotMarketsVisible: anonMarkets ?? 0,
          anonWbResourcesVisible: anonResources ?? 0,
        },
      },
      null,
      2,
    ),
  );

  if (rows.length !== 15) throw new Error(`expected 15 WB rows, got ${rows.length}`);
  if (keys.size !== 15) throw new Error(`expected 15 unique keys, got ${keys.size}`);
  if (duplicates !== 0) throw new Error("duplicates present");
  if (reviewOnly !== 15) throw new Error(`reviewOnly=${reviewOnly}`);
  if (publicVis !== 0 || confirmed !== 0) {
    throw new Error("BLOCKING: public/confirmed present");
  }
  if (provenanceOk !== 15) throw new Error(`provenanceOk=${provenanceOk}`);
  if ((anonMarkets ?? 0) !== 0 || (anonResources ?? 0) !== 0) {
    throw new Error("BLOCKING: anon can see pilot");
  }
}

const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const keys = loadKeys();
process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${REF}.supabase.co`;
process.env.SUPABASE_SERVICE_ROLE_KEY = keys.service;

try {
  if (mode === "validate") {
    await validate(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      keys.anon,
    );
  } else {
    const args = [
      "tsx",
      "scripts/external-data/ingest-worldbank-indicators.ts",
      mode === "apply" ? "--apply" : "--dry-run",
      "--allow-production",
    ];
    // Catalog seed only on apply (drafting IT/DE/FR). Never seed during dry-run.
    if (mode === "apply") args.push("--ensure-local-catalog");
    const r = spawnSync("npx", args, {
      encoding: "utf8",
      shell: true,
      env: process.env,
    });
    process.stdout.write(r.stdout || "");
    process.stderr.write(r.stderr || "");
    if (r.status !== 0) process.exit(r.status ?? 1);

    if (mode === "apply") {
      await validate(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        keys.anon,
      );
    }
  }
} finally {
  if (prevUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
  else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
  else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
}
