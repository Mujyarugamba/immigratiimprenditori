# Mapping fisico — Dominio PROFESSIONISTI

> Livello architetturale. Physical Domain Mapping concettuale del dominio Professionisti: il passaggio tra la Tesi architetturale del dominio, il modello logico e la sua futura rappresentazione fisica. Non contiene schema PostgreSQL, non contiene SQL, non definisce tabelle, colonne, indici, chiavi, RLS, non usa Supabase, non tratta API, migrazioni, trigger o framework. Nessun codice.
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
| 4 | Nessuna implementazione tecnica introdotta | Verificato — nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, API, migrazioni, trigger, framework in alcuna sezione |
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

**Conferma finale.** Nessun altro documento è stato modificato: `domain-model.md`, `platform-data-specification.md`, `domain-patterns.md`, `professionisti-domain-thesis.md`, `logical/professionisti.md`, `domain-dependency-map.md` e i quattro Physical Domain Mapping già approvati restano inalterati. Questo documento è pronto per essere usato come riferimento per il futuro piano di migrazione del dominio Professionisti.
