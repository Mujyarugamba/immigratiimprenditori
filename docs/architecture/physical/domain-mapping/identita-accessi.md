# Physical Domain Mapping — Dominio IDENTITÀ & ACCESSI

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/identita-accessi.md` (ciclo 1 chiuso: §15.A–§15.C).
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository (Organizzazioni, Appartenenze, Contenuti).
> **Non** crea Migration Plan, **non** crea migration SQL, **non** esegue apply, **non** modifica lo schema né altri domini.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine).
> Autenticazione tecnica (OAuth, password, JWT, MFA, provider, sessioni Auth) resta **fuori ownership**; è ammesso solo il collegamento opaco a `auth.users`.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Identità & Accessi** |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/identita-accessi.md` (revisionato e approvato) |
| Stato | **Chiuso per Migration Plan** (salvo §29) |
| Ciclo | Ciclo 1 |
| Migration Plan / SQL | **Fuori da questo documento** |

---

## 2. Scopo e responsabilità del dominio

Tradurre l’Aggregate Root **Account** e i soli fatti applicativi del ciclo 1 (associazione opzionale Account–Persona, identità digitale minimale via collegamento Auth, ruoli applicativi minimi, lifecycle Account, principi di contesto e deny-by-default) in un modello relazionale `public`, **senza** possedere Persone, Imprese, Organizzazioni, membership, Deleghe, Consensi, sessioni applicative, credenziali o policy dei singoli domini.

### 2.1 Confini esatti

| Incluso ciclo 1 | Escluso |
|---|---|
| Account (AR) | Contesto Organizzazione operativo |
| Collegamento opzionale Account–Persona (`profiles`) | Deleghe owned |
| Identità digitale minimale (link opaco a Auth) | Consensi owned |
| Ruoli: `account_registrato` (derivato), `redattore`, `amministratore_applicativo` | Sessioni / dispositivi / token / MFA / OAuth / password |
| Lifecycle Account (sottoinsieme operativo) | Account di servizio tipizzati; multi-Account per Persona |
| Contesto personale; Contesto Impresa **derivato** | Tabella Account–Impresa; Account–Organizzazione |
| Contesto redazionale/amministrativo via ruoli | Moderatore; audit infrastrutturale; workflow autorizzativi |
| Deny-by-default (RLS ENABLE, 0 policy, REVOKE) | Duplicazione email/provider/credenziali Auth |

### 2.2 Responsabilità incluse

- Identità stabile dell’Account applicativo.
- Collegamento 1:1 obbligatorio all’utente tecnico Auth (`auth.users`), senza ownership delle credenziali.
- Associazione 0..1 esplicita alla Persona (`profiles`).
- Assegnazione/revoca dei ruoli applicativi elevati del ciclo 1.
- Stato operativo dell’Account e date di lifecycle minime.
- Fatti utilizzabili da future policy (non le policy dei domini).

### 2.3 Responsabilità escluse

