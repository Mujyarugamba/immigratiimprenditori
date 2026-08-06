# Logical Data Model — Dominio COLLABORAZIONI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/architecture/fundamental/collaborazioni-domain-thesis.md`](../fundamental/collaborazioni-domain-thesis.md) (significato di business, confini, PF4/PF5), [`docs/architecture/fundamental/domain-patterns.md`](../fundamental/domain-patterns.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/organizzazioni.md`](./organizzazioni.md), [`docs/architecture/logical/identita-accessi.md`](./identita-accessi.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/servizi.md`](./servizi.md), [`docs/architecture/logical/eventi.md`](./eventi.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md).
> Scopo del documento: definire il modello logico del dominio Collaborazioni, componente del dominio Core "Opportunità & Collaborazioni" già riconosciuto dal Domain Model, qui trattata come modello a sé per la propria complessità e autonomia concettuale (coerente con `logical/opportunita.md`, che ha già trattato la componente Opportunità separatamente). Il significato di business, i fatti proprietari e i confini sono quelli già stabiliti dalla Domain Thesis; questo documento li traduce in entità, relazioni, stati e regole senza ridefinirli. **Questa revisione chiude il perimetro del ciclo 1** (§15.A–§15.D) sufficiente a un Physical DDL-ready senza nuove decisioni semantiche.
> Distinzione da Opportunità. Un'Opportunità (`logical/opportunita.md` §1, §3) è normalmente promossa da un soggetto e presenta benefici, requisiti, destinatari e un periodo di validità: è una possibilità strutturata che qualcuno offre a chi la incontra. Una Collaborazione nasce invece dall'intenzione di uno o più soggetti di trovare una controparte, avviare una relazione o sviluppare un'attività comune: è una ricerca, un'offerta o una proposta che cerca un incontro, non una possibilità già definita e resa disponibile da un terzo. Una Collaborazione può nascere da un'Opportunità (es. una risposta che si trasforma in relazione diretta), ma può anche esistere senza alcuna Opportunità formale. Questo dominio non possiede il processo formale di Opportunità (annuncio pubblico con requisiti espliciti ed esito binario): possiede invece il proprio percorso, più aperto, dalla dichiarazione all'eventuale relazione attiva (tesi §5, §8, §13). Nel **ciclo 1** il percorso si ferma alla scheda dichiarativa pubblicabile (§15.A): interesse, candidature, abbinamento e fase relazionale restano nel modello generale ma sono rinviati.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API o interfaccia. I §§1–14 descrivono il modello generale; dove il ciclo 1 restringe, prevale §15.

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
- Non rientra l'**identità digitale né i diritti di accesso**: nessuna informazione di questo dominio genera di per sé un permesso tecnico; resta responsabilità esclusiva di Identità & Accessi (`logical/identita-accessi.md`; PF13).
- Non rientrano le **Organizzazioni** come fatti anagrafici: la scheda Organizzazione appartiene a `logical/organizzazioni.md`. Nel ciclo 1 Organizzazione **non** è partecipante strutturale (§6, §15.A).
- Non rientrano i **Servizi**: Offerta/RichiestaDiServizio restano di `logical/servizi.md`; l'Offerta di Collaborazione è un fatto distinto (§2, §4).
- Non rientra l'**Osservatorio**: il dominio lo alimenta con dati aggregabili, senza produrre esso stesso report o statistiche.
- Non rientrano i **Contenuti Editoriali**: possono descrivere o raggruppare Collaborazioni come soggetto trattato, senza che il contenuto coincida con la Collaborazione.

