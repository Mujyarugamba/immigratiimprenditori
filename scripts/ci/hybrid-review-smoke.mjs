import { execFileSync, execSync } from "node:child_process";

const PASSWORD = "HybridReviewSmoke!2026#B8";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseEnvLines(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return values;
}

function isLocalUrl(value) {
  try {
    const host = new URL(value).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

function loadLocalSupabase() {
  const raw = execFileSync("supabase", ["status", "-o", "env"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120_000,
  });
  const status = parseEnvLines(raw);
  const API_URL = status.API_URL;
  const SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY || status.SECRET_KEY;
  assert(API_URL && SERVICE_ROLE_KEY, "Supabase local status is missing API/service credentials");
  assert(isLocalUrl(API_URL), `Refusing non-local Supabase API_URL: ${API_URL}`);
  return { API_URL, SERVICE_ROLE_KEY };
}

function bearerHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function requestJson(url, options, label) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`${label} failed (${response.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body;
}

async function createConfirmedUser(env, email, fullName) {
  const user = await requestJson(
    `${env.API_URL}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: bearerHeaders(env.SERVICE_ROLE_KEY),
      body: JSON.stringify({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    },
    `create ${email}`,
  );
  assert(UUID_RE.test(user?.id || ""), `Invalid local user id for ${email}`);
  return user.id;
}

async function deleteUser(env, userId) {
  if (!UUID_RE.test(userId || "")) return;
  const response = await fetch(`${env.API_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: bearerHeaders(env.SERVICE_ROLE_KEY),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`cleanup user ${userId} failed (${response.status}): ${await response.text()}`);
  }
}

async function rpcService(env, name, args = {}) {
  return requestJson(
    `${env.API_URL}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: bearerHeaders(env.SERVICE_ROLE_KEY),
      body: JSON.stringify(args),
    },
    `service RPC ${name}`,
  );
}

