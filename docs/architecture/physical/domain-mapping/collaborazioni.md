# Physical Domain Mapping — Dominio COLLABORAZIONI

> Traduzione fisica autoritativa del Logical `docs/architecture/logical/collaborazioni.md` (ciclo 1 chiuso: §8.0, §15.A–§15.D).
> Questo documento è **DDL-ready**: definisce tabelle, colonne, tipi PostgreSQL, vincoli, indici, trigger, RLS e privilegi secondo i pattern consolidati del repository (Organizzazioni, Identità & Accessi, Contenuti).
> **Non** crea Migration Plan, **non** crea migration SQL, **non** esegue apply, **non** modifica lo schema né altri domini.
> Non introduce decisioni semantiche nuove rispetto al Logical; le sole decisioni sono di **forma fisica** (naming, tipi, vincoli, ordine). In contrasto interno al Logical, prevale §15.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Collaborazioni** |
| Artefatto | Physical Domain Mapping |
| Logical di riferimento | `docs/architecture/logical/collaborazioni.md` (revisionato e approvato) |
| Stato | **Chiuso per Migration Plan** (salvo §30) |
| Ciclo | Ciclo 1 — scheda dichiarativa pubblicabile |
| Migration Plan / SQL | **Fuori da questo documento** |
| Physical precedente | Mapping concettuale (non DDL) — **sostituito integralmente** da questo documento |

---

## 2. Scopo e responsabilità del dominio

Tradurre l’Aggregate Root **Collaborazione** in un modello relazionale `public` che rappresenta esclusivamente una **scheda dichiarativa** di ricerca/offerta/proposta: ownership Persona|Impresa|Redazione, un promotore esatto (Persona|Impresa), controparti indicate 0..N, forma chiusa, testi obbligatori, lifecycle a quattro assi, autore della registrazione, utilizzo storico opzionale del titolo Appartenenza — **senza** percorso di interesse, fase relazionale, matching, membership, Organizzazioni strutturali, Account owner, CRM, documenti o Storage.

### 2.1 Confini esatti

| Incluso ciclo 1 | Rinviato / escluso |
|---|---|
| AR Collaborazione (scheda dichiarativa) | Manifestazione, Candidatura, Invito, Abbinamento, Accordo preliminare |
| Ownership ternaria di scheda | Fase relazionale (Avviata/Attiva/Sospesa) |
| Promotore esatto Persona\|Impresa | Matching / motore compatibilità |
| Controparti indicate 0..N Persona\|Impresa | Esigenza/Offerta come E02 separate |
| Controparte ricercata / etichetta esterna (testo AR) | Catalogo tipologico ampio §5 Logical |
| Forma chiusa (5 valori) | FK Professionisti, Opportunità, Mercati, Eventi, Servizi, Organizzazioni |
| Lifecycle 4 assi | Verifica / Contestata owned |
| Autore registrazione (Persona) | Account / `auth.users` come owner |
| Snapshot utilizzo Appartenenza (opzionale) | Membership / ruoli permanenti owned |
| | Messaggistica, contratti, pagamenti, CRM, HR, documenti, media, Storage, FEV, project management, reputazione, identità temporanea |

### 2.2 Responsabilità incluse

- Identità stabile della scheda Collaborazione.
- Titolarità della scheda (Persona \| Impresa \| Redazione).
- Dichiarazione di forma, oggetto, finalità, descrizione.
- Promotore unico e controparti indicate locali.
- Lifecycle editoriale / operativo / esito / archiviazione.
- Registrazione dell’autore (Persona) e, opzionalmente, snapshot storico del titolo Appartenenza utilizzato in scrittura.
- Eventi di dominio minimi (documentali; non tabelle event-store).

### 2.3 Responsabilità escluse

Interesse/candidatura/invito/abbinamento; relazione attiva; matching; membership; rappresentanza owned; ruoli Appartenenze; permessi/RLS policy applicative; Account; Organizzazione come partecipante; Professionista come tipo; Opportunità/Eventi/Mercati/Servizi/Contenuti in ownership o FK; contratti; messaggi; pagamenti; CRM; HR; documenti; Storage; FEV; reputazione.

**La scheda non rappresenta automaticamente:** un contratto; una membership; un incarico; un diritto applicativo; una relazione professionale certificata; una collaborazione già attiva.

---

## 3. Fonti

| Fonte | Uso |
|---|---|
| `logical/collaborazioni.md` §8.0, §15.A–§15.D | **Autorità semantica** ciclo 1 |
| `domain-model.md`; `reconciliation-report.md` | Confini vs Opportunità / Appartenenze |
| `domain-dependency-map.md` §9, D19–D23, V10 | Dipendenze; nessun ciclo |
| Physical Organizzazioni / Identità & Accessi | Pattern ownership XOR, RLS, `updated_at`, COMMENT |
| Physical Imprese / Persone / Appartenenze | Target FK; utilizzo D23 |
| Migration `profiles`, `businesses`, `business_memberships`, pattern RLS recenti | Dipendenze strutturali reali |

