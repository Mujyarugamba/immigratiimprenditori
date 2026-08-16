/**
 * D1-D.3 — Curated Contenti pilot candidates (metadata/link-only).
 * Caps: ISMU 8, MLPS 5, EMN 4, Futurae 3 (import fewer if non-compliant).
 * Summaries are platform-original Italian text (not copied abstracts).
 */

import type { ContentsAcquisitionCandidate } from "@/lib/external-data/contents/acquisition";
import { CONTENUTI_ACQUISITION } from "@/lib/external-data/contents/allowlist";

export const CONTENUTI_PILOT_RETRIEVED_AT = "2026-08-13T18:00:00.000Z";

/** Excluded during selection (documented for the D1-D.3 report). */
export const CONTENUTI_PILOT_EXCLUSIONS = [
  {
    url: "https://www.ismu.org/en/31st-italian-report-on-migrations-2025-2/",
    reason: "English mirror of Italian 31° Rapporto (duplicate provenance)",
  },
  {
    url: "https://www.ismu.org/wp-content/uploads/2026/02/31_Rapporto-ISMU_2025_Web.pdf",
    reason: "Same report as HTML landing; avoid PDF-only duplicate",
  },
  {
    url: "https://www.ismu.org/pubblicazioni/",
    reason: "Aggregator/index page, not a single publication",
  },
  {
    url: "https://integrazionemigranti.gov.it/it-it/Dettaglio-progetto/id/58",
    reason: "Futurae project page off closed path allowlist (/futurae prefixes)",
  },
  {
    url: "https://www.integrazionemigranti.gov.it/it-it/Dettaglio-approfondimento/id/40/Imprese-migranti-lOsservatorio-la-dashboard-e-i-report-",
    reason: "Futurae related page off closed path allowlist",
  },
  {
    url: "https://www.unioncamere.gov.it/comunicazione/primo-piano/online-il-rapporto-dellosservatorio-sullinclusione-socio-economica-e-finanziaria-e-la-dashboard-interattiva-sulle-imprese-dei-migranti",
    reason: "Unioncamere press path outside Futurae/osservatorio allowlist",
  },
  {
    url: "https://www.unioncamere.gov.it/sites/default/files/comunicazione/Primo%20piano/2021/Impresa_Migrante.pdf",
    reason: "PDF under /sites/... path not in Futurae allowlist",
  },
  {
    url: "https://home-affairs.ec.europa.eu/networks/labour-migration-platform_en",
    reason: "Not under EMN network path prefixes",
  },
  {
    url: "https://www.emnitalyncp.it/wp-content/uploads/2019/12/2018-EMN-Study-on-Integration-of-TCN_impaginato_def.pdf",
    reason:
      "PDF asset rejected for pilot link reliability (HEAD/range flaky); HTML glossary pages used instead",
  },
  {
    url: "https://www.emnitalyncp.it/tematica/focus-integrazione-e-plurilinguismo-6/",
    reason:
      "Replaced by more specific glossary pages with stable redirect checks",
  },
  {
    url: "https://test.ismu.org/limprenditorialita-dei-nuovi-arrivati-comunicato-stampa-26-1-2022/",
    reason: "Non-allowlisted test subdomain",
  },
] as const;

/**
 * Curated pilot set. Futurae capped by compliant live URLs (1 < 3) —
 * do not compensate from other sources.
 */
