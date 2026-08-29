# Production readiness — 22 agosto 2026

Ultima verifica tecnica: **23 agosto 2026**
Branch di verifica: `feature/research-radar-ai-knowledge-20260822`
Base di sviluppo: `feature/institutional-identity` (`b0810a3f614912ecf53eeee4c356a8177a45d185`)
Production branch: `main` — non modificato (`8b1511598dc6dc3225098aa77c38c13a35a395e9`).
PR di integrazione: **#9 — DRAFT, non mergeata**.

## Regola di rilascio

Questo documento distingue **branch-ready**, **validato localmente** e **attivo in produzione**. Una funzione può essere completa e verificata nel branch senza essere ancora autorizzata alla produzione.

Nel ciclo corrente:

- nessuna migration è stata applicata al database di produzione;
- nessun deploy di produzione è stato eseguito;
- Netlify resta il solo ambiente previsto per preview;
- nessun branch Supabase hosted a pagamento è stato creato;
- `main` non è stato modificato;
- PR #9 resta draft;
- nessun contenuto fittizio viene introdotto per chiudere gate editoriali.

## Ultimo codice verificato

Commit applicativo verificato: `d3fe1e49277d43ad0bcbe5f5217bcde010761890`.

- `Editorial v1 CI` run `32629772363`: **COMPLETED / SUCCESS**.
- `Supabase local migration validation` run `32629772352`: cold-start, lint, RLS/security, rate limiting, audit/analytics, backup, Auth reale, MFA, build e tutti gli altri gate infrastrutturali/applicativi sono **PASS**; il job conclude failure esclusivamente perché il browser mantiene intenzionalmente rosso il requisito editoriale **Storie reali**.
- Browser nel laboratorio Supabase: **22 PASS / 1 FAIL**; unico failure = nessuna `business_story`, `interview`, `testimony` o `personal_story` reale pubblicata.
- La matrice core multilingua **70/70** passa anche contro il vero stack Supabase locale.
- Il gate tastiera verifica focus visibile del salto al contenuto e trasferimento del focus a `#contenuto-principale`: **PASS**.
- Lighthouse mobile CI: **3/3 run sotto 2,5 s di LCP**; CLS `0` in tutti i run.

## Performance — gate tecnico chiuso

Il gate Lighthouse non è stato allentato: resta hard-fail con LCP mediano `<= 2500 ms` e CLS mediano `<= 0.10`.

Evidenza run `32629772363`:

| Run | LCP | FCP | CLS | TBT | Performance |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | **1.223 ms** | 843 ms | **0** | 72,5 ms | **1,00** |
| 2 | **2.440 ms** | 772 ms | **0** | 45,5 ms | **0,98** |
| 3 | **2.368 ms** | 775 ms | **0** | 45 ms | **0,98** |

Ulteriore evidenza:

- risposta server del documento root nei tre run: circa `192 / 20 / 25 ms`;
- richieste iniziali Lighthouse ridotte da circa 35 a **21**;
- public browser E2E ridotto da circa 1,8 minuti a **15,3 s**;
- sette home localizzate: circa **1,5 s** complessivi nel browser CI;
- header: prefetch automatico disabilitato sui link di navigazione; logo servito tramite `next/image`;
- proxy Auth: il refresh remoto viene saltato solo quando non esiste alcun cookie sessione Supabase; i flussi autenticati continuano a essere verificati dal laboratorio reale.

Questi numeri chiudono il **gate tecnico #82 Performance sul branch/CI**. Restano separati il controllo del candidato Netlify e lo smoke live finale prima del go-live.

## Gate tecnici verificati

