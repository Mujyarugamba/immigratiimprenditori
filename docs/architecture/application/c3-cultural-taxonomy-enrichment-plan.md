# C3 — Cultural Taxonomy Enrichment Plan

**Status:** APPROVED DESIGN — C3.1–C3.6 implementation authorized; **C3.7 deferred**  
**Date:** 2026-08-09  
**Baseline Git (pre-C3 SQL):** Application v1 `5c1451e` · C2 Cultura `ed7d80e`  
**DB head (pre-C3 SQL):** `20260812300000` local = remote · pending `0`  
**Prior decisions:** C0-B · C1-A · C2 hub event-anchored · Hybrid C  
**Implementation units:** `20260813100000`…`20260813150000` (C3.1–C3.6); no `cultural_disciplines`  

---

## 1. Purpose

Define the **minimum taxonomy enrichment** so `/cultura` can evolve from an Event-only structural anchor to a multi-domain transversal hub, without:

- a Cultura bounded context;
- duplicate Aggregate Roots;
- keyword/title heuristics;
- encyclopedic museology;
- funder-/Talentive-specific fields.

This document is a **proposal**. It does not amend authoritative Logical/Physical/Migration Plans until a C3.x migration block is approved and implemented.

---

## 2. Problem (post-C2)

| What works today | Gap |
|---|---|
| `events.type_code = cultural` | Strong P0 anchor |
| Propagation via event links (opp context, content links, markets) | Opp/Content cultural **without** Event impossible |
| `professional_categories.cultural_mediation` | Too narrow for creatives/operators |
| Org `organization_activity_scopes` | **Structure exists, seed = 0** |
| Business sectors | No CCI / creative industry seeds |
| Content categories | No `culture` |
| Service categories | `linguistic` ≠ culture (correctly unused) |
| Collaborations | Only `form_code`; no activity scope |

---

## 3. Governing principle: Scope ≠ Discipline

| Question | Meaning | Mechanism |
|---|---|---|
| **A. Scope** | Does this record operate in the cultural field of the network? | Domain-native catalogs / light scope assignments |
| **B. Discipline** | In which cultural discipline (music, theatre, …)? | Optional shared `cultural_disciplines` (detail, not inclusion gate) |

**Inclusion in `/cultura` V2 must be answerable by A alone.**  
B refines filters and storytelling; it must not be required for hub membership.

---

## 4. Taxonomy architecture decision

### Alternatives

| Option | Summary | Verdict |
|---|---|---|
| **A** Independent domain catalogs only | Extend each catalog in isolation; no shared discipline model | Insufficient for Opp/Collab scope; discipline duplicated badly |
| **B** Only shared `cultural_disciplines` | Every domain links to disciplines; presence ⇒ cultural | Overloads discipline as scope; false negatives for “culture” without discipline pick |
| **C Hybrid (chosen)** | Scope via domain catalogs (+ minimal Opp/Collab scope wiring); optional shared disciplines for detail | Best fit to existing schema and C0-B |

### Chosen: **C — Hybrid**

1. **Scope (A):** reuse/extend existing domain catalogs; add **minimal** assignment/column only where no scope field exists (Opportunità, Collaborazioni).
2. **Discipline (B):** introduce shared `cultural_disciplines` as **optional** enrichment (not the inclusion predicate).
3. Cultura remains a **consumer** of classifications owned by other domains — never owner of Person/Org/Business facts.

---

## 5. Inventory (real state)

### 5.1 Professionisti

| Item | Reality |
|---|---|
| Catalog | `professional_categories` (33 seeds) |
| Link | `professional_profile_categories` |
| Cultural today | **`cultural_mediation` only** |
| Practice modes | Exercise mode, not domain |
| Assessment | `cultural_mediation` is correct but **too specific** as sole Cultura gate |

### 5.2 Organizzazioni

| Item | Reality |
|---|---|
| Type | `organization_types` (association, foundation, ngo, …) — **juridical/organisational, not cultural** |
| Scope | `organization_activity_scopes` + `organizations.primary_scope_code` — **seed empty** |
| Assessment | Type must never imply culture; **seed scopes** is the designed hook |

### 5.3 Imprese

