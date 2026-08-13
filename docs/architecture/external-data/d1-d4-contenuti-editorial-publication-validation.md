# D1-D.4 — Contenuti editorial review + selective publication

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.4  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**Baseline git (pre):** `f2cd6d6` on `main` (ahead/behind `0/0`)  
**AUTO-PUBLISH:** **NO**  
**Migrations / new imports / deploy:** **0**

---

## 1. Esito

**PASS** — 18 Production Contenti pilot cards reviewed one-by-one; **17 READY** published via the same lifecycle axes as `publishEditorialContent` / redazione UI; **1 QUESTIONABLE** left review-only (MLPS hub aggregator).  
Post-publish D1-D.3 importer refresh: inserted=0 / updated=0 / unchanged=18; published state preserved; no auto-publish; no duplicates.  
Public Next hosting remains **blocked** (pre-existing deploy gap) — DB/RLS/public-data path verified; live `/contenuti/[slug]` CDN check deferred to a separate hosting GO.

---

## 2. Pre-gate

| Check | Result |
|---|---|
| Branch / HEAD / origin | `main` / `f2cd6d6` / `0/0` |
| JWT tracked scan (`git grep` eyJ…) | no credential JWTs (only package-lock integrity hashes + docs mention) |
| Dirt pre-esistente | preserved |
| D1-D.1 / D1-D.2 / SEC-1 / D1-D.3 | CLOSED PASS |
| Safe editorial path | YES — `updateEditorialContent` fields + `publishEditorialContent` axes; harness mirrors UI |
| Schema / migrations this gate | **0** |

---

## 3. List of 18 (source · title · URL · decision)

| # | Source | Title | URL | Decision |
|---|---|---|---|---|
| 1 | ISMU | 31° Rapporto ISMU sulle migrazioni 2025 | https://www.ismu.org/31-rapporto-sulle-migrazioni-2025 | **READY → published** |
| 2 | ISMU | 30° Rapporto ISMU sulle migrazioni 2024 | https://www.ismu.org/30-rapporto-sulle-migrazioni-2024 | **READY → published** |
| 3 | ISMU | Mismatch tra sistemi finanziari territoriali e bisogni degli immigrati | https://www.ismu.org/bussate-e-vi-sara-aperto-il-mismatch-tra-sistemi-finanziari-territoriali-e-bisogni-degli-immigrati | **READY → published** |
| 4 | ISMU | Libro bianco sul governo delle migrazioni economiche | https://www.ismu.org/libro-bianco-sul-governo-delle-migrazioni-economiche | **READY → published** |
| 5 | ISMU | Donne con background migratorio e doppia discriminazione nel lavoro | https://www.ismu.org/la-doppia-discriminazione-delle-donne-con-background-migratorio-nel-mercato-del-lavoro | **READY → published** |
| 6 | ISMU | Inclusione socio-lavorativa dei rifugiati | https://www.ismu.org/linclusione-socio-lavorativa-dei-rifugiati | **READY → published** |
| 7 | ISMU | Governance dell'immigrazione e valorizzazione economica | https://www.ismu.org/paper-un-salto-di-qualita-nella-governance-dellimmigrazione-e-della-sua-valorizzazione-economica-2 | **READY → published** |
| 8 | ISMU | Educazione economico-finanziaria interculturale (guida ISMU) | https://www.ismu.org/guida-alleducazione-economico-finanziaria-in-chiave-interculturale-per-docenti-della-scuola-primaria | **READY → published** |
| 9 | MLPS | XVI Rapporto MLPS: stranieri nel mercato del lavoro (2026) | https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/xvi-rapporto-mdl-stranieri-2026-rev | **READY → published** |
| 10 | MLPS | Sintesi ufficiale XVI Rapporto MLPS sul lavoro straniero | https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/sintesi-xvi-rapporto-mdl-stranieri-2026-rev | **READY → published** |
| 11 | MLPS | Presenza dei migranti nelle aree metropolitane (MLPS 2025) | https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche/la-presenza-dei-migranti-nelle-aree-metropolitane-anno-2025 | **READY → published** |
| 12 | MLPS | Sintesi XIV Rapporto MLPS sul mercato del lavoro straniero | https://www.lavoro.gov.it/documenti/sintesi-xiv-rapporto-gli-stranieri-nel-mercato-del-lavoro-italia-2024 | **READY → published** |
| 13 | MLPS | Hub istituzionale MLPS sul tema immigrazione | https://www.lavoro.gov.it/temi-e-priorita/immigrazione/Pagine/default.aspx | **QUESTIONABLE → review-only** |
| 14 | EMN | EMN AMO 2024: rispondere ai fabbisogni del mercato del lavoro | https://home-affairs.ec.europa.eu/.../meeting-labour-market-needs_en | **READY → published** |
| 15 | EMN | EMN AMO 2024: rafforzare l'integrazione dei migranti | https://home-affairs.ec.europa.eu/.../enhancing-migrant-integration_en | **READY → published** |
| 16 | EMN | Glossario EMN Italia: integrazione lavorativa | https://www.emnitalyncp.it/definizione/integrazione-lavorativa | **READY → published** |
| 17 | EMN | Glossario EMN Italia: accesso al lavoro | https://www.emnitalyncp.it/definizione/accesso-al-lavoro | **READY → published** |
| 18 | Futurae | Osservatorio imprese straniere (Futurae MLPS–Unioncamere) | https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere | **READY → published** |

