# External Data → Domain Mapping — D1.1

**Fase:** D1.1 (research-only)
**Compatibilità:** M0 modello esistente · M1 catalog/seed/provenance minima · M2 estensione additive · M3 nuovo modello significativo · M4 incompatibile
**Nota:** M1–M4 **non** implementati in D1.1.

---

## 1. Baseline modello (repository)

### Osservatorio
- AR: `observatory_indicators`
- Fonti: `observatory_statistical_sources` (`producer_name`, `url`, `external_identifier`, `license_note`, `methodology_note`, `source_published_on`, …)
- Valori: `observatory_indicator_values` (`numeric_value`, periodo, territorio opaco, settore FK opz., country opaco, `source_id` obbligatorio, status/publication)

### Opportunità
- AR opportunities + `opportunity_sources` (`url`, `external_identifier`, …)
- Temporalità, status editoriale/pubblicazione, territori etichetta, requisiti statement
- Forte idoneità a bandi/incentivi/call con identity esterna

### Mercati internazionali
- Markets + `country_ref` opaco + support resources
- Nessun catalogo indicatori macro dedicato; enrichment via note/resources o M2 futuro

### Eventi / Organizzazioni / Servizi / Contenuti
- Identity esterna debole o assente in ciclo 1
- Cultura: hub trasversale C2–C4 — **nessun Cultural AR**

### Provenance gap trasversale (documentato, non patchato)
Manca spesso: `retrieved_at`, ingest run id, license code strutturato, methodology URI, update cadence, per-value external observation id. Vedi report § Provenance gaps.

---

## 2. Matrice dataset → dominio

### 2.1 Osservatorio

| Fonte | Dataset / risorsa | Dato | Dominio | Entità candidata | Compat. | Gap | Provenienza necessaria | Metodo ingestion | Freq. | Priorità | Decisione |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Unioncamere OpenGov | Imprenditoria straniera (CSV open) | Stock imprese a partecipazione/controllo prevalente PF non nate in Italia; breakdown territorio/settore se presenti | Osservatorio | `observatory_indicators` + `_values` + `_statistical_sources` | M0/M1 | Mapping codici territorio→`territory_*`; definizione label obbligatoria | producer Unioncamere; license CC-BY; methodology Futurae/OpenGov; URL dataset; external_id = source+dataset+period+dims | C CSV | ANNUAL | P0 | **PILOT** |
| Unioncamere Futurae | Dashboard/rapporti | Stesse grandezze + narrative | Osservatorio / Contenuti | source + content link | M1 (numeri solo se open) | No scraping celle | Citare open data primario | I/J | EVENT | P0 | SEMI/EDITORIAL |
| Movimprese | Natalità/mortalità/saldo | Iscrizioni, cessazioni, saldo | Osservatorio | indicators/values/sources | M1 | License per file; natural key periodo×territorio | InfoCamere/Unioncamere | C/D | QUARTERLY | P1 | CANDIDATE |
| ISTAT SDMX | Demografia stranieri | Stock cittadini stranieri; bilanci | Osservatorio | indicators/values/sources | M0 | Dataflow codes D1.2; non confondere con imprese | ISTAT CC BY; SDMX keys | B | ANNUAL | P0 | CANDIDATE |
| ISTAT SDMX | Lavoro autonomo / FL | Occupati indipendenti; cittadinanza se disponibile | Osservatorio | indicators/values/sources | M0 | ≠ imprese camerali | ISTAT | B | Q/A | P0 | CANDIDATE |
| ISTAT SDMX | Demografia imprese / ASIA | Stock imprese; natalità/mortalità | Osservatorio | indicators/values/sources | M0/M1 | Perimetro ≠ Movimprese | ISTAT | B | ANNUAL | P1 | CANDIDATE |
| Eurostat | `lfsa_esgan` | Self-employment by citizenship | Osservatorio | indicators/values/sources | M0 | Confrontabilità IT vs ISTAT | Eurostat code + dims | A/B | ANNUAL | P0 | **PILOT** |
| Eurostat | migr_*/lfst_* (selected) | Migration labour | Osservatorio | indicators/values/sources | M0 | Selezione corta | Eurostat | A/B | ANNUAL | P1 | CANDIDATE |
| Eurostat | business demography | Births/deaths UE | Osservatorio | indicators/values/sources | M0 | vs Movimprese | Eurostat | A/B | ANNUAL | P2 | CANDIDATE |
| OECD | Entrepreneurship / migration selected | Confronti internazionali | Osservatorio | indicators/values/sources | M0/M1 | T&C OECD; pochi indicatori | OECD SDMX ids | B | VAR | P2 | CANDIDATE |
| Banca d’Italia BDS | Cubi economia territoriale/credito | Indicatori aggregati | Osservatorio | indicators/values/sources | M1 | Pertinenza da dimostrare | BI object id | A/C | VAR | P3 | DEFER |
| ISMU | Rapporti | Tavole derivate | Osservatorio | — | M4 as primary | Sempre secondario | — | J | ANNUAL | — | REJECT as primary |
| Stampa | Articoli “secondo Unioncamere” | Numeri citati | Osservatorio | — | M4 | — | — | — | — | — | REJECT |

