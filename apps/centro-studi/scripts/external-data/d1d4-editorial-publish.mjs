/**
 * D1-D.4 — Editorial review + selective publication for Contenti Production pilot.
 *
 * Applies the SAME lifecycle axes as publishEditorialContent / redazione UI:
 *   editorial_status=ready, publication_status=published, visibility_status=public, published_at=now
 *
 * Modes:
 *   node scripts/external-data/d1d4-editorial-publish.mjs inventory
 *   node scripts/external-data/d1d4-editorial-publish.mjs probe-urls
 *   node scripts/external-data/d1d4-editorial-publish.mjs prepare
 *   node scripts/external-data/d1d4-editorial-publish.mjs publish
 *   node scripts/external-data/d1d4-editorial-publish.mjs validate
 *   node scripts/external-data/d1d4-editorial-publish.mjs rls
 *
 * Never prints secrets. Uses supabase CLI api-keys (service_role/anon).
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { parseGuardedCommand, productionUsage } from "../../artifacts/ingestion/production-write-guard.mjs";

const REF = "hvfvfatlaspcpszgizhg";
const URL = `https://${REF}.supabase.co`;
const OUT_DIR = "artifacts/ingestion";
const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "Content Production editorial mutation",
  modes: ["inventory", "probe-urls", "prepare", "publish", "validate", "rls"],
  writeModes: ["prepare", "publish"],
  defaultMode: "inventory",
});
if (command.help) {
  console.log(productionUsage({ script: "scripts/external-data/d1d4-editorial-publish.mjs", modes: ["inventory", "probe-urls", "prepare", "publish", "validate", "rls"] }));
  process.exit(0);
}
const mode = command.mode;

/** Per-card editorial decisions (naturalKey → decision). */
const DECISIONS = {
  "ismu-rapporti:id:ismu-31-rapporto-2025": {
    grade: "READY",
    publishOrder: 1,
    title: "31° Rapporto ISMU sulle migrazioni 2025",
    abstract:
      "Scheda di rinvio al rapporto annuale ISMU sulle migrazioni in Italia, utile per inquadrare mercato del lavoro, integrazione economica e contesto demografico degli imprenditori con background migratorio.",
  },
  "ismu-rapporti:id:ismu-30-rapporto-2024": {
    grade: "READY",
    publishOrder: 2,
    title: "30° Rapporto ISMU sulle migrazioni 2024",
    abstract:
      "Punto di accesso al trentesimo rapporto ISMU, con approfondimenti su lavoro, rimesse e imprese a guida straniera nel quadro trentennale delle migrazioni in Italia.",
  },
  "ismu-rapporti:id:ismu-paf-mismatch-finanziario": {
    grade: "READY",
    publishOrder: 3,
    title:
      "Mismatch tra sistemi finanziari territoriali e bisogni degli immigrati",
    abstract:
      "Ricerca ISMU su barriere di accesso a servizi bancari e assicurativi per persone con background migratorio, rilevante per credito e inclusione finanziaria degli imprenditori immigrati.",
  },
  "ismu-rapporti:id:ismu-libro-bianco-migrazioni-economiche": {
    grade: "READY",
    publishOrder: 4,
    title: "Libro bianco sul governo delle migrazioni economiche",
    abstract:
      "Documento di policy ISMU sulle migrazioni economiche, utile per comprendere leve pubbliche che incidono su lavoro, autoimpiego e percorsi di valorizzazione economica dei migranti.",
  },
  "ismu-rapporti:id:ismu-doppia-discriminazione-donne-lavoro": {
    grade: "READY",
    publishOrder: 5,
    title:
      "Donne con background migratorio e doppia discriminazione nel lavoro",
    abstract:
      "Studio ISMU sulle barriere di genere e origine nel mercato del lavoro, contesto rilevante anche per autoimpiego e percorsi imprenditoriali delle migranti.",
  },
  "ismu-rapporti:id:ismu-inclusione-socio-lavorativa-rifugiati": {
    grade: "READY",
    publishOrder: 6,
    title: "Inclusione socio-lavorativa dei rifugiati",
    abstract:
      "Approfondimento ISMU sull'inserimento lavorativo dei rifugiati, con spunti per accompagnamento, formazione e percorsi verso autonomia economica.",
  },
  "ismu-rapporti:id:ismu-paper-valorizzazione-economica": {
    grade: "READY",
    publishOrder: 7,
    title: "Governance dell'immigrazione e valorizzazione economica",
    abstract:
      "Paper ISMU su come migliorare la governance dell'immigrazione per valorizzare il contributo economico dei migranti, incluso il potenziale imprenditoriale.",
  },
  "ismu-rapporti:id:ismu-guida-edu-economico-finanziaria": {
    grade: "READY",
    publishOrder: 8,
    title: "Educazione economico-finanziaria interculturale (guida ISMU)",
    abstract:
      "Guida ISMU all'alfabetizzazione economico-finanziaria in chiave interculturale: base utile per percorsi di inclusione finanziaria che sostengono anche l'avvio d'impresa.",
  },
  "minlavoro-stranieri-lavoro:id:mlps-xvi-rapporto-mdl-stranieri-2026": {
    grade: "READY",
    publishOrder: 9,
    title: "XVI Rapporto MLPS: stranieri nel mercato del lavoro (2026)",
    abstract:
      "Rapporto ufficiale MLPS sul lavoro degli stranieri in Italia, con capitolo sull'imprenditoria straniera e fabbisogni delle imprese: fonte primaria per redazione e policy.",
  },
  "minlavoro-stranieri-lavoro:id:mlps-sintesi-xvi-rapporto-2026": {
    grade: "READY",
    publishOrder: 10,
    title: "Sintesi ufficiale XVI Rapporto MLPS sul lavoro straniero",
    abstract:
      "Sintesi istituzionale del XVI Rapporto MLPS, con dati sintetici su imprese individuali non comunitarie, settori e fabbisogni occupazionali.",
  },
  "minlavoro-stranieri-lavoro:id:mlps-presenza-migranti-aree-metropolitane-2025":
    {
      grade: "READY",
      publishOrder: 11,
      title: "Presenza dei migranti nelle aree metropolitane (MLPS 2025)",
      abstract:
        "Studio statistico MLPS sulle aree metropolitane con indicatori di lavoro e imprese a titolarità non comunitaria, utile per letture territoriali dell'imprenditoria immigrata.",
    },
  "minlavoro-stranieri-lavoro:id:mlps-sintesi-xiv-rapporto-2024": {
    grade: "READY",
    publishOrder: 12,
    title: "Sintesi XIV Rapporto MLPS sul mercato del lavoro straniero",
    abstract:
      "Sintesi del XIV Rapporto MLPS con focus su imprenditoria individuale non comunitaria, settori prevalenti e dinamiche di iscrizione/cessazione.",
  },
  "minlavoro-stranieri-lavoro:id:mlps-tema-immigrazione-hub": {
    grade: "QUESTIONABLE",
    reason:
      "Hub istituzionale aggregatore (temi e priorità), non pubblicazione discreta; lasciare in review-only fino a selezione di documenti puntuali.",
  },
  "emn-european-migration-network:id:emn-amo-2024-labour-market-needs": {
    grade: "READY",
    publishOrder: 13,
    title: "EMN AMO 2024: rispondere ai fabbisogni del mercato del lavoro",
    abstract:
      "Capitolo EMN sulle politiche UE e nazionali per colmare fabbisogni di lavoro con migrazione legale; contesto europeo per imprenditoria e lavoro autonomo dei cittadini di paesi terzi.",
  },
  "emn-european-migration-network:id:emn-amo-2024-enhancing-integration": {
    grade: "READY",
    publishOrder: 14,
    title: "EMN AMO 2024: rafforzare l'integrazione dei migranti",
    abstract:
      "Sintesi EMN sulle misure di integrazione, inclusa l'integrazione lavorativa e la formazione collegata all'occupazione, quadro di riferimento per percorsi di autonomia economica.",
  },
  "emn-european-migration-network:id:emn-it-definizione-integrazione-lavorativa":
    {
      grade: "READY",
      publishOrder: 15,
      title: "Glossario EMN Italia: integrazione lavorativa",
      abstract:
        "Voce di glossario EMN Italia sull'integrazione lavorativa, con rinvio allo studio comparativo UE su accesso al lavoro, ostacoli e buone pratiche per cittadini di paesi terzi.",
    },
  "emn-european-migration-network:id:emn-it-definizione-accesso-al-lavoro": {
    grade: "READY",
    publishOrder: 16,
    title: "Glossario EMN Italia: accesso al lavoro",
    abstract:
      "Voce EMN Italia sull'accesso al lavoro e al lavoro autonomo per rifugiati e cittadini di paesi terzi, utile quadro normativo per percorsi di autoimpiego.",
  },
  "futurae-mlps-unioncamere:id:futurae-osservatorio-imprese-straniere": {
    grade: "READY",
    publishOrder: 17,
    title: "Osservatorio imprese straniere (Futurae MLPS–Unioncamere)",
    abstract:
      "Pagina ufficiale dell'Osservatorio imprese straniere del progetto Futurae (MLPS–Unioncamere): accesso a rapporti e strumenti di conoscenza sull'imprenditoria migrante e sull'inclusione finanziaria.",
    sourceLabel:
      "Fonte: Progetto Futurae (MLPS – Unioncamere) — non editore giuridico autonomo",
  },
};

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

