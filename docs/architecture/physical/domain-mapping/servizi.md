# Physical Domain Mapping — Dominio SERVIZI

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/servizi.md`.
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository.
> **Non** crea migration SQL, **non** esegue apply, **non** modifica lo schema.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine).

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Servizi** |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/servizi.md` (approvabile) |
| Stato | **Chiuso per Migration Plan** (salvo §37) |
| Ciclo | Ciclo 1 |
| Migration Plan / SQL | **Fuori da questo documento** |

---

## 2. Scopo

Tradurre OffertaDiServizio e RichiestaDiServizio in un modello relazionale `public` con due Aggregate Root distinte, ownership chiara Persona|Impresa, copertura e lingue owned dalle AR, condizioni economiche solo descrittive, lifecycle multi-asse, senza marketplace, FEV, DV4, Eventi, Contenuti, Organizzazioni o Identità.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/servizi.md` | Autorità semantica |
| `domain-model.md`, `reconciliation-report.md`, `domain-dependency-map.md` | Gate, DV4, confini |
| Physical/migration Persone, Imprese, Appartenenze, MI, Professionisti, Opportunità | Pattern e FK reali |
| Migration SQL esistenti | Verifica tipi/PK (non autorità semantica) |
| PDS | Contesto storico; non contratto |

---

## 4. Principi di mapping

1. Due AR fisiche distinte; nessun polimorfismo Offerta/Richiesta.
2. Titolare = esattamente una tra Persona (`profiles`) e Impresa (`businesses`) via FK reali + CHECK XOR.
3. Nessun `owner_type`/`entity_id` senza FK; nessun JSONB modellante.
4. Riferimenti a `professional_services` / `business_services` facoltativi, non duplicativi, `ON DELETE SET NULL`.
5. Territori con `country_ref` opaco (pattern Professionisti M5); nessun catalogo regioni/comuni.
6. Lingue → `languages(id)` **bigint**; settori → `business_sectors(id)` **bigint**; mercati → `international_markets(id)` **uuid**.
7. Cataloghi Servizi solo se responsabilità distinta; niente riuso di `professional_service_natures` né cataloghi DV4.
8. RLS ENABLE, FORCE RLS false, zero policy, REVOKE ALL da PUBLIC/anon/authenticated.
9. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE.
10. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico.
11. Persona = `public.profiles` (non esiste `people`).
12. Appartenenze (`business_memberships`) non referenziate nel ciclo 1 (utilizzo applicativo futuro).

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `service_categories` | Catalogo C03 | Dominio Servizi |
| 2 | `service_economic_bands` | Catalogo C03 | Dominio Servizi |
| 3 | `service_offers` | Aggregate Root | Dominio Servizi |
| 4 | `service_offer_territories` | Entity owned | `service_offers` |
| 5 | `service_offer_languages` | Entity owned / link | `service_offers` |
| 6 | `service_offer_sectors` | Entity owned / link | `service_offers` |
| 7 | `service_offer_markets` | Entity owned / link | `service_offers` |
| 8 | `service_requests` | Aggregate Root | Dominio Servizi |
| 9 | `service_request_territories` | Entity owned | `service_requests` |
| 10 | `service_request_languages` | Entity owned / link | `service_requests` |
| 11 | `service_request_sectors` | Entity owned / link | `service_requests` |

**Totale ciclo 1: 11 tabelle.**

---

## 6. Dipendenze esterne (verifica concreta)

| Target | Migration origine | PK | Tipo PK | Uso Servizi | ON DELETE tipico |
|---|---|---|---|---|---|
| `public.profiles` | `20260718103949_create_profiles_table.sql` | `id` | **uuid** (FK → `auth.users`) | Titolare/erogatore Persona | RESTRICT |
| `public.businesses` | `20260731070000_create_businesses_core.sql` | `id` | **uuid** | Titolare/erogatore Impresa | RESTRICT |
| `public.professional_profiles` | `20260804090000_create_professional_profiles.sql` | `id` | **uuid** | Erogatore facoltativo | SET NULL |
| `public.professional_services` | `20260804170000_create_professional_services.sql` | `id` | **uuid** | Provenienza facoltativa | SET NULL |
| `public.business_services` | `20260731130000_create_business_services.sql` | `id` | **uuid** | Provenienza facoltativa | SET NULL |
| `public.languages` | `20260718112212_create_languages_table.sql` | `id` | **bigint** identity | Lingue owned | RESTRICT |
| `public.business_sectors` | `20260718192646_create_business_sectors_table.sql` | `id` | **bigint** identity | Settori owned | RESTRICT |
| `public.international_markets` | `20260802090000_create_international_markets.sql` | `id` | **uuid** | Mercati facoltativi | RESTRICT |
| `public.opportunities` | `20260720225301_create_opportunities_core.sql` | `id` | **uuid** | Contesto facoltativo | SET NULL |

**Non usate nel ciclo 1:** `business_memberships` (uuid, esiste) — nessuna FK; `people` — **inesistente**; cataloghi DV4; `professional_service_natures`; `professional_operational_languages`; `professional_served_territories`.

---

## 7. Aggregate root Offerta — `service_offers`

**Responsabilità.** Scheda strutturata pubblicabile di un servizio offerto (OffertaDiServizio).

**Identità.** `id uuid PK DEFAULT gen_random_uuid()`.

### 7.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `owner_person_id` | `uuid` | SÌ | — | XOR con business |
| 3 | `owner_business_id` | `uuid` | SÌ | — | XOR con person |
| 4 | `provider_person_id` | `uuid` | SÌ | — | Erogatore Persona; ≤1 provider |
| 5 | `provider_professional_profile_id` | `uuid` | SÌ | — | Erogatore Profilo |
| 6 | `provider_business_id` | `uuid` | SÌ | — | Erogatore Impresa |
| 7 | `source_professional_service_id` | `uuid` | SÌ | — | Provenienza descrittiva |
| 8 | `source_business_service_id` | `uuid` | SÌ | — | Provenienza descrittiva |
| 9 | `context_opportunity_id` | `uuid` | SÌ | — | Contesto Opportunità |
| 10 | `category_code` | `text` | NO | — | FK catalogo |
| 11 | `title` | `text` | NO | — | Non blank |
| 12 | `summary` | `text` | SÌ | — | Sintesi |
| 13 | `description` | `text` | NO | — | Descrizione sostanziale; non blank |
| 14 | `nature_label` | `text` | SÌ | — | Natura dichiarativa (non catalogo Professionisti) |
| 15 | `delivery_mode` | `text` | NO | `'unspecified'` | CHECK |
| 16 | `audience_kind` | `text` | NO | `'both'` | CHECK |
| 17 | `audience_note` | `text` | SÌ | — | Segmento descrittivo libero |
| 18 | `specialization_note` | `text` | SÌ | — | Affinamento testuale verticale |
| 19 | `language_direction` | `text` | SÌ | — | Solo contesto linguistico |
| 20 | `economic_kind` | `text` | NO | `'none'` | CHECK |
| 21 | `economic_band_code` | `text` | SÌ | — | FK catalogo se kind=indicative_band |
| 22 | `economic_note` | `text` | SÌ | — | Note descrittive |
| 23 | `editorial_status` | `text` | NO | `'draft'` | Asse redazione |
| 24 | `publication_status` | `text` | NO | `'unpublished'` | Asse pubblicazione |
| 25 | `availability_status` | `text` | NO | `'available'` | Asse disponibilità |
| 26 | `visibility_status` | `text` | NO | `'private'` | Visibilità sostanziale |
| 27 | `published_at` | `timestamptz` | SÌ | — | Metadato pubblicazione |
| 28 | `withdrawn_at` | `timestamptz` | SÌ | — | Metadato ritiro |
| 29 | `archived_at` | `timestamptz` | SÌ | — | NULL = corrente |
| 30 | `external_organization_label` | `text` | SÌ | — | Ente informativo (no FK Organizzazioni) |
| 31 | `created_at` | `timestamptz` | NO | `now()` | |
| 32 | `updated_at` | `timestamptz` | NO | `now()` | |

### 7.2 Vincoli

**PK:** `service_offers_pkey (id)`.

**FK:**

| Colonna | Target | ON UPDATE | ON DELETE |
|---|---|---|---|
| `owner_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `owner_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |
| `provider_person_id` | `profiles(id)` | NO ACTION | **SET NULL** |
| `provider_professional_profile_id` | `professional_profiles(id)` | NO ACTION | **SET NULL** |
| `provider_business_id` | `businesses(id)` | NO ACTION | **SET NULL** |
| `source_professional_service_id` | `professional_services(id)` | NO ACTION | **SET NULL** |
| `source_business_service_id` | `business_services(id)` | NO ACTION | **SET NULL** |
| `context_opportunity_id` | `opportunities(id)` | NO ACTION | **SET NULL** |
| `category_code` | `service_categories(code)` | CASCADE | **RESTRICT** |
| `economic_band_code` | `service_economic_bands(code)` | CASCADE | **RESTRICT** |

**CHECK:**

1. Owner XOR: `((owner_person_id IS NOT NULL AND owner_business_id IS NULL) OR (owner_person_id IS NULL AND owner_business_id IS NOT NULL))`
2. Provider at most one: numero di NOT NULL tra i tre provider ≤ 1
3. Provenienza mutuamente esclusiva: `NOT (source_professional_service_id IS NOT NULL AND source_business_service_id IS NOT NULL)`
4. `length(btrim(title)) > 0`; `length(btrim(description)) > 0`
5. `delivery_mode ∈ ('in_person','remote','hybrid','unspecified')`
6. `audience_kind ∈ ('persons','businesses','both')`
7. `language_direction IS NULL OR language_direction ∈ ('mono','bidirectional','unspecified')`
8. `economic_kind ∈ ('none','free','on_request','indicative_band','discounted')`
9. Se `economic_kind = 'indicative_band'` allora `economic_band_code IS NOT NULL`; altrimenti `economic_band_code IS NULL`
10. `editorial_status ∈ ('draft','ready')`
11. `publication_status ∈ ('unpublished','published','withdrawn')`
12. `availability_status ∈ ('available','paused','unavailable')`
13. `visibility_status ∈ ('private','public')`
14. Se `publication_status = 'published'` allora `published_at IS NOT NULL` e `editorial_status = 'ready'`
15. Se `publication_status = 'withdrawn'` allora `withdrawn_at IS NOT NULL`
16. Se `publication_status = 'unpublished'` allora `published_at IS NULL` e `withdrawn_at IS NULL`
17. Nature/audience/specialization/external label: se NOT NULL allora `length(btrim(...)) > 0`

**UNIQUE:** nessuno su title (omonimi ammessi).

**Indici:** vedi §23.

**Dati vietati sulla tabella:** `amount`, `min_amount`, `max_amount`, `hourly_rate`, `currency` di regolamento, order/payment fields, calendar fields, JSONB payload, `membership_id`, `owner_type`.

---

## 8. Aggregate root Richiesta — `service_requests`

**Responsabilità.** Scheda strutturata di bisogno di servizio (RichiestaDiServizio).

### 8.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `owner_person_id` | `uuid` | SÌ | — | XOR |
| 3 | `owner_business_id` | `uuid` | SÌ | — | XOR |
| 4 | `context_opportunity_id` | `uuid` | SÌ | — | Contesto |
| 5 | `category_code` | `text` | NO | — | FK |
| 6 | `title` | `text` | NO | — | |
| 7 | `summary` | `text` | SÌ | — | |
| 8 | `description` | `text` | NO | — | |
| 9 | `nature_label` | `text` | SÌ | — | |
| 10 | `delivery_mode` | `text` | NO | `'unspecified'` | Preferenza |
| 11 | `audience_kind` | `text` | NO | `'both'` | Chi cerca (auto-descrizione) |
| 12 | `specialization_note` | `text` | SÌ | — | |
| 13 | `language_direction` | `text` | SÌ | — | |
| 14 | `economic_kind` | `text` | NO | `'none'` | Budget descrittivo |
| 15 | `economic_band_code` | `text` | SÌ | — | |
| 16 | `economic_note` | `text` | SÌ | — | |
| 17 | `editorial_status` | `text` | NO | `'draft'` | |
| 18 | `publication_status` | `text` | NO | `'unpublished'` | |
| 19 | `process_status` | `text` | NO | `'open'` | Percorso sostanziale |
| 20 | `visibility_status` | `text` | NO | `'private'` | |
| 21 | `urgency_kind` | `text` | SÌ | — | |
| 22 | `expires_at` | `date` | SÌ | — | Scadenza descrittiva |
| 23 | `published_at` | `timestamptz` | SÌ | — | |
| 24 | `withdrawn_at` | `timestamptz` | SÌ | — | |
| 25 | `archived_at` | `timestamptz` | SÌ | — | |
| 26 | `external_organization_label` | `text` | SÌ | — | |
| 27 | `created_at` | `timestamptz` | NO | `now()` | |
| 28 | `updated_at` | `timestamptz` | NO | `now()` | |

**Nessun** provider; **nessun** source_professional/business_service; **nessuna** candidatura/matching.

### 8.2 Vincoli

Owner XOR e FK come Offerta (person/business/opportunity/category/band).

**CHECK aggiuntivi:**
- `process_status ∈ ('open','in_evaluation','concluded','expired')`
- `urgency_kind IS NULL OR urgency_kind ∈ ('low','medium','high')`
- Stessi vincoli pubblicazione/editorial/economic/delivery/audience di Offerta (adattati; **nessun** `availability_status` — sostituito da `process_status`)
- Nessuno stato `assigned` (marketplace vietato)

---

## 9. Cataloghi

### 9.1 `service_categories`

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `code` | `text` | NO | — PK |
| `name_it` | `text` | NO | — |
| `description` | `text` | SÌ | — |
| `is_active` | `boolean` | NO | `true` |
| `sort_order` | `integer` | NO | `0` |
| `created_at` | `timestamptz` | NO | `now()` |
| `updated_at` | `timestamptz` | NO | `now()` |

CHECK: `length(btrim(code)) > 0`; `length(btrim(name_it)) > 0`; `sort_order >= 0`.

**Seed normativo ciclo 1:**

| code | name_it | sort_order |
|---|---|---|
| `linguistic` | Servizi linguistici e interculturali | 10 |
| `training` | Servizi formativi | 20 |
| `professional_generic` | Servizi professionali generici | 30 |
| `financial` | Servizi finanziari | 40 |
| `real_estate` | Servizi immobiliari | 50 |
| `support_other` | Supporto / altro | 90 |

≠ `professional_categories`; ≠ DV4 `language_service_types`.

### 9.2 `service_economic_bands`

Etichette di fascia **descrittiva** (non prezzi).

| Colonna | Tipo | Null | Default |
|---|---|---|---|
| `code` | `text` | NO | — PK |
| `name_it` | `text` | NO | — |
| `description` | `text` | SÌ | — |
| `is_active` | `boolean` | NO | `true` |
| `sort_order` | `integer` | NO | `0` |
| `created_at` / `updated_at` | `timestamptz` | NO | `now()` |

**Seed:**

| code | name_it | sort_order |
|---|---|---|
| `low` | Fascia bassa | 10 |
| `medium` | Fascia media | 20 |
| `high` | Fascia alta | 30 |
| `variable` | Variabile / da concordare | 40 |

**Non cataloghi:** `service_natures` (usa `nature_label`); `service_delivery_modes` (CHECK); `service_audience_types` (CHECK `audience_kind`); DV4.

---

## 10. Soggetti e ownership

| Ruolo | Modello fisico |
|---|---|
| Titolare Offerta/Richiesta | `owner_person_id` **XOR** `owner_business_id` (FK reali) |
| Erogatore Offerta | 0..1 tra `provider_*`; se tutti NULL → coincidenza logica col titolare (non materializzata) |
| Richiedente | = titolare della Richiesta |
| Appartenenza | Nessuna FK ciclo 1 |
| Organizzazione | Solo `external_organization_label` |

---

## 11. Classificazioni

| Concetto logico | Forma fisica |
|---|---|
| Categoria verticale | FK `category_code` → `service_categories` (1 per AR) |
| Natura | `nature_label` text |
| Specializzazione | `specialization_note` text |
| Verticale | Valori del catalogo categorie (non tabelle specializzate) |
| Settore servito | Link owned → `business_sectors` |

---

## 12. Modalità di erogazione

Colonna singola `delivery_mode` su entrambe le AR:

`in_person` | `remote` | `hybrid` | `unspecified`

Cardinalità 1 valore chiuso (Logical: presenza / remoto / entrambe). Nessuna M:N.

---

## 13. Territori Offerta — `service_offer_territories`

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `service_offer_id` | `uuid` | NO | — |
| 3 | `country_ref` | `text` | NO | — |
| 4 | `territory_label` | `text` | SÌ | — |
| 5 | `coverage_kind` | `text` | NO | `'served'` |
| 6 | `presence_mode` | `text` | NO | `'unspecified'` |
| 7 | `sort_order` | `integer` | NO | `0` |
| 8–9 | `created_at` / `updated_at` | `timestamptz` | NO | `now()` |

- FK `service_offer_id` → `service_offers(id)` ON DELETE **CASCADE**
- UNIQUE parziale: `(service_offer_id, country_ref, coverage_kind)` — tutte le righe (ciclo 1 senza soft-remove; se serve remove, rinviare `declaration_status`)
- CHECK: `country_ref` non blank; `coverage_kind ∈ ('served','primary','both')`; `presence_mode ∈ ('in_person','remote','hybrid','unspecified')`; `sort_order >= 0`
- **Nessuna** FK geografica; **nessun** `verification_status` (no FEV)

---

## 14. Territori Richiesta — `service_request_territories`

Stessa struttura di §13 con `service_request_id` → `service_requests(id)` CASCADE. Tabelle **distinte** (ownership AR distinta; niente polimorfismo).

---

## 15. Lingue Offerta — `service_offer_languages`

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `service_offer_id` | `uuid` | NO | — |
| 3 | `language_id` | `bigint` | NO | — |
| 4 | `usage_role` | `text` | NO | `'delivery'` |
| 5 | `pair_group_id` | `uuid` | SÌ | — | Accoppia source/target |
| 6 | `sort_order` | `integer` | NO | `0` |
| 7–8 | timestamps | `timestamptz` | NO | `now()` |

- FK offer CASCADE; FK `language_id` → `languages(id)` ON DELETE **RESTRICT** ON UPDATE NO ACTION
- UNIQUE `(service_offer_id, language_id, usage_role)`
- CHECK `usage_role ∈ ('delivery','source','target','support')`; `sort_order >= 0`
- ≠ `professional_operational_languages`; ≠ DV4 `profile_language_services`

**Coppia linguistica:** due righe `source`+`target` con stesso `pair_group_id` (opzionale; invariante applicativa rafforzabile in ciclo successivo).

---

## 16. Lingue Richiesta — `service_request_languages`

Come §15 con `service_request_id`; `usage_role` default `'delivery'` ammesso anche `'source'|'target'|'support'` per bisogni linguistici.

---

## 17. Destinatari e settori

**Destinatari:** `audience_kind` + `audience_note` sull’AR. Nessun CRM, nessuna tabella audience nominativa.

**Settori — `service_offer_sectors` / `service_request_sectors`:**

| Colonna | Tipo | Null |
|---|---|---|
| `id` | uuid PK | NO |
| `service_offer_id` / `service_request_id` | uuid | NO |
| `sector_id` | **bigint** | NO |
| `sort_order` | integer | NO default 0 |
| timestamps | timestamptz | NO |

FK settore → `business_sectors(id)` RESTRICT; owner CASCADE; UNIQUE `(owner_id, sector_id)`.

---

## 18. Condizioni economiche

Solo su AR:

| Campo | Ruolo |
|---|---|
| `economic_kind` | `none` / `free` / `on_request` / `indicative_band` / `discounted` |
| `economic_band_code` | FK catalogo se indicative_band |
| `economic_note` | Testo |

**Esclusi:** amount, min/max, hourly_rate, currency obbligatoria, transaction, payment, invoice, commission, order.

---

## 19. Lifecycle

| Asse | Offerta | Richiesta |
|---|---|---|
| Redazione | `editorial_status` draft\|ready | idem |
| Pubblicazione | `publication_status` unpublished\|published\|withdrawn | idem |
| Disponibilità / processo | `availability_status` available\|paused\|unavailable | `process_status` open\|in_evaluation\|concluded\|expired |
| Archiviazione | `archived_at` NULL\|set | idem |
| Date | `published_at`, `withdrawn_at` | + `expires_at` |

Bozza (`draft` + `unpublished`) non è pubblicata. Archiviata (`archived_at IS NOT NULL`) resta storicizzata indipendentemente da availability. Nessuna moderazione Identità.

---

## 20. Pubblicazione

- `publication_status` + `published_at` / `withdrawn_at`
- `visibility_status` private|public (sostanziale; non RLS policy)
- Deny-by-default a livello privilegi; policy applicative → Identità futura

---

## 21. Disponibilità

Solo dichiarativa sull’Offerta (`available` / `paused` / `unavailable`).
**Esclusi:** calendario, slot, sessioni, capacità numeriche, prenotazioni, ricorrenze.

---

## 22. Tabelle di link (sintesi)

| Link | Cardinalità | ON DELETE owner |
|---|---|---|
| offer/request territories | AR 1 → 0..N | CASCADE |
| offer/request languages | AR 1 → 0..N | CASCADE |
| offer/request sectors | AR 1 → 0..N | CASCADE |
| offer markets | AR 1 → 0..N | CASCADE |
| source professional/business service | 0..1 colonne su Offerta | SET NULL |
| context opportunity | 0..1 su entrambe AR | SET NULL |

### 22.1 `service_offer_markets`

| Colonna | Tipo | Null |
|---|---|---|
| `id` | uuid PK | NO |
| `service_offer_id` | uuid | NO |
| `market_id` | uuid | NO |
| `relation_kind` | text | NO default `'served'` |
| `sort_order` | integer | NO default 0 |
| timestamps | | |

FK market → `international_markets(id)` RESTRICT; UNIQUE `(service_offer_id, market_id)`; CHECK `relation_kind ∈ ('served','supported','target')`.

**Nessuna** tabella mercati sulla Richiesta nel ciclo 1 (rinviata se necessaria).

---

## 23. Indici

| Tabella | Indice |
|---|---|
| `service_offers` | `(owner_person_id)` WHERE NOT NULL; `(owner_business_id)` WHERE NOT NULL; `(category_code)`; `(publication_status)`; partial published `(publication_status)` WHERE `published`; `(availability_status)`; `(archived_at)` WHERE NOT NULL |
| `service_requests` | analoghi + `(process_status)`; `(expires_at)` WHERE NOT NULL |
| territories | owner; `(country_ref)` |
| languages | owner; `(language_id)` |
| sectors | owner; `(sector_id)` |
| markets | owner; `(market_id)` |
| cataloghi | `(is_active)`, `(sort_order)` |

---

## 24. Trigger e funzioni

Per ogni tabella con `updated_at` (tutte le 11):

```
function public.set_<table>_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW.

