# D1-D.6 — Eventi acquisition contract + closed source allowlist

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.6  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**Baseline:** D1-D.5 Eventi E2E CLOSED PASS (`a002307`)  
**AUTO-PUBLISH:** **NO**  
**Import eventi:** **0**  
**Remote apply:** **0**  
**Nuove migration:** **0**

---

## 1. Esito

**PASS** — contratto tipizzato Eventi + allowlist chiusa di **4** fonti ufficiali sotto `src/lib/external-data/events/`.  
Schema D1-D.5 già sufficiente (CASE A+). Nessun import. Nessun auto-publish. Nessun remote apply.  
Base eseguibile per un successivo GO di import metadata/link-only (bloccato finché le migration D1-D.5 non sono in Production).

---

## 2. Initial Git

| Check | Result |
|---|---|
| Branch | `main` |
| HEAD (pre) | `a002307` |
| origin ahead/behind | `0/0` |
| JWT tracked scan | empty |
| Pre-existing dirt | preserved |

---

## 3. Docs / files read (preflight)

- `d1-d5-eventi-enablement-validation.md`, `d1-d5-eventi-enablement-block-determination.md`
- Logical / Physical / Migration Plan Eventi
- Migrations `20260820140000`…`20260820160000` (+ cycle-1 Eventi)
- Contenuti `allowlist.ts` / `acquisition.ts` / D1-D.2 report
- `external-data/types.ts`, checksum, roadmap
- Eventi schema/RLS/workflow + redazione/public routes (via D1-D.5 state)
- `AGENTS.md`

---

## 4. Migration inventory (no remote apply)

| Timestamp | File | Local | Production |
|---|---|---|---|
| `20260820140000` | `events_editorial_ownership.sql` | applied | **pending** |
| `20260820150000` | `events_external_identity_provenance.sql` | applied | **pending** |
| `20260820160000` | `prepare_events_external_ingestion_rls.sql` | applied | **pending** |

**Future remote apply order:** `…140000` → `…150000` → `…160000` (depends on prior Production head through `20260820130000`).  
**Import remains BLOCKED** until a separate human GO applies these three migrations remotely.

**D1-D.6 DDL:** none — no physical gap requiring new SQL.

---

## 5. Candidate sources examined

| # | Candidate | Probe notes |
|---|---|---|
| 1 | Portale Integrazione Migranti | Listing + detail `/it-it/Ricerca-eventi/Dettaglio-evento/id/{n}` HTTPS 200; title/date/venue; numeric id |
| 2 | MLPS `lavoro.gov.it` | `/eventi/pagine/` directory 404; **detail cards** `/eventi/pagine/{slug}` 200; list → `/eventi/Pagine/notizie`; Luogo/Data inizio/fine |
| 3 | Unioncamere `/agenda/` | Index `/agenda` 404; **detail** `/agenda/{slug}` `node--type-evento` 200; Futurae-relevant cards exist |
| 4 | EMN/EC Home Affairs | `/whats-new/events_en` + detail `/whats-new/events/{slug}_{lang}` 200; filterable EMN events |
| 5 | Fondazione ISMU | `/eventi-news/` mixes news+events; WordPress article pages; no deterministic event-card/id/refresh model |

---

## 6. Approved vs excluded

### Approved

| sourceCode | Why |
|---|---|
| `pim-ricerca-eventi` | Official MLPS portal; stable numeric id; metadata/link feasible; relevance-filterable |
| `minlavoro-eventi` | Official MLPS Eventi cards; stable slug under `/eventi/pagine/`; listing hub excluded |
| `unioncamere-agenda` | Official Unioncamere evento nodes; relevance-gated to migrant entrepreneurship / inclusion / Futurae |
| `emn-home-affairs-events` | Official EC Home Affairs event cards; EMN-relevant only; exact host+path |

### Excluded

