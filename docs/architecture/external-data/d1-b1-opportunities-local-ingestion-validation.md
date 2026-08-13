# D1-B.1 — Opportunities local ingestion validation

**Date:** 2026-08-13
**Mode:** accelerata controllata
**Baseline git:** `d2c9b1e` on `main` (ahead/behind `0/0`)
**AUTO-PUBLISH:** **NO**
**Remote apply / Production write:** **NO**

---

## 1. Decision

`D1-B.1 OPPORTUNITIES LOCAL PILOT COMPLETATO — MIGRATION APPLICATA SOLO LOCALE — 20 OPPORTUNITÀ INCENTIVI.GOV IMPORTATE IN REVIEW-ONLY — PROVENANCE / IDEMPOTENZA / DEADLINE / STATUS VERIFICATI — NESSUNA OPPORTUNITÀ AUTO-PUBBLICATA — NESSUNA SCRITTURA PRODUCTION — D1-B.2 REMOTE APPLY + CONTROLLED PRODUCTION PILOT AUTORIZZABILE`

**STOP.**

---

## 2. Pre-gate

| Check | Result |
|---|---|
| Git HEAD / origin | `d2c9b1e` / `0/0` |
| Local pending pre | `20260820100000` only |
| Remote pending | `20260820100000` (not applied remotely) |
| Unexpected pending | none |
| Docker/Supabase local | UP (`127.0.0.1:54321`) |
| Dirt preserved | yes (incl. legal/app artifacts / `.gitignore`) |

---

## 3. Local migration apply

| Item | Result |
|---|---|
| Command | `npx supabase migration up --local` |
| Applied | `20260820100000_prepare_opportunity_external_ingestion.sql` only |
| Local head | `20260820100000` |
| Remote head | still `20260819100000` (D1-B migration remote empty) |

### Schema validation

| Object | Present |
|---|---|
| Unique index `opportunity_sources_active_external_identifier_uidx` | YES |
| `service_role` SIU on opportunities / sources / time_windows / market_references | YES |
| `service_role` DELETE | NO |
| Editor RLS SELECT/UPDATE on AR + owned tables | YES |
| anon INSERT/UPDATE on opportunities | NO |

---

## 4. Security regression

| Role | Observation |
|---|---|
| anon | no insert/update; public SELECT still published+public only |
| authenticated ordinary | party policies unchanged; cannot publish imported private rows without being party/editor |
| editor | additive SELECT/UPDATE via `access_is_editor()` for review |
| service_role writer | SIU only (ingestion path) |
| Ordinary publish bypass | NO — imported rows `unpublished` + `private`; coherence CHECK blocks public without published |

---

## 5. First local ingestion (live Incentivi.gov)

| Metric | Run 1 (post-fix sync) | Idempotent re-run |
|---|---|---|
| fetched | 1500 | 1500 |
| validated | 20 | 20 |
| rejected | 1480 | 1480 |
| selected | 20 | 20 |
| inserted | 20 (initial) / +4 refill after cleanup | 0 |
| updated | 0 | 0 |
| unchanged | — | **20** |
| errors | [] | [] |
| review-only | **20** | **20** |
| published | **0** | **0** |
| duplicates | 0 | 0 |

Natural key: `incentivi-gov:<nid>`.

License/attribution: IODL 2.0 / “Fonte: Incentivi.gov.it — Open Data (IODL 2.0)”.

---

## 6. Correction made during D1-B.1

**Bug:** `selectPilotOpportunities` used `reason.includes(naturalKey)`, so keys like `incentivi-gov:184` matched `…:1843` and pulled expired/non-selected rows.

**Fix:** exact key extraction from dry-run reasons (no prefix `includes`).

**Cleanup:** deleted false-positive rows `184`, `185`, `230`, `142`; re-applied to restore clean **20** active/recent pilot rows. Added regression test for prefix collision.

---

## 7. Provenance / quality

All 20:

- non-blank title
- official `http(s)` URL
- external_identifier present & unique
- `consulted_at` set
- IODL attribution + checksum in `reference_text`
- authority present
- summary present
- territory row(s) present
- access time window present
- `origin=external`, `editorial_status=in_review`, `publication_status=unpublished`, `visibility_level=private`

---

## 8. Deadline / status

| Aspect | Result |
|---|---|
| Source status vs derived temporal | temporal derived from opens/closes/now (`note=temporal_derived=…`); substantial stays `announced` for active pilot |
| Open / ongoing | 20 derived open_or_ongoing (12 open-ended, 8 with future/ongoing deadline) |
| Scheduled | 0 in this pilot sample |
| Expired in final pilot | **0** |
| Missing deadline | `open_ended=true`, `closes_at=null` (12) |

---

## 9. Idempotency / update / drift

| Test | Result |
|---|---|
| Second apply | inserted 0 / updated 0 / unchanged 20 |
| Update simulation | same canonical id; no duplicate active source; provenance URL preserved; still unpublished; rolled back |
| Source drift | schema assert throws on missing `response.docs` / API error |

---

## 10. Editorial queue / public UI

| Check | Result |
|---|---|
| Redazione Opportunità UI | **GAP** — no `/app/redazione/opportunita`; editor can SELECT/UPDATE via RLS but no dedicated queue page |
| Public visibility (anon) | **0** of the 20 pilot ids visible |
| Auto-publish | NO |

---

## 11. Gates

| Gate | Result |
|---|---|
| npm test | 210 pass |
| typecheck | pass |
| lint | 0 errors (1 pre-existing warning) |
| build | pass |
| Commit / push | **NO** |

---

## 12. Next step (human GO)

~~**D1-B.2** — remote apply of `20260820100000` + controlled Production review-only pilot~~ → **DONE** — see `d1-b2-opportunities-production-pilot-validation.md`.
