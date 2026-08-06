# Eventi — Validation Report (M8.2)

## 1. Esito

**`ACCETTATA`** (chiusura documentale retrospettiva)

Il ciclo 1 strutturale del dominio **Eventi** (M1–M5, **9** migration SQL) risulta pubblicato su Git e applicato in locale e remoto senza drift di history. Il presente documento chiude formalmente M8.2, previsto dal Migration Plan e lasciato da produrre.

**CICLO 1 EVENTI VALIDATO E PUBBLICATO SUL DATABASE REMOTO — REPORT M8.2 RETROSPETTIVO COMPLETATO**

---

## 2. Natura retrospettiva

Questo report è **retrospettivo**: non riesegue apply, dry-run o suite runtime mutative. Certifica:

* artefatti autoritativi (Logical, Physical, Migration Plan, SQL);
* commit di pubblicazione schema su `main` (`181b8b6`);
* allineamento attuale della migration history locale/remota;
* lettura non mutativa del catalogo remoto.

**Non** dichiara conteggi di test runtime o exit code di comandi storici non conservati in un log/report dedicato. I test runtime prescritti nel Migration Plan restano **prescrizioni**, non esiti numerici rieseguiti qui.

Metodo allineato al M8.2 retrospettivo Servizi; i fatti certificati sono esclusivamente quelli Eventi.

Nome file: `eventi-m8.2-validation-report.md`. Il Plan menzionava `eventi-validation-report.md`; il contenuto di chiusura è questo documento.

---

## 3. Perimetro

| Artefatto | Path |
|---|---|
| Logical | `docs/architecture/logical/eventi.md` |
| Physical (DDL-ready) | `docs/architecture/physical/domain-mapping/eventi.md` |
| Migration Plan | `docs/architecture/migrations/eventi-migration-plan.md` |
| M1.1–M5.3 (9 SQL) | `supabase/migrations/20260806090000` … `20260806170000` |
| M8.2 | questo documento |

* M6 / M7: **assenti**.
* M8.1: **SKIP** (nessun seed dimostrativo di Eventi/Edizioni/Iscrizioni; seed normativo solo catalogo tipi).
* Fuori dominio: `content_event_links` (Contenuti).

---

## 4. Fonti

| Fonte | Uso |
|---|---|
| Logical / Physical / Plan Eventi | Perimetro, ownership, lifecycle, confini |
| 9 file SQL Eventi | Contratto DDL effettivo |
| Commit `181b8b6` (`feat(db): add events cycle 1 schema`) | Pubblicazione schema + docs |
| `supabase migration list --linked` | History locale = remoto |
| Query catalogo remoto (sola lettura) | Tabelle, seed, RLS, FK, trigger, privilegi |
| M8.2 Servizi / altri M8.2 | Solo modello strutturale / metodo |

---

## 5. Inventario migration

| Unità | Timestamp | File | Tabella/Responsabilità | Locale | Remoto |
| ----- | --------- | ---- | ---------------------- | ------ | ------ |
| M1.1 | `20260806090000` | `…_create_event_types.sql` | Catalogo tipi + seed 10 | Applicata | Applicata |
| M2.1 | `20260806100000` | `…_create_events.sql` | AR Evento | Applicata | Applicata |
| M3.1 | `20260806110000` | `…_create_event_editions.sql` | Edizioni | Applicata | Applicata |
| M3.2 | `20260806120000` | `…_create_event_sessions.sql` | Sessioni | Applicata | Applicata |
| M4.1 | `20260806130000` | `…_create_event_organizers.sql` | Organizzatori | Applicata | Applicata |
| M4.2 | `20260806140000` | `…_create_event_speakers.sql` | Relatori | Applicata | Applicata |
| M5.1 | `20260806150000` | `…_create_event_languages.sql` | Lingue Evento | Applicata | Applicata |
| M5.2 | `20260806160000` | `…_create_event_markets.sql` | Mercati Evento | Applicata | Applicata |
| M5.3 | `20260806170000` | `…_create_event_registrations.sql` | Iscrizioni (per Edizione) | Applicata | Applicata |

Totale verificato: **9** migration Eventi (conferma checkpoint). Tutte in repository, history locale e remota.

Dipendenze esterne (FK sul remoto): `profiles`, `businesses`, `professional_profiles`, `languages` (bigint), `international_markets`, `opportunities`, `service_offers`, più catalogo interno `event_types`.

---

