# Servizi — Validation Report (M8.2)

## 1. Esito

**`ACCETTATA`** (chiusura documentale retrospettiva)

Il ciclo 1 strutturale del dominio **Servizi** (M1–M5, 11 migration SQL) risulta pubblicato su Git e applicato in locale e remoto senza drift di history. Il presente documento chiude formalmente M8.2, che il Migration Plan aveva previsto e lasciato da produrre.

**CICLO 1 SERVIZI VALIDATO E PUBBLICATO SUL DATABASE REMOTO — REPORT M8.2 RETROSPETTIVO COMPLETATO**

---

## 2. Natura retrospettiva

Questo report è **retrospettivo**: non riesegue apply, dry-run o suite runtime mutative. Certifica:

* artefatti autoritativi (Logical, Physical, Migration Plan, SQL);
* commit di pubblicazione schema su `main`;
* allineamento attuale della migration history locale/remota;
* lettura non mutativa del catalogo remoto (tabelle, seed, RLS, FK, trigger, privilegi).

**Non** dichiara conteggi di test runtime o exit code di comandi storici non conservati in un log/report dedicato. I test runtime prescritti nel Migration Plan restano documentati come **prescrizioni**, non come esiti numerici rieseguiti qui.

Nome file adottato: `servizi-m8.2-validation-report.md` (allineato al pattern M8.2 degli altri domini). Il Plan menzionava il path storico `servizi-validation-report.md`; il contenuto di chiusura è questo documento.

---

## 3. Perimetro

| Artefatto | Path |
|---|---|
| Logical | `docs/architecture/logical/servizi.md` |
| Physical (DDL-ready) | `docs/architecture/physical/domain-mapping/servizi.md` |
| Migration Plan | `docs/architecture/migrations/servizi-migration-plan.md` |
| M1.1–M5.3 (11 SQL) | `supabase/migrations/20260805090000` … `20260805190000` |
| M8.2 | questo documento |

* M6 / M7: **assenti** (non inventati).
* M8.1: **SKIP** (nessun seed dimostrativo di AR; seed solo cataloghi normativi).
* Fuori dominio (non inventariate come Servizi): `language_service_*`, `profile_language_service*`, `business_services`, `professional_services`, `professional_service_natures`, `content_service_links`.

---

## 4. Fonti

| Fonte | Uso |
|---|---|
| Logical / Physical / Plan Servizi | Perimetro, ownership, lifecycle, confini |
| 11 file SQL Servizi | Contratto DDL effettivo |
| Commit `dfd23a8` (`feat(db): add services foundation and M1 catalogs`) | Pubblicazione M1 + docs |
| Commit `d768eb2` (`feat(db): add services blocks M2-M5`) | Pubblicazione M2–M5 |
| `supabase migration list --linked` | History locale = remoto |
| Query catalogo remoto (sola lettura) | Tabelle, seed, RLS, FK, trigger, privilegi |
| Report M8.2 di altri domini | Solo modello strutturale |

---

## 5. Inventario migration

| Unità | Timestamp | File | Tabella/Responsabilità | Locale | Remoto |
| ----- | --------- | ---- | ---------------------- | ------ | ------ |
| M1.1 | `20260805090000` | `…_create_service_categories.sql` | Catalogo categorie + seed 6 | Applicata | Applicata |
| M1.2 | `20260805100000` | `…_create_service_economic_bands.sql` | Catalogo fasce economiche + seed 4 | Applicata | Applicata |
| M2.1 | `20260805110000` | `…_create_service_offers.sql` | AR Offerta | Applicata | Applicata |
| M3.1 | `20260805120000` | `…_create_service_offer_territories.sql` | Territori Offerta | Applicata | Applicata |
| M3.2 | `20260805130000` | `…_create_service_offer_languages.sql` | Lingue Offerta | Applicata | Applicata |
| M3.3 | `20260805140000` | `…_create_service_offer_sectors.sql` | Settori Offerta | Applicata | Applicata |
| M3.4 | `20260805150000` | `…_create_service_offer_markets.sql` | Mercati Offerta | Applicata | Applicata |
| M4.1 | `20260805160000` | `…_create_service_requests.sql` | AR Richiesta | Applicata | Applicata |
| M5.1 | `20260805170000` | `…_create_service_request_territories.sql` | Territori Richiesta | Applicata | Applicata |
| M5.2 | `20260805180000` | `…_create_service_request_languages.sql` | Lingue Richiesta | Applicata | Applicata |
| M5.3 | `20260805190000` | `…_create_service_request_sectors.sql` | Settori Richiesta | Applicata | Applicata |

