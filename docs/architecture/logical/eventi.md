# Logical Data Model — Dominio EVENTI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md).
> Scopo del documento: definire il modello logico del dominio Eventi, già anticipato in `docs/domain-model.md` §1 come dominio di "Supporto" ("rappresentare momenti di aggregazione nel tempo... e la partecipazione ad essi") e richiamato come questione aperta in `logical/opportunita.md` §15 e in `logical/collaborazioni.md` §1/§15. Questo documento conferma Eventi come dominio autonomo e ne definisce la struttura logica completa.
> Carattere autonomo del dominio. Eventi rappresenta il fatto organizzato nel tempo: un'iniziativa con un'identità propria, una finalità, un organizzatore, una collocazione temporale e una modalità di partecipazione. Non è un contenitore per altri domini, ma un dominio con una propria natura, un proprio ciclo di vita e proprie regole.
> Distinzione da Opportunità, Collaborazioni e Contenuti editoriali. Un Evento può presentare un'Opportunità (`logical/opportunita.md`), può facilitare o generare una Collaborazione (`logical/collaborazioni.md`), e può essere descritto da un contenuto editoriale — ma nessuno di questi rapporti implica incorporazione. Il dominio Eventi rappresenta **il fatto organizzato nel tempo**; il contenuto editoriale rappresenta **il racconto o la comunicazione** dell'Evento; l'Opportunità rappresenta **il beneficio accessibile**; la Collaborazione rappresenta **la relazione ricercata o avviata** tra soggetti. Sono quattro nature distinte, che possono coesistere attorno allo stesso accadimento senza fondersi.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API o interfaccia.

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Eventi rappresenta iniziative collocate nel tempo — organizzate per informare, formare, mettere in relazione, promuovere, presentare Opportunità o sviluppare attività economiche e professionali — insieme a tutto ciò che ne struttura la partecipazione: chi le organizza, quando e dove si svolgono, come vi si partecipa, e chi vi partecipa.

**Quali problemi risolve.** Rende possibile organizzare, pubblicare e trovare un'iniziativa collocata nel tempo secondo criteri precisi (tipologia, territorio, modalità, lingua, §4, §11); distingue sempre l'Evento come fatto organizzato dal contenuto che lo racconta, dall'Opportunità che eventualmente presenta e dalla Collaborazione che eventualmente favorisce (introduzione); gestisce la complessità delle edizioni ricorrenti, delle sessioni multiple e dei programmi articolati (§6) senza perdere lo storico; distingue con precisione iscrizione, invito, accreditamento e partecipazione effettiva (§9), evitando di presumere l'uno dall'altro.

**Cosa rientra nel dominio.** L'Evento e le sue Edizioni, Sessioni e Programma (§2, §6); gli Organizzatori e i soggetti coinvolti con i relativi ruoli (§5); la temporalità e la ricorrenza (§7); le modalità di partecipazione, i luoghi e i collegamenti online (§8); le iscrizioni, gli inviti e le partecipazioni (§9); i collegamenti — non l'incorporazione — verso Opportunità, Collaborazioni e attività formative (§10); i collegamenti con Mercati internazionali, territori, settori e lingue (§11); il ciclo di vita, la verifica e la visibilità dell'Evento (§12).

**Cosa NON rientra nel dominio.**
- Non rientrano le **Opportunità**: un Evento può presentare una o più Opportunità (`logical/opportunita.md`), ma l'Opportunità resta un'entità distinta con un proprio ciclo di vita, referenziata e non incorporata (§10).
- Non rientrano le **Collaborazioni**: un Evento può facilitare o generare una Collaborazione (`logical/collaborazioni.md`), ma la relazione tra i soggetti coinvolti appartiene a quel dominio, non a questo (§10).
- Non rientrano i **Contenuti editoriali**: un Evento può essere descritto, raccontato o annunciato da un contenuto editoriale, ma il contenuto non è l'Evento, e l'Evento non è il contenuto che lo descrive (§3, §13).
- Non rientra la **Formazione** come dominio autonomo: un corso o un percorso formativo può essere modellato come Evento per la propria dimensione temporale (data, luogo, iscrizioni), ma gli obiettivi didattici, i contenuti, le competenze trasferite e gli esiti formativi eccedono il perimetro di questo dominio e possono richiedere un futuro dominio Formazione autonomo (§10, questione aperta §15).
- Non rientrano le **Persone**, le **Imprese**, le **Appartenenze** e i **Professionisti**: sono sempre referenziati come soggetti organizzatori o partecipanti (§5, §9), senza che questo dominio ne duplichi i dati.
- Non rientrano i **Mercati internazionali**: un Evento può riferirsi a uno o più Mercati (§11), referenziati senza essere incorporati.
- Non rientrano **luoghi e immobili**: il dominio referenzia un luogo (§8) senza gestirne la scheda descrittiva, la disponibilità o la proprietà, responsabilità di un eventuale futuro dominio Luoghi o Immobiliare.
- Non rientra il **ticketing**: il dominio rappresenta l'iscrizione e l'accreditamento come fatti di dominio (§9), non un sistema di biglietteria con emissione, validazione o controllo d'ingresso.
- Non rientrano i **pagamenti**: il dominio rappresenta che un Evento è gratuito o a pagamento come condizione dichiarata (§8), non gestisce transazioni, fatturazione o incassi.
- Non rientra la **messaggistica**: la comunicazione privata tra organizzatori e partecipanti resta fuori dal perimetro, coerente con `logical/collaborazioni.md` §1.
- Non rientra il **calendario personale**: la vista aggregata degli Eventi a cui una Persona partecipa o è interessata è una funzione derivata che consulta questo dominio, non una responsabilità di questo dominio.
- Non rientrano **Identità & Accessi**: nessuna informazione di questo dominio genera di per sé un permesso tecnico o una rappresentanza (§13).
- Non rientra l'**Osservatorio**: il dominio lo alimenta con dati aggregabili, senza produrre esso stesso report o statistiche.

**Quali domini utilizza.**
- **Persone, Imprese, Professionisti** — per referenziare organizzatori, relatori, sponsor e partecipanti (§5, §9).
- **Appartenenze** — per contestualizzare quando una Persona agisce per conto di un'Impresa o di un'organizzazione (§5, §9, §13).
- **Opportunità** — per referenziare le Opportunità eventualmente presentate durante un Evento (§10).
- **Collaborazioni** — per referenziare le Collaborazioni eventualmente generate da un Evento (§10).
- **Mercati Internazionali** — per referenziare i Mercati eventualmente trattati (§11).
- **Tassonomia Condivisa** — per settori, territori e lingue (§11).

**Quali domini utilizzano Eventi.**
- **Contenuti Editoriali** — per raccontare, annunciare o raggruppare uno o più Eventi.
- **Opportunità** — un'Opportunità può richiamare un Evento come contesto (`logical/opportunita.md` §13), senza che il dominio Eventi ne gestisca la relazione.
- **Collaborazioni** — una Collaborazione può nascere in occasione di un Evento (§10), referenziato senza incorporazione.
- **Mercati Internazionali** — un Mercato può referenziare gli Eventi che lo riguardano.
- **Ricerca**, **Notifiche**, **Osservatorio** — per rendere gli Eventi trovabili, per segnalare fatti rilevanti (§14) e per aggregare dati statistici.

**Perché Eventi è un dominio autonomo.** Un Evento ha una propria identità riconoscibile distinta da qualsiasi comunicazione che lo riguardi (§3), una struttura di edizioni e sessioni che nessun altro dominio replica (§6), una temporalità con proprie regole di rinvio, sospensione e cancellazione (§7), un modello di partecipazione multi-fase (manifestazione di interesse → iscrizione → invito → accreditamento → partecipazione effettiva, §9) e un ciclo di vita su sei assi distinti (§12). Comprimere l'Evento in un attributo di un altro dominio (una categoria di contenuto editoriale, o un campo descrittivo di un'Opportunità) impedirebbe di rispondere a domande proprie del dominio — quante edizioni ha avuto, chi vi partecipa, quali posti restano disponibili — e di trattarlo come lo strumento operativo trasversale che la sua missione richiede (introduzione strategica).