## 6. Tabelle implementate

| Tabella | Ruolo | Colonne (remoto) |
|---|---|---:|
| `event_types` | Catalogo C03 | 7 |
| `events` | Aggregate Root | 24 |
| `event_editions` | Owned (occorrenza) | 24 |
| `event_sessions` | Owned da Edizione | 13 |
| `event_organizers` | Owned / ruolo | 10 |
| `event_speakers` | Owned / ruolo | 10 |
| `event_languages` | Owned / link | 8 |
| `event_markets` | Owned / link | 7 |
| `event_registrations` | Owned da Edizione | 11 |

Nessuna tabella `event_*` / `events` estranea sul remoto.

---

## 7. Aggregate Root

* Unico AR: `public.events` (definizione stabile della scheda Evento).
* Edizioni, sessioni, ruoli, lingue, mercati e iscrizioni sono **owned**, non AR.
* Cancellazione AR → CASCADE sulle owned collegate (via FK parent).

---

## 8. Struttura Evento / Edizione

| Livello | Tabella | Natura |
|---|---|---|
| Definizione stabile | `events` | Titolo, tipologia, ownership, lifecycle editoriale/pubblicazione, contesti |
| Occorrenza concreta | `event_editions` | `starts_at` obbligatorio, `timezone`, luogo/link, capienza, assi svolgimento/iscrizioni |
| Unità di programma | `event_sessions` | 0..N per edizione; finestra propria |
| Ricorrenza | — | **Più edizioni**; nessun `recurrence_rule` / RRULE |

Invariante applicativa (non DDL cross-table): Evento `published` ⇒ ≥1 edizione con periodo valorizzato. Dichiarata in SQL/Physical; **nessun trigger** cross-table nel ciclo 1.

---

## 9. Cataloghi e seed

| Catalogo | Seed previsto | Seed verificato | Stato |
|---|---:|---:|---|
| `event_types` | 10 | 10 (tutti `is_active`) | OK |

Codici (ordine `sort_order`): `networking`, `conference`, `fair`, `mission`, `visit`, `institutional`, `course`, `award`, `cultural`, `other`.

AR e owned: conteggi **0** (M8.1 SKIP). Nessun altro catalogo Eventi (`event_formats` / categorie extra assenti: coperto da `delivery_mode` / `type_code`).

---

## 10. Ownership

| Ruolo | Implementazione |
|---|---|
| Owner scheda | `events.owner_person_id` **XOR** `owner_business_id` → `profiles`/`businesses` **RESTRICT** |
| Organizzatore | `event_organizers` (persona/impresa SET NULL; scope edizione opzionale) |
| Relatore | `event_speakers` (persona / professional_profile SET NULL; sessione opzionale) |
| Partecipante | `event_registrations.participant_person_id` RESTRICT; `on_behalf_business_id` SET NULL |
| Autore Account / `auth.users` | assente |
| Organizzazione strutturale | assente (solo `external_organization_label` su Evento) |
| Appartenenza | nessuna FK |
| Redazione | non modellata come owner distinto nel ciclo 1 |

Identità & Accessi: accesso applicativo non implementato (deny-by-default).

---

## 11. Lifecycle

### Evento (`events`)

| Asse | Valori | Default |
|---|---|---|
| Editoriale | `draft` \| `ready` | `draft` |
| Pubblicazione | `unpublished` \| `published` \| `withdrawn` | `unpublished` |
| Visibilità | `private` \| `public` | `private` |

Gate: `published` ⇒ `published_at` + `editorial_status = 'ready'`; `withdrawn` ⇒ `withdrawn_at`; `unpublished` ⇒ date NULL. Archiviazione: `archived_at`.

### Edizione (`event_editions`)

| Asse | Valori | Default |
|---|---|---|
| Svolgimento | `scheduled` \| `ongoing` \| `concluded` \| `postponed` \| `cancelled` | `scheduled` |
| Canale iscrizioni | `not_open` \| `open` \| `closed` | `not_open` |
| Accesso iscrizione | `free` \| `registration_required` \| `by_invitation` | `registration_required` |

Gate: `cancelled` ⇔ `cancelled_at` NOT NULL. Rinvio: `previous_starts_at` + nuovo `starts_at`.

### Iscrizione (`event_registrations`)

Stato iscrizione: vocabolario chiuso lato SQL (submitted/confirmed/cancelled — come Physical); UNIQUE parziale attiva per persona/edizione dove non cancelled.

