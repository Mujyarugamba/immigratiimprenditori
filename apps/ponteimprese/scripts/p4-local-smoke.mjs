/**
 * Local-only P4 smoke: public RLS visibility across all catalogued domains.
 * Uses `supabase status -o env` (never remote .env.local). Cleans fixtures via psql.
 */
import { execFileSync, execSync } from "node:child_process";
import { randomUUID } from "node:crypto";

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

function psqlScalar(sql) {
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
      "-tA",
      "-c",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
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
      `P4 smoke requires a running local Supabase (\`npx supabase start\`). status failed: ${err.message}`,
    );
  }

  const status = parseEnvLines(raw);
  const apiUrl = status.API_URL;
  const anon = status.ANON_KEY || status.PUBLISHABLE_KEY;
  const service = status.SERVICE_ROLE_KEY || status.SECRET_KEY;

  if (!apiUrl || !anon || !service) {
    throw new Error(
      "P4 smoke: supabase status missing API_URL / ANON_KEY|PUBLISHABLE_KEY / SERVICE_ROLE_KEY|SECRET_KEY",
    );
  }
  if (!isLocalUrl(apiUrl)) {
    throw new Error(
      `P4 smoke refuses non-local API_URL (${apiUrl}). Local-only test.`,
    );
  }

  return {
    API_URL: apiUrl,
    ANON_KEY: anon,
    SERVICE_ROLE_KEY: service,
  };
}