**Differenza tra Evento, Opportunità, Collaborazione, Contenuto editoriale, corso e calendario personale.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Evento | Iniziativa collocata nel tempo (questo documento) | Ha una collocazione temporale, un organizzatore e una modalità di partecipazione (§3); è il fatto organizzato |
| Opportunità | Possibilità strutturata (`logical/opportunita.md`) | Ha un beneficio e una procedura di accesso; un Evento può presentarla senza coincidere con essa |
| Collaborazione | Relazione ricercata o avviata tra soggetti (`logical/collaborazioni.md`) | Nasce da un incontro diretto tra soggetti; un Evento può facilitarla senza incorporarla |
| Contenuto editoriale | Testo o narrazione (Domain Model, dominio Contenuti Editoriali) | Racconta o comunica l'Evento; non è l'Evento stesso (§3) |
| Corso | Attività con finalità formativa | Può essere modellato come Evento per la propria dimensione temporale; gli esiti didattici eccedono questo dominio (§10) |
| Calendario personale | Vista derivata | Aggrega gli Eventi rilevanti per una Persona; è una funzione che consulta questo dominio, non un concetto proprio di esso |

---

## 2. Entità e concetti principali

| Concetto | Natura | Sintesi |
|---|---|---|
| Evento | Entità autonoma (aggregate root) | L'iniziativa nella sua identità generale, indipendente dalle singole edizioni (§6). |
| Edizione dell'Evento | Entità dipendente | Una specifica occorrenza di un Evento ricorrente, con propria data, luogo, programma e organizzatori (§6). |
| Sessione | Entità dipendente | Una parte interna di un'Edizione (una giornata, un intervento, un laboratorio), con propria collocazione temporale (§6). |
| Programma | Concetto descrittivo (value object) | L'insieme ordinato delle Sessioni di un'Edizione. |
| Organizzatore | Ruolo | Il soggetto che assume la responsabilità primaria dell'Evento o dell'Edizione (§5). |
| Co-organizzatore | Ruolo | Un soggetto che condivide la responsabilità organizzativa (§5). |
| Promotore | Ruolo | Un soggetto che diffonde o sostiene l'Evento senza assumerne la responsabilità organizzativa diretta (§5). |
| Partner | Ruolo | Un soggetto che contribuisce all'Evento con risorse, contenuti o visibilità (§5). |
| Sponsor | Ruolo | Un soggetto che sostiene economicamente l'Evento (§5). |
| Relatore | Ruolo | Un soggetto che interviene con un proprio contributo in una Sessione (§5). |
| Moderatore | Ruolo | Un soggetto che conduce una Sessione (§5). |
| Partecipante | Ruolo | Un soggetto la cui presenza è prevista o registrata (§9). |
| Pubblico destinatario | Concetto descrittivo | A chi l'Evento è pensato di rivolgersi, indipendentemente da chi effettivamente vi parteciperà. |
| Modalità di partecipazione | Concetto descrittivo (classificazione) | In presenza, online o ibrida (§8). |
| Iscrizione | Entità dipendente | La richiesta di partecipazione formalizzata da un soggetto (§9). |
| Invito | Entità dipendente | Una proposta di partecipazione avanzata dall'Organizzatore verso un soggetto specifico (§9). |
| Accreditamento | Entità dipendente | La conferma amministrativa che un soggetto è autorizzato a partecipare (§9). |
| Capienza | Concetto descrittivo (value object) | Il numero massimo di partecipanti previsto per un'Edizione o una Sessione. |
| Lista di attesa | Concetto descrittivo | L'insieme di soggetti in attesa che si liberi un posto (§9). |
| Luogo | Relazione | Il riferimento a una localizzazione fisica, senza incorporare un futuro dominio Luoghi o Immobiliare (§8). |
| Collegamento online | Concetto descrittivo (value object) | Il riferimento alla modalità di partecipazione da remoto (§8). |
| Periodo | Concetto descrittivo (value object) | Data di inizio ed eventuale data di fine dell'Evento o dell'Edizione (§7). |
| Orario | Concetto descrittivo (value object) | L'ora di inizio ed eventuale ora di fine, con relativo fuso orario (§7). |
| Ambito territoriale | Relazione | Il collegamento con uno o più Territori, distinguendo dove l'Evento si svolge da a chi si rivolge (§11). |
| Ambito settoriale | Relazione | Il collegamento con uno o più Settori (Tassonomia Condivisa). |
| Mercato internazionale di riferimento | Relazione | Il collegamento, quando pertinente, con un Mercato internazionale (§11), referenziato senza essere incorporato. |
| Lingua dell'Evento | Relazione | La lingua o le lingue in cui l'Evento si svolge (§11). |
| Costo o condizione economica | Concetto descrittivo (value object) | Se e come la partecipazione ha un costo (§8), senza gestire pagamenti o fatturazione. |
| Fonte | Entità dipendente | Da dove proviene un'informazione dichiarata in questo dominio (§12), analoga per ruolo alla Fonte già definita negli altri domini logici. |
| Evidenza | Entità dipendente | Ciò che sostiene concretamente una verifica (§12), analoga per ruolo all'Evidenza già definita negli altri domini logici. |
| Stato reale | Asse di stato, non entità | Dove si trova l'Evento nel proprio percorso effettivo (§12). |
| Stato editoriale | Asse di stato, non entità | La fase redazionale con cui l'Evento è stato dichiarato e pubblicato (§12). |
| Stato di verifica | Asse di stato, non entità | Quanto la piattaforma può confermare rispetto a quanto dichiarato (§12). |
| Visibilità | Asse di stato, non entità | Chi può conoscere l'esistenza e i dettagli dell'Evento (§12). |

**Entità autonome, concetti descrittivi, ruoli e relazioni.**
- **Entità autonome**: Evento, Edizione, Sessione, Iscrizione, Invito, Accreditamento, Fonte, Evidenza.
- **Concetti descrittivi (value object)**: Programma, Modalità di partecipazione, Capienza, Lista di attesa, Collegamento online, Periodo, Orario, Costo o condizione economica.
- **Ruoli**: Organizzatore, Co-organizzatore, Promotore, Partner, Sponsor, Relatore, Moderatore, Partecipante — tutti riferiti a soggetti di altri domini (Persona, Impresa, Professionista) o a soggetti esterni (§5), mai nuove schede descrittive parallele.
- **Relazioni verso altri domini**: Luogo (verso un futuro dominio Luoghi/Immobiliare), Ambito territoriale e settoriale (Tassonomia Condivisa), Mercato internazionale di riferimento (Mercati Internazionali), Lingua dell'Evento (Tassonomia Condivisa).
- **Assi di stato**: Stato reale, Stato editoriale, Stato di verifica, Visibilità — a cui si aggiungono, nel ciclo di vita completo (§12), lo Stato delle iscrizioni e la Disponibilità dei posti.

**Principio di non duplicazione.** Nessuno dei concetti sopra duplica Persona, Impresa, Appartenenza, Professionista, Opportunità, Mercato internazionale o luogo fisico: Organizzatore, Relatore, Sponsor e Partecipante sono sempre ruoli che referenziano soggetti definiti altrove; il Luogo è referenziato senza essere incorporato; il Mercato internazionale di riferimento è referenziato senza essere incorporato.

---

## 3. Natura dell'Evento

