# Application Architecture v1

**Status:** P1–P6 application blocks implemented — **v1 release-ready**; C2 Cultura hub (app-only transversal) — see `c2-cultura-hub-validation-report.md`
**Baseline Git:** `4bf213b7f9391142cf30533ed261243a2b709250` (`v0.3.0-db-access-rls-v1`)
**DB head:** `20260812300000` (local = remote, pending `0`) — unchanged by P2–P6 and C2
**Authority:** Access/RLS v1 (A1/A2) remains the security authority. This document does not redefine DB contracts.

### C2 delta (Cultura hub — transversal, app-only)

- Public hub `/cultura` aggregates existing public facts (event-anchored: `events.type_code = cultural`)
- Esplora + home transversal strip; **not** a sixth ecosystem / not primary nav
- No DB/RLS/migration/seed changes; no Culture AR
- Report: `c2-cultura-hub-validation-report.md`

### P6 delta (E2E / hardening / release)

- Playwright E2E suite (`e2e/`, `npm run test:e2e`) against local Supabase
- `middleware` → `proxy` (Next.js 16 convention)
- Demo home tree removed; public details use `notFound()`; robots/sitemap
- Env readiness documented in `env.example`

### P5 delta (editorial/admin)

- Red workspace: Contenuti / Osservatorio / Organizzazioni under `requireEditor`
- Adm workspace: Account / Ruoli / bootstrap grant under `requireApplicationAdmin`
- Adm ≠ Red preserved in nav (`showEditor` / `showAdmin`) and actions (no `isEditor || isAdmin`)
- Mutations: Red via session+RLS; Adm elevated ops via published RPCs only
- Smoke: `npm run test:p5-smoke`

### P2 delta (facts that supersede §2/§4 “absent” rows)

- Supabase SSR wired: browser / server / middleware / server-only admin clients
- Auth: `/accedi`, `/registrati`, `/auth/callback`, logout server action
- Account provisioning via service-role RPC `access_provision_account` (server-only)
- Application session + `/app/*` shell, onboarding, Adm≠Red nav stubs
- Env: `SUPABASE_SERVICE_ROLE_KEY` (server-only) + optional `NEXT_PUBLIC_SITE_URL`
- Forms: `useActionState` + `FormField` (no RHF/Zod added)
- Tests: `npm test` (node:test via tsx)

### P3 delta

- `/app/profilo` self edit (A4.2 whitelist); contested association UX
- `/app/imprese`, `/app/imprese/[id]` with CTX ≠ ACT labels and ACT-only edit
- Create Impresa + self membership (no automatic grant)
- Cookie business switcher (`ii_selected_business_id`) — UI only
- Memberships panel + `grant_business_management` / `revoke_business_management`
- Adm bootstrap grant on `/app/amministrazione`
- Dashboard shows CTX/ACT counts + selected business

---

## 1. Purpose

Define how the Next.js application must sit on Database Architecture v1 + Access/RLS v1:

- photograph what exists today;
- bind UI/session/routing to Auth ≠ Account ≠ Persona, Adm ≠ Red, CTX ≠ ACT;
- provide a concrete target architecture without inventing new DB entities.

---

## 2. Stack (verified from repository)

| Area | Technology | Version / note | State |
|---|---|---|---|
| Framework | Next.js App Router (`src/app`) | `16.2.10` | Active |
| UI runtime | React / React DOM | `19.2.4` | Active |
| Language | TypeScript | `^5` | Active |
| Package manager | npm (`package-lock.json`) | Node runtime observed `v22.14.0` | Active |
| Styling | Tailwind CSS 4 + `@tailwindcss/postcss` | `^4` | Active |
| Fonts | Geist / Geist Mono (`next/font`) | via `layout.tsx` | Active |
| Component library | Custom `src/components/ui/*` | — | Active, thin |
| State | Local React state only | — | Minimal |
| Forms / validation | None (no RHF/Zod) | — | Absent |
| Supabase JS | `@supabase/supabase-js` | `^2.110.7` | Scaffold unused |
| Supabase SSR | `@supabase/ssr` | `^0.12.3` | Scaffold unused |
| Auth UI | — | — | Absent |
| Testing | — | — | Absent |
| Lint / format | ESLint 9 + Prettier 3 | `eslint-config-next` 16.2.10 | Active |
| CI/CD | No `.github/workflows` | — | Absent |
| Deploy | README default Vercel; no project deploy config | — | Undeclared |