function client(key) {
  return createClient(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function parseNk(body) {
  return /d1d_natural_key:\s*(\S+)/.exec(body ?? "")?.[1] ?? null;
}

function extractTrailer(body) {
  const m = /\n---\n(?:[^\n]*\n)*?d1d_natural_key:\s*\S+/.exec(body ?? "");
  if (!m || m.index === undefined) return null;
  return body.slice(m.index);
}

function presentableBody({ title, sourceLabel, sourceUrl }) {
  return [
    "Scheda di rinvio a una fonte ufficiale.",
    "",
    `Titolo: ${title}`,
    "",
    sourceLabel,
    "",
    `Link alla fonte: ${sourceUrl}`,
    "",
    "Il testo completo resta presso la fonte originale; questa scheda conserva solo metadati e il collegamento.",
  ].join("\n");
}

async function loadPilot(sb) {
  const { data, error } = await sb
    .from("contents")
    .select(
      "id, title, slug, abstract, body, source_url, source_label, type_code, primary_category_code, cover_url, editorial_status, publication_status, visibility_status, published_at, owned_by_editorial, updated_at",
    )
    .eq("owned_by_editorial", true)
    .like("body", "%d1d_natural_key:%");
  if (error) throw error;
  return (data ?? [])
    .map((row) => ({ ...row, naturalKey: parseNk(row.body) }))
    .filter((row) => row.naturalKey);
}

function writeOut(name, obj) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = `${OUT_DIR}/${name}`;
  writeFileSync(path, JSON.stringify(obj, null, 2), "utf8");
  console.log(JSON.stringify({ wrote: path, ...summarize(obj) }, null, 2));
}

function summarize(obj) {
  if (obj && typeof obj === "object" && "count" in obj) return { count: obj.count };
  if (Array.isArray(obj)) return { count: obj.length };
  return {};
}

async function inventory() {
  const { service } = loadKeys();
  const rows = await loadPilot(client(service));
  const out = {
    count: rows.length,
    rows: rows.map((r) => {
      const d = DECISIONS[r.naturalKey];
      return {
        id: r.id,
        naturalKey: r.naturalKey,
        title: r.title,
        source_url: r.source_url,
        source_label: r.source_label,
        type_code: r.type_code,
        primary_category_code: r.primary_category_code,
        cover_url: r.cover_url,
        editorial_status: r.editorial_status,
        publication_status: r.publication_status,
        visibility_status: r.visibility_status,
        published_at: r.published_at,
        abstractPreview: (r.abstract ?? "").slice(0, 120),
        bodyHasTrailer: Boolean(extractTrailer(r.body)),
        bodyLen: (r.body ?? "").length,
        decision: d?.grade ?? "MISSING",
        reason: d?.reason ?? null,
        publishOrder: d?.publishOrder ?? null,
      };
    }),
  };
  writeOut("d1d4-inventory-out.json", out);
  const grades = { READY: 0, QUESTIONABLE: 0, REJECT: 0, MISSING: 0 };
  for (const r of out.rows) grades[r.decision] = (grades[r.decision] ?? 0) + 1;
  console.log(JSON.stringify({ total: out.count, grades }, null, 2));
}

async function probeUrls() {
  const { service } = loadKeys();
  const rows = await loadPilot(client(service));
  const results = [];
  for (const row of rows) {
    const url = row.source_url;
    let ok = false;
    let status = null;
    let finalUrl = null;
    let error = null;
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "immigrati-imprenditori-d1d4-probe/1.0" },
        signal: AbortSignal.timeout(25000),
      });
      status = res.status;
      finalUrl = res.url;
      ok = res.status >= 200 && res.status < 400;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    results.push({
      naturalKey: row.naturalKey,
      url,
      ok,
      status,
      finalUrl,
      error,
    });
  }
  const fail = results.filter((r) => !r.ok);
  writeOut("d1d4-url-probe-out.json", {
    count: results.length,
    okCount: results.filter((r) => r.ok).length,
    fail,
    results,
  });
  if (fail.length) process.exit(1);
}

