# Professionisti — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.  
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica il contratto fisico §29.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/professionisti.md` **§29 — Contratto fisico DDL-ready — ciclo 1**.

**Regola di autorità.** Il Plan **organizza** il contratto §29 in blocchi e unità; **non** lo ridiscute, non lo altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi.

---

## Indice

1. [Scopo](#1-scopo)
2. [Autorità e fonti](#2-autorità-e-fonti)
3. [Principi](#3-principi)
4. [Stato iniziale del dominio](#4-stato-iniziale-del-dominio)
5. [Perimetro del ciclo 1](#5-perimetro-del-ciclo-1)
6. [Oggetti esclusi e rinviati](#6-oggetti-esclusi-e-rinviati)
7. [Dipendenze esterne](#7-dipendenze-esterne)
8. [Regole comuni a tutte le migration](#8-regole-comuni-a-tutte-le-migration)
9. [Matrice completa delle 20 tabelle](#9-matrice-completa-delle-20-tabelle)
10. [Struttura dei blocchi](#10-struttura-dei-blocchi)
11. [Ordine topologico globale](#11-ordine-topologico-globale)
12. [M1 — Cataloghi C03](#12-m1--cataloghi-c03)
13. [M2 — Aggregate Root](#13-m2--aggregate-root)
14. [M3 — Credenziali professionali](#14-m3--credenziali-professionali)
15. [M4 — Ambito dichiarato e servizi](#15-m4--ambito-dichiarato-e-servizi)
16. [M5 — Copertura operativa](#16-m5--copertura-operativa)
17. [M6 — Fonti, evidenze, verifiche](#17-m6--fonti-evidenze-verifiche)
18. [M7 — Assente](#18-m7--assente)
19. [M8 — Seed demo e validazione finale](#19-m8--seed-demo-e-validazione-finale)
20. [Slugs delle future migration](#20-slugs-delle-future-migration)
21. [Strategia timestamp](#21-strategia-timestamp)
22. [Naming constraint, indici, trigger (≤63 byte)](#22-naming-constraint-indici-trigger-63-byte)
23. [Review per unità](#23-review-per-unità)
24. [Review per blocco](#24-review-per-blocco)
25. [Strategia di test](#25-strategia-di-test)
26. [Apply locale e remoto](#26-apply-locale-e-remoto)
27. [Strategia commit e push](#27-strategia-commit-e-push)
28. [Stop point del Plan](#28-stop-point-del-plan)
29. [Checklist conclusiva](#29-checklist-conclusiva)
30. [Confutazione indipendente](#30-confutazione-indipendente)

---

## 1. Scopo

Determinare in modo definitivo le unità **M1–M8** del dominio Professionisti **prima** della generazione di qualsiasi migration SQL, traducendo §29 in:

* blocchi di lavoro revisionabili;
* unità migration indipendenti (una responsabilità primaria per file);
* ordine topologico certificabile;
* assegnazione esatta di tabelle, vincoli, seed e oggetti tecnici;
* sequenza di review → dry-run → apply → test → commit → validazione finale.

Al termine di questo documento, il dominio è **strutturalmente determinabile per SQL**. M1–M3 sono chiuse e versionate; il blocco M4 ha contratto completo per creazione accelerata delle tre migration (§15).

---

## 2. Autorità e fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/professionisti.md` **§29** | **Contratto DDL-ready vincolante** |
| 2 | `physical/domain-mapping/professionisti.md` §1–§28 | Significato fisico concettuale |
| 3 | `logical/professionisti.md` | Modello logico |
| 4 | `fundamental/professionisti-domain-thesis.md` | Tesi di dominio |
| 5 | `physical/domain-dependency-map.md` (D10–D13) | Dipendenze consolidate |
| 6 | `fundamental/domain-patterns.md` | Pattern trasversali |
| 7 | `physical/architecture-baseline.md`, `01`–`04` | Catena mapping → plan → SQL |
| Metodo | `migrations/mercati-internazionali-migration-plan.md`, `appartenenze-migration-plan.md`, validation report MI | Struttura e rigore — **non** contenuto da copiare |

**Target tecnico di progetto.** PostgreSQL **17.6.1**; Supabase CLI di riferimento repository **2.109.1** (locale può differire; l’apply userà la CLI operativa del momento).

---

## 3. Principi

1. **Single Aggregate Root:** solo `public.professional_profiles`.  
2. **Soggetto sempre Persona:** FK obbligatoria `person_id` → `public.profiles`; UNIQUE uno-a-uno; nessuna AR “Professionista”; nessun XOR Persona/Impresa; nessuna membership come soggetto.  
3. **`context_business_id` ≠ membership:** contesto Impresa opzionale; ON DELETE SET NULL; nessuna FK a `business_memberships`.  
4. **Quattro famiglie credenziali separate** + associazioni leggere: non unificare le tabelle.  
5. **Servizio descrittivo:** non OffertaDiServizio, non marketplace.  
6. **Territori opachi** (`country_ref`); nessuna tabella Territori inventata.  
7. **FEV profilo a 3 tabelle;** verifica d’insieme = proiezione non persistita; nessun trigger di aggregazione.  
8. **Deny-by-default:** RLS ENABLE, no FORCE, no policy, REVOKE ALL, no GRANT (§29.25–§29.26).  
9. **Seed normativo ≠ seed demo:** solo C03 nei cataloghi M1; M8.1 = SKIP.  
10. **Una responsabilità primaria per migration;** per M1–M3 vale la micro-review per unità; per **M4** la progettazione è revisionata a blocco (creazione accelerata delle tre SQL), con review SQL/apply successive.
11. **Il Plan non modifica §29.**  

---

## 4. Stato iniziale del dominio

| Elemento | Stato |
|---|---|
| Dominio concettuale (Thesis/Logical/Physical §1–§28) | Chiuso |
| Contratto DDL-ready §29 | Chiuso (+ §29.32 blocco M4 operativo) |
| Migration SQL Professionisti M1–M3 | **Presenti e applicate** (locale/remoto fino a `20260804140000`; commit `5761217`) |
| Migration SQL Professionisti M4+ | **Assenti** |
| Timestamp Professionisti più alto | `20260804140000` (M3.5) |
| Dipendenze fisiche ciclo 1 per M4 | Disponibili (M1.1, M1.4, M2.1, `competencies`) |
| Dipendenze future | Rinviate (§6) |
| SQL M4 | **Autorizzabile** dopo determinazione blocco (§15) — non ancora creato |
| Working tree alla stesura | `main` allineato a `origin/main`; modifica documentale prevista su `domain-mapping/professionisti.md` (§29); HEAD di riferimento iniziale `436690a` |

---

## 5. Perimetro del ciclo 1

Fedelmente da §29.1–§29.2:

| Gruppo | Contenuto |
|---|---|
| **20 tabelle** | Inventario §29.2 completo |
| **4 cataloghi C03** | categories, practice_modes, source_kinds, service_natures |
| **AR** | `professional_profiles` |
| **Credenziali** | qualifications, registrations, authorizations, certifications |
| **Associazioni leggere** | association_memberships |
| **Owned / link** | profile_categories, competencies, services, territories, languages, markets, sectors |
| **FEV profilo** | sources, evidences, verifications |
| **VO su AR** | esperienza, tariffa indicativa, disponibilità, contatti minimi (colonne, non tabelle) |

---

## 6. Oggetti esclusi e rinviati

### Esclusi (non creare)

* FK `auth.users`; policy VIS02; Storage; history table; badge/score; seed demo; OffertaDiServizio; catalogo Ordini/Collegi; soggetto Impresa; Presenza/Interesse/Attività MI; FK Opportunità/Collaborazioni/Eventi; proiezione `verification_status` complessivo sul profilo; `membership_id`; catalogo Specializzazioni; tabelle FEV per-credenziale.

