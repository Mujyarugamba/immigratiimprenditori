# Source notes — Opportunità (incentivi.gov + EU Funding)

**Verifica:** 2026-08-11; re-verified 2026-08-13 (D1-B)
**Scope:** compatibilità dominio Opportunity per Wave D1-B

---

## incentivi.gov.it

- Open data: https://www.incentivi.gov.it/it/open-data → HTTP **200**
- Formati: CSV + JSON ufficiali
- Licenza: **IODL 2.0**
- Endpoint export: portal `solrEndpoint` = `/solr/coredrupal/select` (`opendata-export`) — stesso canale dei pulsanti Scarica JSON/CSV
- External ID: `zs_nid` → `incentivi-gov:<nid>`
- D1-B: dry-run module ready; DB prepare migration not applied; AUTO-PUBLISH=NO

### Campi concettuali da mappare (D1.2)

| Concetto Opportunity | Fonte tipica open data |
|---|---|
| Identity | id misura portale |
| Title / summary | denominazione / descrizione |
| Official URL | URL scheda |
| Opening / closing | date apertura/chiusura |
| Status | stato misura (map → editorial/publication assi con review) |
| Organizer / admin | amministrazione responsabile → external subject |
| Territories | territori eleggibili → territory_label / refs |
| Categories / sectors | settori / tipologie |
| Target | destinatari → audience/requirements statement |
| Source provenance | `opportunity_sources` url + external_identifier + IODL note |

### Regole
- ACQUIRE ≠ PUBLISH → SEMI-AUTO review
- Dedup: `incentivi-gov + external_id`
- Se stessa misura su Invitalia/regione: primaria = incentivi.gov se presente

---

## EU Funding & Tenders (SEDIA)

- Portal ufficiale Funding & Tenders
- Search API SEDIA (`api.tech.ec.europa.eu` … `apiKey=SEDIA`)
- Stable IDs su call/topic
- Campi: opening, deadline, status, programme, funding, URL, eligibility texts

### Curated relevance (non dump)

Includere solo topic/call pertinenti a:
- imprese / entrepreneurship
- integrazione
- internazionalizzazione
- innovazione
- cultura / industrie creative
- occupazione / competenze

### Regole
- Dedup: `eu-funding + callOrTopicId`
- Eligibility → `opportunity_requirements.statement` (testo), non inventare struttura
- Lingua: preservare ufficiale; summary IT editoriale separato se necessario

---

## Regione Lombardia (pilota)

- Complementare, non sostitutivo di incentivi.gov
- UI deve dichiarare copertura Lombardia
- Dedup contro misure già in incentivi.gov

---

## Non fare

- Import indiscriminato portale UE
- Creare Opportunity da progetti OpenCoesione chiusi senza call aperta
- Copiare HTML completo pagine Invitalia

---

*Fine note*
