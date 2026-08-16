/**
 * Local-only P5 smoke: Red CRUD + Adm RPCs + Adm≠Red + bootstrap.
 * Uses `supabase status -o env` (never remote .env.local). Cleans via psql.
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
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function cleanup(created) {
  const {
    users = [],
    businesses = [],
    memberships = [],
    contents = [],
    indicators = [],
    sources = [],
    values = [],
    orgs = [],
  } = created;
  assertUuids([
    ...users,
    ...businesses,
    ...memberships,
    ...contents,
    ...indicators,
    ...sources,
    ...values,
    ...orgs,
  ]);

  const u = users.map((id) => `'${id}'`).join(",");
  const b = businesses.map((id) => `'${id}'`).join(",");
  const m = memberships.map((id) => `'${id}'`).join(",");
  const c = contents.map((id) => `'${id}'`).join(",");
  const ind = indicators.map((id) => `'${id}'`).join(",");
  const src = sources.map((id) => `'${id}'`).join(",");
  const val = values.map((id) => `'${id}'`).join(",");
  const o = orgs.map((id) => `'${id}'`).join(",");

  const sql = [
    val
      ? `UPDATE public.observatory_indicator_values SET supersedes_value_id = NULL WHERE id IN (${val});`
      : "",
    val ? `DELETE FROM public.observatory_indicator_values WHERE id IN (${val});` : "",
    ind ? `DELETE FROM public.observatory_indicators WHERE id IN (${ind});` : "",
    src
      ? `DELETE FROM public.observatory_statistical_sources WHERE id IN (${src});`
      : "",
    o ? `DELETE FROM public.organization_officials WHERE organization_id IN (${o});` : "",
    o ? `DELETE FROM public.organizations WHERE id IN (${o});` : "",
    c ? `DELETE FROM public.content_authors WHERE content_id IN (${c});` : "",
    c ? `DELETE FROM public.contents WHERE id IN (${c});` : "",
    m
      ? `DELETE FROM public.business_membership_management_authorizations WHERE membership_id IN (${m});`
      : "",
    m || b || u
      ? `DELETE FROM public.business_memberships WHERE false ${m ? `OR id IN (${m})` : ""} ${b ? `OR business_id IN (${b})` : ""} ${u ? `OR person_id IN (${u})` : ""};`
      : "",
    b ? `DELETE FROM public.businesses WHERE id IN (${b});` : "",
    u
      ? `DELETE FROM public.account_role_assignments WHERE account_id IN (SELECT id FROM public.accounts WHERE auth_user_id IN (${u}));`
      : "",
    u ? `DELETE FROM public.accounts WHERE auth_user_id IN (${u});` : "",
    u ? `DELETE FROM public.profiles WHERE id IN (${u});` : "",
    u ? `DELETE FROM auth.users WHERE id IN (${u});` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (sql) psql(sql);
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
      `P5 smoke requires local Supabase (\`npx supabase start\`). status failed: ${err.message}`,
    );
  }

  const status = parseEnvLines(raw);
  const apiUrl = status.API_URL;
  const anon = status.ANON_KEY || status.PUBLISHABLE_KEY;
  const service = status.SERVICE_ROLE_KEY || status.SECRET_KEY;

  if (!apiUrl || !anon || !service) {
    throw new Error("P5 smoke: supabase status missing keys");
  }
  if (!isLocalUrl(apiUrl)) {
    throw new Error(`P5 smoke refuses non-local API_URL (${apiUrl})`);
  }

  return { API_URL: apiUrl, ANON_KEY: anon, SERVICE_ROLE_KEY: service };
}

async function createUser(url, serviceKey, email, password) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`createUser failed: ${JSON.stringify(body)}`);
  if (!body?.id) throw new Error("createUser missing user id");
  return body.id;
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

async function expectFail(label, fn) {
  let failed = false;
  try {
    await fn();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error(`expected failure: ${label}`);
}

async function provisionActive(env, uid, email, pass) {
  await rpc(
    env.API_URL,
    env.SERVICE_ROLE_KEY,
    env.SERVICE_ROLE_KEY,
    "access_provision_account",
    { p_auth_user_id: uid },
  );
  const token = await login(env.API_URL, env.ANON_KEY, email, pass);
  const client = userClient(env.API_URL, env.ANON_KEY, token);
  const { data: acc, error } = await client
    .from("accounts")
    .select("id")
    .eq("auth_user_id", uid)
    .single();
  if (error || !acc) throw new Error(`account for ${email}: ${error?.message}`);
  await rpc(env.API_URL, env.ANON_KEY, token, "access_link_person", {
    p_account_id: acc.id,
    p_person_id: uid,
  });
  return { token, client, accountId: acc.id };
}

async function main() {
  const env = loadStatusEnv();
  const stamp = Date.now();
  const pass = "P5Smoke!pass9";
  const emails = {
    ordinary: `p5o-${stamp}@gmail.com`,
    red: `p5r-${stamp}@gmail.com`,
    adm: `p5a-${stamp}@gmail.com`,
    both: `p5b-${stamp}@gmail.com`,
  };
  const created = {
    users: [],
    businesses: [],
    memberships: [],
    contents: [],
    indicators: [],
    sources: [],
    values: [],
    orgs: [],
  };

  try {
    const uids = {};
    for (const [k, email] of Object.entries(emails)) {
      uids[k] = await createUser(
        env.API_URL,
        env.SERVICE_ROLE_KEY,
        email,
        pass,
      );
      created.users.push(uids[k]);
    }

    const ordinary = await provisionActive(
      env,
      uids.ordinary,
      emails.ordinary,
      pass,
    );
    const red = await provisionActive(env, uids.red, emails.red, pass);
    const adm = await provisionActive(env, uids.adm, emails.adm, pass);
    const both = await provisionActive(env, uids.both, emails.both, pass);

    // Bootstrap first Adm via service (not public UI).
    await rpc(
      env.API_URL,
      env.SERVICE_ROLE_KEY,
      env.SERVICE_ROLE_KEY,
      "assign_application_role",
      {
        p_account_id: adm.accountId,
        p_role_code: "amministratore_applicativo",
      },
    );

    // Adm assigns Red and Red+Adm roles.
    const redAssign = await rpc(
      env.API_URL,
      env.ANON_KEY,
      adm.token,
      "assign_application_role",
      { p_account_id: red.accountId, p_role_code: "redattore" },
    );
    await rpc(env.API_URL, env.ANON_KEY, adm.token, "assign_application_role", {
      p_account_id: both.accountId,
      p_role_code: "redattore",
    });
    await rpc(env.API_URL, env.ANON_KEY, adm.token, "assign_application_role", {
      p_account_id: both.accountId,
      p_role_code: "amministratore_applicativo",
    });

    const isEditor = async (token) =>
      rpc(env.API_URL, env.ANON_KEY, token, "access_is_editor");
    const isAdm = async (token) =>
      rpc(env.API_URL, env.ANON_KEY, token, "access_is_application_admin");

    if ((await isEditor(ordinary.token)) !== false) {
      throw new Error("ordinary should not be editor");
    }
    if ((await isAdm(ordinary.token)) !== false) {
      throw new Error("ordinary should not be adm");
    }
    if ((await isEditor(red.token)) !== true) throw new Error("red not editor");
    if ((await isAdm(red.token)) !== false) throw new Error("red must not be adm");
    if ((await isAdm(adm.token)) !== true) throw new Error("adm not admin");
    if ((await isEditor(adm.token)) !== false) {
      throw new Error("adm-only must not be editor");
    }
    if ((await isEditor(both.token)) !== true || (await isAdm(both.token)) !== true) {
      throw new Error("both must be editor+admin");
    }

    // Ordinary denied editorial insert + role assign.
    await expectFail("ordinary content insert", async () => {
      const { error } = await ordinary.client.from("contents").insert({
        owned_by_editorial: true,
        type_code: "news",
        language_id: 1,
        title: "nope",
        slug: `p5-ord-${stamp}`,
        body: "nope",
      });
      if (error) throw error;
    });
    await expectFail("ordinary assign role", async () => {
      await rpc(
        env.API_URL,
        env.ANON_KEY,
        ordinary.token,
        "assign_application_role",
        { p_account_id: red.accountId, p_role_code: "redattore" },
      );
    });

    // Adm-only denied editorial write.
    await expectFail("adm-only content insert", async () => {
      const { error } = await adm.client.from("contents").insert({
        owned_by_editorial: true,
        type_code: "news",
        language_id: 1,
        title: "adm no",
        slug: `p5-adm-${stamp}`,
        body: "adm no",
      });
      if (error) throw error;
    });

    // Self-elevate denied.
    await expectFail("self-elevate", async () => {
      await rpc(
        env.API_URL,
        env.ANON_KEY,
        adm.token,
        "assign_application_role",
        {
          p_account_id: adm.accountId,
          p_role_code: "redattore",
        },
      );
    });

    // Red: content create → edit → publish → public → withdraw.
    const contentSlug = `p5-content-${stamp}`;
    const { data: content, error: cInsErr } = await red.client
      .from("contents")
      .insert({
        owned_by_editorial: true,
        owner_person_id: null,
        owner_business_id: null,
        type_code: "news",
        language_id: 1,
        title: `P5 Content ${stamp}`,
        slug: contentSlug,
        body: "Corpo editoriale smoke P5.",
        editorial_status: "draft",
        publication_status: "unpublished",
        visibility_status: "private",
      })
      .select("id")
      .single();
    if (cInsErr || !content) throw new Error(`content insert: ${cInsErr?.message}`);
    created.contents.push(content.id);

    const { error: cEditErr } = await red.client
      .from("contents")
      .update({ subtitle: "updated" })
      .eq("id", content.id);
    if (cEditErr) throw new Error(`content edit: ${cEditErr.message}`);

    await red.client.from("content_authors").insert({
      content_id: content.id,
      role_kind: "editorial_responsible",
      person_id: uids.red,
      is_primary: true,
      sort_order: 0,
    });

    const now = new Date().toISOString();
    const { error: pubErr } = await red.client
      .from("contents")
      .update({
        editorial_status: "ready",
        publication_status: "published",
        visibility_status: "public",
        published_at: now,
        withdrawn_at: null,
      })
      .eq("id", content.id);
    if (pubErr) throw new Error(`content publish: ${pubErr.message}`);

    const anon = createClient(env.API_URL, env.ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: pubSee } = await anon
      .from("contents")
      .select("id, slug")
      .eq("slug", contentSlug)
      .maybeSingle();
    if (!pubSee) throw new Error("published content not visible publicly");

    const { error: wdErr } = await red.client
      .from("contents")
      .update({
        publication_status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
      })
      .eq("id", content.id);
    if (wdErr) throw new Error(`content withdraw: ${wdErr.message}`);

    const { data: pubGone } = await anon
      .from("contents")
      .select("id")
      .eq("id", content.id)
      .maybeSingle();
    if (pubGone) throw new Error("withdrawn content still public");

    // Osservatorio: source + indicator + value + revision.
    const { data: source, error: srcErr } = await red.client
      .from("observatory_statistical_sources")
      .insert({
        name: `P5 Source ${stamp}`,
        producer_name: "ISTAT smoke",
        publication_title: "Report smoke",
        lifecycle_status: "active",
      })
      .select("id")
      .single();
    if (srcErr || !source) throw new Error(`source: ${srcErr?.message}`);
    created.sources.push(source.id);

    const indSlug = `p5-ind-${stamp}`;
    const { data: indicator, error: indErr } = await red.client
      .from("observatory_indicators")
      .insert({
        code: `P5_IND_${stamp}`,
        slug: indSlug,
        title: `Indicatore P5 ${stamp}`,
        description: "Descrizione indicatore smoke.",
        purpose_text: "Scopo smoke.",
        methodology_summary: "Metodologia smoke aggregata.",
        value_nature: "count",
        unit_code: "units",
        periodicity: "annual",
        operational_status: "draft",
        publication_status: "unpublished",
      })
      .select("id")
      .single();
    if (indErr || !indicator) throw new Error(`indicator: ${indErr?.message}`);
    created.indicators.push(indicator.id);

    await expectFail("adm-only indicator insert", async () => {
      const { error } = await adm.client.from("observatory_indicators").insert({
        code: `P5_ADM_${stamp}`,
        slug: `p5-adm-ind-${stamp}`,
        title: "adm no",
        description: "x",
        purpose_text: "x",
        methodology_summary: "x",
        value_nature: "count",
        unit_code: "units",
        periodicity: "annual",
      });
      if (error) throw error;
    });

    const { error: indPubErr } = await red.client
      .from("observatory_indicators")
      .update({
        operational_status: "active",
        publication_status: "published",
        published_at: now,
        withdrawn_at: null,
      })
      .eq("id", indicator.id);
    if (indPubErr) throw new Error(`indicator publish: ${indPubErr.message}`);

    const { data: indPub } = await anon
      .from("observatory_indicators")
      .select("id")
      .eq("slug", indSlug)
      .maybeSingle();
    if (!indPub) throw new Error("published indicator not public");

    const { data: value1, error: v1Err } = await red.client
      .from("observatory_indicator_values")
      .insert({
        indicator_id: indicator.id,
        source_id: source.id,
        numeric_value: 12,
        period_start: "2024-01-01",
        period_end: "2024-12-31",
        status: "provisional",
        quality_code: "official",
        published_at: now,
      })
      .select("id")
      .single();
    if (v1Err || !value1) throw new Error(`value create: ${v1Err?.message}`);
    created.values.push(value1.id);

    // Withdraw predecessor first (partial unique index on non-withdrawn keys).
    const { error: v1WdErr } = await red.client
      .from("observatory_indicator_values")
      .update({ status: "withdrawn", withdrawn_at: now })
      .eq("id", value1.id);
    if (v1WdErr) throw new Error(`value withdraw previous: ${v1WdErr.message}`);

    const { data: value2, error: v2Err } = await red.client
      .from("observatory_indicator_values")
      .insert({
        indicator_id: indicator.id,
        source_id: source.id,
        numeric_value: 15,
        period_start: "2024-01-01",
        period_end: "2024-12-31",
        status: "revised",
        quality_code: "official",
        supersedes_value_id: value1.id,
        published_at: now,
        revised_at: now,
      })
      .select("id")
      .single();
    if (v2Err || !value2) throw new Error(`value revise insert: ${v2Err?.message}`);
    created.values.push(value2.id);

    // Organizzazioni editorial + official ≠ admin.
    const orgSlug = `p5-org-${stamp}`;
    const { data: org, error: orgErr } = await red.client
      .from("organizations")
      .insert({
        owned_by_editorial: true,
        owner_person_id: null,
        owner_business_id: null,
        type_code: "association",
        name: `Org P5 ${stamp}`,
        slug: orgSlug,
        description: "Organizzazione editoriale smoke.",
        operational_status: "active",
      })
      .select("id")
      .single();
    if (orgErr || !org) throw new Error(`org insert: ${orgErr?.message}`);
    created.orgs.push(org.id);

    const { error: offErr } = await red.client.from("organization_officials").insert({
      organization_id: org.id,
      role_kind: "president",
      person_id: null,
      display_label: "Presidente Smoke",
      is_primary: true,
      sort_order: 0,
    });
    if (offErr) throw new Error(`official insert: ${offErr.message}`);

    if ((await isAdm(ordinary.token)) !== false) {
      throw new Error("official path must not elevate ordinary");
    }

    const { error: orgPubErr } = await red.client
      .from("organizations")
      .update({
        editorial_status: "ready",
        publication_status: "published",
        visibility_status: "public",
        published_at: now,
        withdrawn_at: null,
      })
      .eq("id", org.id);
    if (orgPubErr) throw new Error(`org publish: ${orgPubErr.message}`);

    // Business bootstrap: ordinary denied, Adm allowed.
    const bizId = crypto.randomUUID();
    const { error: bizErr } = await ordinary.client.from("businesses").insert({
      id: bizId,
      legal_name: `P5 Biz ${stamp}`,
      public_name: `P5 Biz Pub ${stamp}`,
    });
    if (bizErr) throw new Error(`business insert: ${bizErr.message}`);
    created.businesses.push(bizId);

    const { data: mem, error: memErr } = await ordinary.client
      .from("business_memberships")
      .insert({
        person_id: uids.ordinary,
        business_id: bizId,
        role_id: "founder",
        editorial_status: "declared",
        relation_status: "active",
      })
      .select("id")
      .single();
    if (memErr || !mem) throw new Error(`membership: ${memErr?.message}`);
    created.memberships.push(mem.id);

    await expectFail("ordinary bootstrap", async () => {
      await rpc(
        env.API_URL,
        env.ANON_KEY,
        ordinary.token,
        "access_bootstrap_business_grant",
        { p_membership_id: mem.id },
      );
    });

    await rpc(
      env.API_URL,
      env.ANON_KEY,
      adm.token,
      "access_bootstrap_business_grant",
      { p_membership_id: mem.id },
    );

    const act = await rpc(
      env.API_URL,
      env.ANON_KEY,
      ordinary.token,
      "access_can_act_for_business",
      { p_business_id: bizId },
    );
    if (act !== true) throw new Error("expected ACT after Adm bootstrap");

    // Revoke Red assignment (idempotent path).
    await rpc(
      env.API_URL,
      env.ANON_KEY,
      adm.token,
      "revoke_application_role",
      { p_assignment_id: redAssign },
    );
    if ((await isEditor(red.token)) !== false) {
      throw new Error("red should lose editor after revoke");
    }

    // Red-only cannot assign Adm (already revoked; re-check with ordinary).
    await expectFail("red assign adm", async () => {
      await rpc(
        env.API_URL,
        env.ANON_KEY,
        red.token,
        "assign_application_role",
        {
          p_account_id: ordinary.accountId,
          p_role_code: "amministratore_applicativo",
        },
      );
    });

    console.log("P5_SMOKE_PASS");
  } finally {
    try {
      cleanup(created);
      console.log("P5_SMOKE_CLEANUP_DONE");
    } catch (err) {
      console.error("P5_SMOKE_CLEANUP_FAIL", err.message ?? err);
    }
  }
}

main().catch((err) => {
  console.error("P5_SMOKE_FAIL", err.message ?? err);
  process.exit(1);
});