| Gate | Stato | Evidenza / nota |
| --- | --- | --- |
| TypeScript | PASS | `Editorial v1 CI` run `32629772363` |
| Unit / contract tests | PASS | 92 test, inclusi publication gate, profili autore, legal/privacy e contrasto WCAG |
| Next.js build | PASS | build standard + build contro Supabase locale; 180 route |
| HTTP smoke | PASS | route critiche + header di sicurezza |
| Public browser smoke | PASS | 5/5; 15,3 s complessivi |
| Lighthouse mobile | **PASS — 3/3 LCP < 2,5 s, CLS 0** | hard gate non indebolito |
| Matrice 7 lingue × 10 superfici | PASS | 70/70 risposte complete, `lang`, `dir`, H1 e link localizzati |
| Internal-link integrity | PASS | verificato sul vero stack Supabase locale |
| Responsive automatico | PASS | 320 / 390 / 768 px senza overflow sulle superfici core |
| Keyboard skip/focus | PASS | primo Tab → skip link visibile; Invio → focus sul contenuto principale |
| Slow-network core | PASS | homepage entro budget DOM/request |
| Local DB cold-start | PASS | catena standalone ricostruita da database vuoto |
| PostgreSQL lint | PASS | nessun errore schema/funzioni |
| Publication/RLS security | PASS | letture pubbliche e gate di pubblicazione verificati |
| Rate limiting | PASS LOCAL/CI | API/form/login; activation production separata |
| MFA privilegiati | PASS LOCAL/CI | TOTP + AAL2 obbligatorio verificato in browser/SSR |
| Audit log | PASS LOCAL/CI | activity log canonico DB-trigger + policy validate |
| Versionamento contenuti | **PASS LOCAL/E2E** | ledger privato trigger-only, v1/v2/v3 e snapshot storici verificati |
| Backup archive | PASS LOCAL/CI | workflow PostgreSQL 17 + dump/restore integrity smoke |
| Analytics privacy-friendly | PASS LOCAL/CI | page view first-party aggregata senza cookie |
| Open Data XLSX | PASS | endpoint XLSX valido e archivio verificato E2E |
| Dependency install/audit | PASS | 0 vulnerabilità al gate configurato |
| Supabase Auth deprecation guard | PASS | nessun `auth.role()` eseguibile nella catena verificata |
| Contrast/focus automatico | PASS | testo piccolo >=4.5:1; focus >=3:1 su shell chiare/scure |
| Author editorial lifecycle | PASS LOCAL/CI | MFA → contenuto → autore → evidence gate → profilo pubblico → cleanup |
| Radar internazionale | PASS TECNICO / REVIEW-ONLY | scope, dedupe, path/canonical e no-auto-publish self-test PASS |
| Source health | PASS TECNICO / SELF-TEST | SSRF/redirect/DNS guard PASS; primo run esterno schedulato resta gate operativo |

## Ambiente database non-production gratuito

Stato: **PASS**.

È operativo un laboratorio effimero GitHub Actions + Supabase CLI/Docker che ricostruisce da zero Auth + API + PostgreSQL del Centro Studi.

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
- login password reale, provisioning account e JWT/RPC;
- separazione contributor/editor e auto-elevazione negata;
- MFA TOTP/AAL2 per operazioni privilegiate;
- build applicativa contro il DB locale;
- browser autenticato con workflow editoriale e versionamento;
- cleanup e teardown completo.

Gate:

- `DB_LOCAL_NONPROD = PASS`
- `LOCAL_DB_COLD_START = PASS`
- `LOCAL_DB_LINT = PASS`
- `LOCAL_DB_SECURITY = PASS`
- `AUTH_INTEGRATION_LOCAL = PASS`
- `HOSTED_SUPABASE_BRANCH = NOT_NEEDED_NOW`

Un branch hosted potrà essere rivalutato soltanto nell'ultimo pre-rilascio se servirà un controllo di parità dell'infrastruttura Supabase ospitata.

## Dati e superfici go-live

Il browser/laboratorio verifica prima del gate Storie che:

