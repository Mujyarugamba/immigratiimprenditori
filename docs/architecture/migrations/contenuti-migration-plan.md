# Contenuti — Migration Plan

**Stato del documento:** Ciclo 1 chiuso — M1–M5 completati; M6 assente; M7 assente; M8.1 SKIP; M8.2 ACCETTATA.
**Natura:** piano di migrazione documentale. Le 12 migration SQL sono state create, applicate e pubblicate; M8.2 in `contenuti-validation-report.md`.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/contenuti.md`.
**Contratto logico vincolante:** `docs/architecture/logical/contenuti.md`.

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Contenuti** |
| Artefatto | Migration Plan ciclo 1 |
| HEAD schema pubblicato | `e1c9a3965ef490ef444f9497cb234b247e9c47ef` |
| Ultima migration Contenuti | `20260807200000` |
| SQL Contenuti | **12/12** create, applicate locale/remoto, pubblicate |
| Stato | **Ciclo 1 chiuso** — M1–M5 completati; M6 assente; M7 assente; M8.1 SKIP; M8.2 ACCETTATA |

---

## 2. Scopo

Trasformare Logical e Physical Contenuti in roadmap operativa completa del ciclo 1:

* blocchi M1–M8 (con M6/M7 assenti espliciti);
* **12 unità SQL** (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* modalità **accelerata cumulativa**;
* test statici/runtime, apply locale/remoto, Git, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. L’azione autorizzabile successiva è la **creazione contemporanea delle 12 migration**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/contenuti.md` | Contratto DDL-ready |
| 2 | `logical/contenuti.md` | Semantica |
| 3 | `logical/contenuti-editoriali.md` | Predecessore storico (non prevale) |
| 4 | Migration Plan Eventi / Servizi / Professionisti / … | Pattern operativi |
| 5 | Validation report finali dei domini chiusi | Criteri M8.2 |
| 6 | Migration SQL referenziate (profiles, businesses, languages, events, …) | Tipi FK reali |
| 7 | `domain-dependency-map.md` | D30–D37 e confini |
| 8 | `domain-model.md` | Gate metodologico |
| 9 | PDS §§17–19 | Contesto storico secondario |

**Contraddizioni Logical ↔ Physical:** nessuna materiale. Plan creatibile senza nuove decisioni.

**Nota Plan ↔ Physical:** colonna etichetta autori = `display_label` (Physical), non `display_name`.

---

## 4. Modalità accelerata

Workflow **unico** per tutte le unità SQL Contenuti (M1–M5):

1. creazione contemporanea delle **12** migration SQL;
2. controlli rapidi unitari (statici) su ogni file;
3. review indipendente **unica** M1–M5;
4. apply locale cumulativo `supabase migration up --local`;
5. validazione integrata runtime con `BEGIN`/`ROLLBACK`;
6. commit e push **unico**;
7. dry-run remoto **unico** `supabase db push --linked --dry-run`;
8. apply remoto **unico** `supabase db push --linked`;
9. M8 finale (M8.1 SKIP; M8.2 report documentale).

**Una migration distinta per unità.** Nessun raggruppamento multi-tabella.
**Non** prevedere un ciclo completo apply/commit/push/remoto per ogni blocco.

---

## 5. Prerequisiti

| Prerequisito | Stato atteso |
|---|---|
| Branch `main` = `origin/main` | Allineato a `181b8b6…` |
| Working tree pre-SQL | Logical + Physical Contenuti (??), questo Plan (??) |
| Dipendenze esterne | `profiles`, `businesses`, `professional_profiles`, `languages`, `events`, `opportunities`, `service_offers`, `service_requests`, `international_markets` |
| Head migration | ≥ `20260806170000` |
| Nessuna collision timestamp `20260807*` | Verificata al Plan |
| Nessuna migration Contenuti | Verificata |
| Legacy intatte | `personal_stories`, `business_media` non toccate |
| Nessun `.temp` estraneo | Ok |

---

