# Source notes — ISTAT / Unioncamere / Eurostat

**Verifica:** 2026-08-11
**Scope:** prove tecniche e avvertenze metodologiche per Wave D1-A

---

## ISTAT SDMX

- Base: `https://esploradati.istat.it/SDMXWS/rest`
- Probe: `GET .../dataflow/IT1/all/latest?detail=allstubs` → HTTP **200**
- Accept tipici: `application/vnd.sdmx.structure+json;version=1.0` / data JSON
- Licenza riuso: **CC BY 4.0**
- Operativo: rispettare rate limit (~5/min); non usare crawler aggressivi
- Nota: bug storici su filtri `endPeriod` — validare query in D1.2 con campione piccolo

### Serie prioritarie da risolvere in D1.2 (codici dataflow)

1. Popolazione / cittadini stranieri (territoriale)
2. Paese di nascita (se esposto)
3. Forze di lavoro — indipendenti/autonomi (+ cittadinanza se disponibile)
4. Demografia imprese / stock imprese

Non pubblicare UI che etichetta questi come “imprese straniere”.

---

## Unioncamere

### Open Government / Open Data
- Dataset CSV + metadati DCAT
- Tema rilevante: imprenditoria straniera / imprese straniere
- Licenza tipica open data: **CC-BY 4.0** (verificare file-per-file)
- Acquisition: C/E — preferire CSV ufficiale allo scraping HTML

### Futurae / Osservatorio imprese straniere
- Pagina: https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere
- Strumenti: dashboard + rapporti (progetto con MLPS / FNPM)
- Definizione da preservare nei metadata:
  > impresa con partecipazione/controllo prevalente di persone fisiche **non nate in Italia**
- **Non** sinonimi: cittadino straniero, titolare con cittadinanza X, “imprenditore immigrato” giornalistico
- Decisione: usare per metodologia e contenuti; numeri da CSV OpenGov quando esistono

### Movimprese
- Dinamica iscrizioni/cessazioni/saldo Registro Imprese
- Formati misti CSV/XLSX/PDF
- SEMI-AUTO; natural key `period × territory × measure`

### Dedup
Primary per aggregati nazionali: Unioncamere/InfoCamere.
CCIAA locali solo per gap non ridondanti.

---

## Eurostat

- Dissemination API: `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{code}`
- Probe: `lfsa_esgan` → HTTP **200**
- Significato `lfsa_esgan`: self-employment by citizenship (LFS)
- Uso: confronto internazionale; per Italia preferire anche serie ISTAT allineate con nota di comparabilità
- Altri codici candidati (shortlist D1.2): famiglia `migr_*`, `lfst_*`, business demography `bd_*`, culture employment (defer)

---

## Matrice semantica (non riconciliare)

| Concetto | Fonte tipica | Usare per |
|---|---|---|
| Impresa (def. camerale non nati in IT) | Unioncamere | Core Osservatorio imprese |
| Cittadino straniero | ISTAT | Contesto demografico |
| Nato all’estero | ISTAT (se serie) | Contesto; allineabile a def. camerale **solo con nota** |
| Self-employed by citizenship | Eurostat/ISTAT LFS | Lavoro autonomo, non RI |
| Impresa attiva ASIA | ISTAT | Denominatore/contesto diverso da RI |

---

*Fine note*