Nomi abbreviabili se >63 byte (es. `set_svc_offer_territories_updated_at`). Nessuna altra funzione ciclo 1.

---

## 25. RLS e privilegi

Per **ogni** tabella Servizi (inclusi cataloghi):

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- **FORCE RLS: false**
- **0 policy**
- `REVOKE ALL ON TABLE ... FROM PUBLIC, anon, authenticated;`
- **Nessun GRANT**

Nota: non copiare la policy legacy di lettura pubblica su `languages`.

---

## 26. COMMENT ON

Obbligatori: COMMENT ON TABLE per tutte; COMMENT ON COLUMN per colonne ambigue (owner XOR, provider, source_*, economic_*, assi stato, `country_ref`, `pair_group_id`, `archived_at`, `external_organization_label`); COMMENT ON FUNCTION per ogni `set_*_updated_at`.

Testi devono dichiarare: ≠ ServizioProfessionale; ≠ ServizioImpresa; ≠ Opportunità; ≠ marketplace; ≠ DV4.

---

## 27. Seed

| Oggetto | Seed ciclo 1 |
|---|---|
| `service_categories` | 6 righe §9.1 |
| `service_economic_bands` | 4 righe §9.2 |
| AR / owned | **Nessun** seed demo |

---

## 28. DV4