**Elementi minimi che distinguono un Evento da una semplice comunicazione.**
- **Identità riconoscibile** — un nome o una denominazione propria, che lo distingue da qualsiasi menzione occasionale.
- **Finalità** — un motivo dichiarato per cui l'Evento esiste (informare, formare, promuovere, ecc., introduzione strategica).
- **Organizzatore o promotore** — un soggetto identificabile che ne assume la responsabilità o il sostegno (§5).
- **Collocazione temporale** — un Periodo, anche indicativo (§7).
- **Modalità di partecipazione** — in presenza, online o ibrida (§8).
- **Pubblico potenziale** — a chi è pensato di rivolgersi.
- **Luogo fisico o modalità online** — dove o come si svolge (§8).
- **Fonte identificabile** — da dove proviene l'informazione che lo descrive (§12).

Un contenuto che manchi di uno o più di questi elementi minimi non costituisce un Evento in senso proprio, e resta un semplice contenuto informativo (§1).

**Distinzioni.**
- **Evento programmato** — possiede tutti gli elementi minimi, con una collocazione temporale definita o indicativa.
- **Evento ipotizzato** — una possibile iniziativa futura, non ancora formalizzata con tutti gli elementi minimi (stato editoriale "Ideato", §12).
- **Annuncio di Evento** — una comunicazione che rende nota l'esistenza di un Evento programmato, distinta dall'Evento stesso.
- **Contenuto che racconta un Evento** — un contenuto editoriale (una notizia, una guida) che descrive un Evento già svolto o in corso, senza essere l'Evento stesso (§1, §10).
- **Evento già svolto** — un Evento il cui Periodo è concluso, che resta storicizzato (stato reale "Concluso" o "Archiviato", §12).
- **Registrazione o materiale derivato da un Evento** — un contenuto (video, atti, slide) prodotto in occasione o a seguito di un Evento, referenziato come materiale successivo, distinto dall'Evento stesso (§10, §13).

---

## 4. Tipologie di Evento

| Gruppo | Tipologie |
|---|---|
| Aggregazione e relazione | Networking; incontro B2B; business matching; incontro riservato |
| Conoscenza e approfondimento | Convegno; conferenza; seminario; workshop; webinar; tavola rotonda; laboratorio |
| Mostra e promozione | Fiera; esposizione; lancio; presentazione |
| Sviluppo internazionale | Missione imprenditoriale |
| Visita e osservazione | Visita aziendale |
| Istituzionale e associativo | Incontro istituzionale; assemblea; evento associativo |
| Formazione | Corso; attività formativa |
| Riconoscimento | Premiazione |
| Cultura e socialità | Evento culturale; evento sociale |
| Ambito e modalità | Evento territoriale; evento online; evento ibrido |
| Residuale | Altre iniziative compatibili con la missione della piattaforma |