**Quali domini utilizza.**
- **Persone** e **Imprese** — per referenziare titolare di scheda, proponenti e eventuali controparti indicate, per identità stabile, senza duplicarne i dati (D19, D20, Necessarie nel ciclo 1).
- **Appartenenze** — utilizzo del titolo di rappresentanza quando una Persona agisce per conto di un'Impresa (§6; D23), senza possedere né verificare autonomamente la relazione. Nessuna membership Organizzazione in ciclo 1.
- **Identità & Accessi** — di supporto per le azioni di scrittura; non decide la visibilità sostanziale né possiede i fatti di Collaborazione (PF13).
- **Professionisti** — riferimento facoltativo al Profilo professionale nel modello generale (D21); **rinviato nel ciclo 1** (§15.A).
- **Mercati Internazionali** — riferimento facoltativo nel modello generale (§11); **rinviato nel ciclo 1** (§15.A).
- **Opportunità** — origine storica facoltativa nel modello generale (D22); **rinviata come FK nel ciclo 1** (§15.A).
- **Organizzazioni** — dominio pubblicato e distinto da Impresa; **nessuna partecipazione strutturale né FK nel ciclo 1** (§6, §15.A).
- **Tassonomia Condivisa** — ambiti territoriali/settoriali nel modello generale; nel ciclo 1 restano solo campi descrittivi sulla scheda, senza obbligo di catalogo (§15.A).

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

**Nota su Aggregate e PF4 — decisione definitiva.** Esiste **un solo Aggregate Root: Collaborazione**. Attraversa la fase dichiarativa e, nel modello generale, l'eventuale fase relazionale senza cambiare identità (PF5). PF4 (proprietà delle relazioni) si applica alla fase relazionale, non alla sola dichiarazione unilaterale (tesi §14). **PC2 è chiusa**: non si introducono Aggregate Root distinti per dichiarazione, relazione, Manifestazione o Candidatura. Eventuali promozioni future richiederebbero una revisione esplicita di questo Logical, non una decisione del Physical. Nel ciclo 1 l'AR è realizzato come scheda dichiarativa (§15.A); la fase relazionale resta nel modello generale ma è rinviata come operatività owned.

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

**Forme di dichiarazione — insieme chiuso del ciclo 1** (valori usati dal Physical):

| Valore | Significato |
|---|---|
| `ricerca` | Collaborazione direzionale basata su un bisogno dichiarato ("cerco X") |
| `offerta` | Collaborazione direzionale basata su una disponibilità dichiarata ("offro X") |
| `partnership` | Proposta di relazione paritaria |
| `progetto` | Proposta orientata a un obiettivo condiviso |
| `disponibilita_aperta` | Apertura a valutare collaborazioni, senza bisogno/offerta specifica |

Nel modello generale restano inoltre concepibili: incontro domanda/offerta (Abbinamento, §10); collaborazione già avviata; collaborazione conclusa — **rinviati come operatività owned nel ciclo 1** (§15.A).

**Principio.** Alcune Collaborazioni sono **direzionali**, altre **reciproche**. Nel ciclo 1 la reciprocalità è espressa dalla forma (`partnership` / `progetto`) con un solo promotore; proponenti congiunti e multilateralità operativa sono rinviati (§15.A).

---

## 5. Tipologie di Collaborazione

La classificazione del **modello generale** è volutamente ampia e non si limita ai soli rapporti commerciali: una Collaborazione può assumere una o più tipologie contemporaneamente, secondo lo stesso principio di non esclusività già adottato per le tipologie di Attività internazionale (`logical/mercati-internazionali.md` §5) e di Opportunità (`logical/opportunita.md` §4).

**Ciclo 1.** Il catalogo tipologico ampio di questa sezione è **rinviato**. Il ciclo 1 usa esclusivamente la **forma di dichiarazione** chiusa di §4 / §15.A (`ricerca` | `offerta` | `partnership` | `progetto` | `disponibilita_aperta`), più oggetto/finalità descrittivi. Nessun catalogo tipologico seedato è richiesto al Physical del ciclo 1.

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

### 6.1 Ownership della scheda (ciclo 1 — chiuso)

La scheda Collaborazione ha **esattamente un titolare** tra:

| Titolare | Significato |
|---|---|
| **Persona** | La Persona è responsabile della scheda |
| **Impresa** | L'Impresa è responsabile della scheda; una Persona con titolo adeguato da Appartenenza agisce in scrittura |
| **Redazione piattaforma** | Scheda curata redazionalmente (come in Organizzazioni/Contenuti); non crea Contesto Organizzazione né permessi applicativi |

**Distinzioni obbligatorie.**

