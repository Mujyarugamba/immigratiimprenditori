import { execFileSync, execSync } from "node:child_process";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PASSWORD = "LocalAuthSmoke!2026#A7";

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
  const ANON_KEY = status.ANON_KEY || status.PUBLISHABLE_KEY;
  const SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY || status.SECRET_KEY;

  assert(API_URL && ANON_KEY && SERVICE_ROLE_KEY, "Supabase local status is missing API keys");
  assert(isLocalUrl(API_URL), `Refusing non-local Supabase API_URL: ${API_URL}`);

  return { API_URL, ANON_KEY, SERVICE_ROLE_KEY };
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
    ["exec", localDbContainer(), "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-Atqc", sql],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
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

function bearerHeaders(apikey, token = apikey) {
  return {
    apikey,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function createConfirmedUser(env, email, fullName) {
  const body = await requestJson(
    `${env.API_URL}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: bearerHeaders(env.SERVICE_ROLE_KEY),
      body: JSON.stringify({ email, password: PASSWORD, email_confirm: true, user_metadata: { full_name: fullName } }),
    },
    `create ${email}`,
  );
  assert(UUID_RE.test(body?.id || ""), `Invalid local user id for ${email}`);
  return body.id;
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

async function loginPassword(env, email) {
  const body = await requestJson(
    `${env.API_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: bearerHeaders(env.ANON_KEY),
      body: JSON.stringify({ email, password: PASSWORD }),
    },
    `password login ${email}`,
  );
  assert(body?.access_token, `Password login did not return an access token for ${email}`);
  return body.access_token;
}

function decodeJwt(token) {
  const parts = token.split(".");
  assert(parts.length === 3, "Malformed JWT returned by local Auth");
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
}

async function rpc(env, token, name, args = {}) {
  return requestJson(
    `${env.API_URL}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: bearerHeaders(env.ANON_KEY, token),
      body: JSON.stringify(args),
    },
    `RPC ${name}`,
  );
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

async function expectRpcDenied(env, token, name, args = {}) {
  const response = await fetch(`${env.API_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: bearerHeaders(env.ANON_KEY, token),
    body: JSON.stringify(args),
  });
  const text = await response.text();
  assert(!response.ok, `${name} unexpectedly succeeded for authenticated user`);
  assert(
    response.status === 401 || response.status === 403 || text.includes("not authorized") || text.includes("42501"),
    `${name} failed for an unexpected reason (${response.status}): ${text}`,
  );
}

async function restSelect(env, token, path) {
  return requestJson(
    `${env.API_URL}/rest/v1/${path}`,
    { headers: bearerHeaders(env.ANON_KEY, token) },
    `REST ${path}`,
  );
}

async function provisionAndLink(env, token, userId) {
  await rpcService(env, "access_provision_account", { p_auth_user_id: userId });
  const rows = await restSelect(env, token, `accounts?auth_user_id=eq.${userId}&select=id,auth_user_id,account_status,person_id`);
  assert(Array.isArray(rows) && rows.length === 1, `Provisioned account not visible to ${userId}`);
  const accountId = rows[0].id;
  assert(UUID_RE.test(accountId || ""), `Invalid account id for ${userId}`);

  await rpc(env, token, "access_link_person", { p_account_id: accountId, p_person_id: userId });
  const linked = await restSelect(env, token, `accounts?id=eq.${accountId}&select=id,account_status,person_id,person_association_status`);
  assert(linked?.[0]?.account_status === "active", `Account ${accountId} did not become active`);
  assert(linked?.[0]?.person_id === userId, `Account ${accountId} did not link its own profile`);
  assert(linked?.[0]?.person_association_status === "declared", `Account ${accountId} has unexpected person association status`);
  return accountId;
}

async function assertAccessBoundary(env, token, expected) {
  const isContributor = await rpc(env, token, "access_is_contributor");
  const editorAssigned = await rpc(env, token, "access_is_editor_assigned");
  const isEditor = await rpc(env, token, "access_is_editor");
  const isAdmin = await rpc(env, token, "access_is_application_admin");

  assert(
    isContributor === expected.contributor,
    `contributore boundary mismatch: expected ${expected.contributor}, got ${isContributor}`,
  );
  assert(
    editorAssigned === expected.editorAssigned,
    `redattore assignment mismatch: expected ${expected.editorAssigned}, got ${editorAssigned}`,
  );
  assert(
    isEditor === expected.editorAuthorized,
    `redattore authorization mismatch: expected ${expected.editorAuthorized}, got ${isEditor}`,
  );
  assert(isAdmin === false, "Ephemeral smoke user unexpectedly has amministratore_applicativo authorization");
}

async function main() {
  const env = loadLocalSupabase();
  const stamp = `${Date.now()}-${process.pid}`;
  const contributorEmail = `auth-smoke-contributor-${stamp}@example.invalid`;
  const editorEmail = `auth-smoke-editor-${stamp}@example.invalid`;
  const userIds = [];
  let inboxId = null;

  try {
    const contributorId = await createConfirmedUser(env, contributorEmail, "Auth Smoke Contributor");
    const editorId = await createConfirmedUser(env, editorEmail, "Auth Smoke Editor");
    userIds.push(contributorId, editorId);

    assert(psql(`select count(*) from public.profiles where id in ('${contributorId}'::uuid,'${editorId}'::uuid);`) === "2", "Auth trigger did not provision both local profiles");

    const contributorToken = await loginPassword(env, contributorEmail);
    const editorToken = await loginPassword(env, editorEmail);

    const contributorJwt = decodeJwt(contributorToken);
    const editorJwt = decodeJwt(editorToken);
    assert(contributorJwt.sub === contributorId && contributorJwt.role === "authenticated", "Contributor JWT claims mismatch");
    assert(editorJwt.sub === editorId && editorJwt.role === "authenticated", "Editor JWT claims mismatch");
    assert((editorJwt.aal ?? "aal1") === "aal1", `Fresh password session unexpectedly has ${editorJwt.aal}`);

    const contributorAccountId = await provisionAndLink(env, contributorToken, contributorId);
    const editorAccountId = await provisionAndLink(env, editorToken, editorId);

    await rpcService(env, "assign_application_role", { p_account_id: contributorAccountId, p_role_code: "contributore" });
    await rpcService(env, "assign_application_role", { p_account_id: editorAccountId, p_role_code: "redattore" });

    await assertAccessBoundary(env, contributorToken, {
      contributor: true,
      editorAssigned: false,
      editorAuthorized: false,
    });
    await assertAccessBoundary(env, editorToken, {
      contributor: false,
      editorAssigned: true,
      editorAuthorized: false,
    });

    await expectRpcDenied(env, contributorToken, "assign_application_role", {
      p_account_id: contributorAccountId,
      p_role_code: "redattore",
    });
    await assertAccessBoundary(env, contributorToken, {
      contributor: true,
      editorAssigned: false,
      editorAuthorized: false,
    });

    inboxId = await rpc(env, contributorToken, "submit_editorial_contribution", {
      p_submission_kind: "story",
      p_submitter_name: "Auth Smoke Contributor",
      p_submitter_email: contributorEmail,
      p_contribution_text: "Proposta locale effimera usata esclusivamente per verificare Auth, RLS e workflow contributore.",
      p_title: `Auth integration smoke ${stamp}`,
      p_submitter_phone: null,
      p_organization_name: null,
      p_origin_country_code: "IT",
      p_destination_country_code: "FR",
      p_original_url: null,
      p_consent_contact: true,
      p_consent_publication: false,
      p_origin_country_label: "Italia",
      p_destination_country_label: "Francia",
    });
    assert(UUID_RE.test(inboxId || ""), `Contribution RPC returned invalid inbox id: ${inboxId}`);

    const contributorRows = await restSelect(
      env,
      contributorToken,
      `editorial_inbox_items?id=eq.${inboxId}&select=id,source_kind,status,submitted_by_account_id`,
    );
    assert(contributorRows?.length === 1, "Contributor cannot read its own proposal through RLS");
    assert(contributorRows[0].source_kind === "contributor", "Authenticated contributor proposal has wrong source_kind");
    assert(contributorRows[0].status === "new", "Contributor proposal has unexpected initial status");
    assert(contributorRows[0].submitted_by_account_id === contributorAccountId, "Contributor proposal is not linked to its account");

    const editorRowsAtAal1 = await restSelect(
      env,
      editorToken,
      `editorial_inbox_items?id=eq.${inboxId}&select=id,source_kind,status,submitted_by_account_id`,
    );
    assert(
      Array.isArray(editorRowsAtAal1) && editorRowsAtAal1.length === 0,
      "AAL1 redattore unexpectedly bypassed editorial RLS before MFA",
    );

    console.log("AUTH_INTEGRATION_LOCAL_ONLY = PASS");
    console.log("AUTH_PASSWORD_LOGIN_REAL = PASS");
    console.log("AUTH_ACCOUNT_PROVISIONING = PASS");
    console.log("AUTH_JWT_RPC = PASS");
    console.log("AUTH_ROLE_ASSIGNMENT_SEPARATION = PASS");
    console.log("AUTH_EDITOR_AAL1_DENIED = PASS");
    console.log("AUTH_SELF_ELEVATION_DENIED = PASS");
    console.log("AUTH_CONTRIBUTOR_PROPOSAL_RLS = PASS");
  } finally {
    if (inboxId && UUID_RE.test(inboxId)) {
      psql(`delete from public.editorial_submissions where inbox_item_id='${inboxId}'::uuid; delete from public.editorial_inbox_items where id='${inboxId}'::uuid;`);
    }
    for (const userId of userIds.reverse()) {
      await deleteUser(env, userId);
    }
    if (userIds.length > 0) {
      const ids = userIds.map((id) => `'${id}'::uuid`).join(",");
      const residue = psql(`select (select count(*) from auth.users where id in (${ids})) + (select count(*) from public.profiles where id in (${ids})) + (select count(*) from public.accounts where auth_user_id in (${ids}));`);
      assert(residue === "0", `Ephemeral Auth smoke left ${residue} identity rows behind`);
    }
    if (inboxId && UUID_RE.test(inboxId)) {
      assert(psql(`select count(*) from public.editorial_inbox_items where id='${inboxId}'::uuid;`) === "0", "Ephemeral contribution row was not removed");
    }
    console.log("AUTH_EPHEMERAL_CLEANUP = PASS");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
