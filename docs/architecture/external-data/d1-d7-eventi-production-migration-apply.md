# D1-D.7 — Eventi Production migration apply

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-D.7  
**Data:** 2026-08-14  
**Mode:** accelerata controllata  
**Target:** Supabase Production `immigratiimprenditori` (`hvfvfatlaspcpszgizhg`, eu-west-3)  
**Baseline git (pre):** `c8d25cd` on `main` (ahead/behind `0/0`)  
**AUTO-PUBLISH:** **NO**  
**Import eventi:** **0**  
**Publish / scheduled eventi:** **0**  
**CDN/hosting deploy:** **0**  
**Allowlist HTTP calls:** **0**

---

## 1. Esito

**PASS** — one remote apply of the three D1-D.5 Eventi migrations (`20260820140000` → `20260820150000` → `20260820160000`) to Production. Local and remote migration history aligned (180/180). Second dry-run empty. Catalog, RLS, and privileges match the D1-D.5 plan. Event row counts unchanged (still zero). Contenuti and Mercati counts/timestamps unchanged.

**D1-D.8 (metadata/link-only import of max 16 review-only events):** **NO-GO** until a new explicit human GO.

---

## 2. Pre-flight Git

| Check | Result |
|---|---|
| Branch | `main` |
| HEAD | `c8d25cd42175b45602e9a6ca4b4ea3542bd3691e` |
| origin/main ahead/behind | `0/0` |
| JWT tracked scan (`git grep -l -E eyJ… HEAD`) | empty |
| Pre-existing dirt | preserved (`.gitignore`, legal docs, `artifacts/ingestion/`, untracked legal/application reports) — not staged |
| D1-D.4 last commit before Eventi E2E | `9132de9` |
| D1-D.5 Eventi E2E | `a002307` |
| D1-D.6 Eventi contract | `c8d25cd` |

---

## 3. Authorized migration set (deterministic)

Command: `git diff --diff-filter=A --name-only 9132de9..a002307 -- supabase/migrations`

| Order | Timestamp | File | SHA-256 (HEAD working tree) | git blob (`HEAD` = `a002307`) |
|---|---|---|---|---|
| 1 | `20260820140000` | `20260820140000_events_editorial_ownership.sql` | `e03372fa7dd31c89b5cc5528da6cef8d2ec0a22faf2f0fbf7a704cb30692b33f` | `0cd135a62b7326d00f30b595a1f06f3adee4a250` |
| 2 | `20260820150000` | `20260820150000_events_external_identity_provenance.sql` | `14b769e9963b4d64163af547259199cacb36737b8fce938414648de6b4ad874f` | `69736514929ec452d6b3a463b71426f291a229f9` |
| 3 | `20260820160000` | `20260820160000_prepare_events_external_ingestion_rls.sql` | `cea7524ec01af7b60079dfa05c823b634926d867b40982e49330dfa796fa649c` | `e7d1096e5bade2325afe48be3ab27825230238e9` |

Byte-identity: `git hash-object` at HEAD equals blob at `a002307` for all three files. `git diff a002307 HEAD -- <those files>` empty. No later modification, removal, or replacement.

SQL inspection vs D1-D.5 plan:

- E5.1 additive `owned_by_editorial` + planned `DROP CONSTRAINT events_owner_xor_check` replaced by `events_ownership_ternary_check` (no table drop, no data rewrite).
- E5.2 additive identity/provenance columns, blank-guards, partial unique indexes. No seed/import.
- E5.3 editor SELECT/INSERT/UPDATE policies (`access_is_editor()` only), `service_role` SIU (REVOKE ALL then GRANT SELECT/INSERT/UPDATE — privilege reduction, not expansion), ownership immutability extended to `events.owned_by_editorial`.
- No `TRUNCATE`, no DML `DELETE`, no `DROP TABLE`, no unapproved privilege expansion.

---

## 4. Production identity

| Check | Result |
|---|---|
| CLI | `npx supabase` **2.114.0** (repo does not pin CLI; compatible with prior 2.109.x `db query --linked` / `db push --linked` workflow) |
| Linked ref (from `supabase/.temp/project-ref`, no tokens printed) | `hvfvfatlaspcpszgizhg` |
| Linked name | `immigratiimprenditori` |
| `npx supabase projects list` | that project `linked=true`, region `eu-west-3`, status `ACTIVE_HEALTHY`, Postgres 17.x |
| Authoritative Production (D1-B / D1-C / D1-D.3 / application v1 report) | same ref `hvfvfatlaspcpszgizhg` |
| `supabase link` this GO | **not run** |

