# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit corrente: 2026-08-28  
Branch: `work/pre-go-live-integration-20260826`  
PR corrente: **#13 — DRAFT**

Questo documento registra lo stato reale del candidato dopo il rilascio database Production autorizzato del 24 agosto e la successiva integrazione pre-go-live. Non autorizza merge, avanzamento del branch `production`, deploy Production, DNS o ulteriori write Production.

Regola editoriale vincolante:

> **Prima il sito va online e supera il live smoke; solo dopo iniziano inviti, interviste e altri contatti esterni.**

Una storia reale non è un blocker del primo go-live. Il cold-start può avere zero storie reali purché `/storie`, workflow, evidence gate e pubblicazione controllata siano tecnicamente pronti.

Il Radar può continuare a inserire candidati review-only nella Inbox redazionale privata in Production (`status=new`, `auto_publish=false`): questa raccolta interna non costituisce outreach e non autorizza pubblicazione.

---

## 1. Stato sintetico

- candidato applicativo / CI: **PASS**;
- ultimo candidato tecnico-operativo completamente verificato prima di questa sola riconciliazione documentale: `51f6b8016a791c08d064a29bee1b18ff78824caf`;
- `Editorial v1 CI` #1059: **SUCCESS**;
- `Supabase local migration validation` #592: **SUCCESS**;
- Production DB release: **PASS**;
- migration Production #1–#25: **PASS**;
- MFA privilegiato Production DB/Auth: **PASS**;
- Production-source restore drill: **PASS**;
- governance editoriale ibrida: **ATTIVA IN PRODUCTION DB**;
- Vercel Preview/Production separation: **PASS**;
- required checks `main`: **ACTIVE**;
- QA visivo Preview / mini-trend: **PASS**;
- QA umano WCAG/device: **PENDING**;
- revisione legale professionale: **PENDING**;
- autorizzazione al merge: **NON CONCESSA**;
- deploy Production: **NON AUTORIZZATO**.

Questa riconciliazione modifica soltanto documentazione e non cambia runtime, schema, dati, hosting o configurazione Vercel. Il PR HEAD effettivo e la CI più recente vanno sempre letti dalla PR #13.

`PRODUCTION_READINESS = NOT PASS` finché i gate umani e le autorizzazioni finali non sono chiusi.

---

## 2. Pubblicazione e integrità editoriale

### EDIT-01 — No auto-publish
**PASS / ATTIVO IN PRODUCTION DB**

Contributi pubblici, Radar, AI e automazioni non dispongono di un percorso di auto-pubblicazione. La decisione di pubblicazione resta umana e role-gated.

I Radar attivi raccolgono soltanto metadati/link da fonti approvate, deduplicano i candidati e inseriscono esclusivamente record `status=new` nella Inbox privata con `auto_publish=false`. Non contengono email, webhook o altri percorsi automatici di contatto esterno.

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

Non esiste oggi un delta migration candidato secondo il manifest. Prima di qualsiasi futura write Production resta obbligatoria una nuova lettura hosted, fresh backup quando previsto e l'autorizzazione della release policy. È vietato usare l'intera directory storica `supabase/migrations` come bootstrap/apply indiscriminato.

### SEC-RLS-01 — RLS e publication gate
**PASS PRODUCTION POST-APPLY**

La patch `20260824103000_harden_publication_gate_execute_privileges.sql` ha rimosso direct EXECUTE su `public.enforce_content_human_publication_gate()` da `anon`, `authenticated` e `service_role`, mantenendo il trigger di pubblicazione attivo. Il postflight Production e il Security Advisor successivo sono risultati coerenti con il contratto previsto.

---

## 4. Autenticazione e MFA

### SEC-AUTH-01 — Separazione ruoli
**PASS**

Contributor/editor/admin separation, provisioning e auto-elevazione negata sono coperti dal laboratorio e dalla CI autenticata.

### SEC-AUTH-02 — MFA privilegiati
**PASS PRODUCTION DB/AUTH / FRONTEND REAL-ACCOUNT RECHECK POST-DEPLOY**

Il rilascio Production ha registrato:

- **2 amministratori applicativi attivi**;
- **1 fattore TOTP verificato** collegato a un amministratore attivo;
- enforcement AAL2 applicato.

`PRODUCTION_PRIVILEGED_MFA = PASS`

La CI locale autenticata verifica inoltre challenge TOTP/AAL2 e superfici redazionali. Il controllo manuale sul vero frontend Vercel Production non è un gate pre-merge, perché la Preview è intenzionalmente read-only e blocca i POST. Va eseguito **post-merge / pre-go-live**, dopo un deploy Production separatamente autorizzato.

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

Le fasi Production autorizzate sono state precedute dai backup previsti; la security patch ha evidenza cifrata registrata nel dossier del 24 agosto. La retention degli artifact storici non sostituisce un fresh backup prima di future write Production che lo richiedano.

