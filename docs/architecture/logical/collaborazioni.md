# Logical Data Model — Dominio COLLABORAZIONI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/architecture/fundamental/collaborazioni-domain-thesis.md`](../fundamental/collaborazioni-domain-thesis.md) (significato di business, confini, PF4/PF5), [`docs/architecture/fundamental/domain-patterns.md`](../fundamental/domain-patterns.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md).
> Scopo del documento: definire il modello logico del dominio Collaborazioni, componente del dominio Core "Opportunità & Collaborazioni" già riconosciuto dal Domain Model, qui trattata come modello a sé per la propria complessità e autonomia concettuale (coerente con `logical/opportunita.md`, che ha già trattato la componente Opportunità separatamente). Il significato di business, i fatti proprietari e i confini sono quelli già stabiliti dalla Domain Thesis; questo documento li traduce in entità, relazioni, stati e regole senza ridefinirli.
> Distinzione da Opportunità. Un'Opportunità (`logical/opportunita.md` §1, §3) è normalmente promossa da un soggetto e presenta benefici, requisiti, destinatari e un periodo di validità: è una possibilità strutturata che qualcuno offre a chi la incontra. Una Collaborazione nasce invece dall'intenzione di uno o più soggetti di trovare una controparte, avviare una relazione o sviluppare un'attività comune: è una ricerca, un'offerta o una proposta che cerca un incontro, non una possibilità già definita e resa disponibile da un terzo. Una Collaborazione può nascere da un'Opportunità (es. una risposta che si trasforma in relazione diretta), ma può anche esistere senza alcuna Opportunità formale. Questo dominio non possiede il processo formale di Opportunità (annuncio pubblico con requisiti espliciti ed esito binario): possiede invece il proprio percorso, più aperto, dalla dichiarazione all'eventuale relazione attiva (tesi §5, §8, §13).
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API o interfaccia.

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Collaborazioni rappresenta il processo di business — dichiarativo prima, eventualmente relazionale dopo — per cui una Persona o un'Impresa dichiara l'intenzione di sviluppare un'attività comune con un altro soggetto: dall'esigenza o dalla proposta dichiarata, attraverso l'eventuale ricerca e abbinamento di una controparte, fino all'eventuale accordo preliminare, al periodo di cooperazione attiva e alla sua conclusione (tesi §5–§6). Copre casi ampi e diversi tra loro: cercare clienti, fornitori, partner, professionisti, personale, distributori, agenti, investitori, finanziatori, subfornitori, reti commerciali, spazi, immobili, sedi operative, terreni; offrire prodotti, servizi, competenze, disponibilità produttiva, distribuzione, rappresentanza commerciale; proporre una partnership o una collaborazione internazionale. Non rappresenta l'esecuzione operativa di un progetto condiviso (attività, scadenze intermedie, risorse assegnate), né un contratto vincolante.

**Momento di nascita.** Una Collaborazione esiste già nella fase dichiarativa: non appena un soggetto dichiara un'esigenza o una proposta di collaborazione, anche senza controparte ancora individuata (tesi §6, §11–§12). Non nasce solo al raggiungimento di una relazione bilaterale attiva. La fase relazionale (accordo preliminare, collaborazione attiva) è un'evoluzione possibile, non un prerequisito di esistenza.

**Quali problemi risolve.** Rende possibile, per una Persona o un'Impresa, dichiarare un bisogno o una disponibilità concreta e trovare chi vi corrisponde, senza dover attendere che un terzo promuova un'Opportunità strutturata; rende possibile rappresentare relazioni che nascono direttamente tra due o più soggetti, con la propria evoluzione (dal primo interesse fino a un accordo o a un esito negativo); distingue con precisione le fasi che precedono un impegno reale (semplice interesse, candidatura, valutazione reciproca) da un impegno concreto, senza mai promettere un risultato.

**Cosa rientra nel dominio.** La Collaborazione come entità autonoma (§2); la sua natura distintiva (§3); le sue forme (domanda, offerta, proposta congiunta, §4) e tipologie (§5); i soggetti e i ruoli coinvolti (§6); il suo oggetto, le sue esigenze e condizioni (§7); il suo ciclo di vita su più assi (§8); le manifestazioni di interesse e le candidature (§9); l'abbinamento e la compatibilità (§10); i collegamenti territoriali, settoriali e di mercato (§11); la sua verifica, affidabilità e visibilità (§12).

**Cosa NON rientra nel dominio.**
- Non rientra l'**Opportunità**: sono domini distinti (introduzione, decisione vincolante §15); una Collaborazione può nascere da un'Opportunità senza che i due domini si fondano.
- Non rientrano **Persone** e **Imprese**: sono referenziate per identità stabile, senza che questo dominio ne duplichi i dati.
- Non rientrano le **Appartenenze**: il titolo di rappresentanza è solo utilizzato (D23); se il legame si consolida in un rapporto organizzativo duraturo, il fatto stabile resta di Appartenenze — Collaborazioni non lo assorbe né lo converte automaticamente (V10; tesi §8).
- Non rientrano i **Mercati Internazionali**: referenziati per contestualizzare una Collaborazione internazionale, senza incorporarne il modello (§11).
- Non rientrano i **Professionisti** (`logical/professionisti.md`): la qualificazione professionale può essere referenziata in modo facoltativo (D21), ma Professionista non è una terza categoria di partecipante distinta da Persona — è un ruolo che una Persona assume (tesi §9). Qualifiche, titoli e servizi professionali dichiarati restano di Professionisti.
- Non rientrano gli **Eventi**: un Evento può presentare o favorire l'incontro tra soggetti, ma resta un dominio distinto.
- Non rientra la **messaggistica**: questo dominio registra che un contatto è stato autorizzato (§9, evento ContattoAutorizzato) come fatto di dominio, non il contenuto né lo scambio dei messaggi tra le parti, che restano una comunicazione privata fuori dal perimetro di questo modello.
- Non rientrano i **contatti** in quanto dati (recapiti, canali diretti): il dominio registra il fatto che un contatto è avvenuto o è stato autorizzato, non i dati di contatto stessi né il loro scambio.
- Non rientrano i **contratti**: il dominio può rappresentare uno stato concettuale di "Accordo preliminare" (§8) come fase della relazione, ma non la stipula, i termini legali o l'esecuzione di un contratto vero e proprio.
- Non rientrano le **transazioni economiche**: pagamenti, fatturazione e ogni flusso economico effettivo restano fuori dal perimetro.
- Non rientra la **controversia legale**: il dominio può rappresentare che una Collaborazione è "Contestata" (§8) come fatto di relazione, senza gestire né rappresentare la risoluzione legale della controversia.
- Non rientra l'**identità digitale né i diritti di accesso**: nessuna informazione di questo dominio genera di per sé un permesso tecnico; resta responsabilità esclusiva del futuro dominio Identità & Accessi.
- Non rientra l'**Osservatorio**: il dominio lo alimenta con dati aggregabili, senza produrre esso stesso report o statistiche.
- Non rientrano i **Contenuti Editoriali**: possono descrivere o raggruppare Collaborazioni come soggetto trattato, senza che il contenuto coincida con la Collaborazione.

**Quali domini utilizza.**
- **Persone** e **Imprese** — per referenziare proponenti, controparti e candidati, per identità stabile, senza duplicarne i dati (D19, D20, Necessarie).
- **Appartenenze** — utilizzo del titolo di rappresentanza quando una Persona agisce per conto di un'Impresa (§6; D23), senza possedere né verificare autonomamente la relazione.
- **Professionisti** — riferimento facoltativo al Profilo professionale quando la proposta coinvolge una qualificazione (§6; D21).
- **Mercati Internazionali** — per referenziare il Mercato di riferimento di una Collaborazione internazionale (§11), senza incorporare Esigenza di internazionalizzazione o Presenza.
- **Opportunità** — quando una Collaborazione nasce da un'Opportunità, per mantenere il riferimento all'origine storica (§4; D22), senza dipendere da essa per esistere.
- **Tassonomia Condivisa** — per gli ambiti territoriali e settoriali (§11).
- **Identità & Accessi** — di supporto per le azioni di scrittura; non decide la visibilità sostanziale (PF13).

