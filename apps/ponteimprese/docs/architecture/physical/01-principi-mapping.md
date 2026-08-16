# Principi architetturali per il mapping logico → fisico

> Livello architetturale. Questo documento definisce esclusivamente principi. Non contiene SQL, non contiene `CREATE TABLE`, non contiene riferimenti a PostgreSQL, Supabase, migration, API, frontend o codice di alcun tipo. Non è il mapping fisico di alcun dominio: è il documento che stabilisce le regole che ogni futuro documento di mapping (uno per ciascuno degli 11 domini) dovrà rispettare.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md) e tutti i documenti in [`docs/architecture/logical/`](../logical/), incluso [`docs/architecture/logical/reconciliation-report.md`](../logical/reconciliation-report.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: modello concettuale → modello logico di dominio → riconciliazione logica → **principi di mapping (questo documento)** → mapping fisico per singolo dominio → piano di migrazione → migrazioni. Questo documento è trasversale: si applica una sola volta, a monte di tutti gli 11 domini, e non verrà riscritto per ciascuno di essi.

---

## Indice

1. [Scopo del documento](#1-scopo-del-documento)
2. [Principi generali](#2-principi-generali)
3. [Aggregate Root](#3-aggregate-root)
4. [Entità](#4-entità)
5. [Value Object](#5-value-object)
6. [Identità](#6-identità)
7. [Relazioni](#7-relazioni)
8. [Storicizzazione](#8-storicizzazione)
9. [Stati](#9-stati)
10. [Verifiche](#10-verifiche)
11. [Versioni](#11-versioni)
12. [Eventi di dominio](#12-eventi-di-dominio)
13. [Dati derivati](#13-dati-derivati)
14. [Dipendenze](#14-dipendenze)
15. [Convenzioni generali](#15-convenzioni-generali)
16. [Decisioni architetturali](#16-decisioni-architetturali)
17. [Regole obbligatorie per tutti i futuri mapping](#17-regole-obbligatorie-per-tutti-i-futuri-mapping)
18. [Checklist finale](#18-checklist-finale)

---

## 1. Scopo del documento

**Differenza tra modello logico e modello fisico.** Il modello logico (i documenti in `docs/architecture/logical/` e la loro sintesi in `docs/domain-model.md`) descrive *cosa significa* ciascun concetto della piattaforma: quali entità esistono, quali fatti possiedono, quali regole li governano, quali relazioni li legano, indipendentemente da come quei fatti verranno resi persistenti. Il modello fisico è la struttura concreta e persistente che rende quei concetti disponibili nel tempo, interrogabili e modificabili in modo controllato. Il modello logico risponde alla domanda "che cosa esiste e che cosa significa"; il modello fisico risponde alla domanda "come viene conservato ciò che esiste, senza alterarne il significato". Il primo è stabile per costruzione (cambia solo quando cambia la comprensione del dominio); il secondo può evolvere più volte nel tempo — per prestazioni, per tecnologie, per esigenze operative — senza che questo debba mai retroagire sul significato logico.

**Obiettivo del mapping.** Il mapping è l'attività, e il documento che la registra, che traduce ogni entità, relazione, regola e vincolo del modello logico in una struttura persistente equivalente, senza aggiungere significati non previsti dal logico e senza perderne alcuno. Un mapping riuscito è un mapping di cui si può sempre dire: "interrogando la struttura fisica, si ottiene esattamente ciò che il documento logico ha promesso, né più né meno". Un mapping non riuscito introduce concetti tecnici che sembrano innocui ma che finiscono per rappresentare qualcosa che il dominio non ha mai definito (una scorciatoia, un campo "furbo", una semplificazione che altera un principio).

**Cosa significa preservare il significato del dominio.** Significa che ogni struttura fisica deve poter essere spiegata a chi conosce solo il documento logico, senza che questa persona debba imparare nulla di nuovo sul dominio stesso. Se una struttura fisica richiede di spiegare un concetto che il documento logico non contiene, il mapping ha introdotto qualcosa che non gli compete: a quel punto la domanda giusta non è "come lo implemento", ma "il documento logico è incompleto, o sto anticipando una decisione che non è mia da prendere in questa fase". Preservare il significato vuol dire anche preservare le distinzioni che il livello logico ha faticosamente stabilito — fatto vs. contenuto, dato sorgente vs. dato derivato, verifica vs. pubblicazione, stato reale vs. stato editoriale — anche quando comprimerle sarebbe tecnicamente più semplice.

**Principio "business first".** Ogni decisione di mapping nasce da una domanda di dominio, mai da una comodità tecnica. L'ordine corretto di ragionamento è sempre: "quale fatto di business sto rappresentando, secondo quale documento logico, con quali regole" — e solo dopo "qual è la struttura più adatta a conservarlo". L'ordine inverso — partire da una struttura tecnica comoda e poi cercare di farvi rientrare il significato di dominio — è la causa più comune di modelli fisici che, con il tempo, smettono di rappresentare fedelmente il dominio. Questo principio vale anche quando la traduzione "corretta" secondo il dominio è più complessa di un'alternativa più semplice: la complessità del fisico deve rispecchiare la complessità reale del dominio (§9, gli assi indipendenti sono l'esempio più diretto), non essere artificialmente ridotta.

**Indipendenza dalle tecnologie.** I principi definiti in questo documento non presuppongono alcuna tecnologia specifica: sarebbero validi anche se la piattaforma non usasse PostgreSQL, non usasse Supabase, o non usasse affatto un database relazionale. Non si parla qui di tabelle, colonne, tipi di dato tecnici, indici, chiavi, vincoli SQL, policy di riga, funzioni, trigger, migration, API o componenti applicativi: questi appartengono esclusivamente ai futuri documenti di mapping per singolo dominio, che applicheranno questi principi a una tecnologia concreta. Questo documento resta a un livello di astrazione superiore, apposta perché le scelte tecnologiche possano cambiare in futuro senza rimettere in discussione i principi di traduzione del significato.

---

## 2. Principi generali

Questi principi sono vincolanti per tutti gli 11 domini e per ogni futuro documento di mapping. Non sono negoziabili in sede di singolo dominio: se un dominio ritiene di doverne derogare, la deroga va motivata esplicitamente e ricondotta a una particolarità già presente nel relativo documento logico, non introdotta ad hoc nel fisico.

1. **Ogni fatto ha un dominio proprietario.** Coerente con `docs/domain-model.md` §4 e `reconciliation-report.md` §3.2: per ogni fatto rappresentato fisicamente deve essere sempre individuabile, senza ambiguità, quale dominio logico ne è responsabile. Il mapping fisico non introduce mai un fatto "neutro" senza proprietario, e non permette che due domini scrivano lo stesso fatto.

2. **Nessun dominio duplica fatti altrui.** Quando un dominio ha bisogno di un fatto posseduto da un altro dominio, lo referenzia per identità stabile (§6), non lo copia. Una copia locale di un dato altrui è ammessa solo quando il documento logico del dominio la prevede esplicitamente come storicizzazione di un fatto passato (§8) — mai come comodità di lettura.

3. **Il modello fisico non modifica il modello logico.** Il mapping traduce, non reinterpreta. Se durante il mapping emerge un'esigenza che il modello logico non ha previsto o che sembra contraddirlo, la soluzione corretta è tornare al documento logico e correggerlo esplicitamente (con lo stesso rigore usato nella riconciliazione), non introdurre nel fisico una soluzione che il logico non autorizza.

4. **Il modello fisico rende persistenti i concetti logici.** Ogni struttura fisica deve corrispondere a un concetto già nominato in un documento logico (un'entità, un value object, una relazione, un attributo, un asse di stato, un evento). Sono ammessi solo metadati puramente tecnici privi di significato di business (es. un riferimento tecnico di sistema), che di per sé non alterano né arricchiscono il significato di dominio.

5. **Ogni scelta fisica deve essere motivata dal dominio.** Per ogni struttura introdotta nel mapping fisico di un dominio deve essere possibile indicare a quale paragrafo del relativo documento logico essa corrisponde. Una struttura che non può essere ricondotta a un paragrafo esistente è, per definizione, non motivata.

6. **Evitare ottimizzazioni premature.** Il mapping non introduce strutture pensate per un carico, una velocità o una scala che il dominio non ha ancora dimostrato di richiedere. Le esigenze di prestazione reali verranno affrontate quando saranno concrete, in un momento e con strumenti distinti da questo processo di traduzione del significato.

7. **Evitare denormalizzazioni immotivate.** La duplicazione fisica di un dato è ammessa esclusivamente quando un principio di dominio la richiede esplicitamente (tipicamente la storicizzazione, §8, o l'immutabilità di un fatto passato), mai per comodità di lettura, di scrittura o per evitare un riferimento. In assenza di una motivazione di dominio, un dato esiste in un solo luogo fisico.

8. **Preservare la coerenza.** Ogni struttura fisica deve garantire che le regole invarianti, le cardinalità e i confini di ownership stabiliti a livello logico restino veri non solo al momento della progettazione, ma in ogni momento successivo del ciclo di vita dei dati. Un mapping che rende vera una regola solo "se tutti si comportano bene" non la preserva: la regola deve restare vera per costruzione.

---

## 3. Aggregate Root

**Aggregate Root.** È il concetto attorno al quale un dominio organizza la propria consistenza: l'unico punto attraverso cui un gruppo di dati che devono cambiare insieme viene letto e modificato. Ogni Aggregate Root corrisponde, in questa architettura, al concetto centrale già individuato per ciascun dominio nell'inventario di `reconciliation-report.md` §3.1 (Persona, Impresa, Appartenenza, Mercato internazionale, Opportunità, Collaborazione, Profilo professionale, Evento, Contenuto editoriale, Indicatore, Account). Un Aggregate Root ha sempre un'identità propria (§6), un proprio ciclo di vita (§9) e delle regole di consistenza interne che nessun altro dominio può violare.

**Entity.** È un concetto con una propria identità stabile, distinta dai suoi attributi: due Entity con gli stessi attributi restano due Entity distinte se hanno identità diverse. Un'Entity può essere essa stessa un Aggregate Root (se ha vita autonoma, es. Impresa), oppure può esistere solo all'interno del confine di un altro Aggregate (es. una Sessione all'interno di un'Edizione di un Evento — ha un'identità propria, ma non ha senso al di fuori dell'Evento a cui appartiene).

**Value Object.** È un concetto privo di identità propria, definito interamente dai suoi attributi: due Value Object con gli stessi attributi sono, concettualmente, lo stesso valore. Un Value Object non ha un proprio ciclo di vita indipendente: la sua esistenza è sempre subordinata a chi lo utilizza (§5).

**Relazione tra Aggregate ed Entity.** Un Aggregate Root può contenere una o più Entity che esistono solo nel suo confine (Entity dipendenti, senza vita propria fuori dall'Aggregate) oppure può referenziare altri Aggregate Root esterni per identità, mai per inclusione. Nessuna Entity dipendente di un Aggregate può essere referenziata direttamente da un altro dominio come se fosse essa stessa un Aggregate Root: chi ha bisogno di referenziarla deve farlo passando per l'Aggregate Root che la contiene.

**Principi per la rappresentazione fisica di un Aggregate (non progettazione di tabelle).**

1. Un Aggregate Root deve avere, nel fisico, un punto di identità unico e stabile che lo rappresenti in ogni momento del suo ciclo di vita (§6), indipendentemente da come i suoi attributi cambiano nel tempo.
2. Le regole di consistenza interne dichiarate nel documento logico di un Aggregate (per esempio: una Persona non può avere due dichiarazioni identiche della stessa competenza; un'Appartenenza non può avere due ruoli esclusivi sovrapposti nello stesso periodo) devono essere preservate dalla struttura fisica stessa, non lasciate alla sola disciplina di chi scrive i dati.
3. Le Entity dipendenti di un Aggregate devono essere rappresentate fisicamente in modo da rimanere sempre riconducibili al proprio Aggregate Root: non devono poter "sopravvivere" concettualmente alla cancellazione o all'archiviazione dell'Aggregate che le contiene, salvo quando il documento logico prevede esplicitamente una loro storicizzazione autonoma (§8).
4. Un cambiamento che coinvolge contemporaneamente un Aggregate Root e le sue Entity dipendenti deve poter essere trattato, dal punto di vista del significato di dominio, come un unico evento di cambiamento coerente — anche se la tecnologia scelta in seguito lo realizzerà con mezzi propri, che questo documento non anticipa.
5. Un Aggregate Root non deve mai essere rappresentato come parte interna di un altro Aggregate Root: se un documento logico ha stabilito che un concetto è un Aggregate autonomo (per esempio Appartenenza rispetto a Persona e Impresa), il mapping fisico non può "annidarlo" dentro un altro Aggregate per comodità.
6. Un Aggregate Root può referenziare altri Aggregate Root esterni solo per identità stabile (§6, §7), mai incorporandone gli attributi: questo è il modo in cui il fisico rispetta il confine di proprietà già stabilito nel logico (§14).

---

## 4. Entità

**Quando una Entity diventa persistente.** Un'Entity individuata nel modello logico deve avere una propria rappresentazione persistente e individuabile quando ricorre almeno una di queste condizioni: ha un proprio ciclo di vita distinto da quello del suo Aggregate (nasce, cambia stato, si conclude in momenti diversi); deve poter essere referenziata singolarmente da altri concetti, dello stesso dominio o di un altro; richiede una propria storicizzazione (§8) indipendente da quella del suo Aggregate; oppure la sua cardinalità è potenzialmente ampia o variabile nel tempo (molte istanze per lo stesso Aggregate, che possono crescere senza un limite concettuale fisso).

**Quando una Entity non deve essere persistente.** Non riceve una propria rappresentazione persistente distinta quando è, in realtà, un Value Object mascherato da Entity — cioè non ha una vera identità propria, ma è interamente descritta dai suoi attributi (§5) — oppure quando è interamente derivabile da altri dati già persistenti senza necessità di essere dichiarata o verificata autonomamente (§13): in quel caso la sua "esistenza" è un calcolo, non un fatto da conservare.

**Quando viene incorporata.** Un'Entity viene incorporata nella struttura del proprio Aggregate quando non ha senso concettuale al di fuori di esso, la sua cardinalità è limitata e stabile (poche istanze, non crescenti nel tempo in modo significativo), e non necessita di essere referenziata da altri domini né di evolvere secondo un proprio calendario indipendente da quello dell'Aggregate.

**Quando viene separata.** Un'Entity viene separata (resa un proprio elemento persistente autonomo, sebbene dipendente dall'Aggregate che la contiene) quando la sua cardinalità è ampia o variabile, ha stati propri indipendenti dallo stato dell'Aggregate, deve essere referenziabile da altri domini, o richiede una storicizzazione distinta da quella del suo Aggregate.

**Criteri riassuntivi.** I criteri da applicare, nell'ordine in cui vanno verificati per ciascuna Entity individuata nel documento logico di un dominio, sono: (1) cardinalità attesa; (2) indipendenza del ciclo di vita rispetto all'Aggregate; (3) necessità di referenziabilità da parte di altri concetti o domini; (4) necessità di storicizzazione propria; (5) frequenza e autonomia di variazione nel tempo. Nessun criterio da solo è decisivo: la valutazione è d'insieme, ed è sempre il documento logico del dominio — non una preferenza del mapping — a fornire le risposte a queste domande.

---

## 5. Value Object

**Quando rimane incorporato.** Un Value Object rimane incorporato nella struttura di chi lo contiene quando non ha alcun bisogno di essere referenziato da altri concetti, cambia sempre solidalmente con l'Entity o l'Aggregate che lo contiene (non ha un proprio ritmo di variazione), e non necessita di essere validato secondo regole più complesse di quelle già applicabili al suo contenitore.

**Quando viene separato.** Un Value Object viene formalizzato come proprio elemento persistente distinto (senza per questo diventare un'Entity con identità propria: resta definito dai suoi attributi, non da un'identità) quando è condiviso da più concetti o più Aggregate che devono poter fare riferimento allo stesso valore in modo coerente, quando deve essere validato secondo regole proprie e non banali, oppure quando la sua cardinalità meriterebbe di essere gestita come una collezione di valori distinti per la stessa Entity (per esempio più valori dello stesso tipo di Value Object associati alla stessa istanza).

**Quando viene riutilizzato.** Un Value Object viene riutilizzato, invece di essere ridefinito localmente da ogni dominio, quando rappresenta un concetto di catalogo condiviso tra più domini — una Tassonomia condivisa (lingua, competenza, settore, territorio, categoria) di cui `reconciliation-report.md` §7 e `domain-model.md` riconoscono la natura trasversale. In questo caso, ciò che compare in un dominio che lo utilizza non è una copia libera del valore, ma un riferimento a un'entità di catalogo posseduta da un unico dominio proprietario (§2, principio 1-2): il valore stesso resta unico, referenziato da chi lo usa.

**Criteri.** I criteri applicabili sono: grado di condivisione tra domini o Aggregate diversi; necessità di una validazione autonoma non banale; cardinalità (valore singolo o collezione di valori per la stessa Entity); stabilità nel tempo del catalogo di riferimento (un catalogo che cambia raramente e in modo controllato è un buon candidato per il riuso, un valore che varia liberamente istanza per istanza resta più naturalmente incorporato).

---

## 6. Identità

**Identità interna.** È il modo in cui la struttura fisica distingue in modo univoco e stabile una singola istanza di un concetto, senza che questo distintivo abbia di per sé alcun significato di dominio. L'identità interna non deve mai essere esposta come informazione di business, non deve mai essere scelta dall'utente, e non deve mai cambiare per l'intera durata di vita dell'istanza a cui appartiene, anche quando tutti i suoi attributi (incluso ciò che la rende pubblicamente riconoscibile) cambiano.

**Identità pubblica.** È il modo in cui un soggetto o un fatto è riconoscibile, citabile e distinguibile da chi lo osserva dall'esterno del sistema (una denominazione, un nome pubblico, un codice leggibile, uno slug). L'identità pubblica è distinta dall'identità interna e può cambiare nel tempo — perché il soggetto cambia nome, perché una denominazione viene corretta, perché un contenuto viene rinominato — senza che questo debba mai comportare la creazione di una nuova identità interna né la rottura dei riferimenti già esistenti verso quell'istanza.

**Identità stabile.** È il tipo di riferimento che un dominio garantisce non cambierà mai significato nel tempo: quando un altro dominio referenzia un'istanza tramite un'identità stabile, quel riferimento deve continuare a puntare, per tutta la vita dei dati, allo stesso soggetto o fatto, indipendentemente da come quel soggetto evolve, viene rinominato, sospeso o storicizzato. È l'identità stabile — non l'identità pubblica — la base di ogni relazione tra domini (§7, §14).

**Identità temporanea.** È un riferimento che ha senso solo per la durata di un processo, di una relazione o di un contesto limitato (una candidatura in corso, una sessione di partecipazione, un accesso provvisorio) e che non deve essere confuso con l'identità stabile del soggetto a cui si riferisce: al termine del processo, l'identità temporanea perde significato, mentre il soggetto che vi ha partecipato continua a esistere con la propria identità stabile, referenziabile anche dopo la conclusione del processo (si veda anche §13, dato temporaneo).

**Principio.** L'identità interna e l'identità pubblica sono sempre concettualmente distinte, anche quando in un caso concreto potessero apparire simili: un cambiamento della rappresentazione pubblica di un soggetto non deve mai richiedere una nuova identità interna, e nessun riferimento tra domini deve mai basarsi sull'identità pubblica (mutabile) invece che su quella stabile (immutabile).

---

## 7. Relazioni

**Uno-a-uno.** Da usare quando due concetti condividono di fatto lo stesso ciclo di vita e la stessa identità sostanziale, al punto che l'uno non ha senso senza l'altro e viceversa (per esempio l'identità di accesso e la Persona che ne è titolare, nella misura in cui il dominio logico li vincola a coesistere in modo esclusivo). Una relazione 1:1 va sempre verificata con sospetto: spesso segnala che i due concetti sono in realtà una sola Entity descritta da due documenti logici distinti, oppure che l'occasionale eccezione futura (più di un secondo elemento per il primo) non è stata considerata a livello logico.

**Uno-a-molti.** È la forma più comune per relazioni di appartenenza o possesso, dove un titolare può avere più istanze possedute ma ogni istanza appartiene a un solo titolare (per esempio una Persona e le sue Competenze dichiarate, un'Impresa e le sue Presenze di mercato). Il "molti" lato della relazione referenzia sempre il "uno" tramite identità stabile (§6), mai il contrario.

**Molti-a-molti.** Va usata quando entrambe le parti della relazione possono avere più controparti contemporaneamente (per esempio Persona/Impresa e Mercato internazionale, tramite Presenza di mercato; oppure Persona e Impresa, tramite Appartenenza). Una relazione molti-a-molti che porta con sé attributi propri, un proprio stato o una propria storia (come Appartenenza, Presenza di mercato) non è un semplice collegamento: è essa stessa un concetto di prima classe, con un proprio dominio proprietario, mai un dettaglio implicito lasciato senza responsabile.

**Relazioni deboli.** Sono relazioni in cui una delle due parti non ha significato di dominio se non nel contesto dell'altra: la sua esistenza dipende interamente dall'esistenza della controparte (per esempio una Sessione rispetto all'Edizione di un Evento a cui appartiene). Una relazione debole termina automaticamente, dal punto di vista del significato, quando termina la parte da cui dipende.

**Relazioni forti.** Sono relazioni tra due soggetti che hanno entrambi esistenza autonoma indipendentemente dalla relazione stessa: la relazione è un fatto aggiunto tra due Aggregate che esisterebbero comunque, anche in assenza di quella relazione (per esempio Appartenenza tra Persona e Impresa: entrambe esistono prima, durante e dopo la relazione).

**Relazioni temporanee.** Sono relazioni pensate, fin dall'origine logica, per essere valide solo per un periodo o un processo limitato, con una conclusione naturale prevista (per esempio una manifestazione di interesse verso un'Opportunità, un periodo di disponibilità dichiarata). Il documento logico del dominio deve sempre indicare cosa succede al termine della relazione: se si conclude e basta, se lascia una traccia storica (relazione storica, sotto), o se si trasforma in un altro tipo di relazione.

**Relazioni storiche.** Sono relazioni che, anche una volta concluse, devono restare consultabili come fatto realmente avvenuto (si veda anche §8): un'Appartenenza conclusa, una Delega scaduta, una Presenza di mercato cessata. Il fatto che la relazione non sia più corrente non ne autorizza la cancellazione: la sua conclusione è essa stessa un fatto da conservare.

**Relazioni derivate.** Non sono un fatto autonomo dichiarato da qualcuno, ma il risultato di un calcolo o di un'aggregazione condotta su altri fatti o relazioni già esistenti (per esempio un Indicatore dell'Osservatorio calcolato a partire da più Appartenenze o più Presenze di mercato). Una relazione derivata non deve mai essere trattata, nel mapping fisico, come se fosse un fatto dichiarato al pari delle relazioni sorgente da cui proviene (si veda anche §13).

**Principio comune a tutte le relazioni.** Ogni relazione individuata a livello logico ha sempre un dominio proprietario esplicito, mai implicito: il documento di mapping fisico di un dominio deve poter indicare, per ogni relazione che tratta, se ne è il proprietario o se la sta solo referenziando come partecipante. La scelta del tipo di relazione (uno-a-uno, uno-a-molti, molti-a-molti, debole, forte, temporanea, storica, derivata) non è una libertà del mapping: deve sempre rispecchiare fedelmente la natura già stabilita nel documento logico corrispondente, non essere reinventata per comodità nella fase di traduzione fisica.

---

## 8. Storicizzazione

**Quando un fatto deve essere storicizzato.** Un fatto deve essere storicizzato quando il suo essere stato vero in un determinato momento del passato resta, di per sé, rilevante per il dominio — per continuità (ricostruire un percorso), per verifica (dimostrare cosa era noto o dichiarato in un momento dato), o per responsabilità (stabilire chi ha detto o fatto cosa, e quando). Questo riguarda, nella pratica di questa piattaforma, la grande maggioranza dei fatti trattati dai domini di business: un'Appartenenza conclusa, una Certificazione scaduta, una Delega revocata, un Contenuto rettificato sono tutti esempi già individuati nei documenti logici in cui la conclusione di un fatto non ne autorizza la sparizione.

**Quando non è necessario storicizzare.** Un fatto non richiede storicizzazione quando è puramente transitorio e la sua evoluzione nel tempo non ha alcun valore di dominio dichiarato (per esempio un contatore non normativo di visualizzazioni, o uno stato tecnico che non rappresenta alcuna decisione o dichiarazione). Questa condizione va verificata con attenzione, perché nei documenti logici già prodotti è rara: quasi ogni fatto trattato da questa piattaforma (dichiarazioni, verifiche, appartenenze, pubblicazioni, partecipazioni) ha un valore che sopravvive alla sua conclusione.

**Stato corrente.** È il valore o la condizione valida ora, ciò che risponde alla domanda "com'è oggi questo fatto o questa Entity". È sempre univoco per definizione: non possono esistere due stati correnti contemporanei per la stessa istanza.

**Storia.** È l'insieme delle condizioni che sono state vere in momenti precedenti a quello corrente, non più valide per l'uso presente ma conservate perché restano un fatto realmente avvenuto. La storia non viene consultata per determinare "come stanno le cose ora", ma per ricostruire "come stavano le cose in un momento passato, o come si è arrivati alla condizione attuale".

**Versione.** È una nuova redazione o rappresentazione di un contenuto o di un fatto dichiarato, che sostituisce la precedente per l'uso corrente ma non la elimina: la precedente resta parte della storia. Si veda anche §11 per il trattamento specifico dei Contenuti editoriali.

**Rettifica.** È una correzione dichiarata di un errore in una condizione o in un contenuto precedente: si distingue da una semplice nuova versione perché dichiara esplicitamente che la condizione precedente era scorretta (non solo superata da un'evoluzione naturale). La rettifica deve sempre restare visibile in relazione a ciò che ha corretto, mai sostituirlo silenziosamente.

**Annullamento.** È la dichiarazione che un fatto non deve più produrre effetti per il futuro, senza necessariamente affermare che fosse un errore al momento in cui è stato dichiarato (si distingue così dalla rettifica): per esempio un'Opportunità annullata prima della sua scadenza naturale, o una Collaborazione interrotta.

**Archiviazione.** È la conservazione deliberata di un fatto o di un'Entity non più corrente, per valore storico, distinta sia dalla cancellazione (il dato non viene mai perso) sia dalla semplice sostituzione (l'elemento archiviato resta identificabile come tale, non si confonde con lo stato corrente).

**Principio.** La storicizzazione non deve mai far perdere la possibilità di ricostruire, per qualsiasi fatto rilevante del dominio, chi ha dichiarato o determinato cosa, e quando lo ha fatto — anche quando lo stato corrente è cambiato più volte da allora. Questo principio guida la traduzione fisica senza specificarne la tecnica: ogni documento di mapping dovrà indicare, per ciascuna Entity trattata, quale delle sei nozioni sopra (stato corrente, storia, versione, rettifica, annullamento, archiviazione) si applica e perché, sulla base di quanto già stabilito nel proprio documento logico.

---

## 9. Stati

**Il principio degli assi indipendenti.** Ogni Entity il cui ciclo di vita è stato modellato nei documenti logici lungo più dimensioni distinte deve conservare, nel mapping fisico, quelle stesse dimensioni come concetti separati e indipendenti, mai compressi in un unico valore di "stato". Un asse rappresenta una domanda specifica che si può porre su un'istanza; assi diversi rappresentano domande diverse, che possono avere risposte diverse nello stesso momento, e che possono cambiare in momenti diversi senza che il cambiamento di un asse implichi automaticamente il cambiamento di un altro.

**Perché verifica, pubblicazione, validità, visibilità, sicurezza e accesso non devono essere compressi.**

- **Verifica** risponde alla domanda "questo fatto è stato controllato, e da chi, secondo quale metodo" (§10).
- **Pubblicazione** risponde alla domanda "questo fatto o contenuto è stato reso disponibile all'esterno, per una scelta esplicita di chi ne ha la titolarità".
- **Validità** risponde alla domanda "questo fatto produce ancora effetti, oppure è scaduto, concluso o superato".
- **Visibilità** risponde alla domanda "chi può vedere questo fatto, oggi", che può dipendere da pubblicazione, validità e da regole di accesso combinate, ma non si riduce a nessuna di esse singolarmente.
- **Sicurezza** risponde alla domanda "questo dato è protetto da un accesso o una modifica non autorizzata", una garanzia trasversale che vale indipendentemente da cosa il dato rappresenti.
- **Accesso** risponde alla domanda "chi ha, in questo momento, il diritto tecnico e organizzativo di leggere o modificare questo dato" — e, come stabilito nel documento logico di Identità & Accessi, l'accesso non crea mai da solo un diritto sostanziale sul fatto a cui si accede.

Comprimere questi assi in un solo campo costringerebbe a scegliere un unico valore quando, nella realtà del dominio, più condizioni sono vere contemporaneamente e in modo indipendente: un profilo può essere verificato ma non ancora pubblicato; un contenuto può essere pubblicato ma non più valido; un fatto può essere valido ma non visibile a tutti; un'istanza può essere visibile ma non accessibile in scrittura a chi la osserva. Perdere questa indipendenza significa perdere informazione che il dominio ha esplicitamente voluto conservare.

**Applicazione al mapping.** Ogni asse individuato nel documento logico di un dominio (si vedano in particolare i cicli di vita multi-asse di Persone, Imprese, Appartenenze, Contenuti editoriali, Identità & Accessi) deve restare, nel documento di mapping fisico corrispondente, un concetto distinto e distinguibile dagli altri assi — non necessariamente un elemento fisico separato in senso tecnico (questa sarebbe già una decisione della fase successiva), ma un concetto che il mapping tratta e giustifica separatamente, mai fuso con un altro asse per brevità o comodità espositiva.

---

## 10. Verifiche

**Il principio della verifica multidimensionale.** Ogni verifica individuata nei documenti logici riguarda sempre un aspetto specifico e dichiarato — mai una generica "affidabilità" del soggetto o del fatto nel suo complesso. Il rapporto di riconciliazione (`reconciliation-report.md`, §9 "Verifiche uniformate") ha già censito le diverse tipologie di verifica presenti nei documenti logici (tra cui, a titolo di richiamo non esaustivo: verifica di esistenza, di identità, di contatto, documentale, di fonte, di relazione/appartenenza, di rappresentanza, professionale/qualifica, editoriale, metodologica, di disponibilità, di partecipazione, di delega, di consenso, di qualità del dato): ciascuna risponde a una domanda diversa, condotta da un soggetto verificatore diverso, con esiti che non si sommano né si sostituiscono a vicenda.

**Conferma: non esiste un badge universale di "verificato".** Nessun documento di mapping fisico, per nessuno degli 11 domini, potrà introdurre un singolo segnale generico che dichiari un soggetto o un fatto "verificato" senza specificare l'aspetto verificato. Un soggetto verificato sul piano dell'identità non è, per ciò solo, verificato sul piano professionale; un contenuto verificato come fonte non è, per ciò solo, editorialmente approvato. Ogni verifica resta un fatto a sé, con il proprio esito, il proprio metodo e il proprio responsabile.

**Principio per la traduzione fisica.** La responsabilità di una verifica appartiene sempre al dominio che la possiede secondo il documento logico corrispondente (per esempio: le verifiche relative a un'Appartenenza appartengono al dominio Appartenenze, anche quando riguardano fatti visibili anche altrove). Il mapping fisico non introduce nuove tipologie di verifica non previste dal logico, non fonde tipologie di verifica distinte in un unico esito, e non trasferisce la responsabilità di una verifica a un dominio diverso da quello che il logico ha già individuato come proprietario.

---

## 11. Versioni

**Versione.** Una nuova redazione di un contenuto o di un fatto dichiarato, che ne sostituisce l'uso corrente conservando le redazioni precedenti come storia (§8). Ogni versione deve poter essere ricondotta a chi l'ha prodotta e in quale momento, e deve essere sempre possibile distinguere la versione corrente da quelle precedenti.

**Traduzione.** Un adattamento linguistico di un contenuto, concettualmente distinto da una nuova versione: la traduzione non sostituisce l'originale nella sua lingua di origine e non ne rappresenta un'evoluzione, ma un'espressione parallela dello stesso contenuto. Un contenuto può avere più traduzioni valide simultaneamente, mentre può avere solo una versione corrente per lingua.

**Revisione.** Il processo di controllo e possibile miglioramento di un contenuto o di un fatto dichiarato, distinto dal suo risultato: una revisione può concludersi producendo una nuova versione, oppure confermando senza modifiche la versione esistente. La revisione, in quanto processo, è un momento logicamente distinto sia dalla redazione iniziale sia dalla pubblicazione.

**Rettifica.** Già definita al §8: qui va ripresa come un tipo particolare di nuova versione, che si distingue dalle altre perché dichiara esplicitamente che la versione precedente conteneva un errore, non solo che è stata superata da un aggiornamento.

**Pubblicazione.** L'atto che rende disponibile all'esterno una versione determinata di un contenuto o di un fatto, distinto dalla sua creazione o dalla sua revisione. Redazione, revisione e pubblicazione restano sempre momenti distinti (coerentemente con il principio degli assi indipendenti, §9): una versione può esistere ed essere stata revisionata senza essere ancora pubblicata, e una pubblicazione precedente può restare visibile mentre una nuova versione è in fase di revisione.

**Principio.** Per ogni versione trattata da un futuro documento di mapping deve essere sempre possibile stabilire: chi l'ha prodotta, quando, in che rapporto sta con le versioni precedenti dello stesso contenuto o fatto (se è una successione naturale, una traduzione parallela, o una rettifica), e se e quando è stata pubblicata. Questo principio guida la traduzione fisica senza specificare come venga realizzato.

---

## 12. Eventi di dominio

**Perché vengono modellati.** Gli eventi di dominio vengono modellati perché ogni dominio produce, nel corso della propria attività, fatti rilevanti che altri domini o funzioni trasversali (per esempio l'Osservatorio, oppure future funzioni di notifica o ricerca) potrebbero avere bisogno di conoscere, senza che questo richieda una conoscenza approfondita e diretta della struttura interna del dominio che li produce. Modellare gli eventi è il modo in cui questa architettura permette a un dominio di "far sapere" che qualcosa è accaduto, mantenendo comunque il confine di proprietà stabilito al §14: chi riceve notizia di un evento non diventa proprietario del fatto che lo ha generato.

**Cosa rappresentano.** Un evento di dominio rappresenta sempre un fatto già accaduto — mai un comando, un'intenzione o una richiesta. Ogni documento logico di dominio ha già elencato, nella propria sezione dedicata (tipicamente denominata "Eventi di dominio" o equivalente), quali fatti rilevanti il dominio produce, quali condizioni li generano, e quali conseguenze concettuali possono avere in altri domini. Un evento porta con sé, concettualmente, l'informazione di chi (quale Aggregate) lo ha generato, cosa è accaduto, quando, e in quali condizioni — non porta con sé lo stato completo dell'Aggregate che lo ha generato, e non autorizza chi lo riceve a modificare il dominio che lo ha prodotto.

**Come saranno utilizzati nel mapping.** Ogni futuro documento di mapping fisico dovrà garantire che l'informazione necessaria a ricostruire, per ciascun evento già individuato nel documento logico del proprio dominio, chi l'ha generato, cosa è accaduto e quando, sia effettivamente presente e ricostruibile a partire dalla struttura fisica descritta — anche quando l'evento non verrà reso esplicito come un proprio elemento a parte in questa fase di traduzione. Questo principio non implica, e non anticipa, alcuna decisione su code di messaggi, broker, sistemi distribuiti o meccanismi di comunicazione tra sistemi: queste sono decisioni di implementazione che appartengono a fasi successive, del tutto estranee a questo documento e ai futuri documenti di mapping, che si limitano a garantire che il significato dell'evento resti ricostruibile dal dato persistente.

---

## 13. Dati derivati

**Dato sorgente.** Il dato originale, dichiarato direttamente da chi ne ha titolo (una Persona, un'Impresa, un soggetto verificatore, un redattore) o osservato direttamente nel dominio che lo possiede. È sempre il punto di partenza di qualsiasi altro tipo di dato descritto in questa sezione.

**Dato derivato.** Qualsiasi dato ottenuto elaborando uno o più dati sorgente. Un dato derivato non deve mai essere trattato come se fosse esso stesso un dato sorgente: non lo sostituisce, non lo corregge retroattivamente, e se il dato sorgente cambia, il dato derivato deve poter essere ricalcolato o segnalato come non più coerente con l'origine.

**Dato aggregato.** Un dato derivato costruito specificamente combinando informazioni relative a più soggetti o istanze distinte (il caso tipico è l'Osservatorio, che produce conoscenza aggregata a partire da fatti operativi di molti domini). Un dato aggregato richiede un'attenzione particolare affinché la combinazione non permetta di ricostruire, per deduzione, l'informazione relativa a un singolo soggetto che il dominio sorgente non avrebbe reso visibile individualmente.

**Dato calcolato.** Un dato derivato ottenuto applicando una regola o una formula esplicita e riproducibile (il caso tipico è un Indicatore dell'Osservatorio). Un dato calcolato deve poter sempre essere ricondotto alla metodologia che lo ha generato: senza questo collegamento, un dato calcolato perde il proprio significato e rischia di essere confuso con un dato sorgente.

**Dato pubblicato.** Un dato — sorgente, derivato, aggregato o calcolato — che è stato reso visibile all'esterno secondo le regole di visibilità stabilite dal dominio che lo possiede (§9). La pubblicazione è sempre un evento o uno stato distinto dall'esistenza del dato stesso: un dato può esistere da tempo prima di essere pubblicato, e la sua pubblicazione non ne cambia la natura di sorgente, derivato, aggregato o calcolato.

**Dato temporaneo.** Un dato valido solo per la durata di un processo o di una relazione limitata nel tempo (si veda anche §6, identità temporanea). Un dato temporaneo non deve essere confuso con un dato storicizzato: la sua scomparsa al termine del processo che lo ha generato non rappresenta una perdita di storia, ma la naturale conclusione di qualcosa che il dominio non ha mai previsto dovesse persistere oltre quel processo.

**Dato storico.** Un dato che rappresenta una condizione passata, conservato deliberatamente per continuità, verifica o responsabilità (si veda §8). A differenza del dato temporaneo, il dato storico è sempre il risultato di una scelta esplicita del dominio di conservare un fatto concluso.

**Principio guida.** Un dato derivato, aggregato o calcolato non deve mai sostituire, alterare o rendere irrecuperabile il dato sorgente da cui proviene. Per ogni dato presentato in un futuro documento di mapping deve essere sempre possibile stabilire se si tratti di un dato sorgente o di un dato derivato in una delle sue forme, e su quale sorgente specifica esso si fondi.

---

## 14. Dipendenze

**Dipendenze ammesse.**

- Un dominio può dipendere da un altro dominio esclusivamente per riferimento a un'identità stabile (§6), mai per incorporazione dei suoi dati o dei suoi attributi.
- Un dominio può dipendere da un evento di dominio (§12) prodotto da un altro dominio, per reagire a un fatto già accaduto, senza che questo crei un obbligo di conoscenza approfondita della struttura interna del dominio che lo ha generato.
- Un dominio a vocazione analitica (Osservatorio) può dipendere in lettura da tutti i domini sorgente di cui elabora i fatti, ma non può mai scrivere o modificare i fatti dei domini che osserva.
- Un dominio a vocazione narrativa (Contenuti editoriali) può dipendere da qualsiasi altro dominio come soggetto raccontato, referenziandolo per identità, ma non diventa mai l'editore dei fatti operativi di quel dominio: può raccontarli, non modificarli né determinarli.
- Il dominio Identità & Accessi può dipendere da qualsiasi altro dominio per applicare una decisione di accesso (chi può leggere, chi può scrivere), ma non definisce mai la visibilità sostanziale o il significato di business di quel dominio: applica una decisione di accesso, non la determina nel merito.

**Dipendenze vietate.**

- Nessun dominio può duplicare un fatto di cui non è proprietario per comodità di lettura o per motivi di prestazione (si veda anche §2, principio 2, e §13 sui dati derivati, che restano l'unica forma ammessa di ripetizione motivata).
- Nessun dominio può modificare, direttamente o indirettamente, un fatto posseduto da un altro dominio: può solo osservarlo, referenziarlo, o reagire a un evento che lo riguarda.
- Nessun dominio tecnico o trasversale (Identità & Accessi, o future funzioni generiche come ricerca o notifiche) può diventare proprietario di un fatto sostanziale appartenente a un dominio di business.
- Non sono ammesse dipendenze circolari di proprietà: due domini non possono dichiararsi reciprocamente proprietari dello stesso fatto, né in modo esplicito né come conseguenza implicita di scelte di mapping successive.

**Accoppiamento.** Deve restare sempre basso tra domini diversi, e sempre mediato da un riferimento per identità stabile o da un evento di dominio: nessun dominio deve conoscere, per svolgere il proprio compito, la struttura interna delle Entity o dei Value Object di un altro dominio.

**Coesione.** Deve restare alta all'interno di ciascun dominio: le entità, i value object e le relazioni di un dominio devono essere pensati, e successivamente tradotti nel fisico, come un insieme coerente organizzato attorno al proprio Aggregate Root (§3), non come un insieme di elementi slegati che risultano collegati solo per effetto di riferimenti incidentali.

**Ownership.** Ogni dipendenza tra domini deve rendere sempre riconoscibile chi possiede il fatto referenziato. Un riferimento non trasferisce mai la proprietà del fatto a chi lo referenzia: il documento di mapping fisico di un dominio che referenzia un fatto esterno deve poter indicare esplicitamente qual è il dominio proprietario di quel fatto, coerentemente con la matrice di responsabilità di `reconciliation-report.md` §3.

---

## 15. Convenzioni generali

Le convenzioni seguenti non riguardano la sintassi tecnica (nessuna convenzione di questo documento riguarda nomi di tabelle, colonne o altri dettagli tecnici, che appartengono esclusivamente ai futuri documenti di mapping): riguardano la forma e il metodo che ogni futuro documento di mapping dovrà seguire, affinché gli 11 documenti risultino confrontabili e coerenti tra loro.

1. Ogni documento di mapping deve aprirsi dichiarando esplicitamente qual è l'Aggregate Root (o gli Aggregate Root, se il dominio ne individua più di uno) del dominio trattato, e i suoi confini, richiamando il documento logico corrispondente.
2. Ogni documento di mapping deve elencare esplicitamente, per il proprio dominio, quali fatti sono posseduti e quali sono solo referenziati da altri domini, richiamando la matrice di responsabilità di `reconciliation-report.md` §3.
3. Ogni documento di mapping deve trattare separatamente, per ciascuna Entity del proprio dominio: identità (§6), relazioni (§7), assi di stato (§9), verifiche (§10) e storicizzazione (§8) — mai in un'unica sezione indifferenziata che li confonda.
4. Ogni documento di mapping deve dichiarare esplicitamente quali principi di questo documento applica a ciascuna delle proprie scelte, non limitarsi a citarlo genericamente in apertura.
5. Ogni documento di mapping deve mantenere, su questi punti, la stessa struttura sostanziale in tutti gli 11 domini, per permettere un confronto e una revisione coerente: uniformità di metodo, non necessariamente uniformità tecnica.
6. Nessun documento di mapping può introdurre un principio in contraddizione con questo documento senza prima proporne esplicitamente una revisione in questa sede, con lo stesso rigore già applicato durante la riconciliazione logica.
7. Ogni documento di mapping resta, come questo, un documento di progettazione: la sua esistenza non implica che sia già stato implementato, applicato o migrato.
8. Ogni documento di mapping deve segnalare esplicitamente i concetti del proprio documento logico per cui non propone ancora una soluzione fisica definitiva, rinviandoli a una fase successiva, invece di forzare una risposta prematura.

---

## 16. Decisioni architetturali

Le seguenti decisioni sono consolidate e vincolanti per tutti gli 11 domini. Sono la sintesi operativa dei principi definiti nelle sezioni precedenti, e ogni futuro documento di mapping dovrà poterle richiamare senza doverle ridiscutere.

1. **Il dominio governa sempre il modello fisico.** Ogni scelta fisica discende da una decisione già presa, o da prendere, a livello logico — mai il contrario: il fisico non impone mai al dominio una semplificazione che il logico non ha previsto.
2. **Il mapping non modifica il business.** Tradurre non significa reinterpretare: se il mapping rivela un'esigenza che il logico non copre, si corregge il logico esplicitamente, non si introduce una soluzione fisica non autorizzata.
3. **Nessun fatto ha due proprietari.** Per ogni fatto rappresentato fisicamente esiste sempre un solo dominio responsabile, individuabile senza ambiguità.
4. **Le relazioni mantengono il proprietario logico.** Il mapping fisico non trasferisce la proprietà di una relazione a un dominio diverso da quello che il documento logico ha già individuato.
5. **I dati derivati non sostituiscono il dato sorgente.** Un dato calcolato, aggregato o pubblicato resta sempre distinguibile dal dato sorgente da cui proviene, e non lo altera retroattivamente.
6. **Gli stati restano indipendenti.** Verifica, pubblicazione, validità, visibilità, sicurezza e accesso restano assi distinti in ogni documento di mapping, mai compressi in un unico valore.
7. **Le verifiche restano indipendenti.** Non esiste e non potrà esistere un badge universale di "verificato": ogni verifica riguarda un aspetto specifico, con un proprio responsabile e un proprio esito.
8. **Gli eventi descrivono fatti già avvenuti.** Un evento di dominio non è mai un comando o un'intenzione, e il mapping fisico deve garantire che l'informazione necessaria a ricostruirlo resti disponibile.
9. **La storicizzazione non deve perdere significato.** Ogni fatto che il documento logico richiede di conservare come storia resta ricostruibile — chi, cosa, quando — anche dopo che lo stato corrente è cambiato.
10. **Il mapping deve essere uniforme in tutti gli 11 domini.** Persone, Imprese, Appartenenze, Professionisti, Mercati internazionali, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio e Identità & Accessi seguono lo stesso metodo di traduzione, le stesse categorie di analisi (§3-§14) e le stesse convenzioni (§15), pur descrivendo domini logicamente diversi.

---

## 17. Regole obbligatorie per tutti i futuri mapping

Le regole seguenti sono uniche e si applicano, senza eccezioni né varianti locali, a tutti gli 11 documenti di mapping fisico che verranno prodotti in seguito: **Persone, Imprese, Appartenenze, Professionisti, Mercati internazionali, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi**. Ogni documento di mapping dovrà poter dimostrare, punto per punto, di averle rispettate.

1. Dichiarare l'Aggregate Root del dominio prima di ogni altra trattazione, richiamando esplicitamente il documento logico corrispondente.
2. Elencare le Entity del dominio distinguendo quelle incorporate nell'Aggregate da quelle separate, motivando la scelta con i criteri del §4.
3. Elencare i Value Object del dominio distinguendo quelli incorporati da quelli riutilizzati da una Tassonomia condivisa, motivando la scelta con i criteri del §5.
4. Non introdurre alcuna struttura fisica che non sia riconducibile a un concetto già nominato nel documento logico del dominio (§2, principio 4).
5. Rappresentare ogni identità distinguendo sempre identità interna, identità pubblica e, quando rilevante, identità temporanea (§6).
6. Qualificare ogni relazione trattata secondo la sua natura logica già stabilita (uno-a-uno, uno-a-molti, molti-a-molti, debole, forte, temporanea, storica, derivata) senza reinventarla nel fisico (§7).
7. Indicare, per ogni relazione con un altro dominio, chi ne è il proprietario secondo la matrice di responsabilità di `reconciliation-report.md` §3 (§14).
8. Specificare, per ogni Entity, se e come è storicizzata, distinguendo esplicitamente stato corrente, storia, versione, rettifica, annullamento e archiviazione, quando applicabili (§8).
9. Mantenere distinti, per ogni Entity con un ciclo di vita multi-asse già individuato a livello logico, tutti gli assi di stato pertinenti (verifica, pubblicazione, validità, visibilità, sicurezza, accesso), senza comprimerli (§9).
10. Specificare, per ogni verifica trattata, l'aspetto verificato, il soggetto verificatore e l'esito, senza introdurre un badge generico di "verificato" (§10).
11. Specificare, per i contenuti o i fatti soggetti a redazione, la distinzione tra versione, traduzione, revisione, rettifica e pubblicazione (§11).
12. Elencare gli eventi di dominio già individuati nel documento logico, indicando quale informazione persistente permette di ricostruirli, senza introdurre tecnologie di comunicazione (§12).
13. Distinguere esplicitamente, per ogni dato trattato, se è un dato sorgente o una delle forme di dato derivato (aggregato, calcolato, pubblicato, temporaneo, storico), indicandone la fonte (§13).
14. Elencare le dipendenze verso altri domini distinguendo quelle ammesse da quelle vietate secondo i criteri del §14, senza introdurre duplicazioni non motivate.
15. Seguire le convenzioni generali di struttura ed esposizione definite al §15, mantenendo la stessa articolazione già seguita dagli altri documenti di mapping.
16. Segnalare esplicitamente, in una sezione dedicata, ogni questione aperta o rinviata a un documento successivo, senza forzare una soluzione fisica prematura.
17. Dichiarare esplicitamente, in chiusura, la piena coerenza (o le eventuali difformità motivate) con questo documento, con `docs/domain-model.md` e con il proprio documento logico di riferimento.

---

## 18. Checklist finale

Verifica finale del presente documento, condotta prima della sua chiusura:

| # | Verifica | Esito |
|---|---|---|
| 1 | Nessuna implementazione tecnica descritta | Verificato — il documento tratta solo principi, criteri e definizioni, mai passi implementativi |
| 2 | Nessun SQL presente | Verificato — nessuna istruzione SQL, nessun `CREATE TABLE`; i riferimenti a "SQL" e "`CREATE TABLE`" compaiono solo nella nota introduttiva e in §1, come cosa il documento esplicitamente esclude |
| 3 | Nessuna tecnologia nominata come scelta di progetto | Verificato — PostgreSQL e Supabase sono nominati una sola volta (§1) esclusivamente per dichiarare l'indipendenza dei principi da qualsiasi tecnologia, non come parte del contenuto normativo |
| 4 | Nessuna API descritta | Verificato — nessuna interfaccia, endpoint o contratto applicativo è trattato |
| 5 | Nessun database specifico progettato | Verificato — non è definita alcuna tabella, colonna, indice o schema |
| 6 | Piena coerenza con `docs/domain-model.md` | Verificato — ogni principio richiama esplicitamente le nozioni già stabilite nella sintesi logica (dominio proprietario, assi indipendenti, eventi di dominio, dati derivati, dipendenze ammesse/vietate) senza introdurne di nuove né contraddirle |
| 7 | Piena coerenza con gli 11 domini logici | Verificato — le sezioni su Aggregate Root, Entity, Value Object, relazioni, storicizzazione, stati, verifiche, versioni ed eventi sono state formulate a partire dai pattern effettivamente ricorrenti nei documenti di `docs/architecture/logical/`, senza imporre categorie estranee a quanto già modellato |
| 8 | Nessuna contraddizione con `reconciliation-report.md` | Verificato — i richiami alla matrice di responsabilità (§3), al glossario e alla tassonomia delle verifiche (§6) sono coerenti con quanto già consolidato nel rapporto di riconciliazione, che resta l'unica fonte per le decisioni specifiche di dominio |

---

## Riepilogo

**Principi definiti.** Il documento stabilisce, in 18 sezioni, i principi che governano la traduzione del modello logico nel modello fisico per l'intero progetto: la distinzione tra livello logico e livello fisico e il principio "business first" (§1); otto principi generali di traduzione, dalla proprietà unica dei fatti alla preservazione della coerenza (§2); i criteri per riconoscere e rappresentare Aggregate Root, Entity e Value Object (§3-§5); la distinzione tra identità interna, pubblica, stabile e temporanea (§6); la tipologia delle relazioni tra concetti, con il principio che ciascuna mantiene il proprietario logico già stabilito (§7); i criteri di storicizzazione e le sue sei forme — stato corrente, storia, versione, rettifica, annullamento, archiviazione (§8); il principio degli assi di stato indipendenti, applicato a verifica, pubblicazione, validità, visibilità, sicurezza e accesso (§9); il principio della verifica multidimensionale e l'assenza di un badge universale di "verificato" (§10); le nozioni di versione, traduzione, revisione, rettifica e pubblicazione (§11); il ruolo degli eventi di dominio come fatti già avvenuti (§12); le sette categorie di dato — sorgente, derivato, aggregato, calcolato, pubblicato, temporaneo, storico (§13); le dipendenze ammesse e vietate tra domini, con i concetti di accoppiamento, coesione e ownership (§14); le convenzioni generali che ogni futuro documento di mapping dovrà seguire (§15).

**Decisioni consolidate.** Sono state consolidate dieci decisioni architetturali vincolanti (§16) — dal principio che il dominio governa sempre il fisico, fino all'obbligo di uniformità del metodo di mapping su tutti gli 11 domini — e diciassette regole obbligatorie puntuali (§17) che ciascun futuro documento di mapping (Persone, Imprese, Appartenenze, Professionisti, Mercati internazionali, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi) dovrà dimostrare di aver rispettato.

**Punti rinviati ai documenti successivi.** Restano deliberatamente non trattati in questo documento, perché di competenza dei singoli documenti di mapping fisico o di fasi ancora successive:
- l'identificazione puntuale, per ciascun dominio, di quali Entity saranno incorporate e quali separate (il criterio è qui definito, §4; l'applicazione è compito di ciascun mapping);
- la scelta di quali Value Object saranno formalizzati come catalogo condiviso e quali resteranno incorporati in ciascun dominio specifico (criterio definito al §5, applicazione rinviata);
- ogni dettaglio tecnico di rappresentazione (tipi di dato, vincoli, indici, meccanismi di applicazione delle regole) che appartiene esclusivamente ai documenti di mapping per singolo dominio e, in seguito, ai piani di migrazione;
- la progettazione dei meccanismi con cui gli eventi di dominio verranno effettivamente propagati o consumati, esplicitamente esclusa dal principio del §12;
- la risoluzione dei concetti ancora privi di un dominio proprietario dedicato già segnalati in `reconciliation-report.md` (in particolare "Servizi" e "Organizzazioni istituzionali"), che restano questioni di modellazione logica, non di mapping fisico, e che dovranno essere risolte prima che un eventuale documento di mapping li tratti.

Il documento è pronto per essere usato come riferimento vincolante da ciascuno degli 11 futuri documenti di mapping fisico per dominio.