**Principio.** Un Evento può appartenere a più tipologie contemporaneamente senza perdere la propria identità (es. una fiera che è anche un'occasione di business matching, o un convegno che è anche un evento territoriale): la classificazione per tipologia è un criterio di ricerca e presentazione (§12), non un vincolo esclusivo sulla natura dell'Evento.

---

## 5. Organizzatori, promotori e soggetti coinvolti

**Possibili soggetti**, referenziati e non incorporati: Persona (`logical/persone.md`); Impresa (`logical/imprese.md`); Professionista (`logical/professionisti.md`); associazione; rete imprenditoriale; ente pubblico; camera di commercio; università; fondazione; incubatore; acceleratore; organizzazione internazionale; ambasciata o consolato; fiera; ente formativo; soggetto esterno alla piattaforma (referenziato per nome, senza una scheda propria).

**Ruoli.**

| Ruolo | Significato |
|---|---|
| Organizzatore | Assume la responsabilità primaria dell'Evento o dell'Edizione |
| Co-organizzatore | Condivide la responsabilità organizzativa con l'Organizzatore |
| Promotore | Diffonde o sostiene l'Evento senza assumerne la responsabilità organizzativa diretta |
| Partner | Contribuisce con risorse, contenuti o visibilità |
| Patrocinatore | Concede un sostegno formale o istituzionale, tipicamente senza contributo economico |
| Sponsor | Sostiene economicamente l'Evento |
| Ospitante | Fornisce il Luogo in cui l'Evento si svolge |
| Relatore | Interviene con un proprio contributo in una Sessione |
| Moderatore | Conduce una Sessione |
| Facilitatore | Supporta lo svolgimento di un'attività, tipicamente interattiva (workshop, laboratorio) |
| Formatore | Conduce un'attività con finalità didattica (§10) |
| Referente organizzativo | Il punto di contatto operativo per l'Evento, non necessariamente l'Organizzatore stesso |

**Principio sulla rappresentanza.** Una Persona può agire per un'Impresa o un'altra organizzazione — come Organizzatore, Relatore, Sponsor o in qualsiasi altro ruolo — solo sulla base del titolo rappresentato nel dominio Appartenenze (`logical/appartenenze.md`): il ruolo assunto nell'Evento non genera esso stesso una relazione di rappresentanza, ma la presuppone quando la partecipazione è dichiarata "per conto di" un'Impresa (§9, §13).

---

## 6. Edizioni, sessioni e programma

| Concetto | Significato |
|---|---|
| Evento | L'identità generale dell'iniziativa, indipendente dalle singole occorrenze nel tempo |
| Edizione | Una specifica occorrenza dell'Evento, con propria data, luogo, organizzatori e programma |
| Replica | Un'ulteriore occorrenza della stessa Edizione, tipicamente identica nei contenuti ma con propria data (es. due sessioni identiche in giorni diversi per raddoppiare la capienza) |
| Sessione | Una parte interna di un'Edizione, con propria collocazione temporale (una giornata, un intervento, una tavola rotonda, un laboratorio) |
| Giornata | Una Sessione che raggruppa le attività di un singolo giorno all'interno di un'Edizione pluri-giornaliera |
| Intervento | Una Sessione che rappresenta il contributo di uno o più Relatori |
| Tavola rotonda | Una Sessione con più Relatori in confronto |
| Laboratorio | Una Sessione con partecipazione attiva dei Partecipanti |
| Appuntamento interno | Una Sessione riservata agli organizzatori, non parte del Programma pubblico |
| Programma complessivo | L'insieme ordinato delle Sessioni di un'Edizione |

**Evento ricorrente.** Un Evento ricorrente mantiene sempre:
- una propria identità generale, condivisa da tutte le Edizioni;
- più Edizioni, ciascuna con la propria collocazione temporale;
- date differenti tra un'Edizione e l'altra;
- organizzatori potenzialmente differenti tra un'Edizione e l'altra;
- luoghi potenzialmente differenti;
- programmi potenzialmente differenti;
- relatori potenzialmente differenti;
- uno storico delle Edizioni passate, sempre consultabile.

**Principio.** Una nuova Edizione non deve cancellare o sovrascrivere quella precedente (§13, regola 11): ogni Edizione resta un fatto storicizzato a sé, anche quando l'Evento generale continua a esistere e a generare nuove Edizioni.

---

## 7. Temporalità e ricorrenza

- **Data di inizio** / **Data di fine** — i confini del Periodo di un Evento o di un'Edizione.
- **Orario** — l'ora di inizio ed eventuale ora di fine.
- **Durata** — l'estensione temporale complessiva, derivabile da inizio e fine.
- **Più giornate** — un'Edizione che si estende su più Giornate (§6).
- **Evento continuativo** — un'iniziativa che si protrae senza un termine definito, con verifiche periodiche del proprio stato.
- **Evento ricorrente** — un Evento che genera più Edizioni nel tempo (§6).
- **Singola edizione** — un'Edizione che non fa parte di un ciclo ricorrente.
- **Replica** — un'ulteriore occorrenza della stessa Edizione (§6).
- **Rinvio** — lo spostamento della data a un momento successivo, mantenendo l'identità dell'Edizione.
- **Anticipazione** — lo spostamento della data a un momento anteriore a quello originariamente comunicato.
- **Sospensione** — un'interruzione temporanea e reversibile prima o durante lo svolgimento.
- **Cancellazione** — la rinuncia definitiva a un'Edizione o a una Sessione.
- **Riapertura** — il ripristino di un'Edizione precedentemente sospesa o rinviata.
- **Variazione di programma** — una modifica al Programma che non altera la collocazione temporale complessiva dell'Edizione.
- **Fuso orario** — necessario per un pubblico internazionale o per Eventi online (§8, §11).
- **Scadenza per l'iscrizione** — il termine ultimo per iscriversi, distinto dalla data dell'Evento.
- **Apertura delle iscrizioni** — il momento in cui diventa possibile iscriversi.
- **Evento senza data definitiva** — un Evento con Periodo non ancora determinato, ammesso come stato legittimo (§3, §13).
- **Evento con data indicativa** — un Periodo dichiarato come orientativo, non ancora confermato.

**Principio.** La data dell'Evento (quando si svolge) deve restare sempre distinta dalla data di pubblicazione o comunicazione (quando è stato reso noto): un Evento può essere annunciato molto prima della propria data, o pubblicato tardivamente rispetto a una data già fissata; le due informazioni non devono mai essere confuse o dedotte l'una dall'altra.

---

## 8. Modalità, luoghi e partecipazione

**Modalità.**
- **Evento in presenza** — richiede la presenza fisica in un Luogo.
- **Evento online** — si svolge tramite un Collegamento online, senza presenza fisica.
- **Evento ibrido** — combina presenza fisica e Collegamento online, tipicamente per la stessa Edizione o Sessione.

**Accesso e partecipazione.**
- **Partecipazione libera** — non richiede alcuna formalizzazione preventiva.
- **Iscrizione obbligatoria** — richiede un'Iscrizione formalizzata (§9) prima della partecipazione.
- **Partecipazione su invito** — richiede un Invito da parte dell'Organizzatore (§9).
- **Selezione** — l'accesso è soggetto a una valutazione da parte dell'Organizzatore.
- **Accreditamento** — richiede una conferma amministrativa successiva all'Iscizione (§9).
- **Lista di attesa** — un meccanismo attivo quando la Capienza è esaurita (§9).
- **Partecipazione gratuita** / **Partecipazione a pagamento** — se e come la partecipazione ha un Costo o condizione economica (§2), senza gestire pagamenti o fatturazione.
- **Quota associativa** — una condizione economica legata all'appartenenza a un'associazione o rete, distinta da un pagamento diretto per l'Evento.
- **Accesso riservato** — limitato a un insieme predefinito di soggetti (§12).
- **Capienza** — il numero massimo di partecipanti previsto.
- **Posti disponibili** / **Posti esauriti** — lo stato corrente della Capienza rispetto alle Iscrizioni o agli Accreditamenti confermati.

**Luoghi e collegamenti.**
- **Luogo dell'Evento** — dove si svolge fisicamente l'Edizione o la Sessione.
- **Sede dell'organizzatore** — la localizzazione abituale dell'Organizzatore, distinta dal Luogo dell'Evento quando questo si svolge altrove.
- **Luogo di ritrovo** — un punto di incontro preliminare, distinto dal Luogo principale (es. per una Visita aziendale).
- **Spazio fisico** — una porzione specifica del Luogo (una sala, un padiglione).
- **Piattaforma online** — il servizio tecnico tramite cui si accede al Collegamento online, referenziato senza dettagli implementativi.
- **Collegamento di partecipazione** — il riferimento specifico che permette a un singolo Partecipante di accedere all'Evento online.
- **Territorio di riferimento** — l'Ambito territoriale a cui l'Evento si rivolge, distinto dal Luogo fisico (§11).

**Principio.** Il dominio può referenziare un futuro dominio Luoghi o Immobiliare per la scheda descrittiva di un Luogo (indirizzo, caratteristiche, disponibilità), senza incorporarlo: questo dominio si limita a sapere che un Evento si svolge in un determinato Luogo, non a gestirne l'esistenza, la proprietà o la prenotabilità.

---

## 9. Iscrizioni, inviti e partecipazioni

| Concetto | Significato |
|---|---|
| Manifestazione di interesse | Un primo segnale di interesse verso un Evento, non ancora formalizzato come Iscrizione |
| Iscrizione | La richiesta di partecipazione formalizzata da un soggetto |
| Richiesta di partecipazione | Sinonimo operativo di Iscrizione quando l'accesso richiede una valutazione (Selezione, §8) |
| Invito | Una proposta di partecipazione avanzata dall'Organizzatore verso un soggetto specifico |
| Accettazione dell'invito | La risposta positiva del soggetto invitato |
| Rifiuto | La risposta negativa a un Invito, o la non ammissione a un'Iscrizione soggetta a Selezione |
| Conferma | La formalizzazione definitiva della partecipazione prevista, successiva a Iscrizione o Accettazione |
| Lista di attesa | La posizione di un soggetto la cui Iscrizione non può ancora essere confermata per Capienza esaurita |
| Accreditamento | La conferma amministrativa che un soggetto è autorizzato a partecipare, tipicamente a ridosso dell'Evento |
| Partecipazione prevista | Lo stato di un soggetto con Iscrizione, Invito accettato o Accreditamento confermato, prima dello svolgimento dell'Evento |
| Partecipazione effettiva | Il fatto, registrato a consuntivo, che il soggetto ha effettivamente preso parte all'Evento |
| Assenza | Il fatto che una Partecipazione prevista non si sia tradotta in Partecipazione effettiva |
| Cancellazione | La rinuncia del soggetto a una Partecipazione prevista, prima dello svolgimento |
| Sostituzione del partecipante | Il rimpiazzo di un soggetto con un altro a fronte della stessa Iscrizione o Invito |
| Partecipazione per conto di un'Impresa | Una Partecipazione dichiarata come rappresentativa di un'Impresa, non della sola Persona |
| Partecipazione come relatore | Una Partecipazione nel ruolo di Relatore (§5) |
| Partecipazione come organizzatore | Una Partecipazione nel ruolo di Organizzatore (§5) |

**Principi cardine.**
- **Iscrizione non equivale a partecipazione effettiva**: un'Iscrizione descrive un'intenzione formalizzata, non un fatto avvenuto.
- **Invito non equivale ad accettazione**: un Invito resta una proposta fino a una risposta esplicita.
- **Accreditamento non equivale a presenza**: un Accreditamento confermato può comunque non tradursi in una presenza effettiva (Assenza).
- **La partecipazione non attribuisce rappresentanza**: partecipare a un Evento, in qualsiasi ruolo, non genera di per sé un titolo di rappresentanza verso terzi (§13).
- **La partecipazione per conto di un'Impresa deve essere contestualizzata attraverso Appartenenze**: solo un'Appartenenza esistente (`logical/appartenenze.md`) legittima la dichiarazione "per conto di" (§5, §13).

---

## 10. Relazioni con Opportunità, Collaborazioni e Formazione

**Come un Evento può, senza incorporare.**
- **Presentare una o più Opportunità** — un'Edizione o una Sessione può avere per oggetto la presentazione di una o più Opportunità (`logical/opportunita.md`), referenziate senza essere gestite da questo dominio.
- **Facilitare Collaborazioni** — un Evento può essere il contesto in cui due o più soggetti si incontrano e avviano una Collaborazione (`logical/collaborazioni.md`), che nasce e vive come entità di quel dominio.
- **Generare manifestazioni di interesse** — una Sessione di business matching può produrre Manifestazioni di interesse verso un'Opportunità o verso l'avvio di una Collaborazione, sempre di competenza dei rispettivi domini.
- **Ospitare business matching** — una tipologia di Sessione dedicata all'incontro strutturato tra soggetti (§4, §6).
- **Offrire formazione** — una Sessione o un'intera Edizione può avere finalità didattica (Corso, attività formativa, §4).
- **Coinvolgere Professionisti** — come Relatori, Formatori o Partecipanti (`logical/professionisti.md`).
- **Supportare l'ingresso in Mercati internazionali** — una Missione imprenditoriale o una Fiera internazionale può essere il contesto in cui una Persona o un'Impresa maturano una PresenzaDiMercato (`logical/mercati-internazionali.md`).
- **Diffondere contenuti informativi** — un Evento può essere accompagnato da contenuti editoriali che lo raccontano, senza che questo dominio ne gestisca la redazione.

**Concetti da mantenere sempre distinti.**

| Concetto | Dominio | Ruolo rispetto all'Evento |
|---|---|---|
| Evento | Eventi (questo documento) | Il fatto organizzato nel tempo |
| Opportunità presentata | Opportunità | Il beneficio accessibile, referenziato dall'Evento senza esserne parte |
| Collaborazione generata | Collaborazioni | La relazione avviata tra soggetti, che può nascere in occasione dell'Evento senza appartenergli |
| Percorso formativo | Futuro dominio Formazione (questione aperta, §15) | Gli obiettivi, i contenuti e gli esiti didattici, distinti dalla dimensione temporale dell'Evento |
| Contenuto editoriale | Contenuti Editoriali | Il racconto o la comunicazione dell'Evento, non l'Evento stesso |
| Materiale successivo all'Evento | Contenuti Editoriali o Evidenza (§12) | Una registrazione, degli atti o slide prodotti dopo l'Evento, referenziati come materiale derivato (§3) |

**Corso come Evento: confine con un futuro dominio Formazione.** Un Corso può essere modellato come Evento per la propria dimensione temporale (una o più Edizioni, un Programma di Sessioni, Iscrizioni e Capienza): questo dominio è sufficiente a organizzarne la logistica. Gli obiettivi didattici, i contenuti dell'insegnamento, le competenze trasferite e la valutazione degli esiti formativi (es. un attestato, una certificazione di apprendimento) eccedono invece questo perimetro e possono richiedere un futuro dominio Formazione autonomo, che referenzierebbe l'Evento come proprio contenitore temporale senza che i due domini si sovrappongano (questione aperta, §15).

**Attenzione particolare: formazione e sicurezza sul lavoro, multilingue.** Il dominio deve poter rappresentare, come Eventi a tutti gli effetti:
- **Formazione e sicurezza sul lavoro** — corsi obbligatori o volontari in materia di sicurezza, con particolare rilievo per **edilizia e cantieri**, dove l'efficacia della formazione dipende in modo diretto dalla comprensione linguistica dei partecipanti.
- **Formazione multilingue** — Corsi e materiali resi disponibili nella lingua effettivamente compresa dai lavoratori partecipanti, non necessariamente la lingua ufficiale del territorio in cui il Corso si svolge.

**Principio.** La formazione linguistica in questo contesto deve restare **funzionale alla comprensione e alla sicurezza** dei partecipanti: il dominio Eventi rappresenta la Lingua dell'Evento e l'eventuale supporto linguistico (§11) come attributi necessari alla sicurezza e all'efficacia della formazione, senza trasformare la piattaforma in un portale generalista di traduzione o mediazione linguistica — quella funzione resta di competenza dei domini Professionisti (traduttori, mediatori, `logical/professionisti.md` §5) e di un eventuale dominio Servizi linguistici.

---

## 11. Mercati internazionali, territori, settori e lingue

**Collegamenti.** Comune; Provincia; Regione; territorio nazionale; Paese estero; area economica; Mercato internazionale (`logical/mercati-internazionali.md`); settore; filiera; pubblico internazionale; lingua principale; traduzione disponibile; interpretariato; supporto linguistico.

**Distinzioni da mantenere sempre separate.**
- **Territorio in cui si svolge l'Evento** — il Luogo fisico, o l'ambito geografico di un Evento online (§8).
- **Territorio a cui si rivolge** — l'Ambito territoriale del Pubblico destinatario (§2), che può eccedere il territorio in cui l'Evento si svolge (es. un webinar organizzato in Italia rivolto a un pubblico estero).
- **Mercato trattato** — il Mercato internazionale di riferimento come contenuto dell'Evento (es. una Missione imprenditoriale verso un Mercato specifico).
- **Provenienza dei partecipanti** — un fatto osservato a consuntivo (§9), distinto dal Pubblico destinatario dichiarato in anticipo.
- **Lingua dell'Evento** — la lingua o le lingue in cui l'Evento si svolge effettivamente.
- **Lingua dei materiali** — la lingua del Programma, delle Sessioni, o dei materiali distribuiti, che può differire dalla Lingua dell'Evento.
- **Eventuale supporto linguistico** — Traduzione o Interpretariato messi a disposizione per superare un divario tra la Lingua dell'Evento e la lingua dei Partecipanti.

**Principio di non automatismo.** Coerente con `logical/mercati-internazionali.md` §9, `logical/opportunita.md` §10 e `logical/professionisti.md` §8: il dominio non deduce automaticamente la lingua o la competenza linguistica di un Evento o dei suoi Partecipanti dall'origine delle Persone coinvolte. La Lingua dell'Evento, la Lingua dei materiali e l'eventuale Supporto linguistico devono sempre essere dichiarati esplicitamente, mai presunti.

---

## 12. Ciclo di vita, verifica e visibilità

Il percorso di un Evento (o di una sua Edizione) è descritto da **sei assi distinti**, che non devono mai essere compressi in un unico stato, coerente con l'approccio già adottato in tutti i domini logici precedenti.

**a) Stato reale.** Descrive dove si trova, nel proprio percorso effettivo, l'Evento:
- *Ideato* — un'iniziativa allo stadio di idea, senza ancora gli elementi minimi di un Evento (§3).
- *Segnalato* — un'iniziativa portata all'attenzione della piattaforma da un soggetto terzo, non ancora verificata (§13).
- *In valutazione* — l'iniziativa è in fase di analisi prima di una decisione su come procedere.
- *Programmato* — l'Evento possiede tutti gli elementi minimi (§3), con Periodo definito o indicativo.
- *Confermato* — la collocazione temporale e organizzativa non sono più soggette a valutazione preliminare.
- *In corso* — l'Evento si sta svolgendo, secondo il proprio Periodo e Orario.
- *Concluso* — il Periodo dell'Evento è terminato senza interruzioni.
- *Rinviato* — la data è stata spostata a un momento successivo (§7), mantenendo l'identità dell'Edizione.
- *Sospeso* — l'Evento è interrotto in modo temporaneo e reversibile, prima o durante lo svolgimento.
- *Cancellato* — l'Evento non si svolgerà, in modo definitivo.
- *Contestato* — uno o più elementi dell'Evento sono stati messi in dubbio; può sovrapporsi in qualsiasi momento agli altri stati.
- *Archiviato* — stato finale di conservazione storica, successivo a Concluso, Cancellato o Sospeso senza riapertura.

