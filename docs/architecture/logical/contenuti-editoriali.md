# Logical Data Model — Dominio CONTENUTI EDITORIALI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, CMS, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/eventi.md`](./eventi.md).
> Scopo del documento: definire il modello logico del dominio Contenuti Editoriali, già anticipato in `docs/domain-model.md` §1 come dominio di "Supporto" ("rappresentare notizie, guide e storie: contenuto informativo e narrativo, non transazionale") e richiamato da tutti i domini logici precedenti come referenziante, non referenziato — con due eccezioni rilevanti chiarite in questo documento: `logical/persone.md` (Decisione 4) ha già stabilito che la StoriaPersonale resta ancorata al dominio Persone pur comportandosi anche da Contenuto Editoriale; `logical/imprese.md` (§1, §5) ha già stabilito che le StorieImpresa sono possedute da questo dominio, che referenzia l'Impresa come soggetto narrato. Questo documento conferma Contenuti Editoriali come dominio autonomo e ne definisce la struttura logica completa, rispettando entrambe le decisioni pregresse.
> Carattere autonomo del dominio. Contenuti Editoriali rappresenta la produzione, l'organizzazione, la revisione, la pubblicazione e la conservazione di contenuti informativi e narrativi: notizie, guide, approfondimenti, interviste, storie, e ogni altra forma di racconto o comunicazione strutturata della piattaforma. Non è un contenitore passivo per gli altri domini, ma un dominio con una propria natura redazionale, un proprio ciclo di vita e proprie regole di responsabilità e affidabilità.
> Distinzione tra fatto e rappresentazione editoriale. Un fatto di dominio (un'Impresa esiste, un'Opportunità è stata pubblicata, un Evento si è svolto) vive ed esiste nel proprio dominio nativo, indipendentemente da qualsiasi contenuto che lo racconti. Un Contenuto editoriale è sempre una **rappresentazione** di quel fatto — una notizia su un'Impresa non è l'Impresa; un articolo su un'Opportunità non è l'Opportunità; una pagina che presenta un Evento non è l'Evento; un'intervista a una Persona non coincide con il profilo della Persona. Il contenuto può descrivere, raccontare, citare o analizzare un fatto, ma non lo costituisce e non lo modifica.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API, CMS o interfaccia.

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Contenuti Editoriali rappresenta ogni contenuto informativo o narrativo prodotto, curato e pubblicato dalla piattaforma o a nome di un soggetto che vi opera: la sua identità, la sua struttura, la sua provenienza, la responsabilità editoriale che lo sostiene, il processo di revisione che lo accompagna, e la sua relazione — sempre per riferimento, mai per incorporazione — con i soggetti e i fatti che descrive.

**Quali problemi risolve.** Rende possibile alla piattaforma svolgere una funzione informativa seria, neutrale e documentata (introduzione strategica): distingue sempre un'affermazione dichiarata da un fatto verificato (§7, §8); gestisce la complessità di un processo redazionale reale — proposta, revisione, approvazione, pubblicazione, aggiornamento, rettifica — senza perdere lo storico delle versioni precedenti (§6); tiene separate le fonti che sostengono un contenuto dal contenuto stesso, evitando un giudizio unico e generico di affidabilità (§7); permette contenuti multilingue senza trasformare la piattaforma in un servizio di traduzione generalista (§9); distingue con precisione lo stato redazionale, la verifica, la pubblicazione, la visibilità, la validità informativa e un'eventuale contestazione legale, evitando di comprimerli in un solo stato (§10).

**Cosa rientra nel dominio.** Il Contenuto editoriale e le sue Versioni (§2, §6); le tipologie editoriali (§4); gli Autori, i Curatori, i Revisori e la responsabilità editoriale (§5); le Fonti, le Evidenze e le Attribuzioni (§7); il collegamento — non l'incorporazione — con i fatti di dominio descritti (§8); le lingue, le traduzioni e gli adattamenti (§9); il ciclo di vita editoriale (§10); la pubblicazione, la validità e l'obsolescenza (§11); la visibilità e la riservatezza editoriale (§12).

**Cosa NON rientra nel dominio.**
- Non rientrano le **Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi** e i **Mercati internazionali**: sono sempre referenziati come Soggetto descritto, Oggetto descritto, contesto o Fonte (§8), mai incorporati né modificati da questo dominio. Fa eccezione la StoriaPersonale, che resta strutturalmente ancorata al dominio Persone (`logical/persone.md`, Decisione 4) pur essendo trattata da questo dominio come contenuto per ricerca, classificazione e distribuzione, senza che questo dominio ne possieda il processo editoriale primario. Le StorieImpresa, al contrario, sono possedute da questo dominio, che referenzia l'Impresa come soggetto narrato (`logical/imprese.md` §1, §5).
- Non rientra l'**Osservatorio**: un Contenuto editoriale può essere generato a partire da un'analisi o una sintesi dell'Osservatorio (§3, §13), ma il dominio Osservatorio resta distinto, prodotto ed aggiornato secondo le proprie regole; questo dominio lo consuma come possibile Fonte (§7), senza confondersi con esso.
- Non rientrano le **fonti documentali** in senso di archivio o libreria: questo dominio modella la Fonte e il Riferimento documentale come concetti di attribuzione (§7) — a chi o a cosa risale un'affermazione — non come un sistema di gestione, conservazione o organizzazione di documenti.
- Non rientra la **messaggistica**: la comunicazione privata tra soggetti resta fuori dal perimetro, coerente con `logical/collaborazioni.md` §1 e `logical/eventi.md` §1.
- Non rientrano i **commenti**: un'eventuale interazione del pubblico con un Contenuto editoriale non è modellata da questo documento (questione aperta, §15).
- Non rientrano le **notifiche**: la segnalazione che un nuovo Contenuto è stato pubblicato è una reazione di un altro dominio a un evento di questo dominio (§14), non una responsabilità di questo dominio.
- Non rientra la **pubblicità**: un eventuale contenuto sponsorizzato o promozionale può esistere come Tipologia editoriale (§4) con una propria trasparenza dichiarata, ma la gestione commerciale dell'inserzione resta fuori dal perimetro.
- Non rientrano **Identità & Accessi**: nessuna informazione di questo dominio genera di per sé un permesso tecnico o un diritto di accesso (§12, §13).

**Quali domini utilizza.**
- **Persone, Imprese, Appartenenze, Professionisti** — per referenziare i soggetti descritti, citati o intervistati (§5, §8).
- **Opportunità, Collaborazioni, Eventi, Mercati Internazionali** — per referenziare i fatti di dominio descritti, presentati o analizzati (§8).
- **Tassonomia Condivisa** — per Categorie, Temi, Etichette e Lingue (§2, §9).
- **Osservatorio** — come possibile Fonte per contenuti generati a partire da dati aggregati (§3, §7, §13).

**Quali domini utilizzano Contenuti editoriali.**
- **Persone** — per distribuire, classificare e rendere ricercabile la StoriaPersonale come contenuto, pur restando quest'ultima ancorata al dominio Persone (`logical/persone.md`, Decisione 4).
- **Imprese** — per le StorieImpresa, possedute da questo dominio e referenziate da Imprese come soggetto narrato (`logical/imprese.md` §1).
- **Opportunità, Collaborazioni, Eventi, Mercati Internazionali** — per essere descritti, annunciati o approfonditi da un Contenuto editoriale, senza che ciò generi alcuna responsabilità di gestione per quei domini.
- **Ricerca**, **Notifiche**, **Osservatorio** — per rendere i Contenuti trovabili, per segnalare fatti rilevanti (§14) e per eventualmente aggregare, in forma statistica, quanti contenuti riguardano un determinato soggetto o tema.

