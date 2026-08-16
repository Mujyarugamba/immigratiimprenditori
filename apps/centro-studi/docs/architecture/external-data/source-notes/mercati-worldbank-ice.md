# Source notes — Mercati (World Bank / ICE)

**Fase:** D1-C determination + D1-C.1 dry-run + D1-C.2 local + **D1-C.3 Production review-only** (2026-08-13)  
**Scope:** prove READ-ONLY + dry-run + local apply + **Production apply review-only** — **nessun publish delle 15**

---

## World Bank Indicators

- API: `https://api.worldbank.org/v2/`
- Esempio: `GET /country/IT;DE;FR/indicator/NY.GDP.MKTP.CD?format=json&per_page=200&date=2022:2024`
- Probe + D1-C.1–C.3 live reverify 2026-08-13: **HTTP 200**
- Data catalog UI: `https://data.worldbank.org/indicator/{CODE}` → **200**
- Licenza: **CC BY 4.0** — attribuzione World Bank
- Identity / natural key: `worldbank:{indicator_code}:{iso2}:{year}`
- Automation: AUTO fetch possible; **publish SEMI** (review) su Mercati
- Non clonare il catalogo; max 5–8 indicatori per pilot D1-C
- Importer: `src/lib/external-data/worldbank/indicators.ts`
- Apply: `src/lib/external-data/worldbank/apply-indicators.ts`
- Dry-run CLI: `npx tsx scripts/external-data/dry-run-worldbank-indicators.ts`
- Apply CLI local: `npx tsx scripts/external-data/ingest-worldbank-indicators.ts --apply --ensure-local-catalog`
- Apply CLI Production: `node artifacts/ingestion/d1c3-prod-ingest.mjs apply` (`--allow-production`)
- D1-C.1: fetched=45, validated=15, wouldInsert=15, dbWrites=0
- D1-C.2: local inserted=15, publishedCount=0, idempotent unchanged=15
- D1-C.3: Production inserted=15, publishedCount=0, anon visible=0, idempotent unchanged=15

### Allowlist pilot (D1-C.1 / D1-C.2 / D1-C.3 freeze)

1. `SP.POP.TOTL` — Population (persons)  
2. `NY.GDP.MKTP.CD` — GDP current US$  
3. `NY.GDP.MKTP.KD.ZG` — GDP growth annual %  
4. `NY.GDP.PCAP.CD` — GDP per capita current US$  
5. `NE.TRD.GNFS.ZS` — Trade % of GDP  

### Mapping M1 (contratto)

→ `international_market_support_resources` (name, website_url, summary, contact_note) legato a `international_markets` via `market_id`.  
Editorial: `verification_status=in_review`, `visibility_status=editorial`, `substantial_status=signaled`.  
Natural key: `worldbank:{code}:{iso2}:{year}`.

### Time strategy

Fetch `2022:2024`; map latest non-null year per country×indicator (2024 on live runs).

### Ops notes

- Catalogo Mercati era vuoto locale/Production → seed drafting `it`/`de`/`fr` (non published)
- Production `service_role` già aveva SIU su tabelle Mercati (no migration D1-C-M1 needed)
- UI redazione Mercati: **gap** — manca policy SELECT editor per review-only (D1-C.4)

---

## ICE

- URL: `https://www.ice.it/` — probe **200**
- Policy: **LINK_ONLY** (D1.2 §30) — no scraping celle/statistiche
- Usare come support resource con `website_url` + sintesi originale corta
- Preferire WB/ISTAT open per numeri automatizzabili
- D1-C.1 / D1-C.2 / D1-C.3: **nessuna** ingestion ICE

---

## Non fare

- Dump indicatori WB
- Auto-publish senza review
- Scrivere in Osservatorio i macro WB di contesto paese (dominio sbagliato)
- Scraping ICE gated
- Creare profili Persone/Imprese/Professionisti
- Pubblicare le 15 senza GO D1-C.4

---

*Fine note D1-C / D1-C.1 / D1-C.2 / D1-C.3*
