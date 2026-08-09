# Migration Plan — Dominio Imprese

## Nota introduttiva di esclusione

Questo documento è un **piano di migrazione concettuale**. Non crea file `.sql`, non scrive SQL, non applica migrazioni, non definisce colonne, tipi, CHECK, indici, trigger, policy RLS, endpoint, DTO, repository o UI. Traduce il Physical Domain Mapping di Imprese in una sequenza implementativa additiva, verificabile e reversibile quando possibile.

Il dettaglio DDL resta di competenza del Physical (`domain-mapping/imprese.md`) e delle future migration SQL. Questo piano **non** modifica il Physical, il Logical, né altri domini.

Fonti normative: Logical Imprese → Physical Domain Mapping Imprese → Dependency Map → Domain Patterns → Architecture Baseline. I piani Persone e Opportunità sono riferimenti di stile e metodo, non autorità sul contenuto di Imprese.

---

## Indice

1. [Scopo](#1-scopo)
2. [Fonti normative](#2-fonti-normative)
3. [Stato architetturale del dominio](#3-stato-architetturale-del-dominio)
4. [Stato implementativo attuale](#4-stato-implementativo-attuale)
5. [Principi della migrazione](#5-principi-della-migrazione)
6. [Perimetro e scope della prima implementazione](#6-perimetro-e-scope-della-prima-implementazione)
7. [Elementi esplicitamente esclusi e rinviati](#7-elementi-esplicitamente-esclusi-e-rinviati)
8. [Prerequisiti](#8-prerequisiti)
9. [Dipendenze](#9-dipendenze)
10. [Analisi delle strutture esistenti](#10-analisi-delle-strutture-esistenti)
11. [Strategia generale](#11-strategia-generale)
12. [Sequenza delle migration unit](#12-sequenza-delle-migration-unit)
13. [M1 — Nucleo Impresa](#13-m1--nucleo-impresa)
14. [M2 — Dichiarazioni di settore e lingua](#14-m2--dichiarazioni-di-settore-e-lingua)
15. [M3 — Sedi e canali](#15-m3--sedi-e-canali)
16. [M4 — Servizi e prodotti](#16-m4--servizi-e-prodotti)
17. [M5 — Certificazioni e media](#17-m5--certificazioni-e-media)
18. [M6 — Verifica di rappresentazione (aspetti owned)](#18-m6--verifica-di-rappresentazione-aspetti-owned)
19. [M7 — Pubblicazione, visibilità e gate](#19-m7--pubblicazione-visibilità-e-gate)
20. [M8 — Riconciliazione, seed e validazione](#20-m8--riconciliazione-seed-e-validazione)
21. [Invarianti da preservare](#21-invarianti-da-preservare)
22. [Strategia di review](#22-strategia-di-review)
23. [Strategia di validazione](#23-strategia-di-validazione)
24. [Strategia SQL successiva](#24-strategia-sql-successiva)
25. [Criteri di accettazione](#25-criteri-di-accettazione)
26. [Strategia di rollback](#26-strategia-di-rollback)
27. [Rischi e mitigazioni](#27-rischi-e-mitigazioni)
28. [Punti di controllo](#28-punti-di-controllo)
29. [Questioni aperte](#29-questioni-aperte)
30. [Deliverable](#30-deliverable)
31. [Checklist finale](#31-checklist-finale)
32. [Conclusione](#32-conclusione)

---

## 1. Scopo

Tradurre il Physical Domain Mapping di Imprese in una sequenza di **migration unit** additive, incrementali e verificabili, compatibile con:

- lo stato reale del repository;
- le dipendenze consolidate (Persone come soggetto distinto; Appartenenze proprietaria della relazione Persona–Impresa; Mercati proprietario di MercatoImpresa; Tassonomia condivisa per settore/lingua/territorio);
- il fatto che Opportunità è già chiusa staticamente e referenzia Impresa in modo opaco (`business_id` senza FK) finché questo piano non produce l’identità stabile Impresa.

Il piano stabilisce: cosa introdurre; ordine; prerequisiti; rinvii; controlli; rischi; criteri di accettazione; rollback logico; riconciliazione. **Non** stabilisce SQL definitivo.

---

## 2. Fonti normative

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `logical/imprese.md` | Modello logico |
| 2 | `physical/domain-mapping/imprese.md` | **Fonte normativa immediata** del piano (concetti persistenti, assi, confini) |
| 3 | `physical/domain-dependency-map.md` | Dipendenze consolidate; P11; D2 MercatoImpresa |
| 4 | `fundamental/domain-patterns.md` | Pattern trasversali (PF5, ownership relazioni) |
| 5 | `physical/architecture-baseline.md` | Catena mapping → piano → migrazioni |
| 6 | `physical/domain-mapping/appartenenze.md` | Solo confine: relazione Persona–Impresa non di Imprese |
| Riferimento stile | `migrations/persone-migration-plan.md`, `migrations/opportunita-migration-plan.md` | Metodo e forma del piano |
| Vincolo | Migration esistenti Persone / `business_sectors` / `languages` | Compatibilità, non redesign |

---

## 3. Stato architetturale del dominio

| Decisione | Stato |
|---|---|
| Aggregate Root | Un solo `Impresa` (A01 + E03) |
| Concetti persistenti owned | Impresa; SedeImpresa; SettoreImpresa; ServizioImpresa; ProdottoImpresa; LinguaOperativaImpresa; CertificazioneImpresa; CanaleImpresa; MediaImpresa (Physical §3) |
| Non owned da Imprese | AppartenenzaImpresa (Appartenenze); MercatoImpresa (Mercati Internazionali) |
| Assi Impresa | S01 sostanziale; S02 editoriale; S03 verifica multidimensionale; S04 pubblicazione; S07 amministrativo; S08 storico / archiviazione (Physical §11) |
| Relazione con Persone | **Nessuna FK diretta**; sempre mediata da Appartenenze |
| Badge “Impresa verificata” | **Vietato** — solo aspetti nominati (Physical §12) |
| PC2 | Non aperto su Impresa (un solo AR) |

---

## 4. Stato implementativo attuale

| Elemento | Stato |
|---|---|
| Physical Imprese | **Completato** |
| Migration Plan Imprese | **Completato a livello statico** (M1–M7 SQL presenti; M8.1 skippata; M8.2 validation report) |
| Tabelle / SQL dominio Imprese | **Presenti** — 12 migration SQL M1.1–M7.1 in `supabase/migrations/` |
| `public.profiles` (Persone) | Presente; **non** prerequisito di esistenza dell’Impresa |
| `public.business_sectors` | Catalogo condiviso esistente — riuso VO03 per SettoreImpresa, **non** ownership Imprese |
| `public.languages` | Catalogo esistente — riuso VO03 per LinguaOperativaImpresa |
| Opportunità `business_id` | UUID opaco senza FK — eventuale FK additiva fuori da questo piano |
| Demo `src/data/home/enterprises.ts` | Frontend-only (`isDemo: true`); **non** fonte di verità; **non** seed (M8.1 skippata) |
| `supabase/seed.sql` | **Assente** — nessun seed Imprese prescritto |
| Schema applicato al DB | Evidenza runtime pregressa su ambienti locali controllati; **non** sostitutiva di M8.2 statica |

**Conclusione.** Catena SQL Imprese chiusa staticamente. Nessun backfill da demo. Strutture di istanza ammesse vuote.

---

## 5. Principi della migrazione

1. **Physical prima dello schema** — il mapping Imprese prevale; nessuna nuova decisione di dominio in questo piano.
2. **Strategia additiva** — nuove strutture; niente sostituzioni monolitiche; niente rewrite di Opportunità/Persone.
3. **Un solo Aggregate Root** — non promuovere Entity dipendenti ad AR.
4. **Nessuna duplicazione di fatti altrui** — Appartenenze, Mercati, Editoriali, Osservatorio, Professionisti restano proprietari dei propri fatti.
5. **Nessun riferimento diretto Impresa↔Persona** — PF5/ownership Appartenenze.
6. **Assi di stato separati** — non fondere sostanziale, editoriale, verifica, pubblicazione, amministrativo.
7. **Unità verificabili** — ogni unit applicabile e reviewabile separatamente quanto possibile.
8. **Storico** — cancellazione logica / archiviazione senza distruggere fatti rilevanti (PF8 / Physical §14).
9. **Tassonomia riusata, non ricreata** — settore e lingua referenziano cataloghi esistenti o futuri; questo piano non crea il dominio Tassonomia.
10. **Nessuna anticipazione SQL** — nessun DDL, tipo, CHECK, trigger o indice in questo documento.

---

## 6. Perimetro e scope della prima implementazione

Nucleo necessario per:

- censire e identificare un’Impresa con identità stabile referenziabile;
- rappresentare denominazione, nome pubblico, presentazione, forma organizzativa, dimensione, anno di avvio (come concetti del Physical, non come DDL qui);
- gestire assi sostanziale / editoriale / pubblicazione / amministrativo;
- dichiarare settori e lingue operative;
- gestire sedi e canali;
- dichiarare servizi e prodotti;
- dichiarare certificazioni e media pubblici;
- registrare verifiche **solo** sugli aspetti owned da Imprese;
- applicare gate di pubblicazione/visibilità della scheda e delle Entity dipendenti.

Una Impresa deve poter esistere **senza** Appartenenza, **senza** MercatoImpresa, **senza** Opportunità/Collaborazioni/Eventi collegati.

---

## 7. Elementi esplicitamente esclusi e rinviati

| Elemento | Destinazione |
|---|---|
| AppartenenzaImpresa, ruoli, Autorizzazione a gestire, gestore scheda | **Appartenenze** |
| MercatoImpresa / Presenza / Interesse di mercato | **Mercati Internazionali** |
| Profilo professionale / servizi professionali | **Professionisti** |
| Collaborazioni che referenziano Impresa | **Collaborazioni** |
| Opportunità che referenziano Impresa (inclusa futura FK su `business_id`) | **Opportunità** (migration additiva successiva, fuori da questo piano) |
| StorieImpresa / narrazione | **Contenuti Editoriali** |
| Eventi (organizzatore/sponsor) | **Eventi** |
| Indicatori / aggregazioni | **Osservatorio** |
| Account, RLS applicative, S05 tecnico | **Identità & Accessi** |
| Organizzazioni istituzionali / reti / associazioni come Entity | Dominio candidato — **non** introdotto |
| Marchio come Entity autonoma | Questione logica aperta — **rinviata** |
| Identificativi fiscali / registri | Questione logica aperta — **rinviata** |
| Fusioni / cessioni / trasformazioni societarie | Questione logica aperta — **rinviata** |
| Tecnica di storicizzazione, storage file, event bus | Rappresentazione fisica concreta — **rinviata al SQL** |
| Seed demo da `enterprises.ts` | **M8.1 SKIPPATA** — nessun seed, nessun backfill; demo resta frontend-only |

---

## 8. Prerequisiti

| # | Prerequisito | Note |
|---|---|---|
| 1 | Physical Imprese approvato | Vincolo |
| 2 | Dependency Map coerente (MercatoImpresa non owned; Appartenenza non owned) | Vincolo |
| 3 | Catalogo settori riusabile (`business_sectors` o equivalente approvato) | Necessario da M2.1 |
| 4 | Catalogo lingue riusabile (`languages` o equivalente approvato) | Necessario da M2.2 |
| 5 | Convenzioni naming / soft-delete del progetto | Allineamento a Persone dove pertinente |
| 6 | Backup / recovery ambiente di applicazione | Prima di ogni push SQL futuro |
| 7 | Identity & Access per scritture future | Trasversale; **non** bloccante per il DDL fondazionale |

**Non prerequisito:** esistenza di Appartenenze in DB; esistenza di Mercati; chiusura operativa Opportunità; frontend switch.

---

## 9. Dipendenze

### 9.1 Dipendenze necessarie (per validità sostanziale delle unit)

| Dipendenza | Natura | Unit interessate |
|---|---|---|
| Tassonomia Settore (`business_sectors`) | VO03 in lettura | M2.1 |
| Tassonomia Lingua (`languages`) | VO03 in lettura | M2.2 |
| (Futuro) Territori | VO03 per localizzazione sede | M3.1 — se catalogo non ancora mappato, ammettere rappresentazione dichiarativa compatibile col Physical senza creare dominio Territori |

### 9.2 Dipendenze facoltative / di supporto

| Dipendenza | Natura |
|---|---|
| Appartenenze | Gate pubblicazione “referente responsabile” (condizione 5 Physical §15) — **gate applicativo**, non FK nel nucleo |
| Identità & Accessi | Applicazione accesso (S05) — fuori DDL di questo piano |
| Mercati Internazionali | Solo lettura futura della relazione owned altrove |

### 9.3 Dipendenze in entrata (non create qui)

Opportunità, Collaborazioni, Eventi, Editoriali, Osservatorio, Professionisti, Appartenenze referenzieranno l’identità stabile Impresa. Questo piano **non** crea le loro strutture né le FK di ritorno.

### 9.4 Dipendenze vietate

- FK Impresa → Persona / profiles;
- tabelle di soci/amministratori/fondatori owned da Imprese;
- ownership di MercatoImpresa o Presenza;
- ownership di StorieImpresa;
- indicatori aggregati;
- secondo catalogo settori/lingue duplicato.

---

## 10. Analisi delle strutture esistenti

| Elemento | Classificazione | Azione |
|---|---|---|
| Tabelle Impresa / Sede / … | Assenti | Creare da zero (M1–M7) |
| `business_sectors` | Catalogo condiviso | Riferire da M2.1; non ownership |
| `languages` | Catalogo condiviso | Riferire da M2.2; non ownership |
| `profiles` | Dominio Persone | Nessuna FK da Imprese |
| Opportunità `business_id` | UUID opaco | Lasciare; eventuale FK additiva **dopo** M1, fuori perimetro minimo di questo piano o come unit esplicita post-M1 se approvata separatamente |
| Demo `enterprises.ts` | Frontend-only | Non autorità; M8.1 |

---

## 11. Strategia generale

```text
M1 nucleo Impresa + assi lifecycle/pubblicazione
→ M2 dichiarazioni settore/lingua (VO03)
→ M3 sedi + canali
→ M4 servizi + prodotti
→ M5 certificazioni + media
→ M6 verifiche owned
→ M7 coerenza pubblicazione/visibilità (comment-only)
→ M8 riconciliazione / seed opzionale / validazione
```

- Greenfield sulle strutture di dominio.
- Nessuna doppia scrittura DB richiesta oggi.
- Ogni fase: coerente, verificabile, non distruttiva.
- Dopo M1 l’identità Impresa è referenziabile; le unit successive arricchiscono la scheda senza bloccare i consumatori opachi già esistenti.

---

## 12. Sequenza delle migration unit

Nomi **descrittivi**; **nessun timestamp** in questo documento.

| Unit | Nome logico | Dipende da | Applicabile separatamente? |
|---|---|---|---|
| **M1.1** | create business core | — | Sì |
| **M1.2** | add business lifecycle and publication axes | M1.1 | Sì dopo M1.1 |
| **M2.1** | create business sector declarations | M1.1; catalogo settori | Sì |
| **M2.2** | create business operational language declarations | M1.1; catalogo lingue | Sì |
| **M3.1** | create business locations | M1.1 | Sì |
| **M3.2** | create business channels | M1.1 | Sì |
| **M4.1** | create business services | M1.1 | Sì |
| **M4.2** | create business products | M1.1 | Sì |
| **M5.1** | create business certifications | M1.1 | Sì |
| **M5.2** | create business media | M1.1 | Sì |
| **M6.1** | create business verifications | M1.1 | Sì |
| **M7.1** | add business publication and visibility coherence | M1.2 | Sì |
| **M8.1** | optional demo/seed businesses | — | **SKIPPATA** (nessun SQL) |
| **M8.2** | validate and reconcile | assenza seed (M8.1 skip) | **Completata** (report; non SQL) |

**Totale:** 14 unit descrittive (M1.1–M8.2). **12** file SQL (M1.1–M7.1). Nessuna migration M8.

**Stop points:** dopo M1.2 (scheda minima referenziabile); dopo M3.2 (presenza territoriale/digitale dichiarabile); dopo M5.2 (scheda ricca); dopo M7.1 (**pubblicabile concettualmente**: modello fisico semanticamente completo per i predicati di presentazione; pubblicazione effettiva = query/gate applicativi; accesso pubblico definitivo via RLS non ancora implementato); dopo M8.2 (**accettazione statica — raggiunto**).

---

## 13. M1 — Nucleo Impresa

### M1.1 — create business core

| Campo | Contenuto |
|---|---|
| Responsabilità | Introdurre l’Aggregate Root Impresa: identità stabile interna; denominazione; nome pubblico; descrizione/presentazione; **forma organizzativa (C03 locale)**; **dimensione (C03 locale)**; anno di avvio; timestamps di censimento/aggiornamento; soft-delete/archiviazione tecnica secondo pattern progetto. Continuity storica della denominazione (denominazioni precedenti) senza Entity Marchio (Physical §5/§24) |
| Dipendenze | Nessuna tabella Impresa preesistente |
| Output | Struttura core Impresa (dettaglio DDL → Physical + SQL futuro); valori C03 di forma/dimensione introdotti col nucleo (non cataloghi C02 condivisi; Physical §6) |
| Completamento | Esiste un’identità Impresa autonoma; nessun requisito di Persona/Appartenenza; nessun MercatoImpresa; nessun socio incorporato; nessun secondo catalogo “forma/dimensione” come Tassonomia |
| Esclusi | Assi completi di verifica; Entity dipendenti; FK verso profiles; fiscal ID; Marchio come Entity; unit catalogo C02 dedicata (non richiesta dal Physical) |

### M1.2 — add business lifecycle and publication axes

| Campo | Contenuto |
|---|---|
| Responsabilità | Introdurre/espandere assi S01 (Attiva/Cessata), S02 (Bozza/Incompleta/Completa), S04 (non pubblicata/pubblica), S07 (in revisione / sospensioni), e archiviazione storica (S08/VR06) come current-state sull’AR, **senza** fondere gli assi |
| Dipendenze | M1.1 |
| Output | Vocabolari e coerenze di stato sull’AR |
| Completamento | Assi indipendenti; Impresa cessata ≠ scheda cancellata; pubblicazione ≠ verifica |
| Esclusi | S05 tecnico; badge unico verificato; ownership Appartenenza |

---

## 14. M2 — Dichiarazioni di settore e lingua

### M2.1 — create business sector declarations

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere SettoreImpresa (E02): dichiarazione principale/secondaria verso Tassonomia Settore (VO03); unicità del settore principale come invariante di dominio (meccanismo → SQL) |
| Dipendenze | M1.1; catalogo settori |
| Output | Composizione settori owned dall’Impresa |
| Completamento | 0..N dichiarazioni; principale unico; rimozione storicizzabile; nessun catalogo settori duplicato |
| Esclusi | Classificazioni ATECO come VO03 interno; MercatoImpresa |

### M2.2 — create business operational language declarations

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere LinguaOperativaImpresa (E02) con contesto d’uso, verso Tassonomia Lingua (VO03) |
| Dipendenze | M1.1; catalogo lingue |
| Output | Composizione lingue operative |
| Completamento | 0..N; Dichiarata/Rimossa; nessun inferire da origine Persone |
| Esclusi | Lingue della Persona; duplicazione `languages` |

---

## 15. M3 — Sedi e canali

### M3.1 — create business locations

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere SedeImpresa (E02): tipologia (C05); localizzazione; visibilità propria ≤ Impresa |
| Dipendenze | M1.1; Territori se/quando disponibili (altrimenti dichiarazione compatibile senza nuovo dominio) |
| Output | Composizione sedi 0..N |
| Completamento | Una sede appartiene a una sola Impresa; sede ≠ Presenza di mercato; sede ≠ luogo Evento |
| Esclusi | Prove di sede; regole speciali estere forzate (questione aperta) |

### M3.2 — create business channels

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere CanaleImpresa (E02): natura canale (C05); ValoreCanale obbligatorio (`channel_value`); contatti digitali/fisici unificati in questa Entity (nessuna Entity Contatto separata); visibilità propria (S04); rimozione storicizzata (S08) |
| Dipendenze | M1.1 |
| Output | Composizione canali 0..N, ciascuno con riferimento concreto |
| Completamento | Ogni canale ha `channel_value` non vuoto; visibilità propria ≤ Impresa (gate a M7.1); nessun assorbimento di account |
| Esclusi | Marketplace come dominio; sync social automatica; Entity Contatto; FK a SedeImpresa / `business_locations`; credenziali; Account; validazione formale avanzata URL/email/telefono; UNIQUE non autorizzato; payload tipizzati/JSON; `is_primary` |

**Colonne minime prescritte per lo SQL M3.2**

| Colonna | Vincolo |
|---|---|
| `id` | UUID PK locale |
| `business_id` | FK → `businesses(id)` (ownership) |
| `channel_type` | text NOT NULL; C05 chiuso sotto |
| `channel_value` | text NOT NULL; anti-vuoto (non solo spazi); nessun default; nessuna FK |
| `visibility_status` | S04: `non_public` \| `public` |
| `channel_status` | S08: `active` \| `removed` (valore conservato anche se removed) |
| `created_at` / `updated_at` | Come altre Entity owned |

**Vocabolario C05 (`channel_type`):** `own_site` \| `ecommerce` \| `marketplace` \| `social` \| `commercial_phone` \| `commercial_email` \| `retail_point` \| `distribution_network`.

**Cardinalità e duplicati.** Più righe dello stesso `channel_type` ammesse quando i `channel_value` rappresentano canali concreti distinti. Nessun UNIQUE obbligatorio in M3.2.

**Stato SQL.** La migration `20260731120000_create_business_channels.sql` è allineata a questo contratto (`channel_value`, C05 con `commercial_email`, S04/S08). Approvata staticamente con rilievi non bloccanti.

---

## 16. M4 — Servizi e prodotti

### M4.1 — create business services

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere ServizioImpresa (E02): nome obbligatorio; descrizione/destinatari/territorio dichiarativi facoltativi; stato di pubblicazione proprio S04 Bozza/Pubblicato (`draft`/`published`); rimozione storicizzata S08 (`active`/`removed`) — Physical §8A, §11.2 |
| Dipendenze | M1.1 |
| Output | Composizione servizi 0..N in `business_services` |
| Completamento | Ogni servizio ha `name` non vuoto; pubblicazione propria; ≠ ServizioProfessionale; territorio ≠ Sede ≠ Mercato; nessuna lingua strutturata in questa unit; ceiling pubblicazione ≤ Impresa rinviato a M7.1 |
| Esclusi | Clienti/fornitori come Entity; catalogo servizi piattaforma; ServizioProfessionale; Opportunità; Contatto; FK Territori/Mercati; lingue del servizio (relazione a LinguaOperativaImpresa); UNIQUE sul nome; JSON/array; prezzo/categoria/slug; `visibility_status`; dipendenza da M2.2/M3.1 |

**Colonne minime prescritte per lo SQL M4.1**

| Colonna | Vincolo |
|---|---|
| `id` | UUID PK locale; default `gen_random_uuid()` |
| `business_id` | FK → `businesses(id)` ON DELETE CASCADE; NOT NULL |
| `name` | text NOT NULL; anti-vuoto (non solo spazi); nessun default |
| `description` | text nullable |
| `target_audience` | text nullable; nessun CHECK chiuso |
| `served_territory` | text nullable; se valorizzato: anti-vuoto; nessuna FK; nessun UUID/ISO/GIS |
| `publication_status` | S04: `draft` \| `published`; NOT NULL; default `draft` |
| `service_status` | S08: `active` \| `removed`; NOT NULL; default `active` |
| `created_at` / `updated_at` | Come altre Entity owned; trigger `updated_at` dedicato |

**Cardinalità e duplicati.** 0..N servizi per Impresa. Stesso `name` ammesso più volte per la stessa Impresa. Nessun UNIQUE obbligatorio in M4.1.

**Lingue.** Rinviate a unità successiva (non M4.2 prodotti). M4.1 non dipende da M2.2.

**Pattern difensivo.** RLS abilitata senza policy; `REVOKE ALL` da `anon`/`authenticated`; nessun GRANT.

### M4.2 — create business products

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere ProdottoImpresa (E02): nome obbligatorio; descrizione dichiarativa facoltativa; S04 Bozza/Pubblicato (`draft`/`published`); S08 (`active`/`removed` via `product_status`) — Physical §8B, §11.2 |
| Dipendenze | M1.1 |
| Output | Composizione prodotti 0..N in `business_products` |
| Completamento | Ogni prodotto ha `name` non vuoto; pubblicazione propria; ≠ ServizioImpresa; ≠ e-commerce; nessuna categoria strutturata; ceiling ≤ Impresa rinviato a M7.1 |
| Esclusi | Magazzino/e-commerce; prezzo/valuta/disponibilità; categorie/raggruppamenti strutturati (questione aperta Logical §12); destinatari; territorio; lingue; media; FK a `business_services`/Mercati/Sedi; UNIQUE sul nome; `visibility_status`; dipendenza da M2–M4.1 |

**Colonne minime prescritte per lo SQL M4.2**

| Colonna | Vincolo |
|---|---|
| `id` | UUID PK locale; default `gen_random_uuid()` |
| `business_id` | FK → `businesses(id)` ON DELETE CASCADE; NOT NULL |
| `name` | text NOT NULL; anti-vuoto (non solo spazi); nessun default |
| `description` | text nullable |
| `publication_status` | S04: `draft` \| `published`; NOT NULL; default `draft` |
| `product_status` | S08: `active` \| `removed`; NOT NULL; default `active` |
| `created_at` / `updated_at` | Come altre Entity owned; trigger `updated_at` dedicato |

**Cardinalità e duplicati.** 0..N prodotti per Impresa. Stesso `name` ammesso più volte. Nessun UNIQUE obbligatorio in M4.2.

**Pattern difensivo.** RLS abilitata senza policy; `REVOKE ALL` da `anon`/`authenticated`; nessun GRANT.

**Composizione del blocco M4.** Solo M4.1 (chiusa) e M4.2. Lingue del servizio e categorie prodotto **non** sono unità M4.

---

## 17. M5 — Certificazioni e media

### M5.1 — create business certifications

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere CertificazioneImpresa (E02): nome obbligatorio; ente emittente dichiarativo facoltativo; stato corrente a cinque valori; `expires_at` opzionale — Physical §13.1 |
| Dipendenze | M1.1 |
| Output | Composizione certificazioni 0..N in `business_certifications` |
| Completamento | Scaduta ≠ Revocata; nessuna presentazione come valida se expired/revoked (gate presentazione M7.1 / applicativo); ≠ Appartenenza; ≠ MediaImpresa; storage file rinviato |
| Esclusi | Dominio Organizzazioni istituzionali; DOC come sostituto del fatto; colonne file/MIME; `visibility_status`; `publication_status`; M6 multi-aspetto Impresa; FK a `business_media` |

**Colonne minime prescritte per lo SQL M5.1**

| Colonna | Vincolo |
|---|---|
| `id` | UUID PK locale; default `gen_random_uuid()` |
| `business_id` | FK → `businesses(id)` ON DELETE CASCADE; NOT NULL |
| `name` | text NOT NULL; anti-vuoto |
| `issuer` | text nullable |
| `certification_status` | `self_declared` \| `in_verification` \| `verified` \| `expired` \| `revoked`; NOT NULL; default `self_declared` |
| `expires_at` | date nullable; nessun CHECK che obblighi `expired` |
| `created_at` / `updated_at` | Pattern Entity owned; trigger dedicato |

**Pattern difensivo.** Indice `business_id`; nessun UNIQUE su `name`; RLS senza policy; REVOKE anon/authenticated.

### M5.2 — create business media

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere MediaImpresa (E02): natura C05; riferimento concreto obbligatorio; logo principale; visibilità S04; rimozione S08 — Physical §17.1 |
| Dipendenze | M1.1 |
| Output | Composizione media 0..N in `business_media` |
| Completamento | Distinto da supporto Certificazione e da Editoriali; storage/bucket/policy rinviato; al più un logo principale attivo |
| Esclusi | CMS Editoriali; StorieImpresa; FK a servizi/prodotti; DAM metadati (MIME, size, alt); bucket Storage; policy Storage |

**Colonne minime prescritte per lo SQL M5.2**

| Colonna | Vincolo |
|---|---|
| `id` | UUID PK locale; default `gen_random_uuid()` |
| `business_id` | FK → `businesses(id)` ON DELETE CASCADE; NOT NULL |
| `media_kind` | C05: `logo` \| `cover` \| `image` \| `video` \| `public_document`; NOT NULL |
| `media_reference` | text NOT NULL; anti-vuoto; nessuna FK Storage |
| `is_primary` | boolean NOT NULL default false; solo se `media_kind = 'logo'`; UNIQUE parziale un primario attivo per Impresa |
| `visibility_status` | S04: `non_public` \| `public`; default `non_public` |
| `media_status` | S08: `active` \| `removed`; default `active` |
| `created_at` / `updated_at` | Pattern Entity owned; trigger dedicato |

**Pattern difensivo.** Indice `business_id`; RLS senza policy; REVOKE anon/authenticated. Nessuna dipendenza da M5.1.

**Composizione del blocco M5.** Solo M5.1 e M5.2. Nessuna M5.3.

---


## 18. M6 — Verifica di rappresentazione (aspetti owned)

### M6.1 — create business verifications

| Campo | Contenuto |
|---|---|
| Responsabilità | Persistere current-state delle verifiche **owned da Imprese a livello scheda** (S03): `existence`, `company_data`, `contested_profile` — Physical §12 / §12.1 |
| Dipendenze | M1.1 (`public.businesses`) soltanto |
| Output | Tabella `public.business_verifications`; al più una riga corrente per `(business_id, aspect)` |
| Completamento | Nessun badge unico; aspetti nominati; certificazione **non** duplicata (resta M5.1 `certification_status`); aspetti §12 #3–#5 fuori ownership |
| Esclusi | Verifiche Appartenenze/Persone/Identity; FK a `business_certifications`; history/audit; `expires_at`; pubblicazione (M7.1); seed; policy; GRANT |

**Colonne minime prescritte per lo SQL M6.1**

| Colonna | Vincolo |
|---|---|
| `id` | UUID PK locale; default `gen_random_uuid()` |
| `business_id` | FK → `businesses(id)` ON DELETE CASCADE; NOT NULL |
| `aspect` | `existence` \| `company_data` \| `contested_profile`; NOT NULL |
| `status` | vedi sotto; NOT NULL; nessun default globale (dipende dall'aspect) |
| `verified_at` | timestamptz nullable; NULL per `unverified`/`self_declared`/`not_flagged`; NOT NULL per `verified`/`flagged` |
| `source_note` | text nullable; se valorizzato anti-vuoto |
| `created_at` / `updated_at` | Pattern Entity owned; trigger dedicato |

**Compatibilità `aspect` ↔ `status`**

| `aspect` | `status` |
|---|---|
| `existence`, `company_data` | `unverified` \| `self_declared` \| `verified` |
| `contested_profile` | `not_flagged` \| `flagged` |

**Pattern difensivo.** Indice `business_id`; `UNIQUE (business_id, aspect)`; RLS senza policy; REVOKE anon/authenticated. Soft-delete Impresa non cancella le righe.

**Composizione del blocco M6.** Solo M6.1. Nessuna M6.2 / M6.3. M5.1 non è dipendenza di schema di M6.1.

---

## 19. M7 — Pubblicazione, visibilità e gate

### M7.1 — add business publication and visibility coherence

| Campo | Contenuto |
|---|---|
| Responsabilità | Formalizzare il **contratto di coerenza** di pubblicazione/visibilità (Physical §15.1): Impresa come ceiling di **esposizione**; stati locali owned persistiti e indipendenti; visibilità pubblica effettiva derivata in lettura/presentazione; documentazione SQL che chiude i rinvii a M7.1 presenti in M1.2 e M3–M5; distinzione pubblicazione scheda ≠ StoriaImpresa/Editoriali; pubblicazione ≠ verifica (M6) ≠ cessazione |
| Dipendenze | **Dura:** M1.2. **Documentale/semantica:** M3–M5 (colonne S04/S08 e certificazioni già presenti). **Non obbligatoria:** M6. **Nessuna dipendenza di schema** verso Appartenenze, Moderazione o Editoriali |
| Output SQL | Migration **comment-only**: esclusivamente `COMMENT ON COLUMN` (e eventuali `COMMENT ON TABLE` non ridondanti). **Nessuna** modifica strutturale; **nessun** CHECK nuovo; **nessun** trigger; **nessuna** funzione; **nessuna** view; **nessuna** policy; **nessun** GRANT |
| Tabelle interessate | `businesses`; `business_locations`; `business_channels`; `business_media`; `business_services`; `business_products`; `business_certifications` |
| Commenti obbligatori | Su `businesses`: `editorial_status`, `substantial_status`, `publication_status`, `administrative_status`, `is_archived`. Owned: `visibility_status` (locations/channels/media); `media_status`; `publication_status` + `service_status` / `product_status`; `certification_status` |
| Completamento | Ceiling = regola di esposizione, non di persistenza; depubblicazione Impresa non riscrive owned; ripubblicazione può riesporre owned già locali permissivi; nessun campo sintetico di publishability; condizioni cumulative e referente/moderazione come gate applicativi (Physical §15.1) |
| Test attesi | **Solo catalogo:** commenti presenti e testo conforme a §15.1; nessuna modifica a colonne; nessun nuovo constraint; nessun nuovo trigger; nessuna nuova funzione; nessuna nuova view; nessuna policy; nessun nuovo privilegio; nessuna regressione strutturale. **Non** test comportamentali INSERT/UPDATE di enforcement DB (nessun nuovo enforcement) |
| Stop point | **Pubblicabile concettualmente:** il modello fisico è semanticamente completo per i predicati di presentazione; la pubblicazione effettiva resta responsabilità delle query e dei gate applicativi; l’accesso pubblico definitivo non è ancora implementato tramite RLS |
| Esclusi | ALTER strutturali; CHECK cross-table; trigger di ceiling/propagazione; view/funzioni di publishability; policy RLS definitive; GRANT; badge/score; Appartenenze/Moderazione/Editoriali come ownership; seed; M8; riapertura M6 |

**Composizione del blocco M7.** Solo M7.1. Nessuna M7.2 / M7.3.

---

## 20. M8 — Riconciliazione, seed e validazione

### M8.1 — SKIPPATA PER DECISIONE ARCHITETTURALE

**Stato:** `SKIPPATA`.

**Decisione:** Seed / backfill da demo = **NO**.

| Campo | Contenuto |
|---|---|
| Responsabilità | Valutare e chiudere l’eventuale persistenza demo da `src/data/home/enterprises.ts` |
| Decisione | **SKIPPATA** — nessun seed, nessun backfill, nessuna migration |
| Artefatti prodotti | Nessuno |
| Migration prodotte | Nessuna |
| Dati inseriti | Nessuno |
| Dipendenze | Nessuna |
| Motivazione | I record di `enterprises.ts` sono demo frontend (`isDemo: true`), incompleti e non qualificati per la persistenza; non costituiscono fonte di verità; non devono essere trasformati in dati reali né ricevere auto-pubblicazione / auto-verifica / auto-certificazione; nessun `supabase/seed.sql` specifico Imprese è prescritto; le strutture di istanza possono legittimamente restare vuote; analogia formale con Opportunità M8.1 |
| Esclusi | Trattare demo come dati reali; INSERT demo; seed automatico; backfill; stati `public` / `verified` / certificati assegnati da demo |
| Riapertura | Solo mediante **nuova decisione architetturale esplicita e separata**, fuori da questa chiusura |

L’unità M8.1 resta nell’inventario come unit formalmente valutata e skippata.

### M8.2 — validate and reconcile — COMPLETATA

| Campo | Contenuto |
|---|---|
| Responsabilità | Validazione statica della catena M1–M7; assenza seed demo (M8.1 skippata); strutture di istanza ammesse vuote; confini Appartenenze/Mercati rispettati; nessuna collisione; applicabilità statica; rapporto di accettazione |
| Dipendenze | Assenza seed (M8.1 skippata); migration SQL M1.1–M7.1 presenti |
| Output | `docs/architecture/migrations/imprese-m8.2-validation-report.md` |
| Completamento | Dominio Imprese chiudibile staticamente senza dati di istanza |
| Natura | **Non** è una migration SQL; **non** crea schema; **non** applica SQL; **non** introduce seed; **non** sostituisce i test runtime post-applicazione |
| Stato | **Completata** |

---

## 21. Invarianti da preservare

1. Identità stabile Impresa indipendente da Persone e Appartenenze.  
2. Nessuna FK Impresa→Persona.  
3. Appartenenza e MercatoImpresa non owned.  
4. Assi di stato separati.  
5. Settore principale unico (invariante; enforcement → SQL).  
6. Sede appartiene a una sola Impresa.  
7. Certificazione scaduta/revocata non presentata come valida.  
8. Visibilità Entity dipendente ≤ Impresa.  
9. Nessun badge “Impresa verificata”.  
10. Nessun indicatore/aggregato owned.  
11. Soft-delete/archiviazione senza distruggere storia rilevante.  
12. Tassonomia riusata (VO03), non duplicata.  
13. Un solo Aggregate Root.

---

## 22. Strategia di review

Per ogni unit SQL futura:

1. Micro-review del Physical pertinente alla unit (se il DDL richiede precisione aggiuntiva).  
2. Generazione SQL fedele al Physical (nessuna reinvenzione).  
3. Review SQL indipendente (stile Opportunità).  
4. Nessuna modifica silenziosa al Physical senza fase dedicata.

Review di questo piano: verifica assenza SQL; completezza unit; confini; ordine; dipendenze cataloghi.

---

## 23. Strategia di validazione

### Statiche (M8.2)
Inventario unit; ordine; riconciliazione Physical↔SQL; grafo FK; assenza ownership aliena; strutture vuote; PostgreSQL target di progetto; assenza seed demo se skippato.

### Runtime (debito operativo post-applicazione)
Esistenza strutture; unicità settore principale; cascade delete owned; regressione Persone/Opportunità opache. Dopo M7.1: verifica **catalogo commenti** di coerenza (Physical §15.1); non-presentazione certificazioni scadute e gate di esposizione restano responsabilità applicativa/presentazione, non enforcement DB di M7.1.

---

## 24. Strategia SQL successiva

1. Completare eventuale chiusura/documentazione Persone se necessario al catalogo riusato.  
2. Generare SQL **per unit** nell’ordine §12, senza timestamp in questo piano.  
3. Dopo M1.1: valutare migration **additiva separata** in Opportunità per FK `business_id` → Impresa (fuori dal perimetro minimo Imprese; richiede decisione esplicita).  
4. Non applicare SQL in questa fase documentale.  
5. Non creare Appartenenze/Mercati “vuote” per far passare Imprese.

---

## 25. Criteri di accettazione

### Del piano (questo documento)
- [x] Tutti i concetti persistenti Physical §3 hanno una unit;  
- [x] Appartenenza e MercatoImpresa esclusi;  
- [x] Nessun SQL/DDL;  
- [x] Dipendenze catalogo dichiarate;  
- [x] Ordine M1→M8 coerente;  
- [x] Stop points e invarianti definiti;  
- [x] Allineamento a Dependency Map / Domain Patterns.

### Della catena SQL (chiusura statica)
- [x] Identità Impresa referenziabile;  
- [x] Nessuna FK a profiles;  
- [x] Owned cascade coerenti;  
- [x] Assi non fusi;  
- [x] Cataloghi non duplicati;  
- [x] M8.1 skippata; M8.2 statica superata (`imprese-m8.2-validation-report.md`);  
- [x] Migration non confuse con seed demo.

---

## 26. Strategia di rollback

| Condizione | Strategia |
|---|---|
| Unit non applicata | Non applicare / correggere SQL |
| Unit applicata, zero dati | Compensazione in avanti o rimozione controllata delle sole strutture nuove |
| Unit applicata, dati presenti | Compensazione in avanti; **preservare** record; no drop distruttivo |
| Parziale (es. M1 senza M4) | Consentito; Impresa resta non “completa” ma referenziabile |
| Emergenza | Disabilitare pubblicazione (asse); mantenere strutture |

---

## 27. Rischi e mitigazioni

| # | Rischio | Mitigazione |
|---|---|---|
| 1 | Introdurre soci/ruoli in Imprese | Esclusione §7; review confini |
| 2 | Possedere MercatoImpresa | D2 Dependency Map; esclusione M2–M7 |
| 3 | FK a profiles “per comodità” | Divieto esplicito; PF5 |
| 4 | Badge verificato unico | M6.1 aspetti nominati |
| 5 | Duplicare `business_sectors` | M2.1 riuso catalogo |
| 6 | Seed demo in produzione | **M8.1 SKIPPATA** — nessun seed |
| 7 | Anticipare Appartenenze | Gate pubblicazione applicativo |
| 8 | Modificare Opportunità nel piano Imprese | FK `business_id` solo unit dedicata post-M1 |
| 9 | DDL nel Migration Plan | Nota esclusione; review |
| 10 | Fusioni societarie incomplete | Rinviate §29 |

---

## 28. Punti di controllo

| Checkpoint | Procedere se | Stop se |
|---|---|---|
| Post M1.2 | Identità + assi base OK | Stato unico fuso; FK a Persona |
| Post M2.2 | Dichiarazioni VO03 OK | Catalogo settori/lingue duplicato |
| Post M3.2 | Sedi OK; canali con `channel_value` e C05 incluso `commercial_email` | Sede = mercato; Contatto come AR; canale senza ValoreCanale |
| Post M5.2 | Certificazioni/media OK | Ente emittente come AR; media = Editoriali |
| Post M6.1 | Solo aspetti owned | Verifiche Appartenenza/Persona owned qui |
| Post M7.1 | Contratto di coerenza comment-only allineato a Physical §15.1; nessun CHECK/trigger/view di publishability | RLS definitive anticipate; ceiling implementato come vincolo strutturale |
| Post M8.2 | Validazione statica OK (`imprese-m8.2-validation-report.md`); M8.1 skippata | Seed demo persistito; ownership aliena |

---

## 29. Questioni aperte

Eredità Physical §24 / Logical §12 — **non** risolte da questo piano:

1. Ditte individuali: presentazione differenziata?  
2. Marchi come Entity?  
3. Categorie prodotto?  
4. Dati fiscali: conservare vs solo verificare?  
5. Prima rivendicazione gestione scheda senza Appartenenza (competenza Appartenenze).  
6. Regole sedi estere.  
7. Fusioni/cessioni/trasformazioni.  
8. Seed demo M8.1: **chiusa — SKIPPATA** (nessun seed/backfill).  
9. Momento della FK Opportunità.`business_id` → Impresa.  
10. Mapping fisico Territori se richiesto da M3.1 oltre dichiarazione testuale.

---

## 30. Deliverable

### Di questo piano
1. Il presente documento `imprese-migration-plan.md`.  
2. Sequenza unit M1.1–M8.2.  
3. Confini e rinvii espliciti.

### Completati (catena Imprese)
1. Migration SQL M1.1–M7.1.  
2. Review SQL delle unit strutturali.  
3. M8.1 skippata.  
4. M8.2 validation report (`imprese-m8.2-validation-report.md`).

### Successivi (fuori chiusura Imprese)
1. Eventuale FK additiva Opportunità.`business_id` → Impresa.  
2. Migration Plan / mapping Appartenenze, Mercati, Identità & Accessi, Editoriali.  
3. Debito runtime operativo globale, se ripreso in ambienti controllati.

---

## 31. Checklist finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Deriva dal Physical Imprese | Sì |
| 2 | Dependency Map rispettata | Sì |
| 3 | Un solo Aggregate Root | Sì |
| 4 | Appartenenza esclusa | Sì |
| 5 | MercatoImpresa escluso | Sì |
| 6 | Nessuna FK a Persone | Sì |
| 7 | Nove concetti persistenti coperti | Sì |
| 8 | Verifiche owned vs referenziate distinte | Sì |
| 9 | Nessun SQL/DDL | Sì |
| 10 | Nessun timestamp file | Sì |
| 11 | Opportunità non riaperta | Sì |
| 12 | Stile allineato a Persone/Opportunità Plan | Sì |
| 13 | Rilettura confini | Sì |

---

## 32. Conclusione

Il Migration Plan di Imprese è **completato a livello statico**: sequenza greenfield additiva in otto fasi logiche (**14 unit** descrittive; **12** migration SQL M1.1–M7.1); **M8.1 SKIPPATA**; **M8.2** documentata in `imprese-m8.2-validation-report.md`. Appartenenze, Mercati, Professionisti, Collaborazioni, Opportunità, Editoriali, Eventi, Osservatorio e Identità & Accessi restano **fuori ownership**. I cataloghi settore/lingua sono **riusati**, non ricreati. Nessun seed demo. Popolamento, accesso pubblico definitivo (RLS/VIS02) e integrazioni interdominio restano separati da questa chiusura.

---

## C3 Cultural Taxonomy Enrichment (addendum)

**Hybrid C.** Cultura ≠ BC. I settori CCI estendono il catalogo condiviso `business_sectors` (VO03), **non** ownership Imprese.

| Unit | File | Responsabilità |
|---|---|---|
| **C3.3** | `20260813120000_seed_creative_cultural_business_sectors.sql` | Seed CCI: `audiovisual`, `publishing`, `music_industry`, `live_performance`, `design_creative`, `fashion`, `artistic_crafts`, `cultural_heritage_services` |

Nessun backfill dichiarazioni. C3.7 deferred.

*Fine del Migration Plan di Imprese.*