| Candidate | Reason |
|---|---|
| Fondazione ISMU eventi | No stable deterministic event-card identity; news/events mixed; WordPress articles; unreliable refresh |
| Social / Eventbrite / Zoom / Forms | Forbidden as primary identity |
| Single CCIAA sites | Not explicitly authorized |
| Mirrors / aggregators | Out of allowlist |
| MLPS paths outside `/eventi/pagine/{slug}` | Not stable event cards |

---

## 7. Final allowlist

| sourceCode | Publisher | Host(s) | Path prefix / pattern |
|---|---|---|---|
| `pim-ricerca-eventi` | MLPS — Portale Integrazione Migranti | `integrazionemigranti.gov.it`, `www…` | `/it-it/ricerca-eventi/dettaglio-evento/id/` |
| `minlavoro-eventi` | MLPS | `lavoro.gov.it`, `www…` | `/eventi/pagine/` **excl.** `/eventi/pagine/notizie` |
| `unioncamere-agenda` | Unioncamere | `unioncamere.gov.it`, `www…` | `/agenda/` (detail slugs only) |
| `emn-home-affairs-events` | EC Home Affairs / EMN | `home-affairs.ec.europa.eu` | `/whats-new/events` |

Common: `acquisitionMode=METADATA_LINK_ONLY`, `allowedRedirectPolicy=same_source_allowlist`, HTTPS only, polite rate limits documented in code.

---

## 8. Typed contract (real field names)

Code: `src/lib/external-data/events/allowlist.ts`, `acquisition.ts`.

Maps to existing AR/edition columns:

| Contract | Destination |
|---|---|
| `provenance.sourceCode` | `events.external_source_code` |
| `provenance.externalId` | `events.external_id` |
| `sourceUrl` / `canonicalUrl` | `events.source_url` / `canonical_url` |
| `fingerprint` / `naturalKey` | `acquisition_fingerprint` / `external_natural_key` |
| `retrievedAt` / `sourceUpdatedAt` | `acquired_at` / `source_updated_at` |
| `sourceLabel` / attribution | `source_label` |
| `editorial.titleIt` / `platformSummaryIt` | `title` / `summary` |
| `descriptionStub` | `description` (stub, not source body) |
| `typeCode` / `deliveryMode` | `type_code` / `delivery_mode` |
| edition temporal/place | `event_editions.starts_at|ends_at|timezone|venue_label|address_text|city_text|country_ref|online_reference` |
| `registrationUrl` | accessory only (not identity) |
| ingest axes | draft / unpublished / private / `owned_by_editorial=true` |

GO aliases (titleOriginal, attendanceMode, municipality, …) are **not** duplicated — they map to the names above.

---

## 9. Temporal / territorial rules

- `startsAt` required (`YYYY-MM-DD` all-day **or** ISO instant with offset/Z)
- Clock time optional only when source publishes date-only → `allDay=true` (no invented time)
- `endsAt` optional; if present must not precede start
- IANA `timezone` always required (edition column NOT NULL)
- `delivery_mode`: `in_presence` | `online` | `hybrid` with place/online coherence
- Territory: `cityText` / `addressText` / `countryRef` / optional province·region labels / `territoryLabel` — never invent missing addresses

---

## 10. Provenance + cross-source dedupe

Precedence: **source+externalId → canonical URL → fingerprint** (title, start, organizer, venue|online, delivery_mode, sourceCode).  
Cross-source: `crossSourceFingerprint` (no sourceCode) + `mergeCrossSourceEvents` → one primary card (priority PIM → MLPS → UC → EMN) + linked secondary provenances.

---

## 11. Refresh behavior (future importer)

Idempotent CREATE / UPDATE / UNCHANGED.  
Refreshable: source URL/label/checksum/acquiredAt/sourceUpdatedAt/canonical/fingerprint + occurrence metadata (incl. postpone/cancel/venue_changed hints).  
Preserved: editorial/publication/visibility axes, human-edited title/summary, `type_code`.  
`autoPublish` always `false`.

---

## 12. Pilot proposal (NOT imported)