**Perché Contenuti Editoriali è un dominio autonomo.** Un Contenuto editoriale ha un proprio processo redazionale con ruoli distinti (Autore, Curatore, Revisore, Responsabile editoriale, §5) che nessun altro dominio replica; un proprio modello di Fonti e affidabilità (§7) indipendente da qualsiasi verifica di dominio; un proprio ciclo di vita su sei assi (§10) capace di rappresentare proposta, revisione, pubblicazione, aggiornamento, rettifica e contestazione senza perdere lo storico (§6); e una funzione trasversale — raccontare qualsiasi altro dominio — che richiede di restare strutturalmente separato da ciò che racconta, per non compromettere né l'integrità dei fatti descritti né la propria indipendenza redazionale.

**Differenza tra contenuto, fatto di dominio, fonte, documento, comunicazione e dato dell'Osservatorio.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Contenuto editoriale | Rappresentazione narrativa o informativa (questo documento) | Prodotto da un processo redazionale, con una propria responsabilità editoriale (§5) |
| Fatto di dominio | Un accadimento o uno stato registrato nel proprio dominio nativo (es. Impresa cessata, Opportunità pubblicata) | Esiste indipendentemente da qualsiasi contenuto che lo descriva; non è mai modificato da questo dominio (§8) |
| Fonte | Concetto di attribuzione (§7) | Da chi o da cosa proviene un'affermazione riportata in un Contenuto editoriale |
| Documento (Riferimento documentale) | Materiale citato o allegato a supporto (§7) | Referenziato come prova o approfondimento, non gestito come archivio proprio di questo dominio |
| Comunicazione | Scambio privato o notifica | Fuori dal perimetro di questo dominio (§1) |
| Dato dell'Osservatorio | Sintesi statistica aggregata (dominio Osservatorio) | Prodotto da un dominio distinto secondo le proprie regole; può diventare Fonte per un Contenuto editoriale (§3, §7), senza esserne parte |

---

## 2. Entità e concetti principali

| Concetto | Natura | Sintesi |
|---|---|---|
| Contenuto editoriale | Entità autonoma (aggregate root) | L'unità redazionale nella sua identità generale, indipendente dalle singole Versioni (§6). |
| Versione del contenuto | Entità dipendente | Uno stato specifico e storicizzato del Contenuto in un dato momento (§6). |
| Tipologia editoriale | Concetto descrittivo (classificazione) | La natura redazionale del Contenuto secondo il catalogo del §4. |
| Titolo | Componente del contenuto (value object) | La denominazione con cui il Contenuto è identificato e presentato. |
| Sommario | Componente del contenuto (value object) | Una sintesi introduttiva, distinta dal Corpo. |
| Corpo | Componente del contenuto | Il testo principale del Contenuto, organizzato in Sezioni. |
| Sezione | Componente del contenuto | Una parte strutturata del Corpo. |
| Blocco editoriale | Componente del contenuto | L'unità minima di composizione all'interno di una Sezione (un paragrafo, una Citazione, un elemento multimediale). |
| Autore | Ruolo | Il soggetto che ha materialmente prodotto il Contenuto o una sua parte (§5). |
| Curatore | Ruolo | Il soggetto che organizza e coordina il Contenuto, senza necessariamente scriverlo (§5). |
| Revisore | Ruolo | Il soggetto che controlla il Contenuto prima della pubblicazione (§5). |
| Responsabile editoriale | Ruolo | Il soggetto che assume la responsabilità ultima del Contenuto pubblicato (§5). |
| Soggetto descritto | Relazione | Il soggetto (Persona, Impresa, Professionista, ecc.) di cui il Contenuto parla principalmente (§8). |
| Oggetto descritto | Relazione | Il fatto di dominio (Opportunità, Evento, ecc.) di cui il Contenuto parla principalmente (§8). |
| Fonte | Entità dipendente | Da dove proviene un'informazione o un'affermazione riportata nel Contenuto (§7). |
| Riferimento documentale | Entità dipendente | Il materiale specifico citato o allegato a supporto di un'affermazione (§7). |
| Citazione | Componente del contenuto | Un Blocco editoriale che riporta testualmente quanto affermato da una Fonte. |
| Attribuzione | Concetto descrittivo | Il collegamento esplicito tra un'affermazione contenuta nel Contenuto e la Fonte che la sostiene (§7). |
| Contenuto multimediale | Componente del contenuto o relazione | Un Blocco editoriale di natura visiva, audio o video, oppure un materiale autonomo referenziato (es. una registrazione di un Evento, `logical/eventi.md` §3). |
| Traduzione editoriale | Entità dipendente | Una Versione del Contenuto espressa in una lingua diversa dall'originale (§9). |
| Lingua del contenuto | Concetto descrittivo (value object) | La lingua in cui una specifica Versione è redatta. |
| Categoria | Classificazione (Tassonomia Condivisa) | Un ambito tematico di alto livello (es. "internazionalizzazione", "sicurezza sul lavoro"). |
| Tema | Classificazione (Tassonomia Condivisa) | Un argomento più specifico della Categoria. |
| Etichetta | Classificazione (Tassonomia Condivisa) | Un tag libero e trasversale, coerente con il meccanismo di classificazione già descritto in `docs/domain-model.md` §9. |
| Serie editoriale | Entità dipendente o relazione | Un raggruppamento di più Contenuti collegati tra loro da un fil rouge editoriale (§4, §13). |
| Stato editoriale | Asse di stato, non entità | La fase di lavorazione redazionale del Contenuto (§10). |
| Stato di verifica | Asse di stato, non entità | Quanto la piattaforma può confermare rispetto a quanto affermato nel Contenuto (§10). |
| Stato di pubblicazione | Asse di stato, non entità | Se e come il Contenuto è stato rilasciato al pubblico (§10). |
| Visibilità | Asse di stato, non entità | Chi può conoscere l'esistenza e i dettagli del Contenuto (§12). |
| Periodo di validità informativa | Concetto descrittivo (value object) | L'intervallo in cui l'informazione contenuta resta attuale (§11). |

**Entità autonome, componenti, ruoli, classificazioni e relazioni.**
- **Entità autonome**: Contenuto editoriale, Versione, Fonte, Riferimento documentale, Traduzione editoriale.
- **Componenti del contenuto (struttura interna)**: Titolo, Sommario, Corpo, Sezione, Blocco editoriale, Citazione, Contenuto multimediale.
- **Ruoli**: Autore, Curatore, Revisore, Responsabile editoriale — tutti riferiti a soggetti di altri domini (Persona, Professionista) o alla redazione stessa (§5), mai nuove schede descrittive parallele.
- **Classificazioni**: Tipologia editoriale, Categoria, Tema, Etichetta, Serie editoriale.
- **Relazioni verso altri domini**: Soggetto descritto, Oggetto descritto, Attribuzione verso una Fonte (§7, §8).
- **Assi di stato**: Stato editoriale, Stato di verifica, Stato di pubblicazione, Visibilità, a cui si aggiungono, nel ciclo di vita completo (§10), la Validità informativa e lo Stato legale o di contestazione.

**Principio di non duplicazione.** Nessuno dei concetti sopra duplica Persona, Impresa, Evento, Opportunità, Mercato internazionale o dato statistico dell'Osservatorio: Soggetto descritto e Oggetto descritto sono sempre referenze a entità definite in altri domini, mai copie dei loro dati; una Fonte che coincide con un dato dell'Osservatorio referenzia quel dato per identità, senza copiarne il contenuto statistico.

---

## 3. Natura del Contenuto editoriale

**Elementi minimi che distinguono un Contenuto editoriale da una semplice comunicazione.**
- **Identità** — un riferimento stabile che distingue il Contenuto da qualsiasi altro.
- **Finalità** — un motivo redazionale dichiarato (informare, formare, raccontare, documentare, promuovere, §4).
- **Titolo o denominazione** — con cui il Contenuto è presentato e cercato.
- **Corpo informativo** — il contenuto effettivo, anche minimo.
- **Responsabilità editoriale** — un Responsabile editoriale o un Autore identificabile (§5, §13).
- **Lingua** — la lingua in cui la Versione considerata è redatta.
- **Stato editoriale** — la fase di lavorazione in cui si trova (§10).
- **Eventuali Fonti** — quando il Contenuto riporta affermazioni che richiedono un'attribuzione (§7).
- **Datazione** — quando è stato redatto, pubblicato o aggiornato (§11).
- **Visibilità** — chi può conoscerne l'esistenza (§12).

