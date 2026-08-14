/**
 * D1-B.4 — Resolve remaining 7 QUESTIONABLE Incentivi.gov opportunities.
 *
 * Modes:
 *   node artifacts/ingestion/d1b4-resolve-questionable.mjs prepare
 *   node artifacts/ingestion/d1b4-resolve-questionable.mjs publish-one
 *   node artifacts/ingestion/d1b4-resolve-questionable.mjs publish-rest
 *   node artifacts/ingestion/d1b4-resolve-questionable.mjs verify
 *   node artifacts/ingestion/d1b4-resolve-questionable.mjs reject-apply
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
const MODES = ["prepare", "reject-apply", "publish-one", "publish-rest", "verify"];
const command = parseGuardedCommand(process.argv.slice(2), {
  operation: "D1-B.4 editorial mutation",
  modes: MODES,
  writeModes: ["prepare", "reject-apply", "publish-one", "publish-rest"],
});
if (command.help) {
  console.log(productionUsage({ script: "artifacts/ingestion/d1b4-resolve-questionable.mjs", modes: MODES }));
  process.exit(0);
}
const mode = command.mode;

const PRIOR_PUBLISHED = [
  "incentivi-gov:148",
  "incentivi-gov:143",
  "incentivi-gov:1468",
  "incentivi-gov:2350",
  "incentivi-gov:2512",
  "incentivi-gov:1007",
  "incentivi-gov:118",
  "incentivi-gov:2195",
  "incentivi-gov:181",
  "incentivi-gov:1523",
  "incentivi-gov:1857",
  "incentivi-gov:1426",
];

const PRIOR_REJECT = ["incentivi-gov:225"];

/** D1-B.4 decisions for the 7 QUESTIONABLE only. */
const DECISIONS = {
  "incentivi-gov:1843": {
    grade: "READY",
    publishOrder: 1,
    summary:
      "Contributo in conto interessi (Istituto per il Credito Sportivo e Culturale) su finanziamenti per impiantistica e finalità sportive. Destinato a soggetti pubblici e privati con progetti sportivi ammissibili; scadenza indicata 30/06/2027; verifica bandi/regolamenti attivi sulla pagina ufficiale.",
    purpose: "Agevolare il credito per investimenti in impiantistica sportiva.",
    officialUrl: "https://www.creditosportivo.it/regolamentifondispeciali/",
    reason:
      "URL e regolamento ufficiali attivi; close date 2027-06-30; nicchia sportiva pubblicabile come 1857.",
  },
  "incentivi-gov:1856": {
    grade: "READY",
    publishOrder: 2,
    summary:
      "Fondo di garanzia ICSC per finanziamenti relativi a impianti sportivi e, in casi previsti, grandi eventi sportivi internazionali. Per società/associazioni sportive e altri soggetti ammissibili (escl. enti territoriali); scadenza indicata 30/06/2027; richiesta tramite ICSC o banca convenzionata.",
    purpose: "Garanzia pubblica per accesso al credito sull’impiantistica sportiva.",
    officialUrl:
      "https://www.creditosportivo.it/fondi-speciali-sport-fondo-di-garanzia/",
    reason:
      "Catalog URL reindirizzava al comparto culturale; landing ufficiale corretta verificata; close date 2027-06-30.",
  },
  "incentivi-gov:187": {
    grade: "READY",
    publishOrder: 3,
    summary:
      "Credito d’imposta (legge Smuraglia 193/2000) per imprese e cooperative che assumono detenuti o internati, anche in semilibertà o lavoro esterno. Misura strutturale nazionale attiva; richiede convenzione con l’istituto penitenziario e istanza annuale; consulta la scheda del Ministero della Giustizia.",
    purpose: "Incentivare l’assunzione e l’inclusione lavorativa di detenuti/internati.",
    officialUrl:
      "https://www.giustizia.it/giustizia/page/it/come_fare_per_credito_imposta_sgravi_fiscali",
    reason:
      "Incentivi.gov stato Attivo; scheda ufficiale Giustizia aggiornata; old catalog URL non affidabile.",
  },

  "incentivi-gov:2309": {
    grade: "REJECT",
    reason:
      "Unioncamere Lombardia: risorse 2024 e 2025 esaurite; sportello chiuso (DD 117/2024 e 67/2025). Non pubblicabile.",
  },
  "incentivi-gov:170": {
    grade: "REJECT",
    reason:
      "MIMIT DD 5/8/2026: chiusura temporanea sportello Contratti di sviluppo automotive dal 6/8/2026; URL catalogo è solo rinvio 2022.",
  },
  "incentivi-gov:132": {
    grade: "REJECT",
    reason:
      "Landing ufficiale = avviso apertura 2022; misura PNRR rimodulata senza conferma intake corrente sulla pagina collegata.",
  },
  "incentivi-gov:156": {
    grade: "REJECT",
    reason:
      "Landing ufficiale = apertura sportello 2022; stesso investimento PNRR bus elettrici di 132 senza conferma finestra corrente.",
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
      `id, external_identifier, url, authority, consulted_at, reference_text,
       opportunities!inner(id, title, summary, description, purpose, editorial_status, publication_status, visibility_level, platform_published_at)`,
    )
    .eq("status", "active")
    .like("external_identifier", "incentivi-gov:%");
  if (error) throw error;
  return data ?? [];
}