## 6. Inventario Physical

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `content_types` | Catalogo | M1.1 |
| 2 | `content_categories` | Catalogo | M1.2 |
| 3 | `content_tags` | Catalogo | M1.3 |
| 4 | `contents` | Aggregate Root | M2.1 |
| 5 | `content_authors` | Owned / ruolo | M3.1 |
| 6 | `content_tag_links` | Owned / link | M3.2 |
| 7 | `content_subject_links` | Owned / soggetto | M4.1 |
| 8 | `content_event_links` | Owned / oggetto | M4.2 |
| 9 | `content_opportunity_links` | Owned / oggetto | M4.3 |
| 10 | `content_service_links` | Owned / oggetto | M5.1 |
| 11 | `content_market_links` | Owned / contesto | M5.2 |
| 12 | `content_relations` | Owned / correlati | M5.3 |

**12/12 tabelle. Nessuna tabella extra.**

---

## 7. Dipendenze

### 7.1 Esterne

| Target | PK | Usata da | ON DELETE tipico |
|---|---|---|---|
| `profiles` | uuid | M2.1, M3.1, M4.1 | RESTRICT (owner); SET NULL (ruoli) |
| `businesses` | uuid | M2.1, M3.1, M4.1 | RESTRICT / SET NULL |
| `professional_profiles` | uuid | M3.1, M4.1 | SET NULL |
| `languages` | **bigint** | M2.1 | RESTRICT |
| `events` | uuid | M4.2 | RESTRICT |
| `opportunities` | uuid | M4.3 | RESTRICT |
| `service_offers` | uuid | M5.1 | RESTRICT |
| `service_requests` | uuid | M5.1 | RESTRICT |
| `international_markets` | uuid | M5.2 | RESTRICT |

### 7.2 Interne

| Target | Usata da |
|---|---|
| `content_types` | M2.1 |
| `content_categories` | M2.1 |
| `content_tags` | M3.2 |
| `contents` | M3.*, M4.*, M5.* |

### 7.3 Vietate

Organizzazioni; Identità/`auth.users` come owner; `personal_stories`; `business_media`; Collaborazioni; Storage; CMS; versioning; traduzioni; FEV; commenti.

### 7.4 Assenza cicli

Cataloghi → AR → authors/tag links → subject/event/opportunity → service/market/relations. Aciclico.

---

## 8. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL |
|---|---|---|---|
| **M1** | Presente | Cataloghi editoriali | M1.1–M1.3 |
| **M2** | Presente | AR Contenuto | M2.1 |
| **M3** | Presente | Autori + tag links | M3.1–M3.2 |
| **M4** | Presente | Subject / Event / Opportunity | M4.1–M4.3 |
| **M5** | Presente | Service / Market / Relations | M5.1–M5.3 |
| **M6** | **Assente** | — | 0 |
| **M7** | **Assente** | — | 0 |
| **M8** | Presente (non SQL) | M8.1 SKIP; M8.2 report | 0 SQL |

**Ordine globale:**
M1.1 → M1.2 → M1.3 → M2.1 → M3.1 → M3.2 → M4.1 → M4.2 → M4.3 → M5.1 → M5.2 → M5.3 → (M8.1 SKIP) → M8.2.

---

## 9. Matrice blocchi / unità

| Codice | Blocco | Tabella | Timestamp | File futuro |
|---|---|---|---|---|
| M1.1 | M1 | `content_types` | `20260807090000` | `20260807090000_create_content_types.sql` |
| M1.2 | M1 | `content_categories` | `20260807100000` | `20260807100000_create_content_categories.sql` |
| M1.3 | M1 | `content_tags` | `20260807110000` | `20260807110000_create_content_tags.sql` |
| M2.1 | M2 | `contents` | `20260807120000` | `20260807120000_create_contents.sql` |
| M3.1 | M3 | `content_authors` | `20260807130000` | `20260807130000_create_content_authors.sql` |
| M3.2 | M3 | `content_tag_links` | `20260807140000` | `20260807140000_create_content_tag_links.sql` |
| M4.1 | M4 | `content_subject_links` | `20260807150000` | `20260807150000_create_content_subject_links.sql` |
| M4.2 | M4 | `content_event_links` | `20260807160000` | `20260807160000_create_content_event_links.sql` |
| M4.3 | M4 | `content_opportunity_links` | `20260807170000` | `20260807170000_create_content_opportunity_links.sql` |
| M5.1 | M5 | `content_service_links` | `20260807180000` | `20260807180000_create_content_service_links.sql` |
| M5.2 | M5 | `content_market_links` | `20260807190000` | `20260807190000_create_content_market_links.sql` |
| M5.3 | M5 | `content_relations` | `20260807200000` | `20260807200000_create_content_relations.sql` |
| M8.1 | M8 | — | — | **SKIP** |
| M8.2 | M8 | — | — | `docs/architecture/migrations/contenuti-validation-report.md` |

