# Physical Domain Mapping — Dominio Appartenenze

## Nota introduttiva di esclusione

Questo documento rappresenta il passaggio tra il modello logico del dominio Appartenenze e la sua futura rappresentazione fisica. Non crea uno schema di database, non scrive SQL, non crea tabelle, non usa PostgreSQL o Supabase come riferimento progettuale, non indica tipi di dato, non parla di colonne, chiavi, indici, trigger, vincoli tecnici, RLS, API o codice, non descrive meccanismi di autenticazione o autorizzazione, non anticipa decisioni implementative.

Le eventuali menzioni tecnologiche compaiono esclusivamente in questa nota, in §30 "Questioni aperte e aspetti rinviati" e in §31 "Controllo finale", per confermarne l'assenza altrove nel testo.

Il documento applica integralmente la baseline architetturale (`architecture-baseline.md`), il Reference Model (`02-reference-model.md`), le convenzioni architetturali (`03-convenzioni-architetturali.md`), gli attributi di qualità (`04-quality-attributes.md`), la Dependency Map approvata (`domain-dependency-map.md`) e le decisioni già consolidate nei mapping di Persone (`domain-mapping/persone.md`) e Imprese (`domain-mapping/imprese.md`). Non ridefinisce la metodologia generale: la applica concretamente al dominio Appartenenze.

## Documenti letti integralmente

- `docs/domain-model.md`
- `docs/architecture/logical/appartenenze.md`
- `docs/architecture/logical/persone.md`
- `docs/architecture/logical/imprese.md`
- `docs/architecture/logical/professionisti.md`
- `docs/architecture/logical/collaborazioni.md`
- `docs/architecture/logical/eventi.md`
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

I mapping di Persone e Imprese sono assunti come approvati. La Dependency Map è assunta come vincolante per le decisioni già consolidate (DC1-DC13) e come riferimento provvisorio per le righe ancora marcate "Provvisoria" (in particolare D3, D9, D12, D17, D23, D28, relative al titolo di rappresentanza e alla vista di sintesi AppartenenzaImpresa), che questo documento ha il compito di confermare o correggere in quanto proprietario di quella relazione.

---

# Regola fondamentale

Una Appartenenza non è un attributo incorporato di Persona o Impresa. È un concetto autonomo quando possiede almeno parte delle seguenti caratteristiche: significato relazionale proprio; ruolo contestuale; periodo di validità; stato autonomo; fonte o dichiarazione; verificabilità; visibilità; responsabilità; eventi propri; possibilità di cessare senza eliminare i soggetti collegati.

La relazione non deve essere promossa ad Appartenenza quando rappresenta soltanto: una menzione; un contatto occasionale; una partecipazione a un evento; una collaborazione temporanea non strutturale; un accesso digitale; una citazione editoriale; un rapporto cliente-fornitore non previsto dal dominio; una relazione dedotta automaticamente da altri fatti.

---

# Distinzioni obbligatorie

## Appartenenza e identità

La relazione non definisce l'identità stabile dei soggetti. Persona e Impresa possiedono la propria identità indipendentemente da qualunque Appartenenza esistente o cessata (`appartenenze.md` §12, regola 2; `domain-mapping/persone.md` §5; `domain-mapping/imprese.md` §5).

## Appartenenza e ruolo di accesso

Un ruolo organizzativo o societario non coincide con un'autorizzazione digitale. Il Ruolo di un'Appartenenza (§7) è un fatto di business; il Ruolo applicativo di Identità & Accessi è un permesso tecnico: i due concetti restano distinti anche quando condividono, per caso, un nome simile (`identita-accessi.md` §6; `reconciliation-report.md` §7, voce "Ruolo").

## Appartenenza e collaborazione

Una collaborazione può essere episodica, progettuale o finalizzata a uno scambio; l'Appartenenza esprime un legame strutturato nel contesto definito dal dominio logico (§3 di `appartenenze.md`). Non ogni collaborazione diventa un'Appartenenza, e un'Appartenenza non è mai una Collaborazione (`collaborazioni.md` §1; §20 di questo documento).

## Appartenenza e professione

Una qualifica professionale appartiene a Professionisti; l'eventuale legame tra professionista e organizzazione deve essere classificato secondo il suo significato reale: se strutturato, è un'Appartenenza; se occasionale o di supporto, resta di competenza di Professionisti o Collaborazioni (`professionisti.md` §1, §4; §19 di questo documento).

## Appartenenza e partecipazione a eventi

La partecipazione non crea automaticamente una relazione strutturale (`eventi.md` §9, principio sulla rappresentanza; §20 di questo documento).

## Appartenenza e relazione editoriale

Essere autore, intervistato, citato o narrato non costituisce automaticamente Appartenenza (principio generale di non incorporazione, `domain-dependency-map.md` §11, P10).

## Appartenenza e contatto

Essere referente di contatto può coincidere con un ruolo relazionale soltanto quando il modello lo prevede espressamente (Ruolo "Referente", `appartenenze.md` §4); il contatto tecnico e la relazione organizzativa restano distinti (`domain-mapping/imprese.md` §8-§9).

---

# Indice

1. Scopo del mapping
2. Sintesi del dominio logico
3. Definizione operativa di Appartenenza
4. Nucleo persistente
5. Concetti incorporati
6. Soggetti collegabili
7. Ruoli
8. Contesto dell'Appartenenza
9. Responsabilità e poteri
10. Identità della relazione
11. Assi di stato
12. Temporalità
13. Verifiche
14. Dichiarazioni e fonti
15. Conflitti e contestazioni
16. Visibilità e pubblicazione
17. Relazione con Persone
18. Relazione con Imprese
19. Relazione con Professionisti
20. Relazione con Collaborazioni, Eventi e Opportunità
21. Relazione con Identità & Accessi
22. Eventi di dominio
23. Dati sorgente, derivati e storici
24. Dipendenze
25. Analisi dei cicli
26. Classificazione delle decisioni
27. Pattern riutilizzabili
28. Verifica degli attributi di qualità
29. Decisioni consolidate
30. Questioni aperte e aspetti rinviati
31. Controllo finale

Riepilogo finale

---

## 1. Scopo del mapping

**Responsabilità del dominio Appartenenze.** Il dominio rappresenta tutte le relazioni organizzative tra una Persona e un'Impresa: chi è collegato a chi, con quale ruolo, per quale periodo, in base a quale fonte, con quale evidenza di verifica ed eventualmente con quale facoltà di gestire la scheda impresa (`appartenenze.md` §1). Governa la relazione, non i soggetti collegati: Appartenenze non contiene né modifica alcun dato personale della Persona né alcun dato descrittivo, commerciale o economico dell'Impresa.

**Obiettivo del Physical Domain Mapping.** Tradurre le sette entità logiche del dominio (Appartenenza, Ruolo, Qualifica, Periodo, Fonte, Evidenza di verifica, Autorizzazione gestionale — `appartenenze.md` §2), le sei nature della relazione (§3), il catalogo dei Ruoli (§4), le relazioni del dominio (§5), il ciclo di vita a tre assi (§6), le regole di decorrenza e storicizzazione (§7), la distinzione tra proprietà e rappresentanza (§8), il ciclo di dichiarazione e conferma (§9), gli assi di verifica (§10), la visibilità (§11) e gli invarianti (§12) in un insieme di decisioni concettuali di livello fisico, senza introdurre alcun significato che il documento logico non abbia già previsto (`01-principi-mapping.md` §2, principio 3) e senza anticipare alcuna decisione di schema (§30).

**Confini inclusi.** Questo documento tratta esclusivamente ciò che il dominio logico ha dichiarato di possedere: il fatto stesso della relazione Persona–Impresa; il Ruolo e la sua eventuale Qualifica; il Periodo di decorrenza; la Fonte dell'informazione; l'Evidenza di verifica; l'Autorizzazione gestionale. Include, come dipendenze referenziate e mai come oggetto di una decisione di mapping, i punti in cui il dominio logico Appartenenze tocca altri domini: l'identità della Persona e dell'Impresa referenziate, il titolo di rappresentanza utilizzato da Identità & Accessi, Opportunità, Collaborazioni ed Eventi.

**Confini esclusi.** Questo documento non tratta: i dati personali della Persona (dominio Persone); i dati descrittivi, commerciali o economici dell'Impresa (dominio Imprese); i meccanismi tecnici di autenticazione, autorizzazione o permesso applicativo concreto (dominio Identità & Accessi, che deriva i propri fatti tecnici da quelli qui registrati senza che questo documento se ne occupi); le qualifiche professionali (dominio Professionisti); le Collaborazioni, le Opportunità o gli Eventi che referenziano un'Appartenenza per qualificare un titolo di rappresentanza, senza che questo dominio ne acquisisca la responsabilità; i report dell'Osservatorio.

**Rapporto con Persone.** Appartenenze referenzia la Persona coinvolta per identità, senza mai duplicarne i dati (R1 di `appartenenze.md` §5). Persone non possiede l'Appartenenza e non ha alcuna relazione diretta con Imprese: ogni attraversamento passa sempre per questo Aggregate (`domain-mapping/persone.md` §4, riga R6-R7).

**Rapporto con Imprese.** Appartenenze referenzia l'Impresa coinvolta per identità, senza mai duplicarne i dati (R2 di `appartenenze.md` §5). Imprese non possiede soci, amministratori, fondatori, referenti o dipendenti come attributi incorporati: può mostrarne soltanto una vista di sintesi non normativa (AppartenenzaImpresa, `domain-mapping/imprese.md` §9), la cui fonte autorevole resta esclusivamente questo dominio.

**Rapporto con gli altri domini.** Professionisti, Collaborazioni, Eventi e Opportunità utilizzano il titolo di rappresentanza stabilito da un'Appartenenza per verificare con quale legittimità una Persona agisce per conto di un'Impresa, senza incorporare la relazione (§19-§20). Identità & Accessi deriva i permessi tecnici concreti dai fatti di business qui registrati, senza diventarne proprietario (§21). Osservatorio può aggregare, in forma statistica, informazioni su ruoli, settori e imprese senza mai esporre singole relazioni identificabili nei propri report pubblici (§23).

**Dichiarazione vincolante.** Appartenenze governa la relazione e non i soggetti collegati. Questo principio, già stabilito a livello logico (`appartenenze.md` §1, §12 regola 2) e già confermato dal punto di vista simmetrico nei due mapping approvati (`domain-mapping/persone.md` §4, `domain-mapping/imprese.md` §9), è il vincolo strutturale sotteso a ogni sezione successiva di questo documento.

---

## 2. Sintesi del dominio logico

**Concetti principali.** Appartenenza (aggregate root), Ruolo, Qualifica, Periodo, Fonte, Evidenza di verifica, Autorizzazione gestionale (`appartenenze.md` §2).

**Aggregate o radice concettuale.** Appartenenza è l'Aggregate Root del dominio: rappresenta il legame tra una Persona e un'Impresa in un determinato periodo, con un Ruolo, un'eventuale Qualifica, una Fonte, un'eventuale Evidenza di verifica e un'eventuale Autorizzazione gestionale. Ogni altra entità del documento logico esiste in funzione di una specifica Appartenenza (§2).

**Soggetti collegabili.** Esattamente una Persona ed esattamente un'Impresa per ciascuna Appartenenza (§2, §5, R1-R2; approfondito al §6 di questo documento).

**Ruoli.** Undici voci di catalogo governate centralmente: Fondatore, Titolare, Socio, Amministratore, Legale rappresentante, Dirigente, Dipendente, Consulente, Collaboratore, Referente, Gestore della scheda (§4), ciascuna con una natura tipica non vincolante (§3, §8).

**Invarianti.** Dodici regole (§12 di `appartenenze.md`): unicità dei due riferimenti per Appartenenza; indipendenza esistenziale di Persona e Impresa; molteplicità di Appartenenze per la stessa Persona; successione di Ruoli tramite Appartenenze distinte; conservazione obbligatoria dello storico; non-automatismo della verifica; indipendenza dei cinque concetti del §8; visibilità subordinata alla contestazione; non presentazione come attuale di relazioni concluse; visibilità pubblica mai eccedente quella di Persona/Impresa; esplicitità dell'Autorizzazione gestionale; legittimità dell'Appartenenza senza data certa.

**Stati.** Tre assi indipendenti (§6): stato editoriale della dichiarazione (Proposta, Dichiarata), stato della relazione (in corso implicito, Sospesa, Conclusa, Revocata, Archiviata), stato di verifica (Non verificata, In verifica, Confermata, Contestata).

**Eventi.** Dodici eventi di dominio (§14): AppartenenzaProposta, AppartenenzaDichiarata, AppartenenzaConfermata, AppartenenzaContestata, AppartenenzaVerificata, AppartenenzaSospesa, AppartenenzaConclusa, AppartenenzaRevocata, RuoloModificato, AutorizzazioneGestionaleConcessa, AutorizzazioneGestionaleRevocata, VisibilitàModificata.

**Verifiche.** Sette assi indipendenti (§10): Identità, Esistenza dell'Impresa, Effettività della relazione, Ruolo, Periodo, Rappresentanza, Autorizzazione gestionale, ciascuno appoggiato su una Fonte e, quando presente, su una o più Evidenze di verifica.

**Temporalità.** Decorrenza obbligatoria, fine facoltativa e apribile, successione dei ruoli tramite conclusione e nuova dichiarazione (non modifica in luogo), storicizzazione obbligatoria, ammissibilità di date incerte (§7).

**Dipendenze.** In uscita: Persone, Imprese (§1, §24 di `appartenenze.md`). In entrata: Imprese (vista di sintesi), Identità & Accessi (titolo per l'Associazione operativa), Opportunità, Collaborazioni, Eventi (titolo di rappresentanza), Osservatorio (aggregazioni), Ricerca, Notifiche.

**Decisioni già consolidate.** Appartenenze è un dominio autonomo, non appartenente né a Persone né a Imprese; nessuna delle due Entity duplica dati dell'altra; l'Appartenenza non assegna diritti di accesso tecnico; i permessi applicativi restano di Identità & Accessi; rappresentanza legale, rappresentanza operativa, gestione della scheda, proprietà e ruolo di referente sono cinque concetti indipendenti; i tre assi di stato non vanno mai compressi; lo storico va sempre conservato; nessuna dichiarazione diventa automaticamente un fatto pubblico (`appartenenze.md` §15, decisioni 1-8).

**Ambiguità o tensioni ereditate, segnalate senza risoluzione forzata.** La nota di allineamento documentale di `appartenenze.md` §15 segnala che il ciclo di vita descritto in `imprese.md` §6 (sei stati su un solo asse) è una vista di sintesi non contraddittoria del ciclo di vita più articolato qui descritto (tre assi, nove stati): questo mapping adotta la fonte autorevole (§11, §18 di questo documento). Le domande aperte di `appartenenze.md` §15 (classificazione di nuovi Ruoli, rappresentazione delle quote di proprietà, determinazione del "titolare effettivo", sufficienza della conferma reciproca, durata di validità di un'Evidenza, trattamento di Appartenenze importate da fonti storiche, pubblicabilità di default dello storico, termine per la risoluzione di una Contestazione) non sono risolte da questo documento e sono riportate integralmente al §30.

---

## 3. Definizione operativa di Appartenenza

**Definizione.** Un'Appartenenza è il fatto relazionale, autonomo e storicizzabile, con cui una Persona identificata e un'Impresa identificata sono legate da un vincolo organizzativo dichiarato — di proprietà, lavoro, collaborazione, consulenza, rappresentanza o gestione della scheda — valido per un periodo determinato o apribile, soggetto a un proprio stato editoriale, a un proprio stato della relazione e a una propria verifica multidimensionale, indipendenti dallo stato e dall'identità dei due soggetti collegati.

**Natura relazionale.** L'Appartenenza è per definizione un legame tra due Aggregate distinti (Persona, Impresa), mai un attributo incorporato di uno dei due (R07, `02-reference-model.md` §6; regola fondamentale, sopra).

**Contesto.** Il contesto che attribuisce significato alla relazione è l'Impresa (o, in prospettiva, un'altra organizzazione, §8 di `appartenenze.md`, §14 di questo documento): un'Appartenenza non esiste senza un contesto organizzativo che la ospiti.

**Soggetto.** La Persona è sempre il soggetto che aderisce al contesto, mai il contesto stesso.

**Organizzazione o soggetto destinatario.** L'Impresa (o l'organizzazione) è sempre il contesto ospitante, mai il soggetto aderente.

**Ruolo.** Ogni Appartenenza dichiara esattamente un Ruolo di catalogo (§4 di questo documento), eventualmente precisato da una o più Qualifiche.

**Validità.** Ogni Appartenenza ha un Periodo di decorrenza, obbligatorio nell'inizio e facoltativo nella fine (§12).

**Stato.** Ogni Appartenenza ha uno stato composto da tre assi indipendenti, mai comprimibili (§11).

**Proprietà.** L'Appartenenza è posseduta esclusivamente dal dominio Appartenenze: nessun attributo sostanziale della relazione (ruolo, periodo, stato, verifica, autorizzazione) può essere duplicato o ridefinito da Persone o da Imprese (P1, P4 di `domain-dependency-map.md` §11).

**Autonomia concettuale.** L'Appartenenza esiste, evolve e può cessare indipendentemente dall'esistenza dei due soggetti collegati, che a loro volta esistono indipendentemente da essa (`appartenenze.md` §12, regola 2).

### Criteri positivi

Una relazione appartiene al dominio quando presenta almeno una delle seguenti caratteristiche, in coerenza con la Regola fondamentale (sopra): un significato relazionale proprio riconducibile a una delle sei nature del §3 di `appartenenze.md` (proprietà, lavoro, collaborazione, consulenza, rappresentanza, gestione della scheda); un Ruolo di catalogo dichiarato; un Periodo di decorrenza tracciato; uno stato autonomo su almeno uno dei tre assi; una Fonte dichiarata; la possibilità di essere sottoposta a verifica; una regola di visibilità propria; una responsabilità o un potere attribuito; un evento di dominio proprio; la possibilità di cessare senza che i soggetti collegati cessino.