No passwords, JWTs, or connection strings printed or written to the repo.

---

## 5. Migration history (pre)

Filesystem versions: **180**.

| Target | Mismatches | Head | D1-D.5 (`…140000`…`…160000`) |
|---|---|---|---|
| Local Docker (`migration list --local`) | **0** | `20260820160000` applied | local = remote (local DB) |
| Production (`migration list --linked`) | **exactly 3** | `20260820130000` applied | pending remote (empty `remote` column) |

Pending Production set/order: `20260820140000`, `20260820150000`, `20260820160000`. No extra pending versions. No history repair required.

---

## 6. Dry-run (pre-apply)

Command: `npx supabase db push --linked --dry-run --yes`

Sanitized stdout:

```
DRY RUN: migrations will *not* be pushed to the database.
Would push these migrations:
 • 20260820140000_events_editorial_ownership.sql
 • 20260820150000_events_external_identity_provenance.sql
 • 20260820160000_prepare_events_external_ingestion_rls.sql
{"upToDate":false,"dryRun":true,"migrations":[those three],"seeds":[],"roles":[]}
```

Automatic compare vs authorized set: **set, order, timestamps identical**. Seeds `[]`. Roles `[]`. Flags `--include-all` / `--include-seed` / `--include-roles` **not used**.

---

## 7. Counts and Eventi structures (pre-apply)

Read-only `supabase db query --linked` (no DML).

| Metric | Pre |
|---|---:|
| `events` | **0** |
| published / withdrawn | **0 / 0** |
| future editions on published | **0** |
| `event_editions` / sessions / organizers / speakers / languages / markets / registrations | **0** |
| `event_types` (seed) | **10** |
| `owned_by_editorial` column | **absent** |
| `external_source_code` column | **absent** |
| `schema_migrations` D1-D.5 versions | **[]** |
| `contents` | **18** (17 published public ready + 1 unpublished private draft) |
| `contents.max(updated_at)` | `2026-08-13T19:52:25.749664+00:00` |
| `international_markets` | **3** |
| `international_market_support_resources` | **15** (all `visibility_status=public`) |
| `imsr.max(updated_at)` | `2026-08-13T15:55:33.32995+00:00` |

Pre-existing Eventi: cycle-1 tables present; RLS on / FORCE off; `events_owner_xor_check` present; public SELECT = published+public; owner SIU policies present; `service_role` still had DELETE/TRUNCATE on Eventi tables (to be reduced on three tables by E5.3).

---

## 8. Apply (once)

Command: `npx supabase db push --linked --yes`  
Repeat on error: **not done**. Dashboard SQL Editor: **not used**. Reset/repair/`--include-all`: **not used**.

Sanitized stdout:

```
Applying migration 20260820140000_events_editorial_ownership.sql...
Applying migration 20260820150000_events_external_identity_provenance.sql...
Applying migration 20260820160000_prepare_events_external_ingestion_rls.sql...
{"upToDate":false,"dryRun":false,"migrations":[those three],"seeds":[],"roles":[],"message":"Finished supabase db push."}
```

Exit code: **0**.

---

## 9. Post-apply history and second dry-run

| Check | Result |
|---|---|
| `migration list --linked` | **180**, mismatches **0** |
| D1-D.5 local/remote | `20260820140000` / `20260820150000` / `20260820160000` all aligned |
| `schema_migrations` | those three versions present |
| `npx supabase db push --linked --dry-run --yes` | `{"upToDate":true,"migrations":[],"seeds":[],"roles":[]}` — **Remote database is up to date.** |

---

## 10. Catalog / RLS / privileges (post)

