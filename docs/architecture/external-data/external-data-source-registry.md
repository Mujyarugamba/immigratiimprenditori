# External Data Source Registry — D1.1

**Progetto:** Immigrati Imprenditori
**Fase:** D1.1 — External Public Data Source Registry & Acquisition Discovery
**Stato:** discovery / research-only (nessuna ingestion)
**Verifica web:** 2026-08-11
**Baseline git:** `795e2abaa1851a16f2f8d0c7ef1cc9939b416862`

---

## Legenda campi

| Campo | Significato |
|---|---|
| Source ID | Identità stabile leggibile (non URL) |
| Tipo fonte | P0 primaria istituzionale · P1 ricerca/originale · P2 rapporto scientifico · P3 editoriale che cita primaria · P4 secondaria web |
| Acquisition mode | A API · B SDMX · C CSV/JSON/XML · D XLSX · E open-data download · F LOD/SPARQL · G RSS · H HTML · I PDF · J manual |
| Automation | AUTO · SEMI-AUTO · MANUAL |
| Freshness | STATIC · ANNUAL · QUARTERLY · MONTHLY · WEEKLY · DAILY · EVENT-DRIVEN · UNKNOWN |
| Copyright class | OPEN DATA · OPEN CONTENT · METADATA RIUTILIZZABILI · LINKABLE · RESTRICTED · UNKNOWN |
| Quality score | Authority + Machine readability + Licensing clarity + Update reliability + Domain relevance + Methodological clarity (0–5 ciascuno, tot /30) |
| Decisione D1.1 | CANDIDATE · PILOT · DEFER · REJECT · EDITORIAL-ONLY · NOMINATIVE-FLAG |

---

## Principi vincolanti (riepilogo)

1. Preferire P0/P1; risalire sempre alla fonte primaria per indicatori.
2. Non auto-popolare profili Persone/Imprese da scraping nominativo.
3. Non confondere: *impresa straniera* ≠ *guida straniera* ≠ *titolare straniero* ≠ *nato all’estero* ≠ *cittadino straniero*.
4. Cultura = livello trasversale (C2/C3/C4); non Cultural AR; non dump patrimonio.
5. ACQUIRE ≠ VALIDATE ≠ PUBLISH.

---

## Indice Source ID

| Source ID | Ente | Domini principali | Decisione |
|---|---|---|---|
| `istat-istatdata-sdmx` | ISTAT | Osservatorio | PILOT |
| `istat-stranieri-demografia` | ISTAT | Osservatorio | CANDIDATE |
| `istat-occupazione-autonomo` | ISTAT | Osservatorio | CANDIDATE |
| `istat-imprese-demografia` | ISTAT | Osservatorio | CANDIDATE |
| `unioncamere-opengov` | Unioncamere | Osservatorio | PILOT |
| `unioncamere-movimprese` | Unioncamere / InfoCamere | Osservatorio | CANDIDATE |
| `unioncamere-futurae-osservatorio` | Unioncamere / MLPS | Osservatorio | SEMI / EDITORIAL |
| `eurostat-lfsa-esgan` | Eurostat | Osservatorio | PILOT |
| `eurostat-migration-labour` | Eurostat | Osservatorio | CANDIDATE |
| `eurostat-business-demography` | Eurostat | Osservatorio | CANDIDATE |
| `eurostat-culture-employment` | Eurostat | Cultura (stats) | DEFER |
| `incentivi-gov-opendata` | Governo IT | Opportunità | PILOT |
| `eu-funding-tenders-sedia` | Commissione UE | Opportunità | PILOT (curated) |
| `ice-statistiche-estero` | ICE | Mercati / Osservatorio | DEFER (gate) |
| `mic-culturaitalia-lod` | MiC | Cultura / Org | DEFER selective |
| `regione-lombardia-opendata` | Regione Lombardia | Multi (pilota) | PILOT regional |
| `regione-lombardia-bandi` | Regione Lombardia | Opportunità | CANDIDATE |
| `cciaa-milano-opendata` | CCIAA Milano | Osservatorio / Opp | DEFER (dedup) |
| `ismu-rapporti` | ISMU ETS | Contenuti / Oss. contesto | EDITORIAL-ONLY |
| `bancaditalia-bds` | Banca d’Italia | Osservatorio / Mercati | DEFER |
| `oecd-data-api` | OECD | Osservatorio / Mercati | CANDIDATE |
| `worldbank-indicators` | World Bank | Mercati | PILOT selective |
| `dati-gov-it-catalog` | AgID / PA | Discovery hub | META |
| `opencoesione` | Agenzia Coesione | Opportunità / Oss. | CANDIDATE |
| `invitalia-opportunita` | Invitalia | Opportunità | CANDIDATE |
| `minlavoro-stranieri-lavoro` | Ministero Lavoro | Osservatorio / Contenuti | EDITORIAL+ |
| `emn-european-migration-network` | EMN / UE | Contenuti | EDITORIAL-ONLY |

---

## Schede fonti

### `istat-istatdata-sdmx`

| Campo | Valore |
|---|---|
| Nome | IstatData / EsploraDati SDMX |
| Ente | ISTAT — Istituto Nazionale di Statistica |
| Paese/territorio | Italia (+ confronti UE via serie correlate) |
| URL principale | https://esploradati.istat.it/ |
| Dataset/resource URL | https://esploradati.istat.it/ (catalogo dataflow) |
| API URL | `https://esploradati.istat.it/SDMXWS/rest` (SDMX REST) |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio (primario); contesto Mercati/Cultura per selected series |
| Descrizione | Piattaforma ufficiale di diffusione statistica ISTAT con API SDMX REST, dataflow, metadata strutturali e serie storiche. |
| Granularità | Aggregata (territoriale NUTS/regioni/province a seconda del dataflow; nessuna persona/impresa nominativa) |
| Copertura geografica | Italia; breakdown territoriali per dataflow |
| Copertura temporale | Serie storiche multi-decennio (per dataflow) |
| Aggiornamento | Misto ANNUAL / QUARTERLY / MONTHLY per dataflow |
| Formato | SDMX-JSON / SDMX-ML / CSV via negoziazione |
| Machine-readable? | Sì |
| Stable external ID? | Sì — agency/dataflow/series keys SDMX |
| Licenza | CC BY 4.0 (dichiarazione ISTAT riuso dati; verificare pagina legale corrente) |
| Attribuzione | Richiesta tipica CC BY: citare ISTAT + dataset + data retrieval |
| Automatizzabile? | AUTO (con rate limit ~5 req/min e attenzione a bug noti su `endPeriod`) |
| Metodo acquisizione | B (SDMX) |
| Livello affidabilità | Altissimo (produttore ufficiale) |
| Rischio duplicazione | Alto vs Eurostat su indicatori UE allineati — preferire ISTAT per Italia nazionale |
| Rischio metodologico | Medio: definizioni cambiano tra rilevazioni; documentare methodology_note |
| Privacy/PII | Aggregati; evitare microdati |
| Note | Prova HTTP 200 su dataflow stubs `.../SDMXWS/rest/dataflow/IT1/all/latest` (2026-08-11). Documentazione Developers Italia / ISTAT. |
| Quality score | 5+5+5+4+5+4 = **28/30** |
| Decisione D1.1 | **PILOT** — canale primario nazionale per Osservatorio |

