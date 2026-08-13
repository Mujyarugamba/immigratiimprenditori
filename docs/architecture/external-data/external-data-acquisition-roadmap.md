# External Data Acquisition Roadmap — D1.1 → D1.x

**Stato:** aggiornato da D1-D.2 Contenuti contract (2026-08-13) — D1-B Opportunities **CLOSED**; **D1-C Mercati World Bank pilot CLOSED end-to-end**; **D1-D.1** first vertical = **Contenuti**; **D1-D.2** acquisition contract + 4-source allowlist **DONE** (metadata/link only; no import of 20; no auto-publish; CASE A); Eventi/Cultura AR out; **no scheduler**; Eurostat OBS-EU-SELF-CIT still live; UC blocked
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

Contratti: **D1.2 COMPLETE**. Pilot D1.3A-1: **Eurostat Production COMPLETE**; Unioncamere still blocked. D1-B Opportunities: **PILOT CLOSED**. D1-C Mercati: **CLOSED E2E** (determination → dry-run → local → Production review-only → editorial publish) — reports `d1-c-…`, `d1-c1-…`, `d1-c2-…`, `d1-c3-…`, `d1-c4-international-markets-editorial-publication-validation.md`, notes `source-notes/mercati-worldbank-ice.md`. Reports: `d1.3a-…`, `d1-b-…`, `d1-c-…`.

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
**D1-C.3 Production review-only (2026-08-13):** PASS — 15 Production review-only; public=0; UI GAP. Report `d1-c3-…`.
**D1-C.4 editorial + selective publish (2026-08-13):** PASS — migration `20260820130000` editor/admin SELECT; redazione `/app/redazione/mercati-internazionali`; **15 READY** published; refresh-safe; ICE=0. Report `d1-c4-international-markets-editorial-publication-validation.md`. **D1-C WB pilot CLOSED.** Next domain requires separate GO (not auto D1-D).

### WAVE D1-D — Cultura/Eventi/Contenuti
**D1-D.1 (2026-08-13):** determination — first executable vertical = **Contenuti** (CASE A E2E); Cultura = hub no AR; Eventi out (no editor RLS/UI/external id).
**D1-D.2 (2026-08-13):** PASS — typed acquisition contract + closed allowlist (ISMU, MLPS, EMN, Futurae project); metadata/link only; auto-publish forbidden; **0/20 imported**. Code `src/lib/external-data/contents/`; report `d1-d2-contenuti-acquisition-contract.md`. **Next:** D1-D.3 review-only import of ≤20 (separate GO).

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
9. ~~D1-C.4~~ **DONE (editorial + selective publish)** — 15 READY published; redazione+RLS; refresh-safe
10. ~~D1-D.1~~ **DONE (determination)** — Contenuti first
11. ~~D1-D.2~~ **DONE (contract + allowlist)** — 4 sources; no import
12. D1-D.3 — Contenuti metadata/link review-only import ≤20 (after human GO)
13. D1.6 — Editorial/Lombardia bandi + EU F&T curated (not D1-C)
14. Scheduler — **authorizable** after ops GO (not enabled)

---

## 6. Provenance & schema

- Pilot: **P-D** (modello esistente + sidecar run)
- Post-pilot opzionale: **P-A** columns (`retrieved_at`, …)
- Classificazione: **D1.2-A** schema sufficiente

---

## 7. Stop line

D1.3A termina con report + commit importer/report.
D1-B pilot **CLOSED**.
D1-C World Bank pilot **CLOSED**. D1-D.2 contract **DONE** — **do not** import the 20, enable scheduler, Eventi ingest, or Cultura AR without explicit human GO (D1-D.3). Hosting Next Production still separate GO (pre-existing).

---

*Roadmap aggiornata D1-D.2 Contenuti acquisition contract*