Missing Futurae cards (2) were **not** imported and **not** compensated.

---

## 4. Editorial edits made

Allowed fields only (`title`, `abstract`, `body`, `source_label`):

- Rewrote public-facing `body` stub to presentable Italian referral text for all **17 READY** cards.
- Preserved intact `--- / d1d_*` trailer (importer identity / checksum).
- Futurae `source_label` clarified: *Progetto Futurae (MLPS – Unioncamere) — non editore giuridico autonomo*.
- Titles/abstracts confirmed platform-original Italian (no source abstract copy).
- No identifier / natural-key / provenance-key changes.
- No cover images; no full body/HTML/PDF storage.

---

## 5. READY criteria per card

All **17 published** cards satisfied:

1. provenance + allowlist pass  
2. adequate editorial title + summary  
3. working official HTTPS link (probe 18/18 ok)  
4. not duplicate  
5. metadata/link-only + copyright OK  
6. categories/`type_code` sufficient for public nav  
7. no unnecessary personal data  
8. publicly presentable stub (app layer strips `d1d_*`)  
9. explicit editorial decision under this GO (harness mirrors `publishEditorialContent`)

**QUESTIONABLE (1):** MLPS hub — aggregator / temi-e-priorità landing, not a discrete publication; kept `draft` / `unpublished` / `private`.

---

## 6–8. Counts

| Metric | Value |
|---|---:|
| Pilot total | **18** |
| Reviewed | **18** |
| READY | **17** |
| Published | **17** |
| Remaining review-only | **1** |
| Scheduled | **0** |
| Auto-publish | **0** |
| Duplicates | **0** |
| Off-allowlist URLs | **0** |
| Full bodies / unauthorized images | **0** |

Per source (published / review-only / total): ISMU **8/0/8** · MLPS **4/1/5** · EMN **4/0/4** · Futurae **1/0/1**.

---

## 9. RLS results (Production ephemeral users, cleaned up)

| Actor | Result |
|---|---|
| Editor (`redattore`) | `access_is_editor=true`; reads review-only + published; can UPDATE editorial |
| Non-editor admin (`amministratore_applicativo`) | `access_is_editor=false`; **0** review-only SELECT; UPDATE no effect |
| Ordinary authenticated | no review-only SELECT; UPDATE no effect |
| Anon | **0** review-only; **17** published only |

Harness: `scripts/external-data/d1d4-editorial-publish.mjs rls` → 14/14 checks PASS. Sidecar: `artifacts/ingestion/d1d4-rls-out.json`.

---

## 10. Public route verification

| Surface | Result |
|---|---|
| Anon Supabase SELECT published | **17**; review-only leak **0** |
| Source links HTTPS | PASS |
| Next public body sanitize | `stripContentsAcquisitionTrailer` in `getPublicContentBySlug` |
| Live CDN `/contenuti/[slug]` | **BLOCKED** — no hosting project (see application-v1-deployment-report); **DB publish ≠ site availability** |
| Deploy this gate | **NOT DONE** (forbidden) |