**Quali domini utilizzano Collaborazioni.**
- **Osservatorio** — per aggregare dati su tipologie, territori, settori ed esiti delle Collaborazioni (D43).
- **Ricerca** e **Notifiche** — per rendere le Collaborazioni trovabili e per segnalare interesse, abbinamenti o cambi di stato rilevanti.
- **Contenuti Editoriali** — possono narrare una Collaborazione senza acquisirne la proprietà (D35).
- **Opportunità** — non dipende da Collaborazioni: la relazione è unidirezionale (Collaborazioni → Opportunità solo per origine storica; nessun ciclo, `domain-dependency-map.md` §18).

**Perché Collaborazioni è un dominio autonomo.** Una Collaborazione ha una natura propria (§3) — nasce dall'intenzione di uno o più soggetti di trovare un incontro, non da un beneficio predefinito offerto da un terzo — un proprio ciclo di vita su sei assi (§8), un proprio modello di manifestazioni di interesse e candidature (§9), e un proprio modello di abbinamento e compatibilità (§10) che nessun altro dominio replica. La sua natura è inoltre spesso **bidirezionale o multilaterale** (§4), a differenza dell'Opportunità che è tipicamente unidirezionale (dal Promotore ai Destinatari): questa differenza strutturale, insieme all'ampiezza dei casi che deve supportare (dal contatto commerciale alla ricerca di uno spazio fisico), giustifica un dominio a sé. La motivazione completa di autonomia è nella Domain Thesis (§5): non riducibile a Persona, Impresa, Opportunità, Appartenenza o Professionisti.

**Differenza tra Collaborazione, Opportunità, annuncio, messaggio, contratto e transazione.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Collaborazione | Processo: dichiarazione → eventuale relazione | Nasce dall'intenzione di un soggetto di trovare un incontro; esiste già in fase dichiarativa; non richiede un promotore terzo né un beneficio predefinito (§1, §3) |
| Opportunità | Possibilità strutturata promossa da un terzo | Ha un Promotore, destinatari individuabili, un beneficio e un periodo di validità (`logical/opportunita.md` §3) |
| Annuncio generico | Comunicazione informativa | Manca tipicamente di condizioni, requisiti o una controparte individuabile con precisione (§3) |
| Messaggio | Comunicazione privata puntuale | Non ha una struttura di oggetto, finalità e condizioni; è lo scambio che può avvenire *dopo* che un contatto è stato autorizzato da una Collaborazione, ma resta fuori da questo dominio |
| Contratto | Impegno giuridico formalizzato | Nasce, quando nasce, dopo un Accordo preliminare (§8); ha termini legali ed effetti che questo dominio non rappresenta |
| Transazione | Flusso economico effettivo | Riguarda pagamenti e scambi di valore concreti, sempre fuori dal perimetro di questo dominio |

---

## 2. Entità e concetti principali

| Concetto | Natura | Sintesi |
|---|---|---|
| Collaborazione | Entità autonoma (aggregate root) | Il processo stesso — dalla dichiarazione di esigenza/proposta all'eventuale relazione attiva — con tutte le proprietà elencate di seguito. Esiste già nella fase dichiarativa. La sua identità stabile non deriva dall'identità dei soggetti coinvolti (PF5; tesi §6, §14). |
| Soggetto proponente | Relazione/ruolo (locale alla Collaborazione) | Chi avvia la Collaborazione: referenzia una Persona o un'Impresa (§6). Il ruolo appartiene alla Collaborazione, non al partecipante (tesi §10; PL4). |
| Soggetto destinatario | Relazione/ruolo (locale alla Collaborazione) | Un soggetto specifico e individuato a cui la Collaborazione è indirizzata direttamente (es. un invito diretto), quando presente. Appartiene alla Collaborazione, non al partecipante. |
| Controparte ricercata | Concetto descrittivo | I criteri che descrivono chi si sta cercando, quando la Collaborazione non è indirizzata a un soggetto specifico (analogo per ruolo al Destinatario potenziale di `logical/opportunita.md` §2, qui applicato alla ricerca di una controparte). |
| Tipologia di collaborazione | Concetto descrittivo (classificazione governata) | La natura della Collaborazione secondo il catalogo del §5. |
| Esigenza | Entità dipendente | Il bisogno dichiarato dal proponente, quando la Collaborazione nasce da una ricerca ("cerco X", §4). Distinta dall'Esigenza di internazionalizzazione di Mercati Internazionali: quest'ultima può generare una Collaborazione ma non coincide con essa (`mercati-internazionali.md` §8; tesi §8). |
| Offerta | Entità dipendente | La disponibilità dichiarata dal proponente, quando la Collaborazione nasce da una proposta di disponibilità ("offro X", §4). Da non confondere con OffertaDiServizio del dominio Servizi (Domain Model §3) né con l'Offerta implicita in una PresenzaDiMercato: qui il termine designa esclusivamente la disponibilità dichiarata all'interno di una Collaborazione. |
| Oggetto della collaborazione | Concetto descrittivo | Cosa, concretamente, è al centro della Collaborazione (un prodotto, un servizio, un progetto, una competenza, uno spazio) (§7). |
| Ambito settoriale | Relazione | Il collegamento con uno o più Settori economici (Tassonomia Condivisa). |
| Ambito territoriale | Relazione | Il collegamento con uno o più Territori o Paesi (§11). |
| Mercato di riferimento | Relazione | Il collegamento, quando pertinente, con un Mercato internazionale (dominio Mercati Internazionali), referenziato senza essere incorporato (§11). |
| Durata | Concetto descrittivo (value object) | Quanto è previsto durare la relazione una volta avviata (§7), distinta dalla Disponibilità temporale. |
| Disponibilità temporale | Concetto descrittivo (value object) | La finestra in cui la proposta stessa è attiva e ricercabile, distinta dalla Durata della relazione una volta avviata (§7, §9). |
| Requisito della controparte | Entità dipendente | Una condizione che la controparte deve soddisfare (§7); distinto dalla Preferenza per il suo carattere vincolante. |
| Preferenza | Entità dipendente | Una condizione non vincolante che favorisce, senza escludere, la valutazione di una controparte (§7). |
| Condizione | Concetto descrittivo | Un termine, economico o non economico, potenzialmente negoziabile tra le parti (§7); più ampio del singolo Requisito o della singola Preferenza. |
| Manifestazione di interesse | Entità autonoma (relazione) | Il segnale, anche informale, che un soggetto è interessato alla Collaborazione (§9). È parte del percorso aperto di Collaborazioni, non del processo formale di candidatura di Opportunità (tesi §8, §13). |
| Candidatura | Entità autonoma (relazione) | Una risposta più strutturata di un soggetto, con l'intento di essere selezionato come controparte (§9); può, ma non deve, essere preceduta da una Manifestazione di interesse. Non replica i requisiti espliciti né l'esito binario tipici dell'Opportunità. |
| Abbinamento | Entità/relazione | Il rilevamento, algoritmico o redazionale, di una possibile corrispondenza tra l'Esigenza/Offerta del proponente e un soggetto potenzialmente compatibile (§10). Non è garanzia né processo di ammissibilità di Opportunità. |
| Esito | Concetto descrittivo (value object) | Il risultato qualitativo dichiarato della Collaborazione (positivo, negativo, parziale, non comunicato), distinto dallo stato della relazione che lo determina (§8). |
| Fonte | Entità dipendente | Da dove proviene un'informazione dichiarata in questo dominio, analoga per ruolo alla Fonte già definita negli altri domini logici. |
| Visibilità | Asse di stato, non entità | Chi può conoscere l'esistenza e i dettagli della Collaborazione (§12). |
| Stato editoriale | Asse di stato, non entità | La fase redazionale con cui la Collaborazione è stata preparata e resa pubblica (§8). |
| Stato della relazione | Asse di stato, non entità | Dove si trova, nel proprio percorso reale, la relazione una volta avviata (§8). |
| Stato di verifica | Asse di stato, non entità | Quanto la piattaforma può confermare rispetto a quanto dichiarato (§8, §12). |