**b) Stato editoriale.**
- *Annunciato* — l'Evento è stato comunicato pubblicamente, anche prima dell'apertura delle iscrizioni.
- (Gli altri momenti redazionali — dichiarazione, pubblicazione — seguono lo stesso schema già adottato negli altri domini: un Evento può essere Programmato (asse a) senza essere ancora Annunciato (asse b), e viceversa un annuncio preliminare può precedere la conferma definitiva del Programma.)

**c) Stato di verifica.** Analogo per ruolo a quello degli altri domini (§11 di questo documento): un Evento può essere *non verificato*, *in verifica* o *verificato* rispetto a ciascuno degli aspetti elencati più sotto, con la possibilità di transitare verso *Contestato* (asse a) quando un aspetto verificato viene successivamente messo in dubbio.

**d) Stato delle iscrizioni.**
- *Iscrizioni non ancora aperte* — precedente all'apertura (§7).
- *Iscrizioni aperte* — è possibile iscriversi.
- *Iscrizioni chiuse* — non è più possibile iscriversi, per scadenza o per decisione dell'Organizzatore.
- *Esaurito* — la Capienza è stata raggiunta (§8), con eventuale Lista di attesa attiva.

**e) Disponibilità dei posti.** Un asse quantitativo, derivato dal confronto tra Capienza e Iscrizioni/Accreditamenti confermati (§8, §9): *Posti disponibili* o *Posti esauriti*, aggiornato nel tempo senza alterare lo Stato delle iscrizioni (asse d) se non al raggiungimento della soglia.

