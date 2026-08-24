# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit: 2026-08-24  
Branch: `feature/research-radar-ai-knowledge-20260822`

Questo documento registra lo stato reale del candidato dopo il rilascio database Production autorizzato. Non autorizza merge, deploy, DNS o branch-protection write.

Regola editoriale vincolante:

> **Prima il sito va online e supera il live smoke; solo dopo iniziano inviti, interviste e altri contatti esterni.**

---

## 1. Stato sintetico Go-Live A

- automazione/CI del candidato: **PASS sul precedente HEAD verde; riconciliazione corrente in CI**;
- QA umano WCAG/device: **PENDING**;
- revisione legale professionale: **PENDING**;
- Production DB release: **PASS**;
- MFA privilegiato Production: **PASS**;
- Production-source restore drill: **PASS**;
- Vercel Pro control-plane/project alignment: **PENDING**;
- required checks `main`: **PENDING / NON MODIFICATI**;
- merge/deploy Production: **NON AUTORIZZATI**.

`PRODUCTION_READINESS = NOT PASS` finché i gate esterni e applicativi rimanenti non sono chiusi.

---

## 2. Pubblicazione e integrità editoriale

### EDIT-01 — No auto-publish
**PASS / ATTIVO IN PRODUCTION DB**

Contributi pubblici, Radar, AI e automazioni non dispongono di un percorso di auto-pubblicazione. La decisione di pubblicazione resta umana e role-gated.

### EDIT-02 — Storie d'impresa
**FUNZIONE PRE-GO-LIVE READY / CONTENUTO REALE POST-GO-LIVE**

`/storie` può andare online anche a zero storie reali. Nessun outreach prima di sito online + live smoke PASS.

### EDIT-03 — Review governance
**IBRIDA — ATTIVA IN PRODUCTION DB**

- same-editor per contenuti ordinari;
- seconda approvazione distinta per contenuti sensibili/istituzionali;
- seconda approvazione per indicatori Osservatorio;
- seconda approvazione per correzioni `substantive`/`retraction`;
- self-approval negata;
- approvazioni fingerprint-bound;
- nessun bypass AI/Radar/service-role.

Migration #23–#24 applicate e postflight PASS.

### EDIT-04 — Versioning / audit
**ATTIVO IN PRODUCTION DB**

Versioning, correzioni, audit editoriale e superfici di tracciamento introdotte dal release batch sono applicate. Il comportamento live applicativo resta da verificare dopo il futuro deploy Vercel autorizzato.

---

## 3. Hosting e confine Production

### HOST-01 — Preview
**Vercel CHECKS SUCCESS / CONTROL-PLANE PENDING**

GitHub riceve check `SUCCESS` per:

- `Vercel – immigratiimprenditori`;
- `Vercel – immigratiimprenditori-preview`.

Il connettore Vercel collegato al team Pro, però, elenca attualmente solo `inquotus-next`; lookup dei due progetti Centro Studi e dei deployment ID restituiscono 404. Nessun deploy viene tentato per aggirare questa ambiguità.

`VERCEL_CONTROL_PLANE_VISIBILITY = PENDING`

### HOST-02 — Netlify
**PREVIEW STORICA ANCORA ATTIVA / NON TARGET FINALE**

Il progetto Netlify `immigratiimprenditori-preview` esiste ancora e i commit della PR generano deploy-preview automatici. Un deploy del commit `0c38d789b522f365873286d5aa43a9122dc5d422` è risultato `ready` in 47 s.

Il target finale deciso è **Vercel Pro**. Netlify non deve diventare required check né target Production. La dismissione dell'integrazione va eseguita come configurazione separata, senza confonderla con il deploy Vercel.

### HOST-03 — Vercel Production
**PENDING RILASCIO AUTORIZZATO**

Nessun Production deploy applicativo è stato eseguito in questo ciclo.

### HOST-04 — Dominio
**DNS NON MODIFICATO**

Il dominio resta chiuso fino a Production Vercel protetto + smoke PASS e successiva autorizzazione/cutover.

---

## 4. HTTP security e dipendenze

### SEC-HTTP-01 — Header baseline
**PASS CI / FINAL LIVE SMOKE PENDING**

CSP e header security sono verificati dal candidato. Il deployment Production dovrà ripetere lo smoke exact-origin.

### SEC-DEPS-01 — Dipendenze Production
**PASS NELLA CI APPLICATIVA**

`npm audit --omit=dev --audit-level=high` resta gate del workflow Editorial.

---

## 5. Autenticazione, ruoli e database

### SEC-AUTH-01 — Separazione ruoli
**PASS**