| Struttura | Decisione fisica ciclo 1 |
|---|---|
| `language_service_*` | Non proprietà; nessuna FK; nessuna migrazione dati; nessuna rinomina; nessuna modifica |
| `profile_language_services*` | Idem |
| `training_*` | Idem |

Riconciliazione = incarico futuro separato.

---

## 29. Oggetti esclusi

Fonti, evidenze, verifiche, recensioni, ratings, allegati, storage, candidature, matching, conversazioni, prenotazioni, ordini, pagamenti, sessioni/calendario, tabelle specializzate per verticale, `membership_id`, Organizzazioni AR, policy Identità, JSONB modellante, `people`, assorbimento DV4.

---

## 30. Ordine di creazione

1. `service_categories` (+ seed)
2. `service_economic_bands` (+ seed)
3. `service_offers`
4. `service_offer_territories`
5. `service_offer_languages`
6. `service_offer_sectors`
7. `service_offer_markets`
8. `service_requests`
9. `service_request_territories`
10. `service_request_languages`
11. `service_request_sectors`
12. Chiusura documentale Migration Plan (fuori SQL)

Precondizioni esterne già soddisfatte: `profiles`, `businesses`, `professional_profiles`, `professional_services`, `business_services`, `languages`, `business_sectors`, `international_markets`, `opportunities`.

