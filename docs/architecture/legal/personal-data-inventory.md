# Personal Data Inventory — L1.1 (+ L1.1b update)

**Audit date:** 2026-08-11
**L1.1b update:** 2026-08-11 — Persona professional contacts
**Persona model:** `public.profiles` (no separate people table) — **CONFIRMED**
**Contact SoT (Persona):** `public.person_contact_channels` — **L1.1b**

---

## 1. Data subjects (categories)

| Category | Data that may be processed | Evidence |
|---|---|---|
| Anonymous visitor | Technical connection data via hosting (Vercel) / DB queries for public content — extent of logs **EXTERNAL REVIEW** | Public routes, RLS anon SELECT |
| Registered user (Auth) | Email, password hash (Auth), optional signup `full_name` metadata | `AuthForm`, `signUpAction` |
| Persona (linked profile) | Profile fields below | `profiles` |
| Business member / manager | Membership + business fields; selected business cookie | business forms/actions |
| Professional | DB entity exists; **no app create UI** today | public read only |
| Redattore | Editorial content/org/observatory + account roles | `/app/redazione` |
| Amministratore | Account admin actions (close, roles) | `/app/amministrazione` |
| Org official (editorial) | display_label, optional email/phone on official (editorial); public shows name only | org forms vs public select |

---

## 2. Auth data

| Data | Stored | User-entered | Public | Notes |
|---|---|---|---|---|
| Email | `auth.users` | YES | NO (app) | **CONFIRMED** |
| Password | Auth (hashed by Supabase) | YES | NO | **CONFIRMED** |
| `full_name` metadata | Auth user metadata (signup optional) | YES | NO | **CONFIRMED** |
| Auth UID | system | NO | Selected as `profiles.id` for joins; not rendered on public person page | **CONFIRMED** |
| Email confirmation | Local `config.toml` `enable_confirmations=false`; **hosted prod UNKNOWN** | — | — | **EXTERNAL CONFIG REVIEW** |
| Password reset UI | **NOT FOUND** in app | — | — | May exist via Supabase defaults — **UNKNOWN** product path |

---

## 3. Persona (`profiles`) — user-facing fields

| Field | Entered via | Public UI select | Public render | Anon DB path |
|---|---|---|---|---|
| display_name | onboarding + profile | YES | YES | YES (published) |
| slug | profile | YES | YES (URL) | YES |
| bio | profile | YES | YES | YES |
| city, province, region, country | profile | YES | YES | YES |
| website | profile | YES | YES | YES (presentation) |
| avatar_url | grantable; **UI edit NOT FOUND** | YES | YES if set | YES |
| organization_name / role_description | grantable; limited UI | YES | YES if set | YES |
| organization_type | grantable | NO | NO | YES |
| is_public | profile toggle | NO (gate) | — | gate |
| is_active, published_at, deleted_at | system / limited grants | NO | NO | internal |
| `profiles.phone` (legacy) | retired | NO | NO | column forced NULL (`CHECK`) |

### 3b. Persona professional contacts (`person_contact_channels`) — L1.1b

| Field | Entered via | Anon values | Registered network | Owner | Default share |
|---|---|---|---|---|---|
| phone | profile form | NO (table no SELECT) | Via RPC if share | YES | share false |
| contact_email | profile form | NO | Via RPC if share | YES | share false |
| share_* flags | checkboxes | NO | Indirect (mask) | YES | false |

Anon may call `person_has_shared_network_contact` (boolean for CTA only).
**Auth email is never written to `contact_email`.**

**Email on profiles:** **NOT FOUND**.

**Default visibility:** `is_public` default **false** — **CONFIRMED**. Contact share defaults **false** — **CONFIRMED**.

---

## 4. Account (`accounts`) — system

| Data | Public | Notes |
|---|---|---|
| account id, person_id, account_status, closed_at, timestamps | NO | Self/admin SELECT only |
| Roles (redattore, amministratore, …) | NO | Access model |

---

## 5. Impresa — user-entered (create/edit UI)

