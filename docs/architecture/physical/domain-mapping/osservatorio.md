# Physical Domain Mapping — Dominio OSSERVATORIO

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/osservatorio.md` (ciclo 1 chiuso: §15.A–§15.D).
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository (Collaborazioni, Contenuti, Organizzazioni, Identità & Accessi).
> **Non** crea Migration Plan, **non** crea migration SQL, **non** esegue apply, **non** modifica lo schema né altri domini.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine). In contrasto interno al Logical, prevale §15.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Osservatorio** |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/osservatorio.md` (revisionato e approvato; §15 prevale) |
| Stato | **Chiuso per Migration Plan** |
| Ciclo | Ciclo 1 — registro di indicatori e valori aggregati pubblicabili |
| Migration Plan / SQL | **Fuori da questo documento** |
| Physical precedente | **Assente** — questo documento è la prima mappa fisica |

---

## 2. Scopo e responsabilità del dominio

Tradurre l’Aggregate Root **Indicatore** e gli oggetti ciclo 1 **FonteStatistica** e **ValoreIndicatore** in un modello relazionale `public` che rappresenta esclusivamente un **registro statistico**: definizioni di indicatori, fonti di provenienza, valori numerici aggregati con periodo e dimensioni minime, stato/qualità, rettifiche con storico, lifecycle e pubblicazione — **senza** microdati, dataset a righe, ETL, BI, dashboard, prodotti narrativi, Contenuti, Organizzazioni strutturali, Account owner, documenti o Storage.

### 2.1 Confini esatti

| Incluso ciclo 1 | Rinviato / escluso |
|---|---|
| AR Indicatore | Serie storica come tabella/AR |
| FonteStatistica owned | Dataset / righe sorgente / ETL / scraping |
| ValoreIndicatore numerico subordinato | Microdati; FK Persone/Imprese individuali |
| Periodo strutturato | Periodo testuale libero |
| Dimensioni territorio / settore / paese | Genere, età, forma giuridica, dimensione impresa, mercato, OPP/COL/Eventi/Servizi |
| Stato e qualità Valore | Score qualità; intervalli di confidenza |
| Rettifica con `supersedes_value_id` | Branching / versioni metodologiche complesse |
| Lifecycle Indicatore + Fonte | Workflow approvazione / audit scientifico |
| Deny-by-default | Policy RLS applicative; ruoli applicativi owned |
| | Rapporti, dossier, schede, interpretazioni (→ Contenuti) |
| | Dashboard, grafici, ranking, trend persistiti |
| | FK Organizzazioni / Contenuti; cataloghi ISTAT/NUTS/countries inventati |
| | JSON generico; Account / `auth.users` owner |

### 2.2 Responsabilità incluse

- Identità stabile e definizione metodologica sintetica dell’Indicatore.
- Natura, unità e periodicità chiuse sull’Indicatore.
- Lifecycle operativo e di pubblicazione dell’Indicatore.
- Fonte statistica condivisibile (provenienza, non archivio).
- Valori aggregati numerici con periodo, dimensioni 0..3, stato, qualità.
- Un solo valore corrente non ritirato per chiave logica.
- Storico delle rettifiche senza cancellazione silenziosa.
- RLS deny-by-default strutturale.

### 2.3 Responsabilità escluse

Serie/dashboard/grafici/mappe/KPI persistiti; prodotti narrativi; microdati; anagrafiche; membership; Account; Organizzazioni come FK; Contenuti; documenti/Storage; feed automatici; formule/query; JSON; soglia 5 come CHECK universale; validazione scientifica assoluta.