- `/osservatorio` rende la superficie reale ed espone almeno un indicatore navigabile;
- `/atlante` espone almeno un Paese evidence-backed navigabile;
- `/atlante/rotte` espone almeno una rotta evidence-backed navigabile;
- cold-start: **34 territori attivi** e **11 rotte attive**;
- le rotte sono collegate all'evidenza Futurae/InfoCamere/Unioncamere preparata nel branch;
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
| Home editoriale v1 | TECHNICAL SHELL PASS / STORIES BLOCKED | struttura e performance operative; completezza editoriale bloccata dalla storia reale |
| Identità visiva | PASS / FINAL DEVICE QA PENDING | design applicato; browser reflow passa, resta QA umano device reale |
| SEO internazionale | PASS — FOUNDATION | canonical/hreflang verificati; sitemap/noindex preview predisposti |
| Sette lingue | READY — CORE 70/70 PASS | IT/EN/FR/ES/DE/AR/ZH × 10 superfici core |
| RTL arabo | PASS — CORE | superfici core senza overflow mobile |
| Profili autore | **READY — FULL E2E** | MFA AAL2, attribuzione ed evidence gate verificati; cold-start = 0 profili reali intenzionale |
| Accessibilità | AUTOMATED CORE + CONTRAST + KEYBOARD PASS / HUMAN WCAG QA PENDING | non equivale a certificazione WCAG completa |
| Correzioni/versioni | **LOCAL DB + E2E OPERATIONAL / PROD NOT ACTIVATED** | version ledger automatico privato, snapshot UI verificati; avvisi pubblici solo con correzioni reali |
| Workflow redazionale | **LOCAL/E2E OPERATIONAL / REVIEW POLICY PENDING** | assegnazione/stati/audit canonico/versioni; resta decisione 4-eyes vs stesso editor |
| Radar | **TECHNICAL PASS / REVIEW-ONLY** | nessun auto-publish; self-test scope/dedupe PASS |
| Source-health | **TECHNICAL PASS / FIRST EXTERNAL RUN PENDING** | self-test sicurezza PASS; workflow settimanale read-only |
| Controlli automatici | PASS | CI applicativo, DB/security, link integrity, performance e release gates |
| Numero zero | **5/6 EVIDENZE / STORIES BLOCKER** | requisito Storie = unico failure del browser locale completo |

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
- futura acquisizione: domande Centro Studi + eventuale video autonomo + fact-check/autorizzazioni prima della pubblicazione.

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

Il browser autenticato ha verificato l'intero ciclo con dati effimeri e cleanup finale. Il security smoke continua a restituire `anon_public_authors = 0`: il ramo **non introduce profili fittizi**.

## Versionamento e correzioni

La migration `20260822150000_prepare_content_versions_and_corrections.sql` è validata esclusivamente nel laboratorio locale e **non è applicata alla produzione**.

Nel laboratorio sono verificati:

- ledger `content_versions` privato e immutabile per gli utenti;
- baseline v1 e nuove versioni automatiche su modifiche significative;
- nessuna versione creata da tentativi di pubblicazione non autorizzati;
- snapshot storici read-only nel back-office;
- ciclo v1/v2/v3 verificato E2E;
- `content_corrections` pubblico soltanto quando esiste un vero avviso pubblico collegato a contenuto effettivamente pubblicato.

Il DOI resta un tema separato e non viene dichiarato attivo.

## Radar e source health

Radar resta rigorosamente **review-only**: `auto_publish:false`. I self-test verificano perimetro “migrazione + imprenditoria”, dedupe/canonicalizzazione e rifiuto dei contenuti generici non pertinenti.

Il source-health checker è read-only sul registro fonti e protegge redirect, DNS e indirizzi privati/reserved contro SSRF. Il self-test è PASS; il primo run schedulato/esterno reale resta un controllo operativo pre-release e non viene simulato come già avvenuto.

## Accessibilità automatizzata

Il branch protegge:

- testo piccolo/stati secondari: rapporto minimo **4.5:1** su bianco;
- focus visibile: rapporto minimo **3:1** su superficie chiara e shell navy;
- primo Tab: skip link visibile e dotato di outline;
- attivazione skip link: focus trasferito al contenuto principale;
- reduced motion e reflow sulle superfici pertinenti.

Questo riduce il rischio tecnico del #92 ma non sostituisce tastiera completa, screen reader, zoom, percezione contenuti e altri controlli umani WCAG 2.2 AA.

## Sostegno economico

La pagina `/sostieni` è pronta sul piano istituzionale, ma il checkout resta intenzionalmente spento.

Configurazione fail-closed:

- `donationsOnlineEnabled = false`;
- provider = `null`;
- payment URL = `null`;
- nessuna CTA di pagamento appare al pubblico.

Prima dell'attivazione occorrono dati amministrativi, intestazione corretta del conto, provider, formulazione fiscale e URL pubblico verificati.

## Social istituzionali

Perimetro v1 nel codice: LinkedIn, X, YouTube. I profili restano `enabled:false` finché l'account esterno non è realmente creato e l'URL finale verificato.

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

Ultima migration osservata sull'hosted production, in lettura: `20260820160000_prepare_events_external_ingestion_rls`.

La validazione locale **non equivale** ad attivazione sul database live.

## Roadmap funzionale A — stato corrente

Riferimento: `docs/roadmap/ROADMAP-110-PRIORITIES.md`.