Persona anagrafica; Impresa; Organizzazione; membership; ruoli professionali/organizzativi; Deleghe; Consensi; sessioni persistite; dispositivi; token; credenziali; CRM; HR; documenti; media; Storage; FEV; notifiche; billing; workflow; audit infra; contenuti; moderazione come processo; policy VIS/RLS specifiche degli altri domini; creazione automatica di Persona o membership.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/identita-accessi.md` (§15.A–§15.C) | **Autorità semantica** ciclo 1 |
| `domain-model.md`; `reconciliation-report.md` | Confini; Account ≠ Persona |
| `domain-dependency-map.md` §13, D46–D49 | Dipendenze di supporto |
| Physical Persone / Imprese / Appartenenze / Organizzazioni | Pattern FK, RLS, lifecycle; **non** ownership |
| Migration `profiles`, `business_memberships*`, pattern RLS recenti | Dipendenze strutturali e di derivazione reali |
| `auth.users` (Supabase) | Soggetto tecnico esterno; non AR applicativo |

---

## 4. Principi di mapping

1. Unico AR fisico `accounts`; ruoli elevati in tabella owned; nessuna tabella per Deleghe/Consensi/sessioni/Org.
2. **Account ≠ `auth.users` ≠ Persona (`profiles`)**: tre identità distinte; solo riferimenti opachi.
3. Identità digitale minimale = **incorporata** nell’AR tramite `auth_user_id` + metadati applicativi minimi; **nessuna** tabella metodi/credenziali.
4. Contesto Impresa = **derivato** da Appartenenze; **nessuna** tabella Account–Impresa.
5. Contesto Organizzazione = **non modellato** (zero tabelle, zero FK a `organizations` / `organization_officials` per contesto).
6. `account_registrato` = ruolo **derivato** (non riga obbligatoria); `redattore` / `amministratore_applicativo` = assegnazioni persistite.
7. CHECK per vocabolari piccoli e stabili; **nessun** catalogo C03 per ruoli/stati ciclo 1.
8. Nessun JSONB modellante; nessun ENUM PostgreSQL.
9. RLS ENABLE, FORCE false, **0 policy**, REVOKE ALL da PUBLIC/anon/authenticated; nessun GRANT applicativo.
10. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE; su `accounts` anche trigger di normalizzazione unlink Persona (§20.2).
11. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico.
12. Nessun trigger su `auth.users` di proprietà Identità; nessun trigger che crei/modifichi Persona, membership o diritti su altri domini.
13. Nessun booleano derivato persistito (`can_manage_business`, `can_edit_content`, `is_organization_admin`, `has_access`).
14. Legacy `profiles.id → auth.users` e `handle_new_user` restano **fuori scope** di questo dominio (non modificati qui).

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `accounts` | Aggregate Root | Dominio Identità & Accessi |
| 2 | `account_role_assignments` | Entity owned (ruoli elevati) | `accounts` |

**Totale ciclo 1: 2 tabelle.**

**Non create:** `account_delegations`; `account_consents`; `account_sessions`; `account_devices`; `account_auth_methods`; `account_businesses`; `account_organizations`; cataloghi `application_roles` / `account_statuses`; tabelle MFA/token; Account di servizio.

---

## 6. Dipendenze esterne (ciclo 1)

### 6.1 Strutturali (FK)

| Target | Origine tipica | PK | Uso Identità & Accessi | ON DELETE |
|---|---|---|---|---|
| `auth.users` | Schema Auth Supabase | `id` uuid | Collegamento obbligatorio Account ↔ utente tecnico | **CASCADE** (Account non sopravvive senza utente Auth) |
| `public.profiles` | `20260718103949_create_profiles_table.sql` (+ estensioni Persone) | `id` uuid | Associazione opzionale Account–Persona | **SET NULL** (Account resta; normalizzazione lifecycle/associazione via trigger §20) |

### 6.2 Di derivazione (lettura, nessuna FK Identità)

| Target | Uso |
|---|---|
| `public.business_memberships` | Contesto Impresa: membership con `person_id` = Persona dell’Account e `relation_status = 'active'` |
| `public.business_membership_management_authorizations` | Condizione aggiuntiva per facoltà gestionale scheda (`authorization_status = 'granted'`), quando richiesta dalla policy del dominio Impresa/Appartenenze |
| `public.businesses` | Solo come destinazione del contesto già risolto via membership; **nessuna** FK da `accounts` |

### 6.3 Future (non strutturali ciclo 1)

| Target | Nota |
|---|---|
| Membership Persona–Organizzazione / Impresa–Organizzazione | Appartenenze future; attivano Contesto Organizzazione |
| `organizations` / `organization_officials` | **Non** fonte di contesto Operativo; ufficiali ≠ membership ≠ Contesto Org |
| Deleghe / Consensi owned | Post ciclo 1 |
| Decoupling `profiles` da `auth.users` | Lavoro Persone/infra; non Migration Identità ciclo 1 |

---

## 7. Distinzione formale delle tre identità

| Concetto | Dove vive | Ruolo |
|---|---|---|
| **Utente Auth** | `auth.users` | Soggetto tecnico di autenticazione (credenziali, email tecnica, provider, sessioni Auth). **Non** è Aggregate Root applicativo. |
| **Account** | `public.accounts` | Aggregate Root di Identità & Accessi: costrutto di accesso, ruoli applicativi, lifecycle, associazione a Persona. |
| **Persona** | `public.profiles` | Aggregate Root di Persone: anagrafica/profilo pubblico. Può esistere senza Account (principio logico; vincoli legacy su `profiles` restano di Persone). |

**Vietato nel ciclo 1:** usare `auth.users` come AR; duplicare email/password/provider/token/MFA; trattare `profiles` come Account; inferire Persona da Auth senza `accounts.person_id`.

---

## 8. Aggregate Root — `accounts`

**Responsabilità.** Punto unico di consistenza dell’accesso applicativo: collegamento Auth, associazione Persona, stato Account, metadati minimi di identità digitale applicativa.

**Identità.** `id uuid PK DEFAULT gen_random_uuid()` — **distinta** da `auth.users.id` e da `profiles.id`.

**Motivazione.** Il Logical impone Account ≠ Persona e Account ≠ autenticazione tecnica; una PK coincidente con Auth o con Persona ricomprimerebbe le tre identità. Il lookup operativo usa `auth_user_id` (UNIQUE) e, quando presente, `person_id` (UNIQUE).

### 8.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK Account |
| 2 | `auth_user_id` | `uuid` | NO | — | FK `auth.users(id)`; UNIQUE; identità digitale minimale |
| 3 | `person_id` | `uuid` | SÌ | — | FK `profiles(id)`; UNIQUE; 0..1 Persona |
| 4 | `person_association_status` | `text` | SÌ | — | Solo se `person_id` NOT NULL |
| 5 | `person_linked_at` | `timestamptz` | SÌ | — | Momento associazione |
| 6 | `account_status` | `text` | NO | `'registered'` | Lifecycle operativo ciclo 1 |
| 7 | `activated_at` | `timestamptz` | SÌ | — | Prima attivazione operativa |
| 8 | `suspended_at` | `timestamptz` | SÌ | — | Gate sospensione |
| 9 | `disabled_at` | `timestamptz` | SÌ | — | Gate disattivazione volontaria |
| 10 | `closed_at` | `timestamptz` | SÌ | — | Gate chiusura definitiva |
| 11 | `status_reason` | `text` | SÌ | — | Nota opaca non blank se valorizzata |
| 12 | `created_at` | `timestamptz` | NO | `now()` | |
| 13 | `updated_at` | `timestamptz` | NO | `now()` | |

**Identità digitale minimale — decisione.** Incorporata nell’AR: `auth_user_id` è l’identificatore esterno opaco; non si creano tabelle metodi/sessioni; non si copiano email/provider da Auth. Nessuna colonna `email`, `password`, `provider`, `refresh_token`.

### 8.2 Vincoli AR

**PK:** `accounts_pkey (id)`.

**FK:**

| Colonna | Target | ON UPDATE | ON DELETE |
|---|---|---|---|
| `auth_user_id` | `auth.users(id)` | NO ACTION | **CASCADE** |
| `person_id` | `profiles(id)` | NO ACTION | **SET NULL** |

**UNIQUE:**

| Nome | Colonne | Significato |
|---|---|---|
| `accounts_auth_user_id_key` | `(auth_user_id)` | Un Account ordinario per utente Auth (ciclo 1) |
| `accounts_person_id_key` | `(person_id)` | Al più un Account ordinario per Persona (ciclo 1); NULL ammessi multipli in SQL solo come assenza di associazione |

Nota: in PostgreSQL UNIQUE consente più `NULL` su `person_id` — corretto (Account senza Persona). L’invariante «Persona 0..1 Account» è garantita quando `person_id` è valorizzato.

**CHECK `account_status`:**

```
account_status IN (
  'registered',
  'active',
  'limited',
  'suspended',
  'disabled',
  'closed'
)
```

**CHECK associazione Persona:**

```
(
  person_id IS NULL
  AND person_association_status IS NULL
  AND person_linked_at IS NULL
)
OR
(
  person_id IS NOT NULL
  AND person_association_status IN ('declared', 'verified', 'contested')
  AND person_linked_at IS NOT NULL
)
```

**CHECK contesto personale pieno / Account limitato:**

```
(account_status <> 'active') OR (person_id IS NOT NULL)
```

Un Account `active` **richiede** Persona associata. Account senza Persona restano in `registered` o `limited` (o stati non operativi).

**CHECK gate temporali:**

1. `suspended` ⇒ `suspended_at IS NOT NULL`
2. `disabled` ⇒ `disabled_at IS NOT NULL`
3. `closed` ⇒ `closed_at IS NOT NULL`
4. `active` ⇒ `activated_at IS NOT NULL`
5. `status_reason` NULL oppure `length(btrim(status_reason)) > 0`

**Invarianti applicative (non DDL cross-table):**

- Chiusura Account **non** cancella `profiles`.
- Eliminazione/disattivazione Auth **non** è equivalente a chiusura Account applicativa se l’utente Auth esiste ancora: sono assi distinti; se l’utente Auth è eliminato, CASCADE rimuove l’Account.
- `person_id` **non** deve essere forzato uguale a `auth_user_id` (anche se il legacy attuale spesso li fa coincidere).

### 8.3 Mapping stati Logical → Physical (ciclo 1)

| Logical (§11, sottoinsieme §15.A) | `account_status` | Note |
|---|---|---|
| Registrato / In attesa di verifica | `registered` | Default creazione |
| Limitato (senza Persona o capacità ridotta) | `limited` | Contesti operativi pieni assenti |
| Attivo | `active` | Richiede `person_id` |
| Sospeso / Bloccato (minimo) | `suspended` | Nessun contesto operativo |
| Disattivato | `disabled` | Scelta soggetto; riattivabile |
| Chiuso / Archiviato (minimo) | `closed` | Terminale ciclo 1 |
| In recupero, Contestato, Compromesso, Riattivato, Invito, … | **non distinti** come valori propri | Restano Logical generali; ciclo 1 non li materializza |

---

## 9. Relazione Account–Persona

| Regola | Forma fisica |
|---|---|
| Persona `0..1` Account ordinario | `UNIQUE (person_id)` su valori non null |
| Account `0..1` Persona | `person_id` nullable; al più una FK |
| Unicità relazione | Unica colonna sull’AR; nessuna tabella di associazione dedicata |
| Persona assente | `person_id` NULL; `account_status ∈ {registered, limited, …}`; **nessuna** Persona implicita |
| Contesto personale | Richiede `person_id` NOT NULL, associazione non `contested`, Account `active` |
| Cancellazione Persona | `ON DELETE SET NULL`; Account sopravvive. La coerenza DDL è garantita dal trigger `accounts_clear_person_association` (§20): azzera `person_association_status` e `person_linked_at`; se `account_status = 'active'`, demote a `limited`. Non elimina l’Account. |
| Disattivazione Persona (`profiles.is_active` o assi Persone) | **Non** alterata da Identità; può far fallire policy/derivazioni senza cambiare `person_id` |
| Multi-Account | **Escluso** ciclo 1 (UNIQUE) |
| Creazione automatica Persona | **Vietata** a Identità (nessun trigger su `profiles` / Auth) |

**Dipendenza da `profiles`.** FK strutturale; ownership anagrafica resta di Persone. Identità non scrive attributi di Persona.

---

## 10. Ruoli applicativi — `account_role_assignments`

### 10.1 Modello scelto

| Opzione | Esito |
|---|---|
| Colonna singola sull’AR | **Scartata** — Logical ammette più ruoli per Account |
| Catalogo C03 | **Scartato** — tre valori stabili, senza metadati/lifecycle di catalogo |
| Relazione M:N con catalogo | **Scartata** — sovra-modellazione ciclo 1 |
| Tabella owned + CHECK `role_code` | **Adottata** per ruoli elevati |

### 10.2 Ruoli ciclo 1

| Ruolo | Persistenza | Significato | Ambito | Abilita (concettuale) | Non prova |
|---|---|---|---|---|---|
| `account_registrato` | **Derivato** | Account autenticabile non chiuso | Piattaforma | Azioni che richiedono autenticazione di base secondo le policy | Persona, Appartenenza, Org, titolarità |
| `redattore` | **Riga** in `account_role_assignments` | Funzione redazionale | Contesto redazionale | Operazioni editoriali ammesse da Politiche/domini Contenuti | Ownership contenuti; Org; membership |
| `amministratore_applicativo` | **Riga** | Amministrazione funzionale piattaforma | Contesto di sistema | Configurazione/accesso admin dichiarato dalle Politiche | Sovranità sui fatti di business |

**Derivazione `account_registrato`:** vero sse esiste riga `accounts` con `account_status <> 'closed'`. Non si inserisce riga dedicata.

**Esclusi:** `moderatore`, `servizio_tecnico`, ruoli business (fondatore, legale rappresentante, ecc.).

### 10.3 Colonne

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `account_id` | `uuid` | NO | — | FK `accounts(id)` |
| 3 | `role_code` | `text` | NO | — | Solo ruoli elevati |
| 4 | `assignment_status` | `text` | NO | `'active'` | active \| revoked |
| 5 | `assigned_at` | `timestamptz` | NO | `now()` | |
| 6 | `revoked_at` | `timestamptz` | SÌ | — | Gate revoca |
| 7 | `created_at` | `timestamptz` | NO | `now()` | |
| 8 | `updated_at` | `timestamptz` | NO | `now()` | |

### 10.4 Vincoli

**FK:** `account_id` → `accounts(id)` ON DELETE **CASCADE**.

**CHECK:**

```
role_code IN ('redattore', 'amministratore_applicativo')
```

```
assignment_status IN ('active', 'revoked')
```

```
(
  assignment_status = 'active' AND revoked_at IS NULL
)
OR
(
  assignment_status = 'revoked' AND revoked_at IS NOT NULL
)
```

**UNIQUE:** `account_role_assignments_account_role_key (account_id, role_code)` — una riga per ruolo elevato per Account; riattivazione = ritorno a `active` (non seconda riga).

**Invarianti:** ruolo ≠ appartenenza ≠ titolarità ≠ qualifica professionale ≠ policy RLS; assegnazione/revoca non mutano `business_memberships` né `profiles`.

---

## 11. Contesti di azione (ciclo 1)

I contesti **non** sono tabelle. Sono **derivazioni** valutate a runtime (policy/applicativo) a partire da Account + fatti esterni.

### 11.1 Contesto personale

**Attivo** solo se **tutte** le condizioni:

1. Esiste Account con `auth_user_id = auth.uid()` (o equivalente di sessione Auth);
2. `account_status = 'active'`;
3. `person_id IS NOT NULL`;
4. `person_association_status IN ('declared', 'verified')` (non `contested`);
5. Nessuna sospensione/chiusura Account.

**Se Persona assente:** nessun contesto personale; Account al più `registered`/`limited`; deny-by-default sulle azioni che lo richiedono.

**Non persistire** flag `personal_context_active`.

### 11.2 Contesto Impresa

**Fonte autoritativa:** Appartenenze — `business_memberships` (+ eventuale `business_membership_management_authorizations` per gestione scheda).

**Risoluzione:**

1. Risolvere Persona: `accounts.person_id`;
2. Se NULL → nessun contesto Impresa;
3. Se Account non `active` → nessun contesto Impresa;
4. Contesti Impresa disponibili = insieme di `business_id` tali che esiste membership con:
   - `person_id = accounts.person_id`
   - `relation_status = 'active'`
   - (policy ulteriori dei domini possono richiedere `editorial_status`, verifica, visibilità — **non** duplicate qui);
5. Facoltà gestionale scheda: membership di cui sopra **e** riga authorization con `authorization_status = 'granted'`.

**Vietato:** tabella Account–Impresa; copiare membership in Identità; autorizzare Impresa solo tramite ruolo applicativo.

**Non persistire** `can_manage_business` / cache membership (rinviate).

### 11.3 Contesto Organizzazione

| Prescrizione ciclo 1 | |
|---|---|
| Operativo | **No** |
| Membership Org utilizzabile | **Assente** |
| Relazioni Account–Organizzazione | **Non create** |
| Simulazione via Impresa | **Vietata** |
| Derivazione da `organization_officials` | **Vietata** (ufficiale ≠ Contesto Org) |
| Attivazione futura | Solo dopo fatto sostanziale in Appartenenze (o dominio competente) |

**Zero tabelle / zero FK** verso Organizzazioni per contesto.

### 11.4 Contesto redazionale / amministrativo

| Ruolo | Fonte | Ambito | Validità | Sospensione/revoca |
|---|---|---|---|---|
| Redattore | Riga `role_code = 'redattore'` con `assignment_status = 'active'` | Piattaforma / risorse editoriali secondo Politiche | Finché assegnazione attiva **e** Account non `suspended`/`closed` | `assignment_status = 'revoked'` oppure Account non operativo |
| Amministratore applicativo | Riga `amministratore_applicativo` attiva | Sistema | Idem | Idem |

**Abilita concettualmente:** azioni dichiarate dalle Politiche di piattaforma e dai domini che le espongono.

**Non abilita automaticamente:** ownership Contenuti, Organizzazioni, Imprese, membership, diritti sostanziali, bypass deny-by-default degli altri domini.

---

## 12. Lifecycle Account

### 12.1 Stato iniziale

Creazione Account → `account_status = 'registered'`, `person_id` NULL, `activated_at` NULL.

### 12.2 Transizioni ammesse (ciclo 1)

| Da | A | Condizione tipica |
|---|---|---|
| `registered` | `limited` | Capacità ridotta senza Persona piena |
| `registered` / `limited` | `active` | `person_id` valorizzato; set `activated_at` se NULL |
| `active` | `limited` | Persa associazione Persona (`person_id` → NULL, incl. FK SET NULL) tramite trigger §20.2, oppure limitazione dichiarata |
| `active` / `limited` | `suspended` | Misura di sicurezza/governance; set `suspended_at` |
| `suspended` | `active` / `limited` | Riattivazione; clear applicativo di `suspended_at` secondo regole |
| `active` / `limited` / `suspended` | `disabled` | Disattivazione volontaria; set `disabled_at` |
| `disabled` | `active` / `limited` | Riattivazione |
| qualunque ≠ `closed` | `closed` | Chiusura definitiva; set `closed_at` |
| `closed` | — | Terminale ciclo 1 |

### 12.3 Separazione assi

| Asse | Dove |
|---|---|
| Stato Account | `accounts.account_status` |
| Stato Persona | Assi/colonne di `profiles` (Persone) — **non** copiati |
| Stato membership | `business_memberships.relation_status` (+ altri) — **non** copiati |
| Stato utente Auth | `auth.users` (banned/deleted, ecc.) — **non** copiati; CASCADE se eliminato |

### 12.4 Effetti su ruoli e contesti

| `account_status` | Ruoli elevati | Contesti operativi |
|---|---|---|
| `registered` / `limited` | Possono esistere in DB ma **non** producono contesti operativi pieni | Nessun personale/Impresa/redazione operativa |
| `active` | Assegnazioni `active` efficaci | Personale / Impresa / redazione secondo regole §11 |
| `suspended` / `disabled` / `closed` | Non producono contesti operativi | Deny |

Revoca ruolo ≠ chiusura Account; chiusura Account ≠ revoca automatica DDL delle righe ruolo (restano storiche; Account `closed` le rende inefficaci per derivazione).

---

## 13. Cataloghi

| Candidato | Decisione ciclo 1 | Motivazione |
|---|---|---|
| Ruoli applicativi | **CHECK** su `role_code` | Insieme piccolo, stabile, senza metadati |
| Stati Account | **CHECK** su `account_status` | Idem |
| Tipi Account | **Non creati** | Account di servizio esclusi |
| Stati associazione | **CHECK** su `person_association_status` | Idem |

Nessun seed dimostrativo. Nessuna tabella catalogo.

---

## 14. Collegamento con `auth.users`

| Aspetto | Contratto |
|---|---|
| FK | `accounts.auth_user_id` → `auth.users(id)` |
| Cardinalità | Auth user `1` — Account `0..1` (ciclo 1: al più un Account ordinario) |
| Obbligatorietà su Account | `auth_user_id` **NOT NULL** |
| ON DELETE | **CASCADE** |
| Auth assente | Non si crea Account senza utente Auth |
| Auth eliminato | Account (e role assignments) eliminati; Persona **non** toccata da Identità |
| Disattivazione Auth vs Account | Distinte: ban/disable Auth ≠ `account_status`; governance applicativa può allinearli senza unificare le colonne |
| Dati non duplicati | email, password, provider, token, MFA, sessioni Auth |

Provisioning riga `accounts`: responsabilità **applicativa / service_role** dopo signup. **Nessun** trigger Identità su `auth.users` nel ciclo 1.

---

## 15. Collegamento con `profiles`

| Aspetto | Contratto |
|---|---|
| FK | `accounts.person_id` → `profiles(id)` |
| Unicità | UNIQUE `person_id` |
| Nullable | Sì |
| ON DELETE | **SET NULL** |
| Normalizzazione post-unlink | Trigger `accounts_clear_person_association` (§20): obbligatorio per rendere `SET NULL` compatibile con i CHECK di associazione e con `active ⇒ person_id` |
| Attivazione contesto personale | §11.1 |
| Creazione Persona da Identità | **Vietata** |
| Forma | Incorporata nell’AR (nessuna tabella di link dedicata) |

### 15.1 Nota legacy (non bloccante, non in scope SQL Identità)

Lo schema attuale lega `profiles.id` a `auth.users(id)` con trigger `handle_new_user` che crea una Persona ad ogni signup. Questo **contrasta** col principio logico «Persona senza Account» e «Account non crea Persona», ma è ownership **Persone/infra preesistente**.

Il Physical Identità:

- **non** modifica quel trigger né la PK di `profiles`;
- introduce `accounts` come AR distinto;
- consente `person_id` NULL e, quando associato, un riferimento esplicito;
- **non** impone `person_id = auth_user_id`;
- rinvia il decoupling completo `profiles`↔Auth a un intervento Persone futuro.

Il Migration Plan Identità dovrà solo **coesistere** con il legacy, senza assorbirlo.

---

## 16. Invarianti fisiche → meccanismi

| # | Invariante | Meccanismo |
|---|---|---|
| 1 | Account ≠ Persona | Tabelle/FK distinte; no PK condivisa obbligatoria |
| 2 | Account ≤ 1 Persona | `person_id` singola + UNIQUE |
| 3 | Persona ≤ 1 Account ordinario | UNIQUE `(person_id)` |
| 4 | Account senza Persona limitato | CHECK `active ⇒ person_id NOT NULL`; stati `registered`/`limited` |
| 5 | Contesto personale ⇒ Persona | Derivazione §11.1 |
| 6 | Contesto Impresa ⇒ fatto Appartenenze | Derivazione §11.2; no tabella locale |
| 7 | Nessun contesto Org ciclo 1 | Nessuna tabella/FK contesto Org |
| 8 | Ruolo ≠ diritti sostanziali | COMMENT + assenza FK business |
| 9 | Autenticazione ≠ autorizzazione | Auth esterno; ruoli/contesti separati |
| 10 | Sospeso/chiuso ⇒ no contesti operativi | Derivazione su `account_status` |
| 11 | Deny-by-default | RLS ENABLE, 0 policy, REVOKE |
| 12 | No duplicazione credenziali Auth | Solo `auth_user_id` |
| 13 | No membership owned | Nessuna tabella membership |
| 14 | No Account–Impresa persistita | §11.2 |
| 15 | No Account–Organizzazione | §11.3 |
| 16 | No servizio / multi-Account | Nessun `account_kind`; UNIQUE auth/person |

---

## 17. Derivati non persistiti

Calcolare, non memorizzare:

- contesto personale attivo;
- elenco contesti Impresa disponibili;
- diritto di agire per una specifica Impresa;
- autorizzazione risultante (ruolo + fatto sostanziale + policy dominio);
- visibilità (dei domini proprietari);
- esito permesso RLS futuro;
- contesto Organizzazione futuro;
- `account_registrato`;
- stato complessivo di accesso composito;
- booleani `can_*` / `has_access` / `is_organization_admin`.

---

## 18. Sicurezza (RLS e privilegi)

Per **entrambe** le tabelle:

| Voce | Prescrizione |
|---|---|
| RLS | `ENABLE ROW LEVEL SECURITY` |
| FORCE RLS | **false** |
| Policy | **0** nel blocco strutturale |
| REVOKE | ALL da `PUBLIC`; ALL da `anon`, `authenticated` |
| GRANT applicativi | **0** |
| Deny-by-default | Sì — nessuna lettura/scrittura client finché non esistono policy dedicate |

Identità & Accessi fornisce **fatti** (`accounts`, assegnazioni ruolo, `person_id`) utilizzabili da future policy; **non** possiede le policy di Persone, Imprese, Appartenenze, Contenuti, Organizzazioni, ecc.

---

## 19. Indici

| Tabella | Indice | Motivazione |
|---|---|---|
| `accounts` | UNIQUE `auth_user_id` | Lookup da sessione Auth (`auth.uid()`) |
| `accounts` | UNIQUE `person_id` | Cardinalità Persona; lookup inverso |
| `accounts` | `(account_status)` | Filtri lifecycle / record operativi |
| `account_role_assignments` | `(account_id)` | Join da Account (anche coperto da UNIQUE composito come leftmost — se UNIQUE `(account_id, role_code)` esiste, indice semplice su `account_id` **non** duplicare se ridondante) |
| `account_role_assignments` | `(role_code)` dove utile a admin listing | Lookup «tutti i redattori» |
| `account_role_assignments` | `(assignment_status)` | Opzionale; solo se query operative lo richiedono |

Non creare indici ridondanti rispetto a PK/UNIQUE già definiti. L’indice `(account_id)` dedicato è omesso se il UNIQUE `(account_id, role_code)` soddisfa i lookup per Account.

**Indice aggiuntivo consigliato:** `accounts (person_id) WHERE person_id IS NOT NULL` — **non necessario** oltre UNIQUE.

---

## 20. Trigger e funzioni

### 20.1 `updated_at` (entrambe le tabelle)

```
function public.set_<table>_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW.

