# Osservatorio — Validation Report (M8.2)

## 1. Esito

**`ACCETTATA`**

Chiusura tecnica del ciclo 1 del dominio **Osservatorio**: Logical revisionato, Physical DDL-ready, Migration Plan, M1.1–M3.1 applicati e validati in locale (168/168 test PASS), dry-run remoto positivo, apply remoto controllato riuscito, senza drift di migration history.

**CICLO 1 OSSERVATORIO VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**

---

## 2. Perimetro validato

| Artefatto | Path |
|---|---|
| Logical (revisionato) | `docs/architecture/logical/osservatorio.md` |
| Physical (DDL-ready) | `docs/architecture/physical/domain-mapping/osservatorio.md` |
| Migration Plan | `docs/architecture/migrations/osservatorio-migration-plan.md` |
| M1.1 `observatory_indicators` | `supabase/migrations/20260811090000_create_observatory_indicators.sql` |
| M2.1 `observatory_statistical_sources` | `supabase/migrations/20260811100000_create_observatory_statistical_sources.sql` |
| M3.1 `observatory_indicator_values` | `supabase/migrations/20260811110000_create_observatory_indicator_values.sql` |
| M8.2 | questo documento |

M4–M7: **assenti**. M8.1: **SKIP** (nessun seed dimostrativo).

---

## 3. Migration

| Unità | Timestamp | Tabella | Stato locale | Stato remoto |
| ----- | --------- | ------- | ------------ | ------------ |
| M1.1 | `20260811090000` | `observatory_indicators` | Applicata | Applicata |
| M2.1 | `20260811100000` | `observatory_statistical_sources` | Applicata | Applicata |
| M3.1 | `20260811110000` | `observatory_indicator_values` | Applicata | Applicata |

Head locale = head remoto = **`20260811110000`**. Pending = **0**.

---

## 4. Modello implementato

* `public.observatory_indicators` è l’unico Aggregate Root del dominio nel ciclo 1.
* `public.observatory_statistical_sources` è entità owned di dominio, condivisibile tra più valori; non è Organizzazione, Documento né Storage.
* `public.observatory_indicator_values` contiene valori numerici aggregati subordinati all’Indicatore, con Fonte obbligatoria.
* Le serie storiche sono derivate (non persistite come tabella serie).
* Nessun dataset, nessun microdato, nessun rapporto narrativo, nessuna dashboard persistita.

---

## 5. Indicatori

* 16 colonne.
* `code` UNIQUE (codice tecnico stabile).
* `slug` UNIQUE con pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
* Natura chiusa: `count` | `percentage` | `currency` | `ratio` | `index`.
* Unità chiuse: `units` | `percent` | `eur` | `eur_thousands` | `ratio` | `index_points`.
* CHECK esaustivo natura–unità.
* Periodicità: `annual` | `quarterly` | `monthly` | `point_in_time`.
* Lifecycle operativo: `draft` | `active` | `deprecated` | `retired` (default `draft`).
* Pubblicazione: `unpublished` | `published` | `withdrawn` (default `unpublished`).
* Gate temporali su `published_at` / `withdrawn_at` e divieto `published`+`draft`.
* Ownership redazionale implicita: nessuna colonna owner verso Persona/Impresa/Account/`auth.users`.

---

## 6. Fonti statistiche

* 13 colonne.
* Ente produttore testuale (`producer_name`); nessuna FK Organizzazioni.
* Identificativo esterno opzionale con UNIQUE parziale quando valorizzato.
* Lifecycle: `active` | `deprecated` | `unavailable` (default `active`).
* Nessun file, nessun documento, nessuno Storage.
* Zero FK.

---

## 7. Valori

* 21 colonne.
* `numeric_value numeric(24,8)`.
* FK obbligatorie verso Indicatore e Fonte; FK opzionale verso `public.business_sectors`; self-FK per revisioni.
* Tutte le FK `ON DELETE RESTRICT` / `ON UPDATE NO ACTION`.
* Periodo strutturato (`period_start`, `period_end`) con `period_end >= period_start`.
* Stato: `provisional` | `final` | `revised` | `withdrawn` (default `provisional`).
* Qualità: `official` | `estimated` | `derived` | `self_reported`.
* Dimensioni opzionali: territorio, settore, paese statistico.
* Pubblicazione e date (`published_at`, `revised_at`, `withdrawn_at`) con gate di stato.
* Nessun JSON; nessun valore testuale al posto del numerico.

---

## 8. Chiave logica corrente

* Indice UNIQUE parziale `observatory_indicator_values_current_logical_uidx`.
* `NULLS NOT DISTINCT`.
* Clausola: `WHERE status <> 'withdrawn'`.
* I NULL nelle dimensioni sono trattati come uguali.
* Una sola riga corrente per combinazione logica.
* Valori `withdrawn` paralleli sulla stessa chiave ammessi.
* Verifica runtime locale superata con SQLSTATE `23505` sui duplicati correnti.

