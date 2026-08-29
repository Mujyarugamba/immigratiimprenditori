# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit corrente: 2026-08-29  
Branch: `work/pre-go-live-integration-20260826`  
PR corrente: **#13 — DRAFT**

Questo documento registra lo stato reale del candidato dopo il rilascio database Production autorizzato del 24 agosto e la successiva integrazione pre-go-live. Non autorizza merge, avanzamento del branch `production`, deploy Production, DNS, backfill AI o ulteriori write Production.

Regola editoriale vincolante:

> **Prima il sito va online e supera il live smoke; solo dopo iniziano inviti, interviste e altri contatti esterni.**

Una storia reale non è un blocker del primo go-live. Il cold-start può avere zero storie reali purché `/storie`, workflow, evidence gate e pubblicazione controllata siano tecnicamente pronti.

Il Radar può continuare a inserire candidati review-only nella Inbox redazionale privata in Production (`status=new`, `auto_publish=false`): questa raccolta interna non costituisce outreach e non autorizza pubblicazione.

---

## 1. Stato sintetico

- candidato tecnico-operativo completamente verificato: `5599ddf8160fc22370fa3b784f7f7e5150ea0213`;
- `Editorial v1 CI` #1078: **SUCCESS**;
- `Supabase local migration validation` #611: **SUCCESS**;
- typecheck, suite test/guard, Next build, HTTP smoke, public browser E2E e Lighthouse: **PASS**;
- migration replay da zero, DB lint, RLS/publication, governance ibrida, rate limit, audit/analytics, backup/restore, Auth integration, build contro Supabase locale, HTTP/security smoke ed E2E autenticato: **PASS**;
- Production DB release 24 agosto: **PASS / invariato**;
- migration Production applicate: **25**;
- migration candidata non applicata: **1** (`20260829120000_create_content_ai_translations.sql`);
- MFA privilegiato Production DB/Auth: **PASS**;
- Production-source restore drill: **PASS**;
- governance editoriale ibrida: **ATTIVA IN PRODUCTION DB**;
- Vercel Preview/Production separation: **PASS**;
- required checks `main`: **ACTIVE**;
- QA visivo Preview / mini-trend: **PASS**;
- QA umano WCAG/device: **PENDING**;
- revisione legale professionale: **PENDING**;
- autorizzazione al merge: **NON CONCESSA**;
- migration AI Production: **NON AUTORIZZATA**;
- backfill AI: **NON AUTORIZZATO**;
- deploy Production: **NON AUTORIZZATO**.

La riconciliazione di questo documento è soltanto documentale e non cambia runtime, schema, dati, hosting o configurazione Vercel. Il PR HEAD effettivo e la CI più recente vanno sempre letti dalla PR #13.

`PRODUCTION_READINESS = NOT PASS` finché i gate umani e le autorizzazioni finali non sono chiusi.

---

## 2. Pubblicazione e integrità editoriale

### EDIT-01 — No auto-publish
**PASS / ATTIVO IN PRODUCTION DB**

Contributi pubblici, Radar e automazioni editoriali non dispongono di un percorso di auto-pubblicazione dell'originale editoriale. La decisione di pubblicazione del contenuto sorgente resta umana e role-gated.

Le traduzioni AI del candidato sono una trasformazione linguistica di contenuti già pubblicati: non modificano l'originale, sono etichettate come automatiche e la versione originale prevale in caso di dubbio o discrepanza.

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
- nessun bypass AI/Radar/service-role sul publication gate dell'originale.

Le migration governance e la forward-fix del classificatore `NULL` sono applicate e coperte dai test locali/CI.

### EDIT-04 — Versioning / audit
**ATTIVO IN PRODUCTION DB**

Versioning, correzioni e audit introdotti dal release batch sono applicati. Il comportamento frontend live resta da verificare dopo un futuro deploy Production autorizzato.

---

## 3. Production database e migration ledger

### SEC-MIGRATION-01 — Production release ledger
**PASS PER IL RELEASE APPLICATO / 1 DELTA CANDIDATO NON APPLICATO**

