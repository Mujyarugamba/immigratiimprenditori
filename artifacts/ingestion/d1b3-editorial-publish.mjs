/**
 * D1-B.3 — Controlled editorial copy + selective publication on Production.
 *
 * Modes:
 *   node artifacts/ingestion/d1b3-editorial-publish.mjs prepare
 *   node artifacts/ingestion/d1b3-editorial-publish.mjs publish-one
 *   node artifacts/ingestion/d1b3-editorial-publish.mjs publish-rest
 *   node artifacts/ingestion/d1b3-editorial-publish.mjs verify
 *
 * Never prints secrets. Uses service_role via supabase CLI.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  PRODUCTION_PROJECT_REF,
  parseGuardedCommand,
  productionUsage,
} from "./production-write-guard.mjs";

const REF = PRODUCTION_PROJECT_REF;
const MODES = ["prepare", "publish-one", "publish-rest", "verify"];
const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "D1-B.3 editorial mutation",
  modes: MODES,
  writeModes: ["prepare", "publish-one", "publish-rest"],
});
if (command.help) {
  console.log(productionUsage({ script: "artifacts/ingestion/d1b3-editorial-publish.mjs", modes: MODES }));
  process.exit(0);
}
const mode = command.mode;

/** Editorial decisions for the frozen 20-key pilot. */
const DECISIONS = {
  "incentivi-gov:148": {
    grade: "READY",
    publishOrder: 1,
    summary:
      "Garanzia pubblica per facilitare l’accesso al credito delle PMI. Rivolta a imprese di tutte le regioni; sportello attivo fino al 31/12/2026 secondo Incentivi.gov.",
    purpose: "Accesso al credito e liquidità per piccole e medie imprese.",
  },
  "incentivi-gov:143": {
    grade: "READY",
    publishOrder: 2,
    summary:
      "Credito d’imposta nazionale per investimenti in ricerca e sviluppo, innovazione tecnologica, design e ideazione estetica. Misura strutturale aperta alle imprese; verifica i requisiti sulla pagina ufficiale.",
    purpose: "Sostenere competitività e innovazione delle imprese.",
  },
  "incentivi-gov:1468": {
    grade: "READY",
    publishOrder: 3,
    summary:
      "Contributo regionale Lombardia (PR FESR 2021-2027) per rafforzare filiere produttive ed ecosistemi industriali. Destinato a imprese e aggregazioni con sede/operatività in Lombardia; scadenza indicata 31/12/2027.",
    purpose: "Rafforzare filiere e competitività industriale in Lombardia.",
  },
  "incentivi-gov:2350": {
    grade: "READY",
    publishOrder: 4,
    summary:
      "Contributo Unioncamere Lombardia per partecipazione a fiere internazionali 2024-2026. Per micro, piccole e medie imprese lombarde; scadenza indicata 31/12/2026.",
    purpose: "Internazionalizzazione e promozione sui mercati esteri.",
  },
  "incentivi-gov:2512": {
    grade: "READY",
    publishOrder: 5,
    summary:
      "Finanziamento agevolato SIMEST/MAECI per rafforzare presenza e investimenti di imprese e filiere italiane in Africa. Misura nazionale a sportello; consulta la pagina ufficiale per finestre e requisiti.",
    purpose: "Internazionalizzazione verso i mercati africani.",
  },
  "incentivi-gov:1007": {
    grade: "READY",
    publishOrder: 6,
    summary:
      "Agevolazioni MIMIT (Green New Deal / Fondo crescita sostenibile) per progetti di ricerca, sviluppo e innovazione verso transizione ecologica e circolare. Misura nazionale a sportello.",
    purpose: "Innovazione e transizione ecologica delle imprese.",
  },
  "incentivi-gov:118": {
    grade: "READY",
    publishOrder: 7,
    summary:
      "Fondo Nazionale Innovazione: intervento di venture capital per la crescita innovativa delle imprese italiane. Consulta il gestore ufficiale per modalità di accesso e focus settoriali.",
    purpose: "Equity e crescita per imprese innovative / startup.",
  },
  "incentivi-gov:2195": {
    grade: "READY",
    publishOrder: 8,
    summary:
      "Incentivo MUR (PNRR) per l’assunzione di ricercatori da parte delle imprese, collegato ai dottorati innovativi. Misura nazionale; scadenza indicata 31/12/2026.",
    purpose: "Assunzione di ricercatori e trasferimento di competenze.",
  },
  "incentivi-gov:181": {
    grade: "READY",
    publishOrder: 9,
    summary:
      "Bonus Export Digitale ICE: contributo a fondo perduto per soluzioni digitali a supporto dell’export delle PMI. Verifica sulla pagina ICE se la finestra di presentazione è aperta.",
    purpose: "Digitalizzazione e internazionalizzazione delle PMI.",
  },
  "incentivi-gov:1523": {
    grade: "READY",
    publishOrder: 10,
    summary:
      "Sportello Contratti di sviluppo dedicato alla filiera dei semiconduttori (MIMIT). Per programmi di investimento industriali rilevanti; consultare la pagina ufficiale per disponibilità dello sportello.",
    purpose: "Investimenti strategici nella filiera semiconduttori.",
  },
  "incentivi-gov:1857": {
    grade: "READY",
    publishOrder: 11,
    summary:
      "Garanzia pubblica (Istituto per il Credito Sportivo) su finanziamenti per tutela e valorizzazione del patrimonio culturale. Scadenza indicata 30/06/2027; verifica eleggibilità dei soggetti privati.",
    purpose: "Credito agevolato per progetti sul patrimonio culturale.",
  },
  "incentivi-gov:1426": {
    grade: "READY",
    publishOrder: 12,
    summary:
      "Avviso MiC (PNRR) per ecoefficienza e riduzione consumi energetici in sale teatrali e cinema. Destinato a gestori pubblici e privati del settore; scadenza indicata 31/12/2026.",
    purpose: "Efficienza energetica nello spettacolo e nel cinema.",
  },

  "incentivi-gov:132": {
    grade: "QUESTIONABLE",
    reason:
      "Programma industriale PNRR filiera autobus elettrici: pertinenti ma sportello/status da riconfermare manualmente; non auto-pubblicare.",
  },
  "incentivi-gov:156": {
    grade: "QUESTIONABLE",
    reason:
      "Misura correlata alla filiera autobus elettrici; overlap funzionale con 132 e status sportello da verificare.",
  },
  "incentivi-gov:170": {
    grade: "QUESTIONABLE",
    reason:
      "URL ufficiale punta a decreto di rinvio presentazione domande; apertura corrente ambigua.",
  },
  "incentivi-gov:1843": {
    grade: "QUESTIONABLE",
    reason:
      "Fondo contributi interessi per impiantistica sportiva: credito specializzato, utile solo a nicchia; lasciare in coda umana.",
  },
  "incentivi-gov:1856": {
    grade: "QUESTIONABLE",
    reason:
      "Garanzia per impiantistica sportiva/eventi: audience ristretta; non rifiutare solo perché specializzata, ma non READY senza review dedicata.",
  },
  "incentivi-gov:187": {
    grade: "QUESTIONABLE",
    reason:
      "Credito d’imposta assunzione detenuti/internati: employment niche; richiede contesto editoriale dedicato.",
  },
  "incentivi-gov:2309": {
    grade: "QUESTIONABLE",
    reason:
      "Bando Rinnova Veicoli 2024-2025 senza close date in open data; possibile esaurimento fondi/finestre — verificare Unioncamere.",
  },

  "incentivi-gov:225": {
    grade: "REJECT",
    reason:
      "URL ufficiale 404; beneficiari tipici gestori impianti di risalita/piste — non idonea al pilota pubblico attuale.",
  },
};