**12 timestamp univoci**, > `20260806170000`, nessuna collisione `20260807*` al Plan.

---

## 10. M1 — Cataloghi editoriali

**Responsabilità.** Tre cataloghi C03; seed tipologies (11) e categories (8); tags senza seed.

### M1.1 — `content_types`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M1.1 · Create content types · `content_types` · `20260807090000` · `20260807090000_create_content_types.sql` |
| 7–8 | Dipendenze | Nessuna tabella Contenuti |
| 9–12 | Colonne | Physical §9: `code`, `name_it`, `description`, `is_active`, `sort_order`, timestamps |
| 13 | PK | `code` |
| 14–16 | FK | nessuna |
| 17–18 | UNIQUE | PK |
| 19 | CHECK | blank code/name; `sort_order >= 0` |
| 20–21 | Indici | `(is_active)`; `(sort_order)` |
| 22–28 | Trigger/RLS/privilegi | Pattern comune Contenuti |
| 29 | COMMENT | TABLE + colonne + FUNCTION |
| 30 | Seed | **11** righe esatte Physical §9 |
| 31–34 | Test / stop | COUNT=11; RESTRICT da contents; deny RLS |

**Seed esatto:** `news`, `guide`, `insight`, `interview`, `business_story`, `event_presentation`, `opportunity_presentation`, `service_presentation`, `market_content`, `institutional_page`, `personal_story` (sort 10…110). Nessun tipo aggiuntivo.

### M1.2 — `content_categories`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M1.2 · `content_categories` · `20260807100000` · `20260807100000_create_content_categories.sql` |
| 7–8 | Dipendenze | Nessuna |
| 9–19 | Contratto | Identico a catalogo C03; **nessuna gerarchia** |
| 30 | Seed | **8** righe Physical §10: `internationalization`, `entrepreneurship`, `regulation_compliance`, `markets`, `services_guidance`, `events_community`, `stories`, `other` |
| 31–34 | Test | COUNT=8; ≠ service/event/professional catalogs |

### M1.3 — `content_tags`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M1.3 · `content_tags` · `20260807110000` · `20260807110000_create_content_tags.sql` |
| 9–19 | Contratto | C03: `code` PK, `name_it`, `description`, `is_active`, `sort_order`, timestamps; CHECK blank |
| 30 | Seed | **0** (struttura pronta; popolabile operativamente) |
| 31–34 | Test | tabella vuota post-apply; UNIQUE code |

---

## 11. M2 — Aggregate root

### M2.1 — `contents`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M2.1 · `contents` · `20260807120000` · `20260807120000_create_contents.sql` |
| 7–8 | Dipendenze | M1.1–M1.2; `profiles`; `businesses`; `languages` |
| 9–12 | Colonne | Physical §7.1 (**25** colonne in ordine) |
| 13 | PK | `id uuid` DEFAULT `gen_random_uuid()` |
| 14–16 | FK | owner_person RESTRICT; owner_business RESTRICT; type_code RESTRICT (UPDATE CASCADE); primary_category RESTRICT (UPDATE CASCADE); language_id RESTRICT |
| 17–18 | UNIQUE | `slug` globale |
| 19 | CHECK | ownership ternary; blank title/body/slug; body_format; editorial/publication/visibility sets; publication gates; slug regex; blank-guards optional texts |
| 20–21 | Indici | Physical §29 (owners partials, type, language, publication, published, featured, archived) |
| 22–28 | Trigger/RLS/privilegi | Pattern comune |
| 29 | COMMENT | ownership XOR/Redazione; type; language; body_format; assi; slug; cover/source; featured; invariante responsabile |
| 30 | Seed | **0** |
| 31–34 | Test | ternary ownership; gates; slug unique; language bigint; invariante editoriale **applicativa** |