function localDbContainer() {
  const out = execSync("docker ps --format '{{.Names}}'", { encoding: "utf8" });
  const names = out.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const exact = names.find((name) => name === "supabase_db_immigratiimprenditori");
  const fallback = names.find((name) => name.startsWith("supabase_db_"));
  const name = exact || fallback;
  assert(name, "Local supabase_db_* container not running");
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
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-Atqc",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

function jwtClaims(userId) {
  return JSON.stringify({
    sub: userId,
    role: "authenticated",
    aal: "aal2",
    is_anonymous: false,
  }).replaceAll("'", "''");
}

function asEditor(userId, sql) {
  return `
    begin;
    set local "request.jwt.claims" = '${jwtClaims(userId)}';
    set local role authenticated;
    ${sql}
    reset role;
    commit;
  `;
}

function expectSqlState(userId, sql, expectedMarker) {
  const result = psql(asEditor(userId, `
    do $smoke$
    begin
      begin
        ${sql}
        raise exception 'HYBRID_REVIEW_EXPECTED_DENIAL_MISSING';
      exception
        when sqlstate '42501' then
          raise notice '${expectedMarker}';
      end;
    end
    $smoke$;
    select '${expectedMarker}';
  `));
  assert(result.includes(expectedMarker), `${expectedMarker} was not observed`);
}

async function provisionEditor(env, userId) {
  const accountId = await rpcService(env, "access_provision_account", {
    p_auth_user_id: userId,
  });
  assert(UUID_RE.test(accountId || ""), `Invalid account id for editor ${userId}`);
  await rpcService(env, "access_link_person", {
    p_account_id: accountId,
    p_person_id: userId,
  });
  await rpcService(env, "assign_application_role", {
    p_account_id: accountId,
    p_role_code: "redattore",
  });
  return accountId;
}

async function main() {
  const env = loadLocalSupabase();
  const stamp = `${Date.now()}-${process.pid}`;
  const users = [];
  let ordinaryId = null;
  let sensitiveId = null;

  try {
    const editorA = await createConfirmedUser(
      env,
      `hybrid-editor-a-${stamp}@example.invalid`,
      "Hybrid Review Editor A",
    );
    const editorB = await createConfirmedUser(
      env,
      `hybrid-editor-b-${stamp}@example.invalid`,
      "Hybrid Review Editor B",
    );
    users.push(editorA, editorB);

    const accountA = await provisionEditor(env, editorA);
    const accountB = await provisionEditor(env, editorB);
    assert(accountA !== accountB, "Hybrid review smoke resolved the same account twice");

    const languageId = psql(
      "select id from public.languages where is_active order by sort_order, id limit 1;",
    );
    assert(/^\d+$/.test(languageId), "No local language available for hybrid review smoke");

    ordinaryId = psql(`
      insert into public.contents (
        owned_by_editorial, owner_person_id, owner_business_id, type_code,
        language_id, title, slug, body, editorial_status,
        publication_status, visibility_status, is_featured
      ) values (
        true, null, null, 'news', ${languageId},
        'Hybrid ordinary fixture', 'hybrid-ordinary-${stamp}',
        'Ordinary local-only fixture.', 'draft', 'unpublished', 'private', false
      ) returning id;
    `);
    assert(UUID_RE.test(ordinaryId), `Invalid ordinary content id: ${ordinaryId}`);

    psql(asEditor(editorA, `
      update public.contents
      set editorial_status='ready', publication_status='published',
          visibility_status='public', published_at=now()
      where id='${ordinaryId}'::uuid;
    `));
    assert(
      psql(`select publication_status from public.contents where id='${ordinaryId}'::uuid;`) === "published",
      "Ordinary same-editor publication was unexpectedly blocked",
    );
    console.log("HYBRID_REVIEW_ORDINARY_SAME_EDITOR = PASS");

    sensitiveId = psql(`
      insert into public.contents (
        owned_by_editorial, owner_person_id, owner_business_id, type_code,
        language_id, title, slug, body, editorial_status,
        publication_status, visibility_status, is_featured
      ) values (
        true, null, null, 'research_report', ${languageId},
        'Hybrid sensitive fixture', 'hybrid-sensitive-${stamp}',
        'Sensitive local-only fixture v1.', 'draft', 'unpublished', 'private', false
      ) returning id;
    `);
    assert(UUID_RE.test(sensitiveId), `Invalid sensitive content id: ${sensitiveId}`);

    expectSqlState(
      editorA,
      `update public.contents set editorial_status='ready', publication_status='published', visibility_status='public', published_at=now() where id='${sensitiveId}'::uuid;`,
      "HYBRID_REVIEW_SENSITIVE_WITHOUT_APPROVAL_DENIED",
    );

    const review1 = psql(asEditor(editorA, `
      insert into public.editorial_secondary_reviews (
        entity_kind, entity_id, review_scope, reason_code,
        basis_fingerprint, requested_by_account_id
      ) values (
        'content', '${sensitiveId}'::uuid, 'publication',
        'ci_hybrid_review', repeat('0', 32), '${accountA}'::uuid
      ) returning id;
    `));
    assert(UUID_RE.test(review1), `Invalid first review id: ${review1}`);

    expectSqlState(
      editorA,
      `update public.editorial_secondary_reviews set status='approved' where id='${review1}'::uuid;`,
      "HYBRID_REVIEW_SELF_APPROVAL_DENIED",
    );

    psql(asEditor(editorB, `
      update public.editorial_secondary_reviews
      set status='approved'
      where id='${review1}'::uuid;
    `));
    assert(
      psql(`select status from public.editorial_secondary_reviews where id='${review1}'::uuid;`) === "approved",
      "Second editor approval was not recorded",
    );
    console.log("HYBRID_REVIEW_SECOND_EDITOR_APPROVAL = PASS");

    psql(asEditor(editorA, `
      update public.contents
      set body='Sensitive local-only fixture v2 after approval.'
      where id='${sensitiveId}'::uuid;
    `));

    expectSqlState(
      editorA,
      `update public.contents set editorial_status='ready', publication_status='published', visibility_status='public', published_at=now() where id='${sensitiveId}'::uuid;`,
      "HYBRID_REVIEW_STALE_APPROVAL_DENIED",
    );

    const review2 = psql(asEditor(editorA, `
      insert into public.editorial_secondary_reviews (
        entity_kind, entity_id, review_scope, reason_code,
        basis_fingerprint, requested_by_account_id
      ) values (
        'content', '${sensitiveId}'::uuid, 'publication',
        'ci_hybrid_review_after_change', repeat('0', 32), '${accountA}'::uuid
      ) returning id;
    `));
    assert(UUID_RE.test(review2), `Invalid second review id: ${review2}`);

    psql(asEditor(editorB, `
      update public.editorial_secondary_reviews
      set status='approved'
      where id='${review2}'::uuid;
    `));

    psql(asEditor(editorA, `
      update public.contents
      set editorial_status='ready', publication_status='published',
          visibility_status='public', published_at=now()
      where id='${sensitiveId}'::uuid;
    `));
    assert(
      psql(`select publication_status from public.contents where id='${sensitiveId}'::uuid;`) === "published",
      "Sensitive publication did not succeed after fresh second-editor approval",
    );
    console.log("HYBRID_REVIEW_FRESH_APPROVAL_PUBLICATION = PASS");

    assert(
      psql(`select count(*) from public.editorial_secondary_reviews where entity_kind='content' and entity_id='${sensitiveId}'::uuid and status='approved';`) === "2",
      "Hybrid review audit ledger did not preserve both approvals",
    );
    console.log("HYBRID_REVIEW_AUDIT_LEDGER = PASS");
  } finally {
    if (ordinaryId && UUID_RE.test(ordinaryId)) {
      psql(`delete from public.contents where id='${ordinaryId}'::uuid;`);
    }
    if (sensitiveId && UUID_RE.test(sensitiveId)) {
      psql(`delete from public.editorial_secondary_reviews where entity_kind='content' and entity_id='${sensitiveId}'::uuid; delete from public.contents where id='${sensitiveId}'::uuid;`);
    }
    for (const userId of users.reverse()) {
      await deleteUser(env, userId);
    }
    if (users.length) {
      const ids = users.map((id) => `'${id}'::uuid`).join(",");
      const residue = psql(`
        select
          (select count(*) from auth.users where id in (${ids})) +
          (select count(*) from public.profiles where id in (${ids})) +
          (select count(*) from public.accounts where auth_user_id in (${ids}));
      `);
      assert(residue === "0", `Hybrid review smoke left ${residue} identity rows behind`);
    }
    console.log("HYBRID_REVIEW_EPHEMERAL_CLEANUP = PASS");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