Un materiale che manchi di uno o più di questi elementi minimi non costituisce un Contenuto editoriale in senso proprio, e resta una semplice nota o comunicazione interna.

**Distinzioni.**
- **Contenuto originale** — prodotto per la prima volta da questo dominio, senza derivare da un altro Contenuto.
- **Contenuto derivato** — costruito a partire da uno o più Contenuti esistenti (una sintesi, un aggiornamento, una raccolta).
- **Sintesi** — un Contenuto derivato che condensa informazioni più estese, proprie o di terzi (es. una sintesi di rapporti dell'Osservatorio).
- **Traduzione** — una Versione in una lingua diversa dall'originale (§9), che non costituisce un nuovo Contenuto originale.
- **Aggiornamento** — una nuova Versione dello stesso Contenuto che ne rinnova l'attualità (§6, §11).
- **Ripubblicazione** — la nuova diffusione di un Contenuto già pubblicato, con o senza modifiche (§6).
- **Citazione** — un Blocco editoriale che riporta testualmente una Fonte esterna, senza costituire un Contenuto autonomo.
- **Aggregazione** — un Contenuto che raccoglie e organizza riferimenti ad altri Contenuti (una raccolta, uno speciale editoriale, §4).
- **Contenuto generato a partire da dati** — un Contenuto la cui base informativa primaria proviene da un'analisi dell'Osservatorio o da un altro insieme di dati aggregati (§1, §7).
- **Contenuto importato** — un Contenuto la cui origine primaria è esterna alla piattaforma, che deve conservare provenienza e attribuzione (§7, §13).
- **Contenuto istituzionale** — un Contenuto che rappresenta una posizione ufficiale della piattaforma stessa o di un ente pubblico referenziato (§4).
- **Contenuto promozionale** — un Contenuto la cui finalità principale è la promozione di un soggetto o di un'offerta, con la propria natura dichiarata in modo trasparente (§4, §13).

---

## 4. Tipologie editoriali

| Gruppo | Tipologie |
|---|---|
| Attualità | Notizia; comunicato |
| Approfondimento | Guida; approfondimento; analisi; editoriale; dossier |
| Voce e testimonianza | Intervista; storia personale; storia di impresa; reportage |
| Documentazione pratica | Scheda pratica; glossario; domanda frequente; sintesi |
| Verifica e giudizio | Caso studio; recensione documentale |
| Presentazione di fatti di dominio | Presentazione di Evento; presentazione di Opportunità; contenuto su Mercato internazionale |
| Istituzionale e stabile | Contenuto istituzionale; pagina informativa stabile |
| Formato | Contenuto multimediale |
| Raggruppamento | Raccolta o speciale editoriale |

**Principio.** Un Contenuto può appartenere a più classificazioni contemporaneamente (es. una storia personale che è anche un contenuto multimediale, o una guida che è anche una scheda pratica), ma deve avere una **finalità editoriale principale riconoscibile** (§3): la classificazione per tipologia è un criterio di organizzazione e ricerca, non un vincolo esclusivo sulla natura del Contenuto.

**Nota su storia personale e storia di impresa.** Come chiarito nell'introduzione e al §1, la storia personale resta un'entità del dominio Persone (`logical/persone.md`, Decisione 4), trattata qui come Tipologia editoriale ai fini di ricerca, classificazione e distribuzione; la storia di impresa è invece un Contenuto editoriale posseduto da questo dominio, che referenzia l'Impresa come Soggetto descritto (`logical/imprese.md` §1, §5).

---

## 5. Autori, curatori e responsabilità editoriale

**Ruoli.**

| Ruolo | Significato |
|---|---|
| Autore | Ha materialmente prodotto il Contenuto o una sua parte |
| Coautore | Condivide l'autorialità con almeno un altro Autore |
| Intervistatore | Ha condotto un'Intervista, distinto dal Soggetto intervistato (§8) |
| Curatore | Organizza e coordina il Contenuto, senza necessariamente scriverlo |
| Redattore | Compone o adatta il Contenuto secondo le regole redazionali della piattaforma |
| Revisore | Controlla il Contenuto prima della pubblicazione |
| Fact-checker | Verifica specificamente le affermazioni fattuali del Contenuto (§7) |
| Traduttore | Produce una Traduzione editoriale (§9) |
| Responsabile editoriale | Assume la responsabilità ultima del Contenuto pubblicato |
| Soggetto che approva | Autorizza il passaggio del Contenuto verso la pubblicazione, distinto dal Responsabile editoriale quando i due ruoli non coincidono |
| Fonte | Ha fornito un'informazione o un'affermazione riportata (§7), senza essere Autore del Contenuto |
| Soggetto intervistato | Ha risposto a un'Intervista, distinto dall'Intervistatore |
| Soggetto descritto | Compare come argomento del Contenuto, senza averlo prodotto (§8) |
| Collaboratore esterno | Contribuisce al Contenuto senza un ruolo redazionale stabile all'interno della piattaforma |

**Possibili autori.** Persona (`logical/persone.md`); Professionista (`logical/professionisti.md`); redazione (la piattaforma stessa, senza un Autore individuale); Impresa (`logical/imprese.md`); associazione; ente pubblico; università; organizzazione esterna; autore non presente sulla piattaforma (referenziato per nome, senza una scheda propria).

**Principio sulla rappresentanza.** Una Persona che scrive per conto di un'Impresa o di un'altra organizzazione deve essere contestualizzata attraverso Appartenenze (`logical/appartenenze.md`): il ruolo di Autore assunto in un Contenuto non genera esso stesso una relazione di rappresentanza, ma la presuppone quando il Contenuto è dichiarato "a nome di" un'Impresa, coerente con il principio già stabilito in `logical/eventi.md` §5 e `logical/professionisti.md` §4.

**Principio sulla responsabilità editoriale.** La responsabilità editoriale non coincide automaticamente con l'autorialità: un Contenuto può avere un Autore esterno e un Responsabile editoriale interno alla redazione che ne autorizza e ne risponde la pubblicazione; un Contenuto creato dalla redazione può non avere alcun Autore individuale, pur avendo sempre un Responsabile editoriale (§13, regola 1).

---

## 6. Versioni, revisioni e storico

| Concetto | Significato |
|---|---|
| Prima stesura | La prima Versione prodotta di un Contenuto, ancora in fase di lavorazione |
| Versione | Uno stato specifico e storicizzato del Contenuto in un dato momento (§2) |
| Revisione | Un controllo e un eventuale intervento sul Contenuto da parte di un Revisore, che può generare una nuova Versione |
| Correzione | Una modifica di natura formale (ortografia, sintassi), senza impatto sul significato |
| Aggiornamento | Una modifica che rinnova l'attualità del Contenuto, generando una nuova Versione (§3, §11) |
| Integrazione | Un'aggiunta di informazioni che completa il Contenuto senza sostituirne il significato originario |
| Modifica sostanziale | Un cambiamento che altera il significato o le conclusioni del Contenuto, da storicizzare sempre |
| Modifica formale | Un cambiamento che non altera il significato sostanziale (es. una Correzione) |
| Ritiro | La rimozione del Contenuto dalla pubblicazione, in modo reversibile o definitivo (§10, §11) |
| Sostituzione | Il rimpiazzo di una Versione con un'altra che ne prende il posto nei percorsi correnti |
| Rettifica | Una modifica sostanziale resa necessaria da un errore o da una contestazione, con nota esplicita (§13) |
| Nota editoriale | Un'annotazione visibile che segnala una circostanza rilevante (una Rettifica, un Aggiornamento, una Contestazione) |
| Ripubblicazione | La nuova diffusione di un Contenuto già pubblicato (§3) |
| Archiviazione | Il passaggio del Contenuto verso una conservazione storica, fuori dai percorsi correnti (§10, §11) |

**Cosa deve poter essere conservato a ogni modifica rilevante.**
- La Versione precedente, integralmente.
- La motivazione della modifica.
- L'Autore o il Curatore della modifica.
- La datazione della modifica.
- Lo stato precedente (editoriale, di verifica, di pubblicazione, §10).
- Le eventuali Fonti aggiunte o rimosse (§7).

**Principio.** Una nuova Versione non deve cancellare automaticamente quella precedente (§13, regola 6-7): lo storico redazionale resta sempre consultabile, anche quando il Contenuto è stato più volte rivisto, aggiornato o rettificato.

---

## 7. Fonti, evidenze e attribuzioni

**Tipologie di Fonte.**

| Fonte | Significato |
|---|---|
| Primaria | Proviene direttamente da chi ha vissuto o generato il fatto descritto |
| Secondaria | Riporta o commenta un fatto già documentato altrove |
| Ufficiale | Proviene da un ente, un'istituzione o un'organizzazione con titolo per dichiararlo |
| Giornalistica | Proviene da un altro organo di informazione |
| Accademica | Proviene da un ente di ricerca o studio |
| Statistica | Proviene da una rilevazione quantitativa, incluso l'Osservatorio (§1) |
| Istituzionale | Proviene da un ente pubblico o da un'organizzazione a carattere pubblico |
| Dichiarazione diretta | Una dichiarazione raccolta direttamente dal soggetto |
| Intervista | Una Fonte raccolta tramite un'Intervista strutturata (§4, §5) |
| Documento | Un Riferimento documentale specifico (§2) |
| Comunicato | Un testo ufficiale diffuso da un soggetto per informare |
| Contenuto di terzi | Un materiale prodotto da un soggetto esterno alla piattaforma |
| Anonima | Non identificata pubblicamente, pur essendo nota alla redazione |
| Riservata | Identificata, ma non divulgata per tutela del soggetto |
| Non verificata | Non ancora sottoposta a un controllo di attendibilità |
| Non più disponibile | Non più consultabile o raggiungibile, senza che questo comprometta il fatto già raccolto |
| Contraddittoria | In contrasto con un'altra Fonte relativa allo stesso fatto |

**Attribuzione.**
- **Attribuzione** — il collegamento esplicito tra un'affermazione e la Fonte che la sostiene.
- **Citazione** — il riporto testuale di quanto affermato da una Fonte (§2).
- **Parafrasi** — una riformulazione non testuale di quanto affermato da una Fonte, con Attribuzione comunque necessaria.
- **Riferimento** — un rinvio generico a una Fonte senza riporto testuale né parafrasi puntuale.
- **Collegamento tra affermazione e fonte** — la struttura minima che rende un'Attribuzione verificabile.
- **Evidenza a sostegno** — ciò che concretamente dimostra la Fonte (un Riferimento documentale, una registrazione, una comunicazione), analoga per ruolo all'Evidenza già definita negli altri domini logici.
- **Livello di affidabilità** — una valutazione qualitativa della Fonte, dichiarata separatamente per ciascuna Fonte, non per il Contenuto nel suo complesso.
- **Data di consultazione** — quando la Fonte è stata effettivamente consultata.
- **Validità temporale della fonte** — se e per quanto tempo l'informazione fornita dalla Fonte resta attuale, distinta dalla validità informativa del Contenuto (§11).

**Principio.** Va evitato un unico stato generico "contenuto verificato": un Contenuto può avere una Fonte Primaria verificata su un fatto e una Fonte Secondaria non verificata su un altro; il livello di affidabilità si dichiara Fonte per Fonte, mai come giudizio complessivo indistinto sul Contenuto, coerente con il principio già adottato in `logical/professionisti.md` §11 e `logical/eventi.md` §12.

---

## 8. Collegamento con i fatti di dominio

**Domini referenziabili.** Persona; Impresa; Appartenenza; Professionista; Opportunità; Collaborazione; Evento; Mercato internazionale; dato o analisi dell'Osservatorio; organizzazione; territorio; settore — sempre per riferimento, mai per incorporazione (§1).

**Ruoli del collegamento.**

| Ruolo | Significato |
|---|---|
| Soggetto principale | Il Soggetto descritto (§2) di cui il Contenuto parla in modo predominante |
| Soggetto citato | Un soggetto menzionato senza essere l'argomento principale |
| Soggetto intervistato | Il soggetto che ha risposto a un'Intervista (§4, §5) |
| Oggetto principale | Il fatto di dominio (§2) di cui il Contenuto parla in modo predominante |
| Contesto | Un soggetto o un fatto di dominio che inquadra il Contenuto senza esserne l'argomento |
| Fonte | Un soggetto che ha fornito un'informazione, distinto da Soggetto principale o citato (§7) |
| Caso esemplificativo | Un soggetto o un fatto usato come esempio a supporto di un'affermazione più generale |

**Principi cardine.**
- **Il Contenuto non deve modificare automaticamente il fatto di dominio descritto**: pubblicare un articolo su un'Impresa, un'Opportunità o un Evento non altera in alcun modo lo stato, la verifica o la visibilità di quell'entità nel proprio dominio nativo (§1, introduzione).
- **Una dichiarazione contenuta in un'intervista non deve diventare automaticamente un dato verificato del profilo di Persona o Impresa**: ciò che una Persona o un'Impresa affermano in un'Intervista resta un'Attribuzione a quella Fonte (§7) all'interno di questo dominio, e non genera né modifica una CompetenzaDichiarata, una QualificaProfessionale o qualsiasi altro dato del dominio referenziato, che resta soggetto esclusivamente alle proprie regole di dichiarazione e verifica (`logical/persone.md`, `logical/imprese.md`, `logical/professionisti.md`).

---

## 9. Lingue, traduzioni e adattamenti

- **Lingua originale** — la lingua in cui il Contenuto è stato redatto per la prima volta.
- **Lingua di pubblicazione** — la lingua in cui una specifica Versione è resa pubblica, che può coincidere o non coincidere con la Lingua originale.
- **Traduzione** — una Versione del Contenuto in una lingua diversa dall'originale (§2, §3).
- **Adattamento** — una Traduzione che modifica la forma per adeguarsi al contesto culturale o linguistico di destinazione, pur mantenendo il significato sostanziale.
- **Sintesi tradotta** — una Traduzione che riporta solo una parte condensata del Contenuto originale.
- **Revisione linguistica** — un controllo di qualità linguistica su una Traduzione, distinto dalla Revisione redazionale generale (§5, §6).
- **Traduzione verificata** — una Traduzione il cui Stato di verifica (§10) risulta confermato rispetto alla fedeltà all'originale.
- **Traduzione automatica dichiarata** — una Traduzione prodotta con strumenti automatici, esplicitamente segnalata come tale (§13, regola 14).
- **Versione semplificata** — una Versione con un linguaggio più accessibile, senza necessariamente cambiare lingua.
- **Linguaggio tecnico** — un registro linguistico specialistico, adatto a un pubblico esperto.
- **Linguaggio accessibile** — un registro linguistico pensato per la massima comprensione.
- **Contenuto multilingue** — un Contenuto disponibile in più Lingue contemporaneamente, tramite più Traduzioni.
- **Contenuto parzialmente tradotto** — un Contenuto multilingue in cui non tutte le Versioni linguistiche coprono l'intero Corpo (§13).

**Distinzioni.**
- **Traduzione fedele** — riproduce il significato sostanziale senza alterazioni.
- **Adattamento editoriale** — modifica la forma per il contesto di destinazione, mantenendo il significato sostanziale.
- **Localizzazione** — un Adattamento che tiene conto anche di convenzioni culturali specifiche (unità di misura, riferimenti locali).
- **Sintesi** — condensa senza necessariamente tradurre (§3).
- **Contenuto autonomo ispirato a un altro** — un nuovo Contenuto originale che trae spunto da un altro senza costituirne una Traduzione o un Adattamento.

**Principio sui servizi linguistici.** I servizi linguistici applicati ai Contenuti editoriali devono restare **accessori e trasversali** alla funzione informativa ed economica della piattaforma: la piattaforma non deve trasformarsi in un portale generalista di traduzione o interpretariato (coerente con il principio già stabilito in `logical/eventi.md` §10 e con il perimetro di `logical/professionisti.md` §5 per traduttori e mediatori linguistici come categoria professionale distinta).

**Attenzione particolare: guide operative, sicurezza sul lavoro, edilizia e cantieri.** Coerente con `logical/eventi.md` §10, il dominio deve poter rappresentare con particolare cura:
- **Guide operative** e materiali di **sicurezza sul lavoro**, specialmente per **edilizia e cantieri**, dove l'efficacia informativa dipende dalla comprensione linguistica effettiva dei lavoratori destinatari, non dalla sola disponibilità formale di una Traduzione.
- **Materiali destinati a lavoratori** nella lingua che essi comprendono effettivamente, anche quando questa non coincide con la lingua ufficiale del territorio.
- **Adattamento culturale senza alterazione del contenuto tecnico**: un Adattamento o una Localizzazione applicati a una guida di sicurezza non devono mai compromettere l'esattezza tecnica dell'informazione originale (§6, regola sulle modifiche sostanziali).

---

## 10. Ciclo di vita editoriale

Il percorso di un Contenuto editoriale è descritto da **sei assi distinti**, che non devono mai essere compressi in un unico stato, coerente con l'approccio già adottato in tutti i domini logici precedenti.

**a) Stato di lavorazione editoriale.** Descrive dove si trova, nel proprio percorso redazionale, il Contenuto:
- *Proposta* — un'idea di Contenuto è stata avanzata, non ancora accolta.
- *Acquisito* — la proposta è stata accolta e assegnata per la produzione.
- *Bozza* — il Contenuto è in fase di prima stesura (§6).
- *In lavorazione* — la stesura è in corso, con Autori o Curatori attivi.
- *In revisione* — il Contenuto è sottoposto a un Revisore (§5, §6).
- *Approvato* — il Contenuto ha superato la revisione ed è pronto per la pubblicazione.
- *Respinto* — il Contenuto non ha superato la revisione o l'approvazione, e non procede verso la pubblicazione.

