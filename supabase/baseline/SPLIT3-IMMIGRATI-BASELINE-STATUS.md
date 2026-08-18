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

The baseline has already completed an isolated local cold-start validation from zero. Auth/redazione remains a separate gate.

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

## Auth / editorial gate

The hosted source currently contains:

- auth users: 1
- profiles: 1
- accounts: 1
- account role assignments: 0

The account is active with a declared person association. In the current source row, the Auth user UUID, profile UUID and account `person_id` all refer to the same person identity.

All checked Ponte user-owned operational tables are empty (memberships, professional profile, services, organizations, collaborations, international user activity, training, terms/legal/reassignment records and person contact/profile extension tables).

Therefore the split does not need to preserve a populated downstream person-data graph. The remaining Auth work is a supported recreation/invite/reset of the user in each final Supabase Auth project, followed by attachment of the local `profiles` / `accounts` compatibility rows and explicit editorial-role setup where required. Do not blindly copy the hosted `auth` schema.

## Current gate

1. Keep the already-built Immigrati structural/public-data baseline isolated from Ponte.
2. Complete and test the Immigrati Auth/editorial login gate.
3. Validate public reads and editor/admin writes against the separated Auth identity.
4. Only after both products pass their Auth gates, plan the hosted production cutover.

## Safety

The existing hosted source remains the source/backup during SPLIT-3. The source inventory above was obtained with read-only `SELECT` queries. No hosted schema or data mutation is part of this baseline work.
