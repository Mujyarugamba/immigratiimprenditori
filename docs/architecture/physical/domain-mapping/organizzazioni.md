# Physical Domain Mapping — Dominio ORGANIZZAZIONI

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/organizzazioni.md`.
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository.
> **Non** crea Migration Plan, **non** crea migration SQL, **non** esegue apply, **non** modifica lo schema.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine).

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Organizzazioni** (sinonimo: Organizzazioni istituzionali) |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/organizzazioni.md` (chiuso per Physical) |
| Stato | **Chiuso per Migration Plan** (salvo §43) |
| Ciclo | Ciclo 1 |
| Migration Plan / SQL | **Fuori da questo documento** |

---

## 2. Scopo e responsabilità del dominio

Tradurre l’Aggregate Root **Organizzazione** e le associazioni owned (ufficiali/rappresentanti/referenti) in un modello relazionale `public` con ownership Persona|Impresa|Redazione, tipology a catalogo, sede descrittiva unica incorporata nell’AR, link facoltativo a Impresa, lifecycle multi-asse, **senza** membership, HR, CRM, grafo Org–Org, FEV, Storage, multi-sede, Identità o modifiche ai domini già chiusi.

### 2.1 Confini esatti

| Incluso ciclo 1 | Escluso |
|---|---|
| Scheda anagrafica istituzionale | Membership Persona–Org / Impresa–Org (Appartenenze future) |
| Tipology C03 | Impresa economica / cooperativa economica |
| Ownership ternaria di scheda | `auth.users` come owner; Org self-owner |
| Sede descrittiva 0..1 (colonne AR) | Multi-sede; cataloghi geografici |
| Ufficiali (rappresentanti + referenti) | Organigramma / HR / payroll |
| Link 0..1 a `businesses` | Fusione anagrafiche; relazioni strutturali Impresa multiple |
| Assi redazione / pubblicazione / visibilità / operatività / archiviazione | Workflow approvativi; scheduling |
| Logo / documento URL opachi | Storage, media library, FEV |

### 2.2 Responsabilità incluse

- Identità e tipology dell’Organizzazione.
- Titolarità della scheda (Persona \| Impresa \| Redazione).
- Testi descrittivi / missione.
- Lifecycle e pubblicazione della scheda.
- Sede principale dichiarativa.
- Dichiarazione di rappresentanti e referenti.
- Collegamento facoltativo dichiarativo a un’Impresa.

### 2.3 Responsabilità escluse

