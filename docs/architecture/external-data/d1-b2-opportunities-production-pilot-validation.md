# D1-B.2 — Opportunities Production review-only pilot validation

**Date:** 2026-08-13
**Mode:** accelerata controllata
**Baseline git (pre-commit):** `d2c9b1e` on `main` (ahead/behind `0/0`)
**AUTO-PUBLISH:** **NO**
**Pilot publish of the 20:** **NOT DONE** (STOP)

---

## 1. Decision

`D1-B.2 OPPORTUNITIES PRODUCTION PILOT COMPLETATO — MIGRATION APPLICATA LOCALE/REMOTO — 20 OPPORTUNITÀ INCENTIVI.GOV IMPORTATE IN PRODUCTION REVIEW-ONLY — PUBBLICO ANCORA ZERO — CODA REDAZIONALE OPERATIVA — PROVENANCE / IDEMPOTENZA / DEADLINE VERIFICATE — PRIMA REVIEW/PUBBLICAZIONE EDITORIALE AUTORIZZABILE`

**STOP.** Non pubblicare le 20; non scheduler; non email; non D1-C; non Unioncamere.

---

## 2. Pre-gate

| Check | Result |
|---|---|
| Git HEAD / origin | `d2c9b1e` / `0/0` |
| Local head | `20260820100000` |
| Remote head (pre) | `20260819100000` |
| Remote pending (pre) | **only** `20260820100000` |
| Dirt preserved | yes |

---

## 3. Remote migration

| Step | Result |
|---|---|
| Remote dry-run | pending **only** `20260820100000` |
| Apply | `npx supabase db push --linked` (`20260820100000`, then `20260820110000`) |
| Local head | `20260820110000` |
| Remote head | `20260820110000` |
| Pending | **0** |
| Follow-up | `20260820110000_fix_opportunity_rls_recursion_for_editorial.sql` — breaks opportunities ↔ party_references RLS recursion so editor SELECT works; editor policies also allow application admin |

### Schema / ACL (remote spot-check)

| Check | Result |
|---|---|
| Unique natural key `opportunity_sources_active_external_identifier_uidx` | YES |
| Provenance columns / sources / time windows | YES |
| Review lifecycle axes reused | YES |
| `service_role` SIU | YES |
| `service_role` DELETE | NO |
| anon write | NO |
| Ordinary publish bypass | NO |
| Editor RLS SELECT/UPDATE | YES (`access_is_editor()`) |

---

## 4. Source reverify

| Item | Result |
|---|---|
| Open-data page | https://www.incentivi.gov.it/it/open-data |
| License | **IODL 2.0** (unchanged) |
| Endpoint | portal Solr `/solr/coredrupal/select` |
| Schema drift | none (assert pass) |
| Pilot filters | **FROZEN** (theme + Lombardia/nazionale; exclude expired; max 20) |

---

## 5. Production import

| Metric | Dry-run | Apply #1 | Apply #2 (idempotent) |
|---|---|---|---|
| fetched | 1500 | 1500 | 1500 |
| validated / selected | 20 | 20 | 20 |
| rejected | 1480 | 1480 | 1480 |
| inserted | 20 (would) | **20** | **0** |
| updated | 0 | 0 | 0 |
| unchanged | 0 | 0 | **20** |
| dbWrites | 0 | 20 | 0 |
| errors | [] | [] | [] |
| review-only | — | **20** | **20** |
| published | 0 | **0** | **0** |
| autoPublish | false | false | false |

### Pilot freeze — natural keys (same as D1-B.1 local)

`1007, 118, 132, 1426, 143, 1468, 148, 1523, 156, 170, 181, 1843, 1856, 1857, 187, 2195, 225, 2309, 2350, 2512`

Set **identical** to local D1-B.1 post-cleanup pilot (no filter change).

### Post-validate

| Check | Result |
|---|---|
| uniqueKeys | 20 |
| missingUrl | 0 |
| reviewOnly | 20 (`in_review` + `unpublished` + `private` + `origin=external`) |
| published | 0 |
| anon `publicVisibleImported` | **0** |

---

## 6. Public visibility

| Surface | Imported pilot visible |
|---|---|
| anon RLS on `opportunities` (ids of 20) | **0** |
| `/opportunita` / home (any session) | explicit `published`+`public` filter in public data layer (defense-in-depth vs editor RLS) |
| sitemap | only published public entities (unchanged) |

**Finding fixed in D1-B.2:** editor/admin RLS SELECT on all non-deleted opportunities would otherwise leak drafts into public pages when a redattore session browsed `/opportunita`. Public queries now filter explicitly.

---

## 7. Editorial UI

| Item | Result |
|---|---|
| Routes | `/app/redazione/opportunita`, `/app/redazione/opportunita/[id]` |
| Access | `requireEditor` / `requireEditorSession`: **redattore OR application admin** |
| Ordinary deny | yes → `/app/forbidden` |
| List fields | title, source, issuer, territory, open/deadline, temporal, retrieved/source update, editorial status, official link, Apri |
| Filters | Da revisionare / Pubblicate / Ritirate; origine; temporale |
| Detail | imported fields + provenance + editorial-only edit |
| Publish action | present; **not used on the 20 real rows** |
| External vs user-created | “Da fonte esterna” / “Creata nella rete” |
| Deadline UX | In apertura / Aperta / In scadenza / Scaduta / Senza scadenza |
| Source vs editorial | refresh updates source fields; human-edited summary preserved via `source_summary_sha` |

### Field control

| Source-controlled | Editorial-controlled |
|---|---|
| title, substantial_status, official URL, authority, territories, time windows, provenance | summary (after human edit), description, purpose, editorial/publication/visibility |

---

## 8. Pilot quality (post-import classification)

| Grade | Count |
|---|---|
| READY | **20** |
| QUESTIONABLE | **0** |
| REJECT | **0** |

Aggregate reject/questionable reasons: none (all have HTTP official URL, authority, territory, non-thin summary, non-expired temporal).

---

## 9. Gates

| Gate | Result |
|---|---|
| npm test | **215 pass / 0 fail** |
| typecheck | pass |
| lint | 0 errors (1 pre-existing warning) |
| build | pass |
| E2E (editorial-opportunities) | **2 pass** — redazione access, ordinary deny, public excludes draft, fixture publish+withdraw |

---

## 10. Git

Selective stage of D1-B files only (no `git add .`). Pre-existing dirt preserved (`.gitignore`, legal drafts, application deployment report, artifacts noise).

Suggested message: `data(opportunities): add production review-only ingestion`

---

## 11. Explicit non-goals (STOP)

- No publish of the 20 Production rows
- No scheduler / email notifications
- No D1-C / Unioncamere / Persone / Imprese / Professionisti expansion
