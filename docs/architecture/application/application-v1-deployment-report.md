# Application v1 — Deployment Report

**Date:** 2026-08-09
**Status:** STOPPED — hosting not linked; credentials / commercial choice required
**Application baseline:** `5c1451edb880ce2d0a8f0db7107fdd3501755a53`
**Tag:** `v0.4.0-application-v1`
**DB head (local = remote):** `20260812300000`
**Pending migrations:** `0`
**DB / RLS / migrations changed for deploy:** no

---

## 1. Decision (this run)

**DEPLOY APPLICATION V1 NON SUPERATO — CORREZIONI NECESSARIE**

Reason: no hosting project is configured in the repository, and creating a new Vercel link requires interactive authentication / account choice. Per deploy protocol §4: STOP before credential or commercial operations.

No production deploy attempted. No Auth remote settings changed. No secrets printed or committed.

---

## 2. Pre-gate repository

| Check | Result |
|---|---|
| Repo | `immigrati-imprenditori` |
| Branch | `main` |
| HEAD | `5c1451edb880ce2d0a8f0db7107fdd3501755a53` |
| HEAD = origin/main | yes |
| ahead/behind | `0/0` |
| Working tree | clean at gate (report file may appear untracked locally) |
| Tag local/remote | `v0.4.0-application-v1` present |
| `.env.local` tracked | no (gitignored) |
| Secret scan (JWT / `sb_secret_` literals) | 0 hits |

---

## 3. Database

| Check | Result |
|---|---|
| Linked project | `immigratiimprenditori` (`hvfvfatlaspcpszgizhg`, eu-west-3, ACTIVE_HEALTHY) |
| Local head | `20260812300000` |
| Remote head | `20260812300000` |
| Pending mismatch | `0` |
| Application migrations | `0` |
| Push DB | not executed |

Local Docker Supabase status was unavailable (Docker engine not running). Remote linked DB inspection via `migration list --linked` succeeded.

---

## 4. Hosting inventory (real state)

| Area | Stato reale |
|---|---|
| Vercel project / `.vercel/` | absent |
| `vercel.json` | absent |
| Netlify / `netlify.toml` | absent |
| Docker deploy | absent |
| GitHub Actions / CI deploy | absent (no `.github/workflows`) |
| Deploy scripts in `package.json` | absent |
| Custom production domain in repo | undeclared |
| README deploy hint | generic Next.js → Vercel template text only |
| Architecture note | “Deploy undeclared” |
| Global `vercel` CLI | not installed |
| `npx vercel whoami` | invalid/missing token; login flow started then aborted |
| Preferable hosting if greenfield | Vercel (Next.js 16) |

---

## 5. Environment inventory (names only)

Required by code:

| Name | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | `access_provision_account` via `createAdminClient()` |
| `NEXT_PUBLIC_SITE_URL` | public (optional locally) | email redirect, metadataBase, robots/sitemap |

Local `.env.local` (names only): points to **local** Supabase URL; has service-role; **does not** define `NEXT_PUBLIC_SITE_URL`. Must not be copied as production env without remapping to remote Supabase.

---

## 6. Service-role boundary (code)

| Check | Result |
|---|---|
| Not `NEXT_PUBLIC_` | yes |
| Browser guard in `getServiceRoleKey()` | yes |
| Imports limited to `admin.ts` + `provision-account.ts` | yes |
| Security-boundary unit tests | present |
| Browser exposure in this run | not deployable yet (no preview bundle) |

---

## 7. Supabase Auth URLs (required when preview/prod exist)

App callback route: `/auth/callback`
Signup email redirect (when site URL set): `{SITE_URL}/auth/callback?next=/app/onboarding`

When preview URL is known, Auth should allow:

- Site URL → production origin (when production goes live)
- Redirect URLs allow-list entries for:
  - `https://<preview-host>/auth/callback`
  - `https://<preview-host>/auth/callback?**` (if wildcards supported / needed)
  - `https://<production-host>/auth/callback`

**Not modified remotely in this run** (no URLs yet; avoid blind Auth edits).

---

## 8. Preview / production

| Step | Result |
|---|---|
| Preview command | not executed |
| Preview URL | n/a |
| Preview smoke | n/a |
| Production deploy | blocked |
| Production domain | **not configured / not chosen** |

---

## 9. Rollback (documented, unused)

| Item | Value |
|---|---|
| Stable application tag | `v0.4.0-application-v1` |
| Commit | `5c1451edb880ce2d0a8f0db7107fdd3501755a53` |
| DB rollback | not required (no DDL) |
| Hosting rollback | redeploy previous deployment / previous commit after hosting exists |

---

## 10. Unblock checklist (user actions required)

1. **Authorize hosting:** log in to Vercel (or confirm alternate host) — e.g. `npx vercel login`.
2. **Create/link project** for this repo (team/account choice is yours).
3. **Confirm production domain** (Vercel `*.vercel.app` only vs custom domain).
4. **Set hosting env** (Preview + Production) to **remote** Supabase project `immigratiimprenditori`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `NEXT_PUBLIC_SITE_URL` (preview URL for Preview env; production URL for Production env)
5. After preview URL exists: add matching Supabase Auth redirect URLs (documented above), then resume preview smoke → production promotion.

---

## 11. Git

No deploy code fix required yet.
This report is created locally; **not auto-committed** (await explicit authorization).
