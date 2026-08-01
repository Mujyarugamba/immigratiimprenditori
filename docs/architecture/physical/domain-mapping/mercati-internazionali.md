# Physical Domain Mapping — Dominio Mercati Internazionali

## Nota introduttiva di esclusione

Questo documento rappresenta il passaggio tra il modello logico del dominio Mercati Internazionali e la sua rappresentazione fisica. Le sezioni 1–34 restano al livello concettuale di mapping. Il **§35** chiude i contratti DDL-ready necessari al Migration Plan (nomi, colonne, tipi, nullability, vincoli, RLS difensiva, esclusioni), **senza** SQL eseguibile e senza anticipare policy di Identità & Accessi.

Le menzioni tecnologiche ammesse sono: questa nota, §33, §34 e §35.

Il documento applica integralmente la baseline architetturale (`architecture-baseline.md`), il Reference Model (`02-reference-model.md`), le convenzioni architetturali (`03-convenzioni-architetturali.md`), gli attributi di qualità (`04-quality-attributes.md`), la Dependency Map approvata (`domain-dependency-map.md`) e le decisioni già consolidate nei mapping di Persone (`domain-mapping/persone.md`), Imprese (`domain-mapping/imprese.md`) e Appartenenze (`domain-mapping/appartenenze.md`). Non ridefinisce la metodologia generale: la applica concretamente al dominio Mercati Internazionali, confermando integralmente — senza alcuna eccezione — le decisioni già consolidate nella Dependency Map (`domain-dependency-map.md`, righe D6-D9) e nei mapping già approvati. Il dominio possiede il modello concettuale della relazione tra un soggetto e un Mercato (§9) e referenzia i soggetti coinvolti (Imprese, Persone, Professionisti) tramite un riferimento esterno opaco alla loro identità, senza conoscerne il modello interno: lo stesso pattern già adottato dal dominio Appartenenze.

## Documenti letti integralmente

- `docs/costituzione-piattaforma.md`
- `docs/domain-model.md`
- `docs/platform-data-specification.md`
- `docs/architecture/logical/mercati-internazionali.md`
- `docs/architecture/logical/persone.md`
- `docs/architecture/logical/imprese.md`
- `docs/architecture/logical/appartenenze.md`
- `docs/architecture/logical/professionisti.md`
- `docs/architecture/logical/opportunita.md`
- `docs/architecture/logical/collaborazioni.md`
- `docs/architecture/logical/eventi.md`
- `docs/architecture/logical/contenuti-editoriali.md`
- `docs/architecture/logical/osservatorio.md`
- `docs/architecture/logical/identita-accessi.md`
- `docs/architecture/logical/reconciliation-report.md`
- `docs/architecture/physical/01-principi-mapping.md`
- `docs/architecture/physical/02-reference-model.md`
- `docs/architecture/physical/03-convenzioni-architetturali.md`
- `docs/architecture/physical/04-quality-attributes.md`
- `docs/architecture/physical/architecture-baseline.md`
- `docs/architecture/physical/domain-dependency-map.md`
- `docs/architecture/physical/domain-mapping/persone.md`
- `docs/architecture/physical/domain-mapping/imprese.md`
- `docs/architecture/physical/domain-mapping/appartenenze.md`

I mapping di Persone, Imprese e Appartenenze sono assunti come approvati. La Dependency Map è assunta come vincolante per tutte le decisioni già consolidate (DC1-DC13), incluse le righe D6, D7, D8 e D9, che riguardano esattamente la natura delle dipendenze tra Mercati Internazionali e Persone/Imprese/Appartenenze. Questo documento, in quanto mapping fisico del dominio proprietario, ha il compito — riservato a questa sede dalla stessa Dependency Map per le righe che essa aveva lasciato da confermare "al momento del proprio Physical Domain Mapping" — di confermarle. Come risulterà dal §9, la conferma è integrale: Mercati Internazionali resta proprietario del modello concettuale della relazione con il mercato (Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale, Esigenza di internazionalizzazione, ed ogni altro fatto di business che descrive il rapporto tra un soggetto e un mercato), referenziando i soggetti coinvolti tramite un riferimento esterno opaco alla loro identità, senza conoscerne il modello interno — esattamente lo stesso pattern già adottato dal dominio Appartenenze verso Persone e Imprese (`domain-mapping/appartenenze.md` §4-§5). Questo documento non introduce quindi alcuna eccezione architetturale rispetto alla Dependency Map, ai mapping già approvati o al Reconciliation Report, che restano invariati.

---

# Regola fondamentale

Il dominio Mercati Internazionali non è un catalogo di Paesi, non è un database geografico, non è un elenco di nazioni. È il dominio che dà significato economico, commerciale, professionale e istituzionale a un contesto internazionale — un Paese, un gruppo di Paesi, un'area, un corridoio — trasformandolo in un ecosistema navigabile (`mercati-internazionali.md` §1, §3). Il suo Aggregate Root, il Mercato, esiste e ha senso indipendentemente da qualunque Persona, Impresa o Professionista che vi si colleghi: è governance centrale di piattaforma (`domain-model.md` §5-§6; `mercati-internazionali.md` §1).

L'autonomia del dominio non significa che Mercati Internazionali debba contenere esclusivamente dati "propri" del Mercato, né che il dominio debba ignorare l'esistenza di chi con un Mercato si relaziona. Significa, piuttosto, che il dominio possiede per intero il modello concettuale della relazione tra un soggetto e un Mercato — Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale, Esigenza di internazionalizzazione, ed ogni altro fatto di business che descrive quel rapporto (§9) — senza conoscere i dettagli interni dei domini Persone, Imprese o Professionisti: il dominio referenzia il soggetto coinvolto esclusivamente tramite un riferimento esterno opaco alla sua identità, senza mai dipendere dal modello interno di quel soggetto (dati descrittivi, stato, storia). È esattamente lo stesso pattern già adottato dal dominio Appartenenze, che possiede la relazione tra Persona e Impresa referenziandone soltanto l'identità (`domain-mapping/appartenenze.md` §4-§5). Questo principio — motivato per intero al §9 — è la ragione per cui questo documento conferma, senza alcuna eccezione, che Mercati Internazionali resta proprietario delle relazioni d'uso (Presenza, Interesse, Attività, Relazione commerciale, Esigenza), esattamente come già stabilito da `domain-dependency-map.md` (righe D6-D9) e da `domain-mapping/imprese.md`.

---

# Distinzioni obbligatorie

## Mercato e Stato

Uno Stato è un'entità giuridico-politica con confini, sovranità e un ordinamento proprio; è un concetto di governance geografico-giuridica esterno a questo dominio, che qui viene solo referenziato (§6). Un Mercato, come definito in questo dominio, è una costruzione di significato per la piattaforma (`mercati-internazionali.md` §3): può coincidere con un singolo Stato, ma può altrettanto legittimamente comprendere più Stati, una porzione di uno Stato, o un insieme di Stati privo di qualunque fondamento giuridico comune (un corridoio commerciale, un'area di prassi condivisa). Un Mercato non è quindi un sinonimo tecnico di Stato: è un'unità di senso economico che la piattaforma sceglie di trattare come ecosistema, e che può appoggiarsi a uno o più Stati senza mai identificarsi con nessuno di essi in modo necessario (§3, §11 di questo documento).

## Mercato e Area geografica

Un'Area geografica descrive una collocazione fisica nello spazio — continente, regione, prossimità territoriale — indipendentemente da qualunque considerazione economica, commerciale o istituzionale. Un Mercato può appoggiarsi a un'Area geografica (§5) come componente della propria definizione, ma non è mai reso equivalente a essa: due Paesi geograficamente vicini possono appartenere a Mercati diversi (per assenza di un'unità commerciale rilevante), mentre due Paesi geograficamente lontani possono appartenere allo stesso Mercato (un corridoio economico, una diaspora, un'area linguistica transcontinentale). L'Area geografica è quindi un concetto incorporato e descrittivo (§5), mai l'unico criterio costitutivo di un Mercato.

## Mercato e Area economica

Un'Area economica è il raggruppamento di Paesi o territori sulla base di accordi o integrazioni economiche riconosciute (unioni doganali, aree di libero scambio, `mercati-internazionali.md` §3). Un Mercato può coincidere con un'Area economica, comprenderne più di una, comprenderne solo una parte, o non fondarsi su alcuna Area economica riconosciuta (un'area meramente commerciale o di prassi, §3). L'Area economica è quindi uno dei possibili criteri con cui un Mercato viene costruito (§5), non la sua definizione esaustiva: il dominio deve poter rappresentare Mercati che non hanno alcun fondamento istituzionale economico, cosa che un modello basato esclusivamente su Aree economiche riconosciute non permetterebbe.

## Mercato e Blocco economico (o commerciale)

Un Blocco economico o commerciale è una forma particolare di Area economica, caratterizzata da un accordo multilaterale esplicito e da regole comuni tra i Paesi membri (unione doganale, mercato comune, area di libero scambio con regole formalizzate). È quindi un caso specifico, non un sinonimo, di Area economica (sopra): ogni Blocco economico è un'Area economica, ma non ogni Area economica rilevante per un Mercato è un Blocco economico formalizzato (un'"area del Golfo" trattata come riferimento commerciale corrente, `mercati-internazionali.md` §3, non è un Blocco economico in senso istituzionale, pur potendo essere la base di un Mercato). Il dominio non richiede che un Mercato si fondi su un Blocco economico riconosciuto per esistere ed essere trattato come tale.

## Mercato e Comunità sovranazionale

Una Comunità sovranazionale è un'istituzione con proprie strutture di governo che eccedono la sovranità dei singoli Stati membri (un'unione politica, non solo economica). È un concetto ulteriore e più stringente di Area economica e di Blocco economico: comporta una cessione di sovranità istituzionale, non solo un accordo commerciale. Un Mercato può appoggiarsi all'esistenza di una Comunità sovranazionale (per esempio trattandola come base della propria Area economica), ma il dominio non presume mai che l'esistenza di una Comunità sovranazionale determini automaticamente i confini di un Mercato: la piattaforma resta libera di definire un Mercato più ampio, più ristretto o trasversale rispetto a qualunque Comunità sovranazionale esistente, in base alla propria costruzione di significato (§3).

## Mercato e Comunità economica

Una Comunità economica è un raggruppamento di cooperazione economica tra Stati, tipicamente meno integrato di un Blocco economico e privo delle strutture di governo di una Comunità sovranazionale: una forma intermedia, spesso regionale, di cooperazione dichiarata. Ai fini di questo dominio è trattata come un'ulteriore possibile base per la componente di Area economica di un Mercato (§5), con lo stesso principio di non-equivalenza già enunciato sopra: la sua esistenza non vincola né esaurisce la definizione di alcun Mercato.

## Presenza, Interesse, Esperienza e Operatività sul mercato

Presenza, Interesse, Esperienza e Operatività non sono sinonimi intercambiabili, e nessuno di essi è un attributo del Mercato: sono qualificazioni della relazione tra un soggetto (Impresa, Persona, Professionista) e un Mercato, e per questo — per la ragione motivata al §9 — appartengono al dominio Mercati Internazionali, che ne possiede il modello concettuale referenziando il soggetto coinvolto tramite un riferimento esterno opaco, senza conoscerne i dettagli interni.

- **Presenza sul mercato** è il fatto dichiarato che il soggetto opera effettivamente nel Mercato, in una o più delle forme già classificate al §7 (`mercati-internazionali.md` §4).
- **Interesse verso il mercato** è un'intenzione dichiarata, non ancora tradotta in attività operativa: non è né un prerequisito né una garanzia di una futura Presenza (`mercati-internazionali.md` §4).
- **Esperienza sul mercato** (riferita in particolare a una Persona) è un percorso personale o professionale che ha comportato una permanenza o un'attività diretta nel Mercato: non equivale né a una Presenza operativa attuale né a una competenza commerciale dimostrata (`mercati-internazionali.md` §9).
- **Operatività sul mercato** è la condizione, osservabile lungo l'asse di stato della relazione (§15, §16 di `mercati-internazionali.md`), per cui una Presenza dichiarata è effettivamente in corso (Avviata, Attiva, Consolidata) e non solo dichiarata o pianificata.

Il dominio non presume mai che uno di questi concetti implichi un altro: un Interesse non implica una Presenza; un'Esperienza personale non implica un'Operatività d'impresa; una Presenza dichiarata non implica di per sé l'Operatività, se lo stato della relazione è ancora "In valutazione" o "Pianificata" (`mercati-internazionali.md` §7, §12 regola 4).

## Partnership, Distribuzione, Produzione, Importazione, Esportazione, Investimento