| Gate | Result |
|---|---|
| D1-D.5 columns on `events` | all 11 present (`owned_by_editorial` + 10 identity/provenance) |
| PK | `events_pkey` unchanged |
| FK | owner person/business, `type_code`, context opportunity/service unchanged |
| CHECK ternary | `events_ownership_ternary_check` present; `events_owner_xor_check` gone |
| Blank-guards | 8 CHECKs on provenance/notes columns |
| Indexes | `events_owned_by_editorial_idx` + 4 partial UNIQUE editorial dedupe indexes |
| RLS | enabled on all 9 Eventi tables; FORCE off |
| Public SELECT | still `publication_status='published' AND visibility_status='public'` |
| Owner policies | preserved (person/business) |
| Editorial policies | **12** new (`SELECT/INSERT/UPDATE` × `events`, `event_editions`, `event_organizers`, `event_languages`); all gated by `owned_by_editorial` + `access_is_editor()`; insert/update also `access_is_active_account()` where specified by E5.3 |
| Non-editor admin | no new admin policies; Redazione path is `access_is_editor()` only |
| DELETE policies on those four tables | **0** |
| `anon` write | **0** (SELECT only) |
| `authenticated` | SIU (unchanged vs pre; no extra GRANT) |
| `service_role` on `events` / `event_editions` / `event_languages` | **SELECT, INSERT, UPDATE only** (DELETE/TRUNCATE/REFERENCES/TRIGGER revoked) |
| `service_role` on other Eventi child tables | unchanged vs pre (out of E5.3 scope) |
| Ownership immutability | `access_reject_owner_cols_mutation()` definition includes `events` for `owned_by_editorial` |

Runtime RLS harness `scripts/external-data/d1d5-eventi-rls-runtime.sql` was **not** executed on Production (creates disposable users; out of this GO). Validation here is catalog/policy/grant inspection only.

---

## 11. Counts (post vs pre)

| Metric | Pre | Post |
|---|---:|---:|
| `events` | 0 | **0** |
| imported (`external_source_code` / `external_id` / `canonical_url` / `acquisition_fingerprint` not null) | n/a (columns absent) | **0** |
| `owned_by_editorial = true` | n/a | **0** |
| published / withdrawn / scheduled (future edition on published) | 0 / 0 / 0 | **0 / 0 / 0** |
| Eventi child instance tables | 0 | **0** |
| `event_types` | 10 | **10** |
| `contents` axes | 17 published + 1 review-only | **unchanged** |
| `contents.max(updated_at)` | `2026-08-13T19:52:25.749664+00:00` | **unchanged** |
| `international_markets` | 3 | **3** |
| `international_market_support_resources` | 15 public | **15 public** |
| `imsr.max(updated_at)` | `2026-08-13T15:55:33.32995+00:00` | **unchanged** |

Auto-publish: **0** (no importer run; no published events; application contract still `autoPublish=false`).

---

## 12. Confirmations (this GO)

- No event import  
- No event publish / withdraw / schedule  
- No auto-publish  
- No Next.js / CDN / hosting deploy  
- No HTTP calls to PIM / MLPS / Unioncamere / EMN allowlisted sources  
- No `supabase link` to a different project  
- No `db reset --linked`, `migration repair`, `--include-all`, `--include-seed`, Dashboard SQL Editor, force push  
- D1-D.5 / D1-D.6 sources, migrations, contract, and allowlist **not modified**

---

## 13. Git (this report)

| Check | Result |
|---|---|
| Report path | `docs/architecture/external-data/d1-d7-eventi-production-migration-apply.md` |
| Staged files | **only** this report |
| Suggested commit | `chore(events): record production migration apply` |

(Filled after commit/push in §15.)

---

## 14. Residual / next GO

Schema D1-D.5 is now in Production. Import remains **blocked** until a separate human GO.

| Step | Gate |
|---|---|
| D1-D.8 metadata/link-only import of max **16** review-only events (PIM, MLPS, Unioncamere Agenda, EMN/EC; ISMU excluded) | **NO-GO** without new explicit human GO |
| Editorial READY + publish of real events | **NO-GO** |
| Auto-publish / scheduler | **NO-GO** |
| CDN/hosting deploy | **NO-GO** (pre-existing separate) |

---

## 15. Closure

| Field | Value |
|---|---|
| Verdict | **PASS** |
| Initial commit | `c8d25cd42175b45602e9a6ca4b4ea3542bd3691e` |
| Applied migrations | three D1-D.5 files, hashes in §3 |
| Project ref | `hvfvfatlaspcpszgizhg` (no secrets) |
| Counts | events 0→0; imported 0; published/scheduled 0; Contenuti 18 unchanged; Mercati WB 15 unchanged |
| History | local/remote aligned; second dry-run empty |
| D1-D.8 | **NO-GO** until new human GO |

---

*Fine D1-D.7 Eventi Production migration apply*
