# Dependency Map — immigratiimprenditori.it

## Nota introduttiva di esclusione

Questo documento definisce la mappa canonica delle dipendenze tra gli undici domini del progetto `immigratiimprenditori.it`.

Non rappresenta uno schema di database, un modello relazionale, una struttura tecnica, un diagramma di tabelle, un sistema di autorizzazioni, un flusso applicativo o un'implementazione. Non contiene SQL, non definisce tabelle, colonne, chiavi, indici, vincoli tecnici o tipi di dato. Non descrive PostgreSQL, Supabase, API, eventi tecnici, webhook, code, endpoint o codice.

Le uniche menzioni di tecnologie ammesse in questo documento compaiono in questa nota, in §26 "Aspetti rinviati" e in §27 "Controllo finale", esclusivamente per confermarne l'assenza altrove nel testo.

Il documento descrive esclusivamente: la direzione delle dipendenze tra domini; la proprietà concettuale dei dati; i riferimenti consentiti; le dipendenze necessarie, facoltative, derivative, editoriali/rappresentative, di supporto e vietate; i rischi di accoppiamento e di circolarità; i confini da rispettare nei futuri Physical Domain Mapping.

La Dependency Map assume come già approvati i Physical Domain Mapping di **Persone** (`domain-mapping/persone.md`), **Imprese** (`domain-mapping/imprese.md`), **Professionisti** (`domain-mapping/professionisti.md`), **Collaborazioni** (`domain-mapping/collaborazioni.md`) e **Opportunità** (`domain-mapping/opportunita.md`). Per i restanti domini non ancora mappati fisicamente in questa revisione, utilizza esclusivamente il livello logico (i rispettivi documenti in `docs/architecture/logical/`) e la sintesi di `docs/architecture/logical/reconciliation-report.md`, senza anticipare decisioni fisiche non ancora approvate. Le righe della matrice relative a Professionisti, Collaborazioni e Opportunità sono aggiornate secondo la regola 12 di §22.

## Documenti fondativi letti integralmente

- `docs/domain-model.md`
- `docs/architecture/logical/reconciliation-report.md`
- `docs/architecture/logical/persone.md`
- `docs/architecture/logical/imprese.md`
- `docs/architecture/logical/appartenenze.md`
- `docs/architecture/logical/mercati-internazionali.md`
- `docs/architecture/logical/opportunita.md`
- `docs/architecture/logical/collaborazioni.md`
- `docs/architecture/logical/professionisti.md`
- `docs/architecture/logical/eventi.md`
- `docs/architecture/logical/contenuti-editoriali.md`
- `docs/architecture/logical/osservatorio.md`
- `docs/architecture/logical/identita-accessi.md`
- `docs/architecture/physical/01-principi-mapping.md`
- `docs/architecture/physical/02-reference-model.md`
- `docs/architecture/physical/03-convenzioni-architetturali.md`
- `docs/architecture/physical/04-quality-attributes.md`
- `docs/architecture/physical/architecture-baseline.md`
- `docs/architecture/physical/domain-mapping/persone.md`
- `docs/architecture/physical/domain-mapping/imprese.md`

## Domini inclusi

1. Persone
2. Imprese
3. Appartenenze
4. Mercati Internazionali
5. Opportunità
6. Collaborazioni
7. Professionisti
8. Eventi
9. Contenuti Editoriali
10. Osservatorio
11. Identità & Accessi

Non viene introdotto alcun dominio ulteriore. Concetti condivisi come Tassonomia condivisa e Territori sono trattati in §14 secondo quanto già stabilito da `docs/domain-model.md` e da `reconciliation-report.md`, senza costituire un dodicesimo bounded context.

---

# Definizioni obbligatorie

Queste sei definizioni sono vincolanti per l'intero documento e per ogni futuro Physical Domain Mapping che le richiami.

## Proprietà

Un dominio **possiede** un concetto quando è responsabile del suo significato, delle sue invarianti, del ciclo di vita e delle decisioni che lo modificano. La proprietà è unica (principio del Single Owner, `domain-model.md` §1): un solo dominio può possedere un dato concetto in un dato momento. La proprietà non è negoziabile per convenienza implementativa né trasferibile per il solo fatto che un altro dominio lo utilizzi, lo rappresenti o lo aggreghi più frequentemente del proprietario stesso.

## Riferimento

Un dominio può **identificare o richiamare** un concetto posseduto da un altro dominio senza acquisirne proprietà o responsabilità. Il riferimento (pattern R01/R02, `02-reference-model.md` §6) è la modalità ordinaria con cui un Aggregate richiama un altro Aggregate: per identità, non per incorporazione. Riferire un concetto non autorizza a ridefinirne il significato, a modificarlo unilateralmente o a duplicarne gli attributi sostanziali.

## Utilizzo

Un dominio può **utilizzare** un dato esterno per svolgere una propria responsabilità, senza poterlo modificare o reinterpretare unilateralmente. L'utilizzo presuppone un riferimento già stabilito ed è tipico delle regole che condizionano un processo di un dominio (es. un'autorizzazione a operare) a un fatto posseduto altrove (es. lo stato di un'Appartenenza). L'utilizzo non genera un nuovo dato: consuma un dato esistente per una decisione locale.

## Derivazione

Un dominio **produce un dato nuovo a partire da dati sorgente**, mantenendo tracciabile origine, responsabilità e significato della derivazione. Il dato derivato (pattern D05, `02-reference-model.md` §11) appartiene al dominio che lo produce, ma il dato sorgente resta di proprietà del dominio originario. La derivazione non retroagisce mai sul dato sorgente e non lo sostituisce.

## Aggregazione

Un dominio **combina più dati** per produrre una rappresentazione osservativa o statistica, senza diventare proprietario dei fatti originari. L'aggregazione (pattern D06, `02-reference-model.md` §11) è tipicamente unidirezionale, a valle di molti domini sorgente, e produce indicatori (pattern EV/D specifici dell'Osservatorio) che restano interpretazioni derivate, non fatti sostanziali.

## Pubblicazione

