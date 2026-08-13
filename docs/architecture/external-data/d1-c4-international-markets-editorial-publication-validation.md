# D1-C.4 — International markets editorial review + selective publication

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-C.4 INTERNATIONAL MARKETS EDITORIAL REVIEW + SELECTIVE PUBLICATION  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**STOP sessione:** nessun pilot expansion; nessun ICE ingest; nessun scheduler/cron/email; nessun D1-D / Unioncamere; nessun cambio Persone/Imprese/Professionisti

---

## 1. Esito

**PASS** — editor/admin SELECT RLS + minimal redazione Mercati; **15** World Bank observations revisionate; **15 READY** pubblicate (0 QUESTIONABLE / 0 REJECT dopo quality review); anon vede solo public; refresh preserva assi editoriali; no auto-publish; ICE=0.  
Hosting Next.js Production **non configurato** (gap preesistente L1 deploy) — presentazione pubblica verificata a livello **RLS/data** + build routes; UI redazione shippata in repo.

---

## 2. Baseline pre-gate

| Voce | Valore |
|---|---|
| Branch | `main` |
| HEAD (pre) | `6f285c9` |
| origin/main | = HEAD |
| Ahead/behind | `0 / 0` |
| DB local head | `20260820120000` → `20260820130000` |
| DB remote head | `20260820120000` → `20260820130000` |
| Pending (pre) | **0** (+1 migration D1-C.4) |
| Production baseline | **15** WB review-only, public=0; markets drafting |
| Dirt non D1-C | Preservata (no `git add .`) |

---

## 3. Docs / patterns letti

- `d1-c-markets-population-block-determination.md`, C.1–C.3 reports  
- Logical/Physical Mercati + Migration Plan (M1 support_resources)  
- Access/RLS Mercati `20260812200000`  
- Opportunità redazione pattern (`/app/redazione/opportunita`, D1-B.3) — pattern architetturale, non copy meccanico  
- `worldbank/indicators` + `apply-indicators` (refresh preserve axes)

---

## 4. RLS delta (why editor could not SELECT)

| Table | Pre | Gap |
|---|---|---|
| `international_market_support_resources` | SELECT solo `visibility=public` ∧ market published | Editor UPDATE sì, SELECT review-only **no** |
| `international_markets` | SELECT solo `editorial_status=published` | Drafting IT/DE/FR invisibili a redazione |
| `international_market_countries` | SELECT solo via market published | Join paese bloccata in redazione |

**Principle applied:** editor OR application_admin + active account → SELECT (redazione); ordinary/anon unchanged; no DELETE grants; service_role not widened; parallel admin UPDATE for Adm publish path.

**Migration:** `20260820130000_mercati_editorial_select_rls.sql` (DDL/policy only; no data schema).

---

## 5. Lifecycle mapping (canonical — no parallel CMS)

| Editorial grade | `verification_status` | `visibility_status` | `substantial_status` | Parent market |
|---|---|---|---|---|
| **READY** (publish) | `confirmed` | `public` | `active` | `editorial_status=published` |
| **QUESTIONABLE** | `in_review` | `editorial` | `signaled` | unchanged |
| **REJECT** | `rejected` | `editorial` | `archived` | unchanged |

UI: `/app/redazione/mercati-internazionali` (+ detail). Actions via same axes.

---

## 6. Local validation

| Check | Result |
|---|---|
| Migration apply local | PASS → head `20260820130000` |
| RLS anon review-only | **0** |
| RLS ordinary review-only | **0** |
| RLS editor review-only | **15** (+ 3 drafting markets) |
| RLS admin review-only | **15** |
| RLS service_role | **15** |
| DELETE grants anon/auth | **0** |
| Selective smoke 13 READY / 1 Q / 1 R | PASS (anon public=13; Q/R invisible) |
| Local refresh after editorial | unchanged=15; READY stay public; Q/R preserved |
| `npm test` | **230** pass |
| typecheck / lint / build | PASS (0 lint errors) |

---

## 7. Remote migration