**Nota sugli assi non elencati sopra.** Il ciclo di vita completo (§8) prevede sei assi: ai quattro concetti di stato appena elencati si aggiungono lo **Stato della ricerca** (il percorso specifico dell'incontro tra domanda e offerta) e l'**Esito** (già incluso in tabella): entrambi sono trattati in dettaglio al §8, per evitare duplicazioni.

**Nota su Aggregate e PF4.** Questo modello rappresenta oggi Collaborazione come un unico Aggregate Root che attraversa fasi dichiarative e, eventualmente, relazionali. PF4 (proprietà delle relazioni) si applica alla fase relazionale (accordo preliminare, collaborazione attiva), non alla sola fase dichiarativa unilaterale (tesi §14). Se in futuro la fase dichiarativa e quella relazionale richiedessero consistenze indipendenti, PC2 (più Aggregate Root nello stesso dominio) resterebbe applicabile — decisione rinviata al Physical Domain Mapping (tesi §16, punto 2).

**Principio di non duplicazione.** Nessuno dei concetti sopra duplica Persona, Impresa, Appartenenza, Mercato internazionale, Professionista, Opportunità o un eventuale futuro concetto di Immobile: Soggetto proponente, Soggetto destinatario e Controparte ricercata sono sempre ruoli o criteri che referenziano entità di altri domini o soggetti esterni, mai nuove schede descrittive parallele; un immobile o uno spazio ricercato od offerto è trattato come Oggetto della collaborazione (§7), non come una nuova entità di dominio.

---

## 3. Natura della Collaborazione

**Natura di processo.** Una Collaborazione non è solo un'intenzione, solo un accordo, solo una relazione o solo uno stato: è un processo che, nelle sue fasi, produce un'intenzione dichiarata, una proposta e, se le condizioni si verificano, una relazione collaborativa (tesi §6). Esiste già nella fase dichiarativa; la fase relazionale è un'evoluzione possibile.

Una Collaborazione si distingue dai concetti affini per la presenza contemporanea di almeno questi elementi:

- **Un soggetto proponente** — chi avvia la ricerca, l'offerta o la proposta (Persona o Impresa).
- **Una finalità** — perché la Collaborazione esiste (es. trovare un fornitore, offrire una competenza).
- **Un oggetto** — cosa è concretamente al centro della relazione ricercata (§7).
- **Una controparte ricercata o individuabile** — anche solo descritta per criteri, senza che sia già stata trovata (non obbligatoria come soggetto già identificato: la Collaborazione può esistere con un solo dichiarante).
- **Condizioni o preferenze** — anche minime (§7).
- **Una disponibilità attuale o futura** — il proponente deve essere realmente nella posizione di avviare la relazione, ora o in un momento definito.

**Distinzioni.**
- **Semplice informazione o annuncio generico** — manca di una controparte individuabile con criteri precisi, o di condizioni; resta un contenuto informativo, non una Collaborazione (coerente con `logical/opportunita.md` §3 per la stessa distinzione applicata alle Opportunità). Un contatto occasionale o una menzione informale non diventano Collaborazione per il solo fatto di essere cooperativi (PC6; tesi §4 H5).
- **Opportunità** — ha un Promotore con un beneficio predefinito, requisiti espliciti e tipicamente un esito di accesso; non è una ricerca di controparte da parte di chi la dichiara (introduzione, §1; decisione vincolante 7 di `domain-model.md`). Collaborazioni non incorpora annuncio formale, pubblicazione di bando né procedura di ammissibilità di Opportunità.
- **Richiesta di contatto o messaggio** — manca di una struttura di oggetto, finalità e condizioni: è comunicazione, non una proposta strutturata (§1).
- **Appartenenza** — è un legame organizzativo già stabile e strutturato; una Collaborazione non diventa mai, di per sé, un'Appartenenza (V10; tesi §8).
- **Relazione già contrattualizzata, compravendita, rapporto di lavoro, prestazione professionale già affidata** — sono l'esito, quando raggiunto, di un percorso che può essere iniziato come Collaborazione, ma che a quel punto è uscito dal perimetro di questo dominio (§1): la Collaborazione descrive la ricerca, l'incontro e l'eventuale cooperazione attiva dichiarata, non l'esecuzione operativa né il contratto.

---

## 4. Domanda, offerta e proposta congiunta

- **Ricerca di una risorsa o controparte** — una Collaborazione direzionale basata su un'Esigenza dichiarata ("cerco X").
- **Offerta di una risorsa, prodotto, servizio o competenza** — una Collaborazione direzionale basata su un'Offerta dichiarata ("offro X").
- **Proposta di partnership** — tipicamente reciproca: non una semplice domanda o offerta, ma una proposta di relazione paritaria tra due o più soggetti.
- **Proposta di progetto comune** — analoga alla partnership, spesso multilaterale, orientata a un obiettivo condiviso piuttosto che a uno scambio domanda/offerta.
- **Disponibilità a valutare collaborazioni** — una forma più aperta, senza un'Esigenza o un'Offerta specifica già dichiarata: il proponente segnala apertura, non una ricerca precisa.
- **Incontro tra domanda e offerta** — il momento in cui una Collaborazione di ricerca e una di offerta (o una Manifestazione di interesse/Candidatura, §9) si intersecano, rilevato come Abbinamento (§10).
- **Collaborazione già avviata** — corrisponde allo stato della relazione "Avviata" o successivo (§8): l'incontro è avvenuto e la relazione concreta è in corso.
- **Collaborazione conclusa** — corrisponde a uno stato terminale della relazione (§8), con un Esito dichiarato.

**Principio.** Alcune Collaborazioni sono **direzionali** (una parte cerca, l'altra offre: es. "cerco fornitori"), mentre altre sono **reciproche o multilaterali** (nessuna delle parti è unicamente "chi cerca" o "chi offre": es. una proposta di partnership o di progetto comune tra più soggetti su base paritaria). Il dominio non forza ogni Collaborazione in uno schema direzionale: una proposta congiunta è un caso pienamente legittimo e distinto.

---

## 5. Tipologie di Collaborazione

La classificazione è volutamente ampia e non si limita ai soli rapporti commerciali: una Collaborazione può assumere una o più tipologie contemporaneamente, secondo lo stesso principio di non esclusività già adottato per le tipologie di Attività internazionale (`logical/mercati-internazionali.md` §5) e di Opportunità (`logical/opportunita.md` §4).

| Gruppo | Tipologie |
|---|---|
| Commerciali | Commerciale; fornitura; acquisto; vendita; distribuzione; agenzia; rappresentanza commerciale |
| Produttive e logistiche | Subfornitura; produzione; logistica |
| Professionali e progettuali | Progettazione; consulenza; prestazione professionale; ricerca personale; lavoro o collaborazione professionale |
| Societarie e finanziarie | Partnership; joint venture; investimento; finanziamento |
| Internazionali | Internazionalizzazione |
| Ricerca di soggetti o risorse | Ricerca clienti; ricerca fornitori; ricerca distributori; ricerca partner; ricerca professionisti; ricerca personale; ricerca investitori; ricerca spazi o immobili |
| Spazi | Condivisione di spazi |
| Partecipative | Partecipazione a gare; partecipazione a fiere |
| Sociali e innovative | Progetto sociale o territoriale; innovazione e ricerca; formazione; trasferimento di competenze |
| Residuale | Altre forme di cooperazione economica o professionale |

---

## 6. Soggetti e ruoli nella Collaborazione

**Partecipanti ammessi oggi.** Solo **Persona** e **Impresa** possiedono un'identità fondazionale referenziabile (D19, D20; tesi §9). Ogni Collaborazione ha almeno un proponente tra questi due tipi.

**Ruoli.** I ruoli appartengono alla Collaborazione, non ai partecipanti (tesi §10; PL4). Catalogo locale di questo dominio — non riutilizza i Ruoli di Appartenenze (Titolare, Socio, Dipendente…). Ruoli previsti: Soggetto proponente; Soggetto destinatario; controparte ricercata (criterio, non soggetto); candidato; soggetto interessato; soggetto invitato; partner; referente; intermediario; facilitatore; osservatore autorizzato. Il catalogo esatto resta raffinabile (tesi §16, punto 3).

**Relazione con gli altri domini.**

| Soggetto / concetto | Dominio di appartenenza | Come si collega a Collaborazioni |
|---|---|---|
| Persona | Persone (esterno) | Referenziata come proponente, candidato, soggetto interessato o partner, per identità stabile (D19, Necessaria) |
| Impresa | Imprese (esterno) | Referenziata come proponente o controparte, per identità stabile (D20, Necessaria) |
| Appartenenza | Appartenenze (esterno) | Utilizzata (non posseduta) per il titolo con cui una Persona agisce per conto di un'Impresa (D23; principio sotto) |
| Profilo professionale | Professionisti (esterno) | Referenziato in modo **facoltativo** quando la proposta coinvolge una qualificazione (D21). Non è una terza categoria di partecipante: il partecipante resta la Persona sottostante (tesi §9) |
| Rete, associazione, ente, università | Nessun dominio fondazionale attuale (Organizzazioni istituzionali non ancora riconciliato) | Solo riferimento informativo esterno, senza scheda propria né partecipazione a pieno titolo fino a quel dominio (tesi §9, §13) |
| Soggetto esterno non ancora presente sulla piattaforma | Nessuno (riferimento informativo) | Trattato come riferimento, senza identità piena sulla piattaforma (§13) |

**Principio sul titolo di rappresentanza.** Con quale titolo una Persona agisce per conto di un'Impresa in una Collaborazione (proponendola, candidandosi a suo nome, negoziando per essa) deriva sempre da un'**Appartenenza** esistente (`logical/appartenenze.md`), non dalla Collaborazione stessa: la Collaborazione non crea, non modifica e non presume alcuna Appartenenza, e non attribuisce da sola alcuna rappresentanza (§13, regola vincolante; DA10/DA11). Se non esiste un'Appartenenza con il titolo adeguato, la Persona non può agire per l'Impresa in una Collaborazione, indipendentemente da qualsiasi ruolo assunto all'interno della Collaborazione stessa.

---

## 7. Oggetto, esigenze e condizioni

- **Oggetto della Collaborazione** — cosa è concretamente al centro della relazione ricercata (§2).
- **Bisogno da soddisfare** — la componente informativa dell'Esigenza (§2), quando presente.
- **Valore offerto** — la componente informativa dell'Offerta (§2), quando presente.
- **Risultato atteso** — cosa il proponente si aspetta di ottenere dalla relazione, distinto dall'Esito effettivo che si verificherà (§8).
- **Caratteristiche richieste alla controparte** — l'insieme di Requisiti e Preferenze (§2) che descrivono la controparte ideale o necessaria.
- **Requisiti obbligatori** — condizioni la cui assenza esclude la controparte dalla considerazione.
- **Preferenze** — condizioni che favoriscono, senza escludere.
- **Condizioni economiche** — termini relativi a prezzo, compenso, investimento o altro valore economico, potenzialmente negoziabili.
- **Condizioni non economiche** — termini relativi ad aspetti diversi (es. tempistiche, modalità operative), anch'essi potenzialmente negoziabili.
- **Disponibilità geografica** — dove il proponente è disposto a operare o dove richiede che operi la controparte.
- **Disponibilità temporale** — quando la Collaborazione può essere avviata o entro quando resta ricercabile (§2).
- **Quantità** — un volume o una misura quantitativa rilevante per l'oggetto (es. quantità di un prodotto ricercato).
- **Capacità** — la capacità produttiva, operativa o professionale richiesta o offerta.
- **Settore** — l'ambito economico di riferimento (§11).
- **Esperienza** — un livello di esperienza richiesto o offerto.
- **Certificazioni** — un possesso di certificazioni richiesto o dichiarato, analogo per ruolo alla CertificazioneImpresa (`logical/imprese.md` §2), qui referenziata come Requisito o come informazione descrittiva dell'Offerta.
- **Lingue** — una competenza linguistica richiesta o offerta, referenziata da LinguaOperativaImpresa o LinguaParlata (senza duplicazione, coerente con `logical/mercati-internazionali.md` §9).
- **Mercati internazionali** — un collegamento a un Mercato di riferimento (§11).
- **Eventuale riservatezza** — la possibilità che una o più condizioni non siano rese pubbliche (§12).

**Distinzioni da mantenere sempre separate.**
- **Requisito** — una condizione vincolante: la sua assenza esclude.
- **Preferenza** — una condizione non vincolante: la sua assenza sfavorisce, senza escludere.
- **Condizione negoziabile** — un termine (economico o non) che le parti possono discutere e modificare nel corso della relazione, distinto da un Requisito fisso.
- **Informazione descrittiva** — un dato che descrive l'Oggetto o il contesto della Collaborazione senza costituire né un Requisito né una Preferenza né una Condizione negoziabile (es. una descrizione generale del progetto).

---

## 8. Ciclo di vita della Collaborazione

Il percorso di una Collaborazione è descritto da **sei assi distinti**, che non devono mai essere compressi in un unico stato (PF7) — un'articolazione ancora più ricca di quella già adottata per l'Opportunità (`logical/opportunita.md` §8, cinque assi), giustificata dalla natura di processo (dichiarativo → eventualmente relazionale) di questo dominio (§3; tesi §6, §11).

**Esistenza dalla dichiarazione.** La Collaborazione esiste già dallo stato editoriale *Bozza* / *Proposta* (fase dichiarativa), indipendentemente dallo stato della relazione. Lo **Stato della relazione** (asse c) diventa applicabile solo quando le parti raggiungono un Accordo preliminare o un impegno concreto; prima di quel momento, il fatto resta dichiarativo e PF4 non descrive ancora una relazione bilaterale piena (tesi §14).

**a) Stato editoriale (fase redazionale).**
- *Bozza* — il proponente sta preparando la Collaborazione, non ancora formalizzata. Il fatto esiste già.
- *Proposta* — è stata formalizzata dal proponente (dichiarazione di esigenza o offerta).
- *Segnalata* — è stata portata all'attenzione della redazione per una valutazione, quando prevista.
- *In valutazione* — la redazione, o chi ne ha titolo, sta valutando se e come renderla visibile.
- *Pubblicata* — è stata resa visibile secondo le regole di visibilità applicabili (§12). Questa "pubblicazione" è visibilità della Collaborazione, non l'annuncio formale tipico di un'Opportunità.

**b) Stato della ricerca.** Descrive il percorso specifico dell'incontro tra domanda e offerta, una volta che la Collaborazione è visibile (o diretta a un destinatario):
- *Aperta* — è possibile manifestare interesse o candidarsi (§9).
- *Interesse ricevuto* — almeno una Manifestazione di interesse o Candidatura è stata registrata.
- *In contatto* — il proponente e almeno un soggetto interessato hanno un contatto autorizzato (§9).
- *In valutazione reciproca* — le parti si stanno valutando a vicenda, senza ancora un impegno.
- *Negoziazione* — le parti stanno discutendo condizioni concrete (§7).
- *Accordo preliminare* — le parti hanno raggiunto un'intesa di massima, non ancora un impegno definitivo (§1 — distinto da un contratto).