**Un Indicatore non rappresenta:** un Contenuto; un dataset; una dashboard; una Persona/Impresa; una Organizzazione; un permesso.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/osservatorio.md` §15.A–§15.D | **Autorità semantica** ciclo 1 |
| `domain-model.md`; `reconciliation-report.md` | Conoscenza derivata; confine CE |
| `domain-dependency-map.md` §12, D37–D45, P6, P9, V6 | Dipendenze derivative; nessun ownership sorgente |
| Physical Collaborazioni / Contenuti / Organizzazioni | Pattern RLS, `updated_at`, CHECK, COMMENT, slug |
| Physical / migration Imprese; `business_sectors` | Catalogo settore (`bigint` PK) |
| Migration pattern `NULLS NOT DISTINCT` (`profile_language_services`) | Chiave logica Valori con NULL dimensionali |

---

## 4. Principi di mapping

1. Unico AR fisico `observatory_indicators`; **nessun** secondo Aggregate Root.
2. Fonte = tabella di dominio `observatory_statistical_sources` (non AR); **condivisibile** da più Valori/Indicatori.
3. Valore = tabella subordinata `observatory_indicator_values`; ownership forte dall’Indicatore.
4. Fonte obbligatoria **solo sul Valore** (`source_id` NOT NULL). Nessuna Fonte principale obbligatoria sull’Indicatore; nessuna M:N.
5. Ownership redazionale **implicita** nel dominio: nessuna colonna Persona/Impresa/Org/Account/`auth.users`; nessun booleano vuoto `owned_by_editorial`.
6. Autore operativo **non persistito** (Logical §15.A).
7. Natura, unità, periodicità, stati, qualità, livelli territoriali = **CHECK** chiusi; nessun catalogo C03; nessun ENUM PostgreSQL.
8. Coerenza natura↔unità = CHECK sull’Indicatore con **tutte** le combinazioni ammesse elencate.
9. Coerenza periodo↔periodicità Indicatore = **applicativa** (nessun trigger cross-table).
10. Chiave logica corrente Valore = UNIQUE parziale `NULLS NOT DISTINCT` dove `status <> 'withdrawn'`.
11. Nessuna FK a `profiles`, `businesses`, `organizations`, `contents`, `accounts`, `auth.users`.
12. Unica FK esterna opzionale: `business_sectors(id)` sul Valore.
13. Nessun JSONB; nessun `metadata`; nessun `is_anonymized` / `subject_count`.
14. RLS ENABLE, FORCE false, **0 policy**, REVOKE ALL da PUBLIC/anon/authenticated; zero GRANT applicativi.
15. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE.
16. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico; nessun trigger su Auth/Persone/Imprese/Org/Contenuti.

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `observatory_indicators` | Aggregate Root | Dominio Osservatorio |
| 2 | `observatory_statistical_sources` | Entity owned (dominio) | Dominio Osservatorio |
| 3 | `observatory_indicator_values` | Entity owned (subordinata) | `observatory_indicators` |

**Totale ciclo 1: 3 tabelle.** Definitivo.

**Non create:** `observatory_series`; `observatory_observations`; `observatory_methodologies`; `observatory_reports`; `observatory_dossiers`; `observatory_territorial_sheets`; `observatory_interpretations`; `observatory_revisions` (AR); `observatory_dashboards`; `observatory_datasets`; tabelle territorio/paese/unità/qualità; link a Contenuti/Organizzazioni; Account–Indicatore.

---

## 6. Dipendenze esterne (ciclo 1)

### 6.1 Strutturali (FK)

| Target | Origine tipica | PK | Uso Osservatorio | ON DELETE |
|---|---|---|---|---|
| `public.business_sectors` | `20260718192646_create_business_sectors_table.sql` | `id` **bigint** | Dimensione settore opzionale sul Valore | **RESTRICT** |

**Motivazione RESTRICT.** Conservazione storica del significato settoriale del Valore: la cancellazione di un settore ancora referenziato è bloccata. Nessuno snapshot denominazione (Logical: non richiesto).

### 6.2 Di derivazione (nessuna FK)

Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Servizi, Mercati Internazionali, Contenuti, Organizzazioni, Identità & Accessi: eventuali calcoli aggregati esterni **non** producono FK individuali.

### 6.3 Future (non ciclo 1)

FK facoltativa Fonte→Organizzazioni; link Valori/Indicatori→Contenuti; cataloghi geografici/countries; dataset; feed automatici.

### 6.4 Assenza cicli

Nessun dominio sorgente dipende da Osservatorio per validità sostanziale (P6, P9; D38–D45 unidirezionali).

---

## 7. Aggregate Root — `observatory_indicators`

### 7.1 Responsabilità

Identità stabile dell’Indicatore; definizione metodologica sintetica; natura e unità; periodicità; lifecycle operativo; pubblicazione; ancoraggio dei Valori storici.

### 7.2 Colonne

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `code` | `text` | NO | — | Codice stabile; UNIQUE; blank guard; immutabile dopo prima pubblicazione (**applicativo**) |
| 3 | `slug` | `text` | NO | — | Lookup pubblico; UNIQUE; pattern slug (come Collaborazioni/Contenuti) |
| 4 | `title` | `text` | NO | — | Blank guard |
| 5 | `description` | `text` | NO | — | Blank guard |
| 6 | `purpose_text` | `text` | NO | — | Finalità sintetica; blank guard |
| 7 | `methodology_summary` | `text` | NO | — | Metodologia sintetica; blank guard |
| 8 | `value_nature` | `text` | NO | — | CHECK chiuso |
| 9 | `unit_code` | `text` | NO | — | CHECK chiuso + coerenza con natura |
| 10 | `periodicity` | `text` | NO | — | CHECK chiuso |
| 11 | `operational_status` | `text` | NO | `'draft'` | CHECK chiuso |
| 12 | `publication_status` | `text` | NO | `'unpublished'` | CHECK chiuso |
| 13 | `published_at` | `timestamptz` | YES | — | Gate pubblicazione |
| 14 | `withdrawn_at` | `timestamptz` | YES | — | Gate ritiro |
| 15 | `created_at` | `timestamptz` | NO | `now()` | |
| 16 | `updated_at` | `timestamptz` | NO | `now()` | Trigger |

**16 colonne.** Nessuna colonna owner Persona/Impresa/Org/Account. Ownership redazionale implicita.

### 7.3 CHECK — blank guard e pattern

- `length(btrim(code)) > 0`
- `length(btrim(slug)) > 0`
- `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`
- `length(btrim(title)) > 0`
- `length(btrim(description)) > 0`
- `length(btrim(purpose_text)) > 0`
- `length(btrim(methodology_summary)) > 0`

### 7.4 CHECK — natura

`value_nature IN ('count','percentage','currency','ratio','index')`

### 7.5 CHECK — unità

`unit_code IN ('units','percent','eur','eur_thousands','ratio','index_points')`

### 7.6 CHECK — coerenza natura ↔ unità (combinazioni ammesse esaustive)

| `value_nature` | `unit_code` ammessi |
|---|---|
| `count` | `units` |
| `percentage` | `percent` |
| `currency` | `eur`, `eur_thousands` |
| `ratio` | `ratio` |
| `index` | `index_points` |

Espressione CHECK:

```
(
  (value_nature = 'count' AND unit_code = 'units')
  OR (value_nature = 'percentage' AND unit_code = 'percent')
  OR (value_nature = 'currency' AND unit_code IN ('eur','eur_thousands'))
  OR (value_nature = 'ratio' AND unit_code = 'ratio')
  OR (value_nature = 'index' AND unit_code = 'index_points')
)
```

Nessuna altra combinazione ammessa. La decisione **non** è rinviata al SQL ad hoc.

### 7.7 CHECK — periodicità

`periodicity IN ('annual','quarterly','monthly','point_in_time')`

### 7.8 CHECK — lifecycle operativo

`operational_status IN ('draft','active','deprecated','retired')`

### 7.9 CHECK — pubblicazione

`publication_status IN ('unpublished','published','withdrawn')`

### 7.10 CHECK — gate pubblicazione / date

```
(
  (publication_status = 'unpublished' AND published_at IS NULL AND withdrawn_at IS NULL)
  OR (publication_status = 'published' AND published_at IS NOT NULL AND withdrawn_at IS NULL)
  OR (publication_status = 'withdrawn' AND withdrawn_at IS NOT NULL)
)
```

### 7.11 CHECK — relazione operativo ↔ pubblicazione

```
NOT (publication_status = 'published' AND operational_status = 'draft')
```

Ammessi: `draft`+`unpublished`; `active|deprecated|retired` con qualunque pubblicazione; `retired`+`withdrawn` / `published` (storico). Dismissione **non** cancella Valori.

### 7.12 UNIQUE

- `observatory_indicators_code_key (code)`
- `observatory_indicators_slug_key (slug)`

### 7.13 Ownership

Implicita redazionale di dominio. **Assenti:** `owner_person_id`, `owner_business_id`, `owned_by_editorial`, FK Account/`auth.users`/Organizzazioni.

### 7.14 RLS / privilegi / trigger

Come §23–§24. Trigger: `observatory_indicators_set_updated_at`.

---

## 8. Ownership dell’Indicatore (forma fisica)

| Opzione | Decisione |
|---|---|
| Colonna Persona/Impresa | **No** |
| Booleano `owned_by_editorial` | **No** (informazione nulla: tutto il dominio è redazionale) |
| Account / `auth.users` | **No** |
| Autore operativo persistito | **No** (Logical) |

L’ownership è dichiarata da COMMENT ON TABLE e dall’assenza di colonne titolari esterni.

---

## 9. Fonti — `observatory_statistical_sources`

### 9.1 Responsabilità

Provenienza e tracciabilità di un Valore. **Non** archivio documentale; **non** Organizzazione; **non** AR di business. Condivisibile da più Valori (e indirettamente da più Indicatori).

### 9.2 Colonne

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `name` | `text` | NO | — | Denominazione; blank guard |
| 3 | `producer_name` | `text` | NO | — | Ente produttore **testuale**; blank guard |
| 4 | `publication_title` | `text` | NO | — | Titolo pubblicazione/rilevazione; blank guard |
| 5 | `url` | `text` | YES | — | Opzionale; blank guard se presente |
| 6 | `external_identifier` | `text` | YES | — | Opzionale; blank guard se presente |
| 7 | `edition_label` | `text` | YES | — | Edizione/versione; blank guard se presente |
| 8 | `source_published_on` | `date` | YES | — | Data pubblicazione fonte |
| 9 | `license_note` | `text` | YES | — | Licenza/condizioni; blank guard se presente |
| 10 | `methodology_note` | `text` | YES | — | Nota metodologica; blank guard se presente |
| 11 | `lifecycle_status` | `text` | NO | `'active'` | CHECK chiuso |
| 12 | `created_at` | `timestamptz` | NO | `now()` | |
| 13 | `updated_at` | `timestamptz` | NO | `now()` | Trigger |

**13 colonne.** Nessuna FK a `organizations`. Nessun file/Storage.

### 9.3 CHECK

- blank guard NOT NULL su `name`, `producer_name`, `publication_title`
- blank guard nullable: se colonna IS NOT NULL allora `length(btrim(...)) > 0` per `url`, `external_identifier`, `edition_label`, `license_note`, `methodology_note`
- `lifecycle_status IN ('active','deprecated','unavailable')`
- URL: nessun vincolo di schema `http` obbligatorio (testo opaco); blank guard sufficiente

### 9.4 UNIQUE

UNIQUE parziale su `external_identifier` dove NOT NULL:

```
CREATE UNIQUE INDEX observatory_statistical_sources_external_identifier_uidx
  ON public.observatory_statistical_sources (external_identifier)
  WHERE external_identifier IS NOT NULL;
