# Production readiness — 22 agosto 2026

Branch di verifica: `feature/research-radar-ai-knowledge-20260822`
Base di sviluppo: `feature/institutional-identity` (`b0810a3f614912ecf53eeee4c356a8177a45d185`)
Production branch: `main` — non modificato in questo ciclo.

## Regola di rilascio

Questo documento distingue **branch-ready**, **validato localmente** e **attivo in produzione**. Una funzione può essere completa e verificata nel branch senza essere ancora autorizzata alla produzione.

In questo ciclo:

- nessuna migration è stata applicata al database di produzione;
- nessun deploy di produzione è stato eseguito;
- Netlify è il solo ambiente di preview;
- nessun branch Supabase hosted a pagamento è stato creato.

## Gate tecnici verificati

| Gate | Stato | Evidenza / nota |
| --- | --- | --- |
| TypeScript | PASS | GitHub Actions `Editorial v1 CI` |
| Unit / contract tests | PASS | GitHub Actions `Editorial v1 CI` |
| Next.js build | PASS | GitHub Actions `Editorial v1 CI` |
| HTTP smoke | PASS | build avviata e route critiche verificate |
| Netlify Deploy Preview | PASS | Deploy Preview PR #9, nessun production publish |
| Security response headers | PASS | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Preview anti-indexing | PASS | robots fail-closed nei contesti Netlify non-production |
| Redazione server-side auth gate | PASS | sessione attiva + ruolo editor/admin richiesti |
| Public submissions | PASS / REVIEW-ONLY | RPC crea Inbox privata, non contenuto pubblico |
| Radar | PASS / REVIEW-ONLY | `auto_publish=false`; alimenta solo Inbox |
| Editorial AI | BRANCH_READY / DB_NOT_ACTIVATED_PROD | architettura privata; nessun output macchina auto-pubblicato |
| Public publication read path | PASS | frontend pubblico espone solo `ready + published + public` |
| Publication gate DB | LOCAL PASS / PROD NOT ACTIVATED | migration inclusa nel cold-start locale; security smoke PASS |
| Dependency install/audit | PASS | CI applicativa verde |

## Ambiente database non-production gratuito

Stato: **PASS**.

La precedente assenza di un branch Supabase hosted non è più un blocco per la validazione di sviluppo. È operativo un laboratorio effimero GitHub Actions + Supabase CLI/Docker che ricostruisce il database standalone Centro Studi da zero.

Catena validata:

1. baseline SPLIT-3 `supabase/baseline/00..03`;
2. fondazione editoriale standalone;
3. evoluzioni post-cutover necessarie;
4. migration Centro Studi correnti del branch.

Controlli eseguiti con successo:

- cold start completo da database vuoto;
- `supabase db lint --level error --fail-on error`;
- publication-gate security smoke;
- RLS/permessi Inbox smoke;
- teardown dello stack locale senza backup.

Gate:

- `DB_LOCAL_NONPROD = PASS`
- `LOCAL_DB_COLD_START = PASS`
- `LOCAL_DB_LINT = PASS`
- `LOCAL_DB_SECURITY = PASS`
- `HOSTED_SUPABASE_BRANCH = NOT_NEEDED_NOW`

Un branch hosted potrà essere rivalutato soltanto nell'ultimo pre-rilascio se servirà un controllo di parità dell'infrastruttura Supabase ospitata. Non è necessario per continuare lo sviluppo corrente.

## Gate editoriali e di autorevolezza

| Gate | Stato | Nota |
| --- | --- | --- |
| Fonti e metodologia | PASS | registro fonte → dati usati → copertura → periodicità → qualità → metodo/limiti |
| Advanced Search | BRANCH_READY | full-text preparato con fallback pubblico sicuro |
| Knowledge Graph relazionale | BRANCH_READY | relazioni da dati pubblicati/verificati; nessuna relazione AI pubblica |
| Home editoriale v1 | PASS | dato + studio/rapporto + storia/intervista + evento + recenti + contributi |
| Identità visiva | PASS / FINAL DEVICE QA PENDING | design system B/W istituzionale canonico e applicato; resta QA umano finale desktop/mobile prima del rilascio |
| SEO internazionale | PASS — FOUNDATION | canonical, hreflang 7 lingue + x-default, sitemap evidence-gated, preview noindex |
| Privacy / cookie | PASS per funzioni attuali | nessun analytics/advertising attivo rilevante al ciclo; contributi descritti |
| Correzioni/versioni | PREPARED / PROD NOT ACTIVATED | schema predisposto; pagina pubblica solo con record reali |
| Numero zero | 5/6 EVIDENZE / STORIES INTENTIONALLY DEFERRED | short list pronta, nessun contatto finché non viene deciso prima del lancio |

