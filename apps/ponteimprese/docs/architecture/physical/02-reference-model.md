# Reference Model dell'architettura fisica

> Livello architetturale. Questo documento è un catalogo di pattern concettuali. Non contiene SQL, non contiene `CREATE TABLE`, non descrive PostgreSQL o Supabase, non contiene API, non contiene implementazioni né codice, e non è il mapping fisico di alcun dominio specifico. Ogni pattern descritto qui è un concetto riutilizzabile, non una struttura tecnica.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/physical/01-principi-mapping.md`](01-principi-mapping.md), tutti i documenti in [`docs/architecture/logical/`](../logical/), incluso [`docs/architecture/logical/reconciliation-report.md`](../logical/reconciliation-report.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: modello logico → riconciliazione logica → principi di mapping (`01-principi-mapping.md`) → **Reference Model (questo documento)** → mapping fisico per singolo dominio → piano di migrazione → migrazioni. Il Reference Model applica i principi di `01-principi-mapping.md` costruendo il catalogo dei pattern che ogni documento di mapping dovrà riutilizzare, invece di reinventarli dominio per dominio.

---

## Indice

1. [Scopo](#1-scopo)
2. [Pattern di rappresentazione](#2-pattern-di-rappresentazione)
3. [Pattern Aggregate](#3-pattern-aggregate)
4. [Pattern Entity](#4-pattern-entity)
5. [Pattern Value Object](#5-pattern-value-object)
6. [Pattern Relazione](#6-pattern-relazione)
7. [Pattern Stato](#7-pattern-stato)
8. [Pattern Verifica](#8-pattern-verifica)
9. [Pattern Versione](#9-pattern-versione)
10. [Pattern Evento](#10-pattern-evento)
11. [Pattern Dato](#11-pattern-dato)
12. [Pattern Classificazione](#12-pattern-classificazione)
13. [Pattern Documento](#13-pattern-documento)
14. [Pattern Temporalità](#14-pattern-temporalità)
15. [Pattern Visibilità](#15-pattern-visibilità)
16. [Catalogo dei Pattern](#16-catalogo-dei-pattern)
17. [Regole di utilizzo](#17-regole-di-utilizzo)
18. [Decisioni consolidate](#18-decisioni-consolidate)
19. [Checklist finale](#19-checklist-finale)

---

## 1. Scopo

**Cos'è un Reference Model.** È il catalogo unico e condiviso dei pattern concettuali ricorrenti che l'architettura fisica di questo progetto dovrà utilizzare, indipendentemente dal dominio a cui si applica. Un pattern, in questo senso, è una soluzione concettuale già riconosciuta e nominata per un problema di rappresentazione che si ripete in più domini (per esempio: come rappresentare che un fatto ha più stati indipendenti, come rappresentare che una relazione è cessata ma resta storicamente rilevante, come rappresentare che un dato è la conseguenza calcolata di altri dati). Il Reference Model non inventa questi pattern: li estrae da ciò che i documenti logici hanno già, in modo ricorrente e indipendente l'uno dall'altro, modellato negli 11 domini, e li rende espliciti, nominati e riutilizzabili.

**Perché è distinto dal modello logico.** Il modello logico (`docs/architecture/logical/*.md`, sintetizzato in `docs/domain-model.md`) descrive *cosa* esiste in ciascun dominio: le sue entità, i suoi fatti, le sue regole specifiche. Il Reference Model non descrive alcun fatto di un dominio specifico: descrive le *forme ricorrenti* con cui, in generale, un fatto di dominio può essere rappresentato una volta che si passa dal significato alla persistenza. Il modello logico risponde a "cosa significa questo concetto per il dominio Persone/Imprese/Appartenenze/...". Il Reference Model risponde a "quali forme concettuali generali sono disponibili per rappresentare un concetto con queste caratteristiche, chiunque sia il dominio che le presenta".

**Perché è distinto dal modello fisico.** Il modello fisico di un singolo dominio (i futuri documenti di mapping, uno per ciascuno degli 11 domini) applica questi pattern a un dominio specifico, scegliendo — per ciascuna Entity, relazione, stato, verifica, versione, evento o dato di quel dominio — quale pattern di questo catalogo utilizzare e perché. Il Reference Model non fa questa scelta: la rende possibile, prevedibile e uniforme. Un documento di mapping che non facesse riferimento a questo catalogo rischierebbe di reinventare, dominio per dominio, soluzioni concettuali già stabilite altrove, con il rischio di introdurre variazioni non motivate (esattamente il rischio che `01-principi-mapping.md` §2 vieta ai principi 6-7, ottimizzazioni premature e denormalizzazioni immotivate).

**Ruolo del catalogo dei pattern.** Il catalogo (§16) è il punto di riferimento operativo che ogni futuro documento di mapping dovrà consultare prima di introdurre una propria soluzione concettuale. Il suo ruolo è duplice: da un lato, offre un vocabolario comune e stabile per parlare di problemi di rappresentazione che si presentano in domini diversi con la stessa natura (una relazione che cessa ma resta storicamente rilevante è lo stesso problema concettuale in Appartenenze, in Mercati Internazionali o in Identità & Accessi); dall'altro, impedisce che lo stesso problema venga risolto in modi diversi e incompatibili in domini diversi, senza una ragione di dominio che lo giustifichi.

**Uniformità tra gli 11 domini.** Il Reference Model esiste perché l'architettura ha bisogno che i pattern usati per rappresentare concetti della stessa natura (un Aggregate, uno stato multi-asse, una verifica, una storicizzazione, un evento) siano scelti da uno stesso catalogo condiviso, non inventati indipendentemente da ciascun documento di mapping. Questo non significa che tutti gli 11 domini useranno gli stessi pattern per gli stessi scopi — ogni dominio resta libero di scegliere, tra i pattern disponibili, quelli adatti ai propri concetti, secondo quanto già stabilito dal proprio documento logico — ma significa che la *gamma* di soluzioni concettuali disponibili è unica, condivisa e coerente, e che l'uso di un pattern in un dominio ha lo stesso significato dell'uso dello stesso pattern in un altro dominio.

---

## 2. Pattern di rappresentazione

**Definizione di Pattern.** Un Pattern, in questo documento, è una soluzione concettuale nominata e stabile per un problema di rappresentazione ricorrente, indipendente da qualsiasi dominio specifico e da qualsiasi tecnologia. Un Pattern non è una struttura dati, non è una tabella, non è un tipo tecnico: è un concetto architetturale che un documento di mapping può scegliere di applicare a un'Entity, a una relazione, a un dato o a un fatto del proprio dominio.

**Pattern riutilizzabile.** È un pattern che può essere applicato in più domini diversi, ogni volta a un concetto locale diverso, senza che il suo significato cambi. La maggior parte dei pattern di questo catalogo sono riutilizzabili per costruzione: per esempio il pattern di Relazione storica (§6) ha lo stesso significato concettuale sia che si applichi a un'Appartenenza conclusa, sia che si applichi a una Presenza di mercato cessata.

**Pattern obbligatorio.** È un pattern che deve essere applicato ogni volta che si presenta la condizione che lo richiede, senza eccezioni lasciate alla discrezione del singolo documento di mapping. Il pattern degli assi indipendenti (§7) è l'esempio più diretto: ogni volta che un documento logico ha modellato un'Entity con più dimensioni di stato distinte, il documento di mapping corrispondente deve applicare il pattern degli assi indipendenti, non una loro compressione. Un pattern obbligatorio non è una preferenza stilistica: la sua omissione costituisce una violazione dei principi di `01-principi-mapping.md`.

**Pattern specializzato.** È un pattern che nasce come una forma più specifica di un pattern più generale, per rappresentare una condizione che il pattern generale copre ma non distingue a sufficienza. Per esempio, la Relazione di appartenenza e la Relazione di rappresentanza (§6) sono entrambe forme specializzate del pattern più generale di Relazione forte: condividono la caratteristica di legare due soggetti con esistenza autonoma, ma aggiungono un significato più specifico (appartenenza organizzativa, titolo ad agire per conto di un altro soggetto) che il pattern generale, da solo, non renderebbe esplicito.

**Estensione di un pattern.** È l'operazione con cui un documento di mapping applica un pattern esistente a un concetto del proprio dominio aggiungendo le condizioni specifiche del dominio stesso, senza alterare il significato generale del pattern. Un'estensione è legittima quando resta interamente spiegabile in termini del pattern generale più le regole già stabilite nel documento logico del dominio; non è legittima quando introduce, nel nome dell'estensione, un significato che il pattern generale non prevede e che nessun documento logico ha dichiarato.

**Regole per l'uso dei pattern.**

1. Un documento di mapping non può introdurre un pattern nuovo, non presente in questo catalogo, senza prima proporne l'aggiunta al catalogo stesso: il catalogo cresce per estensione consapevole, non per iniziativa isolata di un singolo documento di dominio.
2. Un documento di mapping deve sempre indicare, per ogni concetto del proprio dominio, quale pattern (o quali pattern combinati) applica, citandone il codice stabile (§17).
3. Un pattern obbligatorio non può essere omesso per semplicità: se un documento di mapping ritiene che un pattern obbligatorio non sia necessario per un caso specifico, deve motivarlo esplicitamente richiamando il proprio documento logico, non ometterlo silenziosamente.
4. Un pattern specializzato eredita tutte le regole del pattern generale da cui deriva: non può contraddirle, può solo aggiungerne altre più specifiche.
5. Un'estensione di pattern non crea un nuovo pattern: resta un'istanza del pattern generale applicata a un dominio, e va descritta come tale, non come un concetto autonomo.

---

## 3. Pattern Aggregate

Questa famiglia di pattern applica al livello del catalogo i principi già definiti in `01-principi-mapping.md` §3, senza ripeterne la motivazione: qui l'obiettivo è fissare le forme concettuali riutilizzabili con cui un Aggregate viene riconosciuto e trattato in un documento di mapping.

**A01 — Aggregate Root.** Il pattern con cui si riconosce il concetto centrale di un dominio o di una porzione di esso: l'unico punto attraverso cui un insieme di dati che devono restare coerenti tra loro viene letto e modificato. Ogni dominio individuato in `docs/domain-model.md` §2-§3 ha già il proprio Aggregate Root dichiarato nel documento logico corrispondente (Persona, Impresa, Appartenenza, Presenza/Interesse di mercato, Opportunità, Collaborazione, Profilo professionale, Evento, Contenuto editoriale, Indicatore, Account). Applicare A01 significa riconoscere questo concetto come il punto di riferimento univoco per tutte le decisioni di mapping successive relative a quel dominio.

**A02 — Confine dell'Aggregate.** Il pattern con cui si stabilisce cosa appartiene concettualmente a un Aggregate (le sue Entity dipendenti, §4) e cosa ne resta fuori (altri Aggregate, referenziati ma non incorporati). Il confine non è una scelta libera del mapping: riprende esattamente la distinzione già tracciata da ciascun documento logico nella propria sezione "Cosa comprende / Cosa NON comprende". Applicare A02 significa tradurre quella distinzione già dichiarata, non ridefinirla.

**A03 — Consistenza dell'Aggregate.** Il pattern con cui si riconoscono le regole interne che devono restare sempre vere per un Aggregate e le sue Entity dipendenti (per esempio: una Persona non ha due dichiarazioni identiche della stessa competenza; un'Impresa non ha due sedi legali contemporaneamente attive). Applicare A03 significa individuare, per ciascun Aggregate, quali regole invarianti il documento logico ha già dichiarato (tipicamente nella sezione "Regole invarianti" o "Vincoli") e garantire che il mapping le preservi.

**A04 — Ciclo di vita dell'Aggregate.** Il pattern con cui si riconosce che un Aggregate percorre, dalla propria creazione alla propria eventuale archiviazione o cancellazione, una sequenza di condizioni rilevanti per il dominio. Questo pattern lavora insieme al pattern degli assi indipendenti (S, §7): il ciclo di vita di un Aggregate non è quasi mai un singolo percorso lineare, ma l'insieme dei percorsi paralleli dei suoi diversi assi di stato.

**Quando NON si applica la famiglia Aggregate.** Non si applica a un concetto che non ha una propria consistenza da proteggere e non ha bisogno di essere referenziato autonomamente da altri concetti: in quel caso il concetto candidato è più probabilmente un'Entity dipendente (§4) o un Value Object (§5), non un Aggregate Root.

---

## 4. Pattern Entity

Questa famiglia riprende i criteri di `01-principi-mapping.md` §4 e li organizza in quattro forme concettuali distinte, più ricche della semplice alternativa "persistente / non persistente" già introdotta lì.

**E01 — Entity autonoma.** Un'Entity con una propria identità stabile e un proprio ciclo di vita indipendente, al punto da poter essere essa stessa un Aggregate Root (§3) oppure da avere una vita che, pur dipendendo formalmente da un Aggregate, è di fatto governata da regole proprie e referenziabile da altri domini (per esempio un Profilo professionale rispetto alla Persona che lo detiene). Si distingue da E02 per il grado di autonomia del proprio ciclo di vita rispetto a quello dell'Aggregate che la contiene.

**E02 — Entity dipendente.** Un'Entity che esiste solo all'interno del confine di un Aggregate (A02) e non ha significato concettuale al di fuori di esso, ma che comunque ha una propria identità e una cardinalità sufficiente da richiedere una rappresentazione individuale (per esempio una Sessione all'interno di un'Edizione di un Evento, una CompetenzaDichiarata all'interno del profilo di una Persona). Un'Entity dipendente segue sempre il ciclo di vita del proprio Aggregate: non può "sopravvivergli" concettualmente, salvo storicizzazione esplicita (§9, §14).

**E03 — Entity condivisa.** Un'Entity che, pur appartenendo concettualmente a un solo dominio proprietario, viene sistematicamente referenziata da più altri domini come parte delle loro stesse relazioni (per esempio la Persona, referenziata da Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio e Identità & Accessi). La condivisione riguarda l'uso — quanti domini la referenziano — non la proprietà, che resta sempre unica (`01-principi-mapping.md` §2, principio 1).

**E04 — Entity interna.** Un'Entity dipendente (E02) la cui esistenza è così strettamente legata a un'altra Entity, e non direttamente all'Aggregate Root, da non avere senso nemmeno come concetto isolato all'interno dell'Aggregate (per esempio un singolo Periodo di validità di un Ruolo all'interno di un'Appartenenza, quando il documento logico lo tratta come un dettaglio del Ruolo e non come un fatto autonomamente citabile). Si distingue da E02 perché il suo riferimento naturale non è l'Aggregate Root, ma un'altra Entity dipendente.

**Differenze riassuntive.** E01 si distingue per l'autonomia del proprio ciclo di vita; E02 per la dipendenza dal confine di un Aggregate pur mantenendo un'identità propria distinguibile; E03 per l'ampiezza dell'uso da parte di altri domini, indipendentemente dalla propria proprietà; E04 per la dipendenza non dall'Aggregate Root ma da un'altra Entity interna al medesimo Aggregate. Le quattro forme non sono reciprocamente esclusive nella pratica: un'Entity può essere insieme E02 (dipendente dal proprio Aggregate) ed E03 (condivisa, cioè ampiamente referenziata da altri domini).

---

## 5. Pattern Value Object

Questa famiglia riprende i criteri di `01-principi-mapping.md` §5, distinguendo tre forme e specificando quando un candidato Value Object non deve mai evolvere in un'Entity.

**VO01 — Value Object incorporato.** Un valore descrittivo privo di identità propria che cambia sempre insieme all'Entity o all'Aggregate che lo contiene, non è condiviso con altri concetti, e non richiede una validazione autonoma complessa (per esempio il livello di competenza dichiarato per una CompetenzaDichiarata, o il periodo di validità di una singola dichiarazione). Resta sempre descritto interamente dai propri attributi.

**VO02 — Value Object condiviso.** Un valore descrittivo che più Aggregate o domini diversi devono poter esprimere in modo coerente, senza che ciascuno lo ridefinisca a modo proprio, ma che non richiede un proprio catalogo gestito come entità di riferimento a sé stante (per esempio uno schema comune per esprimere un periodo temporale, riutilizzato sia da Appartenenze sia da Mercati Internazionali). La condivisione riguarda la forma del valore, non la sua provenienza da un catalogo esterno.

**VO03 — Value Object riutilizzato da catalogo.** Un valore descrittivo che rappresenta, in un dominio che lo utilizza, un riferimento a una voce di una Tassonomia condivisa (§12) posseduta da un unico dominio proprietario (per esempio una Lingua, una Competenza, un Settore, un Territorio). Il dominio che lo usa non lo ridefinisce e non lo copia: lo referenzia. Questo pattern è il modo con cui il principio "nessun dominio duplica fatti altrui" (`01-principi-mapping.md` §2, principio 2) si applica ai Value Object condivisi tra domini diversi.

**Quando un Value Object NON deve acquisire identità propria.** Un Value Object non deve mai diventare un'Entity (§4) per il solo fatto di essere condiviso, riutilizzato o ripetuto più volte per la stessa Entity: l'identità propria si aggiunge solo quando il documento logico del dominio richiede di poter distinguere due valori con gli stessi attributi come fatti diversi (per esempio due dichiarazioni successive della stessa competenza, se il dominio le tratta come eventi distinti, non come lo stesso valore aggiornato). Se due istanze con gli stessi attributi sono, per il dominio, la stessa cosa, il concetto resta un Value Object; se possono essere due fatti distinti anche a parità di attributi, il concetto è già un'Entity e la sua trattazione come Value Object sarebbe una semplificazione indebita.

---

## 6. Pattern Relazione

Questa famiglia estende la tipologia di relazioni già introdotta in `01-principi-mapping.md` §7 (uno-a-uno, uno-a-molti, molti-a-molti, deboli, forti, temporanee, storiche, derivate), riorganizzandola secondo la natura del legame piuttosto che secondo la sola cardinalità, e aggiunge due forme specializzate (rappresentanza, appartenenza, delega) più direttamente utili al mapping degli 11 domini.

**R01 — Relazione strutturale.** Il legame che definisce il confine stesso di un Aggregate (A02): lega un Aggregate Root alle proprie Entity dipendenti (E02, E04). È sempre una relazione forte dal punto di vista della dipendenza di esistenza (l'Entity dipendente non esiste senza l'Aggregate) e segue sempre il ciclo di vita dell'Aggregate, salvo storicizzazione esplicita.

**R02 — Relazione contestuale.** Il legame con cui un'Entity o un Aggregate acquisisce un significato aggiuntivo solo in un contesto specifico, senza che questo contesto ne alteri l'identità (per esempio una Persona che partecipa a un Evento in un ruolo specifico, o un'Impresa che dichiara un Interesse verso un Mercato). È tipicamente una relazione molti-a-molti tra due Aggregate che restano autonomi.

**R03 — Relazione temporanea.** Il legame pensato, fin dall'origine logica, per essere valido solo per un periodo o un processo limitato con una conclusione naturale prevista (una candidatura, una manifestazione di interesse, una sessione di partecipazione). Coincide con la relazione temporanea già definita in `01-principi-mapping.md` §7.

**R04 — Relazione storica.** Il legame che, anche una volta concluso, deve restare consultabile come fatto realmente avvenuto (un'Appartenenza conclusa, una Delega scaduta, una Presenza di mercato cessata). Lavora insieme al pattern di storicizzazione più generale (§9, §14): la relazione storica è il caso specifico in cui l'oggetto storicizzato è un legame tra due soggetti, non un singolo fatto isolato.

**R05 — Relazione derivata.** Il legame che non è un fatto dichiarato da qualcuno, ma il risultato di un calcolo o di un'aggregazione condotta su altri fatti o relazioni (un Indicatore dell'Osservatorio calcolato a partire da più Appartenenze). Non deve mai essere trattata, nel mapping, come se fosse un fatto dichiarato al pari delle relazioni sorgente da cui proviene (si veda anche §11, Dato derivato).

**R06 — Relazione di rappresentanza.** Una forma specializzata di relazione forte (§7 di `01-principi-mapping.md`) con cui un soggetto (tipicamente una Persona) acquisisce il titolo per agire per conto di un altro soggetto (tipicamente un'Impresa), senza che questo trasformi il rappresentante nel soggetto rappresentato né gli trasferisca la proprietà dei fatti che gestisce. Corrisponde al Titolo di rappresentanza già distinto in `appartenenze.md` e `identita-accessi.md` §5, e riconosciuto come pattern condiviso in `reconciliation-report.md` §3.2.

**R07 — Relazione di appartenenza.** Una forma specializzata di relazione forte con cui un soggetto (Persona) e un altro soggetto (Impresa, o altra organizzazione) sono legati da un vincolo organizzativo dichiarato — proprietà, amministrazione, lavoro, collaborazione — che il documento logico di Appartenenze tratta come dominio autonomo (Aggregate proprio, non incorporato né in Persone né in Imprese). È sempre, per costruzione, anche una relazione storica (R04) quando conclusa.

**R08 — Relazione di delega.** Una forma specializzata di relazione temporanea (R03) o storica (R04, se conclusa) con cui un soggetto (Delegante) trasferisce a un altro soggetto (Delegato) un potere limitato e specifico, revocabile, che non equivale a una relazione di appartenenza (R07) né di rappresentanza (R06) sostanziale: il Delegato agisce nei limiti esplicitamente concessi, non diventa titolare del fatto delegato. Corrisponde al pattern Delega già modellato in `identita-accessi.md` §8.

**Principio di scelta.** La scelta tra queste forme non è mai libera: il documento logico del dominio ha già stabilito la natura del legame (chi sono le parti, se hanno esistenza autonoma, se il legame è limitato nel tempo, se richiede una storicizzazione); il documento di mapping applica la forma di questo catalogo che corrisponde più fedelmente a quanto già stabilito, motivando la corrispondenza (`01-principi-mapping.md` §2, principio 5).

---

## 7. Pattern Stato

**Il pattern generale degli assi indipendenti.** Riprendendo `01-principi-mapping.md` §9, ogni Entity il cui ciclo di vita è stato modellato a livello logico lungo più dimensioni distinte deve conservare, nel mapping fisico, quelle dimensioni come assi separati, mai compressi in un unico valore di "stato". Le otto forme seguenti sono gli assi ricorrenti già individuati, in varie combinazioni, in tutti gli 11 documenti logici: non ogni Entity presenta tutti gli otto assi, ma ogni asse che un documento logico ha effettivamente modellato per una data Entity deve restare distinto nel mapping.

**S01 — Stato sostanziale.** L'asse che risponde alla domanda "qual è la condizione di fatto, operativa, di questo concetto" (per esempio: un'Impresa attiva o cessata, un'Appartenenza attiva o conclusa, un Evento programmato/in corso/concluso). È l'asse più vicino al significato di business primario dell'Entity.

**S02 — Stato editoriale.** L'asse che risponde alla domanda "a che punto è la redazione o la completezza descrittiva di questo concetto" (per esempio: un profilo in bozza, completo, incompleto; un Contenuto editoriale in redazione, in revisione, pronto). È distinto dallo stato sostanziale: un'Entity può essere sostanzialmente attiva ma editorialmente incompleta.

**S03 — Stato di verifica.** L'asse, sempre multidimensionale (§8), che risponde alla domanda "quali aspetti di questo concetto sono stati controllati, da chi, con quale esito". Non è mai un singolo valore: è l'insieme degli esiti delle verifiche pertinenti a quell'Entity.

**S04 — Stato di pubblicazione.** L'asse che risponde alla domanda "questo concetto è stato reso visibile all'esterno, per una scelta esplicita di chi ne ha la titolarità". Collabora con il pattern di Visibilità (§15) e con il pattern Versione (§9): la pubblicazione può riguardare l'Entity nel suo complesso o una sua versione specifica.

**S05 — Stato di accesso.** L'asse che risponde alla domanda "chi ha, in questo momento, il diritto di leggere o modificare questo concetto". Per principio (`01-principi-mapping.md` §14), questo asse è applicato dal dominio Identità & Accessi sulla base di una decisione la cui titolarità resta sempre del dominio proprietario del fatto.

**S06 — Stato di sicurezza.** L'asse che risponde alla domanda "questo dato è protetto da un accesso o una modifica non autorizzata", una garanzia trasversale indipendente dal significato di business del dato stesso.

**S07 — Stato amministrativo.** L'asse che risponde alla domanda "questo concetto è oggetto di un intervento di moderazione, sospensione o gestione da parte di chi amministra la piattaforma", distinto dallo stato sostanziale perché la sua titolarità non è del soggetto proprietario del fatto ma di una funzione di governo trasversale (tipicamente Identità & Accessi o una funzione equivalente).

**S08 — Stato storico.** L'asse, sempre presente quando si applica il pattern di storicizzazione (§14), che risponde alla domanda "questa condizione è quella corrente o appartiene al passato". Non si aggiunge agli altri assi come una loro alternativa: li accompagna, perché ciascuno degli assi S01-S07 può avere, allo stesso tempo, un valore corrente e una serie di valori storici.

**Perché restano assi distinti.** Comprimere due o più di questi assi in un solo valore costringerebbe a scegliere una sola risposta quando, nella realtà del dominio, più condizioni sono vere contemporaneamente e in modo indipendente (un'Entity può essere sostanzialmente attiva, editorialmente completa, parzialmente verificata, non ancora pubblicata, accessibile solo al proprio titolare, e non soggetta ad alcun intervento amministrativo — sei risposte diverse, nessuna delle quali implica le altre). Ogni documento di mapping deve indicare esplicitamente, per ciascuna Entity trattata, quali di questi otto assi si applicano, secondo quanto già stabilito nel proprio documento logico, e mantenerli distinti.

---

## 8. Pattern Verifica

**V01 — Verifica.** Il pattern con cui si riconosce un controllo, condotto da un soggetto verificatore identificabile secondo un metodo dichiarato, su un aspetto specifico di un fatto o di un'Entity. Una Verifica non è mai generica: riguarda sempre un aspetto nominato (esistenza, identità, contatto, documentale, fonte, relazione, rappresentanza, professionale, editoriale, metodologica, disponibilità, partecipazione, delega, consenso, qualità del dato — la tassonomia già consolidata in `reconciliation-report.md` §9.1).

**V02 — Evidenza.** Il pattern con cui si riconosce l'elemento concreto (un documento, una dichiarazione di terzi, un riscontro osservabile) che sostiene l'esito di una Verifica. Un'Evidenza non equivale essa stessa a una Verifica: è ciò su cui una Verifica si basa. Un'Evidenza può anche essere assente (una Verifica basata su un controllo diretto del verificatore, senza un documento a supporto) o multipla (più Evidenze a sostegno della stessa Verifica).

**V03 — Fonte.** Il pattern con cui si riconosce chi o cosa ha originato un'informazione, distinto sia dal soggetto verificatore (V01) sia dall'Evidenza (V02): la Fonte è l'origine dell'informazione, la Verifica è il controllo su di essa, l'Evidenza è il supporto usato in quel controllo. Come già stabilito in `reconciliation-report.md` §3.2, Fonte è un pattern locale ripetuto in ciascun dominio, non un'entità condivisa tra domini.

**V04 — Risultato.** Il pattern con cui si registra l'esito di una Verifica in un momento determinato: positivo, negativo, parziale, o non ancora concluso. Il Risultato è sempre riferito a una Verifica specifica su un aspetto specifico, mai a un giudizio complessivo sull'Entity (si veda V05).

**V05 — Affidabilità.** Non un pattern persistente a sé stante, ma il nome che si dà, quando serve descriverlo, alla combinazione osservabile dei Risultati (V04) di più Verifiche (V01) pertinenti a una stessa Entity in un dato momento. L'Affidabilità non è mai un valore unico calcolato e memorizzato come giudizio complessivo: è sempre derivabile (§11, Dato derivato) dall'insieme dei Risultati delle singole Verifiche, mai un dato sorgente a sé.

**Conferma della multidimensionalità.** Coerentemente con `01-principi-mapping.md` §10 e con l'esito già confermato in `reconciliation-report.md` §9.2, questo catalogo non prevede e non ammette, in nessun documento di mapping futuro, un pattern di "Entità verificata" generico privo di indicazione dell'aspetto verificato. Ogni applicazione del pattern V01 deve sempre specificare quale aspetto (tra quelli già censiti) sta verificando; l'Affidabilità (V05) resta un concetto derivato e descrittivo, mai un pattern di stato persistente equivalente a un badge.

---

## 9. Pattern Versione

**VR01 — Versione.** Il pattern con cui si riconosce una redazione determinata di un contenuto o di un fatto dichiarato, che sostituisce la precedente per l'uso corrente ma non la elimina (`01-principi-mapping.md` §8, §11). Ogni Versione è riconducibile a chi l'ha prodotta e a quando.

**VR02 — Revisione.** Il pattern con cui si riconosce il processo di controllo e possibile miglioramento di una Versione, distinto dal suo eventuale risultato: una Revisione può concludersi producendo una nuova Versione (VR01) oppure confermando quella esistente senza modifiche.

**VR03 — Rettifica.** Il pattern con cui si riconosce una nuova Versione che dichiara esplicitamente un errore nella Versione precedente, distinguendosi da una Versione ordinaria perché segnala che la precedente era scorretta, non solo superata.

**VR04 — Traduzione.** Il pattern con cui si riconosce un adattamento linguistico di un contenuto, parallelo e non sostitutivo rispetto alla Versione nella lingua originale: una Traduzione non è una nuova Versione della stessa redazione, è un'espressione equivalente in un'altra lingua.

**VR05 — Pubblicazione (di una versione).** Il pattern con cui si riconosce l'atto che rende disponibile all'esterno una Versione determinata, distinto dalla sua redazione o dalla sua Revisione. Questo pattern è la forma specifica, applicata a una Versione, dell'asse di Stato di pubblicazione (S04) e del pattern di Visibilità (VIS04, §15): la stessa nozione di "rendere pubblico" ricorre in tre punti del catalogo perché è, per sua natura, trasversale — qui si applica specificamente al momento in cui una singola Versione (e non l'Entity nel suo complesso) diventa quella visibile.

**VR06 — Archiviazione.** Il pattern con cui si riconosce la conservazione deliberata di una Versione o di un'Entity non più corrente, per valore storico, distinta sia dalla cancellazione (nulla viene perso) sia dalla semplice sostituzione (l'elemento archiviato resta identificabile come tale).

**Come convivono.** Una stessa Entity soggetta a redazione può avere, nello stesso momento: una Versione corrente (VR01), una o più Traduzioni valide di quella Versione (VR04), una Revisione in corso che potrebbe produrre una nuova Versione o una Rettifica (VR02, VR03), una Pubblicazione riferita alla Versione corrente ma non ancora estesa alla nuova Versione in Revisione (VR05), e una o più Versioni precedenti Archiviate (VR06). Questi sei pattern non sono alternativi tra loro: descrivono momenti e aspetti diversi della stessa storia redazionale, e un documento di mapping deve poterli riconoscere e distinguere tutti quando il proprio dominio logico li prevede (tipicamente Contenuti editoriali, ma anche altri domini per le proprie dichiarazioni redatte, come Professionisti per il proprio Profilo).

---

## 10. Pattern Evento

**EV01 — Evento di dominio.** Il pattern con cui si riconosce un fatto rilevante, già accaduto, che un dominio produce e che potrebbe interessare altri domini o funzioni trasversali (`01-principi-mapping.md` §12). È sempre espresso al participio passato o in una forma equivalente che descrive un fatto concluso, mai un comando.

**EV02 — Evento interno.** Un Evento di dominio rilevante solo all'interno del confine del proprio Aggregate (A02): non produce alcuna conseguenza dichiarata in altri domini, ma resta comunque utile per ricostruire la storia interna dell'Aggregate (per esempio una singola correzione di un dato descrittivo, se il documento logico la considera un fatto da tracciare ma non da comunicare altrove).

**EV03 — Evento osservabile.** Un Evento di dominio che il documento logico ha esplicitamente indicato come generatore di una conseguenza in almeno un altro dominio (per esempio AppartenenzaConclusa, che può generare una conseguenza in Identità & Accessi sulla decadenza di un titolo di rappresentanza). È "osservabile" nel senso che altri domini possono, in linea di principio, esserne interessati — non implica alcun meccanismo tecnico di notifica o comunicazione, che resta fuori da questo catalogo.

**EV04 — Evento storico.** Un Evento di dominio che, essendo già accaduto, resta permanentemente parte della storia della propria Entity anche dopo che lo stato corrente è cambiato più volte: collabora sempre con il pattern di storicizzazione (§14) come la registrazione puntuale del momento in cui una transizione di stato è avvenuta.

**Conferma: rappresentano sempre fatti già avvenuti.** Nessuna delle quattro forme rappresenta un comando, un'intenzione o una richiesta futura: EV01-EV04 descrivono sempre qualcosa che è già accaduto nel dominio che lo genera, coerentemente con `01-principi-mapping.md` §12 e con la verifica di forma grammaticale già condotta in `reconciliation-report.md` §10 su tutti gli eventi elencati nei documenti logici.

---

## 11. Pattern Dato

Questa famiglia estende le sette categorie già definite in `01-principi-mapping.md` §13, separando esplicitamente il "dato dichiarato" dal "dato sorgente" generico e il "dato verificato" come intersezione tra il pattern Dato e il pattern Verifica (§8), perché entrambe le distinzioni ricorrono in modo sistematico nei documenti logici.

**D01 — Dato sorgente.** Il dato originale da cui ogni altro dato di questa famiglia può derivare, osservato o registrato direttamente nel dominio che lo possiede.

**D02 — Dato dichiarato.** Una forma specifica di dato sorgente: l'informazione fornita direttamente da un soggetto (Persona, Impresa, Professionista) senza che questo implichi, di per sé, alcun controllo esterno. Il pattern D02 è il modo con cui il principio di non-automatismo (dichiarazione non implica verifica, `01-principi-mapping.md` e tutti i documenti logici) si traduce in una categoria di dato distinta: un Dato dichiarato resta tale finché non interviene una Verifica (V01) che lo qualifichi anche come D03.

**D03 — Dato verificato.** Un Dato dichiarato (D02) o osservato (D01) su cui è stata condotta almeno una Verifica (V01) con esito registrato (V04). Un dato può essere verificato su un aspetto e non verificato su un altro aspetto contemporaneamente (coerente con la multidimensionalità, §8): "verificato" qui non è mai un giudizio complessivo, ma sempre riferito a una Verifica specifica.

**D04 — Dato derivato.** Qualsiasi dato ottenuto elaborando uno o più dati sorgente (D01) o dichiarati (D02), che non deve mai essere trattato come se fosse esso stesso un dato sorgente.

**D05 — Dato calcolato.** Una forma specifica di dato derivato ottenuta applicando una regola o una formula esplicita e riproducibile, sempre riconducibile alla metodologia che lo ha generato (tipicamente un Indicatore dell'Osservatorio).

**D06 — Dato aggregato.** Una forma specifica di dato derivato costruita combinando informazioni relative a più soggetti o istanze distinte, con l'accortezza che la combinazione non permetta la reidentificazione di un singolo soggetto che il dominio sorgente non avrebbe reso visibile individualmente.

**D07 — Dato pubblicato.** Un dato — di qualsiasi altra forma di questo catalogo — che è stato reso visibile all'esterno secondo le regole di visibilità del proprio dominio proprietario (si veda anche VR05, S04, VIS04): la pubblicazione è sempre un evento o uno stato aggiunto, mai una caratteristica intrinseca del dato.

**D08 — Dato storico.** Un dato che rappresenta una condizione passata, conservato deliberatamente per continuità, verifica o responsabilità (si veda §14).

**D09 — Dato temporaneo.** Un dato valido solo per la durata di un processo o di una relazione limitata nel tempo, la cui scomparsa al termine del processo non costituisce una perdita di storia.

**Principio di composizione.** Queste nove forme non sono mutuamente esclusive: un singolo dato può essere, allo stesso tempo, dichiarato (D02), verificato su un aspetto (D03), e successivamente pubblicato (D07); un Indicatore può essere insieme calcolato (D05) e aggregato (D06). Ogni documento di mapping deve poter indicare, per ciascun dato trattato, quali di queste forme si applicano simultaneamente, e da quale dato sorgente (D01) esso in ultima analisi proviene.

---

## 12. Pattern Classificazione

**C01 — Classificazione.** Il pattern generale con cui un'Entity o un fatto viene collocato in un insieme organizzato di alternative, per permettere ricerca, confronto e aggregazione senza duplicare il valore stesso. È il pattern-ombrello da cui derivano C02-C06.

**C02 — Tassonomia.** Una Classificazione strutturata e governata da un unico dominio proprietario, condivisa e riutilizzata da altri domini tramite riferimento (VO03, §5): è il caso di Lingua, Competenza, Settore, Territorio, già riconosciuti come catalogo condiviso in `reconciliation-report.md` §7. Una Tassonomia ha un proprio ciclo di gestione (aggiunta, correzione, eventuale disattivazione di voci) distinto dal ciclo di vita delle Entity che la referenziano.

**C03 — Elenco controllato.** Una Classificazione più semplice di una Tassonomia, con un numero limitato e stabile di valori possibili, che non richiede una gestione autonoma nel tempo (per esempio le forme già chiuse di uno stato sostanziale, quando il documento logico le elenca come un insieme finito e non evolutivo). Si distingue da C02 per l'assenza di un proprio ciclo di gestione: i valori di un Elenco controllato sono parte della definizione stessa del concetto che classificano, non un catalogo esterno.

**C04 — Categoria.** Un raggruppamento di primo livello all'interno di una Classificazione, tipicamente usato per organizzare una Tassonomia (C02) o un Elenco controllato (C03) in una struttura a più livelli (per esempio un raggruppamento di Settori economici per macro-area).

**C05 — Tipologia.** Una Classificazione applicata non a un valore descrittivo condiviso, ma alla natura stessa di un'Entity, per distinguere sotto-forme rilevanti per il dominio (per esempio i diversi tipi di Opportunità, o i diversi tipi di Evento già distinti nei rispettivi documenti logici). Si distingue da C02-C04 perché non riguarda un attributo dell'Entity, ma la sua stessa natura strutturale.

**C06 — Attributo descrittivo.** Un valore che qualifica un'Entity senza essere esso stesso oggetto di governo condiviso, di catalogo o di struttura a più livelli: è la forma più semplice, corrispondente a un Value Object incorporato (VO01) usato con finalità descrittiva piuttosto che classificatoria.

**Differenze.** Classificazione (C01) è il concetto generale; Tassonomia (C02) e Elenco controllato (C03) si distinguono per la presenza o assenza di un proprio ciclo di gestione autonomo; Categoria (C04) è un livello organizzativo interno a una Classificazione; Tipologia (C05) classifica la natura di un'Entity, non un suo attributo; Attributo descrittivo (C06) è un valore qualificante che non richiede alcuna delle strutture precedenti.

---

## 13. Pattern Documento

**DOC01 — Documento.** Il pattern con cui si riconosce un contenuto informativo autonomo, prodotto o ricevuto in un momento determinato, che un dominio tratta come un fatto a sé, distinto dall'Entity che lo referenzia (per esempio un certificato, un titolo, una comunicazione formale). Un Documento ha sempre un'origine e una data, anche quando questi dettagli non sono esplicitamente modellati come attributi separati.

**DOC02 — Allegato.** Un Documento (DOC01) la cui esistenza è subordinata a un'altra Entity che lo introduce e a cui resta legato (per esempio un titolo allegato a una Qualifica dichiarata): a differenza di un Documento autonomo, un Allegato non ha un proprio significato indipendente dal fatto che accompagna.

**DOC03 — Evidenza documentale.** L'uso del pattern Documento (DOC01/DOC02) quando la sua funzione specifica è sostenere l'esito di una Verifica (coincide con V02, Evidenza, quando l'evidenza stessa ha natura documentale piuttosto che dichiarativa o osservativa).

**DOC04 — Riferimento.** Il pattern con cui un'Entity indica l'esistenza di un Documento (DOC01) esterno al dominio, senza incorporarne il contenuto: il Documento resta di competenza (e spesso di proprietà) di un altro contesto, e l'Entity si limita a segnalarne l'esistenza e la pertinenza.

**DOC05 — Supporto documentale.** Il pattern generale, applicabile a un'intera Entity o a una sua dichiarazione, con cui si riconosce che esiste un insieme di Documenti (DOC01-DOC04) a sostegno di quanto dichiarato, senza che ciascuno di essi debba essere elencato singolarmente nel mapping concettuale: utile quando il documento logico richiede solo di sapere "esiste un supporto documentale", non "quali documenti specifici".

**Principio di non implementazione.** Nessuna delle cinque forme implica alcuna decisione su come un contenuto documentale venga effettivamente conservato, trasferito o reso disponibile: questo catalogo si limita a riconoscere la natura concettuale del legame tra un'Entity e i contenuti informativi che la sostengono o la accompagnano, lasciando ogni decisione tecnica ai documenti di mapping e alle fasi successive.

---

## 14. Pattern Temporalità

**T01 — Validità.** Il pattern con cui si riconosce se un fatto o una dichiarazione produce ancora effetti riconosciuti dal dominio, oppure è scaduto, concluso o superato. È lo stesso concetto già introdotto come asse di Stato (S01/S08) applicato specificamente alla dimensione temporale.

**T02 — Efficacia.** Il pattern con cui si riconosce il momento a partire dal quale un fatto produce effettivamente le proprie conseguenze per il dominio, distinto dal momento in cui è stato dichiarato o registrato: un fatto può essere stato dichiarato in un momento e diventare efficace solo in un momento successivo (per esempio una nomina che decorre da una data futura rispetto alla sua registrazione).

**T03 — Decorrenza.** Il pattern con cui si identifica il punto di inizio di un periodo di Validità (T01) o di Efficacia (T02): la data o il momento da cui un fatto comincia a valere.

**T04 — Scadenza.** Il pattern con cui si identifica il punto di fine, previsto o effettivo, di un periodo di Validità: la data o il momento in cui un fatto cessa di produrre effetti, per decorso del tempo previsto (distinto dall'Annullamento, che è una cessazione anticipata e dichiarata, `01-principi-mapping.md` §8).

**T05 — Intervallo.** Il pattern con cui si riconosce un periodo delimitato da una Decorrenza (T03) e, eventualmente, da una Scadenza (T04) — che può anche restare aperta, quando il documento logico non richiede di conoscere in anticipo la fine del periodo.

**T06 — Cronologia.** Il pattern con cui si riconosce la sequenza ordinata nel tempo di più fatti, eventi o versioni relativi alla stessa Entity, senza che questa sequenza costituisca ancora la Storia (T07) in senso proprio: la Cronologia è l'ordine, la Storia è anche il significato che quell'ordine racconta.

**T07 — Storia.** Il pattern con cui si riconosce l'insieme delle condizioni che sono state vere in momenti precedenti a quello corrente, conservate perché restano un fatto realmente avvenuto (coincide con la nozione già introdotta in `01-principi-mapping.md` §8). La Storia si costruisce a partire dalla Cronologia (T06), ma ne è distinta perché aggiunge il significato di "ciò che va conservato", non solo "ciò che è accaduto in un certo ordine".

**Distinzioni.** Validità (T01) risponde a "produce ancora effetti?"; Efficacia (T02) risponde a "da quando produce effetti?"; Decorrenza (T03) e Scadenza (T04) sono i due estremi di un Intervallo (T05); Cronologia (T06) è l'ordine dei fatti nel tempo; Storia (T07) è la conservazione motivata di quell'ordine. Un documento di mapping che confonda, per esempio, Decorrenza con Efficacia (trattando come identico "quando è stato dichiarato" e "da quando vale") introduce un'imprecisione che questo catalogo intende prevenire.

---

## 15. Pattern Visibilità

**VIS01 — Esistenza.** Il pattern più elementare: il fatto che un'Entity o un dato esista nel dominio, indipendentemente da chiunque possa vederlo. L'Esistenza è sempre indipendente dalla Pubblicazione (VIS04): un'Entity esiste dal momento della propria creazione, anche restando privata per sempre.

**VIS02 — Accessibilità.** Il pattern con cui si riconosce chi ha, in linea di principio, il diritto tecnico e organizzativo di raggiungere un'Entity o un dato, indipendentemente dal fatto che lo faccia o che il contenuto sia comprensibile o rilevante per lui. Coincide con l'asse di Stato di accesso (S05).

**VIS03 — Consultabilità.** Il pattern con cui si riconosce se, oltre a essere accessibile, un'Entity o un dato è effettivamente presentabile a chi lo consulta in un dato momento — per esempio perché il periodo di Validità (T01) non è scaduto, o perché il processo di Revisione (VR02) non ne ha sospeso temporaneamente la presentazione. La Consultabilità è sempre subordinata all'Accessibilità (VIS02): non si può consultare ciò a cui non si ha accesso, ma si può avere accesso a qualcosa che, in un momento specifico, non è consultabile.

**VIS04 — Pubblicazione.** Il pattern con cui il dominio proprietario decide, con un atto esplicito, di rendere un'Entity o un dato visibile a un pubblico più ampio di quello che vi accede per titolarità diretta. Coincide con l'asse di Stato di pubblicazione (S04) e con il pattern VR05 quando si applica a una Versione specifica.

**VIS05 — Indicizzazione.** Il pattern con cui si riconosce che un'Entity o un dato pubblicato (VIS04) viene reso reperibile tramite ricerca o navigazione strutturata, distinto dalla semplice Consultabilità (VIS03): un'Entity può essere pubblicata e consultabile da chi conosce già il riferimento diretto, senza essere ancora Indicizzata per la scoperta generale.

**VIS06 — Riservatezza.** Il pattern con cui si riconosce che un'Entity o un dato, per sua natura o per scelta del dominio proprietario, non è destinato alla Pubblicazione (VIS04) né all'Indicizzazione (VIS05), restando accessibile solo secondo le regole di Accessibilità (VIS02) stabilite dal dominio.

**Conferma del principio di governo.** Coerentemente con `01-principi-mapping.md` §14 e con quanto già stabilito in tutti gli 11 documenti logici (in particolare `identita-accessi.md`), il dominio proprietario di un'Entity o di un dato decide sempre la sua Pubblicazione (VIS04) e la sua Riservatezza (VIS06): stabilisce cioè *se* qualcosa debba essere visibile. Il dominio Identità & Accessi applica questa decisione traducendola in Accessibilità (VIS02) effettiva per i diversi soggetti che interagiscono con la piattaforma: decide *come* la decisione di visibilità già presa dal dominio proprietario si traduce concretamente per ciascun soggetto. Nessun documento di mapping può invertire questa responsabilità, attribuendo a Identità & Accessi la decisione sostanziale di cosa sia pubblico, o al dominio proprietario il compito di applicare tecnicamente l'accesso.

---

## 16. Catalogo dei Pattern

La tabella seguente organizza il catalogo per famiglia di pattern (§3-§15). All'interno di ciascuna famiglia, i singoli pattern (con il proprio codice, §17) sono già distinti nella sezione corrispondente: qui si fissa lo scopo, l'uso e le dipendenze a livello di famiglia, come riferimento rapido per chi redige un documento di mapping.

| Pattern (codici) | Scopo | Quando usarlo | Quando NON usarlo | Domini interessati | Dipendenze |
|---|---|---|---|---|---|
| **Aggregate** (A01-A04) | Riconoscere il concetto centrale di consistenza di un dominio e il suo confine | Per il concetto che dà origine a un dominio o a una porzione autonoma di esso, con proprie regole invarianti | Per un concetto privo di consistenza propria da proteggere o non referenziabile autonomamente (usare Entity, §4) | Tutti gli 11 domini, ciascuno con almeno un Aggregate Root | Nessuna dipendenza da altri pattern; è il punto di partenza di ogni mapping |
| **Entity** (E01-E04) | Distinguere le forme di un concetto con identità propria in base alla sua autonomia, dipendenza, condivisione e collocazione | Per ogni concetto con identità propria individuato nel documento logico che non sia esso stesso un Aggregate Root | Per un concetto privo di identità propria, interamente descritto dai suoi attributi (usare Value Object, §5) | Tutti gli 11 domini | Dipende dal pattern Aggregate per stabilire il confine (A02) entro cui un'Entity dipendente esiste |
| **Value Object** (VO01-VO03) | Rappresentare valori descrittivi privi di identità propria, incorporati o condivisi | Per attributi e valori che non richiedono di essere distinti come fatti autonomi anche a parità di contenuto | Quando due istanze con gli stessi attributi devono poter restare fatti distinti (usare Entity, §4) | Tutti gli 11 domini; VO03 in particolare per i domini che referenziano Tassonomie condivise (§12) | VO03 dipende dal pattern Classificazione (C02, Tassonomia) |
| **Relazione** (R01-R08) | Qualificare la natura di un legame tra due concetti secondo la sua forza, durata e specializzazione | Ogni volta che un documento logico lega due Entity o Aggregate distinti | Quando il legame descrive in realtà il confine interno di uno stesso Aggregate (usare R01, non un pattern di relazione tra Aggregate distinti) | Tutti gli 11 domini; R06/R07/R08 principalmente Appartenenze, Identità & Accessi, Imprese | Dipende dai pattern Aggregate ed Entity per identificare le parti della relazione; R04 dipende dal pattern Temporalità (T07, Storia) |
| **Stato** (S01-S08) | Mantenere distinti gli assi indipendenti del ciclo di vita di un'Entity | Ogni volta che il documento logico ha modellato più di una dimensione di stato per la stessa Entity | Per un'Entity il cui documento logico dichiara esplicitamente un unico stato semplice, senza altre dimensioni | Tutti gli 11 domini, con combinazioni diverse di assi per dominio | S03 dipende dal pattern Verifica; S04 dipende dal pattern Visibilità (VIS04) e dal pattern Versione (VR05) |
| **Verifica** (V01-V05) | Registrare controlli specifici, la loro evidenza, la loro fonte e il loro esito, senza produrre un giudizio unico | Ogni volta che il documento logico modella un controllo su un aspetto dichiarato | Per introdurre un giudizio complessivo unico di "verificato" non riferito a un aspetto specifico (vietato, §8, §10) | Appartenenze, Imprese, Mercati Internazionali, Professionisti, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi | Dipende dal pattern Documento (DOC03) quando l'Evidenza ha natura documentale |
| **Versione** (VR01-VR06) | Gestire la successione redazionale di un contenuto o di un fatto dichiarato nel tempo | Per contenuti o dichiarazioni soggetti a redazione, revisione e ripubblicazione | Per fatti che non hanno mai più di una redazione valida nel tempo (nessuna necessità di distinguere versioni) | Contenuti editoriali principalmente; Professionisti, Imprese, Persone per le proprie dichiarazioni redatte | VR05 dipende dal pattern Visibilità (VIS04) e dal pattern Stato (S04) |
| **Evento** (EV01-EV04) | Rendere riconoscibili i fatti già avvenuti che un dominio produce, e la loro eventuale rilevanza per altri domini | Per ogni fatto rilevante già elencato nella sezione "Eventi di dominio" di un documento logico | Per rappresentare un comando, un'intenzione o una richiesta non ancora avvenuta (non è un Evento) | Tutti gli 11 domini | Dipende dai pattern Aggregate/Entity per identificare chi genera l'evento; EV04 dipende dal pattern Temporalità (T07) |
| **Dato** (D01-D09) | Distinguere la provenienza e la natura di un'informazione lungo la sua trasformazione da sorgente a derivata | Per ogni informazione trattata da un documento di mapping, per chiarirne l'origine | Per confondere un dato derivato con un dato sorgente, presentandolo come se non avesse una provenienza calcolata | Tutti gli 11 domini; D05/D06 principalmente Osservatorio | D03 dipende dal pattern Verifica; D05/D06 dipendono dal pattern Relazione derivata (R05) |
| **Classificazione** (C01-C06) | Organizzare valori descrittivi condivisi o specifici di un dominio in insiemi coerenti | Per attributi che richiedono di essere confrontati, filtrati o aggregati tra più istanze o più domini | Per un valore puramente descrittivo e non comparabile, privo di necessità di governo condiviso (usare VO01) | Tutti gli 11 domini; C02 in particolare per la Tassonomia condivisa (lingua, competenza, settore, territorio) | Nessuna dipendenza da altri pattern; è referenziata da Value Object (VO03) |
| **Documento** (DOC01-DOC05) | Riconoscere contenuti informativi autonomi o accessori che sostengono o accompagnano un fatto di dominio | Per certificati, titoli, comunicazioni o altri contenuti che il documento logico tratta come fatti a sé | Per un attributo descrittivo semplice privo di natura documentale (usare Attributo descrittivo, C06) | Imprese, Appartenenze, Professionisti, Eventi, Contenuti editoriali | DOC03 dipende dal pattern Verifica (V02, Evidenza) |
| **Temporalità** (T01-T07) | Distinguere validità, efficacia, decorrenza, scadenza, intervallo, cronologia e storia di un fatto | Ogni volta che un fatto ha una dimensione temporale rilevante per il dominio | Per un fatto istantaneo e privo di durata, per cui nessuna di queste distinzioni ha significato | Tutti gli 11 domini | T07 è la base del pattern Relazione storica (R04) e del pattern Stato storico (S08) |
| **Visibilità** (VIS01-VIS06) | Distinguere esistenza, accessibilità, consultabilità, pubblicazione, indicizzazione e riservatezza di un'Entity o di un dato | Ogni volta che un documento logico distingue chi può vedere un fatto da chi ne è semplicemente proprietario | Per confondere l'esistenza di un dato con la sua visibilità pubblica (le due cose sono sempre indipendenti) | Tutti gli 11 domini per la decisione di visibilità; Identità & Accessi per la sua applicazione | VIS04 dipende dal pattern Stato (S04) e dal pattern Versione (VR05) |

**Uso del catalogo.** Ogni riga di questa tabella è un punto di partenza, non un vincolo esaustivo: i dettagli operativi di ciascun pattern restano nella sezione dedicata (§3-§15), a cui la tabella rimanda tramite i codici. Un documento di mapping deve consultare sia la tabella (per un orientamento rapido) sia la sezione di dettaglio (per applicare correttamente il pattern scelto).

---

## 17. Regole di utilizzo

**Identificatori stabili.** Ogni pattern di questo catalogo ha un codice stabile, composto da un prefisso di famiglia e un numero a due cifre: **A** (Aggregate, A01-A04), **E** (Entity, E01-E04), **VO** (Value Object, VO01-VO03), **R** (Relazione, R01-R08), **S** (Stato, S01-S08), **V** (Verifica, V01-V05), **VR** (Versione, VR01-VR06), **EV** (Evento, EV01-EV04), **D** (Dato, D01-D09), **C** (Classificazione, C01-C06), **DOC** (Documento, DOC01-DOC05), **T** (Temporalità, T01-T07), **VIS** (Visibilità, VIS01-VIS06). Questi codici sono **concettuali**: identificano un pattern in questo catalogo per permettere ai documenti di mapping di citarlo senza ripeterne la definizione. Non sono, e non devono mai diventare, identificatori tecnici: non corrispondono a nomi di tabelle, tipi, colonne, valori di enumerazione o costanti applicative. Un documento di mapping può cambiare completamente il modo in cui un pattern viene tradotto tecnicamente, senza che questo richieda di cambiare il codice del pattern in questo catalogo.

**Come i documenti di mapping devono riferirsi ai pattern.** Ogni futuro documento di mapping per singolo dominio — tipicamente collocato secondo lo schema `domain-mapping/persone.md`, `domain-mapping/imprese.md`, `domain-mapping/appartenenze.md`, `domain-mapping/professionisti.md`, `domain-mapping/mercati-internazionali.md`, `domain-mapping/opportunita.md`, `domain-mapping/collaborazioni.md`, `domain-mapping/eventi.md`, `domain-mapping/contenuti-editoriali.md`, `domain-mapping/osservatorio.md`, `domain-mapping/identita-accessi.md` — deve rispettare le seguenti regole:

1. Per ogni Aggregate Root, Entity, Value Object, relazione, asse di stato, verifica, versione, evento, dato, classificazione, documento, elemento temporale o aspetto di visibilità trattato, il documento di mapping deve indicare esplicitamente il codice del pattern di questo catalogo applicato (per esempio: "la Persona è trattata come A01"; "la CompetenzaDichiarata è trattata come E02"; "l'Appartenenza conclusa applica R04 e R07 insieme").
2. Se un concetto del dominio richiede la combinazione di più pattern (come accade spesso, §2), il documento di mapping deve elencare tutti i codici applicabili, non scegliere arbitrariamente un solo pattern quando più di uno è pertinente.
3. Se un concetto del dominio non trova corrispondenza in alcun pattern di questo catalogo, il documento di mapping non può inventarne uno proprio: deve segnalarlo esplicitamente come proposta di estensione del Reference Model, da trattare separatamente (§2, regola 1).
4. Il documento di mapping non deve mai ridefinire il significato di un pattern citato: se un dominio ha bisogno di una variante, deve applicare il pattern specializzato più vicino già presente nel catalogo (§2, "Pattern specializzato") o proporne uno nuovo, non alterare silenziosamente il significato di un pattern esistente.
5. I codici restano stabili nel tempo: se in futuro un pattern viene ulteriormente specializzato o arricchito, il codice esistente non cambia significato per i documenti di mapping che lo hanno già citato; un nuovo pattern specializzato riceve un proprio nuovo codice all'interno della stessa famiglia.

---

## 18. Decisioni consolidate

1. **Il Reference Model è unico e condiviso.** Esiste un solo catalogo di pattern per l'intera piattaforma; nessun documento di mapping può mantenere un proprio catalogo parallelo o alternativo.
2. **I pattern sono concettuali, non tecnici.** Nessun pattern di questo catalogo implica una tecnologia, una struttura dati o un'implementazione specifica; i codici (§17) sono identificatori concettuali, non tecnici.
3. **Il catalogo si estrae dal logico, non si impone al logico.** Ogni pattern qui definito è stato riconosciuto a partire da forme già ricorrenti nei documenti logici esistenti (§1); il Reference Model non introduce concetti che i documenti logici non abbiano già, in qualche forma, modellato.
4. **Un pattern obbligatorio non è opzionale.** Il pattern degli assi indipendenti (§7) e il pattern della verifica multidimensionale (§8) sono obbligatori per costruzione: nessun documento di mapping può comprimerli per semplicità.
5. **La combinazione di pattern è la norma, non l'eccezione.** La maggior parte dei concetti di dominio richiede più di un pattern applicato insieme (per esempio Entity + Relazione + Stato + Verifica per la stessa Appartenenza); il catalogo è costruito per essere composto, non scelto in alternativa.
6. **Nessuna duplicazione di pattern con significato diverso.** Quando due domini presentano lo stesso problema di rappresentazione, devono applicare lo stesso pattern di questo catalogo, non due soluzioni concettualmente equivalenti ma nominate diversamente.
7. **Il catalogo cresce solo per estensione consapevole.** Un nuovo pattern, o una nuova specializzazione, si aggiunge a questo documento solo quando un documento di mapping dimostra che nessun pattern esistente è applicabile; non si aggiunge per comodità isolata di un singolo dominio.
8. **La convergenza terminologica tra famiglie è intenzionale.** La nozione di "pubblicazione" ricorre nei pattern S04, VR05 e VIS04 perché è, per sua natura, la stessa idea applicata a livelli diversi (asse di stato, versione specifica, visibilità generale): questa convergenza non è una ridondanza da eliminare, ma la conferma che il catalogo è internamente coerente.
9. **Identità & Accessi applica, non decide, la visibilità sostanziale.** Coerentemente con `01-principi-mapping.md` §14, i pattern di Visibilità (§15) confermano che ogni decisione su cosa sia pubblico o riservato resta del dominio proprietario; solo la sua applicazione concreta per soggetto è di competenza di Identità & Accessi.
10. **Il catalogo è vincolante in modo uniforme per tutti gli 11 domini.** Nessun dominio può dichiararsi esente dall'uso di questo catalogo o dall'obbligo di citarne i codici nel proprio documento di mapping (§17).

---

## 19. Checklist finale

Verifica finale del presente documento, condotta prima della sua chiusura:

| # | Verifica | Esito |
|---|---|---|
| 1 | Nessun SQL presente | Verificato — nessuna istruzione SQL; i riferimenti a "SQL" e "`CREATE TABLE`" compaiono solo nella nota introduttiva, come cosa il documento esplicitamente esclude |
| 2 | Nessun database descritto | Verificato — non è definita alcuna tabella, colonna, indice, schema o motore di database |
| 3 | Nessuna implementazione descritta | Verificato — ogni sezione descrive esclusivamente pattern concettuali, criteri di scelta e definizioni, mai passi realizzativi |
| 4 | Nessuna tecnologia nominata come scelta di progetto | Verificato — PostgreSQL e Supabase compaiono una sola volta (nota introduttiva) solo per dichiarare cosa il documento esclude |
| 5 | Nessuna API descritta | Verificato — nessuna interfaccia, endpoint o contratto applicativo è trattato |
| 6 | Piena coerenza con `01-principi-mapping.md` | Verificato — ogni famiglia di pattern richiama esplicitamente i principi corrispondenti già definiti (Aggregate §3, Entity §4, Value Object §5, Identità §6, Relazioni §7, Storicizzazione §8, Stati §9, Verifiche §10, Versioni §11, Eventi §12, Dati derivati §13, Dipendenze §14) senza contraddirli né sostituirli |
| 7 | Piena coerenza con `docs/domain-model.md` | Verificato — i richiami agli Aggregate Root, alle regole di proprietà dei fatti e alla tassonomia di stati/verifiche sono coerenti con quanto sintetizzato nei rispettivi paragrafi (§2-§10, §12-§13) |
| 8 | Nessuna contraddizione con `reconciliation-report.md` | Verificato — i riferimenti alla matrice di responsabilità (§3.2), alla tassonomia delle verifiche (§9.1-§9.2) e al pattern Fonte/Verifica come pattern locale non condiviso sono ripresi senza alterazioni |
| 9 | Nessuna contraddizione con gli 11 domini logici | Verificato — ogni pattern è stato estratto da forme già presenti in almeno uno dei documenti logici, citate a titolo di esempio concettuale, non di nuova regola di dominio |

---

## Riepilogo

**Pattern definiti.** Il documento cataloga 13 famiglie di pattern, per un totale di 75 pattern concettuali con codice stabile: Aggregate (A01-A04), Entity (E01-E04), Value Object (VO01-VO03), Relazione (R01-R08), Stato (S01-S08), Verifica (V01-V05), Versione (VR01-VR06), Evento (EV01-EV04), Dato (D01-D09), Classificazione (C01-C06), Documento (DOC01-DOC05), Temporalità (T01-T07), Visibilità (VIS01-VIS06). Ogni pattern è definito senza riferimento a tecnologie, con criteri espliciti di quando applicarlo.

**Cataloghi creati.** Il Catalogo dei Pattern (§16) organizza le 13 famiglie in un'unica tabella di riferimento rapido (Pattern, Scopo, Quando usarlo, Quando NON usarlo, Domini interessati, Dipendenze), pensata per essere consultata da ciascuno degli 11 futuri documenti di mapping insieme al dettaglio delle sezioni §3-§15.

**Decisioni consolidate.** Sono state consolidate dieci decisioni (§18): dall'unicità del catalogo, alla natura puramente concettuale dei codici, all'obbligatorietà di alcuni pattern (assi indipendenti, verifica multidimensionale), alla convenzione che la combinazione di più pattern per lo stesso concetto è la norma, fino al principio che Identità & Accessi applica ma non decide la visibilità sostanziale.

**Punti rinviati ai documenti successivi.** Restano deliberatamente non trattati in questo documento:
- l'applicazione puntuale, dominio per dominio, di quali pattern si combinano per ciascuna Entity, relazione o dato specifico (il catalogo offre le opzioni; la scelta per ciascun dominio è compito del relativo documento di mapping, secondo le regole del §17);
- l'eventuale introduzione di nuovi pattern o nuove specializzazioni che emergessero durante la redazione dei documenti di mapping, da trattare come estensione consapevole del catalogo (§2, regola 1; §18, decisione 7), non come contenuto di questo documento;
- ogni dettaglio tecnico di rappresentazione dei pattern, che appartiene esclusivamente ai documenti di mapping per singolo dominio e, in seguito, ai piani di migrazione;
- la risoluzione dei concetti ancora privi di un dominio proprietario dedicato già segnalati in `reconciliation-report.md` ("Servizi", "Organizzazioni istituzionali"), che restano questioni di modellazione logica, estranee al Reference Model.

Il documento è pronto per essere usato, insieme a `01-principi-mapping.md`, come riferimento vincolante da ciascuno degli 11 futuri documenti di mapping fisico per dominio.
