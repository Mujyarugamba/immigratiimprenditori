# Production readiness — 22 agosto 2026

Ultima verifica tecnica: **23 agosto 2026**
Branch di verifica: `feature/research-radar-ai-knowledge-20260822`
Base di sviluppo: `feature/institutional-identity` (`b0810a3f614912ecf53eeee4c356a8177a45d185`)
Production branch: `main` — non modificato.
PR di integrazione: **#9 — DRAFT, non mergeata**.

## Regola di rilascio

Questo documento distingue **branch-ready**, **validato localmente** e **attivo in produzione**. Una funzione può essere completa e verificata nel branch senza essere ancora autorizzata alla produzione.

Nel ciclo corrente:

- nessuna migration è stata applicata al database di produzione;
- nessun deploy di produzione è stato eseguito;
- Netlify resta il solo ambiente previsto per preview;
- nessun branch Supabase hosted a pagamento è stato creato;
- `main` non è stato modificato;
- PR #9 resta draft.

## Ultimo codice verificato

Commit applicativo verificato: `5617d9a00ddab75e5d6b71ffba1e944ac7276904`.

- `Editorial v1 CI` run `32602163909`: **COMPLETED / SUCCESS**.
- `Supabase local migration validation` run `32602163939`: tutti i gate DB/infra/app passano; il job conclude failure perché il browser mantiene intenzionalmente rosso il requisito editoriale **Storie reali**.
- Browser nel laboratorio Supabase: **16 PASS / 1 FAIL**; unico failure = nessuna storia/intervista/testimonianza reale pubblicata.

Le revisioni documentali successive non cambiano il codice verificato.

## Gate tecnici verificati

| Gate | Stato | Evidenza / nota |
| --- | --- | --- |
| TypeScript | PASS | `Editorial v1 CI` run `32602163909` |
| Unit / contract tests | PASS | 80/80 test |
| Next.js build | PASS | build applicativa standard + build contro Supabase locale |
| HTTP smoke | PASS | route critiche + header di sicurezza |
| Public browser smoke | PASS | homepage/shell, 7 lingue e reflow narrow viewport |
| Responsive automatico | PASS | 320 / 390 / 768 px senza overflow sulle superfici core |
| Slow-network core | PASS | homepage con latenza artificiale entro budget DOM/request |
| Local DB cold-start | PASS | catena standalone ricostruita da database vuoto |
| PostgreSQL lint | PASS | nessun errore schema/funzioni |
| Publication/RLS security | PASS | letture pubbliche e gate di pubblicazione verificati |
| Rate limiting | PASS LOCAL/CI | API/form/login; activation production separata |
| MFA privilegiati | PASS LOCAL/CI | TOTP + AAL2 obbligatorio verificato in browser/SSR |
| Audit log | PASS LOCAL/CI | activity log + policy insert validate |
| Backup archive | PASS LOCAL/CI | workflow PostgreSQL 17 + dump/restore integrity smoke |
| Analytics privacy-friendly | PASS LOCAL/CI | page view first-party aggregata senza creare cookie |
| Open Data XLSX | PASS | endpoint XLSX valido e archivio verificato E2E |
| Dependency install/audit | PASS | 0 vulnerabilità al gate configurato |
| Supabase Auth deprecation guard | PASS | nessun `auth.role()` eseguibile nella catena verificata |

## Ambiente database non-production gratuito

Stato: **PASS**.

La precedente assenza di un branch Supabase hosted non è un blocco per la validazione di sviluppo. È operativo un laboratorio effimero GitHub Actions + Supabase CLI/Docker che ricostruisce il database standalone Centro Studi da zero.

Catena validata:

1. baseline SPLIT-3 `supabase/baseline/00..03`;
2. fondazione editoriale standalone;
3. evoluzioni post-cutover necessarie;
4. migration Centro Studi correnti del branch.

Controlli verificati:

- cold start completo;
- `supabase db lint --level error --fail-on error`;
- publication/RLS security smoke;
- rate limiting persistente;
- audit + analytics smoke;
- backup archive integrity;
- Auth integration reale con utenti effimeri;
- build applicativa contro il DB locale;
- teardown completo.

Gate:

- `DB_LOCAL_NONPROD = PASS`
- `LOCAL_DB_COLD_START = PASS`
- `LOCAL_DB_LINT = PASS`
- `LOCAL_DB_SECURITY = PASS`
- `HOSTED_SUPABASE_BRANCH = NOT_NEEDED_NOW`