### 2.2 Opportunità

| Fonte | Dataset | Dato | Dominio | Entità | Compat. | Gap | Provenienza | Metodo | Freq. | Priorità | Decisione |
|---|---|---|---|---|---|---|---|---|---|---|---|
| incentivi.gov.it | Open data misure | Misure/incentivi, admin, territori, settori, date, stato, URL | Opportunità | `opportunities` + `opportunity_sources` (+ territori/requisiti) | M0/M1 | Dedup key = id misura; mapping status→assi editoriali/pubblicazione; review umana | IODL 2.0; URL ufficiale; external_identifier | C JSON/CSV | EVENT | P0 | **PILOT** |
| EU Funding & Tenders | SEDIA search (filtered) | Call/topic, opening, deadline, status, programme, URL | Opportunità | opportunities + sources | M0/M1 | Filtro topic; eligibility come requirement statement | EC call id | A | EVENT | P0 | **PILOT curated** |
| Regione Lombardia Bandi | Bandi regionali | Bandi locali | Opportunità | opportunities + sources | M1 | Pilota geografico; dedup vs incentivi.gov | RL id | A/C/H | EVENT | P1 | CANDIDATE |
| OpenCoesione | Progetti | Finanziamenti/progetti | Opportunità / Oss. | opportunities? o content | M2/M3 | Progetto ≠ call aperta | OpenCoesione code | C | PERIODIC | P2 | CANDIDATE selettivo |
| Invitalia | Pagine misure | Misure | Opportunità | opportunities + sources | M1 | Dedup incentivi.gov | URL | H/J | EVENT | P1 | CANDIDATE |
| CCIAA bandi | Bandi camerali | Bandi | Opportunità | opportunities + sources | M1 | Locale | URL | H/C | EVENT | P2 | DEFER |

**Identity / dedup Opportunity (proposta D1.2):**
`source_system + external_identifier` univoco; fallback `canonical_url`; versioning su update timestamp fonte.

### 2.3 Mercati internazionali

| Fonte | Dataset | Dato | Dominio | Entità | Compat. | Gap | Provenienza | Metodo | Freq. | Priorità | Decisione |
|---|---|---|---|---|---|---|---|---|---|---|---|
| World Bank | Indicators (selected 5–15) | PIL, crescita, pop, trade essentials | Mercati | support_resources e/o M2 indicator attach | M1/M2 | Nessuna tabella indicatori mercato dedicata | WB indicator+country+year; CC BY | A | ANNUAL | P1 | **PILOT selective** |
| ISTAT | Commercio estero (se dataflow) | Export/import IT | Mercati / Oss. | indicators o market resources | M0/M1 | Mapping paese→`country_ref` | ISTAT | B | VAR | P1 | CANDIDATE |
| ICE | Statistiche/opportunità paese | Export, settori, opportunità | Mercati | support_resources (link) | M1 / M4 bulk | Gate registrazione | ICE URL | J/E | UNK | P1 | DEFER bulk; LINK ok |
| OECD | Selected country indicators | Confronti | Mercati | resources / M2 | M1/M2 | T&C | OECD | B | VAR | P2 | CANDIDATE |
| Eurostat | Trade / business (selected) | Contesto UE | Mercati | resources | M1 | — | Eurostat | A | VAR | P2 | DEFER |

**Principio:** arricchire Mercati, non clonare ICE/World Bank.

### 2.4 Cultura

