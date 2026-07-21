# Logical Data Model — Dominio IMPRESE

> Livello logico. Nessun riferimento a database, PostgreSQL, Supabase, SQL, tabelle, colonne, tipi dato, chiavi primarie, chiavi esterne, indici, constraint tecnici, RLS, API, componenti front-end o migration.
> Fondamenti (non modificati da questo documento): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), [`docs/architecture/logical/persone.md`](./persone.md).
> Ruolo di questo documento: essere il modello logico del dominio Imprese, secondo anello della catena di ingegnerizzazione dopo il dominio Persone. Traduce la responsabilità funzionale di "rappresentare il soggetto economico" in un modello di entità, relazioni, cardinalità, stati e regole, comprensibile a chi si occupa di prodotto, governance e contenuti oltre che a chi progetterà in seguito il livello fisico.
> Continuità con il Domain Model già approvato: il Domain Model (§"Impresa & Organizzazioni", §"Appartenenza") ha già stabilito che l'Impresa è un aggregato distinto dalla Persona e che la relazione tra i due è un aggregato connettivo autonomo. Questo documento non ridiscute quella decisione: la eredita e la sviluppa al livello di dettaglio logico richiesto per progettare il dominio Imprese.

---

## 1. Responsabilità del dominio

**Cosa comprende.** Il dominio Imprese rappresenta il soggetto economico in quanto tale: la sua identità pubblica, la sua presentazione, le sedi in cui opera, i settori in cui è attivo, i servizi e i prodotti che offre, i mercati in cui è presente o interessato, le lingue realmente utilizzabili nei rapporti con l'esterno, le certificazioni e qualificazioni che dichiara o che le vengono riconosciute, i canali attraverso cui comunica e opera, e i contenuti multimediali che la rappresentano. Comprende inoltre il significato di business della relazione tra una Persona e un'Impresa (AppartenenzaImpresa): quali ruoli sono possibili, quali responsabilità comporta, come nasce, come si conclude, come può essere contestata.

Il dominio esiste per rendere la scheda impresa uno strumento utile — visibilità, affidabilità, networking, sviluppo commerciale, collaborazione, analisi economica — e non una semplice anagrafica camerale. Ogni entità descritta in questo documento è stata scelta perché risponde a uno di questi scopi, non per completezza descrittiva fine a se stessa.

**Cosa NON comprende.**
- Non comprende i dati personali delle Persone collegate (nome, biografia, competenze, lingue personali, storie personali): appartengono al dominio Persone, che il dominio Imprese referenzia ma non duplica.
- Non comprende l'infrastruttura tecnica di autenticazione, autorizzazione o gestione degli accessi: chi può materialmente modificare cosa è una responsabilità del dominio Identità e Accessi. Il dominio Imprese descrive solo il *significato di business* della facoltà di gestione (§7), non il meccanismo che la implementa.
- Non comprende le Collaborazioni cercate o offerte da un'impresa, né le Opportunità pubblicate a suo nome: sono contenuti del dominio Opportunità & Collaborazioni, che referenziano l'Impresa come titolare senza essere incorporati nell'entità Impresa (§14).
- Non comprende gli Eventi organizzati o partecipati da un'impresa: appartengono al dominio Eventi, che referenzia l'Impresa come organizzatore o partecipante.
- Non comprende le Storie editoriali di impresa: sono contenuti del dominio Contenuti e Storie, che referenziano l'Impresa come soggetto raccontato, non un'estensione descrittiva dell'entità Impresa.
- Non comprende i report e le statistiche aggregate: appartengono al dominio Osservatorio, che consuma dati derivati dalle Imprese senza mai diventarne fonte primaria né proprietario.
- Non comprende i Mercati Internazionali come entità proprie (definizione, confini geografici, contenuti aggregati per Paese): il dominio Imprese dichiara solo la relazione (MercatoImpresa) tra un'Impresa e un Mercato che appartiene al dominio Mercati.
- Non comprende i Territori italiani come entità proprie (città, provincia, regione): il dominio Imprese li referenzia per localizzare le proprie sedi, senza definirli.
- Non comprende il dominio Formazione: un'Impresa può comparirvi come fornitore o richiedente di formazione, ma quella relazione appartiene interamente al dominio Formazione.
- Non comprende il dominio Professionisti: `docs/architecture/logical/professionisti.md` ha risolto come dominio autonomo la domanda che questo documento lasciava aperta al §12, confermando che un professionista individuale resta una Persona che assume il ruolo di Professionista, senza diventare per ciò stesso un'Impresa. Un'Impresa può comunque avvalersi di Professionisti esterni o essere essa stessa titolare di un'attività professionale organizzata (§2): la relazione è sempre di riferimento reciproco, non di incorporazione.

**Quali altri domini utilizza.**
- **Persone** — per referenziare le Persone collegate tramite AppartenenzaImpresa. Il dominio Imprese non possiede né definisce l'identità delle Persone: le richiama per riferimento stabile.
- **Tassonomia Condivisa** — per i Settori (SettoreImpresa referenzia una voce di tassonomia, non la definisce) e per ogni altra classificazione editoriale trasversale (temi, territori).
- **Mercati Internazionali** — per i Mercati che un'Impresa dichiara di servire o di voler servire (MercatoImpresa referenzia un Mercato, non lo definisce).
- **Territori** — per la localizzazione geografica delle Sedi.
- **Identità e Accessi** — per la nozione tecnica, non progettata in questo documento, di chi è autenticato e con quali poteri tecnici agisce; il dominio Imprese descrive solo il significato di business di queste facoltà (§7).

**Quali domini dipendono da esso.**
- **Opportunità & Collaborazioni** — referenziano l'Impresa come titolare pubblicante.
- **Eventi** — referenziano l'Impresa come organizzatore o partecipante.
- **Contenuti e Storie** — referenziano l'Impresa come soggetto delle StorieImpresa.
- **Osservatorio** — consuma, in forma aggregata e anonima quando necessario, dati derivati da Impresa, SettoreImpresa, MercatoImpresa.
- **Mercati Internazionali** — aggrega, per ciascun Mercato, le Imprese che vi dichiarano una presenza.
- **Formazione** — referenzia l'Impresa come fornitore o richiedente di percorsi formativi.
- **Professionisti** — dominio confermato autonomo (`logical/professionisti.md`); referenzia l'Impresa per il contesto organizzativo di un Professionista che opera anche attraverso una struttura, e per le collaborazioni professionali che coinvolgono l'Impresa.
- **Ricerca pubblica e moderazione** — funzioni trasversali che consumano lo stato di visibilità e di verifica definito in questo documento (§9, §8), senza appartenere esse stesse al dominio Imprese.

