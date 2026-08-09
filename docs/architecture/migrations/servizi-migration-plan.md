# Servizi — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica Logical né Physical.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/servizi.md`.
**Contratto logico vincolante:** `docs/architecture/logical/servizi.md`.

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Servizi** |
| Artefatto | Migration Plan ciclo 1 |
| HEAD di riferimento (pre-SQL) | `29ff527a0eb49e66520eace5a12fcda437de4ad4` |
| Ultima migration repository | `20260804240000` |
| SQL Servizi | **Assenti** (da creare dopo approvazione Plan) |
| Stato | **Chiuso per creazione accelerata M1** |

---

## 2. Scopo

Trasformare Logical e Physical in roadmap operativa completa del ciclo 1:

* blocchi M1–M8 (con assenze esplicite);
* 11 unità SQL (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* test statici/runtime, apply locale/remoto, Git, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. Il primo blocco autorizzabile è **M1 (cataloghi)**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/servizi.md` | Contratto DDL-ready |
| 2 | `logical/servizi.md` | Semantica |
| 3 | Migration Plan Professionisti / Imprese / Appartenenze / MI / Opportunità | Pattern operativi |
| 4 | Validation report finali dei domini chiusi | Criteri M8.2 |
| 5 | Migration SQL referenziate (profiles, businesses, …) | Tipi FK reali |
| 6 | `domain-dependency-map.md` | DV4 e confini |
| 7 | `domain-model.md` | Gate metodologico |
| 8 | PDS | Contesto storico secondario |

**Contraddizioni Logical ↔ Physical:** nessuna materiale rilevata. Plan creatibile.

---

## 4. Modalità accelerata

Per ogni blocco SQL (M1–M5) il workflow è:

1. determinazione completa del blocco (già in questo Plan);
2. creazione di **tutte** le migration del blocco;
3. review indipendente unica del blocco;
4. apply locale `supabase migration up --local` + runtime ROLLBACK;
5. commit + push del blocco;
6. dry-run remoto `supabase db push --linked --dry-run`;
7. apply remoto `supabase db push --linked`;
8. verifica finale catalogale locale/remoto.

**Una migration distinta per unità.** Nessun raggruppamento multi-tabella.

---

## 5. Prerequisiti

Prima di qualsiasi SQL Servizi:

| Prerequisito | Stato atteso |
|---|---|
| Branch `main` = `origin/main` | Allineato |
| Working tree | Solo docs Servizi (Logical/Physical/Plan) finché non si crea SQL |
| Dipendenze esterne presenti | `profiles`, `businesses`, `professional_profiles`, `professional_services`, `business_services`, `languages`, `business_sectors`, `international_markets`, `opportunities` |
| Head migration | ≥ `20260804240000` |
| Nessuna collision timestamp `20260805*` | Verificata al momento del Plan |

---

## 6. Inventario Physical

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `service_categories` | Catalogo | M1.1 |
| 2 | `service_economic_bands` | Catalogo | M1.2 |
| 3 | `service_offers` | AR Offerta | M2.1 |
| 4 | `service_offer_territories` | Owned | M3.1 |
| 5 | `service_offer_languages` | Owned | M3.2 |
| 6 | `service_offer_sectors` | Owned | M3.3 |
| 7 | `service_offer_markets` | Owned | M3.4 |
| 8 | `service_requests` | AR Richiesta | M4.1 |
| 9 | `service_request_territories` | Owned | M5.1 |
| 10 | `service_request_languages` | Owned | M5.2 |
| 11 | `service_request_sectors` | Owned | M5.3 |

**11/11 tabelle. Nessuna tabella extra.**

---

## 7. Dipendenze

### 7.1 Esterne (verificate)

| Target | PK tipo | Usata da | ON DELETE tipico |
|---|---|---|---|
| `profiles` | uuid | M2.1, M4.1 (owner/provider) | RESTRICT / SET NULL (provider) |
| `businesses` | uuid | M2.1, M4.1 | RESTRICT / SET NULL (provider) |
| `professional_profiles` | uuid | M2.1 provider | SET NULL |
| `professional_services` | uuid | M2.1 source | SET NULL |
| `business_services` | uuid | M2.1 source | SET NULL |
| `languages` | **bigint** | M3.2, M5.2 | RESTRICT |
| `business_sectors` | **bigint** | M3.3, M5.3 | RESTRICT |
| `international_markets` | uuid | M3.4 | RESTRICT |
| `opportunities` | uuid | M2.1, M4.1 context | SET NULL |

### 7.2 Interne

| Target | Usata da |
|---|---|
| `service_categories` | M2.1, M4.1 |
| `service_economic_bands` | M2.1, M4.1 |
| `service_offers` | M3.* |
| `service_requests` | M5.* |

### 7.3 Vietate

Organizzazioni, Eventi, Contenuti, Identità, `business_memberships`, DV4 (`language_service_*`, `profile_language_services`, `training_*`), `people`.

---

## 8. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL | Stop point |
|---|---|---|---|---|
| **M1** | Presente | Cataloghi + seed | M1.1, M1.2 | Dopo apply remoto M1 |
| **M2** | Presente | AR Offerta | M2.1 | Dopo apply remoto M2 |
| **M3** | Presente | Owned Offerta | M3.1–M3.4 | Dopo apply remoto M3 |
| **M4** | Presente | AR Richiesta | M4.1 | Dopo apply remoto M4 |
| **M5** | Presente | Owned Richiesta | M5.1–M5.3 | Dopo apply remoto M5 |
| **M6** | **Assente** | Nessuna relazione/FEV/matching | 0 | — |
| **M7** | **Assente** | Commenti/RLS già in ogni unità | 0 | — |
| **M8** | Presente (non SQL) | M8.1 SKIP demo; M8.2 report | 0 SQL | Chiusura ciclo 1 |

**Ordine globale:**
M1.1 → M1.2 → M2.1 → M3.1 → M3.2 → M3.3 → M3.4 → M4.1 → M5.1 → M5.2 → M5.3 → (M8.1 SKIP) → M8.2.

---

## 9. Matrice blocchi / unità

| Codice | Blocco | Tabella | Timestamp | File futuro |
|---|---|---|---|---|
| M1.1 | M1 | `service_categories` | `20260805090000` | `20260805090000_create_service_categories.sql` |
| M1.2 | M1 | `service_economic_bands` | `20260805100000` | `20260805100000_create_service_economic_bands.sql` |
| M2.1 | M2 | `service_offers` | `20260805110000` | `20260805110000_create_service_offers.sql` |
| M3.1 | M3 | `service_offer_territories` | `20260805120000` | `20260805120000_create_service_offer_territories.sql` |
| M3.2 | M3 | `service_offer_languages` | `20260805130000` | `20260805130000_create_service_offer_languages.sql` |
| M3.3 | M3 | `service_offer_sectors` | `20260805140000` | `20260805140000_create_service_offer_sectors.sql` |
| M3.4 | M3 | `service_offer_markets` | `20260805150000` | `20260805150000_create_service_offer_markets.sql` |
| M4.1 | M4 | `service_requests` | `20260805160000` | `20260805160000_create_service_requests.sql` |
| M5.1 | M5 | `service_request_territories` | `20260805170000` | `20260805170000_create_service_request_territories.sql` |
| M5.2 | M5 | `service_request_languages` | `20260805180000` | `20260805180000_create_service_request_languages.sql` |
| M5.3 | M5 | `service_request_sectors` | `20260805190000` | `20260805190000_create_service_request_sectors.sql` |
| M8.1 | M8 | — | — | **SKIP** (no SQL) |
| M8.2 | M8 | — | — | `docs/architecture/migrations/servizi-validation-report.md` |

**11 timestamp univoci**, strettamente crescenti, tutti > `20260804240000`, nessuna collisione `20260805*` al momento del Plan.

---

## 10. M1 — Cataloghi

**Responsabilità blocco.** Due cataloghi C03 con seed normativo; deny-by-default; nessuna dipendenza da altre tabelle Servizi.

**Regole comuni M1.** PK `code` text; colonne Physical §9; `set_*_updated_at` INVOKER + `search_path=''`; RLS ENABLE; FORCE false; 0 policy; REVOKE ALL PUBLIC/anon/authenticated; no GRANT; COMMENT; seed idempotente via `INSERT … ON CONFLICT (code) DO NOTHING` **oppure** insert puro se pattern repo cataloghi recenti senza ON CONFLICT — **prescrizione:** seguire lo stile seed dei cataloghi Professionisti M1 (insert espliciti; re-apply gestito da history migration, non da upsert obbligatorio). Conteggio post-apply = seed atteso.

### M1.1 — `service_categories`

| Campo | Valore |
|---|---|
| Codice | M1.1 |
| Timestamp | `20260805090000` |
| File | `20260805090000_create_service_categories.sql` |
| Dipendenze | Nessuna tabella Servizi |
| Colonne | Physical §9.1 (`code`, `name_it`, `description`, `is_active`, `sort_order`, timestamps) |
| PK | `code` |
| FK | nessuna |
| CHECK | code/name non blank; `sort_order >= 0` |
| Seed | **6** righe: `linguistic`, `training`, `professional_generic`, `financial`, `real_estate`, `support_other` (sort 10/20/30/40/50/90) |
| Test statici | CREATE; PK; seed codes; RLS; REVOKE; COMMENT; no IF NOT EXISTS |
| Test runtime | COUNT=6; UNIQUE code; UPDATE updated_at; SELECT anon negato |
| Stop point | Fine unità; blocco chiude dopo M1.2 |

### M1.2 — `service_economic_bands`

| Campo | Valore |
|---|---|
| Codice | M1.2 |
| Timestamp | `20260805100000` |
| File | `20260805100000_create_service_economic_bands.sql` |
| Dipendenze | Nessuna |
| Colonne | Physical §9.2 |
| Seed | **4** righe: `low`, `medium`, `high`, `variable` (sort 10/20/30/40) |
| Test runtime | COUNT=4; RESTRICT futuro da AR (verificato in M2) |

**Criterio chiusura M1:** entrambe le tabelle locali=remote; seed 6+4; RLS 2/2; policy 0; grants 0.

---

## 11. M2 — Offerta (`service_offers`)

### M2.1 — Aggregate root Offerta

| Campo | Valore |
|---|---|
| Codice | M2.1 |
| Timestamp | `20260805110000` |
| File | `20260805110000_create_service_offers.sql` |
| Prerequisiti | M1.1, M1.2; esterni §7.1 |
| Colonne | Physical §7.1 (ordine 1–32) |
| PK | `id` uuid `gen_random_uuid()` |
| FK | Physical §7.2 (owner RESTRICT; provider/source/context SET NULL; category/band RESTRICT+UPDATE CASCADE su code) |
| CHECK | Owner XOR; provider ≤1; source XOR; economic band condizionale; publication gates; vocabolari §7.2 |
| UNIQUE | nessuno su title |
| Indici | Physical §23 (owner partial, category, publication, availability, archived) |
| Trigger | `set_service_offers_updated_at` + `service_offers_set_updated_at` |
| RLS / privilegi | Pattern comune §22 |
| Seed | **Assente** |
| Esclusi | amount/payment/order/calendar/JSONB/`membership_id`/`owner_type` |

**Test runtime (ROLLBACK):** owner XOR ok/fail; due provider fail; due source fail; indicative_band senza code fail; publish senza ready/published_at fail; delete owner RESTRICT; delete professional_service → source NULL; updated_at avanza.

**Stop point:** dopo apply remoto M2.

---

## 12. M3 — Owned Offerta

**Regole comuni M3.** PK uuid; FK `service_offer_id` CASCADE; timestamps; trigger updated_at; RLS deny-by-default; no seed; ≠ tabelle M5 Professionisti.

### M3.1 — `service_offer_territories`

| Campo | Valore |
|---|---|
| Timestamp / file | `20260805120000_create_service_offer_territories.sql` |
| Colonne | Physical §13 |
| UNIQUE | `(service_offer_id, country_ref, coverage_kind)` |
| CHECK | country_ref non blank; coverage/presence vocab; sort_order≥0 |
| FK esterne | nessuna geografica |
| Runtime | CASCADE delete offer; UNIQUE duplicato fail |

### M3.2 — `service_offer_languages`

| Campo | Valore |
|---|---|
| Timestamp / file | `20260805130000_create_service_offer_languages.sql` |
| Colonne | Physical §15 |
| FK | `language_id` **bigint** → `languages` RESTRICT |
| UNIQUE | `(service_offer_id, language_id, usage_role)` |
| CHECK | usage_role ∈ delivery\|source\|target\|support |
| Runtime | language inesistente fail; ≠ professional_operational_languages |

### M3.3 — `service_offer_sectors`

| Campo | Valore |
|---|---|
| Timestamp / file | `20260805140000_create_service_offer_sectors.sql` |
| Colonne | Physical §17 |
| FK | `sector_id` **bigint** → `business_sectors` RESTRICT |
| UNIQUE | `(service_offer_id, sector_id)` |

### M3.4 — `service_offer_markets`

| Campo | Valore |
|---|---|
| Timestamp / file | `20260805150000_create_service_offer_markets.sql` |
| Colonne | Physical §22.1 |
| FK | `market_id` uuid → `international_markets` RESTRICT |
| UNIQUE | `(service_offer_id, market_id)` |
| CHECK | relation_kind ∈ served\|supported\|target |

**Criterio chiusura M3:** 4 tabelle; CASCADE; tipi bigint/uuid corretti; nessuna duplicazione M5 Professionisti.

---

## 13. M4 — Richiesta (`service_requests`)

### M4.1 — Aggregate root Richiesta

| Campo | Valore |
|---|---|
| Timestamp / file | `20260805160000_create_service_requests.sql` |
| Prerequisiti | M1.1, M1.2 (non richiede M2/M3 per DDL; ordine Plan dopo M3 per sequenza prodotto) |
| Colonne | Physical §8.1 |
| Owner XOR | come Offerta |
| Assenti | provider_*; source_*; availability_status; matching; candidatura |
| Presenti | `process_status`, `urgency_kind`, `expires_at`, context_opportunity facoltativo SET NULL |
| CHECK | Physical §8.2 + publication gates |
| Seed | Assente |

**Nota ordine:** topologia DDL consente M4 subito dopo M1; il Plan impone M4 dopo M3 per allineamento prodotto (Offerta completa prima della Richiesta). Nessuna dipendenza circolare.

**Test runtime:** owner XOR; process_status vocab; publish gates; nessuna colonna matching; updated_at.

---

## 14. M5 — Owned Richiesta

### M5.1 — `service_request_territories`

`20260805170000_create_service_request_territories.sql` — gemello M3.1 con `service_request_id` CASCADE (Physical §14).

### M5.2 — `service_request_languages`

`20260805180000_create_service_request_languages.sql` — gemello M3.2; `language_id` bigint RESTRICT (Physical §16).

### M5.3 — `service_request_sectors`

`20260805190000_create_service_request_sectors.sql` — gemello M3.3; `sector_id` bigint RESTRICT.

**Assente in M5:** `service_request_markets` (Physical: mercati solo Offerta ciclo 1).

**Criterio chiusura M5:** 3 tabelle; CASCADE; tipi corretti; ciclo SQL strutturale completo (11/11).

---

## 15. M6 — Assente

**Decisione:** blocco **assente**.
FEV, recensioni, matching, allegati, marketplace **non** costituiscono M6. Nessuna migration comment-only. Nessuna unità “relazioni residue” (già su AR/owned).

---

## 16. M7 — Assente

**Decisione:** blocco **assente** (pattern Professionisti).
COMMENT/RLS/REVOKE sono responsabilità di **ogni** unità M1–M5. Nessuna migration comment-only.

---

## 17. M8 — Chiusura

### M8.1 — Seed demo

**SKIP.** Nessun seed dimostrativo di Offerte/Richieste. Seed normativo solo M1.

### M8.2 — Validazione finale (non SQL)

File futuro: `docs/architecture/migrations/servizi-validation-report.md`

Deve includere:

* esito `ACCETTATA` / `NON ACCETTATA`;
* inventario 11 tabelle locale=remoto;
* matrice Logical → Physical → Plan → SQL;
* history head attesa `20260805190000`;
* seed 6+4;
* RLS 11/11; policy 0; grants PUBLIC/anon/authenticated 0;
* COMMENT TABLE 11/11;
* drift 0;
* conferma esclusioni §31–§32;
* chiusura dominio ciclo 1.

---

## 18. Timestamp

| Verifica | Esito |
|---|---|
| > `20260804240000` | Sì |
| Univoci | 11 valori |
| Crescenti | Sì (090000…190000) |
| Collisioni `20260805*` | Nessuna al Plan |
| Calendar-valid | 2026-08-05 slot orari |

---

## 19. Naming migration

Pattern: `{timestamp}_create_{table}.sql` (inglese).
Funzioni: `set_service_*_updated_at` (abbreviare se >63 byte, es. `set_svc_offer_territories_updated_at`).
Trigger: `{table}_set_updated_at`.
Constraint: prefissi corti coerenti (`svc_offers_…`, `svc_req_…`).

---

## 20. Contratti unitari (sintesi operativa)

Ogni unità M1.1–M5.3 deve realizzare integralmente il contratto Physical della rispettiva tabella (§§7–17, §22.1) più le regole comuni:

| Voce | Prescrizione |
|---|---|
| Schema | `public` |
| PK | uuid default / cataloghi `code` |
| updated_at | funzione dedicata INVOKER + search_path vuoto + BEFORE UPDATE |
| RLS | ENABLE; FORCE false; 0 policy |
| Privilegi | REVOKE ALL da PUBLIC, anon, authenticated; no GRANT |
| COMMENT | TABLE + colonne ambigue + FUNCTION |
| Vietato | IF NOT EXISTS; DO; SQL dinamico; JSONB; ENUM; policy; GRANT; seed demo AR |

Dettaglio colonnare/CHECK/FK: **riferimento normativo** alle sezioni Physical citate in M1–M5; il SQL non può discostarsene.

---

## 21. Seed

| Tabella | Righe | Codici |
|---|---|---|
| `service_categories` | 6 | linguistic, training, professional_generic, financial, real_estate, support_other |
| `service_economic_bands` | 4 | low, medium, high, variable |
| Altre | 0 | — |

Nessuna riga inventata oltre Physical §9.

---

## 22. RLS e privilegi

Per tutte le 11 tabelle:

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
* CHECK/UNIQUE/indici;
* trigger + funzione;
* RLS + REVOKE + COMMENT;
* seed solo M1;
* assenza SQL vietato;
* identificatori ≤63 byte;
* nessuna modifica migration precedenti.

---

## 24. Test runtime (ROLLBACK)

**Cataloghi:** COUNT seed; UNIQUE; updated_at; deny anon.

**Offerta:** owner XOR; provider ≤1; source XOR; economic gate; publication gate; visibility; CASCADE owned; SET NULL source; RESTRICT owner; updated_at.

**Owned Offerta:** FK; UNIQUE; CHECK; CASCADE; RESTRICT languages/sectors/markets.

**Richiesta:** owner XOR; process/publication; economy; no matching columns; updated_at.

**Owned Richiesta:** analoghi M3 senza markets.

**RLS:** SELECT/INSERT anon e authenticated negati; policy count 0.

**ROLLBACK:** zero residui di test.

---

## 25. Apply locale

Per blocco (modalità accelerata):

1. Creare tutte le SQL del blocco
2. Review unica
3. `supabase migration up --local`
4. Verifica `supabase migration list` (locale)
5. Query catalogo (tabelle/colonne/vincoli)
6. Runtime ROLLBACK
7. Hash file SQL (SHA-256) documentati in review
8. Preparare commit

**No reset** se lo stack locale è già operativo. **No** `migration up --linked`.

---

## 26. Commit e push

| Regola | Prescrizione |
|---|---|
| Granularità | Un commit per blocco SQL approvato (M1…M5) |
| Push | Dopo smoke locale + review |
| Messaggi esempio | `feat(db): add services block M1 catalogs` · `… M2 offers` · `… M3 offer coverage` · `… M4 requests` · `… M5 request coverage` |
| M8.2 | `docs(db): close services cycle 1 validation` |
| Vietato | Commit SQL non reviewate; push senza apply locale |

---

## 27. Dry-run remoto

Dopo push Git del blocco:

```
supabase db push --linked --dry-run
```

Review output: sole migration del blocco attese; nessun repair; nessuna surprise.

**Vietato:** `--include-all`, `--include-seed`, `--db-url`, `repair`, `reset`.

---

## 28. Apply remoto

```
supabase db push --linked
```

Poi: `supabase migration list`; controllo catalogale remoto; confronto locale/remoto; chiusura blocco.

---

## 29. Verifica post-apply (per blocco)

* history contiene timestamp del blocco;
* tabelle del blocco presenti;
* seed (solo M1);
* RLS/policy/grants;
* COMMENT;
* assenza oggetti §32.

---

## 30. Recovery e stop

| Evento | Azione |
|---|---|
| Review SQL fallita | Non apply; correggi SQL; nuova review |
| Apply locale fallito | Non commit; fix; non amend se hook fallisce dopo commit |
| Dry-run remoto inatteso | Non push apply; investiga |
| Drift locale/remoto | Stop; non procedere blocco successivo |

**Stop point Plan (questo documento):** creazione Plan + review — **nessun SQL**.
**Stop point operativi futuri:** fine M1, M2, M3, M4, M5, M8.2.

---

## 31. Confini

* `professional_services` / `business_services` **non** sostituite; solo source facoltativo SET NULL
* DV4 **non** assorbita
* Opportunità **non** duplicata (solo context SET NULL)
* Eventi / Contenuti / Organizzazioni / Identità **non** anticipate
* Marketplace, pagamenti, matching, recensioni, FEV, storage, prenotazioni **esclusi**

---

## 32. Oggetti vietati

Tabelle/colonne per: FEV, ratings, attachments, orders, payments, bookings, calendars, candidature, matching, `owner_type`, JSONB payload, `membership_id`, seed demo AR, policy/GRANT, IF NOT EXISTS, DO blocks, ENUM types, tabelle `service_request_markets`, verticali specializzati, DV4.

---

## 33. Criteri di chiusura blocchi

| Blocco | Chiusura |
|---|---|
| M1 | 2 tabelle; seed 6+4; RLS/REVOKE; remoto ok |
| M2 | AR offers; XOR/CHECK; remoto ok |
| M3 | 4 owned; CASCADE; tipi FK; remoto ok |
| M4 | AR requests; no matching; remoto ok |
| M5 | 3 owned; 11/11 tabelle; remoto ok |
| M8 | Report ACCETTATA |

---

## 34. Criteri di validazione finale

Vedi M8.2 §17. Dominio chiudibile solo con esito `ACCETTATA` e working tree pulito post-commit report.

---

## 35. Report M8.2

Path: `docs/architecture/migrations/servizi-validation-report.md`
Struttura minima: esito; inventario; matrice L/P/Plan/SQL; history; seed; RLS; policy; privilegi; COMMENT; drift; confini; firma chiusura.

---

## 36. Matrice Logical / Physical / Plan

| Logical | Physical | Plan unit |
|---|---|---|
| Categoria verticale | `service_categories` | M1.1 |
| Fascia economica | `service_economic_bands` | M1.2 |
| OffertaDiServizio | `service_offers` | M2.1 |
| Area/lingue/settori/mercati Offerta | owned offer_* | M3.1–M3.4 |
| RichiestaDiServizio | `service_requests` | M4.1 |
| Area/lingue/settori Richiesta | owned request_* | M5.1–M5.3 |
| FEV / matching / marketplace | assenti | M6/M7 assenti; esclusi |

---

## 37. Decisioni rinviate

Come Physical §37 / Logical §37: policy Identità; soft-remove territories; pair_group CHECK; mercati su Richiesta; DV4; FEV futuro; membership FK; attributi verticali profondi. **Non bloccano** M1–M5.

---

## 38. Rischi

| Rischio | Mitigazione |
|---|---|
| Confusione con `professional_services` | COMMENT + confini §31; source SET NULL |
| Assorbimento DV4 | Esclusione esplicita; nessuna FK |
| Tipi language/sector sbagliati (uuid vs bigint) | Verifica §7; test statici |
| Marketplace strisciante | CHECK economy; assenza tabelle order |
| Ordine M4 prima di M3 in apply ad-hoc | Plan impone sequenza; non applicare fuori ordine |

---

## 39. Stato roadmap

| Fase | Stato |
|---|---|
| Logical | Creato (untracked al Plan) |
| Physical | Creato (untracked al Plan) |
| Migration Plan | **Questo documento** |
| SQL M1–M5 | Da creare |
| M8.2 | Da produrre a fine ciclo |

---

## 40. Stato finale

**Migration Plan Servizi completo e approvabile.**
11 unità SQL determinate; M6/M7 assenti; M8 non SQL.
**Primo blocco autorizzabile: M1 (M1.1 + M1.2).**
Nessun file `.sql` creato da questo documento.

---

## Checklist conclusiva

- [x] 11/11 tabelle → 11 unità
- [x] Timestamp univoci > `20260804240000`
- [x] Due AR separate (M2, M4)
- [x] Cataloghi + seed esatti Physical
- [x] M6/M7 assenti (non inventati)
- [x] M8.1 SKIP; M8.2 report path definito
- [x] Dipendenze senza cicli
- [x] Confini DV4/Professionisti/Imprese/Opportunità
- [x] Modalità accelerata
- [x] Sufficiente per iniziare M1 senza nuove decisioni

---

## C3 Cultural Taxonomy Enrichment (addendum)

**Hybrid C.** Cultura ≠ BC. `linguistic` ≠ cultura.

| Unit | File | Responsabilità |
|---|---|---|
| **C3.4** (parte servizi) | `20260813130000_seed_cultural_content_service_categories.sql` | Seed `service_categories.cultural_creative` |

C3.7 deferred.