---

## 4. Principi di mapping

1. Unico AR fisico `collaborations`; controparti indicate in tabella owned; **nessuna** tabella per interesse/relazione/matching.
2. **PC2 chiusa**: nessun secondo Aggregate Root.
3. Titolare = esattamente uno tra Persona (`profiles`), Impresa (`businesses`) e Redazione (`owned_by_editorial = true`).
4. Promotore = **incorporato nell’AR** (`promoter_person_id` XOR `promoter_business_id`) per garantire **esattamente uno** senza trigger di cardinalità cross-row; semanticamente resta il ruolo locale `promotore`.
5. Controparti = sola tabella `collaboration_participants` (ruolo fisso `indicated_counterpart`); soggetto Persona XOR Impresa; **nessuna** etichetta esterna come riga partecipante (Logical: esterno = testo descrittivo sull’AR).
6. Controparte ricercata / soggetto esterno non censito = colonne testuali sull’AR (`sought_counterpart_text`, opz. `external_context_label`).
7. Forma = CHECK chiuso a 5 valori; **nessun** catalogo tipologico C03.
8. Lifecycle = quattro colonne/assi; **nessun** asse ricerca/verifica/relazione del modello generale.
9. Appartenenza = **utilizzo derivato** a scrittura; persistenza opzionale di `acting_membership_id` + `acting_title_snapshot` (D23); **nessuna** ownership membership (V10).
10. Nessuna FK a `organizations`, `organization_officials`, `accounts`, `auth.users`, Professionisti, Opportunità, Eventi, Mercati, Servizi, Contenuti.
11. Nessun JSONB modellante; nessun ENUM PostgreSQL; nessun `metadata`; nessun booleano `can_*`.
12. RLS ENABLE, FORCE false, **0 policy**, REVOKE ALL da PUBLIC/anon/authenticated; zero GRANT applicativi.
13. `updated_at` via funzione dedicata `SECURITY INVOKER`, `search_path = ''`, trigger BEFORE UPDATE.
14. Nessun `IF NOT EXISTS`, `DO`, SQL dinamico; nessun trigger su Auth/Persone/Imprese/Appartenenze/Organizzazioni.

---

## 5. Inventario tabelle

| # | Tabella | Natura | Owner |
|---|---|---|---|
| 1 | `collaborations` | Aggregate Root | Dominio Collaborazioni |
| 2 | `collaboration_participants` | Entity owned (controparti indicate) | `collaborations` |

**Totale ciclo 1: 2 tabelle.**

**Non create:** `collaboration_types` (catalogo tipologico); `collaboration_manifestations`; `collaboration_candidacies`; `collaboration_invitations`; `collaboration_matches`; `collaboration_agreements`; `collaboration_sources`; `collaboration_evidences`; tabelle fase relazionale; link a Org/Opp/Eventi/Servizi/Professionisti/Mercati/Contenuti; Account–Collaborazione.

---

## 6. Dipendenze esterne (ciclo 1)

### 6.1 Strutturali (FK)

| Target | Origine tipica | PK | Uso Collaborazioni | ON DELETE |
|---|---|---|---|---|
| `public.profiles` | `20260718103949_create_profiles_table.sql` | `id` uuid | Owner; promotore; autore; controparte Persona | **RESTRICT** |
| `public.businesses` | `20260731070000_create_businesses_core.sql` | `id` uuid | Owner; promotore; controparte Impresa | **RESTRICT** |
| `public.business_memberships` | migration Appartenenze | `id` uuid | Utilizzo storico opzionale titolo (D23) | **SET NULL** |

### 6.2 Di derivazione (lettura, nessuna ownership)

| Target | Uso |
|---|---|
| `business_memberships` (+ autorizzazioni gestionali se presenti) | Legittimazione a scrivere per Impresa: **non** persistita come permesso; opzionalmente referenziata nello snapshot |
| Identità & Accessi (`accounts`, ruoli) | Supporto scrittura / deny-by-default; **nessuna** FK Collaborazioni → Account |

### 6.3 Future / escluse (non strutturali ciclo 1)

| Target | Nota |
|---|---|
| `organizations` / `organization_officials` | Partecipazione strutturale esclusa |
| `professional_profiles` | D21 rinviato |
| `opportunities` | D22 rinviato |
| Mercati / Eventi / Servizi / Contenuti | Nessuna FK |
| `auth.users` / `accounts` | Vietati come owner |

**Assenza cicli.** Collaborazioni → Persone/Imprese/Appartenenze (utilizzo); nessuna dipendenza inversa di ownership.

---

## 7. Aggregate Root — `collaborations`