Queste sei nozioni sono tipologie distinte di Attività internazionale (§7 di questo documento; `mercati-internazionali.md` §5), non stati né sinonimi generici di "presenza": ciascuna descrive una natura specifica di ciò che viene concretamente svolto in un Mercato, e più tipologie possono coesistere per la stessa relazione (un'Impresa può insieme distribuire e produrre nello stesso Mercato). Nessuna di esse implica automaticamente le altre: l'Importazione non implica l'Esportazione; l'Investimento diretto non implica alcuna Attività commerciale associata (`mercati-internazionali.md` §13, caso "Investimenti esteri senza attività commerciale"); la Partnership (Relazione commerciale di tipo collaborativo, §12) non implica né la Distribuzione né la Produzione, restando una relazione con un soggetto terzo distinta dalla natura dell'Attività stessa.

## Ricerca clienti, Ricerca fornitori, Ricerca distributori, Ricerca partner

Queste quattro nozioni sono tipologie di Esigenza di internazionalizzazione (§12; `mercati-internazionali.md` §8), cioè bisogni dichiarati non ancora soddisfatti — non sono Attività internazionali in corso, non sono Relazioni commerciali già stabilite, e non sono nemmeno un Interesse di mercato in senso proprio (che riguarda il Mercato nel suo insieme, non un bisogno specifico verso una controparte). Una Ricerca di clienti, fornitori, distributori o partner può generare, in altri domini, un'Opportunità o una Collaborazione, ma non coincide con esse (`mercati-internazionali.md` §8) e non presuppone che l'esigenza sia già stata soddisfatta: la sua esistenza come fatto dichiarato non implica alcuna Relazione commerciale effettivamente stabilita.

---

# Indice

1. [Scopo del mapping](#1-scopo-del-mapping)
2. [Sintesi del dominio logico](#2-sintesi-del-dominio-logico)
3. [Definizione operativa di Mercato Internazionale](#3-definizione-operativa-di-mercato-internazionale)
4. [Nucleo persistente](#4-nucleo-persistente)
5. [Concetti incorporati](#5-concetti-incorporati)
6. [Riferimento al catalogo territoriale condiviso](#6-riferimento-al-catalogo-territoriale-condiviso)
7. [Tipologie di attività e canale di accesso](#7-tipologie-di-attività-e-canale-di-accesso)
8. [Risorsa di supporto al mercato](#8-risorsa-di-supporto-al-mercato)
9. [Principio di autonomia del dominio](#9-principio-di-autonomia-del-dominio)
10. [Soggetti e domini in relazione con Mercati Internazionali](#10-soggetti-e-domini-in-relazione-con-mercati-internazionali)
11. [Presenza e interesse di mercato](#11-presenza-e-interesse-di-mercato)
12. [Attività, relazioni commerciali ed esigenze di internazionalizzazione](#12-attività-relazioni-commerciali-ed-esigenze-di-internazionalizzazione)
13. [Responsabilità del dominio](#13-responsabilità-del-dominio)
14. [Identità](#14-identità)
15. [Assi di stato](#15-assi-di-stato)
16. [Verifiche](#16-verifiche)
17. [Temporalità e storicizzazione](#17-temporalità-e-storicizzazione)
18. [Visibilità e pubblicazione](#18-visibilità-e-pubblicazione)
19. [Relazione con Imprese](#19-relazione-con-imprese)
20. [Relazione con Persone](#20-relazione-con-persone)
21. [Relazione con Professionisti](#21-relazione-con-professionisti)
22. [Relazione con Opportunità, Collaborazioni ed Eventi](#22-relazione-con-opportunità-collaborazioni-ed-eventi)
23. [Relazione con Contenuti Editoriali e Osservatorio](#23-relazione-con-contenuti-editoriali-e-osservatorio)
24. [Eventi di dominio](#24-eventi-di-dominio)
25. [Dati sorgente, derivati e aggregati](#25-dati-sorgente-derivati-e-aggregati)
26. [Dipendenze del dominio](#26-dipendenze-del-dominio)
27. [Analisi dei cicli](#27-analisi-dei-cicli)
28. [Eccezioni motivate rispetto alla soluzione uniforme](#28-eccezioni-motivate-rispetto-alla-soluzione-uniforme)
29. [Pattern riutilizzabili individuati](#29-pattern-riutilizzabili-individuati)
30. [Verifica degli attributi di qualità](#30-verifica-degli-attributi-di-qualità)
31. [Classificazione delle decisioni](#31-classificazione-delle-decisioni)
32. [Decisioni di mapping consolidate](#32-decisioni-di-mapping-consolidate)
33. [Questioni aperte e aspetti rinviati](#33-questioni-aperte-e-aspetti-rinviati)
34. [Controllo finale](#34-controllo-finale)
35. [Contratti DDL-ready (ciclo 1 Persona–Impresa)](#35-contratti-ddl-ready-ciclo-1-personaimpresa)

Riepilogo finale

---

## 1. Scopo del mapping

Questo mapping traduce il modello logico del dominio Mercati Internazionali (`mercati-internazionali.md`) nella struttura concettuale che ne renderà persistente il significato, senza introdurre alcuna decisione tecnologica (`01-principi-mapping.md` §1).

**Responsabilità del dominio, come confermata da questo mapping.** Mercati Internazionali possiede il concetto di Mercato come costruzione di significato economico e geografico per la piattaforma (§3-§4), la sua composizione (§5-§6), le classificazioni che lo descrivono (§7), le risorse istituzionali a esso dedicate (§8) e, in quanto concetto di business autonomo e non un semplice attributo del soggetto coinvolto, il modello concettuale della relazione con cui un soggetto dichiara una Presenza, un Interesse, un'Attività, una Relazione commerciale o un'Esigenza verso un Mercato (§9, §11-§12): il dominio possiede queste relazioni referenziando il soggetto coinvolto tramite un riferimento esterno opaco alla sua identità, senza conoscerne i dettagli interni.

**Obiettivo del Physical Domain Mapping.** Stabilire quali concetti di `mercati-internazionali.md` diventano strutture persistenti autonome del dominio Mercati Internazionali, quali restano concetti incorporati, quali sono riferimenti a cataloghi condivisi esterni al dominio (in particolare la componente territoriale, §6), e come il dominio referenzia, senza conoscerne i dettagli interni, i soggetti (Imprese, Persone, Professionisti) coinvolti nelle relazioni che possiede (§9).

**Confini inclusi.** Il Mercato come Aggregate Root autonomo (§4); l'Area geografica, economica, linguistica, commerciale e culturale come concetti incorporati (§5); il riferimento — non la definizione — del Paese come componente territoriale (§6); le Tipologie di attività internazionale e i Canali di accesso come classificazioni (§7); la Risorsa di supporto al mercato come entità di riferimento autonoma (§8); il modello concettuale di Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale ed Esigenza di internazionalizzazione, come relazioni possedute da questo dominio (§9, §11-§12); gli assi di stato, le verifiche, la storicizzazione e gli eventi propri di tutte queste entità (§14-§18, §24); le dipendenze, in uscita e in entrata, verso tutti gli altri domini coinvolti (§26).

**Confini esclusi.** L'identità pubblica e i dati descrittivi di Imprese, Persone e Professionisti (dominio Imprese/Persone/Professionisti): questo dominio li referenzia soltanto tramite un riferimento esterno opaco alla loro identità (§9), senza mai incorporarne i dettagli interni. Restano esclusi: l'Appartenenza in quanto tale, cioè il legame con cui una Persona agisce per un'Impresa (dominio Appartenenze: questo dominio ne referenzia solo l'esito della verifica del titolo di rappresentanza, §9, §26); le Opportunità e le Collaborazioni che possono nascere da un'Esigenza (dominio Opportunità/Collaborazioni); gli Eventi che possono riguardare un Mercato (dominio Eventi); i contenuti editoriali e i report che narrano o analizzano un Mercato (dominio Contenuti Editoriali/Osservatorio); ogni decisione di accesso tecnico (dominio Identità & Accessi).

**Rapporto con Imprese.** Mercati Internazionali possiede la Presenza, l'Interesse e l'Attività internazionale dichiarate da un'Impresa verso un Mercato (§9, §19): referenzia l'identità dell'Impresa dichiarante tramite un riferimento esterno opaco, senza conoscere né incorporare alcun dato descrittivo dell'Impresa (sedi, settore, canali, prodotti), che resta di esclusiva competenza del dominio Imprese.

**Rapporto con Persone.** Simmetricamente, Mercati Internazionali possiede l'Esperienza, la Presenza individuale e l'Interesse dichiarati da una Persona verso un Mercato (§9, §20): referenzia l'identità della Persona dichiarante tramite un riferimento esterno opaco, senza conoscere né incorporare alcun dato identitario o descrittivo della Persona.

**Rapporto con Professionisti e con gli altri domini.** Mercati Internazionali possiede, allo stesso modo, la Relazione commerciale internazionale e l'Esigenza di internazionalizzazione dichiarate da un Professionista in ambito professionale (§9, §21), referenziandone l'identità in modo opaco. Opportunità, Collaborazioni, Eventi, Contenuti Editoriali e Osservatorio, invece, utilizzano Mercati Internazionali in modo unidirezionale, referenziando il Mercato per identità senza che il Mercato debba mai conoscerli (§22-§23, §26).

---

## 2. Sintesi del dominio logico

`mercati-internazionali.md` definisce il dominio come lo spazio economico e relazionale esterno all'Italia — Paesi, aree geografiche o economiche, corridoi commerciali — e le relazioni che Imprese e Persone dichiarano di avere, aver avuto o voler avere con esso (§1). Il documento logico individua dodici concetti principali (§2): Mercato internazionale, Paese, Area geografica o economica, Presenza di mercato, Interesse di mercato, Relazione commerciale internazionale, Attività internazionale, Canale di accesso al mercato, Settore nel mercato, Esigenza di internazionalizzazione, Risorsa di supporto al mercato, Evidenza ed Fonte dell'informazione.

**Cosa il documento logico dichiara posseduto dal dominio (§1, §15).** La definizione e i confini del Mercato; le relazioni di Presenza, Interesse, Attività, Relazione commerciale ed Esigenza dichiarate da un soggetto verso quel Mercato.

**Cosa il documento logico dichiara escluso (§1).** L'Impresa e la Persona in quanto tali; l'Appartenenza; le Opportunità e le Collaborazioni; gli Eventi; i Contenuti Editoriali e l'Osservatorio; l'identità digitale e i diritti di accesso; i servizi linguistici come offerta strutturata.

**Confermato senza eccezioni da questo mapping.** Il documento logico, nella propria sezione "Quali domini utilizza" (§1) e nella propria decisione consolidata 4 (§15), attribuisce al dominio la proprietà delle relazioni di Presenza/Interesse anche quando ciò richiede di referenziare l'identità di un'Impresa o di una Persona dichiarante. Questo mapping conferma integralmente questa attribuzione (§9): il dominio possiede il modello concettuale della relazione, referenziando l'identità del dichiarante in modo esterno e opaco, senza conoscerne il modello interno — coerentemente con quanto già stabilito da `domain-dependency-map.md` (righe D6-D9) e da `domain-mapping/imprese.md`.

**Le 17 regole e invarianti del §12 di `mercati-internazionali.md`** sono tutte confermate da questo mapping e richiamate puntualmente nelle sezioni corrispondenti (in particolare regole 1, 6, 8, 11, 13, 15, 17, richiamate al §4, §9, §13, §18, §26).

---

## 3. Definizione operativa di Mercato Internazionale

**Cos'è un Mercato Internazionale, per questo dominio.** Un Mercato è una costruzione di significato economico che la piattaforma sceglie di trattare come ecosistema navigabile (`mercati-internazionali.md` §3): può appoggiarsi a uno o più Stati, a un'Area geografica, a un'Area economica, a un'Area linguistica, a un'Area commerciale o a un'Area culturale (§5), in qualunque combinazione, senza che nessuna di queste componenti sia da sola necessaria o sufficiente a definirlo. Ha un'identità propria (§14), un proprio ciclo di vita (§15) e una propria vita informativa (descrizione, risorse di supporto, §8) indipendenti da qualunque soggetto che vi si colleghi.

**Cosa NON è un Mercato Internazionale, per questo dominio.**
- Non è un catalogo di Paesi né una struttura geografica amministrativa: quella responsabilità appartiene al catalogo territoriale condiviso, che questo dominio referenzia senza duplicare (§6).
- Non è un attributo descrittivo dell'Impresa o della Persona: è un Aggregate Root autonomo, referenziato da chi lo usa, mai incorporato (§4, §9).
- Non è, di per sé, la relazione con cui un soggetto opera in quel Mercato: quella relazione è un concetto di business autonomo, distinto dal Mercato ma posseduto dallo stesso dominio, che la referenzia senza conoscere i dettagli del soggetto dichiarante (§9, §11-§12).
- Non è un indicatore statistico né un report: quelli sono prodotti analitici dell'Osservatorio che utilizzano il Mercato come dimensione di aggregazione, senza che il Mercato stesso li produca (§23).
- Non è una funzione di traduzione o mediazione linguistica: quella resta un'offerta di servizio accessoria e trasversale, di competenza del dominio Servizi (`mercati-internazionali.md` §9).

**Tavola dei confini semantici.** La tabella distingue i ventidue concetti la cui separazione è obbligatoria per questo mapping, indicando la natura di ciascuno e il dominio (o la collocazione) di appartenenza.

| Concetto | Natura | Dominio/collocazione | Confine principale |
|---|---|---|---|
| Stato | Entità giuridico-politica esterna | Catalogo territoriale condiviso (referenziato, §6) | Distinto da Mercato: vedi "Distinzioni obbligatorie" |
| Territorio | Entità geografico-amministrativa (città/provincia/regione/Paese) | Catalogo territoriale condiviso (referenziato, §6) | Livello generico; il Paese ne è un livello specifico |
| Continente | Raggruppamento geografico di primo livello | Concetto geografico esterno, non gestito da questo dominio | Componente possibile di un'Area geografica (§5) |
| Regione geografica | Raggruppamento geografico intermedio | Concetto geografico esterno | Componente possibile di un'Area geografica (§5) |
| Macroregione | Raggruppamento geografico ampio, spesso transnazionale | Concetto geografico esterno | Componente possibile di un'Area geografica (§5) |
| Area economica | Raggruppamento per accordo o integrazione economica | Concetto incorporato in Mercato (§5) | Una delle possibili basi costitutive di un Mercato, non l'unica |
| Comunità economica | Cooperazione economica dichiarata, meno integrata di un Blocco | Concetto incorporato in Mercato (§5) | Vedi "Distinzioni obbligatorie" |
| Blocco commerciale | Area economica con accordo multilaterale formalizzato | Concetto incorporato in Mercato (§5) | Caso specifico di Area economica |
| Mercato | Aggregate Root autonomo di questo dominio | Mercati Internazionali (§4) | Costruzione di significato, non sinonimo di nessuna riga precedente |
| Presenza sul mercato | Relazione dichiarata (fatto operativo in corso o cessato) | Mercati Internazionali, tramite riferimento opaco al dichiarante (§9, §11) | Distinta da Interesse ed Esperienza |
| Interesse verso il mercato | Relazione dichiarata (intenzione, non ancora operativa) | Mercati Internazionali, tramite riferimento opaco al dichiarante (§9, §11) | Non implica né presuppone una Presenza |
| Esperienza sul mercato | Fatto dichiarato relativo a una Persona | Mercati Internazionali, tramite riferimento opaco alla Persona (§9, §20) | Non implica competenza commerciale né Presenza d'impresa |
| Operatività sul mercato | Condizione lungo l'asse di stato della relazione | Mercati Internazionali (§11) | Sottoinsieme della Presenza, non un concetto autonomo distinto |
| Partnership | Tipologia di Relazione commerciale internazionale | Mercati Internazionali (§12) | Relazione con una controparte, non un'Attività in sé |
| Distribuzione | Tipologia di Attività internazionale | Classificazione e fatto-istanza di Mercati Internazionali (§7, §12) | Riguarda la rivendita, non la produzione né l'importazione |
| Produzione | Tipologia di Attività internazionale | Come sopra | Attività produttiva diretta nel Mercato |
| Importazione | Tipologia di Attività internazionale | Come sopra | Distinta e non implicata dall'Esportazione |
| Esportazione | Tipologia di Attività internazionale | Come sopra | Distinta e non implicata dall'Importazione |
| Investimento | Tipologia di Attività internazionale | Come sopra | Può esistere senza alcuna Attività commerciale associata |
| Ricerca clienti | Tipologia di Esigenza di internazionalizzazione | Mercati Internazionali (§12) | Bisogno dichiarato, non Relazione commerciale già stabilita |
| Ricerca fornitori | Tipologia di Esigenza di internazionalizzazione | Come sopra | Come sopra |
| Ricerca distributori | Tipologia di Esigenza di internazionalizzazione | Come sopra | Come sopra |
| Ricerca partner | Tipologia di Esigenza di internazionalizzazione | Come sopra | Come sopra |

**Principio di lettura della tavola.** Le prime otto righe (Stato → Blocco commerciale) sono concetti geografico-istituzionali che il Mercato può incorporare come propria composizione (§5-§6), ma con cui non si identifica mai in modo necessario. La riga "Mercato" è il solo Aggregate Root a cui tutte le relazioni successive fanno riferimento. Le tredici righe successive (Presenza → Ricerca partner) sono tutte relazioni o classificazioni che, in quanto concetti di business autonomi e non semplici attributi del soggetto (§9), appartengono a Mercati Internazionali: il dominio le possiede referenziando il soggetto dichiarante tramite un riferimento esterno opaco alla sua identità, senza conoscerne il modello interno.

---

## 4. Nucleo persistente

**Aggregate Root (A01).** Il Mercato internazionale, coerentemente con `reconciliation-report.md` §3.1 ("Aggregate root | Mercato internazionale") e con `01-principi-mapping.md` §3. È l'unico punto attraverso cui la definizione, la composizione e la classificazione di un Mercato vengono lette e modificate.

**Confine dell'Aggregate (A02).** Rientrano nel confine dell'Aggregate Mercato: la propria identità (§14), la propria composizione geo-economica come concetto incorporato (§5, tramite riferimento al catalogo territoriale per la sola componente Paese, §6), la propria descrizione informativa, il proprio stato (§15) e la propria storicizzazione (§17). Non rientrano invece nel confine di questo specifico Aggregate — pur restando di competenza dello stesso dominio, come Aggregate Root distinti (§9, §11-§12) — la Presenza, l'Interesse, l'Attività internazionale, la Relazione commerciale internazionale e l'Esigenza di internazionalizzazione: ciascuna di queste relazioni ha una propria consistenza e un proprio ciclo di vita, indipendenti da quello del Mercato che referenziano.

**Consistenza dell'Aggregate (A03).** Regole invarianti preservate da questo mapping: un Mercato non può essere Attivo senza una descrizione sintetica minima (platform-data-specification.md, scheda Mercato); non è ammessa la duplicazione di due Mercati con la stessa composizione dichiarata come identica (regola equivalente, a livello concettuale, a quella già enunciata per l'unicità del nome/area in `platform-data-specification.md`); un Paese può appartenere a più Mercati e un Mercato può comprendere più Paesi, senza corrispondenza biunivoca obbligatoria (`mercati-internazionali.md` §12, regola 15).

**Ciclo di vita dell'Aggregate (A04).** Il Mercato nasce come proposta (governance centrale, §8 di `mercati-internazionali.md`), viene attivato, può essere messo in evidenza o in manutenzione, e — a differenza della maggior parte degli altri Aggregate della piattaforma — non viene tipicamente né cessato né cancellato, poiché rappresenta un contesto reale che continua a esistere anche quando la piattaforma decide di non presidiarlo più operativamente (`mercati-internazionali.md` §1). Questo ciclo di vita è trattato lungo assi di stato indipendenti al §15.

**Perché il Mercato non incorpora le relazioni d'uso come proprie Entity dipendenti.** Se il Mercato incorporasse la Presenza o l'Interesse come proprie Entity dipendenti (E02), la sua consistenza (A03) dipenderebbe dall'esistenza di uno specifico soggetto dichiarante: un numero potenzialmente enorme e mutevole di relazioni finirebbe per appesantire l'unico punto di lettura e scrittura del Mercato, e ogni nuova Presenza dichiarata richiederebbe di modificare l'Aggregate Mercato stesso. Per questo le relazioni d'uso sono trattate come Aggregate Root distinti (§9, §11-§12), pur restando di proprietà dello stesso dominio Mercati Internazionali: ciascuno referenzia il Mercato per identità stabile (R02) e il soggetto dichiarante tramite un riferimento esterno opaco, senza che l'esistenza o la consistenza del Mercato dipenda mai da nessuna di esse.

---

## 5. Concetti incorporati

Ciascuno dei concetti seguenti resta incorporato nella descrizione del Mercato (VO01/VO02, `02-reference-model.md` §5), perché non ha senso concettuale al di fuori del Mercato che lo utilizza, non richiede una propria identità referenziabile da altri domini, e cambia solidalmente con la descrizione del Mercato.

- **Area geografica** — la componente geografica (continente, regione, macroregione) che concorre a definire il Mercato, senza mai identificarsi con esso (§3). VO02, potenzialmente condiviso in forma con Eventi e Imprese per la propria componente territoriale (§6), ma non gestito come catalogo autonomo da questo dominio.
- **Area economica, Comunità economica, Blocco commerciale** — le componenti economico-istituzionali che possono concorrere a definire il Mercato (§3). VO02: la forma con cui si esprime un'appartenenza a un'unione economica è condivisibile concettualmente, ma resta un attributo descrittivo del Mercato, non un'Entity a sé.
- **Area linguistica** — l'insieme di Paesi o territori che condividono una lingua veicolare rilevante per gli scambi (`mercati-internazionali.md` §3). VO01, incorporato: riferisce le Lingue della Tassonomia condivisa (VO03) senza introdurre un proprio catalogo linguistico.
- **Area commerciale** — il raggruppamento adottato per prassi o convenienza commerciale, anche senza fondamento istituzionale (`mercati-internazionali.md` §3). VO01, incorporato, privo di ciclo di gestione autonomo (a differenza di una Tassonomia, C02): è una qualificazione descrittiva della composizione del Mercato, non un catalogo terzo.
- **Area culturale** — il raggruppamento basato su affinità culturali, storiche o di comunità, incluse le comunità della diaspora (`mercati-internazionali.md` §3, §13). VO01, incorporato: il dominio riconosce che un'Area culturale può essere referenziata trasversalmente a più Mercati (questione aperta, §33), ma nella sua forma attuale resta un attributo descrittivo, non un'Entity autonoma.

**Perché nessuno di questi concetti è separato (E01-E04).** Nessuno richiede una propria identità referenziabile da altri domini (nessun altro dominio ha bisogno di referenziare "un'Area economica" isolatamente da un Mercato); nessuno ha un ciclo di vita distinto da quello della descrizione del Mercato che lo usa; nessuno richiede una storicizzazione propria distinta da quella del Mercato (§17). Applicando la procedura decisionale di `03-convenzioni-architetturali.md` §3, tutti e cinque restano quindi Value Object incorporati o condivisi (VO01/VO02), mai Entity né Classificazioni a governo autonomo (C02).

---

## 6. Riferimento al catalogo territoriale condiviso

**Il Paese non è un'Entity né un Aggregate di questo dominio.** `mercati-internazionali.md` §2 qualifica il Paese come "Entità autonoma (di riferimento); governance centrale"; questo mapping conferma la governance centrale ma ne colloca la responsabilità *fuori* dal dominio Mercati Internazionali, nel catalogo territoriale condiviso già riconosciuto trasversalmente dalla Dependency Map (`domain-dependency-map.md` §14, tabella dei catalochi condivisi, riga "Imprese, Mercati Internazionali, Eventi | Territori") e dal Reference Model come Tassonomia condivisa (VO03, `02-reference-model.md` §5, §12 C02).

**Perché questa collocazione, e non un catalogo proprio.** L'obiettivo architetturale assegnato a questo mapping esclude esplicitamente la progettazione di un catalogo di Paesi o di un database geografico. Se il dominio possedesse un proprio elenco di Paesi, distinto da quello già utilizzato da Persone (Paese di origine/localizzazione), Imprese (sedi) ed Eventi (luogo), si produrrebbe esattamente la duplicazione di catalogo che `01-principi-mapping.md` §2 (principio 2) e `domain-dependency-map.md` §14 vietano espressamente ("Un dominio che introduce una propria tassonomia geografica parallela" è l'anti-pattern esplicitamente segnalato). Il Mercato **referenzia** una o più voci di livello Paese del catalogo territoriale condiviso (VO03), esattamente come un'Impresa referenzia lo stesso catalogo per le proprie sedi: nessuno dei due lo possiede, nessuno dei due lo duplica.

**Cosa il Mercato aggiunge, che il catalogo territoriale non contiene.** Il catalogo territoriale condiviso fornisce l'identificazione geografico-amministrativa (che cos'è, dove si trova, come si chiama un Paese, `01-principi-mapping.md` §6 identità pubblica). Il Mercato aggiunge un livello di significato che il catalogo territoriale non contiene e non deve contenere: la composizione economica (§5), le classificazioni di attività rilevanti (§7), la vita editoriale e le risorse di supporto (§8). È esattamente questa aggiunta di significato — non la geografia in sé — la ragione d'essere del dominio (`mercati-internazionali.md` §1, "Perché è un dominio autonomo e non un semplice attributo dell'Impresa").

**Conseguenza per l'autonomia (§9).** Poiché il Paese è referenziato da un catalogo esterno e non da Persone/Imprese/Professionisti, questo riferimento non viola in alcun modo il principio di autonomia: il catalogo territoriale condiviso non è uno degli undici domini di business (`reconciliation-report.md`, Parte 1) e non rappresenta né Persone né Imprese né Professionisti, ma una infrastruttura geografica trasversale, dello stesso genere già utilizzato da Tassonomia condivisa per Lingua, Competenza e Settore.

---

## 7. Tipologie di attività e canale di accesso

**Tipologia di attività internazionale (C05).** Le **venti** forme già elencate in `mercati-internazionali.md` §5 (Esportazione, Importazione, Distribuzione, Intermediazione, Produzione, Fornitura di servizi, Consulenza, Commercio elettronico transfrontaliero, Investimento diretto, Partecipazione societaria, Franchising, Licenza, Rappresentanza commerciale, Approvvigionamento, Subfornitura, Cooperazione industriale, Ricerca e sviluppo, Formazione, Trasferimento tecnologico, Attività istituzionale o associativa) costituiscono una Classificazione di tipo Tipologia (C05, `02-reference-model.md` §12): non un attributo condiviso da riferire (VO03), ma la natura stessa di un'istanza di Attività internazionale, secondo la distinzione già stabilita in `03-convenzioni-architetturali.md` §3 ("questo valore esisterebbe anche se nessuno lo calcolasse, come una delle alternative già disponibili? Sì → Classificazione").

**Perché questa classificazione è di Mercati Internazionali, così come le istanze che la applicano.** Il vocabolario delle tipologie di attività è un elenco chiuso e stabile (Elenco controllato, C03, oppure Tassonomia leggera C02 se il dominio prevede in futuro l'aggiunta di nuove tipologie con un proprio ciclo di gestione, §33), indipendente da qualunque soggetto dichiarante: la sua esistenza precede e non presuppone alcuna Impresa, Persona o Professionista specifica. Coerentemente con il principio di autonomia (§9), sia il vocabolario sia le singole *istanze* che lo applicano (questa Impresa fa Esportazione verso questo Mercato, tramite la propria Attività internazionale) restano possedute da Mercati Internazionali (§12): l'istanza referenzia il soggetto dichiarante tramite un riferimento esterno opaco, non conoscendone il modello interno.

**Canale di accesso al mercato (C05/C06).** Il modo in cui un'Attività raggiunge concretamente il Mercato — distributore, marketplace, filiale diretta, agente, fiera, rete di vendita (`mercati-internazionali.md` §2) — è trattato con lo stesso principio: un Attributo descrittivo o una Tipologia, posseduto da Mercati Internazionali come vocabolario condiviso, applicato come attributo della singola Attività internazionale, a sua volta posseduta da Mercati Internazionali (§12).

**Settore nel mercato.** Il collegamento tra un'Attività o una Presenza e un Settore economico (`mercati-internazionali.md` §2) referenzia la Tassonomia condivisa dei Settori (VO03, di proprietà di Tassonomia Condivisa, non di Mercati Internazionali): nessuna duplicazione del catalogo dei Settori è introdotta da questo dominio.

---

## 8. Risorsa di supporto al mercato

**Natura (E01/E03).** Un ente, un organismo o una rete che offre supporto all'internazionalizzazione verso un dato Mercato — camera di commercio, ambasciata, associazione, rete imprenditoriale (`mercati-internazionali.md` §2). È un'Entity autonoma di riferimento: ha una propria identità (un nome, un tipo, un ambito), un proprio Mercato o insieme di Mercati di competenza, e può essere referenziata come Fonte (V03) o come parte di un'Evidenza (V02) di verifica (§16).

**Perché resta posseduta da Mercati Internazionali, e non da Imprese/Persone/Professionisti.** Una Risorsa di supporto non è un'Impresa né una Persona della piattaforma nel senso stabilito dai rispettivi domini (`domain-mapping/imprese.md` §4, `domain-mapping/persone.md` §4): è tipicamente un soggetto esterno o istituzionale il cui ruolo, in questo dominio, è dichiarato in funzione del Mercato che supporta, non in funzione di un'identità di business economico o professionale sulla piattaforma (`reconciliation-report.md`, Parte 13, segnala "Organizzazioni istituzionali" come concetto ancora privo di un dominio proprietario dedicato). Fino alla risoluzione di quella questione aperta (richiamata anche al §33), la Risorsa di supporto resta un'Entity di riferimento propria di Mercati Internazionali, senza alcuna dipendenza da Persone, Imprese o Professionisti: referenzia soltanto il Mercato che supporta (relazione interna al dominio, R02) e, se e quando un'Organizzazione istituzionale riceverà un proprio dominio, potrà essere rivista come riferimento a quel dominio (questione aperta, §33), non come incorporazione di Impresa.

**Cosa una Risorsa di supporto non è.** Non è una Partnership commerciale (che è una Relazione commerciale internazionale posseduta da Mercati Internazionali, §12); non è un Partner della piattaforma nel senso già modellato da `platform-data-specification.md` (dominio Partnership, un accordo formale piattaforma-organizzazione, concetto distinto): una Risorsa di supporto può coincidere, nella realtà, con un'organizzazione che è anche Partner della piattaforma, ma i due fatti restano concettualmente e proprietariamente distinti, ciascuno nel proprio dominio.

---

## 9. Principio di autonomia del dominio

**La relazione tra un soggetto e un Mercato è un concetto di business autonomo.** Non è un semplice attributo del soggetto (dell'Impresa, della Persona o del Professionista): è un fatto di business con una propria identità, un proprio ciclo di vita e proprie regole, esattamente come il Mercato stesso. Per questo Mercati Internazionali deve continuare a essere proprietario della semantica della relazione: Presenza (§11), Interesse (§11), Attività internazionale, Relazione commerciale internazionale ed Esigenza di internazionalizzazione (§12), ed ogni altro fatto di business che descriva il rapporto tra un soggetto e un Mercato.

**Cosa significa, e cosa non significa, l'autonomia del dominio.** Autonomia non significa che Mercati Internazionali possa contenere esclusivamente dati "propri" del Mercato, né che il dominio non possa avere alcuna dipendenza in uscita. Significa, più precisamente, che:
- il dominio possiede il modello concettuale della relazione (identità, assi di stato, verifiche, storicizzazione, visibilità, eventi: §11-§18, §24);
- il dominio non conosce i dettagli interni dei domini Persone, Imprese o Professionisti (dati descrittivi, stato, storia, verifiche di quei domini);
- il dominio utilizza esclusivamente un riferimento esterno opaco all'identità del soggetto coinvolto, mai un'incorporazione dei suoi attributi;
- il dominio non dipende dal modello interno dei soggetti: una modifica ai dati descrittivi di un'Impresa o di una Persona non richiede mai alcuna modifica a Mercati Internazionali.

Questo è esattamente lo stesso pattern già adottato dal dominio Appartenenze, che possiede la relazione tra una Persona e un'Impresa (chi anima quale Impresa, con quale ruolo) referenziandone soltanto l'identità, senza conoscere i dettagli descrittivi di nessuno dei due soggetti (`domain-mapping/appartenenze.md` §4-§5, §9).

**Coerenza con la Dependency Map e con `domain-mapping/imprese.md`, senza alcuna revisione.** La Dependency Map (`domain-dependency-map.md` righe D6-D9) e la decisione consolidata 2 di `domain-mapping/imprese.md` (richiamata alla riga V3 della stessa mappa) stabiliscono esattamente questo assetto per `MercatoImpresa`: Imprese referenzia facoltativamente la relazione di mercato (D6), mentre Mercati Internazionali referenzia necessariamente l'identità dell'Impresa o della Persona dichiarante per poter possedere la relazione stessa (D7, D8), e referenzia Appartenenze per il titolo di rappresentanza (D9). Questo documento conferma integralmente questo assetto, senza introdurre alcuna eccezione: il riferimento necessario all'identità del dichiarante (D7, D8, D9) non incorpora mai il modello interno di quel dichiarante, e per questo non contraddice l'autonomia del dominio (`domain-dependency-map.md`, tabella dei cicli, riga "Imprese ↔ Mercati Internazionali": "Apparente, già governato" — le due direzioni riguardano oggetti diversi, la relazione da un lato, l'identità dall'altro).

**Cosa possiede Mercati Internazionali, di conseguenza.** Il Mercato stesso (§4), la sua composizione geo-economica (§5-§6), le classificazioni di Tipologia di attività e Canale di accesso (§7), la Risorsa di supporto al mercato (§8), e il modello concettuale — identità, assi di stato, verifiche, storicizzazione, visibilità, eventi — di Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale ed Esigenza di internazionalizzazione (§11-§12), ciascuna referenziante il soggetto dichiarante tramite un riferimento esterno opaco alla sua identità (R02, `02-reference-model.md` §8).

**Motivazione end-to-end del principio.** Un Mercato ha senso e continuità propria indipendentemente da qualunque Impresa, Persona o Professionista (`mercati-internazionali.md` §1, regola 1 del §12): la sua esistenza, la sua descrizione, le sue risorse di supporto non devono mai dipendere dall'esistenza di un dichiarante specifico, ed effettivamente non ne dipendono (§4). La relazione con cui un soggetto si collega a un Mercato, invece, è per sua natura un fatto che coinvolge un soggetto: pretendere che tale relazione non riferisca in alcun modo a chi la dichiara — come farebbe un dominio senza alcuna dipendenza in uscita — equivarrebbe a spezzare un concetto di business unico in due metà prive di senso l'una senza l'altra. Il riferimento opaco all'identità del dichiarante (D7, D8, D9) è quindi necessario e sufficiente: necessario, perché la relazione non ha senso senza sapere chi la dichiara; sufficiente, perché non richiede mai di conoscere altro del dichiarante oltre alla sua identità stabile. Questo evita, allo stesso tempo, la duplicazione del modello della relazione in ciascun dominio dichiarante (Imprese, Persone, Professionisti dovrebbero altrimenti replicare lo stesso pattern di assi di stato, verifiche e visibilità già descritto da `mercati-internazionali.md` §7-§11) e l'accoppiamento verso il modello interno dei soggetti che il Single Owner Principle e il principio di Reference by Identity (`01-principi-mapping.md` §2, principi 1-2) sono pensati per evitare.

---

## 10. Soggetti e domini in relazione con Mercati Internazionali

Coerentemente con il principio del §9, questa tabella distingue i domini la cui relazione con Mercati Internazionali è posseduta da quest'ultimo (Imprese, Persone, Professionisti, tramite riferimento opaco alla loro identità; Appartenenze, tramite riferimento opaco all'esito di una verifica) dai domini che si limitano a utilizzare il Mercato come riferimento, senza che Mercati Internazionali li conosca in alcun modo.

| Dominio | Chi possiede la relazione | Cosa referenzia Mercati Internazionali | Cosa referenzia il dominio |
|---|---|---|---|
| Imprese | Mercati Internazionali (§9, §19) | L'identità dell'Impresa dichiarante, in modo opaco | Il Mercato (identità); la Tipologia di attività e il Canale di accesso (vocabolario, §7) |
| Persone | Mercati Internazionali (§9, §20) | L'identità della Persona dichiarante, in modo opaco | Il Mercato (identità), quando applicabile |
| Professionisti | Mercati Internazionali (§9, §21) | L'identità del Professionista dichiarante, in modo opaco | Il Mercato (identità), quando applicabile |
| Appartenenze | Il dominio stesso, per la propria relazione Persona-Impresa | L'esito della verifica del titolo di rappresentanza (V01), quando una Persona dichiara per conto di un'Impresa (§26-§27), mai i dati di Persona o Impresa | Non referenzia mai Mercati Internazionali |
| Opportunità e Collaborazioni | Il dominio stesso, per la propria Opportunità o Collaborazione | Nulla: Mercati Internazionali non conosce questi domini | Il Mercato (identità), come contesto; l'Esigenza di internazionalizzazione come possibile origine (§22) |
| Eventi | Il dominio stesso, per il proprio Evento | Nulla | Il Mercato (identità), come Mercato di riferimento di un Evento (fiera, missione commerciale, §22) |
| Contenuti Editoriali | Il dominio stesso | Nulla | Il Mercato (identità), come soggetto trattato da una guida o una notizia (§23) |
| Osservatorio | Il dominio stesso, per le proprie statistiche aggregate | Nulla | Il Mercato (identità), come dimensione di aggregazione statistica (§23) |
| Ricerca | Nessuna proprietà: funzione trasversale di sola lettura | Nulla | Il Mercato (identità), per rispondere a query che attraversano soggetto e Mercato insieme (`mercati-internazionali.md` §1) |
| Notifiche | Nessuna proprietà: reagisce ai fatti accaduti | Nulla | Gli eventi di dominio di Mercati Internazionali (§24) |

**Perché il riferimento opaco a Imprese, Persone, Professionisti e Appartenenze non contraddice l'autonomia del dominio.** Mercati Internazionali referenzia soltanto l'identità stabile del soggetto dichiarante (D7, D8, `domain-dependency-map.md`) o l'esito di una verifica (D9), mai i dati descrittivi, lo stato o la storia di quei domini: una modifica interna a Imprese, Persone, Professionisti o Appartenenze non richiede mai alcuna modifica a questo dominio (§26). Verso Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Ricerca e Notifiche, invece, Mercati Internazionali non ha alcun riferimento in uscita: sono questi domini a referenziare il Mercato, mai il contrario.

---

## 11. Presenza e interesse di mercato

**Collocazione, confermata dal §9.** Presenza di mercato e Interesse di mercato (`mercati-internazionali.md` §4) sono due relazioni distinte, ciascuna con identità propria (R01, Aggregate Root di Mercati Internazionali, §9): non sono attributi né Entity dipendenti del Mercato (§4), ma Aggregate Root a sé, che referenziano il Mercato per identità stabile (R02, relazione interna al dominio) e il soggetto dichiarante — un'Impresa o una Persona — tramite un riferimento esterno opaco alla sua identità (R02, relazione verso il dominio Imprese o Persone).

**Perché restano due relazioni distinte e non un'unica relazione con un attributo di tipo.** Il documento logico stabilisce che Presenza e Interesse hanno requisiti di verifica diversi (§10 del logico) e conseguenze diverse per la Ricerca e l'Osservatorio: comprimerli in un'unica relazione con un solo attributo qualificante obbligherebbe a condividere lo stesso asse di stato per due fatti di natura diversa (un'intenzione non ancora operativa contro un'attività effettivamente in corso), violando la stessa logica già applicata alle quattro dimensioni di stato indipendenti (§15). Questo mapping conferma quindi due Aggregate Root distinti (uno per Presenza, uno per Interesse), entrambi di competenza di Mercati Internazionali.

**Configurazioni di Presenza, tradotte senza perdita rispetto al logico (§4 del logico).** Mercato in cui il soggetto opera già; Mercato servito occasionalmente; Mercato verso cui esporta; Mercato dal quale importa; Mercato nel quale possiede una sede o una presenza stabile; Mercato raggiunto tramite intermediari; Mercato abbandonato/non più attivo. Ciascuna configurazione è un valore lungo l'asse di stato della relazione economica (§15, mutuato dal §7 del logico), non un'Entity separata.

**Configurazioni di Interesse.** Mercato di interesse futuro; Mercato in valutazione. Nessuna delle due implica una Presenza né la esclude (regola 4 del §12 logico, confermata).

**Cosa referenziano Presenza e Interesse.** Il Mercato (identità stabile, obbligatoria, referenziato internamente al dominio); il soggetto dichiarante (identità stabile nel proprio dominio d'origine — Imprese o Persone — tramite riferimento esterno opaco, obbligatorio: la relazione non ha senso senza chi la dichiara); facoltativamente, il Canale di accesso al mercato e la Tipologia di attività come vocabolario condiviso di Mercati Internazionali (§7), quando la Presenza qualifica anche la natura dell'attività svolta.

**Relazione con Attività internazionale (§12).** Una Presenza può avere una o più Attività internazionale associate (§5 del logico): questo mapping conferma che l'Attività internazionale resta un'Entity dipendente dalla Presenza (non un Aggregate autonomo), e quindi di competenza dello stesso dominio che possiede la Presenza — Mercati Internazionali (§9).

---

## 12. Attività, relazioni commerciali ed esigenze di internazionalizzazione

**Attività internazionale.** Entity dipendente (E02, `02-reference-model.md` §5) da una Presenza di mercato (§11): non ha identità autonoma indipendente dalla Presenza a cui appartiene, e per questo segue la stessa collocazione proprietaria della Presenza che la contiene — Mercati Internazionali (§9). Referenzia come Classificazione (C05, §7) la Tipologia di attività (una o più, contemporaneamente: `mercati-internazionali.md` §5, "una stessa Attività può essere, ad esempio, sia distribuzione sia rappresentanza commerciale") e, come attributo descrittivo, il Canale di accesso al mercato.

**Relazione commerciale internazionale.** Aggregate Root (R01) di Mercati Internazionali (§9): il legame con un soggetto esterno specifico — cliente, fornitore, distributore, agente, partner, investitore (`mercati-internazionali.md` §6) — nel contesto di un Mercato, dichiarato da un'Impresa, una Persona o un Professionista. Referenzia il Mercato per identità (R02, interno al dominio); referenzia il soggetto dichiarante tramite un riferimento esterno opaco alla sua identità (R02, verso Imprese, Persone o Professionisti); referenzia, quando il soggetto esterno con cui la relazione è instaurata è a propria volta un'Impresa o un Professionista della piattaforma, quell'identità nel proprio dominio d'origine, senza incorporarne il modello interno. Quando il soggetto esterno non ha alcuna rappresentazione sulla piattaforma, resta un riferimento puramente informativo (VO01), coerente con il principio già stabilito al §6 del logico ("non pretendere di possederne l'identità o governarne l'esistenza").

**Esigenza di internazionalizzazione.** Aggregate Root (R01) di Mercati Internazionali: un bisogno concreto (ricerca clienti, fornitori, distributori, partner, e le altre tipologie del §8 del logico) relativo a un Mercato specifico o non ancora individuato, dichiarato da un'Impresa, una Persona o un Professionista. Referenzia il Mercato per identità quando individuato; può esistere senza alcun Mercato referenziato, quando il bisogno non è ancora stato circoscritto geograficamente (coerente con `mercati-internazionali.md` §2, "relativo a un Mercato specifico o non ancora individuato"); referenzia sempre il soggetto dichiarante tramite un riferimento esterno opaco alla sua identità.

**Perché queste tre Entity/Aggregate sono di competenza di Mercati Internazionali, pur referenziando sempre un soggetto dichiarante.** Tutte e tre richiedono, per esistere, un soggetto dichiarante: un'Attività internazionale non ha senso senza la Presenza di un'Impresa o di una Persona che la svolge; una Relazione commerciale non ha senso senza un dichiarante che la afferma; un'Esigenza non ha senso senza chi la esprime. Questo, per il principio del §9, non le rende di competenza del dominio del dichiarante: il fatto di business "relazione con il mercato" resta unico e proprietario di Mercati Internazionali, che referenzia il dichiarante solo per identità, mai per incorporarne il modello.

**Cosa resta comunque di competenza di Mercati Internazionali in questo gruppo di concetti.** Il vocabolario delle venti Tipologie di attività internazionale (§7); il vocabolario dei Canali di accesso al mercato (§7); il Mercato stesso come bersaglio del riferimento; e, per il principio del §9, ogni istanza di Attività, Relazione commerciale o Esigenza dichiarata da un soggetto.

**Relazione con Opportunità e Collaborazioni.** Confermato dal logico (§8, regola 16 del §12): un'Esigenza può generare un'Opportunità o una Collaborazione in quei domini, senza che Mercati Internazionali ne acquisisca la proprietà. Il collegamento è trattato al §22.

---

## 13. Responsabilità del dominio

**Cosa rientra nel dominio, confermato dal §9.** Il Mercato internazionale come Aggregate Root autonomo, la sua identità e il suo ciclo di vita (§4, §14-§15); la sua composizione geo-economica come concetto incorporato (§5); il riferimento — non la definizione — alla componente territoriale tramite il catalogo condiviso (§6); il vocabolario delle Tipologie di attività internazionale e dei Canali di accesso al mercato (§7); la Risorsa di supporto al mercato (§8); il modello concettuale — identità, assi di stato, verifiche, storicizzazione, visibilità, eventi — della Presenza di mercato e dell'Interesse di mercato (§11), dell'Attività internazionale, della Relazione commerciale internazionale e dell'Esigenza di internazionalizzazione (§12); la storicizzazione, la verifica e la visibilità di tutto quanto sopra (§16-§18); gli eventi di dominio propri di tutte queste entità (§24).

**Come il dominio possiede queste relazioni, senza conoscere i dettagli dei domini-soggetto.** Ciascuna delle cinque relazioni referenzia il soggetto dichiarante — un'Impresa, una Persona o un Professionista — tramite un riferimento esterno opaco alla sua identità (§9): mai i suoi dati descrittivi, il suo stato o la sua storia. È questo riferimento opaco, non l'assenza di ogni riferimento, a garantire l'autonomia del dominio.

**Cosa non rientra nel dominio, confermato senza variazioni rispetto al logico (`mercati-internazionali.md` §1).**
- L'Impresa in quanto tale (dati descrittivi, sedi, settori, servizi, prodotti, certificazioni, canali, media): dominio Imprese.
- La Persona in quanto tale (identità, competenze dichiarate, lingue parlate, storie personali): dominio Persone.
- L'Appartenenza (chi anima quale Impresa, con quale ruolo): dominio Appartenenze.
- Le Opportunità e le Collaborazioni: possono nascere da un'Esigenza (§12) ma non sono incorporate qui.
- Gli Eventi: possono referenziare un Mercato ma non sono gestiti qui.
- I Contenuti Editoriali e l'Osservatorio: referenziano il Mercato come soggetto trattato o come dimensione di aggregazione, senza che questo dominio produca contenuti o statistiche.
- L'identità digitale e i diritti di accesso: dominio Identità & Accessi.
- I servizi linguistici come offerta strutturata: dominio Servizi.

**Quali domini utilizza Mercati Internazionali.** Il catalogo territoriale condiviso (§6, per la sola componente Paese); se e quando applicabile, la Tassonomia condivisa per eventuali classificazioni trasversali del Mercato stesso (analogamente a come Imprese referenzia Settore e Lingua, `domain-dependency-map.md` D4); per il riferimento opaco all'identità del dichiarante richiesto dalle relazioni possedute al §9, Imprese, Persone e Professionisti (§10, §19-§21); e, quando una Persona dichiara per conto di un'Impresa, Appartenenze, per la sola verifica del titolo di rappresentanza (§26-§27).

**Quali domini utilizzano Mercati Internazionali.** Imprese, Persone, Professionisti, quando referenziano il Mercato per identità dalle proprie strutture (§19-§21); Opportunità e Collaborazioni; Eventi; Contenuti Editoriali; Osservatorio; Ricerca; Notifiche (§10, §22-§23).

**Perché questa è ancora la stessa responsabilità concettuale del dominio, e non un dominio diverso.** Il dominio continua a rispondere alle stesse domande che il logico gli attribuisce (`mercati-internazionali.md` §1, "quali problemi risolve"): cos'è un Mercato, come è composto, quali risorse istituzionali lo sostengono, e — in quanto concetto di business autonomo — quali relazioni un soggetto ha con esso. Risponde direttamente, *al proprio interno*, a "quali soggetti hanno una Presenza in un determinato Mercato" tramite le proprie relazioni (§11-§12), pur senza poter mostrare i dati descrittivi di quei soggetti: quella parte della risposta richiede un'interrogazione trasversale (Ricerca, §10) che attraversa Mercati Internazionali e Imprese/Persone/Professionisti insieme, esattamente come la Ricerca già attraversa Persone/Imprese/Appartenenze senza che nessuno dei domini coinvolti incorpori gli altri (coerente con `domain-mapping/appartenenze.md`, che risolve in modo analogo il ciclo apparente Persone↔Imprese).

---

## 14. Identità

**Identità del Mercato (A01, E03).** Il Mercato ha un'identità stabile propria, indipendente da qualunque denominazione corrente: la denominazione (§3) può essere aggiornata — per esempio in seguito a un cambio di composizione geo-economica — senza che ciò implichi la creazione di un nuovo Mercato né invalidi i riferimenti già stabiliti da altri domini (E03, referenziato in modo condiviso da Imprese, Persone, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio). Questo è lo stesso principio già enunciato al §13 del logico per il cambio di denominazione di un Paese, qui estesa coerentemente al Mercato stesso.

**Unicità.** Non è ammessa la duplicazione di due Mercati con composizione dichiarata come identica (A03, §4): la creazione di un nuovo Mercato è un atto di governance centrale (`mercati-internazionali.md` §1), non un'operazione che un dominio utilizzatore possa richiedere implicitamente.

**Identità della Risorsa di supporto al mercato (E01).** Ha un'identità propria, stabile, indipendente da quella del Mercato che supporta: una stessa Risorsa può essere di competenza di più Mercati (§8), e un Mercato può avere più Risorse di supporto associate, senza corrispondenza biunivoca.

**Assenza di identità propria per i concetti incorporati.** Area geografica, Area economica, Comunità economica, Blocco commerciale, Area linguistica, Area commerciale, Area culturale (§5) non hanno un'identità referenziabile da altri domini: sono descritti come attributi del Mercato, non come Entity con una propria vita (coerente con la decisione del §5, motivata dall'assenza di criteri E01-E04 applicabili).

**Identità propria di Presenza, Interesse, Relazione commerciale ed Esigenza (E03).** Coerentemente con il §9, questi concetti hanno un'identità propria (R01, Aggregate Root) in Mercati Internazionali: ciascuno referenzia il Mercato per identità stabile (relazione interna al dominio) e il soggetto dichiarante tramite un riferimento esterno opaco alla sua identità (verso Imprese, Persone o Professionisti), senza mai incorporarne il modello interno. L'Attività internazionale (§12), in quanto Entity dipendente dalla Presenza, non ha invece un'identità autonoma indipendente da essa.

---

## 15. Assi di stato

Coerentemente con il pattern degli assi indipendenti (S01-S08, `02-reference-model.md` §7) e con l'approccio già adottato in `domain-mapping/imprese.md` §11 e in `domain-mapping/appartenenze.md`, il Mercato e la Risorsa di supporto al mercato mantengono assi di stato distinti, mai compressi in un'unica proprietà.

**Assi di stato del Mercato.**
- **Stato sostanziale (S01).** Proposto → Attivo → In evidenza (opzionale, non esclusivo rispetto ad Attivo) → In manutenzione (temporaneo) → Non presidiato. A differenza della maggior parte degli altri Aggregate della piattaforma, questo asse non prevede tipicamente un valore "Cessato" o "Cancellato" in senso definitivo: un Mercato rappresenta un contesto reale che continua a esistere anche quando la piattaforma smette di presidiarlo operativamente (§4; `mercati-internazionali.md` §1). "Non presidiato" descrive questa condizione senza pretendere che il Mercato in sé sia scomparso.
- **Stato editoriale (S02).** In redazione → Pubblicato → In revisione (temporaneo, non esclude Pubblicato) → Da aggiornare, riferito alla descrizione informativa e alle risorse di supporto associate (§8), distinto dallo Stato sostanziale: un Mercato può essere sostanzialmente Attivo con una descrizione ancora In redazione.
- **Stato storico (S08).** Ogni transizione di composizione geo-economica dichiarata (§5) resta storicizzata (§17): un Mercato la cui composizione è stata rivista mantiene traccia della composizione precedente, senza che questo implichi la creazione di un nuovo Mercato (§14).

**Assi di stato della Risorsa di supporto al mercato.**
- **Stato sostanziale (S01).** Segnalata → Attiva → Non più attiva/Archiviata, un ciclo più semplice di quello del Mercato, perché la Risorsa non è governance centrale nello stesso senso: può cessare di esistere o di essere rilevante senza che questo abbia le stesse implicazioni della cessazione di un Mercato.
- **Stato di verifica (S03).** Trattato al §16, come asse indipendente e non integrato nello Stato sostanziale.

**Perché non è previsto uno Stato di pubblicazione (S04) distinto per il Mercato.** A differenza di un'Impresa o di una Persona, per cui la pubblicazione richiede una scelta esplicita del soggetto titolare (`domain-mapping/imprese.md` §15, `domain-mapping/persone.md`), la descrizione di un Mercato è per sua natura un contenuto di governance centrale, non un dato personale o commerciale di un soggetto terzo: il suo Stato editoriale (S02, "Pubblicato") assorbe la funzione che altrove richiederebbe un asse S04 distinto, senza perdita di significato, perché nessun principio di non-automaticità (§18) si applica alla descrizione del Mercato in sé.

**Assi di stato di Presenza, Interesse, Attività, Relazione commerciale ed Esigenza.** Coerentemente con il §9, il modello a quattro assi già descritto da `mercati-internazionali.md` §7 (stato editoriale della dichiarazione, stato della relazione economica, stato di verifica, visibilità) è applicato integralmente da Mercati Internazionali a ciascuna istanza di queste relazioni, citando lo stesso codice S01-S08 per garantire l'uniformità richiesta da `03-convenzioni-architetturali.md` §2. L'applicazione di questi assi non richiede mai di conoscere il modello interno del soggetto dichiarante: referenzia soltanto la sua identità, in modo opaco.

---

## 16. Verifiche

**Verifiche di competenza di questo dominio, confermato dal §9.** Le Verifiche elencate al §10 del logico (presenza effettiva, attività dichiarata, relazione commerciale, sede estera, esportazione/importazione, partner indicato, esperienza della Persona, competenza linguistica, interesse futuro) riguardano tutte un fatto posseduto da Mercati Internazionali (§11-§12): la loro titolarità (V01, chi conduce la Verifica e su quale fatto) segue quella del fatto verificato, e sono quindi di competenza di questo documento, non dei mapping fisici di Imprese, Persone e Professionisti. La conduzione pratica di una Verifica può comunque coinvolgere un'Evidenza (V02) o una Fonte (V03) originata nel dominio del soggetto dichiarante (per esempio un documento caricato nel proprio profilo), senza che questo trasferisca la titolarità della Verifica.

**Verifica relativa alla Risorsa di supporto.** Resta inoltre di competenza di questo dominio l'**Appartenenza a reti o istituzioni** (§10 del logico), quando riguarda il riconoscimento di un soggetto da parte di una Risorsa di supporto al mercato (§8) che questo dominio possiede direttamente: la Risorsa di supporto stessa può fungere da Fonte (V03) o fornire un'Evidenza (V02) per una Verifica di Presenza, Attività o Relazione commerciale.

**Fonti previste per la Risorsa di supporto (V03).** Comunicazione diretta della Risorsa; documentazione istituzionale pubblica; redazione della piattaforma. Coerente con l'elenco più ampio già stabilito al §10 del logico, qui limitato a quanto rilevante per un'Entity di cui questo dominio è proprietario.

**Perché nessun badge unico anche in questo dominio.** Coerentemente con il principio già stabilito al §10 del logico e applicato in modo identico in `domain-mapping/imprese.md` §12 e in `domain-mapping/appartenenze.md`, questo mapping non introduce alcun indicatore complessivo di "Mercato verificato" o "Risorsa verificata": ogni Verifica resta un asse indipendente (V01, S03), riferito a un aspetto nominato, mai un giudizio complessivo (V05) memorizzato come dato sorgente.

---

## 17. Temporalità e storicizzazione

**Validità e storicizzazione del Mercato (T01, S08).** La composizione geo-economica di un Mercato (§5) può essere rivista nel tempo (per esempio in seguito a un nuovo accordo economico o a un cambiamento istituzionale rilevante): ogni revisione è storicizzata, mantenendo consultabile la composizione precedentemente dichiarata, senza che la revisione invalidi retroattivamente i riferimenti già stabiliti da altri domini in un momento in cui la composizione precedente era quella corrente.

**Cronologia (T07) del Mercato.** L'intera sequenza delle transizioni di Stato sostanziale ed editoriale (§15) e delle revisioni di composizione (sopra) è conservata come Storia (T07), coerentemente con il pattern generale di storicizzazione (`02-reference-model.md` §14) e con quanto già applicato in `domain-mapping/imprese.md` §14.

**Storicizzazione della Risorsa di supporto.** Una Risorsa di supporto non più attiva (§15) resta consultabile in forma storica: la sua cessazione non implica la cancellazione dei riferimenti già stabiliti (per esempio da una Verifica passata, §16) che l'hanno coinvolta.

**Storicizzazione delle relazioni d'uso.** La storicizzazione della Presenza, dell'Interesse, dell'Attività, della Relazione commerciale e dell'Esigenza — inclusa la regola per cui una Presenza Conclusa o Interrotta non deve cancellarne automaticamente lo storico (`mercati-internazionali.md` §12, regola 12) — è di competenza di Mercati Internazionali, per la stessa ragione già motivata al §9: la Storia di un fatto appartiene a chi possiede il fatto, e questo dominio possiede il fatto anche quando referenzia, per identità, il soggetto che lo ha dichiarato.

---

## 18. Visibilità e pubblicazione

**Visibilità del Mercato (VIS01-VIS06).** Il Mercato esiste (VIS01) dal momento della propria proposta (§15); diventa accessibile e consultabile (VIS02, VIS03) secondo lo Stato editoriale; è pubblicato e indicizzato (VIS04, VIS05) quando lo Stato editoriale raggiunge "Pubblicato", rendendolo reperibile tramite ricerca o navigazione. Non si applica, di norma, la Riservatezza (VIS06): un Mercato è per natura un contenuto di governance centrale destinato alla consultazione pubblica, salvo il periodo transitorio "In redazione" (S02) che precede la prima pubblicazione.

**Visibilità della Risorsa di supporto.** Segue lo stesso schema: pubblica una volta attiva e redatta, salvo la possibilità — non un obbligo — di trattare temporaneamente come non ancora consultabile (VIS03) una Risorsa segnalata ma non ancora verificata redazionalmente.

**Il principio di non-automaticità del §11 del logico si applica direttamente a questo dominio.** Il principio per cui "la pubblicazione di clienti, fornitori, partner, volumi o relazioni commerciali non deve mai essere automatica" (`mercati-internazionali.md` §11) riguarda informazioni la cui pubblicazione potrebbe esporre un soggetto terzo (un'Impresa, una Persona, una controparte commerciale): poiché Mercati Internazionali possiede la Presenza, l'Interesse, l'Attività, la Relazione commerciale e l'Esigenza (§9, §11-§12), è questo dominio ad applicare direttamente il principio, con lo stesso rigore già richiesto da `domain-mapping/imprese.md` §15 e da `domain-mapping/appartenenze.md` §15 per le proprie informazioni sensibili. La descrizione del Mercato in sé, al contrario, non incorpora mai un dato personale o commerciale di un soggetto terzo: non richiede quindi una scelta di visibilità esplicita equivalente, restando governata dal semplice Stato editoriale (sopra).

**Coerenza con i soggetti coinvolti.** Il principio per cui la visibilità di una Presenza o di una Relazione commerciale non può eccedere quella dell'Impresa, della Persona o dell'Appartenenza coinvolta (`mercati-internazionali.md` §11, regola 17 del §12) è applicato da Mercati Internazionali al momento di pubblicare la relazione: il dominio verifica, tramite il riferimento opaco all'identità del soggetto, che la visibilità corrente di quel soggetto (letta come dato pubblico esposto dal dominio Imprese, Persone o Appartenenze, non incorporato) non venga eccedibile dalla relazione che referenzia quel soggetto.

---

## 19. Relazione con Imprese

**Direzione della dipendenza.** Mercati Internazionali → Imprese, necessaria e opaca, per la sola identità del dichiarante (§9, `domain-dependency-map.md` D7); Imprese → Mercati Internazionali, facoltativa, per il Mercato e il vocabolario condiviso (D6). Mercati Internazionali possiede `PresenzaDiMercato`, `InteresseDiMercato` (§11) e le relative Attività internazionale (§12) dichiarate da un'Impresa, come propri Aggregate Root/Entity, ciascuno referenziante il Mercato per identità stabile (relazione interna) e l'identità dell'Impresa dichiarante tramite un riferimento esterno opaco (R02).

**Cosa referenzia Mercati Internazionali di Imprese.** Esclusivamente l'identità stabile dell'Impresa dichiarante (E03), quando esiste una Presenza, un Interesse o un'Attività dichiarata: nessun dato descrittivo dell'Impresa (denominazione, settore, sedi, canali, prodotti: `domain-mapping/imprese.md` §5-§8), che resta di esclusiva competenza del dominio Imprese e non viene mai incorporato.

**Cosa referenzia Imprese di Mercati Internazionali.** Il Mercato (identità, §14); la Tipologia di attività internazionale e il Canale di accesso al mercato come vocabolario condiviso (§7); eventualmente la Risorsa di supporto al mercato (§8), quando un'Impresa dichiara di essere stata assistita da una specifica Risorsa. Nessun elenco delle Imprese presenti in un dato Mercato è ottenibile navigando all'interno di Mercati Internazionali senza attraversare anche Imprese: quella vista richiede un'interrogazione trasversale (Ricerca, §10).

**Coerenza con la decisione consolidata di `domain-mapping/imprese.md`.** Questo mapping conferma integralmente la decisione consolidata 2 di `domain-mapping/imprese.md` (Mercati Internazionali proprietario esclusivo di `MercatoImpresa`, Imprese referenzia soltanto): nessuna eccezione è introdotta rispetto a quella decisione.

---

## 20. Relazione con Persone

**Direzione della dipendenza.** Mercati Internazionali → Persone, necessaria e opaca, per la sola identità della dichiarante (§9, `domain-dependency-map.md` D8); Persone → Mercati Internazionali, facoltativa, per il Mercato (analoga a D6). Mercati Internazionali possiede la Presenza, l'Interesse e l'Esperienza sul mercato dichiarati da una Persona a titolo individuale (§11), ciascuno referenziante il Mercato per identità (relazione interna) e l'identità della Persona dichiarante tramite un riferimento esterno opaco.

**Persona collegata a un Mercato indipendentemente da un'Impresa.** Confermato dal logico (§13, caso "Persona con forti relazioni in un Paese ma Impresa non ancora attiva"): una Persona può dichiarare competenze, esperienza o reti relative a un Mercato indipendentemente dal fatto che un'Impresa a cui è collegata tramite Appartenenza abbia una propria Presenza in quel Mercato. Questo mapping conferma che tale dichiarazione, quando fatta a titolo individuale, resta posseduta da Mercati Internazionali (§9), referenziando l'identità della Persona e non quella dell'Impresa.

**Cosa referenzia Mercati Internazionali di Persone.** Esclusivamente l'identità stabile della Persona dichiarante (E03): nessun dato identitario o descrittivo della Persona (`domain-mapping/persone.md` §5 e seguenti), nessuna LinguaParlata, nessuna competenza dichiarata, che restano di esclusiva competenza del dominio Persone. Nessun elenco delle Persone con esperienza rilevante per un dato Mercato è ottenibile navigando all'interno di Mercati Internazionali senza attraversare anche Persone: quella vista richiede un'interrogazione trasversale (§10).

---

## 21. Relazione con Professionisti

**Direzione della dipendenza.** Mercati Internazionali → Professionisti, necessaria e opaca, per la sola identità del dichiarante, quando applicabile (§9); Professionisti → Mercati Internazionali, facoltativa, per il Mercato. Mercati Internazionali possiede la Relazione commerciale internazionale e l'Esigenza di internazionalizzazione dichiarate nell'ambito dell'attività professionale di un Professionista (§12), referenziando il Mercato per identità (relazione interna) e l'identità del Professionista tramite un riferimento esterno opaco.

**Professionista come parte di una Relazione commerciale o come Risorsa di supporto.** Confermato dal logico (§6): un Professionista può essere referenziato come controparte di una Relazione commerciale internazionale dichiarata da un'Impresa o da una Persona (es. un consulente per un Mercato) — nel qual caso Mercati Internazionali referenzia il Profilo professionale per identità come controparte, non come dichiarante — oppure, quando il Professionista opera a titolo proprio in un Mercato, la stessa Relazione commerciale o Esigenza è dichiarata direttamente dal Professionista, secondo lo stesso principio già applicato a Imprese e Persone.

**Cosa referenzia Mercati Internazionali di Professionisti.** Esclusivamente l'identità stabile del Professionista (E03), come dichiarante o come controparte: nessun dato del Profilo professionale, nessuna competenza dichiarata, nessuna relazione contrattuale specifica, che restano di competenza del dominio Professionisti (o del dominio Appartenenze, quando l'attività professionale è strutturata in forma di Impresa).

---

## 22. Relazione con Opportunità, Collaborazioni ed Eventi

**Opportunità e Collaborazioni.** Il collegamento resta esattamente quello già stabilito dal logico (§8, regola 16 del §12): un'Esigenza di internazionalizzazione — posseduta da Mercati Internazionali (§12) — può generare un'Opportunità o una Collaborazione in quei domini. Mercati Internazionali possiede l'Esigenza ma non l'Opportunità/Collaborazione che ne nasce: referenzia soltanto, se e quando un'Opportunità o una Collaborazione scelgono di qualificarsi con un Mercato di riferimento, la propria identità come bersaglio di quel riferimento (R02), senza che questo introduca alcuna dipendenza in uscita da Mercati Internazionali verso Opportunità o Collaborazioni.

**Eventi.** Un Evento (fiera, missione commerciale) può referenziare uno o più Mercati come proprio contesto (`mercati-internazionali.md` §1, "quali domini utilizzano"): la relazione è, anche in questo caso, unidirezionale da Eventi verso Mercati Internazionali. Mercati Internazionali non gestisce iscrizioni, capienze o partecipazioni (confermato senza variazioni rispetto al logico §1), e non possiede alcun elenco degli Eventi collegati a un proprio Mercato, ottenibile solo per interrogazione trasversale.

**Perché nessuna di queste relazioni introduce un ciclo.** In nessuno dei tre casi Mercati Internazionali referenzia a propria volta Opportunità, Collaborazioni o Eventi: l'assenza di riferimento in uscita, non la sola direzione dichiarata, è la garanzia strutturale contro il ciclo (§27).

---

## 23. Relazione con Contenuti Editoriali e Osservatorio

**Contenuti Editoriali.** Una guida o una notizia dedicata a un Mercato referenzia il Mercato come soggetto trattato (`mercati-internazionali.md` §1), senza che Mercati Internazionali gestisca o possieda alcun contenuto editoriale. La relazione è identica, per struttura, a quella già stabilita da altri domini narrati da Contenuti Editoriali (`domain-dependency-map.md`, dipendenze D30-D36): Contenuti Editoriali referenzia il soggetto narrato senza incorporarne gli attributi.

**Osservatorio.** Mercati Internazionali alimenta l'Osservatorio con dati aggregabili — l'identità del Mercato come dimensione di aggregazione statistica, e i fatti sorgente di Presenza, Attività o Relazione commerciale che possiede (§9, §11-§12) — ma non produce esso stesso report o statistiche (confermato senza variazioni rispetto al logico §1): i dati aggregati che l'Osservatorio produce sui fatti dichiarati (§10 del logico) provengono direttamente da Mercati Internazionali, proprietario di quei fatti.

**Perché l'aggregazione statistica non introduce una dipendenza di Mercati Internazionali verso l'Osservatorio.** Un indicatore dell'Osservatorio calcolato su più Presenze di mercato è una Relazione derivata (R05, `02-reference-model.md` §7), posseduta e mantenuta dall'Osservatorio a partire dai fatti sorgente che Mercati Internazionali possiede (§9, §11-§12) e rende disponibili: esattamente il principio già enunciato in `02-reference-model.md` §7 per R05, per cui il dominio sorgente dei dati non deve mai dipendere dal dominio che li aggrega.

---

## 24. Eventi di dominio

**Eventi propri del Mercato e della Risorsa di supporto, confermati dal §9.**
- **MercatoDefinito** — un nuovo Mercato è stato costituito come ecosistema di riferimento sulla piattaforma (`mercati-internazionali.md` §14, confermato).
- **MercatoAttivato** — il Mercato ha raggiunto lo Stato sostanziale "Attivo" (§15).
- **ComposizioneMercatoRevisionata** — la composizione geo-economica del Mercato (§5) è stata aggiornata, con storicizzazione della composizione precedente (§17). Corrisponde, con perimetro più preciso, all'evento **AreaEconomicaDefinita** del logico (§14), qui riformulato perché l'Area economica non è un'Entity autonoma in questo mapping (§5) ma un attributo del Mercato.
- **MercatoNonPresidiato** — il Mercato è transitato allo stato "Non presidiato" (§15), senza che questo equivalga a una cancellazione.
- **DescrizioneMercatoPubblicata** — lo Stato editoriale del Mercato ha raggiunto "Pubblicato" (§15, §18).
- **RisorsaSupportoRegistrata** — una nuova Risorsa di supporto al mercato è stata registrata (§8).
- **RisorsaSupportoAttivata** — una Risorsa di supporto ha raggiunto lo Stato sostanziale "Attiva" (§15).
- **RisorsaSupportoCessata** — una Risorsa di supporto non è più attiva, restando storicizzata (§17).

**Eventi propri delle relazioni d'uso, possedute da questo dominio secondo il §9.** `PresenzaMercatoDichiarata`, `PresenzaMercatoVerificata`, `PresenzaMercatoContestata`, `InteresseMercatoDichiarato`, `AttivitàInternazionaleAvviata/Modificata/Sospesa/Conclusa`, `RelazioneCommercialeDichiarata/Confermata/Contestata`, `EsigenzaInternazionalizzazioneRegistrata`, `FonteMercatoAggiornata` e `VisibilitàInformazioneMercatoModificata`, tutti previsti dal logico al proprio §14, sono generati da Mercati Internazionali (EV01-EV04, `02-reference-model.md` §10), che referenzia il soggetto dichiarante — Impresa, Persona o Professionista — tramite riferimento esterno opaco quando la propria identità è coinvolta nell'evento.

**Conseguenze di dominio, confermate senza variazioni di principio rispetto al logico (§14).** Ogni evento di questo elenco, generato da Mercati Internazionali, è un fatto accaduto che altri domini (Notifiche, Ricerca, Osservatorio) possono voler conoscere per reagire, senza che il dominio generatore debba conoscere né gestire direttamente tali reazioni. La direzione di consumo di questi eventi (chi reagisce) non introduce alcuna dipendenza di Mercati Internazionali verso chi reagisce, coerentemente con il meccanismo "fatti accaduti" del Domain Model (§10).

---

## 25. Dati sorgente, derivati e aggregati

**Dati sorgente (D01/D02) di competenza di Mercati Internazionali.** La denominazione e la descrizione del Mercato (dichiarati dalla governance centrale, non da un utente: D01 più che D02 in senso proprio); la composizione geo-economica dichiarata (§5); i dati identificativi della Risorsa di supporto al mercato (§8, D02 quando dichiarati dalla Risorsa stessa, D01 quando osservati dalla redazione); i dati dichiarati relativi a Presenza, Interesse, Attività, Relazione commerciale ed Esigenza (D02, confermato dal §9); i relativi dati verificati (D03, secondo l'esito delle proprie Verifiche, §16). In ciascuno di questi ultimi casi il dato sorgente include un riferimento esterno opaco all'identità del soggetto dichiarante, mai i suoi dati descrittivi.

**Dati storici (D08).** Le composizioni geo-economiche precedenti del Mercato (§17); le Risorse di supporto non più attive (§17); la storicizzazione delle relazioni d'uso (§17).

**Dati derivati e aggregati (D04/D05/D06) che coinvolgono questo dominio.** Gli indicatori dell'Osservatorio che aggregano Presenze, Attività o Relazioni commerciali per Mercato (es. "numero di Imprese con Presenza attiva nel Mercato X") sono Dati aggregati (D06) di competenza dell'Osservatorio, costruiti a partire dai dati sorgente posseduti da Mercati Internazionali (§9, sopra). Nessun dato aggregato di questo tipo è calcolato o memorizzato da Mercati Internazionali stesso.

**Perché questa distinzione ha valore architetturale, non solo descrittivo.** Anche possedendo i dati sorgente delle relazioni d'uso, Mercati Internazionali non calcola né conserva propri indicatori aggregati: mantenere questa separazione evita che il dominio proprietario dei fatti si carichi anche della responsabilità, diversa per natura, di calcolo statistico e reportistica. L'Osservatorio, dominio già esplicitamente dedicato a questa funzione (`mercati-internazionali.md` §1, "non rientra l'Osservatorio"), resta l'unico punto in cui l'aggregazione è legittima, coerentemente con il principio già confermato in `domain-mapping/imprese.md` D12.

---

## 26. Dipendenze del dominio

**Dipendenze in uscita da Mercati Internazionali (verso cosa questo dominio referenzia), confermate dal §9.**

| Verso | Necessità | Cosa referenzia | Motivazione |
|---|---|---|---|
| Catalogo territoriale condiviso (Territori) | Necessaria, per la componente Paese | La voce di livello Paese del catalogo condiviso | Evitare la duplicazione di un catalogo geografico proprio (§6); coerente con `domain-dependency-map.md` §14, riga "Imprese, Mercati Internazionali, Eventi \| Territori" |
| Tassonomia condivisa | Facoltativa | Eventuali classificazioni trasversali del Mercato (es. Settori economici prevalenti, se rappresentati come attributo del Mercato) | Evitare la duplicazione di cataloghi già condivisi (§7), analogamente a `domain-dependency-map.md` D4 |
| Imprese | Necessaria, quando esiste una Presenza, un Interesse o un'Attività dichiarata da un'Impresa | Esclusivamente l'identità stabile e opaca dell'Impresa dichiarante (§9, §19) | La relazione non ha senso senza sapere chi la dichiara; coerente con `domain-dependency-map.md` D7 |
| Persone | Necessaria, quando esiste una Presenza, un Interesse o un'Esperienza dichiarata da una Persona | Esclusivamente l'identità stabile e opaca della Persona dichiarante (§9, §20) | Come sopra; coerente con `domain-dependency-map.md` D8 |
| Professionisti | Necessaria, quando esiste una Relazione commerciale o un'Esigenza dichiarata in ambito professionale | Esclusivamente l'identità stabile e opaca del Professionista dichiarante o controparte (§9, §21) | Come sopra |
| Appartenenze | Necessaria, quando una Persona dichiara una Presenza, un'Attività o una Relazione commerciale per conto di un'Impresa | L'esito della verifica del titolo di rappresentanza (V01), non i dati di Persona o Impresa | Coerente con `domain-dependency-map.md` D9; stesso pattern di riferimento opaco già usato da Appartenenze verso Persone e Imprese |

**Nessuna di queste dipendenze incorpora il modello interno del dominio referenziato.** In ciascun caso, Mercati Internazionali referenzia esclusivamente un'identità stabile o l'esito di una verifica, mai i dati descrittivi, lo stato o la storia del dominio referenziato (§9): è questo — non l'assenza di ogni dipendenza in uscita — a rendere il dominio autonomo in senso proprio.

**Dipendenze in entrata verso Mercati Internazionali (chi referenzia questo dominio).**

| Da | Necessità | Cosa referenzia | Motivazione |
|---|---|---|---|
| Imprese | Facoltativa | Il Mercato (identità); il vocabolario di Tipologia e Canale (§7); le proprie Presenze/Interessi/Attività, possedute da Mercati Internazionali (§19), per mostrarle nel proprio profilo | Vista di lettura, non costitutiva: la relazione resta posseduta da Mercati Internazionali anche quando Imprese la legge (§11-§12); coerente con `domain-dependency-map.md` D6 |
| Persone | Facoltativa | Come sopra, per la propria Presenza/Interesse/Esperienza (§20) | Come sopra |
| Professionisti | Facoltativa | Come sopra, per la propria Relazione commerciale/Esigenza (§21) | Come sopra |
| Opportunità e Collaborazioni | Facoltativa | Il Mercato (identità), come contesto | Qualificazione opzionale, non costitutiva (§22) |
| Eventi | Facoltativa | Il Mercato (identità), come contesto | Come sopra (§22) |
| Contenuti Editoriali | Facoltativa | Il Mercato (identità), come soggetto trattato | Come sopra (§23) |
| Osservatorio | Facoltativa | Il Mercato (identità), come dimensione di aggregazione; i fatti sorgente delle relazioni d'uso (§23, §25) | Come sopra (§23) |

**Direzione canonica delle modifiche.** Coerentemente con `domain-dependency-map.md` (sezione sulla direzione canonica), ogni modifica alla struttura del Mercato o al modello concettuale delle relazioni d'uso (§4-§12) può essere decisa autonomamente da Mercati Internazionali senza richiedere alcuna modifica ai domini che referenzia per identità, salvo l'aggiornamento del riferimento quando l'identità stessa cambia (evento raro, gestito dal dominio proprietario di quell'identità). Al contrario, nessuna modifica ai dati descrittivi interni di Imprese, Persone o Professionisti può mai richiedere una modifica a Mercati Internazionali: è questa asimmetria — non l'assenza di ogni riferimento in uscita — a rendere il dominio autonomo (§9).

---

## 27. Analisi dei cicli

**Imprese ↔ Mercati Internazionali: ciclo apparente, già governato.** Coerentemente con `domain-dependency-map.md` (D6 facoltativa da Imprese verso Mercati Internazionali, per leggere la propria relazione di mercato; D7 necessaria da Mercati Internazionali verso Imprese, per la sola identità del dichiarante, §9, §19, §26), le due direzioni riguardano oggetti diversi — la relazione posseduta da Mercati Internazionali da un lato, l'identità stabile referenziata in modo opaco dall'altro — e non generano un ciclo di consistenza: nessuna scrittura in un dominio richiede mai, come precondizione, una scrittura nell'altro.

**Persone ↔ Mercati Internazionali.** Stesso principio: ciclo apparente, già governato da D8 (necessaria, per la sola identità della Persona dichiarante) e dalla lettura facoltativa di Persone verso le proprie relazioni (§20, §26).

**Professionisti ↔ Mercati Internazionali.** Stesso principio: nessuna criticità, per l'analoga distinzione tra la relazione posseduta da Mercati Internazionali e la sola identità del Professionista referenziata in modo opaco (§21, §26).

**Mercati Internazionali ↔ Appartenenze.** Ciclo apparente, già governato da D9 (necessaria, solo quando una Persona dichiara per conto di un'Impresa): Mercati Internazionali referenzia l'esito della verifica del titolo di rappresentanza, mai i dati di Persona o Impresa; Appartenenze non referenzia mai Mercati Internazionali (§26). Nessuna delle due direzioni richiede la consistenza dell'altra.

**Mercati Internazionali ↔ Tassonomia condivisa/Territori.** Nessun ciclo: Mercati Internazionali referenzia questi cataloghi condivisi (§6, §26) e nessuno di essi referenzia mai Mercati Internazionali, coerentemente con la loro natura di infrastruttura trasversale.

**Mercati Internazionali ↔ Opportunità/Collaborazioni/Eventi/Contenuti Editoriali/Osservatorio.** Nessun ciclo: tutte e cinque le relazioni sono unidirezionali verso Mercati Internazionali (§22-§23, §26); nessuna di queste referenzia mai, in uscita, un fatto posseduto da Mercati Internazionali che a sua volta le referenzi.

**Perché l'assenza di cicli reali qui è strutturale e non solo dichiarata.** In ciascuno dei casi con Imprese, Persone, Professionisti e Appartenenze, l'assenza di ciclo reale deriva dal fatto che le due direzioni di dipendenza referenziano sempre oggetti diversi tra loro indipendenti — la relazione da un lato, l'identità stabile (o l'esito di una verifica) dall'altro — mai lo stesso fatto in entrambi i sensi: nessuna riga della matrice delle dipendenze (§26) descrive Mercati Internazionali come dipendente dal modello interno di uno di questi domini, né viceversa.

---

## 28. Eccezioni motivate rispetto alla soluzione uniforme

Questa sezione raccoglie, secondo lo schema in tre parti stabilito da `03-convenzioni-architetturali.md` §2 e §12 (RC33): soluzione attesa, condizione che la rende inadeguata, soluzione applicata invece.

**Nessuna eccezione relativa all'ownership delle relazioni d'uso.** A differenza di una precedente ipotesi di lavoro, questo documento non introduce alcuna eccezione riguardo alla proprietà di Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale ed Esigenza di internazionalizzazione: la soluzione applicata (Mercati Internazionali proprietario del modello concettuale della relazione, con riferimento esterno opaco al soggetto dichiarante, §9) è esattamente la soluzione uniforme già prevista da `domain-dependency-map.md` (righe D6-D9) e da `domain-mapping/imprese.md` (decisione consolidata 2). Questo mapping la conferma, non la rivede.

### Eccezione 1 — Assenza di un dominio proprietario per le "Organizzazioni istituzionali"

**Soluzione attesa.** La soluzione uniforme, per un concetto come la Risorsa di supporto al mercato (camera di commercio, ambasciata, associazione), sarebbe di referenziare un Aggregate Root di un dominio "Organizzazioni istituzionali" dedicato (VO03, R02), analogamente a come Imprese referenzia Territori o Tassonomia condivisa.

**Condizione che la rende inadeguata.** Questo dominio non esiste ancora nell'inventario degli undici domini analizzati (`reconciliation-report.md` §13, `domain-dependency-map.md` DV3): non c'è, oggi, alcun Aggregate Root da referenziare.

**Soluzione applicata invece.** La Risorsa di supporto al mercato resta un'Entity di riferimento autonoma (E01/E03) propria di Mercati Internazionali (§8), senza alcuna dipendenza da Persone, Imprese o Professionisti. Se e quando un dominio "Organizzazioni istituzionali" verrà formalizzato, questa scelta dovrà essere rivalutata (questione aperta, §33), coerentemente con la stessa eccezione già registrata da `domain-mapping/imprese.md` §21 per il proprio caso analogo (l'ente emittente di una Certificazione).

---

## 29. Pattern riutilizzabili individuati

| Area | Pattern (`02`) | Applicazione in Mercati Internazionali | Motivo della riusabilità | Domini futuri interessati | Limiti del riutilizzo | Aspetti che restano specifici del dominio |
|---|---|---|---|---|---|---|
| **Aggregate Root a bassa cardinalità di attributi propri ma alta cardinalità di riferimento** | A01+E03 | Il Mercato è referenziato da un numero potenzialmente molto ampio di domini e relazioni (§10-§12) pur avendo pochi attributi propri (§4-§8) | Conferma, con un profilo diverso da Persona e Impresa (referenziato da molti ma "leggero" nei propri dati), che A01+E03 non richiede un Aggregate ricco di contenuto proprio | Ogni futuro Aggregate di governance centrale con funzione principalmente di riferimento (es. un futuro dominio Territori, se mai reso esplicito) | Non copre da solo il caso in cui il dominio possieda anche relazioni che referenziano soggetti esterni (§9): quella è una scelta aggiuntiva di questo specifico mapping, coperta dal pattern del riferimento opaco (sotto) | Il contenuto specifico della composizione geo-economica resta locale |
| **Riferimento esterno opaco all'identità del soggetto, senza incorporarne il modello interno** | R02, applicato all'identità (E03) | Presenza, Interesse, Attività, Relazione commerciale ed Esigenza referenziano l'identità di Imprese/Persone/Professionisti senza mai incorporarne i dati descrittivi (§9-§12, §26) | Stesso pattern già adottato da Appartenenze verso Persone e Imprese (`domain-mapping/appartenenze.md` §4-§5): un dominio può possedere una relazione autonoma pur avendo una dipendenza in uscita necessaria, purché limitata alla sola identità | Ogni futuro dominio che possiede una relazione tra soggetti senza incorporarne il modello interno | Non elimina la dipendenza in uscita: la rende opaca e limitata alla sola identità, non l'annulla | Il contenuto specifico delle cinque relazioni resta locale a Mercati Internazionali |
| **Vocabolario condiviso posseduto dal dominio di significato, applicato dallo stesso dominio alle istanze dichiarate da un soggetto** | C05 (Tipologia) + R02 | La Tipologia di attività internazionale e il Canale di accesso, e le singole istanze che li applicano, restano di Mercati Internazionali (§7, §12) | Separa nettamente "il vocabolario esiste indipendentemente da chi dichiara" da "l'istanza referenzia chi dichiara, senza appartenergli": la stessa distinzione già vista per SettoreImpresa/LinguaOperativaImpresa (E02+VO03) in `domain-mapping/imprese.md` §6, qui applicata a una Classificazione (C05) invece che a un riferimento (VO03) | Ogni dominio che definisce un vocabolario condiviso di tipologie applicabile a relazioni che referenziano più soggetti | Richiede che il vocabolario non abbia mai bisogno di conoscere il modello interno dei soggetti referenziati, condizione qui verificata esplicitamente (§7) | Il contenuto specifico delle venti Tipologie resta locale a Mercati Internazionali |
| **Entity di riferimento propria in assenza di un dominio dedicato** | E01/E03, in attesa di VO03/R02 | La Risorsa di supporto al mercato (§8), in attesa di un eventuale dominio "Organizzazioni istituzionali" | Stessa soluzione provvisoria già applicata da `domain-mapping/imprese.md` per l'ente emittente di una Certificazione (§21 di quel documento): seconda applicazione indipendente, che conferma la generalità del criterio | Professionisti (enti di certificazione professionale), Appartenenze | Non è una soluzione permanente: richiede revisione quando il dominio mancante viene formalizzato (§33) | — |
| **Composizione descrittiva multi-criterio senza equivalenza tra criteri** | VO01/VO02 multipli sullo stesso Aggregate | Il Mercato incorpora Area geografica, economica, linguistica, commerciale, culturale (§5) senza che nessuno sia l'unico criterio costitutivo | Conferma che un Aggregate Root può incorporare più Value Object descrittivi indipendenti, nessuno dei quali necessario o sufficiente da solo, quando il documento logico lo richiede esplicitamente (`mercati-internazionali.md` §3) | Ogni futuro dominio con un concetto "costruito" da più criteri non equivalenti e non gerarchici | Richiede una verifica esplicita, come fatta al §5, che nessuno dei criteri richieda una propria identità referenziabile: altrimenti diventa un'Entity, non un Value Object | Il contenuto specifico dei cinque criteri resta locale |

**Lacune segnalate, senza modificare la baseline.** Nessun concetto di questo dominio è risultato scoperto dal catalogo esistente. L'unica area di incertezza riscontrata — se il vocabolario delle Tipologie di attività (§7) debba evolvere da Elenco controllato (C03) a Tassonomia leggera (C02) qualora la piattaforma preveda un proprio ciclo di gestione per l'aggiunta di nuove tipologie — non è una lacuna del Reference Model, ma una scelta di governance rinviata (§33).

---

## 30. Verifica degli attributi di qualità

| # | Attributo | Esito | Evidenza nel mapping | Rischio | Azione futura |
|---|---|---|---|---|---|
| 1 | Coerenza | Sì, senza eccezioni | Ogni pattern citato usa lo stesso codice e lo stesso significato del catalogo unico (`02`); ogni decisione è integralmente coerente con `domain-dependency-map.md` (righe D6-D9) e con la decisione consolidata 2 di `imprese.md`, senza alcuna divergenza (§9) | Basso | Nessuna |
| 2 | Separazione delle responsabilità | Sì | Ogni concetto (§4-§9, §11-§12) dichiara un solo dominio proprietario; le relazioni d'uso dichiarano esplicitamente Mercati Internazionali come proprietario, referenziando il soggetto dichiarante solo per identità, senza ambiguità | Basso | Nessuna |
| 3 | Coesione | Sì | Ogni sezione ruota attorno al Mercato, alla sua composizione, alla Risorsa di supporto e al modello concettuale della relazione con un soggetto (§4-§12): tutti concetti di business propri del dominio | Basso | Nessuna |
| 4 | Accoppiamento | Sì, nella forma appropriata al concetto | Le sole dipendenze in uscita verso domini-soggetto (§26) sono necessarie e limitate a un riferimento opaco all'identità (E03), mai al modello interno: lo stesso profilo di accoppiamento già validato per Appartenenze | Basso | Nessuna |
| 5 | Estendibilità | Sì | Qualunque nuovo dominio che in futuro voglia referenziare un Mercato può farlo senza richiedere modifiche a questo documento (§10, §26); il vocabolario delle Tipologie (§7) può crescere senza impatto sulla struttura | Basso | Nessuna |
| 6 | Evolvibilità | Sì | Il dominio applica integralmente l'obiettivo architetturale con cui `imprese.md` e `domain-dependency-map.md` erano già stati scritti, senza introdurre contraddizioni occulte né richiedere modifiche a nessuno dei due | Basso | Nessuna |
| 7 | Manutenibilità | Sì | Ogni scelta è ricondotta a un paragrafo specifico di `mercati-internazionali.md`, `02`, `03` o a una riga specifica di `domain-dependency-map.md` | Basso | Nessuna |
| 8 | Tracciabilità | Sì | Ogni Entity, relazione, asse, verifica, evento e dato cita il codice del pattern applicato e il paragrafo del documento logico corrispondente (§4-§26) | Basso | Nessuna |
| 9 | Auditabilità | Sì | L'unica eccezione motivata riguarda l'assenza di un dominio "Organizzazioni istituzionali" (§28), documentata secondo lo schema in tre parti previsto da `03-convenzioni-architetturali.md`, verificabile da un revisore indipendente senza richiedere di consultare l'autore | Basso | Nessuna |
| 10 | Verificabilità | Sì | Ogni affermazione è verificabile per lettura diretta di `mercati-internazionali.md`, `02`, `03`, `domain-dependency-map.md`; le tabelle di §3, §10, §26 permettono una verifica riga per riga | Basso | Nessuna |
| 11 | Comprensibilità | Sì | Ogni concetto è introdotto prima di essere usato; le "Distinzioni obbligatorie" in apertura e la tavola dei confini semantici (§3) rendono immediatamente riconoscibili i ventidue concetti richiesti | Basso | Nessuna |
| 12 | Internazionalizzazione | Sì, per costruzione — è l'oggetto stesso del dominio | Il dominio è dedicato per intero alla dimensione internazionale; §3 e §6 trattano esplicitamente la neutralità rispetto a qualunque specifico ordinamento geografico o giuridico, inclusi i territori con riconoscimento non uniforme (`mercati-internazionali.md` §13) | Basso | Nessuna |
| 13 | Scalabilità concettuale | Sì | L'aggiunta di un futuro criterio di composizione del Mercato (oltre ai cinque di §5) seguirebbe lo stesso pattern VO01/VO02 già confermato riutilizzabile (§29), senza impatto sulla struttura | Basso | Nessuna |
| 14 | Robustezza concettuale | Sì | I casi limite di `mercati-internazionali.md` §13 sono stati esaminati; quelli relativi alla rappresentazione tecnica delle relazioni d'uso sono rinviati alla rappresentazione fisica concreta (§33), non forzati in una soluzione impropria in questo documento | Medio — diverse domande aperte del livello logico (§15 del logico) restano non risolte, come previsto | Monitorare l'evoluzione dei mapping di Imprese, Persone e Professionisti sui riferimenti opachi che ne referenziano l'identità |
| 15 | Esito complessivo | Positivo | Il documento è corretto secondo `01`, `02`, `03` e di buona qualità secondo `04`, senza alcuna area di impatto su altri documenti già approvati: l'unica eccezione residua (§28) riguarda un gap architetturale preesistente e indipendente da questa decisione | Basso | Nessuna |

---

## 31. Classificazione delle decisioni

Ogni decisione architetturale presa in questo documento, classificata come **Locale**, **Riutilizzabile** o **Fondazionale**, secondo `03-convenzioni-architetturali.md` §11-§12 (RC34).

| # | Decisione | Classe | Principio (`01`) | Pattern (`02`) | Convenzione (`03`) | Attributo di qualità (`04`) protetto | Motivazione | Domini futuri potenzialmente interessati |
|---|---|---|---|---|---|---|---|---|
| D1 | Mercato è trattato come A01 ed E03 insieme, con pochi attributi propri e alta cardinalità di riferimento (§4, §29) | Riutilizzabile | §3, Aggregate Root | §3-4, A01+E03 | §3, domanda 1 | Coerenza, Estendibilità | Terza applicazione indipendente della combinazione A01+E03 dopo Persona e Impresa (§29) | Ogni futuro Aggregate di governance centrale principalmente referenziato |
| D2 | Le relazioni d'uso (Presenza, Interesse, Attività, Relazione commerciale, Esigenza) sono possedute da Mercati Internazionali, che referenzia il soggetto dichiarante tramite un riferimento esterno opaco alla sua identità, confermando la direzione delle righe D6-D9 di `domain-dependency-map.md` e la decisione 2 di `domain-mapping/imprese.md` (§9, §11-§12) | Fondazionale | §2, principi 1-2 (Single Owner, Reference by Identity) | §6, R02 | §2, §12 | Accoppiamento, Separazione delle responsabilità | La relazione tra un soggetto e un Mercato è un concetto di business autonomo, non un attributo del soggetto: l'autonomia del dominio richiede di possederne il modello concettuale, non di ignorarne il dichiarante | `domain-mapping/imprese.md`, `domain-mapping/persone.md`, `domain-mapping/professionisti.md` (per la propria vista di lettura, §26) |
| D3 | Area geografica, economica, linguistica, commerciale e culturale restano Value Object incorporati (VO01/VO02), mai Entity autonome (§5) | Riutilizzabile | §4-5, criteri di persistenza | §4-5, VO01/VO02 | §3, domanda 3 | Coerenza, Comprensibilità | Nessuno dei cinque criteri richiede identità propria referenziabile da altri domini (§5) | Ogni futuro dominio con un concetto "costruito" da più criteri descrittivi non equivalenti |
| D4 | Il Paese non è un'Entity di questo dominio: è referenziato dal catalogo territoriale condiviso (§6) | Fondazionale | §2, principio 2 (nessuna duplicazione di catalogo) | §5, VO03 | §4, "Riuso corretto" | Coerenza, Accoppiamento | Applicazione diretta del divieto di duplicazione di cataloghi geografici già stabilito da `domain-dependency-map.md` §14 | Ogni dominio con componente territoriale (già Imprese, Eventi) |
| D5 | Tipologia di attività internazionale e Canale di accesso restano Classificazioni (C05) possedute da Mercati Internazionali, così come le istanze che le applicano (§7, §9) | Riutilizzabile | §5, criteri di Classificazione | §12, C05 | §3, criterio "il valore esisterebbe comunque" | Coerenza, Estendibilità | Il vocabolario è indipendente da qualunque dichiarante; le istanze che lo applicano restano di competenza dello stesso dominio che possiede la relazione | Ogni dominio con un vocabolario condiviso applicato a relazioni proprie che referenziano soggetti esterni |
| D6 | La Risorsa di supporto al mercato resta un'Entity di riferimento autonoma (E01/E03) di Mercati Internazionali, in assenza di un dominio "Organizzazioni istituzionali" (§8, §28) | Locale (applicazione) / Riutilizzabile (criterio) | §2, principio "nessuna soluzione tecnica anticipata per un dominio non ancora esistente" | §4, E01/E03 | §2, schema in tre parti | Tracciabilità | Stessa soluzione provvisoria già applicata da `domain-mapping/imprese.md` §21 per un caso analogo | Professionisti, Appartenenze |
| D7 | Presenza e Interesse restano due Aggregate Root distinti di Mercati Internazionali, non un'unica relazione con attributo di tipo (§11) | Riutilizzabile | §9, principio degli assi indipendenti | §7, S01-S08 | §6, "quando riutilizzare un asse esistente" | Coerenza, Comprensibilità | Requisiti di verifica e conseguenze per Ricerca/Osservatorio diversi tra i due concetti (§10-§11 del logico) | Imprese, Persone (per la propria vista di lettura, §19-§20) |
| D8 | Nessun dato calcolato o aggregato (D05/D06) è attribuito a Mercati Internazionali: ogni Indicatore resta posseduto dall'Osservatorio (§25) | Fondazionale | §13, dati derivati | §11, D05/D06 | §9, "quando produrre dati derivati... quando evitarli" | Separazione delle responsabilità, Accoppiamento | Applicazione diretta del principio già confermato in `domain-mapping/imprese.md` D12 | Ogni dominio sorgente di dati per l'Osservatorio |
| D9 | Gli assi di stato, verifica e visibilità delle relazioni d'uso sono descritti e posseduti da questo documento, citando i codici S01-S08/V01-V05/VIS01-VIS06 (§15-§18) | Fondazionale | §9, Single Owner Principle | §7-§8, §15 | §2, uniformità tra domini | Coerenza, Manutenibilità | Il fatto e il suo ciclo di vita completo appartengono allo stesso dominio proprietario, coerentemente con RC13 | Imprese, Persone, Professionisti (per la propria vista di lettura, nei rispettivi mapping) |

---

## 32. Decisioni di mapping consolidate

1. **Il Mercato internazionale è l'Aggregate Root (A01) del dominio, trattato anche come Entity condivisa (E03)**, con pochi attributi propri e alta cardinalità di riferimento (§4, §29). *Riutilizzabile.*
2. **Il dominio è autonomo nel senso di possedere il proprio modello concettuale senza conoscere il modello interno di Persone, Imprese o Professionisti: le sole dipendenze in uscita verso questi domini sono necessarie e limitate a un riferimento esterno opaco alla loro identità** (§9, §26). *Fondazionale — coerente, senza alcuna eccezione, con `domain-dependency-map.md` D6-D9 e con la decisione consolidata 2 di `domain-mapping/imprese.md`; stesso pattern già adottato dal dominio Appartenenze.*
3. **Presenza di mercato, Interesse di mercato, Attività internazionale, Relazione commerciale internazionale ed Esigenza di internazionalizzazione sono possedute da Mercati Internazionali**, che referenzia il soggetto dichiarante (Imprese, Persone o Professionisti) tramite un riferimento esterno opaco alla sua identità, mai il contrario (§9, §11-§12). *Fondazionale.*
4. **Il Paese non è un'Entity di questo dominio: è referenziato, per la sola componente territoriale, dal catalogo territoriale condiviso**, senza duplicazione (§6). *Fondazionale.*
5. **Area geografica, economica, linguistica, commerciale e culturale restano Value Object incorporati nella descrizione del Mercato**, mai Entity autonome (§5). *Riutilizzabile.*
6. **Il vocabolario delle Tipologie di attività internazionale e dei Canali di accesso, così come le istanze che lo applicano, restano posseduti da Mercati Internazionali** come Classificazione condivisa (§7, §9). *Riutilizzabile.*
7. **La Risorsa di supporto al mercato resta un'Entity di riferimento autonoma di questo dominio**, in assenza di un dominio "Organizzazioni istituzionali" formalizzato (§8, §28). *Locale/Riutilizzabile.*
8. **Il Mercato non prevede tipicamente uno stato sostanziale "Cessato" definitivo**: rappresenta un contesto reale che continua a esistere anche quando la piattaforma non lo presidia più operativamente (§15). *Locale.*
9. **Nessun dato calcolato o aggregato è attribuito a Mercati Internazionali**: ogni Indicatore resta posseduto dall'Osservatorio, che usa il Mercato solo come dimensione di aggregazione (§23, §25). *Fondazionale.*
10. **Questo documento non introduce alcuna modifica a `domain-mapping/imprese.md`, `domain-dependency-map.md` o `reconciliation-report.md`**, e non introduce alcuna eccezione architetturale rispetto ad essi: le decisioni qui assunte sono piena conferma di quanto già consolidato (§9, §28). *Fondazionale.*

---

## 33. Questioni aperte e aspetti rinviati

### Questioni logiche da chiarire

Eredità diretta di `mercati-internazionali.md` §15, non risolte né forzate da questo documento:

1. Quale livello di granularità geografica devono avere i Mercati come impostazione predefinita, e chi decide quando introdurne uno nuovo? (§15 del logico) — rilevante per §4 di questo documento.
2. Come devono essere gestite le aree economiche sovrapposte, quando uno stesso Paese appartiene a più Mercati definiti secondo criteri diversi? (§15 del logico) — rilevante per §5 di questo documento.
3. Quale criterio distingue in modo operativo una presenza occasionale da una presenza stabile? (§15 del logico) — rilevante per i futuri mapping di Imprese e Persone (§11 di questo documento).
4. Come deve essere gestita la presenza di Paesi soggetti a sanzioni o limitazioni commerciali? (§15 del logico) — rilevante per §15 di questo documento e per i mapping dei domini dichiaranti.
5. Come deve essere trattato in modo operativo il confine tra competenza linguistica/culturale dichiarata per una relazione di mercato e LinguaParlata/LinguaOperativaImpresa già dichiarate in Persone e Imprese? (§15 del logico) — rilevante per i futuri mapping di Persone e Imprese, non per questo documento.
6. Qual è il rapporto esatto, in termini di responsabilità e di dati condivisi, tra i domini dichiaranti e Collaborazioni/Opportunità/Eventi quando nascono da un'Esigenza o da un'Attività? (§15 del logico) — rilevante per §22 di questo documento, ma di competenza definitiva dei rispettivi mapping.

### Questioni metodologiche da monitorare

7. **Ownership futura della Risorsa di supporto al mercato.** Se un dominio "Organizzazioni istituzionali" verrà formalizzato (`reconciliation-report.md` §13, `domain-dependency-map.md` DV3), la Risorsa di supporto dovrà essere rivalutata da Entity di riferimento propria (E01/E03) a riferimento verso quel nuovo dominio (§8, §28).
8. **Se il vocabolario delle Tipologie di attività internazionale debba evolvere da Elenco controllato (C03) a Tassonomia leggera (C02).** Dipende da una futura decisione di governance sull'estensibilità di questo vocabolario (§7, §29), non da un'analisi tecnica già disponibile.

### Aspetti rinviati alla rappresentazione fisica concreta

9. **Rappresentazione tecnica degli assi di stato del Mercato e della Risorsa di supporto.** **Chiuso per il ciclo 1 in §35:** colonne distinte sugli AR; nessuno stato sintetico unico.
10. **Unicità della composizione geo-economica.** **Chiuso per il ciclo 1 in §35:** `UNIQUE (market_id, country_ref)` sulla composizione; nessun vincolo globale di unicità di composizione tra Mercati distinti (controllo applicativo/governance).
11. **Tecnica di storicizzazione avanzata (S08/T07/D08) per revisioni di composizione.** Rinviata: il ciclo 1 è current-state; nessuna history/audit table.
12. **Struttura fisica del catalogo territoriale condiviso.** Catalogo Territori **non ancora migrato** in SQL: il ciclo 1 usa `country_ref` testo opaco (§35.4); nessuna tabella Paesi locale; FK Territori rinviata a mapping Territori.
13. **Meccanismo tecnico di propagazione degli eventi di dominio (§24).** Rinviato; nessuna coda/broker/trigger cross-domain.
14. **Applicazione tecnica dell'accesso (S05).** Rinviata a Identità & Accessi.
15. **Rappresentazione tecnica di Presenza, Interesse, Attività, Relazione commerciale, Esigenza e soggetto dichiarante.** **Chiuso per il ciclo 1 in §35:** FK a `profiles` / `businesses` con discriminatore `subject_kind`; `membership_id` opzionale; Professionisti fuori ciclo 1.

### Aspetti rinviati ad altri domini

16. **Struttura fisica del collegamento tra un'Esigenza di internazionalizzazione e le Opportunità o Collaborazioni che ne nascono.** Rinviata ai futuri `domain-mapping/opportunita.md` e `domain-mapping/collaborazioni.md` (§22 di questo documento).
17. **Struttura fisica degli Indicatori e delle aggregazioni che coinvolgono Mercati Internazionali come dimensione.** Rinviata al futuro `domain-mapping/osservatorio.md` (§23, §25 di questo documento).

---

## 34. Controllo finale

### Checklist di controllo

| # | Verifica | Esito |
|---|---|---|
| 1 | Coerenza con `docs/architecture/logical/mercati-internazionali.md` | Verificato — ogni entità, relazione, stato, regola ed evento trattato è riconducibile a un paragrafo esplicito del documento logico; la proprietà delle relazioni d'uso è confermata, senza alcuna eccezione, esattamente come attribuita dal documento logico (§9, §2) |
| 2 | Coerenza con `docs/domain-model.md` e `docs/costituzione-piattaforma.md` | Verificato — il richiamo alla governance centrale del Mercato (§4, §13) e al ruolo di ponte economico delle Persone di origine immigrata (§2, §9 del logico, qui non ridescritto) resta coerente con i due documenti fondativi |
| 3 | Coerenza con `docs/platform-data-specification.md` | Verificato — nessuna definizione tecnica di questo documento contraddice la scheda descrittiva preesistente del Mercato; questo mapping ne è un affinamento concettuale, non una sostituzione tecnica |
| 4 | Coerenza con `reconciliation-report.md` | Verificato, senza eccezioni — l'attribuzione dell'Aggregate delle relazioni d'uso a Mercati Internazionali (§3.1, §11.2 di quel documento) è integralmente confermata da questo mapping (§9); nessuna modifica è proposta a quel documento |
| 5 | Coerenza con `domain-dependency-map.md` | Verificato, senza eccezioni — le righe D6-D9 sono integralmente confermate da questo mapping, come la stessa mappa prevedeva fosse possibile "al momento del proprio Physical Domain Mapping" (§9); nessuna modifica è proposta a quel documento |
| 6 | Coerenza con `domain-mapping/persone.md`, `domain-mapping/imprese.md`, `domain-mapping/appartenenze.md` | Verificato, senza eccezioni — la decisione consolidata 2 di `imprese.md` (§9, §19) è integralmente confermata; il pattern del riferimento esterno opaco è lo stesso già adottato da `appartenenze.md` (§9) |
| 7 | Conformità a `01-principi-mapping.md` | Verificato — ogni decisione cita il principio applicato (§31-§32); nessun principio è contraddetto; il principio di Single Owner e di Reference by Identity è applicato riconoscendo che la relazione con il mercato è un fatto di business autonomo, posseduto dal dominio Mercati Internazionali (§9) |
| 8 | Utilizzo corretto di `02-reference-model.md` | Verificato — ogni concetto trattato cita il codice del pattern applicato (A01, A02, A03, A04, E01, E02, E03, VO01, VO02, VO03, C02, C03, C05, C06, R01, R02, R05, S01-S03, S08, V01-V04, EV01-EV04, D01-D02, D04-D09, T01, T07, VIS01-VIS06); nessun pattern non catalogato è stato introdotto (§29 conferma esplicitamente l'assenza di lacune) |
| 9 | Conformità a `03-convenzioni-architetturali.md` | Verificato — la procedura decisionale del §3 di `03` è stata applicata esplicitamente (§5, §7-§8); l'unica eccezione a una soluzione uniforme, relativa alla Risorsa di supporto (§28), è motivata secondo lo schema in tre parti del §2/§12 (RC33); le decisioni architetturali applicate sono elencate esplicitamente (RC34, §31-§32) |
| 10 | Applicazione di `04-quality-attributes.md` | Verificato — checklist applicata punto per punto al §30, senza alcuna riga segnalata come impatto su altri documenti |
| 11 | Assenza di contenuti tecnici fuori dalle sezioni consentite | Verificato — menzioni tecnologiche confinate a nota introduttiva, §33, §34 e contratti DDL-ready §35; nessuna SQL eseguibile |
| 12 | Assenza di duplicazioni | Verificato — nessun concetto è descritto due volte con contenuto ridondante; le tabelle di §3, §10, §26 riassumono senza ripetere la motivazione discorsiva già fornita nel corpo del testo |
| 13 | Assenza di contraddizioni interne | Verificato — il principio del §9 (ownership della relazione, riferimento opaco all'identità del soggetto) è applicato in modo coerente in tutte le sezioni successive (§10-§27), senza alcun residuo testuale che attribuisca la proprietà delle relazioni d'uso al dominio del soggetto dichiarante |
| 14 | Correttezza dei riferimenti ai documenti esistenti | Verificato — ogni citazione a `mercati-internazionali.md`, `domain-dependency-map.md`, `imprese.md`, `persone.md`, `appartenenze.md`, `01`, `02`, `03`, `04` e `reconciliation-report.md` è stata controllata contro il testo effettivo di quei documenti durante la stesura |
| 15 | Rispetto della struttura documentale richiesta | Verificato — nota introduttiva, vincoli, documenti letti, regola fondamentale, distinzioni obbligatorie, indice, 35 sezioni (34 di mapping + §35 DDL-ready ciclo 1), riepilogo finale |
| 16 | Contratti DDL-ready ciclo 1 | Verificato — §35 definisce tabelle, colonne, tipi, vincoli, RLS difensiva ed esclusioni Persona–Impresa; Migration Plan in `docs/architecture/migrations/mercati-internazionali-migration-plan.md` |

---

## 35. Contratti DDL-ready (ciclo 1 Persona–Impresa)

**Scopo.** Chiudere le ambiguità di schema necessarie al Migration Plan Mercati Internazionali. Non è SQL eseguibile. Perimetro ciclo 1: soggetti **Persona** e **Impresa** soltanto. Nessuna FK polimorfica. Nessun soggetto Professionista. Nessun catalogo Paesi locale. Nessuna Organizzazione istituzionale generale.

**Autorità collegata.** `docs/architecture/migrations/mercati-internazionali-migration-plan.md`.

**Pattern RLS/privilegi (tutte le tabelle §35).** `ENABLE ROW LEVEL SECURITY`; nessun `FORCE ROW LEVEL SECURITY`; nessuna policy; `REVOKE ALL` da `anon` e `authenticated`; nessun `GRANT`; nessun `auth.uid()`.

**Pattern timestamps.** `created_at` / `updated_at` timestamptz NOT NULL DEFAULT now(); funzione `set_<table>_updated_at` dedicata per tabella (`SECURITY INVOKER`, `SET search_path = ''`); un solo trigger locale `BEFORE UPDATE` `*_set_updated_at`. Nomi ≤ 63 byte (abbreviazioni `im_` / `intl_` ammesse se necessario).

**Pattern soggetto dichiarante (Presenza, Interesse, Relazione commerciale, Esigenza).**

| Campo | Regola |
|---|---|
| `subject_kind` | text NOT NULL ∈ `business` \| `person` |
| `business_id` | uuid NULL → `public.businesses(id)` ON DELETE RESTRICT |
| `person_id` | uuid NULL → `public.profiles(id)` ON DELETE RESTRICT |
| `membership_id` | uuid NULL → `public.business_memberships(id)` ON DELETE RESTRICT |
| CHECK soggetto | (`subject_kind='business'` ∧ `business_id` NOT NULL ∧ `person_id` IS NULL) ∨ (`subject_kind='person'` ∧ `person_id` NOT NULL ∧ `business_id` IS NULL) |
| CHECK membership | `membership_id` IS NULL ∨ `subject_kind='business'` |

**Professionisti.** Fuori ciclo 1: nessuna colonna `professional_id`; nessuna FK verso tabelle inesistenti. Estensione futura documentata nel Plan (non bloccante).

**Territori.** Nessuna tabella Territori in SQL oggi. Composizione usa `country_ref` text opaco (codice/convenzione piattaforma). Nessun catalogo Paesi in questo dominio. Eventuale FK futura → catalogo Territori condiviso.

**Elementi esclusi dal ciclo 1 (tutte le tabelle).** FK a `auth.users`; CASCADE da `profiles`/`businesses` verso le relazioni; FK Opportunità/Collaborazioni/Eventi; history/audit table; badge/score/ranking; seed demo; policy VIS02; Storage; volumi commerciali strutturati; soggetto Professionista; Organizzazioni istituzionali come dominio.

---

### 35.1 `public.international_activity_types` (M1.1)

| Campo | Valore |
|---|---|
| Responsabilità | Catalogo C03/C05 tipologie di attività internazionale |
| PK | `code` text |
| Colonne (ordine) | `code`; `label_it` text NOT NULL; `description` text NULL; `sort_order` int NOT NULL; `is_active` boolean NOT NULL DEFAULT true; `created_at`; `updated_at` |
| CHECK | code/label non blank; `sort_order >= 0` |
| Seed normativo | **20** code (elenco Logical §5, chiuso): `export`, `import`, `distribution`, `intermediation`, `production`, `service_provision`, `consulting`, `cross_border_ecommerce`, `direct_investment`, `equity_participation`, `franchising`, `licensing`, `commercial_representation`, `procurement`, `subcontracting`, `industrial_cooperation`, `research_development`, `training`, `technology_transfer`, `institutional_associative` |
| Note | Conteggio normativo = **20** (enumerazione Logical §5). Eventuali riferimenti a «19» sono errori di conteggio; il seed M1.1 usa queste 20 code. Non è seed demo. |

---

### 35.2 `public.international_access_channels` (M1.2)

| Campo | Valore |
|---|---|
| Responsabilità | Catalogo C05/C06 canali di accesso al mercato |
| PK | `code` text |
| Colonne | `code`; `label_it` text NOT NULL; `sort_order` int NOT NULL; `is_active` boolean NOT NULL DEFAULT true; timestamps |
| CHECK | code/label non blank; `sort_order >= 0` |
| Seed normativo | `distributor`, `marketplace`, `direct_branch`, `agent`, `trade_fair`, `sales_network` |
| Esclusione | Non duplica `business_channels` (Imprese) |

---

### 35.3 `public.internationalization_need_types` (M1.3)

| Campo | Valore |
|---|---|
| Responsabilità | Catalogo C03 categorie di Esigenza di internazionalizzazione |
| PK | `code` text |
| Colonne | `code`; `label_it` text NOT NULL; `sort_order` int NOT NULL; `is_active` boolean NOT NULL DEFAULT true; timestamps |
| Seed normativo | 19 code da Logical §8: `find_customers`, `find_suppliers`, `find_distributors`, `find_agents`, `find_industrial_partners`, `find_investors`, `find_financing`, `open_site`, `access_trade_fairs`, `regulatory_adaptation`, `certifications`, `logistics`, `international_payments`, `contractual_protection`, `ip_protection`, `language_mediation`, `intercultural_training`, `find_staff`, `access_institutional_networks` |

---

### 35.4 `public.international_markets` (M2.1) — Aggregate Root governance

| Campo | Valore |
|---|---|
| Responsabilità | Mercato internazionale (A01/E03), governance centrale |
| PK | `id` uuid DEFAULT gen_random_uuid() |
| Colonne (ordine) | `id`; `code` text NOT NULL; `name` text NOT NULL; `summary` text NULL; `description` text NULL; `market_kind` text NOT NULL; `substantial_status` text NOT NULL DEFAULT `'proposed'`; `editorial_status` text NOT NULL DEFAULT `'drafting'`; `geographic_note` text NULL; `economic_area_note` text NULL; `linguistic_area_note` text NULL; `commercial_area_note` text NULL; `cultural_area_note` text NULL; `created_at`; `updated_at` |
| UNIQUE | `code` |
| CHECK kind | `country` \| `country_group` \| `transnational_region` \| `economic_union` \| `linguistic_area` \| `commercial_area` \| `economic_corridor` \| `sectoral_international` |
| CHECK substantial | `proposed` \| `active` \| `featured` \| `maintenance` \| `unmonitored` |
| CHECK editorial | `drafting` \| `published` \| `in_review` \| `needs_update` |
| CHECK | code/name non blank; note anti-blank se presenti |
| Indici | `(substantial_status)`, `(editorial_status)`, `(market_kind)` |
| Assi | Distinti: sostanziale ≠ editoriale; nessun asse pubblicazione S04 separato (assorbito da editorial `published`, §15) |
| Current-state | Sì; nessuna history table |
| Dipendenze | Nessuna FK esterna obbligatoria |

---

### 35.5 `public.international_market_countries` (M2.2) — composizione

| Campo | Valore |
|---|---|
| Responsabilità | Associazione Mercato–Paese (owned); riferimento opaco a Territori |
| PK | `id` uuid DEFAULT gen_random_uuid() |
| Colonne | `id`; `market_id` uuid NOT NULL; `country_ref` text NOT NULL; `country_label` text NULL; `is_primary` boolean NOT NULL DEFAULT false; `sort_order` int NOT NULL DEFAULT 0; timestamps |
| FK | `market_id` → `international_markets(id)` ON DELETE CASCADE |
| UNIQUE | `(market_id, country_ref)` |
| UNIQUE parziale | al più un `is_primary = true` per `market_id` |
| CHECK | `country_ref` non blank; `sort_order >= 0` |
| Cardinalità | Mercato 0..N Paesi; Paese (ref) in 0..N Mercati |
| Esclusione | Nessuna tabella `countries` locale; nessuna FK Territori finché assente |

---

### 35.6 `public.international_market_support_resources` (M2.3)

| Campo | Valore |
|---|---|
| Responsabilità | Risorsa di supporto al mercato (E01); ownership locale provvisoria vs Organizzazioni |
| PK | `id` uuid DEFAULT gen_random_uuid() |
| Colonne | `id`; `market_id` uuid NOT NULL; `name` text NOT NULL; `resource_kind` text NOT NULL; `summary` text NULL; `website_url` text NULL; `contact_note` text NULL; `territorial_scope_note` text NULL; `substantial_status` text NOT NULL DEFAULT `'signaled'`; `verification_status` text NOT NULL DEFAULT `'unverified'`; `visibility_status` text NOT NULL DEFAULT `'editorial'`; timestamps |
| FK | `market_id` → `international_markets(id)` ON DELETE CASCADE |
| CHECK kind | `chamber_of_commerce` \| `embassy_consulate` \| `association` \| `entrepreneurial_network` \| `public_agency` \| `other_support` |
| CHECK substantial | `signaled` \| `active` \| `archived` |
| CHECK verification | `unverified` \| `in_review` \| `confirmed` \| `rejected` |
| CHECK visibility | `private` \| `editorial` \| `public` \| `historical` |
| Indici | `(market_id)`, `(substantial_status)` |
| Note | Non è Partner piattaforma; non è dominio Organizzazioni |

---

### 35.7 `public.international_market_presences` (M3.1) — Aggregate Root

| Campo | Valore |
|---|---|
| Responsabilità | PresenzaDiMercato: soggetto opera nel Mercato |
| PK | `id` uuid DEFAULT gen_random_uuid() |
| Colonne | `id`; `market_id` uuid NOT NULL; `subject_kind`; `business_id`; `person_id`; `membership_id`; `editorial_status` text NOT NULL DEFAULT `'proposed'`; `relation_status` text NOT NULL DEFAULT `'under_evaluation'`; `verification_status` text NOT NULL DEFAULT `'unverified'`; `is_contested` boolean NOT NULL DEFAULT false; `visibility_status` text NOT NULL DEFAULT `'private'`; `presence_configuration` text NOT NULL DEFAULT `'ongoing'`; `started_at` date NULL; `ended_at` date NULL; `motivation_note` text NULL; `declaration_origin` text NOT NULL DEFAULT `'subject_declaration'`; `created_at`; `updated_at` |
| FK | `market_id` → markets RESTRICT; soggetto come pattern §35; membership RESTRICT |
| CHECK editorial | `signaled` \| `proposed` \| `declared` |
| CHECK relation | `under_evaluation` \| `planned` \| `started` \| `active` \| `consolidated` \| `suspended` \| `interrupted` \| `concluded` \| `archived` |
| CHECK verification | `unverified` \| `in_review` \| `confirmed` (**senza** contested) |
| CHECK visibility | `private` \| `involved` \| `editorial` \| `partners` \| `public` \| `historical` |
| CHECK configuration | `occasional` \| `ongoing` \| `export_oriented` \| `import_oriented` \| `stable_presence` \| `via_intermediary` \| `abandoned` |
| CHECK origin | `subject_declaration` \| `editorial` \| `informative_import` \| `institutional_source` |
| CHECK temporali | (1) `ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at`; (2) `relation_status IN ('under_evaluation','planned','started','active','consolidated','suspended')` ⇒ `ended_at IS NULL`; (3) `relation_status IN ('interrupted','concluded','archived')` ⇒ `ended_at IS NOT NULL`; (4) `presence_configuration = 'abandoned'` ⇒ `ended_at IS NOT NULL` |
| UNIQUE | nessuna UNIQUE forzata (soggetto, market) — multi-presenza/successione consentite |
| Funzione/trigger | `set_international_market_presences_updated_at` INVOKER; trigger `international_market_presences_set_updated_at` BEFORE UPDATE |
| RLS/privilegi | Pattern §35 comune |
| Indici | `(market_id)`, `(business_id)`, `(person_id)`, `(relation_status)` |
| Contestazione | `is_contested` overlay indipendente |

---

### 35.8 `public.international_market_interests` (M3.2) — Aggregate Root

| Campo | Valore |
|---|---|
| Responsabilità | InteresseDiMercato distinto dalla Presenza |
| PK | `id` uuid |
| Colonne | `id`; `market_id`; soggetto (pattern); `membership_id`; `editorial_status` DEFAULT `'proposed'`; `interest_level` text NOT NULL DEFAULT `'future'`; `relation_status` text NOT NULL DEFAULT `'under_evaluation'`; `verification_status` DEFAULT `'unverified'`; `is_contested` DEFAULT false; `visibility_status` DEFAULT `'private'`; `started_at` date NULL; `ended_at` date NULL; `motivation_note` text NULL; `declaration_origin` DEFAULT `'subject_declaration'`; timestamps |
| CHECK interest_level | `future` \| `under_assessment` |
| CHECK relation | `under_evaluation` \| `planned` \| `withdrawn` \| `archived` |
| CHECK verification | conferma sola della dichiarazione: `unverified` \| `in_review` \| `confirmed` \| `rejected` |
| Note | Nessuna deduzione automatica da/verso Presenza; nessuna tabella Verifiche multi-aspetto (asse sulla radice) |

---

### 35.9 `public.international_market_activities` + `international_market_activity_type_links` (M3.3)

**Attività (E02 owned da Presenza)**

| Campo | Valore |
|---|---|
| Tabella | `public.international_market_activities` |
| PK | `id` uuid |
| Colonne | `id`; `presence_id` uuid NOT NULL; `summary` text NULL; `description` text NULL; `activity_status` text NOT NULL DEFAULT `'planned'`; `primary_access_channel_code` text NULL; `sector_id` bigint NULL; `location_note` text NULL; `visibility_status` text NOT NULL DEFAULT `'private'`; `started_at` date NULL; `ended_at` date NULL; timestamps |
| FK | `presence_id` → `international_market_presences(id)` ON DELETE CASCADE; `primary_access_channel_code` → `international_access_channels(code)` ON DELETE RESTRICT; `sector_id` → `public.business_sectors(id)` ON DELETE RESTRICT |
| CHECK status | `planned` \| `started` \| `active` \| `suspended` \| `concluded` \| `interrupted` |
| CHECK visibility | `private` \| `involved` \| `editorial` \| `public` \| `historical` |
| Esclusione | Nessuna FK diretta a Persona/Impresa (passa dalla Presenza) |

**Link tipologie (0..N per Attività)**

| Campo | Valore |
|---|---|
| Tabella | `public.international_market_activity_type_links` |
| Colonne | `id`; `activity_id` uuid NOT NULL; `activity_type_code` text NOT NULL; timestamps |
| FK | CASCADE da activity; `activity_type_code` → activity_types RESTRICT |
| UNIQUE | `(activity_id, activity_type_code)` |

---

### 35.10 `public.international_commercial_relations` (M4.1) — Aggregate Root

| Campo | Valore |
|---|---|
| Responsabilità | Relazione commerciale internazionale |
| PK | `id` uuid |
| Colonne | `id`; `market_id`; soggetto (pattern); `membership_id`; `relation_nature` text NOT NULL; `counterpart_kind` text NOT NULL DEFAULT `'external'`; `counterpart_business_id` uuid NULL; `counterpart_person_id` uuid NULL; `counterpart_label` text NULL; `editorial_status` DEFAULT `'proposed'`; `relation_status` DEFAULT `'active'`; `verification_status` DEFAULT `'unverified'`; `is_contested` DEFAULT false; `visibility_status` DEFAULT `'private'`; `started_at` date NULL; `ended_at` date NULL; `notes` text NULL; timestamps |
| FK | market RESTRICT; soggetto RESTRICT; `counterpart_business_id` → businesses RESTRICT; `counterpart_person_id` → profiles RESTRICT |
| CHECK nature | `customer` \| `supplier` \| `distributor` \| `agent` \| `partner` \| `investor` |
| CHECK counterpart_kind | `external` \| `business` \| `person` |
| CHECK counterpart | se `external` ⇒ label NOT NULL e entrambe FK controparte NULL; se `business` ⇒ counterpart_business_id NOT NULL; se `person` ⇒ counterpart_person_id NOT NULL |
| CHECK relation | `active` \| `suspended` \| `concluded` \| `contested_hold` \| `archived` |
| Esclusione | Non è Collaborazione; nessun volume/valore strutturato nel ciclo 1 |

---

### 35.11 `public.internationalization_needs` (M4.2) — Aggregate Root

| Campo | Valore |
|---|---|
| Responsabilità | Esigenza di internazionalizzazione |
| PK | `id` uuid |
| Colonne | `id`; `market_id` uuid NULL; soggetto (pattern); `membership_id`; `need_type_code` text NOT NULL; `summary` text NOT NULL; `description` text NULL; `priority` text NOT NULL DEFAULT `'normal'`; `editorial_status` DEFAULT `'proposed'`; `need_status` text NOT NULL DEFAULT `'open'`; `visibility_status` DEFAULT `'private'`; `opened_at` date NULL; `closed_at` date NULL; timestamps |
| FK | `market_id` → markets ON DELETE SET NULL (Mercato può essere non ancora individuato); `need_type_code` → need_types RESTRICT; soggetto RESTRICT |
| CHECK priority | `low` \| `normal` \| `high` |
| CHECK need_status | `open` \| `in_progress` \| `fulfilled` \| `withdrawn` \| `archived` |
| Esclusione | Non genera automaticamente Opportunità/Collaborazione; nessuna FK verso quei domini |

---

### 35.12 Fonti / Evidenze / Verifiche — Presenza (M5.1–M5.3)

#### `public.international_market_presence_sources` (M5.1)

| Campo | Valore |
|---|---|
| Colonne | `id`; `presence_id` NOT NULL; `source_kind` text NOT NULL; `reliability_note` text NULL; `reference_label` text NULL; `declared_at` timestamptz NULL; timestamps |
| FK | CASCADE da presence |
| CHECK source_kind | `business_declaration` \| `person_declaration` \| `commercial_documentation` \| `public_source` \| `institutional_body` \| `association` \| `verified_partner` \| `editorial` \| `informative_import` |

#### `public.international_market_presence_evidences` (M5.2)

| Campo | Valore |
|---|---|
| Colonne | `id`; `presence_id` NOT NULL; `source_id` uuid NULL; `supported_aspect` text NOT NULL; `summary` text NOT NULL; `observed_at` timestamptz NULL; timestamps |
| FK | presence CASCADE; source ON DELETE SET NULL |
| CHECK aspect | `effective_presence` \| `declared_activity` \| `foreign_site` \| `export_import` \| `person_experience` \| `linguistic_competence` \| `network_membership` |

#### `public.international_market_presence_verifications` (M5.3)

| Campo | Valore |
|---|---|
| Colonne | `id`; `presence_id` NOT NULL; `aspect` text NOT NULL; `status` text NOT NULL DEFAULT `'unverified'`; `verified_at` timestamptz NULL; `expires_at` timestamptz NULL; `source_note` text NULL; timestamps |
| FK | CASCADE da presence |
| UNIQUE | `(presence_id, aspect)` |
| CHECK aspect | stessi 7 di evidenze Presenza |
| CHECK status | `unverified` \| `in_review` \| `confirmed` \| `rejected` |
| Note | Nessuna sync automatica con `presences.verification_status`; nessun badge/score; current-state |

---

### 35.13 Fonti / Evidenze / Verifiche — Relazione commerciale (M5.4–M5.6)

Tabelle speculari con ownership `commercial_relation_id` → `international_commercial_relations` CASCADE:

- `international_commercial_relation_sources` (M5.4) — stessi `source_kind` della Presenza
- `international_commercial_relation_evidences` (M5.5) — aspetti: `commercial_relation` \| `partner_recognition`
- `international_commercial_relation_verifications` (M5.6) — UNIQUE `(commercial_relation_id, aspect)`; stessi 2 aspetti; status come sopra

---

### 35.14 Funzioni, indici, commenti, privilegi

| Elemento | Prescrizione |
|---|---|
| Funzioni | Solo `updated_at` per tabella mutabile; nessun gate applicativo; nessun trigger cross-table |
| Commenti SQL | Obbligatori su tabelle e colonne di significato (assi, RESTRICT, country_ref opaco, non-Collaborazione, non-Opportunità) |
| Privilegi | REVOKE ALL; nessun GRANT |
| Dipendenze esterne ciclo 1 | `profiles`, `businesses`, `business_memberships`, `business_sectors` (facoltativa su attività) |
| Integrazione Opportunità/Collaborazioni/Eventi | Fuori dominio; nessuna FK |

### 35.15 Mapping Logical → fisico (decisioni chiuse)

| Punto | Decisione fisica |
|---|---|
| Radice governance | `international_markets` |
| Composizione Paese | tabella owned + `country_ref` opaco |
| Presenza ≠ Interesse | due AR |
| Attività | owned da Presenza + link tipologie 0..N |
| Tipologie | 20 code catalogo |
| Canali | 6 code catalogo; non `business_channels` |
| Esigenza | AR con catalogo 19 tipi; `market_id` nullable |
| Soggetto ciclo 1 | business XOR person + membership opzionale |
| Professionisti | rinviati |
| Contestazione | `is_contested` |
| Fonti/Evidenze/Verifiche | separate per Presenza e Relazione commerciale |
| Interesse | verifica sulla radice, senza tabella multi-aspetto |

---

## Riepilogo finale

Il dominio Mercati Internazionali, al termine di questo mapping, possiede il Mercato internazionale come Aggregate Root autonomo e a governance centrale (§4), la sua composizione geo-economica come insieme di Value Object incorporati (§5), il riferimento — non la duplicazione — alla componente territoriale tramite il catalogo condiviso (§6), il vocabolario delle Tipologie di attività internazionale e dei Canali di accesso come Classificazioni condivise (§7), la Risorsa di supporto al mercato come Entity di riferimento propria (§8), e — in quanto concetto di business autonomo e non un semplice attributo del soggetto coinvolto — il modello concettuale della relazione tra un soggetto e un Mercato: la Presenza di mercato, l'Interesse di mercato, l'Attività internazionale, la Relazione commerciale internazionale e l'Esigenza di internazionalizzazione (§9, §11-§12).

L'autonomia del dominio non consiste nell'assenza di ogni riferimento verso Imprese, Persone e Professionisti, ma nella natura di quel riferimento: Mercati Internazionali referenzia esclusivamente l'identità stabile del soggetto dichiarante, tramite un riferimento esterno opaco, senza mai conoscerne i dati descrittivi, lo stato o la storia (§9). È esattamente lo stesso pattern già adottato dal dominio Appartenenze verso Persone e Imprese: possedere una relazione autonoma, referenziando i soggetti coinvolti solo per identità.

Questa scelta produce l'effetto richiesto in modo verificabile, non solo dichiarato: la matrice delle dipendenze di questo dominio (§26) mostra dipendenze in uscita necessarie ma limitate al solo riferimento opaco all'identità, mai al modello interno di Imprese, Persone, Professionisti o Appartenenze; la tavola dei cicli (§27) non registra alcun ciclo reale con nessuno di questi domini, perché ciascuna coppia di direzioni referenzia sempre oggetti diversi e indipendenti tra loro; ogni dominio che in futuro avrà bisogno di collegarsi a un contesto internazionale — oggi Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Ricerca, Notifiche, e potenzialmente altri domini non ancora previsti — può farlo referenziando il Mercato senza che questo debba mai essere modificato per accoglierlo.

Questo documento non introduce alcuna modifica né alcuna eccezione architetturale rispetto a `domain-mapping/imprese.md` o `reconciliation-report.md`: le decisioni qui assunte sono piena conferma di quanto quei documenti già stabiliscono (righe D6-D9, decisione consolidata 2 di `imprese.md`), applicando lo stesso pattern già adottato dal dominio Appartenenze. La Dependency Map è allineata su D9 (Consolidata) e DV1/DV6 (chiuse). Il **§35** chiude i contratti DDL-ready del ciclo 1 Persona–Impresa; il Migration Plan è in `docs/architecture/migrations/mercati-internazionali-migration-plan.md`. Restano esplicitamente aperti: catalogo Territori (riferimento opaco), soggetto Professionista, Organizzazioni istituzionali (§28), history avanzata e policy Identità & Accessi.
