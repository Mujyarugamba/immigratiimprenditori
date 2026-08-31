# Centro Studi — runbook migration production e rollback

Stato: **PRODUCTION SCHEMA ALLINEATO AL CUTOFF 20260824104000 / 2 MIGRATION CANDIDATE NON APPLICATE**  
Data verifica read-only: **31 agosto 2026**

Questo documento disciplina esclusivamente il rilascio del database Centro Studi sul progetto Supabase hosted `hvfvfatlaspcpszgizhg`. Non autorizza alcuna migration o deploy.

## 1. Fonte canonica

- bootstrap standalone: `supabase/baseline/00..03` come descritto in `CS-MIGRATION-MANIFEST.md`;
- piano machine-readable del delta: `supabase/CS-PRODUCTION-RELEASE.json`;
- backup/recovery: `docs/security/BACKUP-RECOVERY.md`;
- governance ibrida review: `docs/editorial/HYBRID-REVIEW-GOVERNANCE.md`;
- `supabase/migrations/` contiene anche storico pre-SPLIT-3 e **non è una catena da inviare integralmente a production**.

### Regola assoluta

**Non eseguire `supabase db push` sull'intera directory `supabase/migrations/` per questo cutover.** Due file repository con timestamp `20260820170000` e `20260820171000` corrispondono a migration già presenti sul progetto hosted con versioni rispettivamente `20260819102530` e `20260819103031`. Riapplicarli produrrebbe drift o duplicazione.

## 2. Stato hosted osservato

La lettura read-only delle migration hosted del 31/08/2026 mostra come ultima migration:

`20260824104000_fix_public_profile_column_grants`

Il progetto hosted risulta a **235 migration**. Il cutoff Production osservato è `20260824104000`. Le migration classificate in `appliedReleaseDelta` fino a questo cutoff risultano già applicate e **non** sono candidate.

`candidateDelta` nel file `CS-PRODUCTION-RELEASE.json` contiene attualmente, in ordine:

1. `20260829120000_create_content_ai_translations.sql`;
2. `20260831103000_audit_interview_workflow_activity.sql`.

Entrambe sono **candidate repository non applicate**: la loro presenza nel piano impedisce drift, ma non autorizza alcuna scrittura Production.

Gli alias storici repository/hosted restano dichiarati in `alreadyAppliedRepositoryAliases` e **non** vanno mescolati con eventuali migration future.

Questo dato **deve essere ricontrollato immediatamente prima di qualunque rilascio**. Se la migration hosted più recente o l'elenco differiscono dal piano registrato, fermare il rilascio e rigenerare il piano; non tentare di “riparare” la history a mano. Qualunque file con timestamp `<= 20260824104000` proposto come nuovo candidato deve essere rifiutato, salvo alias storico già classificato.

## 3. Precondizioni obbligatorie

Prima di qualsiasi scrittura production devono essere contemporaneamente vere:

1. autorizzazione esplicita al rilascio production;
2. commit applicativo candidato identificato e immutabile;
3. CI applicativo verde, salvo gate editoriali deliberatamente esterni alla migration;
4. migration history hosted riletta e coincidente con il piano aggiornato;
5. backup production cifrato completato con SHA-256 verificato;
6. restore drill del backup eseguito su database non-production;
7. URL/ID del progetto production verificato due volte;
8. nessuna migration candidate contiene operazioni distruttive non revisionate;
9. piano di rollback applicativo e database assegnato a un operatore responsabile;
10. attivazione di secret/feature production trattata come fase separata.

Se una sola precondizione manca: **ABORT**.

## 4. Preparazione del delta

Usare esclusivamente l'array ordinato `candidateDelta` in `CS-PRODUCTION-RELEASE.json`.

Il gate `scripts/ci/production-migration-plan-smoke.mjs` verifica che:

- `candidateDelta: []` sia comunque uno stato valido quando non esistono evoluzioni future;
- tutti i file dichiarati come alias o candidati esistano;
- l'ordine dei candidati, se presenti, sia cronologico e senza duplicati;
- nessun candidato abbia timestamp `<=` al cutoff Production corrente;
- gli alias storici restino separati dall'elenco delle migration future;
- ogni file repository successivo al cutoff hosted, esclusi gli alias storici, sia classificato come candidato;
- i gate security/governance critici restino presenti nel repository, inclusa `20260824103000_harden_publication_gate_execute_privileges.sql`, la governance ibrida 4-eyes e la relativa forward-fix del classificatore `NULL`;
- nessun candidato contenga `DROP TABLE`, `DROP SCHEMA`, `TRUNCATE` o `DROP COLUMN` non consentiti dal gate.

