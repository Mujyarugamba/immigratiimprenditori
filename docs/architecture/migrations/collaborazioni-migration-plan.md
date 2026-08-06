# Collaborazioni — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica Logical né Physical.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/collaborazioni.md`.
**Contratto logico vincolante:** `docs/architecture/logical/collaborazioni.md` (§8.0, §15.A–§15.D).

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi. Non reinterpretare il Physical. In contrasto interno al Logical, prevale §15.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Collaborazioni** |
| Artefatto | Migration Plan ciclo 1 |
| Repository | `C:/Users/151702/Desktop/PROGETTI-WEB/immigrati-imprenditori` |
| Branch | `main` |
| HEAD di riferimento (pre-SQL) | `3dd8270723ac5b3ebe12341aa8795a83daa6ed33` |
| `origin/main` | Coincide con HEAD (ahead 0 / behind 0) |
| Ultima migration repository | `20260809100000` (Identità M2.1) |
| SQL Collaborazioni | **Assenti** (da creare dopo approvazione Plan) |
| Stato | **Chiuso per creazione cumulativa M1–M2 (2 unità)** |

---

## 2. Scopo

Trasformare Logical e Physical Collaborazioni in roadmap operativa DDL-ready del ciclo 1:

* scheda dichiarativa pubblicabile (non percorso interesse / fase relazionale);
* **2 unità SQL** (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* modalità **accelerata cumulativa**;
* test statici/runtime, apply locale/remoto, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. L’azione autorizzabile successiva è la **creazione contemporanea delle 2 migration**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/collaborazioni.md` | Contratto DDL-ready |
| 2 | `logical/collaborazioni.md` (§8.0, §15.A–§15.D) | Semantica ciclo 1 |
| 3 | Migration Plan Identità & Accessi / Organizzazioni | Pattern operativi |
| 4 | Validation report domini chiusi | Criteri M8.2 |
| 5 | Migration SQL `profiles`, `businesses`, `business_memberships*`, pattern RLS/`updated_at` | Dipendenze e pattern tecnici |
| 6 | `domain-dependency-map.md` §9, D19–D23, V10 | Dipendenze; assenza cicli |
| 7 | `domain-model.md` / reconciliation | Confini vs Opportunità / Appartenenze |

**Contraddizioni Logical ↔ Physical:** nessuna materiale sul ciclo 1. Plan creatibile senza nuove decisioni semantiche.

---

## 4. Stato iniziale verificato (pre-Plan)

| Verifica | Esito |
|---|---|
| Repository corretto | Sì |
| Branch `main` | Sì |
| HEAD = `origin/main` | Sì (`3dd8270…`) |
| Ahead / behind | 0 / 0 |
| Logical Collaborazioni modificato | Sì (`M`) — non toccato da questo Plan |
| Physical Collaborazioni modificato | Sì (`M`) — non toccato da questo Plan |
| Altri file modificati / untracked | Nessuno oltre Logical + Physical Collaborazioni |
| `supabase/.temp/pgdelta` | Assente |
| Ultimo timestamp migrations | `20260809100000` |
| Timestamp previsti `20260810090000` / `20260810100000` | **Liberi** (0 collisioni) |
| Migration Collaborazioni esistenti | Nessuna |

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
| Dipendenze strutturali | `public.profiles`; `public.businesses`; `public.business_memberships` |
| Head migration | ≥ `20260809100000` |
| Nessuna collision timestamp `20260810*` | Verificata al Plan |
| Nessuna migration Collaborazioni | Verificata |
| Domini chiusi intatti | Nessuna modifica SQL/Physical di altri domini da questo Plan |
| Nessun `.temp` estraneo | Ok (`pgdelta` assente) |
| Nessun trigger Collaborazioni su altri domini | Prescritto |
| Nessuna modifica a `profiles` / `businesses` / `business_memberships` | Prescritto |

---

## 7. Perimetro ciclo 1

### 7.1 Incluso

| # | Tabella | Unità |
|---|---|---|
| 1 | `collaborations` | M1.1 |
| 2 | `collaboration_participants` | M2.1 |

### 7.2 Escluso (nessuna migration)

Cataloghi; seed; manifestazioni di interesse; candidature; inviti; abbinamenti; accordi preliminari; fase relazionale; matching; tipologie ampie; Professionisti; Opportunità; Mercati; Eventi; Servizi; Contenuti; partecipazione strutturale Organizzazioni; Account–Collaborazione; policy RLS applicative; trigger su altri domini; documenti; Storage; CRM; HR; contratti; pagamenti; reputazione; M3–M7; M8.1.

---

## 8. Inventario Physical → unità

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `collaborations` | Aggregate Root | **M1.1** |
| 2 | `collaboration_participants` | Entity owned (controparti indicate) | **M2.1** |

**2/2 tabelle. Nessuna tabella extra.**

---

## 9. Dipendenze

### 9.1 Strutturali (generano FK in SQL)

| Unità | Target | PK | Uso | ON DELETE (Physical) | Disponibilità |
|---|---|---|---|---|---|
| M1.1 | `public.profiles` | uuid | owner / promoter / registered_by | **RESTRICT** | `20260718103949` (+ estensioni) |
| M1.1 | `public.businesses` | uuid | owner / promoter | **RESTRICT** | `20260731070000` |
| M1.1 | `public.business_memberships` | uuid | `acting_membership_id` opzionale | **SET NULL** | Appartenenze pubblicate |
| M2.1 | `public.collaborations` | uuid | `collaboration_id` | **CASCADE** | M1.1 |
| M2.1 | `public.profiles` | uuid | controparte Persona | **RESTRICT** | come sopra |
| M2.1 | `public.businesses` | uuid | controparte Impresa | **RESTRICT** | come sopra |

### 9.2 Di derivazione (nessuna migration dedicata)

| Derivato | Fonte | Nota |
|---|---|---|
| Legittimazione scrittura per Impresa | Appartenenze (`business_memberships` + eventuali autorizzazioni gestionali) | Non persistita come permesso; snapshot opzionale su AR |
| Scrittura / deny-by-default | Identità & Accessi | Nessuna FK Collaborazioni → Account |
| Contesto Organizzazione | — | **Non operativo** (nessuna partecipazione Org) |

### 9.3 Future (non strutturali ciclo 1)

Organizzazioni (partecipante); Professionisti (D21); Opportunità (D22); Mercati; Eventi; Servizi; Contenuti; percorso interesse/relazione.

### 9.4 Vietate (strutturali)

FK a `organizations` / `organization_officials` / `accounts` / `auth.users` come owner; FK Professionisti/Opportunità/Eventi/Mercati/Servizi/Contenuti; tabelle interesse/matching/accordo; cataloghi tipologici; booleani `can_*`; JSONB modellante; ENUM PostgreSQL.

### 9.5 Assenza cicli

`profiles` + `businesses` (+ `business_memberships` opzionale) → `collaborations` → `collaboration_participants`. **Aciclico.**

---

## 10. Verifica della separazione delle unità

| Criterio | Esito |
|---|---|
| `collaborations` creato prima dei partecipanti | Sì (M1.1 → M2.1) |
| Una tabella = una migration | Sì |
| Dipendenze circolari | Nessuna |
| Partecipanti incorporabili nell’AR? | **No** — responsabilità autonoma (0..N controparti; XOR soggetto; UNIQUE parziali; lifecycle owned distinto) |
| Promotore sull’AR | Sì (CHECK XOR; esattamente uno) |
| Controparti in tabella subordinata | Sì |
| Cataloghi preliminari | **Non necessari** |
| Forma e lifecycle via CHECK chiusi | Sì |
| Elementi rinviati con migration dedicata | **No** |

---

## 11. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL |
|---|---|---|---|
| **M1** | Presente | Aggregate Root Collaborazione | M1.1 |
| **M2** | Presente | Controparti indicate owned | M2.1 |
| **M3** | **Assente** | — | 0 |
| **M4** | **Assente** | — | 0 |
| **M5** | **Assente** | — | 0 |
| **M6** | **Assente** | — | 0 |
| **M7** | **Assente** | — | 0 |
| **M8** | Presente (non SQL) | M8.1 SKIP; M8.2 report | 0 SQL |

**Ordine globale:**
M1.1 → M2.1 → (M8.1 SKIP) → M8.2.

---

## 12. Matrice blocchi / unità / timestamp

| Codice | Blocco | Tabella | Timestamp | File futuro | Unicità |
|---|---|---|---|---|---|
| M1.1 | M1 | `collaborations` | `20260810090000` | `20260810090000_create_collaborations.sql` | Libero |
| M2.1 | M2 | `collaboration_participants` | `20260810100000` | `20260810100000_create_collaboration_participants.sql` | Libero |
| M8.1 | M8 | — | — | **SKIP** | — |
| M8.2 | M8 | — | — | Report documentale post-remoto (non SQL) | — |

**Ordine timestamp:** `20260810090000` < `20260810100000`, entrambi > head `20260809100000`.

---

## 13. Contratto operativo M1.1 — `collaborations`

**File futuro:** `supabase/migrations/20260810090000_create_collaborations.sql`

### 13.1 Responsabilità

Creare l’Aggregate Root `public.collaborations`: ownership ternaria; autore; promotore XOR; forma; contenuti; slug; lifecycle 4 assi; gate pubblicazione; archiviazione; utilizzo opzionale Appartenenza; RLS; privilegi; `updated_at`; COMMENT; indici.

### 13.2 Aggregate Root

| Aspetto | Contratto |
|---|---|
| PK | `id uuid NOT NULL DEFAULT gen_random_uuid()` |
| Identità | Autonoma (PF5); ≠ partecipanti; ≠ Opportunità |
| Timestamp | `created_at` / `updated_at` `timestamptz NOT NULL DEFAULT now()` |
| Natura | Scheda **dichiarativa**; non contratto; non membership; non collaborazione attiva |

### 13.3 Colonne (ordine fisico — Physical §7.1)

Come Physical §7.1 (30 colonne): ownership (`owner_person_id`, `owner_business_id`, `owned_by_editorial`); `registered_by_person_id`; promotore (`promoter_person_id`, `promoter_business_id`); `acting_membership_id`, `acting_title_snapshot`; `form_code`; `title`, `object_text`, `purpose_text`, `description`, `sought_counterpart_text`, `external_context_label`, `context_area_text`; `slug`; `availability_starts_on`, `availability_ends_on`; `editorial_status`, `operational_status`, `outcome_status`; `published_at`, `withdrawn_at`, `closed_at`, `cancelled_at`, `archived_at`; `created_at`, `updated_at`.

### 13.4 Ownership

| Caso | Colonne |
|---|---|
| Persona | `owner_person_id` NOT NULL; `owner_business_id` NULL; `owned_by_editorial = false` |
| Impresa | `owner_business_id` NOT NULL; `owner_person_id` NULL; `owned_by_editorial = false` |
| Redazione | `owned_by_editorial = true`; entrambi owner_* NULL |

CHECK XOR ternario (Physical §7.2). Vietati: Account, `auth.users`, Organizzazione come owner.

### 13.5 Autore

| Aspetto | Contratto |
|---|---|
| Colonna | `registered_by_person_id uuid NOT NULL` |
| FK | `profiles(id)` ON UPDATE NO ACTION ON DELETE **RESTRICT** |
| Distinzioni | ≠ owner (concettuale); ≠ promotore; ≠ Account |

### 13.6 Promotore

| Aspetto | Contratto |
|---|---|
| Colonne | `promoter_person_id` XOR `promoter_business_id` |
| Cardinalità | **Esattamente uno** (CHECK) |
| Tipi | Solo Persona o Impresa |
| Vietati | Esterno; Organizzazione; Account; Professionista come tipo |

### 13.7 Forma

```
form_code IN (
  'ricerca',
  'offerta',
  'partnership',
  'progetto',
  'disponibilita_aperta'
)
```

Nessun catalogo; seed 0.

### 13.8 Contenuti e slug

| Campo | Regola |
|---|---|
| `title`, `object_text`, `purpose_text`, `slug` | NOT NULL; blank-guard |
| `description`, `sought_counterpart_text`, `external_context_label`, `context_area_text` | NULL oppure non blank |
| `slug` | UNIQUE; pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| Vietati | `metadata`; JSON generico; allegati; contatti; documenti |

### 13.9 Lifecycle e gate

| Asse | Colonna | Default | Valori |
|---|---|---|---|
| Editoriale | `editorial_status` | `'draft'` | draft \| published \| withdrawn |
| Operativo | `operational_status` | `'open'` | open \| closed \| cancelled |
| Esito | `outcome_status` | `'not_reported'` | not_reported \| positive \| negative \| partial |
| Archiviazione | `archived_at` | NULL | NULL = corrente |

**Publication CHECK (definitivo):**

```
(editorial_status = 'draft' AND published_at IS NULL AND withdrawn_at IS NULL)
OR (editorial_status = 'published' AND published_at IS NOT NULL AND withdrawn_at IS NULL)
OR (editorial_status = 'withdrawn' AND withdrawn_at IS NOT NULL)
```

**Operational date gates:**

* `closed` ⇒ `closed_at IS NOT NULL`
* `cancelled` ⇒ `cancelled_at IS NOT NULL`
* `open` ⇒ `closed_at IS NULL` AND `cancelled_at IS NULL`

**Disponibilità:** `availability_ends_on` NULL OR `availability_starts_on` NULL OR `availability_ends_on >= availability_starts_on`.

### 13.10 Appartenenze (utilizzo)

| Aspetto | Contratto |
|---|---|
| `acting_membership_id` | uuid NULL; FK `business_memberships(id)` ON DELETE **SET NULL** |
| `acting_title_snapshot` | text NULL; blank-guard se valorizzato |
| CHECK debole | membership NULL OR owner_business OR promoter_business valorizzato |
| Legittimazione | **Derivata** da Appartenenze; non owned |
| V10 | Nessuna membership/ruolo/autorizzazione copiata |

### 13.11 FK M1.1

| Colonna | Target | ON DELETE |
|---|---|---|
| `owner_person_id` | `profiles(id)` | RESTRICT |
| `owner_business_id` | `businesses(id)` | RESTRICT |
| `registered_by_person_id` | `profiles(id)` | RESTRICT |
| `promoter_person_id` | `profiles(id)` | RESTRICT |
| `promoter_business_id` | `businesses(id)` | RESTRICT |
| `acting_membership_id` | `business_memberships(id)` | SET NULL |

### 13.12 UNIQUE

`collaborations_slug_key (slug)`.

### 13.13 Indici (Physical §19)

Oltre PK e UNIQUE slug:

* `(owner_person_id)` WHERE NOT NULL
* `(owner_business_id)` WHERE NOT NULL
* `(owned_by_editorial)` WHERE `owned_by_editorial`
* `(form_code)`
* `(editorial_status)`
* `(operational_status)`
* `(published_at)` WHERE `editorial_status = 'published'`
* `(archived_at)`
* `(promoter_person_id)` WHERE NOT NULL
* `(promoter_business_id)` WHERE NOT NULL
* `(registered_by_person_id)`

Nota: Physical §19 non richiede indice dedicato su `outcome_status` né su `acting_membership_id`; non inventarli.

### 13.14 Trigger

* Funzione `public.set_collaborations_updated_at()` — `SECURITY INVOKER`, `search_path = ''`
* Trigger `collaborations_set_updated_at` BEFORE UPDATE FOR EACH ROW
* Nessun altro trigger; nessun trigger su `profiles` / `businesses` / `business_memberships` / `auth.users` / Organizzazioni

### 13.15 RLS e privilegi

* `ENABLE ROW LEVEL SECURITY`
* FORCE RLS **false**
* **0** policy
* `REVOKE ALL` da `PUBLIC`, `anon`, `authenticated`
* **0** GRANT applicativi
* Policy future: unità separate (fuori questo blocco)

### 13.16 COMMENT

COMMENT ON TABLE; COMMENT ON COLUMN per ownership XOR, promotore XOR, `form_code`, assi lifecycle, `registered_by_person_id`, `acting_membership_id` / snapshot, testi controparte/esterno; COMMENT ON FUNCTION `set_collaborations_updated_at`. Dichiarare: scheda dichiarativa ≠ collaborazione attiva; ≠ Appartenenza; ≠ contratto; ≠ Opportunità; ≠ OffertaDiServizio; ≠ Organizzazione; ≠ Account; ≠ Storage.

### 13.17 Seed

**0.**

### 13.18 Vietati in SQL M1.1

`IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PG; FORCE RLS true; GRANT anon/authenticated; seed demo; colonne interesse/relazione; FK Org/Opp/Eventi/Servizi/Professionisti/Mercati/Account; `can_*`.

---

## 14. Contratto operativo M2.1 — `collaboration_participants`

**File futuro:** `supabase/migrations/20260810100000_create_collaboration_participants.sql`

### 14.1 Responsabilità

Creare la tabella owned delle **sole controparti indicate** 0..N: FK Collaborazione CASCADE; Persona XOR Impresa; `role_code` fisso; ordinamento; UNIQUE parziali; RLS; privilegi; `updated_at`; COMMENT; indici.

### 14.2 Colonne (ordine fisico — Physical §14.1)

| # | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` |
| 2 | `collaboration_id` | `uuid` | NO | — |
| 3 | `role_code` | `text` | NO | `'indicated_counterpart'` |
| 4 | `person_id` | `uuid` | SÌ | — |
| 5 | `business_id` | `uuid` | SÌ | — |
| 6 | `sort_order` | `integer` | NO | `0` |
| 7 | `note` | `text` | SÌ | — |
| 8 | `created_at` | `timestamptz` | NO | `now()` |
| 9 | `updated_at` | `timestamptz` | NO | `now()` |

**Assenti:** `organization_id`; `professional_id`; `account_id`; `external_label`; email/telefono.

### 14.3 FK

| Colonna | Target | ON DELETE |
|---|---|---|
| `collaboration_id` | `collaborations(id)` | **CASCADE** |
| `person_id` | `profiles(id)` | **RESTRICT** |
| `business_id` | `businesses(id)` | **RESTRICT** |

### 14.4 CHECK

```
role_code = 'indicated_counterpart'

AND (
  (person_id IS NOT NULL AND business_id IS NULL)
  OR (person_id IS NULL AND business_id IS NOT NULL)
)

AND sort_order >= 0

AND (note IS NULL OR length(btrim(note)) > 0)
```

### 14.5 UNIQUE parziali

| Nome | Definizione |
|---|---|
| `collaboration_participants_person_uidx` | UNIQUE `(collaboration_id, person_id)` WHERE `person_id IS NOT NULL` |
| `collaboration_participants_business_uidx` | UNIQUE `(collaboration_id, business_id)` WHERE `business_id IS NOT NULL` |

### 14.6 Indici (Physical §19)

* PK `(id)`
* `(collaboration_id, sort_order)`
* UNIQUE parziali sopra
* `(person_id)` WHERE NOT NULL
* `(business_id)` WHERE NOT NULL

### 14.7 Trigger

* Funzione `public.set_collaboration_participants_updated_at()` — `SECURITY INVOKER`, `search_path = ''`
* Trigger `collaboration_participants_set_updated_at` BEFORE UPDATE FOR EACH ROW
* Nessun trigger cross-domain

### 14.8 RLS e privilegi

Identici a M1.1: ENABLE; FORCE false; 0 policy; REVOKE PUBLIC/anon/authenticated; 0 GRANT.

### 14.9 COMMENT

COMMENT ON TABLE; COMMENT ON COLUMN per `role_code`, XOR soggetto, `sort_order`, `note`; COMMENT ON FUNCTION. Dichiarare: solo controparti indicate; ≠ promotore; ≠ membership; ≠ Organizzazione; ≠ Account.

### 14.10 Seed

**0.**

### 14.11 Vietati in SQL M2.1

Come M1.1; inoltre: etichetta esterna strutturata; ruolo diverso da `indicated_counterpart`; incorporazione promotore.

---

## 15. Invarianti non implementabili localmente (ciclo 1)

| Invariante | Enforcement |
|---|---|
| Il promotore non dovrebbe essere ripetuto come controparte | Applicativa / M8.2 — **nessun** trigger cross-table (Physical §14.2) |
| Legittimazione a operare per Impresa deriva da Appartenenze | Derivata a runtime (IA/policy); snapshot opzionale non prova titolo corrente |
| Owner / autore / promotore / partecipante ≠ accesso automatico | 0 policy; deny-by-default; nessuna colonna permesso |
| Collaborazione non crea membership, delega o contratto | Assenza tabelle/colonne; COMMENT; V10 |
| Nessun anti-duplicato globale schede inverse A↔B | Qualità editoriale (Logical §15.A) |

---

## 16. Ordine globale

| Unità | Titolo | Tabella | Responsabilità | Dipendenze | Ordine |
|---|---|---|---|---|---|
| M1.1 | Create collaborations | `collaborations` | AR scheda dichiarativa | `profiles`, `businesses`, `business_memberships` | 1 |
| M2.1 | Create collaboration participants | `collaboration_participants` | Controparti indicate 0..N | M1.1, `profiles`, `businesses` | 2 |
| M8.1 | Seed dimostrativi | — | — | — | SKIP |
| M8.2 | Validation report | — | Report post-remoto | M1.1, M2.1 applicati | Ultimo (doc) |

**Motivazione ordine.** Aciclico; AR prima dell’owned; ownership/promotore sull’AR senza anticipare interesse/relazione; apply integrale M1.1→M2.1 sufficiente al ciclo 1.

---

## 17. Validazione prevista (ciclo successivo — non eseguita qui)

### 17.1 Review statica

Verificare: Logical §15; Physical; questo Plan; ownership; autore; promotore; partecipanti; forma; lifecycle; publication gates; FK; CHECK; UNIQUE; indici; RLS; privilegi; trigger; esclusioni; identificatori ≤ 63 byte; assenza SQL vietato.

### 17.2 Apply locale

Ordine: `M1.1 → M2.1` tramite `supabase migration up --local`.

### 17.3 Test runtime con ROLLBACK

**Ownership**

* Accettare: Persona; Impresa; Redazione.
* Rifiutare: nessun owner; combinazioni multiple invalide.

**Autore e promotore**

* Autore valido NOT NULL.
* Promotore Persona; promotore Impresa.
* Rifiutare: nessun promotore; doppio promotore; solo etichetta/Org/Account.

**Forma e contenuti**

* Cinque forme valide; forma arbitraria rifiutata.
* Blank-guard title/object/purpose/slug.
* Slug valido / invalido / duplicato.

**Lifecycle**

* Default draft/open/not_reported/archived NULL.
* Valori fuori catalogo rifiutati.
* Published gate; withdrawn gate; operational closed/cancelled/open; outcome; archiviazione.

**Membership snapshot**

* Membership NULL ammessa.
* Membership valida + snapshot.
* DELETE membership ⇒ `acting_membership_id` SET NULL; snapshot testuale conservabile.

**Partecipanti**

* Persona; Impresa; XOR; nessun soggetto rifiutato.
* Duplicato Persona / Impresa rifiutato (UNIQUE parziali).
* Più controparti diverse accettate.
* DELETE Collaborazione ⇒ CASCADE partecipanti.

**Sicurezza**

* RLS ENABLE; 0 policy; deny anon/authenticated; `updated_at` su UPDATE.

**Pulizia**

* ROLLBACK; zero fixture residue.

### 17.4 Dry-run remoto

Deve proporre **esattamente due** migration (`20260810090000`, `20260810100000`).

### 17.5 Apply remoto

Solo dopo dry-run positivo.

### 17.6 M8.2

Report documentale post-remoto (non SQL).

---

## 18. M8.1 e M8.2

| Unità | Decisione |
|---|---|
| **M8.1** | **SKIP** — nessun seed dimostrativo (Collaborazioni, partecipanti, forme, lifecycle) |
| **M8.2** | Validation report **previsto post-remoto**; nessuna migration SQL M8.2 |

---

## 19. Confini confermati del blocco SQL

Il blocco M1.1–M2.1 **non** creerà:

cataloghi; seed; manifestazioni; candidature; inviti; matching; accordi; fase relazionale; Professionisti; Opportunità; Mercati; Organizzazioni partecipanti; Account–Collaborazione; membership owned; policy applicative; documenti; Storage; CRM; HR; contratti; pagamenti; reputazione; M3–M7; M8.1.

---

## 20. Criteri di accettazione del Plan

Plan accettabile se: 2 tabelle = 2 migration; timestamp unici e ordinati; contratti M1.1/M2.1 allineati al Physical senza decisioni semantiche nuove; dipendenze strutturali disponibili; invarianti applicative documentate senza trigger cross-domain; M8.1 SKIP; M8.2 post-remoto; creazione SQL autorizzabile.

---

## 21. Stato finale

**Migration Plan Collaborazioni ciclo 1 chiuso per creazione SQL.**

| Voce | Valore |
|---|---|
| Tabelle | 2 |
| Migration SQL | 2 (`M1.1`, `M2.1`) |
| Timestamp | `20260810090000`, `20260810100000` |
| Cataloghi / seed | 0 |
| M8.1 | SKIP |
| M8.2 | Report post-remoto |

**Azione successiva autorizzabile:** creazione contemporanea dei file

* `supabase/migrations/20260810090000_create_collaborations.sql`
* `supabase/migrations/20260810100000_create_collaboration_participants.sql`

senza nuove decisioni semantiche.
`)