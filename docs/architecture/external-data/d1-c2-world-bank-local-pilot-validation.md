# D1-C.2 — World Bank local review-only pilot validation (Mercati)

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-C.2 INTERNATIONAL MARKETS LOCAL REVIEW-ONLY PILOT  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**STOP sessione:** nessun write Production; nessuna migration create/apply; nessun publish/auto-publish; nessun ICE import; nessun commit/push

---

## 1. Esito

**PASS** — first REAL import eseguito **solo su Supabase locale** (`http://127.0.0.1:54321`).  
IT/DE/FR × 5 indicatori WB = **15** support resources in `in_review` / `editorial` / `signaled`.  
Idempotenza, revision (ROLLBACK), null handling, provenance, country/indicator integrity, public invisibility: **PASS**.  
**D1-C.3 Production review-only pilot** → **COMPLETED** (see `d1-c3-world-bank-production-pilot-validation.md`).

---

## 2. Baseline pre-gate

| Voce | Valore |
|---|---|
| Branch | `main` |
| HEAD | `c7dc53762947e3597fc57861df139d01011c31fb` |
| origin/main | = HEAD |
| Ahead/behind | `0 / 0` |
| DB local head | `20260820120000` |
| DB remote head | `20260820120000` |
| Pending migrations | **0** |
| Schema | **CASE A** — no migration needed / none created |
| `.env.local` target | `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` |
| Dirt preesistente | Preservata (no `git add .` / no commit/push) |

---

## 3. Contract freeze (invariato da D1-C.1)

| Parametro | Valore |
|---|---|
| Countries | **IT, DE, FR** (exactly 3) |
| Indicators | `SP.POP.TOTL`, `NY.GDP.MKTP.CD`, `NY.GDP.MKTP.KD.ZG`, `NY.GDP.PCAP.CD`, `NE.TRD.GNFS.ZS` |
| Period / selection | fetch `2022:2024`; map latest non-null year |
| Natural key | `worldbank:{indicator_code}:{country_iso2}:{year}` |
| Target | `international_market_support_resources` (M1) |
| Editorial axes | `verification_status=in_review`, `visibility_status=editorial`, `substantial_status=signaled` |
| AUTO-PUBLISH | **NO** |
| ICE | **LINK_ONLY** (0 rows ingested) |

---

## 4. Live WB reverify (pre-write)

| Check | Result |
|---|---|
| API endpoints (5) | HTTP **200** |
| Schema `[meta, data[]]` | Compatible |
| Indicator IDs / semantics | Unchanged vs D1-C.1 |
| Mapping | Unchanged |
| Value revisions vs prior dry-run | Acceptable (same keys; model handles UPDATE) |

---

## 5. Pre-write dry-run vs D1-C.1

Command: `npx tsx scripts/external-data/dry-run-worldbank-indicators.ts`

| Metric | D1-C.1 | D1-C.2 pre-write | Diff |
|---|---:|---:|---|
| fetched | 45 | 45 | none |
| validated | 15 | 15 | none |
| rejected | 0 | 0 | none |
| wouldInsert | 15 | 15 | none |
| wouldUpdate | 0 | 0 | none |
| unchanged | 0 | 0 | none |
| dbWrites | 0 | 0 | none |
| manual QA | 8/8 | 8/8 | none |

Diff explanation: **nessuna differenza strutturale**; valori numerici possono variare se WB rivede serie (non osservato come breaking su questo run).

---

## 6. Local ops precondition (NO migration)

### 6.1 service_role GRANT (ops-only, local)

D1-C aveva documentato gap: `service_role` senza SELECT/INSERT/UPDATE su tabelle Mercati.  
**Eseguito solo locale** (docker `psql`, **non** migration file):

```sql
GRANT SELECT, INSERT, UPDATE ON TABLE
  public.international_markets,
  public.international_market_countries,
  public.international_market_support_resources
TO service_role;
```

Production **non** toccata. Privilege migration D1-C-M1 resta **proposed** per eventuale Production path.

### 6.2 Market catalog seed (local drafting)

