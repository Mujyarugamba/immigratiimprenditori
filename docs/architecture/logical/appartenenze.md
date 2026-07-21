# Logical Data Model — Dominio APPARTENENZE

> Livello logico. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato, chiavi, indici, constraint tecnici, migration, API, RLS, backend, frontend, componenti UI o implementazioni tecniche. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md).
> Ruolo di questo documento: essere il modello logico autonomo del dominio connettivo già anticipato, ma non definito in dettaglio, sia dal Domain Model (dominio "Appartenenza") sia dai modelli logici di Persone e Imprese, che lo referenziano senza possederlo.

**Nota di coerenza terminologica.** Il Domain Model (§1, §3, §5) e il Logical Data Model di Persone (§1, §3, §9) utilizzano il nome **Appartenenza** per questo stesso concetto connettivo; il Logical Data Model di Imprese (§2, §6), nel descriverlo dal proprio punto di vista, lo aveva chiamato **AppartenenzaImpresa** e aveva esplicitamente dichiarato di non possederlo in esclusiva. Questo documento adotta il nome storico **Appartenenza**, coerente con Domain Model e Persone, e rappresenta la fonte autorevole e di dettaglio del concetto: la descrizione sintetica già presente in Imprese (ruoli, ciclo di vita semplificato) resta una vista di sintesi non contraddittoria, non un modello alternativo. Le differenze di granularità tra quella vista di sintesi e il presente modello (in particolare sul ciclo di vita, §6) sono segnalate come nota di allineamento documentale al §15.

---

## 1. Responsabilità del dominio

**Cosa comprende.** Il dominio Appartenenze rappresenta tutte le relazioni organizzative tra una Persona e un'Impresa: chi è collegato a chi, con quale ruolo, per quale periodo, in base a quale fonte, con quale evidenza di verifica ed eventualmente con quale facoltà di gestire la scheda impresa. È il dominio che rende possibile affermare, in modo storicizzabile e verificabile, "chi anima cosa" — senza che questa responsabilità gravi né sulla Persona né sull'Impresa.

Il dominio esiste perché la relazione tra una Persona e un'Impresa non è un semplice collegamento: ha una propria natura (§3), un proprio ciclo di vita (§6), regole proprie di dichiarazione e conferma (§9), e un proprio bisogno di verifica (§10) indipendente da quello dei due soggetti che collega.

**Cosa NON comprende.**
- Non comprende i dati personali della Persona: appartengono al dominio Persone, che questo dominio referenzia senza duplicare.
- Non comprende i dati descrittivi, commerciali o economici dell'Impresa (nome pubblico, sedi, settori, servizi, prodotti, mercati, certificazioni): appartengono al dominio Imprese, che questo dominio referenzia senza duplicare.
- Non comprende l'identità digitale, l'autenticazione o i permessi applicativi. Un'Appartenenza descrive un **fatto di business** (questa Persona ha, o ha avuto, questo ruolo in questa Impresa; questa Persona è, o non è, autorizzata a gestire la scheda) — non un meccanismo tecnico di accesso. Il modo in cui quel fatto si traduce in un permesso tecnico concreto appartiene esclusivamente al futuro dominio Identità & Accessi, non a questo documento.
- Non comprende le Collaborazioni, le Opportunità o gli Eventi a cui una Persona o un'Impresa partecipano: sono contenuti di altri domini, che possono referenziare un'Appartenenza per qualificare il titolo con cui si agisce, senza che questo dominio ne acquisisca la responsabilità.
- Non comprende i report dell'Osservatorio: il dominio Appartenenze può alimentarli con dati aggregati, ma non li produce né li possiede (§10 del Domain Model).

**Quali altri domini utilizza.**
- **Persone** — per referenziare la Persona coinvolta in ciascuna Appartenenza, per identità, senza mai duplicarne i dati.
- **Imprese** — per referenziare l'Impresa coinvolta in ciascuna Appartenenza, per identità, senza mai duplicarne i dati.

**Quali domini dipendono da esso.**
- **Persone** — per sapere quali Imprese una Persona anima o ha animato nel tempo, e con quale ruolo (già anticipato in `logical/persone.md`, §1 e §9).
- **Imprese** — per sapere chi ha il diritto, sul piano del significato di business, di rappresentare o gestire la scheda impresa (già anticipato in `logical/imprese.md`, §7 e §9).
- **Identità & Accessi** — per derivare i permessi tecnici concreti a partire dai fatti di business registrati in questo dominio (autorizzazione gestionale, ruolo, stato della relazione).
- **Osservatorio** — per aggregare, in forma statistica, informazioni su ruoli, settori e imprese senza mai esporre singole relazioni identificabili nei propri report pubblici.
- **Ricerca** — per rispondere a domande che attraversano Persona e Impresa insieme (es. "chi lavora, o ha lavorato, in imprese di un certo settore").
- **Notifiche** — per reagire ai fatti di dominio descritti al §14 (es. una nuova proposta di Appartenenza da confermare).

**Confini espliciti.**

| Dominio | Cosa fa il dominio Appartenenze | Cosa NON fa il dominio Appartenenze |
|---|---|---|
| Persone | Referenzia la Persona coinvolta | Non contiene né modifica alcun dato personale |
| Imprese | Referenzia l'Impresa coinvolta | Non contiene né modifica alcun dato descrittivo o commerciale dell'impresa |
| Identità & Accessi | Fornisce i fatti di business (ruolo, autorizzazione gestionale, stato) da cui derivare permessi tecnici | Non definisce meccanismi di autenticazione o permessi applicativi concreti |
| Osservatorio | Fornisce dati aggregabili su ruoli e relazioni | Non produce report né statistiche |
| Ricerca | È interrogato per rispondere a query che attraversano Persona e Impresa | Non definisce il motore di ricerca |
| Notifiche | Genera fatti (§14) a cui le Notifiche possono reagire | Non decide se o come notificare |