Il workflow `production-backup.yml` è read-only rispetto al repository, main-only e produce backup logici cifrati; la CI valida struttura e integrità del processo. La disponibilità operativa dei secret va comunque confermata dal prossimo run reale/schedulato pertinente, senza dedurla dal solo codice.

---

## 6. Hosting e separazione merge/deploy

### HOST-01 — Vercel Preview canonico
**PASS**

Il progetto Preview canonico è `immigratiimprenditori-preview`.

Configurazione verificata via dashboard/Cursor:

- Production Branch del progetto Preview: **`main`**;
- Ignored Build Step del progetto Preview:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" = "production" ]; then exit 0; else exit 1; fi
```

Il progetto Preview quindi salta soltanto il branch Git `production` e costruisce `main` + branch di lavoro. `NEXT_PUBLIC_PREVIEW_READ_ONLY=true` è confermato nello scope Production del progetto Preview.

### HOST-02 — Vercel Production
**SEPARAZIONE PASS / RILASCIO NON AUTORIZZATO**

Il progetto Production `immigratiimprenditori` usa:

- Production Branch: **`production`**;
- Ignored Build Step:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "production" ]; then exit 0; else exit 1; fi
```

Quindi:

- merge/push su `main` **non** genera Production;
- branch normali/PR **non** generano Production sul progetto Production;
- solo l'avanzamento esplicito del branch Git `production` può generare il deploy applicativo Production.

Sul candidato verificato:

- progetto Production: **Canceled by Ignored Build Step**;
- progetto Preview: **Deployment has completed**;
- Netlify deploy-preview: **canceled**.

La promozione `main` → `production` è disponibile solo tramite `promote-production.yml`, manuale/fail-closed, e richiede autorizzazione separata al deploy.

### HOST-03 — Netlify
**GIT DEPLOY PREVIEW CANCELED / NON TARGET FINALE**

Netlify non è target Production e non è required check del percorso finale.

### HOST-04 — Dominio
**DNS NON MODIFICATO**

Il dominio resta chiuso fino a deploy Production + smoke PASS e successiva autorizzazione/cutover. I record mail non devono essere alterati durante il cutover web.

---

## 7. Required checks `main` e branch release

### `main`
**ACTIVE**

Ruleset GitHub `Protect main`, enforcement `active`, target default branch:

- deletion bloccata;
- non-fast-forward bloccato;
- pull request richiesto;
- required status checks strict:
  - `verify`;
  - `validate-local-database`;
- nessun bypass actor.

### `production`
**HARDENING NON BLOCCANTE**

Il branch esiste e resta allineato al vecchio `main` finché non viene autorizzato un release promotion. Non è ancora protetto da una ruleset dedicata. È raccomandato bloccare deletion e non-fast-forward senza imporre PR/required checks che impedirebbero il fast-forward deliberato del workflow di promozione.

---

## 8. CI, E2E, accessibilità e performance

Sul candidato tecnico-operativo `51f6b8016a791c08d064a29bee1b18ff78824caf`:

- `Editorial v1 CI` #1059: **SUCCESS**;
- `Supabase local migration validation` #592: **SUCCESS**;
- unit/integration: **124/124 PASS**;
- public browser E2E: **12/12 PASS**;
- authenticated browser E2E: **PASS**;
- cold-start/replay, lint DB, RLS/security, governance ibrida, rate limit, audit/analytics, backup archive, Auth integration: **PASS**;
- reflow automatico 320/390/768: **PASS**;
- tastiera su header/cerca/accedi/contribuisci: **PASS automatico**;
- RTL arabo strutturale e assenza overflow 320 px: **PASS automatico**;
- WCAG text-spacing, target size, error association: **PASS automatico**.

Lighthouse #1059, tre run mobile:

- Performance: **99 / 98 / 99**;
- Accessibility: **100 / 100 / 100**;
- Best Practices: **100 / 100 / 100**;
- SEO: **69 / 69 / 69**;
- LCP: **2.189 / 2.288 / 2.119 s**;
- TBT: **46.5 / 22.5 / 32 ms**;
- CLS: **0 / 0 / 0**.

Il punteggio SEO 69 della CI Preview è atteso: l'unico audit SEO fallito è `is-crawlable`, perché la modalità Preview applica intenzionalmente `X-Robots-Tag: noindex, nofollow, noarchive` e `robots.txt` globale bloccante. Questo non è una regressione SEO Production. Il remote Production smoke verifica invece robots crawlable, sitemap canonica e `/app/` disallow.

### UI-VISUAL-01 — QA visivo Preview
**PASS**

QA già registrato sul runtime applicativo trasferibile, viewport 1440×900, 390×844 e 320×844:

- mini-trend reale “Imprese straniere registrate”: PASS;
- `giu 2025` / `dic 2025` / fonte leggibili;
- header logo: PASS;
- footer logo `next/image`: PASS;
- favicon: PASS;
- console/network: PASS, nessun overlay Next.js o risorsa >=400.

Le modifiche successive sono state boundary deployment, CI/test e documentazione/release metadata, senza modifica del layout della homepage che invalidi questo QA.

