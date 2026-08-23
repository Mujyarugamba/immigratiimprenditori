# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit: 2026-08-23
Branch: `feature/research-radar-ai-knowledge-20260822`

Questo documento registra il **perimetro corrente di rilascio**. Non sostituisce i check GitHub del commit candidato e non trasforma verifiche locali o di preview in autorizzazioni Production.

Regola editoriale vincolante:

> **Prima il sito va online e supera il live smoke; solo dopo iniziano inviti, interviste e altri contatti esterni.**

Di conseguenza una storia reale **non è un blocker del primo go-live**. Il cold-start può avere zero storie reali purché `/storie`, workflow, evidence gate e pubblicazione controllata siano tecnicamente pronti.

---

## 1. Stato sintetico Go-Live A

Roadmap canonica: `docs/roadmap/ROADMAP-110-PRIORITIES.md`.

- **READY: 32/33**
- **DA RIFINIRE: 1/33** — #92 WCAG 2.2 AA human/device QA
- **blocker di contenuto reale prima del primo go-live: 0**

`PRODUCTION_READINESS = NOT PASS` finché i gate esterni e di rilascio indicati in fondo non sono chiusi.

---

## 2. Pubblicazione e integrità editoriale

### EDIT-01 — No auto-publish
**PASS SUL CANDIDATO**

Contributi pubblici, Radar e strumenti AI non dispongono di un percorso di auto-pubblicazione. La decisione di pubblicazione resta umana e role-gated.

### EDIT-02 — Storie d'impresa
**FUNZIONE PRE-GO-LIVE READY / CONTENUTO REALE POST-GO-LIVE**

Prima del go-live devono essere pronti:

- `/storie` anche in stato vuoto;
- tipi editoriali Storie/intervista/testimonianza;
- Inbox e workflow redazionale;
- evidence/fact-check gate;
- pubblicazione umana controllata.

Prima del go-live è vietato:

- inviare inviti o richieste di intervista;
- contattare imprenditori, partner o ricercatori per popolare Storie;
- simulare testimonianze;
- usare placeholder fittizi per rendere verde un gate.

Dopo sito online + live smoke PASS può iniziare l'acquisizione delle prime storie reali.

### EDIT-03 — Review governance
**DECISIONE APPROVATA / IMPLEMENTAZIONE CANDIDATA E VALIDATA NEL LABORATORIO**

Il 23/08/2026 è stato scelto il modello **ibrido**:

- contenuti ordinari: same-editor consentito, mantenendo autenticazione, ruolo redazionale, ownership editoriale e audit;
- contenuti sensibili/istituzionali: seconda approvazione obbligatoria da account redazionale distinto;
- indicatori Osservatorio: seconda approvazione obbligatoria;
- correzioni pubbliche `substantive` e `retraction`: seconda approvazione obbligatoria;
- escalation manuale possibile per contenuti ordinari;
- nessun bypass per AI, Radar, automazioni o service-role.

L'approvazione è legata al fingerprint dello stato revisionato: una modifica sostanziale rende inutilizzabile una precedente approvazione. Richiedente e approvatore non possono coincidere.

Il test con due redattori effimeri distinti è PASS dopo una forward-fix esplicita della semantica `NULL` del classificatore delle categorie. Sono provati: same-editor ordinario, blocco sensibile senza review, self-approval negata, approvazione del secondo redattore, approvazione stale negata dopo modifica, nuova review valida e cleanup effimero.

Specifica: `docs/editorial/HYBRID-REVIEW-GOVERNANCE.md`.
Migration candidate:
- `20260822213000_hybrid_editorial_review_governance.sql`;
- `20260822213100_fix_hybrid_null_category_classifier.sql`.

Questa decisione **non autorizza** l'apply Production.

### EDIT-04 — Versioning / audit
**IMPLEMENTATO E VALIDATO NEL LABORATORIO / ATTIVAZIONE PRODUCTION PENDING**

Il candidato conserva versioning editoriale, correzioni e audit. L'attivazione live resta parte del set di release autorizzato e non viene anticipata.

---

## 3. Preview e confine Production

### HOST-01 — Preview read-only
**PASS SUL CANDIDATO**

Vercel Preview e Netlify Deploy Preview sono trattati come read-only/noindex.

Il proxy blocca le mutazioni in Preview e il client service-role è fail-closed in ambiente Preview anche qualora un secret privilegiato venisse configurato per errore.

### HOST-02 — Vercel Production
**PENDING RILASCIO AUTORIZZATO**

Vercel è il percorso Production selezionato. Il primo candidato Production deve essere un vero build Production, non la promozione di un artifact Preview.

### HOST-03 — Deployment Protection
**DISPONIBILE / ATTIVAZIONE DA VERIFICARE SUL PROGETTO**

La configurazione effettiva del progetto va verificata prima del rilascio finale.

### HOST-04 — Dominio
**CUTOVER PREPARATO / DNS NON MODIFICATO**

Il dominio resta chiuso fino a deploy Production protetto + smoke PASS. Nessun record mail deve essere modificato durante il cutover web.

---

## 4. HTTP security e dipendenze

### SEC-HTTP-01 — Header baseline
**PASS CI SUL CANDIDATO / FINAL LIVE SMOKE PENDING**

HSTS, nosniff, frame denial, referrer policy, permissions policy, CSP e assenza `X-Powered-By` sono verificati dal candidato. Il deployment Production dovrà ripetere lo smoke.

### SEC-DEPS-01 — Dipendenze Production
**PASS NELLA CI APPLICATIVA**

