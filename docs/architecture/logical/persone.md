# Logical Data Model — Dominio PERSONE

> Livello logico. Nessun riferimento a database, PostgreSQL, Supabase, tabelle fisiche, colonne, tipi dato, chiavi esterne, indici, RLS o API.
> Fondamenti: [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md). Nessuno dei tre è modificato da questo documento.
> Ruolo di questo documento: essere il primo anello della catena di ingegnerizzazione — traduce la specifica funzionale del dominio Persone in un modello logico di entità, relazioni, cardinalità, stati e regole, pronto per la progettazione del database senza ulteriori decisioni concettuali.

---

## 1. Responsabilità del dominio

**Cosa comprende.** Il dominio Persone rappresenta l'individuo che utilizza la piattaforma come entità autonoma e continuativa: la sua identità, le sue competenze dichiarate, le lingue che utilizza, il racconto del proprio percorso. Comprende esclusivamente ciò che appartiene alla Persona in quanto tale, indipendentemente da qualsiasi ruolo, impresa o mercato a cui sia o sia stata collegata.

Le quattro entità logiche di questo dominio sono: **Persona**, **CompetenzaDichiarata**, **LinguaParlata**, **StoriaPersonale**.

**Cosa NON comprende.**
- Non comprende le Imprese o le Organizzazioni Istituzionali: sono un dominio distinto, che la Persona anima ma non possiede.
- Non comprende l'Appartenenza (il legame Persona↔Impresa con ruolo e periodo): è un dominio connettivo proprio, che referenzia la Persona ma non ne fa parte, esattamente perché deve poter evolvere (nuovi ruoli, nuove regole di autorizzazione) senza toccare il dominio Persone.
- Non comprende i Mercati Internazionali né la relazione di presenza in un mercato (PresenzaDiMercato): dominio proprio, referenziato.
- Non comprende Opportunità, OffertaDiServizio/RichiestaDiServizio, Eventi: la Persona ne è titolare o partecipante, ma questi contenuti vivono nei rispettivi domini.
- Non comprende i Contenuti Editoriali redazionali (Notizia, Guida): solo la StoriaPersonale, che è personale e autobiografica, appartiene a questo dominio.
- Non comprende l'autenticazione e la gestione degli accessi: è infrastruttura generica (dominio Identità & Accessi), abilitante ma non di business.

**Quali altri domini utilizza.**
- **Tassonomia Condivisa** — per referenziare le voci di Competenza e di Lingua che una Persona può dichiarare. Il dominio Persone non possiede né definisce queste voci: le consuma per riferimento.
- **Appartenenza** — per sapere quali imprese/organizzazioni una Persona anima nel tempo, con quale ruolo. Il dominio Persone non gestisce questa relazione, ma la sua esistenza è centrale per molte regole di business (§6) e per i flussi (§8).
- **Contenuti Editoriali** — per la distribuzione e la classificazione trasversale della StoriaPersonale come contenuto leggibile pubblicamente, senza che la Persona debba gestire un secondo processo editoriale.
- **Mercati Internazionali** — indirettamente, tramite PresenzaDiMercato: la Persona può dichiarare una relazione con un Mercato, ma quella relazione appartiene al dominio Mercati.

---

## 2. Entità logiche

### Persona

**Responsabilità.** Rappresentare l'identità di un individuo sulla piattaforma: chi è, come si presenta, dove si trova, come può essere contattato. È l'aggregate root del dominio e il nodo a cui tutte le altre entità di questo documento sono ancorate.

**Motivo dell'esistenza.** È il principio fondante di tutta la piattaforma: la persona precede e sopravvive a qualsiasi ruolo, impresa o servizio a cui si collega nel tempo (Costituzione, Valore 1; Domain Model, Aggregati).

