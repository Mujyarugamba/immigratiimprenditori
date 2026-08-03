# Logical Data Model — Dominio PROFESSIONISTI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md).
> Scopo del documento: definire il modello logico del dominio Professionisti, che rappresenta il ruolo professionale di una Persona — mai di un'organizzazione in quanto tale — quando questa offre competenze specialistiche a supporto di Persone, Imprese, Opportunità, Collaborazioni e Mercati Internazionali. Il dominio era stato anticipato come questione aperta in `logical/imprese.md` §12, in `logical/opportunita.md` §15 e in `logical/collaborazioni.md` §6/§15 ("se confermato come dominio distinto"): questo documento risolve quella domanda aperta, confermandolo come dominio autonomo, sempre ancorato a una singola Persona (§1, §13).
> Distinzione tra Persona, Professionista e Impresa. Una Persona (`logical/persone.md`) non coincide automaticamente con un Professionista: una Persona può essere un Professionista, ma non ogni Persona lo è. Un'Impresa (`logical/imprese.md`) non coincide con un Professionista: un'Impresa può offrire servizi professionali strutturati senza che questo la trasformi in un Professionista, ed è sempre un soggetto economico collettivo, mentre il Professionista in questo dominio è sempre ancorato a una singola Persona, anche quando opera attraverso una struttura organizzativa (§4).
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API o interfaccia.

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Professionisti rappresenta il profilo professionale di una Persona: le qualifiche, i titoli, le iscrizioni, le abilitazioni, le competenze, gli ambiti di attività, i servizi dichiarati, i territori e i mercati serviti, le lingue operative, le modalità di esercizio, la disponibilità e le verifiche relative all'esercizio di una professione o di un'attività specialistica, regolamentata o non regolamentata.

**Quali problemi risolve.** Rende possibile trovare e valutare un Professionista secondo criteri precisi (categoria, specializzazione, territorio, lingua, disponibilità, §12), distinguendo sempre ciò che è dichiarato da ciò che è verificato (§6, §11); evita di confondere "qualsiasi Persona con una competenza dichiarata" (`logical/persone.md`, CompetenzaDichiarata) con un Professionista che esercita un'attività specialistica con un proprio profilo, un proprio ciclo di vita e proprie regole di verifica; rende possibile rappresentare sia le professioni regolamentate (con Ordini, Collegi, abilitazioni) sia quelle non regolamentate, senza forzare le seconde in un modello pensato solo per le prime.

**Cosa rientra nel dominio.** Il Professionista e il Profilo professionale (§2); le categorie, specializzazioni e competenze (§5); le qualifiche, i titoli, le iscrizioni e le abilitazioni (§6); i servizi professionali dichiarati (§7); i territori, le lingue e i Mercati Internazionali serviti (§8); la disponibilità e le condizioni professionali (§9); il ciclo di vita del profilo (§10); la sua verifica e le sue fonti (§11); la sua visibilità e ricercabilità (§12).

**Cosa NON rientra nel dominio.**
- Non rientra la **Persona** in quanto tale: identità, biografia, competenze dichiarate generiche e storie personali restano nel dominio Persone, che questo dominio referenzia senza duplicare (§2).
- Non rientra l'**Impresa**: un'Impresa può offrire servizi professionali strutturati (tramite ServizioImpresa, `logical/imprese.md` §2), ma questo non la rende un Professionista; questo dominio referenzia l'Impresa solo come eventuale organizzazione tramite cui un Professionista opera (§4).
- Non rientra l'**Appartenenza**: la relazione con un'Impresa o uno studio professionale (chi ne è titolare, dipendente, collaboratore) deriva sempre da un'Appartenenza esistente (`logical/appartenenze.md`), non da questo dominio (§4, §13).
- Non rientrano i **Servizi** in senso strutturato (OffertaDiServizio, Domain Model §3): questo dominio descrive **chi può offrire una competenza** (il Professionista e il suo Servizio professionale dichiarato, §7), mentre il dominio Servizi descrive **l'offerta strutturata** con le proprie regole di pubblicazione e ricerca; sono domini distinti e complementari.
- Non rientrano le **Collaborazioni**: un Professionista può essere soggetto proponente, candidato o professionista di supporto in una Collaborazione (`logical/collaborazioni.md` §6), ma quella relazione appartiene al dominio Collaborazioni, che referenzia il Professionista senza essere incorporato in questo dominio.
- Non rientrano le **Opportunità**: un Professionista può essere destinatario o promotore di un'Opportunità (`logical/opportunita.md` §5), referenziato senza che questo dominio ne acquisisca la responsabilità.
- Non rientrano i **Mercati Internazionali**: un Professionista può supportare l'accesso a un Mercato senza essere parte di quel dominio (§8).
- Non rientrano gli **Eventi**: un Professionista può partecipare o essere presentato in un Evento, referenziato senza gestione di iscrizioni o capienze.
- Non rientrano **recensioni e reputazione**: non modellate da questo documento (questione aperta, §15); un futuro sistema di reputazione, se introdotto, resterebbe un dominio distinto che potrebbe referenziare il Professionista.
- Non rientra la **messaggistica**: la comunicazione privata tra un Professionista e chi lo contatta resta fuori dal perimetro, coerente con `logical/collaborazioni.md` §1.
- Non rientrano **contratti e pagamenti**: l'affidamento di un incarico, la sua esecuzione, la fatturazione e il pagamento restano fuori dal perimetro; questo dominio si ferma al profilo, alla dichiarazione di disponibilità e alla tariffa indicativa (§9).
- Non rientra la **controversia**: il dominio può rappresentare che un profilo è "Contestato" (§10) come fatto di dominio, senza gestirne la risoluzione.
- Non rientrano **l'autenticazione né i permessi applicativi**: nessuna informazione di questo dominio genera di per sé un permesso tecnico; resta responsabilità esclusiva del futuro dominio Identità & Accessi.
- Non rientra l'**Osservatorio**: il dominio lo alimenta con dati aggregabili, senza produrre esso stesso report o statistiche.

**Quali domini utilizza.**
- **Persone** — per referenziare la Persona sottostante a ogni Professionista (§2, §13), senza duplicarne i dati.
- **Imprese** — per referenziare l'eventuale organizzazione (Impresa, studio) tramite cui il Professionista opera (§4).
- **Appartenenze** — per stabilire il titolo con cui il Professionista è collegato a un'Impresa o uno studio (§4, §13).
- **Mercati Internazionali** — per referenziare i Mercati serviti (§8).
- **Tassonomia Condivisa** — per settori, territori e lingue (§5, §8).

**Quali domini utilizzano Professionisti.**
- **Servizi** — un Servizio professionale dichiarato in questo dominio (§7) può essere la base per un'OffertaDiServizio strutturata in quel dominio, senza che i due si fondano.
- **Collaborazioni** — un Professionista può essere referenziato come soggetto proponente, candidato o professionista di supporto (`logical/collaborazioni.md` §6).
- **Opportunità** — un Professionista può essere referenziato come destinatario o promotore.
- **Mercati Internazionali** — un Professionista può essere referenziato come Risorsa di supporto al mercato o come controparte di una Relazione commerciale internazionale (`logical/mercati-internazionali.md` §2, §6).
- **Ricerca**, **Notifiche**, **Osservatorio** — per rendere i Professionisti trovabili, per segnalare eventi rilevanti (§14) e per aggregare dati statistici.

