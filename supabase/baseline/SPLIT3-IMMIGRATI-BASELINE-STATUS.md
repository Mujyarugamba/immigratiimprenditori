# SPLIT-3B — ImmigratiImprenditori executable baseline

Checkpoint 2026-08-18.

## Scope

ImmigratiImprenditori is the Centro Studi product after the split. Its executable baseline owns editorial/content, events and observatory domains plus the minimum local identity compatibility layer required by the application runtime.

The baseline intentionally does not import the PonteImprese business/professional/service/opportunity/international operational graph.

Cross-product identifiers such as opportunity, service and market UUIDs are opaque external references only. There are no PostgreSQL foreign keys from ImmigratiImprenditori to PonteImprese.

## Executable baseline on this branch

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

## Automated local gate

`scripts/split3/run-immigrati-local-cold-start.ps1` is fail-closed to the isolated `split3-local\immigratiimprenditori` directory. It refreshes the baseline copies, cold-starts migrations `00..03`, and runs `scripts/split3/validate-immigrati-local-baseline.sql`.

The validator checks the 29-table/RLS closure, current public-data counts, absence of unexpected cross-schema FKs, the four Auth-gate functions, and the `auth.users -> public.handle_new_user` trigger.

## Current gate

1. Run the isolated automated Immigrati cold-start/validator through migration `03`.
2. Run the isolated Ponte cold-start/validator through migration `44`.
3. Validate public reads and editor/admin application runtime against separated local databases.
4. Only after both products pass, plan supported Auth-user recreation and the hosted production cutover.

## Safety

The existing hosted source remains the source/backup during SPLIT-3. The source inventory above was obtained with read-only `SELECT` queries. No hosted schema or data mutation is part of this baseline work.
