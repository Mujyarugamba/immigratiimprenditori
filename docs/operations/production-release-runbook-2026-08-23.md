# Production release runbook — Centro Studi

Data di riferimento: 2026-08-24  
Stato: **DATABASE PRODUCTION ALLINEATO — GO-LIVE APPLICATIVO NON AUTORIZZATO**  
Branch sorgente: `feature/research-radar-ai-knowledge-20260822`  
Production branch corrente: `main` — non modificare prima dei gate finali e dell'autorizzazione esplicita.

Questo runbook descrive lo stato reale dopo il rilascio database autorizzato e la sequenza ancora necessaria per il go-live applicativo. Non contiene credenziali e **non autorizza merge, deploy, DNS o branch-protection write**.

## Regole inderogabili

1. Non usare `supabase db push` sull'intera directory storica `supabase/migrations` come meccanismo generico di rilascio.
2. Le quattro baseline cold-start sono esclusivamente per ricostruzione locale.
3. Le due migration repository riconciliate con versioni hosted precedenti non vanno riapplicate.
4. Ogni futura migration Production richiede fresh hosted-state read, backup cifrato e autorizzazione esplicita.
5. Merge/deploy Production richiedono autorizzazione esplicita **separata** dalle migration database.
6. Nessun contenuto viene auto-pubblicato; Radar/AI/automazioni restano review-only.
7. La governance editoriale resta **ibrida**: same-editor per contenuti ordinari; seconda approvazione distinta per contenuti sensibili/istituzionali, indicatori Osservatorio e correzioni sostanziali/retraction.
8. Le Storie reali non sono gate pre-go-live; outreach e interviste iniziano solo dopo sito online + live smoke PASS.
9. Un PASS CI non viene trasformato in PASS live senza il corrispondente controllo sul target reale.
10. Al primo errore critico live: STOP; niente rollback improvvisati o catene di write alla cieca.

## Stato hosted Production attuale

Progetto Supabase: `hvfvfatlaspcpszgizhg` (`immigratiimprenditori`).

Migration ledger verificato dopo l'ultimo apply autorizzato:

- righe: **234**;
- ultima versione: **`20260824103000_harden_publication_gate_execute_privileges`**;
- `candidateDelta` attuale: **0**;
- `appliedReleaseDelta`: **25** migration del ciclo 2026-08-23/24.

Il piano canonico `supabase/CS-PRODUCTION-RELEASE.json` distingue ora:

- `releaseBaselineHostedLatestMigration = 20260820160000`;
- `observedHostedLatestMigration = 20260824103000`;
- `appliedReleaseDelta` = batch già applicato;
- `candidateDelta = []`.

Il guard `scripts/ci/production-migration-plan-smoke.mjs` verifica questa riconciliazione e blocca drift non classificato.

## Alias repository già applicate — NON RIAPPLICARE

| File repository | Versione hosted equivalente |
| --- | --- |
| `20260820170000_editorial_foundation_v1.sql` | `20260819102530_editorial_foundation_v1` |
| `20260820171000_editorial_submission_country_labels.sql` | `20260819103031_editorial_submission_country_labels` |

## Release database autorizzato — CHIUSO

### Fase 1 — migration #1–#19

- workflow run `32699707002`: **SUCCESS**;
- applicazione esatta e ordinata #1–#19;
- checkpoint publication gate: PASS;
- rate-limit persistente: PASS;
- login/Auth/MFA database gate: PASS;
- arresto intenzionale al hold point MFA reale.

### MFA privilegiato Production

- nuovo account Auth reale collegato all'applicazione;
- amministratori applicativi attivi: **2**;
- fattori TOTP verificati collegati ad amministratore attivo: **1**;
- `PRODUCTION_PRIVILEGED_MFA = PASS`.

Non rimuovere il vecchio amministratore di prova finché il nuovo account non è stato validato anche nel flusso applicativo reale Vercel con MFA/AAL2.

### Fase 2 — migration #20–#24

- workflow run `32706028947`: **SUCCESS**;
- fresh encrypted hold-point backup: PASS;
- artifact `9512307633`;
- applicazione esatta e ordinata #20–#24: PASS;
- audit/analytics, public RLS compatibility, Futurae backfill e governance ibrida: PASS;
- postflight: PASS.