```

Motivazione: evita doppioni dello stesso identificativo esterno quando dichiarato; assenza di identificativo resta ammessa e non collidente.

### 9.5 Lifecycle Fonte

Nessuna pubblicazione autonoma. Stati: `active` | `deprecated` | `unavailable`. Default `active`.

### 9.6 Relazione Indicatore–Fonte

| Collegamento | Ciclo 1 |
|---|---|
| Indicatore → Fonte principale | **Non richiesto** (Logical) |
| Valore → Fonte | **Obbligatorio** (`source_id` NOT NULL) |
| M:N Indicatore↔Fonte | **Non creata** |

La Fonte è condivisa a livello di dominio; i Valori la referenziano.

---

## 10. Valori — `observatory_indicator_values`

### 10.1 Responsabilità

Occorrenza numerica aggregata di un Indicatore per periodo e dimensioni; provenienza; stato; qualità; pubblicazione; rettifica.

### 10.2 Colonne

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `indicator_id` | `uuid` | NO | — | FK → `observatory_indicators` |
| 3 | `source_id` | `uuid` | NO | — | FK → `observatory_statistical_sources` |
| 4 | `numeric_value` | `numeric(24,8)` | NO | — | Unico tipo numerico |
| 5 | `period_start` | `date` | NO | — | |
| 6 | `period_end` | `date` | NO | — | ≥ `period_start` |
| 7 | `status` | `text` | NO | `'provisional'` | CHECK stato |
| 8 | `quality_code` | `text` | NO | — | CHECK qualità; **nessun** default (scelta esplicita) |
| 9 | `territory_level` | `text` | YES | — | CHECK livello |
| 10 | `territory_code` | `text` | YES | — | Opaco; blank guard se presente |
| 11 | `territory_label` | `text` | YES | — | Obbligatoria se dimensione presente |
| 12 | `business_sector_id` | `bigint` | YES | — | FK → `business_sectors` |
| 13 | `country_code` | `text` | YES | — | Opaco; blank guard se presente |
| 14 | `country_label` | `text` | YES | — | Obbligatoria se dimensione presente |
| 15 | `methodology_note` | `text` | YES | — | Sintetica; blank guard se presente |
| 16 | `published_at` | `timestamptz` | YES | — | NULL = non pubblicato |
| 17 | `withdrawn_at` | `timestamptz` | YES | — | Gate ritiro |
| 18 | `revised_at` | `timestamptz` | YES | — | Valorizzato se `status = 'revised'` |
| 19 | `supersedes_value_id` | `uuid` | YES | — | FK self; rettifica |
| 20 | `created_at` | `timestamptz` | NO | `now()` | |
| 21 | `updated_at` | `timestamptz` | NO | `now()` | Trigger |

**21 colonne.** Assenti: unità/natura ripetute; JSON; microdati; liste soggetti; formule.

### 10.3 Tipo numerico

| Voce | Decisione |
|---|---|
| Tipo | `numeric(24,8)` |
| Precisione / scala | 24 cifre significative, 8 decimali |
| Conteggi | Stessi tipo; vincolo “intero ≥ 0” = **applicativo** (dipende da `value_nature` sull’Indicatore; nessun trigger cross-table) |
| Percentuali | Concettualmente scala 0–100; vincolo range = **applicativo** |
| Importi | Possono essere ≥ 0 tipicamente; segno negativo non vietato da CHECK universale (Logical non lo impone) |
| Ratio / index | Qualunque `numeric(24,8)` ammesso a livello DB |

Nessun CHECK universale su `numeric_value` che impedisca indicatori legittimi (es. valori inferiori a 5, indici negativi).

### 10.4 Periodo

- `period_start` NOT NULL; `period_end` NOT NULL.
- CHECK: `period_end >= period_start`.
- Anno di riferimento: **derivato** (`extract(year from period_start)` o equivalente) — **non** colonna.
- Coerenza con `observatory_indicators.periodicity`: **applicativa** (nessun trigger cross-table; nessuna ridondanza di `periodicity` sul Valore).

Contratto applicativo atteso (documentato, non trigger):

| Periodicità Indicatore | Forma periodo Valore |
|---|---|
| `annual` | Anno civile: `period_start` = 1 gen; `period_end` = 31 dic stesso anno |
| `quarterly` | Trimestre civile (es. 1 gen–31 mar) |
| `monthly` | Mese civile (1° giorno–ultimo giorno del mese) |
| `point_in_time` | `period_start = period_end` |

### 10.5 Stato Valore

`status IN ('provisional','final','revised','withdrawn')` — default `'provisional'`.

Gate date:

```
(
  (status <> 'withdrawn' AND withdrawn_at IS NULL)
  OR (status = 'withdrawn' AND withdrawn_at IS NOT NULL)
)
AND
(
  (status <> 'revised' AND revised_at IS NULL)
  OR (status = 'revised' AND revised_at IS NOT NULL)
)
```

**Pubblicabilità Valore** (asse minimo, senza secondo enum):

| Condizione | Significato |
|---|---|
| `published_at IS NULL` e `status <> 'withdrawn'` | Valore registrato, non pubblicato |
| `published_at IS NOT NULL` e `status IN ('provisional','final','revised')` | Valore pubblicato |
| `status = 'withdrawn'` | Ritirato; `withdrawn_at` obbligatorio; `published_at` può restare per traccia storica |

Relazione con Indicatore: pubblicazione di un Valore con Indicatore `unpublished`/`draft` è sconsigliata e resta **invariante applicativa** (nessun trigger cross-table). Un Indicatore `retired`/`deprecated` conserva i Valori.

### 10.6 Qualità

`quality_code IN ('official','estimated','derived','self_reported')` — NOT NULL, **senza default**.

### 10.7 Territorio

Livelli: `territory_level IN ('italy','region','province','municipality','other')` quando NOT NULL.

CHECK coerenza:

```
(
  (territory_level IS NULL AND territory_code IS NULL AND territory_label IS NULL)
  OR (
    territory_level IS NOT NULL
    AND territory_label IS NOT NULL
    AND length(btrim(territory_label)) > 0
    AND (territory_code IS NULL OR length(btrim(territory_code)) > 0)
  )
)
```

Nessun catalogo ISTAT/NUTS; nessuna FK geografica.

### 10.8 Settore

`business_sector_id` nullable → `business_sectors(id)` ON DELETE **RESTRICT**. Una sola valorizzazione (una colonna). Nessuno snapshot nome settore.

### 10.9 Paese / nazionalità statistica

CHECK coerenza:

```
(
  (country_code IS NULL AND country_label IS NULL)
  OR (
    country_label IS NOT NULL
    AND length(btrim(country_label)) > 0
    AND (country_code IS NULL OR length(btrim(country_code)) > 0)
  )
)
```

`country_code`: testo opaco (nessun vincolo ISO obbligatorio; nessun catalogo). Uso **solo statistico**; non è nazionalità di una Persona.

### 10.10 Combinazione dimensioni

Ammesse: nessuna; solo territorio; solo settore; solo paese; qualunque sottoinsieme delle tre; **mai** due valorizzazioni dello stesso asse (garantito dal modello a colonna singola per asse).

### 10.11 Chiave logica e unicità del corrente

**Chiave logica:**  
`(indicator_id, period_start, period_end, territory_level, territory_code, territory_label, business_sector_id, country_code, country_label)`  
per Valori con `status <> 'withdrawn'`.

**Meccanismo scelto (congelato):**

```
CREATE UNIQUE INDEX observatory_indicator_values_current_logical_uidx
  ON public.observatory_indicator_values (
    indicator_id,
    period_start,
    period_end,
    territory_level,
    territory_code,
    territory_label,
    business_sector_id,
    country_code,
    country_label
  )
  NULLS NOT DISTINCT
  WHERE status <> 'withdrawn';