---

## 12. Date e vincoli temporali

* Tempo autorevole sull’**Edizione**: `starts_at` (NOT NULL), `ends_at` nullable con `ends_at >= starts_at`, `timezone` text IANA (blank-guard), `all_day`.
* Finestre iscrizione: `registration_opens_at`, `registration_deadline`.
* Sessioni: finestra propria; coerenza ⊆ Edizione = **applicativa** (non trigger).
* Luoghi dichiarativi su Edizione; CHECK presenza/link per `in_presence` / `hybrid`.
* **Assenti:** RRULE, calendari esterni, tabelle sedi, FK geografiche.

---

## 13. PK, FK, CHECK e UNIQUE

* Catalogo: PK `code`.
* AR/owned: PK `uuid`.
* CHECK complessivi remoto: **60**.
* FK parent owned → Evento/Edizione/Sessione: tipicamente **CASCADE**.
* Owner Evento / partecipante: **RESTRICT**.
* Contesti Opportunità / OffertaServizio: **SET NULL**.
* Lingua/mercato: **RESTRICT** sul target; CASCADE da Evento.
* UNIQUE su link (lingue/mercati) e vincoli di ordine/identità sessioni/iscrizioni come da SQL.

---

## 14. Indici

Presenti indici di listing/join su owner, type, publication, edizioni per evento, sessioni per edizione, lingue/mercati/registrazioni (catalogo remoto; pattern allineato al Physical).

---

## 15. Trigger

Nove trigger `*_set_updated_at` (una per tabella), con funzioni `set_event_*` / `set_events_updated_at`:

* `SECURITY INVOKER`;
* `search_path = ''`.

---

## 16. RLS

Su **tutte** le 9 tabelle Eventi: RLS **abilitata**; FORCE RLS **false**.

---

## 17. Policy e privilegi

| Voce | Valore remoto |
|---|---|
| Policy su `events` / `event_%` | **0** |
| GRANT a `PUBLIC` / `anon` / `authenticated` | **0** |
| Pattern | **deny-by-default** |

---

## 18. Apply locale documentato

| Evidenza | Contenuto |
|---|---|
| History locale | versioni `20260806090000`–`20260806170000` presenti |
| Head locale corrente | `20260811110000` |
| Commit schema | `181b8b6` su `main` |

Log CLI dedicato con exit code dell’epoca: **non disponibile**. Apply locale **inferito** da history + oggetti.

---

## 19. Validazione runtime documentata

| Tipo | Stato |
|---|---|
| Prescrizioni runtime nel Migration Plan | Presenti |
| Report/log con esiti PASS/FAIL numerici | **Assente** |
| Suite rieseguita in questo M8.2 | **No** |

Runtime **prescritto**, non certificabile numericamente qui.

---

## 20. Dry-run remoto documentato

Nessun artefatto conserva stdout/exit code di un dry-run isolato Eventi. Stato: **non dimostrabile come esecuzione storica isolata**.

---

## 21. Apply remoto documentato

| Evidenza | Contenuto |
|---|---|
| History remota | tutte e 9 le versioni `20260806*` con `remote` valorizzato |
| Commit su `origin/main` | SQL Eventi in `181b8b6` |
| Catalogo remoto odierno | 9/9 tabelle presenti |

Pubblicazione remota **dimostrata** da history + schema.

---

## 22. Verifica remota attuale (non mutativa)

Progetto linked `hvfvfatlaspcpszgizhg`:

* head remoto progetto: `20260811110000`;
* pending: `0`;
* 9/9 tabelle Eventi presenti;
* seed `event_types` = 10; AR/owned = 0;
* RLS on / FORCE off / 0 policy / 0 GRANT bad;
* 9 trigger + 9 funzioni INVOKER;
* FK/CHECK come da Physical/SQL;
* nessuna tabella Eventi estranea.

---

## 23. Migration history

| Voce | Valore |
|---|---|
| Ultimo timestamp comune progetto | `20260811110000` |
| Pending | `0` |
| Drift Eventi locale/remoto | **0** |
| Incongruenze SQL ↔ history ↔ DB | **Nessuna rilevata** |

---

## 24. Relazioni con altri domini

