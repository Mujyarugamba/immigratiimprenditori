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

Commit applicativo verificato: `764ab1fac82aa61361fc00d7e7fbeb5a9cc1e94a`.

- `Editorial v1 CI` run `32620148591`: **COMPLETED / SUCCESS**.
- `Supabase local migration validation` run `32620148584`: tutti i gate DB/infra/app passano; il job conclude failure esclusivamente perché il browser mantiene intenzionalmente rosso il requisito editoriale **Storie reali**.
- Browser nel laboratorio Supabase: **19 PASS / 1 FAIL**; unico failure = nessuna storia/intervista/testimonianza reale pubblicata.
- La matrice core multilingua **70/70** passa anche contro il vero stack Supabase locale.
- Il gate tastiera verifica focus visibile del salto al contenuto e trasferimento del focus a `#contenuto-principale`: **PASS**.

Le revisioni documentali successive non modificano il codice applicativo già verificato.

## Gate tecnici verificati

| Gate | Stato | Evidenza / nota |
| --- | --- | --- |
| TypeScript | PASS | `Editorial v1 CI` run `32620148591` |
| Unit / contract tests | PASS | inclusi gate profilo autore e contrasto WCAG |
| Next.js build | PASS | build standard + build contro Supabase locale; 180 route |
| HTTP smoke | PASS | route critiche + header di sicurezza |
| Public browser smoke | PASS | homepage/shell, lingue, responsive, tastiera e navigazione core |
| Matrice 7 lingue × 10 superfici | PASS | 70/70 risposte complete, `lang`, `dir`, H1 e link localizzati |
| Internal-link integrity | PASS | verificato sul vero stack Supabase locale |
| Responsive automatico | PASS | 320 / 390 / 768 px senza overflow sulle superfici core |
| Keyboard skip/focus | PASS | primo Tab → skip link visibile con outline; Invio → focus sul contenuto principale |
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
| Contrast/focus automatico | PASS | testo piccolo >=4.5:1; focus >=3:1 su shell chiare/scure |
| Author editorial lifecycle | PASS LOCAL/CI | MFA → contenuto pubblicato → autore privato → attribuzione → evidence gate → profilo pubblico → cleanup |

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
- browser autenticato con MFA e ciclo autore evidence-gated;
- teardown completo.

Gate:

- `DB_LOCAL_NONPROD = PASS`
- `LOCAL_DB_COLD_START = PASS`
- `LOCAL_DB_LINT = PASS`
- `LOCAL_DB_SECURITY = PASS`
- `HOSTED_SUPABASE_BRANCH = NOT_NEEDED_NOW`

Un branch hosted potrà essere rivalutato soltanto nell'ultimo pre-rilascio se servirà un controllo di parità dell'infrastruttura Supabase ospitata.

## Dati e superfici go-live

Il browser/laboratorio verifica prima del gate Storie che:

- `/osservatorio` risponde 2xx, rende la superficie reale ed espone almeno un indicatore navigabile;
- `/atlante` risponde 2xx ed espone almeno un Paese evidence-backed navigabile;
- `/atlante/rotte` risponde 2xx ed espone almeno una rotta evidence-backed navigabile;
- cold-start: **34 territori attivi** e **11 rotte attive**;
- le 11 rotte sono collegate all'evidenza Futurae/InfoCamere/Unioncamere preparata nel branch;
- Open Data offre JSON/CSV/XLSX, con XLSX validato realmente;
- analytics first-party aggrega senza cookie;
- RTL arabo e navigazione mobile sono utilizzabili senza overflow sulle superfici core;
- le 70 combinazioni core delle sette lingue restituiscono risposte complete e strutturalmente valide;
- la navigazione da tastiera dispone di salto al contenuto verificato e focus visibile.

## Gate editoriali e di autorevolezza

| Gate | Stato | Nota |
| --- | --- | --- |
| Fonti e metodologia | PASS | registro fonte → dati usati → copertura → periodicità → qualità → metodo/limiti |
| Advanced Search | BRANCH_READY | ricerca pubblica avanzata operativa con filtri/ranking di base |
| Knowledge Graph relazionale | BRANCH_READY | relazioni da dati pubblicati/verificati; nessuna relazione AI pubblica |
| Home editoriale v1 | TECHNICAL SHELL PASS / STORIES BLOCKED | la struttura è operativa, ma non viene dichiarata completa finché manca una storia reale |
| Identità visiva | PASS / FINAL DEVICE QA PENDING | design applicato; browser reflow passa, resta QA umano device reale |
| SEO internazionale | PASS — FOUNDATION | canonical/hreflang verificati sulle home localizzate; sitemap/noindex preview predisposti |
| Sette lingue | READY — CORE 70/70 PASS | IT/EN/FR/ES/DE/AR/ZH × 10 superfici core verificate sul vero stack locale |
| RTL arabo | PASS — CORE | `/ar`, `/ar/chi-siamo`, `/ar/esplora` senza overflow mobile |
| Profili autore | **READY — FULL E2E** | back-office MFA AAL2, attribuzione ed evidence gate verificati; cold-start = 0 profili reali per scelta di integrità editoriale |
| Accessibilità | AUTOMATED CORE + CONTRAST + KEYBOARD PASS / HUMAN WCAG QA PENDING | struttura/reflow/contrasto/focus/skip link passano; non equivale a certificazione WCAG completa |
| Correzioni/versioni | PREPARED / PROD NOT ACTIVATED | schema predisposto; pagina pubblica solo con record reali |
| Controlli automatici | PASS | CI applicativo, DB/security, link integrity, multilingua e release source gates automatici |
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