---

### `istat-stranieri-demografia`

| Campo | Valore |
|---|---|
| Nome | Popolazione straniera / cittadinanza / paese di nascita (serie ISTAT) |
| Ente | ISTAT |
| Paese/territorio | Italia |
| URL principale | https://www.istat.it/ · https://esploradati.istat.it/ |
| Dataset/resource URL | Dataflow demografia/stranieri su IstatData (selezionare per codice stabile in D1.2) |
| API URL | via `istat-istatdata-sdmx` |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio |
| Descrizione | Stock e flussi demografici: cittadini stranieri, paese di nascita, bilanci demografici. Contesto per imprenditoria, non sinonimo di “imprese straniere”. |
| Granularità | Territoriale aggregata |
| Copertura geografica | Italia / regioni / province (per serie) |
| Copertura temporale | Serie annuali tipiche |
| Aggiornamento | ANNUAL (prevalente) |
| Formato | SDMX / CSV |
| Machine-readable? | Sì |
| Stable external ID? | Sì (dataflow + dimensions) |
| Licenza | CC BY 4.0 |
| Attribuzione | ISTAT |
| Automatizzabile? | AUTO |
| Metodo acquisizione | B |
| Livello affidabilità | Altissimo |
| Rischio duplicazione | Medio vs Eurostat migr_*; preferire ISTAT per Italia |
| Rischio metodologico | Alto se usato come proxy di imprenditoria — **vietato** senza bridging esplicito |
| Privacy/PII | Aggregati |
| Note | Indicatori di contesto demografico; label UI devono dire “cittadini stranieri / nati all’estero”, non “imprenditori immigrati”. |
| Quality score | 5+5+5+4+4+5 = **28/30** |
| Decisione D1.1 | **CANDIDATE** (Wave D1-A contesto) |

---

### `istat-occupazione-autonomo`

| Campo | Valore |
|---|---|
| Nome | Occupazione / lavoro autonomo / forze di lavoro |
| Ente | ISTAT |
| Paese/territorio | Italia |
| URL principale | https://esploradati.istat.it/ |
| Dataset/resource URL | Rilevazione forze di lavoro e correlati (codici dataflow da fissare in D1.2) |
| API URL | via `istat-istatdata-sdmx` |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio |
| Descrizione | Occupati, indipendenti/autonomi, eventuali breakdown per cittadinanza dove pubblicati. |
| Granularità | Aggregata |
| Copertura geografica | Italia + territori |
| Copertura temporale | Serie |
| Aggiornamento | QUARTERLY / ANNUAL |
| Formato | SDMX |
| Machine-readable? | Sì |
| Stable external ID? | Sì |
| Licenza | CC BY 4.0 |
| Attribuzione | ISTAT |
| Automatizzabile? | AUTO |
| Metodo acquisizione | B |
| Livello affidabilità | Altissimo |
| Rischio duplicazione | Alto vs Eurostat LFS (`lfsa_*`) — allineare definizioni ILO |
| Rischio metodologico | “Lavoro autonomo” ≠ “impresa iscritta al Registro Imprese” |
| Privacy/PII | Aggregati |
| Note | Utilizzare solo serie con metadata espliciti su cittadinanza/paese di nascita. |
| Quality score | 5+5+5+4+5+4 = **28/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `istat-imprese-demografia`

| Campo | Valore |
|---|---|
| Nome | Demografia delle imprese / ASIA / imprese attive (serie ISTAT) |
| Ente | ISTAT |
| Paese/territorio | Italia |
| URL principale | https://www.istat.it/ · IstatData |
| Dataset/resource URL | Dataflow demografia imprese / stock imprese |
| API URL | via `istat-istatdata-sdmx` |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio |
| Descrizione | Stock imprese, natalità/mortalità dove disponibili; base denominatore per quote “imprese straniere” da fonti camerali. |
| Granularità | Aggregata (settore/territorio) |
| Copertura geografica | Italia |
| Copertura temporale | Annuale tipica |
| Aggiornamento | ANNUAL |
| Formato | SDMX / CSV / XLSX pubblicazioni |
| Machine-readable? | Sì (SDMX); D per fascicoli |
| Stable external ID? | Sì su SDMX |
| Licenza | CC BY 4.0 |
| Attribuzione | ISTAT |
| Automatizzabile? | AUTO su SDMX; SEMI su XLSX |
| Metodo acquisizione | B / D |
| Livello affidabilità | Altissimo |
| Rischio duplicazione | Alto vs Movimprese / Unioncamere — **non sommare** senza riconciliazione metodologica |
| Rischio metodologico | Alto: perimetro ASIA ≠ Registro Imprese camerale |
| Privacy/PII | Aggregati |
| Note | Ideale come denominatore/contesto; non sostituisce Osservatorio imprese straniere Unioncamere. |
| Quality score | 5+5+5+4+4+4 = **27/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `unioncamere-opengov`