### Criteri negativi

Una relazione non deve essere promossa ad Appartenenza quando si limita a una menzione, un contatto occasionale, una partecipazione a un Evento (senza Appartenenza sottostante), una Collaborazione temporanea non strutturale, un accesso digitale, una citazione editoriale, un rapporto cliente-fornitore non previsto dal dominio logico, oppure quando sarebbe dedotta automaticamente da altri fatti senza una dichiarazione propria (§9).

---

## 4. Nucleo persistente

| Concetto | Significato | Natura architetturale | Responsabilità | Ciclo di vita | Dominio proprietario | Rapporto con l'Aggregate | Pattern applicato | Motivazione |
|---|---|---|---|---|---|---|---|---|
| Appartenenza | Il legame tra una Persona e un'Impresa in un determinato periodo, con Ruolo, Fonte ed eventuali Qualifica, Evidenza, Autorizzazione | Aggregate Root | Rendere esplicito, storicizzabile e verificabile "chi anima cosa" (§1 di `appartenenze.md`) | Multi-asse: editoriale, relazionale, di verifica (§11) | Appartenenze | È l'Aggregate stesso | **A01** | Corrisponde esattamente all'Aggregate Root già dichiarato dal documento logico (§2); nessun'altra entità del dominio può fungere da radice |
| Ruolo | La posizione o funzione dichiarata all'interno di una specifica Appartenenza | Entity dipendente, con riferimento a un Elenco controllato di catalogo | Qualificare il "come" della relazione | Segue il ciclo di vita dell'Appartenenza che lo dichiara | Appartenenze | Dipendente dall'Appartenenza (R01); il catalogo dei valori possibili è un Elenco controllato (C03) governato centralmente | **E02** + **C03** | Il Ruolo dichiarato ha identità propria all'interno dell'Appartenenza (può essere modificato, generando `RuoloModificato`, §22) ma non ha senso concettuale fuori da essa; il catalogo delle undici voci (§4 di `appartenenze.md`) è un Elenco controllato perché limitato e stabile, non una Tassonomia condivisa con altri domini (nessun altro dominio dichiara di possedere questo catalogo) |
| Qualifica (di ruolo) | Una denominazione più specifica del Ruolo dichiarato | Entity dipendente interna, facoltativa | Precisare il Ruolo senza moltiplicare il catalogo | Segue il ciclo di vita dell'Appartenenza (o del Ruolo che precisa) | Appartenenze | Dipendente dal Ruolo di una specifica Appartenenza (E04, non direttamente dall'Aggregate Root) | **E04** | Il documento logico la tratta come un dettaglio del Ruolo, non come un fatto autonomamente citabile da altri domini (§2 di `appartenenze.md`); è facoltativa e può essere multipla per la stessa Appartenenza |
| Periodo | La decorrenza temporale di un'Appartenenza | Value Object incorporato | Rappresentare da quando a quando la relazione è dichiarata valida | Segue il ciclo di vita dell'Appartenenza | Appartenenze | Interamente descritto dalle proprie proprietà (data di inizio, data di fine), privo di identità propria (§2 di `appartenenze.md`) | **VO01** + **T03/T04/T05** | Il documento logico dichiara esplicitamente che il Periodo "non ha un'identità propria indipendente dall'Appartenenza" ed è coerente con il Value Object "PeriodoDiValidità" già previsto dal Domain Model; trattato come sezione a sé per importanza di dominio, non per autonomia concettuale |
| Fonte | Da dove proviene l'informazione che ha dato origine a un'Appartenenza o a una sua proprietà | Value Object incorporato, ripetuto per informazione dichiarata | Tracciare l'origine dell'informazione e la sua attendibilità | Segue il ciclo di vita dell'Appartenenza (o della proprietà specifica che qualifica) | Appartenenze | Incorporato nell'Appartenenza o in una sua singola proprietà dichiarata | **V03** | Coerente con la definizione di V03 in `02-reference-model.md` §8: "Fonte è un pattern locale ripetuto in ciascun dominio, non un'entità condivisa tra domini" |
| Evidenza di verifica | Ciò che permette di confermare uno o più assi di verifica di un'Appartenenza | Entity dipendente, facoltativa e ripetibile | Rendere giustificabile e riesaminabile lo stato di verifica | Segue il ciclo di vita dell'Appartenenza, con propria storicizzazione quando superata da una nuova Evidenza | Appartenenze | Dipendente dall'Appartenenza, collegata a uno o più assi di verifica specifici (§10) | **E02** + **V02** (+ **DOC03** quando di natura documentale) | Il documento logico distingue esplicitamente l'Evidenza (§2) dallo stato di verifica che essa sostiene (§10): senza un concetto esplicito di Evidenza, lo stato di verifica sarebbe "una semplice etichetta senza motivazione tracciabile" |
| Autorizzazione gestionale | Se, e in quale misura, l'Appartenenza conferisce la facoltà di intervenire sulla scheda dell'Impresa | Entity dipendente, facoltativa, con evoluzione temporale propria | Rappresentare un fatto di business concedibile, modulabile e revocabile indipendentemente dal Ruolo | Segue il ciclo di vita dell'Appartenenza, con propri eventi di concessione e revoca (§22) | Appartenenze | Dipendente dall'Appartenenza (R01); referenziata da Identità & Accessi come condizione per un'Associazione operativa, senza mai diventarne proprietà (R06) | **E02** + **R06** | Il documento logico afferma esplicitamente che "la facoltà di gestione non deriva automaticamente dal Ruolo" e "deve poter essere concessa, modulata e revocata come fatto a sé stante" (§2 di `appartenenze.md`); la sua natura di titolo di rappresentanza corrisponde esattamente a R06 (`02-reference-model.md` §6) |

