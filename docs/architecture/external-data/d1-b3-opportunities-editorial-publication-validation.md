# D1-B.3 — Opportunities editorial review + selective publication validation

**Date:** 2026-08-13  
**Mode:** accelerata controllata  
**Baseline git (pre):** `def961e` on `main` (ahead/behind `0/0`)  
**AUTO-PUBLISH:** **NO**  
**Scheduler / email / D1-C:** **NOT STARTED**

---

## 1. Decision

`D1-B.3 OPPORTUNITIES EDITORIAL PILOT COMPLETATO — 20 OPPORTUNITÀ INCENTIVI.GOV REVISIONATE — SOLO RECORD IDONEI PUBBLICATI — QUESTIONABLE/REJECT GESTITI SENZA AUTO-PUBLISH — LISTA/DETTAGLIO/FONTE/SCADENZE VERIFICATI IN PRODUCTION — REFRESH IMPORTER NON DISTRUGGE LO STATO EDITORIALE — D1-B END-TO-END VALIDATO — AUTOMAZIONE PERIODICA FUTURA AUTORIZZABILE`

**STOP.** No scheduler; no email; no D1-C; no Unioncamere; no pilot expansion.

---

## 2. Pre-gate

| Check | Result |
|---|---|
| Branch / HEAD | `main` / `def961e` |
| origin ahead/behind | `0/0` |
| Local DB head | `20260820110000` → then `20260820120000` |
| Remote DB head | `20260820110000` → then `20260820120000` |
| Pending (pre new migration) | **0** |
| Production baseline | **20** Incentivi.gov, all review-only, **0** published |
| Dirt preserved | yes (no `git add .`) |

---

## 3. Inventory (20 pilot)

Frozen natural keys (unchanged from D1-B.1/B.2):

`1007, 118, 132, 1426, 143, 1468, 148, 1523, 156, 170, 181, 1843, 1856, 1857, 187, 2195, 225, 2309, 2350, 2512`

All present in Production with provenance, official HTTP URL (except post-verify 225 → 404), temporal labels derived, editorial `in_review` + `unpublished` + `private` at inventory time.

Sidecar: `artifacts/ingestion/d1b3-inventory-out.json`

---

## 4. Source verification

| Check | Result |
|---|---|
| Solr open-data (first 1500 docs) | all 20 nids still present |
| Official URL probe | **19/20 OK**; **225 → HTTP 404** |
| License | IODL 2.0 (unchanged) |
| Journalistic sources used | **NO** |

---

## 5. Classification (editorial)

| Grade | Count | Keys |
|---|---|---|
| **READY** | **12** | 148, 143, 1468, 2350, 2512, 1007, 118, 2195, 181, 1523, 1857, 1426 |
| **QUESTIONABLE** | **7** | 132, 156, 170, 1843, 1856, 187, 2309 |
| **REJECT** | **1** | 225 |

### REJECT rationale

- `incentivi-gov:225` Energia in Vetta — official URL 404; typical beneficiaries ski-lift operators — excluded via canonical `editorial_status=rejected` (no hard-delete).

### QUESTIONABLE rationale (remain review-only)

- Industrial bus/automotive sportelli with ambiguous current open status or overlap (132, 156, 170)
- Sports-facility credit measures needing dedicated niche review (1843, 1856)
- Niche employment tax credit (187)
- Lombardia vehicle renewal 2024-2025 without close date / possible exhausted window (2309)

Relevance was **not** narrowed to immigrant-only bandi: SME credit, R&S, export, Lombardia filiere/fiere, venture, researchers, culture energy, semiconductors included when verified.

---

## 6. Editorial copy + field control

| Axis | Fields |
|---|---|
| SOURCE-CONTROLLED | title, substantial_status, official URL, authority, territories, time windows, provenance (`reference_text` incl. `source_summary_sha`) |
| EDITORIAL-CONTROLLED | summary (after human edit), description, purpose, editorial/publication/visibility |

READY rows received human short summaries (what / who / offer / territory / deadline-status) without invented amounts/requirements. Purpose set so importer refresh cannot treat summary as source-controlled.

---

## 7. Controlled publication

| Step | Result |
|---|---|
| First publish only | `incentivi-gov:148` Fondo di Garanzia PMI |
| Immediate anon verify | title/summary/issuer/territory/deadline/URL visible via RLS |
| Continue READY | remaining 11 published |
| Final published | **12** |
| Review-only (QUESTIONABLE) | **7** |
| Rejected excluded | **1** |
| Auto-publish | **false** |

### Schema follow-up (required for public CTA)

Migration `20260820120000_opportunity_sources_public_select.sql`:

- GRANT SELECT on `opportunity_sources` to `anon`/`authenticated`
- Policy `opportunity_sources_select_public` using `access_opportunity_is_public_published()`
- No write widening

Applied local + linked remote. Heads: **`20260820120000`**, pending **0**.

### Public UI

`/opportunita` list cards and `/opportunita/[id]` detail now show ente, territorio, scadenza/sportello, fonte (Incentivi.gov), CTA ufficiale. Home opportunity teaser includes source/territory/temporal meta.

Editorial queue filters: Da revisionare / Pubblicate / Escluse·respinte / Ritirate. Reject action: `rejectEditorialOpportunity` → `editorial_status=rejected`.

---

## 8. Importer regression (critical)

| Check | Result |
|---|---|
| Dry-run | fetched 1500 / selected 20 / dbWrites 0 (dry-run does not load existing fingerprints → would-insert counts are not post-state) |
| Careful apply | inserted **0**, updated **0**, unchanged **20**, duplicates **0**, dbWrites **0** |
| Published stay published | **12** |
| Rejected stay rejected | **1** |
| Review-only stay review-only | **7** |
| Editorial summaries preserved | **YES** (all 20) |
| IDs / external IDs stable | **YES** |
| Forced published→review-only | **NO** |

CLI gate updated: after D1-B.3, `publishedCount > 0` is allowed; only `autoPublish` must remain false.

Sidecar: `artifacts/ingestion/d1b3-importer-regression-out.json`

---

## 9. Tests

| Suite | Result |
|---|---|
| `npm test` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors) |
| `npm run build` | PASS |
| E2E editorial opportunities | extended: publish/withdraw, exclude filter, public hides drafts, access control |

---

## 10. Scheduler readiness

| Item | Status |
|---|---|
| D1-B E2E (ingest → review → selective publish → refresh-safe) | **VALIDATED** |
| Periodic automation | **AUTHORIZABLE later** (not enabled) |
| Cron / email / recurring job | **NOT created** |

---

## 11. Git

Selective commit of D1-B.3 app/docs/migration (no `git add .`; pre-existing dirt preserved). Production content edits are data-only on linked Supabase.

---

## 12. Findings

### Blocking

None at STOP.

### Important

- Public source CTA required new least-privilege SELECT policy on `opportunity_sources`.
- Ingest CLI gate from D1-B.2 had to be relaxed so human-published rows do not fail apply exit.
- 7 QUESTIONABLE remain intentional human backlog.

### Non-blocking

- Some official URLs are PDF / home-page landing pages (still HTTP-ok).
- Dry-run without DB fingerprints still reports would-insert; apply is the authoritative idempotency check.