Contributor/editor/admin separation, provisioning e auto-elevazione negata sono validati nel laboratorio. Il DB Production contiene ora due amministratori applicativi attivi; uno è il nuovo account reale, l'altro resta temporaneamente account di prova finché il nuovo non viene validato nell'app Vercel reale.

### SEC-AUTH-02 — MFA privilegiati
**PASS PRODUCTION**

- fattori MFA TOTP verificati collegati ad amministratore attivo: **1**;
- account privilegiato reale configurato;
- migration AAL2 applicata.

Resta da validare il percorso login/challenge AAL2 nel vero frontend Vercel prima di rimuovere il vecchio amministratore di prova.

### SEC-RLS-01 — RLS e publication gate
**PASS PRODUCTION POST-APPLY**

Migration #1–#24 applicate con checkpoint e postflight PASS.

La successiva patch #25:

`20260824103000_harden_publication_gate_execute_privileges.sql`

ha rimosso direct EXECUTE su `public.enforce_content_human_publication_gate()` da `anon`, `authenticated` e `service_role`, mantenendo il trigger attivo. Fresh Security Advisor non segnala più quel finding.

### SEC-MIGRATION-01 — Production release ledger
**PASS / RICONCILIATO**

- migration rows: **234**;
- max version: **`20260824103000`**;
- `appliedReleaseDelta`: **25**;
- `candidateDelta`: **0**.

Il piano `supabase/CS-PRODUCTION-RELEASE.json` è stato riconciliato allo stato hosted attuale.

`PRODUCTION_MIGRATIONS_1_25 = PASS`

---

## 6. Backup / recovery

### BACKUP-01 — CI restore drill
**PASS**

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

### BACKUP-02 — Production-source restore drill
**PASS**

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`

Evidenza canonica:

`docs/operations/production-source-restore-drill-2026-08-23.md`

### BACKUP-03 — Pre-release backups reali
**PASS PER LE WRITE ESEGUITE**

Backup cifrati freschi sono stati creati prima delle fasi Production. L'ultimo pre-patch artifact è `9512852962`, con digest registrato in `docs/operations/production-security-patch-2026-08-24.md`.

I backup GitHub hanno retention finita e non costituiscono archivio permanente.

---

## 7. Security Advisor

Fresh post-patch review:

- publication-gate trigger-function direct EXECUTE warning: **CHIUSO**;
- `submit_editorial_contribution(...)` anon/authenticated SECURITY DEFINER: contratto intenzionale del form pubblico, protetto da validazione/rate-limit;
- helper ruolo/sessione e RPC self-service authenticated: contratti applicativi intenzionali;
- tabelle private con RLS e nessuna client policy: INFO, intenzionale;
- leaked password protection: disabilitata/non disponibile nella configurazione corrente, da rivalutare come hardening futuro.

Nessun nuovo advisor non classificato viene considerato automaticamente accettato.

---

## 8. Privacy e documenti legali

### LEGAL-01/02/03
**DOSSIER TECNICO PRONTO / REVISIONE PROFESSIONALE PENDING**

Handoff:

`docs/operations/legal-professional-review-handoff-2026-08-23.md`

Il gate non può essere dichiarato PASS senza sign-off professionale.

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

---

## 9. Accessibilità e responsive

### UI-A11Y-01 — Automazione
**PASS NELLA CI / HUMAN-DEVICE QA PENDING**

Automazione: reflow, focus, RTL, browser E2E e Lighthouse. Resta obbligatorio il QA umano/device previsto in:

`docs/operations/go-live-a-closure-kit-2026-08-23.md`

`HUMAN_WCAG_DEVICE_QA = PENDING`

---

## 10. Required checks `main`

**PENDING / NO WRITE**

Proposta preparata in:

`docs/operations/main-required-checks-proposal-2026-08-24.md`

Nessuna branch-protection write è autorizzata. Netlify non va reso required check del percorso finale Vercel.

---

## 11. Gate ancora aperti prima del go-live

1. CI verde sul HEAD finale riconciliato;
2. human WCAG 2.2 AA + desktop/tablet/mobile/device QA;
3. revisione legale professionale finale;
4. risoluzione Vercel project/control-plane e identificazione certa del candidato Preview/Production;
5. verifica reale login + MFA/AAL2 del nuovo amministratore sul frontend Vercel corretto;
6. decisione/attivazione required checks `main` con autorizzazione esplicita;
7. autorizzazione esplicita separata a merge/deploy Production;
8. first source-health run sul default branch;
9. protected Production smoke Vercel;
10. apertura dominio + live smoke finale.

Dopo il live smoke PASS può iniziare l'outreach editoriale reale.

`PRODUCTION_READINESS = NOT PASS`.