```

| Aspetto | Decisione |
|---|---|
| NULL dimensionali | Trattati come uguali (`NULLS NOT DISTINCT`) |
| Valori `withdrawn` | Esclusi dall’indice → storico illimitato |
| Stati correnti ammessi sulla chiave | Al più uno tra `provisional` \| `final` \| `revised` |
| Alternative scartate | Colonne sentinella; trigger di serializzazione; UNIQUE senza `NULLS NOT DISTINCT` |

### 10.12 Revisioni e storico

| Voce | Decisione |
|---|---|
| `supersedes_value_id` | Nullable; FK → `observatory_indicator_values(id)` ON DELETE **RESTRICT** |
| Self-reference | CHECK `supersedes_value_id IS NULL OR supersedes_value_id <> id` |
| Unicità sostituito | UNIQUE parziale su `supersedes_value_id` WHERE NOT NULL (un solo successore diretto) |
| Nuovo valore | Tipicamente `status = 'revised'` + `revised_at`; stessa chiave logica del precedente |
| Precedente | Impostato a `withdrawn` + `withdrawn_at` (**applicativo** nella stessa transazione di scrittura) |
| Catena | Coerenza catena multi-hop = **applicativa**; nessun trigger grafo |
| Cancellazione storica | **Vietata** operativamente: usare `withdrawn`; DELETE fisico fuori perimetro ciclo 1 |

### 10.13 FK e ON DELETE

| FK | Target | ON DELETE |
|---|---|---|
| `indicator_id` | `observatory_indicators` | **RESTRICT** |
| `source_id` | `observatory_statistical_sources` | **RESTRICT** |
| `business_sector_id` | `business_sectors` | **RESTRICT** |
| `supersedes_value_id` | `observatory_indicator_values` | **RESTRICT** |

**Motivazione RESTRICT su Indicatore/Fonte.** Evita CASCADE che cancelli valori pubblicati/storici. La dismissione avviene via lifecycle (`retired` / `withdrawn` / `unavailable`), non via DELETE.

---

## 11. Privacy e soglia

Documentato fisicamente:

- Nessuna FK verso `profiles` o `businesses`.
- Nessuna colonna microdato / elenco soggetti / `subject_count` / `is_anonymized`.
- Soglia editoriale minima **5** (conteggi da soggetti): **non** è un CHECK universale; resta regola applicativa/editoriale (Logical §15.A).
- Il database conserva solo valori aggregati già autorizzati all’inserimento.
- COMMENT ON TABLE/COLUMN devono ricordare: aggregato ≠ microdato; soglia applicativa.

---

## 12. Confine Contenuti

- Nessuna tabella Rapporto/Dossier/Scheda/Interpretazione.
- Nessuna FK verso `contents` o tabelle Contenuti.
- Narrazione, storytelling, commenti: owned da Contenuti.
- Collegamenti futuri: rinviati.

---

## 13. Confine Organizzazioni

- Ente produttore = `producer_name` testuale.
- Nessuna FK a `organizations`.
- Nessuna anagrafica duplicata.
- Collegamento futuro: rinviato.

---

## 14. Derivati non persistiti

Non creare tabelle/colonne per:

- serie storiche autonome;
- trend / variazioni / ranking / confronti / totali;
- dashboard / grafici / mappe / KPI card;
- anno di riferimento (derivabile);
- “ultimo valore”;
- conteggio valori;
- prodotti narrativi.

La serie storica è la query ordinata dei Valori per `indicator_id` + dimensioni + periodo.

---

## 15. Indici

### 15.1 `observatory_indicators`

| Indice | Tipo | Motivo |
|---|---|---|
| PK `(id)` | UNIQUE | Identità |
| UNIQUE `(code)` | UNIQUE | Codice stabile |
| UNIQUE `(slug)` | UNIQUE | Lookup pubblico |
| `(operational_status)` | btree | Filtri admin |
| `(publication_status)` | btree | Filtri pubblicazione |
| `(value_nature)` | btree | Filtri analitici |
| `(periodicity)` | btree | Filtri analitici |
| `(publication_status, operational_status)` WHERE `publication_status = 'published'` | parziale | Elenco pubblicati |

### 15.2 `observatory_statistical_sources`

| Indice | Tipo | Motivo |
|---|---|---|
| PK `(id)` | UNIQUE | Identità |
| `(lifecycle_status)` | btree | Filtri |
| `(producer_name)` | btree | Ricerca ente |
| UNIQUE `(external_identifier)` WHERE NOT NULL | parziale | Idempotenza esterna |

Nessun indice obbligatorio su `source_published_on` (non critico al ciclo 1).

### 15.3 `observatory_indicator_values`

| Indice | Tipo | Motivo |
|---|---|---|
| PK `(id)` | UNIQUE | Identità |
| `(indicator_id)` | btree | Lista valori |
| `(source_id)` | btree | Provenienza |
| `(period_start, period_end)` | btree | Intervallo |
| `(status)` | btree | Filtri stato |
| `(quality_code)` | btree | Filtri qualità |
| `(territory_level)` | btree | Dimensione |
| `(business_sector_id)` WHERE NOT NULL | parziale | Dimensione |
| `(country_code)` WHERE NOT NULL | parziale | Dimensione |
| `(supersedes_value_id)` WHERE NOT NULL | parziale | Catena |
| UNIQUE logica corrente `NULLS NOT DISTINCT` WHERE `status <> 'withdrawn'` | parziale UNIQUE | Un corrente per chiave |
| UNIQUE `(supersedes_value_id)` WHERE NOT NULL | parziale UNIQUE | Un successore |

Evitare indici ridondanti rispetto a PK/UNIQUE.

---

## 16. Trigger e funzioni

Per **ciascuna** delle tre tabelle:

```
function public.set_observatory_indicators_updated_at()
function public.set_observatory_statistical_sources_updated_at()
function public.set_observatory_indicator_values_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW → `NEW.updated_at = now()`.

