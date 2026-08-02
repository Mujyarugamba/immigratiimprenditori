# Validation Report — Professionisti M1 — Cataloghi

| Campo | Valore |
|---|---|
| **Stato** | **APPROVATO** |
| Data report | 2026-08-02 |
| Blocco | M1 — Cataloghi Professionisti (M1.1–M1.4) |
| Commit Git autorevole (SQL + Plan + Physical) | `b48b147a4ec49a980bc4d96c34b6f491234d1283` |
| Branch | `main` (`main` = `origin/main`) |
| Project ref Supabase | `hvfvfatlaspcpszgizhg` |
| PostgreSQL remoto | `17.6.1` (CLI temp: `17.6.1.147`) |
| Supabase CLI | `2.109.1` |
| Ultima migration M1 | `20260803120000` |
| Local = Remote | **Sì** (delta 0) |

---

## 1. Scopo

Questo report certifica **esclusivamente** la chiusura operativa e documentale del **blocco M1 — Cataloghi Professionisti**.

Non certifica:

* l’intero dominio Professionisti;
* il ciclo 1 completo (M2–M6);
* l’unità M8.2 di validazione di dominio;
* l’autorizzazione o l’implementazione di oggetti successivi a M1.

Nome file adottato (prescrizione operativa di chiusura blocco; Plan §26 punto 13 «Report di blocco»):

`docs/architecture/migrations/professionisti-m1-validation-report.md`

---

## 2. Perimetro certificato

| Area | Contenuto |
|---|---|
| Migration | M1.1, M1.2, M1.3, M1.4 |
| Tabelle | `professional_categories`, `professional_practice_modes`, `professional_source_kinds`, `professional_service_natures` |
| Cataloghi | 4 cataloghi C03 normativi |
| Seed | 33 + 11 + 13 + 7 = **64** righe |
| Funzioni | 4 × `set_*_updated_at` |
| Trigger | 4 × `*_set_updated_at` BEFORE UPDATE |
| RLS | ENABLE su 4/4; nessuna FORCE |
| Privilegi | REVOKE ALL da `PUBLIC` / `anon` / `authenticated`; nessun GRANT applicativo |

---

## 3. Oggetti esclusi (dichiarazione esplicita)

Non inclusi in M1 e **non** implementati da questo blocco:

* Aggregate Root `professional_profiles`;
* profili professionali;
* qualifiche, iscrizioni, abilitazioni, certificazioni;
* associazioni professionali;
* competenze;
* servizi concreti (`professional_services`);
* territori, lingue, mercati, settori;
* FEV (fonti / evidenze / verifiche);
* specializzazioni;
* policy RLS applicative;
* GRANT applicativi.

---

## 4. Fonti autorevoli

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `docs/architecture/physical/domain-mapping/professionisti.md` **§29** | Contratto DDL-ready |
| 2 | `docs/architecture/migrations/professionisti-migration-plan.md` (§12 M1, §23–§28) | Sequenza, review, apply, stop point |
| 3 | `docs/architecture/logical/professionisti.md` | Vocabolari label / gruppi |
| 4 | Quattro file SQL M1 in `supabase/migrations/` | DDL + seed effettivi |
| 5 | Review per unità M1.1–M1.4; review congiunta blocco M1 | Gate pre-apply (sessione operativa) |
| 6 | Ciclo locale (doppio reset, smoke, negativi) + review esito | Evidenza locale |
| 7 | Commit/push `b48b147…`; pre-apply remoto; apply remoto `2026-08-02T11:12:30+02` | Evidenza Git e remoto |
| 8 | `supabase migration list` + `supabase db query --linked` / `--local` | Stato DB al momento del report |

**Nota sulle evidenze documentali.** Nel repository, oltre al Plan e a questo report, **non** risultano salvati file Markdown separati delle review intermedie M1 (review unità, congiunta, ciclo locale, commit, pre-apply, apply). Tali esiti sono attestati dalla cronologia operativa della sessione, dal commit `b48b147…` e dalle verifiche ripetute locale/remoto eseguite per questo report.