Membership; affiliazioni Appartenenze; grafo Org–Org; documenti costitutivi; FEV; Storage; CRM; HR; titolarità Eventi/Servizi/Contenuti/Opportunità; assorbimento Risorse di supporto MI; Identità & Accessi; policy applicative.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/organizzazioni.md` | **Autorità semantica** |
| `domain-model.md` §11; `reconciliation-report.md` §12–§13, §16 #8 | Dominio a sé; ≠ Impresa |
| `domain-dependency-map.md` DC2, DV3 | Membership future via Appartenenze; oggi etichette |
| Physical/migration Persone, Imprese, Contenuti, Eventi, Servizi | Pattern ownership, RLS, cataloghi C03, FK reali |
| `profiles.organization_type` (legacy) | **Non** catalogo autorevole |
| PDS §6 | Sketch storico; non contratto |

---

## 4. Principi di mapping

1. Unico AR fisico `organizations`; tipologies/ambiti sono cataloghi; ufficiali sono owned.
2. Titolare = esattamente uno tra Persona (`profiles`), Impresa (`businesses`) e **Redazione** (`owned_by_editorial = true` senza FK Org/`auth.users`).
3. Nessun `owner_type` / `entity_id` senza FK; nessun JSONB modellante; nessun ENUM PostgreSQL.
4. Sede descrittiva = colonne sull’AR (0..1 logica: campi tutti null = assenza sede); **non** tabella multi-sede.
5. Rappresentanti e referenti = unica tabella owned `organization_officials` con `role_kind` chiuso (Logical §§17–18).
6. Link Impresa = colonna `linked_business_id` nullable (0..1), distinta da `owner_business_id`.
7. Lingua opzionale: `language_id` → `languages(id)` **bigint**.
8. RLS ENABLE, FORCE false, zero policy, REVOKE ALL da PUBLIC/anon/authenticated.
9. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE.
10. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico.
11. Persona = `public.profiles`. Nessuna FK Appartenenze ciclo 1.
12. Contatori membri/partner/eventi = **derivati**, non colonne.
13. Non modificare migration Eventi/Servizi/Contenuti/Opportunità/MI/Appartenenze.
14. Non riusare `profiles.organization_type` come catalogo.

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `organization_types` | Catalogo C03 | Dominio Organizzazioni |
| 2 | `organization_activity_scopes` | Catalogo C03 | Dominio Organizzazioni |
| 3 | `organizations` | Aggregate Root | Dominio Organizzazioni |
| 4 | `organization_officials` | Entity owned / ruolo | `organizations` |

**Totale ciclo 1: 4 tabelle.**

**Non create:** `organization_memberships`; `organization_relations`; `organization_seats` (multi); `organization_documents`; `organization_sources`; `organization_verifications`; tabelle media/Storage; link a Eventi/Servizi/Contenuti/Opportunità/MI.

---

## 6. Dipendenze esterne (ciclo 1)

| Target | Migration origine | PK | Tipo PK | Uso Organizzazioni | ON DELETE tipico |
|---|---|---|---|---|---|
| `public.profiles` | `20260718103949_create_profiles_table.sql` | `id` | **uuid** | Titolare; ufficiale | RESTRICT (titolare); **RESTRICT** (ufficiale; XOR stretto Persona/etichetta) |
| `public.businesses` | `20260731070000_create_businesses_core.sql` | `id` | **uuid** | Titolare; link facoltativo | RESTRICT |
| `public.languages` | `20260718112212_create_languages_table.sql` | `id` | **bigint** identity | Lingua principale opzionale | RESTRICT |

**Non usate nel ciclo 1:** `business_memberships`; `professional_profiles`; `events`; `service_*`; `contents`; `opportunities`; `international_markets`; `auth.users` come owner.

---

## 7. Aggregate root — `organizations`

**Responsabilità.** Scheda radice dell’Organizzazione istituzionale (anagrafica, tipology, ownership, lifecycle, sede descrittiva, link Impresa).

**Identità.** `id uuid PK DEFAULT gen_random_uuid()`.

**Motivazione AR unica.** Coerente con Logical opzione A: un soggetto collettivo con tipology, non famiglie AR distinte né estensione di `businesses`.

### 7.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `owner_person_id` | `uuid` | SÌ | — | XOR Impresa/Redazione |
| 3 | `owner_business_id` | `uuid` | SÌ | — | XOR Persona/Redazione |
| 4 | `owned_by_editorial` | `boolean` | NO | `false` | Redazione piattaforma |
| 5 | `type_code` | `text` | NO | — | FK `organization_types` |
| 6 | `primary_scope_code` | `text` | SÌ | — | FK `organization_activity_scopes`; 0..1 |
| 7 | `language_id` | **bigint** | SÌ | — | FK `languages`; opzionale |
| 8 | `linked_business_id` | `uuid` | SÌ | — | Link 0..1 a Impresa; ≠ owner |
| 9 | `name` | `text` | NO | — | Denominazione; non blank |
| 10 | `short_name` | `text` | SÌ | — | Denominazione breve |
| 11 | `summary` | `text` | SÌ | — | Sintesi |
| 12 | `description` | `text` | NO | — | Descrizione/missione; non blank |
| 13 | `slug` | `text` | NO | — | Unique; non blank |
| 14 | `founded_year` | `integer` | SÌ | — | Anno dichiarativo |
| 15 | `website_url` | `text` | SÌ | — | Opaco |
| 16 | `email` | `text` | SÌ | — | Dichiarativo |
| 17 | `phone` | `text` | SÌ | — | Dichiarativo |
| 18 | `logo_url` | `text` | SÌ | — | Opaco; ≠ Storage |
| 19 | `document_url` | `text` | SÌ | — | URL documento pubblico opaco; ≠ library |
| 20 | `affiliation_note` | `text` | SÌ | — | Nota “fa parte di…” senza grafo |
| 21 | `seat_address_text` | `text` | SÌ | — | Sede descrittiva |
| 22 | `seat_city_label` | `text` | SÌ | — | Città dichiarativa |
| 23 | `seat_region_label` | `text` | SÌ | — | Regione/area dichiarativa |
| 24 | `seat_country_label` | `text` | SÌ | — | Paese dichiarativo |
| 25 | `editorial_status` | `text` | NO | `'draft'` | draft \| ready |
| 26 | `publication_status` | `text` | NO | `'unpublished'` | unpublished \| published \| withdrawn |
| 27 | `visibility_status` | `text` | NO | `'private'` | private \| public |
| 28 | `operational_status` | `text` | NO | `'active'` | active \| inactive \| suspended \| dissolved |
| 29 | `published_at` | `timestamptz` | SÌ | — | Gate pubblicazione |
| 30 | `withdrawn_at` | `timestamptz` | SÌ | — | Gate ritiro |
| 31 | `activity_started_on` | `date` | SÌ | — | Opzionale |
| 32 | `activity_ended_on` | `date` | SÌ | — | Opzionale |
| 33 | `archived_at` | `timestamptz` | SÌ | — | NULL = corrente |
| 34 | `created_at` | `timestamptz` | NO | `now()` | |
| 35 | `updated_at` | `timestamptz` | NO | `now()` | |

### 7.2 Vincoli AR

**PK:** `organizations_pkey (id)`.

**FK:**

| Colonna | Target | ON UPDATE | ON DELETE |
|---|---|---|---|
| `owner_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `owner_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |
| `type_code` | `organization_types(code)` | CASCADE | **RESTRICT** |
| `primary_scope_code` | `organization_activity_scopes(code)` | CASCADE | **RESTRICT** |
| `language_id` | `languages(id)` | NO ACTION | **RESTRICT** |
| `linked_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |

**CHECK ownership (Persona XOR Impresa XOR Redazione):**

```
(
  (owner_person_id IS NOT NULL AND owner_business_id IS NULL AND owned_by_editorial = false)
  OR (owner_person_id IS NULL AND owner_business_id IS NOT NULL AND owned_by_editorial = false)
  OR (owner_person_id IS NULL AND owner_business_id IS NULL AND owned_by_editorial = true)
)
```

**CHECK altri:**

1. `length(btrim(name)) > 0`; `length(btrim(description)) > 0`; `length(btrim(slug)) > 0`
2. `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`
3. `editorial_status ∈ ('draft','ready')`
4. `publication_status ∈ ('unpublished','published','withdrawn')`
5. `visibility_status ∈ ('private','public')`
6. `operational_status ∈ ('active','inactive','suspended','dissolved')`
7. Publication gates:
   - `published` ⇒ `published_at IS NOT NULL` AND `editorial_status = 'ready'`
   - `withdrawn` ⇒ `withdrawn_at IS NOT NULL`
   - `unpublished` ⇒ `published_at IS NULL` AND `withdrawn_at IS NULL`
8. Blank-guards su short_name, summary, website_url, email, phone, logo_url, document_url, affiliation_note, seat_* quando NOT NULL
9. `founded_year` NULL oppure `1000..9999`
10. `activity_ended_on` NULL oppure `activity_started_on` NULL oppure `activity_ended_on >= activity_started_on`

**UNIQUE:** `organizations_slug_key (slug)`.

**Invarianti applicative (non DDL cross-table):** nessuna membership; nessuna equivalenza automatica con Impresa anche se `linked_business_id` valorizzato.

---

## 8. Ownership (forma fisica)

| Caso | Colonne |
|---|---|
| Persona | `owner_person_id` NOT NULL; `owner_business_id` NULL; `owned_by_editorial = false` |
| Impresa | `owner_business_id` NOT NULL; `owner_person_id` NULL; `owned_by_editorial = false` |
| Redazione | `owned_by_editorial = true`; entrambi owner_* NULL |