**Timestamp migration:** da assegnare nel Migration Plan; devono essere > `20260804240000` e strettamente crescenti. *(Proposta preliminare non vincolante: partire da `20260805010000`.)*

---

## 31. Matrice Logical → Physical

| Logical | Physical |
|---|---|
| OffertaDiServizio | `service_offers` |
| RichiestaDiServizio | `service_requests` |
| Titolare Persona/Impresa | owner_* XOR |
| Erogatore | provider_* (0..1) |
| Categoria verticale | `service_categories` + FK |
| Natura | `nature_label` |
| Modalità | `delivery_mode` CHECK |
| Area disponibilità | `service_*_territories` |
| Lingue / coppie | `service_*_languages` (+ `pair_group_id`) |
| Settore | `service_*_sectors` |
| Mercato | `service_offer_markets` |
| Fascia economica | `economic_kind` + `service_economic_bands` |
| Assi lifecycle | colonne dedicate §19 |
| Ref ServizioProfessionale | `source_professional_service_id` |
| Ref ServizioImpresa | `source_business_service_id` |
| Contesto Opportunità | `context_opportunity_id` |
| ManifestazioneDiInteresse / FEV / recensioni | **assenti** |
| DV4 | **escluse** |

---

## 32. Contratti DDL-ready (checklist per tabella)

