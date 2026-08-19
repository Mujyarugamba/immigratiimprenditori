# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Questo documento è il checkpoint operativo della roadmap canonica `ROADMAP.md`. `PASS` significa implementato e verificato al livello indicato; `PENDING` non va interpretato come fallimento.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sitemap pubblica/redazionale definita e quasi interamente materializzata. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione e rotte senza privilegio tecnico per l'Italia. |
| 4. Modello dati v1 | **PASS** | Inbox, submission, geografia e rotte già implementate in Supabase. |
| 5. Scrivania redazionale | **CODE PASS / DB AUDIT PENDING** | Inbox, triage, presa in carico, priorità e dashboard. Migration audit versionata; apply bloccato da timeout connettore Supabase. |
| 6. Contribuisci | **PUBLIC FLOW PASS** | Invio occasionale senza account operativo. Account contributore abituale resta evoluzione successiva. |
| 7. Storie e interviste | **CODE PASS** | Sezione pubblica + vista redazionale; popolamento editoriale da fare. |
| 8. Osservatorio v1 | **EXISTING / REVIEW PENDING** | Indicatori, valori, fonti e metodologia esistono; revisione contenutistica del nucleo dati da fare. |
| 9. Rapporti e ricerche | **CODE PASS** | Sezione pubblica + vista redazionale; biblioteca da popolare. |
| 10. Eventi | **FUNCTIONAL / CONTENT PENDING** | Calendario e redazione esistono; selezione di eventi qualificati da popolare. |
| 11. Radar mondiale | **CODE PASS / PRODUCTION PENDING** | GDELT v1 → dedupe → Inbox; cron giornaliero predisposto. Attivazione richiede Production deploy e `CRON_SECRET`. |
| 12. Fonti e metodologia | **CODE PASS** | `/fonti` pubblico e redirect legacy `/dati-e-fonti`. |
| 13. Identità visiva | **V1 PASS** | Palette globale monocromatica bianco/nero/grigi, senza gradienti o colori decorativi. |
| 14. Home | **V1 PASS** | Prima pagina editoriale dinamica su Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING** | LinkedIn, X/Twitter e YouTube richiedono creazione/configurazione account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta; pagamento e formule fiscali attendono dati AIPEL verificati. |
| 17. Identità AIPEL | **PARTIAL PASS** | AIPEL, Presidenza e direzione editoriale visibili; denominazione completa/sede/dati fiscali ancora da inserire. |
| 18. SEO | **TECHNICAL V1 PASS** | Metadata base, sitemap, robots, nuove route canoniche e redirect legacy. Multilingua resta evoluzione. |
| 19. Qualità/privacy/sicurezza | **PENDING FINAL GATE** | CI in corso continuo; servono Preview, smoke, Supabase/RLS e revisione privacy finale. |
| 20. Lancio editoriale | **PENDING CONTENT** | Serve numero zero: dati, storie, confronto internazionale, rapporti ed eventi selezionati. |

## Blocchi infrastrutturali non imputabili al codice

- Vercel rifiuta attualmente nuove build con `build-rate-limit`; non vengono creati progetti duplicati.
- Il connettore Vercel disponibile vede soltanto `inquotus-next`, non il progetto Immigrati esistente; nessuna riconfigurazione viene tentata alla cieca.
- Il connettore Supabase termina le query correnti per connection timeout; la migration audit della Inbox resta versionata ma non applicata finché non è possibile verificare Production.

## Gate tecnici del branch

GitHub Actions `Editorial v1 CI` esegue:

1. `npm ci`;
2. `npm run typecheck`;
3. `npm test`.

Il merge su `main` resta subordinato a CI verde e a una Preview Vercel effettivamente eseguita, non al semplice stato del codice.
