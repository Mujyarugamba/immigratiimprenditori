# External Data Acquisition Roadmap — D1.1 → D1.x

**Stato:** aggiornato da D1.2 (2026-08-11)
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

Contratti: **D1.2 COMPLETE**. Implementazione pilot: **D1.3** (non avviata).

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

### WAVE D1-C — Mercati
World Bank 5–8 indicatori via M1 support resources; ICE link-only.

### WAVE D1-D — Cultura/Eventi/Contenuti
SEMI-AUTO + review; no dump MiC.

### WAVE D1-E — Altre
OpenCoesione selettivo; Org/Servizi defer.

---

## 5. Ordine tecnico

1. ~~D1.2 contracts~~ **DONE**
2. **D1.3** — Pilot Osservatorio (autorizzabile; non iniziato)
3. D1.4 — Opportunità importer
4. D1.5 — Mercati M1 WB
5. D1.6 — Editorial/Lombardia bandi
6. Scheduler — dopo stabilità

---

## 6. Provenance & schema

- Pilot: **P-D** (modello esistente + sidecar run)
- Post-pilot opzionale: **P-A** columns (`retrieved_at`, …)
- Classificazione: **D1.2-A** schema sufficiente

---

## 7. Stop line

D1.2 termina con commit/push documentazione.
**Non** iniziare D1.3 finché non autorizzato esplicitamente.

---

*Roadmap aggiornata D1.2*
