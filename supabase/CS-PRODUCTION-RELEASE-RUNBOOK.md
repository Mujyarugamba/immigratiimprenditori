# Centro Studi — runbook migration Production e rollback

Stato: **PRODUCTION ACTIVATION COMPLETATA — SCHEMA E APPLICAZIONE ALLINEATI**  
Data verifica: **31 agosto 2026**

Questo documento disciplina il rilascio del database Centro Studi sul progetto Supabase hosted `hvfvfatlaspcpszgizhg` e registra l'evidenza dell'ultimo rilascio completato. Non autorizza automaticamente release future.

## 1. Stato Production verificato

La migration history hosted è stata riletta immediatamente prima del rilascio. Il cutoff iniziale era:

`20260824104000_fix_public_profile_column_grants`

Le due migration candidate dichiarate nel piano sono state applicate **una alla volta**, nell'ordine previsto, dopo autorizzazione esplicita:

1. repository `20260829120000_create_content_ai_translations.sql` → hosted `20260831174853_create_content_ai_translations`;
2. repository `20260831103000_audit_interview_workflow_activity.sql` → hosted `20260831174953_audit_interview_workflow_activity`.

La history hosted finale contiene **237 migration** e termina a:

`20260831174953_audit_interview_workflow_activity`

`supabase/CS-PRODUCTION-RELEASE.json` registra ora `candidateDelta: []`.

## 2. Backup e recovery pre-release

Prima delle scritture Production è stato creato un nuovo logical backup del database Production con ruoli, schema e dati, cifrato GPG AES-256.

Evidenza pre-release:

- workflow run: `33406592097`, attempt 2;
- timestamp backup: `20260831T174600Z`;
- artifact GitHub: `9769054787`;
- file cifrato: `centro-studi-20260831T174600Z.tar.gz.gpg`;
- SHA-256 del file cifrato: `3c8353a8891dcb86d6deded137dd584f66f89fbd301ccd48befae5f12a97d1c7`;
- checksum interno verificato: **PASS**;
- logical export: **PASS**;
- encryption: **PASS**;
- artifact upload: **PASS**.

L'attempt storico risulta globalmente rosso per il vecchio controllo plaintext che includeva erroneamente i file cifrati nel glob `centro-studi-*`; non si tratta di un fallimento del dump, della cifratura o dell'upload. Il workflow corrente su `main` contiene già la correzione di quel falso positivo.

Il meccanismo di recovery era già stato verificato end-to-end sul backup Production tramite restore isolato non-Production:

- restore drill run `33414599035`: **SUCCESS**;
- restore completo, Auth, TOTP MFA, build, HTTP/security smoke ed E2E autenticato: **PASS**;
- nessuna scrittura Production durante il drill.

## 3. Verifiche post-migration

### Cache traduzioni AI

Dopo `create_content_ai_translations` sono stati verificati:

- tabella presente;
- RLS attiva;
- `anon` e `authenticated`: SELECT consentita, INSERT negata;
- `service_role`: SELECT/INSERT/UPDATE consentiti;
- policy `content_ai_translations_public_read` presente;
- funzione di coerenza lingua/locale presente.

### Workflow interviste

Dopo `audit_interview_workflow_activity` sono stati verificati:

- `enforce_interview_workflow_transition()` presente;
- `log_interview_workflow_activity()` presente;
- `enforce_interview_workflow_content_type()` presente;
- `prevent_interview_content_type_detach()` presente;
- `ensure_interview_workflow_for_editorial_content()` presente;
- sei trigger applicativi attesi presenti;
- DELETE diretto `authenticated` su `content_interview_workflow` negato;
- EXECUTE diretto `anon/authenticated` sul transition guard negato.

Gli advisor Supabase non hanno introdotto nuovi finding di sicurezza bloccanti. Restano warning/info già noti e un advisory performance informativo sulla FK `content_ai_translations.source_language_id`, che non è stato trasformato in una migration aggiuntiva durante il cutover.

## 4. Release applicativa Production

Commit applicativo approvato:

`2dfc5e9f25e69edecd6bbe31c3ffe314a433aa52`

La promozione ha rispettato il ruleset attivo `Protect production` con `update`, `deletion` e `non_fast_forward` protetti e bypass riservato alla GitHub App di release ID `4774125`.

Evidenza di promozione:

- workflow one-shot autorizzato run `33422006767`: **SUCCESS**;
- preflight: **PASS**;
- fast-forward protetto: **PASS**;
- verifica ref esatto: **PASS**;
- `production` finale: `2dfc5e9f25e69edecd6bbe31c3ffe314a433aa52`;
- `main` al momento della release: stesso SHA;
- Vercel commit status: **SUCCESS — Deployment has completed**.

Il workflow one-shot è stato eseguito da una PR operativa temporanea, PR `#82`, successivamente **chiusa senza merge**. Il relativo file workflow è stato rimosso dal branch operativo e non è mai entrato in `main` o `production`.

## 5. Fonte canonica per release future

- bootstrap standalone: `supabase/baseline/00..03`, come descritto in `CS-MIGRATION-MANIFEST.md`;
- piano machine-readable: `supabase/CS-PRODUCTION-RELEASE.json`;
- backup/recovery: `docs/security/BACKUP-RECOVERY.md`;
- governance ibrida review: `docs/editorial/HYBRID-REVIEW-GOVERNANCE.md`.

### Regola assoluta

**Non eseguire `supabase db push` sull'intera directory `supabase/migrations/`.** La directory contiene anche storia repository con alias rispetto alle versioni hosted. Ogni nuovo rilascio deve usare esclusivamente il delta classificato nel piano canonico.

## 6. Precondizioni obbligatorie per una release futura

Prima di qualsiasi nuova scrittura Production devono essere vere tutte le seguenti condizioni:

1. autorizzazione esplicita al rilascio Production;
2. commit applicativo candidato identificato e immutabile;
3. CI applicativo verde;
4. migration history hosted riletta e coincidente con il piano;
5. backup Production cifrato verificato;
6. restore drill valido su database non-Production;
7. project ref Production verificato;
8. nessuna operazione distruttiva non revisionata;
9. rollback applicativo/database definito;
10. feature flag e secret Production trattati separatamente.

Se una sola precondizione manca: **ABORT**.

## 7. Regole di esecuzione e rollback

Le migration candidate future devono essere applicate una alla volta nell'ordine di `candidateDelta`. Dopo ciascuna migration si verifica esito e history; al primo errore la catena si ferma.

Non modificare o rinominare migration già applicate per forzare la coincidenza della history. Per difetti semantici preferire una forward-fix revisionata. In caso di corruzione/perdita dati sospendere il rilascio e usare il backup cifrato come sorgente di recovery, verificandolo prima su un database pulito/non-Production. Un restore o cutover Production richiede sempre autorizzazione esplicita.

Per regressioni esclusivamente applicative, ripristinare l'ultimo deploy noto funzionante solo se lo schema rimane compatibile.

## 8. Stato di chiusura 31/08/2026

- backup pre-release cifrato e checksum: **PASS**;
- restore drill Production-source isolato: **PASS**;
- migration Production candidate: **2/2 APPLICATE**;
- controlli RLS/privilegi/trigger: **PASS**;
- `candidateDelta`: **VUOTO**;
- branch `production`: **ALLINEATO** al commit applicativo approvato;
- Vercel deployment: **SUCCESS**.

**PRODUCTION ACTIVATION = COMPLETE**