| Concetto | Natura | Non è |
|---|---|---|
| **Titolare della scheda** | Ownership della scheda Collaborazione | Partecipante; Account; `auth.users` |
| **Partecipante** | Soggetto locale della Collaborazione con ruolo locale (PL4) | Titolare automatico; membro Appartenenza |
| **Persona operante / autore della registrazione** | Persona che esegue l'azione di scrittura (creazione/aggiornamento) | Owner se distinto; Account |
| **Ruolo applicativo** | Fatto di Identità & Accessi | Ruolo locale di Collaborazione; ruolo Appartenenza |

`auth.users` e Account **non** sono titolari della scheda. I permessi tecnici restano di Identità & Accessi; Collaborazioni non attribuisce diritti RLS ai partecipanti per il solo fatto di partecipare.

### 6.2 Partecipanti (ciclo 1 — chiuso)

| Soggetto | Ciclo 1 | Ruolo ammissibile | Note |
|---|---|---|---|
| **Persona** | **Incluso** | Promotore obbligatorio *oppure* controparte indicata facoltativa | D19 |
| **Impresa** | **Incluso** | Promotore obbligatorio *oppure* controparte indicata facoltativa | D20 |
| **Organizzazione** | **Escluso** come partecipante strutturale | — | Dominio pubblicato (`logical/organizzazioni.md`); nessuna FK di partecipazione nel ciclo 1; ≠ Impresa |
| **Professionista** | **Escluso** come tipo di partecipante | — | Qualificazione della Persona; profilo D21 rinviato nel ciclo 1 |
| **Account** | **Escluso** | — | Solo supporto scrittura via Identità & Accessi |
| **Soggetto esterno non censito** | **Incluso** solo come etichetta descrittiva | Controparte ricercata (testo), non partecipante | Nessuna identità temporanea; nessuna scheda parallela |

**Cardinalità ciclo 1.** Ogni Collaborazione ha **esattamente un promotore** (Persona **oppure** Impresa). Controparti indicate: **0..N** (Persona o Impresa). Controparte ricercata per criteri: testo descrittivo, senza soggetto nominato. Proponenti congiunti / multilateralità paritaria: **rinviati**.

**Ruoli locali ciclo 1 (chiusi).** Catalogo proprio di Collaborazioni (PL4) — **non** riutilizza i Ruoli di Appartenenze:

| Ruolo locale | Ciclo 1 |
|---|---|
| `promotore` | **Incluso** (obbligatorio, esattamente uno) |
| `controparte_indicata` | **Incluso** (0..N) |
| destinatario, candidato, interessato, invitato, partner, referente, intermediario, facilitatore, osservatore | **Rinviati** (modello generale) |

**Modello generale (oltre ciclo 1).** Restano validi i ruoli più ampi già previsti dalla tesi (destinatario, candidato, interessato, invitato, partner, …) ma non sono oggetto del Physical ciclo 1.

### 6.3 Relazione con gli altri domini

| Soggetto / concetto | Dominio | Collegamento | Ciclo 1 |
|---|---|---|---|
| Persona | Persone | Titolare e/o partecipante (D19) | Operativo |
| Impresa | Imprese | Titolare e/o partecipante (D20) | Operativo |
| Appartenenza | Appartenenze | Utilizzo titolo quando Persona agisce per Impresa (D23); V10 | Operativo (utilizzo) |
| Organizzazione | Organizzazioni | Scheda istituzionale distinta | **Nessuna partecipazione strutturale** |
| Profilo professionale | Professionisti | Qualificazione facoltativa della Persona (D21) | **Rinviato** |
| Soggetto esterno | — | Etichetta / controparte ricercata | Solo descrittivo |
| Account | Identità & Accessi | Scrittura; non ownership scheda | Supporto |

### 6.4 Principio Appartenenze / rappresentanza (chiuso)

Con quale titolo una Persona agisce per conto di un'Impresa in una Collaborazione deriva sempre da un'**Appartenenza** esistente (`logical/appartenenze.md`), non dalla Collaborazione stessa.