**c) Stato della relazione.** Descrive dove si trova, nel proprio percorso reale, la relazione **una volta** che un Accordo preliminare (o un incontro diretto, nei casi più semplici) ha dato origine a un impegno concreto. Prima di quel momento questo asse non è applicabile (fase ancora solo dichiarativa). Valori:
- *Avviata* — la relazione concreta ha avuto inizio (evento CollaborazioneAvviata).
- *Attiva* — la relazione è in corso.
- *Sospesa* — temporaneamente non operativa, in modo reversibile (distinta da Conclusa e da Annullata; tesi §12).
- *Conclusa* — la relazione è terminata in modo ordinario (evento CollaborazioneConclusa).
- *Non riuscita* — la ricerca o la relazione non ha portato ad alcun esito positivo (distinta da Conclusa, che presuppone un ciclo completo con esito).
- *Ritirata* — il proponente ha ritirato la Collaborazione, in qualsiasi fase, prima o dopo aver ricevuto candidature (§13). Distinta dalla Scadenza (esaurimento di un termine).
- *Annullata* — la Collaborazione non avrà più seguito, per decisione del proponente o della piattaforma, indipendentemente da un vizio riconosciuto.
- *Archiviata* — stato finale di conservazione storica, successivo a Conclusa, Non riuscita, Ritirata o Annullata (PF8).