### Rinviate (fuori ciclo 1 SQL)

* Specializzazioni C03 + seed; FK membership; policy RLS applicative; Storage evidenze; link territorio/lingua per-servizio; canali contatto multipli; workflow equivalenza titoli; dominio Organizzazioni; dominio Servizi; catalogo Territori condiviso.

---

## 7. Dipendenze esterne

| Tabella | Dominio | Obbligatorietà | Unità che la usano | Comportamento | Verifica preliminare |
|---|---|---|---|---|---|
| `public.profiles` | Persone | **Necessaria** | M2.1 | FK `person_id` ON DELETE **RESTRICT**; UNIQUE 1:1 | Esistenza tabella + PK `id` uuid |
| `public.businesses` | Imprese | Facoltativa | M2.1 | `context_business_id` ON DELETE **SET NULL** | Esistenza tabella + PK `id` uuid |
| `public.languages` | Tassonomia | Necessaria per M5.2 | M5.2 | FK `language_id` ON DELETE **RESTRICT** | Esistenza + PK `id` bigint |
| `public.competencies` | Tassonomia/Persone | Necessaria per M4.2 | M4.2 | FK `competency_id` ON DELETE **RESTRICT** | Esistenza + PK `id` bigint |
| `public.business_sectors` | Tassonomia | Necessaria per M5.4 | M5.4 | FK `sector_id` ON DELETE **RESTRICT** | Esistenza + PK `id` bigint |
| `public.international_markets` | Mercati Internazionali | Necessaria per M5.3 | M5.3 | FK `market_id` ON DELETE **RESTRICT** | Esistenza + PK `id` uuid |

### Dipendenze esplicitamente non usate / non disponibili

| Oggetto | Decisione del Plan |
|---|---|
| `public.business_memberships` | **Esiste** ma **non referenziata** in alcuna unità (D12 = utilizzo applicativo) |
| Tabella Territori / `countries` | **Assente** → `country_ref` opaco in M5.1 |
| Organizzazioni / Servizi | Domini futuri → nessuna FK |

---

## 8. Regole comuni a tutte le migration

| Regola | Prescrizione |
|---|---|
| Schema | `public` |
| PostgreSQL | 17.6.1 |
| PK | `uuid DEFAULT gen_random_uuid()` salvo cataloghi PK `code` text |
| Timestamps | `created_at` / `updated_at` timestamptz NOT NULL DEFAULT now() |
| Trigger `updated_at` | Funzione dedicata per tabella: `SECURITY INVOKER`, `SET search_path = ''`; un trigger `BEFORE UPDATE` |
| RLS | `ENABLE ROW LEVEL SECURITY`; **no** `FORCE`; **nessuna policy** |
| Privilegi | `REVOKE ALL` da `PUBLIC`, `anon`, `authenticated`; **nessun GRANT** |
| Commenti SQL | Obbligatori su tabella e colonne ambigue (§29.28) |
| Naming | Constraint/indici/trigger/funzioni ≤ 63 byte (§22) |
| `IF NOT EXISTS` | **Non** usare, salvo convenzione già adottata nel file legacy correlato (qui: non adottare) |
| Rollback distruttivo | Non incorporato nel file migration |
| Seed demo | Vietato |
| Modifiche domini confinanti | Vietate |
| Oggetti rinviati | Vietati |

---

## 9. Matrice completa delle 20 tabelle

| # | Tabella | Classificazione | Blocco | Unità | Dipendenze | Ordine | Seed | FEV | Stato post-migration | Review |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `professional_categories` | C03 | M1 | M1.1 | — | 1 | Sì | No | Tabella+seed | Unità+blocco M1 |
| 2 | `professional_practice_modes` | C03 | M1 | M1.2 | — | 2 | Sì | No | Tabella+seed | Unità+blocco M1 |
| 3 | `professional_source_kinds` | C03 | M1 | M1.3 | — | 3 | Sì | No | Tabella+seed | Unità+blocco M1 |
| 4 | `professional_service_natures` | C03 | M1 | M1.4 | — | 4 | Sì | No | Tabella+seed | Unità+blocco M1 |
| 5 | `professional_profiles` | A01 | M2 | M2.1 | profiles; businesses; M1.2 | 5 | No | No | AR creata | Unità+blocco M2 |
| 6 | `professional_qualifications` | E02 | M3 | M3.1 | M2.1 | 6 | No | No | Owned | Unità+blocco M3 |
| 7 | `professional_registrations` | E02 | M3 | M3.2 | M2.1 | 7 | No | No | Owned | Unità+blocco M3 |
| 8 | `professional_authorizations` | E02 | M3 | M3.3 | M2.1 | 8 | No | No | Owned | Unità+blocco M3 |
| 9 | `professional_certifications` | E02 | M3 | M3.4 | M2.1 | 9 | No | No | Owned | Unità+blocco M3 |
| 10 | `professional_association_memberships` | E02 | M3 | M3.5 | M2.1 | 10 | No | No | Owned | Unità+blocco M3 |
| 11 | `professional_profile_categories` | link/E02 | M4 | M4.1 | M2.1; M1.1 | 11 | No | No | Owned | Unità+blocco M4 |
| 12 | `professional_competencies` | E02 | M4 | M4.2 | M2.1; competencies | 12 | No | No | Owned | Unità+blocco M4 |
| 13 | `professional_services` | E02 | M4 | M4.3 | M2.1; M1.4 | 13 | No | No | Owned | Unità+blocco M4 |
| 14 | `professional_served_territories` | E02 | M5 | M5.1 | M2.1 | 14 | No | No | Owned | Unità+blocco M5 |
| 15 | `professional_operational_languages` | E02 | M5 | M5.2 | M2.1; languages | 15 | No | No | Owned | Unità+blocco M5 |
| 16 | `professional_served_markets` | link/E02 | M5 | M5.3 | M2.1; international_markets | 16 | No | No | Owned | Unità+blocco M5 |
| 17 | `professional_served_sectors` | link/E02 | M5 | M5.4 | M2.1; business_sectors | 17 | No | No | Owned | Unità+blocco M5 |
| 18 | `professional_profile_sources` | FEV | M6 | M6.1 | M2.1; M1.3 | 18 | No | Sì | FEV | Unità+blocco M6 |
| 19 | `professional_profile_evidences` | FEV | M6 | M6.2 | M6.1 | 19 | No | Sì | FEV | Unità+blocco M6 |
| 20 | `professional_profile_verifications` | FEV | M6 | M6.3 | M2.1 | 20 | No | Sì | FEV | Unità+blocco M6 |

**Certificazione matrice.** 20/20 tabelle assegnate; nessuna doppia assegnazione; nessuna anticipazione rispetto alle dipendenze; nessuna tabella rinviata implicitamente.

---

## 10. Struttura dei blocchi

La topologia §29 B1–B4 è tradotta nei blocchi definitivi seguenti (coesione semantica + dipendenze reali; nessuna simmetria artificiale).