**Responsabilità.** Scheda radice della Collaborazione dichiarativa: identità, ownership, promotore, forma, contenuti, lifecycle, autore, controparte ricercata testuale, snapshot utilizzo Appartenenza.

**Identità.** `id uuid PK DEFAULT gen_random_uuid()` — autonoma (PF5); non derivata da partecipanti né da Opportunità.

**Motivazione AR unica.** Logical §2 / §15.A: un solo Aggregate Root; fase relazionale rinviata; PC2 chiusa.

### 7.1 Colonne (ordine fisico)

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `owner_person_id` | `uuid` | SÌ | — | XOR Impresa/Redazione |
| 3 | `owner_business_id` | `uuid` | SÌ | — | XOR Persona/Redazione |
| 4 | `owned_by_editorial` | `boolean` | NO | `false` | Redazione piattaforma |
| 5 | `registered_by_person_id` | `uuid` | NO | — | Autore registrazione (Persona); ≠ owner obbligatoriamente |
| 6 | `promoter_person_id` | `uuid` | SÌ | — | XOR `promoter_business_id`; esattamente un promotore |
| 7 | `promoter_business_id` | `uuid` | SÌ | — | XOR `promoter_person_id` |
| 8 | `acting_membership_id` | `uuid` | SÌ | — | Utilizzo opzionale Appartenenza (D23) |
| 9 | `acting_title_snapshot` | `text` | SÌ | — | Etichetta titolo al tempo t; non blank se valorizzata |
| 10 | `form_code` | `text` | NO | — | Forma chiusa §10 |
| 11 | `title` | `text` | NO | — | Titolo scheda; non blank |
| 12 | `object_text` | `text` | NO | — | Oggetto; non blank |
| 13 | `purpose_text` | `text` | NO | — | Finalità; non blank |
| 14 | `description` | `text` | SÌ | — | Descrizione ampia; non blank se valorizzata |
| 15 | `sought_counterpart_text` | `text` | SÌ | — | Controparte ricercata (criteri); non blank se valorizzata |
| 16 | `external_context_label` | `text` | SÌ | — | Etichetta contesto/ente esterno non censito; **non** FK Org |
| 17 | `context_area_text` | `text` | SÌ | — | Area/contesto territoriale-settoriale descrittivo |
| 18 | `slug` | `text` | NO | — | Unique; pattern slug |
| 19 | `availability_starts_on` | `date` | SÌ | — | Disponibilità temporale opzionale |
| 20 | `availability_ends_on` | `date` | SÌ | — | Opzionale; ≥ start se entrambi |
| 21 | `editorial_status` | `text` | NO | `'draft'` | draft \| published \| withdrawn |
| 22 | `operational_status` | `text` | NO | `'open'` | open \| closed \| cancelled |
| 23 | `outcome_status` | `text` | NO | `'not_reported'` | not_reported \| positive \| negative \| partial |
| 24 | `published_at` | `timestamptz` | SÌ | — | Gate pubblicazione |
| 25 | `withdrawn_at` | `timestamptz` | SÌ | — | Gate ritiro |
| 26 | `closed_at` | `timestamptz` | SÌ | — | Gate chiusura operativa |
| 27 | `cancelled_at` | `timestamptz` | SÌ | — | Gate annullamento |
| 28 | `archived_at` | `timestamptz` | SÌ | — | NULL = corrente |
| 29 | `created_at` | `timestamptz` | NO | `now()` | |
| 30 | `updated_at` | `timestamptz` | NO | `now()` | |

**Mapping assi Logical → colonne.**

| Asse Logical §8.0 | Colonna / rappresentazione | Valori fisici |
|---|---|---|
| Editoriale `bozza`/`pubblicata`/`ritirata` | `editorial_status` | `draft` / `published` / `withdrawn` |
| Operativo `aperta`/`chiusa`/`annullata` | `operational_status` | `open` / `closed` / `cancelled` |
| Esito | `outcome_status` | `not_reported` / `positive` / `negative` / `partial` |
| Archiviazione `corrente`/`archiviata` | `archived_at` | NULL / timestamptz |

### 7.2 Vincoli AR

**PK:** `collaborations_pkey (id)`.

**FK:**

