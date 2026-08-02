# Mapping fisico — Dominio PROFESSIONISTI

> Livello architetturale. Physical Domain Mapping del dominio Professionisti: il passaggio tra la Tesi architetturale del dominio, il modello logico e la sua futura rappresentazione fisica. I §1–§28 restano concettuali (nessun SQL eseguibile). Il **§29** definisce il contratto DDL-ready del ciclo 1 (nomi tabella/colonne, vincoli, RLS, privilegi) necessario al Migration Plan; non contiene SQL eseguibile, non crea migration e non modifica il database.
> Fondamenti (non modificati da questo documento): [`docs/costituzione-piattaforma.md`](../../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../../domain-model.md), [`docs/platform-data-specification.md`](../../../platform-data-specification.md), [`docs/architecture/fundamental/domain-patterns.md`](../../fundamental/domain-patterns.md), [`docs/architecture/fundamental/professionisti-domain-thesis.md`](../../fundamental/professionisti-domain-thesis.md), [`docs/architecture/logical/professionisti.md`](../../logical/professionisti.md), [`docs/architecture/logical/persone.md`](../../logical/persone.md), [`docs/architecture/logical/imprese.md`](../../logical/imprese.md), [`docs/architecture/logical/appartenenze.md`](../../logical/appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](../../logical/mercati-internazionali.md), [`docs/architecture/physical/domain-dependency-map.md`](../domain-dependency-map.md), [`docs/architecture/physical/domain-mapping/persone.md`](./persone.md), [`docs/architecture/physical/domain-mapping/imprese.md`](./imprese.md), [`docs/architecture/physical/domain-mapping/appartenenze.md`](./appartenenze.md), [`docs/architecture/physical/domain-mapping/mercati-internazionali.md`](./mercati-internazionali.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: costituzione → domain model → platform data specification → modello logico (`logical/professionisti.md`) → tesi architetturale (`professionisti-domain-thesis.md`) → pattern fondazionali (`domain-patterns.md`) → Dependency Map → **mapping fisico del dominio Professionisti (questo documento)** → piano di migrazione → migrazioni. Il significato del dominio è già stato deciso, in modo indipendente e argomentato, dalla Tesi (`professionisti-domain-thesis.md`, §16): questo documento non lo ridiscute, lo traduce in decisioni concettuali di livello fisico.

---

## Indice

1. [Scopo](#1-scopo)
2. [Documenti letti](#2-documenti-letti)
3. [Tesi del dominio](#3-tesi-del-dominio)
4. [Responsabilità](#4-responsabilità)
5. [Confini](#5-confini)
6. [Fatti proprietari](#6-fatti-proprietari)
7. [Fatti esclusi](#7-fatti-esclusi)
8. [Aggregate](#8-aggregate)
9. [Aggregate Root](#9-aggregate-root)
10. [Entity](#10-entity)
11. [Value Object](#11-value-object)
12. [Elenchi controllati](#12-elenchi-controllati)
13. [Riferimenti esterni](#13-riferimenti-esterni)
14. [Stati](#14-stati)
15. [Temporalità](#15-temporalità)
16. [Verifiche](#16-verifiche)
17. [Visibilità](#17-visibilità)
18. [Pubblicazione](#18-pubblicazione)
19. [Contatti professionali](#19-contatti-professionali)
20. [Eventi di dominio](#20-eventi-di-dominio)
21. [Dipendenze](#21-dipendenze)
22. [Invarianti](#22-invarianti)
23. [Pattern applicati](#23-pattern-applicati)
24. [Pattern non applicabili](#24-pattern-non-applicabili)
25. [Questioni aperte](#25-questioni-aperte)
26. [Impatti sulla Dependency Map](#26-impatti-sulla-dependency-map)
27. [Checklist finale](#27-checklist-finale)
28. [Riepilogo conclusivo](#28-riepilogo-conclusivo)
29. [Contratto fisico DDL-ready — ciclo 1](#29-contratto-fisico-ddl-ready--ciclo-1)

---

## 1. Scopo

**Cosa deve fare questo documento.** Realizzare il Physical Domain Mapping del dominio Professionisti, traducendo in decisioni concettuali di livello fisico — quali concetti richiedono una rappresentazione persistente autonoma, quale natura ha ciascuno (Aggregate Root, Entity, Value Object, Elenco controllato, riferimento esterno, derivazione), quali stati, quali verifiche, quali dipendenze — un significato di dominio che è già stato stabilito e non è oggetto di revisione in questa sede: quello dimostrato da `professionisti-domain-thesis.md` (di seguito "la Tesi") e formalizzato da `logical/professionisti.md` (di seguito "il logico").

**Cosa NON fa questo documento.**
- Non ridefinisce il significato del dominio: la domanda "cosa rappresenta Professionisti" è stata chiusa dalla Tesi (§16, decisione architetturale finale) con un metodo comparativo indipendente; questo documento la eredita come vincolante.
- Non introduce alcun dettaglio implementativo: nessuna tabella, colonna, indice, chiave, vincolo tecnico, tipo di dato tecnico, RLS, API, migrazione, trigger o framework.
- Non anticipa decisioni dei domini non ancora progettati (Collaborazioni, Opportunità, Eventi, Organizzazioni istituzionali, Servizi): dove questi compaiono, compaiono come indizio già registrato altrove, non come decisione di questo documento (§25).
- Non modifica alcun documento esistente: `domain-model.md`, `platform-data-specification.md`, `domain-patterns.md`, `professionisti-domain-thesis.md`, `logical/professionisti.md`, `domain-dependency-map.md` e i quattro Physical Domain Mapping già approvati restano inalterati.

**Metodo applicato.** Ogni decisione di questo documento è riconducibile (PF3, `domain-patterns.md` §8) a un paragrafo specifico della Tesi o del logico, applica i pattern già catalogati da `02-reference-model.md` (richiamati per codice, come fanno i quattro mapping già approvati) e verifica sistematicamente il comportamento delle regole fondazionali, consolidate, preferenziali e candidate di `domain-patterns.md` nel caso concreto di Professionisti (§23-§24), completando così il lavoro già iniziato dalla Tesi al proprio §12 a un livello ancora concettuale, portandolo ora al livello di un Domain Mapping vero e proprio.

---

## 2. Documenti letti

Letti integralmente per questo mapping, oltre ai quattro Physical Domain Mapping già approvati (citati puntualmente in ogni sezione):

| Documento | Ruolo in questo mapping |
|---|---|
| `docs/costituzione-piattaforma.md` | Conferma che, al livello più alto della piattaforma, Professionisti compare solo implicitamente dentro l'ecosistema "Servizi" (§6.5) e nel Flusso 2 (§7): nessuna menzione di un quinto pilastro autonomo, coerente con la classificazione "Supporting"/"Applicativo" già stabilita altrove |
| `docs/domain-model.md` | §2 (Professionisti: "Supporting"); §5 (Persona–Professionista: "ruolo che una Persona assume"); §13, decisione vincolante 5 |
| `docs/platform-data-specification.md` | Conferma per ricerca integrale l'assenza di ogni menzione di "Professionisti": i concetti oggi in `logical/professionisti.md` §6-§7 erano, in questo documento più antico, dispersi sotto "Dominio: SERVIZI" (QualificaDichiarata, OffertaDiServizio/OffertaProfessionaleGenerica, §12-§14) — prova storica diretta della differenziazione progressiva del dominio |
| `docs/architecture/fundamental/domain-patterns.md` | Catalogo integrale dei pattern (PF1-PF20, PC1-PC14, PP1-PP4, PCa1-PCa8); §7 (classificazione dei domini); §9-§11 (Aggregate, PF4/PF5); §10.5 (Professionisti come caso "da confermare" per PF4, priorità bassa); §34 punto 3 (classificazione definitiva di Professionisti come questione aperta) |
| `docs/architecture/fundamental/professionisti-domain-thesis.md` | Fonte vincolante di significato: §6 (dimostrazione H10), §7-§11 (responsabilità, fatti proprietari/esclusi, confini, rapporti con gli altri domini), §12 (applicazione dei pattern), §13 (rischi), §14 (questioni aperte), §16 (decisione architetturale finale) |
| `docs/architecture/logical/professionisti.md` | Fonte di dettaglio per ogni entità, attributo, stato, verifica, evento (§1-§15), incluse le quattro correzioni già introdotte dalla revisione di conformità che ha preceduto questo documento (introduzione §, "Adesione associativa" §6, verifica dell'organizzazione §11, contatti §11) |
| `docs/architecture/logical/persone.md` | §1 (perimetro: "non comprende l'esercizio di un'attività specialistica"); §2 (CompetenzaDichiarata, LinguaParlata come pattern di dichiarazione informale) — base di confronto per §10 (PC3) di questo documento |
| `docs/architecture/logical/imprese.md` | §1/§11/§15 (distinzione Professionista/Impresa, "i due fatti... restano distinti e possono coesistere"); §2 (CertificazioneImpresa come precedente strutturale per §10 di questo documento) |
| `docs/architecture/logical/appartenenze.md` | §2 (distinzione Qualifica organizzativa/Appartenenze vs QualificaDichiarata professionale/Professionisti); §3 (criteri positivi/negativi per un dominio relazionale, PC5/PC6) |
| `docs/architecture/logical/mercati-internazionali.md` | §2/§6 (Professionisti come Risorsa di supporto o controparte, mai parte costitutiva del dominio Mercati); §9 (principio di non automatismo) |
| `docs/architecture/physical/domain-dependency-map.md` | §3-§4 (classificazione "Applicativo"/"Fondazionale limitato", DV7); §7 (sezione dedicata a Professionisti); D10-D13 (uscita), D16/D21/D26/D32/D44 (entrata); V4 (rischio Imprese⊃Professionisti); §22 (regole vincolanti per questo mapping, in particolare regola 12 sulla conferma delle righe "Provvisoria") |
| `docs/architecture/physical/domain-mapping/persone.md` | Modello di riferimento per E02/E03, assi di stato, assenza di Verifica propria come variante legittima (PL2), pattern VO03 |
| `docs/architecture/physical/domain-mapping/imprese.md` | Modello di riferimento per CertificazioneImpresa (precedente diretto per Qualifica/Iscrizione/Abilitazione/Certificazione, §10 di questo documento), sette assi di verifica indipendenti, condizione cumulativa di pubblicazione |
| `docs/architecture/physical/domain-mapping/appartenenze.md` | Modello di riferimento per Fonte/Evidenza (V02/V03), nove stati su tre assi, catalogo di Ruoli come Elenco controllato locale (PL4) |
| `docs/architecture/physical/domain-mapping/mercati-internazionali.md` | Modello di riferimento per riferimento esterno opaco, più Aggregate Root nello stesso dominio (PC2), principio di non automatismo |

---

## 3. Tesi del dominio

Questo documento eredita, senza modificarla né ridiscuterla, la decisione architetturale finale della Tesi (`professionisti-domain-thesis.md` §16):

> Professionisti è un dominio autonomo — classificazione "Applicativo", qualificazione secondaria "Fondazionale limitato" — che rappresenta il ruolo, ontologicamente non un nuovo soggetto, che una Persona assume quando esercita, in modo dichiarabile e verificabile, un'attività professionale specialistica (regolamentata o non regolamentata), attraverso un **Profilo professionale**: un Aggregate Root autonomo, sempre e soltanto ancorato a una Persona esistente, dotato di un proprio ciclo di vita a più assi indipendenti, di un proprio modello di verifica multi-fonte, di propri servizi dichiarati in forma descrittiva e di propria visibilità.

**Vincoli derivati, non rinegoziabili in questa sede.**
1. Nessuna relazione bilaterale autonoma è attribuita a Professionisti (Tesi §16 punto 4): PF4/PF5 non sono applicabili al nucleo del dominio (§24 di questo documento).
2. Il Profilo professionale non esiste senza una Persona esistente (Tesi §8, Fatto 1; `domain-dependency-map.md` D10).
3. Professionisti non è: una Persona, una specializzazione incorporata in Persone, un ruolo nel senso tecnico di Appartenenze, una relazione, un'Impresa, un elenco di competenze, un catalogo di servizi, un insieme di offerte transazionali (Tesi §16 punto 2).
4. Questo documento non introduce alcuna nuova regola architetturale: applica quanto già stabilito, segnala (non risolve) le questioni che la Tesi ha lasciato aperte (§25).

---

## 4. Responsabilità

Ereditate testualmente da Tesi §7, tradotte in altrettante aree di responsabilità concettuale di questo mapping:

| # | Responsabilità | Traduzione in questo mapping |
|---|---|---|
| 1 | Esistenza del ruolo di Professionista, con proprio ciclo di vita | Aggregate Root Profilo professionale (§9), assi di stato (§14) |
| 2 | Qualificazione professionale (categorie, specializzazioni, competenze, titoli, iscrizioni, abilitazioni, certificazioni, esperienza) e la sua verifica | Entity dipendenti QualificaProfessionale/IscrizioneProfessionale/Abilitazione/Certificazione/CompetenzaProfessionale (§10), assi di verifica dedicati (§16) |
| 3 | Servizi professionali dichiarati, come proprietà descrittiva | Entity dipendente ServizioProfessionale (§10) |
| 4 | Territori, mercati e lingue rilevanti per l'esercizio professionale, come proprietà dichiarate | Entity dipendenti TerritorioServito/LinguaOperativaProfessionale/MercatoServito, con riferimento esterno opaco a Tassonomia condivisa e a Mercati Internazionali (§13) |
| 5 | Disponibilità e condizioni professionali indicative | Value Object Disponibilità/TariffaIndicativa, asse di stato dedicato (§14) |
| 6 | Ciclo di vita, verifica d'insieme e visibilità del profilo, come assi indipendenti tra loro e dalla Persona | §14, §16, §17-§18 |

Questa responsabilità resta, per costruzione (Tesi §6), sempre subordinata all'esistenza di una Persona e sempre distinta da quella di Imprese, Appartenenze e Mercati Internazionali (§5, §7 di questo documento).

---

## 5. Confini

Ereditati da Tesi §10, con l'aggiunta della qualificazione di pattern fisico applicabile:

| Dominio adiacente | Cosa fa Professionisti (fisico) | Cosa NON fa Professionisti (fisico) |
|---|---|---|
| Persone | Riferimento esterno opaco e necessario (R01/PF5) alla Persona | Nessuna Entity o Value Object di Professionisti duplica un attributo di Persona; nessun Profilo esiste senza quel riferimento |
| Imprese | Riferimento esterno opaco e facoltativo (R02) all'Impresa/studio come Organizzazione professionale | Nessuna Entity di Imprese (sedi, certificazioni aziendali, canali) è incorporata o duplicata |
| Appartenenze | Utilizzo (non riferimento sostanziale) dell'esistenza e dell'esito di verifica di un'Appartenenza, quando pertinente | Nessuna relazione strutturata Persona-Impresa è posseduta, referenziata come propria Entity, o autonomamente verificata da Professionisti |
| Mercati Internazionali | Riferimento esterno opaco e facoltativo (R02) al Mercato come Aggregate Root di quel dominio, per "mercati conosciuti/serviti" | Nessuna nuova istanza di Mercato, Presenza o Interesse di mercato |
| Servizi (futuro) | Entity dipendente ServizioProfessionale come dichiarazione descrittiva | Nessuna offerta strutturata, pubblicata e ricercabile con regole proprie |
| Opportunità / Collaborazioni (ipotetici) | Riferimento facoltativo in uscita dal Servizio professionale quando risponde a un'esigenza già emersa altrove (§7 del logico); riferimento in entrata già censito (D16/D21) | Nessuna incorporazione del processo di incontro domanda/offerta né dei suoi esiti |
| Eventi (ipotetico) | Nessun riferimento in uscita; riferimento in entrata già censito (D26) | Nessuna gestione di iscrizioni, capienze o struttura dell'Evento |
| Identità & Accessi | Nessuna dipendenza sostanziale in ingresso | Nessuna definizione né determinazione di alcun permesso tecnico |

---

## 6. Fatti proprietari

Ereditati da Tesi §8, tradotti in altrettanti concetti persistenti con pattern applicabile:

| Fatto proprietario (Tesi §8) | Concetto/i persistente/i di questo mapping | Pattern |
|---|---|---|
| Fatto 1 — Esistenza e ciclo di vita del ruolo | Profilo professionale | A01 |
| Fatto 2 — Qualifiche, titoli, iscrizioni, abilitazioni, certificazioni, esperienza e verifica | QualificaProfessionale, TitoloProfessionale, IscrizioneProfessionale, Abilitazione, Certificazione, CompetenzaProfessionale, EsperienzaProfessionale | E02 (salvo Titolo professionale ed Esperienza, VO01, §10-§11) |
| Fatto 3 — Servizi professionali dichiarati | ServizioProfessionale | E02 |
| Fatto 4 — Territori, mercati e lingue rilevanti | TerritorioServito, LinguaOperativaProfessionale, MercatoInternazionaleServito | E02 + VO03/riferimento esterno |
| Fatto 5 — Disponibilità e condizioni indicative | Disponibilità, TariffaIndicativa | VO01 |
| Fatto 6 — Ciclo di vita, verifica d'insieme, visibilità | Assi di stato del Profilo professionale | S01-S04 + asse dedicato (§14) |

Ogni riga di questa tabella resta motivata, contro ciascuno degli altri quattro domini già progettati, esattamente come argomentato in Tesi §8: questo documento non ripete quella motivazione, la applica.

---

## 7. Fatti esclusi

Ereditati da Tesi §9, senza alcuna estensione né riduzione. Questo mapping conferma che nessuna Entity, Value Object o Elenco controllato introdotto ai §10-§12 rappresenta uno di questi fatti.

| Fatto escluso | Dominio proprietario corretto | Conferma a livello fisico |
|---|---|---|
| Identità, biografia, dati di contatto di base della Persona | Persone | Riferimento esterno opaco (§13); nessun attributo di Persona è incorporato (§11 di `persone.md`) |
| Competenze e lingue generiche non specialistiche (CompetenzaDichiarata, LinguaParlata) | Persone | Nessuna Entity di questo mapping incorpora CompetenzaDichiarata/LinguaParlata; CompetenzaProfessionale/LinguaOperativaProfessionale sono concetti distinti (§10, §16, rischio "Duplicazione delle competenze") |
| Identità e dati descrittivi dell'eventuale Impresa/studio | Imprese | Riferimento esterno opaco e facoltativo (§13); nessuna SedeImpresa, CertificazioneImpresa, CanaleImpresa o MediaImpresa è duplicata |
| Rapporto strutturato e duraturo con un'Impresa/studio | Appartenenze | Nessuna Entity "RapportoOrganizzativo" è introdotta da questo mapping; l'utilizzo dell'esistenza dell'Appartenenza è trattato al §13, §16, senza incorporazione |
| Mercato come contesto e relazioni di Presenza/Interesse/Attività internazionale | Mercati Internazionali | MercatoInternazionaleServito (§10) è una dichiarazione locale leggera, mai una nuova istanza di Presenza o Interesse (§13, §21) |
| Offerta di servizio strutturata (OffertaDiServizio/RichiestaDiServizio) | Servizi (futuro) | ServizioProfessionale (§10) resta descrittivo: nessun processo di pubblicazione, ricerca o candidatura proprio è introdotto |
| Processo di candidatura, incontro o proposta (Opportunità/Collaborazioni) | Opportunità / Collaborazioni (ipotetici) | Nessuna Entity di questo mapping rappresenta una candidatura o un esito; i riferimenti facoltativi in uscita da ServizioProfessionale (§5, §21) referenziano senza incorporare |
| Partecipazione a un Evento come relatore/formatore | Eventi (ipotetico) | Nessuna Entity "Partecipazione" è introdotta da questo mapping |
| Recensioni, valutazioni, reputazione | Nessun dominio attuale | Nessun Value Object o Entity di affidabilità aggregata è introdotto (PF10/PF11, §23) |
| Messaggistica privata | Fuori perimetro | Nessuna Entity di comunicazione è introdotta |
| Contratti, incarichi, fatturazione, pagamenti | Fuori perimetro | Nessuna Entity di questo tipo è introdotta; TariffaIndicativa (§11) resta un Value Object descrittivo, non un impegno |
| Autenticazione, account, credenziali, permessi applicativi | Identità & Accessi | Nessun concetto di questo mapping genera un permesso tecnico (§21, §23 PF6/PF13) |
| Organizzazioni professionali, studi associati, Ordini/Collegi come entità proprie | Nessun dominio attuale (Organizzazioni istituzionali, candidato) | Referenziati come Impresa (§13) quando strutturati, o come Fonte (V03, §16) quando enti verificatori; nessuna scheda propria è introdotta |
| Garanzia di qualità o esito della prestazione | Nessun dominio | Nessuna informazione di questo mapping costituisce una promessa di risultato (§22, invariante 6) |

---

## 8. Aggregate

**Analisi critica dei sette concetti richiesti**, secondo la procedura in cinque domande già applicata dai quattro mapping approvati (PC1, `domain-patterns.md` §9; `persone.md` §13 Decisione 1-2; `imprese.md` §3/§6): (a) è già l'Aggregate Root del dominio? (b) ha bisogno di essere referenziato individualmente da altri domini? (c) è interamente descritto dai propri attributi? (d) rappresenta un insieme di alternative? (e) è ottenuto elaborando altri dati?

| Concetto | (a) | (b) | (c) | (d) | (e) | Natura risultante | Motivazione sintetica |
|---|---|---|---|---|---|---|---|
| **Profilo professionale** | Sì | — | — | — | — | **Aggregate Root (A01)** | È il centro di consistenza del dominio, dichiarato come tale da Tesi §6/§16 e da `logical/professionisti.md` §2 |
| **Qualifica** (Qualifica professionale) | No | No — nessun documento logico richiede che un'Opportunità o una Collaborazione referenzi una specifica Qualifica invece del Profilo o di una Categoria (Tesi §14 punto 2, non ancora deciso; nessun indizio attuale in senso contrario) | No — ha identità propria distinguibile nel tempo (due dichiarazioni della stessa qualifica in periodi diversi restano due fatti storicamente distinti, §15 di questo documento) | No | No — è un dato dichiarato (D02), non derivato | **Entity dipendente (E02)** | Applica PC3 (dichiarazione + riferimento a catalogo → E02); conferma la classificazione già data da `logical/professionisti.md` §2 |
| **Iscrizione** (Iscrizione professionale) | No | No, per lo stesso motivo di Qualifica | No — ha una propria identità stabile (necessaria per applicare stati indipendenti: attiva/sospesa/non più attiva) | No | No | **Entity dipendente (E02)** | Stessa motivazione di Qualifica; conferma `logical/professionisti.md` §2 |
| **Abilitazione** | No | No, per lo stesso motivo | No — ha una propria identità stabile (necessaria per distinguere un'Abilitazione revocata da una mai posseduta) | No | No | **Entity dipendente (E02)** | Stessa motivazione; conferma `logical/professionisti.md` §2 |
| **Certificazione** | No | No, per lo stesso motivo | No — stessa motivazione di Qualifica/Iscrizione/Abilitazione | No | No | **Entity dipendente (E02)** | Non classificata esplicitamente da `logical/professionisti.md` §2 (compare solo in §6/§11): questo mapping la classifica per analogia diretta e motivata con Qualifica/Iscrizione/Abilitazione (§10) |
| **Servizio Professionale** | No | No — nessun documento logico richiede la referenziabilità individuale di un singolo Servizio dichiarato da parte di un altro dominio (i riferimenti da Opportunità/Collaborazioni sono verso il Profilo/la qualificazione, non verso l'istanza di Servizio) | No — ha propria identità e proprio ciclo di vita (dichiarato→attivo→sospeso→non più disponibile, §7 del logico) | No | No | **Entity dipendente (E02)** | Conferma `logical/professionisti.md` §2 |
| **Esperienza Professionale** | No | No | **Sì** — è interamente descritta dai propri attributi (anni, ambiti), non ha un'identità distinguibile da essi, e due dichiarazioni con lo stesso contenuto sono indistinguibili | No | No | **Value Object (VO01)** | Conferma `logical/professionisti.md` §2 ("concetto descrittivo, non un'entità a sé"); resta comunque un oggetto verificato in modo indipendente (§16), pattern legittimo già osservato in `imprese.md` §12 riga 2 |

**Esito complessivo (PC1 applicato senza scorciatoie).** Un solo Aggregate Root (Profilo professionale); sei concetti dipendenti di natura E02, salvo Esperienza professionale che resta VO01. Nessuno dei sei concetti dipendenti soddisfa oggi il criterio (b) di referenziabilità esterna individuale: questo è il fatto decisivo che li mantiene E02 e non li promuove ad Aggregate Root autonomi (§9, §25).

---

## 9. Aggregate Root

**Profilo professionale — unico Aggregate Root del dominio.**

- **Identità.** Identità interna/stabile propria, mai derivata dall'identità della Persona sottostante (corollario di PF5 applicato per analogia: anche se qui non esiste una relazione in senso PF4, l'identità del Profilo non deve mai coincidere con quella della Persona, per permettere a un riferimento esterno di restare valido anche se, in astratto, il Profilo venisse un giorno rimodellato indipendentemente dalla Persona). Identità pubblica distinta (un identificativo con cui il Profilo è citabile e ricercabile), coerente con `domain-model.md` §12 ("Profilo... professionale — sempre da qualificare"). Nessuna identità temporanea (nessun processo limitato nel tempo ha questa natura in `logical/professionisti.md`).
- **Ciclo di vita.** Multi-asse (§14): non una sequenza lineare unica, ma quattro-cinque assi indipendenti (editoriale, verifica, professionale reale, disponibilità, visibilità/pubblicazione), il numero più alto tra i domini oggi mappati (`professionisti-domain-thesis.md` §12, nota a PF7).
- **Cardinalità rispetto alla Persona: al massimo un Profilo professionale per Persona, non zero-o-più profili distinti.** Motivazione, tradotta da `logical/professionisti.md` §2 ("al massimo un Profilo professionale per Persona") e §13 (regola 1, caso limite "Persona con più professioni"): una Persona che esercita più professioni non richiede più Profili, perché il Profilo è già progettato per contenere più Categorie, più Qualifiche e più Servizi professionali (§10). Introdurre più Profili per la stessa Persona duplicherebbe l'asse di stato, la verifica e la visibilità per uno stesso soggetto senza alcun beneficio concettuale: la differenziazione avviene all'interno del Profilo (più Categorie/Servizi), non tra Profili distinti. Questo mapping conferma tale decisione già presa dal logico, verificandola contro PF7 (assi indipendenti mai compressi): un solo Profilo con più Categorie non comprime alcun asse, perché ciascuna Qualifica/Servizio conserva la propria identità e il proprio stato indipendentemente dalle altre all'interno dello stesso Profilo.
- **Invarianti.** Si veda §22 per l'elenco completo; i più diretti per l'Aggregate Root sono: nessun Profilo esiste senza una Persona esistente; un Profilo con stato professionale reale terminale (Cessato/Revocato/Archiviato) non può essere presentato come attuale (PC7); la visibilità del Profilo non può eccedere quella della Persona sottostante (PF12 per analogia, coerente con il principio di coerenza già stabilito da `logical/professionisti.md` §12).
- **Stati.** Trattati integralmente al §14.
- **Pubblicazione, visibilità, disponibilità.** Trattate integralmente ai §17-§18 e nell'asse dedicato del §14.
- **Storico.** Conservazione più completa per default (PF8): ogni transizione di ciascun asse resta ricostruibile; nessuna Qualifica, Iscrizione, Abilitazione o Certificazione scaduta/revocata viene eliminata dallo storico (`logical/professionisti.md` §13, regola 12).

---

## 10. Entity

Entity dipendenti dell'Aggregate Profilo professionale, con motivazione della natura, del proprio ciclo di vita e del confine con gli altri sei concetti dipendenti.

| Entity (E02) | Responsabilità | Ciclo di vita proprio | Motivazione della non-promozione ad Aggregate Root |
|---|---|---|---|
| **QualificaProfessionale** | Rappresentare una singola qualifica dichiarata (§6 del logico: Titolo di studio, Qualifica dichiarata in senso proprio) | Dichiarata → In verifica → Verificata/Contestata → (Scaduta, se a termine) | Nessuna necessità di referenziabilità esterna individuale oggi documentata (§8); identità propria necessaria solo per distinguere dichiarazioni successive, non per essere referenziata da altri domini |
| **TitoloProfessionale** | Rappresentare la denominazione formale del titolo (es. "Avvocato") | — (Value Object, §11) | Trattato come VO01 per esplicita indicazione del logico (§2); resta comunque oggetto di una propria riga di verifica (§16), pattern legittimo (`imprese.md` §12 riga 2) |
| **IscrizioneProfessionale** | Rappresentare l'iscrizione a un Ordine o Collegio | Dichiarata → In verifica → Verificata/Contestata → Sospesa → (Non più attiva) | Stessa motivazione di QualificaProfessionale; la propria identità serve a distinguere iscrizioni a enti diversi o in periodi diversi, non a essere referenziata da altri domini |
| **Abilitazione** | Rappresentare l'autorizzazione legale all'esercizio, incluso il sotto-caso "Autorizzazione" (ambito più circoscritto, §6 del logico, trattato come valore del proprio Tipo, C05, §12) | Dichiarata → In verifica → Verificata/Contestata → Sospesa → Revocata | Stessa motivazione; unificare Autorizzazione dentro Abilitazione con un Tipo (invece di introdurre una settima Entity) applica lo stesso criterio con cui `imprese.md` §2 ha unificato certificazioni/qualificazioni/iscrizioni/attestazioni in un'unica CertificazioneImpresa con Tipo, evitando di disperdere in Entity separate ciò che condivide identica struttura di verifica (fonte istituzionale, esito, scadenza/revoca) |
| **Certificazione** | Rappresentare un riconoscimento rilasciato da un ente certificatore, non necessariamente legato a una professione regolamentata | Dichiarata → In verifica → Verificata/Contestata → Scaduta | Stessa motivazione delle precedenti tre; mantenuta distinta da Qualifica/Iscrizione/Abilitazione (non fusa in un'unica super-Entity) perché il logico (§6, §11) la tratta come un proprio asse di verifica indipendente (PF11), con una propria Fonte tipica (ente certificatore, distinto da Ordine/Collegio/autorità) |
| **IscrizioneAssociativa** (Adesione associativa) | Rappresentare l'adesione a un'associazione professionale non statutaria | Dichiarata → Rimossa (ciclo minimale, per analogia diretta con CompetenzaDichiarata/LinguaParlata di Persone, `persone.md` §2) | Nessun asse di verifica dedicato in `logical/professionisti.md` §11 (a differenza di Qualifica/Iscrizione/Abilitazione/Certificazione): trattata con un ciclo di vita più leggero, non con l'apparato multi-stato delle qualifiche formali |
| **CompetenzaProfessionale** | Rappresentare una competenza dichiarata nel contesto professionale, distinta da CompetenzaDichiarata di Persone (§7 di questo documento) | Dichiarata → Rimossa, con verifica opzionale (asse S03 quando applicabile) | Applica PC3 (dichiarazione + riferimento a catalogo condiviso, §11); nessuna necessità di referenziabilità individuale distinta da quella già garantita tramite il Profilo |
| **EsperienzaProfessionale** | Trattata come Value Object, non Entity: si veda §11 | — | — |
| **ServizioProfessionale** | Rappresentare un servizio dichiarato dal Profilo, con la propria natura (consulenza, formazione, assistenza, ecc.), destinatario tipico, e riferimenti facoltativi in uscita a Opportunità/Collaborazioni/Mercati quando pertinenti (§7 del logico) | Dichiarato → Attivo → Sospeso → Non più disponibile (terminale) | Nessuna necessità di referenziabilità individuale da parte di Opportunità/Collaborazioni oggi documentata (i riferimenti in entrata verso Professionisti, D16/D21, puntano al Profilo o a una qualificazione, non a uno specifico Servizio) |
| **TerritorioServito** | Rappresentare la singola dichiarazione di territorio in cui il Professionista è disposto a operare, con riferimento VO03 al catalogo condiviso Territori | Dichiarata → Rimossa | Per analogia diretta con SedeImpresa/SettoreImpresa (`imprese.md` §3) e con l'applicazione di PC3 |
| **LinguaOperativaProfessionale** | Rappresentare la singola dichiarazione di lingua operativa nell'esercizio professionale, distinta da LinguaParlata di Persone | Dichiarata → Rimossa | Analogia diretta con LinguaOperativaImpresa (`imprese.md` §3) e con LinguaParlata (`persone.md` §2); applica PC3 |
| **MercatoInternazionaleServito** | Rappresentare la dichiarazione leggera di un Mercato conosciuto/servito, distinta dalla Presenza/Interesse di Mercati Internazionali | Dichiarata → Rimossa | Riferimento esterno opaco e facoltativo al Mercato come Aggregate Root di Mercati Internazionali (§13); nessuna incorporazione della relazione di Presenza/Interesse |
| **Fonte** | Rappresentare la provenienza di un'informazione dichiarata in questo dominio | — (V03, pattern locale ripetuto, PC11) | Non è un'Entity condivisa tra domini: ogni dominio possiede la propria nozione di Fonte (PC11, confermata identicamente in Imprese/Appartenenze/Mercati Internazionali) |
| **Evidenza** | Rappresentare ciò che sostiene concretamente una verifica | Dichiarata → Utilizzata (per una specifica Verifica) | Entity dipendente per analogia diretta con Appartenenze (`appartenenze.md` §4) |

**Perché nessuna di queste Entity duplica un'Entity di un altro dominio.** CompetenzaProfessionale non duplica CompetenzaDichiarata (Persone): referenziano la stessa voce di Tassonomia condivisa (quando il contesto lo richiede) ma restano due dichiarazioni indipendenti, per contesto d'uso distinto (§7). TerritorioServito/LinguaOperativaProfessionale non duplicano l'omologa dichiarazione di Persone o di Imprese, per lo stesso motivo. Abilitazione/Certificazione non duplicano CertificazioneImpresa (Imprese): quest'ultima riguarda l'impresa come soggetto economico, non la qualifica personale di chi la anima (Tesi §8, Fatto 2).

---

## 11. Value Object

| Value Object (VO01, salvo indicato) | Incorporato in | Motivazione dell'incorporazione |
|---|---|---|
| **TitoloProfessionale** (denominazione, es. "Dottore commercialista") | QualificaProfessionale o IscrizioneProfessionale/Abilitazione, secondo il caso | Descrive la singola dichiarazione, cambia con essa, non richiede referenziabilità individuale (`logical/professionisti.md` §2) |
| **TitoloDiStudio** | QualificaProfessionale | Attributo di supporto/precursore del Titolo professionale; nessun asse di verifica dedicato in §11 del logico distinto da quello della Qualifica/Titolo che lo utilizza |
| **EsperienzaProfessionale** (anni, ambiti) | Profilo professionale o QualificaProfessionale/CompetenzaProfessionale che descrive | Interamente descritta dai propri attributi (§8); resta un oggetto verificato in modo indipendente (V01 applicato a un VO, pattern già confermato da `imprese.md` §12 riga 2, "Dati aziendali") |
| **RiconoscimentoEstero / Equivalenza in Italia** | QualificaProfessionale/IscrizioneProfessionale/Abilitazione/Certificazione, come attributo (origine: nazionale/estero) + sotto-stato (Non richiesta/In corso/Ottenuta/Negata) | Descrive una condizione della singola dichiarazione a cui appartiene (`logical/professionisti.md` §6, §13); non ha una propria identità distinguibile fuori da essa |
| **Disponibilità** (fascia di impegno, tempi indicativi di risposta, territoriale/da remoto) | Profilo professionale | Value Object che alimenta l'asse di stato dedicato (§14); i suoi attributi cambiano solidalmente con il Profilo, senza propria identità |
| **TariffaIndicativa** | Profilo professionale o ServizioProfessionale | Un'indicazione di massima, mai un impegno vincolante (`logical/professionisti.md` §9, principio cardine); nessuna identità propria |
| **ModalitàDiEsercizio** | Profilo professionale/ServizioProfessionale, come Tipologia (**C05**) | Classifica come il Professionista esercita (individuale, studio, società, ecc., §4 del logico); valore di catalogo locale, non un fatto a sé stante |

**Attributi descrittivi minori.** Natura del Servizio professionale (consulenza/formazione/assistenza/rappresentanza/progettazione/verifica/accompagnamento), standard/personalizzato, rivolto a Persone/Imprese: tutti VO01 incorporati in ServizioProfessionale, coerenti con il trattamento di attributi analoghi in `imprese.md` §4 per ServizioImpresa/ProdottoImpresa.

---

## 12. Elenchi controllati

Applicando PC14/PP1 (`domain-patterns.md` §23): un vocabolario locale diventa Elenco controllato (**C03**), non Tassonomia condivisa (**C02**), quando nessun altro dominio dichiara di governarlo autonomamente e i suoi valori sono presentati dal logico come un insieme chiuso descritto nel testo.

| Elenco controllato | Fonte logica | Motivazione C03 (non C02) |
|---|---|---|
| **Categoria professionale** (dieci gruppi, `logical/professionisti.md` §5) | §5 | Nessun altro dominio dichiara di possedere o governare questo catalogo; è presentato come insieme descritto direttamente nel testo, non come catalogo con vita propria (PF19, già segnalato dalla Tesi §12) |
| **Specializzazione** | §5 | Sotto-catalogo dipendente dalla Categoria, stessa motivazione |
| **Modalità di esercizio** (undici valori, §4) | §4 | Enumerazione chiusa locale al dominio, coerente con il trattamento di "Natura del canale"/"Tipologia di sede" in `imprese.md` §4 (C05) |
| **Tipo di Fonte** (dichiarazione del Professionista, Ordine/Collegio, registro pubblico, università, ente certificatore, organizzazione professionale, Impresa, studio, cliente, ente partner, redazione, fonte pubblica, documento ufficiale) | §11 | Pattern locale ripetuto (PC11), non un'entità condivisa |
| **Tipo di Abilitazione** (Abilitazione generale / Autorizzazione specifica) | §6 | Classificazione interna alla singola Entity Abilitazione (§10), non un catalogo condiviso con altri domini |
| **Natura del Servizio professionale** (consulenza, formazione, assistenza, rappresentanza, progettazione, verifica, accompagnamento) | §7 | Enumerazione chiusa, non mutuamente esclusiva, locale a ServizioProfessionale |

**Perché nessuno di questi elenchi è promosso a Tassonomia condivisa.** Nessun secondo dominio (oggi mappato o candidato) dichiara di avere bisogno di governare autonomamente uno di questi vocabolari: a differenza di Settore, Lingua, Competenza e Territorio — condivisi da Persone, Imprese e ora anche da Professionisti (§13) — questi elenchi restano un fatto interno al significato professionale, coerente con la raccomandazione già anticipata dalla Tesi (§12, nota a PF19; §14 punto 5). Una futura promozione resta possibile, ma non è decisa da questo documento (§25).

---

## 13. Riferimenti esterni

Tutti applicano il pattern del riferimento esterno opaco (§11 di `domain-patterns.md`): identità stabile del soggetto referenziato, mai una sua proprietà descrittiva, mai un suo stato interno.

| Riferimento esterno | Dominio proprietario | Natura | Motivazione |
|---|---|---|---|
| **Persona** | Persone | Necessario, opaco (R01) | Nessun Profilo esiste senza di esso (D10, Consolidata); nessun attributo di Persona è copiato |
| **Impresa/studio** (Organizzazione professionale) | Imprese | Facoltativo, opaco (R02) | Contesto organizzativo dichiarato, mai incorporato (D11, Consolidata) |
| **Appartenenza** (esistenza e relativo esito di verifica) | Appartenenze | Utilizzo, non riferimento sostanziale | Professionisti non possiede né referenzia la struttura della relazione: ne utilizza il fatto già accertato (D12, §16, §21) |
| **Mercato** (Aggregate Root) | Mercati Internazionali | Facoltativo, opaco (R02) | "Mercati conosciuti/serviti", mai una nuova Presenza/Interesse (D13, §21) |
| **Voci di Tassonomia condivisa** (Settore, Lingua, Competenza) | Tassonomia condivisa | VO03 | Applicazione diretta di PC3, per analogia con `persone.md` §4 e `imprese.md` §6 |
| **Territori** | Territori (condiviso) | VO03 | Stessa motivazione, per analogia con `imprese.md` §5 |
| **Esito di verifica dell'esistenza dell'Impresa** | Imprese | Utilizzo di un dato già derivato altrove, mai una verifica autonoma | Vincolo esplicito della richiesta e del logico (§11: "questo dominio non conduce una propria verifica autonoma"), trattato in dettaglio al §16 |
| **Contatti pubblici della Persona** (quando il Professionista non dichiara un canale proprio) | Persone | Riferimento, non incorporazione | §19 di questo documento |

**Derivazioni in uscita (nessuna).** Professionisti non deriva alcun proprio dato da fatti di altri domini: ogni Entity elencata ai §10-§11 è un dato sorgente/dichiarato (**D01/D02**), non un dato calcolato o aggregato. L'unica combinazione che ha natura di derivazione interna (non verso altri domini) è lo stato di verifica d'insieme del Profilo (§14, §16), trattato come proiezione non autorevole, coerente con l'Affidabilità (V05) già esclusa come stato persistente in Imprese (`imprese.md` §12).

---

## 14. Stati

Applicando la procedura obbligatoria (PF7, `domain-patterns.md` §12): percorrere gli otto assi catalogati (S01-S08) e dichiarare esplicitamente, per il Profilo professionale, se ciascuno si applica, con motivazione — e dichiarare esplicitamente ogni asse specifico del dominio che gli otto assi catalogati non esauriscono (PP4).

### 14.1 Profilo professionale

| Asse | Applicabile | Valori (da `logical/professionisti.md` §10) | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì | Attivo / Sospeso / Cessato / Revocato (§10.c, "stato professionale reale") | Risponde a "il Professionista esercita correntemente"; Revocato è distinto da Cessato per natura non volontaria (provvedimento disciplinare), coerente con PC7 |
| **S02** Stato editoriale | Sì | Bozza → Dichiarato → Pubblicato (§10.a) | Fase redazionale, distinta da S01: un Profilo può essere Dichiarato ma non ancora Attivo nella pratica, o viceversa avviato informalmente prima della formalizzazione |
| **S03** Stato di verifica | Sì, come **proiezione non autorevole** sui quattordici assi indipendenti (§16) | Non verificato / Verificato parzialmente / Verificato (§10.b) | Coerente con PF10/PF11: non è un giudizio complessivo autorevole, ma una vista di sintesi derivata dallo stato dei singoli assi di verifica (§16), esplicitamente non normativa (PC4) — la fonte autorevole per ciascun aspetto resta la singola Verifica (QualificaProfessionale, IscrizioneProfessionale, ecc.) |
| **S04** Stato di pubblicazione | Sì | Non pubblicato / Pubblicato (§10.a, §12) | Condizione cumulativa (PF12), trattata al §18 |
| **S05** Stato di accesso | Non trattato (competenza IA) | — | Coerente con tutti i quattro mapping già approvati |
| **S06** Stato di sicurezza | Non applicabile | — | Nessun fatto di sicurezza tecnica è posseduto da Professionisti |
| **S07** Stato amministrativo | Sì, come qualificazione di S01 | Origine della sospensione/cessazione (volontaria / disciplinare / per moderazione) | Distingue "cosa è successo" (S01) da "chi/cosa lo ha causato", coerente con l'analogo asse di Persone/Imprese |
| **S08** Stato storico | Sì | — | Ogni transizione resta ricostruibile (PF8) |
| **Contestazione** (overlay trasversale, non valore di un'enumerazione) | Sì | Contestato (può sovrapporsi in qualsiasi momento a qualunque altro asse, §10.b) | Trattata come pattern di contestazione (PCa1, §23), non come un quinto valore di S03: `logical/professionisti.md` §10 lo dichiara esplicitamente ("può sovrapporsi in qualsiasi momento agli altri stati"), coerente con il trattamento di "Profilo sospetto o contestato" in `imprese.md` §12 riga 7 |
| **Disponibilità** (asse specifico del dominio, non riconducibile a un codice S01-S08 esistente) | Sì | Disponibile / Disponibilità limitata / Non disponibile / Disponibilità futura / Accettazione su valutazione / Temporaneamente non disponibile (§9, §10.d) | Segnale d'allarme verificato esplicitamente (PC8): nessuno degli otto assi già catalogati risponde alla domanda "il Professionista è oggi raggiungibile per un nuovo incarico", che è ortogonale sia a S01 (un Professionista può essere Attivo ma Temporaneamente non disponibile) sia a S04 (la disponibilità non è una forma di pubblicazione). Dichiarato esplicitamente come asse aggiuntivo specifico del dominio (PP4), non forzato dentro S01 o S07; si veda §25 per la questione, riservata a una futura revisione di `02-reference-model.md`, se questo debba ricevere un proprio codice di famiglia |

**Visibilità.** Trattata come famiglia distinta (VIS01-06) al §17, non come valore di S04: S04 è la decisione sostanziale di pubblicazione, VIS01-06 ne è l'articolazione completa (esistenza/accessibilità/consultabilità/pubblicazione/indicizzazione/riservatezza).

**Perché cinque-sei assi non violano PC8.** Applicando lo stesso segnale d'allarme già usato da Persone (§6.4) e Imprese (§11.5): nessuna singola Entity di questo dominio richiede simultaneamente più di questi assi; QualificaProfessionale/IscrizioneProfessionale/Abilitazione/Certificazione hanno un proprio S01+S03 indipendenti (§14.2), non gli stessi del Profilo.

### 14.2 QualificaProfessionale, IscrizioneProfessionale, Abilitazione, Certificazione

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì, con valori specifici per tipo | Iscrizione: attiva/sospesa/non più attiva; Abilitazione: attiva/sospesa/revocata; Qualifica/Certificazione: dichiarata/scaduta | Ogni concetto ha una propria condizione operativa (§6 del logico) |
| **S03** Stato di verifica | Sì, autorevole (non proiezione) | Dichiarata / In verifica / Verificata / Contestata | Ciascuna di queste quattro Entity possiede una propria Verifica autorevole e indipendente (§16), a differenza del Profilo, dove S03 è derivato |
| **S04** Stato di pubblicazione | Sì, sussunto | La Qualifica pubblica con evidenze riservate (§12 del logico: "Qualifica pubblica con evidenze riservate") | La qualifica in sé può essere pubblica mentre l'Evidenza sottostante resta riservata: due decisioni di visibilità indipendenti sullo stesso fatto |
| **S08** Stato storico | Sì | — | Nessuna Qualifica/Iscrizione/Abilitazione/Certificazione scaduta o revocata è eliminata dallo storico (PF8, `logical/professionisti.md` §13 regola 12) |

### 14.3 ServizioProfessionale

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì | Dichiarato → Attivo → Sospeso → Non più disponibile (terminale) | §7 del logico |
| **S08** Stato storico | Sì | — | PF8, per default |

### 14.4 IscrizioneAssociativa, CompetenzaProfessionale, TerritorioServito, LinguaOperativaProfessionale, MercatoInternazionaleServito

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** | Sì, minimale | Dichiarata → Rimossa | Stessa scelta deliberata già applicata a CompetenzaDichiarata/LinguaParlata in Persone (`persone.md` §6.2), per analogia diretta |
| **S03** | Facoltativo (solo CompetenzaProfessionale, LinguaOperativaProfessionale, TerritorioServito) | Non verificata / Verificata | Coerente con §16; IscrizioneAssociativa e MercatoInternazionaleServito non hanno un proprio asse di verifica dedicato in `logical/professionisti.md` §11 |
| **S08** | Sì (per default) | — | PF8 |

---

## 15. Temporalità

Applicando i sette pattern (T01-T07, `02-reference-model.md` §14) con selettività motivata (PC9): nessuna Entity di questo dominio applica tutti e sette senza distinzione.

| Pattern | Applicabile | A quali Entity | Motivazione |
|---|---|---|---|
| **T01** Validità | Sì | QualificaProfessionale, Certificazione (quando "a validità temporale", §6 del logico); Abilitazione territorialmente limitata (§6, caso limite) | Un periodo dopo il quale il fatto dichiarato cessa automaticamente di produrre effetti, esplicitamente previsto ("Qualifiche scadute", §6, §13) |
| **T02** Efficacia | Non applicabile | — | Nessuna dichiarazione diventa efficace in un momento diverso da quello della propria decorrenza |
| **T03** Decorrenza | Sì | Tutte le Entity dipendenti | Ogni fatto ha un momento di inizio rilevante (dichiarazione, conseguimento) |
| **T04** Scadenza | Sì | QualificaProfessionale, Certificazione, Abilitazione (quando a termine) | "Qualifica scaduta" è uno stato esplicito (§6, §10, §13) |
| **T05** Intervallo | Sì, quando T04 si applica | Come sopra | Decorrenza obbligatoria e fine facoltativa e apribile (PC10), coerente con "Più qualifiche con periodi diversi" (§13 del logico) |
| **T06** Cronologia | Sì | Tutte | Ogni Entity percorre una sequenza ordinata di transizioni ricostruibile |
| **T07** Storia | Sì | Tutte | PF8, per default |

**Revoca, sospensione, riattivazione.** Trattate come transizioni dell'asse S01 (§14.2), non come un pattern di Temporalità distinto: una Revoca (Abilitazione) o una Sospensione (Iscrizione) non sono scadenze previste dal decorso del tempo (T04), ma decisioni deliberate di un soggetto verificatore, coerenti con la distinzione già tracciata da `imprese.md` §14 tra Scadenza (T04) e Annullamento deliberato.

**Riattivazione.** Un'Iscrizione sospesa può tornare Attiva (nuova transizione di S01, non una nuova Entity); coerente con `appartenenze.md` §12 regola 4 ("successione... tramite conclusione e nuova dichiarazione, non modifica in luogo") applicato per analogia solo quando il logico lo prevede esplicitamente — qui il logico (§6, "Iscrizioni sospese") descrive una sospensione reversibile della stessa Entity, non una conclusione e nuova dichiarazione: questo mapping conserva quindi la stessa identità di IscrizioneProfessionale attraverso la sospensione/riattivazione, distinguendosi in questo punto da Appartenenze per un motivo esplicito (il logico non descrive una "nuova Iscrizione" alla riattivazione, ma la stessa Iscrizione che cambia stato).

**Versionamento (VR01-VR06).** Non applicabile: nessuna Entity di questo dominio ha una dimensione redazionale (un testo, una presentazione) che richieda un vero ciclo di revisione, a differenza di StoriaPersonale in Persone. Il Profilo professionale evolve per aggiunta/rimozione di Qualifiche/Servizi e per transizione di stato, non per redazione di versioni successive di un testo.

---

## 16. Verifiche

Applicando il modello multidimensionale (V01-V05, PF10/PF11): mai un giudizio complessivo, sempre assi indipendenti nominati. Ereditati integralmente dai quattordici assi di `logical/professionisti.md` §11, con l'aggiunta esplicita richiesta dal mandato di questo documento.

| # | Aspetto verificato (V01) | Oggetto | Fonte (V03) | Evidenza (V02) | Risultato (V04) | Dominio proprietario della verifica | Pattern |
|---|---|---|---|---|---|---|---|
| 1 | Identità della Persona | Persona (referenziata) | Identità & Accessi/Persone | — | Verificata/Non verificata | **Persone/Identità & Accessi — non Professionisti** | V01, riferimento a dominio esterno, per analogia con `imprese.md` §12 riga 3 |
| 2 | **Esistenza dell'eventuale organizzazione** | Impresa (referenziata) | — | — | (esito già prodotto da Imprese) | **Imprese — non Professionisti** | **Utilizzo** dell'esito già accertato, non Verifica propria: applicazione diretta del vincolo esplicito della richiesta ("Professionisti NON verifica autonomamente l'esistenza dell'Impresa. Utilizza esclusivamente l'esito prodotto dal dominio Imprese") e di `logical/professionisti.md` §11 come già corretto dalla revisione di conformità |
| 3 | Titolo professionale | TitoloProfessionale (VO, tramite QualificaProfessionale/IscrizioneProfessionale) | Ente che lo rilascia | Documento (facoltativo) | Non verificata/Autodichiarata/Verificata/Contestata | **Professionisti** | V01+V02+V03+V04 |
| 4 | **Iscrizione** | IscrizioneProfessionale | Ordine o Collegio | Documento/attestazione dell'ente | Come sopra | **Professionisti** | Come sopra |
| 5 | **Abilitazione** | Abilitazione | Ente o registro che la rilascia | Documento | Come sopra | **Professionisti** | Come sopra |
| 6 | **Qualifica** | QualificaProfessionale | Dichiarazione del Professionista o Evidenza specifica | Evidenza (facoltativa, richiesta per la sola verifica) | Come sopra | **Professionisti** | Come sopra |
| 7 | **Certificazione** | Certificazione | Ente certificatore | Documento | Come sopra | **Professionisti** | Come sopra |
| 8 | **Esperienza** | EsperienzaProfessionale (VO) | Referenze, documentazione, Fonti terze | Documento/referenza | Non verificata/Verificata | **Professionisti** | V01 applicato a un VO, pattern legittimo (`imprese.md` §12 riga 2) |
| 9 | Servizio dichiarato | ServizioProfessionale | Dichiarazione del Professionista, eventuale riscontro | — | Non verificata/Verificata | **Professionisti** | V01+V03 |
| 10 | Territorio servito | TerritorioServito | Dichiarazione, eventuale riscontro | — | Non verificata/Verificata | **Professionisti** | V01+V03 |
| 11 | Lingua operativa | LinguaOperativaProfessionale | Dichiarazione, eventuale certificazione linguistica | Documento (facoltativo) | Non verificata/Verificata | **Professionisti** | V01+V03 |
| 12 | **Relazione con Impresa o studio** | Appartenenza (referenziata) | — | — | (esito già prodotto da Appartenenze) | **Appartenenze — non Professionisti** | **Utilizzo**, non Verifica propria, coerente con D9/D12 e con il vincolo generale di non duplicare le verifiche altrui (PF2) |
| 13 | **Disponibilità** | Asse Disponibilità (§14.1) | Dichiarazione del Professionista | — | Non verificata/Verificata (aggiornata e reale) | **Professionisti** | V01+V03 |
| 14 | **Contatti professionali** | Canale di contatto dichiarato (§19) | Dichiarazione del Professionista | — | Non verificata/Verificata | **Professionisti** | V01+V03; distinta dalla verifica di identità/contatti di Persone (§19) |

**Conferma esplicita del vincolo mandatorio.** Le righe 2 e 12 sono le uniche, tra le quattordici, a non essere possedute da Professionisti: rappresentano rispettivamente l'utilizzo dell'esito di verifica di Imprese (esistenza dell'organizzazione) e di Appartenenze (relazione con l'organizzazione). Nessuna riga aggiuntiva introduce una verifica autonoma di un fatto altrui: questo soddisfa integralmente il vincolo "Professionisti NON verifica autonomamente l'esistenza dell'Impresa" del mandato.

**Nessun badge unico (PF10/PF11).** Nessuna delle quattordici righe è fusa in un esito complessivo; lo stato di verifica del Profilo (§14.1, S03) resta dichiarato come proiezione non autorevole, mai come fonte primaria di uno di questi quattordici aspetti.

**Fonti previste.** Ereditate da `logical/professionisti.md` §11: dichiarazione del Professionista, Ordine/Collegio, registro pubblico, università, ente certificatore, organizzazione professionale, Impresa, studio professionale, cliente, ente partner, redazione, fonte pubblica, documento ufficiale — pattern locale ripetuto (PC11), coerente con Fonte già trattata come Elenco controllato (**C03**, §12) e non come entità condivisa.

**PCa7 (conflitto tra fonte istituzionale e fonte privata).** Applicabile: quando una dichiarazione del Professionista (fonte privata) contraddice l'esito di un Ordine/Collegio (fonte istituzionale) sullo stesso aspetto (es. Iscrizione), il conflitto è trattato come Contestazione (§14.1, PCa1), non risolto automaticamente a favore di una delle due fonti — coerente con la seconda conferma indipendente di questo pattern già rilevata dalla Tesi (§12, PCa1) e con la sua origine in Appartenenze (`appartenenze.md` §15).

---

## 17. Visibilità

Applicando le sei forme (VIS01-06, `02-reference-model.md` §15) con la stessa gerarchia concettuale già confermata dai quattro mapping approvati.

| Forma | Applicazione a Profilo professionale | Note |
|---|---|---|
| **VIS01** Esistenza | Il Profilo esiste (come fatto di dominio) indipendentemente dalla sua Pubblicazione | Un Profilo in stato Bozza/Dichiarato esiste, anche se non ancora pubblicato |
| **VIS02** Accessibilità | Di competenza di Identità & Accessi | Nessuna decisione sostanziale è delegata a IA (PF13) |
| **VIS03** Consultabilità | Subordinata all'Accessibilità | — |
| **VIS04** Pubblicazione | Trattata al §18 | Condizione cumulativa (PF12) |
| **VIS05** Indicizzazione | Distinta dalla Consultabilità: un Profilo pubblicato può o non comparire nei risultati di ricerca per specifiche condizioni editoriali (es. qualità minima non ancora raggiunta) | Coerente con `imprese.md` §15 |
| **VIS06** Riservatezza | Alternativa esplicita e non residuale alla Pubblicazione | "Profilo privato", "Contatti riservati" (§12 del logico) sono scelte esplicite, non semplici assenze di pubblicazione |

**Livelli di visibilità del profilo, ereditati da `logical/professionisti.md` §12.** Profilo privato; visibile alla redazione; visibile a una rete; visibile a soggetti selezionati; pubblico; anonimo o parzialmente anonimo. Ciascuno è un valore dell'asse VIS03/VIS04 applicato al Profilo nel suo complesso, indipendente dalla visibilità di singole informazioni interne (Qualifica pubblica con Evidenza riservata, §14.2; Contatti riservati, §19).

**Principio di coerenza tra domini (vincolo ereditato, non negoziabile).** La visibilità di questo dominio non può eccedere quella di Persona, Impresa e Appartenenza sottostanti (`logical/professionisti.md` §12): un Profilo collegato a una Persona non pubblica non può essere pubblico; un'Organizzazione professionale non pubblica non può essere rivelata come collegata. Questo è un vincolo di composizione (VIS04 del Profilo dipende, tra le altre condizioni, dallo stato VIS04 dei domini referenziati), non un'incorporazione della loro visibilità.

---

## 18. Pubblicazione

**PF12 (condizione cumulativa) applicata al Profilo professionale.** Coerente con Persone (S02 completo + S01 attivo) e Imprese (sei condizioni cumulative), il Profilo professionale richiede il soddisfacimento simultaneo di più condizioni indipendenti, nessuna delle quali da sola autorizza la pubblicazione:

| Componente della condizione cumulativa | Applicazione a Profilo professionale |
|---|---|
| Volontà del soggetto | Implicita nella transizione S02 Bozza→Dichiarato, o nella dichiarazione della redazione (§13 del logico, caso "Profilo creato dalla redazione") con successiva rivendicazione |
| Stato editoriale compatibile | S02 = Dichiarato (§14.1) |
| Stato sostanziale compatibile | S01 ≠ stato terminale incompatibile con "attuale" (PC7); un Profilo Cessato/Revocato/Archiviato non è ripresentato come attualmente pubblicabile in quanto Attivo |
| Verifica | **Non richiesta come precondizione unica**: coerente con Imprese (§15), un Profilo può essere pubblicato anche con Qualifiche non ancora verificate, purché lo stato di verifica reale (parziale/assente) sia comunicato con precisione (§16), non occultato |
| Assenza di contestazione bloccante | Un Profilo Contestato (overlay, §14.1) può restare pubblicato con l'indicazione esplicita della contestazione (`logical/professionisti.md` §12, "Profilo contestato — visibile con un'indicazione esplicita") |
| Coerenza con la visibilità dei domini referenziati | §17, principio di coerenza tra domini |
| Assenza di sospensione | S01 ≠ Sospeso, oppure Sospensione con visibilità ridotta secondo policy (Profilo sospeso — "temporaneamente non visibile pubblicamente, in modo reversibile", §12 del logico) |

**Distinzione tra pubblicazione del Profilo e pubblicazione dei singoli elementi.** Una Qualifica può essere pubblica con Evidenza riservata (§14.2): la pubblicazione non è un interruttore unico per l'intero Aggregate, ma una condizione verificata sia al livello del Profilo sia, quando pertinente, al livello della singola Entity dipendente — coerente con PF12 applicato in modo composito, non con un singolo stato onnicomprensivo (PC8).

**Chi decide, chi applica (PF13).** La decisione sostanziale sulla pubblicabilità appartiene sempre a Professionisti (per il proprio Profilo) o alla Persona/redazione secondo il processo dichiarato; Identità & Accessi applica soltanto l'accesso tecnico conseguente, mai la decisione stessa.

---

## 19. Contatti professionali

Applicando puntualmente la distinzione richiesta dal mandato, coerente con la correzione già introdotta dalla revisione di conformità in `logical/professionisti.md` §11.

| Categoria di contatto | Natura | Dominio proprietario | Trattamento |
|---|---|---|---|
| **Contatti professionali propri** | Value Object incorporato nel Profilo professionale (o in ServizioProfessionale, quando specifico di un singolo servizio) | **Professionisti** | Un canale dedicato all'attività professionale, distinto da quello personale (es. un numero o un'email separati); giustificato come parte dell'offerta professionale (Tesi §8, Fatto 3), non come copia dei contatti personali |
| **Riferimenti ai contatti pubblici della Persona** | Riferimento esterno (R01/R02), non incorporazione | **Persone** | Quando il Professionista non dichiara alcun canale proprio, il Profilo può referenziare i soli contatti già resi pubblici da Persone, senza che Professionisti ne acquisisca la proprietà (vincolo esplicito già corretto in `logical/professionisti.md` §11) |
| **Contatti dell'Impresa** | Riferimento esterno facoltativo, tramite l'Organizzazione professionale (§13) | **Imprese** | Mai duplicati; se il Professionista opera tramite un'Impresa, i contatti di quest'ultima restano un fatto di Imprese, referenziabile ma non copiato |
| **Contatti intermediati dalla piattaforma** | **Non modellato da questo dominio** | Nessun dominio attuale | Coerente con l'esclusione esplicita della messaggistica privata (`logical/professionisti.md` §1, per analogia con `collaborazioni.md` §1); un eventuale canale di contatto mediato (es. un modulo di richiesta che non rivela l'indirizzo diretto) resta fuori dal perimetro di questo mapping, segnalato come questione aperta (§25) |

**Verifica dei contatti professionali.** Trattata come riga indipendente della tassonomia (§16, riga 14): distinta dalla verifica dell'identità della Persona (riga 1) e non sovrapposta ad essa.

**Divieto di duplicazione.** Nessun attributo di contatto personale (telefono, email di contatto, sito web, canali social) di Persone (`persone.md` §3, attributi della Persona) è copiato in una Entity di Professionisti: ogni riferimento è per identità, mai per struttura (PF2, PF5).

---

## 20. Eventi di dominio

Ereditati da `logical/professionisti.md` §14, qualificati con il pattern Evento (EV01-EV04) e verificati contro PF15 (fatto già avvenuto, mai un comando).

| Evento | Pattern | Aggregate/Entity coinvolta | Genera conseguenza dichiarata in altri domini? |
|---|---|---|---|
| `ProfessionistaDichiarato` | EV01 | Profilo professionale (creazione) | Non dichiarato esplicitamente |
| `ProfiloProfessionaleCreato` | EV01, EV02 | Profilo professionale | Non dichiarato |
| `ProfiloProfessionalePubblicato` | EV01, EV03 (osservabile) | Profilo professionale (S02/S04) | Sì — `domain-model.md` §6 lo elenca come rilevante per Opportunità, Collaborazioni, Osservatorio |
| `QualificaDichiarata` | EV01, EV02 | QualificaProfessionale | Non dichiarato |
| `QualificaVerificata` | EV01, EV02 | QualificaProfessionale (S03) | Non dichiarato |
| `QualificaContestata` | EV01, EV02 | QualificaProfessionale (overlay Contestazione) | Non dichiarato |
| `IscrizioneProfessionaleVerificata` | EV01, EV02 | IscrizioneProfessionale (S03) | Non dichiarato |
| `IscrizioneProfessionaleSospesa` | EV01, EV02 | IscrizioneProfessionale (S01) | Non dichiarato |
| `AbilitazioneVerificata` | EV01, EV02 | Abilitazione (S03) | Non dichiarato |
| `ServizioProfessionaleDichiarato` | EV01, EV02 | ServizioProfessionale | Sì, potenziale — un futuro dominio Servizi può "voler conoscere" questo evento senza diventarne proprietario (PC12) |
| `ServizioProfessionaleSospeso` | EV01, EV02 | ServizioProfessionale (S01) | Non dichiarato |
| `DisponibilitàProfessionaleModificata` | EV01, EV02 | Profilo professionale (asse Disponibilità, §14.1) | Non dichiarato |
| `OrganizzazioneProfessionaleAssociata` | EV01, EV02 | Profilo professionale (riferimento a Impresa) | Non dichiarato |
| `OrganizzazioneProfessionaleDisassociata` | EV01, EV02 | Profilo professionale | Non dichiarato |
| `TerritorioServitoModificato` | EV01, EV02 | TerritorioServito | Non dichiarato |
| `LinguaOperativaDichiarata` | EV01, EV02 | LinguaOperativaProfessionale | Non dichiarato |
| `LinguaOperativaVerificata` | EV01, EV02 | LinguaOperativaProfessionale (S03) | Non dichiarato |
| `ProfiloProfessionaleContestato` | EV01, EV02 | Profilo professionale (overlay Contestazione) | Non dichiarato |
| `ProfiloProfessionaleSospeso` | EV01, EV02 | Profilo professionale (S01) | Non dichiarato |
| `ProfiloProfessionaleCessato` | EV01, EV02 | Profilo professionale (S01, terminale) | Non dichiarato |
| `ProfiloProfessionaleArchiviato` | EV01, EV02, EV03 | Profilo professionale (S01/S08, terminale) | Non dichiarato |
| `VisibilitàProfessionistaModificata` | EV01, EV02 | Profilo professionale (VIS03-06) | Non dichiarato |

**Conferma PF15/PF16.** Ogni evento è nominato al participio passato, rappresenta un fatto già avvenuto, non un comando; nessun meccanismo tecnico di propagazione (coda, webhook, trigger) è descritto: questo documento garantisce solo che l'informazione necessaria a ricostruire ciascun evento (identità dell'Aggregate/Entity coinvolta, momento della transizione, valore raggiunto dell'asse pertinente) resti concettualmente disponibile a partire dai fatti persistenti già descritti (§9-§14).

**Ownership (PC12).** Ogni evento appartiene esclusivamente a Professionisti, anche quando un altro dominio (Servizi, Osservatorio, Opportunità, Collaborazioni) lo riceve come rilevante per la propria reazione: nessun evento elencato qui rappresenta un fatto posseduto da Persone, Imprese, Appartenenze o Mercati Internazionali.

---

## 21. Dipendenze

Applicando le sei classificazioni esaustive della Dependency Map (PF17), distinguendo dipendenze in uscita (di competenza di questo documento) da dipendenze in entrata (di competenza dei rispettivi mapping, richiamate per completezza).

### 21.1 Dipendenze in uscita (Professionisti dipende da...)

| # | Verso | Tipo | Riferimento | Utilizzo | Derivazione | Divieti | Stato dopo questo mapping |
|---|---|---|---|---|---|---|---|
| D10 | **Persone** | **Necessaria** | Identità della Persona (R01/PF5) | Ogni operazione sul Profilo presuppone l'identità stabile della Persona | Nessuna | Mai duplicare attributi di Persona; mai incorporare CompetenzaDichiarata/LinguaParlata (§7, §10) | **Consolidata** (confermata, nessuna modifica rispetto a `domain-dependency-map.md`) |
| D11 | **Imprese** | **Facoltativa** | Impresa/studio come Organizzazione professionale (R02) | Contesto organizzativo dichiarato, mai indispensabile | Nessuna | Mai incorporare sedi/certificazioni/canali di Imprese; mai una nuova Verifica autonoma dell'esistenza dell'Impresa (§16, riga 2) | **Consolidata** (confermata) |
| D12 | **Appartenenze** | **Facoltativa, di utilizzo** (non di riferimento sostanziale) | Esistenza e stato dell'Appartenenza | Utilizzo del solo esito (§16, riga 12), per contestualizzare l'offerta | Nessuna | Mai possedere né duplicare la relazione organizzativa; mai una Verifica autonoma della relazione | **Da Provvisoria a Consolidata**: questo mapping, completando l'analisi richiesta da `domain-dependency-map.md` regola 12 (§22), conferma la classificazione Facoltativa e ne precisa la natura come dipendenza di **utilizzo**, non di riferimento sostanziale — coerente con la definizione di "Utilizzo" della Dependency Map (apertura del documento) |
| D13 | **Mercati Internazionali** | **Facoltativa** | Mercato come Aggregate Root (R02) | "Mercati conosciuti/serviti", mai indispensabile | Nessuna | Mai creare una nuova Presenza/Interesse; mai incorporare la relazione di Mercati Internazionali | **Da Provvisoria a Consolidata**: confermata da questo mapping (MercatoInternazionaleServito, §10, resta una dichiarazione locale leggera, non una nuova istanza del concetto posseduto da quel dominio) |
| — | **Tassonomia condivisa** | **Necessaria** | Settore, Lingua, Competenza (VO03) | Classificazione delle dichiarazioni | Nessuna | Mai ridefinire localmente il significato di una voce condivisa | Consolidata, per analogia diretta con Persone/Imprese (§13 di questo documento) |
| — | **Territori** (condiviso) | **Necessaria** | Identificatori geografici (VO03) | TerritorioServito | Nessuna | Mai una tassonomia geografica parallela | Consolidata, per analogia con Imprese |
| — | **Identità & Accessi** | **Di supporto** | Applicazione dell'accesso alle proprie scritture | — | Nessuna | Mai delegare a IA la decisione sostanziale di visibilità (PF13) | Consolidata, pattern generale (D49) |

### 21.2 Osservazione: una dipendenza facoltativa in uscita non ancora censita dalla Dependency Map

`logical/professionisti.md` §7 dichiara che un Servizio professionale può essere "collegato a Opportunità" o "collegato a Collaborazioni" quando risponde a un'esigenza già emersa in quei domini, "referenziata senza incorporazione". La matrice canonica (`domain-dependency-map.md` §15) censisce oggi solo le direzioni inverse (D16 Opportunità→Professionisti, D21 Collaborazioni→Professionisti), non questa direzione facoltativa in uscita da ServizioProfessionale. Questo mapping segnala l'osservazione, coerentemente con la regola 9 di `domain-dependency-map.md` §22 ("segnalare eventuali divergenze... invece di risolverlo autonomamente e silenziosamente"), senza introdurla come riga consolidata: la conferma resta di competenza dei futuri `domain-mapping/opportunita.md` e `domain-mapping/collaborazioni.md`, secondo la stessa procedura già applicata a D12/D13 (§26).

### 21.3 Dipendenze in entrata (chi dipende da Professionisti) — informative, non ridescritte

| # | Dominio dipendente | Cosa referenzia | Categoria | Stato |
|---|---|---|---|---|
| D16 | Opportunità | Profilo professionale (qualificazione richiesta o destinataria) | Facoltativa | Consolidata (non modificata da questo documento) |
| D21 | Collaborazioni | Profilo professionale (qualificazione coinvolta) | Facoltativa | Provvisoria (di competenza del futuro `domain-mapping/collaborazioni.md`) |
| D26 | Eventi | Profilo professionale (relatori, formatori) | Facoltativa | Consolidata |
| D32 | Contenuti Editoriali | Profilo professionale (soggetto narrato) | Editoriale/rappresentativa | Provvisoria (di competenza del futuro `domain-mapping/contenuti-editoriali.md`) |
| D44 | Osservatorio | Fatti sorgente per indicatori di offerta professionale | Derivativa | Provvisoria (di competenza del futuro `domain-mapping/osservatorio.md`) |

**Perché questo documento non ridescrive queste relazioni.** Coerentemente con `03` §5 e con RC13, come già applicato identicamente da `domain-mapping/persone.md` §11.2 e `domain-mapping/imprese.md`: il documento di mapping di un dominio referenziato non ridescrive le regole di una relazione posseduta dal dominio dipendente.

### 21.4 Dipendenze vietate — verificate come assenti

Verificato secondo i quattro criteri di `01-principi-mapping.md` §14 (già applicati identicamente dai quattro mapping approvati): nessun dominio duplica un fatto di Professionisti; nessun dominio modifica un fatto di Professionisti; nessun dominio tecnico diventa proprietario di un fatto sostanziale di Professionisti; nessuna dipendenza circolare di proprietà coinvolge Professionisti. In particolare, coerentemente con V4 di `domain-dependency-map.md` §19 ("Imprese → Professionisti come componenti interne"): questo mapping non introduce alcuna Entity di Professionisti annidata in Imprese, né alcuna dipendenza inversa Imprese→Professionisti (§21.1 conferma l'assenza di ciclo, coerente con l'analisi già condotta in `domain-dependency-map.md` §20).

---

## 22. Invarianti

Ereditati e tradotti da `logical/professionisti.md` §13, con il pattern che li protegge.

| # | Invariante | Pattern che lo protegge |
|---|---|---|
| 1 | Ogni Profilo professionale deve essere collegato a una Persona esistente | D10 (Necessaria); PF5 |
| 2 | Il Profilo professionale non coincide con la Persona | PF7 (assi indipendenti) |
| 3 | Un Profilo può referenziare una o più Organizzazioni professionali | Cardinalità 0..N di riferimenti facoltativi (D11) |
| 4 | Un'Impresa può offrire ServizioImpresa senza coincidere con un Professionista | Tesi §8 Fatto 3; confini (§5) |
| 5 | Una Qualifica/Iscrizione/Abilitazione/Certificazione dichiarata non equivale a verificata | PF10, S03 autorevole distinto da D02 (§14.2, §16) |
| 6 | Un titolo verificato non garantisce qualità o affidabilità | §7 fatti esclusi ("Garanzia di qualità"); PF10/PF11 |
| 7 | Una disponibilità dichiarata non equivale ad accettazione dell'incarico | Asse Disponibilità distinto da ogni impegno contrattuale (§7 fatti esclusi) |
| 8 | Una tariffa indicativa non equivale a preventivo | VO01 TariffaIndicativa, mai un'Entity di impegno (§11) |
| 9 | Professionisti non attribuisce diritti di accesso | PF6, PF13 |
| 10 | La relazione con un'Impresa deriva sempre da Appartenenze, mai dalla sola dichiarazione in questo dominio | D12 (utilizzo, non riferimento sostanziale); §16 riga 12 |
| 11 | Un Profilo con stato terminale (Cessato/Revocato/Archiviato) non è mai presentato come attuale | PC7 |
| 12 | Nessuna Qualifica/Iscrizione/Abilitazione/Certificazione scaduta o revocata è eliminata dallo storico | PF8, S08/T07 |
| 13 | La piattaforma non garantisce l'esito della prestazione professionale | §7 fatti esclusi |
| 14 | Il dominio alimenta l'Osservatorio con dati aggregabili, senza produrre esso stesso report | D44 (derivativa, in uscita da Osservatorio, non un obbligo di Professionisti) |
| 15 (nuovo, da questo mapping) | Professionisti non conduce alcuna verifica autonoma dell'esistenza dell'Impresa referenziata: utilizza esclusivamente l'esito già prodotto da Imprese | §16, riga 2; vincolo esplicito del mandato |
| 16 (nuovo, da questo mapping) | La visibilità del Profilo professionale non può eccedere quella della Persona, dell'Impresa o dell'Appartenenza sottostanti | §17, principio di coerenza tra domini; PF12 |

---

## 23. Pattern applicati

Aggiornamento, a livello di Physical Domain Mapping, della verifica già condotta dalla Tesi al proprio §12 (che resta la fonte primaria di motivazione): questo documento la conferma senza modificarla, aggiungendo dove pertinente il riferimento al concetto fisico introdotto ai §8-§21.

| Codice | Esito confermato a livello fisico | Riferimento in questo documento |
|---|---|---|
| PF1 Single Owner | Confermata | Ogni concetto dei §8-§11 dichiara un solo dominio proprietario |
| PF2 Nessuna duplicazione | Confermata | §6-§7, §10, §19 |
| PF3 Traccia al logico | Confermata | Ogni riga di ogni tabella cita `logical/professionisti.md` o la Tesi |
| PF6 Identità business ≠ accesso | Confermata | §7, §21 |
| PF7 Assi indipendenti | Confermata ed estesa | §14, cinque-sei assi indipendenti, il numero più alto tra i domini oggi mappati |
| PF8 Continuità storica | Confermata | §14.2, §15, §22 invariante 12 |
| PF9 Cronologia ≠ audit tecnico | Applicata implicitamente | Nessun meccanismo di audit tecnico introdotto |
| PF10 Nessun badge generico | Confermata con enfasi | §16, quattordici assi nominati |
| PF11 Verifiche non fuse | Confermata | §14.1 (S03 come proiezione non autorevole), §16 |
| PF12 Condizione cumulativa | Confermata | §18 |
| PF13 IA applica, non decide | Confermata | §17, §18 |
| PF14 Ruolo ≠ privilegio | Confermata | §22 invariante 9 |
| PF15 Evento = fatto avvenuto | Confermata | §20 |
| PF16 Nessuna propagazione tecnica | Applicata | §20 |
| PF17 Sei classificazioni esaustive | Confermata | §21, tutte le dipendenze classificate |
| PF18 Ciclo apparente vs reale | Confermata, nessun ciclo reale riscontrato | §21.4 |
| PF19 Nessun nuovo dominio tassonomico | Confermata, con applicazione | §12: Categoria/Specializzazione/Modalità restano Elenco controllato locale (C03), non promosse a Tassonomia condivisa |
| PF20 Indisponibilità soggetto ≠ cancellazione | Applicata per analogia | §15; la cessazione della Persona non cancella lo storico del Profilo |
| PC1 Procedura in cinque domande | Applicata | §8, per tutti i sette concetti richiesti |
| PC2 Più Aggregate Root nello stesso dominio | **Non applicata in questo mapping** | §8-§9: nessuno dei sei concetti dipendenti soddisfa oggi il criterio di referenziabilità esterna individuale; resta questione aperta per un'eventuale evoluzione futura (§25) |
| PC3 Dichiarazione + catalogo = E02 | Applicata | §10 (CompetenzaProfessionale, TerritorioServito, LinguaOperativaProfessionale) |
| PC4 Vista di sintesi non normativa | Applicata | §14.1 (S03 del Profilo come proiezione non normativa dei quattordici assi di §16) |
| PC5/PC6 Criteri per un dominio relazionale | Usati per confermare l'esclusione di PF4 (§24) | — |
| PC7 Stato terminale incompatibile con attuale | Applicata | §9, §14.1, §18 |
| PC8 Segnale d'allarme sugli assi | Applicata | §14.1, verifica esplicita condotta |
| PC9 Assenza di Temporalità dichiarata | Applicata | §15 |
| PC10 Decorrenza obbligatoria, fine apribile | Applicata | §15 |
| PC11 Fonte come pattern locale | Applicata | §10, §16 |
| PC12 Evento: proprietà di chi genera | Applicata | §20 |
| PC13 Derivazione non trasferisce proprietà | Applicata | §13, §21 (dipendenza D44 in entrata da Osservatorio) |
| PC14 Elenco controllato vs Tassonomia condivisa | Applicata | §12 |
| PP1 Preferire Elenco controllato | Applicata | §12 |
| PP2 Separare Fonte, Evidenza, Verifica | Applicata | §10, §16 |
| PP3 Tripla citazione | Applicata | Ogni sezione |
| PP4 Dichiarare esplicitamente il non applicabile | Applicata | §14 (asse Disponibilità dichiarato esplicitamente), §24 (PF4/PF5) |
| PCa1 Contestazioni | **Seconda conferma indipendente, a livello fisico** | §14.1 (overlay Contestazione), §16 (PCa7); non promossa a Consolidata da questo documento (riservato a una futura revisione di `domain-patterns.md`) |
| PCa2 Organizzazioni istituzionali | Confermata come indizio coerente | §7, §13 (Impresa referenziata in assenza di quel dominio) |
| PCa4 Estensione di PF4 | Verificata con esito negativo per il nucleo | §24 |
| PCa6 DOC01-05 a supporto di una qualifica | Applicabile | §16 (Documento come una delle forme di Evidenza, V02) |
| PCa7 Conflitto fonte istituzionale/privata | Applicabile | §16 |
| PCa8 Più Aggregate Root come pattern ricorrente | Non confermata in questo dominio (§8-§9) | Resta pattern candidato per altri domini futuri (Opportunità, Eventi, Identità & Accessi), non per Professionisti |

---

## 24. Pattern non applicabili

**PF4 — Proprietà delle relazioni: non applicabile al nucleo del dominio.** Dimostrato dalla Tesi (§5, ipotesi H4; §6; §12) e confermato integralmente da questo mapping: Professionisti non possiede alcuna relazione bilaterale autonoma. Il fatto centrale del dominio — la qualificazione e l'offerta professionale di una Persona — è un insieme di fatti su un solo soggetto (la Persona, tramite il Profilo professionale), non una relazione tra due parti indipendenti. Le uniche relazioni bilaterali che toccano un Professionista (con un'Impresa/studio) sono possedute, per intero, da Appartenenze (D12, §21): Professionisti le utilizza, non le rappresenta.

**PF5 — Identità della relazione non deriva dai soggetti: non applicabile.** Corollario diretto della non applicabilità di PF4: non esistendo una relazione posseduta da questo dominio, non esiste un'identità di relazione da proteggere. L'identità stabile del Profilo professionale (§9) non è un'istanza di questa regola, ma dell'identità ordinaria di un Aggregate Root (§6 di `domain-patterns.md`).

**Verifica che nessun concetto interno nasconda relazioni improprie (richiesta esplicita del mandato).** Questo mapping ha verificato puntualmente ciascuno dei concetti introdotti ai §10-§11 contro il rischio di una relazione bilaterale mascherata da Entity:

| Concetto verificato | Nasconde una relazione impropria? | Motivazione |
|---|---|---|
| Organizzazione professionale (riferimento a Impresa) | No | È un riferimento esterno facoltativo (R02, §13), non un'Entity di Professionisti; la relazione bilaterale effettiva resta di Appartenenze |
| IscrizioneProfessionale (Ordine/Collegio) | No | L'Ordine/Collegio è trattato come Fonte (V03, un valore di un Elenco controllato, §12, §16), non come un soggetto autonomo referenziato in una relazione bilaterale; nessuna scheda propria dell'Ordine è introdotta (coerente con Tesi §9, esclusione delle "Organizzazioni professionali... come entità proprie") |
| ServizioProfessionale collegato a Opportunità/Collaborazioni | No | Riferimento facoltativo in uscita (R02, §21.2), non una relazione posseduta: il processo di incontro domanda/offerta resta, per intero, di Opportunità/Collaborazioni |
| MercatoInternazionaleServito | No | Riferimento facoltativo all'Aggregate Root Mercato (§13), non una nuova relazione di Presenza/Interesse, che resta interamente posseduta da Mercati Internazionali |

Nessuna eccezione è stata riscontrata: la non-applicabilità di PF4/PF5 è dichiarata esplicitamente (PP4), non omessa, e verificata contro ogni concetto introdotto da questo mapping, non solo asserita a livello di principio generale.

---

## 25. Questioni aperte

Ereditate da Tesi §14 e da `domain-dependency-map.md` §23 (DV7), integrate con le questioni specifiche di questo mandato. Nessuna è risolta da questo documento.

1. **Dominio Organizzazioni istituzionali.** Se e quando sarà formalizzato, la relazione Professionista↔Organizzazione (studio, Ordine, Collegio) dovrà essere riletta secondo quel dominio (Tesi §11, §14 punto 4); fino a quel momento, resta un riferimento non strutturato tramite Imprese/Appartenenze (§13, §24).
2. **Eventuale dominio Servizi.** Il confine tra ServizioProfessionale (descrittivo, §10) e una futura OffertaDiServizio strutturata resta aperto quanto alla forma esatta del collegamento (riferimento diretto, derivazione proposta, o nessun collegamento automatico) — nessuna anticipazione è introdotta da questo documento (Tesi §9, §14 punto 2; §7 di questo documento).
3. **Consolidamento dello stato Contestato (PCa1).** Questo mapping offre una terza conferma indipendente (dopo Appartenenze e la Tesi) della struttura di contestazione applicata a un elemento del Profilo (§14.1, §16, PCa7); la promozione da Candidata a Consolidata resta riservata a una futura revisione di `domain-patterns.md` (Tesi §14 punto 6).
4. **Possibile autonomia futura di Qualifica, Iscrizione e Abilitazione come Aggregate Root distinti.** Questo mapping le ha classificate come Entity dipendenti (§8-§10) sulla base dell'assenza, oggi documentata, di un bisogno di referenziabilità esterna individuale. Se un futuro dominio (Opportunità, Collaborazioni) dovesse richiedere di referenziare una specifica Iscrizione o Abilitazione (non solo il Profilo o una Categoria professionale), il criterio (b) del §8 cambierebbe esito e PC2 (più Aggregate Root nello stesso dominio, già applicato da Mercati Internazionali) diventerebbe applicabile: questa possibilità è riconosciuta esplicitamente, non decisa qui (Tesi §12, nota a PC2).
5. **Eventuale Tassonomia condivisa per Categoria/Specializzazione professionale.** Oggi Elenco controllato locale (C03, §12); una promozione a Tassonomia condivisa (C02) richiederebbe che un secondo dominio indipendente dichiari il bisogno di governarla autonomamente (PC14/PF19) — non riscontrato al momento di questo mapping.
6. **Grado di strutturazione della Temporalità delle qualifiche.** Se Qualifica/Iscrizione/Abilitazione/Certificazione richiedano, in una futura evoluzione, un proprio Periodo esplicito più strutturato (analogo a quello di Appartenenze) resta apertura di modellazione (§15; Tesi §14 punto 7).
7. **Codice di famiglia per l'asse Disponibilità.** Questo mapping ha introdotto un asse specifico del dominio non riconducibile ai codici S01-S08 già catalogati (§14.1); se questo meriti un proprio codice in una futura revisione di `02-reference-model.md` resta una decisione di governance trasversale, non di questo documento.
8. **Confine esatto tra CompetenzaDichiarata (Persone) e CompetenzaProfessionale (Professionisti), caso per caso.** Il criterio generale (contesto generico vs. specialistico verificabile) è stabilito (§7, §10); la soglia esatta resta una decisione applicativa futura (Tesi §14 punto 8).
9. **Confine esatto con Collaborazioni, Opportunità ed Eventi**, oltre agli indizi già registrati (D16, D21, D26; §21.2 di questo documento): richiede i rispettivi Physical Domain Mapping.
10. **Classificazione definitiva "Fondazionale limitato".** DV7 di `domain-dependency-map.md` §23 chiedeva una verifica a livello fisico: questo documento la conferma (§9, cardinalità e ciclo di vita indipendente pur senza esistenza autonoma), ma la sua eventuale consolidazione formale nel catalogo dei ruoli dei domini resta una decisione di `domain-dependency-map.md`, non di questo mapping (§26).

---

## 26. Impatti sulla Dependency Map

| Impatto | Descrizione | Azione richiesta |
|---|---|---|
| **D12 (Professionisti→Appartenenze)** | Da "Provvisoria — da confermare in `domain-mapping/professionisti.md`" a **confermata Facoltativa, di utilizzo** (§21.1) | Aggiornamento dello stato della riga in un futuro aggiornamento di `domain-dependency-map.md`, secondo la regola 12 di quel documento (§22): questo mapping fornisce la motivazione, non modifica direttamente la Dependency Map |
| **D13 (Professionisti→Mercati Internazionali)** | Da "Provvisoria — da confermare" a **confermata Facoltativa** (§21.1) | Come sopra |
| **DV7 (classificazione "Fondazionale limitato")** | Verificata a livello fisico (§9, §25 punto 10): il Profilo professionale ha cardinalità e ciclo di vita indipendenti (multi-asse) pur non esistendo senza una Persona — coerente con la motivazione già data da `domain-dependency-map.md` §4 | Nessuna modifica alla classificazione "Applicativo"/"Fondazionale limitato"; DV7 può essere considerata verificata da questo documento |
| **V4 (Imprese→Professionisti come componenti interne)** | Verificato come assente: nessuna Entity di Professionisti è annidata in Imprese, nessuna dipendenza inversa introdotta (§21.4, §24) | Nessuna azione; la dipendenza vietata resta confermata come tale |
| **Osservazione su una dipendenza facoltativa non censita (§21.2)** | ServizioProfessionale può referenziare facoltativamente Opportunità/Collaborazioni, direzione non presente nella matrice canonica oggi | Segnalata, non introdotta come riga consolidata; la decisione spetta ai futuri `domain-mapping/opportunita.md` e `domain-mapping/collaborazioni.md`, coerentemente con la regola 9 di `domain-dependency-map.md` §22 |
| **Nessuna nuova dipendenza necessaria non prevista** | Tutte le dipendenze in uscita di questo mapping (D10-D13, Tassonomia condivisa, Territori, Identità & Accessi) erano già previste da `domain-dependency-map.md` §7 | Nessuna azione (regola 10 di `domain-dependency-map.md` §22 non attivata) |

---

## 27. Checklist finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Coerenza con la Tesi (`professionisti-domain-thesis.md`) | Verificato — ogni responsabilità, fatto proprietario/escluso e confine di questo documento cita il paragrafo corrispondente della Tesi (§3-§7); nessuna conclusione della Tesi è stata ridiscussa |
| 2 | Coerenza con il Modello logico (`logical/professionisti.md`) | Verificato — ogni Entity, Value Object, stato, verifica ed evento di questo documento è riconducibile a un paragrafo esplicito del logico (§2 di questo documento, citazioni puntuali in ogni sezione) |
| 3 | Nessuna duplicazione di fatti di altri domini | Verificato — §6-§7, §10, §19, §24 |
| 4 | Nessuna implementazione tecnica eseguibile introdotta | Verificato per §1–§28 (mapping concettuale). Il §29 introduce esclusivamente il contratto DDL-ready documentale (come Mercati Internazionali §35): nessuna migration, nessun SQL applicato, nessun database modificato |
| 5 | Distinzione chiara tra proprietà, riferimenti e dipendenze | Verificato — §6 (proprietà), §13 (riferimenti esterni), §21 (dipendenze), ciascuna con dominio proprietario esplicito |
| 6 | Stati, verifiche, pubblicazione e visibilità mantenuti separati | Verificato — §14 (stati, multi-asse), §16 (quattordici verifiche indipendenti), §17 (visibilità, VIS01-06), §18 (pubblicazione, condizione cumulativa); nessuna fusione in un unico valore |
| 7 | Ogni Aggregate e ogni scelta architetturale motivata | Verificato — §8 (procedura in cinque domande per tutti e sette i concetti richiesti), §9-§11 (motivazione per ciascuna Entity/VO), §23-§24 (verifica sistematica dei pattern) |
| 8 | Vincolo mandatorio su Imprese non verificato autonomamente | Verificato — §16, riga 2; §22, invariante 15 |
| 9 | PF4/PF5 dichiarati esplicitamente non applicabili, non omessi | Verificato — §24, con verifica puntuale contro ogni concetto interno |
| 10 | Nessuna decisione anticipata sui domini non ancora progettati | Verificato — §25, ogni questione aperta è segnalata come tale, non risolta |
| 11 | Nessun altro documento modificato | Verificato — questo documento non ha proposto né applicato alcuna modifica a `domain-model.md`, `platform-data-specification.md`, `domain-patterns.md`, `professionisti-domain-thesis.md`, `logical/professionisti.md`, `domain-dependency-map.md` o ai quattro Physical Domain Mapping già approvati |

---

## 28. Riepilogo conclusivo

**File creato.** `docs/architecture/physical/domain-mapping/professionisti.md`.

**Documenti letti integralmente.** `costituzione-piattaforma.md`, `domain-model.md`, `platform-data-specification.md`, `domain-patterns.md`, `professionisti-domain-thesis.md`, `logical/professionisti.md`, `logical/persone.md`, `logical/imprese.md`, `logical/appartenenze.md`, `logical/mercati-internazionali.md`, `domain-dependency-map.md`, `domain-mapping/persone.md`, `domain-mapping/imprese.md`, `domain-mapping/appartenenze.md`, `domain-mapping/mercati-internazionali.md` (§2).

**Aggregate individuati.** Un solo Aggregate Root: **Profilo professionale** (A01), sempre ancorato a una Persona, al massimo uno per Persona. Sei concetti dipendenti di natura Entity (E02): QualificaProfessionale, IscrizioneProfessionale, Abilitazione (con Autorizzazione come sotto-tipo), Certificazione, ServizioProfessionale, IscrizioneAssociativa, CompetenzaProfessionale, TerritorioServito, LinguaOperativaProfessionale, MercatoInternazionaleServito, Fonte, Evidenza. Due concetti di natura Value Object (VO01): TitoloProfessionale, EsperienzaProfessionale (oltre a Disponibilità, TariffaIndicativa, ModalitàDiEsercizio e agli attributi minori, §11).

**Principali decisioni.**
1. Qualifica, Iscrizione, Abilitazione, Certificazione sono Entity dipendenti (E02), non Aggregate Root autonomi: nessuna di esse richiede oggi referenziabilità esterna individuale (§8).
2. Autorizzazione è trattata come sotto-tipo di Abilitazione (Tipo, C05), non come settima Entity, per analogia diretta con la strategia già applicata da CertificazioneImpresa in Imprese.
3. Esperienza professionale resta Value Object (VO01), pur restando oggetto di una propria riga di verifica indipendente (§16, riga 8), pattern già legittimato da Imprese.
4. Il Profilo professionale applica cinque-sei assi di stato indipendenti (editoriale, verifica come proiezione non autorevole, professionale reale, disponibilità come asse specifico del dominio, pubblicazione/visibilità), il numero più alto tra i domini oggi mappati, dichiarato esplicitamente (PP4) invece di essere forzato nei codici già catalogati.
5. Professionisti non verifica autonomamente l'esistenza dell'Impresa referenziata né la relazione con essa: utilizza esclusivamente gli esiti già prodotti da Imprese e Appartenenze (§16, righe 2 e 12) — vincolo mandatorio soddisfatto esplicitamente.
6. Le dipendenze D12 (→Appartenenze) e D13 (→Mercati Internazionali), oggi "Provvisoria" nella Dependency Map, sono confermate da questo mapping come Facoltative (§21, §26).

**Pattern applicati.** L'insieme completo delle regole fondazionali (PF1-PF3, PF6-PF20), consolidate (PC1, PC3-PC14) e preferenziali (PP1-PP4) di `domain-patterns.md`, verificate puntualmente contro i concetti fisici di questo mapping (§23); pattern candidati pertinenti (PCa1, PCa2, PCa4, PCa6, PCa7) applicati o segnalati per una futura conferma (§23, §25).

**Pattern non applicabili.** PF4 (proprietà delle relazioni) e PF5 (identità della relazione) sono dichiarati esplicitamente non applicabili al nucleo del dominio, con verifica puntuale che nessun concetto interno introdotto da questo mapping nasconda una relazione bilaterale impropria (§24).

**Questioni aperte.** Dieci punti (§25), tra cui il futuro dominio Organizzazioni istituzionali, l'eventuale dominio Servizi, il consolidamento del pattern di contestazione (PCa1), la possibile autonomia futura di Qualifica/Iscrizione/Abilitazione come Aggregate Root distinti, e l'eventuale codice di famiglia per l'asse Disponibilità — nessuna risolta da questo documento.

**Impatti sulla Dependency Map.** Conferma di D12 e D13 da "Provvisoria" a "Facoltativa confermata"; verifica positiva di DV7 (classificazione "Fondazionale limitato"); conferma dell'assenza della dipendenza vietata V4; segnalazione di una dipendenza facoltativa in uscita (ServizioProfessionale→Opportunità/Collaborazioni) non ancora censita dalla matrice canonica, riservata ai rispettivi futuri mapping (§26).

**Conferma finale.** Nessun altro documento è stato modificato: `domain-model.md`, `platform-data-specification.md`, `domain-patterns.md`, `professionisti-domain-thesis.md`, `logical/professionisti.md`, `domain-dependency-map.md` e i quattro Physical Domain Mapping già approvati restano inalterati. Il mapping concettuale (§1–§28) resta il riferimento di significato; il **§29** chiude i contratti DDL-ready del ciclo 1 e abilita la redazione del Migration Plan senza inventare schema.

---

## 29. Contratto fisico DDL-ready — ciclo 1

**Scopo.** Chiudere le ambiguità di schema necessarie al futuro Migration Plan Professionisti. Non è SQL eseguibile. Non è il Migration Plan. Non assegna codici M1.x definitivi.

**Autorità collegata.** Thesis (`professionisti-domain-thesis.md`), Logical (`logical/professionisti.md`), mapping concettuale §1–§28, Dependency Map D10–D13, Domain Patterns, modello di profondità Mercati Internazionali §35 (forma del contratto, non soggetto XOR né schema FEV copiato).

**Pattern RLS/privilegi (tutte le tabelle §29).** `ENABLE ROW LEVEL SECURITY`; nessun `FORCE ROW LEVEL SECURITY`; nessuna policy applicativa nelle migration strutturali; deny-by-default; `REVOKE ALL` da `PUBLIC`, `anon`, `authenticated`; nessun `GRANT` a `anon`/`authenticated`; nessun `auth.uid()`; `service_role` non privato dei privilegi di bypass RLS già propri del ruolo Supabase. Eccezione cataloghi: vedi §29.25–§29.26.

**Pattern timestamps.** `created_at` / `updated_at` timestamptz NOT NULL DEFAULT now(); funzione `set_<table>_updated_at` dedicata per tabella (`SECURITY INVOKER`, `SET search_path = ''`); un solo trigger locale `BEFORE UPDATE` `*_set_updated_at`. Nomi identificatori ≤ 63 byte (abbreviazioni `prof_` ammesse se necessario).

**Pattern soggetto.** Sempre Persona. Nessun `subject_kind`. Nessun XOR Persona/Impresa. Nessun soggetto polimorfico. Impresa solo come contesto opzionale (§29.8).

**Dipendenze esterne reali verificate nel repository (ciclo 1).** `public.profiles`, `public.businesses`, `public.business_memberships` (esistente ma **non** referenziato strutturalmente nel ciclo 1), `public.languages`, `public.competencies`, `public.business_sectors`, `public.international_markets`. Assente: tabella Territori / `countries`.

**Elementi esclusi dal ciclo 1 (tutte le tabelle).** FK a `auth.users`; policy VIS02; Storage/file upload; history table generica; badge/score/ranking; seed demo; OffertaDiServizio; catalogo Ordini/Collegi; soggetto Impresa; PresenzaDiMercato / InteresseDiMercato; FK Opportunità/Collaborazioni/Eventi; dominio Organizzazioni istituzionali; dominio Servizi.

---

### 29.1 Perimetro e decisioni del ciclo 1

| Classificazione | Elementi |
|---|---|
| **Incluso (tabelle)** | Profilo professionale; categorie (catalogo + dichiarazione); modalità di esercizio (catalogo); natura servizio (catalogo); tipi fonte (catalogo); qualifiche; iscrizioni professionali; abilitazioni (con sotto-tipo autorizzazione); certificazioni; iscrizioni associative; competenze professionali; servizi dichiarati; territori serviti; lingue operative; mercati internazionali serviti; settori serviti; fonti/evidenze/verifiche di profilo |
| **Colonna / VO sul Profilo** | Titolo professionale (sulle credenziali); esperienza (anni + sintesi); disponibilità; tariffa indicativa; contatti professionali minimi; modalità di esercizio primaria; contesto Impresa opzionale |
| **Catalogo C03** | Categorie; modalità di esercizio; tipi fonte; nature servizio |
| **Riferimento opaco** | Territori (`country_ref`); enti emittenti (label testuale); Ordini/Collegi (label, non catalogo) |
| **Rinviato** | Catalogo Specializzazioni; FK `membership_id`; canali di contatto strutturati multipli; Storage evidenze; history table; policy RLS applicative; seed Specializzazioni; settori come tassonomia diversa da `business_sectors`; tariffe strutturate da marketplace; reputazione; equivalenza Italia come workflow |
| **Escluso dal dominio** | Anagrafica Persona; ServizioImpresa; OffertaDiServizio; Presenza/Interesse/Attività internazionale; contratti/pagamenti/prenotazioni; Ordini come Aggregate Root |

**Autosufficienza.** Al termine del ciclo 1 è possibile: creare al massimo un Profilo per Persona; dichiarare categorie, credenziali, servizi, territori, lingue, mercati, settori; mantenere stati multi-asse distinti; registrare fonti/evidenze/verifiche per aspetti di profilo; preparare pubblicazione senza policy applicative. Non è ancora un marketplace né un albo digitale ufficiale.

---

### 29.2 Inventario esatto delle tabelle

| # | Nome logico | Nome fisico | Responsabilità | Classificazione | Owner | Dipendenze | Blocco suggerito |
|---|---|---|---|---|---|---|---|
| 1 | Categoria professionale | `public.professional_categories` | Catalogo C03 categorie | C03 | — | nessuna | B1 |
| 2 | Modalità di esercizio | `public.professional_practice_modes` | Catalogo C03 modalità | C03 | — | nessuna | B1 |
| 3 | Tipo di fonte | `public.professional_source_kinds` | Catalogo C03 tipi fonte | C03 | — | nessuna | B1 |
| 4 | Natura servizio | `public.professional_service_natures` | Catalogo C03 nature | C03 | — | nessuna | B1 |
| 5 | Profilo professionale | `public.professional_profiles` | Aggregate Root | A01 | — | `profiles`; opz. `businesses`; `professional_practice_modes` | B2 |
| 6 | Dichiarazione categoria | `public.professional_profile_categories` | Categorie del profilo + specializzazione testuale | link/E02 | Profilo | profilo; categories | B3 |
| 7 | Qualifica professionale | `public.professional_qualifications` | Qualifica / titolo di studio / qualifica dichiarata | E02 | Profilo | profilo | B3 |
| 8 | Iscrizione professionale | `public.professional_registrations` | Iscrizione Ordine/Collegio/registro | E02 | Profilo | profilo | B3 |
| 9 | Abilitazione | `public.professional_authorizations` | Abilitazione o autorizzazione specifica | E02 | Profilo | profilo | B3 |
| 10 | Certificazione | `public.professional_certifications` | Certificazione ente terzo | E02 | Profilo | profilo | B3 |
| 11 | Iscrizione associativa | `public.professional_association_memberships` | Adesione associativa non statutaria | E02 | Profilo | profilo | B3 |
| 12 | Competenza professionale | `public.professional_competencies` | Competenza specialistica dichiarata | E02 | Profilo | profilo; `competencies` | B3 |
| 13 | Servizio professionale | `public.professional_services` | Dichiarazione descrittiva di servizio | E02 | Profilo | profilo; service_natures | B3 |
| 14 | Territorio servito | `public.professional_served_territories` | Dichiarazione territorio | E02 | Profilo | profilo | B3 |
| 15 | Lingua operativa | `public.professional_operational_languages` | Lingua operativa professionale | E02 | Profilo | profilo; `languages` | B3 |
| 16 | Mercato servito | `public.professional_served_markets` | Mercato internazionale dichiarato | E02 / link | Profilo | profilo; `international_markets` | B3 |
| 17 | Settore servito | `public.professional_served_sectors` | Settore economico dichiarato | E02 / link | Profilo | profilo; `business_sectors` | B3 |
| 18 | Fonte di profilo | `public.professional_profile_sources` | Fonte (FEV) | FEV | Profilo | profilo; source_kinds | B4 |
| 19 | Evidenza di profilo | `public.professional_profile_evidences` | Evidenza (FEV) | FEV | Profilo | profilo; sources | B4 |
| 20 | Verifica di profilo | `public.professional_profile_verifications` | Verifica per aspetto (FEV) | FEV | Profilo | profilo | B4 |

**Tabelle / cataloghi esplicitamente non create nel ciclo 1.** `professional_specializations` (catalogo); tabelle FEV per-credenziale; `professional_contacts`; tabelle Ordini; qualsiasi tabella `professional_*_history`.

---

### 29.3 Contratto completo delle colonne

#### 29.3.1 `public.professional_categories`

| Ord. | Colonna | Tipo | Null | Default | Significato | Origine | Mutabilità | Vocabolario / FK |
|---|---|---|---|---|---|---|---|---|
| 1 | `code` | text | NO | — | Codice stabile categoria | seed/governance | immutabile dopo seed | PK |
| 2 | `label_it` | text | NO | — | Etichetta IT | seed/governance | aggiornabile | — |
| 3 | `group_code` | text | NO | — | Gruppo logico §5 | seed | aggiornabile | vedi CHECK gruppi |
| 4 | `description` | text | SÌ | NULL | Descrizione | governance | aggiornabile | — |
| 5 | `sort_order` | int | NO | 100 | Ordinamento | governance | aggiornabile | ≥ 0 |
| 6 | `is_active` | boolean | NO | true | Attivazione catalogo | governance | aggiornabile | — |
| 7–8 | `created_at` / `updated_at` | timestamptz | NO | now() | Audit tecnico | sistema | sistema | — |

#### 29.3.2 `public.professional_practice_modes`

| Ord. | Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|---|
| 1 | `code` | text | NO | — | PK codice modalità |
| 2 | `label_it` | text | NO | — | Etichetta IT |
| 3 | `sort_order` | int | NO | 100 | Ordinamento (≥ 0) |
| 4 | `is_active` | boolean | NO | true | Attivazione |
| 5–6 | timestamps | timestamptz | NO | now() | Sistema |

#### 29.3.3 `public.professional_source_kinds`

Stessa struttura di `professional_practice_modes` (`code`, `label_it`, `sort_order`, `is_active`, timestamps).

#### 29.3.4 `public.professional_service_natures`

Stessa struttura di `professional_practice_modes`.

#### 29.3.5 `public.professional_profiles` (AR)

| Ord. | Colonna | Tipo | Null | Default | Significato | Origine | Mutabilità | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` | PK surrogata | sistema | immutabile | — |
| 2 | `person_id` | uuid | NO | — | Persona proprietaria | Persone | immutabile | FK `profiles(id)` UNIQUE |
| 3 | `headline` | text | SÌ | NULL | Sintesi professionale corta | dichiarazione | aggiornabile | non bio Persona |
| 4 | `summary` | text | SÌ | NULL | Presentazione professionale | dichiarazione | aggiornabile | ≠ `profiles.bio` |
| 5 | `practice_mode_code` | text | SÌ | NULL | Modalità primaria | catalogo | aggiornabile | FK practice_modes |
| 6 | `context_business_id` | uuid | SÌ | NULL | Contesto organizzativo opzionale | dichiarazione | aggiornabile | FK businesses; **non** membership |
| 7 | `editorial_status` | text | NO | `'draft'` | S02 | dominio | aggiornabile | §29.19 |
| 8 | `professional_status` | text | NO | `'active'` | S01 sostanziale | dominio | aggiornabile | §29.19 |
| 9 | `administrative_origin` | text | SÌ | NULL | Qualifica S07 | dominio | aggiornabile | nullable se non sospeso/cessato |
| 10 | `publication_status` | text | NO | `'unpublished'` | S04 | dominio | aggiornabile | §29.19 |
| 11 | `visibility_status` | text | NO | `'private'` | VIS | dominio | aggiornabile | §29.19 |
| 12 | `availability_status` | text | NO | `'available'` | Asse disponibilità | dichiarazione | aggiornabile | §29.16 |
| 13 | `availability_note` | text | SÌ | NULL | Nota disponibilità | dichiarazione | aggiornabile | — |
| 14 | `availability_until` | date | SÌ | NULL | Orizzonte se futura | dichiarazione | aggiornabile | §29.20 |
| 15 | `is_contested` | boolean | NO | false | Overlay contestazione | dominio/moderazione | aggiornabile | non è S03 |
| 16 | `experience_years` | numeric(5,1) | SÌ | NULL | Anni esperienza (VO) | dichiarazione | aggiornabile | ≥ 0 |
| 17 | `experience_summary` | text | SÌ | NULL | Sintesi esperienza | dichiarazione | aggiornabile | — |
| 18 | `fee_indication_kind` | text | NO | `'none'` | Natura indicazione economica | dichiarazione | aggiornabile | §29.17 |
| 19 | `fee_currency` | text | SÌ | NULL | ISO 4217 | dichiarazione | aggiornabile | len 3 se presente |
| 20 | `fee_amount_min` | numeric(12,2) | SÌ | NULL | Estremo inferiore indicativo | dichiarazione | aggiornabile | ≥ 0 |
| 21 | `fee_amount_max` | numeric(12,2) | SÌ | NULL | Estremo superiore | dichiarazione | aggiornabile | ≥ min |
| 22 | `fee_note` | text | SÌ | NULL | Testo libero indicativo | dichiarazione | aggiornabile | non preventivo |
| 23 | `fee_visibility` | text | NO | `'private'` | Visibilità tariffa | dichiarazione | aggiornabile | `private`\|`public` |
| 24 | `professional_email` | text | SÌ | NULL | Contatto professionale | dichiarazione | aggiornabile | ≠ contatti Persona obbligatori |
| 25 | `professional_phone` | text | SÌ | NULL | Contatto professionale | dichiarazione | aggiornabile | — |
| 26 | `contacts_visibility` | text | NO | `'private'` | Visibilità contatti | dichiarazione | aggiornabile | `private`\|`public`\|`on_request` |
| 27–28 | timestamps | timestamptz | NO | now() | Sistema | sistema | sistema | — |

**Divieto esplicito sul Profilo.** Nessuna colonna `first_name`, `last_name`, `bio` anagrafica, `spoken_language` generica, score, badge, `verification_status` complessivo persistito.

#### 29.3.6 `public.professional_profile_categories`

| Ord. | Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|---|
| 1 | `id` | uuid | NO | `gen_random_uuid()` | PK |
| 2 | `professional_profile_id` | uuid | NO | — | Owner |
| 3 | `category_code` | text | NO | — | FK categories |
| 4 | `specialization_label` | text | SÌ | NULL | Specializzazione ciclo 1 (testo; catalogo rinviato) |
| 5 | `is_primary` | boolean | NO | false | Categoria primaria |
| 6 | `sort_order` | int | NO | 0 | Ordinamento (≥ 0) |
| 7 | `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| 8–9 | timestamps | timestamptz | NO | now() | Sistema |

#### 29.3.7 Credenziali — colonne comuni e specifiche

**Comuni a** `professional_qualifications`, `professional_registrations`, `professional_authorizations`, `professional_certifications`:

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `denomination` | text | NO | — | Denominazione / titolo dichiarato |
| `issuer_label` | text | SÌ | NULL | Ente emittente descrittivo (opaco; non catalogo Ordini) |
| `external_identifier` | text | SÌ | NULL | Numero iscrizione / codice esterno |
| `issued_on` | date | SÌ | NULL | Data rilascio |
| `valid_from` | date | SÌ | NULL | Decorrenza effetti |
| `valid_until` | date | SÌ | NULL | Scadenza; NULL = senza termine noto |
| `credential_status` | text | NO | (per tabella) | S01 specifico |
| `verification_status` | text | NO | `'unverified'` | S03 autorevole della riga |
| `visibility_status` | text | NO | `'private'` | Visibilità dichiarazione |
| `evidence_visibility` | text | NO | `'private'` | Visibilità evidenze collegate |
| `origin_kind` | text | NO | `'national'` | `national`\|`foreign` |
| `equivalence_status` | text | SÌ | NULL | Solo se foreign: `not_required`\|`in_progress`\|`obtained`\|`denied` |
| `notes` | text | SÌ | NULL | Nota |
| `sort_order` | int | NO | 0 | Ordinamento |
| timestamps | timestamptz | NO | now() | Sistema |

**Specifiche:**

| Tabella | Extra | Default `credential_status` | Valori `credential_status` |
|---|---|---|---|
| `professional_qualifications` | `qualification_kind` text NOT NULL ∈ `study_title`\|`professional_title`\|`declared_qualification` | `'declared'` | `declared`\|`expired`\|`withdrawn` |
| `professional_registrations` | `register_body_label` text NOT NULL (Ordine/Collegio/registro) | `'active'` | `active`\|`suspended`\|`inactive` |
| `professional_authorizations` | `authorization_kind` text NOT NULL ∈ `general`\|`specific` | `'active'` | `active`\|`suspended`\|`revoked`\|`expired` |
| `professional_certifications` | `certifier_label` text SÌ | `'declared'` | `declared`\|`expired`\|`revoked`\|`withdrawn` |

#### 29.3.8 `public.professional_association_memberships`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `association_label` | text | NO | — | Associazione (opaco) |
| `role_label` | text | SÌ | NULL | Ruolo eventuale |
| `joined_on` | date | SÌ | NULL | Decorrenza |
| `ended_on` | date | SÌ | NULL | Fine |
| `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| `visibility_status` | text | NO | `'private'` | — |
| timestamps | — | NO | now() | Sistema |

Nessun asse di verifica dedicato (Logical §11 / Physical §14.4).

#### 29.3.9 `public.professional_competencies`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `competency_id` | bigint | NO | — | FK `competencies(id)` |
| `level_code` | text | SÌ | NULL | `basic`\|`intermediate`\|`advanced`\|`expert` |
| `years_experience` | numeric(5,1) | SÌ | NULL | ≥ 0 |
| `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| `verification_status` | text | NO | `'unverified'` | `unverified`\|`verified`\|`contested` |
| `sort_order` | int | NO | 0 | — |
| `notes` | text | SÌ | NULL | — |
| timestamps | — | NO | now() | — |

#### 29.3.10 `public.professional_services`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `title` | text | NO | — | Titolo dichiarazione |
| `description` | text | SÌ | NULL | Descrizione |
| `service_nature_code` | text | NO | — | FK service_natures |
| `audience_kind` | text | NO | `'both'` | `persons`\|`businesses`\|`both` |
| `delivery_mode` | text | NO | `'unspecified'` | `in_person`\|`remote`\|`hybrid`\|`unspecified` |
| `is_standardized` | boolean | NO | false | Standard vs personalizzato |
| `service_status` | text | NO | `'declared'` | §29.19 |
| `visibility_status` | text | NO | `'private'` | — |
| `availability_status` | text | SÌ | NULL | Override locale; NULL = eredita profilo |
| `fee_indication_kind` | text | NO | `'none'` | Come profilo |
| `fee_note` | text | SÌ | NULL | Indicativo |
| `sort_order` | int | NO | 0 | — |
| timestamps | — | NO | now() | — |

**Esclusi.** `price`, checkout, booking, contract_id, SLA, payment_*.

#### 29.3.11 `public.professional_served_territories`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `country_ref` | text | NO | — | Riferimento paese opaco (convenzione piattaforma; tipicamente ISO 3166-1 alpha-2) |
| `territory_label` | text | SÌ | NULL | Etichetta descrittiva (regione/area) |
| `coverage_kind` | text | NO | `'served'` | `exercise`\|`served`\|`both` |
| `presence_mode` | text | NO | `'unspecified'` | `in_person`\|`remote`\|`hybrid`\|`unspecified` |
| `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| `verification_status` | text | NO | `'unverified'` | `unverified`\|`verified`\|`contested` |
| `sort_order` | int | NO | 0 | — |
| timestamps | — | NO | now() | — |

Nessuna FK a tabella Territori (inesistente).

#### 29.3.12 `public.professional_operational_languages`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `language_id` | bigint | NO | — | FK `languages(id)` |
| `proficiency_level` | text | NO | `'working'` | `elementary`\|`working`\|`professional`\|`native_equivalent` |
| `usage_role` | text | NO | `'operational'` | `operational`\|`support` |
| `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| `verification_status` | text | NO | `'unverified'` | `unverified`\|`verified`\|`contested` |
| `sort_order` | int | NO | 0 | — |
| timestamps | — | NO | now() | — |

Distinta da `profile_languages` (LinguaParlata Persone) e da `business_operational_language_declarations`.

#### 29.3.13 `public.professional_served_markets`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `market_id` | uuid | NO | — | FK `international_markets(id)` |
| `relation_kind` | text | NO | `'served'` | `known`\|`served`\|`supported` |
| `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| `notes` | text | SÌ | NULL | — |
| `sort_order` | int | NO | 0 | — |
| timestamps | — | NO | now() | — |

Non crea PresenzaDiMercato né InteresseDiMercato. Nessuna verifica dedicata nel ciclo 1 (Physical §14.4).

#### 29.3.14 `public.professional_served_sectors`

| Colonna | Tipo | Null | Default | Significato |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `professional_profile_id` | uuid | NO | — | Owner |
| `sector_id` | bigint | NO | — | FK `business_sectors(id)` |
| `declaration_status` | text | NO | `'declared'` | `declared`\|`removed` |
| `sort_order` | int | NO | 0 | — |
| timestamps | — | NO | now() | — |

#### 29.3.15 FEV profilo

**`professional_profile_sources`:** `id` uuid PK; `professional_profile_id` uuid NOT NULL; `source_kind_code` text NOT NULL → source_kinds; `reference_label` text NULL; `reliability_note` text NULL; `declared_at` timestamptz NULL; timestamps.

**`professional_profile_evidences`:** `id` uuid PK; `professional_profile_id` uuid NOT NULL; `source_id` uuid NULL → sources; `supported_aspect` text NOT NULL (stesso vocabolario verifiche); `summary` text NOT NULL; `observed_at` timestamptz NULL; timestamps. Nessun `storage_path` nel ciclo 1.

**`professional_profile_verifications`:** `id` uuid PK; `professional_profile_id` uuid NOT NULL; `aspect` text NOT NULL; `status` text NOT NULL DEFAULT `'unverified'`; `verified_at` timestamptz NULL; `verifier_label` text NULL; `outcome_note` text NULL; `expires_at` timestamptz NULL; timestamps. Current-state: UNIQUE `(professional_profile_id, aspect)`.

---

### 29.4 Primary key e identificazione

| Tabella | PK | Generazione | Chiave naturale | Divieti |
|---|---|---|---|---|
| Cataloghi C03 | `code` text | seed/governance | `code` | Label non è identità |
| `professional_profiles` | `id` uuid | `gen_random_uuid()` | `person_id` (UNIQUE) | Label/headline non identità |
| Tutte le E02/FEV | `id` uuid | `gen_random_uuid()` | nessuna label | `denomination` / `title` non UNIQUE globale |
| Link lingue/competenze/settori/mercati | `id` uuid | `gen_random_uuid()` | unicità dichiarata (vedi UNIQUE) | — |

Identificatori esterni (`external_identifier`) sono attributi, non PK.

---

### 29.5 Unique constraints

| Tabella | Vincolo | NULL / parziale | Motivo |
|---|---|---|---|
| `professional_profiles` | UNIQUE (`person_id`) | `person_id` NOT NULL | **Al massimo un Profilo per Persona** |
| Cataloghi | UNIQUE implicita su PK `code` | — | Codice stabile |
| `professional_profile_categories` | UNIQUE parziale (`professional_profile_id`, `category_code`) WHERE `declaration_status='declared'` | parziale | Una dichiarazione attiva per categoria |
| `professional_profile_categories` | UNIQUE parziale (`professional_profile_id`) WHERE `is_primary=true` AND `declaration_status='declared'` | parziale | Al più una categoria primaria |
| `professional_competencies` | UNIQUE parziale (`professional_profile_id`, `competency_id`) WHERE `declaration_status='declared'` | parziale | Nessuna doppia dichiarazione attiva |
| `professional_operational_languages` | UNIQUE parziale (`professional_profile_id`, `language_id`, `usage_role`) WHERE `declaration_status='declared'` | parziale | Come LinguaOperativaImpresa |
| `professional_served_territories` | UNIQUE parziale (`professional_profile_id`, `country_ref`, `coverage_kind`) WHERE `declaration_status='declared'` | parziale | Evita duplicati attivi |
| `professional_served_markets` | UNIQUE parziale (`professional_profile_id`, `market_id`) WHERE `declaration_status='declared'` | parziale | Un link attivo per mercato |
| `professional_served_sectors` | UNIQUE parziale (`professional_profile_id`, `sector_id`) WHERE `declaration_status='declared'` | parziale | Idem |
| `professional_profile_verifications` | UNIQUE (`professional_profile_id`, `aspect`) | entrambi NOT NULL | Current-state per aspetto |
| Credenziali / servizi / associazioni | nessun UNIQUE su denomination/title | — | Più voci omonime legittime in tempi diversi |

---

### 29.6 Foreign key

| Sorgente | Colonna | Target | Obbl. | ON UPDATE | ON DELETE | Motivazione |
|---|---|---|---|---|---|---|
| `professional_profiles` | `person_id` | `profiles(id)` | SÌ | NO ACTION | **RESTRICT** | D10; niente orfani; cancellazione Persona richiede rimozione esplicita Profilo |
| `professional_profiles` | `practice_mode_code` | `professional_practice_modes(code)` | NO | CASCADE | **RESTRICT** | Catalogo non eliminabile se in uso |
| `professional_profiles` | `context_business_id` | `businesses(id)` | NO | NO ACTION | **SET NULL** | Contesto facoltativo; soft-loss del contesto se Impresa rimossa; **non** implica Appartenenza |
| `professional_profile_categories` | `professional_profile_id` | `professional_profiles(id)` | SÌ | NO ACTION | **CASCADE** | Owned |
| `professional_profile_categories` | `category_code` | `professional_categories(code)` | SÌ | CASCADE | **RESTRICT** | Catalogo |
| Credenziali / associazioni / servizi / territori / lingue / mercati / settori / FEV | `professional_profile_id` | `professional_profiles(id)` | SÌ | NO ACTION | **CASCADE** | Owned dall'AR |
| `professional_competencies` | `competency_id` | `competencies(id)` | SÌ | NO ACTION | **RESTRICT** | Catalogo condiviso |
| `professional_services` | `service_nature_code` | `professional_service_natures(code)` | SÌ | CASCADE | **RESTRICT** | Catalogo |
| `professional_operational_languages` | `language_id` | `languages(id)` | SÌ | NO ACTION | **RESTRICT** | Catalogo condiviso |
| `professional_served_markets` | `market_id` | `international_markets(id)` | SÌ | NO ACTION | **RESTRICT** | Non cancellare Mercato se ancora dichiarato servito |
| `professional_served_sectors` | `sector_id` | `business_sectors(id)` | SÌ | NO ACTION | **RESTRICT** | Catalogo settori |
| `professional_profile_sources` | `source_kind_code` | `professional_source_kinds(code)` | SÌ | CASCADE | **RESTRICT** | Catalogo |
| `professional_profile_evidences` | `source_id` | `professional_profile_sources(id)` | NO | NO ACTION | **SET NULL** | Evidenza può restare senza fonte |
| — | — | `business_memberships` | — | — | — | **Nessuna FK nel ciclo 1** (§29.8) |

Direzione dipendenza: Professionisti → Persone (necessaria); → Imprese (facoltativa contesto); → Tassonomie/lingue/competenze/settori; → Mercati Internazionali (facoltativa). Nessuna dipendenza inversa strutturale.

---

### 29.7 Dipendenza da Persona

1. `person_id` uuid NOT NULL → `public.profiles(id)`.
2. UNIQUE(`person_id`): uno-a-uno.
3. ON DELETE RESTRICT: la Persona non può essere eliminata finché esiste il Profilo; elimina prima il Profilo (e in CASCADE le owned).
4. Divieto profili orfani: soddisfatto da NOT NULL + FK.
5. Divieto duplicazione anagrafica: nessuna colonna anagrafica sul Profilo (§29.3.5).
6. `person_id` immutabile dopo insert (vincolo applicativo prescritto; nessun trigger di enforcement obbligatorio nel ciclo 1).

---

### 29.8 Dipendenza da Imprese e Appartenenze

| Decisione ciclo 1 | Esito |
|---|---|
| Collegamento a membership | **Escluso** — nessuna colonna `membership_id` |
| Collegamento facoltativo a Impresa | **Incluso** — `context_business_id` opzionale ON DELETE SET NULL |
| Natura del collegamento | Contesto organizzativo dichiarato (D11), **non** relazione Persona–Impresa |
| Derivato da Appartenenze | **No** — non c’è sync né FK verso `business_memberships` |
| Verifica relazione | **Fuori dominio** — utilizzo applicativo dell’esito Appartenenze (D12), non schema |
| Motivazione | Evitare FK che duplichi ownership di Appartenenze; coerenza D11/D12 |

---

### 29.9 Territori serviti

**Stato reale.** Nessuna tabella `territories` / `countries` nelle migration attuali.

**Soluzione ciclo 1.** Tabella owned `professional_served_territories` con `country_ref` text NOT NULL (riferimento opaco, convenzione piattaforma allineata a Mercati Internazionali `country_ref`) + `territory_label` facoltativa per sotto-area descrittiva.

**Escluso.** FK verso tabella Territori inesistente.

**Evoluzione non distruttiva.** Quando esisterà un catalogo Territori, si potrà aggiungere colonna nullable `territory_id` (o migrare `country_ref`) senza distruggere le dichiarazioni esistenti.

---

### 29.10 Lingue operative professionali

| Aspetto | Decisione |
|---|---|
| Catalogo | `public.languages` già esistente |
| FK | `language_id` bigint NOT NULL → `languages(id)` ON DELETE RESTRICT |
| Livello | `proficiency_level` chiuso (§29.3.12) |
| Ruolo | `usage_role` `operational`\|`support` |
| Distinzione | ≠ `profile_languages` (Persone); ≠ lingue UI; ≠ `business_operational_language_declarations` |

---

### 29.11 Mercati internazionali serviti

| Aspetto | Decisione |
|---|---|
| Target | `public.international_markets(id)` — reale |
| Significato | Dichiarazione locale «conosciuto / servito / supportato» |
| FK | obbligatoria su riga; ON DELETE RESTRICT |
| Unicità | una dichiarazione `declared` per `(profile, market)` |
| Paese | non duplicato qui; composizione paese resta di Mercati |
| Distinzione | ≠ PresenzaDiMercato; ≠ InteresseDiMercato; ≠ Attività internazionale; nessuna creazione automatica di relazioni MI |

---

### 29.12 Cataloghi locali C03

| Catalogo | Tabella | Seed ciclo 1 | Estensione applicativa |
|---|---|---|---|
| Categorie | `professional_categories` | **Obbligatorio** — elenco §29.27 | Solo governance; utenti non inseriscono code |
| Modalità esercizio | `professional_practice_modes` | **Obbligatorio** — 11 code | Solo governance |
| Tipi fonte | `professional_source_kinds` | **Obbligatorio** — 13 code | Solo governance |
| Nature servizio | `professional_service_natures` | **Obbligatorio** — 7 code | Solo governance |
| Specializzazioni | — | **Rinviato** (vocabolario non chiuso) | Usa `specialization_label` |
| Tipi abilitazione | — | Non catalogo: CHECK `authorization_kind` | — |
| Ordini/Collegi | — | **Escluso** | `issuer_label` / `register_body_label` |

Colonne catalogo: `code` PK, `label_it`, `sort_order`, `is_active`, timestamps; categorie aggiungono `group_code`, `description`.

---

### 29.13 Qualifiche, iscrizioni, abilitazioni e certificazioni

**Modello.** Quattro tabelle separate (non un’unica entità tipizzata), più `professional_association_memberships` leggera.

| Concetto | Tabella | Perché separata |
|---|---|---|
| Qualifica / titolo di studio / qualifica dichiarata | `professional_qualifications` | Formalità e stati diversi; `qualification_kind` |
| Iscrizione albo/registro | `professional_registrations` | Stati active/suspended/inactive; ente registro obbligatorio |
| Abilitazione / autorizzazione | `professional_authorizations` | `authorization_kind`; stati con `revoked` |
| Certificazione | `professional_certifications` | Ente certificatore; asse verifica distinto |
| Iscrizione associativa | `professional_association_memberships` | Ciclo leggero, senza S03 dedicato |

Verifica autorevole: colonna `verification_status` su ciascuna delle quattro tabelle credenziali. Evidenze documentali strutturate multi-file: rinviate (ciclo 1 usa FEV profilo + summary).

---

### 29.14 Competenze professionali

| Aspetto | Decisione |
|---|---|
| Tassonomia | Riuso `public.competencies` — **nessuna seconda copia** |
| Distinzione Persone | Tabella distinta da `profile_competencies`; stesso catalogo, dichiarazione professionale |
| Livello | `level_code` opzionale chiuso |
| Anni | `years_experience` opzionale ≥ 0 |
| Evidenza | via FEV profilo aspetto `competency` + `verification_status` sulla riga |
| Unicità | parziale declared (profile, competency) |

---

### 29.15 Servizi professionali dichiarati

Struttura in `professional_services` (§29.3.10). Territori/lingue del servizio: **non** duplicati come FK per-servizio nel ciclo 1 (restano a livello profilo; eventuale link per-servizio rinviato). Stato, ordinamento, visibilità, disponibilità override locale definiti. Esclusi prezzo vincolante, checkout, prenotazione, contratto, SLA, pagamento. Nessuna FK a Opportunità/Collaborazioni.

---

### 29.16 Disponibilità

| Livello | Rappresentazione |
|---|---|
| Profilo | Colonne `availability_status`, `availability_note`, `availability_until` (VO sull’AR) |
| Servizio | `availability_status` nullable = override; NULL = eredita profilo |
| Entità autonoma | **No** nel ciclo 1 |

Vocabolario profilo: `available` \| `limited` \| `unavailable` \| `future` \| `case_by_case` \| `temporarily_unavailable`.

Distinzioni obbligatorie: `professional_status` (esercizio) ≠ `availability_status` (raggiungibilità incarichi) ≠ `publication_status` ≠ `visibility_status` ≠ `editorial_status` ≠ `is_contested`.

---

### 29.17 Tariffe e indicazioni economiche

**Incluso (descrittivo).** `fee_indication_kind` ∈ `none` \| `hourly_range` \| `fixed_range` \| `on_request` \| `free` \| `discounted`; importi min/max opzionali; valuta; nota; visibilità.

**Escluso.** Prezzo di vendita vincolante, listino commerciale, checkout, pagamento, preventivo strutturato come impegno.

Se `fee_indication_kind='none'` ⇒ `fee_amount_min/max/currency` NULL. Se `on_request`/`free` ⇒ importi NULL. Se `hourly_range`/`fixed_range` ⇒ almeno un estremo NOT NULL.

---

### 29.18 Esperienza e titoli

| Concetto | Forma ciclo 1 |
|---|---|
| EsperienzaProfessionale | VO sul Profilo: `experience_years`, `experience_summary` — **non** tabella |
| TitoloProfessionale | Campo `denomination` / `qualification_kind='professional_title'` sulle credenziali — **non** tabella autonoma |
| TitoloDiStudio | `qualification_kind='study_title'` |

Nessuna Entity autonoma senza ciclo di vita proprio oltre la dichiarazione credenziale.

---

### 29.19 Stati

| Asse | Dove | Valori | Persistito | Autorevole |
|---|---|---|---|---|
| Editoriale S02 | Profilo `editorial_status` | `draft` \| `declared` \| `published` | Sì | Domino/redazione |
| Professionale S01 | Profilo `professional_status` | `active` \| `suspended` \| `ceased` \| `revoked` \| `archived` | Sì | Dominio |
| Origine amm. S07 | Profilo `administrative_origin` | `voluntary` \| `disciplinary` \| `moderation` \| NULL | Sì | Dominio |
| Pubblicazione S04 | Profilo `publication_status` | `unpublished` \| `published` | Sì | Dominio |
| Visibilità | Profilo `visibility_status` | `private` \| `editorial` \| `network` \| `selected` \| `public` \| `partially_anonymous` | Sì | Dominio |
| Disponibilità | Profilo `availability_status` | vedi §29.16 | Sì | Dichiarazione |
| Contestazione | Profilo `is_contested` | boolean | Sì | Overlay |
| Verifica profilo complessiva | — | — | **No** (proiezione applicativa da verifiche per aspetto + credenziali) | Non persistita |
| Credenziale S01 | `credential_status` | per tabella §29.3.7 | Sì | Dominio |
| Credenziale S03 | `verification_status` | `unverified` \| `in_review` \| `verified` \| `contested` | Sì | Verifica riga |
| Servizio S01 | `service_status` | `declared` \| `active` \| `suspended` \| `unavailable` | Sì | Dominio |
| Dichiarazioni leggere | `declaration_status` | `declared` \| `removed` | Sì | Dichiarazione |
| FEV | `status` | `unverified` \| `in_review` \| `confirmed` \| `rejected` | Sì | Verificatore |

**Transizioni minime prescritte (applicazione; non trigger SQL).** `archived` solo da `ceased` o `revoked`. `removed` terminale sulla riga dichiarazione. `service_status='unavailable'` terminale. Pubblicazione `published` richiede `editorial_status ∈ {declared, published}` e `professional_status ∉ {archived}` — enforcement applicativo nel ciclo 1 (CHECK opzionale di coerenza debole ammesso solo se non blocca bozze legittime; **nessun CHECK che forzi pubblicazione=visibilità**).

---

### 29.20 Temporalità

| Entità | Campi | CHECK | Scadenza assente | Sovrapposizioni |
|---|---|---|---|---|
| Credenziali | `issued_on`, `valid_from`, `valid_until` | `valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from`; analogo `issued_on` | NULL = senza termine noto / non applicabile | Ammesse più righe storiche |
| Associazioni | `joined_on`, `ended_on` | `ended_on IS NULL OR joined_on IS NULL OR ended_on >= joined_on` | NULL = ancora valida | Ammesse |
| Disponibilità futura | `availability_until` | obbligatorio se `availability_status='future'` | — | — |
| FEV | `verified_at`, `expires_at` | `expires_at IS NULL OR verified_at IS NULL OR expires_at >= verified_at` | NULL = non scade | Current-state UNIQUE aspect |
| Profilo | nessun `valid_from/until` di esistenza | — | Ciclo di vita via stati | Un solo corrente per Persona |

Niente `start_date`/`end_date` generici. Nessuna history table: lo storico è retention delle righe con stati terminali (`removed`, `expired`, `revoked`, `archived`).

---

### 29.21 Fonti, evidenze e verifiche

**Modello del ciclo 1.** FEV **locale al dominio**, agganciato al **Profilo** (3 tabelle), più `verification_status` autorevole sulle quattro tabelle credenziali e su competenze/territori/lingue.

| Domanda | Decisione |
|---|---|
| Oggetti con fonti | Profilo (tabella sources); credenziali referenziano fonti solo indirettamente via aspetti |
| Oggetti con evidenze | Profilo |
| Condivisione cross-domain | **No** — FEV non condiviso con Mercati/Appartenenze |
| Numero tabelle FEV | **3** |
| Tipi fonte | Catalogo `professional_source_kinds` |
| Aspetti verifica profilo | vocabolario chiuso sotto |
| Stato verifica | `unverified`\|`in_review`\|`confirmed`\|`rejected` |
| Verificatore | `verifier_label` text (opaco; non FK account) |
| Record corrente | UNIQUE (profile, aspect); no history table |
| Storage file | **Rinviato** |
| Contestazione | `is_contested` sul profilo + `contested` su verification_status credenziali |
| Verifica complessiva Profilo | **Proiezione / derivazione applicativa**, non colonna persistita |

**Aspetti (`aspect` / `supported_aspect`) chiusi:** `professional_title` \| `registration` \| `authorization` \| `qualification` \| `certification` \| `experience` \| `service_declared` \| `territory` \| `language` \| `availability` \| `contacts` \| `competency`.

**Esclusi dagli aspetti FEV profilo.** `person_identity`, `organization_existence`, `membership_relation` — restano utilizzo di esiti esterni (Physical §16).

---

### 29.22 CHECK constraints

Espressi in forma traducibile in SQL (nomi indicativi):

1. Cataloghi: `length(trim(code)) > 0`; `length(trim(label_it)) > 0`; `sort_order >= 0`.
2. `professional_categories.group_code IN ('legal_tax_labor','finance_credit','technical_built','digital_communication','trade_international','people_org','real_estate','linguistic_intercultural','ip_innovation','residual')`.
3. Profilo — editorial/professional/publication/visibility/availability/fee/contacts: vocabolari §29.19 / §29.16 / §29.17.
4. Profilo — `experience_years IS NULL OR experience_years >= 0`.
5. Profilo — fee: se `fee_indication_kind='none'` allora amount/currency NULL; se `hourly_range` o `fixed_range` allora `(fee_amount_min IS NOT NULL OR fee_amount_max IS NOT NULL)`; se entrambi presenti `fee_amount_max >= fee_amount_min`; amounts ≥ 0; `fee_currency IS NULL OR fee_currency ~ '^[A-Z]{3}$'`.
6. Profilo — `availability_status='future'` ⇒ `availability_until IS NOT NULL`.
7. Profilo — `administrative_origin IS NULL OR professional_status IN ('suspended','ceased','revoked','archived')`.
8. Credenziali — vocabolari status/kind; date §29.20; `denomination` non blank; se `origin_kind='foreign'` allora `equivalence_status IS NOT NULL`; se `national` allora `equivalence_status IS NULL`.
9. Servizi — vocabolari audience/delivery/status; `title` non blank.
10. Dichiarazioni leggere — `declaration_status IN ('declared','removed')`.
11. Lingue — proficiency/usage vocabolari.
12. Territori — `country_ref` non blank; coverage/presence vocabolari.
13. Mercati — `relation_kind IN ('known','served','supported')`.
14. Competenze — level/years.
15. FEV — aspect ∈ elenco §29.21; status ∈ elenco; date expire.
16. **Nessun CHECK XOR soggetto Persona/Impresa** (non applicabile).
17. **Nessun CHECK** che imponga `publication_status='published' ⇔ visibility_status='public'` (assi distinti).

---

### 29.23 Indici

| Tabella | Indice | Tipo | Unicità | Condizione | Access pattern |
|---|---|---|---|---|---|
| `professional_profiles` | `(person_id)` | btree | UNIQUE | — | Lookup Persona |
| `professional_profiles` | `(publication_status)` | btree | no | — | Profili pubblicati |
| `professional_profiles` | `(availability_status)` | btree | no | — | Filtro disponibilità |
| `professional_profiles` | `(professional_status)` | btree | no | — | Filtro stato |
| `professional_profile_categories` | `(category_code)` | btree | no | — | Lookup categoria |
| `professional_profile_categories` | parziale UNIQUE | btree | sì | declared | §29.5 |
| Credenziali (ciascuna) | `(professional_profile_id)` | btree | no | — | Load aggregate |
| Credenziali (ciascuna) | `(credential_status)` | btree | no | — | Qualifiche valide/filtro |
| `professional_services` | `(professional_profile_id)` | btree | no | — | Servizi del profilo |
| `professional_services` | `(service_status)` | btree | no | WHERE `service_status='active'` opz. | Servizi attivi |
| Lingue/territori/mercati/settori/competenze | owner + FK target | btree | no | — | Filtri ricerca |
| UNIQUE parziali declared | come §29.5 | btree | sì | declared | Integrità |
| `professional_profile_verifications` | `(professional_profile_id, aspect)` | btree | UNIQUE | — | Verifica corrente |
| Cataloghi | PK code | — | sì | — | Join |

Nessun indice speculativo su `notes`/`summary` full-text nel ciclo 1.

---

### 29.24 Funzioni e trigger

| Elemento | Prescrizione |
|---|---|
| `updated_at` | Una funzione + un trigger `BEFORE UPDATE` per ogni tabella mutabile §29 |
| Security | `SECURITY INVOKER`; `SET search_path = ''` |
| Funzioni nuove di business | **Nessuna** nel ciclo 1 |
| Manutenzione proiezione verifica profilo | **Vietata** via trigger — non esiste colonna proiezione |
| Sync Appartenenze/Imprese | **Vietata** |
| Gate pubblicazione | Applicazione, non trigger |

---

### 29.25 RLS

Per **ogni** tabella §29:

| Regola | Valore |
|---|---|
| RLS enabled | **Sì** |
| FORCE RLS | **No** |
| Policy nelle migration strutturali | **Nessuna** |
| Comportamento | Deny-by-default per `anon`/`authenticated` |
| Owner / backoffice / pubblico | Demandato a future policy Identità & Accessi (fuori ciclo strutturale) |
| Cataloghi C03 locali | Stessa infrastruttura: RLS enable, **nessuna** policy `SELECT` pubblica nel ciclo 1 (diversi da `languages`/`competencies`, che hanno già policy legacy proprie e non sono tabelle di questo dominio) |
| FEV | Non pubbliche; nessuna policy SELECT anon |
| Ciclo 1 | Crea **solo infrastruttura RLS**, non policy applicative owner/pubblico |

---

### 29.26 Privilegi

| Ruolo | Prescrizione |
|---|---|
| `PUBLIC` / default | `REVOKE ALL` su tutte le tabelle §29 e sulle relative sequence/identity |
| `anon` | **Nessun GRANT** nel ciclo 1 (né su cataloghi né su dati) |
| `authenticated` | **Nessun GRANT** nel ciclo 1 |
| `service_role` | Nessun REVOKE aggiuntivo oltre la baseline Supabase; non sostituisce una policy di dominio |
| Cataloghi C03 | Identici alle altre tabelle Professionisti: deny-by-default + REVOKE; lettura applicativa solo via ruolo di servizio finché Identità & Accessi non introdurrà policy dedicate (fuori ciclo 1 strutturale) |
| Dati pubblicati | Nessun accesso lettura pubblica strutturale nel ciclo 1 |

Divieto di affidarsi ai grant predefiniti di Supabase senza REVOKE esplicito.

---

### 29.27 Seed

| Catalogo | Seed | Codici chiusi |
|---|---|---|
| `professional_categories` | **Obbligatorio, idempotente** | `legal_area`, `tax_accounting`, `labor_welfare`, `finance`, `subsidized_finance`, `credit`, `insurance`, `engineering`, `architecture`, `construction`, `energy`, `sustainability`, `safety`, `digital`, `informatics`, `marketing`, `communication`, `commerce`, `export`, `internationalization`, `customs`, `logistics`, `training`, `human_resources`, `business_organization`, `real_estate`, `translation`, `interpreting`, `cultural_mediation`, `intellectual_property`, `innovation`, `startup`, `other_professional` — `label_it` italiane da Logical §5; `is_active=true`; `sort_order` monotono per gruppo |
| `professional_practice_modes` | **Obbligatorio** | `individual`, `individual_firm`, `associated_firm`, `professional_company`, `consulting_company`, `business_collaboration`, `specialist_employee`, `professional_network`, `external_professional`, `occasional`, `international_cross_border` |
| `professional_source_kinds` | **Obbligatorio** | `professional_declaration`, `order_college`, `public_register`, `university`, `certifier`, `professional_organization`, `business`, `professional_firm`, `client`, `partner_body`, `editorial`, `public_source`, `official_document` |
| `professional_service_natures` | **Obbligatorio** | `consulting`, `training`, `assistance`, `representation`, `design`, `verification`, `accompaniment` |
| Specializzazioni | **Rinviato** | Nessun seed inventato |
| Demo profili | **Escluso** | — |

Seed aggiornabile solo da governance (UPSERT su `code`); non estendibile dall’applicazione utente.

---

### 29.28 Commenti SQL

Obbligatori nel futuro SQL:

- Commento tabella su ogni relazione §29.2.
- Colonne ambigue: `context_business_id` («non membership; non verifica Impresa»), `availability_status` vs `professional_status`, `publication_status` vs `visibility_status`, `is_contested`, `fee_*` («indicativo, non preventivo»), `country_ref` («opaco; non FK Territori»), `specialization_label` («catalogo specializzazioni rinviato»).
- Distinzioni confinanti: ≠ `profile_languages`; ≠ `profile_competencies`; ≠ `business_services`; ≠ Presenza/Interesse MI; ≠ OffertaDiServizio.
- FEV: assenza di proiezione verifica complessiva persistita.
- Credenziali: ente come label opaca, non catalogo Ordini.

---

### 29.29 Ordine topologico suggerito

Ordine basato solo su dipendenze fisiche (codici M*.* = responsabilità del Migration Plan):

1. Cataloghi B1: `professional_categories` → `professional_practice_modes` → `professional_source_kinds` → `professional_service_natures` (+ seed).
2. Aggregate Root B2: `professional_profiles` (dipende da `profiles`, cataloghi practice_modes; FK opzionale `businesses`).
3. Owned dichiarative B3 (parallellizzabili tra loro dopo B2): categories declarations; qualifications; registrations; authorizations; certifications; association_memberships; competencies; services; territories; operational_languages; served_markets; served_sectors.
4. FEV B4: sources → evidences → verifications.
5. Commenti/REVOKE/RLS enable per ogni unità, secondo lo stile delle migration già approvate.

Precondizioni esterne già soddisfatte: `profiles`, `languages`, `competencies`, `business_sectors`, `businesses`, `international_markets`.

---

### 29.30 Questioni rinviate e chiusura

**Decisioni risolte.** AR unica; soggetto Persona 1:1; confini D10–D13; quattro famiglie credenziali separate; FEV profilo a 3 tabelle; nessuna proiezione verifica complessiva persistita; territori opachi; lingue/competenze/settori/mercati su tabelle reali; membership strutturale esclusa; tariffe descrittive; esperienza/titolo come VO/colonne; RLS solo infrastruttura.

**Decisioni rinviate.** Catalogo Specializzazioni + seed; FK `membership_id`; policy RLS applicative; Storage evidenze; FEV per-credenziale dedicato; link territorio/lingua per-servizio; canali contatto multipli; history table; workflow equivalenza titoli; codice famiglia Disponibilità in Reference Model; consolidamento PCa1.

**Dipendenze future.** Dominio Organizzazioni (Ordini come soggetti); dominio Servizi (OffertaDiServizio); catalogo Territori condiviso; Identità & Accessi (policy); eventuale Autonomy futura di singole credenziali come AR (§25.4).

**Il Migration Plan non potrà modificare:** nomi tabella/colonne vincolanti di questo contratto; vocabolari CHECK chiusi; UNIQUE 1:1 Persona; assenza di `membership_id` nel ciclo 1; assenza di proiezione verifica profilo; modello soggetto Persona-only; esclusione marketplace.

**Il Migration Plan dovrà organizzare:** suddivisione in unità M*.*; timestamp file; ordine esatto entro i blocchi B1–B4; abbreviazione nomi funzione ≤63 byte se necessario; idempotenza seed; dry-run/apply. Non potrà introdurre policy/GRANT cataloghi in contraddizione con §29.25–§29.26 senza un aggiornamento esplicito di questo contratto.

---

### 29.31 Mapping decisioni chiuse (sintesi operativa)

| Punto | Decisione fisica |
|---|---|
| Aggregate Root | `professional_profiles` |
| Soggetto | Solo `person_id` → `profiles` |
| Cardinalità | UNIQUE `person_id` |
| Impresa | `context_business_id` opzionale SET NULL |
| Appartenenze | Nessuna FK ciclo 1 |
| Territori | `country_ref` opaco |
| Lingue | FK `languages` |
| Mercati | FK `international_markets` |
| Competenze | FK `competencies` |
| Settori | FK `business_sectors` |
| Credenziali | 4 tabelle + associazioni |
| Servizi | `professional_services` descrittivi |
| FEV | 3 tabelle profilo |
| Verifica d’insieme | Non persistita |
| RLS | Enable senza policy |