| Campo | Valore |
|---|---|
| Nome | Unioncamere Open Government / Open Data |
| Ente | Unioncamere |
| Paese/territorio | Italia |
| URL principale | https://www.unioncamere.gov.it/ |
| Dataset/resource URL | Portale OpenGov Unioncamere (dataset CSV + metadati DCAT; temi include imprenditoria straniera) |
| API URL | Download CSV ufficiali / DCAT (non SDMX) |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio |
| Descrizione | Dataset open data del sistema camerale; include serie su imprese con titolarità/controllo straniero dove pubblicati come open data. |
| Granularità | Aggregata regionale/provinciale/settoriale (per dataset) |
| Copertura geografica | Italia |
| Copertura temporale | Serie storiche camerali |
| Aggiornamento | ANNUAL / EVENT-DRIVEN per rilascio |
| Formato | CSV (+ XLSX possibili) |
| Machine-readable? | Sì |
| Stable external ID? | Parziale — usare `source + dataset_id + period + territory + breakdown` |
| Licenza | Tipicamente CC-BY 4.0 su open data Unioncamere (verificare per-dataset) |
| Attribuzione | Unioncamere (+ eventuale CCIAA produttore) |
| Automatizzabile? | AUTO se CSV stabile; SEMI se schema cambia |
| Metodo acquisizione | C / E |
| Livello affidabilità | Altissimo sul perimetro camerale |
| Rischio duplicazione | Critico vs CCIAA locali / InfoCamere / Futurae dashboard — **origine primaria = Unioncamere/InfoCamere per aggregati nazionali** |
| Rischio metodologico | Critico: definizione “impresa straniera” camerale (controllo/partecipazione prevalente di persone fisiche **non nate in Italia** nel perimetro Futurae) — **non** cittadinanza |
| Privacy/PII | Aggregati open data; eventuali dataset nominativi CCIAA = NOMINATIVE-FLAG, non import profili |
| Note | Distinguere OPEN DATA RIUTILIZZABILE da dashboard consultabili. Verifica 2026-08-11: esistenza portale OpenGov + tema imprenditoria straniera. |
| Quality score | 5+4+4+3+5+4 = **25/30** |
| Decisione D1.1 | **PILOT** — fonte primaria per indicatori “imprese straniere” |

---

### `unioncamere-movimprese`

| Campo | Valore |
|---|---|
| Nome | Movimprese |
| Ente | Unioncamere / InfoCamere |
| Paese/territorio | Italia |
| URL principale | https://www.infocamere.it/ · pagine Movimprese |
| Dataset/resource URL | Comunicati + download CSV/XLSX aggregati natalità/mortalità imprese |
| API URL | Non API pubblica generale equivalente a ISTAT; download ufficiale |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio |
| Descrizione | Dinamica iscrizioni/cessazioni/saldo imprese Registro Imprese. |
| Granularità | Aggregata |
| Copertura geografica | Italia / regioni / province |
| Copertura temporale | Trimestrale tipica |
| Aggiornamento | QUARTERLY |
| Formato | CSV / XLSX / PDF |
| Machine-readable? | Parziale (CSV quando rilasciato) |
| Stable external ID? | Debole — costruire natural key periodo+territorio+grandezza |
| Licenza | Verificare per rilascio; non assumere CC-BY automatico su tutti i prodotti InfoCamere |
| Attribuzione | Unioncamere / InfoCamere |
| Automatizzabile? | SEMI-AUTO |
| Metodo acquisizione | C / D / E / I |
| Livello affidabilità | Alto |
| Rischio duplicazione | Alto vs ISTAT demografia imprese |
| Rischio metodologico | Medio |
| Privacy/PII | Aggregati |
| Note | Utile per natalità/mortalità totali; breakdown “stranieri” solo se esplicitamente nel file. |
| Quality score | 5+3+3+4+4+3 = **22/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `unioncamere-futurae-osservatorio`

| Campo | Valore |
|---|---|
| Nome | Osservatorio imprese straniere / progetto Futurae |
| Ente | Unioncamere + Ministero del Lavoro e delle Politiche Sociali (FNPM) |
| Paese/territorio | Italia |
| URL principale | https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere |
| Dataset/resource URL | Dashboard interattiva + rapporti (non necessariamente dump open data completo) |
| API URL | Non confermata API bulk open |
| Tipo fonte | P0 (produttore) / P1 (rapporti) |
| Dominio destinazione | Osservatorio + Contenuti (rapporti) |
| Descrizione | Strumenti di conoscenza su imprese dei migranti: dashboard + rapporti socio-economici/finanziari. |
| Granularità | Aggregata; dashboard |
| Copertura geografica | Italia |
| Copertura temporale | Edizioni progetto |
| Aggiornamento | EVENT-DRIVEN / ANNUAL |
| Formato | HTML dashboard · PDF rapporti · eventuali export |
| Machine-readable? | Debole senza export open |
| Stable external ID? | No per celle dashboard |
| Licenza | Consultazione pubblica; riuso numerico da dashboard **non** automatico — preferire open data correlati |
| Attribuzione | Unioncamere / MLPS / Futurae |
| Automatizzabile? | MANUAL / SEMI (export se disponibile) |
| Metodo acquisizione | H / I / J (+ C se dataset OpenGov correlato) |
| Livello affidabilità | Altissimo metodologico |
| Rischio duplicazione | Alto vs `unioncamere-opengov` — stessa famiglia |
| Rischio metodologico | Definizione ufficiale da preservare: partecipazione prevalente di PF **non nate in Italia** |
| Privacy/PII | Aggregati in dashboard |
| Note | Pagina ufficiale verificata 2026-08-11. Usare come **definizione e narrative**, numeri da open data quando esistono. |
| Quality score | 5+2+2+3+5+5 = **22/30** |
| Decisione D1.1 | **SEMI / EDITORIAL** — non scraping dashboard; collegare rapporti come contenuti |

---

### `eurostat-lfsa-esgan`

