# Physical Domain Mapping — Dominio CONTENUTI

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/contenuti.md`.
> Il predecessore `logical/contenuti-editoriali.md` è fonte storica; in caso di divergenza prevale `contenuti.md`.
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository.
> **Non** crea Migration Plan, **non** crea migration SQL, **non** esegue apply, **non** modifica lo schema.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine).

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Contenuti** (Contenuti editoriali) |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/contenuti.md` (chiuso per Physical) |
| Stato | **Ciclo 1 chiuso** — M1–M5 completati; M6 assente; M7 assente; M8.1 SKIP; M8.2 ACCETTATA |
| Ciclo | Ciclo 1 |
| Migration Plan / SQL / M8.2 | Completati; report `docs/architecture/migrations/contenuti-validation-report.md` |

---

## 2. Scopo

Tradurre l’Aggregate Root **Contenuto** e le associazioni owned (ruoli autoriali, tag, soggetti/oggetti narrati, correlati) in un modello relazionale `public` con ownership Persona|Impresa|Redazione, tipology a catalogo, corpo unico, lifecycle multi-asse, senza CMS/page builder, versioning, traduzioni owned, Storage, commenti, Organizzazioni o Identità.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/contenuti.md` | **Autorità semantica** |
| `logical/contenuti-editoriali.md` | Predecessore; non prevale |
| `domain-model.md`, `reconciliation-report.md`, `domain-dependency-map.md` (D30–D37) | Gate, rappresentazione≠fatto, dipendenze |
| Physical/migration Persone, Imprese, Professionisti, Eventi, Servizi, Opportunità, MI | Pattern e FK reali |
| Migration SQL: `personal_stories`, `business_media` | Legacy correlati; **non** assorbiti |
| PDS §§17–19 | Sketch storico; non contratto |

---

## 4. Principi di mapping

1. Unico AR fisico `contents`; tipologies/categorie/tag sono cataloghi; autori e link sono owned.
2. Titolare = esattamente uno tra Persona (`profiles`), Impresa (`businesses`) e **Redazione** (`owned_by_editorial = true` senza FK Organizzazioni/`auth.users`).
3. Nessun `owner_type` / `entity_id` senza FK; nessun JSONB modellante; nessun ENUM PostgreSQL.
4. Autore ≠ titolare; ruoli in `content_authors` con FK tipizzate XOR + `display_label` opaca.
5. Responsabile editoriale obbligatorio in senso logico = **invariante applicativa** (almeno una riga `role_kind = 'editorial_responsible'` quando `publication_status = 'published'`); non trigger cross-table ciclo 1.
6. Lingua unica su AR: `language_id` → `languages(id)` **bigint**.
7. Corpo = `body text` unico; `body_format` ∈ (`plain_text`,`markdown`); default `markdown`.
8. Collegamenti a fatti narrati = tabelle tipizzate (no polimorfismo generico).
9. RLS ENABLE, FORCE false, zero policy, REVOKE ALL da PUBLIC/anon/authenticated.
10. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE.
11. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico.
12. Persona = `public.profiles`. Appartenenze: nessuna FK ciclo 1.
13. Contatori analytics / word_count / reading_time = **derivati**, non colonne.
14. Non assorbire `personal_stories` né `business_media`.

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `content_types` | Catalogo C03 | Dominio Contenuti |
| 2 | `content_categories` | Catalogo C03 | Dominio Contenuti |
| 3 | `content_tags` | Catalogo C03 | Dominio Contenuti |
| 4 | `contents` | Aggregate Root | Dominio Contenuti |
| 5 | `content_authors` | Entity owned / ruolo | `contents` |
| 6 | `content_tag_links` | Entity owned / link | `contents` |
| 7 | `content_subject_links` | Entity owned / soggetto narrato | `contents` |
| 8 | `content_event_links` | Entity owned / oggetto | `contents` |
| 9 | `content_opportunity_links` | Entity owned / oggetto | `contents` |
| 10 | `content_service_links` | Entity owned / oggetto | `contents` |
| 11 | `content_market_links` | Entity owned / contesto | `contents` |
| 12 | `content_relations` | Entity owned / correlati | `contents` |

**Totale ciclo 1: 12 tabelle.**

**Non create:** `content_translations`; `content_versions`; `content_blocks`; `content_sources` (sufficiente `source_url`/`source_label` su AR); tabelle media/Storage; commenti.

---

## 6. Dipendenze esterne (verifica concreta)

| Target | Migration origine | PK | Tipo PK | Uso Contenuti | ON DELETE tipico |
|---|---|---|---|---|---|
| `public.profiles` | `20260718103949_create_profiles_table.sql` | `id` | **uuid** | Titolare, autore, soggetto | RESTRICT (titolare); SET NULL (ruoli) |
| `public.businesses` | `20260731070000_create_businesses_core.sql` | `id` | **uuid** | Titolare, autore, soggetto | RESTRICT / SET NULL |
| `public.professional_profiles` | `20260804090000_create_professional_profiles.sql` | `id` | **uuid** | Autore / soggetto | SET NULL |
| `public.languages` | `20260718112212_create_languages_table.sql` | `id` | **bigint** identity | Lingua AR | RESTRICT |
| `public.events` | `20260806100000_create_events.sql` | `id` | **uuid** | Oggetto narrato | RESTRICT |
| `public.opportunities` | `20260720225301_create_opportunities_core.sql` | `id` | **uuid** | Oggetto narrato | RESTRICT |
| `public.service_offers` | `20260805110000_create_service_offers.sql` | `id` | **uuid** | Oggetto narrato | RESTRICT |
| `public.service_requests` | `20260805160000_create_service_requests.sql` | `id` | **uuid** | Oggetto narrato | RESTRICT |
| `public.international_markets` | `20260802090000_create_international_markets.sql` | `id` | **uuid** | Contesto mercato | RESTRICT |

**Non usate nel ciclo 1:** `business_memberships`; Collaborazioni; Organizzazioni; `auth.users` come owner; `personal_stories` / `business_media` come tabelle CE.

---

## 7. Aggregate root Contenuto — `contents`

**Responsabilità.** Scheda radice del Contenuto editoriale (testo, tipology, ownership, lifecycle, slug, cover opaca).

**Identità.** `id uuid PK DEFAULT gen_random_uuid()`.

### 7.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `owner_person_id` | `uuid` | SÌ | — | XOR Impresa/Redazione |
| 3 | `owner_business_id` | `uuid` | SÌ | — | XOR Persona/Redazione |
| 4 | `owned_by_editorial` | `boolean` | NO | `false` | Redazione piattaforma |
| 5 | `type_code` | `text` | NO | — | FK `content_types` |
| 6 | `primary_category_code` | `text` | SÌ | — | FK `content_categories`; 0..1 |
| 7 | `language_id` | **bigint** | NO | — | FK `languages` |
| 8 | `title` | `text` | NO | — | Non blank |
| 9 | `subtitle` | `text` | SÌ | — | Sottotitolo |
| 10 | `abstract` | `text` | SÌ | — | Sintesi |
| 11 | `body` | `text` | NO | — | Corpo unico; non blank |
| 12 | `body_format` | `text` | NO | `'markdown'` | plain_text \| markdown |
| 13 | `slug` | `text` | NO | — | Unique; non blank |
| 14 | `cover_url` | `text` | SÌ | — | Riferimento opaco; ≠ Storage |
| 15 | `source_url` | `text` | SÌ | — | Fonte/URL descrittivo |
| 16 | `source_label` | `text` | SÌ | — | Etichetta fonte opaca |
| 17 | `editorial_status` | `text` | NO | `'draft'` | draft \| ready |
| 18 | `publication_status` | `text` | NO | `'unpublished'` | unpublished \| published \| withdrawn |
| 19 | `visibility_status` | `text` | NO | `'private'` | private \| public |
| 20 | `is_featured` | `boolean` | NO | `false` | Pinning semplice |
| 21 | `published_at` | `timestamptz` | SÌ | — | Gate pubblicazione |
| 22 | `withdrawn_at` | `timestamptz` | SÌ | — | Gate ritiro |
| 23 | `archived_at` | `timestamptz` | SÌ | — | NULL = corrente |
| 24 | `created_at` | `timestamptz` | NO | `now()` | |
| 25 | `updated_at` | `timestamptz` | NO | `now()` | |

### 7.2 Vincoli

**PK:** `contents_pkey (id)`.

**FK:**

| Colonna | Target | ON UPDATE | ON DELETE |
|---|---|---|---|
| `owner_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `owner_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |
| `type_code` | `content_types(code)` | CASCADE | **RESTRICT** |
| `primary_category_code` | `content_categories(code)` | CASCADE | **RESTRICT** |
| `language_id` | `languages(id)` | NO ACTION | **RESTRICT** |

**CHECK ownership (Persona XOR Impresa XOR Redazione):**

```
(
  (owner_person_id IS NOT NULL AND owner_business_id IS NULL AND owned_by_editorial = false)
  OR (owner_person_id IS NULL AND owner_business_id IS NOT NULL AND owned_by_editorial = false)
  OR (owner_person_id IS NULL AND owner_business_id IS NULL AND owned_by_editorial = true)
)
```

**CHECK altri:**

1. `length(btrim(title)) > 0`; `length(btrim(body)) > 0`; `length(btrim(slug)) > 0`
2. `body_format ∈ ('plain_text','markdown')`
3. `editorial_status ∈ ('draft','ready')`
4. `publication_status ∈ ('unpublished','published','withdrawn')`
5. `visibility_status ∈ ('private','public')`
6. Publication gates:
   - `published` ⇒ `published_at IS NOT NULL` AND `editorial_status = 'ready'`
   - `withdrawn` ⇒ `withdrawn_at IS NOT NULL`
   - `unpublished` ⇒ `published_at IS NULL` AND `withdrawn_at IS NULL`
7. Blank-guards su subtitle/abstract/cover_url/source_url/source_label quando NOT NULL
8. Slug pattern forma fisica: `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'` (allineato a profili)