Catalogo locale era **vuoto** (0 markets). Precondition D1-C: non inventare mercato in auto dalla fonte WB.  
Per il pilot locale è stato eseguito seed editoriale **drafting** (codes `it`/`de`/`fr`, `country_ref` ISO2 `IT`/`DE`/`FR`, `editorial_status=drafting`) via `ensureLocalPilotMarketCatalog` — **non published**.

---

## 7. Local apply result

Command: `npx tsx scripts/external-data/ingest-worldbank-indicators.ts --apply --ensure-local-catalog`

| Metric | Value |
|---|---:|
| targetUrl | `http://127.0.0.1:54321` |
| isLocalTarget | true |
| inserted | **15** |
| updated | 0 |
| unchanged | 0 |
| rejected | 0 |
| errors | 0 |
| reviewOnlyCount | 15 |
| publishedCount | **0** |
| duplicates | 0 |
| dbWrites | 15 |
| ICE ingested | **0** |

Sidecar: `artifacts/ingestion/apply-worldbank-indicators-*/manifest.json` (P-D).

---

## 8. Review-only / lifecycle

| Axis | Expected | Observed (15/15) |
|---|---|---|
| verification_status | `in_review` | **15** |
| visibility_status | `editorial` | **15** |
| substantial_status | `signaled` | **15** |
| visibility public | 0 | **0** |
| verification confirmed | 0 | **0** |
| auto-publish | false | **false** |

**BLOCKING auto-publish:** non scattato.

---

## 9. DB validation (per observation)

Per tutte le 15 righe: source (`worldbank-indicators`), country ISO2, canonical `country_ref`, indicator code, year/period in name+summary, value+unit in summary, provenance in `contact_note` (natural_key, api, retrieved_at, license, attribution, checksum), editorial state review-only. **Nessun duplicato** su natural key.

Period mapped: **2024** (latest non-null in `2022:2024`) for all 15.

---

## 10. Country integrity

| country_ref | market code | market editorial | duplicates IT/Italia/ISO3 |
|---|---|---|---|
| IT | `it` | drafting | none |
| DE | `de` | drafting | none |
| FR | `fr` | drafting | none |

Canonical geo = ISO2 `country_ref`. No Italy/Italia / ISO3 duplicate keys.

---

## 11. Indicator integrity

5 IDs con label/definition/unit/periodicity/semantics da `WB_INDICATOR_CATALOG` (invariati). Units in summary: `persons`, `current US$`, `percent (annual growth)`, `current US$ per person`, `percent of GDP`.

---

## 12. Provenance completeness

**15/15** contact_note contengono: `natural_key`, `source`, `dataset`, `indicator`, `api`, `retrieved_at`, `license`, `attribution`, `checksum` + sidecar P-D.

---

## 13. Idempotency (second local apply)

| Metric | Value |
|---|---:|
| inserted | **0** |
| updated | **0** |
| unchanged | **15** |
| duplicates | 0 |
| dbWrites | 0 |

---

## 14. Revision test (fixture + ROLLBACK)

Transaction SQL locale su `worldbank:NY.GDP.MKTP.CD:IT:2024`:

1. UPDATE summary + checksum sulla **stessa** riga  
2. after_rows = 1 (no new row); total WB still 15; axes restano `in_review`/`editorial`  
3. **ROLLBACK** completo → summary originale ripristinato; total 15

PASS.

---

## 15. Null / missing

Contratto invariato: `null ≠ 0`; null/missing → non insert inventato (unit tests + dry-run REVIEW_REQUIRED). Nessun valore inventato in apply.

---

## 16. Public visibility (local anon)

REST anon (`role=anon`):

| Surface | Visible pilot rows |
|---|---:|
| `international_markets` | **0** (drafting) |
| `international_market_countries` | **0** |
| `international_market_support_resources` (worldbank) | **0** (editorial) |
| Mercati pages / home / public API | pilot visibility **0** (RLS) |

---

## 17. Domain presentation review (no redesign)

Catena richiesta **PAESE → INDICATORE → PERIODO → VALORE → UNITÀ → FONTE** ricostruibile da:

- paese: market name / `country_ref`  
- indicatore: `name` + platform label in `summary`  
- periodo: year in `name`/`summary`  
- valore+unità: `summary`  
- fonte: `website_url` + attribution in `contact_note`

