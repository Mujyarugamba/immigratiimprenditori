# P4 — Public / Core Domains Validation Report

**Date:** 2026-08-07
**Branch:** `main` (uncommitted application work; no commit/push in this close-out)
**DB head (local + remote):** `20260812300000` — pending **0**
**DB/RLS/Access changes:** **none**
**Decision:** P4 PUBLIC/CORE DOMAINS COMPLETATO — P5 EDITORIAL/ADMIN AUTORIZZABILE

---

## 1. Esito

Portale pubblico navigabile sui 9 domini core + Contenuti in lettura, alimentato da query RLS-bound (anon/session client), senza fixture demo in home e senza service role sulle SELECT pubbliche.

## 2. Stato iniziale

- P1–P3 chiusi; area autenticata operativa
- Pagine pubbliche = `SectionPage` placeholder + home demo
- `src/lib/data/public/` stub
- Head DB `20260812300000`, pending 0

## 3. Route pubbliche

| Route | Tipo |
|---|---|
| `/imprese`, `/imprese/[id]` | list/detail |
| `/professionisti`, `/professionisti/[id]` | list/detail |
| `/opportunita`, `/opportunita/[id]` | list/detail |
| `/servizi`, `/servizi/offerte/[id]`, `/servizi/richieste/[id]` | tabs + detail |
| `/eventi`, `/eventi/[id]` | list/detail + edizioni |
| `/collaborazioni`, `/collaborazioni/[slug]` | list/detail (slug) |
| `/mercati`, `/mercati/[code]` | list/detail (`code`) |
| `/organizzazioni`, `/organizzazioni/[slug]` | list/detail |
| `/osservatorio`, `/osservatorio/[slug]` | list/detail + valori |
| `/contenuti`, `/contenuti/[slug]` | list/detail |
| `/lingue-e-mercati` → `/mercati` | redirect |
| `/notizie-e-guide` → `/contenuti` | redirect |

## 4. Home

- Rimossi `DemoNotice` e sezioni demo come source pubblica
- Sezioni reali via `listHome*` + empty state se DB vuoto
- Quick access aggiornato (Mercati, Servizi)

## 5. Navigation

**Primary:** Imprese, Professionisti, Opportunità, Servizi, Eventi, Osservatorio
**Altro:** Collaborazioni, Mercati, Organizzazioni, Contenuti, Chi siamo

## 6. Data layer pubblico

`src/lib/data/public/*` — list/detail/home per dominio; paging in `paging.ts`; solo `createClient()` server (publishable + cookies); colonne esplicite; no admin/service role.

## 7–16. Domini

| Dominio | List | Detail | Note |
|---|---|---|---|
| Imprese | sì | id | settori/location pubblici in detail |
| Professionisti | sì | id | Account ≠ Professionista |
| Opportunità | sì | id | lifecycle RLS |
| Servizi | offerta/richiesta separate | sì | tab `?tipo=` |
| Eventi | sì | id + edizioni | Evento ≠ Edizione |
| Collaborazioni | sì | slug | forma/stato |
| Mercati | sì | code | no catalogo inventato |
| Organizzazioni | sì | slug | officials pubblici |
| Osservatorio | sì | slug + tabella valori | FonteStatistica distinta |
| Contenuti | sì | slug | sola lettura (P5 CRUD) |

## 17. Cross-link

Link tipizzati dove i moduli li espongono (contenuti→fatti; impresa settori/location; evento edizioni). Nessuna relazione inventata.

## 18. Search

Per-dominio `?q=` (ilike). Nessun FTS nuovo / nessuna migration.

## 19. Filtri

Query params URL (`q`, `forma`, `pratica`, `origine`, `stato`, `tipo`, `categoria`, `erogazione`, `modalita`, `in_evidenza`, `page`). Reset + zero-result.

## 20. Pagination

`range` + `page`/`pageSize` (default 12) via `parsePageParams`.

## 21. SEO

`metadata` title/description su list/detail pubbliche; template sito invariato.

## 22. Loading / error / empty

`loading.tsx` per dominio; ErrorState su fetch fallita; PublicEmpty / PublicNotFound.

## 23. Responsive

Grid 1/2/3 colonne; filtri stack; pattern esistente Header/Container.

## 24. Accessibility base

Heading h1/h2; label filtri; link card; focus header esistente.

## 25. Fake data

Home non usa più demo fixtures come source pubblica. Fixture demo restano in `src/data/home/*` ma non montate in `/`.

## 26. Security query

Nessun admin client nei moduli public; RLS authority; campi admin non in SELECT list.

## 27. Performance

Select colonne; join limitati; pagination; home `Promise.all` con catch→[].

## 28–37. Test unitari per dominio

Suite `public-domains.test.ts` + `visibility-gates.test.ts`: paging, contratti filtri per dominio, gate RLS documentati. Copertura funzionale runtime nello smoke.

## 38. Smoke P4

`npm run test:p4-smoke` → **P4_SMOKE_PASS** / **P4_SMOKE_CLEANUP_DONE**
Public vs non-public per dominio; Osservatorio/Eventi/Servizi/Contenuti espliciti.

## 39. Smoke P3 regression

`npm run test:p3-smoke` → **P3_SMOKE_PASS** (CTX/ACT invariato).

## 40. Fixture cleanup

Cleanup SQL owner-level; leftovers 0 dopo smoke.

## 41–43. npm test

**68 pass / 0 fail** (37 P2/P3 + 31 P4).

## 44–46. Quality gates

| Gate | Result |
|---|---|
| typecheck | 0 |
| lint | 0 |
| build | 0 (middleware→proxy warning) |

## 47–50. Database

| Check | Result |
|---|---|
| Locale head | `20260812300000` |
| Remoto head | `20260812300000` |
| Pending | **0** |
| Migration create | **nessuna** |
| RLS/Access | **invariati** |

## 51. Report P4

Questo documento.

## 52–53. Legacy

Corretto: placeholder section pages, home demo wiring, nav “Lingue e mercati” → Mercati, redirect legacy.
Residuo: file fixture in `src/data/home/*` non montati (innocui; cleanup estetico opzionale).

## 54. Problemi bloccanti

Nessuno.

## 55. Osservazioni non bloccanti

- Markdown contenuti renderizzato come pre-wrap (no MD lib)
- service_role senza DML GRANT → smoke cleanup via psql (come P3)
- SEO/a11y avanzate → P6
- CRUD Red/Osservatorio/Org → P5

## 56–58. Git (no stage/commit/push)

Vedere output sessione: `git diff --check`, `--stat`, `status --short`.

## 59. Readiness P5

Sì: lettura pubblica stabile; backoffice editoriale/admin può partire senza toccare discovery pubblica.

## 60. Decisione finale

**P4 PUBLIC/CORE DOMAINS COMPLETATO — P5 EDITORIAL/ADMIN AUTORIZZABILE**