| Colonna | Target | ON UPDATE | ON DELETE |
|---|---|---|---|
| `owner_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `owner_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |
| `registered_by_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `promoter_person_id` | `profiles(id)` | NO ACTION | **RESTRICT** |
| `promoter_business_id` | `businesses(id)` | NO ACTION | **RESTRICT** |
| `acting_membership_id` | `business_memberships(id)` | NO ACTION | **SET NULL** |

**CHECK ownership (Persona XOR Impresa XOR Redazione):**

```
(
  (owner_person_id IS NOT NULL AND owner_business_id IS NULL AND owned_by_editorial = false)
  OR (owner_person_id IS NULL AND owner_business_id IS NOT NULL AND owned_by_editorial = false)
  OR (owner_person_id IS NULL AND owner_business_id IS NULL AND owned_by_editorial = true)
)
```

**CHECK promotore (esattamente uno; Persona XOR Impresa; mai esterno/Org/Account):**

```
(
  (promoter_person_id IS NOT NULL AND promoter_business_id IS NULL)
  OR (promoter_person_id IS NULL AND promoter_business_id IS NOT NULL)
)
```

**CHECK forma:**

```
form_code IN (
  'ricerca',
  'offerta',
  'partnership',
  'progetto',
  'disponibilita_aperta'
)
```

**CHECK lifecycle:**

```
editorial_status IN ('draft', 'published', 'withdrawn')
operational_status IN ('open', 'closed', 'cancelled')
outcome_status IN ('not_reported', 'positive', 'negative', 'partial')
```

**CHECK publication / date gates:**

```
(editorial_status = 'draft' AND published_at IS NULL AND withdrawn_at IS NULL)
OR (editorial_status = 'published' AND published_at IS NOT NULL AND withdrawn_at IS NULL)
OR (editorial_status = 'withdrawn' AND withdrawn_at IS NOT NULL)
```

4. `operational_status = 'closed'` ⇒ `closed_at IS NOT NULL`
5. `operational_status = 'cancelled'` ⇒ `cancelled_at IS NOT NULL`
6. `operational_status = 'open'` ⇒ `closed_at IS NULL` AND `cancelled_at IS NULL`
7. `availability_ends_on` NULL OR `availability_starts_on` NULL OR `availability_ends_on >= availability_starts_on`

**CHECK blank-guards (non blank se NOT NULL / obbligatori):**

- `length(btrim(title)) > 0`
- `length(btrim(object_text)) > 0`
- `length(btrim(purpose_text)) > 0`
- `length(btrim(slug)) > 0`
- `slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`
- `description`, `sought_counterpart_text`, `external_context_label`, `context_area_text`, `acting_title_snapshot`: se NOT NULL allora `length(btrim(...)) > 0`

**CHECK utilizzo Appartenenza (coerenza debole):**

```
acting_membership_id IS NULL
OR owner_business_id IS NOT NULL
OR promoter_business_id IS NOT NULL
```

(Non verifica join sulla membership; la legittimazione operativa resta derivata da Appartenenze.)

**UNIQUE:** `collaborations_slug_key (slug)`.

**Invarianti non-DDL (documentate):**

- Ownership Impresa / promotore Impresa **non** prova rappresentanza: la scrittura per Impresa richiede titolo Appartenenza al momento dell’azione (derivato; IA/policy future).
- `registered_by_person_id` può coincidere o meno con `owner_person_id` / `promoter_person_id`.
- Partecipazione / ownership **non** creano permessi RLS.
- Nessun controllo anti-duplicato globale di schede “inverse” A↔B (Logical: qualità editoriale).

---

## 8. Ownership (forma fisica)

| Caso | Colonne |
|---|---|
| Persona | `owner_person_id` NOT NULL; `owner_business_id` NULL; `owned_by_editorial = false` |
| Impresa | `owner_business_id` NOT NULL; `owner_person_id` NULL; `owned_by_editorial = false` |
| Redazione | `owned_by_editorial = true`; entrambi owner_* NULL |

- Nessun `auth.users` / `accounts` come owner.
- Nessuna Organizzazione come owner.
- Redazione ≠ Contesto Organizzazione e ≠ ruolo applicativo.

---

## 9. Autore della registrazione

| Aspetto | Forma |
|---|---|
| Colonna | `registered_by_person_id uuid NOT NULL` |
| FK | `profiles(id)` ON DELETE **RESTRICT** |
| Cardinalità | Esattamente una Persona per scheda |
| Significato | Persona che ha materialmente creato/registrato la scheda |
| ≠ Owner | Owner può essere Impresa o Redazione; autore resta Persona |
| ≠ Promotore | Promotore è soggetto della dichiarazione; autore è chi scrive |
| ≠ Account | Nessuna FK ad Account / Auth |

Non trasforma l’autore in titolare né in promotore. Aggiornamenti successivi della scheda non richiedono colonna “last editor” nel ciclo 1 (rinviato).

---

## 10. Forma

| Aspetto | Decisione |
|---|---|
| Meccanismo | **CHECK** su `form_code` (nessun catalogo C03) |
| Valori | `ricerca` \| `offerta` \| `partnership` \| `progetto` \| `disponibilita_aperta` |
| Seed | **0** |
| Tipologie ampie Logical §5 | **Non mappate** |

---

## 11. Lifecycle fisico

| Asse | Colonna | Default | Date associate |
|---|---|---|---|
| Editoriale | `editorial_status` | `draft` | `published_at`, `withdrawn_at` |
| Operativo | `operational_status` | `open` | `closed_at`, `cancelled_at` |
| Esito | `outcome_status` | `not_reported` | — |
| Archiviazione | `archived_at` | NULL | valorizzato ⇒ archiviata |

**Indipendenza.** I quattro assi sono indipendenti salvo i gate data↔stato sopra. Esempi ammessi:

- `published` + `open` + `not_reported` + corrente
- `published` + `closed` + `positive` + corrente
- `withdrawn` + `cancelled` + `not_reported` + `archived_at` valorizzato
- `draft` + `open` (scheda non pubblica)

**Terminalità operativa.** `closed` e `cancelled` sono terminali sull’asse operativo (riapertura a `open` ammessa solo come correzione editoriale esplicita; non workflow complesso). `withdrawn` è terminale sull’asse editoriale rispetto agli elenchi correnti; ripubblicazione (`withdrawn` → `published`) ammessa con nuovo `published_at` (stessa scheda).

**Non reintrodotti:** stati ricerca (Interesse ricevuto, Negoziazione, …); relazione Avviata/Attiva/Sospesa; Contestata; Scaduta come asse distinto (la disponibilità resta date opzionali).

---

## 12. Pubblicazione

**Requisiti minimi per `editorial_status = 'published'` (gate DDL + invarianti di contenuto già su colonne NOT NULL):**

1. `title`, `object_text`, `purpose_text`, `slug`, `form_code` validi (sempre obbligatori).
2. Promotore presente (CHECK XOR promotore).
3. `published_at IS NOT NULL`.
4. Ownership ternaria valida.
5. Autore presente.

**`ritirata` / `withdrawn`:** `withdrawn_at IS NOT NULL`; scheda fuori dagli elenchi correnti; non cancella storico.

**Riapertura editoriale:** da `withdrawn` a `published` con `published_at` aggiornato; `withdrawn_at` può restare come ultimo ritiro o essere azzerato — **decisione operativa del Plan: azzerare `withdrawn_at` al ripubblicare** (unica regola: `published` ⇒ `withdrawn_at IS NULL` aggiunta al CHECK per coerenza simmetrica a Organizzazioni unpublished).

**CHECK pubblicazione raffinato (contratto definitivo):**

```
(editorial_status = 'draft' AND published_at IS NULL AND withdrawn_at IS NULL)
OR (editorial_status = 'published' AND published_at IS NOT NULL AND withdrawn_at IS NULL)
OR (editorial_status = 'withdrawn' AND withdrawn_at IS NOT NULL)
```

**Archiviazione:** `archived_at` indipendente; non implica `withdrawn` né `closed`.

Nessun workflow editoriale multi-step (`ready`, code di approvazione) nel ciclo 1.

---

## 13. Promotore — meccanismo di esattezza

| Aspetto | Decisione fisica |
|---|---|
| Dove vive | Colonne sull’AR: `promoter_person_id` XOR `promoter_business_id` |
| Cardinalità | **Esattamente uno** garantita dal CHECK (una delle due NOT NULL, mai entrambe, mai nessuna) |
| Tipi ammessi | Solo Persona o Impresa |
| Vietati | Organizzazione; Account; etichetta esterna; Professionista come tipo |
| Perché non tabella partecipanti | UNIQUE parziale su ruolo `promoter` impedisce *più* promotori ma non *zero* senza trigger deferrable; l’incorporazione AR chiude l’invariante in CHECK locale |

Semanticamente il promotore resta il ruolo locale `promotore` (Logical §6.2). Non è una seconda AR.

---

## 14. Controparti — `collaboration_participants`

**Responsabilità.** Controparti indicate 0..N della Collaborazione (ruolo locale `controparte_indicata`). Owned dall’AR; eliminate con CASCADE.

### 14.1 Colonne

| # | Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|---|
| 1 | `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| 2 | `collaboration_id` | `uuid` | NO | — | FK AR CASCADE |
| 3 | `role_code` | `text` | NO | `'indicated_counterpart'` | Solo questo valore ciclo 1 |
| 4 | `person_id` | `uuid` | SÌ | — | XOR `business_id` |
| 5 | `business_id` | `uuid` | SÌ | — | XOR `person_id` |
| 6 | `sort_order` | `integer` | NO | `0` | Ordinamento |
| 7 | `note` | `text` | SÌ | — | Nota sintetica; non blank se valorizzata |
| 8 | `created_at` | `timestamptz` | NO | `now()` | |
| 9 | `updated_at` | `timestamptz` | NO | `now()` | |