**Confini espliciti.**

| Dominio | Cosa fa il dominio Imprese | Cosa NON fa il dominio Imprese |
|---|---|---|
| Persone | Referenzia la Persona tramite AppartenenzaImpresa | Non contiene né duplica alcun dato personale |
| Identità e Accessi | Descrive il significato di business della gestione della scheda | Non definisce ruoli applicativi, permessi tecnici o meccanismi di autenticazione |
| Collaborazioni / Opportunità | È referenziata come titolare | Non contiene le collaborazioni o le opportunità stesse |
| Eventi | È referenziata come organizzatore/partecipante | Non gestisce iscrizioni, capienze o ruoli di partecipazione |
| Contenuti e Storie | È referenziata come soggetto narrato | Non possiede le StorieImpresa né il loro processo editoriale |
| Osservatorio | Fornisce dati derivati aggregabili | Non produce essa stessa report o statistiche |
| Mercati | Dichiara una relazione (MercatoImpresa) verso un Mercato | Non definisce i Mercati né i loro contenuti aggregati |
| Territori | Referenzia un Territorio per localizzare una Sede | Non definisce la geografia italiana |
| Formazione | È referenziata come fornitore/richiedente | Non gestisce corsi, qualifiche formative o richieste di formazione |
| Professionisti | È referenziata come contesto organizzativo di un Professionista, o come parte di una collaborazione professionale | Non possiede il profilo professionale, le qualifiche o le verifiche di un Professionista (`logical/professionisti.md`) |

---

## 2. Entità principali

### Impresa

**Responsabilità.** Rappresentare il soggetto economico: chi è, cosa fa, come si presenta, quanto è affidabile. È l'aggregate root del dominio, il nodo a cui tutte le altre entità di questo documento sono ancorate.

**Motivo dell'esistenza.** L'attività economica è uno dei due pilastri della piattaforma (insieme alla Persona) e precede, nella sua identità pubblica, qualunque singola relazione con le persone che la animano in un dato momento.

**Significato delle informazioni principali (non un elenco di campi tecnici).**
- *Denominazione* — il nome con cui l'impresa è conosciuta amministrativamente, non necessariamente quello con cui si presenta al pubblico.
- *Nome pubblico* — l'identificativo con cui l'impresa è mostrata e cercata sulla piattaforma; può coincidere con la denominazione o essere un nome commerciale/di marchio più riconoscibile.
- *Descrizione sintetica* — una presentazione breve, pensata per elenchi e risultati di ricerca.
- *Presentazione estesa* — il racconto più ampio di cosa fa l'impresa, del proprio percorso e del proprio valore, distinto dalle StorieImpresa editoriali (che restano un contenuto separato, §1).
- *Forma organizzativa* — la natura giuridico-economica del soggetto (impresa individuale, società, cooperativa, startup, attività professionale organizzata, impresa sociale, ente economico, attività commerciale o artigianale), descritta come proprietà informativa, non come vincolo che forza il modello verso una sola forma (§3, principio "impresa come soggetto economico" della Costituzione).
- *Stato operativo* — se l'attività economica è realmente in corso, sospesa o cessata: un fatto del mondo reale, distinto dallo stato editoriale della scheda (§5).
- *Anno di avvio* — da quando l'impresa opera, un dato di credibilità e di contesto storico.
- *Dimensione* — un'indicazione di scala (es. numero di persone coinvolte, per fasce), utile per networking e ricerca, non un dato contabile preciso.
- *Sito e canali pubblici* — i punti di contatto verso l'esterno, descritti in dettaglio come CanaleImpresa (§2, entità dedicata) quando è utile distinguerne la natura.
- *Immagine coordinata* — logo, colori, materiali visivi che identificano l'impresa, gestiti come MediaImpresa.
- *Livello di verifica* — quanto la piattaforma può confermare rispetto a ciò che l'impresa dichiara, modellato come asse multiplo e non come singolo indicatore (§8).
- *Stato di pubblicazione* — se e quanto la scheda è visibile pubblicamente, distinto sia dallo stato operativo sia dal livello di verifica (§5, §9).

**Relazioni principali.** Ha una o più AppartenenzaImpresa (Persone collegate); ha zero o più SedeImpresa, SettoreImpresa, ServizioImpresa, ProdottoImpresa, MercatoImpresa, LinguaOperativaImpresa, CertificazioneImpresa, CanaleImpresa, MediaImpresa (§4).

### AppartenenzaImpresa

**Responsabilità.** Rappresentare la relazione tra una Persona e un'Impresa: chi è, con quale ruolo, per quale periodo, con quale stato e quale visibilità.

**Nota di coerenza architetturale.** Questa entità non è un concetto nuovo rispetto a quanto già stabilito nel Domain Model (§"Appartenenza") e nel Logical Data Model del dominio Persone (che la cita come dominio esterno referenziato, mai posseduto). "AppartenenzaImpresa" descrive qui, dal punto di vista del dominio Imprese, il medesimo aggregato connettivo: non è posseduto in esclusiva né dall'Impresa né dalla Persona, ma è l'unico punto in cui i due mondi si incontrano con un proprio ciclo di vita (§6). Questo documento ne descrive la responsabilità di business ai fini del dominio Imprese, senza riaprire né duplicare la decisione già presa.

**Motivo dell'esistenza.** Rendere esplicito e storicizzabile "chi anima l'impresa", con quale titolo e per quanto tempo, permettendo a una Persona di avere più ruoli anche verso la stessa Impresa in periodi diversi, e a un'Impresa di esistere anche quando non tutte le Persone collegate hanno un profilo pubblico.

**Ruoli previsti (non esaustivi, estendibili).** Fondatore, titolare, socio, amministratore, legale rappresentante, dirigente, referente, dipendente, collaboratore, professionista esterno.