| Fonte | Dataset | Dato | Dominio | Entità | Compat. | Gap | Note | Decisione |
|---|---|---|---|---|---|---|---|---|
| Eurostat culture employment | Stats ICC | Cultura trasversale / Osservatorio | indicators o content | M0/M1 | Solo se use-case incontro/ICC | DEFER |
| CulturaItalia LOD | Luoghi/istituzioni | Organizzazioni / contenuti | organizations? content | M2 | Selettivo; no dump patrimonio | DEFER selective |
| Bandi culturali (incentivi/EU) | Opportunity | Opportunità | opportunities | M0 | Filtro culturale | via Wave B |
| Eventi culturali istituzionali | Event | Eventi | events | M2/M3 | Criteri rilevanza; no “tutti gli eventi IT” | DEFER |

### 2.5 Eventi

| Fonte | Tipo | Compat. | Criteri rilevanza (non implementati) | Decisione |
|---|---|---|---|---|
| Portali istituzionali / camere / regioni | Event metadata | M2–M3 (external_id eventi debole) | imprenditoria, networking, internazionalizzazione, lavoro, innovazione, intercultura, ICC, fiere, incontri professionali | CANDIDATE selettivo Wave D |
| CulturaItalia eventi | Metadata | M2 | Solo se incontro/rete | DEFER |

### 2.6 Notizie e guide / Contenuti

| Fonte | Tipo | Compat. | Copyright | Decisione |
|---|---|---|---|---|
| ISMU, MLPS, EMN, Università, fondazioni | EDITORIAL SOURCE | M0 content as link/curation | METADATA / LINKABLE; no full-text copy | CANDIDATE manual |
| Sole 24 Ore / Radio 24 / ANSA | EDITORIAL | M0 link card | RESTRICTED full text | LINK metadata only |
| Rapporti Unioncamere/Futurae PDF | EDITORIAL + pointer a dati | M0 content | citazione + link | CANDIDATE |

### 2.7 Organizzazioni

| Fonte | Dato | Compat. | Decisione |
|---|---|---|---|
| CulturaItalia istituzioni | Enti culturali | M2 | DEFER selective |
| PA / camere come organizer Opportunity | External subject su opportunity | M0 | via Opportunity ingestion |
| Elenchi imprese private web | — | M4 | **REJECT** (no auto-profili) |

### 2.8 Servizi

| Fonte | Dato | Compat. | Decisione |
|---|---|---|---|
| Cataloghi PA servizi (RL Bandi e Servizi, ecc.) | Servizi istituzionali | M2/M3 | DEFER Wave E |
| Servizi community | — | — | Restano flussi piattaforma |

---

## 3. Catalogo indicatori candidati Osservatorio

> Definizioni **non** sinonime. Ogni riga preserva la semantica fonte.