**Nessun altro trigger** nel ciclo 1 (nessuna enforcement cross-table periodicità/natura; nessuna sincronizzazione Auth/Persone/Imprese/Org/Contenuti; nessuna catena di revisione automatica).

---

## 17. Sicurezza (RLS e privilegi)

Per ogni tabella Osservatorio:

| Voce | Prescrizione |
|---|---|
| RLS | `ENABLE ROW LEVEL SECURITY` |
| FORCE RLS | **false** |
| Policy | **0** |
| REVOKE | ALL da PUBLIC; ALL da anon, authenticated |
| GRANT applicativi | **0** |
| Deny-by-default | Sì |
| Future policy | Unità separate; fuori blocco strutturale |

Osservatorio fornisce **fatti statistici**, non autorizzazioni. Nessun ruolo applicativo owned. Identità & Accessi applica l’accesso; non possiede i fatti.

---

## 18. COMMENT ON

Obbligatori:

- COMMENT ON TABLE tutte e tre (AR; Fonte ≠ Org/Documento; Valore aggregato ≠ microdato; serie derivata; soglia 5 applicativa).
- COMMENT ON COLUMN: `code`, `slug`, `value_nature`, `unit_code`, `periodicity`, assi lifecycle/pubblicazione Indicatore; `producer_name`, `lifecycle_status` Fonte; `numeric_value`, periodo, `status`, `quality_code`, dimensioni, `supersedes_value_id`, `published_at`/`withdrawn_at`/`revised_at` Valore.
- COMMENT ON FUNCTION per ogni `set_*_updated_at`.

