# Logical Data Model — Dominio MERCATI INTERNAZIONALI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md).
> Scopo del documento: definire il modello logico del dominio Mercati Internazionali, quarto pilastro della piattaforma insieme a Persone, Imprese e Opportunità (con le Collaborazioni ad essa collegate). Il documento traduce il ruolo strategico già riconosciuto a questo dominio dal Domain Model (dominio Core "Mercati Internazionali") in entità, relazioni, cardinalità, stati e regole, restando esclusivamente sul piano concettuale.
> Ruolo strategico. Mercati Internazionali non descrive un attributo dell'Impresa, ma l'insieme delle relazioni economiche, commerciali, professionali e istituzionali tra imprese italiane — incluse quelle guidate da Persone di origine immigrata — e Paesi esteri, aree economiche, clienti, fornitori, distributori, partner, investitori, enti di supporto e comunità imprenditoriali e di diaspora. Il dominio valorizza il possibile ruolo delle Persone di origine immigrata come ponte economico, linguistico, culturale e relazionale tra l'Italia e altri Paesi, senza mai presumere che l'origine personale comporti automaticamente competenze, relazioni o attività internazionali (§9, §12).

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Mercati Internazionali rappresenta lo spazio economico e relazionale esterno all'Italia — Paesi, aree geografiche o economiche, corridoi commerciali — e le relazioni che Imprese e Persone dichiarano di avere, aver avuto o voler avere con esso: presenza, interesse, attività internazionale, relazioni commerciali con soggetti esteri, esigenze di internazionalizzazione e risorse di supporto disponibili.

**Quali problemi risolve.** Rende possibile rispondere a domande che nessun altro dominio può rispondere da solo: quali imprese operano in un determinato Paese o area; quali persone hanno relazioni o esperienza rilevante per un mercato; quali esigenze di internazionalizzazione sono aperte e potrebbero incontrare un'offerta; quali risorse istituzionali sono disponibili per un dato mercato. Rende inoltre possibile raccontare, in modo aggregato e non stereotipato, il ruolo delle Persone di origine immigrata come ponte tra l'Italia e altri Paesi — un obiettivo esplicito della piattaforma che nessun altro dominio (Persone, Imprese, Appartenenze) è progettato per rappresentare.

**Cosa rientra nel dominio.** Il Mercato internazionale come concetto autonomo (§2, §3); le relazioni di Presenza e di Interesse tra un'Impresa o una Persona e un Mercato (§4); la classificazione dell'Attività internazionale svolta (§5); le Relazioni commerciali internazionali con soggetti esterni (§6); le Esigenze di internazionalizzazione (§8); le Risorse di supporto al mercato (§2); la verifica e le fonti relative a tutto quanto sopra (§10); la visibilità di queste informazioni (§11).

**Cosa NON rientra nel dominio.**
- Non rientra l'Impresa in quanto tale (dati descrittivi, sedi, settori, servizi, prodotti, certificazioni, canali, media): appartiene al dominio Imprese, che questo dominio referenzia senza duplicare.
- Non rientra la Persona in quanto tale (identità, competenze dichiarate, lingue parlate, storie personali): appartiene al dominio Persone, referenziato senza duplicazione.
- Non rientra l'Appartenenza (chi anima quale Impresa, con quale ruolo): appartiene al dominio Appartenenze, referenziato senza duplicazione. Una Persona può essere rilevante per un Mercato indipendentemente dalla propria Appartenenza a un'Impresa attiva in quel mercato (§13).
- Non rientrano le Opportunità né le Collaborazioni: un'esigenza di internazionalizzazione (§8) può *generare* un'Opportunità o una Collaborazione in quei domini, ma non coincide con essa e non viene incorporata in questo documento.
- Non rientrano gli Eventi (fiere, missioni commerciali): il dominio Mercati Internazionali può essere referenziato da un Evento (es. una fiera dedicata a un Mercato), ma non gestisce iscrizioni, capienze o partecipazioni.
- Non rientrano i Contenuti Editoriali: le guide e i report dedicati a un Mercato appartengono al dominio Contenuti Editoriali/Osservatorio, che referenziano il Mercato come soggetto trattato.
- Non rientra l'Osservatorio: questo dominio alimenta l'Osservatorio con dati aggregabili, ma non produce esso stesso report o statistiche.
- Non rientra l'identità digitale né i diritti di accesso: nessuna informazione di questo dominio genera di per sé un permesso tecnico; quella responsabilità appartiene esclusivamente al futuro dominio Identità & Accessi.
- Non rientrano i servizi linguistici come attività professionale strutturata: restano una funzione accessoria e trasversale (§9), di competenza del sotto-dominio Servizi Linguistici già previsto dal Domain Model, non un'estensione di questo dominio.

**Quali domini utilizza.**
- **Imprese** — per referenziare l'Impresa coinvolta in una Presenza, un Interesse, un'Attività internazionale o una Relazione commerciale, senza duplicarne i dati.
- **Persone** — per referenziare la Persona coinvolta, direttamente o tramite un'Appartenenza, in una relazione con un Mercato, e per referenziare le sue LinguaParlata dichiarate quando rilevanti (§9), senza duplicarle.
- **Appartenenze** — per comprendere con quale titolo una Persona agisce per conto di un'Impresa in una relazione di mercato (es. chi ha dichiarato una Presenza a nome dell'Impresa).
- **Tassonomia Condivisa** — per i Settori economici (§6) e per ogni classificazione trasversale utile a qualificare un'Attività internazionale.

**Quali domini utilizzano Mercati Internazionali.**
- **Imprese** — tramite `MercatoImpresa` (§1 di `logical/imprese.md`), che rappresenta il collegamento tra un'Impresa e un Mercato definito in questo dominio, senza duplicarne la definizione (decisione vincolante, §15).
- **Opportunità & Collaborazioni** — per qualificare un'Opportunità o una Collaborazione con il Mercato di riferimento, e per nascere da un'Esigenza di internazionalizzazione qui dichiarata.
- **Eventi** — per collegare un Evento a uno o più Mercati.
- **Contenuti Editoriali** — per produrre guide o notizie dedicate a un Mercato, referenziandolo come soggetto trattato.
- **Osservatorio** — per aggregare, in forma statistica, dati su presenza, attività e relazioni commerciali senza mai esporre informazioni riservate (§10, §11, §12).
- **Ricerca** — per rispondere a query che attraversano Persona/Impresa e Mercato insieme (es. "imprese che esportano verso un dato Paese").
- **Notifiche** — per reagire ai fatti di dominio descritti al §14.