---

## 5. Hash autorevoli

| Unità | File | `git hash-object` |
|---|---|---|
| M1.1 | `20260803090000_create_professional_categories.sql` | `f6cfbaa6b416ac1fb3bf3e14a166048754cad883` |
| M1.2 | `20260803100000_create_professional_practice_modes.sql` | `fc2b38b85a5af19e425bbcd7b9c7024fad027bad` |
| M1.3 | `20260803110000_create_professional_source_kinds.sql` | `a5cdc7bd6ab5269c6ecb133a5eec639378d7ae17` |
| M1.4 | `20260803120000_create_professional_service_natures.sql` | `393c33904045c8c7d50490fc1278d77610cbcd67` |

Confermati al momento della redazione di questo report (working tree SQL invariato rispetto a HEAD).

---

## 6. Cronologia essenziale del blocco M1

Date/timestamp riportati solo se disponibili da commit Git o da evidenza operativa registrata.

| # | Fase | Evidenza temporale / esito |
|---|---|---|
| 1 | Chiusura contratto DDL-ready §29 | Physical Professionisti incluso nel commit `b48b147…` (2026-08-02 10:59:12 +0200) |
| 2 | Creazione Migration Plan | `professionisti-migration-plan.md` nello stesso commit |
| 3 | Micro-review del Plan | Approvata in sessione (prerequisito M1.1) |
| 4 | Creazione e review M1.1 | Approvata; hash `f6cfbaa6…` |
| 5 | Creazione e review M1.2 | Approvata; hash `fc2b38b8…` |
| 6 | Creazione e review M1.3 | Approvata; hash `a5cdc7bd…` |
| 7 | Creazione e review M1.4 | Approvata; hash `393c3390…` |
| 8 | Review congiunta blocco M1 | Approvata; dry-run/apply locale autorizzati |
| 9 | Doppio reset locale | Due `supabase db reset` riusciti (ripetibilità); recovery Docker 500 iniziale |
| 10 | Smoke e test negativi locali | Superati; seed 64/64; SQL invariati |
| 11 | Review esito locale | Approvata; commit/push autorizzati |
| 12 | Commit | `b48b147a4ec49a980bc4d96c34b6f491234d1283` — `feat(db): add professionals block M1 catalogs` — 2026-08-02 10:59:12 +0200 |
| 13 | Push | `main` → `origin/main` (allineati) |
| 14 | Pre-apply remoto | Approvato; dry-run elencava solo le 4 migration M1 |
| 15 | Apply remoto | `supabase db push --linked` — **2026-08-02T11:12:30+02** — durata ≈ 3 s — exit code **0** |
| 16 | Smoke / verifica remota | 4 tabelle; seed 64/64; RLS/policy/privilegi conformi |
| 17 | Chiusura documentale blocco | **Questo report** (2026-08-02) |

---

## 7. Inventario migration

| Unità | Timestamp | Slug | Tabella | Seed | Stato locale | Stato remoto |
| ----- | --------- | ---- | ------- | ---: | ------------ | ------------ |
| M1.1 | `20260803090000` | `create_professional_categories` | `professional_categories` | 33 | Applicata | Applicata; local = remote |
| M1.2 | `20260803100000` | `create_professional_practice_modes` | `professional_practice_modes` | 11 | Applicata | Applicata; local = remote |
| M1.3 | `20260803110000` | `create_professional_source_kinds` | `professional_source_kinds` | 13 | Applicata | Applicata; local = remote |
| M1.4 | `20260803120000` | `create_professional_service_natures` | `professional_service_natures` | 7 | Applicata | Applicata; local = remote |

`supabase migration list`: ultima entry `20260803120000` presente su local e remote; delta local-only / remote-only = **0**.

---

## 8. Inventario tabelle (remoto verificato)