**Perché Professionisti è un dominio autonomo.** Un Professionista ha un proprio catalogo di categorie, specializzazioni e qualifiche (§5, §6), un proprio modello di verifica multi-asse specifico per titoli, iscrizioni e abilitazioni (§11) che nessun altro dominio replica, un proprio ciclo di vita su cinque assi (§10), e una propria logica di ricerca (§12) distinta da quella di una semplice Persona con competenze dichiarate. La CompetenzaDichiarata del dominio Persone (`logical/persone.md` §2) è una dichiarazione informale, senza processo di verifica strutturato; il profilo di un Professionista richiede invece un modello capace di distinguere una dichiarazione da un titolo verificato, un'iscrizione attiva da una sospesa, un'abilitazione territorialmente limitata da una generale — complessità che giustifica un dominio a sé, distinto anche dall'Impresa che può offrire servizi structurati senza alcuna delle nozioni di qualifica personale che caratterizzano questo dominio.

**Differenza tra Persona, Professionista, Impresa, studio professionale e fornitore di servizi.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Persona | Identità individuale (`logical/persone.md`) | Esiste indipendentemente da qualsiasi esercizio professionale |
| Professionista | Ruolo professionale di una Persona | Una Persona con almeno un Profilo professionale (§2): qualifiche, servizi dichiarati, verifica propria |
| Impresa | Soggetto economico collettivo (`logical/imprese.md`) | Può offrire servizi professionali strutturati (ServizioImpresa) senza essere un Professionista né coincidere con una singola Persona |
| Studio professionale | Organizzazione tramite cui uno o più Professionisti operano | Non è un concetto autonomo di questo dominio: è un'Impresa (di forma organizzativa "attività professionale organizzata", `logical/imprese.md` §2) referenziata come Organizzazione professionale (§2, §4) |
| Fornitore di servizi | Termine generico | Può essere un'Impresa, un Professionista o entrambi contemporaneamente: non è un concetto di dominio, ma una descrizione informale che questo documento evita di usare come categoria propria |

---

## 2. Entità e concetti principali

| Concetto | Natura | Sintesi |
|---|---|---|
| Professionista | Ruolo/concetto | Il fatto che una Persona esercita una o più professioni; esiste anche prima di essere reso pubblico, analogamente a come un'Impresa esiste indipendentemente dalla pubblicazione della propria scheda (`logical/imprese.md` §1). |
| Profilo professionale | Entità autonoma (aggregate root) | La struttura che rappresenta e organizza il ruolo di Professionista di una Persona: al massimo un Profilo professionale per Persona, che può contenere più Categorie, Qualifiche e Servizi professionali (§13). |
| Categoria professionale | Concetto descrittivo (classificazione governata) | L'ambito professionale di massimo livello secondo il catalogo del §5. |
| Specializzazione | Concetto descrittivo | Un affinamento della Categoria (es. "diritto societario" dentro "area legale", §5). |
| Qualifica professionale | Entità dipendente | Una qualifica dichiarata specifica del Profilo professionale, con propria Fonte ed Evidenza (§6). |
| Titolo professionale | Concetto descrittivo (value object) | La denominazione formale del titolo (es. "Dottore commercialista", "Avvocato"), distinta dal Titolo di studio che lo precede (§6). |
| Iscrizione professionale | Entità dipendente | L'iscrizione a un Ordine o Collegio, con un proprio stato (attiva, sospesa, non più attiva, §6). |
| Abilitazione | Entità dipendente | L'autorizzazione legale all'esercizio, distinta dall'Iscrizione che tipicamente la segue (§6). |
| Competenza | Entità dipendente | Una competenza dichiarata nel contesto professionale, distinta dalla CompetenzaDichiarata generica del dominio Persone (`logical/persone.md` §2), che può referenziare come base senza duplicarla. |
| Esperienza | Concetto descrittivo (value object) | Anni e ambiti di esperienza professionale dichiarati, non un'entità a sé (§6). |
| Servizio professionale | Entità dipendente | Un servizio dichiarato dal Professionista (§7), distinto dall'OffertaDiServizio strutturata del dominio Servizi. |
| Settore servito | Relazione | Il collegamento con uno o più Settori economici (Tassonomia Condivisa). |
| Territorio servito | Relazione | Il collegamento con uno o più Territori (§8). |
| Mercato internazionale servito | Relazione | Il collegamento, quando pertinente, con un Mercato internazionale (dominio Mercati Internazionali), referenziato senza essere incorporato (§8). |
| Lingua operativa | Relazione | Il collegamento con una Lingua (Tassonomia Condivisa) dichiarata come utilizzabile nell'esercizio professionale, distinta dalla LinguaParlata generica della Persona (§8), analoga per ruolo a LinguaOperativaImpresa (`logical/imprese.md` §2). |
| Modalità di esercizio | Concetto descrittivo (classificazione, §4) | Come il Professionista esercita la propria attività (individuale, in studio, tramite società, ecc.). |
| Organizzazione professionale | Relazione | L'eventuale Impresa o studio tramite cui il Professionista opera, referenziata per identità o come riferimento esterno (§4). |
| Disponibilità | Concetto descrittivo (value object) | Se e come il Professionista è attualmente raggiungibile per un nuovo incarico (§9). |
| Tariffa indicativa | Concetto descrittivo (value object) | Un'indicazione di massima delle condizioni economiche, non un preventivo (§9). |
| Evidenza | Entità dipendente | Ciò che sostiene concretamente una verifica (§11), analoga per ruolo all'Evidenza già definita negli altri domini logici. |
| Fonte | Entità dipendente | Da dove proviene un'informazione dichiarata in questo dominio (§11), analoga per ruolo alla Fonte già definita negli altri domini logici. |
| Stato professionale | Asse di stato, non entità | Lo stato reale dell'esercizio professionale (§10). |
| Stato editoriale | Asse di stato, non entità | La fase redazionale con cui il profilo è stato dichiarato e pubblicato (§10). |
| Stato di verifica | Asse di stato, non entità | Quanto la piattaforma può confermare rispetto a quanto dichiarato (§10, §11). |
| Visibilità | Asse di stato, non entità | Chi può conoscere l'esistenza e i dettagli del profilo (§12). |

**Principio di non duplicazione.** Nessuno dei concetti sopra duplica Persona, Impresa, Appartenenza, Servizio, Mercato internazionale o Collaborazione: il Profilo professionale referenzia la Persona sottostante e, quando presente, l'Organizzazione professionale (Impresa), senza copiarne i dati; il Servizio professionale referenzia ma non sostituisce l'OffertaDiServizio del dominio Servizi né l'Offerta del dominio Collaborazioni (§7).

---

## 3. Natura del Professionista