**Assenti:** `organization_id`; `professional_id`; `account_id`; `external_label` (esterno solo su AR); email/telefono.

### 14.2 Vincoli

**PK:** `collaboration_participants_pkey (id)`.

**FK:**

| Colonna | Target | ON DELETE |
|---|---|---|
| `collaboration_id` | `collaborations(id)` | **CASCADE** |
| `person_id` | `profiles(id)` | **RESTRICT** |
| `business_id` | `businesses(id)` | **RESTRICT** |

**CHECK:**

```
role_code = 'indicated_counterpart'

AND (
  (person_id IS NOT NULL AND business_id IS NULL)
  OR (person_id IS NULL AND business_id IS NOT NULL)
)

AND sort_order >= 0

AND (note IS NULL OR length(btrim(note)) > 0)
```

**UNIQUE parziali (anti-duplicazione nella stessa Collaborazione):**

| Nome | Definizione |
|---|---|
| `collaboration_participants_person_uidx` | UNIQUE `(collaboration_id, person_id)` WHERE `person_id IS NOT NULL` |
| `collaboration_participants_business_uidx` | UNIQUE `(collaboration_id, business_id)` WHERE `business_id IS NOT NULL` |

**Anti auto-duplicazione promotore↔controparte:** non CHECK cross-table. **Invariante applicativa documentata:** una riga partecipante non deve ripetere lo stesso `person_id` / `business_id` del promotore dell’AR; enforcement in M8.2 / layer applicativo, non trigger cross-dominio. Non è richiesto controllo di collaborazioni inverse globali.