### 20.2 Normalizzazione unlink Persona — solo `accounts` (autorizzato)

Quando `person_id` passa da NOT NULL a NULL — per UPDATE manuale **o** per azione referenziale `ON DELETE SET NULL` da `profiles` — PostgreSQL aggiorna la riga `accounts` e i trigger `BEFORE UPDATE` intercettano l’evento **prima** della valutazione dei CHECK.

Funzione obbligatoria ciclo 1:

```
function public.accounts_clear_person_association()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `accounts_clear_person_association` BEFORE UPDATE FOR EACH ROW su `accounts`.

**Comportamento determinato (non applicativo esterno):**

1. Se `NEW.person_id IS NULL` e `OLD.person_id IS NOT NULL`:
2. imposta `NEW.person_association_status := NULL`;
3. imposta `NEW.person_linked_at := NULL`;
4. se `NEW.account_status = 'active'`, imposta `NEW.account_status := 'limited'`;
5. non modifica `auth_user_id`, `profiles`, membership, ruoli, né altri domini;
6. non chiude né sospende l’Account; non elimina l’Account.

**Motivazione.** Senza questa normalizzazione, `ON DELETE SET NULL` su sola `person_id` violerebbe il CHECK di associazione (companion ancora valorizzati) e/o il CHECK `active ⇒ person_id`, rendendo il `SET NULL` inapplicabile. Il trigger è il meccanismo DDL che realizza §9 / §12.2 (`active` → `limited` alla perdita dell’associazione).

**Ordine di valutazione atteso (PostgreSQL):** azione FK `SET NULL` → `BEFORE UPDATE` su `accounts` (normalizzazione, poi `updated_at`) → CHECK → commit riga. I CHECK vedono già lo stato normalizzato.

**Assenti:**

- trigger su `auth.users`;
- trigger che inseriscono/aggiornano `profiles`;
- trigger che creano membership o autorizzazioni;
- sync invasivi verso altri domini;
- auto-assegnazione ruoli elevati;
- `ON DELETE CASCADE` dell’Account alla cancellazione Persona;
- `ON DELETE RESTRICT` su `person_id` (scartato: contraddirebbe sopravvivenza Account + SET NULL).

---

## 21. Privacy e minimizzazione

- Solo dati applicativi necessari all’Account e ai ruoli.
- Nessuna copia di credenziali o contatti Auth.
- Separazione: dati tecnici Auth / Account applicativo / anagrafica Persona.
- Consensi operativi e modello Privacy dedicato: **rinviati** (Logical §9, §15.A).
- Questo documento non è una policy GDPR.

---

## 22. Confini confermati (assenza)

Persona owned; Impresa owned; Organizzazione owned; membership; ruoli professionali; Deleghe; Consensi; sessioni applicative; dispositivi; token; credenziali; CRM; HR; documenti; media; Storage; FEV; notifiche; billing; workflow; audit infrastrutturale; contenuti; moderazione come processo; policy specifiche degli altri domini; Contesto Org; Account–Impresa; Account–Organizzazione.

---

## 23. Matrice Logical → Physical

| Logical | Physical ciclo 1 |
|---|---|
| Account (AR) | `accounts` |
| Identità digitale minimale | `auth_user_id` (+ lifecycle) sull’AR |
| Associazione Account–Persona | `person_id` + `person_association_status` + `person_linked_at` |
| Ruolo `account_registrato` | Derivato da Account non `closed` |
| Ruoli `redattore`, `amministratore_applicativo` | `account_role_assignments` |
| Contesto personale / Impresa / redazione | Derivazioni §11 |
| Contesto Organizzazione | Non mappato |
| Delega / Consenso / Sessione / Metodo dettagliato | Non mappati |
| auth piattaforma | FK opaca a `auth.users` |

---

## 24. Ordine di creazione (per Migration Plan)

1. `accounts` (dipende da `auth.users`, `profiles`)  
2. `account_role_assignments` (dipende da `accounts`)  
3. Chiusura documentale Migration Plan (fuori SQL)

Precondizioni: schema Auth; `public.profiles`.  
Derivazione Impresa richiede Appartenenze già pubblicate (già vere in repo) — **non** FK di creazione.

**Timestamp:** da assegnare nel Migration Plan; strettamente crescenti e **successivi** a head Organizzazioni `20260808120000`.

---

## 25. Prontezza per Migration Plan

| Unità prevista | Responsabilità | Tabella |
|---|---|---|
| **M1.1** | Aggregate Root Account + vincoli Auth/Persona/lifecycle | `accounts` |
| **M2.1** | Assegnazioni ruoli elevati | `account_role_assignments` |
| **M3–M7** | **Assenti** ciclo 1 | — |
| **M8.1** | Seed demo | **SKIP** |
| **M8.2** | Validation report | non SQL |

**Totale unità SQL previste: 2** (una tabella = una migration).

Ordine: M1.1 → M2.1 → (M8.1 SKIP) → M8.2.

Unità **escluse/rinviate:** Deleghe, Consensi, sessioni, dispositivi, metodi Auth, Contesto Org, cataloghi ruoli, cutover `handle_new_user` / decoupling `profiles`.

Il Migration Plan assegnerà timestamp, nomi file, contratti operativi e test **senza** nuove decisioni semantiche.

---

## 26. Contratti DDL-ready (checklist)

Per ciascuna delle 2 tabelle il Migration Plan verificherà: nome; colonne in ordine; tipi; nullability; default; PK; FK; ON UPDATE/DELETE; UNIQUE; CHECK; indici; `set_*_updated_at`; trigger di normalizzazione Persona su `accounts` (§20.2); RLS ENABLE; FORCE false; 0 policy; REVOKE; nessun GRANT; COMMENT; dipendenze; test statici/runtime.

**Vietati in SQL Identità ciclo 1:** `IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PG; FORCE RLS true; GRANT anon/authenticated; seed demo; tabelle Deleghe/Consensi/sessioni; FK a `businesses`/`organizations` per contesto; trigger su `auth.users`; modifica migration Persone/Appartenenze/Org.