**b) Stato di verifica.** Analogo per ruolo a quello degli altri domini (§7): un Contenuto può risultare *non verificato*, *in verifica* o *verificato* rispetto a ciascuna delle proprie affermazioni sostenute da una Fonte, indipendentemente dal proprio Stato di lavorazione.

**c) Stato di pubblicazione.**
- *Programmato* — la pubblicazione è pianificata per un momento successivo.
- *Pubblicato* — il Contenuto è stato rilasciato al pubblico secondo la Visibilità applicabile (§12).
- *Aggiornato* — una nuova Versione pubblicata ha rinnovato l'attualità del Contenuto (§6, §11).

**d) Visibilità.** Trattata integralmente al §12: descrive chi può conoscere l'esistenza e i dettagli del Contenuto, indipendentemente dal suo Stato di pubblicazione (un Contenuto Pubblicato può comunque essere visibile solo a una rete, §12).

**e) Validità informativa.** Descrive se l'informazione contenuta resta attuale (§11):
- *Scaduto* — il Periodo di validità informativa dichiarato (§2, §11) è terminato.
- *Archiviato* — il Contenuto è stato ritirato dai percorsi di consultazione correnti, restando conservato come riferimento storico.

**f) Stato legale o di contestazione.** Un asse distinto per le circostanze che richiedono un intervento sul Contenuto già pubblicato:
- *Sospeso* — il Contenuto è temporaneamente ritirato dalla pubblicazione, in modo reversibile.
- *Ritirato* — il Contenuto è stato rimosso dalla pubblicazione, in modo tendenzialmente stabile (§6, §13).
- *Rettificato* — il Contenuto è stato corretto a seguito di un errore o di una richiesta fondata (§6, §13).
- *Contestato* — una o più affermazioni del Contenuto sono state messe in dubbio da un soggetto coinvolto o da un terzo con titolo per farlo; può sovrapporsi in qualsiasi momento agli altri assi.

