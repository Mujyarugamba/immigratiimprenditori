# Centro Studi — runbook migration Production e rollback

Stato: **RELEASE DATABASE 2026-08-23/24 ESEGUITO E RICONCILIATO**  
Data verifica hosted: **24 agosto 2026**

Questo documento disciplina il rilascio database Centro Studi sul progetto Supabase hosted `hvfvfatlaspcpszgizhg`. Il batch autorizzato è stato completato; questo file non autorizza future migration né deploy applicativi.

## 1. Fonte canonica

- bootstrap standalone: `supabase/baseline/00..03` come descritto in `CS-MIGRATION-MANIFEST.md`;
- stato machine-readable: `supabase/CS-PRODUCTION-RELEASE.json`;
- backup/recovery: `docs/security/BACKUP-RECOVERY.md`;
- governance ibrida review: `docs/editorial/HYBRID-REVIEW-GOVERNANCE.md`;
- evidenza restore Production-source: `docs/operations/production-source-restore-drill-2026-08-23.md`;
- evidenza patch finale: `docs/operations/production-security-patch-2026-08-24.md`.

`supabase/migrations/` contiene anche storico pre-SPLIT-3 e **non è una catena da inviare integralmente a Production**.

## 2. Stato hosted attuale

Migration ledger Production verificato:

- righe: **234**;
- max version: **`20260824103000`**;
- max name: `harden_publication_gate_execute_privileges`.

Il piano machine-readable distingue:

- `releaseBaselineHostedLatestMigration = 20260820160000`;
- `observedHostedLatestMigration = 20260824103000`;
- `appliedReleaseDelta`: **25** migration già applicate nel ciclo;
- `candidateDelta`: **0**.

Le due alias repository già riconciliate restano:

- `20260820170000_editorial_foundation_v1.sql` → hosted `20260819102530`;
- `20260820171000_editorial_submission_country_labels.sql` → hosted `20260819103031`.

Non riapplicarle.

## 3. Evidenza release completato

### Phase 1 — #1–#19

- workflow run `32699707002`: **SUCCESS**;
- apply esatto e ordinato;
- publication/RLS/rate-limit/Auth checkpoint: PASS;
- stop intenzionale al hold MFA reale.

### MFA Production

- nuovo account Auth reale collegato all'applicazione;
- amministratori applicativi attivi: **2**;
- fattori TOTP verificati collegati ad amministratore attivo: **1**;
- `PRODUCTION_PRIVILEGED_MFA = PASS`.

### Phase 2 — #20–#24

- workflow run `32706028947`: **SUCCESS**;
- fresh encrypted hold-point backup: PASS;
- artifact `9512307633`;
- apply esatto e ordinato: PASS;
- audit/analytics, public-RLS compatibility, Futurae e governance ibrida: PASS.

### Phase 3 — #25 privilege hardening

Migration:

`20260824103000_harden_publication_gate_execute_privileges.sql`

- workflow run `32707529881`: **SUCCESS**;
- fresh encrypted pre-patch backup: PASS;
- artifact `9512852962`;
- digest `sha256:bc96aa18621f58cd397cae13dfc869cdae67924df28796445412ee6e6eee5cb6`;
- direct EXECUTE publication-gate function: `anon=false`, `authenticated=false`, `service_role=false`;
- trigger publication gate: presente;
- Security Advisor: finding specifico rimosso.

`PRODUCTION_MIGRATIONS_1_25 = PASS`

## 4. Restore / recovery evidence

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`

Il restore Production → staging è stato eseguito atomicamente e verificato con confronto read-only indipendente prima del release batch. Nessun future apply può riutilizzare automaticamente questa evidenza al posto di un nuovo backup/fresh audit quando il rischio lo richiede.

## 5. Regola per future migration

Per qualunque nuova migration successiva a `20260824103000`:

1. aggiungere il file repository revisionato;
2. registrarlo deliberatamente in `candidateDelta`;
3. il guard `scripts/ci/production-migration-plan-smoke.mjs` deve passare;
4. il cold-start canonico deve includere esplicitamente la migration corrente applicabile;
5. rileggere lo storico hosted;
6. verificare assenza drift;
7. creare fresh backup Production cifrato con checksum;
8. ottenere autorizzazione esplicita Production;
9. applicare solo il candidato approvato, una migration alla volta;
10. eseguire postflight e Security Advisor;
11. dopo successo, spostare la migration da `candidateDelta` a `appliedReleaseDelta` e aggiornare `observedHostedLatestMigration`.

Non modificare manualmente il migration ledger per far coincidere artificialmente lo stato.

## 6. Gate CI sul piano

`scripts/ci/production-migration-plan-smoke.mjs` verifica:

- baseline hosted e observed hosted validi;
- `appliedReleaseDelta` e `candidateDelta` ordinati e senza duplicati;
- nessun file appartiene a più bucket;
- migration security/governance critiche restano tracciate;
- alias validi e non oltre lo stato hosted osservato;
- candidate future strettamente successive allo stato hosted;
- tutti i file post-baseline repository classificati;
- nessuna operazione distruttiva non revisionata nei candidate futuri.

Il workflow `supabase-local-validation.yml` ricostruisce inoltre il cold-start canonico e include esplicitamente il privilege hardening `20260824103000`, evitando che il laboratorio resti indietro rispetto allo schema hosted corrente.

## 7. Verifiche post-migration minime per future write

Dopo ogni futuro apply verificare almeno:

- schema/lint PostgreSQL;
- RLS e grants;
- publication gate;
- contributor/editor/admin separation;
- MFA/AAL2 privilegiato;
- public/login rate limit;
- audit e versioning;
- governance ibrida 4-eyes;
- indicatori/correzioni sensibili;
- query pubbliche Osservatorio/Atlante/Rotte/Contenuti;
- Security Advisor;
- migration ledger esatto.

## 8. Abort e rollback

### A. Migration fallisce durante l'esecuzione

- fermare immediatamente la catena;
- non marcare manualmente la migration come applicata;
- conservare log ed errore;
- verificare lo stato transazionale;
- correggere con forward-fix revisionata o ripetere solo dopo nuova approvazione.

### B. Difetto semantico con DB integro

Preferire una **forward-fix migration** piccola, esplicita e provata.

### C. Corruzione/perdita dati o stato non deterministico

- sospendere release applicativo;
- usare backup pre-release come sorgente di recovery;
- verificare prima il restore su non-Production;
- il restore/cutover Production richiede decisione amministrativa esplicita.

### D. Database corretto, applicazione regressiva

Rollback applicativo all'ultimo deploy noto funzionante, verificando compatibilità dello schema. Rollback applicativo non implica automaticamente rollback DB.

## 9. Confine con il deploy applicativo

Il database release completato **non autorizza** merge/deploy del frontend.

Restano separati i gate:

- CI HEAD finale;
- human WCAG/device QA;
- legal professionale;
- Vercel project/control-plane alignment;
- required checks `main`;
- verifica frontend reale MFA/AAL2;
- autorizzazione esplicita merge/deploy;
- Production smoke Vercel e dominio.

`DATABASE_RELEASE = PASS`  
`APPLICATION_PRODUCTION_ACTIVATION = PENDING`