**Distinzioni.**
- **Persona generica** — non ha alcun Profilo professionale: nessuna qualifica, servizio o competenza dichiarata in questo dominio.
- **Dipendente** — può essere un Professionista quando svolge funzioni specialistiche (§4), ma la sua relazione di lavoro con l'Impresa resta un'Appartenenza (`logical/appartenenze.md`), non un fatto di questo dominio.
- **Consulente occasionale** — può rientrare nel dominio se dichiara un Profilo professionale, anche con una modalità di esercizio "attività occasionale" (§4): l'occasionalità non esclude di per sé l'appartenenza al dominio.
- **Impresa** — soggetto economico collettivo, mai equivalente a un Professionista, anche quando offre servizi professionali strutturati (§1).
- **Studio professionale** — un'Organizzazione professionale (§2) tramite cui uno o più Professionisti operano, non un Professionista essa stessa.
- **Società di consulenza** — analoga allo studio professionale: un'Organizzazione, non un Professionista (questione di confine approfondita al §15).
- **Fornitore** — termine generico che può indicare un'Impresa o un Professionista (§1): non una categoria di questo dominio.
- **Formatore** — può essere un Professionista quando dichiara un Profilo professionale nella categoria "formazione" (§5), o restare un semplice titolare di un'OffertaFormativa nel dominio Servizi senza rientrare in questo dominio, secondo la propria scelta.
- **Mediatore** — analogo al formatore: può rientrare nel dominio come categoria professionale (§5) o restare un ruolo dichiarato altrove (es. in una Collaborazione, `logical/collaborazioni.md` §6).
- **Referente aziendale** — un ruolo di un'Appartenenza (`logical/appartenenze.md` §4), non un concetto di questo dominio: un referente aziendale può anche essere un Professionista, ma le due qualifiche restano indipendenti.

**Professioni regolamentate e non regolamentate.** Il dominio deve supportare entrambe allo stesso livello di dignità concettuale: una professione regolamentata (es. commercialista, avvocato, notaio) ha tipicamente un'Iscrizione professionale e un'Abilitazione verificabili tramite un Ordine o Collegio; una professione non regolamentata (es. consulente digitale, mediatore culturale senza titolo formale, §13) può avere Qualifiche dichiarate, Competenze ed Esperienza senza alcuna Iscrizione, senza che questo la renda un profilo di categoria inferiore nel modello.

**Non automatismi.** L'uso del termine "Professionista" in questo dominio non deve implicare automaticamente: iscrizione a un Ordine; abilitazione pubblica; esercizio in forma individuale; lavoro autonomo; possesso di una posizione fiscale specifica; affidabilità verificata. Ciascuno di questi fatti, quando rilevante, deve essere dichiarato e trattato secondo i propri assi di verifica (§6, §11), mai presunto dal solo fatto di avere un Profilo professionale.

---

## 4. Modalità di esercizio professionale

| Modalità | Significato |
|---|---|
| Esercizio individuale | Il Professionista opera senza alcuna struttura organizzativa dedicata |
| Studio individuale | Il Professionista opera tramite una propria struttura organizzativa dedicata, di cui è il solo titolare |
| Studio associato | Più Professionisti condividono una struttura organizzativa, mantenendo profili distinti |
| Società tra professionisti | Una forma organizzativa specifica prevista per l'esercizio associato di una professione regolamentata |
| Società di consulenza | Una struttura organizzativa che offre servizi professionali, tipicamente non regolamentati o misti |
| Collaborazione con Impresa | Il Professionista opera nell'ambito di un'Impresa non professionale, tramite un'Appartenenza (§13) |
| Dipendente che svolge funzioni specialistiche | Il Professionista è anche un dipendente di un'Impresa (Appartenenza di natura Lavoro, `logical/appartenenze.md` §3), ed esercita la propria specializzazione nell'ambito di quel rapporto |
| Rete professionale | Il Professionista appartiene a una rete che coordina o presenta più Professionisti, senza costituire un'unica Organizzazione professionale in senso stretto |
| Professionista esterno | Opera per una o più Imprese senza farne parte in modo stabile, tipicamente con Appartenenza di natura Consulenza (`logical/appartenenze.md` §3) |
| Attività occasionale compatibile con il dominio | Un esercizio non continuativo, comunque rappresentabile con un Profilo professionale (§3) |
| Attività internazionale o transfrontaliera | L'esercizio si estende oltre il territorio italiano, referenziando uno o più Mercati Internazionali (§8) |

**Principio.** Il Professionista è sempre distinto dalla struttura organizzativa attraverso cui opera (§1): l'Organizzazione professionale (§2) è referenziata, non incorporata. Una Persona può avere più modalità di esercizio contemporanee o successive (es. un esercizio individuale che si trasforma in uno studio associato, o un dipendente che avvia anche un'attività occasionale): il Profilo professionale (§2) può contenere più Qualifiche e più Servizi professionali collegati a modalità di esercizio diverse, senza che questo richieda profili distinti (§13).

---

## 5. Categorie, specializzazioni e competenze

La classificazione è volutamente ampia e non si basa esclusivamente sugli Ordini professionali, per accogliere allo stesso livello professioni regolamentate e non regolamentate (§3).

| Gruppo | Categorie |
|---|---|
| Area legale, fiscale e del lavoro | Area legale; fiscale e contabile; lavoro e previdenza |
| Finanza e credito | Finanza; finanza agevolata; credito; assicurazioni |
| Tecnica e costruita | Ingegneria; architettura; edilizia; energia; sostenibilità; sicurezza |
| Digitale e comunicazione | Digitale; informatica; marketing; comunicazione |
| Commercio e internazionalizzazione | Commercio; export; internazionalizzazione; dogane; logistica |
| Persone e organizzazione | Formazione; risorse umane; organizzazione aziendale |
| Immobiliare | Immobiliare |
| Linguistica e interculturale | Traduzione; interpretariato; mediazione culturale |
| Proprietà intellettuale e innovazione | Proprietà intellettuale; innovazione; startup |
| Residuale | Altri ambiti professionali |

**Distinzioni da mantenere sempre separate.**
- **Categoria** — l'ambito professionale di massimo livello (§2), governato centralmente.
- **Specializzazione** — un affinamento della Categoria, più specifico (es. "diritto societario" dentro "area legale").
- **Competenza** — una capacità dichiarata, che può essere trasversale a più Categorie (§2).
- **Esperienza** — un dato quantitativo o qualitativo su quanto e dove la Competenza è stata esercitata, distinto dalla Competenza stessa.
- **Qualifica** — un titolo, un'iscrizione o un'abilitazione formale (§6), distinta da una semplice Competenza dichiarata per il suo grado di formalità.
- **Servizio offerto** — cosa il Professionista dichiara di offrire concretamente (§7), distinto dalla Categoria che lo classifica.

**Confine di realizzazione del ciclo 1 (senza anticipare l’implementazione).** Nel primo ciclo fisico, le dichiarazioni di ambito e di offerta (Categoria dichiarata sul Profilo, Competenza professionale, Servizio professionale) sono fatti owned del Profilo e restano distinte dalle Qualifiche formali (§6) e dalla copertura territoriale/linguistica/di mercato (§8). La Specializzazione resta un concetto descrittivo: nel ciclo 1 non è un elenco governato autonomo; è un affinamento testuale opzionale della dichiarazione di Categoria. La Competenza professionale riusa la tassonomia condivisa delle competenze già usata dal dominio Persone, senza creare un secondo catalogo locale e senza coincidere con la CompetenzaDichiarata generica della Persona. Il Servizio professionale dichiarato non è OffertaDiServizio né ServizioImpresa; non implica contratti, pagamenti o prenotazioni. Eventuali riferimenti a Opportunità o Collaborazioni restano navigazione/utilizzo da quei domini verso Professionisti, non ownership inversa di questo dominio.

---

## 6. Qualifiche, titoli, iscrizioni e abilitazioni