| Codice | Titolo | Obiettivo | Tabelle | Prerequisiti | Ordine | Completamento | Stop point |
|---|---|---|---|---|---|---|---|
| **M1** | Cataloghi C03 | Creare i 4 elenchi controllati + seed normativo | 4 | nessuno | 1 | Seed conteggiati; RLS/REVOKE | Sì — dopo M1.4 |
| **M2** | Aggregate Root | Creare il Profilo professionale Persona-bound | 1 | M1.2; profiles; businesses | 2 | UNIQUE person_id; stati AR | Sì — dopo M2.1 |
| **M3** | Credenziali professionali | Quattro famiglie + associazioni | 5 | M2.1 | 3 | 5 tabelle owned | Sì — dopo M3.5 |
| **M4** | Ambito e servizi | Categorie dichiarate, competenze, servizi | 3 | M2.1; M1.1; M1.4; competencies | 4 | 3 tabelle | Sì — dopo M4.3 |
| **M5** | Copertura operativa | Territori, lingue, mercati, settori | 4 | M2.1; languages; markets; sectors | 5 | 4 tabelle | Sì — dopo M5.4 |
| **M6** | FEV profilo | Fonti → evidenze → verifiche | 3 | M2.1; M1.3 | 6 | 3 tabelle FEV; UNIQUE aspect | Sì — struttura ciclo 1 completa |
| **M7** | *(assente)* | — | 0 | — | — | Motivato §18 | — |
| **M8** | Chiusura | SKIP demo + report validazione | 0 SQL | M1–M6 | 7 | Report approvato | Sì — chiusura dominio ciclo 1 |

**Motivazione della suddivisione M3/M4/M5** (ex B3 unico). Il pacchetto owned di §29 è semanticamente eterogeneo (credenziali formali vs dichiarazioni di ambito vs copertura). Separarlo in tre blocchi consente review affidabili e stop point utili senza frammentare oltre il necessario (una tabella per unità SQL).

---

## 11. Ordine topologico globale

```
M1.1 categories ─┐
M1.2 practice_modes ─┬─► M2.1 profiles ─┬─► M3.1…M3.5 (credenziali; parallele tra loro)
M1.3 source_kinds ──┤                 ├─► M4.1 categories_decl (needs M1.1)
M1.4 service_natures ┘                 ├─► M4.2 competencies
                                       ├─► M4.3 services (needs M1.4)
                                       ├─► M5.1…M5.4 (copertura; parallele tra loro)
                                       └─► M6.1 sources (needs M1.3) → M6.2 evidences
                                           M6.3 verifications (needs M2.1 only)
M8.1 SKIP
M8.2 validation report
```

**Ordine di creazione file SQL prescritto (sequenziale):**  
M1.1 → M1.2 → M1.3 → M1.4 → M2.1 → M3.1 → M3.2 → M3.3 → M3.4 → M3.5 → M4.1 → M4.2 → M4.3 → M5.1 → M5.2 → M5.3 → M5.4 → M6.1 → M6.2 → M6.3 → (M8.1 SKIP) → M8.2.

**Numero definitivo migration SQL:** **20**.  
**Unità documentali non SQL:** M8.1 (SKIP), M8.2 (report).

---

## 12. M1 — Cataloghi C03

**Responsabilità di blocco.** Solo i quattro cataloghi autorizzati da §29.12/§29.27. Seed e tabella nella **stessa** migration per ciascun catalogo. Nessuna specializzazione. Nessun seed demo.

**Criteri di completamento.** 4 tabelle; seed chiusi; RLS enable; REVOKE; commenti; trigger `updated_at`.

**Review di blocco.** Dopo M1.4: conteggio code; assenza specializzazioni; assenza GRANT/policy.

### Template comune cataloghi (M1.1–M1.4)

Assegnato a ciascuna unità M1.*:

| Voce | Assegnazione |
|---|---|
| PK | `code` text |
| Colonne | come §29.3.1–§29.3.4 (`label_it`, `sort_order`, `is_active`, timestamps; solo categories aggiunge `group_code`, `description`) |
| UNIQUE | PK |
| FK | nessuna |
| CHECK | code/label non blank; `sort_order >= 0`; categories: `group_code` ∈ vocabolario §29.22 |
| Indici | nessuno oltre PK (cataloghi piccoli) |
| Trigger | `set_<table>_updated_at` + trigger locale |
| RLS / privilegi | ENABLE; no policy; REVOKE ALL |
| Seed | obbligatorio, idempotente su `code` (INSERT … ON CONFLICT DO UPDATE ammesso solo su PK `code` se lo stile repo lo usa già per cataloghi; altrimenti INSERT puro in migration vergine) |
| Tabelle modificate | nessuna |

### M1.1 — Categorie professionali

| Campo | Valore |
|---|---|
| Codice | M1.1 |
| Titolo | Create professional categories |
| Slug | `create_professional_categories` |
| Tabella | `public.professional_categories` |
| Seed | **33** code §29.27 (elenco chiuso; `label_it` da Logical §5; `is_active=true`; `sort_order` monotono per gruppo) |
| Motivazione separazione | Seed ampio; review dedicata del vocabolario |
| Esclusi | specializzazioni; demo |
| Test minimi | 33 righe; PK; CHECK group_code |
| Stop point | no (blocco dopo M1.4) |

### M1.2 — Modalità di esercizio

| Campo | Valore |
|---|---|
| Codice / slug | M1.2 / `create_professional_practice_modes` |
| Tabella | `public.professional_practice_modes` |
| Seed | **11** code §29.27 |
| Nota | Prerequisito di M2.1 (`practice_mode_code`) |

### M1.3 — Tipi di fonte

| Campo | Valore |
|---|---|
| Codice / slug | M1.3 / `create_professional_source_kinds` |
| Tabella | `public.professional_source_kinds` |
| Seed | **13** code §29.27 |
| Nota | Prerequisito di M6.1 |

### M1.4 — Nature del servizio

| Campo | Valore |
|---|---|
| Codice / slug | M1.4 / `create_professional_service_natures` |
| Tabella | `public.professional_service_natures` |
| Seed | **7** code §29.27 |
| Nota | Prerequisito di M4.3 |
| Stop point blocco | **Sì** dopo approvazione review M1 |

---

## 13. M2 — Aggregate Root

### M2.1 — Profilo professionale

| Campo | Valore |
|---|---|
| Codice / slug | M2.1 / `create_professional_profiles` |
| Responsabilità | Creare l’unica AR del dominio |
| Tabelle create | `public.professional_profiles` |
| Tabelle modificate | nessuna |
| Cataloghi | FK opzionale `practice_mode_code` → M1.2 |
| Seed | nessuno |
| PK | `id` uuid DEFAULT gen_random_uuid() |
| UNIQUE | UNIQUE (`person_id`) — **max un profilo per Persona** |
| FK | `person_id` → `profiles(id)` ON DELETE **RESTRICT** NOT NULL; `practice_mode_code` → `professional_practice_modes(code)` ON DELETE **RESTRICT** ON UPDATE CASCADE; `context_business_id` → `businesses(id)` ON DELETE **SET NULL** |
| CHECK | vocabolari stati/disponibilità/fee/contatti; fee; experience_years; availability_until se future; administrative_origin — tutti da §29.22 punti 3–7 |
| Indici | UNIQUE person_id; btree `(publication_status)`, `(availability_status)`, `(professional_status)` |
| Trigger | updated_at dedicato |
| RLS / privilegi | ENABLE; no policy; REVOKE ALL |
| Commenti | obbligatori su `context_business_id`, assi stato, fee_*, contacts |
| Dipendenze interne | M1.2 |
| Dipendenze esterne | profiles (obbl.), businesses (facolt.) |
| Motivazione separazione | AR isolata; stop point naturale |
| Esclusi | `membership_id`; colonne anagrafiche; `verification_status` complessivo persistito; subject_kind |
| Criteri accettazione | INSERT con person_id valido OK; secondo profilo stessa Persona fallisce; person_id NULL fallisce; context_business_id non crea membership |
| Test minimi | UNIQUE; FK RESTRICT; CHECK stati; trigger updated_at; RLS deny |
| Stop point | **Sì** |

**Chiarimenti prescrittivi (non negoziabili).**