**Perché i sei assi restano separati.** Un Contenuto può essere Approvato (asse a) e non ancora Verificato su tutte le proprie affermazioni (asse b); può essere Pubblicato (asse c) e al contempo Contestato (asse f) su un singolo passaggio, senza che l'intero Contenuto debba essere Ritirato; può essere Scaduto (asse e) pur restando Pubblico (asse d) per ragioni storiche (§11); può essere Aggiornato (asse c) più volte mantenendo lo stesso Stato di lavorazione "Approvato" (asse a) per ciascuna nuova Versione. Comprimere questi sei assi in un'unica proprietà obbligherebbe a scegliere significati impropri per combinazioni reali e frequenti.

---

## 11. Pubblicazione, validità e obsolescenza

- **Pubblicazione immediata** — il Contenuto diventa pubblico non appena Approvato.
- **Pubblicazione programmata** — il Contenuto diventa pubblico a una data futura dichiarata (§10, "Programmato").
- **Pubblicazione temporanea** — il Contenuto resta pubblico solo per un intervallo dichiarato, oltre il quale rientra automaticamente in uno stato non pubblico.
- **Contenuto permanente** — non ha una scadenza informativa dichiarata.
- **Contenuto con validità limitata** — ha un Periodo di validità informativa dichiarato (§2), oltre il quale risulta Scaduto (§10).
- **Contenuto aggiornabile** — può ricevere nuove Versioni che ne rinnovano l'attualità (§6).
- **Contenuto obsoleto** — non più aggiornato, la cui attualità informativa è superata dai fatti, indipendentemente da una scadenza formalmente dichiarata.
- **Contenuto scaduto** — ha superato il proprio Periodo di validità informativa dichiarato (§10).
- **Contenuto superato** — è stato sostituito nella funzione informativa da un Contenuto più recente, senza necessariamente essere Scaduto in senso formale.
- **Contenuto ritirato** — rimosso dalla pubblicazione (§6, §10).
- **Contenuto archiviato** — conservato come riferimento storico, fuori dai percorsi correnti (§10).
- **Contenuto sostituito** — la cui funzione informativa è stata presa in carico da un altro Contenuto, con un collegamento esplicito tra i due.
- **Contenuto ancora consultabile per ragioni storiche** — un Contenuto Scaduto, Superato o Archiviato che resta accessibile con un'indicazione chiara della propria natura non più attuale.

**Distinzioni sulle date.**
- **Data del fatto** — quando è avvenuto ciò che il Contenuto descrive, indipendente dalla redazione del Contenuto stesso.
- **Data di redazione** — quando il Contenuto è stato scritto.
- **Data di pubblicazione** — quando il Contenuto è stato reso pubblico.
- **Data di aggiornamento** — quando l'ultima Versione pubblicata è stata rilasciata.
- **Data di scadenza informativa** — il termine del Periodo di validità informativa dichiarato.
- **Periodo descritto** — l'intervallo temporale a cui il Contenuto si riferisce (es. un'analisi su un trimestre specifico).
- **Periodo di validità** — l'intervallo in cui l'informazione resta considerata attuale (§2).