Totale: **11** migration Servizi. Tutte presenti in repository, history locale e remota.

Dipendenze esterne (FK verificate sul remoto): `profiles`, `businesses`, `professional_profiles`, `professional_services`, `business_services`, `opportunities`, `languages` (bigint), `business_sectors` (bigint), `international_markets`, più cataloghi interni `service_categories` / `service_economic_bands`.

---

## 6. Tabelle implementate

| Tabella | Ruolo | Colonne (remoto) |
|---|---|---:|
| `service_categories` | Catalogo C03 | 7 |
| `service_economic_bands` | Catalogo C03 | 7 |
| `service_offers` | Aggregate Root Offerta | 32 |
| `service_offer_territories` | Owned Offerta | 9 |
| `service_offer_languages` | Owned Offerta | 8 |
| `service_offer_sectors` | Owned Offerta | 6 |
| `service_offer_markets` | Owned Offerta | 7 |
| `service_requests` | Aggregate Root Richiesta | 28 |
| `service_request_territories` | Owned Richiesta | 9 |
| `service_request_languages` | Owned Richiesta | 8 |
| `service_request_sectors` | Owned Richiesta | 6 |

Nessuna tabella `service_*` extra sul remoto.

---

## 7. Aggregate Root

* **Offerta:** `public.service_offers` — scheda OffertaDiServizio.
* **Richiesta:** `public.service_requests` — scheda RichiestaDiServizio, distinta, senza colonne provider/source/matching.
* Owned collegate con FK parent **ON DELETE CASCADE**.
* Due AR indipendenti; nessuna tabella polimorfica unica.

---

## 8. Cataloghi e seed

| Catalogo | Seed previsto (Physical/SQL) | Seed verificato (remoto) | Stato |
|---|---:|---:|---|
| `service_categories` | 6 | 6 (tutti `is_active`) | OK |
| `service_economic_bands` | 4 | 4 (tutti `is_active`) | OK |

Codici categorie (ordine `sort_order`): `linguistic`, `training`, `professional_generic`, `financial`, `real_estate`, `support_other`.  
Codici fasce: `low`, `medium`, `high`, `variable`.

AR e tabelle owned: **conteggi 0** (nessun seed demo; M8.1 SKIP).

---

## 9. Ownership

| Aspetto | Implementazione |
|---|---|
| Titolare Offerta/Richiesta | `owner_person_id` **XOR** `owner_business_id` (CHECK) |
| FK owner | → `profiles` / `businesses`, **ON DELETE RESTRICT** |
| Erogatore (solo Offerta) | al più uno tra `provider_person_id`, `provider_professional_profile_id`, `provider_business_id` (SET NULL) |
| Provenienza Offerta | al più uno tra `source_professional_service_id` / `source_business_service_id` (SET NULL) |
| Contesto | `context_opportunity_id` opzionale → `opportunities` SET NULL |
| Organizzazione | solo `external_organization_label` (testo); nessuna FK Org |
| Appartenenza | nessuna FK `business_memberships` |
| Account / `auth.users` | nessuna colonna owner |

Identità & Accessi: accesso applicativo **non** modellato in queste tabelle (deny-by-default; policy future fuori ciclo 1).

---

## 10. Lifecycle

### Offerta (`service_offers`)

| Asse | Valori | Default |
|---|---|---|
| Editoriale | `draft` \| `ready` | `draft` |
| Pubblicazione | `unpublished` \| `published` \| `withdrawn` | `unpublished` |
| Disponibilità | `available` \| `paused` \| `unavailable` | `available` |
| Visibilità | `private` \| `public` | `private` |

Gate pubblicazione (CHECK): `published` ⇒ `published_at NOT NULL` e `editorial_status = 'ready'`; `withdrawn` ⇒ `withdrawn_at NOT NULL`; `unpublished` ⇒ entrambe le date NULL. Archiviazione: `archived_at` nullable.

### Richiesta (`service_requests`)