## Voci candidate e outreach

La short list interviste è disponibile nel back-office come **Voci candidate**.

Regola corrente:

- nessun contatto;
- nessun invito inviato;
- nessuna intervista richiesta;
- modalità futura preferita: domande inviate dal Centro Studi + video registrato autonomamente dall'intervistato + fact-check/autorizzazioni prima della pubblicazione.

Gate:

- `INTERVIEW_SHORTLIST = READY`
- `OUTREACH_SENT = 0`
- `SELF_RECORDED_VIDEO_WORKFLOW = READY`

Le storie del Numero Zero restano quindi intenzionalmente non chiuse fino alla decisione pre-lancio dell'utente.

## Sostegno economico

La pagina `/sostieni` è pronta sul piano istituzionale, ma il checkout è intenzionalmente spento.

Configurazione corrente fail-closed:

- `donationsOnlineEnabled = false`;
- provider = `null`;
- payment URL = `null`;
- nessuna CTA di pagamento appare al pubblico.

Prima dell'attivazione occorrono dati amministrativi, intestazione corretta del conto, provider, formulazione fiscale e URL pubblico verificati.

Gate:

- `SUPPORT_PAGE = PASS`
- `ONLINE_DONATIONS = INTENTIONALLY_DISABLED`

## Social istituzionali

Perimetro v1 nel codice:

- LinkedIn;
- X;
- YouTube.

Tutti i profili sono `enabled:false` finché l'account esterno non è realmente creato e l'URL finale non è verificato. In questo modo `sameAs` e link pubblici non espongono profili soltanto pianificati.

Bluesky non fa parte del perimetro operativo v1.

## Migration preparate e NON attivate in produzione

Tra le architetture preparate sul ramo di sviluppo rientrano almeno:

- `20260822120000_prepare_content_translation_groups.sql`
- `20260822150000_prepare_content_versions_and_corrections.sql`
- `20260822151000_prepare_author_profiles.sql`
- `20260822155000_knowledge_search_architecture.sql`
- `20260822161000_editorial_automation_architecture.sql`
- `20260822172000_harden_content_publication_gate.sql`

Queste migration hanno superato il cold-start locale della catena standalone, ma la loro presenza/validazione locale **non equivale** ad attivazione sul database live.

## Blocchi reali prima della produzione

1. **Dati istituzionali AIPEL:** verificare e completare i dati amministrativi che si intendono pubblicare.
2. **Social esterni:** creare/verificare realmente LinkedIn, X e YouTube prima di abilitarli nel sito/structured data.
3. **Numero zero — storie:** decidere quali candidati contattare e realizzare/approvare le storie solo quando l'utente autorizzerà l'outreach pre-lancio.
4. **Sostegno economico:** configurare provider e intestazione corretta soltanto quando i dati amministrativi saranno pronti; non è un blocco per lo sviluppo del sito.
5. **Migration produzione:** definire l'ordine di applicazione e il rollback; applicare solo con autorizzazione esplicita dopo il candidato di rilascio.
6. **Visual/device QA finale:** verifica umana del Deploy Preview su desktop/tablet/mobile.
7. **Quality/security finale:** chiudere rate limiting, leaked-password protection/MFA ove applicabili, accessibilità, performance e test E2E.
8. **Branch protection e release gate:** proteggere il flusso di merge prima di promuovere la PR.
9. **Pre-release finale:** CI + DB validation + HTTP smoke + Netlify QA sul commit esatto candidato al rilascio.

## Decisione attuale

- `BRANCH_TECHNICAL_READINESS = PASS`
- `DB_LOCAL_NONPROD = PASS`
- `SOURCES_METHODOLOGY = PASS`
- `VISUAL_IDENTITY = PASS`
- `HOME_V1 = PASS`
- `SEO_FOUNDATION = PASS`
- `MAIN_UNTOUCHED = PASS`
- `PRODUCTION_DB_UNTOUCHED = PASS`
- `NETLIFY_PREVIEW_ONLY = PASS`
- `PAID_SUPABASE_BRANCH = NOT_NEEDED_NOW`
- `NUMBER_ZERO_STORIES = INTENTIONALLY_DEFERRED`
- `PRODUCTION_RELEASE = BLOCKED_BY_EXPLICIT_FINAL_GATES`

Il rilascio non è bloccato da errori di compilazione o dal bisogno di acquistare un branch Supabase. I blocchi residui sono deliberati: attivazioni production, dati amministrativi/esterni, storie reali, QA finale e hardening pre-release.
