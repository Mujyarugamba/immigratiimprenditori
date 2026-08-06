# Logical Data Model — Dominio IDENTITÀ & ACCESSI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, token tecnici, protocolli di autenticazione, librerie, provider specifici o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/organizzazioni.md`](./organizzazioni.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/eventi.md`](./eventi.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md), [`docs/architecture/logical/osservatorio.md`](./osservatorio.md), [`docs/architecture/logical/reconciliation-report.md`](./reconciliation-report.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md).
> Scopo del documento: definire il modello logico del dominio Identità & Accessi, già anticipato in `docs/domain-model.md` §1 come dominio "Generico" ("Autenticare l'utente e definire cosa può fare... non è un dominio di business: è infrastruttura abilitante") e richiamato dai documenti logici come responsabile esclusivo di autenticazione, autorizzazione e permessi tecnici, mai come proprietario dei fatti di business. Questo documento conferma Identità & Accessi come dominio autonomo, ne definisce la struttura logica e chiude il **perimetro del ciclo 1** sufficiente al Physical (§15.A–§15.C).
> Carattere autonomo del dominio. Identità & Accessi rappresenta chi tenta di accedere alla piattaforma, con quale identità digitale, con quale livello di verifica, per conto di chi, con quale titolo, e a cosa può accedere entro quali limiti e per quale periodo. Non è un semplice meccanismo tecnico invisibile: ha una propria natura concettuale — fatta di identità digitali, account, metodi di autenticazione, ruoli applicativi, permessi, deleghe, consensi — distinta e autonoma rispetto ai soggetti economici e sociali che la piattaforma rappresenta.
> Distinzione tra Account, Identità digitale, Persona, Impresa, Organizzazione e Appartenenza. Un **Account** è il costrutto di accesso che permette di autenticarsi e agire sulla piattaforma. Una **Identità digitale** è l'insieme di credenziali e metodi di autenticazione riconducibili a un Account. Una **Persona** (`logical/persone.md`) è il soggetto sociale e anagrafico, che può esistere senza alcun Account. Un'**Impresa** (`logical/imprese.md`) è un soggetto economico che non possiede mai credenziali proprie: agisce sempre attraverso Persone autorizzate. Un'**Organizzazione** (`logical/organizzazioni.md`) è un soggetto collettivo istituzionale/associativo **distinto dall'Impresa**; non possiede credenziali proprie e non è assimilabile a Impresa. Un'**Appartenenza** (`logical/appartenenze.md`) è il fatto di business che lega una Persona a un'Impresa nel ciclo 1; le membership Persona–Organizzazione / Impresa–Organizzazione sono **future** e restano di Appartenenze, mai di Identità & Accessi. Questi concetti restano sempre distinti in questo documento.
> Principio per cui l'accesso non crea diritti sostanziali. Una decisione di Identità & Accessi (un permesso concesso, un ruolo assegnato, un accesso consentito) è sempre un fatto tecnico-applicativo: non genera, modifica né dimostra automaticamente un fatto sostanziale dei domini economici e sociali — non crea proprietà, non crea rappresentanza legale, non attribuisce una qualifica professionale, non dimostra affidabilità, non crea membership. I fatti sostanziali restano sempre di competenza esclusiva del dominio che li governa (Persone, Imprese, Organizzazioni, Appartenenze, Professionisti, e gli altri).
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di protocolli di autenticazione, librerie, provider o meccanismi specifici. È ammesso il solo riconoscimento concettuale che l'autenticazione tecnica di piattaforma esiste fuori ownership di questo dominio (§15.A).

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
15. [Decisioni finali, ciclo 1 e domande aperte](#15-decisioni-finali-ciclo-1-e-domande-aperte)

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Identità & Accessi rappresenta chi sta tentando di accedere alla piattaforma, con quale identità digitale, con quale livello di verifica, per conto di quale soggetto, con quale titolo, a quali azioni o informazioni può accedere, entro quali limiti, per quale periodo, e sulla base di quale consenso, delega o regola. È il dominio che decide *l'accesso*, non *l'esistenza* o *la verità sostanziale* dei soggetti che vi accedono.

**Quali problemi risolve.** Permette di autenticare un soggetto senza confonderlo con la sua identità sociale (§3); permette a una Persona di operare per un'Impresa senza che l'Impresa possieda credenziali proprie (introduzione, §5); distingue autenticazione (chi sei) da autorizzazione (cosa puoi fare), evitando che un ruolo applicativo si confonda con una qualifica professionale o con una rappresentanza legale (§6, §13); rende possibile delegare l'accesso senza delegare la proprietà o la rappresentanza (§8); governa i consensi all'accesso e al trattamento senza sovrapporsi a un futuro modello legale della privacy (§9); distingue più assi di verifica e di stato, evitando un unico giudizio generico di "utente verificato" (§10); e rende tracciabili le decisioni di accesso senza descrivere strumenti tecnici specifici (§12).

**Cosa rientra nel dominio.** Identità digitali; Account; metodi di autenticazione; verifica dell'identità digitale; associazione tra Account e soggetti di dominio; ruoli applicativi; permessi; deleghe; consensi; accesso a funzionalità e informazioni; sospensioni; recupero dell'accesso; sicurezza concettuale dell'Account; tracciabilità delle decisioni di accesso.

**Cosa NON rientra nel dominio.**
- Non rientrano **Persone, Imprese, Organizzazioni, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Servizi, Mercati Internazionali, Contenuti Editoriali, Osservatorio**: i fatti sostanziali di questi domini restano di loro esclusiva competenza; Identità & Accessi li referenzia per decidere l'accesso, senza mai diventarne proprietario né duplicarli.
- Non rientrano **membership** Persona–Impresa (già in Appartenenze), né membership **Persona–Organizzazione / Impresa–Organizzazione** (future in Appartenenze, Dependency Map DC2): Identità & Accessi non le crea, non le possiede e non le simula.
- Non rientrano **Organizzazioni** come anagrafiche, sedi, ufficiali o tipologies (`logical/organizzazioni.md`): solo eventuali decisioni di accesso sulle relative risorse logiche.
- Non rientrano **comunicazioni e notifiche**: il dominio Notifiche (`docs/domain-model.md` §12) reagisce a fatti accaduti; Identità & Accessi può generare fatti (es. un accesso anomalo) ma non gestisce l'invio o la preferenza di canale.
- Non rientrano le **preferenze generali** non legate all'accesso (es. preferenze editoriali, di visualizzazione): solo le preferenze di accesso e consenso rientrano qui (§9); nel ciclo 1 i Consensi come entità owned sono rinviati (§15.A).
- Non rientrano **CRM, HR, documenti, media, Storage, FEV, workflow business, billing, audit tecnico infrastrutturale, moderazione editoriale come processo**.
- Non rientra la **reputazione**: nessun giudizio di affidabilità, qualità o merito è di competenza di questo dominio (§10, §13).
- Non rientrano **contratti e pagamenti**: eventuali accordi commerciali restano fuori dal perimetro.
- Non rientrano le **verifiche professionali** (`logical/professionisti.md`) né le **verifiche economiche**: Identità & Accessi può considerarne l'esito come condizione di una decisione di accesso (§7), senza gestirne il processo.
- Non rientra l'**autenticazione tecnica** (protocolli, credenziali infrastrutturali, provider): resta fuori ownership; questo dominio ne riconosce solo l'esistenza concettuale (§15.A).

**Chiarimenti espliciti.** Un ruolo applicativo non equivale a una qualifica professionale né a un ruolo in Impresa/Organizzazione; un permesso non equivale a rappresentanza legale; una delega di accesso non sostituisce un'Appartenenza né una membership organizzativa; l'autenticazione non dimostra automaticamente identità civile o affidabilità; **Organizzazione ≠ Impresa** (introduzione, §3, §5, §6, §8, §10, §15.A).

**Quali domini utilizza.** Identità & Accessi legge, senza incorporare: **Persone** (associazione Account–Persona); **Imprese** (contesto di azione, mai credenziali Impresa); **Appartenenze** (titolo Persona–Impresa nel ciclo 1); **Organizzazioni** (solo come risorsa logica / soggetto referenziabile; **nessun contesto Organizzazione operativo nel ciclo 1** — §5, §15.A); **Professionisti** (eventuale stato di verifica come condizione); **Contenuti Editoriali** (funzioni editoriali come Ruoli applicativi); **Osservatorio** (eventuale accesso a dati aggregati riservati); ogni altro dominio, come fonte di *risorse logiche* (§7).

**Quali domini utilizzano Identità & Accessi.** Tutti i domini della piattaforma dipendono da Identità & Accessi per applicare — non definire — le rispettive regole di visibilità e le decisioni di accesso. In particolare rimandano esplicitamente a questo dominio i Logical già chiusi di Imprese, Appartenenze, Professionisti, Contenuti, Osservatorio, Organizzazioni e gli altri domini pubblicati.

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
| **Contesto di azione** | La modalità in cui un'Identità digitale agisce: in proprio (Persona), per conto di un'Impresa, per conto di un'Organizzazione (rinviato), oppure in contesto redazionale/di sistema (§5, §15.A) |
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
| Associazione operativa con Impresa | `logical/imprese.md`, `logical/appartenenze.md` | Il Contesto di azione "per conto di un'Impresa" deriva da un'Appartenenza esistente (ciclo 1) o, in futuro, da una Delega compatibile (§5, §8, §15.A) |
| Contesto Organizzazione | `logical/organizzazioni.md`, `logical/appartenenze.md` (future) | **Non operativo nel ciclo 1**: richiede membership o altro fatto autorizzante pubblicato; non simulabile in Identità & Accessi (§5, §15.A) |
| Ruolo editoriale | `logical/contenuti-editoriali.md` | Funzioni editoriali esercitate tramite Ruoli applicativi di questo dominio, senza ownership dei Contenuti (§6, §15.A) |
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
| **Persona che opera per sé** | Contesto personale: l'Identità digitale agisce a titolo della Persona associata, entro i diritti sostanziali esistenti |
| **Persona che opera per un'Impresa** | Contesto Impresa: l'Identità digitale agisce per conto di un'Impresa solo se esiste un fatto autorizzante in Appartenenze (ciclo 1) o, in futuro, una Delega compatibile |
| **Persona che opera per più Imprese** | Una Persona può avere più contesti Impresa attivi, ciascuno riconducibile a un'Appartenenza distinta |
| **Persona che cambia contesto di azione** | Il passaggio, nel corso di una stessa Sessione o tra Sessioni diverse, da un Contesto di azione a un altro |
| **Azione in proprio** | Un'azione compiuta nel Contesto personale |
| **Azione per conto di un'Impresa** | Un'azione compiuta nel Contesto Impresa, riconducibile a un fatto di Appartenenze (ciclo 1) |
| **Azione per conto di un'Organizzazione** | Contesto Organizzazione: **non operativo nel ciclo 1**. Richiede membership Persona–Organizzazione / Impresa–Organizzazione (future in Appartenenze) o altro fatto autorizzante pubblicato. **Non** è analogo automatico al contesto Impresa; **non** è simulabile in Identità & Accessi; **Organizzazione ≠ Impresa** (`logical/organizzazioni.md`) |
| **Contesto redazionale / di sistema** | Contesto in cui un Account con Ruolo applicativo di piattaforma (es. redattore, amministratore applicativo) opera su risorse della piattaforma. Non crea Organizzazione, non crea membership, non attribuisce diritti sostanziali sui domini (§15.A) |
| **Delega operativa** | La Delega (§8) che in futuro può fondare, in alternativa o a integrazione di un'Appartenenza, un contesto Impresa; **rinviata dal ciclo 1** (§15.A) |
| **Titolo di rappresentanza / autorizzazione gestionale** | Il fondamento dichiarato in Appartenenze (o futuro) che giustifica un'azione per conto di un'Impresa; non è mai generato da questo dominio |
| **Limite del contesto** | L'insieme di azioni o informazioni non accessibili in un dato Contesto, anche quando l'Identità digitale sarebbe altrimenti autenticata |

**Conferme.**
- L'**Account è sempre riconducibile a un'Identità digitale**: non esiste un Account privo di alcuna Identità digitale associata.
- L'**azione per conto di un'Impresa richiede una Persona associata**: un'Impresa non possiede mai credenziali proprie.
- Il **titolo per agire per l'Impresa nel ciclo 1 deriva da Appartenenze** (`logical/appartenenze.md`, Autorizzazione gestionale / ruolo strutturale): Identità & Accessi **verifica** l'esistenza del titolo, **non lo crea**. Le Deleghe compatibili restano modello generale (§8) ma **non sono oggetto del ciclo 1** (§15.A).
- **Identità & Accessi non crea proprietà, amministrazione, rappresentanza, Organizzazione o membership**: fatti di `logical/imprese.md`, `logical/organizzazioni.md`, `logical/appartenenze.md`.
- Il **contesto Organizzazione non è disponibile nel ciclo 1**: nessuna relazione provvisoria in questo dominio può sostituire le membership future di Appartenenze.
- Il **cambio di contesto non modifica l'identità dell'Account**.
- I **permessi disponibili possono cambiare in base al contesto di azione**.

---

## 6. Ruoli applicativi e permessi

**Distinzioni tra tipi di ruolo e concetti collegati.**

| Concetto | Definizione |
|---|---|
| **Ruolo applicativo** | Un insieme nominato di permessi assegnabile a un Account in un dato Contesto, definito e governato da questo dominio; ≠ ruolo professionale, ≠ ruolo in Impresa, ≠ ruolo in Organizzazione, ≠ appartenenza, ≠ delega, ≠ policy infrastrutturale |
| **Ruolo di dominio / relazionale** | Un ruolo definito da un altro dominio (es. Ruolo di un'Appartenenza in `logical/appartenenze.md`) che descrive un fatto di business, non un permesso tecnico |
| **Ruolo in un'Organizzazione** | Fatto sostanziale o relazionale di `logical/organizzazioni.md` / future Appartenenze Org: **non** è un Ruolo applicativo e **non** appartiene a Imprese |
| **Qualifica professionale** | Concetto di `logical/professionisti.md`: non equivale né si traduce automaticamente in un Ruolo applicativo |
| **Funzione editoriale** | Concetto di `logical/contenuti-editoriali.md`: può essere esercitata tramite Ruolo applicativo, senza ownership dei Contenuti |
| **Permesso operativo** | La singola facoltà tecnica di compiere un'azione o accedere a un'informazione |
| **Policy di accesso** | Regola dichiarata (§7) che produce Decisioni; in Physical potrà tradursi in meccanismi di enforcement, senza che questo documento ne specifichi la forma |
| **Capacità operativa** | L'insieme delle azioni concretamente disponibili per un Account in un Contesto, risultante dalla combinazione di Ruoli e Permessi attivi |
| **Responsabilità** | Concetto descrittivo, non tecnico: l'aspettativa di correttezza legata a un Ruolo, che resta un fatto di governance, non un permesso |
| **Autorizzazione temporanea** | Un Permesso concesso per una durata limitata, oltre la quale cessa senza necessità di revoca esplicita |
| **Eccezione** | Un Permesso concesso in deroga alla Politica di accesso ordinaria, per un caso specifico e motivato |
| **Restrizione** | Un limite esplicito che riduce la Capacità operativa altrimenti disponibile secondo un Ruolo |

**Ruoli applicativi minimi del ciclo 1** (chiusi; non gerarchici; non esaustivi del modello generale):

| Ruolo | Significato | Ambito | Abilita | Non prova | Ciclo 1 |
|---|---|---|---|---|---|
| *(nessuno — visitatore)* | Assenza di Account autenticato | Consultazione | Solo ciò che i domini proprietari espongono come pubblico | Identità, Persona, diritti | Incluso come assenza di Account |
| `account_registrato` | Account autenticato ordinario | Piattaforma | Azioni che richiedono autenticazione di base | Persona, Appartenenza, Org | **Incluso** |
| `redattore` | Funzione redazionale di piattaforma | Contesto redazionale | Operazioni editoriali ammesse dalle Politiche e dai domini Contenuti/altri | Titolarità sostanziale dei fatti narrati; Organizzazione | **Incluso** |
| `amministratore_applicativo` | Amministrazione funzionale di piattaforma | Contesto di sistema | Configurazione/accesso amministrativo dichiarato dalle Politiche | Sovranità sui fatti di business; elusione delle Politiche | **Incluso** |
| `moderatore` | Moderazione di piattaforma | Contesto di sistema | Azioni di moderazione se/quando le Politiche le prevedono | Processo editoriale; ownership Contenuti | **Rinviato** |
| `servizio_tecnico` | Account di servizio non personale | Contesto di sistema | Automazioni dichiarate | Persona; diritti sostanziali | **Rinviato** (tipologia distinta) |

**Catalogo generale (non ciclo 1).** Restano concepibili nel modello ampio, ma **non attivati** nel ciclo 1: referente di Impresa come Ruolo applicativo (il contesto Impresa deriva da Appartenenza, non da un ruolo nominato qui); Professionista associato; ricercatore; validatore; assistenza; soggetto esterno autorizzato; elenco esteso di §6 storico. Non introdurre ruoli business specifici (fondatore, legale rappresentante Org, ecc.) come Ruoli applicativi.

**Principi.**
- I Ruoli applicativi **non costituiscono una gerarchia obbligatoria**.
- Un **Account può avere più Ruoli applicativi**, anche in Contesti diversi.
- Un **Ruolo non attribuisce automaticamente** i Permessi di altri Ruoli.
- Un Ruolo applicativo **non** equivale a ruolo in Impresa, ruolo in Organizzazione, qualifica professionale, appartenenza o delega.

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
- Una **Delega di accesso abilita un'azione applicativa**; **non** crea appartenenza, titolarità, ruolo professionale, ruolo in Organizzazione né membership.
- Una **Delega non crea automaticamente rappresentanza legale**: resta fatto di `logical/imprese.md` / `logical/appartenenze.md`.
- Una **Delega non sostituisce l'Appartenenza** quando questa è necessaria.
- Il **Delegante deve essere legittimato**; **nessuno può delegare più diritti di quelli che possiede**.
- La Delega ha **ambito e durata**; può essere **revocata**; la revoca interrompe l'accesso futuro senza cancellare lo storico delle azioni già compiute.
- Una **delega scaduta ≠ delega revocata**; una **delega contestata** può essere sospesa.

**Ciclo 1.** Le **Deleghe come entità owned sono rinviate** (§15.A). Nel ciclo 1 il contesto Impresa poggia su Appartenenze; non si introducono Deleghe come surrogato di membership Organizzazione.

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
- I Consensi **non** coincidono con preferenze applicative, autorizzazioni operative, appartenenze o diritti sui domini.
- Ogni Consenso (quando modellato) ha **finalità, versione/provenienza, momento, durata/scadenza e stato**.
- La **revoca del Consenso non cancella automaticamente** fatti o attività già legittime.
- Identità & Accessi governa il consenso all'accesso/trattamento **senza sostituire** un futuro modello Privacy dedicato (§15).

**Ciclo 1.** Le **entità Consenso owned sono rinviate** (§15.A). Restano validi i principi; nessuna tabella/concetto operativo di consenso è richiesto al Physical del ciclo 1.

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
| **Relazione con Impresa verificata** | Il legame con un'Impresa (Appartenenza; in futuro anche Delega) è stato confermato (§5, §8). Distinto da eventuali future verifiche di membership Organizzazione |
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
20. Identità & Accessi non attribuisce qualifiche, proprietà, appartenenze, Organizzazioni o reputazione (§1).
21. Un Account non crea automaticamente una Persona (§3, §15.A).
22. Una Persona non acquisisce diritti sostanziali solo perché associata a un Account (§1, §15.A).
23. Un ruolo applicativo non equivale a un ruolo sostanziale (Impresa, Organizzazione, professione) (§6).
24. Una delega non crea appartenenza né membership organizzativa (§8).
25. Un contesto Impresa richiede un fatto autoritativo esterno (Appartenenze nel ciclo 1) (§5).
26. Un contesto Organizzazione richiede un fatto autoritativo esterno; **non è operativo nel ciclo 1** (§5, §15.A).
27. Identità & Accessi non modifica i fatti sostanziali degli altri domini (§1, §7).
28. L'autenticazione non implica autorizzazione; l'autorizzazione applicativa non implica titolarità (§4, §6, §7).
29. I permessi devono essere negati in assenza di prova positiva (deny-by-default) (§7, §15.A).
30. Le relazioni organizzative future non possono essere simulate nel ciclo 1 (§5, §15.A).
31. Account tecnici o redazionali, se ammessi, devono essere esplicitamente distinti dagli Account personali ordinari; nel ciclo 1 la redazione/sistema opera tramite Ruoli applicativi, non tramite tipologie Account distinte (§6, §15.A).
32. Organizzazione ≠ Impresa; nessun ruolo organizzativo appartiene a Imprese (§1, §5, §6).

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

## 15. Decisioni finali, ciclo 1 e domande aperte

### Decisioni vincolanti (modello generale)

1. Identità & Accessi è un dominio autonomo (§1).
2. Account (Aggregate Root), Identità digitale e Persona sono concetti distinti (§3).
3. Una Persona può esistere senza Account (§3).
4. Un Account può esistere prima dell'associazione completa con una Persona (§3); nel ciclo 1 con Capacità operativa limitata (§15.A).
5. La chiusura dell'Account non cancella automaticamente la Persona (§3, §11).
6. Un'Impresa non possiede direttamente credenziali (introduzione, §5).
7. Un'**Organizzazione** è dominio autonomo distinto da Impresa; non possiede credenziali; Identità & Accessi non la possiede (§1, §5).
8. Ogni azione per conto di un'Impresa deve essere riconducibile a una Persona e a un fatto autorizzante esterno (§5).
9. Il titolo per agire per un'Impresa nel ciclo 1 deriva da **Appartenenze**; le Deleghe restano modello generale ma rinviate (§5, §8, §15.A).
10. Identità & Accessi non crea proprietà, amministrazione, rappresentanza, Organizzazione o membership (§5).
11. Autenticazione, identificazione, associazione, autorizzazione e verifica sono concetti distinti.
12. Ruolo applicativo ≠ ruolo di dominio ≠ qualifica professionale ≠ ruolo in Organizzazione (§6).
13. Permesso, delega, consenso e preferenza sono concetti distinti.
14. Un permesso non equivale a diritto sostanziale.
15. Una delega non può attribuire più diritti di quelli del delegante; non crea appartenenza.
16. La revoca non cancella automaticamente lo storico delle azioni precedenti.
17. Gli assi di stato restano separati (§11).
18. La verifica è multidimensionale; nessun badge generico "utente verificato" (§10).
19. La visibilità è stabilita dai domini proprietari; Identità & Accessi la applica (§7).
20. Deny-by-default: in assenza di prova positiva l'accesso è negato (§13 regola 29, §15.A).
21. Persone, Imprese, **Organizzazioni**, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Servizi, Contenuti, Mercati, Osservatorio restano domini distinti.
22. Identità & Accessi non attribuisce qualifiche, affidabilità, reputazione o idoneità.
23. Il recupero dell'accesso non altera impropriamente Associazione o Appartenenze (§11).
24. Il dominio può evolvere verso una futura separazione tra Identità, Autenticazione, Autorizzazione, Deleghe e Consensi.

---

### 15.A Decisioni del ciclo 1 (chiuse)

| Tema | Decisione ciclo 1 | Stato |
|---|---|---|
| **Aggregate Root** | **Account** | Incluso |
| **Account–Persona (cardinalità ordinaria)** | Persona: **0..1** Account ordinario. Account ordinario: **0..1** Associazione a Persona. Associazione **richiesta** per Contesto personale pieno e per Contesto Impresa. Account senza Persona: ammesso solo come stato **transitorio/limitato**. | Chiuso |
| **Più Account per la stessa Persona** | **Non ammessi** come caso ordinario nel ciclo 1 | Rinviato (gestione eccezionale/fusione) |
| **Account tecnici / di servizio** | Tipologia distinta **non** introdotta nel ciclo 1 | Rinviato |
| **Account redazionali** | Nessuna tipologia Account distinta: la redazione opera con Ruolo `redattore` (o `amministratore_applicativo`) su Account ordinario di Persona staff | Incluso (via ruolo) |
| **Identità digitale** | Concetto obbligatorio; dettaglio metodi/owned **minimale** | Incluso (concettuale) |
| **Metodi di autenticazione** | Concetto; implementazione tecnica **fuori** ownership | Rinviato come owned dettagliato |
| **Autenticazione tecnica / auth piattaforma** | Riconosciuta concettualmente come infrastruttura esterna (es. soggetto autenticato di piattaforma); **non** ownership di protocolli, password, token, MFA, provider | Escluso dal dominio / vincolo di confine |
| **Associazione Account–Persona** | Inclusa; esplicita; verificabile | Incluso |
| **Contesto personale** | Operativo | Incluso |
| **Contesto Impresa** | Operativo **solo** se esiste Appartenenza/autorizzazione gestionale valida; IA interpreta, non crea | Incluso |
| **Contesto Organizzazione** | **Non operativo**; nessuna membership Org in Appartenenze ciclo 1; nessuna simulazione in IA | Escluso dal ciclo 1 / rinviato |
| **Contesto redazionale / sistema** | Operativo via Ruoli `redattore` / `amministratore_applicativo` | Incluso |
| **Ruoli applicativi minimi** | `account_registrato`, `redattore`, `amministratore_applicativo`; visitatore = assenza Account | Incluso |
| **Moderatore / servizio tecnico** | — | Rinviato |
| **Deleghe** | Entità owned | Rinviate |
| **Consensi** | Entità owned | Rinviate |
| **Sessioni concettuali** | Concetto di tracciabilità; persistenza owned dedicata | Rinviata (infra auth può coprire) |
| **Eventi di sicurezza / dispositivi** | Concetto | Rinviati come owned |
| **Azioni senza registrazione** | Letture pubbliche secondo visibilità dei domini proprietari: **sì**, senza Account. Scritture anonime che creano Persona: **no**. Candidature/contatti/segnalazioni: appartengono ai domini proprietari; non generano Account/Persona automatici in IA. Sessioni anonime applicative owned da IA: **no** nel ciclo 1 | Chiuso |
| **Recupero / sospensione / chiusura Account** | Concetti e assi di stato restano validi; Physical può mappare un sottoinsieme operativo (attivo / sospeso / chiuso) | Incluso (minimo) |
| **Archiviazione Account** | Conservazione storica post-chiusura | Rinviata nei dettagli |
| **Policy deny-by-default** | Obbligatoria | Incluso |

**Organizzazioni — chiusura esplicita.** Identità & Accessi non possiede Organizzazioni né membership organizzative. Il contesto Organizzazione resta **non operativo** finché Appartenenze (o altro dominio competente) non pubblica un fatto autorizzante. Titolarità di scheda Organizzazione (Persona \| Impresa \| Redazione in `logical/organizzazioni.md`) **non** genera da sola un Contesto Organizzazione in questo dominio.

---

### 15.B Oggetti: inclusi / rinviati (ciclo 1)

| Oggetto | Ownership | Ciclo 1 |
|---|---|---|
| Account (AR) | Identità & Accessi | **Incluso** |
| Identità digitale | Identità & Accessi | **Incluso** (concettuale/minimale) |
| Associazione Account–Persona | Identità & Accessi (riferimento a Persone) | **Incluso** |
| Ruolo applicativo / assegnazione | Identità & Accessi | **Incluso** (catalogo minimo §6) |
| Permesso / Politica / Decisione di accesso | Identità & Accessi | **Incluso** (concettuale; enforcement deny-by-default) |
| Contesto personale / Impresa / redazione | Decisioni di questo dominio su fatti esterni | **Incluso** |
| Contesto Organizzazione | — | **Rinviato** |
| Metodo di autenticazione (owned dettagliato) | Identità & Accessi | **Rinviato** |
| Delega | Identità & Accessi | **Rinviato** |
| Consenso | Identità & Accessi | **Rinviato** |
| Sessione / dispositivo / evento di sicurezza (owned) | Identità & Accessi | **Rinviato** |

---

### 15.C Prontezza Physical

Il Physical del ciclo 1 può essere progettato su:

* **AR:** Account;
* **inclusi:** Identità digitale minimale, Associazione Account–Persona, Ruoli applicativi minimi, Politiche/decisioni (deny-by-default), Contesto personale e Contesto Impresa (lettura Appartenenze), Contesto redazionale/sistema via ruoli;
* **rinviati:** Deleghe, Consensi owned, Contesto Organizzazione, metodi/sessioni/dispositivi come owned dettagliati, Account di servizio tipizzati, moderatore;
* **dipendenze autoritative:** Persone, Appartenenze (Persona–Impresa), Imprese (solo riferimento), autenticazione tecnica di piattaforma (fuori ownership);
* **confini:** nessuna ownership di Organizzazioni/membership/CRM/HR/Storage/FEV/documenti/media/workflow; Organizzazione ≠ Impresa;
* **invarianti:** §13 regole 1–32 e tabella §15.A.

Il Physical **non** deve inventare membership Org, assimilare Org a Impresa, né specificare protocolli auth. I nomi di tabelle/colonne restano decisione del Physical.

---

### Domande aperte (non bloccanti per il Physical ciclo 1)

- criteri concreti di verifica per ciascun livello e azioni sensibili;
- soggetti esteri e minorenni;
- pseudonimi pubblici vs identità civile;
- Account di Persone decedute; Account compromessi; recupero assistito;
- fusione/separazione Account in casi eccezionali;
- governance estesa dei permessi e permessi personalizzati;
- Deleghe (catena, durata, revoca automatica su cessazione Appartenenza) — post ciclo 1;
- Consensi operativi e relazione con Privacy dedicata — post ciclo 1;
- criteri di accesso ricercatori, assistenza, evidenze Professionisti, Osservatorio riservato;
- conservazione storica dettagliata e incidenti di sicurezza;
- futura separazione Identità / Autenticazione / Autorizzazione / Consensi come sotto-domini.

---

## Controllo finale

1. **15 sezioni presenti** — verificato; §15 estesa con decisioni ciclo 1 (§15.A–§15.C).
2. **Allineamento Organizzazioni** — verificato: fondamenti, esclusioni, contesto Org non operativo, ruolo organizzativo non più attribuito a Imprese, nessuna membership Org in IA.
3. **Nessuna duplicazione** di Persona, Impresa, Organizzazione, Appartenenza, Professionista — verificato.
4. **Account AR; Account ≠ Persona; accesso ≠ diritto sostanziale** — verificato.
5. **Contesto Impresa da Appartenenze; Contesto Org rinviato** — verificato.
6. **Ruoli applicativi minimi ciclo 1 chiusi** — verificato (§6, §15.A).
7. **Deleghe e Consensi owned rinviati; deny-by-default** — verificato.
8. **Nessun protocollo auth / SQL / FK** — verificato; solo riconoscimento concettuale dell'autenticazione di piattaforma.
9. **Physical readiness** — dichiarata in §15.C senza lasciare decisioni semantiche aperte bloccanti.

### Riepilogo finale

**Principali decisioni prese.** Identità & Accessi resta dominio autonomo infrastrutturale con AR Account. Organizzazione è dominio distinto da Impresa; membership Org future restano in Appartenenze; contesto Org non operativo nel ciclo 1. Cardinalità ordinaria Account–Persona chiusa (0..1 / 0..1). Contesti: personale e Impresa (via Appartenenze) operativi; redazione/sistema via ruoli; Org rinviato. Ruoli minimi: `account_registrato`, `redattore`, `amministratore_applicativo`. Deleghe e Consensi owned rinviati. Deny-by-default. Autenticazione tecnica fuori ownership.

**Physical.** Autorizzabile sul perimetro §15.A–§15.C.

**Domande aperte residue.** Solo governance/operatività non bloccanti elencate in §15 (verifiche dettagliate, Privacy, Deleghe post-ciclo 1, ecc.).