**UNIQUE:** `contents_slug_key (slug)` globale.

**Invarianti applicative (non DDL cross-table):**

1. Se `publication_status = 'published'` allora esiste ≥1 riga in `content_authors` con `role_kind = 'editorial_responsible'`.
2. Tipologia `personal_story` **non** implica ownership CE di `personal_stories` (Persone); non creare righe CE come sostituto di StoriaPersonale.
3. Tipologia `business_story` racconta Impresa via `content_subject_links` / owner; non modifica `businesses`.

**Dati vietati sulla tabella:** JSONB body/blocks; version_id; translation_group; mime/storage paths; view_count; word_count persistito; `owner_type`; `auth.users`.

---

## 8. Ownership

| Caso | Colonne |
|---|---|
| Persona | `owner_person_id` NOT NULL; altri NULL/false |
| Impresa | `owner_business_id` NOT NULL; altri NULL/false |
| Redazione | `owned_by_editorial = true`; entrambi owner_* NULL |

Nessuna FK Organizzazioni. Nessun `auth.users` come owner.

---

## 9. Tipologie — `content_types`

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `code` | `text` | NO | — PK |
| `name_it` | `text` | NO | — |
| `description` | `text` | SÌ | — |
| `is_active` | `boolean` | NO | `true` |
| `sort_order` | `integer` | NO | `0` |
| timestamps | `timestamptz` | NO | `now()` |