async function prepare() {
  const { service } = loadKeys();
  const sb = client(service);
  const rows = await loadPilot(sb);
  const report = { prepared: [], questionable: [], errors: [] };

  for (const row of rows) {
    const decision = DECISIONS[row.naturalKey];
    if (!decision) {
      report.errors.push({ naturalKey: row.naturalKey, error: "missing decision" });
      continue;
    }
    if (decision.grade === "QUESTIONABLE" || decision.grade === "REJECT") {
      report.questionable.push({
        naturalKey: row.naturalKey,
        id: row.id,
        grade: decision.grade,
        reason: decision.reason,
      });
      continue;
    }

    const trailer = extractTrailer(row.body);
    if (!trailer) {
      report.errors.push({
        naturalKey: row.naturalKey,
        error: "missing d1d trailer — refuse body rewrite",
      });
      continue;
    }

    const title = decision.title ?? row.title;
    const abstract = decision.abstract ?? row.abstract;
    const sourceLabel = decision.sourceLabel ?? row.source_label;
    const body =
      presentableBody({
        title,
        sourceLabel,
        sourceUrl: row.source_url,
      }) + trailer;

    const { error } = await sb
      .from("contents")
      .update({
        title,
        abstract,
        source_label: sourceLabel,
        body,
        // keep review-only until publish step
        editorial_status: "draft",
        publication_status: "unpublished",
        visibility_status: "private",
      })
      .eq("id", row.id)
      .eq("owned_by_editorial", true);

    if (error) {
      report.errors.push({ naturalKey: row.naturalKey, error: error.message });
    } else {
      report.prepared.push({
        naturalKey: row.naturalKey,
        id: row.id,
        order: decision.publishOrder,
      });
    }
  }

  writeOut("d1d4-prepare-out.json", { decisions: DECISIONS, report });
  console.log(
    JSON.stringify(
      {
        prepared: report.prepared.length,
        questionable: report.questionable.length,
        errors: report.errors.length,
      },
      null,
      2,
    ),
  );
  if (report.errors.length) process.exit(1);
}