I testi devono dichiarare: Indicatore ≠ Contenuto ≠ dataset ≠ dashboard; Fonte ≠ Organizzazione; Valore ≠ microdato; nazionalità statistica ≠ Persona; deny-by-default.

---

## 19. Seed

| Oggetto | Seed ciclo 1 |
|---|---|
| Cataloghi | **0** (CHECK chiusi) |
| Indicatori / Fonti / Valori | **0** demo obbligatori |
| M8.1 | **SKIP** |

---

## 20. Invarianti fisiche

| # | Invariante | Enforcement |
|---|---|---|
| 1 | Un solo AR: Indicatore | Inventario 3 tabelle |
| 2 | Tre tabelle massime ciclo 1 | Inventario definitivo |
| 3 | Ogni Valore → un Indicatore | FK NOT NULL + RESTRICT |
| 4 | Ogni Valore → una Fonte | FK NOT NULL + RESTRICT |
| 5 | Natura e unità chiuse | CHECK |
| 6 | Combinazioni natura/unità valide | CHECK esaustivo |
| 7 | Valore numerico unico | `numeric(24,8)` NOT NULL |
| 8 | Periodo strutturato | date NOT NULL + CHECK ordine |
| 9 | Dimensioni limitate a territorio/settore/paese | Colonne + CHECK coerenza |
| 10 | Nessuna FK Persona/Impresa | Assenza colonne |
| 11 | Un solo valore corrente per chiave logica | UNIQUE `NULLS NOT DISTINCT` parziale |
| 12 | Storico revisioni conservato | `withdrawn` + `supersedes_value_id`; no CASCADE delete |
| 13 | Fonte ≠ Organizzazione | Assenza FK Org; `producer_name` testo |
| 14 | Narrazione → Contenuti | Assenza tabelle/FK CE |
| 15 | Dashboard/serie derivate | Assenza tabelle |
| 16 | Nessun JSON | Assenza JSONB |
| 17 | Nessun microdato | Assenza colonne/FK |
| 18 | Soglia 5 applicativa | COMMENT; nessun CHECK universale |
| 19 | Deny-by-default | RLS + REVOKE |
| 20 | Nessuna decisione semantica al Migration Plan | Questo documento congela i contratti |

