# SPLIT-3 — ImmigratiImprenditori Production cutover plan

Checkpoint 2026-08-18.

## Preconditions — PASS

Local SPLIT-3 separation is complete.

ImmigratiImprenditori:

- runtime boundary PASS
- TypeScript PASS
- cold start `00..03` PASS
- public/RLS smoke PASS
- Auth identity flow PASS
- Auth rollback PASS

PonteImprese has independently passed its corresponding local gates through `00..44`.

The current hosted project `hvfvfatlaspcpszgizhg` remains the historical shared source and rollback reference.

## Current hosted-source checkpoint

Read-only verification on 2026-08-18:

Centro Studi data:

- contents 18
- event_types 10
- events 0
- observatory_indicators 1
- observatory_statistical_sources 1
- observatory_indicator_values 6

Shared local catalogs used by Centro Studi:

- languages 30
- business sectors 21

Identity:

- auth.users 1
- profiles 1
- accounts 1
- account_role_assignments 0

Ponte operational data still present in the shared source:

- opportunities 20
- opportunity_sources 20
- opportunity_time_windows 20
- opportunity_market_references 20
- international_markets 3
- international_market_countries 3
- international_market_support_resources 15

No source mutation is allowed during planning.

## Cutover principle

Immigrati does not need to move first.

The safe order is:

1. create and validate an independent hosted PonteImprese project;
2. cut Ponte application traffic over to that target;
3. keep this historical source intact during a rollback window;
4. validate Immigrati standalone runtime/login against the historical source;
5. only after Ponte is stable, clean the historical source into an Immigrati-only database through reviewed migrations;
6. re-run Centro Studi counts, RLS, Auth and redazione smoke;
7. declare the historical project converted to final Immigrati production only after those checks pass.

## Auth cutover

Do not copy `auth.users`, password hashes, sessions or refresh tokens by SQL.

For the intended Centro Studi editor:

1. recreate/invite/reset the Auth identity using supported Supabase Auth;
2. verify `handle_new_user()` creates the local profile;
3. provision the local account;
4. link the account to the profile/person;
5. explicitly assign `redattore` or `amministratore_applicativo` as required;
6. confirm `/accedi` login and `/app/redazione` authorization;
7. confirm no public `/registrati` flow exists.

## Cleanup of the historical shared source

Cleanup is a separate migration phase after Ponte cutover.

Rules:

- retain a rollback backup/reference before destructive cleanup;
- remove Ponte-owned tables/functions/triggers/policies only through reviewed migrations;
- do not use `db reset`;
- do not drop shared catalogs still required by Centro Studi;
- preserve opaque external UUID references where the Centro Studi schema intentionally stores them without PostgreSQL FKs;
- preserve all Centro Studi content/event/observatory rows and their publication state;
- preserve the standalone Auth/editorial identity layer.

## Final Immigrati hosted validation

After cleanup, verify at minimum:

Structural:

- only Centro Studi + minimum local identity/shared catalog schema remains;
- no FK requires a Ponte-owned table;
- no runtime query requires a Ponte-owned table.

Data:

- contents 18 total, 17 public/published
- content types 11
- content categories 9
- event types 10
- events 0
- observatory indicators 1
- observatory statistical sources 1
- observatory indicator values 6
- languages 30
- business sectors 21

Auth/redazione:

- intended editor can sign in
- active account/person link exists
- required application role is active
- `/app/redazione` exposes only contents, events and observatory

Public RLS:

- exact anonymous visibility remains aligned with the validated local smoke.

## Stop conditions

Stop cleanup/cutover immediately if:

- Ponte has not yet been independently cut over and verified;
- any Centro Studi count differs unexpectedly from the source snapshot;
- a migration would remove a table still referenced by an active Centro Studi runtime path;
- Auth/editorial access fails;
- RLS public visibility changes unexpectedly;
- a destructive change lacks a rollback reference.

## Current status

`IMMIGRATI_SPLIT3_LOCAL = COMPLETE`

`PRODUCTION_CUTOVER = PENDING`

Next irreversible action is not Immigrati cleanup; it is creation and validation of the dedicated Ponte hosted Supabase target.