### Fase 3 — privilege hardening #25

Migrazione:

`20260824103000_harden_publication_gate_execute_privileges.sql`

Evidenza canonica:

`docs/operations/production-security-patch-2026-08-24.md`

- workflow run `32707529881`: **SUCCESS**;
- fresh encrypted pre-patch backup: PASS;
- artifact `9512852962`;
- digest `sha256:bc96aa18621f58cd397cae13dfc869cdae67924df28796445412ee6e6eee5cb6`;
- direct EXECUTE su `enforce_content_human_publication_gate()` per `anon`: **NO**;
- per `authenticated`: **NO**;
- per `service_role`: **NO**;
- trigger `contents_human_publication_gate`: **PRESENTE**;
- fresh Security Advisor: warning specifico sulla funzione publication-gate **rimosso**.

`PRODUCTION_MIGRATIONS_1_25 = PASS`  
`PRODUCTION_SECURITY_PATCH = PASS`

## Backup / restore — CHIUSO

### Drill tecnico CI

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

Comprende dump logico, restore su stack Supabase-managed fresco, reattach dell'hook applicativo Auth, RLS/security smoke, utenti Auth effimeri reali, build, HTTP smoke ed E2E autenticato.

### Drill da sorgente Production reale

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`

Evidenza:

`docs/operations/production-source-restore-drill-2026-08-23.md`

Run principali:

- Production encrypted logical backup `32669477733`: PASS;
- staging preservation backup `32669477735`: PASS;
- atomic Production → staging restore `32669477734`: PASS;
- independent read-only comparison `32669477774`, rerun job `97268700919`: PASS.

Il vecchio staging è stato preservato prima dell'overwrite. Production e staging risultavano pari sullo stato pre-release verificato. I backup GitHub hanno retention finita e non sostituiscono una strategia archivistica permanente.

## Security Advisor dopo il database release

Il finding critico aggiuntivo sulla funzione trigger-only publication gate è chiuso dalla #25.

Restano avvisi separati da non trattare automaticamente come vulnerabilità senza contesto:

- `submit_editorial_contribution(...)` eseguibile anon/authenticated: **contratto intenzionale del form pubblico**, da mantenere dietro validazione/rate-limit;
- helper ruolo/sessione e RPC self-service eseguibili da `authenticated`: **contratti applicativi intenzionali**, da mantenere con controlli interni e RLS;
- `content_translation_groups` e `request_rate_limit_buckets`: RLS attivo senza client policy, asset volutamente non pubblici; advisory INFO;
- leaked password protection: attualmente disabilitata/non disponibile nella configurazione in uso; resta voce di hardening da rivalutare con piano/configurazione Auth.

Ogni nuovo advisor WARN non già classificato richiede triage prima del go-live.

## Gate pre-go-live ancora aperti

### A. QA umano WCAG 2.2 AA / device — PENDING

Usare:

`docs/operations/go-live-a-closure-kit-2026-08-23.md`

Il gate richiede record umano compilato su candidato Vercel con almeno desktop, tablet, mobile, tastiera, screen reader, zoom/reflow, RTL e moduli/Auth.

`HUMAN_WCAG_DEVICE_QA = PENDING`

### B. Revisione legale professionale — PENDING

Usare:

`docs/operations/legal-professional-review-handoff-2026-08-23.md`

Il dossier tecnico non sostituisce il parere professionale. Privacy, Cookie, Termini, contributi, fornitori/trasferimenti, retention e IP devono avere sign-off.

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

### C. Required checks `main` — PENDING

Lo stato corrente di `main` va mantenuto invariato fino alla decisione. Nessuna branch-protection write è autorizzata in questo runbook.

Proposta minima da validare prima dell'attivazione:

- `Editorial v1 CI / verify`;
- `Supabase local migration validation / validate-local-database`;
- Vercel preview check del progetto corretto, una volta risolta la visibilità/control-plane.

Netlify non deve diventare required check del percorso finale Vercel.

### D. Vercel Pro control-plane / candidato — PENDING

Il team collegato `Inquotus' projects` risulta **Pro**.