---

## 2. Entità principali

### Appartenenza

**Responsabilità.** È l'aggregate root del dominio: rappresenta il legame tra una Persona e un'Impresa in un determinato periodo, con un Ruolo, un'eventuale Qualifica, una Fonte, un'eventuale Evidenza di verifica e un'eventuale Autorizzazione gestionale. Ogni altra entità di questo documento esiste in funzione di una specifica Appartenenza.

**Motivo dell'esistenza.** Rendere esplicito, storicizzabile e verificabile "chi anima cosa", senza che questa complessità gravi sulla Persona o sull'Impresa (Domain Model, §5 — Aggregati; §1, decisione già presa e qui sviluppata).

**Relazioni principali.** Referenzia esattamente una Persona (dominio Persone) ed esattamente un'Impresa (dominio Imprese). Ha un Ruolo (§2, entità dedicata); può avere una o più Qualifiche; ha un Periodo di decorrenza; ha una Fonte; può avere una o più Evidenze di verifica; può avere un'Autorizzazione gestionale.

### Ruolo

**Responsabilità.** Rappresentare la posizione o funzione dichiarata all'interno di una specifica Appartenenza (es. titolare, socio, dipendente — elenco completo al §4).

**Motivo dell'esistenza.** Il ruolo è ciò che qualifica il "come" della relazione, non solo il "che esiste": è il dato che permette di distinguere un fondatore da un dipendente, o un consulente esterno da un legale rappresentante.

**Natura.** Ogni Ruolo è associato a una natura tipica della relazione (proprietà, lavoro, collaborazione, consulenza, rappresentanza, gestione della scheda — §3), utile per la classificazione e la ricerca. Questa associazione è descrittiva e di classificazione: non implica automaticamente alcuna facoltà di rappresentanza o di gestione (§8, principio cardine).

**Relazioni principali.** Appartiene a esattamente una Appartenenza. Una stessa Persona può avere Ruoli diversi verso la stessa Impresa in periodi diversi (tramite Appartenenze distinte, §7), o Ruoli diversi verso Imprese diverse nello stesso momento.

### Qualifica

**Responsabilità.** Rappresentare una denominazione o una precisazione più specifica del Ruolo dichiarato, quando il solo Ruolo non è sufficientemente preciso (es. Ruolo "amministratore" con Qualifica "amministratore unico" o "consigliere delegato"; Ruolo "consulente" con Qualifica "consulente fiscale").

**Motivo dell'esistenza.** Il catalogo dei Ruoli (§4) è volutamente limitato e governato per restare comprensibile e stabile; la Qualifica permette di aggiungere precisione senza moltiplicare all'infinito le voci del catalogo dei Ruoli.

**Nota di distinzione.** Questa entità non deve essere confusa con la QualificaDichiarata del dominio Servizi (Domain Model, §3 — "una qualifica o certificazione che un fornitore di servizio dichiara di possedere per erogare un servizio"): quella riguarda la capacità professionale di offrire un servizio sul mercato; questa riguarda esclusivamente la precisazione del ruolo organizzativo di una Persona in un'Impresa. Sono concetti omonimi per linguaggio naturale, ma non sono la stessa entità né appartengono allo stesso dominio.

**Relazioni principali.** È facoltativa e appartiene a esattamente una Appartenenza (o, concettualmente, al Ruolo di quella specifica Appartenenza); una stessa Appartenenza può avere più Qualifiche se il ruolo dichiarato lo richiede.

### Periodo

**Responsabilità.** Rappresentare la decorrenza temporale di un'Appartenenza: da quando a quando (eventualmente ancora aperta) la relazione è dichiarata valida.

**Natura logica.** Il Periodo non ha un'identità propria indipendente dall'Appartenenza a cui si riferisce: è definito interamente dalle sue proprietà (data di inizio, data di fine) — coerente con il Value Object "PeriodoDiValidità" già previsto dal Domain Model (§4) per Appartenenza, Partecipazione, Partner e QualificaDichiarata. Viene trattato come sezione a sé in questo documento per la sua importanza di dominio (§7), non perché costituisca un'entità con identità propria.

**Relazioni principali.** Appartiene a esattamente una Appartenenza.

### Fonte

**Responsabilità.** Rappresentare da dove proviene l'informazione che ha dato origine a una specifica Appartenenza o a una sua proprietà (es. il Ruolo dichiarato).

**Tipologie previste (non esaustive).** Autodichiarazione della Persona; dichiarazione dell'Impresa (tramite chi ne ha già la facoltà di gestione); importazione da un registro pubblico o da una fonte istituzionale esterna; dichiarazione di un terzo con titolo per farlo; intervento della redazione o della moderazione della piattaforma.

**Motivo dell'esistenza.** La stessa informazione ha un peso diverso secondo la sua origine: un'autodichiarazione e un dato importato da un registro pubblico non offrono la stessa garanzia, e questa differenza deve essere un dato di dominio esplicito, non un'inferenza implicita (§10).