---

## 27. Test statici (attesi dal Plan)

- Tabelle Identità = 2  
- CREATE TABLE = 2; ENABLE RLS = 2; CREATE POLICY = 0; GRANT applicativi = 0  
- FK verso `auth.users` e `profiles` presenti su `accounts`  
- Nessuna FK verso `businesses`, `organizations`, `business_memberships`  
- Nessuna colonna credenziali  
- UNIQUE `auth_user_id`, UNIQUE `person_id`  
- CHECK ruoli solo `redattore` \| `amministratore_applicativo`  
- Nessuna modifica migration precedenti  
- Identificatori ≤ 63 byte  

---

## 28. Test runtime (attesi dal Plan, ROLLBACK)

1. Creazione Account con `auth_user_id`; rifiuto senza Auth.  
2. Secondo Account stesso `auth_user_id` → rifiuto UNIQUE.  
3. `active` senza `person_id` → rifiuto CHECK.  
4. Due Account stessa `person_id` → rifiuto UNIQUE.  
5. DELETE Persona → `person_id` SET NULL; companion azzerati; se `active` → `limited`; Account sopravvive.  
6. DELETE Auth user → Account e role assignments eliminati; Persona non cancellata da Identità.  
7. Assegnazione `redattore` / `amministratore_applicativo`; rifiuto `moderatore` / `account_registrato` come `role_code`.  
8. Revoca ruolo con `revoked_at`.  
9. RLS deny anon/authenticated sulle 2 tabelle.  
10. `updated_at` su UPDATE; zero residui dopo ROLLBACK.