**Env vars referenced in code (names only):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

No service-role env is referenced in application code. `.env.local` exists locally; do not commit secrets.

**AGENTS note:** this project’s Next.js may differ from training data — consult `node_modules/next/dist/docs/` before implementing P2+.

---

## 3. Principles

1. **PostgreSQL/RLS is authoritative.** UI may hide actions; it must never invent permissions.
2. **Auth ≠ Account ≠ Persona.** Session must resolve all three layers explicitly.
3. **Adm ≠ Red.** Administrative UI ≠ editorial UI.
4. **CTX ≠ ACT.** Membership context ≠ business management authorization.
5. **Deny-by-default** for reserved routes and mutations.
6. **No service-role in the browser.** Service-role only in trusted server contexts if ever required (prefer RPC + authenticated client).
7. **No new DB entities** in the application phase without a separate DB cycle.
8. **Prefer thin data access** over a second permission engine on the client.
9. **Public first, reserved second:** discovery can ship before full workspace maturity.
10. **Reuse the existing shell** (Header/Footer/ui tokens) before redesign.

---

## 4. Current application reality

The app today is a **public marketing/demo shell**:

- Working home (`/`) with static demo fixtures (`src/data/home/*`) and `DemoNotice`.
- Domain section routes exist as `SectionPage` + `EmptyState` placeholders.
- Supabase browser/server helpers exist but are **unused**.
- No middleware, no auth flows, no `.from` / `.rpc` usage, no tests.
- Nav CTA **Accedi → `/accedi`** has no page (broken link).

Implication: P2 builds foundation on a clean but incomplete surface — little legacy permission code to unwind, but almost no product behavior yet.

---

## 5. Repository structure (application)

| Path | Responsibility | State |
|---|---|---|
| `src/app/` | App Router pages + root layout + `globals.css` | Active |
| `src/components/home/` | Home sections/cards | Demo/static |
| `src/components/layout/` | Header, Footer | Active |
| `src/components/sections/` | Shared section placeholder page | Active |
| `src/components/ui/` | Primitives (Button, Card, Badge, …) | Reusable |
| `src/data/` | Navigation + section copy + home fixtures | Static |
| `src/lib/site.ts` | Site metadata | Active |
| `src/lib/supabase/` | Browser/server clients | Scaffold unused |
| `src/types/` | Nav/home/section types | Active |
| `public/` | Static assets | Active |
| `supabase/` | Migrations / local DB (not app UI) | Closed Access/RLS v1 |
| `docs/architecture/` | DB + Access + Application docs | Authoritative |

No `pages/`, no `src/middleware.ts`, no `src/app/api/` routes observed.

---

## 6. Auth and session model

### 6.1 Contract (from Access/RLS v1)

```
auth.users
  → public.accounts          (lifecycle / association)
    → public.profiles        (Persona / person_id)
    → account_role_assignments (Red / Adm)
    → business memberships + management authorizations (CTX / ACT)
```

Forbidden legacy assumption: `auth.uid() = profiles.id` as identity mapping.

### 6.2 Application session (minimal)

Load once per authenticated request/shell (not full profile dumps):

| Field | Source | Notes |
|---|---|---|
| `authUserId` | `auth.getUser()` | Auth layer |
| `accountId` | `accounts` via helper/query | Null if no Account |
| `accountStatus` | `accounts.account_status` | Gate UI |
| `personId` | `access_current_person_id()` or account row | Null if contested/absent |
| `isEditor` | `access_is_editor()` | Red only |
| `isApplicationAdmin` | `access_is_application_admin()` | Adm only |

**Separately (lazy):** manageable businesses (`ACT`), membership list (`CTX`). Do not persist derived `can_*` catalogs.

### 6.3 Target auth flows (P2)

| Flow | Mechanism | Notes |
|---|---|---|
| Signup / login | Supabase Auth (email) | Then Account provisioning |
| Session restore | `@supabase/ssr` + middleware cookie refresh | Missing today |
| Logout | `auth.signOut` | Missing |
| Password reset | Supabase Auth | Missing |
| OAuth callback | only if product enables providers | Not present |
| Protected routes | middleware + server checks | Missing |