**Ownership ternary:** Persona XOR Impresa XOR `owned_by_editorial = true` (Physical §7.2 / §8).

---

## 12. M3 — Autori e tag

### M3.1 — `content_authors`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M3.1 · `content_authors` · `20260807130000` · `20260807130000_create_content_authors.sql` |
| 7–8 | Dipendenze | `contents`; `profiles`; `businesses`; `professional_profiles` |
| 9–12 | Colonne | Physical §12 (12 colonne) |
| 13 | PK | `id uuid` |
| 14–16 | FK | content CASCADE; person/business/professional SET NULL |
| 17–18 | UNIQUE | parziale `(content_id)` WHERE `is_primary`; parziale `(content_id, role_kind, person_id)` WHERE person NOT NULL |
| 19 | CHECK | role_kind set; soggetto presente; person/business XOR; sort_order; blank-guards |
| 20–34 | Pattern + test CASCADE; no Org/`auth.users` |

**role_kind:** `author` \| `co_author` \| `curator` \| `editor` \| `contributor` \| `editorial_responsible`.  
Etichetta: `display_label` (Physical).  
Invariante: published ⇒ ≥1 `editorial_responsible` (applicativa).

### M3.2 — `content_tag_links`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M3.2 · `content_tag_links` · `20260807140000` · `20260807140000_create_content_tag_links.sql` |
| 7–8 | Dipendenze | `contents`; `content_tags` |
| 9–18 | Contratto | Physical §11.2: content CASCADE; tag_code RESTRICT; UNIQUE `(content_id, tag_code)`; sort_order |
| 22–34 | Pattern comune; seed 0 |

---

## 13. M4 — Soggetti, Eventi, Opportunità

### M4.1 — `content_subject_links`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M4.1 · `20260807150000` · `20260807150000_create_content_subject_links.sql` |
| 7–8 | Dipendenze | `contents`; `profiles`; `businesses`; `professional_profiles` |
| 9–19 | Contratto | Physical §23: esattamente un soggetto; relation_kind ∈ subject/cited/interviewed/context; UNIQUE parziali; person/business RESTRICT; professional SET NULL; content CASCADE |
| 31–34 | Test XOR; no entity_type/entity_id |

### M4.2 — `content_event_links`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M4.2 · `20260807160000` · `20260807160000_create_content_event_links.sql` |
| 7–8 | Dipendenze | `contents`; `events` |
| 9–19 | Contratto | Physical §21: event_id RESTRICT; relation_kind ∈ presents/report/related; UNIQUE `(content_id, event_id)`; content CASCADE |
| 31–34 | Test; non duplica data/luogo/programma Evento |

### M4.3 — `content_opportunity_links`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M4.3 · `20260807170000` · `20260807170000_create_content_opportunity_links.sql` |
| 7–8 | Dipendenze | `contents`; `opportunities` |
| 9–19 | Contratto | Physical §22: opportunity RESTRICT; relation_kind ∈ presents/guide/related; UNIQUE; content CASCADE |
| 31–34 | Test; non duplica scadenze/requisiti |

---

## 14. M5 — Servizi, Mercati, correlati

### M5.1 — `content_service_links`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M5.1 · `20260807180000` · `20260807180000_create_content_service_links.sql` |
| 7–8 | Dipendenze | `contents`; `service_offers`; `service_requests` |
| 9–19 | Contratto | Physical §20: offer XOR request; entrambi RESTRICT; relation_kind ∈ presents/describes/related; UNIQUE parziali; content CASCADE |
| 31–34 | Test XOR offer/request |