CHECK: code/name non blank; `sort_order >= 0`.

### Seed normativo (esatto Logical §10)

| code | name_it | sort_order | Note |
|---|---|---|---|
| `news` | Notizia | 10 | |
| `guide` | Guida | 20 | |
| `insight` | Approfondimento | 30 | |
| `interview` | Intervista | 40 | |
| `business_story` | Storia di Impresa | 50 | Owned CE |
| `event_presentation` | Presentazione Evento | 60 | ≠ scheda Evento |
| `opportunity_presentation` | Presentazione Opportunità | 70 | ≠ scheda Opportunità |
| `service_presentation` | Presentazione Servizio | 80 | ≠ Offerta/Richiesta |
| `market_content` | Contenuto su Mercato | 90 | ≠ Presenza/Interesse |
| `institutional_page` | Pagina informativa | 100 | |
| `personal_story` | Storia personale (classificazione) | 110 | **Non** assorbe `personal_stories` |

---

## 10. Categorie — `content_categories`

Catalogo piatto (no gerarchia). Stessa forma C03 di `content_types`.

**Seed ciclo 1 (forma fisica operativa; non duplica settori/servizi):**

| code | name_it | sort_order |
|---|---|---|
| `internationalization` | Internazionalizzazione | 10 |
| `entrepreneurship` | Imprenditoria | 20 |
| `regulation_compliance` | Normativa e adempimenti | 30 |
| `markets` | Mercati | 40 |
| `services_guidance` | Orientamento ai servizi | 50 |
| `events_community` | Eventi e comunità | 60 |
| `stories` | Storie e testimonianze | 70 |
| `other` | Altro | 90 |

