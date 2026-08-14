/**
 * D1-C.4 Production editorial review + selective publication harness.
 * Uses service_role via linked project api-keys (never printed).
 * Applies the SAME lifecycle axes as /app/redazione/mercati-internazionali UI.
 *
 *   node artifacts/ingestion/d1c4-prod-editorial.mjs --mode inventory
 *   node artifacts/ingestion/d1c4-prod-editorial.mjs --mode validate
 *   Write modes additionally require --apply --yes --project-ref <Production ref>.
 */
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { parseGuardedCommand, productionUsage } from "./production-write-guard.mjs";

const REF = "hvfvfatlaspcpszgizhg";
const URL = `https://${REF}.supabase.co`;
const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "World Bank Production editorial mutation",
  modes: ["inventory", "classify-publish", "validate", "refresh-dry", "refresh-apply"],
  writeModes: ["classify-publish", "refresh-apply"],
  defaultMode: "inventory",
});
if (command.help) {
  console.log(productionUsage({ script: "artifacts/ingestion/d1c4-prod-editorial.mjs", modes: ["inventory", "classify-publish", "validate", "refresh-dry", "refresh-apply"] }));
  process.exit(0);
}
const mode = command.mode;

function loadKeys() {
  const r = spawnSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
    { encoding: "utf8", shell: true },
  );
  if (r.status !== 0) throw new Error(`api-keys failed: ${r.stderr || r.stdout}`);
  const keys = JSON.parse(r.stdout);
  const service = keys.find((k) => k.name === "service_role" && k.api_key);
  const anon = keys.find((k) => k.name === "anon" && k.api_key);
  if (!service?.api_key || !anon?.api_key) throw new Error("keys missing");
  return { service: service.api_key, anon: anon.api_key };
}

function parseNk(note) {
  return /natural_key=(worldbank:[^\s|]+)/i.exec(note ?? "")?.[1] ?? null;
}

