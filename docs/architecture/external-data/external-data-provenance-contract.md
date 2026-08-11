# External Data Provenance Contract — D1.2

**Stato:** contratto design-only (nessuna migration applicata)
**Baseline modello:** Osservatorio ciclo 1 + Opportunity M7.2
**Decisione:** **P-D per pilot D1.3** + **P-A opzionale post-pilot** (non bloccante)

---

## 1. WHO / WHAT / WHERE / WHEN / WHICH / HOW / RIGHTS

| Domanda | Campo / meccanismo attuale | Convenzione D1.2 | Gap residuo |
|---|---|---|---|
| WHO | `observatory_statistical_sources.producer_name` | Sempre produttore primario (es. Unioncamere, Eurostat) | — |
| WHAT | `name`, `publication_title`, `edition_label`, `external_identifier` | `external_identifier` = `source_id:dataset_id` stabile | — |
| WHERE | `url` | URL ufficiale dataset/API/metadata page | — |
| WHEN (periodo) | `observatory_indicator_values.period_start/end` | Anno civile → 1 gen–31 dic | — |
| WHEN (acquisito) | **assente in DB** | Sidecar run log `retrieved_at` (P-D pilot) | P-A: colonna `retrieved_at` |
| WHICH VERSION | `edition_label`, `source_published_on`; value `status`/`supersedes` | Dataset edition + Eurostat `updated` in log | observation external id |
| HOW | `methodology_note` (source + value), indicator `methodology_summary` | Definizione originale fonte obbligatoria | — |
| RIGHTS | `license_note` (testo) | Includere code ufficiale es. `CC-BY-4.0`, `IODL-2.0` nel testo | P-A: `license_code` tipizzato |

Opportunity parallelo: `opportunity_sources` (`url`, `external_identifier`, `authority`, `reference_text`, `consulted_at` come proxy debole).

---

## 2. Opzioni confrontate

| Opzione | Descrizione | Pro | Contro | Verdetto |
|---|---|---|---|---|
| **P-A** | Estendere tabelle esistenti con pochi campi tipizzati | Tipizzato, queryable, multi-run audit | Migration + RLS review | **Progettata, post-pilot** |
| **P-B** | Tabella generic `external_source_records` | Multi-dominio | Coupling, overdesign | **No** in D1.x |
| **P-C** | Metadata JSON | Flessibile | Query deboli, schema soft | **No** |
| **P-D** | Nessuna migration; riuso + sidecar | Zero schema risk; pilot immediato | `retrieved_at`/checksum fuori DB | **Scelta pilot D1.3** |

**Preferenza minima tipizzata:** P-D ora; P-A se dopo pilot l’audit in-DB risulta necessario.

---

## 3. Convenzioni P-D (operative, non schema)

### 3.1 Source seed (Osservatorio)

| Source ID registry | `external_identifier` DB | `license_note` esempio |
|---|---|---|
| `unioncamere-opengov` | `unioncamere-opengov:imprenditoria-straniera` | `CC-BY-4.0 — verificare per-dataset; attribuzione Camera titolare + Unioncamere` |
| `unioncamere-futurae-osservatorio` | `unioncamere-futurae:methodology` | `Report pubblico — numeri solo se estratti con ALLOW; link + attribution` |
| `eurostat-lfsa-esgan` | `eurostat:lfsa_esgan` | `Eurostat reuse policy — attribution Eurostat` |

### 3.2 Observation identity (logica)

```
indicator.code
+ period_start + period_end
+ territory_level + territory_code + territory_label
+ business_sector_id? + country_code + country_label
+ source_id (applicativo; UNIQUE DB attuale NON include source_id)
```

**Identità DB corrente** (UNIQUE parziale valori non withdrawn):
`(indicator_id, period_*, territory_*, sector, country_*)` NULLS NOT DISTINCT.

Regola importer: **un indicatore = una semantica fonte**; non mescolare Unioncamere ed Eurostat nello stesso `code`.

### 3.3 Sidecar run artifact (fuori DB)

Path proposto (D1.3, non creato ora):
`artifacts/ingestion/<run_id>/manifest.json`

Campi minimi:
- `run_id`, `source_id`, `started_at`, `ended_at`, `retrieved_at`
- `config_version`, `source_updated` (se API)
- counts: fetched/valid/new/updated/unchanged/rejected/review_required/errors
- per record: `natural_key`, `checksum_sha256`, `action`

### 3.4 Checksum

