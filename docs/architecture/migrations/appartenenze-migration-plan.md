# Appartenenze — Migration Plan

## Nota introduttiva di esclusione

Questo documento è un **piano di migrazione concettuale**. Non crea file `.sql`, non scrive SQL eseguibile, non applica migrazioni, non contatta database, non usa Supabase CLI o Docker. Traduce Logical + Physical Domain Mapping di Appartenenze in una sequenza di unità additive, atomiche e revisionabili.

Il dettaglio DDL prescrittivo resta nel Physical (`domain-mapping/appartenenze.md` §32). Questo piano **non** modifica Logical, Dependency Map, né altri domini.

Fonti normative: Logical Appartenenze → Physical Domain Mapping Appartenenze → Dependency Map → Domain Patterns → Architecture Baseline. I piani Imprese e Opportunità sono riferimenti di metodo, **non** autorità sul contenuto di Appartenenze: nessun pattern di quei domini è riprodotto automaticamente.

---

## Indice

1. [Scopo](#1-scopo)
2. [Documenti fondativi](#2-documenti-fondativi)
3. [Responsabilità del dominio](#3-responsabilità-del-dominio)
4. [Perimetro del ciclo](#4-perimetro-del-ciclo)
5. [Dipendenze disponibili](#5-dipendenze-disponibili)
6. [Confini di ownership](#6-confini-di-ownership)
7. [Principi di migrazione](#7-principi-di-migrazione)
8. [Decisioni fisiche definitive](#8-decisioni-fisiche-definitive)
9. [Inventario degli oggetti fisici](#9-inventario-degli-oggetti-fisici)
10. [Grafo delle dipendenze](#10-grafo-delle-dipendenze)
11. [Ordine delle migration](#11-ordine-delle-migration)
12. [Inventario delle unità](#12-inventario-delle-unità)
13. [Valutazione delle ipotesi di sequenza](#13-valutazione-delle-ipotesi-di-sequenza)
14. [M1 — Catalogo ruoli e Aggregate Root](#14-m1--catalogo-ruoli-e-aggregate-root)
15. [M2 — Qualifiche](#15-m2--qualifiche)
16. [M3 — Fonti ed evidenze](#16-m3--fonti-ed-evidenze)
17. [M4 — Autorizzazione gestionale e responsabilità](#17-m4--autorizzazione-gestionale-e-responsabilità)
18. [M5 — Verifiche per aspetto](#18-m5--verifiche-per-aspetto)
19. [M6 — Assente](#19-m6--assente)
20. [M7 — Assente](#20-m7--assente)
21. [M8 — Seed e validazione](#21-m8--seed-e-validazione)
22. [Integrazione con Opportunità](#22-integrazione-con-opportunità)
23. [RLS e privilegi](#23-rls-e-privilegi)
24. [Seed](#24-seed)
25. [Test previsti](#25-test-previsti)
26. [Confutazione indipendente](#26-confutazione-indipendente)
27. [Questioni aperte](#27-questioni-aperte)
28. [Stop point finale](#28-stop-point-finale)

---

## 1. Scopo

Trasformare Logical e Physical di Appartenenze in un piano di migrazione completo, atomico e revisionabile, determinando in modo definitivo le unità **M1–M8** **prima** della generazione di qualsiasi migration SQL.

Il piano chiude, senza riprodurre automaticamente Imprese o Opportunità:

1. naming definitivo della tabella radice;
2. rappresentazione della contestazione;
3. rappresentazione della temporalità incerta;
4. necessità effettiva di `business_membership_verifications`;
5. necessità effettiva del catalogo ruoli e delle qualifiche;
6. numero definitivo delle unità SQL.

---

## 2. Documenti fondativi

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `logical/appartenenze.md` | Modello logico |
| 2 | `physical/domain-mapping/appartenenze.md` (§32 DDL-ready) | **Fonte normativa immediata** |
| 3 | `physical/domain-dependency-map.md` | Dipendenze D1–D3; D17 opaco |
| 4 | `fundamental/domain-patterns.md` | Pattern trasversali |
| 5 | `physical/architecture-baseline.md` | Catena mapping → piano → SQL |
| Confine | Logical/Physical Persone, Imprese, Opportunità; Logical Identità & Accessi; Thesis/Logical/Physical Professionisti e Collaborazioni | Solo confini |
| Vincolo | Migration `profiles`, `businesses`, `opportunity_party_references`, `opportunity_representation_utilizations` | Compatibilità; nessuna modifica |

---

## 3. Responsabilità del dominio

Rappresentare le relazioni organizzative **Persona–Impresa**: chi è collegato a chi, con quale ruolo, per quale periodo, in base a quale fonte, con quale evidenza di verifica ed eventualmente con quale facoltà di gestire la scheda impresa.

Non comprende: identità digitale; autenticazione; permessi applicativi; Collaborazioni; Opportunità; Eventi; dati personali; dati descrittivi Impresa; qualifiche professionali.

---

## 4. Perimetro del ciclo

| Incluso | Escluso |
|---|---|
| Solo legame **Persona–Impresa** | Organizzazioni istituzionali |
| Una tabella radice tipizzata | FK polimorfica soggetto |
| Catalogo ruoli C03 locale | Quote societarie / titolare effettivo |
| Qualifiche, fonti, evidenze, responsabilità, autorizzazione gestionale, verifiche per aspetto | Storia/audit tables non prescritte |
| Seed normativo catalogo ruoli | Seed demo di istanze |

**Dichiarazione vincolante.** Persona–Impresa soltanto; Organizzazioni escluse; nessuna FK polimorfica.

---

## 5. Dipendenze disponibili

| Dipendenza | Oggetto | Stato | Uso |
|---|---|---|---|
| Persone | `public.profiles(id)` | Presente | FK `person_id` ON DELETE RESTRICT |
| Imprese | `public.businesses(id)` | Presente | FK `business_id` ON DELETE RESTRICT |

Nessuna FK a `auth.users`. Nessuna dipendenza da Opportunità, Professionisti, Collaborazioni, Identità & Accessi per il ciclo strutturale.

---

## 6. Confini di ownership

| Fatto | Proprietario | Appartenenze |
|---|---|---|
| Identità Persona | Persone | Solo riferimento |
| Identità Impresa | Imprese | Solo riferimento |
| Relazione, ruolo, periodo, stati, fonti, evidenze, responsabilità, autorizzazione gestionale | **Appartenenze** | Ownership piena |
| `membership_id` su utilizzi Opportunità | Opportunità (colonna locale opaca) | Non modifica; FK additiva futura fuori piano |
| Permessi tecnici / RLS di accesso | Identità & Accessi | Non in questo ciclo |
| Vista sintesi “chi anima l’Impresa” | Imprese (non normativa) | Fonte autorevole resta Appartenenze |

---

## 7. Principi di migrazione

1. Physical (§32) prima dello schema SQL.
2. Strategia additiva; nessuna rewrite di Persone/Imprese/Opportunità.
3. Un solo Aggregate Root; nessuna promozione di Entity dipendenti.
4. Assi distinti: editoriale, relazione, verifica, contestazione, visibilità, ruolo, responsabilità, autorizzazione gestionale — nessun stato sintetico.
5. Storicizzazione tramite righe e chiusura periodo (PF8), non tabelle audit inventate.
6. Successione ruoli = conclusione riga + nuova Appartenenza; mai overwrite in-place del ruolo.
7. Unità atomiche reviewabili; nessuna frammentazione artificiale e nessuna fusione che nasconda responsabilità.
8. RLS difensiva senza policy/GRANT; nessun `auth.uid()`.
9. Seed demo = SKIP; seed normativo solo catalogo ruoli.
10. Non copiare M3/M6/M7 di Opportunità o Imprese per analogia.

---

## 8. Decisioni fisiche definitive

### 8.1 Naming tabella radice

| Candidato | Esito |
|---|---|
| `memberships` | **Scartato** — troppo generico; rischia di suggerire appartenenza a soggetti non-Impresa |
| `business_memberships` | **Adottato** — perimetro Persona–Impresa esplicito; coerente con `businesses`; lascia spazio a future tabelle tipizzate (es. org) senza FK polimorfica |

**Nome definitivo:** `public.business_memberships`.

Prefisso figlie: `business_membership_*`.

### 8.2 Contestazione

| Opzione | Esito |
|---|---|
| A — `is_contested boolean` | **Adottata** |
| B — valore `contested` in `verification_status` | Scartata — fuse contestazione e verifica ordinaria; impedisce coesistenza con `unverified` / `in_review` / `confirmed` |
| C — tabella/asse distinto | Scartata — Logical/Physical trattano la contestazione come overlay sul fatto di verifica, non come Aggregate autonomo |

**Motivazione.** Logical §6: Contestata “può sovrapporsi in qualsiasi momento”; Physical DA8: valore sovrapposto. Overlay booleano preserva lo stato di verifica ordinario.

`verification_status` chiuso: `unverified` | `in_review` | `confirmed`.

Visibilità Logical “Contestata” = regola di presentazione quando `is_contested = true`, **non** literal aggiuntivo obbligatorio in `visibility_status` (vocabolario: `private` | `internal` | `editorial` | `public` | `historical`).

### 8.3 Relazione in corso

| Opzione | Esito |
|---|---|
| Solo `ended_at IS NULL` | Scartata — ambigua rispetto a sospensione e a date incerte |
| `relation_status = active` esplicito | **Adottata** |

Vocabolario chiuso `relation_status`: `active` | `suspended` | `concluded` | `revoked` | `archived`.

`active` è la codifica DDL dello “in corso” implicito del Logical §6b — non un significato nuovo.

### 8.4 Periodo incerto

Nullable `started_at` / `ended_at` (tipo `date`). **Nessun** flag di approssimazione, **nessuna** precisione separata. Logical §7/§12 regola 12: assenza di data certa è dato legittimo.

### 8.5 Verifiche per aspetto

`business_membership_verifications` **inclusa**. Logical §10 e Physical §13 prescrivono sette assi indipendenti con esito corrente per aspetto. Non è analogia Imprese/Opportunità: è contratto di dominio.

### 8.6 Fonti ed evidenze

Due tabelle distinte:

- `business_membership_sources` — 1..N per appartenenza (R6);
- `business_membership_evidences` — 0..N; FK opzionale a fonte; aspetto/i sostenuti.

Non fonderle; non copiare M3 Opportunità.

### 8.7 Ruoli e qualifiche

| Oggetto | Inclusione | Motivo |
|---|---|---|
| `business_membership_roles` | **Sì** | Catalogo C03 obbligatorio (11 voci); R3 = esattamente 1 ruolo |
| `business_membership_qualifications` | **Sì** | E04 testo libero ripetibile 0..N; precisa il ruolo senza catalogo |

### 8.8 Responsabilità dichiarate

Tabella `business_membership_responsibility_declarations` con codice chiuso a cinque valori e `UNIQUE (membership_id, responsibility_code)`.

**Non** cinque booleani sulla radice (assenza di dichiarazione ≠ false); **non** catalogo separato (vocabolario fisso piccolo).

Codici: `ownership` | `legal_representation` | `operational_representation` | `sheet_management` | `contact_referent`.

### 8.9 Autorizzazione gestionale

Tabella `business_membership_management_authorizations` 0..1 per appartenenza (`UNIQUE (membership_id)`).

Rappresenta: concessione dichiarativa di business, stato corrente, periodo, revoca, fonte/nota. **Non** RLS, **non** permessi applicativi, **non** `auth.users`, **non** deleghe Identità & Accessi.

### 8.10 Unicità Persona–Impresa

**Nessuna** `UNIQUE (person_id, business_id)`.  
**Nessuna** UNIQUE parziale inventata su ruolo attivo.  
Logical §13 consente più Appartenenze contemporanee (nature diverse). Controllo di incompatibilità = applicativo/governance (§30.21 Physical), non exclusion constraint.

---

## 9. Inventario degli oggetti fisici

| Oggetto | Tipo | Responsabilità | Unità |
|---|---|---|---|
| `business_membership_roles` | Catalogo C03 | Vocabolario ruoli + nature tipiche descrittive | M1.1 |
| `business_memberships` | Aggregate Root | Relazione Persona–Impresa + assi + periodo + ruolo | M1.2 |
| `business_membership_qualifications` | Entity E04 | Precisazioni testuali del ruolo | M2.1 |
| `business_membership_sources` | Entity V03 | Origine delle dichiarazioni | M3.1 |
| `business_membership_evidences` | Entity E02+V02 | Prove a supporto degli assi | M3.2 |
| `business_membership_management_authorizations` | Entity E02+R06 | Facoltà gestionale di business 0..1 | M4.1 |
| `business_membership_responsibility_declarations` | Entity E02 | Cinque responsabilità indipendenti | M4.2 |
| `business_membership_verifications` | Entity V04 current-state | Esito corrente per ciascuno dei 7 aspetti | M5.1 |

---

## 10. Grafo delle dipendenze

```text
profiles ──────────────┐
                       ├──► business_memberships ◄── business_membership_roles
businesses ────────────┘              │
                                      ├──► business_membership_qualifications
                                      ├──► business_membership_sources
                                      │         └──► business_membership_evidences
                                      ├──► business_membership_management_authorizations
                                      ├──► business_membership_responsibility_declarations
                                      └──► business_membership_verifications
```

Nessun arco verso Opportunità in questo piano.

---

## 11. Ordine delle migration

1. M1.1 catalogo ruoli (+ seed normativo)  
2. M1.2 Aggregate Root completo (assi + periodo + `role_id`)  
3. M2.1 qualifiche  
4. M3.1 fonti  
5. M3.2 evidenze  
6. M4.1 autorizzazione gestionale  
7. M4.2 dichiarazioni di responsabilità  
8. M5.1 verifiche per aspetto  
9. *(M6 assente)*  
10. *(M7 assente)*  
11. M8.1 seed demo = SKIP  
12. M8.2 validation report (non SQL)

**Stop points consigliati:** dopo M1.2; dopo M3.2; dopo M5.1; dopo M8.2.

---

## 12. Inventario delle unità

| Blocco | Unità | Nome | Natura | Dipendenze |
|---|---|---|---|---|
| M1 | M1.1 | create business membership roles | SQL | — |
| M1 | M1.2 | create business memberships | SQL | M1.1; `profiles`; `businesses` |
| M2 | M2.1 | create business membership qualifications | SQL | M1.2 |
| M3 | M3.1 | create business membership sources | SQL | M1.2 |
| M3 | M3.2 | create business membership evidences | SQL | M1.2; M3.1 |
| M4 | M4.1 | create business membership management authorizations | SQL | M1.2 |
| M4 | M4.2 | create business membership responsibility declarations | SQL | M1.2 |
| M5 | M5.1 | create business membership verifications | SQL | M1.2 |
| M6 | — | *(assente)* | — | — |
| M7 | — | *(assente)* | — | — |
| M8 | M8.1 | demo/seed instances | SKIPPATA | — |
| M8 | M8.2 | validate and reconcile | Report non SQL — ACCETTATA | M1–M5 |

**Totale:** 8 unità SQL (tutte completate) + 1 unità non SQL (M8.2 ACCETTATA) + 1 SKIP (M8.1).  
Blocchi assenti: M6, M7 (motivati).

---

## 13. Valutazione delle ipotesi di sequenza

### Ipotesi A — Nucleo completo in M1.2

Radice con tutti gli assi, ruolo e temporalità fin dall’inizio (dopo catalogo).

| Criterio | Valutazione |
|---|---|
| Vantaggi | AR dichiarabile completo; review unica del nucleo; evita ALTER additivi sugli assi |
| Criticità | File M1.2 più denso |
| Coerenza documentale | Alta — Logical richiede Ruolo+Periodo+assi per Dichiarata |
| Impatto sequenza | M1.1 → M1.2 |
| **Esito** | **Adottata** (con catalogo prima) |

### Ipotesi B — Nucleo minimo + completamento assi

| Esito | **Scartata** — gli assi non sono opzionali; frammentazione artificiale stile Opportunità M1.1/M1.2 non motivata qui |

### Ipotesi C — Catalogo ruoli prima della radice

| Esito | **Adottata** come M1.1 — `role_id` NOT NULL richiede catalogo preesistente |

### Ipotesi D — Radice senza ruolo, ruolo aggiunto dopo

| Esito | **Scartata** — viola R3 (esattamente 1 Ruolo); AR incompleto non reviewabile come Dichiarata |

### Ipotesi E — Verifiche aggregate nel blocco fonti/evidenze

| Esito | **Scartata** — current-state per aspetto ≠ fonti/evidenze; responsabilità distinte |

### Ipotesi F — Verifiche separate

| Esito | **Adottata** come M5.1 |

---

## 14. M1 — Catalogo ruoli e Aggregate Root

### M1.1 — create business membership roles

* **Responsabilità:** catalogo C03 dei ruoli + nature tipiche descrittive.
* **File previsto:** `supabase/migrations/<ts>_create_business_membership_roles.sql`
* **Oggetti creati:** `public.business_membership_roles`
* **Colonne (ordine):** `code` (text PK); `label_it` (text NOT NULL); `typical_natures` (text NOT NULL — elenco descrittivo, non vincolo); `sort_order` (int NOT NULL); `is_active` (boolean NOT NULL DEFAULT true); `created_at` / `updated_at` (timestamptz NOT NULL DEFAULT now())
* **PK:** `code`
* **FK / ON DELETE:** nessuna
* **CHECK:** `btrim(code) <> ''`; `btrim(label_it) <> ''`; `sort_order >= 0`
* **UNIQUE:** PK
* **Indici:** nessuno oltre PK
* **Funzione/trigger:** `set_updated_at` dedicato
* **RLS:** ENABLE; nessuna policy
* **Privilegi:** `REVOKE ALL` da `anon`, `authenticated`; nessun GRANT
* **Seed normativo (11 voci):**

| code | label_it |
|---|---|
| `founder` | Fondatore |
| `owner` | Titolare |
| `partner` | Socio |
| `administrator` | Amministratore |
| `legal_representative` | Legale rappresentante |
| `executive` | Dirigente |
| `employee` | Dipendente |
| `consultant` | Consulente |
| `collaborator` | Collaboratore |
| `contact_referent` | Referente |
| `sheet_manager` | Gestore della scheda |

* **Commenti:** tabella e colonne chiave
* **Dipendenze:** nessuna
* **Esclusi:** FK polimorfica; natura tipica come CHECK vincolante di responsabilità; seed demo
* **Test statici:** 11 seed; PK; RLS; REVOKE
* **Test runtime:** insert rifiutata senza code; updated_at; rollback pulito
* **Stop point:** opzionale

### M1.2 — create business memberships

* **Responsabilità:** Aggregate Root Persona–Impresa con assi indipendenti, periodo, ruolo.
* **File previsto:** `supabase/migrations/<ts>_create_business_memberships.sql`
* **Oggetti creati:** `public.business_memberships` + trigger `updated_at`
* **Colonne (ordine):**

| Colonna | Tipo | Null | Default | Note |
|---|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `person_id` | uuid | NOT NULL | — | FK → `profiles(id)` |
| `business_id` | uuid | NOT NULL | — | FK → `businesses(id)` |
| `role_id` | text | NOT NULL | — | FK → `business_membership_roles(code)` |
| `editorial_status` | text | NOT NULL | `'proposed'` | CHECK sotto |
| `relation_status` | text | NOT NULL | `'active'` | CHECK sotto |
| `verification_status` | text | NOT NULL | `'unverified'` | CHECK sotto |
| `is_contested` | boolean | NOT NULL | `false` | Overlay contestazione |
| `visibility_status` | text | NOT NULL | `'private'` | CHECK sotto |
| `started_at` | date | NULL | — | Periodo; incertezza = NULL |
| `ended_at` | date | NULL | — | Aperto se NULL |
| `cessation_reason` | text | NULL | — | Anti-blank se valorizzato |
| `contextual_notes` | text | NULL | — | Anti-blank se valorizzato |
| `created_at` | timestamptz | NOT NULL | `now()` | |
| `updated_at` | timestamptz | NOT NULL | `now()` | |

* **PK:** `id`
* **FK / ON DELETE:**
  * `person_id` → `public.profiles(id)` **ON DELETE RESTRICT**
  * `business_id` → `public.businesses(id)` **ON DELETE RESTRICT**
  * `role_id` → `public.business_membership_roles(code)` **ON DELETE RESTRICT**
* **CHECK:**
  * `editorial_status IN ('proposed','declared')`
  * `relation_status IN ('active','suspended','concluded','revoked','archived')`
  * `verification_status IN ('unverified','in_review','confirmed')`
  * `visibility_status IN ('private','internal','editorial','public','historical')`
  * `(ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)`
  * `relation_status IN ('active','suspended') OR ended_at IS NOT NULL` — stati conclusivi/revoca/archivio richiedono fine
  * `relation_status <> 'active' OR ended_at IS NULL` — attivo non ha fine
  * `relation_status <> 'suspended' OR ended_at IS NULL` — sospensione senza chiusura
  * anti-blank su `cessation_reason`, `contextual_notes` quando NOT NULL
* **UNIQUE:** nessuna su `(person_id, business_id)`
* **Indici:** `(person_id)`, `(business_id)`, `(role_id)`, `(relation_status)`, `(is_contested)` dove utile
* **Funzione/trigger:** `business_memberships_set_updated_at`
* **RLS / privilegi:** come pattern §23
* **Seed:** nessuno
* **Commenti:** tabella; assi; `is_contested`; FK RESTRICT; mapping `active` ↔ “in corso”
* **Dipendenze:** M1.1; `profiles`; `businesses`
* **Esclusi:** `auth.users`; CASCADE da Persona/Impresa; booleans responsabilità; colonne verifica per aspetto; FK Opportunità; soft-delete non prescritto
* **Test statici:** colonne; CHECK; FK RESTRICT; assenza UNIQUE persona-impresa; RLS; REVOKE
* **Test runtime:** multi-ruolo stessa coppia; successione; sospensione senza `ended_at`; concluded con `ended_at`; contested + confirmed; NULL dates; delete profile/business bloccato; CASCADE non presente; rollback
* **Stop point:** **sì** — nucleo reviewabile

---

## 15. M2 — Qualifiche

### M2.1 — create business membership qualifications

* **Responsabilità:** precisazioni testuali 0..N del ruolo (E04).
* **File previsto:** `supabase/migrations/<ts>_create_business_membership_qualifications.sql`
* **Oggetti:** `public.business_membership_qualifications`
* **Colonne:** `id` uuid PK; `membership_id` uuid NOT NULL; `label` text NOT NULL; `sort_order` int NOT NULL DEFAULT 0; `created_at` / `updated_at`
* **FK:** `membership_id` → `business_memberships(id)` **ON DELETE CASCADE**
* **CHECK:** `btrim(label) <> ''`; `sort_order >= 0`
* **UNIQUE:** `UNIQUE (membership_id, label)` — evita duplicati identici; non catalogo
* **Indici:** `(membership_id)`
* **Trigger / RLS / privilegi:** pattern standard
* **Seed:** nessuno
* **Esclusi:** catalogo qualifiche; FK a Professionisti
* **Test:** CASCADE da membership; UNIQUE label; rollback
* **Stop point:** no

---

## 16. M3 — Fonti ed evidenze

### M3.1 — create business membership sources

* **Responsabilità:** origini dichiarative 1..N (cardinalità minima applicativa; DB consente 0 per proposte incomplete).
* **File previsto:** `..._create_business_membership_sources.sql`
* **Colonne:** `id`; `membership_id` NOT NULL; `source_kind` text NOT NULL; `reliability_note` text NULL; `reference_label` text NULL; `declared_at` timestamptz NULL; `created_at` / `updated_at`
* **FK:** `membership_id` → AR **ON DELETE CASCADE**
* **CHECK:** `source_kind IN ('person_self_declaration','business_declaration','public_register','entitled_third_party','editorial_moderation')`; anti-blank note/label
* **UNIQUE:** nessuna globale
* **Indici:** `(membership_id)`
* **Esclusi:** score numerico attendibilità; FK a soggetti terzi
* **Test:** INSERT multi-fonte; CASCADE; rollback

### M3.2 — create business membership evidences

* **Responsabilità:** evidenze 0..N che sostengono aspetti.
* **File previsto:** `..._create_business_membership_evidences.sql`
* **Colonne:** `id`; `membership_id` NOT NULL; `source_id` uuid NULL; `supported_aspect` text NOT NULL; `summary` text NOT NULL; `observed_at` timestamptz NULL; `created_at` / `updated_at`
* **FK:**  
  * `membership_id` → AR **ON DELETE CASCADE**  
  * `source_id` → `business_membership_sources(id)` **ON DELETE SET NULL**
* **CHECK:** `supported_aspect IN` i 7 aspetti (§18); `btrim(summary) <> ''`
* **Nota:** un’evidenza sostiene un aspetto per riga; più righe per più aspetti (evita array/JSON).
* **Indici:** `(membership_id)`, `(source_id)`, `(supported_aspect)`
* **Esclusi:** storage documentale binario; history table
* **Test:** SET NULL su delete fonte; CASCADE membership; rollback

---

## 17. M4 — Autorizzazione gestionale e responsabilità

### M4.1 — create business membership management authorizations

* **Responsabilità:** fatto di business 0..1 (R8).
* **File previsto:** `..._create_business_membership_management_authorizations.sql`
* **Colonne:** `id`; `membership_id` NOT NULL; `authorization_status` text NOT NULL DEFAULT `'granted'`; `granted_at` timestamptz NULL; `revoked_at` timestamptz NULL; `source_note` text NULL; `created_at` / `updated_at`
* **FK:** `membership_id` → AR **ON DELETE CASCADE**
* **UNIQUE:** `UNIQUE (membership_id)` — al più una riga corrente
* **CHECK:** `authorization_status IN ('granted','revoked')`; `(authorization_status <> 'revoked' OR revoked_at IS NOT NULL)`; `(revoked_at IS NULL OR granted_at IS NULL OR revoked_at >= granted_at)`; anti-blank `source_note`
* **Esclusi:** RLS policy; mapping a `auth.users`; deleghe; GRANT
* **Test:** seconda riga stessa membership rifiutata; revoca; CASCADE

### M4.2 — create business membership responsibility declarations

* **Responsabilità:** dichiarazioni indipendenti delle cinque responsabilità §8.
* **File previsto:** `..._create_business_membership_responsibility_declarations.sql`
* **Colonne:** `id`; `membership_id` NOT NULL; `responsibility_code` text NOT NULL; `is_declared` boolean NOT NULL DEFAULT true; `note` text NULL; `created_at` / `updated_at`
* **FK:** CASCADE da AR
* **UNIQUE:** `UNIQUE (membership_id, responsibility_code)`
* **CHECK:** `responsibility_code IN ('ownership','legal_representation','operational_representation','sheet_management','contact_referent')`; anti-blank note
* **Esclusi:** inferenza automatica da `role_id`; booleans sulla radice
* **Test:** cinque righe ammesse; duplicato codice rifiutato; indipendenza da ruolo

---

## 18. M5 — Verifiche per aspetto

### M5.1 — create business membership verifications

* **Responsabilità:** stato corrente V04 per ciascuno dei 7 aspetti.
* **File previsto:** `..._create_business_membership_verifications.sql`
* **Colonne:** `id`; `membership_id` NOT NULL; `aspect` text NOT NULL; `status` text NOT NULL DEFAULT `'unverified'`; `verified_at` timestamptz NULL; `expires_at` timestamptz NULL; `source_note` text NULL; `created_at` / `updated_at`
* **FK:** CASCADE da AR
* **UNIQUE:** `UNIQUE (membership_id, aspect)`
* **CHECK:**
  * `aspect IN ('identity','business_existence','relation_effectiveness','role','period','representation','management_authorization')`
  * `status IN ('unverified','in_review','confirmed','rejected')`
  * anti-blank `source_note`
* **Indici:** `(membership_id)`, `(aspect)`
* **Esclusi:** badge unico “membership verified”; history table; sync automatica con Persone/Imprese (aspetti referenziati restano esiti locali)
* **Nota:** `verification_status` sull’AR è sintesi editoriale/comunicativa consentita a livello riga; **non** sostituisce le 7 righe aspetto. Nessun trigger di sincronizzazione obbligatoria in questo ciclo (gate applicativo).
* **Test:** 7 aspetti; UNIQUE; indipendenza stati; CASCADE; rollback
* **Stop point:** **sì** — dominio strutturale completo

---

## 19. M6 — Assente

Nessuna migration Appartenenze appartiene a M6.

**Motivazione.** L’unica integrazione strutturale verso Opportunità (`membership_id` opaco) è di proprietà della colonna Opportunità. Non si crea unità artificiale. Vedi §22.

---

## 20. M7 — Assente

Nessuna M7.1 comment-only.

**Motivazione.** I commenti SQL prescritti sono parte integrante di ciascuna unità M1–M5; il Physical §32 chiude i rinvii semantici DDL-ready. Non esistono colonne preesistenti di Appartenenze da ricommentare. Non si replica M7 Imprese.

---

## 21. M8 — Seed e validazione

### M8.1 — seed demo

**Decisione formale: SKIPPATA.**

Non è stata creata né è richiesta alcuna migration M8.1.

**Motivazione.**

- Il catalogo normativo dei 11 ruoli è seed **normativo** di M1.1, non seed demo di istanze.
- Non esistono requisiti Logical/Physical che impongano persone, imprese, appartenenze, qualifiche, fonti, evidenze, autorizzazioni, responsabilità o verifiche dimostrative.
- `supabase/seed.sql` è assente; i dati instance devono nascere dall’applicazione o da workflow amministrativi.
- Introdurre soggetti o rapporti fittizi in SQL sarebbe improprio senza decisione architetturale esplicita futura.

### M8.2 — validation report

**Esito: ACCETTATA.**

Artefatto non SQL: `docs/architecture/migrations/appartenenze-m8.2-validation-report.md`.

Valida staticamente Logical → Physical → Plan → SQL M1.1–M5.1; registra l’assenza motivata di M6/M7 e lo SKIP di M8.1; distingue la validazione statica dalle evidenze runtime già ottenute nelle applicazioni controllate M1.1–M5.1 (`supabase db reset`, catalogo PostgreSQL, test comportamentali, rollback, zero residui, zero regressioni). **Non** riesegue test runtime e **non** è migration.

---

## 22. Integrazione con Opportunità

| Decisione | Stato |
|---|---|
| `membership_id` resta UUID opaco | Confermato (migration M6.2 Opportunità) |
| Appartenenze non modifica migration Opportunità | Vincolante |
| Eventuale FK | Decisione **additiva separata** |
| Dominio proprietario della colonna | **Opportunità** |
| Comportamento candidato FK | `ON DELETE SET NULL` — **non ratificato** senza review Opportunità |
| Riapertura automatica Opportunità | **No** |

---

## 23. RLS e privilegi

Per **tutte** le tabelle Appartenenze:

* `ENABLE ROW LEVEL SECURITY`
* nessuna policy definitiva
* `REVOKE ALL` da `anon` e `authenticated`
* nessun `GRANT`

Vietati in questo ciclo: VIS02 implementata; autorizzazioni account; policy basate su membership; `auth.uid()`. Appartengono a Identità & Accessi.

---

## 24. Seed

| Tipo | Ammissione | Stato |
|---|---|---|
| Seed normativo catalogo ruoli (M1.1) | **Sì** — 11 voci chiuse | **Presente** in M1.1 |
| Seed demo istanze | **No** | **M8.1 SKIPPATA** |

---

## 25. Test previsti

### Statici (ogni unità)

Oggetti; colonne; vincoli; dipendenze; ownership; vocabolari chiusi; assenza elementi vietati (`auth.users`, CASCADE da soggetti, UNIQUE persona-impresa, FK Opportunità, policy, GRANT, seed demo).

### Runtime (dopo SQL)

Reset completo; FK; RESTRICT su delete Persona/Impresa; CASCADE delle owned; CHECK temporali e di stato; UNIQUE qualifiche/responsabilità/verifiche/auth; trigger `updated_at`; RLS senza policy; privilegi revocati; rollback; zero dati residui di test; seed catalogo invariato (11 ruoli).

**Non** attribuire al DB gate applicativi non implementati (es. “Dichiarata richiede ≥1 fonte”, ceiling di visibilità vs profilo/scheda).

---

## 26. Confutazione indipendente

Tentativo di dimostrare che il piano è errato:

| Accusa | Esito |
|---|---|
| Unità per analogia Imprese/Opportunità | **Respinta** — unità derivate da R3–R8 e §8–§10 Logical |
| Tabella verifica non supportata | **Respinta** — 7 aspetti Logical §10 / Physical §13 |
| Catalogo ruolo inutile | **Respinta** — C03 + `role_id` NOT NULL |
| Qualifiche ridondanti | **Respinta** — E04 distinta dal catalogo |
| Contestazione fusa | **Corretta e evitata** — `is_contested` |
| Stato attivo implicito ambiguo | **Corretta e evitata** — `relation_status = active` |
| UNIQUE che blocca multi-ruolo | **Evitata** — nessuna UNIQUE persona-impresa |
| FK `auth.users` | **Evitata** |
| CASCADE da Persona/Impresa | **Evitata** — RESTRICT |
| Responsabilità = ruoli | **Evitata** — tabella dichiarazioni separata |
| Autorizzazione = RLS | **Evitata** |
| FK Opportunità nel dominio sbagliato | **Evitata** — M6 assente |
| M7 comment-only artificiale | **Evitata** — M7 assente |
| Seed demo | **Evitata** — SKIP |
| Organizzazioni anticipate | **Evitata** |
| Storia/audit non prescritti | **Evitata** |
| Più migration del necessario | **Valutata** — 8 SQL è il minimo che preserva atomicità reviewabile (catalogo, AR, qualifiche, fonti, evidenze, auth, responsabilità, verifiche). Ulteriori fusioni (es. M4.1+M4.2) ridurrebbero review indipendente di R8 vs §8 senza guadagno di dipendenza |

Nessuna correzione strutturale aggiuntiva richiesta oltre le decisioni già adottate.

---

## 27. Questioni aperte

Restano aperte **solo** questioni non necessarie al ciclo SQL:

1. Governance estensione catalogo ruoli  
2. Quote / percentuali proprietà  
3. Titolare effettivo  
4. Sufficienza conferma reciproca  
5. Durata validità evidenza (scadenza applicativa)  
6. Import storico da registri  
7. Default pubblicabilità storico  
8. Termine risoluzione contestazione  
9. FK additiva Opportunità `membership_id` (decisione separata)  
10. Organizzazioni istituzionali  

---

## 28. Stop point finale

`DOMINIO APPARTENENZE COMPLETATO E ACCETTATO` — ciclo M1–M8 chiuso: 8 migration SQL create, applicate e verificate runtime; M6/M7 assenti per motivazione; M8.1 SKIPPATA; M8.2 ACCETTATA. Autorizzazioni tecniche, policy RLS definitive, organizzazioni istituzionali, history/audit e FK additiva Opportunità restano fuori perimetro o rinviati.

**Distinzione vincolante.**

- **Accettazione statica M8.2:** riconciliazione Logical → Physical → Plan → SQL e assenza elementi vietati.
- **Evidenze runtime M1.1–M5.1:** già completate nelle applicazioni controllate precedenti; non rieseguite in M8.2; restano prerequisito operativo già soddisfatto.

---

## Deliverable di sequenza

| Unit | File | Stato |
|---|---|---|
| M1.1 | `20260731230000_create_business_membership_roles.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M1.2 | `20260731231000_create_business_memberships.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M2.1 | `20260731232000_create_business_membership_qualifications.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M3.1 | `20260731233000_create_business_membership_sources.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M3.2 | `20260731234000_create_business_membership_evidences.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M4.1 | `20260731235000_create_business_membership_management_authorizations.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M4.2 | `20260731236000_create_business_membership_responsibility_declarations.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M5.1 | `20260731237000_create_business_membership_verifications.sql` | **Completata** — SQL creato, applicato, verificato runtime |
| M6 | — | **Assente motivato** — integrazione Opportunità non in ownership Appartenenze |
| M7 | — | **Assente motivato** — commenti SQL inclusi in M1–M5 |
| M8.1 | — | **SKIPPATA** — nessun seed demo |
| M8.2 | `docs/architecture/migrations/appartenenze-m8.2-validation-report.md` | **ACCETTATA** — validazione statica finale |

**MIGRATION PLAN APPARTENENZE CHIUSO** — dominio strutturalmente completo e accettato; nessuna unità SQL ulteriore Appartenenze in questo ciclo.
