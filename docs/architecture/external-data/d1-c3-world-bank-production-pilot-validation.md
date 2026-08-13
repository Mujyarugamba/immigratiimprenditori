# D1-C.3 — World Bank Production review-only pilot validation (Mercati)

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-C.3 INTERNATIONAL MARKETS PRODUCTION REVIEW-ONLY PILOT  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**STOP sessione:** nessun publish delle 15; nessun auto-publish; nessuna migration create/apply; nessun ICE ingest; nessun scheduler/cron/email; nessun D1-D / Unioncamere

---

## 1. Esito

**PASS** — same pilot IT/DE/FR × 5 indicatori WB portato in **Production** come **15** support resources `in_review` / `editorial` / `signaled`.  
Pubblico = **0**; idempotenza; provenance; country/indicator integrity; anon invisibility: **PASS**.  
UI redazione Mercati: **GAP** (RLS manca editor SELECT su review-only) — documentato; nessuna migration creata.  
Data-path editoriale (assi + publish axes) verificato; **D1-C.4 editorial review + selective publication autorizzabile** (include GO su policy SELECT editor).

---

## 2. Baseline pre-gate

| Voce | Valore |
|---|---|
| Branch | `main` |
| HEAD (pre) | `c7dc53762947e3597fc57861df139d01011c31fb` |
| origin/main | = HEAD |
| Ahead/behind | `0 / 0` |
| DB local head | `20260820120000` |
| DB remote head | `20260820120000` |
| Pending migrations | **0** |
| Schema | **CASE A** — no migration needed / none created |
| Dirt preesistente | Preservata (no `git add .`) |

### Uncommitted D1-C inventory (pre-stage)

Pertinent: `src/lib/external-data/worldbank/*`, `src/lib/external-data/natural-key.ts`, `scripts/external-data/*worldbank*`, D1-C docs/source-notes/roadmap, apply/dry manifests WB, `artifacts/ingestion/d1c3-prod-ingest.mjs`.  
Non-D1-C dirt (legal, eurostat/incentivi artifacts, `.gitignore`, …) **non** staged.

---

## 3. Contract freeze (invariato)

| Parametro | Valore |
|---|---|
| Countries | **IT, DE, FR** (exactly 3) |
| Indicators | `SP.POP.TOTL`, `NY.GDP.MKTP.CD`, `NY.GDP.MKTP.KD.ZG`, `NY.GDP.PCAP.CD`, `NE.TRD.GNFS.ZS` |
| Period / selection | fetch `2022:2024`; map latest non-null year (**2024**) |
| Natural key | `worldbank:{indicator_code}:{country_iso2}:{year}` |
| Target | `international_market_support_resources` (M1) |
| Editorial axes | `verification_status=in_review`, `visibility_status=editorial`, `substantial_status=signaled` |
| AUTO-PUBLISH | **NO** |
| ICE | **LINK_ONLY** (0 rows ingested) |

---

## 4. Docs / importer re-read

- `d1-c-markets-population-block-determination.md`
- `d1-c1-world-bank-pilot-dry-run-validation.md`
- `d1-c2-world-bank-local-pilot-validation.md`
- `src/lib/external-data/worldbank/indicators.ts` + `apply-indicators.ts`
- Scripts dry-run / ingest

---

## 5. Local reverify (pre-Production)

| Check | Result |
|---|---|
| Local WB rows | **15** |
| Lifecycle | 15× `in_review` + `editorial` + `signaled` |
| Public | **0** |
| Second local apply | inserted=0, updated=0, unchanged=15, dbWrites=0 |
| Local dry-run post | wouldInsert=0, wouldUpdate=0, unchanged=15, dbWrites=0 |

---

## 6. Production schema parity

| Check | Result |
|---|---|
| Migration heads local/remote | `20260820120000` / `20260820120000` |
| Pending | **0** |
| CASE | **A** |
| Migration create/apply this session | **0** |
| Objects used by writer | `international_markets`, `international_market_countries`, `international_market_support_resources` — present |
| `service_role` SIU on Mercati (remote) | **YES** (hosted ACL already includes SELECT/INSERT/UPDATE; also broader DELETE/TRUNCATE — **not widened** here; no revoke migration) |
| D1-C-M1 privilege migration | **NOT created** (not required — SIU already present) |
| Anon write | NO |

---

## 7. Live WB reverify