### M5.2 — `content_market_links`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M5.2 · `20260807190000` · `20260807190000_create_content_market_links.sql` |
| 7–8 | Dipendenze | `contents`; `international_markets` |
| 9–19 | Contratto | Physical §25: market uuid RESTRICT; relation_kind ∈ focus/related/destination; UNIQUE; content CASCADE |
| 31–34 | Test; ≠ Presenza/Interesse/Attività |

### M5.3 — `content_relations`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M5.3 · `20260807200000` · `20260807200000_create_content_relations.sql` |
| 7–8 | Dipendenze | `contents` (source e target) |
| 9–19 | Contratto | Physical §26: source/target CASCADE; relation_kind ∈ related/follow_up/recommended; CHECK source ≠ target; UNIQUE (source, target, relation_kind) |
| 31–34 | Test auto-relazione rifiutata; chiusura SQL 12/12 |

---

## 15. M6 — Assente

**Decisione:** blocco **assente**.  
Nessuna unità traduzioni, versioning, FEV, media, Storage, commenti, analytics, fonti strutturate. Nessuna migration comment-only.

---

## 16. M7 — Assente

**Decisione:** blocco **assente**.  
COMMENT/RLS/REVOKE sono responsabilità di ogni unità M1–M5.

---

## 17. M8 — Chiusura

### M8.1 — Seed dimostrativi

**SKIP.** Seed normativo solo M1.1 + M1.2. Nessun seed AR/authors/links.

### M8.2 — Validazione finale (non SQL)

File futuro: `docs/architecture/migrations/contenuti-validation-report.md`

Deve verificare:

* 12 migration in history locale e remota;
* 12 tabelle locale=remoto;
* matrice Logical → Physical → Plan → SQL;
* head attesa `20260807200000`;
* seed types=11; categories=8; tags=0;
* RLS 12/12; FORCE false; policy 0;
* REVOKE; GRANT applicativi 0;
* COMMENT TABLE 12/12;
* drift 0;
* `personal_stories` / `business_media` intatte;
* chiusura ciclo 1 `ACCETTATA` / `NON ACCETTATA`.

---

## 18. Timestamp

| Verifica | Esito |
|---|---|
| > `20260806170000` | Sì |
| Univoci | 12 |
| Crescenti | Sì (`090000`…`200000`) |
| Collisioni `20260807*` | Nessuna al Plan |
| Calendar-valid | 2026-08-07 slot orari |

---

## 19. Naming migration

Pattern: `{timestamp}_create_{table}.sql`.

Nomi futuri esatti: §9.

Funzioni: `set_content_*_updated_at` (abbreviare se >63 byte).  
Trigger: `{table}_set_updated_at`.

---

## 20. Contratti unitari (sintesi operativa)

Ogni unità M1.1–M5.3 realizza il contratto Physical della rispettiva tabella più:

| Voce | Prescrizione |
|---|---|
| Schema | `public` |
| updated_at | funzione dedicata INVOKER + `search_path=''` + BEFORE UPDATE |
| RLS | ENABLE; FORCE false; 0 policy |
| Privilegi | REVOKE ALL da PUBLIC, anon, authenticated; no GRANT |
| COMMENT | TABLE + colonne ambigue + FUNCTION |
| Vietato | IF NOT EXISTS; DO; SQL dinamico; JSONB; ENUM; policy; GRANT; seed demo AR; Storage; versioning; translations |

Dettaglio colonnare: riferimento normativo alle sezioni Physical citate in M1–M5.

---

## 21. Seed

| Tabella | Righe | Contenuto |
|---|---|---|
| `content_types` | **11** | Physical §9 |
| `content_categories` | **8** | Physical §10 |
| `content_tags` | **0** | — |
| Altre 9 | **0** | — |

---

## 22. RLS e privilegi

Per tutte le **12** tabelle:

* ENABLE ROW LEVEL SECURITY  
* FORCE **false**  
* **zero** policy  
* REVOKE ALL da PUBLIC, anon, authenticated  
* nessun GRANT applicativo  
* non alterare impropriamente `service_role` / `postgres`

---

## 23. Test statici