Traduzione: CHECK / FK / UNIQUE / indici / nullable / regole applicative esplicite (§10.3, §10.4, §10.5, §10.12).

---

## 21. Inventory tabellare finale

| Tabella | Responsabilità | PK | FK principali | Lifecycle | Ownership |
|---|---|---|---|---|---|
| `observatory_indicators` | AR — definizione indicatore | `id` uuid | — | `operational_status` + `publication_status` | Redazionale implicita (dominio) |
| `observatory_statistical_sources` | Provenienza statistica condivisa | `id` uuid | — | `lifecycle_status` | Dominio Osservatorio |
| `observatory_indicator_values` | Valore aggregato subordinato | `id` uuid | `indicator_id`, `source_id`, `business_sector_id`?, `supersedes_value_id`? | `status` + date pubblicazione/ritiro/revisione | Owned dall’Indicatore |

**Numero definitivo di tabelle: 3.**

---

## 22. Dipendenze (riepilogo)

### Strutturali

- `public.business_sectors` (opzionale sul Valore; PK bigint; ON DELETE RESTRICT).

### Di derivazione

- Tutti i domini sorgente senza FK individuali.

### Future

- Organizzazioni; Contenuti; cataloghi geografici/countries; dataset; feed automatici; metodologia versionata.

### Cicli

