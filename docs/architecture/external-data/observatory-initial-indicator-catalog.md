# Observatory Initial Indicator Catalog — D1.2

**Budget Wave D1-A:** max 10–12 famiglie
**Pilot D1.3:** subset 3–5 (vedi colonna Pilot)
**Regola:** definizioni non sinonime; label UI ≠ fusione semantica

---

## 1. Definizione Unioncamere / Futurae (vincolante)

**Denominazione tecnica:** `impresa_straniera_camerale_futurae`

**Definizione originale (Futurae / MLPS–Unioncamere):**
Impresa per la quale la partecipazione del controllo e della proprietà è detenuta in prevalenza (>50%, mediando quote e cariche secondo tipologia d’impresa) da **persone fisiche non nate in Italia**.
**Escluse** le imprese il cui controllo/proprietà è detenuto **solo** da persone giuridiche non residenti (sede legale all’estero).

**Label UI breve proposta:**
«Imprese a controllo di persone nate all’estero»

**Sottotitolo/help obbligatorio:**
«Definizione camerale Futurae (luogo di nascita), non cittadinanza.»

**Non usare come sinonimo automatico:** imprenditori immigrati · titolare straniero · cittadino straniero · impresa a guida straniera (se non allineata alla stessa def.).

**Persistenza:** testo definizione in `observatory_indicators.methodology_summary` + `observatory_statistical_sources.methodology_note`.

**Verifica 2026-08-11:** confermata su report Futurae (integrazionemigranti.gov.it / Unioncamere). OpenGov pubblica CSV locali CCIAA su tema imprenditoria straniera (licenza tip. CC BY 4.0), non un unico dump nazionale machine-readable.

---

## 2. Catalogo famiglie — approvate Wave D1-A (11)

### `OBS-UC-STR-STOCK` — PILOT YES

| Campo | Valore |
|---|---|
| Label UI | Imprese a controllo di persone nate all’estero |
| Technical name | Stock imprese straniere (def. camerale Futurae) |
| Nome originale fonte | Imprese straniere registrate / attive (perimetro report/dataset) |
| Source ID | `unioncamere-opengov` (+ metodologia `unioncamere-futurae-osservatorio`) |
| Dataset ID | OpenGov allowlist CCIAA + extract nazionale Futurae curato |
| Definizione | v. §1 |
| Unità | `units` / count |
| Periodicità | `annual` |
| Territorio | IT (`italy`) + Lombardia (`region` code `ITC4` / label Lombardia) + province pilota se CSV |
| Breakdown | nessuno su famiglia stock totale |
| Periodo | ultimi 3–5 anni se comparabili |
| External key | `OBS-UC-STR-STOCK\|{terr}\|{YYYY}` |
| Acquisizione | C CSV OpenGov; SEMI extract Futurae nazionale |
| Freshness | ANNUAL |
| Revision | SUPERSEDE se stock corretto |
| Publication | AUTO dopo validazione tecnica pilot |
| Priority | P0 |
| License | CC-BY-4.0 per CSV; attribution report Futurae |
| Reason | Core prodotto |

### `OBS-UC-STR-SHARE` — PILOT YES

| Campo | Valore |
|---|---|
| Label UI | Quota sul totale imprese (def. camerale) |
| Technical name | Share imprese straniere / totale imprese stesso perimetro |
| Source | Unioncamere |
| Definizione | stock stranieri / stock totale RI stesso perimetro e data |
| Unità | `percent` |
| Periodicità | annual |
| Territorio | IT + Lombardia |
| External key | `OBS-UC-STR-SHARE\|{terr}\|{YYYY}` |
| Note | Denominatore obbligatorio stessa fonte/edizione |
| Pilot | YES |
| Priority | P0 |

### `OBS-UC-STR-YOY` — PILOT YES (derived o fonte)

| Campo | Valore |
|---|---|
| Label UI | Variazione annua |
| Technical name | YoY % stock imprese straniere (def. camerale) |
| Definizione | (stock_t − stock_t−1) / stock_t−1 × 100 |
| Unità | `percent` |
| Note | Solo se entrambi gli anni usano stessa definizione |
| Pilot | YES se ≥2 anni |
| Priority | P0 |

### `OBS-UC-STR-SECTOR` — PILOT optional / Wave A

| Campo | Valore |
|---|---|
| Label UI | Distribuzione per macrosettore |
| Definizione | Stock per macrosettore Futurae/ATECO aggregato **come da fonte** |
| Dimensions | `dimension_kind=source_macrosector`; **label snapshot**; no force map a `business_sectors` in pilot |
| Pilot | Lombardia se CSV espone settore |
| Priority | P1 |