**Relazioni principali.** Appartiene a esattamente una Appartenenza (o a una sua singola proprietà dichiarata, quando la precisione lo richiede); concorre a determinare l'attendibilità complessiva della relazione (§10).

### Evidenza di verifica

**Responsabilità.** Rappresentare ciò che ha permesso, o permetterebbe, di confermare uno o più assi di verifica di un'Appartenenza (§10): un riscontro documentale, una conferma incrociata con un'altra Appartenenza dichiarata dalla controparte, una conferma proveniente da una fonte istituzionale.

**Motivo dell'esistenza.** Senza un concetto esplicito di evidenza, lo stato di verifica (§6, §10) sarebbe una semplice etichetta senza motivazione tracciabile: l'Evidenza di verifica è ciò che rende lo stato di verifica giustificabile e riesaminabile.

**Relazioni principali.** È facoltativa; una Appartenenza può avere zero, una o più Evidenze di verifica, ciascuna collegata a uno o più assi di verifica specifici (§10).

### Autorizzazione gestionale

**Responsabilità.** Rappresentare se, e in quale misura, l'Appartenenza conferisce alla Persona la facoltà — sul piano del significato di business, non tecnico — di intervenire sulla scheda dell'Impresa (modificarne la presentazione, gestirne i contenuti collegati).

**Motivo dell'esistenza.** La facoltà di gestione non deriva automaticamente dal Ruolo (§8): deve poter essere concessa, modulata e revocata come fatto a sé stante, indipendentemente dal fatto che la Persona sia, ad esempio, proprietaria o legale rappresentante.

