# Domain Model — ImmigratiImprenditori.it

> Modello concettuale di dominio (Domain-Driven Design). Nessun riferimento a database, tabelle, SQL, indici o API.
> Fondamento: [`docs/costituzione-piattaforma.md`](./costituzione-piattaforma.md). Ogni scelta qui contenuta è coerente con quel documento e non lo sostituisce.
> Destinatari: chiunque debba progettare database, API, frontend, permessi, ricerca o notifiche per la piattaforma.

---

## Come leggere questo documento

Il modello è organizzato per **domini** (in senso DDD: aree di responsabilità con un proprio linguaggio, non moduli tecnici). Ogni dominio ha confini, entità, e relazioni verso gli altri domini. Alcuni domini sono **core** (differenzianti, cuore del vantaggio competitivo descritto nella Costituzione), altri sono **di supporto** (necessari ma non differenzianti), altri sono **generici** (soluzioni note, riusabili, non specifiche di questa piattaforma).

Un principio attraversa tutto il documento, derivato direttamente dai Principi della Costituzione: **nessun dominio possiede in esclusiva un contenuto trasversale**. Settori, mercati, lingue, territori, competenze e temi vivono in un vocabolario condiviso (§9) a cui ogni dominio si collega per riferimento, non per duplicazione.

---

## 1. Mappa dei domini principali

| Dominio | Tipo | Responsabilità | Confini (cosa NON fa) |
|---|---|---|---|
| **Persona** | Core | Rappresentare in modo continuativo l'identità professionale e personale di un utente: chi è, cosa sa fare, quali lingue usa, quale percorso ha fatto. | Non gestisce le imprese in cui la persona opera (le referenzia tramite Appartenenza); non gestisce direttamente contenuti come opportunità o eventi (li referenzia come autore/titolare). |
| **Impresa & Organizzazioni** | Core | Rappresentare l'entità collettiva — economica (impresa) o non economica (associazione, ente, istituzione) — come strumento della/e persona/e che la animano. | Non possiede le persone che ne fanno parte; non decide da sola la propria "credibilità" (che deriva da relazioni, verifiche dichiarate, storia). |
| **Appartenenza** (Membership) | Core (connettivo) | Rappresentare la relazione nel tempo tra una Persona e un'Impresa/Organizzazione: ruolo, periodo, stato. | Non contiene i dati descrittivi né della persona né dell'impresa: è pura relazione con un proprio ciclo di vita. |
| **Opportunità & Collaborazioni** | Core | Far incontrare domanda e offerta: richieste e offerte di collaborazione, fornitura, personale, clienti, investimento, immobili, bandi. | Non gestisce l'esecuzione della collaborazione una volta avviata (fuori piattaforma, salvo evoluzioni future); non è un sistema di pagamento. |
| **Mercati Internazionali** | Core | Rappresentare ogni Paese/area economica come ecosistema navigabile e aggregare tutto ciò che lo riguarda. | Non duplica i contenuti di altri domini: aggrega per riferimento (persone, imprese, opportunità, eventi, servizi già esistenti altrove). |
| **Servizi** | Core | Rappresentare l'offerta e la domanda di servizi verticali che accompagnano la crescita: professionisti, formazione e sicurezza, servizi linguistici e interculturali, servizi finanziari, immobiliare, altri servizi utili. | Non è un dominio unico indifferenziato: si compone di sotto-domini verticali (§2) ciascuno con proprie regole, unificati da un linguaggio comune (Offerta/Richiesta di Servizio). |
| **Eventi** | Supporto | Rappresentare momenti di aggregazione nel tempo (conferenze, fiere, missioni, webinar) e la partecipazione ad essi. | Non gestisce contenuti editoriali permanenti (li referenzia); non è un dominio di vendita di biglietti (in questa fase). |
| **Contenuti Editoriali** | Supporto | Rappresentare notizie, guide e storie: contenuto informativo e narrativo, non transazionale. | Non gestisce le entità di cui parla (persone, mercati, settori): le referenzia. |
| **Partnership** | Supporto | Rappresentare l'accordo tra la piattaforma e un soggetto esterno (associazione, università, banca, assicurazione, agenzia immobiliare, ente pubblico, istituzione). | Non è la stessa cosa del profilo dell'organizzazione: un'organizzazione può avere un profilo senza essere un Partner formale, e viceversa in fase di trattativa. |
| **Osservatorio** | Supporto | Aggregare dati provenienti da altri domini (mercati, settori, imprese) in report e statistiche leggibili. | Non è fonte primaria di dati: consuma e sintetizza, non genera fatti economici. |
| **Tassonomia Condivisa** | Generico (Shared Kernel) | Fornire il vocabolario comune e stabile a cui tutti i domini si collegano: lingue, settori, competenze, temi, professioni/categorie di servizio, territori. | Non contiene logica di business specifica di un dominio: è puro catalogo di riferimento, a governance centrale. |
| **Ricerca** | Generico | Permettere di trovare qualsiasi contenuto attraverso combinazioni di tag trasversali e testo libero. | Non decide le regole di visibilità (le eredita dagli altri domini e dai permessi). |
| **Notifiche** | Generico | Informare un utente di un evento rilevante accaduto altrove nella piattaforma. | Non genera i fatti: reagisce a essi. |
| **Identità & Accessi** | Generico | Autenticare l'utente e definire cosa può fare. | Non è un dominio di business: è infrastruttura abilitante, trattata solo a livello concettuale nel §13. |