* `person_id` obbligatorio; Persona non duplicata.  
* `context_business_id` = contesto organizzativo dichiarato (D11), non Appartenenza.  
* Cancellazione Impresa → SET NULL sul contesto.  
* Nessuna FK membership.

---

## 14. M3 — Credenziali professionali

**Responsabilità di blocco.** Quattro famiglie fisiche distinte + iscrizioni associative leggere. Nessun catalogo Ordini. Ente = label opaca. Verifica autorevole = colonna `verification_status` sulla riga (FEV dedicato per-credenziale **escluso**).

**Template comune M3.1–M3.4** (assegnazione oggetti §29.3.7):

| Voce | Assegnazione |
|---|---|
| Owner FK | `professional_profile_id` → `professional_profiles(id)` ON DELETE **CASCADE** |
| Colonne comuni | denomination, issuer_label, external_identifier, issued_on, valid_from, valid_until, credential_status, verification_status, visibility_status, evidence_visibility, origin_kind, equivalence_status, notes, sort_order, timestamps |
| CHECK date | §29.20 / §29.22.8 |
| Indici | `(professional_profile_id)`; `(credential_status)` |
| Trigger / RLS / privilegi | pattern comune §8 |
| Seed | nessuno |
| Esclusi | catalogo Ordini; Storage; FEV per-credenziale |

### M3.1 — Qualifiche

| Campo | Valore |
|---|---|
| Slug | `create_professional_qualifications` |
| Extra | `qualification_kind` ∈ `study_title`\|`professional_title`\|`declared_qualification` |
| Default credential_status | `declared` |
| Status ammessi | `declared`\|`expired`\|`withdrawn` |
| Stop point | no |

### M3.2 — Iscrizioni professionali

| Campo | Valore |
|---|---|
| Slug | `create_professional_registrations` |
| Extra | `register_body_label` text NOT NULL |
| Default credential_status | `active` |
| Status | `active`\|`suspended`\|`inactive` |

### M3.3 — Abilitazioni

| Campo | Valore |
|---|---|
| Slug | `create_professional_authorizations` |
| Extra | `authorization_kind` ∈ `general`\|`specific` |
| Default credential_status | `active` |
| Status | `active`\|`suspended`\|`revoked`\|`expired` |

### M3.4 — Certificazioni

| Campo | Valore |
|---|---|
| Slug | `create_professional_certifications` |
| Extra | `certifier_label` text NULL |
| Default credential_status | `declared` |
| Status | `declared`\|`expired`\|`revoked`\|`withdrawn` |

### M3.5 — Iscrizioni associative

| Campo | Valore |
|---|---|
| Slug | `create_professional_association_memberships` |
| Colonne | §29.3.8 |
| Verifica dedicata | **Assente** (ciclo leggero) |
| CHECK | `ended_on` / `joined_on` §29.20 |
| Stop point blocco | **Sì** dopo M3.5 |

**Motivazione una tabella per unità.** Famiglie semanticamente distinte; review indipendente degli stati; allineamento a «non unificare le tabelle».

---

## 15. M4 — Ambito dichiarato e servizi

**Titolo blocco.** Ambito dichiarato e servizi.
**Responsabilità.** Dichiarazioni owned di categoria/specializzazione testuale, competenze professionali e servizi descrittivi — dopo M3 (credenziali) e prima di M5 (copertura).
**Prerequisiti blocco.** M2.1 applicata; M1.1 e M1.4 applicate; `public.competencies` esistente (Persone).
**Completamento.** 3 tabelle; UNIQUE/CHECK/indici/trigger/RLS/REVOKE/COMMENT; seed **assente**; policy **assenti**.
**Stop point.** **Sì** dopo M4.3 (review di blocco prima di M5.1).
**Timestamp proposti** (dopo `20260804140000`; univoci; da verificare con `migration list` alla creazione SQL):

| Unità | Timestamp proposto | File proposto |
|---|---|---|
| M4.1 | `20260804150000` | `20260804150000_create_professional_profile_categories.sql` |
| M4.2 | `20260804160000` | `20260804160000_create_professional_competencies.sql` |
| M4.3 | `20260804170000` | `20260804170000_create_professional_services.sql` |

**Regole comuni M4 (ogni unità).** Stile M3: header normativo; una tabella; PK uuid `gen_random_uuid()`; timestamps; `set_*_updated_at` INVOKER + `search_path=''` + trigger `BEFORE UPDATE`; RLS ENABLE; no FORCE; no policy; REVOKE ALL da `PUBLIC`/`anon`/`authenticated`; no GRANT; COMMENT ON tabella/colonne/funzione; seed assente; no JSONB; no dati test; no anticipazione M5/M6.

### M4.1 — Dichiarazioni categoria

| Campo | Valore |
|---|---|
| Codice / slug | M4.1 / `create_professional_profile_categories` |
| Responsabilità | Dichiarazione di Categoria sul Profilo + specializzazione testuale opzionale |
| Tabella | `public.professional_profile_categories` (§29.3.6) |
| Classificazione | link/E02 owned |
| Dipendenze | M2.1; M1.1 |
| Timestamp | `20260804150000` |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `category_code` | text | NO | — |
| 4 | `specialization_label` | text | SÌ | NULL |
| 5 | `is_primary` | boolean | NO | false |
| 6 | `sort_order` | integer | NO | 0 |
| 7 | `declaration_status` | text | NO | `'declared'` |
| 8 | `created_at` | timestamptz | NO | `now()` |
| 9 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK `professional_profile_id` → `professional_profiles(id)` ON UPDATE NO ACTION ON DELETE CASCADE. FK `category_code` → `professional_categories(code)` ON UPDATE CASCADE ON DELETE RESTRICT.

**UNIQUE.** (1) UNIQUE INDEX `prof_profile_categories_declared_uidx` ON `(professional_profile_id, category_code)` WHERE `declaration_status='declared'`. (2) UNIQUE INDEX `prof_profile_categories_primary_uidx` ON `(professional_profile_id)` WHERE `is_primary=true AND declaration_status='declared'`.

**CHECK.** `declaration_status IN ('declared','removed')`; `sort_order >= 0`; `specialization_label IS NULL OR length(btrim(specialization_label)) > 0`.

**Indici applicativi.** btree `(professional_profile_id)`; btree `(category_code)`; oltre le UNIQUE parziali.

**Trigger.** `set_professional_profile_categories_updated_at` + `professional_profile_categories_set_updated_at`.

**RLS / privilegi / policy.** ENABLE; no FORCE; **policy assenti**; REVOKE ALL da PUBLIC/anon/authenticated.

**Seed.** **Assente.**

**Esclusi.** Tabella/catalogo `professional_specializations`; seed specializzazioni; colonne di copertura M5; FEV; policy/GRANT.

**Validazione locale.** Colonne 9; 2 UNIQUE parziali; 2 FK; CHECK; trigger; RLS; zero policy.
**Runtime.** Insert declared valido; doppia declared stessa categoria rifiutata; due primary declared rifiutate; `removed` consente ri-dichiarazione; CASCADE delete profilo; anon/authenticated negati.
**Post-apply.** Cataloghi: presence; UNIQUE; FK target categories; assenza tabella specializations.

### M4.2 — Competenze professionali