Categoria primaria: colonna nullable su `contents`. Nessuna tabella multi-categoria ciclo 1 (Logical: al più una primaria).

---

## 11. Tag — `content_tags` + `content_tag_links`

### 11.1 `content_tags`

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `code` | `text` | NO | — PK |
| `name_it` | `text` | NO | — |
| `description` | `text` | SÌ | — |
| `is_active` | `boolean` | NO | `true` |
| `sort_order` | `integer` | NO | `0` |
| timestamps | `timestamptz` | NO | `now()` |

CHECK blank + `sort_order >= 0`.

**Seed:** nessuno obbligatorio nel ciclo 1 (vocabolario popolabile operativamente). Struttura pronta; Migration Plan non inventa tag di dominio.

### 11.2 `content_tag_links`

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `content_id` | `uuid` | NO | — |
| 3 | `tag_code` | `text` | NO | — |
| 4 | `sort_order` | `integer` | NO | `0` |
| 5–6 | timestamps | `timestamptz` | NO | `now()` |

FK: `content_id` → `contents` **CASCADE**; `tag_code` → `content_tags` **RESTRICT**.  
UNIQUE `(content_id, tag_code)`. CHECK `sort_order >= 0`.

---

## 12. Autori e responsabilità — `content_authors`

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `content_id` | `uuid` | NO | — |
| 3 | `role_kind` | `text` | NO | — |
| 4 | `person_id` | `uuid` | SÌ | — |
| 5 | `business_id` | `uuid` | SÌ | — |
| 6 | `professional_profile_id` | `uuid` | SÌ | — |
| 7 | `display_label` | `text` | SÌ | — | Autore esterno |
| 8 | `is_primary` | `boolean` | NO | `false` | Autore principale |
| 9 | `sort_order` | `integer` | NO | `0` |
| 10 | `attribution_note` | `text` | SÌ | — |
| 11–12 | timestamps | `timestamptz` | NO | `now()` |

**FK:** content **CASCADE**; person/business/professional_profile **SET NULL**.

**CHECK:**

1. `role_kind ∈ ('author','co_author','curator','editor','contributor','editorial_responsible')`
2. Almeno un soggetto: `person_id IS NOT NULL OR business_id IS NOT NULL OR professional_profile_id IS NOT NULL OR (display_label NOT NULL AND btrim > 0)`
3. Non entrambi person e business: `NOT (person_id IS NOT NULL AND business_id IS NOT NULL)`
4. `sort_order >= 0`; blank-guards su display_label/attribution_note

**UNIQUE parziali:**

- Al più un primario per contenuto: UNIQUE `(content_id)` WHERE `is_primary`
- Opzionale anti-duplicato: UNIQUE `(content_id, role_kind, person_id)` WHERE `person_id IS NOT NULL`

**Invariante applicativa:** published ⇒ ≥1 `editorial_responsible`.

---

## 13. Lingua

Su `contents.language_id` (**bigint** → `languages`). Una sola lingua per riga. Nessuna tabella traduzioni.

---

## 14. Testo e formato

