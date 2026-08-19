# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Checkpoint operativo della roadmap canonica `ROADMAP.md`, aggiornato al 19/08/2026. In sviluppo la produzione Vercel non è un gate: valgono Supabase sano, CI verde e Preview quando disponibile. `main` resta intatto fino a decisione esplicita di chiusura.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sezioni pubbliche e redazionali materializzate. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione, territorio e rotte globali. |
| 4. Modello dati v1 | **LIVE VERIFIED / PASS** | Modello editoriale applicato su Supabase reale con RLS. |
| 5. Scrivania redazionale | **PASS** | Inbox, triage, assegnazione, priorità, dashboard e audit attività. |
| 6. Contribuisci | **FUNCTIONAL PASS** | Invio occasionale anonimo + contributore autenticato con read-own + area personale + UI amministrativa invito/abilitazione/revoca. Resta solo smoke di consegna email con un collaboratore reale. |
| 7. Storie e interviste | **PLATFORM PASS / INTERVIEWS PENDING** | Workflow privato candidato→contatto→intervista→fact-check→approvazione; consensi separati per pubblicazione/citazioni/immagini/video, RLS editor-only. Tre candidati verificati sono in Inbox; le interviste reali restano da svolgere. |
| 8. Osservatorio v1 | **PASS V1** | Eurostat, InfoCamere/Futurae e confronto OECD; fonte, periodo, unità, metodologia e aggiornamento pubblici. Relazione strutturata contenuto↔indicatore aggiunta. |
| 9. Rapporti e ricerche | **PASS V1** | Metadata biblioteca strutturati + prime schede InfoCamere/Futurae e OECD. |
| 10. Eventi | **PASS V1** | Futuro/passato, fusi, all-day, collegamenti contenuti; One Way Summit 2026 pubblicato come primo evento qualificato. |
| 11. Radar mondiale | **FUNCTIONAL DEV PASS / CONTENT EXPANSION** | Comando manuale redazionale dry-run/import max 50; GDELT + Crossref + DataCite; dedupe e Inbox; nessuna auto-pubblicazione. Cron produzione rinviato al go-live. |
| 12. Fonti e metodologia | **PASS V1** | Registro fonti e distinzione pubblica tra fonti di discovery e fonti di evidenza. |
| 13. Identità visiva | **V1 PASS** | Bianco/nero/grigi, niente gradienti o effetti decorativi. |
| 14. Home | **V1 PASS** | Home editoriale Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING EXTERNAL** | LinkedIn, X e YouTube richiedono account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta; pagamenti e formule fiscali dopo dati AIPEL verificati. |
| 17. Identità AIPEL | **PARTIAL** | Presidenza/direzione visibili; sede, denominazione completa e dati fiscali da chiudere. |
| 18. SEO | **TECHNICAL V1 PASS** | Metadata, sitemap, robots, route canoniche e redirect. Multilingua successivo. |
| 19. Qualità/privacy/sicurezza | **DEV GATE PASS / LAUNCH GATE PENDING** | Next 16.3.1; audit/test/typecheck/build in CI; Supabase RLS verificata; Preview Vercel già riuscita. Privacy finale e leaked-password protection prima del lancio. |
| 20. Lancio editoriale | **ANALYTICAL CORE READY / VOICES PENDING** | Tutti i 7 contenuti analitici del Numero zero sono `ready` e non pubblicati; 3 slot Voci richiedono interviste originali reali. |

## Ultimi gate verificati

- Supabase `immigratiimprenditori`: `ACTIVE_HEALTHY`, PostgreSQL 17.6.
- Form pubblico anonimo via RPC: PASS con rollback.
- RLS amministratore Inbox + audit trigger: PASS con rollback.
- Contributor read-own: 1 propria / 0 altrui — PASS con rollback.
- `provision_contributor_account` / revoca ruolo: smoke transazionale PASS, zero ruoli di test residui.
- Commit `a1fda60`: CI #106 PASS — gestione inviti contributori.
- Commit `d8c64ce`: CI #107 PASS — Radar manuale redazionale.
- Commit `c990868`: CI #108 PASS — Crossref/DataCite + Radar multi-sorgente.
- Commit `c4aaade`: CI #116 PASS — workflow privato interviste e consensi.
- Vercel Preview aveva già completato con SUCCESS sull'head `e4e7fb9`; la produzione non è richiesta durante lo sviluppo.

