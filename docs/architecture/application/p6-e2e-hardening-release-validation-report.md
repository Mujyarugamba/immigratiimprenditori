# P6 — E2E / Hardening / Release — Validation Report

**Status:** COMPLETED
**Date:** 2026-08-08
**DB head (local = remote):** `20260812300000`
**Pending migrations:** `0`
**Migrations created in P6:** none
**RLS / schema changes:** none

---

## 1. Esito sintetico

P6 chiude la fase applicativa v1: Playwright E2E ad alto valore, hardening security/UX/SEO, cleanup demo legacy, migrazione `middleware` → `proxy`, gate verdi.

**Decisione:** P6 E2E/HARDENING/RELEASE COMPLETATO — APPLICATION V1 AUTORIZZABILE A REVIEW FINALE E COMMIT.

---

## 2. Scope P6 (cosa è / non è)

**È:** validazione E2E, bugfix, hardening, responsive/a11y base, SEO base, cleanup legacy morto, env readiness, report release.

**Non è:** nuove feature core, migration/RLS, redesign, analytics/observability, commit/push/deploy.

---

## 3. E2E framework

- **Tool:** Playwright (`@playwright/test`)
- **Config:** `playwright.config.ts`
- **Scripts:** `npm run test:e2e` (chromium), `npm run test:e2e:mobile` (chromium + viewport mobile)
- **Fixtures:** Admin API + local Supabase status env; cleanup via `psql` docker
- **Browser:** Chromium (desktop + mobile viewport)

### Suite

| Spec | Copertura |
|---|---|
| `e2e/auth.spec.ts` | anon, login, session restore, logout, private redirect, registered shell |
| `e2e/business.spec.ts` | profilo, CTX no ACT, bootstrap deny, ACT edit, UI imprese |
| `e2e/editorial.spec.ts` | Red create contenuto, hub OSS/Org |
| `e2e/roles.spec.ts` | ordinary/Red/Adm/Red+Adm, self-elevate deny |
| `e2e/public.spec.ts` | 10 route pubbliche, not-found UX |
| `e2e/ia.spec.ts` | identity hero, ecosistemi, trasversali |
| `e2e/responsive.spec.ts` | overflow mobile, lista tablet |

### Esito E2E

| Progetto | Test | Pass | Fail | Durata tipica |
|---|---:|---:|---:|---|
| chromium | 27 | 27 | 0 | ~3–5 min |
| mobile | 17 | 17 | 0 | ~1.5–2 min |
| **Totale** | **44** | **44** | **0** | ~4 min combined |

---

## 4. Hardening eseguito

### Middleware → Proxy
- `src/middleware.ts` → `src/proxy.ts` (`export async function proxy`)
- Matcher esclude `robots.txt` / `sitemap.xml`
- Build mostra `ƒ Proxy` (warning deprecation risolto)

### Legacy cleanup
Rimossi demo home non montati: `src/data/home/*`, card/section demo, `src/types/home.ts`, `PublicNotFound` (sostituito da `notFound()`).

### Error / 404 UX
- `src/app/not-found.tsx`, `src/app/error.tsx`
- Detail pubblici: `notFound()` (HTTP 404 path) + messaggio generico
- Error boundaries non espongono `error.message` grezzo

### SEO base
- `metadataBase` + Open Graph root
- `src/app/robots.ts`, `src/app/sitemap.ts`
- Home `metadata`

### A11y / responsive
- `:focus-visible` globale
- `table-scroll` per tabelle backoffice
- Label `Corpo` con `htmlFor`/`id` + error association
- E2E h1 uniqueness su liste pubbliche

### Env
- `env.example` esteso (locale / hosted / production checklist)
- `getSiteUrl()` in `src/lib/env.ts`
- Required env falliscono con messaggio chiaro

### Security
- Public data: nessun admin/service client
- Boundary tests aggiornati (proxy + public modules)
- Secret scan: `sb_secret_`=0, JWT hardcoded=0, `.env.local` non tracked

---

## 5. Regressioni

| Gate | Esito |
|---|---|
| `npm run test:p3-smoke` | PASS + cleanup |
| `npm run test:p4-smoke` | PASS + cleanup |
| `npm run test:p5-smoke` | PASS + cleanup |
| `npm test` | **93 pass / 0 fail** |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |

---

## 6. Release checklist

- [x] DB invariato (`20260812300000`, pending 0)
- [x] RLS invariata
- [x] Auth (login/logout/session/private)
- [x] Public lists + IA
- [x] P3 CTX/ACT
- [x] Red workspace
- [x] Adm workspace + Adm≠Red
- [x] Unit/integration tests
- [x] E2E 44/44
- [x] Security / secret scan
- [x] Env documented
- [x] Responsive smoke
- [x] Accessibility base
- [x] Build verde
- [x] Cleanup fixture smoke/E2E

---

## 7. Post-v1 backlog (non bloccante)

- Reputazione/verifica avanzata; deleghe; Org membership
- Matching Collaborazioni; audit avanzato; analytics; observability
- Storage avanzato; dataset/feed
- Last-admin / last-manager protection DB
- Training quarantine Access
- Redesign completo; WCAG certification; SEO avanzata
- E2E WebKit/Firefox cross-browser matrix

---

## 8. Readiness

| Dimensione | Stato |
|---|---|
| Commit review | **Autorizzabile** (nessun stage/commit eseguito in P6) |
| Deploy production | **Autorizzabile dopo review/commit** con env production documentate |
| Bloccanti | **nessuno** |

### Non bloccanti
- Next console hint `data-scroll-behavior` (attributo aggiunto)
- E2E mobile usa Chromium+viewport (non WebKit nativo)
- Revisione valore OSS non atomica (già nota P5)
