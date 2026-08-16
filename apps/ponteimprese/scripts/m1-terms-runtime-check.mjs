/**
 * Local-only M1 runtime: terms_acceptances schema + RLS.
 * Uses supabase status -o env. Cleans fixtures via docker psql.
 */
import { execFileSync, execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

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

function psql(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      localDbContainer(),
      "psql",
      "-U",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-At",
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
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
  const raw = execSync("npx supabase status -o env", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120_000,
  });
  const status = parseEnvLines(raw);
  const apiUrl = status.API_URL;
  const anon = status.ANON_KEY || status.PUBLISHABLE_KEY;
  const service = status.SERVICE_ROLE_KEY || status.SECRET_KEY;
  if (!apiUrl || !anon || !service) throw new Error("missing status keys");
  return { API_URL: apiUrl, ANON_KEY: anon, SERVICE_ROLE_KEY: service };
}

async function createConfirmedUser(env, email, password) {
  const res = await fetch(`${env.API_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: env.SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const body = await res.json();
  if (!res.ok || !body.id) throw new Error(`createUser: ${JSON.stringify(body)}`);
  return body.id;
}

async function provision(env, uid) {
  const res = await fetch(
    `${env.API_URL}/rest/v1/rpc/access_provision_account`,
    {
      method: "POST",
      headers: {
        apikey: env.SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_auth_user_id: uid }),
    },
  );
  if (!res.ok) throw new Error(`provision: ${await res.text()}`);
  const accountId = await res.json();
  return typeof accountId === "string" ? accountId : String(accountId);
}

async function loginClient(env, email, password) {
  const client = createClient(env.API_URL, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) throw new Error(`login: ${error?.message}`);
  return createClient(env.API_URL, env.ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function cleanup(uids) {
  assertUuids(uids);
  if (!uids.length) return;
  const u = uids.map((id) => `'${id}'`).join(",");
  psql(
    [
      `DELETE FROM public.terms_acceptances WHERE account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`,
      `DELETE FROM public.account_role_assignments WHERE account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`,
      `DELETE FROM public.accounts WHERE auth_user_id IN (${u});`,
      `DELETE FROM public.profiles WHERE id IN (${u});`,
      `DELETE FROM auth.users WHERE id IN (${u});`,
    ].join(" "),
  );
}

async function main() {
  const env = loadStatusEnv();
  const created = [];

  try {
    // Schema
    const cols = psql(
      `select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns where table_schema='public' and table_name='terms_acceptances'`,
    );
    assert(
      cols ===
        "id,account_id,document_kind,document_version,accepted_at,acceptance_channel",
      `columns: ${cols}`,
    );
    console.log("PASS schema columns");

    const fk = psql(
      `select pg_get_constraintdef(oid) from pg_constraint where conname='terms_acceptances_account_id_fkey'`,
    );
    assert(/ON DELETE RESTRICT/i.test(fk), `FK: ${fk}`);
    console.log("PASS FK ON DELETE RESTRICT");

    assert(
      psql(
        `select count(*) from pg_constraint where conname='terms_acceptances_account_kind_version_key'`,
      ) === "1",
      "unique missing",
    );
    console.log("PASS UNIQUE");

    assert(
      psql(
        `select relrowsecurity::text from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='terms_acceptances'`,
      ) === "true",
      "RLS off",
    );
    console.log("PASS RLS enabled");

    const policies = psql(
      `select string_agg(polname, ',' order by polname) from pg_policy where polrelid='public.terms_acceptances'::regclass`,
    );
    assert(
      policies.includes("terms_acceptances_insert_own") &&
        policies.includes("terms_acceptances_select_own"),
      `policies: ${policies}`,
    );
    console.log("PASS policies");

    const tableGrants = psql(
      `select string_agg(privilege_type, ',' order by privilege_type) from information_schema.role_table_grants where table_schema='public' and table_name='terms_acceptances' and grantee='authenticated'`,
    );
    assert(tableGrants === "SELECT", `table grants: ${tableGrants}`);
    const insertCols = psql(
      `select string_agg(column_name, ',' order by column_name) from information_schema.column_privileges where table_schema='public' and table_name='terms_acceptances' and grantee='authenticated' and privilege_type='INSERT'`,
    );
    assert(
      insertCols ===
        "acceptance_channel,account_id,document_kind,document_version",
      `insert cols: ${insertCols}`,
    );
    assert(
      !insertCols.split(",").includes("accepted_at") &&
        !insertCols.split(",").includes("id"),
      "accepted_at/id must not be insertable",
    );
    console.log("PASS grants authenticated SELECT + column INSERT (no accepted_at)");

    // Fixtures
    const stamp = Date.now();
    const emailA = `m1ta-${stamp}-a@example.com`;
    const emailB = `m1ta-${stamp}-b@example.com`;
    const pass = "M1Runtime!pass9";
    const uidA = await createConfirmedUser(env, emailA, pass);
    created.push(uidA);
    const uidB = await createConfirmedUser(env, emailB, pass);
    created.push(uidB);
    const accA = await provision(env, uidA);
    const accB = await provision(env, uidB);
    console.log("PASS fixtures");

    // A. ANON
    const anon = createClient(env.API_URL, env.ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: anonSel, error: anonSelErr } = await anon
      .from("terms_acceptances")
      .select("id");
    assert(
      Boolean(anonSelErr) || !anonSel || anonSel.length === 0,
      `anon select unexpected: ${JSON.stringify({ anonSel, anonSelErr })}`,
    );
    // Prefer hard fail: no SELECT grant to anon
    assert(
      anonSelErr || anonSel?.length === 0,
      "anon must not read rows",
    );
    const { error: anonInsErr } = await anon.from("terms_acceptances").insert({
      account_id: accA,
      document_kind: "terms_of_use",
      document_version: "2026-08-11",
      acceptance_channel: "signup",
    });
    assert(anonInsErr, "anon INSERT should fail");
    console.log("PASS anon SELECT/INSERT fail");

    // B. AUTH A own insert
    const clientA = await loginClient(env, emailA, pass);
    const before = Date.now();
    const { data: row, error: insErr } = await clientA
      .from("terms_acceptances")
      .insert({
        account_id: accA,
        document_kind: "terms_of_use",
        document_version: "2026-08-11",
        acceptance_channel: "signup",
      })
      .select("id,account_id,document_kind,document_version,accepted_at,acceptance_channel")
      .single();
    assert(!insErr && row, `own insert: ${insErr?.message}`);
    assert(row.accepted_at, "accepted_at missing");
    assert(new Date(row.accepted_at).getTime() >= before - 5000, "accepted_at stale");
    assert(row.document_kind === "terms_of_use", "kind");
    assert(row.acceptance_channel === "signup", "channel");
    assert(!("privacy_accepted" in row), "privacy field");
    console.log("PASS auth A INSERT own + accepted_at DB");

    const { data: ownSel, error: ownSelErr } = await clientA
      .from("terms_acceptances")
      .select("id")
      .eq("account_id", accA);
    assert(!ownSelErr && ownSel?.length >= 1, `own select: ${ownSelErr?.message}`);
    console.log("PASS auth A SELECT own");

    // Spoof
    const { error: spoofErr } = await clientA.from("terms_acceptances").insert({
      account_id: accB,
      document_kind: "terms_of_use",
      document_version: "2026-08-11",
      acceptance_channel: "signup",
    });
    assert(spoofErr, "spoof insert should fail");
    console.log("PASS auth A INSERT for B fail");

    const { data: cross } = await clientA
      .from("terms_acceptances")
      .select("id")
      .eq("account_id", accB);
    assert(!cross || cross.length === 0, "A must not see B");
    console.log("PASS auth A SELECT B = 0");

    // UPDATE/DELETE
    const { error: updErr } = await clientA
      .from("terms_acceptances")
      .update({ document_version: "hacked" })
      .eq("id", row.id);
    assert(updErr, "UPDATE should fail");
    console.log("PASS auth A UPDATE fail");

    const { error: delErr } = await clientA
      .from("terms_acceptances")
      .delete()
      .eq("id", row.id);
    assert(delErr, "DELETE should fail");
    console.log("PASS auth A DELETE fail");

    // C. Duplicate
    const { error: dupErr } = await clientA.from("terms_acceptances").insert({
      account_id: accA,
      document_kind: "terms_of_use",
      document_version: "2026-08-11",
      acceptance_channel: "signup",
    });
    assert(dupErr, "duplicate should fail");
    assert(
      /duplicate|unique|23505/i.test(dupErr.message) ||
        dupErr.code === "23505",
      `dup msg: ${dupErr.message}`,
    );
    console.log("PASS duplicate unique violation");

    // D. New version
    const { data: v2, error: v2Err } = await clientA
      .from("terms_acceptances")
      .insert({
        account_id: accA,
        document_kind: "terms_of_use",
        document_version: "2026-08-11-v2",
        acceptance_channel: "signup",
      })
      .select("document_version")
      .single();
    assert(!v2Err && v2?.document_version === "2026-08-11-v2", v2Err?.message);
    console.log("PASS multi-version");

    // E. Admin — need active account (person linked) + amministratore_applicativo
    const tokenARes = await fetch(
      `${env.API_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: env.ANON_KEY,
          Authorization: `Bearer ${env.ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailA, password: pass }),
      },
    );
    const tokenABody = await tokenARes.json();
    assert(tokenABody.access_token, `token A: ${JSON.stringify(tokenABody)}`);
    const linkRes = await fetch(
      `${env.API_URL}/rest/v1/rpc/access_link_person`,
      {
        method: "POST",
        headers: {
          apikey: env.ANON_KEY,
          Authorization: `Bearer ${tokenABody.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_account_id: accA, p_person_id: uidA }),
      },
    );
    assert(linkRes.ok, `link person A: ${await linkRes.text()}`);
    psql(
      `insert into public.account_role_assignments (account_id, role_code, assignment_status) values ('${accA}'::uuid, 'amministratore_applicativo', 'active');`,
    );
    const adminExists = psql(
      `select exists(select 1 from public.account_role_assignments where account_id='${accA}'::uuid and role_code='amministratore_applicativo' and assignment_status='active')`,
    );
    assert(adminExists === "t", `admin role not assigned: ${adminExists}`);
    const acctState = psql(
      `select account_status || ':' || coalesce(person_association_status,'null') from public.accounts where id='${accA}'::uuid`,
    );
    assert(/^active:(declared|verified)$/.test(acctState), `account state: ${acctState}`);

    const clientA2 = await loginClient(env, emailA, pass);
    const clientB = await loginClient(env, emailB, pass);
    const { error: bInsErr } = await clientB.from("terms_acceptances").insert({
      account_id: accB,
      document_kind: "terms_of_use",
      document_version: "2026-08-11",
      acceptance_channel: "signup",
    });
    assert(!bInsErr, `B insert: ${bInsErr?.message}`);
    const { data: asAdmin, error: asAdminErr } = await clientA2
      .from("terms_acceptances")
      .select("id,account_id");
    assert(!asAdminErr, asAdminErr?.message);
    assert(
      (asAdmin ?? []).some((r) => r.account_id === accB),
      `admin should see B rows: ${JSON.stringify(asAdmin)}`,
    );
    console.log("PASS admin SELECT");

    const { error: adminUpd } = await clientA2
      .from("terms_acceptances")
      .update({ document_version: "x" })
      .eq("account_id", accA);
    assert(adminUpd, "admin UPDATE should fail");
    console.log("PASS admin UPDATE fail");

    const { error: adminDel } = await clientA2
      .from("terms_acceptances")
      .delete()
      .eq("account_id", accA);
    assert(adminDel, "admin DELETE should fail");
    console.log("PASS admin DELETE fail");

    // F. Privacy — no privacy columns / kinds
    const kinds = psql(
      `select coalesce(string_agg(distinct document_kind, ','), '') from public.terms_acceptances where account_id in ('${accA}'::uuid,'${accB}'::uuid)`,
    );
    assert(kinds === "terms_of_use", `kinds: ${kinds}`);
    assert(
      psql(
        `select count(*) from information_schema.columns where table_name='terms_acceptances' and column_name ilike '%privacy%'`,
      ) === "0",
      "privacy column exists",
    );
    console.log("PASS no privacy consent");

    console.log("\nALL M1 RUNTIME CHECKS PASSED");
  } finally {
    cleanup(created);
    console.log("PASS cleanup");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
