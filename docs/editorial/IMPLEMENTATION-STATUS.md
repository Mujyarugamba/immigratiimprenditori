# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Questo documento è il checkpoint operativo della roadmap canonica `ROADMAP.md`. `PASS` significa implementato e verificato al livello indicato; `PENDING` non va interpretato come fallimento.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sitemap pubblica/redazionale materializzata nelle sezioni principali. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione e rotte senza privilegio tecnico per l'Italia. |
| 4. Modello dati v1 | **PASS** | Inbox, submission, geografia e rotte già implementate in Supabase. |
| 5. Scrivania redazionale | **CODE PASS / DB AUDIT PENDING** | Inbox, triage, presa in carico, priorità, dashboard e conteggio arrivi Radar. Migration audit versionata; apply bloccato da timeout connettore Supabase. |
| 6. Contribuisci | **PUBLIC FLOW PASS** | Invio occasionale senza account; validazioni server/browser, honeypot, URL HTTP(S), nessuna pubblicazione automatica. Account contributore abituale resta evoluzione successiva. |
| 7. Storie e interviste | **CODE + EDITORIAL STANDARD PASS** | Sezione pubblica/redazionale e standard editoriale canonico; popolamento del numero zero da fare. |
| 8. Osservatorio v1 | **EXISTING / REVIEW PENDING** | Indicatori, valori, fonti e metodologia esistono; revisione contenutistica del nucleo dati da fare. |
| 9. Rapporti e ricerche | **CODE PASS** | Sezione pubblica + vista redazionale; biblioteca da popolare. |
| 10. Eventi | **FUNCTIONAL / CONTENT PENDING** | Calendario e redazione esistono; selezione di eventi qualificati da popolare. |
| 11. Radar mondiale | **CODE PASS / PRODUCTION PENDING** | GDELT v1 → normalizzazione/dedupe → Inbox; cron giornaliero predisposto. Attivazione richiede Production deploy e `CRON_SECRET`. |
| 12. Fonti e metodologia | **CODE PASS** | `/fonti` pubblico e redirect legacy `/dati-e-fonti`. |
| 13. Identità visiva | **V1 PASS** | Palette globale monocromatica bianco/nero/grigi, niente gradienti o colori decorativi. |
| 14. Home | **V1 PASS** | Prima pagina editoriale dinamica su Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING** | LinkedIn, X/Twitter e YouTube richiedono creazione/configurazione account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta; pagamento e formule fiscali attendono dati AIPEL verificati. |
| 17. Identità AIPEL | **PARTIAL PASS** | AIPEL, Presidenza e direzione editoriale visibili; denominazione completa/sede/dati fiscali ancora da inserire. |
| 18. SEO | **TECHNICAL V1 PASS** | Metadata base, sitemap, robots, nuove route canoniche e redirect legacy. Multilingua resta evoluzione. |
| 19. Qualità/privacy/sicurezza | **CODE SECURITY PASS / EXTERNAL GATES PENDING** | Next 16.3.1; npm audit 0 vulnerabilità; 60/60 test; typecheck e `next build` PASS; header web e Contribuisci hardenizzati. Restano Preview/smoke con backend reale, Supabase/RLS e revisione privacy finale. |
| 20. Lancio editoriale | **NUMBER ZERO PLAN READY / CONTENT PENDING** | Piano di 10 contenuti bilanciati 20%×5 pronto; ricerca, verifica e produzione dei contenuti da eseguire. |

## Gate sicurezza e build

Il branch usa **Next.js 16.3.1** con `package-lock.json` rigenerato da npm. L'upgrade è stato validato tramite registry npm e audit prima del commit atomico dei file dipendenze.

GitHub Actions `Editorial v1 CI` esegue ora:

1. `npm ci`;
2. `npm audit --audit-level=high`;
3. `npm run typecheck`;
4. `npm test`;
5. `npm run build`.

Gate verificato sul branch:

- installazione: PASS;
- audit: **0 vulnerabilità**;
- typecheck: PASS;
- test: **60/60 PASS**;
- Next production build: PASS.

## Standard editoriale e lancio

Sono canonici:

- `STORIES-INTERVIEWS-STANDARD.md` — selezione, verifica, formati, domande guida, indipendenza, consensi e video;
- `NUMBER-ZERO-PLAN.md` — 10 contenuti principali, due per fascia Lombardia / Italia / italiani all'estero / Europa / resto del mondo.

## Blocchi infrastrutturali non imputabili al codice

- Vercel rifiuta attualmente nuove build con `build-rate-limit`; non vengono creati progetti duplicati.
- Il connettore Vercel disponibile vede soltanto `inquotus-next`, non il progetto Immigrati esistente; nessuna riconfigurazione viene tentata alla cieca.
- Il connettore Supabase termina le query correnti per connection timeout; la migration audit della Inbox resta versionata ma non applicata finché non è possibile verificare Production.

## Regola di merge

Il PR resta draft. Il merge su `main` richiede CI verde e, salvo decisione esplicita diversa, una Preview Vercel realmente eseguita con smoke sul backend Supabase reale. Il fallimento `build-rate-limit` non viene interpretato come errore del codice ma non viene neppure usato come falso PASS.
