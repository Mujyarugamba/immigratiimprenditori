# P3 — Identity + Business Workspace Validation Report

**Date:** 2026-08-07
**Branch:** `main` (uncommitted P1–P3 application work; no commit/push in this close-out)
**DB head (local + remote):** `20260812300000` — pending **0**
**DB/RLS changes in P3 close-out:** **none**
**Decision:** P3 IDENTITY + BUSINESS WORKSPACE COMPLETATO — P4 PUBLIC/CORE DOMAINS AUTORIZZABILE

---

## 1. Scope implemented

| Area | Route / module | Status |
|---|---|---|
| Profilo self read/edit | `/app/profilo` + A4.2 whitelist | Done |
| Contested association UX | profilo + guards | Done |
| Imprese list CTX/ACT | `/app/imprese` | Done |
| Impresa detail + edit ACT | `/app/imprese/[id]` | Done |
| Create Impresa + self membership | form on list (INSERT ≠ grant) | Done |
| Business switcher (cookie UI) | `ii_selected_business_id` | Done |
| Memberships + grant/revoke RPC | detail panel | Done |
| Bootstrap grant Adm | `/app/amministrazione` | Done |
| Dashboard CTX/ACT counts | `/app` | Done |
| Nav Imprese operativa | `AppNav` | Done |

## 2. Access contracts respected

- Auth ≠ Account ≠ Persona (session + `access_current_person_id`)
- CTX = `access_has_active_business_membership` / active membership
- ACT = `access_can_act_for_business` (grant), never `role_id`
- Bootstrap only Adm UI / RPC `access_bootstrap_business_grant`
- Grant/revoke via `grant_business_management` / `revoke_business_management`
- No service-role for ordinary profile/business CRUD
- Switcher is UI state only (cookie), not authorization

## 3. Business create gap (by design)

Ordinary Acc+Per may INSERT `businesses` + self membership (CTX). First management grant remains Adm/Svc-only by design (Access B1). UI states this explicitly; no invented SQL.

### Application fix (no RLS change)

PostgREST `.insert().select()` / RETURNING failed after Impresa create: new row defaults to `publication_status = unpublished` and has no CTX membership yet, so SELECT policies deny the RETURNING projection even when INSERT WITH CHECK passes.

**Fix:** client-side UUID + insert without `.select()` / RETURNING in:

- `scripts/p3-local-smoke.mjs`
- `src/lib/data/authenticated/businesses.ts` (`createBusinessWithSelfMembership`)

No migration, policy, or GRANT changes.

## 4. Local smoke close-out (`npm run test:p3-smoke`)

**Result: `P3_SMOKE_PASS` + `P3_SMOKE_CLEANUP_DONE`** (fixtures left = 0).

Distinguished smoke fixes (script / app only):

| Topic | What happened | Resolution |
|---|---|---|
| **Bug email smoke** | GoTrue rejected `@example.test` / example domains (`email_address_invalid`) | Use syntactically accepted addresses (`*@gmail.com`) |
| **Rate-limit locale** | Public `/auth/v1/signup` hit `over_email_send_rate_limit` (`email_sent = 2`) | Create users via **Admin API** (`email_confirm: true`) |
| **Create Business RETURNING** | INSERT ok; `.select()` / RETURNING blocked by SELECT RLS on unpublished non-member row | **Client UUID** + insert **without** `.select()` / RETURNING |
| **Env target** | `.env.local` had pointed at remote URL / wrong service key shape | Realigned to local `127.0.0.1:54321` from `supabase status`; smoke loads status env and refuses non-local API URL |
| **Cleanup** | PostgREST `service_role` lacks table DML GRANTs (RPC-only by design) | Local owner cleanup via `docker exec … psql` on tracked UUIDs — **no** DB/RLS schema change |
| **DB/RLS** | — | **Nessuna modifica** a migrations, policies, or GRANTs in this close-out |

Flow validated: provision → link Person → active Account → create Impresa+membership (CTX yes / ACT no) → ordinary bootstrap denied → Adm/Svc bootstrap → ACT yes → edit → B isolation → revoke → ACT no.

## 5. Quality gates (final window)

| Gate | Result |
|---|---|
| `.env.local` → stack locale only | **OK** (`127.0.0.1:54321`) |
| `npm run test:p3-smoke` | **`P3_SMOKE_PASS`** / cleanup done / 0 leftovers |
| `npm test` | **37 pass / 0 fail** |
| `npm run typecheck` | **0** |
| `npm run lint` | **0** |
| `npm run build` | **0** (middleware→proxy deprecation warning only) |
| Fixture cleanup | **0** smoke users / businesses left |
| Migrations local/remote | Head **`20260812300000`**, pending **0** |
| DB/RLS edits | **None** |

## 6. Security

- No admin client in browser modules
- Mutations use session client + RLS/RPC
- Profile/business updates use column/field whitelists
- Self-grant mapped to clear AppError
- P3 smoke never targets remote Supabase when status URL is non-local

## 7. Residual P4+

- Public discovery / core domain surfaces
- Demo home fixtures
- Full Red/Adm consoles beyond bootstrap stub
- Optional later: dedicated create-Impresa RPC or SELECT policy for creator RETURNING (not required for P3; client UUID path is sufficient)

---

**P3 IDENTITY + BUSINESS WORKSPACE COMPLETATO — P4 PUBLIC/CORE DOMAINS AUTORIZZABILE**