| Check | Result |
|---|---|
| Dry-run | **only** `20260820130000_mercati_editorial_select_rls.sql` |
| Apply | PASS |
| Head local/remote | `20260820130000` / `20260820130000` |
| Pending | **0** |
| Policies present remote | SELECT editorial on markets / countries / support_resources |

---

## 8. Editorial review (all 15)

Spot-check live WB API (≥5; IT all 5 + DE all 5 + FR POP): values/period **2024** match stored summaries. Units/labels platform IT; provenance CC BY 4.0; useful Mercati context; no misleading presentation.

| Grade | Count | Notes |
|---|---:|---|
| READY | **15** | All pilot observations quality-pass |
| QUESTIONABLE | **0** | — |
| REJECT | **0** | — |

Selective publish capability validated locally (13/1/1). Production quality review found no Q/R.

---

## 9. Selective publication (Production)

| Metric | Value |
|---|---:|
| Published READY | **15** |
| QUESTIONABLE unpublished | **0** |
| REJECT non-public | **0** |
| Markets published | **it / de / fr** |
| Anon public WB rows | **15** |
| Anon non-public leak | **0** |
| Human-readable summaries | PASS (no raw code-as-headline) |

Harness: `artifacts/ingestion/d1c4-prod-editorial.mjs` (same axes as UI).

---

## 10. Refresh safety (Production)

| Metric | Value |
|---|---:|
| Dry-run wouldInsert/Update | **0 / 0** |
| Dry-run unchanged | **15** |
| Apply inserted/updated/unchanged | **0 / 0 / 15** |
| publishedCount after apply | **15** (preserved) |
| Auto-publish | **NO** |
| Duplicates | **0** |

Importer UPDATE still writes content/provenance only (axes preserved). Post-write guard updated: only **new inserts** must stay review-only; human-published READY allowed.

---

## 11. ICE / hard stops

| Item | Result |
|---|---|
| ICE ingestion | **0** |
| ICE scraping | **0** |
| Link-only policy | unchanged |
| Pilot countries | IT/DE/FR only |
| New indicators | **0** |
| Scheduler | **NO** |
| D1-D / Unioncamere | **NO** |

---

## 12. Public UI / hosting

| Surface | Result |
|---|---|
| Public data RLS list/detail markets | PASS (anon sees it/de/fr + 15 resources) |
| Public page code (`/mercati/[code]` indicators section) | Shipped in repo |
| Redazione routes | `/app/redazione/mercati-internazionali` |
| Production Next hosting deploy | **BLOCKED** — no Vercel/hosting project (pre-existing; see application-v1-deployment-report) |
| Mobile E2E against live host | N/A until hosting GO |

---

## 13. OUTPUT FINALE (75 punti)

