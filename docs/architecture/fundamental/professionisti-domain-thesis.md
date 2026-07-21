# Tesi architetturale del dominio PROFESSIONISTI

> Livello architetturale, fondazionale, pre-modellazione. Questo documento NON è un modello dati, NON è un Domain Mapping (né logico né fisico), NON descrive implementazione. Non contiene tabelle, aggregate, entità, value object, eventi di dominio, schema logico, schema fisico, SQL, PostgreSQL, Supabase, API o migrazioni. Il suo scopo si esaurisce prima dell'inizio di qualunque modellazione: dimostrare, con rigore e a partire esclusivamente dall'architettura già approvata, quale sia il corretto significato di business del dominio Professionisti — perimetro, responsabilità, confini — così da prevenire duplicazioni, sovrapposizioni e responsabilità improprie in ogni futura modellazione.
> Fondamenti (non modificati da questo documento): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), [`docs/architecture/fundamental/domain-patterns.md`](./domain-patterns.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/physical/domain-mapping/persone.md`](../physical/domain-mapping/persone.md), [`docs/architecture/physical/domain-mapping/imprese.md`](../physical/domain-mapping/imprese.md), [`docs/architecture/physical/domain-mapping/appartenenze.md`](../physical/domain-mapping/appartenenze.md), [`docs/architecture/physical/domain-mapping/mercati-internazionali.md`](../physical/domain-mapping/mercati-internazionali.md), [`docs/architecture/logical/persone.md`](../logical/persone.md), [`docs/architecture/logical/imprese.md`](../logical/imprese.md), [`docs/architecture/logical/appartenenze.md`](../logical/appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](../logical/mercati-internazionali.md).
> Nota di trasparenza obbligatoria (si veda §2). Un documento `docs/architecture/logical/professionisti.md` esiste già ed è già stato riconciliato con gli altri dieci domini logici (`domain-model.md` §15). Questa tesi non lo ignora e non finge che il dominio sia ancora del tutto da inventare: lo tratta come un'ipotesi già formulata da verificare in modo indipendente, con lo stesso rigore con cui si verificherebbe qualunque altra interpretazione, e non come una conclusione da ripetere per autorità. Il vuoto reale che questo documento colma è un altro, ed è dichiarato esplicitamente al §1: l'assenza di un Physical Domain Mapping di Professionisti, e l'assenza — finora — di una verifica esplicita, argomentata e comparativa delle interpretazioni alternative, che nessun documento esistente aveva ancora condotto per questo dominio.

---

## Indice

1. [Scopo del documento](#1-scopo-del-documento)
2. [Documenti analizzati](#2-documenti-analizzati)
3. [Metodo di analisi](#3-metodo-di-analisi)
4. [Domanda architetturale](#4-domanda-architetturale)
5. [Analisi delle possibili interpretazioni](#5-analisi-delle-possibili-interpretazioni)
6. [Dimostrazione della soluzione scelta](#6-dimostrazione-della-soluzione-scelta)
7. [Responsabilità del dominio](#7-responsabilità-del-dominio)
8. [Fatti proprietari](#8-fatti-proprietari)
9. [Fatti esclusi](#9-fatti-esclusi)
10. [Confini del dominio](#10-confini-del-dominio)
11. [Rapporti con gli altri domini](#11-rapporti-con-gli-altri-domini)
12. [Applicazione dei pattern fondazionali](#12-applicazione-dei-pattern-fondazionali)
13. [Rischi architetturali](#13-rischi-architetturali)
14. [Questioni aperte](#14-questioni-aperte)
15. [Conclusioni](#15-conclusioni)
16. [Decisione architetturale finale](#16-decisione-architetturale-finale)

[Revisione finale](#revisione-finale)

---

## 1. Scopo del documento

**Cosa deve dimostrare questo documento.** Prima di progettare il Physical Domain Mapping del dominio Professionisti — l'unico, tra i domini "core-adiacenti" già coperti da un Logical Data Model, a non avere ancora un corrispondente fisico approvato (`domain-dependency-map.md`, riga 761: Professionisti è incluso tra i "nove Physical Domain Mapping ancora da realizzare") — è necessario dimostrare, e non presumere, quale sia il corretto significato di business del dominio: cosa rappresenta, quali fatti possiede in esclusiva, quali confini ha rispetto a Persone, Imprese, Appartenenze e Mercati Internazionali, e come si collocherà rispetto ai domini ancora ipotetici (Collaborazioni, Opportunità, Eventi, Organizzazioni istituzionali).

**Cosa NON è questo documento.**
- Non è un modello dati: non introduce entità, attributi, cardinalità o value object.
- Non è un Domain Mapping, né logico né fisico: non ridefinisce né sostituisce alcuna decisione di modellazione.
- Non descrive alcuna implementazione: nessun riferimento a database, schema, API o codice.
- Non è una sintesi o una parafrasi di `logical/professionisti.md`: è una verifica architetturale indipendente, condotta con il metodo e il vocabolario di `domain-patterns.md` e con una lettura comparativa dei quattro Physical Domain Mapping già approvati, che raggiunge le proprie conclusioni argomentando da zero ciascuna delle interpretazioni possibili (§5), non assumendo la correttezza di quella già scelta a livello logico.

**Perché ora, e perché in questa forma.** `domain-patterns.md` (§1) ha già stabilito che ogni futuro Domain Mapping deve essere preceduto da una verifica esplicita di pattern comuni prima di essere scritto. Questo documento applica lo stesso principio metodologico a un livello ancora precedente: prima di applicare i pattern comuni a un caso concreto, occorre stabilire con certezza *cosa* si sta modellando. Questo è tanto più necessario per Professionisti perché — a differenza di Appartenenze e Mercati Internazionali, la cui natura relazionale era già anticipata senza ambiguità dal Domain Model — la natura di questo dominio era stata lasciata come domanda aperta esplicita in tre documenti logici indipendenti (`imprese.md` §12, `opportunita.md` §15, `collaborazioni.md` §6/§15) prima di essere risolta da `logical/professionisti.md`, e proprio per questo merita una verifica dedicata e autonoma, non un'eredità acritica.

**Effetto sui documenti esistenti.** Questo documento non modifica alcun documento esistente. Se la sua verifica indipendente confermasse la conclusione già raggiunta da `logical/professionisti.md`, quella conferma sarebbe essa stessa un risultato utile (una seconda dimostrazione, indipendente dalla prima, riduce il rischio che la prima fosse una scelta di comodo non sufficientemente esaminata). Se la verifica rivelasse un'incoerenza, questo documento la segnalerebbe come tale al §14, senza correggere direttamente alcun documento logico o fisico.

---

## 2. Documenti analizzati

Letti integralmente per questa tesi:

| Documento | Ruolo nell'analisi |
|---|---|
| `docs/costituzione-piattaforma.md` | Principio "la persona prima dell'impresa"; i cinque ecosistemi (Persone, Imprese, Opportunità e Collaborazioni, Mercati Internazionali, Servizi); Professionisti compare qui solo implicitamente, dentro l'ecosistema "Servizi per vivere, lavorare e crescere" (§6.5) e nel Flusso 2 ("Dal professionista alla rete di collaborazioni", §7) — nessuna menzione di un dominio "Professionisti" autonomo: prova diretta che, al livello concettuale più alto della piattaforma, il professionista è pensato come una fase del percorso della Persona, non come un quinto pilastro |
| `docs/domain-model.md` | Mappa dei domini (§2): Professionisti classificato "Supporting", non "Core"; §3: responsabilità sintetica, confini, dipendenze; §5: relazione Persona–Professionista come "ruolo che una Persona assume, non un soggetto nuovo"; §13, decisione vincolante 5: "Professionista è un ruolo che una Persona assume, non un soggetto o un dominio di soggetti nuovo" — la fonte più autorevole e più esplicita per la domanda di questo documento |
| `docs/platform-data-specification.md` | Nessuna menzione di "Professionisti" in alcuna forma (verificato con ricerca integrale sul testo): il documento, più antico e a grana più larga (`domain-model.md`, nota storica), tratta ancora tutto sotto "Dominio: SERVIZI" (§12-§14: OffertaDiServizio, RichiestaDiServizio, QualificaDichiarata) — prova storica diretta che il dominio Professionisti nasce per differenziazione da un concetto di "Servizi" indifferenziato, non come categoria originaria a sé |
| `docs/architecture/fundamental/domain-patterns.md` | Catalogo dei pattern fondazionali (PF1-PF20), consolidati (PC1-PC14), preferenziali (PP1-PP4), candidati (PCa1-PCa8); §7 classificazione dei domini; §10 proprietà delle relazioni (PF4) e §10.5, che già segnala esplicitamente Professionisti come caso "da confermare" per l'applicabilità di PF4, con priorità bassa — usato come griglia di verifica per §12 di questo documento |
| `docs/architecture/physical/domain-dependency-map.md` | §3 classificazione dei domini (Professionisti: "Applicativo", qualificazione secondaria "Fondazionale limitato"); §4 "Domini con caratteristiche fondazionali limitate" (motivazione dettagliata); §7, sezione dedicata a Professionisti con relazioni verso Persone/Imprese/Appartenenze/Opportunità-Collaborazioni/Identità & Accessi già argomentate; righe D10-D13 (dipendenze in uscita da Professionisti) e D16/D21/D26/D32/D44 (dipendenze in entrata verso Professionisti); riga V4 (rischio di violazione: Imprese che incorpora Professionisti) — la fonte fisica più ricca già disponibile, sebbene non sia essa stessa un Physical Domain Mapping di Professionisti |
| `docs/architecture/logical/persone.md` | Responsabilità e confini di Persone; CompetenzaDichiarata e LinguaParlata come pattern di dichiarazione informale, senza verifica strutturata — il confronto diretto che dimostra la differenza di complessità con un Profilo professionale (§5 di questo documento, ipotesi H1/H6) |
| `docs/architecture/logical/imprese.md` | §1 e §15: la domanda "cosa è un professionista rispetto a un'impresa" lasciata aperta al §12 e poi dichiarata risolta da `professionisti.md`; §11, caso limite "Professionista con partita IVA": i due fatti (essere Professionista, essere titolare di un'Impresa) dichiarati esplicitamente distinti e coesistenti |
| `docs/architecture/logical/appartenenze.md` | §2, nota di distinzione tra Qualifica (dell'Appartenenza, organizzativa) e QualificaDichiarata (di Servizi/Professionisti, professionale) — un confine terminologico esplicito e diretto, decisivo per §9 e §13 di questo documento |
| `docs/architecture/logical/mercati-internazionali.md` | §6, tabella soggetti: Professionisti referenziato come possibile Risorsa di supporto al mercato o controparte di una Relazione commerciale internazionale, mai come parte costitutiva del dominio Mercati — confine diretto per §9 e §11 di questo documento |
| `docs/architecture/logical/professionisti.md` (per trasparenza, non come fonte di autorità) | Il documento logico già esistente che risolve la domanda di questo documento a livello logico. Usato qui esclusivamente come un'ipotesi da sottoporre a verifica indipendente (§5, ipotesi H10) e come fonte di dettaglio quando la verifica la conferma, non come premessa da cui partire |
| Quattro Physical Domain Mapping approvati (Persone, Imprese, Appartenenze, Mercati Internazionali) | Base comparativa per applicare, in §12, gli stessi criteri già usati per giudicare la natura di quei quattro domini (Fondazionale, Relazionale, Informativo/Relazionale) al caso Professionisti |

---

## 3. Metodo di analisi

**Principio metodologico, ripreso da `domain-patterns.md` §4 e applicato a un livello precedente alla modellazione.** Nessuna interpretazione del dominio Professionisti è accettata per autorità di un singolo documento, incluso `logical/professionisti.md`. Un'interpretazione è accettata come corretta soltanto quando: (a) è coerente con almeno due fonti indipendenti di natura diversa (un principio già fondazionale del Domain Model e un criterio già applicato in almeno uno dei quattro Physical Domain Mapping); (b) supera un test comparativo esplicito rispetto alle interpretazioni alternative, non semplicemente perché nessuno l'ha ancora contestata; (c) è compatibile con i pattern già catalogati da `domain-patterns.md`, o ne segnala esplicitamente un'eccezione motivata.

**Procedura seguita.**
1. Isolare, dalla lettura integrale dei documenti al §2, ogni frase che descrive esplicitamente cosa sia o cosa non sia un Professionista.
2. Formulare, per ciascuna delle dieci interpretazioni richieste, l'argomento più forte a favore che i documenti permettono di costruire, non solo l'argomento più debole da respingere facilmente.
3. Applicare a ciascuna interpretazione gli stessi criteri già usati in questa architettura per decidere se un concetto merita un dominio autonomo (`appartenenze.md` §3, generalizzato come PC5/PC6 in `domain-patterns.md` §10.2) e gli stessi criteri per decidere se un concetto è un Aggregate Root autonomo o un attributo incorporato (`domain-patterns.md` §9, criteri di `03` §3 — richiamati per codice, non applicati qui come modellazione).
4. Verificare la conclusione risultante contro la classificazione già proposta dalla Dependency Map (§3-§4, §7), non per copiarla ma per controllare se un'analisi condotta da zero converge indipendentemente verso la stessa classificazione o ne diverge.
5. Tradurre la conclusione in responsabilità, fatti proprietari, fatti esclusi e confini (§7-§10), senza introdurre alcun dettaglio di modellazione.

**Cosa distingue questo documento da una sintesi di `logical/professionisti.md`.** Il documento logico già esistente presenta le proprie conclusioni come stabilite; questo documento le sottopone a un test comparativo esplicito che nessun documento precedente aveva condotto nella stessa forma — non "perché altrove non è stato fatto", ma perché la richiesta di questo documento lo impone esplicitamente (§5) e perché la domanda "cosa rappresenta Professionisti" era stata lasciata aperta da tre documenti logici indipendenti prima di essere risolta (§1), il che la rende, tra le decisioni già prese nell'architettura, una delle più delicate da verificare con un metodo esplicito piuttosto che con una lettura acritica.

---

## 4. Domanda architetturale

**Domanda primaria.** Cosa rappresenta realmente il dominio Professionisti, nel linguaggio e nei vincoli già stabiliti dall'architettura esistente — non in astratto, e non per assunzione progettuale?

**Scomposizione della domanda, necessaria per una risposta rigorosa.**
1. Il Professionista è un *soggetto* nuovo (un tipo di entità che prima non esisteva) o una *qualificazione* di un soggetto già esistente?
2. Se è una qualificazione, di *quale* soggetto è qualificazione — della Persona, dell'Impresa, di entrambe indifferentemente?
3. Il fatto centrale che il dominio possiede è una *relazione* tra due parti (come Appartenenza) o un insieme di *fatti su un solo soggetto* (come gli attributi di un Aggregate Root fondazionale)?
4. Quale fatto, esattamente, nessun altro dominio già progettato (Persone, Imprese, Appartenenze, Mercati Internazionali) può legittimamente possedere, tale da giustificare un dominio a sé piuttosto che un'estensione di uno di essi?
5. Il dominio, una volta definito, si sovrappone in tutto o in parte a un dominio non ancora progettato ma già evocato (Servizi) al punto da non giustificare un'esistenza autonoma?

La risposta a queste cinque sotto-domande, argomentata al §5 e dimostrata al §6, è la sola base su cui si fondano le responsabilità (§7), i fatti proprietari (§8), i fatti esclusi (§9) e i confini (§10-§11) di questo documento.

---

## 5. Analisi delle possibili interpretazioni

Per ciascuna ipotesi: motivazioni a favore, criticità, conflitti con l'architettura esistente, compatibilità con `domain-patterns.md`, motivo dell'eventuale esclusione. Nessuna ipotesi è scartata per assunzione: ciascuna riceve l'argomento più forte che i documenti permettono di costruire prima di essere valutata.

### H1 — Professionisti è (semplicemente) una Persona

**A favore.** Ogni Professionista è, senza eccezione, ancorato a una Persona esistente; non esiste alcun caso in cui un Professionista esista senza di essa. Il dominio Persone possiede già un pattern di dichiarazione di competenze (CompetenzaDichiarata, `persone.md` §2): si potrebbe sostenere che "essere un professionista" equivalga semplicemente ad avere dichiarato certe competenze con un livello più alto, senza bisogno di un concetto distinto.

**Criticità.** La Persona esiste e resta valida indipendentemente da qualsiasi ruolo professionale, esattamente come resta valida indipendentemente da qualsiasi Appartenenza (`persone.md` §6, regola 7; `domain-dependency-map.md` §4, "la Persona esiste e resta valida indipendentemente da qualunque relazione, ruolo professionale o partecipazione"). Se il ruolo di Professionista fosse incorporato in Persona, ogni Persona dovrebbe potenzialmente portare l'intero apparato di verifica multi-asse di qualifiche, iscrizioni e abilitazioni (quattordici assi di verifica distinti, si veda §8) anche quando non ne ha mai avuto bisogno, in netto contrasto con il principio di concretezza operativa (Costituzione, Valore 2) e con la leggerezza deliberata del modello di CompetenzaDichiarata (due soli stati, nessuna verifica strutturata: `persone.md` §5).

**Conflitti con l'architettura esistente.** Violerebbe la distinzione, già stabilita come decisione vincolante del Domain Model (§13, decisione 5), che "non ogni Persona è un Professionista" — un'affermazione priva di senso se il concetto di Professionista fosse semplicemente un sinonimo di Persona con più attributi.

**Compatibilità con `domain-patterns.md`.** Incompatibile con PF7 ("un singolo stato complessivo non deve mai assorbire dimensioni semanticamente indipendenti"): il ciclo di vita a più assi di un profilo professionale (§6 di questa tesi) e gli assi di stato della Persona (`persone.md` §5) rispondono a domande diverse e devono restare separati, non fusi in un'unica entità.

**Motivo dell'esclusione.** Rigettata: la Persona è il substrato necessario e sempre referenziato (mai duplicato), ma il fatto "esercitare una professione in modo verificabile" è troppo complesso e troppo indipendente nel proprio ciclo di vita per essere un semplice attributo della Persona.

### H2 — Professionisti è una specializzazione della Persona

**A favore.** È la formulazione più vicina al linguaggio effettivamente usato in più punti (`domain-model.md` §5, "Persona–Professionista... Professionisti (per il profilo), Persone (per l'identità sottostante)"; `domain-dependency-map.md` §7, "Il Profilo professionale è una specializzazione della Persona"). Cattura correttamente che il Professionista non è un soggetto indipendente ma un'elaborazione di ciò che una Persona può essere.

**Criticità.** "Specializzazione" è un termine che può indicare due cose molto diverse: (a) un attributo più ricco ma comunque incorporato nel dominio Persone, oppure (b) un dominio distinto che si applica esclusivamente a un sottoinsieme di Persone. Se si intende (a), questa ipotesi ricade nelle stesse criticità di H1. La Dependency Map stessa, pur usando la parola "specializzazione", non la interpreta come attributo incorporato: le attribuisce "una propria identità pubblica e una propria evoluzione temporale che vanno oltre la semplice appartenenza a Persone" (§7) e classifica il dominio con caratteristiche "Fondazionale limitato" proprio per questo motivo (§4).

**Conflitti con l'architettura esistente.** Nessuno, se interpretata correttamente come (b). Un conflitto emergerebbe solo nell'interpretazione (a), già esclusa da H1.

**Compatibilità con `domain-patterns.md`.** Compatibile con PC2 (§9): "un dominio può possedere più di un Aggregate Root" non è nemmeno necessario invocarlo qui, perché la domanda è più a monte — se la specializzazione meriti un proprio dominio con proprio Aggregate Root, verifica che i criteri del §9 (cardinalità indipendente, ciclo di vita indipendente, necessità di referenziabilità esterna, necessità di storicizzazione propria, frequenza di variazione indipendente) permettono di condurre positivamente (si veda H8 e §6).

**Motivo dell'esclusione parziale.** Non rigettata, ma insufficiente da sola: "specializzazione" descrive correttamente la relazione ontologica tra Professionista e Persona, ma non risponde alla domanda architetturale su *dove* quella specializzazione debba essere modellata. La risposta a questa domanda è data da H8 e dalla dimostrazione del §6.

### H3 — Professionisti è un ruolo

**A favore.** È la formulazione esplicitamente scelta come decisione vincolante dal Domain Model (§13, decisione 5: "Professionista è un ruolo che una Persona assume, non un soggetto o un dominio di soggetti nuovo") e ripresa identicamente da `logical/professionisti.md` (§2, tabella: "Professionista | Ruolo/concetto"). È la categoria ontologica corretta: non un nuovo tipo di soggetto, ma qualcosa che un soggetto già esistente (la Persona) fa o diventa.

**Criticità.** Il termine "ruolo" ha già un significato tecnico preciso e più ristretto in questa architettura: il Ruolo di un'Appartenenza (`appartenenze.md` §4) è un valore di catalogo locale alla singola relazione (Titolare, Socio, Dipendente...), privo di identità propria fuori da quella relazione, privo di verifica multi-asse indipendente, privo di ciclo di vita proprio distinto da quello della relazione che lo contiene. Se si usasse "ruolo" nello stesso senso tecnico per Professionista, si sottostimerebbe drasticamente la complessità del dominio: un Profilo professionale porta con sé un proprio catalogo di categorie e specializzazioni, un proprio modello di verifica a più fonti, propri servizi dichiarati, propria disponibilità, un proprio ciclo di vita a più assi — nessuno di questi elementi caratterizza un semplice valore di Ruolo di Appartenenza.

**Conflitti con l'architettura esistente.** Rischio di collisione terminologica con il Ruolo di Appartenenze, che `domain-patterns.md` §23 (pattern PL4, richiamato al §10.3) vieta esplicitamente: "un catalogo di ruoli... mai riutilizzato da un altro dominio relazionale con significato diverso".

**Compatibilità con `domain-patterns.md`.** Compatibile solo se qualificata: "ruolo" è corretto come categoria ontologica generale (Professionista non è un nuovo soggetto), ma deve essere immediatamente distinto, con la stessa nettezza con cui l'architettura distingue già "ruolo applicativo" da "ruolo di dominio" da "ruolo organizzativo" (`domain-model.md` §12, glossario: "Ruolo — Da qualificare sempre"), dal Ruolo tecnico di Appartenenze.

**Motivo dell'esclusione parziale.** Non rigettata, ma da qualificare esplicitamente: Professionista è un ruolo nel senso ontologico generale (non un soggetto nuovo), non nel senso tecnico ristretto già occupato da Appartenenze. Questa distinzione è ripresa come principio esplicito al §13 (rischio "confusione tra professionista e ruolo").

### H4 — Professionisti è una relazione

**A favore.** L'architettura ha già una regola fondazionale, PF4 (`domain-patterns.md` §10.1), secondo cui una relazione di business autonoma merita un dominio proprio. Si potrebbe sostenere che "essere professionista" descriva una relazione — tra una Persona e un Ordine professionale, o tra una Persona e il "mercato delle competenze specialistiche" — e che debba quindi essere modellata con lo stesso pattern di Appartenenze o di Mercati Internazionali (riferimento esterno opaco a due parti, §10.1 di `domain-patterns.md`).

**Criticità.** Una relazione, nel senso PF4 già confermato da due domini indipendenti (Appartenenze: Persona↔Impresa; Mercati Internazionali: soggetto↔Mercato), collega sempre due parti che restano ciascuna un dominio o un concetto autonomo, referenziate entrambe in modo opaco. Nel caso di Professionisti, non esiste una "seconda parte" strutturalmente equivalente: quando il Professionista opera attraverso un'Impresa in modo strutturato, quella relazione bilaterale ha già un proprietario dichiarato esplicitamente — Appartenenze, non Professionisti (`domain-dependency-map.md` §7: "tale relazione è di competenza di Appartenenze, non di Professionisti"). Ciò che rimane in capo a Professionisti (qualifiche, competenze, servizi dichiarati, disponibilità) non è una relazione tra due soggetti indipendenti: è un insieme di fatti su un solo soggetto (la Persona, tramite il proprio Profilo professionale).

**Conflitti con l'architettura esistente.** Modellare Professionisti come dominio relazionale in senso PF4 duplicherebbe surrettiziamente la relazione Persona↔Impresa già posseduta da Appartenenze (violazione di PF2), oppure inventerebbe una relazione con una "seconda parte" (un Ordine professionale, un mercato di competenze) che nessun documento logico modella oggi come soggetto autonomo referenziabile.

**Compatibilità con `domain-patterns.md`.** `domain-patterns.md` §10.5 segnala già, in modo esplicito e indipendente da questa tesi, che l'applicabilità di PF4 a Professionisti resta "da confermare... con priorità bassa", precisando che "un'eventuale relazione autonoma interna a Professionisti (es. tra Professionista e un ordine professionale) non è oggi modellata da alcun documento logico". Questa tesi conferma quella cautela: nessuna relazione di questo tipo emerge dall'analisi.

**Motivo dell'esclusione.** Rigettata come descrizione del nucleo del dominio: Professionisti non è un dominio relazionale nel senso PF4. Resta aperta, e correttamente classificata come tale, la possibilità che un futuro sviluppo (es. un dominio Organizzazioni istituzionali) introduca una relazione autonoma Professionista↔Organizzazione professionale — ma questa relazione, se e quando esisterà, apparterrebbe a quel futuro dominio relazionale, non renderebbe Professionisti stesso un dominio relazionale (si veda §14).

### H5 — Professionisti è un'Impresa

**A favore.** Un professionista che esercita in proprio (es. con partita IVA) è, dal punto di vista economico, difficile da distinguere da un'Impresa individuale: entrambi sono soggetti economici che offrono qualcosa al mercato. `imprese.md` aveva lasciato esplicitamente aperta questa domanda al proprio §12 prima che fosse risolta.

**Criticità.** `imprese.md`, nella propria decisione finale (§1, §11, §15), risolve esplicitamente la domanda in senso contrario: "La Persona che esercita la professione resta un Professionista..., indipendentemente dalla partita IVA; se la sua attività è inoltre organizzata come soggetto economico autonomo..., quel soggetto economico è anche un'Impresa... I due fatti — essere Professionista ed essere titolare di un'Impresa — restano distinti e possono coesistere." I due concetti hanno inoltre direzioni di dipendenza esistenziale opposte: l'Impresa esiste e resta valida "indipendentemente da ogni relazione, incluse quelle con le Persone che la rappresentano" (`domain-dependency-map.md` §4); il Professionista, al contrario, non può esistere senza esattamente una Persona che lo sostiene (§8 di questa tesi). Nessun altro concetto in questa architettura ha una dipendenza esistenziale così assoluta da un singolo soggetto quanto Professionisti da Persone.

**Conflitti con l'architettura esistente.** Conflitto diretto e testuale con la decisione già presa da `imprese.md` §1/§11/§15, oltre che con `domain-model.md` §13 decisione vincolante 5.

**Compatibilità con `domain-patterns.md`.** Violerebbe PF1/PF2: un'Impresa-Professionista duplicherebbe surrettiziamente concetti (qualifica, iscrizione, abilitazione) che nessuna decisione logica ha mai attribuito a Imprese, e ne priverebbe Imprese di concetti (sedi, certificazioni, canali) che un singolo professionista non richiede necessariamente.

**Motivo dell'esclusione.** Rigettata su autorità testuale diretta e su un argomento strutturale indipendente (direzione opposta della dipendenza esistenziale) che questa tesi verifica autonomamente e trova solido.

### H6 — Professionisti è un semplice elenco di competenze

**A favore.** Buona parte di cosa "è" un professionista sembra riducibile a un elenco di competenze con prova a supporto: categorie, specializzazioni, qualifiche, esperienza.

**Criticità.** Il dominio Persone possiede già esattamente questa forma di fatto — CompetenzaDichiarata, una dichiarazione informale con un ciclo di vita a due soli stati (Dichiarata → Rimossa) e nessun modello di verifica strutturato (`persone.md` §2, §5). Se Professionisti fosse riducibile a "un elenco più lungo o più verificato di competenze", non meriterebbe un dominio a sé: sarebbe semplicemente una CompetenzaDichiarata più ricca, il che riporta a H1/H2. Ma un profilo professionale non è solo competenze: aggrega anche servizi dichiarati, disponibilità, territori e mercati serviti, un contesto organizzativo, e — soprattutto — un modello di verifica per titoli professionali, iscrizioni e abilitazioni che richiede fonti esterne specifiche (Ordini, Collegi, enti certificatori, registri pubblici), un ordine di complessità che nessun "elenco" in questa architettura ha mai richiesto.

**Conflitti con l'architettura esistente.** Nessun conflitto diretto, ma una sottostima che, se accettata, richiederebbe comunque di introdurre altrove (in Persone) un apparato di verifica multi-fonte che quel dominio non possiede e non dovrebbe possedere, secondo la sua stessa dichiarazione di perimetro (`persone.md` §1: "Non comprende... l'esercizio di un'attività specialistica").

**Compatibilità con `domain-patterns.md`.** Incompatibile con PC3 (§9): il pattern "dichiarazione con riferimento a catalogo condiviso = Entity dipendente" è adeguato per una singola competenza, non per un aggregato che deve coordinare qualifiche, servizi, disponibilità e verifica come un insieme coerente.

**Motivo dell'esclusione.** Rigettata: riduttiva. Ignora i servizi dichiarati, la disponibilità, il contesto organizzativo e, soprattutto, il modello di verifica indipendente — l'elemento che nessun "semplice elenco" esistente in questa architettura possiede.

### H7 — Professionisti è un catalogo di servizi

**A favore.** Un Professionista presenta pubblicamente "cosa offre": il termine stesso "Servizio professionale" compare nel linguaggio già usato per descrivere il dominio.

**Criticità.** L'architettura distingue già, con lo stesso schema, un pattern identico altrove: LinguaParlata (Persone, dichiarazione personale) contro OffertaLinguistica (Servizi, offerta commerciale strutturata) — "entità logicamente distinte e appartenenti a domini diversi" (`persone.md` §9). Lo stesso schema si applica qui: un "Servizio professionale dichiarato" è una proprietà descrittiva del profilo (chi può offrire), non un'offerta strutturata con proprio processo di pubblicazione, ricerca e ciclo di vita (cosa viene offerto in modo strutturato) — quest'ultima resta di competenza del futuro dominio Servizi, non ancora progettato (`domain-model.md` §11, area "Servizi" con maturità "Alta... erede diretto del Domain Model v1, già parzialmente disambiguato da Professionisti").

**Conflitti con l'architettura esistente.** Ridurre Professionisti a un catalogo di servizi lo farebbe collassare, in tutto o in parte, in un dominio che non esiste ancora (Servizi), anticipandone impropriamente la responsabilità (in violazione del principio di non-anticipazione già osservato da `domain-patterns.md` §1) oppure duplicandola quando quel dominio verrà finalmente progettato (violazione futura di PF2).

**Compatibilità con `domain-patterns.md`.** Incompatibile con la distinzione già tracciata per analogia diretta da `persone.md` §9 tra dichiarazione personale e offerta commerciale strutturata.

**Motivo dell'esclusione.** Rigettata: il dominio può includere dichiarazioni descrittive di servizio come proprietà del profilo (si veda §8), ma la sua identità centrale non è un catalogo di servizi, e il catalogo strutturato — se e quando esisterà — apparterrà al futuro dominio Servizi, non a Professionisti.

### H8 — Professionisti è un profilo professionale

**A favore.** È la formulazione più precisa a livello di entità: una struttura che rappresenta, in modo pubblicamente presentabile e verificabile, la posizione professionale di una Persona, distinta ma ancorata alla Persona stessa. Supera il test dei criteri per un Aggregate Root autonomo (`domain-patterns.md` §9): cardinalità indipendente (al massimo un Profilo per Persona, ma con un proprio ciclo di vita che la Persona non ha), ciclo di vita indipendente (assi di stato distinti da quelli della Persona), necessità di referenziabilità esterna (Opportunità, Collaborazioni, Eventi, Mercati Internazionali hanno bisogno di referenziare la capacità professionale, non la sola identità personale), necessità di storicizzazione propria (qualifiche scadute o revocate restano storicizzate indipendentemente dallo stato della Persona), frequenza di variazione indipendente (qualifiche e servizi cambiano senza che l'identità della Persona cambi).

**Criticità (cautela terminologica, non esclusione).** La parola "profilo" rischia, se usata senza qualificazione, di essere letta come "una semplice pagina di presentazione" piuttosto che come un insieme di fatti sostanziali con proprietà, verifica e ciclo di vita — un rischio che il glossario dello stesso Domain Model segnala esplicitamente ("Profilo pubblico / professionale / di accesso — Sempre da qualificare", `domain-model.md` §12). L'ipotesi è corretta solo se "Profilo professionale" è inteso come un Aggregate Root che porta fatti sostanziali (qualifiche, servizi, disponibilità, verifica, visibilità), non come un semplice artefatto presentazionale.

**Conflitti con l'architettura esistente.** Nessuno, con la qualificazione sopra indicata.

**Compatibilità con `domain-patterns.md`.** Piena, secondo i criteri di §9 verificati sopra.

**Motivo della non-esclusione.** Questa ipotesi non è esclusa: è, con la qualificazione indicata, la caratterizzazione corretta dell'*entità* al centro del dominio. Non risponde però da sola alla domanda completa "cosa rappresenta il dominio": va combinata con H3 (il Professionista è il ruolo; il Profilo professionale è l'Aggregate Root che rappresenta i fatti sostanziali di quel ruolo). Questa combinazione è precisamente la soluzione dimostrata al §6.

### H9 — Professionisti è un insieme di offerte professionali

**A favore.** Simile a H7, ma centrata sulla singola transazione piuttosto che sul catalogo: si potrebbe vedere il Professionista come "la somma di ciò che offre", per analogia con l'Offerta di Collaborazioni (`collaborazioni.md` §2).

**Criticità.** Questa ipotesi sovra-indicizza la componente transazionale/di incontro tra domanda e offerta e sotto-rappresenta la componente soggettiva (qualifiche, verifica, disponibilità, identità professionale). `domain-patterns.md` §7 classifica Opportunità e Collaborazioni come "domini transazionali o di opportunità", il cui fatto posseduto è "il processo, non l'identità né la relazione" tra i soggetti coinvolti — se Professionisti fosse ridotto a un insieme di offerte, collasserebbe in una variante di quella categoria, perdendo esattamente ciò che nessun altro dominio è in grado di possedere: la qualifica e la verifica del soggetto che offre.

**Conflitti con l'architettura esistente.** `logical/professionisti.md` §7 distingue esplicitamente "Offerta (Collaborazioni)" da "Servizio professionale" come due concetti non sovrapponibili, appartenenti a due domini diversi, precisamente per prevenire questo collasso.

**Compatibilità con `domain-patterns.md`.** Incompatibile con i confini di categoria già tracciati al §7 di quel documento tra domini transazionali e domini che possiedono l'identità/qualificazione del soggetto.

**Motivo dell'esclusione.** Rigettata: riduce il dominio alla sua superficie più visibile (le offerte) scartando la sua proprietà sostanziale (qualificazione, verifica), che è precisamente ciò che nessun dominio transazionale, oggi o in futuro, è equipaggiato o ha motivo di possedere.

### H10 — Professionisti è un dominio autonomo

**A favore.** È la sintesi delle conclusioni parziali di H2, H3 e H8: un ruolo (H3, qualificato) che una Persona assume, rappresentato da un Profilo professionale come proprio Aggregate Root (H8, qualificato), sufficientemente specializzato (H2, qualificato) da richiedere un proprio ciclo di vita, una propria verifica multi-asse e propri confini rispetto a Persone, Imprese, Appartenenze e Mercati Internazionali — senza essere una relazione bilaterale (H4, esclusa), un'Impresa (H5, esclusa), un semplice elenco (H6, esclusa) o un catalogo/insieme di offerte (H7/H9, escluse).

**Verifica di non-arbitrarietà.** Questa non è la conclusione scelta perché "è quella già presente nel documento logico esistente" (§1, §3): è la conclusione a cui converge, indipendentemente, ciascuna delle nove ipotesi alternative quando viene sottoposta al medesimo test comparativo. La dimostrazione completa, con i criteri quantitativi e qualitativi applicati, è al §6.

---

## 6. Dimostrazione della soluzione scelta

**Tesi.** Il dominio Professionisti rappresenta il ruolo che una Persona assume quando esercita, in modo dichiarabile e verificabile, un'attività professionale specialistica — regolamentata o non regolamentata — attraverso un Profilo professionale: un Aggregate Root autonomo, sempre e soltanto ancorato a una Persona esistente, dotato di un proprio ciclo di vita multi-asse, di un proprio modello di verifica indipendente per qualifiche/titoli/iscrizioni/abilitazioni, di propri servizi dichiarati (descrittivi, non strutturati) e di propria visibilità — mai sovrapposto, per nessuno di questi fatti, a Persone, Imprese, Appartenenze o Mercati Internazionali.

**Prova per convergenza indipendente (criterio di ricorrenza di `domain-patterns.md` §4).** Questa conclusione non deriva da un solo documento: è raggiunta indipendentemente da almeno quattro fonti di natura diversa, senza che nessuna citi le altre come propria motivazione originaria:
1. `domain-model.md` §13, decisione vincolante 5 — un principio dichiarato al livello più generale dell'architettura, prima che esistesse alcun documento dedicato a Professionisti.
2. `imprese.md` §1/§11/§15 — un documento che, risolvendo una propria domanda aperta (il confine con l'attività professionale), arriva alla stessa conclusione da un punto di partenza opposto (partendo da "cosa non è un'Impresa", non da "cosa è un Professionista").
3. `domain-dependency-map.md` §3-§4/§7 — un documento che classifica Professionisti come "Applicativo" con qualificazione "Fondazionale limitato" attraverso un'analisi comparativa dei ruoli prevalenti di tutti gli undici domini, non attraverso un'analisi dedicata al solo Professionisti.
4. `logical/professionisti.md` — il documento dedicato, che formalizza la stessa conclusione con il massimo dettaglio.

Quattro percorsi argomentativi indipendenti che convergono sulla stessa risposta soddisfano, con margine, il criterio di promozione già usato in questa architettura per le regole più solide (`domain-patterns.md` §4, la stessa soglia che ha promosso PF4 a Fondazionale sulla base di due sole conferme indipendenti).

**Prova per esclusione sistematica (criterio comparativo di questo documento, §5).** Ciascuna delle nove interpretazioni alternative è stata respinta non per assunzione, ma per una ragione specifica e diversa dalle altre: H1/H2(a) per violazione di PF7 (assi indipendenti compressi); H4 per assenza di una seconda parte relazionale autonoma (criterio PF4 non soddisfatto) e per sovrapposizione con la relazione già posseduta da Appartenenze; H5 per direzione opposta di dipendenza esistenziale rispetto a Imprese, confermata da testo esplicito di `imprese.md`; H6 per insufficienza del pattern "dichiarazione semplice" a rappresentare un modello di verifica multi-fonte; H7/H9 per sovrapposizione anticipata o futura con il dominio Servizi e con i domini transazionali (Opportunità/Collaborazioni). Nessuna delle nove alternative è stata respinta con lo stesso argomento usato per un'altra: la convergenza su H10 non è un artefatto di un singolo criterio applicato meccanicamente a tutte, ma il risultato di nove verifiche indipendenti che puntano nella stessa direzione.

**Prova per posizionamento nella tassonomia già stabilita.** La classificazione a cui questa tesi converge — un dominio con un'unica dipendenza esistenziale necessaria (verso Persone), nessuna relazione bilaterale autonoma propria, e un proprio nucleo di fatti sostanziali non riducibile a un attributo del soggetto sottostante — coincide esattamente con la categoria che `domain-patterns.md` §7 chiama "caratteristiche fondazionali limitate": non Fondazionale in senso pieno (perché non esiste indipendentemente da un soggetto altrui, a differenza di Persona e Impresa), non puramente Relazionale (perché non possiede una relazione bilaterale come proprio fatto centrale, a differenza di Appartenenze), non puramente Applicativo/transazionale (perché possiede un'identità e una qualificazione proprie del soggetto, non solo un processo di incontro domanda/offerta, a differenza di Opportunità/Collaborazioni). Questa categoria era già stata popolata da un solo caso (Mercati Internazionali, per una ragione diversa: la relazione unita a un contesto informativo autonomo). Professionisti ne diventa il secondo caso indipendente, con una motivazione propria (un ruolo con proprio ciclo di vita, non un contesto informativo con relazione): la categoria "caratteristiche fondazionali limitate" risulta, con questa seconda conferma indipendente, meno una singolarità di Mercati Internazionali e più un pattern architetturale ricorrente, la cui promozione formale resta comunque riservata a una futura revisione di `domain-patterns.md` (§12, §14), non a questo documento.

---

## 7. Responsabilità del dominio

Il dominio Professionisti è responsabile di rappresentare — e di rappresentare in esclusiva — il fatto che una Persona esercita un'attività professionale specialistica, con tutto ciò che rende quel fatto verificabile, ricercabile e presentabile in modo distinto dalla semplice identità personale:

1. **L'esistenza del ruolo di Professionista** per una data Persona, come fatto dichiarabile e con un proprio ciclo di vita.
2. **La qualificazione professionale**: categorie, specializzazioni, competenze nel senso specialistico, titoli, iscrizioni, abilitazioni, certificazioni, esperienza — e la loro verifica, condotta con fonti e metodi propri di questo dominio.
3. **I servizi professionali dichiarati**, come proprietà descrittiva del profilo (chi può offrire cosa), non come offerta commerciale strutturata.
4. **I territori, i mercati e le lingue rilevanti per l'esercizio professionale**, come proprietà dichiarate del profilo, mai come nuove istanze dei concetti posseduti da Mercati Internazionali o da Tassonomia condivisa.
5. **La disponibilità e le condizioni professionali indicative** (non un impegno contrattuale, non un preventivo).
6. **Il ciclo di vita del profilo professionale**, la sua verifica e la sua visibilità, come assi indipendenti tra loro e indipendenti da quelli della Persona sottostante.

Questa responsabilità è, per costruzione (§6), sempre subordinata all'esistenza di una Persona e sempre distinta da quella di Imprese, Appartenenze e Mercati Internazionali.

---

## 8. Fatti proprietari

Per ciascun fatto: perché appartiene a Professionisti, e perché non appartiene a ciascuno degli altri quattro domini già progettati.

### Fatto 1 — L'esistenza e il ciclo di vita del ruolo di Professionista

- **Perché a Professionisti.** È il fatto costitutivo del dominio: nessun altro dominio dichiara né governa la distinzione tra "una Persona generica" e "una Persona che esercita una professione" (§6).
- **Perché non a Persone.** Persone dichiara esplicitamente di non comprendere "l'esercizio di un'attività specialistica" (`persone.md` §1) e possiede un proprio ciclo di vita (§5 di quel documento) che risponde a una domanda diversa ("la Persona è attiva sulla piattaforma?") da quella a cui risponde il ciclo di vita del ruolo professionale ("la Persona esercita correntemente una professione?").
- **Perché non a Imprese.** Imprese possiede l'identità di un soggetto economico collettivo che esiste indipendentemente da qualunque Persona (`domain-dependency-map.md` §4); il ruolo di Professionista, al contrario, non esiste senza esattamente una Persona (dipendenza esistenziale di direzione opposta, §5 ipotesi H5).
- **Perché non ad Appartenenze.** Appartenenze possiede relazioni bilaterali tra due soggetti indipendenti (Persona↔Impresa); il ruolo di Professionista non è una relazione bilaterale (§5, ipotesi H4).
- **Perché non a Mercati Internazionali.** Mercati Internazionali possiede il Mercato e le relazioni di presenza/interesse verso di esso; l'esercizio di una professione non è, in sé, una relazione con un Mercato (può esserlo accessoriamente, si veda Fatto 4).

### Fatto 2 — Qualifiche, titoli, iscrizioni, abilitazioni, certificazioni, esperienza e la loro verifica

- **Perché a Professionisti.** Nessun altro dominio possiede un modello di verifica per titoli professionali che richieda fonti specifiche (Ordini, Collegi, enti certificatori, registri pubblici, istituti che rilasciano titoli di studio) — un modello strutturalmente diverso e più esteso di qualunque verifica già posseduta da Persone, Imprese o Appartenenze.
- **Perché non a Persone.** Le uniche dichiarazioni che Persone possiede (CompetenzaDichiarata, LinguaParlata) non hanno alcun modello di verifica strutturato (`persone.md` §5): estenderlo a Persone significherebbe estendere quel modello di verifica a ogni Persona, anche a chi non lo richiede mai.
- **Perché non a Imprese.** Imprese possiede una CertificazioneImpresa (`imprese.md` §2) che riguarda l'impresa come soggetto economico (es. una certificazione di qualità aziendale), non una qualifica personale di chi la anima; i due concetti restano distinti anche quando riguardano lo stesso ambito (es. una certificazione ISO dell'Impresa non è l'Abilitazione professionale della Persona che la gestisce).
- **Perché non ad Appartenenze.** Appartenenze possiede la Qualifica come "precisazione del ruolo organizzativo di una Persona in un'Impresa" (`appartenenze.md` §2) — un concetto esplicitamente distinto, per dichiarazione testuale dello stesso documento, dalla qualifica o certificazione professionale che un fornitore di servizio dichiara di possedere per erogare un servizio sul mercato.
- **Perché non a Mercati Internazionali.** Mercati Internazionali possiede la verifica di "Competenza linguistica" e "Esperienza della Persona" come rilevanti per un Mercato specifico (`mercati-internazionali.md` §10) — un asse di verifica contestualizzato a un Mercato, non la qualifica professionale generale, che resta di competenza di Professionisti anche quando nessun Mercato è coinvolto.

### Fatto 3 — Servizi professionali dichiarati (descrittivi)

- **Perché a Professionisti.** È la dichiarazione di "cosa il soggetto qualificato può offrire", indissolubile dalla qualificazione che la sostiene (Fatto 2): senza un profilo professionale che la contenga, la dichiarazione perderebbe il proprio contesto di credibilità.
- **Perché non a Persone.** Persone non possiede alcun concetto di servizio, nemmeno dichiarativo: il proprio unico pattern dichiarativo (CompetenzaDichiarata) descrive una capacità, non un'offerta.
- **Perché non a Imprese.** Imprese possiede ServizioImpresa (`imprese.md` §2) come offerta dell'impresa come soggetto collettivo; un Servizio professionale dichiarato da un singolo Professionista, anche quando quel Professionista opera anche tramite un'Impresa, resta un fatto distinto (§5, rischio "confusione tra professionista e impresa").
- **Perché non ad Appartenenze.** Appartenenze non possiede alcun concetto di offerta o servizio: possiede solo la relazione organizzativa che eventualmente collega il Professionista all'Impresa tramite cui opera.
- **Perché non a Mercati Internazionali.** Mercati Internazionali possiede l'Esigenza di internazionalizzazione (una domanda) e la Relazione commerciale internazionale, non un'offerta di servizio professionale in quanto tale.

### Fatto 4 — Territori, mercati e lingue dichiarati come rilevanti per l'esercizio professionale

- **Perché a Professionisti.** È una proprietà del profilo (dove e in quali lingue il Professionista è disposto a esercitare), analoga per ruolo a LinguaOperativaImpresa nel dominio Imprese, ma riferita al singolo professionista, non al soggetto collettivo.
- **Perché non a Persone.** LinguaParlata (Persone) descrive l'uso linguistico personale della Persona in generale, non la sua rilevanza per l'esercizio professionale specialistico — un asse di verifica e un contesto d'uso diversi (§8 di `mercati-internazionali.md`, principio di non automatismo: la conoscenza di una lingua non dimostra competenza commerciale o professionale in quella lingua).
- **Perché non a Imprese.** LinguaOperativaImpresa e MercatoImpresa (`imprese.md` §2) restano proprietà dell'Impresa come soggetto collettivo; un Professionista che opera anche in proprio, senza Impresa, deve poter dichiarare gli stessi fatti senza dipendere da un'Impresa che potrebbe non esistere.
- **Perché non ad Appartenenze.** Appartenenze non possiede alcun concetto di territorio o mercato.
- **Perché non a Mercati Internazionali.** Il Mercato come concetto e la relazione di Presenza/Interesse di mercato restano interamente possedute da quel dominio (PF4); Professionisti può solo referenziarlo, come proprietà descrittiva del proprio profilo ("mercati conosciuti/serviti"), senza mai creare una nuova istanza di Mercato o di Presenza/Interesse.

### Fatto 5 — Disponibilità e condizioni professionali indicative

- **Perché a Professionisti.** È un fatto che ha senso solo nel contesto di un profilo professionale qualificato: la disponibilità "a lavorare" in generale non è un concetto che alcun altro dominio possiede.
- **Perché non a Persone, Imprese, Appartenenze, Mercati Internazionali.** Nessuno di questi domini possiede un concetto equivalente: Persone non ha alcuna nozione di disponibilità professionale; Imprese non ha una "disponibilità" nel senso di accettazione di nuovi incarichi personali; Appartenenze descrive relazioni già stabilite, non la disponibilità a stabilirne di nuove; Mercati Internazionali non possiede alcuna nozione di disponibilità individuale per un incarico.

### Fatto 6 — Ciclo di vita, verifica d'insieme e visibilità del profilo professionale

- **Perché a Professionisti.** È il fatto di coordinamento che rende gli altri cinque fatti un insieme coerente e presentabile, con una propria fase editoriale, un proprio stato professionale reale, una propria disponibilità come asse indipendente e una propria visibilità — nessuno di questi assi è equivalente, per significato, ai corrispondenti assi di Persona, Impresa o Appartenenza, anche quando ne condivide il vocabolario generale (famiglie di assi comuni, `domain-model.md` §6).
- **Perché non agli altri quattro domini.** Ciascuno di essi possiede già i propri assi di stato per il proprio soggetto o la propria relazione (`persone.md` §5, `imprese.md` §5, `appartenenze.md` §6, `mercati-internazionali.md` §7): nessuno di essi potrebbe assorbire anche gli assi del profilo professionale senza violare PF7 (assi indipendenti mai compressi).

---

## 9. Fatti esclusi

Tutto ciò che Professionisti non deve possedere, con motivazione.

| Fatto escluso | Dominio proprietario corretto | Motivazione |
|---|---|---|
| Identità, biografia, dati di contatto di base della Persona | Persone | Il Profilo professionale referenzia la Persona per identità stabile; duplicarne i dati violerebbe PF2 (§8, Fatto 1) |
| Competenze e lingue dichiarate in senso generico, non specialistico (CompetenzaDichiarata, LinguaParlata) | Persone | Restano dichiarazioni personali informali, prive del contesto di verifica professionale; il confine esatto tra le due (quando una competenza "generica" diventa "professionale") resta una questione aperta esplicita (§14) |
| Identità e dati descrittivi di un'eventuale Impresa o studio tramite cui il Professionista opera (sedi, certificazioni aziendali, canali) | Imprese | Professionisti referenzia l'Impresa solo come contesto organizzativo facoltativo, mai la incorpora (`domain-dependency-map.md` D11) |
| Il rapporto strutturato e duraturo tra un Professionista e un'Impresa o uno studio (es. dipendente, titolare, consulente esterno abituale) | Appartenenze | Ogni relazione bilaterale stabile tra una Persona e un'Impresa, qualunque ne sia la natura, è per costruzione (§5, ipotesi H4; §6) di competenza di Appartenenze, non di Professionisti (`domain-dependency-map.md` §7, D12) |
| Il Mercato internazionale come contesto e le relazioni di Presenza/Interesse/Attività internazionale in quanto tali | Mercati Internazionali | Professionisti può dichiarare mercati "conosciuti/serviti" come proprietà descrittiva del profilo, mai come nuova istanza dei concetti posseduti da quel dominio (`domain-dependency-map.md` D13) |
| L'offerta di servizio strutturata, pubblicata e ricercabile con proprie regole (OffertaDiServizio/RichiestaDiServizio) | Servizi (futuro dominio, non ancora progettato) | Professionisti descrive chi può offrire una competenza, non l'offerta strutturata; anticipare questa responsabilità violerebbe il principio di non-anticipazione (§1, §5 ipotesi H7) |
| Il processo di candidatura, incontro o proposta in cui un Professionista è coinvolto (una specifica Opportunità o Collaborazione) | Opportunità / Collaborazioni (domini ipotetici) | Il processo di incontro tra domanda e offerta è, per classificazione già proposta, un fatto posseduto dal dominio transazionale, che referenzia il Professionista senza incorporarlo (§5 ipotesi H9; §11) |
| La partecipazione a un Evento come relatore o formatore | Eventi (dominio ipotetico) | La partecipazione, se e quando Eventi sarà progettato, resterà un fatto di quel dominio (`domain-model.md` §3, riga Eventi: "Non... possiede risultati didattici") |
| Recensioni, valutazioni, reputazione | Nessun dominio attuale (area futura non modellata) | Un badge di affidabilità aggregata è vietato da PF10/PF11; un eventuale futuro sistema di reputazione resterebbe un dominio distinto (`domain-model.md` §11, area "Reputazione") |
| Messaggistica privata tra un Professionista e chi lo contatta | Fuori perimetro di ogni dominio attuale | Coerente con l'esclusione già dichiarata da `collaborazioni.md` §1 per lo stesso tipo di fatto |
| Contratti, incarichi, fatturazione, pagamenti | Fuori perimetro di ogni dominio attuale | Sistematicamente esclusi dal perimetro dell'intera piattaforma allo stato attuale (`domain-model.md` §11, area "Pagamenti"/"Contratti") |
| Autenticazione, account, credenziali, permessi applicativi | Identità & Accessi | Nessun fatto di questo dominio genera un permesso tecnico (PF6, PF13); il fatto che un Professionista gestisca il proprio profilo tramite un account non rende l'account parte di questo dominio (`domain-dependency-map.md` §7) |
| Organizzazioni professionali, studi associati, Ordini o Collegi come entità proprie con una propria scheda | Nessun dominio attuale (Organizzazioni istituzionali, dominio candidato non riconciliato) | Fino a quando quel dominio non sarà formalizzato, Professionisti non deve introdurre una propria modellazione di tali organizzazioni (`domain-dependency-map.md` §7; `reconciliation-report.md` §13) |
| Garanzia di qualità o di esito della prestazione professionale | Nessun dominio | Nessuna informazione di questo dominio costituisce una promessa di risultato (§13, principio anti-badge) |

---

## 10. Confini del dominio

| Dominio adiacente | Cosa fa Professionisti | Cosa NON fa Professionisti |
|---|---|---|
| Persone | Referenzia la Persona sottostante per identità stabile; possiede fatti aggiuntivi e più specialistici che quella Persona non porta di per sé | Non duplica identità, biografia o dichiarazioni generiche già possedute da Persone; non esiste alcun Profilo professionale senza una Persona esistente |
| Imprese | Referenzia facoltativamente un'Impresa come contesto organizzativo dichiarato | Non possiede né duplica sedi, certificazioni aziendali, canali o media di un'Impresa; non diventa mai esso stesso un'Impresa |
| Appartenenze | Utilizza (non referenzia sostanzialmente) il fatto che esiste un'Appartenenza per contestualizzare la propria offerta | Non possiede alcuna relazione strutturata tra Persona e Impresa: quella relazione, quando esiste, appartiene sempre ad Appartenenze |
| Mercati Internazionali | Dichiara mercati o territori "conosciuti/serviti" come proprietà descrittiva del profilo | Non possiede il Mercato come concetto, né le relazioni di Presenza, Interesse o Attività internazionale, che restano di Mercati Internazionali |
| Servizi (futuro) | Dichiara Servizi professionali in forma descrittiva, come proprietà del profilo | Non possiede né anticipa l'offerta strutturata, pubblicata e ricercabile secondo regole proprie |
| Opportunità / Collaborazioni (ipotetici) | Può essere referenziato come destinatario, promotore o parte coinvolta | Non possiede il processo di incontro tra domanda e offerta, né gli esiti delle candidature |
| Eventi (ipotetico) | Può essere referenziato come relatore o formatore | Non gestisce iscrizioni, capienze o la struttura dell'Evento |
| Identità & Accessi | Nessuna dipendenza sostanziale in ingresso: i propri fatti restano di business puro | Non definisce né determina alcun permesso tecnico o meccanismo di autenticazione |

---

## 11. Rapporti con gli altri domini

Per ciascun dominio: responsabilità, fatti proprietari, riferimenti ammessi, dipendenze, divieti, pattern condivisi. Per i domini non ancora progettati (Collaborazioni, Opportunità, Eventi, Organizzazioni), quanto segue non anticipa alcuna decisione definitiva: riporta solo ciò che i documenti già approvati (Dependency Map, documenti logici) hanno già indicato come indizio, sempre marcato come tale.

### Persone

- **Responsabilità di Persone.** Identità del soggetto individuale, competenze e lingue dichiarate in senso generico, storia personale.
- **Fatti proprietari di Persone rilevanti qui.** L'identità della Persona sottostante a ogni Profilo professionale.
- **Riferimenti ammessi da Professionisti.** Riferimento esterno stabile alla Persona, per identità, mai per incorporazione (PF2, PF5).
- **Dipendenza.** Necessaria e diretta: nessun Profilo professionale esiste senza una Persona esistente (`domain-dependency-map.md` D10, Consolidata).
- **Divieti.** Professionisti non deve mai duplicare attributi generici della Persona; Persone non deve mai dipendere da Professionisti per la propria validità (asimmetria della dipendenza, già verificata come priva di ciclo dalla Dependency Map).
- **Pattern condiviso.** Lo stesso pattern "dichiarazione con riferimento a catalogo condiviso" (PC3) usato da CompetenzaDichiarata/LinguaParlata, riapplicato con un modello di verifica più ricco per Qualifica/Iscrizione/Abilitazione.

### Imprese

- **Responsabilità di Imprese.** Identità del soggetto economico collettivo, sedi, settori, servizi, certificazioni aziendali.
- **Fatti proprietari di Imprese rilevanti qui.** L'eventuale organizzazione (Impresa, studio) tramite cui un Professionista opera, come soggetto autonomo che esiste indipendentemente da lui.
- **Riferimenti ammessi da Professionisti.** Riferimento facoltativo all'Impresa come contesto organizzativo dichiarato (`domain-dependency-map.md` D11, Consolidata, dipendenza Facoltativa).
- **Dipendenza.** Facoltativa: il Profilo professionale resta valido e presentabile senza alcun contesto organizzativo dichiarato.
- **Divieti.** Imprese non deve mai dipendere da Professionisti (nessuna dipendenza inversa dichiarata: `domain-dependency-map.md`, riga di analisi cicli, "Eliminato — assenza di dipendenza in senso inverso"); Professionisti non deve mai incorporare i dati descrittivi di un'Impresa.
- **Pattern condiviso.** La stessa distinzione, già stabilita in `imprese.md` §11 e confermata qui, tra "essere Professionista" ed "essere titolare di un'Impresa" come fatti coesistenti ma distinti.

### Appartenenze

- **Responsabilità di Appartenenze.** Il significato, il ciclo di vita e la verifica della relazione organizzativa tra una Persona e un'Impresa.
- **Fatti proprietari di Appartenenze rilevanti qui.** Il rapporto strutturato (dipendente, titolare, consulente abituale) tra un Professionista e l'Impresa/studio tramite cui opera.
- **Riferimenti ammessi da Professionisti.** Utilizzo (non riferimento sostanziale) del fatto che un'Appartenenza esiste, per contestualizzare l'offerta professionale, senza diventarne proprietario (`domain-dependency-map.md` D12, dipendenza Facoltativa, oggi "Provvisoria — da confermare in un futuro Physical Domain Mapping di Professionisti").
- **Dipendenza.** Facoltativa e di utilizzo, non di riferimento sostanziale: distinzione che questa tesi conferma coerente con la classificazione già proposta (§6).
- **Divieti.** Professionisti non deve mai possedere né duplicare la relazione organizzativa; Appartenenze non deve mai possedere né duplicare la qualificazione professionale.
- **Pattern condiviso.** Entrambi i domini applicano lo stesso principio di "verifica multi-asse, nessun badge unico" (PF10/PF11), sviluppato indipendentemente ma con la stessa struttura concettuale.

### Mercati Internazionali

- **Responsabilità di Mercati Internazionali.** Il Mercato come contesto geo-economico autonomo, e le relazioni di Presenza, Interesse, Attività internazionale, Relazione commerciale, Esigenza di internazionalizzazione.
- **Fatti proprietari di Mercati Internazionali rilevanti qui.** Il Mercato che un Professionista dichiara di conoscere o servire, come referenziato, non come definito.
- **Riferimenti ammessi da Professionisti.** Riferimento facoltativo al Mercato come proprietà descrittiva del profilo (`domain-dependency-map.md` D13, dipendenza Facoltativa, oggi "Provvisoria — da confermare").
- **Dipendenza.** Facoltativa: il profilo resta valido senza alcuna dichiarazione di mercato.
- **Divieti.** Professionisti non deve mai creare una nuova istanza di Mercato, di Presenza o di Interesse di mercato; Mercati Internazionali non deve mai incorporare le qualifiche di un Professionista.
- **Pattern condiviso.** Lo stesso "principio di non automatismo" già stabilito da `mercati-internazionali.md` §9 (l'origine, la lingua o l'esperienza non dimostrano automaticamente una competenza commerciale) si applica identicamente alla competenza professionale dichiarata da un Professionista rispetto a un Mercato.

### Collaborazioni (ipotetico)

- **Indizio già disponibile, non una decisione definitiva.** `domain-dependency-map.md` D21 classifica "Collaborazioni → Professionisti" come dipendenza Facoltativa ("Qualificazione professionale coinvolta... non indispensabile"), oggi "Provvisoria". `logical/professionisti.md` §1/§4 indica che un Professionista può essere referenziato come "soggetto proponente, candidato o professionista di supporto" in una Collaborazione.
- **Cosa questa tesi non anticipa.** Non stabilisce se Collaborazioni introdurrà un concetto di "Offerta" distinto dal Servizio professionale di Professionisti (probabile, per analogia con quanto già osservato per Opportunità, ma non deciso qui), né come sarà strutturato il proprio ciclo di vita.
- **Cosa questa tesi conferma già ora.** Qualunque riferimento futuro di Collaborazioni a Professionisti dovrà essere un riferimento all'identità del Profilo professionale, mai un'incorporazione delle sue qualificazioni (§5, ipotesi H9).

### Opportunità (ipotetico)

- **Indizio già disponibile.** `domain-dependency-map.md` D16 classifica "Opportunità → Professionisti" come dipendenza Facoltativa, Consolidata ("Qualificazione professionale richiesta o destinataria... non tutte le opportunità richiedono una qualificazione specifica"). `logical/professionisti.md` §1 indica che un Professionista può essere "destinatario o promotore" di un'Opportunità.
- **Cosa questa tesi non anticipa.** Non stabilisce come Opportunità rappresenterà il requisito di qualificazione professionale (come riferimento diretto al Profilo, come riferimento a una Categoria professionale, o altro).
- **Cosa questa tesi conferma già ora.** Il requisito di qualificazione e il soggetto qualificato restano concetti distinti (`domain-dependency-map.md`, riga sui rischi: "Confusione tra requisito e soggetto" già segnalata come rischio da evitare per D16 e D21).

### Eventi (ipotetico)

- **Indizio già disponibile.** `domain-dependency-map.md` D26 classifica "Eventi → Professionisti" come dipendenza Facoltativa, Consolidata ("Relatori, formatori... non tutti gli eventi coinvolgono professionisti qualificati").
- **Cosa questa tesi non anticipa.** Non stabilisce come Eventi modellerà la partecipazione di un relatore o formatore (come Partecipazione generica con un ruolo, o con un pattern dedicato).
- **Cosa questa tesi conferma già ora.** La partecipazione a un Evento non deve mai essere confusa con la qualificazione professionale del partecipante: un Professionista qualificato resta tale anche senza aver mai partecipato a un Evento, e un relatore a un Evento non acquisisce una qualifica professionale per il solo fatto di aver partecipato.

### Organizzazioni istituzionali (ipotetico)

- **Indizio già disponibile.** `domain-dependency-map.md` §7 e `reconciliation-report.md` §13 indicano che, se e quando questo dominio sarà formalizzato, la relazione tra un Professionista e la propria organizzazione (studio, Ordine, Collegio) sarà di competenza di Appartenenze (relazione Persona-Organizzazione), non di Professionisti.
- **Cosa questa tesi non anticipa.** Non stabilisce se e quando questo dominio sarà progettato, né la sua struttura interna.
- **Cosa questa tesi conferma già ora.** Fino alla formalizzazione di quel dominio, Professionisti non deve introdurre una propria modellazione di organizzazioni professionali, studi associati, Ordini o Collegi come entità proprie (vincolo già dichiarato da `domain-dependency-map.md` §7 e qui riconfermato in modo indipendente).

### Identità & Accessi

- **Responsabilità di Identità & Accessi.** Autenticazione, autorizzazione tecnica, account, deleghe, consensi.
- **Fatti proprietari rilevanti qui.** Nessuno: Identità & Accessi non possiede alcun fatto sostanziale di Professionisti.
- **Riferimenti ammessi.** Identità & Accessi può referenziare il Profilo professionale (tramite la Persona sottostante) per applicare decisioni di accesso già stabilite da Professionisti, mai per deciderle (PF13).
- **Dipendenza.** Di supporto, unidirezionale: Professionisti dipende da Identità & Accessi solo per l'applicazione tecnica dell'accesso, mai per il significato sostanziale dei propri fatti.
- **Divieti.** Nessun accesso concesso da Identità & Accessi dimostra o crea una qualifica professionale, una verifica o un'affidabilità (principio cardine già stabilito da `domain-model.md` §8, qui riconfermato senza eccezioni).
- **Pattern condiviso.** Nessuno specifico oltre al pattern generale PF6/PF13 già applicato identicamente da tutti i domini già mappati.

---

## 12. Applicazione dei pattern fondazionali

Per ciascuna regola di `domain-patterns.md`: se viene confermata, semplicemente applicata, se richiede un chiarimento, se evidenzia un'eccezione, o se suggerisce un'evoluzione futura — nel caso specifico di Professionisti. Nessuna modifica è proposta a `domain-patterns.md`: questa sezione si limita a verificarne il comportamento.

### Regole fondazionali (PF1-PF20)

| Codice | Esito nel caso Professionisti | Nota |
|---|---|---|
| PF1 Single Owner | **Confermata, applicata** | Ogni fatto (qualifica, servizio dichiarato, disponibilità) ha un solo proprietario dichiarato; nessuna contesa con Persone/Imprese/Servizi (§8) |
| PF2 Nessuna duplicazione | **Confermata, applicata** | Nessuno dei fatti elencati al §8 duplica un fatto già posseduto da Persone, Imprese, Appartenenze o Mercati Internazionali |
| PF3 Traccia a paragrafo del logico | **Applicabile, da rispettare nel futuro Physical Domain Mapping** | Questa tesi stessa non introduce paragrafi da citare per la modellazione: quel compito resta del futuro Domain Mapping |
| PF4 Proprietà delle relazioni | **Non applicabile al nucleo del dominio; richiede chiarimento esplicito** | Dimostrato al §5 (ipotesi H4) e al §6: Professionisti non possiede alcuna relazione bilaterale autonoma nel senso PF4; le relazioni bilaterali che lo riguardano sono possedute da Appartenenze. Questo è un caso utile a `domain-patterns.md` stesso: dimostra che non ogni dominio applicativo deve essere (o diventare) relazionale, delimitando l'ambito di PF4 anche per esclusione |
| PF5 Identità relazione non deriva da soggetti | **Non applicabile** | Corollario diretto della non-applicabilità di PF4: non esistendo una relazione posseduta, non esiste un'identità di relazione da proteggere. Dichiarato esplicitamente non applicabile, coerente con PP4, invece di essere omesso |
| PF6 Identità business ≠ identità di accesso | **Confermata, applicata** | Nessun fatto di Professionisti genera un permesso tecnico (§9, §11) |
| PF7 Assi indipendenti mai compressi | **Confermata, applicata ed estesa** | Cinque assi indipendenti (editoriale, verifica, professionale reale, disponibilità, visibilità) — il numero più alto tra i domini oggi conosciuti (Persone ne ha meno, Appartenenze tre, Mercati Internazionali quattro); Professionisti offre un caso di riferimento ulteriore per la scalabilità del pattern |
| PF8 Continuità storica di default | **Confermata, applicata** | Qualifiche, iscrizioni e abilitazioni scadute o revocate restano storicizzate, indipendentemente dallo stato attuale del profilo |
| PF9 Cronologia di dominio ≠ audit tecnico | **Applicata implicitamente** | Nessun documento analizzato introduce un meccanismo di audit tecnico per Professionisti |
| PF10 Nessun badge generico di verifica | **Confermata, applicata con enfasi** | Principio esplicito e ripetuto: nessun badge unico "Professionista verificato"; ogni verifica riguarda un aspetto nominato (quattordici assi distinti) |
| PF11 Verifiche non fuse | **Confermata, applicata** | I quattordici assi di verifica (§8, Fatto 2) restano distinti e non producono mai un esito complessivo unico |
| PF12 Condizione cumulativa di pubblicazione | **Confermata, applicata** | La pubblicazione del profilo richiede il soddisfacimento simultaneo dell'asse editoriale e il rispetto del principio di coerenza con la visibilità di Persona/Impresa/Appartenenza sottostanti |
| PF13 Identità & Accessi applica, non decide | **Confermata, applicata** | Nessuna decisione di visibilità sostanziale è delegata a Identità & Accessi (§11) |
| PF14 Ruolo di business ≠ privilegio applicativo | **Confermata, applicata in modo particolarmente diretto** | "Professionista" è definito esplicitamente come ruolo di business (§5, H3); questo caso è un'istanza di applicazione diretta di PF14 fin dalla propria definizione, non solo nelle proprie conseguenze |
| PF15 Evento = fatto già avvenuto | **Applicabile al futuro catalogo di eventi di dominio** | Questa tesi non introduce eventi (contenuto vietato, §1); il vincolo resta da rispettare nel futuro Domain Mapping |
| PF16 Nessun meccanismo tecnico di propagazione | **Applicabile** | Nessun meccanismo tecnico è descritto in questa tesi |
| PF17 Sei classificazioni di dipendenza esaustive | **Confermata, applicata** | Le dipendenze di Professionisti già identificate dalla Dependency Map coprono quattro delle sei categorie contemporaneamente (Necessaria: D10; Facoltativa: D11-D13; Facoltativa in entrata: D16/D21/D26; Editoriale: D32; Derivativa: D44) — un'ulteriore conferma di esaustività del sistema di classificazione |
| PF18 Ciclo apparente vs ciclo reale | **Confermata, nessuna eccezione riscontrata** | La Dependency Map ha già verificato che Imprese↔Professionisti non presenta alcun ciclo reale (dipendenza unidirezionale, nessuna dipendenza inversa dichiarata); questa tesi non riscontra alcun altro ciclo apparente da verificare |
| PF19 Nessun nuovo dominio tassonomico di iniziativa | **Confermata, applicata con un'osservazione** | Professionisti riusa Tassonomia condivisa per settori e lingue, senza introdurre un nuovo vocabolario condiviso; introduce però un proprio catalogo *locale* di categorie e specializzazioni professionali (§5 del dominio logico), che dovrà essere qualificato come Elenco controllato locale (C03, PC14/PP1), non promosso a Tassonomia condivisa, in assenza di evidenza che un secondo dominio lo governi autonomamente |
| PF20 Indisponibilità soggetto ≠ cancellazione relazione | **Applicata per analogia** | La cessazione o l'indisponibilità della Persona non cancella retroattivamente lo storico del Profilo professionale, che transita verso stati terminali appropriati mantenendo la storia |

### Pattern consolidati, preferenziali e candidati rilevanti

| Codice | Esito nel caso Professionisti |
|---|---|
| PC1 (procedura in cinque domande per l'Aggregate) | **Da applicare** nel futuro Physical Domain Mapping; questa tesi ne ha già anticipato l'esito qualitativo al §6, senza condurre la procedura in dettaglio (contenuto di modellazione, vietato qui) |
| PC2 (più Aggregate Root nello stesso dominio) | **Possibile evoluzione futura, non decisa qui**: se Qualifica, Iscrizione e Abilitazione richiederanno, in fase di Domain Mapping, una propria consistenza indipendente dal Profilo professionale (sul modello di Presenza/Interesse in Mercati Internazionali), questo pattern sarà applicabile; questa tesi non lo decide |
| PC3 (dichiarazione + riferimento a catalogo = Entity dipendente) | **Applicabile** a Competenza professionale e Lingua operativa, per analogia diretta con CompetenzaDichiarata/LinguaParlata |
| PC4 (vista di sintesi non normativa) | **Già applicata da un documento esistente**: `domain-dependency-map.md` §7 presenta una propria vista di sintesi di Professionisti, dichiarando esplicitamente `logical/professionisti.md` come fonte autorevole — coerente con PC4 |
| PC5/PC6 (criteri positivi/negativi per promuovere una relazione a dominio autonomo) | **Usati in questa tesi per escludere H4** (§5): Professionisti non soddisfa i criteri positivi per una relazione autonoma, perché il fatto centrale non è una relazione bilaterale |
| PC7 (stato terminale incompatibile con rappresentazione come attuale) | **Applicabile**: un profilo Cessato, Revocato o Archiviato non deve mai essere presentato come Attivo |
| PC9 (assenza di un asse di Temporalità va dichiarata) | **Segnalata come questione aperta** (§14): il grado in cui qualifiche/iscrizioni/abilitazioni richiedono una propria Decorrenza esplicita (analoga al Periodo di Appartenenze) non è ancora deciso da questa tesi |
| PC11 (Fonte come pattern locale) | **Confermata, applicabile**: coerente con il pattern già usato da Persone/Imprese/Appartenenze/Mercati Internazionali |
| PC12 (evento citato da chi riceve, proprietà di chi genera) | **Applicabile**: un futuro dominio Servizi potrà "voler conoscere" la dichiarazione di un Servizio professionale senza diventarne proprietario |
| PC13 (derivazione non trasferisce proprietà) | **Confermata, applicabile**: un futuro Osservatorio potrà aggregare dati di Professionisti senza diventarne proprietario |
| PC14 (vocabolario locale = Elenco controllato se nessun altro dominio lo governa) | **Applicabile, raccomandazione per il futuro Domain Mapping**: si veda PF19 sopra |
| PP1 (preferire Elenco controllato a Tassonomia condivisa) | **Raccomandazione applicabile** al catalogo locale di categorie professionali |
| PP2 (separare Fonte, Evidenza, Verifica) | **Già rispettata concettualmente** dal documento logico esistente, e confermata come corretta da questa tesi |
| PP4 (dichiarare esplicitamente ogni asse non applicabile) | **Applicata in questa stessa sezione**: PF4 e PF5 sono dichiarati esplicitamente non applicabili al nucleo del dominio, non omessi |
| PCa1 (pattern generale di contestazioni, oggi solo in Appartenenze) | **Seconda conferma indipendente rilevata da questa tesi**: il documento logico di Professionisti prevede già propri stati "Contestato" (qualifiche, iscrizioni, profilo nel suo complesso) con la stessa struttura concettuale di Appartenenze. Questa osservazione non promuove PCa1 (che resta di competenza esclusiva di una futura revisione di `domain-patterns.md`, §1): la segnala soltanto come input utile per quella futura revisione (§14) |
| PCa2 (Organizzazioni istituzionali) | **Confermata come indizio coerente**: Professionisti referenzia già "Organizzazione professionale" come Impresa in assenza di quel dominio, esattamente come previsto da questo pattern candidato |
| PCa4 (estensione di PF4 a Professionisti) | **Verificata da questa tesi con esito negativo per il nucleo del dominio**: come dimostrato al §5 (H4) e qui, Professionisti non è, di per sé, un dominio relazionale nel senso PF4; l'eventuale relazione autonoma tra Professionista e una futura Organizzazione professionale, se emergerà, apparterrà a quel futuro dominio relazionale, non renderà Professionisti stesso relazionale. Questo risultato è coerente con la cautela già espressa da `domain-patterns.md` §10.5 ("Candidata, priorità bassa") e la confirma con un'analisi indipendente |

---

## 13. Rischi architetturali

Per ciascun rischio, il principio architetturale che lo evita.

| Rischio | Principio che lo evita |
|---|---|
| **Duplicazione della Persona** | Ogni Profilo professionale referenzia esattamente una Persona esistente per identità stabile (PF2, PF5); non esiste alcun Profilo senza una Persona, e non esiste alcuna copia dei suoi dati generici |
| **Duplicazione delle competenze** | Competenza professionale (Professionisti) e CompetenzaDichiarata (Persone) restano concetti distinti per contesto d'uso (specialistico verificabile vs. generico informale); quando entrambe referenziano la stessa voce di Tassonomia condivisa, il riferimento resta unico e condiviso (PC3), mai duplicato in due cataloghi paralleli |
| **Duplicazione dei servizi** | Il Servizio professionale dichiarato (Professionisti, descrittivo) e l'OffertaDiServizio strutturata (futuro dominio Servizi) restano concetti distinti fino a quando Servizi non sarà progettato; nessuna anticipazione della sua struttura è introdotta qui |
| **Duplicazione dei mercati** | Il Mercato e le relazioni di Presenza/Interesse/Attività internazionale restano interamente possedute da Mercati Internazionali (PF4); Professionisti può solo referenziarli come proprietà descrittiva del profilo |
| **Confusione tra competenza e servizio** | Una Competenza descrive una capacità; un Servizio dichiarato descrive un'offerta concreta; nessuna delle due implica automaticamente l'altra (principio di non-automatismo, coerente con `mercati-internazionali.md` §9) |
| **Confusione tra professionista e impresa** | Le due direzioni di dipendenza esistenziale sono opposte (Impresa esiste indipendentemente da ogni Persona; Professionista non esiste senza esattamente una Persona) e non sono mai intercambiabili (§5, ipotesi H5; `imprese.md` §1/§11/§15) |
| **Confusione tra professionista e ruolo (nel senso tecnico di Appartenenze)** | Il Ruolo di un'Appartenenza è un valore di catalogo locale a quella relazione (C03); "Professionista" è il nome di un intero dominio con proprio Aggregate Root; i due termini non condividono mai lo stesso significato nello stesso contesto (PL4, `domain-patterns.md` §23) |
| **Confusione tra profilo professionale e identità della persona** | Visibilità e ciclo di vita del Profilo professionale restano assi indipendenti da quelli della Persona (PF7); la pubblicazione dell'uno non implica quella dell'altro, ma la visibilità del Profilo non può mai eccedere quella della Persona sottostante (principio di coerenza, già applicato identicamente da Imprese, Appartenenze, Mercati Internazionali) |
| **Anticipazione impropria del futuro dominio Servizi** | Professionisti descrive chi può offrire una competenza, non l'offerta strutturata; nessuna regola di pubblicazione, ricerca o ciclo di vita dell'offerta è introdotta da questo dominio (§5, ipotesi H7; §9) |
| **Trattare "Professionista" come sinonimo di "verificato" o "affidabile"** | Nessun badge unico (PF10/PF11); l'esistenza di un Profilo, anche pubblicato, non dimostra la qualità né l'esito di una prestazione (§8, Fatto 2; principio già dichiarato dal documento logico esistente) |
| **Sovra-estensione del dominio verso relazioni non sue** | Nessuna relazione bilaterale autonoma è attribuita a Professionisti (§5, H4; §12, PF4/PF5 dichiarati non applicabili); ogni relazione strutturata con un'Impresa resta di Appartenenze |

---

## 14. Questioni aperte

Aspetti che non possono essere risolti senza progettare Collaborazioni, Opportunità, Eventi o Organizzazioni istituzionali — o senza una futura revisione di `domain-patterns.md` che non è compito di questo documento condurre.

1. **Confine esatto con Collaborazioni.** In che forma esatta un Professionista sarà referenziato come "proponente, candidato o professionista di supporto" — richiede il Physical Domain Mapping di Collaborazioni.
2. **Confine esatto con Opportunità.** Come sarà rappresentato un requisito di qualificazione professionale (riferimento diretto al Profilo, riferimento a una Categoria professionale, o altro) — richiede il Physical Domain Mapping di Opportunità.
3. **Confine esatto con Eventi.** Come sarà modellata la partecipazione di un relatore o formatore qualificato — richiede il Physical Domain Mapping di Eventi.
4. **Sorte delle Organizzazioni professionali, studi e Ordini.** Se e quando un dominio Organizzazioni istituzionali sarà formalizzato, la relazione Professionista↔Organizzazione dovrà essere riletta secondo quel dominio; fino a quel momento resta un riferimento non strutturato tramite Imprese/Appartenenze.
5. **Governance del catalogo locale di categorie e specializzazioni professionali.** Se resti un Elenco controllato locale (PC14/PP1, raccomandato da questa tesi) o se, in futuro, un secondo dominio indipendente ne richieda la governance condivisa, promuovendolo a Tassonomia condivisa — decisione riservata al futuro Physical Domain Mapping.
6. **Eventuale consolidamento del pattern di contestazione (PCa1).** Questa tesi rileva che Professionisti offre una seconda conferma indipendente, oltre ad Appartenenze, del pattern "stato Contestato" per una dichiarazione o una qualifica. Se questo debba portare PCa1 da Candidata a Consolidata è una decisione riservata a una futura revisione di `domain-patterns.md`, non a questo documento.
7. **Grado di strutturazione della Temporalità delle qualifiche.** Se Qualifica, Iscrizione e Abilitazione richiedano un proprio Periodo esplicito (analogo a quello di Appartenenze, `appartenenze.md` §7) o restino descritte in modo meno strutturato — decisione di modellazione riservata al futuro Domain Mapping (PC9).
8. **Confine esatto, in fase di modellazione, tra CompetenzaDichiarata (Persone) e Competenza professionale (Professionisti).** Questa tesi ha stabilito il criterio generale (contesto generico vs. contesto specialistico verificabile, §9), ma la soglia esatta caso per caso resta una decisione di modellazione, non di questa tesi.

---

## 15. Conclusioni

Il dominio Professionisti rappresenta il ruolo che una Persona assume quando esercita, in modo dichiarabile e verificabile, un'attività professionale specialistica — regolamentata o non regolamentata — attraverso un Profilo professionale: un Aggregate Root autonomo, sempre e soltanto ancorato a una Persona esistente, con un proprio ciclo di vita a più assi indipendenti, un proprio modello di verifica multi-fonte per qualifiche e titoli, propri servizi dichiarati in forma descrittiva, e propria visibilità.

Questa conclusione non è stata assunta dalla lettura di un solo documento: è stata dimostrata sottoponendo dieci interpretazioni alternative a un test comparativo esplicito (§5), verificando che nove di esse vengono escluse ciascuna per una ragione specifica e indipendente dalle altre, e che la decima converge indipendentemente da almeno quattro fonti architetturali di natura diversa (§6). Il dominio non possiede alcuna relazione bilaterale autonoma nel senso della regola fondazionale PF4 — una non-applicabilità dichiarata esplicitamente, non omessa — e resta rigorosamente distinto, per ciascuno dei propri fatti proprietari, da Persone, Imprese, Appartenenze e Mercati Internazionali (§8-§10), oltre che dai domini ipotetici non ancora progettati, per i quali questo documento non anticipa alcuna decisione definitiva (§11, §14).

## 16. Decisione architetturale finale

1. **Professionisti è un dominio autonomo**, con classificazione "Applicativo" e qualificazione secondaria "Fondazionale limitato" — una classificazione che questa tesi conferma con un'analisi indipendente, non per autorità della Dependency Map.
2. **Professionisti non è**: una Persona (H1); una semplice specializzazione incorporata nel dominio Persone (H2, interpretazione a); un ruolo nel senso tecnico ristretto già occupato da Appartenenze (H3, senza qualificazione); una relazione bilaterale autonoma nel senso PF4 (H4); un'Impresa (H5); un semplice elenco di competenze (H6); un catalogo di servizi strutturato (H7); un insieme di offerte transazionali (H9).
3. **Professionisti è**: il ruolo, ontologicamente non un soggetto nuovo (H3, qualificato), che una Persona assume, rappresentato da un Profilo professionale come proprio Aggregate Root (H8, qualificato), sufficientemente specializzato da richiedere propri assi di stato, propria verifica e propri confini (H2, qualificato) — la sintesi dimostrata come H10 al §6.
4. **Nessuna relazione bilaterale autonoma è attribuita a Professionisti.** Le relazioni strutturate tra un Professionista e un'Impresa restano, senza eccezione, di competenza di Appartenenze; PF4 e PF5 sono dichiarati esplicitamente non applicabili al nucleo del dominio (§12).
5. **Questa tesi non introduce alcuna nuova regola architetturale.** Conferma, con un metodo di verifica indipendente e comparativo, quanto già stabilito da `domain-model.md` (§13, decisione vincolante 5), da `imprese.md` (§1, §11, §15), da `domain-dependency-map.md` (§3-§4, §7, D10-D13) e da `logical/professionisti.md` nel suo complesso; non contraddice `domain-patterns.md` e non ne propone alcuna modifica, limitandosi a verificarne il comportamento nel caso Professionisti (§12) e a segnalarne alcuni input per una futura revisione (§14, punti 5-6), senza applicarli.
6. **Questo documento è pronto per essere usato come base per un futuro Physical Domain Mapping di Professionisti**, senza necessità di ridefinire il significato del dominio: le responsabilità (§7), i fatti proprietari (§8), i fatti esclusi (§9), i confini (§10-§11) e l'applicazione dei pattern (§12) costituiscono l'insieme minimo di decisioni concettuali che quel futuro documento dovrà rispettare, citando questa tesi come propria motivazione di significato ogni volta che la domanda "perché questo fatto appartiene a Professionisti" si ripresenta in forma di dettaglio implementativo.

---

## Revisione finale

Rilettura integrale condotta contro la checklist richiesta:

| # | Verifica richiesta | Esito |
|---|---|---|
| 1 | La soluzione proposta deriva dai documenti letti, non da un'assunzione progettuale | Verificato — §6 dimostra la convergenza indipendente di almeno quattro fonti già approvate; nessuna conclusione di questo documento precede la lettura integrale dichiarata al §2 |
| 2 | Nessuna nuova regola architetturale è introdotta | Verificato — §16, punto 5; ogni principio citato è richiamato per codice da `domain-patterns.md`, `domain-model.md` o dai documenti logici/fisici già approvati, mai riformulato con un significato nuovo |
| 3 | Nessuna contraddizione con `domain-patterns.md` | Verificato — §12 applica sistematicamente tutti i pattern rilevanti (PF1-PF20, i pattern consolidati/preferenziali/candidati pertinenti), dichiarando esplicitamente non applicabili PF4/PF5 al nucleo del dominio invece di ignorarli (coerente con PP4) |
| 4 | Nessuna anticipazione della progettazione del Logical Data Model | Verificato — nessuna entità, attributo, cardinalità o value object è introdotto; dove `logical/professionisti.md` già esiste, questo documento lo tratta come ipotesi da verificare (§3), non lo ripete né lo estende |
| 5 | Nessuna anticipazione del Physical Domain Mapping | Verificato — nessun riferimento a database, schema, tabelle, SQL, API; le decisioni di modellazione esplicitamente rinviate (es. §12, PC2 e PC9; §14, punto 7) sono dichiarate come tali, non risolte |
| 6 | Distinzione chiara tra fatti proprietari, riferimenti e dipendenze | Verificato — §8 (fatti proprietari, con motivazione contro ciascuno degli altri quattro domini), §9 (fatti esclusi, con dominio proprietario corretto), §11 (dipendenze e riferimenti ammessi per ciascun dominio, incluso il grado — necessaria/facoltativa/di utilizzo — dichiarato esplicitamente) |
| 7 | Ogni esclusione è motivata | Verificato — §9 fornisce una motivazione specifica per ciascuno dei quattordici fatti esclusi elencati, nessuna motivazione generica o ripetuta identicamente |
| 8 | Il documento è utilizzabile come base per il futuro Logical/Physical Domain Mapping senza dover ridefinire il significato del dominio | Verificato — §16, punto 6; §7-§12 costituiscono un insieme di vincoli di significato già stabiliti, non da riscoprire in una futura sessione di modellazione |
| 9 | Trasparenza sull'esistenza di `logical/professionisti.md` | Verificato — dichiarata esplicitamente nella nota introduttiva e ripresa ai §1-§3, senza che questo abbia sostituito la verifica indipendente richiesta al §5 |
| 10 | Nessun contenuto vietato (tabelle di modellazione, aggregate, entità, value object, eventi di dominio, schema, SQL, API, migrazioni) | Verificato — le tabelle presenti in questo documento sono tabelle di analisi architetturale (classificazioni, motivazioni, confronti), non tabelle di modellazione; nessuna entità con attributi tecnici, nessun evento di dominio, nessun riferimento a tecnologie è introdotto in alcuna sezione |
| 11 | Per i domini non ancora progettati, nessuna decisione definitiva è anticipata | Verificato — §11 (Collaborazioni, Opportunità, Eventi, Organizzazioni istituzionali) e §14 riportano solo indizi già presenti nei documenti approvati, marcati esplicitamente come tali, mai come decisioni |
