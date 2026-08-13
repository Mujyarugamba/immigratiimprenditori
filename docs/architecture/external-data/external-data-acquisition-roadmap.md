# External Data Acquisition Roadmap — D1.1 → D1.x

**Stato:** aggiornato da D1-C.3 Production review-only pilot (2026-08-13) — D1-B Opportunities **CLOSED** (15 published / 5 rejected); **D1-C = Mercati** (World Bank M1 + ICE link-only) **DETERMINATO**; **D1-C.1–C.2 PASS**; **D1-C.3 Production PASS** (IT/DE/FR × 5 → 15 review-only in Production; public=0; no auto-publish; no ICE); schema **CASE A**; **no scheduler**; Eurostat OBS-EU-SELF-CIT still live; UC blocked
**Priorità prodotto:** Osservatorio → Opportunità → Mercati → Cultura/Eventi/Contenuti → altre fonti.

---

## 1. Workflow target

```
source registry
  → fetch (A/B/C preferred)
  → normalize
  → validate (schema + methodology + license)
  → deduplicate (stable keys)
  → attach provenance
  → review (SEMI-AUTO; obbligatorio per Opportunity)
  → publish (ACQUIRE ≠ PUBLISH)
```

Contratti: **D1.2 COMPLETE**. Pilot D1.3A-1: **Eurostat Production COMPLETE**; Unioncamere still blocked. D1-B Opportunities: **PILOT CLOSED** (ingest → editorial review → selective publish → QUESTIONABLE resolved → refresh-safe). D1-C Mercati: **DETERMINATION COMPLETE** + **D1-C.1–C.3 PASS** (dry-run → local → Production review-only) — reports `d1-c-markets-population-block-determination.md`, `d1-c1-…`, `d1-c2-…`, `d1-c3-world-bank-production-pilot-validation.md`, notes `source-notes/mercati-worldbank-ice.md`. Reports: `d1.3a-observatory-first-ingestion-report.md`, `d1.3a-1b-eurostat-production-ingestion-validation.md`, `d1-b-opportunities-*.md`, `d1-b3-…`, `d1-b4-…`, `d1-c-…`.

---

## 2. Decisioni umane — CHIUSE in D1.2

| # | Domanda D1.1 | Decisione D1.2 |
|---|---|---|
| 1 | Label definizione camerale | Sì — «Imprese a controllo di persone nate all’estero» + help nascita≠cittadinanza |
| 2 | Budget indicatori | ≤12 Wave A; **4** in D1.3 pilot |
| 3 | Review Opportunity | **Obbligatoria**; no auto-publish |
| 4 | Pilota Lombardia | **Sì** come territorio tecnico (IT + Lombardia); scope piattaforma nazionale |
| 5 | Mercati M1 vs M2 | **M1** |

---

## 3. Quick wins (invariati come backlog; priorità D1.3 ristretta)

Vedi lista D1.1 Top 16.
**D1.3A usa solo:** Eurostat `lfsa_esgan` + Unioncamere OpenGov allowlist/Futurae curato.

---

## 4. Waves (aggiornato)

### WAVE D1-A — Osservatorio
Catalogo 11 famiglie in `observatory-initial-indicator-catalog.md`.
**D1.3A pilot (PILOT 3):** 4 indicatori, IT+Lombardia, 3–5y.

### WAVE D1-B — Opportunità
incentivi.gov (IODL) + EU F&T curated; review obbligatoria; dopo E2E Osservatorio.
**D1-B.1 → D1-B.2 → D1-B.3 → D1-B.4 (2026-08-13):** local+remote migrations through `20260820120000`; 20 pilot imported; editorial publish **15 READY**; all 7 QUESTIONABLE resolved (3 READY + 4 REJECT); public CTA/fonte/scadenze; importer refresh safe. Reports: `d1-b3-…`, `d1-b4-questionable-opportunities-resolution.md`. **Scheduler NOT enabled**.

### WAVE D1-C — Mercati
World Bank 5–8 indicatori via M1 support resources; ICE link-only.
**D1-C determination (2026-08-13):** dominio/fonti/licenze/mapping/publication policy/pilot definiti; **CASE A** schema sufficiente.
**D1-C.1 dry-run (2026-08-13):** PASS — live WB fetch IT/DE/FR × 5; wouldInsert=15; dbWrites=0. Report `d1-c1-…`.
**D1-C.2 local review-only (2026-08-13):** PASS — 15 local review-only; idempotency/public-invisibility PASS. Report `d1-c2-…`.
**D1-C.3 Production review-only (2026-08-13):** PASS — 15 Production review-only; public=0; idempotent; ICE=0; no migration; UI redazione Mercati GAP (editor SELECT RLS). Report `d1-c3-world-bank-production-pilot-validation.md`. **Next:** D1-C.4 editorial review + selective publication (separate GO; includes RLS editor SELECT).

### WAVE D1-D — Cultura/Eventi/Contenuti
SEMI-AUTO + review; no dump MiC.

### WAVE D1-E — Altre
OpenCoesione selettivo; Org/Servizi defer.

---

## 5. Ordine tecnico

1. ~~D1.2 contracts~~ **DONE**
2. ~~D1.3A / D1.3A-1b~~ **DONE** — OBS-EU-SELF-CIT Production published; writer migration `20260819100000`
3. D1.3A-2 — Unioncamere P0 when Futurae+allowlist ready (**GO umano**)
4. ~~D1-B.1 / D1-B.2 / D1-B.3 / D1-B.4~~ **DONE** — pilot closed (15 published / 5 rejected / 0 QUESTIONABLE); refresh-safe; **no scheduler**
5. ~~D1-C determination~~ **DONE (docs)** — Mercati M1 WB + ICE link; pilot authorizable
6. ~~D1-C.1~~ **DONE (dry-run)** — WB pilot max 3×5; dbWrites=0; D1-C.2 authorizable
7. ~~D1-C.2~~ **DONE (local)** — WB review-only apply on local Supabase
8. ~~D1-C.3~~ **DONE (Production review-only)** — 15 WB rows in Production; public=0; no publish
9. D1-C.4 — Editorial review + selective publication (after human GO; RLS editor SELECT + UI)
10. D1.6 — Editorial/Lombardia bandi + EU F&T curated (not D1-C)
11. Scheduler — **authorizable** after ops GO (not enabled)

---

## 6. Provenance & schema

- Pilot: **P-D** (modello esistente + sidecar run)
- Post-pilot opzionale: **P-A** columns (`retrieved_at`, …)
- Classificazione: **D1.2-A** schema sufficiente

---

## 7. Stop line

D1.3A termina con report + commit importer/report.
D1-B pilot **CLOSED**.
D1-C.3 **Production review-only done** — **do not** publish the 15, start D1-D, enable scheduler, or expand WB/ICE without explicit human GO (D1-C.4).

---

*Roadmap aggiornata D1-C.3 Production review-only pilot*
