# SPLIT-3A — ImmigratiImprenditori autonomous database baseline design

Status: `DESIGN_READY`

This document defines the physical database boundary for the future standalone ImmigratiImprenditori Supabase project. It does **not** apply SQL and it does **not** alter the current shared project.

## 1. Goal

Build a cold-startable ImmigratiImprenditori database centered on editorial content, events and the observatory, without importing PonteImprese commercial domains merely to satisfy old shared-schema foreign keys.

The SPLIT-2 Centro Studi manifest explicitly says its copied migration set is not autonomous: it still depends on shared identity/catalog objects and on Ponte/Eventi objects outside that set. SPLIT-3 therefore replaces replay of history with a fresh final-state baseline.

## 2. Product-owned domains

ImmigratiImprenditori owns:

- editorial contents;
- editorial events;
- observatory/statistical data;
- a small local editorial/admin identity layer;
- local copies of only the shared catalogs actually needed by these domains.

It does **not** own PonteImprese businesses, memberships, professional profiles, opportunities, services, international-market operational models, organizations, collaborations or training marketplace models.

## 3. Local identity model

ImmigratiImprenditori uses its own Supabase Auth project.

The database baseline must provide a minimal local application identity layer sufficient for editorial administration. Do not copy the entire PonteImprese identity/business-management graph.

Recommended final local objects:

- `editorial_accounts`
  - `id uuid` PK
  - `auth_user_id uuid` unique, references `auth.users(id)`
  - `status` (`active|closed`)
  - timestamps
- `editorial_role_assignments`
  - `id uuid` PK
  - `account_id` FK
  - `role_code` (`admin|editor` initially)
  - lifecycle timestamps

Required helpers should be local and narrowly scoped, for example:

- current editorial account;
- active-account check;
- `is_editor`;
- `is_admin`.

No helper in this project may call PonteImprese tables.

## 4. Shared catalog copies

### 4.1 `languages`

Keep an independent local copy because `contents` and event-language metadata need it.

The semantic code is the interoperability key. Numeric IDs are local implementation details.

### 4.2 `business_sectors`

Keep an independent local copy because `observatory_indicator_values.business_sector_id` can classify a statistic by sector.

`business_sectors.slug` is the stable semantic interoperability key. Do not treat the current bigint ID as a cross-product contract.

The current observatory rows have `business_sector_id = NULL`, so no existing statistical value requires a commercial sector row to migrate, but the capability should remain in the standalone baseline.

## 5. Contents redesign for standalone ownership

The historical `contents` table used ternary ownership:

- `owner_person_id -> profiles`
- `owner_business_id -> businesses`
- `owned_by_editorial`

Current data shows all 18 rows are editorial, with no person/business owner.

For the standalone ImmigratiImprenditori baseline:

- remove `owner_person_id` FK;
- remove `owner_business_id` FK;
- remove the old ternary ownership constraint;
- editorial custody is native to this product, so `owned_by_editorial` is no longer required as an ownership discriminator for new rows;
- preserve editorial/publication/visibility lifecycle, language, type, category, body, slug, source metadata, feature flag and timestamps.

If preserving the column temporarily simplifies application compatibility during cutover, it may remain as a compatibility column fixed to `true`; it must not imply a dependency on PonteImprese.

### 5.1 Content authors

The historical table can point to `profiles`, `businesses` and `professional_profiles`, but it already supports an opaque `display_label`.

Current data has zero `content_authors` rows.

Standalone model:

- keep `content_authors` as an owned child of `contents`;
- keep `role_kind`, `display_label`, `is_primary`, `sort_order`, `attribution_note`;
- replace commercial identity FKs with an optional local `editorial_account_id` only when the author is a known redaction account;
- allow a non-blank `display_label` for external authors, institutions or contributors.

This avoids importing `profiles`, `businesses` or `professional_profiles` solely for attribution.

### 5.2 Content subject links

Current `content_subject_links` count is zero.

Do not reproduce its old FKs to PonteImprese subjects. If structured subject tagging is needed later, introduce a local editorial subject vocabulary or an explicit external-reference model in a later migration.

### 5.3 Cross-product links

Current counts are all zero for:

- `content_opportunity_links`
- `content_service_links`
- `content_market_links`
- `content_event_links`

Decision:

- `content_event_links` remains local because both sides belong to ImmigratiImprenditori;
- direct FK tables to PonteImprese opportunities/services/markets are **not** part of the standalone baseline;
- future cross-product references must use an integration-safe contract (product + entity kind + stable external key/URL), not a Postgres FK across projects.

## 6. Events redesign for standalone ownership

The historical events aggregate depended on:

- `profiles` and `businesses` as owners;
- optional `opportunities` and `service_offers` context FKs;
- later editorial ownership/provenance additions.

Current data has zero events and zero editions.

Standalone event design:

- make editorial custody native; no FK to PonteImprese person/business owners;
- preserve `event_types`, title/summary/description, delivery/audience/economic metadata and publication lifecycle;
- preserve final external-source/provenance columns (`source_url`, `source_label`, `external_source_code`, `external_id`, `canonical_url`, `external_natural_key`, `acquisition_fingerprint`, acquisition/source timestamps, internal notes);
- preserve final editorial dedupe indexes;
- replace `context_opportunity_id` and `context_service_offer_id` FKs with optional opaque cross-product reference fields only if current application code requires the UI affordance. No DB FK to PonteImprese.

`S2-GATE-EVENTI` is therefore resolved to ImmigratiImprenditori physical ownership.

### 6.1 Event organizers

Historical organizers could reference person/business FKs or `display_label`.