### `OBS-UC-STR-LEGAL` — Wave A candidate

| Campo | Valore |
|---|---|
| Label UI | Distribuzione per forma giuridica |
| Pilot | NO finché dataset allowlist non espone campo stabile |
| Priority | P2 |

### `OBS-UC-STR-INDIV` — Wave A candidate

| Campo | Valore |
|---|---|
| Label UI | Imprese individuali (def. camerale) |
| Pilot | NO salvo campo esplicito CSV |
| Priority | P2 |

### `OBS-EU-SELF-CIT` — PILOT YES

| Campo | Valore |
|---|---|
| Label UI | Lavoro autonomo per cittadinanza |
| Technical name | Self-employed persons by citizenship (LFS) |
| Nome originale | Self-employed persons by citizenship |
| Source ID | `eurostat-lfsa-esgan` |
| Dataset ID | `lfsa_esgan` |
| Definizione | LFS Eurostat: self-employed; breakdown `citizen` (NAT/FOR/EU/NEU/…) — **cittadinanza, non nascita, non impresa RI** |
| Unità | `THS_PER` → count×1000 in nota; o `PC_EMP` come famiglia separata se usata |
| Periodicità | annual |
| Territorio | IT (`geo=IT`); confronto UE opzionale post-pilot |
| Breakdown | `country_code/label` usati per **cittadinanza statistica** (documentare: non è paese mercato) |
| Sample verified | 2026-08-11 API JSON; dims freq,unit,wstatus,citizen,sex,age,geo,time; updated 2026-06-30 |
| External key | `eurostat:lfsa_esgan\|{unit}\|{wstatus}\|{citizen}\|{sex}\|{age}\|IT\|{YYYY}` |
| Acquisizione | A API |
| Freshness | ANNUAL (check quarterly) |
| Publication | AUTO dopo validazione |
| License | Eurostat reuse + attribution |
| Pilot | YES |
| Priority | P0 |

### `OBS-EU-SELF-CIT-SHARE` — Wave A

| Campo | Valore |
|---|---|
| Label UI | Quota lavoro autonomo (cittadinanza estera) |
| Dataset | `lfsa_esgan` unit `PC_EMP` o derived |
| Pilot | NO in D1.3A (evitare overload) |
| Priority | P1 |

### `OBS-IST-FOR-STOCK` — Wave A

| Campo | Valore |
|---|---|
| Label UI | Popolazione straniera residente |
| Source | ISTAT SDMX |
| Definizione | Cittadini stranieri — **contesto demografico** |
| Pilot | NO (seconda fase Osservatorio) |
| Priority | P1 |

### `OBS-IST-SELF` — Wave A

| Campo | Valore |
|---|---|
| Label UI | Lavoro autonomo (ISTAT) |
| Note | Solo se serie con metadata cittadinanza; altrimenti defer a Eurostat |
| Pilot | NO |
| Priority | P2 |

### `OBS-MP-SALDO` — Wave A late

| Campo | Valore |
|---|---|
| Label UI | Saldo iscrizioni−cessazioni (Movimprese) |
| Definizione | Totale imprese RI — **non** solo straniere |
| Pilot | NO |
| Priority | P2 |

---

## 3. Indicatori / concetti RESPINTI

| Concetto | Motivo |
|---|---|
| «Imprenditori immigrati» come indicatore unico | Label giornalistica; non allineata a def. camerale |
| Fusione nascita↔cittadinanza↔impresa | Semantica distinta |
| Genere imprese straniere | Dataset OpenGov allowlist non solidi per pilot |
| Paese di nascita self-employment | Non in `lfsa_esgan` (citizen ≠ birth) |
| Titolari/imprenditori nominativi | Privacy + no profili |
| Addetti imprese straniere | Utile ma secondario; rischio def. addetti |
| Dump tutte le province IT OpenGov | Fuori scope pilota; rumore |

---

## 4. Territori — crosswalk (progetto, non implementato)

| External | Internal value fields |
|---|---|
| IT / ITALIA | `territory_level='italy'`, `territory_code='IT'`, `territory_label='Italia'` |
| Lombardia / ITC4 / 03 | `territory_level='region'`, `territory_code='ITC4'`, `territory_label='Lombardia'` |
| Province ISTAT (es. 019 Cremona) | `territory_level='province'`, code ISTAT/NUTS3 ufficiale, label ufficiale |
| Eurostat `geo=IT` | come Italia |

