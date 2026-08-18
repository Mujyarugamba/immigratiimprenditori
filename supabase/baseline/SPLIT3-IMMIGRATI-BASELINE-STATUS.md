# SPLIT-3B — ImmigratiImprenditori executable baseline

Checkpoint 2026-08-18.

## Scope

ImmigratiImprenditori is the Centro Studi product after the split. Its executable baseline owns editorial/content, events and observatory domains plus the minimum local identity compatibility layer required by the application runtime.

The baseline intentionally does not import the PonteImprese business/professional/service/opportunity/international operational graph.

Cross-product identifiers such as opportunity, service and market UUIDs are opaque external references only. There are no PostgreSQL foreign keys from ImmigratiImprenditori to PonteImprese.

## Executable database baseline

- `00000000000000_baseline_immigratiimprenditori.sql`
- `00000000000001_runtime_link_compatibility.sql`
- `00000000000002_seed_immigrati_public_data.sql`
- `00000000000003_auth_identity_gate.sql`

Migrations `00..02` already completed an isolated local cold start from zero. Migration `03` is the prepared Auth/editorial identity gate and now requires the final isolated cold-start validation.

## Hosted-source data inventory

The hosted source project `hvfvfatlaspcpszgizhg` was re-queried read-only on 2026-08-18.

Current Centro Studi data:

- content types: 11
- content categories: 9
- content tags: 0
- contents: 18
  - published: 17
  - not published: 1
  - rows with `owner_person_id`: 0
- event types: 10
- events: 0
- observatory indicators: 1
- observatory statistical sources: 1
- observatory indicator values: 6

All currently populated content/event cross-link and event-operational tables are empty in the hosted source, including content authors/relations/tag/subject links, content-to-event/opportunity/service/market links, event editions/languages/markets/organizers/registrations/sessions/speakers.

## Auth / editorial gate — PREPARED

The hosted source currently contains:

- auth users: 1
- profiles: 1
- accounts: 1
- account role assignments: 0

The account is active with a declared person association. In the current source row, the Auth user UUID, profile UUID and account `person_id` all refer to the same person identity.

All checked Ponte user-owned operational tables are empty (memberships, professional profile, services, organizations, collaborations, international user activity, training, terms/legal/reassignment records and person contact/profile extension tables). The 18 Centro Studi contents have no `owner_person_id`.

Migration `03_auth_identity_gate` rebuilds only the minimum supported local identity mechanics:

- `handle_new_user()` creates the local profile after an Auth user is created;
- `access_provision_account()` creates the local registered account under service-role control;
- `access_link_person()` attaches the account to the local profile and activates it;
- `assign_application_role()` grants `redattore` or `amministratore_applicativo` explicitly;
- `on_auth_user_created` wires `auth.users` to `handle_new_user()`.

No Auth user row, email, password, session, credential or application role is stored in the repository or seeded automatically. The hosted `auth` schema is not copied and no user is auto-promoted to an editorial role.

The final hosted cutover must use a supported recreation/invite/reset of the intended user in the final Immigrati Auth project, then provision/link the local account and explicitly assign the required editorial role.

## RLS independence

The separated RLS policies use only local `profiles`, `accounts`, `account_role_assignments`, Auth helpers, and Centro Studi-owned relations. Cross-product opportunity/service/market UUIDs are opaque references; policy evaluation does not query PonteImprese.

## Application/runtime boundary — PREPARED, LOCAL TYPECHECK PENDING

The active Centro Studi runtime was audited after the database split. The inherited `/cultura` aggregation and related-data helpers still contained direct queries to Ponte-owned tables. These active cross-database assumptions have now been removed.

Current runtime rules:

- `/cultura` reads local Centro Studi events and contents only;
- Ponte-owned culture sections (opportunities, professionals, businesses, organizations, collaborations, services and markets) remain typed empty collections until an explicit cross-product API/service boundary is introduced;
- CS-related helpers may use opaque external UUIDs to find local CS rows that reference the same Ponte object, but never query Ponte tables to resolve that object;
- content/event/observatory public and editorial paths continue to query only Centro Studi-owned tables;
- no local public route is provided for Ponte-owned product domains.

`scripts/split3/validate-runtime-boundary.mjs` is a fail-closed static guard for the active Centro Studi runtime. It fails if a Ponte route or direct query to a Ponte-owned core table is reintroduced.

## Automated local gate

`scripts/split3/run-immigrati-local-cold-start.ps1` is fail-closed to the `split-3b-executable-baseline` branch and the isolated `split3-local\immigratiimprenditori` laboratory.

It now performs, in order:

1. application runtime boundary validation;
2. TypeScript typecheck;
3. refresh of exactly four baseline migrations (`00..03`) into the isolated laboratory;
4. local-only `supabase db reset --local --no-seed`;
5. deterministic read-only database validation.

The final success markers are:

- `SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = PASS`
- `SPLIT3_IMMIGRATI_TYPECHECK = PASS`
- `SPLIT3_IMMIGRATI_LOCAL_00_03 = PASS`

This full gate has not yet been executed after the runtime-boundary and Auth-gate changes.

## Current gate

1. Run the full isolated Immigrati application/database gate through migration `03`.
2. Run the full isolated Ponte application/database gate through migration `44`.
3. After both pass, validate representative public reads and Auth/editorial runtime against the separated local databases.
4. Only after both products pass, plan supported Auth-user recreation and the hosted production cutover.

## Safety

The existing hosted source remains the source/backup during SPLIT-3. The source inventory above was obtained with read-only `SELECT` queries. No hosted schema or data mutation is part of this baseline work.