* 12 file; 12 CREATE TABLE; timestamp/nomi Plan;  
* colonne/tipi/null/default = Physical;  
* PK/FK/ON DELETE/ON UPDATE; UNIQUE/CHECK/indici;  
* trigger + funzione; RLS + REVOKE + COMMENT;  
* seed solo M1.1/M1.2;  
* assenza SQL vietato; id ≤63;  
* nessuna modifica migration precedenti / legacy.

---

## 24. Test runtime (ROLLBACK)

**Cataloghi:** COUNT 11/8; tags 0; blank/sort; RESTRICT.  
**Contents:** owner Persona/Impresa/Redazione; ownership invalide; FK cataloghi; language bigint; slug dup; body blank; body_format; lifecycle gates; updated_at.  
**Authors:** person/prof/business/label; XOR; role; primary unica; CASCADE.  
**Tag links:** UNIQUE; CASCADE/RESTRICT.  
**Subject links:** XOR soggetti; relation_kind; UNIQUE; CASCADE/RESTRICT/SET NULL.  
**Event/Opportunity links:** FK; UNIQUE; CASCADE/RESTRICT.  
**Service links:** offer XOR request; UNIQUE; CASCADE/RESTRICT.  
**Market links:** uuid; UNIQUE; RESTRICT/CASCADE.  
**Relations:** valida; auto-relazione rifiutata; dup rifiutato; CASCADE.  
**RLS:** deny anon/authenticated su tutte le 12.  
**ROLLBACK:** types=11; categories=8; tags=0; altre=0; zero fixture.

---

## 25. Apply locale

1. Creare le **12** SQL  
2. Controlli statici unitari  
3. Review unica M1–M5  
4. `supabase migration up --local`  
5. `supabase migration list`  
6. Query catalogo 12 tabelle + seed  
7. Runtime ROLLBACK  
8. Hash SHA-256 dei 12 file  
9. Preparare commit unico  

**Vietati:** reset; repair; SQL manuale; modifica history; `migration up --linked`.

---

## 26. Commit e push

| Regola | Prescrizione |
|---|---|
| Granularità | **Un** commit per le 12 migration (+ docs Logical/Physical/Plan se non già versionati) |
| Messaggio esempio | `feat(db): add contents domain cycle 1 schema` |
| M8.2 | commit docs separato successivo |
| Vietato | Commit SQL non reviewate; push senza apply locale |

---

## 27. Dry-run remoto

```
supabase db push --linked --dry-run
```

Review: esattamente le 12 migration Contenuti.  
**Vietato:** `--include-all`, `--include-seed`, `--db-url`, repair, reset.

---

## 28. Apply remoto

1. dry-run  
2. review 12 migration  
3. `supabase db push --linked`  
4. `supabase migration list --linked`  
5. controllo catalogale remoto  
6. M8.2  

**Vietato:** `migration up --linked` come preferito.

---

## 29. Verifica post-apply

* history include `20260807090000`…`20260807200000`;  
* 12 tabelle; seed 11+8; tags 0;  
* RLS/FORCE/policy/privilegi; COMMENT;  
* legacy intatte; Eventi/Servizi intatti.

---

## 30. Recovery

| Evento | Azione |
|---|---|
| Review SQL fallita | Non apply; correggi; nuova review unica |
| Apply locale fallito | Non commit; fix |
| Dry-run inatteso | Non apply remoto |
| Drift | Stop; non M8.2 ACCETTATA |

**Stop point Plan:** creazione Plan + review — **nessun SQL**.

---

## 31. Confini

Assenza di: CMS; page builder; JSONB modellante; versioning; traduzioni; media library; Storage; bucket; allegati; commenti; reazioni; analytics; FEV; workflow autorizzativo; Organizzazioni; `auth.users`; policy applicative; assorbimento `personal_stories` / `business_media`.

---

## 32. Oggetti vietati

Tabelle/colonne per: translations, versions, blocks, comments, reactions, views, storage paths, MIME, hash, entity_type/entity_id, IF NOT EXISTS, DO, ENUM, FORCE RLS true, GRANT anon/authenticated, seed demo AR.