### UI-A11Y-01 — Human/device QA
**PENDING**

Record operativo: `docs/operations/HUMAN-WCAG-QA-RECORD-2026-08-28.md`.

Il residuo umano è ristretto a:

- screen reader reale;
- zoom browser reale 200% / 400%;
- dispositivi fisici iOS/Safari e Android/Chrome;
- valutazione qualitativa finale di focus, ordine di lettura, RTL e moduli.

L'automazione non viene equiparata a certificazione WCAG.

---

## 9. Privacy e documenti legali

### LEGAL-01/02/03
**DOSSIER TECNICO PRONTO / REVISIONE PROFESSIONALE PENDING**

Handoff: `docs/operations/legal-professional-review-handoff-2026-08-23.md`.

Audit tecnico-fattuale sul candidato corrente:

- analytics first-party minimizzato, `path` + `locale`, GPC/DNT e `credentials: "omit"` verificati;
- nessun auto-publish dei contributi;
- presa d'atto privacy obbligatoria distinta dall'autorizzazione facoltativa alla possibile pubblicazione;
- il Server Action invoca soltanto il percorso di submission editoriale;
- requisito 18+ dichiarato, senza fingere una verifica tecnica dell'età.

Il professionista deve ancora esprimersi su basi giuridiche, cookie/banner, fornitori/trasferimenti, retention, interviste/testimonianze/media/dati di terzi, IP/licenze, responsabilità/foro, minori, DPIA/ROPA/LIA e obblighi informativi applicabili.

Prima del go-live va inoltre verificato che i recapiti pubblicati siano realmente monitorati: `direzione@pec.aipel.it`, `info@aipel.it`, `cookies@aipel.it`, `termini@aipel.it`, `redazione@immigratiimprenditori.it`.

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

---

## 10. Source-health e workflow operativi

### Source-health
**TECHNICAL PASS / DEFAULT-BRANCH RUN POST-MERGE PENDING**

Il checker è read-only, usa publishable key e ha least-privilege/SSRF/redirect/DNS guard coperti dalla CI. Il workflow settimanale esiste sul branch candidato ma non ancora su `main`.

Il primo vero `workflow_dispatch`/cron sul default branch è quindi un gate **post-merge / pre-go-live**, non un blocker tecnico pre-merge.

### Promotion Production
**READY / NON AUTORIZZATA**

`promote-production.yml`:

- solo `workflow_dispatch`;
- eseguibile solo da ref `main`;
- richiede SHA completo approvato + conferma `DEPLOY_PRODUCTION`;
- verifica che `GITHUB_SHA` sia ancora il `main` corrente;
- richiede `production` antenato di `main`;
- fast-forward soltanto, mai force;
- verifica il ref dopo il push.

### Remote Production smoke
**READY / POST-DEPLOY**

`production-remote-smoke.yml`:

- solo manuale;
- `contents: read`;
- richiede SHA approvato + `SMOKE_PRODUCTION`;
- richiede `production == approved main`;
- checker GET-only e service-role-free;
- target HTTPS allowlisted;
- redirect HTTP non seguiti automaticamente;
- verifica superfici pubbliche, Open Data, security headers, robots e protezione `/app/redazione`;
- conserva artifact anche in caso di FAIL.

---

## 11. Gate realmente aperti

### Prima della decisione finale di merge

Restano **tre soli gate**:

1. **human WCAG/device QA #92** con record reale;
2. **revisione legale professionale** e sign-off;
3. **autorizzazione esplicita separata alla decisione di merge**.

CI finale e QA visivo sono già PASS; il frontend MFA reale non è pre-merge perché la Preview read-only non può validamente eseguire il flusso mutante.

### Dopo merge / prima del go-live pubblico

1. first source-health run sul default branch;
2. autorizzazione separata al deploy Production;
3. promozione manuale `main` → `production` dello SHA approvato;
4. attesa deployment Vercel Production associato al branch `production`;
5. remote Production smoke GET-only;
6. login/challenge TOTP e verifica MFA/AAL2 sul vero frontend Production;
7. performance/security smoke sul target Production reale;
8. eventuale cutover DNS soltanto dopo PASS e specifica autorizzazione, senza alterare i record mail;
9. live smoke sul dominio reale.

Solo dopo sito online + live smoke PASS può iniziare l'outreach editoriale reale.

---

## 12. Safety boundary

- PR #13 resta DRAFT finché i gate pre-merge non sono chiusi;
- nessun auto-merge;
- metodo previsto dopo autorizzazione: **merge commit**, per preservare la storia/evidenze;
- merge su `main` non deve equivalere a deploy Production;
- nessun avanzamento di `production` senza autorizzazione separata al deploy;
- nessun force-push;
- nessuna write Production implicita;
- Radar review-only nella Inbox privata resta consentito;
- nessun contenuto, autore, attribuzione o evidenza inventati per chiudere un gate;
- nessun outreach prima di sito online + live smoke PASS.

`PRODUCTION_READINESS = NOT PASS`.