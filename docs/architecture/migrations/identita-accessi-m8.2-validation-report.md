# Identità & Accessi — Validation Report (M8.2)

## 1. Esito

**`ACCETTATA`**

Chiusura tecnica del ciclo 1 del dominio **Identità & Accessi**: schema validato staticamente e in runtime locale, pubblicato sul database remoto, senza drift di migration history.

**CICLO 1 IDENTITÀ & ACCESSI VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**

---

## 2. Perimetro validato

| Artefatto | Path |
|---|---|
| Logical (revisionato) | `docs/architecture/logical/identita-accessi.md` |
| Physical | `docs/architecture/physical/domain-mapping/identita-accessi.md` |
| Migration Plan | `docs/architecture/migrations/identita-accessi-migration-plan.md` |
| M1.1 | `supabase/migrations/20260809090000_create_accounts.sql` |
| M2.1 | `supabase/migrations/20260809100000_create_account_role_assignments.sql` |
| M8.2 | questo documento |

M3–M7: **assenti**. M8.1: **SKIP** (nessun seed dimostrativo).

---

## 3. Migration

| Unità | Timestamp | Tabella | Stato locale | Stato remoto |
|---|---|---|---|---|
| M1.1 | `20260809090000` | `accounts` | Applicata | Applicata |
| M2.1 | `20260809100000` | `account_role_assignments` | Applicata | Applicata |

Head locale (al momento dell’apply locale) = head remoto = **`20260809100000`**. Pending = **0**.

---

## 4. Modello implementato

* `public.accounts` è l’Aggregate Root del dominio.
* Account è distinto da `auth.users` (utente tecnico) e da `public.profiles` (Persona).
* `public.account_role_assignments` è tabella subordinata (owned) dell’Account.
* Contesto Organizzazione **non operativo** nel ciclo 1.
* Nessuna relazione Account–Impresa persistita.
* Nessuna membership posseduta da Identità & Accessi.

---

## 5. Contratto Account–Auth

* `auth_user_id` **NOT NULL UNIQUE**.
* FK verso `auth.users(id)`.
* `ON DELETE CASCADE`.
* Nessuna duplicazione di email, password, provider, token, MFA o sessioni Auth.
* Nessun trigger Identità su `auth.users` (resta solo il trigger legacy Persone `on_auth_user_created`).

---

## 6. Contratto Account–Persona

* `person_id` nullable **UNIQUE**.
* FK verso `public.profiles(id)`.
* `ON DELETE SET NULL`.
* Account `0..1` Persona; Persona `0..1` Account ordinario.
* Stato `active` ammesso solo con Persona associata (CHECK).
* Nessuna creazione automatica della Persona da Identità.

---

## 7. Normalizzazione unlink Persona

Questione rilevata in review indipendente e risolta **prima** dell’apply:

| Fonte iniziale | Problema |
|---|---|
| Physical §9 | Attribuiva la demote `active`→`limited` all’«applicazione» |
| Physical §20 | Autorizzava solo trigger `updated_at` |
| SQL | Includeva già `accounts_clear_person_association` |

**Contratto finale riallineato** (Physical §20.2, Plan M1.1, commenti SQL):

* trigger `accounts_clear_person_association` **BEFORE UPDATE** su `accounts`;
* su rimozione Persona (`person_id` → NULL, incl. FK `ON DELETE SET NULL`):
  * `person_id` azzerato;
  * campi companion (`person_association_status`, `person_linked_at`) azzerati;
  * se `active` → `limited`;
  * Account conservato;
  * assegnazioni ruolo conservate.

Non è una difformità residua.

---

## 8. Lifecycle

Stati ciclo 1: `registered` | `active` | `limited` | `suspended` | `disabled` | `closed`.

Documentato e verificato:

* gate temporali (`activated_at`, `suspended_at`, `disabled_at`, `closed_at`);
* `active` richiede Persona;
* permanenza dei timestamp storici one-way;
* riattivazione da `suspended` e `disabled`;
* terminalità di `closed` come **regola semantica**, non completamente imposta da CHECK DDL.

