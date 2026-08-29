# Production release runbook — Centro Studi

Data di riferimento corrente: 2026-08-28  
Stato: **DATABASE PRODUCTION ALLINEATO — GO-LIVE APPLICATIVO NON AUTORIZZATO**  
Branch sorgente corrente: `work/pre-go-live-integration-20260826`  
PR corrente: **#13 — DRAFT**  
Production branch: `main`

Questo runbook descrive lo stato reale dopo il rilascio database Production autorizzato del 24 agosto e la successiva integrazione pre-go-live. Non contiene credenziali e **non autorizza merge, deploy Production, DNS o ulteriori write Production**.

## Regole inderogabili

1. Non usare `supabase db push` sull'intera directory storica `supabase/migrations` come meccanismo generico di rilascio.
2. Le quattro baseline cold-start sono esclusivamente per ricostruzione locale.
3. Le due migration repository riconciliate con versioni hosted precedenti non vanno riapplicate.
4. Ogni futura migration/write Production richiede fresh hosted-state read, backup cifrato pertinente e autorizzazione esplicita.
5. Merge e deploy Production richiedono autorizzazioni esplicite separate dalle precedenti write database.
6. Nessun contenuto viene auto-pubblicato; Radar/AI/automazioni restano review-only.
7. La governance editoriale è **ibrida**: same-editor per contenuti ordinari; seconda approvazione distinta per contenuti sensibili/istituzionali, indicatori Osservatorio e correzioni sostanziali/retraction.
8. Le Storie reali non sono gate pre-go-live; outreach e interviste iniziano solo dopo sito online + live smoke PASS.
9. Un PASS CI non viene trasformato in PASS live senza il corrispondente controllo sul target reale.
10. Al primo errore critico live: STOP; niente rollback improvvisati o catene di write alla cieca.

## Stato hosted Production attuale

Progetto Supabase: `hvfvfatlaspcpszgizhg` (`immigratiimprenditori`).

Il manifest canonico `supabase/CS-PRODUCTION-RELEASE.json` registra:

- schema manifest: **v2**;
- release baseline hosted: `20260820160000_prepare_events_external_ingestion_rls`;
- hosted latest post-release: `20260824103000_harden_publication_gate_execute_privileges`;
- migration rows post-apply: **234**;
- `appliedReleaseDelta`: **25**;
- `candidateDelta`: **0**.

Quindi **non esiste oggi una catena di 24 migration ancora da applicare**. Quella era la fotografia pre-release del 23 agosto ed è storica.

Le due alias repository già applicate restano NON RIAPPLICABILI:

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

Resta distinto il recheck applicativo login/challenge AAL2 sul vero frontend Vercel prima di rimuovere eventuali amministratori/credenziali di prova conservati come safety fallback.

### Fase 2 — migration #20–#24

- workflow run `32706028947`: **SUCCESS**;
- fresh encrypted hold-point backup: PASS;
- artifact `9512307633`;
- applicazione #20–#24: PASS;
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
- fresh Security Advisor: warning specifico publication-gate **CHIUSO**.

`PRODUCTION_MIGRATIONS_1_25 = PASS`  
`PRODUCTION_SECURITY_PATCH = PASS`

## Backup / restore — CHIUSO

### Drill tecnico CI

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

### Drill da sorgente Production reale

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`

Evidenza: `docs/operations/production-source-restore-drill-2026-08-23.md`.

Run principali:

- Production encrypted logical backup `32669477733`: PASS;
- staging preservation backup `32669477735`: PASS;
- atomic Production → staging restore `32669477734`: PASS;
- independent read-only comparison `32669477774`, rerun job `97268700919`: PASS.

I backup GitHub hanno retention finita e non sostituiscono un fresh backup prima di future write Production.

## Governance editoriale — ATTIVA IN PRODUCTION DB

- stesso editor consentito per contenuti ordinari;
- seconda approvazione distinta per contenuti sensibili/istituzionali;
- seconda approvazione distinta per indicatori Osservatorio;
- seconda approvazione distinta per correzioni `substantive`/`retraction`;
- requester self-approval negata;
- approvazioni fingerprint-bound;
- nessun bypass AI/Radar/service-role.

La decisione 4-eyes vs same-editor **non è più un gate aperto**.

## Hosting / Vercel — allineamento Preview CHIUSO

Target finale: **Vercel Pro**.

Progetti:

- Production: `immigratiimprenditori`;
- Preview: `immigratiimprenditori-preview`.

Sul solo progetto Production è configurato l'Ignored Build Step:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; else exit 1; fi
```

Verificato su commit consecutivi:

- branch non-`main` sul Production project: **Canceled by Ignored Build Step**;
- stesso branch sul Preview project: **deployment completato**;
- Netlify deploy-preview: **canceled**.

`VERCEL_PREVIEW_DUPLICATION = CLOSED`

Nessun deploy applicativo Production è stato eseguito. `main` resta il solo branch destinato a costruire sul progetto Production.

## Required checks `main` — ACTIVE

Ruleset GitHub: `Protect main`, enforcement `active` sul default branch.

Required status checks con strict policy:

- `verify`;
- `validate-local-database`.

