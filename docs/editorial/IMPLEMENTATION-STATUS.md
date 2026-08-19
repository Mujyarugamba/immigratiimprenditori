# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Checkpoint operativo della roadmap canonica `ROADMAP.md`, aggiornato al 19/08/2026. In sviluppo la produzione Vercel non è un gate: valgono Supabase sano, CI verde e Preview quando disponibile. `main` resta intatto fino a decisione esplicita di chiusura.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sezioni pubbliche e redazionali materializzate. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione, territorio e rotte globali. |
| 4. Modello dati v1 | **LIVE VERIFIED / PASS** | Modello editoriale applicato su Supabase reale con RLS; migrazioni repository riallineate alla cronologia applicata. |
| 5. Scrivania redazionale | **PASS** | Inbox, triage, assegnazione, priorità, dashboard e audit attività. |
| 6. Contribuisci | **FUNCTIONAL PASS** | Invio occasionale anonimo + contributore autenticato con read-own + area personale + UI amministrativa invito/abilitazione/revoca. Resta solo smoke di consegna email con un collaboratore reale. |
| 7. Storie e interviste | **PLATFORM PASS / INTERVIEWS PENDING** | Workflow privato candidato→contatto→intervista→fact-check→approvazione; consensi separati per pubblicazione/citazioni/immagini/video, RLS editor-only. Tutti i tre slot Voce del Numero zero hanno candidati verificati; le interviste reali restano da svolgere. |
| 8. Osservatorio v1 | **PASS V1** | Eurostat, InfoCamere/Futurae e confronto OECD; fonte, periodo, unità, metodologia e aggiornamento pubblici. Relazione strutturata contenuto↔indicatore aggiunta. |
| 9. Rapporti e ricerche | **PASS V1** | Metadata biblioteca strutturati + prime schede InfoCamere/Futurae e OECD. |
| 10. Eventi | **PASS V1** | Futuro/passato, fusi, all-day, collegamenti contenuti; One Way Summit 2026 pubblicato come primo evento qualificato. |
| 11. Radar mondiale | **FUNCTIONAL DEV PASS / CONTENT EXPANSION** | Comando manuale redazionale dry-run/import max 50; GDELT + Crossref + DataCite; dedupe e Inbox; nessuna auto-pubblicazione. Cron produzione rinviato al go-live. |
| 12. Fonti e metodologia | **PASS V1** | Registro fonti e distinzione pubblica tra fonti di discovery e fonti di evidenza. |
| 13. Identità visiva | **V1 PASS** | Bianco/nero/grigi, niente gradienti o effetti decorativi. |
| 14. Home | **V1 PASS** | Home editoriale Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING EXTERNAL** | LinkedIn, X e YouTube richiedono account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta e prudenziale: nessun pagamento attivo e nessuna promessa fiscale finché canale, trattamento amministrativo e formule fiscali non sono verificati. |
| 17. Identità AIPEL | **PASS V1** | Denominazione completa, forma associativa, sede legale, CF, P.IVA, presidente/direzione e contatto istituzionale pubblicati in modo coerente. |
| 18. SEO | **TECHNICAL V1 PASS** | Metadata, sitemap, robots, route canoniche e redirect; `/privacy` aggiunta alle route pubbliche. Multilingua successivo. |
| 19. Qualità/privacy/sicurezza | **PRIVACY V1 PASS / LAUNCH GATE PENDING** | CI, RLS e backend verificati; informativa privacy operativa v1 collegata al punto di raccolta dati. Restano verifica finale dei fornitori/trasferimenti e Leaked Password Protection. |
| 20. Lancio editoriale | **ANALYTICAL CORE READY / VOICE CANDIDATES READY / INTERVIEWS PENDING** | Tutti i 7 contenuti analitici sono `ready` e non pubblicati; i 3 slot Voci hanno candidati verificati e richiedono interviste originali reali. |

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
- Commit `51405fb`: CI #117 PASS — collegamenti Numero zero ↔ Osservatorio.
- Commit `504b96e`: CI #119 PASS — identità AIPEL e pagina Sostieni.
- Commit `229c69d` + `bcf6579`: migrazioni 20/08 riallineate alla cronologia Supabase; CI #121 PASS.
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

1. Agie Hujian Zhou / Ravioleria Sarpi — Lombardia (L2);
2. Paolo Privitera — italiani all'estero (A1);
3. Gianni Chiloiro e Angelo Sannino / Doppio Zero — italiani all'estero (A1 alternativa/complementare);
4. Adeola Adedewe / Kredete — Nigeria → Stati Uniti (M2);
5. Semyon Dukach / One Way Ventures — riserva qualificata M2.

Le pagine pubbliche usate nella ricerca servono a verificare identità e percorso; non sostituiscono l'intervista originale. Nessun messaggio è stato inviato automaticamente.

## Privacy operativa v1

La route `/privacy` descrive il trattamento effettivamente implementato per:

- dati tecnici e sicurezza;
- account/autenticazione;
- invii `Contribuisci`;
- workflow privato delle interviste e relativi consensi;
- ricerca editoriale su fonti pubbliche.

L'informativa identifica AIPEL, sede e contatto privacy e rende visibili finalità, basi giuridiche, destinatari, criteri/periodi di conservazione, diritti, assenza di decisioni automatizzate e uso dei cookie tecnici di sessione. Il modulo `Contribuisci` rimanda all'informativa prima dei consensi.

Il database attivo non espone attualmente una RPC di cancellazione account self-service: la privacy non promette quindi un pulsante inesistente e indirizza le richieste a `info@immigratiimprenditori.it`.

Prima del go-live restano da verificare e documentare in via definitiva i fornitori tecnici, gli eventuali trasferimenti extra-SEE e le garanzie contrattuali applicabili.

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

## Riconciliazione migrazioni — PASS

Le sette migrazioni `20260820100000` → `20260820160000` sono ora presenti nel repository e riallineate alla cronologia effettivamente applicata in `supabase_migrations.schema_migrations`. **Non sono state rieseguite sul database.**

Il confronto ha inoltre corretto nel repository due divergenze rispetto allo stato realmente applicato:

- tre refusi `acccess_*` nella migrazione `20260820110000_fix_opportunity_rls_recursion_for_editorial.sql`;
- una condizione tautologica `market_id = market_id` nella policy `international_markets_update_admin` della migrazione `20260820130000_mercati_editorial_select_rls.sql`.

Le altre cinque migrazioni risultavano già identiche alla ricostruzione dalla cronologia Supabase.

## Advisor Supabase

- `submit_editorial_contribution`: warning `SECURITY DEFINER` intenzionale; è il confine controllato del form pubblico e `anon` non ha DML diretto sulle tabelle.
- Leaked Password Protection: da attivare/verificare prima del lancio; il connettore Supabase disponibile non espone la modifica della configurazione Auth.
- Nessuna rimozione automatica di indici `unused` in fase di basso traffico.

## Regola di merge

PR #7 resta Draft. Nessun merge su `main` durante la costruzione. Il gate di sviluppo richiede CI verde e backend verificato; produzione Vercel, cron definitivo, verifica finale privacy/fornitori e configurazioni esterne vengono chiusi al go-live.