| Item | Reality |
|---|---|
| Catalog | `business_sectors` (construction, logistics, commerce, …) |
| Link | `business_sector_declarations` |
| CCI | **Absent** |
| Assessment | Extend sectors (economic), do not invent parallel “cultural business type” |

### 5.4 Eventi

| Item | Reality |
|---|---|
| Type | `event_types` includes **`cultural`** |
| Assessment | Keep `cultural` as **scope-like type**; do **not** explode types into concert/theatre/… |

### 5.5 Opportunità

| Item | Reality |
|---|---|
| Types | `opportunity_types` + `opportunity_type_assignments` (call, incentive, …) — **nature of opportunity, not cultural field** |
| Cultural today | Only via `events.context_opportunity_id` |
| Assessment | Need **scope independent of Event** |

### 5.6 Collaborazioni

| Item | Reality |
|---|---|
| Form | `form_code` enum (ricerca/offerta/partnership/progetto/…) |
| Context | `context_area_text` descriptive only |
| Assessment | Form ≠ cultural scope; need light scope field |

### 5.7 Servizi

| Item | Reality |
|---|---|
| Categories | linguistic, training, professional_generic, financial, real_estate, support_other |
| Assessment | Add **`cultural_creative`**; never use `linguistic` as culture |

### 5.8 Contenuti

| Item | Reality |
|---|---|
| Types | news, guide, insight, … |
| Categories | internationalization, entrepreneurship, … `events_community`, stories |
| Cultural today | Only via `content_event_links` → cultural event |
| Assessment | Seed category **`culture`**; event link remains relational bonus |

### 5.9 Persone

No cultural fields. Cultura emerges via Professionista and relations. **No `profiles` cultural column.**

---

## 6. Discipline model (optional detail)

### 6.1 Shared catalog (proposed)

`public.cultural_disciplines` — shared controlled list (foundation-style C03), **not** a Cultura AR.

Proposed **inclusion set** (stable, non-encyclopedic):

| code | label_it | Notes |
|---|---|---|
| `music` | Musica | |
| `theatre` | Teatro | |
| `dance` | Danza | |
| `cinema_audiovisual` | Cinema / audiovisivo | |
| `visual_arts` | Arti visive | Includes contemporary visual practice |
| `photography` | Fotografia | Kept distinct (high use) |
| `literature_publishing` | Letteratura / editoria | |
| `design` | Design | |
| `architecture` | Architettura | Overlaps Professionisti category; OK as discipline facet |
| `fashion` | Moda | |
| `artistic_crafts` | Artigianato artistico | |
| `cultural_heritage` | Patrimonio culturale | |
| `museums_exhibition` | Musei / mostre | Accorpates “museums” |
| `performing_arts` | Performing arts (altro) | Residual live performance not covered above |
| `digital_multimedia` | Cultura digitale / multimedia | |
| `interdisciplinary` | Interdisciplinare | Explicit escape |

### 6.2 Rejected / merged

| Candidate | Decision |
|---|---|
| Separate `museums` + `exhibition` | Merge → `museums_exhibition` |
| Fine-grained instruments/genres | Rejected (encyclopedic) |
| `performing_arts` as umbrella replacing theatre/dance/music | Rejected as sole code; kept residual |
| Funder/programme codes | Rejected |

### 6.3 Linking (optional, after scope)

Prefer **owned link tables** per domain (no polymorphic `entity_type`/`entity_id`):

- `event_cultural_disciplines`
- `content_cultural_disciplines`
- Later (if needed): professional / org / business / opportunity / collaboration / service

**Discipline links never alone grant Cultura inclusion** in V2 (except if product later decides otherwise — not now).

---

## 7. Per-domain solutions

### 7.1 Professionisti — M1 + constraint extension

**Constraint fact:** `professional_categories.group_code` is a **closed CHECK** (10 groups). Pure INSERT of a new group is impossible without altering that check.

**Chosen path:** extend CHECK with one new group `cultural_creative`, then seed a **small** category set. Classify as **M1 + light structural** (not M4): vocabulary extension of an existing catalog, no new AR/table.