Il ruleset blocca deletion e non-fast-forward, richiede passaggio tramite pull request e non espone bypass actors.

Il Vercel Preview check resta controllo operativo del candidato ma non è attualmente un required status check del ruleset.

## CI / qualità candidato

Ultimo HEAD tecnico completamente verde prima della reconciliation dei metadata/documenti release:

`3c6b464f4666075a872bde6c0a6f07568450a1f7`

Su quel candidato:

- Editorial CI: PASS;
- Supabase local migration validation: PASS;
- unit/integration: **120/120 PASS**;
- browser E2E quality: **9/9 PASS**;
- authenticated browser E2E: PASS;
- reflow 320/390/768: PASS;
- Lighthouse Performance: **98–99**;
- Accessibility: **100**;
- Best Practices: **100**;
- SEO: **100**;
- LCP < 2,5 s;
- CLS = 0.

La CI deve restare verde anche sul HEAD finale che incorpora la reconciliation release.

## Gate pre-merge ancora aperti

### A. QA visivo Preview / mini-trend — PENDING

Controllare sul Preview canonico con dati reali almeno desktop, 390 px e 320 px; verificare etichette periodo, fonte, assenza sovrapposizioni e logo/favicons/console.

### B. QA umano WCAG 2.2 AA / device — PENDING

Usare `docs/operations/go-live-a-closure-kit-2026-08-23.md`.

Serve record umano su desktop/tablet/mobile, tastiera, screen reader, zoom/reflow, RTL e moduli/Auth.

`HUMAN_WCAG_DEVICE_QA = PENDING`

### C. Revisione legale professionale — PENDING

Usare `docs/operations/legal-professional-review-handoff-2026-08-23.md`.

Privacy, Cookie, Termini, contributi, fornitori/trasferimenti, retention e IP richiedono sign-off professionale.

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

### D. Login + MFA/AAL2 nuovo amministratore nel frontend reale — PENDING FINCHÉ NON DOCUMENTATO

Il fattore Production è verificato nel DB/Auth. Resta distinto il controllo end-to-end attraverso il vero frontend Vercel prima della rimozione del safety fallback amministrativo.

## Gate post-merge / pre-go-live

### Source-health default-branch run

Il checker è technical/security PASS ed è read-only. Il workflow schedulato esiste sul branch candidato ma non ancora su `main`; il primo vero `workflow_dispatch`/cron sul default branch è quindi correttamente **post-merge / pre-go-live**, non blocker pre-merge.

### Deploy Production

Resta necessaria autorizzazione separata. Il merge non autorizza automaticamente il deploy.

Prima del deploy devono essere noti almeno:

- commit candidato esatto;
- CI completa verde;
- progetto/deployment Vercel Production esatto;
- QA umano/device PASS;
- legal PASS;
- Auth/MFA reale verificata nell'app;
- secrets/config Production verificati senza esposizione;
- CSP/header e `NEXT_PUBLIC_SITE_URL` coerenti.

## Smoke live post-deploy — solo dopo autorizzazione

Verificare almeno:

- homepage 2xx, H1 e canonical;
- robots/indexing coerenti;
- sette lingue core e RTL;
- Osservatorio/Atlante/Rotte;
- `/storie` anche a zero contenuti reali;
- `/contribuisci` e rate limiting;
- `/accedi`, contributor e redazione MFA/AAL2;
- governance 4-eyes sulle superfici sensibili;
- CSP/security headers;
- performance/LCP live;
- log Vercel/Supabase senza errori critici;
- nessuna pubblicazione automatica.

Solo dopo il live smoke PASS possono iniziare outreach, interviste e acquisizione delle prime Storie reali.

## Strategia di errore / rollback

Non esiste un rollback automatico generico affidabile per una catena DDL/DML già applicata.

- prima scelta: STOP + diagnosi + forward-fix piccolo e revisionato quando lo stato DB è integro;
- restore: usare un backup pertinente quando lo stato è corrotto/non deterministico/non recuperabile in sicurezza;
- non improvvisare `DROP`, `TRUNCATE` o reverse migration non provate;
- non proseguire dopo un errore critico solo per verificare “se poi si sistema”.

## Stato attuale sintetico

- Production migration ledger: **234**, max `20260824103000`;
- applied release migration: **25**;
- candidate DB migration: **0**;
- publication-gate direct EXECUTE hardening: **PASS**;
- MFA privilegiato Production: **PASS**;
- Production-source restore drill: **PASS**;
- CI ephemeral restore: **PASS**;
- governance ibrida DB: **ATTIVA IN PRODUCTION**;
- persistent rate-limit DB: **ATTIVO IN PRODUCTION**;
- Vercel duplicate Preview build: **CHIUSO**;
- required checks `main`: **ACTIVE**;
- QA visivo Preview: **PENDING**;
- QA umano/device: **PENDING**;
- legal professionale: **PENDING**;
- application Production deploy: **0 / NON AUTORIZZATO**;
- `main` modificato da questa reconciliation: **NO**.

`PRODUCTION_READINESS = NOT PASS` finché i gate pre-go-live rimanenti non sono chiusi.