Standalone:

- keep event/edition ownership FKs;
- use `display_label` as the primary external organizer representation;
- optional `editorial_account_id` may be used for a local staff member;
- do not import PonteImprese `profiles` or `businesses`.

### 6.2 Event speakers

Historical speakers could reference `profiles`, `professional_profiles` or `display_label`.

Standalone:

- keep edition/session FKs;
- keep `role_kind`, `display_label`, order metadata;
- optional `editorial_account_id` only when appropriate;
- no FK to PonteImprese professional/person tables.

### 6.3 Event market links

A direct FK to PonteImprese `international_markets` must not exist in the standalone database. If market classification is still useful editorially, use either:

- an independent local editorial geography/market vocabulary, or
- an opaque external market key.

Because current `event_markets` count is zero, no historical data blocks this redesign.

## 7. Observatory

Include:

- `observatory_indicators`
- `observatory_statistical_sources`
- `observatory_indicator_values`

Preserve source/provenance, publication state, supersession/revision semantics, quality code, territory/country dimensions and optional local `business_sector_id`.

Preserve the dedicated observatory ingestion-writer capability, but regenerate grants for the new project rather than copying role state blindly from the shared database.

Current data to preserve:

- indicators = 1, published;
- statistical sources = 1;
- indicator values = 6, all `final` and published;
- values cover 2021, 2022 and 2023 for national/foreign dimensions in Italy;
- no current value references `business_sectors`.

## 8. Explicit exclusions

The standalone baseline must not create or depend on:

- `businesses` or any `business_*` operational tables, except the independent local catalog `business_sectors`;
- `business_memberships*`;
- `professional_*`;
- `opportunities` / `opportunity_*`;
- `service_*`;
- `international_market*` / international commercial operational tables;
- `organizations` / `organization_*`;
- `collaborations`;
- training marketplace tables;
- PonteImprese `accounts`, business-management helpers, self-delete business reassignment machinery, or legal-retention tables unless a later local requirement explicitly justifies an equivalent.

No local RLS policy/function/trigger may require excluded objects.

## 9. RLS model

RLS must be regenerated around only four concepts:

1. anonymous public reader;
2. authenticated active editorial account;
3. editor;
4. admin.

Expected behavior:

- public SELECT only for published/public content and events;
- observatory public SELECT only for published indicator/value/source states as intended;
- editors can create/update editorial records;
- admins can perform privileged editorial/account actions;
- ingestion writer has only the minimum required rights;
- no policy calls PonteImprese access helpers.

The old `create_access_contenuti_rls`, `create_access_osservatorio_rls`, event access policies and mixed opportunity/market editorial helpers are historical evidence only. They must not be replayed verbatim.

## 10. Data migration set from the current shared project

Preserve exactly the current non-empty product data:

- `contents`: 18 total = 17 published + 1 unpublished;
- all 18 contents are editorial and language-linked;
- `content_authors`: 0;
- content subject/tag/cross-domain link tables: 0 where currently empty;
- `events`: 0;
- all event child tables: 0;
- `observatory_indicators`: 1 published;
- `observatory_statistical_sources`: 1;
- `observatory_indicator_values`: 6 final/published;
- local catalog copies required by the final baseline, including languages and business sectors, reseeded deterministically.

Preserve existing content and observatory UUIDs so URLs/references and provenance remain stable.

## 11. Auth gate

The current shared project has one Auth user, but that does **not** automatically mean the same login must be copied into both products without an explicit decision.

`CS-AUTH-01` must decide whether the current operator account is:

- migrated/recreated in the new ImmigratiImprenditori Auth project; or
- replaced with a fresh editorial invite/admin bootstrap.

Do not generic-SQL-copy the Supabase `auth` schema.

Acceptance:

- at least one controlled admin account exists before editorial cutover;
- editor/admin role assignment works;
- old PonteImprese account/business-management tables are absent;
- no duplicate/uncontrolled Auth identity is produced.

## 12. Baseline construction layers

Produce a fresh standalone baseline in deterministic layers:

1. extensions/foundation;
2. local catalogs (`languages`, `business_sectors`, content/event catalogs);
3. local editorial identity tables;
4. content tables;
5. event tables;
6. observatory tables;
7. indexes;
8. local functions/helpers;
9. triggers;
10. RLS policies;
11. grants/revokes;
12. deterministic seeds.

Proposed final executable artifact (not created in SPLIT-3A design phase):

`supabase/migrations/00000000000000_baseline_immigratiimprenditori.sql`

## 13. Cold-start acceptance gates

A fresh empty validation project must satisfy:

- baseline applies from zero;
- no missing PonteImprese relation/function/type is referenced;
- every product table has RLS enabled;
- public content/event/observatory reads follow final visibility rules;
- editor/admin writes work and non-editors fail closed;
- event provenance/dedupe constraints compile;
- observatory ingestion writer can perform only intended operations;
- no direct DB FK points to another Supabase project.

## 14. Data-copy acceptance gates

After importing current data:

- contents = 18;
- published contents = 17;
- unpublished contents = 1;
- events = 0;
- observatory indicators = 1;
- observatory sources = 1;
- observatory values = 6;
- all six values preserve UUID, dates, numeric values, quality/status/provenance;
- every FK validates;
- no orphan rows exist;
- public routes return the same intended published records as before cutover.

## 15. SPLIT-3A output and next step

`IMMIGRATIIMPRENDITORI_BASELINE_DESIGN = READY`

Next implementation unit: assemble the final-schema object closure and create the executable baseline on a **non-production validation target first**. The current shared Supabase project remains unchanged until later migration/cutover gates.