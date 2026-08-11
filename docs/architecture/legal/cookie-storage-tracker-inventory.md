# Cookie / Storage / Tracker Inventory — L1.1

**Audit date:** 2026-08-11
**Classification legend:** CONFIRMED · NOT FOUND · INFERRED · UNKNOWN · EXTERNAL CONTRACT REVIEW REQUIRED

---

## 1. Summary

| Category | Result |
|---|---|
| Analytics (GA/GTM/Meta/Vercel Analytics/… ) | **NOT FOUND** in `package.json` / `src` |
| Marketing pixels | **NOT FOUND** |
| CMP / consent banner | **NOT FOUND** |
| localStorage / sessionStorage / indexedDB (app) | **NOT FOUND** |
| App-set cookie | **CONFIRMED** — `ii_selected_business_id` |
| Auth session cookies | **CONFIRMED** mechanism via `@supabase/ssr` (names not hardcoded) |
| Current technical case | **CASE A** (necessary/functional storage only — LEGAL REVIEW for exemption wording) |

---

## 2. Matrix

| Name / mechanism | Provider | Purpose | Necessary? (tech) | Auth/security | Analytics | Preference | Marketing | Lifetime | 1st/3rd | Evidence | Consent candidate |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Supabase Auth session cookies (via `@supabase/ssr` `setAll`) | Supabase Auth + app | Maintain authenticated session (JWT/refresh) | Likely yes (auth) | YES | NO | NO | NO | Session / refresh per Supabase Auth defaults | First-party on site domain (set by Next); Auth processed by Supabase | `src/lib/supabase/server.ts`, `middleware.ts`, `proxy.ts` | **LEGAL REVIEW** (typically necessary for login) |
| `ii_selected_business_id` | App (Immigrati Imprenditori) | Remember selected Impresa in workspace UI | Functional UI | NO (not authZ) | NO | YES (UI) | NO | 90 days (`maxAge: 7776000`) | First-party | `src/lib/business/selected-business.ts`; `httpOnly`, `sameSite=lax`, `secure` in production, `path=/` | **LEGAL REVIEW** (functional preference; not marketing) |
| Vercel edge/platform cookies | Vercel | Infrastructure (UNKNOWN if any set for visitors) | UNKNOWN | — | — | — | — | UNKNOWN | UNKNOWN | Hosting only; no Vercel Analytics in app | **EXTERNAL CONTRACT / runtime observe** |
| Google Analytics / GTM / Meta / LinkedIn / Hotjar / Clarity / PostHog / Plausible / Sentry browser | — | — | — | — | — | — | — | — | — | **NOT FOUND** | N/A |
| Consent / CMP cookies | — | — | — | — | — | — | — | — | — | **NOT FOUND** | N/A |

---

## 3. Storage APIs

| API | App usage |
|---|---|
| `document.cookie` | **NOT FOUND** |
| `localStorage` | **NOT FOUND** |
| `sessionStorage` | **NOT FOUND** |
| `indexedDB` | **NOT FOUND** |
| Next `cookies()` | **CONFIRMED** — Auth SSR + business switcher |

---

## 4. Fonts / network third parties (visitor)

| Tech | Finding | Classification |
|---|---|---|
| `next/font/google` Geist / Geist_Mono | Declared in `src/app/layout.tsx` | **CONFIRMED** |
| Runtime Google Fonts CSS from visitor browser | Typically self-hosted by Next at build with `next/font` | **INFERRED** (Next docs pattern); verify build output / network on production if needed |
| YouTube / Maps / social embeds | **NOT FOUND** | — |
| reCAPTCHA / hCaptcha | **NOT FOUND** | — |
| Stripe / PayPal / Calendly / chat | **NOT FOUND** | — |

---

## 5. Analytics determination

| Product | Verdict |
|---|---|
| Google Analytics | **NO** |
| Google Tag Manager | **NO** |
| Meta Pixel | **NO** |
| LinkedIn Insight | **NO** |
| Vercel Analytics / Speed Insights | **NO** (not in dependencies; no import) |
| Other product analytics in app | **NO** / **NOT FOUND** |

---

## 6. Cookie banner decision tree (technical)

| Case | Condition | Current site |
|---|---|---|
| **A** | Only strictly necessary / auth / functional storage | **CURRENT (technical)** |
| B | Non-necessary analytics | Not present |
| C | Marketing / profiling trackers | Not present |

**Note:** L1.1 does **not** conclude legal exemption. Cookie Policy / informative still typically needed. Adding analytics later → Case B/C + CMP.

---

## 7. Consent management

| Capability | State |
|---|---|
| CMP | **NOT IMPLEMENTED** |
| Consent cookie | **NOT FOUND** |
| Preference centre | **NOT FOUND** |
| Revoke / consent log | **NOT FOUND** |

---

*End cookie inventory L1.1*