**Perché è un dominio autonomo e non un semplice attributo dell'Impresa.** Un Mercato esiste e ha significato indipendentemente da qualsiasi singola Impresa che vi operi (§12, invariante 1): è un oggetto di governance centrale — come già stabilito dal Domain Model (§5, §6: "Un Mercato non appartiene a nessun utente: è governance centrale di piattaforma") — che aggrega più Imprese, più Persone, più relazioni commerciali, esigenze e risorse di supporto. Trattarlo come un campo descrittivo dell'Impresa (es. un semplice elenco di Paesi in una scheda) impedirebbe di rispondere a domande che riguardano il Mercato stesso (chi opera lì, quali risorse sono disponibili, quali esigenze sono aperte) e renderebbe impossibile la funzione di aggregazione richiesta dall'Osservatorio e dal ruolo strategico del dominio (introduzione). Inoltre, un Mercato può avere una propria vita editoriale e informativa (contenuti, risorse di supporto, aree economiche di appartenenza) che non ha senso far dipendere dall'esistenza di una specifica Impresa.

---

## 2. Entità e concetti principali

La tabella distingue esplicitamente, per ciascun concetto richiesto, se si tratta di un'**entità autonoma** (ha identità propria, esiste indipendentemente da chi la referenzia), di un **concetto descrittivo** (qualifica o classifica altro, senza identità propria) o di una **relazione** (collega due o più entità, con proprie regole).

| Concetto | Natura | Sintesi |
|---|---|---|
| Mercato internazionale | Entità autonoma | Il Paese, gruppo di Paesi, area o corridoio economico trattato come ecosistema navigabile; governance centrale, non posseduto da alcun utente (§3). |
| Paese | Entità autonoma (di riferimento) | L'unità geografico-giurisdizionale di base; governance centrale; un Mercato può comprenderne uno o più (§3). |
| Area geografica o economica | Concetto descrittivo | Il modo in cui uno o più Paesi, o parti di essi, vengono raggruppati per definire un Mercato (unione economica, area linguistica, corridoio, ecc.) (§3). |
| Presenza di mercato (PresenzaDiMercato) | Relazione (con identità propria, aggregato) | Il fatto dichiarato che un'Impresa o una Persona opera effettivamente in un Mercato (§4). |
| Interesse di mercato (InteresseDiMercato) | Relazione (con identità propria) | La dichiarazione di un interesse verso un Mercato, non ancora tradotto in presenza operativa (§4). |
| Relazione commerciale internazionale | Relazione (con identità propria) | Il legame con un soggetto esterno specifico (cliente, fornitore, distributore, agente, partner, investitore) nel contesto di un Mercato (§6). |
| Attività internazionale | Entità autonoma (dipendente da una Presenza) | L'istanza classificata di ciò che viene realmente svolto in un Mercato (esportazione, distribuzione, investimento, ecc.) (§5). |
| Canale di accesso al mercato | Concetto descrittivo | Il modo in cui un'Attività internazionale raggiunge il Mercato (distributore, marketplace, filiale diretta, agente, fiera, rete di vendita). |
| Settore nel mercato | Relazione (classificazione) | Il collegamento tra un'Attività internazionale o una Presenza e un Settore economico (Tassonomia Condivisa), qualificato dalla sua rilevanza in quel Mercato specifico. |
| Esigenza di internazionalizzazione | Entità autonoma | Un bisogno concreto dichiarato da un'Impresa o una Persona, relativo a un Mercato (specifico o non ancora individuato) (§8). |
| Risorsa di supporto al mercato | Entità autonoma (di riferimento) | Un ente, un organismo o una rete che offre supporto all'internazionalizzazione verso un dato Mercato (camera di commercio, ambasciata, associazione, rete imprenditoriale) (§6). |
| Evidenza della presenza o dell'interesse | Entità autonoma (dipendente) | Ciò che sostiene concretamente una dichiarazione di presenza, interesse, attività o relazione commerciale, ai fini della verifica (§10). |
| Fonte dell'informazione | Entità autonoma (dipendente) | Da dove proviene una data informazione dichiarata in questo dominio (§10). |

---

## 3. Definizione di mercato internazionale

**Un Mercato non coincide necessariamente con un singolo Stato.** Il dominio deve poter rappresentare, senza forzature:

- un singolo **Paese**;
- un **gruppo di Paesi** trattato come unico ecosistema di interesse (es. un'area regionale non istituzionalizzata);
- una **regione transnazionale** (es. un'area che attraversa i confini di più Stati per ragioni geografiche, economiche o culturali);
- un'**unione economica** (un insieme di Paesi legati da un accordo economico o commerciale formale);
- un'**area linguistica** (un insieme di Paesi o territori che condividono una lingua veicolare rilevante per gli scambi);
- un'**area commerciale** (un insieme di Paesi trattato come unico mercato per ragioni di prassi commerciale, anche senza un fondamento istituzionale);
- un **corridoio economico** (una relazione bilaterale o multilaterale specifica tra origine e destinazione, es. un asse di scambio ricorrente);
- un **mercato settoriale con dimensione internazionale** (un ambito di attività economica trasversale a più Paesi, quando ha senso trattarlo come unità a sé, es. un settore globalmente integrato).

**Distinzioni da mantenere sempre separate.**

- **Geografia** — la localizzazione fisica dei Paesi e dei territori coinvolti, indipendente da qualsiasi considerazione economica o giuridica.
- **Giurisdizione** — l'ambito di applicazione delle leggi e delle autorità di un Paese o di un'unione di Paesi; distinta dalla geografia, perché una stessa area geografica può avere giurisdizioni diverse (o una stessa giurisdizione può estendersi a più aree geografiche non contigue).
- **Area economica** — il raggruppamento di Paesi o territori sulla base di accordi o integrazioni economiche riconosciute (unioni doganali, aree di libero scambio).
- **Area commerciale** — il raggruppamento adottato per prassi o convenienza commerciale, anche senza alcun fondamento istituzionale (es. "area del Golfo" come riferimento commerciale corrente).
- **Area linguistica** — il raggruppamento basato sulla lingua veicolare condivisa, spesso trasversale a più aree economiche e giurisdizioni.
- **Area culturale** — il raggruppamento basato su affinità culturali, storiche o di comunità (incluse le comunità della diaspora, §13), che può non coincidere con nessuna delle categorie precedenti.

**Principio.** Un Mercato, come definito in questo dominio, è **sempre una costruzione di significato per la piattaforma**: può appoggiarsi a una o più di queste distinzioni contemporaneamente (un Mercato può essere insieme un'area economica e un'area linguistica), ma il dominio non deve mai presumere che coincidano. Un Paese può appartenere a più Mercati definiti in modo diverso (§12, §13); un Mercato può includere Paesi che non condividono né area economica né lingua né giurisdizione, se la piattaforma ha una ragione di trattarli come un unico ecosistema (es. un corridoio commerciale).

---

## 4. Presenza e interesse di mercato

**Principio di fondo.** La presenza effettiva non deve essere confusa con il semplice interesse: sono due concetti distinti, con requisiti di verifica diversi (§10) e conseguenze diverse per la ricerca e l'Osservatorio. Il dominio li tratta come due relazioni distinte — PresenzaDiMercato e InteresseDiMercato — che condividono lo stesso Mercato e lo stesso soggetto (Impresa o Persona) ma hanno un significato differente.

**Configurazioni di Presenza (PresenzaDiMercato).**
- *Mercato in cui l'Impresa opera già* — la configurazione base: un'attività internazionale è in corso (§5).
- *Mercato servito occasionalmente* — l'attività esiste ma non con continuità o struttura stabile.
- *Mercato verso cui esporta* — natura specifica dell'attività (§5), con beni o servizi che escono dall'Italia verso il Mercato.
- *Mercato dal quale importa* — natura opposta: beni o servizi che entrano in Italia dal Mercato.
- *Mercato nel quale possiede una sede o una presenza stabile* — la forma di presenza più strutturata, con un impegno duraturo nel Mercato.
- *Mercato raggiunto tramite intermediari* — l'Impresa non opera direttamente, ma tramite un distributore, un agente o un altro soggetto terzo (§6), che agisce come Canale di accesso al mercato.
- *Mercato abbandonato* — una Presenza che è stata dichiarata e poi conclusa o interrotta (§7), e che resta storicizzata.
- *Mercato non più attivo* — sinonimo concettuale di "abbandonato" quando riferito allo stato della relazione economica (§7): la Presenza esiste come fatto storico, ma non descrive più un'attività in corso.

**Configurazioni di Interesse (InteresseDiMercato).**
- *Mercato di interesse futuro* — un'intenzione dichiarata, senza che sia ancora stata avviata alcuna attività concreta.
- *Mercato in valutazione* — un passo oltre il semplice interesse: sono in corso approfondimenti o analisi, ma nessuna decisione operativa è stata presa.

**Principio.** Un Interesse può evolvere in una Presenza (quando l'attività viene effettivamente avviata, §7), ma non è né un prerequisito né una garanzia: un Interesse può restare tale indefinitamente, essere ritirato, o non tradursi mai in alcuna attività. Il dominio non deve presumere che ogni Interesse dichiarato preannunci una Presenza futura.

---

## 5. Tipologie di attività internazionale

Un'Attività internazionale (§2) può assumere una o più delle seguenti tipologie contemporaneamente (una stessa Attività può essere, ad esempio, sia distribuzione sia rappresentanza commerciale): la classificazione non è limitata alle sole esportazioni ed è volutamente ampia.

| Tipologia | Significato |
|---|---|
| Esportazione | Vendita di beni o servizi dall'Italia verso il Mercato |
| Importazione | Acquisto di beni o servizi dal Mercato verso l'Italia |
| Distribuzione | Gestione della rivendita di beni nel Mercato, propri o di terzi |
| Intermediazione | Ruolo di collegamento tra soggetti nel Mercato senza essere parte diretta della transazione finale |
| Produzione | Attività produttiva svolta direttamente nel Mercato |
| Fornitura di servizi | Erogazione di servizi a beneficiari presenti nel Mercato |
| Consulenza | Attività di consulenza professionale prestata verso soggetti del Mercato |
| Commercio elettronico transfrontaliero | Vendita diretta a clienti nel Mercato tramite canali digitali |
| Investimento diretto | Impiego di capitale nel Mercato (es. apertura di una struttura propria) |
| Partecipazione societaria | Detenzione di quote in una società operante nel Mercato |
| Franchising | Concessione o acquisizione di un modello di attività in franchising nel Mercato |
| Licenza | Concessione o acquisizione del diritto di utilizzo di un marchio, un brevetto o un know-how nel Mercato |
| Rappresentanza commerciale | Ruolo di rappresentante formale degli interessi commerciali di un'Impresa nel Mercato |
| Approvvigionamento | Acquisto di beni o materie prime dal Mercato per uso proprio, distinto dall'importazione a fini di rivendita |
| Subfornitura | Fornitura di componenti o lavorazioni a un'Impresa del Mercato nell'ambito della sua catena produttiva |
| Cooperazione industriale | Collaborazione strutturata con soggetti del Mercato su progetti industriali comuni |
| Ricerca e sviluppo | Attività di ricerca svolta in collaborazione con o all'interno del Mercato |
| Formazione | Attività formativa erogata verso o in collaborazione con soggetti del Mercato |
| Trasferimento tecnologico | Cessione o acquisizione di tecnologia o competenza tecnica verso/dal Mercato |
| Attività istituzionale o associativa | Partecipazione a reti, associazioni o iniziative istituzionali legate al Mercato, senza una transazione economica diretta |

---

## 6. Soggetti e relazioni coinvolte

Il dominio descrive le **relazioni di mercato**, non i soggetti che le altri domini già possiedono: ogni soggetto elencato di seguito è referenziato per identità (quando ha una rappresentazione propria altrove sulla piattaforma) o come voce di riferimento (quando è esterno alla piattaforma), mai incorporato.

| Soggetto/relazione | Dominio di appartenenza del soggetto | Come si collega a Mercati Internazionali |
|---|---|---|
| Imprese | Imprese (esterno) | Referenziate da PresenzaDiMercato, InteresseDiMercato, Attività internazionale (§4, §5) |
| Persone | Persone (esterno) | Referenziate direttamente (es. una Persona con relazioni personali in un Mercato, §13) o tramite un'Appartenenza che agisce per conto di un'Impresa |
| Appartenenze | Appartenenze (esterno) | Referenziate per stabilire con quale titolo una Persona dichiara o gestisce una relazione di mercato a nome di un'Impresa |
| Clienti, fornitori, distributori, agenti, partner, investitori | Soggetti esterni alla piattaforma (o Imprese/Persone della piattaforma stessa, quando applicabile) | Referenziati tramite Relazione commerciale internazionale (§2) |
| Professionisti | `logical/professionisti.md` (dominio confermato autonomo) | Referenziati come parte di una Relazione commerciale internazionale (es. un consulente per un Mercato) o come Risorsa di supporto |
| Enti pubblici, camere di commercio, ambasciate e consolati, associazioni, reti imprenditoriali, organismi di supporto all'internazionalizzazione | Esterni alla piattaforma, rappresentati come Risorsa di supporto al mercato (§2) | Referenziati come fonte di supporto, e talvolta come Fonte dell'informazione o come parte di un'Evidenza di verifica (§10) |

**Principio.** Nessuno di questi soggetti viene mai duplicato: quando un soggetto ha già una rappresentazione propria sulla piattaforma (un'Impresa, una Persona), questo dominio lo referenzia per identità; quando è esterno alla piattaforma (un cliente straniero, un ente istituzionale non presente come Partner), questo dominio lo tratta come un riferimento informativo, senza pretendere di possederne l'identità o governarne l'esistenza.

---

## 7. Ciclo di vita della relazione con il mercato

Il percorso con cui una relazione con un Mercato nasce ed evolve — dal primo segnale di interesse fino a un'eventuale attività consolidata o conclusa — è descritto da **quattro assi distinti**, che non devono mai essere compressi in un'unico stato (coerente con l'approccio già adottato in `logical/imprese.md` §5 e in `logical/appartenenze.md` §6).

**a) Stato editoriale (della dichiarazione).**
- *Segnalata* — qualcuno ha annotato una possibilità o un'ipotesi di relazione con un Mercato, senza che sia ancora una dichiarazione formale (es. una nota interna, un'osservazione della redazione).
- *Dichiarata* — la relazione (Interesse o Presenza) è stata formalizzata da chi ha titolo per farlo.

**b) Stato della relazione economica.** Descrive dove si trova, nel proprio percorso reale, ciò che è stato dichiarato:
- *In valutazione* — si stanno vagliando opportunità, rischi o condizioni, senza ancora una decisione operativa.
- *Pianificata* — è stata decisa un'azione concreta, non ancora avviata.
- *Avviata* — l'attività (§5) ha avuto inizio.
- *Attiva* — l'attività è in corso con continuità.
- *Consolidata* — l'attività ha una storia comprovata e una stabilità riconosciuta nel tempo.
- *Sospesa* — l'attività è temporaneamente non operativa, in modo reversibile.
- *Interrotta* — l'attività si è fermata in modo non pianificato (es. per una crisi, una sanzione, un evento imprevisto), a differenza di una conclusione ordinaria.
- *Conclusa* — l'attività è terminata in modo ordinario e pianificato (es. fine di un progetto, uscita volontaria dal Mercato).
- *Archiviata* — stato finale di conservazione storica, successivo a Conclusa o Interrotta, per mantenere la traccia della relazione (§12) senza che compaia più nei percorsi correnti.

**c) Stato di verifica.**
- *Non verificata* — nessun controllo è stato effettuato; stato di default.
- *In verifica* — un controllo è in corso.
- *Confermata* — uno o più assi di verifica (§10) sono stati confermati.
- *Contestata* — una delle parti, o un terzo con titolo per farlo, ha messo in dubbio quanto dichiarato; può sovrapporsi in qualsiasi momento agli altri stati.

**d) Visibilità.** Un quarto asse, distinto dai precedenti, descrive chi può conoscere l'esistenza e i dettagli della relazione: è trattato integralmente al §11, per evitare duplicazioni.

