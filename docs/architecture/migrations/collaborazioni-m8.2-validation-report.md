# Collaborazioni — Validation Report (M8.2)

## 1. Esito

**`ACCETTATA`**

Chiusura tecnica del ciclo 1 del dominio **Collaborazioni**: Logical revisionato, Physical DDL-ready, Migration Plan, M1.1 e M2.1 applicati e validati in locale, dry-run remoto positivo, apply remoto controllato riuscito, senza drift di migration history.

**CICLO 1 COLLABORAZIONI VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**

---

## 2. Perimetro validato

| Artefatto | Path |
|---|---|
| Logical (revisionato) | `docs/architecture/logical/collaborazioni.md` |
| Physical (DDL-ready) | `docs/architecture/physical/domain-mapping/collaborazioni.md` |
| Migration Plan | `docs/architecture/migrations/collaborazioni-migration-plan.md` |
| M1.1 `collaborations` | `supabase/migrations/20260810090000_create_collaborations.sql` |
| M2.1 `collaboration_participants` | `supabase/migrations/20260810100000_create_collaboration_participants.sql` |
| M8.2 | questo documento |

M3–M7: **assenti**. M8.1: **SKIP** (nessun seed dimostrativo).

---

## 3. Migration

| Unità | Timestamp | Tabella | Stato locale | Stato remoto |
| ----- | --------- | ------- | ------------ | ------------ |
| M1.1 | `20260810090000` | `collaborations` | Applicata | Applicata |
| M2.1 | `20260810100000` | `collaboration_participants` | Applicata | Applicata |

Head locale = head remoto = **`20260810100000`**. Pending = **0**.

---

## 4. Modello implementato

* `public.collaborations` è l’Aggregate Root del dominio.
* La scheda è **dichiarativa**: non è contratto, non è relazione attiva, non è workflow di matching.
* `public.collaboration_participants` è tabella subordinata (owned) dell’AR, riservata alle controparti indicate.
* Il promotore è incorporato nell’AR (`promoter_person_id` XOR `promoter_business_id`).
* Controparti indicate: cardinalità **0..N**.
* Organizzazioni **non strutturali** nel ciclo 1 (né owner, né promotore, né partecipante).
* Nessuna relazione Account–Collaborazione.
* Nessuna membership posseduta dal dominio Collaborazioni.

---

## 5. Ownership

* Titolare: **Persona XOR Impresa XOR Redazione** (`owner_person_id` / `owner_business_id` / `owned_by_editorial`).
* Nessun Account come owner.
* Nessun riferimento a `auth.users` come owner.
* Nessuna Organizzazione come owner.
* Autore della registrazione (`registered_by_person_id`) distinto da owner e da promotore.

---

## 6. Autore e promotore

* `registered_by_person_id` **NOT NULL**.
* FK verso `public.profiles(id)`.
* `ON DELETE RESTRICT`.
* Promotore: **Persona XOR Impresa**.
* Esattamente un promotore (CHECK XOR sull’AR).
* Nessun promotore esterno e nessuna Organizzazione come promotore.

---

## 7. Forma e contenuti

* Cinque forme chiuse: `ricerca`, `offerta`, `partnership`, `progetto`, `disponibilita_aperta`.
* Campi obbligatori tipizzati: titolo, oggetto (`object_text`), finalità (`purpose_text`).
* Descrizione e campi opzionali testuali con blank guard dove previsto.
* `slug` **UNIQUE** con pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
* Assenza di JSON, metadata generici, documenti e recapiti nel ciclo 1.

---

## 8. Lifecycle

Quattro assi indipendenti:

* **Editoriale:** `draft` | `published` | `withdrawn`
* **Operativo:** `open` | `closed` | `cancelled`
* **Esito:** `not_reported` | `positive` | `negative` | `partial`
* **Archiviazione:** `archived_at` (nullable)

Publication gates effettivamente presenti in DDL e esercitati in validazione runtime locale:

* `draft` ⇒ `published_at` NULL e `withdrawn_at` NULL;
* `published` ⇒ `published_at` NOT NULL e `withdrawn_at` NULL;
* `withdrawn` ⇒ `withdrawn_at` NOT NULL;
* gate operativi correlati a `closed_at` / `cancelled_at` per `closed` / `cancelled`.

---

## 9. Appartenenza e snapshot