---

## 15. Appartenenze e rappresentanza

| Regola | Forma fisica |
|---|---|
| Ownership Impresa non crea rappresentanza | Solo colonne owner_*; nessun permesso derivato |
| Promotore Impresa ≠ prova che l’autore possa agire | Distinzione owner / promoter / registered_by |
| Legittimazione a scrivere per Impresa | **Derivata** da Appartenenze al momento dell’azione (Identità & Accessi / policy future) |
| Persistenza storica minima | Opzionale: `acting_membership_id` + `acting_title_snapshot` |
| FK membership | Opzionale; ON DELETE **SET NULL** (lo snapshot testuale può restare) |
| Copia membership / ruoli / autorizzazioni | **Vietata** (V10) |
| Membership Persona–Org / Impresa–Org | Non modellate; non simulabili |

**Decisione chiusa.** La legittimazione operativa resta **derivata**; il riferimento storico è **opzionale** e non obbligatorio per INSERT. Nessuna FK membership obbligatoria.

---

## 16. Organizzazioni

| Verifica | Esito fisico |
|---|---|
| FK `organizations` | **Assente** |
| Partecipazione strutturale | **Assente** |
| Uso `organization_officials` | **Assente** |
| Assimilazione a Impresa | **Vietata** |
| Nome ente non censito | Solo `external_context_label` / testo in `sought_counterpart_text` — **non** crea fatto Org |

---

## 17. Altri domini (assenza FK strutturali)

| Dominio | Ciclo 1 | Natura |
|---|---|---|
| Professionisti | Nessuna FK | Rinviato (D21) |
| Opportunità | Nessuna FK | Rinviato (D22) |
| Mercati | Nessuna FK | Rinviato |
| Eventi | Nessuna FK | Escluso |
| Servizi | Nessuna FK | Escluso |
| Contenuti | Nessuna FK uscente | Narrativa esterna (D35) |
| Identità & Accessi | Nessuna FK | Supporto / derivazione |
| Organizzazioni | Nessuna FK | Escluso operativo |

Nessuna modifica retroattiva ad altri domini.

---

## 18. Derivati non persistiti

Non memorizzare come colonne:

- possibilità di agire per un’Impresa (`can_act_for_business`, …);
- appartenenza / autorizzazioni gestionali;
- permessi RLS / claim;
- matching / score compatibilità;
- stato di relazione effettiva;
- reputazione;
- conteggi candidature / interessi;
- avanzamento progettuale;
- esistenza di un contratto.

Nessun booleano `can_*`.

---

## 19. Indici

| Tabella | Indice | Motivazione |
|---|---|---|
| `collaborations` | PK `(id)` | Identità |
| `collaborations` | UNIQUE `(slug)` | Lookup pubblico |
| `collaborations` | `(owner_person_id)` WHERE NOT NULL | Lookup owner Persona |
| `collaborations` | `(owner_business_id)` WHERE NOT NULL | Lookup owner Impresa |
| `collaborations` | `(owned_by_editorial)` WHERE `owned_by_editorial` | Filtri redazione |
| `collaborations` | `(form_code)` | Filtro forma |
| `collaborations` | `(editorial_status)` | Elenco bozze/pubblicate/ritirate |
| `collaborations` | `(operational_status)` | Filtro operativo |
| `collaborations` | `(published_at)` WHERE `editorial_status = 'published'` | Feed pubblicati |
| `collaborations` | `(archived_at)` | Corrente vs archivio |
| `collaborations` | `(promoter_person_id)` WHERE NOT NULL | Lookup promotore Persona |
| `collaborations` | `(promoter_business_id)` WHERE NOT NULL | Lookup promotore Impresa |
| `collaborations` | `(registered_by_person_id)` | Audit autore |
| `collaboration_participants` | PK `(id)` | Identità |
| `collaboration_participants` | `(collaboration_id, sort_order)` | Lista ordinata |
| `collaboration_participants` | UNIQUE parziali person/business | Anti-duplicato |
| `collaboration_participants` | `(person_id)` WHERE NOT NULL | Lookup Persona |
| `collaboration_participants` | `(business_id)` WHERE NOT NULL | Lookup Impresa |