La possibilità di **rendere visibile** un dato non trasferisce la sua proprietà al dominio che lo presenta. La pubblicazione (pattern VIS01-VIS06, `02-reference-model.md` §15) è una funzione di visibilità applicata a un dato che resta di proprietà del dominio originario; vale sia per la pubblicazione operata dal dominio proprietario stesso (es. Impresa pubblica la propria scheda), sia per la rappresentazione editoriale operata da un altro dominio (es. Contenuti Editoriali narra un'Impresa).

---

# Classificazione obbligatoria delle dipendenze

Ogni relazione rilevante tra domini identificata in questo documento è classificata con esattamente una delle seguenti categorie.

## Necessaria

Il dominio dipendente non può esprimere correttamente una propria responsabilità senza riferirsi al dominio proprietario. Una dipendenza necessaria non significa che i due domini condividano lo stesso ciclo di vita: il dominio dipendente riferisce un'identità o un fatto stabile, non ne eredita lo stato.

## Facoltativa

Il riferimento arricchisce il dominio, ma non è necessario per l'esistenza o la validità del suo nucleo. L'assenza del dato riferito lascia il nucleo del dominio dipendente pienamente valido.

## Derivativa

Il dominio utilizza fatti posseduti altrove per produrre dati derivati o aggregati propri. È la classificazione propria delle dipendenze in uscita dell'Osservatorio verso tutti gli altri domini.

## Editoriale o rappresentativa

Il dominio rappresenta, racconta o pubblica un soggetto o un fatto posseduto altrove, senza acquisirne ownership. È la classificazione propria delle dipendenze in uscita di Contenuti Editoriali.

## Di supporto

Il dominio fornisce capacità trasversali, ma non determina il significato del dominio servito. È la classificazione propria delle dipendenze di Identità & Accessi verso tutti gli altri domini (e, in direzione inversa, della dipendenza di ogni dominio verso Identità & Accessi per l'applicazione dell'accesso).

## Vietata

La dipendenza duplicherebbe dati, invertirebbe l'ownership, introdurrebbe un ciclo non governato, assorbirebbe un altro dominio, confonderebbe identità/accesso/soggetto di dominio, oppure trasferirebbe responsabilità senza giustificazione. Non si classifica come necessaria una dipendenza soltanto perché è frequente o utile: la frequenza d'uso non è un criterio di necessità concettuale.

---

# Indice

1. Obiettivo e ruolo della Dependency Map
2. Principi di dipendenza
3. Classificazione dei domini
4. Domini fondazionali
5. Appartenenze come dominio relazionale
6. Mercati Internazionali
7. Professionisti
8. Opportunità
9. Collaborazioni
10. Eventi
11. Contenuti Editoriali
12. Osservatorio
13. Identità & Accessi
14. Tassonomie e Territori condivisi
15. Matrice canonica delle dipendenze
16. Dipendenze necessarie
17. Dipendenze facoltative
18. Dipendenze derivative, editoriali e di supporto
19. Dipendenze vietate
20. Analisi dei cicli
21. Direzione canonica delle modifiche
22. Regole per i futuri Physical Domain Mapping
23. Divergenze e decisioni da verificare
24. Verifica degli attributi di qualità
25. Decisioni consolidate
26. Aspetti rinviati
27. Controllo finale

Riepilogo finale

---

## 1. Obiettivo e ruolo della Dependency Map

### Perché la mappa viene costruita dopo Persone e Imprese

`architecture-baseline.md` ha verificato che la metodologia fisica (principi, Reference Model, convenzioni, attributi di qualità) è matura, utilizzando `domain-mapping/persone.md` come caso di studio. `domain-mapping/imprese.md` ha poi applicato la stessa metodologia a un secondo dominio, di natura diversa (un soggetto economico invece di un soggetto individuale), confermandone la generalità e producendo la prima correzione di ownership formalmente registrata (`MercatoImpresa`, §6). Con due mapping fondazionali approvati, esiste ora una base empirica sufficiente — e necessaria — per fissare, prima di procedere sugli altri nove domini, la rete di dipendenze che li lega tra loro e ai due domini già consolidati. Costruire la mappa prima significa evitare che ciascuno dei nove mapping successivi definisca autonomamente, e in modo potenzialmente incoerente, il proprio rapporto con Persone, Imprese e con gli altri domini ancora da mappare.

### Come completa la baseline

`architecture-baseline.md` ha consolidato **come** si mappa un dominio (principi, pattern, convenzioni, qualità) osservando **un** dominio alla volta. Questa Dependency Map consolida **come i domini si relazionano tra loro**, cioè la dimensione che un singolo mapping di dominio può descrivere solo dal proprio punto di vista (§9-§10 di `imprese.md`, §9 di `domain-mapping/persone.md`). La baseline resta il riferimento per la qualità interna di ciascun mapping; questa mappa è il riferimento per la coerenza tra i mapping. Le due cose sono complementari e non si sovrappongono: la baseline non contiene una visione d'insieme delle undici relazioni, questa mappa non ridefinisce principi, pattern o convenzioni già stabiliti.

### Come deve essere utilizzata nei mapping successivi

Ogni futuro Physical Domain Mapping (Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi) deve:

1. consultare questa mappa prima di descrivere una propria dipendenza in uscita o in entrata;
2. non contraddire la classificazione già assegnata a una dipendenza qui registrata come consolidata;
3. proporre, quando necessario, una revisione esplicita di una dipendenza qui classificata come provvisoria, motivandola;
4. non introdurre dipendenze non previste da questa mappa senza una motivazione tracciata (§22).

La mappa non sostituisce l'analisi di dettaglio che ciascun mapping dovrà condurre: fissa la direzione, la proprietà e i confini; il singolo mapping resta responsabile della granularità interna (entità, relazioni incorporate, assi di stato, verifiche) del proprio dominio.

### Perché non è un diagramma tecnico

Un diagramma delle dipendenze tra tabelle, servizi o moduli descriverebbe un'architettura software. Questa mappa descrive un'architettura di dominio: la sua unità di analisi è il concetto posseduto, non la struttura che lo conterrà. Due domini possono avere una dipendenza concettuale necessaria che, a livello tecnico, non richiede alcun collegamento diretto (es. una vista materializzata, una cache, un evento asincrono); viceversa due tabelle possono essere tecnicamente collegate da una chiave esterna senza che esista alcuna dipendenza concettuale di ownership. La mappa parla esclusivamente del primo piano.

### Come governa ownership, riferimenti e accoppiamento

La mappa è lo strumento con cui si verifica, per ciascuna coppia di domini, che: (a) la proprietà di ogni concetto sia unica e dichiarata; (b) ogni riferimento incrociato sia esplicito, classificato e motivato; (c) l'accoppiamento risultante sia il minimo necessario a esprimere le responsabilità reciproche. Governare l'accoppiamento non significa eliminarlo: significa renderlo visibile, intenzionale e verificabile, distinguendo ciò che è strutturale (una dipendenza necessaria, stabile nel tempo) da ciò che è opportunistico (una dipendenza facoltativa, che potrebbe non esistere senza perdita di validità del nucleo).

---

## 2. Principi di dipendenza

Questa sezione consolida, senza duplicarne il testo integrale, i principi e le convenzioni già stabiliti che governano le dipendenze tra domini.

| # | Principio | Fonte | Applicazione in questo documento |
|---|---|---|---|
| P1 | Ogni concetto ha un dominio proprietario unico (Single Owner) | `domain-model.md` §1; `01-principi-mapping.md` §2 | Base di ogni riga della matrice (§15): ogni oggetto di dipendenza ha esattamente un "dominio proprietario" |
| P2 | Il riferimento non trasferisce ownership | `01-principi-mapping.md` §4; `02-reference-model.md` §6 (R01/R02) | Distingue "dominio destinazione" da "dominio proprietario" nella matrice quando i due non coincidono con l'oggetto puntuale referenziato |
| P3 | Nessun dominio può modificare unilateralmente fatti posseduti altrove | `domain-model.md` §1, principio di non-automatismo; `03-convenzioni-architetturali.md` §7 | Fondamento di §21 (direzione canonica delle modifiche) |
| P4 | Una relazione non implica incorporazione | `imprese.md` §1 regola fondamentale; `domain-mapping/imprese.md` §1, §9 | Fondamento di §5 (Appartenenze) e di ogni riga "vietata" in §19 |
| P5 | La pubblicazione non implica proprietà | Definizione "Pubblicazione", sopra; `02-reference-model.md` §15 (VIS01-VIS06) | Fondamento di §11 (Contenuti Editoriali) |
| P6 | La derivazione conserva la provenienza | Definizione "Derivazione", sopra; `02-reference-model.md` §11 (D05/D06) | Fondamento di §12 (Osservatorio) e di §18 |
| P7 | Le dipendenze circolari devono essere eliminate o esplicitamente governate | `03-convenzioni-architetturali.md` §9 (RC29-RC30); `04-quality-attributes.md` §5 (basso accoppiamento) | Fondamento di §20 (analisi dei cicli) |
| P8 | Identità & Accessi non deve modellare il business | `identita-accessi.md` §1, §12; `reconciliation-report.md` §3.2 | Fondamento di §13 |
| P9 | Osservatorio non deve diventare proprietario dei dati sorgente | `osservatorio.md` §1, §7; `reconciliation-report.md` §11.4 | Fondamento di §12 |
| P10 | Contenuti Editoriali non deve diventare proprietario dei soggetti narrati | `contenuti-editoriali.md` §1, §9 | Fondamento di §11 |
| P11 | Imprese non deve assorbire il proprio ecosistema | `domain-mapping/imprese.md` §1 "Regola fondamentale: impresa e relazioni", §9-§10 | Fondamento di §4, §5, §6, §7 |
| P12 | Persone non deve coincidere con account o credenziali | `domain-mapping/persone.md` §5, §9; `identita-accessi.md` §1 | Fondamento di §4, §13 |

Questi dodici principi sono richiamati, non ridefiniti, in tutto il resto del documento. Ogni sezione da §4 in avanti cita il principio pertinente per numero (P1-P12) invece di riprodurne il contenuto.

---

## 3. Classificazione dei domini

La classificazione seguente identifica il **ruolo prevalente** di ciascun dominio rispetto all'insieme dei fatti che possiede e al modo in cui viene referenziato dagli altri. Una classificazione può comprendere qualificazioni secondarie, ma non costituisce una gerarchia di importanza: un dominio "di supporto" non è meno rilevante di un dominio "fondazionale", è semplicemente responsabile di una diversa categoria di fatti.

| Dominio | Ruolo prevalente | Qualificazioni secondarie | Motivazione sintetica |
|---|---|---|---|
| Persone | Fondazionale | — | Possiede l'identità del soggetto individuale, riferita da sette degli altri dieci domini (`domain-mapping/persone.md` §9); esiste indipendentemente da ogni relazione |
| Imprese | Fondazionale | — | Possiede l'identità del soggetto economico, riferita da nove degli altri dieci domini (`domain-mapping/imprese.md` §10); esiste indipendentemente da ogni relazione, incluse quelle con le Persone che la rappresentano |
| Appartenenze | Relazionale | — | Possiede esclusivamente relazioni contestuali e temporali tra soggetti (Persona-Impresa, Persona-Organizzazione, Impresa-Organizzazione); non possiede alcuna identità di soggetto |
| Mercati Internazionali | Informativo | Relazionale | Possiede sia il concetto di mercato come contesto geo-economico (informativo, simile a una tassonomia di dominio) sia la relazione di presenza/interesse verso quel mercato (relazionale); il ruolo informativo prevale perché il mercato esiste come riferimento anche prima che una relazione lo renda concreto |
| Opportunità | Applicativo | Relazionale | Possiede la rappresentazione governata di una possibilità azionabile strutturata e l'eventuale processo interno; candidatura non obbligatoria; non possiede i soggetti che vi partecipano (`domain-mapping/opportunita.md`) |
| Collaborazioni | Relazionale | Applicativo | Possiede esigenze e proposte di collaborazione e il loro possibile esito relazionale; più orientato al legame tra soggetti che Opportunità, meno strutturato di un processo applicativo formale |
| Professionisti | Applicativo | Fondazionale limitato | Possiede la qualificazione e l'offerta professionale come specializzazione della Persona; ha un nucleo con caratteristiche fondazionali limitate (§4) ma non esiste indipendentemente da una Persona |
| Eventi | Applicativo | Relazionale | Possiede l'evento come attività organizzata nel tempo e la partecipazione ad essa; il fatto posseduto è l'evento, non l'identità di chi partecipa |
| Contenuti Editoriali | Editoriale | — | Possiede la rappresentazione narrativa e redazionale, non i soggetti o i fatti narrati |
| Osservatorio | Osservativo | — | Possiede indicatori, aggregazioni e metodologie derivate da fatti altrove posseduti |
| Identità & Accessi | Di supporto | — | Possiede identità digitale, autenticazione e autorizzazione di accesso; non determina il significato di alcun soggetto di dominio (P8) |

La classificazione non introduce gerarchie: un dominio "di supporto" come Identità & Accessi è tanto vincolante quanto un dominio "fondazionale" nel proprio ambito (l'accesso non può essere bypassato), ma il suo ambito è trasversale invece che sostanziale. Analogamente, "editoriale" e "osservativo" non sono ruoli minori: descrivono domini la cui intera responsabilità è, per definizione, di secondo livello rispetto ai fatti sorgente — il che è la loro natura corretta, non un limite.

---

## 4. Domini fondazionali

### Persone

**Concetti posseduti**: identità della persona, profilo personale, competenze dichiarate, lingue, storia personale (`domain-mapping/persone.md` §3-§5).

**Chi può referenziarla**: Appartenenze, Imprese (solo per identità, §9 di `imprese.md`), Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi (per l'associazione account-soggetto).

**Dipendenze in entrata legittime**: qualunque dominio può riferire l'identità di una Persona (pattern R01/R02) per esprimere un ruolo, una partecipazione, una candidatura o una narrazione, mai per incorporarne gli attributi.

**Dipendenze in uscita da limitare**: Persone dipende soltanto da Tassonomia condivisa (per Competenza e Lingua, riferite come VO03) e, per l'applicazione dell'accesso, da Identità & Accessi in direzione di supporto (§13). Persone non deve dipendere da Appartenenze, Imprese, Professionisti o alcun altro dominio per la propria validità sostanziale: la Persona esiste e resta valida indipendentemente da qualunque relazione, ruolo professionale o partecipazione (`domain-mapping/persone.md` §9, decisione consolidata).

**Perché non deve assorbire relazioni esterne**: se Persone incorporasse le proprie appartenenze, i propri ruoli professionali o le proprie partecipazioni, il ciclo di vita della relazione (che può iniziare, sospendersi, cessare) verrebbe confuso con il ciclo di vita del soggetto (che continua a esistere dopo la cessazione della relazione). Questo violerebbe P4 e comprometterebbe la conservazione della storia (`domain-model.md` §1, principio di continuità storica).

**Distinzione tra ciclo di vita del soggetto e ciclo di vita delle relazioni**: la Persona ha propri assi di stato (operativo, editoriale, di visibilità: `domain-mapping/persone.md` §7-§8) che non sono influenzati dallo stato delle Appartenenze, delle candidature a Opportunità o delle partecipazioni a Eventi. La cessazione di un'Appartenenza, il rifiuto di una candidatura o la fine di un Evento non alterano lo stato della Persona.

### Imprese

**Concetti posseduti**: identità dell'impresa, sedi, settori, servizi, prodotti, lingue operative, certificazioni, canali, media (`domain-mapping/imprese.md` §3-§8).

**Chi può referenziarla**: Appartenenze, Mercati Internazionali, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi (§10 di `imprese.md`).

**Dipendenze in entrata legittime**: qualunque dominio può riferire l'identità di un'Impresa per esprimere una relazione, una presenza di mercato, un'opportunità offerta, una collaborazione proposta, una partecipazione a un Evento o una narrazione editoriale.

**Dipendenze in uscita da limitare**: Imprese dipende da Appartenenze (per la propria "vista di sintesi" AppartenenzaImpresa, non normativa, §9 di `domain-mapping/imprese.md`), da Tassonomia condivisa e Territori (per settore, lingua, sede), e da Identità & Accessi in direzione di supporto. Imprese **non** dipende da Mercati Internazionali per la propria validità (la relazione MercatoImpresa è posseduta da Mercati Internazionali, non da Imprese: decisione consolidata D2 di `domain-mapping/imprese.md` §2, §10, §19), né da Professionisti, Opportunità, Collaborazioni o Eventi.

**Contatti commerciali dell'Impresa (CanaleImpresa).** Telefono commerciale ed email commerciale dichiarati appartengono a Imprese come CanaleImpresa (natura + ValoreCanale), non a Persone e non a Identità & Accessi (`domain-mapping/imprese.md` §8). La natura `marketplace` è soltanto una Tipologia C05 del canale in M3.2, non una dipendenza da un dominio Marketplace. La natura `retail_point` (punto vendita come canale commerciale) **non** crea una dipendenza necessaria da SedeImpresa: sede e canale restano fatti distinti; nessuna FK da canale a sede è richiesta per la validità di Imprese.

**Perché non deve assorbire relazioni esterne**: `domain-mapping/imprese.md` §1 ("Regola fondamentale: impresa e relazioni") ha già escluso esplicitamente che soci, amministratori, fondatori, referenti, mercati, eventi, opportunità, collaborazioni, contenuti editoriali e indicatori statistici siano incorporati nell'Aggregate Impresa. Questa mappa conferma tale esclusione come vincolo trasversale (P11).

**Distinzione tra ciclo di vita del soggetto e ciclo di vita delle relazioni**: gli assi di stato di Impresa (S01-S04, S07-S08: `domain-mapping/imprese.md` §11.1) restano indipendenti dallo stato delle Appartenenze che la riguardano, dalle sue presenze di mercato, dalle opportunità che pubblica o dalle collaborazioni in cui è coinvolta. Un'Impresa resta valida anche se tutte le persone ad essa collegate cessano la propria Appartenenza (`imprese.md` §12, questione aperta 5, non risolta ma non necessaria a questo livello).

**Pubblicazione e visibilità (M7.1).** La coerenza di pubblicazione è contratto di presentazione formalizzato in `domain-mapping/imprese.md` §15.1: nessun campo sintetico di publishability; ceiling = esposizione; nessuna FK/trigger cross-table verso Appartenenze o Moderazione; VIS02 fuori ownership Imprese.

### Domini con caratteristiche fondazionali limitate

Valutando gli altri nove domini rispetto ai criteri di "esistenza indipendente" e "ampiezza del riferimento in entrata" che caratterizzano Persone e Imprese, si osservano due casi di caratteristiche fondazionali **limitate**, senza che questo ne alteri la classificazione principale (§3):

- **Mercati Internazionali**: il concetto di "mercato" (un'area geo-economica) ha un'esistenza concettualmente indipendente da qualunque impresa o persona che vi operi, in modo simile a una tassonomia. Tuttavia il dominio nel suo complesso possiede anche la relazione (Presenza di mercato), che non è indipendente da Imprese o Persone. Il dominio resta classificato come Informativo/Relazionale (§3), non Fondazionale, perché la sua responsabilità principale — la relazione — non è mai priva di controparte.
- **Professionisti**: il "Profilo professionale" ha una propria identità pubblica e una propria evoluzione temporale che vanno oltre la semplice appartenenza a Persone (una Persona può avere un profilo professionale con proprio stato di visibilità e verifica indipendente dal profilo personale). Tuttavia il Profilo professionale non può esistere senza una Persona che lo sottende (§7): la caratteristica fondazionale è quindi limitata al fatto che il profilo, una volta creato, evolve secondo un proprio ciclo di vita, non al fatto che possa esistere autonomamente.

Nessuna riclassificazione arbitraria è operata: questi due domini restano rispettivamente Informativo/Relazionale e Applicativo/Fondazionale-limitato come da §3.

---

## 5. Appartenenze come dominio relazionale

### Ruolo

Appartenenze governa relazioni contestuali e temporali tra soggetti: è il dominio che dà significato, ciclo di vita e stato a un legame, non ai soggetti che lo compongono (P4).

### Relazioni analizzate al livello logico (`appartenenze.md`)

| Relazione | Soggetti coinvolti | Oggetto della relazione |
|---|---|---|
| Persona–Impresa | Persone, Imprese | Ruolo (es. fondatore, dipendente, referente), responsabilità, periodo di validità |
| Persona–Organizzazione | Persone, Organizzazioni istituzionali (dominio candidato, non ancora modellato: `reconciliation-report.md` §13) | Ruolo associativo o istituzionale |
| Impresa–Organizzazione | Imprese, Organizzazioni istituzionali | Adesione, affiliazione, appartenenza a rete o associazione di categoria |

Per ciascuna relazione, `appartenenze.md` definisce: **ruoli** (catalogati per tipo di relazione), **responsabilità** (specifiche del ruolo, es. l'Autorizzazione a gestire la scheda Impresa), **periodi di validità** (data di inizio, data di fine, eventuali sospensioni), **stato della relazione** (multiassiale: dichiarata, verificata, attiva, sospesa, cessata — assi indipendenti, non un'unica sequenza lineare), **verificabilità** (chi e come può verificare il ruolo dichiarato) e **visibilità** (se e come la relazione è mostrata pubblicamente, indipendentemente dalla visibilità dei due soggetti collegati).

### Chiarimenti vincolanti

- **Persone non possiede le appartenenze**: la Persona non contiene un elenco delle proprie relazioni come attributo incorporato; ogni Appartenenza esiste come Aggregate autonomo che referenzia la Persona (`domain-mapping/persone.md` §9, R7).
- **Imprese non possiede soci, amministratori, fondatori o referenti come elementi incorporati**: `domain-mapping/imprese.md` §9 tratta questi ruoli esclusivamente come vista di sintesi (AppartenenzaImpresa) della fonte autorevole in Appartenenze, non come dati propri dell'Impresa.
- **La relazione ha significato e ciclo di vita propri**: una Appartenenza può essere dichiarata, verificata, contestata, sospesa o cessata secondo un proprio calendario, indipendente da quello dei due soggetti collegati.
- **La cessazione della relazione non elimina i soggetti collegati**: quando un'Appartenenza cessa, sia la Persona sia l'Impresa continuano a esistere con la propria identità e i propri stati inalterati; cessa soltanto il legame, non i soggetti (P4, `domain-model.md` §1 principio di continuità storica).

### Confini rispetto al futuro mapping fisico

Questo documento non anticipa la struttura degli assi di stato (nove combinazioni su tre assi, secondo `imprese.md` §9 e la sintesi in `domain-mapping/imprese.md` §9), il trattamento fisico dell'Autorizzazione a gestire, né alcuna decisione sulla granularità della verifica. Questi aspetti restano di esclusiva competenza del futuro `domain-mapping/appartenenze.md`.

---

## 6. Mercati Internazionali

### Ownership del dominio

Mercati Internazionali possiede: il concetto di **mercato** come area geo-economica di riferimento (catalogo condiviso, analogo per natura a una tassonomia di dominio); la **presenza o interesse** di un'Impresa o di una Persona verso un mercato; le **modalità operative internazionali** (import, export, interesse, presenza stabile) associate a quella relazione; l'**evoluzione temporale** della relazione (quando è dichiarata, quando è verificata, se cessa); le **classificazioni specifiche del contesto internazionale** (es. tipologia di operatività, area regolatoria).

### Decisione consolidata su MercatoImpresa

`domain-mapping/imprese.md` ha registrato, correggendo la lettura letterale del proprio documento logico, la seguente decisione:

> `MercatoImpresa`, o qualunque concetto equivalente di relazione tra un'impresa e un mercato, appartiene a Mercati Internazionali. Imprese può referenziarlo, ma non possederlo o duplicarlo.

Questa Dependency Map registra formalmente tale decisione come vincolante per il futuro `domain-mapping/mercati-internazionali.md`: quel documento dovrà trattare la relazione con l'Impresa (e con la Persona, quando la presenza di mercato è dichiarata a titolo personale o tramite un'Appartenenza) come proprio Aggregate, non come estensione dell'Aggregate Impresa.

### Distinzioni concettuali da non confondere

| Concetto | Dominio proprietario | Natura |
|---|---|---|
| Sede estera | Imprese (`SedeImpresa`) | Luogo fisico di operatività dell'impresa, può trovarsi in un altro paese |
| Territorio servito | Imprese (`ServizioImpresa`, ambito del servizio) | Estensione geografica in cui un servizio specifico è offerto, non necessariamente internazionale; in M4.1 forma dichiarativa testuale (`served_territory`), non catalogo Territori né UUID opaco (`domain-mapping/imprese.md` §8A) |
| Mercato di interesse | Mercati Internazionali | Area geo-economica verso cui l'impresa dichiara un interesse, senza necessariamente operarvi |
| Mercato in cui l'impresa opera | Mercati Internazionali | Area geo-economica in cui l'impresa ha una presenza operativa effettiva (import, export, sede, attività continuativa) |
| Origine delle persone collegate all'impresa | Persone (paese di origine della Persona, `domain-mapping/persone.md` §5) | Attributo del soggetto individuale, non dell'impresa; non implica automaticamente alcuna relazione di mercato (principio di non-automatismo, P3) |

Nessuna deduzione automatica è ammessa tra queste righe: avere una sede estera non implica un mercato di interesse in quel paese; avere un fondatore originario di un paese non implica alcuna presenza o interesse di mercato verso quel paese; servire un territorio italiano non equivale a operare in un mercato internazionale. Ogni relazione deve essere dichiarata esplicitamente come fatto proprio di Mercati Internazionali.

---

## 7. Professionisti

### Relazione con Persone

Il Profilo professionale è una specializzazione della Persona (`professionisti.md` §1-§2; `domain-mapping/professionisti.md`): non esiste senza una Persona sottostante (riferimento opaco necessario, D10), ma possiede un proprio ciclo di vita (creazione, verifica delle qualificazioni, visibilità pubblica) indipendente da quello del profilo personale generico. **Il Professionista non è un soggetto distinto dalla Persona**: è una qualificazione della Persona. Una Persona può non avere alcun Profilo professionale. **Il professionista non coincide necessariamente con una Persona pubblicata**: una Persona può avere un profilo personale non pubblico e, in linea di principio, un Profilo professionale con proprio stato di visibilità (le due visibilità sono assi distinti, non collegati automaticamente). Professionisti non possiede l'identità personale.

### Relazione con Imprese

**La qualificazione professionale appartiene al dominio Professionisti**, non a Imprese. Un rapporto professionale con un'impresa (es. un consulente che lavora abitualmente con una determinata azienda) non deve essere incorporato nell'Impresa: se il rapporto è strutturato e duraturo, la sua fonte autorevole è un'Appartenenza (dominio Appartenenze); se è occasionale, appartiene a Collaborazioni o Opportunità secondo la natura del rapporto. Professionisti può referenziare Imprese per il contesto organizzativo o l'esercizio professionale dichiarato (D11, facoltativa), senza possedere l'Impresa, senza duplicarne l'identità, senza verificarne i fatti e senza creare implicitamente una relazione Persona–Impresa.

### Relazione con Appartenenze

Quando un Professionista opera attraverso un'Impresa in modo strutturato (es. come dipendente o come titolare), la relazione strutturale, il ruolo organizzativo, la titolarità, la rappresentanza, il periodo di validità e l'esito di verifica della relazione sono di competenza di Appartenenze, non di Professionisti: Professionisti può utilizzarne l'esito (utilizzo, non riferimento sostanziale; D12, facoltativa, consolidata dal mapping di Professionisti) per contestualizzare la propria offerta, senza diventarne proprietario né duplicare la verifica.

### Relazione con Mercati Internazionali

Professionisti può dichiarare mercati conosciuti o serviti mediante riferimento opaco e facoltativo al Mercato (D13), senza creare Presenze, Interessi o altre relazioni possedute da Mercati Internazionali.

### Relazione con Opportunità e Collaborazioni

Professionisti può essere referenziato da Opportunità (D16) e da Collaborazioni (D21) come qualificazione della Persona coinvolta. In entrambi i casi, Opportunità e Collaborazioni referenziano il Profilo professionale (e, se pertinente, un ServizioProfessionale) senza incorporarne gli attributi. **Non esiste una dipendenza consolidata Professionisti → Collaborazioni né Professionisti → Opportunità**: la partecipazione di una Persona qualificata come Professionista non implica ownership o utilizzo autorevole inverso da parte di Professionisti. Il mapping di Opportunità conferma D16 in entrata e mantiene aperta l'osservazione DV10 (nessuna riga Professionisti → Opportunità).

### ServizioProfessionale

`ServizioProfessionale` è un'Entity dipendente del Profilo professionale (`domain-mapping/professionisti.md`): non costituisce un dominio Servizi. Può essere referenziato da Collaborazioni (nell'ambito di D21) e, facoltativamente, da Opportunità (D16) senza ownership del servizio né della sua erogazione; non produce dipendenze verso un dominio Servizi inesistente.

**Distinzione da ServizioImpresa.** `ServizioImpresa` è owned da Imprese (offerta aziendale, M4.1 / `business_services`); `ServizioProfessionale` è owned da Professionisti. Non condividono tabella né ownership. Le lingue per-servizio di `ServizioImpresa` (riferimento a `LinguaOperativaImpresa`) restano fuori dal blocco M4 e non creano dipendenza M2.2 in M4.1 (`domain-mapping/imprese.md` §8A).

**ProdottoImpresa (M4.2).** Owned da Imprese (`business_products`); tabella distinta da `business_services`; nessun e-commerce, prezzo, categoria strutturata, destinatari, territorio o lingue in M4.2 (`domain-mapping/imprese.md` §8B). Blocco M4 = solo M4.1 + M4.2.

**Blocco M5.** Solo M5.1 CertificazioneImpresa (`business_certifications`) e M5.2 MediaImpresa (`business_media`). Media ≠ supporto Certificazione ≠ Contenuti editoriali. Storage/bucket fuori M5. Nessuna FK media→servizi/prodotti (`domain-mapping/imprese.md` §13.1, §17.1).

**Blocco M6.** Solo M6.1 Verifica Impresa owned (`business_verifications`): aspetti `existence` \| `company_data` \| `contested_profile`; current-state; UNIQUE `(business_id, aspect)`. Certificazione verificata resta su M5.1 (`certification_status`), non duplicata in M6. Aspetti identità Persona / relazione / rappresentanza fuori ownership (Identità & Accessi, Appartenenze). Nessun badge “Impresa verificata”. Nessuna dipendenza di schema da M5. Pubblicazione/gate = M7.1 (`domain-mapping/imprese.md` §15.1). Non riaperto da M7.

**Blocco M7.** Solo M7.1 — coerenza di pubblicazione e visibilità (`domain-mapping/imprese.md` §15.1): contratto di **presentazione** (VIS04), non di vincolo strutturale. Ceiling Impresa → owned sull’**esposizione**; stati locali owned (`visibility_status` / `publication_status`) restano persistiti e indipendenti anche se l’Impresa è `unpublished`. Migration **comment-only** (`COMMENT ON`); nessun CHECK cross-table, trigger, funzione, view, colonna derivata, badge o score. Appartenenze è **utilizzata** esclusivamente per il gate applicativo del referente (condizione 5); Moderazione resta gate trasversale (condizione 6); Editoriali/StoriaImpresa restano indipendenti; Identità & Accessi gestisce VIS02 e le future policy. M7.1 non introduce dipendenze strutturali ulteriori.

### Verifiche

Professionisti è autorevole soltanto per le verifiche dei fatti propri (Profilo, Qualifiche, Iscrizioni, Abilitazioni, Certificazioni, Servizi dichiarati). Non verifica autonomamente la Persona, l'Impresa o l'Appartenenza: ne utilizza gli esiti prodotti dai rispettivi domini. Non esiste una dipendenza generica di "affidabilità" tra domini.

### Confini con Identità & Accessi

**Account, credenziali e permessi appartengono a Identità & Accessi**, non a Professionisti. Il fatto che un professionista accada a gestire il proprio profilo tramite un account non rende l'account parte del dominio Professionisti (P8, P12).

### Organizzazioni professionali e studi

Eventuali organizzazioni professionali, studi associati o ordini professionali non sono modellati da questo documento come entità proprie: se e quando un dominio "Organizzazioni istituzionali" verrà formalizzato (`reconciliation-report.md` §13, dominio candidato), la relazione tra un Professionista e la propria organizzazione sarà di competenza di Appartenenze (relazione Persona-Organizzazione, §5), non di Professionisti. Fino a quel momento, Professionisti non deve introdurre una propria modellazione di tali organizzazioni.

---

## 8. Opportunità

### Fatti posseduti

Opportunità possiede la **rappresentazione governata** di una possibilità azionabile strutturata (`domain-mapping/opportunita.md`): identità della scheda, origine, tipizzazione, requisiti e benefici dichiarati, destinatari/criteri, modalità di accesso, temporalità, fonti ed evidenze locali, verifiche di rappresentazione, pubblicazione/visibilità, e — soltanto quando assunti — candidatura, valutazione e assegnazione proprie. Non possiede il fatto istituzionale esterno, né l'identità di alcun soggetto, né Collaborazioni, Eventi, Contenuti Editoriali, Servizi o Organizzazioni.

### Soggetti che può referenziare

Opportunità utilizza riferimenti opachi (PF5) a **Persone** e **Imprese** per soggetti che agiscono, partecipano o sono registrati nel processo (promotore, segnalatore/censitore, pubblicatore, candidato, beneficiario/assegnatario), senza possederne identità, profilo o qualificazioni (D14, D15; V8). Referenza **Professionisti** in modo facoltativo quando è rilevante una qualificazione o un Profilo/ServizioProfessionale (D16), senza trattare il Professionista come soggetto autonomo. Utilizza **Appartenenze** per il titolo di rappresentanza quando una Persona agisce per un'Impresa (D17, utilizzo; ammesse snapshot storiche minime non autoritative). Referenza **Mercati Internazionali** in modo facoltativo per paesi, aree, territori o mercati obiettivo (D18), senza possedere PresenzaInternazionale, InteresseMercato o EsperienzaInternazionale.

### Chi può essere promotore, destinatario o beneficiario

Il promotore può essere una Persona (a titolo individuale) o un'Impresa (tramite un rappresentante autorizzato, verificato da Appartenenze). Il destinatario dichiarato è tipicamente un criterio, non un elenco nominativo obbligatorio; candidato e beneficiario, quando presenti, restano riferimenti. Soggetti non modellati (enti esterni) restano riferimenti informativi: nessun dominio Organizzazioni è introdotto.

### Relazione con Imprese, Persone e Professionisti

La relazione è sempre di riferimento opaco (R01/R02, PF5): Opportunità non incorpora dati di Imprese, Persone o Professionisti, né duplica i loro attributi autorevoli. Destinatario ≠ candidato ≠ beneficiario. Qualifiche e abilitazioni restano di Professionisti.

### Distinzione da Collaborazioni

Opportunità e Collaborazioni sono processi distinti. `CandidaturaOpportunità` (concetto interno, non obbligatorio, 0..N) ≠ `CandidaturaCollaborazione`. Collaborazioni può conservare soltanto un riferimento storico unidirezionale e facoltativo all'Opportunità di origine (D22); tale riferimento non è necessario all'esistenza della Collaborazione e non trasferisce ownership. **Non esiste dipendenza autorevole Opportunità → Collaborazioni**: eventuali Collaborazioni derivate sono solo aggregazione/proiezione inversa non autorevole.

### Distinzione da Eventi

Un Evento è un'attività organizzata in tempo e luogo; un'Opportunità è una possibilità azionabile strutturata che può esistere senza alcun Evento. Opportunità non possiede sede, programma, iscrizione o partecipazione Evento. Un Evento può presentare o generare Opportunità in modo facoltativo (D27, ancora provvisoria). Un eventuale riferimento Opportunità → Eventi resta **non consolidato** in questa mappa.

### Distinzione dai Contenuti Editoriali che eventualmente la presentano

La scheda strutturata appartiene a Opportunità. Articoli, guide, newsletter e approfondimenti appartengono a Contenuti Editoriali. Contenuti Editoriali può narrare o segnalare un'Opportunità (D34, editoriale); la visualizzazione inversa dei contenuti collegati è aggregazione derivata, non ownership (P5, P10; DC8).

### Vincolo su ownership dei soggetti coinvolti

Opportunità non deve mai acquisire la proprietà dei soggetti coinvolti: né del promotore, né del beneficiario, né del professionista destinatario (V8). Ogni tentativo di incorporare attributi sostanziali di questi soggetti (es. valutazioni permanenti, reputazione cumulata) violerebbe P1 e P4.
---

## 9. Collaborazioni

### Definizione del dominio

Collaborazioni possiede il **processo collaborativo** (`collaborazioni.md`; `domain-mapping/collaborazioni.md`): esigenze, offerte/proposte, partecipanti locali, manifestazioni, candidature collaborative, inviti, abbinamenti e l'eventuale fase relazionale attiva. Esiste già in fase dichiarativa (anche con un solo promotore) e può evolvere in fase relazionale (almeno due partecipanti effettivi) senza cambiare identità. È distinto sia da un rapporto stabile già costituito (Appartenenze), sia dal processo formale di Opportunità (annuncio, requisiti, candidatura a Opportunità, esito).

### Dipendenze analizzate

| Dominio referenziato | Natura della dipendenza | Motivazione |
|---|---|---|
| Persone | Necessaria | Il dominio deve poter referenziare Persone come promotori o partecipanti (riferimento opaco). Ogni Collaborazione ha almeno un soggetto (Persona e/o Impresa); non ogni istanza ha necessariamente una Persona (può essere promossa soltanto da un'Impresa). Professionista non è un soggetto separato dalla Persona. |
| Imprese | Necessaria | Come sopra, quando il soggetto è un'Impresa. Una Collaborazione Persona↔Persona può non coinvolgere alcuna Impresa. |
| Professionisti | Facoltativa | Quando una Persona partecipa con qualificazione professionale rilevante, o quando si referenzia un Profilo / ServizioProfessionale o un esito autorevole di verifica professionale. Non costituisce un terzo tipo di partecipante. |
| Opportunità | Facoltativa | Origine storica facoltativa e unidirezionale (D22); non incorpora procedura, candidatura a Opportunità, valutazione, assegnazione, requisiti formali o finanziamento dell'Opportunità. |
| Appartenenze | Necessaria (quando applicabile) | Quando una Persona opera per conto di un'Impresa: utilizzo del titolo di rappresentanza / ruolo strutturale / esito di verifica (D23). Collaborazioni può conservare uno snapshot storico minimo del titolo utilizzato, senza possedere la relazione (V10). |
| Mercati Internazionali | Facoltativa | Ambito, obiettivo, requisito, preferenza o contesto territoriale internazionale (D52); non crea Mercati, Presenze o Interessi. |
| Identità & Accessi | Di supporto | Necessaria per ogni azione di scrittura (proporre, accettare, rifiutare, pubblicare, concludere), facoltativa per la sola consultazione pubblica. Non governa i ruoli di business della Collaborazione. |

### Distinzioni concettuali da non confondere

- **Collaborazione** vs. **appartenenza stabile** (V10): i ruoli locali della Collaborazione appartengono a Collaborazioni; i ruoli strutturali Persona–Impresa appartengono ad Appartenenze. Il rappresentante operativo locale non crea una nuova Appartenenza. Se il legame si stabilizza, il fatto stabile appartiene ad Appartenenze; Collaborazioni ne registra al più l'origine storica o lo snapshot del titolo utilizzato.
- **Collaborazione** vs. **rapporto professionale**: Professionista è qualificazione opzionale della Persona partecipante, non terzo soggetto. Un rapporto professionale strutturato appartiene a Professionisti (qualificazione) o ad Appartenenze (se strutturato con un'Impresa); una Collaborazione è il processo collaborativo che può precedere o affiancare tale rapporto, non il rapporto stesso.
- **Collaborazione** vs. **opportunità**: si veda §8; Collaborazioni non assorbe candidatura a Opportunità. `CandidaturaCollaborazione` è fatto locale di Collaborazioni, distinto dalla candidatura al processo di Opportunità.
- **Collaborazione** vs. **Evento pubblico della piattaforma**: un Evento (dominio Eventi) può essere contesto occasionale di una Collaborazione; Collaborazioni non possiede Evento, programma, iscrizione, biglietto, sede o calendario. Gli eventi di dominio di Collaborazioni (fatti avvenuti del processo) non sono Eventi pubblici. La dipendenza Collaborazioni → Eventi resta da valutare al mapping di Eventi e non è censita come riga consolidata.
- **Collaborazione** vs. **semplice contatto**: un contatto informale tra due soggetti, se non formalizzato come proposta o esigenza tracciata dal dominio, non è un fatto di Collaborazioni: resta un'interazione non modellata da alcun dominio sostanziale del progetto.
- **Collaborazione** vs. **contenuto editoriale**: un articolo che descrive una collaborazione avvenuta non trasferisce la proprietà della Collaborazione al dominio editoriale (P5, P10); resta una rappresentazione, non il fatto.
- **Organizzazioni / Servizi (futuri)**: nessuna dipendenza operativa verso domini non ancora formalizzati; associazioni/enti restano riferimenti informativi esterni; ServizioProfessionale si utilizza da Professionisti (D21), non da un dominio Servizi.

---

## 10. Eventi

### Ownership dell'evento

Eventi possiede: la definizione dell'evento (titolo, descrizione, programma), la sua collocazione temporale e di luogo, il proprio ciclo di vita (pianificazione, pubblicazione, svolgimento, conclusione, archiviazione), e il processo di partecipazione (iscrizione, presenza).

### Organizzatori, partecipanti, destinatari

- **Organizzatori**: possono essere Persone o Imprese; Eventi referenzia la loro identità senza incorporarne gli attributi. Se l'organizzatore agisce a nome di un'Impresa, il titolo di rappresentanza è di competenza di Appartenenze (utilizzo).
- **Partecipanti**: Persone (a titolo individuale o come rappresentanti di un'Impresa/Professionista) che si iscrivono o partecipano; Eventi referenzia la loro identità e registra il fatto della partecipazione come proprio dato (l'iscrizione è un fatto di Eventi), ma non diventa proprietario dell'identità del partecipante.
- **Destinatari**: il pubblico a cui l'evento è rivolto (es. "riservato a professionisti del settore X"), espresso come criterio, non come elenco incorporato di soggetti.

### Luoghi

Il luogo dell'evento (fisico o virtuale) è un attributo proprio di Eventi (dove si svolge), distinto dalla Sede di un'Impresa (`SedeImpresa`, dove un'impresa opera stabilmente) e dal Territorio servito da Mercati Internazionali. Un evento può svolgersi nella sede di un'impresa organizzatrice, ma il luogo dell'evento e la sede dell'impresa restano due fatti distinti, l'uno posseduto da Eventi, l'altro da Imprese.

### Collegamenti a imprese, persone, professionisti e opportunità

Eventi può referenziare Imprese e Persone (organizzatori, sponsor, partecipanti), Professionisti (relatori, formatori) e Opportunità (un evento può presentare o generare opportunità, in modo facoltativo e bidirezionale nella navigabilità, non nell'ownership: si veda §20 per l'analisi di questa relazione non circolare).

### Relazione con Contenuti Editoriali

Contenuti Editoriali può narrare un Evento (resoconto, anteprima, intervista ai partecipanti) senza acquisirne la proprietà (P5, P10). La narrazione può sopravvivere alla conclusione dell'evento (S08, storicizzazione), ma resta una rappresentazione distinta dal fatto.

### Relazione con Identità & Accessi

L'iscrizione a un evento richiede, per le azioni di scrittura, l'applicazione dell'accesso da parte di Identità & Accessi (dipendenza di supporto); la consultazione pubblica del programma non necessariamente la richiede.

### Non-automatismo della partecipazione

**La partecipazione a un evento non modifica automaticamente appartenenze, profili professionali o relazioni d'impresa** (P3, principio di non-automatismo). Partecipare a un evento come rappresentante di un'impresa non crea, rinnova o modifica l'Appartenenza sottostante; partecipare come professionista non altera lo stato di verifica del Profilo professionale.

---

## 11. Contenuti Editoriali

### Il dominio come proprietario della rappresentazione, non dei soggetti narrati

Contenuti Editoriali possiede: titolo, corpo testuale, processo di revisione editoriale, stato di pubblicazione, classificazione editoriale (categoria, formato) di ogni contenuto. Non possiede alcuno dei soggetti o fatti che il contenuto narra (P10).

### Riferimenti verso gli altri domini

| Dominio narrato | Cosa può essere narrato | Classificazione |
|---|---|---|
| Persone | Intervista, storia personale (si veda nota su `StoriaPersonale` sotto) | Editoriale o rappresentativa |
| Imprese | Storia d'impresa (`StorieImpresa`), presentazione aziendale | Editoriale o rappresentativa |
| Professionisti | Presentazione di un profilo professionale, intervista | Editoriale o rappresentativa |
| Mercati Internazionali | Approfondimento su un mercato o un'area geo-economica | Editoriale o rappresentativa |
| Opportunità | Segnalazione o presentazione di un'opportunità pubblicata | Editoriale o rappresentativa |
| Collaborazioni | Racconto di una collaborazione avvenuta | Editoriale o rappresentativa |
| Eventi | Resoconto, anteprima, intervista | Editoriale o rappresentativa |
| Osservatorio | Divulgazione narrativa di un indicatore o di un risultato pubblicato | Editoriale o rappresentativa |

### Chiarimenti vincolanti

- **Una storia d'impresa non trasferisce l'impresa al dominio editoriale**: `StorieImpresa` referenzia l'Impresa narrata (R01/R02); l'Impresa resta interamente posseduta da Imprese.
- **Un'intervista non trasferisce la Persona al dominio editoriale**: analogamente, la Persona intervistata resta posseduta da Persone.
- **Un articolo su un evento non trasferisce l'evento**: l'Evento narrato resta posseduto da Eventi.
- **Il contenuto possiede titolo, corpo, revisione, pubblicazione e classificazione editoriale**: questi sono gli unici attributi sostanziali di competenza di Contenuti Editoriali.
- **I soggetti citati mantengono il proprio dominio proprietario**: nessuna eccezione è ammessa, indipendentemente dalla profondità o dall'esclusività della narrazione (es. anche un'intervista esclusiva e approfondita non modifica l'ownership della Persona intervistata).

### La specificità di `StoriaPersonale`

`domain-mapping/persone.md` ha già trattato `StoriaPersonale` come Entity dipendente **posseduta da Persone** (non da Contenuti Editoriali), pur riconoscendo che, dal punto di vista di ricerca e presentazione, può essere trattata come un tipo di contenuto ricercabile insieme ai contenuti editoriali propriamente detti. Questa Dependency Map non altera tale decisione: `StoriaPersonale` resta un'Entity di Persone; Contenuti Editoriali può referenziarla per la propria funzione di ricerca e presentazione aggregata, ma non ne acquisisce la proprietà né la duplica come proprio contenuto. La distinzione operativa è: `StoriaPersonale` è il racconto in prima persona di un individuo sul proprio percorso (posseduto da Persone, come estensione del profilo); un articolo redazionale *su* una persona, scritto dalla redazione, è invece pienamente un contenuto editoriale (posseduto da Contenuti Editoriali, che referenzia la Persona narrata).

---

## 12. Osservatorio

### Ownership del dominio

Osservatorio possiede: indicatori, aggregazioni, serie o letture statistiche, le metodologie con cui sono calcolati, le interpretazioni redazionali dei risultati, le versioni successive di uno stesso risultato (quando la metodologia o i dati sorgente vengono aggiornati), e la provenienza tracciata delle fonti utilizzate.

### Cosa non possiede

Osservatorio non possiede, e non deve mai possedere: Persone, Imprese, Appartenenze, Eventi, Opportunità, Collaborazioni, Professionisti, Mercati Internazionali o qualunque altro fatto sorgente (P9). Ogni indicatore è un dato derivato o aggregato (D05/D06), mai un fatto sostanziale.

### Dipendenze derivative e aggregative

Osservatorio dipende, in modo derivativo o aggregativo, da tutti gli altri dieci domini, nella misura in cui ciascuno costituisce una fonte di dati sorgente per uno o più indicatori (es. numero di Imprese registrate per settore, distribuzione geografica delle Persone, tasso di partecipazione a Eventi, esito delle Opportunità pubblicate). La dipendenza è sempre unidirezionale: i domini sorgente non dipendono da Osservatorio per la propria validità sostanziale (§20, analisi dei cicli).

### Il vincolo sull'incorporazione

**Un indicatore non deve diventare un attributo incorporato del soggetto osservato quando rappresenta un risultato derivato o contestuale.** Ad esempio, un "punteggio di affidabilità" calcolato dall'Osservatorio per un'Impresa non deve essere memorizzato come attributo dell'Impresa stessa: resta un dato posseduto da Osservatorio, che referenzia l'Impresa osservata. Questo vincolo, già anticipato da `domain-mapping/imprese.md` §16 (decisione consolidata 12: "nessun dato calcolato o aggregato è attribuito a Imprese"), è generalizzato qui a tutti gli undici domini.

---

## 13. Identità & Accessi

### Il dominio come capacità di supporto

Identità & Accessi possiede esclusivamente: identità digitale (credenziali, account), autenticazione, l'associazione tra identità digitale e soggetto di dominio, ruoli di accesso, autorizzazioni, eventuali deleghe operative, e lo stato dell'accesso (attivo, sospeso, revocato).

### Cosa non deve possedere

Identità & Accessi non deve possedere: Persona, Impresa, Professionista, Appartenenza, profilo pubblico, contenuti, opportunità o relazioni commerciali (P8). Nessuno di questi concetti è, né deve mai diventare, un attributo o una estensione dell'account.

### Direzione corretta dell'associazione

> L'identità digitale può essere associata a un soggetto di dominio; il soggetto di dominio non è definito dall'identità digitale.

Questo significa che un Account referenzia una Persona (o, in prospettiva, un'Impresa tramite un rappresentante), mai il contrario: Persone, Imprese e gli altri domini sostanziali non contengono alcun riferimento diretto a un Account come parte della propria identità sostanziale. Una Persona esiste, con la propria identità, indipendentemente dal fatto che le sia associato un account attivo (`domain-mapping/persone.md` §5, §9).

### Distinzione tra ruolo di dominio, ruolo relazionale e ruolo di accesso

| Tipo di ruolo | Esempio | Dominio proprietario |
|---|---|---|
| Ruolo di dominio | "Professionista", "Impresa verificata" | Il dominio sostanziale corrispondente (Professionisti, Imprese) |
| Ruolo relazionale | "Fondatore", "Referente", "Amministratore" di un'Impresa | Appartenenze |
| Ruolo di accesso | "Amministratore della piattaforma", "Editor", "Moderatore" | Identità & Accessi |

Questi tre tipi di ruolo non devono essere confusi né unificati in un unico concetto tecnico: un ruolo di accesso (es. "editor dei contenuti") non implica alcun ruolo di dominio o relazionale, e viceversa un ruolo relazionale (es. "amministratore dell'impresa X") non implica automaticamente alcun permesso di accesso al sistema (principio di non-automatismo, P3; si veda anche `domain-model.md` §1, "l'accesso non crea diritti sostanziali").

---

## 14. Tassonomie e Territori condivisi

### Ruolo dei concetti condivisi

`domain-model.md` e `reconciliation-report.md` (§13, domini candidati) prevedono due categorie di concetti condivisi trasversalmente da più domini, senza costituire un dominio sostanziale a sé stante nell'attuale inventario degli undici domini: **Tassonomia condivisa** (settori economici, lingue, competenze, categorie editoriali) e **Territori** (paesi, regioni, aree geografiche).

### Chi li utilizza

- **Tassonomia condivisa**: Persone (competenze, lingue), Imprese (settori, lingue operative), Professionisti (qualificazioni), Eventi (categorie), Contenuti Editoriali (categorie editoriali), Osservatorio (dimensioni di aggregazione).
- **Territori**: Persone (paese di origine), Imprese (sedi), Mercati Internazionali (aree geo-economiche), Eventi (luogo), Osservatorio (dimensione geografica di aggregazione).

### Chi ne governa il significato

Nessuno degli undici domini possiede in modo esclusivo Tassonomia condivisa o Territori: sono catalghi di riferimento trasversali, il cui significato è governato a livello di `domain-model.md` (definizione concettuale) e la cui struttura fisica, secondo `domain-mapping/imprese.md` §24 (aspetto rinviato 14), resta sospesa fino a quando non riceveranno un proprio documento di mapping fisico. Fino a quel momento, ogni dominio che li referenzia (pattern VO03, `02-reference-model.md` §5) tratta le voci del catalogo come identificatori stabili esterni al proprio Aggregate.

### Come evitare copie locali incoerenti

Ogni dominio deve referenziare la voce del catalogo condiviso (VO03) invece di ridefinire localmente un proprio elenco con significato equivalente. `domain-mapping/imprese.md` §6 ha già stabilito la distinzione tra riferimento a Tassonomia condivisa (Settore, Lingua: pattern E02+VO03) ed Elenco controllato locale (Forma organizzativa, Dimensione: pattern C03), quando il criterio di classificazione è specifico del dominio e non condiviso. Questa distinzione — VO03 per ciò che è condiviso, C03/C05 per ciò che è locale — è il criterio generale da applicare in ogni futuro mapping.

### Distinzione tra territorio, sede, mercato, luogo dell'evento e area di operatività

| Concetto | Dominio proprietario | Natura |
|---|---|---|
| Territorio (voce di catalogo) | Condiviso (nessun dominio sostanziale) | Identificatore geografico di riferimento |
| Sede (`SedeImpresa`) | Imprese | Luogo fisico stabile di operatività dell'impresa |
| Mercato | Mercati Internazionali | Area geo-economica di presenza o interesse commerciale |
| Luogo dell'evento | Eventi | Collocazione fisica o virtuale di una singola attività organizzata |
| Area di operatività / territorio servito | Imprese (`ServizioImpresa`) | Estensione geografica in cui un servizio specifico è offerto |

Questa tabella riprende e generalizza la distinzione già introdotta in §6 per Mercati Internazionali, estendendola esplicitamente a Eventi.

### Estensione contestuale di una classificazione condivisa

Un dominio può estendere contestualmente una classificazione condivisa (es. Osservatorio che raggruppa più voci di Settore in una categoria aggregata per un proprio indicatore) senza per questo ridefinire il significato comune della voce originaria: l'estensione è un dato derivato (D05, di proprietà del dominio che la produce), non una modifica del catalogo condiviso.

### Tensioni di ownership segnalate, non risolte

Questo documento segnala, senza risolverle arbitrariamente, le seguenti tensioni già emerse nei documenti letti: l'assenza di un dominio dedicato "Organizzazioni istituzionali" (§5, §7; `reconciliation-report.md` §13) e l'assenza di un dominio dedicato "Servizi" quando riferito a servizi linguistici e di formazione preesistenti nel repository (`reconciliation-report.md` §13). Nessun nuovo dominio è introdotto da questo documento per risolvere tali tensioni.

---

## 15. Matrice canonica delle dipendenze

La matrice elenca ogni coppia di domini per cui esiste una dipendenza concettuale significativa, secondo l'analisi di §4-§14. Non sono compilate le combinazioni prive di alcuna relazione significativa (la maggior parte delle 110 combinazioni ordinate possibili tra undici domini non compare, perché non esiste alcun riferimento diretto tra quei due domini). "Dominio sorgente" è il dominio dipendente (che referenzia); "Dominio destinazione" è il dominio referenziato; quando l'oggetto puntuale della dipendenza ha un proprietario diverso dal dominio destinazione (caso raro, tipicamente per relazioni), è indicato separatamente.

| # | Dominio sorgente | Dominio destinazione | Classificazione | Direzione | Oggetto della dipendenza | Dominio proprietario | Motivazione | Rischio principale | Stato |
|---|---|---|---|---|---|---|---|---|---|
| D1 | Appartenenze | Persone | Necessaria | Appartenenze → Persone | Identità della Persona | Persone | La relazione non esiste senza il soggetto individuale (§5) | Incorporazione implicita degli attributi della Persona | Consolidata |
| D2 | Appartenenze | Imprese | Necessaria | Appartenenze → Imprese | Identità dell'Impresa | Imprese | Come sopra, per il soggetto economico (§5) | Come sopra | Consolidata |
| D3 | Imprese | Appartenenze | Necessaria | Imprese → Appartenenze | Vista di sintesi AppartenenzaImpresa (ruoli, referente) | Appartenenze | Imprese deve poter presentare i propri ruoli collegati senza possederli (§4, §5) | Trattare la vista come normativa invece che di sintesi | Consolidata |
| D4 | Imprese | Tassonomia condivisa | Necessaria | Imprese → Tassonomia condivisa | Settore, Lingua operativa | Condiviso | Classificazione dell'impresa (§14) | Duplicazione locale della tassonomia | Consolidata |
| D5 | Imprese | Territori | Necessaria | Imprese → Territori | Localizzazione della Sede | Condiviso | Identificazione geografica della sede (§14) | Duplicazione locale del catalogo territori | Consolidata |
| D6 | Imprese | Mercati Internazionali | Facoltativa | Imprese → Mercati Internazionali | Relazione MercatoImpresa | Mercati Internazionali | L'impresa può referenziare le proprie presenze di mercato, senza che l'esistenza dell'impresa ne dipenda (§6) | Impresa che duplica localmente la relazione | Consolidata |
| D7 | Mercati Internazionali | Imprese | Necessaria | Mercati Internazionali → Imprese | Identità dell'Impresa che dichiara la presenza/interesse | Imprese | La relazione di mercato non esiste senza un'impresa dichiarante, quando il dichiarante è un'impresa (§6) | Incorporazione implicita degli attributi dell'impresa | Consolidata |
| D8 | Mercati Internazionali | Persone | Necessaria | Mercati Internazionali → Persone | Identità della Persona dichiarante | Persone | Come sopra, quando il dichiarante è una persona a titolo individuale (§6) | Come sopra | Consolidata |
| D9 | Mercati Internazionali | Appartenenze | Necessaria (quando applicabile) | Mercati Internazionali → Appartenenze | Titolo con cui una Persona dichiara per conto di un'Impresa | Appartenenze | Verifica del titolo di rappresentanza (§6) | Bypassare la verifica del titolo | Provvisoria — da confermare in `domain-mapping/mercati-internazionali.md` |
| D10 | Professionisti | Persone | Necessaria | Professionisti → Persone | Identità della Persona | Persone | Il Profilo professionale non esiste senza una Persona sottostante (§4, §7) | Professionista trattato come soggetto autonomo | Consolidata |
| D11 | Professionisti | Imprese | Facoltativa | Professionisti → Imprese | Contesto organizzativo dichiarato | Imprese | Arricchisce l'offerta professionale, non è indispensabile (§7) | Incorporazione del rapporto professionale nell'Impresa | Consolidata |
| D12 | Professionisti | Appartenenze | Facoltativa | Professionisti → Appartenenze | Esito di esistenza/verifica dell'Appartenenza (utilizzo) | Appartenenze | Utilizzo contestuale dell'esito, non riferimento sostanziale alla relazione (§7; `domain-mapping/professionisti.md`) | Duplicazione o verifica autonoma del rapporto già tracciato da Appartenenze | Consolidata |
| D13 | Professionisti | Mercati Internazionali | Facoltativa | Professionisti → Mercati Internazionali | Mercato conosciuto/servito (riferimento opaco) | Mercati Internazionali | Arricchisce l'offerta, non indispensabile; non crea Presenza/Interesse (§7; `domain-mapping/professionisti.md`) | Duplicazione locale del catalogo o della relazione di mercato | Consolidata |
| D14 | Opportunità | Persone | Necessaria | Opportunità → Persone | Identità opaca di soggetti che agiscono, partecipano o sono registrati (promotore, pubblicatore, candidato, beneficiario, ecc.) | Persone | Il fatto di piattaforma richiede almeno un soggetto referenziabile (§8; `domain-mapping/opportunita.md`) | Incorporazione di identità, profilo o qualificazioni (V8) | Consolidata |
| D15 | Opportunità | Imprese | Necessaria | Opportunità → Imprese | Identità opaca di imprese promotrici, destinatarie, candidate, assegnatarie o collegate | Imprese | Come sopra, quando il soggetto è un'Impresa (§8; `domain-mapping/opportunita.md`) | Duplicazione di identità o caratteristiche autorevoli (V8) | Consolidata |
| D16 | Opportunità | Professionisti | Facoltativa | Opportunità → Professionisti | Qualificazione / Profilo / ServizioProfessionale come requisito o contesto | Professionisti | Non tutte le opportunità richiedono una qualificazione specifica; Professionista non è soggetto autonomo (§8; `domain-mapping/opportunita.md`) | Possesso di qualifiche, verifiche professionali o erogazione del servizio; ciclo con Professionisti | Consolidata |
| D17 | Opportunità | Appartenenze | Necessaria (quando applicabile) | Opportunità → Appartenenze | Titolo di rappresentanza / ruolo strutturale utilizzato (utilizzo) | Appartenenze | Quando una Persona agisce per un'Impresa (pubblicazione, candidatura, assegnazione); ammesse snapshot storiche minime non autoritative (§8; `domain-mapping/opportunita.md`) | Creare/modificare Appartenenze, duplicarne lo stato o usare lo snapshot come autorità corrente | Consolidata |
| D18 | Opportunità | Mercati Internazionali | Facoltativa | Opportunità → Mercati Internazionali | Paese, area, territorio o mercato obiettivo / contesto | Mercati Internazionali | Arricchimento non indispensabile al nucleo azionabile (§8; `domain-mapping/opportunita.md`) | Possesso di PresenzaInternazionale, InteresseMercato, EsperienzaInternazionale o catalogo geopolitico | Consolidata |
| D19 | Collaborazioni | Persone | Necessaria | Collaborazioni → Persone | Identità di promotore o partecipante individuale | Persone | Il dominio deve poter referenziare Persone; ogni Collaborazione ha almeno un soggetto (Persona e/o Impresa); non ogni istanza ha una Persona (§9; `domain-mapping/collaborazioni.md`) | Incorporazione degli attributi del soggetto; Professionista trattato come soggetto distinto | Consolidata |
| D20 | Collaborazioni | Imprese | Necessaria | Collaborazioni → Imprese | Identità di promotore o partecipante impresa | Imprese | Come sopra, quando il soggetto è un'Impresa; una Collaborazione Persona↔Persona può non coinvolgere Imprese (§9; `domain-mapping/collaborazioni.md`) | Incorporazione degli attributi del soggetto | Consolidata |
| D21 | Collaborazioni | Professionisti | Facoltativa | Collaborazioni → Professionisti | Profilo professionale / ServizioProfessionale / esito di verifica professionale | Professionisti | Qualificazione facoltativa della Persona partecipante; non terzo tipo di soggetto (§9; `domain-mapping/collaborazioni.md`) | Creare Profili, verificare autonomamente qualifiche, o trattare Professionista come partecipante autonomo | Consolidata |
| D22 | Collaborazioni | Opportunità | Facoltativa | Collaborazioni → Opportunità | Origine storica da un'opportunità | Opportunità | Riferimento storico unidirezionale, facoltativo, non proprietario e non necessario all'esistenza della Collaborazione; non incorpora candidatura/esito/procedura (§8, §9, §20; `domain-mapping/opportunita.md`) | Ownership inversa Opportunità → Collaborazioni; trasformazione automatica; possesso di lifecycle/stato delle Collaborazioni derivate | Consolidata |
| D23 | Collaborazioni | Appartenenze | Necessaria (quando applicabile) | Collaborazioni → Appartenenze | Titolo di rappresentanza / ruolo strutturale utilizzato (utilizzo) | Appartenenze | Utilizzo dell'esito autorevole quando una Persona opera per un'Impresa; ammesse snapshot storico minimo (§9, V10) | Assorbire Appartenenze o duplicarne la verifica (V10) | Consolidata |
| D24 | Eventi | Persone | Necessaria | Eventi → Persone | Identità di organizzatore o partecipante | Persone | L'evento coinvolge sempre soggetti (§10) | Incorporazione degli attributi del soggetto | Consolidata |
| D25 | Eventi | Imprese | Necessaria | Eventi → Imprese | Identità di organizzatore o sponsor | Imprese | Come sopra (§10) | Come sopra | Consolidata |
| D26 | Eventi | Professionisti | Facoltativa | Eventi → Professionisti | Relatori, formatori | Professionisti | Non tutti gli eventi coinvolgono professionisti qualificati (§10) | Confusione tra ruolo evento e qualificazione professionale | Consolidata |
| D27 | Eventi | Opportunità | Facoltativa | Eventi → Opportunità | Presentazione o generazione di opportunità | Opportunità | Arricchimento non indispensabile, relazione non circolare (§10, §20) | Trasformazione automatica non giustificata | Provvisoria |
| D28 | Eventi | Appartenenze | Necessaria (quando applicabile) | Eventi → Appartenenze | Titolo di rappresentanza dell'organizzatore impresa | Appartenenze | Verifica del titolo (§10) | Bypassare la verifica | Provvisoria |
| D29 | Eventi | Mercati Internazionali | Facoltativa | Eventi → Mercati Internazionali | Contestualizzazione internazionale dell'evento | Mercati Internazionali | Arricchimento non indispensabile (§10) | Duplicazione locale | Provvisoria |
| D30 | Contenuti Editoriali | Persone | Editoriale o rappresentativa | Contenuti Editoriali → Persone | Soggetto narrato (intervista) | Persone | Rappresentazione senza ownership (§11) | Incorporazione implicita del soggetto narrato | Consolidata |
| D31 | Contenuti Editoriali | Imprese | Editoriale o rappresentativa | Contenuti Editoriali → Imprese | Soggetto narrato (StorieImpresa) | Imprese | Come sopra (§11) | Come sopra | Consolidata |
| D32 | Contenuti Editoriali | Professionisti | Editoriale o rappresentativa | Contenuti Editoriali → Professionisti | Soggetto narrato | Professionisti | Come sopra (§11) | Come sopra | Provvisoria |
| D33 | Contenuti Editoriali | Mercati Internazionali | Editoriale o rappresentativa | Contenuti Editoriali → Mercati Internazionali | Soggetto narrato | Mercati Internazionali | Come sopra (§11) | Come sopra | Provvisoria |
| D34 | Contenuti Editoriali | Opportunità | Editoriale o rappresentativa | Contenuti Editoriali → Opportunità | Soggetto narrato | Opportunità | Come sopra (§11) | Come sopra | Provvisoria |
| D35 | Contenuti Editoriali | Collaborazioni | Editoriale o rappresentativa | Contenuti Editoriali → Collaborazioni | Soggetto narrato | Collaborazioni | Come sopra (§11) | Come sopra | Provvisoria |
| D36 | Contenuti Editoriali | Eventi | Editoriale o rappresentativa | Contenuti Editoriali → Eventi | Soggetto narrato | Eventi | Come sopra (§11) | Come sopra | Provvisoria |
| D37 | Contenuti Editoriali | Osservatorio | Editoriale o rappresentativa | Contenuti Editoriali → Osservatorio | Indicatore o risultato pubblicato divulgato narrativamente | Osservatorio | Divulgazione senza ownership del dato derivato (§11, §12) | Trattare la divulgazione come nuova fonte primaria | Provvisoria |
| D38 | Osservatorio | Persone | Derivativa | Osservatorio → Persone | Fatti sorgente per indicatori demografici/di profilo | Persone | Aggregazione senza ownership dei fatti sorgente (§12) | Indicatore incorporato come attributo della Persona | Consolidata |
| D39 | Osservatorio | Imprese | Derivativa | Osservatorio → Imprese | Fatti sorgente per indicatori economici | Imprese | Come sopra (§12) | Come sopra | Consolidata |
| D40 | Osservatorio | Appartenenze | Derivativa | Osservatorio → Appartenenze | Fatti sorgente per indicatori relazionali | Appartenenze | Come sopra (§12) | Come sopra | Provvisoria |
| D41 | Osservatorio | Mercati Internazionali | Derivativa | Osservatorio → Mercati Internazionali | Fatti sorgente per indicatori di internazionalizzazione | Mercati Internazionali | Come sopra (§12) | Come sopra | Provvisoria |
| D42 | Osservatorio | Opportunità | Derivativa | Osservatorio → Opportunità | Fatti sorgente per indicatori di esito | Opportunità | Come sopra (§12) | Come sopra | Provvisoria |
| D43 | Osservatorio | Collaborazioni | Derivativa | Osservatorio → Collaborazioni | Fatti sorgente per indicatori relazionali | Collaborazioni | Come sopra (§12) | Come sopra | Provvisoria |
| D44 | Osservatorio | Professionisti | Derivativa | Osservatorio → Professionisti | Fatti sorgente per indicatori di offerta professionale | Professionisti | Come sopra (§12) | Come sopra | Provvisoria |
| D45 | Osservatorio | Eventi | Derivativa | Osservatorio → Eventi | Fatti sorgente per indicatori di partecipazione | Eventi | Come sopra (§12) | Come sopra | Provvisoria |
| D46 | Identità & Accessi | Persone | Di supporto | Identità & Accessi → Persone | Associazione account-soggetto | Persone | Applicazione dell'accesso, non definizione del soggetto (§13) | Identità & Accessi che definisce il soggetto | Consolidata |
| D47 | Identità & Accessi | Imprese | Di supporto | Identità & Accessi → Imprese | Associazione account-rappresentante | Imprese | Come sopra (§13) | Come sopra | Consolidata |
| D48 | Identità & Accessi | (ciascuno degli altri 8 domini) | Di supporto | Identità & Accessi → dominio | Applicazione dei permessi di scrittura | Il dominio stesso | Capacità trasversale, non determina il significato del dominio servito (§13) | Identità & Accessi che assorbe logica di dominio | Consolidata |
| D49 | (ciascuno degli 11 domini) | Identità & Accessi | Di supporto (in direzione inversa) | dominio → Identità & Accessi | Verifica dell'accesso per ogni azione di scrittura | Identità & Accessi | Necessaria per la scrittura, facoltativa per la sola consultazione pubblica (§13) | Bypassare il controllo di accesso | Consolidata |
| D50 | Persone | Tassonomia condivisa | Necessaria | Persone → Tassonomia condivisa | Competenza, Lingua | Condiviso | Classificazione della persona (§14) | Duplicazione locale | Consolidata |
| D51 | Persone | Territori | Facoltativa | Persone → Territori | Paese di origine | Condiviso | Attributo descrittivo, non indispensabile all'identità (§14) | Deduzione automatica verso mercati o competenze | Consolidata |
| D52 | Collaborazioni | Mercati Internazionali | Facoltativa | Collaborazioni → Mercati Internazionali | Mercato come ambito/obiettivo/contesto | Mercati Internazionali | Riferimento facoltativo non proprietario; non crea Presenza/Interesse (§9; `domain-mapping/collaborazioni.md`) | Incorporazione del catalogo o delle relazioni di mercato | Consolidata |

La matrice non compila deliberatamente le combinazioni prive di relazione significativa (es. Persone→Eventi come dominio destinazione diretto — è Eventi che referenzia Persone, non viceversa; Imprese→Collaborazioni; Identità & Accessi→Osservatorio). L'assenza di una riga per una coppia non elencata non è un'omissione: è la conferma che nessuna dipendenza concettuale rilevante lega quei due domini in quella direzione. Le dipendenze esplicitamente vietate (§19) non sono incluse in questa matrice perché, per definizione, non devono esistere: sono trattate separatamente.

---

## 16. Dipendenze necessarie

Catalogo severo: sono incluse soltanto le dipendenze senza le quali il dominio dipendente non potrebbe esprimere correttamente il proprio nucleo. Le dipendenze "necessarie quando applicabile" (che dipendono da una condizione, es. il promotore è un'impresa) sono incluse perché, quando la condizione si verifica, la dipendenza è realmente indispensabile — non perché sia frequente.

| Dominio dipendente | Dominio proprietario | Concetto referenziato | Motivo della necessità | Effetto dell'indisponibilità | Limite della dipendenza | Rischio di trasformazione impropria in ownership condivisa |
|---|---|---|---|---|---|---|
| Appartenenze | Persone | Identità della Persona | Una relazione non può esistere senza almeno un soggetto individuato | La relazione non potrebbe essere creata né identificata | Solo riferimento all'identità; nessun attributo della Persona è letto o copiato oltre l'identificazione | Appartenenze che inizia a memorizzare attributi personali (nome, contatti) invece del solo riferimento |
| Appartenenze | Imprese | Identità dell'Impresa | Come sopra, per il soggetto economico | Come sopra | Come sopra | Come sopra, per attributi dell'impresa |
| Imprese | Appartenenze | Vista di sintesi dei ruoli collegati | Imprese deve poter mostrare ruoli e referenti senza possederli | Imprese non potrebbe presentare la propria compagine senza duplicare dati altrove | La vista è di sintesi, non normativa: in caso di conflitto prevale sempre Appartenenze | Imprese che tratta la propria vista come fonte autorevole invece che come proiezione |
| Imprese, Persone, Professionisti, Eventi, Osservatorio | Tassonomia condivisa | Voci di catalogo (settore, lingua, competenza, categoria) | La classificazione non ha senso senza un vocabolario comune e stabile | Ogni dominio dovrebbe definire e mantenere il proprio vocabolario, con rischio di incoerenza terminologica | Solo riferimento alla voce; il significato della voce resta di competenza del catalogo condiviso | Un dominio che ridefinisce localmente il significato di una voce condivisa |
| Imprese, Mercati Internazionali, Eventi | Territori | Identificatori geografici | La localizzazione non ha senso senza un catalogo territoriale comune | Ogni dominio dovrebbe definire la propria geografia, con rischio di incoerenza | Solo riferimento; nessuna duplicazione della struttura amministrativa dei territori | Un dominio che introduce una propria tassonomia geografica parallela |
| Mercati Internazionali | Imprese o Persone | Identità del soggetto dichiarante | Una presenza o interesse di mercato non esiste senza un dichiarante | La relazione non potrebbe essere attribuita ad alcun soggetto | Solo riferimento all'identità del dichiarante | Mercati Internazionali che incorpora attributi sostanziali del dichiarante |
| Professionisti | Persone | Identità della Persona | Il Profilo professionale è una specializzazione che non esiste senza la Persona sottostante | Il profilo professionale non potrebbe essere creato | Solo riferimento; gli attributi del profilo personale generico restano di Persone | Professionisti che duplica attributi del profilo personale invece di referenziarli |
| Opportunità, Collaborazioni, Eventi | Persone, Imprese | Identità di promotore, beneficiario, organizzatore, partecipante | Il processo o l'attività non esiste senza almeno un soggetto che lo promuove o vi partecipa | Il fatto non potrebbe essere attribuito ad alcun soggetto | Solo riferimento; nessuna incorporazione di attributi sostanziali del soggetto | Il dominio che inizia a trattare il soggetto come proprio (es. una "reputazione" memorizzata localmente) |
| Opportunità, Collaborazioni, Eventi (quando il promotore è un'impresa) | Appartenenze | Titolo di rappresentanza | Senza la verifica del titolo, non è possibile stabilire se chi agisce a nome di un'impresa sia legittimato a farlo | Rischio di azioni non autorizzate a nome di un'impresa | Solo utilizzo del fatto già verificato da Appartenenze; nessuna verifica autonoma parallela | Il dominio che introduce una propria logica di verifica del titolo, duplicando quella di Appartenenze |
| Tutti gli 11 domini (per ogni azione di scrittura) | Identità & Accessi | Applicazione dell'accesso | Nessuna azione di scrittura può avvenire senza un'identità autenticata e autorizzata | L'azione di scrittura non potrebbe essere attribuita né controllata | Solo applicazione del controllo; il significato dell'azione resta del dominio che la esegue | Identità & Accessi che inizia a decidere il significato di dominio delle azioni che autorizza |

Ogni riga di questo catalogo rappresenta un vincolo strutturale stabile: la sua rimozione comprometterebbe la validità del dominio dipendente, non soltanto la sua ricchezza informativa.

---

## 17. Dipendenze facoltative

Catalogo delle dipendenze la cui assenza lascia il nucleo del dominio dipendente pienamente valido.

| Dominio dipendente | Dominio referenziato | Valore aggiunto | Assenza di impatto sul core | Evoluzione temporale possibile | Rischio di accoppiamento | Comportamento concettuale in assenza del dominio collegato |
|---|---|---|---|---|---|---|
| Imprese | Mercati Internazionali | Contestualizza l'impresa rispetto alla propria presenza internazionale | Un'Impresa resta valida e completa senza alcuna presenza di mercato dichiarata | Le presenze di mercato possono essere aggiunte o rimosse in qualunque momento senza alcun effetto sull'Impresa | Basso: la relazione è unidirezionale e facoltativa (§6) | L'Impresa continua a esistere e a essere presentabile con le sole informazioni proprie (§3-§8 di `imprese.md`) |
| Professionisti | Imprese | Contesto organizzativo dell'offerta professionale | Il Profilo professionale resta valido senza alcun contesto organizzativo dichiarato | Il contesto può cambiare nel tempo senza richiedere alcuna migrazione strutturale | Basso: riferimento facoltativo, non incorporante (§7) | Il profilo resta presentabile come offerta individuale |
| Professionisti | Mercati Internazionali | Territori o mercati serviti dal professionista | Il profilo resta valido senza alcuna dichiarazione di mercato | Può essere aggiunta in qualunque momento | Basso | Il profilo resta presentabile senza dimensione internazionale |
| Opportunità | Professionisti | Qualificazione professionale richiesta | Un'Opportunità può esistere senza richiedere alcuna qualificazione specifica | Il requisito può essere aggiunto o rimosso senza alterare la possibilità azionabile | Basso | L'Opportunità resta aperta a chiunque soddisfi i requisiti non professionali |
| Opportunità, Eventi | Mercati Internazionali | Contestualizzazione internazionale | Il nucleo della possibilità o dell'attività non richiede alcun mercato di riferimento | Può essere aggiunta successivamente | Basso | Il fatto resta valido come puramente locale o generico |
| Professionisti | Appartenenze | Utilizzo dell'esito di esistenza/verifica di un'Appartenenza per contestualizzare l'offerta | Il Profilo professionale resta valido senza alcuna Appartenenza | L'utilizzo può apparire o cessare senza alterare il Profilo | Basso, se non trasformato in possesso della relazione | Il profilo resta presentabile senza contesto organizzativo strutturato |
| Collaborazioni | Professionisti | Qualificazione professionale coinvolta (Profilo / ServizioProfessionale) | Una Collaborazione può esistere senza specificare una qualificazione; Professionista non è terzo partecipante | Come sopra | Basso | La proposta resta aperta a soggetti non qualificati professionalmente |
| Collaborazioni | Opportunità | Origine storica da un'opportunità | Una Collaborazione può nascere indipendentemente da qualunque Opportunità pregressa | La provenienza, se presente, resta un dato storico immutabile | Basso, se non trasformata in ownership inversa o ciclo di autorità | La Collaborazione resta valida come fatto autonomo; Opportunità può aggregare Collaborazioni derivate solo in modo non autorevole |
| Collaborazioni | Mercati Internazionali | Ambito, obiettivo o contesto internazionale | Una Collaborazione resta valida senza alcun mercato di riferimento | Può essere aggiunto o rimosso senza effetto sul nucleo del processo | Basso | La Collaborazione resta presentabile come puramente locale o generica |
| Eventi | Professionisti | Relatori o formatori qualificati | Un evento può svolgersi senza relatori con un profilo professionale registrato sulla piattaforma | Il collegamento può essere aggiunto in fase di programmazione | Basso | L'evento resta organizzabile e pubblicabile |
| Eventi | Opportunità | Presentazione o generazione di un'opportunità collegata | Un evento resta valido senza generare alcuna opportunità | Il collegamento può nascere durante o dopo l'evento | Basso, purché non automatico (§10, §20) | L'evento resta un fatto compiuto in sé |
| Persone | Territori | Paese di origine | L'identità della Persona resta valida senza dichiarare un paese di origine | L'attributo può essere aggiunto, modificato o rimosso senza alcun effetto su altri domini | Basso, purché non usato per deduzioni automatiche (§6, principio di non-automatismo) | Il profilo resta presentabile e valido |

---

## 18. Dipendenze derivative, editoriali e di supporto

### Dipendenze derivative dell'Osservatorio

Tutte le righe D38-D45 della matrice (§15) sono derivative: Osservatorio utilizza fatti posseduti da Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti ed Eventi per produrre indicatori e aggregazioni proprie. Non trasferiscono ownership perché il dato derivato (l'indicatore) è concettualmente distinto dal fatto sorgente: il fatto sorgente continua a esistere, a evolvere e a essere modificabile esclusivamente dal proprio dominio proprietario, indipendentemente da quante volte sia stato utilizzato per produrre un indicatore (P6, P9).

### Dipendenze editoriali di Contenuti Editoriali

Tutte le righe D30-D37 della matrice sono editoriali o rappresentative: Contenuti Editoriali narra soggetti e fatti posseduti da Persone, Imprese, Professionisti, Mercati Internazionali, Opportunità, Collaborazioni, Eventi e Osservatorio. Non trasferiscono ownership perché la narrazione è una rappresentazione — un punto di vista redazionale su un fatto — non il fatto stesso (P5, P10). Anche una narrazione esclusiva, autorevole o ufficiale non altera questa regola.

### Dipendenze di supporto di Identità & Accessi

Le righe D46-D49 sono di supporto, nelle due direzioni: Identità & Accessi applica l'accesso a tutti gli altri domini (D46-D48) e, simmetricamente, ogni dominio dipende da Identità & Accessi per l'applicazione dell'accesso alle proprie azioni di scrittura (D49). Non trasferiscono ownership perché l'accesso è una funzione trasversale di controllo, non una componente del significato di dominio (P8, P12).

### Altre dipendenze rappresentative

Non sono state identificate ulteriori dipendenze rappresentative oltre a quelle di Contenuti Editoriali. La riga D9/D17/D23/D28 (utilizzo del titolo di rappresentanza da parte di Appartenenze) non è rappresentativa ma di **utilizzo** (si veda la definizione in apertura): il dominio che utilizza il titolo non rappresenta né narra l'Appartenenza, la consulta soltanto per una decisione locale (autorizzare o non autorizzare un'azione).

### Perché queste dipendenze non trasferiscono ownership

In tutti e tre i casi, il dominio dipendente produce o utilizza qualcosa di **proprio** (un indicatore, un contenuto editoriale, una decisione di accesso) a partire da un fatto **altrui**, senza mai modificare, ridefinire o duplicare il fatto sorgente. La distinzione tra "usare un fatto per fare qualcosa di proprio" e "possedere il fatto" è il criterio unico che regge queste tre categorie (definizioni di Derivazione, Pubblicazione e Utilizzo, in apertura del documento).

---

## 19. Dipendenze vietate

| # | Dipendenza valutata | Rischio | Violazione prodotta | Alternativa concettuale corretta | Principi/convenzioni protetti |
|---|---|---|---|---|---|
| V1 | Persone → Identità & Accessi come fonte del significato della Persona | La Persona verrebbe definita dal proprio account invece che dalla propria identità sostanziale | Inversione di ownership (P8, P12); confusione tra soggetto di dominio e identità digitale | Identità & Accessi referenzia la Persona (D46); la Persona non referenzia né dipende dall'Account per la propria validità | P8, P12; `domain-mapping/persone.md` §5, §9 |
| V2 | Imprese → Appartenenze come dati incorporati (soci, amministratori, referenti come attributi propri) | Duplicazione dei dati e perdita della fonte autorevole unica; ciclo di vita della relazione confuso con quello dell'impresa | Violazione del Single Owner (P1) e della regola "impresa e relazioni" (P4, P11) | Imprese mantiene solo la vista di sintesi non normativa (D3); la fonte autorevole resta Appartenenze | P1, P4, P11; `domain-mapping/imprese.md` §1, §9 |
| V3 | Imprese → Mercati Internazionali come proprietà locale di `MercatoImpresa` | Duplicazione della relazione di mercato in due domini; incoerenza in caso di aggiornamento | Violazione del Single Owner (P1); inversione della decisione consolidata D2 di `domain-mapping/imprese.md` | Imprese referenzia la relazione (D6) senza possederla; Mercati Internazionali resta proprietario esclusivo | P1; `domain-mapping/imprese.md` §2, §10, §19 |
| V4 | Imprese → Professionisti come componenti interne | Il rapporto professionale verrebbe incorporato nell'Impresa, confondendo qualificazione individuale e struttura d'impresa | Violazione di P4, P11; perdita dell'autonomia del ciclo di vita del Profilo professionale | Il rapporto, se strutturato, appartiene ad Appartenenze; se occasionale, a Collaborazioni od Opportunità (§7) | P1, P4, P11 |
| V5 | Contenuti Editoriali → soggetti narrati come proprietà | Il dominio editoriale diventerebbe proprietario di Persone, Imprese o altri soggetti narrati | Violazione di P5, P10; perdita del Single Owner | Contenuti Editoriali referenzia il soggetto narrato senza incorporarne gli attributi (D30-D36) | P5, P10; `contenuti-editoriali.md` §9 |
| V6 | Osservatorio → fatti sorgente come proprietà | L'indicatore derivato verrebbe scambiato per il fatto originario, o memorizzato come suo attributo | Violazione di P6, P9; perdita di tracciabilità della derivazione | Osservatorio produce indicatori distinti, con provenienza tracciata (D38-D45) | P6, P9; `osservatorio.md` §7 |
| V7 | Identità & Accessi → profili di dominio (definizione sostanziale di Persona, Impresa, Professionista) | Identità & Accessi assorbirebbe la responsabilità sostanziale di altri domini | Violazione di P8; confusione tra identità digitale e soggetto di dominio | Identità & Accessi applica solo l'accesso (D46-D49); ogni profilo resta di competenza del proprio dominio | P8, P12; `identita-accessi.md` §1, §12 |
| V8 | Opportunità → imprese o persone come proprietà (es. reputazione o valutazione permanente incorporata) | Opportunità assorbirebbe attributi sostanziali dei soggetti coinvolti | Violazione di P1, P4 | Opportunità referenzia i soggetti in modo opaco (D14/D15) senza incorporarne attributi valutativi permanenti (§8; `domain-mapping/opportunita.md`) | P1, P4 |
| V9 | Eventi → partecipanti come componenti del proprio aggregate | La partecipazione verrebbe confusa con l'identità del partecipante | Violazione di P4; perdita di autonomia del ciclo di vita del partecipante | Eventi registra il fatto della partecipazione referenziando l'identità del partecipante (§10) | P4 |
| V10 | Collaborazioni → assorbimento di Appartenenze (trattare ruoli strutturali Persona–Impresa, titolarità o rappresentanza come fatti propri, o creare Appartenenze dal processo collaborativo) | Confusione tra ruoli locali della Collaborazione e relazione strutturale stabile; duplicazione di ownership | Violazione di P1; sovrapposizione di ownership con Appartenenze | I ruoli locali appartengono a Collaborazioni; i ruoli strutturali Persona–Impresa restano di Appartenenze; il rappresentante operativo locale non crea una nuova Appartenenza; il titolo utilizzato può essere registrato come snapshot storico minimo, con autorità sulla relazione in Appartenenze (D23, utilizzo; §9) | P1, P4 |
| V11 | Tassonomie locali duplicate e divergenti (un dominio che ridefinisce localmente una voce di Tassonomia condivisa o di Territori) | Incoerenza terminologica e geografica tra domini | Violazione di P1, P2; perdita di comprensibilità (`04-quality-attributes.md`) | Ogni dominio referenzia la voce condivisa (VO03); un'estensione contestuale resta un dato derivato locale, non una ridefinizione (§14) | P1, P2 |
| V12 | Derivazioni che sovrascrivono i dati sorgente (un indicatore che modifica retroattivamente il fatto da cui è derivato) | Perdita di tracciabilità e di integrità storica del fatto sorgente | Violazione di P6; violazione del principio di continuità storica (`domain-model.md` §1) | La derivazione produce un nuovo dato, tracciabile, senza mai modificare il dato sorgente (§12, §18) | P6; `domain-model.md` §1 |

Per ciascuna riga, il "principio o convenzione protetto" è la ragione ultima per cui la dipendenza resta vietata anche qualora risultasse, in un momento futuro, tecnicamente conveniente da implementare: la convenienza implementativa non è mai un criterio sufficiente per autorizzare una dipendenza vietata (P1-P12).

---

## 20. Analisi dei cicli

Una relazione navigabile in entrambe le direzioni non è automaticamente un ciclo di dipendenza: lo è soltanto se comporta un'ambiguità di ownership o un obbligo reciproco di validazione. Ogni caso seguente distingue relazione reciproca da dipendenza circolare.

| Sequenza analizzata | Relazione reciproca o ciclo di ownership? | Ownership corretta | Direzione canonica | Stato del ciclo |
|---|---|---|---|---|
| Persone ↔ Imprese ↔ Appartenenze | Nessun ciclo: non esiste alcun riferimento diretto Persone→Imprese né Imprese→Persone. Il collegamento passa sempre attraverso Appartenenze, che possiede la relazione | Appartenenze possiede il legame; Persone e Imprese possiedono solo la propria identità | Appartenenze → Persone; Appartenenze → Imprese; Imprese → Appartenenze (solo per la vista di sintesi, D3) | **Eliminato** — mediato strutturalmente da un terzo dominio proprietario; nessuna ambiguità residua |
| Imprese ↔ Mercati Internazionali | Relazione apparente: Imprese referenzia la relazione di mercato (D6, facoltativa) e Mercati Internazionali referenzia l'identità dell'impresa dichiarante (D7, necessaria). Le due direzioni riguardano oggetti diversi (la relazione da un lato, l'identità dall'altro), non lo stesso fatto conteso | Mercati Internazionali possiede la relazione; Imprese possiede solo la propria identità | Mercati Internazionali → Imprese (per l'identità); Imprese → Mercati Internazionali (per il riferimento facoltativo alla relazione) | **Apparente, già governato** — decisione consolidata D2 di `domain-mapping/imprese.md` (§2, §10, §19), qui recepita in via definitiva |
| Imprese ↔ Professionisti | Nessun ciclo: la dipendenza è unidirezionale (Professionisti → Imprese, D11, facoltativa). Imprese non ha alcuna dipendenza dichiarata verso Professionisti | Ciascun dominio possiede il proprio nucleo; nessuna relazione di proprietà incrociata | Professionisti → Imprese | **Eliminato** — assenza di dipendenza in senso inverso |
| Opportunità ↔ Collaborazioni | Nessun ciclo strutturale: Collaborazioni può facoltativamente referenziare un'Opportunità di origine (D22, consolidata); Opportunità non introduce dipendenza autorevole verso Collaborazioni. Eventuale navigazione/aggregazione/pubblicazione inversa non trasferisce proprietà né lifecycle | Ciascun dominio possiede il proprio processo; l'origine storica non implica proprietà reciproca; candidatura a Opportunità ≠ CandidaturaCollaborazione | Collaborazioni → Opportunità (solo per l'origine storica, facoltativa) | **Eliminato** — ciclo reale escluso: unidirezionale sul piano dell'autorità (§8–§9; `domain-mapping/collaborazioni.md`; `domain-mapping/opportunita.md`) |
| Collaborazioni ↔ Professionisti | Nessun ciclo: sola dipendenza Collaborazioni → Professionisti (D21, facoltativa). Professionisti non dipende da Collaborazioni | Professionisti possiede Profilo/qualifiche; Collaborazioni possiede il processo e i ruoli locali | Collaborazioni → Professionisti | **Eliminato** — assenza di dipendenza inversa consolidata |
| Collaborazioni ↔ Appartenenze | Nessun ciclo: sola dipendenza di utilizzo Collaborazioni → Appartenenze (D23, quando applicabile). Appartenenze non dipende da Collaborazioni | Appartenenze possiede la relazione strutturale; Collaborazioni utilizza il titolo e conserva al più uno snapshot | Collaborazioni → Appartenenze (utilizzo) | **Eliminato** — protetto anche da V10 |
| Eventi ↔ Contenuti Editoriali | Nessun ciclo: Contenuti Editoriali referenzia Eventi per la narrazione (D36, editoriale); Eventi non referenzia mai Contenuti Editoriali | Eventi possiede l'evento; Contenuti Editoriali possiede solo la propria rappresentazione | Contenuti Editoriali → Eventi | **Eliminato** — dipendenza unidirezionale, coerente con P5/P10 |
| Domini sorgente (tutti) ↔ Osservatorio | Nessun ciclo: Osservatorio dipende da tutti gli altri dieci domini per i dati sorgente (D38-D45); nessun dominio sorgente dipende da Osservatorio per la propria validità sostanziale | Ogni dominio sorgente possiede i propri fatti; Osservatorio possiede solo gli indicatori derivati | Domini sorgente → Osservatorio (mai il contrario) | **Eliminato** — dipendenza strutturalmente unidirezionale (P6, P9) |
| Soggetti di dominio (tutti) ↔ Identità & Accessi | Relazione bidirezionale per natura, ma su piani diversi: ogni dominio dipende da Identità & Accessi per l'applicazione dell'accesso alle proprie scritture (D49); Identità & Accessi dipende da ogni dominio per sapere a quale soggetto è associato un account (D46-D48) | Identità & Accessi possiede l'accesso; ogni dominio possiede il proprio soggetto | Identità & Accessi → soggetto (per l'associazione); soggetto/dominio → Identità & Accessi (per l'applicazione dell'accesso) | **Governato** — le due direzioni riguardano piani distinti (identità vs. autorizzazione) esplicitamente separati da P8/P12; non è un ciclo di ownership sullo stesso fatto |
| Eventi ↔ Opportunità (caso aggiuntivo, già segnalato da `reconciliation-report.md` §11.2) | Relazione apparente: Eventi può referenziare Opportunità (D27, ancora provvisoria). Un eventuale Opportunità → Eventi resta **non consolidato** dal mapping di Opportunità. Gli oggetti restano distinti (nessuna ownership reciproca) | Ciascun dominio possiede il proprio fatto; nessuno dei due possiede il fatto dell'altro | Eventi → Opportunità (D27, facoltativa, provvisoria); Opportunità → Eventi non censita | **Apparente, governato** — nessuna dipendenza bidirezionale consolidata; D27 non elevata a Consolidata |

Nessuna delle sequenze analizzate presenta un ciclo di ownership non governato. I cicli Collaborazioni↔Opportunità, Collaborazioni↔Professionisti e Collaborazioni↔Appartenenze sono eliminati sul piano dell'autorità (utilizzo/riferimento unidirezionale, oggetti distinti). Il caso "Identità & Accessi ↔ soggetti di dominio" resta l'unico in cui la bidirezionalità è strutturale (non eliminabile), ma è già esplicitamente governato dalla separazione tra i due piani (identità sostanziale vs. autorizzazione di accesso).

---

## 21. Direzione canonica delle modifiche

Per ciascun gruppo di domini, la tabella stabilisce chi può creare, modificare, verificare, archiviare, pubblicare una rappresentazione, derivare un indicatore o associare un'identità digitale al fatto in questione. La possibilità di **richiedere** una modifica (es. una Persona che richiede la correzione di un dato) non equivale alla **proprietà** della modifica: la richiesta è sempre indirizzata al dominio proprietario, che resta l'unico abilitato a eseguirla.

| Fatto | Crea | Modifica | Verifica | Archivia | Pubblica rappresentazione | Deriva indicatore | Associa identità digitale |
|---|---|---|---|---|---|---|---|
| Identità della Persona | Persone | Persone | Identità & Accessi (identità digitale) / altri domini specifici per verifiche puntuali, non per l'identità sostanziale | Persone | Persone (proprio profilo) o Contenuti Editoriali (narrazione, senza ownership) | Osservatorio | Identità & Accessi |
| Identità dell'Impresa | Imprese | Imprese | Imprese (per aspetti propri, §12 di `imprese.md`); Appartenenze (per la relazione con chi la rappresenta) | Imprese | Imprese o Contenuti Editoriali (narrazione) | Osservatorio | Identità & Accessi (tramite un rappresentante) |
| Appartenenza | Appartenenze | Appartenenze | Appartenenze (con eventuale utilizzo di fatti verificati da Identità & Accessi per l'identità del soggetto) | Appartenenze | Imprese (vista di sintesi, non normativa) | Osservatorio | Non applicabile (l'Appartenenza non ha un'identità digitale propria) |
| Relazione di mercato (MercatoImpresa) | Mercati Internazionali | Mercati Internazionali | Mercati Internazionali | Mercati Internazionali | Imprese (riferimento facoltativo) o Contenuti Editoriali | Osservatorio | Non applicabile |
| Profilo professionale | Professionisti | Professionisti | Professionisti | Professionisti | Professionisti o Contenuti Editoriali | Osservatorio | Identità & Accessi (tramite la Persona sottostante) |
| Opportunità (rappresentazione governata) | Opportunità | Opportunità | Opportunità (verifica di rappresentazione); Appartenenze (utilizzo del titolo, quando applicabile) | Opportunità | Opportunità o Contenuti Editoriali (narrazione, senza ownership) | Osservatorio | Identità & Accessi (tramite soggetto agente) |
| Collaborazione | Collaborazioni | Collaborazioni | Collaborazioni; Appartenenze (utilizzo del titolo) | Collaborazioni | Collaborazioni o Contenuti Editoriali | Osservatorio | Identità & Accessi (tramite promotore) |
| Evento | Eventi | Eventi | Eventi; Appartenenze (utilizzo del titolo per l'organizzatore impresa) | Eventi | Eventi o Contenuti Editoriali | Osservatorio | Identità & Accessi (tramite organizzatore) |
| Contenuto editoriale | Contenuti Editoriali | Contenuti Editoriali | Contenuti Editoriali (processo di revisione editoriale proprio) | Contenuti Editoriali | Contenuti Editoriali (è già la rappresentazione) | Osservatorio (su metriche editoriali, non sul contenuto narrato) | Identità & Accessi (tramite autore/redattore) |
| Indicatore dell'Osservatorio | Osservatorio | Osservatorio | Osservatorio (metodologia propria) | Osservatorio | Osservatorio o Contenuti Editoriali (divulgazione) | Non applicabile (è già un dato derivato) | Non applicabile |
| Identità digitale / Account | Identità & Accessi | Identità & Accessi | Identità & Accessi | Identità & Accessi | Non applicabile (l'account non è pubblicato come contenuto) | Osservatorio (su metriche di utilizzo, non sull'identità) | Identità & Accessi stesso (è l'oggetto, non l'associato) |

Nessun dominio diverso dal proprietario può eseguire creazione, modifica, verifica sostanziale o archiviazione del fatto altrui: può soltanto richiederla (tramite un processo non descritto da questo documento, in quanto flusso applicativo) o utilizzarla come condizione per una propria decisione locale (definizione di "Utilizzo", in apertura).

---

## 22. Regole per i futuri Physical Domain Mapping

Le seguenti dodici regole sono vincolanti per ciascun Physical Domain Mapping ancora da realizzare (tra cui, allo stato di questa revisione mirata: Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi, e gli eventuali mapping di Appartenenze/Mercati Internazionali non ancora recepiti integralmente in questa mappa). Professionisti, Collaborazioni e Opportunità sono già mappati fisicamente: le loro dipendenze in uscita sono recepite qui secondo la regola 12.

1. **Dichiarare ogni dipendenza in uscita.** Ogni riferimento verso un altro dominio, anche facoltativo, deve essere elencato esplicitamente, sul modello di `domain-mapping/imprese.md` §10 e §19.
2. **Indicare il dominio proprietario di ogni dato referenziato.** Nessun dato esterno può essere presentato senza dichiararne la fonte di ownership, coerentemente con la definizione di "Riferimento" (apertura del documento).
3. **Non duplicare fatti posseduti altrove.** Se un fatto è già di proprietà di un altro dominio secondo questa mappa, il nuovo mapping deve referenziarlo, non ridefinirlo (P1, P2).
4. **Distinguere dipendenza necessaria e facoltativa.** Ogni dipendenza deve essere classificata secondo le sei categorie di §0 (Classificazione obbligatoria), non lasciata implicita.
5. **Registrare le dipendenze vietate.** Ogni mapping deve confermare esplicitamente l'assenza delle dipendenze vietate pertinenti elencate in §19, non limitarsi a non menzionarle.
6. **Analizzare i cicli potenziali.** Ogni nuova relazione con un dominio già mappato (Persone, Imprese) o con un altro dominio ancora da mappare deve essere verificata rispetto ai cicli già catalogati in §20, e ogni nuovo ciclo potenziale deve essere analizzato con lo stesso schema (relazione reciproca vs. ciclo di ownership; stato: eliminato/apparente/governato/da verificare).
7. **Mantenere separate proprietà, visibilità e accesso.** Un dominio non deve mai concludere che, poiché un dato è visibile o accessibile, ne ha acquisito la proprietà (definizione di "Pubblicazione"; P5, P8).
8. **Non modificare la Dependency Map implicitamente.** Nessun mapping successivo può alterare una classificazione qui consolidata (§25) limitandosi a descriverla diversamente al proprio interno: ogni divergenza deve essere dichiarata esplicitamente come proposta di revisione (regola 9).
9. **Segnalare eventuali divergenze.** Se il livello logico di un dominio, durante il mapping fisico, rivela un'incoerenza rispetto a questa mappa, il mapping deve segnalarlo esplicitamente (sul modello di §23) invece di risolverlo autonomamente e silenziosamente.
10. **Sottoporre le decisioni fondazionali a review.** Ogni correzione di ownership (come accaduto per `MercatoImpresa`, §6) o ogni introduzione di una nuova dipendenza necessaria non prevista da questa mappa deve essere trattata come decisione fondazionale, soggetta a verifica esplicita prima di essere considerata consolidata.
11. **Verificare la coerenza con Persone e Imprese.** Ogni mapping deve controllare, prima del proprio controllo finale, che le proprie decisioni non contraddicano `domain-mapping/persone.md` o `domain-mapping/imprese.md`, citando la sezione pertinente in caso di sovrapposizione (sul modello di `domain-mapping/imprese.md` §9, R7 verso `persone.md` §9, R7).
12. **Aggiornare la matrice soltanto dopo l'approvazione del mapping.** Le righe della matrice (§15) marcate "Provvisoria" in questo documento devono essere confermate o corrette soltanto quando il relativo Physical Domain Mapping è stato completato e approvato; fino a quel momento, restano provvisorie e non vincolanti quanto le righe "Consolidata".

---

## 23. Divergenze e decisioni da verificare

| # | Fonte | Descrizione | Decisione corrente | Livello di affidabilità | Dominio incaricato della verifica | Momento previsto per il consolidamento |
|---|---|---|---|---|---|---|
| DV1 | `imprese.md` §2 vs. `reconciliation-report.md` §11.2 | `MercatoImpresa` era descritto letteralmente in `imprese.md` come se fosse un concetto di Imprese, ma la riconciliazione logica lo ha attribuito a Mercati Internazionali | Corretta e recepita: Mercati Internazionali possiede la relazione; Imprese la referenzia soltanto (§6, D6-D9) | Alta — decisione già consolidata in due documenti fisici approvati (`domain-mapping/imprese.md`, questa mappa) | Mercati Internazionali (al momento del proprio Physical Domain Mapping, per confermare struttura e dettagli) | Al completamento di `domain-mapping/mercati-internazionali.md` |
| DV2 | `appartenenze.md` vs. `imprese.md` §5 | Granularità diversa del ciclo di vita dell'Appartenenza: `imprese.md` la presenta in modo semplificato (vista di sintesi), `appartenenze.md` la descrive con un modello a nove stati su tre assi | Non è una contraddizione ma una differenza di livello di dettaglio, già riconosciuta da `domain-mapping/imprese.md` §9 e da §5 di questo documento: `appartenenze.md` resta la fonte autorevole | Alta — riconosciuta esplicitamente in entrambi i documenti | Appartenenze | Al completamento di `domain-mapping/appartenenze.md` |
| DV3 | `reconciliation-report.md` §13 | Assenza di un dominio dedicato "Organizzazioni istituzionali", richiamato da Appartenenze, Professionisti e Imprese come concetto candidato ma non formalizzato | Nessuna decisione: il concetto resta trattato come riferimento descrittivo non strutturato (es. VO01/C06) ovunque compaia | Media — dipende da una decisione di governance sull'inventario dei domini, non da un'analisi tecnica | Nessuno (decisione di governance, non di dominio) | Non prevedibile allo stato attuale; dipende dall'ampliamento dell'inventario dei domini |
| DV4 | `reconciliation-report.md` §13 | Assenza di un dominio dedicato "Servizi" per i servizi linguistici e di formazione preesistenti nel repository (migrazioni già implementate prima dell'attuale metodologia architetturale) | Nessuna decisione: questi servizi restano fuori dal perimetro degli undici domini analizzati da questa mappa | Media — riguarda un'area del sistema non ancora riletta secondo la metodologia attuale | Nessuno allo stato attuale | Da valutare in una futura estensione dell'inventario dei domini |
| DV5 | `domain-mapping/imprese.md` §24 | Struttura fisica di Tassonomia condivisa e Territori non ancora oggetto di un proprio documento di mapping | I domini che li referenziano (§14 di questo documento) trattano le voci come identificatori stabili esterni, senza anticipare la struttura | Alta — limite esplicitamente dichiarato, non una lacuna nascosta | Nessun dominio specifico; decisione di governance su un eventuale mapping dedicato ai catalghi condivisi | Da valutare dopo il completamento dei nove mapping di dominio |
| DV6 | Questa mappa, §6 | La natura di "Mercato" come concetto in parte informativo (catalogo) e in parte relazionale non è stata ancora risolta in dettaglio: se il catalogo dei mercati abbia una propria vita indipendente dalla relazione (analogamente a Territori) | Provvisoria: il dominio è classificato Informativo/Relazionale (§3) in attesa di conferma dal proprio mapping fisico | Media | Mercati Internazionali | Al completamento di `domain-mapping/mercati-internazionali.md` |
| DV7 | Questa mappa, §7 | La natura "fondazionale limitata" di Professionisti (evoluzione autonoma del profilo pur senza esistenza indipendente) | **Recepita**: `domain-mapping/professionisti.md` conferma la qualificazione della Persona senza riclassificare il dominio; D10-D13 consolidate | Alta — mapping fisico approvato | Professionisti | Completato per le dipendenze in uscita di Professionisti |
| DV8 | Righe "Provvisoria" residue della matrice (§15) | Ogni dipendenza ancora classificata come provvisoria riflette un'interpretazione non ancora verificata dal Physical Domain Mapping del dominio dipendente | Provvisoria per definizione; D12/D13/D17/D18/D21-D23/D52 non rientrano più in questo insieme | Media, uniforme per le righe provvisorie residue | Il dominio dipendente elencato nella riga | Al completamento del rispettivo mapping (regola 12, §22) |
| DV9 | `domain-mapping/collaborazioni.md` §31 | Dipendenza facoltativa Collaborazioni → Eventi (contesto occasionale) | Non censita come riga consolidata: rilevanza architetturale non ancora strutturale; distinta dagli eventi di dominio di Collaborazioni (§9) | Media | Eventi (conferma al proprio mapping) | Al completamento di `domain-mapping/eventi.md` |
| DV10 | `domain-mapping/professionisti.md` §21.2; `domain-mapping/opportunita.md` §41–§42 | Eventuale riferimento facoltativo in uscita da ServizioProfessionale / Professionisti verso Opportunità | Non introdotto come riga consolidata; resta la sola direzione in entrata D16; mapping di Opportunità conferma l'apertura | Media | Professionisti / Opportunità (revisione futura se emergesse necessità strutturale) | Non consolidata; resta osservazione aperta |
| DV11 | `domain-mapping/opportunita.md` §41–§42 | Eventuale dipendenza facoltativa Opportunità → Eventi (collegamento contestuale navigabile) | Non censita: D27 resta inbound e Provvisoria; nessun verso Opportunità → Eventi introdotto | Media | Eventi (conferma al proprio mapping) | Al completamento di `domain-mapping/eventi.md` |

Nessuna di queste divergenze è stata risolta modificando i documenti logici: questo documento si è limitato a registrarle, secondo il vincolo esplicito della richiesta che ha originato questa mappa.

---

## 24. Verifica degli attributi di qualità

Applicazione della checklist di `04-quality-attributes.md` a questa Dependency Map. Nessun punteggio numerico è utilizzato.

| Attributo | Esito | Evidenza | Rischio | Azione futura |
|---|---|---|---|---|
| Coerenza | Positivo | Le definizioni di §0 sono applicate uniformemente in tutte le sezioni successive; nessuna sezione introduce un criterio di classificazione alternativo | Basso | Nessuna |
| Separazione delle responsabilità | Positivo | Ogni riga della matrice (§15) dichiara un solo dominio proprietario per oggetto di dipendenza | Basso | Nessuna |
| Coesione | Positivo | Le sezioni §4-§14 sono organizzate per dominio, in coerenza con la struttura richiesta e con l'organizzazione dei documenti logici e fisici già approvati | Basso | Nessuna |
| Basso accoppiamento | Positivo, con riserva | Le dipendenze necessarie sono state classificate con severità (§16); le dipendenze "necessarie quando applicabile" verso Appartenenze (D9/D17/D23/D28) restano un accoppiamento trasversale di utilizzo; D17 e D23 sono confermate dai mapping di Opportunità e Collaborazioni | Medio | Verificare D9/D28 nei mapping ancora aperti; mantenere D17/D23 come utilizzo, non come possesso della relazione |
| Estendibilità | Positivo | La matrice non compila tutte le 110 combinazioni ordinate, lasciando spazio a future righe senza richiedere una ristrutturazione (§15) | Basso | Nessuna |
| Evolvibilità | Positivo | §22 stabilisce regole esplicite per l'evoluzione della mappa attraverso i futuri mapping, senza richiedere una riscrittura integrale a ogni aggiornamento | Basso | Nessuna |
| Manutenibilità | Positivo | Ogni riga della matrice ha un identificatore stabile (D1-D52, V1-V12); gli aggiornamenti futuri potranno riferirsi a righe specifiche senza ambiguità | Basso | Nessuna |
| Tracciabilità | Positivo | Ogni decisione cita la fonte logica o fisica pertinente (documento e sezione); §23 traccia esplicitamente le divergenze | Basso | Nessuna |
| Auditabilità | Positivo | Il catalogo delle dipendenze vietate (§19) rende verificabile, per ciascun divieto, il principio protetto e l'alternativa corretta | Basso | Nessuna |
| Verificabilità | Positivo, con riserva | Le righe "Provvisoria" (§15, §23) sono per costruzione non ancora verificate: sono correttamente etichettate come tali, non presentate come definitive | Medio, transitorio | Consolidamento progressivo secondo la regola 12 di §22 |
| Comprensibilità | Positivo | Le sei definizioni obbligatorie e le sei classificazioni sono applicate con terminologia costante in tutto il documento, senza sinonimi non dichiarati | Basso | Nessuna |
| Internazionalizzazione | Non applicabile a questo livello | Il documento non tratta lingue di interfaccia; tratta invece, in §6, la distinzione concettuale tra mercati internazionali e territori, che è un prerequisito concettuale per una futura internazionalizzazione tecnica | Basso | Nessuna |
| Scalabilità concettuale | Positivo | La struttura a catalogo (§16-§19) e a matrice (§15) consente l'aggiunta di nuovi domini o nuove dipendenze senza alterare il metodo di classificazione | Basso | Nessuna |
| Robustezza concettuale | Positivo | L'analisi dei cicli (§20) e delle dipendenze vietate (§19) anticipa esplicitamente gli scenari di uso improprio più probabili, coerentemente con `04-quality-attributes.md` §15 | Basso | Nessuna |

---

## 25. Decisioni consolidate

| Codice | Descrizione | Domini coinvolti | Tipo di dipendenza | Ownership | Principio | Pattern | Convenzione | Attributo di qualità protetto | Stato |
|---|---|---|---|---|---|---|---|---|---|
| DC1 | `MercatoImpresa`, o qualunque relazione equivalente tra impresa e mercato, appartiene a Mercati Internazionali; Imprese può referenziarla ma non possederla | Imprese, Mercati Internazionali | Facoltativa (Imprese→Mercati); Necessaria (Mercati→Imprese) | Mercati Internazionali | P1, P2 | R01/R02 | RC (regole di riferimento, `03-convenzioni-architetturali.md` §5) | Coerenza, basso accoppiamento | Consolidata |
| DC2 | Appartenenze possiede ogni relazione contestuale tra Persona e Impresa, Persona e Organizzazione, Impresa e Organizzazione; nessuno dei soggetti collegati incorpora la relazione | Appartenenze, Persone, Imprese | Necessaria (Appartenenze→soggetti) | Appartenenze | P1, P4 | R01/R02, E02 | RC12-RC13 | Separazione delle responsabilità | Consolidata |
| DC3 | La vista AppartenenzaImpresa di Imprese è di sintesi, non normativa; la fonte autorevole resta sempre Appartenenze | Imprese, Appartenenze | Necessaria (Imprese→Appartenenze) | Appartenenze | P1, P2 | E03 | RC13 | Tracciabilità | Consolidata |
| DC4 | Persone non dipende, per la propria validità sostanziale, da alcun dominio diverso da Tassonomia condivisa e da Identità & Accessi (di supporto) | Persone | — (assenza di dipendenza) | Persone | P12 | A01 | RC (principi di indipendenza, `01-principi-mapping.md` §2) | Basso accoppiamento | Consolidata |
| DC5 | Imprese non dipende, per la propria validità sostanziale, da Mercati Internazionali, Professionisti, Opportunità, Collaborazioni o Eventi | Imprese | — (assenza di dipendenza) | Imprese | P11 | A01 | RC | Basso accoppiamento | Consolidata |
| DC6 | Identità & Accessi non possiede alcun soggetto di dominio; ogni domino possiede la propria identità sostanziale indipendentemente dall'esistenza di un account associato | Identità & Accessi, tutti gli altri 10 domini | Di supporto | Ciascun dominio per il proprio soggetto | P8, P12 | — | RC (principi di supporto trasversale) | Separazione delle responsabilità | Consolidata |
| DC7 | Osservatorio non possiede alcun fatto sorgente; ogni indicatore è un dato derivato tracciabile, mai un attributo incorporato del soggetto osservato | Osservatorio, tutti gli altri 10 domini | Derivativa | Ciascun dominio per il proprio fatto sorgente | P6, P9 | D05/D06 | RC (regole sui dati derivati, `03-convenzioni-architetturali.md` §9) | Tracciabilità, auditabilità | Consolidata |
| DC8 | Contenuti Editoriali non possiede alcun soggetto narrato; la narrazione è sempre una rappresentazione distinta dal fatto | Contenuti Editoriali, tutti i domini narrabili | Editoriale o rappresentativa | Ciascun dominio per il proprio soggetto | P5, P10 | VIS01-VIS06 | RC | Separazione delle responsabilità | Consolidata |
| DC9 | `StoriaPersonale` resta un'Entity dipendente posseduta da Persone; Contenuti Editoriali può referenziarla per ricerca e presentazione, senza duplicarla come proprio contenuto | Persone, Contenuti Editoriali | Facoltativa (uso per ricerca) | Persone | P1 | E02 | RC | Coerenza | Consolidata |
| DC10 | Ogni azione di scrittura in ciascuno degli undici domini richiede l'applicazione dell'accesso da parte di Identità & Accessi; la sola consultazione pubblica non necessariamente la richiede | Tutti gli 11 domini, Identità & Accessi | Di supporto | Identità & Accessi (per l'accesso) | P8 | S05 (accesso, `02-reference-model.md` §7) | RC | Auditabilità | Consolidata |
| DC11 | La distinzione tra ruolo di dominio, ruolo relazionale e ruolo di accesso (§13) è vincolante per ogni futuro mapping che tratti permessi o autorizzazioni | Identità & Accessi, Appartenenze, Professionisti, Imprese | — (regola trasversale) | Rispettivo dominio per ciascun tipo di ruolo | P3, P8 | — | RC | Comprensibilità | Consolidata |
| DC12 | Il ciclo Persone↔Imprese↔Appartenenze è strutturalmente eliminato dalla mediazione di Appartenenze; nessun riferimento diretto Persone-Imprese deve essere introdotto da alcun mapping futuro | Persone, Imprese, Appartenenze | — (assenza di dipendenza diretta) | — | P1, P4, P7 | — | RC29-RC30 | Basso accoppiamento | Consolidata |
| DC13 | La distinzione tra Tassonomia condivisa/Territori (riferimento condiviso, VO03) ed Elenco controllato locale (C03/C05) è il criterio generale per ogni futura classificazione | Tutti i domini con classificazioni | — (regola trasversale) | Condiviso o locale secondo il criterio | P1, P2 | VO03, C02, C03, C05 | RC | Comprensibilità, coerenza | Consolidata |
| DC14 | Il Profilo professionale qualifica una Persona (D10 necessaria); Professionisti non è soggetto distinto; D11-D13 restano facoltative (D12 come utilizzo); nessuna dipendenza consolidata Professionisti → Collaborazioni/Opportunità; ServizioProfessionale non costituisce un dominio Servizi | Professionisti, Persone, Imprese, Appartenenze, Mercati Internazionali | Necessaria (D10); Facoltativa (D11-D13) | Persone (identità); Professionisti (profilo/qualifiche); Appartenenze/Imprese/Mercati per i fatti propri | P1, P4 | R01/R02, E02, R06 | RC | Separazione delle responsabilità, basso accoppiamento | Consolidata |
| DC15 | Collaborazioni è processo autonomo (fase dichiarativa → eventuale fase relazionale); D19-D20 necessarie come capacità di referenziare soggetti; D21/D22/D52 facoltative; D23 necessaria quando applicabile (utilizzo); V10 vincolante; nessun ciclo di ownership con Opportunità/Professionisti/Appartenenze | Collaborazioni, Persone, Imprese, Professionisti, Opportunità, Appartenenze, Mercati Internazionali | Necessaria (D19-D20); Facoltativa (D21, D22, D52); Necessaria quando applicabile (D23); Vietata (V10) | Collaborazioni (processo/ruoli locali); Appartenenze (relazione strutturale); Opportunità (solo origine storica referenziata) | P1, P4 | R01/R02, R06 | RC | Separazione delle responsabilità, basso accoppiamento | Consolidata |
| DC16 | Opportunità è Core autonomo: possiede la rappresentazione governata della possibilità azionabile strutturata e l'eventuale processo interno; D14-D15 necessarie; D16/D18 facoltative; D17 necessaria quando applicabile (utilizzo); D22 resta unidirezionale Collaborazioni → Opportunità; nessuna ownership Opportunità → Collaborazioni; candidatura è concetto interno condizionato (non dominio); D27 e DV10/DV11 restano aperte; V8 vincolante; nessun dominio Servizi/Organizzazioni | Opportunità, Persone, Imprese, Professionisti, Appartenenze, Mercati Internazionali, Collaborazioni, Eventi, Contenuti Editoriali | Necessaria (D14-D15); Facoltativa (D16, D18); Necessaria quando applicabile (D17); Facoltativa storica inbound (D22); Vietata (V8) | Opportunità (rappresentazione/processo proprio); Persone/Imprese (identità); Appartenenze (rappresentanza); Mercati (contesto); Collaborazioni (solo origine storica outbound) | P1, P4, P5 | R01/R02, R06 | RC | Separazione delle responsabilità, basso accoppiamento | Consolidata |

Le righe DC1-DC16 sono le decisioni fondazionali che questo documento dichiara **consolidate** in §25. Le righe della matrice (§15) con Stato "Consolidata" includono anche dipendenze confermate dai mapping approvati (regola 12). Ogni decisione che coinvolga un dominio non ancora mappato fisicamente, o una riga ancora "Provvisoria" in §15, resta **provvisoria**, in coerenza con il vincolo "non dichiarare consolidata una decisione relativa a un dominio non ancora mappato quando deriva soltanto da un'interpretazione preliminare".

---

## 26. Aspetti rinviati

### Aspetti rinviati ai mapping dei singoli domini

1. Struttura interna degli assi di stato di Appartenenze (nove stati su tre assi) — rinviata a `domain-mapping/appartenenze.md`.
2. Distinzione fisica tra "mercato" come catalogo e "presenza di mercato" come relazione — rinviata a `domain-mapping/mercati-internazionali.md`.
3. Verifica della natura fondazionale limitata di Professionisti — **recepita** per le dipendenze in uscita (D10-D13, DC14); aspetti interni non di dipendenza restano nel mapping di Professionisti.
4. Struttura del processo di candidatura e degli esiti di Opportunità — **recepita** per le dipendenze interdominio (D14-D18, D22, V8, DC16); candidatura/valutazione/assegnazione restano concetti interni condizionati nel mapping di Opportunità; PC2 resta aperto.
5. Distinzione operativa tra esigenza e proposta in Collaborazioni — **recepita** per le dipendenze in uscita (D19-D23, D52, V10, DC15); dettagli interni restano nel mapping di Collaborazioni.
6. Struttura della partecipazione e della relazione con i luoghi in Eventi — rinviata a `domain-mapping/eventi.md`; include l'eventuale conferma di Collaborazioni → Eventi (DV9).
7. Processo di revisione editoriale e classificazione dei formati in Contenuti Editoriali — rinviata a `domain-mapping/contenuti-editoriali.md`.
8. Metodologie di calcolo e versionamento degli indicatori in Osservatorio — rinviata a `domain-mapping/osservatorio.md`.
9. Struttura di ruoli di accesso, deleghe operative e stato dell'accesso in Identità & Accessi — rinviata a `domain-mapping/identita-accessi.md`.

### Aspetti rinviati alla futura rappresentazione fisica concreta

10. Rappresentazione tecnica di ogni dipendenza qui classificata (colonne, tabelle, riferimenti, viste) — nessuna tecnologia è anticipata da questo documento (nota introduttiva).
11. Struttura fisica dei catalghi condivisi Tassonomia e Territori (§14, DV5) — rinviata a un eventuale futuro documento di mapping dedicato.
12. Meccanismo tecnico con cui Identità & Accessi applica l'accesso a ciascun dominio (§13, §21) — rinviato al futuro `domain-mapping/identita-accessi.md` e alla futura implementazione.

### Aspetti rinviati a decisioni di governance

13. Formalizzazione di un dominio "Organizzazioni istituzionali" (DV3) — decisione di governance sull'inventario dei domini, non di questo documento.
14. Formalizzazione di un dominio "Servizi" per i servizi linguistici e di formazione preesistenti (DV4) — come sopra.
15. Priorità e sequenza con cui i nove Physical Domain Mapping ancora da realizzare verranno effettivamente prodotti — decisione di pianificazione, non di architettura.

### Aspetti rinviati a una futura revisione della baseline

16. Se la distinzione "fondazionale limitato" (§4) meriti una propria categoria formale nel Reference Model (`02-reference-model.md`), oppure resti una qualificazione narrativa come in questo documento — valutazione rinviata a un'eventuale revisione della baseline dopo il completamento di più mapping.
17. Se il pattern di "utilizzo del titolo di rappresentanza" (D9/D17/D23/D28), ricorrente in quattro domini distinti, meriti un proprio codice di pattern riutilizzabile nel Reference Model — segnalato come osservazione, non come proposta di modifica immediata.

Nessuna soluzione tecnica è proposta per alcuno di questi aspetti.

---

## 27. Controllo finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Presenza di tutti gli undici domini | Verificato — ciascuno dei domini elencati in apertura è trattato in una sezione dedicata (§4-§13) o come parte esplicita dell'analisi trasversale (§14-§21) |
| 2 | Coerenza con il Domain Model | Verificato — i dodici principi di §2 sono citati con riferimento a `domain-model.md` §1; nessun principio è contraddetto |
| 3 | Coerenza con la riconciliazione | Verificato — la classificazione dei domini (§3) e le dipendenze della matrice (§15) sono coerenti con `reconciliation-report.md` §3.1, §3.2 e §11; le tensioni non risolte (§13) sono riportate senza alterazioni in §14, DV3-DV4 |
| 4 | Coerenza con Persone | Verificato — §4, §9, §13, §16 richiamano `domain-mapping/persone.md` senza contraddirne le decisioni (indipendenza sostanziale della Persona, non-incorporazione delle relazioni, separazione da Identità & Accessi) |
| 5 | Coerenza con Imprese | Verificato — §4, §6, §9, §10, §19 richiamano `domain-mapping/imprese.md` senza contraddirne le decisioni consolidate, inclusa la correzione di ownership di `MercatoImpresa` |
| 6 | Registrazione della decisione su `MercatoImpresa` | Verificato — registrata esplicitamente in §6, ripresa in §15 (D6-D7), §19 (V3), §20 (ciclo apparente/governato), §23 (DV1) e §25 (DC1) |
| 7 | Ownership esplicita | Verificato — ogni riga della matrice (§15) e ogni catalogo (§16-§19) dichiara un "dominio proprietario" |
| 8 | Direzione esplicita delle dipendenze | Verificato — ogni riga della matrice dichiara "direzione"; §21 dedica un'intera sezione alla direzione canonica delle modifiche |
| 9 | Distinzione fra proprietà, riferimento, utilizzo, derivazione, aggregazione e pubblicazione | Verificato — definite rigorosamente in apertura e applicate coerentemente da §4 a §21 (es. §18 distingue esplicitamente derivazione, pubblicazione e utilizzo) |
| 10 | Distinzione fra dipendenze necessarie, facoltative, derivative, editoriali, di supporto e vietate | Verificato — sei categorie definite in apertura, catalogate separatamente in §16-§19 |
| 11 | Assenza di cicli non analizzati | Verificato — §20 analizza le sequenze richieste, i casi aggiuntivi Eventi↔Opportunità, Collaborazioni↔Professionisti e Collaborazioni↔Appartenenze, e conferma l'eliminazione del ciclo Opportunità↔Collaborazioni anche dopo il mapping di Opportunità |
| 12 | Assenza di ownership condivise implicite | Verificato — ogni oggetto di dipendenza nella matrice ha un solo "dominio proprietario"; nessuna riga assegna la proprietà a più di un dominio |
| 13 | Assenza di nuovi domini non autorizzati | Verificato — solo gli undici domini elencati in apertura sono trattati come bounded context; Tassonomia condivisa, Territori e Organizzazioni istituzionali sono esplicitamente trattati come concetti condivisi o candidati, non come nuovi domini (§14, §23) |
| 14 | Assenza di tecnologia | Verificato — nessuna tecnologia è nominata come scelta di progetto; le uniche menzioni compaiono nella nota introduttiva e in §26 |
| 15 | Assenza di SQL | Verificato — nessuna istruzione SQL, nessun `CREATE TABLE` |
| 16 | Assenza di schema di database | Verificato — non è definita alcuna tabella, colonna, indice, chiave o vincolo tecnico |
| 17 | Assenza di implementazioni | Verificato — ogni riferimento a una futura struttura fisica concreta è esplicitamente rinviato (§26) |
| 18 | Correttezza dei riferimenti incrociati | Verificato — ogni citazione a `domain-mapping/persone.md`, `domain-mapping/imprese.md`, `reconciliation-report.md`, `domain-model.md` e ai quattro documenti di metodologia fisica è stata controllata contro il testo integrale letto in apertura di lavoro |
| 19 | Assenza di placeholder | Verificato — ogni sezione da §1 a §27 contiene contenuto completo e specifico |
| 20 | Assenza di sezioni vuote | Verificato — nessuna sezione della struttura obbligatoria è stata omessa |
| 21 | Assenza di contraddizioni sostanziali | Verificato — la revisione mirata per Opportunità ha controllato direzioni, classificazioni funzionali, maturità (Stato), ownership e coerenza con `domain-mapping/opportunita.md`, senza consolidare D27/DV10/DV11 né alterare dipendenze estranee |

---

# Riepilogo finale

1. **File**: `docs/architecture/physical/domain-dependency-map.md` (revisione mirata per il mapping approvato di Opportunità; recepisce anche le revisioni precedenti su Professionisti e Collaborazioni)
2. **Numero di sezioni**: 27 sezioni della struttura obbligatoria, precedute da nota introduttiva, documenti letti, domini inclusi, definizioni obbligatorie e classificazione delle dipendenze, e seguite dal Riepilogo finale
3. **Domini analizzati**: 11 (Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi)
4. **Classificazione dei domini**: descrizione di Opportunità precisata (possibilità azionabile strutturata); nessuna riclassificazione di categoria
5. **Numero di dipendenze necessarie**: 9 righe di catalogo in §16 (che raggruppano le righe della matrice: D1-D5, D7-D8, D9\*, D10, D14-D15, D17\*, D19-D20, D23\*, D24-D25, D28\*, D46-D50; \* = necessaria quando applicabile)
6. **Numero di dipendenze facoltative**: 12 righe di catalogo in §17 (matrice: D6, D11, D12, D13, D16, D18, D21, D22, D26, D27, D29, D51, D52; una riga di catalogo raggruppa Opportunità/Eventi→Mercati)
7. **Numero di dipendenze derivative**: 8 (D38-D45 della matrice, catalogate in §18)
8. **Numero di dipendenze editoriali o rappresentative**: 8 (D30-D37 della matrice, catalogate in §18)
9. **Numero di dipendenze di supporto**: 4 righe di catalogo (D46-D49 della matrice, catalogate in §18), applicate nelle due direzioni verso tutti gli 11 domini
10. **Numero di dipendenze vietate**: 12 (V1-V12, catalogate in §19); V8 e V10 precisate
11. **Cicli analizzati**: 10 (§20)
12. **Cicli eliminati**: 7 (Persone↔Imprese↔Appartenenze; Imprese↔Professionisti; Opportunità↔Collaborazioni; Collaborazioni↔Professionisti; Collaborazioni↔Appartenenze; Eventi↔Contenuti Editoriali; domini sorgente↔Osservatorio)
13. **Cicli apparenti**: 2 (Imprese↔Mercati Internazionali; Eventi↔Opportunità), entrambi governati; Eventi↔Opportunità senza consolidare Opportunità → Eventi
14. **Cicli ancora da verificare**: 1 (soggetti di dominio↔Identità & Accessi, bidirezionalità strutturale già governata ma da confermare nel futuro mapping di Identità & Accessi)
15. **Decisioni consolidate**: 16 (DC1-DC16, §25), di cui DC16 introdotta da questa revisione
16. **Decisioni di maturità aggiornate in questa revisione**: D17, D18 da Provvisoria a Consolidata (classificazione funzionale invariata); D14-D16 e D22 precisate; D27 lasciata Provvisoria
17. **Divergenze registrate**: 11 (DV1-DV11, §23); DV8/DV10 aggiornate; DV11 aggiunta (Opportunità → Eventi non consolidata)
18. **Stato della decisione `MercatoImpresa`**: Consolidata (DC1), invariata
19. **Qualità raggiunta**: 14 attributi verificati con esito positivo (2 con riserva: basso accoppiamento, verificabilità), nessuno con esito negativo (§24)
20. **Aspetti rinviati**: aggiornato il punto 4 di §26; D27, DV9, DV10, DV11 aperte; Organizzazioni/Servizi restano futuri; PC2 di Opportunità resta aperto
21. **Conferma dell'assenza di contenuti tecnici e implementativi**: confermata dal controllo finale (§27, righe 14-17)
22. **Ambito della revisione**: limitato agli impatti del Physical Domain Mapping approvato di Opportunità; nessuna dipendenza non consolidata è stata elevata a decisione definitiva; nessun altro documento è stato modificato