**Relazioni di primo livello.** Persona è il dominio a cui tutti gli altri si collegano come "autore", "titolare" o "partecipante". Impresa & Organizzazioni esiste solo attraverso Appartenenza a una o più Persone. Opportunità, Servizi ed Eventi sono sempre pubblicati da una Persona o da un'Impresa/Organizzazione. Mercati Internazionali è trasversale: si sovrappone a Persona, Impresa, Opportunità e Servizi senza contenerli. Tassonomia Condivisa è il tessuto connettivo silenzioso che rende possibile la Ricerca e le relazioni tra contenuti senza duplicazioni (Principio 3 della Costituzione).

---

## 2. Sottodomini

**Impresa & Organizzazioni**
- Impresa (soggetto a scopo economico: azienda, cooperativa, studio professionale, attività economica)
- Organizzazione Istituzionale (soggetto senza scopo economico primario: associazione, ente, istituzione, ambasciata, camera di commercio, fondazione)

**Opportunità & Collaborazioni**
- Collaborazioni dirette (partnership, fornitura, clienti, distribuzione, personale, investimento)
- Immobiliare come opportunità (annunci di compravendita/affitto/investimento — quando non gestito come servizio verticale strutturato, si presenta qui come tipo di opportunità)
- Bandi e finanziamenti (opportunità a iniziativa di un ente pubblico o istituzione, con caratteristiche proprie: scadenza, requisiti)

**Mercati Internazionali**
- Mercato (scheda del Paese/area)
- Presenza di Mercato (relazione tra Persona/Impresa e Mercato)
- Osservatorio di Mercato (statistiche e report specifici — condiviso con il dominio Osservatorio generale)

**Servizi** (sotto-domini verticali, ciascuno specializzazione di un linguaggio comune "Offerta/Richiesta di Servizio")
- Servizi Professionali generici (consulenza, digitalizzazione, recruiting, export)
- Formazione e Sicurezza sul Lavoro (multilingue)
- Servizi Linguistici e Interculturali (traduzione, interpretariato, mediazione)
- Servizi Finanziari (banche, assicurazioni, mutui, investimenti)
- Immobiliare (casa, immobili commerciali/industriali, investimento immobiliare)
- Utility e altri servizi (energia, altri servizi utili non ancora tipizzati)

**Contenuti Editoriali**
- Notizie (attualità)
- Guide (approfondimenti pratici/normativi)
- Storie (racconti personali — concettualmente "appartengono" alla Persona ma sono classificati e distribuiti come contenuto editoriale)

**Partnership**
- Partner istituzionali (associazioni, università, enti pubblici, ambasciate)
- Partner commerciali (banche, assicurazioni, agenzie immobiliari, imprese fornitrici di servizi B2B)

**Tassonomia Condivisa**
- Lingue
- Settori economici
- Competenze
- Temi editoriali
- Professioni / categorie di servizio
- Territori (geografia italiana: città, provincia, regione; distinta dai Mercati, che sono internazionali)

---

## 3. Entità principali per dominio

### Persona
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Persona** | L'individuo che utilizza la piattaforma: identità, presentazione, localizzazione, contatti. | Mantenere l'identità professionale/personale coerente nel tempo, indipendentemente dalle imprese a cui è o è stata collegata. |
| **CompetenzaDichiarata** | Una competenza che la persona dichiara di possedere, con eventuale livello. | Rendere la persona trovabile per competenza; è dichiarata, non verificata (salvo evoluzione futura). |
| **LinguaParlata** | Una lingua che la persona utilizza, con eventuale contesto d'uso (personale/professionale). | Rendere la persona trovabile per lingua; base per i Servizi Linguistici. |
| **StoriaPersonale** | Un racconto in prima persona del proprio percorso. | Dare voce e credibilità narrativa alla persona; è anche un Contenuto Editoriale (§9 su come evitare duplicazioni). |

### Impresa & Organizzazioni
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Impresa** | Il soggetto economico: nome, settore/i, mercati di riferimento, storia, dati pubblici non sensibili. | Rappresentare l'attività economica come strumento, mai come fine; essere il punto di aggregazione per opportunità e servizi pubblicati "a nome dell'impresa". |
| **OrganizzazioneIstituzionale** | Il soggetto non economico: associazione, ente, istituzione, ambasciata, camera di commercio. | Rappresentare soggetti che generano credibilità, contenuti e partnership più che transazioni economiche dirette. |

### Appartenenza
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Appartenenza** | Il legame tra una Persona e un'Impresa/Organizzazione, con un ruolo (titolare, dipendente, collaboratore, consulente, rappresentante) e un periodo. | Rendere esplicito e storicizzabile "chi anima cosa", permettendo a una persona di avere più ruoli in più imprese nel tempo, anche in successione. |