Evitare indici ridondanti rispetto a PK/UNIQUE.

---

## 20. Trigger e funzioni

Per **entrambe** le tabelle:

```
function public.set_<table>_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ''
```

Trigger: `<table>_set_updated_at` BEFORE UPDATE FOR EACH ROW → `NEW.updated_at = now()`.

**Nessun altro trigger** nel ciclo 1 (nessuna sincronizzazione Appartenenze/Auth/Org; nessuna enforcement cross-table promotore↔controparte).

---

## 21. Sicurezza (RLS e privilegi)

Per ogni tabella Collaborazioni:

| Voce | Prescrizione |
|---|---|
| RLS | `ENABLE ROW LEVEL SECURITY` |
| FORCE RLS | **false** |
| Policy | **0** |
| REVOKE | ALL da PUBLIC; ALL da anon, authenticated |
| GRANT applicativi | **0** |
| Deny-by-default | Sì |
| Future policy | Unità separate; fuori blocco strutturale |

**Sicurezza semantica.**

- Essere partecipante **non** attribuisce accesso automatico.
- Essere owner **non** equivale a ruolo applicativo.
- Essere autore **non** equivale a titolare.
- Essere promotore **non** prova rappresentanza.
- Una Collaborazione **non** crea Appartenenza, delega, contratto né permesso.

Collaborazioni fornisce **fatti**, non autorizzazioni.

---

## 22. COMMENT ON

Obbligatori: COMMENT ON TABLE entrambe; COMMENT ON COLUMN per ownership XOR/Redazione, promotore XOR, `form_code`, assi lifecycle, `registered_by_person_id`, `acting_membership_id` / snapshot, `sought_counterpart_text`, `external_context_label`, `role_code` partecipanti; COMMENT ON FUNCTION per ogni `set_*_updated_at`.

I testi devono dichiarare: scheda dichiarativa ≠ collaborazione attiva; ≠ Appartenenza; ≠ contratto; ≠ Opportunità; ≠ OffertaDiServizio; ≠ Organizzazione; ≠ Account; ≠ Storage.

---

## 23. Seed

| Oggetto | Seed ciclo 1 |
|---|---|
| Cataloghi | **0** (forma via CHECK) |
| AR / partecipanti | **0** demo |

---

## 24. Invarianti fisiche (riepilogo)

| # | Invariante | Enforcement |
|---|---|---|
| 1 | Un solo Aggregate Root | Inventario; nessuna seconda AR |
| 2 | Ownership Persona XOR Impresa XOR Redazione | CHECK |
| 3 | Autore distinto come concetto; FK Persona obbligatoria | Colonna + COMMENT; può coincidere numericamente con owner Persona |
| 4 | Esattamente un promotore | CHECK XOR promotore su AR |
| 5 | Promotore Persona oppure Impresa | CHECK; FK |
| 6 | Controparte Persona oppure Impresa | CHECK XOR partecipanti |
| 7 | Nessuna Organizzazione strutturale | Assenza colonne/FK |
| 8 | Nessun Professionista come tipo soggetto | Assenza colonne/FK |
| 9 | Forma chiusa | CHECK |
| 10 | Lifecycle quattro assi | Colonne + CHECK |
| 11 | Pubblicazione con gate | CHECK editorial↔date |
| 12 | Nessuna membership owned | Assenza tabelle; solo utilizzo opzionale |
| 13 | Nessuna autorizzazione derivata persistita | Assenza `can_*` |
| 14 | Partecipazione ≠ accesso | 0 policy; COMMENT |
| 15 | Account/Auth non possiedono la scheda | Assenza FK owner Auth |
| 16 | Nessuna FK retroattiva ad altri domini di processo | Inventario FK |
| 17 | Nessuna fase relazionale ciclo 1 | Assenza tabelle/stati |
| 18 | Nessun matching | Assenza tabelle |
| 19 | Nessun documento/Storage | Assenza colonne media |
| 20 | Deny-by-default | RLS + REVOKE |

---

## 25. Inventory tabellare finale

| Tabella | Responsabilità | PK | FK principali | Ownership | Lifecycle |
|---|---|---|---|---|---|
| `collaborations` | AR scheda dichiarativa | `id` uuid | `profiles`, `businesses`, `business_memberships` (opt.) | Dominio; titolare ternario sulla riga | 4 assi su colonne AR |
| `collaboration_participants` | Controparti indicate 0..N | `id` uuid | `collaborations` CASCADE; `profiles`; `businesses` | Owned da `collaborations` | Nessun asse proprio; segue AR |