Il manifest canonico `supabase/CS-PRODUCTION-RELEASE.json` è in schema v2 e registra:

- baseline hosted pre-release: `20260820160000_prepare_events_external_ingestion_rls`;
- hosted latest osservata: `20260824103000_harden_publication_gate_execute_privileges`;
- `appliedReleaseDelta`: **25 migration**;
- `candidateDelta`: **1 migration**;
- candidato: `20260829120000_create_content_ai_translations.sql`;
- migration rows post-apply del release chiuso: **234**;
- run apply fase 1: `32699707002`;
- run apply fase 2: `32706028947`;
- security patch run: `32707529881`.

`PRODUCTION_MIGRATIONS_1_25 = PASS`

`AI_TRANSLATION_MIGRATION_PRODUCTION = PENDING / NOT AUTHORIZED`

La migration candidata è stata validata nel replay locale completo e nella CI, ma **non è stata applicata a Production**. Prima di una futura write Production restano obbligatori nuova lettura hosted, fresh backup quando previsto, verifica del delta e autorizzazione esplicita secondo la release policy. È vietato usare l'intera directory storica `supabase/migrations` come bootstrap/apply indiscriminato.

### SEC-RLS-01 — RLS e publication gate
**PASS PRODUCTION POST-APPLY**

La patch `20260824103000_harden_publication_gate_execute_privileges.sql` ha rimosso direct EXECUTE su `public.enforce_content_human_publication_gate()` da `anon`, `authenticated` e `service_role`, mantenendo il trigger di pubblicazione attivo. Il postflight Production e il Security Advisor successivo sono risultati coerenti con il contratto previsto.

### SEC-AI-TRANSLATION-01 — Cache traduzioni candidata
**LOCAL/CI PASS / PRODUCTION PENDING**

Il candidato introduce una cache separata `content_ai_translations` con RLS e vincoli di coerenza, inclusa la corrispondenza tra `source_language_id` e lingua effettiva del record sorgente. La migration è coperta dal replay da zero e dagli smoke di sicurezza locali.

---

## 4. Traduzioni AI — boundary e cost control

### AI-01 — Sorgente pubblica canonica
**PASS**

La traduzione usa una rappresentazione pubblica sanitizzata del contenuto. Le code tecniche di acquisizione `d1d_*` vengono eliminate prima di fingerprint, validazione, fallback e invio al provider AI. Il fingerprint è inoltre difensivamente insensibile alla coda tecnica.

### AI-02 — Runtime pubblico cache-only
**PASS**

Il frontend pubblico non genera traduzioni AI on-demand. Visitatori, crawler e richieste anonime possono leggere solo traduzioni già presenti in cache; una cache miss restituisce l'originale senza chiamare OpenAI.

La generazione resta consentita soltanto nei percorsi espliciti che impostano `allowGenerate: true`, come il backfill amministrativo. Il backfill resta **OFF / non autorizzato** fino al gate operativo dedicato.

### AI-03 — Chiamata OpenAI hardenizzata
**PASS TECNICO / ATTIVAZIONE PENDING**

Il candidato usa la Responses API con hardening esplicito:

- `store: false`;
- reasoning effort `none` per la traduzione;
- limite esplicito di output;
- timeout/abort con fallback sicuro all'originale;
- risposte incomplete/non completate non vengono trattate come traduzioni valide;
- la chiave API resta server-side.

`store: false` non viene equiparato a Zero Data Retention; eventuali controlli ZDR restano distinti e dipendono dalla configurazione dell'account/progetto OpenAI.

### AI-04 — Activation gate
**PENDING**

Prima di qualsiasi attivazione reale:

1. migration candidata applicata a Production solo con autorizzazione separata;
2. nuova CI/postflight sullo SHA autorizzato;
3. secret OpenAI verificato solo nello scope server-side pertinente;
4. dry-run backfill esaminato;
5. strategia di backfill approvata;
6. backfill eseguito in modo controllato;
7. cache e costi verificati;
8. soltanto dopo, eventuale decisione separata sull'abilitazione di ulteriori percorsi di generazione.