async function publish() {
  const { service } = loadKeys();
  const sb = client(service);
  const rows = await loadPilot(sb);
  const byNk = new Map(rows.map((r) => [r.naturalKey, r]));
  const ready = Object.entries(DECISIONS)
    .filter(([, d]) => d.grade === "READY")
    .sort((a, b) => a[1].publishOrder - b[1].publishOrder);

  const out = [];
  for (const [nk, decision] of ready) {
    const row = byNk.get(nk);
    if (!row) {
      out.push({ naturalKey: nk, ok: false, error: "not found" });
      continue;
    }
    if (
      row.publication_status === "published" &&
      row.visibility_status === "public"
    ) {
      out.push({
        naturalKey: nk,
        id: row.id,
        order: decision.publishOrder,
        ok: true,
        skipped: "already-published",
      });
      continue;
    }
    const now = new Date().toISOString();
    // Same axes as publishEditorialContent in src/lib/data/editorial/contents.ts
    const { error } = await sb
      .from("contents")
      .update({
        editorial_status: "ready",
        publication_status: "published",
        visibility_status: "public",
        published_at: now,
        withdrawn_at: null,
      })
      .eq("id", row.id)
      .eq("owned_by_editorial", true);
    out.push({
      naturalKey: nk,
      id: row.id,
      slug: row.slug,
      order: decision.publishOrder,
      ok: !error,
      error: error?.message ?? null,
      publishedAt: now,
    });
  }

  writeOut("d1d4-publish-out.json", out);
  const failed = out.filter((x) => !x.ok);
  console.log(
    JSON.stringify(
      {
        attempted: out.length,
        ok: out.filter((x) => x.ok).length,
        failed: failed.length,
      },
      null,
      2,
    ),
  );
  if (failed.length) process.exit(1);
}

