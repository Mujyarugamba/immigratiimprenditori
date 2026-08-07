# Application Access / RLS v1 — M8.2 Validation Report

**Status:** CLOSED  
**Scope:** Access/RLS v1 (helpers, RPCs, foundation/domain RLS, ownership guard, ACL harden)  
**DB head (local = remote):** `20260812300000`  
**Pending migrations:** `0`  
**Git baseline before closure commit:** `420c1458533e1b55f0f111a55356d5710c43494a`  
**Architecture tag (pre-Access):** `v0.2.0-db-architecture-v1`  
**Closure tag (this cycle):** `v0.3.0-db-access-rls-v1`

Questo report certifica **solo verifiche realmente eseguite** nel ciclo Access/RLS v1. Non dichiara il sistema “production-ready” oltre a quanto già previsto da A1/A2.

---

## 1. Perimetro certificato

| Artefatto | Ruolo |
|---|---|
| A1 `application-access-model-v1.md` | Semantica autorizzativa |
| A2 `application-access-physical-v1.md` | Contratto tecnico RLS/RPC/privilegi |
| Migration Plan `application-access-migration-plan-v1.md` | Perimetro e ordine migration |
| A3.1–A3.3 | 9 helper SECURITY DEFINER |
| A3.4 | 8 RPC identity/business |
| A4 | Foundation RLS (accounts, profiles, businesses, memberships, authorizations, catalogs) + ownership guard |
| A5 | Business domains RLS (MI, Professionisti, Opportunità, Servizi, Eventi, Collaborazioni) |
| A6 | Editorial/transversal (Contenuti, Organizzazioni, Osservatorio, residual catalogs) |
| A7 | Runtime integrato locale 68/68 |
| ACL corrective | `20260812300000` harden EXECUTE privileges |

**Fuori perimetro v1 (non introdotto):** membership Organizzazioni, deleghe, consensi, matching Collaborazioni, audit avanzato, last-admin/last-manager DB enforcement, training Access rewrite, Storage/FEV/feed/dataset.

---

## 2. Migration Access (22)

Ordine applicato locale e remoto:

| # | Version | Responsabilità |
|---|---|---|
| 1 | `20260812090000` | Identity helpers |
| 2 | `20260812100000` | Role helpers |
| 3 | `20260812110000` | Business context helpers |
| 4 | `20260812120000` | Identity RPCs |
| 5 | `20260812130000` | Business management RPCs |
| 6 | `20260812140000` | Accounts / roles RLS |
| 7 | `20260812150000` | Profiles RLS |
| 8 | `20260812160000` | Businesses RLS |
| 9 | `20260812170000` | Memberships RLS |
| 10 | `20260812180000` | Business authorizations RLS |
| 11 | `20260812190000` | Foundation catalogs RLS + ownership guard |
| 12 | `20260812200000` | Mercati internazionali RLS |
| 13 | `20260812210000` | Professionisti RLS |
| 14 | `20260812220000` | Opportunità RLS |
| 15 | `20260812230000` | Servizi RLS |
| 16 | `20260812240000` | Eventi RLS |
| 17 | `20260812250000` | Collaborazioni RLS |
| 18 | `20260812260000` | Contenuti RLS |
| 19 | `20260812270000` | Organizzazioni RLS |
| 20 | `20260812280000` | Osservatorio RLS |
| 21 | `20260812290000` | Residual catalogs RLS |
| 22 | `20260812300000` | Harden Access function EXECUTE privileges |

---

## 3. Helper (9)

Certificato a catalogo locale e remoto:

- `access_current_account_id()`
- `access_current_person_id()`
- `access_is_active_account()`
- `access_has_active_application_role(text)`
- `access_is_editor()`
- `access_is_application_admin()`
- `access_has_active_business_membership(uuid)`
- `access_has_granted_business_management(uuid)`
- `access_can_act_for_business(uuid)`