| Flag | Severity | Note |
|---|---|---|
| Raw WB codes in `contact_note` | non-blocking | provenance; non destinati a UI pubblica |
| Typed numeric columns missing | accepted M1 | CASE A / M2 deferred |
| Ambiguous units | none | catalog units in summary |
| Missing period | none | year present |
| Country dup | none | |
| Unclear provenance | none | 15/15 complete |

---

## 18. Editorial workflow

| Step | Stato |
|---|---|
| See / verify / compare / approve / publish / withdraw Mercati support resources | **GAP UI** — `/app/redazione` ha Opportunità/Osservatorio/Contenuti/Organizzazioni; **nessuna** coda Mercati |
| Existing queue test | N/A — gap documentato; nessun large UI aggiunto in D1-C.2 |
| Data path ready | SÌ — axes + RLS editor insert/update già presenti; serve UI auth redazione Mercati in fase successiva |

Editor oggi può ispezionare via DB/Studio/service_role; non via UI prodotto.

---

## 19. Human readability (quality judgment, NOT publication)

| Class | Count | Note |
|---|---:|---|
| READY | **15** | Labels IT chiari, year, value, unit, fonte WB URL, provenance completa |
| QUESTIONABLE | 0 | — |
| REJECT | 0 | — |

Esempio (IT population): «Popolazione totale (2024): 58952704 persons» + data.worldbank.org — leggibile.

---

## 20. ICE

Ingestion ICE = **0**. Contratto LINK_ONLY invariato (`https://www.ice.it/` nota contratto only).

---

## 21. Post-import dry-run

`npx tsx scripts/external-data/ingest-worldbank-indicators.ts --dry-run` (loads local fingerprints):

| Metric | Value |
|---|---:|
| wouldInsert | **0** |
| wouldUpdate | **0** |
| unchanged | **15** |
| dbWrites | **0** |

---

## 22. Tests / quality gates

| Gate | Result |
|---|---|
| D1-C.2 apply unit tests | PASS (local URL guard, provenance parse, review-only, revision, null) |
| `npm test` | PASS (**230**) |
| `npm run typecheck` | PASS |
| `npm run lint` (touched WB paths) | PASS |
| Build | non richiesto (nessun shared app UI touch) |
| `git diff --check` (relevant) | PASS (solo warning CRLF roadmap) |

---

## 23. Code / docs touched (uncommitted by design)

- `src/lib/external-data/worldbank/apply-indicators.ts` (NEW)
- `src/lib/external-data/worldbank/apply-indicators.test.ts` (NEW)
- `scripts/external-data/ingest-worldbank-indicators.ts` (NEW)
- questo report + aggiornamenti fattuali roadmap / source-notes / D1-C.1 next-gate
- D1-C dirt/docs precedenti **preservati**

---

## 24. Hard stops rispettati

- Nessuna scrittura Production  
- Nessuna migration create/apply  
- Nessun publish / auto-publish  
- Nessun ICE import  
- Nessun Unioncamere / D1-D / scheduler / cron / email  
- Nessun Persone/Imprese/Professionisti  
- Nessun commit / push / `git add .`

---

## 25. Non-blocking follow-ups (per D1-C.3 / UI)

1. Privilege migration D1-C-M1 **proposed** se Production apply userà `service_role`  
2. UI redazione Mercati support resources (queue review/publish/withdraw)  
3. Catalogo Mercati Production deve esistere (non seed auto da WB)  
4. Unique DB constraint su natural key ancora assente (dedupe applicativa via `contact_note`)

---

## 26. OUTPUT FINALE (72 punti)