Divieto: string matching fuzzy su nomi. Allowlist codes in config importer.

---

## 5. Dimensioni / classificazioni

| Breakdown | Strategia pilot |
|---|---|
| Macrosettore Futurae | **source-specific dimension** via label in `methodology_note` o indicator dedicato per settore; **no** FK `business_sectors` forzata |
| Forma giuridica | label snapshot |
| Cittadinanza Eurostat | `country_code` = codice citizen Eurostat; `country_label` = label ufficiale; nota: non è market country |
| ATECO↔NACE | **nessun mapping arbitrario** in D1.3 |

---

## 6. Matrice mapping — Pilot D1.3

### 6.1 Eurostat `lfsa_esgan`

| EXTERNAL FIELD | NORMALIZED | DOMAIN FIELD | TRANSFORM | VALIDATION | REQ | EXAMPLE |
|---|---|---|---|---|---|---|
| dataset code | dataset_id | source.external_identifier | const `eurostat:lfsa_esgan` | allowlist | Y | lfsa_esgan |
| geo | territory | territory_* | IT→italy/IT/Italia | geo∈allowlist | Y | IT |
| time | period | period_start/end | YYYY→Jan1–Dec31 | 2019–2025 | Y | 2024 |
| citizen | citizenship dim | country_code/label | map Eurostat code→label | code∈citizen set | Y | FOR |
| unit | unit | indicator.unit_code / note | THS_PER→units + note thousands | unit∈{THS_PER} pilot | Y | THS_PER |
| wstatus | employment status | filter | only SELF in pilot | =SELF | Y | SELF |
| sex | — | filter | only T | =T | Y | T |
| age | — | filter | Y15-64 | =Y15-64 | Y | Y15-64 |
| value | measure | numeric_value | number; ×1000 documentato in methodology se THS | finite ≥0 | Y | 4223.1 |
| updated | source version | edition_label / run log | ISO datetime | present | N | 2026-06-30… |
| status flags (u) | quality | quality_code | u→estimated else official | — | N | u |

### 6.2 Unioncamere OpenGov CSV (template generico)

| EXTERNAL FIELD | NORMALIZED | DOMAIN FIELD | TRANSFORM | VALIDATION | REQ | EXAMPLE |
|---|---|---|---|---|---|---|
| dataset page URL | source_url | sources.url | allowlist | https OpenGov | Y | …/P51F520/… |
| license meta | license | license_note | must contain CC-BY | ALLOW_INGEST | Y | CC BY 4.0 |
| anno | period | period_* | int year | range | Y | 2024 |
| territorio | territory | territory_* | crosswalk ISTAT | mappable | Y | Pavia |
| n_imprese_straniere / equivalente | stock | numeric_value | parse number | ≥0 | Y | 1234 |
| n_imprese_totali | total | used for SHARE | parse | ≥ stock | N | 10000 |
| settore | sector dim | label snapshot | as-is fonte | optional | N | Costruzioni |
| — | definition | methodology_* | inject Futurae def text | non empty | Y | §1 |

> Nomi colonna CSV variano per CCIAA: D1.3 manterrà **adapter per dataset allowlist**, non un parser universale fragile.

### 6.3 Futurae national extract (SEMI)

| EXTERNAL | NORMALIZED | DOMAIN | TRANSFORM | VALIDATION | REQ |
|---|---|---|---|---|---|
| report edition | edition | edition_label / source_published_on | manual curate | edition known | Y |
| stock IT year | stock | value | from table | matches report | Y |
| share / yoy | derived or table | value | formula | consistency | N |

Formato curato proposto: JSON lines in config repo (non DB seed massivo) validato in dry-run.

---

## 7. Sample tecnico Eurostat (estratto minimo)

Verifica READ-ONLY 2026-08-11:

- Endpoint: `.../data/lfsa_esgan?format=JSON&lang=en&geo=IT&lastTimePeriod=3&sex=T&age=Y15-64`
- Label: `Self-employed persons by citizenship`
- Updated: `2026-06-30T11:00:00+0200`
- Dimensions: `freq, unit, wstatus, citizen, sex, age, geo, time`
- Units: `THS_PER`, `PC_EMP`
- wstatus: `SELF`, `SELF_S`, `SELF_NS`
- citizen: `NAT`, `FOR`, `EU27_2020_FOR`, `NEU27_2020_FOR`, …

Nessun dato persistito nel DB applicativo.

---

*Fine catalog D1.2*
