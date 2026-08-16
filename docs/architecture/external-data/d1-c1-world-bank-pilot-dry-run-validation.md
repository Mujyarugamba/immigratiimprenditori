# D1-C.1 — World Bank pilot dry-run validation (Mercati)

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-C.1 WORLD BANK PILOT DRY-RUN  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**STOP sessione:** `dbWrites=0`; nessuna migration; nessuna publish; nessun ICE scrape; nessun scheduler; nessun commit/push

---

## 1. Esito

**PASS** — live World Bank dry-run completato entro max 3 paesi / max 8 indicatori.  
Source / license / mapping / provenance / natural key / null / revision / idempotenza verificati.  
**D1-C.2 local review-only pilot autorizzabile** (separate GO; apply non eseguito qui).

---

## 2. Baseline

| Voce | Valore |
|---|---|
| Branch | `main` |
| HEAD | `c7dc53762947e3597fc57861df139d01011c31fb` |
| origin/main | = HEAD |
| Ahead/behind | `0 / 0` |
| DB local head | `20260820120000` |
| DB remote head | `20260820120000` |
| Pending migrations | **0** |
| Dirt preesistente | Preservata (no `git add .`) |

---

## 3. Pilot boundary (eseguito)

| Parametro | Valore |
|---|---|
| Source | `worldbank-indicators` (WDI API v2) |
| Countries | **IT, DE, FR** (D1-C default) |
| Indicators | 5 (≤8): `SP.POP.TOTL`, `NY.GDP.MKTP.CD`, `NY.GDP.MKTP.KD.ZG`, `NY.GDP.PCAP.CD`, `NE.TRD.GNFS.ZS` |
| Period fetch | `2022:2024` |
| Map grain | latest non-null year per country×indicator |
| Expected mapped rows | 15 (3×5) |
| ICE | LINK_ONLY — no ingestion |
| WRITE | disabled |

### Time strategy (documentata)

D1-C non fissava un intervallo oltre «ultimo anno disponibile». Scelta D1-C.1: fetch `2022:2024` per verificare storia/update; mapping risorsa = anno più recente non-null (tipicamente 2024 in probe live).

---

## 4. Live reverify (2026-08-13)

| Check | Result |
|---|---|
| API `https://api.worldbank.org/v2/` | HTTP **200** |
| Data page `data.worldbank.org/indicator/{CODE}` | HTTP **200** |
| License | **CC BY 4.0** (registry + catalog) |
| Attribution | World Bank |
| Indicator IDs | allowlist stabile |
| Country codes | ISO2 (`IT`/`DE`/`FR`) + ISO3 in payload |
| Period | annual `date` year string |
| Unit/scale | API `unit` spesso `""`; catalogo unit documentato (no silent convert) |
| Null | `value: null` pubblicato → non mappato a risorsa; **mai → 0** |
| Metadata | `lastupdated` in page meta (es. `2026-07-13`) |
| Revisions | stesso natural key + value change → WOULD UPDATE (in-memory) |

---

## 5. Dry-run CLI result

Command: `npx tsx scripts/external-data/dry-run-worldbank-indicators.ts`

| Metric | Value |
|---|---|
| fetched | 45 |
| validated | 15 |
| rejected | 0 |
| wouldInsert | 15 |
| wouldUpdate | 0 |
| unchanged | 0 |
| dbWrites | **0** |
| errors | [] |
| manual QA | **8/8 PASS** (≥5) |
| revision sim | WOULD UPDATE · dbWrites=0 |
| autoPublish | **false** |
| future apply state | `verification_status=in_review`, `visibility_status=editorial`, `substantial_status=signaled` |

Sidecar: `artifacts/ingestion/dry-worldbank-indicators-*/manifest.json` (P-D).

---

## 6. Natural key / mapping / provenance

- Natural key: `worldbank:{indicator_code}:{country_iso2}:{year}`
- Country canonical: ISO2 → `country_ref` (no IT/EN/ISO3 duplicates as keys)
- Market binding: hint `market:{ISO2}` in dry-run; apply requires existing Mercati catalog (precondition D1-C)
- Target: `international_market_support_resources` (CASE A / M1)
- Provenance in `contact_note` + sidecar: source, dataset, indicator, API URL, retrieved_at, license, attribution, checksum
- Checksum excludes `retrievedAt` (idempotency)

---

## 7. ICE

Policy **LINK_ONLY** confermata. Nessuno scrape/import. Solo nota contratto (`https://www.ice.it/`).

---

## 8. Tests / quality gates

| Gate | Result |
|---|---|
| Unit tests WB | PASS (parser, mapping, country, indicator, null, natural key, idempotency, revision, provenance, no auto-publish, malformed) |
| `npm test` | PASS (224) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| Build | non richiesto (nessun shared app UI touch) |

---

## 9. Code / docs touched (uncommitted by design)

- `src/lib/external-data/worldbank/indicators.ts`
- `src/lib/external-data/worldbank/indicators.test.ts`
- `src/lib/external-data/natural-key.ts` (`worldbankIndicatorKey`)
- `scripts/external-data/dry-run-worldbank-indicators.ts`
- questo report + roadmap / source-notes aggiornamenti fattuali

---

## 10. Non fatti (hard stops rispettati)

- Nessuna scrittura DB locale/Production  
- Nessuna migration create/apply  
- Nessuna pubblicazione  
- Nessun ICE import  
- Nessun scheduler  
- Nessun D1-D / Unioncamere / Persone/Imprese/Professionisti  
- Nessun commit/push  

---

## 11. Next gate

**D1-C.2** — local review-only pilot apply → **COMPLETED** (see `d1-c2-world-bank-local-pilot-validation.md`).  
**D1-C.3** — Production review-only → **COMPLETED** (see `d1-c3-world-bank-production-pilot-validation.md`).  
Successivo: **D1-C.4** editorial review + selective publication (separate human GO; RLS editor SELECT).

---

## 12. Decisione string

```
D1-C.1 WORLD BANK PILOT DRY-RUN COMPLETATO —
MAX 3 PAESI / MAX 8 INDICATORI VERIFICATI —
SOURCE / LICENSE / MAPPING / PROVENANCE / NATURAL KEY VALIDATI —
NULL / REVISION / IDEMPOTENZA VERIFICATI —
DBWRITES = 0 —
NESSUNA MIGRATION —
NESSUNA PUBBLICAZIONE —
D1-C.2 LOCAL REVIEW-ONLY PILOT AUTORIZZABILE
STOP.
```

---

*Fine D1-C.1 dry-run validation*
