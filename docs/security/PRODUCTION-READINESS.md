# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit corrente: 2026-08-28  
Branch: `work/pre-go-live-integration-20260826`  
PR corrente: **#13 — DRAFT**

Questo documento registra lo stato reale del candidato dopo il rilascio database Production autorizzato del 24 agosto e la successiva integrazione pre-go-live. Non autorizza merge, deploy Production, DNS o ulteriori write Production.

Regola editoriale vincolante:

> **Prima il sito va online e supera il live smoke; solo dopo iniziano inviti, interviste e altri contatti esterni.**

Una storia reale non è un blocker del primo go-live. Il cold-start può avere zero storie reali purché `/storie`, workflow, evidence gate e pubblicazione controllata siano tecnicamente pronti.

---

## 1. Stato sintetico

- candidato applicativo / CI: **PASS sul precedente HEAD tecnico verde; CI corrente in riconferma dopo reconciliation docs/release metadata**;
- Production DB release: **PASS**;
- migration Production #1–#25: **PASS**;
- MFA privilegiato Production: **PASS**;
- Production-source restore drill: **PASS**;
- governance editoriale ibrida: **ATTIVA IN PRODUCTION DB**;
- Vercel Preview/Production project alignment: **PASS**;
- doppio build Vercel branch: **CHIUSO**;
- required checks `main`: **ACTIVE**;
- QA umano WCAG/device: **PENDING**;
- revisione legale professionale: **PENDING**;
- QA visivo diretto del Preview corrente / mini-trend: **PENDING**;
- merge/deploy Production: **NON AUTORIZZATI**.

`PRODUCTION_READINESS = NOT PASS` finché i gate umani/applicativi rimanenti e le autorizzazioni finali non sono chiusi.

---

## 2. Pubblicazione e integrità editoriale

### EDIT-01 — No auto-publish
**PASS / ATTIVO IN PRODUCTION DB**

Contributi pubblici, Radar, AI e automazioni non dispongono di un percorso di auto-pubblicazione. La decisione di pubblicazione resta umana e role-gated.

### EDIT-02 — Storie d'impresa
**FUNZIONE PRE-GO-LIVE READY / CONTENUTO REALE POST-GO-LIVE**

`/storie` può andare online anche a zero storie reali. Nessun outreach prima di sito online + live smoke PASS. Placeholder, testimonianze simulate e attribuzioni inventate restano vietati.

### EDIT-03 — Review governance
**IBRIDA — ATTIVA IN PRODUCTION DB**

- same-editor per contenuti ordinari;
- seconda approvazione distinta per contenuti sensibili/istituzionali;
- seconda approvazione per indicatori Osservatorio;
- seconda approvazione per correzioni `substantive`/`retraction`;
- self-approval negata;
- approvazioni fingerprint-bound;
- nessun bypass AI/Radar/service-role.

Le migration governance e la forward-fix del classificatore `NULL` sono applicate e coperte dai test locali/CI.

### EDIT-04 — Versioning / audit
**ATTIVO IN PRODUCTION DB**

Versioning, correzioni e audit introdotti dal release batch sono applicati. Il comportamento frontend live resta da verificare dopo un futuro deploy Production autorizzato.

---

## 3. Production database e migration ledger

### SEC-MIGRATION-01 — Production release ledger
**PASS / RICONCILIATO**

Il manifest canonico `supabase/CS-PRODUCTION-RELEASE.json` è in schema v2 e registra:

- baseline hosted pre-release: `20260820160000_prepare_events_external_ingestion_rls`;
- hosted latest post-release: `20260824103000_harden_publication_gate_execute_privileges`;
- `appliedReleaseDelta`: **25 migration**;
- `candidateDelta`: **0**;
- migration rows post-apply: **234**;
- run apply fase 1: `32699707002`;
- run apply fase 2: `32706028947`;
- security patch run: `32707529881`.

`PRODUCTION_MIGRATIONS_1_25 = PASS`

Non esiste oggi un delta migration candidato secondo il manifest. Prima di qualsiasi futura write Production resta obbligatoria una nuova lettura hosted e l'autorizzazione prevista dalla release policy.

### SEC-RLS-01 — RLS e publication gate
**PASS PRODUCTION POST-APPLY**

La patch `20260824103000_harden_publication_gate_execute_privileges.sql` ha rimosso direct EXECUTE su `public.enforce_content_human_publication_gate()` da `anon`, `authenticated` e `service_role`, mantenendo il trigger di pubblicazione attivo. Il postflight Production e il Security Advisor successivo sono risultati coerenti con il contratto previsto.

---

## 4. Autenticazione e MFA

### SEC-AUTH-01 — Separazione ruoli
**PASS**

Contributor/editor/admin separation, provisioning e auto-elevazione negata sono coperti dal laboratorio e dalla CI autenticata.

### SEC-AUTH-02 — MFA privilegiati
**PASS PRODUCTION / FRONTEND REAL-ACCOUNT RECHECK PENDING**

Il rilascio Production ha registrato:

- **2 amministratori applicativi attivi**;
- **1 fattore TOTP verificato** collegato a un amministratore attivo;
- enforcement AAL2 applicato.

`PRODUCTION_PRIVILEGED_MFA = PASS`

Resta distinto il controllo applicativo sul vero frontend Vercel con il nuovo account reale prima di rimuovere eventuali credenziali/amministratori di prova conservati come safety fallback.

---

## 5. Backup / recovery

### BACKUP-01 — CI restore drill
**PASS**

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