**d) Stato di verifica.**
- *Non verificata* — nessun controllo è stato effettuato; stato di default.
- *Contestata* — una delle parti, o un terzo con titolo per farlo, ha messo in dubbio quanto dichiarato (§12); può sovrapporsi in qualsiasi momento agli altri assi.

**e) Visibilità.** Un quinto asse, trattato integralmente al §12: descrive chi può conoscere l'esistenza e i dettagli della Collaborazione, delle Manifestazioni di interesse e delle Candidature.

**f) Esito.** Un sesto asse, distinto dallo stato della relazione che lo determina: descrive il risultato qualitativo dichiarato (positivo, negativo, parziale, non comunicato, §13) quando la relazione raggiunge uno stato terminale (Conclusa, Non riuscita, Ritirata, Annullata).

**Perché i sei assi restano separati.** Una Collaborazione può essere Pubblicata (asse a) e Aperta (asse b) senza aver ancora ricevuto alcuna Manifestazione di interesse; può essere In negoziazione (asse b) e contemporaneamente Non verificata (asse d); può raggiungere un Accordo preliminare (asse b) e transitare verso una relazione Avviata (asse c) con un Esito ancora "non comunicato" (asse f) se le parti non aggiornano la piattaforma. Comprimere questi sei assi in un'unica proprietà obbligherebbe a scegliere significati impropri per combinazioni reali e frequenti, coerente con il principio già adottato in tutti i domini logici precedenti.

---

## 9. Manifestazioni di interesse e candidature

**Confine con Opportunità.** Manifestazione di interesse, candidatura e abbinamento di questo dominio appartengono al percorso aperto di Collaborazioni (tesi §11; `domain-mapping/appartenenze.md` §20). Non incorporano il processo formale di Opportunità (annuncio con requisiti espliciti, procedura di ammissibilità, esito binario di accesso). Una Collaborazione può esistere e trovare una controparte anche senza alcuna candidatura formale, tramite contatto diretto o invito (§4).

- **Manifestazione di interesse** — un segnale, anche informale, che un soggetto è interessato alla Collaborazione, senza ancora una risposta strutturata (§2).
- **Candidatura** — una risposta più strutturata, con l'intento di essere selezionato come controparte; può essere preceduta da una Manifestazione di interesse o presentata direttamente. Non richiede, di per sé, i requisiti espliciti tipici di un'Opportunità.
- **Invito** — il proponente contatta direttamente un soggetto specifico, invece di attendere manifestazioni spontanee.
- **Proposta diretta** — analoga all'Invito, quando il proponente stesso individua e si rivolge a una controparte specifica fin dall'inizio.
- **Risposta del proponente** — l'esito che il proponente comunica a una Manifestazione di interesse o Candidatura (accettazione, rifiuto, richiesta di ulteriori informazioni).
- **Richiesta di informazioni** — uno scambio preliminare, non ancora una Candidatura formale né un contatto pienamente autorizzato.
- **Accettazione del contatto** — il momento in cui il proponente autorizza un contatto più diretto con un soggetto interessato (evento ContattoAutorizzato, §14).
- **Rifiuto** — il proponente comunica che una Manifestazione di interesse o Candidatura non sarà considerata ulteriormente.
- **Ritiro** — il soggetto interessato ritira la propria Manifestazione di interesse o Candidatura.
- **Scadenza** — la Disponibilità temporale (§2, §7) della Collaborazione termina senza che la Manifestazione di interesse o Candidatura abbia ricevuto una risposta.
- **Esclusione** — il proponente esclude esplicitamente un soggetto dalla valutazione, distinto da un semplice Rifiuto per la sua motivazione tipicamente legata al mancato rispetto di un Requisito.
- **Inserimento in valutazione** — la Candidatura o Manifestazione di interesse è stata presa in carico per un esame più approfondito.

**Principi.**
- Manifestare interesse **non crea automaticamente** una Collaborazione attiva (§8, asse c): resta nello stato della ricerca (asse b) fino a un eventuale Accordo preliminare.
- Accettare un contatto **non equivale ad accordo**: l'Accettazione del contatto è un passaggio dello stato della ricerca, non dello stato della relazione.
- **Più soggetti possono manifestare interesse** o candidarsi per la stessa Collaborazione, senza limiti impliciti.
- Il proponente **può selezionare una o più controparti**, secondo la natura della Collaborazione (una singola controparte per una relazione esclusiva, più controparti per una relazione non esclusiva, es. più fornitori selezionati).
- Una candidatura **può essere privata anche se la Collaborazione è pubblica** (§12): la visibilità della Collaborazione stessa e quella delle singole Manifestazioni di interesse o Candidature sono assi distinti.

---

## 10. Abbinamento e compatibilità

Un **Abbinamento** (§2) è il rilevamento, algoritmico o redazionale, di una possibile corrispondenza tra l'Esigenza o l'Offerta del proponente e le caratteristiche di un soggetto potenzialmente compatibile, sulla base di: territorio; settore; Mercato di riferimento; disponibilità; Requisiti; Preferenze.

**Gradazione, dalla meno alla più certa.**
- **Compatibilità potenziale** — una corrispondenza di base individuata automaticamente o redazionalmente, senza alcuna verifica.
- **Corrispondenza parziale** — alcuni criteri corrispondono, altri no o non sono noti.
- **Corrispondenza elevata** — la maggior parte dei criteri dichiarati corrisponde.
- **Interesse reciproco** — entrambe le parti hanno manifestato interesse l'una verso l'altra (§9), indipendentemente dal grado di corrispondenza sui criteri.
- **Verifica dei requisiti** — i Requisiti obbligatori (§7) sono stati effettivamente controllati, non solo confrontati automaticamente.
- **Selezione** — il proponente ha scelto attivamente una o più controparti tra quelle disponibili.
- **Accordo** — corrisponde all'Accordo preliminare (§8): il grado più alto rappresentato in questo dominio, ancora distinto da un contratto (§1).

**Principio cardine.** La piattaforma non deve presentare un Abbinamento — a qualunque grado della gradazione sopra — come **garanzia di affidabilità, successo o conclusione dell'accordo**: ogni grado descrive solo quanto due profili si corrispondono o quanto le parti hanno mostrato interesse reciproco, mai una previsione o una certificazione del risultato finale della relazione.

---

## 11. Mercati internazionali, territori e settori

**Collegamenti previsti.** Territorio locale; Regione; Italia; Paese estero; Area economica; Mercato internazionale; settore; filiera; canale commerciale; lingua operativa.

**Distinzioni da mantenere sempre separate**, coerenti con l'approccio già adottato in `logical/opportunita.md` §10:

- **Luogo del proponente** — dove si trova o opera chi propone la Collaborazione.
- **Luogo della controparte** — dove si trova o dovrebbe trovarsi la controparte ricercata o individuata.
- **Luogo di esecuzione** — dove concretamente si svolgerà la relazione una volta avviata (che può differire dal luogo di entrambe le parti, es. un progetto realizzato in un Paese terzo).
- **Mercato di destinazione** — il Mercato internazionale (`logical/mercati-internazionali.md`) verso cui la Collaborazione è orientata, quando di natura internazionale.
- **Territorio ricercato** — un Requisito o una Preferenza territoriale relativa alla controparte (§7).
- **Area di disponibilità** — l'ambito geografico entro cui il proponente è disposto a considerare una relazione, più ampio o diverso dal Territorio ricercato in senso stretto.

