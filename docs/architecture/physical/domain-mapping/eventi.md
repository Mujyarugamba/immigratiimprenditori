# Physical Domain Mapping — Dominio EVENTI

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/eventi.md`.
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository.
> **Non** crea migration SQL, **non** esegue apply, **non** modifica lo schema.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine).

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Eventi** |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/eventi.md` (chiuso per Physical) |
| Stato | **Chiuso per Migration Plan** (salvo §38) |
| Ciclo | Ciclo 1 |
| Migration Plan / SQL | **Fuori da questo documento** |

---

## 2. Scopo

Tradurre l’Aggregate Root **Evento** e le entity owned **EdizioneEvento**, **SessioneEvento**, ruoli organizzativi/relatori, **IscrizioneEvento** e lingue in un modello relazionale `public` con ownership Persona|Impresa, lifecycle multi-asse, tempo/fuso su Edizione, ricorrenza come più Edizioni (senza RRULE), senza ticketing, pagamenti, FEV, Storage, Organizzazioni o Identità.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/eventi.md` | Autorità semantica |
| `domain-model.md`, `reconciliation-report.md`, `domain-dependency-map.md` (D24–D29) | Gate, ownership Evento–Edizione–Sessione, dipendenze |
| Physical/migration Persone, Imprese, Appartenenze, MI, Professionisti, Opportunità, Servizi | Pattern e FK reali |
| Migration SQL esistenti | Verifica tipi/PK (non autorità semantica) |
| PDS §§15–16 | Sketch storico; non contratto |
| `logical/servizi.md` §23, `contenuti-editoriali.md`, Organizzazioni (futuro) | Confini |

---

## 4. Principi di mapping

1. Unico AR fisico `events`; Edizione/Sessione/Iscrizione/ruoli/lingue sono owned, non AR.
2. Titolare = esattamente una tra Persona (`profiles`) e Impresa (`businesses`) via FK reali + CHECK XOR.
3. Nessun `owner_type` / `entity_id` senza FK; nessun JSONB modellante; nessun ENUM PostgreSQL.
4. Organizzatore primario ciclo 1 = titolare AR; co-ruoli in tabella owned con FK reali o etichetta opaca.
5. Relatori: FK a `profiles` e/o `professional_profiles` e/o `display_label` (almeno uno); nessun polimorfismo.
6. Tempo e fuso su **Edizione**; Sessioni con finestra propria; coerenza Sessione ⊆ Edizione = **vincolo applicativo** (non trigger cross-table ciclo 1).
7. Invariante “Evento pubblicato ⇒ ≥1 Edizione con Periodo” = **criterio di pubblicazione / vincolo applicativo** (non garantibile da CHECK single-table senza trigger vietati).
8. Lingue → `languages(id)` **bigint**; mercati facoltativi → `international_markets(id)` **uuid**.
9. Modalità Logical: `in_presence` \| `online` \| `hybrid` (non allineare forzatamente a `in_person` di Servizi).
10. RLS ENABLE, FORCE false, zero policy, REVOKE ALL da PUBLIC/anon/authenticated.
11. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE.
12. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico.
13. Persona = `public.profiles`. Appartenenze: nessuna FK ciclo 1 (D28 utilizzo applicativo).
14. Contatori iscritti/posti = **derivati**, non colonne persistite.

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `event_types` | Catalogo C03 | Dominio Eventi |
| 2 | `events` | Aggregate Root | Dominio Eventi |
| 3 | `event_editions` | Entity owned | `events` |
| 4 | `event_sessions` | Entity owned | `event_editions` |
| 5 | `event_organizers` | Entity owned / ruolo | `events` (scope Edizione facoltativo) |
| 6 | `event_speakers` | Entity owned / ruolo | `event_editions` (Sessione facoltativa) |
| 7 | `event_languages` | Entity owned / link | `events` |
| 8 | `event_markets` | Entity owned / link | `events` |
| 9 | `event_registrations` | Entity owned | `event_editions` |

**Totale ciclo 1: 9 tabelle.**

---

## 6. Dipendenze esterne (verifica concreta)

| Target | Migration origine | PK | Tipo PK | Uso Eventi | ON DELETE tipico |
|---|---|---|---|---|---|
| `public.profiles` | `20260718103949_create_profiles_table.sql` | `id` | **uuid** | Titolare, organizzatore, relatore, partecipante | RESTRICT (titolare/partecipante); SET NULL (ruoli facoltativi) |
| `public.businesses` | `20260731070000_create_businesses_core.sql` | `id` | **uuid** | Titolare, organizzatore, on-behalf | RESTRICT / SET NULL |
| `public.professional_profiles` | `20260804090000_create_professional_profiles.sql` | `id` | **uuid** | Relatore facoltativo (D26) | SET NULL |
| `public.languages` | `20260718112212_create_languages_table.sql` | `id` | **bigint** identity | Lingue Evento | RESTRICT |
| `public.international_markets` | `20260802090000_create_international_markets.sql` | `id` | **uuid** | Contesto mercato (D29) | RESTRICT |
| `public.opportunities` | `20260720225301_create_opportunities_core.sql` | `id` | **uuid** | Contesto Opportunità (D27) | SET NULL |
| `public.service_offers` | `20260805110000_create_service_offers.sql` | `id` | **uuid** | Contesto OffertaDiServizio | SET NULL |

**Non usate nel ciclo 1:** `business_memberships`; `service_requests`; `service_categories`; cataloghi Opportunità; DV4 `training_*`; Organizzazioni; `auth.users` come owner; Contenuti.

---

## 7. Aggregate root Evento — `events`

**Responsabilità.** Scheda radice dell’iniziativa (Evento), indipendente dalle Edizioni.

**Identità.** `id uuid PK DEFAULT gen_random_uuid()`.

### 7.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `owner_person_id` | `uuid` | SÌ | — | XOR Impresa |
| 3 | `owner_business_id` | `uuid` | SÌ | — | XOR Persona |
| 4 | `type_code` | `text` | NO | — | FK `event_types` |
| 5 | `title` | `text` | NO | — | Non blank |
| 6 | `summary` | `text` | SÌ | — | Sintesi |
| 7 | `description` | `text` | NO | — | Descrizione sostanziale; non blank |
| 8 | `delivery_mode` | `text` | NO | `'in_presence'` | Default tipologico; Edizione può rifinire |
| 9 | `audience_kind` | `text` | NO | `'both'` | persons \| businesses \| both |
| 10 | `audience_note` | `text` | SÌ | — | Nota libera |
| 11 | `nature_label` | `text` | SÌ | — | Affinamento tipologico testuale |
| 12 | `economic_kind` | `text` | NO | `'unspecified'` | free \| paid \| unspecified — **senza importi** |
| 13 | `economic_note` | `text` | SÌ | — | Nota descrittiva |
| 14 | `context_opportunity_id` | `uuid` | SÌ | — | Contesto Opportunità |
| 15 | `context_service_offer_id` | `uuid` | SÌ | — | Contesto OffertaDiServizio |
| 16 | `external_organization_label` | `text` | SÌ | — | Ente esterno informativo |
| 17 | `editorial_status` | `text` | NO | `'draft'` | Asse redazione |
| 18 | `publication_status` | `text` | NO | `'unpublished'` | Asse pubblicazione |
| 19 | `visibility_status` | `text` | NO | `'private'` | private \| public |
| 20 | `published_at` | `timestamptz` | SÌ | — | Metadato pubblicazione |
| 21 | `withdrawn_at` | `timestamptz` | SÌ | — | Metadato ritiro |
| 22 | `archived_at` | `timestamptz` | SÌ | — | NULL = corrente |
| 23 | `created_at` | `timestamptz` | NO | `now()` | |
| 24 | `updated_at` | `timestamptz` | NO | `now()` | |

### 7.2 Vincoli

**PK:** `events_pkey (id)`.

**FK:**

| Colonna | Target | ON UPDATE | ON DELETE |
|---|---|---|---|
| `owner_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `owner_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |
| `type_code` | `event_types(code)` | CASCADE | **RESTRICT** |
| `context_opportunity_id` | `opportunities(id)` | NO ACTION | **SET NULL** |
| `context_service_offer_id` | `service_offers(id)` | NO ACTION | **SET NULL** |

**CHECK:**

1. Owner XOR: `((owner_person_id IS NOT NULL AND owner_business_id IS NULL) OR (owner_person_id IS NULL AND owner_business_id IS NOT NULL))`
2. `length(btrim(title)) > 0`; `length(btrim(description)) > 0`
3. `delivery_mode ∈ ('in_presence','online','hybrid')`
4. `audience_kind ∈ ('persons','businesses','both')`
5. `economic_kind ∈ ('free','paid','unspecified')`
6. `editorial_status ∈ ('draft','ready')`
7. `publication_status ∈ ('unpublished','published','withdrawn')`
8. `visibility_status ∈ ('private','public')`
9. Publication gates (come Servizi):
   - `published` ⇒ `published_at IS NOT NULL` AND `editorial_status = 'ready'`
   - `withdrawn` ⇒ `withdrawn_at IS NOT NULL`
   - `unpublished` ⇒ `published_at IS NULL` AND `withdrawn_at IS NULL`
10. Nature/audience/economic/external label: se NOT NULL allora `length(btrim(...)) > 0`
11. Summary: se NOT NULL allora non blank

**UNIQUE:** nessuno su title.

**Invariante applicativa (non DDL cross-table):** se `publication_status = 'published'` allora esiste ≥1 riga in `event_editions` per l’Evento con Periodo valorizzato (`starts_at` NOT NULL, anche se fine NULL / indicativo). Documentata per Migration Plan / test runtime; **nessun trigger** cross-table nel ciclo 1.

**Dati vietati sulla tabella:** amount, currency di regolamento, ticket fields, RRULE, JSONB agenda, `membership_id`, `owner_type`, attendance counters.

---

## 8. Edizioni — `event_editions`

**Responsabilità.** Occorrenza concreta (EdizioneEvento): tempo, luogo/link, capienza, assi svolgimento e iscrizioni.

### 8.1 Colonne

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `event_id` | `uuid` | NO | — | FK CASCADE |
| 3 | `title` | `text` | SÌ | — | Sottotitolo edizione; blank rejected |
| 4 | `starts_at` | `timestamptz` | NO | — | Inizio (anche indicativo) |
| 5 | `ends_at` | `timestamptz` | SÌ | — | Fine; ≥ starts_at se presente |
| 6 | `timezone` | `text` | NO | — | IANA (es. `Europe/Rome`); non blank |
| 7 | `all_day` | `boolean` | NO | `false` | Intera giornata |
| 8 | `delivery_mode` | `text` | NO | — | in_presence \| online \| hybrid |
| 9 | `venue_label` | `text` | SÌ | — | Sede dichiarativa |
| 10 | `address_text` | `text` | SÌ | — | Indirizzo testuale |
| 11 | `city_text` | `text` | SÌ | — | Città |
| 12 | `country_ref` | `text` | SÌ | — | Opaco (ISO-like); non FK geografica |
| 13 | `online_reference` | `text` | SÌ | — | URL/riferimento online dichiarativo |
| 14 | `occurrence_status` | `text` | NO | `'scheduled'` | Asse svolgimento |
| 15 | `registration_status` | `text` | NO | `'not_open'` | Asse iscrizioni |
| 16 | `registration_access` | `text` | NO | `'registration_required'` | free \| registration_required \| by_invitation |
| 17 | `registration_required` | `boolean` | NO | `true` | Derivabile da access; tenuto esplicito per chiarezza DDL |
| 18 | `capacity` | `integer` | SÌ | — | Capienza; NULL = non limitata |
| 19 | `registration_opens_at` | `timestamptz` | SÌ | — | Apertura iscrizioni |
| 20 | `registration_deadline` | `timestamptz` | SÌ | — | Scadenza iscrizione |
| 21 | `previous_starts_at` | `timestamptz` | SÌ | — | Data precedente in caso di rinvio |
| 22 | `cancelled_at` | `timestamptz` | SÌ | — | Metadato cancellazione |
| 23 | `created_at` | `timestamptz` | NO | `now()` | |
| 24 | `updated_at` | `timestamptz` | NO | `now()` | |

### 8.2 Vincoli

**FK:** `event_id` → `events(id)` ON DELETE **CASCADE** ON UPDATE NO ACTION.

**CHECK:**

1. `ends_at IS NULL OR ends_at >= starts_at`
2. `length(btrim(timezone)) > 0`
3. `delivery_mode ∈ ('in_presence','online','hybrid')`
4. `occurrence_status ∈ ('scheduled','ongoing','concluded','postponed','cancelled')`
5. `registration_status ∈ ('not_open','open','closed')`
6. `registration_access ∈ ('free','registration_required','by_invitation')`
7. `capacity IS NULL OR capacity >= 0`
8. Modalità/luogo/link (forma fisica):
   - se `delivery_mode = 'in_presence'` allora almeno uno tra `venue_label`, `address_text`, `city_text`, `country_ref` NOT NULL (luogo può essere incompleto ma non tutti NULL);
   - se `delivery_mode = 'online'` allora `online_reference` può essere NULL in bozza ma raccomandato prima dello svolgimento (**vincolo soft**): ciclo 1 impone solo CHECK opzionale “se online_reference NOT NULL allora non blank”;
   - `hybrid`: almeno un campo luogo **oppure** online_reference non blank quando presente
9. Blank-guards su title/venue/address/city/country_ref/online_reference quando NOT NULL
10. `cancelled_at IS NOT NULL` se e solo se `occurrence_status = 'cancelled'` (**gate**):
    `(occurrence_status = 'cancelled' AND cancelled_at IS NOT NULL) OR (occurrence_status <> 'cancelled' AND cancelled_at IS NULL)`
11. `previous_starts_at` ammesso soprattutto con `postponed`; non obbligatorio DDL se storico gestito applicativamente — ciclo 1: se NOT NULL allora `occurrence_status ∈ ('postponed','scheduled','ongoing','concluded')` (conservazione storica)

**UNIQUE:** nessuno obbligatorio (più edizioni possono condividere titolo).

**Indici:** vedi §24.

---

## 9. Sessioni — `event_sessions`

**Responsabilità.** Unità di programma owned dall’Edizione (0..N).

### 9.1 Colonne

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `event_edition_id` | `uuid` | NO | — |
| 3 | `title` | `text` | NO | — |
| 4 | `description` | `text` | SÌ | — |
| 5 | `starts_at` | `timestamptz` | SÌ | — |
| 6 | `ends_at` | `timestamptz` | SÌ | — |
| 7 | `sort_order` | `integer` | NO | `0` |
| 8 | `room_label` | `text` | SÌ | — |
| 9 | `track_label` | `text` | SÌ | — |
| 10 | `delivery_mode` | `text` | SÌ | — | Override opzionale |
| 11 | `online_reference` | `text` | SÌ | — | Override opzionale |
| 12 | `created_at` | `timestamptz` | NO | `now()` |
| 13 | `updated_at` | `timestamptz` | NO | `now()` |

### 9.2 Vincoli

**FK:** `event_edition_id` → `event_editions(id)` ON DELETE **CASCADE**.

**CHECK:**

1. `length(btrim(title)) > 0`
2. `ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at`
3. `sort_order >= 0`
4. `delivery_mode IS NULL OR delivery_mode ∈ ('in_presence','online','hybrid')`
5. Blank-guards su description/room/track/online_reference

**UNIQUE:** `(event_edition_id, sort_order)` — ordine univoco per edizione (forma fisica; se serve densità, Migration Plan può ammorbidirlo — **decisione forma:** UNIQUE imposto).

**Coerenza temporale rispetto all’Edizione:** vincolo **applicativo** (Sessione.starts_at/ends_at entro Edizione.starts_at/ends_at quando entrambi valorizzati). Non trigger cross-table ciclo 1.

---

## 10. Organizzatori — `event_organizers`

**Responsabilità.** Ruoli organizzativi **aggiuntivi** rispetto al titolare AR (co-organizzatore, promotore, partner, sponsor, ospitante, patrocinatore, referente).

Organizzatore primario = `events.owner_*` (nessuna riga obbligatoria in questa tabella).

### 10.1 Colonne

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `event_id` | `uuid` | NO | — |
| 3 | `event_edition_id` | `uuid` | SÌ | — | Scope edizione; NULL = livello Evento |
| 4 | `role_kind` | `text` | NO | — |
| 5 | `person_id` | `uuid` | SÌ | — |
| 6 | `business_id` | `uuid` | SÌ | — |
| 7 | `display_label` | `text` | SÌ | — | Soggetto esterno / etichetta |
| 8 | `sort_order` | `integer` | NO | `0` |
| 9 | `created_at` | `timestamptz` | NO | `now()` |
| 10 | `updated_at` | `timestamptz` | NO | `now()` |

### 10.2 Vincoli

**FK:**

| Colonna | Target | ON DELETE |
|---|---|---|
| `event_id` | `events(id)` | **CASCADE** |
| `event_edition_id` | `event_editions(id)` | **CASCADE** |
| `person_id` | `profiles(id)` | **SET NULL** |
| `business_id` | `businesses(id)` | **SET NULL** |

**CHECK:**

1. `role_kind ∈ ('co_organizer','promoter','partner','sponsor','host','patron','operational_contact')`
2. Almeno un soggetto: `person_id IS NOT NULL OR business_id IS NOT NULL OR (display_label IS NOT NULL AND length(btrim(display_label)) > 0)`
3. Non entrambi person e business: `NOT (person_id IS NOT NULL AND business_id IS NOT NULL)` (XOR se entrambi i FK; label può coesistere con uno dei due)
4. `sort_order >= 0`
5. Se `event_edition_id` NOT NULL, l’appartenenza all’Evento corretto è **vincolo applicativo** (edition.event_id = organizers.event_id) — documentato; opzionale deferred trigger futuro

**UNIQUE:** nessuno globale obbligatorio (stesso soggetto può avere ruoli diversi).

**Nessuna FK Organizzazioni.**

---

## 11. Relatori e ospiti — `event_speakers`

**Responsabilità.** Relatore (e ruoli assimilati: moderatore, facilitatore, formatore) su Edizione, con Sessione opzionale.

### 11.1 Colonne

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `event_edition_id` | `uuid` | NO | — |
| 3 | `event_session_id` | `uuid` | SÌ | — |
| 4 | `role_kind` | `text` | NO | `'speaker'` |
| 5 | `person_id` | `uuid` | SÌ | — |
| 6 | `professional_profile_id` | `uuid` | SÌ | — |
| 7 | `display_label` | `text` | SÌ | — |
| 8 | `sort_order` | `integer` | NO | `0` |
| 9 | `created_at` | `timestamptz` | NO | `now()` |
| 10 | `updated_at` | `timestamptz` | NO | `now()` |

### 11.2 Vincoli

**FK:**

| Colonna | Target | ON DELETE |
|---|---|---|
| `event_edition_id` | `event_editions(id)` | **CASCADE** |
| `event_session_id` | `event_sessions(id)` | **CASCADE** |
| `person_id` | `profiles(id)` | **SET NULL** |
| `professional_profile_id` | `professional_profiles(id)` | **SET NULL** |

**CHECK:**

1. `role_kind ∈ ('speaker','moderator','facilitator','trainer')`
2. Almeno uno tra `person_id`, `professional_profile_id`, `display_label` (non blank)
3. `sort_order >= 0`
4. Session coherence applicativa: se `event_session_id` NOT NULL allora session.edition_id = speakers.edition_id

**UNIQUE parziale consigliato:** non obbligatorio su (edition, person, role) per ammettere etichette multiple; forma fisica: UNIQUE `(event_edition_id, event_session_id, person_id, role_kind)` **dove** `person_id IS NOT NULL` (unique parziale).

Ospite non ha tabella dedicata (Logical: assorbito / rinvio).

---

## 12. Partecipanti e iscrizioni — `event_registrations`

**Inclusa nel ciclo 1** (Logical: IscrizioneEvento owned).

### 12.1 Colonne

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `event_edition_id` | `uuid` | NO | — |
| 3 | `participant_person_id` | `uuid` | NO | — | Partecipante Persona |
| 4 | `on_behalf_business_id` | `uuid` | SÌ | — | “Per conto di” Impresa |
| 5 | `registration_status` | `text` | NO | `'submitted'` |
| 6 | `registered_at` | `timestamptz` | NO | `now()` |
| 7 | `cancelled_at` | `timestamptz` | SÌ | — |
| 8 | `note` | `text` | SÌ | — |
| 9 | `source_label` | `text` | SÌ | — | Provenienza dichiarativa |
| 10 | `created_at` | `timestamptz` | NO | `now()` |
| 11 | `updated_at` | `timestamptz` | NO | `now()` |

**Fuori tabella ciclo 1:** lista d’attesa, biglietto, pagamento, check-in, presenza effettiva persistita (Logical: presenza dichiarativa opzionale — **esclusa** da questa tabella ciclo 1 per allineamento allo STOP “non introdurre presenza effettiva”; se serve in futuro, colonna dedicata in ciclo successivo).

### 12.2 Vincoli

**FK:**

| Colonna | Target | ON DELETE |
|---|---|---|
| `event_edition_id` | `event_editions(id)` | **CASCADE** |
| `participant_person_id` | `profiles(id)` | **RESTRICT** |
| `on_behalf_business_id` | `businesses(id)` | **SET NULL** |

**CHECK:**

1. `registration_status ∈ ('submitted','confirmed','cancelled')`
2. `cancelled_at` gate: cancelled ⇔ `cancelled_at IS NOT NULL`
3. Note/source blank-guards

**UNIQUE parziale:** `(event_edition_id, participant_person_id)` WHERE `registration_status <> 'cancelled'` — una iscrizione attiva per persona/edizione.

**Nessuna FK `auth.users`.**

---

## 13. Cataloghi — `event_types`

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `code` | `text` | NO | — PK |
| `name_it` | `text` | NO | — |
| `description` | `text` | SÌ | — |
| `is_active` | `boolean` | NO | `true` |
| `sort_order` | `integer` | NO | `0` |
| `created_at` / `updated_at` | `timestamptz` | NO | `now()` |

CHECK: code/name_it non blank; `sort_order >= 0`.

**Non cataloghi separati:** `event_formats` (coperto da `delivery_mode`); `event_categories` aggiuntive (type_code sufficiente).

---

## 14. Tipologie (seed normativo)

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

≠ `service_categories`; ≠ tipologhe Opportunità; ≠ `professional_categories`.

---

## 15. Lingue — `event_languages`

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `event_id` | `uuid` | NO | — |
| `language_id` | **bigint** | NO | — |
| `usage_role` | `text` | NO | `'event'` |
| `is_primary` | `boolean` | NO | `false` |
| `sort_order` | `integer` | NO | `0` |
| timestamps | `timestamptz` | NO | `now()` |

**FK:** `event_id` → `events` CASCADE; `language_id` → `languages(id)` RESTRICT.

**UNIQUE:** `(event_id, language_id, usage_role)`.

**CHECK:** `usage_role ∈ ('event','materials','interpretation')`; `sort_order >= 0`.

**UNIQUE parziale:** al più una lingua `is_primary = true` per Evento: UNIQUE `(event_id)` WHERE `is_primary`.

Lingue per Edizione/Sessione: **rinviate** (ciclo 1 sul solo Evento).

≠ `professional_operational_languages`; ≠ `service_*_languages`.

---

## 16. Modalit�

Valori chiusi: `in_presence` \| `online` \| `hybrid`.

| Livello | Colonna |
|---|---|
| Evento | `events.delivery_mode` (default tipologico) |
| Edizione | `event_editions.delivery_mode` (**autorevole per l’occorrenza**) |
| Sessione | override nullable |

Nessun `unspecified` (non documentato nel Logical Eventi).

---

## 17. Tempo e fuso

- Tipi: `timestamptz` per istanti; `timezone text` IANA su Edizione.
- `all_day boolean`.
- Ordine: `ends_at >= starts_at` quando entrambi presenti.
- `registration_opens_at` / `registration_deadline` su Edizione.
- Rinvio: `occurrence_status = 'postponed'` + `previous_starts_at` + nuovo `starts_at`.
- **Vietati:** `recurrence_rule`, RRULE, eccezioni calendario, tabelle calendar esterne.

---

## 18. Luoghi

Solo colonne dichiarative su Edizione (e override Sessione): `venue_label`, `address_text`, `city_text`, `country_ref`, `online_reference`.

**Nessuna** tabella sedi; **nessuna** FK geografica; **≠** `business_locations`.

---

## 19. Pubblicazione

Su `events`: `editorial_status`, `publication_status`, `visibility_status`, `published_at`, `withdrawn_at`.

Gate CHECK §7.2.
Visibilità ciclo 1: `private` \| `public` soltanto.

---

## 20. Lifecycle

| Asse | Dove | Colonne / valori |
|---|---|---|
| Redazione | Evento | `editorial_status` draft\|ready |
| Pubblicazione | Evento | `publication_status` + timestamps |
| Visibilità | Evento | `visibility_status` |
| Svolgimento | Edizione | `occurrence_status` |
| Iscrizioni (canale) | Edizione | `registration_status` |
| Archiviazione | Evento | `archived_at` |
| Iscrizione (singola) | Registrazione | `registration_status` submitted\|confirmed\|cancelled |

Nessuna moderazione Identità.

---

## 21. Capienza e iscrizioni

- `capacity` nullable su Edizione.
- `registration_required` + `registration_access`.
- Deadline/apertura come timestamptz.
- Conteggio iscritti confermati e posti rimanenti = **query derivate** (no colonne denormalizzate).
- Lista d’attesa / check-in / presenza / biglietto = **assenti**.

---

## 22. Collegamenti ad altri domini

| Riferimento | Forma | Obbligatorio | ON DELETE |
|---|---|---|---|
| Persona titolare | `events.owner_person_id` | XOR | RESTRICT |
| Impresa titolare | `events.owner_business_id` | XOR | RESTRICT |
| Opportunità | `events.context_opportunity_id` | No | SET NULL |
| OffertaDiServizio | `events.context_service_offer_id` | No | SET NULL |
| Mercato | `event_markets` | No | RESTRICT su market; CASCADE da event |
| Professionista | `event_speakers.professional_profile_id` | No | SET NULL |
| Contenuti / Organizzazioni | — | No | Non modellati |
| Appartenenze | — | No | Nessuna FK |
| RichiestaDiServizio | — | No | Esclusa |

---

## 23. Tabelle di link (sintesi)

### 23.1 `event_markets`

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `event_id` | uuid | NO | — |
| `market_id` | uuid | NO | — |
| `relation_kind` | text | NO | `'focus'` |
| `sort_order` | integer | NO | `0` |
| timestamps | timestamptz | NO | `now()` |

FK: event CASCADE; market → `international_markets` RESTRICT.
UNIQUE `(event_id, market_id)`.
CHECK `relation_kind ∈ ('focus','related','destination')`; `sort_order >= 0`.

### 23.2 Altri link

Organizers, speakers, languages, registrations: §§10–12, §15.

---

## 24. Indici

| Tabella | Indici |
|---|---|
| `events` | partial `(owner_person_id)` WHERE NOT NULL; partial `(owner_business_id)` WHERE NOT NULL; `(type_code)`; `(publication_status)`; partial published; partial `(archived_at)` WHERE NOT NULL |
| `event_editions` | `(event_id)`; `(starts_at)`; `(occurrence_status)`; `(registration_status)` |
| `event_sessions` | `(event_edition_id)`; `(sort_order)` (via UNIQUE) |
| `event_organizers` | `(event_id)`; `(event_edition_id)` WHERE NOT NULL |
| `event_speakers` | `(event_edition_id)`; `(event_session_id)` WHERE NOT NULL; `(person_id)` WHERE NOT NULL |
| `event_languages` | `(event_id)`; `(language_id)` |
| `event_markets` | `(event_id)`; `(market_id)` |
| `event_registrations` | `(event_edition_id)`; `(participant_person_id)`; partial unique attiva |
| `event_types` | `(is_active)`; `(sort_order)` |

---

## 25. Trigger e funzioni

Per **tutte le 9 tabelle**:

```
function public.set_<table>_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW.

