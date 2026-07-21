# Physical Domain Mapping — Dominio Opportunità

## Nota introduttiva di esclusione

Questo documento rappresenta il passaggio tra il modello logico del dominio Opportunità e la sua futura rappresentazione fisica. Non crea uno schema di database, non scrive SQL, non crea tabelle, non usa PostgreSQL o Supabase come riferimento progettuale, non indica tipi di dato, non parla di colonne, chiavi, indici, trigger, vincoli tecnici, RLS, API o codice, non descrive endpoint o implementazioni.

Le eventuali menzioni tecnologiche compaiono esclusivamente in questa nota e in §41–§43, per confermarne l'assenza altrove nel testo.

Il documento applica la Domain Thesis (`opportunita-domain-thesis.md`), il Logical Data Model revisionato (`logical/opportunita.md`), i Domain Patterns, la Dependency Map e i Physical Domain Mapping già approvati. Non ridefinisce il significato del dominio: lo traduce in decisioni concettuali di livello fisico.

---

## Indice

1. [Scopo e perimetro](#1-scopo-e-perimetro)
2. [Documenti normativi e fonti](#2-documenti-normativi-e-fonti)
3. [Definizione fisica del dominio](#3-definizione-fisica-del-dominio)
4. [Decisione sugli Aggregate Root](#4-decisione-sugli-aggregate-root)
5. [Motivazione della scelta dell'Aggregate](#5-motivazione-della-scelta-dellaggregate)
6. [Classificazione completa dei concetti](#6-classificazione-completa-dei-concetti)
7. [Aggregate Root Opportunità](#7-aggregate-root-opportunità)
8. [Identità dell'Opportunità](#8-identità-dellopportunità)
9. [Opportunità sostanziale e rappresentazione governata](#9-opportunità-sostanziale-e-rappresentazione-governata)
10. [Opportunità esterna e Opportunità interna](#10-opportunità-esterna-e-opportunità-interna)
11. [Origine dell'Opportunità](#11-origine-dellopportunità)
12. [Tipologia e classificazioni](#12-tipologia-e-classificazioni)
13. [Fonte](#13-fonte)
14. [Evidenza](#14-evidenza)
15. [Promotore, gestore, finanziatore, segnalatore e pubblicatore](#15-promotore-gestore-finanziatore-segnalatore-e-pubblicatore)
16. [Destinatari](#16-destinatari)
17. [Requisiti e criteri](#17-requisiti-e-criteri)
18. [Benefici](#18-benefici)
19. [Modalità e procedura di accesso](#19-modalità-e-procedura-di-accesso)
20. [CandidaturaOpportunità](#20-candidaturaopportunità)
21. [Valutazione e ammissibilità](#21-valutazione-e-ammissibilità)
22. [Graduatoria ed esiti](#22-graduatoria-ed-esiti)
23. [Assegnazione e beneficiario](#23-assegnazione-e-beneficiario)
24. [Verifica](#24-verifica)
25. [Contestazione e rettifica](#25-contestazione-e-rettifica)
26. [Pubblicazione e visibilità](#26-pubblicazione-e-visibilità)
27. [Assi di stato](#27-assi-di-stato)
28. [Temporalità](#28-temporalità)
29. [Cardinalità](#29-cardinalità)
30. [Ciclo di vita dell'Opportunità](#30-ciclo-di-vita-dellopportunità)
31. [Ciclo di vita della Candidatura](#31-ciclo-di-vita-della-candidatura)
32. [Business permissions](#32-business-permissions)
33. [Rappresentanza e snapshot storici](#33-rappresentanza-e-snapshot-storici)
34. [Domain Events](#34-domain-events)
35. [Invarianti](#35-invarianti)
36. [Dipendenze e autorità esterne](#36-dipendenze-e-autorità-esterne)
37. [Analisi dei cicli](#37-analisi-dei-cicli)
38. [Applicazione dei Domain Patterns](#38-applicazione-dei-domain-patterns)
39. [Transazioni concettuali](#39-transazioni-concettuali)
40. [Rischi architetturali](#40-rischi-architetturali)
41. [Questioni aperte](#41-questioni-aperte)
42. [Impatto potenziale sulla Dependency Map](#42-impatto-potenziale-sulla-dependency-map)
43. [Checklist finale di conformità](#43-checklist-finale-di-conformità)
44. [Conclusione](#44-conclusione)

---

## 1. Scopo e perimetro

**Obiettivo.** Tradurre in decisioni concettuali di Physical Domain Mapping le responsabilità, i fatti, i confini e i cicli di vita stabiliti dalla Domain Thesis e dal Logical Data Model di Opportunità (`01-principi-mapping.md` §2).

**Cosa NON è.** Non è riscrittura della tesi né del logico. Non è schema di database. Non introduce erogazioni, contratti, pagamenti, norme, procedure amministrative ufficiali o dominio Servizi/Organizzazioni.

**Cosa decide.** Aggregate Root; Entity; Value Object; elenchi controllati; riferimenti opachi; snapshot; evidence; identità; cardinalità; invarianti; assi di stato; temporalità; candidatura condizionata; eventi di dominio; dipendenze; impatti *proposti* (non applicati) sulla Dependency Map.

---

## 2. Documenti normativi e fonti

**Fonti normative (ordine di autorità):** Domain Thesis Opportunità → Logical `opportunita.md` revisionato → Domain Patterns → Dependency Map → Physical Mapping approvati (Persone, Imprese, Appartenenze, Mercati Internazionali, Professionisti, Collaborazioni) → Domain Model / Costituzione / PDS (contesto storico, non autorità di perimetro attuale).

**Letti integralmente:** costituzione; domain-model; platform-data-specification; domain-patterns; opportunita-domain-thesis; domain-dependency-map; logical di Persone, Imprese, Appartenenze, Mercati, Professionisti, Collaborazioni, Opportunità; physical mapping dei sei domini approvati; `01`–`04` e architecture-baseline.

**Non usati come autorità:** migrazioni, schema DB, codice, front-end, API, ORM, bozze non approvate.

---

## 3. Definizione fisica del dominio

Opportunità è dominio **Core autonomo**. Fatto fisico di piattaforma: **possibilità azionabile strutturata** — beneficio o accesso, condizioni, destinatari, periodo, azione di accesso possibile — come **rappresentazione governata**, più eventuale **processo interno** quando assunto.

**Possiede:** scheda/identità; origine; tipizzazione; ruoli di processo (riferimenti); requisiti; benefici dichiarati; modalità di accesso; finestre temporali; fonti; evidenze; verifiche di rappresentazione; pubblicazione/visibilità; eventuali CandidatureOpportunità (0..N); eventuali valutazioni/assegnazioni interne o registrate.

**Non possiede:** fatto istituzionale esterno; norma; domanda ufficiale fuori piattaforma; graduatoria ufficiale; aggiudicazione/contratto/pagamento/erogazione; Evento; Collaborazione; Contenuto Editoriale; Servizio; Profilo Professionale; Appartenenza; Mercato.

---

## 4. Decisione sugli Aggregate Root

### 4.1 Ipotesi confrontate

| Ipotesi | Contenuto |
|---|---|
| **A — Un solo Aggregate Root `Opportunità`** | Governa rappresentazione, origine, classificazione, destinatari, requisiti, benefici, modalità, temporalità, fonti, evidenze, verifica, pubblicazione, e — se presenti — candidature/valutazioni/assegnazioni come Entity dipendenti |
| **B — Due o più Aggregate Root** | Candidati: RappresentazioneOpportunità; CandidaturaOpportunità; ProceduraAccesso; Valutazione; Assegnazione; Fonte; Evidenza |

### 4.2 Procedura PC1 sui concetti critici

| Concetto | (a) già AR? | (b) referenziabilità esterna individuale? | (c) solo attributi? | (d) alternative? | (e) derivato? | Natura |
|---|---|---|---|---|---|---|
| Opportunità | Sì (tesi; logico §2) | Sì — D22, D27, D34 referenziano l'Opportunità | No | No | No | **A01** |
| RappresentazioneOpportunità | No | No — coincide con la scheda | — | — | — | **= A01** (non seconda identità) |
| Fonte | No | No oggi documentata | No | No | No | **E02** |
| Evidenza | No | No | No | No | No | **E02** / Evidence |
| Requisito | No | No | No | No | No | **E02** |
| Beneficio | No | No | Sì (composizione) | VO | No | **VO** |
| ModalitàAccesso | No | No | Sì (classificazione) | C05 | No | **Controlled List** |
| Verifica | No | No | No | No | No | **E02** |
| CandidaturaOpportunità | No | No oggi documentata | No | No | No | **E02** (condizionata; PC2 aperto) |
| Valutazione | No | No oggi documentata | No | No | No | **E02**/VO (condizionata; PC2 aperto) |
| Assegnazione | No | No oggi documentata | No | No | No | **E02** (condizionata; PC2 aperto) |
| Graduatoria | No | No | Parzialmente | Snapshot/Evidence | Parzialmente | **Snapshot/Evidence** o E02 interna (PC2 aperto) |
| Contestazione | No | No | — | — | — | **Open Candidate (PCa1)** |

### 4.3 Decisione

**Si conferma l'Ipotesi A: un solo Aggregate Root `Opportunità` (A01).**

PC2 resta **aperto** (§41): se in futuro `CandidaturaOpportunità`, `Valutazione`, `Assegnazione` o `Fonte` dimostrassero referenziabilità esterna individuale e consistenza indipendente, la promozione andrebbe motivata in una revisione di questo mapping, non introdotta qui per simmetria.

---

## 5. Motivazione della scelta dell'Aggregate

### 5.1 Argomenti a favore di A

| Criterio | Valutazione |
|---|---|
| Identità autonoma | Una sola identità di scheda di piattaforma; la “rappresentazione” non ha ciclo di vita separato dalla scheda |
| Ciclo di vita | Censimento→pubblicazione→apertura→chiusura è un unico percorso della scheda |
| Ownership | Un solo Single Owner (PF1) per il fatto di piattaforma |
| Invarianti | Nucleo azionabile e assi di stato appartengono alla stessa unità di consistenza |
| Cardinalità | Candidature 0..N; assenza di candidature non spezza l'AR |
| Transazioni | Censire, verificare, pubblicare, aggiornare scadenza sono operazioni sulla scheda |
| Volume | Candidature possono crescere, ma restano subordinate all'Opportunità (come in Collaborazioni E02) |
| Riuso da altri domini | Altri domini referenziano l'Opportunità (D22, D27, D34), non le candidature individuali (oggi) — PC1 (b) negativo per le E02 |
| Rischio AR enorme | Mitigato: processo interno/registrato è opzionale; Entity condizionate; PC2 aperto |
| Allineamento tesi/logico | Entrambi mantengono un solo AR; il Physical non li supera senza evidenza PC1 (b) positiva |

### 5.2 Argomenti a favore di B (non sufficienti oggi)

1. Volume potenziale di candidature — mitigato tenendo `CandidaturaOpportunità` come E02 con ciclo proprio.
2. Autonomia percepita di Fonte/Valutazione/Assegnazione — non supportata da referenziabilità esterna individuale documentata.
3. Distinzione esterna/interna — è variante di autorità sullo stesso A01, non due AR.

**Perché non B ora.** Separare Rappresentazione da Opportunità creerebbe due identità senza cicli di vita davvero autonomi (tesi §21; logico §3). Separare Candidatura come AR senza riferimenti inbound consolidati da altri mapping violerebbe il criterio “non più AR solo perché esistono più entità”.
---

## 6. Classificazione completa dei concetti

| Concetto | Classificazione | Note |
|---|---|---|
| Opportunità | **Aggregate Root** | A01; coincide con rappresentazione governata |
| RappresentazioneOpportunità | Concetto = AR (non seconda identità) | Distinzione concettuale vs sostanziale esterna |
| OrigineOpportunità | Value Object / Controlled List | esterna \| interna |
| TipologiaOpportunità | Controlled List | Multivalore ammesso; non gerarchia di sottotipo |
| Oggetto / Finalità | Value Object | Testo/struttura dichiarativa |
| Fonte | Entity (E02) | Pattern locale; ≠ promotore |
| Evidenza | Entity (E02) / Evidence | Supporto verifica |
| Promotore | Reference | Persona / Impresa / esterno informativo |
| EnteFinanziatore / EnteGestore | Reference | Opachi o informativi |
| Segnalatore / SoggettoCensitore | Reference | Ruoli di processo |
| Pubblicatore | Reference | ≠ promotore |
| Redazione | Business role (PL4 locale) | Non AR |
| Destinatario / CategoriaDestinatario | Value Object / Controlled List / criteri | Non elenco nominativo obbligatorio |
| Requisito | Entity (E02) | Dichiarato/strutturato/verificabile |
| CriterioAmmissibilità | Derived / composizione | Aggrega Requisiti |
| Beneficio | Value Object | Dichiarato; 1..N per Opportunità |
| ModalitàAccesso | Controlled List (+ VO composizione) | Non = Candidatura |
| ProceduraAccesso | Value Object descrittivo | Descrizione/link; non procedura ufficiale esterna |
| FinestraAccesso / PeriodoValidità | Value Object | Temporalità |
| TerritorioApplicazione / MercatoObiettivo | Reference | Territori / Mercati |
| Verifica / EsitoVerifica | Entity (E02) | Assi di verifica rappresentazione |
| Contestazione | Open Candidate (PCa1) | Non consolidata come processo pieno |
| CandidaturaOpportunità | Entity (E02) condizionata | 0..N; scenari B/C |
| CandidaturaEsternaRegistrata | Variante di CandidaturaOpportunità | Autorità dichiarativa |
| CandidaturaInterna | Variante di CandidaturaOpportunità | Autorità governata |
| Valutazione / Ammissibilità / EsitoValutazione | Entity (E02) o VO su candidatura | Solo interno o registrato |
| Graduatoria | Snapshot / Evidence (esterna) o E02 (interna) | PC2 aperto |
| Assegnazione / Beneficiario | Entity (E02) condizionata | ≠ erogazione |
| CollaborazioneDerivata | Reference inversa derivata | Non ownership; D22 |
| EventoCollegato | Reference | Facoltativo; D27 inbound |
| ContenutoEditorialeCollegato | Reference inversa / Editorial | Non ownership |
| ServizioProfessionaleCollegato | Reference | DV10 non consolidata |
| SnapshotRappresentanza | Snapshot | Da Appartenenze; non autorità corrente |
| Stati (sostanziale, rappresentazione, editoriale, pubblicazione, visibilità, verifica, temporale, candidatura) | Controlled List / proprietà assiali | Assi separati |
| Norma / procedura ufficiale / domanda esterna non registrata / erogazione / contratto / pagamento | **Excluded Concept** | — |
| CandidaturaCollaborazione / iscrizione Evento / richiesta Servizio | **Excluded Concept** (altri domini) | — |

---

## 7. Aggregate Root Opportunità

**Opportunità — unico Aggregate Root (A01).**

| Aspetto | Decisione |
|---|---|
| **Responsabilità** | Unità di consistenza della scheda di possibilità azionabile e del suo ciclo di vita di piattaforma |
| **Composizione** | Contiene E02: Fonte, Evidenza, Requisito, Verifica, eventuali CandidaturaOpportunità, Valutazione, Assegnazione; VO Beneficio, Finestra/Periodo, ProceduraAccesso; SnapshotRappresentanza; C05 locali |
| **Non contiene** | Identità Persona/Impresa; Appartenenza; Mercato; Evento; Collaborazione; articolo; Servizio |
| **Nascita** | Censimento/registrazione della scheda |
| **Fine logica** | Archiviazione (storico conservato; PF8) |

**Ampiezza dell'Aggregate.** L'AR è ampio ma non eccessivo: le E02 di processo sono opzionali (0..N); nessun altro dominio deve attraversare i loro dettagli interni. Concetti interni perché privi di autonomia oggi: Fonte, Evidenza, Requisito, Verifica. Concetti che *potrebbero* diventare AR in futuro (non oggi): CandidaturaOpportunità, Valutazione, Assegnazione, Fonte, Graduatoria (PC2, §41).

### 7.1 Entity dipendenti (E02)

| Entity (E02) | Responsabilità | Ciclo di vita proprio | Perché non AR |
|---|---|---|---|
| **Fonte** | Provenienza dell'informazione sulla scheda | Attiva → Sostituita / Non raggiungibile / Storica | Nessuna referenziabilità esterna individuale oggi; pattern locale PC11 |
| **Evidenza** | Riscontro a supporto di esistenza, scadenza, requisito, esito | Aggiunta → Superata / Contestata* | Dipende dalla scheda o dalla Verifica; non condivisa tra domini |
| **Requisito** | Condizione dichiarata/strutturata/verificabile | Dichiarato → Aggiornato / Superato | Non referenziato individualmente da altri domini |
| **Verifica** | Controllo su esistenza, fonte, rappresentazione, scadenze, ecc. | Avviata → Esito → Eventuale superamento | Locale alla scheda; assi PF10/PF11 |
| **CandidaturaOpportunità** | Registrazione (B) o processo governato (C) di accesso | Avviata → Presentata → … → Chiusura (variante C); stati dichiarati (B) | PC1 (b) negativo oggi; 0..N; PC2 aperto (§41) |
| **Valutazione** | Ammissibilità/valutazione su candidatura (interno o registrato) | Avviata → Esito | Subordinata a Candidatura/Opportunità; PC2 aperto |
| **Assegnazione** | Registrazione di beneficiario (interno o esterno registrato) | Registrata → Eventuale revoca | ≠ erogazione; nessuna referenziabilità inbound consolidata; PC2 aperto |

\*Contestata solo se PCa1 applicato.

---

## 8. Identità dell'Opportunità

Identità **interna stabile** autonoma rispetto a: URL fonte; codice bando; ID esterno; promotore; Evento; articolo; Collaborazione; procedura; finestra.

| Situazione | Trattamento |
|---|---|
| Aggiornamento stessi requisiti/scadenze | Stessa Opportunità; storicizzazione |
| Proroga | Stessa Opportunità; evento Prorogata |
| Nuova edizione sostanzialmente autonoma | Nuova Opportunità; riferimento facoltativo a programma comune |
| Nuova finestra sullo stesso programma | Valutare: stessa Opportunità con più finestre **oppure** nuova edizione — criterio: continuità di identità sostanziale dichiarata dalla fonte |
| Duplicati da fonti diverse | Questione aperta (deduplicazione semantica, non algoritmo tecnico) |
| Identificativi esterni multipli | VO/Reference su Fonte; non sostituiscono l'identità interna |

---

## 9. Opportunità sostanziale e rappresentazione governata

| Piano | Ownership | Ciclo |
|---|---|---|
| Sostanziale esterna | Autorità esterna | Istituzione/revoca ufficiale fuori dominio |
| Rappresentazione (= A01) | Opportunità | Censimento→…→archiviazione indipendente dalla sopravvivenza sostanziale |

**Decisione.** Non due identità fisiche. La distinzione è di **ownership e autorità**, non di doppio AR. La rappresentazione può nascere, restare bozza, essere verificata, pubblicata, aggiornata, diventare obsoleta, ritirata, archiviata anche se il fatto esterno continua o cessa.

---

## 10. Opportunità esterna e Opportunità interna

| Aspetto | Esterna | Interna |
|---|---|---|
| Autorità sostanziale | Esterna | Piattaforma / promotore interno |
| Entità comuni | A01, Fonte, Evidenza, Requisito, Beneficio, Modalità, Verifica, pubblicazione | Idem |
| Solo interna (tipiche) | — | CandidaturaInterna, Valutazione governata, Assegnazione governata |
| Registrazione esterna | CandidaturaEsternaRegistrata, esiti dichiarati, snapshot graduatoria | — |
| Invarianti | Non trasferire autorità istituzionale | Deve esistere soggetto responsabile interno |
| Eventi | Censimento, verifica scheda, pubblicazione | + candidatura/valutazione/assegnazione |

Stesso A01. PC2 aperto su eventuale futura separazione procedura/candidatura.

---

## 11. Origine dell'Opportunità

**VO/C05 — OrigineOpportunità:** `esterna` | `interna`.

Obbligatoria. Condiziona autorità su requisiti ufficiali, candidature e assegnazioni. Non coincide con “chi ha segnalato” né con “chi ha pubblicato”.

---

## 12. Tipologia e classificazioni

**C03/C05 — TipologiaOpportunità** (elenco controllato locale, multivalore ammesso): bando; incentivo; misura agevolativa; finanziamento agevolato; gara (accesso); formazione (accesso); partecipazione fiera; missione; premio; contributo; convenzione (solo adesione azionabile); accesso a servizi/spazi/reti; opportunità interna; altra azionabile.

**Non** gerarchia fisica di sottotipi con lifecycle diversi. **Non** voci di menu come sottotipi tecnici. Esclusi automatici: Evento puro; prodotto bancario commerciale; articolo; guida; convenzione non azionabile.

---

## 13. Fonte

**E02 — Fonte** (pattern locale PC11).

Attributi concettuali: tipologia (ufficiale, istituzionale, primaria, secondaria, documentale, pagina, comunicazione, segnalazione, atto); autorità; attendibilità; data consultazione; lingua; versione; stato (attiva, sostituita, non raggiungibile, contraddittoria, storica).

**Non** Aggregate autonomo oggi. **Non** coincide con promotore/finanziatore/gestore/pubblicatore/segnalatore. Cardinalità: Opportunità 1 → 1..N Fonti (almeno una; principale designabile).

---

## 14. Evidenza

**E02 — Evidenza** (Evidence object).

Supporta: esistenza, scadenza, beneficio, requisito, promotore, esito registrato, aggiornamento. Relazione a Fonte (provenance) distinta dall'Evidenza (riscontro). Non archiviazione file tecnica. Cardinalità: 0..N per Opportunità (e per Verifica/Candidatura quando pertinenti).

---

## 15. Promotore, gestore, finanziatore, segnalatore e pubblicatore

| Ruolo | Forma | Note |
|---|---|---|
| Promotore sostanziale | R02 Persona/Impresa o riferimento informativo esterno | Obbligatorio concettualmente (≥1) |
| Ente finanziatore / gestore / attuatore | R02 o informativo | Facoltativi; distinti |
| Segnalatore / censitore | R02 Persona | Facoltativo |
| Pubblicatore | R02 Persona (+ Appartenenza se per Impresa) | Facoltativo ma tipico per scritture |
| Redazione | Ruolo di business locale | Approva/pubblica |

Nessun dominio Organizzazioni. Soggetti non modellati = riferimento informativo esterno opaco (testo/identificatore esterno), senza scheda duplicata.

---

## 16. Destinatari

**Criteri dichiarativi** come VO/Controlled List compositi (categoria, settore, territorio, condizioni soggettive), non elenco nominativo obbligatorio.

| Concetto | Forma | Ownership |
|---|---|---|
| Destinatario dichiarato | Criterio VO | Opportunità |
| Eleggibile potenziale | Derivato/valutativo | Non possesso identità |
| Eleggibile verificato | Esito locale (interno) | Opportunità |
| Candidato | Reference su Candidatura | Opportunità (se candidatura esiste) |
| Assegnatario / Beneficiario | Reference su Assegnazione | Opportunità |

Professionista = qualificazione Persona via D16; mai soggetto terzo.

---

## 17. Requisiti e criteri

**E02 — Requisito** (1..N tipici; minimo concettuale: almeno condizioni minime del nucleo §3).

Piani: dichiarato | strutturato | verificabile | applicato a candidatura interna. Tipi: obbligatorio, preferenziale, esclusione, documentale, territoriale, settoriale, economico, dimensionale, temporale, soggettivo, di mercato, professionale (R02).

**Non** possiede fatti di Persone/Imprese/Professionisti/Appartenenze/Mercati: solo riferimenti come condizioni. Nessun motore regole tecnico.

---

## 18. Benefici

**VO — Beneficio** (1..N; almeno uno tra beneficio o accesso).

Tipi: economico, contributo, finanziamento agevolato, premio, agevolazione, accesso, partecipazione, formazione, supporto, spazio, visibilità, servizio (come beneficio dichiarato).

**Separazione:** Beneficio dichiarato ≠ Erogazione effettiva (esclusa). Quantitativo/qualitativo/condizionato/stimato ammessi come proprietà del VO.

---

## 19. Modalità e procedura di accesso

**C05 — ModalitàAccesso** (elenco): candidatura; domanda; adesione; iscrizione (≠ Evento); prenotazione; manifestazione interesse formale; accesso diretto; partecipazione libera; procedura esterna; procedura interna; invito; selezione.

**VO — ProceduraAccesso:** descrizione, link esterno, indicazioni; non incorpora procedura ufficiale.

| Modalità | Implica CandidaturaOpportunità? |
|---|---|
| Accesso diretto / partecipazione libera / solo link esterno | No (scenario A) |
| Candidatura/domanda con registrazione | Sì, scenario B o C |
| Iscrizione Evento | No — dominio Eventi |
| Manifestazione Collaborazioni | No — Collaborazioni |
| Richiesta Servizio | No — futuro Servizi / Professionisti |

---

## 20. CandidaturaOpportunità

### Decisione

**E02 dipendente di Opportunità**, cardinalità **0..N**, **non obbligatoria**, **non invariante**. Non Aggregate Root autonomo oggi (PC2 aperto).

### Tre scenari

| Scenario | Entità | Autorità |
|---|---|---|
| A — esterna non registrata | Nessuna | Solo ModalitàAccesso + link |
| B — esterna registrata | CandidaturaOpportunità (autorità dichiarativa) | Dichiarazione utente; non procedura ufficiale |
| C — interna | CandidaturaOpportunità (autorità governata) | Invio, ritiro, integrazione, ammissibilità, valutazione, esito |

Scenari B e C condividono l'Entity con discriminante di autorità; non due AR.

### Distinzioni

≠ CandidaturaCollaborazione; ≠ ManifestazioneInteresse/Invito/Abbinamento; ≠ iscrizione Evento; ≠ richiesta Servizio; ≠ prenotazione generica; ≠ salvataggio/preferenza/interesse; ≠ domanda ufficiale non registrata.

---

## 21. Valutazione e ammissibilità

| Concetto | Forma | Quando |
|---|---|---|
| Compatibilità presunta | Derived Fact | Sempre possibile come segnale |
| Ammissibilità | Esito su candidatura (VO/E02) | Interno o registrato |
| Valutazione | E02 su candidatura o VO | Interno; o registrazione esito esterno |
| Separazioni | Verifica rappresentazione ≠ verifica requisiti ≠ ammissibilità ≠ valutazione ≠ decisione ≠ assegnazione | Obbligatorie |

Non obbligatoria. Non appropria valutazione ufficiale esterna.

---

## 22. Graduatoria ed esiti

- **Esterna ufficiale:** non posseduta; eventuale **Snapshot/Evidence** di registrazione dichiarativa.
- **Interna:** E02 opzionale del processo; PC2 aperto se diventa AR autonomo.
- Esito candidatura: VO/stato su CandidaturaOpportunità.

---

## 23. Assegnazione e beneficiario

**E02 — Assegnazione** (0..N), condizionata.

Può essere interna o registrazione di fatto esterno. Reference a Persona/Impresa beneficiaria. **≠** erogazione, contratto, pagamento, esecuzione, Collaborazione.

Assegnazione → 0..N Collaborazioni possibili; Opportunità **non** possiede Collaborazioni (solo aggregazione inversa non autorevole). Evento `AssegnazioneRegistrata` non crea Appartenenza né Collaborazione automatica.

---

## 24. Verifica

**E02 — Verifica** (assi indipendenti PF10/PF11): esistenza; fonte; rappresentazione; aggiornamento; scadenza; beneficio; requisiti dichiarati; editoriale; ammissibilità candidatura; esito registrato.

Ogni verifica: autore (ruolo), oggetto, esito, momento, evidenza, validità, eventuale superamento. Non audit log tecnico. Non badge unico “verificata”.

---

## 25. Contestazione e rettifica

**PCa1 — candidato, non consolidato.** Contestazione può riguardare fonte, scadenza, requisito, beneficio, promotore, rappresentazione, valutazione, esclusione, assegnazione. Distinta da rettifica, aggiornamento, ricorso amministrativo esterno, rifiuto, sospensione, revoca.

Nel primo mapping: stato `Contestata` sull'asse verifica + eventuale E02 minima se necessario; processo pieno rinviato.

---

## 26. Pubblicazione e visibilità

Proprietà/assi dell'AR (non Entity separate obbligatorie):

| Concetto | Forma |
|---|---|
| Completezza rappresentazione | Derivato/flag assiale |
| Approvazione editoriale | Asse editoriale |
| Programmazione / Pubblicazione / Ritiro | Asse pubblicazione + Domain Events |
| Visibilità | Controlled List: privata, redazionale, riservata, di rete, pubblica |

Business permissions cambiano pubblicazione/visibilità; permessi tecnici = Identità & Accessi (PF13).

---

## 27. Assi di stato

| Asse | Esempi valori | Autorità |
|---|---|---|
| Sostanziale | annunciata, aperta, sospesa, chiusa, revocata, annullata, esaurita | Dominio / fonte |
| Rappresentazione | censita, incompleta, aggiornata, obsoleta, ritirata, archiviata | Dominio |
| Editoriale | bozza, in revisione, approvata, respinta | Redazione |
| Pubblicazione | non pubblicata, programmata, pubblicata, ritirata | Pubblicatore/redazione |
| Visibilità | privata, redazionale, riservata, di rete, pubblica | Dominio |
| Verifica | non verificata, in verifica, verificata, non verificabile, contestata* | Verificatore |
| Temporale (derivato) | futura, aperta, in scadenza, scaduta, prorogata | Derivato da date |
| Candidatura | solo se E02 presente | Processo B/C |

\*contestata solo se PCa1 applicato. Nessun stato unico onnicomprensivo (PF7).

---

## 28. Temporalità

| Momento | Natura |
|---|---|
| Istituzione esterna / pubblicazione ufficiale | Fatto esterno (registrabile) |
| Censimento, ultima verifica, pubblicazione piattaforma | Fatti interni |
| Apertura, inizio/fine candidatura, scadenza, proroga, sospensione, riapertura, chiusura, revoca, annullamento | Misti |
| Assegnazione, ritiro editoriale, archiviazione | Interni / registrati |

Ammessi: finestre multiple; scadenze multiple; proroghe; riaperture; senza scadenza; continuative; edizioni ricorrenti (nuova Opportunità o stesso programma referenziato). Storico non sovrascritto (PF8).

---

## 29. Cardinalità

| Relazione | Cardinalità | Ownership | Note |
|---|---|---|---|
| Opportunità → Origine | 1 | AR | Obbligatoria |
| Opportunità → Tipologia | 1..N | AR | Almeno una |
| Opportunità → Fonte | 1..N | E02 | ≥1 |
| Opportunità → Evidenza | 0..N | E02 | — |
| Opportunità → Promotore | 1..N | R02 | ≥1 |
| Opportunità → EnteGestore/Finanziatore | 0..N | R02 | — |
| Opportunità → Pubblicatore | 0..1 (tipico) | R02 | — |
| Opportunità → Destinatario (criteri) | 1..N | VO | ≥1 criterio |
| Opportunità → Requisito | 0..N (tipico 1..N) | E02 | Nucleo richiede condizioni |
| Opportunità → Beneficio | 1..N | VO | ≥1 beneficio o accesso |
| Opportunità → ModalitàAccesso | 1..N | C05 | ≥1 |
| Opportunità → FinestraAccesso | 0..N | VO | — |
| Opportunità → Territorio / Mercato | 0..N | R02 | D18 |
| Opportunità → Verifica | 0..N | E02 | — |
| Opportunità → CandidaturaOpportunità | **0..N** | E02 | Mai 1..N obbligatorio |
| Opportunità → Valutazione | 0..N | E02/VO | Condizionata |
| Opportunità → Assegnazione | 0..N | E02 | Condizionata |
| Opportunità → Evento | 0..N | R02 | Facoltativo |
| Opportunità → Contenuto Editoriale | 0..N | Inversa | Non ownership |
| Opportunità → Collaborazione | 0..N | Inversa derivata | D22 inverso aggregativo |
| Opportunità → ServizioProfessionale | 0..N | R02 | DV10 aperta |

---

## 30. Ciclo di vita dell'Opportunità

Percorso principale (non unico asse): censimento → completamento → verifica → revisione editoriale → approvazione → pubblicazione → apertura → aggiornamento/proroga/sospensione → chiusura/revoca → ritiro → archiviazione.

**Percorsi alternativi ammessi:** mai pubblicata; respinta editorialmente; ritirata prima dell'apertura; esterna già scaduta al censimento; senza candidatura; senza selezione; chiusa senza assegnazione; riaperta; duplicata (gestione aperta); obsoleta; fonte non disponibile (non cancellazione automatica).

---

## 31. Ciclo di vita della Candidatura

Solo se E02 presente:

| Autorità | Percorso |
|---|---|
| Interna (C) | avvio → bozza → presentazione → integrazione → ritiro \| ammissione/esclusione → valutazione → approvazione/respinta → eventuale assegnazione → chiusura |
| Registrata (B) | stati **dichiarati** (presentata, ritirata, esito dichiarato); non lifecycle governato pieno |
| Esterna A | nessun lifecycle |

Stato dichiarato ≠ stato governato ≠ stato verificato.

---

## 32. Business permissions

Ruoli di business locali (PL4, ≠ privilegi tecnici PF14):

| Azione | Ruoli tipici |
|---|---|
| Censire / segnalare | Segnalatore, redazione, censitore |
| Completare / modificare scheda | Pubblicatore, redazione, promotore interno |
| Verificare | Verificatore |
| Approvare / pubblicare / ritirare / archiviare | Redazione, amministratore dominio |
| Registrare candidatura esterna | Candidato dichiarante, redazione |
| Presentare/ritirare candidatura interna | Candidato (Persona; Impresa via rappresentanza) |
| Valutare / assegnare | Valutatore, promotore interno, amministratore |
| Contestare | Soggetti legittimati (se PCa1) |

Account/sessioni/permessi tecnici → Identità & Accessi (D49).

---

## 33. Rappresentanza e snapshot storici

Appartenenze autorevole su Persona–Impresa (D17, utilizzo). Opportunità può conservare **SnapshotRappresentanza** minimo per candidatura, presentazione, valutazione, assegnazione, contestazione, audit storico concettuale. Snapshot ≠ autorità corrente; non crea Appartenenza.

---

## 34. Domain Events

**Proprietari Opportunità (AR):** OpportunitàCensita; Completata; OrigineRegistrata; FonteAggiunta/Sostituita; EvidenzaAggiunta; Verificata; VerificaSuperata; Approvata/RespintaEditorialmente; Pubblicata; PubblicazioneProgrammata/Ritirata; Aperta; ScadenzaRegistrata/Prorogata; Sospesa; Riaperta; Chiusa; Revocata; Annullata; DichiarataObsoleta; Archiviata.

**Condizionati candidatura:** CandidaturaOpportunitàAvviata/Presentata/Ritirata/Integrata/Ammessa/Esclusa/Valutata; EsitoCandidaturaRegistrato.

**Condizionati assegnazione:** AssegnazioneRegistrata/Revocata; BeneficiarioRegistrato.

**Altri domini (non emessi qui):** CollaborazioneCreataDaOpportunità (Collaborazioni); EventoPubblicato; IscrizioneEventoRegistrata; ContenutoEditorialePubblicato; AppartenenzaVerificata; ProfiloProfessionaleVerificato.

Ogni evento: fatto avvenuto (PF15); senza payload tecnico; variante esterna/interna dichiarata dove rilevante.

---

## 35. Invarianti

1. Identità autonoma interna.  
2. Azionabilità (nucleo H8).  
3. ≥1 beneficio o accesso.  
4. Destinatari o criteri di destinatario.  
5. ≥1 modalità di accesso.  
6. Periodo o condizione temporale (salvo eccezione motivata, es. continuativa).  
7. Origine esplicita.  
8. Esterna ≠ trasferimento autorità istituzionale.  
9. Interna ⇒ soggetto responsabile.  
10–11. Fonte ≠ promotore; promotore ≠ pubblicatore.  
12–14. Destinatario ≠ candidato ≠ beneficiario; beneficio ≠ erogazione.  
15–19. Pubblicazione ≠ apertura ≠ verifica; visibilità ≠ pubblicazione; scadenza ≠ ritiro; chiusura ≠ archiviazione.  
20–26. Esistenza/chiusura senza candidature; candidatura non obbligatoria; 0..N; esterna non posseduta automaticamente; registrata con autorità limitata; interna governata.  
27–30. Distinzioni da CandidaturaCollaborazione, iscrizione Evento, richiesta Servizio, interesse.  
31–37. Valutazione/assegnazione/graduatoria non obbligatorie; esterna non appropriata; assegnazione ≠ erogazione/contratto/Collaborazione.  
38–41. ≠ Evento, Collaborazione, Editoriale, Servizio; prodotto finanziario commerciale non automatico.  
42–45. Professionista non soggetto; Appartenenze/Mercati autorevoli; snapshot non autorità.  
46–50. Collaborazioni derivate non owned; assi separati; storico; no duplica verifiche altrui; no processo esterno→interno implicito.  
51–56. Fonte irraggiungibile ≠ cancellazione; aggiornamento scheda ≠ modifica fatto esterno; proroga ≠ nuova Opportunità; edizione autonoma ≠ sola proroga; pubblicazione ≠ autorità istituzionale; aggregazioni inverse ≠ ownership.

---

## 36. Dipendenze e autorità esterne

| ID | Direzione | Classificazione | Maturità Map | Applicazione |
|---|---|---|---|---|
| D14 | → Persone | Necessaria | Consolidata | Promotore/candidato/beneficiario |
| D15 | → Imprese | Necessaria | Consolidata | Idem |
| D16 | → Professionisti | Facoltativa | Consolidata | Requisiti/destinatari qualificati |
| D17 | → Appartenenze | Necessaria quando applicabile | Provvisoria | Titolo rappresentanza (utilizzo) |
| D18 | → Mercati | Facoltativa | Provvisoria | Contesto |
| D22 | Collaborazioni → Opportunità | Facoltativa storica | Consolidata | Solo inbound storico |
| D27 | Eventi → Opportunità | Facoltativa | Provvisoria | Presentazione |
| D49 | → Identità & Accessi | Di supporto | Consolidata | Scritture |
| DV10 | Professionisti →? | Osservazione | Aperta | Non consolidata |
| DV9 | Collaborazioni → Eventi | — | Tangenziale | — |
| V8 | Vietata | — | Consolidata | No ownership soggetti |

PF5 su tutti i R02. Nessuna Opportunità → Collaborazioni di ownership.

---

## 37. Analisi dei cicli

| Coppia | Esito |
|---|---|
| Opportunità ↔ Collaborazioni | **Eliminato** — solo D22; aggregazione inversa non ownership |
| Opportunità ↔ Eventi | **Apparente** — D27 + eventuale R02 Opportunità→Evento (navigazione); oggetti distinti |
| Opportunità ↔ Professionisti | **Eliminato** — solo D16; DV10 non introduce ciclo |
| Opportunità ↔ Editoriali | **Eliminato** — D34 inbound editoriale |
| Opportunità ↔ Appartenenze | **Eliminato** — utilizzo D17 |
| Opportunità ↔ Mercati | **Eliminato** — D18 facoltativa |
| Opportunità ↔ Persone/Imprese | **Eliminato** — R02 identità; V8 |

---

## 38. Applicazione dei Domain Patterns

| Pattern | Esito | Note |
|---|---|---|
| PF1–PF3 | Applicabili | — |
| PF4 | **Non principale** | Eventuale su candidatura/assegnazione come legami di processo, non sul dominio intero |
| PF5 | Applicabile | R02 opachi |
| PF6–PF9 | Applicabili | — |
| PF10–PF11 | Applicabili | No badge unico |
| PF12–PF14 | Applicabili | — |
| PF15–PF18 | Applicabili | — |
| PF19–PF20 | Applicabili / per analogia | — |
| PL4 | Applicabile | Ruoli locali di business |
| PC1 | Applicato | §4.2 |
| PC2 | **Candidato / rinviato** | Un solo AR oggi; apertura futura §41 |
| PCa1 | **Candidato**, non consolidato | §25; non forzata |
| Fonte/Evidenza/Snapshot/Pubblicazione/Verifica/Temporalità | Applicabili | Pattern locali |

---

## 39. Transazioni concettuali

| Transazione | Aggregate | Note |
|---|---|---|
| Censire | Opportunità | Crea A01 + Fonte minima |
| Aggiungere Fonte / Evidenza | Opportunità | E02 |
| Completare / verificare / approvare / pubblicare | Opportunità | Assi editoriale/verifica/pubblicazione |
| Modificare scadenza / proroga / ritiro / obsolescenza / archiviare | Opportunità | Storico |
| Registrare candidatura esterna | Opportunità + E02 Candidatura | Autorità dichiarativa |
| Avviare/presentare candidatura interna | Opportunità + E02 | Autorità governata |
| Valutare / assegnare | Opportunità (+ Candidatura) | Solo B/C |
| Consistenza | Locale all'AR | Nessuna TX DB |

---

## 40. Rischi architetturali

| # | Rischio | Decisione / mitigazione |
|---|---|---|
| 1 | AR enorme | Entity condizionate; PC2 aperto |
| 2–5 | Fonte/Evidenza/Promotore/Pubblicatore confusi | Ruoli e E02 distinti |
| 6–7 | Appropriazione istituzionale/procedura | Origine esterna; esclusi |
| 8–9 | Candidatura obbligatoria/generica | 0..N; scenari; distinzioni |
| 10–12 | Valutazione/graduatoria/assegnazione improprie | Snapshot/registrazione; ≠ erogazione |
| 13–19 | Duplicazioni Eventi/Collab/Editoriali/Servizi/Professionista/Appartenenze/Mercati | Confini + R02 |
| 20–21 | Stato unico / perdita storico | Assi PF7; PF8 |
| 22–23 | Tipologie/menu rigidi | C05 filtrato |
| 24–27 | Dipendenze/cicli | D22/D27/D16 governati |
| 28–29 | PC2 prematuro/ignorato | Esplicitamente aperto |
| 30–35 | Contestazione/snapshot/dedup/verifica/origine/riapertura | PCa1 candidato; regole §8–§11 |

---

## 41. Questioni aperte

1. Eventuale promozione futura a più Aggregate Root (**PC2**): CandidaturaOpportunità, Valutazione, Assegnazione, Fonte, Graduatoria — riconosciuta esplicitamente, non decisa qui.
2. Procedure interne future e autonomia della procedura di accesso.
3. Edizioni, versionamento, deduplicazione semantica, riaperture vs nuova edizione.
4. Contestazione e rettifica (**PCa1**) come processo pieno.
5. Anonimizzazione; opportunità riservate; titolare pubblicante.
6. Soggetti non modellati; futuro dominio Organizzazioni; futuro dominio Servizi.
7. Confine con Eventi e eventuale censimento Opportunità → Eventi nella Dependency Map.
8. DV9; DV10.
9. Formazione, gare, convenzioni, missioni; prodotti finanziari commerciali.
10. Benefici multipli strutturali; requisiti computabili; matching; raccomandazioni.
11. Erogazioni e contratti successivi; Collaborazioni derivate come UX aggregativa.

---

## 42. Impatto potenziale sulla Dependency Map

**Non si modifica** `domain-dependency-map.md`. Si propongono:

| Voce | Impatto proposto | Motivazione |
|---|---|---|
| **D17** | Da Provvisoria a **Consolidata** (quando applicabile) | Utilizzo titolo di rappresentanza per candidatura/pubblicazione (§33); questo mapping fornisce la motivazione |
| **D18** | Da Provvisoria a **Consolidata** (facoltativa) | Mercato/territorio come contesto (§16, §29) |
| **Opportunità → Eventi** | Da censire come Facoltativa, se stabilizzata | Oggi solo D27 inbound + R02 navigabile (§36); non consolidata qui |
| **DV10** | Mantenere **aperta** | Nessuna Professionisti → Opportunità consolidata |
| **Opportunità → Collaborazioni** | Non introdurre ownership | Solo aggregazione inversa; D22 resta unidirezionale |
| Ciclo Opportunità ↔ Collaborazioni | Conferma **Eliminato** | §37 |

---

## 43. Checklist finale di conformità

| # | Verifica | Esito |
|---|---|---|
| 1–5 | Core, H8, rappresentazione, esterna/interna, AR motivato | Sì |
| 6–12 | Classificazione, Fonte/Evidenza, ruoli, destinatario/candidato, beneficio/erogazione, modalità≠candidatura | Sì |
| 13–18 | Candidatura 0..N, tre scenari, distinzioni | Sì |
| 19–26 | Valutazione/graduatoria/assegnazione; ≠ Evento/Collab/Editoriale/Servizio; Professionista; Appartenenze; Mercati | Sì |
| 27–37 | Assi, lifecycle, temporalità, pubblicaz./verifica/apertura/visibilità/scadenza/chiusura, storico | Sì |
| 38–42 | PF4/PF5/PC2/PCa1, dipendenze, cicli | Sì |
| 43–47 | Aggregazioni inverse, no Organizzazioni/Servizi | Sì |
| 48–50 | No implementazione; solo questo file; rilettura | Sì |

---

## 44. Conclusione

Il Physical Domain Mapping di Opportunità adotta **un solo Aggregate Root `Opportunità`**, coincidente con la **rappresentazione governata** della possibilità azionabile strutturata. Fonte, Evidenza e Requisito sono Entity dipendenti; Beneficio e finestre sono Value Object; ModalitàAccesso è elenco controllato. **CandidaturaOpportunità** è Entity dipendente **opzionale (0..N)** con tre scenari di autorità; valutazione e assegnazione sono condizionate. PF4 non è il pattern principale; PF5 governa i riferimenti; **PC2 e PCa1 restano aperti**. Nessun dettaglio di database o API è introdotto. Gli impatti sulla Dependency Map sono proposti, non applicati.

---

*Fine del Physical Domain Mapping di Opportunità.*