- Nessuna FK Organizzazioni verso sé come owner.
- Nessun `auth.users` come owner.
- `linked_business_id` **non** è titolare: può coincidere o meno con `owner_business_id` (nessun vincolo di uguaglianza imposto).

---

## 9. Lifecycle fisico

| Asse | Colonna | Valori | Note |
|---|---|---|---|
| Redazione | `editorial_status` | draft \| ready | Default draft |
| Pubblicazione | `publication_status` | unpublished \| published \| withdrawn | Gate con `published_at` / `withdrawn_at` |
| Visibilità | `visibility_status` | private \| public | Non è policy RLS |
| Operatività | `operational_status` | active \| inactive \| suspended \| dissolved | Indipendente da pubblicazione |
| Archiviazione | `archived_at` | NULL / timestamptz | Indipendente da dissolved |

`dissolved` **non** implica `withdrawn`. `withdrawn` **non** implica `dissolved`.

---

## 10. Cataloghi

### 10.1 `organization_types`

| Aspetto | Definizione |
|---|---|
| Scopo | Tipology istituzionale principale (C03) |
| PK | `code text` |
| Colonne | `code`, `name_it`, `description`, `is_active`, `sort_order`, timestamps |
| CHECK | blank code/name; `sort_order >= 0` |
| Indici | `(is_active)`; `(sort_order)` |
| Seed normativo | **11** righe (§10.2) |
| Utilizzo | `organizations.type_code` obbligatorio |

### 10.2 Seed `organization_types` (esatto)

| code | name_it | sort_order |
|---|---|---|
| `association` | Associazione | 10 |
| `foundation` | Fondazione | 20 |
| `public_body` | Ente / organismo pubblico | 30 |
| `chamber_of_commerce` | Camera di commercio | 40 |
| `embassy_consulate` | Ambasciata / Consolato | 50 |
| `professional_order` | Ordine / Collegio professionale | 60 |
| `university` | Università / ente di formazione | 70 |
| `ngo` | ONG / ente non profit | 80 |
| `institutional_network` | Rete / consorzio istituzionale | 90 |
| `organized_community` | Comunità organizzata | 100 |
| `other` | Altro | 110 |

**Assenti dal seed:** cooperative (→ Imprese); partito; religione; sindacato; gruppo informale.

### 10.3 `organization_activity_scopes`

| Aspetto | Definizione |
|---|---|
| Scopo | Ambito di attività leggero (≠ `business_sectors`) |
| PK | `code text` |
| Colonne | Forma C03 identica a types |
| Seed ciclo 1 | **0** (struttura pronta; popolabile operativamente) |
| Utilizzo | `organizations.primary_scope_code` opzionale 0..1 |

---

## 11. Sede (contratto fisico)

Nessuna tabella `organization_seats` nel ciclo 1.

Sede = colonne `seat_address_text`, `seat_city_label`, `seat_region_label`, `seat_country_label` su `organizations`.

| Regola | Forma |
|---|---|
| Cardinalità | 0..1 logica (tutti null = nessuna sede) |
| Natura | Dichiarativa / opaca |
| Multi-sede | Vietata |
| Cataloghi geografici | Vietati |
| Territory servito multiplo | Rinviato |

---

## 12. Link Impresa

| Aspetto | Forma |
|---|---|
| Colonna | `linked_business_id uuid NULL` |
| FK | `businesses(id)` ON DELETE **RESTRICT** |
| Cardinalità | 0..1 per Organizzazione |
| Significato | Continuità / doppia natura dichiarata; **non** ownership Impresa |
| Fusione anagrafiche | Vietata |
| UNIQUE globale su `linked_business_id` | **No** (più Org possono referenziare la stessa Impresa) |

---

## 13. Ufficiali — `organization_officials`

