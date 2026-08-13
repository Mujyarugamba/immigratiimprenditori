# D1-B — Opportunities ingestion contract (Incentivi.gov)

**Date:** 2026-08-13
**Mode:** accelerata controllata
**Baseline git:** `d2c9b1e` on `main` (ahead/behind `0/0`)
**Migration head at start:** `20260819100000` (pending 0)
**AUTO-PUBLISH:** **NO**

---

## 1. Scope

Populate the Opportunità domain from official public open data.

| Include | Exclude |
|---|---|
| Incentivi.gov open data (IODL 2.0) | People, businesses, professionals, contacts, PII |
| Metadata + short synopsis + official URL | Journalistic primary sources |
| Review-only first ingest | Unverified bandi |
| Pilot ≤20 measures | Full catalog dump |

EU Funding & Tenders remains registry-PILOT for a later curated wave; **not** in this first D1-B importer.

---

## 2. Source (live-verified)

| Field | Value |
|---|---|
| Registry id | `incentivi-gov-opendata` |
| Open-data page | https://www.incentivi.gov.it/it/open-data (HTTP 200) |
| License | **IODL 2.0** (`http://www.dati.gov.it/iodl/2.0/`) |
| Attribution | Fonte: Incentivi.gov.it — Open Data (IODL 2.0) |
| Format | JSON / CSV via portal open-data export |
| Endpoint | Portal-configured Solr select: `https://www.incentivi.gov.it/solr/coredrupal/select` (`solrEndpoint` + `opendata-export` on the official page; same surface as “Scarica JSON/CSV”) |
| Refresh | Portal event-driven / daily-ish; re-fetch on ingest |
| External ID | `zs_nid` (Drupal node id) → natural key `incentivi-gov:<nid>` |
| Catalog size (live) | ~5888 docs |

**STOP rule:** if endpoint/license become unclear → halt ingest. Current verification: clear IODL 2.0 + official export endpoint.

---

## 3. Publication principle (reuse canonical lifecycle)

No second CMS workflow.

```
FETCH → VALIDATE → NORMALIZE → MAP → DRY-RUN
  → INGEST draft/review (origin=external)
      editorial_status = in_review
      publication_status = unpublished
      visibility_level = private
  → EDITORIAL REVIEW
  → PUBLISHED (human only) | rejected
```

Defaults on insert never set `publication_status=published` or `visibility_level=public`.

---

## 4. Field mapping

| Contract field | Destination | Notes |
|---|---|---|
| external_id | `opportunity_sources.external_identifier` | `incentivi-gov:<nid>` |
| title | `opportunities.title` | stripped HTML |
| issuing_authority | `opportunity_sources.authority` | `zs_field_subject_grant` |
| short_description | `opportunities.summary` | ≤400 chars from body; no full copy |
| beneficiary/target | — | leave unset if not structured in export |
| geography | `opportunity_market_references.territory_label` | one row per reliable region label |
| sectors/categories | review / existing catalogs only when mapping sure | ambiguous → unclassified |
| opening_date | `opportunity_time_windows.opens_at` | kind `access` |
| deadline | `opportunity_time_windows.closes_at` | high sensitivity; see §5 |
| status (temporal) | **derived** at read time | never persist “open” as substantial |
| status (substantial) | `opportunities.substantial_status` | `announced` or `closed` when expired |
| official_url | `opportunity_sources.url` (+ CTA) | `zs_field_link` or portal catalog URL |
| source | registry + authority | |
| retrieved_at | `opportunity_sources.consulted_at` | ingest time |
| source_updated_at | sidecar / source `version` text | `ds_last_update` when present |
| license | source `reference_text` / sidecar | IODL-2.0 |
| attribution | sidecar + public label | IODL attribution |
| review state | editorial + publication axes | in_review / unpublished |

Do not invent missing structured fields.

---

## 5. Deadline / temporal model

Temporal access state is **derived** from:

1. source close date (`zs_field_close_date`)
2. source open date (`zs_field_open_date`)
3. current time
4. later source updates / reopen (new window row + `superseded_at` on prior)