Collaborazioni:
- **non** crea, modifica, presume o assorbe Appartenenze (V10);
- **non** duplica membership, ruoli permanenti, rappresentanza legale/operativa o autorizzazioni gestionali;
- **può** registrare un utilizzo storico minimo del titolo (riferimento all'Appartenenza + etichetta al tempo t) senza ownership del fatto;
- **non** simula membership Persona–Organizzazione / Impresa–Organizzazione (future in Appartenenze; coerente con Identità & Accessi §15.A).

Se non esiste un'Appartenenza con titolo adeguato, la Persona non può agire per l'Impresa in una Collaborazione, indipendentemente da qualsiasi ruolo locale.

---

## 7. Oggetto, esigenze e condizioni

**Ciclo 1.** Obbligatori: oggetto e finalità (testo). Facoltativi: descrizione, controparte ricercata (testo), disponibilità temporale, note sulle condizioni. Requisiti/Preferenze/Condizioni come entità strutturate: **rinviati** (§15.A).

**Modello generale.**

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

### 8.0 Lifecycle ciclo 1 (chiuso — prevale su §8.a–f per il Physical)

Il ciclo 1 riduce il lifecycle al minimo indispensabile per una scheda dichiarativa. Quattro assi separati (PF7):

| Asse | Valori ciclo 1 | Significato |
|---|---|---|
| **Editoriale** | `bozza` \| `pubblicata` \| `ritirata` | Completezza e disponibilità della scheda come dichiarazione |
| **Operativo** | `aperta` \| `chiusa` \| `annullata` | Se la dichiarazione è ancora attiva come ricerca/proposta |
| **Esito** | `non_comunicato` \| `positivo` \| `negativo` \| `parziale` | Risultato qualitativo dichiarato; significativo quando operativo ≠ `aperta` |
| **Archiviazione** | `corrente` \| `archiviata` | Conservazione storica (PF8); distinta da ritiro/chiusura |

**Regole ciclo 1.**
- Esistenza dalla `bozza`: la Collaborazione esiste già come scheda, anche senza controparte.
- `pubblicata` non implica verifica, né fase relazionale, né diritti di accesso.
- `aperta` significa dichiarazione attiva/ricercabile; **non** implica Manifestazione/Candidatura (rinviati).
- `chiusa` / `annullata` / `ritirata` sono terminali distinti; `archiviata` può seguire uno stato terminale.
- Fase relazionale (`Avviata`/`Attiva`/`Sospesa`), asse ricerca esteso, verifica `Contestata` come processo: **rinviati** (§15.A).
- Nessuna scadenza di default obbligatoria; disponibilità temporale resta facoltativa descrittiva.

### 8.1 Modello generale (sei assi — oltre ciclo 1)

Il percorso completo del modello generale è descritto da **sei assi distinti**, che non devono mai essere compressi in un unico stato (PF7) — un'articolazione ancora più ricca di quella già adottata per l'Opportunità (`logical/opportunita.md` §8, cinque assi), giustificata dalla natura di processo (dichiarativo → eventualmente relazionale) di questo dominio (§3; tesi §6, §11). Per il Physical ciclo 1 vale esclusivamente §8.0.

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

**Ciclo 1.** Manifestazione di interesse, CandidaturaCollaborazione, Invito, Accettazione del contatto e relativi eventi sono **rinviati**. Il ciclo 1 non richiede al Physical alcuna entità di interesse (§15.A). Il testo di questa sezione resta modello generale.

**Confine con Opportunità.** Manifestazione di interesse, candidatura e abbinamento di questo dominio appartengono al percorso aperto di Collaborazioni (tesi §11). Non incorporano il processo formale di Opportunità (annuncio con requisiti espliciti, procedura di ammissibilità, esito binario di accesso). Una Collaborazione può esistere e trovare una controparte anche senza alcuna candidatura formale, tramite contatto diretto o invito (§4).

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

**Ciclo 1.** Abbinamento, matching automatico e gradazione di compatibilità sono **rinviati** (§15.A). Nessun motore di matching è richiesto al Physical.

Un **Abbinamento** (§2) è, nel modello generale, il rilevamento, algoritmico o redazionale, di una possibile corrispondenza tra l'Esigenza o l'Offerta del proponente e le caratteristiche di un soggetto potenzialmente compatibile, sulla base di: territorio; settore; Mercato di riferimento; disponibilità; Requisiti; Preferenze.

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

**Ciclo 1.** Nessuna FK a Mercati Internazionali né obbligo di catalogo territoriale/settoriale. Ambiti restano campi descrittivi opzionali sulla scheda (§15.A).

**Collegamenti previsti (modello generale).** Territorio locale; Regione; Italia; Paese estero; Area economica; Mercato internazionale; settore; filiera; canale commerciale; lingua operativa.

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

**Ciclo 1.** Visibilità minima: `bozza` riservata al titolare (e a chi agisce per esso); `pubblicata` consultabile; `ritirata` fuori dagli elenchi correnti. Nessun asse di verifica owned, nessun anonimato avanzato (§15.A). Il resto della sezione è modello generale.

**Assi di verifica** (modello generale), coerenti con l'approccio già adottato in `logical/imprese.md` §8, `logical/appartenenze.md` §10, `logical/mercati-internazionali.md` §10 e `logical/opportunita.md` §11:

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

1. Ogni Collaborazione deve avere un promotore identificabile, Persona o Impresa (§6; D19/D20). Nel ciclo 1 il promotore è esattamente uno (§15.A).
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

**Collaborazione multilaterale.** Nel modello generale: più proponenti su base paritaria (§4). **Ciclo 1:** un solo promotore; multilateralità rinviata (§15.A).

**Collaborazione anonima.** Nel modello generale: visibilità "Anonima verso il pubblico" (§12). **Ciclo 1:** anonimato avanzato rinviato; vale la visibilità minima di §15.A.

**Identità resa visibile solo dopo accettazione.** Corrisponde alla visibilità "Con identità rivelata dopo accettazione" (§12): distinta dall'anonimato permanente.

**Soggetto esterno non registrato.** Trattato come riferimento informativo (§6): il dominio ammette che una controparte non abbia ancora una rappresentazione propria sulla piattaforma.

**Collaborazione internazionale.** Trattata al §11: piena previsione tramite il collegamento a uno o più Mercati Internazionali.

**Ricerca di immobile o spazio.** Trattata come Oggetto della collaborazione (§2, §7): il dominio supporta questo caso senza incorporare un dominio Immobiliare. Ciclo 1: solo descrizione testuale dell'oggetto.

**Ricerca di personale / investimento / cliente.** Nel ciclo 1 rientrano nella forma `ricerca` (o `offerta` / `partnership` secondo il caso) con oggetto/finalità descrittivi; le etichette tipologiche ampie di §5 sono rinviate.

**Offerta di servizi.** Rientra nella forma `offerta` (§2, §4): Collaborazione basata su disponibilità dichiarata, distinta da OffertaDiServizio (`logical/servizi.md`) e da ServizioProfessionale (`logical/professionisti.md`). Nessun collegamento strutturale a Servizi nel ciclo 1 (§15.A).

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

**Ciclo 1 (minimo).** CollaborazioneCreata; CollaborazionePubblicata; CollaborazioneModificata; CollaborazioneRitirata; CollaborazioneChiusa; CollaborazioneAnnullata; CollaborazioneArchiviata; PartecipanteAggiunto (controparte indicata). Gli altri eventi di questa sezione appartengono al modello generale e sono rinviati con le entità correlate (§15.A).

**Modello generale.**

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

## 15. Decisioni finali, ciclo 1 e prontezza Physical

### Decisioni vincolanti (modello generale)

1. Collaborazioni è un dominio autonomo (§1; tesi §5, §17).
2. Collaborazioni e Opportunità sono domini distinti (decisione vincolante 7 di `domain-model.md`); D22 è unidirezionale e non crea ownership inversa.
3. Collaborazioni ≠ messaggistica, contratti, pagamenti, esecuzione progettuale, CRM, HR (§1).
4. Un solo Aggregate Root **Collaborazione**; **PC2 chiusa** (§2).
5. Identità della Collaborazione indipendente dai partecipanti (PF5).
6. PF4 si applica alla fase relazionale del modello generale; nel ciclo 1 la fase relazionale è rinviata (§8.0, §15.A).
7. Persona e Impresa sono i soli partecipanti strutturali ammessi; Professionista non è terzo tipo; Organizzazione ≠ Impresa e non è partecipante nel ciclo 1 (§6).
8. I ruoli locali appartengono alla Collaborazione (PL4), non ai partecipanti e non ad Appartenenze.
9. Una Persona agisce per un'Impresa solo tramite Appartenenza (D23); Collaborazioni non crea rappresentanza (V10).
10. Una Collaborazione non diventa né assorbe un'Appartenenza (V10).
11. I diritti di accesso restano di Identità & Accessi (PF13); Collaborazioni non attribuisce permessi ai partecipanti.
12. La piattaforma non garantisce affidabilità, esecuzione o successo (PF10).
13. Offerta di Collaborazione ≠ OffertaDiServizio ≠ ServizioProfessionale.
14. Ownership della scheda: Persona XOR Impresa XOR Redazione; mai `auth.users` / Account (§6.1).

---

### 15.A Decisioni del ciclo 1 (chiuse)

| Tema | Decisione ciclo 1 | Stato |
|---|---|---|
| **Obiettivo minimo** | Scheda dichiarativa pubblicabile di ricerca/offerta/proposta, con titolare, un promotore e lifecycle slim | Chiuso |
| **Aggregate Root** | Unico: **Collaborazione** | Incluso |
| **PC2** | **Chiusa**: nessun secondo AR | Chiuso |
| **Ownership scheda** | Esattamente uno: **Persona** XOR **Impresa** XOR **Redazione piattaforma** | Incluso |
| **Creazione** | Il titolare crea la scheda; se titolare = Impresa, scrittura da Persona con Appartenenza adeguata; Redazione può creare schede curate | Incluso |
| **Autore registrazione** | Persona operante (chi scrive); distinta da titolare e da Account | Incluso (concetto) |
| **Account / `auth.users`** | Vietati come owner | Escluso |
| **Partecipante Persona** | Sì | Incluso |
| **Partecipante Impresa** | Sì | Incluso |
| **Partecipante Organizzazione** | No struttura / no FK | **Escluso** |
| **Professionista come partecipante** | No | **Escluso** |
| **Riferimento Profilo professionale (D21)** | — | **Rinviato** |
| **Soggetto esterno** | Solo etichetta / controparte ricercata testuale | Incluso (descrittivo) |
| **Promotori** | Esattamente **uno** (Persona \| Impresa) | Incluso |
| **Controparti indicate** | 0..N (Persona \| Impresa) | Incluso |
| **Ruoli locali** | Solo `promotore`, `controparte_indicata` | Incluso |
| **Forma dichiarazione** | Insieme chiuso: `ricerca` \| `offerta` \| `partnership` \| `progetto` \| `disponibilita_aperta` | Incluso |
| **Catalogo tipologico ampio (§5)** | — | **Rinviato** |
| **Oggetto + finalità** | Obbligatori, descrittivi | Incluso |
| **Esigenza / Offerta come entità distinte** | Rappresentate dalla forma + testo; non E02 separate | **Rinviate** come E02 |
| **Requisiti / Preferenze / Condizioni strutturate** | Solo testo descrittivo opzionale | Strutturati **rinviati** |
| **Disponibilità temporale** | Facoltativa; nessuna scadenza di default | Incluso (opzionale) |
| **Manifestazione / Candidatura / Invito** | — | **Rinviati** |
| **Abbinamento / matching** | — | **Rinviati** |
| **Accordo preliminare / fase relazionale** | — | **Rinviati** |
| **Fonte / Evidenza** | — | **Rinviati** |
| **Lifecycle** | Quattro assi §8.0 | Incluso |
| **Visibilità avanzata / anonimato** | Ciclo 1: bozza privata al titolare (e chi agisce per esso); pubblicata consultabile; ritirata non in elenco corrente | Incluso (minimo) |
| **Verifica / Contestata** | Nessun processo owned | **Rinviato** |
| **FK Opportunità (D22)** | — | **Rinviata** |
| **FK Eventi** | — | **Esclusa** |
| **FK Mercati** | — | **Rinviata** |
| **FK / link Servizi** | — | **Escluso** |
| **FK Organizzazioni** | — | **Esclusa** |
| **Contenuti Editoriali** | Nessuna ownership; nessuna FK da Collaborazioni | **Escluso** (ownership) |
| **Utilizzo Appartenenza (D23)** | Quando Persona agisce per Impresa: riferimento + snapshot etichetta minimo opzionale | Incluso |
| **Multilateralità / proponenti congiunti** | — | **Rinviata** |
| **Identità temporanea** | — | **Esclusa** |
| **Duplicati semantici A↔B** | Non invariante dura; qualità editoriale | Chiuso (non vincolo) |
| **Responsabilità piattaforma in fase attiva** | Nessuna nel ciclo 1 (fase attiva rinviata) | Chiuso |
| **Reputazione** | — | **Esclusa** / dominio futuro |
| **Contratti / documenti / Storage / messaggistica** | — | **Esclusi** |

**Organizzazioni — chiusura esplicita.** Il dominio Organizzazioni è pubblicato e distinto da Impresa. Collaborazioni ciclo 1 **non** introduce Organizzazione come titolare, promotore o controparte strutturale; **non** simula membership organizzative; eventuali enti non censiti restano etichetta descrittiva. Un cutover futuro a partecipazione Org richiederà revisione di questo Logical (e membership Appartenenze), non una decisione del Physical.

**Appartenenze — chiusura esplicita.** Collaborazioni utilizza il titolo (D23) e non possiede membership, ruoli permanenti, rappresentanza o autorizzazioni gestionali (V10).

---

### 15.B Matrice ciclo 1 — incluso / rinviato / escluso

| Elemento | Incluso | Rinviato | Escluso | Motivazione |
|---|---|---|---|---|
| AR Collaborazione (scheda dichiarativa) | ✓ | | | Nucleo ciclo 1 |
| Titolare scheda Persona\|Impresa\|Redazione | ✓ | | | Ownership chiusa |
| Persona operante (autore registrazione) | ✓ | | | Distinto da Account |
| Partecipante `promotore` (1) | ✓ | | | Obbligatorio |
| Partecipante `controparte_indicata` (0..N) | ✓ | | | Opzionale |
| Forma dichiarazione (5 valori) | ✓ | | | Catalogo chiuso minimo |
| Oggetto, finalità, descrizione | ✓ | | | Minimo esistenza |
| Controparte ricercata (testo) | ✓ | | | Senza soggetto nominato |
| Etichetta soggetto esterno | ✓ | | | Solo descrittiva |
| Lifecycle 4 assi (§8.0) | ✓ | | | Slim |
| Utilizzo Appartenenza / snapshot titolo | ✓ | | | D23 quando applicabile |
| Tipologie ampie §5 | | ✓ | | Non necessarie al primo Physical |
| Esigenza/Offerta come E02 | | ✓ | | Coperte dalla forma |
| Requisiti/Preferenze/Condizioni strutturate | | ✓ | | Testo sufficiente |
| Manifestazione / Candidatura / Invito | | ✓ | | Percorso interesse |
| Abbinamento / matching | | ✓ | | Motore non richiesto |
| Accordo preliminare | | ✓ | | Fase relazionale |
| Fase relazionale (Avviata/Attiva/Sospesa) | | ✓ | | Oltre scheda dichiarativa |
| Fonte / Evidenza | | ✓ | | Verifica locale |
| Assi ricerca/verifica estesi (§8.a–f) | | ✓ | | Ridotti a §8.0 |
| Ruoli locali estesi | | ✓ | | Solo due ruoli ciclo 1 |
| D21 Profilo professionale | | ✓ | | Qualificazione opzionale |
| D22 FK Opportunità | | ✓ | | Origine storica non obbligatoria |
| D52 FK Mercati | | ✓ | | Contesto internazionale |
| Proponenti congiunti / multilateralità | | ✓ | | Un solo promotore ciclo 1 |
| Anonimato avanzato / rivelazione post-accettazione | | ✓ | | Visibilità minima |
| Contestazione / PCa1 processo | | ✓ | | |
| Collaborazioni ricorrenti strutturate | | ✓ | | Nuova scheda distinta basta |
| Partecipante Organizzazione | | | ✓ | Org ≠ Impresa; no membership Org |
| Account / `auth.users` come owner | | | ✓ | Identità & Accessi |
| Professionista come terzo partecipante | | | ✓ | D21; non tipo soggetto |
| FK Eventi | | | ✓ | Contesto occasionale non strutturale |
| Link/ownership Servizi | | | ✓ | Offerta ≠ OffertaDiServizio |
| Ownership Contenuti | | | ✓ | Narrativa (D35) |
| Membership / ruoli Appartenenze | | | ✓ | V10 |
| Messaggistica / contratti / pagamenti / CRM / HR / documenti / Storage | | | ✓ | Fuori dominio |
| Identità temporanea | | | ✓ | |
| Motore matching / marketplace | | | ✓ | |
| Reputazione owned | | | ✓ | |

---

### 15.C Relazioni con altri domini (congelate per ciclo 1)

| Dominio | Relazione ciclo 1 | Natura |
|---|---|---|
| **Persone** | FK/riferimento titolare, promotore, controparte, persona operante | Strutturale |
| **Imprese** | FK/riferimento titolare, promotore, controparte | Strutturale |
| **Appartenenze** | Utilizzo titolo quando Persona agisce per Impresa | Utilizzo (D23); no ownership |
| **Organizzazioni** | Nessuna partecipazione / nessuna FK | Escluso operativo |
| **Identità & Accessi** | Supporto scrittura; deny-by-default; nessun permesso da fatti Collaborazione | Supporto |
| **Professionisti** | Nessun riferimento Profilo | Rinviato (D21) |
| **Opportunità** | Nessuna FK origine | Rinviato (D22) |
| **Servizi** | Nessun link | Escluso |
| **Eventi** | Nessuna FK | Escluso |
| **Contenuti** | Nessuna ownership né FK uscente | Escluso ownership |
| **Mercati Internazionali** | Nessuna FK | Rinviato |
| **Osservatorio / Notifiche / Ricerca** | Consumatori futuri di eventi; nessuna dipendenza inbound | Fuori ownership |

**Assenza cicli.** Nessuna dipendenza Opportunità → Collaborazioni; nessun ciclo con Appartenenze, Organizzazioni o Identità.

---

### 15.D Prontezza Physical

Il Logical Collaborazioni è **chiuso per il ciclo 1**.

Il Physical del ciclo 1 **deve** limitarsi a tradurre:

* **AR** Collaborazione (scheda dichiarativa);
* **ownership** Persona XOR Impresa XOR Redazione;
* **partecipanti** locali con ruoli `promotore` (1) e `controparte_indicata` (0..N);
* **forma** a cinque valori chiusi;
* **oggetto / finalità / descrizione** e controparte ricercata testuale;
* **lifecycle** §8.0 (quattro assi);
* **utilizzo Appartenenza** quando applicabile;
* **confini** §15.A–§15.C (V10, PF13, Org esclusa, interesse/relazione rinviati).

Il Physical **non** deve:
* riaprire PC2;
* inventare partecipazione Organizzazione;
* introdurre Manifestazione/Candidatura/Invito/Abbinamento/Accordo;
* introdurre catalogo tipologico ampio o matching;
* attribuire ownership a Account/`auth.users`;
* creare membership, ruoli permanenti o permessi dai fatti di Collaborazione;
* aggiungere FK a Opportunità, Eventi, Mercati, Servizi, Organizzazioni, Professionisti nel ciclo 1.

Il Migration Plan, quando autorizzato, **potrà limitarsi a tradurre** questo modello in unità DDL senza nuove decisioni semantiche. I nomi di tabelle/colonne restano decisione del Physical.

**Criterio di completamento.** Con §15.A–§15.D il ciclo 1 è completo e il Physical DDL-ready è autorizzabile.

---

### Domande aperte (non bloccanti per il Physical ciclo 1)

- raffinamento operativo post-ciclo-1 di Manifestazione/Candidatura/Invito e fase relazionale;
- partecipazione strutturale di Organizzazione (dopo membership Appartenenze);
- D21/D22/D52 come FK facoltative;
- catalogo tipologico ampio e condizioni economiche strutturate;
- anonimato avanzato, contestazioni, reputazione, matching;
- responsabilità piattaforma in fase attiva;
- eventuale promozione futura di entità (richiede revisione Logical, non decisione Physical).