- Assenti.

---

## 23. Elementi rinviati

Dataset e versioni; righe sorgente; sondaggi/questionari; metodologia versionata complessa; dimensioni avanzate; FK Organizzazioni/Contenuti; feed/ETL/import; qualità numerica avanzata; intervalli di confidenza; valori testuali; indicatori compositi complessi; prodotti analitici owned; workflow validazione; audit scientifico; catalogo countries.

---

## 24. Elementi esclusi

Microdati; dati personali; anagrafiche; documenti; file; Storage; scraping; data lake; BI; cache; export; viste UI; account; ruoli applicativi; CRM; workflow redazionale; contenuti narrativi; JSON; serie/dashboard/grafici persistiti; cataloghi ISTAT/NUTS inventati.

---

## 25. Prontezza Migration Plan

| Voce | Decisione |
|---|---|
| Tabelle | **3** |
| Unità indicative | **3** (+ M8.2 report) |
| Ordine | **M1.1** `observatory_indicators` → **M2.1** `observatory_statistical_sources` → **M3.1** `observatory_indicator_values` |
| Dipendenze | `business_sectors` già pubblicato (prima di M3.1) |
| Cataloghi nuovi | **0** |
| Seed | **0** obbligatori |
| M8.1 | **SKIP** |
| M8.2 | Report post-apply remoto |

Ordine motivato: Indicatori e Fonti sono indipendenti; i Valori dipendono da entrambi. Nessuna M:N intermedia.

Il Migration Plan, quando autorizzato, **traduce** questo Physical in DDL senza nuove decisioni semantiche. Nomi file/timestamp restano del Plan.

**Criterio di completamento.** Con §§1–25 il Physical ciclo 1 è completo e il Migration Plan è **autorizzabile**.

---

## 26. Matrice Logical → Physical

| Logical §15 | Physical |
|---|---|
| AR Indicatore | `observatory_indicators` |
| FonteStatistica | `observatory_statistical_sources` |
| ValoreIndicatore | `observatory_indicator_values` |
| Natura/unità/periodicità | CHECK su Indicatore |
| Stato/pubblicazione Indicatore | Colonne + gate CHECK |
| Stato/qualità Valore | Colonne + CHECK |
| Periodo | `period_start`/`period_end` |
| Territorio/settore/paese | Colonne Valore + CHECK; FK settore |
| Rettifica | `supersedes_value_id` + withdrawn |
| Serie | Derivata (query) |
| Contenuti / Org / microdati | Assenti |
| Deny-by-default | RLS 0 policy + REVOKE |

---

## 27. Checklist DDL-ready per tabella

### `observatory_indicators`

- [x] PK UUID; code/slug UNIQUE; blank guard; pattern slug
- [x] Natura/unità/periodicità/lifecycle/pubblicazione CHECK
- [x] Coerenza natura↔unità esaustiva
- [x] Gate published_at/withdrawn_at
- [x] Nessun owner esterno
- [x] RLS/REVOKE/`updated_at`

### `observatory_statistical_sources`

- [x] PK UUID; blank guard; lifecycle CHECK
- [x] UNIQUE parziale external_identifier
- [x] Nessuna FK Org/Storage
- [x] RLS/REVOKE/`updated_at`

### `observatory_indicator_values`

- [x] FK Indicatore/Fonte RESTRICT; settore RESTRICT opzionale
- [x] `numeric(24,8)`; periodo; stato; qualità
- [x] Dimensioni + CHECK coerenza
- [x] Chiave logica `NULLS NOT DISTINCT` parziale
- [x] `supersedes_value_id` + anti-self + UNIQUE successore
- [x] Pubblicazione via `published_at` / `withdrawn_at` / `revised_at`
- [x] RLS/REVOKE/`updated_at`

---

## 28. Decisione

**PHYSICAL OSSERVATORIO COMPLETO — MIGRATION PLAN AUTORIZZABILE**