async function anonGet(apiUrl, anonKey, table, query = "") {
  const url = `${apiUrl}/rest/v1/${table}${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : [];
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`anon GET ${table} failed (${res.status}): ${text}`);
  }
  return data;
}

async function assertAnonVisible(apiUrl, anonKey, table, filter, label) {
  const rows = await anonGet(apiUrl, anonKey, table, filter);
  if (!Array.isArray(rows) || rows.length < 1) {
    throw new Error(`${label}: expected public row visible via anon, got ${JSON.stringify(rows)}`);
  }
}

async function assertAnonHidden(apiUrl, anonKey, table, filter, label) {
  const rows = await anonGet(apiUrl, anonKey, table, filter);
  if (!Array.isArray(rows) || rows.length !== 0) {
    throw new Error(`${label}: expected non-public row hidden, got ${JSON.stringify(rows)}`);
  }
}

function buildFixturesSql(ids, tag, languageId) {
  const s = (v) => sqlLiteral(v);
  return `
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES
      (${s(ids.personOwner)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${s(`p4-owner-${tag}@gmail.com`)}, crypt('P4Smoke!pass9', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
      (${s(ids.personProPub)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${s(`p4-pro-pub-${tag}@gmail.com`)}, crypt('P4Smoke!pass9', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
      (${s(ids.personProPriv)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${s(`p4-pro-priv-${tag}@gmail.com`)}, crypt('P4Smoke!pass9', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.businesses (
      id, legal_name, public_name, publication_status, substantial_status, editorial_status
    ) VALUES
      (${s(ids.bizPublic)}, ${s(`P4 Legal Pub ${tag}`)}, ${s(`P4 Pub ${tag}`)}, 'public', 'active', 'complete'),
      (${s(ids.bizPrivate)}, ${s(`P4 Legal Priv ${tag}`)}, ${s(`P4 Priv ${tag}`)}, 'unpublished', 'active', 'draft');

    INSERT INTO public.professional_profiles (
      id, person_id, headline, publication_status, visibility_status, editorial_status
    ) VALUES
      (${s(ids.proPublic)}, ${s(ids.personProPub)}, ${s(`P4 Pro Pub ${tag}`)}, 'published', 'public', 'published'),
      (${s(ids.proPrivate)}, ${s(ids.personProPriv)}, ${s(`P4 Pro Priv ${tag}`)}, 'unpublished', 'private', 'draft');

    INSERT INTO public.opportunities (
      id, title, origin, publication_status, visibility_level, editorial_status, platform_published_at
    ) VALUES
      (${s(ids.oppPublic)}, ${s(`P4 Opp Pub ${tag}`)}, 'external', 'published', 'public', 'approved', now()),
      (${s(ids.oppPrivate)}, ${s(`P4 Opp Priv ${tag}`)}, 'external', 'unpublished', 'private', 'draft', null);

    INSERT INTO public.service_offers (
      id, owner_person_id, category_code, title, description,
      publication_status, visibility_status, editorial_status, published_at
    ) VALUES
      (${s(ids.offerPublic)}, ${s(ids.personOwner)}, 'linguistic', ${s(`P4 Offer Pub ${tag}`)}, 'desc', 'published', 'public', 'ready', now()),
      (${s(ids.offerPrivate)}, ${s(ids.personOwner)}, 'linguistic', ${s(`P4 Offer Priv ${tag}`)}, 'desc', 'unpublished', 'private', 'draft', null);

    INSERT INTO public.service_requests (
      id, owner_person_id, category_code, title, description,
      publication_status, visibility_status, editorial_status, published_at
    ) VALUES
      (${s(ids.requestPublic)}, ${s(ids.personOwner)}, 'training', ${s(`P4 Request Pub ${tag}`)}, 'desc', 'published', 'public', 'ready', now()),
      (${s(ids.requestPrivate)}, ${s(ids.personOwner)}, 'training', ${s(`P4 Request Priv ${tag}`)}, 'desc', 'unpublished', 'private', 'draft', null);

    INSERT INTO public.events (
      id, owner_person_id, type_code, title, description,
      publication_status, visibility_status, editorial_status, published_at
    ) VALUES
      (${s(ids.eventPublic)}, ${s(ids.personOwner)}, 'networking', ${s(`P4 Event Pub ${tag}`)}, 'desc', 'published', 'public', 'ready', now()),
      (${s(ids.eventPrivate)}, ${s(ids.personOwner)}, 'networking', ${s(`P4 Event Priv ${tag}`)}, 'desc', 'unpublished', 'private', 'draft', null);

    INSERT INTO public.event_editions (
      id, event_id, starts_at, timezone, delivery_mode, occurrence_status, city_text
    ) VALUES
      (${s(ids.editionPublic)}, ${s(ids.eventPublic)}, now() + interval '7 days', 'Europe/Rome', 'in_presence', 'scheduled', 'Roma');

    INSERT INTO public.collaborations (
      id, owned_by_editorial, registered_by_person_id, promoter_person_id, form_code, title, object_text, purpose_text, slug,
      editorial_status, published_at
    ) VALUES
      (${s(ids.collabPublic)}, true, ${s(ids.personOwner)}, ${s(ids.personOwner)}, 'ricerca', ${s(`P4 Collab Pub ${tag}`)}, 'object', 'purpose', ${s(`${tag}-collab-pub`)}, 'published', now()),
      (${s(ids.collabPrivate)}, true, ${s(ids.personOwner)}, ${s(ids.personOwner)}, 'offerta', ${s(`P4 Collab Priv ${tag}`)}, 'object', 'purpose', ${s(`${tag}-collab-priv`)}, 'draft', null);

    INSERT INTO public.international_markets (
      id, code, name, market_kind, editorial_status
    ) VALUES
      (${s(ids.marketPublic)}, ${s(`${tag}-m-pub`)}, ${s(`P4 Market Pub ${tag}`)}, 'country', 'published'),
      (${s(ids.marketPrivate)}, ${s(`${tag}-m-priv`)}, ${s(`P4 Market Priv ${tag}`)}, 'country', 'drafting');

    INSERT INTO public.organizations (
      id, owned_by_editorial, type_code, name, description, slug,
      publication_status, visibility_status, editorial_status, published_at
    ) VALUES
      (${s(ids.orgPublic)}, true, 'association', ${s(`P4 Org Pub ${tag}`)}, 'desc', ${s(`${tag}-org-pub`)}, 'published', 'public', 'ready', now()),
      (${s(ids.orgPrivate)}, true, 'association', ${s(`P4 Org Priv ${tag}`)}, 'desc', ${s(`${tag}-org-priv`)}, 'unpublished', 'private', 'draft', null);

    INSERT INTO public.observatory_statistical_sources (
      id, name, producer_name, publication_title, lifecycle_status
    ) VALUES
      (${s(ids.obsSource)}, ${s(`P4 Source ${tag}`)}, 'ISTAT', 'Pub title', 'active');

    INSERT INTO public.observatory_indicators (
      id, code, slug, title, description, purpose_text, methodology_summary,
      value_nature, unit_code, periodicity, operational_status, publication_status, published_at
    ) VALUES
      (${s(ids.indicatorPublic)}, ${s(`${tag}-ind-pub`)}, ${s(`${tag}-indicator-pub`)}, ${s(`P4 Indicator Pub ${tag}`)}, 'desc', 'purpose', 'method', 'count', 'units', 'annual', 'active', 'published', now()),
      (${s(ids.indicatorPrivate)}, ${s(`${tag}-ind-priv`)}, ${s(`${tag}-indicator-priv`)}, ${s(`P4 Indicator Priv ${tag}`)}, 'desc', 'purpose', 'method', 'count', 'units', 'annual', 'active', 'unpublished', null);

    INSERT INTO public.observatory_indicator_values (
      id, indicator_id, source_id, numeric_value, period_start, period_end, quality_code, published_at, status
    ) VALUES
      (${s(ids.indicatorValue)}, ${s(ids.indicatorPublic)}, ${s(ids.obsSource)}, 42, '2024-01-01', '2024-12-31', 'official', now(), 'final');

    INSERT INTO public.contents (
      id, owned_by_editorial, type_code, language_id, title, body, slug,
      publication_status, visibility_status, editorial_status, published_at
    ) VALUES
      (${s(ids.contentPublic)}, true, 'news', ${languageId}, ${s(`P4 Content Pub ${tag}`)}, 'body', ${s(`${tag}-content-pub`)}, 'published', 'public', 'ready', now()),
      (${s(ids.contentPrivate)}, true, 'news', ${languageId}, ${s(`P4 Content Priv ${tag}`)}, 'body', ${s(`${tag}-content-priv`)}, 'unpublished', 'private', 'draft', null);
  `;
}

function cleanupFixturesSql(ids) {
  assertUuids(Object.values(ids));
  const q = (arr) => arr.map((id) => `'${id}'`).join(",");

  const sql = [
    `DELETE FROM public.observatory_indicator_values WHERE id IN (${q([ids.indicatorValue])});`,
    `DELETE FROM public.observatory_indicators WHERE id IN (${q([ids.indicatorPublic, ids.indicatorPrivate])});`,
    `DELETE FROM public.observatory_statistical_sources WHERE id IN (${q([ids.obsSource])});`,
    `DELETE FROM public.contents WHERE id IN (${q([ids.contentPublic, ids.contentPrivate])});`,
    `DELETE FROM public.event_editions WHERE id IN (${q([ids.editionPublic])});`,
    `DELETE FROM public.events WHERE id IN (${q([ids.eventPublic, ids.eventPrivate])});`,
    `DELETE FROM public.service_offers WHERE id IN (${q([ids.offerPublic, ids.offerPrivate])});`,
    `DELETE FROM public.service_requests WHERE id IN (${q([ids.requestPublic, ids.requestPrivate])});`,
    `DELETE FROM public.professional_profiles WHERE id IN (${q([ids.proPublic, ids.proPrivate])});`,
    `DELETE FROM public.collaborations WHERE id IN (${q([ids.collabPublic, ids.collabPrivate])});`,
    `DELETE FROM public.international_markets WHERE id IN (${q([ids.marketPublic, ids.marketPrivate])});`,
    `DELETE FROM public.organizations WHERE id IN (${q([ids.orgPublic, ids.orgPrivate])});`,
    `DELETE FROM public.opportunities WHERE id IN (${q([ids.oppPublic, ids.oppPrivate])});`,
    `DELETE FROM public.businesses WHERE id IN (${q([ids.bizPublic, ids.bizPrivate])});`,
    `DELETE FROM public.profiles WHERE id IN (${q([ids.personOwner, ids.personProPub, ids.personProPriv])});`,
    `DELETE FROM auth.users WHERE id IN (${q([ids.personOwner, ids.personProPub, ids.personProPriv])});`,
  ].join(" ");

  psql(sql);
}

async function main() {
  const env = loadStatusEnv();
  const stamp = Date.now();
  const tag = `p4-${stamp}`;

  const ids = {
    personOwner: randomUUID(),
    personProPub: randomUUID(),
    personProPriv: randomUUID(),
    bizPublic: randomUUID(),
    bizPrivate: randomUUID(),
    proPublic: randomUUID(),
    proPrivate: randomUUID(),
    oppPublic: randomUUID(),
    oppPrivate: randomUUID(),
    offerPublic: randomUUID(),
    offerPrivate: randomUUID(),
    requestPublic: randomUUID(),
    requestPrivate: randomUUID(),
    eventPublic: randomUUID(),
    eventPrivate: randomUUID(),
    editionPublic: randomUUID(),
    collabPublic: randomUUID(),
    collabPrivate: randomUUID(),
    marketPublic: randomUUID(),
    marketPrivate: randomUUID(),
    orgPublic: randomUUID(),
    orgPrivate: randomUUID(),
    obsSource: randomUUID(),
    indicatorPublic: randomUUID(),
    indicatorPrivate: randomUUID(),
    indicatorValue: randomUUID(),
    contentPublic: randomUUID(),
    contentPrivate: randomUUID(),
  };

  try {
    const languageId = psqlScalar(
      "SELECT id FROM public.languages WHERE code = 'it' LIMIT 1;",
    );
    if (!languageId) {
      throw new Error("catalog missing languages.code=it — run migrations first");
    }

    const microTables = psqlScalar(
      "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%microdata%';",
    );
    if (microTables !== "0") {
      throw new Error(`unexpected public microdata table(s): count=${microTables}`);
    }

    try {
      psql(buildFixturesSql(ids, tag, languageId));
    } catch (err) {
      throw new Error(`fixture INSERT failed (schema/CHECK?): ${err.message ?? err}`);
    }

    const enc = encodeURIComponent;

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "businesses",
      `select=id&public_name=ilike.*${enc(`P4 Pub ${tag}`)}*`,
      "businesses public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "businesses",
      `select=id&id=eq.${ids.bizPrivate}`,
      "businesses private",
    );
    await anonGet(env.API_URL, env.ANON_KEY, "businesses", `select=id&id=eq.${ids.bizPublic}`);

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "professional_profiles",
      `select=id&id=eq.${ids.proPublic}`,
      "professionals public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "professional_profiles",
      `select=id&id=eq.${ids.proPrivate}`,
      "professionals private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "opportunities",
      `select=id&id=eq.${ids.oppPublic}`,
      "opportunities public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "opportunities",
      `select=id&id=eq.${ids.oppPrivate}`,
      "opportunities private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "service_offers",
      `select=id&title=ilike.*${enc(`P4 Offer Pub ${tag}`)}*`,
      "service_offers public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "service_offers",
      `select=id&id=eq.${ids.offerPrivate}`,
      "service_offers private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "service_requests",
      `select=id&id=eq.${ids.requestPublic}`,
      "service_requests public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "service_requests",
      `select=id&id=eq.${ids.requestPrivate}`,
      "service_requests private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "events",
      `select=id,event_editions(id)&id=eq.${ids.eventPublic}`,
      "events public + edition",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "events",
      `select=id&id=eq.${ids.eventPrivate}`,
      "events private",
    );
    const eventRows = await anonGet(
      env.API_URL,
      env.ANON_KEY,
      "events",
      `select=event_editions(id)&id=eq.${ids.eventPublic}`,
    );
    if (!eventRows[0]?.event_editions?.length) {
      throw new Error("events public: expected nested event_editions visible");
    }

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "collaborations",
      `select=slug&id=eq.${ids.collabPublic}`,
      "collaborations public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "collaborations",
      `select=id&slug=eq.${tag}-collab-priv`,
      "collaborations private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "international_markets",
      `select=code&id=eq.${ids.marketPublic}`,
      "markets public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "international_markets",
      `select=id&code=eq.${tag}-m-priv`,
      "markets private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "organizations",
      `select=slug&id=eq.${ids.orgPublic}`,
      "organizations public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "organizations",
      `select=id&slug=eq.${tag}-org-priv`,
      "organizations private",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "observatory_indicators",
      `select=slug&id=eq.${ids.indicatorPublic}`,
      "observatory indicator public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "observatory_indicators",
      `select=id&slug=eq.${tag}-indicator-priv`,
      "observatory indicator private",
    );

    const values = await anonGet(
      env.API_URL,
      env.ANON_KEY,
      "observatory_indicator_values",
      `select=id,numeric_value,source_id&indicator_id=eq.${ids.indicatorPublic}`,
    );
    if (!values.length || Number(values[0].numeric_value) !== 42) {
      throw new Error(`observatory values: expected published aggregate, got ${JSON.stringify(values)}`);
    }
    const sources = await anonGet(
      env.API_URL,
      env.ANON_KEY,
      "observatory_statistical_sources",
      `select=id&id=eq.${ids.obsSource}`,
    );
    if (!sources.length) {
      throw new Error("observatory sources: expected active source visible");
    }
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "observatory_indicator_values",
      `select=id&indicator_id=eq.${ids.indicatorPrivate}`,
      "observatory values for unpublished indicator",
    );

    await assertAnonVisible(
      env.API_URL,
      env.ANON_KEY,
      "contents",
      `select=slug&id=eq.${ids.contentPublic}`,
      "contents public",
    );
    await assertAnonHidden(
      env.API_URL,
      env.ANON_KEY,
      "contents",
      `select=id&slug=eq.${tag}-content-priv`,
      "contents private/draft",
    );

    console.log("P4_SMOKE_PASS");
  } finally {
    try {
      cleanupFixturesSql(ids);
      console.log("P4_SMOKE_CLEANUP_DONE");
    } catch (err) {
      console.error("P4_SMOKE_CLEANUP_FAIL", err.message ?? err);
    }
  }
}

main().catch((err) => {
  console.error("P4_SMOKE_FAIL", err.message ?? err);
  process.exit(1);
});