| # | Item | Result |
|---|---|---|
| 1 | Esito D1-C.2 | **PASS** — local review-only pilot |
| 2 | Mode | accelerata controllata |
| 3 | Branch | `main` |
| 4 | HEAD | `c7dc53762947e3597fc57861df139d01011c31fb` |
| 5 | origin/main | = HEAD |
| 6 | Ahead/behind | `0 / 0` |
| 7 | Dirt preservata | **SÌ** (no stage/commit/push) |
| 8 | DB local head | `20260820120000` |
| 9 | DB remote head | `20260820120000` |
| 10 | Pending migrations | **0** |
| 11 | Schema sufficiency | **CASE A** |
| 12 | Migration create/apply | **0** |
| 13 | Docs D1-C / D1-C.1 / source-notes rilette | **SÌ** |
| 14 | Importer path | `worldbank/indicators` + `apply-indicators` |
| 15 | Contract countries | IT / DE / FR exactly |
| 16 | Contract indicators | same 5 WB IDs |
| 17 | Period strategy | 2022:2024 → latest non-null (**2024**) |
| 18 | Natural key | `worldbank:{code}:{iso2}:{year}` |
| 19 | Live WB reverify | PASS (HTTP 200, schema OK) |
| 20 | Pre-write dry-run fetched | 45 |
| 21 | Pre-write validated | 15 |
| 22 | Pre-write rejected | 0 |
| 23 | Pre-write wouldInsert | 15 |
| 24 | Pre-write wouldUpdate | 0 |
| 25 | Pre-write unchanged | 0 |
| 26 | Pre-write dbWrites | **0** |
| 27 | Diff vs D1-C.1 | none structural |
| 28 | Target URL | `http://127.0.0.1:54321` |
| 29 | Production write | **NO** |
| 30 | Ops GRANT local service_role | **DONE** (no migration) |
| 31 | Local catalog seed drafting | IT/DE/FR codes `it`/`de`/`fr` |
| 32 | Apply inserted | **15** |
| 33 | Apply updated | 0 |
| 34 | Apply unchanged (1st) | 0 |
| 35 | Apply rejected/errors | 0 / 0 |
| 36 | Review-only lifecycle | 15/15 in_review+editorial+signaled |
| 37 | Auto-publish / public_vis | **0** |
| 38 | Confirmed verification | **0** |
| 39 | DB per-obs validation | 15/15 PASS |
| 40 | Duplicates natural key | **0** |
| 41 | Country integrity | ISO2 only; no Italia/ISO3 dup |
| 42 | Indicator integrity | 5 IDs + units/defs OK |
| 43 | Provenance completeness | **15/15** |
| 44 | Idempotency 2nd apply inserted | **0** |
| 45 | Idempotency updated | **0** |
| 46 | Idempotency unchanged | **15** |
| 47 | Revision UPDATE same row | PASS |
| 48 | Revision no new row | PASS |
| 49 | Revision ROLLBACK | PASS |
| 50 | Null≠0 / no invent | PASS |
| 51 | Anon markets visible | **0** |
| 52 | Anon WB resources visible | **0** |
| 53 | Public pages pilot visibility | **0** |
| 54 | Domain presentation chain | Reconstructible M1 text |
| 55 | Presentation flags | non-blocking (codes in note; M1 text) |
| 56 | Editorial UI Mercati | **GAP** documented |
| 57 | Human READY/QUESTIONABLE/REJECT | **15 / 0 / 0** |
| 58 | ICE ingestion | **0** |
| 59 | ICE policy | LINK_ONLY remains |
| 60 | Post-import wouldInsert | **0** |
| 61 | Post-import wouldUpdate | **0** |
| 62 | Post-import unchanged | **15** |
| 63 | Post-import dbWrites | **0** |
| 64 | npm test | PASS 230 |
| 65 | typecheck | PASS |
| 66 | lint (touched) | PASS |
| 67 | build | not required |
| 68 | Docs D1-C.2 created | this file |
| 69 | Roadmap / notes aggiornati | SÌ |
| 70 | `git diff --check` | PASS (CRLF warn only) |
| 71 | Commit/push | **NO** |
| 72 | Next gate | **D1-C.3** → COMPLETED; **D1-C.4** editorial selective publish |

---

## 27. Decisione string

```
D1-C.2 WORLD BANK LOCAL REVIEW-ONLY PILOT COMPLETATO —
IT/DE/FR × 5 INDICATORI IMPORTATI SOLO LOCALE —
COUNTRY / INDICATOR / PERIOD / VALUE / UNIT / PROVENANCE VERIFICATI —
IDEMPOTENZA / REVISION / NULL HANDLING PASS —
NESSUN AUTO-PUBLISH —
NESSUNA SCRITTURA PRODUCTION —
D1-C.3 PRODUCTION REVIEW-ONLY PILOT AUTORIZZABILE
STOP.
```

---

*Fine D1-C.2 local review-only pilot validation*