| Check | Result |
|---|---|
| API endpoints (5) | HTTP **200** |
| Schema `[meta, data[]]` | Compatible |
| Indicator IDs / semantics | Unchanged |
| Mapping / natural key | Unchanged |
| Mid-session value revisions | None breaking (idempotent unchanged after apply) |

---

## 8. Production dry-run (pre-write)

Harness: `node artifacts/ingestion/d1c3-prod-ingest.mjs dry-run`  
(credentials via linked project api-keys; **never printed/stored**)

| Metric | Value |
|---|---:|
| targetUrl | `https://hvfvfatlaspcpszgizhg.supabase.co` |
| fetched | 45 |
| validated | 15 |
| rejected | 0 |
| wouldInsert | 15 |
| wouldUpdate | 0 |
| unchanged | 0 |
| dbWrites (resources) | **0** |
| autoPublish | false |
| grantProbe | ok |

**Note:** first Production dry-run accidentally passed `--ensure-local-catalog` and seeded drafting markets `it`/`de`/`fr` (catalog was empty). Harness fixed afterward so dry-run never seeds; apply keeps catalog ensure. Markets remain `editorial_status=drafting` (non-public).

---

## 9. Credential / least-privilege gate

| Check | Result |
|---|---|
| Pattern | D1-B.2 / D1.3A-1b — linked Supabase `service_role` via CLI api-keys |
| Secrets in repo / logs | **NO** |
| Client credentials to bypass RLS | **NO** |
| Grant widening | **NO** |
| `--allow-production` required | **YES** (hard refuse otherwise) |

---

## 10. Production write (apply #1)

| Metric | Value |
|---|---:|
| inserted | **15** |
| updated | 0 |
| unchanged | 0 |
| rejected / errors | 0 / 0 |
| reviewOnlyCount | **15** |
| publishedCount | **0** |
| duplicates | 0 |
| dbWrites | 15 |
| ICE ingested | **0** |

Sidecar: `artifacts/ingestion/apply-worldbank-indicators-2026-08-13T15-28-17-603Z/manifest.json`

---

## 11. Review-only / AUTO-PUBLISH gate (Production)

| Axis | Expected | Observed |
|---|---|---|
| verification_status | `in_review` | **15/15** |
| visibility_status | `editorial` | **15/15** |
| substantial_status | `signaled` | **15/15** |
| public | 0 | **0** |
| confirmed | 0 | **0** |
| autoPublish | false | **false** |

**BLOCKING auto-publish:** non scattato.

---

## 12. DB validation / duplicates

15/15: source worldbank, country ISO2, indicator, period 2024 in name/summary, value+unit in summary, provenance in `contact_note`, review-only axes. Unique natural keys = 15. Duplicates = 0.

---

## 13. Country / indicator integrity

| country_ref | market code | market editorial | dup IT/Italia/ISO3 |
|---|---|---|---|
| IT | `it` | drafting | none |
| DE | `de` | drafting | none |
| FR | `fr` | drafting | none |

Indicators: exact 5 allowlist IDs; units in summary (`persons`, `current US$`, `percent (annual growth)`, `current US$ per person`, `percent of GDP`).

---

## 14. Provenance completeness

**15/15** `contact_note` contain: `natural_key`, `source`, `dataset`, `indicator`, `api`, `retrieved_at`, `license=CC BY 4.0`, `attribution=World Bank`, `checksum` + sidecar P-D.

---

## 15. Idempotency (apply #2)

| Metric | Value |
|---|---:|
| inserted | **0** |
| updated | **0** |
| unchanged | **15** |
| dbWrites | **0** |
| duplicates | 0 |

---

## 16. Post-write dry-run

| Metric | Value |
|---|---:|
| wouldInsert | **0** |
| wouldUpdate | **0** |
| unchanged | **15** |
| dbWrites | **0** |

No mid-session WB revision requiring UPDATE observed.

---

## 17. Public anon Production visibility = 0

| Surface | Pilot visible |
|---|---:|
| anon `international_markets` codes it/de/fr | **0** (drafting) |
| anon WB `international_market_support_resources` | **0** (editorial) |
| Mercati pages / country pages / home (RLS) | **0** |
| Public APIs / search relying on same RLS | **0** |

---

## 18. Editorial workflow inventory