## Profili autore

Il back-office espone:

- `/app/redazione/autori` per elenco e creazione privata;
- `/app/redazione/autori/[id]` per verifica, modifica e attribuzioni;
- validazione slug, URL e ORCID;
- MFA AAL2 per tutte le scritture editoriali;
- blocco della pubblicazione se mancano bio/evidenza minima;
- blocco della pubblicazione se non esiste almeno un contenuto `ready + published + public` collegato.

Il browser autenticato ha verificato l'intero ciclo con dati effimeri e cleanup finale. Il security smoke continua a restituire `anon_public_authors = 0`: il ramo **non introduce profili fittizi**. La funzione #36 è quindi READY; i futuri autori reali verranno popolati soltanto quando esistono identità e attribuzioni effettive.

## Accessibilità automatizzata

Oltre ai gate strutturali già presenti, il branch protegge anche i token critici di contrasto e il percorso di tastiera iniziale:

- testo piccolo/stati secondari: rapporto minimo **4.5:1** su bianco;
- focus visibile: rapporto minimo **3:1** sia su superficie chiara sia sulla shell navy;
- primo Tab: skip link visibile e dotato di outline;
- attivazione skip link: focus trasferito al contenuto principale;
- reduced motion e reflow restano coperti.

Questo riduce il rischio tecnico del #92 ma non sostituisce tastiera completa su tutti i flussi, screen reader, zoom, percezione contenuti e altri controlli umani WCAG 2.2 AA.

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

- **READY: 31/33**
- **DA RIFINIRE: 1/33 (#92 WCAG QA umano)**
- **BLOCCANTE — CONTENUTO REALE: 1/33 (#10 Storie d'impresa)**

#30 multilingua, #36 Profili autore e #99 controlli automatici sono READY sulla base dei gate verificati sopra.

## Blocchi reali prima della produzione

1. **Numero zero — Storie:** acquisire, approvare e pubblicare almeno una storia/intervista/testimonianza reale.
2. **Accessibilità:** completare QA umano WCAG 2.2 AA; il gate automatico è una baseline forte, non una certificazione.
3. **Contenuti/autori reali:** inserire identità autore soltanto quando richieste da contenuti realmente attribuiti; questo non è più un difetto funzionale #36.
4. **Legal:** revisione finale Privacy / Cookie / Termini e dati amministrativi esposti.
5. **Security pre-release:** CSP finale e verifica configurazione production.
6. **Required checks:** `main` è protetto, ma i required status checks risultano ancora non configurati/attivi e richiedono una decisione di governance prima del rilascio.
7. **Migration produzione:** definire ordine/rollback e applicare solo con autorizzazione esplicita.
8. **Production secrets/activation:** MFA Auth, backup schedulato, analytics e altre funzioni validate localmente devono essere configurate esplicitamente sul live.
9. **Netlify final QA:** preview del commit candidato, controllo umano desktop/tablet/mobile, performance e smoke finale.
10. **Merge/deploy:** PR #9 resta draft; merge e go-live restano ultimi passi autorizzati separatamente.

Social e pagamenti possono rimanere disabilitati senza bloccare il sito se non vengono promessi come funzioni attive.

## Decisione attuale

- `APPLICATION_CI = PASS`
- `PUBLIC_BROWSER_RESPONSIVE = PASS`
- `PUBLIC_KEYBOARD_SKIP_FOCUS = PASS`
- `MULTILINGUAL_CORE_70_70 = PASS`
- `INTERNAL_LINK_INTEGRITY = PASS`
- `DB_LOCAL_NONPROD = PASS`
- `DB_SECURITY = PASS`
- `SOURCES_METHODOLOGY = PASS`
- `ATLAS_ROUTES_CORE = PASS`
- `OPEN_DATA_XLSX = PASS`
- `PRIVACY_ANALYTICS_LOCAL = PASS`
- `BACKUP_ARCHIVE_LOCAL = PASS`
- `MFA_AAL2_LOCAL = PASS`
- `AUTHOR_BACKOFFICE = PASS_LOCAL_CI`
- `AUTHOR_FULL_LIFECYCLE_E2E = PASS`
- `AUTHOR_REAL_PUBLIC_PROFILES = 0_INTENTIONAL`
- `WCAG_AUTOMATED_CONTRAST = PASS`
- `WCAG_HUMAN_QA = PENDING`
- `MAIN_UNTOUCHED = PASS`
- `PRODUCTION_DB_UNTOUCHED = PASS`
- `PAID_SUPABASE_BRANCH = NOT_NEEDED_NOW`
- `GO_LIVE_A_READY = 31/33`
- `NUMBER_ZERO_STORIES = BLOCKER`
- `PRODUCTION_RELEASE = BLOCKED_BY_EXPLICIT_FINAL_GATES`

Il ramo non è bloccato da errori di compilazione, database, multilingua, link integrity, responsive, tastiera core o infrastruttura di test. Il **solo failure automatico residuo** del laboratorio è deliberatamente editoriale: manca una storia reale. Rimangono inoltre il QA umano WCAG e i gate amministrativi/production sopra elencati.
