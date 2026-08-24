# Centro Studi — migration ownership dopo SPLIT-3

`CS_MIGRATION_OWNERSHIP = STANDALONE`  
`CS_DATABASE_BOOTSTRAP = SPLIT_3_COMPLETE`  
`CS_HOSTED_PROJECT = hvfvfatlaspcpszgizhg`

## Catena canonica di cold start

La baseline autonoma del Centro Studi è in `supabase/baseline/`:

1. `00000000000000_baseline_immigratiimprenditori.sql`
2. `00000000000001_runtime_link_compatibility.sql`
3. `00000000000002_seed_immigrati_public_data.sql`
4. `00000000000003_auth_identity_gate.sql`

Questa baseline è il bootstrap standalone. Le evoluzioni successive devono essere applicate in ordine sopra la baseline; il workflow `supabase-local-validation.yml` costruisce esplicitamente la catena corrente e non concatena lo storico pre-SPLIT-3.

## Hosted Production — cutover SPLIT-3

Il 19/08/2026 il progetto Supabase storico `hvfvfatlaspcpszgizhg` è stato convertito in-place al perimetro standalone Centro Studi mediante le migration gestite:

- `split3_immigrati_production_cleanup`;
- `split3_immigrati_postcutover_performance_hardening`.

I file SQL pre-SPLIT-3 ancora presenti in `supabase/migrations/` restano storico di ownership e **non sono una catena di bootstrap standalone**.

## Alias repository già presenti hosted

Due file repository successivi al baseline release cutoff hanno versioni hosted precedenti e non devono essere riapplicati:

- repository `20260820170000_editorial_foundation_v1.sql` → hosted `20260819102530_editorial_foundation_v1`;
- repository `20260820171000_editorial_submission_country_labels.sql` → hosted `20260819103031_editorial_submission_country_labels`.

## Release database Centro Studi — stato 24/08/2026

Baseline hosted usata per il release batch:

`20260820160000_prepare_events_external_ingestion_rls`

Il release batch autorizzato è stato completato in tre fasi:

- #1–#19 — run `32699707002`: PASS;
- #20–#24 — run `32706028947`: PASS;
- #25 privilege hardening `20260824103000_harden_publication_gate_execute_privileges.sql` — run `32707529881`: PASS.

Stato hosted verificato dopo il release:

- migration rows: **234**;
- max version: **`20260824103000`**;
- `appliedReleaseDelta`: **25**;
- `candidateDelta`: **0**;
- MFA privilegiato Production: PASS;
- Production-source restore drill: PASS;
- publication-gate direct EXECUTE hardening: PASS.

La fonte machine-readable è `supabase/CS-PRODUCTION-RELEASE.json`.

## Cold-start corrente

Il workflow `.github/workflows/supabase-local-validation.yml` assembla:

- le quattro baseline `00..03`;
- le evoluzioni standalone/editoriali necessarie già hosted;
- il release delta 20260820/21/22;
- la patch `20260824103000_harden_publication_gate_execute_privileges.sql`.

La patch 20260824 è copiata **esplicitamente** per evitare che un glob troppo ampio includa future migration non revisionate. Se il file manca, il cold-start CI deve fallire chiuso.

## Regola per future evoluzioni

Per una nuova migration successiva allo stato hosted osservato:

1. creare il file SQL revisionato;
2. registrarlo in `candidateDelta`;
3. aggiornare deliberatamente il cold-start se necessario;
4. far passare release guard + cold-start + security smoke;
5. fresh hosted-state read + backup;
6. autorizzazione esplicita Production;
7. apply controllato + postflight;
8. dopo PASS, spostare il file in `appliedReleaseDelta` e aggiornare `observedHostedLatestMigration`.

## `supabase/migrations/`

**Non usare `supabase db push` sull'intera directory `supabase/migrations/` per un rilascio Production.**

La directory contiene storico pre-SPLIT-3, alias temporali intenzionali ed evoluzioni standalone. Il bootstrap canonico parte da `supabase/baseline/00..03`; le evoluzioni vengono selezionate deliberatamente.

## Piano e rollback Production

- piano machine-readable: `supabase/CS-PRODUCTION-RELEASE.json`;
- runbook database: `supabase/CS-PRODUCTION-RELEASE-RUNBOOK.md`;
- runbook go-live: `docs/operations/production-release-runbook-2026-08-23.md`;
- backup/recovery: `docs/security/BACKUP-RECOVERY.md`;
- guard CI: `scripts/ci/production-migration-plan-smoke.mjs`;
- evidenza patch finale: `docs/operations/production-security-patch-2026-08-24.md`.

Il database release concluso non autorizza il deploy applicativo. Future scritture Production richiedono nuova autorizzazione esplicita.