| Campo | Valore |
|---|---|
| Codice / slug | M4.2 / `create_professional_competencies` |
| Responsabilità | Competenza specialistica dichiarata sul Profilo (≠ `profile_competencies`) |
| Tabella | `public.professional_competencies` (§29.3.9) |
| Classificazione | E02 owned |
| Dipendenze | M2.1; `public.competencies` (`id` bigint) |
| Timestamp | `20260804160000` |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `competency_id` | bigint | NO | — |
| 4 | `level_code` | text | SÌ | NULL |
| 5 | `years_experience` | numeric(5,1) | SÌ | NULL |
| 6 | `declaration_status` | text | NO | `'declared'` |
| 7 | `verification_status` | text | NO | `'unverified'` |
| 8 | `sort_order` | integer | NO | 0 |
| 9 | `notes` | text | SÌ | NULL |
| 10 | `created_at` | timestamptz | NO | `now()` |
| 11 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK owner → profiles CASCADE. FK `competency_id` → `competencies(id)` ON UPDATE NO ACTION ON DELETE RESTRICT.

**UNIQUE.** UNIQUE INDEX `prof_competencies_declared_uidx` ON `(professional_profile_id, competency_id)` WHERE `declaration_status='declared'`.

**CHECK.** `declaration_status IN ('declared','removed')`; `verification_status IN ('unverified','verified','contested')` (**no** `in_review`); `level_code IS NULL OR level_code IN ('basic','intermediate','advanced','expert')`; `years_experience IS NULL OR years_experience >= 0`; `sort_order >= 0`.

**Indici.** btree owner; btree `(competency_id)`; UNIQUE parziale.

**Trigger.** `set_professional_competencies_updated_at` + `professional_competencies_set_updated_at`.

**RLS / privilegi / policy.** Come M4.1. **Non** copiare GRANT/policy legacy di `competencies`.

**Seed.** **Assente.**

**Esclusi.** Secondo catalogo competenze locale; coincidenza con `profile_competencies`; aspetto FEV strutturale (rinvio M6 / colonna `verification_status` riga soltanto).

**Validazione / runtime / post-apply.** Colonne 11; UNIQUE declared; FK bigint; REJECT doppia declared; REJECT `years_experience < 0`; REJECT level invalido; CASCADE; privilegi negati; assenza policy.

### M4.3 — Servizi professionali dichiarati

| Campo | Valore |
|---|---|
| Codice / slug | M4.3 / `create_professional_services` |
| Responsabilità | Dichiarazione descrittiva di servizio offerto (≠ OffertaDiServizio, ≠ ServizioImpresa) |
| Tabella | `public.professional_services` (§29.3.10) |
| Classificazione | E02 owned |
| Dipendenze | M2.1; M1.4 |
| Timestamp | `20260804170000` |
| Stop point blocco | **Sì** dopo M4.3 |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `title` | text | NO | — |
| 4 | `description` | text | SÌ | NULL |
| 5 | `service_nature_code` | text | NO | — |
| 6 | `audience_kind` | text | NO | `'both'` |
| 7 | `delivery_mode` | text | NO | `'unspecified'` |
| 8 | `is_standardized` | boolean | NO | false |
| 9 | `service_status` | text | NO | `'declared'` |
| 10 | `visibility_status` | text | NO | `'private'` |
| 11 | `availability_status` | text | SÌ | NULL |
| 12 | `fee_indication_kind` | text | NO | `'none'` |
| 13 | `fee_note` | text | SÌ | NULL |
| 14 | `sort_order` | integer | NO | 0 |
| 15 | `created_at` | timestamptz | NO | `now()` |
| 16 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK owner CASCADE. FK `service_nature_code` → `professional_service_natures(code)` ON UPDATE CASCADE ON DELETE RESTRICT.

**UNIQUE.** Nessuno (titoli omonimi ammessi).

**CHECK.** `length(btrim(title)) > 0`; `audience_kind IN ('persons','businesses','both')`; `delivery_mode IN ('in_person','remote','hybrid','unspecified')`; `service_status IN ('declared','active','suspended','unavailable')`; `visibility_status` ∈ VIS §29.19; `availability_status IS NULL OR` ∈ vocabolario disponibilità profilo; `fee_indication_kind IN ('none','hourly_range','fixed_range','on_request','free','discounted')`; `sort_order >= 0`. **Nessun** CHECK importi (colonne assenti).

**Indici.** btree `(professional_profile_id)`; btree `(service_status)` — parziale `WHERE service_status='active'` **ammesso**.

**Trigger.** `set_professional_services_updated_at` + `professional_services_set_updated_at`.

**RLS / privilegi / policy.** Come M4.1.

**Seed.** **Assente.**

**Esclusi obbligatori.** `price`/`fee_amount_*`/`fee_currency`/`fee_visibility`; checkout; pagamenti; prenotazioni; contratti; SLA; disponibilità transazionale; OffertaDiServizio; FK Opportunità/Collaborazioni; link territorio/lingua per-servizio (M5 / rinvio).

**Validazione / runtime / post-apply.** Colonne 16; title blank rifiutato; status/nature invalidi rifiutati; duplicato title ammesso; CASCADE; privilegi negati; assenza oggetti marketplace.

---

## 16. M5 — Copertura operativa

**Titolo blocco.** Copertura operativa.
**Responsabilità.** Dichiarazioni owned di territori (esercizio/serviti), lingue professionali, mercati internazionali referenziati e settori economici serviti — dopo M4 e prima di M6 (FEV).
**Prerequisiti blocco.** M2.1 applicata; `public.languages`; `public.international_markets`; `public.business_sectors`. Nessun catalogo Territori/countries.
**Completamento.** 4 tabelle; UNIQUE parziali/CHECK/indici/trigger/RLS/REVOKE/COMMENT; seed **assente**; policy **assenti**.
**Stop point.** **Sì** dopo M5.4 (review di blocco prima di M6.1).

| Unità | Timestamp proposto | File |
|---|---|---|
| M5.1 | `20260804180000` | `20260804180000_create_professional_served_territories.sql` |
| M5.2 | `20260804190000` | `20260804190000_create_professional_operational_languages.sql` |
| M5.3 | `20260804200000` | `20260804200000_create_professional_served_markets.sql` |
| M5.4 | `20260804210000` | `20260804210000_create_professional_served_sectors.sql` |

**Regole comuni M5 (ogni unità).** Stile M4: header normativo; una tabella; PK uuid `gen_random_uuid()`; timestamps; `set_*_updated_at` INVOKER + `search_path=''` + trigger `BEFORE UPDATE`; RLS ENABLE; no FORCE; no policy; REVOKE ALL da `PUBLIC`/`anon`/`authenticated`; no GRANT; COMMENT ON tabella/colonne/funzione; seed assente; no JSONB; no anticipazione M6.

### M5.1 — Territori serviti

| Campo | Valore |
|---|---|
| Codice / slug | M5.1 / `create_professional_served_territories` |
| Responsabilità | Dichiarazione territorio di esercizio e/o servito + modalità di presenza |
| Tabella | `public.professional_served_territories` (§29.3.11 / §29.33) |
| Dipendenze | M2.1 (nessuna FK geografica) |
| Timestamp | `20260804180000` |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `country_ref` | text | NO | — |
| 4 | `territory_label` | text | SÌ | NULL |
| 5 | `coverage_kind` | text | NO | `'served'` |
| 6 | `presence_mode` | text | NO | `'unspecified'` |
| 7 | `declaration_status` | text | NO | `'declared'` |
| 8 | `verification_status` | text | NO | `'unverified'` |
| 9 | `sort_order` | integer | NO | 0 |
| 10 | `created_at` | timestamptz | NO | `now()` |
| 11 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK owner → `professional_profiles(id)` ON UPDATE NO ACTION ON DELETE CASCADE. **Nessuna** FK a `territories`/`countries`.

**UNIQUE.** UNIQUE INDEX `prof_served_territories_declared_uidx` ON `(professional_profile_id, country_ref, coverage_kind)` WHERE `declaration_status='declared'`.

