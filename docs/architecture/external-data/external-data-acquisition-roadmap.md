# External Data Acquisition Roadmap — D1.1 → D1.x

**Stato:** proposta (nessuna implementazione in D1.1)
**Priorità prodotto confermata dall’evidenza:** Osservatorio → Opportunità → Mercati → Cultura/Eventi/Contenuti → altre fonti.

---

## 1. Workflow target (D1.2/D1.3)

```
source registry
  → fetch (A/B/C preferred)
  → normalize
  → validate (schema + methodology + license)
  → deduplicate (stable keys)
  → attach provenance
  → review (SEMI-AUTO)
  → publish (ACQUIRE ≠ PUBLISH)
```

Contratti da definire in **D1.2** (ingestion contract), implementazione pipeline in **D1.3+**.

---

## 2. Quick wins (Top 16)

| # | Source ID | Dataset focus | Dominio | Mode | Automation | Why |
|---|---|---|---|---|---|---|
| 1 | `unioncamere-opengov` | Imprese straniere aggregati CSV | Osservatorio | C | AUTO/SEMI | Core prodotto; P0; def. camerale |
| 2 | `eurostat-lfsa-esgan` | Self-employment by citizenship | Osservatorio | A | AUTO | API 200; confronto UE |
| 3 | `istat-istatdata-sdmx` | Dataflow demografia stranieri (selected) | Osservatorio | B | AUTO | CC BY; SDMX ufficiale |
| 4 | `istat-occupazione-autonomo` | Lavoro autonomo (selected) | Osservatorio | B | AUTO | Contesto lavoro |
| 5 | `incentivi-gov-opendata` | Catalogo misure | Opportunità | C | SEMI | IODL 2.0; mapping forte |
| 6 | `eu-funding-tenders-sedia` | Call filtrate | Opportunità | A | SEMI | ID stabili; curated |
| 7 | `worldbank-indicators` | 5–15 indicatori paese | Mercati | A | AUTO | CC BY; API 200 |
| 8 | `istat-imprese-demografia` | Stock imprese (denominatore/contesto) | Osservatorio | B | AUTO | Contesto quote |
| 9 | `unioncamere-movimprese` | Natalità/mortalità | Osservatorio | C/D | SEMI | Dinamica imprese |
| 10 | `regione-lombardia-opendata` | 1–2 dataset pilota (stranieri/imprese/bandi) | Multi | A/C | SEMI | Pilota territoriale |
| 11 | `oecd-data-api` | 2–3 indicatori entrepreneurship/migration | Osservatorio | B | AUTO | Confronto internazionale |
| 12 | `opencoesione` | Subset progetti rilevanti (opzionale) | Opp/Oss | C | SEMI | Trasparenza fondi |
| 13 | `ismu-rapporti` | Schede link rapporti | Contenuti | J | MANUAL | Editorial P1 |
| 14 | `unioncamere-futurae-osservatorio` | Link dashboard + PDF | Contenuti | J | MANUAL | Metodologia + narrative |
| 15 | `minlavoro-stranieri-lavoro` | Link rapporti | Contenuti | J | MANUAL | Contesto lavoro |
| 16 | `regione-lombardia-bandi` | Bandi pilota | Opportunità | A/C | SEMI | Complemento incentivi.gov |

---

## 3. Waves

### WAVE D1-A — Quick wins Osservatorio
**Obiettivo:** primi indicatori pubblici verificabili in piattaforma.
**Dataset:** #1, #2, #3, #4, #8, #9 (in ordine).
**Prerequisiti D1.2:** indicator catalog codes; source seed convention; value natural keys; methodology labels non sinonime.
**Out of scope:** scraping Futurae dashboard; profili imprese.

### WAVE D1-B — Opportunità
**Obiettivo:** bandi/incentivi/call curate.
**Dataset:** #5, #6, poi #16, Invitalia dedup.
**Prerequisiti:** dedup key; status mapping; SEMI-AUTO review; no full EU portal dump.

### WAVE D1-C — Mercati
**Obiettivo:** enrichment essenziale per paese/mercato.
**Dataset:** #7; ISTAT commercio estero se stabile; link ICE (no clone).
**Prerequisiti:** decisione M1 resource vs M2 indicator table; max indicator budget.

### WAVE D1-D — Cultura / Eventi / Contenuti
**Obiettivo:** curation, non dump.
**Dataset:** #13–#15; bandi culturali via B; eventi istituzionali filtrati; CulturaItalia solo se relation-value.
**Vincolo C2–C4:** aiuta incontro persone/org/imprese/opportunità?

### WAVE D1-E — Altre fonti
OpenCoesione selettivo; BDS BI se pertinenza; CCIAA solo gap locali; Servizi PA; EMN editorial.

---

## 4. Ordine di lavoro tecnico suggerito

1. **D1.2** — Ingestion contracts + provenance gap decisions (no import ancora o solo dry-run fixtures).
2. **D1.3** — Importer Osservatorio (Unioncamere CSV + 1 Eurostat + 1 ISTAT).
3. **D1.4** — Importer Opportunità (incentivi.gov + SEDIA curated).
4. **D1.5** — Mercati enrichment World Bank selective.
5. **D1.6** — Editorial/content links + pilota Lombardia.
6. Scheduler/freshness — solo dopo contratti stabili.

---

## 5. Criteri go/no-go per ogni dataset in wave

- [ ] Licenza OPEN DATA / riuso chiaro
- [ ] Machine-readable stabile
- [ ] Definizione metodologica documentata
- [ ] Mapping M0/M1 senza forzature
- [ ] Chiave idempotente
- [ ] Nessun PII / no profili
- [ ] Valore utente percepibile
- [ ] Non duplica primaria già scelta

---

## 6. Decisioni umane richieste prima di D1.2

1. Accettare label UI che espongono la definizione camerale “non nati in Italia” (non “stranieri” generico)?
2. Budget massimo indicatori Osservatorio v1 (proposta: ≤ 12)?
3. Review umana obbligatoria su ogni Opportunity importata (proposta: sì)?
4. Pilota Lombardia sì/no in v1?
5. Mercati: solo link/resources (M1) o tabella indicatori (M2)?

---

## 7. Stop line

D1.1 termina qui.
**Non** iniziare D1.2 finché non autorizzato esplicitamente.

---

*Roadmap D1.1*