| Source | Cap | Notes |
|---|---:|---|
| `pim-ricerca-eventi` | 6 | Priority entrepreneurship/work/training/economic inclusion |
| `minlavoro-eventi` | 4 | Immigration / work / orientation relevance |
| `unioncamere-agenda` | 3 | Migrant entrepreneurship / Futurae / financial inclusion only |
| `emn-home-affairs-events` | 3 | EMN + economic migration / work / mobility / socioeconomic integration |
| **Total** | **16** | Range 12–20; diversity physical/online|hybrid; no auto-compensation if a source lacks compliant URLs |

---

## 13. Files created / modified

| Path | Action |
|---|---|
| `src/lib/external-data/events/allowlist.ts` | filled closed allowlist |
| `src/lib/external-data/events/acquisition.ts` | contract enrichment |
| `src/lib/external-data/events/acquisition.test.ts` | full deterministic suite |
| `docs/architecture/external-data/d1-d6-eventi-acquisition-contract.md` | this report |
| `docs/architecture/external-data/external-data-acquisition-roadmap.md` | D1-D.6 status |

---

## 14–16. Confirmations

- **Zero new migrations**
- **Zero imports / publishes**
- **Zero remote apply / Production writes**

---

## 17. Tests

| Command | Exit | Outcome |
|---|---:|---|
| `npx tsx --test src/lib/external-data/events/acquisition.test.ts` | 0 | 23 pass / 0 fail |
| `npm run lint` | 0 | 1 pre-existing warning unrelated |
| `npm run typecheck` | 0 | PASS |
| `npm test` | 0 | 278 pass / 0 fail |
| `npm run build` | 0 | PASS (incl. `/eventi`, `/app/redazione/eventi`) |

Coverage: allowlist codes; hostname/path; unauthorized subdomains; off-allowlist redirects; URL canonicalize; tracking/fragment strip; external id; temporal/timezone/all-day; delivery_mode; internal+cross-source dedupe; fingerprint; idempotency; editorial preserve; auto-publish impossible; full body/HTML/images rejected.

---

## 18. Secrets scan

JWT credential-pattern scan on `src`/`docs`/`supabase`/`scripts`: **empty** (no matches).

---

## 19. Unique adversarial review

| Topic | Verdict |
|---|---|
| D1-D.5 compliance | PASS — fills empty allowlist; no schema fork |
| External-data reuse | PASS — mirrors Contenuti contract patterns |
| Source selection | PASS — 4 approved / ISMU excluded with reasons |
| Hosts/paths | PASS — exact hosts + prefixes; no wildcards/subdomains |
| Provenance | PASS — columns already on `events` |
| Temporality/timezone | PASS — all-day vs timed; end≥start; IANA required |
| Cross-source dedupe | PASS — fingerprint merge + priority |
| Idempotency / editorial preserve | PASS — refresh plan tests |
| Copyright / URL security | PASS — metadata/link; HTTPS; no body/HTML/PDF/images |
| No auto-publish / no import / no remote | PASS |

**Review outcome:** ACCEPT

---

## 20. Git (post)

| Check | Result |
|---|---|
| Commit | `a0c1845` — `feat(events): add D1-D.6 Eventi acquisition contract and closed allowlist` |
| Push | FF `a002307..a0c1845` → `origin/main` |
| HEAD ahead/behind | `0/0` |
| Working tree | pre-existing dirt preserved (not staged) |

---

## 21. Residual blockers

1. D1-D.5 migrations still **pending in Production** → import blocked  
2. Future import GO required (metadata/link-only, review-only)  
3. Future editorial publish GO required  
4. Hosting/CDN deploy still separate  
5. Unioncamere/EMN volume may be below caps without compensation

---

## 22. GO / NO-GO for next steps

| Step | Gate |
|---|---|
| (a) Remote apply D1-D.5 migrations `…140000`…`…160000` | **NO-GO** without separate human GO |
| (b) Subsequent Eventi metadata/link-only import | **NO-GO** without separate human GO (and after remote apply if still pending) |

---

*Fine D1-D.6 Eventi acquisition contract*
