/**
 * Local-only P3 smoke: CTX→bootstrap→ACT→edit→revoke + B isolation.
 * Uses `supabase status -o env` (never remote .env.local). Cleans fixtures.
 */
import { execFileSync, execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUuids(ids) {
  for (const id of ids) {
    if (!UUID_RE.test(id)) throw new Error(`cleanup refused non-uuid: ${id}`);
  }
}

function localDbContainer() {
  const out = execSync("docker ps --format {{.Names}}", { encoding: "utf8" });
  const name = out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .find((n) => n.startsWith("supabase_db_"));
  if (!name) throw new Error("local supabase_db_* container not running");
  return name;
}

/** Owner-level cleanup: service_role lacks table DML GRANTs (RPC-only by design). */
function cleanupFixturesSql({ users, businesses, memberships }) {
  assertUuids([...users, ...businesses, ...memberships]);
  const u = users.map((id) => `'${id}'`).join(",");
  const b = businesses.map((id) => `'${id}'`).join(",");
  const m = memberships.map((id) => `'${id}'`).join(",");
  const sql = [
    m
      ? `DELETE FROM public.business_membership_management_authorizations WHERE membership_id IN (${m});`
      : "",
    m || b || u
      ? `DELETE FROM public.business_memberships WHERE false ${m ? `OR id IN (${m})` : ""} ${b ? `OR business_id IN (${b})` : ""} ${u ? `OR person_id IN (${u})` : ""};`
      : "",
    b ? `DELETE FROM public.businesses WHERE id IN (${b});` : "",
    u ? `DELETE FROM public.accounts WHERE auth_user_id IN (${u});` : "",
    u ? `DELETE FROM public.profiles WHERE id IN (${u});` : "",
    u ? `DELETE FROM auth.users WHERE id IN (${u});` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!sql) return;
  execFileSync(
    "docker",
    [
      "exec",
      localDbContainer(),
      "psql",
      "-U",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function isLocalUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

function parseEnvLines(text) {
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    map[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return map;
}

function loadStatusEnv() {
  let raw;
  try {
    raw = execSync("npx supabase status -o env", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000,
    });
  } catch (err) {
    throw new Error(
      `P3 smoke requires a running local Supabase (\`npx supabase start\`). status failed: ${err.message}`,
    );
  }

  const status = parseEnvLines(raw);
  const apiUrl = status.API_URL;
  const anon = status.ANON_KEY || status.PUBLISHABLE_KEY;
  const service = status.SERVICE_ROLE_KEY || status.SECRET_KEY;

  if (!apiUrl || !anon || !service) {
    throw new Error(
      "P3 smoke: supabase status missing API_URL / ANON_KEY|PUBLISHABLE_KEY / SERVICE_ROLE_KEY|SECRET_KEY",
    );
  }
  if (!isLocalUrl(apiUrl)) {
    throw new Error(
      `P3 smoke refuses non-local API_URL (${apiUrl}). Local-only test.`,
    );
  }

  return {
    API_URL: apiUrl,
    ANON_KEY: anon,
    SERVICE_ROLE_KEY: service,
  };
}

/** Create confirmed local users via Admin API (avoids GoTrue mailer rate limit). */
async function createUser(url, serviceKey, email, password) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`createUser failed: ${JSON.stringify(body)}`);
  const user = body;
  if (!user?.id) throw new Error("createUser missing user id");
  return user.id;
}

async function login(url, anon, email, password) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`login failed: ${JSON.stringify(body)}`);
  return body.access_token;
}