Un branch hosted potrà essere rivalutato soltanto nell'ultimo pre-rilascio se servirà un controllo di parità dell'infrastruttura Supabase ospitata.

## Dati e superfici go-live

Il browser del laboratorio verifica prima del gate Storie che:

- `/osservatorio` risponde 2xx, rende la superficie reale ed espone almeno un indicatore navigabile;
- `/atlante` risponde 2xx ed espone almeno un Paese evidence-backed navigabile;
- `/atlante/rotte` risponde 2xx ed espone almeno una rotta evidence-backed navigabile;
- cold-start: **34 territori attivi** e **11 rotte attive**;
- le 11 rotte sono collegate all'evidenza Futurae/InfoCamere/Unioncamere preparata nel branch;
- Open Data offre JSON/CSV/XLSX, con XLSX validato realmente;
- analytics first-party aggrega senza cookie;
- RTL arabo e navigazione mobile sono utilizzabili senza overflow sulle superfici core.

## Gate editoriali e di autorevolezza

| Gate | Stato | Nota |
| --- | --- | --- |
| Fonti e metodologia | PASS | registro fonte → dati usati → copertura → periodicità → qualità → metodo/limiti |
| Advanced Search | BRANCH_READY | ricerca pubblica avanzata operativa con filtri/ranking di base |
| Knowledge Graph relazionale | BRANCH_READY | relazioni da dati pubblicati/verificati; nessuna relazione AI pubblica |
| Home editoriale v1 | TECHNICAL SHELL PASS / STORIES BLOCKED | la struttura è operativa, ma non viene dichiarata completa finché manca una storia reale |
| Identità visiva | PASS / FINAL DEVICE QA PENDING | design applicato; browser reflow passa, resta QA umano device reale |
| SEO internazionale | PASS — FOUNDATION | canonical/hreflang verificati sulle home localizzate; sitemap/noindex preview predisposti |
| Sette lingue | CORE BROWSER PASS / COVERAGE PENDING | IT/EN/FR/ES/DE/AR/ZH shell e `lang`/`dir` passano; completare copertura editoriale prevista |
| RTL arabo | PASS — CORE | `/ar`, `/ar/chi-siamo`, `/ar/esplora` senza overflow mobile |
| Profili autore | FUNCTION E2E PASS / REAL DATA PENDING | pagina/listing/ORCID/JSON-LD passano con profilo effimero; cold-start = 0 profili pubblici reali |
| Accessibilità | AUTOMATED CORE PASS / HUMAN WCAG QA PENDING | landmark/H1/alt/label/naming/skip-link/reflow passano; non equivale a certificazione WCAG completa |
| Correzioni/versioni | PREPARED / PROD NOT ACTIVATED | schema predisposto; pagina pubblica solo con record reali |
| Numero zero | **5/6 EVIDENZE / STORIES BLOCKER** | requisito Storie è l'unico failure del browser locale completo |

## Blocco editoriale reale: Storie

Il database ricostruito da zero contiene contenuti pubblicati di tipo:

- `insight`: 12;
- `guide`: 4;
- `institutional_page`: 1.

Non contiene alcun contenuto pubblicato di tipo `business_story`, `interview`, `testimony` o `personal_story`.

Per questo il gate E2E richiede correttamente almeno una storia/intervista/testimonianza reale e resta rosso. Non va risolto con placeholder, dati inventati o riclassificando artificialmente un insight esistente.

La short list è disponibile nel back-office come **Voci candidate**. Regola corrente:

- nessun contatto inviato automaticamente;
- nessun invito fittizio;
- nessuna pubblicazione senza approvazione;
- modalità futura preferita: domande del Centro Studi + eventuale video registrato autonomamente dall'intervistato + fact-check/autorizzazioni prima della pubblicazione.

Gate:

- `INTERVIEW_SHORTLIST = READY`
- `OUTREACH_SENT = 0`
- `NUMBER_ZERO_STORIES = BLOCKED_BY_REAL_CONTENT`

## Sostegno economico

La pagina `/sostieni` è pronta sul piano istituzionale, ma il checkout resta intenzionalmente spento.

Configurazione fail-closed:

- `donationsOnlineEnabled = false`;
- provider = `null`;
- payment URL = `null`;
- nessuna CTA di pagamento appare al pubblico.

Prima dell'attivazione occorrono dati amministrativi, intestazione corretta del conto, provider, formulazione fiscale e URL pubblico verificati. Non è un blocco per il rilascio editoriale se i pagamenti restano disabilitati.