### Opportunità & Collaborazioni
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Opportunità** | Una richiesta o un'offerta pubblicata: collaborazione, fornitura, personale, cliente, investimento, immobile, bando. | Rendere visibile e cercabile un bisogno o una disponibilità concreta, con un ciclo di vita proprio (§8). |
| **ManifestazioneDiInteresse** | La candidatura/il contatto di una Persona o Impresa verso un'Opportunità. | Collegare chi risponde a un'Opportunità, mantenendo lo storico delle risposte senza alterare l'Opportunità stessa. |

### Mercati Internazionali
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Mercato** | Un Paese o un'area economica trattata come ecosistema: nome, area geografica, lingue prevalenti, note operative. | Essere il punto di aggregazione trasversale per tutto ciò che riguarda quel Paese/area, senza contenere direttamente i contenuti altrui. |
| **PresenzaDiMercato** | La relazione dichiarata tra una Persona/Impresa e un Mercato (es. "esporta verso", "ha sede in", "cerca partner in"). | Qualificare la natura della relazione con il mercato, non solo la sua esistenza. |

### Servizi
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **OffertaDiServizio** | Concetto generico: un servizio offerto da una Persona/Impresa in una delle categorie verticali. Si specializza in: OffertaLinguistica, OffertaFormativa, OffertaProfessionaleGenerica, OffertaFinanziaria, OffertaImmobiliare. | Rendere trovabile e comparabile un servizio disponibile, con attributi comuni (titolare, descrizione, stato) e attributi specifici per verticale. |
| **RichiestaDiServizio** | Concetto generico: un bisogno di servizio pubblicato da una Persona/Impresa. Si specializza analogamente all'offerta (es. RichiestaFormativa). | Rendere visibile una domanda concreta di servizio, indipendente da chi potrà risponderle. |
| **QualificaDichiarata** | Una qualifica o certificazione che un fornitore di servizio dichiara di possedere (es. per erogare formazione sulla sicurezza). | Distinguere sempre ciò che è dichiarato da ciò che è verificato (Valore 6 della Costituzione). |

### Eventi
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Evento** | Un momento di aggregazione: conferenza, fiera, missione commerciale, webinar. | Organizzare la partecipazione nel tempo e nello spazio (fisico o digitale), collegabile a settori/mercati/temi. |
| **Partecipazione** | Il legame tra una Persona/Impresa e un Evento (iscritto, relatore, organizzatore, sponsor). | Qualificare il ruolo di ciascun partecipante, non solo la presenza. |

### Contenuti Editoriali
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Notizia** | Contenuto di attualità. | Informare, generare traffico e fiducia (Strategia di crescita, punto 3). |
| **Guida** | Contenuto di approfondimento pratico/normativo. | Accompagnare una decisione concreta dell'utente (es. come aprire un'impresa in un settore). |
| **ContenutoDiMercato** | Guida o report specifico di un Mercato. | Specializzazione di Guida/Notizia legata strutturalmente a un Mercato. |

### Partnership
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **Partner** | L'accordo formale tra la piattaforma e un'Organizzazione/Impresa esterna. | Qualificare la relazione business-to-platform (tipo di accordo, ambito, durata), distinta dal semplice profilo pubblico dell'organizzazione. |

### Osservatorio
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **ReportOsservatorio** | Un contenuto statistico/analitico su un settore, mercato o fenomeno. | Sintetizzare dati aggregati provenienti da altri domini in un formato leggibile, senza diventare fonte primaria. |

### Tassonomia Condivisa
| Entità | Descrizione | Responsabilità |
|---|---|---|
| **VoceDiTassonomia** | Concetto generico: una voce di catalogo (lingua, settore, competenza, tema, professione, territorio). | Fornire un riferimento stabile, univoco e riusabile a cui ogni altro dominio si collega, evitando duplicazioni testuali libere. |

---

## 4. Value Object principali

A differenza delle entità, i Value Object non hanno identità propria: sono definiti interamente dai loro attributi e sono intercambiabili se gli attributi coincidono.

| Value Object | Composizione concettuale | Dove si usa |
|---|---|---|
| **Indirizzo/Localizzazione** | Città, provincia, regione, paese, eventuale indicazione di zona. | Persona, Impresa, Evento (sede fisica), OffertaImmobiliare. |
| **Contatto** | Telefono, email, sito web, canali social. | Persona, Impresa, Organizzazione, Partner. |
| **PeriodoDiValidità** | Data di inizio, data di fine (eventualmente aperta). | Appartenenza, Partecipazione, Partner, QualificaDichiarata. |
| **CompetenzaConLivello** | Riferimento a una Competenza (Tassonomia) + livello dichiarato. | CompetenzaDichiarata della Persona. |
| **DirezioneLinguistica** | Lingua di partenza, lingua di destinazione, direzione (mono/bidirezionale). | OffertaLinguistica. |
| **FasciaPartecipanti** | Numero minimo e massimo di partecipanti previsti. | OffertaFormativa, Evento. |
| **RiferimentoDiMercato** | Identificativo del Mercato + eventuale ruolo della relazione (esporta, ha sede, cerca partner). | PresenzaDiMercato, tag su Opportunità/Servizi/Eventi. |
| **RiferimentoTassonomico** | Identificativo stabile di una voce di Tassonomia Condivisa (settore, lingua, tema, territorio, professione) + etichetta leggibile. | Usato da praticamente ogni entità come "tag" (§9). |