**Chi la utilizza.** Ogni altro dominio che deve riferirsi a "chi ha fatto/pubblicato/dichiarato/partecipato" qualcosa: Appartenenza, Opportunità, Servizi, Eventi, Contenuti, Mercati (tramite PresenzaDiMercato), Partnership (quando il rappresentante di un'Organizzazione agisce).

**Relazioni principali.** Possiede CompetenzaDichiarata, LinguaParlata, StoriaPersonale (relazioni interne al dominio). È referenziata da Appartenenza (dominio esterno), e per estensione da tutto ciò che richiede un titolare/autore/partecipante persona.

### CompetenzaDichiarata

**Responsabilità.** Rappresentare una singola dichiarazione di competenza fatta da una Persona, con le sue proprietà (livello, esperienza, note).

**Motivo dell'esistenza.** Rendere la persona trovabile per competenza e qualificare la propria offerta professionale in modo strutturato, non come testo libero (Costituzione, Valore 2 — concretezza operativa).

**Chi la utilizza.** Il motore di ricerca (per filtrare Persone per competenza); il dominio Servizi (per orientare RichiesteDiServizio compatibili); la Persona stessa (per gestire il proprio profilo).

**Relazioni principali.** Appartiene a esattamente una Persona. Referenzia esattamente una voce di Tassonomia Competenza (dominio esterno).

### LinguaParlata

**Responsabilità.** Rappresentare una singola dichiarazione di uso linguistico fatta da una Persona, con il proprio contesto d'uso e livello.

**Motivo dell'esistenza.** Il multilinguismo reale è un valore fondante della piattaforma (Costituzione, Valore 3) ed è il fondamento su cui si basa l'intero dominio Servizi Linguistici.

**Chi la utilizza.** Il motore di ricerca; il dominio Servizi (le OffertaLinguistica/RichiestaLinguistica si appoggiano concettualmente a queste dichiarazioni); la Persona stessa.

**Relazioni principali.** Appartiene a esattamente una Persona. Referenzia esattamente una voce di Tassonomia Lingua (dominio esterno).

### StoriaPersonale

**Responsabilità.** Rappresentare un racconto in prima persona del percorso di una Persona, con un proprio processo di pubblicazione.

**Motivo dell'esistenza.** Le storie sono un contenuto chiave per costruire fiducia e credibilità narrativa (Costituzione, Strategia di crescita, punto 3), e devono restare ancorate alla Persona che le vive, non a un processo editoriale redazionale generico.

**Chi la utilizza.** Il dominio Contenuti Editoriali (per la distribuzione e il tagging trasversale); il motore di ricerca; lo Staff di piattaforma (per la revisione); chiunque consulti il profilo pubblico della Persona.

**Relazioni principali.** Appartiene a esattamente una Persona (autore). Può referenziare opzionalmente un'Impresa (dominio esterno), e più voci di Tassonomia (Tema, Settore, Mercato, Territorio).

---

## 3. Relazioni logiche

| # | Relazione | Tipo | Ownership | Dipendenza |
|---|---|---|---|---|
| R1 | Persona — CompetenzaDichiarata | Uno a molti | La Persona possiede la CompetenzaDichiarata | La CompetenzaDichiarata non può esistere senza la Persona |
| R2 | Persona — LinguaParlata | Uno a molti | La Persona possiede la LinguaParlata | La LinguaParlata non può esistere senza la Persona |
| R3 | Persona — StoriaPersonale | Uno a molti | La Persona possiede la StoriaPersonale | La StoriaPersonale non può esistere senza la Persona |
| R4 | CompetenzaDichiarata — VoceDiTassonomia (Competenza) | Molti a uno | Nessuna delle due parti possiede l'altra: relazione di riferimento | La CompetenzaDichiarata dipende dall'esistenza della voce di Tassonomia; la voce di Tassonomia non dipende da alcuna CompetenzaDichiarata |
| R5 | LinguaParlata — VoceDiTassonomia (Lingua) | Molti a uno | Relazione di riferimento, nessun possesso | La LinguaParlata dipende dalla voce di Tassonomia; la voce di Tassonomia non dipende da alcuna LinguaParlata |
| R6 | Persona — Appartenenza (dominio esterno) | Uno a molti | L'Appartenenza non è posseduta né dalla Persona né dall'Impresa: è un aggregato proprio che referenzia entrambe | La Persona non dipende dall'esistenza di alcuna Appartenenza (può esistere senza mai averne una); l'Appartenenza dipende sempre dall'esistenza della Persona |
| R7 | Persona — Impresa/OrganizzazioneIstituzionale (indiretta, tramite Appartenenza) | Molti a molti, nel tempo | Nessun possesso diretto: la relazione è mediata da Appartenenza | Dipendenza indiretta e transitiva, mai diretta |
| R8 | StoriaPersonale — Impresa (dominio esterno) | Molti a uno, opzionale | Nessun possesso: relazione di riferimento narrativo | La StoriaPersonale può esistere senza alcuna Impresa collegata; se presente, dipende dall'esistenza (anche storica) di un'Appartenenza tra l'autore e quell'Impresa |
| R9 | StoriaPersonale — VoceDiTassonomia (Tema, Settore, Mercato, Territorio) | Molti a molti | Relazione di classificazione (tag), nessun possesso | Nessuna dipendenza obbligatoria: i tag sono facoltativi |

**Nota su R6/R7.** Questa è la relazione più importante del modello: la Persona non "contiene" le proprie Appartenenze come farebbe con CompetenzaDichiarata o LinguaParlata. L'Appartenenza è un aggregato indipendente proprio perché ha regole di consistenza che coinvolgono *due* aggregate root (Persona e Impresa) e non deve appesantire né l'uno né l'altro (Domain Model, §5 — Aggregati).

---

## 4. Cardinalità

| Relazione | Cardinalità minima–massima (lato Persona) | Cardinalità minima–massima (lato altra entità) |
|---|---|---|
| Persona — CompetenzaDichiarata | 1 Persona → 0..N CompetenzaDichiarata | 1 CompetenzaDichiarata → esattamente 1 Persona |
| Persona — LinguaParlata | 1 Persona → 0..N LinguaParlata | 1 LinguaParlata → esattamente 1 Persona |
| Persona — StoriaPersonale | 1 Persona → 0..N StoriaPersonale | 1 StoriaPersonale → esattamente 1 Persona |
| CompetenzaDichiarata — VoceDiTassonomia (Competenza) | 1 CompetenzaDichiarata → esattamente 1 voce | 1 voce → 0..N CompetenzaDichiarata (di Persone diverse; al massimo 1 per singola Persona, vedi §7) |
| LinguaParlata — VoceDiTassonomia (Lingua) | 1 LinguaParlata → esattamente 1 voce | 1 voce → 0..N LinguaParlata (di Persone diverse; al massimo 1 per singola Persona) |
| Persona — Appartenenza | 1 Persona → 0..N Appartenenza (anche verso la stessa Impresa in periodi diversi) | 1 Appartenenza → esattamente 1 Persona |
| Persona — Impresa/Organizzazione (indiretta) | 1 Persona → 0..N Impresa/Organizzazione, nel tempo | 1 Impresa/Organizzazione → 1..N Persona (mai zero: vincolo di esistenza del referente, di competenza del dominio Imprese) |
| StoriaPersonale — Impresa | 1 StoriaPersonale → 0..1 Impresa | 1 Impresa → 0..N StoriaPersonale |
| StoriaPersonale — VoceDiTassonomia (tag) | 1 StoriaPersonale → 0..N voci | 1 voce → 0..N StoriaPersonale |

---

## 5. Stati

Gli stati sono definiti solo dove esiste un reale bisogno funzionale di distinguere fasi diverse del ciclo di vita (si veda anche la Decisione Architetturale n. 5).

**Persona**
`Registrata` → `Attiva` → `Inattiva/Sospesa` → `Attiva` (ripristino) → `Cancellata` (terminale, irreversibile)

Motivazione degli stati: la Persona ha un vero processo di attivazione (profilo minimo alla registrazione, completamento successivo) e un vero bisogno di sospensione reversibile (moderazione o scelta propria) distinto dalla cancellazione definitiva.

**CompetenzaDichiarata**
`Dichiarata` → `Rimossa` (terminale)

Motivazione: nessun processo di pubblicazione o revisione; è una dichiarazione diretta e immediata. Non sono previsti stati intermedi.

**LinguaParlata**
`Dichiarata` → `Rimossa` (terminale)

Motivazione: identica a CompetenzaDichiarata.

**StoriaPersonale**
`Bozza` → `In revisione` → `Pubblicata` → `Aggiornata` (torna a comportarsi come Pubblicata) → `Archiviata` (terminale, salvo riattivazione da parte dell'autore)

Motivazione: a differenza delle due entità precedenti, la StoriaPersonale ha un vero processo editoriale (scrittura, eventuale revisione redazionale, pubblicazione, possibilità di aggiornamento) che giustifica un ciclo di vita più articolato.

---

## 6. Regole di business

1. Una Persona può appartenere, tramite Appartenenza, a più Imprese/Organizzazioni contemporaneamente e in sequenza nel tempo.
2. Una Persona può ricoprire più ruoli, anche diversi, anche verso la stessa Impresa in periodi differenti (es. prima collaboratore, poi titolare).
3. Una Persona può dichiarare più lingue, ciascuna con proprio contesto d'uso e livello.
4. Una Persona può dichiarare più competenze, ciascuna con proprio livello.
5. Una Persona può operare in più Mercati (tramite PresenzaDiMercato, dominio esterno), senza limiti impliciti nel dominio Persone.
6. Una Persona può scrivere più StoriePersonali nel tempo, anche riferite a Imprese diverse se il proprio percorso lo prevede.
7. Una Persona esiste indipendentemente dal fatto che abbia mai avuto un'Impresa, un'Appartenenza, una competenza dichiarata o una lingua dichiarata: tutte queste relazioni sono opzionali e accessorie rispetto all'esistenza della Persona.
8. Una Persona non può dichiarare due volte la stessa voce di Competenza né la stessa voce di Lingua (una sola dichiarazione attiva per voce).
9. La cancellazione di una Persona è un atto esclusivo della Persona stessa (mai automatico, mai deciso da un altro dominio) ed è irreversibile; la sospensione, invece, è reversibile e può essere avviata anche dallo Staff per moderazione.
10. Una StoriaPersonale collegata a un'Impresa richiede che l'autore abbia, o abbia avuto in passato, un'Appartenenza verso quell'Impresa: non si può raccontare la crescita di un'impresa a cui non si è mai stati collegati.
11. La disattivazione o la cancellazione di una Persona non elimina retroattivamente le Appartenenze storiche: il fatto che una relazione sia esistita resta un dato storico del dominio Appartenenza, indipendente dalla visibilità attuale del profilo Persona.

---

## 7. Vincoli logici

- Una CompetenzaDichiarata deve appartenere sempre a esattamente una Persona: non può esistere isolata né condivisa tra più Persone.
- Una CompetenzaDichiarata deve riferirsi sempre a una voce attiva della Tassonomia Competenza.
- Una LinguaParlata deve appartenere sempre a esattamente una Persona.
- Una LinguaParlata deve riferirsi sempre a una voce attiva della Tassonomia Lingua.
- Una StoriaPersonale deve appartenere sempre a esattamente una Persona (l'autore), senza eccezioni.
- L'identificativo pubblico di una Persona deve essere univoco su tutta la piattaforma: due Persone non possono condividerlo.
- Una Persona deve avere sempre un canale di contatto minimo valido (l'account stesso), anche quando nessun dato di presentazione pubblica è ancora stato compilato.

**Precisazione su un vincolo apparentemente intuitivo.** Ci si potrebbe aspettare un vincolo del tipo *"una voce di Tassonomia Lingua deve essere collegata ad almeno una Persona per esistere"*. Questo vincolo è deliberatamente **respinto** dal modello: le voci di Tassonomia (Lingua, Competenza) sono governance centrale e devono poter esistere nel catalogo prima ancora che qualcuno le utilizzi — altrimenti la piattaforma non potrebbe mai proporre una nuova lingua o una nuova competenza finché una Persona non la dichiara per prima, il che è concettualmente scorretto. La dipendenza corretta è nella direzione opposta: è la LinguaParlata/CompetenzaDichiarata che dipende dalla voce di Tassonomia, non viceversa. Questa precisazione è ripresa nelle Decisioni Architetturali (§11, decisione 3).

---

## 8. Flussi

**Flusso 1 — Dalla registrazione alla prima opportunità**

Registrazione
↓
Creazione profilo (stato: Registrata)
↓
Completamento profilo → attivazione (stato: Attiva)
↓
Completamento competenze (una o più CompetenzaDichiarata)
↓
Inserimento lingue (una o più LinguaParlata)
↓
Associazione a un'Impresa — creazione o adesione (dominio Appartenenza, esterno)
↓
Dichiarazione di uno o più Mercati di interesse (dominio Mercati, esterno, tramite PresenzaDiMercato)
↓
Pubblicazione della prima Opportunità o OffertaDiServizio (dominio Opportunità/Servizi, esterno, con la Persona o l'Impresa come titolare)

Ogni passaggio dopo l'attivazione è opzionale e non ordinato in modo rigido: una Persona può, ad esempio, dichiarare un Mercato prima di associarsi a un'Impresa, o non associarsi mai a un'Impresa e restare un libero professionista.

**Flusso 2 — Racconto del proprio percorso**

Persona Attiva
↓
Scrittura di una StoriaPersonale (stato: Bozza)
↓
Invio in revisione (stato: In revisione) — passaggio facoltativo, secondo policy editoriale
↓
Pubblicazione (stato: Pubblicata) — il contenuto diventa visibile e classificato con tag trasversali
↓
Eventuali aggiornamenti nel tempo (stato: Aggiornata)
↓
Archiviazione, quando il racconto non è più in evidenza (stato: Archiviata)

**Flusso 3 — Evoluzione del ruolo nel tempo**

Persona con Appartenenza Attiva in Impresa A, ruolo "collaboratore"
↓
Terminazione dell'Appartenenza (per scelta propria o dell'Impresa)
↓
Nuova Appartenenza, verso la stessa Impresa A con ruolo "titolare", oppure verso una nuova Impresa B
↓
Il profilo Persona resta lo stesso, invariato: cambia solo la relazione (dominio Appartenenza), non l'identità della Persona

Questo flusso rende visibile, a livello di modello, il principio "la persona precede l'impresa": la Persona non viene mai ricreata al cambiare di ruolo o di impresa.

**Flusso 4 — Sospensione e recupero**

Persona Attiva
↓
Sospensione (volontaria o per moderazione) → stato: Inattiva/Sospesa
↓
Il profilo non è più visibile pubblicamente; le entità dipendenti (CompetenzaDichiarata, LinguaParlata, StoriaPersonale) restano intatte ma non consultabili da terzi
↓
Riattivazione → stato: Attiva, tutto torna visibile senza necessità di ridichiarare nulla

---

## 9. Integrazione con gli altri domini

**Imprese (tramite Appartenenza).** La Persona diventa titolare, collaboratrice, dipendente o rappresentante di un'Impresa/Organizzazione esclusivamente tramite un'Appartenenza attiva. Il dominio Persone non conosce né gestisce la struttura interna dell'Impresa: la referenzia solo come "l'altro lato" di un'Appartenenza. Simmetricamente, l'Impresa non conosce i dati personali della Persona oltre a ciò che è pubblico.

**Mercati.** La Persona dichiara il proprio interesse o la propria attività verso un Mercato tramite una PresenzaDiMercato, un'entità che appartiene al dominio Mercati Internazionali. Il dominio Persone non possiede questa relazione: la subisce come riferimento esterno, esattamente come per l'Appartenenza.

**Opportunità.** Una Persona (a proprio nome o a nome di un'Impresa con ruolo abilitante) è sempre il titolare pubblicante di un'Opportunità. Il dominio Opportunità referenzia la Persona per identità; il dominio Persone non contiene né gestisce le Opportunità pubblicate.

**Servizi.** Analogamente a Opportunità: la Persona è titolare di OffertaDiServizio/RichiestaDiServizio. In particolare, le OffertaLinguistica/RichiestaLinguistica del dominio Servizi si appoggiano concettualmente alle LinguaParlata dichiarate nel dominio Persone (stessa lingua, stesso concetto di livello), pur restando entità logicamente distinte e appartenenti a domini diversi: una LinguaParlata è una dichiarazione personale, un'OffertaLinguistica è un servizio commerciale.

**Eventi.** La Persona partecipa o organizza un Evento tramite una Partecipazione, entità del dominio Eventi. Il dominio Persone non gestisce iscrizioni, capienze o ruoli di partecipazione: li subisce come riferimento esterno.

**Partnership.** Quando un'Organizzazione diventa Partner, è sempre una Persona con Appartenenza abilitante ad agire per suo conto (proporre, negoziare, confermare rinnovi) — ma l'accordo di Partnership appartiene all'Organizzazione, non alla Persona individualmente. Il dominio Persone non ha alcuna responsabilità diretta su questo dominio.

**Contenuti.** La StoriaPersonale, pur appartenendo strutturalmente al dominio Persone, è trattata dal dominio Contenuti Editoriali come un contenuto a tutti gli effetti per ciò che riguarda ricerca, tag trasversali e distribuzione. Notizie e Guide, di competenza del dominio Contenuti, possono referenziare una Persona come soggetto trattato, senza che questo generi alcuna responsabilità di gestione per il dominio Persone.

**Osservatorio.** I ReportOsservatorio possono aggregare, in forma statistica e anonima, dati derivati dalle Persone (ad esempio: "numero di persone con una determinata competenza in un determinato mercato"). Questa integrazione è sempre a senso unico e aggregato: il dominio Osservatorio consuma dati derivati, non referenzia mai una singola Persona in modo identificabile nei propri report pubblici.

---

## 10. Estensibilità

**Nuove voci di catalogo (lingue, competenze) non richiedono modifiche al dominio Persone.** Essendo Tassonomia Condivisa un dominio a governance centrale e indipendente, l'aggiunta di una nuova lingua o competenza è immediatamente disponibile per nuove dichiarazioni, senza toccare Persona, CompetenzaDichiarata o LinguaParlata.

**Nuovi attributi descrittivi della Persona si aggiungono come proprietà facoltative.** Il modello logico prevede ampiamente attributi facoltativi (si veda la Data Specification): un nuovo attributo (es. un futuro "portfolio", una "fase del percorso" dichiarata) può essere introdotto senza invalidare i profili esistenti, che semplicemente non lo avranno compilato.

**Nuovi tipi di dichiarazione personale seguono il pattern CompetenzaDichiarata/LinguaParlata.** Se in futuro la piattaforma vorrà introdurre, ad esempio, "CertificazioneDichiarata" o "InteresseDichiarato", il pattern è già stabilito: un'entità dipendente dalla Persona (aggregate root), con riferimento a una voce di Tassonomia, proprietà specifiche e un ciclo di vita minimale autonomo — nessuna modifica alle entità esistenti è richiesta.

**Nuovi domini che vogliono "sapere qualcosa" sulla Persona lo fanno per riferimento, mai per inclusione.** Un dominio futuro (es. un ipotetico dominio "Mentorship", evocato nella Roadmap della Costituzione) può referenziare una Persona per identità e reagire a fatti già accaduti nel suo ciclo di vita (es. "una Persona è diventata Attiva da più di N anni"), senza che il dominio Persone debba essere modificato per accoglierlo.

**La distinzione tra stato "leggero" (CompetenzaDichiarata, LinguaParlata) e stato "editoriale" (StoriaPersonale) è già un pattern riutilizzabile.** Qualsiasi nuova entità dipendente della Persona potrà scegliere, secondo il proprio reale bisogno funzionale (non per uniformità), quale dei due pattern di ciclo di vita adottare.

---

## DECISIONI ARCHITETTURALI

**Decisione 1 — Appartenenza come dominio/aggregato indipendente, non come parte di Persona o di Impresa.**
- *Motivazione.* Rispetta il principio "la persona precede l'impresa" e permette a una Persona di avere più Appartenenze, anche sovrapposte o storiche, senza appesantire né la Persona né l'Impresa con questa complessità.
- *Alternative scartate.* (a) Modellare l'appartenenza come un attributo multiplo diretto della Persona (un semplice elenco di imprese collegate): scartata perché non permette di rappresentare ruolo, periodo e regole di autorizzazione in modo strutturato. (b) Modellare l'appartenenza come attributo della sola Impresa (un elenco di persone collegate): scartata per lo stesso motivo, e perché romperebbe la simmetria concettuale della relazione, che riguarda entrambe le parti allo stesso modo.
- *Impatto sul sistema.* Ogni verifica "di chi fa parte questa Persona" o "chi anima questa Impresa" richiede di attraversare l'aggregato Appartenenza: un livello di indirezione in più, accettato perché coerente con il Domain Model e necessario per la correttezza del modello nel tempo.

**Decisione 2 — CompetenzaDichiarata e LinguaParlata come entità dipendenti distinte, non come semplici elenchi di valori.**
- *Motivazione.* Ogni dichiarazione porta informazioni proprie (livello, contesto d'uso, anni di esperienza, note) che un semplice elenco di riferimenti non potrebbe rappresentare; inoltre permettono tracciabilità e ricerca più precise.
- *Alternative scartate.* Rappresentare competenze e lingue come un semplice elenco di riferimenti alla Tassonomia, senza proprietà aggiuntive: scartata perché avrebbe impoverito la ricerca (impossibile filtrare per livello) e la coerenza con il dominio Servizi, che si basa su queste dichiarazioni.
- *Impatto sul sistema.* Più entità da gestire rispetto a un semplice elenco, ma un modello di ricerca e di integrazione con i Servizi molto più solido.

**Decisione 3 — Le voci di Tassonomia Condivisa esistono e sono governate indipendentemente dal loro utilizzo da parte delle Persone.**
- *Motivazione.* Un catalogo a governance centrale deve poter essere popolato prima che qualcuno lo utilizzi. Vincolare l'esistenza di una lingua o di una competenza al fatto che una Persona la dichiari creerebbe un problema di "chi la crea per primo" e sposterebbe indebitamente la responsabilità del catalogo dalla piattaforma agli utenti.
- *Alternative scartate.* Vincolare l'esistenza di una voce di Tassonomia all'uso attivo da parte di almeno una Persona (il pattern suggerito, in modo naive, da un vincolo intuitivo del tipo "una lingua deve essere collegata ad almeno una persona"): scartata perché contraddice il ruolo di Tassonomia Condivisa come Shared Kernel a governance centrale, definito nel Domain Model.
- *Impatto sul sistema.* Il dominio Persone dipende da Tassonomia Condivisa, ma non ne condiziona in alcun modo l'esistenza: è una dipendenza a senso unico, semplice da ragionare e coerente con l'intera architettura.

**Decisione 4 — StoriaPersonale resta nel dominio Persone, pur comportandosi anche da Contenuto Editoriale.**
- *Motivazione.* Il proprietario naturale e l'unico autore possibile di una StoriaPersonale è la Persona stessa; unificarla con Notizie e Guide (che hanno un processo redazionale diverso, non personale) ne offuscherebbe il significato specifico.
- *Alternative scartate.* Unificare Storia, Notizia e Guida in un'unica entità generica "ContenutoEditoriale" con un campo che ne indichi il tipo: scartata perché le regole di autore e di revisione differiscono sostanzialmente (una Storia è sempre autobiografica, una Notizia non lo è mai), e l'unificazione forzata avrebbe reso il modello meno chiaro, non più semplice.
- *Impatto sul sistema.* La ricerca e i tag trasversali devono trattare la StoriaPersonale anche come contenuto editoriale (già previsto dal Domain Model §9 e dalla Data Specification), pur restando concettualmente ancorata al dominio Persone.

**Decisione 5 — Stati minimali per CompetenzaDichiarata e LinguaParlata, stati articolati solo per StoriaPersonale.**
- *Motivazione.* Le prime due entità non hanno alcun processo di pubblicazione o revisione: sono dichiarazioni dirette e immediate. Un ciclo di vita elaborato aggiungerebbe complessità senza corrispondere a un reale bisogno funzionale.
- *Alternative scartate.* Applicare a tutte le entità del dominio lo stesso ciclo di vita a più stati usato per StoriaPersonale, per uniformità formale: scartata perché la Costituzione privilegia esplicitamente la concretezza operativa sull'uniformità fine a se stessa.
- *Impatto sul sistema.* Minore complessità implementativa futura per le due entità più semplici; l'apparente disomogeneità con StoriaPersonale è intenzionale e qui documentata.

**Decisione 6 — Nessun vincolo di cardinalità massima su CompetenzaDichiarata, LinguaParlata, StoriaPersonale e Appartenenza per Persona.**
- *Motivazione.* La piattaforma è pensata per accompagnare la persona per anni, attraverso ruoli, competenze e lingue diverse (Costituzione, Valore 5 — accompagnamento nel tempo): un limite massimo contraddirebbe questo principio.
- *Alternative scartate.* Limitare il numero massimo di competenze o lingue dichiarabili per mantenere i profili "puliti": scartata perché è una preoccupazione di prodotto/interfaccia, non un vincolo di dominio, e può essere gestita a un livello diverso senza irrigidire il modello logico.
- *Impatto sul sistema.* Il modello logico resta semplice e non arbitrariamente limitato; eventuali limiti di interfaccia o anti-abuso potranno essere introdotti come regole applicative separate, senza modificare questo documento.

---

## Conclusione

Questo documento definisce, per il dominio Persone, tutte le decisioni concettuali necessarie — entità, relazioni, cardinalità, stati, regole di business, vincoli logici, flussi e integrazioni — in modo sufficiente a procedere con la progettazione del database senza dover tornare a interrogarsi su cosa significhi una Persona, una CompetenzaDichiarata, una LinguaParlata o una StoriaPersonale, o su come si relazionino tra loro e con il resto della piattaforma.
