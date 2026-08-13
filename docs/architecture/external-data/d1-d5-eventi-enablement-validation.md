# D1-D.5 — Eventi end-to-end enablement validation

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.5  
**Data:** 2026-08-13  
**Mode:** accelerata  
**Baseline git (pre):** `9132de9` on `main` (ahead/behind `0/0`)  
**Esito:** **PASS**

---

## 1. Esito

**PASS** — Eventi is technically population-ready: ternary editorial ownership, external identity/provenance columns + dedupe indexes, editorial RLS (`access_is_editor` only), Redazione `/app/redazione/eventi`, public `/eventi` polish, typed acquisition contract with **empty** allowlist, local migrations applied, runtime RLS harness PASS (ROLLBACK), lint/typecheck/tests/build green.

**AUTO-PUBLISH:** NO  
**Real event imports:** 0  
**Real event publishes:** 0  
**Remote apply:** 0  
**CDN/hosting deploy:** 0

---

## 2. Initial Git

| Check | Result |
|---|---|
| Branch | `main` |
| HEAD | `9132de9` |
| origin ahead/behind | `0/0` |
| JWT tracked scan | empty (no credential JWTs) |
| Pre-existing dirt | preserved |

---

## 3. Units closed

U1–U3 docs · U4 ownership SQL · U5 identity SQL · U6 editorial RLS SQL · U7 acquisition contract · U8 editorial data/actions · U9 redazione UI · U10 public route · U11 tests · U12 this report + roadmap.

---

## 4. Migrations (local apply only)

| Timestamp | File |
|---|---|
| `20260820140000` | `events_editorial_ownership.sql` |
| `20260820150000` | `events_external_identity_provenance.sql` |
| `20260820160000` | `prepare_events_external_ingestion_rls.sql` |

Applied via `supabase migration up --local`. Remote apply deferred.

---

## 5. External identity + dedupe

Columns on `events`: `external_source_code`, `external_id`, `source_url`, `canonical_url`, `external_natural_key`, `acquisition_fingerprint`, `acquired_at`, `source_updated_at`, `source_label`, `editorial_internal_notes`.

Precedence: source+external_id → canonical_url → fingerprint.  
Refresh plan preserves editorial/publication/visibility and human-edited title/summary.  
Allowlist **empty** (sources GO separate).

---

## 6. Editorial workflow + RLS matrix

Axes: draft\|ready · unpublished\|published\|withdrawn · private\|public.  
Acquisition (future) enters review-only; publish requires READY + ≥1 edition.

| Actor | Review-only | Published | Publish power |
|---|---|---|---|
| anon | no | yes | no |
| ordinary auth | no | yes | no |
| editor (`redattore`) | yes | yes | yes |
| non-editor admin | no | yes | no |
| service_role | BYPASSRLS; SIU SELECT/INSERT/UPDATE; no DELETE | — | technical only |

Harness: `scripts/external-data/d1d5-eventi-rls-runtime.sql` → **PASS** + ROLLBACK.

---

## 7. Routes

- Redazione: `/app/redazione/eventi`, `/app/redazione/eventi/[id]` (list/filters/detail/provenance/READY/publish/withdraw)
- Public: `/eventi`, `/eventi/[id]` — dates/tz/venue|online/organizer/official link; no provenance/internal notes; cancelled editions filtered; Cultura link for `type_code=cultural` only (no Cultura AR)

---

## 8. Tests

| Command | Exit | Outcome |
|---|---:|---|
| `npm run lint` | 0 | 1 pre-existing warning unrelated |
| `npm run typecheck` | 0 | PASS |
| `npm test` | 0 | 265 pass / 0 fail (incl. events acquisition) |
| `npm run build` | 0 | includes redazione/eventi routes |
| local migration up | 0 | 3 migrations applied |
| d1d5 RLS SQL harness | 0 | PASS + ROLLBACK |

---

## 9. Unique adversarial review (whole block)

| Topic | Verdict |
|---|---|
| Logical/Physical/Plan coherence | PASS — additive addenda; AR still `events` |
| Eventi/Cultura/Contenuti/Opportunità/Org boundaries | PASS — no Cultura AR; no mini-CMS; Contenuti/Mercati untouched |
| External identity / provenance | PASS — columns + indexes; empty allowlist |
| PK/FK/CHECK/indexes | PASS — ternary ownership; blank-guards; partial uniques |
| Dedupe / refresh | PASS — contract tests |
| RLS / privileges | PASS — matrix harness |
| Editorial workflow | PASS — no auto-publish |
| Redazione + public UI | PASS — build routes present |
| Security / secrets | PASS — no JWT in tracked files; no service keys in client |
| Regressions | PASS — culture hub selects updated; tests green |

**Review outcome:** ACCEPT — no blockers for enablement close. Residual: real sources/import/publish/remote apply/deploy need separate GOs.

---

## 10. GO/NO-GO for subsequent Eventi pilot steps

| Step | Gate |
|---|---|
| Source contract + allowlist | **NO-GO** without human GO |
| Metadata/link-only import | **NO-GO** without human GO |
| Editorial review + publish of real events | **NO-GO** without human GO |
| Remote apply of E5.1–E5.3 | **NO-GO** without human GO |
| CDN/hosting deploy | **NO-GO** (separate) |
