# D1-D.2 — Contenuti acquisition contract + closed source allowlist

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.2  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**Baseline:** D1-D.1 determination — first vertical = **Contenuti** (CASE A)  
**AUTO-PUBLISH:** **NO**  
**Import 20 pilot:** **NO** (deferred to D1-D.3)

---

## 1. Esito

**PASS** — contratto tipizzato autoritativo + allowlist chiusa di 4 fonti Contenuti implementati sotto `src/lib/external-data/contents/`.  
Schema **CASE A** (nessuna migration). Nessun import dei 20. Nessun auto-publish.  
Base eseguibile per D1-D.3 (metadata/link-only import controllato).

---

## 2. Authority / preconditions

| Voce | Valore |
|---|---|
| D1-C Mercati | CLOSED — non toccato |
| D1-D.1 | Contenuti first; Cultura hub no AR; Eventi out |
| Schema Contenuti | CASE A — `contents` + catalogs + RLS editor + redazione UI già E2E |
| Provenance model | **P-D** — `source_url` / `source_label` su AR + sidecar futuro; no `content_sources` table |

---

## 3. Contract surface (code)

| Artefatto | Path |
|---|---|
| Allowlist | `src/lib/external-data/contents/allowlist.ts` |
| Acquisition contract | `src/lib/external-data/contents/acquisition.ts` |
| Tests | `src/lib/external-data/contents/acquisition.test.ts` |

### A — Source identity

Stable `sourceCode`, name, responsible publisher, project/series, `mainUrl`, exact `allowedHostnames`, optional `hostPathRules`, `isActive`, `acquisitionMode=METADATA_LINK_ONLY`.

### B — Content provenance

`sourceCode`, canonical URL, external id (optional), original title, publisher/author, publication/update dates, language, document type, `retrievedAt`, required attribution.

### C — Editorial metadata

Italian title, **platform-original** Italian summary (not copied abstract), `type_code` / `primary_category_code` from existing catalogs, territory label optional, image only if reuse explicitly allowed, source link.

### D — Identity / dedupe

Precedence: **external id > canonical URL > fingerprint**.  
Natural keys: `{source}:id:{ext}` · `{source}:url:{canonical}` · `{source}:fp:{sha256}`.  
URL normalize: HTTPS, lowercase host, www→apex when both allowlisted, strip fragment/tracking, trailing slash.  
Refresh: idempotent; preserves editorial axes + human-edited title/summary/category.

---

## 4. Closed allowlist (final)

| sourceCode | Publisher | Hosts (exact) | Path rules |
|---|---|---|---|
| `ismu-rapporti` | Fondazione ISMU ETS | `ismu.org`, `www.ismu.org` | — (publications/reports/research) |
| `minlavoro-stranieri-lavoro` | MLPS | `lavoro.gov.it`, `www.lavoro.gov.it` | — (reports/studies/stats/news/docs) |
| `emn-european-migration-network` | EMN / Italian NCP / CE | `emnitalyncp.it`, `www.emnitalyncp.it`, `home-affairs.ec.europa.eu` | EC host: EMN network paths only; **no** other national EMN hosts |
| `futurae-mlps-unioncamere` | MLPS + Unioncamere (**project**, not juridical publisher) | `unioncamere.gov.it`, `www.unioncamere.gov.it`, `integrazionemigranti.gov.it`, `www.integrazionemigranti.gov.it` | Futurae / osservatorio imprese straniere paths only; **no** CCIAA hosts |

Registry cross-ref Futurae → `unioncamere-futurae-osservatorio` (Osservatorio). Contenuti code remains project-scoped.

---

## 5. Field mapping → existing `contents` (no new columns)

| Contract | Destination |
|---|---|
| `editorial.titleIt` | `contents.title` |
| `editorial.platformSummaryIt` | `contents.abstract` |
| `bodyStub` | `contents.body` (metadata stub only; NOT source full text) |
| `sourceUrl` | `contents.source_url` |
| `sourceLabel` | `contents.source_label` (attribution) |
| `editorial.typeCode` | `contents.type_code` |
| `editorial.primaryCategoryCode` | `contents.primary_category_code` |
| `editorial.coverUrl` | `contents.cover_url` (null unless explicit reuse) |
| ownership | `owned_by_editorial=true` |
| ingest axes | `editorial_status=draft`, `publication_status=unpublished`, `visibility_status=private` |
| natural key / checksum / retrievedAt | P-D sidecar / importer memory (no DDL) |

---

## 6. Security / copyright

- HTTPS only; reject embedded credentials; reject literal IPs  
- Reject unauthorized / lookalike / non-listed subdomains  
- Final redirect must remain on allowlist  
- No full page/PDF/article/protected-abstract storage  
- Platform summary must be original; attribution + source link required  
- No social / mirrors / aggregators / third-party hosts  
- Images excluded unless `imageReuseExplicitlyAllowed`  
- `autoPublish: false` (const)

---

## 7. Editorial workflow (existing only)

```
normalize (this gate) → future ingest draft/unpublished/private
  → redazione /app/redazione/contenuti (access_is_editor)
  → human READY + publishEditorialContent
  → public /contenuti/[slug]
```

- No new editorial states / no parallel mini-CMS  
- Refresh preserves `editorial_status`, `publication_status`, `visibility_status`, human title/summary, category  
- Publish authorization: requires `access_is_editor()` (RLS); application admin without editorial role **cannot** publish; importer auto-publish forbidden  
- Pilot caps recorded for D1-D.3: ISMU 8 + MLPS 5 + EMN 4 + Futurae 3 = **20** (not imported here)

---

## 8. Migrations / SQL

**Zero.** CASE A confirmed — no schema gap requiring DDL in this gate.

---

## 9. Non-goals (STOP)

Import of 20 · scraping generalizzato · full-text storage · publish/scheduling · auto-publish · new tables · remote apply · hosting deploy · Mercati changes · Eventi impl · Cultura AR · scheduler

---

## 10. Next gate

**D1-D.3** — metadata/link-only controlled import of ≤20 review-only stubs (public=0), using this contract/allowlist. Separate human GO.

---

*Fine D1-D.2 Contenuti acquisition contract*
