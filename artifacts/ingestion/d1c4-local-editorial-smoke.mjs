/**
 * D1-C.4 local editorial + refresh smoke (service_role for axis updates;
 * mirrors canonical lifecycle mapping used by redazione UI).
 *
 * Local-only: requires SUPABASE_SERVICE_ROLE_KEY and
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * Refuses non-localhost URLs. Never logs key values.
 */
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
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

function isLocalUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

function requireLocalConfig() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!service) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it for local Supabase (e.g. via .env.local or `supabase status -o env`).",
    );
    process.exit(1);
  }
  if (!anon) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY). Set it for local Supabase.",
    );
    process.exit(1);
  }
  if (!isLocalUrl(url)) {
    console.error(
      `Refusing non-local Supabase URL (host must be localhost or 127.0.0.1). Got host: ${(() => {
        try {
          return new URL(url).hostname;
        } catch {
          return "(unparseable)";
        }
      })()}`,
    );
    process.exit(1);
  }

  return { url, service, anon };
}

const {
  url: supabaseUrl,
  service: serviceKey,
  anon: anonKey,
} = requireLocalConfig();

const sb = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parseNk(note) {
  return /natural_key=(worldbank:[^\s|]+)/i.exec(note ?? "")?.[1] ?? null;
}

const { data: rows, error } = await sb
  .from("international_market_support_resources")
  .select(
    "id, market_id, contact_note, visibility_status, verification_status, summary, international_markets!inner(code)",
  )
  .ilike("contact_note", "%natural_key=worldbank:%")
  .order("name");
if (error) throw error;

// Classification: publish 13 READY; 1 QUESTIONABLE (DE trade); 1 REJECT (FR trade) — quality demo of selective publish
const rejectNk = "worldbank:NE.TRD.GNFS.ZS:FR:2024";
const questionableNk = "worldbank:NE.TRD.GNFS.ZS:DE:2024";

const markets = new Set();
let published = 0;
let questionable = 0;
let rejected = 0;

for (const row of rows) {
  const nk = parseNk(row.contact_note);
  if (nk === rejectNk) {
    const { error: e } = await sb
      .from("international_market_support_resources")
      .update({
        verification_status: "rejected",
        visibility_status: "editorial",
        substantial_status: "archived",
      })
      .eq("id", row.id);
    if (e) throw e;
    rejected += 1;
    continue;
  }
  if (nk === questionableNk) {
    const { error: e } = await sb
      .from("international_market_support_resources")
      .update({
        verification_status: "in_review",
        visibility_status: "editorial",
        substantial_status: "signaled",
      })
      .eq("id", row.id);
    if (e) throw e;
    questionable += 1;
    continue;
  }
  markets.add(row.market_id);
  const { error: e } = await sb
    .from("international_market_support_resources")
    .update({
      verification_status: "confirmed",
      visibility_status: "public",
      substantial_status: "active",
    })
    .eq("id", row.id);
  if (e) throw e;
  published += 1;
}

for (const marketId of markets) {
  const { error: e } = await sb
    .from("international_markets")
    .update({ editorial_status: "published", substantial_status: "active" })
    .eq("id", marketId);
  if (e) throw e;
}

const { data: anonRes } = await anon
  .from("international_market_support_resources")
  .select("id, contact_note, visibility_status")
  .ilike("contact_note", "%natural_key=worldbank:%");
const anonPublic = (anonRes ?? []).filter((r) => r.visibility_status === "public");
const anonSeesReject = (anonRes ?? []).some(
  (r) => parseNk(r.contact_note) === rejectNk,
);
const anonSeesQ = (anonRes ?? []).some(
  (r) => parseNk(r.contact_note) === questionableNk,
);

console.log(
  JSON.stringify(
    {
      published,
      questionable,
      rejected,
      marketsPublished: markets.size,
      anonPublicCount: anonPublic.length,
      anonSeesReject,
      anonSeesQuestionable: anonSeesQ,
    },
    null,
    2,
  ),
);

// Controlled refresh
const refresh = spawnSync(
  "npx",
  ["tsx", "scripts/external-data/ingest-worldbank-indicators.ts", "apply"],
  {
    encoding: "utf8",
    shell: true,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: supabaseUrl },
    cwd: process.cwd(),
  },
);
console.log("refresh_exit", refresh.status);
const out = `${refresh.stdout}\n${refresh.stderr}`;
const m = out.match(/inserted[=:]?\s*(\d+)|unchanged[=:]?\s*(\d+)|updated[=:]?\s*(\d+)/gi);
console.log("refresh_snippets", m?.slice(0, 12) ?? out.slice(-800));

const { data: after } = await sb
  .from("international_market_support_resources")
  .select("contact_note, visibility_status, verification_status")
  .ilike("contact_note", "%natural_key=worldbank:%");
const readyStillPublic = (after ?? []).filter(
  (r) =>
    r.visibility_status === "public" && r.verification_status === "confirmed",
).length;
const qStill = (after ?? []).filter(
  (r) => parseNk(r.contact_note) === questionableNk,
)[0];
const rStill = (after ?? []).filter(
  (r) => parseNk(r.contact_note) === rejectNk,
)[0];
console.log(
  JSON.stringify(
    {
      afterReadyPublic: readyStillPublic,
      questionableAxes: {
        v: qStill?.visibility_status,
        ver: qStill?.verification_status,
      },
      rejectAxes: {
        v: rStill?.visibility_status,
        ver: rStill?.verification_status,
      },
    },
    null,
    2,
  ),
);

if (published !== 13 || questionable !== 1 || rejected !== 1) {
  throw new Error("unexpected classification counts");
}
if (anonPublic.length !== 13 || anonSeesReject || anonSeesQ) {
  throw new Error("anon visibility failed");
}
if (readyStillPublic !== 13) {
  throw new Error("refresh destroyed READY publish");
}
if (
  qStill?.visibility_status !== "editorial" ||
  qStill?.verification_status !== "in_review"
) {
  throw new Error("QUESTIONABLE not preserved");
}
if (
  rStill?.verification_status !== "rejected" ||
  rStill?.visibility_status === "public"
) {
  throw new Error("REJECT not preserved");
}
if (refresh.status !== 0) throw new Error("refresh apply failed");
console.log("LOCAL_SMOKE_PASS");