function loadServiceRole() {
  const r = spawnSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
    { encoding: "utf8", shell: true },
  );
  if (r.status !== 0) throw new Error(`api-keys failed: ${r.stderr || r.stdout}`);
  const keys = JSON.parse(r.stdout);
  const svc = keys.find((k) => k.name === "service_role" && k.api_key);
  if (!svc?.api_key) throw new Error("service_role key not found");
  return { key: svc.api_key, anon: keys.find((k) => k.name === "anon")?.api_key };
}

function sbAdmin() {
  const { key } = loadServiceRole();
  return createClient(`https://${REF}.supabase.co`, key, {
    auth: { persistSession: false },
  });
}

async function loadPilot(sb) {
  const { data, error } = await sb
    .from("opportunity_sources")
    .select(
      `external_identifier, url, authority, consulted_at, reference_text,
       opportunities!inner(id, title, summary, description, purpose, editorial_status, publication_status, visibility_level, platform_published_at)`,
    )
    .eq("status", "active")
    .like("external_identifier", "incentivi-gov:%");
  if (error) throw error;
  return data ?? [];
}

async function prepare() {
  const sb = sbAdmin();
  const rows = await loadPilot(sb);
  const report = { prepared: [], rejected: [], questionable: [], errors: [] };

  for (const row of rows) {
    const ext = row.external_identifier;
    const decision = DECISIONS[ext];
    const opp = row.opportunities;
    if (!decision) {
      report.errors.push({ ext, error: "missing decision" });
      continue;
    }
    if (decision.grade === "READY") {
      const { error } = await sb
        .from("opportunities")
        .update({
          summary: decision.summary,
          purpose: decision.purpose,
          description: null,
          // keep review-only until publish step
          editorial_status: "in_review",
          publication_status: "unpublished",
          visibility_level: "private",
        })
        .eq("id", opp.id);
      if (error) report.errors.push({ ext, error: error.message });
      else report.prepared.push({ ext, id: opp.id, order: decision.publishOrder });
    } else if (decision.grade === "QUESTIONABLE") {
      // leave review-only; no copy overwrite required
      report.questionable.push({ ext, id: opp.id, reason: decision.reason });
    } else if (decision.grade === "REJECT") {
      const { error } = await sb
        .from("opportunities")
        .update({
          editorial_status: "rejected",
          publication_status: "unpublished",
          visibility_level: "private",
        })
        .eq("id", opp.id);
      if (error) report.errors.push({ ext, error: error.message });
      else report.rejected.push({ ext, id: opp.id, reason: decision.reason });
    }
  }

  writeFileSync(
    "artifacts/ingestion/d1b3-editorial-prepare-out.json",
    JSON.stringify({ decisions: DECISIONS, report }, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
}

async function publishByOrder(orders) {
  const sb = sbAdmin();
  const rows = await loadPilot(sb);
  const byExt = new Map(rows.map((r) => [r.external_identifier, r]));
  const ready = Object.entries(DECISIONS)
    .filter(([, d]) => d.grade === "READY" && orders.includes(d.publishOrder))
    .sort((a, b) => a[1].publishOrder - b[1].publishOrder);

  const out = [];
  for (const [ext, decision] of ready) {
    const row = byExt.get(ext);
    if (!row) {
      out.push({ ext, ok: false, error: "not found" });
      continue;
    }
    const id = row.opportunities.id;
    const now = new Date().toISOString();
    const { error } = await sb
      .from("opportunities")
      .update({
        summary: decision.summary,
        purpose: decision.purpose,
        editorial_status: "approved",
        publication_status: "published",
        visibility_level: "public",
        platform_published_at: now,
        platform_scheduled_for: null,
        platform_withdrawn_at: null,
      })
      .eq("id", id);
    out.push({
      ext,
      id,
      order: decision.publishOrder,
      ok: !error,
      error: error?.message ?? null,
      publishedAt: now,
    });
  }
  const path =
    orders.length === 1
      ? "artifacts/ingestion/d1b3-publish-one-out.json"
      : "artifacts/ingestion/d1b3-publish-rest-out.json";
  writeFileSync(path, JSON.stringify(out, null, 2), "utf8");
  console.log(JSON.stringify(out, null, 2));
}

async function verify() {
  const { key, anon } = loadServiceRole();
  const admin = createClient(`https://${REF}.supabase.co`, key, {
    auth: { persistSession: false },
  });
  const pub = createClient(`https://${REF}.supabase.co`, anon, {
    auth: { persistSession: false },
  });
  const rows = await loadPilot(admin);
  const ids = rows.map((r) => r.opportunities.id);
  const published = rows.filter(
    (r) => r.opportunities.publication_status === "published",
  );
  const reviewOnly = rows.filter(
    (r) =>
      r.opportunities.editorial_status === "in_review" &&
      r.opportunities.publication_status === "unpublished" &&
      r.opportunities.visibility_level === "private",
  );
  const rejected = rows.filter(
    (r) => r.opportunities.editorial_status === "rejected",
  );

  const { data: anonRows, error: anonErr } = await pub
    .from("opportunities")
    .select(
      `id, title, summary, publication_status, visibility_level,
       opportunity_sources(authority, url, external_identifier, status, is_primary),
       opportunity_time_windows(opens_at, closes_at, open_ended, kind, superseded_at),
       opportunity_market_references(territory_label)`,
    )
    .in("id", ids)
    .eq("publication_status", "published")
    .eq("visibility_level", "public");

  const details = (anonRows ?? []).map((o) => {
    const src =
      (o.opportunity_sources || []).find((s) => s.is_primary) ||
      (o.opportunity_sources || [])[0];
    const w =
      (o.opportunity_time_windows || []).find(
        (x) => x.kind === "access" && !x.superseded_at,
      ) || (o.opportunity_time_windows || [])[0];
    return {
      id: o.id,
      title: o.title,
      summary: (o.summary || "").slice(0, 160),
      authority: src?.authority ?? null,
      url: src?.url ?? null,
      externalId: src?.external_identifier ?? null,
      territory: (o.opportunity_market_references || [])
        .map((t) => t.territory_label)
        .filter(Boolean)
        .join(", "),
      closesAt: w?.closes_at ?? null,
      openEnded: w?.open_ended ?? null,
    };
  });

  const result = {
    total: rows.length,
    published: published.length,
    reviewOnly: reviewOnly.length,
    rejected: rejected.length,
    anonVisiblePublished: anonRows?.length ?? 0,
    anonError: anonErr?.message ?? null,
    publishedExternalIds: published.map((r) => r.external_identifier).sort(),
    reviewExternalIds: reviewOnly.map((r) => r.external_identifier).sort(),
    rejectedExternalIds: rejected.map((r) => r.external_identifier).sort(),
    details,
  };
  writeFileSync(
    "artifacts/ingestion/d1b3-verify-out.json",
    JSON.stringify(result, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(result, null, 2));
}

if (mode === "prepare") await prepare();
else if (mode === "publish-one") await publishByOrder([1]);
else if (mode === "publish-rest")
  await publishByOrder([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
else if (mode === "verify") await verify();
else {
  console.error("Unknown mode", mode);
  process.exit(2);
}