Stessi assi editoriale/pubblicazione/visibilità; al posto della disponibilità: `process_status` ∈ `open` \| `in_evaluation` \| `concluded` \| `expired` (default `open`). Opzionali: `urgency_kind`, `expires_at`.

---

## 11. PK, FK, CHECK e UNIQUE

* Cataloghi: PK `code` (text).
* AR e owned: PK `uuid` (`gen_random_uuid()`).
* CHECK complessivi sul remoto: **64**.
* UNIQUE oltre PK: indici/constraint `*_uidx` su link owned (territori/lingue/settori/mercati) per evitare duplicati di copertura.
* FK parent owned → AR: **CASCADE**.
* FK verso soggetti/cataloghi esterni: **RESTRICT** o **SET NULL** secondo Physical (verificato sul remoto).
* Nessun CASCADE verso Persone/Imprese owner.

---

## 12. Indici

Presenti indici di listing su owner, category, publication/process status, published partial, archived/expires, e indici di join sulle owned (elenco completo letto dal catalogo remoto; 50+ voci inclusi PK/UNIQUE).

---

## 13. Trigger

Undici trigger `*_set_updated_at` (una per tabella), ciascuno con funzione `set_service_*_updated_at`:

* `SECURITY INVOKER` (`prosecdef = false`);
* `search_path = ''`.

---

## 14. RLS

Su **tutte** le 11 tabelle Servizi:

* RLS **abilitata**;
* FORCE RLS **disattivata**.

---

## 15. Policy e privilegi

| Voce | Valore remoto |
|---|---|
| Policy su `service_%` | **0** |
| GRANT a `PUBLIC` / `anon` / `authenticated` | **0** |
| Pattern | **deny-by-default** |

---

## 16. Apply locale documentato

| Evidenza | Contenuto |
|---|---|
| History locale attuale | versioni `20260805090000`–`20260805190000` presenti |
| Head locale corrente | `20260811110000` (post-domini successivi) |
| Commit schema | `dfd23a8`, `d768eb2` su `main` |

Non è disponibile in repository un log dedicato con stdout/exit code del singolo `supabase migration up --local` dell’epoca Servizi. L’apply locale è **inferito** da history + presenza oggetti (coerente con il flusso Plan e con gli altri domini).

---

## 17. Validazione runtime documentata

| Tipo | Stato |
|---|---|
| Prescrizioni runtime nel Migration Plan (§10–§13, §24) | Presenti (XOR owner, gate publish, CASCADE, UNIQUE owned, anon negato, …) |
| Report/log con esiti PASS/FAIL numerici | **Assente** |
| Suite rieseguita in questo M8.2 | **No** (vietato inventare; non mutativo) |

Pertanto: runtime **prescritto e progettato**, ma **non certificabile numericamente** in questo report.

---

## 18. Dry-run remoto documentato

Nessun artefatto repository conserva stdout/exit code di un dry-run dedicato al solo blocco Servizi. Il Plan lo prevede come passo operativo. Stato: **non dimostrabile come esecuzione storica isolata**.

---

## 19. Apply remoto documentato

| Evidenza | Contenuto |
|---|---|
| History remota | tutte e 11 le versioni `20260805*` con `remote` valorizzato |
| Commit su `origin/main` | SQL Servizi versionati nei commit citati |
| Catalogo remoto odierno | 11/11 tabelle presenti |

Come per l’apply locale: non è conservato il log CLI del push dell’epoca; la pubblicazione remota è **dimostrata** da history + schema.

---

## 20. Verifica remota attuale (non mutativa)

Eseguita in sola lettura sul progetto linked `hvfvfatlaspcpszgizhg`:

* head remoto comune progetto: `20260811110000`;
* pending migration: `0`;
* 11/11 tabelle Servizi presenti;
* seed cataloghi 6+4; AR/owned a 0;
* RLS on / FORCE off / 0 policy / 0 GRANT bad;
* 11 trigger + 11 funzioni INVOKER;
* FK e UNIQUE come da Physical/SQL;
* nessuna tabella `service_*` estranea.

---

## 21. Migration history

| Voce | Valore |
|---|---|
| Ultimo timestamp comune (progetto) | `20260811110000` |
| Pending | `0` |
| Drift Servizi locale/remoto | **0** |
| Incongruenze SQL ↔ history ↔ DB | **Nessuna rilevata** |