| Field | Create | Edit | Public when `publication_status=public` |
|---|---|---|---|
| legal_name | YES | YES | YES (listed) |
| public_name | YES | YES | YES |
| summary | YES | YES | YES |
| description | — | YES | detail |
| founding_year | — | YES | YES |
| role_id (membership on create) | YES | — | membership not public as such |
| substantial/editorial/publication status | — | manager | publication gate |

CF/P.IVA as stored business tax IDs in forms: **NOT FOUND**.

---

## 6. Professionals

DB columns include `professional_phone`, `professional_email` — **CONFIRMED** in migrations.
**NOT FOUND** in any `src` public/authenticated select. Create UI **NOT FOUND**.

---

## 7. Organizations (editorial)

Entered: name, slug, description, summary, scopes, website_url, email, phone, officials (role, person, display_label, email, phone).
**Public select:** name, slug, type, scope, summary, seat labels, description, officials **name only** — phone/email **not** in public select — **CONFIRMED**.

---

## 8. Editorial UGC (redattore)

Contents (title, slug, body, abstract, …), Observatory indicators/sources/values, Org as above. Publish/withdraw workflows **CONFIRMED**.

---

## 9. Domains without create UI (public read if published)

Opportunities, Collaborations, Services, Events, Markets, Professionals — schemas + public gates exist; **app create forms NOT FOUND**. Future ingestion/user create would expand inventory.

---

## 10. Public vs private matrix (high level)

| DATA | Private default? | Can be public? | Public route | User control? | RLS control? |
|---|---|---|---|---|---|
| Auth email | YES | NO (app) | — | change via Auth (no UI found) | Auth |
| Persona professional phone/email | YES until share opt-in | Network-only if share | `/persone/[slug]` CTA | YES share checkboxes | Separate table + RPC |
| Persona bio/name/geo/website | YES until `is_public` | YES | `/persone/[slug]` | YES `is_public` | YES |
| Impresa unpublished | YES | YES if manager publishes | `/imprese/[id]` | Manager | YES |
| Opportunity etc. | Until published+public visibility | YES | domain routes | No self-serve UI today | YES |
| Observatory values | Until indicator published | YES aggregated | `/osservatorio/[slug]` | Redattore | YES |
| Org email/phone | Editorial | Not in public UI select | — | Redattore | Check RLS columns — UI excludes |

---

## 11. Free-text (third-party data risk)

bio, business description/summary, content body, org description, opportunity/collaboration/service/event texts (when created), observatory methodology notes.
Users/editors may paste third-party personal data — Content/Terms topic for L1.2.

---

## 12. Sensitive-data-capable fields (technical only)

| Field type | Present? | Note |
|---|---|---|
| Explicit race/religion/politics/health/sexual orientation/biometric/union | **NOT FOUND** as dedicated fields | — |
| Country / immigration-related context | country, platform theme, culture filters | **NOT** auto-classified as special category here — **LEGAL REVIEW** |
| Free-text may contain anything | YES | Content policy |

---

## 13. Minors

| Item | Status |
|---|---|
| Date of birth field | **NOT FOUND** |
| Minimum age declaration | **NOT FOUND** |
| Minor workflow | **NOT FOUND** |
| Decision | **USER DECISION REQUIRED** for Terms |

---

## 14. System-generated

account id, auth uid, persona id (=uid for ordinary), slugs, timestamps, statuses, role assignments, membership, publication/revision state, selected business cookie, observatory supersedes — mostly internal; some statuses user-facing in workspace.

---

## 15. Uploads

File upload / Supabase Storage usage in app: **NOT FOUND**.
`avatar_url` / media as URL references only — **CONFIRMED** pattern in docs/migrations.

---

## 16. Retention (technical state)

| Class | Technical retention behaviour |
|---|---|
| Auth account | No app self-delete; admin close ≠ delete Auth |
| Persona soft-delete `deleted_at` | Column exists; owner grant/UI **NOT FOUND** for soft-delete |
| Account close | Sets `closed_at` / status `closed` — admin only |
| Published content withdrawn | Status change; rows retained |
| Backups / platform logs | **EXTERNAL CONTRACT REVIEW** |
| Explicit retention periods | **MISSING POLICY DECISION** |

---

*End personal data inventory*