---

## 33. Criteri di chiusura

| Fase | Chiusura |
|---|---|
| Plan | Questo documento approvabile; 12 unità determinate |
| SQL cumulativo | 12 migration create/reviewate/apply locale/remoto |
| M8.1 | SKIP |
| M8.2 | Report `ACCETTATA` |

---

## 34. Validazione finale

Dominio chiudibile solo con 12/12 tabelle; seed 11+8; RLS deny-by-default; matrice L/P/Plan/SQL; report M8.2 `ACCETTATA`; tree pulito post-commit report.

---

## 35. Report M8.2

Path: `docs/architecture/migrations/contenuti-validation-report.md`  
Struttura minima: esito; inventario; matrice; history; seed; RLS; policy; privilegi; COMMENT; drift; legacy; firma chiusura.

---

## 36. Matrice Logical / Physical / Plan

| Logical | Physical | Plan unit |
|---|---|---|
| TipologiaEditoriale | `content_types` | M1.1 |
| CategoriaContenuto | `content_categories` | M1.2 |
| Tag | `content_tags` + links | M1.3 / M3.2 |
| Contenuto (AR) | `contents` | M2.1 |
| Autore/Curatore/Responsabile | `content_authors` | M3.1 |
| SoggettoDescritto | `content_subject_links` | M4.1 |
| Oggetto Evento | `content_event_links` | M4.2 |
| Oggetto Opportunità | `content_opportunity_links` | M4.3 |
| Oggetto Servizio | `content_service_links` | M5.1 |
| Contesto Mercato | `content_market_links` | M5.2 |
| Contenuto correlato | `content_relations` | M5.3 |
| Versione/Traduzione/CMS/Storage | assenti | M6/M7 assenti |

---

## 37. Decisioni rinviate

Come Physical §43: trigger responsabile; multi-categoria; seed tag; versioning/traduzioni; content_sources; SEO avanzata; scheduling; Collaborazioni; consolidamento D-map; timestamp definitivi già assegnati qui. **Non bloccano** M1–M5.

---

## 38. Rischi

| Rischio | Mitigazione |
|---|---|
| Confusione con `personal_stories` | COMMENT; tipology classificativa; esclusione assorbimento |
| Ownership Redazione malformata | CHECK ternary; test runtime |
| Tipi language uuid vs bigint | Verifica §7; test statici |
| Link polimorfici striscianti | Tabelle tipizzate; vietato entity_type |
| CMS/Storage striscianti | Confini §31–§32 |
| Ordine apply ad-hoc | Sequenza Plan; apply cumulativo |

---

## 39. Stato roadmap

| Fase | Stato |
|---|---|
| Logical | Completato; ciclo 1 chiuso |
| Physical | Completato; ciclo 1 chiuso |
| Migration Plan | **Questo documento** — ciclo 1 chiuso |
| SQL M1–M5 (12 file) | **Completati** (`20260807090000`…`20260807200000`) |
| M6 | **Assente** |
| M7 | **Assente** |
| M8.1 | **SKIP** |
| M8.2 | **ACCETTATA** (`contenuti-validation-report.md`) |

---

## 40. Stato finale

**Migration Plan Contenuti — ciclo 1 chiuso.**

M1–M5 completati (12 SQL); M6 assente; M7 assente; M8.1 SKIP; M8.2 ACCETTATA.

AR unico `contents`; ownership ternaria; head locale/remoto `20260807200000`; drift 0.

Report: `docs/architecture/migrations/contenuti-validation-report.md`.

---

## Checklist conclusiva

- [x] 12/12 tabelle → 12 unità
- [x] Timestamp univoci > `20260806170000`
- [x] AR unico (`contents`)
- [x] Seed esatti 11+8; tags 0
- [x] M6/M7 assenti
- [x] M8.1 SKIP; M8.2 ACCETTATA
- [x] Dipendenze acicliche; link tipizzati
- [x] Legacy non assorbite
- [x] Modalità accelerata cumulativa
- [x] Ciclo 1 chiuso su schema pubblicato
