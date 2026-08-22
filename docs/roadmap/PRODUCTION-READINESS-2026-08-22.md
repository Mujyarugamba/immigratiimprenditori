# Production readiness — 22 agosto 2026

Branch di verifica: `feature/research-radar-ai-knowledge-20260822`
Base di sviluppo: `feature/institutional-identity` (`b0810a3f614912ecf53eeee4c356a8177a45d185`)
Production branch verificato: `main` (`8b1511598dc6dc3225098aa77c38c13a35a395e9`)

## Regola di rilascio

Questo documento distingue **branch-ready** da **production-ready**. Una funzione può essere completa e verificata nel branch senza essere ancora autorizzata alla produzione. Nessuna migration preparata in questo ciclo viene applicata automaticamente al database di produzione e nessun deploy di produzione viene eseguito da questo branch.

## Gate tecnici verificati

| Gate | Stato | Evidenza / nota |
| --- | --- | --- |
| TypeScript | PASS | GitHub Actions `Editorial v1 CI` |
| Unit / contract tests | PASS | GitHub Actions `Editorial v1 CI` |
| Next.js build | PASS | GitHub Actions `Editorial v1 CI` |
| HTTP smoke su build avviata | PASS | home, trasparenza, sostegno, robots, sitemap, redirect canonici, security headers, protezione dashboard Numero zero |
| Netlify Deploy Preview | PASS | deploy-preview PR #9, nessun production publish |
| Security response headers | PASS | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Preview anti-indexing | PASS | `robots.txt` fail-closed + `X-Robots-Tag` nei contesti Netlify non-production |
| Redazione server-side auth gate | PASS | sessione attiva + ruolo editor/admin richiesti nel layout e nelle server actions |
| Public submissions | PASS / review-only | RPC crea Inbox privata, non contenuto pubblico; RLS nega accesso anonimo alle tabelle private |
| Radar | PASS / review-only | raccoglie e classifica segnali; `auto_publish=false`; alimenta solo Inbox |
| Editorial AI | BRANCH_READY / DB_NOT_ACTIVATED | architettura privata editor/admin; output macchina non pubblicabile automaticamente |
| Public publication read path | PASS | solo `ready + published + public` viene esposto dal frontend pubblico |
| Human publication gate | PREPARED / DB_NOT_ACTIVATED | nuova migration blocca pubblicazione/public/featured senza editor/admin + ownership editoriale; nessun service-role bypass |
| npm dependency audit in CI install | PASS | `npm ci` riporta 0 vulnerabilità note nel run verificato |

## Gate editoriali e di autorevolezza

| Gate | Stato | Nota |
| --- | --- | --- |
| Fonti e metodologia | BRANCH_READY | registro fonte → dati usati → copertura → periodicità → qualità → limiti |
| Advanced Search | BRANCH_READY | full-text preparato con fallback pubblico sicuro |
| Knowledge Graph relazionale | BRANCH_READY | relazioni derivate solo da dati pubblicati/verificati; nessuna relazione AI pubblica |
| Home editoriale | BRANCH_READY | dato + ricerca/rapporto + storie/interviste + evento + recenti + contributi |
| Identità visiva | TECHNICAL_PASS / VISUAL_QA_PENDING | sistema editoriale bianco/nero applicato; Netlify genera screenshot ma il render non è apribile visualmente dalla sessione corrente |
| SEO | BRANCH_READY | canonical, sitemap, Paesi/territori/rotte/settori/autori, redirect delle vecchie rotte |
| Privacy / cookie | PASS per funzioni attuali | nessun analytics/advertising rilevato; Inbox e trattamento contributi descritti |
| Correzioni/versioni | PREPARED / DB_NOT_ACTIVATED | registro pubblico resta spento finché migration e primi record non sono realmente attivi |
| Numero zero | 5/6 EVIDENZE / STORIES_BLOCKED | dati Lombardia/Italia, confronto internazionale, rapporti ed evento presenti; 0 storie/interviste pubblicate |

## Migration preparate e NON applicate in produzione

Tra le architetture preparate sul ramo di sviluppo rientrano almeno:

- `20260822150000_prepare_content_versions_and_corrections.sql`
- `20260822151000_prepare_author_profiles.sql`
- `20260822155000_knowledge_search_architecture.sql`
- `20260822161000_editorial_automation_architecture.sql`
- `20260822172000_harden_content_publication_gate.sql`

La loro presenza nel repository **non equivale** ad attivazione sul database live.

## Disponibilità ambiente DB non-production

Verifica del 22 agosto 2026 sul progetto Supabase `immigratiimprenditori`:

- branch di sviluppo Supabase esistenti: **0**;
- non è stato creato alcun nuovo branch;
- la creazione di un branch può comportare un costo e richiede verifica del prezzo + approvazione esplicita prima dell'operazione.

Di conseguenza la validazione reale delle migration e delle policy RLS preparate resta `DB_NONPROD_PENDING`; non viene sostituita da test sul database di produzione.

## Blocchi prima della produzione

1. **Validare e applicare in un ambiente DB non-production** le migration preparate, con test RLS reali per anon/authenticated/editor/admin e verifica regressioni sui dati esistenti. Attualmente non esiste un branch Supabase di sviluppo e non ne viene creato uno senza autorizzazione economica.
2. **Publication gate DB:** solo dopo il punto 1 può diventare `PASS` effettivo; finché non è applicato resta `PREPARED`.
3. **Visual QA umano** del Deploy Preview su desktop e mobile.
4. **Numero zero — storie:** realizzare, verificare e approvare almeno due interviste/storie reali. Le 5 proposte in Inbox non valgono come contenuti pubblicati.
5. **Dati istituzionali AIPEL:** completare e verificare denominazione legale estesa, sede e dati amministrativi che si intendono pubblicare.
6. **Social esterni:** creare/verificare realmente LinkedIn, X e YouTube prima di attivare `sameAs` e link pubblici.
7. **Sostegno economico:** scegliere/configurare provider e intestazione corretta prima di attivare il checkout.
8. **Correzioni/versioni:** attivare il registro soltanto dopo migration DB e workflow editoriale verificato.
9. **Pre-release finale:** rieseguire CI + HTTP smoke + preview QA sul commit esatto candidato al rilascio.

## Decisione attuale

- `BRANCH_TECHNICAL_READINESS = PASS`
- `MAIN_UNTOUCHED = PASS`
- `PRODUCTION_DB_UNTOUCHED = PASS`
- `NETLIFY_PREVIEW_ONLY = PASS`
- `DB_NONPROD = NOT_AVAILABLE`
- `NUMBER_ZERO = BLOCKED_BY_STORIES`
- `PRODUCTION_RELEASE = BLOCKED_BY_EXPLICIT_GATES`

Il blocco non deriva da errori di compilazione o deploy: deriva volontariamente da migration non ancora validate/applicate, assenza di un ambiente DB di test autorizzato, storie del numero zero non ancora realizzate, QA visuale e configurazioni esterne/amministrative non ancora concluse.
