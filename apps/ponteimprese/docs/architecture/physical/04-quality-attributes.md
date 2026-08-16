# Attributi di qualità dell'architettura fisica

> Livello architetturale. Questo documento definisce criteri di qualità, non tecnologia. Non descrive database, PostgreSQL, Supabase, SQL, `CREATE TABLE`, API, codice o implementazioni, e non è il mapping di alcun dominio specifico. Definisce esclusivamente i criteri con cui verrà valutata la qualità dei futuri documenti in `docs/architecture/physical/domain-mapping/`.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/physical/01-principi-mapping.md`](01-principi-mapping.md), [`docs/architecture/physical/02-reference-model.md`](02-reference-model.md), [`docs/architecture/physical/03-convenzioni-architetturali.md`](03-convenzioni-architetturali.md), tutti i documenti in [`docs/architecture/logical/`](../logical/), incluso [`docs/architecture/logical/reconciliation-report.md`](../logical/reconciliation-report.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: principi (`01`) → Reference Model (`02`) → convenzioni (`03`) → **attributi di qualità (questo documento)** → mapping fisico per singolo dominio → piano di migrazione → migrazioni. I primi tre documenti stabiliscono cosa è ammesso, cosa è disponibile e come si applica; questo documento introduce un livello nuovo — quanto bene, non solo se, l'architettura risultante si comporta.

---

## Indice

1. [Obiettivo](#1-obiettivo)
2. [Coerenza](#2-coerenza)
3. [Separazione delle responsabilità](#3-separazione-delle-responsabilità)
4. [Coesione](#4-coesione)
5. [Accoppiamento](#5-accoppiamento)
6. [Estendibilità](#6-estendibilità)
7. [Evolvibilità](#7-evolvibilità)
8. [Manutenibilità](#8-manutenibilità)
9. [Tracciabilità](#9-tracciabilità)
10. [Auditabilità](#10-auditabilità)
11. [Verificabilità](#11-verificabilità)
12. [Comprensibilità](#12-comprensibilità)
13. [Internazionalizzazione](#13-internazionalizzazione)
14. [Scalabilità concettuale](#14-scalabilità-concettuale)
15. [Robustezza concettuale](#15-robustezza-concettuale)
16. [Metriche qualitative](#16-metriche-qualitative)
17. [Valutazione dei futuri mapping](#17-valutazione-dei-futuri-mapping)
18. [Decisioni consolidate](#18-decisioni-consolidate)
19. [Checklist finale](#19-checklist-finale)

---

## 1. Obiettivo

**Cosa sono gli attributi di qualità.** Sono proprietà trasversali che non riguardano se un singolo documento di mapping rispetta una regola puntuale, ma riguardano quanto bene l'intera architettura fisica — nel suo insieme, e nel tempo — si comporta rispetto a esigenze che nessuna singola regola di `01`, `02` o `03` può garantire da sola: essere comprensibile per chi la legge per la prima volta, restare coerente quando cresce, poter essere corretta senza propagare danni, poter essere controllata da chi non l'ha scritta. Un attributo di qualità non è una regola binaria (rispettata/violata): è una dimensione lungo la quale un documento, o l'insieme dei documenti, può essere migliore o peggiore anche restando sempre corretto.

**Differenza tra correttezza e qualità.** La correttezza è la conformità ai principi (`01`), ai pattern (`02`) e alle convenzioni (`03`): un documento corretto non viola nessuna regola verificabile (comprese le 35 regole RC di `03` §13). La qualità è un livello ulteriore, che si valuta *dopo* aver accertato la correttezza, non al suo posto: un documento può essere interamente corretto — nessun pattern applicato in modo scorretto, nessuna dipendenza vietata, nessuna eccezione non motivata — e tuttavia essere di qualità mediocre, se per esempio è difficile da comprendere, se non permette di ricostruire la storia di una decisione, o se un cambiamento previsto nel prossimo futuro lo costringerebbe a una riscrittura sproporzionata. Verificare la correttezza risponde alla domanda "questo documento rispetta le regole?"; valutare la qualità risponde alla domanda diversa "questo documento, anche rispettandole, si comporta bene?".

**Perché una buona architettura deve poter evolvere.** Il progetto `immigratiimprenditori.it` non descrive una realtà statica: nuovi domini potranno emergere (Servizi, Organizzazioni istituzionali, già segnalati come candidati in `reconciliation-report.md` §13), nuove esigenze normative si presenteranno (nuovi Paesi, nuove certificazioni, nuovi requisiti di verifica), nuove lingue e nuovi mercati si aggiungeranno nel tempo. Un'architettura che risolve solo il problema di oggi, in un modo che si irrigidisce davanti al minimo cambiamento, avrà bisogno di essere riscritta non appena la realtà che descrive cambierà anche di poco. La qualità, in questo documento, è quindi anche una garanzia orientata al futuro: non si limita a valutare l'architettura per come è oggi, ma per come si comporterà quando dovrà cambiare.

**Relazione con Principi, Pattern e Convenzioni.** `01` stabilisce cosa è ammesso; `02` stabilisce cosa è disponibile; `03` stabilisce come si applica. Nessuno dei tre, da solo, garantisce che il risultato finale sia comprensibile, tracciabile, resiliente o scalabile: un'architettura può rispettare tutte le regole dei primi tre documenti e restare, ciononostante, fragile o opaca. Questo documento aggiunge il livello che permette di distinguere un'applicazione minima (solo corretta) da un'applicazione di qualità (corretta e capace di durare, crescere e restare comprensibile) di quegli stessi principi, pattern e convenzioni.

---

## 2. Coerenza

**Coerenza interna.** Un singolo documento di mapping non si contraddice al proprio interno: non applica lo stesso codice di pattern con due significati diversi in due punti, non dichiara due assi di stato che in realtà rispondono alla stessa domanda (`03` §6), non descrive una relazione come temporanea in una sezione e come permanente in un'altra. La coerenza interna è la forma più elementare di coerenza: senza di essa, nessun'altra forma è raggiungibile.

**Coerenza tra domini.** Due documenti di mapping diversi, davanti a un problema di rappresentazione della stessa natura, applicano la stessa soluzione (`03` §2). Qui la coerenza tra domini è trattata come qualità osservabile, non solo come regola da rispettare: si misura chiedendosi quanto l'insieme degli 11 documenti "sembri scritto da un solo autore" — stessa struttura, stessa disciplina di citazione dei pattern, stesse soluzioni per gli stessi problemi ricorrenti.

**Coerenza terminologica.** Ogni termine usato in un documento di mapping coincide, nel significato, con il glossario canonico (`docs/domain-model.md` §12, `reconciliation-report.md` §7): nessun sinonimo non dichiarato, nessuna ridefinizione locale di un termine già fissato altrove. Una violazione tipica è l'uso di due parole diverse per lo stesso concetto in due documenti (per esempio "conferma" e "verifica" usate in modo intercambiabile quando il glossario le distingue), o l'uso della stessa parola per due concetti diversi.

**Coerenza temporale.** Un concetto non cambia significato tra una versione di un documento architetturale e la successiva senza che il cambiamento sia dichiarato esplicitamente e propagato a tutti i documenti che lo citano. L'architettura deve restare interpretabile nello stesso modo indipendentemente da quando viene letta: chi consulta un documento di mapping oggi e chi lo consulta dopo un'estensione del Reference Model deve poter contare sullo stesso significato per gli stessi codici già esistenti (`02` §17, regola 5).

**Coerenza evolutiva.** Quando l'architettura si estende — nuovo dominio, nuovo pattern, nuova classificazione, nuovo asse di stato (`03` §11) — l'estensione resta coerente con ciò che già esiste, senza richiedere una "doppia lettura" dei documenti precedenti (una interpretazione valida prima dell'estensione, un'altra dopo). Un'estensione di qualità lascia tutto ciò che esisteva prima esattamente come era, aggiungendo senza alterare.

**Come riconoscere una violazione.** I segnali più diretti sono: due documenti che applicano lo stesso codice di pattern con effetti concettualmente diversi; un termine del glossario canonico che compare con un significato differente in due punti dell'architettura; una regola che vale in un documento di mapping e non in un altro, senza che questa differenza sia dichiarata come eccezione motivata (`03` §2); un concetto che, letto in due momenti diversi della storia del progetto, risulta descritto in modo incompatibile senza che nessun documento segnali il cambiamento.

---

## 3. Separazione delle responsabilità

**Responsabilità unica.** Ogni Aggregate, e quindi ogni documento di mapping, ha una sola ragione sostanziale di esistere, e ogni fatto che tratta è riconducibile a quella ragione. Il principio "ogni fatto ha un dominio proprietario" (`01` §2) stabilisce che questo debba essere vero; qui diventa un attributo osservabile: quanto un documento resta "a fuoco" sulla propria responsabilità primaria, senza accumulare, nel tempo, fatti che le sono solo lateralmente collegati.

**Confini chiari.** Il confine di un dominio, già stabilito nel documento logico corrispondente, resta visibile e riconoscibile nel documento di mapping: non esistono zone grigie in cui non è chiaro se un fatto appartenga al dominio trattato o a un altro. Un confine di qualità permette a chi legge di rispondere senza esitazione alla domanda "questo fatto è di competenza di questo documento?", per qualunque fatto incontrato.

**Ownership.** Ogni fatto, relazione o verifica trattata ha un proprietario esplicito nel testo del documento — non implicito, non ricostruibile solo per deduzione. La qualità della ownership si misura dalla presenza effettiva, per ogni concetto, di una dichiarazione di proprietà, non dalla sua assenza compensata da un'aspettativa che "si capisca dal contesto".

**Assenza di ambiguità.** Nessun lettore dovrebbe dover scegliere, tra due interpretazioni plausibili, a chi appartenga un concetto o chi abbia l'autorità di modificarlo. L'ambiguità sulla responsabilità è il sintomo più diretto di una separazione di bassa qualità, anche quando nessuna regola di `01`-`03` risulta tecnicamente violata.

**Come misurare la qualità della separazione.** Il test operativo è: per ogni concetto trattato in un documento di mapping, ci si chiede "se dovessi spostare questo concetto in un altro documento di dominio, sarebbe ovvio in quale?". Se la risposta è immediata e univoca, la separazione è di buona qualità. Se la risposta richiede una discussione, o se più di un documento potrebbe plausibilmente reclamare lo stesso concetto, la separazione è di qualità scarsa, anche se nessuna regola di proprietà unica (`01` §2, principio 1) risulta formalmente violata: il fatto ha comunque, sulla carta, un solo proprietario, ma quel proprietario non è stato scelto in modo sufficientemente chiaro da rendere la scelta riconoscibile.

---

## 4. Coesione

**Alta coesione.** Un documento di mapping ad alta coesione tratta elementi (Entity, relazioni, assi di stato, verifiche, dati) che ruotano tutti attorno allo stesso Aggregate Root e alla stessa responsabilità primaria del dominio (`02` §16, colonna "Domini interessati"). Nulla è incluso "perché doveva stare da qualche parte": ogni sezione del documento si spiega in funzione delle altre, e il documento letto per intero racconta una storia unica, non una collezione di storie slegate.

**Bassa coesione.** Un documento a bassa coesione contiene elementi che non hanno una relazione concettuale forte tra loro: concetti che condividono solo il fatto di essere stati assegnati allo stesso dominio per convenienza, non perché contribuiscano tutti alla stessa responsabilità. La bassa coesione spesso convive con la correttezza formale (nessuna regola violata) ma produce un documento difficile da usare come unità di riferimento.

**Segnali di degrado.** Un documento che cresce nel tempo aggiungendo concetti sempre più eterogenei, senza che nessuno di essi richieda una revisione della responsabilità primaria dichiarata in apertura; sezioni che, se rimosse, non lascerebbero un vuoto percepibile nel resto del documento (segno che non erano davvero necessarie a quella narrazione); un documento che richiede di essere letto "a pezzi" perché le sue parti non si richiamano mai a vicenda, né tramite relazioni (`02` §6) né tramite dipendenze interne dichiarate. Quando questi segnali si accumulano, la convenzione corretta non è "tollerare" la bassa coesione, ma tornare alla procedura di decomposizione (`03` §3) per verificare se il concetto eterogeneo appartenga, in realtà, a un altro dominio o meriti di diventare esso stesso un Aggregate distinto (fermo il vincolo che un nuovo Aggregate richiede un nuovo documento logico, `03` §11).

---

## 5. Accoppiamento

**Basso accoppiamento.** Concetto già introdotto come principio ("dipendenza minima", `01` §14) e come convenzione (`03` §10); qui si tratta come attributo osservabile: quanto un dominio, se cambiasse internamente il proprio modo di rappresentare un fatto, costringerebbe altri documenti di mapping a cambiare a loro volta. Un accoppiamento basso di qualità è quello in cui un cambiamento interno a un dominio (una nuova modalità di verifica, un nuovo stato) non richiede nessuna modifica ai documenti che lo referenziano, perché quei documenti dipendono solo dall'identità stabile dell'Aggregate, non dai suoi dettagli interni.

**Dipendenze accettabili.** Le dipendenze della categoria "consentite" (`03` §10) sono di buona qualità quando sono nel numero minimo necessario a esprimere una relazione reale del dominio logico, e quando puntano sempre a un'identità stabile (`02` §5, pattern I01-I03), mai a una struttura interna dell'Aggregate referenziato.

**Dipendenze da evitare.** Le dipendenze della categoria "sconsigliate" (`03` §10) degradano la qualità dell'accoppiamento quando non sono accompagnate da una motivazione esplicita nel documento di mapping: la loro sola presenza non è un errore di correttezza (se documentate secondo le regole RC di `03` §13), ma la loro assenza di motivazione è un errore di qualità, perché rende impossibile a un revisore capire se erano davvero necessarie.

**Dipendenze critiche.** Sono dipendenze la cui rottura o modifica comprometterebbe la comprensibilità o la validità di più di un dominio contemporaneamente — per esempio un pattern condiviso interpretato in modo scorretto in un punto e propagato per imitazione (non per estensione governata, `02` §17 regola 5) in altri mapping, o una Classificazione condivisa (`02` §10, pattern CL01) modificata senza considerare tutti i domini che la usano. Le dipendenze critiche richiedono, quando individuate, una verifica esplicita di impatto su tutti i domini coinvolti prima di qualunque modifica.

**Come riconoscere un eccesso di accoppiamento.** I segnali sono: un cambiamento nel documento logico di un dominio richiede la modifica di più di un documento di mapping non direttamente collegato, per lo stesso motivo; un dominio referenzia, nel proprio mapping, un numero di Aggregate esterni superiore a quanto il proprio documento logico dichiari come dipendenze effettive (segno che il mapping ha introdotto accoppiamenti che il modello logico non richiedeva); due domini si scambiano informazioni "andata e ritorno" (A dipende da B e B dipende da A per lo stesso fatto), situazione che nessun principio di `01`-`03` ammette ma che può comparire per errore di mapping.

---

## 6. Estendibilità

**Capacità di aggiungere nuovi concetti senza rompere l'architettura.** L'estendibilità è già governata proceduralmente da `01` §15-16, `02` §18 e `03` §11; qui si tratta come attributo di qualità: misura quanto "a buon mercato", in termini di impatto sui documenti esistenti (non di costo tecnico, escluso da questo documento), un'estensione può avvenire. Un'architettura estendibile di qualità permette a un'estensione di aggiungere senza mai richiedere di sottrarre o riscrivere.

**Nuovi domini.** Devono potersi aggiungere seguendo lo stesso processo di riconciliazione già applicato ai 11 domini esistenti (documento logico → reconciliazione → mapping fisico), senza mettere in discussione la validità di quelli già scritti. Un segnale di buona estendibilità è che l'aggiunta del dodicesimo dominio non richieda la revisione di nessuno degli undici mapping esistenti, salvo l'aggiunta di dipendenze esplicite dove il nuovo dominio le introduce legittimamente.

**Nuove verifiche.** La tassonomia delle verifiche (`reconciliation-report.md` §9.1) deve poter accogliere nuovi tipi senza invalidare le verifiche già censite: un nuovo tipo si aggiunge come nuova voce del catalogo, mai come ridefinizione di un tipo esistente.

**Nuovi stati.** Un nuovo asse di stato deve potersi aggiungere a un Aggregate senza costringere a rivedere gli assi già esistenti (`02` §7): l'indipendenza tra assi (`03` §6) è precisamente ciò che rende questo possibile — se un nuovo asse richiede di modificare il significato di un asse già documentato, la modifica non è un'estensione, ma una correzione di un errore preesistente e va trattata come tale.

**Nuove classificazioni.** Un nuovo catalogo condiviso deve potersi aggiungere al Reference Model senza duplicare cataloghi già esistenti (`02` §12, `03` §4): prima di introdurne uno nuovo, si applica sempre la procedura di verifica del riuso (`03` §4).

**Nuovi pattern.** Un nuovo pattern deve potersi aggiungere al catalogo di `02` §16 senza rompere i codici già assegnati (`02` §17 regola 5): l'aggiunta avviene per estensione della numerazione della propria famiglia, mai per ridefinizione di un codice esistente.

**Criterio di successo.** Un'estensione ben fatta lascia intatti, senza necessità di modifica, tutti i documenti di mapping già scritti, che restano corretti anche dopo l'estensione. Se un'estensione richiede di correggere un documento preesistente per restare valido, quell'estensione non era davvero additiva: ha rivelato un errore di progettazione precedente, non ha semplicemente ampliato l'architettura.

---

## 7. Evolvibilità

**Modifiche prevedibili.** Sono cambiamenti che si possono ragionevolmente anticipare data la natura del progetto: una nuova normativa in un Paese già coperto, un nuovo tipo di certificazione, una nuova lingua supportata, un nuovo canale di Opportunità. L'architettura deve poterli assorbire con un impatto proporzionato alla loro portata reale, non sproporzionato: un cambiamento piccolo nel dominio deve produrre un cambiamento piccolo nel mapping.

**Modifiche impreviste.** Sono cambiamenti che nessun documento logico aveva anticipato. Un'architettura evolvibile di qualità non finge di averli previsti tutti: quando una modifica imprevista non trova posto in nessun pattern esistente, questo deve emergere chiaramente (attraverso la procedura di segnalazione di `03` §11), non essere assorbito forzando un pattern che non rappresenta fedelmente il nuovo caso. La differenza tra una buona e una cattiva gestione dell'imprevisto non è evitarlo, ma renderlo visibile invece di occultarlo in una soluzione impropria.

**Resilienza dell'architettura.** È la capacità dell'architettura di assorbire un urto — una decisione di business inaspettata, un cambiamento normativo non pianificato — senza che l'intera struttura smetta di avere senso. Un'architettura resiliente, dopo l'urto, richiede un'estensione localizzata; un'architettura fragile richiede una revisione generale.

**Stabilità del modello.** I concetti fondamentali — Aggregate Root, principi di `01`, pattern con i loro codici in `02` — non cambiano significato nel tempo anche quando il dominio che descrivono evolve: si estendono (nuove istanze, nuove varianti), non si ridefiniscono. La stabilità del modello è ciò che permette a un documento di mapping scritto oggi di restare interpretabile, senza revisione, anche dopo diverse estensioni successive dell'architettura.

**Differenza dall'estendibilità.** L'estendibilità (§6) riguarda la capacità di aggiungere nuovi elementi accanto a quelli esistenti; l'evolvibilità riguarda la capacità di adattare gli elementi già esistenti a un contesto che cambia, senza romperli. Le due qualità sono complementari: un'architettura può essere estendibile (accoglie il nuovo) senza essere evolvibile (il vecchio si irrigidisce comunque), o viceversa.

---

## 8. Manutenibilità

**Facilità di modifica.** Un documento di mapping manutenibile permette a chi non lo ha scritto di capire, in un tempo ragionevole, dove intervenire per realizzare un cambiamento richiesto. Questo dipende dalla disciplina di documentazione già imposta da `03` §12 (motivare, citare i pattern, spiegare le alternative scartate): un documento che rispetta quella disciplina è, per costruzione, più facile da modificare correttamente.

**Localizzazione degli impatti.** Un cambiamento in un punto del documento, o in un dominio, ha effetti prevedibili e circoscritti: si può indicare in anticipo quali altre sezioni o quali altri documenti risentiranno del cambiamento, senza doverli controllare tutti "per sicurezza". La localizzazione degli impatti è la conseguenza diretta di un buon accoppiamento (§5) e di una buona coesione (§4): dove queste due qualità sono alte, gli impatti restano naturalmente localizzati.

**Riduzione delle regressioni.** Un cambiamento non deve invalidare silenziosamente una regola o una decisione già consolidata altrove (`03` regole RC34-RC35: le decisioni passate restano valide finché non sostituite esplicitamente). La manutenibilità si misura anche dalla facilità con cui si può verificare, dopo un cambiamento, che nulla di ciò che era corretto prima abbia smesso di esserlo: se questa verifica richiede di rileggere l'intera architettura da zero, la manutenibilità è bassa; se richiede di controllare solo le decisioni esplicitamente citate come collegate, è alta.

---

## 9. Tracciabilità

**Tracciabilità dei fatti.** Ogni fatto rappresentato in un documento di mapping deve poter essere ricondotto al paragrafo del documento logico corrispondente che lo giustifica (già richiesto come regola verificabile da `03` RC33; qui trattato come qualità generale, non solo come obbligo puntuale): la tracciabilità di qualità non si limita a soddisfare la regola nel punto in cui è esplicitamente richiesta, ma la applica come abitudine a ogni fatto significativo del documento.

**Delle decisioni.** Ogni scelta di mapping — perché questo pattern e non un altro, perché questa struttura di relazione e non un'altra equivalente — deve poter essere ricondotta a un principio (`01`), a un pattern con il proprio codice (`02`) o a una convenzione (`03`) effettivamente applicati, con la motivazione richiesta da `03` §12.

**Delle verifiche.** Ogni Verifica (pattern V01-V05, `02` §8) deve poter essere ricondotta concettualmente al proprio Risultato, alla propria Fonte e al momento in cui è stata condotta, così come previsto dal pattern stesso: la tracciabilità qui non introduce nulla di nuovo rispetto al pattern, ma richiede che il mapping la renda effettivamente osservabile, non solo teoricamente possibile.

**Delle versioni.** Ogni Versione (pattern VR01-VR05, `02` §9) deve poter essere ricondotta a chi l'ha prodotta e a quale versione precedente sostituisce, in modo che la sequenza storica di un contenuto o di una decisione resti ricostruibile senza lacune.

**Delle modifiche.** Ogni modifica a un documento architetturale — `01`, `02`, `03`, questo documento, o un futuro documento di mapping — deve essere ricostruibile: cosa è cambiato, perché, e con quale legittimazione (concettualmente: quale decisione o quale nuova esigenza l'ha motivata). Questo non richiede un sistema tecnico di versionamento (escluso da questo documento), ma la garanzia di principio che una cronologia delle decisioni architetturali esista e sia consultabile.

---

## 10. Auditabilità

**Possibilità di ricostruire la storia.** Per qualunque fatto rappresentato nell'architettura, deve essere possibile, almeno in linea di principio, ricostruire come si è arrivati alla condizione attuale: chi ha dichiarato cosa, quando, e con quale eventuale verifica successiva. L'auditabilità presuppone la tracciabilità (§9) ma non si riduce a essa.

**Responsabilità delle modifiche.** Ogni modifica — a un fatto di dominio o a un documento architetturale — deve poter essere attribuita, concettualmente, a un soggetto o a un processo responsabile: una Persona, un ruolo, una decisione architetturale esplicita. L'assenza di un responsabile identificabile per una modifica è un difetto di auditabilità anche quando il fatto modificato è, di per sé, corretto.

**Verificabilità delle decisioni.** Ogni decisione documentata (in un mapping o nei documenti trasversali `01`-`04`) deve poter essere sottoposta a un controllo esterno che ne confermi la coerenza con principi, pattern e convenzioni, senza che il revisore debba ricostruire da zero il ragionamento originale: la decisione, come documentata, deve bastare a un controllo indipendente.

**Differenza dalla tracciabilità.** La tracciabilità (§9) garantisce che l'informazione sulla provenienza di un fatto esista e sia collegata alla sua origine. L'auditabilità garantisce che quell'informazione sia organizzata in modo tale che un soggetto esterno — un revisore che non ha partecipato alla decisione originale — possa effettivamente condurre un controllo completo, non solo che l'informazione sia "reperibile da qualche parte". Un'architettura può essere tracciabile (l'informazione esiste) ma poco auditabile (l'informazione è troppo dispersa o troppo implicita per essere usata in una revisione reale).

---

## 11. Verificabilità

**Verificabilità del modello.** Ogni affermazione contenuta nel modello logico o nel modello fisico deve poter essere confermata o smentita sulla base di un'osservazione del testo dei documenti, non deve restare un'opinione non controllabile: se due lettori indipendenti, applicando le stesse regole, arrivano a conclusioni diverse sul rispetto di una regola, quella regola non è formulata con sufficiente verificabilità.

**Verificabilità dei documenti.** Ogni documento di mapping deve permettere, a chi lo legge, di rispondere con certezza alla domanda "questo documento rispetta la regola X?" per ciascuna regola applicabile. Se la risposta richiede un'interpretazione soggettiva del testo del documento (non della regola, che si presume già ben formulata), il documento stesso non è scritto con sufficiente chiarezza operativa.

**Verificabilità delle convenzioni.** Ogni convenzione stabilita in `03` deve essere formulata in modo che la sua applicazione, o la sua violazione, sia osservabile leggendo il documento di mapping, non dedotta da un'intenzione non scritta dell'autore. Una convenzione che richiede di indovinare cosa l'autore "intendesse fare" non è verificabile, indipendentemente da quanto sia ben motivata.

**"Ogni regola deve poter essere controllata".** Questo principio guida trasversale si ricollega direttamente alle 35 regole RC di `03` §13 e alle checklist finali di `01` §18 e `02` §19: la verificabilità come attributo di qualità è la garanzia che quelle checklist, applicate da soggetti diversi allo stesso documento, producano sempre lo stesso risultato. Se l'esito di una checklist dipende da chi la applica, la checklist — o la regola che essa controlla — necessita di essere riformulata in termini più osservabili.

---

## 12. Comprensibilità

**Semplicità.** Un documento comprensibile non introduce complessità che il dominio reale non richiede: ogni pattern usato, ogni relazione dichiarata, ogni asse di stato aggiunto deve rispondere a un'esigenza effettivamente presente nel documento logico, non a una previsione di esigenze future non ancora manifestate (si ricollega a "evitare ottimizzazioni premature", `01` §2, qui applicato non solo alla struttura ma alla leggibilità del risultato).

**Chiarezza.** Ogni concetto è definito, o richiamato con un riferimento preciso, prima di essere utilizzato: un lettore non deve mai dover indovinare il significato di un termine dal contesto in cui appare per la prima volta.

**Assenza di ambiguità.** Ogni termine ha un solo significato in tutta l'architettura (si ricollega alla coerenza terminologica, §2, ma qui osservata dal punto di vista di chi legge un documento per la prima volta e non ha ancora il confronto con altri documenti a disposizione: la comprensibilità richiede che l'ambiguità sia assente anche localmente, non solo quando si confrontano più documenti).

**Leggibilità.** La struttura del documento — ordine delle sezioni, disciplina di citazione dei pattern (`03` §12), motivazione esplicita delle scelte e delle alternative scartate — permette di seguire il ragionamento dall'inizio alla fine senza dover saltare continuamente avanti e indietro tra sezioni o tra documenti per ricostruire il contesto necessario a capire una singola affermazione.

---

## 13. Internazionalizzazione

**Neutralità linguistica.** Nessun concetto del modello dipende dalla lingua italiana in modo strutturale: uno stato, una classificazione o una relazione non devono avere senso solo se letti come parola italiana. Il significato di un concetto deve restare identico indipendentemente dalla lingua con cui, in seguito, verrà espresso o presentato.

**Supporto a più lingue.** Coerentemente con quanto già stabilito nel dominio Persone (competenza linguistica) e con il pattern Versione/Traduzione (`02` §9, pattern VR04), l'architettura deve trattare la lingua come un attributo del contenuto, non come un vincolo della struttura: un contenuto tradotto in un'altra lingua resta lo stesso fatto di dominio, non diventa un fatto diverso né richiede una diversa collocazione nel modello.

**Indipendenza da specifici Paesi.** Poiché il progetto riguarda esplicitamente imprenditori immigrati e mercati internazionali (si veda `docs/architecture/logical/mercati-internazionali.md`), l'architettura non deve presumere un solo ordinamento giuridico, una sola valuta implicita o un solo sistema di classificazione territoriale come se fosse universale. Deve poter rappresentare più Paesi, più ordinamenti giuridici e più sistemi di classificazione attraverso gli stessi pattern di Classificazione già catalogati (`02` §10), senza doverli riprogettare per ciascun nuovo Paese introdotto.

**Adattabilità normativa.** Requisiti legali che variano da giurisdizione a giurisdizione — verifiche richieste, certificazioni riconosciute, titoli abilitanti — devono poter essere rappresentati come varianti dei pattern di Verifica e di Documento già catalogati (`02` §8 e §13), non come eccezioni strutturali che richiedono di modificare il modello per ogni nuova giurisdizione coperta.

**Coerentemente con la natura del progetto.** Il progetto è pensato, fin dalla sua missione, per imprenditori immigrati e per l'apertura a mercati internazionali: l'internazionalizzazione non è quindi un requisito accessorio da aggiungere in un secondo momento, ma un attributo centrale che ogni documento di mapping deve considerare fin dalla prima stesura, non come estensione successiva.

---

## 14. Scalabilità concettuale

**Come l'architettura deve poter crescere senza perdere qualità.** Quando aumenta il numero di domini, relazioni, verifiche, stati o classificazioni, il costo di comprensione e di mantenimento dell'architettura deve crescere in modo proporzionato alla crescita stessa (idealmente in modo lineare), non in modo esplosivo (dove ogni nuovo elemento moltiplica, invece di aggiungere, la complessità da gestire).

**Numero di domini.** L'aggiunta di un dodicesimo dominio (per esempio Servizi o Organizzazioni istituzionali, già segnalati come candidati in `reconciliation-report.md` §13) non deve richiedere di rivedere gli 11 domini esistenti: richiede solo di applicare lo stesso processo già seguito (documento logico → riconciliazione → mapping fisico) e di produrre un nuovo documento, con le sue eventuali dipendenze dichiarate verso i domini già esistenti.

**Numero di relazioni.** L'aggiunta di nuove relazioni tra domini non deve creare una rete di dipendenze che nessun singolo documento riesce più a descrivere per intero: ogni relazione resta di proprietà di un solo dominio (`03` RC12) indipendentemente da quante altre relazioni esistano complessivamente nell'architettura, così che la comprensione di una singola relazione non richieda mai di avere già compreso tutte le altre.

**Numero di verifiche.** La tassonomia delle verifiche (`reconciliation-report.md` §9.1) può crescere in numero, ma il pattern con cui si documenta una singola Verifica (`02` §8, pattern V01-V05) resta identico indipendentemente da quanti tipi di verifica esistano: la crescita del catalogo non complica la struttura di ogni singola voce.

**Numero di stati.** Anche se il numero di assi di stato indipendenti crescesse oltre gli otto già catalogati (`02` §7), la disciplina di trattarli sempre separatamente, senza mai comprimerne due in un solo campo (`03` §6), deve restare valida senza eccezioni introdotte "per semplicità" proporzionalmente alla crescita del numero di assi.

**Numero di classificazioni.** La crescita del numero di tassonomie condivise non deve produrre duplicazioni: al contrario, ogni nuova Classificazione correttamente riconosciuta e catalogata (`02` §10, `03` §4) riduce il rischio di duplicazione futura, perché offre un candidato al riuso a ogni nuovo dominio che ne avrebbe altrimenti creato una propria versione locale.

---

## 15. Robustezza concettuale

**Resistenza alle eccezioni.** L'architettura deve continuare a funzionare anche quando un caso concreto sembra non rientrare perfettamente in nessun pattern esistente. La risposta corretta a questa situazione è sempre segnalare il caso e valutare un'estensione governata (`03` §11), mai forzare il caso in un pattern che non lo rappresenta fedelmente solo per evitare il lavoro di estensione.

**Gestione dei casi limite.** Ogni documento logico già dedica una sezione ai casi limite del proprio dominio. L'architettura fisica deve trattarli con lo stesso rigore riservato ai casi ordinari — mapparli sui pattern appropriati, documentarne le eccezioni secondo le regole di `03` — non relegarli a note informali prive di una collocazione strutturata.

**Assenza di scorciatoie.** Nessuna soluzione di mapping deve sacrificare la fedeltà al significato del dominio logico per ottenere una documentazione più semplice o più rapida da scrivere: questo si ricollega direttamente al principio "business first" (`01` §1) — la comodità di documentazione non è mai un criterio valido per una scelta di rappresentazione.

**Conservazione del significato del dominio.** Dopo qualunque estensione, correzione o crescita dell'architettura, il significato originale stabilito dai documenti logici deve restare intatto e riconoscibile in ogni documento di mapping che lo rappresenta. La robustezza concettuale si misura anche dalla capacità dell'architettura di resistere a pressioni che spingerebbero, in futuro, a semplificare il significato di un concetto per comodità non ancora nota in questa fase: un'architettura robusta preserva il significato anche quando emergeranno vincoli oggi non prevedibili.

---

## 16. Metriche qualitative

Per ciascun attributo definito nelle sezioni 2-15, si riportano indicatori osservabili (segnali di buona qualità), sintomi di degrado (segnali di qualità scarsa) e possibili azioni correttive. Le metriche sono deliberatamente qualitative: non producono un punteggio numerico, ma orientano il giudizio di chi valuta un documento di mapping.

| Attributo | Indicatori osservabili | Sintomi di degrado | Azioni correttive |
|---|---|---|---|
| Coerenza (§2) | Stesso pattern applicato allo stesso modo ovunque; stesso termine con lo stesso significato ovunque | Stesso codice di pattern usato con effetti diversi; termine del glossario usato in modo divergente | Riallineare al glossario canonico; segnalare la divergenza nel log delle correzioni del documento interessato |
| Separazione delle responsabilità (§3) | Ownership esplicita per ogni fatto; test "a chi appartiene?" con risposta immediata | Fatto senza proprietario dichiarato; più domini che reclamano lo stesso concetto | Applicare la procedura di decomposizione (`03` §3) e riassegnare il fatto a un solo dominio |
| Coesione (§4) | Ogni sezione si spiega in funzione delle altre; il documento racconta una storia unica | Sezioni che potrebbero essere rimosse senza impatto percepibile; concetti eterogenei senza relazione tra loro | Valutare se il concetto eterogeneo appartenga a un altro dominio o richieda un nuovo Aggregate |
| Accoppiamento (§5) | Dipendenze minime, verso identità stabili, motivate | Dipendenze numerose non motivate; dipendenze circolari; riferimenti a dettagli interni di altri Aggregate | Applicare la convenzione sulle dipendenze (`03` §10); rimuovere o motivare esplicitamente ogni dipendenza sconsigliata |
| Estendibilità (§6) | Un'estensione recente non ha richiesto modifiche ai documenti preesistenti | Un'estensione ha richiesto di correggere un documento già scritto | Verificare se l'estensione era davvero additiva o rivelava un errore preesistente; correggere l'errore separatamente dall'estensione |
| Evolvibilità (§7) | Un cambiamento imprevisto è stato segnalato e gestito per estensione | Un cambiamento imprevisto è stato assorbito forzando un pattern non adatto | Ripristinare la rappresentazione fedele; introdurre l'estensione mancante |
| Manutenibilità (§8) | Un cambiamento richiesto si localizza in punti prevedibili del documento | Un cambiamento richiede di rileggere l'intera architettura per essere certi di non aver rotto nulla | Migliorare la disciplina di motivazione e citazione (`03` §12); ridurre l'accoppiamento alla radice |
| Tracciabilità (§9) | Ogni fatto è ricondotto al proprio paragrafo logico di origine | Fatti presenti nel mapping senza riferimento al documento logico | Aggiungere il riferimento mancante; applicare la regola RC33 (`03` §13) |
| Auditabilità (§10) | Ogni decisione e ogni modifica hanno un responsabile e una motivazione ricostruibili | Decisioni senza responsabile identificabile o senza motivazione esplicita | Integrare la motivazione mancante prima di considerare il documento completo |
| Verificabilità (§11) | Due revisori indipendenti raggiungono la stessa conclusione applicando la stessa regola | Due revisori raggiungono conclusioni diverse sulla stessa regola | Riformulare la regola in termini più osservabili |
| Comprensibilità (§12) | Ogni concetto è definito prima di essere usato; nessun salto avanti e indietro necessario | Termini usati prima di essere definiti; struttura che richiede continui rimandi | Riordinare le sezioni; anticipare le definizioni necessarie |
| Internazionalizzazione (§13) | Nessun concetto dipende strutturalmente dalla lingua italiana o da un solo Paese | Stato o classificazione comprensibile solo in italiano; assunzione implicita di un solo ordinamento giuridico | Riformulare il concetto in termini neutri; verificare la copertura multi-Paese con il pattern di Classificazione |
| Scalabilità concettuale (§14) | Il costo di comprensione cresce in proporzione alla crescita dell'architettura | Ogni nuovo dominio o pattern richiede una revisione generale per essere compreso | Ricondurre la crescita ai pattern e alle convenzioni esistenti; evitare soluzioni ad hoc |
| Robustezza concettuale (§15) | I casi limite sono rappresentati con lo stesso rigore dei casi ordinari | Casi limite relegati a note informali o risolti con scorciatoie | Applicare la procedura di segnalazione ed estensione (`03` §11) al caso limite |

---

## 17. Valutazione dei futuri mapping

La checklist seguente si applica a ogni documento futuro in `docs/architecture/physical/domain-mapping/`, per ciascuno degli 11 domini logici già stabiliti (e per ogni dominio ulteriore che si aggiungerà, §6). È distinta e successiva alle checklist di correttezza già stabilite in `01` §18, `02` §19 e `03` §15: si applica solo dopo che quelle checklist sono state superate, perché valuta la qualità di un documento già corretto, non la sua correttezza.

**Checklist di qualità per un documento di domain-mapping**

1. Coerenza — il documento usa i pattern, i termini e le soluzioni già adottati dagli altri documenti di mapping per problemi dello stesso tipo?
2. Separazione delle responsabilità — ogni fatto trattato ha un proprietario riconoscibile senza ambiguità, coerente con il confine stabilito nel documento logico?
3. Coesione — ogni sezione del documento contribuisce alla stessa responsabilità primaria dell'Aggregate Root?
4. Accoppiamento — le dipendenze verso altri domini sono minime, motivate e dirette verso identità stabili?
5. Estendibilità — il documento è scritto in modo che un'estensione futura (nuovo stato, nuova verifica, nuova classificazione) non richieda di riscriverlo?
6. Evolvibilità — il documento distingue chiaramente ciò che è stabile da ciò che potrebbe cambiare, senza presumere che nulla cambierà?
7. Manutenibilità — un lettore che non ha scritto il documento può individuare rapidamente dove intervenire per un cambiamento richiesto?
8. Tracciabilità — ogni fatto, decisione, verifica e versione è ricondotta esplicitamente alla propria origine logica o motivazionale?
9. Auditabilità — ogni decisione rilevante è accompagnata da una motivazione sufficiente a un controllo indipendente, senza dover interrogare l'autore originale?
10. Verificabilità — le affermazioni del documento sono formulate in modo che la loro conformità alle regole di `01`-`03` sia osservabile, non interpretabile?
11. Comprensibilità — un lettore che consulta il documento per la prima volta può seguirlo senza dover saltare continuamente ad altri documenti per capire i termini di base?
12. Internazionalizzazione — il documento evita assunzioni implicite su una sola lingua, un solo Paese o un solo ordinamento giuridico?
13. Scalabilità concettuale — il documento resterebbe comprensibile anche se il numero di relazioni, stati o verifiche che tratta crescesse significativamente?
14. Robustezza concettuale — i casi limite del dominio sono trattati con lo stesso rigore dei casi ordinari, senza scorciatoie?
15. Esito complessivo — il documento, oltre a essere corretto, si comporta bene rispetto a tutti gli attributi precedenti, o presenta aree da migliorare che vanno segnalate esplicitamente prima dell'approvazione?

Questa checklist è riutilizzabile senza modifiche per tutti gli 11 domini e per ogni dominio futuro: non contiene alcun riferimento specifico a un dominio particolare.

---

## 18. Decisioni consolidate

Le decisioni seguenti consolidano gli attributi di qualità definiti in questo documento come requisiti permanenti dell'architettura fisica, allo stesso livello di stabilità dei principi (`01` §16) e delle decisioni consolidate del Reference Model (`02` §18) e delle convenzioni (`03`).

1. La qualità si valuta solo dopo aver accertato la correttezza (conformità a `01`, `02`, `03`): non la sostituisce, non la anticipa, non la sostituisce in caso di conflitto.
2. I 14 attributi definiti nelle sezioni 2-15 (Coerenza, Separazione delle responsabilità, Coesione, Accoppiamento, Estendibilità, Evolvibilità, Manutenibilità, Tracciabilità, Auditabilità, Verificabilità, Comprensibilità, Internazionalizzazione, Scalabilità concettuale, Robustezza concettuale) sono gli unici attributi di qualità riconosciuti a livello architetturale finché questo documento non viene esteso con una decisione esplicita.
3. Nessun documento di domain-mapping può essere considerato completo se non è stato valutato con la checklist di §17, indipendentemente dal superamento delle checklist di correttezza di `01`, `02` e `03`.
4. Le metriche di qualità restano qualitative per decisione permanente: non si introducono punteggi numerici, soglie percentuali o indicatori quantitativi per nessun attributo definito in questo documento.
5. L'internazionalizzazione (§13) è un attributo di qualità di rango pari agli altri tredici, non un requisito accessorio: nessun documento di mapping può essere approvato se introduce un'assunzione implicita su una sola lingua o un solo ordinamento giuridico.
6. Quando un'estensione dell'architettura (nuovo dominio, pattern, stato, classificazione) richiede la modifica di un documento già scritto e approvato, questa modifica deve essere trattata come correzione di un errore preesistente (da documentare come tale) e non come conseguenza normale di un'estensione additiva (§6, criterio di successo).
7. La coesistenza di correttezza e bassa qualità è un esito possibile e deve essere esplicitamente segnalata quando riscontrata, non ignorata perché "il documento comunque rispetta le regole".
8. Le tabelle di metriche (§16) e la checklist di valutazione (§17) sono strumenti stabili e riutilizzabili: si estendono per l'aggiunta di nuovi attributi (con decisione esplicita, come al punto 2), non si duplicano per singolo dominio.
9. Ogni futura estensione degli attributi di qualità richiede un aggiornamento esplicito di questo documento, seguendo la stessa disciplina di motivazione già richiesta per le estensioni di `01`, `02` e `03`.

---

## 19. Checklist finale

**Verifica di assenza di contenuti esclusi**

- [x] Assenza di tecnologia — nessun riferimento a database, PostgreSQL, Supabase o altra tecnologia specifica.
- [x] Assenza di SQL — nessuna istruzione `CREATE TABLE`, DDL o linguaggio di interrogazione.
- [x] Assenza di implementazione — nessun dettaglio di codice, API o struttura applicativa.
- [x] Assenza di database specifici — nessun riferimento a un motore o a un fornitore di dati particolare.

**Verifica di coerenza con i documenti trasversali**

- [x] Coerenza con `01` — gli attributi di qualità non ridefiniscono né contraddicono nessun principio; li presuppongono come livello di correttezza già accertato.
- [x] Coerenza con `02` — ogni riferimento a un pattern usa i codici già stabiliti nel Reference Model, senza introdurne di nuovi.
- [x] Coerenza con `03` — ogni riferimento a una convenzione o a una regola RC richiama quanto già stabilito, senza sovrapposizioni o duplicazioni.
- [x] Coerenza con il Domain Model — il glossario e i concetti richiamati (Persone, Imprese, Verifiche, Stati) coincidono con `docs/domain-model.md`.
- [x] Coerenza con i domini logici — gli esempi di internazionalizzazione e scalabilità richiamano correttamente i domini Persone e Mercati Internazionali senza alterarne il contenuto.

---

## Riepilogo

**Attributi definiti (14):** Coerenza, Separazione delle responsabilità, Coesione, Accoppiamento, Estendibilità, Evolvibilità, Manutenibilità, Tracciabilità, Auditabilità, Verificabilità, Comprensibilità, Internazionalizzazione, Scalabilità concettuale, Robustezza concettuale. Ciascuno definito con le proprie distinzioni interne richieste (es. coerenza interna/tra domini/terminologica/temporale/evolutiva; accoppiamento accettabile/da evitare/critico) e con criteri per riconoscere una violazione o un segnale di degrado.

**Metriche qualitative:** una tabella (§16) che associa a ciascuno dei 14 attributi indicatori osservabili, sintomi di degrado e possibili azioni correttive, deliberatamente priva di soglie numeriche o punteggi, per restare uno strumento di giudizio qualitativo e non di misurazione quantitativa.

**Checklist create:** una checklist di 15 punti (§17), riutilizzabile senza modifiche per tutti gli 11 domini logici e per ogni dominio futuro, distinta e successiva alle checklist di correttezza già stabilite in `01`, `02` e `03`: si applica solo a un documento già corretto, per valutarne la qualità.

**Decisioni consolidate:** 9 decisioni (§18) che fissano gli attributi di qualità come requisiti permanenti dell'architettura, stabiliscono la natura qualitativa (non numerica) delle metriche, il rango pieno dell'internazionalizzazione tra gli attributi, e la distinzione tra estensione additiva e correzione di un errore preesistente.

**Aspetti rinviati ai documenti di mapping:** l'applicazione concreta della checklist di §17 a ciascuno degli 11 domini; l'eventuale identificazione, durante la stesura dei mapping, di attributi di qualità aggiuntivi non ancora previsti in questo documento (da trattare secondo la decisione 9 di §18); la verifica pratica che le dipendenze dichiarate in ciascun mapping rispettino i criteri di accoppiamento qui definiti (§5); la verifica concreta di neutralità linguistica e indipendenza normativa (§13) per i domini che trattano contenuti multilingua o multi-Paese (Persone, Mercati Internazionali, Imprese).