| Campo | Valore |
|---|---|
| Nome | Self-employment by citizenship (LFS) |
| Ente | Eurostat |
| Paese/territorio | UE / Italia come geo |
| URL principale | https://ec.europa.eu/eurostat |
| Dataset/resource URL | Dataset code `lfsa_esgan` |
| API URL | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfsa_esgan` (JSON) |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio (confronto UE) |
| Descrizione | Lavoratori autonomi per cittadinanza (Labour Force Survey). |
| Granularità | Paese UE |
| Copertura geografica | UE |
| Copertura temporale | Serie annuali |
| Aggiornamento | ANNUAL |
| Formato | JSON / SDMX |
| Machine-readable? | Sì |
| Stable external ID? | Sì — dataset code + dimension keys |
| Licenza | Eurostat reuse policy (riuso con attribuzione; verificare pagina legale) |
| Attribuzione | Eurostat |
| Automatizzabile? | AUTO |
| Metodo acquisizione | A / B / C |
| Livello affidabilità | Altissimo |
| Rischio duplicazione | Alto vs ISTAT LFS — usare per confronto internazionale, non doppio Italia senza nota |
| Rischio metodologico | Cittadinanza ≠ nascita ≠ impresa camerale |
| Privacy/PII | Aggregati |
| Note | Prova HTTP 200 (2026-08-11) su endpoint dissemination. |
| Quality score | 5+5+4+4+5+4 = **27/30** |
| Decisione D1.1 | **PILOT** |

---

### `eurostat-migration-labour`

| Campo | Valore |
|---|---|
| Nome | Migration & labour statistics (famiglia Eurostat) |
| Ente | Eurostat |
| Paese/territorio | UE |
| URL principale | https://ec.europa.eu/eurostat/web/migration-asylum |
| Dataset/resource URL | Codici `migr_*`, `lfst_*`, ecc. (selezione D1.2) |
| API URL | Eurostat dissemination API |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio |
| Descrizione | Migrazione, occupazione migranti, country of birth dove disponibili. |
| Granularità | Paese / NUTS |
| Copertura geografica | UE |
| Copertura temporale | Serie |
| Aggiornamento | ANNUAL |
| Formato | JSON / SDMX / CSV |
| Machine-readable? | Sì |
| Stable external ID? | Sì |
| Licenza | Eurostat reuse |
| Attribuzione | Eurostat |
| Automatizzabile? | AUTO |
| Metodo acquisizione | A / B / C |
| Livello affidabilità | Alto |
| Rischio duplicazione | vs ISTAT |
| Rischio metodologico | Medio |
| Privacy/PII | Aggregati |
| Note | Curare lista corta di codici; non importare intero tema migration. |
| Quality score | 5+5+4+4+4+4 = **26/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `eurostat-business-demography`

| Campo | Valore |
|---|---|
| Nome | Business demography |
| Ente | Eurostat |
| Paese/territorio | UE |
| URL principale | https://ec.europa.eu/eurostat/web/business-demography |
| Dataset/resource URL | Famiglia `bd_*` / correlati |
| API URL | Dissemination API |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio / Mercati (contesto) |
| Descrizione | Natalità/mortalità imprese armonizzata UE. |
| Granularità | Paese / settore |
| Copertura geografica | UE |
| Copertura temporale | Annuale |
| Aggiornamento | ANNUAL |
| Formato | JSON / SDMX |
| Machine-readable? | Sì |
| Stable external ID? | Sì |
| Licenza | Eurostat reuse |
| Attribuzione | Eurostat |
| Automatizzabile? | AUTO |
| Metodo acquisizione | A / B |
| Livello affidabilità | Alto |
| Rischio duplicazione | vs Movimprese / ISTAT |
| Rischio metodologico | Manuale Eurostat-OECD Business Demography |
| Privacy/PII | Aggregati |
| Note | Non spezzare definizioni nazionali. |
| Quality score | 5+5+4+4+3+4 = **25/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `eurostat-culture-employment`

| Campo | Valore |
|---|---|
| Nome | Cultural employment / participation |
| Ente | Eurostat |
| Paese/territorio | UE |
| URL principale | https://ec.europa.eu/eurostat/web/culture |
| Dataset/resource URL | Indicatori culture employment / participation |
| API URL | Dissemination API |
| Tipo fonte | P0 |
| Dominio destinazione | Cultura (statistiche ICC) — non hub relazioni |
| Descrizione | Occupazione culturale e partecipazione; utile solo se aiuta industrie creative/incontro. |
| Granularità | Paese |
| Copertura geografica | UE |
| Copertura temporale | Serie |
| Aggiornamento | ANNUAL |
| Formato | JSON / SDMX |
| Machine-readable? | Sì |
| Stable external ID? | Sì |
| Licenza | Eurostat reuse |
| Attribuzione | Eurostat |
| Automatizzabile? | AUTO |
| Metodo acquisizione | A / B |
| Livello affidabilità | Alto |
| Rischio duplicazione | Basso |
| Rischio metodologico | Medio: rilevanza prodotto da validare (principio C2/C3/C4) |
| Privacy/PII | Aggregati |
| Note | Non popolare `/cultura` con dump; eventuale indicatore Osservatorio “ICC” o contenuto editoriale. |
| Quality score | 5+5+4+3+2+4 = **23/30** |
| Decisione D1.1 | **DEFER** — solo se use-case incontro/ICC chiaro |

---

### `incentivi-gov-opendata`

| Campo | Valore |
|---|---|
| Nome | Incentivi.gov.it Open Data |
| Ente | Governo italiano (portale nazionale incentivi) |
| Paese/territorio | Italia |
| URL principale | https://www.incentivi.gov.it/ |
| Dataset/resource URL | https://www.incentivi.gov.it/it/open-data |
| API URL | Download ufficiali CSV/JSON (preferire a scraping Solr non ufficiale) |
| Tipo fonte | P0 |
| Dominio destinazione | Opportunità |
| Descrizione | Catalogo misure/incentivi con metadati su amministrazione, territori, settori, finestre temporali, stato. |
| Granularità | Misura / incentivo |
| Copertura geografica | Italia (misure nazionali/regionali presenti) |
| Copertura temporale | Lifecycle misure |
| Aggiornamento | EVENT-DRIVEN / DAILY-ish refresh portale |
| Formato | CSV · JSON |
| Machine-readable? | Sì |
| Stable external ID? | Sì (id misura portale — da fissare in contract D1.2) |
| Licenza | **IODL 2.0** (dichiarata open data) |
| Attribuzione | Secondo IODL 2.0 |
| Automatizzabile? | AUTO → pubblicazione SEMI-AUTO (review) |
| Metodo acquisizione | C / E |
| Livello affidabilità | Alto |
| Rischio duplicazione | Medio vs bandi regionali / Invitalia ripubblicati |
| Rischio metodologico | Non ogni incentivo = Opportunity pubblicabile; mappare status/finestre |
| Privacy/PII | Metadati misure; evitare microdati beneficiari nominativi se presenti |
| Note | Pagina open-data HTTP 200 (2026-08-11). Compatibile con `opportunities` + `opportunity_sources`. |
| Quality score | 5+5+5+4+5+3 = **27/30** |
| Decisione D1.1 | **PILOT** |

---

### `eu-funding-tenders-sedia`

| Campo | Valore |
|---|---|
| Nome | EU Funding & Tenders (SEDIA Search API) |
| Ente | Commissione europea |
| Paese/territorio | UE / internazionale |
| URL principale | https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home |
| Dataset/resource URL | Portal Funding & Tenders |
| API URL | Search API ufficiale SEDIA (`api.tech.ec.europa.eu` … `apiKey=SEDIA`) — documentazione Developers |
| Tipo fonte | P0 |
| Dominio destinazione | Opportunità (call/topic selezionati) |
| Descrizione | Call, topic, programmi, opening/deadline, status, funding, URL, ID stabili. |
| Granularità | Call / topic |
| Copertura geografica | UE + associati |
| Copertura temporale | Lifecycle call |
| Aggiornamento | EVENT-DRIVEN |
| Formato | JSON API |
| Machine-readable? | Sì |
| Stable external ID? | Sì (identifier call/topic) |
| Licenza | Riuso secondo termini Commissione / portal; metadata tipicamente riutilizzabili con attribuzione |
| Attribuzione | European Commission / Funding & Tenders |
| Automatizzabile? | AUTO fetch + SEMI-AUTO publish (curated topics) |
| Metodo acquisizione | A |
| Livello affidabilità | Altissimo |
| Rischio duplicazione | Basso se ID ufficiale |
| Rischio metodologico | Basso su identity; alto su **selezione** pertinenti |
| Privacy/PII | No profili persone |
| Note | **Non** importare l’intero portale. Filtri: imprese, imprenditoria, integrazione, internazionalizzazione, innovazione, cultura/ICC, occupazione, competenze. |
| Quality score | 5+5+4+5+4+4 = **27/30** |
| Decisione D1.1 | **PILOT (curated)** |

---

### `ice-statistiche-estero`

| Campo | Valore |
|---|---|
| Nome | ICE — statistiche commercio estero / mercati |
| Ente | ICE — Agenzia per la promozione all’estero e l’internazionalizzazione delle imprese italiane |
| Paese/territorio | Italia ↔ mondo |
| URL principale | https://www.ice.it/ |
| Dataset/resource URL | Aree statistiche / banche dati ICE (spesso con registrazione) |
| API URL | Non confermata API open bulk equivalente a World Bank/ISTAT |
| Tipo fonte | P0 istituzionale |
| Dominio destinazione | Mercati internazionali · Osservatorio (export) |
| Descrizione | Export/import, paesi, prodotti, settori, opportunità paese. |
| Granularità | Paese/prodotto/settore aggregata |
| Copertura geografica | Mondo |
| Copertura temporale | Serie |
| Aggiornamento | UNKNOWN / misto |
| Formato | Portale · export · PDF |
| Machine-readable? | Parziale; spesso gate registrazione (CF italiano) |
| Stable external ID? | Debole senza API |
| Licenza | Verificare T&C ICE; non assumere open data |
| Attribuzione | ICE |
| Automatizzabile? | MANUAL / SEMI se download autorizzato |
| Metodo acquisizione | E / D / I / J |
| Livello affidabilità | Alto sul contenuto |
| Rischio duplicazione | vs ISTAT commercio estero / World Bank |
| Rischio metodologico | Medio |
| Privacy/PII | Aggregati |
| Note | Per automazione preferire ISTAT commercio estero + World Bank; ICE come fonte editoriale/link e opportunistica. Non clonare portale ICE in Mercati. |
| Quality score | 5+2+2+2+5+3 = **19/30** |
| Decisione D1.1 | **DEFER** (gate accesso) — link/curation ok |

---

### `mic-culturaitalia-lod`

| Campo | Valore |
|---|---|
| Nome | CulturaItalia / Linked Open Data MiC |
| Ente | Ministero della Cultura (+ ICCD / Digital Library correlati) |
| Paese/territorio | Italia |
| URL principale | https://www.culturaitalia.it/ · https://dati.culturaitalia.it/ |
| Dataset/resource URL | Endpoint LOD |
| API URL | SPARQL `dati.culturaitalia.it` |
| Tipo fonte | P0 |
| Dominio destinazione | Organizzazioni (istituzioni) · Eventi (selezionati) · Contenuti — **non** dump in `/cultura` |
| Descrizione | Metadata patrimonio, luoghi della cultura, istituzioni; LOD. |
| Granularità | Record culturali |
| Copertura geografica | Italia |
| Copertura temporale | Catalogo |
| Aggiornamento | EVENT-DRIVEN |
| Formato | RDF / SPARQL |
| Machine-readable? | Sì |
| Stable external ID? | Sì (URI) |
| Licenza | Mix CC0 / CC-BY-SA (per grafo/dataset — verificare) |
| Attribuzione | Secondo licenza record |
| Automatizzabile? | SEMI-AUTO altamente selettivo |
| Metodo acquisizione | F |
| Livello affidabilità | Alto metadata |
| Rischio duplicazione | Medio |
| Rischio metodologico | Alto sul prodotto: patrimonio ≠ funzione Cultura piattaforma |
| Privacy/PII | Possibili dati su persone in metadata — filtrare |
| Note | Ingerire solo se aiuta incontri/relazioni/ICC/opportunità. Nessun Cultural AR. |
| Quality score | 5+5+4+3+2+3 = **22/30** |
| Decisione D1.1 | **DEFER selective** |

---

### `regione-lombardia-opendata`

| Campo | Valore |
|---|---|
| Nome | Open Data Regione Lombardia |
| Ente | Regione Lombardia |
| Paese/territorio | Lombardia (pilota, non modello nazionale) |
| URL principale | https://www.dati.lombardia.it/ |
| Dataset/resource URL | Catalogo Socrata/CKAN regionale |
| API URL | API catalogo open data regionale |
| Tipo fonte | P0 regionale |
| Dominio destinazione | Osservatorio · Opportunità · Eventi (selezionati) |
| Descrizione | Imprese, popolazione straniera, lavoro, cultura, bandi, internazionalizzazione a scala regionale. |
| Granularità | Regionale / comunale |
| Copertura geografica | Lombardia |
| Copertura temporale | Variabile |
| Aggiornamento | Variabile |
| Formato | CSV / JSON / API |
| Machine-readable? | Sì |
| Stable external ID? | Sì (dataset id catalogo) |
| Licenza | Tipicamente CC-BY / IODL (per-dataset) |
| Attribuzione | Regione Lombardia |
| Automatizzabile? | AUTO/SEMI per dataset scelti |
| Metodo acquisizione | A / C / E |
| Livello affidabilità | Alto locale |
| Rischio duplicazione | vs ISTAT/Unioncamere nazionali |
| Rischio metodologico | Non generalizzare Lombardia → Italia |
| Privacy/PII | Verificare per dataset |
| Note | Pilota territoriale; UI deve etichettare copertura Lombardia. |
| Quality score | 4+5+4+3+3+3 = **22/30** |
| Decisione D1.1 | **PILOT regional** |

---

### `regione-lombardia-bandi`

| Campo | Valore |
|---|---|
| Nome | Bandi e Servizi Regione Lombardia |
| Ente | Regione Lombardia |
| Paese/territorio | Lombardia |
| URL principale | Portale Bandi e Servizi RL |
| Dataset/resource URL | Open data bandi correlati + portale |
| API URL | Se esposta dal portale / open data |
| Tipo fonte | P0 |
| Dominio destinazione | Opportunità |
| Descrizione | Bandi regionali, finestre, amministrazione. |
| Granularità | Bando |
| Copertura geografica | Lombardia |
| Copertura temporale | Lifecycle |
| Aggiornamento | EVENT-DRIVEN |
| Formato | JSON/CSV/HTML |
| Machine-readable? | Parziale |
| Stable external ID? | Da verificare per bando |
| Licenza | Per-dataset / termini portale |
| Attribuzione | Regione Lombardia |
| Automatizzabile? | SEMI-AUTO |
| Metodo acquisizione | A / C / H |
| Livello affidabilità | Alto |
| Rischio duplicazione | vs incentivi.gov |
| Rischio metodologico | Medio |
| Privacy/PII | Basso su metadati bandi |
| Note | Complementare a incentivi.gov per pilota regionale. |
| Quality score | 4+3+3+4+4+3 = **21/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `cciaa-milano-opendata`

| Campo | Valore |
|---|---|
| Nome | CCIAA Milano Monza Brianza Lodi — open data |
| Ente | Camera di Commercio Milano Monza Brianza Lodi |
| Paese/territorio | Provincia / area Milano |
| URL principale | Sito CCIAA Milano / open data |
| Dataset/resource URL | Dataset territoriali, studi, bandi locali |
| API URL | Variabile |
| Tipo fonte | P0 locale |
| Dominio destinazione | Osservatorio locale · Opportunità · Contenuti |
| Descrizione | Open data e pubblicazioni camerali locali; imprenditoria straniera locale. |
| Granularità | Locale |
| Copertura geografica | Milano / MB / Lodi |
| Copertura temporale | Variabile |
| Aggiornamento | Variabile |
| Formato | CSV / PDF / XLSX |
| Machine-readable? | Variabile |
| Stable external ID? | Debole |
| Licenza | Per-dataset |
| Attribuzione | CCIAA |
| Automatizzabile? | SEMI |
| Metodo acquisizione | C / D / E / I |
| Livello affidabilità | Alto locale |
| Rischio duplicazione | **Molto alto** vs Unioncamere nazionale — non duplicare stessa serie |
| Rischio metodologico | Medio |
| Privacy/PII | Segnalare eventuali elenchi imprese nominative = **NOMINATIVE-FLAG** |
| Note | Preferire aggregati; non importare anagrafiche imprese come community profiles. |
| Quality score | 4+3+3+3+3+3 = **19/30** |
| Decisione D1.1 | **DEFER (dedup)** — solo gap locali non coperti da Unioncamere |

---

### `ismu-rapporti`

| Campo | Valore |
|---|---|
| Nome | Fondazione ISMU ETS — rapporti e banca dati migrazioni |
| Ente | Fondazione ISMU ETS |
| Paese/territorio | Italia / Europa |
| URL principale | https://www.ismu.org/ |
| Dataset/resource URL | https://www.ismu.org/dati-sulle-migrazioni/ · Rapporti annuali |
| API URL | Nessuna API statistica primaria propria rilevante |
| Tipo fonte | P1 / P2 |
| Dominio destinazione | Contenuti (guide/studi) · contesto Osservatorio |
| Descrizione | Rapporti sulle migrazioni; raccolta/elaborazioni su fonti istituzionali; non produttore primario di imprese straniere. |
| Granularità | Report / tavole |
| Copertura geografica | Italia / UE |
| Copertura temporale | Annuale |
| Aggiornamento | ANNUAL |
| Formato | PDF · XLS elaborazioni · HTML |
| Machine-readable? | Debole |
| Stable external ID? | No |
| Licenza | Copyright rapporti — **LINKABLE / METADATA**; non copia integrale |
| Attribuzione | ISMU |
| Automatizzabile? | MANUAL |
| Metodo acquisizione | I / J |
| Livello affidabilità | Alto analitico |
| Rischio duplicazione | Alto (riprende ISTAT/Interno/Eurostat) — risalire a primaria per numeri |
| Rischio metodologico | Medio |
| Privacy/PII | Aggregati |
| Note | Usare come EDITORIAL SOURCE e ponte bibliografico; indicatori da ISTAT/Unioncamere. |
| Quality score | 4+1+2+3+4+4 = **18/30** |
| Decisione D1.1 | **EDITORIAL-ONLY** |

---

### `bancaditalia-bds`

| Campo | Valore |
|---|---|
| Nome | Base Dati Statistica (BDS) / Infostat |
| Ente | Banca d’Italia |
| Paese/territorio | Italia |
| URL principale | https://www.bancaditalia.it/statistiche/basi-dati/bds/ |
| Dataset/resource URL | https://infostat.bancaditalia.it/inquiry/ |
| API URL | A2A REST export CSV documentato (`a2a.bancaditalia.it/infostat/dataservices/export/...`) |
| Tipo fonte | P0 |
| Dominio destinazione | Osservatorio (credito/economia territoriale) · Mercati (selezionato) |
| Descrizione | Indicatori macro/finanziari aggregati; imprese e territorio dove pertinenti. |
| Granularità | Aggregata |
| Copertura geografica | Italia |
| Copertura temporale | Serie |
| Aggiornamento | Misto |
| Formato | CSV via A2A · UI inquiry |
| Machine-readable? | Sì (A2A) |
| Stable external ID? | Sì (object id cubo) |
| Licenza | Termini Banca d’Italia (verificare riuso) |
| Attribuzione | Banca d’Italia |
| Automatizzabile? | SEMI-AUTO (selezionare cubi) |
| Metodo acquisizione | A / C |
| Livello affidabilità | Altissimo |
| Rischio duplicazione | Basso vs ISTAT su temi distinti |
| Rischio metodologico | Non forzare pertinenza migrazione/imprenditoria |
| Privacy/PII | Aggregati BDS; microdati INVIND = Restricted Research, **non** per D1 |
| Note | Solo cubi con utilità utente chiara (credito imprese, economia territoriale). |
| Quality score | 5+4+3+4+2+4 = **22/30** |
| Decisione D1.1 | **DEFER** — non forzare |

---

### `oecd-data-api`

| Campo | Valore |
|---|---|
| Nome | OECD Data API (SDMX) |
| Ente | OECD |
| Paese/territorio | Internazionale |
| URL principale | https://data.oecd.org/ · https://www.oecd.org/ |
| Dataset/resource URL | Data Explorer |
| API URL | `https://sdmx.oecd.org/public/rest/` (SDMX) |
| Tipo fonte | P0 / P1 |
| Dominio destinazione | Osservatorio (confronto) · Mercati |
| Descrizione | Migration, entrepreneurship, self-employment, labour, regional indicators; Timely Indicators of Entrepreneurship. |
| Granularità | Paese |
| Copertura geografica | OECD + partner |
| Copertura temporale | Serie |
| Aggiornamento | Variabile |
| Formato | SDMX-JSON / CSV |
| Machine-readable? | Sì |
| Stable external ID? | Sì |
| Licenza | OECD Terms & Conditions (API free of charge con accettazione T&C) |
| Attribuzione | OECD |
| Automatizzabile? | AUTO selettivo |
| Metodo acquisizione | B |
| Livello affidabilità | Alto |
| Rischio duplicazione | vs Eurostat |
| Rischio metodologico | Medio — comparabilità cross-country |
| Privacy/PII | Aggregati |
| Note | Utilità soprattutto comparativa internazionale; pochi indicatori. |
| Quality score | 5+5+3+4+3+4 = **24/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `worldbank-indicators`