| Step | Stato |
|---|---|
| `/app/redazione` sections | Opportunità / Osservatorio / Contenuti / Organizzazioni — **no Mercati** |
| Routes `mercati-internazionali` | **MISSING** |
| Editor RLS SELECT on review-only markets / support_resources | **MISSING** — only public SELECT when `visibility_status=public` ∧ market `published` |
| Editor INSERT/UPDATE policies | Present (`access_is_editor`) |
| Build minimal UI without migration | **NOT DOABLE** — session client would see 0 review rows (security-boundary forbids service_role in editorial) |
| Data path for later review/publish | **READY** — axes + importer refresh preserves editorial axes on UPDATE |
| Fixture publish path | SQL UPDATE visibility/verification possible; **no real publish of the 15** |

**D1-C.4 prerequisite (non creato qui):** tiny RLS migration adding editor/admin SELECT on Mercati tables for non-public rows + minimal redazione UI.

---

## 19. Human readability / quality (NOT publication)

| Class | Count | Note |
|---|---:|---|
| READY | **15** | Label IT in summary, year, value, unit, WB URL, provenance |
| QUESTIONABLE | 0 | — |
| REJECT | 0 | — |

Primary copy uses platform labels + year + unit (not UUID / raw WB IDs as UI headline). Codes remain in provenance note only.

---

## 20. Editorial preservation under refresh

Importer UPDATE path writes **content/provenance only**; does **not** overwrite `verification_status` / `visibility_status` / `substantial_status`. Future human publish not silently reset.

---

## 21. ICE

Ingestion ICE = **0**. Policy LINK_ONLY (`https://www.ice.it/` contract note only).

---

## 22. Tests / quality gates

| Gate | Result |
|---|---|
| WB unit tests | PASS |
| `npm test` | PASS (**230**) |
| `npm run typecheck` | PASS |
| lint | PASS (0 errors; 1 unrelated warning in legal test) |
| build / E2E redazione Mercati | **not required** — no product UI shipped (RLS gap) |

---

## 23. Code / docs touched

- `src/lib/external-data/worldbank/apply-indicators.ts` — Production allow flag; catalog seed; editorial-axis preserve
- `src/lib/external-data/worldbank/apply-indicators.test.ts`
- `src/lib/external-data/worldbank/indicators.ts` (+ tests) — prior D1-C
- `src/lib/external-data/natural-key.ts` — prior D1-C
- `scripts/external-data/ingest-worldbank-indicators.ts` / `dry-run-worldbank-indicators.ts`
- `artifacts/ingestion/d1c3-prod-ingest.mjs`
- this report + roadmap / source-notes / D1-C.* next-gate updates

---

## 24. Hard stops rispettati

- Nessuna migration create/apply  
- Nessun publish delle 15 reali  
- Nessun auto-publish / public=0  
- Nessun ICE ingest  
- Nessun scheduler / cron / email  
- Nessun D1-D / Unioncamere / Persone/Imprese/Professionisti  
- Nessun `git add .`  
- Dirt non D1-C preservata  
- Nessun secret in repo/log  

---

## 25. OUTPUT FINALE (72 punti)

