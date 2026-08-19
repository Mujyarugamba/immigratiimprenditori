# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Questo documento è il checkpoint operativo della roadmap canonica `ROADMAP.md`. `PASS` significa implementato e verificato al livello indicato; `PENDING` non va interpretato come fallimento.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sitemap pubblica/redazionale materializzata nelle sezioni principali. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione e rotte senza privilegio tecnico per l'Italia. |
| 4. Modello dati v1 | **LIVE VERIFIED / PASS** | Contenuti, autori/media, geografia, rotte, Inbox, submission, eventi e Osservatorio presenti sul Supabase reale; ruolo `contributore` e ownership delle proposte aggiunti e verificati. |
| 5. Scrivania redazionale | **CODE + DB AUDIT PASS** | Inbox, triage, priorità, presa in carico, dashboard e audit attività attivi. Smoke RLS reale amministratore: update Inbox + audit trigger PASS, con rollback e zero dati residui. |
| 6. Contribuisci | **PUBLIC + CONTRIBUTOR TRACKING PASS / INVITE UI PENDING** | Invio occasionale senza account PASS. Il contributore autenticato accede a `/app/contributore`, vede solo le proprie proposte via RLS e può inviarne di nuove. Assegnazione backend del ruolo `contributore` verificata; resta da esporre alla redazione un flusso UI di invito/abilitazione. Nessuna pubblicazione automatica. |
| 7. Storie e interviste | **CODE + EDITORIAL STANDARD PASS** | Sezione pubblica/redazionale e standard editoriale canonico; popolamento del numero zero da fare. |
| 8. Osservatorio v1 | **V1 NUCLEUS LIVE / TRACEABILITY PASS** | Nucleo verificato su backend reale: Eurostat lavoro autonomo per cittadinanza + InfoCamere/Futurae imprese straniere registrate Italia/Lombardia. La scheda pubblica espone periodo, unità, territorio/gruppo, fonte originale, metodologia del valore e aggiornamento. |
| 9. Rapporti e ricerche | **CODE PASS** | Tipi contenuto e sezione pubblica/redazionale esistono; biblioteca da popolare. |
| 10. Eventi | **FUNCTIONAL / CONTENT PENDING** | Calendario, redazione, geografie e rotte evento esistono; selezione qualificata da popolare. |
| 11. Radar mondiale | **CODE PASS / PRODUCTION CRON PENDING** | GDELT v1 → normalizzazione/dedupe → Inbox; cron giornaliero predisposto. Nessuna auto-pubblicazione. Attivazione completa richiede `CRON_SECRET` e smoke del cron. |
| 12. Fonti e metodologia | **CODE PASS** | `/fonti` pubblico e redirect legacy `/dati-e-fonti`. |
| 13. Identità visiva | **V1 PASS** | Palette globale monocromatica bianco/nero/grigi, niente gradienti o colori decorativi. |
| 14. Home | **V1 PASS** | Prima pagina editoriale dinamica su Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING** | LinkedIn, X/Twitter e YouTube richiedono creazione/configurazione account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta; pagamento e formule fiscali attendono dati AIPEL verificati. |
| 17. Identità AIPEL | **PARTIAL PASS** | AIPEL, Presidenza e direzione editoriale visibili; denominazione completa/sede/dati fiscali ancora da inserire. |
| 18. SEO | **TECHNICAL V1 PASS** | Metadata base, sitemap, robots, nuove route canoniche e redirect legacy. Multilingua resta evoluzione. |
| 19. Qualità/privacy/sicurezza | **CODE SECURITY + SUPABASE RLS SMOKE PASS / PREVIEW+PRIVACY PENDING** | Next 16.3.1; npm audit 0 vulnerabilità; test/typecheck/build controllati da CI. Supabase `ACTIVE_HEALTHY`, grant editoriali ridotti, RLS verificata e FK editoriali indicizzate. Restano Preview Vercel e revisione privacy finale; leaked-password protection Auth da valutare/attivare prima del lancio. |
| 20. Lancio editoriale | **NUMBER ZERO PLAN READY / CONTENT IN PROGRESS** | Piano di 10 contenuti bilanciati 20%×5 pronto; primi dati Italia/Lombardia già caricati nell'Osservatorio; ricerca e produzione degli altri contenuti proseguono. |

## Gate database editoriale — 19/08/2026

Supabase `immigratiimprenditori` è stato ripristinato e verificato `ACTIVE_HEALTHY` su PostgreSQL 17.6.

Migrazioni editoriali applicate e allineate nel repository:

- `20260819102530 editorial_foundation_v1` — fondazione editoriale globale;
- `20260819103031 editorial_submission_country_labels` — etichette Paese per submission;
- `20260819105012 content_media` + hardening successivo — media contenuti;
- `20260819141022 editorial_inbox_activity` — audit di stato/priorità/assegnazione Inbox;
- `20260819141338 harden_editorial_table_grants` — rimozione privilegi tecnici e grant espliciti minimi;
- `20260819141551 editorial_contributor_tracking` — ruolo contributore, ownership e lettura delle proprie proposte;
- `20260819141807 index_editorial_foreign_keys` — indici FK della fondazione editoriale;
- `20260819141836 optimize_editorial_inbox_policies` — policy SELECT unificate e write editor-only;
- `20260819142736 extend_access_application_roles_for_contributor` — helper autorizzativo esteso al ruolo contributore;
- `20260819143251 allow_assign_contributor_role` — assegnazione service-role del ruolo contributore;
- `20260819143646 seed_observatory_foreign_firms_2025` — fonte e valori InfoCamere/Futurae Italia/Lombardia 30 giugno 2025.

Verifiche eseguite sul backend reale:

1. connessione PostgreSQL: PASS;
2. tabelle editoriali fondamentali: presenti;
3. RLS: attiva su Inbox, submission, geografie/rotte e tabelle principali;
4. form pubblico anonimo via RPC: PASS in transazione con rollback;
5. scrittura diretta anonima su Inbox/submission: non concessa;
6. audit trigger Inbox: PASS;
7. update Inbox da amministratore autenticato attraverso RLS: PASS;
8. audit dell'update amministratore: PASS;
9. contributor smoke RLS: ruolo contributor vero, admin falso, 1 riga propria visibile, 0 righe altrui visibili — PASS con rollback;
10. assegnazione `contributore` tramite funzione privilegiata: PASS in transazione con rollback;
11. righe smoke residue: 0;
12. grant editoriali: ridotti a SELECT/DML necessari; niente TRUNCATE/TRIGGER/REFERENCES per `authenticated` sulle nuove tabelle;
13. nessun flusso pubblica automaticamente un contenuto.

## Nucleo Osservatorio verificato

Il backend reale contiene ora due famiglie di dati chiaramente separate per metodologia:

- **Eurostat `lfsa_esgan`** — lavoro autonomo per cittadinanza, Italia, valori 2021–2023 già presenti; è una misura LFS riferita alle persone e alla cittadinanza;
- **InfoCamere/Futurae, I semestre 2025** — imprese straniere registrate al 30 giugno 2025: Italia `678.004`, Lombardia `135.249`; è una misura camerale riferita alle imprese registrate.

La separazione è intenzionale: “impresa straniera” secondo InfoCamere non equivale a “imprenditore immigrato” né a “lavoratore autonomo straniero” Eurostat. La definizione e il limite interpretativo sono memorizzati nella fonte, nell'indicatore e nelle note dei valori.

La scheda pubblica dell'indicatore espone inoltre il link alla fonte originale, l'edizione, la data della fonte quando disponibile, la nota metodologica del singolo valore e la data di aggiornamento nell'Osservatorio.

### Nota advisor Supabase

L'advisor segnala `submit_editorial_contribution` perché è una funzione `SECURITY DEFINER` eseguibile da `anon`/`authenticated`. Nel modello corrente questo è intenzionale: è il confine controllato del form pubblico, mentre `anon` non riceve accesso diretto alle tabelle Inbox/submission. La funzione valida gli input e usa `search_path = ''`.

L'advisor Auth segnala inoltre la protezione password compromesse non attiva. È un punto di hardening da chiudere nella fase 19 prima del lancio, non un requisito del gate schema.

Gli avvisi `unused_index` non vengono usati come criterio di rimozione ora: il database è a basso traffico e non ha ancora storico sufficiente. Gli indici FK mancanti introdotti dalla fondazione editoriale sono stati invece aggiunti.

## Gate sicurezza e build

Il branch usa **Next.js 16.3.1** con `package-lock.json` rigenerato da npm.

GitHub Actions `Editorial v1 CI` esegue:

1. `npm ci`;
2. `npm audit --audit-level=high`;
3. `npm run typecheck`;
4. `npm test`;
5. `npm run build`.

Il pacchetto contributor precedente (`cb7f464`) ha completato il run CI #101 con **PASS**. Ogni nuovo head resta soggetto allo stesso gate prima del merge.

## Standard editoriale e lancio

Sono canonici:

- `STORIES-INTERVIEWS-STANDARD.md` — selezione, verifica, formati, domande guida, indipendenza, consensi e video;
- `NUMBER-ZERO-PLAN.md` — 10 contenuti principali, due per fascia Lombardia / Italia / italiani all'estero / Europa / resto del mondo.

## Blocchi infrastrutturali residui

- **Supabase:** non è più un blocco; progetto `ACTIVE_HEALTHY`, migrazioni allineate e smoke reali PASS.
- **Vercel:** l'head applicativo più recente è soggetto al `build-rate-limit` del piano; il fallimento del relativo check non viene interpretato come errore del codice.
- **Radar cron:** `CRON_SECRET` e smoke del cron restano da verificare sul progetto Vercel corretto.

## Regola di merge

Il PR resta draft. Nessun merge su `main` finché non abbiamo CI verde sull'head e, salvo decisione esplicita diversa, una Preview Vercel realmente eseguita con smoke sul backend Supabase reale. Il fallimento `build-rate-limit` non viene interpretato come errore del codice ma non viene neppure usato come falso PASS.