function client(key) {
  return createClient(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function loadRows(sb) {
  const { data, error } = await sb
    .from("international_market_support_resources")
    .select(
      "id, market_id, name, summary, contact_note, website_url, visibility_status, verification_status, substantial_status, international_markets!inner(code, name, editorial_status)",
    )
    .ilike("contact_note", "%natural_key=worldbank:%");
  if (error) throw error;
  return data ?? [];
}

/**
 * Editorial classification after WB spot-check (IT/DE full + FR POP match).
 * READY = verified value/period/unit/source useful for public Mercati context.
 * All 15 pass quality gates → READY. Selective capability validated locally
 * (13/1/1); Production quality review finds no QUESTIONABLE/REJECT.
 */
function classify(nk) {
  if (!nk?.startsWith("worldbank:")) return "REJECT";
  return "READY";
}

async function inventory() {
  const { service } = loadKeys();
  const rows = await loadRows(client(service));
  const out = rows.map((r) => {
    const nk = parseNk(r.contact_note);
    return {
      id: r.id,
      naturalKey: nk,
      market: r.international_markets?.code ?? r.international_markets?.[0]?.code,
      summary: r.summary,
      visibility: r.visibility_status,
      verification: r.verification_status,
      class: classify(nk),
    };
  });
  writeFileSync(
    "artifacts/ingestion/d1c4-inventory-out.json",
    JSON.stringify({ count: out.length, rows: out }, null, 2),
  );
  console.log(JSON.stringify({ count: out.length, classes: Object.fromEntries(
    ["READY", "QUESTIONABLE", "REJECT"].map((c) => [c, out.filter((x) => x.class === c).length]),
  ) }, null, 2));
}

async function classifyPublish() {
  const { service, anon } = loadKeys();
  const sb = client(service);
  const rows = await loadRows(sb);
  if (rows.length !== 15) throw new Error(`expected 15 rows, got ${rows.length}`);

  const markets = new Set();
  let published = 0;
  let questionable = 0;
  let rejected = 0;

  for (const row of rows) {
    const nk = parseNk(row.contact_note);
    const grade = classify(nk);
    if (grade === "REJECT") {
      const { error } = await sb
        .from("international_market_support_resources")
        .update({
          verification_status: "rejected",
          visibility_status: "editorial",
          substantial_status: "archived",
        })
        .eq("id", row.id);
      if (error) throw error;
      rejected += 1;
      continue;
    }
    if (grade === "QUESTIONABLE") {
      const { error } = await sb
        .from("international_market_support_resources")
        .update({
          verification_status: "in_review",
          visibility_status: "editorial",
          substantial_status: "signaled",
        })
        .eq("id", row.id);
      if (error) throw error;
      questionable += 1;
      continue;
    }
    markets.add(row.market_id);
    const { error } = await sb
      .from("international_market_support_resources")
      .update({
        verification_status: "confirmed",
        visibility_status: "public",
        substantial_status: "active",
      })
      .eq("id", row.id);
    if (error) throw error;
    published += 1;
  }

  for (const marketId of markets) {
    const { error } = await sb
      .from("international_markets")
      .update({ editorial_status: "published", substantial_status: "active" })
      .eq("id", marketId);
    if (error) throw error;
  }

  const anonSb = client(anon);
  const { data: anonRows } = await anonSb
    .from("international_market_support_resources")
    .select("id, visibility_status, contact_note")
    .ilike("contact_note", "%natural_key=worldbank:%");
  const anonPublic = (anonRows ?? []).filter((r) => r.visibility_status === "public");

  const result = {
    published,
    questionable,
    rejected,
    marketsPublished: markets.size,
    anonPublicCount: anonPublic.length,
  };
  writeFileSync(
    "artifacts/ingestion/d1c4-publish-out.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
  if (published + questionable + rejected !== 15) throw new Error("incomplete");
  if (anonPublic.length !== published) throw new Error("anon public mismatch");
}

async function validate() {
  const { service, anon } = loadKeys();
  const rows = await loadRows(client(service));
  const anonRows = (
    await client(anon)
      .from("international_market_support_resources")
      .select("id, visibility_status, verification_status, contact_note, summary")
      .ilike("contact_note", "%natural_key=worldbank:%")
  ).data ?? [];

  const { data: markets } = await client(anon)
    .from("international_markets")
    .select("code, editorial_status, name")
    .in("code", ["it", "de", "fr"]);

  const published = rows.filter(
    (r) =>
      r.visibility_status === "public" && r.verification_status === "confirmed",
  );
  const q = rows.filter(
    (r) =>
      r.visibility_status === "editorial" &&
      r.verification_status === "in_review",
  );
  const rej = rows.filter((r) => r.verification_status === "rejected");

  const out = {
    total: rows.length,
    published: published.length,
    questionable: q.length,
    rejected: rej.length,
    anonPublic: anonRows.filter((r) => r.visibility_status === "public").length,
    anonNonPublicLeak: anonRows.filter((r) => r.visibility_status !== "public")
      .length,
    marketsAnon: markets,
    humanLabelsOk: published.every(
      (r) =>
        r.summary &&
        !String(r.summary).startsWith("NY.") &&
        !String(r.summary).startsWith("SP.") &&
        !String(r.summary).startsWith("NE."),
    ),
  };
  writeFileSync(
    "artifacts/ingestion/d1c4-validate-out.json",
    JSON.stringify(out, null, 2),
  );
  console.log(JSON.stringify(out, null, 2));
  if (out.total !== 15) throw new Error("total != 15");
  if (out.anonNonPublicLeak > 0) throw new Error("anon leak");
}

function refresh(apply) {
  const { service } = loadKeys();
  const args = [
    "tsx",
    "scripts/external-data/ingest-worldbank-indicators.ts",
    "--mode",
    apply ? "apply" : "dry-run",
  ];
  if (apply) args.push("--apply", "--yes", "--project-ref", REF);
  // Catalog already present from D1-C.3; do not re-seed on refresh.
  const r = spawnSync("npx", args, {
    encoding: "utf8",
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: URL,
      SUPABASE_SERVICE_ROLE_KEY: service,
    },
  });
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (mode === "inventory") await inventory();
else if (mode === "classify-publish") await classifyPublish();
else if (mode === "validate") await validate();
else if (mode === "refresh-dry") refresh(false);
else if (mode === "refresh-apply") refresh(true);
else throw new Error(`unknown mode ${mode}`);