| Campo | Valore |
|---|---|
| Nome | World Bank Indicators API |
| Ente | World Bank |
| Paese/territorio | Mondo |
| URL principale | https://data.worldbank.org/ |
| Dataset/resource URL | Indicators catalog |
| API URL | `https://api.worldbank.org/v2/` (es. `/country/IT/indicator/NY.GDP.MKTP.CD?format=json`) |
| Tipo fonte | P0 |
| Dominio destinazione | Mercati internazionali |
| Descrizione | PIL, popolazione, commercio, crescita — indicatori paese essenziali. |
| Granularità | Paese / anno |
| Copertura geografica | Mondo |
| Copertura temporale | Serie lunghe |
| Aggiornamento | ANNUAL |
| Formato | JSON / XML / CSV |
| Machine-readable? | Sì |
| Stable external ID? | Sì (indicator code + country + year) |
| Licenza | CC BY 4.0 |
| Attribuzione | World Bank |
| Automatizzabile? | AUTO |
| Metodo acquisizione | A |
| Livello affidabilità | Alto |
| Rischio duplicazione | Basso se non si importano centinaia di serie |
| Rischio metodologico | Basso; evitare overload macro senza UX |
| Privacy/PII | No |
| Note | Prova HTTP 200 (2026-08-11). Selezionare 5–15 indicatori max per mercato. Non clonare World Bank. |
| Quality score | 5+5+5+4+4+4 = **27/30** |
| Decisione D1.1 | **PILOT selective** |