Un nuovo file post-cutoff non registrato fa fallire il CI finché il piano non viene aggiornato deliberatamente. La classificazione del file non equivale mai ad autorizzazione di applicazione.

## 5. Esecuzione production — solo dopo autorizzazione

1. rileggere la migration history hosted e salvarne evidenza;
2. creare il backup cifrato pre-release e verificarne checksum + indice;
3. annotare l'ultimo deploy production applicativo noto funzionante;
4. applicare **una migration alla volta**, nell'ordine esatto del `candidateDelta`;
5. dopo ogni migration verificare che l'operazione sia terminata senza errore e che la history registri la nuova migration;
6. al primo errore: non applicare le successive;
7. concluse le migration, eseguire i controlli database/security prima di qualsiasi deploy applicativo;
8. solo dopo DB PASS e autorizzazione separata, procedere al deploy applicativo production.

Non modificare versioni o nomi delle migration già applicate per far coincidere artificialmente la history.

## 6. Verifiche post-migration

Controllare almeno:

- schema PostgreSQL senza errori di lint;
- RLS e privilegi anon/authenticated sulle superfici pubbliche/private;
- accesso contributor/editor/admin e MFA AAL2 privilegiata;
- rate limit pubblico e login;
- audit log e analytics in stato previsto, senza attivare feature production non autorizzate;
- governance ibrida: contenuto ordinario same-editor consentito, contenuti sensibili/istituzionali bloccati senza seconda approvazione distinta, self-approval negata e approval stale negata dopo modifica;
- contenuti ordinari senza categoria (`primary_category_code = NULL`) non devono essere classificati sensibili per il solo `NULL`;
- indicatori Osservatorio bloccati senza seconda approvazione;
- correzioni `substantive`/`retraction` pubbliche bloccate senza seconda approvazione;
- se è inclusa la migration interviste: transizioni invalide negate, DELETE diretto `authenticated` negato, timestamp consensi normalizzati, audit append-only presente e `internal_notes` assenti dal payload audit;
- lettura di Osservatorio, Atlante, rotte, contenuti, autori e open data;
- nessuna FK/oggetto PonteImprese reintrodotto;
- conteggi e visibilità dei contenuti coerenti con lo stato editoriale reale;
- smoke applicativo contro il database production in modalità controllata.

## 7. Abort e rollback

### A. Migration fallisce durante l'esecuzione

- fermare immediatamente la catena;
- non marcare manualmente la migration come applicata;
- conservare log ed errore;
- verificare se la transazione è stata interamente annullata;
- correggere in una nuova migration revisionata o ripetere solo dopo nuova approvazione.

### B. Migration applicata ma difetto semantico correggibile

Preferire una **forward-fix migration** esplicita. La precedente `20260822213100_fix_hybrid_null_category_classifier.sql` è un esempio storico di questo principio: fu introdotta dopo che il test due-redattori rilevò la semantica SQL `NULL` del classificatore. Non inventare automaticamente una down-migration se non è stata progettata e provata.

### C. Corruzione/perdita dati o incompatibilità non recuperabile con forward-fix sicura

- sospendere il rilascio applicativo;
- usare il backup cifrato pre-release come sorgente di recovery;
- ripristinare prima su un database pulito/non-production per verificare l'archivio;
- il ripristino o cutover production richiede una decisione amministrativa esplicita;
- non sovrascrivere production alla cieca.

### D. Database corretto, applicazione regressiva

Ripristinare l'applicazione all'ultimo artifact/deploy production noto funzionante. Il rollback applicativo non implica automaticamente il rollback DB: lo schema deve restare compatibile con la versione ripristinata oppure va preparata una correzione controllata.

## 8. Evidenza di chiusura

Registrare per il rilascio:

- commit SHA applicativo;
- migration hosted iniziale e finale;
- elenco effettivamente applicato;
- timestamp e checksum del backup pre-release;
- esito restore drill;
- esito smoke DB/security/app;
- esito governance ibrida 4-eyes, inclusa la regressione `NULL`;
- eventuali forward-fix;
- autorizzazione esplicita a deploy/migration production.

Finché queste evidenze non esistono, lo stato resta **PRODUCTION ACTIVATION PENDING**.