Residual: PostgREST still returns raw `body` including `d1d_*` for published rows (CASE A P-D-in-body). Next.js public layer strips trailers; document as known residual until sidecar table GO.

---

## 11. Post-publish refresh (D1-D.3 importer)

| Check | Result |
|---|---|
| Dry-run wouldCreate / wouldUpdate / unchanged | **0 / 0 / 18** |
| Apply inserted / updated / unchanged | **0 / 0 / 18** |
| dbWrites | **0** |
| autoPublish | **false** |
| publicCount after | **17** (preserved) |
| reviewOnly after | **1** (hub preserved) |
| Editorial title/summary/body/label | preserved (spot-check Futurae + ISMU 31°) |
| Publish decision preserved | YES — no published→review; no review→public |
| New imports | **0** |

CLI gate updated so idempotent refresh with human-published rows does not fail (same pattern as D1-B.3).

---

## 12–17. Confirmations

- duplicates = **0**  
- scheduled = **0**  
- auto-publish = **0**  
- metadata/link-only = **YES**  
- zero new imports = **YES**  
- zero migrations + zero manual SQL schema changes = **YES** (service_role harness only; no SQL bypass of axes)

---

## 18. Files modified (versionable)

- `src/lib/contents/strip-acquisition-trailer.ts` (+ test)  
- `src/lib/data/public/contents.ts` — strip trailer on public detail  
- `scripts/external-data/d1d4-editorial-publish.mjs` — inventory/probe/prepare/publish/validate/rls  
- `scripts/external-data/prod-ingest-contenuti.mjs` — post-D1-D.4 verify tolerance  
- `scripts/external-data/ingest-contenuti-pilot.ts` — idempotent refresh gate  
- `docs/architecture/external-data/d1-d4-contenuti-editorial-publication-validation.md`  
- `docs/architecture/external-data/external-data-acquisition-roadmap.md`  
- `docs/architecture/external-data/d1-d3-contenuti-production-pilot-validation.md` (status pointer)

Not versioned: `artifacts/ingestion/d1d4-*`, apply/dry sidecars, secrets.

---

## 19. Tests

| Command | Exit | Outcome |
|---|---:|---|
| `npx tsx --test src/lib/contents/strip-acquisition-trailer.test.ts src/lib/external-data/contents/*.test.ts` | 0 | **24** pass |
| `npm run typecheck` | 0 | clean |
| `npm run lint` | 0 | 0 errors |
| URL probe (`d1d4 … probe-urls`) | 0 | 18/18 ok |
| RLS harness | 0 | 14/14 |
| Refresh apply + validate | 0 | unchanged=18; published=17 |

---

## 20. Unique adversarial review

| Attack / risk | Outcome |
|---|---|
| Force 18/18 publish | Rejected — hub left QUESTIONABLE |
| Compensate missing Futurae | Not done |
| Auto-publish via importer | Impossible; refresh dbWrites=0 |
| Batch publish without per-card decision | Decisions explicit in DECISIONS map; publish loop per key |
| Admin without editor role publishes | RLS: admin cannot SELECT review-only / UPDATE no effect |
| Technical `d1d_*` on public Next page | Mitigated by strip helper |
| REST residual trailer exposure | Documented CASE A residual |
| Refresh clobbers editorial / unpublishes | unchanged=18; axes preserved |
| New domain / Eventi / Cultura AR / Mercati | Untouched |
| Deploy sneaking | STOP — hosting still absent |

---

## 21–23. Git / deploy

See final commit message after selective stage. Deploy/CDN blocker remains a **separate GO**.

---

## 24. End-to-end Contenti pilot closure

**CLOSED at data/editorial layer:** contract (D1-D.2) → review-only import (D1-D.3) → selective publish + refresh-safe (D1-D.4).  
**NOT closed for public website UX** until hosting/deploy GO wires Next.js Production to the same Supabase project.

---

*Fine D1-D.4 Contenuti editorial review + selective publication*