**f) Visibilità.** Trattata integralmente più sotto in questa sezione: descrive chi può conoscere l'esistenza e i dettagli dell'Evento.

**Perché i sei assi restano separati.** Un Evento può essere Programmato (asse a) e con Iscrizioni non ancora aperte (asse d); può essere In corso (asse a) e con Posti esauriti (asse e) su una singola Sessione ma non su altre; può essere Annunciato (asse b) prima di essere Confermato (asse a); può essere Verificato (asse c) rispetto alla data ma non ancora rispetto al Luogo. Comprimere questi sei assi in un'unica proprietà obbligherebbe a scegliere significati impropri per combinazioni reali e frequenti (una fiera con Programma confermato ma relatori ancora in fase di conferma, un webinar con iscrizioni aperte ma data ancora indicativa).

**Verifica.** Il dominio modella separatamente la verifica di:
- **Esistenza dell'Evento** — che l'iniziativa dichiarata corrisponda a un fatto reale.
- **Identità dell'organizzatore** — che il soggetto dichiarato come Organizzatore sia effettivamente tale.
- **Data** — che il Periodo dichiarato sia corretto e aggiornato.
- **Luogo** — che la localizzazione dichiarata sia corretta.
- **Modalità online** — che il Collegamento online dichiarato sia valido e funzionante.
- **Costo** — che la condizione economica dichiarata sia corretta e aggiornata.
- **Programma** — che le Sessioni dichiarate corrispondano a quanto effettivamente previsto.
- **Relatori** — che i soggetti dichiarati come Relatori abbiano confermato la propria partecipazione.
- **Disponibilità** — che i Posti disponibili dichiarati siano aggiornati.
- **Cancellazione o rinvio** — che un'eventuale modifica dichiarata sia reale e aggiornata.

**Fonti previste.** Dichiarazione dell'Organizzatore; ente pubblico; camera di commercio; associazione; fiera; comunicato ufficiale; sito dell'Organizzatore; segnalazione di un utente; redazione; fonte pubblica; documento ufficiale — coerenti per ruolo con le Fonti già previste negli altri domini logici (§2).

**Principio.** Va evitato un unico badge generico di "Evento verificato": un Evento può avere la Data verificata ma il Programma ancora in fase di conferma, o l'Identità dell'organizzatore verificata ma la Disponibilità dei posti non aggiornata da tempo. Mantenere gli assi di verifica separati, ciascuno con la propria Fonte ed Evidenza, permette di comunicare con precisione cosa la piattaforma sa per certo, coerente con il principio già adottato in `logical/professionisti.md` §11.

**Visibilità.**
- *Privato* — noto solo a chi lo ha creato.
- *Visibile alla redazione* — noto alla redazione, tipicamente durante la valutazione (asse a, "In valutazione").
- *Visibile su invito* — noto solo ai soggetti che hanno ricevuto un Invito (§9).
- *Visibile a una rete* — noto a chi appartiene a una rete professionale o associativa specifica.
- *Visibile a destinatari selezionati* — condiviso con un insieme specifico di destinatari.
- *Pubblico* — visibile a chiunque consulti la piattaforma.
- *Non più pubblicato ma conservato* — ritirato dai percorsi di consultazione correnti, mantenuto per Osservatorio o storico.
- *Contestato* — visibile con un'indicazione esplicita che uno o più elementi sono in dubbio (asse a).
- *Sospeso* — temporaneamente non visibile pubblicamente, in modo reversibile (asse a).
- *Archiviato* — non più nei percorsi correnti, conservato come riferimento storico (asse a).

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Evento deve avere una finalità e un soggetto organizzatore o promotore identificabile (§3, §5): senza questi elementi minimi, non è un Evento in senso proprio.
2. Ogni Evento deve avere una collocazione temporale, anche indicativa (§3, §7).
3. Un Evento non coincide con il contenuto che lo descrive (§1, §3, §10).
4. Un Evento non coincide automaticamente con un'Opportunità (§1, §10): può presentarla senza esserla.
5. Un Evento non coincide automaticamente con un percorso formativo (§10): un Corso può essere modellato come Evento, ma gli esiti didattici eccedono questo dominio.
6. Un'iscrizione non equivale a partecipazione (§9).
7. Un invito non equivale ad accettazione (§9).
8. Un Evento dichiarato non equivale a Evento verificato (§12): ciascun aspetto (data, luogo, organizzatore, ecc.) ha una propria verifica indipendente.
9. La cancellazione non deve cancellare automaticamente lo storico (§7, §12): un Evento Cancellato resta consultabile come fatto storicizzato.
10. Il rinvio deve conservare la data precedentemente comunicata (§7): un'Edizione Rinviata mantiene traccia della data originale insieme alla nuova.
11. Una nuova edizione non deve sovrascrivere le edizioni precedenti (§6).
12. Un Evento può avere più organizzatori (§5): Organizzatore e Co-organizzatore possono coesistere.
13. Una Persona che rappresenta un'Impresa deve farlo sulla base di Appartenenze (§5, §9).
14. Eventi non attribuisce rappresentanza o diritti di accesso (§9): nessun ruolo assunto in un Evento genera di per sé un titolo verso terzi o un permesso tecnico.
15. La piattaforma non garantisce qualità, riuscita o sicurezza dell'Evento (§12): la verifica di singoli aspetti non costituisce una garanzia complessiva.
16. Il dominio deve alimentare l'Osservatorio solo con dati aggregati e compatibili con la riservatezza (§1).

**Casi limite.**

**Evento senza data definitiva.** Corrisponde a "Evento con data indicativa" o a un Periodo non ancora determinato (§3, §7): stato legittimo, non un errore.

**Evento con luogo non ancora definito.** Ammesso quando la Modalità di partecipazione non è ancora stata decisa, o quando l'Organizzatore è ancora in trattativa per il Luogo (§8): non impedisce che l'Evento sia Programmato (asse a) se gli altri elementi minimi sono presenti.

**Evento spostato online.** Una Variazione di programma (§7) che modifica la Modalità di partecipazione da presenza a online (§8), generando l'evento di dominio ModalitàEventoModificata (§14).

**Evento inizialmente online poi trasformato in presenza.** Analogo al caso precedente, in direzione opposta.

**Evento annullato dopo l'apertura delle iscrizioni.** Corrisponde a una Cancellazione (§7, §12) successiva allo stato "Iscrizioni aperte" (asse d): le Iscrizioni già presentate restano storicizzate, e l'evento EventoCancellato (§14) ne informa i soggetti coinvolti.

**Evento rinviato più volte.** Ogni Rinvio (§7) conserva la data precedente (regola 10): lo storico rimane interamente consultabile.

**Evento gratuito con registrazione obbligatoria.** Corrisponde a "Partecipazione gratuita" insieme a "Iscrizione obbligatoria" (§8): condizioni indipendenti, che possono coesistere in qualsiasi combinazione.

**Evento a pagamento.** Corrisponde a un Costo o condizione economica dichiarato (§2, §8), senza che questo dominio gestisca la relativa transazione.

**Evento con posti esauriti.** Corrisponde allo stato "Esaurito" (asse d/e, §12), con eventuale Lista di attesa attiva (§8, §9).

**Evento su invito.** Corrisponde a "Partecipazione su invito" (§8): l'accesso è mediato dall'Invito (§9), senza Iscrizione libera.

**Evento riservato a una rete.** Corrisponde alla visibilità "Visibile a una rete" (§12).

**Evento internazionale in più lingue.** Corrisponde a più Lingue dell'Evento dichiarate (§11), con eventuale Supporto linguistico (§10, §11) per ciascuna combinazione.