## Social istituzionali

Perimetro v1 nel codice:

- LinkedIn;
- X;
- YouTube.

I profili restano `enabled:false` finché l'account esterno non è realmente creato e l'URL finale verificato. In questo modo `sameAs` e link pubblici non espongono profili soltanto pianificati.

## Migration preparate e NON attivate in produzione

Tra le architetture/evoluzioni validate localmente rientrano almeno:

- `20260822120000_prepare_content_translation_groups.sql`
- `20260822150000_prepare_content_versions_and_corrections.sql`
- `20260822151000_prepare_author_profiles.sql`
- `20260822155000_knowledge_search_architecture.sql`
- `20260822161000_editorial_automation_architecture.sql`
- `20260822172000_harden_content_publication_gate.sql`
- `20260822210500_go_live_audit_analytics.sql`
- `20260822211500_fix_public_rls_mfa_compatibility.sql`
- `20260822212000_backfill_futurae_route_evidence.sql`

La validazione locale **non equivale** ad attivazione sul database live.

## Roadmap funzionale A — stato corrente

Riferimento: `docs/roadmap/ROADMAP-110-PRIORITIES.md`.

- **READY: 28/33**
- **DA RIFINIRE: 4/33**
- **BLOCCANTE — CONTENUTO REALE: 1/33 (#10 Storie d'impresa)**

I quattro punti ancora da rifinire sono:

1. #30 — copertura completa delle sette lingue;
2. #36 — popolamento di profili autore reali;
3. #92 — QA completo WCAG 2.2 AA, inclusa verifica umana;
4. #99 — chiusura pacchetto finale controlli automatici/release gate.

## Blocchi reali prima della produzione

1. **Numero zero — Storie:** acquisire, approvare e pubblicare almeno una storia/intervista/testimonianza reale.
2. **Multilingua:** chiudere la copertura editoriale delle pagine pubbliche previste nelle sette lingue.
3. **Autori:** inserire profili reali quando richiesti dai contenuti del numero zero.
4. **Accessibilità:** completare QA umano WCAG 2.2 AA; il gate automatico è una baseline, non una certificazione.
5. **Controlli/release:** chiudere link/external checks, Lighthouse/performance e quality gate finale.
6. **Legal:** revisione finale Privacy / Cookie / Termini e dati amministrativi esposti.
7. **Security pre-release:** CSP finale e verifica configurazione production.
8. **Required checks:** `main` è protetto via ruleset, ma i required status checks vanno verificati separatamente prima di dichiararli attivi.
9. **Migration produzione:** definire ordine/rollback e applicare solo con autorizzazione esplicita.
10. **Production secrets/activation:** MFA Auth, backup schedulato, analytics e altre funzioni validate localmente devono essere configurate esplicitamente sul live.
11. **Netlify final QA:** preview del commit candidato, controllo umano desktop/tablet/mobile e smoke finale.
12. **Merge/deploy:** PR #9 resta draft; merge e go-live restano ultimi passi autorizzati separatamente.

Social e pagamenti possono rimanere disabilitati senza bloccare il sito se non vengono promessi come funzioni attive.

## Decisione attuale

- `APPLICATION_CI = PASS`
- `PUBLIC_BROWSER_RESPONSIVE = PASS`
- `DB_LOCAL_NONPROD = PASS`
- `DB_SECURITY = PASS`
- `SOURCES_METHODOLOGY = PASS`
- `ATLAS_ROUTES_CORE = PASS`
- `OPEN_DATA_XLSX = PASS`
- `PRIVACY_ANALYTICS_LOCAL = PASS`
- `BACKUP_ARCHIVE_LOCAL = PASS`
- `MFA_AAL2_LOCAL = PASS`
- `MAIN_UNTOUCHED = PASS`
- `PRODUCTION_DB_UNTOUCHED = PASS`
- `PAID_SUPABASE_BRANCH = NOT_NEEDED_NOW`
- `GO_LIVE_A_READY = 28/33`
- `NUMBER_ZERO_STORIES = BLOCKER`
- `PRODUCTION_RELEASE = BLOCKED_BY_EXPLICIT_FINAL_GATES`

Il ramo non è più bloccato da errori di compilazione, database, responsive o infrastruttura di test. Il failure residuo del laboratorio è deliberatamente editoriale: **manca una storia reale**. Restano inoltre i quattro rifinimenti A e i gate amministrativi/production sopra elencati.