### BACKUP-02 — Production-source restore drill
**PASS**

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`

Evidenza canonica: `docs/operations/production-source-restore-drill-2026-08-23.md`.

### BACKUP-03 — Backup delle write Production eseguite
**PASS PER IL RELEASE CHIUSO**

Le fasi Production autorizzate sono state precedute dai backup previsti; la security patch ha evidenza cifrata registrata nel dossier del 24 agosto. La retention degli artifact è finita e non sostituisce un fresh backup prima di future write Production.

---

## 6. Hosting e confine Production

### HOST-01 — Vercel Preview canonico
**PASS**

Il progetto Preview canonico è `immigratiimprenditori-preview`.

Sul progetto Production `immigratiimprenditori` è configurato un Ignored Build Step che ignora i branch Git diversi da `main`:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; else exit 1; fi
```

Il comportamento è stato verificato su più commit consecutivi:

- Production project: `Canceled by Ignored Build Step`;
- Preview project: deployment completato;
- Netlify deploy-preview: canceled.

`VERCEL_PREVIEW_DUPLICATION = CLOSED`

### HOST-02 — Vercel Production
**PENDING RILASCIO AUTORIZZATO**

Nessun Production deploy applicativo è stato eseguito in questo ciclo. `main` continua a essere il solo branch destinato a costruire sul progetto Production.

### HOST-03 — Netlify
**GIT DEPLOY PREVIEW CANCELED / NON TARGET FINALE**

Netlify non è target Production e non è required check del percorso finale.

### HOST-04 — Dominio
**DNS NON MODIFICATO**

Il dominio resta chiuso fino a deploy Production protetto + smoke PASS e successiva autorizzazione/cutover. I record mail non devono essere alterati durante il cutover web.

---

## 7. Required checks `main`

**ACTIVE**

Ruleset GitHub: `Protect main`, enforcement `active`, target default branch.

Required status checks con policy strict:

- `verify`;
- `validate-local-database`.

Il ruleset blocca anche deletion e non-fast-forward e richiede passaggio tramite pull request. Non risultano bypass actors.

Il Vercel Preview check resta controllo operativo del candidato, ma non è attualmente incluso tra i required status checks del ruleset.

---

## 8. CI, E2E, accessibilità e performance

Ultimo HEAD tecnico completamente verde prima della reconciliation docs/release metadata: `3c6b464f4666075a872bde6c0a6f07568450a1f7`.

Su quel candidato:

- Editorial CI: PASS;
- Supabase local migration validation: PASS;
- cold-start/replay, lint DB, RLS/security, governance ibrida, rate limit, audit/analytics, backup/restore, Auth integration: PASS;
- unit/integration: **120/120 PASS**;
- browser E2E quality: **9/9 PASS**;
- authenticated browser E2E: PASS;
- reflow 320/390/768: PASS;
- Lighthouse Performance: **98–99**;
- Accessibility: **100**;
- Best Practices: **100**;
- SEO: **100**;
- LCP < 2,5 s, CLS 0.

Il 404 favicon è chiuso. Il residuo image-delivery del logo è ~16 KB e non è bloccante.

### UI-A11Y-01 — Human/device QA
**PENDING**

L'automazione non sostituisce il record umano previsto in `docs/operations/go-live-a-closure-kit-2026-08-23.md`: tastiera, screen reader, zoom/reflow, RTL, moduli/Auth e verifica desktop/tablet/mobile.

---

## 9. Privacy e documenti legali

### LEGAL-01/02/03
**DOSSIER TECNICO PRONTO / REVISIONE PROFESSIONALE PENDING**

Handoff: `docs/operations/legal-professional-review-handoff-2026-08-23.md`.

Il gate richiede sign-off di un professionista competente su Privacy, Cookie, Termini, fornitori/trasferimenti, retention, IP/materiali editoriali e altri punti elencati nel dossier.

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

---

## 10. Source-health

**TECHNICAL PASS / DEFAULT-BRANCH RUN POST-MERGE PENDING**

Il checker è read-only, usa publishable key e ha SSRF/redirect/DNS guard PASS. Il workflow settimanale esiste sul branch candidato ma non ancora su `main`.

Il primo vero `workflow_dispatch`/cron sul default branch è quindi un gate **post-merge / pre-go-live**, non un blocker tecnico pre-merge.

---

## 11. Gate realmente aperti

### Prima della decisione finale di merge

1. CI verde sul HEAD finale;
2. QA visivo diretto del Preview corrente / mini-trend con dati reali;
3. human WCAG 2.2 AA + desktop/tablet/mobile/device QA;
4. revisione legale professionale finale;
5. verifica reale login + MFA/AAL2 del nuovo amministratore sul frontend Vercel corretto, se non ancora registrata da evidenza successiva;
6. autorizzazione esplicita alla decisione di merge.

### Dopo merge / prima del go-live pubblico

1. first source-health run sul default branch;
2. autorizzazione separata al deploy Production;
3. protected Production smoke Vercel;
4. eventuali live recheck DB/security previsti dal runbook;
5. apertura dominio autorizzata;
6. live smoke finale.

Dopo il live smoke PASS può iniziare l'outreach editoriale reale.

---

## 12. Safety boundary

- PR #13 resta DRAFT finché i gate pre-merge non sono chiusi;
- nessun merge automatico;
- nessuna write Production implicita;
- nessun deploy Production senza autorizzazione separata;
- nessun contenuto, autore, attribuzione o evidenza inventati per chiudere un gate.

`PRODUCTION_READINESS = NOT PASS`.