| Concetto | Significato | Verifica (§11) |
|---|---|---|
| Titolo di studio | Il diploma o la laurea conseguita | Verificabile tramite l'istituto che lo ha rilasciato |
| Titolo professionale | La denominazione formale conseguita dopo il titolo di studio e gli eventuali passaggi ulteriori (es. esame di stato) | Verificabile tramite l'ente che lo attribuisce |
| Qualifica dichiarata | Un'indicazione di competenza o specializzazione dichiarata dal Professionista, meno formale del Titolo professionale | Verificabile solo se sostenuta da un'Evidenza specifica |
| Iscrizione a Ordine o Collegio | La registrazione presso l'ente statutario di riferimento per una professione regolamentata | Verificabile tramite l'Ordine o il Collegio stesso |
| Abilitazione | L'autorizzazione legale all'esercizio, tipicamente propedeutica o distinta dall'Iscrizione | Verificabile tramite l'ente o il registro che la rilascia |
| Certificazione | Un riconoscimento rilasciato da un ente certificatore, non necessariamente legato a una professione regolamentata | Verificabile tramite l'ente certificatore |
| Autorizzazione | Un permesso specifico rilasciato da un'autorità per una determinata attività, distinto dall'Abilitazione per il suo ambito più circoscritto | Verificabile tramite l'autorità che la rilascia |
| Esperienza professionale | Anni e ambiti di esercizio effettivo | Verificabile tramite referenze, documentazione o Fonti terze |
| Adesione associativa | L'adesione a un'associazione professionale non statutaria (da non confondere con l'Appartenenza del dominio omonimo, che riguarda esclusivamente la relazione Persona–Impresa, `logical/appartenenze.md` §1) | Verificabile tramite l'associazione stessa |
| Riconoscimento estero | Un titolo o un'abilitazione conseguiti in un altro Paese | Verificabile tramite l'ente estero che lo ha rilasciato |
| Equivalenza o riconoscimento in Italia | Il processo o il fatto che un Riconoscimento estero sia stato reso equivalente in Italia | Verificabile tramite l'autorità italiana competente |

**Principio cardine.** La piattaforma non deve presentare come abilitato un Professionista sulla sola base della dichiarazione (§11): ciascuno degli elementi sopra ha un proprio stato di verifica indipendente (§10, §11), e nessuno di essi implica automaticamente gli altri (es. un Titolo di studio non implica un'Abilitazione; un'Abilitazione non implica un'Iscrizione attiva).

**Casi da considerare esplicitamente.**
- **Professioni non regolamentate** — non hanno Iscrizione né Abilitazione in senso proprio: il Profilo professionale si appoggia su Qualifiche dichiarate, Certificazioni ed Esperienza (§3).
- **Titoli esteri** — trattati come Riconoscimento estero, con un eventuale processo di Equivalenza in Italia (§8, §13) non ancora concluso.
- **Iscrizioni sospese** — un'Iscrizione può transitare verso uno stato "sospesa" (§10) senza che questo cancelli il fatto che sia esistita.
- **Abilitazioni territorialmente limitate** — un'Abilitazione può essere valida solo in un territorio specifico, da dichiarare esplicitamente insieme al Territorio servito (§8).
- **Qualifiche scadute** — una Qualifica, una Certificazione o un'Abilitazione a validità temporale può scadere senza che questo cancelli lo storico della sua esistenza passata (§13).
- **Titoli contestati** — un Titolo professionale o una Qualifica possono transitare verso lo stato di verifica "Contestata" (§10, §11).

---

## 7. Servizi professionali

- **Servizio dichiarato** — un Servizio professionale (§2) esiste come dichiarazione del Profilo professionale.
- **Servizio attivo** — è correntemente offerto.
- **Servizio sospeso** — temporaneamente non offerto, in modo reversibile.
- **Servizio non più disponibile** — non è più offerto, in modo stabile.
- **Servizio rivolto a Persone** / **Servizio rivolto a Imprese** — il Servizio professionale può indicare a chi si rivolge, senza escludere l'altra categoria per default.
- **Servizio collegato a Opportunità** — quando il Servizio risponde a un'esigenza emersa da un'Opportunità (`logical/opportunita.md` §8), referenziata senza incorporazione.
- **Servizio collegato a Collaborazioni** — quando il Servizio è offerto nel contesto di una Collaborazione (`logical/collaborazioni.md` §2, Offerta), referenziata senza incorporazione.
- **Servizio collegato a Mercati internazionali** — quando il Servizio supporta l'accesso a un Mercato specifico (§8).
- **Servizio standard** — offerto con condizioni generali uniformi.
- **Servizio personalizzato** — adattato caso per caso.
- **Consulenza, formazione, assistenza, rappresentanza, progettazione, verifica, accompagnamento** — nature tipiche del Servizio professionale dichiarato, non mutuamente esclusive.

**Confine tra Professionista, Servizio professionale, OffertaDiServizio e Offerta di Collaborazioni.**

| Concetto | Dominio | Ruolo |
|---|---|---|
| Professionista | Professionisti (questo documento) | Chi può offrire una competenza: il soggetto e il suo profilo |
| Servizio professionale | Professionisti (questo documento) | La dichiarazione, all'interno del Profilo professionale, di cosa il Professionista offre — descrittiva, non ancora un'offerta strutturata con le regole complete di pubblicazione del dominio Servizi |
| OffertaDiServizio | Servizi (Domain Model §3) | L'offerta strutturata e pubblicata secondo le regole proprie del dominio Servizi, che può appoggiarsi a un Servizio professionale dichiarato qui, senza dipendere obbligatoriamente da esso (un'OffertaDiServizio può esistere anche a nome di un'Impresa senza alcun Professionista dichiarato) |
| Offerta (Collaborazioni) | Collaborazioni (`logical/collaborazioni.md` §2) | La disponibilità dichiarata all'interno di una specifica Collaborazione, che può referenziare un Professionista come proponente, senza che i due concetti si sovrappongano |

**Principio.** Questo dominio non duplica il dominio Servizi: Professionisti descrive **chi può offrire** una competenza (il soggetto, le sue qualifiche, la sua dichiarazione di massima), mentre Servizi descrive **l'offerta strutturata** con le proprie regole di pubblicazione, ricerca e ciclo di vita. Un Servizio professionale dichiarato in questo dominio è un fatto informativo del Profilo, non un'entità del dominio Servizi.

---

## 8. Territori, lingue e Mercati internazionali

- **Territorio di esercizio** — dove il Professionista opera fisicamente in modo abituale.
- **Territorio servito** — dove il Professionista è disposto a offrire i propri servizi, anche diverso dal Territorio di esercizio.
- **Disponibilità in presenza** — il Professionista può operare fisicamente nel Territorio servito.
- **Disponibilità da remoto** — il Professionista può operare senza presenza fisica.
- **Copertura locale, nazionale, internazionale** — l'ampiezza del Territorio servito o del Mercato servito.
- **Paesi serviti** — i Paesi specifici (dominio Mercati Internazionali) in cui il Professionista dichiara di poter operare.
- **Mercati internazionali conosciuti** — i Mercati (`logical/mercati-internazionali.md` §2) che il Professionista dichiara di conoscere o poter supportare.
- **Lingue operative** — le lingue utilizzabili nell'esercizio professionale (§2).
- **Lingue di supporto** — lingue disponibili in modo accessorio, non come lingua operativa principale.
- **Competenze interculturali** — una capacità dichiarata di mediazione o comprensione di contesti culturali diversi (§6, come Qualifica dichiarata o Competenza).

**Principio di non automatismo, senza eccezioni**, coerente con `logical/mercati-internazionali.md` §9: il dominio evita qualsiasi automatismo tra origine, nazionalità, lingua, capacità professionale, conoscenza di un mercato e affidabilità. Una lingua operativa deve essere dichiarata o verificata autonomamente (§6, §11): non è dedotta dall'origine della Persona sottostante né da alcun altro dato identitario.

**Principio sul confine con Mercati Internazionali.** Il Professionista può supportare l'accesso a un Mercato internazionale (es. come Risorsa di supporto al mercato, `logical/mercati-internazionali.md` §2, o come controparte di una Relazione commerciale internazionale) senza diventare parte di quel dominio: il Mercato resta definito e governato esclusivamente da `logical/mercati-internazionali.md`.

**Confine di realizzazione del ciclo 1 (copertura operativa, senza anticipare l’implementazione).** Nel primo ciclo fisico, la copertura del Profilo è modellata come dichiarazioni owned distinte: territori serviti/di esercizio (con modalità presenza/remoto a livello territorio, senza catalogo Territori condiviso), lingue operative/di supporto professionali (catalogo `languages`, distinte da LinguaParlata della Persona e da LinguaOperativaImpresa), mercati internazionali conosciuti/serviti/supportati (riferimento opaco al Mercato, senza Presenza/Interesse/Attività), settori economici serviti (catalogo `business_sectors` condiviso). La disponibilità temporale/di carico (asse §9) resta sull’Aggregate Root e non è una tabella di copertura. Lingue o territori per singolo Servizio professionale, sedi operative autonome, mobilità come entità separata e catalogo Territori/countries sono fuori dal ciclo 1 o rinviate.

---

## 9. Disponibilità e condizioni professionali

- **Disponibile** — il Professionista può essere contattato per un nuovo incarico.
- **Disponibilità limitata** — può accettare, ma con capacità ridotta.
- **Non disponibile** — non può accettare nuovi incarichi al momento.
- **Disponibilità futura** — non disponibile ora, ma con un orizzonte temporale dichiarato.
- **Accettazione su valutazione** — la disponibilità dipende da una valutazione caso per caso della richiesta.
- **Disponibilità per incarichi singoli** / **Disponibilità continuativa** — la natura dell'impegno che il Professionista è disposto ad accettare.
- **Disponibilità per collaborazioni** / **Disponibilità per consulenze** / **Disponibilità per formazione** — la natura specifica dell'impegno.
- **Disponibilità territoriale** / **Disponibilità da remoto** — dove il Professionista è disposto a operare (§8).
- **Fascia di impegno** — un'indicazione di massima del tempo che il Professionista può dedicare.
- **Tempi indicativi di risposta** — quanto tempo il Professionista dichiara di impiegare per rispondere a una richiesta.
- **Tariffa indicativa** — un'indicazione di massima delle condizioni economiche (§2).
- **Preventivo su richiesta** — le condizioni economiche precise richiedono un passaggio successivo, non dichiarato in questo dominio.
- **Servizio gratuito** / **Servizio agevolato** — condizioni economiche particolari dichiarabili come proprietà del Servizio professionale (§7).
- **Riservatezza delle condizioni economiche** — la Tariffa indicativa può non essere pubblica (§12).

**Principi cardine.**
- La disponibilità dichiarata **non equivale automaticamente all'accettazione dell'incarico**: un Professionista "Disponibile" può comunque rifiutare una richiesta specifica.
- La tariffa indicativa **non equivale a un preventivo né a un accordo definitivo**: resta un'indicazione di massima, mai un impegno vincolante.

---

## 10. Ciclo di vita del profilo professionale

Il percorso di un Profilo professionale è descritto da **cinque assi distinti**, che non devono mai essere compressi in un unico stato, coerente con l'approccio già adottato in tutti i domini logici precedenti.

**a) Stato editoriale (fase redazionale).**
- *Bozza* — il Profilo è in preparazione, non ancora formalizzato.
- *Dichiarato* — il Profilo è stato formalizzato dalla Persona.
- *Pubblicato* — il Profilo è stato reso visibile secondo le regole applicabili (§12).

**b) Stato di verifica.**
- *In verifica* — uno o più elementi del Profilo (Qualifiche, Iscrizioni, ecc., §6) sono in fase di controllo.
- *Verificato parzialmente* — alcuni assi di verifica (§11) sono stati confermati, altri non ancora.
- *Verificato* — gli assi di verifica rilevanti per il Profilo risultano confermati.
- *Contestato* — uno o più elementi del Profilo sono stati messi in dubbio da una delle parti coinvolte o da un terzo con titolo per farlo; può sovrapporsi in qualsiasi momento agli altri stati.