Nomi abbreviabili se >63 byte. Nessuna altra funzione ciclo 1. **Nessun** trigger di pubblicazione cross-table.

---

## 26. RLS e privilegi

Per ogni tabella Eventi (incluso catalogo):

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- **FORCE RLS: false**
- **0 policy**
- `REVOKE ALL ON TABLE ... FROM PUBLIC, anon, authenticated;`
- **Nessun GRANT** applicativo

---

## 27. COMMENT ON

Obbligatori: COMMENT ON TABLE per tutte; COMMENT ON COLUMN per owner XOR, context_*, delivery_mode, assi stato, country_ref, online_reference, capacity, registration_*, previous_starts_at, display_label, on_behalf_business_id, archived_at, external_organization_label; COMMENT ON FUNCTION per ogni `set_*_updated_at`.

Testi devono dichiarare: ≠ OffertaDiServizio; ≠ Opportunità; ≠ Contenuto; ≠ ticketing; ≠ RRULE; ≠ SedeImpresa.

---

## 28. Seed

| Oggetto | Seed ciclo 1 |
|---|---|
| `event_types` | 10 righe §14 |
| AR / owned / link / registrations | **Nessun** seed demo |

---

## 29. Oggetti esclusi

Inviti; accreditamenti; liste d’attesa; biglietti; pagamenti; ordini; commissioni; fatture; check-in; presenza effettiva; RRULE; calendari; FEV; fonti/evidenze/verifiche; recensioni; attestati; allegati; Storage; locandine; registrazioni video; Organizzazioni AR; policy Identità; `auth.users` owner; JSONB agenda; `entity_type`/`entity_id`; tabelle sedi; FK `business_memberships`; assorbimento `training_*` DV4; `service_requests`.

