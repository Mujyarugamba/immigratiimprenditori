# Migration Plan — Dominio Opportunità

## Nota introduttiva di esclusione

Questo documento è un **piano di migrazione concettuale**. Non crea file `.sql`, non scrive SQL, non applica migrazioni, non modifica lo schema, non definisce colonne, tipi, indici, trigger, policy RLS, endpoint, DTO, repository o UI. Traduce il Physical Domain Mapping di Opportunità in una sequenza implementativa additiva, verificabile e reversibile quando possibile.

Fonti normative: Domain Thesis → Logical Data Model → Physical Domain Mapping → Dependency Map aggiornata. Lo schema esistente e le migrazioni già presenti sono vincoli di compatibilità, non autorità architetturale. Il PDS storico e i dati demo UI non prevalgono sul modello approvato.

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
15. [M4 — Destinatari, requisiti e benefici](#15-m4--destinatari-requisiti-e-benefici)
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
31. [Deliverable successivi](#31-deliverable-successivi)
32. [Checklist finale](#32-checklist-finale)
33. [Conclusione](#33-conclusione)

---

## 1. Scopo

Tradurre il Physical Domain Mapping di Opportunità in una sequenza di **migration unit** additive, incrementali e verificabili, compatibili con lo stato reale del repository e con le dipendenze consolidate (D14–D18, D22 unidirezionale, D49; D27/DV10/DV11 non consolidate).

Il piano stabilisce: cosa introdurre; ordine; prerequisiti; rinvii; controlli; rischi; criteri di accettazione; rollback logico; riconciliazione di eventuali strutture preesistenti. **Non** stabilisce SQL definitivo né crea migrazioni eseguibili.

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

### 4.1 Database e migrazioni

| Elemento | Stato rilevato |
|---|---|
| Tabelle / strutture dedicate a Opportunità | **Assenti** — nessuna migration crea entità di dominio Opportunità |
| `supabase/migrations/` | 21 file; Persone (profiles, languages, competencies, personal_stories), cataloghi formazione/lingue/settori, servizi linguistici |
| `business_sectors` | Catalogo condiviso; commento di riuso futuro anche da opportunità — **non** è struttura Opportunità |
| `training_*` | Offerte/richieste formative — **non** migrare come Opportunità (confine Servizi/Eventi/Formazione) |
| Schema Opportunità applicato | **Assente** |

### 4.2 Applicazione / contenuti

| Elemento | Stato | Classificazione |
|---|---|---|
| `src/data/home/opportunities.ts` | Demo statica (6 schede) | Contenuto dimostrativo — **non** persistenza |
| UI home `/opportunita` | Sezione e card demo | Presentazionale |
| PDS §8 Opportunità / §9 ManifestazioneDiInteresse | Specifica storica pre-tesi | **Da riconciliare concettualmente**, non da implementare come verità |
| Contenuti editoriali DB | Nessuna tabella contenuti/opportunità | Assente |

**Conclusione.** Prima implementazione = **greenfield additivo**. Nessun backfill da tabelle DB. Eventuale popolamento iniziale da demo/editoriale è facoltativo e non distruttivo.

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
- tipizzazione e modalità di accesso (elenchi controllati);
- benefici e requisiti dichiarati;
- destinatari/criteri dichiarati;
- Fonti ed Evidenze;
- temporalità e finestre;
- verifica di rappresentazione;
- pubblicazione, programmazione, ritiro, visibilità, archiviazione;
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

**Estensione futura ammissibile senza “tabelle vuote”:** mantenere solo `ModalitàAccesso` nel nucleo; nessuna struttura candidatura anticipata senza uso reale.

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

| Elemento | Classificazione | Azione |
|---|---|---|
| Tabelle DB Opportunità | Assente | Creare da zero (M1–M7) |
| Demo `opportunities.ts` | Riutilizzabile come seed editoriale opzionale | Backfill facoltativo M8; non fonte di verità |
| Tipi menu demo (Bandi, Finanziamenti, …) | Da riconciliare | Filtrare con nucleo H8; non gerarchia fisica |
| PDS Opportunità / ManifestazioneDiInteresse | Incompatibile come modello target | Non implementare; documentare divergenza |
| `training_offers` / richieste | Incompatibile come Opportunità | Mantenere fuori dominio; non migrare |
| `business_sectors` | Estendibile come catalogo condiviso | Riferimento facoltativo in M6 se utile; non ownership |
| Commenti migration “opportunities” | Informativi | Ignorare come schema |
| Contenuti editoriali usati come schede | Assenti in DB | Confine: scheda = Opportunità; narrazione = Editoriali (futuro) |

---

## 10. Strategia generale

```text
M1 nucleo → M2 classificazioni → M3 fonti/evidenze → M4 destinatari/requisiti/benefici
→ M5 temporalità → M6 riferimenti consolidati → M7 verifica/pubblicazione/visibilità
→ M8 riconciliazione/backfill/test
```

- **Greenfield** sulle strutture di dominio.
- **Nessuna doppia scrittura DB** necessaria oggi (nessun legacy persistente).
- Eventuale **doppia lettura** solo tra demo UI e nuove strutture durante transizione front-end (fuori da questo piano come implementazione).
- Ogni fase: coerente, verificabile, non distruttiva, senza cicli di dipendenza.

---

## 11. Sequenza delle migration unit

Nomi **descrittivi**; **nessun timestamp definitivo**.

| Unit | Dipende da | Applicabile separatamente? |
|---|---|---|
| **M1.1** create opportunity core | — | Sì |
| **M1.2** add opportunity lifecycle state axes (sostanziale + rappresentazione) | M1.1 | Sì dopo M1.1 |
| **M2.1** create opportunity controlled lists (origine, tipologia, modalità accesso) | M1.1 | Sì |
| **M2.2** attach classifications to opportunity | M1.1, M2.1 | Sì |
| **M3.1** create opportunity sources | M1.1 | Sì |
| **M3.2** create opportunity evidence | M1.1; M3.1 consigliata | Sì |
| **M4.1** create opportunity audience criteria | M1.1 | Sì |
| **M4.2** create opportunity requirements | M1.1 | Sì |
| **M4.3** create opportunity benefits | M1.1 | Sì |
| **M5.1** create opportunity time windows | M1.1 | Sì |
| **M5.2** add temporal milestones on opportunity | M1.1 | Sì |
| **M6.1** add consolidated domain references (Persone/Imprese) | M1.1; prerequisito Persone minimo | Condizionata |
| **M6.2** add optional Appartenenza utilization / snapshot hook | M6.1; Appartenenze se disponibile | Condizionata |
| **M6.3** add optional Professionisti / Mercati references | M1.1; domini se disponibili | Condizionata / saltabile |
| **M7.1** add verification model | M1.1; M3 consigliata | Sì |
| **M7.2** add editorial / publication / visibility axes | M1.1 | Sì |
| **M8.1** backfill optional demo/seed opportunities | M1–M7 minimi | Facoltativa |
| **M8.2** validate and reconcile | M8.1 o assenza seed | Sempre |

**Totale:** 18 migration unit descrittive (M1.1–M8.2).

**Stop points:** dopo M1.2 (scheda minima); dopo M4.3 (nucleo azionabile); dopo M7.2 (pubblicabile); dopo M8.2 (accettazione).

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
- ModalitàAccesso: elenco (candidatura, domanda, accesso diretto, procedura esterna, …) — **senza** entità Candidatura.
- Finalità / categorie essenziali come liste o testo strutturato.

### Regole
Non trasformare voci di menu demo in gerarchia fisica. Settori/territori non diventano sottotipi di Opportunità. Liste stabili ma estendibili; voci iniziali minime; resto rinviabile.

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

---

## 15. M4 — Destinatari, requisiti e benefici

### Destinatari
Criteri dichiarati / categorie (VO/liste), non elenco nominativo obbligatorio.

### Requisiti
E02 dichiarati/strutturati; riferimenti opachi a condizioni di altri domini (senza possesso). Nessun motore di regole.

### Benefici
VO 1..N; monetari e non; importi/limiti come dichiarati; **≠ erogazione**.

### Distinzioni memorizzate
Testo ufficiale / sintesi strutturata / classificazione / riferimento esterno. Non: contenuto editoriale narrativo; regola computabile; scoring.

### Completamento
≥1 beneficio o accesso; ≥1 criterio destinatario; requisiti minimi o dichiarazione esplicita di assenza requisiti strutturali (se ammissibile per tipologia).

---

## 16. M5 — Temporalità e finestre

### Fatti persistenti
Censimento; pubblicazione ufficiale (se nota); apertura; inizio/fine accesso; scadenza; proroghe; sospensione; riapertura; chiusura; revoca; annullamento; ritiro; archiviazione.

### Stati derivati
Futura / aperta / in scadenza / scaduta / prorogata — calcolati, non unico asse onnicomprensivo.

### Casi supportati
Senza scadenza; continuativa; finestre multiple; scadenze multiple; già scaduta al censimento; proroga ≠ nuova edizione; edizione autonoma = nuova identità.

### Storico
Modifiche a scadenze/proroghe storicizzate; non sovrascrittura silenziosa.

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

### Assi (separati)
Sostanziale; rappresentazione; editoriale (bozza/revisione/approvata/respinta); pubblicazione (non pubblicata/programmata/pubblicata/ritirata); visibilità (privata/redazionale/riservata/di rete/pubblica); verifica (non verificata/in verifica/verificata/non verificabile/superata); temporale derivato.

### Verifica
Assi multipli (esistenza, fonte, rappresentazione, scadenza, …); autore/ruolo; esito; momento; evidenza; invalidazione/superamento. Nessun badge unico.

### Pubblicazione
Prerequisiti minimi di completezza (origine, tipologia, modalità, beneficio/accesso, destinatario, ≥1 Fonte, assi coerenti). Business permissions: redazione/pubblicatore/verificatore — non RLS qui.

### Ritiro / archiviazione
Senza cancellazione; obsolescenza distinta da scadenza e da ritiro.

---

## 19. M8 — Riconciliazione, backfill e test

### Attività
- Confrontare assenza DB vs demo/PDS.
- Mapping legacy concettuale: demo → seed opzionale; PDS ManifestazioneDiInteresse → **non** migrare.
- Identificare falsi positivi (training_offers ≠ Opportunità).
- Dry run seed; report anomalie; conteggi; campionamento; verifica manuale.
- Criteri di accettazione §25; rollback logico §26.
- Deprecazione: lasciare demo UI finché front-end non legge il nuovo modello (attività successiva).

### Backfill
Progressivo, tracciabile, ripetibile, verificabile, non distruttivo. Se nessun seed: M8.1 skippata; M8.2 valida comunque strutture vuote coerenti.

---

## 20. Strategia per i dati legacy

| Sorgente | Strategia |
|---|---|
| Tabelle DB Opportunità | N/A — assenti |
| Demo `opportunities.ts` | Mantenimento UI + eventuale **copia/seed** controllato in M8.1 |
| PDS §8–§9 | **Deprecazione concettuale** come autorità; non backfill |
| `training_*` | **Mantenimento** fuori dominio |
| `business_sectors` | **Estensione d’uso** come riferimento condiviso opzionale |
| ManifestazioneDiInteresse (PDS) | **Rimozione futura** dal modello operativo; non creare |

Nessuna doppia scrittura DB richiesta oggi.

---

## 21. Compatibilità

| Area | Impatto | Transizione |
|---|---|---|
| Front-end demo | Continua a funzionare su dati statici | Switch successivo alla lettura del nuovo modello |
| Contenuti pubblicati | Nessuno in DB | Seed opzionale |
| API | Nessuna API Opportunità | Introduzione futura post-M7 |
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

\* M6 può essere parziale: riferimenti Imprese/Professionisti/Mercati/Appartenenze attivabili quando i domini esistono, senza bloccare M1–M5–M7 sul nucleo scheda+fonte+beneficio.

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
8. Nessuna ownership Collaborazioni.  
9. Nessuna dipendenza Eventi consolidata.  
10. Snapshot ≠ autorità.  
11. PF5 sui riferimenti.  
12. Storico non distrutto da ritiro/archiviazione.  
13. Un solo Aggregate Root; PC2 non chiuso dallo schema.  
14. Eterna/interna sullo stesso AR.

---

## 24. Strategia di test

### Strutturali
Esistenza strutture; obbligatorietà origine/tipologia/modalità; cardinalità Fonte 1..N; Beneficio 1..N; assenza strutture candidatura/valutazione/assegnazione; riferimenti opachi.

### Invarianti
Checklist §23 su casi campione (esterna con link; interna senza candidatura; senza scadenza; già scaduta; multi-fonte; fonte non raggiungibile).

### Lifecycle
Bozza → verifica → approvazione → pubblicazione → proroga → ritiro → chiusura → archiviazione; obsolescenza; rifiuto editoriale senza delete.

### Riconciliazione
Conteggi seed; duplicati demo; riferimenti non risolti; scadenze anomale; training_offers non importate; orfani.

### Regressione
Persone/profiles; cataloghi condivisi; nessuna FK verso Collaborazioni/Eventi; training_* invariati.

---

## 25. Criteri di accettazione

Per fase e globali:

- nessuna perdita di dati (N/A o seed tracciato);
- ogni Opportunità ha identità e origine;
- nessuna dipendenza da candidatura;
- assi separati;
- Fonte distinguibile da Evidenza;
- riferimenti esterni opachi;
- nessuna ownership Collaborazioni;
- nessun riferimento Eventi consolidato;
- D14–D18 rispettate (facoltative omesse se dominio assente);
- anomalie documentate;
- test strutturali/invarianti/lifecycle superati;
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
| 15 | Beneficio = erogazione | Media | Alto | M4 | Separazione | Campi pagamento |
| 16 | Edizione = proroga | Media | Medio | M5 | Criteri identità | — |
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
| Post M4.3 | Nucleo azionabile verificabile | Candidatura/erogazione introdotte |
| Post M6 | Solo dipendenze consolidate | FK Eventi/Collaborazioni outbound |
| Post M7.2 | Gate pubblicazione OK | Badge verifica unico / assi fusi |
| Post M8.2 | Anomalie documentate; test OK | Perdita dati; invarianti violate |

---

## 30. Questioni aperte

- Momento di introduzione CandidaturaOpportunità (PC2).
- Quando attivare D17 in assenza di Appartenenze in DB.
- Seed da demo: sì/no e ownership editoriale.
- Titolare pubblicante Persona vs Impresa (tesi aperta).
- Deduplicazione semantica edizioni.
- Integrazione futura Editoriali (D34).
- DV10 / DV11.
- Convenzioni soft-delete allineate a Persone.
- Ambiente di test locale assente (come in piano Persone).

---

## 31. Deliverable successivi

1. Migration SQL M1.1–M7.2 (file eseguibili, fuori da questo documento).  
2. Eventuale seed M8.1.  
3. Adattamento front-end da demo a lettura modello.  
4. Piano dedicato candidatura/valutazione/assegnazione se richiesto.  
5. Revisione Dependency Map solo se emergono nuove dipendenze consolidate.  
6. Non: implementare Eventi/Collaborazioni inverse da questo dominio.

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
| 37–39 | No SQL; no migration create; no altri file | Sì |
| 40 | Rilettura integrale | Sì |

---

## 33. Conclusione

Il Migration Plan di Opportunità definisce una sequenza **greenfield additiva** in otto fasi (18 unit descrittive), dal nucleo della rappresentazione governata fino a verifica/pubblicazione e riconciliazione. Candidatura, valutazione, graduatoria e assegnazione restano **rinviate**; PC2 e PCa1 restano aperti. Le uniche dipendenze ammesse sono quelle consolidate (D14–D18, D49); D22 resta unidirezionale inbound; D27/DV10/DV11 non vengono anticipate. Non esiste oggi schema DB di Opportunità da migrare: il rischio principale è modellare sul PDS storico o sui dati demo, non sulle tabelle assenti. Questo documento non crea SQL né migrazioni eseguibili.

---

*Fine del Migration Plan di Opportunità.*