**Nota concettuale.** Alcuni concetti (Lingua, Settore, Mercato) sono *entità con identità propria* all'interno del loro dominio di origine (Tassonomia Condivisa, Mercati Internazionali), ma quando vengono *referenziati* da un'altra entità (es. una Persona che dichiara una lingua, un'Opportunità taggata con un settore) si comportano come Value Object dal punto di vista di chi li referenzia: non vengono copiati né duplicati, ma richiamati per riferimento stabile più un'etichetta leggibile.

---

## 5. Aggregati

Un Aggregate Root è l'unico punto di accesso e di garanzia di consistenza per un gruppo di dati che devono cambiare insieme. Di seguito gli aggregate root principali e la motivazione della scelta dei confini.

| Aggregate Root | Cosa racchiude | Perché è un aggregato a sé |
|---|---|---|
| **Persona** | Dati identificativi, competenze dichiarate, lingue parlate, storie personali. | Le competenze e le lingue non hanno senso indipendentemente dalla persona che le dichiara; devono restare consistenti con essa (es. rimozione di una lingua non deve lasciare riferimenti orfani "a metà"). |
| **Impresa / OrganizzazioneIstituzionale** | Dati descrittivi propri, settori/mercati dichiarati come proprietà dell'impresa. | L'impresa deve poter cambiare i propri dati descrittivi in modo indipendente dalle persone che vi appartengono: separare l'aggregato evita che una modifica ai ruoli blocchi o comprometta la scheda impresa. |
| **Appartenenza** | Persona referenziata, Impresa/Organizzazione referenziata, ruolo, periodo, stato. | Ha un ciclo di vita e delle regole proprie (es. una persona può avere più ruoli attivi contemporaneamente, ma non due ruoli identici sovrapposti nello stesso periodo): non deve appesantire né Persona né Impresa con questa logica. |
| **Opportunità** | Dati della richiesta/offerta, stato, e le ManifestazioniDiInteresse ricevute. | Le manifestazioni di interesse devono essere sempre consistenti con lo stato dell'opportunità (es. non si può manifestare interesse su un'opportunità chiusa): la regola vive naturalmente dentro lo stesso confine. |
| **Mercato** | Scheda del mercato e propri contenuti editoriali dedicati. | Il Mercato è governance centrale (di piattaforma, non di un singolo utente): deve restare un aggregato indipendente da chi vi si collega, altrimenti ogni nuova presenza di mercato richiederebbe di "toccare" il mercato stesso. |
| **PresenzaDiMercato** | Riferimento a Persona/Impresa, riferimento a Mercato, ruolo della relazione. | È una relazione con proprie regole (es. una stessa coppia Persona/Impresa–Mercato non deve duplicarsi), analoga concettualmente ad Appartenenza ma verso un mercato invece che verso un'impresa. |
| **OffertaDiServizio** (e specializzazioni) | Dati del servizio offerto, attributi specifici del verticale, qualifiche dichiarate collegate. | Ogni verticale (linguistico, formativo, immobiliare...) ha regole di validità proprie (es. una lingua non può ripetersi due volte nella stessa offerta linguistica) che devono restare incapsulate nella singola offerta. |
| **RichiestaDiServizio** (e specializzazioni) | Dati della richiesta, stato, eventuali gruppi/dettagli specifici del verticale. | Simmetrico a OffertaDiServizio: la richiesta ha un proprio ciclo di vita (pubblicata → assegnata → conclusa) indipendente dalle offerte esistenti. |
| **Evento** | Dati dell'evento e le Partecipazioni ricevute. | Come per Opportunità/ManifestazioneDiInteresse: la partecipazione deve restare sempre consistente con lo stato e la capienza dell'evento. |
| **ContenutoEditoriale** (Notizia, Guida, ContenutoDiMercato) | Testo, stato editoriale, tag trasversali associati. | Ha un proprio flusso di redazione/pubblicazione indipendente da qualsiasi altro dominio che referenzia. |
| **Partner** | Dati dell'accordo, riferimento all'Organizzazione/Impresa esterna. | L'accordo di partnership ha un ciclo di vita gestito dalla piattaforma stessa (trattativa, attivo, sospeso), distinto dal profilo pubblico dell'organizzazione. |
| **VoceDiTassonomia** | Etichetta, descrizione, stato attivo. | Governance centrale: nessun altro dominio deve poter modificare una voce di tassonomia semplicemente referenziandola. |

**Regola comune.** Un aggregato referenzia altri aggregati solo per identità (mai includendoli per intero). Questo è ciò che permette a Persona, Impresa, Opportunità, Mercato e Servizi di evolvere indipendentemente pur restando coerenti tra loro — esattamente il principio 4 della Costituzione ("le relazioni valgono quanto gli oggetti"): le relazioni (Appartenenza, PresenzaDiMercato, ManifestazioneDiInteresse, Partecipazione) sono infatti aggregati di prima classe, non semplici collegamenti impliciti.

---

## 6. Ownership — chi possiede cosa