| Derived state | Rule |
|---|---|
| `expired` | `closes_at < now` |
| `scheduled` | `opens_at > now` |
| `open_or_ongoing` | opened (or unknown open) and not past deadline |
| `unknown` | no usable dates |

Never show “aperto” only because the record was open at first import. Recompute on read/refresh.

Missing deadline → `open_ended=true` on the time window (no fabricated close).

Official URL must remain reachable from the sheet after publish.

---

## 6. Natural key / idempotency

- Natural key: **`incentivi-gov:<nid>`** (`sourceSystem + external_id`)
- DB enforcement (migration): unique active `opportunity_sources.external_identifier`
- Retry → no duplicates
- Same key with changed checksum → **UPDATE** canonical opportunity (+ refresh source/windows); editorial stays review/unpublished unless already published (human-controlled)

---

## 7. Provenance (required)

Every imported opportunity must retain:

- source system (`incentivi-gov-opendata`)
- dataset/API (portal open-data Solr export)
- external_id / natural key
- official_url
- retrieved_at (`consulted_at`)
- source_updated_at when available
- license IODL 2.0
- attribution string

No import without provenance.

---

## 8. Copyright handling

IODL 2.0 permits reuse with attribution.

Pilot practice (conservative):

- title
- structured metadata
- short synopsis (≤400 chars)
- link to official page / act

Do **not** copy long protected body text wholesale into `description`.

---

## 9. Pilot filter

Max **20** opportunities, priority themes:

- imprenditoria / investimenti / digitalizzazione / internazionalizzazione / formazione-competenze / cultura-creative when relevant
- geography: Lombardia and/or nazionale (all regions / Italia)

Do **not** filter only on “immigrati”.

---

## 10. Classification

Map to existing opportunity catalogs only when reliable. Otherwise leave unclassified / review required.

---

## 11. Security

- Writer is server-side only (`service_role` via Node script)
- No privileged credentials in the browser
- Least privilege: SELECT/INSERT/UPDATE on ingest tables; no DELETE; no anon grant widening

---

## 12. Validation

Fail loudly on:

- schema drift (missing `response.docs`)
- malformed dates/URLs
- missing nid/title/url
- duplicate natural keys in batch
- pilot max exceeded (extra rows rejected, not written)

---

## 13. Stale / closed policy

| Case | Handling |
|---|---|
| expired | temporal expired; substantial may be `closed`; not shown as open |
| closed/revoked at source | map substantial `closed` / `revoked` when explicit; else review |
| withdrawn (platform) | existing `publication_status=withdrawn` after human publish cycle |
| unknown | keep unpublished until editorial clarifies |

History is preserved (no hard delete required).

---

## 14. Importer architecture

```
scripts/external-data/ingest-incentivi-gov-opendata.ts
  → fetchIncentiviGovOpenData()
  → dryRunIncentiviGov() / mapIncentiviGovDoc()
  → (future) apply review-only writes after migration GO
```

Module: `src/lib/external-data/incentivi-gov/opendata.ts`
Pattern reuse: D1.3A Eurostat dry-run counts + sidecar artifacts.

---

## 15. DB gap → first migration

Schema fit is **partial**. Blocking gaps:

1. `service_role` lacks SELECT/INSERT/UPDATE on opportunity ingest tables (local ACL: REFERENCES/TRIGGER/TRUNCATE only)
2. No UNIQUE on active external identifiers
3. No editor RLS for unpublished external review queue

Migration (created, **not applied**):

`supabase/migrations/20260820100000_prepare_opportunity_external_ingestion.sql`

---

## 16. Decision

`D1-B OPPORTUNITIES INGESTION CONTRACT COMPLETATO — DB GAP IDENTIFICATO — PRIMA MIGRATION CREATA E MICRO-REVIEWATA — APPLY NON ESEGUITO — IMPORT NON ESEGUITO`

**STOP.** Next exact step after human GO: apply `20260820100000` locally → dry-run verify → review-only local import (still AUTO-PUBLISH=NO).