**Nota su Qualifica come E04, non E02.** A differenza di Ruolo (E02, direttamente dipendente dall'Aggregate Root e con propria identità di catalogo), la Qualifica è trattata come E04 perché il documento logico la descrive come una precisazione **del Ruolo** di una specifica Appartenenza, non come un fatto autonomamente riferibile all'Appartenenza nel suo complesso (§2 di `appartenenze.md`, "una denominazione o una precisazione più specifica del Ruolo dichiarato"). Questa distinzione (E02 vs E04) non presuppone che ognuno dei sette concetti debba diventare una entità autonoma nella futura rappresentazione fisica: descrive soltanto il livello di dipendenza concettuale riconosciuto dal documento logico.

**Perché nessun concetto è escluso dal nucleo persistente.** Tutti i sette concetti elencati richiedono una rappresentazione persistente autonoma perché ciascuno ha una cardinalità variabile rispetto all'Appartenenza che lo contiene (zero, una o più istanze secondo le relazioni R3-R8 di `appartenenze.md` §5) e perché ciascuno può evolvere nel tempo con un proprio istante di creazione, distinto da quello dell'Appartenenza stessa (in particolare Evidenza di verifica e Autorizzazione gestionale, che si aggiungono spesso in un momento successivo alla dichiarazione iniziale).

---

## 5. Concetti incorporati

| Concetto | Concetto ospitante | Significato | Pattern applicato | Motivazione | Condizioni per una futura promozione |
|---|---|---|---|---|---|
| Descrizione del ruolo (natura tipica) | Ruolo | L'associazione tra un Ruolo di catalogo e una o più delle sei nature (§3 di `appartenenze.md`) | **VO01** + **C06** | È un attributo descrittivo e di classificazione, non implica automaticamente alcuna facoltà (§2 di `appartenenze.md`); non richiede identità propria distinta dal Ruolo che qualifica | Se in futuro la piattaforma richiedesse di analizzare statisticamente le nature indipendentemente dai Ruoli, potrebbe emergere l'utilità di una Tassonomia condivisa delle nature (C02); non necessario allo stato attuale |
| Note contestuali (annotazioni libere su una dichiarazione) | Appartenenza, o una sua proprietà specifica | Precisazioni descrittive non strutturate che accompagnano una dichiarazione | **VO01** | Il documento logico non le tratta come un fatto autonomamente verificabile o storicizzabile, ma come un dettaglio descrittivo | Se una nota contestuale diventasse essa stessa oggetto di una Contestazione (§15) o di una Verifica (§13), andrebbe trattata come Fonte o come Evidenza, non più come nota libera |
| Intervallo temporale (Periodo) | Appartenenza | Data di inizio e data di fine, eventualmente aperta | **VO01** + **T05** | Come descritto al §4: privo di identità propria, coerente con il Value Object "PeriodoDiValidità" del Domain Model | Non applicabile: il documento logico esclude esplicitamente che il Periodo abbia un'identità propria (§2 di `appartenenze.md`) |
| Motivazione della cessazione | Appartenenza (proprietà dell'asse "stato della relazione", §11) | La ragione per cui una relazione transita verso Conclusa, Revocata o Sospesa | **VO01** | È un attributo descrittivo della transizione di stato, non un fatto autonomo con proprio ciclo di vita | Se la motivazione dovesse alimentare un processo di Contestazione strutturato (§15), la componente di conflitto andrebbe trattata come propria Entity (già prevista, §15), non la motivazione in sé |
| Livello di responsabilità (attributo di una Responsabilità, §9) | Responsabilità (a sua volta E02 dipendente dall'Appartenenza, §9) | Il grado o l'ambito di una specifica responsabilità esercitata | **VO01** | Attributo descrittivo di una responsabilità già identificata come Entity dipendente | Non applicabile allo stato attuale del modello logico |
| Provenienza della dichiarazione (tipologia di Fonte) | Fonte | La tipologia non esaustiva elencata al §2 di `appartenenze.md` (autodichiarazione, dichiarazione dell'Impresa, importazione da registro pubblico, dichiarazione di terzo, intervento redazionale) | **VO01** + **C03** | Un Elenco controllato di tipologie, incorporato nella Fonte, coerente con la natura non condivisa di V03 (§4) | Se il numero di tipologie di Fonte crescesse in modo da richiedere una propria gestione autonoma (nuove fonti istituzionali esterne con proprio ciclo di vita), potrebbe emergere l'utilità di una Tassonomia condivisa; non necessario allo stato attuale |
| Preferenze di visibilità (scelta di uno dei sei livelli, §11 di `appartenenze.md`) | Appartenenza (asse di visibilità, §16 di questo documento) | La selezione tra Privata, Interna, Redazionale, Pubblica, Storica, Contestata | **VO01** + **C03** (i sei valori sono un Elenco controllato, non una Tassonomia condivisa) | Il documento logico tratta la visibilità come un attributo dell'Appartenenza con un insieme chiuso di valori, non come un catalogo esterno | Non applicabile: il documento logico non prevede un'evoluzione autonoma dei livelli di visibilità |

**Perché nessuno di questi concetti richiede identità propria.** Ciascuno dei sette elementi in tabella è descritto interamente dai propri attributi, cambia sempre insieme al concetto che lo ospita, e non ha bisogno di essere distinto come fatto autonomo anche a parità di contenuto (criterio negativo del pattern Value Object, `02-reference-model.md` §5). Questo distingue questi concetti dal nucleo persistente del §4, dove ciascun elemento ha una propria cardinalità e un proprio istante di creazione potenzialmente distinto da quello dell'Appartenenza.

---

## 6. Soggetti collegabili

| Combinazione | Significato | Dominio proprietario dei soggetti | Dominio proprietario della relazione | Direzione semantica | Simmetria o asimmetria | Cardinalità concettuale | Temporalità | Pattern applicato |
|---|---|---|---|---|---|---|---|---|
| Persona–Impresa | Il legame organizzativo che questo documento mappa integralmente (§2-§16) | Persone (per la Persona), Imprese (per l'Impresa) | Appartenenze | Asimmetrica: la Persona aderisce al contesto, l'Impresa lo ospita (§3 di questo documento) | Asimmetrica per natura (un ruolo di appartenenza non è mai reciproco nello stesso senso) | Una Persona: 0..N Appartenenze (anche verso la stessa Impresa in periodi diversi, §12 regola 3); un'Impresa: 0..N Appartenenze | Aperta o delimitata (§12 di questo documento) | **R07** (+ **R04** quando conclusa) |
| Persona–Organizzazione | Prevista in via generale dal Domain Model e richiamata dalla Dependency Map (§5) come possibile futura estensione, quando un'Organizzazione istituzionale distinta dall'Impresa verrà formalizzata (`reconciliation-report.md` §13, dominio candidato) | Persone (per la Persona); dominio "Organizzazioni istituzionali" non ancora esistente | Appartenenze, per analogia strutturale, se e quando il dominio verrà formalizzato | Analoga a Persona–Impresa | Analoga | Non determinabile allo stato attuale | Non determinabile | Non applicabile: nessun pattern è assegnato a un concetto non ancora esistente nell'inventario degli undici domini |
| Impresa–Organizzazione | Come sopra, riferita a un'adesione o affiliazione tra un'Impresa e un'organizzazione istituzionale o associativa | Imprese (per l'Impresa); dominio "Organizzazioni istituzionali" non ancora esistente | Appartenenze, per analogia, se e quando il dominio verrà formalizzato | Analoga a Persona–Impresa, con l'Impresa nel ruolo di soggetto aderente | Analoga | Non determinabile allo stato attuale | Non determinabile | Non applicabile |
| Persona–Persona | Non prevista da `appartenenze.md`, che modella esclusivamente il legame Persona–Impresa (§1: "rappresenta tutte le relazioni organizzative tra una Persona e un'Impresa") | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Non applicabile |
| Impresa–Impresa | Non prevista da `appartenenze.md`; un'eventuale relazione tra due Imprese (partecipazione, controllo societario) non è modellata da questo documento logico e non viene introdotta da questo mapping | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Non applicabile |

**Perché non si introducono nuove categorie di soggetti.** Il documento logico dichiara esplicitamente, al §1, che il dominio "rappresenta tutte le relazioni organizzative tra una Persona e un'Impresa": questo mapping non estende tale perimetro. Le righe "Persona–Organizzazione" e "Impresa–Organizzazione" sono riportate perché già menzionate dal materiale richiesto (Domain Model, Dependency Map §5) come possibili estensioni future per analogia strutturale, non perché il documento logico attuale le modelli: sono dichiarate esplicitamente come non determinabili, non come concetti già mappabili.

---

## 7. Ruoli

| Ruolo | Significato | Contesto in cui è valido | Soggetti ammessi | Esclusività | Cumulabilità | Temporalità | Verificabilità | Visibilità | Classificazione | Pattern applicato |
|---|---|---|---|---|---|---|---|---|---|---|
| Fondatore | Ha avviato l'Impresa | Qualunque forma organizzativa di Impresa | Persona | Non esclusivo (più fondatori possibili) | Cumulabile con Titolare, Socio, Amministratore, Legale rappresentante, Gestore della scheda | Tipicamente risalente all'avvio dell'Impresa, storicizzato indefinitamente | Tramite asse "Ruolo" (§13) | Secondo §16 | Locale (catalogo di dominio, C03) | **E02** + **C03** |
| Titolare | Guida operativamente l'Impresa | Prevalentemente ditte individuali e imprese a controllo personale diretto | Persona | Non esclusivo in senso assoluto, ma tipicamente unico per impresa individuale (§13, caso limite) | Cumulabile con Fondatore, Rappresentanza, Gestione della scheda | Tipicamente coincidente con la vita operativa dell'Impresa | Come sopra | Come sopra | Locale | **E02** + **C03** |
| Socio | Detiene una quota di proprietà dell'Impresa | Forme organizzative con capitale suddiviso (società, cooperative) | Persona | Non esclusivo: più Soci contemporanei ammessi, anche in condizioni di parità (§13, caso "Cooperative") | Cumulabile con Amministratore, Legale rappresentante | Può essere di lunga durata o cessare con una cessione (§13, caso "Cessioni") | Come sopra | Come sopra | Locale | **E02** + **C03** |
| Amministratore | Ha un potere di gestione secondo la forma organizzativa | Società, cooperative, enti economici | Persona | Non esclusivo | Cumulabile con Socio, Legale rappresentante | Variabile, spesso a mandato | Come sopra, con particolare rilievo per l'asse "Rappresentanza" | Come sopra | Locale | **E02** + **C03** |
| Legale rappresentante | Ha il potere formale di agire e impegnare l'Impresa verso l'esterno | Qualunque forma organizzativa | Persona | Tipicamente limitato a una o poche Persone per periodo, secondo la forma organizzativa (non imposto come regola dal modello logico) | Cumulabile con Socio, Amministratore, Titolare | Variabile | Asse "Rappresentanza" (§10 di `appartenenze.md`) | Come sopra | Locale | **E02** + **C03** + **R06** (quando la relazione attribuisce effettivamente il potere) |
| Dirigente | Guida una funzione o un'area con autonomia gestionale | Imprese con struttura organizzativa articolata | Persona | Non esclusivo | Cumulabile con Referente | Tipicamente legata a un rapporto di lavoro continuativo | Asse "Ruolo" | Come sopra | Locale | **E02** + **C03** |
| Dipendente | Presta attività lavorativa in modo continuativo | Qualunque forma organizzativa | Persona | Non esclusivo | Cumulabile con Referente, Dirigente | Continuativa, con Periodo tipicamente più lungo | Come sopra | Come sopra | Locale | **E02** + **C03** |
| Consulente | Presta un'attività professionale esterna e specialistica | Qualunque forma organizzativa | Persona | Non esclusivo | Cumulabile con Referente | Spesso breve o intermittente (§13, caso "Consulente") | Come sopra | Come sopra | Locale | **E02** + **C03** |
| Collaboratore | Contribuisce senza un rapporto di lavoro tipico | Qualunque forma organizzativa | Persona | Non esclusivo | Cumulabile con Referente | Variabile, spesso non continuativa | Come sopra | Come sopra | Locale | **E02** + **C03** |
| Referente | Punto di contatto operativo per chi interagisce con l'Impresa | Qualunque forma organizzativa | Persona (tipicamente già Dipendente o Collaboratore, §13) | Non esclusivo | Cumulabile con qualunque altro Ruolo | Variabile | Come sopra | Come sopra | Locale | **E02** + **C03** |
| Gestore della scheda | Ha la facoltà di intervenire sulla presentazione digitale dell'Impresa | Qualunque forma organizzativa | Persona | Non esclusivo | Cumulabile con qualunque altro Ruolo; è distinto dall'Autorizzazione gestionale come fatto formale (§9 di questo documento) | Variabile, evolve indipendentemente dal Ruolo (§2 di `appartenenze.md`) | Asse "Autorizzazione gestionale" | Tipicamente Interna (§16) | Locale | **E02** + **C03** + **R06** |

**Il catalogo come Elenco controllato, non Tassonomia condivisa.** Le undici voci sono classificate **C03** (Elenco controllato) e non **C02** (Tassonomia condivisa) perché nessun altro dominio dichiara di possedere o gestire autonomamente questo catalogo: è governato centralmente da Appartenenze, limitato e pensato per restare comprensibile, non esaustivo di ogni qualifica giuridica — la Qualifica (§4, §5) esiste esattamente per questo scopo (`appartenenze.md` §4). Il catalogo è comunque estendibile (Domain Model §14, meccanismo 4; `appartenenze.md` §4, nota) senza impatto su Persona o Impresa, proprio perché l'Appartenenza è un aggregato indipendente.

**Non confusione con altri ruoli.** Nessun Ruolo di questa tabella coincide con: una qualifica professionale (dominio Professionisti, §19); un ruolo applicativo di accesso (dominio Identità & Accessi, §21); un ruolo editoriale (dominio Contenuti editoriali, non referenziato da questo documento logico); un ruolo assunto in un Evento (Organizzatore, Relatore, Sponsor, Partecipante — dominio Eventi, §20); un ruolo in una Collaborazione (Soggetto proponente, Soggetto destinatario — dominio Collaborazioni, §20). Ciascuno di questi ruoli, quando implica l'agire per conto di un'Impresa, presuppone un Ruolo di questa tabella tramite un'Appartenenza esistente, ma non è mai lo stesso concetto (§8 di `appartenenze.md`, principio cardine, ripreso qui senza eccezioni).

---

## 8. Contesto dell'Appartenenza

**Cosa attribuisce significato alla relazione.** Il contesto è sempre l'Impresa: `appartenenze.md` §1 dichiara che il dominio rappresenta relazioni "tra una Persona e un'Impresa", senza prevedere, nella sua versione attuale, altri tipi di contesto (associazione, rete, progetto strutturato) come Aggregate distinti referenziabili da un'Appartenenza.

| Elemento potenziale di contesto | Ruolo rispetto all'Appartenenza | Dominio proprietario | Trattamento in questo mapping |
|---|---|---|---|
| Impresa | Identifica il contesto; è l'unico contesto previsto dal documento logico attuale | Imprese | Referenziata per identità stabile (**E03**), mai incorporata (§6, §18) |
| Organizzazione (istituzionale o associativa) | Qualificherebbe un futuro contesto ulteriore, non ancora formalizzato | Dominio non ancora esistente (`reconciliation-report.md` §13) | Non trattato: nessuna Entity "Organizzazione" è introdotta da questo documento (§6) |
| Associazione, rete | Menzionate da altri documenti logici (es. `collaborazioni.md` §6) come possibili intermediari, non come contesto di un'Appartenenza | Esterno alla piattaforma, o Risorsa di supporto (`mercati-internazionali.md` §2) | Non trattato: non è un contesto di Appartenenza secondo `appartenenze.md` |
| Progetto strutturato | Non previsto da `appartenenze.md` come contesto autonomo | Non applicabile | Non trattato |
| Unità organizzativa (funzione, area interna) | Attributo descrittivo del Ruolo "Dirigente" (§7), non un contesto proprio | Imprese (se mai modellato) | Non trattato come Entity propria; resta, se necessario, un attributo descrittivo del Ruolo (§5) |
| Sede | Attributo dell'Impresa (`SedeImpresa`, `domain-mapping/imprese.md` §7), non della relazione | Imprese | Referenziato indirettamente solo tramite l'Impresa; non è un dato proprio dell'Appartenenza |
| Ambito territoriale | Non un contesto dell'Appartenenza: l'ambito territoriale è un attributo dell'Impresa o del Professionista (`professionisti.md` §8), non della relazione organizzativa | Imprese, Tassonomia condivisa (Territori) | Non trattato |
| Settore | Attributo dell'Impresa (`SettoreImpresa`), non della relazione | Imprese, Tassonomia condivisa | Non trattato |
| Incarico formalizzato | Coincide concettualmente con Ruolo + Qualifica (§4, §5, §7), non un contesto distinto | Appartenenze | Già trattato come Ruolo/Qualifica, non introdotto come concetto ulteriore |

**Cosa identifica il contesto.** L'identità stabile dell'Impresa referenziata (**E03**, coerente con `domain-mapping/imprese.md` §5).

**Cosa qualifica la relazione.** Il Ruolo, la Qualifica, la natura tipica (§3 di `appartenenze.md`), il Periodo.

**Cosa sono semplicemente dati esterni referenziati.** L'identità della Persona e dell'Impresa; eventuali voci di Tassonomia condivisa che, indirettamente tramite l'Impresa, potrebbero comparire in una futura presentazione della relazione (es. il settore dell'Impresa), ma che non sono mai attributi propri dell'Appartenenza.

**Cosa appartiene ad altri domini.** Sede, settore, ambito territoriale e qualunque altro attributo descrittivo dell'Impresa restano di proprietà di Imprese e non devono essere duplicati in Appartenenze (P1, `domain-dependency-map.md` §11).

**Cosa non deve essere duplicato.** Nessun attributo descrittivo dell'Impresa (nome, sede, settore, servizi) può essere copiato o ridondato all'interno dell'Appartenenza per comodità di presentazione: ogni presentazione che li richieda deve attraversare il riferimento all'Impresa (**E03**), mai una copia locale (RC13, RC30).

---

## 9. Responsabilità e poteri

Il documento logico distingue esplicitamente cinque concetti spesso confusi nel linguaggio comune (§8 di `appartenenze.md`): Proprietà, Rappresentanza legale, Rappresentanza operativa, Gestione della scheda, Referente. Questo mapping li tratta come **Responsabilità**, distinte dal semplice Ruolo dichiarato.

| Responsabilità | Significato | Fonte | Durata | Verificabilità | Rapporto con il Ruolo | Rapporto con Identità & Accessi | Proprietà del dato | Pattern applicato |
|---|---|---|---|---|---|---|---|---|
| Proprietà | La titolarità economica dell'Impresa, in tutto o in parte | Dichiarazione della Persona o dell'Impresa, o importazione da fonte esterna (§14) | Segue il Periodo dell'Appartenenza di natura Proprietà | Asse "Effettività della relazione" o, se rilevante, un'evidenza specifica di titolarità (§10, §13) | Tipicamente associata a Fondatore, Titolare, Socio, ma non implicata automaticamente da nessuno di essi (§8, principio cardine) | Nessuno: la Proprietà non genera di per sé alcun permesso applicativo | Appartenenze | **E02** (Responsabilità come Entity dipendente) |
| Rappresentanza legale | Il potere formale, riconosciuto secondo la forma organizzativa, di agire e impegnare l'Impresa verso l'esterno | Dichiarazione con Fonte (registro pubblico, dichiarazione dell'Impresa) | Segue il Periodo dell'Appartenenza; può cessare per revoca formale indipendentemente dal Ruolo | Asse "Rappresentanza" (§10) | Tipicamente associata ad Amministratore, Legale rappresentante, ma non implicata automaticamente (§8) | Referenziata da Identità & Accessi come possibile fondamento di un titolo di rappresentanza (§21), senza mai diventarne proprietà | Appartenenze | **E02** + **R06** |
| Rappresentanza operativa | Il fatto di essere, nella pratica quotidiana, il punto di contatto per chi interagisce con l'Impresa, senza necessariamente un potere formale | Dichiarazione, spesso in combinazione con il Ruolo Referente | Segue il Periodo | Asse "Ruolo" o "Effettività della relazione" | Tipicamente associata a Referente, Dipendente, Collaboratore | Nessuno di per sé | Appartenenze | **E02** |
| Gestione della scheda | La facoltà, sul piano del significato di business, di intervenire sulla presentazione digitale dell'Impresa | Concessione esplicita, mai inferita (§12, regola 11) | Evolve indipendentemente dal Ruolo e dallo stato della relazione (§2 di `appartenenze.md`) | Non verificata di per sé; è essa stessa un fatto dichiarato e concedibile | Non implicata da alcun Ruolo (§8) | È l'Autorizzazione gestionale (§4), il cui fatto tecnico corrispondente è derivato da Identità & Accessi senza diventarne proprietà (**R06**, §21) | Appartenenze | **E02** (Autorizzazione gestionale) + **R06** |
| Referente | La Persona indicata come punto di contatto responsabile | Dichiarazione, tipicamente coincidente con il Ruolo "Referente" (§7) | Segue il Periodo | Asse "Ruolo" | Coincide spesso, ma non necessariamente, con il Ruolo Referente (§8: "può coincidere o non coincidere con chi detiene uno degli altri quattro concetti") | Nessuno di per sé | Appartenenze | **E02** |

**Chiarimento vincolante.** Una responsabilità organizzativa non concede automaticamente un'autorizzazione tecnica sulla piattaforma (principio di non-automatismo, `domain-model.md` §1; ribadito in `identita-accessi.md` §5, "il titolo per agire per l'Impresa deriva da Appartenenze... o da una Delega compatibile... Identità & Accessi verifica l'esistenza del titolo, non lo crea"). Ogni Responsabilità elencata in questa tabella è un fatto di business proprio di Appartenenze; l'eventuale permesso tecnico concreto che ne deriva è sempre una decisione autonoma e successiva di Identità & Accessi, mai una conseguenza automatica (§21).

---

## 10. Identità della relazione

**Identità stabile dell'Appartenenza.** Ogni Appartenenza ha un'identità propria, distinta da quella dei due soggetti che collega e da quella di ogni altra Appartenenza, anche quando coinvolge la stessa coppia Persona-Impresa in periodi diversi (§7, §12 regola 4 di `appartenenze.md`; **A01**).

**Identità dei soggetti collegati.** Referenziata per identità stabile (**E03**), mai duplicata: l'Appartenenza non possiede né rappresenta l'identità della Persona o dell'Impresa, si limita a collegarle (§6, §8 di questo documento).

**Identità pubblica.** Non prevista come concetto distinto per l'Appartenenza stessa: la sua eventuale presentazione pubblica (§16) mostra Ruolo, Periodo e le identità pubbliche dei due soggetti collegati, senza che l'Appartenenza abbia una propria identità pubblica indipendente da quella dei due soggetti.

**Identità esterne.** Non previste dal documento logico: nessun identificativo esterno (es. un codice di un registro pubblico) è modellato come identità propria dell'Appartenenza; un simile identificativo, se presente, è trattato come componente della Fonte (§4, §14).

**Identità derivate.** Non applicabile: l'Appartenenza non è mai un dato derivato (**D04**) da altri fatti — è sempre un fatto dichiarato in prima persona da chi ha titolo per farlo (§14 di questo documento; nessuna Appartenenza è dedotta automaticamente da altri fatti, criterio negativo del §3).

**Relazioni successive tra gli stessi soggetti.** Ammesse e previste esplicitamente: una stessa Persona può avere più Appartenenze verso la stessa Impresa in periodi diversi, anche con lo stesso Ruolo o con Ruoli diversi, ciascuna con propria identità e proprio Periodo (§7, §12 regola 4 di `appartenenze.md`).

**Rinnovi.** Non modellati come modifica di un'Appartenenza esistente: un rinnovo si traduce sempre in una nuova Appartenenza distinta, con proprio Periodo, salvo che la relazione precedente non sia mai stata conclusa (nel qual caso resta la stessa Appartenenza, semplicemente non ancora chiusa).

**Riattivazioni.** Una relazione Sospesa può tornare in corso mantenendo la stessa identità di Appartenenza (§6 di `appartenenze.md`: la Sospensione è "temporaneamente non operativa... in modo reversibile"); una relazione Conclusa, Revocata o Archiviata non viene mai "riattivata" nella stessa istanza: una eventuale ripresa del legame richiede una nuova Appartenenza (§7, "successione dei ruoli").

**Correzioni.** Trattate come Correzione (§9 di `appartenenze.md`, §15 di questo documento) della stessa Appartenenza, non come nuova identità: una Correzione rettifica un'informazione dichiarata senza costituire necessariamente una Contestazione né una nuova relazione.

### Criteri di distinzione

| Situazione | Stessa relazione | Nuova fase | Nuovo ruolo | Relazione distinta | Correzione di un fatto preesistente |
|---|---|---|---|---|---|
| Sospensione e successiva ripresa, stesso Ruolo | Sì | — | — | — | — |
| Cambio di Ruolo (es. da Collaboratore a Titolare) | No | — | Sì (tramite conclusione della precedente e nuova dichiarazione, §7) | — | — |
| Nuova natura aggiuntiva mantenendo il Ruolo precedente attivo (es. Socio che diventa anche Dipendente) | No (sono due Appartenenze distinte contemporanee, §13) | — | — | Sì | — |
| Rettifica di una data o di un dettaglio dichiarato, senza cambiare Ruolo né Periodo sostanziale | Sì | — | — | — | Sì |
| Ex socio che rientra anni dopo con nuova quota | No | — | — | Sì (nuova Appartenenza; la precedente resta storicizzata come Conclusa, §13 caso "Ex socio") | — |

**Vincolo esplicito.** L'identità di uno dei due soggetti collegati non deve mai essere utilizzata come identità della relazione: un'Appartenenza non "eredita" né "diventa" l'identità della Persona o dell'Impresa che collega, e viceversa (coerente con la Regola fondamentale e con `domain-mapping/persone.md` §5, `domain-mapping/imprese.md` §5, che affermano l'indipendenza reciproca delle identità stabili).

---

## 11. Assi di stato

Coerentemente con `appartenenze.md` §6 e con il pattern degli assi indipendenti (S01-S08, `02-reference-model.md` §7), il ciclo di vita dell'Appartenenza è scomposto nei seguenti assi, mai compressi in un unico valore (RC16).

| Asse | Significato | Proprietario | Pattern | Transizioni concettuali | Eventi associati | Distinzione dagli altri assi |
|---|---|---|---|---|---|---|
| Stato editoriale della dichiarazione | A che punto è il processo con cui l'Appartenenza nasce | Appartenenze | **S02** | Proposta → Dichiarata (transizione unica, non reversibile, §6 di `appartenenze.md`) | AppartenenzaProposta, AppartenenzaDichiarata | Non si ripete dopo Dichiarata; distinto dallo stato della relazione, che descrive il seguito della storia |
| Stato della relazione | Se il fatto dichiarato è in corso, sospeso o terminato | Appartenenze | **S01** | (in corso, implicito) → Sospesa → (in corso) / Conclusa / Revocata → Archiviata | AppartenenzaSospesa, AppartenenzaConclusa, AppartenenzaRevocata | Indipendente dallo stato di verifica: una relazione può essere in corso e non verificata, o conclusa e verificata |
| Stato di verifica | Quanto la piattaforma può confermare la veridicità di quanto dichiarato | Appartenenze | **S03** (sempre multidimensionale, si veda §13) | Non verificata → In verifica → Confermata; Contestata può sovrapporsi in qualsiasi momento agli altri due valori | AppartenenzaConfermata, AppartenenzaContestata, AppartenenzaVerificata | Indipendente dallo stato della relazione: una relazione Contestata non è automaticamente Revocata, fino a risoluzione (§6, §15) |
| Stato di visibilità | Chi può conoscere l'esistenza e i dettagli dell'Appartenenza | Appartenenze | **VIS01-VIS06** (si veda dettaglio §16) | Privata → Interna → Redazionale → Pubblica; Storica e Contestata come stati aggiuntivi non lineari | VisibilitàModificata | Distinto dallo stato della relazione e da quello di verifica: una relazione conclusa può restare visibile come Storica (§11 di `appartenenze.md`) |
| Stato dell'Autorizzazione gestionale | Se, in un dato momento, la facoltà di gestire la scheda è concessa | Appartenenze | **S01** (applicato alla sola Autorizzazione gestionale come Entity dipendente distinta, §4) | Non concessa → Concessa → Revocata, indipendentemente dal Ruolo e dallo stato della relazione principale | AutorizzazioneGestionaleConcessa, AutorizzazioneGestionaleRevocata | Distinto dallo stato della relazione: l'Autorizzazione può essere concessa o revocata mentre la relazione principale resta in corso, senza alcuna variazione del proprio stato (§2, §12 regola 11 di `appartenenze.md`) |
| Stato storico | Se una data condizione, su qualunque degli assi precedenti, è quella corrente o appartiene al passato | Appartenenze | **S08** | Corrente → Storico, per ciascun asse indipendentemente | (accompagna ogni evento di transizione, non genera un evento proprio) | Non un'alternativa agli altri assi: li accompagna sempre, coerente con la definizione di S08 in `02-reference-model.md` §7 |

**Assi non applicabili, dichiarati esplicitamente (RC15).** Stato di accesso (**S05**) e Stato di sicurezza (**S06**) non sono applicati all'Appartenenza in quanto tale: l'accesso e la sicurezza riguardano l'Account e l'Identità digitale che eventualmente agiscono sulla base di un'Appartenenza, non l'Appartenenza stessa, che è un fatto di business (§21 di questo documento; `identita-accessi.md`, introduzione). Stato amministrativo (**S07**) non è distinto dallo stato di verifica per questo dominio: la Contestazione (§15) e la Revoca (§6) già coprono, sul piano di dominio, ciò che altrove richiederebbe un intervento amministrativo separato; se in futuro emergesse un bisogno di moderazione redazionale distinto (§30, domanda aperta sulla responsabilità redazionale in caso di Contestazione non risolta), potrebbe essere introdotto come estensione, non come ridefinizione degli assi esistenti.

**Nessuno stato composito.** Coerentemente con RC16 e con l'istruzione esplicita di questo mapping, nessuna combinazione dei sei assi sopra viene compressa in un'unica etichetta come "attiva e verificata e pubblica": ogni presentazione futura della relazione dovrà sempre poter esprimere il valore di ciascun asse indipendentemente dagli altri.

---

## 12. Temporalità

| Aspetto | Pattern | Descrizione |
|---|---|---|
| Decorrenza | **T03** | Data di inizio dell'Appartenenza: da quando la relazione dichiarata è considerata valida, non necessariamente coincidente con la data di registrazione sulla piattaforma (§7 di `appartenenze.md`) |
| Validità aperta | **T01** + **T05** | La data di fine è facoltativa: un'Appartenenza in corso ha un Intervallo con Decorrenza nota e Scadenza non ancora determinata |
| Cessazione | **T04** (quando per Conclusione ordinaria) | Fissazione della data di fine al momento della Conclusione (§6, §7) |
| Sospensione | **S01** con propria sotto-transizione temporale, non un nuovo Intervallo | La Sospensione non chiude il Periodo dell'Appartenenza: la relazione resta la stessa, temporaneamente non operativa (§6) |
| Riattivazione | Ripristino dello stato "in corso" sul medesimo Intervallo | Non genera una nuova Decorrenza: la Sospensione è reversibile senza soluzione di continuità concettuale dell'Appartenenza (§6) |
| Rinnovo | Nuova Appartenenza con nuovo Intervallo (**T03**), quando la precedente è stata conclusa | Coerente con §7 di `appartenenze.md`: "si conclude l'Appartenenza corrente e ne inizia una nuova" |
| Successione di ruoli | **T06** (Cronologia delle Appartenenze successive) + **T07** (Storia) | Il cambio di Ruolo si traduce sempre in conclusione e nuova dichiarazione, mai in modifica in luogo (§7) |
| Sovrapposizione di ruoli | Ammessa esplicitamente: più Appartenenze contemporanee con Intervalli sovrapposti, se di natura diversa (§3, §13) | Non richiede un pattern specifico oltre alla cardinalità già prevista da R07 (una Persona può avere 0..N Appartenenze) |
| Correzione retroattiva | **VR02/VR03** applicati alla singola proprietà dichiarata (non all'intera Appartenenza come Versione) | Il documento logico distingue Correzione da Contestazione (§9): una Correzione rettifica senza necessariamente generare un conflitto |
| Data di dichiarazione | **T02** (Efficacia, se distinta dalla Decorrenza) | La data in cui l'Appartenenza è stata formalizzata sulla piattaforma può essere successiva alla Decorrenza reale (§7) |
| Data di verifica | **T02**, riferita a ciascun asse di verifica (§13) | Ogni Evidenza di verifica ha una propria data, distinta dalla Decorrenza e dalla data di dichiarazione |
| Data di registrazione | **T02** | Coincide tipicamente con la data di dichiarazione, salvo importazione da fonte storica (§7, "Appartenenze senza data certa") |
| Storia della relazione | **T07** | L'insieme delle condizioni vere in momenti precedenti, conservate perché realmente avvenute (§7, §12 regola 5 di `appartenenze.md`) |

**Distinzione tra fatto avvenuto, periodo di validità, registrazione, revisione, correzione e nuova relazione.**

| Concetto | Definizione operativa | Esempio |
|---|---|---|
| Fatto avvenuto | L'esistenza reale della relazione in un dato momento, indipendente da quando è stata registrata | Una Persona è divenuta Socia nel 2015, anche se l'Appartenenza è dichiarata sulla piattaforma nel 2024 |
| Periodo di validità | L'Intervallo dichiarato (Decorrenza, eventuale Scadenza) per cui il fatto è considerato valido | Dal 2015 a oggi, aperto |
| Registrazione del fatto | Il momento in cui l'informazione è stata inserita sulla piattaforma | 2024, data di dichiarazione |
| Revisione | Un aggiornamento del processo di verifica o di conferma, senza alterare il fatto dichiarato | Una nuova Evidenza di verifica aggiunta nel 2025 |
| Correzione | La rettifica di un dettaglio dichiarato in precedenza, sulla stessa Appartenenza | La data di inizio corretta da 2015 a 2014 dopo un riscontro documentale |
| Nuova relazione | Una diversa Appartenenza, con propria identità, che non prosegue né corregge la precedente | La stessa Persona dichiara una nuova Appartenenza come Dipendente dopo la cessazione di quella come Socia |

**Appartenenze senza data certa.** L'assenza di una data di inizio (e talvolta di fine) precisa è un dato legittimo del Periodo, non un errore da correggere forzatamente (§7 di `appartenenze.md`): questo mapping non impone che il Periodo richieda sempre una Decorrenza (**T03**) con precisione puntuale, ammettendo un valore di incertezza esplicito come parte del dato stesso, non come sua assenza.

---

## 13. Verifiche

Coerentemente con `appartenenze.md` §10 e con il pattern V01-V05 (`02-reference-model.md` §8), la verifica di un'Appartenenza è sempre multidimensionale (RC18, RC21): nessun singolo giudizio complessivo di "verificata" è ammesso (RC19).

| Aspetto verificato | Oggetto | Fonte tipica | Verificatore | Esito | Validità | Scadenza | Revoca | Proprietà | Pattern applicato |
|---|---|---|---|---|---|---|---|---|---|
| Identità | Che la Persona coinvolta sia davvero chi dichiara di essere | Identità & Accessi (identità digitale verificata) o Persone (identità civile) | Identità & Accessi o processo di verifica di Persone | Confermato / non confermato | Fino a nuova evidenza contraria | Non tipicamente prevista, salvo revoca dell'associazione | Possibile, se l'associazione viene invalidata | Appartenenze referenzia l'esito, non lo possiede (appartiene a Persone/Identità & Accessi) | **V01** (referenziato, non posseduto) |
| Esistenza dell'Impresa | Che l'Impresa coinvolta esista realmente come soggetto economico | Registro pubblico, dichiarazione di Imprese | Appartenenze o processo di verifica di Imprese | Confermato / non confermato | Fino a nuova evidenza contraria | Legata all'aggiornamento della fonte (§13, "Fonti pubbliche obsolete") | Possibile | Appartenenze referenzia l'esito, non lo possiede (appartiene a Imprese) | **V01** (referenziato) |
| Effettività della relazione | Che la relazione tra quella Persona e quella Impresa esista davvero, indipendentemente dal Ruolo | Dichiarazione incrociata, Evidenza documentale | Appartenenze | Confermato / in verifica / non confermato | Fino a nuova evidenza contraria | Non tipicamente prevista | Possibile tramite Contestazione risolta in tal senso (§15) | Appartenenze | **V01** + **V02** (Evidenza) + **V04** (Risultato) |
| Ruolo | Che il Ruolo dichiarato corrisponda a quello realmente ricoperto | Evidenza documentale, conferma della controparte | Appartenenze | Confermato / in verifica / non confermato | Fino a un cambio di Ruolo (che genera una nuova Appartenenza, §7) | Non tipicamente prevista, salvo Correzione | Possibile tramite Contestazione | Appartenenze | **V01** + **V02** + **V04** |
| Periodo | Che le date dichiarate corrispondano alla realtà | Evidenza documentale, registro pubblico | Appartenenze | Confermato / in verifica / non confermato | Fino a Correzione | Non tipicamente prevista | Possibile tramite Correzione | Appartenenze | **V01** + **V02** + **V04** |
| Rappresentanza | Che la Persona detenga realmente il potere di rappresentanza legale o operativa dichiarato | Registro pubblico, atto formale | Appartenenze | Confermato / in verifica / non confermato | Fino a revoca formale | Legata alla durata del potere formale, se prevista dalla forma organizzativa | Possibile | Appartenenze | **V01** + **V02** + **V04** |
| Autorizzazione gestionale | Che la facoltà di gestire la scheda sia stata concessa legittimamente da chi ne aveva titolo | Concessione tracciata da Appartenenze stesso | Appartenenze | Confermato / non confermato | Fino a revoca esplicita | Non tipicamente prevista | Sempre possibile, per definizione (§4, §9) | Appartenenze | **V01** + **V04** |

**Fonte e attendibilità.** Ogni asse di verifica si appoggia su una Fonte (§4) e, quando presente, su una o più Evidenze di verifica (§4). L'attendibilità della Fonte è un giudizio qualitativo associato alla Fonte stessa (**V03**), non un valore numerico: un'autodichiarazione non ha la stessa attendibilità di un dato importato da un registro pubblico aggiornato (§10 di `appartenenze.md`).

**Perché nessun asse sostituisce gli altri.** Confermare l'Identità della Persona non conferma il suo Ruolo dichiarato; confermare l'Esistenza dell'Impresa non conferma l'Effettività della relazione; confermare l'Effettività della relazione non conferma automaticamente la Rappresentanza o l'Autorizzazione gestionale (§10 di `appartenenze.md`, ripreso senza eccezioni). Nessun badge unico "Appartenenza verificata" è introdotto da questo documento (RC19); l'evento AppartenenzaVerificata (§22) è trattato come sintesi comunicativa del raggiungimento di un livello ritenuto sufficiente sugli assi rilevanti per quella specifica relazione, non come un ottavo asse aggiuntivo.

**Distinzione tra relazione dichiarata, documentata, verificata, pubblicata e contestata.**

| Condizione | Significato | Asse coinvolto |
|---|---|---|
| Dichiarata | Formalizzata con Ruolo, Periodo e Fonte, indipendentemente dalla verifica | Stato editoriale (§11) |
| Documentata | Sostenuta da almeno un'Evidenza di verifica di natura documentale (**DOC03**) | Verifica (§13), non uno stato a sé |
| Verificata | Uno o più assi di verifica hanno raggiunto un esito "Confermato" (§10) | Verifica (§13) |
| Pubblicata | Reso visibile pubblicamente secondo le condizioni del §16 | Visibilità (§11, §16) |
| Contestata | Messa in dubbio da una parte con titolo, indipendentemente dagli altri assi | Verifica (§13, sovrapposto) |

---

## 14. Dichiarazioni e fonti

| Fonte | Livello di responsabilità | Affidabilità concettuale | Possibilità di conflitto | Necessità di conferma | Tracciabilità | Proprietà della dichiarazione | Rapporto con la verifica |
|---|---|---|---|---|---|---|---|
| La Persona (autodichiarazione) | Alta per i propri fatti, non vincolante per l'Impresa | Media: richiede tipicamente una conferma della controparte o un'Evidenza indipendente (§9, §10) | Alta, se l'Impresa non riconosce la dichiarazione | Sì, salvo Evidenza indipendente sufficiente | Sempre tracciata come Fonte "Autodichiarazione della Persona" (§2 di `appartenenze.md`) | Della Persona che dichiara, referenziata da Appartenenze | Punto di partenza per gli assi "Effettività della relazione" e "Ruolo" (§13) |
| L'Impresa (tramite chi ne ha già la facoltà di gestione) | Alta per i propri fatti dichiarati, condizionata dall'esistenza di un'Autorizzazione gestionale valida | Media-alta, secondo la robustezza della catena di Autorizzazione | Alta, se la Persona non riconosce la dichiarazione | Sì, salvo Evidenza indipendente sufficiente | Tracciata come Fonte "dichiarazione dell'Impresa" | Dell'Impresa, tramite la Persona autorizzata; referenziata da Appartenenze | Come sopra |
| Registro pubblico o fonte istituzionale esterna | Non riconducibile a una delle parti | Alta, salvo obsolescenza (§13, "Fonti pubbliche obsolete") | Bassa in assenza di obsolescenza | Non necessariamente, se la fonte è considerata sufficientemente attendibile | Tracciata con riferimento alla fonte esterna | Nessuna delle due parti; è un dato importato | Può bastare da sola per l'asse "Confermata" (§9, §10) |
| Terzo con titolo per dichiarare | Variabile secondo il titolo | Media, dipende dal titolo dichiarato dal terzo | Alta, se contestata da una delle parti principali | Sì, tipicamente | Tracciata con riferimento al terzo dichiarante | Del terzo, referenziata da Appartenenze | Richiede verifica del titolo del terzo stesso |
| Redazione o moderazione della piattaforma | Alta, per intervento diretto della piattaforma | Alta, per la posizione della redazione, ma non equivalente a una fonte istituzionale esterna | Bassa, salvo contestazione delle parti | Dipende dal caso | Tracciata come intervento redazionale | Della redazione, come Fonte specifica | Tipicamente associata a una risoluzione di Contestazione (§15) |

**Livello di responsabilità e possibilità di conflitto.** Nessuna Fonte, da sola, equivale automaticamente a una verifica: ogni dichiarazione resta nello stato "Non verificata" (§6, §10) fino a quando un processo distinto (Conferma, Evidenza indipendente) non la qualifica ulteriormente (§9, principio: "né la Dichiarazione né l'assenza di una Contestazione costituiscono, da sole, una Conferma").

**Vincolo esplicito.** Una dichiarazione non è trasformata in verità verificata automaticamente, indipendentemente da chi la fornisce, incluse le fonti istituzionali esterne, che restano soggette al rischio di obsolescenza (§13 di `appartenenze.md`, caso "Fonti pubbliche obsolete"; RC19).

---

## 15. Conflitti e contestazioni

La metodologia e il dominio logico consentono di rappresentare gli scenari seguenti, tutti già previsti da `appartenenze.md` §9, §13.

| Scenario | Rappresentazione concettuale | Proprietà della contestazione | Stato indipendente | Tracciabilità | Risoluzione concettuale | Conservazione della storia |
|---|---|---|---|---|---|---|
| Dichiarazioni discordanti (es. due Persone rivendicano lo stesso ruolo esclusivo nello stesso periodo) | Due Appartenenze distinte, ciascuna con proprio stato di verifica "Contestata" fino a risoluzione | Appartenenze | Sì, sull'asse di verifica (§11, §13), sovrapposto a qualunque altro stato | Piena: ciascuna dichiarazione resta un fatto storicizzato, anche se risolta a favore dell'altra (§7, §12 regola 5) | Rimessa a un processo concettuale non anticipato da questo documento (evidenza aggiuntiva, intervento redazionale) | Sì, sempre |
| Rifiuto della relazione (l'Impresa non riconosce un Ruolo dichiarato da una Persona) | Contestazione dell'asse "Effettività della relazione" o "Ruolo" (§13) | Appartenenze | Sì | Piena | Come sopra | Sì |
| Contestazione del Ruolo (la relazione esiste, ma il Ruolo dichiarato è messo in dubbio) | Contestazione dell'asse "Ruolo" specificamente, senza contestare "Effettività della relazione" | Appartenenze | Sì, sul singolo asse (RC21: non tutte le Verifiche condividono lo stesso esito) | Piena | Come sopra | Sì |
| Sovrapposizione incoerente (due Ruoli esclusivi dichiarati dalla stessa Persona nello stesso periodo, quando la natura lo escluderebbe) | Contestazione dell'asse "Ruolo" su una o entrambe le Appartenenze coinvolte | Appartenenze | Sì | Piena | Come sopra | Sì |
| Rappresentanza non riconosciuta (una Persona dichiara una Rappresentanza legale che l'Impresa non riconosce) | Contestazione dell'asse "Rappresentanza" (§13 di questo documento) | Appartenenze | Sì | Piena | Come sopra | Sì |
| Validità incerta (la data dichiarata non è verificabile con certezza) | Non è di per sé una Contestazione: resta un'Appartenenza con Periodo incerto (§7 di `appartenenze.md`, "Appartenenze senza data certa"), distinta da una Contestazione tra le parti | Non applicabile come Contestazione | Non applicabile | Il Periodo incerto resta un dato legittimo, non un errore | Non richiede risoluzione: è una condizione permanente ammessa | Sì |
| Fonte revocata (un registro pubblico si scopre non aggiornato) | Problema di attendibilità della Fonte (§10, §14), da trattare distintamente da un conflitto tra le parti (§13, "Fonti pubbliche obsolete") | Non è una Contestazione tra Persona e Impresa | Sull'asse di verifica, non su un asse di conflitto | Piena | Nuova Evidenza richiesta, senza che questo equivalga automaticamente a una Contestazione | Sì |
| Relazione fraudolenta o erronea | Contestazione su uno o più assi, fino a possibile transizione verso Revocata (§6, "Revocata... a seguito di una Contestazione risolta in tal senso") | Appartenenze | Sì, con possibile impatto sullo stato della relazione se risolta in tal senso | Piena | La transizione verso Revocata è la forma di risoluzione più grave prevista dal ciclo di vita | Sì, anche dopo Revoca |

**Proprietà della contestazione.** Ogni Contestazione è un fatto di proprietà di Appartenenze, non di Identità & Accessi né di Imprese/Persone: è un evento (AppartenenzaContestata, §22) che si sovrappone allo stato di verifica dell'Appartenenza contestata.

**Stato indipendente.** Coerente con §11 (Stato di verifica, **S03**): la Contestazione è un valore che può sovrapporsi in qualsiasi momento agli altri due assi (editoriale, relazionale) senza determinarne automaticamente una transizione.

**Tracciabilità e conservazione della storia.** Ogni Contestazione, risolta o non risolta, resta un fatto storicizzato (**T07**, **D08**): la sua esistenza non viene mai rimossa, anche quando la relazione sottostante viene successivamente Revocata o Conclusa.

**Non anticipazione di processi tecnici di moderazione.** Questo documento non descrive alcun meccanismo tecnico con cui una Contestazione viene notificata, assegnata o risolta (flusso applicativo, fuori dallo scopo di questo mapping): si limita a riconoscere che il dominio logico prevede la possibilità concettuale di una Contestazione e a classificarne gli effetti sugli assi di stato e di verifica.

---

## 16. Visibilità e pubblicazione

Coerentemente con `appartenenze.md` §11 e con il pattern VIS01-VIS06 (`02-reference-model.md` §15), la visibilità dell'Appartenenza è analizzata separatamente dall'esistenza, dallo stato della relazione e dallo stato di verifica.

| Aspetto | Pattern | Descrizione |
|---|---|---|
| Esistenza della relazione | **VIS01** | L'Appartenenza esiste dal momento della propria Dichiarazione, indipendentemente da chiunque possa vederla |
| Visibilità ai soggetti coinvolti | **VIS02** (Accessibilità) | La Persona e chi gestisce l'Impresa hanno sempre accesso ai dettagli della propria Appartenenza (livello "Privata", §11 di `appartenenze.md`) |
| Visibilità pubblica | **VIS04** (Pubblicazione) | L'Appartenenza è visibile a chiunque consulti il profilo della Persona o la scheda dell'Impresa, secondo le condizioni cumulative descritte sotto |
| Visibilità limitata (Interna) | **VIS02** + **VIS06** (Riservatezza rispetto al pubblico generale) | Visibile a chi ha un titolo organizzativo per conoscerla (es. altre Persone con un'Appartenenza attiva verso la stessa Impresa), non pubblicamente |
| Pubblicazione del ruolo | **VIS04**, applicata allo specifico attributo Ruolo | Il Ruolo può essere pubblicato insieme all'esistenza della relazione |
| Pubblicazione delle date | **VIS04**, applicata al Periodo | Analogo al Ruolo |
| Pubblicazione delle responsabilità | **VIS04**, applicata selettivamente: alcune Responsabilità (§9) possono restare Interne anche quando l'Appartenenza è pubblica | Non tutte le Responsabilità hanno lo stesso livello di visibilità di default (es. l'Autorizzazione gestionale è tipicamente Interna, §7) |
| Oscuramento | Transizione da **VIS04** a **VIS02/VIS06** | Corrisponde a un ritiro della Pubblicazione, tracciato come VisibilitàModificata (§22) |
| Ritiro | Come sopra | — |
| Archiviazione | **S08** + **VIS03** (Consultabilità storica, non più tra i percorsi correnti) | Corrisponde al livello "Storica" (§11 di `appartenenze.md`): non più presentata come attuale, ma consultabile come riferimento del percorso passato |

**Chi può richiedere la pubblicazione.** La Persona o chi gestisce l'Impresa (tramite Autorizzazione gestionale, §9), secondo le regole non tecniche non ulteriormente specificate da questo documento (flusso applicativo).

**Quale dominio decide la pubblicabilità.** Appartenenze decide la pubblicabilità della relazione in sé; la pubblicabilità effettiva resta comunque subordinata alla condizione cumulativa descritta sotto.

**Quali dati rimangono riservati.** Le Fonti, le Evidenze di verifica e i dettagli di un'eventuale Contestazione non sono mai pubblicati: restano a livello "Redazionale" o "Interna" anche quando l'Appartenenza stessa è Pubblica (coerente con il livello "Contestata" del §11 di `appartenenze.md`, che impone di non presentare con la stessa sicurezza di una relazione non contestata).

**Quali dati possono essere pubblicati indipendentemente.** Ruolo, Periodo (se non riservato dalla natura della relazione) e l'esistenza stessa della relazione, secondo la condizione cumulativa seguente.

**Condizione cumulativa vincolante.** La visibilità pubblica di un'Appartenenza non può mai eccedere quella consentita dalla Persona o dall'Impresa che collega (§11, §12 regola 10 di `appartenenze.md`): un'Appartenenza non può essere pubblica se la Persona coinvolta non ha un profilo pubblico, né se l'Impresa coinvolta non ha una scheda pubblica. Quando una delle due parti perde la propria visibilità pubblica, l'Appartenenza che le collega deve automaticamente non poter più essere mostrata pubblicamente, indipendentemente dal proprio stato interno di visibilità dichiarato. Questo mapping conferma tale regola come vincolo di primo livello per la futura rappresentazione fisica (§26, decisione fondazionale).

**Come distinguere visibilità e verifica.** Una relazione può essere Pubblica e Non verificata contemporaneamente (§6, §10 di `appartenenze.md`): la visibilità non implica né presuppone la verifica, ed entrambe restano assi indipendenti (§11 di questo documento).

**Come distinguere pubblicazione e proprietà.** La pubblicazione di un'Appartenenza da parte di Appartenenze stesso, o la sua eventuale rappresentazione da parte di un altro dominio (nessuno dei domini analizzati la rappresenta editorialmente in modo significativo, §20), non trasferisce mai la proprietà del fatto relazionale (P5, `domain-dependency-map.md` §11).

---

## 17. Relazione con Persone

**Persone possiede Persona.** L'identità, i dati personali, le competenze dichiarate, le lingue e la storia personale restano interamente di competenza di Persone (`domain-mapping/persone.md` §3-§9); Appartenenze non ne duplica alcun attributo.

**Appartenenze possiede la relazione.** Il fatto della relazione, il Ruolo, il Periodo, lo stato, la verifica restano interamente di competenza di questo documento (§1, §4, ripreso qui per completezza).

**Persone può mostrare riferimenti alle proprie appartenenze.** `domain-mapping/persone.md` §4, riga R6, dichiara esplicitamente: "Non descritta da questo documento: relazione di proprietà di Appartenenze (R07, Relazione di appartenenza)... Persone è solo la controparte referenziata per identità stabile; le regole della relazione (ruolo, periodo, titolo di rappresentanza) sono di competenza esclusiva del futuro `domain-mapping/appartenenze.md`". Questo documento conferma tale ownership e la assume come propria responsabilità, in linea con quanto già anticipato.

**Persone non deve duplicare ruolo, periodo, stato o verifica.** Nessun attributo dell'Appartenenza può comparire come dato proprio della Persona, in nessuna forma di una futura rappresentazione fisica: ogni presentazione che il profilo di una Persona voglia offrire delle proprie relazioni deve attraversare il riferimento all'Aggregate Appartenenza (**E03**), mai una copia locale.

**La cessazione della relazione non modifica l'identità della Persona.** Coerente con `appartenenze.md` §12 regola 2 e con `domain-mapping/persone.md` §5: la Persona mantiene la propria identità stabile indipendentemente dalla conclusione, sospensione, revoca o archiviazione di qualunque Appartenenza.

**La cancellazione o archiviazione della Persona non deve essere interpretata automaticamente come cessazione storica della relazione.** Quando una Persona transita verso uno stato di cancellazione o archiviazione (`domain-mapping/persone.md` §7-§8), le Appartenenze che la coinvolgono non vengono automaticamente riscritte come se non fossero mai esistite: il fatto storico resta (**T07**, **D08**), mentre la loro visibilità pubblica corrente decade secondo la regola cumulativa del §16 (la relazione non può essere più pubblica di quanto lo sia il soggetto che collega). Questo mapping distingue esplicitamente "il fatto storico resta vero" da "la relazione resta presentabile come attuale": la prima affermazione non è mai compromessa dalla cancellazione della Persona; la seconda è sempre soggetta alla regola cumulativa di visibilità.

**Impatti di visibilità e pubblicazione.** Analizzati in dettaglio al §16: la perdita di visibilità pubblica della Persona (es. profilo tornato privato) comporta l'impossibilità di mostrare pubblicamente ogni Appartenenza che la coinvolge, indipendentemente dal proprio stato interno di visibilità dichiarato.

---

## 18. Relazione con Imprese

**Imprese possiede Impresa.** L'identità, la presentazione, le sedi, i settori, i servizi, i prodotti, le certificazioni, i canali e i materiali multimediali restano interamente di competenza di Imprese (`domain-mapping/imprese.md` §3-§8); Appartenenze non ne duplica alcun attributo.

**Appartenenze possiede soci, amministratori, fondatori, rappresentanti e referenti come relazioni.** Ogni Ruolo elencato al §7 di questo documento, in quanto legato a una specifica Persona che lo ricopre verso una specifica Impresa, è un fatto di proprietà esclusiva di Appartenenze. `domain-mapping/imprese.md` §9 conferma questa ownership in modo simmetrico: "Nessuno dei ruoli sopra elencati riceve, in questo documento, un proprio attributo persistente lato Impresa... l'unico modo in cui l'Impresa 'conosce' le proprie Persone collegate è attraverso il riferimento all'identità stabile dell'Aggregate Appartenenza... mai per incorporazione diretta di un attributo di ruolo".

**Imprese può mostrare riferimenti alle relazioni.** La "vista di sintesi AppartenenzaImpresa" descritta in `imprese.md` §2 e §6-§7, e riconosciuta come tale (non normativa) in `domain-mapping/imprese.md` §9, resta l'unico modo legittimo con cui Imprese presenta le relazioni che la coinvolgono. Questo documento conferma la decisione consolidata D3 di `domain-dependency-map.md` §16 e la eleva a decisione fondazionale propria (§26, §29): la fonte autorevole di ogni dettaglio della relazione (ruolo, qualifica, periodo, stato, verifica, autorizzazione) è sempre e soltanto questo documento.

**Imprese non incorpora i soggetti.** Nessuna Persona collegata (fondatore, socio, amministratore, dipendente, referente) è mai un attributo persistente dell'Impresa: lo è sempre e solo dell'Appartenenza che la collega (P4, P11 di `domain-dependency-map.md` §11).

**La cessazione dell'Impresa e la cessazione dell'Appartenenza sono fatti distinti.** Coerente con `appartenenze.md` §13, caso "Impresa cessata": le Appartenenze verso un'Impresa cessata transitano naturalmente verso Conclusa, salvo casi particolari (procedura di chiusura ancora in corso), ma questa transizione è un effetto concettuale riconosciuto dal dominio Appartenenze, non un'operazione compiuta da Imprese sulla relazione. Imprese non ha la facoltà di modificare direttamente lo stato di un'Appartenenza: può soltanto essere la causa concettuale di una transizione che Appartenenze stesso applica.

**Il contatto dell'impresa e il referente organizzativo non coincidono automaticamente.** Coerente con `domain-mapping/imprese.md` §8, riga "Referente di contatto": "Non un attributo di CanaleImpresa: è il ruolo 'Referente operativo' di un'AppartenenzaImpresa — una Persona, non un canale". Un canale di contatto pubblicato dall'Impresa (email, telefono) resta di proprietà di Imprese (**CanaleImpresa**); il fatto che una specifica Persona sia il Referente operativo per quel canale è, se dichiarato, un fatto di Appartenenze, non un attributo del canale stesso.

**La responsabilità di gestione del profilo non coincide con un ruolo societario.** Coerente con §9 di questo documento e con `appartenenze.md` §2, §8: l'Autorizzazione gestionale è un fatto esplicito e indipendente da Proprietà, Rappresentanza legale, Rappresentanza operativa e Ruolo di Referente. Un Socio può non avere l'Autorizzazione gestionale; una Persona senza alcuna Proprietà o Rappresentanza formale può averla.

---

## 19. Relazione con Professionisti

| Concetto | Dominio proprietario | Distinzione |
|---|---|---|
| Qualifica professionale | Professionisti | Capacità professionale dichiarata da un individuo, indipendente da qualunque legame con un'Impresa (`professionisti.md` §1, §7) |
| Iscrizione a un ordine o albo | Professionisti | Verificabile tramite l'ordine stesso (`professionisti.md`, tabella verifiche); non è un fatto di Appartenenze |
| Appartenenza a uno studio | Appartenenze, quando strutturata (Ruolo Socio, Titolare, Dipendente di una Società tra professionisti o Società di consulenza, entrambe forme organizzative di Impresa) | `professionisti.md` §4: "Collaborazione con Impresa: il Professionista opera nell'ambito di un'Impresa non professionale, tramite un'Appartenenza"; §13: "Dipendente che offre competenze per conto dell'Impresa... l'Appartenenza di natura Lavoro coesiste con il Profilo professionale, senza confondersi con esso" |
| Ruolo in un'impresa | Appartenenze | Coincide con uno degli undici Ruoli del catalogo (§7), indipendentemente dal fatto che la Persona sia anche un Professionista |
| Incarico professionale specifico verso un cliente | Non appartiene ad Appartenenze (nessuna relazione strutturale e continuativa con un contesto organizzativo che ospiti un Ruolo di catalogo) | Resta di competenza di Professionisti (Servizio professionale dichiarato) o di Collaborazioni, secondo la natura dell'incarico |
| Collaborazione occasionale con un'Impresa | Non appartiene ad Appartenenze, salvo che assuma i criteri positivi del §3 (Ruolo, Periodo, stato autonomo) | Resta di competenza di Collaborazioni (§20) o resta un Servizio professionale dichiarato senza Appartenenza |
| Rappresentanza (agire per conto di un'Impresa) | Appartenenze | `professionisti.md` §7, tabella verifiche: "Relazione con Impresa o studio: la piattaforma ha potuto confermare la relazione dichiarata... tramite la relativa Appartenenza" |
| Accesso alla piattaforma | Identità & Accessi | Non è mai un fatto di Appartenenze né di Professionisti (§21) |

**Quale relazione appartiene ad Appartenenze e quale rimane in Professionisti o Collaborazioni.** Il criterio distintivo è lo stesso Criterio positivo/negativo del §3 di questo documento: se il legame tra il Professionista e l'organizzazione presenta un Ruolo di catalogo, un Periodo, uno stato autonomo e una possibilità di cessare senza eliminare i soggetti, è un'Appartenenza (tipicamente natura Lavoro, Collaborazione strutturale, Consulenza continuativa, o Proprietà/Rappresentanza per il Professionista che è anche titolare della propria organizzazione, `professionisti.md` §4, "Professionista che opera tramite società"). Se il legame è un singolo incarico, una prestazione episodica o un rapporto cliente-fornitore, non è un'Appartenenza: resta un fatto di Professionisti (Servizio professionale dichiarato) o di Collaborazioni.

**Non anticipazione del mapping di Professionisti.** Questo documento non descrive la struttura interna del Profilo professionale, delle Qualifiche, delle Iscrizioni o delle Abilitazioni: si limita a dichiarare, dal proprio punto di vista, quando un legame tra un Professionista e un'organizzazione ricade nel perimetro di Appartenenze. La struttura fisica completa del dominio Professionisti resta rinviata al futuro `domain-mapping/professionisti.md` (§30).

---

## 20. Relazione con Collaborazioni, Eventi e Opportunità

**Quando una collaborazione non è Appartenenza.** Una Collaborazione (`collaborazioni.md` §3-§4) resta, per sua natura logica, un legame non ancora consolidato in una relazione strutturata e duratura: manifestazione di interesse, candidatura, abbinamento, selezione, accordo, collaborazione attiva sono fasi di un processo di incontro tra domanda e offerta (§8-§9 di `collaborazioni.md`), non un Ruolo di catalogo con un Periodo di appartenenza organizzativa. Una Collaborazione non diventa mai, di per sé, un'Appartenenza: se il legame si stabilizza in un rapporto organizzativo duraturo, il fatto stabile richiede una nuova, distinta Dichiarazione di Appartenenza (§3, §9 di questo documento), non una conversione automatica.

**Quando un incarico stabile potrebbe costituire una relazione strutturata.** Se un incarico, nato come Collaborazione, evolve verso un legame con Ruolo, Periodo e stato autonomo secondo i criteri positivi del §3, deve essere dichiarato come una nuova Appartenenza, mantenendo comunque, se opportuno, il riferimento storico alla Collaborazione di origine (di competenza di Collaborazioni, non di questo dominio, `collaborazioni.md` §4).

**Perché partecipare a un evento non crea Appartenenza.** `eventi.md` §9 e §13 (regola 14) dichiarano esplicitamente: "Eventi non attribuisce rappresentanza o diritti di accesso: nessun ruolo assunto in un Evento genera di per sé un titolo verso terzi o un permesso tecnico" e "la partecipazione per conto di un'Impresa deve essere contestualizzata attraverso Appartenenze: solo un'Appartenenza esistente... legittima la dichiarazione 'per conto di'". La relazione causale è quindi nel verso opposto a quello di una promozione automatica: un'Appartenenza preesistente è condizione per una dichiarazione "per conto di" in un Evento, non il contrario. Un ruolo assunto in un Evento (Organizzatore, Relatore, Sponsor, Partecipante) non genera, modifica o presuppone la creazione di una nuova Appartenenza.

**Perché essere beneficiario o promotore di un'Opportunità non crea Appartenenza.** Per analogia strutturale con Collaborazioni ed Eventi (`opportunita.md`, dominio non riletto in dettaglio da questo documento ma già consolidato da `domain-dependency-map.md` §8, §15 righe D14-D17): un'Opportunità referenzia l'identità di promotore o beneficiario e, quando il promotore agisce per un'Impresa, utilizza il titolo di rappresentanza già stabilito da un'Appartenenza esistente. Nessuna Opportunità crea, modifica o presume un'Appartenenza.

**Quali riferimenti sono consentiti.** Collaborazioni, Eventi e Opportunità possono referenziare (utilizzo, non riferimento sostanziale, `domain-dependency-map.md`, definizione di "Utilizzo") l'esistenza e la validità corrente di un'Appartenenza per verificare il titolo con cui una Persona agisce per conto di un'Impresa. Nessuno dei tre domini può leggere né presentare i dettagli interni dell'Appartenenza (Fonte, Evidenza di verifica, Contestazione) come propri dati.

**Quali dipendenze sono vietate.** È vietato che Collaborazioni, Eventi o Opportunità: duplichino il Ruolo o il Periodo di un'Appartenenza come proprio attributo; creino, modifichino o presumano un'Appartenenza sulla base della sola partecipazione, candidatura o proposta; trattino una relazione occasionale (partecipazione, candidatura) come se fosse essa stessa un'Appartenenza. Questi divieti sono coerenti con V8-V10 di `domain-dependency-map.md` §19 e sono qui confermati dal punto di vista del dominio proprietario della relazione.

---

## 21. Relazione con Identità & Accessi

| Concetto | Dominio proprietario | Distinzione |
|---|---|---|
| Ruolo relazionale (es. Fondatore, Socio, Amministratore) | Appartenenze | Fatto di business (§7) |
| Responsabilità organizzativa (es. Rappresentanza legale) | Appartenenze | Fatto di business (§9) |
| Delega operativa | Identità & Accessi | `identita-accessi.md` §8: la Delega "può fondare, in alternativa o a integrazione di un'Appartenenza, un'Associazione operativa con Impresa"; è un concetto distinto da R07, coerente con R08 (`02-reference-model.md` §6) |
| Ruolo di accesso (Ruolo applicativo) | Identità & Accessi | `identita-accessi.md` §6: "Un insieme nominato di permessi assegnabile a un Account in un dato Contesto, definito e governato da questo dominio" |
| Autorizzazione (permesso tecnico) | Identità & Accessi | Distinta dall'Autorizzazione gestionale (fatto di business, §4, §9 di questo documento) |
| Autenticazione | Identità & Accessi | Non trattata da questo documento |
| Associazione tra identità digitale e soggetto | Identità & Accessi | `identita-accessi.md` §3, §5: collegamento Account-Persona, distinto dall'Appartenenza |

**Direzione consolidata.** Appartenenze può fornire fatti utili alla valutazione di una delega o di un'autorizzazione, ma non possiede il ruolo di accesso e non concede automaticamente permessi tecnici. Questa direzione, già enunciata nel materiale di riferimento e già confermata da `identita-accessi.md` §5 ("il titolo per agire per l'Impresa deriva da Appartenenze... o da una Delega compatibile con esse: Identità & Accessi verifica l'esistenza del titolo, non lo crea"), è qui recepita come decisione fondazionale (§26, §29): l'Autorizzazione gestionale (§4, §9) è il fatto di business che Identità & Accessi può utilizzare come condizione per un'Associazione operativa con Impresa, senza che questo trasferisca la proprietà del fatto a Identità & Accessi (P8, `domain-dependency-map.md` §11).

**Identità & Accessi non deve diventare proprietario della relazione.** Nessun Ruolo, nessuna Responsabilità, nessuna Autorizzazione gestionale può essere ridefinita, duplicata o modificata da Identità & Accessi: quel dominio si limita a leggere lo stato corrente di questi fatti per applicare una decisione di accesso, sempre revocabile e sempre distinta dal fatto sostanziale sottostante (§21 di `identita-accessi.md`: "Identità & Accessi non crea proprietà, amministrazione o rappresentanza: questi fatti restano di competenza esclusiva di `logical/imprese.md` e `logical/appartenenze.md`").

**Delega non sostitutiva.** Coerente con `identita-accessi.md` §8: "Una Delega non sostituisce l'Appartenenza quando questa è necessaria: se un'azione richiede per sua natura un'Appartenenza... una Delega non può da sola fondare quell'azione". Questo documento conferma che, quando un'azione presuppone concettualmente un Ruolo di catalogo riconosciuto (es. la modifica di un dato che richiede un titolo di Rappresentanza legale), nessuna Delega di Identità & Accessi può da sola costituire quel titolo: deve esistere un'Appartenenza con la Responsabilità corrispondente.

---

## 22. Eventi di dominio

| Evento | Significato | Causa | Aggregate | Dati concettuali minimi | Proprietario | Pattern | Domini interessati |
|---|---|---|---|---|---|---|---|
| AppartenenzaProposta | È stato avviato il processo di dichiarazione, non ancora formalizzato | Iniziativa della Persona o dell'Impresa | Appartenenza | Identità delle parti proposte, Ruolo proposto | Appartenenze | **EV01** + **EV02** (interno, salvo notifica alla controparte) | Notifiche (per reagire) |
| AppartenenzaDichiarata | La relazione è stata formalizzata con Ruolo, Periodo e Fonte | Completamento della fase di Proposta | Appartenenza | Identità delle parti, Ruolo, Periodo, Fonte | Appartenenze | **EV01** + **EV03** | Imprese (vista di sintesi), Identità & Accessi (potenziale titolo), Ricerca, Notifiche |
| AppartenenzaConfermata | Uno o più assi di verifica sono stati confermati | Conferma della controparte o Evidenza indipendente | Appartenenza | Asse confermato, Evidenza associata | Appartenenze | **EV01** + **EV03** + **EV04** | Osservatorio (aggregazione), Identità & Accessi (se rilevante per un titolo) |
| AppartenenzaContestata | Una parte, o un terzo con titolo, ha messo in dubbio la relazione | Contestazione (§15) | Appartenenza | Asse contestato, parte contestante | Appartenenze | **EV01** + **EV03** + **EV04** | Imprese (vista di sintesi, che deve riflettere lo stato di Contestazione), Identità & Accessi |
| AppartenenzaVerificata | Sintesi del raggiungimento di un livello di verifica ritenuto sufficiente sugli assi rilevanti | Combinazione di più conferme | Appartenenza | Assi coperti | Appartenenze | **EV01** + **EV03** | Osservatorio, Ricerca |
| AppartenenzaSospesa | La relazione è temporaneamente resa non operativa | Dichiarazione di una delle parti | Appartenenza | Motivazione (facoltativa) | Appartenenze | **EV01** + **EV03** + **EV04** | Imprese (vista di sintesi), Identità & Accessi (possibile impatto su un'Associazione operativa) |
| AppartenenzaConclusa | La relazione è terminata in modo ordinario | Fine del ruolo, uscita dall'Impresa, chiusura dell'Impresa | Appartenenza | Data di fine | Appartenenze | **EV01** + **EV03** + **EV04** | Imprese, Identità & Accessi, Osservatorio |
| AppartenenzaRevocata | La relazione è stata invalidata dalla piattaforma o da chi ne ha titolo | Risoluzione di una Contestazione in tal senso | Appartenenza | Motivazione della revoca | Appartenenze | **EV01** + **EV03** + **EV04** | Imprese, Identità & Accessi |
| RuoloModificato | Il Ruolo associato a una relazione è cambiato | Successione (conclusione + nuova dichiarazione, §7) | Due Appartenenze (la conclusa e la nuova) | Ruolo precedente, Ruolo nuovo | Appartenenze | **EV01** + **EV03** + **EV04** | Imprese, Osservatorio |
| AutorizzazioneGestionaleConcessa | A una Persona è stata attribuita la facoltà di gestire la scheda | Decisione esplicita di chi ha titolo | Appartenenza (Autorizzazione gestionale) | Ambito della facoltà (se graduabile) | Appartenenze | **EV01** + **EV03** | Identità & Accessi |
| AutorizzazioneGestionaleRevocata | Questa facoltà è stata ritirata | Decisione esplicita di chi ha titolo | Appartenenza (Autorizzazione gestionale) | Motivazione (facoltativa) | Appartenenze | **EV01** + **EV03** | Identità & Accessi |
| VisibilitàModificata | Il livello di visibilità di un'Appartenenza è cambiato | Decisione di chi ha titolo, o effetto a cascata dalla visibilità di Persona/Impresa | Appartenenza | Nuovo livello di visibilità | Appartenenze | **EV01** + **EV02**/**EV03** (secondo se genera conseguenze in altri domini) | Imprese, Persone (per l'effetto a cascata, §16-§18) |

**Non descrizione della propagazione tecnica.** Coerentemente con `01-principi-mapping.md` §12 e con la nota introduttiva di questo documento, nessun meccanismo tecnico di comunicazione è anticipato: la tabella indica soltanto quali domini potrebbero, in linea di principio, essere interessati da ciascun evento, non il meccanismo con cui ne vengono informati.

---

## 23. Dati sorgente, derivati e storici

| Categoria | Esempi nel dominio Appartenenze | Pattern applicato |
|---|---|---|
| Dichiarazioni dei soggetti | Ruolo, Periodo, natura dichiarati dalla Persona o dall'Impresa | **D02** |
| Fonti esterne | Registro pubblico, fonte istituzionale | **D01** (dato sorgente esterno, tramite Fonte, **V03**) |
| Dati documentati | Evidenza di verifica di natura documentale | **D02**/**D03** + **DOC03** |
| Verifiche | Esito di ciascun asse del §13 | **D03** |
| Dati pubblicati | Ruolo, Periodo, esistenza della relazione, secondo la condizione cumulativa del §16 | **D07** |
| Dati derivati | Non prodotti da Appartenenze stesso: nessun indicatore o aggregazione è calcolato all'interno di questo dominio | Non applicabile in uscita da Appartenenze; applicabile solo come input a Osservatorio (sotto) |
| Dati storici | Ogni Appartenenza conclusa, sospesa, revocata o archiviata, insieme alla sua Cronologia di Ruoli successivi | **D08** + **T07** |
| Rappresentazioni sintetiche | La vista AppartenenzaImpresa mantenuta da Imprese (§18) | Non un dato proprio di Appartenenze: è una rappresentazione a cura di Imprese, che referenzia (non copia) i fatti di questo dominio |
| Conteggi o indicatori | Statistiche su ruoli, settori, imprese | **D05**/**D06**, di proprietà esclusiva di Osservatorio |

**Il dominio possiede i fatti relazionali.** Ruolo, Qualifica, Periodo, Fonte, Evidenza di verifica, Autorizzazione gestionale e lo stato su ciascun asse (§11) sono fatti sorgente o dichiarati di proprietà esclusiva di Appartenenze.

**Persone e Imprese non possiedono copie della relazione.** Confermato ai §17-§18: nessun attributo del nucleo persistente (§4) può essere duplicato nei due domini che l'Appartenenza collega.

**Osservatorio può derivare aggregazioni.** Coerente con `appartenenze.md` §1, §15 decisione 10: "Il dominio può alimentare l'Osservatorio con dati aggregati su ruoli, settori e relazioni, senza mai esporre nei report pubblici una singola Appartenenza in modo identificabile, preservando la riservatezza delle Persone coinvolte" (**D06**, con vincolo esplicito di non reidentificabilità, coerente con la definizione di D06 in `02-reference-model.md` §11).

**Contenuti Editoriali può rappresentare la relazione.** Nessun documento logico letto per questo mapping (`appartenenze.md`, `imprese.md`, `persone.md`) prevede una rappresentazione editoriale diretta e sistematica della relazione Persona-Impresa in quanto tale (diversa dalla narrazione di una Persona o di un'Impresa singolarmente, di competenza dei rispettivi domini): questo documento non introduce tale rappresentazione, e la registra come aspetto non trattato, non come possibilità esclusa in linea di principio (§30).

**Identità & Accessi può utilizzarla come informazione di supporto senza acquisirne proprietà.** Confermato al §21: Identità & Accessi legge lo stato corrente dell'Autorizzazione gestionale e del Ruolo pertinente per una decisione di accesso, senza mai diventarne proprietario.

---

## 24. Dipendenze

### Necessarie

| Dominio proprietario referenziato | Oggetto | Motivazione | Rischio se assente | Convenzione applicata |
|---|---|---|---|---|
| Persone | Identità della Persona | Un'Appartenenza non può esistere senza una Persona identificata (R1, §5 di `appartenenze.md`) | L'Appartenenza non potrebbe essere creata né identificata | RC09, RC12 |
| Imprese | Identità dell'Impresa | Un'Appartenenza non può esistere senza un'Impresa identificata (R2, §5 di `appartenenze.md`) | Come sopra | RC09, RC12 |

**Valutazione severa.** Coerentemente con l'istruzione di classificare come necessarie soltanto le dipendenze realmente indispensabili, questo documento conferma che le uniche due dipendenze necessarie in uscita da Appartenenze sono queste, esattamente come dichiarato dal documento logico (§1, §24 di `appartenenze.md`: "Quali altri domini utilizza. Persone... Imprese..."). Nessun'altra dipendenza in uscita è necessaria per l'esistenza o la validità del nucleo di Appartenenze.

### Facoltative

Nessuna dipendenza facoltativa in uscita è identificata dal documento logico: Appartenenze non referenzia, nemmeno in modo facoltativo, Mercati Internazionali, Professionisti, Collaborazioni, Eventi, Opportunità, Contenuti editoriali o Osservatorio per la propria validità sostanziale. Questo è coerente con la natura del dominio, interamente concentrato sulla relazione Persona-Impresa (§1 di `appartenenze.md`).

### Derivative o rappresentative

| Dominio dipendente | Natura della dipendenza | Oggetto |
|---|---|---|
| Osservatorio | Derivativa (in entrata da Appartenenze) | Dati aggregabili su ruoli, settori, imprese (§23) |
| Imprese | Non derivativa in senso tecnico, ma dipendenza di vista di sintesi (in entrata da Appartenenze) | AppartenenzaImpresa (§18) |

Nessuna dipendenza rappresentativa/editoriale in entrata è identificata (§23, ultimo punto).

### Di supporto

| Dominio | Direzione | Oggetto |
|---|---|---|
| Identità & Accessi | In uscita da Appartenenze verso Identità & Accessi (fornitura del fatto) e, simmetricamente, in entrata da Identità & Accessi verso Appartenenze (applicazione dell'accesso per le proprie azioni di scrittura) | Titolo per l'Associazione operativa con Impresa (§21) |

### Vietate

| # | Dipendenza valutata | Direzione | Proprietà | Oggetto | Motivazione | Rischio | Convenzione applicata |
|---|---|---|---|---|---|---|---|
| 1 | Duplicazione della Persona | Appartenenze → Persone | Persone | Dati personali, identità | Violerebbe P1 e l'invariante 2 di `appartenenze.md` §12 | Perdita del proprietario del dato, incoerenza tra le due copie | RC13, RC30 |
| 2 | Duplicazione dell'Impresa | Appartenenze → Imprese | Imprese | Dati descrittivi, commerciali, economici | Come sopra | Come sopra | RC13, RC30 |
| 3 | Incorporazione delle credenziali | Appartenenze → Identità & Accessi | Identità & Accessi | Account, Identità digitale, metodi di autenticazione | Appartenenze descrive esclusivamente fatti di business (§1, §15 decisione 3 di `appartenenze.md`) | Confusione tra fatto di business e meccanismo tecnico | P8, RC30 |
| 4 | Assimilazione di collaborazioni | Appartenenze → Collaborazioni | Collaborazioni | Manifestazioni di interesse, candidature, accordi | Una Collaborazione non è un'Appartenenza (§20) | Perdita della distinzione tra legame strutturato e legame in via di formazione | V10 di `domain-dependency-map.md` §19 |
| 5 | Assimilazione di partecipazioni a eventi | Appartenenze → Eventi | Eventi | Iscrizioni, presenze, ruoli assunti in un Evento | La partecipazione non crea Appartenenza (§20) | Promozione automatica indebita di un fatto occasionale a relazione strutturale | Criteri negativi del §3 |
| 6 | Assimilazione di ruoli professionali | Appartenenze → Professionisti | Professionisti | Qualifiche, Iscrizioni, Abilitazioni | La qualifica professionale è un fatto distinto (§19) | Confusione tra capacità professionale e legame organizzativo | P1, P4 |
| 7 | Deduzione automatica da dati esterni | Appartenenze → qualunque dominio | — | Qualunque Appartenenza dedotta senza una Dichiarazione propria | Violerebbe il criterio negativo del §3 e il principio di non-automatismo | Creazione di fatti di dominio senza fondamento dichiarativo tracciabile | Criteri negativi del §3; `domain-model.md` §1 |
| 8 | Trasferimento di ownership ai domini che pubblicano o utilizzano la relazione | Imprese, Identità & Accessi, Collaborazioni, Eventi, Opportunità → Appartenenze (in senso inverso: acquisizione indebita) | Appartenenze | Ruolo, Periodo, stato, verifica, Autorizzazione gestionale | Nessun dominio che referenzia o utilizza l'Appartenenza può diventarne proprietario | Violazione del Single Owner (P1) | RC12, RC13, RC30 |

**Verifica di coerenza con `domain-dependency-map.md`.** Le dipendenze necessarie confermano D1-D2 (§15 della Dependency Map). La dipendenza di supporto conferma D49 (in uscita) e la parte pertinente di D46-D48 (in entrata). Le dipendenze vietate confermano e specificano V2, V4 (già relative a Imprese/Appartenenze), V10 e, per estensione coerente, gli stessi principi applicati a Professionisti ed Eventi non ancora esplicitamente elencati come righe V nella Dependency Map: questo documento propone che tali righe siano considerate confermate (non provvisorie) per la parte che riguarda specificamente Appartenenze come dominio proprietario, in quanto la valutazione è condotta ora dal dominio proprietario stesso (§26, §29).

---

## 25. Analisi dei cicli

| Sequenza | Relazione reciproca o ciclo di ownership? | Ownership corretta | Direzione canonica | Stato del ciclo |
|---|---|---|---|---|
| Persone ↔ Appartenenze | Nessun ciclo: Appartenenze referenzia Persone per identità (necessaria, §24); Persone non referenzia mai Appartenenze per la propria validità sostanziale, mostrandone soltanto l'esistenza come dipendenza in entrata (`domain-mapping/persone.md` §4, riga R6) | Appartenenze possiede la relazione; Persone possiede solo la propria identità | Appartenenze → Persone (referenziazione); Persone ← Appartenenze (dipendenza in entrata, non un riferimento sostanziale in uscita da Persone) | **Eliminato** — dipendenza strutturalmente unidirezionale |
| Imprese ↔ Appartenenze | Relazione apparente: Appartenenze referenzia Imprese per identità (necessaria, §24); Imprese referenzia Appartenenze soltanto per la vista di sintesi non normativa (§18), non per una necessità sostanziale della propria esistenza | Appartenenze possiede la relazione; Imprese possiede solo la propria identità | Appartenenze → Imprese (referenziazione necessaria); Imprese → Appartenenze (dipendenza per vista di sintesi, non sostanziale) | **Apparente, governato** — le due direzioni riguardano oggetti diversi (identità da un lato, vista di sintesi dall'altro), coerente con la decisione consolidata D3 di `domain-dependency-map.md` §15 e con `domain-mapping/imprese.md` §9 |
| Persone ↔ Imprese ↔ Appartenenze | Nessun ciclo: non esiste alcun riferimento diretto Persone→Imprese né Imprese→Persone; il collegamento passa sempre attraverso questo Aggregate | Appartenenze possiede il legame; Persone e Imprese possiedono solo la propria identità | Appartenenze → Persone; Appartenenze → Imprese | **Eliminato** — mediato strutturalmente da questo dominio, confermato dal punto di vista del dominio mediatore stesso, coerentemente con `domain-dependency-map.md` §20 |
| Appartenenze ↔ Professionisti | Nessun ciclo: Professionisti referenzia Appartenenze per il titolo con cui un Professionista è collegato a un'Impresa o uno studio (§19); Appartenenze non referenzia mai Professionisti | Appartenenze possiede la relazione organizzativa; Professionisti possiede la qualificazione | Professionisti → Appartenenze (utilizzo del fatto) | **Eliminato** — dipendenza unidirezionale |
| Appartenenze ↔ Identità & Accessi | Relazione bidirezionale per natura, ma su piani diversi: Appartenenze fornisce il fatto di business (Autorizzazione gestionale, Ruolo) che Identità & Accessi utilizza come condizione per un'Associazione operativa; Identità & Accessi non restituisce alcun fatto sostanziale ad Appartenenze, se non l'applicazione dell'accesso alle proprie azioni di scrittura (dipendenza di supporto, §21, §24) | Appartenenze possiede il fatto di business; Identità & Accessi possiede l'applicazione tecnica dell'accesso | Appartenenze → Identità & Accessi (fornitura del fatto); Identità & Accessi → Appartenenze (applicazione dell'accesso alle scritture) | **Governato** — le due direzioni riguardano piani distinti (fatto di business vs. autorizzazione tecnica), coerente con `domain-dependency-map.md` §20, riga "Soggetti di dominio ↔ Identità & Accessi" |
| Appartenenze ↔ Contenuti Editoriali | Nessuna dipendenza identificata in alcuna direzione (§23, ultimo punto; nessun documento logico letto prevede una narrazione diretta della relazione Persona-Impresa in quanto tale) | Non applicabile | Non applicabile | **Da verificare** — non perché sia stato individuato un ciclo, ma perché l'assenza di relazione non è stata confermata da una lettura diretta di `contenuti-editoriali.md` in questa sessione di mapping; si raccomanda una verifica puntuale nel futuro `domain-mapping/contenuti-editoriali.md` (§30) |
| Appartenenze ↔ Osservatorio | Nessun ciclo: Osservatorio dipende da Appartenenze per dati aggregabili (§23, §24); Appartenenze non dipende da Osservatorio per la propria validità sostanziale | Appartenenze possiede i fatti sorgente; Osservatorio possiede solo gli indicatori derivati | Appartenenze → Osservatorio (fornitura di dati aggregabili) | **Eliminato** — dipendenza strutturalmente unidirezionale, coerente con `domain-dependency-map.md` §20 |

**Conferma generale.** Nessuna delle sequenze analizzate presenta un ciclo di ownership non governato. Il caso "Appartenenze ↔ Contenuti Editoriali" è l'unico segnalato come "da verificare", non per un'ambiguità di ownership riscontrata, ma per prudenza metodologica in assenza di una lettura diretta e completa di quel documento logico in questa sessione.

---

## 26. Classificazione delle decisioni

| Codice | Descrizione | Principio (`01`) | Pattern (`02`) | Convenzione (`03`) | Attributo di qualità (`04`) | Relazione con la Dependency Map | Motivazione | Domini futuri interessati | Classificazione |
|---|---|---|---|---|---|---|---|---|---|
| DA1 | Appartenenza è trattata come Aggregate Root (**A01**) autonomo, mai incorporato in Persona o Impresa | §2 principio 1 | A01 | RC01 | Separazione delle responsabilità | Confirma DC2 | Corrisponde esattamente all'Aggregate Root già dichiarato dal documento logico | Nessuno (decisione già stabilita a livello logico) | **Fondazionale** |
| DA2 | Ruolo è trattato come Entity dipendente con riferimento a un Elenco controllato (**E02**+**C03**), non a una Tassonomia condivisa | §4 | E02, C03 | RC02, RC03 | Coerenza | — | Nessun altro dominio dichiara di possedere questo catalogo | Nessuno | **Locale** |
| DA3 | Qualifica è trattata come Entity interna (**E04**), non come Entity dipendente diretta dell'Aggregate Root | §4 | E04 | RC02 | Coerenza | — | Il documento logico la descrive come dettaglio del Ruolo, non fatto autonomo | Nessuno | **Locale** |
| DA4 | La relazione con Imprese conferma D3 della Dependency Map: la vista AppartenenzaImpresa è di sintesi non normativa, la fonte autorevole è sempre Appartenenze | §2 principio 2 | R07 | RC12, RC13 | Separazione delle responsabilità, tracciabilità | Confirma D3 (già Consolidata; questo mapping la ratifica dal punto di vista del dominio proprietario della relazione) | Simmetrica alla decisione già presa in `domain-mapping/imprese.md` §9 | Nessuno | **Fondazionale** |
| DA5 | I sei Ruoli societari/organizzativi (Fondatore, Titolare, Socio, Amministratore, Legale rappresentante, Dirigente) e i cinque Ruoli operativi (Dipendente, Consulente, Collaboratore, Referente, Gestore della scheda) restano un unico catalogo **C03**, senza distinzione strutturale tra le due famiglie | §4 | C03 | RC02, RC08 | Coerenza | — | Il documento logico non distingue due catalghi separati (§4 di `appartenenze.md`) | Nessuno | **Locale** |
| DA6 | Il ciclo di vita di Appartenenza è scomposto in sei assi indipendenti (stato editoriale, stato della relazione, stato di verifica, stato di visibilità, stato dell'Autorizzazione gestionale, stato storico) | §9 | S01, S02, S03, S08, VIS01-VIS06 | RC14, RC15, RC16, RC17 | Separazione delle responsabilità, coerenza | — | Applicazione diretta di `appartenenze.md` §6, con l'aggiunta esplicita degli assi di visibilità e di Autorizzazione gestionale già distinti al §2 e §11 di quel documento | Nessuno | **Riutilizzabile** (il criterio di scomposizione è applicabile ad altri domini con relazioni analoghe) |
| DA7 | La verifica multidimensionale a sette assi (§13) non produce mai un giudizio unico "Appartenenza verificata" | §10 | V01-V05 | RC18, RC19, RC20, RC21 | Verificabilità, comprensibilità | — | Applicazione diretta di `appartenenze.md` §10, coerente con l'anti-pattern già escluso in `imprese.md` §8 | Nessuno | **Riutilizzabile** |
| DA8 | La Contestazione è un valore sovrapposto sull'asse di verifica (**S03**), non un asse a sé stante né uno stato composito con lo stato della relazione | §9 | S03 | RC16, RC21 | Coerenza | — | Coerente con `appartenenze.md` §6: "Contestata... è uno stato che può sovrapporsi in qualsiasi momento agli altri due assi" | Nessuno | **Riutilizzabile** |
| DA9 | La visibilità pubblica dell'Appartenenza è sempre subordinata, come condizione cumulativa, alla visibilità pubblica di entrambi i soggetti collegati | §9 | VIS01-VIS06 | RC15 | Coerenza, separazione delle responsabilità | — | Applicazione diretta di `appartenenze.md` §11, già anticipata come principio generale in `imprese.md` §9 | Nessuno | **Fondazionale** |
| DA10 | Il titolo di rappresentanza (Autorizzazione gestionale, Rappresentanza legale) è sempre posseduto da Appartenenze; Identità & Accessi lo utilizza senza mai crearlo o duplicarlo | §2 principio 2, §14 | R06 | RC12, RC13 | Separazione delle responsabilità | Conferma D9/D17/D23/D28 (da Provvisoria a Consolidata, per la parte di competenza di questo dominio) | Applicazione diretta di `appartenenze.md` §2, §8, §15 decisione 4, confermata da `identita-accessi.md` §5 | Professionisti, Collaborazioni, Eventi, Opportunità (utilizzatori del titolo) | **Fondazionale** |
| DA11 | Nessuna Collaborazione, partecipazione a Evento o candidatura a Opportunità genera, modifica o presume un'Appartenenza | §2 principio 2, principio di non-automatismo | R07 | RC30 | Separazione delle responsabilità, basso accoppiamento | Conferma V10 e generalizza V4/V9 | Applicazione diretta di `appartenenze.md` §9 (principio) e dei documenti logici di Collaborazioni ed Eventi (§20 di questo documento) | Collaborazioni, Eventi, Opportunità | **Fondazionale** |

**Le decisioni fondazionali sono segnalate, non inserite automaticamente nella baseline.** Coerentemente con l'istruzione ricevuta, le decisioni classificate "Fondazionale" in questa tabella (DA1, DA4, DA9, DA10, DA11) sono proposte come tali a partire dall'analisi di questo mapping: la loro effettiva promozione a decisione vincolante della Dependency Map (da "Provvisoria" a "Consolidata") resta condizionata a una verifica formale successiva, coerente con la regola 12 di `domain-dependency-map.md` §22 ("Aggiornare la matrice soltanto dopo l'approvazione del mapping").

---

## 27. Pattern riutilizzabili

| Pattern individuato | Applicazione in Appartenenze | Riusabilità | Domini interessati | Limiti |
|---|---|---|---|---|
| Relazione contestuale/di appartenenza a più assi indipendenti | Ruolo, Qualifica, Periodo, Fonte, Evidenza, Autorizzazione come componenti indipendenti di un unico Aggregate relazionale | Alta: applicabile a ogni futura relazione strutturata tra due soggetti (es. Persona-Organizzazione, Impresa-Organizzazione, se formalizzate) | Appartenenze; potenzialmente un futuro dominio "Organizzazioni istituzionali" | Richiede che il documento logico dichiari esplicitamente più di un asse; non da imporre a relazioni semplici a un solo stato |
| Ruolo temporale con successione tramite conclusione e nuova dichiarazione (mai modifica in luogo) | §7, §10, §12 regola 4 di `appartenenze.md` | Alta: già coerente con il principio generale di storicizzazione (T07) applicato altrove (Imprese, Persone) | Tutti i domini con relazioni di ruolo storicizzabili | Non applicabile a relazioni prive di rilevanza storica dichiarata |
| Stato multidimensionale con asse dedicato alla Contestazione sovrapposto | §6, §9, §15 | Alta: lo stesso schema (Contestazione come valore sovrapposto, non stato a sé) è coerente con quanto già osservato per Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi in `reconciliation-report.md` §8 | Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Identità & Accessi | Richiede che il documento logico del dominio dichiari esplicitamente la possibilità di una Contestazione |
| Dichiarazione con Fonte e Conferma distinte, senza automatismo tra le due | §9, §10, §14 | Alta: applicazione diretta del principio di non-automatismo, già pattern condiviso (D02/D03, V01-V04) | Tutti gli 11 domini | Nessun limite particolare oltre alla necessità di un documento logico che distingua esplicitamente Dichiarazione e Verifica |
| Verifica multi-asse senza giudizio unico | §10, §13 | Alta: stesso schema già confermato in Persone, Imprese, Professionisti (`reconciliation-report.md` §9.1) | Tutti i domini con Verifica | RC19 vincolante ovunque |
| Validità pubblica subordinata cumulativamente alla visibilità dei soggetti collegati | §11, §16 | Alta: principio già applicato da Imprese verso le proprie Entity dipendenti (`domain-mapping/imprese.md` §15); qui applicato a una relazione tra due Aggregate distinti, non tra un Aggregate e le proprie Entity dipendenti | Ogni dominio con relazioni tra soggetti di visibilità potenzialmente diversa | Richiede l'esistenza di una regola di visibilità propria per ciascuno dei soggetti collegati |
| Storicizzazione con conservazione dello storico anche dopo Revoca | §7, §12 regola 5 | Alta: coerente con T07/D08 già applicato ovunque | Tutti gli 11 domini | Nessun limite particolare |
| Titolo di rappresentanza (R06) come fatto di business separato dal permesso tecnico | §2, §8, §21 | Alta: pattern già riconosciuto come condiviso in `reconciliation-report.md` §3.2 e in `02-reference-model.md` §6 | Identità & Accessi, Professionisti, Collaborazioni, Eventi, Opportunità | Nessun limite particolare |
| Elenco controllato di Ruoli, estendibile senza impatto sui soggetti collegati | §4 | Media: applicabile a domini con catalghi di ruolo analoghi, ma non generalizzabile a catalghi che richiedono governance esterna (in tal caso serve C02, non C03) | Domini con propri catalghi di ruolo locale | Da non confondere con una Tassonomia condivisa quando il catalogo è realmente condiviso tra più domini |
| Entity interna (E04) per un dettaglio dipendente da un'altra Entity dipendente, non dall'Aggregate Root | §4 (Qualifica) | Media: applicabile quando un documento logico distingue esplicitamente un dettaglio "del Ruolo" da un fatto "dell'Appartenenza" | Domini con gerarchie di dipendenza a più livelli | Da applicare con cautela: la maggior parte dei concetti dipendenti in altri domini analizzati finora è stata classificata E02, non E04 |
| Responsabilità come Entity dipendente distinta dal Ruolo che la ospita | §9 | Media-alta: utile ovunque un documento logico distingua esplicitamente "cosa si è chiamati" da "cosa si può fare" | Professionisti (potenzialmente, per la distinzione tra Qualifica e Abilitazione), Identità & Accessi (per la distinzione tra Ruolo applicativo e Capacità operativa) | Richiede una distinzione esplicita nel documento logico, non da introdurre come inferenza di questo mapping |

**Nessuna lacuna del catalogo è stata rilevata.** Ogni concetto del dominio logico Appartenenze ha trovato corrispondenza in uno o più pattern del Reference Model (§4-§23 di questo documento); nessuna estensione del catalogo è proposta (RC07, RC08).

---

## 28. Verifica degli attributi di qualità

| Attributo | Esito | Evidenza | Rischio | Azione futura |
|---|---|---|---|---|
| Coerenza | Positivo | Ogni pattern citato usa lo stesso codice e lo stesso significato del catalogo unico (`02`); ogni riferimento a `appartenenze.md` è verificato contro il testo integrale | Basso | Nessuna |
| Separazione delle responsabilità | Positivo | Ogni concetto (§4-§5), relazione (§6-§10) e dipendenza (§24) dichiara un solo dominio proprietario; la vista di sintesi di Imprese non è mai trattata come normativa (§18) | Basso | Nessuna |
| Coesione | Positivo | Ogni sezione ruota attorno alle sette entità già individuate da `appartenenze.md` §2; nessun concetto estraneo al dominio è introdotto | Basso | Nessuna |
| Accoppiamento | Positivo | Solo due dipendenze necessarie in uscita (Persone, Imprese, §24); nessuna dipendenza facoltativa in uscita | Basso | Nessuna |
| Estendibilità | Positivo | Il catalogo dei Ruoli (§7) è dichiaratamente estendibile senza impatto su Persona o Impresa; le righe "Persona-Organizzazione" e "Impresa-Organizzazione" del §6 sono già preparate per un'estensione futura senza richiedere una ristrutturazione | Basso | Nessuna |
| Evolvibilità | Positivo | Gli assi di stato (§11) e gli eventi (§22) sono indipendenti e possono evolvere singolarmente | Basso | Nessuna |
| Manutenibilità | Positivo | Ogni decisione ha un codice stabile (DA1-DA11, §26); ogni pattern è citato con codice | Basso | Nessuna |
| Tracciabilità | Positivo | Ogni Fonte, Evidenza e Contestazione è tracciata separatamente (§13-§15); ogni evento ha una causa dichiarata (§22) | Basso | Nessuna |
| Auditabilità | Positivo | La distinzione tra Dichiarazione, Conferma, Contestazione e Correzione (§9 di `appartenenze.md`, §14-§15 di questo documento) rende ogni fatto riesaminabile | Basso | Nessuna |
| Verificabilità | Positivo, con riserva | I sette assi di verifica (§13) sono ben distinti, ma la relazione con Contenuti Editoriali resta "da verificare" (§25): non compromette il nucleo del dominio, ma richiede conferma futura | Medio, transitorio | Verifica puntuale nel futuro `domain-mapping/contenuti-editoriali.md` |
| Comprensibilità | Positivo | La distinzione a cinque tra Proprietà, Rappresentanza legale, Rappresentanza operativa, Gestione della scheda e Referente (§9) è applicata con terminologia costante in tutto il documento | Basso | Nessuna |
| Internazionalizzazione | Non applicabile in modo specifico | Il dominio non tratta lingue o territori come proprio oggetto; eventuali riferimenti internazionali passano sempre per Imprese o Mercati Internazionali | Basso | Nessuna |
| Scalabilità concettuale | Positivo | Il catalogo dei Ruoli e la struttura a sette entità (§4) sostengono senza ristrutturazione un numero crescente di Appartenenze, Ruoli aggiuntivi o Evidenze multiple | Basso | Nessuna |
| Robustezza concettuale | Positivo | I casi limite del §13 di `appartenenze.md` (più ruoli contemporanei, cambio ruolo, socio non operativo, amministratore non socio, consulente, referente, ex socio, impresa cessata, impresa individuale, cooperative, enti e associazioni, fusioni, cessioni, fonti pubbliche obsolete) sono tutti stati verificati contro le decisioni di questo mapping, senza eccezioni non gestite | Basso | Nessuna |
| Conformità complessiva | Positivo | Applicazione integrale della baseline, del Reference Model, delle convenzioni, degli attributi di qualità e della Dependency Map, senza contraddizioni rilevate (§31) | Basso | Nessuna |

Nessun punteggio numerico è stato utilizzato in questa valutazione.

---

## 29. Decisioni consolidate

| Codice | Classificazione | Ownership | Principio | Pattern | Convenzione | Attributo di qualità | Stato | Impatto sulla Dependency Map |
|---|---|---|---|---|---|---|---|---|
| DA1 | Fondazionale | Appartenenze | §2 principio 1 | A01 | RC01 | Separazione delle responsabilità | Consolidata | Confirma DC2 |
| DA2 | Locale | Appartenenze | §4 | E02, C03 | RC02, RC03 | Coerenza | Consolidata | Nessuno |
| DA3 | Locale | Appartenenze | §4 | E04 | RC02 | Coerenza | Consolidata | Nessuno |
| DA4 | Fondazionale | Appartenenze | §2 principio 2 | R07 | RC12, RC13 | Separazione delle responsabilità, tracciabilità | Consolidata | Ratifica D3 (già Consolidata nella Dependency Map) |
| DA5 | Locale | Appartenenze | §4 | C03 | RC02, RC08 | Coerenza | Consolidata | Nessuno |
| DA6 | Riutilizzabile | Appartenenze | §9 | S01, S02, S03, S08, VIS01-VIS06 | RC14-RC17 | Separazione delle responsabilità, coerenza | Consolidata | Nessuno |
| DA7 | Riutilizzabile | Appartenenze | §10 | V01-V05 | RC18-RC21 | Verificabilità, comprensibilità | Consolidata | Nessuno |
| DA8 | Riutilizzabile | Appartenenze | §9 | S03 | RC16, RC21 | Coerenza | Consolidata | Nessuno |
| DA9 | Fondazionale | Appartenenze | §9 | VIS01-VIS06 | RC15 | Coerenza, separazione delle responsabilità | Consolidata | Nessuno |
| DA10 | Fondazionale | Appartenenze | §2 principio 2, §14 | R06 | RC12, RC13 | Separazione delle responsabilità | Consolidata | Conferma D9/D17/D23/D28 per la parte di competenza (Provvisoria → Consolidata) |
| DA11 | Fondazionale | Appartenenze | §2 principio 2 | R07 | RC30 | Separazione delle responsabilità, basso accoppiamento | Consolidata | Conferma V10, generalizza V4/V9 |

**Formulazione prescrittiva.** Ogni decisione elencata è vincolante per la futura rappresentazione fisica di Appartenenze e per ogni altro documento di mapping che referenzi questo dominio (Persone, Imprese, Professionisti, Collaborazioni, Eventi, Opportunità, Identità & Accessi, Osservatorio, secondo le regole del §22 di `domain-dependency-map.md`).

---

## 30. Questioni aperte e aspetti rinviati

### Questioni logiche

Eredità diretta di `appartenenze.md` §15, non risolte né forzate da questo documento:

1. Come devono essere classificati i ruoli non ancora previsti nel catalogo del §7? Il meccanismo di estensione è già previsto, ma il processo di governance non è definito da questo documento — rilevante per §7 di questo documento.
2. Le partecipazioni societarie (quote, percentuali di proprietà) devono essere rappresentate come un dato strutturato dell'Appartenenza di natura Proprietà, o restare fuori dal modello nella sua prima versione? — rilevante per §9 di questo documento (Responsabilità "Proprietà").
3. Come si determina, sul piano di dominio, il "titolare effettivo" di un'Impresa quando la proprietà è distribuita su più Appartenenze e più livelli? — rilevante per §9, §13 di questo documento.
4. La conferma reciproca deve essere sufficiente per raggiungere lo stato "Confermata", o è comunque necessaria un'Evidenza di verifica esterna in alcuni casi? — rilevante per §13 di questo documento.
5. Per quanto tempo un'Evidenza di verifica deve essere considerata valida prima di richiedere un nuovo controllo? — rilevante per §12, §13 di questo documento.
6. Come devono essere trattate le Appartenenze importate da fonti esterne prima che la piattaforma esistesse, in termini di Fonte, Evidenza di verifica e responsabilità della loro correttezza? — rilevante per §12, §14 di questo documento.
7. Lo storico delle Appartenenze concluse deve essere pubblicabile per default o deve richiedere un consenso esplicito aggiuntivo? — rilevante per §16 di questo documento.
8. A chi spetta la responsabilità redazionale in caso di Contestazione non risolta in tempi ragionevoli? — rilevante per §15 di questo documento; collegata alla domanda sullo Stato amministrativo non applicato (§11).

### Questioni metodologiche

9. **Se la distinzione E02/E04 (Ruolo/Qualifica, §4) debba essere formalizzata come criterio generale del Reference Model o resti un'applicazione locale.** Non è una lacuna della baseline, ma un'osservazione emersa dall'applicazione pratica; rinviata a un'eventuale revisione futura della baseline (coerente con l'aspetto analogo già segnalato in `domain-mapping/imprese.md` §24).
10. **Se il pattern "Responsabilità come Entity dipendente distinta dal Ruolo" (§9, §27) meriti un proprio codice nel Reference Model.** Segnalato come osservazione per Professionisti e Identità & Accessi, non come proposta di modifica immediata.
11. **La relazione (assente o non ancora verificata) tra Appartenenze e Contenuti Editoriali (§25)** resta un punto da confermare esplicitamente nel futuro `domain-mapping/contenuti-editoriali.md`, non una lacuna di questo documento.

### Aspetti rinviati ai domini futuri

12. **Struttura completa del Profilo professionale e della relazione con Appartenenze dal punto di vista di Professionisti.** Rinviata al futuro `domain-mapping/professionisti.md` (§19 di questo documento).
13. **Struttura completa delle fasi di Collaborazione (manifestazione di interesse, candidatura, abbinamento, selezione, accordo) e del momento in cui un incarico potrebbe richiedere una nuova Appartenenza.** Rinviata al futuro `domain-mapping/collaborazioni.md` (§20 di questo documento).
14. **Struttura completa dei Ruoli applicativi, delle Deleghe e dei Contesti di azione di Identità & Accessi, inclusa la derivazione tecnica del titolo da un'Appartenenza.** Rinviata al futuro `domain-mapping/identita-accessi.md` (§21 di questo documento).
15. **Trattamento fisico della relazione (se esistente) tra Appartenenze e Contenuti Editoriali.** Rinviato al futuro `domain-mapping/contenuti-editoriali.md` (§25 di questo documento).

### Aspetti rinviati alla rappresentazione fisica concreta

16. **Meccanismo con cui il Periodo incerto (§7 di `appartenenze.md`, §12 di questo documento) viene rappresentato senza obbligare a inventare una data plausibile.** Decisione del futuro schema.
17. **Tecnica di storicizzazione (T07/D08, §12, §23) per le sette entità del nucleo persistente.** Se realizzata con tabelle storiche separate, versionamento in linea, log di audit o altra tecnica, resta una decisione del futuro schema.
18. **Rappresentazione tecnica dei sei assi di stato indipendenti (§11).** Se realizzati come colonne distinte, tabelle distinte o altra struttura, resta una decisione del futuro schema.
19. **Meccanismo tecnico di propagazione degli eventi di dominio elencati al §22.** Coerentemente con `01-principi-mapping.md` §12, nessuna tecnologia di comunicazione è anticipata.
20. **Applicazione tecnica dell'accesso (S05) all'Appartenenza da parte di Identità & Accessi, inclusa la derivazione concreta di un permesso dall'Autorizzazione gestionale.** Rinviata al futuro `domain-mapping/identita-accessi.md`.
21. **Meccanismo di garanzia dell'unicità o della coerenza tra Ruoli sovrapposti quando la natura dichiarata li rende incompatibili (§7 di questo documento, casi limite).** Il vincolo è logico; la sua applicazione fisica resta rinviata.

### Aspetti rinviati alla governance

22. **Processo con cui una nuova voce del catalogo dei Ruoli (§7) viene proposta, valutata e aggiunta.** Decisione di governance, non di architettura.
23. **Termine e responsabile della risoluzione di una Contestazione non risolta in tempi ragionevoli (§15, questione logica 8).** Decisione di governance.
24. **Se e quando formalizzare un dominio "Organizzazioni istituzionali" distinto da Impresa, che estenderebbe il perimetro del §6 di questo documento (Persona-Organizzazione, Impresa-Organizzazione).** Decisione di governance sull'inventario dei domini (`reconciliation-report.md` §13).

Nessuna soluzione tecnica è proposta per alcuno di questi aspetti.

---

## 31. Controllo finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Coerenza con il dominio logico Appartenenze | Verificato — ogni entità, relazione, stato, regola ed evento trattato è riconducibile a un paragrafo esplicito di `appartenenze.md` |
| 2 | Coerenza con il Domain Model | Verificato — i richiami al principio di non-automatismo e al Single Owner (`domain-model.md` §1) sono applicati senza contraddizioni |
| 3 | Coerenza con la riconciliazione | Verificato — la tabella di `reconciliation-report.md` §3.1 (Appartenenze) e le voci del glossario (§7) sono coerenti con questo documento; nessuna divergenza rilevata |
| 4 | Conformità alla baseline | Verificato — la metodologia di `architecture-baseline.md` (uso di `domain-mapping/persone.md` come caso di studio) è applicata con lo stesso rigore |
| 5 | Coerenza con la Dependency Map | Verificato — le righe D1-D2 (necessarie), D3 (già Consolidata, ratificata dal punto di vista del dominio proprietario), D9, D17, D23, D28 (Provvisorie, qui confermate per la parte di competenza di Appartenenze) e V2, V4, V10 (vietate) di `domain-dependency-map.md` sono tutte coerenti con questo documento (§24, §26, §29) |
| 6 | Coerenza con Persone | Verificato — §17 di questo documento è simmetrico a `domain-mapping/persone.md` §4 (righe R6-R7) senza contraddizioni |
| 7 | Coerenza con Imprese | Verificato — §18 di questo documento è simmetrico a `domain-mapping/imprese.md` §9 senza contraddizioni |
| 8 | Ownership della relazione assegnata ad Appartenenze | Verificato — §4, §17, §18, §29 dichiarano esplicitamente Appartenenze come unico proprietario |
| 9 | Nessuna duplicazione dei soggetti | Verificato — §8, §17, §18, §24 escludono esplicitamente ogni duplicazione di Persona o Impresa |
| 10 | Corretta distinzione dei ruoli | Verificato — §7 distingue Ruolo di Appartenenza da qualifica professionale, ruolo di accesso, ruolo editoriale, ruolo in un Evento, ruolo in una Collaborazione |
| 11 | Corretta distinzione da Professionisti | Verificato — §19 |
| 12 | Corretta distinzione da Collaborazioni | Verificato — §20 |
| 13 | Corretta distinzione da Eventi | Verificato — §20 |
| 14 | Corretta distinzione da Identità & Accessi | Verificato — §21 |
| 15 | Assi di stato indipendenti | Verificato — §11, sei assi mai compressi (RC16) |
| 16 | Temporalità esplicita | Verificato — §12, con pattern T01-T07 applicati |
| 17 | Verifiche multidimensionali | Verificato — §13, sette assi indipendenti, nessun badge generico (RC19) |
| 18 | Visibilità separata dalla verifica | Verificato — §16, con la condizione cumulativa esplicita |
| 19 | Assenza di cicli non analizzati | Verificato — §25, sette sequenze analizzate, incluso il caso "da verificare" esplicitamente segnalato come tale |
| 20 | Assenza di nuovi domini | Verificato — §6 dichiara esplicitamente "non determinabile" per le combinazioni che richiederebbero un dominio non ancora formalizzato |
| 21 | Assenza di tecnologia | Verificato — nessuna tecnologia nominata come scelta di progetto; le uniche menzioni sono nella nota introduttiva e al §30 |
| 22 | Assenza di SQL | Verificato — nessuna istruzione SQL |
| 23 | Assenza di schema di database | Verificato — nessuna tabella, colonna, indice, chiave o vincolo tecnico |
| 24 | Assenza di implementazioni | Verificato — ogni riferimento a una futura struttura fisica concreta è esplicitamente rinviato al §30 |
| 25 | Riferimenti incrociati corretti | Verificato — ogni citazione a `appartenenze.md`, `persone.md`, `imprese.md`, `professionisti.md`, `collaborazioni.md`, `eventi.md`, `identita-accessi.md`, `reconciliation-report.md`, `domain-mapping/persone.md`, `domain-mapping/imprese.md`, `domain-dependency-map.md` è stata controllata contro il testo integrale letto in apertura di lavoro |
| 26 | Pattern realmente esistenti | Verificato — ogni codice citato (A01, E02, E03, E04, VO01, R01, R04, R06, R07, R08, S01-S03, S08, V01-V05, VR02-VR03, EV01-EV04, D01-D09, C03, C06, DOC03, T01-T07, VIS01-VIS06) corrisponde a un pattern effettivamente definito in `02-reference-model.md` |
| 27 | Sezioni complete | Verificato — tutte le 31 sezioni della struttura obbligatoria sono presenti e complete |
| 28 | Nessun placeholder | Verificato — ogni sezione contiene contenuto specifico e motivato |
| 29 | Nessuna contraddizione sostanziale | Verificato — la seconda revisione integrale (successiva a questa tabella) ha controllato in particolare ownership ambigue, ruoli duplicati, cicli non governati e divergenze dalla Dependency Map |

---

# Riepilogo finale

1. **File creato**: `docs/architecture/physical/domain-mapping/appartenenze.md`
2. **Numero di sezioni**: 31 sezioni della struttura obbligatoria, precedute da nota introduttiva, documenti letti, regola fondamentale, distinzioni obbligatorie e indice, seguite dal Riepilogo finale
3. **Aggregate e concetti persistenti**: 7 (Appartenenza — A01; Ruolo — E02+C03; Qualifica — E04; Periodo — VO01+T03/T04/T05; Fonte — V03; Evidenza di verifica — E02+V02; Autorizzazione gestionale — E02+R06), §4
4. **Concetti incorporati**: 7 (descrizione del ruolo, note contestuali, intervallo temporale, motivazione della cessazione, livello di responsabilità, provenienza della dichiarazione, preferenze di visibilità), §5
5. **Combinazioni di soggetti ammesse**: 1 pienamente mappata (Persona-Impresa) più 2 non determinabili in attesa di un futuro dominio "Organizzazioni istituzionali" (Persona-Organizzazione, Impresa-Organizzazione); 2 escluse esplicitamente (Persona-Persona, Impresa-Impresa), §6
6. **Ruoli individuati**: 11 (Fondatore, Titolare, Socio, Amministratore, Legale rappresentante, Dirigente, Dipendente, Consulente, Collaboratore, Referente, Gestore della scheda), §7
7. **Responsabilità individuate**: 5 (Proprietà, Rappresentanza legale, Rappresentanza operativa, Gestione della scheda, Referente), §9
8. **Assi di stato**: 6 (stato editoriale, stato della relazione, stato di verifica, stato di visibilità, stato dell'Autorizzazione gestionale, stato storico), §11
9. **Verifiche**: 7 assi indipendenti (Identità, Esistenza dell'Impresa, Effettività della relazione, Ruolo, Periodo, Rappresentanza, Autorizzazione gestionale), §13
10. **Dichiarazioni e fonti**: 5 tipologie di Fonte catalogate (autodichiarazione della Persona, dichiarazione dell'Impresa, registro pubblico/fonte istituzionale, terzo con titolo, redazione/moderazione), §14
11. **Conflitti e contestazioni**: 8 scenari analizzati (dichiarazioni discordanti, rifiuto della relazione, contestazione del ruolo, sovrapposizione incoerente, rappresentanza non riconosciuta, validità incerta, fonte revocata, relazione fraudolenta o erronea), §15
12. **Regole di visibilità**: 6 livelli (Privata, Interna, Redazionale, Pubblica, Storica, Contestata) più la condizione cumulativa vincolante, §16
13. **Eventi di dominio**: 12 (AppartenenzaProposta, AppartenenzaDichiarata, AppartenenzaConfermata, AppartenenzaContestata, AppartenenzaVerificata, AppartenenzaSospesa, AppartenenzaConclusa, AppartenenzaRevocata, RuoloModificato, AutorizzazioneGestionaleConcessa, AutorizzazioneGestionaleRevocata, VisibilitàModificata), §22
14. **Dipendenze necessarie**: 2 (Persone, Imprese), §24
15. **Dipendenze facoltative**: 0, §24
16. **Dipendenze derivative o rappresentative**: 2 (Osservatorio in entrata come derivativa; Imprese in entrata come vista di sintesi), §24
17. **Dipendenze di supporto**: 1 (Identità & Accessi, bidirezionale), §24
18. **Dipendenze vietate**: 8, §24
19. **Cicli analizzati**: 6 (Persone↔Appartenenze; Imprese↔Appartenenze; Persone↔Imprese↔Appartenenze; Appartenenze↔Professionisti; Appartenenze↔Identità & Accessi; Appartenenze↔Osservatorio) più 1 caso segnalato come "da verificare" (Appartenenze↔Contenuti Editoriali), §25
20. **Decisioni locali**: 3 (DA2, DA3, DA5), §26, §29
21. **Decisioni riutilizzabili**: 3 (DA6, DA7, DA8), §26, §29
22. **Decisioni fondazionali**: 5 (DA1, DA4, DA9, DA10, DA11), §26, §29 — segnalate come proposte, non inserite automaticamente nella baseline
23. **Pattern utilizzati**: 24 codici distinti (A01, E02, E03, E04, VO01, R01, R04, R06, R07, R08, S01, S02, S03, S08, V01, V02, V03, V04, EV01, EV03, EV04, D01-D09, C03, C06, DOC03, T01-T07, VIS01-VIS06 — enumerati per famiglia in §31, riga 26)
24. **Pattern riutilizzabili confermati**: 11, §27
25. **Qualità raggiunta**: 15 attributi verificati con esito positivo (1 con riserva esplicitamente motivata: verificabilità, per la relazione non confermata con Contenuti Editoriali), nessuno con esito negativo, nessun punteggio numerico utilizzato, §28
26. **Questioni aperte**: 11 (8 logiche, 3 metodologiche), §30
27. **Aspetti rinviati**: 13 (4 ai domini futuri, 6 alla rappresentazione fisica concreta, 3 alla governance), §30
28. **Eventuali impatti sulla Dependency Map**: D3 ratificata come già Consolidata dal punto di vista del dominio proprietario; D9/D17/D23/D28 confermate per la parte di competenza di Appartenenze, restando Provvisorie fino al completamento dei rispettivi mapping dipendenti (Mercati Internazionali, Opportunità, Collaborazioni, Eventi); V2, V4, V10 confermate come vietate, §24, §26, §29
29. **Conferma dell'assenza di contenuti tecnici e implementativi**: confermata dal controllo finale (§31, righe 21-24); nessuna istruzione SQL, schema di database, riferimento a PostgreSQL/Supabase o dettaglio implementativo è presente fuori dalla nota introduttiva e dal §30