async function rpc(url, key, token, name, args = {}) {
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${name} failed: ${text}`);
  return data;
}

function userClient(url, anon, token) {
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  const env = loadStatusEnv();
  const stamp = Date.now();
  const pass = "P3Smoke!pass9";
  // GoTrue rejects example/test domains (email_address_invalid). Use real-looking providers.
  const emailA = `p3a-${stamp}@gmail.com`;
  const emailB = `p3b-${stamp}@gmail.com`;
  const created = { users: [], businesses: [], memberships: [] };

  try {
    const uidA = await createUser(
      env.API_URL,
      env.SERVICE_ROLE_KEY,
      emailA,
      pass,
    );
    const uidB = await createUser(
      env.API_URL,
      env.SERVICE_ROLE_KEY,
      emailB,
      pass,
    );
    created.users.push(uidA, uidB);

    for (const uid of [uidA, uidB]) {
      await rpc(
        env.API_URL,
        env.SERVICE_ROLE_KEY,
        env.SERVICE_ROLE_KEY,
        "access_provision_account",
        { p_auth_user_id: uid },
      );
    }

    const tokenA = await login(env.API_URL, env.ANON_KEY, emailA, pass);
    const tokenB = await login(env.API_URL, env.ANON_KEY, emailB, pass);
    const clientA = userClient(env.API_URL, env.ANON_KEY, tokenA);
    const clientB = userClient(env.API_URL, env.ANON_KEY, tokenB);

    const { data: accA, error: accAErr } = await clientA
      .from("accounts")
      .select("id")
      .eq("auth_user_id", uidA)
      .single();
    if (accAErr || !accA) throw new Error(`account A: ${accAErr?.message}`);

    await rpc(env.API_URL, env.ANON_KEY, tokenA, "access_link_person", {
      p_account_id: accA.id,
      p_person_id: uidA,
    });

    const { data: accB, error: accBErr } = await clientB
      .from("accounts")
      .select("id")
      .eq("auth_user_id", uidB)
      .single();
    if (accBErr || !accB) throw new Error(`account B: ${accBErr?.message}`);

    await rpc(env.API_URL, env.ANON_KEY, tokenB, "access_link_person", {
      p_account_id: accB.id,
      p_person_id: uidB,
    });

    const activeA = await rpc(
      env.API_URL,
      env.ANON_KEY,
      tokenA,
      "access_is_active_account",
    );
    const personA = await rpc(
      env.API_URL,
      env.ANON_KEY,
      tokenA,
      "access_current_person_id",
    );
    if (activeA !== true || !personA) {
      throw new Error(`A not active after link: active=${activeA} person=${personA}`);
    }

    // Client UUID: INSERT WITH CHECK passes, but RETURNING needs SELECT and the
    // new row is unpublished + has no CTX membership yet.
    const bizId = crypto.randomUUID();
    const { error: bizErr } = await clientA.from("businesses").insert({
      id: bizId,
      legal_name: `P3 Smoke ${stamp}`,
      public_name: `P3 Smoke Pub ${stamp}`,
    });
    if (bizErr) throw new Error(`business insert: ${bizErr.message}`);
    created.businesses.push(bizId);

    const { data: memA, error: memErr } = await clientA
      .from("business_memberships")
      .insert({
        person_id: uidA,
        business_id: bizId,
        role_id: "founder",
        editorial_status: "declared",
        relation_status: "active",
      })
      .select("id")
      .single();
    if (memErr) throw new Error(`membership insert: ${memErr.message}`);
    created.memberships.push(memA.id);

    const ctxBefore = await rpc(
      env.API_URL,
      env.ANON_KEY,
      tokenA,
      "access_has_active_business_membership",
      { p_business_id: bizId },
    );
    const actBefore = await rpc(
      env.API_URL,
      env.ANON_KEY,
      tokenA,
      "access_can_act_for_business",
      { p_business_id: bizId },
    );
    if (ctxBefore !== true || actBefore !== false) {
      throw new Error(`expected CTX yes ACT no, got ${ctxBefore}/${actBefore}`);
    }

    let bootstrapDenied = false;
    try {
      await rpc(
        env.API_URL,
        env.ANON_KEY,
        tokenA,
        "access_bootstrap_business_grant",
        { p_membership_id: memA.id },
      );
    } catch {
      bootstrapDenied = true;
    }
    if (!bootstrapDenied) throw new Error("ordinary bootstrap should fail");

    const authId = await rpc(
      env.API_URL,
      env.SERVICE_ROLE_KEY,
      env.SERVICE_ROLE_KEY,
      "access_bootstrap_business_grant",
      { p_membership_id: memA.id },
    );

    const actAfter = await rpc(
      env.API_URL,
      env.ANON_KEY,
      tokenA,
      "access_can_act_for_business",
      { p_business_id: bizId },
    );
    if (actAfter !== true) throw new Error("expected ACT after bootstrap");

    const { error: editErr } = await clientA
      .from("businesses")
      .update({ summary: "edited-by-act" })
      .eq("id", bizId);
    if (editErr) throw new Error(`edit: ${editErr.message}`);

    const { data: bSee } = await clientB
      .from("businesses")
      .select("id")
      .eq("id", bizId)
      .maybeSingle();
    if (bSee) throw new Error("user B should not see non-public CTX business");

    await rpc(env.API_URL, env.ANON_KEY, tokenA, "revoke_business_management", {
      p_authorization_id: authId,
    });
    const actRevoked = await rpc(
      env.API_URL,
      env.ANON_KEY,
      tokenA,
      "access_can_act_for_business",
      { p_business_id: bizId },
    );
    if (actRevoked !== false) throw new Error("expected ACT no after revoke");

    console.log("P3_SMOKE_PASS");
  } finally {
    try {
      cleanupFixturesSql(created);
      console.log("P3_SMOKE_CLEANUP_DONE");
    } catch (err) {
      console.error("P3_SMOKE_CLEANUP_FAIL", err.message ?? err);
    }
  }
}

main().catch((err) => {
  console.error("P3_SMOKE_FAIL", err.message ?? err);
  process.exit(1);
});