| Dominio | Forma | Classificazione |
|---|---|---|
| Persone (`profiles`) | owner RESTRICT; organizer/speaker SET NULL; participant RESTRICT | FK strutturale |
| Imprese (`businesses`) | owner RESTRICT; organizer/on_behalf SET NULL | FK strutturale |
| Professionisti | `event_speakers.professional_profile_id` SET NULL | FK strutturale opzionale |
| Opportunità | `events.context_opportunity_id` SET NULL | FK contestuale |
| Servizi | `events.context_service_offer_id` SET NULL | FK contestuale |
| Mercati | `event_markets` → `international_markets` RESTRICT | FK link |
| Lingue | `event_languages` → `languages` RESTRICT | FK link |
| Organizzazioni | nessuna FK; solo label esterna | esclusione / etichetta |
| Contenuti | nessuna FK in Eventi (`content_event_links` è Contenuti) | derivazione altro dominio |
| Appartenenze / Identità | nessuna FK | esclusione / rinvio accesso |
| RichiestaDiServizio | assente | esclusione |

---

## 25. Confini

| Elemento | Stato |
|---|---|
| Biglietteria / pagamenti / waitlist / check-in / presenza effettiva | Escluso |
| RRULE / calendari esterni / streaming | Escluso |
| CRM / marketing automation / messaggistica / notifiche | Escluso |
| Documenti / Storage / FEV / moderazione | Escluso |
| Organizzazioni strutturali | Escluso |
| Policy applicative | Non presenti (deny-by-default) |
| Conteggio posti denormalizzato | Derivato (query), non colonna |

---

## 26. Elementi rinviati

Lingue per Edizione/Sessione; soft-coherence edition∈event su organizers; membership FK; Organizzazioni; policy Identità; presenza/check-in; ticketing. Non bloccano la chiusura strutturale M1–M5.

---

## 27. Warning e limiti

* Report creato **dopo** la pubblicazione schema (debito documentale checkpoint v1).
* Assenza di log runtime/dry-run/apply CLI numerici storici.
* Naming Plan (`eventi-validation-report.md`) vs file effettivo (`eventi-m8.2-validation-report.md`).
* Nessuna modifica a SQL/Logical/Physical/Plan né al M8.2 Servizi in questo task.

---

## 28. Hash SQL

| Migration | SHA-256 |
| --------- | ------- |
| M1.1 `20260806090000_create_event_types.sql` | `42CD10C973E6477E43B47F22E8E4401C43D513C29BCEDD2B5DD77C299681FDE6` |
| M2.1 `20260806100000_create_events.sql` | `2CC23AF29F523C0F0498066145B968541FFAD29B6715603BF25A14193ADB4016` |
| M3.1 `20260806110000_create_event_editions.sql` | `50FECDB348BC402C9BF7F14BFD8AD9FE0441185F14F0AC033C5B4AA1326F6FB9` |
| M3.2 `20260806120000_create_event_sessions.sql` | `A0CB04816A2A66F0046151123FCFA3BD9792F840B73E0B344AF1AA1025F04AAA` |
| M4.1 `20260806130000_create_event_organizers.sql` | `C5E65C13CAF5E79046A4BC9B3B4EC16A1308BA747360DD62FC0D352DA503ECCB` |
| M4.2 `20260806140000_create_event_speakers.sql` | `CC5FF72D2291F3D86888534AF3728546C053CED1B8C2B735409836A59401F7C1` |
| M5.1 `20260806150000_create_event_languages.sql` | `26C2B14D42390F0EA25024138161B98F8467E1C16190352567C8D15CA8981FAC` |
| M5.2 `20260806160000_create_event_markets.sql` | `5A3852F112175F2BC15442D8F2A3147AB6CBE12F0A47ED60B260DF08CC6D1C43` |
| M5.3 `20260806170000_create_event_registrations.sql` | `11A58306A289A1804315874EC563EA0A9609F7476F7D59EA0F6A139ABAF29FD7` |

Hash ricalcolati in questo task; SQL Eventi **non modificati**. (`content_event_links` escluso dall’inventario Eventi.)

---

## 29. Decisione finale

Schema ciclo 1 coerente tra Logical/Physical/Plan/SQL/history/catalogo remoto; seed tipi corretto; sicurezza deny-by-default; confini rispettati. Limite dichiarato: assenza di log runtime/dry-run numerici storici, compensata da verifica strutturale attuale e pubblicazione Git/history.

**CICLO 1 EVENTI VALIDATO E PUBBLICATO SUL DATABASE REMOTO — REPORT M8.2 RETROSPETTIVO COMPLETATO**
