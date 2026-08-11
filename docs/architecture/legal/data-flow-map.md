# Data Flow Map — L1.1

**Audit date:** 2026-08-11
Factual technical flows only. Legal bases = TO BE DETERMINED.

---

## 1. Anonymous visitor

```
VISITOR browser
  → HTTPS DNS www.immigratiimprenditori.it
  → Vercel (Next.js hosting / edge)     [CONFIRMED RUNTIME PROVIDER]
  → Next.js App Router (SSR/RSC)
  → Supabase JS server client (publishable key + cookies if any)
  → Supabase PostgREST / PostgreSQL     [CONFIRMED RUNTIME PROVIDER]
  → Public RLS-filtered rows
  → HTML/JSON response to visitor
```

Optional parallel:
- Fonts: served via Next font pipeline (Geist from `next/font/google` at build) — **INFERRED** no visitor→Google runtime for fonts.
- `mailto:info@…` — opens local mail client; **no** app server mail pipeline — **CONFIRMED**.

**NOT in path today:** analytics SDKs, ad pixels, chat widgets, payment processors.

---

## 2. Signup / login

```
USER
  → /registrati or /accedi (AuthForm)
  → Server Action signUp / signIn
  → Supabase Auth (email/password)
      → Auth email (confirm/reset) via Supabase mailer / configured SMTP
         [CONFIRMED Auth uses email; prod SMTP = EXTERNAL CONFIG REVIEW]
  → auth.users + trigger → profiles row
  → access_provision_account (service_role server-only)
  → accounts row
  → Session cookies set via @supabase/ssr
  → Onboarding (/app/onboarding) → access_link_person + optional display_name
  → Active workspace (/app/…)
```

---

## 3. Authenticated domain actions

```
USER (authenticated)
  → Server Actions / RSC with createClient()
  → PostgreSQL under RLS + role checks
  → Persona edit / Impresa create-edit / membership
  → Editorial (redattore): Contents, Organizations, Observatory
  → Admin (amministratore): account close, roles
  → Cookie ii_selected_business_id (UI selection only)
```

Service role: **server-only** for provision RPCs — **CONFIRMED** (`env.example`); never browser.

---

## 4. Public Persona publication

```
USER toggles is_public=true (default false)
  → profiles published_at trigger/checks
  → Anon/authenticated SELECT via RLS (full row including phone)
  → Next public layer selects allow-list WITHOUT phone
  → /persone/[slug] HTML + metadata (title/description)
  → Crawlability: robots allow /; sitemap lists /persone hub only
     (individual slugs not in sitemap; not disallowed) — CONFIRMED
```

---

## 5. Public business / editorial content

```
Manager/redattore sets publication_status / visibility
  → Public list/detail routes
  → Aggregations (e.g. /cultura filters) — no separate Cultura AR
```

---

## 6. Future external data (D1 — not imported)

```
(Future) Ingestion tooling (Node, allowlisted URLs)
  → Aggregate open data / curated opportunities
  → Observatory values / Opportunity drafts
  → NO personal profile scraping (D1.1/D1.2 contracts)
```

**CONFIRMED today:** no external dataset rows imported; D1.3 not executed.

---

## 7. Providers (technical roles)

| Provider | Role class | In visitor/user path? |
|---|---|---|
| Vercel | CONFIRMED RUNTIME PROVIDER | YES |
| Supabase (Auth, Postgres, API) | CONFIRMED RUNTIME PROVIDER | YES |
| Supabase Storage | Config enabled locally; app upload **NOT FOUND** | N/A app |
| Supabase Realtime / Edge Functions app use | **NOT FOUND** in app code | NO |
| Email SMTP (prod) | UNKNOWN / EXTERNAL REVIEW | Auth emails if enabled |
| GitHub | DEVELOPMENT PROVIDER | Not visitor runtime |
| Google (font source at build) | Build toolchain via next/font | Runtime to Google: INFERRED NO |

---

## 8. International transfers — evidence only

| Evidence | Status |
|---|---|
| Production Supabase project region | **NOT in repo** — EXTERNAL CONTRACT / dashboard REVIEW |
| Vercel deployment region | **NOT in repo** — EXTERNAL REVIEW |
| Endpoint pattern | `*.supabase.co`, Vercel app host — CONFIRMED typical |
| SCC / DPA text | **NOT in repo** — EXTERNAL CONTRACT REVIEW REQUIRED |

---

## 9. Processing activities (ROPA input)

| Name | Data subject | Categories | Purpose | Trigger | System | Visibility | Recipients | Retention tech | Legal basis |
|---|---|---|---|---|---|---|---|---|---|
| Account authentication | Registered user | Email, credentials, session | Access platform | Signup/login | Supabase Auth + Next | Private | Supabase, Vercel | Until account deleted (no self-delete) | TBD |
| Persona profile | Linked user | Identity/contact/geo/bio | Community profile | Profile edit / publish | Postgres profiles | Private→public if is_public | Supabase, Vercel, public internet if published | Missing policy | TBD |
| Business sheet | Member/manager | Business identity texts | Show enterprise | Create/publish | businesses | Private→public | Same | Missing policy | TBD |
| Editorial content | Readers + subjects in text | Editorial UGC | Inform | Redattore publish | contents | Public when published | Same | Withdrawn retained | TBD |
| Org directory | Readers; officials | Org + official names | Directory | Redattore | organizations | Public when published | Same | Withdrawn retained | TBD |
| Observatory stats | Readers | Aggregate statistics | Inform | Redattore / future ingest | observatory_* | Public when published | Same | Revisions retained | TBD |
| Contact mailto | Correspondent | Email content in user mail client | Contact | Click mailto | User MUA → mailbox info@ | Outside app | Mail providers of parties | Outside app | TBD |
| Workspace UI preference | Authenticated | Business UUID cookie | UX switcher | Select business | Cookie | Browser | First-party | 90 days | TBD |
| Hosting/security logs | Visitors/users | IP/UA/etc. possible | Ops/security | Platform | Vercel/Supabase | Ops | Providers | EXTERNAL | TBD |
| Future external data ingest | N/A persons (aggregate) | Open data aggregates | Enrich domains | Future D1.3+ | Future tooling | After publish rules | Sources + platform | Per D1 contracts | TBD |

---

*End data flow map*