**Perché i quattro assi restano separati.** Una relazione può essere Dichiarata (asse a) e In valutazione (asse b), ma già Contestata (asse c) se una controparte ne nega la fondatezza; un'Attività Consolidata (asse b) può restare Non verificata (asse c) se nessuno ha mai avuto motivo di controllarla; una relazione Archiviata (asse b) può restare visibile solo in forma storica (asse d, §11) indipendentemente dal proprio stato di verifica. Comprimere questi quattro assi in un'unica proprietà obbligherebbe a scegliere significati impropri per combinazioni reali e frequenti.

---

## 8. Obiettivi ed esigenze di internazionalizzazione

Un'**Esigenza di internazionalizzazione** (§2) rappresenta un bisogno concreto dichiarato da un'Impresa o una Persona, relativo a un Mercato specifico o non ancora individuato. Le tipologie previste includono almeno:

- ricerca clienti;
- ricerca fornitori;
- ricerca distributori;
- ricerca agenti;
- ricerca partner industriali;
- ricerca investitori;
- ricerca finanziamenti;
- apertura di una sede;
- accesso a fiere;
- adeguamento normativo;
- certificazioni;
- logistica;
- pagamenti internazionali;
- tutela contrattuale;
- tutela della proprietà intellettuale;
- traduzione e mediazione linguistica;
- formazione interculturale;
- ricerca di personale;
- accesso a reti istituzionali.

**Relazione con Collaborazioni e Opportunità.** Un'Esigenza dichiarata in questo dominio può *generare* un'Opportunità (una richiesta pubblicata e cercabile) o una Collaborazione (un incontro diretto tra domanda e offerta), ma non coincide con esse: l'Esigenza è il fatto di dominio — "questa Impresa ha bisogno di X in relazione a questo Mercato" — mentre l'Opportunità o la Collaborazione sono contenuti autonomi di altri domini che possono nascere da quel fatto, evolvere autonomamente, ed essere gestiti secondo le proprie regole (ciclo di vita, visibilità, risposte) senza che questo dominio ne acquisisca la responsabilità. Un'Esigenza può quindi esistere senza mai generare alcuna Opportunità o Collaborazione, e un'Opportunità può fare riferimento a un Mercato senza che esista necessariamente un'Esigenza formalizzata in questo dominio.

---

## 9. Competenze linguistiche, culturali e relazionali

Il dominio riconosce il possibile ruolo di alcuni fattori come abilitatori di una relazione di mercato più efficace:

- **Lingue operative** — referenziate dalla LinguaOperativaImpresa (`logical/imprese.md` §2) o dalla LinguaParlata di una Persona (`logical/persone.md` §2), quando dichiarate come rilevanti per una specifica relazione di mercato.
- **Conoscenza culturale** — la comprensione delle prassi, delle sensibilità e delle aspettative culturali rilevanti nel Mercato.
- **Esperienza nel Paese** — un percorso personale o professionale che ha comportato una permanenza o un'attività diretta nel Paese o nell'area in questione.
- **Reti personali e professionali** — relazioni dirette con soggetti del Mercato, dichiarabili come parte di una Relazione commerciale internazionale (§6) o come supporto a un'Esigenza (§8).
- **Conoscenza normativa** — familiarità con le regole, gli adempimenti e le prassi legali del Mercato.
- **Capacità di mediazione** — l'abilità di facilitare la comprensione reciproca tra soggetti di contesti diversi.
- **Conoscenza delle pratiche commerciali** — familiarità con il modo in cui gli affari si conducono realmente in quel Mercato, distinta dalla sola conoscenza linguistica o normativa.

**Principio di non automatismo, senza eccezioni.** Il dominio deve evitare qualsiasi automatismo tra:
- l'origine della Persona;
- la nazionalità;
- la lingua parlata;
- la competenza professionale o commerciale;
- l'affidabilità;
- la disponibilità reale di relazioni commerciali.

Nessuno di questi fattori implica automaticamente un altro. Il fatto che una Persona abbia un'origine legata a un Paese non dimostra che conosca quel Mercato dal punto di vista commerciale (§12, §13); il fatto che parli una lingua non dimostra competenza commerciale in quella lingua (§12); il fatto che abbia relazioni personali non dimostra che siano utilizzabili commercialmente. Ogni competenza, esperienza o relazione rilevante per un Mercato deve essere **dichiarata o verificata autonomamente** (§10), mai dedotta da un dato anagrafico o identitario.

**Servizi linguistici.** Restano, in questo dominio come nel resto della piattaforma, una funzione **accessoria e trasversale** al servizio delle relazioni di mercato (coerente con il sotto-dominio Servizi Linguistici e Interculturali già previsto dal Domain Model), non un fine della piattaforma: il dominio Mercati Internazionali non deve trasformarsi in un sito di traduzione o interpretariato, né deve incorporare la gestione di un'offerta linguistica strutturata, che resta di competenza del dominio Servizi.

---

## 10. Verifica, fonti e affidabilità

Coerente con l'approccio già adottato in `logical/imprese.md` §8 e in `logical/appartenenze.md` §10, la verifica in questo dominio non è un singolo indicatore, ma un insieme di **assi indipendenti**:

- **Presenza effettiva nel mercato** — la piattaforma ha potuto confermare che l'Impresa opera realmente nel Mercato dichiarato.
- **Attività dichiarata** — la piattaforma ha potuto confermare che l'Attività internazionale dichiarata (§5) corrisponde a quella realmente svolta.
- **Relazione commerciale** — la piattaforma ha potuto confermare l'esistenza di una specifica Relazione commerciale internazionale dichiarata.
- **Sede o struttura estera** — la piattaforma ha potuto confermare l'esistenza reale di una sede o struttura stabile nel Mercato.
- **Esportazione o importazione** — la piattaforma ha potuto confermare che i flussi dichiarati (in una direzione o nell'altra) sono reali.
- **Partner indicato** — la piattaforma ha potuto confermare che il soggetto indicato come partner, distributore, agente o simile riconosce la relazione.
- **Esperienza della Persona** — la piattaforma ha potuto confermare l'esperienza dichiarata da una Persona rispetto a un Mercato.
- **Competenza linguistica** — la piattaforma ha potuto confermare la competenza linguistica dichiarata come rilevante per il Mercato (distinta dalla semplice dichiarazione di LinguaParlata nel dominio Persone, §9).
- **Appartenenza a reti o istituzioni** — la piattaforma ha potuto confermare che il soggetto è realmente riconosciuto da una Risorsa di supporto al mercato (§2, §6) o da una rete/associazione dichiarata.
- **Interesse futuro** — a differenza degli assi precedenti, l'Interesse di mercato (§4) non è per sua natura verificabile come "vero o falso": può essere confermato solo come dichiarazione realmente espressa (non come previsione), coerente con l'assenza di un evento "InteresseMercatoVerificato" al §14.

**Fonti previste.**
- Dichiarazione dell'Impresa;
- dichiarazione della Persona;
- documentazione commerciale (es. contratti, fatture, documenti di trasporto, considerati come categoria di fonte, non come oggetto tecnico da archiviare);
- fonti pubbliche (registri, statistiche ufficiali);
- enti istituzionali (camere di commercio, ambasciate, consolati);
- associazioni;
- partner verificati (una Relazione commerciale già confermata può diventare essa stessa fonte per un'altra dichiarazione);
- redazione della piattaforma;
- importazioni informative (dati acquisiti in blocco da una fonte esterna strutturata, es. un elenco istituzionale di imprese esportatrici).

**Perché non un badge unico.** Un badge generico "presenza internazionale verificata" nasconderebbe quale specifico aspetto è stato confermato: un'Impresa può avere l'Attività dichiarata verificata ma nessuna verifica sulla Sede estera; una Persona può avere l'Esperienza confermata ma nessuna verifica sulla Competenza linguistica. Mantenere gli assi separati, ciascuno con la propria Fonte e la propria Evidenza (§2), permette di comunicare con precisione cosa la piattaforma sa per certo — coerente con il medesimo principio già adottato per Imprese e per Appartenenze.

---

## 11. Visibilità e pubblicazione

- **Informazione privata** — nota solo al soggetto che l'ha dichiarata.
- **Informazione visibile ai soggetti coinvolti** — nota anche alla controparte di una Relazione commerciale internazionale (§6), quando applicabile.
- **Informazione visibile alla redazione** — portata a conoscenza della redazione o della moderazione, tipicamente per una verifica o una gestione di contestazione, senza essere ancora pubblica.
- **Informazione condivisibile con partner** — resa visibile a Partner della piattaforma (Domain Model, dominio Partnership) con un titolo specifico per riceverla, senza essere pubblica in senso generale.
- **Informazione pubblica** — visibile a chiunque consulti la scheda dell'Impresa, il profilo della Persona o la pagina del Mercato.
- **Informazione aggregabile dall'Osservatorio** — utilizzabile in forma statistica e aggregata, anche quando la singola informazione non è pubblica, purché non permetta di identificare il soggetto o la relazione specifica (§12).
- **Relazione riservata** — una Relazione commerciale o una Presenza che il soggetto ha scelto di non rendere pubblica, per ragioni competitive o di opportunità.
- **Relazione contestata** — una relazione che, per quanto eventualmente mostrata, è oggetto di una contestazione in corso (§7): non deve essere presentata con la stessa sicurezza di una relazione non contestata.
- **Interesse di mercato non pubblico** — un Interesse dichiarato (§4) che il soggetto preferisce non condividere pubblicamente, ad esempio per non rivelare anticipatamente un piano di espansione.

**Principio di non automaticità.** La pubblicazione di clienti, fornitori, partner, volumi o relazioni commerciali **non deve mai essere automatica**: ogni informazione di questo tipo richiede una scelta esplicita di visibilità da parte di chi l'ha dichiarata (coerente con il principio "nessuna dichiarazione deve diventare automaticamente un fatto pubblico" già stabilito in `logical/appartenenze.md` §12).

**Coerenza con Impresa, Persona e relazione coinvolta.** La visibilità di un'informazione di questo dominio non può mai eccedere quella consentita dai soggetti che coinvolge: una Presenza o un'Attività internazionale collegata a un'Impresa non pubblica non può essere pubblica; una relazione che coinvolge una Persona con profilo non pubblico non può essere pubblica; una Relazione commerciale che coinvolge un'Appartenenza non visibile pubblicamente (`logical/appartenenze.md` §11) non può eccedere quella visibilità. Questo principio è coerente con quanto già stabilito per Imprese (§9 di `logical/imprese.md`) e per Appartenenze (§11 di `logical/appartenenze.md`).

---

## 12. Regole e invarianti di dominio

1. Un Mercato internazionale può esistere indipendentemente da una specifica Impresa: è governance centrale, non creato né posseduto da un singolo utente (§1, §3).
2. Un'Impresa può essere collegata a più Mercati, con Presenze, Interessi o Attività di natura anche diversa verso ciascuno.
3. Più Imprese possono operare nello stesso Mercato, senza alcun limite o esclusiva.
4. Presenza e Interesse sono concetti distinti (§4): l'esistenza di un Interesse non implica una Presenza, e una Presenza non richiede che sia mai esistito un Interesse formalmente dichiarato in precedenza.
5. Importazione ed esportazione sono attività differenti (§5): la dichiarazione di una non implica né dimostra l'altra.
6. L'origine di una Persona non dimostra la presenza dell'Impresa in un Mercato (§9): la presenza deve essere dichiarata e, se necessario, verificata autonomamente (§10).
7. La conoscenza di una lingua non dimostra competenza commerciale (§9): sono assi di verifica distinti (§10).
8. Una relazione dichiarata non equivale a una relazione verificata (§7, §10): la dichiarazione produce lo stato "Dichiarata", non lo stato "Confermata".
9. Un interesse futuro non deve essere presentato come attività già esistente (§4, §7): la distinzione tra i due assi editoriale/economico deve restare visibile a chi consulta l'informazione.
10. Una relazione commerciale può essere riservata (§11): la sua esistenza nel dominio non implica alcun obbligo di pubblicazione.
11. La visibilità di un'informazione di mercato non può superare quella dei soggetti coinvolti (§11).
12. La cessazione di una presenza (Conclusa, Interrotta) non deve cancellarne automaticamente lo storico: resta un dato conservato e consultabile secondo le regole di visibilità applicabili (§7, §11).
13. Mercati Internazionali non assegna diritti di accesso: ogni fatto qui registrato è un fatto di business, non un permesso tecnico (coerente con `logical/appartenenze.md` §1, §15).
14. Il dominio deve poter supportare analisi aggregate (Osservatorio) senza rivelare informazioni riservate: l'aggregazione statistica non equivale alla pubblicazione delle singole informazioni che la compongono (§11).
15. Un Paese può appartenere a più Mercati definiti in modo diverso, e un Mercato può comprendere più Paesi: non esiste una corrispondenza biunivoca obbligatoria tra Paese e Mercato (§3).
16. Un'Esigenza di internazionalizzazione non è né un'Opportunità né una Collaborazione: può generarle, senza che questo dominio ne acquisisca la proprietà (§8).
17. Nessuna Relazione commerciale internazionale, Presenza o Interesse può eccedere, nella propria visibilità pubblica, quella dell'Impresa, della Persona o dell'Appartenenza coinvolta (§11).

---

## 13. Casi limite

**Impresa che esporta senza avere una sede estera.** Configurazione piena e comune: una PresenzaDiMercato di natura Esportazione (§5) non richiede alcuna Attività di tipo Investimento diretto o sede stabile.

**Impresa che vende tramite marketplace internazionale.** Rientra nel Commercio elettronico transfrontaliero (§5); il marketplace stesso può essere qualificato come Canale di accesso al mercato (§2).

**Esportazione occasionale.** Corrisponde alla configurazione "mercato servito occasionalmente" (§4): una Presenza reale ma senza continuità, distinta da un'Attività Consolidata (§7).

**Importazione da più Paesi.** Un'Impresa può avere più PresenzaDiMercato di natura Importazione, verso Mercati distinti, senza alcuna esclusiva o limite (§12, regola 2).

**Presenza tramite distributore.** Corrisponde alla configurazione "mercato raggiunto tramite intermediari" (§4): il distributore è referenziato come controparte di una Relazione commerciale internazionale (§6) e, se opportuno, come Canale di accesso al mercato.

**Presenza tramite società collegata.** Una società collegata operante nel Mercato può essere, secondo il caso, un'Impresa distinta sulla piattaforma (con una propria Presenza) oppure un soggetto esterno referenziato come controparte di una Relazione commerciale: il dominio non forza una scelta unica, ma richiede che la natura della relazione (partecipazione societaria, §5) sia dichiarata esplicitamente.

**Persona con forti relazioni in un Paese ma Impresa non ancora attiva.** Il dominio ammette che una Persona dichiari competenze, esperienza o reti relative a un Mercato (§9) indipendentemente dal fatto che una specifica Impresa a cui è collegata (tramite Appartenenza) abbia già una Presenza o anche solo un Interesse in quel Mercato: sono fatti dichiarabili separatamente.

**Impresa interessata a un mercato ma senza progetto concreto.** Corrisponde a un InteresseDiMercato nello stato "Segnalata" o "Dichiarata" (§7), senza che sia stata mai raggiunta la fase "In valutazione" o "Pianificata".

**Mercato rappresentato da un'area economica e non da un solo Paese.** Previsto esplicitamente al §3: un Mercato può essere definito come un'Area geografica o economica senza corrispondere a un singolo Paese.

**Paese appartenente a più aree economiche.** Previsto esplicitamente al §12, regola 15: un Paese può comparire in più Mercati definiti secondo criteri diversi (es. un'unione economica e, separatamente, un'area linguistica).

**Territori contesi o con riconoscimento internazionale non uniforme.** Il dominio non impone una posizione politica: un Paese o territorio con riconoscimento non uniforme può essere trattato come Paese di riferimento (§2) sulla base di una convenzione editoriale esplicita e documentata dalla piattaforma, mantenendo la possibilità di rivedere tale convenzione senza che ciò invalidi le relazioni già dichiarate (che restano storicizzate, §12).

**Relazioni commerciali riservate.** Previste esplicitamente al §11: una Relazione commerciale internazionale può esistere nel dominio senza mai diventare pubblica.

**Partner che contesta la relazione dichiarata.** Corrisponde allo stato "Contestata" (§7): la controparte di una Relazione commerciale internazionale può negarne l'esistenza o la natura dichiarata, generando l'evento RelazioneCommercialeContestata (§14).

**Fonte pubblica non aggiornata.** Trattato al §10 (Fonte) e in `logical/appartenenze.md` §13 per analogia: l'Evidenza basata su una fonte obsoleta deve poter essere messa in dubbio senza che questo equivalga automaticamente a una contestazione tra le parti direttamente coinvolte.

**Impresa cessata con storico internazionale rilevante.** Le relazioni di mercato di un'Impresa cessata (stato operativo definito in `logical/imprese.md` §5) transitano verso Conclusa o Interrotta e restano storicizzate (§7, §12), potendo restare visibili in forma storica anche quando l'Impresa stessa è archiviata.

**Cambio di denominazione o confini di un Paese.** Il Paese, come entità di riferimento a governance centrale (§2), può essere aggiornato nella propria denominazione senza che questo invalidi le relazioni già dichiarate verso di esso; un cambio di confini più sostanziale (es. una scissione) è una questione di governance del catalogo dei Paesi, non risolta da questo documento (§15).

**Sanzioni, embarghi o limitazioni commerciali.** Il dominio può registrare l'esistenza di una limitazione come un fatto rilevante per un Mercato o per una specifica Attività (es. sospensione forzata di un'Attività, §7), senza che questo documento ne definisca la fonte istituzionale di riferimento (questione aperta, §15).

**Attività internazionale svolta esclusivamente online.** Rientra pienamente nel Commercio elettronico transfrontaliero o nella Fornitura di servizi (§5): non richiede alcuna presenza fisica per essere una Presenza di mercato legittima.

**Servizi prestati dall'Italia a clienti esteri.** Corrisponde a un'Attività di Fornitura di servizi o Consulenza (§5) con direzione verso l'esterno, pienamente equivalente concettualmente a un'esportazione anche quando il bene scambiato non è fisico.

**Investimenti esteri senza attività commerciale.** Corrisponde a un'Attività di Investimento diretto o Partecipazione societaria (§5) che può esistere senza alcuna Attività commerciale associata (es. un investimento puramente finanziario).

**Comunità della diaspora non coincidente con un mercato nazionale.** Un'Area culturale (§3) legata a una comunità della diaspora può essere rilevante per il dominio (es. come rete di relazioni, §6, §9) senza che coincida con un singolo Mercato nazionale: il dominio ammette che un'Area culturale sia referenziata trasversalmente a più Mercati, o come proprio criterio di aggregazione distinto (questione aperta, §15).

**Persona che conosce la lingua ma non il mercato.** Configurazione esplicitamente prevista dal principio di non automatismo (§9): la LinguaParlata non implica alcuna Esperienza nel Paese né alcuna Conoscenza delle pratiche commerciali, che restano dichiarabili e verificabili separatamente.

**Impresa che opera in Italia per clienti stranieri senza esportare.** Corrisponde al caso "Servizi prestati dall'Italia a clienti esteri" quando il beneficiario si trova temporaneamente in Italia (es. turismo, formazione erogata in Italia a partecipanti stranieri): può essere rilevante per il dominio come Relazione commerciale internazionale anche in assenza di un flusso di esportazione in senso stretto.

---

## 14. Eventi di dominio

- **MercatoDefinito** — un nuovo Mercato è stato costituito come ecosistema di riferimento sulla piattaforma.
- **AreaEconomicaDefinita** — una nuova Area geografica o economica è stata definita come possibile componente o criterio di definizione di un Mercato.
- **PresenzaMercatoDichiarata** — un'Impresa o una Persona ha formalizzato una Presenza in un Mercato.
- **PresenzaMercatoVerificata** — uno o più assi di verifica di una Presenza dichiarata sono stati confermati.
- **PresenzaMercatoContestata** — una Presenza dichiarata è stata messa in dubbio.
- **InteresseMercatoDichiarato** — un'Impresa o una Persona ha formalizzato un Interesse verso un Mercato, senza che costituisca ancora una Presenza operativa.
- **AttivitàInternazionaleAvviata** — un'Attività internazionale classificata (§5) ha avuto concretamente inizio.
- **AttivitàInternazionaleModificata** — la classificazione, il Canale di accesso o altre proprietà rilevanti di un'Attività sono cambiate.
- **AttivitàInternazionaleSospesa** — un'Attività è stata temporaneamente resa non operativa.
- **AttivitàInternazionaleConclusa** — un'Attività è terminata, in modo ordinario o non pianificato (§7).
- **RelazioneCommercialeDichiarata** — è stata formalizzata una relazione con un soggetto esterno specifico (cliente, fornitore, distributore, agente, partner, investitore).
- **RelazioneCommercialeConfermata** — la controparte, o una fonte terza attendibile, ha confermato l'esistenza della relazione dichiarata.
- **RelazioneCommercialeContestata** — la controparte, o un terzo con titolo per farlo, ha messo in dubbio la relazione dichiarata.
- **EsigenzaInternazionalizzazioneRegistrata** — un'Impresa o una Persona ha dichiarato un bisogno concreto relativo a un Mercato (§8), potenzialmente generatore di un'Opportunità o di una Collaborazione in altri domini.
- **FonteMercatoAggiornata** — la Fonte o l'Evidenza a supporto di un'informazione di questo dominio è stata aggiornata, confermata o segnalata come obsoleta (§10, §13).
- **VisibilitàInformazioneMercatoModificata** — il livello di visibilità di un'informazione di questo dominio è cambiato (§11).

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Notifiche, Ricerca, Osservatorio) possono voler conoscere per reagire — ad esempio, l'Osservatorio può aggiornare le proprie statistiche aggregate alla comparsa di una nuova PresenzaMercatoVerificata, o le Notifiche possono informare chi gestisce una Risorsa di supporto al mercato dell'apparizione di una nuova EsigenzaInternazionalizzazioneRegistrata compatibile — senza che questo dominio debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate.**

