# C2 — Cultura Hub Validation Report

**Date:** 2026-08-09
**Status:** PASS (app-only)
**Baseline decisions:** C0-B · C1-A
**Application HEAD at start:** `5c1451edb880ce2d0a8f0db7107fdd3501755a53` (`v0.4.0-application-v1`)
**DB head (local = remote):** `20260812300000` · pending `0`
**Migrations created:** `0`
**Schema/RLS:** unchanged

---

## 1. Decision

**C2 CULTURA HUB COMPLETATO — PASS — C3 CULTURAL TAXONOMY ENRICHMENT AUTORIZZABILE**

Hub pubblico `/cultura` implementato come livello trasversale event-anchored, senza modifiche DB.

---

## 2. Pre-gate notes

Unrelated local dirt (not part of C2, left untouched):

- modified `.gitignore` (adds `.vercel` / duplicate `.env*` lines)
- untracked `application-v1-deployment-report.md`
- local `.vercel/` directory present (gitignored intent; not staged)

---

## 3. Inclusion criteria (implemented)

| Domain | Criterion |
|---|---|
| Eventi | public + `type_code = cultural` + upcoming/ongoing edition |
| Opportunità | public + `events.context_opportunity_id` from cultural event |
| Contenuti | public + `content_event_links` → cultural event (not `events_community` alone) |
| Mercati | `event_markets` → cultural event (section omitted if empty) |
| Professionisti | public + category `cultural_mediation` only |
| Org / Imprese | narrative future block; no fake queries |
| Collaborazioni / Servizi | CTA only; `linguistic` never used as culture |

---

## 4. Deliverables

| Area | Path / change |
|---|---|
| Data layer | `src/lib/data/public/culture.ts` |
| Unit tests | `src/lib/data/public/culture.test.ts` |
| Route | `src/app/cultura/page.tsx` |
| Nav Esplora | `src/data/navigation.ts` (+ Cultura) |
| Transversal home | `src/data/ecosystems.ts`, `TransversalStrip.tsx` |
| SEO sitemap | `src/app/sitemap.ts` |
| Cross-link | `src/app/eventi/[id]/page.tsx` → Esplora Cultura when cultural |
| E2E | `e2e/public.spec.ts`, `e2e/ia.spec.ts` |
| Architecture note | `application-architecture-v1.md` C2 delta |
| C2.1 not-found harden | `src/lib/data/public/contents.ts` |

---

## 5. Explicit non-goals

No Culture BC · no sixth ecosystem · no seed/catalog changes · no Program AR · no causal “nata da evento” UI.

---

## 6. Gates (C2 initial)

| Gate | Result |
|---|---|
| `npm test` | **105 pass / 0 fail** (includes C2 culture criteria + IA) |
| `npm run typecheck` | 0 (after clearing corrupted `.next` cache) |
| `npm run lint` | 0 |
| `npm run build` | 0 — route `ƒ /cultura` present |
| E2E public+IA chromium | initially **14 pass / 2 fail** (see §6.1) |
| Migration create | **0** |
| DB head | `20260812300000` / pending `0` (pre-gate) |

### 6.1 C2.1 E2E closure

**Failed tests:** `e2e/public.spec.ts` — missing content slug not-found UX (×2).
**Observed:** H1 `Errore inatteso` via root `error.tsx`.
**Cause:** `.env.local` points to local Supabase (`127.0.0.1`); Docker engine unavailable → `getPublicContentBySlug` threw → error boundary. Not a Cultura regression.
**Classification:** env + fragile public-detail error path (throw instead of null/`notFound`).
**Fix:** `getPublicContentBySlug` soft-fails to `null` on query/network errors so the detail route keeps the P6 not-found contract (“non esiste o non è disponibile”).
**Smoke P3/P4/P5:** not re-run — C2/C2.1 are app-only; no auth/business/editorial/RPC/DB surface changed.

| Final gate (C2.1) | Result |
|---|---|
| E2E public+IA chromium | **16 pass / 0 fail** |
| `npm test` | **105 pass / 0 fail** |
| typecheck / lint / build | exit 0 |
| DB local/remote | `20260812300000` · pending `0` |
| Migration create | `0` |

---

## 7. Proposed C3 (not executed)

**C3 — Cultural taxonomy enrichment (seed-only / catalog):** optional G2 seeds (org activity scopes culturali, settori CCI, categorie creative, opz. content category `culture`, opz. event subtypes) so Org/Impresa/Professionisti/Contenuti can enter the hub with structured classification — still no Culture AR.