**CHECK.** `length(btrim(country_ref)) > 0`; `territory_label IS NULL OR length(btrim(territory_label)) > 0`; `coverage_kind IN ('exercise','served','both')`; `presence_mode IN ('in_person','remote','hybrid','unspecified')`; `declaration_status IN ('declared','removed')`; `verification_status IN ('unverified','verified','contested')` (**no** `in_review`); `sort_order >= 0`.

**Indici.** UNIQUE parziale; btree owner; btree `(country_ref)`.

**Trigger / RLS / privilegi / seed.** Come regole comuni M5. COMMENT obbligatorio: `country_ref` opaco, non FK Territori.

**Esclusi.** Catalogo territori; coordinate; sedi; copertura per-servizio; disponibilità temporale AR.

### M5.2 — Lingue operative professionali

| Campo | Valore |
|---|---|
| Codice / slug | M5.2 / `create_professional_operational_languages` |
| Responsabilità | Lingue operative/di supporto professionali del Profilo |
| Tabella | `public.professional_operational_languages` (§29.3.12 / §29.33) |
| Dipendenze | M2.1; `public.languages` (`id` bigint) |
| Timestamp | `20260804190000` |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `language_id` | bigint | NO | — |
| 4 | `proficiency_level` | text | NO | `'working'` |
| 5 | `usage_role` | text | NO | `'operational'` |
| 6 | `declaration_status` | text | NO | `'declared'` |
| 7 | `verification_status` | text | NO | `'unverified'` |
| 8 | `sort_order` | integer | NO | 0 |
| 9 | `created_at` | timestamptz | NO | `now()` |
| 10 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK owner CASCADE. FK `language_id` → `languages(id)` ON UPDATE NO ACTION ON DELETE RESTRICT.

**UNIQUE.** UNIQUE INDEX `prof_op_languages_declared_uidx` ON `(professional_profile_id, language_id, usage_role)` WHERE `declaration_status='declared'`.

**CHECK.** `proficiency_level IN ('elementary','working','professional','native_equivalent')`; `usage_role IN ('operational','support')`; `declaration_status IN ('declared','removed')`; `verification_status IN ('unverified','verified','contested')` (**no** `in_review`); `sort_order >= 0`.

**Indici.** UNIQUE parziale; btree owner; btree `(language_id)`.

**Distinzione.** ≠ `profile_languages`; ≠ lingue UI; ≠ `business_operational_language_declarations`. Non copiare GRANT/policy di `languages`.

### M5.3 — Mercati internazionali serviti

| Campo | Valore |
|---|---|
| Codice / slug | M5.3 / `create_professional_served_markets` |
| Responsabilità | Dichiarazione known/served/supported verso un Mercato internazionale |
| Tabella | `public.professional_served_markets` (§29.3.13 / §29.33) |
| Dipendenze | M2.1; `public.international_markets` (`id` uuid) |
| Timestamp | `20260804200000` |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `market_id` | uuid | NO | — |
| 4 | `relation_kind` | text | NO | `'served'` |
| 5 | `declaration_status` | text | NO | `'declared'` |
| 6 | `notes` | text | SÌ | NULL |
| 7 | `sort_order` | integer | NO | 0 |
| 8 | `created_at` | timestamptz | NO | `now()` |
| 9 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK owner CASCADE. FK `market_id` → `international_markets(id)` ON UPDATE NO ACTION ON DELETE RESTRICT.

**UNIQUE.** UNIQUE INDEX `prof_served_markets_declared_uidx` ON `(professional_profile_id, market_id)` WHERE `declaration_status='declared'`.

**CHECK.** `relation_kind IN ('known','served','supported')`; `declaration_status IN ('declared','removed')`; `sort_order >= 0`. **Nessuna** colonna `verification_status`.

**Indici.** UNIQUE parziale; btree owner; btree `(market_id)`.

**Distinzione.** ≠ PresenzaDiMercato; ≠ InteresseDiMercato; ≠ Attività; nessuna creazione automatica relazioni MI.

### M5.4 — Settori economici serviti

| Campo | Valore |
|---|---|
| Codice / slug | M5.4 / `create_professional_served_sectors` |
| Responsabilità | Settori economici dichiarati come ambiti serviti dal Profilo |
| Tabella | `public.professional_served_sectors` (§29.3.14 / §29.33) |
| Dipendenze | M2.1; `public.business_sectors` (`id` bigint) |
| Timestamp | `20260804210000` |
| Stop point blocco | **Sì** dopo M5.4 |

**Colonne (ordine fisico).**

