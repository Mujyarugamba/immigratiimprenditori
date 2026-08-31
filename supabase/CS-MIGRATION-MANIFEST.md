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

Questa baseline è stata validata con cold start, RLS pubblico e Auth identity/rollback prima del cutover Production.

Dopo la baseline, il cold-start standalone ricostruisce anche evoluzioni canoniche già presenti nella migration history hosted e conservate in `supabase/standalone-evolutions/`. Questi file servono esclusivamente a riprodurre localmente lo schema reale già applicato; **non** fanno parte del `candidateDelta` Production e non devono essere riapplicati al progetto hosted:

- `20260819141022_editorial_inbox_activity.sql` — migration hosted canonica post-cutover;
- `20260819141338_editorial_contributor_hardening.sql` — consolidamento delle evoluzioni hosted `20260819141338`–`20260819143251`;
- `20260819170614_content_interview_workflow.sql` — ricostruzione della migration hosted `20260819170614_content_interview_workflow`, necessaria perché le evoluzioni successive della pipeline interviste possano essere replayate da database vuoto.

La workflow CI `.github/workflows/supabase-local-validation.yml` copia queste evoluzioni sotto i rispettivi timestamp hosted prima di applicare le migration repository post-cutoff.

## Hosted Production — cutover SPLIT-3

Il 19/08/2026 il progetto Supabase storico `hvfvfatlaspcpszgizhg` è stato convertito in-place al perimetro standalone Centro Studi mediante le migration gestite:

- `split3_immigrati_production_cleanup`
- `split3_immigrati_postcutover_performance_hardening`

Stato verificato dopo il cutover:

- 29 tabelle `public`
- 57 policy RLS
- 0 FK verso tabelle PonteImprese
- 18 contenuti totali / 17 pubblici
- 10 tipi evento / 0 eventi
- Osservatorio 1 indicatore / 1 fonte / 6 valori
- 30 lingue / 21 settori
- 1 `auth.users` / 1 profilo / 1 account
- 1 ruolo attivo `amministratore_applicativo`

## Hosted Production — verifica read-only 31/08/2026

La migration history del progetto hosted è stata riletta senza scritture. L'ultima migration osservata è:

`20260824104000_fix_public_profile_column_grants`

Il cutoff Production osservato è `20260824104000` (235 migration hosted). Qualunque file repository con timestamp `<=` a questo cutoff **non** è un candidato di rilascio, salvo alias storici già classificati.

Due file repository restano alias storici di migration **già applicate** con versioni hosted precedenti. Restano in `alreadyAppliedRepositoryAliases` e non appartengono al delta futuro:

- repository `20260820170000_editorial_foundation_v1.sql` → hosted `20260819102530_editorial_foundation_v1`;
- repository `20260820171000_editorial_submission_country_labels.sql` → hosted `20260819103031_editorial_submission_country_labels`.

Non devono essere riapplicati.

Le migration classificate in `appliedReleaseDelta`, da `20260820173000_harden_editorial_public_submission.sql` fino a `20260824104000_fix_public_profile_column_grants.sql`, risultano già applicate in Production.

Il delta candidato repository, **non applicato e non autorizzato alla scrittura Production**, è invece:

- `20260829120000_create_content_ai_translations.sql`;
- `20260831103000_audit_interview_workflow_activity.sql`.

La classificazione in `candidateDelta` serve a impedire drift e applicazioni accidentali: non equivale ad approvazione del rilascio. La migration history hosted deve essere riletta immediatamente prima di qualsiasi rilascio; il file JSON è un'evidenza dello stato osservato, non un'autorizzazione permanente alla scrittura.

## `supabase/migrations/`

I file SQL pre-SPLIT-3 presenti in `supabase/migrations/` sono **storico di ownership** proveniente dal precedente monolite. Non sono una catena di bootstrap standalone e non devono essere concatenati o riapplicati al database Centro Studi.

Per un cold start usare la baseline `supabase/baseline/00..03`, le evoluzioni hosted ricostruite esplicitamente in `supabase/standalone-evolutions/` e soltanto le migration successive dichiarate dalla workflow di validazione. Non reintrodurre oggetti o FK PonteImprese.

**Non usare `supabase db push` sull'intera directory `supabase/migrations/` per il rilascio production.** La history repository e quella hosted contengono alias temporali intenzionali e storico pre-SPLIT-3.

## Piano e rollback production

- piano machine-readable: `supabase/CS-PRODUCTION-RELEASE.json`;
- runbook operativo: `supabase/CS-PRODUCTION-RELEASE-RUNBOOK.md`;
- backup/recovery: `docs/security/BACKUP-RECOVERY.md`;
- guard CI: `scripts/ci/production-migration-plan-smoke.mjs`.

Qualunque scrittura production resta separata da questa documentazione e richiede autorizzazione esplicita.