**Sicurezza:** tutte `SECURITY DEFINER` con `search_path=''`.

**ACL finale (post-`20260812300000`):**

| Role | EXECUTE |
|---|---|
| PUBLIC | no |
| anon | sì |
| authenticated | sì |
| service_role | no |

---

## 4. RPC (8)

| RPC | Attori EXECUTE finali | Note verificate |
|---|---|---|
| `access_provision_account(uuid)` | service_role only | Nessuna Persona/ruolo/grant automatici; body rifiuta non-Svc |
| `access_link_person(uuid,uuid)` | authenticated, service_role | Self / Adm / Svc secondo contratto; no appropriazione Account altrui |
| `access_close_account(uuid)` | authenticated, service_role | Soft close; no DELETE Auth/Account/Persona; idempotenza verificata in A7 |
| `assign_application_role(uuid,text)` | authenticated, service_role | Whitelist; no self-elevate; Adm ≠ Red |
| `revoke_application_role(uuid)` | authenticated, service_role | Revoca/riattivazione via status |
| `access_bootstrap_business_grant(uuid)` | authenticated, service_role | Solo Adm/Svc; ordinario negato |
| `grant_business_management(uuid)` | authenticated, service_role | B3; no self-grant |
| `revoke_business_management(uuid)` | authenticated, service_role | Revoca/autorevoca secondo contratto |

**Certificato:** nessuna RPC write Access con EXECUTE `anon`; nessun PUBLIC EXECUTE su funzioni Access.

---

## 5. Ownership guard

### Problema (A7)

Policy UPDATE permissive separate (owner Persona / owner Impresa) in OR consentivano uno switch XOR di ownership: USING su un ramo + WITH CHECK sull’altro.

### Fix

In `20260812190000` (A4.6 finale):

- funzione `access_reject_owner_cols_mutation()` — `SECURITY DEFINER`, `search_path=''`
- 11 trigger `access_reject_owner_mutation` sugli AR XOR / subject XOR / professional_profiles
- rifiuto mutazione colonne owner con SQLSTATE `42501`

**Hash finale A4.6:**  
`D65ED24095234722F1A85CC01D27AB6FF47A132528641AA5BA487F85F325694D`

**ACL guard (post-harden):** nessun EXECUTE applicativo (`PUBLIC`/`anon`/`authenticated`/`service_role` = no); trigger interni operativi.

---

## 6. A7 — runtime integrato locale

Eseguito e certificato:

1. Apply cumulativo locale A3.4→A6 fino a head `20260812290000`
2. Suite runtime trasversale in `BEGIN…ROLLBACK`
3. Fallimento iniziale ownership XOR → correzione A4.6 → `supabase db reset --local` → retest
4. **68/68 assertion passate — 0 fallite**
5. Fixture residue: 0

Invarianti runtime dimostrati (tra gli altri): Auth ≠ Account ≠ Persona; Adm ≠ Red; CTX ≠ ACT; no self-elevate; no self-grant; training quarantine; profiles non mappati `auth.uid() = id`.

---

## 7. Dry-run remoto cumulativo (blocco 21)

Comando: `npx --yes supabase@2.109.1 db push --linked --dry-run`

- Proposte: **esattamente 21** migration `20260812090000`→`20260812290000`
- Estranee: 0
- Mancanti: 0
- Exit code: 0
- Remoto invariato a `20260811110000` al momento del dry-run

---

## 8. Apply remoto cumulativo (blocco 21)

Comando: `npx --yes supabase@2.109.1 db push --linked --yes`

- Applicata: **21/21**
- Exit code: 0
- Head remoto post-apply: `20260812290000`
- Pending: 0
- Catalogo remoto: 9 helper, 8 RPC, owner guard, 11 trigger, 529 policy, training 36 senza policy Access
- Warning non bloccante: cache `pgdelta` (ENOENT cert) post-push

---

## 9. Divergenza ACL (bloccante, poi corretta)