Per ciascuna delle 11 tabelle il Migration Plan dovrà produrre una migration che realizzi:

1. nome §5
2. responsabilità documentata
3. colonne in ordine §§7–17/22
4. tipi PostgreSQL come sopra
5–6. nullability/default
7. PK uuid (cataloghi: PK text `code`)
8–10. FK + ON UPDATE/DELETE
11–13. UNIQUE / UNIQUE parziali / CHECK
14–15. indici §23
16–17. funzione + trigger `updated_at` §24
18–20. RLS ENABLE, FORCE false, 0 policy
21–22. REVOKE; nessun GRANT
23. COMMENT ON §26
24. seed solo cataloghi §27
25. dipendenze §6/§30
26–28. test §§33–35

### 32.1 Cataloghi — contratto compatto

Pattern identico a cataloghi Professionisti recenti (deny-by-default), **non** al legacy `languages` con policy pubblica.

### 32.2 Anti-pattern vietati in SQL futuro

`IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PostgreSQL; polimorfismo `entity_type`; FORCE RLS true; GRANT ad anon/authenticated; seed demo AR.

---

## 33. Test statici previsti

- Presence 11 tabelle nello schema `public`
- Colonne/ordine/tipi/null/default conformi
- PK/FK/CHECK/UNIQUE presenti
- Tipi FK: `language_id`/`sector_id` **bigint**; restanti uuid dove previsto
- Owner XOR e provider ≤1 enforceable
- Nessuna colonna amount/payment/order
- Nessuna tabella FEV/matching/DV4 link
- Funzioni INVOKER + search_path vuoto
- RLS enabled; policy count = 0; FORCE = false
- Privilegi PUBLIC/anon/authenticated = 0
- COMMENT TABLE = 11/11

---

## 34. Test runtime previsti

- Insert Offerta con solo `owner_person_id` OK; con entrambi owner FAIL; con nessuno FAIL
- Insert Offerta business-only OK
- Due provider contemporanei FAIL
- Due source_* contemporanei FAIL
- `economic_kind=indicative_band` senza band FAIL; con band OK
- Publish senza `ready` / senza `published_at` FAIL
- Delete profile referenziato come owner → RESTRICT
- Delete professional_service → source SET NULL
- Delete offer → CASCADE territories/languages/sectors/markets
- Lingua inesistente → RESTRICT
- Nessuna riga seed su AR

---

## 35. Verifiche post-apply

Catalogo vs remote drift 0 sulle 11 tabelle; head migration; seed 6+4; RLS 11/11; policy 0; grants 0; COMMENT; assenza tabelle escluse §29.

---

## 36. Questioni risolte

1. Nomi AR: `service_offers`, `service_requests` (inglese, pattern repo).
2. Titolare con FK reali XOR (integrità garantibile; businesses esiste).
3. Erogatore 0..1 con tre FK alternative.
4. Provenienza professional/business service facoltativa e mutuamente esclusiva.
5. Cataloghi propri categorie + fasce; nature testuale.
6. Territori/lingue/settori owned per AR, tabelle gemelle non polimorfiche.
7. `languages.id` bigint verificato.
8. Lifecycle multi-colonna.
9. DV4 escluse.
10. Marketplace/FEV/calendario esclusi.
11. `profiles` = Persona; no `people`.
12. Nessuna FK `business_memberships` ciclo 1.

---

## 37. Decisioni rinviate

- Ordine unità Migration Plan e timestamp definitivi
- Policy RLS applicative / Identità
- `declaration_status` su territories (soft-remove)
- CHECK DB su completezza `pair_group_id` source/target
- Mercati sulla Richiesta
- Attributi verticali profondi (finanziario/immobiliare/formativo)
- Riconciliazione DV4
- FEV locale Offerta
- FK membership per rappresentanza
- Visibilità oltre private/public

Queste **non** bloccano il Migration Plan del nucleo §5.

---

## 38. Criteri per Migration Plan

Il Plan dovrà: mappare 1:1 unità→migration; rispettare ordine §30; timestamp > `20260804240000`; non alterare nomi/CHECK/FK di questo contratto; non introdurre oggetti §29; prevedere stop point per blocco; test statici/runtime §§33–34; nessuna policy/GRANT.

---

## 39. Criteri di accettazione

- Due AR distinte e ownership XOR
- FK tipizzate verificate
- Nessun polimorfismo / JSONB / marketplace / DV4 / FEV
- Lifecycle separato
- Sufficiente a scrivere il Migration Plan senza nuove decisioni semantiche o fisiche sostanziali

---

## 40. Stato finale

**Physical Servizi redatto e DDL-ready** per autorizzare il Migration Plan del ciclo 1. Nessun SQL creato da questo documento.
