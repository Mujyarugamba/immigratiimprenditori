# D1-D.3 — Contenuti Production review-only pilot validation

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.3  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**Baseline git (pre-commit):** `d817c96` on `main` (ahead/behind `0/0`)  
**AUTO-PUBLISH:** **NO**  
**Editorial publish (D1-D.4):** **NOT STARTED**

---

## 1. Esito

**PASS** — 18 schede Contenuti metadata/link-only importate in **Production** come review-only (`draft` / `unpublished` / `private`, `published_at=null`).  
Allocazione effettiva: ISMU 8 + MLPS 5 + EMN 4 + Futurae **1** (path-compliant live URLs < 3; no compensation).  
Pubblico = 0; anon visibility sui nuovi id = 0; auto-publish = 0; migrations = 0.

---

## 2. Pre-gate

| Check | Result |
|---|---|
| Branch / HEAD / origin | `main` / `d817c96` / `0/0` |
| JWT tracked scan (`git grep` eyJ…) | empty (exit 1) |
| Dirt pre-esistente | preserved (`.gitignore`, legal brief, artifacts/ingestion, …) |
| D1-D.1 / D1-D.2 / SEC-1 | Contenuti first; contract PASS; JWT cleanup at HEAD |
| Schema CASE A | `contents` + catalogs + RLS editor — **no DDL** |
| Safe review-only path | YES (`owned_by_editorial` + draft/unpublished/private) |

---

## 3. Selection

| Source | Cap | Imported | Note |
|---|---:|---:|---|
| `ismu-rapporti` | 8 | 8 | Reports/research on labour, finance, economic migration |
| `minlavoro-stranieri-lavoro` | 5 | 5 | XVI/XIV reports + metropolitan stats + hub |
| `emn-european-migration-network` | 4 | 4 | 2× EC AMO labour/integration + 2× EMN IT glossary |
| `futurae-mlps-unioncamere` | 3 | **1** | Only `osservatorio-imprese-straniere` path-compliant & live |
| **Total** | 20 | **18** | No cross-source compensation |

### Exclusions (examples)

- ISMU EN mirror of 31°; PDF duplicate of HTML landing; `/pubblicazioni/` aggregator  
- Futurae pages on `integrazionemigranti.gov.it/.../Dettaglio-*` and Unioncamere press/`/sites/...` PDFs — **off closed path allowlist**  
- EMN Labour Migration Platform — not under EMN network path prefixes  
- EMN IT PDF study — flaky full-asset redirect probe; replaced by glossary HTML  

---

## 4. Imported list (source · title · date · canonical/storage URL)

| # | Source | Title | Date | URL |
|---|---|---|---|---|
| 1 | ISMU | 31° Rapporto ISMU sulle migrazioni 2025 | 2026-02-01 | https://www.ismu.org/31-rapporto-sulle-migrazioni-2025 |
| 2 | ISMU | 30° Rapporto ISMU sulle migrazioni 2024 | 2025-02-01 | https://www.ismu.org/30-rapporto-sulle-migrazioni-2024 |
| 3 | ISMU | Mismatch sistemi finanziari / bisogni immigrati | — | https://www.ismu.org/bussate-e-vi-sara-aperto-il-mismatch-tra-sistemi-finanziari-territoriali-e-bisogni-degli-immigrati |
| 4 | ISMU | Libro bianco governo migrazioni economiche | — | https://www.ismu.org/libro-bianco-sul-governo-delle-migrazioni-economiche |
| 5 | ISMU | Donne background migratorio — doppia discriminazione lavoro | — | https://www.ismu.org/la-doppia-discriminazione-delle-donne-con-background-migratorio-nel-mercato-del-lavoro |
| 6 | ISMU | Inclusione socio-lavorativa dei rifugiati | — | https://www.ismu.org/linclusione-socio-lavorativa-dei-rifugiati |
| 7 | ISMU | Governance immigrazione e valorizzazione economica | — | https://www.ismu.org/paper-un-salto-di-qualita-nella-governance-dellimmigrazione-e-della-sua-valorizzazione-economica-2 |
| 8 | ISMU | Educazione economico-finanziaria interculturale | — | https://www.ismu.org/guida-alleducazione-economico-finanziaria-in-chiave-interculturale-per-docenti-della-scuola-primaria |
| 9 | MLPS | XVI Rapporto stranieri nel MdL | 2026-07-01 | https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/xvi-rapporto-mdl-stranieri-2026-rev |
| 10 | MLPS | Sintesi XVI Rapporto | 2026-07-01 | https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/sintesi-xvi-rapporto-mdl-stranieri-2026-rev |
| 11 | MLPS | Presenza migranti aree metropolitane 2025 | 2025-01-01 | https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/la-presenza-dei-migranti-nelle-aree-metropolitane-anno-2025 |
| 12 | MLPS | Sintesi XIV Rapporto | 2024-01-01 | https://www.lavoro.gov.it/documenti/sintesi-xiv-rapporto-gli-stranieri-nel-mercato-del-lavoro-italia-2024 |
| 13 | MLPS | Hub istituzionale tema immigrazione | — | https://www.lavoro.gov.it/temi-e-priorita/immigrazione/Pagine/default.aspx |
| 14 | EMN | AMO 2024 — meeting labour market needs | 2025-01-01 | https://home-affairs.ec.europa.eu/networks/european-migration-network-emn/emn-publications/emn-annual-reports/european-migration-network-asylum-and-migration-overview-amo-2024/meeting-labour-market-needs_en |
| 15 | EMN | AMO 2024 — enhancing migrant integration | 2025-01-01 | https://home-affairs.ec.europa.eu/networks/european-migration-network-emn/emn-publications/emn-annual-reports/european-migration-network-asylum-and-migration-overview-amo-2024/enhancing-migrant-integration_en |
| 16 | EMN | Glossario IT — integrazione lavorativa | — | https://www.emnitalyncp.it/definizione/integrazione-lavorativa |
| 17 | EMN | Glossario IT — accesso al lavoro | — | https://www.emnitalyncp.it/definizione/accesso-al-lavoro |
| 18 | Futurae | Osservatorio imprese straniere | 2025-07-03 | https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere |

Identity keys: `{source}:id:{externalId}`. Summaries are platform-original Italian (not copied abstracts). Body = metadata stub + P-D trailer (`d1d_*`); no full page/PDF storage; `cover_url=null`.

---

## 5. Totals / axes

| Metric | Value |
|---|---:|
| Imported | **18** |
| review-only | **18** |
| public | **0** |
| scheduled | **0** (no schedule column) |
| published_at set | **0** |
| duplicates | **0** |
| off-allowlist URLs | **0** |
| unauthorized images | **0** |
| auto-publish | **false** (const) |

Per-source: ISMU 8 · MLPS 5 · EMN 4 · Futurae 1.

---

## 6. Allowlist / provenance / dedupe / idempotency

| Gate | Result |
|---|---|
| Hosts + path rules (D1-D.2) | PASS |
| HTTPS / no credentials / no literal IP | PASS |
| Final redirects (18/18) | PASS (`preferFetchableContentsUrl` uses www when apex dead, e.g. EMN IT) |
| Batch dedupe | 0 rejected duplicates |
| Idempotent apply #2 | inserted=0, updated=0, **unchanged=18**, dbWrites=0 |
| Editorial axes preserved on refresh plan | PASS (tests) |

---

## 7. Dry-run + tests

| Command | Exit | Outcome |
|---|---:|---|
| `npx tsx --test src/lib/external-data/contents/*.test.ts` | 0 | 22 pass |
| `npm run lint` | 0 | 0 errors (1 pre-existing warning unrelated) |
| `npm run typecheck` | 0 | clean |
| Redirect probe (18 URLs) | 0 | okCount=18 |
| `node scripts/external-data/prod-ingest-contenuti.mjs dry-run` | 0 | wouldCreate=18; dbWrites=0; redirectFailures=0 |
| Local `--apply` | 1 | `permission denied for table contents` (local service_role lacks GRANT; **no migration** authorized) |
| Offline normalize + dry-run plan | PASS | CREATE×18; autoPublish=false |

Local grant gap documented; Production path matches D1-B.2 / D1-C.3 precedent.

---

## 8. Remote import + RLS

| Step | Result |
|---|---|
| Target | `https://hvfvfatlaspcpszgizhg.supabase.co` (linked `immigratiimprenditori`) |
| Apply #1 | inserted=**18**, reviewOnly=18, public=0, errors=[] |
| Apply #2 | unchanged=**18**, dbWrites=0 |
| Anon SELECT on pilot ids | **0** |
| Service role SELECT pilot | 18 (writer) |
| Editor visibility | existing policy `contents_select_editorial` (`owned_by_editorial` ∧ `access_is_editor()`); UI `/app/redazione/contenuti` unchanged |
| Migrations / RLS changes this gate | **0** |

---

## 9–11. Confirmations

- review-only = imported total; public = 0; scheduled = 0  
- metadata/link-only; auto-publish = 0  
- zero migrations; zero manual SQL schema changes  

---

## 12. Files modified (versionable)

- `src/lib/external-data/contents/pilot-manifest.ts` — curated 18 candidates + exclusions  
- `src/lib/external-data/contents/apply-contents.ts` — dry-run/apply CASE A importer  
- `src/lib/external-data/contents/apply-contents.test.ts`  
- `scripts/external-data/ingest-contenuti-pilot.ts`  
- `scripts/external-data/prod-ingest-contenuti.mjs`  
- `docs/architecture/external-data/d1-d3-contenuti-production-pilot-validation.md`  
- `docs/architecture/external-data/external-data-acquisition-roadmap.md`  

Not versioned: `artifacts/ingestion/*` sidecars/probes, downloaded pages, secrets.

---

## 13. Adversarial review (unique)

| Attack / risk | Outcome |
|---|---|
| Auto-publish via importer | Impossible — const false; insert axes forced draft/unpublished/private; `published_at` null |
| Off-allowlist / CCIAA / social | Rejected by contract; Futurae press paths excluded |
| Full-text / PDF body storage | Forbidden; body stub only + `d1d_*` trailer |
| Compensating Futurae shortfall from other sources | Not done (18 < 20) |
| Clobber human editorial on refresh | planContentsRefresh preserves axes + human title/summary |
| Apex-dead EMN host stored as apex | Mitigated — store/fetch www when allowlisted |
| Local apply privilege escalation via new GRANT migration | Refused — Production SIU used; no DDL |
| Starting D1-D.4 | STOP |

---

## 14. GO/NO-GO next

**D1-D.4 (editorial review/publish)** — **NO-GO** until separate human GO.  
Pilot remains review-only in Redazione queue.

---

*Fine D1-D.3 Contenuti Production review-only pilot validation*
