# C3 — Cultural Taxonomy Enrichment Validation Report

**Status:** ACCEPTED  
**Date:** 2026-08-09  
**Decision:** Hybrid C (scope via domain catalogs; disciplines deferred)  
**Units:** C3.1–C3.6 applied local + remote  
**C3.7:** DEFERRED (no `cultural_disciplines`)  
**Parent Git:** `ed7d80ed786021f2c167ef75504c81acf6a4f44b`  
**CLI:** supabase 2.113.0  

---

## 1. Baseline (pre-apply)

| Voce | Valore |
|---|---|
| Branch | `main` = `origin/main` |
| HEAD | `ed7d80e` (C2 Cultura) |
| DB head | `20260812300000` local = remote · pending 0 |
| Dirt preesistente (non C3) | `.gitignore`, `application-v1-deployment-report.md` — non staged |

---

## 2. Architecture certified

- Cultura ≠ BC ≠ Aggregate Root  
- Inclusione futura `/cultura` V2 = **scope/classificazione di dominio**  
- Scope ≠ disciplina  
- C3.7 discipline condivise **rinviate**  
- Nessun CulturalPerson/Org/Business/Event/Opp/…  
- Nessun backfill euristico  
- Nessun flag generico `is_cultural`  

---

## 3. Migration block

| Unit | Timestamp / file | Class |
|---|---|---|
| C3.1 | `20260813100000_seed_cultural_organization_activity_scopes.sql` | M1 seed |
| C3.2 | `20260813110000_extend_professional_cultural_creative_categories.sql` | CHECK + M1 |
| C3.3 | `20260813120000_seed_creative_cultural_business_sectors.sql` | M1 seed |
| C3.4 | `20260813130000_seed_cultural_content_service_categories.sql` | M1 seed |
| C3.5 | `20260813140000_create_opportunity_activity_scopes.sql` | M1+M2+RLS |
| C3.6 | `20260813150000_add_collaboration_activity_scope.sql` | M1+M2 |

### SHA-256 (migrations)

| File | SHA-256 |
|---|---|
| C3.1 | `7DB21E482E80124C327274F1AFFEC95DFEB0C386E84106B6AD6560764EBF7610` |
| C3.2 | `78391EA8AB9BB6256B92EB9C5541BD815699EEEB16E1DB46691AFADE0C06A3A4` |
| C3.3 | `8B2F28A394695588A162C8773A8F2EDC5EE59F2A9121B29A21F29B621545BE9B` |
| C3.4 | `A7D6DCFC4FAC1B94632FD9948F6CE6C7563D03298C845FE7CD0A4A49EC77F380` |
| C3.5 | `B2E9ABB8C5556B0096EF67683B68262D4B9C16D670CD4F9B1B02C10B4B71A558` |
| C3.6 | `08E14EC2535861C9AF960A26ACA4745F7BFB99CACB6FB00C38C0B1459AD497D6` |

---

## 4. Seeds / schema delivered

### C3.1 Org scopes
`culture`, `heritage`, `creative_industries` → `organization_activity_scopes`

### C3.2 Professionisti
CHECK `group_code` + `cultural_creative`. Categories: `performing_artist`, `visual_artist`, `musician`, `audiovisual_professional`, `writer_editorial_professional`, `designer_creative`, `cultural_producer`.  
`cultural_mediation` invariata (`linguistic_intercultural`). Total categories: 40.

### C3.3 Business CCI
`audiovisual`, `publishing`, `music_industry`, `live_performance`, `design_creative`, `fashion`, `artistic_crafts`, `cultural_heritage_services`

### C3.4
- `content_categories.culture`  
- `service_categories.cultural_creative` (`linguistic` distinct)

### C3.5
- Catalog `opportunity_activity_scopes` (3)  
- Bridge `opportunity_activity_scope_assignments` PK `(opportunity_id, scope_code)` CASCADE/RESTRICT  
- RLS: 4 policies mirroring `opportunity_type_assignments` + catalog public SELECT  

### C3.6
- Catalog `collaboration_activity_scopes` (3)  
- Nullable `collaborations.activity_scope_code` FK  
- No AR policy change; no backfill; `form_code` untouched  

---

## 5. Reviews

| Review | Esito |
|---|---|
| Wave 1 static (C3.1–C3.4) | PASS |
| Wave 2 static (C3.5–C3.6) | PASS |
| Cumulative Hybrid C / no C3.7 | PASS |

---

## 6. Apply

| Gate | Esito |
|---|---|
| Local `migration up --local` | PASS — 6/6 |
| Local head | `20260813150000` |
| Dry-run `db push --linked --dry-run` | PASS — sole C3.1–C3.6 |
| Remote `db push --linked` | PASS — 6/6 |
| Remote head | `20260813150000` |
| Pending | 0 |
| Local/remote parity | PASS |

---

## 7. Runtime (local, BEGIN/ROLLBACK)

PASS:

- Catalog counts / CHECK / legacy intact  
- C3.5 unique + invalid FK denied  
- C3.6 null → assign culture; `form_code` intact  
- Anon catalog SELECT; public assignment visible; private not leaked; anon insert denied (42501)  
- Policy counts 4 + 1 + 1  
- No org backfill; C3.7 absent  
- Cleanup: ROLLBACK  

**Observation (non-blocking, pre-existing Access/RLS v1):** authenticated party SELECT/INSERT on `opportunity_type_assignments` already hits infinite recursion via `opportunities` ↔ `opportunity_party_references`. C3.5 mirrors that pattern intentionally. Not a C3 regression; remediation belongs to Access, not Cultura.

---

## 8. App gates

| Gate | Esito |
|---|---|
| `npm test` | 105/105 |
| C2 culture unit tests | PASS (event-anchored V1 unchanged) |
| `npm run typecheck` | 0 |
| `npm run lint` | 0 |
| `npm run build` | 0 — `/cultura` present |
| C4 rewire | **NOT done** (boundary) |
| Types regen | Not required (build green) |

P4/P5 smoke: not re-run; C3.5 RLS mirrors existing Opportunity assignment policies; no Access helper/authority change; training quarantine untouched.

---

## 9. Remote validation (non-destructive)

| Check | Remote |
|---|---|
| org_scopes | 3 |
| prof cultural_creative | 7 |
| mediation intact | 1 |
| CCI sectors | 8 |
| content culture | 1 |
| service cultural_creative | 1 |
| opp scopes | 3 |
| collab scopes | 3 |
| collab column | 1 |
| C3.7 absent | true |
| opp assignment policies | 4 |

---

## 10. Docs updated (targeted addenda)

Physical + Migration Plan addenda for Organizzazioni, Professionisti, Imprese, Opportunità, Collaborazioni, Servizi, Contenuti; Reconciliation §15bis; Dependency Map note; C3 plan status → approved/implementable.

---

## 11. Limits / backlog

- C3.7 shared disciplines deferred  
- `/cultura` V2 rewire = **C4**  
- Access recursion on Opportunity assignment party policies (pre-existing)  
- No automatic classification of existing AR rows  

---

## 12. Readiness C4

**C4 CULTURA V2 AUTORIZZABILE** — schema/catalog scope ready for multi-domain inclusion predicates without Event-only dependency.

---

## 13. Decision

**C3.1–C3.6 CULTURAL TAXONOMY ENRICHMENT COMPLETATO — HYBRID C APPLICATO LOCALE/REMOTO — C3.7 RINVIATA — C4 CULTURA V2 AUTORIZZABILE**
