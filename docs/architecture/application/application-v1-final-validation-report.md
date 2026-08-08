# Application v1 — Final Validation Report

**Status:** REVIEW PASS — ready for versioning on `origin/main`
**Date:** 2026-08-08
**Baseline HEAD:** `4bf213b7f9391142cf30533ed261243a2b709250` (`v0.3.0-db-access-rls-v1`)
**DB head (local = remote):** `20260812300000`
**Pending migrations:** `0`
**Application migrations created P1–P6:** `0`

---

## 1. Decision

**APPLICATION V1 REVIEW PASS**

No blocking application/security defects after adversarial review.
Pre-release hygiene fix applied: untracked `supabase/.temp/` + gitignore; business switcher redirect routed through `safeRedirectPath`.

Tag target: `v0.4.0-application-v1`
Deploy production: **not performed** (separate task).

---

## 2. Product architecture (verified in code)

### Five ecosystems (mounted)
1. Persone
2. Imprese
3. Opportunità e collaborazioni
4. Mercati internazionali
5. Servizi per lavorare e crescere

Source of truth: `src/data/ecosystems.ts` → home (`Hero`, `EcosystemGrid`) + `src/data/navigation.ts` primaryNav.

### Transversal layers
Eventi, Contenuti/Notizie/Guide, Osservatorio, Organizzazioni (+ territori/lingue/settori as domain facets, not brand).

**Confirmed:** Osservatorio is **not** platform identity.

---

## 3. Security / access (adversarial)

| Invariant | Verdict |
|---|---|
| Auth ≠ Account ≠ Persona | PASS |
| Service-role browser exposure | PASS (0) — admin client only `admin.ts` + provision Account |
| Public SELECT via session/anon only | PASS |
| CTX ≠ ACT | PASS — switcher is UI preference; ACT from grant/RPC |
| Adm ≠ Red | PASS — separate guards/nav/actions; no `isEditor \|\| isAdmin` |
| No `auth.uid() = profiles.id` app decision debt | PASS (no such app pattern; person link uses documented invariant) |
| Self-elevate blocked | PASS (UI + RPC + tests) |
| Secrets in VCS | PASS — `.env.local` ignored; no JWT/service literals |

---

## 4. Domains delivered

| Block | Scope |
|---|---|
| P2 | Auth, session, `/app` foundation |
| P3 | Persona + Business CTX/ACT workspace |
| P4 | Public core domains |
| P4.5 | Ecosystem IA |
| P5 | Redazione + Amministrazione |
| P6 | E2E, hardening, proxy, SEO base, legacy cleanup |

---

## 5. Test gates (re-run at final review)

| Gate | Result |
|---|---|
| `npm test` | **93 pass / 0 fail** |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 (`ƒ Proxy`) |
| `npm run test:p3-smoke` | PASS + cleanup |
| `npm run test:p4-smoke` | PASS + cleanup |
| `npm run test:p5-smoke` | PASS + cleanup |
| Playwright chromium | **27 pass / 0 fail** |
| Playwright mobile viewport | **17 pass / 0 fail** |
| **E2E total** | **44 pass / 0 fail** |

---

## 6. Pre-release fixes in this closure

1. Removed tracked `supabase/.temp/*` from index; ignore `supabase/.temp/`.
2. `selectBusinessAction` uses `safeRedirectPath` (consistent with auth).

---

## 7. Limits / post-v1 backlog (non-blocking)

- Last-admin / last-manager DB protection
- Org membership; collaboration matching
- Advanced audit/analytics/observability
- Storage/dataset/ETL
- Training quarantine Access
- Full visual redesign / WCAG certification
- Cross-browser WebKit/Firefox E2E matrix
- Production deploy (separate)

---

## 8. Reports chain

- `p2-application-foundation-validation-report.md`
- `p3-identity-business-workspace-validation-report.md`
- `p4-public-core-domains-validation-report.md`
- `p4.5-ecosystem-ux-information-architecture-validation-report.md`
- `p5-editorial-admin-validation-report.md`
- `p6-e2e-hardening-release-validation-report.md`
- This document

---

## 9. Release readiness

| Item | Status |
|---|---|
| Commit review | Authorized |
| Tag `v0.4.0-application-v1` | Authorized after commit |
| Deploy production | **Not authorized here** — separate task after env provisioning |