- `title`, `subtitle`, `abstract`, `body` come §7.
- `body_format`: `plain_text` \| `markdown` (default `markdown`).
- Vietati: JSONB, blocks, sezioni owned, HTML arbitrario non documentato.

---

## 15. Lifecycle

Assi su `contents`: `editorial_status`, `publication_status`, `visibility_status`, `archived_at`.  
Nessun `in_review` / `approved` / `rejected` nel ciclo 1.

---

## 16. Pubblicazione

Come §7.2 gates. Nessuno scheduling (`scheduled_at` assente). Ripubblicazione ammessa tornando a `published` con nuovo `published_at` (applicazione).

---

## 17. Visibilità

`private` \| `public` soltanto. Non è policy RLS.

---

## 18. Spug e SEO

- `slug` UNIQUE globale + pattern CHECK.
- `is_featured` boolean.
- Nessun `seo_title` / `seo_description` / `canonical_url` ciclo 1.

---

## 19. Cover e riferimenti esterni

- `cover_url`, `source_url`, `source_label` opachi.
- Nessun bucket/MIME/hash/Storage.

---

## 20. Collegamenti a Servizi — `content_service_links`

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `content_id` | `uuid` | NO | — |
| 3 | `service_offer_id` | `uuid` | SÌ | — |
| 4 | `service_request_id` | `uuid` | SÌ | — |
| 5 | `relation_kind` | `text` | NO | `'presents'` |
| 6 | `sort_order` | `integer` | NO | `0` |
| 7–8 | timestamps | `timestamptz` | NO | `now()` |

FK: content **CASCADE**; offer/request **RESTRICT**.  
CHECK: esattamente uno tra offer e request NOT NULL; `relation_kind ∈ ('presents','describes','related')`; `sort_order >= 0`.  
UNIQUE parziali: `(content_id, service_offer_id)` WHERE offer NOT NULL; `(content_id, service_request_id)` WHERE request NOT NULL.

≠ duplicazione Offerta/Richiesta.

---

## 21. Collegamenti a Eventi — `content_event_links`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid PK | |
| `content_id` | uuid | CASCADE |
| `event_id` | uuid | → `events` RESTRICT |
| `relation_kind` | text | default `'presents'`; ∈ (`presents`,`report`,`related`) |
| `sort_order` | integer | default 0 |
| timestamps | timestamptz | |

UNIQUE `(content_id, event_id)`. ≠ duplicazione data/luogo/iscrizione.

---

## 22. Collegamenti a Opportunità — `content_opportunity_links`

Analogo Eventi: `opportunity_id` → `opportunities` RESTRICT; `relation_kind ∈ ('presents','guide','related')`; UNIQUE `(content_id, opportunity_id)`.

---

## 23. Collegamenti a Professionisti / Persone / Imprese (soggetti) — `content_subject_links`

SoggettoDescritto tipizzato senza polimorfismo generico.

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `content_id` | `uuid` | NO | — |
| 3 | `person_id` | `uuid` | SÌ | — |
| 4 | `business_id` | `uuid` | SÌ | — |
| 5 | `professional_profile_id` | `uuid` | SÌ | — |
| 6 | `relation_kind` | `text` | NO | `'subject'` |
| 7 | `sort_order` | `integer` | NO | `0` |
| 8–9 | timestamps | `timestamptz` | NO | `now()` |

FK: content CASCADE; person/business RESTRICT; professional_profile SET NULL.  
CHECK: esattamente uno dei tre soggetti NOT NULL; `relation_kind ∈ ('subject','cited','interviewed','context')`.  
UNIQUE parziali per ciascun soggetto valorizzato con `(content_id, person_id|business_id|professional_profile_id, relation_kind)`.

Copre Professionisti (D32), Persone (D30), Imprese soggette (D31) senza tabelle duplicate.

---

## 24. Collegamenti a Imprese (titolarità)

La titolarità Impresa è su `contents.owner_business_id`.  
Il ruolo di soggetto narrato (StoriaImpresa) usa `content_subject_links.business_id`.  
Nessuna terza tabella `content_business_links` nel ciclo 1 (evita ridondanza).

---

## 25. Collegamenti a Mercati — `content_market_links`