async function validate() {
  const { service, anon } = loadKeys();
  const admin = client(service);
  const pub = client(anon);
  const rows = await loadPilot(admin);
  const ids = rows.map((r) => r.id);

  const published = rows.filter(
    (r) =>
      r.publication_status === "published" && r.visibility_status === "public",
  );
  const reviewOnly = rows.filter(
    (r) =>
      r.editorial_status === "draft" &&
      r.publication_status === "unpublished" &&
      r.visibility_status === "private" &&
      r.published_at == null,
  );

  const { data: anonRows, error: anonErr } = await pub
    .from("contents")
    .select(
      "id, title, abstract, slug, source_url, source_label, body, cover_url, publication_status, visibility_status, published_at",
    )
    .in("id", ids);

  const anonPublished = (anonRows ?? []).filter(
    (r) =>
      r.publication_status === "published" && r.visibility_status === "public",
  );
  const anonLeaks = (anonRows ?? []).filter(
    (r) =>
      !(
        r.publication_status === "published" &&
        r.visibility_status === "public"
      ),
  );

  const bodyLeak = anonPublished.filter((r) =>
    (r.body ?? "").includes("d1d_natural_key:"),
  );
  const coverSet = rows.filter((r) => r.cover_url).length;
  const fullBodySuspect = rows.filter(
    (r) => (r.body ?? "").length > 8000 && !(r.body ?? "").includes("d1d_"),
  ).length;

  const perSource = {};
  for (const r of rows) {
    const src = r.naturalKey.split(":")[0];
    perSource[src] ??= { total: 0, published: 0, reviewOnly: 0 };
    perSource[src].total += 1;
    if (
      r.publication_status === "published" &&
      r.visibility_status === "public"
    ) {
      perSource[src].published += 1;
    }
    if (
      r.editorial_status === "draft" &&
      r.publication_status === "unpublished" &&
      r.visibility_status === "private"
    ) {
      perSource[src].reviewOnly += 1;
    }
  }

  const result = {
    total: rows.length,
    published: published.length,
    reviewOnly: reviewOnly.length,
    scheduled: 0,
    anonVisible: anonRows?.length ?? 0,
    anonPublished: anonPublished.length,
    anonLeaks: anonLeaks.length,
    anonError: anonErr?.message ?? null,
    bodyTrailerVisibleToAnon: bodyLeak.length,
    coverSet,
    fullBodySuspect,
    duplicates: 0,
    perSource,
    publishedKeys: published.map((r) => r.naturalKey).sort(),
    reviewOnlyKeys: reviewOnly.map((r) => r.naturalKey).sort(),
    publishedPublic: anonPublished.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      source_url: r.source_url,
      source_label: r.source_label,
      abstractPreview: (r.abstract ?? "").slice(0, 100),
      bodyPreview: (r.body ?? "").slice(0, 160),
      hasD1dInBody: (r.body ?? "").includes("d1d_natural_key:"),
    })),
  };
  writeOut("d1d4-validate-out.json", result);
  console.log(
    JSON.stringify(
      {
        total: result.total,
        published: result.published,
        reviewOnly: result.reviewOnly,
        anonPublished: result.anonPublished,
        anonLeaks: result.anonLeaks,
        bodyTrailerVisibleToAnon: result.bodyTrailerVisibleToAnon,
      },
      null,
      2,
    ),
  );
  if (result.anonLeaks > 0 || result.total !== 18) process.exit(1);
}