**Principio.** Un Contenuto obsoleto non deve necessariamente essere cancellato, ma la sua natura storica deve risultare chiara: la piattaforma può conservarlo come riferimento (§10, "Archiviato"), purché la sua condizione di Contenuto non più attuale sia sempre visibile a chi lo consulta, coerente con il principio già adottato per le entità storicizzate in tutti i domini logici precedenti.

---

## 12. Visibilità, accesso editoriale e riservatezza

- **Privato** — noto solo a chi lo ha creato.
- **Visibile all'autore** — noto all'Autore, anche quando altri ruoli redazionali non vi hanno ancora accesso.
- **Visibile alla redazione** — noto al team redazionale durante la lavorazione (§10, asse a).
- **Visibile ai revisori** — noto ai Revisori assegnati (§5).
- **Visibile ai soggetti descritti** — noto ai Soggetti descritti (§8), tipicamente per una verifica preliminare o un diritto di replica (§13).
- **Visibile a una rete** — noto a chi appartiene a una rete specifica.
- **Visibile a destinatari selezionati** — condiviso con un insieme specifico di destinatari.
- **Pubblico** — visibile a chiunque consulti la piattaforma.
- **Non indicizzato** — pubblico ma escluso dai risultati di ricerca generali, pur restando raggiungibile direttamente.
- **Sotto embargo** — non ancora divulgabile fino a un momento dichiarato, anche se già redatto e revisionato.
- **Riservato** — accessibile solo a un insieme ristretto e qualificato di soggetti, anche dopo la pubblicazione.
- **Ritirato ma conservato** — non più nei percorsi di pubblicazione correnti, ma conservato (§6, §11).
- **Contestato** — visibile con un'indicazione esplicita che uno o più elementi sono in dubbio (§10, asse f).
- **Archiviato** — non più nei percorsi correnti, conservato come riferimento storico (§10, asse e).

**Distinzioni.**
- **Visibilità del contenuto** — chi può conoscere il Contenuto nel suo complesso.
- **Visibilità delle fonti** — chi può conoscere le Fonti a sostegno, indipendente dalla visibilità del Contenuto stesso (una Fonte Riservata o Anonima può restare non divulgata anche a fronte di un Contenuto Pubblico, §7).
- **Visibilità delle evidenze** — chi può consultare le Evidenze a sostegno di una Fonte (§7).
- **Visibilità delle note redazionali** — chi può leggere le Note editoriali (§6), tipicamente riservate alla redazione.
- **Visibilità dei dati personali** — deve sempre rispettare la visibilità stabilita dal dominio Persone per il soggetto coinvolto (§13).
- **Visibilità dei documenti di supporto** — chi può consultare i Riferimenti documentali allegati (§7), indipendente dalla visibilità del Contenuto.

**Principio.** Contenuti Editoriali non attribuisce diritti tecnici di accesso: le distinzioni di visibilità sopra descritte sono fatti di dominio che regolano cosa la piattaforma intende mostrare a chi, non un meccanismo di autenticazione o autorizzazione tecnica. Tali diritti appartengono esclusivamente al futuro dominio Identità & Accessi.

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Contenuto deve avere una responsabilità editoriale identificabile (§3, §5): un Responsabile editoriale, anche quando l'Autore individuale non è dichiarato.
2. Il Contenuto non coincide con il fatto che descrive (§1, §8, introduzione).
3. Un Contenuto pubblicato non rende automaticamente verificato il soggetto descritto (§8): la pubblicazione è un fatto di questo dominio, la verifica del soggetto è un fatto del suo dominio nativo.
4. Una dichiarazione riportata non equivale a fatto accertato (§7, §8).
5. Una traduzione non deve alterare il significato sostanziale (§9).
6. Una revisione sostanziale deve poter essere storicizzata (§6).
7. Una rettifica non deve cancellare automaticamente la versione precedente (§6, §10).
8. Un contenuto obsoleto può essere conservato come storico (§11).
9. Una fonte non più disponibile non rende automaticamente falso il contenuto (§7): il fatto raccolto resta valido anche se la Fonte non è più raggiungibile.
10. Una fonte ufficiale non è automaticamente aggiornata (§7): la sua Validità temporale deve essere valutata comunque.
11. Un contenuto importato deve conservare provenienza e attribuzione (§3, §7).
12. Una citazione deve essere distinguibile dal testo redazionale (§2, §7).
13. Un contenuto contestato non deve essere cancellato automaticamente (§10, asse f): resta visibile con l'indicazione della contestazione, salvo un successivo Ritiro deciso secondo le proprie regole.
14. La pubblicazione di dati personali o commerciali deve rispettare la visibilità dei domini interessati (§8, §12): un Contenuto non può rivelare più di quanto il dominio nativo del soggetto descritto consenta.
15. Contenuti Editoriali non attribuisce rappresentanza o diritti di accesso (§5, §12).
16. Il dominio deve poter fornire materiale all'Osservatorio senza confondersi con esso (§1).

**Casi limite.**

**Notizia basata su una sola fonte.** Ammessa, con il Livello di affidabilità dichiarato per quell'unica Fonte (§7): non richiede un numero minimo di Fonti, ma la trasparenza sulla loro numerosità.

**Intervista non confermata dal soggetto.** Il Contenuto può essere pubblicato con l'Attribuzione dichiarata come non confermata dal Soggetto intervistato (§5, §7, §8), distinta da un'Intervista con conferma esplicita.

**Contenuto pubblicato da un'Impresa su se stessa.** Ammesso come Autore "Impresa" (§5): la sua natura di fonte non indipendente deve essere riconoscibile tramite la Tipologia editoriale (es. Comunicato, Contenuto promozionale, §4) e l'Attribuzione dell'Autore stesso.

**Comunicato ripreso senza verifica indipendente.** Il Contenuto risultante mantiene lo Stato di verifica "non verificato" per le affermazioni non controllate autonomamente (§10, asse b), anche quando il Comunicato stesso è una Fonte Ufficiale (§7).

**Fonte ufficiale successivamente modificata.** Genera l'evento FonteContestata o una nuova valutazione della Validità temporale della Fonte (§7, §14), senza alterare automaticamente il Contenuto già pubblicato, che può necessitare di un Aggiornamento o di una Rettifica (§6, §10).

**Articolo corretto dopo la pubblicazione.** Corrisponde a una nuova Versione (Correzione, Aggiornamento o Rettifica secondo la natura della modifica, §6), con la Versione precedente conservata (regola 6-7).

**Titolo modificato senza modificare il corpo.** Una Modifica formale o sostanziale a seconda che il cambiamento di Titolo alteri o non alteri il significato comunicato (§6): genera comunque una nuova Versione se rilevante.

**Rettifica richiesta dal soggetto descritto.** Il Soggetto descritto (§8) può richiedere una Rettifica (§6, §10): la richiesta stessa non comporta l'automatica accettazione, che segue il processo redazionale ordinario (Revisore, Responsabile editoriale, §5), ma deve poter essere registrata come fatto (questione aperta sul diritto di replica, §15).

**Contenuto contestato.** Corrisponde allo stato "Contestato" (§10, asse f, §12): rappresentato come fatto, senza cancellazione automatica (regola 13).

**Fonte anonima.** Prevista esplicitamente (§7): la piattaforma può conoscere l'identità della Fonte pur non divulgandola, oppure non conoscerla affatto, con un Livello di affidabilità conseguentemente più cauto.

**Fonte riservata.** Prevista esplicitamente (§7): identità nota alla redazione, non divulgata pubblicamente (§12, "Visibilità delle fonti").

**Documento non più disponibile.** Corrisponde a un Riferimento documentale la cui consultazione non è più possibile (§7): il fatto raccolto tramite quel documento, quando la Data di consultazione è dichiarata, resta comunque valido (regola 9).

**Contenuto tradotto automaticamente.** Corrisponde a "Traduzione automatica dichiarata" (§9): deve essere sempre segnalata come tale, distinta da una Traduzione curata da un Traduttore (§5).