| # | Item | Result |
|---|---|---|
| 1 | Esito D1-C.4 | **PASS** |
| 2 | Mode | accelerata controllata |
| 3 | Branch | `main` |
| 4 | HEAD (pre) | `6f285c9` |
| 5 | origin/main (pre) | = HEAD |
| 6 | Ahead/behind (pre) | `0 / 0` |
| 7 | Dirt non D1-C preservata | **SÌ** |
| 8 | DB local head (pre→post) | `…120000` → `…130000` |
| 9 | DB remote head (pre→post) | `…120000` → `…130000` |
| 10 | Pending (post) | **0** |
| 11 | Docs D1-C / C.1–C.3 / Mercati / RLS / Opportunità pattern | **SÌ** |
| 12 | RLS gap root cause | Missing editor SELECT on review-only |
| 13 | Tables in delta | markets, countries, support_resources |
| 14 | Migration created | `20260820130000_mercati_editorial_select_rls.sql` |
| 15 | Migration scope minimal | **SÌ** (policies only) |
| 16 | Anon widen | **NO** |
| 17 | Ordinary widen | **NO** |
| 18 | DELETE grants | **NO** |
| 19 | service_role widen | **NO** |
| 20 | Micro-review before apply | **SÌ** |
| 21 | Local migration apply | PASS |
| 22 | RLS anon deny review-only | PASS |
| 23 | RLS ordinary deny | PASS |
| 24 | RLS editor see 15 | PASS |
| 25 | RLS admin see 15 | PASS |
| 26 | RLS service_role | PASS |
| 27 | Redazione route | `/app/redazione/mercati-internazionali` |
| 28 | List human fields | Paese/indicatore/periodo/valore/unità/fonte/stato |
| 29 | Detail fields | definition + provenance + WB source |
| 30 | Lifecycle mapping documented | READY/Q/REJECT → axes |
| 31 | No parallel CMS | **SÌ** |
| 32 | Local UI+RLS before remote | PASS |
| 33 | D1-C unit tests | PASS |
| 34 | `npm test` | **230** PASS |
| 35 | typecheck | PASS |
| 36 | lint | PASS (0 errors) |
| 37 | build | PASS |
| 38 | Remote dry-run only D1-C.4 | PASS |
| 39 | Remote apply | PASS |
| 40 | Local/remote parity | PASS |
| 41 | Production UI hosting deploy | **BLOCKED** (no host) — data path OK |
| 42 | Reviewed count | **15 / 15** |
| 43 | READY | **15** |
| 44 | QUESTIONABLE | **0** |
| 45 | REJECT | **0** |
| 46 | Spot-check ≥5 vs live WB | PASS (IT×5 + DE×5 + FR POP) |
| 47 | Published READY only | **15** |
| 48 | Q unpublished | n/a (0) |
| 49 | R non-public | n/a (0) |
| 50 | Anon public count | **15** |
| 51 | Anon leak non-public | **0** |
| 52 | Markets public it/de/fr | PASS |
| 53 | Human-readable copy | PASS |
| 54 | Refresh dry unchanged | **15** |
| 55 | Refresh apply unchanged | **15** |
| 56 | READY stay published | **SÌ** |
| 57 | No auto-publish new | **SÌ** |
| 58 | No duplicates | **SÌ** |
| 59 | Provenance preserved | **SÌ** |
| 60 | ICE ingestion | **0** |
| 61 | ICE scraping | **0** |
| 62 | No scheduler | **SÌ** |
| 63 | No pilot expansion | **SÌ** |
| 64 | No D1-D / Unioncamere | **SÌ** |
| 65 | No Persone/Imprese/Professionisti | **SÌ** |
| 66 | Validation doc | this file |
| 67 | Roadmap / D1-C closeout updated | **SÌ** |
| 68 | `git diff --check` | PASS (staged) |
| 69 | Selective stage (no `git add .`) | **SÌ** |
| 70 | Commit | `bd97d8a` — `feat(markets): add editorial review and publish World Bank pilot` |
| 71 | Push origin/main | **SÌ** |
| 72 | Ahead/behind final | `0 / 0` |
| 73 | D1-C WB pilot E2E closed | **SÌ** |
| 74 | Next domain authorizable | **SÌ** (separate GO) |
| 75 | STOP after D1-C.4 | **SÌ** |

---

## 14. Decisione string

```
D1-C.4 INTERNATIONAL MARKETS EDITORIAL REVIEW COMPLETATA —
EDITOR/ADMIN REVIEW ACCESS OPERATIVO —
15 WORLD BANK OBSERVATION REVISIONATE —
SOLO READY PUBBLICATE —
QUESTIONABLE/REJECT NON PUBBLICHE —
PUBLIC PRESENTATION VERIFICATA —
EDITORIAL DECISIONS PRESERVATE AL REFRESH —
NESSUN AUTO-PUBLISH —
NESSUNA INGESTION ICE —
D1-C WORLD BANK PILOT CHIUSO END-TO-END —
PROSSIMO DOMINIO DI POPOLAMENTO AUTORIZZABILE
STOP.
```

*Nota hosting:* presentazione pubblica Next su host remoto resta subordinata a GO hosting (gap preesistente); contratto dati/RLS/public copy verificato in Production.

---

*Fine D1-C.4*