**Relazioni principali.** Appartiene a esattamente una Appartenenza; è facoltativa (un'Appartenenza può non prevederla) e può evolvere nel tempo indipendentemente dal Ruolo o dallo stato della relazione (§14 — evento AutorizzazioneGestionaleConcessa/Revocata).

---

## 3. Natura della relazione

Il solo Ruolo (§4) non basta a descrivere il tipo di legame che unisce una Persona a un'Impresa: due Ruoli molto diversi (es. "socio" e "dipendente") condividono comunque una domanda di fondo — che tipo di relazione è, nella sua essenza? Il dominio distingue sei nature, non mutuamente esclusive nel tempo (una stessa Persona può avere, verso la stessa Impresa, più Appartenenze di natura diversa, §12):

- **Proprietà** — la Persona detiene, in tutto o in parte, la titolarità economica dell'Impresa.
- **Lavoro** — la Persona presta la propria attività lavorativa in modo continuativo per l'Impresa.
- **Collaborazione** — la Persona contribuisce all'attività dell'Impresa senza un rapporto di lavoro continuativo tipico, ad esempio in modo occasionale o progettuale.
- **Consulenza** — la Persona presta un'attività professionale esterna e specialistica a beneficio dell'Impresa.
- **Rappresentanza** — la Persona ha il potere di agire e impegnare l'Impresa verso l'esterno.
- **Gestione della scheda** — la Persona ha la facoltà, sul piano del significato di business, di intervenire sulla presentazione digitale dell'Impresa sulla piattaforma.

**Principio.** Una singola Appartenenza può manifestare più di una di queste nature contemporaneamente (un fondatore è tipicamente sia Proprietà sia Rappresentanza sia, spesso, Gestione della scheda), ma nessuna natura implica automaticamente le altre (§8): devono poter essere vere, false o parzialmente vere in ogni combinazione.

---

## 4. Tipologie di appartenenza

Il catalogo dei Ruoli è governato centralmente ed è pensato per restare comprensibile, non per essere esaustivo di ogni possibile qualifica giuridica (per questo esiste la Qualifica, §2). La tabella indica la natura *tipica* di ciascun Ruolo (§3): un'indicazione di significato, non un vincolo automatico (§8).

| Ruolo | Significato | Natura tipica |
|---|---|---|
| Fondatore | Ha avviato l'Impresa | Proprietà, spesso anche Rappresentanza |
| Titolare | Guida operativamente l'Impresa | Proprietà, spesso anche Rappresentanza |
| Socio | Detiene una quota di proprietà dell'Impresa | Proprietà |
| Amministratore | Ha un potere di gestione dell'Impresa secondo la sua forma organizzativa | Rappresentanza |
| Legale rappresentante | Ha il potere formale di agire e impegnare l'Impresa verso l'esterno | Rappresentanza |
| Dirigente | Guida una funzione o un'area dell'Impresa con autonomia gestionale | Lavoro |
| Dipendente | Presta la propria attività lavorativa in modo continuativo | Lavoro |
| Consulente | Presta un'attività professionale esterna e specialistica | Consulenza |
| Collaboratore | Contribuisce all'attività dell'Impresa senza un rapporto di lavoro tipico | Collaborazione |
| Referente | È il punto di contatto operativo per chi interagisce con l'Impresa | Lavoro o Collaborazione, secondo il caso |
| Gestore della scheda | Ha la facoltà di intervenire sulla presentazione digitale dell'Impresa | Gestione della scheda |

**Nota.** Il catalogo è estendibile (Domain Model, §14 — Estensibilità, meccanismo 4): un nuovo Ruolo può essere introdotto in futuro senza alcun impatto sulle entità Persona o Impresa, proprio perché l'Appartenenza è un aggregato indipendente.

---

## 5. Relazioni del dominio

| # | Relazione | Cardinalità (lato Appartenenza) | Cardinalità (lato altra entità) | Natura |
|---|---|---|---|---|
| R1 | Appartenenza — Persona | 1 Appartenenza → esattamente 1 Persona | 1 Persona → 0..N Appartenenza (anche verso la stessa Impresa in periodi diversi) | Riferimento per identità, nessun possesso; dominio esterno (Persone) |
| R2 | Appartenenza — Impresa | 1 Appartenenza → esattamente 1 Impresa | 1 Impresa → 0..N Appartenenza | Riferimento per identità, nessun possesso; dominio esterno (Imprese) |
| R3 | Appartenenza — Ruolo | 1 Appartenenza → esattamente 1 Ruolo | 1 voce di catalogo Ruolo → 0..N Appartenenza | Possesso: il Ruolo dichiarato appartiene alla singola Appartenenza |
| R4 | Appartenenza — Qualifica | 1 Appartenenza → 0..N Qualifica | 1 Qualifica → esattamente 1 Appartenenza | Possesso, facoltativo |
| R5 | Appartenenza — Periodo | 1 Appartenenza → esattamente 1 Periodo | — (Value Object, nessuna identità propria) | Possesso, obbligatorio |
| R6 | Appartenenza — Fonte | 1 Appartenenza → 1..N Fonte (una per informazione dichiarata, quando la precisione lo richiede) | — | Possesso |
| R7 | Appartenenza — Evidenza di verifica | 1 Appartenenza → 0..N Evidenza di verifica | 1 Evidenza → 1..N assi di verifica (§10) | Possesso, facoltativo |
| R8 | Appartenenza — Autorizzazione gestionale | 1 Appartenenza → 0..1 Autorizzazione gestionale | — | Possesso, facoltativo |

**Nota su R1/R2.** Questa è la relazione fondante del dominio: l'Appartenenza non è posseduta né dalla Persona né dall'Impresa (coerente con Domain Model §5-§6 e con le note di non-possesso già presenti in `logical/persone.md` §3 e in `logical/imprese.md` §2, §4). È l'unico punto del modello in cui i due domini si incontrano.

---

## 6. Ciclo di vita

Il ciclo di vita di un'Appartenenza non è un singolo percorso lineare, ma la combinazione di **tre assi distinti**, che non devono mai essere compressi in un'unica proprietà (coerente con l'approccio già adottato in `logical/imprese.md` §5 per l'Impresa):

**a) Stato editoriale (della dichiarazione).** Descrive la fase procedurale con cui l'Appartenenza nasce, prima di diventare un fatto pienamente formalizzato:
- *Proposta* — qualcuno (la Persona o l'Impresa) ha iniziato il processo dichiarando l'esistenza della relazione, ma la formalizzazione non è ancora completa (manca tipicamente la controparte, o mancano le informazioni minime).
- *Dichiarata* — l'Appartenenza è stata formalizzata: esiste come fatto registrato, con un Ruolo, un Periodo e una Fonte, indipendentemente dal fatto che sia già stata verificata.

Una volta raggiunto lo stato Dichiarata, questo asse non si ripete: l'Appartenenza esiste come fatto, e il seguito della sua storia è descritto dagli altri due assi.

**b) Stato della relazione.** Descrive se il fatto dichiarato è, in un dato momento, in corso, sospeso o terminato:
- *Sospesa* — la relazione è temporaneamente non operativa (es. un'aspettativa, una pausa dichiarata da una delle parti), in modo reversibile.
- *Conclusa* — la relazione è terminata in modo ordinario (fine del ruolo, uscita dall'Impresa, chiusura dell'Impresa).
- *Revocata* — la relazione è stata invalidata dalla piattaforma o da chi ne ha titolo, tipicamente a seguito di una Contestazione (§9) risolta in tal senso: a differenza di Conclusa, Revocata implica che la relazione non era, o non è più, da considerarsi valida.
- *Archiviata* — stato finale di conservazione storica, successivo a Conclusa o Revocata, per mantenere la traccia della relazione nel tempo (§7, §12) senza che compaia più nei percorsi correnti.

In assenza di Sospesa, Conclusa, Revocata o Archiviata, un'Appartenenza Dichiarata è da considerarsi in corso: questo modello non introduce un ulteriore termine "Attiva" distinto, poiché la condizione "in corso" è lo stato implicito di ogni Appartenenza Dichiarata che non sia (ancora) transitata verso una delle fasi successive.

**c) Stato di verifica.** Descrive quanto la piattaforma può confermare la veridicità di quanto dichiarato, indipendentemente dal fatto che la relazione sia in corso, sospesa o conclusa (approfondito al §10):
- *Non verificata* — nessun controllo è stato effettuato; è lo stato di default.
- *In verifica* — un controllo è in corso.
- *Confermata* — uno o più assi di verifica (§10) sono stati confermati con un'Evidenza di verifica.
- *Contestata* — una delle parti, o un terzo con titolo per farlo, ha messo in dubbio la veridicità di quanto dichiarato (approfondito al §9); è uno stato che può sovrapporsi in qualsiasi momento agli altri due assi, e che tipicamente blocca l'evoluzione della relazione fino a una risoluzione.

**Perché i tre assi restano separati.** Un'Appartenenza può essere Dichiarata e in corso (asse b) ma ancora Non verificata (asse c); può essere Confermata (asse c) ma nel frattempo Sospesa (asse b); può essere Contestata (asse c) senza che questo comporti automaticamente una Revoca (asse b), fino a quando la contestazione non viene risolta. Comprimere questi tre assi in un unico stato obbligherebbe a scegliere significati impropri per combinazioni reali e frequenti.

---

## 7. Decorrenza e storicizzazione

