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
| 6. Contribuisci | **PUBLIC FLOW + DATA MODEL PASS / CONTRIBUTOR UI PENDING** | Invio occasionale senza account PASS; contributore autenticato può essere associato alle proprie proposte e leggerle via RLS. Resta da esporre una pagina UI “le mie proposte”. Nessuna pubblicazione automatica. |
| 7. Storie e interviste | **CODE + EDITORIAL STANDARD PASS** | Sezione pubblica/redazionale e standard editoriale canonico; popolamento del numero zero da fare. |
| 8. Osservatorio v1 | **DATA MODEL LIVE / CONTENT REVIEW PENDING** | Indicatori, valori, fonti, metodologia e RLS esistono sul backend reale; nucleo dati del numero zero da popolare/revisionare. |
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
| 19. Qualità/privacy/sicurezza | **CODE SECURITY + SUPABASE RLS SMOKE PASS / PREVIEW+PRIVACY PENDING** | Next 16.3.1; npm audit 0 vulnerabilità; 60/60 test; typecheck/build PASS. Supabase `ACTIVE_HEALTHY`, grant editoriali ridotti, RLS verificata e FK editoriali indicizzate. Restano Preview Vercel e revisione privacy finale; leaked-password protection Auth da valutare/attivare prima del lancio. |
| 20. Lancio editoriale | **NUMBER ZERO PLAN READY / CONTENT PENDING** | Piano di 10 contenuti bilanciati 20%×5 pronto; ricerca, verifica e produzione dei contenuti da completare. |

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
- `20260819141836 optimize_editorial_inbox_policies` — policy SELECT unificate e write editor-only.

Verifiche eseguite sul backend reale:

1. connessione PostgreSQL: PASS;
2. tabelle editoriali fondamentali: presenti;
3. RLS: attiva su Inbox, submission, geografie/rotte e tabelle principali;
4. form pubblico anonimo via RPC: PASS in transazione con rollback;
5. scrittura diretta anonima su Inbox/submission: non concessa;
6. audit trigger Inbox: PASS;
7. update Inbox da amministratore autenticato attraverso RLS: PASS;
8. audit dell'update amministratore: PASS;
9. righe smoke residue: 0;
10. grant editoriali: ridotti a SELECT/DML necessari; niente TRUNCATE/TRIGGER/REFERENCES per `authenticated` sulle nuove tabelle;
11. ruolo `contributore`: ammesso dal modello; lettura limitata alle proposte collegate al proprio account;
12. nessun flusso pubblica automaticamente un contenuto.

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

Sul commit `e6d645f` il run CI #99 è **PASS**. Il deploy Vercel `immigratiimprenditori` è **SUCCESS**; la Preview separata è ancora respinta dal `build-rate-limit` del piano.

## Standard editoriale e lancio

Sono canonici:

- `STORIES-INTERVIEWS-STANDARD.md` — selezione, verifica, formati, domande guida, indipendenza, consensi e video;
- `NUMBER-ZERO-PLAN.md` — 10 contenuti principali, due per fascia Lombardia / Italia / italiani all'estero / Europa / resto del mondo.

## Blocchi infrastrutturali residui

- **Supabase:** non è più un blocco; progetto `ACTIVE_HEALTHY` e smoke reali PASS.
- **Vercel produzione:** deploy dell'head precedente DB (`e6d645f`) riuscito.
- **Vercel Preview:** resta soggetta a `build-rate-limit`; non viene considerata un errore del codice, ma resta un gate esterno prima del merge secondo la regola corrente.
- **Radar cron:** `CRON_SECRET` e smoke del cron restano da verificare sul progetto Vercel corretto.

## Regola di merge

Il PR resta draft. Nessun merge su `main` finché non abbiamo CI verde sull'head e, salvo decisione esplicita diversa, una Preview Vercel realmente eseguita con smoke sul backend Supabase reale. Il fallimento `build-rate-limit` non viene interpretato come errore del codice ma non viene neppure usato come falso PASS.