Unifica Logical §§17–18 (rappresentanti + referenti) in una entity owned.

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `organization_id` | `uuid` | NO | — |
| 3 | `role_kind` | `text` | NO | — |
| 4 | `person_id` | `uuid` | SÌ | — |
| 5 | `display_label` | `text` | SÌ | — |
| 6 | `is_primary` | `boolean` | NO | `false` |
| 7 | `sort_order` | `integer` | NO | `0` |
| 8 | `email` | `text` | SÌ | — |
| 9 | `phone` | `text` | SÌ | — |
| 10 | `valid_from` | `date` | SÌ | — |
| 11 | `valid_to` | `date` | SÌ | — |
| 12 | `note` | `text` | SÌ | — |
| 13–14 | timestamps | `timestamptz` | NO | `now()` |

**FK:** `organization_id` → `organizations` **CASCADE**; `person_id` → `profiles` **RESTRICT**.

**CHECK:**

1. `role_kind ∈ ('legal_representative','president','director','secretary','spokesperson','board_member','public_contact','operational_contact','other')`
2. Soggetto XOR stretto (Logical §§17–18): esattamente una alternativa valorizzata —
   `(person_id IS NOT NULL AND display_label IS NULL)
   OR (person_id IS NULL AND display_label IS NOT NULL AND length(btrim(display_label)) > 0)`
3. `sort_order >= 0`
4. Blank-guards su display_label, email, phone, note
5. `valid_to` NULL oppure `valid_from` NULL oppure `valid_to >= valid_from`

**Nota ON DELETE.** `SET NULL` su `person_id` è **incoerente** con XOR stretto (lascerebbe soggetto vuoto). RESTRICT preserva l’invariante: per rimuovere la Persona occorre prima aggiornare o cancellare l’ufficiale.

**UNIQUE parziali:**

- Al più un primario per organizzazione: UNIQUE `(organization_id)` WHERE `is_primary`
- Anti-duplicato persona+ruolo: UNIQUE `(organization_id, role_kind, person_id)` WHERE `person_id IS NOT NULL`

**Cardinalità:** 1 Organizzazione → 0..N ufficiali.

**Esclusioni:** Professional Profile obbligatorio; Impresa come soggetto ufficiale; HR; organigramma.

---

## 14. Derivati (non persistiti)

Numero membri; numero sedi; numero partner; numero eventi/servizi; score completezza; presenza internazionale; URL pubblico costruito; conteggio ufficiali.

---

## 15. Vincoli / invarianti fisiche

1. AR unica `organizations`.  
2. Ownership ternaria DDL-garantita.  
3. Tipology obbligatoria da catalogo seed.  
4. Slug UNIQUE globale + pattern.  
5. Publication gates DDL.  
6. Operatività indipendente da pubblicazione.  
7. Ufficiale: Persona XOR etichetta (esattamente una; mai entrambe; mai nessuna).  
8. Primary ufficiale al più uno.  
9. Sede solo colonne AR.  
10. Nessuna tabella membership / Org–Org / seats multi.  
11. Nessun `auth.users` owner.  
12. Nessuna FK a Eventi/Servizi/Contenuti/Opportunità/MI/Appartenenze.  
13. `linked_business_id` non implica fusione con Impresa.  
14. Legacy `profiles.organization_type` non referenziato.

---

## 16. Indici

| Tabella | Indice | Motivazione |
|---|---|---|
| `organization_types` | `(is_active)`, `(sort_order)` | Navigazione catalogo |
| `organization_activity_scopes` | `(is_active)`, `(sort_order)` | Idem |
| `organizations` | partial `owner_person_id` | Lookup titolare Persona |
| `organizations` | partial `owner_business_id` | Lookup titolare Impresa |
| `organizations` | partial `owned_by_editorial WHERE true` | Schede redazionali |
| `organizations` | `(type_code)` | Filtro tipology |
| `organizations` | `(publication_status)` | Liste pubblicazione |
| `organizations` | partial published | Feed pubblici |
| `organizations` | `(operational_status)` | Filtro attività |
| `organizations` | partial `linked_business_id` | Reverse lookup Impresa |
| `organizations` | partial `archived_at` | Esclusione archiviate |
| `organizations` | UNIQUE `slug` | Identità pubblica |
| `organization_officials` | `(organization_id)` | Owned load |
| `organization_officials` | partial `person_id` | Lookup Persona |
| `organization_officials` | partial primary | Enforce/query primario |