**c) Stato professionale reale.** Descrive dove si trova, nel proprio percorso effettivo, l'esercizio professionale:
- *Attivo* — il Professionista esercita correntemente.
- *Sospeso* — l'esercizio è temporaneamente interrotto (es. per una sospensione dell'Iscrizione o per scelta propria), in modo reversibile.
- *Cessato* — l'esercizio è terminato in modo ordinario (es. per cessazione volontaria dell'attività, ritiro).
- *Revocato* — una qualifica o un'autorizzazione essenziale all'esercizio è stata formalmente ritirata da chi ne ha titolo (es. una radiazione disciplinare): distinto da Cessato per la sua natura non volontaria e tipicamente conseguente a un provvedimento.
- *Archiviato* — stato finale di conservazione storica, successivo a Cessato o Revocato.

**d) Disponibilità.** Un quarto asse, trattato integralmente al §9: descrive se il Professionista è attualmente raggiungibile per un nuovo incarico, indipendentemente dallo stato professionale reale complessivo. Uno stato realmente rilevante di questo asse è *Temporaneamente non disponibile*, distinto da "Sospeso" (asse c): un Professionista può essere Attivo (asse c) ma temporaneamente non disponibile (asse d) per ragioni di carico di lavoro, senza che il proprio esercizio professionale sia in alcun modo interrotto.

**e) Visibilità.** Un quinto asse, trattato integralmente al §12: descrive chi può conoscere l'esistenza e i dettagli del Profilo professionale.

**Perché i cinque assi restano separati.** Un Profilo può essere Pubblicato (asse a) e Verificato parzialmente (asse b) contemporaneamente; può essere Attivo (asse c) ma Non disponibile (asse d) per un periodo; può essere Contestato (asse b) senza che questo lo renda automaticamente Sospeso (asse c), fino a una risoluzione. Comprimere questi cinque assi in un'unica proprietà obbligherebbe a scegliere significati impropri per combinazioni reali e frequenti.

---

## 11. Verifica, fonti e affidabilità

**Assi di verifica**, coerenti con l'approccio già adottato in tutti i domini logici precedenti:

