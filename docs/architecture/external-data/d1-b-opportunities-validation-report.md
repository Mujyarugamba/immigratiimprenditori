# D1-B — Opportunities ingestion validation report

**Date:** 2026-08-13
**Mode:** accelerata controllata
**Decision fork:** DB gap → migration created → **NO APPLY / NO IMPORT WRITE**

---

## 1. Baseline

### Git

| Check | Result |
|---|---|
| Branch | `main` |
| HEAD | `d2c9b1e1cb46d55be9a87e67a9359e3da44ffa5c` |
| `origin/main` | same |
| ahead/behind | `0/0` |

### DB

| Check | Local | Remote |
|---|---|---|
| Head migration | `20260819100000` | `20260819100000` |
| Pending (before D1-B file) | 0 | 0 |

### Dirt preserved (not staged by this task)

- `M .gitignore`
- `M docs/architecture/legal/legal-drafting-factual-brief.md`
- `?? artifacts/`
- `?? docs/architecture/application/application-v1-deployment-report.md`
- `?? docs/architecture/legal/l1.2-legal-review-report.md`

---

## 2. Source re-verification

| Item | Result |
|---|---|
| Open-data page | HTTP 200 |
| License | IODL 2.0 declared |
| Attribution | Required by IODL; string fixed in module/docs |
| Format | JSON/CSV open-data export |
| Endpoint | `/solr/coredrupal/select` (portal `solrEndpoint` / `opendata-export`) |
| Refresh | portal-driven; re-fetch each run |
| External ID | `zs_nid` stable |
| Official URL | `zs_field_link` or absolute catalog URL |
| License/endpoint uncertain? | **NO** → proceed |

---

## 3. Existing schema fit

| Need | Fit |
|---|---|
| AR + title/summary | YES (`opportunities`) |
| Review lifecycle | YES (`editorial_status` draft\|in_review\|approved\|rejected) |
| Publication lifecycle | YES (`unpublished`…`published`) — reuse, no parallel workflow |
| Provenance Fonte | YES (`opportunity_sources`) |
| Deadlines | YES (`opportunity_time_windows`; temporal derived) |
| Territory labels | YES (`opportunity_market_references.territory_label`) |
| Official URL | YES (`opportunity_sources.url`) |
| service_role writer SIU | **NO** (local: REFERENCES/TRIGGER/TRUNCATE only) |
| Unique active external_id | **NO** |
| Editor review RLS | **NO** (party-only; no `access_is_editor` policies) |
| Redazione Opportunità UI | **NO** dedicated queue under `/app/redazione` (gap UX, non-blocking for migration) |
| Public UI deadline/ente/fonte CTA | **PARTIAL** (title/summary/status origin only today) |

---

## 4. DB gaps → first migration

**File:** `supabase/migrations/20260820100000_prepare_opportunity_external_ingestion.sql`

Contents:

1. Partial UNIQUE `opportunity_sources_active_external_identifier_uidx`
2. REVOKE ALL + GRANT SELECT/INSERT/UPDATE for `service_role` on:
   - `opportunities`
   - `opportunity_sources`
   - `opportunity_time_windows`
   - `opportunity_market_references`
3. Additive editor SELECT/UPDATE RLS via `access_is_editor()` on the same tables

**Not in this migration:** new columns for license/retrieved_at (covered by `consulted_at` + `reference_text`/sidecar); DELETE grants; anon widening; auto-publish triggers.

### Micro-review

| Check | Verdict |
|---|---|
| Single focused migration | PASS |
| Least privilege (no DELETE) | PASS |
| No anon grant change | PASS |
| Idempotency key active-only | PASS |
| Reuses editorial/publication axes | PASS |
| No auto-publish SQL | PASS |
| Apply executed? | **NO** |
| Production write? | **NO** |

---

## 5. Importer / dry-run (no DB write)

| Artifact | Path |
|---|---|
| Module | `src/lib/external-data/incentivi-gov/opendata.ts` |
| Tests | `src/lib/external-data/incentivi-gov/opendata.test.ts` |
| CLI | `scripts/external-data/ingest-incentivi-gov-opendata.ts` (`--apply` blocked) |

`--apply` exits with code 2 until a later authorized gate.

Dry-run (live, rows=1500, pilot max 20, expired excluded):

| Metric | Value |
|---|---|
| fetched | 1500 |
| valid | 20 |
| rejected | 1480 |
| new | 20 |
| update | 0 |
| unchanged | 0 |
| would-write | 20 |
| dbWrites | **0** |
| autoPublish | **false** |
| run-level errors | 0 |

---

## 6. UI readiness

Public list/detail can already show title, summary, origin, substantial status.
**Missing for published sheets:** ente, territorio, scadenza, fonte, CTA ufficiale — follow-up UI after first review-only import (non-blocking for this STOP).

---

## 7. Human decisions required

1. **GO** to apply `20260820100000` locally
2. Authorize first **review-only** local import (still unpublished)
3. Decide whether expired-but-theme-matching measures enter the pilot queue
4. Later: editor UI for Opportunità review queue + public CTA fields

---

## 8. Decision (D1-B gate)

`D1-B OPPORTUNITIES INGESTION CONTRACT COMPLETATO — DB GAP IDENTIFICATO — PRIMA MIGRATION CREATA E MICRO-REVIEWATA — APPLY NON ESEGUITO — IMPORT NON ESEGUITO`

Superseded locally by **D1-B.1** (see `d1-b1-opportunities-local-ingestion-validation.md`): migration applied **local only**; 20 review-only rows imported; remote/Production still untouched.