## Numero zero — nucleo analitico

Sette contenuti sono ora `editorial_status=ready` e restano `publication_status=unpublished`:

- L1 Lombardia — 135 mila imprese straniere;
- I1 Italia — 678 mila imprese straniere;
- I2 — lettura critica Futurae/InfoCamere 2025;
- A2 — italiani imprenditori all'estero: perché non esiste un solo numero;
- E1 — confronto europeo self-employment;
- E2 — Action Plan UE e imprenditoria migrante;
- M1 — circa 10 milioni di self-employed immigrants nel perimetro OECD.

L1/I1/I2/E1/M1 sono collegati agli indicatori dell'Osservatorio dove metodologicamente pertinente. M1 è stato corretto per non descrivere il perimetro OECD come un dato mondiale. A2 usa la source map ufficiale già versionata e non produce aggregazioni incompatibili.

## Storie e interviste — workflow privato

`content_interview_workflow` gestisce esclusivamente dati redazionali privati:

- candidatura/origine;
- primo contatto;
- programmazione e intervista svolta;
- fact-check e approvazione;
- consenso pubblicazione;
- approvazione citazioni;
- consenso immagini;
- consenso video;
- note interne minimizzate.

La tabella ha RLS attiva, nessun `SELECT` anonimo e accesso DML solo per redattori/amministratori attraverso policy. Le pagine pubbliche non espongono questi stati.

Candidati prioritari già in Inbox:

1. Agie Hujian Zhou / Ravioleria Sarpi — Lombardia;
2. Paolo Privitera — italiani all'estero;
3. Gianni Chiloiro e Angelo Sannino / Doppio Zero — italiani all'estero.

Le pagine pubbliche usate nella ricerca servono a verificare identità e percorso; non sostituiscono l'intervista originale.

## Radar mondiale — regola operativa

Il Radar scopre candidati e li porta nella Inbox. Non pubblica mai automaticamente.

- **GDELT**: discovery web/notizie, report, statistiche, policy, norme ed eventi.
- **Crossref**: metadati di lavori scientifici e DOI; non vengono copiati abstract o testi.
- **DataCite**: metadati di dataset registrati con DOI.
- Il redattore può fare dry-run o importare al massimo 50 URL nuovi per esecuzione.
- Il cron Vercel è solo un trigger futuro dello stesso motore e può attendere il go-live.

## Nucleo Osservatorio

Tre famiglie restano volutamente separate:

- Eurostat `lfsa_esgan`: lavoro autonomo per cittadinanza, misura LFS riferita alle persone;
- InfoCamere/Futurae: imprese straniere registrate, Italia `678.004` e Lombardia `135.249` al 30/06/2025;
- OECD 2022: tassi di self-employment per nati all'estero / nati nel Paese, 8 territori × 2 gruppi.

Non vengono trattate come misure intercambiabili.

La relazione `content_observatory_indicator_links` consente ora di collegare formalmente analisi/data note agli indicatori che ne costituiscono evidenza, contesto o confronto. La lettura pubblica del link è consentita solo quando sia il contenuto sia l'indicatore sono pubblicati.

## Riconciliazione migrazioni

Il database registra sette migrazioni datate 20/08/2026 non ancora presenti come file nel branch (`20260820100000` → `20260820160000`): opportunità external-ingestion/RLS, Mercati editorial RLS ed Eventi ownership/provenance/ingestion. Il SQL originale è conservato in `supabase_migrations.schema_migrations` ed è stato recuperato. **Non vanno riapplicate al database**; resta solo il backfill bit-identico dei file nel repository.

## Advisor Supabase

- `submit_editorial_contribution`: warning `SECURITY DEFINER` intenzionale; è il confine controllato del form pubblico e `anon` non ha DML diretto sulle tabelle.
- Leaked Password Protection: da valutare/attivare prima del lancio.
- Nessuna rimozione automatica di indici `unused` in fase di basso traffico.

## Regola di merge

PR #7 resta Draft. Nessun merge su `main` durante la costruzione. Il gate di sviluppo richiede CI verde e backend verificato; produzione Vercel, cron definitivo, privacy finale e configurazioni esterne vengono chiusi al go-live.