* `acting_membership_id` opzionale.
* FK verso `public.business_memberships(id)`.
* `ON DELETE SET NULL`.
* Snapshot conservato in `acting_title_snapshot`.
* Legittimazione Impresa derivata da Appartenenze (riferimento opzionale, non ownership).
* Nessuna membership owned dal dominio Collaborazioni.

---

## 10. Partecipanti

* Soggetto: **Persona XOR Impresa**.
* Solo ruolo `indicated_counterpart` (DEFAULT + CHECK).
* Controparti **0..N**.
* UNIQUE parziali su `(collaboration_id, person_id)` e `(collaboration_id, business_id)`.
* `ON DELETE CASCADE` da `collaborations`.
* Invariante applicativa **promotore ≠ controparte**: non imposta da trigger/SQL cross-table nel ciclo 1.

---

## 11. Apply locale

* Comando: `supabase migration up --local`
* Exit code: `0`
* Migration applicate: M1.1 poi M2.1
* Head locale: `20260810100000`

---

## 12. Validazione runtime

Eseguita in locale dentro transazione con rollback:

* **66/66** test PASS
* Copertura verificata: ownership; autore; promotore; forma; contenuti; slug; lifecycle; Appartenenza e snapshot; partecipanti; CASCADE e RESTRICT; trigger `updated_at`; RLS e privilegi
* Rollback completo; assenza di fixture residue

---

## 13. Dry-run remoto

* Comando: `supabase db push --linked --dry-run`
* Exit code: `0`
* Proposte esattamente:
  1. `20260810090000_create_collaborations.sql`
  2. `20260810100000_create_collaboration_participants.sql`
* Nessuna migration inattesa
* Remoto invariato dopo il dry-run (head ancora `20260809100000` prima dell’apply)

---

## 14. Apply remoto

* Comando: `supabase db push --linked --yes`
* Exit code: `0`
* Ordine: M1.1 → M2.1
* Head remoto: `20260810100000`
* Pending: `0`

---

## 15. Verifica remota

Verifica read-only post-apply:

* `public.collaborations` e `public.collaboration_participants` presenti
* Conteggi entrambi `0`
* `collaborations`: **30** colonne
* Ownership XOR ternaria presente
* Promotore XOR presente
* Autore FK `ON DELETE RESTRICT`
* Membership FK `ON DELETE SET NULL`
* Partecipanti FK `ON DELETE CASCADE`
* UNIQUE parziali Persona/Impresa presenti
* Trigger: `collaborations_set_updated_at`, `collaboration_participants_set_updated_at`
* Assenza indici non autorizzati su `outcome_status` e `acting_membership_id`

---

## 16. Sicurezza

* RLS abilitata su entrambe le tabelle
* FORCE RLS disattivata
* Zero policy
* Zero privilegi a `PUBLIC`, `anon`, `authenticated`
* Funzioni trigger `SECURITY INVOKER` con `search_path = ''`
* Deny-by-default

---

## 17. Confini confermati

Assenti nel ciclo 1 Collaborazioni:

* Organizzazioni strutturali
* Account
* riferimenti a `auth.users`
* Professionisti
* Opportunità
* Eventi
* Servizi
* Mercati
* Contenuti
* manifestazioni
* candidature
* inviti
* matching
* accordi preliminari
* cataloghi
* seed
* policy applicative
* documenti
* Storage
* CRM
* HR
* contratti
* pagamenti
* reputazione
* M3–M7
* M8.1

---

## 18. Warning

Classificati come **non bloccanti** (exit code apply `0`, entrambe le migration applicate, head remoto `20260810100000`, pending `0`, verifica minima remota superata):

* rumore PowerShell `NativeCommandError` su messaggi informativi CLI
* warning cache `pg-delta` in fase di apply remoto
* certificato cache mancante (`pgdelta-target-ca.crt` ENOENT)
* directory temporanea `supabase/.temp/pgdelta` rimossa dopo l’apply
* warning Git LF/CRLF sui markdown Collaborazioni
* nessun impatto sull’esito dell’apply remoto

---

## 19. Hash finali

| Migration | SHA-256                                                            |
| --------- | ------------------------------------------------------------------ |
| M1.1      | `B7463AEEC660520AA9A1AEE1D1F282BD511396D59C9F08524909CA3678702284` |
| M2.1      | `D8B53D4906996E50FBD96E6D7EF0374837C63FA1B954194E337D5E6BC6C4AAC9` |

---

## 20. Decisione

**CICLO 1 COLLABORAZIONI VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**