**Principio.** Una Collaborazione internazionale deve referenziare uno o più Mercati Internazionali (`logical/mercati-internazionali.md` §2) per contestualizzarsi, senza incorporarne il modello: il Mercato resta governato e definito esclusivamente da quel dominio, mentre questo dominio si limita a dichiarare la relazione, con lo stesso principio già adottato per le Opportunità internazionali (`logical/opportunita.md` §10).

---

## 12. Verifica, affidabilità e visibilità

**Assi di verifica**, coerenti con l'approccio già adottato in `logical/imprese.md` §8, `logical/appartenenze.md` §10, `logical/mercati-internazionali.md` §10 e `logical/opportunita.md` §11:

- **Identità del proponente** — la piattaforma ha potuto confermare chi è realmente il proponente.
- **Esistenza dell'Impresa** — quando il proponente agisce per un'Impresa, la piattaforma ha potuto confermare che l'Impresa esiste realmente.
- **Titolo della Persona ad agire** — la piattaforma ha potuto confermare che la Persona ha effettivamente un'Appartenenza con il titolo dichiarato (§6).
- **Autenticità dell'esigenza** — la piattaforma ha potuto confermare che il bisogno dichiarato è reale.
- **Autenticità dell'offerta** — la piattaforma ha potuto confermare che la disponibilità dichiarata è reale.
- **Requisiti dichiarati** — la piattaforma ha potuto confermare che i Requisiti corrispondono a quelli realmente applicati dal proponente.
- **Capacità dichiarate** — la piattaforma ha potuto confermare le capacità (produttive, operative, professionali) dichiarate da chi offre o si candida.
- **Contatti** — la piattaforma ha potuto confermare la validità dei canali di contatto dichiarati, senza gestirne il contenuto (§1).
- **Eventuali certificazioni** — la piattaforma ha potuto confermare le certificazioni dichiarate (§7), analogamente a CertificazioneImpresa (`logical/imprese.md` §2).
- **Relazione tra le parti** — la piattaforma ha potuto confermare che una relazione dichiarata (es. un Accordo preliminare) è realmente riconosciuta da entrambe le parti.
- **Esito dichiarato** — la piattaforma ha potuto confermare l'Esito comunicato al termine della relazione (§8).

**Visibilità.** Chi può conoscere l'esistenza e i dettagli (asse distinto da verifica, stato della relazione e stato editoriale — PF7):
- **Privata** — nota solo al proponente.
- **Visibile solo su invito** — nota ai soli soggetti direttamente invitati (§9).
- **Visibile a una rete** — nota a chi appartiene a una rete o comunità specifica.
- **Visibile a soggetti compatibili** — nota a chi risulta in Abbinamento (§10) con la Collaborazione, senza essere pubblica in senso generale.
- **Pubblica** — visibile a chiunque consulti la piattaforma.
- **Riservata alla redazione** — nota solo alla redazione, tipicamente durante la valutazione (§8, asse a).
- **Anonima verso il pubblico** — visibile nei contenuti essenziali, ma senza rivelare l'identità del proponente o della controparte.
- **Con identità rivelata dopo accettazione** — l'identità resta nascosta fino a quando il proponente non accetta un contatto (§9), dopo il quale diventa visibile alla controparte coinvolta.

**Nota.** Contestazione, sospensione e archiviazione non sono livelli di visibilità: restano rispettivamente sullo stato di verifica, sullo stato della relazione e sullo stato storico/terminale (§8). La presentazione pubblica può rifletterli, senza fonderli in questo asse (PF7).

**Principio sulla coerenza tra domini.** La visibilità dei soggetti e dei dati coinvolti in una Collaborazione non deve mai eccedere quella consentita dai rispettivi domini: una Collaborazione che coinvolge un'Impresa non pubblica non può rivelarne l'identità pubblicamente; una Persona con profilo non pubblico non può essere identificata pubblicamente come proponente o candidato, coerente con il principio già stabilito in `logical/imprese.md` §9, `logical/appartenenze.md` §11 e `logical/mercati-internazionali.md` §11.

**Perché non un badge unico.** Un badge generico "Collaborazione verificata" nasconderebbe quale specifico aspetto è stato confermato: una Collaborazione può avere l'Identità del proponente confermata ma l'Autenticità dell'esigenza non ancora verificata; può avere i Requisiti confermati ma nessuna verifica sulle Capacità dichiarate dai candidati. Mantenere gli assi separati, ciascuno con la propria Fonte (§2), permette di comunicare con precisione cosa la piattaforma sa per certo, coerente con il medesimo principio già adottato in tutti i domini logici precedenti.

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Collaborazione deve avere un proponente identificabile, Persona o Impresa (§6; D19/D20).
2. Ogni Collaborazione deve avere un oggetto e una finalità (§3): l'assenza di questi elementi la riporta al livello di semplice annuncio o informazione.
3. Una Collaborazione esiste già nella fase dichiarativa (§1, §8): non richiede una controparte già individuata né uno stato della relazione Avviata/Attiva.
4. L'identità della Collaborazione non deriva dall'identità di alcun partecipante (PF5; §2).
5. I ruoli (proponente, destinatario, …) appartengono alla Collaborazione, non ai partecipanti (§6; tesi §10; PL4).
6. Una Collaborazione può cercare una o più controparti (§9): non è limitata a una relazione esclusiva salvo che la sua natura lo richieda.
7. Una Persona può agire per un'Impresa solo con un titolo rappresentato da un'Appartenenza (§6): nessuna eccezione.
8. La Collaborazione non attribuisce rappresentanza (§6): il titolo di rappresentanza deriva sempre da un'Appartenenza preesistente, mai dalla Collaborazione stessa; Collaborazioni lo utilizza, non lo verifica in parallelo.
9. Una Collaborazione non diventa mai, di per sé, un'Appartenenza; non assorbe relazioni già consolidate (V10; tesi §8).
10. La Collaborazione non attribuisce diritti di accesso: ogni fatto qui registrato è un fatto di dominio, non un permesso tecnico (PF6, PF13).
11. Una manifestazione di interesse non equivale ad accordo (§9).
12. Un abbinamento non equivale a verifica (§10): la corrispondenza tra criteri non implica che i Requisiti siano stati effettivamente controllati.
13. Un accordo preliminare non equivale a contratto definitivo (§1, §8).
14. La conclusione positiva o negativa deve poter essere storicizzata (§8, Esito; PF8): nessun esito viene perso al concludersi della relazione.
15. Una Collaborazione contestata non deve essere cancellata automaticamente (§8): resta con l'indicazione dello stato di verifica appropriato (PCa1 candidata).
16. La visibilità delle candidature può essere più restrittiva di quella della Collaborazione (§9, §12): sono assi indipendenti (PF7).
17. Una Collaborazione può esistere senza alcuna Opportunità (introduzione, §1).
18. Una Collaborazione può nascere da un'Opportunità (introduzione, §1, §4), mantenendo il riferimento all'origine (D22) senza dipenderne per la propria esistenza; Opportunità non referenzia Collaborazioni (nessun ciclo).
19. Collaborazioni non incorpora il processo formale di Opportunità (annuncio, requisiti espliciti, esito binario di accesso) (§9; tesi §8).
20. Una Collaborazione può referenziare un Mercato internazionale (§11), senza incorporarne il modello né l'Esigenza di internazionalizzazione.
21. Professionista non è una terza categoria di partecipante: si referenzia in modo facoltativo il Profilo professionale della Persona (§6; D21; tesi §9).
22. La piattaforma non garantisce affidabilità, esecuzione o successo del rapporto (§10; PF10): ogni grado di Abbinamento resta un'indicazione, non una promessa.
23. Il dominio deve poter alimentare l'Osservatorio solo con dati aggregati e compatibili con la riservatezza (§1, §12).

**Casi limite.**

