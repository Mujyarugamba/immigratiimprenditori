# SPLIT-3B — ImmigratiImprenditori executable baseline

Checkpoint 2026-08-18.

## Scope

ImmigratiImprenditori is the Centro Studi product after the split. It owns editorial/content, events and observatory domains plus the minimum local identity compatibility layer required by its own redazione.

PonteImprese business/professional/service/opportunity/international operational tables are not part of this database. Cross-product UUIDs may remain as opaque external references only; there are no PostgreSQL foreign keys or runtime joins to Ponte.

## Database baseline

Executable migrations:

- `00_baseline_immigratiimprenditori`
- `01_runtime_link_compatibility`
- `02_seed_immigrati_public_data`
- `03_auth_identity_gate`

Migrations `00..02` previously completed an isolated cold start. The final `00..03` gate is pending after the Auth/runtime separation work.

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

## Auth/editorial gate — PREPARED

Hosted source currently has one Auth user, one profile, one active linked account and zero application-role assignments. The checked Ponte user-owned operational tables are empty, so there is no populated personal operational graph to remap into Centro Studi.

Migration `03_auth_identity_gate` rebuilds only the minimum local mechanics:

- `handle_new_user()`
- `access_provision_account()`
- `access_link_person()`
- `assign_application_role()`
- `on_auth_user_created` trigger

No Auth user row, email, password, credential, session or application role is seeded.

The standalone Centro Studi now has a deliberately closed editorial login:

- `/accedi` supports email/password only for an already provisioned user;
- there is no public `/registrati` flow;
- login requires an active local account and either `redattore` or `amministratore_applicativo`;
- unauthorized or unprovisioned users are signed out;
- `/app/redazione` uses its own standalone role gate and logout flow rather than Ponte onboarding redirects.

Final hosted cutover must recreate/invite/reset the intended Auth user through supported Supabase Auth, then provision/link the local account and explicitly assign the required editorial role.

## Application/runtime separation — PREPARED

The active Centro Studi runtime has been separated from Ponte:

- `/cultura` reads local Centro Studi events/contents only;
- Ponte-owned sections in the culture bundle are typed empty collections until an explicit service/API boundary exists;
- related-data helpers may use opaque external UUIDs only to find local Centro Studi rows, never to query Ponte tables;
- public content/event/observatory paths query Centro Studi tables only;
- no Ponte public route is exposed locally.

The reserved editorial area contains only:

- contenuti
- eventi
- osservatorio

Old Ponte editorial links to opportunities, markets and organizations were removed from the dashboard and editorial navigation.

`scripts/split3/validate-runtime-boundary.mjs` follows the reachable Next.js import graph and fails on Ponte-owned routes, modules, DB queries or editorial routes. It also requires the closed `/accedi` route/auth actions and forbids a public `/registrati` route.

## Public RLS smoke — PREPARED

The local validator now switches to role `anon` and verifies exact public visibility after grants/RLS. Expected counts were confirmed against the hosted source:

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

## Automated local gate — PENDING

`scripts/split3/run-immigrati-local-cold-start.ps1` is fail-closed to branch `split-3b-executable-baseline` and laboratory:

`C:\Users\151702\Desktop\PROGETTI-WEB\split3-local\immigratiimprenditori`

It checks runtime boundary, runs TypeScript typecheck, refreshes exactly four baseline migrations, starts only the isolated local Supabase stack, performs `supabase db reset --local --no-seed`, then runs deterministic structural/data/RLS validation.

Expected final markers:

- `SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = PASS`
- `SPLIT3_IMMIGRATI_TYPECHECK = PASS`
- `SPLIT3_IMMIGRATI_LOCAL_00_03 = PASS`
- `SPLIT3_IMMIGRATI_ANON_PUBLIC_READS = PASS`

Ponte's `scripts/split3/run-all-local-gates.ps1` orchestrates both products sequentially and stops only the two SPLIT-3 local stacks to avoid port conflicts.

## Production cutover — PENDING

The existing hosted source remains source/backup. All source checks used here were read-only. No hosted schema/data mutation has been performed.

## Current gate

1. Run the combined isolated local gate for both products.
2. If runtime/typecheck/DB/RLS gates pass, perform local Auth functional smoke for Centro Studi and Ponte.
3. Only then plan supported hosted Auth recreation and the Production split/cutover.