---

### `dati-gov-it-catalog`

| Campo | Valore |
|---|---|
| Nome | dati.gov.it — Catalogo nazionale open data |
| Ente | AgID / PA |
| Paese/territorio | Italia |
| URL principale | https://www.dati.gov.it/ |
| Dataset/resource URL | Catalogo DCAT-AP_IT |
| API URL | CKAN/DCAT API catalogo |
| Tipo fonte | P0 hub (ripubblicatore) |
| Dominio destinazione | Discovery meta |
| Descrizione | Indice nazionale; spesso ripubblica dataset di ministeri/regioni. |
| Granularità | Catalogo |
| Copertura geografica | Italia |
| Copertura temporale | N/A |
| Aggiornamento | CONTINUOUS catalog |
| Formato | DCAT / JSON |
| Machine-readable? | Sì (catalogo) |
| Stable external ID? | Dataset URI catalogo |
| Licenza | Per dataset originario |
| Attribuzione | Produttore originario (non solo dati.gov.it) |
| Automatizzabile? | META discovery |
| Metodo acquisizione | A / E |
| Livello affidabilità | Variabile (dipende dall’origine) |
| Rischio duplicazione | **Critico** — sempre risalire al produttore |
| Rischio metodologico | Medio |
| Privacy/PII | Per dataset |
| Note | Usare per discovery, non come fonte primaria degli indicatori. |
| Quality score | 4+5+3+3+3+2 = **20/30** |
| Decisione D1.1 | **META** |

