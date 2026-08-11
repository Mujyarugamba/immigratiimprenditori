import { execFileSync, execSync } from "node:child_process";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LocalEnv = {
  API_URL: string;
  ANON_KEY: string;
  SERVICE_ROLE_KEY: string;
};

export function assertUuids(ids: string[]) {
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

export function psql(sql: string) {
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
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function parseEnvLines(text: string) {
  const map: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    map[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return map;
}

function isLocalUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

export function loadStatusEnv(): LocalEnv {
  const raw = execSync("npx supabase status -o env", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120_000,
  });
  const status = parseEnvLines(raw);
  const apiUrl = status.API_URL;
  const anon = status.ANON_KEY || status.PUBLISHABLE_KEY;
  const service = status.SERVICE_ROLE_KEY || status.SECRET_KEY;
  if (!apiUrl || !anon || !service) {
    throw new Error("E2E: supabase status missing keys");
  }
  if (!isLocalUrl(apiUrl)) {
    throw new Error(`E2E refuses non-local API_URL (${apiUrl})`);
  }
  return { API_URL: apiUrl, ANON_KEY: anon, SERVICE_ROLE_KEY: service };
}

export async function createConfirmedUser(
  env: LocalEnv,
  email: string,
  password: string,
) {
  const res = await fetch(`${env.API_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: env.SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const body = (await res.json()) as { id?: string };
  if (!res.ok || !body.id) {
    throw new Error(`createUser failed: ${JSON.stringify(body)}`);
  }
  return body.id;
}

async function rpcCall(
  url: string,
  apikey: string,
  token: string,
  name: string,
  args: Record<string, unknown> = {},
) {
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${name}: ${text}`);
  return data;
}

export async function rpc(
  env: LocalEnv,
  token: string,
  name: string,
  args: Record<string, unknown> = {},
) {
  return rpcCall(env.API_URL, env.ANON_KEY, token, name, args);
}

export async function rpcService(
  env: LocalEnv,
  name: string,
  args: Record<string, unknown> = {},
) {
  return rpcCall(
    env.API_URL,
    env.SERVICE_ROLE_KEY,
    env.SERVICE_ROLE_KEY,
    name,
    args,
  );
}

export async function loginToken(
  env: LocalEnv,
  email: string,
  password: string,
) {
  const res = await fetch(`${env.API_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.ANON_KEY,
      Authorization: `Bearer ${env.ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { access_token?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(`login failed: ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

export async function provisionActiveAccount(
  env: LocalEnv,
  uid: string,
  email: string,
  password: string,
) {
  await rpcService(env, "access_provision_account", { p_auth_user_id: uid });
  const token = await loginToken(env, email, password);
  const res = await fetch(
    `${env.API_URL}/rest/v1/accounts?auth_user_id=eq.${uid}&select=id`,
    {
      headers: {
        apikey: env.ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const rows = (await res.json()) as { id: string }[];
  const accountId = rows?.[0]?.id;
  if (!accountId) throw new Error("account missing after provision");
  await rpc(env, token, "access_link_person", {
    p_account_id: accountId,
    p_person_id: uid,
  });
  return { token, accountId };
}

export function cleanupUsers(userIds: string[]) {
  assertUuids(userIds);
  if (userIds.length === 0) return;
  const u = userIds.map((id) => `'${id}'`).join(",");
  psql(
    [
      `DELETE FROM public.business_membership_management_authorizations WHERE membership_id IN (SELECT id FROM public.business_memberships WHERE person_id IN (${u}));`,
      `DELETE FROM public.business_memberships WHERE person_id IN (${u});`,
      `DELETE FROM public.terms_acceptances WHERE account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`,
      `DELETE FROM public.account_role_assignments WHERE account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`,
      `DELETE FROM public.accounts WHERE auth_user_id IN (${u});`,
      `DELETE FROM public.profiles WHERE id IN (${u});`,
      `DELETE FROM auth.users WHERE id IN (${u});`,
    ].join(" "),
  );
}

export function cleanupBusinesses(businessIds: string[]) {
  assertUuids(businessIds);
  if (!businessIds.length) return;
  const b = businessIds.map((id) => `'${id}'`).join(",");
  psql(
    [
      `DELETE FROM public.business_membership_management_authorizations WHERE membership_id IN (SELECT id FROM public.business_memberships WHERE business_id IN (${b}));`,
      `DELETE FROM public.business_memberships WHERE business_id IN (${b});`,
      `DELETE FROM public.businesses WHERE id IN (${b});`,
    ].join(" "),
  );
}

export function cleanupContents(contentIds: string[]) {
  assertUuids(contentIds);
  if (!contentIds.length) return;
  const c = contentIds.map((id) => `'${id}'`).join(",");
  psql(
    [
      `DELETE FROM public.content_authors WHERE content_id IN (${c});`,
      `DELETE FROM public.contents WHERE id IN (${c});`,
    ].join(" "),
  );
}
