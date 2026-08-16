# Osservatorio — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica Logical né Physical.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/osservatorio.md`.
**Contratto logico vincolante:** `docs/architecture/logical/osservatorio.md` (§15.A–§15.D).

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi. Non reinterpretare il Physical. In contrasto interno al Logical, prevale §15.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Osservatorio** |
| Artefatto | Migration Plan ciclo 1 |
| Repository | `C:/Users/151702/Desktop/PROGETTI-WEB/immigrati-imprenditori` |
| Branch | `main` |
| HEAD di riferimento (pre-SQL) | `fe6093f7fee4678b1e85c7c0e16eb714d207bb4e` |
| `origin/main` | Coincide con HEAD (ahead 0 / behind 0) |
| Ultima migration repository | `20260810100000` (Collaborazioni M2.1) |
| Head locale/remoto | `20260810100000` / pending `0` |
| SQL Osservatorio | **Assenti** (da creare dopo approvazione Plan) |
| Stato | **Chiuso per creazione cumulativa M1–M3 (3 unità)** |

---

## 2. Scopo

Trasformare Logical e Physical Osservatorio in roadmap operativa DDL-ready del ciclo 1:

* registro di indicatori statistici e valori aggregati pubblicabili (non BI / non dataset / non narrazione);
* **3 unità SQL** (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* modalità **accelerata cumulativa**;
* test statici/runtime, apply locale/remoto, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. L’azione autorizzabile successiva è la **creazione contemporanea delle 3 migration**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/osservatorio.md` | Contratto DDL-ready |
| 2 | `logical/osservatorio.md` (§15.A–§15.D) | Semantica ciclo 1 |
| 3 | Migration Plan Collaborazioni / Identità / Organizzazioni | Pattern operativi |
| 4 | Validation report domini chiusi | Criteri M8.2 |
| 5 | Migration `business_sectors`; pattern UUID, CHECK, UNIQUE `NULLS NOT DISTINCT`, indici parziali, self-FK, `updated_at`, RLS | Dipendenze e pattern tecnici |
| 6 | `domain-dependency-map.md` §12, D37–D45, P6, P9 | Dipendenze derivative; assenza cicli |
| 7 | `domain-model.md` / reconciliation | Confine vs Contenuti; conoscenza derivata |

**Contraddizioni Logical ↔ Physical:** nessuna materiale sul ciclo 1. Plan creatibile senza nuove decisioni semantiche.

---

## 4. Stato iniziale verificato (pre-Plan)

| Verifica | Esito |
|---|---|
| Repository corretto | Sì |
| Branch `main` | Sì |
| HEAD = `origin/main` | Sì (`fe6093f…`) |
| Ahead / behind | 0 / 0 |
| Logical Osservatorio modificato | Sì (`M`) — non toccato da questo Plan |
| Physical Osservatorio untracked | Sì (`??`) — non toccato da questo Plan |
| Altri file modificati / untracked | Nessuno oltre Logical + Physical Osservatorio (+ questo Plan) |
| `supabase/.temp/pgdelta` | Assente |
| Ultimo timestamp migrations | `20260810100000` |
| Timestamp previsti `20260811090000` / `20260811100000` / `20260811110000` | **Liberi** (0 collisioni; file assenti) |
| Migration Osservatorio esistenti | Nessuna |
| Head locale = remoto | `20260810100000`; pending `0` |

**Questo Plan non modifica lo stato Git esistente** oltre alla creazione del proprio file.

---

## 5. Modalità accelerata

Workflow **unico** per le 3 unità SQL:

1. creazione contemporanea delle **3** migration SQL;
2. controlli rapidi unitari (statici);
3. review indipendente **unica** M1–M3;
4. apply locale cumulativo `supabase migration up --local`;
5. validazione integrata runtime con `BEGIN`/`ROLLBACK`;
6. commit e push **unico** (Logical + Physical + Plan + 3 SQL) — solo su richiesta esplicita successiva;
7. dry-run remoto **unico** `supabase db push --linked --dry-run` (esattamente 3 migration);
8. apply remoto **unico** `supabase db push --linked` — solo dopo dry-run positivo;
9. M8 finale (M8.1 SKIP; M8.2 report documentale post-remoto).

**Una migration distinta per unità.** Nessun raggruppamento multi-tabella.
**Non** prevedere un ciclo completo apply/commit/push per ogni blocco.

---

## 6. Prerequisiti

| Prerequisito | Stato atteso |
|---|---|
| Branch `main` | Allineato a `origin/main` |
| Working tree pre-SQL | Logical + Physical + questo Plan |
| Dipendenza strutturale esterna | `public.business_sectors` (prima di M3.1) |
| Head migration | ≥ `20260810100000` |
| Nessuna collision timestamp `20260811*` previsti | Verificata al Plan |
| Nessuna migration Osservatorio | Verificata |
| Domini chiusi intatti | Nessuna modifica SQL/Physical di altri domini da questo Plan |
| Nessun `.temp` estraneo | Ok (`pgdelta` assente) |
| Nessun trigger Osservatorio su altri domini | Prescritto |
| Nessuna modifica a `profiles` / `businesses` / `organizations` / `contents` / `business_sectors` | Prescritto |

---

## 7. Perimetro ciclo 1

### 7.1 Incluso

| # | Tabella | Unità |
|---|---|---|
| 1 | `observatory_indicators` | M1.1 |
| 2 | `observatory_statistical_sources` | M2.1 |
| 3 | `observatory_indicator_values` | M3.1 |

### 7.2 Escluso (nessuna migration)

Cataloghi; seed; serie storiche autonome; dataset; righe sorgente; microdati; metodologie versionate; rapporti; dossier; schede editoriali; interpretazioni; dashboard; grafici; mappe; ranking; trend; ETL; scraping; importazioni; Storage; JSON; Contenuti; Organizzazioni; Persone; Imprese individuali; policy RLS applicative; trigger su altri domini; M4–M7; M8.1.

---

## 8. Inventario Physical → unità

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `observatory_indicators` | Aggregate Root | **M1.1** |
| 2 | `observatory_statistical_sources` | Entity owned (dominio) | **M2.1** |
| 3 | `observatory_indicator_values` | Entity owned (subordinata) | **M3.1** |

**3/3 tabelle. Nessuna tabella extra.**

---

## 9. Dipendenze

### 9.1 Strutturali (generano FK in SQL)

| Unità | Target | PK | Uso | ON DELETE (Physical) | Disponibilità |
|---|---|---|---|---|---|
| M1.1 | — | — | Nessuna FK Osservatorio/esterna | — | — |
| M2.1 | — | — | Nessuna FK Osservatorio/esterna | — | — |
| M3.1 | `public.observatory_indicators` | uuid | `indicator_id` | **RESTRICT** | M1.1 |
| M3.1 | `public.observatory_statistical_sources` | uuid | `source_id` | **RESTRICT** | M2.1 |
| M3.1 | `public.business_sectors` | **bigint** | `business_sector_id` opzionale | **RESTRICT** | `20260718192646` |
| M3.1 | `public.observatory_indicator_values` | uuid | `supersedes_value_id` self-FK | **RESTRICT** | Stessa unità M3.1 |

### 9.2 Di derivazione (nessuna migration dedicata)

| Derivato | Fonte | Nota |
|---|---|---|
| Calcoli aggregati da domini sorgente | Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Servizi, Mercati | **Nessuna** FK individuale |
| Accesso / deny-by-default | Identità & Accessi | Nessuna FK Osservatorio → Account |
| Narrazione | Contenuti | Nessuna FK; prodotti narrativi fuori OSS |

### 9.3 Future (non strutturali ciclo 1)

Organizzazioni (collegamento Fonte); Contenuti (link divulgativo); cataloghi geografici; catalogo paesi; dataset; feed automatici; metodologia versionata.

### 9.4 Vietate (strutturali)

FK a `profiles` / `businesses` / `organizations` / `contents` / `accounts` / `auth.users`; tabelle serie/dashboard/dataset/rapporti; cataloghi ISTAT/NUTS/countries inventati; JSONB modellante; ENUM PostgreSQL; booleani `can_*` / `is_anonymized` / `subject_count`.

### 9.5 Assenza cicli

`business_sectors` → `observatory_indicator_values` ← `observatory_indicators` + `observatory_statistical_sources`. Self-FK Valori **intra-unità**. **Aciclico.**

---

## 10. Verifica della separazione delle unità

| Criterio | Esito |
|---|---|
| M1.1 e M2.1 indipendenti | Sì (nessuna FK reciproca) |
| M3.1 dopo M1.1 e M2.1 | Sì |
| Una tabella = una migration | Sì |
| Dipendenze circolari | Nessuna |
| Self-reference Valori crea dipendenza fra migration? | **No** — stessa unità M3.1 |
| Fonte incorporabile nell’Indicatore? | **No** — condivisibile; obbligatoria sul Valore |
| Serie come tabella? | **No** — derivata |
| Cataloghi preliminari | **Non necessari** (CHECK chiusi) |
| Elementi rinviati con migration dedicata | **No** |

**Ordine globale ammesso:** M1.1 → M2.1 → M3.1  
(Alternativa equivalente M2.1 → M1.1 → M3.1; questo Plan congela **M1.1 → M2.1 → M3.1**.)

---

## 11. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL |
|---|---|---|---|
| **M1** | Presente | Aggregate Root Indicatori | M1.1 |
| **M2** | Presente | Fonti statistiche | M2.1 |
| **M3** | Presente | Valori aggregati | M3.1 |
| **M4** | **Assente** | — | 0 |
| **M5** | **Assente** | — | 0 |
| **M6** | **Assente** | — | 0 |
| **M7** | **Assente** | — | 0 |
| **M8** | Presente (non SQL) | M8.1 SKIP; M8.2 report | 0 SQL |

**Ordine globale:**
M1.1 → M2.1 → M3.1 → (M8.1 SKIP) → M8.2.

---

## 12. Matrice blocchi / unità / timestamp

| Codice | Blocco | Tabella | Timestamp | File futuro | Unicità |
|---|---|---|---|---|---|
| M1.1 | M1 | `observatory_indicators` | `20260811090000` | `20260811090000_create_observatory_indicators.sql` | Libero |
| M2.1 | M2 | `observatory_statistical_sources` | `20260811100000` | `20260811100000_create_observatory_statistical_sources.sql` | Libero |
| M3.1 | M3 | `observatory_indicator_values` | `20260811110000` | `20260811110000_create_observatory_indicator_values.sql` | Libero |
| M8.1 | M8 | — | — | **SKIP** | — |
| M8.2 | M8 | — | — | Report documentale post-remoto (non SQL) | — |

**Ordine timestamp:** `20260811090000` < `20260811100000` < `20260811110000`, tutti > head `20260810100000`.

---

## 13. Contratto operativo M1.1 — `observatory_indicators`

**File futuro:** `supabase/migrations/20260811090000_create_observatory_indicators.sql`

### 13.1 Responsabilità

Creare l’Aggregate Root `public.observatory_indicators`: codice/slug; definizione testuale; natura; unità; coerenza natura/unità; periodicità; lifecycle operativo; pubblicazione; gate temporali; ownership redazionale implicita; RLS; privilegi; `updated_at`; COMMENT; indici.

### 13.2 Aggregate Root

| Aspetto | Contratto |
|---|---|
| PK | `id uuid NOT NULL DEFAULT gen_random_uuid()` |
| Identità | Autonoma; ≠ valore; ≠ fonte; ≠ contenuto; ≠ dataset; ≠ dashboard |
| Timestamp | `created_at` / `updated_at` `timestamptz NOT NULL DEFAULT now()` |
| Colonne | **16** (Physical §7.2) |
| Ownership | Redazionale implicita; **nessuna** colonna Persona/Impresa/Org/Account/`auth.users` |
| Autore operativo | **Non persistito** |

### 13.3 Identità e testi

| Campo | Regola |
|---|---|
| `code` | NOT NULL; UNIQUE; blank-guard; immutabile dopo prima pubblicazione (**applicativo**) |
| `slug` | NOT NULL; UNIQUE; blank-guard; pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `title`, `description`, `purpose_text`, `methodology_summary` | NOT NULL; blank-guard |
| Vietati | JSON; `metadata`; owner esterni |

### 13.4 Natura

```
value_nature IN ('count','percentage','currency','ratio','index')
```

### 13.5 Unità

```
unit_code IN ('units','percent','eur','eur_thousands','ratio','index_points')
```

### 13.6 Coerenza natura ↔ unità (esaustiva)

| `value_nature` | `unit_code` ammessi |
|---|---|
| `count` | `units` |
| `percentage` | `percent` |
| `currency` | `eur`, `eur_thousands` |
| `ratio` | `ratio` |
| `index` | `index_points` |

CHECK:

```
(
  (value_nature = 'count' AND unit_code = 'units')
  OR (value_nature = 'percentage' AND unit_code = 'percent')
  OR (value_nature = 'currency' AND unit_code IN ('eur','eur_thousands'))
  OR (value_nature = 'ratio' AND unit_code = 'ratio')
  OR (value_nature = 'index' AND unit_code = 'index_points')
)
```

Nessuna altra combinazione ammessa.

### 13.7 Periodicità

```
periodicity IN ('annual','quarterly','monthly','point_in_time')
```

### 13.8 Lifecycle operativo

| Aspetto | Contratto |
|---|---|
| Colonna | `operational_status` |
| Default | `'draft'` |
| Valori | `draft` \| `active` \| `deprecated` \| `retired` |
| Dismissione | Via `deprecated`/`retired`; **non** cancella Valori |

### 13.9 Pubblicazione

| Aspetto | Contratto |
|---|---|
| Colonna | `publication_status` |
| Default | `'unpublished'` |
| Valori | `unpublished` \| `published` \| `withdrawn` |
| Date | `published_at`, `withdrawn_at` nullable |

Gate date (Physical §7.10):

```
(
  (publication_status = 'unpublished' AND published_at IS NULL AND withdrawn_at IS NULL)
  OR (publication_status = 'published' AND published_at IS NOT NULL AND withdrawn_at IS NULL)
  OR (publication_status = 'withdrawn' AND withdrawn_at IS NOT NULL)
)
```

Combinazione vietata (Physical §7.11):

```
NOT (publication_status = 'published' AND operational_status = 'draft')
```

### 13.10 UNIQUE / indici

- UNIQUE `(code)`; UNIQUE `(slug)`
- btree: `operational_status`; `publication_status`; `value_nature`; `periodicity`
- parziale: `(publication_status, operational_status)` WHERE `publication_status = 'published'`

### 13.11 Sicurezza e trigger

| Voce | Contratto |
|---|---|
| RLS | ENABLE; FORCE false; **0** policy |
| REVOKE | ALL da PUBLIC, anon, authenticated |
| GRANT | **0** applicativi |
| Funzione | `set_observatory_indicators_updated_at` SECURITY INVOKER; `search_path = ''` |
| Trigger | `observatory_indicators_set_updated_at` BEFORE UPDATE |
| COMMENT | TABLE + colonne chiave + FUNCTION |

### 13.12 Dipendenze / seed

Dipendenze strutturali: **nessuna**. Seed: **0**. Cataloghi: **0**.

---

## 14. Contratto operativo M2.1 — `observatory_statistical_sources`

**File futuro:** `supabase/migrations/20260811100000_create_observatory_statistical_sources.sql`

### 14.1 Responsabilità

Creare `public.observatory_statistical_sources`: provenienza statistica condivisibile; ente produttore testuale; metadati pubblicazione; lifecycle Fonte; RLS; privilegi; `updated_at`; COMMENT; indici.

### 14.2 Entità

| Aspetto | Contratto |
|---|---|
| PK | `id uuid NOT NULL DEFAULT gen_random_uuid()` |
| Natura | Owned dal dominio; **non** AR; **non** Organizzazione; **non** documento/Storage |
| Condivisione | Una Fonte → molti Valori |
| Colonne | **13** (Physical §9.2) |
| Timestamp | `created_at` / `updated_at` |

### 14.3 Campi

| Campo | Null | Regola |
|---|---|---|
| `name` | NO | Blank-guard |
| `producer_name` | NO | Ente produttore **testuale**; blank-guard |
| `publication_title` | NO | Blank-guard |
| `url` | YES | Blank-guard se presente |
| `external_identifier` | YES | Blank-guard se presente |
| `edition_label` | YES | Blank-guard se presente |
| `source_published_on` | YES | `date` |
| `license_note` | YES | Blank-guard se presente |
| `methodology_note` | YES | Blank-guard se presente |
| `lifecycle_status` | NO | Default `'active'` |

### 14.4 Lifecycle Fonte

```
lifecycle_status IN ('active','deprecated','unavailable')
```

Nessuna pubblicazione autonoma della Fonte.

### 14.5 UNIQUE / indici

- UNIQUE parziale `(external_identifier)` WHERE `external_identifier IS NOT NULL`
- btree: `lifecycle_status`; `producer_name`
- **Nessun** indice obbligatorio su `source_published_on` (Physical)

### 14.6 Vietati

FK Organizzazioni; documenti; file; Storage; dataset a righe.

### 14.7 Sicurezza e trigger

Come M1.1: RLS ENABLE; FORCE false; 0 policy; REVOKE ALL; 0 GRANT; `set_observatory_statistical_sources_updated_at` INVOKER + trigger BEFORE UPDATE; COMMENT.

### 14.8 Dipendenze / seed

Dipendenze strutturali: **nessuna** (indipendente da M1.1). Seed: **0**.

---

## 15. Contratto operativo M3.1 — `observatory_indicator_values`

**File futuro:** `supabase/migrations/20260811110000_create_observatory_indicator_values.sql`

### 15.1 Responsabilità

Creare `public.observatory_indicator_values`: FK Indicatore/Fonte; valore `numeric(24,8)`; periodo; stato; qualità; pubblicazione; dimensioni territorio/settore/paese; chiave logica corrente; revisioni; self-FK; RLS; privilegi; `updated_at`; COMMENT; indici.

### 15.2 Collegamenti

| Colonna | Null | Target | ON DELETE |
|---|---|---|---|
| `indicator_id` | NO | `observatory_indicators(id)` | **RESTRICT** |
| `source_id` | NO | `observatory_statistical_sources(id)` | **RESTRICT** |
| `business_sector_id` | YES | `business_sectors(id)` **bigint** | **RESTRICT** |
| `supersedes_value_id` | YES | `observatory_indicator_values(id)` | **RESTRICT** |

Self-reference: CHECK `supersedes_value_id IS NULL OR supersedes_value_id <> id`.  
UNIQUE parziale su `supersedes_value_id` WHERE NOT NULL (un solo successore).

### 15.3 Valore numerico

| Aspetto | Contratto |
|---|---|
| Colonna | `numeric_value numeric(24,8) NOT NULL` |
| Unità/natura | **Non** duplicate sul Valore (restano sull’Indicatore) |
| Vietati | JSON; testo qualitativo; formule; microdati; liste soggetti |

Vincoli count intero / percentage 0–100: **applicativi** (Physical §10.3); nessun trigger cross-table.

### 15.4 Periodo

| Aspetto | Contratto |
|---|---|
| `period_start` | `date NOT NULL` |
| `period_end` | `date NOT NULL` |
| Ordine | CHECK `period_end >= period_start` |
| Anno | Derivabile; **non** colonna |
| Coerenza con `periodicity` Indicatore | **Applicativa** (Physical §10.4); nessun trigger cross-table; nessuna ridondanza `periodicity` sul Valore |

Contratto applicativo atteso: annual/quarterly/monthly = intervalli civili; `point_in_time` ⇒ `period_start = period_end`.

### 15.5 Stato

```
status IN ('provisional','final','revised','withdrawn')
```

Default: `'provisional'`.

Gate date (Physical §10.5):

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

### 15.6 Qualità

```
quality_code IN ('official','estimated','derived','self_reported')
```

NOT NULL; **senza default** (scelta esplicita). Qualità ≠ stato ≠ Fonte.

### 15.7 Pubblicazione Valore

| Condizione | Significato |
|---|---|
| `published_at IS NULL` e `status <> 'withdrawn'` | Non pubblicato |
| `published_at IS NOT NULL` e status in provisional/final/revised | Pubblicato |
| `status = 'withdrawn'` | Ritirato; `withdrawn_at` obbligatorio; `published_at` può restare |

Relazione con Indicatore `draft`/`unpublished`: invariante **applicativa** (Physical §10.5).

### 15.8 Territorio

Livelli: `italy` \| `region` \| `province` \| `municipality` \| `other`.

CHECK: dimensione completamente assente **oppure** `territory_level` + `territory_label` (blank-guard); `territory_code` opzionale. Nessuna FK geografica.

### 15.9 Settore

`business_sector_id` opzionale → `business_sectors`. Una sola valorizzazione. Nessuno snapshot denominazione.

### 15.10 Paese

`country_code` / `country_label` opachi. Dimensione assente **oppure** label presente (blank-guard); codice opzionale. Nessuna FK. Uso esclusivamente statistico (≠ nazionalità Persona).

### 15.11 Chiave logica corrente

Combinazione:

`indicator_id` + `period_start` + `period_end` + `territory_level` + `territory_code` + `territory_label` + `business_sector_id` + `country_code` + `country_label`

Meccanismo congelato (Physical §10.11):

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
| NULL dimensionali | Uguali (`NULLS NOT DISTINCT`) |
| Valori `withdrawn` | Esclusi → storico illimitato |
| Correnti ammessi | Al più uno tra provisional/final/revised |

### 15.12 Revisioni

| Aspetto | Contratto |
|---|---|
| Nuovo valore | Tipicamente `status = 'revised'` + `revised_at` |
| Precedente | Impostato a `withdrawn` + `withdrawn_at` (**applicativo**, stessa transazione) |
| Catena multi-hop | Applicativa; nessun trigger grafo |
| Cancellazione storica | Vietata operativamente; usare lifecycle |

### 15.13 Indici aggiuntivi

btree: `indicator_id`; `source_id`; `(period_start, period_end)`; `status`; `quality_code`; `territory_level`;  
parziali: `business_sector_id` WHERE NOT NULL; `country_code` WHERE NOT NULL; `supersedes_value_id` WHERE NOT NULL;  
UNIQUE parziali: chiave logica corrente; `supersedes_value_id` WHERE NOT NULL.

### 15.14 Sicurezza e trigger

Come M1.1/M2.1: RLS ENABLE; FORCE false; 0 policy; REVOKE ALL; 0 GRANT; `set_observatory_indicator_values_updated_at` INVOKER + trigger BEFORE UPDATE; COMMENT (aggregato ≠ microdato; soglia 5 applicativa).

### 15.15 Dipendenze

M1.1 + M2.1 + `business_sectors`. Seed: **0**.

---

## 16. Cancellazioni

| Relazione | ON DELETE | Motivazione |
|---|---|---|
| Indicatore → Valori | **RESTRICT** | Nessun CASCADE su storico/pubblicati |
| Fonte → Valori | **RESTRICT** | Conservazione provenienza |
| Settore → Valori | **RESTRICT** | Conservazione storica dimensione |
| Valore precedente → successore (`supersedes_value_id`) | **RESTRICT** | Integrità catena |

Dismissione tramite lifecycle (`retired` / `withdrawn` / `unavailable`), **non** DELETE. Nessuna cancellazione silenziosa di dati pubblicati.

---

## 17. Invarianti applicative (non DDL)

Documentate; **nessun** trigger cross-table:

1. soglia editoriale minima **5** per conteggi da soggetti (salvo fonte ufficiale);
2. coerenza periodicità Indicatore ↔ periodo Valore;
3. `count` senza parte decimale e non negativo;
4. percentage tipicamente 0–100;
5. precedente valore ritirato quando sostituito;
6. provenienza/legittimità Fonte;
7. qualità scientifica sostanziale;
8. assenza sostanziale di microdati all’inserimento;
9. immutabilità `code` dopo prima pubblicazione Indicatore;
10. non pubblicare Valori se Indicatore `draft`/`unpublished` (regola operativa).

---

## 18. RLS e privilegi (tutte le unità)

| Voce | Contratto |
|---|---|
| RLS | `ENABLE ROW LEVEL SECURITY` |
| FORCE RLS | **false** |
| Policy | **0** (nessuna migration policy) |
| REVOKE | ALL da PUBLIC; ALL da anon, authenticated |
| GRANT applicativi | **0** |
| Deny-by-default | Sì |
| Future policy | Unità separate post-ciclo 1 |

Osservatorio non possiede ruoli applicativi.

---

## 19. Trigger e funzioni

| Funzione | Tabella | Pattern |
|---|---|---|
| `set_observatory_indicators_updated_at` | indicators | SECURITY INVOKER; `search_path = ''`; BEFORE UPDATE |
| `set_observatory_statistical_sources_updated_at` | sources | idem |
| `set_observatory_indicator_values_updated_at` | values | idem |

**Esclusi:** trigger di revisione automatica; trigger cross-domain; trigger su Contenuti/Organizzazioni/Persone/Imprese/Auth; trigger periodicità/natura.

---

## 20. Indici (riepilogo Physical)

### Indicatori

UNIQUE code; UNIQUE slug; operational_status; publication_status; value_nature; periodicity; parziale published.

### Fonti

lifecycle_status; producer_name; UNIQUE parziale external_identifier. **No** indice obbligatorio `source_published_on`.

### Valori

indicator_id; source_id; periodo; status; quality_code; territory_level; settore/paese/supersedes parziali; UNIQUE chiave logica corrente `NULLS NOT DISTINCT`; UNIQUE supersedes.

Evitare indici duplicati rispetto a PK/UNIQUE.

---

## 21. Dipendenze (riepilogo)

### Strutturali

- `business_sectors` (M3.1);
- M1.1; M2.1.

### Di derivazione

Tutti i domini sorgente senza FK individuali.

### Future

Organizzazioni; Contenuti; cataloghi geografici/countries; dataset; feed automatici.

### Cicli

Assenti.

---

## 22. Validazione prevista (non eseguita da questo Plan)

### 22.1 Review statica

Logical §15; Physical; Plan; tre migration; natura/unità; lifecycle; Fonte; valore numerico; periodo; stato; qualità; dimensioni; chiave logica; self-FK; revisioni; RLS; privilegi; trigger; confini.

### 22.2 Apply locale

Ordine: **M1.1 → M2.1 → M3.1** (`supabase migration up --local`).

### 22.3 Test runtime con ROLLBACK

**Indicatori:** code/slug; blank guard; nature/unità valide e vietate; periodicità; lifecycle; publication gates; draft+published rifiutato.

**Fonti:** obbligatori; opzionali blank; lifecycle; UNIQUE esterno.

**Valori:** indicatore/fonte/settore validi; numeric; periodo; stato/qualità; territorio/paese; chiave logica; `NULLS NOT DISTINCT`; un solo corrente; withdrawn parallelo ammesso; self-ref rifiutata; un solo successore; FK RESTRICT; `updated_at`.

**Sicurezza:** RLS; zero policy; deny anon/authenticated; zero GRANT.

**Pulizia:** rollback; zero fixture residue.

### 22.4 Dry-run remoto

`supabase db push --linked --dry-run` deve proporre **esattamente tre** migration, ordine M1.1 → M2.1 → M3.1.

### 22.5 Apply remoto

Solo dopo dry-run positivo.

### 22.6 M8.2

Report post-remoto (documentale; non SQL).

---

## 23. M8.1 e M8.2

| Unità | Decisione |
|---|---|
| **M8.1** seed dimostrativi | **SKIP** — nessun seed Indicatori/Fonti/Valori |
| **M8.2** validation report | Previsto **post-remoto**; nessuna migration SQL M8.2 |

---

## 24. Confini confermati

Il blocco **non** creerà: dataset; microdati; Persone; Imprese individuali; Organizzazioni; Contenuti; rapporti; dossier; schede; dashboard; grafici; mappe; ETL; scraping; Storage; JSON; cataloghi geografici; catalogo paesi; policy applicative; M4–M7; M8.1.

---

## 25. Ordine globale

| Unità | Titolo | Tabella | Responsabilità | Dipendenze | Ordine |
|---|---|---|---|---|---|
| M1.1 | Create observatory indicators | `observatory_indicators` | AR Indicatore | — | 1 |
| M2.1 | Create observatory statistical sources | `observatory_statistical_sources` | Fonte statistica | — | 2 |
| M3.1 | Create observatory indicator values | `observatory_indicator_values` | Valori aggregati | M1.1, M2.1, `business_sectors` | 3 |
| M8.1 | Seed | — | SKIP | — | — |
| M8.2 | Validation report | — | Post-remoto | Apply remoto | Fine |

**Ordine:** `M1.1 → M2.1 → M3.1`

**Motivazione:**

* M1.1 e M2.1 sono indipendenti (nessuna FK reciproca);
* M3.1 dipende da entrambe + `business_sectors`;
* ordine aciclico;
* nessuna unità per elementi rinviati/esclusi;
* consente apply integrale cumulativo delle tre migration.

---

## 26. File previsti (non creati da questo Plan)

```
supabase/migrations/20260811090000_create_observatory_indicators.sql
supabase/migrations/20260811100000_create_observatory_statistical_sources.sql
supabase/migrations/20260811110000_create_observatory_indicator_values.sql
```

---

## 27. Criterio di completamento

Con §§1–26 il Migration Plan ciclo 1 è completo. La creazione delle **3** migration SQL è **autorizzabile** senza nuove decisioni semantiche.

**MIGRATION PLAN OSSERVATORIO COMPLETO — CREAZIONE MIGRATION AUTORIZZABILE**