| # | Item | Result |
|---|---|---|
| 1 | Esito D1-C.3 | **PASS** — Production review-only pilot |
| 2 | Mode | accelerata controllata |
| 3 | Branch | `main` |
| 4 | HEAD (pre) | `c7dc53762947e3597fc57861df139d01011c31fb` |
| 5 | origin/main (pre) | = HEAD |
| 6 | Ahead/behind (pre) | `0 / 0` |
| 7 | Dirt non D1-C preservata | **SÌ** |
| 8 | DB local head | `20260820120000` |
| 9 | DB remote head | `20260820120000` |
| 10 | Pending migrations | **0** |
| 11 | Schema sufficiency | **CASE A** |
| 12 | Migration create/apply | **0** |
| 13 | Docs D1-C / C.1 / C.2 rilette | **SÌ** |
| 14 | Importer path | `worldbank/indicators` + `apply-indicators` |
| 15 | Contract countries | IT / DE / FR exactly |
| 16 | Contract indicators | same 5 WB IDs |
| 17 | Period strategy | 2022:2024 → latest non-null (**2024**) |
| 18 | Natural key | `worldbank:{code}:{iso2}:{year}` |
| 19 | Live WB reverify | PASS |
| 20 | Local WB rows still 15 review-only | **SÌ** |
| 21 | Local 2nd apply unchanged | **15** |
| 22 | Production grant SIU present | **YES** (no migration) |
| 23 | Production catalog | drafting `it`/`de`/`fr` |
| 24 | Prod dry-run fetched | 45 |
| 25 | Prod dry-run validated | 15 |
| 26 | Prod dry-run rejected | 0 |
| 27 | Prod dry-run wouldInsert | 15 |
| 28 | Prod dry-run wouldUpdate | 0 |
| 29 | Prod dry-run unchanged | 0 |
| 30 | Prod dry-run dbWrites | **0** |
| 31 | Credential pattern | linked service_role; no secrets logged |
| 32 | `--allow-production` gate | **YES** |
| 33 | Apply inserted | **15** |
| 34 | Apply updated | 0 |
| 35 | Apply unchanged (1st) | 0 |
| 36 | Apply rejected/errors | 0 / 0 |
| 37 | Review-only lifecycle | 15/15 |
| 38 | Auto-publish / public_vis | **0** |
| 39 | Confirmed verification | **0** |
| 40 | DB per-obs validation | 15/15 PASS |
| 41 | Duplicates natural key | **0** |
| 42 | Country integrity | ISO2 only |
| 43 | Indicator integrity | 5 IDs + units OK |
| 44 | Provenance completeness | **15/15** |
| 45 | Idempotency 2nd inserted | **0** |
| 46 | Idempotency updated | **0** |
| 47 | Idempotency unchanged | **15** |
| 48 | Post-write wouldInsert | **0** |
| 49 | Post-write wouldUpdate | **0** |
| 50 | Post-write unchanged | **15** |
| 51 | Post-write dbWrites | **0** |
| 52 | Anon markets visible | **0** |
| 53 | Anon WB resources visible | **0** |
| 54 | Public pages pilot visibility | **0** |
| 55 | Editorial UI Mercati | **GAP** (RLS editor SELECT missing) |
| 56 | Editorial data-path ready | **SÌ** |
| 57 | Refresh preserves editorial axes | **SÌ** |
| 58 | Human READY/QUESTIONABLE/REJECT | **15 / 0 / 0** |
| 59 | ICE ingestion | **0** |
| 60 | ICE policy | LINK_ONLY |
| 61 | npm test | PASS 230 |
| 62 | typecheck | PASS |
| 63 | lint | PASS (0 errors) |
| 64 | build / E2E Mercati UI | not required (no UI) |
| 65 | Docs D1-C.3 created | this file |
| 66 | Roadmap / notes aggiornati | SÌ |
| 67 | `git diff --check` | PASS (closeout) |
| 68 | Selective stage (no `git add .`) | SÌ |
| 69 | Commit | `21e1efbc810afa3bfe22a751a83fca9ad4f517f1` |
| 70 | Push origin/main | **YES** |
| 71 | Ahead/behind post-push | `0 / 0` |
| 72 | Next gate | **D1-C.4** editorial review + selective publication (incl. RLS editor SELECT GO) |

### Git closeout

| Voce | Valore |
|---|---|
| Commit | `21e1efbc810afa3bfe22a751a83fca9ad4f517f1` |
| Message | `data(markets): add World Bank review-only pilot` |
| Push | `origin/main` |
| Ahead/behind | `0 / 0` |

---

## 26. Decisione string

```
D1-C.3 WORLD BANK PRODUCTION REVIEW-ONLY PILOT COMPLETATO —
IT/DE/FR × 5 INDICATORI IMPORTATI IN PRODUCTION —
TUTTI REVIEW-ONLY —
PUBBLICO = 0 —
COUNTRY / INDICATOR / PERIOD / VALUE / UNIT / PROVENANCE VERIFICATI —
IDEMPOTENZA E REFRESH SICURI —
WORKFLOW REDAZIONALE VERIFICATO/RESO OPERATIVO —
NESSUNA INGESTION ICE —
D1-C.4 EDITORIAL REVIEW + SELECTIVE PUBLICATION AUTORIZZABILE
STOP.
```

**Nota operativa workflow:** data-path + assi review/publish **operativi**; UI redazione Mercati **non** shippata (richiede migration RLS editor SELECT — STOP rispettato: nessuna migration in D1-C.3). D1-C.4 deve autorizzare quella policy + UI minima + selective publish.

---

*Fine D1-C.3 Production review-only pilot validation*