`npm audit --omit=dev --audit-level=high` resta gate del workflow Editorial.

---

## 5. Autenticazione, ruoli e database

### SEC-AUTH-01 — Separazione ruoli
**PASS LABORATORIO / LIVE RECHECK PENDING**

Contributor, editor e amministratore sono separati; auto-elevazione negata nel laboratorio.

### SEC-AUTH-02 — MFA privilegiati
**PASS LABORATORIO / PRODUCTION ENROLLMENT PENDING**

TOTP/AAL2 è validato nel laboratorio. La lettura Production del 23/08/2026 mostra 1 assegnazione attiva `amministratore_applicativo` e 0 fattori in `auth.mfa_factors`: l'enrollment privilegiato reale resta PENDING.

### SEC-RLS-01 — RLS e publication gate
**PASS LABORATORIO SUL CANDIDATO GOVERNANCE**

Cold-start, PostgreSQL lint, publication/RLS smoke, governance ibrida con due redattori, rate-limit e go-live DB smoke sono PASS sul candidato che include la forward-fix del classificatore `NULL`. Nessuna nuova applicazione Production è implicata da questo documento.

### SEC-MIGRATION-01 — Apply Production
**NON AUTORIZZATO**

Prima dell'apply servono ancora:

1. restore drill non-Production **con dump logico proveniente dalla Production reale**;
2. fresh migration-history read;
3. controllo assenza drift;
4. autorizzazione esplicita;
5. apply ordinato del solo set candidato;
6. smoke Security/RLS/rate-limit/governance dopo apply.

La lettura hosted più recente conferma ancora cutoff `20260820160000`; il piano candidato contiene **24 migration** e nessuna è stata applicata in Production.

---

## 6. Backup / recovery

### BACKUP-01 — Percorso tecnico di restore
**CI EPHEMERAL RESTORE DRILL = PASS / PRODUCTION-SOURCE DRILL = PENDING**

Il 23/08/2026 il laboratorio CI ha completato con PASS un vero ciclo di recovery contro un secondo stack Supabase-managed fresco:

- dump logico `roles.sql` + `schema.sql` + `data.sql`;
- normalizzazione chirurgica del solo privilegio platform-managed `log_min_messages`;
- restore completo su stack fresco senza migration applicative preinstallate;
- reattach idempotente del solo hook applicativo `on_auth_user_created` su `auth.users` tramite `scripts/ci/post-restore-auth-hooks.sql`;
- verifica RLS e tabelle critiche;
- Auth integration smoke con utenti effimeri reali e provisioning `public.profiles`;
- separazione contributor/redattore e auto-elevazione negata;
- build applicativa, HTTP/security smoke e browser E2E autenticato sul database ripristinato;
- cleanup finale.

Il precedente blocker `log_min_messages` è quindi **CHIUSO** e il mancato ripristino del trigger Auth è anch'esso **CHIUSO**.

Resta distinto il gate pre-release **Production-source**: ottenere un dump logico della Production reale da una macchina amministrativa controllata e ripristinarlo su un target non-Production pulito. Le credenziali necessarie non vengono introdotte nel repository e questo passaggio non è ancora stato eseguito.

### BACKUP-02 — Backup cifrato Production
**PENDING PRE-RELEASE**

Il workflow di archivio cifrato è preparato ma richiede i secret Production previsti e un'esecuzione reale autorizzata. Il PASS del laboratorio non equivale a un backup Production eseguito.

Procedura canonica: `docs/security/BACKUP-RECOVERY.md`.

---

## 7. Privacy e documenti legali

### LEGAL-01 — Privacy
**TECNICAMENTE ALLINEATA / REVISIONE PROFESSIONALE PENDING**

La raccolta proposta distingue il trattamento necessario per ricezione/valutazione dalla possibile autorizzazione alla pubblicazione.

### LEGAL-02 — Cookie
**RUNTIME COERENTE / REVISIONE PROFESSIONALE PENDING**

Il runtime non introduce tracker o embed comportamentali senza revisione deliberata. L'analytics applicativo resta first-party, aggregato e governato da flag espliciti.

### LEGAL-03 — Termini
**TECNICAMENTE ALLINEATI / REVISIONE PROFESSIONALE PENDING**

La revisione professionale deve ancora validare formulazioni e perimetro giuridico finale.

---

## 8. Accessibilità e responsive

### UI-A11Y-01 — Automazione
**PASS NELLA CI APPLICATIVA / HUMAN-DEVICE QA PENDING**

I test coprono reflow 320/390/768, text-spacing WCAG a 320 px, target-size minimo, navigazione tastiera, error association e browser E2E. Lighthouse mobile e Public browser E2E sono PASS nel candidato funzionale. La verifica umana/device resta distinta e PENDING.

---

## 9. Gate esterni ancora aperti

Restano da chiudere prima del go-live:

1. restore drill con **dump logico Production reale → target non-Production pulito**;
2. human WCAG 2.2 AA + desktop/tablet/mobile/device QA;
3. revisione legale professionale finale;
4. enrollment/verifica MFA reale dell'account privilegiato Production;
5. fresh migration-history read immediatamente prima di un eventuale apply;
6. autorizzazione esplicita all'apply delle **24 migration candidate**;
7. smoke Production post-migration, incluso il gate 4-eyes;
8. governance required checks di `main`;
9. autorizzazione esplicita a merge/deploy Production;
10. protected Production smoke Vercel;
11. apertura dominio + live smoke finale.

La decisione sul modello editoriale ibrido e il restore drill CI effimero **non sono più hold point**.

`PRODUCTION_READINESS = NOT PASS`.
