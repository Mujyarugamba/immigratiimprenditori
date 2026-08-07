# Application Access Physical v1 — Design RLS

> Contratto Physical trasversale dell’accesso applicativo e delle policy RLS v1.
> Fonte semantica: `docs/architecture/access/application-access-model-v1.md` (A1, decisioni B1–B6 **chiuse**).
> Fonte strutturale: Physical/SQL pubblicati dei 13 domini · baseline `v0.2.0-db-architecture-v1` · head `20260811110000`.
> Questo documento **traduce** A1 in design tecnico. **Non** contiene SQL eseguibile completo, migration, helper implementati né policy applicate. Pseudocodice e formule logiche sono ammessi.

---

## Indice

1. [Principi Physical](#1-principi-physical)
2. [Helper minimi](#2-helper-minimi)
3. [Contratto degli helper](#3-contratto-degli-helper)
4. [SECURITY DEFINER](#4-security-definer)
5. [Accesso anonimo / SELECT pubblico](#5-accesso-anonimo--select-pubblico)
6. [Self Persona](#6-self-persona)
7. [Accesso Impresa](#7-accesso-impresa)
8. [Appartenenze e grant](#8-appartenenze-e-grant)
9. [Redazione](#9-redazione)
10. [Amministratore applicativo](#10-amministratore-applicativo)
11. [Identità & Accessi](#11-identità--accessi)
12. [Cataloghi](#12-cataloghi)
13. [Ownership ternaria](#13-ownership-ternaria)
14. [Ownership Persona XOR Impresa](#14-ownership-persona-xor-impresa)
15. [Osservatorio](#15-osservatorio)
16. [Organizzazioni](#16-organizzazioni)
17. [Tabelle owned e link](#17-tabelle-owned-e-link)
18. [Matrice SELECT AR](#18-matrice-select-ar)
19. [INSERT / UPDATE / WITH CHECK](#19-insert--update--with-check)
20. [DELETE](#20-delete)
21. [Famiglie di policy](#21-famiglie-di-policy)
22. [Blocchi di migration](#22-blocchi-di-migration)
23. [Transizione policy legacy](#23-transizione-policy-legacy)
24. [Strategia di test](#24-strategia-di-test)
25. [Invarianti Physical](#25-invarianti-physical)
26. [Gap residui](#26-gap-residui)
27. [Readiness Migration Plan](#27-readiness-migration-plan)

---

## 1. Principi Physical

1. Deny-by-default (RLS on; assenza di policy = deny; REVOKE incoerenti da rimuovere).
2. Nessuna policy permissiva implicita / catch-all.
3. Nessun accesso applicativo dalla sola presenza di `auth.uid()`.
4. Scrittura ordinaria solo con Account `account_status = 'active'` (salvo self Account limitato esplicito).
5. Persona corrente = `accounts.person_id` dell’Account legato a `auth.uid()`, con associazione `declared|verified`.
6. Ownership del fatto invariata (non trasferita ad Account).
7. Appartenenza attiva senza grant **non** sufficiente per scrittura Impresa.
8. Grant `authorization_status = 'granted'` obbligatorio per agire gestionalmente per Impresa.
9. `redattore` ≠ `amministratore_applicativo` (Adm non eredita Red).
10. Tabelle owned governate dall’AR.
11. Cataloghi: SELECT pubblico (attivi); no write Account ordinario.
12. `service_role` bypassa RLS a livello infrastrutturale Supabase; **non** modellare policy “per service_role”.
13. Nessuna autoassegnazione di ruoli o grant.
14. Pubblicazione = lifecycle **specifico** del dominio (nessuna regola globale `published_at IS NOT NULL`).
15. DELETE fisico eccezionale; preferire withdraw/archive/close.
16. Ownership non modificabile liberamente via UPDATE.
17. Nessun nuovo ruolo persistito.
18. Nessun `can_*` persistito; helper booleani sono funzioni, non colonne.

---

## 2. Helper minimi

Schema proposto: `public` (o `app_access` se il Migration Plan preferisce schema dedicato; default v1: `public` con prefisso `access_`).

### Set congelato

| Helper | Scopo |
|---|---|
| `access_current_account_id()` | UUID Account corrente |
| `access_current_person_id()` | UUID Persona corrente |
| `access_is_active_account()` | Account operativo per scrittura |
| `access_has_active_application_role(text)` | Ruolo elevato attivo |
| `access_is_editor()` | Shortcut `redattore` |
| `access_is_application_admin()` | Shortcut `amministratore_applicativo` |
| `access_has_active_business_membership(uuid)` | Contesto Impresa (A1 §9.1) |
| `access_has_granted_business_management(uuid)` | Grant gestionale (A1 §9.2) |
| `access_can_act_for_business(uuid)` | Alias gestionale = membership attiva ∧ grant (scrittura Impresa) |

**Non creare:** helper per tabella; helper per operazione CRUD; foresta `can_*` di dominio.

Condizioni semplici (es. `publication_status = 'published'`) restano **inline** nelle policy.

---

## 3. Contratto degli helper

Volatilità tipica: `STABLE`. Booleani: `false` se non autorizzato (mai `NULL`). UUID: `NULL` se identità assente.

| Helper | Input | Output | Tabelle lette | Volatilità | Sicurezza | EXECUTE | Uso |
|---|---|---|---|---|---|---|---|
| `access_current_account_id()` | — | `uuid` | `accounts` | STABLE | DEFINER hardenizzato | `authenticated`, `anon` (anon → NULL) | Policy self / owner |
| `access_current_person_id()` | — | `uuid` | `accounts` | STABLE | DEFINER | `authenticated`, `anon` | Owner Persona |
| `access_is_active_account()` | — | `boolean` | `accounts` | STABLE | DEFINER | `authenticated`, `anon` | Gate scrittura |
| `access_has_active_application_role(p_role text)` | `redattore` \| `amministratore_applicativo` | `boolean` | `accounts`, `account_role_assignments` | STABLE | DEFINER | `authenticated`, `anon` | Red / Adm |
| `access_is_editor()` | — | `boolean` | (via role helper) | STABLE | DEFINER o SQL IMMUTABLE wrapper | idem | Redazione |
| `access_is_application_admin()` | — | `boolean` | (via role helper) | STABLE | idem | idem | Admin |
| `access_has_active_business_membership(p_business_id uuid)` | business id | `boolean` | `accounts`, `business_memberships` | STABLE | DEFINER | `authenticated`, `anon` | Contesto Impresa / SELECT privato |
| `access_has_granted_business_management(p_business_id uuid)` | business id | `boolean` | + `business_membership_management_authorizations` | STABLE | DEFINER | `authenticated`, `anon` | Scrittura Impresa |
| `access_can_act_for_business(p_business_id uuid)` | business id | `boolean` | (composto) | STABLE | DEFINER | `authenticated`, `anon` | INSERT/UPDATE/publish Impresa |

### Comportamenti

| Situazione | UUID helpers | Boolean helpers |
|---|---|---|
| `auth.uid()` NULL (anon) | `NULL` | `false` |
| Auth senza riga `accounts` | `NULL` | `false` |
| Account `closed` / `suspended` / `disabled` | account_id può esistere; person_id solo se ancora collegata | `is_active_account` = `false`; ruoli elevati = `false` |
| Account non `active` | come sopra | scrittura negata |
| Associazione `contested` o assente | `current_person_id` = `NULL` | membership/grant = `false` |
| `role_code` non ammesso | — | `false` |

### Logica (pseudocodice)

```
access_current_account_id():
  SELECT id FROM accounts WHERE auth_user_id = auth.uid() LIMIT 1

access_current_person_id():
  SELECT person_id FROM accounts
   WHERE auth_user_id = auth.uid()
     AND person_id IS NOT NULL
     AND person_association_status IN ('declared','verified')
     AND account_status <> 'closed'

access_is_active_account():
  EXISTS accounts WHERE auth_user_id = auth.uid() AND account_status = 'active'
    AND person_id IS NOT NULL
    AND person_association_status IN ('declared','verified')

access_has_active_application_role(code):
  access_is_active_account()  -- o Account non suspended/closed per lettura ruolo; scrittura richiede active
  AND EXISTS account_role_assignments a
      JOIN accounts c ON c.id = a.account_id
   WHERE c.auth_user_id = auth.uid()
     AND a.role_code = code
     AND a.assignment_status = 'active'
     AND c.account_status NOT IN ('suspended','closed','disabled')

access_has_active_business_membership(bid):
  pid := access_current_person_id()
  AND access_is_active_account()
  AND EXISTS business_memberships
      WHERE person_id = pid AND business_id = bid AND relation_status = 'active'

access_has_granted_business_management(bid):
  access_has_active_business_membership(bid)
  AND EXISTS authorization joined to that membership
      WHERE authorization_status = 'granted'

access_can_act_for_business(bid) := access_has_granted_business_management(bid)
```

**Nota:** per `has_active_application_role`, A1 consente esercizio ruoli solo con Account non suspended/closed; scrittura redazionale/admin richiede tipicamente `active` — le policy di **write** aggiungono `access_is_active_account()`.

---

## 4. SECURITY DEFINER

### Motivazione

Le tabelle `accounts`, `account_role_assignments`, `business_memberships`, `business_membership_management_authorizations` sono (o saranno) sotto RLS. Gli helper devono risolvere l’identità **senza ricorsione** e senza richiedere policy che espongano righe altrui.

→ Helper del set §2: **`SECURITY DEFINER`** read-only, obbligatorio in v1.

### Hardenizzazione obbligatoria (ogni helper DEFINER)

* Owner tecnico controllato (ruolo migration / `postgres` di progetto).
* Solo `SELECT`; nessuna scrittura.
* `SET search_path = ''`.
* Oggetti sempre `schema.table` qualificati.
* Nessun SQL dinamico; nessun parametro come identificatore.
* `REVOKE ALL ON FUNCTION … FROM PUBLIC`.
* `GRANT EXECUTE` solo a `anon` e/o `authenticated` come da tabella §3.
* Ritorno booleano/UUID esclusivamente; nessun dump di riga.
* Parametri UUID/text validati solo come valori (role_code whitelist in funzione).

**Non** usare DEFINER “per comodità” su policy di dominio: le policy restano INVOKER e chiamano gli helper.

---

## 5. Accesso anonimo / SELECT pubblico

Nessuna regola globale `published_at IS NOT NULL`.

| Dominio/AR | Condizione SELECT pubblico (logica) | Tabelle subordinate | Note |
|---|---|---|---|
| Cataloghi attivi | `is_active = true` se colonna esiste; altrimenti lettura completa se catalogo normativo | — | Famiglia cataloghi |
| Persona (`profiles`) | `is_public AND is_active AND deleted_at IS NULL` | lingue/competenze/storie **pubbliche** del profilo | REPLACE legacy `auth.uid()=id` |
| Impresa (`businesses`) | `publication_status = 'public'` ∧ non `deleted_at` ∧ non archiviata impropria ∧ `substantial_status` presentabile ∧ editorial compatibile | sedi/settori/… con visibilità ≤ Impresa | Attenzione: valore `'public'` non `'published'` |
| Appartenenza | `visibility_status = 'public'` ∧ Persona pubblica ∧ Impresa pubblica ∧ relation non conclusa/revocata/archiviata come “corrente” | evidenze tipicamente **no** | |
| Mercati | relazioni/presenze a livello pubblico; ≤ soggetto | — | Mercato catalogo/governance |
| Professionisti | profilo pubblicato + visibilità pubblica; ≤ Persona | owned professionali pubblici | |
| Opportunità | `publication_status` pubblicato ∧ visibilità pubblica (`visibility_level` / equivalente) | owned pubblici | |
| Servizi Offerta/Richiesta | `publication_status = 'published'` ∧ campi pubblici | territori/lingue/… pubblici | |
| Eventi | `publication_status = 'published'` ∧ `visibility_status = 'public'` | edizioni/sessioni/… pubblici dell’AR | |
| Contenuti | `publication_status = 'published'` ∧ `visibility_status = 'public'` | link/tag pubblici | |
| Organizzazioni | `publication_status = 'published'` ∧ `visibility_status = 'public'` | officials pubblici se previsti | |
| Collaborazioni | `editorial_status = 'published'` (no `publication_status`) | participants pubblici se previsti | |
| Osservatorio Indicatore | `publication_status = 'published'` | Valori con `published_at NOT NULL` ∧ `status <> 'withdrawn'` | Fonte: SELECT se esposta come provenance |
| Account | **Mai** | — | |

**Mai anonimi:** Account, role assignments, authorization grants, evidenze membership, bozze, `private`, `withdrawn` (salvo regole storiche esplicite), dati `limited`/`suspended` owner.

---

## 6. Self Persona

### 6.1 `profiles`

| Operazione | Regola Physical |
|---|---|
| SELECT self | `id = access_current_person_id()` |
| SELECT pubblico | §5 |
| UPDATE self | Account `active`; whitelist colonne profilo (nome pubblico, bio, …) |
| Colonne non self-UPDATE | `deleted_at`, flag moderazione, campi sistema `published_at` se system-managed |
| INSERT | **Svc** / provisioning controllato (non self arbitrario se legacy lo vietava) |
| Associazione Account–Persona | Flusso IA esplicito (update `accounts.person_id`); non via UPDATE profiles |
| Soft-delete / cancel | OwnP o Politiche; preferire lifecycle |

**Limitazione colonne:** RLS non filtra colonne → per whitelist UPDATE usare **column-level privileges** e/o **RPC** `update_own_profile(...)`. Scelta v1: **column-level GRANT** sulle colonne consentite + trigger di guardia solo se già presenti; RPC per operazioni sensibili (link Persona).

### 6.2 Fatti owned Persona

* `USING`: AR.owner_person_id / subject person = `access_current_person_id()` ∧ `access_is_active_account()` (per write).
* `WITH CHECK`: stesso owner; **divieto** di cambiare owner (`WITH CHECK` owner immutabile).
* Owned tables: EXISTS parent consentito in SELECT/write.

---

## 7. Accesso Impresa

### Formule

```
CTX(b)  := access_has_active_business_membership(b)   -- contesto
ACT(b)  := access_can_act_for_business(b)             -- gestione = CTX ∧ grant
```

| Operazione | Condizione |
|---|---|
| SELECT privato scheda/owned | `CTX(business_id)` ∨ `ACT(business_id)` ∨ (pubblico §5) |
| INSERT fatto owned Impresa | `ACT(business_id)` ∧ owner_business_id = b ∧ lifecycle |
| UPDATE | `ACT(business_id)` ∧ stesso business ∧ ownership immutabile |
| Pubblicazione | `ACT(business_id)` ∧ gate dominio ∧ **non** ramo redazionale (B6) |
| Ritiro / archiviazione | `ACT(business_id)` |
| DELETE | Negato ordinario; withdraw/archive; Svc eccezionale |
| Cross-business | Negato (`business_id` deve matchare) |
| Cambio ownership | Negato via policy UPDATE |

Ownership resta sull’Impresa; Persona è solo legittimata.

---

## 8. Appartenenze e grant

### 8.1 `business_memberships`

| Operazione | Soggetto / canale |
|---|---|
| SELECT self | `person_id = access_current_person_id()` |
| SELECT gestori Impresa | `ACT(business_id)` |
| SELECT pubblico | §5 |
| INSERT self-dichiarazione | Account active + person; regole dominio (proposed/declared) — **non** crea grant |
| INSERT “come Impresa” | Richiede già `ACT(business_id)` o Adm/Svc |
| UPDATE titoli/ruoli / chiusura | Self limitato **oppure** Adm/Svc **oppure** gestore solo dove contratto Appartenenze lo consente esplicitamente; default v1 prudente: **chiusura self + Adm/Svc**; cambio ruolo → **RPC** o Adm |
| DELETE | Negato; usare `relation_status` lifecycle |

### 8.2 `business_membership_management_authorizations`

| Operazione | Canale |
|---|---|
| SELECT propria / gestori stessa Impresa | membership self ∨ `ACT(business_id)` ∨ Adm |
| Primo grant (B1) | **Solo Svc o Adm** — policy: `access_is_application_admin()` ∨ Svc; **RPC amministrativa preferita** per attestare “primo” + membership attiva |
| Grant successivi (B3) | Adm/Svc **oppure** `ACT(business_id)` con `WITH CHECK` non-self-grant su altra Persona |
| Revoca / autorevoca | Adm/Svc / altro ACT / self-revoke propria riga |
| Autoconcessione | **Sempre vietata** (`WITH CHECK` / RPC: grantee ≠ caller salvo Adm/Svc) |
| Ultimo gestore | Applicativo; no trigger |

**Scelta definitiva:** mutazioni grant e ruoli membership sensibili → **RPC** (`grant_business_management`, `revoke_business_management`) eseguite come INVOKER con controlli interni + DEFINER solo se necessario per write atomica; policy CRUD dirette **negano** INSERT/UPDATE ordinari tranne i path espliciti.

---

## 9. Redazione

`access_is_editor()` ∧ `access_is_active_account()` (per write).

| Ambito | SELECT | INSERT/UPDATE/publish/withdraw | DELETE |
|---|---|---|---|
| Contenuti | pubblico ∨ Red ∨ owner | Red; owner Persona/Impresa se contratto | Negato / withdraw |
| `owned_by_editorial` | pubblico ∨ Red | Red | Negato ordinario |
| Osservatorio | pubblico ∨ Red | Red | Negato ordinario |
| Org redazionali | pubblico ∨ Red | Red | Negato ordinario |

Conferme: Red ≠ Adm; Red non ottiene Contesto Impresa senza grant; Red non modifica fatti Persona/Impresa non editoriali.

---

## 10. Amministratore applicativo

`access_is_application_admin()` ∧ Account attivo (write).

| Ambito | Accesso |
|---|---|
| `accounts` | SELECT/UPDATE admin; INSERT provisioning → **Svc/RPC** |
| `account_role_assignments` | grant/revoke → **RPC** (`assign_application_role`, `revoke_application_role`); no CRUD self |
| Bootstrap Adm | Svc / SQL controllato (B5) |
| Grant Impresa | Sì (B1/B3) via RPC |
| Cataloghi | write Adm/Svc |
| Fatti business generici | **No** automatico |
| Contenuti / OSS / editorial | **No** senza anche Red |

---

## 11. Identità & Accessi

### `accounts`

| Op | Regola |
|---|---|
| SELECT self | `auth_user_id = auth.uid()` (policy diretta; helper DEFINER per altri usi) |
| UPDATE self | Whitelist (es. preferenze); **non** `account_status`, `person_id`, elevazione → **column privileges + RPC** per link Persona |
| SELECT/UPDATE admin | Adm |
| INSERT | Svc |
| Close/disable | Adm/Svc |
| DELETE | Negato; status `closed` |

### `account_role_assignments`

| Op | Regola |
|---|---|
| SELECT self | proprie righe |
| INSERT/UPDATE/DELETE diretto authenticated | **Negato** |
| Assign/revoke | **RPC** Adm/Svc; `assignment_status` `active|revoked`; no self-elevate |

---

## 12. Cataloghi

| Famiglia | Esempi | SELECT | Write |
|---|---|---|---|
| Foundation | `languages`, `competencies`, `business_sectors` | pubblico `is_active` | Adm/Svc |
| Servizi | `service_categories`, `service_economic_bands` | pubblico attivi | Adm/Svc |
| Eventi | `event_types` | pubblico attivi | Adm/Svc |
| Appartenenze | role catalog membership | pubblico attivi | Adm/Svc |
| Org / Contenuti | tipi, scopes, tags… | pubblico attivi | Adm/Svc |
| Professionisti / Opp | cataloghi locali | pubblico attivi | Adm/Svc |
| Senza `is_active` | seed normativi fissi | SELECT pubblico completo | Adm/Svc |

Pattern policy: `*_select_public` / `*_write_admin`. Nessuna scrittura Account ordinario.

---

## 13. Ownership ternaria

AR: `contents`, `organizations`, `collaborations` (`owner_person_id` XOR `owner_business_id` XOR `owned_by_editorial`).

| Op | Condizione |
|---|---|
| SELECT privato | OwnP ∨ ACT(business) ∨ (editorial ∧ Red) ∨ pubblico |
| INSERT | Esattamente un contesto: Persona corrente **oppure** ACT(business) **oppure** Red+`owned_by_editorial=true` |
| UPDATE | Stesso contesto; **ownership immutabile** in `WITH CHECK` |
| DELETE | Draft non pubblicati: owner/Red; altrimenti withdraw; Adm/Svc eccezionale |

`WITH CHECK` post-UPDATE: la riga resta autorizzata allo stesso soggetto.

---

## 14. Ownership Persona XOR Impresa

AR: `service_offers`, `service_requests`, `events` (+ soggetti MI dove XOR).

| Op | Persona | Impresa |
|---|---|---|
| INSERT | `owner_person_id = current_person` ∧ active | `owner_business_id = b` ∧ `ACT(b)` |
| UPDATE / withdraw / archive | OwnP | ACT(b) |
| Publish | OwnP ∧ gate | ACT(b) ∧ B6 (no review redazionale obbligatoria) |
| Owned tables | derivate AR | derivate AR |
| Switch Persona↔Impresa | **Vietato** | **Vietato** |
| Red | Solo se dominio introduce editorial (non di default su XOR) | — |
| Adm | Non writer di business | Non writer di business |

---

## 15. Osservatorio

| Op | Regola |
|---|---|
| Anon SELECT Indicatori | `publication_status = 'published'` |
| Anon SELECT Valori | Valore pubblicato ∧ Indicatore pubblicato; `status <> 'withdrawn'` |
| Fonti | SELECT se esposte (metadato); no microdati |
| Red CRUD / publish | `access_is_editor()` |
| Adm senza Red | **No** |
| Svc | Infrastrutturale |
| Owner Persona/Impresa | Assente |
| Fonte | Entity condivisibile; non subordinata a un Indicatore |
| Valore | Subordinato all’Indicatore (policy owned) |

---

## 16. Organizzazioni

| Aspetto | Regola |
|---|---|
| SELECT pubblico | `publication_status='published'` ∧ `visibility_status='public'` |
| Write Persona | OwnP |
| Write Impresa | ACT(business) |
| Write Red | `owned_by_editorial` ∧ Red |
| `organization_officials` | Owned da AR; **non** conferiscono ACT |
| Membership Org | Assente |
| Ownership | Immutabile |
| DELETE | Limitato / withdraw |

---

## 17. Tabelle owned e link

| Categoria | SELECT | INSERT/UPDATE | DELETE | USING / WITH CHECK |
|---|---|---|---|---|
| Owned strette | Se AR consentito (pubblico o owner) | Se AR scrivibile | Come AR | `EXISTS` parent autorizzato; parent_id immutabile |
| Link strutturali | Estremi + dominio owner | Dominio owner | Dominio owner | Entrambi gli estremi validi |
| Cataloghi | §12 | Adm/Svc | Adm/Svc | — |
| Storico / revisioni | Come record principale | Append-only / Red | **No** ordinario | — |
| Amministrative (Account, roles, grants) | Self/Adm | RPC/Svc/Adm | Revoca/close | §8–§11 |

---

## 18. Matrice SELECT AR

| Dominio | AR | Public condition | Owner Persona | Gestore Impresa | Red | Adm |
|---|---|---|---|---|---|---|
| Persone | Persona | `is_public∧is_active∧deleted_at IS NULL` | self | — | — | sospensione Politiche (non ownership) |
| Imprese | Impresa | `publication_status='public'` (+ assi) | — | CTX/ACT privato | — | no auto |
| Appartenenze | Membership | visibility public + soggetti | self | ACT | — | sì admin |
| Professionisti | Profilo | pubblicato+pubblico | self | — | — | no |
| Opportunità | Opp | published+public visibility | se titolare | ACT se Impresa | se curated | no |
| Servizi | Offerta/Richiesta | `publication_status='published'` | OwnP | ACT | — | no |
| Eventi | Evento | published∧visibility public | OwnP | ACT | — | no |
| Contenuti | Contenuto | published∧visibility public | OwnP | ACT | sì | **no** (salvo anche Red) |
| Organizzazioni | Org | published∧visibility public | OwnP | ACT | editorial | no |
| Collaborazioni | Collab | `editorial_status='published'` | OwnP | ACT | editorial | no |
| Osservatorio | Indicatore | `publication_status='published'` | — | — | sì | **no** |
| Identità | Account | mai | self | — | — | sì |

---

## 19. INSERT / UPDATE / WITH CHECK

### Pattern generici

**Owner Persona**

```
USING:  access_is_active_account() AND owner_person_id = access_current_person_id()
WITH CHECK: stesso ∧ owner_person_id immutabile
```

**Gestore Impresa**

```
USING:  access_can_act_for_business(owner_business_id)
WITH CHECK: access_can_act_for_business(owner_business_id) ∧ owner_business_id immutabile
```

**Redazione**

```
USING/WITH CHECK: access_is_editor() AND access_is_active_account()
  AND (owned_by_editorial OR dominio Osservatorio OR Contenuti editoriali)
```

### Colonne non governabili da RLS — scelta definitiva v1

| Caso | Scelta |
|---|---|
| Whitelist UPDATE `profiles` / `accounts` | **Column-level privileges** + policy UPDATE self |
| Link Account–Persona; cambio `account_status` | **RPC** |
| Assign/revoke ruoli elevati | **RPC** |
| Primo grant / grant cross-person | **RPC** |
| Ownership switch tentato | Negato da `WITH CHECK`; se serve audit → trigger di guardia **solo** se RPC non copre |

Nessuna scelta lasciata al Migration Plan.

---

## 20. DELETE

| Famiglia | Account ordinario | Owner | Red | Adm/Svc | Alternativa |
|---|---|---|---|---|---|
| Cataloghi | No | — | No | Sì | — |
| AR pubblicati | No | No | No | Eccezionale | withdraw/archive |
| Draft non pubblicati | No | Sì se previsto | Sì se editorial | Sì | — |
| Owned | Come AR | Come AR | Come AR | — | CASCADE dominio |
| Revisioni/storico | No | No | No | Eccezionale | supersede |
| Account | No | — | — | close/disable | status |
| Ruoli / grant | No | — | — | revoke | `revoked` |
| Membership | No | chiusura lifecycle | — | sì | relation_status |

---

## 21. Famiglie di policy

Naming uniforme:

```text
<table>_select_public
<table>_select_self
<table>_select_owner
<table>_select_business_manager
<table>_insert_owner
<table>_insert_business
<table>_insert_editorial
<table>_update_owner
<table>_update_business
<table>_update_editorial
<table>_select_editorial
<table>_write_editorial
<table>_select_admin
<table>_write_admin
```

Regole: una policy per comando × soggetto; OR logico tra policy permissive; **no** catch-all; **no** `USING (true)` fuori cataloghi pubblici / SELECT pubblico esplicito.

---

## 22. Blocchi di migration

| Blocco | Contenuto | Note |
|---|---|---|
| **A3.1** | Helper identity (`current_account_id`, `current_person_id`, `is_active_account`) | DEFINER hardenizzato |
| **A3.2** | Helper roles + `is_editor` / `is_application_admin` | |
| **A3.3** | Helper business context / grant / can_act | |
| **A4** | Foundation RLS: accounts, profiles (+owned), businesses, memberships, authorizations, cataloghi foundation; RPC grant/ruoli base | REPLACE legacy profiles |
| **A5** | Business: MI, Professionisti, Opp, Servizi, Eventi, Collaborazioni | XOR + ternaria Collab |
| **A6** | Editorial/transversal: Contenuti, Organizzazioni, Osservatorio, cataloghi restanti | Adm≠Red |
| *(opz.)* A4b/A5b | Split per rischio se troppo grandi | Consentito |

Training legacy: **fuori** A4–A6 v1 → `REVIEW` / quarantine (non aprire con Account model finché non in scope).

---

## 23. Transizione policy legacy

Inventario concettuale (~21 tabelle con policy; ~118 deny-default).

| Classe | Azione | Esempi |
|---|---|---|
| Catalog SELECT `is_active` | **KEEP** shape; allineare naming | languages, sectors, … |
| profiles / profile-* con `auth.uid()=profiles.id` | **REPLACE** | usare `access_current_person_id()` |
| training_* | **REVIEW** / quarantine fuori v1 accesso 13 domini | non aprire in A5 |
| Deny-default recenti | **REPLACE** (apertura esplicita) | businesses, services, events, … |
| Policy obsolete già droppate | **DROP** conferma | — |

Strategia: (1) inventario effettivo in Migration Plan; (2) helper prima; (3) sostituzione **atomica per dominio**; (4) nessuna finestra `USING(true)`; (5) REVOKE GRANT incoerenti; (6) test anon/authenticated; (7) rollback documentato; (8) no reset schema.

A2 **non** modifica policy.

---

## 24. Strategia di test

Identità: anon; Auth senza Account; `registered`; `limited`; `active`+Persona; sospeso; OwnP; membership senza grant; membership+grant; Red; Adm; Red+Adm; estraneo; altra Impresa; service_role.

Operazioni: SELECT pubblico/privato; INSERT; UPDATE; ownership switch (deny); publish; withdraw/archive; DELETE; self-elevate; self-grant; cross-business; owned; cataloghi write deny; ruolo revocato; grant revocato; Account non attivo.

---

## 25. Invarianti Physical

1. Nessun accesso applicativo dalla sola `auth.uid()`.
2. Scrittura ordinaria ⇒ Account attivo.
3. Persona owner = Persona corrente.
4. Impresa owner/gestione ⇒ grant.
5. Membership senza grant non basta.
6. Red e Adm distinti.
7. No self-elevate.
8. No self-grant.
9. Owned segue AR.
10. Ownership immutabile.
11. Public SELECT usa lifecycle reale.
12. Pubblicazione non globale.
13. Service role fuori dalle policy applicative.
14. Helper minimali.
15. SECURITY DEFINER hardenizzato.
16. Cataloghi non scrivibili dagli utenti.
17. Storico non cancellabile ordinariamente.
18. Officials Org non danno gestione.
19. Fonte Osservatorio condivisibile.
20. Valore Osservatorio subordinato.
21. Adm non è superuser di business.
22. No policy catch-all.
23. Nessuna finestra permissiva in transizione.
24. Nessuna decisione semantica lasciata al Migration Plan.

---

## 26. Gap residui

Nessun blocco Physical che riapra B1–B6.

**Post-v1 / fuori perimetro:** membership Organizzazione; deleghe; consensi; matching; Account di servizio tipizzato; protezione DB ultimo Adm/gestore; audit avanzato; override emergenziale; consolidamento training legacy.

**Physical A2:** completo per avviare il Migration Plan RLS.

---

## 27. Readiness Migration Plan

| Voce | Contenuto |
|---|---|
| Helper definitivi | §2–§3 (9 funzioni) |
| Schema / sicurezza | `public` + DEFINER hardenizzato §4 |
| Famiglie policy | §21 |
| Blocchi | A3.1–A3.3, A4, A5, A6 §22 |
| Ordine | Helper → Foundation → Business → Editorial |
| Dipendenze | A1 chiuso; baseline DB v1 |
| Legacy | §23 KEEP/REPLACE/REVIEW |
| RPC necessarie | assign/revoke role; grant/revoke business management; link Persona; update sensibili Account/Profile |
| Tabelle iniziali A4 | accounts, account_role_assignments, profiles (+owned), businesses, business_memberships, authorizations, cataloghi foundation |
| Test | §24 |
| Rinviati | §26 |

---

**Physical Access/RLS v1 completo.** Prossimo artefatto autorizzato: Migration Plan RLS (non in questo task).
