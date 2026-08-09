# C4 — Cultura V2 Validation Report

**Date:** 2026-08-09
**Status:** PASS (app-only)
**Baseline Git:** `67c9cb1616fb4895890f1d4be303f6c35f4ecea3` (`feat(db): add cultural taxonomy enrichment`)
**DB head (local = remote):** `20260813150000` · pending `0`
**Migrations created by C4:** `0`
**Schema/RLS/seed:** unchanged
**C3.7 disciplines:** still deferred

---

## 1. Decision

**C4 CULTURA V2 COMPLETATA — HUB MULTI-DOMINIO DATA-DRIVEN — C3.7 ANCORA RINVIATA — DEPLOY APPLICATION V1+CULTURA AUTORIZZABILE**

Hub pubblico `/cultura` aggiornato a criteri Hybrid C (classificazione diretta prioritaria; relazioni Evento come enrichment/fallback). Nessun BC Cultura, nessun sesto ecosistema, nessun SQL.

---

## 2. Pre-gate notes / dirt excluded

Not staged with C4:

- modified `.gitignore`
- untracked `docs/architecture/application/application-v1-deployment-report.md`

---

## 3. Inclusion criteria (V2)

| Domain | Direct (priority) | Relational / fallback |
|---|---|---|
| Eventi | `type_code = cultural` | — |
| Professionisti | categories in `cultural_creative` group + legacy `cultural_mediation` | — |
| Organizzazioni | `primary_scope_code` ∈ culture / heritage / creative_industries | — |
| Imprese | declared CCI sector slugs (C3.3 seed) | — |
| Opportunità | `opportunity_activity_scope_assignments` ∈ culture scopes | OR `context_opportunity_id` on cultural event |
| Collaborazioni | `activity_scope_code` ∈ culture scopes | — (`form_code` independent) |
| Servizi | category `cultural_creative` (offer ≠ request) | — (not `linguistic`) |
| Contenuti | `primary_category_code = culture` | OR `content_event_links` → cultural event |
| Mercati | — | `event_markets` on cultural events |
| Persone | no Cultura field on profiles | via professionisti / existing public relations |

Dedup: deterministic `dedupeById` on opportunity and content unions.

Explicitly **not** used as culture proxies: keywords, title, description, heuristics, legal type, `form_code`, `linguistic`, `events_community` alone.

---

## 4. Deliverables

| Area | Path / change |
|---|---|
| Data layer V2 | `src/lib/data/public/culture.ts` (+ exports in `index.ts`) |
| Unit tests | `src/lib/data/public/culture.test.ts` |
| Hub UI | `src/app/cultura/page.tsx` |
| Cross-links | org / business / collab / opportunity / content / service / professional detail |
| Directory filters | orgs/collabs/opps `ambito`, contents/services/professionals `categoria`, businesses `settore` |
| Labels | `SERVICE_CATEGORIES.cultural_creative` |
| E2E | `e2e/ia.spec.ts` (V2 sections) |
| Architecture | `application-architecture-v1.md` C4 delta |
| This report | `c4-cultura-v2-validation-report.md` |

---

## 5. Hub sections (order)

1. Hero
2. Prossimi incontri (eventi culturali)
3. Opportunità e collaborazioni
4. Persone e competenze (professionisti)
5. Organizzazioni e imprese
6. Servizi culturali/creativi
7. Storie / Contenuti
8. Connessioni internazionali (mercati, se presenti)
9. CTA rete

Empty states refer to missing classified public records (not “Presto: attori culturali classificati”).

---

## 6. IA / navigation

- Cultura remains in Esplora + transversal strip
- Not primary nav / not sixth ecosystem
- Home may link `/cultura`
- Hero brand unchanged

---

## 7. Gates

| Gate | Result |
|---|---|
| `npm test` | **111 pass / 0 fail** (C4 culture criteria + IA) |
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 — route `ƒ /cultura` present |
| E2E IA/public (chromium) | **17 pass / 0 fail** (`e2e/ia.spec.ts` + `e2e/public.spec.ts`) |
| Migration create | **0** |
| DB head | `20260813150000` local = remote · pending `0` |
| Secret/artifact hygiene | `.env.local` untracked; no `.vercel` staged; no tokens in C4 tree |

---

## 8. Explicit non-goals (confirmed)

No Culture BC · no C3.7 · no deploy in this task · no keyword classification · no Persona cultural directory · no new cultural market taxonomy.

---

## 9. Regression (C2)

Preserved: cultural events; opportunity/content/market via cultural event; culture navigation; sitemap; event detail Cultura link when cultural.