---

## 17. Trigger e funzioni

Per **tutte e 4** le tabelle:

```
function public.set_<table>_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW.

Nessun trigger cross-table.

---

## 18. Sicurezza (RLS e privilegi)

Per ogni tabella Organizzazioni:

| Voce | Prescrizione |
|---|---|
| RLS | `ENABLE ROW LEVEL SECURITY` |
| FORCE RLS | **false** |
| Policy | **0** |
| REVOKE | ALL da PUBLIC; ALL da anon, authenticated |
| GRANT applicativi | **0** |
| Visibilità sostanziale | Colonna `visibility_status` su AR; **non** policy |
| Identità & Accessi | Fuori ciclo 1; pattern deny-by-default coerente con Eventi/Contenuti/Servizi |

---

## 19. COMMENT ON

Obbligatori: COMMENT ON TABLE tutte; COMMENT ON COLUMN per ownership XOR/Redazione, `type_code`, `linked_business_id`, assi stato, slug, sede, logo/document URL, `role_kind` ufficiali; COMMENT ON FUNCTION per ogni `set_*_updated_at`.

Testi devono dichiarare: ≠ Impresa; ≠ Appartenenza/membership; ≠ Evento/Servizio/Contenuto; ≠ Storage; ≠ `profiles.organization_type`; ≠ HR/CRM.

---

## 20. Seed

| Oggetto | Seed ciclo 1 |
|---|---|
| `organization_types` | **11** |
| `organization_activity_scopes` | **0** (ciclo 1) → **3** culturali in C3.1 (`culture`, `heritage`, `creative_industries`) |
| AR / ufficiali | **0** demo |

---

## 21. Esclusioni (riepilogo)

Membership; HR; CRM; Org–Org; documenti strutturali; FEV; Storage; media library; Identità; multi-sede; grafi; workflow; FK retroattive; assorbimento MI support; partiti/religioni; cooperativa come tipology; organigrammi; JSONB; `entity_type`/`entity_id`.

---

## 22. Matrice Logical → Physical

| Logical | Physical |
|---|---|
| Organizzazione (AR) | `organizations` |
| TipologiaOrganizzativa | `organization_types` + `type_code` |
| AmbitoDiAttività | `organization_activity_scopes` + `primary_scope_code` |
| SedeDescrittiva | colonne `seat_*` su AR |
| Rappresentante / Referente | `organization_officials` |
| Impresa collegata | `linked_business_id` |
| Membership / Org–Org / FEV / Storage | **non mappati** |

---

## 23. Ordine di creazione (per Migration Plan)

1. `organization_types` (+ seed 11)  
2. `organization_activity_scopes` (senza seed)  
3. `organizations`  
4. `organization_officials`  
5. Chiusura documentale Migration Plan (fuori SQL)

Precondizioni: `profiles`, `businesses`, `languages`.

**Timestamp:** da assegnare nel Migration Plan; strettamente crescenti e successivi a head Contenuti `20260807200000`.

---

## 24. Prontezza per Migration Plan

| Unità prevista | Responsabilità | Tabella |
|---|---|---|
| **M1.1** | Catalogo tipologies + seed 11 | `organization_types` |
| **M1.2** | Catalogo ambiti (seed 0) | `organization_activity_scopes` |
| **M2.1** | Aggregate root | `organizations` |
| **M3.1** | Ufficiali owned | `organization_officials` |
| **M4–M7** | **Assenti** ciclo 1 | — |
| **M8.1** | Seed demo | **SKIP** |
| **M8.2** | Validation report | non SQL |

**Totale unità SQL previste: 4** (una tabella = una migration).

Ordine implementazione: M1.1 → M1.2 → M2.1 → M3.1 → (M8.1 SKIP) → M8.2.

Il Migration Plan dovrà assegnare timestamp, nomi file, contratti operativi e test senza nuove decisioni semantiche.

---

## 25. Contratti DDL-ready (checklist)

Per ciascuna delle 4 tabelle il Migration Plan verificherà: nome; colonne in ordine; tipi; nullability; default; PK; FK; ON UPDATE/DELETE; UNIQUE/parziali; CHECK; indici; `set_*_updated_at`; trigger; RLS ENABLE; FORCE false; 0 policy; REVOKE; nessun GRANT; COMMENT; seed solo cataloghi tipizzati; dipendenze; test statici/runtime.

**Vietati in SQL:** `IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PG; polimorfismo; FORCE RLS true; GRANT anon/authenticated; seed demo AR; Storage; membership; Org–Org.