---

## 29. Decisioni rinviate (non bloccanti)

1. Timestamp migration definitivi.  
2. Policy RLS applicative (chi legge/scrive il proprio Account).  
3. Provisioning automatico Account post-signup (app vs eventuale trigger futuro approvato).  
4. Decoupling `profiles` ↔ `auth.users` / ritiro `handle_new_user`.  
5. Stati Logical estesi (recupero, compromesso, contestato Account).  
6. Deleghe, Consensi, sessioni owned.  
7. Contesto Organizzazione.  
8. Account di servizio; multi-Account; moderatore.  
9. Cache/materializzazione contesti Impresa.

Non bloccano il Migration Plan ciclo 1.

---

## 30. Questioni di forma fisica risolte

1. 2 tabelle; AR `accounts` con PK propria.  
2. Identità digitale = link Auth sull’AR.  
3. Account–Persona sull’AR; UNIQUE reciproca di fatto.  
4. Ruoli elevati in tabella owned; `account_registrato` derivato.  
5. Contesto Impresa solo derivato da Appartenenze.  
6. Contesto Org assente.  
7. Stati minimi CHECK a sei valori.  
8. Pattern RLS/REVOKE/updated_at allineato a Organizzazioni/Contenuti.
9. Trigger `accounts_clear_person_association` autorizzato (§20.2) per SET NULL + CHECK.
10. Nessuna duplicazione Auth/Appartenenze; legacy profiles/Auth fuori scope SQL Identità.

---

## 31. Criteri di accettazione

Physical accettabile se: inventario 2 tabelle chiuso; AR Account distinta da Auth e Persona; cardinalità ciclo 1 garantita; contesti documentati come derivazioni; Org non operativo; deny-by-default strutturale; esclusioni Deleghe/Consensi/sessioni/credenziali; sufficiente al Migration Plan senza decisioni semantiche aperte.

---

## 32. Stato finale

| Voce | Esito |
|---|---|
| Conformità Logical ciclo 1 | Sì |
| Decisioni semantiche inventate | No |
| Duplicazione Auth / Appartenenze | No |
| Contesto Org operativo | No |
| Migration Plan autorizzabile | **Sì** |

**PHYSICAL IDENTITÀ & ACCESSI COMPLETO — MIGRATION PLAN AUTORIZZABILE**