| Tabella | Colonne | PK | CHECK | Funzione | Trigger | RLS | Policy | Seed |
| ------- | ------: | -- | ----: | -------- | ------- | --- | -----: | ---: |
| `professional_categories` | 8 | 1 (`code`) | 4 | `set_professional_categories_updated_at` | `professional_categories_set_updated_at` | ON | 0 | 33 |
| `professional_practice_modes` | 6 | 1 (`code`) | 3 | `set_professional_practice_modes_updated_at` | `professional_practice_modes_set_updated_at` | ON | 0 | 11 |
| `professional_source_kinds` | 6 | 1 (`code`) | 3 | `set_professional_source_kinds_updated_at` | `professional_source_kinds_set_updated_at` | ON | 0 | 13 |
| `professional_service_natures` | 6 | 1 (`code`) | 3 | `set_professional_service_natures_updated_at` | `professional_service_natures_set_updated_at` | ON | 0 | 7 |
| **Totale** | — | **4** | **13** | **4** | **4** | **4/4** | **0** | **64** |

---

## 9. Verifica colonne

### 9.1 Categories (`professional_categories`)

`code`, `label_it`, `group_code`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`.

### 9.2 Altri cataloghi

`code`, `label_it`, `sort_order`, `is_active`, `created_at`, `updated_at`.

### 9.3 Conformità

* colonne extra: **0**;
* colonne mancanti: **0**;
* `group_code` e `description` presenti **solo** su categories;
* tipi, nullability e default allineati a §29.3 e agli SQL M1 (confermati da catalogo remoto e SQL invariati).

---

## 10. Verifica seed

| Catalogo | Attesi | Locale | Remoto | Mismatch |
| --------------- | -----: | -----: | -----: | -------: |
| Categories | 33 | 33 | 33 | 0 |
| Practice modes | 11 | 11 | 11 | 0 |
| Source kinds | 13 | 13 | 13 | 0 |
| Service natures | 7 | 7 | 7 | 0 |
| **Totale** | **64** | **64** | **64** | **0** |

Controlli aggiuntivi (remoto, categories):

* duplicati su `code`: **0**;
* label vuote: **0**;
* inattivi: **0** (tutti `is_active = true`);
* `group_code` distinti: **10** (vocabolario §29.22);
* `description` non NULL: **0** (tutte NULL, conforme seed M1.1);
* sort order e valori code allineati a §29.27 / SQL M1.

---

## 11. Verifica strutturale

| Controllo | Esito |
|---|---|
| PK su `code` | 4/4 |
| UNIQUE aggiuntive | 0 |
| Indici extra (oltre PK) | 0 |
| Sequence | 0 |
| Identity | 0 |
| UUID / colonna `id` | 0 |
| FK | 0 |
| Enum tipizzati | 0 |
| Viste `professional_%` | 0 |
| Tabelle `professional_%` extra oltre le 4 M1 | 0 |

---

## 12. Funzioni e trigger

| Funzione | Trigger | Tabella |
|---|---|---|
| `public.set_professional_categories_updated_at()` | `professional_categories_set_updated_at` | `professional_categories` |
| `public.set_professional_practice_modes_updated_at()` | `professional_practice_modes_set_updated_at` | `professional_practice_modes` |
| `public.set_professional_source_kinds_updated_at()` | `professional_source_kinds_set_updated_at` | `professional_source_kinds` |
| `public.set_professional_service_natures_updated_at()` | `professional_service_natures_set_updated_at` | `professional_service_natures` |

Conferme:

* `SECURITY INVOKER` (`prosecdef = false`);
* `search_path` impostato in definizione;
* aggiornano solo `updated_at`;
* BEFORE UPDATE FOR EACH ROW;
* trigger abilitati (`tgenabled = O`);
* nessuna collisione di nome;
* smoke locale superato nel ciclo di blocco;
* definizione remota presente e conforme;
* eventuali test remoti non persistenti (nessuna riga residua attesa).

---

## 13. Sicurezza

| Controllo | Esito |
|---|---|
| RLS ENABLE | 4/4 |
| FORCE RLS | 0 |
| Policy | 0 |
| GRANT a `PUBLIC` | 0 |
| GRANT a `anon` | 0 |
| GRANT a `authenticated` | 0 |
| SELECT/INSERT anon/auth | negati (regime deny-by-default con RLS e senza policy) |

Le policy applicative restano **fuori** dal ciclo M1 (competenza Identità & Accessi / fasi successive).

---

## 14. Test locali (sintesi)

| Area | Esito |
|---|---|
| Primo `db reset` | OK (dopo recovery Docker 500 iniziale) |
| Secondo `db reset` | OK — ripetibilità confermata |
| Exit code reset | 0 |
| Smoke trigger `updated_at` | Superato |
| PK duplicate | Rifiutato |
| Code blank | Rifiutato |
| Label blank | Rifiutato |
| Sort negativo | Rifiutato |
| Group code invalido (categories) | Rifiutato |
| Default / nullability | Conformi |
| Accesso anon / authenticated | Negato |
| Righe residue post-test | 0 |
| SQL invariati post-test | Sì |

---

## 15. Apply remoto

| Voce | Valore |
|---|---|
| Comando | `supabase db push --linked` |
| Data/ora | `2026-08-02T11:12:30+02` |
| Durata | ≈ 3 secondi |
| Exit code | **0** |
| Migration applicate | **4** (M1.1–M1.4) |
| Ultima migration | `20260803120000` |
| Local = remote post-apply | **Sì** |
| Delta post | **0** |
| Warning | Notice CLI di inizializzazione login role (non bloccante) |
| Errori | Nessuno |

---

## 16. Verifica remota (post-apply e riconferma al report)

* 4 tabelle presenti;
* seed 64/64;
* colonne conformi;
* 4 PK; 13 CHECK; 4 funzioni; 4 trigger;
* RLS 4/4; FORCE 0; policy 0; privilegi applicativi 0;
* oggetti extra nel perimetro `professional_%`: 0;
* commenti di tabella presenti (4/4);
* SQL e Git invariati rispetto a `b48b147…`;
* eventuali segnalazioni su oggetti di altri domini (es. Opportunità) trattate come **fuori perimetro** / non attribuibili a M1.

---

## 17. Stato Git (al momento della creazione del report)

| Controllo | Valore |
|---|---|
| Branch | `main` |
| HEAD | `b48b147a4ec49a980bc4d96c34b6f491234d1283` |
| `origin/main` | `b48b147a4ec49a980bc4d96c34b6f491234d1283` |
| Working tree pre-report | Pulito (nessun file modificato/non tracciato) |
| Commit successivo richiesto per l’apply | No (SQL già su remoto) |
| Modifiche SQL post-apply | Nessuna |
| File introdotto da questo report | `docs/architecture/migrations/professionisti-m1-validation-report.md` (untracked fino al commit dedicato) |

---

## 18. Rilievi e osservazioni

| Classe | Conteggio | Dettaglio |
|---|---:|---|
| Bloccanti | **0** | — |
| Maggiori | **0** | — |
| Minori | **0** | — |
| Informative | 5 | Vedi sotto |

Informative (non bloccanti per M1):

1. Errore Docker/HTTP 500 iniziale in fase di reset locale, risolto prima del doppio reset riuscito.
2. Assenza di `seed.sql` di progetto: i seed M1 sono **inline** nelle migration (conforme Plan/§29).
3. Notice CLI su inizializzazione login role durante `db push`.
4. Smoke remoto senza esporre timestamp di riga mutati in modo permanente.
5. Troncamenti/output CLI su migration storiche non-M1; errore storico noto `LegacyMigrationNewWriteError` per `supabase migration new` (file M1 creati manualmente con timestamp dopo `20260802220000`).

---

## 19. Checklist criteri di chiusura M1

- [x] Contratto DDL-ready §29 approvato
- [x] Migration Plan approvato (micro-review Plan)
- [x] M1.1 approvata
- [x] M1.2 approvata
- [x] M1.3 approvata
- [x] M1.4 approvata
- [x] Review congiunta di blocco approvata
- [x] Dry-run locale superato
- [x] Doppio reset locale superato
- [x] Smoke locale superato
- [x] Test negativi superati
- [x] Commit eseguito (`b48b147…`)
- [x] Push Git eseguito (`main` = `origin/main`)
- [x] Pre-apply remoto approvato
- [x] Apply remoto riuscito (exit 0)
- [x] Local = remote
- [x] Smoke / verifica remota superata
- [x] Seed e sicurezza conformi
- [x] Report di chiusura creato (questo documento)

**Adempimenti M1 aperti:** nessuno di natura tecnica/SQL. Resta soltanto il **commit documentale** di questo report (fuori da questa fase).

---

## 20. Decisione su M2.1

### 20.1 Condizioni Plan rilevanti

* Plan §12 / §24: stop point di blocco dopo M1.4 e **review congiunta M1** — già approvata.
* Plan §24: «Il blocco successivo non inizia finché la review del blocco corrente non è approvata» — condizione soddisfatta.
* Plan §26 punto 13: «Report di blocco (nota operativa)» — adempimento documentale finale della sequenza di blocco; **non** è prescritta una micro-review indipendente aggiuntiva del report come gate distinto (a differenza della micro-review del Plan §28 e delle micro-review SQL §23).
* Plan §28: stop point operativi successivi includono M2.1 **dopo** la chiusura del percorso M1.

### 20.2 Decisione

Tutte le condizioni di chiusura M1 risultano soddisfatte; rilievi bloccanti = 0; nessun adempimento tecnico M1 aperto.

**`BLOCCO M1 PROFESSIONISTI CHIUSO — M2.1 AUTORIZZATA`**

Autorizzazione limitata a:

* commit dedicato di questo report (consigliato prima o contestualmente all’avvio documentale di M2);
* creazione/review di **M2.1 — `create_professional_profiles`** secondo Plan §13.

Non autorizza M2.2+, né M8.2 di dominio, né policy/GRANT.

---

## 21. Review interne del report

### 21.1 Completezza — SUPERATA

Presenti: migrazioni; schema; seed; sicurezza; test; Git; remoto; checklist; decisione M2.1.

### 21.2 Coerenza — SUPERATA

Numeri coerenti: 4 migration; 4 tabelle; 64 seed; 13 CHECK; 4 funzioni; 4 trigger; local = remote; commit `b48b147…`; project ref `hvfvfatlaspcpszgizhg`.

### 21.3 Avversariale — SUPERATA

Controlli espliciti:

* nessuna chiusura dell’intero dominio Professionisti;
* nessuna anticipazione di M8.2;
* nessun oggetto futuro dichiarato implementato;
* M2.1 autorizzata solo dopo checklist completa e lettura del Plan (non per analogia);
* seed/policy/Git supportati da query e comandi eseguiti in questa fase;
* distinzione locale/remoto mantenuta (conteggi riconfermati su entrambi).

---

## 22. Esito formale

**Esito A — `BLOCCO M1 PROFESSIONISTI CHIUSO — M2.1 AUTORIZZATA`**

| Voce | Valore |
|---|---|
| Report di chiusura creato | Sì |
| Certifica locale e remoto | Sì |
| Criteri di chiusura M1 | Tutti soddisfatti |
| Rilievi bloccanti | 0 |
| M1 formalmente chiuso | **Sì** |
| Micro-review indipendente del report richiesta dal Plan | **No** |
| M2.1 autorizzata | **Sì** |
| Commit di questo report in questa fase | No (vietato dal brief) |
| Push in questa fase | No |
| Database modificato in questa fase | No |
| Stop point corrente | Chiusura M1 completata; avvio M2.1 consentito |
| Prossimo passo esatto | Commit dedicato di `professionisti-m1-validation-report.md`, quindi creazione di M2.1 `create_professional_profiles` secondo Plan §13 |