async function prepareAndReject() {
  const sb = sbAdmin();
  const rows = await loadPilot(sb);
  const report = {
    prepared: [],
    rejected: [],
    skipped: [],
    errors: [],
    urlUpdates: [],
  };

  for (const row of rows) {
    const ext = row.external_identifier;
    const decision = DECISIONS[ext];
    const opp = row.opportunities;
    if (!decision) {
      report.skipped.push({
        ext,
        editorial: opp.editorial_status,
        publication: opp.publication_status,
      });
      continue;
    }

    if (decision.grade === "READY") {
      if (decision.officialUrl && decision.officialUrl !== row.url) {
        const { error: urlErr } = await sb
          .from("opportunity_sources")
          .update({ url: decision.officialUrl })
          .eq("id", row.id);
        if (urlErr) {
          report.errors.push({ ext, error: `url: ${urlErr.message}` });
          continue;
        }
        report.urlUpdates.push({
          ext,
          from: row.url,
          to: decision.officialUrl,
        });
      }
      const { error } = await sb
        .from("opportunities")
        .update({
          summary: decision.summary,
          purpose: decision.purpose,
          description: null,
          editorial_status: "in_review",
          publication_status: "unpublished",
          visibility_level: "private",
        })
        .eq("id", opp.id);
      if (error) report.errors.push({ ext, error: error.message });
      else
        report.prepared.push({
          ext,
          id: opp.id,
          order: decision.publishOrder,
          reason: decision.reason,
        });
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
    "artifacts/ingestion/d1b4-prepare-out.json",
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
      ? "artifacts/ingestion/d1b4-publish-one-out.json"
      : "artifacts/ingestion/d1b4-publish-rest-out.json";
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

  const ids = rows.map((r) => r.opportunities.id);
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

  const publishedExt = published.map((r) => r.external_identifier).sort();
  const rejectedExt = rejected.map((r) => r.external_identifier).sort();
  const priorPublishedOk = PRIOR_PUBLISHED.every((k) =>
    publishedExt.includes(k),
  );
  const priorRejectOk = PRIOR_REJECT.every((k) => rejectedExt.includes(k));
  const newReady = Object.entries(DECISIONS)
    .filter(([, d]) => d.grade === "READY")
    .map(([k]) => k)
    .sort();
  const newReject = Object.entries(DECISIONS)
    .filter(([, d]) => d.grade === "REJECT")
    .map(([k]) => k)
    .sort();

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
      summary: (o.summary || "").slice(0, 180),
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
    publishedExternalIds: publishedExt,
    reviewExternalIds: reviewOnly.map((r) => r.external_identifier).sort(),
    rejectedExternalIds: rejectedExt,
    priorPublishedOk,
    priorRejectOk,
    newReadyPublished: newReady.every((k) => publishedExt.includes(k)),
    newRejectExcluded: newReject.every((k) => rejectedExt.includes(k)),
    details,
  };
  writeFileSync(
    "artifacts/ingestion/d1b4-verify-out.json",
    JSON.stringify(result, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(result, null, 2));
}

if (mode === "prepare" || mode === "reject-apply") await prepareAndReject();
else if (mode === "publish-one") await publishByOrder([1]);
else if (mode === "publish-rest") await publishByOrder([2, 3]);
else if (mode === "verify") await verify();
else {
  console.error("Unknown mode", mode);
  process.exit(2);
}
