# Logical Data Model — Dominio IDENTITÀ & ACCESSI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, token tecnici, protocolli di autenticazione, librerie, provider specifici o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/eventi.md`](./eventi.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md), [`docs/architecture/logical/osservatorio.md`](./osservatorio.md).
> Scopo del documento: definire il modello logico del dominio Identità & Accessi, già anticipato in `docs/domain-model.md` §1 come dominio "Generico" ("Autenticare l'utente e definire cosa può fare... non è un dominio di business: è infrastruttura abilitante") e richiamato da ogni documento logico precedente come responsabile esclusivo di autenticazione, autorizzazione e permessi tecnici, mai come proprietario dei fatti di business (`logical/persone.md`, `logical/imprese.md` §1/§7, `logical/appartenenze.md` §8/§10, `logical/mercati-internazionali.md` §1, `logical/professionisti.md` §1, `logical/eventi.md`, `logical/contenuti-editoriali.md` §1/§12/§13, `logical/osservatorio.md` §1/§12). Questo documento conferma Identità & Accessi come dominio autonomo e ne definisce la struttura logica completa.
> Carattere autonomo del dominio. Identità & Accessi rappresenta chi tenta di accedere alla piattaforma, con quale identità digitale, con quale livello di verifica, per conto di chi, con quale titolo, e a cosa può accedere entro quali limiti e per quale periodo. Non è un semplice meccanismo tecnico invisibile: ha una propria natura concettuale — fatta di identità digitali, account, metodi di autenticazione, ruoli applicativi, permessi, deleghe, consensi — distinta e autonoma rispetto ai soggetti economici e sociali che la piattaforma rappresenta.
> Distinzione tra Account, Identità digitale, Persona, Impresa e Appartenenza. Un **Account** è il costrutto di accesso che permette di autenticarsi e agire sulla piattaforma. Una **Identità digitale** è l'insieme di credenziali e metodi di autenticazione riconducibili a un Account. Una **Persona** (`logical/persone.md`) è il soggetto sociale e anagrafico, che può esistere senza alcun Account. Un'**Impresa** (`logical/imprese.md`) è un soggetto economico che non possiede mai credenziali proprie: agisce sempre attraverso Persone autorizzate. Un'**Appartenenza** (`logical/appartenenze.md`) è il fatto di business che lega una Persona a un'Impresa; il titolo per agire per l'Impresa deriva da essa (o da una delega compatibile), ma l'Appartenenza stessa non è un costrutto di accesso. Questi cinque concetti restano sempre distinti in questo documento.
> Principio per cui l'accesso non crea diritti sostanziali. Una decisione di Identità & Accessi (un permesso concesso, un ruolo assegnato, un accesso consentito) è sempre un fatto tecnico-applicativo: non genera, modifica né dimostra automaticamente un fatto sostanziale dei domini economici e sociali — non crea proprietà, non crea rappresentanza legale, non attribuisce una qualifica professionale, non dimostra affidabilità. I fatti sostanziali restano sempre di competenza esclusiva del dominio che li governa (Persone, Imprese, Appartenenze, Professionisti, e gli altri).
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di protocolli di autenticazione, librerie, provider o meccanismi specifici.

---

## Indice

