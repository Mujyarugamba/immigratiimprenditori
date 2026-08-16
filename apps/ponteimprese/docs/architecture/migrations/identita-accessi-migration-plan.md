# Identità & Accessi — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica Logical né Physical.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/identita-accessi.md`.
**Contratto logico vincolante:** `docs/architecture/logical/identita-accessi.md`.

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi. Non reinterpretare il Physical.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Identità & Accessi** |
| Artefatto | Migration Plan ciclo 1 |
| Repository | `C:/Users/151702/Desktop/PROGETTI-WEB/immigrati-imprenditori` |
| Branch | `main` |
| HEAD di riferimento (pre-SQL) | `2bd4f5df5191a29379343414154d8b5151b4a728` |
| `origin/main` | Coincide con HEAD (ahead 0 / behind 0) |
| Ultima migration repository | `20260808120000` (Organizzazioni M3.1) |
| SQL Identità & Accessi | **Assenti** (da creare dopo approvazione Plan) |
| Stato | **Chiuso per creazione cumulativa M1–M2 (2 unità)** |

---

## 2. Scopo

Trasformare Logical e Physical Identità & Accessi in roadmap operativa DDL-ready del ciclo 1:

* blocchi M1–M8 (con M3–M7 assenti espliciti);
* **2 unità SQL** (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* modalità **accelerata cumulativa**;
* test statici/runtime, apply locale/remoto, Git, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. L’azione autorizzabile successiva è la **creazione contemporanea delle 2 migration**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/identita-accessi.md` | Contratto DDL-ready |
| 2 | `logical/identita-accessi.md` | Semantica ciclo 1 (§15.A–§15.C) |
| 3 | Migration Plan Organizzazioni / Contenuti / Appartenenze | Pattern operativi |
| 4 | Validation report domini chiusi | Criteri M8.2 |
| 5 | Migration SQL `profiles`, `business_memberships*`, pattern RLS | Dipendenze e pattern tecnici |
| 6 | `domain-dependency-map.md` §13, D46–D49 | Dipendenze di supporto |
| 7 | `domain-model.md` / reconciliation | Confini; Account ≠ Persona |

**Contraddizioni Logical ↔ Physical:** nessuna materiale. Plan creatibile senza nuove decisioni.

---

## 4. Stato iniziale verificato (pre-Plan)

| Verifica | Esito |
|---|---|
| Repository corretto | Sì |
| Branch `main` | Sì |
| HEAD = `origin/main` | Sì (`2bd4f5d…`) |
| Ahead / behind | 0 / 0 |
| Logical Identità modificato | Sì (`M`) — non toccato da questo Plan |
| Physical Identità untracked | Sì (`??`) — non toccato da questo Plan |
| Altri file modificati | Nessuno oltre Logical + Physical Identità |
| `supabase/.temp/pgdelta` | Assente |
| Ultimo timestamp migrations | `20260808120000` |
| Migration Identità esistenti | Nessuna |

**Questo Plan non modifica lo stato Git esistente** oltre alla creazione del proprio file.

---

## 5. Modalità accelerata

Workflow **unico** per le 2 unità SQL:

1. creazione contemporanea delle **2** migration SQL;
2. controlli rapidi unitari (statici);
3. review indipendente **unica** M1–M2;
4. apply locale cumulativo `supabase migration up --local`;
5. validazione integrata runtime con `BEGIN`/`ROLLBACK`;
6. commit e push **unico** (Logical + Physical + Plan + 2 SQL) — solo su richiesta esplicita successiva;
7. dry-run remoto **unico** `supabase db push --linked --dry-run` (esattamente 2 migration);
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
| Dipendenze strutturali | Schema `auth`; `public.profiles` |
| Dipendenze di derivazione (non SQL) | Appartenenze già pubblicate (`business_memberships*`) |
| Head migration | ≥ `20260808120000` |
| Nessuna collision timestamp `20260809*` | Verificata al Plan |
| Nessuna migration Identità | Verificata |
| Domini chiusi intatti | Nessuna modifica a Persone/Appartenenze/Org/altri |
| Nessun `.temp` estraneo | Ok (`pgdelta` assente) |
| Nessun trigger Identità su `auth.users` | Prescritto |
| Nessuna modifica a `profiles` | Prescritto |

---

## 7. Inventario Physical → unità

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `accounts` | Aggregate Root | **M1.1** |
| 2 | `account_role_assignments` | Entity owned (ruoli elevati) | **M2.1** |

**2/2 tabelle. Nessuna tabella extra.**

**Non in inventario ciclo 1:** cataloghi; Deleghe; Consensi; sessioni; dispositivi; token; MFA; OAuth; credenziali; Account–Impresa; Account–Organizzazione; Account di servizio.

---

## 8. Dipendenze

### 8.1 Strutturali (generano FK in SQL)

| Unità | Target | PK | Uso | ON DELETE (Physical) | Disponibilità |
|---|---|---|---|---|---|
| M1.1 | `auth.users` | uuid | `accounts.auth_user_id` NOT NULL UNIQUE | **CASCADE** | Schema Auth Supabase |
| M1.1 | `public.profiles` | uuid | `accounts.person_id` nullable UNIQUE | **SET NULL** | Migration `20260718103949` (+ estensioni) |
| M2.1 | `public.accounts` | uuid | `account_role_assignments.account_id` | **CASCADE** | M1.1 |

**Assenza di dipendenza strutturale** da `businesses`, `business_memberships`, `organizations`, Contenuti o altri AR di business.

### 8.2 Di derivazione (nessuna migration dedicata)

| Derivato | Fonte | Nota |
|---|---|---|
| Contesto personale | Account `active` + `person_id` + associazione non `contested` | Physical §11.1 |
| Contesti Impresa | `business_memberships` con `person_id` e `relation_status = 'active'` | Physical §11.2 |
| Facoltà gestionale scheda | Anche `business_membership_management_authorizations` (`granted`) | Physical §11.2 |
| Contesto Organizzazione | — | **Non operativo** ciclo 1 |
| Ruolo `account_registrato` | Account con `account_status <> 'closed'` | **Derivato**; non persistito |

Queste dipendenze **non** generano unità SQL nel ciclo 1.

### 8.3 Vietate (strutturali)

FK a Imprese/Appartenenze/Organizzazioni/Contenuti per contesto; tabelle Account–Impresa / Account–Organizzazione; trigger su `auth.users`; modifica `profiles` / `handle_new_user`; duplicazione credenziali Auth; cataloghi ruoli/stati; policy RLS applicative nel blocco strutturale.

### 8.4 Assenza cicli

`auth.users` + `profiles` → `accounts` → `account_role_assignments`. **Aciclico.**

---

## 9. Verifica della separazione delle unità

| Criterio | Esito |
|---|---|
| `accounts` creato prima dei ruoli | Sì (M1.1 → M2.1) |
| Una tabella = una migration | Sì |
| Dipendenze circolari | Nessuna |
| M2.1 incorporabile in M1.1? | **No** — responsabilità autonoma (assegnazione/revoca ruoli elevati; lifecycle assegnazione distinto dall’AR) |
| Cataloghi preliminari | **Non necessari** |
| Ruoli via CHECK chiuso | Sì (`redattore`, `amministratore_applicativo`) |
| `account_registrato` persistito | **No** — resta derivato |

---

## 10. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL |
|---|---|---|---|
| **M1** | Presente | Aggregate Root Account | M1.1 |
| **M2** | Presente | Assegnazioni ruoli elevati | M2.1 |
| **M3** | **Assente** | — | 0 |
| **M4** | **Assente** | — | 0 |
| **M5** | **Assente** | — | 0 |
| **M6** | **Assente** | — | 0 |
| **M7** | **Assente** | — | 0 |
| **M8** | Presente (non SQL) | M8.1 SKIP; M8.2 report | 0 SQL |

**Ordine globale:**
M1.1 → M2.1 → (M8.1 SKIP) → M8.2.

---

## 11. Matrice blocchi / unità / timestamp

| Codice | Blocco | Tabella | Timestamp | File futuro |
|---|---|---|---|---|
| M1.1 | M1 | `accounts` | `20260809090000` | `20260809090000_create_accounts.sql` |
| M2.1 | M2 | `account_role_assignments` | `20260809100000` | `20260809100000_create_account_role_assignments.sql` |
| M8.1 | M8 | — | — | **SKIP** |
| M8.2 | M8 | — | — | `docs/architecture/migrations/identita-accessi-m8.2-validation-report.md` |

### 11.1 Verifica timestamp

| Verifica | Esito |
|---|---|
| Successivi a `20260808120000` | Sì |
| Univoci nel repository | Sì (nessun file `20260809*` esistente) |
| Crescenti | Sì (`09090000` → `09100000`) |
| Coerenti con ordine M1.1 → M2.1 | Sì |
| Pattern nome | `{timestamp}_create_{table}.sql` |

**2 timestamp univoci.** Nessun file SQL creato da questo documento.

---

## 12. Contratti unitari

### M1.1 — Create accounts

| Voce | Prescrizione |
|---|---|
| Codice | **M1.1** |
| Titolo | Create accounts |
| Responsabilità | Creare `public.accounts`; AR Account; FK `auth.users`; FK opzionale `profiles`; lifecycle; gate temporali; UNIQUE Auth/Persona; Account limitato senza Persona; RLS/REVOKE/trigger; nessun dato Auth duplicato |
| Tabella | `public.accounts` |
| Dipendenze strutturali | `auth.users`; `public.profiles` |
| Dipendenze interne Identità | Nessuna |
| Prerequisiti | Schema Auth; `profiles` esistente; pattern `updated_at` consolidato |
| Ordine | 1 |
| Motivazione separazione | Unica AR del dominio; prerequisito di M2.1; responsabilità di accesso distinta dai ruoli elevati |
| Timestamp / file | `20260809090000` / `20260809090000_create_accounts.sql` |
| Contratto DDL | Physical §8–§9, §14–§16, §18–§20: colonne AR; CHECK status/associazione/gate; UNIQUE `auth_user_id` e `person_id`; FK CASCADE Auth / SET NULL Persona; indice `(account_status)`; `set_accounts_updated_at`; **`accounts_clear_person_association`** (BEFORE UPDATE: clear companion + demote `active`→`limited`); RLS 0 policy; REVOKE; COMMENT; seed 0 |
| Vietati in unità | Trigger su `auth.users`; insert/update in `profiles`; colonne email/password/provider/token; FK Imprese/Appartenenze/Org; policy applicative; seed |
| Stop | Dopo file; review cumulativa con M2.1 |

### M2.1 — Create account role assignments

| Voce | Prescrizione |
|---|---|
| Codice | **M2.1** |
| Titolo | Create account role assignments |
| Responsabilità | Creare `public.account_role_assignments`; collegare incarichi all’Account; supportare solo `redattore` e `amministratore_applicativo`; assegnazione/validità/revoca/stato; impedire duplicazioni incoerenti; RLS/REVOKE/trigger; nessuna ownership sui domini applicativi |
| Tabella | `public.account_role_assignments` |
| Dipendenze strutturali | **Esclusiva** da M1.1 (`accounts`) |
| FK vietate | Contenuti, Imprese, Organizzazioni, Appartenenze, Persone, Auth |
| Prerequisiti | M1.1 applicata (o presente nello stesso ciclo cumulativo in ordine) |
| Ordine | 2 |
| Motivazione separazione | Entity owned con lifecycle di assegnazione proprio; non comprimibile nell’AR senza perdere revoca/stato per ruolo; CHECK ruoli elevati distinto da lifecycle Account |
| Timestamp / file | `20260809100000` / `20260809100000_create_account_role_assignments.sql` |
| Contratto DDL | Physical §10, §18–§20: colonne; CHECK `role_code` / `assignment_status` / gate `revoked_at`; UNIQUE `(account_id, role_code)`; FK CASCADE; indice `(role_code)`; `set_account_role_assignments_updated_at`; RLS 0 policy; REVOKE; COMMENT; seed 0 |
| Ruoli ammessi | Solo `redattore`, `amministratore_applicativo` |
| Ruolo escluso da persistenza | `account_registrato` (derivato) |
| Vietati in unità | `moderatore`, `servizio_tecnico`, `account_registrato` come `role_code`; catalogo ruoli; seed ruoli/utenti |
| Stop | Chiusura SQL 2/2 |

---

## 13. M3–M7 — Assenti

| Blocco | Decisione |
|---|---|
| M3 | **Assente** — nessuna Deleghe / Consensi / sessioni |
| M4 | **Assente** — nessun Account–Impresa / Account–Organizzazione |
| M5 | **Assente** — nessuna membership / sync Auth / cutover `profiles` |
| M6 | **Assente** — nessun MFA / token / dispositivi / audit infra |
| M7 | **Assente** — COMMENT/RLS/REVOKE sono responsabilità di ogni unità M1–M2; nessuna policy applicativa |

Nessuna migration comment-only. Nessun SQL M3–M8.

---

## 14. M8 — Chiusura

### M8.1 — Seed dimostrativi

**SKIP.**

Nessun seed per:

* Account;
* ruoli;
* utenti tecnici Auth;
* Persona.

### M8.2 — Validazione finale (non SQL)

File futuro: `docs/architecture/migrations/identita-accessi-m8.2-validation-report.md`

**Momento:** post-remoto (dopo dry-run positivo e apply remoto).

Deve verificare almeno: 2 migration; 2 tabelle; head `20260809100000`; drift 0; RLS 2/2 pattern; policy 0; privilegi; COMMENT; hash file; assenza FK business/Org; assenza trigger Auth; legacy `profiles`/`handle_new_user` intatti; domini chiusi intatti; chiusura ciclo 1 `ACCETTATA`.

---

## 15. Pattern comune per ogni unità SQL

Per ciascuna delle 2 migration:

* una sola `CREATE TABLE` in `public`;
* PK/FK/UNIQUE/CHECK/indici come Physical;
* funzione `set_*_updated_at` `SECURITY INVOKER`, `search_path = ''`;
* trigger BEFORE UPDATE FOR EACH ROW;
* `ENABLE ROW LEVEL SECURITY`; FORCE false; **0 policy**;
* `REVOKE ALL` da PUBLIC, anon, authenticated;
* **0 GRANT** applicativi;
* COMMENT ON TABLE + colonne chiave + FUNCTION;
* vietati: `IF NOT EXISTS`, `DO`, SQL dinamico, `ON CONFLICT`, JSONB modellante, ENUM PG, trigger su `auth.users`, modifica `profiles`.

Funzioni attese: `set_accounts_updated_at`; `accounts_clear_person_association`; `set_account_role_assignments_updated_at` (≤63 byte).  
Trigger: `accounts_set_updated_at`; `accounts_clear_person_association`; `account_role_assignments_set_updated_at`.

---

## 16. RLS e privilegi

Prescritti per entrambe le tabelle:

| Voce | Prescrizione |
|---|---|
| RLS | `ENABLE ROW LEVEL SECURITY` |
| FORCE RLS | false |
| Policy nel blocco strutturale | **0** |
| REVOKE | ALL da `PUBLIC`, `anon`, `authenticated` |
| GRANT applicativi | **0** |
| Policy future | Unità separate, **fuori** da questo blocco ciclo 1 |

Nessuna migration dedicata alle policy nel ciclo 1.

---

## 17. Validazione prevista (non eseguita da questo Plan)

### 17.1 Validazione statica

Conformità Logical / Physical / Plan; colonne; PK; FK; CHECK; UNIQUE; indici; lifecycle; ruoli; RLS; privilegi; trigger; confini esclusi; timestamp; identificatori ≤63; assenza SQL vietato; integrità migration precedenti.

### 17.2 Apply locale

Applicazione sequenziale **M1.1 → M2.1** tramite `supabase migration up --local` (cumulativo). Vietati reset/repair/SQL manuale fuori migration.

### 17.3 Test runtime con ROLLBACK

Prevedere almeno:

1. creazione Account con Auth valido;
2. unicità `auth_user_id`;
3. unicità `person_id`;
4. Account senza Persona solo negli stati ammessi (`registered` / `limited` / non operativi);
5. rifiuto `active` senza Persona;
6. lifecycle e gate temporali (`suspended_at`, `disabled_at`, `closed_at`, `activated_at`);
7. cancellazione Auth → CASCADE su Account (+ role assignments);
8. cancellazione Persona → `person_id` SET NULL; companion azzerati; se era `active` → `limited` (trigger §20.2);
9. ruolo `redattore` valido;
10. ruolo `amministratore_applicativo` valido;
11. ruolo invalido (`moderatore`, `account_registrato`, altro) rifiutato;
12. duplicazione stesso `(account_id, role_code)` rifiutata;
13. revoca con `revoked_at` e `assignment_status = 'revoked'`;
14. Account `suspended` / `closed` non produce contesti operativi (asserzione documentale/derivata);
15. trigger `updated_at`;
16. RLS deny anon/authenticated sulle 2 tabelle;
17. privilegi senza GRANT applicativi;
18. ROLLBACK e pulizia (zero residui fixture).

### 17.4 Dry-run remoto

Esattamente **due** migration in coda. Comando: `supabase db push --linked --dry-run`.

### 17.5 Apply remoto

Solo dopo dry-run positivo: `supabase db push --linked`.  
Vietati: `--include-all`, `--include-seed`, `--db-url`, repair, reset.

### 17.6 M8.2

Report post-remoto (§14).

---

## 18. Confini e oggetti vietati (nessuna migration)

Il blocco ciclo 1 **non** creerà migration per:

Deleghe; Consensi; sessioni; dispositivi; token; MFA; OAuth; password; Account di servizio; moderatore; multi-Account; Account–Impresa; Account–Organizzazione; membership; policy applicative; sincronizzazioni Auth; trigger Auth; audit infrastrutturale; Privacy completa; notifiche; workflow; cataloghi ruoli/stati; seed dimostrativi; modifiche a `profiles` / Appartenenze / Organizzazioni / altri domini.

---

## 19. Ordine globale

| Unità | Titolo | Tabella | Responsabilità | Dipendenze | Ordine |
|---|---|---|---|---|---|
| **M1.1** | Create accounts | `accounts` | AR Account; Auth; Persona opzionale; lifecycle | `auth.users`, `profiles` | 1 |
| **M2.1** | Create account role assignments | `account_role_assignments` | Ruoli elevati; assegnazione/revoca | M1.1 | 2 |
| **M8.1** | Seed dimostrativi | — | — | — | **SKIP** |
| **M8.2** | Validation report | — | Chiusura documentale | M1.1–M2.1 remote | post-remoto |

**Ordine atteso:** `M1.1 → M2.1`.

**Perché aciclico e completo.** L’AR non dipende dai ruoli; i ruoli dipendono solo dall’AR; non esistono cataloghi preliminari; le derivazioni Appartenenze/Org non introducono SQL; M3–M7 assenti per esclusione di perimetro; due tabelle Physical → due migration → perimetro ciclo 1 chiuso.

---

## 20. Prontezza SQL

Per ogni unità sono già determinati:

| Voce | M1.1 | M2.1 |
|---|---|---|
| Tabella | Sì | Sì |
| Responsabilità | Sì | Sì |
| Dipendenze | Sì | Sì |
| Ordine | 1 | 2 |
| Confini | Sì | Sì |
| Pattern tecnici (RLS, REVOKE, trigger) | Sì | Sì |
| Validazione prevista | Sì | Sì |
| Timestamp / nome file | Sì | Sì |

**Nessun SQL, frammento DDL o implementazione speculativa in questo documento.**

---

## 21. Tabella riepilogativa

| Migration | Responsabilità | Tabelle | Dipendenze | Ordine |
|---|---|---|---|---|
| **M1.1** | Aggregate Root Account | `accounts` | `auth.users`, `profiles` | 1 |
| **M2.1** | Ruoli elevati owned | `account_role_assignments` | M1.1 | 2 |
| **M8.1** | Seed dimostrativi | — | — | SKIP |
| **M8.2** | Validation report | — | M1–M2 applicate | post-remoto |

**Totale unità SQL: 2.**

---

## 22. Criteri di chiusura Plan

* 2/2 tabelle → 2 unità  
* Una tabella = una migration  
* Timestamp univoci > `20260808120000`  
* Dipendenze acicliche  
* M3–M7 assenti  
* M8.1 SKIP; M8.2 path definito  
* `account_registrato` derivato  
* Coesistenza legacy `profiles`/Auth senza assorbimento  
* Coerenza integrale con Physical  
* Sufficiente per creare tutte le migration in un unico ciclo  

---

## 23. Stato roadmap

| Fase | Stato |
|---|---|
| Logical | Presente (working tree, `M`) |
| Physical | Presente (working tree, `??`) |
| Migration Plan | **Questo documento** |
| SQL M1–M2 (2 file) | Da creare in ciclo cumulativo |
| M8.2 | Da produrre a fine ciclo post-remoto |

---

## 24. Osservazioni non bloccanti

1. Legacy `profiles.id → auth.users` e `handle_new_user` restano intatti; il SQL Identità **coesiste** senza cutover Persone.
2. Provisioning riga `accounts` post-signup è applicativo / service_role (Physical §14); non è unità di questo blocco.
3. Policy RLS applicative (es. lettura del proprio Account) sono **future** e separate.
4. Test runtime che richiedono utente Auth useranno fixture Auth locali in transazione con ROLLBACK; dettaglio operativo nel ciclo SQL, non qui.

---

## 25. Stato finale

**Migration Plan Identità & Accessi completo e approvabile.**  
2 unità SQL determinate; AR unico `accounts`; ruoli elevati in M2.1; M3–M7 assenti; M8 non SQL.  
**Prossima azione autorizzabile:** creazione contemporanea delle 2 migration SQL secondo questo Plan.  
Nessun file `.sql` creato da questo documento.

---

## Checklist conclusiva

- [x] 2/2 tabelle → 2 unità
- [x] Timestamp univoci > `20260808120000` (`20260809090000`, `20260809100000`)
- [x] AR unico (`accounts`)
- [x] `account_registrato` derivato; ruoli elevati via CHECK
- [x] M3–M7 assenti
- [x] M8.1 SKIP; M8.2 path definito
- [x] Dipendenze acicliche
- [x] Nessuna Deleghe / Consensi / sessioni / Org context / Account–Impresa
- [x] Nessun trigger Auth; nessuna modifica `profiles`
- [x] Modalità accelerata cumulativa
- [x] Sufficiente per creare tutte le migration in un unico ciclo