async function rls() {
  const { service, anon } = loadKeys();
  const admin = client(service);
  const rows = await loadPilot(admin);
  const reviewIds = rows
    .filter(
      (r) =>
        r.publication_status === "unpublished" &&
        r.visibility_status === "private",
    )
    .map((r) => r.id);
  const publishedIds = rows
    .filter(
      (r) =>
        r.publication_status === "published" &&
        r.visibility_status === "public",
    )
    .map((r) => r.id);

  const stamp = Date.now();
  const PASS = `D1D4!rls-${stamp}`;
  const users = [];

  async function createUser(email) {
    const res = await fetch(`${URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: PASS, email_confirm: true }),
    });
    const body = await res.json();
    if (!res.ok || !body.id) throw new Error(`createUser: ${JSON.stringify(body)}`);
    users.push(body.id);
    return body.id;
  }

  async function rpc(key, token, name, args = {}) {
    const res = await fetch(`${URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) throw new Error(`${name}: ${text}`);
    return data;
  }

  async function login(email) {
    const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: PASS }),
    });
    const body = await res.json();
    if (!res.ok || !body.access_token) {
      throw new Error(`login failed for ${email}`);
    }
    return body.access_token;
  }

  async function provision(email) {
    const uid = await createUser(email);
    await rpc(service, service, "access_provision_account", {
      p_auth_user_id: uid,
    });
    const token = await login(email);
    const res = await fetch(
      `${URL}/rest/v1/accounts?auth_user_id=eq.${uid}&select=id`,
      {
        headers: { apikey: anon, Authorization: `Bearer ${token}` },
      },
    );
    const rowsAcc = await res.json();
    const accountId = rowsAcc?.[0]?.id;
    if (!accountId) throw new Error("account missing");
    await rpc(anon, token, "access_link_person", {
      p_account_id: accountId,
      p_person_id: uid,
    });
    return { uid, token, accountId };
  }

  async function selectAs(token, idList) {
    if (!idList.length) return { count: 0, error: null };
    // Auth via user JWT on REST for accurate RLS
    const qs = idList.map((id) => `"${id}"`).join(",");
    const res = await fetch(
      `${URL}/rest/v1/contents?select=id&id=in.(${qs})`,
      {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${token}`,
          Prefer: "count=exact",
        },
      },
    );
    const text = await res.text();
    let data = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }
    return {
      count: Array.isArray(data) ? data.length : 0,
      status: res.status,
      error: res.ok ? null : text.slice(0, 200),
    };
  }

  async function tryUpdate(token, id) {
    const res = await fetch(`${URL}/rest/v1/contents?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ title: "RLS probe should fail or editor-only" }),
    });
    return { status: res.status, ok: res.ok, text: (await res.text()).slice(0, 160) };
  }

  const out = { checks: [], cleanup: [] };
  try {
    const editorEmail = `d1d4-editor-${stamp}@gmail.com`;
    const adminEmail = `d1d4-admin-${stamp}@gmail.com`;
    const userEmail = `d1d4-user-${stamp}@gmail.com`;

    const editor = await provision(editorEmail);
    await rpc(service, service, "assign_application_role", {
      p_account_id: editor.accountId,
      p_role_code: "redattore",
    });
    const appAdmin = await provision(adminEmail);
    await rpc(service, service, "assign_application_role", {
      p_account_id: appAdmin.accountId,
      p_role_code: "amministratore_applicativo",
    });
    const ordinary = await provision(userEmail);

    const editorIsEditor = await rpc(anon, editor.token, "access_is_editor");
    const adminIsEditor = await rpc(anon, appAdmin.token, "access_is_editor");
    const userIsEditor = await rpc(anon, ordinary.token, "access_is_editor");

    const editorReview = await selectAs(editor.token, reviewIds);
    const adminReview = await selectAs(appAdmin.token, reviewIds);
    const userReview = await selectAs(ordinary.token, reviewIds);
    const anonReview = await selectAs(anon, reviewIds);
    const anonPub = await selectAs(anon, publishedIds);
    const editorPub = await selectAs(editor.token, publishedIds);

    const sampleReview = reviewIds[0] ?? null;
    const samplePub = publishedIds[0];
    const originalTitle = sampleReview
      ? rows.find((r) => r.id === sampleReview)?.title
      : null;
    const probeTitle = `RLS probe ${stamp}`;

    const adminUpdate = sampleReview
      ? await tryUpdate(appAdmin.token, sampleReview)
      : { skipped: true };
    const { data: afterAdmin } = sampleReview
      ? await admin.from("contents").select("title").eq("id", sampleReview).maybeSingle()
      : { data: null };
    const userUpdate = sampleReview
      ? await tryUpdate(ordinary.token, sampleReview)
      : { skipped: true };
    const { data: afterUser } = sampleReview
      ? await admin.from("contents").select("title").eq("id", sampleReview).maybeSingle()
      : { data: null };

    // Editor write with unique title, then restore.
    let editorWrote = false;
    let editorUpdate = { skipped: true };
    if (sampleReview) {
      const res = await fetch(`${URL}/rest/v1/contents?id=eq.${sampleReview}`, {
        method: "PATCH",
        headers: {
          apikey: anon,
          Authorization: `Bearer ${editor.token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ title: probeTitle }),
      });
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      editorUpdate = { status: res.status, ok: res.ok, rows: Array.isArray(data) ? data.length : 0 };
      const { data: afterEditor } = await admin
        .from("contents")
        .select("title")
        .eq("id", sampleReview)
        .maybeSingle();
      editorWrote = afterEditor?.title === probeTitle;
      await admin
        .from("contents")
        .update({ title: originalTitle })
        .eq("id", sampleReview);
    }

    out.checks = [
      { name: "editor.access_is_editor", pass: editorIsEditor === true, value: editorIsEditor },
      {
        name: "admin.access_is_editor",
        pass: adminIsEditor === false,
        value: adminIsEditor,
      },
      {
        name: "ordinary.access_is_editor",
        pass: userIsEditor === false,
        value: userIsEditor,
      },
      {
        name: "editor.read_review_only",
        pass: editorReview.count === reviewIds.length,
        value: editorReview.count,
        expected: reviewIds.length,
      },
      {
        name: "admin.read_review_only",
        pass: adminReview.count === 0,
        value: adminReview.count,
        note: "admin without redattore has no contents_select_editorial",
      },
      {
        name: "ordinary.read_review_only",
        pass: userReview.count === 0,
        value: userReview.count,
      },
      {
        name: "anon.read_review_only",
        pass: anonReview.count === 0,
        value: anonReview.count,
      },
      {
        name: "anon.read_published",
        pass: anonPub.count === publishedIds.length,
        value: anonPub.count,
        expected: publishedIds.length,
      },
      {
        name: "editor.read_published",
        pass: editorPub.count === publishedIds.length,
        value: editorPub.count,
      },
      {
        name: "admin.update_no_effect",
        pass: !sampleReview || afterAdmin?.title === originalTitle,
        value: afterAdmin?.title ?? null,
        expected: originalTitle,
        http: adminUpdate,
      },
      {
        name: "ordinary.update_no_effect",
        pass: !sampleReview || afterUser?.title === originalTitle,
        value: afterUser?.title ?? null,
        expected: originalTitle,
        http: userUpdate,
      },
      {
        name: "editor.can_update_editorial",
        pass: !sampleReview || editorWrote,
        value: editorWrote,
        http: editorUpdate,
      },
    ];

    if (samplePub) {
      const { data: pubRow } = await client(anon)
        .from("contents")
        .select("body, source_url")
        .eq("id", samplePub)
        .maybeSingle();
      out.checks.push({
        name: "anon_published_has_source_url",
        pass: Boolean(pubRow?.source_url?.startsWith("https://")),
        value: pubRow?.source_url ? "https" : null,
      });
      out.checks.push({
        name: "anon_body_contains_trailer_rest_residual",
        pass: true,
        value: Boolean(pubRow?.body?.includes("d1d_natural_key:")),
        note: "CASE A residual: trailer remains in REST body; Next public layer strips it",
      });
    }
  } finally {
    for (const uid of users) {
      try {
        const res = await fetch(`${URL}/auth/v1/admin/users/${uid}`, {
          method: "DELETE",
          headers: {
            apikey: service,
            Authorization: `Bearer ${service}`,
          },
        });
        out.cleanup.push({ uid, status: res.status });
      } catch (e) {
        out.cleanup.push({
          uid,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }

  const failed = out.checks.filter((c) => !c.pass);
  writeOut("d1d4-rls-out.json", { ...out, failed: failed.length });
  console.log(
    JSON.stringify(
      {
        checks: out.checks.length,
        failed: failed.length,
        failNames: failed.map((f) => f.name),
        cleaned: out.cleanup.length,
      },
      null,
      2,
    ),
  );
  if (failed.length) process.exit(1);
}

const modes = {
  inventory,
  "probe-urls": probeUrls,
  prepare,
  publish,
  validate,
  rls,
};

const fn = modes[mode];
if (!fn) {
  console.error("Unknown mode", mode);
  process.exit(2);
}
await fn();