**Proprietà di significato.**
- *Ruolo* — la natura della relazione (uno dei ruoli sopra o un'estensione futura).
- *Responsabilità* — cosa quel ruolo comporta in termini di aspettative (es. un legale rappresentante ha una responsabilità formale che un referente operativo non ha).
- *Periodo* — da quando a quando (eventualmente ancora aperto) la relazione è valida.
- *Stato* — la fase del ciclo di vita della relazione stessa (§6).
- *Visibilità* — se e a chi la relazione è mostrata pubblicamente, indipendentemente dalla visibilità dell'Impresa o della Persona.
- *Autorizzazione a rappresentare o gestire l'impresa* — un attributo di significato di business (questa relazione dà, non dà, o dà solo in parte la facoltà di intervenire sulla scheda impresa), distinto e non equivalente alla rappresentanza legale reale (§7).

**Relazioni principali.** Referenzia esattamente una Persona (dominio esterno) e esattamente un'Impresa.

### SedeImpresa

**Responsabilità.** Rappresentare un luogo fisico o operativo in cui l'impresa è presente o opera.

**Motivo dell'esistenza.** Un'impresa reale opera quasi sempre in più luoghi con funzioni diverse (dove è registrata, dove produce, dove vende, dove riceve clienti): trattare la sede come un dato singolo impoverirebbe sia la ricerca per territorio sia la comprensione reale dell'attività.

**Tipologie previste (non esaustive).** Sede legale, sede operativa, punto vendita, laboratorio, stabilimento, magazzino, ufficio, sede secondaria.

**Proprietà di significato.** Tipologia della sede; localizzazione (riferimento a un Territorio, dominio esterno); eventuale ruolo di "sede principale" per quella tipologia, quando previsto dalle regole di dominio (§10); visibilità pubblica propria (§9).

**Relazioni principali.** Appartiene a esattamente un'Impresa (una sede non può appartenere a più imprese, §10); un'Impresa può avere più SedeImpresa.

### SettoreImpresa

**Responsabilità.** Rappresentare i settori economici in cui l'impresa opera.

**Motivo dell'esistenza.** Il settore è uno dei criteri di ricerca e di aggregazione più rilevanti per networking, Osservatorio e Mercati: deve essere una classificazione governata, non un'etichetta libera che ciascuna impresa scrive a modo proprio.

**Distinzioni previste.**
- *Settore principale* — l'attività economica prevalente, unica per impresa (§10).
- *Settori secondari* — altre attività effettivamente svolte, in numero libero.
- *Classificazione editoriale della piattaforma* — la tassonomia di settore governata da immigratiimprenditori.it, pensata per la navigazione e la ricerca sul sito.
- *Eventuale classificazione istituzionale esterna* — un riferimento a una classificazione economica ufficiale esterna (quando disponibile), utile per analisi comparabili con fonti terze, distinta dalla classificazione editoriale.

**Relazioni principali.** Ogni SettoreImpresa collega un'Impresa a una voce di settore (Tassonomia Condivisa, dominio esterno); un'Impresa ha esattamente un settore principale e zero o più settori secondari.

### ServizioImpresa

**Responsabilità.** Rappresentare un servizio offerto dall'impresa ai propri clienti, partner o al mercato in generale.

**Motivo dell'esistenza.** Rendere l'offerta dell'impresa concreta e consultabile, non genericamente dedotta dal settore.

**Proprietà di significato.** Nome del servizio; descrizione; destinatari (a chi è pensato: consumatori finali, altre imprese, pubblica amministrazione, ecc.); territorio servito; eventuali lingue disponibili per quel servizio (riferimento a LinguaOperativaImpresa, quando rilevante); stato di pubblicazione proprio, indipendente da quello dell'impresa (§9).

**Relazioni principali.** Appartiene a esattamente un'Impresa; un'Impresa può offrire più ServizioImpresa.

### ProdottoImpresa

**Responsabilità.** Rappresentare un prodotto o una categoria di prodotti offerti dall'impresa.

**Motivo dell'esistenza.** Dare visibilità concreta a cosa l'impresa produce o vende, come elemento informativo e commerciale — non come catalogo transazionale: il dominio Imprese non deve trasformarsi in un e-commerce (vendite, carrelli, pagamenti, logistica restano fuori perimetro).

**Proprietà di significato.** Nome; descrizione; eventuale categoria o raggruppamento (questione aperta sulla granularità, §12); stato di pubblicazione proprio.

**Relazioni principali.** Appartiene a esattamente un'Impresa; un'Impresa può presentare più ProdottoImpresa.

### MercatoImpresa

**Responsabilità.** Rappresentare la relazione tra un'Impresa e un Mercato: dove opera, dove vuole operare, cosa fa in quel mercato.

**Motivo dell'esistenza.** Il posizionamento internazionale è un pilastro dichiarato della piattaforma: un'impresa deve poter raccontare non solo "dove è", ma "dove lavora e dove vorrebbe lavorare".

**Distinzioni previste.** Ambito della presenza (locale, regionale, nazionale, europeo, internazionale); Paesi effettivamente serviti; natura della relazione (importazione, esportazione, interesse futuro non ancora attivo).

**Relazioni principali.** Referenzia esattamente un'Impresa e esattamente un Mercato (dominio esterno); un'Impresa può avere più MercatoImpresa, anche con nature diverse verso lo stesso Mercato (es. sia esportazione sia interesse futuro per un ampliamento).

### LinguaOperativaImpresa

**Responsabilità.** Rappresentare le lingue realmente utilizzabili nei rapporti con l'impresa, indipendentemente dalle lingue personali di ciascuna Persona collegata.

**Motivo dell'esistenza.** Un'impresa può offrire assistenza in una lingua anche se la persona che risponde in quel momento cambia nel tempo: la capacità linguistica è un attributo dell'organizzazione, non la somma casuale delle lingue di chi vi lavora in un dato istante. Duplicare semplicemente le LinguaParlata delle singole Persone collegate (dominio Persone) confonderebbe una dichiarazione personale con una capacità organizzativa stabile.

**Distinzioni previste.** Lingua commerciale (per vendite/trattative); lingua amministrativa (per pratiche e documenti); lingua del servizio clienti; lingua tecnica; lingua della formazione o sicurezza (quando l'impresa stessa forma il proprio personale o i propri interlocutori).

**Relazioni principali.** Referenzia esattamente un'Impresa e una voce della Tassonomia Lingua (dominio esterno, condiviso con il dominio Persone senza esserne posseduto); un'Impresa può avere più LinguaOperativaImpresa, anche più di una per lo stesso contesto d'uso.

### CertificazioneImpresa

**Responsabilità.** Rappresentare certificazioni, qualificazioni, iscrizioni e attestazioni dichiarate o riconosciute all'impresa.

**Motivo dell'esistenza.** La credibilità economica passa spesso da riconoscimenti verificabili (iscrizioni ad albi, certificazioni di qualità, qualificazioni settoriali): renderli strutturati, invece che testo libero nella presentazione, li rende ricercabili e verificabili nel tempo.

**Stati previsti.** Autodichiarata; verificata; scaduta; revocata; in verifica.

**Relazioni principali.** Appartiene a esattamente un'Impresa; un'Impresa può avere più CertificazioneImpresa.

### CanaleImpresa

**Responsabilità.** Rappresentare i canali attraverso cui l'impresa opera o comunica con l'esterno.

**Motivo dell'esistenza.** Un'impresa reale comunica e vende attraverso più canali contemporaneamente (sito proprio, marketplace, social, rete di vendita fisica): trattarli come un'unica lista di link impoverirebbe sia la presentazione sia l'analisi di come l'impresa raggiunge il mercato.

**Esempi di natura del canale.** Sito proprio; e-commerce; marketplace; social; telefono commerciale; punto vendita; rete distributiva.

**Relazioni principali.** Appartiene a esattamente un'Impresa; un'Impresa può avere più CanaleImpresa, anche di natura diversa.

### MediaImpresa

**Responsabilità.** Rappresentare il materiale visivo e documentale pubblico dell'impresa: logo, copertina, immagini, video, documenti pubblici.

**Motivo dell'esistenza.** L'identità visiva è parte della credibilità e della riconoscibilità di un'impresa quanto la sua descrizione testuale.

**Responsabilità e visibilità (senza dettagli tecnici di archiviazione).** Ogni elemento multimediale ha un responsabile logico (l'Impresa, tramite chi ha la facoltà di gestione, §7) e una propria visibilità, che può essere più restrittiva di quella della scheda nel suo complesso (es. un documento pubblico non ancora pronto per la pubblicazione, §9).

**Relazioni principali.** Appartiene a esattamente un'Impresa; un'Impresa può avere più MediaImpresa, con ruoli diversi (es. un solo logo "principale", più immagini secondarie).

---

## 3. Informazioni identificative e informazioni pubbliche

Non tutte le informazioni che il dominio Imprese conosce hanno lo stesso grado di visibilità o la stessa origine. Separarle chiaramente evita due errori opposti: pubblicare per default ciò che non dovrebbe esserlo, e trattare come "privato per sempre" ciò che invece è pensato per essere pubblicato non appena pronto.

| Categoria | Significato | Esempi nel dominio Imprese |
|---|---|---|
| Identità legale | Ciò che identifica il soggetto economico in modo formale | Denominazione, forma organizzativa |
| Dati amministrativi | Informazioni di gestione interna o di rapporto con la piattaforma, non pensate per la consultazione pubblica | Riferimenti amministrativi interni, dettagli non presentabili di una CertificazioneImpresa in attesa di verifica |
| Informazioni pubbliche | Ciò che la scheda mostra a chiunque, quando pubblicata | Nome pubblico, descrizione sintetica, presentazione estesa, Sedi pubbliche, Servizi e Prodotti pubblicati, Canali, Media pubblici |
| Informazioni riservate | Dati che l'impresa condivide con la piattaforma o con specifiche relazioni (es. una Persona con AppartenenzaImpresa attiva), ma non con il pubblico generico | Dettagli operativi non ancora pronti per la pubblicazione, note interne su un'AppartenenzaImpresa |
| Informazioni editoriali | Contenuti che richiedono una responsabilità di presentazione, non solo un dato grezzo | Presentazione estesa, StorieImpresa (dominio esterno che le referenzia) |
| Informazioni verificate | Ciò che la piattaforma ha potuto confermare secondo uno degli assi di verifica (§8) | Una CertificazioneImpresa verificata, un'AppartenenzaImpresa verificata |
| Informazioni autodichiarate | Ciò che l'impresa o la Persona collegata affermano senza che la piattaforma l'abbia (ancora) confermato | Una CertificazioneImpresa appena dichiarata, un ruolo dichiarato in un'AppartenenzaImpresa non ancora verificata |

**Principio.** Un dato può esistere nel dominio senza essere pubblico: l'esistenza di un'informazione (es. una sede appena censita, una certificazione appena dichiarata) è indipendente dalla sua visibilità pubblica, che è governata separatamente (§9). Questo vale anche per l'Impresa nel suo complesso (§4 del contesto, §5): essere censita non significa essere pubblicata.

---

## 4. Relazioni tra entità

| # | Relazione | Cardinalità (lato Impresa) | Cardinalità (lato altra entità) | Possibile dominio esterno coinvolto |
|---|---|---|---|---|
| R1 | Impresa — AppartenenzaImpresa | 1 Impresa → 0..N AppartenenzaImpresa | 1 AppartenenzaImpresa → esattamente 1 Impresa | Persona (dominio Persone, referenziata dall'altro lato dell'AppartenenzaImpresa) |
| R2 | Persona — AppartenenzaImpresa (indiretta, tramite l'aggregato connettivo) | — | 1 Persona → 0..N AppartenenzaImpresa (anche verso la stessa Impresa in periodi diversi) | Persone |
| R3 | Impresa — SedeImpresa | 1 Impresa → 0..N SedeImpresa | 1 SedeImpresa → esattamente 1 Impresa | — |
| R4 | Impresa — SettoreImpresa | 1 Impresa → 1 settore principale + 0..N settori secondari | 1 voce di settore → 0..N Imprese | Tassonomia Condivisa |
| R5 | Impresa — ServizioImpresa | 1 Impresa → 0..N ServizioImpresa | 1 ServizioImpresa → esattamente 1 Impresa | — |
| R6 | Impresa — ProdottoImpresa | 1 Impresa → 0..N ProdottoImpresa | 1 ProdottoImpresa → esattamente 1 Impresa | — |
| R7 | Impresa — MercatoImpresa | 1 Impresa → 0..N MercatoImpresa | 1 Mercato → 0..N Imprese | Mercati Internazionali |
| R8 | Impresa — LinguaOperativaImpresa | 1 Impresa → 0..N LinguaOperativaImpresa | 1 voce di lingua → 0..N Imprese | Tassonomia Condivisa (Lingua) |
| R9 | Impresa — CertificazioneImpresa | 1 Impresa → 0..N CertificazioneImpresa | 1 CertificazioneImpresa → esattamente 1 Impresa | — |
| R10 | Impresa — CanaleImpresa | 1 Impresa → 0..N CanaleImpresa | 1 CanaleImpresa → esattamente 1 Impresa | — |
| R11 | Impresa — MediaImpresa | 1 Impresa → 0..N MediaImpresa | 1 MediaImpresa → esattamente 1 Impresa | — |
| R12 | SedeImpresa — Territorio | 1 SedeImpresa → esattamente 1 Territorio | 1 Territorio → 0..N SedeImpresa | Territori |

**Note sulle relazioni che appartengono, in parte, a domini esterni.** R2 non è "posseduta" dall'Impresa: l'aggregato AppartenenzaImpresa referenzia sia l'Impresa sia la Persona senza appartenere esclusivamente a nessuna delle due (§2, §1). R4, R7, R8 e R12 collegano l'Impresa a voci di catalogo o entità che vivono in domini distinti (Tassonomia Condivisa, Mercati Internazionali, Territori): il dominio Imprese le referenzia, non le definisce né le governa.

**Relazione con i domini che dipendono da Imprese (non elencata sopra perché nella direzione opposta).** Opportunità, Eventi, StorieImpresa, richieste/offerte di Formazione referenziano l'Impresa come titolare/organizzatore/soggetto, ma questa relazione appartiene concettualmente ai domini dipendenti (§1, §14), non al dominio Imprese, che si limita a essere un riferimento stabile per essi.

---

## 5. Ciclo di vita dell'Impresa

Il ciclo di vita dell'Impresa non è un singolo stato, ma la combinazione coerente di **tre concetti distinti**, che non devono mai essere compressi in un unico valore:

**1. Stato reale dell'attività economica.** Descrive se l'impresa, nel mondo reale, è ancora in funzione. Valori logici: attiva, cessata (eventualmente con indicazione se per chiusura, fusione o trasformazione, §11). È un fatto, non un'opinione editoriale: non dipende da chi gestisce la scheda, ma da cosa è realmente accaduto all'impresa.

**2. Stato editoriale della scheda.** Descrive la fase redazionale della presentazione pubblica dell'impresa sulla piattaforma, indipendentemente dal fatto che l'impresa sia ancora attiva. Valori logici:
- *Bozza* — la scheda è stata creata ma non contiene ancora informazioni sufficienti per essere valutata.
- *Incompleta* — contiene alcune informazioni ma non raggiunge la qualità minima richiesta per la pubblicazione (§9).
- *In revisione* — è stata inviata per una valutazione editoriale o di moderazione, quando prevista.
- *Pubblica* — è visibile secondo le regole di visibilità (§9).
- *Sospesa* — è stata temporaneamente ritirata dalla visibilità pubblica, per scelta di chi la gestisce o per moderazione, in modo reversibile.
- *Archiviata* — non è più proposta attivamente, in modo tendenzialmente stabile (tipicamente collegata a un'impresa cessata, ma le due cose restano concettualmente distinte: un'impresa cessata può restare storicamente visibile in forma archiviata, §11).

**3. Stato di verifica.** Descrive quanto la piattaforma può confermare rispetto a ciò che l'impresa dichiara. Non è uno stato del ciclo di vita in senso stretto ma un asse che accompagna l'impresa in ogni fase editoriale: è trattato in dettaglio al §8, per evitare l'errore di un singolo badge "verificato/non verificato".

**Perché i tre concetti non vanno compressi in uno solo.** Un'impresa può essere realmente attiva ma con scheda ancora in bozza (appena censita); può essere editorialmente pubblica ma con verifica ancora assente (autodichiarata); può essere cessata ma mantenuta archiviata per rilevanza storica, senza mai essere stata "sospesa" nel senso editoriale. Trattare questi tre fatti come un'unica proprietà obbligherebbe a scegliere significati impropri per ogni combinazione reale.

---

## 6. Ciclo di vita delle appartenenze

L'AppartenenzaImpresa (§2) ha un proprio ciclo di vita, distinto sia da quello dell'Impresa sia da quello della Persona:

- *Proposta* — qualcuno (la Persona o l'Impresa, secondo le regole che il dominio Identità e Accessi definirà) ha dichiarato l'esistenza della relazione, ma non è ancora stata confermata dall'altra parte.
- *Da verificare* — la relazione è stata riconosciuta reciprocamente, o accettata secondo il processo previsto, ma non è ancora stata sottoposta o superata una verifica (§8).
- *Attiva* — la relazione è in corso e riconosciuta.
- *Conclusa* — la relazione è terminata in modo ordinario (fine del ruolo, uscita dall'impresa, chiusura dell'impresa), su iniziativa di una delle parti o per un fatto oggettivo.
- *Contestata* — una delle parti (o un terzo con titolo per farlo) ha messo in dubbio la validità della relazione dichiarata: es. una Persona dichiara un ruolo che l'Impresa non riconosce, o due Persone rivendicano lo stesso ruolo esclusivo.
- *Revocata* — la relazione è stata invalidata dalla piattaforma o da chi ne ha titolo, tipicamente a seguito di una contestazione risolta in tal senso.

**Chi può dichiarare una relazione.** Sia la Persona (dichiarando "lavoro per questa impresa" o "ho fondato questa impresa") sia l'Impresa, tramite chi ne ha già la facoltà di gestione (dichiarando "questa Persona fa parte della nostra impresa"), possono dare origine a una AppartenenzaImpresa. Il dominio Imprese non decide qui quale delle due dichiarazioni basti da sola a rendere la relazione Attiva senza passare da Da verificare: è un dettaglio di processo che appartiene, in parte, al dominio Identità e Accessi e resta una scelta implementativa successiva.

**Come emergono i conflitti.** Un conflitto nasce tipicamente quando la dichiarazione di una parte non trova conferma nell'altra (una Persona si dichiara titolare di un'impresa che non la riconosce), o quando due dichiarazioni sono reciprocamente incompatibili (due Persone rivendicano lo stesso ruolo esclusivo, es. "unico legale rappresentante", nello stesso periodo). In questi casi la relazione transita verso *Contestata*, uno stato pensato apposta per rendere visibile — internamente, non necessariamente al pubblico — che quella relazione richiede un intervento prima di poter essere considerata affidabile.

---

## 7. Proprietà, gestione e rappresentanza

Il dominio distingue esplicitamente ruoli che, nella pratica, spesso non coincidono nella stessa persona:

- *Proprietario economico* — chi detiene, in tutto o in parte, la titolarità economica dell'impresa (es. un socio).
- *Titolare* — chi guida operativamente l'impresa, che può coincidere o non coincidere col proprietario economico.
- *Legale rappresentante* — chi ha, secondo la forma giuridica dell'impresa, il potere formale di agire e impegnare l'impresa verso l'esterno.
- *Referente operativo* — chi, nella pratica quotidiana, è il punto di contatto per chi interagisce con l'impresa (clienti, partner, piattaforma), senza necessariamente avere un potere formale.
- *Gestore della scheda digitale* — chi ha, di fatto, la facoltà di modificare la presentazione dell'impresa sulla piattaforma.
- *Autore dei contenuti* — chi materialmente scrive o carica un contenuto (una presentazione, un servizio, un'immagine), che può differire da chi ne ha la responsabilità editoriale finale.

**Principio cardine.** La facoltà di modificare la scheda impresa (gestore della scheda digitale) **non prova automaticamente** la rappresentanza legale reale, né alcun altro dei ruoli sopra elencati. Il dominio Imprese registra che una Persona *può* gestire la scheda (tramite un'AppartenenzaImpresa con la relativa autorizzazione, §2), ma questo è un fatto operativo interno alla piattaforma, non un accertamento della posizione legale reale della Persona nell'impresa. Confondere i due piani porterebbe a un rischio concreto: trattare come "prova" quello che è solo un permesso concesso, con conseguenze su affidabilità e verifica (§8).

---

## 8. Verifica e affidabilità

Un singolo indicatore generico "verificato" nasconderebbe più di quanto chiarisce: un'impresa può avere una certificazione confermata ma nessuna relazione verificata con chi gestisce la scheda, o viceversa. Il dominio Imprese modella la verifica come **più assi indipendenti**, ciascuno con il proprio significato:

- *Non verificata* — nessun controllo è stato effettuato; è lo stato di default e non implica nulla di negativo, solo l'assenza di una conferma.
- *Autodichiarata* — un'informazione affermata dall'impresa o da una Persona collegata, senza (ancora) un controllo esterno. È uno stato legittimo, non una condizione d'errore: gran parte delle informazioni di una scheda impresa nasce così.
- *Identità verificata (della Persona collegata)* — riguarda la Persona coinvolta in un'AppartenenzaImpresa: la piattaforma ha potuto confermare che quella Persona è davvero chi dichiara di essere. È un asse che appartiene concettualmente anche al dominio Persone/Identità e Accessi, qui richiamato per il suo effetto sull'affidabilità dell'AppartenenzaImpresa.
- *Relazione con l'impresa verificata* — riguarda specificamente l'AppartenenzaImpresa: la piattaforma ha potuto confermare che quella Persona ha realmente il ruolo dichiarato in quell'impresa, non solo che la Persona esiste.
- *Dati aziendali verificati* — riguarda le informazioni proprie dell'Impresa (es. la denominazione, la forma organizzativa), confermate rispetto a una fonte attendibile.
- *Certificazione verificata* — riguarda una singola CertificazioneImpresa (§2), che può essere verificata indipendentemente dal resto della scheda.
- *Profilo sospetto o contestato* — uno stato trasversale, che può sovrapporsi a qualunque altro asse, per segnalare che qualcosa nella scheda richiede attenzione (es. un'AppartenenzaImpresa Contestata, §6, o un'informazione che appare in contraddizione con un'altra fonte).

**Perché nessun asse sostituisce gli altri.** Verificare l'identità di una Persona non significa verificare che il suo ruolo dichiarato in un'impresa sia vero; verificare un dato aziendale non significa verificare chi ha la facoltà di gestirlo; una singola certificazione verificata non "certifica" l'intera impresa. Mantenere gli assi separati permette alla piattaforma di comunicare con precisione cosa sa per certo e cosa no, invece di offrire una falsa sensazione di sicurezza con un singolo badge.

---

## 9. Visibilità e pubblicazione

**Principio generale.** L'esistenza di un'Impresa nel dominio non implica automaticamente la sua pubblicazione (principio 4 del contesto). Una scheda diventa pubblicamente visibile solo quando sono soddisfatte, insieme, condizioni di natura diversa:

1. *Stato editoriale compatibile* — la scheda deve trovarsi in uno stato editoriale che preveda la visibilità (tipicamente Pubblica, §5); Bozza, Incompleta, In revisione e Sospesa non sono pubblicamente visibili per definizione.
2. *Stato operativo compatibile* — un'impresa cessata non deve essere presentata come attiva (§10); resta possibile una visibilità di tipo diverso (storica/archiviata, §11) ma non una visibilità che simuli un'attività in corso.
3. *Assenza di archiviazione impropria* — una scheda archiviata non compare nei percorsi di scoperta ordinari (ricerca, elenchi), anche se può restare consultabile come riferimento storico.
4. *Qualità minima* — un insieme minimo di informazioni (a partire da un nome pubblico valido, §10) deve essere presente prima che la pubblicazione sia possibile.
5. *Presenza di un referente responsabile* — deve esistere almeno una Persona, tramite un'AppartenenzaImpresa con la relativa autorizzazione, responsabile della scheda; una scheda senza alcun referente non dovrebbe restare pubblicamente attiva senza controllo.
6. *Eventuale moderazione* — quando prevista, una valutazione di moderazione può bloccare o sospendere la pubblicazione indipendentemente dal soddisfacimento delle condizioni precedenti.

**Visibilità non è un concetto unico per l'intera scheda.** Ciascuna delle entità collegate all'Impresa ha una propria visibilità, che può essere più restrittiva (mai più permissiva) di quella dell'Impresa nel suo complesso:

| Entità | Può essere visibile solo se | Nota |
|---|---|---|
| Impresa | Le condizioni 1-6 sopra sono soddisfatte | È la condizione "cancello": nessuna entità collegata può essere pubblica se l'Impresa stessa non lo è |
| SedeImpresa | L'Impresa è pubblica e la singola sede è stata scelta come pubblicabile | Alcune sedi (es. un magazzino) possono restare non pubbliche anche a scheda pubblicata |
| AppartenenzaImpresa | L'Impresa è pubblica e la relazione stessa ha una visibilità pubblica (§2) | Una relazione può esistere ed essere Attiva senza essere mostrata pubblicamente |
| ServizioImpresa / ProdottoImpresa | L'Impresa è pubblica e il singolo elemento ha raggiunto il proprio stato di pubblicazione | Un servizio può restare in bozza mentre il resto della scheda è già pubblico |
| CertificazioneImpresa | L'Impresa è pubblica; lo stato della certificazione (§2) ne determina come viene presentata, non se è visibile in assoluto | Una certificazione scaduta o revocata non deve essere mostrata come valida (§10), ma può restare visibile con lo stato corretto |
| CanaleImpresa | L'Impresa è pubblica e il canale è stato scelto come pubblicabile | — |
| MediaImpresa | L'Impresa è pubblica e il singolo elemento multimediale è stato scelto come pubblico | Un documento riservato può coesistere con media pubblici |

---

## 10. Regole e invarianti di dominio

1. Un'Impresa pubblica deve avere un nome pubblico valido.
2. Un'Impresa cessata non deve essere presentata come attiva.
3. Una SedeImpresa non può appartenere a più di un'Impresa.
4. Può esistere una sola sede principale dello stesso tipo per Impresa, quando le regole di dominio prevedono l'unicità per quel tipo (es. una sola sede legale).
5. Il settore principale di un'Impresa deve essere unico in un dato momento.
6. Un'AppartenenzaImpresa Conclusa, Contestata o Revocata non deve essere mostrata come relazione attuale.
7. Una CertificazioneImpresa scaduta o revocata non deve essere mostrata come valida.
8. Una Persona non può attribuirsi unilateralmente una rappresentanza verificata: la verifica (§8) richiede una conferma che non dipende dalla sola dichiarazione della parte interessata.
9. I dati amministrativi o comunque non pubblici (§3) non diventano pubblici automaticamente per il solo fatto di esistere o di essere associati a una scheda pubblicata.
10. La cancellazione logica di un'Impresa o di un'AppartenenzaImpresa non deve distruggere la storia delle relazioni: un'Appartenenza Conclusa resta un fatto storico accertato, anche quando l'Impresa è archiviata o la relazione non è più mostrata come attuale.
11. Un'Impresa pubblica dovrebbe avere almeno un referente responsabile individuabile (§9, punto 5); l'assenza di qualunque referente è una condizione che richiede attenzione, non una configurazione stabile prevista.
12. Un elemento collegato (Sede, Servizio, Prodotto, Certificazione, Canale, Media) non pubblico non deve comparire nei percorsi di consultazione pubblica dell'Impresa, anche se l'Impresa stessa è pubblica (§9).
13. Uno stesso Territorio non implica un'unica SedeImpresa: più imprese, e più sedi della stessa impresa, possono condividere lo stesso Territorio.

---

## 11. Casi limite

**Impresa individuale senza dipendenti.** Il modello non presuppone alcun numero minimo di Persone collegate oltre a un referente responsabile (§9): un'AppartenenzaImpresa con ruolo di titolare, da sola, è una configurazione piena e legittima.

**Persona collegata a più imprese.** Previsto direttamente dalla cardinalità di AppartenenzaImpresa (§4, R2): una Persona può avere più relazioni, anche attive contemporaneamente, verso Imprese diverse.

**Impresa gestita da una Persona senza profilo pubblico.** L'esistenza e la gestione dell'Impresa non richiedono che la Persona collegata abbia un profilo pubblico nel dominio Persone (principio del contesto): l'AppartenenzaImpresa e la facoltà di gestione restano valide anche verso una Persona che ha scelto di non pubblicare il proprio profilo personale.

**Impresa cessata ma storicamente rilevante.** Lo stato operativo "cessata" (§5) non implica l'eliminazione della scheda: può restare visibile in forma archiviata (§5, §9) per il suo valore storico o narrativo, senza mai essere presentata come attiva (§10, regola 2).

**Attività con più marchi.** Un'Impresa può presentarsi con più nomi pubblici percepiti se opera con più marchi; il modello lascia aperta la scelta implementativa se questo richieda un'entità Marchio autonoma o resti una proprietà descrittiva dell'Impresa (§12).

**Società con più sedi e più settori.** Pienamente previsto: SedeImpresa e SettoreImpresa hanno entrambe cardinalità 0..N (settori secondari) rispetto all'Impresa (§4).

**Impresa estera con unità operativa in Italia.** Il modello non richiede che un'Impresa sia "nata" in Italia: una SedeImpresa operativa in territorio italiano è sufficiente a renderla pertinente per la piattaforma, mentre la sede legale può restare all'estero (implicazione per il dominio Territori: da chiarire se un Territorio possa restare "estero" per una singola sede, §12).

**Professionista con partita IVA.** La Persona che esercita la professione resta un Professionista secondo `logical/professionisti.md`, indipendentemente dalla partita IVA; se la sua attività è inoltre organizzata come soggetto economico autonomo (forma organizzativa "attività professionale organizzata", §2), quel soggetto economico è anche un'Impresa di questo dominio. I due fatti — essere Professionista ed essere titolare di un'Impresa — restano distinti e possono coesistere.

**Cooperativa.** Prevista esplicitamente tra le forme organizzative (§2); il modello non presuppone una struttura proprietaria a soci di capitale, coerente con il principio di non forzare tutto verso la società di capitali (contesto, principio 3).

**Impresa sociale.** Prevista esplicitamente tra le forme organizzative (§2); non richiede alcun trattamento speciale nel modello logico, salvo l'eventuale visibilità di questa natura come informazione pubblica.

**Impresa contestata da due soggetti.** Corrisponde allo stato Contestata di AppartenenzaImpresa (§6): due Persone possono rivendicare lo stesso ruolo esclusivo verso la stessa Impresa, e il modello prevede esplicitamente uno stato per rendere visibile questa condizione prima che venga risolta.

**Impresa senza sito.** Il modello non richiede alcun CanaleImpresa minimo: un'Impresa può esistere ed essere pubblicata anche senza alcun canale digitale, purché soddisfi i requisiti minimi di pubblicazione (§9, §10 regola 1).

**Impresa con dati incompleti.** Corrisponde allo stato editoriale "Incompleta" (§5): una condizione stabile e legittima, non un errore, in attesa che la qualità minima per la pubblicazione venga raggiunta.

**Impresa che importa ed esporta.** Prevista direttamente da MercatoImpresa (§2, §4): la stessa Impresa può avere più relazioni con più Mercati, di natura anche opposta (importazione verso un Mercato, esportazione verso un altro, o entrambe verso lo stesso).

**Attività che cambia denominazione.** Il modello distingue denominazione e nome pubblico (§2): un cambio di denominazione è un aggiornamento del dato descrittivo dell'Impresa, che mantiene la propria identità e la propria storia (relazioni, certificazioni, sedi) invariata.

**Fusione, cessione o trasformazione societaria.** Il modello logico registra questi eventi come transizioni dello stato operativo (§5) e, quando rilevante, come nuove AppartenenzaImpresa o nuove Imprese collegate da un riferimento storico; la scelta implementativa precisa di come rappresentare la continuità (stessa Impresa evoluta vs. nuova Impresa con riferimento alla precedente) resta una domanda aperta (§12).

---

## 12. Domande aperte

Le seguenti decisioni richiedono una scelta progettuale futura e non vengono forzate da questo documento:

- Le ditte individuali devono essere trattate esattamente come le altre imprese, o meritano una presentazione differenziata?
- I marchi (quando un'impresa opera con più marchi) devono diventare un'entità autonoma o restare una proprietà descrittiva dell'Impresa?
- I ProdottoImpresa devono essere singoli elementi o devono poter essere raggruppati in categorie proprie?
- I dati fiscali dell'impresa devono essere memorizzati come informazione propria del dominio, o solo verificati contro una fonte esterna senza essere conservati?
- Chi può legittimamente rivendicare (ossia dichiarare per la prima volta la gestione di) una scheda impresa già esistente ma non ancora collegata a nessuna Persona?
- Quali livelli di verifica tra quelli descritti al §8 saranno realmente implementati, e in quale ordine di priorità?
- Le sedi estere di un'impresa italiana, o le unità operative italiane di un'impresa estera, devono essere gestite con le stesse regole delle sedi italiane?
- Come rappresentare in modo stabile cessazioni, fusioni e trasformazioni societarie, mantenendo la continuità storica delle relazioni (§11)?
- Quali informazioni tra quelle descritte in questo documento alimenteranno effettivamente l'Osservatorio, e con quale livello di aggregazione o anonimizzazione?

---

## 13. Eventi di dominio

Gli eventi di dominio descrivono fatti di business significativi accaduti nel dominio Imprese, che altri domini (Notifiche, Ricerca, Osservatorio, moderazione) possono voler conoscere senza dover interrogare direttamente lo stato interno del dominio Imprese.

- **ImpresaCreata** — un nuovo soggetto economico è stato censito sulla piattaforma.
- **ProfiloImpresaCompletato** — la scheda ha raggiunto la qualità minima necessaria per poter essere valutata per la pubblicazione.
- **ImpresaInviataInRevisione** — la scheda è stata sottoposta a valutazione editoriale o di moderazione.
- **ImpresaPubblicata** — la scheda è diventata visibile pubblicamente per la prima volta o dopo una sospensione.
- **ImpresaSospesa** — la scheda è stata temporaneamente ritirata dalla visibilità pubblica.
- **ImpresaArchiviata** — la scheda è stata ritirata dai percorsi di scoperta ordinari, tipicamente per cessazione dell'attività o per scelta editoriale stabile.
- **AppartenenzaDichiarata** — una relazione tra una Persona e un'Impresa è stata dichiarata da una delle due parti.
- **AppartenenzaVerificata** — una relazione dichiarata è stata confermata secondo uno dei processi di verifica previsti (§8).
- **AppartenenzaContestata** — una relazione dichiarata è stata messa in dubbio da una delle parti o da un terzo con titolo per farlo.
- **SedeAggiunta** — una nuova sede è stata collegata all'impresa.
- **SettorePrincipaleModificato** — il settore economico prevalente dichiarato dall'impresa è cambiato.
- **CertificazioneAggiunta** — una nuova certificazione, qualificazione o attestazione è stata dichiarata per l'impresa.
- **CertificazioneVerificata** — una certificazione dichiarata è stata confermata.
- **CertificazioneScaduta** — una certificazione ha superato il proprio periodo di validità ed è divenuta non più presentabile come valida (§10, regola 7).

---

## 14. Dipendenze con i futuri domini

- **Collaborazioni** — referenzierà l'Impresa come parte che cerca o offre una collaborazione (partnership, fornitura, distribuzione, personale, investimento). La collaborazione stessa, con il proprio ciclo di vita e le proprie regole, non è incorporata nell'entità Impresa: appartiene interamente al dominio Collaborazioni, che tiene l'Impresa solo come riferimento.
- **Opportunità** — referenzierà l'Impresa come titolare pubblicante di un'opportunità, con lo stesso principio: l'opportunità non è un attributo dell'Impresa, ma un contenuto autonomo che la richiama.
- **Eventi** — referenzierà l'Impresa come organizzatore, sponsor o partecipante; la partecipazione a un evento non è modellata in questo documento e resta di competenza del dominio Eventi.
- **Professionisti** — dominio confermato autonomo (`logical/professionisti.md`); referenzierà l'Impresa nelle collaborazioni professionali che coinvolgono professionisti esterni all'impresa stessa, e come contesto organizzativo di un Professionista che opera anche attraverso una struttura.
- **Formazione** — referenzierà l'Impresa sia come fornitore (nel ruolo già previsto altrove nella piattaforma) sia come richiedente di percorsi formativi per il proprio personale.
- **Mercati** — aggregherà, per ciascun Mercato, le Imprese che dichiarano una relazione MercatoImpresa (§2) verso di esso, per costruire la vista "chi opera in questo Mercato".
- **Storie di impresa** — il dominio Contenuti e Storie referenzierà l'Impresa come soggetto raccontato; la Storia non è un campo descrittivo dell'Impresa, ma un contenuto editoriale a se stante, con un proprio processo e una propria visibilità.
- **Osservatorio** — consumerà dati derivati da Impresa, SettoreImpresa e MercatoImpresa per produrre report e statistiche aggregate, senza mai diventarne fonte primaria né titolare.
- **Ricerca pubblica** — utilizzerà lo stato di visibilità (§9) e le classificazioni (SettoreImpresa, MercatoImpresa, LinguaOperativaImpresa) per rendere l'Impresa trovabile secondo i criteri rilevanti per chi cerca.
- **Moderazione** — interverrà sullo stato editoriale (§5) e sugli assi di verifica (§8) secondo processi che restano di competenza di un dominio trasversale, non descritto in dettaglio qui.

**Principio ribadito.** Le collaborazioni cercate o offerte da un'Impresa non devono essere incorporate direttamente nell'entità Impresa: restano contenuti autonomi del dominio Opportunità & Collaborazioni, che referenziano l'Impresa senza farne parte.

---

## 15. Decisioni finali del modello

- Persona e Impresa sono entità distinte: il dominio Imprese non contiene né duplica alcun dato personale.
- La relazione Persona–Impresa (AppartenenzaImpresa) è un aggregato autonomo, non posseduto in esclusiva né dalla Persona né dall'Impresa, coerente con quanto già stabilito nel Domain Model.
- Stato operativo, stato editoriale e stato di verifica sono concetti distinti e non vanno compressi in un'unica proprietà (§5, §8).
- Un'Impresa può avere più sedi, settori (un principale e più secondari), servizi, prodotti, mercati, lingue operative, certificazioni, canali e contenuti multimediali (§2, §4).
- La pubblicazione della scheda impresa non deriva automaticamente dalla sua esistenza: richiede condizioni esplicite di qualità, stato e responsabilità (§9).
- Le informazioni pubbliche sono distinte dalle informazioni amministrative, riservate, editoriali, verificate e autodichiarate (§3); un dato può esistere senza essere pubblico.
- Collaborazioni e Opportunità restano domini autonomi che referenziano l'Impresa, senza essere incorporati nella sua entità (§1, §14).
- Il modello è pensato sia per il networking diretto (trovare, contattare, valutare un'impresa) sia per l'analisi aggregata (Osservatorio, Mercati), senza che l'uno comprometta l'altro.
- Il confine con il dominio Professionisti, in sospeso al momento della scrittura di questo documento, è stato risolto da `logical/professionisti.md`: un professionista individuale è una Persona che assume quel ruolo, distinta dall'eventuale Impresa di cui è titolare (§1, §11).
- Diverse domande di dettaglio (forma di trattamento delle ditte individuali, granularità dei prodotti, rappresentazione delle trasformazioni societarie, tra le altre) restano volutamente aperte (§12) e non vengono anticipate né forzate da questo documento.