**Persona che pubblica per conto di un'Impresa senza rappresentanza legale.** Ammesso quando esiste un'Appartenenza con un'Autorizzazione gestionale o un titolo equivalente (`logical/appartenenze.md` §2, §8): la Collaborazione non richiede di per sé una rappresentanza legale, solo un titolo adeguato secondo le regole del dominio Appartenenze (§6, regola 4).

**Impresa con più referenti.** Più Persone possono avere un'Appartenenza con titolo adeguato verso la stessa Impresa (`logical/appartenenze.md` §12, regola 3): ciascuna può, in linea di principio, agire per l'Impresa in Collaborazioni distinte, salvo diversa organizzazione interna non modellata da questo dominio.

**Richiesta di più fornitori contemporaneamente.** Corrisponde a una Collaborazione che seleziona più controparti (§13, regola 3): pienamente prevista.

**Collaborazione con più partner.** Corrisponde a una proposta multilaterale (§4): il dominio non limita il numero di soggetti coinvolti in una proposta congiunta.

**Collaborazione multilaterale.** Analoga al caso precedente: più proponenti possono condividere la stessa Collaborazione su base paritaria (§4), distinta da una relazione con un unico proponente e più controparti.

**Collaborazione anonima.** Corrisponde alla visibilità "Anonima verso il pubblico" (§12): pienamente prevista, con l'identità che può restare nascosta anche dopo la pubblicazione.

**Identità resa visibile solo dopo accettazione.** Corrisponde alla visibilità "Con identità rivelata dopo accettazione" (§12): distinta dall'anonimato permanente.

**Soggetto esterno non registrato.** Trattato come riferimento informativo (§6): il dominio ammette che una controparte non abbia ancora una rappresentazione propria sulla piattaforma.

**Collaborazione internazionale.** Trattata al §11: piena previsione tramite il collegamento a uno o più Mercati Internazionali.

**Ricerca di immobile o spazio.** Trattata come Oggetto della collaborazione (§2, §7): il dominio supporta questo caso senza incorporare un futuro dominio Immobiliare, che resterebbe responsabile di una eventuale scheda descrittiva propria di un immobile, se introdotto in futuro (questione aperta, §15).

**Ricerca di personale.** Rientra nelle tipologie "ricerca personale" e "lavoro o collaborazione professionale" (§5): trattata come qualunque altra Collaborazione di ricerca, con Requisiti e Preferenze relative al profilo ricercato (§7).

**Proposta di investimento.** Rientra nella tipologia "investimento" (§5): può essere direzionale (un'Impresa cerca un investitore) o, in alcuni casi, reciproca.

**Ricerca di cliente.** Rientra nella tipologia "ricerca clienti" (§5): una delle configurazioni più comuni del dominio.

**Offerta di servizi.** Rientra nella forma "Offerta" (§2, §4): una Collaborazione basata su una disponibilità dichiarata, distinta da un'OffertaDiServizio del futuro dominio Servizi e dal Servizio professionale dichiarato di Professionisti, con cui può coesistere senza sovrapporsi concettualmente (tesi §8; questione di confine aperta, §15).

**Collaborazione senza condizioni economiche definite.** Ammessa: le Condizioni economiche (§7) sono facoltative, non un requisito minimo di esistenza della Collaborazione (§3).

**Collaborazione con budget riservato.** Corrisponde a una Condizione economica dichiarata come riservata (§7, §12): visibile solo secondo le regole di visibilità applicabili, non pubblicata di default.

**Collaborazione senza scadenza.** Corrisponde a una Disponibilità temporale aperta o non definita (§2, §7): legittima, analoga al caso "Opportunità continuativa" di `logical/opportunita.md` §9.

**Proposta ritirata dopo aver ricevuto candidature.** Corrisponde allo stato della relazione "Ritirata" (§8): le Candidature già presentate restano storicizzate anche dopo il ritiro.

**Accordo raggiunto fuori dalla piattaforma.** Il dominio può registrare che una Collaborazione è transitata verso un Esito positivo anche se il perfezionamento concreto (contratto, esecuzione) è avvenuto fuori dalla piattaforma: non è compito di questo dominio verificare né rappresentare quel perfezionamento (§1).

**Esito non comunicato.** Corrisponde all'Esito "non comunicato" (§2, §8): una Collaborazione può raggiungere uno stato terminale della relazione senza che le parti forniscano un Esito qualitativo esplicito.

**Contestazione tra le parti.** Corrisponde allo stato di verifica "Contestata" (§8, §12): il dominio la rappresenta come fatto, senza gestirne la risoluzione legale (§1).

**Collaborazione conclusa negativamente.** Corrisponde a un Esito "negativo" con stato della relazione "Non riuscita" o "Conclusa" (§8): entrambe le informazioni restano storicizzate.

**Collaborazione collegata a un'Impresa cessata.** Le Collaborazioni di un'Impresa cessata (`logical/imprese.md` §5) transitano tipicamente verso stati terminali (Conclusa, Non riuscita, Annullata) e restano storicizzate, coerente con l'approccio già adottato in `logical/mercati-internazionali.md` §13 per un caso analogo.

**Più candidature accettate.** Ammesso quando la natura della Collaborazione lo consente (§13, regola 3): il dominio non presume l'esclusività di una selezione.

**Richiesta duplicata.** Il dominio non impedisce concettualmente che due Collaborazioni simili coesistano (es. lo stesso proponente con due ricerche distinte): la gestione di eventuali duplicati resta una questione di qualità redazionale (stato editoriale, §8), non un vincolo di dominio.

**Collaborazione ricorrente.** Analoga alle edizioni successive di un'Opportunità (`logical/opportunita.md` §9): ogni ricorrenza è trattata come una Collaborazione distinta, con un riferimento facoltativo a un'occorrenza precedente, senza continuità automatica di stato.

**Collaborazione derivata da Opportunità ormai scaduta.** Ammessa: la Collaborazione, una volta nata da un'Opportunità (§4), non dipende dallo stato corrente di quest'ultima per continuare a esistere e a evolvere secondo il proprio ciclo di vita (§8).

---

## 14. Eventi di dominio

- **CollaborazioneCreata** — è stata avviata la preparazione di una nuova Collaborazione (stato editoriale "Bozza").
- **CollaborazioneProposta** — la Collaborazione è stata formalizzata dal proponente.
- **CollaborazionePubblicata** — la Collaborazione è diventata visibile secondo le regole applicabili (§12).
- **CollaborazioneAperta** — è diventato possibile manifestare interesse o candidarsi.
- **CollaborazioneModificata** — una o più proprietà rilevanti sono cambiate rispetto alla dichiarazione originaria.
- **ManifestazioneInteressePresentata** — un soggetto ha segnalato interesse (§9).
- **ManifestazioneInteresseRitirata** — un soggetto ha ritirato la propria Manifestazione di interesse.
- **CandidaturaPresentata** — un soggetto ha presentato una risposta formale e strutturata (§9).
- **CandidaturaAccettata** — il proponente ha accettato una Candidatura.
- **CandidaturaRifiutata** — il proponente ha rifiutato una Candidatura.
- **ContattoAutorizzato** — il proponente ha autorizzato un contatto più diretto con un soggetto interessato (§1, §9).
- **InteresseReciprocoRilevato** — entrambe le parti hanno manifestato interesse l'una verso l'altra (§10).
- **AbbinamentoRilevato** — è stata individuata una possibile corrispondenza tra la Collaborazione e un soggetto (§10).
- **NegoziazioneAvviata** — le parti hanno iniziato a discutere condizioni concrete (§8).
- **AccordoPreliminareRaggiunto** — le parti hanno raggiunto un'intesa di massima (§8).
- **CollaborazioneAvviata** — la relazione concreta ha avuto inizio (§8).
- **CollaborazioneSospesa** — la relazione è stata temporaneamente resa non operativa.
- **CollaborazioneConclusa** — la relazione è terminata in modo ordinario, con un Esito dichiarato.
- **CollaborazioneNonRiuscita** — la ricerca o la relazione non ha portato ad alcun esito positivo.
- **CollaborazioneRitirata** — il proponente ha ritirato la Collaborazione.
- **CollaborazioneContestata** — la Collaborazione è stata messa in dubbio da una delle parti o da un terzo con titolo per farlo.
- **CollaborazioneArchiviata** — la Collaborazione è stata ritirata dai percorsi di consultazione correnti, restando conservata come riferimento storico.
- **VisibilitàCollaborazioneModificata** — il livello di visibilità della Collaborazione, o di una sua Manifestazione di interesse/Candidatura, è cambiato (§12).
- **FonteCollaborazioneAggiornata** — la Fonte a supporto di un'informazione dichiarata è stata aggiornata, confermata o segnalata come obsoleta.

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Notifiche, Ricerca, Osservatorio) possono voler conoscere per reagire — ad esempio, le Notifiche possono informare il proponente alla comparsa di una nuova CandidaturaPresentata, o l'Osservatorio può aggiornare le proprie statistiche alla comparsa di una CollaborazioneConclusa — senza che questo dominio debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate** (allineate alla Domain Thesis).