---

## 9. Ruoli applicativi

* Persistiti: `redattore`, `amministratore_applicativo`.
* `account_registrato`: **derivato**, non persistito.
* UNIQUE `(account_id, role_code)`.
* Stato `active` \| `revoked` con gate `revoked_at`.
* Riassegnazione mediante riattivazione della stessa riga (`revoked` → `active`).

---

## 10. Apply locale

| Voce | Valore |
|---|---|
| Comando | `supabase migration up --local` |
| Exit code | `0` |
| Migration applicate | 2/2 nell’ordine M1.1 → M2.1 |
| Head locale | `20260809100000` |

---

## 11. Validazione runtime

Test eseguiti in transazione con `ROLLBACK` (nessuna fixture residua). Superati:

* Account con Auth valido;
* Auth inesistente rifiutato;
* unicità `auth_user_id`;
* unicità `person_id`;
* `active` senza Persona rifiutato;
* cancellazione Persona e normalizzazione (companion + demote);
* cancellazione Auth con CASCADE Account;
* CASCADE sui ruoli;
* sei stati lifecycle e gate temporali;
* ruoli ammessi e ruoli vietati (`account_registrato`, `moderatore`, arbitrari);
* revoca e riattivazione;
* trigger `updated_at` (overwrite stamp forzato; `now()` costante in transazione);
* RLS e privilegi (deny anon/authenticated);
* rollback e assenza di fixture residue.

---

## 12. Dry-run remoto

| Voce | Valore |
|---|---|
| Comando | `supabase db push --linked --dry-run` |
| Exit code | `0` |
| Migration proposte | Esattamente 2 (M1.1, M2.1) |
| Migration inattese | Nessuna |
| Remoto | Invariato |

---

## 13. Apply remoto

| Voce | Valore |
|---|---|
| Comando | `supabase db push --linked --yes` |
| Exit code | `0` |
| Ordine | M1.1 → M2.1 |
| Head remoto | `20260809100000` |
| Pending | `0` |

Progetto remoto: `hvfvfatlaspcpszgizhg`.

---

## 14. Verifica remota

Verificata sul database remoto dopo l’apply:

* `public.accounts` presente;
* `public.account_role_assignments` presente;
* conteggi entrambi a `0`;
* 13 colonne su `accounts`;
* FK Auth `ON DELETE CASCADE`;
* FK Persona `ON DELETE SET NULL`;
* FK ruoli `ON DELETE CASCADE`;
* tre trigger;
* sei stati Account;
* due ruoli elevati;
* CHECK e UNIQUE presenti.

---

## 15. Sicurezza

* RLS abilitata su entrambe le tabelle;
* FORCE RLS disattivata;
* zero policy;
* zero privilegi a `PUBLIC`, `anon`, `authenticated`;
* funzioni trigger `SECURITY INVOKER`;
* `search_path = ''`;
* deny-by-default.

---

## 16. Confini confermati

Assenti nel ciclo 1:

Account–Impresa; Account–Organizzazione; Deleghe; Consensi; sessioni; dispositivi; token; OAuth; MFA; password; cataloghi ruoli; seed; policy applicative; trigger Identità su `auth.users`; M3–M7; M8.1.

---

## 17. Warning

Classificati come **non bloccanti**:

* rumore PowerShell `NativeCommandError`;
* avviso aggiornamento CLI;
* warning cache `pg-delta` / Docker Desktop non raggiungibile per la sola cache;
* directory temporanea successivamente rimossa;
* nessun impatto sull’apply remoto (exit code `0`, head e pending corretti).

---

## 18. Hash finali

| Migration | SHA-256 |
|---|---|
| M1.1 | `910BEBC3215DEFFA16A7E0F3072EAE7D124CB79BFBF0A134CA7549BFE6AB9BD4` |
| M2.1 | `6C5A4611A1A4A1B8D06515624C225555AECA3E03C3B8BED51C00CCF6219A66E1` |

---

## 19. Decisione

**CICLO 1 IDENTITÀ & ACCESSI VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**