- Algoritmo: **SHA-256**
- Input: JSON canonico del record **normalizzato** (campi dominio ordinati, non raw HTML)
- Uso: distinguere UNCHANGED vs UPDATE senza re-write

### 3.5 Raw payload

| Decision | Valore |
|---|---|
| Conservare raw completo in DB | **No** |
| Conservare raw su disk | Opzionale corto TTL in `artifacts/` per debug (max size cap) |
| Preferenza | checksum + provenance + URL ufficiale |

---

## 4. Migration block opzionale P-A (NON creare in D1.2/D1.3A)

### D1.2-M1 — Observatorio provenance enhancement (deferred)

| Voce | Spec |
|---|---|
| Responsabilità | Audit ingest tipizzato su values/sources |
| Table | `observatory_indicator_values`, `observatory_statistical_sources` |
| Columns values | `retrieved_at timestamptz NULL`; `external_observation_id text NULL`; `content_checksum text NULL` |
| Columns sources | `license_code text NULL` (anti-blank se set); keep `license_note` |
| FK | nessuna nuova |
| UNIQUE | partial UNIQUE `(external_observation_id)` WHERE NOT NULL |
| Index | `(retrieved_at)` btree opzionale |
| RLS | stesse policy editor write / public read |
| Grants | invariati |
| Lifecycle | nullable; importer valorizza |
| Dependencies | nessuna |

### D1.2-M2 — Opportunity ingest timestamps (deferred)

| Voce | Spec |
|---|---|
| Table | `opportunity_sources` |
| Columns | `retrieved_at timestamptz NULL`; `source_system text NULL` |
| UNIQUE | partial UNIQUE `(source_system, external_identifier)` WHERE both NOT NULL |
| Note | Dedup oggi = convention applicativa |

### D1.2-M3 — Staging subsystem (deferred / non per pilot)

Tabella staging generica **non** richiesta per D1.3A. Vedi staging S-C file-based.

---

## 5. Idempotenza — azioni

| Azione | Condizione | Comportamento |
|---|---|---|
| CREATE | natural key assente | INSERT value `status=provisional` o `final`; `published_at` NULL finché policy publish |
| UPDATE | stesso key, checksum diverso, revisione minore metadata | UPDATE in-place solo se policy consente e status non published history-critical |
| UNCHANGED | checksum uguale | no-op |
| SUPERSEDE | valore numerico/metodologia cambiata su key già published | INSERT nuovo + withdraw previous via `supersedes_value_id` (modello esistente) |

**Vietato:** delete-all + reinsert.

---

## 6. Revisioni statistiche

Fonte corregge 2024: `670000 → 669850`.

1. Trova current non-withdrawn per natural key.
2. Se `numeric_value` identico → UNCHANGED.
3. Se diverso e valore era published → SUPERSEDE (nuovo row, old `withdrawn`).
4. Latest published = non-withdrawn con `published_at IS NOT NULL` e indicatore published.
5. History = catena `supersedes_value_id` (no physical delete).

---

## 7. Attribution UX (contratto UI, non implementare)

**Osservatorio (minimo):**
Fonte · Periodo · Definizione (expandable) · Licenza/attribuzione · “Dato acquisito” solo in admin se utile.

**Opportunità:** Fonte ufficiale · Vai al bando · Ultimo controllo editoriale.

**Mercati (M1):** Fonte · Anno su resource note.

---

## 8. Licensing flags (prima wave)

| Source | ALLOW_INGEST | ALLOW_PUBLISH | ATTRIBUTION_REQUIRED | LINK_ONLY | REVIEW_REQUIRED | BLOCKED |
|---|---|---|---|---|---|---|
| Unioncamere OpenGov CSV (CC-BY-4.0 per-dataset) | YES | YES* | YES | NO | Indicator publish policy | NO |
| Futurae report (aggregati) | SEMI | YES* | YES | prefer link | YES for extract | NO scrape |
| Eurostat lfsa_esgan | YES | YES* | YES | NO | optional | NO |
| incentivi.gov IODL 2.0 | YES | NO auto | YES | NO | **YES always** | NO |
| EU F&T curated | YES | NO auto | YES | NO | **YES always** | NO full dump |
| ICE gated | NO auto | — | — | YES | — | AUTO |
| Stampa | NO | — | — | YES | — | as primary |

\*Osservatorio: publish indicator/values può essere AUTO dopo validazione tecnica del pilot; Opportunity mai auto-publish.

---

*Fine provenance contract D1.2*