**Traduzione divergente dall'originale.** Un caso da segnalare tramite lo Stato di verifica della Traduzione (§9, §10, asse b): può generare una Revisione linguistica o una nuova Versione della Traduzione stessa.

**Contenuto multilingue incompleto.** Corrisponde a "Contenuto parzialmente tradotto" (§9): ammesso, con l'indicazione esplicita di quali Sezioni o Blocchi non sono ancora tradotti.

**Articolo su Evento cancellato.** Il Contenuto resta pubblicabile o consultabile come riferimento storico (§11), con l'Oggetto descritto (l'Evento) che riflette il proprio stato reale "Cancellato" (`logical/eventi.md` §12) senza che il Contenuto editoriale ne assorba automaticamente la responsabilità di aggiornamento, sebbene un Aggiornamento sia buona pratica redazionale.

**Guida su Opportunità scaduta.** Analogo al caso precedente: il Contenuto può restare consultabile come riferimento storico (§11) anche quando l'Opportunità referenziata (`logical/opportunita.md`) non è più attiva.

**Contenuto su Impresa cessata.** Analogo ai casi già trattati in `logical/mercati-internazionali.md` §13, `logical/opportunita.md` §13, `logical/collaborazioni.md` §13, `logical/professionisti.md` §13 e `logical/eventi.md` §13 per le rispettive relazioni con un'Impresa cessata (`logical/imprese.md` §5): il Contenuto resta storicizzato, referenziando l'Impresa nel proprio stato reale corrente.

**Intervista a Persona non più presente sulla piattaforma.** Il Contenuto resta consultabile come riferimento storico (§11), con il Soggetto intervistato che riflette lo stato corrente della Persona nel proprio dominio (`logical/persone.md`), senza che questo dominio ne trattenga una copia indipendente dei dati.

**Storia personale con informazioni sensibili.** Trattata secondo la Visibilità applicabile ai dati personali (§12): la responsabilità primaria di cosa è dichiarabile resta del dominio Persone (`logical/persone.md`), che questo dominio rispetta come vincolo di visibilità (regola 14).

**Contenuto creato dalla redazione senza autore individuale.** Ammesso esplicitamente (§5): il Responsabile editoriale resta sempre presente (regola 1), anche in assenza di un Autore individuale.

**Contenuto scritto da autore esterno.** Corrisponde a un Autore "organizzazione esterna" o "autore non presente sulla piattaforma" (§5), con Curatore e Responsabile editoriale interni che ne gestiscono la pubblicazione.

**Contenuto sponsorizzato.** Una Tipologia editoriale (§4) la cui natura commerciale deve essere dichiarata in modo trasparente, distinta da un Contenuto editoriale indipendente.

**Contenuto promozionale.** Analogo al caso precedente (§3, §4): ammesso, con la propria finalità dichiarata esplicitamente.

**Contenuto generato a partire da dati dell'Osservatorio.** Corrisponde a "Contenuto generato a partire da dati" (§3): l'Osservatorio agisce come Fonte (§1, §7), senza che il Contenuto risultante faccia parte del dominio Osservatorio.

**Contenuto che riassume più fonti.** Corrisponde a una Sintesi (§3) con più Attribuzioni distinte (§7), ciascuna con il proprio Livello di affidabilità.

**Serie editoriale con più autori.** Ammessa esplicitamente (§2): la Serie editoriale raggruppa Contenuti distinti, ciascuno con i propri Autori.

**Aggiornamento continuo.** Un Contenuto può ricevere molte Versioni nel tempo (§6, §10, asse c "Aggiornato"), mantenendo un'unica identità di Contenuto editoriale.

**Contenuto storico.** Corrisponde a "Contenuto ancora consultabile per ragioni storiche" (§11): il caso generale a cui molti dei casi limite precedenti (Evento cancellato, Opportunità scaduta, Impresa cessata) fanno riferimento.

**Duplicazione dello stesso contenuto in più lingue.** Corrisponde a un Contenuto multilingue tramite più Traduzioni editoriali (§9): non genera Contenuti distinti, ma Versioni linguistiche dello stesso Contenuto.

**Ritiro per motivi legali.** Corrisponde allo stato "Ritirato" (§10, asse f), con una motivazione specifica conservata (§6) anche quando il Contenuto non è più pubblicamente accessibile.

**Diritto di replica.** Il Soggetto descritto (§8) può richiedere che una propria risposta sia associata al Contenuto (questione aperta, §15): rappresentabile come un nuovo Contenuto collegato o come un'integrazione, secondo una regola operativa non ancora definita in questo documento.

**Richiesta di anonimizzazione.** Un Soggetto descritto, citato o intervistato può richiedere che la propria identità non risulti più associata al Contenuto (questione aperta, §15): il dominio deve poter rappresentare questa richiesta come fatto, con una regola operativa di dettaglio non ancora definita.

**Contenuto con più soggetti principali.** Ammesso esplicitamente (§8): il Soggetto principale non è limitato a un solo riferimento, quando il Contenuto tratta più soggetti con pari rilevanza.

---

## 14. Eventi di dominio

- **ContenutoProposto** — un'idea di Contenuto è stata avanzata (§10, asse a).
- **ContenutoAcquisito** — la proposta è stata accolta e assegnata (§10, asse a).
- **ContenutoCreato** — è stata prodotta la prima Bozza di un nuovo Contenuto.
- **ContenutoModificato** — una o più informazioni del Contenuto sono cambiate, senza rientrare in una categoria più specifica.
- **VersioneContenutoCreata** — una nuova Versione è stata generata (§6).
- **ContenutoInviatoInRevisione** — il Contenuto è stato sottoposto a un Revisore (§5, §10, asse a).
- **ContenutoVerificato** — una o più affermazioni del Contenuto sono state confermate (§7, §10, asse b).
- **ContenutoApprovato** — il Contenuto ha superato la revisione (§10, asse a).
- **ContenutoRespinto** — il Contenuto non ha superato la revisione o l'approvazione (§10, asse a).
- **ContenutoProgrammato** — la pubblicazione è stata pianificata per un momento successivo (§10, asse c, §11).
- **ContenutoPubblicato** — il Contenuto è stato rilasciato al pubblico (§10, asse c).
- **ContenutoAggiornato** — una nuova Versione pubblicata ha rinnovato l'attualità del Contenuto (§6, §10, asse c, §11).
- **ContenutoRettificato** — il Contenuto è stato corretto a seguito di un errore o di una richiesta fondata (§6, §10, asse f).
- **ContenutoContestato** — una o più affermazioni del Contenuto sono state messe in dubbio (§10, asse f).
- **ContenutoSospeso** — il Contenuto è transitato verso lo stato "Sospeso" (§10, asse f).
- **ContenutoRitirato** — il Contenuto è stato rimosso dalla pubblicazione (§6, §10, asse f).
- **ContenutoScaduto** — il Periodo di validità informativa dichiarato è terminato (§10, asse e, §11).
- **ContenutoArchiviato** — il Contenuto è stato ritirato dai percorsi di consultazione correnti, restando conservato come riferimento storico (§10, asse e, §11).
- **FonteAssociata** — una nuova Fonte è stata collegata a un'affermazione del Contenuto (§7).
- **FonteRimossa** — una Fonte precedentemente associata è stata rimossa (§6, §7).
- **FonteContestata** — una Fonte è stata messa in dubbio o segnalata come non più attendibile (§7, §13).
- **AutoreAssociato** — un soggetto è stato associato al ruolo di Autore (§5).
- **RevisoreAssociato** — un soggetto è stato associato al ruolo di Revisore (§5).
- **ResponsabileEditorialeAssociato** — un soggetto è stato associato al ruolo di Responsabile editoriale (§5).
- **TraduzioneCreata** — una nuova Traduzione editoriale è stata prodotta (§9).
- **TraduzioneRevisionata** — una Traduzione ha superato una Revisione linguistica (§9).
- **TraduzionePubblicata** — una Traduzione è stata rilasciata al pubblico (§9, §10).
- **SoggettoDescrittoAssociato** — un Soggetto descritto è stato collegato al Contenuto (§8).
- **OggettoDescrittoAssociato** — un Oggetto descritto è stato collegato al Contenuto (§8).
- **VisibilitàContenutoModificata** — il livello di visibilità del Contenuto è cambiato (§12).
- **EmbargoImpostato** — il Contenuto è stato posto sotto embargo (§12).
- **EmbargoTerminato** — l'embargo è terminato, rendendo il Contenuto divulgabile secondo la Visibilità applicabile (§12).
- **DirittoDiReplicaAssociato** — una richiesta o un contenuto di replica è stato collegato al Contenuto originale (§13).

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Notifiche, Ricerca, Osservatorio, Persone, Imprese) possono voler conoscere per reagire — ad esempio il dominio Notifiche può avvisare chi segue un tema o un soggetto quando avviene un ContenutoPubblicato, o il dominio Persone può considerare distribuita e classificata una propria StoriaPersonale quando avviene un evento equivalente — senza che questo dominio debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate.**

