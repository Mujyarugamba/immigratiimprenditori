# Migration Plan — Dominio Opportunità

## Nota introduttiva di esclusione

Questo documento è un **piano di migrazione concettuale**. Non crea di per sé file `.sql`, non applica migrazioni al database, non definisce policy RLS applicative, endpoint, DTO, repository o UI. Traduce il Physical Domain Mapping di Opportunità in una sequenza implementativa additiva, verificabile e reversibile quando possibile.

**Stato del piano (chiusura statica).** Migration Plan Opportunità **completato a livello statico**: Physical M1–M7 completato; **17 migration SQL** presenti in `supabase/migrations/`; review statiche concluse; **M8.1 skippata**; **M8.2 completata** (`opportunita-m8.2-validation-report.md`). Le migration **non** sono state applicate al database; i test runtime **non** sono stati eseguiti. Distinguere: *schema definito nel repository* ≠ *schema applicato al database*.

Fonti normative: Domain Thesis → Logical Data Model → Physical Domain Mapping → Dependency Map aggiornata. Il PDS storico e i dati demo UI non prevalgono sul modello approvato.

---

## Indice

1. [Scopo](#1-scopo)
2. [Fonti normative](#2-fonti-normative)
3. [Stato architetturale del dominio](#3-stato-architetturale-del-dominio)
4. [Stato implementativo attuale](#4-stato-implementativo-attuale)
5. [Principi della migrazione](#5-principi-della-migrazione)
6. [Scope della prima implementazione](#6-scope-della-prima-implementazione)
7. [Elementi esplicitamente rinviati](#7-elementi-esplicitamente-rinviati)
8. [Prerequisiti](#8-prerequisiti)
9. [Analisi delle strutture esistenti](#9-analisi-delle-strutture-esistenti)
10. [Strategia generale](#10-strategia-generale)
11. [Sequenza delle migration unit](#11-sequenza-delle-migration-unit)
12. [M1 — Nucleo Opportunità](#12-m1--nucleo-opportunità)
13. [M2 — Origine, tipologie e classificazioni](#13-m2--origine-tipologie-e-classificazioni)
14. [M3 — Fonti ed evidenze](#14-m3--fonti-ed-evidenze)
15. [M4 — Destinatari, requisiti, benefici e procedura di accesso](#15-m4--destinatari-requisiti-benefici-e-procedura-di-accesso)
16. [M5 — Temporalità e finestre](#16-m5--temporalità-e-finestre)
17. [M6 — Riferimenti interdominio](#17-m6--riferimenti-interdominio)
18. [M7 — Verifica, pubblicazione e visibilità](#18-m7--verifica-pubblicazione-e-visibilità)
19. [M8 — Riconciliazione, backfill e test](#19-m8--riconciliazione-backfill-e-test)
20. [Strategia per i dati legacy](#20-strategia-per-i-dati-legacy)
21. [Compatibilità](#21-compatibilità)
22. [Dipendenze e ordine di attivazione](#22-dipendenze-e-ordine-di-attivazione)
23. [Invarianti da preservare](#23-invarianti-da-preservare)
24. [Strategia di test](#24-strategia-di-test)
25. [Criteri di accettazione](#25-criteri-di-accettazione)
26. [Strategia di rollback](#26-strategia-di-rollback)
27. [Osservabilità](#27-osservabilità)
28. [Rischi e mitigazioni](#28-rischi-e-mitigazioni)
29. [Punti di controllo e criteri di stop](#29-punti-di-controllo-e-criteri-di-stop)
30. [Questioni aperte](#30-questioni-aperte)
31. [Deliverable](#31-deliverable)
32. [Checklist finale](#32-checklist-finale)
33. [Conclusione](#33-conclusione)

---

## 1. Scopo

Tradurre il Physical Domain Mapping di Opportunità in una sequenza di **migration unit** additive, incrementali e verificabili, compatibili con lo stato reale del repository e con le dipendenze consolidate (D14–D18, D22 unidirezionale, D49; D27/DV10/DV11 non consolidate).

Il piano stabilisce: cosa introdurre; ordine; prerequisiti; rinvii; controlli; rischi; criteri di accettazione; rollback logico; riconciliazione. Il dettaglio DDL è demandato al Physical e alle migration SQL in repository (M1.1–M7.2). Questo documento **non** applica SQL né sostituisce i test runtime.

---

## 2. Fonti normative

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `opportunita-domain-thesis.md` | Significato H8+H10 |
| 2 | `logical/opportunita.md` | Modello logico |
| 3 | `domain-mapping/opportunita.md` | Aggregate, Entity, VO, assi, rinvii PC2 |
| 4 | `domain-dependency-map.md` (post-revisione Opportunità) | D14–D18 Consolidata; D22; V8; D27/DV10/DV11 aperte |
| 5 | Mapping approvati Persone/Imprese/Appartenenze/Mercati/Professionisti/Collaborazioni | Confini e PF5 |
| Vincolo | Migrazioni Supabase esistenti; demo UI; PDS storico | Compatibilità, non redesign |

Letti inoltre: Costituzione; Domain Model; PDS; Domain Patterns; Logical dei domini di confine; `persone-migration-plan.md` (unico Migration Plan approvato presente); elenco migrazioni in `supabase/migrations/`.

---

## 3. Stato architetturale del dominio

| Decisione | Stato |
|---|---|
| Aggregate Root | Un solo `Opportunità` (A01) |
| Fatto posseduto | Rappresentazione governata della possibilità azionabile strutturata |
| Origine | Esterna / interna (varianti, stesso AR) |
| CandidaturaOpportunità | E02 condizionata 0..N; **rinviata** nella prima implementazione |
| Fonte / Evidenza | E02 locali distinte; ≠ promotore/pubblicatore |
| Assi di stato | Sostanziale, rappresentazione, editoriale, pubblicazione, visibilità, verifica, temporale derivato |
| PC2 / PCa1 | Aperti |
| Dipendenze | D14–D15 necessarie; D16/D18 facoltative; D17 utilizzo quando applicabile; D22 inbound storico; no Opportunità→Collaborazioni; no Opportunità→Eventi consolidata |

---

## 4. Stato implementativo attuale

### 4.1 Repository (schema definito) vs database (schema applicato)

| Elemento | Stato |
|---|---|
| Physical Mapping Opportunità (M1–M7) | **Completato** |
| Migration SQL Opportunità M1.1–M7.2 | **17 file presenti** in `supabase/migrations/` |
| Review statiche M1–M7.2 | **Concluse** (approvazioni statiche) |
| Schema Opportunità nel **repository** | **Definito** (DDL delle 17 migration) |
| Schema Opportunità **applicato al database** | **Non applicato** — nessuna migration Opportunità eseguita |
| Test runtime / integrazione | **Non eseguiti** — debito operativo post-chiusura statica |
| `business_sectors` | Catalogo condiviso; referenziabile da M6.3 — **non** ownership Opportunità |
| `training_*` | Fuori dominio Opportunità (Servizi/Eventi/Formazione) |

### 4.2 Applicazione / contenuti

| Elemento | Stato | Classificazione |
|---|---|---|
| `src/data/home/opportunities.ts` | Demo statica (6 schede, `isDemo: true`) | Frontend-only — **non** persistenza; **non** backfill (M8.1 skippata) |
| UI home sezione Opportunità | Card demo | Presentazionale fino a switch futuro |
| PDS §8–§9 | Specifica storica pre-tesi | Non autorità; non migrare |
| Contenuti editoriali DB | Assenti | Confine: scheda = Opportunità; narrazione = Editoriali (futuro) |

**Conclusione.** Greenfield additivo **completato a livello statico** (DDL in repository). Nessun seed demo. Nessun backfill da `opportunities.ts`. Cataloghi controllati M2.1/M4.1 hanno seed **prescritti** distinti da M8.1.

---

## 5. Principi della migrazione

1. **Architettura prima dello schema** — Thesis / Logical / Physical / Dependency Map prevalgono.
2. **Strategia additiva** — nuove strutture; estensioni compatibili; popolamento progressivo; deprecazione controllata; niente sostituzioni monolitiche.
3. **Nessuna anticipazione PC2** — non promuovere Candidatura, Valutazione, Graduatoria, Assegnazione, Fonte, Contestazione ad Aggregate autonomi.
4. **Nessun dominio nuovo** — no Organizzazioni, Servizi, Fonte-dominio, Procedure-dominio.
5. **Solo dipendenze consolidate** — D14–D18, D49; non consolidare D27, DV10, DV11; non ownership Opportunità→Collaborazioni.
6. **Unità verificabili** — ogni migration unit applicabile e testabile separatamente quanto possibile.
7. **Storico** — ritiro/archiviazione senza cancellazione distruttiva dei fatti rilevanti.
8. **Candidatura non obbligatoria** — nessuna struttura che renda la candidatura invariante.

---

## 6. Scope della prima implementazione

Nucleo necessario per:

- censire e identificare Opportunità;
- rappresentare titolo, sintesi, descrizione, finalità;
- origine esterna/interna;
- tipizzazione e modalità di accesso (elenchi controllati, M2);
- procedura di accesso dichiarativa (istruzioni e canale operativo, M4.4);
- benefici e requisiti dichiarati;
- destinatari/criteri dichiarati;
- Fonti ed Evidenze;
- temporalità di accesso e finestre (M5; ≠ pubblicazione/ritiro/archiviazione);
- verifica di rappresentazione (M7);
- pubblicazione, programmazione, ritiro, visibilità, archiviazione (M7; ≠ scadenze di accesso);
- riferimenti opachi consolidati (Persone, Imprese, Appartenenze utilizzo, Professionisti facoltativo, Mercati facoltativo);
- storico essenziale degli aggiornamenti rilevanti;
- supporto a Opportunità esterne e interne **senza** procedura interna completa.

---

## 7. Elementi esplicitamente rinviati

| Elemento | Motivo |
|---|---|
| CandidaturaOpportunità completa (scenari B/C) | Scope; PC2 aperto; non obbligatoria |
| Valutazione / ammissibilità strutturata | Processo interno non richiesto in M1–M8 |
| Graduatoria | Non posseduta / rinviata |
| Assegnazione / Beneficiario formalizzato | Rinviata |
| Contestazione (PCa1) | Aperta |
| Motore requisiti / matching / raccomandazioni / ranking | Fuori mapping |
| Automazioni / notifiche | Non architetturali qui |
| Opportunità → Eventi (DV11) | Non consolidata |
| Ownership / collezioni inverse Collaborazioni | Vietato (D22 unidirezionale) |
| Organizzazioni / Servizi | Domini inesistenti |
| Versionamento avanzato / deduplicazione automatica | Solo storico minimo |
| Workflow editoriali complessi oltre assi base | Successivi |
| RLS policy definitive / UI / API pubbliche | Non in questo piano |

**Estensione futura ammissibile senza “tabelle vuote”:** `ModalitàAccesso` (C05, M2) classifica il tipo di accesso; `ProceduraAccesso` (VO, M4.4) descrive istruzioni/canale operativo dichiarati. Nessuna struttura di candidatura, domanda inviata, prenotazione effettuata o workflow di pratica anticipata senza uso reale.

---

## 8. Prerequisiti

### 8.1 Prerequisiti generali

| # | Prerequisito | Note |
|---|---|---|
| 1 | Physical Mapping Opportunità approvato | Vincolo |
| 2 | Dependency Map aggiornata (D14–D18 Consolidata) | Vincolo |
| 3 | Convenzioni naming / soft-delete / pubblicazione del progetto | Allineamento a Persone dove pertinente |
| 4 | Backup / recovery ambiente di applicazione | Prima di ogni push |
| 5 | Identity & Access disponibile per scritture (D49) | Almeno capacità di supporto; policy dettagliate fuori scope |

### 8.2 Prerequisiti per riferimenti (M6)

| Dominio | Disponibilità | Strategia se assente |
|---|---|---|
| Persone | Parziale (`profiles` esiste) | Riferimento opaco a identità Persona; attivare quando pubblicazione reale richiede attori |
| Imprese | Non ancora mappata fisicamente in DB | Riferimenti opzionali/informativi finché disponibile; non duplicare scheda Impresa |
| Appartenenze | Non in DB | D17: blocco “quando applicabile”; senza Appartenenza non abilitare azioni “per conto di Impresa” |
| Professionisti | Non in DB | D16 facoltativa: omettere finché disponibile |
| Mercati Internazionali | Non in DB | D18 facoltativa: omettere o usare solo riferimenti territorio/catalogo già condivisi (es. settori) senza creare Presenze |
| Collaborazioni | Non richiesta per esistenza Opportunità | Non introdurre |
| Eventi | Non consolidata | Non introdurre |

Controlled List locali di Opportunità possono nascere in M2 senza dipendere da altri domini.

---

## 9. Analisi delle strutture esistenti

| Elemento | Classificazione | Azione / esito |
|---|---|---|
| Tabelle Opportunità (repository) | Definite da M1.1–M7.2 (19 tabelle) | DDL presente; **non** ancora applicato al DB |
| Demo `opportunities.ts` | Demo frontend (`isDemo: true`) | **M8.1 skippata** — resta frontend-only; non fonte di verità |
| Tipi menu demo (Bandi, Finanziamenti, …) | Etichette UI | Non gerarchia fisica; tipizzazione = C05 M2 |
| PDS Opportunità / ManifestazioneDiInteresse | Incompatibile come modello target | Non implementare |
| `training_offers` / richieste | Incompatibile come Opportunità | Mantenere fuori dominio |
| `business_sectors` | Catalogo condiviso | Riferimento M6.3; non ownership |
| Contenuti editoriali | Assenti in DB | Confine Editoriali (futuro) |

---

## 10. Strategia generale

```text
M1 nucleo → M2 classificazioni (incl. ModalitàAccesso C05)
→ M3 fonti/evidenze → M4 destinatari/requisiti/benefici/ProceduraAccesso
→ M5 temporalità → M6 riferimenti consolidati → M7 verifica/pubblicazione/visibilità
→ M8 riconciliazione/backfill/test
```

- **Greenfield** sulle strutture di dominio.
- **Nessuna doppia scrittura DB** necessaria oggi (nessun legacy persistente).
- Eventuale **doppia lettura** solo tra demo UI e nuove strutture durante transizione front-end (fuori da questo piano come implementazione).
- Ogni fase: coerente, verificabile, non distruttiva, senza cicli di dipendenza.

---

## 11. Sequenza delle migration unit

Nomi descrittivi; timestamp effettivi nei file SQL in `supabase/migrations/`.

| Unit | Nome | Dipende da | Stato finale | Applicata al DB |
|---|---|---|---|---|
| **M1.1** | create opportunity core | — | **Completata** (SQL) | No |
| **M1.2** | add opportunity lifecycle state axes | M1.1 | **Completata** (SQL) | No |
| **M2.1** | create opportunity controlled lists | M1.1 | **Completata** (SQL; seed catalogo prescritto) | No |
| **M2.2** | attach classifications to opportunity | M1.1, M2.1 | **Completata** (SQL) | No |
| **M3.1** | create opportunity sources | M1.1 | **Completata** (SQL) | No |
| **M3.2** | create opportunity evidence | M1.1; M3.1 | **Completata** (SQL) | No |
| **M4.1** | create opportunity audience criteria | M1.1 | **Completata** (SQL; seed catalogo prescritto) | No |
| **M4.2** | create opportunity requirements | M1.1 | **Completata** (SQL) | No |
| **M4.3** | create opportunity benefits | M1.1 | **Completata** (SQL) | No |
| **M4.4** | create opportunity access procedure | M1.1 | **Completata** (SQL) | No |
| **M5.1** | create opportunity time windows | M1.1 | **Completata** (SQL) | No |
| **M5.2** | add opportunity temporal milestones | M1.1; M5.1 | **Completata** (SQL) | No |
| **M6.1** | create opportunity party references | M1.1; Persone minima | **Completata** (SQL) | No |
| **M6.2** | create opportunity representation utilizations | M6.1 | **Completata** (SQL) | No |
| **M6.3** | create opportunity context references | M1.1; cataloghi esterni | **Completata** (SQL) | No |
| **M7.1** | create opportunity verifications | M1.1 | **Completata** (SQL) | No |
| **M7.2** | add opportunity publication state | M1.1 | **Completata** (SQL) | No |
| **M8.1** | backfill optional demo/seed opportunities | M1–M7 | **SKIPPATA PER DECISIONE ARCHITETTURALE** | N/A |
| **M8.2** | validate and reconcile | assenza seed (M8.1 skip) | **Completata** (validazione statica) | N/A |

**Totale:** 19 unit descrittive (M1.1–M8.2). **17** file SQL (M1.1–M7.2). Nessuna M7.3 / M8.3.

**MIGRATION PLAN OPPORTUNITÀ COMPLETATO A LIVELLO STATICO** — nessuna unità SQL obbligatoria mancante; nessuna unità extra; nessuna collisione bloccante; nessun seed demo; catena staticamente applicabile; migration non applicate.

**Stop points:** dopo M1.2; dopo M4.4; dopo M5.2; dopo M7.2; dopo M8.2 (accettazione statica — raggiunto).

---

## 12. M1 — Nucleo Opportunità

### Obiettivo
Introdurre l’identità autonoma della rappresentazione governata.

### Contenuto concettuale
Identità interna; titolo; sintesi; descrizione strutturata; finalità; origine (minimo); stato sostanziale; stato rappresentazione; timestamps di censimento/aggiornamento; ritiro/archiviazione come stati/assi, non delete fisico.

### Esclusi
Candidature; valutazioni; assegnazioni; graduatorie; Eventi; Collaborazioni inverse.

### Prerequisiti
Mapping approvato; nessun conflitto di naming con tabelle esistenti.

### Controlli / completamento
Esiste almeno una struttura core; ogni Opportunità ha identità autonoma; stati sostanziale e rappresentazione distinti; soft-archive senza perdita.

### Rollback logico
Se non popolata: rimozione controllata della unit. Se popolata: compensazione in avanti; preservare record.

---

## 13. M2 — Origine, tipologie e classificazioni

### Contenuto
- Origine: `esterna` \| `interna` (obbligatoria).
- TipologiaOpportunità: elenco controllato filtrato dal nucleo H8 (multivalore ammesso).
- ModalitàAccesso: elenco controllato locale (C05) — candidatura, domanda, accesso diretto, procedura esterna, … — **senza** entità Candidatura e **senza** istruzioni operative né URL (quelle appartengono a ProceduraAccesso in M4.4).
- Finalità / categorie essenziali come liste o testo strutturato.

### Regole
Non trasformare voci di menu demo in gerarchia fisica. Settori/territori non diventano sottotipi di Opportunità. Liste stabili ma estendibili; voci iniziali minime; resto rinviabile.  
**ModalitàAccesso ≠ ProceduraAccesso:** la prima classifica il *tipo* di accesso; la seconda (M4.4) descrive *come* procedere sulla scheda.

### Completamento
Ogni Opportunità ha origine e ≥1 tipologia e ≥1 modalità di accesso (invarianti del nucleo).

---

## 14. M3 — Fonti ed evidenze

### Fonte (E02)
Tipologia; autorità; attendibilità; data consultazione; lingua; versione; stato (attiva, sostituita, non raggiungibile, storica); designazione fonte principale; supporto multi-fonte.

### Evidenza (E02)
Riscontro distinto dalla Fonte; collegabile a esistenza, scadenza, requisito, beneficio, esito futuro.

### Prima release
≥1 Fonte per Opportunità pubblicabile; Evidenza facoltativa ma struttura presente.

### Successivo
Workflow di sostituzione avanzati; contestazione fonti (PCa1).

### Divieti
Fonte ≠ Promotore ≠ Pubblicatore ≠ Ente gestore. Nessun dominio Fonte. Fonte non disponibile ≠ cancellazione Opportunità.  
URL di Fonte (provenienza informativa) ≠ link operativo di ProceduraAccesso (M4.4).

---

## 15. M4 — Destinatari, requisiti, benefici e procedura di accesso

Ordine delle unit: **M4.1** Destinatari → **M4.2** Requisiti → **M4.3** Benefici → **M4.4** ProceduraAccesso.  
**ModalitàAccesso (C05) resta in M2** e non è riesaminata né duplicata in M4.

### Destinatari (M4.1)
Criteri dichiarati / categorie (liste controllate locali + associazioni), non elenco nominativo obbligatorio.

### Requisiti (M4.2)
E02 dichiarati/strutturati; riferimenti opachi a condizioni di altri domini (senza possesso). Nessun motore di regole.

### Benefici (M4.3)
VO 1..N; monetari e non; importi/limiti come dichiarati; **≠ erogazione**.

### ProceduraAccesso (M4.4)

**Natura.** Value Object **dichiarativo** di composizione owned dall’Aggregate Root Opportunità (Physical §19). Non Entity E02 autonoma; non Controlled List; non catalogo riusabile.

**Responsabilità.** Descrivere sulla scheda *come* il potenziale interessato può procedere per richiedere, utilizzare, prenotare o partecipare all’Opportunità: istruzioni operative dichiarate e, quando pertinente, canale/link operativo dichiarato.

**Distinzioni obbligatorie.**

| Concetto | Rapporto con M4.4 |
|---|---|
| ModalitàAccesso (M2, C05) | Classifica il *tipo* di accesso; già implementata; **non** rientra in M4.4 |
| Contatto informativo | Distinto (Logical); non duplicare come modello Contatti in M4.4 |
| Fonte (M3.1) | URL informativo / provenienza ≠ link operativo di accesso |
| Requisiti (M4.2) | Condizioni da soddisfare ≠ istruzioni procedurali |
| Benefici (M4.3) | Cosa si ottiene ≠ come richiederlo |
| Temporalità (M5) | Finestre/scadenze strutturali ≠ testo procedurale |
| Candidatura / domanda / prenotazione **effettive** | **Fuori scope** |
| Workflow, pratica, protocollo, istruttoria, concessione, erogazione, upload | **Fuori scope** |

**Contenuto concettuale ammissibile in M4.4.** Istruzioni dichiarate (testo); eventuale URL/canale operativo dichiarato come parte della procedura (distinto dalla Fonte). Nessun possesso di procedura ufficiale esterna; nessuna candidatura; nessun documento caricato.

**Cardinalità (piano).** Struttura a supporto di bozze incomplete (nessun minimo SQL obbligatorio in M4.4). Completezza/pubblicabilità (≥1 ModalitàAccesso; eventuale presenza di ProceduraAccesso) restano gate di M7 / invarianti di nucleo, non anticipate come trigger in M4.4. Il dettaglio fisico (colonne su AR vs tabella di composizione 0..1 / 0..N; naming) è demandato all’aggiornamento del Physical Mapping §19 prima della migration SQL.

**Dipendenza tecnica.** Solo nucleo Opportunità (M1.1). Non dipende da M4.1–M4.3, né da M3, né da altri domini.

**Divieti M4.4.** JSONB/EAV; enum/catalogo tipologico parallelo a ModalitàAccesso; FK a Fonti/Evidenze/Requisiti/Destinatari; FK a Persone/Imprese; sistema candidature; stati pratica; upload; scadenze strutturali (M5); `is_active` applicato per analogia a un VO senza fondamento; seed di catalogo.

### Distinzioni memorizzate (M4 nel complesso)
Testo ufficiale / sintesi strutturata / classificazione / riferimento esterno. Non: contenuto editoriale narrativo; regola computabile; scoring; pratica applicativa.

### Completamento (M4)
≥1 beneficio o accesso; ≥1 criterio destinatario; ≥1 modalità di accesso (da M2); requisiti minimi o dichiarazione esplicita di assenza requisiti strutturali (se ammissibile per tipologia); ProceduraAccesso come descrizione dichiarativa quando la scheda espone istruzioni/canale operativo (dettaglio di obbligatorietà a pubblicabilità → M7 / Physical).

---

## 16. M5 — Temporalità e finestre

**Natura (review architetturale M5).** La Temporalità di *accesso/validità della possibilità* è un **Value Object di composizione** owned dall’Aggregate Root (`FinestraAccesso` / `PeriodoValidità`, Physical §6, §29). Non Entity E02; non Controlled List; non asse di stato primario. Cardinalità strutturale **0..N**. Lo **stato temporale** (`futura` / `aperta` / `in scadenza` / `scaduta` / `prorogata`) è **derivato** dalle date, non un campo status onnicomprensivo (PF7).

**Responsabilità di M5.** Rispondere a *quando* la possibilità è (o sarà) accessibile secondo le finestre/scadenze **dichiarate** sulla scheda: apertura; inizio/fine accesso; scadenza; eventuali finestre multiple; proroghe senza cancellare il termine precedente (PF8); casi senza scadenza / continuativi; già scaduta al censimento.

**Ordine delle unit.** **M5.1** finestre di composizione → **M5.2** milestone singolari opzionali sull’AR (complemento, non sostituto delle finestre).

### M5.1 — create opportunity time windows

**Contenuto concettuale.** Tabella di composizione VO per finestre/periodi di accesso dichiarati (dettaglio colonne → aggiornamento Physical §28 prima della SQL). Supporto a 0..N finestre per Opportunità; bozza senza finestra inseribile; nessuna obbligatorietà SQL di minimo uno in M5.

**Dipendenza tecnica.** Solo nucleo Opportunità (M1.1). Non dipende da M2–M4, M6, M7.

### M5.2 — add opportunity temporal milestones

**Contenuto concettuale.** Milestone **singolare** sull’AR chiusa dal Physical §28.15: `external_official_published_at` (pubblicazione ufficiale esterna dichiarata, se nota). Distinta dalla pubblicazione *piattaforma* (M7). Non sostituisce M5.1; non denormalizza `opens_at`/`closes_at` sull’AR.

**Dipendenza.** M1.1; M5.1 consigliata. Nome unit SQL: `add_opportunity_temporal_milestones`.

### Distinzioni obbligatorie (M5)

| Concetto | Rapporto con M5 |
|---|---|
| Pubblicazione / programmazione / ritiro piattaforma | **M7** — asse pubblicazione; ≠ apertura/scadenza |
| Visibilità | **M7** |
| Archiviazione / obsolescenza rappresentazione | **M7** / asse rappresentazione — ≠ scadenza di accesso |
| Censimento (`created_at` / nascita scheda) | Già M1 — non reintrodurre in M5 |
| Revoca / annullamento / esaurimento | Assi **sostanziali** (M1/estensioni) — non finestre M5 |
| Verifica della scadenza | **M7** (usa le date M5; non le possiede) |
| Finestra di candidatura | Solo se ModalitàAccesso lo prevede; **non** invariante di ogni Opportunità; non crea CandidaturaOpportunità |
| Edizione successiva / ricorrente | **Nuova Opportunità** — non nuova finestra della precedente |
| Proroga | Stessa Opportunità; **storicizza** il termine precedente (PF8); ≠ nuova edizione |
| ProceduraAccesso / testo con date | M4.4 può citare scadenze in testo; le date strutturali restano M5 |

### Stati derivati
Futura / aperta / in scadenza / scaduta / prorogata — **calcolati** da finestre/milestone; **non** persistiti come unico asse onnicomprensivo in M5; non fusi con pubblicazione o stato sostanziale.

### Casi supportati
Senza scadenza; continuativa; finestre multiple; scadenze multiple; già scaduta al censimento; proroga ≠ nuova edizione; edizione autonoma = nuova identità; bozza senza date.

### Storico (PF8)
Modifiche a scadenze/proroghe **storicizzate**; vietata la sovrascrittura silenziosa del termine precedente. Il dettaglio (append-only vs supersessione dichiarata delle righe VO) è demandato al Physical §28.

### Divieti M5
JSONB/EAV; Entity E02 referenziabile per la finestra; workflow/scheduling/notifiche; finestre per singolo utente; candidature; stati pubblicazione/visibilità/archiviazione; badge temporale unico persistito; seed di catalogo temporale; anticipazione del modello di Verifica (M7).

### Completamento (M5)
Struttura VO finestre presente; milestone AR solo se chiuse nel Physical; stato temporale trattabile come derivato; pubblicazione/ritiro/archiviazione **assenti** da M5. Gate di pubblicabilità su completezza temporale → M7 / Physical, non trigger di minimo in M5.

---

## 17. M6 — Riferimenti interdominio

| Dipendenza | Trattamento in M6 |
|---|---|
| D14 Persone | Riferimenti opachi obbligatori dove esiste soggetto agente; candidati/beneficiari futuri solo come hook opzionale **senza** strutture di candidatura |
| D15 Imprese | Riferimenti opachi promotore/gestore/finanziatore/collegato |
| D17 Appartenenze | Utilizzo titolo; snapshot minimo ≠ autorità; non creare Appartenenze |
| D16 Professionisti | Facoltativo; Persona + Profilo/Servizio; no soggetto autonomo |
| D18 Mercati | Facoltativo; paese/area/mercato/territorio; no Presenza/Interesse/Esperienza |
| D22 Collaborazioni | **Non** introdurre riferimenti outbound di ownership; nessuna collezione inversa autorevole |
| DV11 / D27 Eventi | **Non** introdurre Opportunità→Eventi |
| Editoriali | Solo confine concettuale; no integrazione bidirezionale obbligatoria |
| D49 Identity | Scritture soggette a supporto accesso; no policy qui |

PF5: solo identificazione necessaria; nessun import di lifecycle altrui.

---

## 18. M7 — Verifica, pubblicazione e visibilità

**Confine con M5.** M7 governa *se e come* la scheda è pubblicata, visibile, verificata, ritirata o archiviata. M5 governa *quando* la possibilità è accessibile secondo finestre/scadenze dichiarate. **Non** spostare in M5: pubblicazione piattaforma, programmazione editoriale, ritiro, visibilità, archiviazione. **Non** spostare in M7: finestre di accesso, scadenze strutturali, storicizzazione proroghe (restano M5).

### Assi (separati, PF7)
Sostanziale; rappresentazione; editoriale (bozza/revisione/approvata/respinta); pubblicazione (non pubblicata/programmata/pubblicata/ritirata); visibilità (privata/redazionale/riservata/di rete/pubblica); verifica (non verificata/in verifica/verificata/non verificabile/superata). Lo **stato temporale derivato** si calcola dalle date M5 e **non** diventa asse di pubblicazione né status unico.

### Verifica
Assi multipli (esistenza, fonte, rappresentazione, scadenza/validità temporale dichiarata, …); autore/ruolo; esito; momento; evidenza; invalidazione/superamento. Nessun badge unico. La verifica della scadenza **usa** le strutture M5; non le ridefinisce.

### Pubblicazione
Prerequisiti minimi di completezza (origine, tipologia, modalità di accesso C05, beneficio/accesso, destinatario, ≥1 Fonte, procedura di accesso dichiarativa quando richiesta dal Physical/gate, coerenza temporale da M5 se richiesta dal gate, assi coerenti). Business permissions: redazione/pubblicatore/verificatore — non RLS qui.

**Distinzioni obbligatorie.** Pubblicazione ≠ apertura; pubblicazione ≠ verifica; visibilità ≠ pubblicazione; programmazione pubblicazione ≠ finestra di accesso M5.

### Ritiro / archiviazione
Senza cancellazione; obsolescenza distinta da **scadenza di accesso (M5)** e da ritiro. Archiviazione ≠ chiusura sostanziale; ritiro ≠ scadenza.

### Unit
- **M7.1** add verification model  
- **M7.2** add editorial / publication / visibility axes  

### Divieti M7 (rispetto a Temporalità)
Non creare finestre di accesso; non duplicare scadenze M5; non fondere scadenza e ritiro; non persistire lo stato temporale derivato come unico status di scheda.

---

## 19. M8 — Riconciliazione, backfill e test

### M8.1 — SKIPPATA PER DECISIONE ARCHITETTURALE

**Decisione:** Seed da demo = **NO — M8.1 SKIPPATA**.

Motivazione:
- i sei record di `src/data/home/opportunities.ts` sono demo frontend;
- sono marcati `isDemo: true`;
- non costituiscono fonte di verità;
- sono incompleti rispetto al modello M1–M7;
- richiederebbero invenzione di dati obbligatori (es. `origin`, tipizzazione C05);
- non possiedono Fonti, Evidenze, Verifiche né ownership editoriale;
- il repository non distingue formalmente migration seed di sviluppo e produzione;
- non devono essere persistiti nel database;
- rimangono frontend-only fino a futura sostituzione (switch UI → modello persistente).

Esplicitamente **non** creati da M8.1: migration seed; INSERT demo; backfill; Fonti/Evidenze/Verifiche da demo; stati `approved` / `published` / `public` sui dati demo.

I seed **prescritti** dei cataloghi controllati **M2.1** (`opportunity_types`, `opportunity_access_modes`) e **M4.1** (`opportunity_audience_types`) **non** sono M8.1 e restano parte delle unit strutturali.

### M8.2 — COMPLETATA

**Natura:** validazione statica; riconciliazione finale; controllo di completezza; verifica dipendenze e collisioni; verifica assenza seed demo; verifica strutture vuote; compatibilità PostgreSQL 17.6.1; applicabilità statica della catena.

**Output:** `docs/architecture/migrations/opportunita-m8.2-validation-report.md`.

M8.2 **non** è una migration; **non** crea SQL; **non** applica SQL; **non** sostituisce test runtime; **non** sostituisce l’applicazione controllata delle migration.

### Backfill
Nessun backfill demo eseguito. M8.2 valida lo scenario di strutture di istanza vuote (cataloghi prescritti esclusi).

---

## 20. Strategia per i dati legacy

| Sorgente | Strategia |
|---|---|
| Tabelle Opportunità (repository) | DDL M1–M7 presente; applicazione DB = debito operativo |
| Demo `opportunities.ts` | **Mantenimento UI**; **nessun seed/backfill** (M8.1 skippata) |
| PDS §8–§9 | **Deprecazione concettuale** come autorità; non backfill |
| `training_*` | **Mantenimento** fuori dominio |
| `business_sectors` | Riferimento condiviso opzionale (M6.3) |
| ManifestazioneDiInteresse (PDS) | Non creare; fuori piano |

Nessuna doppia scrittura DB richiesta oggi.

---

## 21. Compatibilità

| Area | Impatto | Transizione |
|---|---|---|
| Front-end demo | Continua su dati statici | Switch futuro verso modello persistente (fuori M1–M8) |
| Contenuti pubblicati | Nessuno in DB | Caricamento dati reali = processo editoriale futuro |
| API | Nessuna API Opportunità | Introduzione futura post-applicazione schema |
| Importazioni | Nessuna | Definire dopo M8 |
| Utenti registrati | Solo Persone/profiles | Riferimenti M6 quando pronti |
| Procedure editoriali | Da definire su assi M7 | Allineare redazione |
| Collaborazioni / Eventi | Nessun impatto schema | Non introdurre coupling |

Questo piano **non** modifica front-end o API.

---

## 22. Dipendenze e ordine di attivazione

```text
[Persone minima] ──┐
                   ├──► M6.1 (riferimenti soggetti)
[Imprese quando] ──┤
[Appartenenze] ────┼──► M6.2 (utilizzo rappresentanza)
[Professionisti] ──┼──► M6.3 (facoltativo)
[Mercati] ─────────┘
Identity & Access ────► scritture (trasversale)
M1 → M2 → M3 → M4 → M5 → M6* → M7 → M8
```

\* M6 può essere parziale: riferimenti Imprese/Professionisti/Mercati/Appartenenze attivabili quando i domini esistono, senza bloccare M1–M5–M7 sul nucleo scheda+fonte+beneficio+procedura dichiarativa.

Collaborazioni e Eventi: **nessuna attivazione outbound**.

---

## 23. Invarianti da preservare

1. Identità autonoma.  
2. Origine esplicita.  
3. Azionabilità (beneficio o accesso + destinatari + modalità + temporalità salvo eccezione).  
4. Candidatura non obbligatoria (e assente in questa fase).  
5. Assi di stato separati.  
6. Fonte ≠ Evidenza ≠ Promotore ≠ Pubblicatore.  
7. Beneficio ≠ erogazione.  
8. ModalitàAccesso (C05, M2) ≠ ProceduraAccesso (VO, M4.4) ≠ CandidaturaOpportunità.  
9. Link operativo di procedura ≠ URL di Fonte informativa.  
10. Temporalità di accesso (M5, VO finestre) ≠ pubblicazione/visibilità/ritiro/archiviazione (M7).  
11. Scadenza ≠ ritiro editoriale; chiusura ≠ archiviazione; proroga ≠ nuova edizione.  
12. Stato temporale derivato ≠ asse primario persistito.  
13. Nessuna ownership Collaborazioni.  
14. Nessuna dipendenza Eventi consolidata.  
15. Snapshot ≠ autorità.  
16. PF5 sui riferimenti.  
17. Storico non distrutto da ritiro/archiviazione; scadenze/proroghe non sovrascritte in silenzio (PF8).  
18. Un solo Aggregate Root; PC2 non chiuso dallo schema.  
19. Esterna/interna sullo stesso AR.

---

## 24. Strategia di test

### Test statici (completati in M8.2)
Inventario unit e file SQL; ordine timestamp; riconciliazione Physical↔SQL; grafo FK; assenza collisioni bloccanti; assenza seed demo; strutture di istanza vuote ammesse; compatibilità PostgreSQL 17.6.1; applicabilità statica della catena. Database locale **non** usato; migration **non** applicate; nessun `db reset` / `db push`.

### Test runtime — DEBITO OPERATIVO POST-CHIUSURA STATICA
Previsti **dopo** applicazione controllata delle migration (non parte della chiusura statica M8.2):

#### Strutturali
Esistenza strutture; obbligatorietà origine/tipologia/modalità (gate applicativi ove non SQL); ProceduraAccesso dichiarativa senza candidatura; finestre M5 senza fusione con pubblicazione; assenza strutture candidatura/valutazione/assegnazione; riferimenti opachi.

#### Invarianti
Checklist §23 su casi campione.

#### Lifecycle
Bozza → verifica → approvazione → pubblicazione → proroga → ritiro → chiusura → archiviazione; rifiuto editoriale senza delete.

#### Riconciliazione runtime
Assenza duplicati demo in DB; training_offers non importate; orfani; riferimenti non risolti.

#### Regressione
Persone/profiles; cataloghi condivisi; nessuna FK Collaborazioni/Eventi; training_* invariati.

---

## 25. Criteri di accettazione

### Accettazione statica (M8.2 — raggiunta)
- 17 migration SQL M1.1–M7.2 presenti; M8.1 skippata; M8.2 completata;
- nessuna unità SQL obbligatoria mancante; nessuna unità extra;
- nessuna collisione bloccante; nessun seed demo;
- strutture di istanza ammesse vuote; catena staticamente applicabile;
- perimetri rinviati rispettati; migration non applicate; SQL non eseguito.

### Accettazione runtime (post-applicazione — debito operativo)
- nessuna perdita di dati (N/A finché non ci sono istanze);
- ogni Opportunità ha identità e origine;
- nessuna dipendenza da candidatura; assi separati;
- Fonte distinguibile da Evidenza; riferimenti opachi;
- nessuna ownership Collaborazioni; nessun riferimento Eventi consolidato;
- D14–D18 rispettate; anomalie documentate;
- test strutturali/invarianti/lifecycle runtime;
- rollback definito o rischio accettato esplicitamente.

---

## 26. Strategia di rollback

| Condizione | Strategia |
|---|---|
| Unit non applicata | Non applicare / correggere piano |
| Unit applicata, zero dati | Compensazione in avanti o rimozione controllata delle sole strutture nuove |
| Unit applicata, dati presenti | Compensazione in avanti; **preservare** record; no drop distruttivo |
| Parziale (es. M3 senza M4) | Consentito; Opportunità resta non pubblicabile finché criteri M7 non soddisfatti |
| Emergenza | Disabilitare pubblicazione (asse); mantenere strutture; ripristino da backup ambiente |

Il rollback **non** implica cancellazione automatica dei dati creati.

---

## 27. Osservabilità

Indicatori concettuali (senza imporre tool):

- n. Opportunità create / pubblicabili / pubblicate / ritirate / archiviate;
- n. incomplete (manca Fonte, beneficio, modalità, …);
- fonti mancanti o non raggiungibili;
- errori di riferimento (Persona/Impresa assente);
- stati non ammessi / combinazioni incoerenti;
- duplicati seed;
- demo ancora unica fonte UI;
- verifiche superate / superate da aggiornamento;
- anomalie temporali (chiusura < apertura, ecc.).

---

## 28. Rischi e mitigazioni

| # | Rischio | Prob. | Impatto | Fase | Mitigazione | Stop |
|---|---|---|---|---|---|---|
| 1 | Modello da legacy/PDS | Media | Alto | Tutte | Ignorare PDS come autorità | Se si propone ManifestazioneDiInteresse obbligatoria |
| 2 | Migrazione monolitica | Media | Alto | Tutte | Unit separate M1–M8 | Push unico M1–M8 senza test |
| 3 | Perdita storico | Bassa | Alto | M5/M7 | Soft archive | Delete fisico di fatti |
| 4–5 | Fonte/Evidenza/Promotore confusi | Media | Alto | M3/M6 | Ruoli distinti | Unione strutture |
| 6 | Stato unico | Media | Alto | M1/M7 | Assi separati | Campo status onnicomprensivo |
| 7 | Candidatura prematura | Media | Alto | Qualsiasi | Rinvio esplicito §7 | Tabella candidatura “vuota” |
| 8 | Eventi anticipati | Media | Medio | M6 | DV11 | FK Eventi |
| 9 | Ownership Collaborazioni | Bassa | Alto | M6 | Solo D22 inbound futuro | Collezione owned |
| 10–11 | Organizzazioni/Servizi | Media | Alto | M4/M6 | Riferimento informativo | Nuovo dominio |
| 12 | Riferimenti non opachi | Media | Alto | M6 | PF5 | Copia attributi |
| 13 | Snapshot come autorità | Media | Alto | M6.2 | D17 | Snapshot decide accesso corrente |
| 14 | Motore regole | Bassa | Medio | M4 | Solo dichiarativo | Engine |
| 14b | ModalitàAccesso rifatta in M4 / confusa con Procedura | Media | Alto | M4.4 | M2 resta C05; M4.4 = solo VO Procedura | Secondo catalogo / tabelle candidatura |
| 14c | ProceduraAccesso = workflow pratica | Media | Alto | M4.4 | Solo testo/canale dichiarati | Stati domanda, upload, protocollo |
| 15 | Beneficio = erogazione | Media | Alto | M4 | Separazione | Campi pagamento |
| 16 | Edizione = proroga | Media | Medio | M5 | Criteri identità; proroga storicizzata | Nuova Opportunità per sola proroga |
| 16b | M5 = pubblicazione/ritiro/archiviazione | Media | Alto | M5/M7 | Confine §16/§18 | Colonne pubblicazione in M5 |
| 16c | Sovrascrittura scadenze | Media | Alto | M5 | PF8; storico proroghe | Update che cancella termine precedente |
| 16d | Stato temporale persistito come status unico | Media | Alto | M5/M7 | Derivato da date M5 | Campo status onnicomprensivo |
| 17–18 | Duplicati / backfill non ripetibile | Bassa | Medio | M8 | Dry run | — |
| 19 | Incompatibilità UI | Bassa | Basso | M8 | Demo parallela | — |
| 20 | Domini assenti | Alta | Medio | M6 | Riferimenti opzionali | Blocco totale M1 per Imprese assenti |
| 21 | Rollback distruttivo | Bassa | Alto | Tutte | Compensazione in avanti | Drop con dati |
| 22 | Pubblicazione incompleta | Media | Alto | M7 | Gate completezza | — |
| 23 | Authz tecniche anticipate | Media | Medio | M7 | Solo business permissions | RLS definitive nel piano |
| 24 | PC2 chiuso dallo schema | Media | Alto | Tutte | Un solo AR; no tabelle “future AR” | Split AR non motivato |

---

## 29. Punti di controllo e criteri di stop

| Checkpoint | Procedere se | Stop se |
|---|---|---|
| Post M1.2 | Identità + assi base OK | Stato unico o delete fisico |
| Post M4.3 | Benefici dichiarati OK; senza erogazione | Campi pagamento / beneficio applicato |
| Post M4.4 | ProceduraAccesso VO dichiarativa; ModalitàAccesso restata in M2 | Candidatura/pratica/upload; secondo catalogo modalità |
| Post M5.2 | Finestre VO 0..N; stato temporale derivato; no pubblicazione/ritiro in M5 | Colonne pubblicazione in M5; overwrite scadenze; Entity finestra |
| Post M6 | Solo dipendenze consolidate | FK Eventi/Collaborazioni outbound |
| Post M7.2 | Gate pubblicazione OK; scadenza ≠ ritiro; usa date M5 senza duplicarle | Badge verifica unico / assi fusi / finestre ricreate in M7 |
| Post M8.2 | Accettazione statica OK; M8.1 skippata; nessun seed demo | Seed demo persistito; collisioni DDL; unit obbligatorie mancanti |

---

## 30. Questioni aperte

### Chiusa
- **Seed da demo: sì/no** → **NO — M8.1 SKIPPATA** (vedi §19).

### Future (fuori chiusura statica M1–M8; non omissioni del piano)
- Applicazione controllata delle migration; test runtime; verifica RLS in ambiente.
- Policy RLS applicative; switch frontend verso database; caricamento dati reali.
- Obbligatorietà finestra/ProceduraAccesso al gate di pubblicabilità (applicativo).
- Intervalli di sospensione strutturati (oltre M5 Physical §28.14).
- Momento di introduzione CandidaturaOpportunità (PC2); piano dedicato candidature/assegnazioni.
- Quando attivare D17 in assenza di Appartenenze in DB.
- Titolare pubblicante Persona vs Impresa; deduplicazione edizioni.
- Bounded context Editoriali (D34); localizzazione; ricerca; notifiche; analytics; SEO.
- DV10 / DV11; convenzioni soft-delete allineate a Persone.

---

## 31. Deliverable

### Disponibili (chiusura statica)
1. Physical Mapping Opportunità M1–M7.  
2. **17 migration SQL** M1.1–M7.2 in `supabase/migrations/`.  
3. Review statiche M1–M7.2.  
4. Decisione **M8.1 skippata**.  
5. Rapporto **M8.2** — `opportunita-m8.2-validation-report.md`.  
6. Stato finale di questo Migration Plan (completato a livello statico).

### Non ancora eseguiti (debito operativo)
1. Applicazione controllata delle migration al database.  
2. Test runtime / integrazione.  
3. Verifica effettiva RLS in ambiente.  
4. Switch frontend da demo a sorgente persistente.  
5. Caricamento dati reali (processo editoriale).  
6. Eventuale piano dedicato candidatura/valutazione/assegnazione.  
7. Non: fondere M5 con pubblicazione/ritiro (M7); non Eventi/Collaborazioni outbound da questo dominio.

---

## 32. Checklist finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Deriva dal Physical Mapping | Sì |
| 2 | Dependency Map rispettata | Sì |
| 3 | Un solo Aggregate Root | Sì |
| 4–5 | PC2 / PCa1 aperti | Sì |
| 6–7 | Candidatura non obbligatoria e rinviata | Sì |
| 8–10 | Valutazione / Graduatoria / Assegnazione rinviate | Sì |
| 11–13 | Fonte/Evidenza/Promotore/Pubblicatore distinti | Sì |
| 14–16 | Assi; beneficio≠erogazione; storico | Sì |
| 17–20 | Additiva; verificabile; accettazione; rollback | Sì |
| 21–25 | D14–D18; D22; D27/DV10/DV11 non consolidate | Sì |
| 26–29 | PF5; Appartenenze; Mercati; Professionista non soggetto | Sì |
| 30–33 | No Organizzazioni/Servizi/ownership Collaborazioni/Eventi | Sì |
| 34–36 | No motore regole/matching/ranking | Sì |
| 37–39 | 17 SQL in repository; piano non applica DB | Sì |
| 39b | M4.4 ProceduraAccesso; ModalitàAccesso resta M2 | Sì |
| 39c | M5 Temporalità distinta da M7 pubblicazione/ritiro/archiviazione | Sì |
| 39d | M8.1 skippata; nessun seed demo | Sì |
| 39e | M8.2 completata (validazione statica) | Sì |
| 39f | Schema repository ≠ schema applicato al DB | Sì |
| 40 | Rilettura integrale post-chiusura statica | Sì |

---

## 33. Conclusione

**MIGRATION PLAN OPPORTUNITÀ COMPLETATO A LIVELLO STATICO.**

La sequenza greenfield additiva in otto fasi (**19 unit**: M1.1–M8.2) è chiusa: **17 migration SQL** M1.1–M7.2 presenti e revisionate; **M8.1 skippata** (nessun seed demo); **M8.2 completata** come validazione/riconciliazione statica. Nessuna unità SQL obbligatoria mancante; nessuna unità extra; nessuna collisione bloccante; strutture di istanza ammesse vuote; catena staticamente applicabile. Le migration **non** sono state applicate; i test runtime **non** sono stati eseguiti.

Candidatura, valutazione, graduatoria e assegnazione restano **rinviate**; PC2 e PCa1 restano aperti. Dipendenze ammesse: D14–D18, D49; D22 inbound; D27/DV10/DV11 non anticipate. La chiusura statica **non** implica deployment, produzione pronta, RLS applicativa, né frontend collegato al database.

---

*Fine del Migration Plan di Opportunità.*