- **READY: 31/33**
- **DA RIFINIRE: 1/33 (#92 WCAG QA umano)**
- **BLOCCANTE — CONTENUTO REALE: 1/33 (#10 Storie d'impresa)**

#30 multilingua, #36 Profili autore e #99 controlli automatici sono READY sulla base dei gate verificati sopra. Il #82 Performance della roadmap esecutiva è tecnicamente PASS nel branch.

## Blocchi reali prima della produzione

1. **Numero zero — Storie:** acquisire, approvare e pubblicare almeno una storia/intervista/testimonianza reale.
2. **Accessibilità:** completare QA umano WCAG 2.2 AA; il gate automatico non è una certificazione.
3. **Legal:** revisione finale Privacy / Cookie / Termini e dati amministrativi esposti.
4. **Security pre-release:** CSP finale e verifica configurazione production.
5. **Workflow review governance:** decidere se la review richiede un secondo redattore/4-eyes oppure se può coincidere con chi porta il contenuto a ready.
6. **Source health:** eseguire e leggere il primo run esterno/schedulato utile.
7. **Required checks:** `main` è protetto, ma required status checks risultano non attivi e richiedono una decisione di governance.
8. **Migration produzione:** rileggere lo storico hosted, backup e restore drill; applicare migration solo con autorizzazione esplicita.
9. **Production secrets/activation:** MFA Auth, backup schedulato, analytics e altre funzioni validate localmente devono essere configurate esplicitamente sul live.
10. **Netlify candidate QA:** preview del commit candidato, controllo umano desktop/tablet/mobile e smoke finale; il gate Lighthouse CI del branch è già PASS.
11. **Merge/deploy:** PR #9 resta draft; merge e go-live sono passi autorizzati separatamente.

Social e pagamenti possono rimanere disabilitati senza bloccare il sito se non vengono promessi come funzioni attive.

## Decisione attuale

- `APPLICATION_CI = PASS`
- `LIGHTHOUSE_MOBILE_3_OF_3_LCP_LT_2500 = PASS`
- `LIGHTHOUSE_CLS_3_OF_3_ZERO = PASS`
- `PUBLIC_BROWSER_E2E = PASS_5_OF_5`
- `PUBLIC_BROWSER_TOTAL = 15.3_SECONDS`
- `PUBLIC_BROWSER_RESPONSIVE = PASS`
- `PUBLIC_KEYBOARD_SKIP_FOCUS = PASS`
- `MULTILINGUAL_CORE_70_70 = PASS`
- `INTERNAL_LINK_INTEGRITY = PASS`
- `DB_LOCAL_NONPROD = PASS`
- `DB_SECURITY = PASS`
- `AUTH_MFA_RLS_LOCAL = PASS`
- `CONTENT_VERSION_LEDGER_LOCAL_E2E = PASS`
- `RADAR_REVIEW_ONLY_SELF_TEST = PASS`
- `SOURCE_HEALTH_SECURITY_SELF_TEST = PASS`
- `SOURCE_HEALTH_FIRST_EXTERNAL_RUN = PENDING`
- `SOURCES_METHODOLOGY = PASS`
- `ATLAS_ROUTES_CORE = PASS`
- `OPEN_DATA_XLSX = PASS`
- `PRIVACY_ANALYTICS_LOCAL = PASS`
- `BACKUP_ARCHIVE_LOCAL = PASS`
- `MFA_AAL2_LOCAL = PASS`
- `AUTHOR_FULL_LIFECYCLE_E2E = PASS`
- `AUTHOR_REAL_PUBLIC_PROFILES = 0_INTENTIONAL`
- `WCAG_AUTOMATED_CONTRAST = PASS`
- `WCAG_HUMAN_QA = PENDING`
- `MAIN_UNTOUCHED = PASS`
- `PRODUCTION_DB_UNTOUCHED = PASS`
- `PAID_SUPABASE_BRANCH = NOT_NEEDED_NOW`
- `GO_LIVE_A_READY = 31/33`
- `AUTHENTICATED_BROWSER = 22_PASS_1_INTENTIONAL_STORY_BLOCKER`
- `NUMBER_ZERO_STORIES = BLOCKER`
- `PRODUCTION_RELEASE = BLOCKED_BY_EXPLICIT_FINAL_GATES`

Il ramo non è bloccato da errori di compilazione, database, Auth/MFA, multilingua, link integrity, responsive, tastiera core, versionamento o performance CI. Il **solo failure automatico residuo** del laboratorio è deliberatamente editoriale: manca una storia reale. Rimangono inoltre QA umano WCAG/device e gate di governance/amministrativi/production sopra elencati.