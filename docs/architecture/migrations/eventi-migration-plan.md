# Eventi — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica Logical né Physical.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/eventi.md`.
**Contratto logico vincolante:** `docs/architecture/logical/eventi.md`.

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Eventi** |
| Artefatto | Migration Plan ciclo 1 |
| HEAD di riferimento (pre-SQL) | `d768eb2e306fbe89f8dde7bad5c040d5889a1f1d` |
| Ultima migration repository | `20260805190000` (Servizi M5.3) |
| SQL Eventi | **Assenti** (da creare dopo approvazione Plan) |
| Stato | **Chiuso per creazione cumulativa M1–M5 (9 unità)** |

---

## 2. Scopo

Trasformare Logical e Physical Eventi in roadmap operativa completa del ciclo 1:

* blocchi M1–M8 (con M6/M7 assenti espliciti);
* **9 unità SQL** (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* modalità **accelerata cumulativa** (non un loop completo per blocco);
* test statici/runtime, apply locale/remoto, Git, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. L’unità autorizzabile successiva è la **creazione contemporanea delle 9 migration**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/eventi.md` | Contratto DDL-ready |
| 2 | `logical/eventi.md` | Semantica (UTF-8 ripristinato) |
| 3 | Migration Plan Servizi / Professionisti / Imprese / Appartenenze / MI / Opportunità | Pattern operativi |
| 4 | Validation report finali dei domini chiusi | Criteri M8.2 |
| 5 | Migration SQL referenziate (`profiles`, `businesses`, `professional_profiles`, `languages`, `international_markets`, `opportunities`, `service_offers`) | Tipi FK reali |
| 6 | `domain-dependency-map.md` | D24–D29 e confini |
| 7 | `domain-model.md` | Gate metodologico |
| 8 | PDS §§15–16 | Contesto storico secondario |

**Contraddizioni Logical ↔ Physical:** nessuna materiale. Plan creatibile senza nuove decisioni.

**Nota di allineamento Plan ↔ Physical (non decisione nuova):** il partecipante iscrizione è **Persona obbligatoria** (`participant_person_id NOT NULL`) con Impresa “per conto di” opzionale (`on_behalf_business_id`); **non** è un XOR Persona|Impresa come titolare AR.

---

## 4. Modalità accelerata

Workflow **unico** per tutte le unità SQL Eventi (M1–M5):

1. creazione contemporanea delle **9** migration SQL;
2. controlli rapidi unitari (statici) su ogni file;
3. review indipendente **unica** M1–M5;
4. apply locale cumulativo `supabase migration up --local`;
5. validazione integrata runtime con `BEGIN`/`ROLLBACK`;
6. commit e push **unico** delle 9 migration (+ docs già presenti se inclusi nello stesso commit operativo);
7. dry-run remoto **unico** `supabase db push --linked --dry-run`;
8. apply remoto **unico** `supabase db push --linked`;
9. M8 finale (M8.1 SKIP; M8.2 report documentale).

**Una migration distinta per unità.** Nessun raggruppamento multi-tabella.
**Non** prevedere un ciclo completo apply/commit/push/remoto per ogni blocco M1…M5.

---

## 5. Prerequisiti

Prima di qualsiasi SQL Eventi:

| Prerequisito | Stato atteso |
|---|---|
| Branch `main` = `origin/main` | Allineato a `d768eb2…` |
| Working tree pre-SQL | Logical Eventi (M), Physical Eventi (??), questo Plan (??) |
| Dipendenze esterne presenti | `profiles`, `businesses`, `professional_profiles`, `languages`, `international_markets`, `opportunities`, `service_offers` |
| Head migration | ≥ `20260805190000` |
| Nessuna collision timestamp `20260806*` | Verificata al momento del Plan |
| Nessuna migration Eventi esistente | Verificata |
| Nessun file `.temp` estraneo bloccante | Ok (no `pgdelta`) |

---

## 6. Inventario Physical

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `event_types` | Catalogo C03 | M1.1 |
| 2 | `events` | Aggregate Root | M2.1 |
| 3 | `event_editions` | Owned da Evento | M3.1 |
| 4 | `event_sessions` | Owned da Edizione | M3.2 |
| 5 | `event_organizers` | Owned / ruolo | M4.1 |
| 6 | `event_speakers` | Owned / ruolo | M4.2 |
| 7 | `event_languages` | Owned / link | M5.1 |
| 8 | `event_markets` | Owned / link | M5.2 |
| 9 | `event_registrations` | Owned da Edizione | M5.3 |

**9/9 tabelle. Nessuna tabella extra.**

---

## 7. Dipendenze

### 7.1 Esterne (verificate)

| Target | Migration origine | PK | Usata da | ON DELETE tipico |
|---|---|---|---|---|
| `profiles` | `20260718103949_create_profiles_table.sql` | uuid | M2.1, M4.1, M4.2, M5.3 | RESTRICT (owner/participant); SET NULL (ruoli) |
| `businesses` | `20260731070000_create_businesses_core.sql` | uuid | M2.1, M4.1, M5.3 | RESTRICT / SET NULL |
| `professional_profiles` | `20260804090000_create_professional_profiles.sql` | uuid | M4.2 | SET NULL |
| `languages` | `20260718112212_create_languages_table.sql` | **bigint** | M5.1 | RESTRICT |
| `international_markets` | `20260802090000_create_international_markets.sql` | uuid | M5.2 | RESTRICT |
| `opportunities` | `20260720225301_create_opportunities_core.sql` | uuid | M2.1 context | SET NULL |
| `service_offers` | `20260805110000_create_service_offers.sql` | uuid | M2.1 context | SET NULL |

### 7.2 Interne

| Target | Usata da |
|---|---|
| `event_types` | M2.1 (`type_code`) |
| `events` | M3.1, M4.1, M5.1, M5.2 |
| `event_editions` | M3.2, M4.1 (scope), M4.2, M5.3 |
| `event_sessions` | M4.2 (scope opzionale) |

### 7.3 Vietate

Organizzazioni, Contenuti, Identità/`auth.users` come owner, `business_memberships`, DV4 (`training_*`, `language_service_*`), ticketing/pagamenti, FEV, Storage, `people`.

### 7.4 Assenza cicli

Grafo aciclico: catalogo → AR → edizioni → sessioni → ruoli/lingue/mercati/iscrizioni. Nessuna FK futura.

---

## 8. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL | Stop point |
|---|---|---|---|---|
| **M1** | Presente | Catalogo tipi + seed | M1.1 | Parte del ciclo cumulativo |
| **M2** | Presente | AR Evento | M2.1 | Parte del ciclo cumulativo |
| **M3** | Presente | Edizioni + Sessioni | M3.1, M3.2 | Parte del ciclo cumulativo |
| **M4** | Presente | Organizzatori + Relatori | M4.1, M4.2 | Parte del ciclo cumulativo |
| **M5** | Presente | Lingue + Mercati + Iscrizioni | M5.1–M5.3 | Fine SQL strutturale |
| **M6** | **Assente** | Nessuna relazione/FEV/extra | 0 | — |
| **M7** | **Assente** | Commenti/RLS già in ogni unità | 0 | — |
| **M8** | Presente (non SQL) | M8.1 SKIP; M8.2 report | 0 SQL | Chiusura ciclo 1 |

**Ordine globale SQL:**
M1.1 → M2.1 → M3.1 → M3.2 → M4.1 → M4.2 → M5.1 → M5.2 → M5.3 → (M8.1 SKIP) → M8.2.

---

## 9. Matrice blocchi / unità

| Codice | Blocco | Tabella | Timestamp | File futuro |
|---|---|---|---|---|
| M1.1 | M1 | `event_types` | `20260806090000` | `20260806090000_create_event_types.sql` |
| M2.1 | M2 | `events` | `20260806100000` | `20260806100000_create_events.sql` |
| M3.1 | M3 | `event_editions` | `20260806110000` | `20260806110000_create_event_editions.sql` |
| M3.2 | M3 | `event_sessions` | `20260806120000` | `20260806120000_create_event_sessions.sql` |
| M4.1 | M4 | `event_organizers` | `20260806130000` | `20260806130000_create_event_organizers.sql` |
| M4.2 | M4 | `event_speakers` | `20260806140000` | `20260806140000_create_event_speakers.sql` |
| M5.1 | M5 | `event_languages` | `20260806150000` | `20260806150000_create_event_languages.sql` |
| M5.2 | M5 | `event_markets` | `20260806160000` | `20260806160000_create_event_markets.sql` |
| M5.3 | M5 | `event_registrations` | `20260806170000` | `20260806170000_create_event_registrations.sql` |
| M8.1 | M8 | — | — | **SKIP** (no SQL) |
| M8.2 | M8 | — | — | `docs/architecture/migrations/eventi-validation-report.md` |

**9 timestamp univoci**, strettamente crescenti, tutti > `20260805190000`, nessuna collisione `20260806*` al momento del Plan.

---

## 10. M1 — Event types

**Responsabilità blocco.** Catalogo C03 tipologico Eventi + seed normativo esatto (10 righe); deny-by-default; nessuna dipendenza da altre tabelle Eventi.

### M1.1 — `event_types`

| # | Voce | Prescrizione |
|---|---|---|
| 1 | Codice | M1.1 |
| 2 | Titolo | Create `event_types` catalog |
| 3 | Responsabilità | Tipologie Evento ciclo 1 |
| 4 | Tabella | `event_types` |
| 5 | Timestamp | `20260806090000` |
| 6 | Nome futuro | `20260806090000_create_event_types.sql` |
| 7 | Dipendenze | Nessuna tabella Eventi |
| 8 | Prerequisiti | Schema `public` operativo |
| 9–12 | Colonne | Physical §13 ordine: `code`, `name_it`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at` — tipi/null/default ivi |
| 13 | PK | `code` text |
| 14–16 | FK / ON DELETE / ON UPDATE | Nessuna |
| 17–18 | UNIQUE | PK implica unicità `code`; nessuna UNIQUE aggiuntiva |
| 19 | CHECK | code/name_it non blank; `sort_order >= 0` |
| 20–21 | Indici | `(is_active)`; `(sort_order)` (Physical §24) |
| 22–23 | updated_at | `set_event_types_updated_at()` INVOKER + `search_path=''`; trigger `event_types_set_updated_at` BEFORE UPDATE |
| 24–26 | RLS | ENABLE; FORCE false; **0** policy |
| 27–28 | Privilegi | `REVOKE ALL` da PUBLIC, anon, authenticated; **nessun GRANT** |
| 29 | COMMENT ON | TABLE + colonne ambigue + FUNCTION |
| 30 | Seed | **10** righe esatte §21 / Physical §14 |
| 31 | Test statici | CREATE; PK; seed codes; RLS; REVOKE; COMMENT; no IF NOT EXISTS |
| 32 | Test runtime | COUNT=10; UNIQUE code; UPDATE updated_at; deny anon/authenticated |
| 33 | Post-apply | Catalogo 10; RLS/REVOKE |
| 34 | Stop point | Unità pronta; chiusura SQL solo a fine M5 cumulativo |

**Seed normativo (esatto — non inventare tipi):**

| code | name_it | sort_order |
|---|---|---|
| `networking` | Networking / incontro | 10 |
| `conference` | Convegno / conferenza / webinar / workshop | 20 |
| `fair` | Fiera / esposizione | 30 |
| `mission` | Missione imprenditoriale | 40 |
| `visit` | Visita aziendale | 50 |
| `institutional` | Istituzionale / associativo | 60 |
| `course` | Corso / attività formativa | 70 |
| `award` | Premiazione | 80 |
| `cultural` | Culturale / sociale | 90 |
| `other` | Altro | 100 |

**RESTRICT dai riferimenti:** `events.type_code` → `event_types(code)` ON DELETE **RESTRICT** (unità M2.1).

---

## 11. M2 — Events (AR)

**Responsabilità blocco.** Aggregate root unico `events`: titolare Persona XOR Impresa, tipologia, testi, lifecycle editoriale/pubblicazione/visibilità, contesti Opportunità/OffertaDiServizio, archiviazione.

### M2.1 — `events`

| # | Voce | Prescrizione |
|---|---|---|
| 1 | Codice | M2.1 |
| 2 | Titolo | Create `events` aggregate root |
| 3 | Responsabilità | Scheda radice Evento |
| 4 | Tabella | `events` |
| 5 | Timestamp | `20260806100000` |
| 6 | Nome futuro | `20260806100000_create_events.sql` |
| 7 | Dipendenze | `event_types`; `profiles`; `businesses`; `opportunities`; `service_offers` |
| 8 | Prerequisiti | M1.1 applicata (stesso ciclo cumulativo) |
| 9–12 | Colonne | Physical §7.1 (24 colonne in ordine) |
| 13 | PK | `id uuid` DEFAULT `gen_random_uuid()` |
| 14–16 | FK | owner_person → profiles **RESTRICT**; owner_business → businesses **RESTRICT**; type_code → event_types **RESTRICT** (UPDATE CASCADE); context_opportunity → opportunities **SET NULL**; context_service_offer → service_offers **SET NULL**; ON UPDATE NO ACTION salvo type_code CASCADE |
| 17–18 | UNIQUE | nessuno su title |
| 19 | CHECK | Owner XOR; blank title/description; delivery_mode ∈ (`in_presence`,`online`,`hybrid`); audience/economic/editorial/publication/visibility sets; publication gates; blank-guards optional texts (Physical §7.2) |
| 20–21 | Indici | partial owner_person; partial owner_business; `(type_code)`; `(publication_status)`; partial published; partial archived (Physical §24) |
| 22–23 | updated_at | `set_events_updated_at` + trigger BEFORE UPDATE |
| 24–26 | RLS | ENABLE; FORCE false; 0 policy |
| 27–28 | Privilegi | REVOKE ALL PUBLIC/anon/authenticated; no GRANT |
| 29 | COMMENT ON | TABLE + owner XOR + context_* + delivery_mode + stati + archived_at + external_organization_label + FUNCTION |
| 30 | Seed | **nessuno** |
| 31–32 | Test | statici DDL; runtime XOR owner; publication gates; SET NULL context; RESTRICT owner delete |
| 33 | Post-apply | Tabella presente; 0 seed AR |
| 34 | Stop point | Parte del cumulativo |

**Invariante applicativa (non DDL cross-table):** se `publication_status = 'published'` allora esiste ≥1 `event_editions` con `starts_at` valorizzato. Documentata; test runtime applicativo; **nessun trigger** cross-table ciclo 1.

---

## 12. M3 — Editions e Sessions

### M3.1 — `event_editions`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M3.1 · Create editions · `event_editions` · `20260806110000` · `20260806110000_create_event_editions.sql` |
| 7–8 | Dipendenze / prereq | `events` (M2.1) |
| 9–12 | Colonne | Physical §8.1 (24 colonne) |
| 13 | PK | `id uuid` |
| 14–16 | FK | `event_id` → `events(id)` ON DELETE **CASCADE** ON UPDATE NO ACTION |
| 17–18 | UNIQUE | nessuno obbligatorio |
| 19 | CHECK | tempo; timezone non blank; delivery_mode; occurrence/registration statuses; registration_access; capacity ≥0 o NULL; modalità/luogo (Physical §8.2); cancelled gate; blank-guards |
| 20–21 | Indici | `(event_id)`; `(starts_at)`; `(occurrence_status)`; `(registration_status)` |
| 22–28 | Trigger/RLS/privilegi | Pattern comune Eventi |
| 29–30 | COMMENT / seed | COMMENT richiesti; seed 0 |
| 31–34 | Test / stop | tempo, cancellazione, rinvio, CASCADE da Evento |

### M3.2 — `event_sessions`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M3.2 · Create sessions · `event_sessions` · `20260806120000` · `20260806120000_create_event_sessions.sql` |
| 7–8 | Dipendenze | `event_editions` (M3.1) |
| 9–12 | Colonne | Physical §9.1 (13 colonne) |
| 13 | PK | `id uuid` |
| 14–16 | FK | `event_edition_id` → `event_editions` **CASCADE** |
| 17–18 | UNIQUE | `(event_edition_id, sort_order)` |
| 19 | CHECK | title non blank; ends≥starts se entrambi; sort_order≥0; delivery_mode override set; blank-guards |
| 20–21 | Indici | `(event_edition_id)`; UNIQUE copre sort |
| 22–28 | Trigger/RLS/privilegi | Pattern comune |
| 29–30 | COMMENT / seed | sì / 0 |
| 31–34 | Test | 0..N sessioni; UNIQUE sort; CASCADE; **coerenza temporale Sessione ⊆ Edizione = vincolo applicativo** (no trigger cross-table) |

---

## 13. M4 — Organizzatori e Relatori

### M4.1 — `event_organizers`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M4.1 · `event_organizers` · `20260806130000` · `20260806130000_create_event_organizers.sql` |
| 7–8 | Dipendenze | `events`; `event_editions` (scope nullable); `profiles`; `businesses` |
| 9–12 | Colonne | Physical §10.1 (10 colonne) |
| 13 | PK | `id uuid` |
| 14–16 | FK | event **CASCADE**; edition **CASCADE**; person **SET NULL**; business **SET NULL** |
| 17–18 | UNIQUE | nessuno globale obbligatorio |
| 19 | CHECK | role_kind set; almeno un soggetto (person XOR business, o display_label; label può coesistere con uno dei FK); sort_order≥0 |
| 20–21 | Indici | `(event_id)`; partial `(event_edition_id)` WHERE NOT NULL |
| 22–28 | Trigger/RLS/privilegi | Pattern comune |
| 29–34 | COMMENT/seed/test | coerenza edition∈event applicativa; nessuna FK Organizzazioni |

**Organizzatore primario** = `events.owner_*` (nessuna riga obbligatoria in questa tabella).

### M4.2 — `event_speakers`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M4.2 · `event_speakers` · `20260806140000` · `20260806140000_create_event_speakers.sql` |
| 7–8 | Dipendenze | `event_editions`; `event_sessions` (nullable); `profiles`; `professional_profiles` |
| 9–12 | Colonne | Physical §11.1 (10 colonne) |
| 13 | PK | `id uuid` |
| 14–16 | FK | edition **CASCADE**; session **CASCADE**; person **SET NULL**; professional_profile **SET NULL** |
| 17–18 | UNIQUE | parziale `(event_edition_id, event_session_id, person_id, role_kind)` WHERE `person_id IS NOT NULL` |
| 19 | CHECK | role_kind ∈ speaker/moderator/facilitator/trainer; ≥1 tra person/professional_profile/display_label; sort_order≥0 |
| 20–21 | Indici | `(event_edition_id)`; partial session; partial person |
| 22–34 | Pattern comune + test label-only / professional_profile / CASCADE |

---

## 14. M5 — Lingue, Mercati, Iscrizioni

### M5.1 — `event_languages`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M5.1 · `event_languages` · `20260806150000` · `20260806150000_create_event_languages.sql` |
| 7–8 | Dipendenze | `events`; `languages` (**bigint**) |
| 9–12 | Colonne | Physical §15 |
| 13 | PK | `id uuid` |
| 14–16 | FK | event **CASCADE**; language_id → `languages(id)` **RESTRICT** |
| 17–18 | UNIQUE | `(event_id, language_id, usage_role)`; UNIQUE parziale `(event_id)` WHERE `is_primary` |
| 19 | CHECK | usage_role ∈ (`event`,`materials`,`interpretation`); sort_order≥0 |
| 20–34 | Indici `(event_id)`, `(language_id)`; pattern RLS; seed 0; test primary unica + RESTRICT |

### M5.2 — `event_markets`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M5.2 · `event_markets` · `20260806160000` · `20260806160000_create_event_markets.sql` |
| 7–8 | Dipendenze | `events`; `international_markets` (uuid) |
| 9–12 | Colonne | Physical §23.1 |
| 13 | PK | `id uuid` |
| 14–16 | FK | event **CASCADE**; market **RESTRICT** |
| 17–18 | UNIQUE | `(event_id, market_id)` |
| 19 | CHECK | relation_kind ∈ (`focus`,`related`,`destination`); sort_order≥0 |
| 20–34 | Indici event/market; pattern RLS; seed 0; test CASCADE/RESTRICT |

### M5.3 — `event_registrations`

| # | Voce | Prescrizione |
|---|---|---|
| 1–6 | Identità | M5.3 · `event_registrations` · `20260806170000` · `20260806170000_create_event_registrations.sql` |
| 7–8 | Dipendenze | `event_editions`; `profiles`; `businesses` |
| 9–12 | Colonne | Physical §12.1 (11 colonne) |
| 13 | PK | `id uuid` |
| 14–16 | FK | edition **CASCADE**; participant_person **RESTRICT**; on_behalf_business **SET NULL** |
| 17–18 | UNIQUE parziale | `(event_edition_id, participant_person_id)` WHERE `registration_status <> 'cancelled'` |
| 19 | CHECK | status ∈ submitted/confirmed/cancelled; cancelled_at gate; blank-guards note/source |
| 20–21 | Indici | `(event_edition_id)`; `(participant_person_id)`; unique parziale attiva |
| 22–28 | Trigger/RLS/privilegi | Pattern comune |
| 29–30 | COMMENT / seed | on_behalf_business_id; seed 0 |
| 31–34 | Test ROLLBACK iscrizioni; **niente** check-in/lista/biglietto/pagamento |

**Criterio chiusura M5 / SQL strutturale:** 9/9 tabelle presenti dopo apply cumulativo.

---

## 15. M6 — Assente

**Decisione:** blocco **assente**.
Nessuna unità relazioni residue, FEV, matching, allegati o comment-only. Non inventare M6.

---

## 16. M7 — Assente

**Decisione:** blocco **assente**.
COMMENT/RLS/REVOKE sono responsabilità di **ogni** unità M1–M5. Nessuna migration comment-only artificiale.

---

## 17. M8 — Chiusura

### M8.1 — Seed dimostrativi

**SKIP.** Nessun seed demo di Eventi/Edizioni/Iscrizioni. Seed normativo solo M1.1.

### M8.2 — Validazione finale (non SQL)

File futuro: `docs/architecture/migrations/eventi-validation-report.md`

Deve verificare:

* 9 migration Eventi in history locale e remota;
* 9 tabelle presenti locale=remoto;
* matrice Logical → Physical → Plan → SQL;
* history head attesa `20260806170000`;
* seed `event_types` = 10;
* RLS 9/9; FORCE false; policy 0;
* privilegi: REVOKE; GRANT applicativi 0;
* COMMENT TABLE 9/9;
* drift 0 rispetto agli hash SQL;
* assenza oggetti vietati;
* chiusura ciclo 1 Eventi con esito `ACCETTATA` / `NON ACCETTATA`.

---

## 18. Timestamp

| Verifica | Esito |
|---|---|
| > `20260805190000` | Sì |
| Univoci | 9 valori |
| Crescenti | Sì (`090000`…`170000`) |
| Collisioni `20260806*` | Nessuna al Plan |
| Calendar-valid | 2026-08-06 slot orari |

Assegnazione:

| Unità | Timestamp |
|---|---|
| M1.1 | `20260806090000` |
| M2.1 | `20260806100000` |
| M3.1 | `20260806110000` |
| M3.2 | `20260806120000` |
| M4.1 | `20260806130000` |
| M4.2 | `20260806140000` |
| M5.1 | `20260806150000` |
| M5.2 | `20260806160000` |
| M5.3 | `20260806170000` |

---

## 19. Naming migration

Pattern: `{timestamp}_create_{table}.sql` (inglese).

Nomi futuri esatti:

* `20260806090000_create_event_types.sql`
* `20260806100000_create_events.sql`
* `20260806110000_create_event_editions.sql`
* `20260806120000_create_event_sessions.sql`
* `20260806130000_create_event_organizers.sql`
* `20260806140000_create_event_speakers.sql`
* `20260806150000_create_event_languages.sql`
* `20260806160000_create_event_markets.sql`
* `20260806170000_create_event_registrations.sql`

Funzioni: `set_event_*_updated_at` (abbreviare se >63 byte).
Trigger: `{table}_set_updated_at`.
Constraint: prefissi corti coerenti (`events_…`, `event_editions_…`, …).

---

## 20. Contratti unitari (sintesi operativa)

Ogni unità M1.1–M5.3 realizza integralmente il contratto Physical della rispettiva tabella (§§7–15, §23) più:

| Voce | Prescrizione |
|---|---|
| Schema | `public` |
| PK | uuid default / catalogo `code` |
| updated_at | funzione dedicata INVOKER + `search_path=''` + BEFORE UPDATE |
| RLS | ENABLE; FORCE false; 0 policy |
| Privilegi | REVOKE ALL da PUBLIC, anon, authenticated; no GRANT |
| COMMENT | TABLE + colonne ambigue + FUNCTION |
| Vietato | IF NOT EXISTS; DO; SQL dinamico; JSONB modellante; ENUM PG; policy; GRANT; seed demo AR; RRULE; ticketing |

Dettaglio colonnare/CHECK/FK: **riferimento normativo** alle sezioni Physical citate in M1–M5.

---

## 21. Seed

| Tabella | Righe | Contenuto |
|---|---|---|
| `event_types` | **10** | Physical §14 / Plan §10 |
| Altre 8 tabelle | **0** | Nessun seed demo |

Nessuna riga inventata oltre Physical §14.

---

## 22. RLS e privilegi

Per tutte le **9** tabelle (incluso catalogo):

* `ENABLE ROW LEVEL SECURITY`
* FORCE RLS **false**
* **zero** policy
* `REVOKE ALL` da `PUBLIC`, `anon`, `authenticated`
* nessun GRANT applicativo
* non alterare impropriamente `service_role` / `postgres`

---

## 23. Test statici

Per ogni unità pre-apply:

* nome file + timestamp coerenti Plan;
* un solo `CREATE TABLE`;
* colonne/ordine/tipi/null/default = Physical;
* PK/FK/ON DELETE/ON UPDATE;
* CHECK/UNIQUE/UNIQUE parziali;
* indici / indici parziali;
* trigger + funzione updated_at;
* RLS + REVOKE + COMMENT;
* seed solo M1.1;
* assenza SQL vietato;
* identificatori ≤63 byte;
* nessuna modifica migration precedenti (Servizi e altri).

---

## 24. Test runtime (ROLLBACK)

Eseguire in una o più transazioni `BEGIN`…`ROLLBACK` dopo apply locale cumulativo:

1. Seed catalogo COUNT=10; UNIQUE code; updated_at.
2. Owner XOR Persona/Impresa; rifiuto nessuno/entrambi.
3. Publication gates (ready/published_at/withdrawn).
4. Invariante applicativa published ⇒ ≥1 edizione (assert applicativo).
5. Edizioni: tempo, timezone, all_day, modality luogo/link, capacity, stati, cancelled gate, previous_starts_at.
6. Sessioni 0..N; UNIQUE sort_order; override delivery; CASCADE da edizione.
7. Organizzatori: label-only; XOR person/business; CASCADE.
8. Relatori: professional_profile; label-only; UNIQUE parziale person; CASCADE.
9. Lingue bigint; primary unica; RESTRICT delete language.
10. Markets RESTRICT; CASCADE da Evento.
11. Iscrizioni submitted→confirmed→cancelled; UNIQUE parziale attiva; RESTRICT participant; CASCADE edition; on_behalf SET NULL.
12. SET NULL su context opportunity/service_offer.
13. RESTRICT delete owner con Evento esistente.
14. CASCADE delete Evento → edizioni/sessioni/ruoli/lingue/mercati.
15. RLS deny-by-default: anon/authenticated permission denied su tutte le 9.
16. Zero residui dopo ROLLBACK.

---

## 25. Apply locale

Modalità accelerata cumulativa:

1. Creare le **9** SQL
2. Controlli statici unitari rapidi
3. Review unica M1–M5
4. `supabase migration up --local`
5. `supabase migration list` (locale)
6. Query catalogo (9 tabelle/colonne/vincoli/seed)
7. Runtime ROLLBACK integrato
8. Hash SHA-256 dei 9 file documentati in review
9. Preparare commit unico

**Vietati:** reset; repair; SQL manuale; modifica history; `migration up --linked`.

---

## 26. Commit e push

| Regola | Prescrizione |
|---|---|
| Granularità | **Un** commit per le 9 migration SQL Eventi (ciclo cumulativo) |
| Push | Dopo smoke locale + review unica |
| Messaggio esempio | `feat(db): add events domain cycle 1 schema` |
| M8.2 | commit docs separato: `docs(db): close events cycle 1 validation` |
| Vietato | Commit SQL non reviewate; push senza apply locale |

Docs Logical/Physical/Plan possono essere committati insieme al SQL o in commit docs precedente, secondo decisione operativa al momento dell’apply — **non** in questa fase Plan.

---

## 27. Dry-run remoto

Dopo push Git delle 9 migration:

```
supabase db push --linked --dry-run
```

Review: esattamente le 9 migration Eventi attese; nessun repair; nessuna surprise.

**Vietato:** `--include-all`, `--include-seed`, `--db-url`, `repair`, `reset`.

---

## 28. Apply remoto

Sequenza:

1. `supabase db push --linked --dry-run`
2. Review delle 9 migration
3. `supabase db push --linked`
4. `supabase migration list --linked`
5. Controllo catalogale remoto (9 tabelle; seed 10; RLS/REVOKE)

**Vietato:** `migration up --linked` come comando preferito; flag vietati §27.

---

## 29. Post-check

* history locale/remota include `20260806090000`…`20260806170000`;
* 9 tabelle presenti;
* seed types = 10;
* RLS/FORCE/policy/privilegi conformi;
* COMMENT TABLE 9/9;
* zero policy; zero GRANT; zero dati demo AR;
* hash SQL invariati; nessuna modifica a Servizi/altri domini.

---

## 30. Recovery

| Evento | Azione |
|---|---|
| Review SQL fallita | Non apply; correggi SQL; nuova review unica |
| Apply locale fallito | Non commit; fix; non amend se hook fallisce dopo commit |
| Dry-run remoto inatteso | Non apply remoto; investiga |
| Drift locale/remoto | Stop; non M8.2 ACCETTATA |

**Stop point Plan (questo documento):** normalizzazione Logical UTF-8 + creazione Plan + review — **nessun SQL**.
**Stop point operativo futuro:** dopo apply remoto cumulativo + M8.2.

---

## 31. Confini

Il Plan conferma assenza di:

* ticketing, pagamenti, fatture, ordini;
* lista d’attesa, check-in, presenza effettiva;
* RRULE / calendari avanzati;
* FEV, recensioni, attestati;
* allegati / Storage / CMS;
* Organizzazioni AR;
* `auth.users` come owner;
* policy applicative Identità;
* FK `business_memberships`;
* assorbimento DV4 `training_*`.

---

## 32. Oggetti vietati

Tabelle/colonne per: invite, waitlist, ticket, payment, invoice, check-in, attendance, recurrence_rule, RRULE, FEV, ratings, certificates, attachments, storage, organizations AR, `owner_type`/`entity_id`, JSONB agenda, ENUM PG, IF NOT EXISTS, DO blocks, FORCE RLS true, GRANT anon/authenticated, seed demo AR, tabelle sedi, FK geografiche.

---

## 33. Criteri di chiusura

| Fase | Chiusura |
|---|---|
| Plan | Questo documento approvabile; 9 unità determinate |
| SQL cumulativo | 9 migration create/reviewate/apply locale/remoto |
| M8.1 | SKIP |
| M8.2 | Report `ACCETTATA` |

---

## 34. Validazione finale

Dominio chiudibile solo con:

* 9/9 tabelle;
* seed 10;
* RLS deny-by-default;
* matrice L/P/Plan/SQL coerente;
* report M8.2 `ACCETTATA`;
* working tree pulito post-commit report.

---

## 35. Report M8.2

Path: `docs/architecture/migrations/eventi-validation-report.md`

Struttura minima: esito; inventario 9; matrice L/P/Plan/SQL; history; seed; RLS; policy; privilegi; COMMENT; drift; confini; firma chiusura ciclo 1.

---

## 36. Matrice Logical / Physical / Plan

| Logical | Physical | Plan unit |
|---|---|---|
| TipologiaEvento | `event_types` | M1.1 |
| Evento (AR) | `events` | M2.1 |
| EdizioneEvento | `event_editions` | M3.1 |
| SessioneEvento | `event_sessions` | M3.2 |
| Co-organizzatore / sponsor / … | `event_organizers` | M4.1 |
| Relatore / moderatore / … | `event_speakers` | M4.2 |
| Lingua dell’Evento | `event_languages` | M5.1 |
| Mercato di riferimento | `event_markets` | M5.2 |
| IscrizioneEvento | `event_registrations` | M5.3 |
| Invito / ListaAttesa / Biglietto / FEV / RRULE | assenti | M6/M7 assenti; esclusi |

---

## 37. Decisioni rinviate

Come Physical §38 / Logical (rinviate): trigger invariante ≥1 Edizione; trigger coerenza edition_id organizers/speakers; lingue per Edizione/Sessione; presenza/check-in; inviti/liste; visibility oltre private/public; FEV; sedi/geocoding; consolidamento D27–D29. **Non bloccano** M1–M5.

---

## 38. Rischi

| Rischio | Mitigazione |
|---|---|
| Confusione con Servizi `in_person` | Token Eventi `in_presence`; COMMENT |
| Enforcement DDL published⇒edition | Documentato come applicativo; test runtime |
| Tipi language uuid vs bigint | Verifica §7; test statici |
| Ticketing/presence striscianti | Confini §31–§32; assenza colonne |
| Ordine apply ad-hoc | Sequenza Plan obbligatoria; apply cumulativo ordinato |
| FK Organizzazioni anticipate | Vietate; solo `display_label` / external label |

---

## 39. Stato roadmap

| Fase | Stato |
|---|---|
| Logical | Presente (UTF-8 normalizzato) |
| Physical | Presente (untracked al Plan) |
| Migration Plan | **Questo documento** |
| SQL M1–M5 (9 file) | Da creare in ciclo cumulativo |
| M8.2 | Da produrre a fine ciclo |

---

## 40. Stato finale

**Migration Plan Eventi completo e approvabile.**
9 unità SQL determinate; AR unico `events`; Edizioni/Sessioni owned; M6/M7 assenti; M8 non SQL.
**Prossima azione autorizzabile:** creazione contemporanea delle 9 migration SQL secondo questo Plan.
Nessun file `.sql` creato da questo documento.

---

## Checklist conclusiva

- [x] 9/9 tabelle → 9 unità
- [x] Timestamp univoci > `20260805190000`
- [x] AR unico (`events`)
- [x] Catalogo + seed esatto Physical (10)
- [x] M6/M7 assenti (non inventati)
- [x] M8.1 SKIP; M8.2 report path definito
- [x] Dipendenze senza cicli / senza FK future
- [x] Confini ticketing/RRULE/FEV/Storage/Org/Identità
- [x] Modalità accelerata cumulativa
- [x] Sufficiente per creare tutte le migration in un unico ciclo senza nuove decisioni
