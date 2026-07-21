# Domain Model — ImmigratiImprenditori.it

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi, indici, RLS, migration, API, componenti frontend o dettagli implementativi. Nessun codice.
> Ruolo di questo documento: sintesi autorevole e generale dell'architettura logica della piattaforma, coerente con gli 11 documenti logici di dominio già completati e con il rapporto di riconciliazione che li ha confrontati. Non duplica integralmente quei documenti: rappresenta le decisioni comuni, i confini tra domini e il linguaggio condiviso. Per il dettaglio di ciascun dominio, questo documento rimanda sempre al relativo documento logico specialistico.
> Fondamenti: [`docs/architecture/logical/persone.md`](./architecture/logical/persone.md), [`docs/architecture/logical/imprese.md`](./architecture/logical/imprese.md), [`docs/architecture/logical/appartenenze.md`](./architecture/logical/appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./architecture/logical/mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./architecture/logical/opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./architecture/logical/collaborazioni.md), [`docs/architecture/logical/professionisti.md`](./architecture/logical/professionisti.md), [`docs/architecture/logical/eventi.md`](./architecture/logical/eventi.md), [`docs/architecture/logical/contenuti-editoriali.md`](./architecture/logical/contenuti-editoriali.md), [`docs/architecture/logical/osservatorio.md`](./architecture/logical/osservatorio.md), [`docs/architecture/logical/identita-accessi.md`](./architecture/logical/identita-accessi.md), [`docs/architecture/logical/reconciliation-report.md`](./architecture/logical/reconciliation-report.md).
> Storia del documento. Questa è la seconda versione integrale di questo documento. La prima versione (precedente all'elaborazione dei 11 documenti logici specialistici) descriveva un modello a grana più larga, con domini come "Impresa & Organizzazioni", "Opportunità & Collaborazioni" e "Servizi" non ancora scomposti. Questa versione riflette la scomposizione e l'approfondimento avvenuti nel frattempo, restando fedele allo stesso impianto strategico.

---

## Indice

1. [Scopo e principi](#1-scopo-e-principi)
2. [Mappa dei domini](#2-mappa-dei-domini)
3. [Descrizione sintetica degli 11 domini](#3-descrizione-sintetica-degli-11-domini)
4. [Principi di proprietà dei fatti](#4-principi-di-proprietà-dei-fatti)
5. [Relazioni principali](#5-relazioni-principali)
6. [Cicli di vita e assi di stato](#6-cicli-di-vita-e-assi-di-stato)
7. [Verifica e affidabilità](#7-verifica-e-affidabilità)
8. [Visibilità e accesso](#8-visibilità-e-accesso)
9. [Contenuti, dati e conoscenza derivata](#9-contenuti-dati-e-conoscenza-derivata)
10. [Eventi di dominio](#10-eventi-di-dominio)
11. [Domini futuri e confini aperti](#11-domini-futuri-e-confini-aperti)
12. [Glossario canonico](#12-glossario-canonico)
13. [Decisioni architetturali vincolanti](#13-decisioni-architetturali-vincolanti)
14. [Questioni aperte](#14-questioni-aperte)
15. [Stato dell'architettura](#15-stato-dellarchitettura)

---

## 1. Scopo e principi

**Missione della piattaforma.** ImmigratiImprenditori.it rappresenta, connette e valorizza le Persone (in particolare, ma non esclusivamente, quelle di origine immigrata) e le Imprese che animano, le opportunità economiche e professionali a loro accessibili, e le relazioni internazionali che possono costruire — senza mai presumere che un'origine personale implichi automaticamente una competenza, una relazione o un'attività (principio di non-automatismo, ripreso in ogni documento logico).

**Modello centrato su Persone, Imprese e Opportunità.** L'architettura ha tre soggetti/concetti di primo piano — Persona, Impresa, Opportunità (con le Collaborazioni ad essa strettamente collegate) — e un quarto pilastro trasversale che li attraversa tutti: Mercati Internazionali. Appartenenza è il quinto elemento imprescindibile: il legame che rende Persona e Impresa concretamente collegate senza che l'una incorpori l'altra.

**Funzione comunitaria.** La piattaforma è un luogo di incontro e riconoscimento tra Persone e Imprese che condividono percorsi, mercati, competenze e lingue: Collaborazioni, Eventi e Storie personali (`persone.md`) servono innanzitutto questa funzione.

**Funzione informativa.** Contenuti editoriali (notizie, guide, storie) e i prodotti dell'Osservatorio informano, spiegano e contestualizzano, senza mai sostituirsi ai fatti che descrivono né modificarli.

**Funzione economica.** Opportunità, Collaborazioni, Mercati Internazionali e Professionisti costituiscono l'infrastruttura concettuale che rende possibile trovare un beneficio, un partner, un mercato o una competenza specialistica.

**Funzione dell'Osservatorio.** L'Osservatorio produce conoscenza derivata — misure, indicatori, interpretazioni — a partire dai dati di tutti gli altri domini, per restituire alla comunità e alle istituzioni una lettura aggregata dei fenomeni, senza mai diventare esso stesso fonte primaria né modificare i dati sorgente (§9).

**Consultazione pubblica e registrazione solo dove necessaria.** La piattaforma è pensata per essere in larga parte consultabile senza registrazione: profili pubblici, opportunità pubblicate, mercati, eventi, contenuti editoriali e prodotti dell'Osservatorio sono, per default concettuale, risorse pubblicamente consultabili quando il rispettivo dominio proprietario le rende pubbliche (§8). La registrazione (un Account, `identita-accessi.md`) è richiesta solo per le azioni che necessitano identità, responsabilità o tracciabilità — pubblicare, candidarsi, dichiarare, gestire — mai per il semplice atto di leggere.

**Separazione tra dominio e implementazione.** Questo documento e i suoi 11 fondamenti restano interamente al livello logico e di dominio: nessuna decisione qui contenuta anticipa o vincola scelte di database, API, frontend o infrastruttura. Il passaggio al livello fisico è un processo distinto, successivo e non ancora intrapreso per la maggior parte dei domini (§15).

---

## 2. Mappa dei domini

I domini non sono automaticamente "core": la classificazione riflette il ruolo strategico dichiarato da ciascun documento logico, non una preferenza di chi scrive.

| Dominio | Tipo | Motivazione della classificazione |
|---|---|---|
| **Persone** | Core | Soggetto primario della piattaforma; ogni altro dominio lo referenzia come autore, titolare o soggetto (`persone.md` §1) |
| **Imprese** | Core | Secondo pilastro dichiarato; rappresenta il soggetto economico che le Persone animano (`imprese.md` §1) |
| **Appartenenze** | Core (connettivo) | Non è un pilastro a sé, ma il legame imprescindibile senza il quale Persone e Imprese resterebbero due modelli isolati; nessuna azione "per conto di un'Impresa" è possibile senza di esso (`appartenenze.md` §1) |
| **Mercati Internazionali** | Core | Quarto pilastro dichiarato esplicitamente (`mercati-internazionali.md` §introduzione, "quarto pilastro della piattaforma insieme a Persone, Imprese e Opportunità") |
| **Opportunità** | Core | Terzo pilastro dichiarato esplicitamente (`opportunita.md` §introduzione); componente Core del dominio "Opportunità & Collaborazioni" già riconosciuto |
| **Collaborazioni** | Core | Componente del medesimo dominio Core "Opportunità & Collaborazioni", trattata come documento autonomo per la propria complessità (`collaborazioni.md` §introduzione) |
| **Professionisti** | Supporting | Abilita l'accesso a competenze specialistiche qualificate a supporto dei pilastri Core, ma non è essa stessa uno dei pilastri dichiarati; nessun documento la presenta come "pilastro strategico" |
| **Eventi** | Supporting | Momenti di aggregazione che servono i pilastri Core (Opportunità, Mercati, Collaborazioni) senza sostituirli |
| **Contenuti editoriali** | Supporting | Funzione informativa e narrativa trasversale, necessaria alla missione ma non differenziante di per sé rispetto ai pilastri economici |
| **Osservatorio** | Supporting | Funzione analitica trasversale di interesse pubblico (`osservatorio.md` §1, "trattarlo come pilastro strategico a pari titolo con Persone, Imprese, Opportunità e Mercati" — usato lì per giustificarne l'autonomia, non per elevarlo a quinto pilastro economico: l'Osservatorio non genera esso stesso valore economico, lo interpreta) |
| **Identità & Accessi** | Generic | Infrastruttura abilitante, non un dominio di business: autentica e autorizza, senza possedere alcun fatto sostanziale di alcun altro dominio (`identita-accessi.md` §1) |

**Domini generici non ancora oggetto di un documento logico dedicato** (eredità del Domain Model v1, ancora validi come principio, non ancora scomposti in un documento a 15 sezioni): **Tassonomia condivisa** (lingue, settori, competenze, temi, territori — governance centrale, nessuna logica di business propria), **Ricerca** (attraversa tutti i domini per riferimento, non decide le regole di visibilità) e **Notifiche** (reagisce ai fatti accaduti, non li genera). Questi tre restano Generic per definizione e non richiedono, in questa fase, lo stesso livello di dettaglio degli 11 domini Core/Supporting.

---

## 3. Descrizione sintetica degli 11 domini

| Dominio | Responsabilità | Concetto centrale | Confini principali | Dipendenze principali |
|---|---|---|---|---|
| **Persone** | Rappresentare la Persona come soggetto sociale e anagrafico continuativo | Persona | Non gestisce Imprese, ruoli applicativi o fatti economici; non verifica se stessa | Tassonomia condivisa (competenze, lingue) |
| **Imprese** | Rappresentare il soggetto economico: identità, sedi, settori, mercati dichiarati, certificazioni | Impresa | Non possiede le Persone collegate (le referenzia tramite Appartenenza); non gestisce Opportunità, Eventi o Storie a proprio nome (le referenziano) | Persone, Appartenenze, Mercati Internazionali |
| **Appartenenze** | Rappresentare la relazione datata e qualificata tra una Persona e un'Impresa | Appartenenza | Non contiene i dati descrittivi di Persona o Impresa; è pura relazione con proprio ciclo di vita e proprio titolo di rappresentanza | Persone, Imprese |
| **Mercati Internazionali** | Rappresentare il contesto economico/geografico internazionale e la relazione dei soggetti con esso | Mercato internazionale | Non incorpora Imprese o Opportunità che lo riguardano: le aggrega per riferimento | Persone, Imprese, Appartenenze |
| **Opportunità** | Rappresentare un beneficio o accesso strutturato, disponibile per un periodo, offerto da un Promotore | Opportunità | Non gestisce l'esecuzione della relazione una volta stabilita; non diventa mai automaticamente una Collaborazione | Persone, Imprese, Appartenenze, Mercati Internazionali |
| **Collaborazioni** | Rappresentare la ricerca, l'offerta o la relazione concreta tra soggetti che intendono sviluppare un'attività comune | Collaborazione | Non è un sistema di messaggistica, contratti o pagamenti; può esistere senza alcuna Opportunità di origine | Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità (opzionale) |
| **Professionisti** | Rappresentare il profilo professionale di una Persona: qualifiche, titoli, iscrizioni, servizi, disponibilità | Profilo professionale | Non è un dominio di soggetti nuovi: il Professionista è sempre una Persona; non coincide con l'Impresa che può offrire servizi strutturati | Persone, Imprese, Appartenenze, Mercati Internazionali |
| **Eventi** | Rappresentare un accadimento organizzato nel tempo e nello spazio, con edizioni, sessioni e partecipazione | Evento | Non incorpora automaticamente le Opportunità o Collaborazioni collegate; non possiede risultati didattici (Formazione resta dominio futuro) | Persone, Imprese, Professionisti, Mercati Internazionali |
| **Contenuti editoriali** | Rappresentare contenuti narrativi e informativi che descrivono fatti di altri domini | Contenuto editoriale | Non modifica mai i fatti che descrive; una dichiarazione editoriale non diventa automaticamente un fatto verificato | Tutti i domini, come soggetti narrabili |
| **Osservatorio** | Aggregare, misurare e interpretare fenomeni derivati dai dati di altri domini | Indicatore | Non possiede né modifica i dati operativi sorgente; misura e interpretazione restano distinte | Tutti i domini, come fonti di dati derivati |
| **Identità & Accessi** | Decidere chi accede, con quale identità, per conto di chi, a cosa, entro quali limiti | Account | Non possiede alcun fatto sostanziale di alcun altro dominio; applica la visibilità, non la definisce | Persone, Imprese, Appartenenze, Professionisti (come condizioni di una decisione di accesso) |

Per il dettaglio completo di ciascun dominio (entità, cardinalità, stati, regole, casi limite, eventi), si rimanda sempre al relativo documento logico elencato in testa a questo documento.

---

## 4. Principi di proprietà dei fatti

Ogni fatto sostanziale della piattaforma ha un solo dominio proprietario, identificato in modo esplicito e verificato per l'intera architettura nel rapporto di riconciliazione (`reconciliation-report.md` §3.2, §12). Attorno a questo principio operano cinque funzioni distinte, sempre distinguibili tra loro:

1. **Dominio proprietario** — il dominio che possiede il fatto, lo definisce, ne governa il ciclo di vita e le regole di validità. Solo il dominio proprietario può modificare il fatto.
2. **Riferimento** — qualsiasi altro dominio può referenziare un fatto per identità stabile, senza mai copiarlo o duplicarlo. Il riferimento non crea alcun diritto di modifica.
3. **Rappresentazione** — un dominio narrativo (in questa architettura, esclusivamente Contenuti editoriali) può rappresentare un fatto in forma discorsiva, senza che questo costituisca una nuova fonte di verità: la rappresentazione racconta, non definisce.
4. **Aggregazione** — un dominio analitico (in questa architettura, esclusivamente Osservatorio) può aggregare fatti provenienti da più domini in una conoscenza derivata (indicatori, misure), senza mai modificare i dati sorgente né diventarne fonte primaria.
5. **Applicazione dell'accesso** — Identità & Accessi applica le regole di visibilità e le decisioni di accesso stabilite dal dominio proprietario di ciascun fatto, senza mai ridefinirne il significato sostanziale né diventarne proprietario.

**Immutabilità reciproca tra domini.** Nessun dominio modifica un fatto di cui non è proprietario. Questo vale anche per le due funzioni che per natura toccano tutti gli altri domini — Contenuti editoriali (rappresentazione) e Osservatorio (aggregazione) — che per costruzione non hanno alcuna capacità di scrittura sui fatti che rispettivamente raccontano o aggregano. Identità & Accessi, che applica l'accesso a ogni dominio, non acquisisce per questo alcuna capacità di modificarne i fatti: la sua unica scrittura propria riguarda le proprie entità (Account, Identità digitale, Ruoli applicativi, Deleghe, Consensi).

---

## 5. Relazioni principali

| Relazione | Natura | Proprietario del fatto relazionale |
|---|---|---|
| **Persona–Impresa tramite Appartenenza** | Relazione datata e qualificata (ruolo, periodo, titolo di rappresentanza) | Appartenenze |
| **Persona–Professionista** | Ruolo che una Persona assume, non un soggetto nuovo | Professionisti (per il profilo), Persone (per l'identità sottostante) |
| **Impresa–Mercato internazionale** | Presenza o interesse dichiarato di un'Impresa in un Mercato | Mercati Internazionali (l'Impresa la referenzia, non la definisce) |
| **Opportunità–Mercato** | Riferimento descrittivo (un'Opportunità può riguardare un Mercato) | Opportunità (per l'Opportunità), Mercati Internazionali (per il Mercato referenziato) |
| **Opportunità–Evento** | Riferimento reciproco legittimamente bidirezionale: un Evento può presentare un'Opportunità; un'Opportunità può richiamare un Evento come contesto | Opportunità (per l'Opportunità), Eventi (per l'Evento) — nessuna incorporazione reciproca |
| **Evento–Edizione–Sessione** | Struttura interna di composizione (un Evento ha Edizioni, un'Edizione ha Sessioni) | Eventi, esclusivamente |
| **Opportunità–Collaborazione** | Un'Opportunità può originare una Collaborazione, senza automatismo; una Collaborazione può esistere senza alcuna Opportunità di origine | Opportunità (per l'Opportunità), Collaborazioni (per la Collaborazione) |
| **Persona/Impresa–Contenuto editoriale** | Riferimento narrativo: il Contenuto racconta la Persona o l'Impresa senza modificarne i dati | Contenuti editoriali (per il Contenuto), Persone/Imprese (per il soggetto raccontato) |
| **Domini sorgente–Osservatorio** | Flusso unidirezionale di dati derivati: ogni dominio è fonte, l'Osservatorio aggrega senza mai modificare la fonte | Osservatorio (per l'Indicatore), ciascun dominio sorgente (per i propri dati operativi) |
| **Account–Persona** | Associazione dichiarata e verificabile, mai automatica | Identità & Accessi (per l'Associazione stessa), Persone (per la Persona associata) |
| **Persona–Impresa–Contesto di azione** | Una Persona può agire "per sé" o "per un'Impresa", secondo un titolo derivato da un'Appartenenza o da una Delega compatibile | Identità & Accessi (per il Contesto di azione applicato), Appartenenze (per il titolo sostanziale) |

Tutte le relazioni elencate condividono lo stesso principio: **un riferimento non è mai un'incorporazione**. Il dettaglio di cardinalità, cicli di vita e casi limite di ciascuna relazione resta nei rispettivi documenti logici.

---

## 6. Cicli di vita e assi di stato

**Principio degli assi indipendenti.** Nessuna entità significativa di questa architettura ha un unico "stato": ogni entità complessa ha più assi di stato indipendenti, ciascuno con il proprio vocabolario, che non devono essere compressi in un unico campo generale. Questo principio, adottato spontaneamente e senza eccezioni in tutti gli 11 documenti logici, è la decisione strutturale più importante di questa architettura (confermato in `reconciliation-report.md` §8).

**Esempi dai domini.**
- Una **Persona** ha uno stato editoriale del profilo, uno stato di pubblicazione e lo stato indipendente di ciascuna propria dichiarazione (competenza, lingua, storia).
- Un'**Impresa** ha uno stato operativo (attiva/cessata, un fatto reale) indipendente dal proprio stato editoriale (bozza/completa) e dal proprio stato di pubblicazione.
- Un'**Appartenenza** ha uno stato della relazione (dichiarata/attiva/conclusa/revocata/contestata) indipendente dal proprio stato di verifica, che a sua volta si articola su più assi (identità, titolo, ruolo).
- Un **Account** (Identità & Accessi) ha **otto** assi indipendenti: stato dell'Account, stato dell'identità digitale, stato di ciascun metodo di autenticazione, stato di ciascuna Delega, stato di ciascun Consenso, stato di ogni Sessione, stato di sicurezza — nessuno di questi assi implica automaticamente lo stato degli altri.
- Un **Indicatore** dell'Osservatorio ha uno stato di elaborazione, uno stato di verifica metodologica, uno stato di pubblicazione e uno stato di validità temporale, tutti indipendenti.

**Famiglie di assi comuni.** Pur restando ciascun dominio autonomo nel proprio vocabolario, è possibile riconoscere famiglie concettuali comuni a più domini: stato reale/sostanziale, stato editoriale, stato di lavorazione, stato di verifica, stato di approvazione, stato di pubblicazione, stato di validità, stato di visibilità, stato di disponibilità, stato di partecipazione, stato di accesso, stato di sicurezza, stato di contestazione, stato di archiviazione. Il dettaglio completo di ciascuna famiglia, con la verifica di compatibilità semantica di 16 termini specifici (attivo, sospeso, chiuso, cessato, scaduto, ritirato, archiviato, verificato, validato, approvato, pubblicato, contestato, revocato, annullato, cancellato, completato) è riportato in `reconciliation-report.md` §8.

**Non esiste un modello universale unico degli stati.** Questa architettura uniforma il *significato* delle famiglie di stato, non la loro struttura: ogni dominio resta libero di avere i propri assi specifici, purché il significato di ciascun termine condiviso resti compatibile con quello usato altrove.

---

## 7. Verifica e affidabilità

**Verifica multidimensionale.** Ogni documento logico modella la verifica come un insieme di assi indipendenti, mai come un giudizio unico. Un fatto può essere verificato in uno dei suoi aspetti (es. l'identità digitale) e non verificato in un altro (es. l'identità civile), senza che questo sia una contraddizione: sono semplicemente due verifiche diverse, su due aspetti diversi dello stesso soggetto.

**Rifiuto dei badge generici.** Nessun documento logico introduce un badge unico e generico come "Persona verificata", "Impresa verificata", "Professionista verificato", "Evento verificato", "Contenuto verificato", "dato verificato" o "utente verificato" senza indicazione dell'aspetto effettivamente verificato. Questo principio è stato verificato esplicitamente in tutti gli 11 documenti (`reconciliation-report.md` §9) e non ammette eccezioni.

**Quindici tipi di verifica riconosciuti nell'architettura.** Verifica dell'esistenza, dell'identità, del contatto, documentale, della fonte, della relazione, della rappresentanza, professionale, editoriale, metodologica, della disponibilità, della partecipazione, della delega, del consenso, della qualità del dato. Ciascuno è di competenza del dominio che possiede il fatto verificato (dettaglio in `reconciliation-report.md` §9.1); nessuna verifica è condivisa tra domini con lo stesso significato.

**Fonte ed Evidenza come pattern, non come entità condivisa.** Quasi tutti i domini definiscono una propria nozione locale di "Fonte" (l'origine dichiarata di un'informazione) e di "Evidenza" (il riscontro concreto a supporto di una verifica). Non esiste un'unica entità "Fonte" o "Evidenza" condivisa tra domini: ciascun dominio possiede le proprie, sui propri fatti. Questo è un pattern architetturale deliberato, non un'incoerenza (`reconciliation-report.md` §3.2, §7).

**Affidabilità e reputazione.** Nessun dominio attuale possiede un'entità "Affidabilità" o "Reputazione" come punteggio aggregato: l'affidabilità si esprime sempre come combinazione di assi di verifica specifici. Un futuro sistema di reputazione è esplicitamente evocato come dominio futuro possibile (§11), non ancora modellato.

---

## 8. Visibilità e accesso

**Ogni dominio stabilisce la visibilità sostanziale dei propri fatti.** La visibilità non è un'entità autonoma né un fatto posseduto da un dominio tecnico: è un principio distribuito, per il quale il dominio proprietario di un fatto (una Persona, un'Impresa, un'Opportunità, un Contenuto...) decide cosa, di quel fatto, può essere conosciuto da chi, e quando.

**Identità & Accessi applica le decisioni, non le definisce.** Identità & Accessi (`identita-accessi.md` §7) traduce in decisioni tecniche di accesso la visibilità già stabilita dal dominio proprietario, senza introdurre criteri di visibilità propri e indipendenti da essa. Questo principio, dichiarato esplicitamente in quel documento e coerente con i riferimenti presenti in `contenuti-editoriali.md` §12 e `osservatorio.md` §12, è una delle decisioni vincolanti più importanti di questa architettura (§13).

**Pubblico non significa necessariamente indicizzato.** Un fatto può essere pubblicamente consultabile (accessibile a chi lo cerca direttamente) senza essere necessariamente promosso, evidenziato o reso rilevabile tramite ricerca generale: la visibilità e la rilevabilità (search-ability) restano due decisioni distinte, entrambe di competenza del dominio proprietario.

**Accesso non crea diritti sostanziali.** Un permesso concesso, un ruolo assegnato, un accesso consentito da Identità & Accessi è sempre un fatto tecnico-applicativo: non genera, modifica né dimostra automaticamente un fatto sostanziale dei domini economici e sociali. Non crea proprietà, non crea rappresentanza legale, non attribuisce una qualifica professionale, non dimostra affidabilità (`identita-accessi.md`, introduzione, principio cardine ripreso in tutta l'architettura).

---

## 9. Contenuti, dati e conoscenza derivata

Questa architettura distingue con attenzione otto livelli concettuali, spesso confusi nel linguaggio comune:

| Livello | Definizione | Dominio tipicamente coinvolto |
|---|---|---|
| **Fatto** | Una condizione reale del mondo o della piattaforma, sostanziale, posseduta da un dominio | Ciascun dominio, per i propri fatti |
| **Contenuto** | Una rappresentazione narrativa o informativa di uno o più fatti, mai un fatto essa stessa | Contenuti editoriali |
| **Fonte** | L'origine dichiarata di un'informazione, usata per sostenere una Verifica o un'Evidenza | Ciascun dominio, per le proprie Fonti (pattern locale, §7) |
| **Osservazione** | Il dato elementare raccolto da una Fonte, prima di qualsiasi elaborazione | Osservatorio |
| **Misura** | Un'elaborazione quantitativa di una o più Osservazioni, secondo una metodologia dichiarata | Osservatorio |
| **Indicatore** | Una sintesi analitica costruita su una o più Misure, con una propria metodologia versionata | Osservatorio |
| **Interpretazione** | Una lettura qualitativa di uno o più Indicatori, distinta dalla loro sola misurazione | Osservatorio |
| **Prodotto editoriale** | Un Rapporto, un Dossier o un articolo che comunica un'Interpretazione o un fatto a un pubblico, distinto dal dato che lo origina | Osservatorio (Rapporto/Dossier come prodotti analitici) o Contenuti editoriali (se narrativo/divulgativo) |

**Principio guida.** Un Contenuto non è mai un Fatto: descrive un Fatto senza modificarlo. Una Misura non è mai un'Interpretazione: la precede e la sostiene, senza sostituirla. Un prodotto analitico dell'Osservatorio (Rapporto, Dossier) e la sua eventuale pubblicazione editoriale (un articolo che ne racconta i risultati) restano sempre distinguibili, anche quando riguardano lo stesso fenomeno.

---

## 10. Eventi di dominio

**Funzione concettuale.** Un evento di dominio descrive un fatto già accaduto in un dominio, reso disponibile agli altri domini che vogliono reagirvi, senza che il dominio che lo genera debba conoscere né gestire tali reazioni. È il meccanismo con cui i domini comunicano senza incorporarsi: nessun dominio "chiede" attivamente informazioni a un altro, ciascuno reagisce a ciò che è accaduto.

**Forma.** Ogni evento di dominio in questa architettura è nominato con un participio passato riferito a un fatto concluso (es. *Pubblicata, Dichiarata, Confermata, Revocata, Conclusa, Rilevato*), mai con un comando o un'intenzione futura. Questa uniformità è stata verificata su oltre 140 eventi complessivi nei 11 documenti logici (`reconciliation-report.md` §10), senza eccezioni.

**Eventi trasversali principali** (nome effettivo usato nei documenti, dominio di origine, possibili domini reattivi):

| Evento | Dominio di origine | Possibili domini reattivi |
|---|---|---|
| PersonaRegistrata, PersonaArchiviata | Persone | Identità & Accessi, Osservatorio |
| ImpresaCreata, ImpresaPubblicata, ImpresaArchiviata | Imprese | Osservatorio, Mercati Internazionali |
| AppartenenzaConfermata, AppartenenzaContestata, AppartenenzaRevocata | Appartenenze | Imprese, Identità & Accessi, Osservatorio |
| ProfiloProfessionalePubblicato, ProfiloProfessionaleSospeso | Professionisti | Opportunità, Collaborazioni, Osservatorio |
| OpportunitàPubblicata, OpportunitàChiusa, OpportunitàRevocata | Opportunità | Collaborazioni, Osservatorio, Notifiche |
| CollaborazioneAvviata, CollaborazioneConclusa | Collaborazioni | Osservatorio, Notifiche |
| EventoPubblicato, EventoCancellato | Eventi | Opportunità, Collaborazioni, Notifiche |
| IscrizioneEventoConfermata | Eventi | Notifiche |
| ContenutoPubblicato, ContenutoRettificato | Contenuti editoriali | Ricerca, Notifiche |
| IndicatorePubblicato, ValoreIndicatoreRevisionato | Osservatorio | Contenuti editoriali (divulgazione), Notifiche |
| AccountAssociatoAPersona, AccountSospeso, AccountChiuso | Identità & Accessi | Notifiche, Persone (nessuna cancellazione automatica) |
| DelegaConcessa, DelegaRevocata | Identità & Accessi | Appartenenze (se collegata a un'Autorizzazione gestionale) |

**Distinzione tra fatto avvenuto e comando desiderato.** Nessun evento di questa architettura rappresenta un'intenzione o un comando: rappresenta sempre una condizione già verificata al momento in cui viene generato. Le condizioni concettuali che devono essere soddisfatte prima che un evento possa verificarsi, e le sue possibili conseguenze in altri domini, sono descritte in dettaglio in ciascun documento logico.

---

## 11. Domini futuri e confini aperti

I concetti seguenti sono emersi nei documenti logici come aree di sviluppo futuro possibile. Nessuno di essi è descritto come già implementato o già modellato a livello logico completo; nessun nuovo documento di dominio è stato creato per essi in questa fase.

| Area futura | Maturità | Nota |
|---|---|---|
| **Servizi** (verticali finanziari, immobiliari, utility, professionali generici non coperti da Professionisti) | Alta: erede diretto del Domain Model v1, già parzialmente disambiguato da Professionisti | Merita priorità: più documenti esistenti lo evocano operativamente |
| **Formazione** | Alta: esplicitamente prevista, con confine già chiarito rispetto a Eventi | Il Corso può essere rappresentato come Evento nella sola dimensione temporale; risultati didattici e percorsi restano fuori da Eventi |
| **Immobiliare** | Alta: evocata da più documenti come area distinta dai profili utente | Coerente con la decisione vincolante che la vuole distinta dai profili personali/aziendali |
| **Reputazione** | Media: evocata esplicitamente ma mai definita | Un futuro sistema dovrà restare distinto dagli assi di verifica specifici, non un badge generico |
| **Privacy** | Media: la componente minima (Consenso) esiste già in Identità & Accessi | Un futuro dominio Privacy dedicato non è ancora anticipato in dettaglio |
| **Pagamenti** | Bassa: sistematicamente esclusa dal perimetro attuale | Nessun documento la modella |
| **Contratti** | Bassa: esclusa, distinta dall'Accordo preliminare di Collaborazioni | Nessun documento la modella |
| **Organizzazioni istituzionali** (associazioni, camere di commercio, ambasciate, enti pubblici) | Da valutare | Compaiono come riferimenti esterni in più documenti, senza un dominio che ne rivendichi una scheda propria |
| **Luoghi** | Da valutare | Concetto descrittivo locale (sede di Evento/Impresa), non ancora un'entità condivisa riusabile |
| **Documenti** | Da valutare | Presente solo come riferimento/attribuzione locale, non come sistema di gestione documentale |
| **Sondaggi e questionari** | Bassa | Evocati come possibile futura Fonte diretta per l'Osservatorio |
| **Ricerca, Notifiche, Tassonomia condivisa, Media/allegati** | Concetti trasversali/generici già in uso, senza necessità di un documento logico dedicato nella prima versione | Nessun rischio di sovrapposizione significativo rilevato |

Il dettaglio completo di ciascuna area, con i rischi di sovrapposizione specifici, è in `reconciliation-report.md` §12-§13.

---

## 12. Glossario canonico

Versione sintetica. Il glossario completo (51 termini) è in `reconciliation-report.md` §7.

| Termine | Significato essenziale | Proprietario |
|---|---|---|
| Persona | Soggetto sociale e anagrafico, indipendente da un Account | Persone |
| Utente | Termine da evitare come concetto di dominio: ambiguo tra Visitatore, Account e Persona | Nessuno |
| Account / Identità digitale | Costrutto di accesso e relative credenziali | Identità & Accessi |
| Profilo pubblico / professionale / di accesso | Sempre da qualificare: rispettivamente di Persone/Imprese, di Professionisti, di Identità & Accessi | Secondo il qualificatore |
| Impresa | Il soggetto economico | Imprese |
| Appartenenza | Relazione datata e qualificata Persona–Impresa | Appartenenze |
| Partecipazione | Relazione con un Evento | Eventi (distinta da Candidatura/Manifestazione di interesse) |
| Opportunità / Collaborazione | Beneficio offerto da un Promotore / relazione o intenzione di relazione cercata | Opportunità / Collaborazioni |
| Evento / Edizione / Sessione | Accadimento organizzato e sue componenti temporali | Eventi |
| Fonte / Evidenza / Verifica | Pattern locale ripetuto per dominio, mai entità condivisa | Ciascun dominio, sui propri fatti |
| Visibilità / Accesso | Principio distribuito (visibilità sostanziale) applicato tecnicamente (accesso) | Dominio proprietario del fatto / Identità & Accessi |
| Ruolo | Da qualificare sempre: applicativo (Identità & Accessi), di un'Appartenenza, organizzativo (Imprese) | Secondo il qualificatore |
| Qualifica / Titolo / Certificazione / Competenza | Da qualificare sempre per soggetto (Appartenenza, Professionista, Impresa, Persona) | Secondo il qualificatore |
| Mercato (internazionale) | Contesto economico/geografico estero | Mercati Internazionali |
| Territorio / Settore | Geografia italiana / classificazione economica, voci di catalogo condiviso | Tassonomia condivisa |
| Contenuto (editoriale) / Versione / Traduzione | Rappresentazione narrativa, sua storicizzazione, suo adattamento linguistico | Contenuti editoriali |
| Indicatore / Misura / Osservazione / Analisi / Rapporto / Dossier | Livelli distinti di conoscenza derivata (§9) | Osservatorio |
| Storia (personale / di Impresa) | Da qualificare sempre: proprietà sostanziale di Persone (personale) vs. proprietà editoriale piena (di Impresa) | Persone / Contenuti editoriali |
| Affidabilità / Reputazione | Mai un punteggio unico; Reputazione è area futura non modellata | Nessun dominio attuale |

---

## 13. Decisioni architetturali vincolanti

Le seguenti decisioni sono comuni a tutti gli 11 domini e vincolano ogni sviluppo futuro, incluso il passaggio al modello fisico:

1. Ogni fatto sostanziale ha un solo dominio proprietario chiaramente identificabile.
2. I domini possono referenziarsi liberamente, senza mai incorporarsi.
3. Persona, Account e Identità digitale restano sempre concetti distinti; una Persona può esistere senza Account.
4. Impresa e Appartenenza restano sempre distinti: l'Impresa non possiede le Persone collegate.
5. Professionista è un ruolo che una Persona assume, non un soggetto o un dominio di soggetti nuovo.
6. Rappresentanza e accesso restano distinti: un accesso consentito non crea né dimostra una rappresentanza legale.
7. Opportunità e Collaborazione restano distinte: un'Opportunità non diventa automaticamente una Collaborazione.
8. Evento, Edizione e Sessione restano distinti concettualmente, pur componendo un'unica struttura.
9. Un fatto e il Contenuto editoriale che lo descrive restano sempre distinti: il Contenuto non modifica il fatto.
10. Il dato operativo di un dominio e la conoscenza derivata dell'Osservatorio restano distinti: l'Osservatorio non modifica i dati sorgente.
11. Misura e interpretazione restano distinte.
12. Fonte, Evidenza e Verifica restano concetti distinti tra loro, e ciascuno resta un pattern locale del dominio che lo definisce, non un'entità condivisa.
13. Ruolo applicativo e ruolo di dominio (o qualifica) restano sempre distinti.
14. Permesso, Delega, Consenso e preferenza restano concetti distinti tra loro.
15. Stato reale, verifica, pubblicazione, visibilità e accesso restano assi indipendenti, mai compressi in un unico stato.
16. Non esiste un badge universale generico di "verificato": ogni verifica riguarda un aspetto specifico e dichiarato.
17. Identità & Accessi applica la visibilità stabilita da ciascun dominio proprietario, senza mai possederla o ridefinirla.
18. Contenuti editoriali racconta i fatti, senza mai modificarli.
19. Osservatorio aggrega e interpreta i dati sorgente, senza mai modificarli.
20. Le modifiche storiche rilevanti (fusioni, cambi di rappresentante, revoche) devono poter essere conservate, non semplicemente sovrascritte.
21. Le traduzioni restano sempre distinguibili dai contenuti originali che traducono.
22. Le informazioni aggregate dall'Osservatorio non devono consentire la reidentificazione di soggetti individuali.
23. L'origine immigrata di una Persona non deve essere dedotta impropriamente da altri dati, né implicare automaticamente competenze, relazioni o attività internazionali.
24. I servizi linguistici e interculturali restano accessori e trasversali rispetto al modello, non un fine a sé.
25. Formazione e sicurezza multilingue restano un'area strategica futura, non ancora un dominio pienamente modellato.
26. Immobiliare resta un'area futura distinta dai profili di Persone e Imprese.
27. La consultazione pubblica della piattaforma non richiede necessariamente una registrazione.
28. La registrazione (un Account) è richiesta solo per le azioni che necessitano identità, responsabilità o tracciabilità.
29. Il modello logico deve sempre precedere il modello fisico.
30. Il passaggio al modello fisico è consentito solo dopo che il modello logico del dominio interessato è stato riconciliato con gli altri.

Tutte queste decisioni sono state verificate come già rispettate dagli 11 documenti logici esistenti nel processo di riconciliazione (`reconciliation-report.md`, in particolare §§6, 8, 9, 11).

---

## 14. Questioni aperte

Le questioni realmente aperte (decisioni di prodotto o di roadmap non ancora prese, non contraddizioni) sono numerose e raggruppate per tema in `reconciliation-report.md` §15. Le famiglie principali:

- **Priorità di implementazione delle verifiche** — quali livelli di verifica dichiarati saranno realmente implementati, e in quale ordine.
- **Continuità storica delle entità economiche** — come rappresentare stabilmente fusioni, cessioni e trasformazioni societarie.
- **Identità e accessi** — rapporto massimo Account–Persona, gestione di Account compromessi/duplicati/di soggetti deceduti, criteri per soggetti esteri e minorenni, governance dei permessi e delle deleghe, relazione con un futuro dominio Privacy.
- **Governance e priorità dell'Osservatorio** — quali dati saranno realmente aggregati, con quale livello di anonimizzazione; gestione futura di sondaggi come Fonte diretta.
- **Moderazione e conservazione editoriale** — gestione operativa di segnalazioni e commenti; tempi di conservazione dello storico.
- **Aspetti operativi internazionali** — gestione di più lingue e fusi orari per Eventi; responsabilità per la formazione multilingue.
- **Strutturazione economica delle Opportunità** — se budget e graduatorie diventino dati strutturati o restino descrittivi.
- **Responsabilità della piattaforma nelle Collaborazioni attive** — quale ruolo, se alcuno, assume una volta che una relazione è avviata.
- **Classificazione futura dei Professionisti e di Servizi** — se regolamentati/non regolamentati diventeranno sotto-domini distinti, e come si articolerà il dominio Servizi.

---

## 15. Stato dell'architettura

**Documenti completati.** 11 documenti logici di dominio (Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi), questo documento generale, e il rapporto di riconciliazione che li ha confrontati (`reconciliation-report.md`).

**Aspetti riconciliati.** Proprietà unica dei fatti sostanziali; confini tra tutti i domini adiacenti; terminologia condivisa (glossario, §12); significato degli assi di stato comuni (§6); natura multidimensionale delle verifiche (§7); principio di visibilità distribuita (§8); assenza di dipendenze circolari problematiche; coerenza degli eventi di dominio (§10). Due incoerenze reali (entrambe documentali, relative a domande ormai risolte non aggiornate) sono state individuate e corrette nei documenti `imprese.md`, `mercati-internazionali.md`, `opportunita.md` e `collaborazioni.md`; il dettaglio è in `reconciliation-report.md` §14.

**Questioni rinviate.** Le famiglie di domande elencate al §14, nessuna delle quali blocca la comprensione del modello nel suo complesso; i domini futuri elencati al §11, per i quali non è stato prodotto alcun documento logico in questa fase.

**Condizioni necessarie prima del modello fisico.** Per gli 11 domini già riconciliati: nessuna condizione bloccante residua — il passaggio al modello fisico, dominio per dominio, è raccomandato (`reconciliation-report.md` §18), seguendo lo stesso processo già validato per Persone (logico → riconciliazione → fisico → piano di migrazione → migrazioni). Per i domini futuri (§11), in particolare Servizi: è necessario un proprio documento logico dedicato, con lo stesso livello di rigore, prima di qualsiasi passaggio al fisico.