1. Mercati Internazionali è un dominio autonomo, non un attributo dell'Impresa: esiste e ha significato indipendentemente da qualsiasi singola Impresa (§1, §12).
2. È uno dei pilastri strategici della piattaforma insieme a Persone, Imprese e Opportunità (con le Collaborazioni ad essa collegate), coerente con il ruolo Core già attribuito dal Domain Model.
3. Non è un semplice attributo dell'Impresa: è un dominio con proprie entità (Mercato, Paese, Presenza, Interesse, Attività, Relazione commerciale, Esigenza, Risorsa di supporto), proprie regole e un proprio ciclo di vita.
4. `MercatoImpresa`, già anticipato in `logical/imprese.md`, rappresenta il collegamento tra un'Impresa e un Mercato definito in questo dominio: non è una duplicazione interna del dominio Mercati Internazionali, ma la relazione (concettualmente equivalente a PresenzaDiMercato/InteresseDiMercato, §2, §4) vista dal lato Impresa.
5. Paese e Mercato internazionale non sono necessariamente sinonimi (§3): un Mercato può comprendere più Paesi, un Paese può appartenere a più Mercati.
6. Presenza, Interesse ed Esigenza sono concetti distinti (§4, §8): nessuno dei tre implica automaticamente gli altri due.
7. Le relazioni commerciali possono essere pubbliche, riservate o contestate (§11, §7): la loro esistenza nel dominio non implica alcun obbligo di pubblicazione né alcuna garanzia di veridicità.
8. Le competenze linguistiche e culturali non possono essere dedotte automaticamente dall'origine della Persona (§9): ogni competenza, esperienza o relazione deve essere dichiarata o verificata autonomamente.
9. Mercati Internazionali non incorpora Opportunità, Collaborazioni, Eventi o Contenuti Editoriali (§1, §8): può generarli o essere da essi referenziato, restando sempre un dominio distinto.
10. Mercati Internazionali non assegna diritti di accesso: ogni fatto qui registrato è un fatto di business, la cui traduzione in permesso tecnico appartiene esclusivamente al futuro dominio Identità & Accessi (§1, §12).
11. Lo storico delle relazioni internazionali deve poter essere conservato anche dopo conclusione, interruzione o archiviazione (§7, §12).
12. Il dominio supporta le analisi aggregate dell'Osservatorio senza compromettere informazioni personali o commerciali riservate: l'aggregazione statistica è distinta dalla pubblicazione delle singole informazioni (§11, §12).
13. Il modello supporta importazione, esportazione, investimenti, servizi internazionali, distribuzione, partnership e presenza digitale, senza limitarsi alle sole esportazioni (§5).
14. Il modello può rappresentare il ruolo economico delle comunità imprenditoriali e della diaspora (§3, §9, §13), senza stereotipi o automatismi legati all'origine delle Persone.
15. I servizi linguistici restano accessori e trasversali alle attività economiche (§9): questo dominio non li gestisce come offerta strutturata.