---

## 5. Autenticazione e MFA

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

La CI locale autenticata verifica challenge TOTP/AAL2 e superfici redazionali. Il controllo manuale sul vero frontend Vercel Production non è un gate pre-merge, perché la Preview è intenzionalmente read-only e blocca i POST. Va eseguito **post-merge / pre-go-live**, dopo un deploy Production separatamente autorizzato.

---

## 6. Backup / recovery

### BACKUP-01 — CI restore drill
**PASS**

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

Il run Supabase #611 ha superato anche il backup archive integrity smoke sul candidato corrente.

### BACKUP-02 — Production-source restore drill
**PASS**

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`

Evidenza canonica: `docs/operations/production-source-restore-drill-2026-08-23.md`.

### BACKUP-03 — Backup delle write Production eseguite
**PASS PER IL RELEASE CHIUSO**

Le fasi Production autorizzate sono state precedute dai backup previsti; la security patch ha evidenza cifrata registrata nel dossier del 24 agosto. La retention degli artifact storici non sostituisce un fresh backup prima di future write Production che lo richiedano.

Il workflow `production-backup.yml` è read-only rispetto al repository, main-only e produce backup logici cifrati; la CI valida struttura e integrità del processo. La disponibilità operativa dei secret va comunque confermata dal prossimo run reale/schedulato pertinente, senza dedurla dal solo codice.

---

## 7. Hosting e separazione merge/deploy

### HOST-01 — Vercel Preview canonico
**PASS**

Il progetto Preview canonico è `immigratiimprenditori-preview`.

Configurazione verificata:

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

La promozione `main` → `production` è disponibile solo tramite `promote-production.yml`, manuale/fail-closed, e richiede autorizzazione separata al deploy.

### HOST-03 — Netlify
**NON TARGET FINALE**

Netlify non è target Production e non è required check del percorso finale.

### HOST-04 — Dominio
**DNS NON MODIFICATO**

Il dominio resta chiuso fino a deploy Production + smoke PASS e successiva autorizzazione/cutover. I record mail non devono essere alterati durante il cutover web.

---

## 8. Required checks `main` e branch release

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

Il branch resta allineato al vecchio `main` finché non viene autorizzato un release promotion. Non deve essere avanzato implicitamente dal merge della PR.

---

## 9. CI, E2E, accessibilità e performance

Sul candidato tecnico-operativo `5599ddf8160fc22370fa3b784f7f7e5150ea0213`:

- `Editorial v1 CI` #1078: **SUCCESS**;
- `Supabase local migration validation` #611: **SUCCESS**;
- TypeScript typecheck: **PASS**;
- unit/integration e source/security guards: **PASS**;
- Next build: **PASS**;
- public HTTP smoke: **PASS**;
- public browser E2E: **PASS**;
- Lighthouse mobile performance gate: **PASS**;
- migration replay/cold-start: **PASS**;
- PostgreSQL lint: **PASS**;
- RLS/publication security smoke: **PASS**;
- hybrid two-editor review smoke: **PASS**;
- persistent rate-limit smoke: **PASS**;
- go-live audit/analytics smoke: **PASS**;
- backup archive integrity smoke: **PASS**;
- Auth integration con utenti effimeri: **PASS**;
- build contro Supabase locale: **PASS**;
- non-preview HTTP/security smoke: **PASS**;
- authenticated browser E2E + login throttling: **PASS**.

### UI-VISUAL-01 — QA visivo Preview
**PASS SULLE SUPERFICI GIÀ VERIFICATE**

QA registrato su viewport 1440×900, 390×844 e 320×844:

- mini-trend reale “Imprese straniere registrate”: PASS;
- `giu 2025` / `dic 2025` / fonte leggibili;
- header logo: PASS;
- footer logo `next/image`: PASS;
- favicon: PASS;
- console/network: PASS, nessun overlay Next.js o risorsa >=400.

Le modifiche successive non hanno cambiato il layout della homepage che invaliderebbe quel QA.

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

## 10. Privacy e documenti legali

### LEGAL-01/02/03
**TESTI TECNICAMENTE AGGIORNATI / REVISIONE PROFESSIONALE PENDING**

Handoff: `docs/operations/legal-professional-review-handoff-2026-08-23.md`.

Sul candidato corrente:

- analytics first-party minimizzato, `path` + `locale`, GPC/DNT e `credentials: "omit"` restano coperti dai guard;
- nessun auto-publish dei contributi;
- presa d'atto privacy obbligatoria distinta dall'autorizzazione facoltativa alla possibile pubblicazione;
- requisito 18+ dichiarato, senza fingere una verifica tecnica dell'età;
- Privacy aggiornata per dichiarare OpenAI come provider per la traduzione di contenuti editoriali già pubblicati, finalità, trasferimenti, cache e assenza di decisioni automatizzate con effetti giuridici o analogamente significativi;
- la disclosure distingue `store: false` da Zero Data Retention;
- Politica editoriale aggiornata per chiarire che le traduzioni automatiche possono essere mostrate senza preventiva revisione umana e che l'originale prevale.

Il professionista deve ancora esprimersi su basi giuridiche, cookie/banner, fornitori/trasferimenti, retention, interviste/testimonianze/media/dati di terzi, IP/licenze, responsabilità/foro, minori, DPIA/ROPA/LIA e obblighi informativi applicabili, inclusa la configurazione definitiva del trattamento con provider AI.

Prima del go-live va inoltre verificato che i recapiti pubblicati siano realmente monitorati: `direzione@pec.aipel.it`, `info@aipel.it`, `cookies@aipel.it`, `termini@aipel.it`, `redazione@immigratiimprenditori.it`.

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

---

## 11. Source-health e workflow operativi

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

## 12. Gate realmente aperti

### Prima della decisione finale di merge

Restano **tre gate**:

1. **human WCAG/device QA #92** con record reale;
2. **revisione legale professionale** e sign-off;
3. **autorizzazione esplicita separata alla decisione di merge**.

La migration AI candidata e il relativo backfill sono invece gate di **release/attivazione Production separati**: non sono autorizzati dal semplice stato verde della CI né da un futuro merge della PR.

CI finale e QA visivo automatico sono PASS; il frontend MFA reale non è pre-merge perché la Preview read-only non può validamente eseguire il flusso mutante.

### Dopo merge / prima del go-live pubblico

1. primo source-health run sul default branch;
2. decisione separata sulla migration candidata AI e relativo backup/apply/postflight, se si vuole includerla nel go-live;
3. eventuale dry-run/backfill AI controllato, se autorizzato;
4. autorizzazione separata al deploy Production;
5. promozione manuale `main` → `production` dello SHA approvato;
6. attesa deployment Vercel Production associato al branch `production`;
7. remote Production smoke GET-only;
8. login/challenge TOTP e verifica MFA/AAL2 sul vero frontend Production;
9. performance/security smoke sul target Production reale;
10. eventuale cutover DNS soltanto dopo PASS e specifica autorizzazione, senza alterare i record mail;
11. live smoke sul dominio reale.

Solo dopo sito online + live smoke PASS può iniziare l'outreach editoriale reale.

---

## 13. Safety boundary

- PR #13 resta DRAFT finché i gate pre-merge non sono chiusi;
- nessun auto-merge;
- metodo previsto dopo autorizzazione: **merge commit**, per preservare la storia/evidenze;
- merge su `main` non deve equivalere a deploy Production;
- nessun avanzamento di `production` senza autorizzazione separata al deploy;
- nessuna migration candidata Production senza autorizzazione separata;
- nessun backfill AI senza autorizzazione separata;
- nessun force-push;
- nessuna write Production implicita;
- Radar review-only nella Inbox privata resta consentito;
- nessun contenuto, autore, attribuzione o evidenza inventati per chiudere un gate;
- nessun outreach prima di sito online + live smoke PASS.

`PRODUCTION_READINESS = NOT PASS`.