| code | label_it | group_code | Notes |
|---|---|---|---|
| `cultural_mediation` | Mediazione culturale | `linguistic_intercultural` | **Keep as-is** (existing; do not move) |
| `performing_arts_practice` | Pratiche performative | `cultural_creative` | New |
| `music_practice` | Pratiche musicali | `cultural_creative` | New |
| `visual_arts_practice` | Pratiche di arti visive | `cultural_creative` | New |
| `literary_practice` | Pratiche letterarie | `cultural_creative` | New |
| `cultural_curation` | Curatela / programmazione culturale | `cultural_creative` | New |
| `cultural_production` | Produzione / organizzazione culturale | `cultural_creative` | New |
| `cultural_technical` | Tecnici dello spettacolo / produzione | `cultural_creative` | New |

**Not** one row per job title (attore, regista, …): those remain specialization/text, not catalog rows.

**Do not** treat existing `architecture` / `communication` / `marketing` as Cultura by default (economic/professional practice ≠ cultural scope).

**Cultura inclusion:** category code ∈ allow-list  
`{cultural_mediation} ∪ {codes with group_code = cultural_creative}`.

### 7.2 Organizzazioni — M1

Seed `organization_activity_scopes` (catalog already exists; columns `code`, `name_it`, …):

| code | name_it |
|---|---|
| `culture` | Cultura |
| `heritage` | Patrimonio culturale |
| `creative_industries` | Industrie culturali e creative |

Also seed a few **non-cultural** scopes if needed for catalog usability in Red UI later (optional, not required for Cultura): e.g. `education`, `social`, `international_cooperation` — **deferred** unless Red cannot operate without them.

**Cultura inclusion:** `primary_scope_code ∈ {culture, heritage, creative_industries}`.

### 7.3 Imprese — M1

Seed CCI-oriented `business_sectors` (economic sectors, not disciplines):

| slug | name |
|---|---|
| `audiovisual_production` | Produzione audiovisiva |
| `publishing` | Editoria |
| `music_industry` | Industria musicale |
| `live_performance` | Spettacolo dal vivo |
| `design_services` | Design |
| `fashion` | Moda |
| `artistic_crafts` | Artigianato artistico / creativo |
| `cultural_services` | Servizi culturali |

**Cultura inclusion:** business has declaration on any of these sectors (public rules unchanged).

### 7.4 Eventi — M0 (+ optional discipline M3/M2 later)

- Keep `type_code = cultural` as scope.
- Do **not** replace with `concert`/`theatre` types.
- Optional later: link to `cultural_disciplines`.

### 7.5 Opportunità — M1+M2 (critical for leaving Event-only)

Opportunity **types** stay nature-based (`call`, `incentive`, …).

Add:

1. Catalog `public.opportunity_activity_scopes` (C03, owned by Opportunità; parallel to Org scopes; **small**, culture-first seeds may include neutrals later).
2. Table `public.opportunity_activity_scope_assignments` (opportunity_id, scope_code) mirroring `opportunity_type_assignments`.

Initial seeds:

| code | label_it |
|---|---|
| `culture` | Cultura |
| `heritage` | Patrimonio |
| `creative_industries` | Industrie creative |

**Cultura inclusion (V2):**  
has scope assignment in cultural set **OR** (legacy/relational) linked from cultural event via `context_opportunity_id`.

### 7.6 Collaborazioni — M2

Add nullable `activity_scope_code` on `collaborations`  
FK → `opportunity_activity_scopes` **or** dedicated `collaboration_activity_scopes` with identical culture seeds.

**Recommendation:** FK to `opportunity_activity_scopes` **rejected** (wrong owner).  
Use **`collaboration_activity_scopes`** local catalog (M1 seed same three codes) + column `activity_scope_code` on AR (M2).

**Cultura inclusion:** `activity_scope_code ∈ cultural set`.  
**Never** use `form_code = progetto` as proxy.

### 7.7 Servizi — M1

Seed `service_categories` (`code`, `name_it`):

| code | name_it |
|---|---|
| `cultural_creative` | Servizi culturali e creativi |

**Cultura inclusion:** category = `cultural_creative`.  
`linguistic` remains non-cultural.

### 7.8 Contenuti — M1 (+ optional discipline)

Seed `content_categories` (`code`, `name_it`):

| code | name_it |
|---|---|
| `culture` | Cultura |