- **Identità della Persona** — la piattaforma ha potuto confermare chi è realmente la Persona sottostante.
- **Esistenza dell'eventuale organizzazione** — quando il Professionista opera tramite un'Organizzazione professionale (§4), questo dominio non conduce una propria verifica autonoma: si affida esclusivamente all'esistenza già accertata dal dominio Imprese, referenziandone l'esito senza duplicarlo (analogamente a come l'asse "Relazione con Impresa o studio", sotto, si affida alla relativa Appartenenza).
- **Titolo professionale** — la piattaforma ha potuto confermare il Titolo dichiarato (§6).
- **Iscrizione** — la piattaforma ha potuto confermare l'Iscrizione dichiarata.
- **Abilitazione** — la piattaforma ha potuto confermare l'Abilitazione dichiarata.
- **Qualifica** — la piattaforma ha potuto confermare una Qualifica dichiarata.
- **Certificazione** — la piattaforma ha potuto confermare una Certificazione dichiarata.
- **Esperienza** — la piattaforma ha potuto confermare l'Esperienza dichiarata.
- **Servizio dichiarato** — la piattaforma ha potuto confermare che il Servizio professionale dichiarato corrisponde a quello realmente offerto.
- **Territorio servito** — la piattaforma ha potuto confermare il Territorio dichiarato.
- **Lingua operativa** — la piattaforma ha potuto confermare la competenza linguistica dichiarata come rilevante per l'esercizio professionale.
- **Relazione con Impresa o studio** — la piattaforma ha potuto confermare la relazione dichiarata con l'Organizzazione professionale, tramite la relativa Appartenenza (§4).
- **Disponibilità** — la piattaforma ha potuto confermare che la disponibilità dichiarata è aggiornata e reale.
- **Contatti** — la piattaforma ha potuto confermare la validità dei canali di contatto dichiarati per l'esercizio professionale (es. un canale dedicato all'attività, distinto da quello personale): un dato giustificato come parte dell'offerta professionale, non una copia dei contatti personali già posseduti da Persone; quando il Professionista non dichiara alcun canale proprio, il Profilo può referenziare i soli contatti pubblici già resi visibili da Persone, senza che questo dominio ne acquisisca la proprietà.

**Fonti previste.** Dichiarazione del Professionista; Ordine o Collegio; registro pubblico; università; ente certificatore; organizzazione professionale; Impresa; studio professionale; cliente; ente partner; redazione; fonte pubblica; documento ufficiale.

**Principi cardine.**
- **Nessun badge unico.** Un badge generico "Professionista verificato" nasconderebbe quale specifico aspetto è stato confermato: un Profilo può avere il Titolo professionale verificato ma l'Esperienza non ancora controllata; può avere l'Iscrizione confermata ma nessuna verifica sulla Disponibilità dichiarata. Mantenere gli assi separati, ciascuno con la propria Fonte ed Evidenza (§2), permette di comunicare con precisione cosa la piattaforma sa per certo.
- **La verifica di un titolo non dimostra automaticamente qualità, esperienza o affidabilità**: un titolo verificato conferma solo che il titolo esiste ed è attribuito a quella Persona, non la qualità con cui la professione viene esercitata né l'esito delle prestazioni passate (questione di reputazione, esplicitamente fuori perimetro, §1, §15).

**Confine di realizzazione del ciclo 1 (FEV profilo, senza anticipare l’implementazione).** Nel primo ciclo fisico, Fonti–Evidenze–Verifiche sono tre tabelle owned del Profilo professionale (non un FEV condiviso cross-domain, non tabelle per-credenziale, non Storage file). Le Verifiche sono current-state per aspetto chiuso del Profilo; non esiste una proiezione persistita di “Profilo verificato” complessiva. L’asse di verifica autorevole sulla riga delle credenziali formali (`verification_status` su Qualifiche/Iscrizioni/Abilitazioni/Certificazioni) e sulle dichiarazioni leggere che lo prevedono resta distinto dal `status` FEV per aspetto. Identità Persona, esistenza Organizzazione e relazione Appartenenza restano utilizzo di esiti esterni, non aspetti FEV locali. Allegati binari, URL strutturati, hash file e FEV per-credenziale dedicato sono fuori ciclo 1 o rinviati.

---

## 12. Visibilità, pubblicazione e ricerca

- **Profilo privato** — noto solo alla Persona che lo ha dichiarato.
- **Profilo visibile alla redazione** — noto alla redazione, tipicamente durante la valutazione (§10, asse a).
- **Profilo visibile a una rete** — noto a chi appartiene a una rete professionale specifica (§4).
- **Profilo visibile a soggetti selezionati** — condiviso con un insieme specifico di destinatari.
- **Profilo pubblico** — visibile a chiunque consulti la piattaforma.
- **Profilo anonimo o parzialmente anonimo** — visibile nei contenuti essenziali (es. categoria, territorio) senza rivelare l'identità completa.
- **Contatti riservati** — non pubblicati, anche quando il resto del Profilo è pubblico.
- **Contatti visibili dopo autorizzazione** — resi visibili solo dopo un'azione esplicita del Professionista, analoga al principio già adottato in `logical/collaborazioni.md` §9/§12.
- **Qualifica pubblica con evidenze riservate** — la Qualifica stessa (es. "Avvocato") è pubblica, mentre le Evidenze di verifica sottostanti restano riservate.
- **Profilo contestato** — visibile con un'indicazione esplicita che uno o più elementi sono in dubbio (§10).
- **Profilo sospeso** — temporaneamente non visibile pubblicamente, in modo reversibile.
- **Profilo archiviato** — non più nei percorsi correnti, conservato come riferimento storico.

**Ricerca.** Il dominio deve permettere di ricercare Professionisti per: categoria; specializzazione; servizio; territorio; settore; lingua; Mercato internazionale; disponibilità; modalità di esercizio; qualifica verificata.

**Principio di coerenza tra domini.** La visibilità delle informazioni di questo dominio non deve mai eccedere quella consentita da Persona, Impresa e Appartenenza: un Profilo professionale collegato a una Persona con profilo non pubblico non può essere pubblico; un'Organizzazione professionale (Impresa) non pubblica non può essere rivelata pubblicamente come collegata al Profilo, coerente con il principio già stabilito in `logical/imprese.md` §9, `logical/appartenenze.md` §11, `logical/mercati-internazionali.md` §11, `logical/opportunita.md` §12 e `logical/collaborazioni.md` §12.

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Professionista deve essere collegato a una Persona esistente (§2): non può esistere un Profilo professionale senza una Persona sottostante.
2. Il Professionista non coincide con la Persona (§1, §3): la Persona esiste indipendentemente dall'avere o meno un Profilo professionale.
3. Un Professionista può operare attraverso una o più organizzazioni (§4): non è limitato a un'unica modalità di esercizio.
4. Un'Impresa può offrire servizi professionali senza coincidere con il Professionista (§1, §7): sono concetti distinti.
5. Una qualifica dichiarata non equivale a una qualifica verificata (§6, §10, §11).
6. Un titolo verificato non equivale a garanzia di qualità (§11).
7. Una disponibilità dichiarata non equivale ad accettazione dell'incarico (§9).
8. Una tariffa indicativa non equivale a preventivo (§9).
9. Professionisti non attribuisce diritti di accesso: ogni fatto qui registrato è un fatto di dominio, non un permesso tecnico.
10. La relazione con un'Impresa deriva da Appartenenze (§4, §13): mai dalla sola dichiarazione all'interno di questo dominio.
11. Un Professionista può essere collegato a Collaborazioni e Opportunità senza incorporarle (§1, §7).
12. Lo storico delle qualifiche e delle modalità di esercizio deve poter essere conservato (§6, §10): nessuna Qualifica, Iscrizione o Abilitazione scaduta o revocata viene eliminata dallo storico.
13. La piattaforma non garantisce la qualità o l'esito della prestazione (§9, §11): nessuna informazione di questo dominio costituisce una promessa di risultato.
14. Il dominio deve poter alimentare l'Osservatorio con dati aggregati compatibili con la riservatezza (§1).

