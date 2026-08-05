# Contenuti — Validation and Reconciliation Report (M8.2)

## 1. Esito finale

**`ACCETTATA`**

**DOMINIO CONTENUTI CICLO 1 CHIUSO.**

Lo schema strutturale del dominio Contenuti (M1–M5, 12 migration SQL) è validato, pubblicato su Git e applicato in locale e remoto senza drift. M6 e M7 restano assenti; M8.1 è SKIP; questo report chiude formalmente M8.2.

---

## 2. Identificazione

| Campo | Valore |
|---|---|
| Dominio | **Contenuti** (Contenuti editoriali) |
| Unità | **M8.2** — Validazione e accettazione finale |
| Artefatto | `docs/architecture/migrations/contenuti-validation-report.md` |
| Branch | `main` |
| HEAD schema pubblicato | `e1c9a3965ef490ef444f9497cb234b247e9c47ef` |
| Messaggio commit schema | `feat(db): add contents cycle 1 schema` |
| Local migration head | `20260807200000` |
| Remote migration head | `20260807200000` |
| Drift history | **0** |

---

## 3. Perimetro ciclo 1

**Incluso e chiuso**

* Aggregate Root unico `public.contents`
* Cataloghi `content_types` (seed 11), `content_categories` (seed 8), `content_tags` (seed 0)
* Owned: authors, tag links, subject/event/opportunity/service/market links, content relations
* Ownership ternaria Persona \| Impresa \| Redazione
* Pattern RLS deny-by-default (ENABLE, FORCE false, 0 policy, REVOKE)

**Escluso (confermato)**

* M6/M7 SQL; CMS / page builder; JSONB modellante; versioning; traduzioni owned; Storage; commenti; analytics; FEV
* Organizzazioni; `auth.users` come owner; policy Identità
* Assorbimento di `personal_stories` e `business_media`
* Seed dimostrativi (M8.1 SKIP)

---

## 4. Inventario delle 12 migration

| # | Timestamp | File | Unità | Tabella |
|---|---|---|---|---|
| 1 | `20260807090000` | `create_content_types.sql` | M1.1 | `content_types` |
| 2 | `20260807100000` | `create_content_categories.sql` | M1.2 | `content_categories` |
| 3 | `20260807110000` | `create_content_tags.sql` | M1.3 | `content_tags` |
| 4 | `20260807120000` | `create_contents.sql` | M2.1 | `contents` |
| 5 | `20260807130000` | `create_content_authors.sql` | M3.1 | `content_authors` |
| 6 | `20260807140000` | `create_content_tag_links.sql` | M3.2 | `content_tag_links` |
| 7 | `20260807150000` | `create_content_subject_links.sql` | M4.1 | `content_subject_links` |
| 8 | `20260807160000` | `create_content_event_links.sql` | M4.2 | `content_event_links` |
| 9 | `20260807170000` | `create_content_opportunity_links.sql` | M4.3 | `content_opportunity_links` |
| 10 | `20260807180000` | `create_content_service_links.sql` | M5.1 | `content_service_links` |
| 11 | `20260807190000` | `create_content_market_links.sql` | M5.2 | `content_market_links` |
| 12 | `20260807200000` | `create_content_relations.sql` | M5.3 | `content_relations` |

**Totale:** 12 migration SQL Contenuti. Nessuna migration M6/M7/M8.

---

## 5. Inventario delle 12 tabelle

| # | Tabella | Natura |
|---|---|---|
| 1 | `public.content_types` | Catalogo C03 |
| 2 | `public.content_categories` | Catalogo C03 |
| 3 | `public.content_tags` | Catalogo C03 |
| 4 | `public.contents` | Aggregate Root |
| 5 | `public.content_authors` | Owned |
| 6 | `public.content_tag_links` | Owned |
| 7 | `public.content_subject_links` | Owned |
| 8 | `public.content_event_links` | Owned |
| 9 | `public.content_opportunity_links` | Owned |
| 10 | `public.content_service_links` | Owned |
| 11 | `public.content_market_links` | Owned |
| 12 | `public.content_relations` | Owned |