**Cultura inclusion:** `primary_category_code = culture` **OR** linked to cultural event (relational).  
Do not treat `events_community` as culture.

### 7.9 Persone — M0

No cultural fields on `profiles`. Hub “Persone” section continues via Professionisti.

---

## 8. `/cultura` inclusion matrix V2

| Domain | Direct inclusion | Relational inclusion | Catalog | Priority |
|---|---|---|---|---|
| Evento | `type_code = cultural` | — | `event_types` | P0 |
| Professionista | category ∈ cultural_creative allow-list | — | `professional_categories` | P1 |
| Organizzazione | `primary_scope_code` ∈ culture/heritage/creative_industries | — | `organization_activity_scopes` | P1 |
| Impresa | sector declaration ∈ CCI set | — | `business_sectors` | P1 |
| Opportunità | activity scope ∈ cultural set | cultural event `context_opportunity_id` | new opp scopes | P1 |
| Collaborazione | `activity_scope_code` ∈ cultural set | — | new collab scopes | P2 |
| Servizio | `cultural_creative` category | — | `service_categories` | P2 |
| Contenuto | `primary_category_code = culture` | `content_event_links` → cultural event | `content_categories` | P1 |
| Mercato | — | `event_markets` → cultural event (unchanged) | — | P2 |
| Persona | — | via Professionista only | — | — |

Discipline filters: optional post-C3.7; not required for section membership.

---

## 9. Change classification

| Change | Class | Indispensable for leaving Event-only? |
|---|---|---|
| Org activity scope seeds | **M1** | Yes (Org section) |
| Professional cultural categories (+ CHECK group) | **M1 + light structural** | Yes (broader Persone/professionisti) |
| Business CCI sectors | **M1** | Yes (Imprese section) |
| Content category `culture` | **M1** | Yes (Contents without Event) |
| Service category `cultural_creative` | **M1** | Yes (Servizi section) |
| Opportunity activity scopes + assignments | **M1+M2** | **Yes** (calls without Event) |
| Collaboration activity scope column + catalog | **M1+M2** | Yes (Collab section) |
| Shared `cultural_disciplines` + event/content links | **M3+M2** | No (detail only) |
| New Cultura AR / Program AR | **M4** | **Rejected** |
| Polymorphic culture flag table | **M4** | **Rejected** |

---

## 10. Seed lists

### 10.1 Necessary for C3 (scope)

See §7 tables: org scopes (3), professional categories (~7 new + existing mediation), business sectors (8), content `culture`, service `cultural_creative`, opportunity scopes (3), collaboration scopes (3).

### 10.2 Future seeds

- Non-cultural org scopes for Red usability
- Additional CCI sectors if evidence appears
- Discipline links beyond event/content
- Finer professional specializations (text/tags, not catalog explosion)

---

## 11. New tables (only if M2/M3 approved)

| Table | Owner | Purpose |
|---|---|---|
| `opportunity_activity_scopes` | Opportunità | Scope catalog |
| `opportunity_activity_scope_assignments` | Opportunità | M2M scope |
| `collaboration_activity_scopes` | Collaborazioni | Scope catalog |
| (+ column `collaborations.activity_scope_code`) | Collaborazioni | Optional 0..1 scope |
| `cultural_disciplines` | Shared/foundation | Discipline catalog (optional wave) |
| `event_cultural_disciplines` | Eventi | Optional M2M |
| `content_cultural_disciplines` | Contenuti | Optional M2M |

**Indexes:** unique (opportunity_id, scope_code); FK indexes; standard catalog `(is_active)`, `(sort_order)`.

**No circular FK.** Cultura hub remains read-only consumer.

---

## 12. RLS impact

| Object | Expected RLS |
|---|---|
| New catalogs | Public SELECT like other C03 (`anon`/`authenticated` SELECT; deny writes) — reuse residual catalog RLS pattern |
| `opportunity_activity_scope_assignments` | Mirror `opportunity_type_assignments` (public read when opportunity public; party write) |
| `collaborations.activity_scope_code` | No new policy if column on existing AR (inherits collaboration RLS) |
| Discipline link tables | Mirror `content_event_links` / event child patterns |