**Casi limite.**

**Persona con più professioni.** Il Profilo professionale può contenere più Categorie, Qualifiche e Servizi professionali (§2, §4): non richiede profili distinti.

**Professionista iscritto a più Ordini.** Il dominio ammette più Iscrizioni professionali contemporanee (§6), ciascuna con il proprio stato di verifica.

**Titolo estero non ancora riconosciuto.** Corrisponde a un Riconoscimento estero senza Equivalenza in Italia (§6): un dato legittimo e dichiarabile, non un errore.

**Professione non regolamentata.** Pienamente prevista (§3, §6): il Profilo si appoggia su Qualifiche dichiarate, Certificazioni ed Esperienza.

**Professionista sospeso dall'Ordine.** Corrisponde a un'Iscrizione professionale con stato "sospesa" (§6), che tipicamente comporta anche lo stato professionale reale "Sospeso" (§10).

**Professionista cessato.** Corrisponde allo stato professionale reale "Cessato" (§10): l'esercizio è terminato in modo ordinario, e il Profilo resta storicizzato.

**Dipendente che offre competenze per conto dell'Impresa.** Modalità di esercizio "Dipendente che svolge funzioni specialistiche" (§4): l'Appartenenza di natura Lavoro coesiste con il Profilo professionale, senza confondersi con esso.

**Professionista che opera tramite società.** Modalità di esercizio "Società tra professionisti" o "Società di consulenza" (§4): l'Organizzazione professionale è referenziata come Impresa.

**Società che offre servizi senza indicare singoli professionisti.** L'Impresa può offrire un ServizioImpresa (`logical/imprese.md` §2) senza che alcun Professionista individuale sia dichiarato in questo dominio: il caso resta pienamente nel perimetro del dominio Imprese, senza obbligo di rappresentazione in questo dominio.

**Studio con più professionisti.** Più Profili professionali possono referenziare la stessa Organizzazione professionale (§4), ciascuno con la propria Appartenenza (`logical/appartenenze.md`).

**Professionista con più sedi.** Il Territorio di esercizio e il Territorio servito (§8) possono comprendere più localizzazioni.

**Professionista disponibile solo da remoto.** Corrisponde a "Disponibilità da remoto" senza "Disponibilità in presenza" (§8, §9): pienamente prevista.

**Professionista che opera in più Paesi.** Corrisponde a più Mercati internazionali conosciuti o più Paesi serviti (§8): nessun limite implicito.

**Professionista che dichiara una lingua non verificata.** Corrisponde allo stato di verifica "Non verificata" (implicito, §10, §11) per l'asse Lingua operativa: legittimo, con la dovuta cautela nella presentazione (§11, principio sulla verifica del titolo).

**Professionista che offre servizi gratuiti.** Corrisponde a "Servizio gratuito" (§9): pienamente previsto, senza che questo alteri la struttura del Profilo.

**Professionista che non pubblica i contatti.** Corrisponde a "Contatti riservati" (§12): il Profilo può restare pubblico pur senza contatti diretti visibili.

**Profilo rivendicato.** Un Profilo creato da un terzo (es. la redazione, caso successivo) può essere successivamente "rivendicato" dalla Persona a cui si riferisce, tramite un processo di verifica dell'identità non ulteriormente specificato in questo documento (questione aperta, §15).

**Profilo creato dalla redazione.** Il dominio ammette che un Profilo professionale nasca per iniziativa della redazione (Fonte "redazione", §11), non solo per autodichiarazione della Persona, con un percorso di verifica dell'identità da definire (§15).

**Profilo contestato.** Corrisponde allo stato di verifica "Contestato" (§10, §11): rappresentato come fatto, senza gestirne la risoluzione (§1).

**Qualifica scaduta.** Una Qualifica, Certificazione o Abilitazione a termine può scadere senza perdere la propria storicizzazione (§6, §13, regola 12).

**Iscrizione non più attiva.** Analoga alla Qualifica scaduta: l'Iscrizione professionale transita verso uno stato non attivo, restando storicizzata.

**Più qualifiche con periodi diversi.** Il dominio ammette che una Qualifica sia stata valida in un periodo e non in un altro, con la relativa storicizzazione (§6, §13).

**Servizio dichiarato ma non più offerto.** Corrisponde a "Servizio non più disponibile" (§7): distinto da "Servizio sospeso" per la sua natura tendenzialmente stabile.

**Professionista collegato a Impresa cessata.** Analogo al caso già trattato in `logical/mercati-internazionali.md` §13 e `logical/collaborazioni.md` §13 per le rispettive relazioni con un'Impresa cessata (`logical/imprese.md` §5): l'Appartenenza e il Profilo professionale restano storicizzati.

**Professionista deceduto o non più rintracciabile.** Il dominio non prevede in questo documento un processo specifico distinto dalla cancellazione della Persona sottostante (`logical/persone.md` §6, regola 9): il Profilo professionale segue lo stato della Persona a cui è ancorato, transitando verso stati terminali appropriati (Cessato, Archiviato, §10) quando la Persona stessa cessa di essere attiva.

**Mediatore culturale senza titolo formale.** Pienamente previsto (§3, §6): una Qualifica dichiarata e un'Esperienza possono sostenere il Profilo anche senza alcuna Iscrizione o Abilitazione.

**Consulente con esperienza ma senza certificazioni.** Analogo al caso precedente: l'Esperienza (§6) è un asse di verifica indipendente dalla Certificazione.

**Agente immobiliare.** Rientra nella Categoria "immobiliare" (§5), con le proprie Qualifiche, Iscrizioni e Abilitazioni specifiche del settore, secondo lo stesso modello generale.

**Formatore occasionale.** Corrisponde alla modalità di esercizio "attività occasionale compatibile con il dominio" (§4) nella Categoria "formazione" (§5).

**Professionista che agisce sia come Persona sia per un'Impresa.** Il Profilo professionale resta unico e ancorato alla Persona (§13, regola 1-2); le diverse modalità di esercizio (individuale, tramite Impresa) coesistono nello stesso Profilo tramite Servizi professionali e Organizzazioni professionali distinti (§4).

---

## 14. Eventi di dominio

