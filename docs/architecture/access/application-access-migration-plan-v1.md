# Application Access Migration Plan v1 — Access/RLS

> Plan operativo per implementare helper, RPC e policy RLS v1.
> Fonti: `application-access-model-v1.md` (A1) · `application-access-physical-v1.md` (A2).
> Baseline DB: tag `v0.2.0-db-architecture-v1` · head `20260811110000`.
> Questo documento **non** contiene SQL eseguibile. Non inventa decisioni oltre A1/A2.

---

## Indice

1. [Inventario preliminare](#1-inventario-preliminare)
2. [Strategia generale](#2-strategia-generale)
3. [A3.1 Helper Identity](#3-a31-helper-identity)
4. [A3.2 Helper Roles](#4-a32-helper-roles)
5. [A3.3 Helper Business Context](#5-a33-helper-business-context)
6. [A3.4 RPC](#6-a34-rpc)
7. [A4 Foundation RLS](#7-a4-foundation-rls)
8. [A5 Business-domain RLS](#8-a5-business-domain-rls)
9. [A6 Editoriale e trasversale](#9-a6-editoriale-e-trasversale)
10. [Policy e GRANT legacy](#10-policy-e-grant-legacy)
11. [Famiglie di policy](#11-famiglie-di-policy)
12. [Timestamp e dimensionamento](#12-timestamp-e-dimensionamento)
13. [Ordine globale](#13-ordine-globale)
14. [Transizione atomica e rollback](#14-transizione-atomica-e-rollback)
15. [Review, test, remoto, M8](#15-review-test-remoto-m8)
16. [Elementi esclusi](#16-elementi-esclusi)
17. [Readiness](#17-readiness)

---

## 1. Inventario preliminare

### 1.1 Oggetti e azioni

| Oggetto | Tipo | Stato attuale | Azione prevista | Blocco |
|---|---|---|---|---|
| `access_current_account_id()` | Helper | Assente | CREATE | A3.1 |
| `access_current_person_id()` | Helper | Assente | CREATE | A3.1 |
| `access_is_active_account()` | Helper | Assente | CREATE | A3.1 |
| `access_has_active_application_role(text)` | Helper | Assente | CREATE | A3.2 |
| `access_is_editor()` | Helper wrapper | Assente | CREATE | A3.2 |
| `access_is_application_admin()` | Helper wrapper | Assente | CREATE | A3.2 |
| `access_has_active_business_membership(uuid)` | Helper | Assente | CREATE | A3.3 |
| `access_has_granted_business_management(uuid)` | Helper | Assente | CREATE | A3.3 |
| `access_can_act_for_business(uuid)` | Helper | Assente | CREATE | A3.3 |
| RPC `assign_application_role` / `revoke_application_role` | RPC | Assenti | CREATE | A3.4 |
| RPC `grant_business_management` / `revoke_business_management` (+ bootstrap primo grant) | RPC | Assenti | CREATE | A3.4 |
| RPC link Persona / close Account / provisioning | RPC | Assenti | CREATE | A3.4 |
| Self-update profiles whitelist | Column GRANT + RPC sensibili | Legacy UPDATE ampia su profiles | REPLACE | A4.2 |
| `accounts` / `account_role_assignments` | Tabelle | RLS on, 0 policy, REVOKE | CREATE policy | A4.1 |
| `profiles` + owned | Tabelle | Policy legacy `auth.uid()=id` | REPLACE | A4.2 |
| `businesses` + owned | Tabelle | RLS on, 0 policy | CREATE policy | A4.3 |
| `business_memberships` + satelliti | Tabelle | RLS on, 0 policy | CREATE policy | A4.4 |
| `business_membership_management_authorizations` | Tabella | RLS on, 0 policy | CREATE policy + RPC | A4.5 |
| Cataloghi foundation (`languages`, `competencies`, `business_sectors`, …) | Cataloghi | SELECT pubblico `is_active` | KEEP shape / rename | A4.6 |
| Domini MI…Collaborazioni | AR/owned | Deny-by-default | CREATE policy | A5.* |
| Contenuti / Org / Osservatorio | AR/owned | Deny-by-default | CREATE policy | A6.* |
| Cataloghi dominio (event_types, service_*, org_*, content_*, …) | Cataloghi | REVOKE + RLS; seed | CREATE select_public | A4.6 / A6.4 |
| `training_*` + language_service_* | Legacy | Policy owner `auth.uid()` | **REVIEW → SKIP v1** (quarantine) | Cleanup opz. post-v1 |
| Policy `"Public can view active profiles"` | Policy | Storica / sostituita | DROP conferma se residua | A4.2 |
| Policy `"Public can view published profiles"` | Policy | Presente | REPLACE | A4.2 |

### 1.2 Dipendenze helper → policy

```
A3.1 identity  →  tutte le policy self/owner
A3.2 roles     →  policy editorial/admin
A3.3 business  →  policy Impresa / grant / XOR Impresa
A3.4 RPC       →  mutazioni Account/ruoli/grant (policy CRUD deny)
A4             →  A5, A6
```

Nessuna policy dipende da helper non ancora creati.

---

## 2. Strategia generale

1. Helper identity  
2. Helper roles  
3. Helper business context  
4. RPC amministrative/self-service  
5. Foundation RLS (REPLACE profiles)  
6. Business domains  
7. Editorial/transversal  
8. Validazione locale  
9. Dry-run remoto  
10. Apply remoto (blocchi autorizzati)  
11. M8.2  

**Regole:** no policy prima degli helper; no finestra `USING (true)`; no disable RLS; no seed pubblico Adm/Account.

---

## 3. A3.1 Helper Identity

**Scelta unità:** **una migration** con i tre helper identity (stessa sicurezza/owner/REVOKE pattern). Motivazione: set atomico minimo senza dipendenze crociate esterne.

| Helper | Schema | Firma | Output | Volatilità | Sicurezza | Owner | search_path | REVOKE | GRANT EXECUTE | Tabelle | Anon |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `access_current_account_id` | `public` | `()` | `uuid` | STABLE | DEFINER hardenizzato | ruolo migration | `''` | PUBLIC | anon, authenticated | `accounts` | NULL |
| `access_current_person_id` | `public` | `()` | `uuid` | STABLE | DEFINER | idem | `''` | PUBLIC | anon, authenticated | `accounts` | NULL |
| `access_is_active_account` | `public` | `()` | `boolean` | STABLE | DEFINER | idem | `''` | PUBLIC | anon, authenticated | `accounts` | false |

Dipendenze: tabella `accounts` pubblicata. Nessuna dipendenza da altri helper.

Timestamp: `20260812090000_access_helpers_identity.sql`

---

## 4. A3.2 Helper Roles

**Scelta A2:** helper generico `access_has_active_application_role(text)` + wrapper `access_is_editor()` / `access_is_application_admin()`.

| Helper | Dipendenze | Account non attivo | Ruolo revocato | DEFINER | EXECUTE |
|---|---|---|---|---|---|
| `access_has_active_application_role(p_role text)` | `accounts`, `account_role_assignments`; whitelist role_code | false (write path); lettura ruolo negata se suspended/closed/disabled | `assignment_status <> 'active'` → false | Sì | anon, authenticated |
| `access_is_editor()` | chiama generico `'redattore'` | false | false | Sì (thin) | idem |
| `access_is_application_admin()` | chiama generico `'amministratore_applicativo'` | false | false | Sì (thin) | idem |

Timestamp: `20260812100000_access_helpers_roles.sql` — dipende da A3.1 (opzionale se self-contained JOIN).

---

## 5. A3.3 Helper Business Context

Formula A1/A2:

```
active Account ∧ associated Person
∧ active membership (relation_status='active')
∧ granted authorization
∧ same business_id
```

| Helper | Firma | Tabelle | Business inesistente | Lifecycle | DEFINER | EXECUTE |
|---|---|---|---|---|---|---|
| `access_has_active_business_membership` | `(p_business_id uuid)` | accounts, business_memberships | false | solo `relation_status='active'` | Sì | anon, authenticated |
| `access_has_granted_business_management` | `(p_business_id uuid)` | + management_authorizations | false | membership active + `authorization_status='granted'` | Sì | idem |
| `access_can_act_for_business` | `(p_business_id uuid)` | composto (= granted) | false | idem | Sì | idem |

Nessun ruolo aziendale nuovo.

Timestamp: `20260812110000_access_helpers_business.sql` — dipende da A3.1.

---

## 6. A3.4 RPC

Nomi definitivi: quelli già citati in A2 (`assign_application_role`, `revoke_application_role`, `grant_business_management`, `revoke_business_management`, `update_own_profile` se usata). Le RPC non nominate in A2 usano prefisso `access_` solo come nome tecnico di Plan, senza nuova semantica.

| RPC | Attore | Input | Operazione | Tabelle scritte | Controlli | Blocco | Classe |
|---|---|---|---|---|---|---|---|
| `access_provision_account` | Svc | auth_user_id, … | INSERT accounts | accounts | solo service_role | A3.4 | **obbligatoria v1** (Svc-only) |
| `access_link_person` | Acc active / Adm / Svc | person_id | UPDATE accounts.person_* | accounts | assoc esplicita; no elevazione | A3.4 | obbligatoria v1 (A2: link via RPC) |
| `access_update_own_account` | Acc | whitelist | UPDATE limitato | accounts | no `account_status`/roles/person | A3.4 | obbligatoria v1 (column priv + RPC) |
| `update_own_profile` | Acc active | whitelist | UPDATE profiles | profiles | A2: column-level GRANT primario; RPC se campi non coperti da GRANT | A3.4 / A4.2 | obbligatoria v1 (path UPDATE) |
| `access_close_account` | Adm/Svc | account_id | status closed/disabled | accounts | Adm o Svc | A3.4 | obbligatoria v1 |
| `access_self_delete_preflight` | Acc (self) | — | read blockers | — | auth.uid only | L1.3-M3 | **APPLIED** (M3→M4) |
| `access_self_delete_account` | Acc (self) | — | soft-close + revoke + minimize; orphans open M4 cases | accounts, roles, grants, memberships, profiles, contacts, … | refuse last admin only (post-M4) | L1.3-M3/M4 | **APPLIED** |
| `assign_application_role` | Adm/Svc | account_id, role_code | INSERT/reactivate | account_role_assignments | no self-elevate; whitelist | A3.4 | obbligatoria v1 (nome A2) |
| `revoke_application_role` | Adm/Svc | assignment_id | status revoked | account_role_assignments | ultimo Adm = check applicativo | A3.4 | obbligatoria v1 (nome A2) |
| `access_bootstrap_business_grant` | Adm/Svc | membership_id | INSERT authorization granted | management_authorizations | B1; membership active; “primo” attestato in RPC | A3.4 | obbligatoria v1 |
| `grant_business_management` | Adm/Svc/ACT | membership_id | INSERT granted | authorizations | B3; no autoconcessione | A3.4 | obbligatoria v1 (nome A2) |
| `revoke_business_management` | Adm/Svc/ACT/self | authorization_id | status revoked | authorizations | autorevoca ok; ultimo gestore applicativo | A3.4 | obbligatoria v1 (nome A2) |
| Bootstrap primo Adm | Svc/SQL controllato | — | INSERT role | account_role_assignments | **non** migration pubblica | — | **service-role only** / fuori repo seed |
| Membership INSERT self | Policy diretta | — | — | memberships | dichiarativa | A4.4 | policy (non necessaria RPC v1) |
| Membership role change | Adm/Svc | — | UPDATE | memberships | A2: RPC o Adm | A4.4 | **RPC applicativa futura** / Adm-only v1 |

Timestamps RPC:

* `20260812120000_access_rpc_identity.sql` — provision, link person, update own account/profile path, close  
* `20260812130000_access_rpc_roles_and_grants.sql` — assign/revoke roles, bootstrap/grant/revoke business

---

## 7. A4 Foundation RLS

### 7.1 Unità

| Unità | Timestamp | Oggetti | Helper/RPC | Note |
|---|---|---|---|---|
| A4.1 | `20260812140000` | accounts, account_role_assignments | A3.1–2, RPC | |
| A4.2 | `20260812150000` | profiles + profile_languages, profile_competencies, personal_stories (+ language_services se in scope Persone) | A3.1, RPC profile | REPLACE legacy |
| A4.3 | `20260812160000` | businesses + owned tipiche (locations, sectors, …) | A3.1, A3.3 | INSERT scheda ≠ grant |
| A4.4 | `20260812170000` | business_memberships (+ sources/evidences/… SELECT ristretto) | A3.1, A3.3 | |
| A4.5 | `20260812180000` | business_membership_management_authorizations | A3.3, RPC grant | CRUD deny; RPC write |
| A4.6 | `20260812190000` | languages, competencies, business_sectors (+ membership_roles catalog) | — | KEEP SELECT shape |

### 7.2 Accounts (A4.1)

| Elemento | Piano |
|---|---|
| Policy | `accounts_select_self`, `accounts_select_admin`; UPDATE/INSERT via RPC (no UPDATE policy ampia) |
| Privilegi | REVOKE ALL da anon/authenticated; GRANT SELECT dove policy; colonne UPDATE revoke tranne path RPC |
| Legacy | nessuna policy preesistente → CREATE |
| Test | self see; other deny; registered cannot write business |

### 7.3 Roles (A4.1)

| Elemento | Piano |
|---|---|
| Policy | `account_role_assignments_select_self`, `_select_admin` |
| Write | **solo RPC**; no INSERT/UPDATE/DELETE policy per authenticated |
| Primo Adm | fuori policy (Svc/SQL) |
| Test | self-elevate deny; Adm assign ok |

### 7.4 Profiles (A4.2)

| Elemento | Piano |
|---|---|
| Public SELECT | REPLACE: predicato `is_public ∧ is_active ∧ deleted_at IS NULL` (allineato SQL pubblicato) |
| Self SELECT | REPLACE: `id = access_current_person_id()` |
| Self UPDATE | REPLACE predicato self; **limitazione colonne fissata**: column-level GRANT (A2 scelta v1) sulle colonne consentite; campi riservati **REVOKE UPDATE**; RPC `update_own_profile` solo se necessario oltre ai GRANT; **non** view obbligatoria in v1 |
| Associazione Account–Persona | **non** modificabile da UPDATE profiles; solo RPC `access_link_person` su `accounts` |
| Lifecycle/contestazione | campi/status riservati: no self UPDATE; Adm/Svc o path dedicati se già previsti dal Physical Persone |
| Drop legacy | `"Users can view their own profile"`; `"Users can update their own profile"`; `"Public can view published profiles"`; conferma assenza residua `"Public can view active profiles"` |
| Owned | `profile_languages`, `profile_competencies`, `personal_stories` (+ language_services se in scope): REPLACE owner uid → person helpers |

### 7.5 Businesses (A4.3)

| Op | Piano |
|---|---|
| SELECT public | `publication_status='public'` (+ assi A2) |
| SELECT manager | CTX o ACT |
| INSERT | Account active + person; crea scheda; **non** crea grant |
| UPDATE/publish/archive | ACT(business_id) |
| Ownership change | deny WITH CHECK |
| DELETE | deny; archive |
| Adm | no auto write business |

### 7.6 Memberships (A4.4)

Self SELECT; ACT SELECT; public §A2; INSERT self-declare; chiusura lifecycle; no DELETE; cambio ruolo → Adm/Svc (RPC futura se serve); **ruolo descrittivo ≠ grant**.

### 7.7 Authorizations (A4.5)

SELECT self/ACT/Adm; INSERT/UPDATE **deny** su CRUD authenticated; write solo RPC B1/B3; no DELETE; status granted/revoked; no autoconcessione.

### 7.8 Cataloghi foundation (A4.6)

SELECT pubblico `is_active`; write **Svc-only in v1** (Adm write catalog opzionale post-v1; A2 ammette Adm/Svc — Plan: **Svc-only** per ridurre rischio, Adm SELECT completo se utile). GRANT: mantenere SELECT; revocare write authenticated.

---

## 8. A5 Business-domain RLS

Ogni dominio = unità propria. Helper: A3.1–A3.3. Pattern: public SELECT + OwnP + ACT + owned da AR.

| Unità | Timestamp | Dominio | AR / focus |
|---|---|---|---|
| A5.1 | `20260812200000` | Mercati Internazionali | markets, presences, interests, activities, relations, needs, evidences… |
| A5.2 | `20260812210000` | Professionisti | profiles + qualifiche/servizi/territori/… |
| A5.3 | `20260812220000` | Opportunità | opportunities + sources/requirements/benefits/… |
| A5.4 | `20260812230000` | Servizi | offers + requests + owned + cataloghi servizio |
| A5.5 | `20260812240000` | Eventi | events + editions/sessions/roles/registrations + event_types |
| A5.6 | `20260812250000` | Collaborazioni | collaborations + participants (ternaria) |

### 8.1 Mercati

Persona/Impresa subject XOR; ACT per write Impresa; public per livello pubblico; no Org ownership; storico/evidences ristretti; cataloghi MI SELECT public.

### 8.2 Professionisti

Self Persona 1:1; publish profilo; owned professionali; Account ≠ certificazione; public ≤ Persona.

### 8.3 Opportunità

Ownership/party secondo Physical; publish/visibility; no ownership Contenuti; Red solo se curated esplicito (default no); owned subordinate.

### 8.4 Servizi

Offerte e Richieste separate; OwnP / ACT; publish `publication_status='published'`; owned territories/languages/sectors/markets; ritiro; DELETE deny; cataloghi categorie/bande; link Eventi = policy Eventi.

### 8.5 Eventi

Evento AR; Edizioni/sessioni/organizers/speakers/languages/markets/registrations owned; OwnP/ACT; publish+visibility; Org label ≠ diritti; DELETE deny.

### 8.6 Collaborazioni

Ternaria; promotore XOR; participants owned; snapshot membership non = grant; public via `editorial_status='published'`; Red solo `owned_by_editorial`; no matching.

---

## 9. A6 Editoriale e trasversale

| Unità | Timestamp | Contenuto |
|---|---|---|
| A6.1 | `20260812260000` | Contenuti + authors/links/tags |
| A6.2 | `20260812270000` | Organizzazioni + officials + tipi/scopes |
| A6.3 | `20260812280000` | Osservatorio indicators/sources/values |
| A6.4 | `20260812290000` | Cataloghi residui (content_*, organization_*, professional_*, opportunity_*, …) SELECT public |

### 9.1 Contenuti

Public SELECT; Red CRUD/publish/withdraw; OwnP/ACT se owner non editorial; `owned_by_editorial`; Adm **senza Red** deny write.

### 9.2 Organizzazioni

Public; OwnP; ACT; Red editorial; officials owned ≠ gestori; ownership immutabile; no membership Org; DELETE restrittivo.

### 9.3 Osservatorio

Public Indicatori/Valori; Fonte condivisibile SELECT; Red CRUD; Valore subordinato; Adm senza Red deny; no DELETE ordinario; revisioni append/supersede.

---

## 10. Policy e GRANT legacy

### 10.1 Policy (inventario definitivo)

| Tabella | Policy attuale | Comando | Classificazione | Sostituzione | Blocco |
|---|---|---|---|---|---|
| profiles | `Public can view active profiles` (storica) | SELECT | **DROP** se residua | — | A4.2 |
| profiles | `Public can view published profiles` | SELECT | **REPLACE** | `profiles_select_public` | A4.2 |
| profiles | `Users can view their own profile` | SELECT | **REPLACE** | `profiles_select_self` | A4.2 |
| profiles | `Users can update their own profile` | UPDATE | **REPLACE** | `profiles_update_self` + column GRANT | A4.2 |
| profile_languages / profile_competencies / personal_stories | public + owner `auth.uid()` | * | **REPLACE** | self/public via person helpers | A4.2 |
| profile_language_services* | owner uid | * | **REPLACE** | allineare a Persone (stesso helper) | A4.2 |
| languages / competencies / business_sectors / language_service_* / training_* catalog types | Public `is_active` | SELECT | **KEEP** (eventuale rename famiglia) | — | A4.6 |
| training_offers (+ languages/sectors/venue/…) | Public + Providers CRUD via uid | CRUD | **SKIP v1** (quarantine) | fuori 13 domini | post-v1 |
| training_requests (+ languages) | Public + Providers CRUD | CRUD | **SKIP v1** | quarantine | post-v1 |
| training_provider_qualifications | owner uid | * | **SKIP v1** | quarantine | post-v1 |
| accounts, businesses, memberships, authorizations, 13-domini AR/owned | (nessuna / deny-default) | — | **CREATE** | famiglie A2 | A4–A6 |

Nessun **REVIEW bloccante** irrisolto: training classificato **SKIP** esplicito (non blocca Access v1).

### 10.2 GRANT

| Tabella | GRANT attuale | Stato | Azione |
|---|---|---|---|
| profiles (+owned) | SELECT/UPDATE authenticated selettivo | Legacy | REVOKE incoerenti; riallineare a column privileges A2 |
| cataloghi foundation | SELECT authenticated/anon tipico | Compatibile | **KEEP** SELECT; no write |
| training_* | CRUD authenticated owner | Legacy | **KEEP** fino a quarantine dedicata (non toccare in A4–A6 salvo conflitto) |
| Domini recenti | REVOKE anon/authenticated | Corretto | **KEEP** REVOKE; aprire solo via policy |

---

## 11. Famiglie di policy

Naming A2. Ogni policy: comando singolo; soggetto singolo; `USING` / `WITH CHECK`; permissive OR; helper da A3; priorità = nessuna (OR).

Esempi foundation:

| Nome | Comando | Destinatario effettivo | Helper |
|---|---|---|---|
| `profiles_select_public` | SELECT | anon/auth | predicato inline |
| `profiles_select_self` | SELECT | auth | `access_current_person_id()` |
| `businesses_select_public` | SELECT | anon/auth | inline `publication_status` |
| `businesses_update_business` | UPDATE | auth | `access_can_act_for_business` |
| `contents_write_editorial` | INSERT/UPDATE | auth | `access_is_editor` |

---

## 12. Timestamp e dimensionamento

Base: dopo `20260811110000` → da `20260812090000`.

| Gruppo | N. migration | Range timestamp |
|---|---:|---|
| Helper A3.1–A3.3 | 3 | 090000–110000 |
| RPC A3.4 | 2 | 120000–130000 |
| Foundation A4.1–A4.6 | 6 | 140000–190000 |
| Business A5.1–A5.6 | 6 | 200000–250000 |
| Editorial A6.1–A6.4 | 4 | 260000–290000 |
| **Totale piano** | **21** | — |
| Cleanup training (opz. post-v1) | 0 in v1 | SKIP |
| M8.2 | documento | dopo apply |

Unicità: sequenza oraria 09–29 del 2026-08-12; verificare assenza collisioni in repo al momento della creazione file.

---

## 13. Ordine globale

| Ordine | Unità | Titolo | Oggetti | Dipendenze | Rischio |
|---:|---|---|---|---|---|
| 1 | A3.1 | Helpers identity | 3 fn | accounts | Medio (DEFINER) |
| 2 | A3.2 | Helpers roles | 3 fn | A3.1, role_assignments | Medio |
| 3 | A3.3 | Helpers business | 3 fn | A3.1, memberships | Medio |
| 4 | A3.4a | RPC identity | 4–5 fn | A3.1 | Alto |
| 5 | A3.4b | RPC roles/grants | 4–5 fn | A3.2–3 | Alto |
| 6 | A4.1 | Accounts/roles RLS | 2 tabelle | A3.* | Alto |
| 7 | A4.2 | Profiles REPLACE | profiles+owned | A3.1, A3.4a | Alto |
| 8 | A4.3 | Businesses | businesses+owned | A3.3 | Alto |
| 9 | A4.4 | Memberships | memberships | A3.3 | Alto |
| 10 | A4.5 | Authorizations | grants | A3.4b | Alto |
| 11 | A4.6 | Cataloghi foundation | catalogs | — | Basso |
| 12–17 | A5.1–A5.6 | Business domains | per dominio | A4 | Medio–Alto |
| 18–21 | A6.1–A6.4 | Editorial + catalogs | per dominio | A4 | Medio |
| 22 | Validazione | test locale / M8.2 doc | — | tutto | — |

---

## 14. Transizione atomica e rollback

Per tabella con legacy (soprattutto profiles):

1. REVOKE privilegi incoerenti  
2. DROP policy vecchie  
3. CREATE policy nuove  
4. Verificare RLS enabled  
5. Zero finestra permissiva  

**Una transazione per migration/unità** (dominio o tabella foundation). **Non** disabilitare RLS.

### Rollback

| Blocco | Ripristinabile pre-remoto | Dopo apply remoto |
|---|---|---|
| Helper | DROP FUNCTION | nuova migration compensativa |
| RPC | DROP FUNCTION | idem |
| Policy | DROP new + recreate old (script salvato in Plan/M8.2) | migration down documentata; **no** `migration repair` come rollback |
| Privilegi | GRANT/REVOKE inversi | idem |

Limite: dopo apply remoto multi-blocco, rollback = sequenza compensativa ordinata, non reset schema.

---

## 15. Review, test, remoto, M8

### Review gate

Helper → RPC → Foundation → ciascun A5 → A6 → review globale A1/A2/Plan/SQL → hash → `git diff --check`.

### Test locale (fixture + ROLLBACK)

Identità A2 §24; operazioni SELECT/INSERT/UPDATE/publish/withdraw/DELETE; self-elevate/self-grant; cross-business; owned; catalog write deny; service_role bypass.

### Remoto

Dry-run solo post suite locale verde; elenco exact 21 migration; history; apply per blocco autorizzato; verifica catalogo (policy counts, helper, REVOKE); **zero fixture remote**; poi M8.2.

### M8.1 / M8.2

* **M8.1:** SKIP (nessun seed pubblico Account/ruoli).  
* Bootstrap Adm: procedura Svc/SQL controllata **fuori** migration pubbliche.  
* **M8.2:** `docs/architecture/migrations/access-rls-m8.2-validation-report.md` (nome definitivo al momento della chiusura).

### L1.3-M3 / M4 (post Access v1)

* M3 SQL: `20260817100000_create_self_service_account_deletion.sql` — **APPLIED** local+remote.
* M4 SQL: `20260818100000_create_management_reassignment_cases.sql` — cases + resolve; **replaces** M3 self-delete RPCs for orphans; **APPLIED** local+remote.
* Apply order used: **M3 → M4**. Validation: `l1.3-m3-m4-implementation-validation-report.md`.
* No auto-owner. Officials ≠ ownership.

---

## 16. Elementi esclusi

Membership Org; deleghe; consensi; matching; Account servizio tipizzato; audit avanzato; trigger ultimo Adm/gestore (**partially superseded by M3 refuse guards; M4 still required for reassignment**); override emergenziale; workflow verifica; nuove entità/ruoli; modifica contratti dominio; training reopen in v1.

---

## 17. Readiness

| Voce | Stato |
|---|---|
| Helper definitivi | 9 — CREATE A3.1–3 |
| RPC obbligatorie | §6 — CREATE A3.4 |
| Legacy classificate | REPLACE profiles; KEEP catalogs; SKIP training |
| REVIEW bloccanti | Nessuno |
| Unità | 21 migration timestampate |
| Ordine | Aciclico helper→RPC→A4→A5→A6 |
| SQL in questo task | Nessuno |

**Prossimo passo autorizzato:** creazione SQL helper A3.1 (prima unità).

---

**Migration Plan Access/RLS v1 completo.**