1. Contenuti Editoriali è un dominio autonomo, con proprie entità, proprio ciclo di vita e proprie regole (§1).
2. Il contenuto non coincide con il fatto di dominio che descrive (§1, §8, introduzione).
3. Contenuto, Versione e Traduzione sono concetti distinti (§2, §6, §9).
4. Autore, Curatore, Revisore e Responsabile editoriale sono ruoli distinti (§5).
5. Persona, Impresa, Evento, Opportunità, Collaborazione, Professionista e Mercato internazionale restano domini distinti (§1, §8).
6. Un contenuto può referenziare tali domini senza incorporarli (§1, §8).
7. Una dichiarazione riportata non equivale a fatto verificato (§7, §8, §13, regola 4).
8. Una fonte ufficiale non è automaticamente aggiornata o sufficiente (§7, §13, regola 10).
9. Stato editoriale, verifica, pubblicazione, visibilità, validità e contestazione sono assi separati (§10).
10. Le modifiche sostanziali devono poter essere storicizzate (§6, §13, regola 6).
11. Le rettifiche non devono cancellare automaticamente le versioni precedenti (§6, §13, regola 7).
12. I contenuti obsoleti possono essere conservati come materiali storici (§11, §13, regola 8).
13. Le traduzioni devono essere distinguibili dall'originale (§9).
14. Le traduzioni automatiche devono essere dichiarate (§9, §13).
15. I servizi linguistici restano accessori e trasversali (§9).
16. Il dominio supporta contenuti originali, derivati, tradotti, importati e multimediali (§2, §3).
17. Contenuti editoriali non attribuisce rappresentanza o diritti di accesso (§5, §12, §13, regola 15).
18. I diritti di accesso restano responsabilità di Identità & Accessi (§12).
19. La responsabilità editoriale deve essere identificabile (§3, §5, §13, regola 1).
20. Il dominio supporta diritto di replica, rettifica, contestazione, ritiro e archiviazione (§6, §10, §13).
21. Il dominio rispetta la riservatezza e la visibilità stabilite dagli altri domini (§8, §12, §13, regola 14).
22. Il dominio può utilizzare dati aggregati dell'Osservatorio senza confondersi con esso (§1, §3, §13, regola 16).

**Domande aperte.**

- Qual è il confine esatto, in termini operativi, tra Contenuti editoriali e i fatti di dominio quando un Contenuto diventa la principale fonte informativa su un soggetto poco documentato altrove?
- Qual è il confine esatto con l'Osservatorio, in particolare per i contenuti generati a partire da dati aggregati (§3, §13)?
- Qual è il confine esatto tra Fonte e Riferimento documentale, oltre alla distinzione concettuale già stabilita al §2 e al §7?
- Come deve essere rappresentato operativamente un autore esterno alla piattaforma (§5), in termini di verifica e attribuzione?
- Come devono essere trattati i contenuti prodotti da Imprese e associazioni su se stesse (§13), in termini di trasparenza redazionale?
- Con quali regole operative devono essere gestiti i contenuti promozionali (§3, §4, §13)?
- Con quali regole operative devono essere gestiti i contenuti sponsorizzati (§13)?
- Con quale processo concreto deve essere gestito il diritto di replica di un Soggetto descritto (§13, §14)?
- Con quale processo concreto devono essere gestite le rettifiche richieste da un soggetto descritto (§6, §13)?
- Chi, esattamente, può assumere il ruolo di Responsabile editoriale, e con quali eventuali livelli di responsabilità intermedi?
- Con quale procedura concreta si svolge la verifica di un'affermazione (§7, §10, asse b)?
- Con quali criteri concreti si stabilisce il Livello di affidabilità di una Fonte (§7)?
- Come deve essere trattata operativamente una Fonte anonima, in termini di conservazione dell'identità presso la redazione (§7, §13)?
- Come deve essere trattata operativamente una Fonte riservata, in termini di condizioni di eventuale divulgazione futura (§7, §13)?
- Con quale periodicità un Contenuto con validità limitata deve essere riesaminato (§11)?
- Con quali criteri concreti un Contenuto deve transitare verso lo stato Obsoleto o Archiviato (§10, §11)?
- Quali criteri concreti devono guidare la decisione di archiviazione definitiva rispetto alla sola conservazione storica (§11)?
- Quale responsabilità assume la piattaforma sulla qualità di una traduzione automatica dichiarata (§9)?
- Chi è responsabile, in termini operativi, della fedeltà di una Traduzione editoriale rispetto all'originale (§9)?
- Come deve essere rappresentata operativamente la relazione tra le diverse Versioni linguistiche dello stesso Contenuto multilingue (§9, §13)?
- Qual è il collegamento operativo esatto con Persone, oltre al trattamento della StoriaPersonale già stabilito al §1 e al §4?
- Qual è il collegamento operativo esatto con Imprese, oltre al trattamento delle StorieImpresa già stabilito al §1 e al §4?
- Qual è il collegamento operativo esatto con Eventi, oltre al riferimento già stabilito al §8?
- Qual è il collegamento operativo esatto con Opportunità, oltre al riferimento già stabilito al §8?
- Qual è il collegamento operativo esatto con Mercati Internazionali, oltre al riferimento già stabilito al §8?
- Quali dati di questo dominio, esattamente, potranno essere utilizzati dall'Osservatorio, e con quale livello di aggregazione?
- Con quali regole operative devono essere gestiti i contenuti multimediali, in particolare la loro conservazione e le relative attribuzioni (§2, §7)?
- Il dominio dovrà in futuro gestire i commenti del pubblico, e con quale eventuale confine rispetto alla messaggistica (§1)?
- Il dominio dovrà in futuro gestire direttamente le notifiche derivate dai propri eventi di dominio, o restare un semplice produttore di fatti per un dominio Notifiche autonomo (§1, §14)?
- Come devono essere trattati operativamente i materiali formativi collegati a un Corso (`logical/eventi.md` §10), in relazione a un eventuale futuro dominio Formazione?
- Con quale processo concreto deve essere gestita una richiesta di anonimizzazione di un soggetto descritto, citato o intervistato (§13)?
- Con quale processo concreto deve essere gestita una rimozione per motivi legali, oltre alla rappresentazione come stato "Ritirato" già stabilita al §10?
- Con quali criteri concreti deve essere conservato lo storico redazionale completo, oltre al principio generale di non cancellazione già stabilito al §6?

Queste domande restano decisioni progettuali future, coerenti con l'approccio già adottato in `logical/persone.md`, `logical/imprese.md`, `logical/appartenenze.md`, `logical/mercati-internazionali.md`, `logical/opportunita.md`, `logical/collaborazioni.md`, `logical/professionisti.md` e `logical/eventi.md`.

