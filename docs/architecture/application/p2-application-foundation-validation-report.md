# P2 — Application Foundation Validation Report

**Date:** 2026-08-07
**Repo:** `immigrati-imprenditori`
**Branch:** `main` @ `4bf213b7f9391142cf30533ed261243a2b709250` (+ uncommitted P1/P2 application work)
**DB head (local=remote):** `20260812300000` · pending `0` · `pgdelta` absent
**Decision:** P2 APPLICATION FOUNDATION COMPLETATA — P3 IDENTITY + BUSINESS WORKSPACE AUTORIZZABILE

---

## 1. Scope verified

Implemented and validated locally without DB migrations, RLS edits, remote DB changes, commit, or push.

## 2. Build / quality gates

| Gate | Command | Exit |
|---|---|---|
| Unit/integration foundation tests | `npm test` | `0` (21 pass / 0 fail) |
| Typecheck | `npm run typecheck` | `0` |
| Lint | `npm run lint` | `0` |
| Production build | `npm run build` | `0` |

Build note (non-blocking): Next.js 16 warns that the `middleware` file convention is deprecated in favor of `proxy`. Session refresh remains correct for `@supabase/ssr`.

## 3. Security checks (P2)

- Service-role client only in `src/lib/supabase/admin.ts` + provisioning path
- Browser client uses publishable key only
- Static tests assert `client.ts` / auth actions do not import service role
- `getServiceRoleKey()` throws if called in browser
- Open-redirect hardening via `safeRedirectPath`
- Route guards are UX-only; RLS/RPC remain authority
- Adm ≠ Red enforced in `navFlags` / `requireEditor` / `requireApplicationAdmin` separately

## 4. Auth / Account / Persona

| Step | Mechanism |
|---|---|
| Signup/login | Supabase Auth server actions |
| Account provision | `access_provision_account` via admin client (service_role) after auth |
| Persona bootstrap | Legacy trigger `handle_new_user` (Persona id = auth user id) |
| Persona link | `access_link_person(accountId, auth.uid())` self-service |
| Session | Helpers `access_current_*` / `access_is_*` + `accounts` self SELECT |

App code does not treat `auth.uid() = profiles.id` as an authorization policy rule; self-link uses the published RPC contract.

## 5. Account states UX

| Status | Behavior |
|---|---|
| registered / missing Persona | `/app/onboarding` |
| active | `/app` dashboard |
| limited | operational routes allowed; active-only routes denied |
| suspended / disabled / closed | dedicated `/app/stato/*` pages |

## 6. Tests coverage mapping

1. Public/null session → unauthenticated
2. Authenticated without Account → auth ok
3. registered without Persona → onboarding
4. active → ok
5. limited → operational ok
6–8. suspended/disabled/closed → status pages
9–11. Red-only / Adm-only / Red+Adm nav separation
12. Session expiry (null) blocked
13. Protected Red route denies non-editor
14. Service-role boundary (static + no invented `can_*`)

Local Supabase live smoke (2026-08-07, local only): **PASS** — signup → `access_provision_account` (service_role) → login → `access_link_person` → logout. No remote Auth/DB operations.

## 7. Explicit non-changes

- No new SQL migrations
- No RLS / Access SQL edits
- No remote DB operations
- No P3 business workspace / CTX-ACT UI

## 8. Residual for P3+

- Domain CRUD and public discovery from DB
- Business CTX ≠ ACT workspace + switcher
- Full Red/Adm consoles beyond stubs
- Demo home fixtures still present on public marketing shell
- Optional migration of Next.js `middleware` → `proxy` convention
- Full E2E against local Auth (P6)