- **ProfessionistaDichiarato** — una Persona ha dichiarato di esercitare una professione, dando origine al proprio ruolo di Professionista.
- **ProfiloProfessionaleCreato** — è stato creato un nuovo Profilo professionale (stato editoriale "Bozza" o "Dichiarato").
- **ProfiloProfessionalePubblicato** — il Profilo è diventato visibile secondo le regole applicabili (§12).
- **QualificaDichiarata** — una nuova Qualifica professionale è stata dichiarata (§6).
- **QualificaVerificata** — una Qualifica dichiarata è stata confermata.
- **QualificaContestata** — una Qualifica dichiarata è stata messa in dubbio.
- **IscrizioneProfessionaleVerificata** — un'Iscrizione a Ordine o Collegio è stata confermata.
- **IscrizioneProfessionaleSospesa** — un'Iscrizione è transitata verso uno stato di sospensione.
- **AbilitazioneVerificata** — un'Abilitazione dichiarata è stata confermata.
- **ServizioProfessionaleDichiarato** — un nuovo Servizio professionale è stato dichiarato (§7).
- **ServizioProfessionaleSospeso** — un Servizio professionale è transitato verso lo stato "Sospeso".
- **DisponibilitàProfessionaleModificata** — la Disponibilità dichiarata è cambiata (§9).
- **OrganizzazioneProfessionaleAssociata** — il Profilo è stato collegato a un'Organizzazione professionale (§4).
- **OrganizzazioneProfessionaleDisassociata** — il collegamento con un'Organizzazione professionale è terminato.
- **TerritorioServitoModificato** — i Territori serviti dichiarati sono cambiati (§8).
- **LinguaOperativaDichiarata** — una nuova Lingua operativa è stata dichiarata (§8).
- **LinguaOperativaVerificata** — una Lingua operativa dichiarata è stata confermata.
- **ProfiloProfessionaleContestato** — il Profilo, o un suo elemento specifico, è stato messo in dubbio.
- **ProfiloProfessionaleSospeso** — il Profilo è transitato verso lo stato professionale reale "Sospeso".
- **ProfiloProfessionaleCessato** — il Profilo è transitato verso lo stato professionale reale "Cessato".
- **ProfiloProfessionaleArchiviato** — il Profilo è stato ritirato dai percorsi di consultazione correnti, restando conservato come riferimento storico.
- **VisibilitàProfessionistaModificata** — il livello di visibilità del Profilo, o di un suo elemento, è cambiato (§12).

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Notifiche, Ricerca, Osservatorio, Servizi) possono voler conoscere per reagire — ad esempio, il dominio Servizi può proporre di trasformare un ServizioProfessionaleDichiarato in un'OffertaDiServizio strutturata, o l'Osservatorio può aggiornare le proprie statistiche alla comparsa di un ProfiloProfessionalePubblicato — senza che questo dominio debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate.**

1. Professionisti è un dominio autonomo, con proprie entità, proprio ciclo di vita e proprie regole (§1).
2. Professionista e Persona sono concetti distinti (§1, §3): non ogni Persona è un Professionista.
3. Professionista e Impresa sono concetti distinti (§1): un'Impresa non coincide con un Professionista anche quando offre servizi professionali.
4. Un Professionista deve essere collegato a una Persona (§2, §13, regola 1).
5. Un Professionista può operare tramite una o più organizzazioni (§4, §13, regola 3).
6. La relazione con un'Impresa o uno studio deriva da Appartenenze (§4, §13, regola 10).
7. Professionisti e Servizi sono concetti distinti (§1, §7): questo dominio descrive chi può offrire una competenza, Servizi descrive l'offerta strutturata.
8. Professionisti e Collaborazioni sono concetti distinti (§1, §7).
9. Qualifica, titolo, iscrizione, abilitazione, certificazione, competenza ed esperienza sono concetti distinti (§6).
10. Una qualifica verificata non garantisce la qualità della prestazione (§11, §13, regola 6).
11. Stato professionale, stato editoriale, verifica, disponibilità e visibilità sono assi separati (§10).
12. La piattaforma non garantisce l'esito della prestazione professionale (§9, §11, §13, regola 13).
13. Professionisti non attribuisce diritti di accesso (§13, regola 9).
14. I diritti di accesso restano responsabilità del futuro dominio Identità & Accessi.
15. Il dominio supporta professioni regolamentate e non regolamentate, allo stesso livello di dignità concettuale (§3, §6).
16. Il dominio supporta esercizio individuale, studi, società, reti e collaborazioni con Imprese (§4).
17. Il dominio supporta attività locali, nazionali e internazionali (§8).
18. Le competenze linguistiche e culturali non possono essere dedotte automaticamente dall'origine (§8).
19. Il dominio può alimentare l'Osservatorio con dati aggregati senza compromettere informazioni personali o professionali riservate (§1, §13).

**Domande aperte.**

- Qual è il confine esatto tra Professionisti e Persone, in particolare su quali competenze debbano restare CompetenzaDichiarata generica e quali richiedano un Profilo professionale strutturato?
- Qual è il confine esatto tra Professionisti e Imprese, in particolare per le società di consulenza senza singoli Professionisti dichiarati (§13)?
- Qual è il confine esatto tra Professionisti e Servizi, oltre alla distinzione già stabilita al §7, in particolare su come evitare duplicazioni quando un Servizio professionale diventa un'OffertaDiServizio?
- Come devono essere trattate le società di consulenza (§3, §4): come semplice Organizzazione professionale referenziata, o con proprie regole distinte?
- Come devono essere rappresentati gli studi professionali (§4), oltre al trattamento come Impresa già stabilito?
- Quale trattamento specifico devono avere i Professionisti senza iscrizione a Ordini (§3, §6), oltre al principio generale di parità già stabilito?
- Con quale processo si verificano concretamente i titoli professionali esteri (§6, §8)?
- Con quale periodicità le Iscrizioni professionali verificate devono essere risottoposte a controllo (§11)?
- Quale responsabilità assume la piattaforma, se alcuna, sulla validità nel tempo delle qualifiche presentate come verificate (§6, §11, §13, regola 6)?
- Come deve essere rappresentata operativamente l'Esperienza (§6), oltre alla sua natura di value object già stabilita?
- Un futuro sistema di recensioni e reputazione (§1, §15) deve appartenere a questo dominio o a un dominio distinto?
- Le tariffe indicative (§9) devono essere pubblicabili di default o richiedere una scelta esplicita di visibilità?
- In quale momento esatto devono diventare visibili i contatti di un Professionista (§12), oltre al principio generale già stabilito?
- In quali casi deve essere possibile un profilo anonimo o parzialmente anonimo (§12)?
- Come devono essere gestiti operativamente i profili creati dalla redazione prima di essere rivendicati (§13)?
- Con quale processo una Persona può rivendicare un Profilo professionale creato da un terzo (§13)?
- Qual è il collegamento esatto con Collaborazioni oltre al riferimento già stabilito al §1 e al §7?
- Qual è il collegamento esatto con Opportunità oltre al riferimento già stabilito al §1?
- Qual è il collegamento esatto con Mercati Internazionali oltre al riferimento già stabilito al §8?
- Qual è il collegamento esatto con un futuro dominio Immobiliare, in particolare per gli agenti immobiliari (§13)?
- Quali informazioni di questo dominio, esattamente, potranno essere utilizzate dall'Osservatorio, e con quale livello di aggregazione o anonimizzazione?
- In futuro, professionisti regolamentati e non regolamentati dovranno essere trattati come sotto-domini distinti con regole proprie, o restare un'unica classificazione all'interno di un solo dominio Professionisti — e analogamente, Servizi dovrà restare un dominio unico o articolarsi in sotto-domini dedicati alle diverse categorie professionali?

Queste domande restano decisioni progettuali future, coerenti con l'approccio già adottato in `logical/persone.md`, `logical/imprese.md`, `logical/appartenenze.md`, `logical/mercati-internazionali.md`, `logical/opportunita.md` e `logical/collaborazioni.md`.

**Confine di chiusura del ciclo 1 (M8).** La chiusura formale del primo ciclo fisico non introduce nuove entità logiche né seed dimostrativi: lo SKIP del seed demo (M8.1) e il report di validazione/accettazione (M8.2, `professionisti-validation-report.md`, esito `ACCETTATA`) riconciliano il modello logico con il contratto fisico e le migration strutturali già realizzate (cataloghi, Profilo, credenziali, ambito/servizi, copertura, FEV profilo). Non costituisce un nuovo asse di verifica, pubblicazione o reputazione. Il ciclo 1 strutturale è chiuso a livello di accettazione documentale.