**Inizio.** Ogni Appartenenza ha una data di inizio, che rappresenta da quando la relazione dichiarata è considerata valida — non necessariamente la data in cui è stata registrata sulla piattaforma, che può essere successiva (es. una relazione dichiarata oggi ma iniziata anni prima).

**Fine.** La data di fine è facoltativa e può restare aperta: un'Appartenenza in corso non ha una fine nota. Quando la relazione si conclude (§6), la data di fine viene fissata.

**Successione dei ruoli.** Quando il ruolo di una Persona verso un'Impresa cambia, il modello non modifica il Ruolo di un'Appartenenza esistente facendola "diventare" un'altra cosa: si conclude l'Appartenenza corrente e ne inizia una nuova, con il nuovo Ruolo, esattamente come già descritto nel Flusso 3 di `logical/persone.md` ("Persona con Appartenenza Attiva ... ruolo collaboratore → Terminazione ... → Nuova Appartenenza ... ruolo titolare"). Questo permette di conservare la storia esatta di ciascun ruolo con il proprio periodo, senza sovrascriverla.

**Storico.** La conclusione, la sospensione o la revoca di un'Appartenenza non ne comporta la distruzione: il fatto che una relazione sia esistita, con un determinato Ruolo e un determinato Periodo, resta un dato storico conservato (§12, invariante), coerente con quanto già stabilito in `logical/persone.md` (§6, regola 11) e in `logical/imprese.md` (§10, regola 10).