| ID candidato | Denominazione originale (fonte) | Label UI proposta | Definizione | Numeratore | Denominatore | Unità | Freq. | Territorio | Breakdown | Fonte | Note metodologiche | Comparabilità | Decisione |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `IND-UC-STR-STOCK` | Imprese straniere / a partecipazione prevalente di PF non nate in Italia | Imprese a guida di persone nate all’estero (def. camerale) | Perimetro camerale Futurae/OpenGov | Conteggio imprese | — | count | A | IT/reg/prov | settore, forma giur. se presenti | `unioncamere-opengov` | **Non** = cittadino straniero | Serie se definizione stabile | PILOT |
| `IND-UC-STR-SHARE` | Quota imprese straniere sul totale | Quota imprese (def. camerale) sul totale | stock stranieri / stock totale stesso perimetro | stock stranieri | stock totale RI | % | A | IT/reg | — | Unioncamere | Denominatore stesso registro | Alta se stessa edizione | PILOT |
| `IND-UC-STR-GROWTH` | Variazione annua stock | Crescita annua imprese (def. camerale) | Δ% anno su anno | stock_t − stock_t-1 | stock_t-1 | % | A | IT/reg | — | Unioncamere | Attenzione cambi definizione | Media | CANDIDATE |
| `IND-MP-REG` | Iscrizioni Movimprese | Nuove iscrizioni imprese | Iscrizioni RI | count | — | count | Q | IT/reg/prov | — | Movimprese | Totale, non solo straniere | Alta | CANDIDATE |
| `IND-MP-CESS` | Cessazioni Movimprese | Cessazioni imprese | Cessazioni RI | count | — | count | Q | IT/reg/prov | — | Movimprese | — | Alta | CANDIDATE |
| `IND-MP-SALDO` | Saldo Movimprese | Saldo iscrizioni−cessazioni | saldo | — | — | count | Q | IT/reg/prov | — | Movimprese | — | Alta | CANDIDATE |
| `IND-IST-FOR-STOCK` | Cittadini stranieri residenti | Popolazione straniera residente | Def. ISTAT demografia | stock | — | count | A | IT/reg/prov | cittadinanza | ISTAT | **Non** imprese | Alta | CANDIDATE |
| `IND-IST-COB` | Popolazione per paese di nascita (se serie) | Nati all’estero | Def. ISTAT | stock | — | count | A | IT | — | ISTAT | ≠ cittadinanza | Verificare disponibilità | CANDIDATE |
| `IND-IST-SELF` | Lavoratori indipendenti | Lavoro autonomo | FL ISTAT | count | — | count | Q/A | IT | cittadinanza se c’è | ISTAT | ≠ impresa RI | Media vs Eurostat | CANDIDATE |
| `IND-EU-SELF-CIT` | Self-employed by citizenship | Lavoro autonomo per cittadinanza (UE) | LFS Eurostat `lfsa_esgan` | count | — | count | A | IT/EU | citizenship | Eurostat | Confronto; non camerale | Alta in UE | PILOT |
| `IND-IST-FIRM-STOCK` | Imprese attive (ASIA/ISTAT) | Imprese attive (ISTAT) | Perimetro ISTAT | count | — | count | A | IT | settore | ISTAT | ≠ Movimprese | Documentare | CANDIDATE |
| Genere / addetti / forma giuridica stranieri | Dove pubblicati open | Come da fonte | Come da metadata | — | — | — | — | — | — | Unioncamere/ISTAT | Solo se espliciti | — | CANDIDATE se presenti |

**Esplicitamente NON riconciliati in un unico indicatore:**
impresa straniera · impresa a guida straniera · titolare straniero · imprenditore immigrato · nato all’estero · cittadino straniero.

---

## 4. Gap analysis (A–E)

| Classe | Cosa |
|---|---|
| **A — importabile con schema esistente (M0)** | Valori Osservatorio aggregati ISTAT/Eurostat/Unioncamere CSV; Opportunity da incentivi.gov + EU calls curated; Content link cards |
| **B — solo provenance/seed minima (M1)** | Seed `observatory_statistical_sources`; convention `external_identifier`; license_note/methodology_note; opportunity_sources |
| **C — piccole estensioni additive (M2)** | `retrieved_at` / ingest_run; observation external_id su values; market indicator attach; event external_id; structured license code |
| **D — nuovo modello significativo (M3)** | Catalogo Territori condiviso; AR Cultural; warehouse indicatori multi-fonte automatico completo; anagrafiche imprese esterne |
| **E — non conviene / vietato** | Profili persone/imprese da web; scraping stampa come primaria; dump F&T; dump patrimonio MiC; microdati; ICE bulk gated |

---

## 5. Provenance mapping vs schema attuale

| Esigenza D1 | Osservatorio oggi | Opportunità oggi | Gap D1.2 |
|---|---|---|---|
| source name/producer | `producer_name`, `name` | `opportunity_sources` | — |
| source URL | `url` | `url` | — |
| external ID | `external_identifier` (source-level UNIQUE) | `external_identifier` | per-value / per-opportunity run |
| retrieved_at | assente | assente | M2 consigliato |
| published_at (fonte) | `source_published_on` | campi ufficiali Opportunity | — |
| period | `period_start/end` su values | temporalità Opportunity | — |
| methodology | `methodology_note` | requirements/evidence text | URI metodologia |
| license | `license_note` text | assente strutturato | license code |
| attribution | in note | — | template attribution |
| update cadence | assente | assente | metadata ingest |

---

## 6. Idempotenza (contratti futuri)

| Dominio | Chiave naturale proposta |
|---|---|
| Osservatorio value | `indicator_code + source_external_id + period_start + period_end + territory_code + sector_id? + country_code? + breakdown_hash` |
| Opportunity | `source_system + external_identifier` |
| Market indicator (futuro) | `market_id/country_ref + indicator_code + year + source` |
| Content editorial | `canonical_url` |

Re-run deve upsert, non duplicare.

---

*Fine mapping D1.1 — nessuna migration/ingestion.*