GitHub continua a ricevere check Vercel **SUCCESS** per:

- `Vercel – immigratiimprenditori`;
- `Vercel – immigratiimprenditori-preview`.

Tuttavia il connettore Vercel corrente elenca soltanto `inquotus-next`; lookup diretti di `immigratiimprenditori`, `immigratiimprenditori-preview` e dei deployment ID esposti dai check GitHub restituiscono 404.

Classificazione: `VERCEL_CONTROL_PLANE_VISIBILITY = PENDING`.

Questo problema **non invalida i check GitHub già riusciti**, ma impedisce di considerare verificato il progetto Vercel definitivo e di fare smoke protetto/control-plane con sufficiente certezza. Nessun deploy è stato tentato per aggirarlo.

Netlify resta fuori dal target finale; la sua integrazione storica va dismessa separatamente solo quando è certo che non serva più come fallback/preview e senza confonderla con il deploy Production Vercel.

## Sequenza successiva consentita senza deploy

1. attendere CI verde sul HEAD riconciliato del candidato;
2. completare QA umano/device sul candidato Vercel identificato;
3. ottenere sign-off legale professionale;
4. risolvere la visibilità del progetto Vercel e identificare con certezza Preview/Production;
5. decidere required checks `main`;
6. validare login + MFA/AAL2 del nuovo amministratore sul vero candidato Vercel;
7. soltanto dopo questi PASS, chiedere autorizzazione separata per merge/deploy.

## Merge/deploy Production — NON AUTORIZZATO

Migration database riuscite **non autorizzano automaticamente** il rilascio applicativo.

Prima dell'eventuale autorizzazione merge/deploy devono essere noti:

- commit candidato esatto;
- CI completo verde;
- Vercel project/deployment esatto;
- QA umano/device PASS;
- legal PASS;
- required-check governance decisa;
- secrets/config Production verificati senza esposizione;
- Auth/MFA reale verificata nell'app;
- CSP/header e `NEXT_PUBLIC_SITE_URL` coerenti.

## Smoke live post-deploy — da eseguire soltanto dopo autorizzazione

Verificare almeno:

- homepage 2xx, H1 e canonical;
- robots/noindex coerenti;
- sette lingue core e RTL;
- Osservatorio/Atlante/Rotte;
- `/storie` anche a zero contenuti reali;
- `/contribuisci` con rate limiting;
- `/accedi`, contributor e redazione MFA/AAL2;
- governance 4-eyes sulle superfici sensibili;
- CSP/security headers, nessun `unsafe-eval`;
- performance/LCP live;
- log Vercel/Supabase senza errori critici;
- nessuna pubblicazione automatica.

Solo dopo il live smoke PASS possono iniziare outreach, interviste e acquisizione delle prime Storie reali.

## Strategia di errore / rollback

Non esiste un rollback automatico generico affidabile per una catena DDL/DML già applicata.

- prima scelta: STOP + diagnosi + forward-fix piccolo e revisionato quando lo stato DB è integro;
- restore: usare un backup pre-release quando lo stato è corrotto/non deterministico/non recuperabile in sicurezza;
- non improvvisare `DROP`, `TRUNCATE` o reverse migration non provate;
- non proseguire dopo un errore critico solo per verificare “se poi si sistema”.

## Stato attuale sintetico

- Production migration ledger: **234**, max `20260824103000`;
- candidate DB migration: **0**;
- Production migration #1–#25: **PASS**;
- publication-gate direct EXECUTE hardening: **PASS**;
- MFA privilegiato Production: **PASS**;
- Production-source restore drill: **PASS**;
- CI ephemeral restore: **PASS**;
- governance ibrida DB: **ATTIVA IN PRODUCTION**;
- persistent rate-limit DB: **ATTIVO IN PRODUCTION**;
- QA umano/device: **PENDING**;
- legal professionale: **PENDING**;
- Vercel control-plane alignment: **PENDING**;
- required checks `main`: **PENDING / NON MODIFICATI**;
- application Production deploy: **0 / NON AUTORIZZATO**;
- `main` modificato durante questo ciclo: **NO**.

`PRODUCTION_READINESS = NOT PASS` finché i gate pre-go-live rimanenti non sono chiusi.