---

## 30. Strutture legacy

| Struttura | Ownership attuale | Decisione Eventi ciclo 1 |
|---|---|---|
| `training_*` (DV4) | Pre-metodologia / orfane | **Esclusione**; nessuna modifica; nessuna migrazione dati |
| `professional_registrations` | Professionisti (Ordine) | **Esclusione**; ≠ IscrizioneEvento |
| `language_service_*` / `profile_language_services` | DV4 | **Esclusione** |
| Tabelle `event*` | **Inesistenti** | Greenfield |

---

## 31. Ordine di creazione

1. `event_types` (+ seed)
2. `events`
3. `event_editions`
4. `event_sessions`
5. `event_organizers`
6. `event_speakers`
7. `event_languages`
8. `event_markets`
9. `event_registrations`
10. Chiusura documentale Migration Plan (fuori SQL)

Precondizioni esterne: `profiles`, `businesses`, `professional_profiles`, `languages`, `international_markets`, `opportunities`, `service_offers`.

**Timestamp migration:** da assegnare nel Migration Plan; devono essere > head Servizi (`20260805190000`) e strettamente crescenti. *(Proposta preliminare non vincolante: partire da `20260806090000`.)*

---

## 32. Matrice Logical → Physical

| Logical | Physical |
|---|---|
| Evento | `events` |
| EdizioneEvento | `event_editions` |
| SessioneEvento | `event_sessions` |
| TipologiaEvento | `event_types` + `type_code` |
| ModalitàEvento | `delivery_mode` CHECK |
| Organizzatore primario | `owner_person_id` XOR `owner_business_id` |
| Co-organizzatore / sponsor / … | `event_organizers` |
| Relatore / moderatore / … | `event_speakers` |
| IscrizioneEvento | `event_registrations` |
| Lingua dell’Evento | `event_languages` |
| Mercato di riferimento | `event_markets` |
| Opportunità collegata | `context_opportunity_id` |
| OffertaDiServizio collegata | `context_service_offer_id` |
| Capienza | `event_editions.capacity` |
| Programma | `event_sessions` (0..N) |
| Ricorrenza | più righe `event_editions` |
| Invito / ListaAttesa / Biglietto / FEV | **non mappati** (esclusi) |