| Ord. | Colonna | Tipo | Null | Default |
|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` |
| 2 | `professional_profile_id` | uuid | NO | — |
| 3 | `sector_id` | bigint | NO | — |
| 4 | `declaration_status` | text | NO | `'declared'` |
| 5 | `sort_order` | integer | NO | 0 |
| 6 | `created_at` | timestamptz | NO | `now()` |
| 7 | `updated_at` | timestamptz | NO | `now()` |

**PK / FK.** PK `id`. FK owner CASCADE. FK `sector_id` → `business_sectors(id)` ON UPDATE NO ACTION ON DELETE RESTRICT.

**UNIQUE.** UNIQUE INDEX `prof_served_sectors_declared_uidx` ON `(professional_profile_id, sector_id)` WHERE `declaration_status='declared'`.

**CHECK.** `declaration_status IN ('declared','removed')`; `sort_order >= 0`.

**Indici.** UNIQUE parziale; btree owner; btree `(sector_id)`.

**Distinzione.** ≠ `business_sector_declarations` (Imprese); ≠ categorie professionali M4.1; nessun `is_primary` nel ciclo 1.

**Esclusi blocco M5.** FEV M6; link territorio/lingua per-servizio; sedi; catalogo Territori; Presenza/Interesse/Attività MI; disponibilità temporale AR; marketplace; seed; policy/GRANT.

---

## 17. M6 — Fonti, evidenze, verifiche

**Responsabilità.** Esattamente le **3** tabelle FEV del profilo (§29.21). Ordine: sources → evidences → verifications.

**Ribaditi.**

* Verifica complessiva profilo = **proiezione non persistita**.  
* Nessun trigger di aggregazione.  
* Nessuna tabella FEV per credenziale.  
* Nessuno Storage.  
* Nessuna policy.  
* Nessun workflow moderazione completo.  
* Aspetti chiusi: elenco §29.21.  
* Aspetti esclusi: person_identity, organization_existence, membership_relation.

### M6.1 — Fonti

| Campo | Valore |
|---|---|
| Slug | `create_professional_profile_sources` |
| Tabella | `professional_profile_sources` |
| FK | profile CASCADE; `source_kind_code` → source_kinds RESTRICT |
| Colonne | §29.3.15 |
| Seed | nessuno (tipi già in M1.3) |

### M6.2 — Evidenze

| Campo | Valore |
|---|---|
| Slug | `create_professional_profile_evidences` |
| Tabella | `professional_profile_evidences` |
| FK | profile CASCADE; `source_id` → sources ON DELETE **SET NULL** |
| CHECK | `supported_aspect` ∈ vocabolario aspetti |
| Esclusi | `storage_path` |

### M6.3 — Verifiche

| Campo | Valore |
|---|---|
| Slug | `create_professional_profile_verifications` |
| Tabella | `professional_profile_verifications` |
| FK | profile CASCADE |
| UNIQUE | (`professional_profile_id`, `aspect`) — current-state |
| Status | `unverified`\|`in_review`\|`confirmed`\|`rejected` |
| History table | **esclusa** |
| Stop point | **Sì** — struttura ciclo 1 SQL completa |

---

## 18. M7 — Assente

Nessuna unità M7.

**Motivazione.** Commenti, RLS e privilegi sono parte di ciascuna unità M1–M6 (§29 e pattern Mercati). Non esiste gate di pubblicazione strutturale separato da aggiungere nel ciclo 1 (gli assi pubblicazione/visibilità sono colonne dell’AR in M2.1). Non si replica M7 Imprese.

---

## 19. M8 — Seed demo e validazione finale

### M8.1 — Seed / demo istanze

**Decisione definitiva: SKIP.**

I soli seed autorizzati sono i seed **normativi C03** già inclusi in M1.1–M1.4. Nessuna fase SQL separata per profili/credenziali/servizi dimostrativi.

### M8.2 — Validazione finale (non SQL)

| Campo | Valore |
|---|---|
| Codice | **M8.2** |
| Artefatto | `docs/architecture/migrations/professionisti-validation-report.md` |
| Natura | Report markdown di riconciliazione — **non** migration SQL |
| Prerequisiti | Tutte le 20 migration SQL applicate e pubblicate; working tree coerente |

**Il report dovrà verificare:** migration applicate; local = remote; inventario 20 tabelle; colonne; constraint; FK; indici; trigger; RLS; privilegi; seed C03; assenza policy; assenza grant; assenza oggetti rinviati; coerenza §29; coerenza Plan; working tree; commit; push; chiusura ciclo 1.

---

## 20. Slugs delle future migration

| Unità | Slug definitivo (senza timestamp) | Oggetti principali |
|---|---|---|
| M1.1 | `create_professional_categories` | categories + seed 33 |
| M1.2 | `create_professional_practice_modes` | practice_modes + seed 11 |
| M1.3 | `create_professional_source_kinds` | source_kinds + seed 13 |
| M1.4 | `create_professional_service_natures` | service_natures + seed 7 |
| M2.1 | `create_professional_profiles` | AR |
| M3.1 | `create_professional_qualifications` | qualifications |
| M3.2 | `create_professional_registrations` | registrations |
| M3.3 | `create_professional_authorizations` | authorizations |
| M3.4 | `create_professional_certifications` | certifications |
| M3.5 | `create_professional_association_memberships` | association_memberships |
| M4.1 | `create_professional_profile_categories` | profile_categories |
| M4.2 | `create_professional_competencies` | competencies link |
| M4.3 | `create_professional_services` | services |
| M5.1 | `create_professional_served_territories` | territories |
| M5.2 | `create_professional_operational_languages` | operational languages |
| M5.3 | `create_professional_served_markets` | served markets |
| M5.4 | `create_professional_served_sectors` | served sectors |
| M6.1 | `create_professional_profile_sources` | sources |
| M6.2 | `create_professional_profile_evidences` | evidences |
| M6.3 | `create_professional_profile_verifications` | verifications |

Timestamp reali M1–M4: già in repository fino a `20260804170000`. Timestamp M5: proposti in §16 (`…180000`…`…210000`); M6 ancora da assegnare alla creazione.

---

## 21. Strategia timestamp

| Regola | Prescrizione |
|---|---|
| Riferimento | Timestamp più alto esistente nel dominio Professionisti: **`20260804170000`** (M4.3 applicata e versionata) |
| Assegnazione | Un timestamp univoco per unità SQL, strettamente crescente |
| Ordine | Cronologia file = ordine topologico §11 |
| Collisione | Vietata; verificare con `supabase migration list` prima di ogni creazione |
| Riuso / retrodatazione | Vietati |
| Gap | Lasciare margine ordinato (es. incrementi a step coerenti con lo stile repo) senza sovrapporsi a rami paralleli |
| Momento | Timestamp scelti alla creazione concreta della migration; per M5 i valori proposti in §16 (`…180000`…`…210000`) sono **autoritativi per la creazione accelerata del blocco**, salvo collisione rilevata in `migration list` |
| M1–M4 | Timestamp già assegnati e file presenti (`20260803090000`…`20260804170000`) — non riassegnare |

---

## 22. Naming constraint, indici, trigger (≤63 byte)

**Nomi tabella §29:** non abbreviare.

**Prefisso stabile per oggetti lunghi:** `prof_` (abbreviazione di `professional_`).

| Tipo oggetto | Pattern prescritto | Esempio |
|---|---|---|
| Funzione updated_at | `set_<short>_updated_at` | `set_prof_assoc_memberships_updated_at` (≤63) |
| Trigger updated_at | `<short>_set_updated_at` | `prof_assoc_memberships_set_updated_at` |
| UNIQUE parziale declared | `<short>_declared_uidx` | `prof_profile_categories_declared_uidx` |
| UNIQUE primaria categoria | `prof_profile_categories_primary_uidx` | — |
| FK name | `<table>_<col>_fkey` se ≤63; altrimenti `prof_<abbr>_<col>_fkey` | `prof_profiles_person_id_fkey` |
| CHECK | `<table>_<topic>_check` con abbreviazione tabella se necessario | `prof_profiles_fee_check` |

**Abbreviazioni tabella stabili (solo per oggetti secondari):**

| Tabella | Abbr. oggetti |
|---|---|
| `professional_profiles` | `prof_profiles` |
| `professional_profile_categories` | `prof_profile_categories` |
| `professional_competencies` | `prof_competencies` |
| `professional_services` | `prof_services` |
| `professional_association_memberships` | `prof_assoc_memberships` |
| `professional_operational_languages` | `prof_op_languages` |
| `professional_served_territories` | `prof_served_territories` |
| `professional_served_markets` | `prof_served_markets` |
| `professional_served_sectors` | `prof_served_sectors` |
| `professional_profile_sources` | `prof_profile_sources` |
| `professional_profile_evidences` | `prof_profile_evidences` |
| `professional_profile_verifications` | `prof_profile_verifications` |
| `professional_qualifications` | `prof_qualifications` |
| `professional_registrations` | `prof_registrations` |
| `professional_authorizations` | `prof_authorizations` |
| `professional_certifications` | `prof_certifications` |
| `professional_competencies` | `prof_competencies` |
| `professional_services` | `prof_services` |
| Cataloghi | nome tabella intero (già corto) |

Verifica obbligatoria in review unità: ogni identificatore creato ≤ 63 byte.

---

## 23. Review per unità

Dopo la creazione di **ogni** file SQL, micro-review indipendente obbligatoria **prima** della unità successiva.

Checklist minima:

1. Conformità §29 (colonne, ordine, tipi, null, default)  
2. Conformità Plan (assegnazione unità)  
3. Nomi ≤ 63 byte  
4. PK / UNIQUE / FK / ON DELETE  
5. CHECK / indici / trigger  
6. RLS ENABLE; no FORCE; no policy  
7. REVOKE; no GRANT  
8. Seed solo se unità M1.* e elenco chiuso  
9. Commenti SQL  
10. Dipendenze soddisfatte; nessun oggetto anticipato/rinviato  
11. Nessuna modifica a tabelle di altri domini  

**Eccezione revisione congiunta.** Nessuna: ogni unità M1.1–M6.3 richiede micro-review propria. La review di blocco (§24) è aggiuntiva, non sostitutiva.

---

## 24. Review per blocco

Dopo l’ultima unità di ciascun blocco M1–M6, review congiunta che verifica:

* copertura completa delle tabelle del blocco;  
* assenza duplicazioni;  
* ordine topologico;  
* seed (solo M1);  
* assenza cicli;  
* naming constraint/indici;  
* FK ON DELETE coerenti;  
* RLS/privilegi uniformi;  
* applicabilità su DB pulito e su DB esistente in sequenza.

**Il blocco successivo non inizia** finché la review del blocco corrente non è approvata.

---

## 25. Strategia di test

### 25.1 Test statici (ogni unità, pre-apply)

* Parsing SQL  
* Nomi oggetti / limite 63 byte  
* Confronto inventario Plan↔SQL↔§29  
* Dipendenze dichiarate presenti  
* Ricerca oggetti vietati (`membership_id`, Storage, policy, GRANT, subject_kind, catalogo Ordini, tabella territories)  
* Assenza proiezione verifica complessiva  

### 25.2 Dry-run

* Reset DB locale controllato  
* Applicazione completa della catena fino all’unità/blocco in esame  
* Verifica ordine `schema_migrations`  
* Verifica seed M1  
* Assenza errori  

### 25.3 Smoke test (post-apply unità/blocco)

Presenza tabelle/colonne; PK; UNIQUE; FK; CHECK; indici; trigger; RLS enabled; privilegi revocati; seed conteggiati; comportamento minimo vincoli.

### 25.4 Test negativi (minimo obbligatorio)

| # | Caso | Esito atteso |
|---|---|---|
| 1 | Secondo profilo stessa Persona | rifiutato (UNIQUE person_id) |
| 2 | Profilo senza Persona / person_id invalido | rifiutato |
| 3 | Codice catalogo inesistente su FK | rifiutato |
| 4 | Intervallo date incoerente credenziale | rifiutato |
| 5 | Fee negativa | rifiutato |
| 6 | language_id inesistente | rifiutato |
| 7 | market_id inesistente | rifiutato |
| 8 | Duplicazione link declared (lingua/mercato/settore/categoria) | rifiutato |
| 9 | Stato fuori vocabolario | rifiutato |
| 10 | SELECT/INSERT come anon o authenticated senza policy/grant | negato |

---

## 26. Apply locale e remoto

Sequenza futura prescritta (non eseguita da questo documento):

1. Verifica Git (working tree atteso)  
2. `supabase migration list`  
3. Dry-run locale completo del blocco  
4. Apply locale  
5. Smoke test locale + test negativi pertinenti  
6. Review esito  
7. Commit del blocco (§27)  
8. Push  
9. Verifica remoto / list  
10. Apply remoto  
11. Verifica schema remoto (cataloghi)  
12. Confronto local/remote  
13. Report di blocco (nota operativa)

Modalità operativa consolidata del progetto (da rispettare per ogni blocco): architettura blocco → SQL per unità → micro-review → review blocco → dry-run → apply locale → smoke → apply remoto → verifica catalogo → commit/push → (a fine dominio) M8.2.

---

## 27. Strategia commit e push

| Regola | Prescrizione |
|---|---|
| Granularità | **Un commit per blocco** approvato (M1…M6), contenente tutte le migration SQL del blocco |
| Vietato | Commit di migration non approvate in review |
| Push | Solo dopo dry-run + smoke + review blocco |
| Working tree | Pulito a fine blocco |
| Tag | Solo a chiusura dominio (dopo M8.2), se previsto dalla governance — non obbligatorio qui |
| Messaggi esempio | `feat(db): add professionals block M1 catalogs` · `feat(db): add professionals block M2 profile root` · `feat(db): add professionals block M3 credentials` · `feat(db): add professionals block M4 scope services` · `feat(db): add professionals block M5 coverage` · `feat(db): add professionals block M6 profile FEV` · `docs(db): add professionals validation report` |

---

## 28. Stop point del Plan

**Stato corrente.** M1–M4 chiuse (SQL applicate e versionate fino a `20260804170000` / commit `54dfcff`). Blocco M5 determinato documentalmente (§16 / §29.33); SQL M5 da creare in ciclo accelerato.

1. La creazione accelerata di **M5.1–M5.4** è autorizzabile solo con contratto §16/§29.33 allineato (questa revisione).
2. Non aprire **M6** prima dello stop point post-M5.4 (SQL + apply + review blocco).
3. Ogni incongruenza Plan↔§29 va risolta **documentalmente** prima dello SQL.

**Stop point operativi:** dopo M1.4; M2.1; M3.5; **M4.3**; M5.4; M6.3; M8.2.

---

## 29. Checklist conclusiva

- [x] 20/20 tabelle assegnate a unità uniche  
- [x] 4/4 cataloghi + seed assegnati a M1  
- [x] AR isolata in M2.1  
- [x] Credenziali non unificate (M3.1–M3.4) + associazioni M3.5  
- [x] Servizi descrittivi M4.3 con esclusioni marketplace  
- [x] Contratto M4.1–M4.3 completo + SQL applicato/versionato
- [x] Contratto M5.1–M5.4 completo + timestamp proposti (§16 / §29.33)
- [x] Territori opachi M5.1; lingue M5.2; mercati M5.3; settori M5.4  
- [x] FEV esattamente 3 tabelle M6  
- [x] Nessuna membership FK; nessun catalogo Ordini; nessuna policy/GRANT  
- [x] M7 assente motivato; M8.1 SKIP; M8.2 report  
- [x] Slugs definitivi; abbreviazioni ≤63
- [x] Review unità/blocco; test; apply; commit prescritti  
- [ ] SQL M5.1–M5.4 (prossimo passo operativo)

---

## 30. Confutazione indipendente

| Accusa | Esito |
|---|---|
| Tabella §29 senza unità | **Respinta** — matrice §9 |
| Unità con oggetti non §29 | **Respinta** — perimetro chiuso |
| Membership FK anticipata | **Respinta** — esclusa |
| Catalogo Ordini / Specializzazioni | **Respinta** — esclusi/rinviati |
| FK Territori inesistente | **Respinta** — `country_ref` |
| Soggetto polimorfico / XOR | **Respinta** — solo Persona |
| Proiezione verifica persistita | **Respinta** — vietata |
| FEV per credenziale / Storage | **Respinta** — esclusi |
| Policy o GRANT | **Respinta** — §8/§29 |
| Seed demo | **Respinta** — M8.1 SKIP |
| Dipendenze circolari | **Respinta** — grafo §11 |
| M7 artificiale | **Respinta** — assente motivato |
| Plan che altera §29 | **Respinta** — regola autorità |
| Unità non revisionabili | **Respinta** — 20 SQL atomiche |
| Timestamp già assegnati in conflitto | **Respinta** — M1–M3 versionati; M4 proposti dopo `20260804140000` (§15/§21) |

**Esito confutazione:** nessuna accusa regge sul perimetro statico. Blocco M4 contratto aggiornato per creazione accelerata SQL.

---

## Deliverable di sequenza

| Unit | Slug / artefatto | Stato |
|---|---|---|
| M1.1–M1.4 | create_professional_* catalogs | **Applicata e versionata** |
| M2.1 | create_professional_profiles | **Applicata e versionata** |
| M3.1–M3.5 | credentials + associations | **Applicata e versionata** (`5761217` / fino a `20260804140000`) |
| M4.1–M4.3 | scope + services | **Applicata e versionata** (`54dfcff` / fino a `20260804170000`) |
| M5.1–M5.4 | coverage | **Contratto completo — SQL non creato** (creazione accelerata autorizzabile) |
| M6.1–M6.3 | profile FEV | **Pianificata** — dopo stop M5.4 |
| M7 | — | **Assente** |
| M8.1 | demo seed | **SKIP** |
| M8.2 | `professionisti-validation-report.md` | **Da produrre a fine ciclo 1 SQL** |

---

**MIGRATION PLAN PROFESSIONISTI — BLOCCO M5 DETERMINATO.**
M1–M4 chiuse; M5.1–M5.4 con contratto implementabile e timestamp proposti; M6+ non aperte.
**Prossimo passo operativo:** creazione accelerata delle quattro migration M5 (senza micro-review intermedie di progettazione), poi review SQL/apply secondo §23–§26.