---

### `opencoesione`

| Campo | Valore |
|---|---|
| Nome | OpenCoesione |
| Ente | Dipartimento / Agenzia per la Coesione territoriale |
| Paese/territorio | Italia |
| URL principale | https://opencoesione.gov.it/ |
| Dataset/resource URL | Open data progetti coesione |
| API URL / download | Open data ufficiali |
| Tipo fonte | P0 |
| Dominio destinazione | Opportunità (contesto finanziamenti) · Osservatorio territoriale |
| Descrizione | Progetti e pagamenti fondi coesione; trasparenza. |
| Granularità | Progetto |
| Copertura geografica | Italia |
| Copertura temporale | Programmazione UE |
| Aggiornamento | PERIODIC |
| Formato | CSV / API |
| Machine-readable? | Sì |
| Stable external ID? | Sì (codice progetto) |
| Licenza | Open (verificare IODL/CC) |
| Attribuzione | OpenCoesione |
| Automatizzabile? | SEMI |
| Metodo acquisizione | C / E / A |
| Livello affidabilità | Alto |
| Rischio duplicazione | Medio |
| Rischio metodologico | Progetto ≠ Opportunity aperta; mapping selettivo |
| Privacy/PII | Possibili beneficiari — attenzione |
| Note | Non trasformare tutti i progetti in Opportunity. |
| Quality score | 5+4+4+3+3+3 = **22/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `invitalia-opportunita`

