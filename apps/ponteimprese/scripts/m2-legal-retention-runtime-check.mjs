/**
 * M2 legal_retention_records — full local runtime harness + fixture cleanup.
 * Exit 2 if Docker unavailable. Does not apply migrations.
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
  try {
    const out = execSync("docker ps --format {{.Names}}", { encoding: "utf8" });
    return (
      out
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find((n) => n.startsWith("supabase_db_")) || null
    );
  } catch {
    return null;
  }
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
  return {
    API_URL: status.API_URL,
    ANON_KEY: status.ANON_KEY || status.PUBLISHABLE_KEY,
    SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY || status.SECRET_KEY,
  };
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

function expectFail(fnLabel, err) {
  assert(err, `${fnLabel} should fail`);
}

async function main() {
  if (!localDbContainer()) {
    console.error("LOCAL RUNTIME BLOCCATO — DOCKER/SUPABASE LOCALE NON DISPONIBILE");
    process.exit(2);
  }

  const beforeCount = psql(`select count(*)::text from public.legal_retention_records`);
  const env = loadStatusEnv();
  const createdUsers = [];
  const stamp = Date.now();
  const pass = "M2Runtime!pass9";

  try {
    // ---- schema introspection ----
    const cols = psql(
      `select string_agg(column_name, ',' order by ordinal_position)
       from information_schema.columns
       where table_schema='public' and table_name='legal_retention_records'`,
    );
    assert(
      cols.includes("subject_ref") &&
        cols.includes("source_account_id") &&
        cols.includes("reason_code") &&
        cols.includes("retain_until") &&
        cols.includes("disposed_at") &&
        cols.includes("proof_document_version"),
      `columns: ${cols}`,
    );
    console.log("PASS schema columns");

    const fk = psql(
      `select pg_get_constraintdef(oid) from pg_constraint where conname='legal_retention_records_source_account_id_fkey'`,
    );
    assert(/ON DELETE SET NULL/i.test(fk), `FK: ${fk}`);
    assert(!/CASCADE/i.test(fk), "FK must not CASCADE");
    assert(!/RESTRICT/i.test(fk), "FK must not RESTRICT");
    console.log("PASS FK ON DELETE SET NULL");

    assert(
      psql(
        `select relrowsecurity::text from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='legal_retention_records'`,
      ) === "true",
      "RLS off",
    );
    console.log("PASS RLS enabled");

    const tableGrants = psql(
      `select coalesce(string_agg(privilege_type, ',' order by privilege_type), '')
       from information_schema.role_table_grants
       where table_schema='public' and table_name='legal_retention_records' and grantee='authenticated'`,
    );
    assert(tableGrants === "SELECT", `auth table grants: ${tableGrants}`);
    assert(
      psql(
        `select count(*)::text from information_schema.role_table_grants
         where table_name='legal_retention_records' and grantee='anon'`,
      ) === "0",
      "anon must have zero grants",
    );
    console.log("PASS grants introspection");

    const insertSec = psql(
      `select prosecdef::text || '|' || coalesce(array_to_string(proconfig, ','), '')
       from pg_proc where proname='legal_retention_insert_record'`,
    );
    assert(
      /^(t|true)\|/i.test(insertSec),
      `insert not DEFINER: ${insertSec}`,
    );
    assert(/search_path/i.test(insertSec), `insert search_path: ${insertSec}`);
    const disposeSec = psql(
      `select prosecdef::text || '|' || coalesce(array_to_string(proconfig, ','), '')
       from pg_proc where proname='legal_retention_dispose_record'`,
    );
    assert(
      /^(t|true)\|/i.test(disposeSec),
      `dispose not DEFINER: ${disposeSec}`,
    );
    console.log("PASS SECURITY DEFINER + search_path");

    // ---- fixtures ----
    const emailUser = `m2u-${stamp}@example.com`;
    const emailEd = `m2e-${stamp}@example.com`;
    const emailAdm = `m2a-${stamp}@example.com`;
    const uidUser = await createConfirmedUser(env, emailUser, pass);
    createdUsers.push(uidUser);
    const uidEd = await createConfirmedUser(env, emailEd, pass);
    createdUsers.push(uidEd);
    const uidAdm = await createConfirmedUser(env, emailAdm, pass);
    createdUsers.push(uidAdm);
    const accUser = await provision(env, uidUser);
    const accEd = await provision(env, uidEd);
    const accAdm = await provision(env, uidAdm);

    // activate admin: link person + role
    const tokenAdmRes = await fetch(
      `${env.API_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: env.ANON_KEY,
          Authorization: `Bearer ${env.ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailAdm, password: pass }),
      },
    );
    const tokenAdm = (await tokenAdmRes.json()).access_token;
    assert(tokenAdm, "admin token");
    const linkRes = await fetch(`${env.API_URL}/rest/v1/rpc/access_link_person`, {
      method: "POST",
      headers: {
        apikey: env.ANON_KEY,
        Authorization: `Bearer ${tokenAdm}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_account_id: accAdm, p_person_id: uidAdm }),
    });
    assert(linkRes.ok, `link admin: ${await linkRes.text()}`);
    psql(
      `insert into public.account_role_assignments (account_id, role_code, assignment_status)
       values ('${accAdm}'::uuid, 'amministratore_applicativo', 'active')`,
    );

    // activate editor similarly
    const tokenEdRes = await fetch(
      `${env.API_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: env.ANON_KEY,
          Authorization: `Bearer ${env.ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailEd, password: pass }),
      },
    );
    const tokenEd = (await tokenEdRes.json()).access_token;
    const linkEd = await fetch(`${env.API_URL}/rest/v1/rpc/access_link_person`, {
      method: "POST",
      headers: {
        apikey: env.ANON_KEY,
        Authorization: `Bearer ${tokenEd}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_account_id: accEd, p_person_id: uidEd }),
    });
    assert(linkEd.ok, `link editor: ${await linkEd.text()}`);
    psql(
      `insert into public.account_role_assignments (account_id, role_code, assignment_status)
       values ('${accEd}'::uuid, 'redattore', 'active')`,
    );
    console.log("PASS fixtures");

    const anon = createClient(env.API_URL, env.ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const userClient = await loginClient(env, emailUser, pass);
    const editorClient = await loginClient(env, emailEd, pass);
    const adminClient = await loginClient(env, emailAdm, pass);
    const svc = createClient(env.API_URL, env.SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const retainUntil = new Date(Date.now() + 86400000 * 30).toISOString();
    const subject = `m2harness-opaque-${stamp}-aaaa`;

    // seed one row via service for SELECT tests
    const { data: seededId, error: seedErr } = await svc.rpc(
      "legal_retention_insert_record",
      {
        p_subject_ref: subject,
        p_source_account_id: accUser,
        p_reason_code: "transaction_evidence",
        p_retention_class: "policy_defined",
        p_retained_data_kind: "terms_acceptance_proof",
        p_proof_document_kind: "terms_of_use",
        p_proof_document_version: "2026-08-11",
        p_proof_accepted_at: new Date().toISOString(),
        p_proof_acceptance_channel: "signup",
        p_case_reference: null,
        p_retain_until: retainUntil,
        p_retention_indefinite_review: false,
        p_admin_note: null,
      },
    );
    assert(!seedErr && seededId, `seed: ${seedErr?.message}`);
    console.log("PASS authorized insert (terms proof + source_account_id)");

    // ANON
    expectFail("anon SELECT", (await anon.from("legal_retention_records").select("id").limit(1)).error);
    expectFail(
      "anon INSERT",
      (
        await anon.from("legal_retention_records").insert({
          subject_ref: `${subject}-anon`,
          reason_code: "dispute",
          retention_class: "case_specific",
          retained_data_kind: "dispute_marker",
          case_reference: "C1",
          retain_until: retainUntil,
        })
      ).error,
    );
    expectFail(
      "anon UPDATE",
      (
        await anon
          .from("legal_retention_records")
          .update({ admin_note: "x" })
          .eq("id", seededId)
      ).error,
    );
    expectFail(
      "anon DELETE",
      (await anon.from("legal_retention_records").delete().eq("id", seededId)).error,
    );
    console.log("PASS anon SELECT/INSERT/UPDATE/DELETE fail");

    // AUTH normal
    const { data: userSel, error: userSelErr } = await userClient
      .from("legal_retention_records")
      .select("id");
    assert(
      (userSelErr && userSel?.length !== 1) || !userSel || userSel.length === 0,
      `user select leak: ${JSON.stringify(userSel)} ${userSelErr?.message}`,
    );
    // With SELECT grant + RLS admin-only, ordinary user gets empty set (no error) or error
    assert(!userSel || userSel.length === 0, "user must not see archive rows");
    expectFail(
      "user INSERT",
      (
        await userClient.from("legal_retention_records").insert({
          subject_ref: `${subject}-user`,
          reason_code: "dispute",
          retention_class: "case_specific",
          retained_data_kind: "dispute_marker",
          case_reference: "C2",
          retain_until: retainUntil,
        })
      ).error,
    );
    expectFail(
      "user UPDATE",
      (
        await userClient
          .from("legal_retention_records")
          .update({ admin_note: "hack" })
          .eq("id", seededId)
      ).error,
    );
    expectFail(
      "user DELETE",
      (
        await userClient.from("legal_retention_records").delete().eq("id", seededId)
      ).error,
    );
    console.log("PASS authenticated normal deny");

    // EDITOR
    const { data: edSel } = await editorClient
      .from("legal_retention_records")
      .select("id");
    assert(!edSel || edSel.length === 0, "editor must not see archive");
    expectFail(
      "editor INSERT",
      (
        await editorClient.from("legal_retention_records").insert({
          subject_ref: `${subject}-ed`,
          reason_code: "dispute",
          retention_class: "case_specific",
          retained_data_kind: "dispute_marker",
          case_reference: "C3",
          retain_until: retainUntil,
        })
      ).error,
    );
    console.log("PASS editor deny");

    // ADMIN SELECT pass; write still denied (no grants)
    const { data: admSel, error: admSelErr } = await adminClient
      .from("legal_retention_records")
      .select("id,subject_ref,proof_document_version")
      .eq("id", seededId);
    assert(!admSelErr && admSel?.length === 1, `admin select: ${admSelErr?.message}`);
    expectFail(
      "admin INSERT table",
      (
        await adminClient.from("legal_retention_records").insert({
          subject_ref: `${subject}-adm`,
          reason_code: "dispute",
          retention_class: "case_specific",
          retained_data_kind: "dispute_marker",
          case_reference: "C4",
          retain_until: retainUntil,
        })
      ).error,
    );
    expectFail(
      "admin UPDATE",
      (
        await adminClient
          .from("legal_retention_records")
          .update({ admin_note: "nope" })
          .eq("id", seededId)
      ).error,
    );
    console.log("PASS admin SELECT + no direct write");

    // helpers denied for authenticated
    expectFail(
      "user insert rpc",
      (
        await userClient.rpc("legal_retention_insert_record", {
          p_subject_ref: `${subject}-rpc`,
          p_source_account_id: null,
          p_reason_code: "dispute",
          p_retention_class: "case_specific",
          p_retained_data_kind: "dispute_marker",
          p_proof_document_kind: null,
          p_proof_document_version: null,
          p_proof_accepted_at: null,
          p_proof_acceptance_channel: null,
          p_case_reference: "C5",
          p_retain_until: retainUntil,
          p_retention_indefinite_review: false,
          p_admin_note: null,
        })
      ).error,
    );
    expectFail(
      "anon insert rpc",
      (
        await anon.rpc("legal_retention_insert_record", {
          p_subject_ref: `${subject}-rpc2`,
          p_source_account_id: null,
          p_reason_code: "dispute",
          p_retention_class: "case_specific",
          p_retained_data_kind: "dispute_marker",
          p_proof_document_kind: null,
          p_proof_document_version: null,
          p_proof_accepted_at: null,
          p_proof_acceptance_channel: null,
          p_case_reference: "C6",
          p_retain_until: retainUntil,
          p_retention_indefinite_review: false,
          p_admin_note: null,
        })
      ).error,
    );
    console.log("PASS helper execute denied for anon/auth");

    // negative CHECKs
    const negatives = [
      [
        "invalid reason",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, case_reference, retain_until)
         values ('${subject}-nr', 'other', 'case_specific', 'dispute_marker', 'X', now() + interval '1 day')`,
      ],
      [
        "blank subject",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, case_reference, retain_until)
         values ('short', 'dispute', 'case_specific', 'dispute_marker', 'X', now() + interval '1 day')`,
      ],
      [
        "email subject",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, case_reference, retain_until)
         values ('person@example.comxx', 'dispute', 'case_specific', 'dispute_marker', 'X', now() + interval '1 day')`,
      ],
      [
        "missing retention",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, case_reference, retain_until, retention_indefinite_review)
         values ('${subject}-mr', 'dispute', 'case_specific', 'dispute_marker', 'X', null, false)`,
      ],
      [
        "indefinite without note",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, case_reference, retain_until, retention_indefinite_review, admin_note)
         values ('${subject}-in', 'dispute', 'case_specific', 'dispute_marker', 'X', null, true, null)`,
      ],
      [
        "incomplete terms proof",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, proof_document_kind, retain_until)
         values ('${subject}-tp', 'transaction_evidence', 'policy_defined', 'terms_acceptance_proof', 'terms_of_use', now() + interval '1 day')`,
      ],
      [
        "proof on non-terms kind",
        `insert into public.legal_retention_records (subject_ref, reason_code, retention_class, retained_data_kind, case_reference, proof_document_kind, proof_document_version, proof_accepted_at, proof_acceptance_channel, retain_until)
         values ('${subject}-pn', 'dispute', 'case_specific', 'dispute_marker', 'X', 'terms_of_use', '2026-08-11', now(), 'signup', now() + interval '1 day')`,
      ],
    ];
    for (const [label, sql] of negatives) {
      let failed = false;
      try {
        psql(sql);
      } catch {
        failed = true;
      }
      assert(failed, `${label} should fail`);
      console.log(`PASS ${label} fail`);
    }

    // indefinite review valid
    const { data: indefId, error: indefErr } = await svc.rpc(
      "legal_retention_insert_record",
      {
        p_subject_ref: `${subject}-indef`,
        p_source_account_id: null,
        p_reason_code: "legal_claim",
        p_retention_class: "case_specific",
        p_retained_data_kind: "legal_claim_marker",
        p_proof_document_kind: null,
        p_proof_document_version: null,
        p_proof_accepted_at: null,
        p_proof_acceptance_channel: null,
        p_case_reference: "CLAIM-FIXTURE-1",
        p_retain_until: null,
        p_retention_indefinite_review: true,
        p_admin_note: "review pending case fixture",
      },
    );
    assert(!indefErr && indefId, indefErr?.message);
    console.log("PASS indefinite review with note");

    // dispose
    const { data: disposedId, error: dispErr } = await svc.rpc(
      "legal_retention_dispose_record",
      { p_id: seededId, p_disposal_method: "anonymized" },
    );
    assert(!dispErr && disposedId, dispErr?.message);
    const disposed = psql(
      `select record_status || '|' || disposal_method || '|' || (disposed_at is not null)::text || '|' || coalesce(proof_document_version,'') || '|' || coalesce(proof_accepted_at::text,'') || '|' || coalesce(source_account_id::text,'')
       from public.legal_retention_records where id='${seededId}'::uuid`,
    );
    assert(
      /^disposed\|anonymized\|(t|true)\|/i.test(disposed),
      `dispose state: ${disposed}`,
    );
    assert(!disposed.includes("2026-08-11"), `proof not cleared: ${disposed}`);
    // empty proof/source segments after cleared fields
    const parts = disposed.split("|");
    assert(parts[3] === "" && parts[4] === "" && parts[5] === "", `residue: ${disposed}`);
    console.log("PASS dispose + proof clearing");

    // dispose idempotent
    const { error: disp2 } = await svc.rpc("legal_retention_dispose_record", {
      p_id: seededId,
      p_disposal_method: "deleted",
    });
    assert(!disp2, disp2?.message);
    console.log("PASS dispose already disposed idempotent");

    // reactivation via UPDATE denied for authenticated; service should not casually flip without helper
    expectFail(
      "admin reactivate",
      (
        await adminClient
          .from("legal_retention_records")
          .update({ record_status: "active", disposed_at: null })
          .eq("id", seededId)
      ).error,
    );
    console.log("PASS no informal reactivate via authenticated UPDATE");

    // M1 compatibility static: terms RESTRICT still present; archive SET NULL
    const termsFk = psql(
      `select pg_get_constraintdef(oid) from pg_constraint where conname='terms_acceptances_account_id_fkey'`,
    );
    assert(/ON DELETE RESTRICT/i.test(termsFk), `M1 FK changed: ${termsFk}`);
    console.log("PASS M1 terms RESTRICT preserved (M3 path still possible)");

    // subject_ref opaque: no email/name columns required
    assert(!cols.includes("email") && !cols.includes("phone") && !cols.includes("display_name"), "PII columns present");
    console.log("PASS subject_ref opaque / no PII columns");
  } finally {
    // cleanup archive fixtures + users
    psql(
      `delete from public.legal_retention_records where subject_ref like 'm2harness-opaque-%'`,
    );
    if (createdUsers.length) {
      assertUuids(createdUsers);
      const u = createdUsers.map((id) => `'${id}'`).join(",");
      psql(
        [
          `DELETE FROM public.legal_retention_records WHERE source_account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`,
          `DELETE FROM public.account_role_assignments WHERE account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`,
          `DELETE FROM public.accounts WHERE auth_user_id IN (${u});`,
          `DELETE FROM public.profiles WHERE id IN (${u});`,
          `DELETE FROM auth.users WHERE id IN (${u});`,
        ].join(" "),
      );
    }
    const afterCount = psql(
      `select count(*)::text from public.legal_retention_records`,
    );
    assert(afterCount === beforeCount, `cleanup leak ${beforeCount}->${afterCount}`);
    console.log("PASS cleanup (counts restored)");
  }

  console.log("\nALL M2 RUNTIME CHECKS PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