| Colonna | Tipo | Note |
|---|---|---|
| `content_id` | uuid | CASCADE |
| `market_id` | uuid | → `international_markets` RESTRICT |
| `relation_kind` | text | default `'focus'`; ∈ (`focus`,`related`,`destination`) |
| `sort_order` | integer | |
| timestamps | timestamptz | |

UNIQUE `(content_id, market_id)`. ≠ Presenza/Interesse/Attività MI.

---

## 26. Contenuti correlati — `content_relations`

Inclusa nel ciclo 1 in forma minimale (Logical: ammissibile; featured resta su AR).

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid PK | |
| `source_content_id` | uuid | CASCADE |
| `target_content_id` | uuid | CASCADE |
| `relation_kind` | text | ∈ (`related`,`follow_up`,`recommended`) |
| `sort_order` | integer | default 0 |
| timestamps | timestamptz | |

CHECK: `source_content_id <> target_content_id`.  
UNIQUE `(source_content_id, target_content_id, relation_kind)`.  
Nessun grafo editoriale avanzato / serie.

---

## 27. Fonti e citazioni

Nessuna tabella `content_sources`. Sufficienza: `source_url` + `source_label` su AR. FEV escluso.

---

## 28. Tabelle legacy

| Struttura | Ownership | Decisione Contenuti ciclo 1 |
|---|---|---|
| `personal_stories` | Persone | **Esclusione**; non migrare; tipology `personal_story` solo classificazione |
| `business_media` | Imprese | **Esclusione**; ≠ cover CE; ≠ StoriaImpresa |
| Tabelle `content*` | **Inesistenti** | Greenfield |
| DV4 `training_*` / language_service_* | Legacy | **Esclusione** |

---

## 29. Indici

| Tabella | Indici |
|---|---|
| `contents` | partial owner_person; partial owner_business; partial owned_by_editorial WHERE true; `(type_code)`; `(language_id)`; `(publication_status)`; partial published; partial featured WHERE true; partial archived; UNIQUE slug |
| `content_authors` | `(content_id)`; partial person/business/professional; partial primary |
| `content_tag_links` | `(content_id)`; `(tag_code)` |
| `content_subject_links` | `(content_id)`; partials su person/business/professional |
| `content_event_links` | `(content_id)`; `(event_id)` |
| `content_opportunity_links` | `(content_id)`; `(opportunity_id)` |
| `content_service_links` | `(content_id)`; partials offer/request |
| `content_market_links` | `(content_id)`; `(market_id)` |
| `content_relations` | `(source_content_id)`; `(target_content_id)` |
| Cataloghi | `(is_active)`; `(sort_order)` |

---

## 30. Trigger e funzioni

Per **tutte le 12 tabelle**:

```
function public.set_<table>_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW.

Nomi abbreviabili se >63 byte (es. `set_content_opportunity_links_updated_at`).  
**Nessun** trigger cross-table per responsabile editoriale o pubblicazione.

---

## 31. RLS e privilegi

Per ogni tabella Contenuti (incluso catalogo):

- `ENABLE ROW LEVEL SECURITY`
- **FORCE RLS: false**
- **0 policy**
- `REVOKE ALL` da PUBLIC, anon, authenticated
- **Nessun GRANT** applicativo

---

## 32. COMMENT ON

Obbligatori: COMMENT ON TABLE tutte; COMMENT ON COLUMN per ownership XOR/Redazione, type_code, language_id, body_format, assi stato, slug, cover_url, source_*, is_featured, archived_at, ruoli autori, relation_kind dei link; COMMENT ON FUNCTION per ogni `set_*_updated_at`.

Testi devono dichiarare: ≠ Evento; ≠ OffertaDiServizio; ≠ Opportunità; ≠ StoriaPersonale (`personal_stories`); ≠ MediaImpresa; ≠ Storage; ≠ CMS blocks; ≠ ticketing.

---

## 33. Seed

| Oggetto | Seed ciclo 1 |
|---|---|
| `content_types` | **11** righe §9 |
| `content_categories` | **8** righe §10 |
| `content_tags` | **0** (struttura pronta) |
| AR / authors / links | **Nessun** seed demo |

---

## 34. Dati derivati

Non persistiti: word_count, reading_time, public_url, view_count, engagement, completeness score, ranking correlati automatici.

---

## 35. Oggetti esclusi

Versioning; traduzioni owned; blocks/JSONB/page builder; Storage/MIME/hash; commenti/reazioni/analytics; FEV/fonti strutturate; scheduling/embargo; SEO avanzata; Organizzazioni AR; `auth.users` owner; `entity_type`/`entity_id`; policy Identità; assorbimento `personal_stories`/`business_media`; Collaborazioni link (non prioritario); serie editoriali complesse.

---

## 36. Ordine di creazione

1. `content_types` (+ seed)  
2. `content_categories` (+ seed)  
3. `content_tags`  
4. `contents`  
5. `content_authors`  
6. `content_tag_links`  
7. `content_subject_links`  
8. `content_event_links`  
9. `content_opportunity_links`  
10. `content_service_links`  
11. `content_market_links`  
12. `content_relations`  
13. Chiusura documentale Migration Plan (fuori SQL)

Precondizioni esterne: `profiles`, `businesses`, `professional_profiles`, `languages`, `events`, `opportunities`, `service_offers`, `service_requests`, `international_markets`.

**Timestamp migration:** da assegnare nel Migration Plan; devono essere > head Eventi (`20260806170000`) e strettamente crescenti. *(Proposta preliminare non vincolante: partire da `20260807090000`.)*

---

## 37. Matrice Logical → Physical

| Logical | Physical |
|---|---|
| Contenuto (AR) | `contents` |
| TipologiaEditoriale | `content_types` + `type_code` |
| CategoriaContenuto | `content_categories` + `primary_category_code` |
| Tag | `content_tags` + `content_tag_links` |
| Autore / Curatore / Responsabile | `content_authors` |
| SoggettoDescritto | `content_subject_links` |
| Oggetto Evento | `content_event_links` |
| Oggetto Opportunità | `content_opportunity_links` |
| Oggetto Servizio | `content_service_links` |
| Contesto Mercato | `content_market_links` |
| Contenuto correlato | `content_relations` |
| Pubblicazione / Visibilità | assi su `contents` |
| Cover / fonte opaca | `cover_url`, `source_url`, `source_label` |
| StoriaPersonale | **non mappata** (Persone / `personal_stories`) |
| Versione / Traduzione / Blocchi / Storage | **non mappati** |

---

## 38. Contratti DDL-ready (checklist per tabella)

Per ciascuna delle 12 tabelle il Migration Plan dovrà verificare:

1. nome  
2. responsabilità  
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
22. seed solo cataloghi tipizzati (§33)  
23. dipendenze rispettate  
24–26. test statici / runtime / post-apply  

**Vietati in SQL:** `IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PG; polimorfismo; FORCE RLS true; GRANT anon/authenticated; seed demo AR; Storage; versioning; translations.

---

## 39. Test statici

- Conteggio tabelle Contenuti = 12  
- CREATE TABLE = 12; ENABLE RLS = 12; CREATE POLICY = 0; GRANT applicativi = 0  
- JSONB modellante = 0; entity_type/entity_id = 0; DO = 0; IF NOT EXISTS = 0  
- Identificatori ≤ 63 byte  
- Seed types = 11; categories = 8; tags = 0  
- Nessuna tabella translation/version/block/comment/storage  
- FK tipi: languages bigint; altri uuid  
- Ownership CHECK ternary presente  
- Nessuna modifica a `personal_stories` / `business_media` / Eventi / Servizi  

---

## 40. Test runtime (ROLLBACK)