| Campo | Valore |
|---|---|
| Nome | Invitalia — incentivi / opportunità |
| Ente | Invitalia |
| Paese/territorio | Italia |
| URL principale | https://www.invitalia.it/ |
| Dataset/resource URL | Pagine misure / eventuali open data |
| API URL | Non primaria bulk confermata |
| Tipo fonte | P0 |
| Dominio destinazione | Opportunità |
| Descrizione | Misure nazionali per imprese (nuove imprese, Sud, innovazione, ecc.). |
| Granularità | Misura |
| Copertura geografica | Italia |
| Copertura temporale | Lifecycle |
| Aggiornamento | EVENT-DRIVEN |
| Formato | HTML / PDF / eventuali dataset |
| Machine-readable? | Debole |
| Stable external ID? | Debole |
| Licenza | Termini sito; metadata LINKABLE |
| Attribuzione | Invitalia |
| Automatizzabile? | MANUAL / SEMI |
| Metodo acquisizione | H / I / J (+ overlap incentivi.gov) |
| Livello affidabilità | Alto |
| Rischio duplicazione | Alto vs `incentivi-gov-opendata` — preferire quest’ultimo se stessa misura |
| Rischio metodologico | Medio |
| Privacy/PII | Basso |
| Note | Curation editoriale + dedup su incentivi.gov. |
| Quality score | 5+2+2+3+5+3 = **20/30** |
| Decisione D1.1 | **CANDIDATE** |

---

### `minlavoro-stranieri-lavoro`

| Campo | Valore |
|---|---|
| Nome | Ministero del Lavoro — rapporti stranieri nel mercato del lavoro |
| Ente | Ministero del Lavoro e delle Politiche Sociali |
| Paese/territorio | Italia |
| URL principale | https://www.lavoro.gov.it/ |
| Dataset/resource URL | Rapporti annuali / sezioni statistiche |
| API URL | Non tipica |
| Tipo fonte | P0 / P1 |
| Dominio destinazione | Contenuti · contesto Osservatorio |
| Descrizione | Rapporti su cittadini stranieri nel mercato del lavoro; co-promotore Futurae. |
| Granularità | Report |
| Copertura geografica | Italia |
| Copertura temporale | Annuale |
| Aggiornamento | ANNUAL |
| Formato | PDF / XLSX |
| Machine-readable? | Debole |
| Stable external ID? | No |
| Licenza | Pubblico / copyright ministeriale — METADATA/LINKABLE |
| Attribuzione | MLPS |
| Automatizzabile? | MANUAL |
| Metodo acquisizione | I / J / D |
| Livello affidabilità | Alto |
| Rischio duplicazione | vs ISTAT |
| Rischio metodologico | Medio |
| Privacy/PII | Aggregati |
| Note | Per numeri: risalire a ISTAT/Unioncamere citati. |
| Quality score | 5+2+2+3+4+4 = **20/30** |
| Decisione D1.1 | **EDITORIAL+** |

---

### `emn-european-migration-network`

| Campo | Valore |
|---|---|
| Nome | European Migration Network |
| Ente | EMN / Commissione UE |
| Paese/territorio | UE |
| URL principale | https://home-affairs.ec.europa.eu/networks/european-migration-network-emn_en |
| Dataset/resource URL | Reports / studies |
| API URL | N/A |
| Tipo fonte | P1 / P2 |
| Dominio destinazione | Contenuti |
| Descrizione | Studi e report su migrazione/integrazione. |
| Granularità | Documenti |
| Copertura geografica | UE |
| Copertura temporale | Pubblicazioni |
| Aggiornamento | EVENT-DRIVEN |
| Formato | PDF |
| Machine-readable? | No |
| Stable external ID? | No |
| Licenza | LINKABLE / copyright UE |
| Attribuzione | EMN / EC |
| Automatizzabile? | MANUAL |
| Metodo acquisizione | I / J |
| Livello affidabilità | Alto |
| Rischio duplicazione | Basso |
| Rischio metodologico | N/A |
| Privacy/PII | N/A |
| Note | Solo schede contenuto/link, non dataset indicatori. |
| Quality score | 4+1+2+2+3+4 = **16/30** |
| Decisione D1.1 | **EDITORIAL-ONLY** |

---

## Fonti scartate / non idonee (sintesi)

| ID logico | Motivo |
|---|---|
| Scraping testate (Sole 24 Ore, Radio 24, ANSA) come origine indicatori | P3 — risalire a primaria; ok solo EDITORIAL metadata/link |
| Elenchi imprese nominative CCIAA/web | Privacy + vincolo comunità: no auto-profili |
| Microdati Banca d’Italia INVIND / research data centre | Restricted; fuori D1 |
| Dump completo Funding & Tenders | Rumore; curation obbligatoria |
| Dump CulturaItalia patrimonio | Non allineato a funzione Cultura C2–C4 |
| ICE bulk senza licenza/API chiara | Gate accesso; preferire alternative open |
| Qualsiasi “indicatore generico World Bank” senza UX | Overload |

---

## Duplicazioni note (origine primaria)

| Famiglia | Origine primaria da preferire | Ripubblicatori |
|---|---|---|
| Imprese straniere IT | Unioncamere / InfoCamere (+ OpenGov) | CCIAA locali, ISMU, stampa, Futurae narrative |
| Demografia / stranieri IT | ISTAT | ISMU, MLPS rapporti, dati.gov.it |
| LFS / self-employment UE | Eurostat (confronto) / ISTAT (Italia) | OECD (selected) |
| Incentivi IT | incentivi.gov.it | Invitalia pagine, regioni, aggregatori |
| Coesione | OpenCoesione | ripubblicazioni PA |
| Macro paese | World Bank / OECD / ISTAT | portali secondari |

---

## Publication model (concettuale, non implementato)

```
source → fetch → normalize → validate → deduplicate → provenance → review? → publish
```

Stati futuri suggeriti: ACQUIRED · VALIDATED · PUBLISHED · WITHDRAWN.

---

*Fine registry D1.1 — nessuna ingestion eseguita.*
