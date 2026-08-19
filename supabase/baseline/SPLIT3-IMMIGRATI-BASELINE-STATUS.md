# SPLIT-3B — ImmigratiImprenditori executable baseline

Checkpoint 2026-08-18.

## Scope

ImmigratiImprenditori is the Centro Studi product after the split. It owns editorial/content, events and observatory domains plus the minimum local identity compatibility layer required by its own redazione.

PonteImprese business/professional/service/opportunity/international operational tables are not part of this database. Cross-product UUIDs may remain as opaque external references only; there are no PostgreSQL foreign keys or runtime joins to Ponte.

## Database baseline — PASS

Executable migrations:

- `00_baseline_immigratiimprenditori`
- `01_runtime_link_compatibility`
- `02_seed_immigrati_public_data`
- `03_auth_identity_gate`

The isolated cold start `00..03` completed successfully on 2026-08-18.

Verified local state:

- public tables 29
- RLS policies 57
- contents 18
- event types 10
- events 0
- observatory indicators 1
- observatory statistical sources 1
- observatory indicator values 6

Success marker: `SPLIT3_IMMIGRATI_LOCAL_00_03 = PASS`.

## Hosted-source snapshot

Source was re-queried read-only on 2026-08-18.

Centro Studi data:

- content types 11
- content categories 9
- content tags 0
- contents 18: 17 published/public, 1 not published, 0 with `owner_person_id`
- event types 10
- events 0
- observatory indicators 1 published
- observatory statistical sources 1 active
- observatory indicator values 6 public final/revised values
- current content/event cross-link and event-operational tables 0 rows

Shared copied catalogs used locally are languages 30 and business sectors 21.

## Auth structural/editorial gate — PASS

Hosted source currently has one Auth user, one profile, one active linked account and zero application-role assignments. The checked Ponte user-owned operational tables are empty, so there is no populated personal operational graph to remap into Centro Studi.

Migration `03_auth_identity_gate` rebuilds only the minimum local mechanics:

- `handle_new_user()`
- `access_provision_account()`
- `access_link_person()`
- `assign_application_role()`
- `on_auth_user_created` trigger

Migration `03` cold-starts successfully. No Auth user row, email, password, credential, session or application role is seeded.

The standalone Centro Studi has a deliberately closed editorial login:

- `/accedi` supports email/password only for an already provisioned user;
- there is no public `/registrati` flow;
- login requires an active local account and either `redattore` or `amministratore_applicativo`;
- unauthorized or unprovisioned users are signed out;
- `/app/redazione` uses its own standalone role gate and logout flow rather than Ponte onboarding redirects.

## Application/runtime separation — PASS

The active Centro Studi runtime is separated from Ponte:

- `/cultura` reads local Centro Studi events/contents only;
- Ponte-owned sections in compatibility bundles are typed empty collections until an explicit service/API boundary exists;
- related-data helpers may use opaque external UUIDs only to find local Centro Studi rows, never to query Ponte tables;
- public content/event/observatory paths query Centro Studi tables only;
- no Ponte public route is exposed locally;
- old Ponte editorial modules retained for compatibility are database-free;
- reserved `/app/redazione` contains only contenuti, eventi and osservatorio.

`scripts/split3/validate-runtime-boundary.mjs` follows the reachable Next.js import graph and fails on Ponte-owned routes, DB queries or forbidden editorial routes. It also requires the closed `/accedi` route/auth actions and forbids a public `/registrati` route.

Observed markers:

- `SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = PASS`
- `SPLIT3_IMMIGRATI_TYPECHECK = PASS`

## Public RLS smoke — PASS

The local validator switches to role `anon` and verifies exact public visibility after grants/RLS:

- contents 17
- content types 11
- content categories 9
- event types 10
- events 0
- observatory indicators 1
- observatory statistical sources 1
- observatory indicator values 6
- languages 30
- business sectors 21

Success marker: `SPLIT3_IMMIGRATI_ANON_PUBLIC_READS = PASS`.

## Automated local separation gate — PASS

`scripts/split3/run-immigrati-local-cold-start.ps1` is fail-closed to branch `split-3b-executable-baseline` and laboratory:

`C:\Users\151702\Desktop\PROGETTI-WEB\split3-local\immigratiimprenditori`

It validates runtime boundary, TypeScript, exactly four baseline migrations, isolated Supabase cold-start and deterministic structural/data/RLS checks. The complete gate passed on 2026-08-18.

## Local Auth identity smoke — PASS

The transactional Auth smoke passed on 2026-08-18:

- `SPLIT3_IMMIGRATI_AUTH_IDENTITY_FLOW = PASS`
- `SPLIT3_IMMIGRATI_AUTH_ROLLBACK = PASS`

The smoke creates a synthetic local Auth identity inside a transaction, verifies trigger → profile → account provision → authenticated person link → `redattore` role → access helpers, then rolls the transaction back. The rollback check confirms no test identity remains.

This validates the local identity/database mechanics only. Hosted password/session recreation remains separate and must use supported Supabase Auth mechanisms.

## SPLIT-3 local separation — COMPLETE

ImmigratiImprenditori has passed all local structural, data, RLS, runtime, typecheck and Auth identity gates required before hosted cutover planning.

Canonical state:

- `IMMIGRATI_COLD_START_00_03 = PASS`
- `IMMIGRATI_RUNTIME_BOUNDARY = PASS`
- `IMMIGRATI_TYPECHECK = PASS`
- `IMMIGRATI_ANON_PUBLIC_READS = PASS`
- `IMMIGRATI_AUTH_IDENTITY_FLOW = PASS`
- `IMMIGRATI_AUTH_ROLLBACK = PASS`
- `IMMIGRATI_SPLIT3_LOCAL = COMPLETE`

## Production cutover — PENDING

The existing hosted source remains source/backup. All source checks used here were read-only. No hosted schema/data mutation has been performed.

Next work is hosted cutover planning only:

1. keep the existing hosted Supabase project as the current source until cutover is explicitly approved;
2. determine whether Immigrati will remain on that project after controlled cleanup or move to a new hosted target;
3. perform supported hosted Auth recreation/invite/reset and explicit account/person/editor-role linking;
4. validate hosted content/event/observatory counts, RLS and redazione access;
5. switch application environment/deploy only after validation;
6. remove Ponte-owned tables from the historical shared project only as a separate, reviewed cleanup after both products are live and verified.

Never run `supabase db reset` against the hosted source. The current shared database remains the rollback/source reference until final cutover is complete.