- **Una Persona possiede:** il proprio profilo, le proprie competenze dichiarate, le proprie lingue, le proprie storie personali, le opportunità/servizi/contenuti che pubblica in prima persona, le proprie partecipazioni a eventi. *Non possiede* le imprese a cui appartiene: ne è parte tramite Appartenenza.
- **Un'Impresa/Organizzazione possiede:** la propria scheda descrittiva, i settori e i mercati che dichiara, le opportunità e i servizi pubblicati a proprio nome. *Non possiede* le persone che vi appartengono: sono le persone a possedere la relazione (Appartenenza), l'impresa la referenzia.
- **Un'Opportunità appartiene a:** un singolo titolare pubblicante, che è sempre una Persona o un'Impresa/Organizzazione — anche quando una persona pubblica "per conto" di un'impresa, il titolare formale resta uno solo, determinato dal ruolo attivo della persona in quel momento.
- **Un Evento appartiene a:** il suo organizzatore, che può essere una Persona, un'Impresa o un'Organizzazione/Partner.
- **Un'OffertaDiServizio/RichiestaDiServizio appartiene a:** la Persona o Impresa che la pubblica, esattamente come un'Opportunità.
- **Un Mercato non appartiene a nessun utente:** è governance centrale di piattaforma. Le Persone/Imprese si collegano ad esso tramite PresenzaDiMercato, ma non lo "possiedono" né lo controllano.
- **Le VociDiTassonomia (lingue, settori, competenze, temi, professioni, territori) non appartengono a nessun utente:** sono catalogo centrale, gestito dalla piattaforma stessa, mai dall'utente finale.
- **Un ContenutoEditoriale appartiene a:** il suo autore, che può essere la redazione della piattaforma, una Persona (storia personale) o un'Organizzazione/Partner (contenuto a proprio nome).
- **Un Partner (l'accordo) appartiene a:** la piattaforma stessa come controparte, con un'Organizzazione/Impresa esterna come soggetto dell'accordo — non è "posseduto" dall'organizzazione esterna, che ne è invece l'oggetto.

---

## 7. Relazioni concettuali

| Relazione | Cardinalità | Natura | Durata |
|---|---|---|---|
| Persona ↔ Impresa/Organizzazione (tramite Appartenenza) | Molti-a-molti nel tempo | Appartenenza (con ruolo) | Permanente ma storicizzabile: più periodi possibili, anche non contigui |
| Persona → CompetenzaDichiarata / LinguaParlata | Uno-a-molti | Appartenenza | Permanente (dichiarazione), modificabile liberamente |
| Persona/Impresa → Opportunità | Uno-a-molti | Appartenenza (pubblicazione) | Permanente fino ad archiviazione |
| Opportunità ↔ Persona/Impresa (tramite ManifestazioneDiInteresse) | Molti-a-molti | Partecipazione | Temporanea: dura quanto il processo di selezione/contatto |
| Persona/Impresa ↔ Mercato (tramite PresenzaDiMercato) | Molti-a-molti | Relazione di presenza (non di appartenenza) | Permanente/dichiarativa, ma revocabile |
| Persona/Impresa ↔ Evento (tramite Partecipazione) | Molti-a-molti | Partecipazione | Temporanea, limitata alla durata dell'evento, ma la traccia resta nello storico |
| Persona/Impresa → OffertaDiServizio / RichiestaDiServizio | Uno-a-molti | Appartenenza (chi offre/chi richiede) | Permanente fino ad archiviazione |
| Organizzazione/Impresa ↔ Partner | Uno-a-uno per accordo attivo, uno-a-molti nel tempo (accordi successivi) | Relazione formale piattaforma-soggetto | Permanente fino a revoca/scadenza |
| Qualsiasi Contenuto ↔ VoceDiTassonomia | Molti-a-molti | Classificazione (tag) | Permanente ma modificabile in ogni momento senza impatto sul contenuto referenziato |
| Mercato ↔ VoceDiTassonomia (lingue prevalenti, settori rilevanti) | Molti-a-molti | Classificazione | Permanente, gestita centralmente |
| ContenutoEditoriale → Persona/Impresa/Mercato (soggetto trattato) | Molti-a-molti | Riferimento narrativo (non di possesso) | Permanente, modificabile |

Il filo comune: le relazioni **di appartenenza** (Persona→Opportunità, Impresa→Servizio) sono sempre uno-a-molti con un titolare unico; le relazioni **di partecipazione** (Opportunità↔candidati, Evento↔partecipanti) sono sempre molti-a-molti e temporanee per natura; le relazioni **di classificazione** (tag trasversali) sono sempre molti-a-molti, permanenti ma a bassissimo attrito, pensate per essere aggiunte/rimosse senza conseguenze sul resto del modello.

---

## 8. Lifecycle delle entità principali

**Persona**
Registrata → Attiva → (Inattiva/Sospesa) → Attiva → ... → Cancellata (su richiesta dell'utente; irreversibile)

**Impresa / OrganizzazioneIstituzionale**
Bozza → Pubblicata → Aggiornata (ciclicamente) → (Verificata, se in futuro introdotta una verifica) → Archiviata/Cessata

**Appartenenza**
Dichiarata → Attiva → Terminata (per scelta della persona, per chiusura dell'impresa, o per fine del ruolo) — può essere seguita da una nuova Appartenenza (stesso o diverso ruolo)

**Opportunità**
Bozza → Pubblicata → Con manifestazioni di interesse → Chiusa (con o senza esito) → Archiviata

**Mercato**
Proposto (dalla piattaforma) → Attivo → (eventualmente in evidenza/sponsorizzato) → In manutenzione (contenuti in aggiornamento) → Attivo

**PresenzaDiMercato**
Dichiarata → Attiva → Revocata

**OffertaDiServizio**
Bozza → Attiva → In pausa (temporaneamente non disponibile) → Attiva → Archiviata

**RichiestaDiServizio**
Pubblicata → In valutazione (risposte in arrivo) → Assegnata → Conclusa — oppure Pubblicata → Scaduta (nessun esito entro un termine)

**Evento**
Programmato → Pubblicato → In corso → Concluso → Archiviato

**Partecipazione (a Evento)**
Richiesta/Iscritta → Confermata → (Presente/Assente, a consuntivo) → Archiviata

**ContenutoEditoriale**
Bozza → In revisione → Pubblicato → Aggiornato (ciclicamente) → Archiviato

**Partner**
In trattativa → Attivo → (Sospeso) → Attivo → Terminato/Scaduto

**QualificaDichiarata**
Dichiarata → (In verifica, se introdotta) → (Verificata / Rifiutata) → (Scaduta, se a validità temporale)

**VoceDiTassonomia**
Proposta (da governance piattaforma) → Attiva → (Deprecata, mai cancellata: mantiene coerenza storica sui contenuti che la referenziano)

---

## 9. Tag trasversali

Gli elementi che devono poter collegare qualsiasi contenuto, a prescindere dal dominio di origine, sono la Tassonomia Condivisa (§1, §2) nella sua interezza:

- **Mercati** — l'area geografica/economica internazionale di riferimento.
- **Settori economici** — l'ambito di attività (es. edilizia, ristorazione, logistica, moda).
- **Lingue** — le lingue coinvolte (parlate, richieste, disponibili in un servizio).
- **Territori** — la geografia italiana (città, provincia, regione), distinta dai Mercati internazionali.
- **Competenze** — abilità professionali dichiarabili da una Persona o richieste da un'Opportunità.
- **Temi** — argomenti editoriali (es. burocrazia, finanza, integrazione, digitalizzazione).
- **Professioni / categorie di servizio** — la natura del servizio offerto/richiesto (es. commercialista, mediatore linguistico, agente immobiliare).

**Regola di funzionamento.** Ogni entità di contenuto (Opportunità, OffertaDiServizio, Evento, ContenutoEditoriale, Persona, Impresa, Mercato) può collegarsi a un numero qualsiasi di voci di ciascuna di queste categorie. È questo meccanismo — non una struttura a cartelle o categorie rigide — che permette a un singolo contenuto di comparire contemporaneamente in più sezioni della piattaforma (Principio 3 della Costituzione, e §9 della Costituzione stessa sulle relazioni tra contenuti).

---

## 10. Cross Domain — come i domini comunicano

I domini non si conoscono in profondità tra loro: comunicano attraverso due meccanismi concettuali, senza dipendere dai dettagli interni l'uno dell'altro.

**1. Riferimento per identità.** Un dominio non include mai i dati di un altro dominio: li referenzia tramite un identificativo stabile più un'etichetta leggibile (es. un'Opportunità non contiene la scheda completa dell'Impresa che l'ha pubblicata, ma un riferimento ad essa). Questo permette a ciascun dominio di evolvere e cambiare la propria struttura interna senza rompere chi lo referenzia.

**2. Fatti accaduti (eventi di dominio).** Quando qualcosa di rilevante accade in un dominio (es. "un'Appartenenza è diventata attiva", "un'Opportunità è stata pubblicata", "un Evento si è concluso", "una PresenzaDiMercato è stata dichiarata"), questo fatto viene reso disponibile agli altri domini che vogliono reagire — ad esempio il dominio Notifiche, o il dominio Ricerca per aggiornare i risultati, o il dominio Osservatorio per aggiornare le proprie statistiche. Nessun dominio "chiede" attivamente informazioni a un altro in modo invasivo: reagisce a ciò che è accaduto.

**Perché questo approccio.** Garantisce il Principio 5 della Costituzione ("ogni nuova funzionalità dovrà poter essere aggiunta senza rompere il modello"): un nuovo dominio (es. un futuro dominio "Investimenti" strutturato) può iniziare a reagire ai fatti già esistenti (es. "una Persona è entrata in un Mercato") senza che i domini Persona o Mercato debbano sapere che quel nuovo dominio esiste.

---

## 11. Modello di ricerca

Il motore di ricerca deve ragionare su due livelli, sempre in combinazione:

**Livello 1 — Tipo di contenuto.** Ogni entità cercabile (Persona, Impresa, Opportunità, Evento, OffertaDiServizio, RichiestaDiServizio, Mercato, ContenutoEditoriale) espone un "involucro" comune per la ricerca: titolo/nome, descrizione sintetica, stato di visibilità, titolare/autore, data di pubblicazione o aggiornamento. Questo livello permette ricerche generiche per testo libero su qualsiasi tipo di contenuto.

**Livello 2 — Tag trasversali e relazioni.** Ogni ricerca reale e utile combina il testo libero con una o più dimensioni della Tassonomia Condivisa (§9) e con le relazioni descritte al §7. Esempio concreto (già anticipato nella Costituzione): *"traduttori legali per il mercato del Marocco"* attraversa contemporaneamente: Persona/OffertaDiServizio (traduttori) → Tema/Competenza (giuridico) → Mercato (Marocco). Il motore di ricerca deve poter unire questi tre criteri come filtri combinabili, non come tre ricerche separate.

**Ambiti che il motore di ricerca deve saper attraversare:**
- Per settore (trova tutto ciò che è taggato con un settore, indipendentemente dal dominio di origine).
- Per mercato (trova tutto ciò che è collegato a un Paese/area, tramite tag diretto o tramite PresenzaDiMercato).
- Per lingua (trova persone, servizi, contenuti in una lingua specifica).
- Per territorio italiano (trova persone/imprese/eventi in una città/regione).
- Per competenza/professione (trova persone o servizi con una specifica competenza).
- Per relazione (trova, ad esempio, tutte le Opportunità pubblicate da Imprese di un certo settore che operano in un certo Mercato — ricerca che attraversa più aggregati tramite i loro riferimenti).

Il principio guida è che il motore di ricerca è l'unico "luogo" della piattaforma dove tutti i domini si incontrano liberamente: proprio per questo deve appoggiarsi quasi esclusivamente alla Tassonomia Condivisa come linguaggio comune, e non a strutture proprietarie di un singolo dominio.

---

## 12. Modello notifiche

Le notifiche sono sempre una **reazione a un fatto accaduto** (§10), mai un'azione autonoma. Gli eventi che generano notifiche, organizzati per chi le riceve:

**Verso la Persona/Impresa che pubblica:**
- Nuova ManifestazioneDiInteresse su una propria Opportunità.
- Nuova candidatura/contatto su una propria OffertaDiServizio o RichiestaDiServizio.
- Cambio di stato rilevante su un proprio contenuto (es. un'Opportunità sta per scadere).

**Verso la Persona che partecipa/segue:**
- Cambio di stato su una propria ManifestazioneDiInteresse o Partecipazione (es. accettata, in attesa, non selezionata).
- Nuova Opportunità pubblicata in linea con i propri settori/mercati/competenze di interesse dichiarati.
- Nuovo Evento pubblicato in un Mercato o settore seguito.
- Nuovo ContenutoEditoriale pubblicato da un profilo, un'Impresa o un Mercato seguito.

**Verso la Persona con un'Appartenenza attiva:**
- Nuova Appartenenza proposta (invito a un ruolo in un'Impresa/Organizzazione).
- Modifica o terminazione di un'Appartenenza esistente.

**Verso i fornitori di servizio:**
- Nuova RichiestaDiServizio compatibile con la propria area di offerta (settore, lingua, mercato).
- Promemoria di scadenza di una QualificaDichiarata a validità temporale.

**Verso i Partner:**
- Attività rilevante nel proprio ambito di partnership (es. nuove Persone/Imprese entrate in un Mercato sponsorizzato).

Il principio guida è la **rilevanza contestuale**: una notifica ha senso solo se collegata a un interesse esplicito o implicito già dichiarato dall'utente (competenze, mercati, settori seguiti, contenuti pubblicati) — mai una notifica generica di massa.

---

## 13. Permessi concettuali — chi può fare cosa

Attori riconosciuti dal modello (nessun riferimento a meccanismi tecnici, solo a ruoli concettuali):

- **Visitatore anonimo** — chiunque non autenticato.
- **Persona autenticata** — qualsiasi utente registrato.
- **Persona con Appartenenza attiva a un'Impresa/Organizzazione** — una Persona autenticata che, tramite un ruolo attivo, può agire "per conto" dell'Impresa/Organizzazione.
- **Partner** — un'Organizzazione/Impresa con un accordo di partnership attivo, con eventuali diritti aggiuntivi legati all'accordo stesso (es. sezione di Mercato in evidenza).
- **Redazione/Staff di piattaforma** — responsabile della qualità dei Contenuti Editoriali e della Tassonomia Condivisa.

| Cosa | Visitatore | Persona autenticata | Persona con ruolo in Impresa/Org. | Partner | Staff piattaforma |
|---|---|---|---|---|---|
| Consultare profili, imprese, opportunità, eventi, servizi, mercati, contenuti **attivi/pubblici** | Sì | Sì | Sì | Sì | Sì |
| Consultare il proprio profilo anche se non pubblico/attivo | — | Sì (solo il proprio) | Sì (solo il proprio) | — | Sì (per moderazione) |
| Modificare il proprio profilo Persona | — | Sì (solo il proprio) | Sì (solo il proprio) | — | — |
| Creare/modificare la scheda di un'Impresa/Organizzazione | — | Solo se detiene un'Appartenenza con ruolo abilitante (es. titolare) | Sì (per l'impresa/organizzazione del proprio ruolo) | — | Sì (per moderazione) |
| Gestire le Appartenenze di un'Impresa (invitare/rimuovere ruoli) | — | — | Sì, solo se il proprio ruolo lo prevede (es. titolare) | — | — |
| Pubblicare un'Opportunità/OffertaDiServizio/RichiestaDiServizio | — | Sì (a proprio nome) | Sì (a proprio nome o a nome dell'impresa/organizzazione) | Sì | — |
| Rispondere a un'Opportunità/Servizio (ManifestazioneDiInteresse) | — | Sì | Sì | Sì | — |
| Creare/gestire un Evento | — | Sì (a proprio nome) | Sì (a nome dell'impresa/organizzazione) | Sì | Sì (eventi di piattaforma) |
| Pubblicare ContenutoEditoriale a proprio nome (es. Storia) | — | Sì (solo Storia personale) | — | Sì (nel proprio ambito) | Sì (Notizie, Guide) |
| Dichiarare una PresenzaDiMercato | — | Sì (a proprio nome) | Sì (a nome dell'impresa/organizzazione) | Sì | — |
| Creare/modificare una voce di Tassonomia Condivisa (lingua, settore, tema...) | — | — | — | — | Sì (governance centrale) |
| Creare/modificare la scheda di un Mercato | — | — | — | — | Sì (governance centrale) |
| Attivare/gestire un accordo di Partnership | — | — | — | Solo per il proprio accordo (visualizzazione/rinnovo) | Sì (attivazione, modifica termini) |

Il principio che attraversa la tabella: **ogni diritto di scrittura deriva sempre da un'identità precisa (Persona) o da un ruolo esplicito e verificabile (Appartenenza)**, mai da un semplice collegamento implicito. Questo rispecchia il Principio 4 della Costituzione — le relazioni valgono quanto gli oggetti — anche sul piano dei permessi: non si concede un diritto su un'Impresa perché "si è collegati" ad essa in senso vago, ma perché esiste un'Appartenenza attiva con un ruolo specifico che lo prevede.

---

## 14. Estensibilità — come aggiungere nuovi domini senza rompere il modello

Il modello è pensato per crescere per anni (Principio 5 e 6 della Costituzione) attraverso quattro meccanismi:

**1. Specializzazione dentro linguaggi comuni già esistenti.** Nuovi verticali di servizio (es. un futuro servizio di "Recruiting strutturato" o "Investimenti") non richiedono un nuovo dominio da zero: si aggiungono come nuove specializzazioni di OffertaDiServizio/RichiestaDiServizio, riusando fin da subito Ownership (§6), Lifecycle (§8), Tag trasversali (§9), Ricerca (§11) e Permessi (§13) già definiti.

**2. Tassonomia come punto di estensione a basso attrito.** Aggiungere un nuovo settore, una nuova lingua, un nuovo tema o una nuova professione non richiede modifiche a nessun altro dominio: è sufficiente aggiungere una nuova VoceDiTassonomia, immediatamente utilizzabile da qualsiasi contenuto esistente e futuro.

**3. Nuovi domini si collegano tramite riferimento e fatti accaduti, non tramite inclusione.** Un dominio completamente nuovo (es. un futuro dominio "Mentorship" evocato nella Roadmap della Costituzione) può nascere referenziando Persona, Impresa e Appartenenza per identità, e reagendo a fatti già esistenti (es. "una Persona ha raggiunto una certa maturità di percorso"), senza che Persona o Impresa debbano essere modificati per "sapere" che Mentorship esiste.

**4. Le relazioni come aggregati di prima classe permettono nuove semantiche senza toccare le entità che collegano.** Poiché Appartenenza, PresenzaDiMercato, ManifestazioneDiInteresse e Partecipazione sono aggregati indipendenti (§5), è possibile introdurre nuovi tipi di ruolo, nuovi stati o nuove qualifiche della relazione (es. un nuovo ruolo di Appartenenza "mentore", coerente con la Roadmap V3) senza alcun impatto sulle entità Persona o Impresa che la relazione collega.

**Conseguenza pratica per chi costruirà database, API, frontend, permessi, ricerca e notifiche:** ogni nuovo modulo futuro dovrà rispondere a tre domande, già risposte per ogni dominio in questo documento — *chi lo possiede (§6), a quali tag trasversali si collega (§9), quali fatti genera per gli altri domini (§10)* — e potrà quindi essere innestato nel modello esistente senza richiedere una revisione strutturale.

---

## Conclusione

Questo documento non introduce nulla che contraddica la Costituzione della piattaforma: la traduce in un linguaggio sufficientemente rigoroso da permettere, in una fase successiva, di progettare database, API, frontend, permessi, ricerca e notifiche con la certezza di aver compreso il dominio nella sua interezza — persona al centro, impresa come strumento, relazioni come cittadini di prima classe, tag trasversali come tessuto connettivo, estensibilità come garanzia per gli anni a venire.

**Nota di continuità con il lavoro tecnico già avviato.** Alcune fondamenta tecniche esistono già nel progetto (profilo utente, lingue, servizi linguistici, formazione e sicurezza, settori economici) e sono coerenti nella sostanza con questo modello. Il passaggio più significativo che la futura progettazione del database dovrà affrontare è l'evoluzione dell'attuale profilo utente (oggi un solo profilo per account) verso la distinzione concettuale piena tra Persona e Impresa/Organizzazione collegate tramite Appartenenza, così come descritto in questo documento — un'evoluzione, non una rottura, del lavoro già svolto.
