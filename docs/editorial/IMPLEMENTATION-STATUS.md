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
| 7. Storie e interviste | **PIPELINE PASS / INTERVIEWS PENDING** | Standard originale attivo; tre candidati verificati sono nella Inbox come `interview_proposal`. Nessuna testimonianza terza viene riscritta. |
| 8. Osservatorio v1 | **PASS V1** | Eurostat, InfoCamere/Futurae e confronto OECD; fonte, periodo, unità, metodologia e aggiornamento pubblici. |
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
| 20. Lancio editoriale | **NUMBER ZERO IN PROGRESS** | Piano 10 contenuti pronto; dati/report/evento e candidati Voci già operativi; stesura articoli ancora da completare. |

## Ultimi gate verificati

- Supabase `immigratiimprenditori`: `ACTIVE_HEALTHY`, PostgreSQL 17.6.
- Form pubblico anonimo via RPC: PASS con rollback.
- RLS amministratore Inbox + audit trigger: PASS con rollback.
- Contributor read-own: 1 propria / 0 altrui — PASS con rollback.
- `provision_contributor_account` / revoca ruolo: smoke transazionale PASS, zero ruoli di test residui.
- Commit `a1fda60`: CI #106 PASS — gestione inviti contributori.
- Commit `d8c64ce`: CI #107 PASS — Radar manuale redazionale.
- Commit `c990868`: CI #108 PASS — Crossref/DataCite + Radar multi-sorgente.
- Vercel Preview aveva già completato con SUCCESS sull'head `e4e7fb9`; la produzione non è richiesta durante lo sviluppo.

## Radar mondiale — regola operativa

Il Radar scopre candidati e li porta nella Inbox. Non pubblica mai automaticamente.

- **GDELT**: discovery web/notizie, report, statistiche, policy, norme ed eventi.
- **Crossref**: metadati di lavori scientifici e DOI; non vengono copiati abstract o testi.
- **DataCite**: metadati di dataset registrati con DOI.
- Il redattore può fare dry-run o importare al massimo 50 URL nuovi per esecuzione.
- Il cron Vercel è solo un trigger futuro dello stesso motore e può attendere il go-live.

## Storie e interviste — numero zero

Sono nella Inbox privata come proposte di **intervista originale** ad alta priorità:

1. Agie Hujian Zhou / Ravioleria Sarpi — Lombardia;
2. Paolo Privitera — italiani all'estero;
3. Gianni Chiloiro e Angelo Sannino / Doppio Zero — italiani all'estero.

Le pagine pubbliche usate nella ricerca servono a verificare identità e percorso; non sostituiscono l'intervista originale.

## Nucleo Osservatorio

Tre famiglie restano volutamente separate:

- Eurostat `lfsa_esgan`: lavoro autonomo per cittadinanza, misura LFS riferita alle persone;
- InfoCamere/Futurae: imprese straniere registrate, Italia `678.004` e Lombardia `135.249` al 30/06/2025;
- OECD 2022: tassi di self-employment per nati all'estero / nati nel Paese, 8 territori × 2 gruppi.

Non vengono trattate come misure intercambiabili.

## Riconciliazione migrazioni

Il database registra sette migrazioni datate 20/08/2026 non ancora presenti come file nel branch (`20260820100000` → `20260820160000`): opportunità external-ingestion/RLS, Mercati editorial RLS ed Eventi ownership/provenance/ingestion. Il SQL originale è conservato in `supabase_migrations.schema_migrations` ed è stato recuperato. **Non vanno riapplicate al database**; resta solo il backfill bit-identico dei file nel repository.

## Advisor Supabase

- `submit_editorial_contribution`: warning `SECURITY DEFINER` intenzionale; è il confine controllato del form pubblico e `anon` non ha DML diretto sulle tabelle.
- Leaked Password Protection: da valutare/attivare prima del lancio.
- Nessuna rimozione automatica di indici `unused` in fase di basso traffico.

## Regola di merge

PR #7 resta Draft. Nessun merge su `main` durante la costruzione. Il gate di sviluppo richiede CI verde e backend verificato; produzione Vercel, cron definitivo, privacy finale e configurazioni esterne vengono chiusi al go-live.