export const CONTENUTI_PILOT_CANDIDATES: readonly ContentsAcquisitionCandidate[] =
  [
    // —— ISMU (8) ——
    {
      sourceCode: "ismu-rapporti",
      contentUrl: "https://www.ismu.org/31-rapporto-sulle-migrazioni-2025/",
      externalId: "ismu-31-rapporto-2025",
      originalTitle: "31° Rapporto sulle migrazioni 2025",
      publisherOrAuthor: "Fondazione ISMU ETS",
      publishedOn: "2026-02-01",
      language: "it",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "31° Rapporto ISMU sulle migrazioni 2025",
      platformSummaryIt:
        "Scheda di rinvio al rapporto annuale ISMU sulle migrazioni in Italia, utile per inquadrare mercato del lavoro, integrazione economica e contesto demografico degli imprenditori con background migratorio.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl: "https://www.ismu.org/30-rapporto-sulle-migrazioni-2024/",
      externalId: "ismu-30-rapporto-2024",
      originalTitle: "30° Rapporto sulle migrazioni 2024",
      publisherOrAuthor: "Fondazione ISMU ETS",
      publishedOn: "2025-02-01",
      language: "it",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "30° Rapporto ISMU sulle migrazioni 2024",
      platformSummaryIt:
        "Punto di accesso al trentesimo rapporto ISMU, con approfondimenti su lavoro, rimesse e imprese a guida straniera nel quadro trentennale delle migrazioni in Italia.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl:
        "https://www.ismu.org/bussate-e-vi-sara-aperto-il-mismatch-tra-sistemi-finanziari-territoriali-e-bisogni-degli-immigrati/",
      externalId: "ismu-paf-mismatch-finanziario",
      originalTitle:
        "Bussate e vi sarà aperto. Il (mis)match tra sistemi finanziari territoriali e bisogni degli immigrati",
      publisherOrAuthor: "Fondazione ISMU ETS",
      language: "it",
      documentType: "research",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "Mismatch tra sistemi finanziari territoriali e bisogni degli immigrati",
      platformSummaryIt:
        "Ricerca ISMU su barriere di accesso a servizi bancari e assicurativi per persone con background migratorio, rilevante per credito e inclusione finanziaria degli imprenditori immigrati.",
      typeCode: "insight",
      primaryCategoryCode: "services_guidance",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl:
        "https://www.ismu.org/libro-bianco-sul-governo-delle-migrazioni-economiche/",
      externalId: "ismu-libro-bianco-migrazioni-economiche",
      originalTitle: "Libro bianco sul governo delle migrazioni economiche",
      publisherOrAuthor: "Fondazione ISMU ETS",
      language: "it",
      documentType: "publication",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Libro bianco sul governo delle migrazioni economiche",
      platformSummaryIt:
        "Documento di policy ISMU sulle migrazioni economiche, utile per comprendere leve pubbliche che incidono su lavoro, autoimpiego e percorsi di valorizzazione economica dei migranti.",
      typeCode: "guide",
      primaryCategoryCode: "regulation_compliance",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl:
        "https://www.ismu.org/la-doppia-discriminazione-delle-donne-con-background-migratorio-nel-mercato-del-lavoro/",
      externalId: "ismu-doppia-discriminazione-donne-lavoro",
      originalTitle:
        "La doppia discriminazione delle donne con background migratorio nel mercato del lavoro",
      publisherOrAuthor: "Fondazione ISMU ETS",
      language: "it",
      documentType: "study",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "Donne con background migratorio e doppia discriminazione nel lavoro",
      platformSummaryIt:
        "Studio ISMU sulle barriere di genere e origine nel mercato del lavoro, contesto rilevante anche per autoimpiego e percorsi imprenditoriali delle migranti.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl:
        "https://www.ismu.org/linclusione-socio-lavorativa-dei-rifugiati/",
      externalId: "ismu-inclusione-socio-lavorativa-rifugiati",
      originalTitle: "L'inclusione socio-lavorativa dei rifugiati",
      publisherOrAuthor: "Fondazione ISMU ETS",
      language: "it",
      documentType: "research",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Inclusione socio-lavorativa dei rifugiati",
      platformSummaryIt:
        "Approfondimento ISMU sull'inserimento lavorativo dei rifugiati, con spunti per accompagnamento, formazione e percorsi verso autonomia economica.",
      typeCode: "insight",
      primaryCategoryCode: "services_guidance",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl:
        "https://www.ismu.org/paper-un-salto-di-qualita-nella-governance-dellimmigrazione-e-della-sua-valorizzazione-economica-2/",
      externalId: "ismu-paper-valorizzazione-economica",
      originalTitle:
        "Un salto di qualità nella governance dell'immigrazione e della sua valorizzazione economica",
      publisherOrAuthor: "Fondazione ISMU ETS",
      language: "it",
      documentType: "publication",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "Governance dell'immigrazione e valorizzazione economica",
      platformSummaryIt:
        "Paper ISMU su come migliorare la governance dell'immigrazione per valorizzare il contributo economico dei migranti, incluso il potenziale imprenditoriale.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "ismu-rapporti",
      contentUrl:
        "https://www.ismu.org/guida-alleducazione-economico-finanziaria-in-chiave-interculturale-per-docenti-della-scuola-primaria/",
      externalId: "ismu-guida-edu-economico-finanziaria",
      originalTitle:
        "Guida all'educazione economico-finanziaria in chiave interculturale per docenti della scuola primaria",
      publisherOrAuthor: "Fondazione ISMU ETS",
      language: "it",
      documentType: "publication",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "Educazione economico-finanziaria interculturale (guida ISMU)",
      platformSummaryIt:
        "Guida ISMU all'alfabetizzazione economico-finanziaria in chiave interculturale: base utile per percorsi di inclusione finanziaria che sostengono anche l'avvio d'impresa.",
      typeCode: "guide",
      primaryCategoryCode: "services_guidance",
      territoryLabel: "Italia",
    },

    // —— MLPS (5) ——
    {
      sourceCode: "minlavoro-stranieri-lavoro",
      contentUrl:
        "https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/xvi-rapporto-mdl-stranieri-2026-rev",
      externalId: "mlps-xvi-rapporto-mdl-stranieri-2026",
      originalTitle:
        "XVI Rapporto annuale — Gli stranieri nel mercato del lavoro in Italia",
      publisherOrAuthor: "Ministero del Lavoro e delle Politiche Sociali",
      publishedOn: "2026-07-01",
      language: "it",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "XVI Rapporto MLPS: stranieri nel mercato del lavoro (2026)",
      platformSummaryIt:
        "Rapporto ufficiale MLPS sul lavoro degli stranieri in Italia, con capitolo sull'imprenditoria straniera e fabbisogni delle imprese: fonte primaria per redazione e policy.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "minlavoro-stranieri-lavoro",
      contentUrl:
        "https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/sintesi-xvi-rapporto-mdl-stranieri-2026-rev",
      externalId: "mlps-sintesi-xvi-rapporto-2026",
      originalTitle:
        "Sintesi XVI Rapporto — Gli stranieri nel mercato del lavoro in Italia",
      publisherOrAuthor: "Ministero del Lavoro e delle Politiche Sociali",
      publishedOn: "2026-07-01",
      language: "it",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Sintesi ufficiale XVI Rapporto MLPS sul lavoro straniero",
      platformSummaryIt:
        "Sintesi istituzionale del XVI Rapporto MLPS, con dati sintetici su imprese individuali non comunitarie, settori e fabbisogni occupazionali.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "minlavoro-stranieri-lavoro",
      contentUrl:
        "https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/la-presenza-dei-migranti-nelle-aree-metropolitane-anno-2025",
      externalId: "mlps-presenza-migranti-aree-metropolitane-2025",
      originalTitle:
        "La presenza dei migranti nelle aree metropolitane — Anno 2025",
      publisherOrAuthor: "Ministero del Lavoro e delle Politiche Sociali",
      publishedOn: "2025-01-01",
      language: "it",
      documentType: "statistics",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "Presenza dei migranti nelle aree metropolitane (MLPS 2025)",
      platformSummaryIt:
        "Studio statistico MLPS sulle aree metropolitane con indicatori di lavoro e imprese a titolarità non comunitaria, utile per letture territoriali dell'imprenditoria immigrata.",
      typeCode: "insight",
      primaryCategoryCode: "markets",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "minlavoro-stranieri-lavoro",
      contentUrl:
        "https://www.lavoro.gov.it/documenti/sintesi-xiv-rapporto-gli-stranieri-nel-mercato-del-lavoro-italia-2024",
      externalId: "mlps-sintesi-xiv-rapporto-2024",
      originalTitle:
        "Sintesi XIV Rapporto — Gli stranieri nel mercato del lavoro in Italia 2024",
      publisherOrAuthor: "Ministero del Lavoro e delle Politiche Sociali",
      publishedOn: "2024-01-01",
      language: "it",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Sintesi XIV Rapporto MLPS sul mercato del lavoro straniero",
      platformSummaryIt:
        "Sintesi del XIV Rapporto MLPS con focus su imprenditoria individuale non comunitaria, settori prevalenti e dinamiche di iscrizione/cessazione.",
      typeCode: "insight",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "minlavoro-stranieri-lavoro",
      contentUrl:
        "https://www.lavoro.gov.it/temi-e-priorita/immigrazione/Pagine/default.aspx",
      externalId: "mlps-tema-immigrazione-hub",
      originalTitle: "Immigrazione — Temi e priorità MLPS",
      publisherOrAuthor: "Ministero del Lavoro e delle Politiche Sociali",
      language: "it",
      documentType: "document",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Hub istituzionale MLPS sul tema immigrazione",
      platformSummaryIt:
        "Pagina istituzionale MLPS sul tema immigrazione: punto di ingresso a politiche, documenti e priorità pubbliche collegate a lavoro e integrazione dei migranti.",
      typeCode: "institutional_page",
      primaryCategoryCode: "regulation_compliance",
      territoryLabel: "Italia",
    },

    // —— EMN (4) ——
    {
      sourceCode: "emn-european-migration-network",
      contentUrl:
        "https://home-affairs.ec.europa.eu/networks/european-migration-network-emn/emn-publications/emn-annual-reports/european-migration-network-asylum-and-migration-overview-amo-2024/meeting-labour-market-needs_en",
      externalId: "emn-amo-2024-labour-market-needs",
      originalTitle: "Meeting labour market needs — EMN AMO 2024",
      publisherOrAuthor: "European Migration Network / Commissione europea",
      publishedOn: "2025-01-01",
      language: "en",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt:
        "EMN AMO 2024: rispondere ai fabbisogni del mercato del lavoro",
      platformSummaryIt:
        "Capitolo EMN sulle politiche UE e nazionali per colmare fabbisogni di lavoro con migrazione legale; contesto europeo per imprenditoria e lavoro autonomo dei cittadini di paesi terzi.",
      typeCode: "insight",
      primaryCategoryCode: "internationalization",
      territoryLabel: "Unione europea",
    },
    {
      sourceCode: "emn-european-migration-network",
      contentUrl:
        "https://home-affairs.ec.europa.eu/networks/european-migration-network-emn/emn-publications/emn-annual-reports/european-migration-network-asylum-and-migration-overview-amo-2024/enhancing-migrant-integration_en",
      externalId: "emn-amo-2024-enhancing-integration",
      originalTitle: "Enhancing integration of migrants — EMN AMO 2024",
      publisherOrAuthor: "European Migration Network / Commissione europea",
      publishedOn: "2025-01-01",
      language: "en",
      documentType: "report",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "EMN AMO 2024: rafforzare l'integrazione dei migranti",
      platformSummaryIt:
        "Sintesi EMN sulle misure di integrazione, inclusa l'integrazione lavorativa e la formazione collegata all'occupazione, quadro di riferimento per percorsi di autonomia economica.",
      typeCode: "insight",
      primaryCategoryCode: "services_guidance",
      territoryLabel: "Unione europea",
    },
    {
      sourceCode: "emn-european-migration-network",
      contentUrl:
        "https://www.emnitalyncp.it/definizione/integrazione-lavorativa/",
      externalId: "emn-it-definizione-integrazione-lavorativa",
      originalTitle: "Integrazione lavorativa — Glossario EMN Italia",
      publisherOrAuthor: "EMN Italian National Contact Point",
      language: "it",
      documentType: "document",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Glossario EMN Italia: integrazione lavorativa",
      platformSummaryIt:
        "Voce di glossario EMN Italia sull'integrazione lavorativa, con rinvio allo studio comparativo UE su accesso al lavoro, ostacoli e buone pratiche per cittadini di paesi terzi.",
      typeCode: "guide",
      primaryCategoryCode: "services_guidance",
      territoryLabel: "Italia",
    },
    {
      sourceCode: "emn-european-migration-network",
      contentUrl:
        "https://www.emnitalyncp.it/definizione/accesso-al-lavoro/",
      externalId: "emn-it-definizione-accesso-al-lavoro",
      originalTitle: "Accesso al lavoro — Glossario EMN Italia",
      publisherOrAuthor: "EMN Italian National Contact Point",
      language: "it",
      documentType: "document",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Glossario EMN Italia: accesso al lavoro",
      platformSummaryIt:
        "Voce EMN Italia sull'accesso al lavoro e al lavoro autonomo per rifugiati e cittadini di paesi terzi, utile quadro normativo per percorsi di autoimpiego.",
      typeCode: "guide",
      primaryCategoryCode: "regulation_compliance",
      territoryLabel: "Italia",
    },

    // —— Futurae (1 of 3: only path-compliant live URL) ——
    {
      sourceCode: "futurae-mlps-unioncamere",
      contentUrl:
        "https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere",
      externalId: "futurae-osservatorio-imprese-straniere",
      originalTitle: "Osservatorio imprese straniere — Progetto Futurae",
      publisherOrAuthor:
        "Ministero del Lavoro e delle Politiche Sociali + Unioncamere (progetto Futurae)",
      updatedOn: "2025-07-03",
      language: "it",
      documentType: "project_page",
      retrievedAt: CONTENUTI_PILOT_RETRIEVED_AT,
      titleIt: "Osservatorio imprese straniere (Futurae MLPS–Unioncamere)",
      platformSummaryIt:
        "Pagina ufficiale dell'Osservatorio imprese straniere del progetto Futurae (MLPS–Unioncamere): accesso a rapporti e strumenti di conoscenza sull'imprenditoria migrante e sull'inclusione finanziaria.",
      typeCode: "institutional_page",
      primaryCategoryCode: "entrepreneurship",
      territoryLabel: "Italia",
    },
  ];

export function assertPilotCapsNotExceeded(
  candidates: readonly ContentsAcquisitionCandidate[],
): void {
  const counts = new Map<string, number>();
  for (const c of candidates) {
    counts.set(c.sourceCode, (counts.get(c.sourceCode) ?? 0) + 1);
  }
  for (const [code, n] of counts) {
    const cap =
      CONTENUTI_ACQUISITION.pilotCaps[
        code as keyof typeof CONTENUTI_ACQUISITION.pilotCaps
      ];
    if (typeof cap === "number" && code !== "total" && n > cap) {
      throw new Error(`pilot cap exceeded for ${code}: ${n} > ${cap}`);
    }
  }
  if (candidates.length > CONTENUTI_ACQUISITION.pilotCaps.total) {
    throw new Error(
      `pilot total exceeded: ${candidates.length} > ${CONTENUTI_ACQUISITION.pilotCaps.total}`,
    );
  }
}