**Appartenenze senza data certa.** Il modello ammette che la data di inizio, e talvolta anche quella di fine, possa non essere nota con precisione (es. un'Appartenenza importata da una fonte storica incompleta, o una relazione molto risalente mai dichiarata prima). In questi casi l'assenza di una data certa è un dato legittimo del Periodo, non un errore da correggere forzatamente: il modello non deve obbligare a inventare una data plausibile solo per completezza formale.

---

## 8. Proprietà e rappresentanza

Il dominio distingue esplicitamente cinque concetti che, nel linguaggio comune, vengono spesso confusi ma che qui restano separati:

- **Proprietà** — la titolarità economica dell'Impresa, in tutto o in parte.
- **Rappresentanza legale** — il potere formale, riconosciuto secondo la forma organizzativa dell'Impresa, di agire e impegnarla verso l'esterno.
- **Rappresentanza operativa** — il fatto di essere, nella pratica quotidiana, il punto di contatto per chi interagisce con l'Impresa, senza necessariamente avere un potere formale.
- **Gestione della scheda** — la facoltà, sul piano del significato di business, di intervenire sulla presentazione digitale dell'Impresa sulla piattaforma.
- **Referente** — la Persona indicata come punto di contatto responsabile, che può coincidere o non coincidere con chi detiene uno degli altri quattro concetti.

**Principio cardine, senza eccezioni.** Nessuno di questi cinque concetti implica automaticamente uno degli altri. Un Socio può non avere alcuna Rappresentanza legale; un Legale rappresentante può non avere la Gestione della scheda; chi ha la Gestione della scheda può non avere alcuna Proprietà né Rappresentanza legale reale (§7 di `logical/imprese.md`, qui ribadito e formalizzato come regola di dominio esplicita, §12). Ogni Appartenenza deve poter dichiarare in modo indipendente quali di questi concetti si applicano, senza inferirli dal solo Ruolo (§3, §4): il Ruolo indica una natura *tipica*, non una conseguenza automatica.

---

## 9. Dichiarazione e conferma

Il ciclo con cui un'informazione relativa a un'Appartenenza nasce e si stabilizza segue queste fasi concettuali:

- **Dichiarazione** — una delle parti (la Persona o l'Impresa, tramite chi ne ha già la facoltà) afferma l'esistenza della relazione, con un Ruolo e un Periodo.
- **Conferma** — l'altra parte, o una fonte terza attendibile, riconosce come veritiera la dichiarazione. La Conferma è ciò che permette il passaggio verso lo stato di verifica "Confermata" (§6, §10), ma non è l'unico modo per raggiungerlo: un'Evidenza di verifica indipendente può bastare anche senza una conferma esplicita della controparte.
- **Contestazione** — una delle parti, o un terzo con titolo per farlo, mette in dubbio la dichiarazione (es. l'Impresa non riconosce un ruolo dichiarato da una Persona, oppure due Persone rivendicano lo stesso ruolo esclusivo nello stesso periodo).
- **Correzione** — chi ha dichiarato l'informazione, o chi ha titolo per farlo, la modifica per renderla più precisa o per rettificare un errore, senza che questo costituisca necessariamente una Contestazione.
- **Ritiro** — chi ha dichiarato l'informazione la ritira prima che sia stata confermata o contestata, riportando l'Appartenenza a uno stato precedente o interrompendola del tutto se era ancora in fase di Proposta.
- **Assenza di risposta** — la controparte non conferma né contesta entro un tempo ragionevole: il modello non forza questo caso verso una Conferma implicita né verso una Contestazione implicita (§12 — nessuna dichiarazione equivale automaticamente a verifica); l'Appartenenza resta legittimamente Dichiarata e Non verificata fino a un evento successivo.

**Principio.** Né la Dichiarazione né l'assenza di una Contestazione costituiscono, da sole, una Conferma: la conferma è un fatto distinto e deve poter essere tracciato come tale (§10).

---

## 10. Verifica e affidabilità

Analogamente a quanto già stabilito per il dominio Imprese (`logical/imprese.md`, §8), la verifica di un'Appartenenza non è un singolo indicatore, ma un insieme di **assi indipendenti**, ciascuno dei quali può essere confermato separatamente:

- **Identità** — la piattaforma ha potuto confermare che la Persona coinvolta è davvero chi dichiara di essere (asse che appartiene anche al dominio Persone/Identità & Accessi, qui richiamato per il suo effetto sull'affidabilità dell'Appartenenza).
- **Esistenza dell'Impresa** — la piattaforma ha potuto confermare che l'Impresa coinvolta esiste realmente come soggetto economico.
- **Effettività della relazione** — la piattaforma ha potuto confermare che la relazione tra quella Persona e quella Impresa esiste davvero, indipendentemente dal Ruolo specifico dichiarato.
- **Ruolo** — la piattaforma ha potuto confermare che il Ruolo dichiarato corrisponde a quello realmente ricoperto.
- **Periodo** — la piattaforma ha potuto confermare che le date dichiarate (inizio, eventuale fine) corrispondono alla realtà.
- **Rappresentanza** — la piattaforma ha potuto confermare che la Persona detiene realmente il potere di rappresentanza legale o operativa dichiarato (§8).
- **Autorizzazione gestionale** — la piattaforma ha potuto confermare che la facoltà di gestire la scheda è stata concessa legittimamente da chi ne aveva titolo.

**Fonte dell'informazione e sua attendibilità.** Ogni asse di verifica si appoggia su una Fonte (§2) e, quando presente, su una o più Evidenze di verifica (§2). L'attendibilità della Fonte è essa stessa un dato di dominio da considerare esplicitamente: un'autodichiarazione non ha la stessa attendibilità di un dato importato da un registro pubblico aggiornato, e un registro pubblico obsoleto (§13) non ha la stessa attendibilità di uno aggiornato. Il modello non riduce l'attendibilità a un singolo valore numerico: la tratta come un giudizio qualitativo associato alla Fonte, coerente con la natura non quantitativa degli altri assi di questo documento.

**Perché nessun asse sostituisce gli altri.** Confermare l'identità della Persona non conferma che il suo ruolo dichiarato sia vero; confermare l'esistenza dell'Impresa non conferma che quella specifica Persona vi sia davvero legata; confermare l'effettività della relazione non conferma automaticamente la Rappresentanza o l'Autorizzazione gestionale. Mantenere gli assi separati permette di comunicare con precisione cosa la piattaforma sa per certo e cosa no, evitando un badge unico "verificato" che nasconderebbe più di quanto chiarisce (principio già adottato in `logical/imprese.md` §8).

---

## 11. Visibilità

La visibilità di un'Appartenenza descrive chi può conoscerne l'esistenza e i dettagli, ed è distinta dallo stato della relazione o di verifica (§6):

- **Privata** — l'Appartenenza è nota solo alle parti direttamente coinvolte (la Persona e chi gestisce l'Impresa).
- **Interna** — l'Appartenenza è visibile a chi ha un titolo organizzativo per conoscerla (es. altre Persone con un'Appartenenza attiva verso la stessa Impresa), ma non pubblicamente.
- **Redazionale** — l'Appartenenza è stata portata a conoscenza della redazione o della moderazione della piattaforma, tipicamente in relazione a una verifica o a una contestazione, senza essere ancora pubblica.
- **Pubblica** — l'Appartenenza è visibile a chiunque consulti il profilo della Persona o la scheda dell'Impresa, secondo le condizioni descritte di seguito.
- **Storica** — l'Appartenenza non è più presentata come attuale, ma resta consultabile come riferimento del percorso passato della Persona o dell'Impresa (coerente con l'Archiviazione, §6).
- **Contestata** — uno stato di visibilità che segnala che l'Appartenenza, per quanto eventualmente ancora mostrata, è oggetto di una contestazione in corso (§9): la piattaforma non deve presentarla con la stessa sicurezza di una relazione non contestata.

**Coerenza con Persona e Impresa.** La visibilità pubblica di un'Appartenenza non può eccedere quella consentita dai due soggetti che collega: un'Appartenenza non può essere pubblica se la Persona coinvolta non ha un profilo pubblico, né se l'Impresa coinvolta non ha una scheda pubblica (coerente con `logical/imprese.md` §9, che già subordina la visibilità di ogni entità collegata — incluse le relazioni — a quella dell'Impresa). Quando una delle due parti perde la propria visibilità pubblica (es. un profilo Persona torna privato, o una scheda Impresa viene sospesa), l'Appartenenza che le collega deve automaticamente non poter più essere mostrata pubblicamente, indipendentemente dal proprio stato interno di visibilità dichiarato.

---

## 12. Regole e invarianti

1. Ogni Appartenenza collega esattamente una Persona e esattamente una Impresa: non può esistere un'Appartenenza priva di uno dei due riferimenti, né un'Appartenenza che ne colleghi più di uno per lato.
2. Persona e Impresa possono esistere indipendentemente dall'esistenza di alcuna Appartenenza: nessuna delle due entità dipende da questo dominio per la propria esistenza.
3. Una stessa Persona può avere più Appartenenze contemporaneamente, anche verso Imprese diverse, e anche più di una verso la stessa Impresa se di natura diversa (§3).
4. Una stessa Persona può avere Ruoli diversi verso la stessa Impresa in periodi diversi, tramite Appartenenze distinte e successive (§7).
5. Lo storico delle Appartenenze deve essere conservato: la conclusione, la sospensione o la revoca di un'Appartenenza non ne cancella l'esistenza passata (§7).
6. Nessuna dichiarazione equivale automaticamente a una verifica: lo stato di verifica (§6, §10) deve essere raggiunto attraverso un processo distinto dalla semplice dichiarazione (§9).
7. La gestione della scheda non equivale alla rappresentanza legale, né a nessuno degli altri concetti distinti al §8: ogni concetto deve poter essere vero, falso o parzialmente vero indipendentemente dagli altri.
8. Una relazione Contestata non deve essere presentata pubblicamente con la stessa sicurezza di una relazione non contestata (§11).
9. Una relazione Conclusa, Revocata o Archiviata non deve essere presentata come attuale.
10. La visibilità pubblica di un'Appartenenza non può mai eccedere quella consentita dalla Persona o dall'Impresa che collega (§11).
11. Un'Autorizzazione gestionale può essere concessa e revocata indipendentemente dal Ruolo e dallo stato della relazione, e deve essere sempre un fatto esplicito, mai inferito.
12. Un'Appartenenza priva di data di inizio certa resta comunque un'Appartenenza legittima (§7): l'incertezza sulla data non invalida il resto della dichiarazione.

---

## 13. Casi limite

**Più ruoli contemporanei.** Una Persona può avere, verso la stessa Impresa, più Appartenenze attive nello stesso periodo se le nature (§3) sono distinte (es. Socio e, contemporaneamente, Dipendente): il modello non impone un ruolo unico per coppia Persona-Impresa.

**Cambio ruolo.** Gestito tramite la successione descritta al §7: si conclude l'Appartenenza con il vecchio Ruolo e si dichiara una nuova Appartenenza con il nuovo Ruolo, preservando la storia di entrambe.

**Socio non operativo.** Una Persona può avere un'Appartenenza di natura Proprietà senza alcuna natura Lavoro, Rappresentanza o Gestione della scheda: è la dimostrazione diretta del principio del §8.

**Amministratore non socio.** Simmetrico al caso precedente: natura Rappresentanza senza natura Proprietà.

**Consulente.** Un'Appartenenza di natura Consulenza, tipicamente senza Proprietà né Rappresentanza, con un Periodo spesso più breve o intermittente rispetto a un rapporto di Lavoro.

**Referente.** Può non coincidere con nessuno degli altri ruoli con potere formale: è il Ruolo pensato esplicitamente per il punto di contatto operativo, che può anche essere un Dipendente o un Collaboratore con questa funzione aggiuntiva.

**Ex socio.** Un'Appartenenza di natura Proprietà, Conclusa, che resta storicamente conservata (§7, §12) anche se la Persona non ha più alcun legame attuale con l'Impresa.

**Impresa cessata.** Le Appartenenze verso un'Impresa cessata (stato operativo definito in `logical/imprese.md` §5) transitano naturalmente verso Conclusa, salvo casi particolari (es. una procedura di chiusura ancora in corso), senza che questo comprometta la loro storicizzazione.

**Impresa individuale.** Tipicamente prevede un'unica Appartenenza di natura Proprietà e Rappresentanza coincidenti nella stessa Persona (il titolare), ma il modello non impone questa coincidenza come regola: resta comunque possibile, ad esempio, un'Appartenenza di natura Collaborazione verso la stessa impresa individuale.

**Cooperative.** Il modello non presuppone un socio di controllo unico: più Appartenenze di natura Proprietà possono coesistere in condizioni di parità, coerente con la non forzatura verso la sola società di capitali già stabilita in `logical/imprese.md` (§2, §11).

**Enti e associazioni.** Se in futuro un'Impresa nel senso ampio di soggetto economico includerà anche enti economici (già previsto in `logical/imprese.md` §2), le Appartenenze verso di essi seguono le stesse regole, con Ruoli quali Amministratore, Dirigente o Referente più frequenti di Socio.

**Fusioni.** Quando due Imprese si fondono, le Appartenenze verso l'Impresa non più esistente transitano verso Conclusa e restano storicizzate; l'eventuale continuità verso la nuova Impresa richiede nuove Appartenenze dichiarate, non una migrazione automatica e silenziosa delle vecchie (coerente con la domanda aperta corrispondente in `logical/imprese.md` §12).

**Cessioni.** Una cessione di quote o dell'intera Impresa comporta tipicamente la conclusione delle Appartenenze di natura Proprietà del cedente e la dichiarazione di nuove Appartenenze per il cessionario, senza alterare le Appartenenze storiche già concluse.

**Fonti pubbliche obsolete.** Quando la Fonte di un'informazione è un registro pubblico che si scopre non aggiornato, l'Evidenza di verifica basata su di essa deve poter essere messa in dubbio senza che questo equivalga automaticamente a una Contestazione tra le parti (§9): è un problema di attendibilità della Fonte (§10), da trattare distintamente da un conflitto tra Persona e Impresa.

---

## 14. Eventi di dominio

- **AppartenenzaProposta** — è stato avviato il processo di dichiarazione di una relazione, non ancora formalizzato.
- **AppartenenzaDichiarata** — una relazione tra una Persona e un'Impresa è stata formalizzata, con un Ruolo e un Periodo.
- **AppartenenzaConfermata** — uno o più assi di verifica della relazione sono stati confermati.
- **AppartenenzaContestata** — una delle parti, o un terzo con titolo per farlo, ha messo in dubbio la relazione dichiarata.
- **AppartenenzaVerificata** — sintesi del raggiungimento di un livello di verifica ritenuto sufficiente sugli assi rilevanti per quella relazione (evento distinto da AppartenenzaConfermata quando si vuole segnalare che l'insieme degli assi necessari è stato coperto, non un singolo asse).
- **AppartenenzaSospesa** — la relazione è stata temporaneamente resa non operativa.
- **AppartenenzaConclusa** — la relazione è terminata in modo ordinario.
- **AppartenenzaRevocata** — la relazione è stata invalidata dalla piattaforma o da chi ne ha titolo.
- **RuoloModificato** — il Ruolo associato a una relazione è cambiato (tipicamente tramite la successione descritta al §7: conclusione e nuova dichiarazione).
- **AutorizzazioneGestionaleConcessa** — a una Persona è stata attribuita la facoltà di gestire la scheda dell'Impresa.
- **AutorizzazioneGestionaleRevocata** — questa facoltà è stata ritirata.
- **VisibilitàModificata** — il livello di visibilità di un'Appartenenza è cambiato (§11).

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate.**

1. Appartenenze è un dominio autonomo: non appartiene né al dominio Persone né al dominio Imprese, coerente con quanto già anticipato dal Domain Model e ripreso senza contraddizioni dai modelli logici di Persone e Imprese.
2. Persona e Impresa restano domini autonomi: nessuno dei due possiede l'Appartenenza, e l'Appartenenza non duplica alcun dato dei due.
3. Un'Appartenenza non assegna alcun diritto di accesso tecnico: descrive esclusivamente fatti di business (relazione, ruolo, autorizzazione gestionale nel suo significato di business).
4. I permessi applicativi concreti appartengono esclusivamente al futuro dominio Identità & Accessi, che potrà derivarli dai fatti qui registrati senza che questo documento debba occuparsene.
5. Rappresentanza legale e gestione della scheda sono concetti distinti, insieme a proprietà, rappresentanza operativa e ruolo di referente (§8): nessuno implica automaticamente gli altri.
6. Stato della relazione, stato editoriale e stato di verifica sono assi indipendenti (§6) e non vanno mai compressi in un'unica proprietà.
7. Lo storico delle Appartenenze deve essere sempre conservato, anche dopo conclusione, sospensione, revoca o archiviazione (§7, §12).
8. Nessuna dichiarazione diventa automaticamente un fatto pubblico: la visibilità (§11) è un asse distinto sia dalla dichiarazione sia dalla verifica, e resta comunque subordinata alla visibilità di Persona e Impresa.
9. Il modello supporta, senza forzature, impresa individuale, società, cooperativa, startup, ente economico e attività professionale organizzata (§13), coerente con `logical/imprese.md` §2.
10. Il dominio può alimentare l'Osservatorio con dati aggregati su ruoli, settori e relazioni, senza mai esporre nei report pubblici una singola Appartenenza in modo identificabile, preservando la riservatezza delle Persone coinvolte.

**Nota di allineamento documentale.** Il ciclo di vita descritto al §6 di questo documento è più articolato (tre assi, nove stati) di quanto sintetizzato in `logical/imprese.md` (§6, sei stati su un solo asse). Le due descrizioni non sono in contraddizione: quella in Imprese è una vista di sintesi dal punto di vista dell'Impresa, coerente con questo modello più dettagliato, che ne è la fonte autorevole. Non è necessaria alcuna modifica a `logical/imprese.md` per effetto di questo documento; un futuro aggiornamento redazionale di quel documento per rimandare esplicitamente a questo modello resta un'attività raccomandata ma non urgente.

**Domande aperte.**

- Come devono essere classificati i ruoli non ancora previsti nel catalogo del §4 (es. figure specifiche di alcune forme organizzative)? Il meccanismo di estensione è già previsto (§4, nota), ma il processo di governance per aggiungere un nuovo Ruolo non è definito da questo documento.
- Le partecipazioni societarie (quote, percentuali di proprietà) devono essere rappresentate come un dato strutturato dell'Appartenenza di natura Proprietà, o restare fuori dal modello nella sua prima versione?
- Come si determina, sul piano di dominio, il "titolare effettivo" di un'Impresa quando la proprietà è distribuita su più Appartenenze e più livelli (es. proprietà indiretta tramite un'altra Impresa)?
- La conferma reciproca (Persona e Impresa che confermano entrambe la stessa dichiarazione) deve essere sufficiente per raggiungere lo stato "Confermata", o è comunque necessaria un'Evidenza di verifica esterna in alcuni casi?
- Per quanto tempo un'Evidenza di verifica deve essere considerata valida prima di richiedere un nuovo controllo (durata della verifica)?
- Come devono essere trattate le Appartenenze importate da fonti esterne prima che la piattaforma esistesse (es. un registro storico), in termini di Fonte, Evidenza di verifica e responsabilità della loro correttezza?
- Lo storico delle Appartenenze concluse deve essere pubblicabile per default (coerente con la narrazione del percorso di una Persona o di un'Impresa) o deve richiedere un consenso esplicito aggiuntivo rispetto a quello già previsto per il profilo Persona o la scheda Impresa?
- A chi spetta la responsabilità redazionale in caso di Contestazione non risolta in tempi ragionevoli: resta sospesa indefinitamente, o esiste un termine oltre il quale la piattaforma deve prendere una decisione?

Queste domande non vengono risolte forzatamente in questo documento e restano decisioni progettuali future, coerenti con l'approccio già adottato in `logical/persone.md` e `logical/imprese.md`.