Provisioning: `access_provision_account` is **service_role only** — must run from a trusted server path after signup (Edge Function / server route with service key never shipped to client), never from browser.

Authenticated RPCs usable from session: `access_link_person`, `access_close_account` (policy inside), role/business RPCs where Adm/ACT checks pass in body.

---

## 7. Routing architecture

### 7.1 Public (IA)

| Area | Suggested routes | Today |
|---|---|---|
| Home | `/` | Demo home |
| Imprese | `/imprese`, `/imprese/[id]` | List placeholder |
| Professionisti | `/professionisti`, `/professionisti/[id]` | Placeholder |
| Opportunità | `/opportunita`, … | Placeholder |
| Servizi | `/servizi` (new) | Absent (home may mention) |
| Eventi | `/eventi`, … | Placeholder |
| Contenuti | `/notizie-e-guide` (+ detail later) | Placeholder |
| Collaborazioni | `/collaborazioni` | Placeholder |
| Osservatorio | `/osservatorio` | Placeholder |
| Mercati | `/lingue-e-mercati` (evolve naming) | Placeholder |
| Organizzazioni | optional public list later | Absent as dedicated route |
| Chi siamo / Contatti / Pubblica | existing | Placeholder |
| Accedi / Registrati | `/accedi`, `/registrati` | **Missing pages** |

Public SELECT remains governed by real lifecycle columns (not a global `published_at` fantasy).

### 7.2 Reserved (IA)

| Area | Who | Notes |
|---|---|---|
| Dashboard | Account active | Overview only |
| Il mio profilo | Own Persona | Column-grant aware |
| Le mie imprese | CTX list | Distinguish ACT |
| Workspace Impresa | ACT | Edit scheda / memberships / grants |
| Domini owned | Persona self / ACT | Servizi, Eventi, MI, Collab, … |
| Redazione | `isEditor` | Contenuti, Osservatorio editorial |
| Amministrazione | `isApplicationAdmin` | Ruoli, bootstrap grant, close Account — **no automatic editorial tools** |

### 7.3 Protection pattern

- Middleware: refresh session; redirect unauthenticated users away from `/app/*` (or chosen reserved prefix).
- Server Components/actions: re-check Account active + role helpers for sensitive pages.
- Never trust client-only role flags.

---

## 8. Data access

### 8.1 Layers (conceptual)

| Layer | Where | Uses |
|---|---|---|
| Public queries | Server Components / cached readers | `.from` SELECT under public policies |
| Authenticated queries | Server + browser as needed | Own rows, CTX reads |
| Mutations / RPC | Server Actions or thin client RPC | Access RPCs + domain INSERT/UPDATE where granted |
| Admin / service | Server-only | `access_provision_account`, exceptional ops |

Suggested future folders (P2+; not created in P1):

- `src/lib/supabase/` — clients (already)
- `src/lib/session/` — resolve application session
- `src/lib/data/public/` — public queries
- `src/lib/data/workspace/` — authenticated workspace queries
- `src/lib/access/` — RPC wrappers only where signatures need typing

Avoid a second ORM. Prefer typed wrappers over ad-hoc `.from` scatter.

### 8.2 RPC inventory for the app

| RPC | Client EXECUTE | App usage |
|---|---|---|
| `access_provision_account` | service_role | Post-signup server provisioning |
| `access_link_person` | authenticated | Onboarding / Admin assist |
| `access_close_account` | authenticated | Self/Adm close flows |
| `assign_application_role` / `revoke_application_role` | authenticated | Adm UI only |
| `access_bootstrap_business_grant` | authenticated | Adm/Svc bootstrap |
| `grant_business_management` / `revoke_business_management` | authenticated | ACT/Adm UI |

Helpers (`access_is_editor`, `access_can_act_for_business`, …) may be called from SQL policies; the app may also call them for UX gating, never as sole authority.

---

## 9. Onboarding (application)

DB already supports Account provisioning, Persona link, profile self columns, memberships, grants. App must orchestrate:

1. Auth signup / email confirm (as product requires)
2. **Server** provision Account (`registered`)
3. Create/link Persona (`access_link_person` or controlled flow) → activate per A3 rules
4. Complete editable profile fields (column grants)
5. Optional: join/create Impresa (membership ≠ ACT)
6. Optional: bootstrap/grant management (Adm/ACT)