1. [Responsabilità del dominio](#1-responsabilità-del-dominio)
2. [Entità e concetti principali](#2-entità-e-concetti-principali)
3. [Identità reale, Identità digitale e Account](#3-identità-reale-identità-digitale-e-account)
4. [Metodi e livelli di autenticazione](#4-metodi-e-livelli-di-autenticazione)
5. [Associazione con Persona, Impresa e Appartenenze](#5-associazione-con-persona-impresa-e-appartenenze)
6. [Ruoli applicativi e permessi](#6-ruoli-applicativi-e-permessi)
7. [Politiche e decisioni di accesso](#7-politiche-e-decisioni-di-accesso)
8. [Deleghe e rappresentanza operativa](#8-deleghe-e-rappresentanza-operativa)
9. [Consensi, finalità e preferenze di accesso](#9-consensi-finalità-e-preferenze-di-accesso)
10. [Verifica dell'identità e affidabilità dell'accesso](#10-verifica-dellidentità-e-affidabilità-dellaccesso)
11. [Ciclo di vita dell'Account e recupero dell'accesso](#11-ciclo-di-vita-dellaccount-e-recupero-dellaccesso)
12. [Sessioni, sicurezza e tracciabilità concettuale](#12-sessioni-sicurezza-e-tracciabilità-concettuale)
13. [Regole, invarianti e casi limite](#13-regole-invarianti-e-casi-limite)
14. [Eventi di dominio](#14-eventi-di-dominio)
15. [Decisioni finali e domande aperte](#15-decisioni-finali-e-domande-aperte)

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Identità & Accessi rappresenta chi sta tentando di accedere alla piattaforma, con quale identità digitale, con quale livello di verifica, per conto di quale soggetto, con quale titolo, a quali azioni o informazioni può accedere, entro quali limiti, per quale periodo, e sulla base di quale consenso, delega o regola. È il dominio che decide *l'accesso*, non *l'esistenza* o *la verità sostanziale* dei soggetti che vi accedono.

**Quali problemi risolve.** Permette di autenticare un soggetto senza confonderlo con la sua identità sociale (§3); permette a una Persona di operare per un'Impresa senza che l'Impresa possieda credenziali proprie (introduzione, §5); distingue autenticazione (chi sei) da autorizzazione (cosa puoi fare), evitando che un ruolo applicativo si confonda con una qualifica professionale o con una rappresentanza legale (§6, §13); rende possibile delegare l'accesso senza delegare la proprietà o la rappresentanza (§8); governa i consensi all'accesso e al trattamento senza sovrapporsi a un futuro modello legale della privacy (§9); distingue più assi di verifica e di stato, evitando un unico giudizio generico di "utente verificato" (§10); e rende tracciabili le decisioni di accesso senza descrivere strumenti tecnici specifici (§12).

**Cosa rientra nel dominio.** Identità digitali; Account; metodi di autenticazione; verifica dell'identità digitale; associazione tra Account e soggetti di dominio; ruoli applicativi; permessi; deleghe; consensi; accesso a funzionalità e informazioni; sospensioni; recupero dell'accesso; sicurezza concettuale dell'Account; tracciabilità delle decisioni di accesso.

**Cosa NON rientra nel dominio.**
- Non rientrano **Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Mercati Internazionali, Contenuti Editoriali, Osservatorio**: i fatti sostanziali di questi domini (chi è una Persona, chi possiede un'Impresa, chi è un Professionista, chi ha una qualifica) restano di loro esclusiva competenza; Identità & Accessi li referenzia per decidere l'accesso, senza mai diventarne proprietario né duplicarli.
- Non rientrano **comunicazioni e notifiche**: il dominio Notifiche (`docs/domain-model.md` §12) reagisce a fatti accaduti; Identità & Accessi può generare fatti (es. un accesso anomalo) ma non gestisce l'invio o la preferenza di canale.
- Non rientrano le **preferenze generali** non legate all'accesso (es. preferenze editoriali, di visualizzazione): solo le preferenze di accesso e consenso rientrano qui (§9).
- Non rientra la **reputazione**: nessun giudizio di affidabilità, qualità o merito è di competenza di questo dominio (§10, §13).
- Non rientrano **contratti e pagamenti**: eventuali accordi commerciali restano fuori dal perimetro.
- Non rientrano le **verifiche professionali** (`logical/professionisti.md`) né le **verifiche economiche**: Identità & Accessi può considerarne l'esito come condizione di una decisione di accesso (§7), senza gestirne il processo.

**Chiarimenti espliciti.** Un ruolo applicativo non equivale a una qualifica professionale; un permesso non equivale a rappresentanza legale; una delega di accesso non sostituisce un'Appartenenza; l'autenticazione non dimostra automaticamente identità civile o affidabilità (introduzione, §3, §6, §8, §10).

**Quali domini utilizza.** Identità & Accessi legge, senza incorporare: **Persone** (per l'associazione Account–Persona e lo stato dell'identità dichiarata/verificata); **Imprese** (per il contesto di azione); **Appartenenze** (per il titolo che consente di agire per un'Impresa); **Professionisti** (per l'eventuale stato di verifica professionale rilevante a una decisione di accesso); **Contenuti Editoriali** (per i ruoli editoriali — autore, revisore, responsabile editoriale); **Osservatorio** (per l'eventuale accesso a dati aggregati riservati); ogni altro dominio, come fonte di *risorse logiche* (§7) su cui applicare una decisione di accesso.

**Quali domini utilizzano Identità & Accessi.** Tutti i domini della piattaforma dipendono da Identità & Accessi per stabilire chi può creare, modificare o consultare le proprie entità — ma nessuno di essi ne incorpora la logica: ciascun dominio proprietario definisce la propria visibilità (§7, principio) e Identità & Accessi la applica. In particolare `logical/imprese.md` §7, `logical/appartenenze.md` §8/§10, `logical/professionisti.md` §1, `logical/contenuti-editoriali.md` §12/§13 e `logical/osservatorio.md` §1/§12 rimandano esplicitamente a questo dominio per ogni fatto tecnico di accesso.

**Perché è un dominio autonomo.** Identità & Accessi ha una propria natura — non economica, non sociale, non editoriale — fatta di identità digitali, credenziali, metodi di autenticazione, ruoli applicativi, permessi, deleghe e consensi, con proprie regole di verifica multidimensionale (§10) e un proprio ciclo di vita a più assi (§11). Nessun altro dominio possiede la competenza per decidere, in modo coerente e centralizzato, chi può fare cosa, per conto di chi, entro quali limiti: comprimere questa responsabilità in un altro dominio (es. in Persone o in Imprese) obbligherebbe quel dominio a occuparsi di credenziali, sessioni e sicurezza, snaturandone la responsabilità di modellare fatti di business.

**Differenza tra identità reale, identità digitale, Account, Persona, credenziale, ruolo, permesso, delega e consenso.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Identità reale | Fatto del mondo | Chi una persona è realmente, indipendentemente da qualsiasi rappresentazione digitale (§3) |
| Persona | Entità di dominio (`logical/persone.md`) | Il soggetto sociale e anagrafico rappresentato dalla piattaforma; può esistere senza Account |
| Identità digitale | Entità di questo dominio (§2) | L'insieme di credenziali e metodi di autenticazione riconducibili a un Account |
| Account | Entità di questo dominio (§2) | Il costrutto di accesso che consente l'autenticazione e l'azione sulla piattaforma |
| Credenziale | Concetto descrittivo (§2, §4) | L'elemento specifico (di conoscenza, possesso o caratteristica) usato per autenticare un'Identità digitale |
| Ruolo applicativo | Concetto descrittivo (§6) | L'insieme di permessi assegnabile a un Account in un dato contesto, senza equivalere a una qualifica di dominio |
| Permesso | Concetto descrittivo (§6, §7) | La singola facoltà tecnica di compiere un'azione o accedere a un'informazione |
| Delega | Entità di questo dominio (§8) | Il trasferimento di una porzione limitata di accesso da un delegante a un delegato, senza creare proprietà o rappresentanza |
| Consenso | Entità di questo dominio (§9) | L'espressione di volontà di un soggetto rispetto a una finalità di accesso o trattamento, distinta da permesso e delega |

---

## 2. Entità e concetti principali

**Entità autonome** — esistono per proprio conto, hanno un ciclo di vita e sono referenziabili da altri concetti del dominio:

| Entità | Descrizione |
|---|---|
| **Identità digitale** | L'insieme di credenziali e metodi di autenticazione riconducibili a un Account, distinto dall'identità reale e dall'identità civile (§3) |
| **Account** | Il costrutto di accesso che consente l'autenticazione e l'azione sulla piattaforma, distinto dalla Persona (§3) |
| **Metodo di autenticazione** | Una specifica modalità (conoscenza, possesso, caratteristica, assistita) con cui un'Identità digitale può essere autenticata (§4) |
| **Delega** | Il trasferimento dichiarato di una porzione limitata di accesso da un Delegante a un Delegato (§8) |
| **Consenso** | L'espressione di volontà di un soggetto rispetto a una finalità di accesso o trattamento (§9) |
| **Sessione concettuale** | L'intervallo durante il quale un'Identità digitale autenticata opera sulla piattaforma in un dato contesto (§12) |
| **Evento di sicurezza** | Un fatto rilevante per la sicurezza concettuale dell'Account (tentativo fallito, attività anomala, compromissione) (§12) |
| **Segnalazione** | Un fatto riportato da un soggetto (l'Account stesso o un terzo) relativo a un possibile problema di sicurezza o di accesso (§12) |

**Concetti descrittivi e di relazione** — qualificano le entità autonome o descrivono decisioni e stati, senza vita propria indipendente:

| Concetto | Descrizione |
|---|---|
| **Profilo di accesso** | L'insieme dei ruoli, permessi e condizioni effettivamente disponibili per un Account in un dato Contesto di azione (§6, §7) |
| **Credenziale** | L'elemento specifico usato per dimostrare il controllo di un Metodo di autenticazione (§4) |
| **Fattore di autenticazione** | La categoria a cui appartiene una Credenziale (conoscenza, possesso, caratteristica personale) (§4) |
| **Verifica dell'identità digitale** | L'accertamento che un'Identità digitale è effettivamente controllata dal soggetto che la utilizza (§10) |
| **Associazione con Persona** | Il collegamento dichiarato e verificabile tra un Account e una Persona (§3, §5) |
| **Associazione operativa con Impresa** | Il collegamento, derivato da un'Appartenenza o da una Delega compatibile, che permette a una Persona di agire per un'Impresa (§5) |
| **Contesto di azione** | La modalità (in proprio, per conto di un'Impresa, per conto di un'organizzazione) in cui un'Identità digitale agisce in un dato momento (§5) |
| **Ruolo applicativo** | L'insieme nominato di permessi assegnabile a un Account in un Contesto di azione, distinto da ruoli e qualifiche di dominio (§6) |
| **Permesso** | La singola facoltà tecnica di compiere un'azione o accedere a un'informazione (§6, §7) |
| **Politica di accesso** | La regola dichiarata che, applicata a un insieme di condizioni, determina l'esito di una richiesta di accesso (§7) |
| **Decisione di accesso** | L'esito concreto (consentito, negato, limitato...) prodotto applicando una o più Politiche a una richiesta specifica (§7) |
| **Delegante** | Il soggetto che concede una Delega, che deve possedere il titolo per farlo (§8) |
| **Delegato** | Il soggetto che riceve una Delega (§8) |
| **Ambito della delega** | L'insieme di azioni, contesti o informazioni a cui una Delega si applica (§8) |
| **Finalità del consenso** | Lo scopo dichiarato per cui un Consenso è richiesto o espresso (§9) |
| **Revoca del consenso** | L'atto con cui un soggetto ritira un Consenso precedentemente espresso (§9) |
| **Recupero dell'accesso** | Il processo con cui un soggetto riottiene il controllo di un Account quando un Metodo di autenticazione non è più disponibile (§11) |
| **Contatto di recupero** | Il riferimento dichiarato usabile per verificare l'identità durante un Recupero dell'accesso (§11) |
| **Dispositivo riconosciuto** | Uno strumento già associato a precedenti Sessioni di un'Identità digitale, usato come segnale di affidabilità concettuale (§12) |
| **Blocco** | La restrizione, totale o parziale, dell'accesso di un Account o di un Metodo di autenticazione, come misura di sicurezza (§11) |
| **Sospensione** | La restrizione temporanea e motivata dell'accesso, distinta dalla chiusura definitiva (§11) |
| **Chiusura dell'Account** | La cessazione definitiva della possibilità di accedere tramite un dato Account (§11) |
| **Stato dell'Account** | L'asse di stato che descrive la condizione operativa complessiva dell'Account (§11) |
| **Stato di verifica** | L'asse di stato che descrive quali componenti dell'identità e dell'accesso sono stati verificati (§10) |
| **Livello di affidabilità dell'accesso** | La valutazione concettuale, multidimensionale, di quanto un tentativo di accesso sia genuino (§10, §12) |
| **Visibilità delle informazioni di sicurezza** | Chi può conoscere i dettagli di un Evento di sicurezza o di una Decisione di accesso (§12) |
| **Fonte** | L'origine dichiarata di un'informazione usata da questo dominio (una dichiarazione dell'Account, un controllo automatico, un altro dominio) |
| **Evidenza** | Un riscontro concreto a supporto di una Verifica o di una Decisione di accesso, coerente con il concetto omonimo già introdotto in `logical/appartenenze.md` §2 |

**Relazioni verso altri domini** — mai incorporazione, sempre riferimento:

| Riferimento | Verso il dominio | Significato |
|---|---|---|
| Associazione con Persona | `logical/persone.md` | L'Account referenzia la Persona a cui è associato, senza incorporarne i dati (§5) |
| Associazione operativa con Impresa | `logical/imprese.md`, `logical/appartenenze.md` | Il Contesto di azione "per conto di un'Impresa" deriva da un'Appartenenza esistente o da una Delega compatibile (§5, §8) |
| Ruolo editoriale | `logical/contenuti-editoriali.md` | Autore, revisore, responsabile editoriale sono Ruoli applicativi di questo dominio, applicati a Contenuti di quel dominio (§6) |
| Accesso a dati aggregati | `logical/osservatorio.md` | Un Ruolo applicativo (es. ricercatore) può condizionare l'accesso a prodotti analitici riservati (§7) |
| Stato di verifica professionale | `logical/professionisti.md` | Una Decisione di accesso può considerare, come condizione, lo stato di verifica dichiarato da quel dominio, senza gestirlo (§7, §10) |

**Chiarimento su cosa sono le voci elencate.** Sono **entità autonome**: Identità digitale, Account, Metodo di autenticazione, Delega, Consenso, Sessione concettuale, Evento di sicurezza, Segnalazione. Sono **relazioni**: Associazione con Persona, Associazione operativa con Impresa, Delegante/Delegato. Sono **ruoli**: Ruolo applicativo e le sue istanze (§6). Sono **regole**: Politica di accesso, Ambito della delega, Finalità del consenso. Sono **decisioni**: Decisione di accesso, Verifica dell'identità digitale. Sono **stati**: Stato dell'Account, Stato di verifica, Blocco, Sospensione, Chiusura. Sono **riferimenti verso altri domini**: Associazione operativa con Impresa, Ruolo editoriale, Accesso a dati aggregati, Stato di verifica professionale.

---

## 3. Identità reale, Identità digitale e Account

| Concetto | Definizione |
|---|---|
| **Persona** | Il soggetto sociale e anagrafico rappresentato dal dominio `logical/persone.md`; può esistere indipendentemente da qualsiasi Account |
| **Identità reale** | Chi un soggetto è realmente nel mondo, indipendentemente da qualsiasi rappresentazione digitale o dichiarazione |
| **Identità dichiarata** | L'insieme di informazioni che un soggetto afferma su di sé, senza che questo costituisca automaticamente una prova (coerente con il principio di non-automatismo di `logical/persone.md` §1) |
| **Identità verificata** | Un'Identità dichiarata per cui esiste un riscontro indipendente, secondo gli assi distinti di §10 |
| **Identità digitale** | L'insieme di credenziali e Metodi di autenticazione riconducibili a un Account, che permette di riconoscere lo stesso soggetto in accessi successivi |
| **Account** | Il costrutto di accesso, distinto dalla Persona, che consente l'autenticazione e l'azione sulla piattaforma |
| **Metodo di autenticazione** | Una specifica modalità con cui un'Identità digitale può essere autenticata (§4) |
| **Credenziale** | L'elemento concreto (di conoscenza, possesso o caratteristica) usato per dimostrare il controllo di un Metodo di autenticazione |
| **Profilo pubblico** | Concetto di dominio esterno (`logical/persone.md`, `logical/imprese.md`): la rappresentazione pubblica di una Persona o di un'Impresa, distinta dall'Account che consente di modificarla |
| **Profilo professionale** | Concetto di dominio esterno (`logical/professionisti.md`): la rappresentazione professionale di una Persona, distinta dall'Account |
| **Profilo di accesso** | Concetto di questo dominio (§2): l'insieme di ruoli, permessi e condizioni disponibili per un Account in un dato Contesto |

**Chiarimenti.**
- Una **Persona può esistere senza Account**: una scheda pubblica descritta da `logical/persone.md` può essere stata creata, referenziata o dichiarata (ad esempio da un'Appartenenza) senza che la Persona abbia mai effettuato un accesso proprio.
- Un **Account può essere creato prima dell'associazione completa a una Persona**: un soggetto può registrarsi e ottenere un'Identità digitale prima che l'associazione con una Persona pienamente riconosciuta sia stabilita o verificata (§5).
- L'**associazione Account–Persona deve essere esplicita**: non è mai inferita da somiglianze di nome, contatto o comportamento, ma dichiarata come fatto distinto, con un proprio Stato di verifica (§5, §10).
- **Più Metodi di autenticazione possono riferirsi allo stesso Account**: un'Identità digitale può essere autenticata in più modi alternativi o concorrenti (§4).
- **Più Account riferiti alla stessa Persona costituiscono un caso eccezionale da governare**: non è la condizione ordinaria del modello, e richiede una gestione esplicita (§13, caso limite 3).
- La **chiusura dell'Account non cancella automaticamente la Persona**: la Persona, i suoi dati pubblici e le sue relazioni di dominio restano governati esclusivamente da `logical/persone.md`.
- La **cancellazione o archiviazione della Persona non implica automaticamente la cancellazione immediata dell'Account**: i due cicli di vita sono distinti e possono procedere con tempistiche diverse, nel rispetto di eventuali obblighi di conservazione (§11, §13).
- **Identità civile verificata e accesso applicativo sono concetti distinti**: un Account può essere pienamente operativo (autenticato, con permessi attivi) senza che la relativa Identità civile sia mai stata verificata, e viceversa una Identità civile verificata non garantisce da sola alcun particolare livello di accesso (§10).

---

## 4. Metodi e livelli di autenticazione

**Tipologie concettuali di autenticazione.**

| Tipo | Descrizione |
|---|---|
| **Autenticazione tramite conoscenza** | Basata su un'informazione che solo il soggetto dovrebbe conoscere |
| **Autenticazione tramite possesso** | Basata sul controllo di uno strumento o riferimento specifico |
| **Autenticazione tramite caratteristica personale** | Basata su un attributo proprio del soggetto |
| **Autenticazione assistita** | Effettuata con l'intervento di un operatore o di un processo di supporto, anziché in autonomia |
| **Accesso tramite soggetto esterno** | L'Identità digitale è confermata attraverso un soggetto terzo di cui la piattaforma si fida per quel fine, senza gestirne il meccanismo interno |
| **Accesso temporaneo** | Un accesso concesso per una finalità e una durata limitate, senza costituire un Account ordinario |
| **Accesso di recupero** | Un accesso concesso specificamente nell'ambito di un processo di Recupero dell'accesso (§11) |
| **Autenticazione con più fattori** | Richiede il superamento di più Fattori di autenticazione indipendenti |
| **Autenticazione rafforzata** | Un livello di autenticazione superiore, richiesto per azioni particolarmente sensibili |
| **Autenticazione incompleta** | Un tentativo che ha superato solo parte dei fattori richiesti |
| **Autenticazione contestata** | Un'autenticazione la cui genuinità è stata messa in dubbio, in attesa di verifica ulteriore |
| **Autenticazione revocata** | Un'autenticazione precedentemente valida che non è più considerata tale |

**Distinzioni sullo stato di un Metodo di autenticazione.**

| Stato | Significato |
|---|---|
| **Metodo disponibile** | Esiste come opzione offerta dalla piattaforma, non ancora scelto da alcun Account |
| **Metodo associato** | È stato collegato a uno specifico Account |
| **Metodo verificato** | Il collegamento all'Account è stato confermato con un riscontro indipendente |
| **Metodo attivo** | È correntemente utilizzabile per autenticare l'Identità digitale |
| **Metodo sospeso** | È temporaneamente non utilizzabile, per motivi dichiarati |
| **Metodo revocato** | Non è più utilizzabile in modo definitivo |
| **Metodo utilizzato in una specifica sessione** | Fa riferimento all'occorrenza concreta di utilizzo, distinta dalla disponibilità generale del Metodo (§12) |

**Principio.** Il livello di autenticazione richiesto deve poter variare in base alla sensibilità dell'azione richiesta: un'azione a basso impatto può richiedere un livello ordinario, mentre un'azione sensibile (es. una modifica a un'Associazione operativa con Impresa, §5) può richiedere un'Autenticazione rafforzata. Questo documento non descrive protocolli, tecnologie o meccanismi specifici con cui ciascun Metodo è implementato.

---

## 5. Associazione con Persona, Impresa e Appartenenze

| Concetto | Definizione |
|---|---|
| **Associazione tra Account e Persona** | Il collegamento dichiarato tra un Account e una Persona esistente in `logical/persone.md` |
| **Associazione verificata** | Un'Associazione per cui esiste un riscontro indipendente della corrispondenza (§10) |
| **Associazione contestata** | Un'Associazione la cui correttezza è stata messa in dubbio |
| **Associazione revocata** | Un'Associazione precedentemente valida che è stata dichiarata non più corretta o non più in vigore |
| **Persona che opera per sé** | Il Contesto di azione in cui l'Identità digitale agisce a titolo proprio |
| **Persona che opera per un'Impresa** | Il Contesto di azione in cui l'Identità digitale agisce per conto di un'Impresa, sulla base di un'Appartenenza o di una Delega compatibile |
| **Persona che opera per più Imprese** | Una Persona può avere più Associazioni operative attive contemporaneamente, ciascuna riconducibile a un'Appartenenza distinta |
| **Persona che cambia contesto di azione** | Il passaggio, nel corso di una stessa Sessione o tra Sessioni diverse, da un Contesto di azione a un altro |
| **Azione in proprio** | Un'azione compiuta nel Contesto "per sé" |
| **Azione per conto di un'Impresa** | Un'azione compiuta nel Contesto "per un'Impresa", riconducibile a un'Appartenenza o Delega |
| **Azione per conto di un'organizzazione** | Analoga all'azione per conto di un'Impresa, riferita a un'organizzazione secondo le stesse regole |
| **Delega operativa** | La Delega (§8) che può fondare, in alternativa o a integrazione di un'Appartenenza, un'Associazione operativa con Impresa |
| **Titolo di rappresentanza** | Il fondamento dichiarato (Appartenenza, Delega) che giustifica un'azione per conto di un'Impresa; non è mai generato da questo dominio, ma sempre verificato rispetto ai domini sorgente |
| **Limite del contesto** | L'insieme di azioni o informazioni non accessibili in un dato Contesto, anche quando l'Identità digitale sarebbe altrimenti autenticata |

**Conferme.**
- L'**Account è sempre riconducibile a un'Identità digitale**: non esiste un Account privo di alcuna Identità digitale associata.
- L'**azione per conto di un'Impresa richiede una Persona associata**: coerente con l'introduzione strategica, un'Impresa non possiede mai credenziali proprie.
- Il **titolo per agire per l'Impresa deriva da Appartenenze** (`logical/appartenenze.md`, in particolare l'Autorizzazione gestionale, §2 di quel documento) **o da una Delega compatibile con esse** (§8): Identità & Accessi verifica l'esistenza del titolo, non lo crea.
- **Identità & Accessi non crea proprietà, amministrazione o rappresentanza**: questi fatti restano di competenza esclusiva di `logical/imprese.md` e `logical/appartenenze.md`.
- Il **cambio di contesto non modifica l'identità dell'Account**: la stessa Identità digitale resta la stessa, indipendentemente dal Contesto di azione selezionato in un dato momento.
- I **permessi disponibili possono cambiare in base al contesto di azione**: un Ruolo applicativo attivo nel Contesto "per sé" può non essere disponibile (o esserlo in forma diversa) nel Contesto "per un'Impresa" (§6).

---

## 6. Ruoli applicativi e permessi

**Distinzioni tra tipi di ruolo e concetti collegati.**

| Concetto | Definizione |
|---|---|
| **Ruolo applicativo** | Un insieme nominato di permessi assegnabile a un Account in un dato Contesto, definito e governato da questo dominio |
| **Ruolo di dominio** | Un ruolo definito da un altro dominio (es. Ruolo di un'Appartenenza in `logical/appartenenze.md` §2) che descrive un fatto di business, non un permesso tecnico |
| **Ruolo organizzativo** | Analogo al Ruolo di dominio, riferito a un'organizzazione istituzionale (`logical/imprese.md`) |
| **Qualifica professionale** | Concetto di `logical/professionisti.md`: non equivale né si traduce automaticamente in un Ruolo applicativo |
| **Funzione editoriale** | Concetto di `logical/contenuti-editoriali.md` (autore, curatore, revisore, responsabile editoriale): può corrispondere a un Ruolo applicativo di questo dominio, che ne consente l'esercizio tecnico |
| **Permesso** | La singola facoltà tecnica di compiere un'azione o accedere a un'informazione |
| **Capacità operativa** | L'insieme delle azioni concretamente disponibili per un Account in un Contesto, risultante dalla combinazione di Ruoli e Permessi attivi |
| **Responsabilità** | Concetto descrittivo, non tecnico: l'aspettativa di correttezza legata a un Ruolo, che resta un fatto di governance, non un permesso |
| **Autorizzazione temporanea** | Un Permesso concesso per una durata limitata, oltre la quale cessa senza necessità di revoca esplicita |
| **Eccezione** | Un Permesso concesso in deroga alla Politica di accesso ordinaria, per un caso specifico e motivato |
| **Restrizione** | Un limite esplicito che riduce la Capacità operativa altrimenti disponibile secondo un Ruolo |

**Possibili Ruoli applicativi (elenco non esaustivo, non gerarchico):** visitatore; Account registrato; Persona associata; referente di Impresa; operatore autorizzato; Professionista associato; autore; revisore; responsabile editoriale; ricercatore; validatore; moderatore; amministratore funzionale; assistenza; soggetto esterno autorizzato. Questo elenco è coerente con gli attori concettuali già individuati in `docs/domain-model.md` §13 (Visitatore anonimo, Persona autenticata, Persona con Appartenenza attiva, Partner, Redazione/Staff di piattaforma), qui declinati in Ruoli applicativi espliciti di questo dominio.

**Principi.**
- I Ruoli applicativi **non costituiscono una gerarchia obbligatoria**: un Ruolo non è automaticamente "superiore" a un altro; ciascuno definisce un proprio insieme di Permessi.
- Un **Account può avere più Ruoli applicativi**, anche in Contesti diversi (es. "referente di Impresa" nel Contesto per l'Impresa A, "autore" nel Contesto per sé).
- Un **Ruolo non deve attribuire automaticamente tutti i permessi collegati ad altri ruoli**: l'assegnazione di un Ruolo non implica l'assegnazione implicita di Permessi appartenenti a Ruoli differenti, anche quando questi appaiono "vicini" o "superiori" nell'elenco.

---

## 7. Politiche e decisioni di accesso

| Concetto | Definizione |
|---|---|
| **Soggetto richiedente** | L'Identità digitale che avanza una richiesta di accesso |
| **Identità utilizzata** | La specifica Identità digitale (e relativo Metodo di autenticazione) impiegata per la richiesta |
| **Contesto** | Il Contesto di azione (§5) in cui la richiesta è formulata |
| **Risorsa logica** | L'informazione o funzionalità, appartenente a un dominio proprietario, a cui si richiede l'accesso |
| **Azione richiesta** | L'operazione che il Soggetto richiedente intende compiere sulla Risorsa logica |
| **Ruolo** | Il Ruolo applicativo attivo del Soggetto richiedente nel Contesto (§6) |
| **Permesso** | La facoltà tecnica specifica coinvolta nella richiesta |
| **Politica** | La regola dichiarata che determina l'esito della richiesta in base alle condizioni presenti |
| **Condizione** | Un fattore che la Politica considera per determinare l'esito (es. stato dell'Account, verifica dell'associazione) |
| **Restrizione** | Un limite applicato all'esito, anche quando le condizioni di base sarebbero soddisfatte |
| **Decisione** | L'esito prodotto dall'applicazione della Politica alla richiesta specifica |
| **Motivazione** | La spiegazione concettuale associata a una Decisione, in particolare se negativa o limitata |
| **Durata** | Il periodo per cui una Decisione resta valida, quando applicabile |
| **Provenienza della regola** | Il dominio o il livello (Politica generale, Ruolo, Delega, Consenso) da cui la regola applicata deriva |
| **Eccezione** | Una deroga dichiarata e motivata rispetto alla Politica ordinaria (§6) |
| **Revisione** | Il riesame di una Decisione precedente, a seguito di nuove informazioni o di una contestazione |

**Una Decisione di accesso deve poter considerare almeno:**
- stato dell'Account (§11);
- livello di autenticazione (§4);
- verifica dell'associazione con Persona (§5, §10);
- Contesto di azione (§5);
- Appartenenza valida (`logical/appartenenze.md`);
- Delega valida (§8);
- Consenso (§9);
- visibilità stabilita dal dominio proprietario della Risorsa logica;
- sensibilità dell'informazione;
- stato del contenuto o dell'entità nel dominio proprietario;
- eventuali sospensioni (§11);
- finalità dell'accesso.

**Distinzioni tra tipi di esito.**

| Esito | Significato |
|---|---|
| **Accesso consentito** | La richiesta è pienamente soddisfatta secondo la Politica applicata |
| **Accesso negato** | La richiesta non è soddisfatta |
| **Accesso limitato** | La richiesta è soddisfatta solo parzialmente, con Restrizioni esplicite |
| **Accesso temporaneo** | La richiesta è soddisfatta per una Durata limitata |
| **Accesso subordinato a verifica ulteriore** | La richiesta resta in sospeso fino al superamento di una Verifica aggiuntiva |
| **Accesso revocato** | Un accesso precedentemente consentito non è più valido |

**Principio.** Identità & Accessi deve applicare la visibilità definita dai domini sorgente (coerente con `logical/contenuti-editoriali.md` §12/§13, `logical/osservatorio.md` §12, e con il principio "Ricerca non decide le regole di visibilità" di `docs/domain-model.md` §1), non ridefinirla arbitrariamente: la Politica di accesso traduce in Decisioni la visibilità già stabilita altrove, senza introdurre criteri di visibilità propri e indipendenti da essa.

---

## 8. Deleghe e rappresentanza operativa

| Concetto | Definizione |
|---|---|
| **Delega** | Il trasferimento dichiarato di una porzione limitata di accesso da un Delegante a un Delegato |
| **Delegante** | Il soggetto che concede la Delega, e che deve possedere il titolo per farlo |
| **Delegato** | Il soggetto che riceve la Delega |
| **Oggetto** | Ciò a cui la Delega si applica (un'azione, un contenuto, un contesto) |
| **Ambito** | L'estensione della Delega, in termini di azioni, informazioni o Contesti coperti |
| **Durata** | Il periodo per cui la Delega resta efficace |
| **Data di efficacia** | Il momento da cui la Delega diventa operativa |
| **Scadenza** | Il momento in cui la Delega cessa automaticamente di essere efficace |
| **Accettazione** | La conferma, da parte del Delegato, di voler ricevere la Delega |
| **Revoca** | L'atto con cui il Delegante (o chi ne ha titolo) pone fine alla Delega prima della sua Scadenza naturale |
| **Sospensione** | L'interruzione temporanea dell'efficacia della Delega, senza revocarla definitivamente |
| **Limitazione** | Una riduzione dell'Ambito della Delega, dichiarata successivamente alla sua concessione |
| **Sostituzione** | La concessione di una nuova Delega che prende il posto di una precedente per lo stesso Oggetto |
| **Delega singola** | Una Delega valida per una sola occorrenza di utilizzo |
| **Delega continuativa** | Una Delega valida per un periodo prolungato, utilizzabile più volte entro l'Ambito dichiarato |
| **Delega per specifica azione** | Una Delega limitata a un'azione dichiarata |
| **Delega per specifica Impresa** | Una Delega limitata al Contesto di una singola Impresa |
| **Delega per specifico dominio** | Una Delega limitata alle Risorse logiche di un singolo dominio (es. solo Contenuti Editoriali) |
| **Delega per specifico contenuto** | Una Delega limitata a una singola Risorsa logica identificata |

**Chiarimenti.**
- Una **Delega di accesso non crea proprietà**: il Delegato non acquisisce alcun diritto sostanziale sull'Oggetto della Delega.
- Una **Delega non crea automaticamente rappresentanza legale**: la rappresentanza legale di un'Impresa resta un fatto di `logical/imprese.md` e `logical/appartenenze.md` (Titolo di rappresentanza, §5), non generato da questo dominio.
- Una **Delega non sostituisce l'Appartenenza quando questa è necessaria**: se un'azione richiede per sua natura un'Appartenenza (es. una modifica che presuppone un ruolo di dominio riconosciuto), una Delega non può da sola fondare quell'azione.
- Il **Delegante deve avere il potere di attribuire l'accesso delegato**: una Delega concessa da chi non possiede il relativo titolo non è valida (§13, caso limite 14).
- **Nessuno può delegare più diritti di quelli che possiede**: l'Ambito di una Delega non può eccedere la Capacità operativa del Delegante al momento della concessione.
- La **revoca deve interrompere l'accesso futuro, senza cancellare lo storico delle azioni già compiute**: le azioni svolte legittimamente durante il periodo di efficacia della Delega restano valide e tracciate (§12, §13).
- Una **delega scaduta non equivale a delega revocata**: la Scadenza è un esito naturale e previsto, distinto dalla Revoca, che è un atto deliberato.
- Una **delega contestata può essere sospesa senza essere definitivamente annullata**: la Sospensione permette di congelare l'efficacia della Delega in attesa di chiarimento, senza equivalere a una Revoca.

---

## 9. Consensi, finalità e preferenze di accesso

**Distinzioni tra tipi di espressione di volontà.**

| Concetto | Definizione |
|---|---|
| **Consenso** | L'espressione di volontà di un soggetto rispetto a una specifica Finalità di accesso o trattamento |
| **Base giuridica diversa dal Consenso** | Il riconoscimento che non ogni trattamento richiede un Consenso: alcune basi di legittimità sono diverse e non sono modellate in dettaglio da questo dominio (§15) |
| **Preferenza** | Una scelta dichiarata dal soggetto che orienta un comportamento della piattaforma, senza costituire un Consenso a una finalità di trattamento |
| **Autorizzazione operativa** | Un consenso specifico a un'azione operativa (es. l'attivazione di un Metodo di autenticazione), distinto da un Consenso di finalità generale |
| **Accettazione di condizioni** | La dichiarazione di aver accettato un insieme di termini, distinta da un Consenso puntuale a una singola Finalità |
| **Presa visione** | La dichiarazione di aver letto un'informazione, senza che questo implichi un'Accettazione o un Consenso |
| **Scelta editoriale** | Concetto di dominio esterno (`logical/contenuti-editoriali.md`): non rientra in questo dominio se non quando implica un Consenso di accesso (es. consenso alla pubblicazione a proprio nome) |
| **Iscrizione a comunicazioni** | Una Preferenza specifica relativa alla ricezione di comunicazioni, gestita in coordinamento con il dominio Notifiche |
| **Delega** | Vedi §8: distinta dal Consenso perché trasferisce accesso, non esprime volontà su una finalità di trattamento |

**Per ogni Consenso, informazioni descritte (almeno):**
- soggetto che lo esprime;
- Finalità;
- Ambito;
- informazioni coinvolte;
- momento in cui è stato espresso;
- Durata;
- eventuale Scadenza;
- modalità di Revoca;
- stato;
- provenienza;
- eventuale Evidenza.

**Stati del Consenso.**

| Stato | Significato |
|---|---|
| **Richiesto** | La Finalità è stata presentata al soggetto, in attesa di risposta |
| **Espresso** | Il soggetto ha manifestato volontà positiva |
| **Rifiutato** | Il soggetto ha manifestato volontà negativa |
| **Parziale** | Il soggetto ha espresso Consenso solo per una parte della Finalità o dell'Ambito proposti |
| **Revocato** | Il soggetto ha ritirato un Consenso precedentemente espresso |
| **Scaduto** | Il Consenso ha raggiunto la propria Scadenza dichiarata |
| **Superato** | Il Consenso è stato sostituito da una nuova richiesta o versione della Finalità |
| **Contestato** | La validità del Consenso espresso è stata messa in dubbio |

**Principi.**
- La **revoca del Consenso non deve cancellare automaticamente fatti o attività svolti legittimamente in precedenza**: coerente con il principio analogo già stabilito per le Deleghe (§8) e per le Revisioni dell'Osservatorio (`logical/osservatorio.md` §9, §12).
- Identità & Accessi deve **governare il consenso all'accesso o al trattamento**, **senza sostituire un futuro modello legale completo della privacy**: questo documento non esaurisce le basi giuridiche del trattamento dei dati, che restano materia di un futuro dominio o disciplina dedicata (§15).

---

## 10. Verifica dell'identità e affidabilità dell'accesso

Coerentemente con il principio, già adottato in `logical/appartenenze.md` §10 ("nessun asse sostituisce gli altri... evitando un badge unico verificato che nasconderebbe più di quanto chiarisce") e in `logical/osservatorio.md` §10, la verifica in questo dominio è modellata come insieme di assi indipendenti, non come un singolo giudizio.

**Assi modellati separatamente (almeno):**
- controllo del contatto;
- controllo del Metodo di autenticazione;
- associazione con Persona;
- identità dichiarata;
- identità civile;
- relazione con Impresa;
- Appartenenza;
- Delega;
- Ruolo applicativo;
- Consenso;
- contatto di recupero;
- dispositivo riconosciuto;
- evento anomalo.

**Distinzioni tra livelli di verifica.**

| Livello | Significato |
|---|---|
| **Identità non verificata** | Nessun riscontro indipendente è stato raccolto |
| **Contatto verificato** | Il canale di contatto dichiarato è stato confermato come effettivamente controllato dal soggetto |
| **Identità digitale verificata** | Il controllo dell'Identità digitale da parte del soggetto è stato confermato (§3) |
| **Associazione con Persona verificata** | Il collegamento tra l'Account e la Persona dichiarata è stato confermato (§5) |
| **Identità civile verificata** | L'identità reale del soggetto, nel senso anagrafico o civile, è stata confermata secondo un riscontro indipendente |
| **Relazione organizzativa verificata** | Il legame con un'Impresa (Appartenenza o Delega) è stato confermato (§5, §8) |
| **Delega verificata** | Il potere del Delegante e la validità della Delega sono stati confermati (§8) |

**Principio.** Si evita deliberatamente un unico badge generico di "utente verificato": ciascun livello descrive un aspetto specifico e indipendente, coerente con il principio già stabilito nei domini precedenti.

**La verifica dell'identità non dimostra automaticamente:**
- qualifica professionale (`logical/professionisti.md`);
- affidabilità economica;
- rappresentanza (`logical/imprese.md`, `logical/appartenenze.md`);
- correttezza;
- competenza (`logical/persone.md`);
- titolarità di un'Impresa;
- idoneità a ottenere un'Opportunità (`logical/opportunita.md`).

---

## 11. Ciclo di vita dell'Account e recupero dell'accesso

Coerentemente con il pattern multi-asse già adottato in tutti i domini precedenti, il ciclo di vita di un Account non è un singolo stato: sono **otto assi indipendenti**, ciascuno con il proprio vocabolario, che non devono essere compressi in un unico stato generale.

| Asse | Dove è definito il vocabolario | Nota |
|---|---|---|
| **Stato dell'Account** | Elenco dedicato sotto (14 stati) | L'asse principale, oggetto di questa sezione |
| **Stato dell'identità digitale** | §10 (non verificata → verificata) | Indipendente dallo stato operativo dell'Account: un Account attivo può avere un'Identità digitale non ancora verificata |
| **Stato dei metodi di autenticazione** | §4 (disponibile, associato, verificato, attivo, sospeso, revocato) | Ogni Metodo ha un proprio stato, indipendente dagli altri Metodi dello stesso Account |
| **Stato dell'associazione con Persona** | §5 (verificata, contestata, revocata) | Indipendente dallo stato dell'Account: un'Associazione può essere contestata senza che l'Account venga sospeso |
| **Stato delle deleghe** | §8 (efficace, sospesa, revocata, scaduta, contestata) | Ogni Delega ha un proprio ciclo, indipendente dallo stato dell'Account delegante o delegato |
| **Stato dei consensi** | §9 (richiesto, espresso, rifiutato, parziale, revocato, scaduto, superato, contestato) | Indipendente dallo stato dell'Account |
| **Stato di una sessione** | §12 | Ogni Sessione concettuale ha un proprio ciclo (avviata, attiva, scaduta, revocata) |
| **Stato di sicurezza** | §12 | Descrive il livello di allerta concettuale, indipendente dallo stato operativo dell'Account |

**Stati concettuali dell'Account (14):**

| Stato | Significato |
|---|---|
| **Invitato** | Un Account è stato proposto ma non ancora attivato dal soggetto destinatario |
| **Registrato** | Il soggetto ha completato la registrazione iniziale |
| **In attesa di verifica** | Uno o più elementi necessari (contatto, identità) sono in attesa di conferma |
| **Attivo** | L'Account può essere utilizzato ordinariamente |
| **Limitato** | L'Account è utilizzabile solo entro una Capacità operativa ridotta |
| **In recupero** | È in corso un processo di Recupero dell'accesso |
| **Contestato** | Lo stato o la titolarità dell'Account sono stati messi in discussione |
| **Sospeso** | L'accesso è temporaneamente interrotto per motivi dichiarati |
| **Bloccato** | L'accesso è interrotto per una misura di sicurezza specifica (§12) |
| **Compromesso** | Esiste un fondato motivo di ritenere che il controllo dell'Account sia stato acquisito da un soggetto non autorizzato |
| **Disattivato** | Il soggetto ha scelto di non utilizzare più l'Account, senza richiederne la chiusura definitiva |
| **Chiuso** | L'accesso tramite questo Account è cessato in modo definitivo |
| **Archiviato** | L'Account chiuso è conservato come riferimento storico, nel rispetto di eventuali obblighi di conservazione |
| **Riattivato** | Un Account precedentemente Disattivato o Sospeso è tornato utilizzabile |

**Recupero dell'accesso.**

| Concetto | Definizione |
|---|---|
| **Recupero ordinario** | Il soggetto riottiene l'accesso attraverso un Metodo di autenticazione alternativo già disponibile |
| **Recupero assistito** | Il recupero avviene con l'intervento di un operatore o di un processo di supporto dedicato |
| **Sostituzione del metodo** | Un Metodo di autenticazione non più disponibile viene sostituito con uno nuovo, previa Verifica |
| **Verifica aggiuntiva** | Un controllo supplementare richiesto prima di completare il recupero, quando il rischio è ritenuto elevato |
| **Contestazione del recupero** | Il tentativo di recupero è messo in dubbio, ad esempio da un altro soggetto che rivendica lo stesso Account |
| **Recupero negato** | Il tentativo di recupero non ha superato le Verifiche richieste |
| **Recupero completato** | Il soggetto ha riottenuto l'accesso all'Account |

**Principio.** Il recupero non deve consentire di modificare impropriamente l'Associazione con la Persona o le Appartenenze: un processo di Recupero dell'accesso restituisce il controllo dell'Account esistente, non crea né altera i fatti di dominio (Associazione, Appartenenza, Delega) a esso collegati, che restano soggetti alle proprie regole di verifica e modifica (§5, §8, §10).

---

## 12. Sessioni, sicurezza e tracciabilità concettuale

| Concetto | Definizione |
|---|---|
| **Sessione** | L'intervallo durante il quale un'Identità digitale autenticata opera sulla piattaforma in un dato Contesto (§2, §5) |
| **Inizio** | Il momento in cui una Sessione diventa attiva, a seguito di un'autenticazione riuscita |
| **Fine** | Il momento in cui una Sessione termina, per scelta del soggetto o per altra causa |
| **Scadenza** | La cessazione automatica di una Sessione dopo un periodo dichiarato |
| **Rinnovo** | L'estensione della validità di una Sessione, secondo condizioni dichiarate |
| **Revoca** | La cessazione anticipata e deliberata di una Sessione, prima della sua Scadenza naturale |
| **Contesto attivo** | Il Contesto di azione (§5) selezionato durante una Sessione |
| **Livello di autenticazione della sessione** | Il livello (ordinario, rafforzato) raggiunto durante l'autenticazione che ha originato la Sessione (§4) |
| **Dispositivo riconosciuto** | Uno strumento già associato a precedenti Sessioni della stessa Identità digitale |
| **Dispositivo non riconosciuto** | Uno strumento non precedentemente associato, che può richiedere una Verifica aggiuntiva |
| **Attività anomala** | Un comportamento che si discosta da un pattern atteso per quella Identità digitale |
| **Tentativo fallito** | Un tentativo di autenticazione non concluso con successo |
| **Blocco temporaneo** | Una misura di sicurezza che impedisce nuovi tentativi per un periodo dichiarato, a seguito di più Tentativi falliti |
| **Incidente** | Un fatto di sicurezza rilevante che ha avuto o potrebbe aver avuto conseguenze concrete |
| **Compromissione sospetta** | Un fondato motivo di ritenere che il controllo di un'Identità digitale sia stato acquisito da un soggetto non autorizzato, non ancora confermato |
| **Verifica aggiuntiva** | Un controllo supplementare richiesto in presenza di segnali di rischio (§4, §11) |
| **Registrazione delle decisioni di accesso** | Il mantenimento concettuale della tracciabilità di ogni Decisione di accesso presa (§7) |

**Distinzioni sempre da mantenere.**
- **Accesso all'Account** — l'atto puntuale di autenticazione.
- **Sessione attiva** — l'intervallo risultante da un accesso riuscito.
- **Contesto di azione** — la modalità operativa scelta all'interno della Sessione (§5).
- **Singola Decisione di accesso** — l'esito di una specifica richiesta durante la Sessione (§7).
- **Azione effettuata** — l'operazione concreta compiuta dopo una Decisione di accesso positiva.
- **Evento di sicurezza** — un fatto relativo alla sicurezza concettuale dell'Account, che può verificarsi indipendentemente da una Sessione specifica.

**La tracciabilità deve consentire di comprendere concettualmente:**
- chi ha agito (Identità digitale);
- per conto di chi (Contesto di azione, §5);
- con quale ruolo (Ruolo applicativo, §6);
- sulla base di quale permesso (§6, §7);
- in quale contesto (§5, §7);
- in quale momento (Sessione, §12);
- con quale esito (Decisione di accesso, §7).

Questo documento non descrive registri tecnici, strumenti di logging o meccanismi di conservazione specifici: la tracciabilità è qui trattata come proprietà concettuale che il dominio deve garantire, non come componente implementativa.

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Account deve avere almeno un'Identità digitale (§2, §3).
2. Account e Persona restano distinti (§3).
3. Una Persona può esistere senza Account (§3).
4. La chiusura dell'Account non cancella automaticamente la Persona (§3, §11).
5. Un'Impresa non possiede direttamente credenziali personali (introduzione, §5).
6. Ogni azione per conto di un'Impresa deve essere riconducibile a una Persona (§5).
7. La relazione con l'Impresa deriva da Appartenenze (§5, coerente con `logical/appartenenze.md`).
8. Una delega non può attribuire più diritti di quelli posseduti dal delegante (§8).
9. Una delega non crea proprietà o rappresentanza legale (§8).
10. Un ruolo applicativo non equivale a qualifica professionale (§6).
11. Un permesso non equivale a diritto sostanziale nel dominio interessato (§6, §7).
12. Autenticazione e autorizzazione sono concetti distinti (§4, §6).
13. Verifica dell'identità e affidabilità sono concetti distinti (§10).
14. Consenso, delega, permesso e preferenza sono concetti distinti (§6, §8, §9).
15. La visibilità è definita dal dominio proprietario dell'informazione (§7).
16. Identità & Accessi applica le decisioni di accesso senza diventare proprietario dei contenuti (§1, §7).
17. Le sospensioni devono poter essere limitate per ambito (§11, §13 caso limite 37).
18. La chiusura dell'Account deve conservare lo storico necessario (§11, §12).
19. Le azioni compiute legittimamente non vengono annullate automaticamente dalla successiva revoca (§8, §9, §12).
20. Identità & Accessi non attribuisce qualifiche, proprietà, appartenenze o reputazione (§1).

**Casi limite.**

| # | Caso | Trattamento previsto |
|---|---|---|
| 1 | Account senza Persona associata | Ammesso come stato transitorio (§3); l'Account resta valido ma con Capacità operativa limitata fino all'associazione |
| 2 | Persona senza Account | Condizione ordinaria e legittima (§3): la Persona esiste in `logical/persone.md` indipendentemente da qualsiasi Account |
| 3 | Persona con più Account | Caso eccezionale (§3); richiede un processo dichiarato di riconoscimento, e valutazione per un'eventuale Fusione di Account (caso 41) |
| 4 | Più metodi di autenticazione per lo stesso Account | Ammesso ordinariamente (§4); ciascun Metodo ha uno stato indipendente |
| 5 | Metodo di autenticazione perso | Avvia un Recupero dell'accesso con Sostituzione del metodo (§11) |
| 6 | Contatto di recupero non più disponibile | Richiede un Recupero assistito (§11), con Verifica aggiuntiva |
| 7 | Account compromesso | Transita nello stato "Compromesso" (§11); le Sessioni attive possono essere revocate (§12) |
| 8 | Account rivendicato da due soggetti | Trattato come Associazione contestata (§5) e Account "Contestato" (§11), in attesa di Verifica |
| 9 | Associazione Account–Persona errata | Trattata come Associazione contestata, poi eventualmente revocata e corretta (§5) |
| 10 | Persona che cambia contatto principale | Non altera l'Associazione con Persona; richiede una nuova Verifica del contatto (§10) |
| 11 | Persona che opera per più Imprese | Ammesso ordinariamente (§5): più Associazioni operative distinte, ciascuna da un'Appartenenza propria |
| 12 | Persona proprietaria di un'Impresa ma senza Ruolo applicativo | Il fatto di proprietà resta valido in `logical/imprese.md`; l'assenza di un Ruolo applicativo limita solo la Capacità operativa tecnica, non la titolarità sostanziale (§6, §10) |
| 13 | Referente operativo senza rappresentanza legale | Un Ruolo applicativo o una Delega può consentire azioni operative senza che questo implichi un Titolo di rappresentanza legale (§5, §8) |
| 14 | Delega concessa da soggetto non autorizzato | Non valida (§8, regola 8): la Delega non produce Ambito operativo |
| 15 | Delega scaduta | Cessa automaticamente di essere efficace, distinta dalla Revoca (§8) |
| 16 | Delega revocata | Cessa per atto deliberato del Delegante o di chi ne ha titolo (§8) |
| 17 | Delega contestata | Può essere sospesa in attesa di chiarimento, senza revoca automatica (§8) |
| 18 | Delega a catena | Ammessa solo se ciascun Delegante nella catena possiede il titolo per il livello di Ambito che trasferisce; non è ammesso ampliare l'Ambito lungo la catena (§8, regola 9) |
| 19 | Delega parziale | Ammessa: l'Ambito può essere ridotto rispetto alla Capacità operativa massima del Delegante (§8) |
| 20 | Cambio del rappresentante dell'Impresa | Riflette un cambiamento nell'Appartenenza o nel Titolo di rappresentanza (`logical/appartenenze.md`); le Deleghe concesse dal precedente rappresentante restano soggette a riesame (§8, §5) |
| 21 | Appartenenza sospesa | L'Associazione operativa con Impresa derivata da quella Appartenenza è a sua volta limitata, coerentemente con lo stato del dominio sorgente (§5, §7) |
| 22 | Impresa cessata | Le Associazioni operative derivate perdono efficacia per le azioni che presuppongono un'Impresa attiva, senza che questo comporti la chiusura degli Account delle Persone coinvolte (§5) |
| 23 | Professionista sospeso ma Account attivo | Lo stato di verifica professionale (`logical/professionisti.md`) è una Condizione distinta dallo stato dell'Account; una Decisione di accesso può considerarlo senza che l'Account debba essere sospeso (§7, §10) |
| 24 | Autore esterno con accesso limitato | Un Ruolo applicativo "autore" può essere assegnato con un Ambito ridotto rispetto a un autore interno (§6) |
| 25 | Revisore con accesso temporaneo | Un Ruolo applicativo può essere concesso come Autorizzazione temporanea (§6) |
| 26 | Ricercatore con accesso a dati aggregati | Il Ruolo applicativo "ricercatore" può condizionare una Decisione di accesso verso `logical/osservatorio.md`, secondo le regole di quel dominio (§7) |
| 27 | Operatore di assistenza che accede per supporto | Richiede un Ruolo applicativo "assistenza" dedicato, con Registrazione della Decisione di accesso e motivazione esplicita (§6, §7, §12) |
| 28 | Account di soggetto deceduto | Non gestito automaticamente da questo dominio; richiede una procedura dichiarata, distinta dalla Chiusura ordinaria, coerente con eventuali obblighi di conservazione (§15) |
| 29 | Persona minorenne | Richiede criteri di verifica e Consenso specifici, non ulteriormente dettagliati in questo documento (§15) |
| 30 | Identità civile non verificabile | L'Account può restare "Attivo" con Identità civile "non verificata" (§10): la mancata verificabilità non comporta automaticamente una Sospensione |
| 31 | Soggetto estero | Non richiede un trattamento distinto nei principi generali; eventuali criteri specifici restano una questione aperta (§15) |
| 32 | Uso di pseudonimo pubblico con identità privata verificata | Ammesso: il Profilo pubblico (dominio esterno) può mostrare un nome non coincidente con l'Identità civile verificata internamente, purché l'Associazione con Persona resti verificata (§3, §10) |
| 33 | Consenso revocato | Cessa di produrre effetti futuri; non invalida trattamenti già svolti legittimamente (§9) |
| 34 | Consenso scaduto | Analogo alla Delega scaduta: cessazione automatica, distinta dalla Revoca (§9) |
| 35 | Dati pubblici ma evidenze riservate | La Visibilità delle informazioni di sicurezza (§2, §12) può restare riservata anche quando l'informazione sostanziale a cui si riferisce è pubblica nel dominio proprietario |
| 36 | Contenuto ritirato ancora visibile alla redazione | Una Decisione di accesso può variare per Ruolo applicativo anche sulla stessa Risorsa logica, secondo la Visibilità dichiarata dal dominio proprietario (§7, coerente con `logical/contenuti-editoriali.md` §12) |
| 37 | Sospensione limitata a un solo dominio | Ammessa: la Sospensione (§11) può avere un Ambito che coincide con le Risorse logiche di un solo dominio, senza sospendere l'intero Account |
| 38 | Accesso consentito per errore | Trattato come Decisione di accesso da sottoporre a Revisione (§7); non genera automaticamente un diritto acquisito |
| 39 | Accesso negato ingiustamente | Trattato come Decisione di accesso contestabile e soggetta a Revisione (§7) |
| 40 | Recupero Account fraudolento | Trattato come Contestazione del recupero (§11); può generare un Evento di sicurezza (§12) |
| 41 | Fusione di Account duplicati | Richiede un processo dichiarato che preservi la tracciabilità delle Sessioni e delle Decisioni pregresse di entrambi gli Account (§12, §15) |
| 42 | Separazione di Account associati erroneamente | Richiede la Revoca dell'Associazione errata e l'eventuale creazione di una nuova Associazione corretta (§5) |
| 43 | Amministratore che tenta di attribuirsi permessi | Non ammesso: l'attribuzione di un Ruolo applicativo segue una Politica di accesso propria, che non può essere elusa dal soggetto stesso che la applica (§6, §7, regola 16) |
| 44 | Utente che agisce contemporaneamente in più contesti | Ogni Sessione ha un proprio Contesto attivo (§12); l'uso simultaneo di più Contesti richiede Sessioni distinte, ciascuna tracciata separatamente |
| 45 | Account chiuso con Collaborazioni ancora attive | La Chiusura dell'Account non estingue i fatti di dominio in `logical/collaborazioni.md`; quel dominio gestisce autonomamente la continuità o l'archiviazione della Collaborazione |
| 46 | Account chiuso con Contenuti pubblicati | I Contenuti restano governati da `logical/contenuti-editoriali.md`; la Chiusura dell'Account non li ritira automaticamente (§11) |
| 47 | Richiesta di cancellazione con obblighi di conservazione | La Chiusura dell'Account può transitare verso "Archiviato" anziché una cancellazione fisica immediata, nel rispetto di obblighi dichiarati (§11, §15) |
| 48 | Identità anonima per segnalazioni | Una Segnalazione (§2) può essere ammessa senza una piena Associazione con Persona verificata, secondo Politiche dedicate (§7, §15) |
| 49 | Accesso temporaneo a un soggetto esterno | Ammesso tramite Accesso temporaneo (§4) o Ruolo applicativo "soggetto esterno autorizzato" (§6), con Durata e Ambito dichiarati |

---

## 14. Eventi di dominio

Coerentemente con il meccanismo dei "fatti accaduti" già stabilito in `docs/domain-model.md` §10, ogni evento descrive un fatto concluso di questo dominio, senza descrivere alcuna implementazione tecnica.

| Evento | Significato | Condizioni concettuali | Possibili conseguenze di dominio |
|---|---|---|---|
| **IdentitàDigitaleCreata** | Una nuova Identità digitale è stata costituita | Non esisteva ancora un'Identità digitale per il soggetto richiedente | Diventa possibile associarvi Metodi di autenticazione e un Account |
| **AccountRegistrato** | Un nuovo Account è stato creato | L'Identità digitale è disponibile | L'Account entra nello stato "Registrato" (§11) |
| **AccountAttivato** | L'Account ha completato le condizioni minime per l'uso ordinario | Le Verifiche richieste per l'attivazione sono state superate (§10) | L'Account transita verso lo stato "Attivo" |
| **AccountLimitato** | La Capacità operativa dell'Account è stata ridotta | Esiste una motivazione dichiarata (§6, §11) | Alcune Azioni non sono più consentite fino a rimozione della limitazione |
| **AccountSospeso** | L'Account è stato reso temporaneamente inutilizzabile | Esiste una motivazione dichiarata, con eventuale Ambito (§11, §13 caso limite 37) | Le Decisioni di accesso per quell'Account restano negate entro l'Ambito della Sospensione |
| **AccountBloccato** | L'accesso è stato interrotto per una misura di sicurezza | È stato rilevato un Evento di sicurezza rilevante (§12) | Nuovi tentativi di autenticazione sono impediti fino a rimozione del Blocco |
| **AccountCompromesso** | È stato riconosciuto un fondato rischio di controllo non autorizzato | Esiste un'Evidenza a supporto (§2, §12) | Le Sessioni attive possono essere revocate; può essere richiesto un Recupero assistito (§11) |
| **AccountDisattivato** | Il soggetto ha scelto di non utilizzare più l'Account senza chiuderlo definitivamente | È una scelta volontaria del soggetto | L'Account resta recuperabile tramite Riattivazione |
| **AccountChiuso** | L'accesso tramite l'Account è cessato in modo definitivo | La Chiusura è stata confermata | Lo storico necessario resta conservato (§11, regola 18); la Persona associata non è toccata (§3) |
| **AccountRiattivato** | Un Account Disattivato o Sospeso è tornato utilizzabile | Le condizioni per la riattivazione sono state soddisfatte | L'Account transita verso lo stato "Attivo" |
| **MetodoAutenticazioneAssociato** | Un nuovo Metodo di autenticazione è stato collegato all'Account | Il soggetto ha completato l'associazione (§4) | Il Metodo entra nello stato "associato" |
| **MetodoAutenticazioneVerificato** | Il collegamento del Metodo è stato confermato | Un riscontro indipendente è stato raccolto (§10) | Il Metodo diventa utilizzabile per l'autenticazione ordinaria |
| **MetodoAutenticazioneSospeso** | Un Metodo attivo è stato reso temporaneamente inutilizzabile | Esiste una motivazione dichiarata | Il Metodo non può essere usato fino a rimozione della sospensione |
| **MetodoAutenticazioneRevocato** | Un Metodo è stato definitivamente disattivato | La Revoca è stata confermata dal soggetto o da un processo autorizzato | Il Metodo non è più disponibile per autenticare l'Identità digitale |
| **AssociazionePersonaRichiesta** | È stata proposta un'Associazione tra un Account e una Persona | Entrambi i soggetti sono identificati (§5) | L'Associazione entra in attesa di Verifica |
| **AccountAssociatoAPersona** | L'Associazione tra Account e Persona è stata stabilita | La richiesta è stata confermata (§5) | L'Account può assumere Ruoli applicativi legati a quella Persona |
| **AssociazionePersonaContestata** | La correttezza dell'Associazione è stata messa in dubbio | Esiste un motivo di contestazione dichiarato | L'Associazione transita verso lo stato "contestata" (§5), in attesa di Verifica |
| **AssociazionePersonaRevocata** | Un'Associazione precedentemente valida è stata dichiarata non più valida | La Revoca è stata confermata | L'Account perde la Capacità operativa derivata da quella Associazione |
| **ContestoDiAzioneSelezionato** | Un Contesto di azione è stato scelto per una Sessione | L'Account dispone di più Contesti disponibili (§5) | La Capacità operativa della Sessione si conforma al Contesto scelto |
| **RuoloApplicativoAssegnato** | Un Ruolo applicativo è stato assegnato a un Account in un Contesto | Una Politica di accesso lo consente (§6, §7) | L'Account acquisisce i Permessi associati al Ruolo in quel Contesto |
| **RuoloApplicativoRevocato** | Un Ruolo applicativo precedentemente assegnato è stato rimosso | Esiste una motivazione dichiarata | L'Account perde i Permessi associati al Ruolo revocato |
| **PermessoConcesso** | Un Permesso specifico è stato attribuito, anche indipendentemente da un Ruolo | Una Politica o un'Eccezione lo consente (§6, §7) | La Capacità operativa dell'Account si amplia entro quel Permesso |
| **PermessoNegato** | Una richiesta di Permesso non è stata concessa | La Politica applicata produce un esito negativo | La Capacità operativa dell'Account resta invariata |
| **PermessoRevocato** | Un Permesso precedentemente concesso è stato ritirato | Esiste una motivazione dichiarata | La Capacità operativa dell'Account si riduce di conseguenza |
| **PoliticaAccessoModificata** | Una Politica di accesso è stata aggiornata | La modifica è dichiarata (§7) | Le Decisioni di accesso successive seguono la nuova Politica; quelle già assunte restano storicizzate |
| **DecisioneAccessoAssunta** | Una richiesta di accesso ha prodotto un esito | Le Condizioni sono state valutate (§7) | L'esito determina se l'Azione richiesta può proseguire |
| **DelegaConcessa** | Una nuova Delega è stata dichiarata da un Delegante | Il Delegante possiede il titolo necessario (§8) | La Delega entra in attesa di Accettazione |
| **DelegaAccettata** | Il Delegato ha confermato di voler ricevere la Delega | La Delega era stata concessa | La Delega diventa efficace secondo la Data di efficacia dichiarata |
| **DelegaLimitata** | L'Ambito di una Delega è stato ridotto | Esiste una motivazione dichiarata (§8) | La Capacità operativa derivata dalla Delega si riduce |
| **DelegaSospesa** | L'efficacia di una Delega è stata temporaneamente interrotta | Esiste un motivo dichiarato, anche in caso di Contestazione (§8) | La Delega non produce effetti fino a rimozione della sospensione |
| **DelegaRevocata** | Una Delega è stata definitivamente ritirata dal Delegante o da chi ne ha titolo | La Revoca è stata confermata | La Delega cessa di produrre effetti futuri; lo storico resta tracciato (§8, regola 19) |
| **DelegaScaduta** | Una Delega ha raggiunto la propria Scadenza | Il periodo dichiarato è trascorso | La Delega cessa automaticamente di essere efficace, distinta da una Revoca |
| **ConsensoRichiesto** | Una Finalità di consenso è stata presentata a un soggetto | La richiesta è formulata (§9) | Il Consenso entra nello stato "richiesto" |
| **ConsensoEspresso** | Il soggetto ha manifestato volontà positiva | La richiesta era pendente | Il trattamento associato alla Finalità diventa legittimo secondo quel Consenso |
| **ConsensoRifiutato** | Il soggetto ha manifestato volontà negativa | La richiesta era pendente | Il trattamento associato alla Finalità non è legittimato da questo Consenso |
| **ConsensoRevocato** | Un Consenso precedentemente espresso è stato ritirato | La Revoca è stata confermata | Il trattamento futuro associato cessa di essere legittimato; le attività pregresse restano legittime (§9, regola) |
| **ConsensoScaduto** | Un Consenso ha raggiunto la propria Scadenza | Il periodo dichiarato è trascorso | Il Consenso cessa automaticamente di produrre effetti |
| **RecuperoAccessoRichiesto** | Un soggetto ha richiesto di recuperare l'accesso a un Account | Un Metodo di autenticazione non è più disponibile (§11) | Il processo di Recupero entra in avvio |
| **RecuperoAccessoAvviato** | Il processo di Recupero è iniziato formalmente | La richiesta è stata accolta come plausibile | L'Account transita, se necessario, verso lo stato "In recupero" (§11) |
| **RecuperoAccessoContestato** | Il tentativo di Recupero è stato messo in dubbio | Un altro soggetto o un controllo automatico segnala un'anomalia (§13 caso limite 40) | Il Recupero è sospeso in attesa di Verifica aggiuntiva |
| **RecuperoAccessoCompletato** | Il soggetto ha riottenuto l'accesso | Le Verifiche richieste sono state superate | L'Account torna, se necessario, allo stato "Attivo" |
| **RecuperoAccessoNegato** | Il tentativo di Recupero non ha superato le Verifiche richieste | Le condizioni minime non sono state soddisfatte | L'Account resta nel proprio stato precedente |
| **SessioneAvviata** | Una nuova Sessione concettuale è iniziata | L'autenticazione è stata completata con successo (§4, §12) | Diventa possibile assumere Decisioni di accesso entro quella Sessione |
| **SessioneRevocata** | Una Sessione attiva è stata terminata anticipatamente | Esiste una motivazione dichiarata (es. Account Compromesso, §11) | La Sessione non può più essere utilizzata per nuove Decisioni di accesso |
| **EventoSicurezzaRilevato** | Un fatto rilevante per la sicurezza concettuale dell'Account è stato osservato | Esiste una condizione dichiarata (Attività anomala, Tentativo fallito, Dispositivo non riconosciuto, §12) | Può generare una Verifica aggiuntiva o una Segnalazione |
| **VerificaAggiuntivaRichiesta** | È stato richiesto un controllo supplementare | Il rischio percepito supera una soglia dichiarata (§4, §11, §12) | L'accesso resta "subordinato a verifica ulteriore" (§7) fino al superamento del controllo |
| **AccessoAnomaloSegnalato** | Un possibile problema di accesso è stato segnalato | Esiste una Segnalazione dichiarata, dal soggetto stesso o da un terzo (§2, §12) | Può avviare una Revisione della Decisione di accesso coinvolta (§7) |

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Notifiche, Persone, Imprese, Appartenenze, Contenuti Editoriali) possono voler conoscere per reagire — ad esempio Notifiche può informare il soggetto di un AccountSospeso o di un EventoSicurezzaRilevato, o `logical/appartenenze.md` può voler sapere che una DelegaRevocata riguarda un'Autorizzazione gestionale collegata — senza che Identità & Accessi debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali e domande aperte

### Decisioni vincolanti

1. Identità & Accessi è un dominio autonomo (§1).
2. Account, Identità digitale e Persona sono concetti distinti (§3).
3. Una Persona può esistere senza Account (§3, §13 regola 3).
4. Un Account può esistere prima dell'associazione completa con una Persona (§3, §13 caso limite 1).
5. La chiusura dell'Account non cancella automaticamente la Persona (§3, §11, §13 regola 4).
6. Un'Impresa non possiede direttamente credenziali personali (introduzione, §5, §13 regola 5).
7. Ogni azione per conto di un'Impresa deve essere riconducibile a una Persona (§5, §13 regola 6).
8. Il titolo per agire per un'Impresa deriva da Appartenenze e dalle deleghe compatibili (§5, §8, §13 regola 7).
9. Identità & Accessi non crea proprietà, amministrazione o rappresentanza legale (§5, §13 regola 9).
10. Autenticazione, identificazione, associazione, autorizzazione e verifica sono concetti distinti (§4, §5, §6, §10, §13 regole 12-13).
11. Ruolo applicativo, ruolo di dominio, qualifica professionale e funzione organizzativa sono concetti distinti (§6, §13 regola 10).
12. Permesso, delega, consenso e preferenza sono concetti distinti (§6, §8, §9, §13 regola 14).
13. Un permesso non equivale a diritto sostanziale nel dominio interessato (§6, §7, §13 regola 11).
14. Una delega non può attribuire più diritti di quelli posseduti dal delegante (§8, §13 regola 8).
15. La revoca non cancella automaticamente lo storico delle azioni precedenti (§8, §9, §12, §13 regola 19).
16. Stato dell'Account, stato dell'identità, stato dei metodi, stato delle deleghe, stato dei consensi e stato di sicurezza sono assi separati (§11, §12).
17. La verifica deve essere multidimensionale (§10).
18. Non deve esistere un unico badge generico di utente verificato (§10).
19. La visibilità delle informazioni è stabilita dai domini proprietari (§7, §13 regola 15).
20. Identità & Accessi applica le regole di accesso senza diventare proprietario delle informazioni (§1, §7, §13 regola 16).
21. Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Mercati internazionali e Osservatorio restano domini distinti (§1).
22. Identità & Accessi non attribuisce qualifiche, affidabilità, reputazione o idoneità (§1, §10, §13 regola 20).
23. Le decisioni di accesso devono essere contestualizzate e motivabili (§7).
24. Il dominio deve supportare accessi pubblici, registrati, limitati, delegati, temporanei e riservati (§4, §6, §7, §8).
25. Il dominio deve supportare sospensioni e limitazioni per ambito (§11, §13 regola 17).
26. Il recupero dell'accesso non deve alterare impropriamente l'identità o le Appartenenze (§11).
27. Lo storico delle decisioni e delle deleghe deve poter essere conservato (§8, §12, §13 regola 18).
28. I consensi devono essere collegati a finalità identificabili (§9).
29. La revoca del consenso non annulla automaticamente attività precedentemente legittime (§9, §13 regola 19).
30. Il dominio deve poter evolvere verso una futura separazione più dettagliata tra Identità, Autenticazione, Autorizzazione, Deleghe e Consensi (§15).

### Domande aperte

Le seguenti questioni restano esplicitamente aperte e non sono risolte da questo documento:

- rapporto massimo tra Account e Persona (uno a uno, o più Account per Persona in casi motivati);
- gestione operativa di più Account per la stessa Persona;
- gestione degli Account senza Persona associata a tempo indefinito;
- criteri concreti di verifica dell'identità per ciascun livello;
- livelli di verifica richiesti per le diverse azioni sensibili;
- trattamento dei soggetti esteri;
- trattamento dei minorenni;
- uso di pseudonimi pubblici e relativo bilanciamento con l'identità civile verificata;
- gestione degli Account di Persone decedute;
- gestione operativa degli Account compromessi;
- procedure di recupero assistito;
- criteri e processo di fusione degli Account duplicati;
- criteri e processo di separazione delle associazioni errate;
- ruoli applicativi iniziali da attivare al lancio della piattaforma;
- governance dei permessi (chi può definirli, modificarli, assegnarli);
- possibilità di permessi personalizzati oltre ai Ruoli applicativi previsti;
- limiti alle deleghe a catena;
- durata massima delle deleghe;
- deleghe conferite da Imprese, e relativo titolo necessario;
- relazione precisa tra delega e Appartenenza nei casi limite;
- revoca automatica delle deleghe in caso di cessazione dell'Appartenenza sottostante;
- criteri di accesso degli operatori di assistenza;
- criteri di accesso dei collaboratori esterni;
- criteri di accesso dei ricercatori;
- criteri di accesso ai dati dell'Osservatorio;
- criteri di accesso alle fonti riservate dei Contenuti editoriali;
- criteri di accesso alle evidenze dei Professionisti;
- visibilità dei partecipanti agli Eventi rispetto a questo dominio;
- gestione operativa e legale dei consensi;
- relazione con un futuro dominio Privacy dedicato;
- relazione con notifiche e comunicazioni;
- politiche di conservazione dello storico degli accessi;
- gestione degli incidenti di sicurezza;
- processo di riesame delle decisioni di accesso contestate;
- processo di contestazione dei blocchi;
- responsabilità e limiti degli amministratori funzionali;
- gestione di Account istituzionali o di servizio, non riferiti a una singola Persona;
- criteri per gli accessi temporanei;
- criteri per gli accessi anonimi (es. segnalazioni);
- azioni effettuabili senza registrazione;
- eventuale futura separazione tra Identità, Autenticazione, Autorizzazione e Consensi come sotto-domini distinti.

---

## Controllo finale

1. **15 sezioni presenti nello stesso ordine richiesto** — verificato: §1 Responsabilità, §2 Entità, §3 Identità reale/digitale/Account, §4 Metodi e livelli di autenticazione, §5 Associazione con Persona/Impresa/Appartenenze, §6 Ruoli applicativi e permessi, §7 Politiche e decisioni di accesso, §8 Deleghe e rappresentanza operativa, §9 Consensi/finalità/preferenze, §10 Verifica dell'identità e affidabilità, §11 Ciclo di vita dell'Account e recupero, §12 Sessioni/sicurezza/tracciabilità, §13 Regole/invarianti/casi limite, §14 Eventi di dominio, §15 Decisioni finali/domande aperte.
2. **Coerenza con tutti i documenti logici esistenti** — verificata: il documento riprende senza contraddizioni i riferimenti già presenti in `logical/persone.md`, `logical/imprese.md` §7/§18 (nota su Identità e Accessi come "significato di business" distinto dal "meccanismo tecnico"), `logical/appartenenze.md` §2/§8/§10 (Autorizzazione gestionale, assi di verifica), `logical/mercati-internazionali.md` §1, `logical/opportunita.md`, `logical/collaborazioni.md`, `logical/professionisti.md` §1, `logical/eventi.md`, `logical/contenuti-editoriali.md` §1/§12/§13, `logical/osservatorio.md` §1/§12, e con `docs/domain-model.md` §1/§13 (Identità & Accessi come dominio Generico, infrastruttura abilitante; attori concettuali).
3. **Identità & Accessi modellato come dominio autonomo** — verificato: §1 ne dichiara la responsabilità propria, §2 le entità proprie (Identità digitale, Account, Metodo di autenticazione, Delega, Consenso, Sessione, Evento di sicurezza), §10-§12 le regole di verifica e ciclo di vita specifiche del dominio.
4. **Nessuna duplicazione di Persona, Impresa, Appartenenza o Professionista** — verificato: §1, §3, §5 dichiarano esplicitamente che Identità & Accessi referenzia, non incorpora, i fatti sostanziali di quei domini.
5. **Autenticazione, identificazione, associazione, autorizzazione e verifica distinte** — verificato: tabella di apertura §1, sezioni dedicate §4 (autenticazione), §5 (associazione), §6/§7 (autorizzazione), §10 (verifica).
6. **Ruolo, permesso, delega, consenso e preferenza distinti** — verificato: §6, §8, §9 li trattano come concetti separati con attributi propri.
7. **Assi di stato dell'Account, dell'identità, dei metodi, delle deleghe, dei consensi e di sicurezza separati** — verificato: tabella dedicata in §11.
8. **L'azione per conto di un'Impresa dipende da Persona e Appartenenze** — verificato: §5 lo dichiara come conferma esplicita, richiamata in §13 regole 6-7.
9. **La visibilità resta responsabilità dei domini proprietari** — verificato: §7 principio dedicato.
10. **Nessuna attribuzione di diritti sostanziali, qualifiche o affidabilità** — verificato: §1, §6, §10, §13 regola 20.
11. **Ricerca di riferimenti tecnici o di database** — eseguita: il documento non contiene riferimenti a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi di dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, token tecnici, protocolli di autenticazione, librerie, provider specifici o codice.

### Riepilogo finale

**Principali decisioni prese.** Identità & Accessi è confermato come dominio autonomo e infrastrutturale, distinto da ogni dominio economico e sociale della piattaforma. Il documento stabilisce una catena esplicita di concetti (Identità reale → Identità digitale → Account → Metodo di autenticazione → Sessione) sempre distinta dai fatti di dominio (Persona, Impresa, Appartenenza, Professionista), e disciplina in modo autonomo Ruoli applicativi, Permessi, Deleghe e Consensi, evitando che alcuno di questi costituisca automaticamente un fatto sostanziale (proprietà, rappresentanza, qualifica, affidabilità). Il ciclo di vita dell'Account è modellato su otto assi indipendenti, coerentemente con il pattern già adottato in tutti i domini precedenti, e la verifica dell'identità è multidimensionale, senza un badge generico. Le deleghe e i consensi seguono regole esplicite di non-eccedenza, non-automatismo e conservazione dello storico.

**Eventuali incoerenze trovate.** Nessuna incoerenza rilevata rispetto ai documenti logici esistenti: tutti i riferimenti incrociati (Identità & Accessi come responsabile esclusivo di autenticazione e permessi tecnici in `imprese.md` §7/§18, `appartenenze.md` §8/§10, `mercati-internazionali.md` §1, `professionisti.md` §1, `contenuti-editoriali.md` §12/§13, `osservatorio.md` §1/§12) sono stati rispettati e resi coerenti con la struttura interna di questo documento.

**Relazioni con gli altri domini.** Identità & Accessi legge, senza incorporare, fatti da Persone (associazione Account–Persona), Imprese e Appartenenze (titolo per agire per un'Impresa), Professionisti (stato di verifica come condizione di accesso), Contenuti Editoriali (ruoli editoriali) e Osservatorio (accesso a dati aggregati riservati). È utilizzato da tutti i domini della piattaforma per applicare — non per definire — le rispettive regole di visibilità e le decisioni di accesso.

**Domande ancora aperte.** Le 38 domande elencate nella sezione precedente restano esplicitamente aperte, in particolare: il rapporto massimo tra Account e Persona; la gestione di Account compromessi, duplicati o di soggetti deceduti; i criteri di verifica per soggetti esteri e minorenni; la governance dei permessi e delle deleghe a catena; la relazione con un futuro dominio Privacy dedicato; e l'eventuale futura separazione tra Identità, Autenticazione, Autorizzazione e Consensi come sotto-domini distinti.