---

## 22. Confini

| Elemento | Stato |
|---|---|
| Marketplace / ordini / pagamenti / contratti | Escluso |
| Matching / candidature / messaggistica | Escluso |
| CRM / HR / workflow | Escluso |
| Documenti / Storage / FEV | Escluso |
| DV4 `language_service_*` | Escluso (dominio/legacy distinto) |
| `professional_services` / `business_services` | Solo source opzionale SET NULL |
| Organizzazioni strutturali | Escluso (solo label esterna) |
| Policy applicative | Non presenti (deny-by-default) |
| Mercati su Richiesta | Rinviato |
| FK Appartenenza / membership | Rinviato |

---

## 23. Elementi rinviati

Come Physical/Plan: policy Identità; soft-remove territori; mercati su Richiesta; membership FK; attributi verticali profondi; FEV futuro. Non bloccano la chiusura strutturale M1–M5.

---

## 24. Warning e limiti

* Report creato **dopo** la pubblicazione schema (debito documentale del checkpoint v1).
* Assenza di log runtime storici completi / conteggi test.
* Assenza di log dry-run/apply CLI dell’epoca Servizi.
* Naming Plan (`servizi-validation-report.md`) vs file effettivo (`servizi-m8.2-validation-report.md`).
* Eventuale rumore PowerShell/CLI/`pg-delta` nelle sessioni successive: non incidente sullo schema Servizi.
* Nessuna modifica a SQL/Logical/Physical/Plan in questo task.

---

## 25. Hash SQL

| Migration | SHA-256 |
| --------- | ------- |
| M1.1 `20260805090000_create_service_categories.sql` | `54233B6BA1E94656CB27527E1042EED680B1F014F49D60CCCC6A18F3EEFB0EC5` |
| M1.2 `20260805100000_create_service_economic_bands.sql` | `E34EA1E625F9BD6A41C470B8B047ABF4676A89401121781CD0B0E5F32F4D8D10` |
| M2.1 `20260805110000_create_service_offers.sql` | `2F53F1789D3194DE8F8133E224A4CEF68A9CB5B99FF421C6AA7693CB69C43B3A` |
| M3.1 `20260805120000_create_service_offer_territories.sql` | `F02BFD36172631AE51B1047B7E8D4B03162B847A3E409CE2C138EE9FA4DDFFC7` |
| M3.2 `20260805130000_create_service_offer_languages.sql` | `4143149D30E6241049449410D5EF70D4E24D5D7176C8D971B4FA4FA81FABDB23` |
| M3.3 `20260805140000_create_service_offer_sectors.sql` | `F5B0C8DE530AE384690A24BA4B5C88DD3E8CA92DE410BF4B0E3ADB07828ACFB1` |
| M3.4 `20260805150000_create_service_offer_markets.sql` | `7FE77E76854D95F84E2E83E65C4C48AAB8CDEF85457038B526B02DF15A07D2FD` |
| M4.1 `20260805160000_create_service_requests.sql` | `ED5CDECDF8E83912DADAA0DD83E38DBA1C68FD9F2937BBAF4F3DF679042D23D4` |
| M5.1 `20260805170000_create_service_request_territories.sql` | `C618EA97CCBA7DB5B3746F785AF29AB0EE4B47A9F2F5ADD9AEFC156C13F85838` |
| M5.2 `20260805180000_create_service_request_languages.sql` | `36D676A3A39B425DCE02B1E1FC0ABCB89349EC69B6E9707C4502E1E4A070B1CE` |
| M5.3 `20260805190000_create_service_request_sectors.sql` | `4CA1993064B7796CC2EC131D39BA1C66CF824775616A31B31574D1854C86FD32` |

Hash ricalcolati in questo task; SQL Servizi **non modificati**.

---

## 26. Decisione finale

Schema ciclo 1 coerente tra Logical/Physical/Plan/SQL/history/catalogo remoto; seed cataloghi corretti; sicurezza deny-by-default; confini rispettati. Limite dichiarato: assenza di log runtime/dry-run numerici storici, compensata da verifica strutturale attuale e da pubblicazione Git/history.

**CICLO 1 SERVIZI VALIDATO E PUBBLICATO SUL DATABASE REMOTO — REPORT M8.2 RETROSPETTIVO COMPLETATO**