---

## 26. Test statici (attesi dal Plan)

- Tabelle Organizzazioni = 4  
- CREATE TABLE = 4; ENABLE RLS = 4; CREATE POLICY = 0; GRANT applicativi = 0  
- Seed types = 11; scopes = 0  
- Ownership ternary presente  
- Nessuna FK Eventi/Servizi/Contenuti/Opp/MI/Appartenenze  
- Nessuna modifica migration precedenti  
- Identificatori ≤ 63 byte  

---

## 27. Test runtime (attesi dal Plan, ROLLBACK)

1. Owner Persona / Impresa / Redazione; rifiuti ownership invalida.  
2. type_code valido/invalido; scope opzionale.  
3. Publication gates; slug unique; operational indipendente.  
4. linked_business_id valido; RESTRICT delete business con link.  
5. Ufficiale Persona; etichetta; XOR; primary unica; CASCADE da Org.  
6. Sede campi blank-guard.  
7. RLS deny anon/authenticated sulle 4.  
8. updated_at; seed types=11; zero residui AR dopo ROLLBACK.

---

## 28. Questioni risolte (forma fisica)

1. 4 tabelle; AR `organizations`.  
2. Redazione = `owned_by_editorial` + CHECK ternary.  
3. Tipologies seed 11; ambiti catalogo senza seed.  
4. Sede su colonne AR (no multi-sede).  
5. Ufficiali unificati in `organization_officials`.  
6. Link Impresa `linked_business_id` 0..1 RESTRICT.  
7. Lingua bigint opzionale.  
8. Pattern RLS/REVOKE/updated_at allineato a Contenuti/Eventi.  
9. Nessuna membership/Org–Org/FEV/Storage.  
10. Nessuna modifica domini chiusi.

---

## 29. Decisioni rinviate

1. Timestamp migration definitivi (Migration Plan).  
2. Seed ambiti normativi.  
3. Tabella sedi multiple.  
4. Membership Appartenenze.  
5. Org–Org tipizzate.  
6. FK cutover da etichette Eventi/Servizi/CE.  
7. Assorbimento Risorse MI.  
8. FEV/documenti.  
9. Professional Profile come soggetto ufficiale.  

Non bloccano il Migration Plan ciclo 1.

---

## 30. Criteri di accettazione

Physical accettabile se: inventario 4 tabelle chiuso; AR unica; ownership ternary DDL-garantibile; tipologies/seed allineati al Logical; sede unica; ufficiali tipizzati; link Impresa 0..1; esclusioni membership/HR/CRM/Storage/Org–Org; sufficiente al Migration Plan senza nuove decisioni semantiche.

---

## 31. Stato finale

**Physical Organizzazioni chiuso per Migration Plan ciclo 1.**  

Quattro tabelle (`organization_types`, `organization_activity_scopes`, `organizations`, `organization_officials`), AR `organizations`, ownership Persona|Impresa|Redazione, tipologies a catalogo (seed 11), sede descrittiva su AR, ufficiali owned, link Impresa facoltativo, pattern RLS deny-by-default.

Migration Plan e SQL restano fasi successive.

---

## 32. C3 Cultural Taxonomy Enrichment (addendum)

**Hybrid C.** Cultura non è BC e non è Aggregate Root. Tipology organizzativa (`organization_types`) ≠ ambito culturale.

**C3.1** (`20260813100000_seed_cultural_organization_activity_scopes.sql`): seed normativo di `organization_activity_scopes` con `culture`, `heritage`, `creative_industries`. Nessun backfill di `primary_scope_code`. Scope ≠ disciplina (C3.7 deferred).