Verificato locale e remoto: **12/12** tabelle presenti.

---

## 6. Riconciliazione Logical → Physical → Plan → SQL

| Logical | Physical | Plan | SQL |
|---|---|---|---|
| Contenuto (AR) | `contents` | M2.1 | `20260807120000` |
| TipologiaEditoriale | `content_types` | M1.1 | `20260807090000` |
| CategoriaContenuto | `content_categories` | M1.2 | `20260807100000` |
| Tag | `content_tags` + `content_tag_links` | M1.3 / M3.2 | `…110000` / `…140000` |
| Autore / Responsabile | `content_authors` | M3.1 | `20260807130000` |
| SoggettoDescritto | `content_subject_links` | M4.1 | `20260807150000` |
| Oggetto Evento | `content_event_links` | M4.2 | `20260807160000` |
| Oggetto Opportunità | `content_opportunity_links` | M4.3 | `20260807170000` |
| Oggetto Servizio | `content_service_links` | M5.1 | `20260807180000` |
| Contesto Mercato | `content_market_links` | M5.2 | `20260807190000` |
| Contenuto correlato | `content_relations` | M5.3 | `20260807200000` |
| StoriaPersonale / MediaImpresa | non mappate | esclusione | non create |

**Allineamento:** coerente. Nessuna tabella extra; nessun contratto SQL inventato oltre Physical/Plan.

---

## 7. History locale e remota

| Ambiente | Head | Contenuti `20260807*` | Drift vs file |
|---|---|---|---|
| Locale (`schema_migrations`) | `20260807200000` | 12/12 | 0 |
| Remoto linked | `20260807200000` | 12/12 | 0 |
| Repository Git (`e1c9a39`) | file 12/12 | — | — |

`supabase migration list --local` e `--linked`: ogni coppia `local`/`remote` per `20260807090000`…`20260807200000` è uguale. **Drift = 0.**

---

## 8. Seed

| Catalogo | Atteso | Locale | Remoto |
|---|---|---|---|
| `content_types` | 11 | 11 | 11 |
| `content_categories` | 8 | 8 | 8 |
| `content_tags` | 0 | 0 | 0 |
| AR / authors / links | 0 demo | 0 | 0 |

Seed tipologies include `personal_story` come classificazione; **non** assorbe `personal_stories`.

---

## 9. RLS, FORCE, policy, privilegi

| Controllo | Locale | Remoto |
|---|---|---|
| ENABLE RLS | 12/12 | 12/12 |
| FORCE RLS | false (0) | false (0) |
| CREATE POLICY | 0 | 0 |
| GRANT / privilegi PUBLIC, anon, authenticated | 0 | 0 |

REVOKE ALL da PUBLIC, anon e authenticated applicato in ogni migration; nessun GRANT applicativo.

---

## 10. COMMENT ON, funzioni, trigger

| Oggetto | Conteggio verificato (locale) |
|---|---|
| COMMENT ON TABLE | 12/12 |
| Funzioni `set_*_updated_at` | 12/12 |
| COMMENT ON FUNCTION | 12/12 |
| Trigger BEFORE UPDATE | 12/12 |
| COMMENT ON COLUMN (AR `contents`) | 25 (tutte le colonne) |

Funzioni: `SECURITY INVOKER`, `search_path = ''`. Nessun trigger cross-table per responsabile editoriale (invariante applicativa).

---

## 11. Hash SQL invariati

SHA-256 al momento della chiusura documentale (invariati rispetto alla review post-creazione):