**Numero definitivo di tabelle: 2.**

---

## 26. Matrice Logical → Physical

| Logical ciclo 1 | Physical |
|---|---|
| Collaborazione (AR) | `collaborations` |
| Titolare Persona\|Impresa\|Redazione | `owner_person_id` / `owner_business_id` / `owned_by_editorial` |
| Autore registrazione | `registered_by_person_id` |
| Promotore | `promoter_person_id` XOR `promoter_business_id` |
| Controparte indicata | `collaboration_participants` |
| Controparte ricercata / esterno | `sought_counterpart_text`, `external_context_label` |
| Forma | `form_code` CHECK |
| Oggetto / finalità / descrizione | `object_text`, `purpose_text`, `description` |
| Lifecycle §8.0 | `editorial_status`, `operational_status`, `outcome_status`, `archived_at` |
| Utilizzo Appartenenza | `acting_membership_id` + `acting_title_snapshot` |
| Manifestazione / Candidatura / Invito / Abbinamento / Accordo / fase relazionale | **non mappati** |
| Tipologie ampie / D21 / D22 / Org partecipante | **non mappati** |

---

## 27. Ordine di creazione (per Migration Plan)

1. `collaborations` (AR + CHECK + indici + RLS + `updated_at`)
2. `collaboration_participants` (owned + UNIQUE parziali + RLS + `updated_at`)
3. Chiusura documentale Migration Plan (fuori SQL)

**Precondizioni:** `profiles`, `businesses`, `business_memberships` (per FK opzionale).

**Timestamp:** da assegnare nel Migration Plan; strettamente crescenti e successivi a head Identità `20260809100000`.

---

## 28. Prontezza per Migration Plan

| Unità prevista | Responsabilità | Tabella |
|---|---|---|
| **M1.1** | Aggregate root Collaborazione | `collaborations` |
| **M2.1** | Controparti indicate owned | `collaboration_participants` |
| **M3–M7** | **Assenti** ciclo 1 | — |
| **M8.1** | Seed demo | **SKIP** |
| **M8.2** | Validation report | non SQL |

| Voce | Valore |
|---|---|
| N. tabelle | **2** |
| N. migration SQL indicative | **2** |
| Cataloghi | **0** |
| Seed | **0** |
| Ordine | M1.1 → M2.1 → (M8.1 SKIP) → M8.2 |
| Dipendenze | `profiles`, `businesses`, `business_memberships` |

Il Migration Plan dovrà assegnare timestamp, nomi file, contratti operativi e test **senza nuove decisioni semantiche**.

---

## 29. Contratti DDL-ready (checklist)

Per ciascuna delle 2 tabelle il Migration Plan verificherà: nome; colonne in ordine; tipi; nullability; default; PK; FK; ON UPDATE/DELETE; UNIQUE/parziali; CHECK; indici; `set_*_updated_at`; trigger; RLS ENABLE; FORCE false; 0 policy; REVOKE; nessun GRANT; COMMENT; seed 0; dipendenze; test statici/runtime.

**Vietati in SQL:** `IF NOT EXISTS`; `DO $$`; SQL dinamico; JSONB attributi; ENUM PG; FORCE RLS true; GRANT anon/authenticated; seed demo AR; Storage; tabelle interesse/relazione; FK Org/Opp/Eventi/Servizi/Professionisti/Mercati/Account; `can_*`.

---

## 30. Decisioni rinviate (non bloccanti)

1. Timestamp migration definitivi (Migration Plan).
2. Enforcement applicativo anti-duplicato promotore↔controparte.
3. FK D21/D22/D52 post ciclo 1.
4. Partecipazione strutturale Organizzazione.
5. Percorso Manifestazione/Candidatura/Invito/Abbinamento/Accordo.
6. Catalogo tipologico ampio.
7. Colonna last-editor.
8. Policy RLS future (unità separate).

---

## 31. Criteri di accettazione

Physical accettabile se: inventario **2** tabelle chiuso; AR unica; ownership ternaria DDL-garantibile; promotore esatto via CHECK su AR; controparti 0..N con XOR e UNIQUE parziali; forma CHECK; lifecycle 4 assi; Appartenenza solo utilizzo opzionale; assenza Org/Account/interesse/relazione/matching; sufficiente al Migration Plan senza nuove decisioni semantiche.

---

## 32. Stato finale

**Physical Collaborazioni ciclo 1 chiuso per Migration Plan.**

Totale: **2 tabelle** (`collaborations`, `collaboration_participants`). Unità SQL indicative: **M1.1**, **M2.1**; **M8.1 SKIP**; **M8.2** documentale.
`)