**Evento con più fusi orari.** Rilevante per un Evento online o ibrido con Pubblico destinatario internazionale (§7, §8): l'Orario deve essere dichiarato con il proprio fuso orario di riferimento, senza deduzioni automatiche dal Territorio di riferimento.

**Fiera di più giorni.** Un'Edizione con più Giornate (§6, §7), ciascuna eventualmente con un proprio Programma.

**Missione imprenditoriale in più Paesi.** Un'Edizione con più Sessioni collocate in Territori o Mercati internazionali diversi (§6, §11), mantenendo un'unica identità di Edizione.

**Evento con molte sessioni.** Pienamente previsto dalla struttura Evento → Edizione → Sessione (§2, §6), senza limiti concettuali al numero di Sessioni.

**Sessione cancellata ma Evento confermato.** Lo Stato reale (asse a, §12) si applica anche a livello di Sessione: una singola Sessione può transitare verso "Cancellato" senza che questo alteri lo stato "Confermato" dell'Edizione nel suo complesso, generando l'evento SessioneEventoCancellata (§14).

**Più organizzatori con informazioni discordanti.** Un caso da risolvere tramite lo Stato di verifica (asse c, §12): l'informazione dichiarata da ciascun Organizzatore o Co-organizzatore (§5) può essere verificata separatamente, con eventuale transizione a "Contestato" (asse a) in caso di discordanza non risolta.

**Fonte ufficiale non aggiornata.** Una Fonte (§2, §12) può risultare non più affidabile nel tempo: la piattaforma può segnalare l'informazione come da riverificare, senza che questo comporti automaticamente una Contestazione.

**Evento segnalato da un utente.** Corrisponde allo stato reale "Segnalato" (asse a, §12): un'iniziativa portata all'attenzione della piattaforma, non ancora verificata né organizzata direttamente da un soggetto riconosciuto.

**Evento ricorrente.** Trattato integralmente al §6: mantiene un'identità generale con più Edizioni.

**Edizione annuale.** Un caso specifico di Evento ricorrente (§6, §7), con periodicità annuale dichiarata come informazione descrittiva, non come vincolo strutturale.

**Evento che presenta più Opportunità.** Pienamente previsto (§10): un'Edizione o Sessione può referenziare più Opportunità contemporaneamente.

**Evento che genera Collaborazioni.** Pienamente previsto (§10): una o più Collaborazioni possono nascere in occasione dello stesso Evento, ciascuna come entità autonoma del proprio dominio.

**Corso con attestato.** Il Corso resta modellato come Evento per la propria dimensione temporale (§10); l'attestato, come esito formativo, eccede questo dominio e rientra tra le questioni aperte per un futuro dominio Formazione (§15).

**Formazione obbligatoria sulla sicurezza.** Trattata con particolare attenzione al §10: un Evento di questo tipo deve poter dichiarare la Lingua dell'Evento e l'eventuale Supporto linguistico come attributi essenziali, non accessori.

**Evento collegato a un'Impresa cessata.** Analogo ai casi già trattati in `logical/mercati-internazionali.md` §13, `logical/opportunita.md` §13, `logical/collaborazioni.md` §13 e `logical/professionisti.md` §13 per le rispettive relazioni con un'Impresa cessata (`logical/imprese.md` §5): il ruolo di Organizzatore o Partecipante resta storicizzato anche quando l'Impresa cessa di essere attiva.

**Relatore sostituito.** Corrisponde a "Sostituzione del partecipante" (§9) applicata al ruolo di Relatore, con l'evento di dominio RelatoreSostituito (§14) che ne registra il cambiamento senza cancellare il Relatore originariamente previsto dallo storico del Programma.

**Partecipante che agisce per più Imprese.** Il dominio ammette Partecipazioni distinte per la stessa Persona, ciascuna dichiarata "per conto di" un'Impresa diversa, ciascuna sostenuta dalla propria Appartenenza (§5, §9, §13, regola 13).

**Registrazione dell'Evento pubblicata successivamente.** Corrisponde a "Registrazione o materiale derivato da un Evento" (§3): referenziata come materiale successivo, distinta dall'Evento stesso e dal suo ciclo di vita (§10, §12).

**Evento svolto fuori dalla piattaforma.** Un Evento può essere organizzato e svolto interamente al di fuori della piattaforma, ed essere qui rappresentato solo come informazione (Fonte "segnalazione" o "fonte pubblica", §12): il dominio non richiede che l'Evento sia "nativo" della piattaforma per esistere come fatto rappresentato.

**Esito o partecipazione effettiva non comunicati.** Un caso frequente in cui la Partecipazione effettiva (§9) resta non registrata dopo lo svolgimento dell'Evento: non invalida l'esistenza dell'Evento né la Partecipazione prevista, ma lascia quell'asse informativo incompleto, senza presumere né Presenza né Assenza.

---

## 14. Eventi di dominio

- **EventoIdeato** — un'iniziativa è stata registrata allo stadio di idea, senza ancora gli elementi minimi di un Evento.
- **EventoSegnalato** — un'iniziativa è stata portata all'attenzione della piattaforma da un soggetto terzo.
- **EventoVerificato** — uno o più aspetti dell'Evento sono stati confermati (§12).
- **EventoPubblicato** — l'Evento è diventato visibile secondo le regole applicabili (§12).
- **EventoProgrammato** — l'Evento ha raggiunto tutti gli elementi minimi con una collocazione temporale definita o indicativa (§3).
- **EventoConfermato** — la collocazione temporale e organizzativa non sono più soggette a valutazione preliminare.
- **IscrizioniAperte** — è diventato possibile iscriversi (§7, §9).
- **IscrizioniChiuse** — non è più possibile iscriversi.
- **EventoEsaurito** — la Capienza è stata raggiunta (§8).
- **EventoModificato** — una o più informazioni dell'Evento sono cambiate, senza rientrare in una categoria più specifica.
- **ProgrammaModificato** — il Programma di un'Edizione è cambiato (§6, §7).
- **LuogoEventoModificato** — il Luogo dichiarato è cambiato (§8).
- **ModalitàEventoModificata** — la Modalità di partecipazione è cambiata (es. da presenza a online, §8, §13).
- **EventoRinviato** — la data è stata spostata a un momento successivo, conservando quella precedente (§7, §13, regola 10).
- **EventoSospeso** — l'Evento è transitato verso lo stato reale "Sospeso" (§12).
- **EventoCancellato** — l'Evento è transitato verso lo stato reale "Cancellato" (§12).
- **EventoIniziato** — l'Evento è transitato verso lo stato reale "In corso" (§12).
- **EventoConcluso** — il Periodo dell'Evento è terminato senza interruzioni (§12).
- **EdizioneEventoCreata** — una nuova Edizione è stata generata per un Evento ricorrente (§6).
- **SessioneEventoCreata** — una nuova Sessione è stata aggiunta al Programma di un'Edizione (§6).
- **SessioneEventoModificata** — una Sessione esistente è stata modificata.
- **SessioneEventoCancellata** — una Sessione è transitata verso lo stato reale "Cancellato" senza che questo alteri necessariamente lo stato dell'Edizione (§13).
- **IscrizioneEventoPresentata** — una nuova Iscrizione è stata formalizzata (§9).
- **IscrizioneEventoConfermata** — un'Iscrizione è transitata verso la Conferma (§9).
- **IscrizioneEventoAnnullata** — un'Iscrizione è stata ritirata (Cancellazione, §9).
- **PartecipazioneEventoRegistrata** — una Partecipazione effettiva è stata registrata a consuntivo (§9).
- **RelatoreAssociato** — un soggetto è stato associato al ruolo di Relatore per una Sessione (§5).
- **RelatoreSostituito** — un Relatore precedentemente previsto è stato rimpiazzato (§9, §13).
- **OpportunitàAssociataAEvento** — un'Opportunità è stata collegata come presentata da un'Edizione o Sessione (§10).
- **CollaborazioneGenerataDaEvento** — una Collaborazione è nata nel contesto di un Evento (§10).
- **VisibilitàEventoModificata** — il livello di visibilità dell'Evento è cambiato (§12).
- **FonteEventoAggiornata** — una Fonte a sostegno di un'informazione dichiarata è stata aggiunta o aggiornata (§12).
- **EventoContestato** — l'Evento, o un suo elemento specifico, è stato messo in dubbio.
- **EventoArchiviato** — l'Evento è stato ritirato dai percorsi di consultazione correnti, restando conservato come riferimento storico.

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Notifiche, Ricerca, Osservatorio, Opportunità, Collaborazioni, Contenuti Editoriali) possono voler conoscere per reagire — ad esempio il dominio Notifiche può avvisare chi segue un territorio o un settore quando avviene un EventoPubblicato, o il dominio Collaborazioni può registrare l'origine di una nuova Collaborazione quando avviene un CollaborazioneGenerataDaEvento — senza che questo dominio debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate.**

