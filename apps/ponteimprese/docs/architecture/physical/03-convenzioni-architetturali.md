# Convenzioni architetturali trasversali

> Livello architetturale. Questo documento definisce convenzioni, non tecnologia. Non contiene SQL, non descrive PostgreSQL o Supabase, non contiene API, non contiene codice, non contiene schema fisico, e non è il mapping di alcun dominio specifico. Le convenzioni qui definite sono vincolanti per tutti i futuri documenti in `docs/architecture/physical/domain-mapping/`.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/physical/01-principi-mapping.md`](01-principi-mapping.md), [`docs/architecture/physical/02-reference-model.md`](02-reference-model.md), tutti i documenti in [`docs/architecture/logical/`](../logical/), incluso [`docs/architecture/logical/reconciliation-report.md`](../logical/reconciliation-report.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: principi di mapping (`01`) → Reference Model (`02`) → **convenzioni architetturali (questo documento)** → mapping fisico per singolo dominio → piano di migrazione → migrazioni. Questo documento non ripete i principi né i pattern già definiti: spiega come applicarli in modo uniforme, decidibile e verificabile.

---

## Indice

1. [Obiettivo](#1-obiettivo)
2. [Uniformità tra domini](#2-uniformità-tra-domini)
3. [Criteri di decomposizione](#3-criteri-di-decomposizione)
4. [Criteri di riuso](#4-criteri-di-riuso)
5. [Convenzioni sulle relazioni](#5-convenzioni-sulle-relazioni)
6. [Convenzioni sugli stati](#6-convenzioni-sugli-stati)
7. [Convenzioni sulle verifiche](#7-convenzioni-sulle-verifiche)
8. [Convenzioni sulla storicizzazione](#8-convenzioni-sulla-storicizzazione)
9. [Convenzioni sui dati derivati](#9-convenzioni-sui-dati-derivati)
10. [Convenzioni sulle dipendenze](#10-convenzioni-sulle-dipendenze)
11. [Convenzioni sull'estensibilità](#11-convenzioni-sullestensibilità)
12. [Convenzioni sulla documentazione](#12-convenzioni-sulla-documentazione)
13. [Regole obbligatorie](#13-regole-obbligatorie)
14. [Anti-pattern](#14-anti-pattern)
15. [Checklist finale](#15-checklist-finale)

---

## 1. Obiettivo

**Ruolo delle convenzioni architetturali.** I principi (`01-principi-mapping.md`) stabiliscono *perché* il mapping deve comportarsi in un certo modo: sono poche regole generali, di validità permanente, che nessun documento di mapping può violare. Il Reference Model (`02-reference-model.md`) stabilisce *quali* soluzioni concettuali sono disponibili: un catalogo di pattern nominati, tra cui un documento di mapping può scegliere. Questo documento stabilisce *come* si sceglie, tra le soluzioni disponibili, quella corretta per un caso concreto, e *come* questa scelta va documentata perché sia verificabile e confrontabile con le scelte fatte per gli altri dieci domini. Senza questo terzo livello, principi e pattern lascerebbero un margine di discrezionalità troppo ampio: due redattori diversi, di fronte allo stesso tipo di problema, potrebbero applicare correttamente sia i principi sia i pattern e arrivare comunque a documenti non confrontabili tra loro.

**Differenza tra principi, pattern e convenzioni.** Un principio è una regola di validità: non ammette eccezioni non motivate e non descrive una forma concreta (per esempio: "nessun dominio duplica fatti altrui"). Un pattern è una forma concettuale nominata e riutilizzabile, disponibile per essere scelta (per esempio: "Relazione storica, R04"). Una convenzione è la regola operativa che governa la scelta e la disciplina redazionale: dice quando scegliere un pattern piuttosto che un altro, come motivare un'eccezione, come documentare una decisione in modo che sia riconoscibile e ripetibile. I principi sono pochi e stabili; i pattern sono un catalogo che può crescere per estensione consapevole (`02` §2, §18 decisione 7); le convenzioni sono la procedura che rende l'uso di principi e pattern uniforme nel tempo e tra domini diversi.

**Perché le convenzioni garantiscono uniformità.** Un principio dice cosa non è ammesso; un pattern dice cosa è disponibile; nessuno dei due, da solo, dice cosa fare quando più soluzioni sarebbero astrattamente compatibili con entrambi. È qui che nasce il rischio di divergenza: due domini con lo stesso tipo di problema (per esempio, una relazione che cessa ma resta storicamente rilevante) potrebbero scegliere pattern diversi, documentarli con livelli di dettaglio diversi, o motivare le proprie eccezioni in modo diverso — pur restando entrambi, singolarmente, "corretti". Le convenzioni chiudono questo margine: impongono una procedura decisionale comune (§3-§11), un formato comune di documentazione (§12) e un insieme di regole verificabili (§13) che permettono di confrontare, alla fine, gli 11 documenti di mapping come se fossero stati scritti da un solo autore.

---

## 2. Uniformità tra domini

**La stessa decisione produce sempre la stessa rappresentazione.** Se due domini logici presentano un problema di rappresentazione della stessa natura — non lo stesso fatto di business, ma lo stesso *tipo* di problema (per esempio: "questa relazione può cessare ma deve restare consultabile", presente sia in Appartenenze sia in Mercati Internazionali) — i due documenti di mapping devono risolverlo applicando lo stesso pattern (stesso codice) e descrivendolo con lo stesso livello di dettaglio. Questa non è un'uniformità imposta dall'esterno: è la conseguenza diretta del fatto che il Reference Model (`02`) è unico e condiviso (`02` §18, decisione 1). Una divergenza in questo caso non è una libertà legittima del dominio: è un segnale che uno dei due documenti ha applicato il catalogo in modo scorretto, oppure che esiste una differenza di dominio non ancora dichiarata.

**Le eccezioni devono essere motivate.** Un documento di mapping può legittimamente discostarsi dalla soluzione altrimenti uniforme solo quando il proprio documento logico dichiara esplicitamente una condizione che il pattern generale non prevede. In questo caso l'eccezione va sempre documentata in tre parti: (a) qual è la soluzione uniforme che ci si aspetterebbe; (b) qual è la condizione specifica, dichiarata nel documento logico, che la rende inadeguata; (c) quale soluzione alternativa si applica invece, e con quale pattern (specializzato o combinato) la si esprime. Un'eccezione priva di questa motivazione in tre parti non è un'eccezione: è un'incoerenza da correggere.

**Evitare soluzioni speciali quando non necessarie.** Prima di introdurre qualunque soluzione non prevista dal catalogo (`02`), un documento di mapping deve poter dimostrare di aver verificato, in ordine: se un singolo pattern esistente risolve il problema; se una combinazione di più pattern esistenti lo risolve; se un'estensione di un pattern esistente (`02` §2, "Estensione di un pattern") lo risolve senza alterarne il significato. Solo se nessuna di queste tre verifiche ha esito positivo la soluzione speciale è ammessa, e in tal caso va sempre proposta come estensione consapevole del Reference Model (`02` §18, decisione 7), non introdotta silenziosamente nel solo documento di mapping del singolo dominio.

**Procedura minima di verifica dell'uniformità.** Prima di considerare concluso un documento di mapping, il suo redattore deve poter rispondere positivamente a tre domande: (1) per ogni concetto trattato, esiste un altro dominio con un problema di rappresentazione dello stesso tipo, e se sì, la soluzione applicata coincide? (2) ogni eventuale divergenza è documentata secondo lo schema in tre parti sopra descritto? (3) nessuna soluzione speciale è stata introdotta senza aver prima verificato le tre alternative previste? Questa procedura non sostituisce la revisione incrociata tra documenti di mapping, ma è la condizione minima perché quella revisione sia possibile.

---

## 3. Criteri di decomposizione

Questa sezione non ripete i criteri già stabiliti in `01` §3-§5 e in `02` §3-§5, §11-§12: stabilisce l'ordine in cui vanno applicati e come risolvere i casi in cui più esiti sembrano plausibili.

**Procedura decisionale, in ordine.** Per ogni concetto individuato in un documento logico, il documento di mapping deve porsi le seguenti domande, nell'ordine indicato, fermandosi alla prima a cui risponde positivamente:

1. *È già l'Aggregate Root del dominio, secondo il documento logico?* Se sì, si applica il pattern A01 (`02` §3) e la decomposizione si ferma qui: non esiste un livello "più alto" da valutare.
2. *Ha bisogno di essere referenziato individualmente da altri concetti, dello stesso dominio o di un altro?* Se sì, resta un'Entity (§4 di `01`, §4 di `02`): la decomposizione prosegue solo per stabilire se è autonoma, dipendente, condivisa o interna (E01-E04).
3. *È interamente descritto dai propri attributi, senza che due istanze con gli stessi attributi possano essere, per il dominio, due fatti diversi?* Se sì, resta un Value Object (§5 di `01`, §5 di `02`): la decomposizione prosegue solo per stabilire se incorporato, condiviso o riutilizzato da catalogo (VO01-VO03).
4. *Rappresenta un insieme di alternative usato per confrontare, filtrare o aggregare più istanze diverse, senza essere esso stesso un fatto dichiarato?* Se sì, è una Classificazione (`02` §12): resta da stabilire quale delle sue forme (C01-C06).
5. *È ottenuto elaborando altri dati già esistenti, senza essere mai stato dichiarato o osservato direttamente?* Se sì, è un Dato derivato (`01` §13, `02` §11): resta da stabilire quale delle sue forme (D04-D06).

Se un concetto risponde positivamente a più di una domanda contemporaneamente (per esempio è insieme un'Entity con identità propria e, per un altro aspetto, un dato calcolato), la decomposizione si applica separatamente ai due aspetti: non si forza un'unica risposta, si documentano entrambe.

**Criterio di scelta tra "resta incorporato" e "viene separato".** Applicando i cinque criteri già stabiliti in `01` §4 (cardinalità, indipendenza del ciclo di vita, necessità di referenziabilità esterna, necessità di storicizzazione propria, frequenza di variazione), la convenzione impone una regola di priorità quando i criteri danno indicazioni contrastanti: la necessità di referenziabilità esterna da parte di un altro dominio prevale sempre sugli altri quattro criteri, perché un concetto che un altro dominio deve poter referenziare individualmente non può restare incorporato, indipendentemente da quanto sia semplice o stabile.

**Criterio di scelta per "diventa dominio autonomo".** La convenzione stabilisce che nessun documento di mapping può, di propria iniziativa, proporre un nuovo dominio autonomo (un nuovo Aggregate Root non già individuato in nessuno degli 11 documenti logici): l'inventario dei domini è chiuso dalla riconciliazione logica (`reconciliation-report.md`, Parte 1) e si estende solo attraverso un nuovo documento logico sottoposto allo stesso processo di riconciliazione (§11 di questo documento). Un documento di mapping che sospetti la necessità di un nuovo dominio autonomo deve segnalarlo come questione aperta, non introdurlo.

**Criterio di scelta per "è semplice classificazione" vs. "è dato derivato".** La linea di demarcazione è la presenza o assenza di un calcolo: se il valore è scelto da un insieme predefinito di alternative (anche ampio) senza che nessuna elaborazione lo produca, è una Classificazione; se il valore è il risultato di un'elaborazione su altri dati, anche se l'insieme dei risultati possibili è limitato, è un Dato derivato. La convenzione impone di verificare sempre questa distinzione con la domanda: "questo valore esisterebbe anche se nessuno lo calcolasse, come una delle alternative già disponibili?" — se sì, Classificazione; se no, Dato derivato.

**Documentazione della decomposizione.** Ogni documento di mapping deve rendere esplicita, per ciascun concetto trattato, la sequenza di domande della procedura sopra e la risposta che ha determinato la decomposizione scelta: non è sufficiente indicare il risultato finale (per esempio "E02"), va indicato anche perché le domande precedenti nella sequenza hanno avuto risposta negativa.

---

## 4. Criteri di riuso

**Riuso corretto.** Si ha riuso corretto quando un documento di mapping applica a un proprio concetto un pattern del catalogo (`02`) con lo stesso codice e lo stesso significato con cui è già applicato altrove, perché il problema di rappresentazione è genuinamente dello stesso tipo. Il riuso corretto è sempre dichiarato esplicitamente: il documento cita il codice del pattern, non si limita a produrre una soluzione che "sembra" simile a un'altra già vista altrove.

**Copia.** Si ha copia quando un documento di mapping riproduce una soluzione già usata per un concetto diverso, ottenendo un risultato equivalente, ma senza dichiarare che si tratta dello stesso pattern (nessuna citazione del codice comune). La copia è pericolosa non perché il risultato sia sbagliato, ma perché rompe la tracciabilità: chi legge i due documenti non può sapere se le due soluzioni siano "la stessa cosa applicata due volte" o "due soluzioni diverse che per caso si assomigliano", e quindi non può prevedere se un cambiamento futuro al pattern dovrà propagarsi a entrambe. La convenzione impone che ogni copia apparente venga sempre convertita in un riuso dichiarato, citando il codice comune.

**Duplicazione.** Si ha duplicazione quando non è una soluzione concettuale a essere ripetuta, ma lo stesso fatto di dominio a essere registrato in più di un punto senza che si tratti di un caso legittimo di dato derivato (`02` §11, D04-D06) o di storicizzazione (`02` §6 R04, §14 T07). La duplicazione non è una forma di riuso: è una violazione del principio "nessun dominio duplica fatti altrui" (`01` §2, principio 2) e va sempre trattata come anti-pattern (§14), non come una scelta di convenzione.

**Specializzazione.** Coerentemente con `02` §2, una specializzazione introduce un pattern nuovo (con un proprio codice, nella stessa famiglia del pattern generale da cui deriva) per una condizione che il pattern generale non distingue a sufficienza, e che ricorre in più di un dominio. La convenzione per decidere se proporre una specializzazione, invece di una semplice estensione (sotto), è la ricorrenza: se la condizione si presenta o è plausibile che si presenti in più di un dominio, merita un codice proprio nel catalogo (da proporre secondo `02` §18, decisione 7); se è isolata a un solo dominio, resta un'estensione.

**Estensione.** Coerentemente con `02` §2, un'estensione applica un pattern esistente a un concetto locale aggiungendo le condizioni specifiche del dominio, senza introdurre un nuovo codice e senza alterare il significato generale del pattern. La convenzione impone che un'estensione resti sempre descritta come "pattern X applicato con la condizione specifica Y del dominio Z", non come un concetto autonomo con un proprio nome: se iniziasse a essere citata senza più menzionare il pattern generale da cui deriva, l'estensione si sarebbe silenziosamente trasformata in una copia (sopra) o in un'invenzione non catalogata (§14).

**Regola di verifica.** Davanti a due soluzioni che sembrano simili in documenti di mapping diversi, la domanda che stabilisce se si tratti di riuso corretto, copia, duplicazione, specializzazione o estensione è sempre la stessa: qual è il pattern generale citato da entrambe? Se nessuno dei due lo cita, non c'è riuso, solo una somiglianza non dichiarata da correggere.

---

## 5. Convenzioni sulle relazioni

Questa sezione stabilisce quale pattern del catalogo Relazione (`02` §6, R01-R08) si applica di default a ciascuna delle sette forme richiamate qui, e la convenzione per non applicarlo per errore a un caso diverso.

**Relazioni permanenti.** Sono relazioni per cui il documento logico non dichiara alcuna condizione di conclusione naturale. Convenzione: si applica R01 (se il legame definisce il confine di un Aggregate) o R02 (se lega due Aggregate autonomi in un contesto specifico), senza applicare R03. La permanenza non va mai assunta per default dal documento di mapping: va verificata esplicitamente nel documento logico; in assenza di conferma esplicita, la relazione va trattata come temporanea fino a prova contraria.

**Relazioni temporanee.** Si applica R03. Convenzione: il documento di mapping deve sempre dichiarare esplicitamente una delle tre conclusioni possibili già previste in `01` §7 — si conclude senza lasciare traccia oltre la storicizzazione ordinaria, lascia una traccia storica esplicita (R04), oppure si trasforma in un'altra relazione — mai lasciarla implicita.

**Relazioni storiche.** Si applica R04, sempre come qualità aggiunta a un altro pattern di relazione (R01, R02, R03, R06, R07 o R08) quando questo si conclude, non come pattern isolato. Convenzione: ogni relazione per cui il documento logico richiede continuità dopo la conclusione deve dichiarare esplicitamente R04 insieme al pattern di base, non sostituirlo.

**Relazioni contestuali.** Si applica R02. Convenzione: da usare quando le due parti restano autonome e il legame aggiunge un significato valido solo in un contesto specifico, senza costituire un vincolo organizzativo stabile; se il legame implica invece un vincolo organizzativo (appartenenza, proprietà, incarico), va valutato R07, non R02.

**Relazioni di rappresentanza.** Si applica R06. Convenzione: un documento di mapping non può presumere che una Relazione di appartenenza (R07) implichi automaticamente una Relazione di rappresentanza: le due vanno sempre verificate e documentate separatamente, anche quando coinvolgono le stesse due parti.

**Relazioni di delega.** Si applica R08. Convenzione: la Delega non equivale mai a una Rappresentanza (R06) sostanziale né a un'Appartenenza (R07): il documento di mapping deve sempre indicare esplicitamente il potere specifico delegato, non trattarla come un trasferimento generico di titolarità.

**Relazioni di appartenenza.** Si applica R07. Convenzione: va sempre trattata come relazione autonoma appartenente al dominio Appartenenze (Aggregate proprio secondo il documento logico corrispondente), mai incorporata come attributo del dominio Persone o del dominio Imprese, anche quando il documento di mapping di questi ultimi due domini ha bisogno di referenziarla.

**Ogni relazione mantiene un dominio proprietario.** Per ciascuna relazione trattata, il documento di mapping del dominio che il documento logico ha individuato come proprietario (`reconciliation-report.md` §3.2) deve essere l'unico a descriverne la struttura e le regole; ogni altro documento di mapping che partecipa alla stessa relazione come controparte deve limitarsi a dichiararla come "relazione referenziata", indicando esplicitamente il documento di mapping proprietario a cui rimanda, senza ridescriverne le regole.

---

## 6. Convenzioni sugli stati

**Come applicare gli assi indipendenti.** Per ciascuna Entity trattata, il documento di mapping deve percorrere gli otto assi già catalogati (`02` §7, S01-S08) e dichiarare, per ciascuno, se si applica o no secondo quanto stabilito nel documento logico del dominio. Un asse non menzionato non è un'omissione accettabile: deve essere dichiarato esplicitamente come "non applicabile a questa Entity", con una motivazione breve, altrimenti resta un dubbio se sia stato semplicemente dimenticato.

**Quando introdurre un nuovo asse.** Solo quando, percorsi tutti gli otto assi esistenti, il documento logico del dominio individua esplicitamente una dimensione di stato che non coincide con nessuna delle otto domande già catalogate (`02` §7). Prima di introdurlo, la convenzione impone di verificare che non sia in realtà una combinazione di due assi esistenti letta come se fosse una sola dimensione (per esempio, "stato di pubblicazione riservata" non è un nuovo asse: è la combinazione di S04 e VIS06/S06, da tenere distinta, non da fondere in una nuova etichetta). Solo se questa verifica esclude una combinazione, il nuovo asse va proposto come estensione del Reference Model (`02` §18, decisione 7), non introdotto silenziosamente nel solo documento di mapping.

**Quando riutilizzare un asse esistente.** Ogni volta che la domanda posta dal caso concreto coincide, nella sua natura, con una delle otto domande già catalogate — anche se i valori concreti che l'asse assume in quel dominio sono diversi da quelli di altri domini (per esempio S01, Stato sostanziale, assume valori diversi per un'Impresa attiva/cessata e per un Evento programmato/in corso/concluso, ma resta lo stesso asse concettuale: "qual è la condizione operativa di fatto"). La convenzione impone di verificare la natura della domanda, non il nome dei valori, prima di concludere che serva un asse nuovo.

**Quando evitare la proliferazione degli stati.** Se, per una singola Entity, sembrano necessari più assi indipendenti applicati simultaneamente di quanti già catalogati (otto), la convenzione impone di trattarlo come un segnale d'allarme, non come una richiesta legittima di estensione: nella maggior parte dei casi, questo segnale indica che due o più "assi" proposti sono in realtà lo stesso asse osservato da due prospettive diverse, oppure che l'Entity dovrebbe essere scomposta in più Entity distinte (§3 di questo documento) prima di continuare ad aggiungere dimensioni di stato alla stessa Entity. Un documento di mapping che si trovi in questa condizione deve prima ripetere la procedura di decomposizione del §3, e solo se essa confermi che l'Entity resta unica, procedere con la proposta di estensione motivata.

---

## 7. Convenzioni sulle verifiche

**Come aggiungere nuove verifiche.** Una nuova Verifica (`02` §8, V01) va aggiunta a un documento di mapping solo se il proprio aspetto verificato è già presente nella tassonomia consolidata (`reconciliation-report.md` §9.1, 15 tipi) o ne costituisce una specializzazione evidente dello stesso aspetto applicata al dominio specifico. Se il documento logico del dominio individua un aspetto verificato che non trova corrispondenza in nessuno dei 15 tipi censiti, la convenzione impone di segnalarlo esplicitamente come proposta di estensione della tassonomia, non di aggiungerlo come voce isolata solo nel proprio documento di mapping.

**Come evitare badge generici.** Ogni Verifica documentata deve sempre nominare l'aspetto verificato nello stesso punto in cui la si menziona: è vietata qualunque formulazione che si limiti a dire che un'Entity o un fatto "è verificato" senza qualificare l'aspetto. La convenzione operativa è una regola di stile obbligatoria, non solo un principio: qualunque frase del tipo "l'Entity X è verificata" deve essere riscritta come "l'aspetto Y dell'Entity X è verificato (V01), con esito Z (V04)".

**Come distinguere verifica, evidenza e fonte.** Applicare sempre la tripla V01/V02/V03 (`02` §8) come tre voci separate nella documentazione, anche quando nella pratica del dominio sembrano fondersi in un solo passaggio: la Fonte (V03) è dichiarata prima, come origine dell'informazione; l'Evidenza (V02) è dichiarata come ciò che sostiene il controllo, se presente; la Verifica (V01) è il controllo stesso, con il proprio Risultato (V04). Un documento di mapping che scriva "fonte verificata" come endpoint unico, senza separare questi tre elementi, non ha applicato correttamente il pattern anche se cita il codice giusto.

**Come mantenere l'indipendenza delle verifiche.** Quando più Verifiche riguardano la stessa Entity nello stesso momento, ciascuna va documentata come voce distinta (aspetto, fonte, evidenza, risultato), mai riassunta in un'unica riga "verifiche: [elenco]" che nasconda la loro indipendenza. La convenzione vieta esplicitamente qualunque struttura documentale che induca a pensare che le verifiche di una stessa Entity debbano avere lo stesso esito o la stessa data solo perché riguardano lo stesso soggetto: ognuna resta un fatto a sé, come già stabilito in `01` §10 e confermato in `reconciliation-report.md` §9.2.

---

## 8. Convenzioni sulla storicizzazione

**Conservazione.** Per ogni Entity o relazione a cui si applica un pattern storico (`02` §6 R04, §7 S08, §10 EV04, §11 D08, §14 T07), il documento di mapping deve dichiarare esplicitamente cosa viene conservato: l'intera condizione precedente in tutti i suoi attributi, oppure solo il fatto della transizione (cosa è cambiato e quando). La convenzione impone che, in assenza di un'indicazione contraria del documento logico, si assuma la conservazione più completa (intera condizione precedente), non la più economica.

**Revisione.** Ogni processo di controllo e possibile modifica di una redazione esistente (`02` §9, VR02) va documentato distinguendo sempre tre momenti: la richiesta o l'avvio della revisione, il suo esame, e il suo effetto (nuova Versione, Rettifica, o conferma senza modifiche). La convenzione si applica anche quando il documento logico del dominio non usa la parola "Revisione" ma un termine equivalente ("controllo", "aggiornamento", "correzione"): il documento di mapping deve comunque separare questi tre momenti, non descriverli come un unico evento indistinto.

**Rettifica.** Ogni Rettifica (`02` §9, VR03) documentata deve indicare esplicitamente quale Versione precedente correggeva e quale errore specifico dichiarava, non limitarsi a introdurre una nuova redazione senza indicarne il rapporto con la precedente. La convenzione vieta di trattare una Rettifica come una Versione ordinaria "silenziosa": la sua natura correttiva deve restare sempre visibile a chi consulta la storia della redazione.

**Archiviazione.** L'Archiviazione (`02` §9, VR06) va documentata solo quando il documento logico prevede una conservazione deliberata di un elemento non più corrente per valore storico, distinta dalla normale successione di Versioni. La convenzione impone di non confondere "Versione precedente, superata dalla successiva" (storicizzazione ordinaria, che non richiede una dichiarazione di archiviazione) con "elemento archiviato", che è una decisione ulteriore ed esplicita di conservazione, spesso accompagnata da una restrizione di consultabilità (`02` §15, VIS03).

**Continuità storica.** La regola di default, in assenza di indicazioni contrarie nel documento logico, è la continuità completa: nessun salto nella sequenza delle condizioni conservate. Un documento di mapping che proponga una storicizzazione "parziale" (per esempio, conservando solo alcune transizioni e non altre) deve motivarlo esplicitamente con un requisito dichiarato nel proprio documento logico; in assenza di questa motivazione, la storicizzazione parziale è trattata come un errore di progettazione, non come un'ottimizzazione legittima (si veda anche `01` §2, principio 6, sulle ottimizzazioni premature).

---

## 9. Convenzioni sui dati derivati

**Quando produrre dati derivati.** Solo quando il documento logico del dominio individua esplicitamente un bisogno di sintesi, aggregazione o calcolo (`02` §11, D04-D06) che nessun dato sorgente già fornisce direttamente nella forma richiesta — tipicamente, ma non solo, nel dominio Osservatorio. La convenzione richiede che, prima di introdurre un dato derivato, il documento di mapping dichiari esplicitamente qual è il bisogno informativo che nessun dato sorgente soddisfa da solo.

**Quando evitarli.** Quando lo stesso risultato è ottenibile interrogando direttamente uno o più dati sorgente al momento del bisogno, senza necessità di conservarne una copia calcolata in modo permanente. Introdurre un dato derivato "per comodità di lettura", quando nessuna vera sintesi o aggregazione è richiesta dal dominio, è una violazione del principio che vieta le ottimizzazioni premature (`01` §2, principio 6) applicata specificamente al caso dei dati: la convenzione impone di trattare ogni dato derivato proposto senza un bisogno dichiarato come un'anticipazione indebita di una decisione tecnica, non come una scelta di modellazione concettuale.

**Come garantire che il dato sorgente resti autorevole.** Ogni documento di mapping che tratta un dato derivato deve, nello stesso punto in cui lo introduce, dichiarare esplicitamente: quale dato sorgente (o quali) lo alimenta, con quale regola di trasformazione (calcolo, aggregazione, o semplice raccolta), e quale dominio resta proprietario del dato sorgente stesso. La convenzione vieta di presentare un dato derivato senza questa tripla dichiarazione, perché è esattamente l'assenza di questa dichiarazione che permette, nel tempo, di confondere il dato derivato con un dato sorgente autonomo (l'anti-pattern descritto in §14).

---

## 10. Convenzioni sulle dipendenze

Questa sezione arricchisce la sola distinzione ammesse/vietate già stabilita in `01` §14 con una terza categoria intermedia, necessaria in fase di convenzione operativa: le dipendenze *sconsigliate*, tecnicamente non vietate dai principi ma da evitare per non aumentare l'accoppiamento senza un beneficio proporzionato.

**Dipendenze consentite.** Riferimento a un'identità stabile di un altro Aggregate (`01` §6, §14), reazione a un Evento di dominio prodotto da un altro dominio (`01` §12, §14), lettura da parte di un dominio analitico (Osservatorio) verso i domini sorgente, narrazione da parte di un dominio narrativo (Contenuti editoriali) verso qualsiasi altro dominio come soggetto raccontato, applicazione di una decisione di accesso da parte di Identità & Accessi. La convenzione impone che ogni dipendenza consentita sia sempre dichiarata esplicitamente indicando l'Aggregate Root referenziato, non un'Entity interna di un altro dominio (si veda anche il criterio "sconsigliate", sotto).

**Dipendenze sconsigliate.** Sono dipendenze che i principi non vietano esplicitamente, ma che la convenzione segnala come da evitare salvo motivazione: (a) un dominio che referenzia un'Entity dipendente (E02/E04, `02` §4) di un altro Aggregate invece di referenziare l'Aggregate Root che la contiene — perché lega il dominio dipendente a dettagli interni che l'altro dominio potrebbe voler riorganizzare liberamente; (b) un dominio che referenzia lo stesso Aggregate esterno per più aspetti distinti quando un solo riferimento all'identità stabile sarebbe bastato — perché aumenta la superficie di accoppiamento senza un beneficio proporzionato; (c) un dominio che introduce una dipendenza da un altro dominio non dichiarata nel proprio documento logico, anche se astrattamente consentita dai principi — perché il documento logico è la fonte autorevole delle dipendenze reali, e il mapping non ne introduce di proprie. Una dipendenza sconsigliata non è vietata: va solo giustificata esplicitamente, con la stessa disciplina delle eccezioni (§2).

**Dipendenze vietate.** Restano quelle già stabilite in `01` §14: duplicazione di un fatto non posseduto, modifica diretta o indiretta di un fatto altrui, acquisizione di proprietà sostanziale da parte di un dominio tecnico o trasversale, dipendenze circolari di proprietà. La convenzione aggiunge una regola di verifica operativa: prima di chiudere un documento di mapping, il redattore deve poter elencare tutte le dipendenze dichiarate e confermare, per ciascuna, che non ricade in nessuna delle quattro categorie vietate.

**Accoppiamento massimo accettabile.** Un dominio non dovrebbe dipendere, per riferimento diretto (non per reazione a un Evento), da più Aggregate Root esterni di quanti il proprio documento logico dichiari esplicitamente come dipendenze in entrata o in uscita (`reconciliation-report.md` §3.1, colonne "Dipende da" / "Dipendono da esso"). Ogni riferimento diretto aggiuntivo, non corrispondente a una dipendenza già censita nel documento logico, è per definizione un accoppiamento non motivato e va trattato come dipendenza sconsigliata fino a prova contraria.

---

## 11. Convenzioni sull'estensibilità

**Nuovi domini.** Un nuovo dominio autonomo non può nascere da un documento di mapping: richiede un nuovo documento logico, sottoposto allo stesso processo di riconciliazione già applicato agli 11 domini esistenti (`reconciliation-report.md`, Parte 1-4) — verifica di non sovrapposizione con i domini esistenti, aggiornamento del glossario canonico, verifica delle dipendenze in entrata e in uscita, aggiornamento di `docs/domain-model.md`. Solo dopo che questo processo si è concluso, il nuovo dominio può ricevere un proprio documento di mapping in `domain-mapping/`.

**Nuovi pattern.** Un nuovo pattern (o una nuova specializzazione, §4 di questo documento) si aggiunge al Reference Model (`02`) solo dopo che un documento di mapping ha dimostrato, seguendo la procedura del §2 di questo documento, che nessun pattern esistente (da solo o combinato) risolve il problema. L'aggiunta avviene con un nuovo codice nella famiglia appropriata (§17 di `02`), mai riutilizzando un codice già assegnato con un significato diverso.

**Nuove classificazioni.** Una nuova Tassonomia (`02` §12, C02) o un nuovo Elenco controllato (C03) si introducono solo dopo aver verificato che non esista già, in un altro dominio, una Classificazione equivalente riutilizzabile per riferimento (`02` §5, VO03): la convenzione impone questa verifica come passo obbligatorio, per evitare la duplicazione di cataloghi concettualmente identici con nomi diversi.

**Nuovi tipi di relazione.** Una nuova forma di Relazione (oltre R01-R08) si introduce come specializzazione di uno dei pattern generali già catalogati (relazione debole/forte, temporanea, storica, derivata, di `01` §7), seguendo la stessa disciplina di `02` §2: deve restare interamente spiegabile in termini del pattern generale più le condizioni specifiche del dominio, non introdurre un significato che nessun pattern esistente prevede.

**Nuovi assi di stato.** Si introducono solo secondo la procedura già stabilita al §6 di questo documento: verifica di non coincidenza con gli otto assi esistenti, verifica che non sia una combinazione letta come dimensione unica, proposta come estensione consapevole del Reference Model.

**Senza rompere la coerenza esistente.** Ogni estensione — nuovo dominio, nuovo pattern, nuova classificazione, nuovo tipo di relazione, nuovo asse di stato — deve essere retrocompatibile con i significati già assegnati ai codici e ai concetti esistenti (`02` §17, regola 5): un codice esistente non cambia mai significato per effetto di un'estensione successiva. Ogni estensione va inoltre registrata in un'unica sede autorevole (l'aggiornamento del documento pertinente tra `01`, `02` o questo documento), mai duplicata con formulazioni diverse in più punti della documentazione architetturale.

---

## 12. Convenzioni sulla documentazione

Ogni futuro documento di mapping in `domain-mapping/` deve rispettare le seguenti convenzioni redazionali, che rendono operativo quanto già stabilito in `01` §15 e `02` §17.

**Citare i pattern utilizzati.** Ogni concetto trattato (Aggregate Root, Entity, Value Object, relazione, asse di stato, verifica, versione, evento, dato, classificazione, documento, elemento temporale, aspetto di visibilità) deve essere accompagnato dal codice esatto del pattern applicato (§17 di `02`), non da una descrizione informale che lo renda solo riconoscibile per allusione. Il documento deve inoltre includere, in chiusura o in apertura, un elenco riepilogativo di tutti i codici citati nel documento, per permettere una verifica rapida di completezza.

**Motivare eventuali eccezioni.** Ogni eccezione a una soluzione altrimenti uniforme (§2 di questo documento) o a un pattern obbligatorio (`02` §2, "Pattern obbligatorio") va raccolta in una sezione dedicata del documento di mapping, distinta dal corpo principale, seguendo lo schema in tre parti già stabilito al §2: soluzione attesa, condizione che la rende inadeguata, soluzione applicata invece.

**Indicare le decisioni architetturali applicate.** Ogni documento di mapping deve elencare esplicitamente, in una propria sezione, quali delle decisioni consolidate di `01` §16 e `02` §18 sono rilevanti per il dominio trattato, e come si manifestano concretamente nelle scelte fatte. Questo elenco non è un riepilogo generico: deve collegare ogni decisione richiamata a un punto specifico del documento in cui quella decisione ha effettivamente guidato una scelta.

**Dichiarare eventuali dipendenze.** Ogni dipendenza verso un altro dominio va classificata esplicitamente come consentita, sconsigliata o vietata secondo §10 di questo documento — mai presentata come un generico elenco di "domini collegati" senza qualificazione. Per le dipendenze consentite va indicato l'Aggregate Root referenziato; per le sconsigliate va indicata la motivazione che le rende comunque accettabili in quel caso specifico; nessuna dipendenza vietata può comparire in un documento approvato.

**Confrontabilità tra documenti.** Tutti i documenti di mapping devono condividere la stessa articolazione sostanziale (Aggregate Root e confine, Entity, Value Object, relazioni, assi di stato, verifiche, storicizzazione, eventi, dati, dipendenze, eccezioni, decisioni applicate), affinché un revisore possa confrontare due documenti qualsiasi punto per punto, senza dover prima ricostruirne la struttura.

---

## 13. Regole obbligatorie

Le regole seguenti sono vincolanti per tutti i futuri documenti in `domain-mapping/` e sono verificabili per lettura diretta del documento: ciascuna può essere confermata o violata osservando cosa il documento effettivamente contiene. Ogni regola ha un identificatore stabile (RC, "Regola di Convenzione") citabile da qualunque documento successivo.

**Decomposizione e riuso**

1. **RC01.** Ogni documento di mapping deve dichiarare, in apertura, l'Aggregate Root del dominio trattato, citando il pattern A01.
2. **RC02.** Ogni Entity trattata deve essere qualificata con uno dei codici E01-E04, con la motivazione che ha determinato la scelta.
3. **RC03.** Ogni Value Object trattato deve essere qualificato con uno dei codici VO01-VO03, con la motivazione corrispondente.
4. **RC04.** Ogni concetto trattato deve seguire la procedura decisionale del §3 di questo documento, con evidenza scritta delle risposte alle domande, non solo del risultato finale.
5. **RC05.** Nessun documento di mapping può introdurre un nuovo Aggregate Root non già individuato in un documento logico esistente.
6. **RC06.** Ogni copia apparente di una soluzione già usata in un altro documento di mapping deve dichiarare esplicitamente il codice del pattern comune.
7. **RC07.** Ogni specializzazione proposta deve dimostrare la propria ricorrenza in più di un dominio prima di ricevere un nuovo codice.
8. **RC08.** Ogni estensione di un pattern deve restare descritta in termini del pattern generale da cui deriva, senza acquisire un nome autonomo.

**Relazioni**

9. **RC09.** Ogni relazione trattata deve essere qualificata con almeno uno dei codici R01-R08.
10. **RC10.** Ogni relazione permanente deve dichiarare esplicitamente l'assenza di una condizione di conclusione naturale nel documento logico di riferimento.
11. **RC11.** Ogni relazione temporanea deve dichiarare esplicitamente cosa accade alla sua conclusione, tra le tre alternative previste (conclusione semplice, traccia storica, trasformazione).
12. **RC12.** Ogni relazione con un altro dominio deve indicare esplicitamente quale dei due documenti di mapping ne è proprietario.
13. **RC13.** Nessun documento di mapping può ridescrivere le regole di una relazione di cui non è proprietario: deve limitarsi a referenziare il documento proprietario.

**Stati**

14. **RC14.** Ogni asse di stato applicato a un'Entity deve essere qualificato con uno dei codici S01-S08.
15. **RC15.** Ogni asse di stato non applicabile a una data Entity deve essere dichiarato esplicitamente come tale, non semplicemente omesso.
16. **RC16.** Nessun documento di mapping può comprimere due assi di stato distinti in un unico valore o in un'unica etichetta.
17. **RC17.** Ogni proposta di nuovo asse di stato deve dimostrare, per iscritto, che nessuno degli otto assi esistenti risponde alla stessa domanda.

**Verifiche**

18. **RC18.** Ogni Verifica trattata deve specificare l'aspetto verificato, citando la tassonomia consolidata in `reconciliation-report.md` §9.1.
19. **RC19.** Nessun documento di mapping può introdurre un badge di "verificato" generico non riferito a un aspetto specifico.
20. **RC20.** Ogni Verifica deve essere documentata distinguendo esplicitamente Fonte (V03), Evidenza (V02) se presente, e Risultato (V04).
21. **RC21.** Nessun documento di mapping può presentare più Verifiche della stessa Entity come se dovessero condividere lo stesso esito o la stessa data.

**Storicizzazione e versioni**

22. **RC22.** Ogni Entity o relazione storicizzata deve dichiarare esplicitamente cosa viene conservato: l'intera condizione precedente o solo il fatto della transizione.
23. **RC23.** Ogni Rettifica documentata deve indicare quale Versione precedente correggeva e quale errore dichiarava.
24. **RC24.** Ogni Archiviazione documentata deve essere distinta esplicitamente dalla normale successione di Versioni.
25. **RC25.** Nessuna storicizzazione parziale (con salti non motivati) è ammessa senza un requisito esplicito dichiarato nel documento logico di riferimento.

**Dati**

26. **RC26.** Ogni dato trattato deve essere qualificato con almeno uno dei codici D01-D09, anche in combinazione.
27. **RC27.** Nessun dato derivato può essere presentato senza indicare esplicitamente il dato sorgente che lo alimenta e la regola di trasformazione applicata.
28. **RC28.** Nessun documento di mapping può introdurre un dato derivato in assenza di un bisogno di sintesi, aggregazione o calcolo dichiarato nel documento logico.

**Dipendenze**

29. **RC29.** Ogni dipendenza dichiarata deve essere classificata come consentita, sconsigliata o vietata secondo il §10 di questo documento.
30. **RC30.** Nessuna dipendenza vietata (duplicazione, modifica di fatto altrui, proprietà tecnica di un fatto di business, dipendenza circolare) può comparire in un documento di mapping approvato.
31. **RC31.** Ogni dipendenza consentita deve indicare l'Aggregate Root referenziato, non un'Entity dipendente interna di un altro dominio, salvo motivazione esplicita come dipendenza sconsigliata.

**Documentazione e coerenza**

32. **RC32.** Ogni documento di mapping deve includere un elenco riepilogativo di tutti i codici di pattern citati al proprio interno.
33. **RC33.** Ogni eccezione a una soluzione uniforme o a un pattern obbligatorio deve essere raccolta in una sezione dedicata, motivata secondo lo schema in tre parti del §2.
34. **RC34.** Ogni documento di mapping deve dichiarare esplicitamente quali decisioni consolidate di `01` §16 e `02` §18 applica e dove.
35. **RC35.** Nessun documento di mapping può contraddire una decisione consolidata in `01`, `02` o in questo documento senza prima proporne una revisione esplicita nella sede appropriata.

Il numero e la formulazione di queste regole possono crescere solo per estensione consapevole (§11 di questo documento), con lo stesso identificatore progressivo (RC36, RC37, ...), mai per modifica silenziosa di una regola esistente.

---

## 14. Anti-pattern

Gli anti-pattern seguenti non sono semplici errori di stile: ciascuno, se non corretto, compromette una garanzia che l'intera architettura (principi, pattern, convenzioni) è costruita apposta per offrire. Per questo ogni voce spiega non solo cosa evitare, ma cosa si perde se non lo si evita.

**Duplicazione dei fatti.** Registrare lo stesso fatto di dominio in più di un punto, senza che sia un caso legittimo di dato derivato o storicizzazione. È pericoloso perché elimina silenziosamente la garanzia di unicità della fonte: quando le due copie iniziano a divergere (e prima o poi accade, perché nulla le mantiene sincronizzate per costruzione), non esiste più un modo affidabile di stabilire quale sia quella corretta. L'intero principio "ogni fatto ha un dominio proprietario" (`01` §2) esiste per prevenire esattamente questa condizione: la duplicazione lo vanifica anche se ogni singola copia, presa isolatamente, sembra corretta.

**Perdita del proprietario del dato.** Documentare un fatto senza indicare, o indicando in modo ambiguo, quale dominio ne è responsabile. È pericoloso perché rende impossibile stabilire chi ha l'autorità di modificarlo, chi deve essere consultato prima di un cambiamento, e a quale documento logico fare riferimento in caso di dubbio. Un'architettura in cui più fatti hanno un proprietario incerto degrada progressivamente in un sistema dove ogni dominio si sente autorizzato a intervenire su tutto, ricreando dall'interno esattamente l'accoppiamento indiscriminato che l'intera separazione in domini voleva evitare.

**Fusione impropria di stati.** Comprimere due o più assi indipendenti (`02` §7, S01-S08) in un unico valore o in un'unica etichetta. È pericoloso perché costringe, prima o poi, a scegliere un solo valore quando la realtà del dominio ne richiede più di uno contemporaneamente: il sintomo tipico è l'introduzione successiva di valori "compositi" (es. "pubblicato-ma-non-verificato") che si moltiplicano rapidamente e diventano impossibili da mantenere coerenti, perché ogni nuova combinazione di condizioni richiederebbe un nuovo valore composito.

**Uso improprio delle verifiche.** Introdurre un giudizio complessivo di "verificato" non riferito a un aspetto specifico (§7 di questo documento). È pericoloso perché comunica una garanzia che nessuna singola Verifica ha effettivamente fornito: chi legge un'Entità "verificata" senza qualificazione tende a fidarsi di tutto ciò che quell'Entità dichiara, mentre in realtà solo un aspetto specifico è stato controllato. Il danno non è solo interno alla documentazione: è un rischio di fiducia mal riposta che si propaga a chiunque utilizzi quel dato più a valle.

**Dipendenze circolari.** Due domini che, direttamente o attraverso una catena di riferimenti, finiscono per dipendere l'uno dall'altro per lo stesso fatto. È pericoloso perché rende impossibile stabilire un ordine di verità: se il dominio A dipende dal dominio B e il dominio B dipende, anche indirettamente, dal dominio A per lo stesso fatto, nessuno dei due può più essere considerato l'autorità definitiva, e ogni tentativo di correggere un'incoerenza rischia di generarne un'altra nel verso opposto.

**Proliferazione di eccezioni.** Accumulare eccezioni motivate (§2) senza mai chiedersi se, nel loro insieme, non stiano segnalando che la regola generale è quella sbagliata. È pericoloso perché ogni singola eccezione, presa isolatamente, può sembrare ben motivata — ma un numero crescente di eccezioni alla stessa regola è quasi sempre il segnale che la regola generale andrebbe rivista, non che il dominio è semplicemente "un caso speciale". Ignorare questo segnale porta a un'architettura dove la regola nominale non descrive più il comportamento reale della maggioranza dei casi.

**Riuso apparente ma incoerente.** Applicare un pattern con lo stesso nome o lo stesso codice a due concetti che, in realtà, rispondono a domande diverse (per esempio usare S04, Stato di pubblicazione, per un concetto che in realtà riguarda l'Accessibilità, VIS02). È pericoloso perché mina la fiducia stessa nel catalogo: se il codice di un pattern non garantisce più che il significato sia identico ovunque venga citato, ogni citazione futura richiederà una verifica manuale, e il Reference Model smette di funzionare come vocabolario comune.

**Introduzione di pattern non catalogati.** Inventare, all'interno di un singolo documento di mapping, una soluzione concettuale nuova senza proporla come estensione del Reference Model (`02` §18, decisione 7). È pericoloso perché crea un pattern "ombra", noto solo a chi ha scritto quel documento, che nessun altro dominio potrà riconoscere o riutilizzare correttamente, vanificando lo scopo stesso di avere un catalogo condiviso.

**Confusione tra dato derivato e dato sorgente.** Presentare un dato calcolato, aggregato o pubblicato come se fosse esso stesso un dato originale, senza indicarne la provenienza (§9 di questo documento). È pericoloso perché, se il dato sorgente cambia, non esiste più un modo automatico di capire che il dato derivato è diventato obsoleto: chi lo consulta continuerà a considerarlo autorevole anche dopo che la realtà sottostante è cambiata.

---

## 15. Checklist finale

Verifica finale del presente documento, condotta prima della sua chiusura:

| # | Verifica | Esito |
|---|---|---|
| 1 | Assenza di tecnologia | Verificato — nessuna tecnologia è nominata come scelta di progetto; PostgreSQL e Supabase compaiono solo nella nota introduttiva, come cosa il documento esclude |
| 2 | Assenza di SQL | Verificato — nessuna istruzione SQL, nessuna sintassi tecnica |
| 3 | Assenza di implementazioni | Verificato — ogni sezione descrive procedure decisionali, criteri e regole verificabili, mai passi realizzativi o strutture dati |
| 4 | Coerenza con `01-principi-mapping.md` | Verificato — ogni convenzione richiama i principi corrispondenti (proprietà dei fatti §2, Aggregate §3, Entità §4, Value Object §5, Relazioni §7, Storicizzazione §8, Stati §9, Verifiche §10, Versioni §11, Eventi §12, Dati derivati §13, Dipendenze §14) senza contraddirli né sostituirli, limitandosi a spiegarne l'applicazione |
| 5 | Coerenza con `02-reference-model.md` | Verificato — ogni convenzione fa riferimento ai codici di pattern già catalogati (A, E, VO, R, S, V, VR, EV, D, C, DOC, T, VIS) senza introdurne di nuovi né alterarne il significato |
| 6 | Coerenza con il Domain Model | Verificato — i riferimenti alla chiusura dell'inventario dei domini e alla matrice di responsabilità sono coerenti con `docs/domain-model.md` §2-§4 |
| 7 | Coerenza con i domini logici | Verificato — i riferimenti alla tassonomia delle verifiche e alle dipendenze dichiarate sono coerenti con quanto già consolidato in `reconciliation-report.md` e con gli 11 documenti logici, senza introdurre regole di dominio nuove |
| 8 | Assenza di contraddizioni | Verificato — nessuna regola di questo documento (§13) contraddice una decisione consolidata in `01` §16 o `02` §18; ogni convenzione è presentata come applicazione, non come revisione |

---

## Riepilogo

**Convenzioni definite.** Il documento stabilisce convenzioni operative per: l'uniformità della rappresentazione tra gli 11 domini (§2); la procedura decisionale di scomposizione dei concetti (§3); i criteri per distinguere riuso corretto, copia, duplicazione, specializzazione ed estensione (§4); l'applicazione dei pattern di Relazione a sette forme ricorrenti (§5); l'introduzione e la proliferazione degli assi di stato (§6); la disciplina delle Verifiche (§7); la storicizzazione, la revisione, la rettifica e l'archiviazione (§8); la produzione responsabile di dati derivati (§9); la classificazione delle dipendenze in consentite, sconsigliate e vietate (§10); l'estensibilità controllata di domini, pattern, classificazioni, relazioni e assi di stato (§11); e la disciplina redazionale che ogni documento di mapping dovrà seguire (§12).

**Regole consolidate.** Sono state prodotte 35 regole obbligatorie e verificabili (§13, RC01-RC35), organizzate per area (decomposizione e riuso, relazioni, stati, verifiche, storicizzazione e versioni, dati, dipendenze, documentazione e coerenza), ciascuna con un identificatore stabile citabile dai futuri documenti di mapping.

**Anti-pattern identificati.** Sono stati descritti nove anti-pattern con la relativa spiegazione del danno architetturale che ciascuno produce se non corretto: duplicazione dei fatti, perdita del proprietario del dato, fusione impropria di stati, uso improprio delle verifiche, dipendenze circolari, proliferazione di eccezioni, riuso apparente ma incoerente, introduzione di pattern non catalogati, confusione tra dato derivato e dato sorgente.

**Aspetti volutamente rinviati ai documenti di mapping.** Restano deliberatamente non trattati in questo documento, perché di competenza dei singoli documenti di mapping fisico:
- l'applicazione puntuale delle procedure decisionali (§3-§11) a ciascuna Entity, relazione, stato, verifica, dato o dipendenza specifica di ciascuno degli 11 domini;
- l'elenco effettivo dei codici di pattern utilizzati da ciascun dominio, che dipende dalle scelte concrete del relativo documento di mapping;
- ogni eventuale proposta di estensione del Reference Model o della tassonomia delle verifiche che emergesse durante la redazione dei documenti di mapping, da trattare come estensione consapevole (§11) e non come contenuto di questo documento;
- ogni dettaglio tecnico di rappresentazione, che resta estraneo a tutti e tre i documenti di questo livello (`01`, `02`, `03`) e appartiene esclusivamente ai piani di migrazione successivi.

Il documento è pronto per essere usato, insieme a `01-principi-mapping.md` e `02-reference-model.md`, come riferimento vincolante da ciascuno degli 11 futuri documenti di mapping fisico per dominio.