1. Insert Contenuto owner Persona; Impresa; Redazione (`owned_by_editorial`); rifiuto nessuno/doppi/misti invalidi.  
2. type_code valido; type inesistente rifiutato; language bigint.  
3. Publication gates; slug unique; body_format.  
4. Autori: person/business/label; XOR; primary unica; ruolo invalido.  
5. Tag links UNIQUE; CASCADE da content.  
6. Subject links: person/business/professional; XOR soggetto.  
7. Event/opportunity/service/market links UNIQUE; RESTRICT target; CASCADE content.  
8. Service links: offer XOR request.  
9. Relations: no self-link; UNIQUE; CASCADE.  
10. RESTRICT delete language/type con contenuti.  
11. RESTRICT delete owner person/business con contenuti.  
12. RLS deny anon/authenticated su tutte le 12.  
13. updated_at su update.  
14. Seed types=11; categories=8; zero residui AR dopo ROLLBACK.  
15. Nessuna scrittura su `personal_stories` / `business_media` nei test CE.

---

## 41. Verifiche post-apply

- Local head include tutte le migration Contenuti del blocco.  
- 12 tabelle; RLS/FORCE/policy/privilegi conformi.  
- Cataloghi seed conformi.  
- Zero policy; zero GRANT; zero dati demo AR.  
- Hash SQL invariati; legacy intatte; Eventi/Servizi intatti.

---

## 42. Questioni risolte (forma fisica)

1. AR = `contents`; 12 tabelle ciclo 1.  
2. Redazione = `owned_by_editorial` boolean + CHECK ternary (no Org/`auth.users`).  
3. Tipologies = `content_types` con seed 11 (incluso `personal_story` classificativo).  
4. Categorie piatte + primary FK; tag controllati + link.  
5. Autori tipizzati XOR + label; responsabile = invariante applicativa.  
6. Lingua unica bigint su AR.  
7. Corpo unico + `body_format`.  
8. Link tipizzati verso Eventi/Opportunità/Servizi/Mercati/Soggetti.  
9. Correlati minimali inclusi; fonti strutturate escluse.  
10. Legacy `personal_stories` / `business_media` non assorbite.  
11. Pattern RLS/REVOKE/updated_at allineato a Eventi/Servizi.  
12. Nessun CMS/Storage/versioning/traduzioni.

---

## 43. Decisioni rinviate

1. Trigger DDL per responsabile editoriale obbligatorio.  
2. Multi-categoria / gerarchia categorie.  
3. Seed tag normativi.  
4. Versioning e traduzioni.  
5. `content_sources` strutturate / FEV.  
6. SEO title/description/canonical.  
7. Scheduling/embargo/visibilità avanzate.  
8. Collaborazioni link.  
9. Consolidamento Dependency Map D32–D37 + CE→Servizi.  
10. Timestamp migration definitivi (Migration Plan).  
11. Eventuale tabella dedicata business-link se si vuole separare da subject_links.  

Non bloccano il Migration Plan ciclo 1.

---

## 44. Criteri per Migration Plan

Il Migration Plan dovrà:

1. Assegnare timestamp strettamente crescenti dopo `20260806170000`.  
2. Una tabella per migration (catalogo+seed nella stessa unità solo se pattern M1 Servizi/Eventi).  
3. Realizzare integralmente i contratti §§7–27.  
4. Includere test dell’invariante responsabile editoriale (applicativa).  
5. Non anticipare oggetti §35.  
6. Prevedere apply locale cumulativo e validazione delle 12 tabelle.  
7. Non modificare migration Eventi/Servizi/Persone/`personal_stories`/`business_media`.

---

## 45. Criteri di accettazione

Physical accettabile se: inventario 12 tabelle chiuso; AR unica; ownership ternary DDL-garantibile; tipologies/seed allineati al Logical; link tipizzati; legacy esclusi; esclusi CMS/Storage/versioning/Org/Identità; sufficiente al Migration Plan senza nuove decisioni semantiche.

---

## 46. Stato finale

**Physical Contenuti — ciclo 1 chiuso.**

Dodici tabelle (`content_types` … `content_relations`), AR `contents`, ownership Persona|Impresa|Redazione, tipologies e categorie a catalogo, autori e link tipizzati, corpo unico, pattern RLS deny-by-default.

Stato operativo: **M1–M5 completati**; **M6 assente**; **M7 assente**; **M8.1 SKIP**; **M8.2 ACCETTATA**.

Report: `docs/architecture/migrations/contenuti-validation-report.md`.