1. Eventi è un dominio autonomo, con proprie entità, proprio ciclo di vita e proprie regole (§1).
2. Evento ed Edizione dell'Evento sono concetti distinti (§2, §6).
3. Evento e Sessione sono concetti distinti (§2, §6).
4. Evento e Contenuto editoriale sono concetti distinti (§1, §3, §10).
5. Evento e Opportunità sono concetti distinti (§1, §10).
6. Evento e Collaborazione sono concetti distinti (§1, §10).
7. Un Evento può presentare Opportunità e facilitare Collaborazioni senza incorporarle (§10).
8. Un Evento può avere finalità formative senza incorporare necessariamente l'intero futuro dominio Formazione (§10).
9. Persona, Impresa, Professionista, Appartenenza e Mercato internazionale restano domini distinti, sempre referenziati (§1, §5, §11).
10. La partecipazione per conto di un'Impresa deve essere contestualizzata tramite Appartenenze (§5, §9, §13, regola 13).
11. Iscrizione, invito, accreditamento e partecipazione effettiva sono concetti distinti (§9).
12. Stato reale, stato editoriale, verifica, iscrizioni, visibilità e disponibilità dei posti sono assi separati (§12).
13. Eventi non attribuisce rappresentanza o diritti di accesso (§13, regola 14).
14. Lo storico di Eventi, edizioni, rinvii e cancellazioni deve poter essere conservato (§6, §7, §13, regole 9-11).
15. Il dominio supporta Eventi locali, nazionali e internazionali (§11).
16. Il dominio supporta modalità in presenza, online e ibride (§8).
17. Il dominio supporta eventi pubblici, privati, riservati e su invito (§12).
18. Il dominio supporta eventi gratuiti e a pagamento senza incorporare pagamenti e fatturazione (§1, §8).
19. Le lingue e le competenze interculturali non devono essere dedotte automaticamente dall'origine delle Persone (§11).
20. Il dominio supporta formazione e sicurezza sul lavoro multilingue, con particolare attenzione a edilizia e cantieri (§10).
21. La piattaforma non garantisce la qualità, la riuscita o la sicurezza dell'Evento (§13, regola 15).
22. Il dominio può alimentare l'Osservatorio con dati aggregati senza compromettere informazioni personali o organizzative riservate (§1, §13, regola 16).

**Domande aperte.**

- Qual è il confine esatto tra Eventi e Contenuti editoriali, in particolare per la registrazione o il materiale successivo (§3, §10, §13)?
- Qual è il confine esatto tra Eventi e Opportunità, oltre alla distinzione già stabilita al §10, in particolare per le fiere e le missioni imprenditoriali che possono presentare più Opportunità contemporaneamente?
- Qual è il confine esatto tra Eventi e Formazione, in particolare su quali aspetti didattici un futuro dominio Formazione dovrebbe governare autonomamente (§10)?
- Come devono essere trattati esattamente i corsi e i percorsi formativi (§10, §13), oltre alla loro rappresentazione come Evento?
- Il dominio Formazione dovrà essere introdotto come dominio autonomo, e con quale confine esatto rispetto a Eventi e a Professionisti (formatori)?
- Come deve essere rappresentato operativamente un Luogo (§8), oltre al principio di sola referenziazione già stabilito?
- Qual è il collegamento esatto con un futuro dominio Immobiliare, per la scheda descrittiva dei Luoghi (§8)?
- Come devono essere trattati gli organizzatori esterni alla piattaforma (§5), in termini di verifica e di rappresentazione?
- Come devono essere rappresentati i soggetti non presenti sulla piattaforma (§5), oltre alla semplice referenziazione per nome?
- Con quali regole operative deve essere gestita la generazione di nuove Edizioni per un Evento ricorrente (§6)?
- Qual è il confine esatto, in termini di responsabilità informativa, tra Evento ed Edizione quando la maggior parte delle informazioni cambia da un'Edizione all'altra (§6)?
- Con quali regole operative devono essere gestite le Sessioni multiple all'interno di un'Edizione complessa (§6)?
- Con quale processo concreto si verificano Data e Luogo di un Evento (§12)?
- Con quale frequenza le informazioni verificate di un Evento devono essere aggiornate o riverificate (§12)?
- Come devono essere trattati costi e pagamenti a livello di flusso operativo, restando fuori dal perimetro di questo dominio (§1, §8)?
- Con quali regole operative devono essere gestite le Liste di attesa (§8, §9)?
- Con quali regole operative devono essere gestiti gli Inviti, in particolare per il rifiuto e la mancata risposta (§9)?
- Quale visibilità di default devono avere i Partecipanti di un Evento (§12)?
- I Relatori devono essere sempre pubblicati, o è ammessa una pubblicazione riservata o parziale (§5, §12)?
- Con quale meccanismo deve essere registrata la Partecipazione effettiva, oltre alla sua natura di fatto dichiarato a consuntivo (§9)?
- Come devono essere trattati i materiali successivi a un Evento (registrazioni, atti), in termini di responsabilità di conservazione e pubblicazione (§3, §10)?
- Come devono essere gestiti attestati e certificazioni collegati a un Corso, e a quale dominio devono appartenere (§10, §13)?
- Quali requisiti minimi deve avere un Evento di formazione obbligatoria sulla sicurezza, oltre alla lingua e al supporto linguistico già trattati (§10)?
- Come deve essere gestita concretamente la formazione multilingue, in termini di responsabilità tra Eventi, Professionisti e un eventuale dominio Servizi linguistici (§10)?
- Con quali regole operative devono essere gestiti gli Eventi internazionali con più lingue e più fusi orari (§7, §11, §13)?
- Qual è il collegamento esatto con Mercati Internazionali, oltre al riferimento già stabilito al §11?
- Qual è il collegamento esatto con Collaborazioni, oltre al riferimento già stabilito al §10?
- Qual è il collegamento esatto con Opportunità, oltre al riferimento già stabilito al §10?
- Qual è il collegamento esatto con Professionisti, oltre al riferimento già stabilito al §5 e al §10?
- Quali informazioni di questo dominio, esattamente, potranno essere utilizzate dall'Osservatorio, e con quale livello di aggregazione o anonimizzazione?
- Quale responsabilità assume la piattaforma sulle informazioni pubblicate quando derivano da una Fonte esterna non verificata (§12, §13)?
- Quale responsabilità assume la piattaforma in materia di sicurezza e accessibilità fisica dell'Evento, oltre alla sola rappresentazione informativa (§1, §13, regola 15)?

Queste domande restano decisioni progettuali future, coerenti con l'approccio già adottato in `logical/persone.md`, `logical/imprese.md`, `logical/appartenenze.md`, `logical/mercati-internazionali.md`, `logical/opportunita.md`, `logical/collaborazioni.md` e `logical/professionisti.md`.