**Domande aperte.**

- Quale livello di granularità geografica devono avere i Mercati (Paese singolo, area, corridoio) come impostazione predefinita della piattaforma, e chi decide quando introdurne uno nuovo?
- Come devono essere gestite le aree economiche sovrapposte, quando uno stesso Paese appartiene a più Mercati definiti secondo criteri diversi (§3, §12, regola 15)?
- Quale criterio distingue in modo operativo una presenza occasionale da una presenza stabile (§4), oltre alla descrizione qualitativa già fornita?
- Quale soglia, se necessaria, permette di dichiarare un Mercato "attivo" per una determinata Impresa, distinguendolo da una semplice Attività Avviata (§7)?
- I volumi di importazione ed esportazione devono essere rappresentati come un dato strutturato del dominio, o restare fuori dal modello nella sua prima versione, per la loro natura commercialmente sensibile?
- Come devono essere trattati i dati commercialmente sensibili (volumi, condizioni contrattuali, identità di clienti/fornitori) in termini di conservazione e non solo di visibilità (§11)?
- Con quale processo si verifica concretamente una relazione con un partner estero, quando questo non ha alcuna presenza diretta sulla piattaforma?
- Come deve essere gestita la presenza di Paesi soggetti a sanzioni o limitazioni commerciali (§13): il dominio deve prevedere uno stato dedicato, o trattarlo come un caso di Interruzione (§7) qualificato da una causa esterna?
- Qual è il rapporto esatto, in termini di responsabilità e di dati condivisi, tra Mercati Internazionali e Collaborazioni?
- Qual è il rapporto esatto tra Mercati Internazionali e Opportunità, in particolare quando un'Opportunità nasce da un'Esigenza di internazionalizzazione (§8)?
- Qual è il rapporto esatto tra Mercati Internazionali ed Eventi, in particolare per le fiere e le missioni internazionali dedicate a un Mercato specifico?
- Come devono essere gestite concretamente le fiere e le missioni internazionali: come Eventi che referenziano un Mercato, o come una categoria propria di Risorsa di supporto al mercato?
- Come deve essere trattato in modo operativo il confine tra competenza linguistica/culturale dichiarata in questo dominio e LinguaParlata/LinguaOperativaImpresa già dichiarate in Persone e Imprese, per evitare duplicazioni (§9)?
- Quali informazioni di questo dominio, esattamente, potranno essere utilizzate dall'Osservatorio, e con quale livello di aggregazione o anonimizzazione (§1, §12)?
- Con quale criterio la piattaforma seleziona e mantiene aggiornate le fonti pubbliche e istituzionali utilizzate come riferimento (§10)?
- Dopo quanto tempo un'Evidenza di verifica deve considerarsi scaduta e richiedere un nuovo controllo?
- Come devono essere presentati i Mercati storici non più attivi per una determinata Impresa o Persona, quando restano rilevanti per la narrazione del percorso ma non per l'attività corrente (§7, §12)?

Queste domande restano decisioni progettuali future, coerenti con l'approccio già adottato in `logical/persone.md`, `logical/imprese.md` e `logical/appartenenze.md`.