---

## 33. Contratti DDL-ready (checklist per tabella)

Per ciascuna delle 9 tabelle il Migration Plan dovrà verificare:

1. nome
2. responsabilit�
3. colonne in ordine §
4. tipo PostgreSQL
5. nullability
6. default
7. PK
8. FK
9. ON UPDATE
10. ON DELETE
11. UNIQUE / UNIQUE parziali
12. CHECK
13. indici / indici parziali
14. funzione `set_*_updated_at`
15. trigger BEFORE UPDATE
16–18. RLS ENABLE, FORCE false, 0 policy
19–20. REVOKE; nessun GRANT
21. COMMENT ON
22. seed solo `event_types`
23. dipendenze rispettate
24–26. test statici / runtime / post-apply

**Vietati in SQL:** `IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PG; polimorfismo; FORCE RLS true; GRANT anon/authenticated; seed demo AR; RRULE; ticketing.

---

## 34. Test statici

- Conteggio tabelle Eventi = 9
- CREATE TABLE = 9; ENABLE RLS = 9; CREATE POLICY = 0; GRANT applicativi = 0
- JSONB modellante = 0; entity_type/entity_id = 0; DO = 0; IF NOT EXISTS = 0
- Identificatori ≤ 63 byte
- Seed solo in migration catalogo
- Nessuna tabella invite/waitlist/ticket/FEV/storage
- FK tipi: languages bigint; markets/opportunities/service_offers/profiles/businesses/professional_profiles uuid

---

## 35. Test runtime (ROLLBACK)

1. Insert Evento owner Persona; owner Impresa; rifiuto nessun owner / entrambi.
2. Insert Edizione; CHECK tempo; cancellazione gate; rinvio con `previous_starts_at`.
3. Pubblicazione senza `ready` rifiutata; (applicativo) pubblicazione senza Edizione rifiutata.
4. Sessioni 0..N; UNIQUE sort_order; CASCADE da Edizione.
5. Organizer con label-only; XOR person/business.
6. Speaker con professional_profile; label-only; CASCADE.
7. Lingue bigint; primary unica; RESTRICT su language delete.
8. Markets RESTRICT; CASCADE da Evento.
9. Registration submitted→confirmed→cancelled; UNIQUE parziale attiva; RESTRICT participant; CASCADE edition.
10. SET NULL su context opportunity/service_offer.
11. RESTRICT delete owner con Evento esistente.
12. RLS: anon/authenticated permission denied su tutte le 9.
13. updated_at su update.
14. Seed types = 10; zero residui AR dopo ROLLBACK.

---

## 36. Verifiche post-apply

- Local head include tutte le migration Eventi del blocco.
- 9 tabelle presenti; RLS/FORCE/policy/privilegi conformi.
- Catalogo 10 tipi.
- Zero policy; zero GRANT; zero dati demo AR.
- Hash SQL invariati; nessuna modifica a Servizi/Professionisti/Opportunità.

---

## 37. Questioni risolte (forma fisica)

1. AR = `events`; owned editions/sessions/roles/languages/markets/registrations.
2. Titolare XOR su `profiles`/`businesses`.
3. Modalità = `in_presence`\|`online`\|`hybrid` (token Logical).
4. ≥1 Edizione se published = vincolo applicativo documentato.
5. Coerenza tempo Sessione/Edizione = applicativa.
6. Iscrizioni = tabella owned; no presenza/check-in/lista.
7. Catalogo unico `event_types` con seed 10.
8. Contesti Opportunità/Servizi come colonne SET NULL; mercati come link.
9. Nessun RRULE/ticketing/FEV/Storage/Organizzazioni.
10. D28 senza FK memberships.
11. DV4 `training_*` non assorbite.
12. Pattern RLS/REVOKE/updated_at allineato a Servizi.

---

## 38. Decisioni rinviate

1. Trigger/enforcement DDL dell’invariante ≥1 Edizione.
2. Trigger coerenza edition_id tra organizers/speakers/sessions.
3. Lingue per Edizione/Sessione.
4. Presenza effettiva / check-in.
5. Inviti, liste d’attesa, accrediti.
6. Visibilità oltre private/public.
7. FEV Eventi.
8. Tabella sedi / geocoding.
9. Consolidamento Dependency Map D27–D29.
10. Timestamp migration definitivi (Migration Plan).

Non bloccano il Migration Plan ciclo 1.

---

## 39. Criteri per Migration Plan

Il Migration Plan dovrà:

1. Assegnare timestamp strettamente crescenti dopo `20260805190000`.
2. Una tabella per migration (o catalogo+seed nella stessa unità solo se pattern Servizi M1).
3. Realizzare integralmente i contratti §§7–15, §23.
4. Includere test dell’invariante applicativa di pubblicazione.
5. Non anticipare oggetti §29.
6. Prevedere apply locale cumulativo e validazione delle 9 tabelle.
7. Non modificare migration Servizi/altri domini.

---

## 40. Criteri di accettazione

Physical accettabile se: inventario 9 tabelle chiuso; AR unica; owned corretti; FK tipi verificati; XOR owner; assi lifecycle separati; esclusi ticketing/RRULE/FEV/Storage/Org/Identità; sufficiente al Migration Plan senza nuove decisioni semantiche.

---

## 41. Stato finale

**Physical Eventi chiuso per Migration Plan ciclo 1.**
Nove tabelle (`event_types` … `event_registrations`), AR `events`, composizione Edizione→Sessione, iscrizioni base, ruoli e lingue/mercati facoltativi, pattern RLS deny-by-default.

Migration Plan e SQL restano fasi successive.