---

## 9. Revisioni

* `supersedes_value_id` self-FK opzionale.
* Anti-self-reference (`supersedes_value_id <> id`).
* Un solo successore (UNIQUE parziale su `supersedes_value_id`).
* Storico conservato; cancellazione del precedente referenziato → RESTRICT.
* Il precedente non viene ritirato automaticamente (invariante applicativa dichiarata).
* Nessun CASCADE.

---

## 10. Privacy e soglia

* Nessuna FK verso Persone (`profiles`/analoghi).
* Nessuna FK verso Imprese individuali (`businesses`).
* Nessun microdato; solo valori aggregati.
* Soglia editoriale 5 non implementata come CHECK universale SQL.
* Soglia e legittimità della pubblicazione restano applicative/editoriali.

---

## 11. Apply locale

* Comando: `supabase migration up --local`
* Exit code: `0`
* Migration applicate: M1.1 → M2.1 → M3.1
* Head locale: `20260811110000`

---

## 12. Validazione runtime

* **168/168 test PASS**; zero test falliti.
* Copertura esercitata in transazioni con `ROLLBACK`:
  * indicatori (identità, blank guard, slug);
  * natura/unità e coerenza;
  * periodicità;
  * lifecycle operativo;
  * publication gates;
  * fonti (blank, UNIQUE esterno, lifecycle);
  * collegamenti valori e numerici;
  * periodo;
  * stato e qualità;
  * territorio / settore / paese;
  * chiave logica `NULLS NOT DISTINCT` (SQLSTATE `23505`);
  * revisioni e FK RESTRICT;
  * trigger `updated_at`;
  * RLS e privilegi;
  * assenza di fixture residue post-rollback.

---

## 13. Dry-run remoto

* Comando: `supabase db push --linked --dry-run`
* Exit code: `0`
* Proposte esattamente le tre migration Osservatorio, in ordine.
* Nessuna migration inattesa.
* Database remoto invariato (tabelle Osservatorio ancora assenti; head remoto restato `20260810100000`).

---

## 14. Apply remoto

* Comando: `supabase db push --linked --yes`
* Exit code: `0`
* Ordine: M1.1 → M2.1 → M3.1
* Head remoto: `20260811110000`
* Pending: `0`

---

## 15. Verifica remota

Eseguita sul catalogo remoto dopo l’apply, senza fixture:

* tre tabelle presenti;
* conteggi tutti a `0`;
* 16 colonne Indicatori; 13 Fonti; 21 Valori;
* 4 FK tutte RESTRICT; zero CASCADE;
* UNIQUE parziale `external_identifier` Fonti;
* chiave logica `NULLS NOT DISTINCT` + `WHERE status <> 'withdrawn'`;
* self-FK e anti-self presenti;
* tre trigger `*_set_updated_at`;
* zero colonne JSON; zero seed.

---

## 16. Sicurezza

* RLS abilitata sulle tre tabelle; FORCE RLS disattivata.
* Zero policy.
* Zero privilegi a `PUBLIC`, `anon`, `authenticated`.
* Funzioni trigger `SECURITY INVOKER` con `search_path = ''`.
* Deny-by-default.

---

## 17. Confini confermati

Assenti nel ciclo 1 (DDL e history):

* microdati; Persone individuali; Imprese individuali; Organizzazioni; Contenuti;
* dataset; rapporti; dossier; schede; dashboard; grafici; mappe; trend; ranking;
* ETL; scraping; importazioni; Storage; JSON;
* cataloghi geografici; catalogo paesi; seed; policy applicative;
* M4–M7; M8.1.

---

## 18. Warning

Classificati come **non bloccanti**:

* rumore PowerShell (`NativeCommandError` / stream stderr CLI);
* warning cache `pg-delta` e certificato cache mancante (directory temporanea rimossa);
* NOTICE PostgreSQL sul troncamento del nome del CHECK `observatory_statistical_sources_publication_title_not_blank_check` (il vincolo esiste ed è stato verificato);
* warning LF/CRLF Git sul Logical;
* nessun impatto sull’apply remoto (exit code `0`, head e pending allineati).

---

## 19. Hash finali

| Migration | SHA-256                                                            |
| --------- | ------------------------------------------------------------------ |
| M1.1      | `14205415E0AAA2434283EC63BFFCF63B3D23ACEF75FB5DC3CCC0963705959299` |
| M2.1      | `94597C9A93B58B6578526E06CBED75F3883852F26CEBD13CBF5DFCBDED63F4D7` |
| M3.1      | `9FEDE07F8D724D549C7947B174A3DDEA7F2BFE467ADE5DAD68B7D76145BD3F37` |

---

## 20. Decisione

**CICLO 1 OSSERVATORIO VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**