Dopo l’apply remoto delle 21 migration:

- Su hosted, `CREATE FUNCTION` riceveva EXECUTE espliciti per default su `anon` / `authenticated` / `service_role`
- Le migration Access facevano solo `REVOKE … FROM PUBLIC`, insufficiente
- Risultato: ACL remoto più permissiva del contratto (es. `access_provision_account` eseguibile a catalogo da anon/authenticated)
- Defense-in-depth nel body RPC restava attiva, ma la **coerenza catalogo** era bloccante per la chiusura

La chiusura Git/M8.2 è stata **negata** fino alla migration correttiva.

---

## 10. Migration ACL correttiva

File: `20260812300000_harden_access_function_execute_privileges.sql`  
Hash: `E06A3DD5914EBAE0AA3BFFD4456856C1B05B34671DDD409A3944263DA8CB0C1C`

Contenuto: solo `REVOKE ALL … FROM PUBLIC, anon, authenticated, service_role` + `GRANT EXECUTE` mirati sulle 18 funzioni Access.

Verifiche eseguite:

| Step | Esito |
|---|---|
| Apply locale | head `20260812300000` |
| Suite ACL mirata | **31/31** |
| Matrice locale | **18/18** |
| Dry-run remoto | solo `20260812300000` |
| Apply remoto | exit 0 |
| Matrice remota | **18/18**, `provision` solo `service_role`, no anon su RPC write |
| Pending | 0 |

---

## 11. Invarianti di dominio (certificati nel ciclo)

- Auth ≠ Account ≠ Persona
- Account ≠ ownership sostanziale dei fatti di dominio
- Adm ≠ Red
- CTX ≠ ACT (`membership` attiva ≠ management grant)
- membership ≠ management authorization
- ruolo descrittivo membership ≠ diritto ACT
- `organization_official` ≠ amministrazione Organizzazione
- participant/speaker Evento ≠ gestione Evento
- Collaborazione ≠ Appartenenza
- Contenuto ≠ ownership dei fatti referenziati
- Fonte Osservatorio condividibile (non subordinata a un solo Indicatore)
- deny-by-default su Account/grant sensibili
- training quarantine invariata (36 policy legacy; 0 Access su `training_*`)
- nessun self-elevate ruolo
- nessun self-grant management
- nessun ownership switch (guard + WITH CHECK)

---

## 12. Stato sicurezza finale (catalogo)

| Metrica | Valore |
|---|---|
| Policy `public` | 529 |
| Policy `training_*` | 36 (legacy) |
| Policy Access su `training_*` | 0 |
| Helper Access | 9 |
| RPC Access | 8 |
| Owner guard function | 1 |
| Owner guard triggers | 11 |
| ACL locale = remoto | sì (18/18) |
| `access_provision_account` EXECUTE | solo `service_role` |
| RPC write Access EXECUTE `anon` | nessuna |
| PUBLIC EXECUTE Access | nessuno |

RLS abilitata sulle tabelle Access interessate; FORCE invariato rispetto al contratto applicato (es. `accounts` RLS ON, FORCE OFF — come locale).

---

## 13. Limiti residui (post-v1, non bloccanti)

- Membership Organizzazioni
- Deleghe / multi-sede / grafo Org–Org
- Consensi
- Matching Collaborazioni
- Audit avanzato
- Last-admin / last-manager protection a DB
- Training Access/RLS rewrite (quarantena mantenuta)
- Storage / FEV / feed / dataset / ETL Osservatorio
- Eventuali consolidamenti futuri già rinviati da A1/A2/Plan

---

## 14. Hash SHA-256 (chiusura)

