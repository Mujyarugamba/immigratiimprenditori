# D1-D.5 — Eventi end-to-end enablement (block determination)

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.5  
**Data:** 2026-08-13  
**Mode:** accelerata (joint Logical/Physical/Plan → sequential implementation → one adversarial review → local apply → commit + FF push)  
**Baseline git (pre):** `9132de9` on `main` (ahead/behind `0/0`)  
**AUTO-PUBLISH:** **NO**  
**Real event import / publish / remote apply / deploy:** **FORBIDDEN in this GO**

---

## 1. Esito determination

**CASE A+** — Aggregate Root `events` already exists (cycle 1 M1–M5 + access RLS).  
Enablement requires **additive** schema (ternary editorial ownership + external identity/provenance columns + editorial RLS), app Redazione route, public route polish, and a typed acquisition contract **without** importing real events.

Cultura remains a **transversal hub** (`type_code = cultural` filter / `/cultura` link only). **No Cultura AR.**

---

## 2. Real state found (pre-change)

| Area | State |
|---|---|
| Logical / Physical / Migration Plan | Closed for cycle 1 schema; **not** population-ready (no Redazione ownership, no external id) |
| Tables | `event_types`, `events`, `event_editions`, `event_sessions`, `event_organizers`, `event_speakers`, `event_languages`, `event_markets`, `event_registrations` |
| Ownership CHECK | Binary XOR Persona\|Impresa — **blocks** Redazione |
| Access RLS | Public published+public; owner person/business; **no** `access_is_editor()` path |
| Redazione UI | **Absent** (`/app/redazione/eventi`) |
| Public routes | `/eventi`, `/eventi/[id]` present; RLS-gated; incomplete venue/tz/link/organizer |
| External-data lib | **Absent** for Eventi |
| Contenuti / Mercati | CLOSED; patterns to reuse: `owned_by_editorial`, `access_is_editor`, review-before-publish |

---

## 3. Units determined (close together)

| # | Unit | Kind |
|---|---|---|
| U1 | Logical addendum: ternary ownership + acquisition representation; Cultura non-AR | Docs |
| U2 | Physical addendum: columns, indexes, RLS, privileges | Docs |
| U3 | Migration Plan addendum: timestamps after `20260820130000` | Docs |
| U4 | `events` editorial ownership ternary (`owned_by_editorial`) | SQL |
| U5 | External identity + provenance columns + dedupe indexes | SQL |
| U6 | Editorial RLS + service_role least-privilege writer prep + ownership immutability | SQL |
| U7 | Typed acquisition contract (normalize/dedupe/refresh plan; empty allowlist) | App |
| U8 | Editorial data layer + server actions (READY / publish / withdraw) | App |
| U9 | Redazione `/app/redazione/eventi` list + detail | App |
| U10 | Public `/eventi` + detail polish (tz/venue/online/organizer/official link; no provenance) | App |
| U11 | Automated tests (unit + contract + RLS harness local) | Tests |
| U12 | Validation report + roadmap update | Docs |

**One migration file per SQL unit (U4–U6).** No destructive SQL. Local apply only.

---

## 4. External identity model (authoritative for future pilot)

Stored on AR `events` (not body trailer):

| Field | Column |
|---|---|
| Source code | `external_source_code` |
| External id | `external_id` |
| Source URL | `source_url` |
| Canonical URL | `canonical_url` |
| Natural key | `external_natural_key` |
| Fingerprint | `acquisition_fingerprint` |
| Acquired at | `acquired_at` |
| Source updated at | `source_updated_at` |
| Attribution | `source_label` (+ `external_organization_label` organizer) |
| Internal notes | `editorial_internal_notes` (**never** public SELECT) |

Occurrence data (start/end/tz/venue/online/territory) lives on `event_editions` as already modeled.

**Dedupe precedence:** (1) source + external_id → (2) canonical_url → (3) fingerprint.  
**Refresh preserves:** editorial_status, publication_status, visibility_status, withdrawn_at, redazione-edited title/summary, type_code.

**Allowlist / real sources:** deferred to a **separate human GO** (this GO ships empty allowlist + contract only).

---

## 5. Editorial workflow

Reuse existing axes: `editorial_status` draft\|ready · `publication_status` unpublished\|published\|withdrawn · `visibility_status` private\|public.

- Acquisition (future) enters `owned_by_editorial=true`, draft, unpublished, private.
- No auto-publish.
- Editor sets READY (`editorial_status=ready`) then explicit Pubblica.
- Withdraw sets `withdrawn` + `withdrawn_at`.
- Non-editor admin does **not** get Redazione powers via RLS (`access_is_editor()` only).
- Browser routes use user JWT; service_role limited to authorized technical ops (importer later).

---

## 6. Stop line

This GO ends when Eventi is **technically population-ready** locally + committed/pushed.  
Subsequent steps each need separate GO: source contract+allowlist · metadata import · editorial publish of real events · remote apply · CDN deploy.