| File | SHA-256 |
|---|---|
| `20260807090000_create_content_types.sql` | `6b8794c516a1874a56757bd7681c335dda2577c23a6db90b66cfeb8b3a0c31c3` |
| `20260807100000_create_content_categories.sql` | `8a7b38ee56c6d126329d6346b5534c911a6f192d249c0b04ba64e12ed6faea2f` |
| `20260807110000_create_content_tags.sql` | `4cffd288c1e46b7cc70dd4b042addebd8c3d266a89a6f01deddf889ee47709c5` |
| `20260807120000_create_contents.sql` | `c77e4005d607a9e25e6fc4be23aa6250617fca906e94e2f36de2e596184bb6da` |
| `20260807130000_create_content_authors.sql` | `d8e7439e15a491ae8a47d7eb41725c9d512fe9e6d1472c90c2bdd548de286657` |
| `20260807140000_create_content_tag_links.sql` | `1800ce7da7d245dba6210aa6b929677077f34f62836a7e4c929408863c479134` |
| `20260807150000_create_content_subject_links.sql` | `6cb1e77a4e1d303bec6b263e8411b5b6ad92a9f0ad8925260cb95701b3a860ed` |
| `20260807160000_create_content_event_links.sql` | `907a57f45b7d0b1be048c0249160fe9c386b37f921a55845dbc8bd06cb4655e1` |
| `20260807170000_create_content_opportunity_links.sql` | `e8733f599959cee2f94658b94158d3a6aed4eb293b451f507f1fe8d5e859ca0d` |
| `20260807180000_create_content_service_links.sql` | `b5d5ca31f21bb31193fdae1ce03018d99020ff884afe4f66075edd00a394a77b` |
| `20260807190000_create_content_market_links.sql` | `907a16877e12d559f7ca20fd9e42dab875ce4582a2b2c20d335878e77b94a3a2` |
| `20260807200000_create_content_relations.sql` | `f6a18dc2394439742809ff8b91d25c12b17eb48cf229a35ab127a65483aeb08b` |

---

## 12. Migration precedenti e legacy

| Controllo | Esito |
|---|---|
| Migration Eventi/Servizi/altri domini modificate | **No** (intatte) |
| `personal_stories` assorbita | **No** |
| `business_media` assorbita | **No** |
| FK a Organizzazioni | **No** |
| FK ad `auth.users` come owner Contenuti | **No** |

---

## 13. M6, M7, M8

| Blocco | Stato |
|---|---|
| M1–M5 | **Completati** (12 SQL create, applicate, pubblicate) |
| M6 | **Assente** |
| M7 | **Assente** |
| M8.1 Seed dimostrativi | **SKIP** |
| M8.2 Validazione finale | **ACCETTATA** (questo report) |

---

## 14. Limiti e rinvii del ciclo 1

Restano fuori ciclo 1 (come da Logical/Physical/Plan): versioning; traduzioni owned; multi-categoria; seed tag normativi; `content_sources`/FEV; SEO avanzata; scheduling/embargo; Collaborazioni link; trigger DDL per responsabile editoriale obbligatorio; policy Identità & Accessi.

---

## 15. Criteri di chiusura

| Criterio | Esito |
|---|---|
| 12 migration in history locale e remota | OK |
| 12 tabelle locale = remoto | OK |
| Head `20260807200000` | OK |
| Drift 0 | OK |
| Seed 11 / 8 / 0 | OK |
| RLS 12; FORCE false; policy 0 | OK |
| Privilegi applicativi assenti | OK |
| COMMENT / trigger / funzioni | OK |
| Hash invariati; legacy non assorbite | OK |
| M6/M7 assenti; M8.1 SKIP | OK |
| Matrice L → P → Plan → SQL | OK |
| Schema su `origin/main` (`e1c9a39`) | OK |

---

## 16. Decisione finale

**M8.2 ACCETTATA.**

**DOMINIO CONTENUTI CICLO 1 CHIUSO.**

Nessuna ulteriore migration SQL Contenuti ciclo 1. Nessun `db push` aggiuntivo richiesto da questo report. Dominio successivo (Organizzazioni) non avviato da questo artefatto.