| Artefatto | SHA-256 |
|---|---|
| A1 model | `FC491AF053D4C6103DFA2BCC89BE9A264594D7E3C50029F8B0BC8B39AC013A2B` |
| A2 physical | `9CCD5C1159B99E6795A88A125A64EF4A90F3207D94DAA482EECFB2C3133736BF` |
| Migration Plan | `FF98589F2823A0D243527F790E0394955470586F84F4664C6482A760D7ADC94B` |
| A3.1 `090000` | `04077534C75F595D1C3F8ED3231D18E5B1345DEA4FBF94B4415E79B8657D51C2` |
| A3.2 `100000` | `5BD0269409C39FDAD54F51CDEEAE5A4DB463BFA4CCD45FF56CD84FCD435EA424` |
| A3.3 `110000` | `6FC748EA1D7AC3206473B9058BF2E2A6F9F744150CBD6A62D82CCB42F98E4538` |
| A3.4a `120000` | `B91404ABEC6E1F6DF8DAAFC09E4C6EC63131BCCC21E42298F2FD75A0FA906F61` |
| A3.4b `130000` | `218C51A5282203A63FCE97F7B5321950EE86EF1C0F1C350D26AAA20CBDCD9962` |
| A4.1 `140000` | `0B18B6FB9458BC419927978F7D20ACA09498517C961DC4FB1652DE74FD039392` |
| A4.2 `150000` | `AD208E230C3DA7061F6B6AD63BCBD509D7B4B5F4DEFE2ED7B4867111E27DD7CB` |
| A4.3 `160000` | `442DB2F2B804E92F1EEE1610A7A118C8CE2ADAD30372B2551F8B33B7BCD0D547` |
| A4.4 `170000` | `DE4372E207052680AE6A1F86FD22D299D1F2379E696712D00A78ACD8877BAFBC` |
| A4.5 `180000` | `E587B8B4B3FEAAA9BC075AB117974C4FFE8C24F5C0F5866D7F3FC52AA4634AF0` |
| A4.6 `190000` | `D65ED24095234722F1A85CC01D27AB6FF47A132528641AA5BA487F85F325694D` |
| A5.1 `200000` | `170B99B60FB4A73B47484F9C2484B8A872592F4470D9581A513525F7B81C9302` |
| A5.2 `210000` | `26C45BB9C43E5783F906ED0BCFAF16448398CE16ACA4601C2AD5B68B81A0A169` |
| A5.3 `220000` | `7D0B35FB876646C7163E7F067E19A30E2465D23E58B83A3EDEBFBBAAE59B3F80` |
| A5.4 `230000` | `102E5FFC663299603D122027E92CD1F5DDFD0718E06582AD9BBFE69920A66393` |
| A5.5 `240000` | `029470A4FB7533DE8C2C07B4B22EF440BEB42C24D3F5CABA2BC9F890B637AC98` |
| A5.6 `250000` | `CDEDE0F1E64938CBBFC16663729CC86FC86FC9A7804AE6B0B8B478087100A4D4` |
| A6.1 `260000` | `65C50708EDDE419A27170F9E1540BD817C00CFA8A37BF92385C7B95F072F1485` |
| A6.2 `270000` | `C3943A290F6293CE31FEDB79E7C5B43FA64CBA751FF6C8327E81D22486F227AC` |
| A6.3 `280000` | `9A0B82775E50F0A40FFB9E8D24791F5E451062CFD31E0CFDB22411E0643EB52A` |
| A6.4 `290000` | `E41FB4D1507BA4EB6289AA3FE458B3225190B4551FD7AC4A62A7E899F7A35036` |
| ACL `300000` | `E06A3DD5914EBAE0AA3BFFD4456856C1B05B34671DDD409A3944263DA8CB0C1C` |

Hash di **questo** file M8.2: calcolato al momento del commit di chiusura e registrato nello stato Git.

---

## 15. Decisione M8.2

Access/RLS v1 è **validato e chiuso** sul piano documentale, SQL, runtime locale, apply remoto e ACL catalogo.

**DB:** locale = remoto = `20260812300000`, pending `0`.  
**Git:** commit di chiusura + tag `v0.3.0-db-access-rls-v1` (vedi commit message del ciclo di chiusura).