**Preference:** no novel authorization model.

---

## 13. Compatibility / backfill

| Topic | Rule |
|---|---|
| Existing rows | Unchanged meaning; new scopes optional |
| Backfill | **None automatic**; Red/users classify going forward |
| Event-anchored C2 behaviour | Remains valid as relational OR |
| API | Additive filters only |
| Ambiguous backfill from titles | **Forbidden** |

---

## 14. Proposed migration block (design only)

Minimal ordered units (names indicative):

| Unit | Title | Responsibility | Class |
|---|---|---|---|
| **C3.1** | Org activity scope seeds | INSERT into `organization_activity_scopes` | M1 |
| **C3.2** | Professional cultural categories | ALTER CHECK `group_code` + INSERT categories | M1+light |
| **C3.3** | Creative industry sectors | INSERT into `business_sectors` | M1 |
| **C3.4** | Content + service cultural categories | INSERT categories | M1 |
| **C3.5** | Opportunity activity scopes | Create catalog + assignments + RLS + seeds | M1+M2 |
| **C3.6** | Collaboration activity scope | Create catalog + column FK + seeds + indexes | M1+M2 |
| **C3.7** | Cultural disciplines (optional wave) | Create disciplines + event/content link tables + seeds | M3+M2 |

**Dependencies:** C3.1–C3.4 independent (can parallelize in review); C3.5/C3.6 after design approval; C3.7 after scope wave stable.

**Not in C3:** frontend `/cultura` V2, Talentive fields, Program AR, Org membership.

---

## 15. Frontend impact (not implemented)

After C3.1–C3.6 applied and app wired:

```
Evento (type cultural) ─────────────┐
Professionista (cultural categories)┤
Organizzazione (activity scope) ────┤
Impresa (CCI sectors) ──────────────┤→ /cultura sections data-driven
Opportunità (scope OR event link) ──┤
Collaborazione (scope) ─────────────┤
Servizio (cultural_creative) ───────┤
Contenuto (category OR event link) ─┘
```

C2 event propagation remains as **relational enrichment**, not sole gate.

---

## 16. CulturalProgram / Project AR

**Still deferred.** Scope+discipline enrichment does **not** create multi-initiative program identity.  
Threshold unchanged from C0/C1: revisit only if composition Org+Events+Opp+Contents fails operational needs.

---

## 17. Talentive stress-test

Representable as:

- Org with scope `culture` / `creative_industries`
- Events `cultural` (+ optional disciplines)
- Opportunities with scope `culture` (calls/residencies) without requiring Event
- Professionals in cultural_creative categories
- Contents with category `culture`

No Talentive-/Cariplo-specific columns.

---

## 18. Risks

| Risk | Mitigation |
|---|---|
| Encyclopedic professional catalog | Consolidated practice categories only |
| Using association/foundation as culture | Forbidden; scopes only |
| Opp types overloaded with culture | Separate activity scopes |
| Shared disciplines used as inclusion | Explicit V2 rule: scope first |
| Cross-domain FK confusion | Local catalogs for Opp/Collab scopes |
| Backfill temptations | Policy: no title heuristics |

---

## 19. Do NOT build

- Cultura BC / Cultura tables of facts  
- CulturalPerson / CulturalOrganization / …  
- Keyword classifiers  
- Program AR in C3  
- Polymorphic entity culture flags  
- Funder-specific schema  
- Replacing `event_types.cultural` with dozens of event types  

---

## 20. Human approval points

1. Confirm **Hybrid C** (scope domain-native + optional shared disciplines).  
2. Confirm Opp/Collab **new scope catalogs** (necessary to leave Event-only).  
3. Confirm professional **CHECK extension** (`cultural_creative` group) + consolidated categories (not job-title explosion).  
4. Confirm **C3.7 disciplines** as optional second wave vs defer entirely.  
5. Authorize **migration block C3.1–C3.6** (and optionally C3.7) as separate implementation task — **design-authorized after human approval; not yet executable in this phase**.

---

## 21. Next step (not executed)

**C3.x implementation task:** write SQL migrations per §14, apply local→remote with standard M8 gates, then **C4 app task** to rewire `/cultura` inclusion predicates — still no Cultura AR.