UI must surface Account statuses (`registered`, `active`, `limited`, `suspended`, `disabled`, `closed`) without allowing forbidden writes.

---

## 10. Persona / Profile

- Public person views: only fields allowed by public SELECT policies.
- Self-edit: only columns granted to `authenticated` UPDATE on `profiles` (Access A4.2).
- Do not present admin/system fields as editable.
- Avatar/media: only if already modeled; do not invent storage domain in P1–P3 without DB support.

---

## 11. Imprese — CTX ≠ ACT

| UX concept | Meaning | Source |
|---|---|---|
| Le mie imprese | Membership attiva (CTX) | memberships |
| Posso gestire | ACT | membership + grant |
| Ruolo membership | Descriptive label | Never treat as ACT |

Workspace needs:

- list CTX businesses;
- list ACT businesses;
- switcher for current business context (UI state, not a new DB role);
- edit business only when ACT;
- grant/revoke management via RPC, not direct authorization table writes.

---

## 12. Red / Adm

| Capability | Red | Adm (without Red) |
|---|---|---|
| Editorial Contenuti / Osservatorio write | yes | **no** |
| Assign/revoke application roles | no | yes |
| Bootstrap first business grant | no | yes |
| Close Account (admin path) | no | yes |

Separate navigation trees. Combined Red+Adm is allowed as union of capabilities, not as Adm implying Red.

---

## 13. Forms, errors, UI states

### Forms (target pattern P2+)

- Prefer Server Actions + progressive enhancement where natural.
- Client validation for UX; server/RLS errors authoritative.
- Single pattern for loading / field errors / form-level errors.

### Error / UI states

| State | When |
|---|---|
| Loading | Pending fetch/mutation |
| Empty | Authorized but no rows |
| Unauthorized | No session |
| Forbidden | Session but RLS/RPC deny (`42501`) |
| Not found | Missing or non-public resource |
| Validation | Input / check constraints |
| Conflict | Unique / already exists (`23505`) |
| Server error | Unexpected |

Map Access RPC failures at least: `42501` not authorized, `23505` conflict, `P0002` not found where used.

---

## 14. Design system

Existing tokens in `globals.css`: brand teal, warm surface, accent terracotta, soft shadow, Geist fonts.

Primitives to **reuse**: Container, Section, Button, ButtonLink, Card, Badge, EmptyState, Header/Footer.

P1 decision: **no aesthetic redesign**. Evolve tokens only when a product screen requires it.

---

## 15. Testing strategy (baseline for P6)

Today: none. Minimum later:

- Auth login/logout + session restore
- Onboarding provision + link Persona
- Profile self-edit boundaries
- Business CTX vs ACT
- Adm ≠ Red negative cases
- Public discovery list/detail
- Main create/edit happy paths
- Authorization negatives (anon write, inactive account, membership without grant)

Prefer Playwright (or equivalent) E2E against local Supabase; keep unit tests for session/helpers.

---

## 16. Security

| Topic | P1 finding | Rule |
|---|---|---|
| Service role in client | Not present | Keep absent (B0 if introduced) |
| Publishable key | Public by design | OK |
| Role checks client-only | N/A yet | Insufficient alone |
| Protected routes | Missing | Required in P2 |
| Open redirects | Login absent | Validate `next` params when added |
| Admin endpoints | None | Server-only + Adm checks |

---

## 17. Performance (analysis only)

Current risk is low (static pages). Future risks to avoid:

- loading all memberships/grants on every layout render;
- N+1 detail fetches in lists;
- unbounded public lists without pagination;
- duplicating SSR + client fetches for the same session.

---

## 18. Deployment boundary

- App: Next.js host (likely Vercel; not locked in repo).
- Data/auth: Supabase project already hosting Access/RLS v1.
- Migrations: closed for this phase unless a new DB cycle is opened.
- Secrets: service role only on server/CI, never `NEXT_PUBLIC_*`.

---

## 19. Out of scope for application v1 UI

Aligned with Access residual limits: Org membership graphs, delegations, consents product, collaboration matching, advanced audit, last-admin/manager DB enforcement, training Access rewrite, observatory microdata/ETL.