1. Collaborazioni è un dominio autonomo, con proprie entità, proprio ciclo di vita e proprie regole (§1; tesi §5, §17).
2. Collaborazioni e Opportunità sono domini distinti (introduzione, §1; decisione vincolante 7 di `domain-model.md`): una Collaborazione può nascere da un'Opportunità (D22) ma può esistere autonomamente; non incorpora il processo formale di Opportunità (§9, §13).
3. Collaborazioni e messaggistica sono concetti distinti (§1): il dominio registra il fatto di un contatto autorizzato, non il suo contenuto.
4. Collaborazioni e contratti sono concetti distinti (§1): l'Accordo preliminare resta un fatto di dominio, non un impegno giuridico.
5. La Collaborazione è un processo: esiste già nella fase dichiarativa e può evolvere in relazione attiva (§1, §3, §8; tesi §6).
6. PF4 si applica alla fase relazionale; PF5 all'identità indipendente in entrambe le fasi (§2, §8; tesi §14).
7. Persona e Impresa sono i partecipanti ammessi oggi; Professionista è qualificazione facoltativa della Persona, non terza categoria (§6; tesi §9).
8. I ruoli appartengono alla Collaborazione (catalogo locale, PL4), non ai partecipanti (§6; tesi §10).
9. Una Persona agisce per un'Impresa sulla base di Appartenenze, mai sulla base della sola Collaborazione (§6, §13).
10. Una Collaborazione non diventa né assorbe un'Appartenenza (V10; §13 regola 9).
11. Manifestazione di interesse, candidatura, abbinamento, selezione, accordo e Collaborazione attiva sono fasi differenti (§8, §9, §10).
12. Un abbinamento non garantisce affidabilità o successo (§10; PF10).
13. Stato editoriale, stato della ricerca, stato della relazione, verifica, visibilità ed esito sono assi separati (§8; PF7).
14. Le candidature e le manifestazioni di interesse possono avere visibilità più restrittiva rispetto alla Collaborazione (§9, §12).
15. Lo storico delle Collaborazioni deve poter essere conservato (§8, §13; PF8).
16. Il dominio supporta Collaborazioni locali, nazionali e internazionali (§5, §11).
17. Il dominio supporta richieste e offerte di clienti, fornitori, partner, professionisti, personale, investitori, distributori, spazi e immobili (§5, §7, §13), senza modellare l'esecuzione operativa.
18. La piattaforma non garantisce la conclusione, l'esecuzione o il successo della relazione (§10, §13).
19. I diritti di accesso restano responsabilità di Identità & Accessi (§1, §13; PF13).
20. Il dominio può alimentare l'Osservatorio con dati aggregati senza compromettere informazioni personali o commerciali riservate (§1, §13).

**Domande aperte** (incluse quelle rinviate dalla Domain Thesis §16).

- Distinzione operativa esatta tra Esigenza e Proposta oltre a §4 (Dependency Map; tesi §16 punto 1) — da raffinare nel Physical Domain Mapping.
- Se la fase dichiarativa e quella relazionale richiedano uno o due Aggregate Root (PC2; §2; tesi §16 punto 2).
- Catalogo esatto dei Ruoli locali oltre a proponente/destinatario (§6; tesi §16 punto 3).
- Qual è il confine esatto, in termini di responsabilità e di dati condivisi, tra Collaborazione e Opportunità, in particolare quando una risposta a un'Opportunità evolve in una relazione diretta?
- Qual è il confine esatto tra Collaborazione e annuncio, oltre ai criteri qualitativi già descritti al §3?
- Qual è il confine esatto tra Collaborazione e messaggistica, in particolare su quanto del contatto autorizzato debba restare visibile come fatto di dominio?
- Qual è il confine esatto tra Collaborazione e contratto, in particolare su come rappresentare (se rappresentare) l'esistenza di un contratto senza incorporarne i termini?
- Come devono essere rappresentati i soggetti esterni non ancora presenti sulla piattaforma (§6), in termini di identificazione stabile e di eventuale evoluzione futura verso un profilo proprio?
- Trattamento futuro di associazioni, enti, università come partecipanti, rinviato a Organizzazioni istituzionali (tesi §16 punto 7).
- In quali casi, e con quali garanzie, deve essere possibile una pubblicazione anonima (§12)?
- In quale momento esatto del ciclo di vita devono diventare visibili i contatti tra le parti (§9, §12), oltre al principio generale già stabilito?
- Quali criteri esatti determinano un grado di compatibilità automatica "sufficientemente rilevante" da essere segnalato (§10), oltre alla gradazione qualitativa già fornita?
- Come deve essere trattata operativamente una Collaborazione multilaterale (§4, §13) in termini di ruoli e responsabilità tra i proponenti congiunti?
- Come devono essere gestite le candidature multiple quando la Collaborazione prevede una selezione esclusiva (§9, §13)?
- Le condizioni economiche (§7) devono essere rappresentate come dato strutturato del dominio, o restare descrittive nella prima versione?
- Come devono essere trattati budget e compensi riservati (§7, §12, §13) in termini di conservazione e non solo di visibilità?
- Quale durata o scadenza predefinita, se necessaria, deve avere una Collaborazione priva di una Disponibilità temporale dichiarata (§7, §13)? Grado di strutturazione di Scadenza, Sospensione, Annullamento (tesi §16 punto 5).
- Come devono essere gestite operativamente le Collaborazioni ricorrenti (§13), oltre al principio di non continuità automatica già stabilito?
- Con quale processo si verifica concretamente l'Esito dichiarato di una Collaborazione (§8, §12), quando le parti non collaborano attivamente alla sua conferma?
- Quale responsabilità assume la piattaforma, se alcuna, nei rapporti tra le parti una volta che una Collaborazione è Avviata (§1, §8; `domain-model.md` §14; tesi §16 punto 6)?
- Un futuro sistema di reputazione (basato su Esiti storicizzati, §8) deve appartenere a questo dominio o a un dominio distinto?
- Come devono essere trattate le contestazioni (§8, §12) in termini di processo di risoluzione, oltre alla loro rappresentazione come fatto di dominio (PCa1)?
- Qual è il collegamento esatto con un futuro dominio Immobiliare, oltre al trattamento come Oggetto della collaborazione già stabilito (§13)?
- Qual è il collegamento esatto con Mercati Internazionali oltre al semplice riferimento descrittivo già stabilito al §11?
- Qual è il collegamento esatto con un futuro dominio Servizi (tesi §16 punto 8)?
- Quali informazioni di questo dominio, esattamente, potranno essere utilizzate dall'Osservatorio, e con quale livello di aggregazione o anonimizzazione?
- In futuro, richieste, offerte e partnership dovranno essere trattate come sotto-domini distinti con regole proprie, o restare un'unica classificazione all'interno di un solo dominio Collaborazioni?
- Se Manifestazione di interesse o Candidatura richiedano un'identità temporanea (tesi §16 punto 9).

Queste domande restano decisioni progettuali future o di Physical Domain Mapping, coerenti con l'approccio già adottato negli altri documenti logici e con la Domain Thesis.

