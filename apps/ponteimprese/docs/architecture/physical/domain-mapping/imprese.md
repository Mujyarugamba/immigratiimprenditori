# Mapping fisico — Dominio Imprese

> Livello architetturale. Questo documento è il **Physical Domain Mapping** del dominio Imprese: il passaggio tra il modello logico del dominio e la sua futura rappresentazione fisica. Non contiene schema di database, non contiene SQL, non definisce tabelle, non usa PostgreSQL o Supabase come riferimento progettuale, non indica tipi di dato, non tratta colonne, chiavi, indici, trigger, constraint, RLS, API o codice. Le uniche menzioni di tecnologie ammesse sono: questa nota introduttiva, la sezione delle decisioni rinviate (§24) e il controllo finale (§25), dove servono a verificarne l'assenza.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/imprese.md`](../../logical/imprese.md), [`docs/architecture/logical/persone.md`](../../logical/persone.md), [`docs/architecture/logical/appartenenze.md`](../../logical/appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](../../logical/mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](../../logical/professionisti.md), [`docs/architecture/logical/opportunita.md`](../../logical/opportunita.md), [`docs/architecture/logical/collaborazioni.md`](../../logical/collaborazioni.md), [`docs/architecture/logical/eventi.md`](../../logical/eventi.md), [`docs/architecture/logical/contenuti-editoriali.md`](../../logical/contenuti-editoriali.md), [`docs/architecture/logical/osservatorio.md`](../../logical/osservatorio.md), [`docs/architecture/logical/identita-accessi.md`](../../logical/identita-accessi.md), [`docs/architecture/logical/reconciliation-report.md`](../../logical/reconciliation-report.md), [`docs/architecture/physical/01-principi-mapping.md`](../01-principi-mapping.md), [`docs/architecture/physical/02-reference-model.md`](../02-reference-model.md), [`docs/architecture/physical/03-convenzioni-architetturali.md`](../03-convenzioni-architetturali.md), [`docs/architecture/physical/04-quality-attributes.md`](../04-quality-attributes.md), [`docs/architecture/physical/architecture-baseline.md`](../architecture-baseline.md), [`docs/architecture/physical/domain-mapping/persone.md`](persone.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: modello logico (`imprese.md`) → riconciliazione (`reconciliation-report.md`) → baseline metodologica (`01`-`04`, confermata da `architecture-baseline.md`) → primo caso di studio (`domain-mapping/persone.md`) → **mapping fisico del dominio Imprese (questo documento)** → piano di migrazione → migrazioni. Questo documento applica integralmente la baseline già approvata: non ridefinisce la metodologia, non duplica principi, pattern, convenzioni o attributi di qualità già stabiliti. È il secondo documento di mapping fisico prodotto secondo questo metodo, ed è quindi il primo caso in cui la verifica di uniformità tra domini (`03` §2, dichiarata non conclusiva in `architecture-baseline.md` §4.2 e §7 decisione 6 per mancanza di un secondo caso di studio) diventa realmente verificabile.

---

## Indice

1. [Scopo del mapping](#1-scopo-del-mapping)
2. [Sintesi del dominio logico](#2-sintesi-del-dominio-logico)
3. [Nucleo persistente dell'impresa](#3-nucleo-persistente-dellimpresa)
4. [Concetti incorporati](#4-concetti-incorporati)
5. [Identità dell'impresa](#5-identità-dellimpresa)
6. [Classificazioni](#6-classificazioni)
7. [Sedi e presenza territoriale](#7-sedi-e-presenza-territoriale)
8. [Contatti e presenza digitale](#8-contatti-e-presenza-digitale)
8A. [Offerta di servizi (ServizioImpresa)](#8a-offerta-di-servizi-servizioimpresa)
8B. [Offerta di prodotti (ProdottoImpresa)](#8b-offerta-di-prodotti-prodottoimpresa)
9. [Relazioni con Persone](#9-relazioni-con-persone)
10. [Relazioni con altri domini](#10-relazioni-con-altri-domini)
11. [Assi di stato](#11-assi-di-stato)
12. [Verifiche](#12-verifiche)
12.1. [Rappresentazione fisica futura — M6.1 (`business_verifications`)](#121-rappresentazione-fisica-futura--m61-business_verifications)
13. [Certificazioni, attestazioni e riconoscimenti](#13-certificazioni-attestazioni-e-riconoscimenti)
14. [Temporalità e storicizzazione](#14-temporalità-e-storicizzazione)
15. [Visibilità e pubblicazione](#15-visibilità-e-pubblicazione)
15.1. [Rappresentazione fisica della coerenza di pubblicazione e visibilità (M7.1)](#151-rappresentazione-fisica-della-coerenza-di-pubblicazione-e-visibilità-m71)
16. [Dati sorgente, dichiarati, derivati e aggregati](#16-dati-sorgente-dichiarati-derivati-e-aggregati)
17. [Documenti e prove](#17-documenti-e-prove)
18. [Eventi di dominio](#18-eventi-di-dominio)
19. [Dipendenze del dominio](#19-dipendenze-del-dominio)
20. [Classificazione delle decisioni](#20-classificazione-delle-decisioni)
21. [Pattern riutilizzabili individuati](#21-pattern-riutilizzabili-individuati)
22. [Verifica degli attributi di qualità](#22-verifica-degli-attributi-di-qualità)
23. [Decisioni di mapping consolidate](#23-decisioni-di-mapping-consolidate)
24. [Questioni aperte e aspetti rinviati](#24-questioni-aperte-e-aspetti-rinviati)
25. [Controllo finale](#25-controllo-finale)

---

## 1. Scopo del mapping

**Responsabilità del dominio.** Il dominio Imprese rappresenta il soggetto economico in quanto tale: la sua identità pubblica, la sua presentazione, le sedi in cui opera, i settori in cui è attivo, i servizi e i prodotti che offre, le lingue realmente utilizzabili nei rapporti con l'esterno, le certificazioni che dichiara o le vengono riconosciute, i canali attraverso cui comunica e i contenuti multimediali che la rappresentano (`imprese.md` §1). È, insieme a Persone, uno dei due pilastri originari della piattaforma (`domain-model.md` §1, §2) e precede, nella propria identità pubblica, qualunque singola relazione con le persone che in un dato momento la animano.

**Obiettivo di questo mapping.** Tradurre le undici entità logiche del dominio (Impresa, AppartenenzaImpresa, SedeImpresa, SettoreImpresa, ServizioImpresa, ProdottoImpresa, MercatoImpresa, LinguaOperativaImpresa, CertificazioneImpresa, CanaleImpresa, MediaImpresa — `imprese.md` §2), le loro relazioni (§4), il ciclo di vita dell'Impresa e delle sue Appartenenze (§5-§6), le regole di proprietà, gestione e rappresentanza (§7), gli assi di verifica (§8), le regole di visibilità (§9) e gli invarianti (§10) in un insieme di decisioni concettuali di livello fisico — quali concetti richiedono una rappresentazione persistente autonoma, quali pattern del Reference Model (`02`) si applicano a ciascuno, quali dipendenze verso altri domini ne derivano — senza introdurre alcun significato che il documento logico non abbia già previsto (`01` §2, principio 3) e senza anticipare alcuna decisione di schema (§24).

**Confini inclusi.** Questo documento tratta esclusivamente ciò che il dominio logico ha dichiarato di possedere: l'identità e la presentazione dell'Impresa; le sue sedi, settori dichiarati, servizi, prodotti, lingue operative, certificazioni, canali e materiali multimediali; il ciclo di vita e gli assi di verifica dell'Impresa stessa. Include, come dipendenze referenziate e mai come oggetto di una decisione di mapping, i punti in cui il dominio logico Imprese tocca altri domini: la relazione con le Persone (mediata sempre da Appartenenze), la relazione con i Mercati Internazionali, con la Tassonomia condivisa e con Identità & Accessi.

**Confini esclusi.** Questo documento non tratta: i dati personali delle Persone collegate (dominio Persone); il significato di business della relazione Persona–Impresa, i suoi ruoli, la sua Autorizzazione gestionale e il suo ciclo di vite dettagliato (dominio Appartenenze, di cui `imprese.md` §2 offre solo una vista di sintesi non contraddittoria, `reconciliation-report.md` §10); la definizione dei Mercati Internazionali e il fatto sostanziale della presenza di un'Impresa in un Mercato (dominio Mercati Internazionali, `reconciliation-report.md` §11.2); le Opportunità, le Collaborazioni e gli Eventi che referenziano l'Impresa come titolare o organizzatore (rispettivi domini); le Storie di Impresa (dominio Contenuti editoriali); i report e le statistiche aggregate (dominio Osservatorio); i meccanismi tecnici di autenticazione, autorizzazione e accesso (dominio Identità & Accessi); il profilo professionale di un Professionista che sia anche titolare di un'Impresa (dominio Professionisti).

**Il dominio Imprese non coincide con...** Coerentemente con `imprese.md` §1 e con la separazione dei domini stabilita in `domain-model.md` §2-§4, questo mapping dichiara esplicitamente che il dominio Imprese:
- non coincide con il **profilo utente** di una Persona: l'Impresa è un soggetto economico autonomo, mai un'estensione del profilo di chi la anima (`domain-model.md`, decisione vincolante 4: "Impresa e Appartenenza restano sempre distinti: l'Impresa non possiede le Persone collegate");
- non coincide con l'**account** o con qualsiasi identità digitale di accesso: chi può tecnicamente modificare la scheda è deciso da Identità & Accessi sulla base di fatti di business che Appartenenze registra, non da Imprese (`imprese.md` §1, §7);
- non coincide con la **presenza editoriale** dell'Impresa: le Storie di Impresa sono un contenuto autonomo del dominio Contenuti editoriali, che referenzia l'Impresa come soggetto raccontato senza che questa ne acquisisca la proprietà (`imprese.md` §1, `reconciliation-report.md` §3.2, riga "Storia di Impresa");
- non coincide con le sue **relazioni esterne**: Opportunità, Collaborazioni, Eventi e la relazione con i Mercati Internazionali restano contenuti o fatti autonomi di altri domini, che referenziano l'Impresa come titolare, organizzatore o soggetto interessato senza che questa ne incorpori il significato (`imprese.md` §1, §14).

**Rapporto con il dominio Persone.** Il dominio Imprese non ha, e non deve avere, alcuna relazione diretta con il dominio Persone: ogni collegamento passa sempre per l'Aggregate Appartenenza, che referenzia entrambe le parti senza appartenere in esclusiva a nessuna delle due (`imprese.md` §1, §4, nota su R2/R7; `appartenenze.md` §5, nota su R1/R2). Questo mapping applica questa regola con lo stesso rigore già dimostrato per il caso simmetrico in `domain-mapping/persone.md` §4, riga R7 ("Persone non ha alcuna relazione diretta con Imprese... mai per un riferimento diretto"): qui si conferma che vale anche nel verso opposto.

**Rapporto con i domini dipendenti o collegati.** Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Mercati Internazionali e Professionisti dipendono tutti da Imprese per riferimento all'identità stabile dell'Impresa (§10, §19); nessuno di essi è incorporato in questo documento, che si limita a riconoscerli come destinatari di un riferimento stabile o di un evento di dominio, coerentemente con la regola "ogni relazione mantiene un dominio proprietario" (`03` §5) applicata anche alle relazioni in entrata (RC13).

**Applicazione preliminare della regola fondamentale "impresa e relazioni".** Coerentemente con il vincolo metodologico posto a questo mapping, ciascuno dei confini seguenti è verificato esplicitamente nel corso del documento, con la sezione che ne dà conto indicata tra parentesi: soci, amministratori, referenti, fondatori e lavoratori sono trattati come Persone collegate all'Impresa mediante relazioni possedute da Appartenenze, mai come attributi incorporati dell'Impresa (§9); associazioni, reti e organizzazioni istituzionali — pur menzionate da `imprese.md` solo come "ente economico" tra le forme organizzative o come riferimenti esterni impliciti — non sono trattate come attributi incorporati dell'Impresa: nessuna Entity "Associazione" o "Rete" è introdotta da questo documento, in fedeltà al fatto che `imprese.md` stesso non le modella come concetti propri (§6, §17, §24); mercati, eventi, opportunità e collaborazioni restano fuori dall'Aggregate Impresa, come relazioni referenziate di proprietà di altri domini (§10); clienti, fornitori e partner sono menzionati da `imprese.md` solo come destinatari descrittivi di un ServizioImpresa o come contesto del ruolo "Referente operativo" (`imprese.md` §2, §7), mai come Entity con una propria identità: questo documento non introduce quindi alcuna Entity "Cliente", "Fornitore" o "Partner", che il documento logico stesso non prevede (§4); i contenuti editoriali riguardanti l'Impresa (StorieImpresa) appartengono interamente a Contenuti editoriali (§10); gli indicatori statistici e le aggregazioni appartengono interamente all'Osservatorio (§10, §16).

---

## 2. Sintesi del dominio logico

**Aggregate root.** Impresa (`imprese.md` §2), il soggetto economico in quanto tale.

**Concetti logici rilevanti.** Undici entità: Impresa (aggregate root); AppartenenzaImpresa (vista di sintesi della relazione con Persone, la cui fonte autorevole è il dominio Appartenenze, §9); SedeImpresa, SettoreImpresa, ServizioImpresa, ProdottoImpresa, MercatoImpresa, LinguaOperativaImpresa, CertificazioneImpresa, CanaleImpresa, MediaImpresa (entità dipendenti dall'Impresa, §3).

**Invarianti principali (`imprese.md` §10).** Un'Impresa pubblica deve avere un nome pubblico valido; un'Impresa cessata non deve essere presentata come attiva; una SedeImpresa non può appartenere a più di un'Impresa; il settore principale deve essere unico in un dato momento; un'AppartenenzaImpresa conclusa/contestata/revocata non deve essere mostrata come relazione attuale; una CertificazioneImpresa scaduta o revocata non deve essere mostrata come valida; la facoltà di gestire la scheda non prova la rappresentanza legale reale; i dati non pubblici non diventano pubblici automaticamente; la cancellazione logica non distrugge la storia delle relazioni; un elemento collegato non pubblico non compare nei percorsi di consultazione pubblica anche a scheda pubblicata.

**Responsabilità.** Rendere la scheda impresa uno strumento utile per visibilità, affidabilità, networking, sviluppo commerciale, collaborazione e analisi economica, non una semplice anagrafica (`imprese.md` §1).

**Eventi.** Quattordici eventi elencati in `imprese.md` §13 (§18 di questo documento ne verifica l'ownership reale).

**Dipendenze (sintesi, dettaglio §10, §19).** In uscita: Appartenenze (di cui `imprese.md` offre solo una vista di sintesi), Mercati Internazionali (per la relazione MercatoImpresa, la cui proprietà sostanziale appartiene però a Mercati Internazionali, `reconciliation-report.md` §11.2), Tassonomia condivisa (Settore, Lingua, Territorio), Identità & Accessi (per l'applicazione, non la definizione, dell'accesso). In entrata: Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Professionisti.

**Decisioni architetturali già consolidate rilevanti per questo mapping.**
- `domain-model.md`, decisione vincolante 4: "Impresa e Appartenenza restano sempre distinti: l'Impresa non possiede le Persone collegate".
- `domain-model.md`, decisione vincolante 15: stato reale, verifica, pubblicazione, visibilità e accesso restano assi indipendenti.
- `domain-model.md`, decisione vincolante 16: nessun badge universale di "verificato".
- `domain-model.md`, decisione vincolante 20: le modifiche storiche rilevanti devono poter essere conservate, non sovrascritte.
- `imprese.md` §15: "Il confine con il dominio Professionisti... è stato risolto da `logical/professionisti.md`: un professionista individuale è una Persona che assume quel ruolo, distinta dall'eventuale Impresa di cui è titolare".
- `reconciliation-report.md` §11.2, punto 1: la relazione Imprese↔Mercati Internazionali non è una dipendenza circolare, ma un'unica relazione con un solo proprietario (Mercati Internazionali) osservata da due punti di vista.

**Ambiguità o tensioni terminologiche ereditate dal livello logico, segnalate esplicitamente.**
1. **AppartenenzaImpresa vs Appartenenza.** `imprese.md` (§2, nota di coerenza architetturale) usa il nome locale "AppartenenzaImpresa" per descrivere, dal proprio punto di vista, lo stesso aggregato connettivo che `appartenenze.md` chiama "Appartenenza" e di cui è la fonte autorevole. Il ciclo di vita descritto in `imprese.md` §6 (sei stati su un solo asse) è inoltre una semplificazione del ciclo di vita più articolato di `appartenenze.md` §6 (tre assi, nove stati), già segnalata come "nota di allineamento documentale" non contraddittoria in `appartenenze.md` §15. Questo mapping adotta la fonte autorevole (Appartenenze) come riferimento e tratta la descrizione di `imprese.md` §2, §6-§7 come vista di sintesi non normativa (§9 di questo documento).
2. **MercatoImpresa.** `imprese.md` §2, §4 (R7) descrive la relazione con un Mercato come se fosse in parte posseduta da Imprese ("Relazioni principali. Referenzia esattamente un'Impresa e esattamente un Mercato"); `reconciliation-report.md` §11.2 punto 1 stabilisce invece che il fatto (Presenza di mercato) è posseduto interamente da Mercati Internazionali, e che Imprese lo referenzia senza mai possederlo. Questo mapping adotta la riconciliazione come fonte autorevole (§10 di questo documento).

Nessun'altra ambiguità terminologica rilevante per il mapping fisico è stata riscontrata: il resto del documento logico è internamente coerente e già allineato con `domain-model.md` e `reconciliation-report.md`.

---

## 3. Nucleo persistente dell'impresa

Applicando la procedura decisionale di `03` §3 a ciascuna delle entità logiche di `imprese.md` §2, la tabella seguente identifica i concetti che richiedono una rappresentazione persistente autonoma. Come già osservato per il dominio Persone (`domain-mapping/persone.md` §2), nessun concetto è qui presentato come struttura tecnica: si indica solo la sua natura concettuale, la sua responsabilità, il suo ciclo di vita e il suo dominio proprietario.

| Concetto | Natura (pattern) | Responsabilità | Ciclo di vita | Dominio proprietario |
|---|---|---|---|---|
| **Impresa** | Aggregate Root (**A01**) ed Entity condivisa (**E03**) — referenziata sistematicamente da Appartenenze, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Mercati Internazionali e Professionisti, esattamente come `02` §4 già riconosce per Persona | Rappresentare il soggetto economico: chi è, cosa fa, come si presenta, quanto è affidabile (`imprese.md` §2) | Multi-asse: stato sostanziale, editoriale, di verifica, di pubblicazione, amministrativo, più l'archiviazione (§11) | Imprese |
| **SedeImpresa** | Entity dipendente (**E02**) — esiste solo nel confine dell'Aggregate Impresa (**A02**); richiede rappresentazione individuale per cardinalità 0..N e per proprietà proprie (tipologia, localizzazione) | Rappresentare un luogo fisico o operativo in cui l'Impresa è presente o opera (`imprese.md` §2) | Minimale, con propria visibilità (§7, §11) | Imprese |
| **SettoreImpresa** | Entity dipendente (**E02**) — rappresenta la singola dichiarazione di settore (principale o secondario), non il valore di settore in sé, che è **VO03** verso la Tassonomia condivisa | Rappresentare che l'Impresa opera in un determinato settore, con distinzione principale/secondario (`imprese.md` §2) | Minimale: Dichiarato → Rimosso, per analogia diretta con CompetenzaDichiarata/LinguaParlata di Persone (§21) | Imprese (per la dichiarazione); Tassonomia condivisa (per il valore di settore referenziato) |
| **ServizioImpresa** | Entity dipendente (**E02**) | Rappresentare un servizio offerto dall'Impresa (`imprese.md` §2) | Con propria redazione e proprio stato di pubblicazione (§11) | Imprese |
| **ProdottoImpresa** | Entity dipendente (**E02**) | Rappresentare un prodotto o una categoria di prodotti offerti (`imprese.md` §2) | Come ServizioImpresa | Imprese |
| **LinguaOperativaImpresa** | Entity dipendente (**E02**) — rappresenta la singola dichiarazione di lingua operativa per un dato contesto d'uso, non il valore di lingua in sé, che è **VO03** verso la Tassonomia condivisa | Rappresentare che l'Impresa è realmente operativa in una data lingua, per un dato contesto (`imprese.md` §2) | Minimale: Dichiarata → Rimossa, per analogia diretta con LinguaParlata di Persone (§21) | Imprese (per la dichiarazione); Tassonomia condivisa (per il valore di lingua referenziato) |
| **CertificazioneImpresa** | Entity dipendente (**E02**) | Rappresentare una certificazione, qualificazione, iscrizione o attestazione dichiarata o riconosciuta all'Impresa (`imprese.md` §2) | Articolato: stato sostanziale e stato di verifica indipendenti, con validità temporale (§11, §14) | Imprese |
| **CanaleImpresa** | Entity dipendente (**E02**) | Rappresentare un canale concreto attraverso cui l'Impresa opera o comunica con l'esterno, con natura e ValoreCanale obbligatorio (`imprese.md` §2, §10 regola 14) | Con propria visibilità (§8, §11) | Imprese |
| **MediaImpresa** | Entity dipendente (**E02**) | Rappresentare il materiale visivo e documentale pubblico dell'Impresa (`imprese.md` §2) | Con propria visibilità e propri ruoli (es. logo principale) (§11) | Imprese |

**Perché AppartenenzaImpresa e MercatoImpresa non compaiono in questa tabella.** Applicando la domanda 1 della procedura di `03` §3 ("è già l'Aggregate Root del dominio, secondo il documento logico?") e verificando la titolarità reale dichiarata da `appartenenze.md` e da `reconciliation-report.md` §11.2, entrambi i concetti risultano appartenere per intero a un altro Aggregate Root (Appartenenza per il primo, Presenza/Interesse di mercato per il secondo): non sono quindi concetti persistenti del dominio Imprese, ma relazioni referenziate (§9, §10). Includerli in questa tabella come se fossero concetti propri di Imprese violerebbe il principio "nessun dominio duplica fatti altrui" (`01` §2, principio 2) e l'anti-pattern "perdita del proprietario del dato" (`03` §14).

**Perché nessun dodicesimo concetto persistente autonomo emerge da questo dominio.** `imprese.md` §2 individua esattamente queste undici entità logiche (nove delle quali risultano qui persistenti in senso proprio); nessun attributo descrittivo di queste entità soddisfa, isolatamente, i criteri di separazione di `01` §4 (§4 di questo documento tratta esplicitamente perché tali attributi restano incorporati). Coerentemente con `03` §3 ("criterio di scelta per 'diventa dominio autonomo'"), questo documento non propone né riconosce alcun nuovo Aggregate Root: l'inventario dei domini resta quello chiuso da `reconciliation-report.md` Parte 1.

**Perché Impresa è, allo stesso tempo, A01 ed E03.** Come già per Persona (`domain-mapping/persone.md` §2), non è una combinazione anomala: `02` §4 riconosce esplicitamente che un concetto può essere insieme il centro di consistenza del proprio dominio (A01) e, dal punto di vista di chi lo osserva da fuori, un concetto ampiamente referenziato (E03) — la condivisione riguarda l'uso da parte di altri domini, non la proprietà, che resta sempre di Imprese (`01` §2, principio 1).

---

## 4. Concetti incorporati

I concetti seguenti non ricevono una rappresentazione persistente autonoma: restano incorporati nel concetto che li contiene, secondo i criteri di `01` §5 e i pattern Value Object di `02` §5.

| Concetto | Concetto ospitante | Pattern | Motivazione dell'incorporazione |
|---|---|---|---|
| Denominazione, Nome pubblico, Descrizione sintetica, Presentazione estesa | Impresa | Value Object incorporato (**VO01**), con finalità descrittiva (**C06**) | Cambiano sempre solidalmente con l'Impresa che li contiene; non hanno un proprio ciclo di vita né una propria cardinalità (`imprese.md` §2) |
| Anno di avvio | Impresa | Value Object incorporato (**VO01**) | Un singolo dato di decorrenza (**T03**, §14), non un fatto autonomamente referenziabile |
| Dimensione | Impresa | Value Object incorporato (**VO01**), riferito a un Elenco controllato (**C03**, §6) | Un'indicazione di scala per fasce, non un dato contabile preciso né un valore governato con proprio ciclo di gestione |
| Nome, descrizione, destinatari, territorio servito (attributi di ServizioImpresa; nome e descrizione anche di ProdottoImpresa) | ServizioImpresa / ProdottoImpresa | Value Object incorporato (**VO01**) | Descrivono la singola offerta, cambiano insieme a essa, non richiedono di essere referenziati singolarmente da altri concetti (`imprese.md` §2). Destinatari e territorio servito di ServizioImpresa sono testo dichiarativo, non cataloghi né VO03 |
| Eventuali lingue disponibili per un ServizioImpresa | ServizioImpresa | Riferimento strutturato (rinviato) a **LinguaOperativaImpresa** già owned | `imprese.md` §2: "riferimento a LinguaOperativaImpresa, quando rilevante". Non è VO01 testuale libero né duplicazione di literal linguistici; la relazione strutturata non è richiesta nella persistenza minima di M4.1 (§8A) |
| Contesto d'uso (commerciale/amministrativa/servizio clienti/tecnica/formazione) | LinguaOperativaImpresa | Value Object incorporato (**VO01**), come Tipologia (**C05**) applicata all'uso della singola dichiarazione | Qualifica la singola dichiarazione, non introduce un fatto a sé (`imprese.md` §2) |
| Nome/tipo della certificazione, ente emittente dichiarato | CertificazioneImpresa | Value Object incorporato (**VO01**) | Descrive la singola certificazione, cambia con essa |
| Natura del canale (sito proprio, e-commerce, marketplace, social, telefono commerciale, email commerciale, punto vendita come canale, rete distributiva) | CanaleImpresa | Tipologia (**C05**) | Classifica la natura della singola Entity CanaleImpresa, non un valore condiviso tra domini |
| Valore del canale (ValoreCanale) | CanaleImpresa | Value Object incorporato (**VO01**), con finalità descrittiva (**C06**) | Riferimento concreto obbligatorio del canale; distinto dalla natura; non ha ciclo di vita autonomo (`imprese.md` §2, §10 regola 14). Rappresentazione fisica futura: `channel_value` (§8) |
| Tipologia di sede (sede legale, operativa, punto vendita, laboratorio, stabilimento, magazzino, ufficio, sede secondaria) | SedeImpresa | Tipologia (**C05**) | Come sopra, per SedeImpresa |
| Ruolo di un elemento multimediale (es. "logo principale" vs immagine secondaria) | MediaImpresa | Value Object incorporato (**VO01**) | Qualifica la singola Entity MediaImpresa, non un fatto autonomo |

**Perché il riferimento a Settore, Lingua e Territorio non diventa un secondo Value Object locale.** SettoreImpresa, LinguaOperativaImpresa e SedeImpresa (per la componente Territorio) referenziano ciascuna esattamente una voce della Tassonomia condivisa. Questo riferimento non è un Value Object incorporato (VO01): è un Value Object riutilizzato da catalogo (**VO03**), perché la voce referenziata è posseduta da un unico dominio proprietario esterno — Tassonomia condivisa, non ancora oggetto di un proprio documento di mapping (§24) — e Imprese la referenzia senza mai copiarla né ridefinirla (`01` §2, principio 2; `02` §5, VO03). Questa è, con LinguaOperativaImpresa/LinguaParlata e SettoreImpresa/CompetenzaDichiarata, la prima verifica reale che lo stesso pattern (Entity dipendente + VO03) sia applicabile con identico significato a due domini diversi (§21).

**Perché "Eventuale classificazione istituzionale esterna" (`imprese.md` §2, SettoreImpresa) non applica VO03.** A differenza del riferimento alla Tassonomia condivisa (governata internamente alla piattaforma), un riferimento a una classificazione economica ufficiale esterna (per esempio un codice ATECO) non è un riferimento a un catalogo governato da un dominio di questa architettura: resta un Attributo descrittivo (**C06**) della singola SettoreImpresa — un dato che l'Impresa dichiara di possedere secondo un sistema esterno, non un valore che questa architettura gestisce o verifica come proprio catalogo. Introdurre qui un pattern VO03 sarebbe un'applicazione impropria del pattern (anti-pattern "riuso apparente ma incoerente", `03` §14), perché non esiste, in questa architettura, un dominio proprietario di quella classificazione esterna.

**Perché "periodo di validità" non compare come concetto separato per SettoreImpresa e LinguaOperativaImpresa.** Analogamente a quanto già stabilito per CompetenzaDichiarata e LinguaParlata in `domain-mapping/persone.md` §3, `imprese.md` non attribuisce a queste due entità alcuna scadenza distinta dal loro semplice stato (dichiarata/rimossa): introdurre un simile concetto non sarebbe una traduzione, ma un'aggiunta non autorizzata dal logico (`01` §2, principio 3). Il pattern Validità (**T01**) non trova quindi applicazione autonoma per queste due entità (§14).

**Rischi di una futura promozione impropria a entità autonoma.** Se un futuro requisito di prodotto richiedesse di referenziare individualmente, da un altro dominio, una singola dichiarazione di SettoreImpresa o LinguaOperativaImpresa (per esempio per costruire una vista "chi opera in questo settore" più ricca della semplice aggregazione), il criterio di priorità di `03` §3 ("la necessità di referenziabilità esterna... prevale sempre sugli altri quattro criteri") imporrebbe di rivalutare la loro natura da Entity dipendente semplice (E02) a Entity dipendente e condivisa insieme (E02+E03, come già avvenuto per StoriaPersonale in Persone e come già avviene qui per Impresa stessa). Questa condizione non è oggi soddisfatta da alcun documento logico esistente: nessun altro dominio dichiara di aver bisogno di referenziare individualmente una singola SettoreImpresa o LinguaOperativaImpresa, distinta dall'Impresa che la possiede.

---

## 5. Identità dell'impresa

Applicando la distinzione di `01` §6 all'Impresa e alle sue Entity dipendenti, senza mai far dipendere un riferimento tra domini da un'identità mutabile.

**Identità stabile e identità interna — Impresa.** L'Impresa è, con Persona, il secondo caso più critico di questo principio nell'intera architettura: è referenziata per identità stabile da sette degli altri dieci domini (Appartenenze, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Mercati Internazionali, Professionisti — §10). Coerentemente con `01` §6, questa identità non deve mai cambiare per l'intera durata di vita dell'Impresa, indipendentemente da come cambiano i suoi attributi pubblici (denominazione, nome pubblico, presentazione) e indipendentemente dalle transizioni di stato che percorre (§11). Nessun dominio esterno può basare un proprio riferimento sull'identità pubblica dell'Impresa (sotto): lo fa sempre sull'identità stabile.

**Identità pubblica — Impresa.** `imprese.md` §2 distingue esplicitamente **Denominazione** (il nome con cui l'Impresa è conosciuta amministrativamente) da **Nome pubblico** (l'identificativo con cui l'Impresa è mostrata e cercata sulla piattaforma, che può coincidere con la denominazione o essere un nome commerciale più riconoscibile): il Nome pubblico è, per definizione, un'identità pubblica (`01` §6), distinta dall'identità interna/stabile, che può cambiare nel tempo senza mai richiedere una nuova identità interna né rompere i riferimenti già stabiliti da altri domini. A differenza di Persona, `imprese.md` non impone esplicitamente l'unicità del Nome pubblico su tutta la piattaforma (una regola dichiarata invece per Persona, `persone.md` §7): questo mapping segnala l'assenza di tale vincolo come osservazione, non lo introduce di propria iniziativa (§24).

**Identità legale/istituzionale — Impresa, con un limite dichiarato.** La Denominazione e la Forma organizzativa (§6) qualificano l'identità dell'Impresa nel proprio contesto legale/istituzionale, ma `imprese.md` §12 lascia esplicitamente aperta la domanda se i dati fiscali dell'Impresa (per esempio un identificativo fiscale o un numero di iscrizione a un registro pubblico) debbano essere memorizzati come informazione propria del dominio o solo verificati contro una fonte esterna senza essere conservati. Questo mapping non introduce alcun identificativo esterno come componente dell'identità concettuale primaria dell'Impresa, coerentemente con `01` §6 ("quali identificativi non devono essere usati come identità concettuale primaria"): un identificativo fiscale, se e quando verrà modellato, resterà sempre un dato verificabile (§12) associato all'Impresa, mai la base della sua identità stabile — quella resta interamente interna alla piattaforma, indipendente da qualsiasi ordinamento nazionale (si veda anche il paragrafo sull'internazionalizzazione, sotto).

**Denominazioni precedenti e denominazioni commerciali (marchi) — questione rinviata dal livello logico.** `imprese.md` §11 ("Attività con più marchi") e §12 lasciano esplicitamente aperta la scelta se un'Impresa che opera con più marchi richieda un'entità Marchio autonoma o se resti una proprietà descrittiva. Questo mapping non risolve la domanda (non è di propria competenza farlo, `01` §2 principio 3): registra che, nella formulazione logica attuale, un cambio di denominazione è un aggiornamento del dato descrittivo dell'Impresa che "mantiene la propria identità e la propria storia... invariata" (`imprese.md` §11, "Attività che cambia denominazione") — e che, in assenza di un'indicazione contraria, la regola di default di continuità storica (`03` §8) impone di conservare comunque le denominazioni precedenti come fatto storico (S08/T07, §11, §14 di questo documento), anche senza introdurre un'entità Marchio autonoma.

**Identità pubblica — SedeImpresa, ServizioImpresa, ProdottoImpresa, CanaleImpresa, MediaImpresa, CertificazioneImpresa.** Nessuna di queste Entity dipendenti ha, secondo `imprese.md`, un'identità pubblica propria distinta dall'Impresa che la possiede: non sono mai citate o riconosciute da un osservatore esterno indipendentemente dall'Impresa (si conoscono sempre come "la sede/il servizio/il canale di questa Impresa"). Questo le distingue nettamente da StoriaPersonale nel dominio Persone, che ha invece un'identità pubblica propria perché referenziata individualmente da Contenuti editoriali (`domain-mapping/persone.md` §5): nessuna Entity dipendente di Imprese richiede oggi questa forma, coerentemente con l'assenza di una simile necessità di referenziabilità esterna dichiarata da alcun altro documento logico (§4, §10).

**Identità stabile — SettoreImpresa, LinguaOperativaImpresa.** Queste due Entity dipendenti hanno ciascuna una propria identità stabile, distinta da quella dell'Impresa che le possiede: è ciò che permette di applicare la regola di unicità del settore principale (`imprese.md` §10, regola 5) e di individuare singolarmente ciascuna dichiarazione per la sua eventuale rimozione (§11).

**Identità temporanea — non applicabile.** Nessuna delle entità di questo dominio ha un'identità che perde significato al termine di un processo limitato: non esiste, in `imprese.md`, alcun concetto assimilabile a una candidatura, una sessione o un accesso provvisorio (`01` §6). Coerentemente con la convenzione di non omissione (`03` §6, RC15 applicata per analogia all'identità, già impostata in `domain-mapping/persone.md` §5), questo documento dichiara esplicitamente che l'identità temporanea non trova alcuna applicazione in questo dominio.

**Identità derivata — non applicabile come categoria distinta.** Come già osservato in `domain-mapping/persone.md` §5 e segnalato come possibile miglioramento metodologico in `architecture-baseline.md` §8.1 punto 1, `01` §6 non cataloga esplicitamente una quarta forma di identità oltre a interna, pubblica, stabile e temporanea. Verificato che nessun concetto di questo dominio ha un'identità calcolata a partire da altri identificativi, questo mapping conferma — per la seconda volta, rafforzando l'osservazione già fatta per Persone — che la distinzione richiesta si esaurisce nelle tre forme applicabili (stabile/interna, pubblica, temporanea — quest'ultima non applicabile).

**Relazione tra identità dell'Impresa e identità delle Persone collegate.** L'identità dell'Impresa non dipende in alcun modo dall'identità delle Persone che la animano in un dato momento: un'Impresa mantiene la propria identità stabile anche quando tutte le Persone collegate cambiano nel tempo (successione di Appartenenze, `appartenenze.md` §7), e anche quando nessuna Persona collegata ha un profilo pubblico (`imprese.md` §11, "Impresa gestita da una Persona senza profilo pubblico"). Questa indipendenza è la stessa già stabilita nel verso opposto da `domain-mapping/persone.md` §5 per l'identità di Persona rispetto alle Appartenenze che la coinvolgono: nessuno dei due domini fa dipendere la propria identità stabile da un fatto posseduto da un terzo dominio (Appartenenze).

**Quale identità rimane stabile nel tempo; quali elementi possono cambiare; quali devono essere storicizzati.** Rimane stabile: l'identità interna dell'Impresa. Possono cambiare, senza intaccare l'identità stabile: Denominazione, Nome pubblico, Descrizione, Presentazione, Forma organizzativa (se il dominio logico arriverà a modellarne il cambiamento), Dimensione. Devono essere storicizzati, per la regola di default di `03` §8: ogni cambiamento di Denominazione, Nome pubblico e Forma organizzativa, coerentemente con `imprese.md` §11 ("Attività che cambia denominazione") e con la decisione vincolante 20 di `domain-model.md` ("le modifiche storiche rilevanti... devono poter essere conservate, non semplicemente sovrascritte").

**Quali identificativi non devono essere usati come identità concettuale primaria.** Nessun identificativo esterno (fiscale, di registro pubblico, di classificazione istituzionale esterna, §6) deve mai essere usato come identità concettuale primaria dell'Impresa: questi identificativi, quando e se modellati, restano sempre dati verificabili accessori (§12), mai la base per cui altri domini la referenziano.

**Internazionalizzazione e neutralità rispetto ai Paesi.** `imprese.md` §2 descrive la Forma organizzativa come "una proprietà informativa, non... un vincolo che forza il modello verso una sola forma" e il documento tratta esplicitamente il caso "Impresa estera con unità operativa in Italia" (§11) come pienamente legittimo, senza richiedere che un'Impresa sia "nata" in Italia. Questo mapping conferma che l'identità dell'Impresa, come già quella di Persona, non presume alcun ordinamento giuridico né alcuna nazionalità come default implicito: è coerente con l'attributo di qualità Internazionalizzazione (`04` §13) e con la missione della piattaforma dichiarata in `domain-model.md` §1. Resta rinviata (§24) la questione di come rappresentare, in futuro, identificativi legali che variano da giurisdizione a giurisdizione, senza però che questa lacuna comprometta l'identità concettuale primaria dell'Impresa, che resta sempre indipendente da essi.

---

## 6. Classificazioni

Applicando la procedura di scelta tra Classificazione e Dato derivato (`03` §3, ultimo criterio) e la famiglia di pattern Classificazione (`02` §12, C01-C06) a ciascuna classificazione dichiarata da `imprese.md`.

| Classificazione | Locale o condivisa | Appartiene a un catalogo? | Multipla? | Validità temporale? | Dichiarabile/verificabile? | Dominio che possiede il significato | Pattern |
|---|---|---|---|---|---|---|---|
| **Settore economico** (principale e secondari, SettoreImpresa) | Condivisa | Sì — Tassonomia Settore (Tassonomia condivisa) | Sì, per i secondari; il principale è unico per Impresa (`imprese.md` §10, regola 5) | Non dichiarata da `imprese.md` per la singola dichiarazione (§4 di questo documento) | Dichiarabile (nessuna verifica di "settore" è censita in `imprese.md` §8) | Tassonomia condivisa (per il valore); Imprese (per la dichiarazione, tramite SettoreImpresa) | E02 (SettoreImpresa) + VO03 + C02 |
| **Classificazione istituzionale esterna** (es. codice ufficiale, quando dichiarato) | Locale al dato dichiarato, non governata da questa architettura | No — non esiste un dominio proprietario interno di questa classificazione | Non specificato da `imprese.md` | Non dichiarata | Dichiarabile, non verificabile secondo un processo previsto da questo dominio | Imprese (come semplice attributo dichiarato) | C06 (§4 di questo documento) |
| **Forma organizzativa** | Locale | No — `imprese.md` §2 la presenta come un insieme enumerato di alternative (impresa individuale, società, cooperativa, startup, attività professionale organizzata, impresa sociale, ente economico, attività commerciale/artigianale), senza un proprio processo di gestione nel tempo | No, un solo valore per Impresa | Non trattata come storicizzabile in modo esplicito da `imprese.md` (il cambiamento di forma è trattato come possibile evento futuro, "Fusione, cessione o trasformazione societaria", §11, questione aperta) | Dichiarabile; nessuna verifica specifica censita | Imprese | C03 (Elenco controllato) |
| **Dimensione** (fasce) | Locale | No — un insieme di fasce, non un catalogo gestito autonomamente | No | Non trattata come storicizzabile in modo esplicito | Dichiarabile | Imprese | C03 |
| **Tipologia di sede** (legale, operativa, punto vendita, laboratorio, stabilimento, magazzino, ufficio, sede secondaria) | Locale | No | Sì, per Impresa (più sedi di tipologie diverse); non multipla per la singola SedeImpresa | Non applicabile alla classificazione in sé | Dichiarabile | Imprese | C05 (Tipologia), applicata a SedeImpresa |
| **Natura del canale** (sito proprio / `own_site`, e-commerce / `ecommerce`, marketplace / `marketplace`, social / `social`, telefono commerciale / `commercial_phone`, email commerciale / `commercial_email`, punto vendita come canale / `retail_point`, rete distributiva / `distribution_network`) | Locale | No | Sì, per Impresa | Non applicabile | Dichiarabile | Imprese | C05, applicata a CanaleImpresa |
| **Stato di certificazione** (autodichiarata, verificata, scaduta, revocata, in verifica) | Locale | No — enumerazione chiusa | Non applicabile (è lo stato di una singola CertificazioneImpresa) | Sì, per costruzione (§13, §14) | È essa stessa in parte l'esito di una Verifica | Imprese | Non è una Classificazione in senso proprio: è l'asse di stato di verifica (S03) della singola CertificazioneImpresa, trattato in dettaglio al §13; qui riportato solo per completezza dell'inventario |

**Perché "Settore" applica sia E02 sia VO03 insieme, e non un solo pattern.** SettoreImpresa (§3) è la singola dichiarazione — un'Entity dipendente con una propria identità (posso rimuovere questa dichiarazione senza toccare le altre) — mentre il valore di settore che essa referenzia è un Value Object riutilizzato da catalogo (VO03), posseduto dalla Tassonomia condivisa. La combinazione E02+VO03+C02 è la stessa già applicata da `domain-mapping/persone.md` §21 (implicitamente, per CompetenzaDichiarata/LinguaParlata) e qui esplicitamente confermata come riuso corretto (`03` §4), non copia: entrambi i documenti citano gli stessi codici per lo stesso tipo di problema.

**Perché "Forma organizzativa" e "Dimensione" applicano C03 e non C02.** Applicando il criterio distintivo di `02` §12 ("Elenco controllato... assenza di un proprio ciclo di gestione: i valori... sono parte della definizione stessa del concetto che classificano, non un catalogo esterno"): `imprese.md` §2 presenta entrambe come un insieme chiuso di alternative descritte direttamente nel testo del documento logico, non come un catalogo con una propria vita (aggiunta, correzione, disattivazione di voci) gestito da un dominio a sé. Non esiste, nella riconciliazione logica (`reconciliation-report.md` §7, Glossario canonico), alcuna Tassonomia condivisa denominata "Forma organizzativa" o "Dimensione d'impresa": trattarle come C02 introdurrebbe un catalogo condiviso che nessun documento logico ha mai dichiarato.

**Perché "Stato operativo" (Impresa attiva/cessata) non compare in questa tabella.** Non è una Classificazione (C01-C06): è l'asse di Stato sostanziale (S01) dell'Aggregate Impresa, trattato al §11 di questo documento. La distinzione — già stabilita in `02` §12 rispetto a `01` §9 — è che una Classificazione organizza alternative descrittive comparabili tra istanze diverse, mentre uno Stato descrive la condizione di fatto di una singola istanza nel tempo: includerlo qui violerebbe la separazione tra le due famiglie di pattern.

**Perché nessuna categoria discriminatoria o dedotta dalle Persone collegate è stata introdotta.** Nessuna delle classificazioni sopra deriva, direttamente o indirettamente, dall'origine, dalla nazionalità o dall'identità delle Persone collegate tramite AppartenenzaImpresa: `imprese.md` non lo prevede in alcun punto, e questo mapping non introduce alcuna simile deduzione automatica, in coerenza con il principio di non-automatismo (`domain-model.md` §1) già applicato in `domain-mapping/persone.md` per la LinguaParlata rispetto all'origine della Persona. Un'eventuale futura classificazione dell'Impresa basata sulla provenienza delle Persone che la animano (per esempio "impresa fondata da persone immigrate") resterebbe, se mai introdotta, un dato derivato (D04-D06) esplicitamente dichiarato come tale, mai una classificazione automatica dell'Impresa.

**Eventuali categorie editoriali o di ricerca.** `imprese.md` non dichiara, per l'Impresa, alcuna classificazione editoriale distinta dal Settore economico (a differenza, per esempio, di quanto un futuro dominio Contenuti editoriali potrebbe fare per le proprie StorieImpresa, che restano fuori dal perimetro di questo documento, §1). Questo mapping non introduce quindi alcuna classificazione editoriale propria del dominio Imprese.

---

## 7. Sedi e presenza territoriale

**Perimetro logico.** `imprese.md` §2 (SedeImpresa) e §4 (R3, R12) prevedono un unico concetto di sede, con una Tipologia (§6 di questo documento) che distingue sede legale, sede operativa, punto vendita, laboratorio, stabilimento, magazzino, ufficio e sede secondaria, e un riferimento a un Territorio (dominio esterno). Nessuno degli altri concetti elencati nella struttura richiesta da questo mapping — sede temporanea, presenza estera come categoria distinta, territorio servito, area di attività — è un concetto separato secondo il documento logico: questo paragrafo dichiara esplicitamente, per ciascuno, se e come si riconduce al concetto unico di SedeImpresa o a un concetto diverso, per evitare l'anti-pattern "riuso apparente ma incoerente" (`03` §14).

| Concetto richiesto dalla struttura | Corrispondenza in `imprese.md` | Trattamento in questo mapping |
|---|---|---|
| Sede principale | Non un concetto distinto: `imprese.md` §10 regola 4 prevede "una sola sede principale dello stesso tipo per Impresa" come un attributo (ruolo) della singola SedeImpresa, non una nuova Entity | Attributo incorporato (VO01) della SedeImpresa, §4 di questo documento |
| Sede legale | Una Tipologia di SedeImpresa (C05) | SedeImpresa con Tipologia = sede legale |
| Sede operativa | Una Tipologia di SedeImpresa (C05) | SedeImpresa con Tipologia = sede operativa |
| Unità locale | Non nominata esplicitamente da `imprese.md`; assimilabile a "sede secondaria" o "punto vendita" tra le Tipologie già previste | Nessuna nuova Entity: rientra nelle Tipologie già censite (C05); un'eventuale distinzione più fine resta questione aperta (§24) |
| Sede temporanea | Non prevista da `imprese.md`: nessuna Tipologia né alcuna regola prevede una scadenza per una SedeImpresa | Non applicabile — dichiarato esplicitamente, non omesso (per analogia con `03` §6, RC15 applicata alle Tipologie) |
| Presenza estera | Non una categoria di sede distinta: `imprese.md` §11 ("Impresa estera con unità operativa in Italia") tratta una sede all'estero come una SedeImpresa con Territorio non italiano, non come un concetto diverso | SedeImpresa con Territorio estero; nessuna nuova Entity |
| Territorio servito | Un attributo di ServizioImpresa (`imprese.md` §2: "territorio servito" tra le proprietà di significato di ServizioImpresa), non della SedeImpresa | Value Object incorporato (VO01) di ServizioImpresa — concetto distinto dalla Sede (sotto) |
| Area di attività | Non un concetto autonomo: sovrapponibile a Settore economico (§6) o a Territorio servito (sopra), secondo il contesto | Nessuna nuova Entity introdotta; si rimanda ai due concetti già censiti |
| Localizzazione dichiarata / verificata | `imprese.md` non censisce, tra gli aspetti verificati (§8), una verifica specifica di localizzazione | La localizzazione (riferimento a Territorio) è un dato dichiarato (D02); nessuna Verifica (V01) di "sede" è oggi prevista dal documento logico (§12 di questo documento) |

**Cosa appartiene all'Impresa; cosa ha identità o ciclo di vita autonomo; cosa è relazione contestuale.** SedeImpresa appartiene interamente al dominio Imprese: è un'Entity dipendente (E02) che esiste solo entro il confine dell'Aggregate Impresa (A02), non ha significato al di fuori di esso (`imprese.md` §4, R3: "1 SedeImpresa → esattamente 1 Impresa") e non è mai referenziata individualmente da altri domini (§5, §10 di questo documento): non ha quindi un'identità pubblica propria, ma ha un'identità stabile locale sufficiente a distinguere una sede dall'altra e ad applicare la regola di unicità (`imprese.md` §10, regola 3-4). Il legame con l'Impresa applica il pattern di Relazione strutturale (R01, `02` §6): non è una relazione contestuale (R02) tra due Aggregate autonomi, perché la SedeImpresa non ha esistenza al di fuori dell'Impresa che la possiede.

**Validità temporale e storicizzazione.** `imprese.md` non dichiara esplicitamente che una SedeImpresa debba avere un periodo di validità (T01/T05) distinto dalla sua semplice esistenza o rimozione: coerentemente con la regola di default di continuità storica (`03` §8), questo mapping applica comunque S08/T07/D08 per la rimozione di una sede (una sede rimossa resta un fatto storico, non viene distrutta), senza però introdurre un pattern di Intervallo (T05) con Decorrenza e Scadenza esplicite, che `imprese.md` non richiede.

**Coesistenza.** Più SedeImpresa di Tipologie diverse, e anche della stessa Tipologia quando la regola di unicità non si applica (`imprese.md` §10, regola 4, "quando le regole di dominio prevedono l'unicità per quel tipo"), possono coesistere per la stessa Impresa: questo è già garantito dalla cardinalità 0..N di R3 (`imprese.md` §4) e non richiede alcun pattern aggiuntivo.

**Come evitare di confondere sede, territorio servito e mercato.** I tre concetti restano, in questo mapping, rigorosamente distinti perché appartengono a tre livelli diversi della piattaforma: la **SedeImpresa** (§3 di questo documento) è un luogo fisico o operativo, posseduta da Imprese; il **Territorio servito** (sopra) è un attributo descrittivo di un singolo ServizioImpresa, anch'esso posseduto da Imprese, che non implica l'esistenza di una sede in quel territorio; il **Mercato** (MercatoImpresa, §10 di questo documento) è una relazione con un Aggregate posseduto da Mercati Internazionali, che descrive dove l'Impresa opera o vuole operare commercialmente, indipendentemente dal fatto che vi abbia una sede fisica. Confondere questi tre livelli — per esempio deducendo un Mercato dalla sola presenza di una SedeImpresa in un dato Territorio — introdurrebbe un dato derivato (D04) non dichiarato da alcun documento logico, violando `03` §9 ("quando evitarli").

**Il modello delle sedi come pattern riutilizzabile.** Il modello di SedeImpresa (Entity dipendente E02, riferimento a Territorio via VO03, Tipologia via C05, ruolo di "principale" come VO01, nessuna verifica dedicata, storicizzazione di default) non introduce alcun pattern nuovo rispetto a quelli già catalogati: è un'applicazione diretta di E02+R01+VO03+C05, la stessa combinazione già usata per altri concetti dipendenti sia in questo documento (SettoreImpresa, §6) sia in `domain-mapping/persone.md` (CompetenzaDichiarata, LinguaParlata). Questo mapping conferma quindi (§21) che "Entity dipendente con riferimento a Tassonomia condivisa e Tipologia locale" è un pattern combinato realmente riutilizzabile, non un caso isolato del dominio Imprese: ogni futuro dominio che debba rappresentare un concetto "dipendente, classificato per tipo, localizzato su un catalogo condiviso" (per esempio una futura Sede di un'Organizzazione istituzionale, `reconciliation-report.md` §13) può applicare la stessa combinazione senza inventarne una nuova.

---

## 8. Contatti e presenza digitale

**Assenza di un concetto "Contatto" distinto in `imprese.md`.** A differenza della struttura richiesta da questo mapping, che elenca separatamente telefono, email, sito, canali social, piattaforme digitali, canali pubblici, contatti riservati e contatti temporanei, il documento logico non introduce un'Entity "Contatto": unifica tutti questi concetti in **CanaleImpresa** (`imprese.md` §2, §10 regola 14). Questo mapping non introduce quindi una nuova Entity "Contatto" accanto a CanaleImpresa: sarebbe un'invenzione non autorizzata dal livello logico (`01` §2, principio 3). L'unificazione implica che CanaleImpresa assorba sia la **natura** sia il **ValoreCanale** (riferimento concreto) del contatto dell'Impresa: eliminare Contatto senza conservare il valore svuoterebbe il fatto.

| Concetto richiesto | Corrispondenza |
|---|---|
| Telefono commerciale | CanaleImpresa con NaturaCanale = telefono commerciale (`commercial_phone`) + ValoreCanale |
| Email commerciale | CanaleImpresa con NaturaCanale = email commerciale (`commercial_email`) + ValoreCanale |
| Sito, e-commerce, marketplace, social, piattaforme digitali, canali pubblici | CanaleImpresa con la relativa NaturaCanale (C05) + ValoreCanale |
| Contatti riservati | Non un concetto distinto: la visibilità propria di ogni CanaleImpresa (`imprese.md` §9, tabella) può essere non pubblica, realizzando lo stesso effetto senza una nuova Entity |
| Contatti temporanei | Non previsto da `imprese.md`: nessuna Tipologia o regola prevede una scadenza per un CanaleImpresa — dichiarato non applicabile, non omesso |
| Contatti verificati | Non censito tra gli aspetti verificati di `imprese.md` §8: nessuna Verifica specifica di un CanaleImpresa è prevista dal documento logico (§12 di questo documento) |
| Preferenze di visibilità | La visibilità propria di CanaleImpresa (`imprese.md` §9), applicazione locale del pattern Visibilità (VIS04/VIS06, §15 di questo documento) |
| Referente di contatto | Non un attributo di CanaleImpresa: è il ruolo "Referente operativo" di un'AppartenenzaImpresa (`imprese.md` §7) — una Persona, non un canale (§9 di questo documento) |

### 8.1 NaturaCanale (C05) — vocabolario chiuso

Vocabolario locale chiuso della Tipologia C05 applicata a CanaleImpresa. Literal fisici raccomandati per lo schema futuro (M3.2):

| Literal fisico | Significato | Significato minimo di ValoreCanale (`channel_value`) |
|---|---|---|
| `own_site` | Sito proprio | Indirizzo o riferimento testuale del sito proprio, normalmente un URL |
| `ecommerce` | E-commerce | Riferimento concreto del canale di commercio elettronico (URL o identificatore dichiarativo); ogni riga identifica un canale concreto |
| `marketplace` | Marketplace (natura del canale, non un dominio) | Indirizzo, profilo, nome identificativo o riferimento concreto della presenza su un marketplace; non crea né anticipa un dominio Marketplace |
| `social` | Social | Indirizzo, handle, profilo o riferimento concreto; piattaforme o profili diversi = righe distinte |
| `commercial_phone` | Telefono commerciale | Numero telefonico commerciale dichiarato; non è contatto personale di una Persona |
| `commercial_email` | Email commerciale | Indirizzo email commerciale dichiarato; non è credenziale di Account né fatto di Identità & Accessi |
| `retail_point` | Punto vendita come canale commerciale | Riferimento dichiarativo a un punto attraverso cui l'Impresa raggiunge commercialmente il pubblico (denominazione commerciale, riferimento pubblico o recapito utilizzabile). **Non** sostituisce SedeImpresa; **non** è localizzazione strutturale; **non** richiede FK verso `business_locations`; l'eventuale relazione strutturata con una sede fisica è fuori M3.2 e non va anticipata |
| `distribution_network` | Rete distributiva | Denominazione, riferimento o recapito concreto della rete distributiva; non crea un dominio ReteDistributiva |

### 8.2 ValoreCanale — rappresentazione fisica futura (`channel_value`)

Prescrizione per lo schema futuro di M3.2 (non una Entity autonoma):

| Aspetto | Decisione |
|---|---|
| Nome fisico raccomandato | `channel_value` |
| Pattern | VO01 + C06 incorporato in CanaleImpresa |
| Tipo fisico | `text` |
| Nullability | `NOT NULL` |
| Default | Assente |
| Vincolo concettuale | Valore non vuoto e non composto soltanto da spazi |
| FK | Assente |
| UNIQUE | Non prescritto; eventuali duplicati letteralmente identici restano gestibili applicativamente o in decisione fisica successiva |
| Validazione specifica (URL, email, telefono, regex, normalizzazione, protocolli, lunghezze, parsing, JSON) | **Non** prescritta in questa fase; resta applicativa finché non esiste un contratto dedicato |
| Significato | Variabile in funzione di `channel_type` (tabella §8.1); sempre riferimento concreto interpretabile, distinto dalla natura |
| Conservazione | Il ValoreCanale resta conservato anche quando il canale è rimosso (S08), salvo future regole specifiche |

**Cosa ValoreCanale non è.** Non è una foreign key; non è un'identità autonoma; non è un Account; non è una credenziale, password o token; non è un catalogo; non è un JSON; non è un insieme di colonne tipizzate per natura; non è una relazione automatica con SedeImpresa; non è un dato verificato o autenticato; non è una prova di proprietà del canale.

**Titolarità, verificabilità, priorità, riusabilità.** Ogni CanaleImpresa è posseduto interamente dall'Impresa (Entity dipendente, E02, relazione strutturale R01 con l'Aggregate); non ha una propria Verifica dedicata secondo `imprese.md` §8 (nessun aspetto "canale verificato" è censito nella tassonomia consolidata delle verifiche, `reconciliation-report.md` §9.1, applicabile a questo dominio); non ha una priorità dichiarata esplicitamente tra più canali dello stesso tipo (`imprese.md` non prevede un ordinamento tra CanaleImpresa, a differenza del ruolo di "sede principale" per SedeImpresa, §7 di questo documento); è storicizzabile per default (S08/T07/D08, `03` §8) alla rimozione. Più canali della stessa natura sono ammessi quando i ValoreCanale differiscono.

**Separazione rigorosa tra contatto dell'Impresa, contatto personale, relazione con il referente e identità digitale di accesso.** Applicando esplicitamente la richiesta di separazione di questo mapping:
- il **contatto dell'Impresa** (CanaleImpresa: natura + ValoreCanale) è posseduto da Imprese ed esiste indipendentemente da quale Persona in un dato momento vi risponde (`imprese.md` §2, motivo dell'esistenza di LinguaOperativaImpresa, applicabile per analogia diretta anche a CanaleImpresa: "la capacità... è un attributo dell'organizzazione, non la somma casuale di chi vi lavora in un dato istante"); telefono commerciale ed email commerciale appartengono a Imprese, non a Persone né a Identità & Accessi;
- il **contatto personale di un referente** (per esempio il telefono personale di una Persona) non è un concetto del dominio Imprese: appartiene, se mai modellato, al dominio Persone, che questo documento non incorpora né referenzia per questo aspetto;
- la **relazione con il referente** (chi è il Referente operativo di questa Impresa) è un attributo di ruolo dell'AppartenenzaImpresa (`imprese.md` §7), posseduto da Appartenenze secondo la riconciliazione (§9 di questo documento), non da Imprese;
- l'**identità digitale usata per accedere alla piattaforma** appartiene interamente a Identità & Accessi (`imprese.md` §1, "Non comprende l'infrastruttura tecnica di autenticazione... Il dominio Imprese descrive solo il significato di business della facoltà di gestione"), fuori dal perimetro di questo documento.

**CanaleImpresa come pattern riutilizzabile.** Come per SedeImpresa (§7), CanaleImpresa applica E02 (Entity dipendente) + R01 (Relazione strutturale) + C05 (Tipologia) + VO01 (ValoreCanale) + VIS04/VIS06 (visibilità propria) + storicizzazione di default. Questo mapping conferma (§21) che la stessa combinazione, già osservata per le sedi (con VO03 Territorio al posto di ValoreCanale testuale), si applica ai canali come "Entity dipendente classificata per tipo, con valore concreto e visibilità propria", evitando l'anti-pattern "riuso apparente ma incoerente" (`03` §14).

---

## 8A. Offerta di servizi (ServizioImpresa)

**Perimetro.** ServizioImpresa è Entity dipendente (**E02**) owned da Imprese: offerta concreta dichiarata dall'Impresa, consultabile come parte della scheda, distinta da SettoreImpresa, da ProdottoImpresa, da Opportunità, da ServizioProfessionale (Professionisti) e da ogni catalogo generale di servizi della piattaforma (`imprese.md` §2; `logical/professionisti.md` §1, §7).

**Cosa rende concreto un servizio.** Il *nome* obbligatorio non vuoto (`imprese.md` §10 regola 15). Una riga con solo identità e ownership senza nome non è un ServizioImpresa.

### 8A.1 Attributi descrittivi (VO01) — rappresentazione fisica futura (M4.1)

| Aspetto | Nome fisico raccomandato | Tipo | Nullability | Default | Vincolo | Significato |
|---|---|---|---|---|---|---|
| Nome del servizio | `name` | text | `NOT NULL` | Assente | Anti-vuoto (non solo spazi) | Denominazione dichiarativa dell'offerta; libera; non UNIQUE per Impresa |
| Descrizione | `description` | text | Nullable | Assente | Nessuno oltre al tipo | Testo dichiarativo facoltativo; non Contenuto editoriale |
| Destinatari | `target_audience` | text | Nullable | Assente | Nessun CHECK chiuso | Dichiarazione aperta (es. «PMI manifatturiere», «famiglie e privati»); non catalogo Destinatari; non array/JSON; non relazione a soggetti nominati |
| Territorio servito | `served_territory` | text | Nullable | Assente | Se valorizzato: anti-vuoto (non solo spazi) | Area geografica dichiarata in cui il servizio è disponibile; **non** SedeImpresa; **non** VO03 Territori; **non** MercatoImpresa; **non** `territory_id` / UUID opaco; **non** ISO/GIS/indirizzo |

**Cosa questi attributi non sono.** Non sono FK; non sono cataloghi C02/C03; non sono coordinate; non sono punti vendita (`retail_point` di CanaleImpresa); non sono rete distributiva; non deducono MercatoImpresa.

### 8A.2 Lingue del servizio — rinvio

Le lingue «quando rilevanti» (`imprese.md` §2) sono un riferimento a **LinguaOperativaImpresa**, non letterali liberi sul servizio. **Fuori perimetro M4.1:** nessuna colonna lingua, nessun array, nessuna FK a `business_operational_language_declarations` in M4.1. M4.1 resta dipendente solo da M1.1. Una futura unità additiva potrà introdurre la relazione strutturata (cardinalità 0..N, ownership Imprese) senza alterare il nucleo del servizio.

**Perché non derivare automaticamente tutte le lingue operative dell'Impresa.** Il logico parla di lingue *per quel servizio*, quando rilevante: non afferma che ogni servizio erediti l'intero insieme di LinguaOperativaImpresa.

### 8A.3 Assi S04 e S08 — vocabolari distinti da Sede/Canale

| Asse | Nome fisico raccomandato | Literal | Default | Note |
|---|---|---|---|---|
| **S04** Stato di pubblicazione proprio | `publication_status` | `draft` \| `published` | `draft` | Corrisponde a Bozza / Pubblicato (`imprese.md` §2, §9). **Non** usare `visibility_status` / `non_public`\|`public` (vocabolario di SedeImpresa/CanaleImpresa/MediaImpresa). **Non** introdurre un secondo asse S02. Ceiling rispetto all'Impresa = esposizione / presentazione **M7.1** (§15.1), non CHECK composito in M4.1 |
| **S08** Esistenza/rimozione | `service_status` | `active` \| `removed` | `active` | Rimozione storicizzata: riga e contenuti conservati. Distinto da `draft` e da soft-delete Impresa (`deleted_at`). Riattivazione (`removed` → `active`) ammessa (non terminale come Dichiarata→Rimossa di Settore/Lingua). Relazione con S04: assi indipendenti a livello dati; un servizio `removed` può conservare `publication_status = published` — la non esposizione pubblica è regola di presentazione / M7.1, non fusione degli assi |

**Tabella fisica raccomandata.** `public.business_services` (parallelo a `business_locations` / `business_channels`). Identità locale UUID; `business_id` NOT NULL FK → `businesses(id)` ON DELETE CASCADE; timestamps `created_at` / `updated_at`; trigger `updated_at`; RLS abilitata senza policy; `REVOKE ALL` da `anon`/`authenticated` (stesso schema difensivo delle Entity owned già approvate). Nessuna identità pubblica autonoma (§5). Nessun UNIQUE sul nome. Indice su `business_id`.

**Confine con ProdottoImpresa.** M4.2 resta tabella separata: stessi assi S04/S08 e pattern E02, attributi non identici (ProdottoImpresa non ha destinatari/territorio/lingue nel logico). Vietata super-entità polimorfica `business_offerings`. Dettaglio prescrittivo: §8B.

---

## 8B. Offerta di prodotti (ProdottoImpresa)

**Perimetro.** ProdottoImpresa è Entity dipendente (**E02**) owned da Imprese: offerta concreta o linea dichiarativa di prodotti della scheda Impresa (`imprese.md` §2). Distinta da ServizioImpresa (§8A), SettoreImpresa, MercatoImpresa, Opportunità, MediaImpresa, ServizioProfessionale e da ogni catalogo centrale di prodotti. Non è e-commerce.

**Cosa rende concreto un prodotto.** Il *nome* obbligatorio non vuoto (`imprese.md` §10 regola 16). Una riga con solo identità e ownership senza nome non è un ProdottoImpresa.

### 8B.1 Attributi descrittivi (VO01) — rappresentazione fisica futura (M4.2)

| Aspetto | Nome fisico raccomandato | Tipo | Nullability | Default | Vincolo | Significato |
|---|---|---|---|---|---|---|
| Nome del prodotto | `name` | text | `NOT NULL` | Assente | Anti-vuoto (non solo spazi) | Denominazione dichiarativa dell'offerta o della linea; libera; non UNIQUE per Impresa |
| Descrizione | `description` | text | Nullable | Assente | Nessuno oltre al tipo | Testo dichiarativo facoltativo; non Contenuto editoriale |

**Attributi esplicitamente esclusi da M4.2.** Destinatari; territorio servito; lingue; prezzo; valuta; disponibilità; modalità di acquisto; contatto; URL; media; marchio come Entity; origine; unità di misura; categoria/raggruppamento strutturato (questione aperta `imprese.md` §12 — **non** introdotta); FK a Settore, Mercato, Sede, Canale, Servizio.

### 8B.2 Assi S04 e S08

| Asse | Nome fisico raccomandato | Literal | Default | Note |
|---|---|---|---|---|
| **S04** Stato di pubblicazione proprio | `publication_status` | `draft` \| `published` | `draft` | Stesso vocabolario di ServizioImpresa (§8A.3 / §11.2). Ceiling vs Impresa = esposizione **M7.1** (§15.1). Non `visibility_status` |
| **S08** Esistenza/rimozione | `product_status` | `active` \| `removed` | `active` | Analogo a `service_status` di ServizioImpresa. Rimozione storicizzata; riattivazione ammessa; indipendente da S04; `removed`+`published` ammesso a livello dati |

**Tabella fisica raccomandata.** `public.business_products`. Identità locale UUID; `business_id` NOT NULL FK → `businesses(id)` ON DELETE CASCADE; timestamps; trigger `updated_at` dedicato; RLS abilitata senza policy; `REVOKE ALL` da `anon`/`authenticated`. Nessuna identità pubblica autonoma. Nessun UNIQUE sul nome. Indice su `business_id`. Nessuna FK verso `business_services`.

**Blocco M4.** Le sole unità del blocco M4 sono M4.1 (ServizioImpresa, chiusa) e M4.2 (ProdottoImpresa). La relazione lingue-servizio (§8A.2, §24 punto 24) **non** appartiene a M4 e non riceve numero M4.x in questo piano.

---

## 9. Relazioni con Persone

**Principio di ownership, ribadito prima del dettaglio.** Ogni relazione tra un'Impresa e una Persona passa per l'aggregato connettivo che `appartenenze.md` possiede come Aggregate Root autonomo (Appartenenza) e che `imprese.md` §2 descrive, dal proprio punto di vista, come "AppartenenzaImpresa" — la stessa relazione, non due relazioni distinte (§2 di questo documento). Applicando `03` §5 ("Ogni relazione mantiene un dominio proprietario") e RC12/RC13 (`03` §13), questo paragrafo **non ridescrive** le regole della relazione (già di competenza esclusiva del futuro `domain-mapping/appartenenze.md`): si limita a elencare i ruoli e gli attributi che `imprese.md` attribuisce a questa relazione dal proprio punto di vista, dichiarando esplicitamente, per ciascuno, che la proprietà resta di Appartenenze.

| Ruolo/attributo (dal punto di vista di `imprese.md`) | Significato | Dominio proprietario | Direzione | Temporalità | Verificabilità | Visibilità | Pattern | Perché non è incorporato in Imprese |
|---|---|---|---|---|---|---|---|---|
| **Fondatore, titolare, socio, amministratore, legale rappresentante, dirigente, referente, dipendente, collaboratore, professionista esterno** (Ruoli previsti, `imprese.md` §2) | La natura della relazione tra la Persona e l'Impresa | Appartenenze | Persona ↔ Impresa | Con Periodo (da-a, eventualmente aperto) | Sì — "Relazione con l'impresa verificata" (`imprese.md` §8) | Propria, indipendente da quella dell'Impresa o della Persona (`imprese.md` §2) | R07 (Relazione di appartenenza) | I ruoli descrivono il legame tra due Aggregate distinti (Persona, Impresa): per costruzione appartengono all'aggregato connettivo, non a uno dei due soggetti che lega (`domain-model.md`, decisione vincolante 4) |
| **Autorizzazione a rappresentare o gestire la scheda** (`imprese.md` §2, §7) | Se la relazione dà, non dà, o dà solo in parte la facoltà di intervenire sulla scheda impresa | Appartenenze | Impresa → Persona (facoltà concessa) | Segue il Periodo della relazione | Non equivalente alla rappresentanza legale reale (`imprese.md` §7, principio cardine) | Interna, non necessariamente pubblica | R06 (Relazione di rappresentanza), quando la relazione dà effettivamente la facoltà; altrimenti nessun pattern R06 si applica | È un attributo di significato di business della relazione stessa, non un fatto autonomo dell'Impresa: la facoltà "non prova automaticamente" alcun ruolo reale (`imprese.md` §7) |
| **Persona che gestisce il profilo pubblico** ("Gestore della scheda digitale", `imprese.md` §7) | Chi ha, di fatto, la facoltà di modificare la presentazione | Appartenenze (per il fatto di business); Identità & Accessi (per il meccanismo tecnico) | Persona → Impresa | Segue il Periodo della relazione | Non verificata di per sé (`imprese.md` §7) | Interna | R06 | Coincide concettualmente con l'Autorizzazione sopra: non introduce un ruolo distinto |
| **Autore dei contenuti** (`imprese.md` §7) | Chi materialmente scrive o carica un contenuto, distinto da chi ne ha la responsabilità editoriale finale | Non dichiarato come Aggregate proprio da alcun documento logico: `imprese.md` lo introduce come distinzione di significato, senza attribuirgli un proprio ciclo di vita | Persona → contenuto specifico (Servizio, Prodotto, Media) | Non temporizzato esplicitamente | Non verificata | Non dichiarata | Nessun pattern di Relazione dedicato: resta un attributo descrittivo (C06) del singolo contenuto, non una relazione Persona-Impresa a sé | `imprese.md` §7 lo distingue solo concettualmente da "chi ha la responsabilità editoriale"; non introduce un'Entity o una relazione autonoma per rappresentarlo |
| **Narratore o autore di una StoriaImpresa** | Chi scrive una Storia editoriale sull'Impresa | Contenuti editoriali (§10 di questo documento) | Persona → Contenuto editoriale, con l'Impresa come soggetto raccontato | Di competenza di Contenuti editoriali | Di competenza di Contenuti editoriali | Di competenza di Contenuti editoriali | Non un pattern del dominio Imprese | `imprese.md` §1: "le Storie di impresa... appartengono al dominio Contenuti e Storie... non un'estensione descrittiva dell'entità Impresa" |

**Perché nessun ruolo è duplicato in Imprese.** Nessuno dei ruoli sopra elencati riceve, in questo documento, un proprio attributo persistente lato Impresa (per esempio un elenco separato di "titolari" mantenuto dentro l'Aggregate Impresa): l'unico modo in cui l'Impresa "conosce" le proprie Persone collegate è attraverso il riferimento all'identità stabile dell'Aggregate Appartenenza (§10, dipendenza consentita), mai per incorporazione diretta di un attributo di ruolo. Questo evita l'anti-pattern "duplicazione dei fatti" (`03` §14) rispetto a quanto il futuro `domain-mapping/appartenenze.md` dovrà definire in modo autorevole.

**Perché la vista di sintesi di `imprese.md` §6-§7 non genera un ciclo di vita autonomo in questo documento.** Come già segnalato al §2 (ambiguità 1), il ciclo di vita a sei stati descritto in `imprese.md` §6 (Proposta, Da verificare, Attiva, Conclusa, Contestata, Revocata) è una semplificazione, dal punto di vista di Imprese, del ciclo di vita più articolato che `appartenenze.md` possiede come fonte autorevole. Questo mapping non traduce quindi il ciclo di vita di `imprese.md` §6 in propri assi di stato (S01-S08): rinvia integralmente questa traduzione al futuro `domain-mapping/appartenenze.md` (§10, §24 di questo documento), limitandosi a registrare che, dal punto di vista di Imprese, l'esistenza di una relazione con stato "Attiva" e visibilità pubblica è la condizione che rende una SedeImpresa, un'AppartenenzaImpresa e, indirettamente, l'intera scheda, presentabili come aventi "un referente responsabile individuabile" (`imprese.md` §9, §10 regola 11).

---

## 10. Relazioni con altri domini

Applicando `03` §10 (dipendenze consentite/sconsigliate/vietate) e §12 ("dichiarare eventuali dipendenze... mai un generico elenco") a ciascuno dei domini indicati dalla struttura richiesta.

| Dominio | Natura della relazione | Direzione | Proprietà del dato | Cosa Imprese può solo referenziare | Cosa Imprese non deve duplicare | Pattern | Classificazione (`03` §10) |
|---|---|---|---|---|---|---|---|
| **Appartenenze** | Aggregato connettivo Persona↔Impresa (AppartenenzaImpresa/Appartenenza, §9 di questo documento) | Bidirezionale per costruzione, ma posseduta da un terzo Aggregate | Appartenenze | L'identità stabile di ciascuna Appartenenza che coinvolge questa Impresa | Il ciclo di vita, i ruoli, l'Autorizzazione a gestire, la rappresentanza | R07 (relazione di appartenenza), R06 (rappresentanza) quando applicabile | Consentita — riferimento a un Aggregate Root esterno (`03` §10) |
| **Professionisti** | Impresa come contesto organizzativo di un Professionista che opera anche attraverso una struttura (`imprese.md` §1, §14); Impresa come parte di una collaborazione professionale che coinvolge Professionisti esterni | Professionisti → Imprese (riferimento in entrata) | Professionisti (per il profilo, le qualifiche, le verifiche del Professionista) | L'identità stabile dell'Impresa, referenziata da Professionisti | Il profilo professionale, le qualifiche o le verifiche di un Professionista (`imprese.md` §1, confermato da `logical/professionisti.md`) | E03 (Impresa come Entity condivisa) | Consentita, in entrata |
| **Mercati Internazionali** | MercatoImpresa: relazione tra Impresa e Mercato (ambito di presenza, Paesi serviti, natura import/export/interesse) | Imprese → Mercati (riferimento in uscita); Mercati aggrega in entrata | **Mercati Internazionali**, secondo `reconciliation-report.md` §11.2 punto 1 ("la relazione... non è una dipendenza circolare, ma un'unica relazione con un solo proprietario... osservata da due punti di vista") — non Imprese, nonostante `imprese.md` §2 la presenti come propria entità MercatoImpresa | L'identità stabile del Mercato referenziato | Il significato, i confini geografici o i contenuti aggregati del Mercato (`imprese.md` §1) | R02 (relazione contestuale) tra due Aggregate autonomi | Consentita — riferimento a un Aggregate Root esterno; **correzione rispetto alla lettura letterale di `imprese.md` §2**, applicata secondo la riconciliazione (§2 di questo documento) |
| **Opportunità** | Impresa come titolare pubblicante di un'Opportunità | Opportunità → Imprese (riferimento in entrata) | Opportunità | L'identità stabile dell'Impresa | Il contenuto, il ciclo di vita o le regole dell'Opportunità (`imprese.md` §1, §14: "l'opportunità non è un attributo dell'Impresa") | E03 | Consentita, in entrata |
| **Collaborazioni** | Impresa come parte che cerca o offre una collaborazione | Collaborazioni → Imprese (riferimento in entrata) | Collaborazioni | L'identità stabile dell'Impresa | Il ciclo di vita e le regole della Collaborazione (`imprese.md` §14: "non è incorporata nell'entità Impresa") | E03 | Consentita, in entrata |
| **Eventi** | Impresa come organizzatore, sponsor o partecipante | Eventi → Imprese (riferimento in entrata) | Eventi | L'identità stabile dell'Impresa | Iscrizioni, capienze o ruoli di partecipazione (`imprese.md` §1) | E03 | Consentita, in entrata |
| **Contenuti Editoriali** | Impresa come soggetto raccontato da una StoriaImpresa | Contenuti editoriali → Imprese (riferimento in entrata) | Contenuti editoriali | L'identità stabile dell'Impresa | Il contenuto, il processo editoriale o la visibilità della Storia (`imprese.md` §1, §14) | E03 | Consentita, in entrata |
| **Osservatorio** | Consumo di dati derivati da Impresa, SettoreImpresa, MercatoImpresa in forma aggregata | Osservatorio → Imprese (lettura, mai scrittura) | Osservatorio (per l'Indicatore); Imprese (per il dato sorgente) | I dati sorgente necessari al calcolo, mai il diritto di modificarli | La responsabilità di produrre essa stessa report o statistiche (`imprese.md` §1: "senza mai diventarne fonte primaria né proprietario" — da riferirsi qui all'Osservatorio, non a Imprese) | D01→D05/D06 (dato sorgente → derivato/aggregato) | Consentita — lettura analitica (`03` §10) |
| **Identità & Accessi** | Applicazione tecnica del significato di business della facoltà di gestione (§5, S05) | Identità & Accessi applica; Imprese/Appartenenze decidono | Imprese/Appartenenze (per la decisione sostanziale); Identità & Accessi (per l'applicazione tecnica) | La decisione già presa da Imprese/Appartenenze su chi ha la facoltà di gestire | La decisione sostanziale di chi può gestire la scheda (`imprese.md` §1, principio già confermato in `02` §15 e `domain-model.md`) | S05 (Stato di accesso), VIS02 (Accessibilità) | Consentita — applicazione di una decisione di accesso (`03` §10) |

**Assenza di dipendenze circolari non governate.** L'unica relazione che, letta superficialmente, potrebbe apparire circolare è quella con Mercati Internazionali (Imprese→Mercato per la relazione dichiarata, Mercato→Imprese per l'aggregazione "chi opera in questo Mercato"): la riconciliazione logica ha già chiarito che si tratta di un'unica relazione con un solo proprietario (Mercati Internazionali) osservata da due punti di vista, non di una dipendenza circolare di proprietà (`reconciliation-report.md` §11.2 punto 1, richiamato sopra). Nessun'altra relazione di questa tabella presenta lo stesso rischio: tutte le altre dipendenze in entrata (Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti editoriali) sono unidirezionali (l'altro dominio referenzia Imprese, non il contrario), e la dipendenza verso Appartenenze non è circolare perché l'Aggregate Appartenenza, non Imprese, ne è il proprietario esclusivo.

**Dipendenze vietate, verificate come assenti.** Applicando `03` §10 ("dipendenze vietate... duplicazione di un fatto non posseduto, modifica diretta o indiretta di un fatto altrui, acquisizione di proprietà sostanziale da parte di un dominio tecnico o trasversale, dipendenze circolari di proprietà"): questo documento non attribuisce a Imprese la proprietà di alcun fatto posseduto da un altro dominio (il caso MercatoImpresa è stato corretto sopra, non lasciato come nella lettura letterale di `imprese.md` §2); non attribuisce a un dominio tecnico (Identità & Accessi) la decisione sostanziale di visibilità o gestione (§5, §15 di questo documento); non introduce alcuna modifica diretta di un fatto altrui.

---

## 11. Assi di stato

Per ciascuna Entity persistente, questo documento percorre gli otto assi catalogati (`02` §7, S01-S08), dichiarando per ciascuno se si applica e perché, secondo la convenzione che vieta l'omissione silenziosa (`03` §6, RC15).

### 11.1 Impresa

**Premessa: dalla sequenza narrata alla scomposizione in assi indipendenti.** `imprese.md` §5 descrive esplicitamente **tre concetti distinti** (stato reale dell'attività, stato editoriale della scheda, stato di verifica), ma presenta il secondo come un'unica sequenza di sei valori (Bozza, Incompleta, In revisione, Pubblica, Sospesa, Archiviata). Applicando il pattern obbligatorio degli assi indipendenti (`02` §7, `03` §6) esattamente come già fatto per Persona in `domain-mapping/persone.md` §6.1 (Decisione 5), questo documento scompone quella sequenza nei suoi assi realmente indipendenti, senza introdurre alcun significato che `imprese.md` §5 non abbia già, in sostanza, dichiarato.

| Asse | Applicabile | Valori (da `imprese.md`) | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì | Attiva / Cessata | Il "primo concetto" esplicito di `imprese.md` §5: "se l'impresa, nel mondo reale, è ancora in funzione... un fatto, non un'opinione editoriale" |
| **S02** Stato editoriale | Sì | Bozza / Incompleta / Completa | Risponde a "la scheda contiene le informazioni minime necessarie per essere valutata": `imprese.md` §5 distingue esplicitamente Bozza ("non contiene ancora informazioni sufficienti per essere valutata") da Incompleta ("contiene alcune informazioni ma non raggiunge la qualità minima richiesta"), entrambe condizioni di completezza redazionale, non di pubblicazione né di condizione operativa |
| **S03** Stato di verifica | Sì, multidimensionale | I sette assi di `imprese.md` §8 (§12 di questo documento) | A differenza di Persone (`domain-mapping/persone.md` §7, nessuna Verifica propria), Imprese possiede una propria tassonomia di verifica esplicita (§8 del documento logico); questo asse è trattato in dettaglio al §12 di questo documento, non compresso in un singolo valore |
| **S04** Stato di pubblicazione | Sì | Non pubblicata / Pubblica | Il valore "Pubblica" di `imprese.md` §5, che risponde a "la scheda è stata resa visibile pubblicamente", condizionato dalle sei regole di §9 del documento logico (§15 di questo documento) |
| **S05** Stato di accesso | Non trattato in questo documento | — | Applicazione tecnica di competenza di Identità & Accessi (`01` §14); Imprese si limita alla decisione sostanziale su chi ha la facoltà di gestire (di cui S05 è l'applicazione), decisione che appartiene però ad Appartenenze (§9 di questo documento), non a Imprese in prima persona |
| **S06** Stato di sicurezza | Non applicabile | — | Nessun fatto di sicurezza tecnica è posseduto da Imprese: riguarda, se mai modellato, l'Account (Identità & Accessi) |
| **S07** Stato amministrativo | Sì, come qualificazione aggiuntiva di S02/S04 | In revisione (valutazione editoriale o di moderazione) / Sospesa-volontaria / Sospesa-per moderazione | `imprese.md` §5 distingue "In revisione" ("è stata inviata per una valutazione editoriale o di moderazione") e "Sospesa" ("per scelta di chi la gestisce **o** per moderazione") come condizioni la cui origine (chi ha causato la condizione, con quale titolo) è distinta dalla condizione stessa: la stessa sospensione può avere due origini amministrativamente diverse, esattamente come già distinto per Persona in `domain-mapping/persone.md` §6.1 (S07) |
| **S08** Stato storico | Sì | — | Ogni transizione di S01, S02, S04, S07 deve restare ricostruibile anche dopo che lo stato corrente è cambiato più volte (`imprese.md` §10, regola 10: "la cancellazione logica... non deve distruggere la storia delle relazioni"), coerentemente con `01` §8 e con la regola di continuità di default (`03` §8) |

**Perché "Archiviata" non è un settimo asse ma S08+VR06.** Il valore "Archiviata" di `imprese.md` §5 ("non è più proposta attivamente, in modo tendenzialmente stabile... un'impresa cessata può restare storicamente visibile in forma archiviata") non risponde a una domanda diversa dalle sette già censite: è l'applicazione del pattern di Archiviazione (**VR06**, `02` §9) all'Aggregate Impresa nel suo complesso, in combinazione con lo Stato storico (S08). Introdurlo come asse a sé costituirebbe una proliferazione degli stati non necessaria (`03` §6, "quando evitare la proliferazione"), perché la domanda a cui risponde ("questa condizione precedente è conservata per valore storico?") è già la domanda di S08/VR06.

### 11.2 SedeImpresa, ServizioImpresa, ProdottoImpresa, CanaleImpresa, MediaImpresa

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Non applicabile in modo distinto | — | Nessuna di queste Entity ha una condizione operativa di fatto distinta dalla propria esistenza/rimozione: `imprese.md` §2 non attribuisce loro un "stato reale" separato da quello dell'Impresa |
| **S02** Stato editoriale | Non applicabile come asse distinto | — | Per ServizioImpresa/ProdottoImpresa la narrazione "bozza" coincide con S04 (sotto), non con un S02 separato. Per Sede/Canale/Media non è modellato |
| **S03** Stato di verifica | Non applicabile | — | Nessuno di questi cinque concetti compare tra gli aspetti verificati di `imprese.md` §8: la verifica non riguarda "la sede" o "il canale" in quanto tali, ma i dati aziendali nel loro insieme o le certificazioni (§12 di questo documento) |
| **S04** Stato di pubblicazione | Sì, per tutte le cinque, con **due vocabolari** | **SedeImpresa / CanaleImpresa / MediaImpresa:** Non pubblico / Pubblico (`non_public` \| `public`, colonna `visibility_status`). **ServizioImpresa / ProdottoImpresa:** Bozza / Pubblicato (`draft` \| `published`, colonna `publication_status`) — §8A | Entrambi i vocabolari rispondono alla stessa domanda S04 ("è reso pubblicabile?") con terminologia fedele a `imprese.md` §9. Un solo asse per ciascuna Entity; mai `visibility_status` e `publication_status` insieme sulla stessa Entity. Ceiling rispetto all'Impresa: esposizione §15.1 / M7.1 |
| **S05-S07** | Non applicabili | — | Nessun fatto di accesso tecnico, sicurezza o intervento amministrativo distinto è modellato per queste cinque entità in `imprese.md` |
| **S08** Stato storico | Sì (per default, §14) | Per ServizioImpresa: `active` \| `removed` (`service_status`, §8A); per ProdottoImpresa: `active` \| `removed` (`product_status`, §8B); analogo per le altre Entity owned della composizione | In assenza di un'indicazione contraria in `imprese.md`, la rimozione resta un fatto storicamente ricostruibile (regola di continuità di default, `03` §8). Distinto da Bozza/Non pubblico |

**Correzione: il "Stato di pubblicazione proprio" di ServizioImpresa/ProdottoImpresa resta S04, non S02.** Una prima lettura potrebbe assimilare "un servizio può restare in bozza" a uno stato editoriale (S02) distinto dalla pubblicazione (S04), per analogia con Impresa (§11.1). Verificato però che `imprese.md` §2 non distingue, per queste due entità, una fase di completezza redazionale separata da una decisione di pubblicazione — usa un'unica espressione ("stato di pubblicazione proprio") — questo mapping tratta il caso come un solo asse S04 con valori Bozza/Pubblicato (`draft`/`published`). **Correzione della tensione tabellare:** non si applica a Servizio/Prodotto il vocabolario Non pubblico/Pubblico di Sede/Canale/Media; i due vocabolari sono varianti locali dello stesso asse S04, non due assi (`03` §6).

### 11.3 SettoreImpresa e LinguaOperativaImpresa

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì | Dichiarata / Rimossa (terminale) | L'unico asse effettivamente modellato da `imprese.md` §2, §4 per queste due entità, per analogia diretta con CompetenzaDichiarata/LinguaParlata (`domain-mapping/persone.md` §6.2) |
| **S02-S07** | Non applicabili | — | Nessun processo di completamento redazionale, verifica, pubblicazione distinta, accesso, sicurezza o intervento amministrativo è modellato per queste due entità: la loro visibilità segue integralmente quella dell'Impresa (§15 di questo documento) |
| **S08** Stato storico | Sì (per default, §14) | — | Come già per CompetenzaDichiarata/LinguaParlata in Persone: il fatto che un'Impresa abbia dichiarato un determinato settore o una determinata lingua operativa, e per quanto tempo, resta storicamente rilevante anche dopo la rimozione |

### 11.4 CertificazioneImpresa

Trattata separatamente al §13 di questo documento. Anticipazione degli assi per M5.1 (§13.1):
- **S01** non applicabile in modo distinto dallo stato corrente della certificazione;
- **S03 / esiti temporali**: un unico stato corrente a cinque valori Autodichiarata / In verifica / Verificata / Scaduta / Revocata (`imprese.md` §2; Scaduta = T04, Revocata = Annullamento, tenuti distinti — D10);
- **S04 locale**: **non** una colonna `visibility_status` / `publication_status` distinta — `imprese.md` §9: lo stato della certificazione determina *come* viene presentata, non un asse di bozza/pubblicazione separato; il cancello Impresa resta M7.1;
- **S08 come rimozione composizionale separata**: **non** introdotta — Scaduta/Revocata sono gli stati storici di non-validità; la riga resta conservata.

### 11.5 Segnale di allarme verificato e non confermato

Applicando la convenzione di `03` §6 ("quando evitare la proliferazione degli stati"), questo documento ha verificato che nessuna Entity di questo dominio richiede più assi indipendenti simultaneamente di quanti già catalogati: Impresa applica quattro assi (S01, S02, S04, S07) più S08 e S03 multidimensionale (§12), esattamente sei categorie entro il limite di otto; nessuna scomposizione ulteriore delle Entity in nuove Entity distinte è risultata necessaria.

---

## 12. Verifiche

Applicando il modello multidimensionale (`01` §10, `02` §8) alla tassonomia esplicita di `imprese.md` §8, che — a differenza di Persone (`domain-mapping/persone.md` §7, nessuna Verifica propria) — attribuisce a Imprese una propria e ricca tassonomia di verifica.

| # | Aspetto verificato (V01) | Oggetto | Fonte (V03) | Evidenza (V02), se presente | Risultato possibile (V04) | Dominio proprietario | Scadenza/Revoca | Pattern |
|---|---|---|---|---|---|---|---|---|
| 1 | Esistenza dell'impresa | Impresa | Dichiarazione iniziale, eventuale fonte esterna | Documento (facoltativo, §17) | Non verificata / Autodichiarata / Verificata | Imprese | Non prevista esplicitamente | V01+V03, DOC04 se supportata da documento |
| 2 | Dati aziendali (denominazione, forma organizzativa) | Impresa | Fonte attendibile esterna (non specificata da `imprese.md`) | Documento, se disponibile | Non verificata / Autodichiarata / Verificata | Imprese | Non prevista esplicitamente | V01+V03 |
| 3 | Identità della Persona collegata | Persona (referenziata) | Identità & Accessi | — | Verificata / Non verificata | **Identità & Accessi/Persone** — non Imprese; `imprese.md` §8 lo qualifica esplicitamente come "un asse che appartiene concettualmente anche al dominio Persone/Identità e Accessi, qui richiamato per il suo effetto" | — | V01, riferimento a un dominio esterno |
| 4 | Relazione con l'impresa (ruolo dichiarato) | AppartenenzaImpresa | Le due parti della relazione, o un terzo | — | Verificata / Non verificata | **Appartenenze** — non Imprese (§9 di questo documento) | Segue il Periodo della relazione | V01, di competenza del futuro `domain-mapping/appartenenze.md` |
| 5 | Rappresentanza (facoltà di gestione ≠ rappresentanza legale reale) | AppartenenzaImpresa | — | — | Non verificata di default | **Appartenenze** | — | V01, `imprese.md` §7 principio cardine: "la facoltà... non prova automaticamente la rappresentanza legale reale" |
| 6 | Singola CertificazioneImpresa | CertificazioneImpresa | Ente emittente dichiarato | Documento (§13, §17) | Autodichiarata / Verificata / In verifica | Imprese | Sì — Scaduta / Revocata (§13, §14) | V01+V02+V04, trattato in dettaglio al §13 |
| 7 | Profilo sospetto o contestato | Impresa (trasversale) | Segnalazione interna o esterna | — | Segnalato / Non segnalato | Imprese (come stato trasversale) | — | V01, "può sovrapporsi a qualunque altro asse" (`imprese.md` §8) |

**Perché gli aspetti 3, 4 e 5 non sono posseduti da Imprese, nonostante `imprese.md` §8 li elenchi.** Applicando rigorosamente `03` §5 ("Ogni relazione mantiene un dominio proprietario") e la stessa distinzione già applicata al §9 di questo documento: `imprese.md` §8 elenca questi tre aspetti perché **influenzano** l'affidabilità complessiva percepita di una scheda Impresa, ma il documento logico stesso qualifica il primo come appartenente "anche al dominio Persone/Identità e Accessi" e il secondo e il terzo come proprietà dell'AppartenenzaImpresa, cioè dell'Aggregate Appartenenza. Questo mapping non duplica quindi queste tre Verifiche come proprie di Imprese: le cita come dipendenze in entrata (l'esito di una Verifica di un altro dominio concorre all'Affidabilità osservabile della scheda, **V05**, che resta sempre derivata e mai un dato sorgente a sé, `02` §8).

**Perché nessun badge unico "Impresa verificata" viene introdotto.** Applicando `02` §8 ("questo catalogo non prevede... un pattern di 'Entità verificata' generico") e la regola di stile obbligatoria di `03` §7: ogni riferimento a una verifica in questo documento nomina sempre l'aspetto specifico (esistenza, dati aziendali, certificazione, ecc.), mai l'Impresa nel suo complesso. Il "Profilo sospetto o contestato" (riga 7) non è un'eccezione: è esso stesso un aspetto nominato — la presenza di una segnalazione — non un giudizio complessivo di inattendibilità.

**Nessuna verifica introdotta senza corrispondenza nel documento logico.** Applicando `03` §7 ("come aggiungere nuove verifiche... solo se il proprio aspetto verificato è già presente nella tassonomia consolidata"): tutti e sette gli aspetti sopra corrispondono a voci già censite in `reconciliation-report.md` §9.1 (esistenza, identità, documentale, relazione, rappresentanza, fonte/qualità del dato) applicate al contesto specifico di Imprese; nessun nuovo tipo di verifica, non già presente nella tassonomia consolidata, è stato introdotto da questo documento.

### 12.1 Rappresentazione fisica futura — M6.1 (`business_verifications`)

**Perimetro.** Persistenza del **current-state** delle verifiche **owned da Imprese a livello di scheda Impresa** (S03 multidimensionale, §11.1 / §12). Pattern: Entity dipendente (**E02**) dell'Aggregate Impresa, analogo concettuale a `opportunity_verifications` (Opportunità), adattato alla tassonomia di `imprese.md` §8.

**Aspetti persistiti in M6.1 (C05 chiuso `aspect`).** Solo le righe 1, 2 e 7 della tabella §12:

| Literal `aspect` | Aspetto §12 | Significato |
|---|---|---|
| `existence` | #1 Esistenza dell'impresa | La piattaforma ha o non ha confermato che il soggetto economico esiste |
| `company_data` | #2 Dati aziendali | Denominazione / forma organizzativa (e analoghi dati aziendali) confermati rispetto a una fonte attendibile |
| `contested_profile` | #7 Profilo sospetto o contestato | Segnale trasversale di attenzione sulla scheda; può sovrapporsi ad altri assi |

**Aspetti esplicitamente esclusi da `business_verifications`.**

| Aspetto §12 | Destino | Motivo |
|---|---|---|
| #3 Identità Persona | Fuori M6; Identità & Accessi / Persone | Non owned da Imprese |
| #4 Relazione con l'impresa | Fuori M6; Appartenenze | Non owned da Imprese |
| #5 Rappresentanza | Fuori M6; Appartenenze | Non owned da Imprese |
| #6 Singola CertificazioneImpresa | **M5.1** `business_certifications.certification_status` | Stato della certificazione già sull'Entity; non si duplica come riga Impresa-level né come FK a certificazioni |
| Badge “Impresa verificata” | Vietato | `02` §8; `imprese.md` §8; invariante Plan |
| Affidabilità osservabile (V05) | Non persistita | Derivata / presentazione; mai dato sorgente |
| History / audit / transition log | Fuori M6.1 | Current-state only; ogni nuovo V04 aggiorna la riga corrente |

**Dipendenza dura.** Solo `public.businesses` (M1.1). **M5.1 non è dipendenza di schema** di M6.1: la coerenza certificazione↔verifica è semantica (stato su M5.1), non strutturale. Nessuna FK verso `business_certifications`, Persone, Appartenenze, Storage, Evidence.

| Aspetto | Nome fisico | Tipo | Nullability | Default | Vincolo | Significato |
|---|---|---|---|---|---|---|
| Identità locale | `id` | uuid PK | NOT NULL | `gen_random_uuid()` | — | Identità locale E02; non pubblica autonoma |
| Ownership | `business_id` | uuid | NOT NULL | Assente | FK → `businesses(id)` ON DELETE CASCADE | Impresa proprietaria |
| Aspetto | `aspect` | text | NOT NULL | Assente | CHECK chiuso sotto | Piano verificato (tre literal) |
| Esito corrente | `status` | text | NOT NULL | Assente | CHECK chiuso + CHECK aspect↔status sotto | Risultato V04 corrente |
| Conclusione | `verified_at` | timestamptz | Nullable | Assente | NULL se non conclusivo; NOT NULL se `verified` o `flagged` | Momento della conclusione corrente |
| Nota sintetica | `source_note` | text | Nullable | Assente | Se valorizzato: anti-vuoto (`btrim`) | Nota locale; non Entity Fonte; non Evidence; non audit |
| Timestamp | `created_at` / `updated_at` | timestamptz | NOT NULL | `now()` | Trigger `updated_at` dedicato | Pattern Entity owned |

**Vocabolario `aspect`:** `existence` \| `company_data` \| `contested_profile`.

**Vocabolario `status` e compatibilità con `aspect`.**

| `aspect` | `status` ammessi | Mapping logico |
|---|---|---|
| `existence`, `company_data` | `unverified` \| `self_declared` \| `verified` | Non verificata / Autodichiarata / Verificata (`imprese.md` §8; §12 #1–#2) |
| `contested_profile` | `not_flagged` \| `flagged` | Non segnalato / Segnalato (§12 #7) |

**CHECK compositi prescritti.**

1. `aspect` ∈ vocabolario chiuso sopra.
2. `status` ∈ unione dei cinque literal; **e** compatibilità aspect↔status come tabella.
3. `(status IN ('unverified','self_declared','not_flagged') AND verified_at IS NULL) OR (status IN ('verified','flagged') AND verified_at IS NOT NULL)`.
4. `source_note IS NULL OR length(btrim(source_note)) > 0`.

**Non introdurre.** `expires_at` (scadenza non prevista esplicitamente per #1/#2/#7 in §12); `failed` / `pending` / `expired` (vocabolario Opportunità, non Imprese); `in_verification` a livello Impresa (appartiene a CertificazioneImpresa M5.1); colonna badge; FK certificazione; JSON; history table; seed.

**Cardinalità e unicità.** 0..N righe per Impresa, al più **una riga corrente per `(business_id, aspect)`** → `UNIQUE (business_id, aspect)`. Assenza di riga per `existence`/`company_data` = Non verificata implicita; assenza di riga per `contested_profile` = Non segnalato implicito. Righe esplicite con `unverified` / `not_flagged` ammesse.

**Indici.** (1) non UNIQUE su `business_id`; (2) UNIQUE `(business_id, aspect)`. Nessun altro indice obbligatorio.

**Updated_at.** Funzione dedicata `public.set_business_verifications_updated_at()` — `SECURITY INVOKER`, `search_path = ''`; trigger `BEFORE UPDATE FOR EACH ROW`.

**RLS e privilegi.** `ENABLE ROW LEVEL SECURITY`; nessuna policy in M6.1; `REVOKE ALL` da `anon`, `authenticated`; nessun `GRANT`.

**Tabella.** `public.business_verifications`. Soft-delete Impresa (`deleted_at`) non rimuove le righe; hard-delete Impresa CASCADE.

**Cosa M6.1 non è.** Non è M7.1 (pubblicazione/visibilità/gate); non è moderazione come dominio; non è Appartenenze; non è Identità & Accessi; non è duplicato di `certification_status`; non è un indicatore Osservatorio.

**Composizione del blocco M6.** Solo **M6.1**. Nessuna M6.2 / M6.3.

---

## 13. Certificazioni, attestazioni e riconoscimenti

**Perimetro logico.** `imprese.md` §2 (CertificazioneImpresa) tratta in un'unica Entity certificazioni, qualificazioni, iscrizioni e attestazioni dichiarate o riconosciute all'impresa, con cinque stati previsti (Autodichiarata, Verificata, Scaduta, Revocata, In verifica). Nessun'altra distinzione (autorizzazioni, accreditamenti, premi, riconoscimenti, marchi, adesioni, qualificazioni come Entity separate) compare nel documento logico: questo mapping non introduce quindi cinque o sei concetti dove il documento logico ne definisce uno solo, applicando esplicitamente il divieto di "raggruppare concetti semanticamente diversi sotto un'unica categoria generica" nel senso opposto — qui il rischio sarebbe disperdere in più concetti quello che il documento logico tratta deliberatamente come un unico concetto omogeneo.

| Domanda della struttura richiesta | Risposta secondo `imprese.md` |
|---|---|
| Appartiene realmente al dominio Imprese? | Sì — CertificazioneImpresa è un'Entity dipendente dell'Aggregate Impresa (`imprese.md` §2, R9: "Appartiene a esattamente un'Impresa") |
| Appartiene ad Appartenenze? | No — non riguarda la relazione Persona-Impresa, riguarda l'Impresa in quanto tale |
| È una relazione con un ente? | In parte: l'"ente emittente dichiarato" è un dato descrittivo (VO01, §4 di questo documento) della singola CertificazioneImpresa, non una relazione con un Aggregate autonomo di tipo "Ente" — nessun documento logico definisce un dominio "Enti" o "Organizzazioni istituzionali" (`reconciliation-report.md` §13, dominio candidato non ancora esistente) |
| È una verifica? | In parte: lo stato Verificata/In verifica applica il pattern Verifica (V01, §12 di questo documento); ma l'Entity CertificazioneImpresa esiste indipendentemente dall'esito della verifica (anche Autodichiarata è un valore legittimo) |
| È un documento? | In parte: può essere supportata da un Documento (DOC01/DOC04, §17 di questo documento), ma l'Entity stessa non coincide con il documento che eventualmente la supporta |
| Possiede validità temporale? | Sì — il valore "Scaduta" implica un pattern di Scadenza (T04, §14 di questo documento) |
| Necessita di storicizzazione? | Sì, per default (§14 di questo documento): una certificazione scaduta o revocata resta un fatto storico, mai presentata come valida (`imprese.md` §10, regola 7) ma non distrutta |
| Può essere pubblicata? | Sì, subordinatamente alla pubblicazione dell'Impresa (`imprese.md` §9, tabella) |
| Quale pattern si applica? | E02 (Entity dipendente) + R01 (Relazione strutturale con l'Impresa) + V01/V03/V04 (Verifica) + T04 (Scadenza) + S08/D08 (storicizzazione) |

**Perché CertificazioneImpresa non applica DOC01 direttamente.** L'Entity stessa non è il Documento: è il fatto dichiarato (o riconosciuto) a cui un Documento può fornire supporto (DOC05, Supporto documentale, o DOC04, Riferimento, §17 di questo documento). Applicare DOC01 direttamente a CertificazioneImpresa confonderebbe il fatto certificato con il documento che eventualmente lo prova, un errore che `02` §13 (Pattern Documento) esclude esplicitamente ("distinguere il documento dal fatto che prova").

**Perché "Scaduta" e "Revocata" restano due valori distinti, non un unico "non più valida".** Applicando la distinzione già stabilita in `02` §14 tra Scadenza (T04, "per decorso del tempo previsto") e Annullamento ("una cessazione anticipata e dichiarata", `01` §8): "Scaduta" è il decorso naturale di una validità temporale (T01/T04), mentre "Revocata" è un atto deliberato di invalidazione, concettualmente più vicino a un Annullamento che a una Scadenza. Comprimere i due valori in un'unica etichetta "non più valida" perderebbe la distinzione tra "il tempo è passato" e "qualcuno ha deciso di invalidarla", violando l'anti-pattern "fusione impropria di stati" (`03` §14).

### 13.1 Rappresentazione fisica futura — M5.1 (`business_certifications`)

| Aspetto | Nome fisico | Tipo | Nullability | Default | Vincolo | Significato |
|---|---|---|---|---|---|---|
| Identità locale | `id` | uuid PK | NOT NULL | `gen_random_uuid()` | — | Identità locale E02 |
| Ownership | `business_id` | uuid | NOT NULL | Assente | FK → `businesses(id)` ON DELETE CASCADE | Impresa proprietaria |
| Nome/tipo | `name` | text | NOT NULL | Assente | Anti-vuoto (`btrim`) | Nome o tipo dichiarato (`imprese.md` §10 regola 17) |
| Ente emittente | `issuer` | text | Nullable | Assente | Nessun CHECK chiuso | Dichiarazione testuale; non FK Ente |
| Stato corrente | `certification_status` | text | NOT NULL | `self_declared` | CHECK chiuso sotto | Stato unico corrente (cinque literal) |
| Data di scadenza | `expires_at` | date | Nullable | Assente | Nessun CHECK che obblighi `expired` | T04 opzionale; non sincronizzata automaticamente dallo stato |
| Timestamp | `created_at` / `updated_at` | timestamptz | NOT NULL | `now()` | Trigger `updated_at` dedicato | Pattern Entity owned |

**Vocabolario `certification_status`:** `self_declared` \| `in_verification` \| `verified` \| `expired` \| `revoked`.

**Esclusi da M5.1.** Colonna file/storage/path/MIME; Entity Documento; FK a MediaImpresa; `visibility_status`; `publication_status`; `active`/`removed` separato; badge Impresa verificata; Organizzazioni istituzionali; modello multi-aspetto Impresa (M6.1 `business_verifications`, §12.1 — lo stato della singola certificazione resta in questa Entity e non viene duplicato in M6).

**Tabella.** `public.business_certifications`. Indice su `business_id`. Nessun UNIQUE su `name`. RLS + REVOKE come altre Entity owned. Pattern difensivo identico a M3/M4.

---

## 14. Temporalità e storicizzazione

Applicando i sette pattern di Temporalità (`02` §14, T01-T07) ai concetti persistenti di questo dominio.

| Pattern | Applicabile | A quali entità | Motivazione |
|---|---|---|---|
| **T01** Validità | Sì | CertificazioneImpresa | Il valore "Scaduta" implica che la certificazione, oltre un certo momento, non produce più l'effetto di essere presentabile come valida (`imprese.md` §10, regola 7) |
| **T02** Efficacia | Non trattato esplicitamente | — | `imprese.md` non distingue, per alcuna Entity, il momento della dichiarazione dal momento in cui essa produce effetti: non introdotto in assenza di questa distinzione esplicita |
| **T03** Decorrenza | Sì | Impresa (Anno di avvio, VO01, §4 di questo documento); AppartenenzaImpresa (Periodo, di competenza di Appartenenze, §9) | "Anno di avvio — da quando l'impresa opera" (`imprese.md` §2) è un punto di inizio semplice, senza gestione di Efficacia distinta |
| **T04** Scadenza | Sì | CertificazioneImpresa | Il valore "Scaduta" (§13 di questo documento) |
| **T05** Intervallo | Non applicabile in modo autonomo | — | Nessuna Entity di questo dominio richiede un periodo con Decorrenza e Scadenza esplicite insieme, distinto da una semplice Decorrenza (Impresa) o da una semplice Scadenza (CertificazioneImpresa) |
| **T06** Cronologia | Sì, implicitamente | Tutte le Entity soggette a storicizzazione (§11) | La sequenza ordinata delle transizioni di stato e delle modifiche descrittive |
| **T07** Storia | Sì | Impresa (denominazione, nome pubblico, forma organizzativa, §5 di questo documento); SedeImpresa, ServizioImpresa, ProdottoImpresa, CanaleImpresa, MediaImpresa, SettoreImpresa, LinguaOperativaImpresa (rimozione); CertificazioneImpresa (scadenza/revoca) | Applicazione generalizzata della regola di continuità di default (`03` §8) in assenza di indicazioni contrarie in `imprese.md` |

**Cosa deve essere conservato come fatto storico; cosa può essere sostituito; cosa richiede validità temporale; cosa rappresenta una correzione; cosa rappresenta un nuovo fatto.**

| Evento (da `imprese.md` §11, §14) | Trattamento |
|---|---|
| Modifica della denominazione o del nome pubblico | Conservazione della condizione precedente come fatto storico (T07/S08/D08): "un cambio di denominazione... mantiene la propria identità e la propria storia... invariata" (`imprese.md` §11) — è una nuova redazione del Value Object incorporato Denominazione, non una correzione di un errore (nessuna Rettifica, VR03) |
| Modifica dei settori (aggiunta/rimozione di SettoreImpresa) | Nuovo fatto (una nuova dichiarazione, SettoreDichiarato) o rimozione storicizzata (S01=Rimossa, §11.3), mai una sostituzione che elimini la traccia della dichiarazione precedente |
| Modifica delle sedi | Come sopra, applicato a SedeImpresa |
| Modifica dei contatti | Come sopra, applicato a CanaleImpresa |
| Cambiamento della dimensione | Sostituzione del valore descrittivo (VO01), storicizzata per default (nessuna regola esplicita di `imprese.md` richiede una Cronologia dettagliata di ogni cambio di fascia dimensionale, ma la regola di continuità di default la applica comunque, §14 di questo documento) |
| Modifica della pubblicazione (S04) | Transizione di stato (S01-S08, §11), non una modifica descrittiva: ogni transizione resta ricostruibile (S08) |
| Modifiche alle verifiche | Ogni nuovo Risultato (V04) di una Verifica è un nuovo fatto datato, non una sostituzione del Risultato precedente (`02` §8, V04: "l'esito di una Verifica in un momento determinato") |
| Modifiche alle relazioni con Persone | Di competenza di Appartenenze (§9 di questo documento): questo documento non ne descrive la storicizzazione, che appartiene al futuro `domain-mapping/appartenenze.md` |
| Costituzione, inizio attività, cessazione, sospensione, riattivazione (dell'Impresa) | Transizioni dell'asse S01 (§11.1), ciascuna storicizzata (S08) come evento di dominio (§18 di questo documento) |
| Fusione, cessione, trasformazione societaria | Questione esplicitamente aperta in `imprese.md` §12 ("la scelta implementativa precisa di come rappresentare la continuità... resta una domanda aperta"): questo documento non la anticipa (§24) |

**Correzione di un dato vs. nuovo fatto — criterio applicato.** Coerentemente con `03` §8 (Rettifica, VR03: "deve indicare esplicitamente quale Versione precedente correggeva e quale errore specifico dichiarava"): nessuna delle transizioni sopra elencate è, secondo `imprese.md`, la correzione di un errore precedente — sono tutte evoluzioni legittime di un fatto che cambia nel tempo. Il pattern Rettifica (VR03) non trova quindi applicazione in questo dominio, a differenza di quanto potrebbe accadere in Contenuti editoriali per un contenuto redazionale: questo documento lo dichiara esplicitamente non applicabile, non lo omette.

---

## 15. Visibilità e pubblicazione

Applicando i sei pattern di Visibilità (`02` §15, VIS01-VIS06) alle condizioni elencate da `imprese.md` §9.

| Concetto richiesto dalla struttura | Corrispondenza in `imprese.md` | Pattern | Dominio che decide |
|---|---|---|---|
| Esistenza dell'impresa | L'Impresa esiste dal momento della propria creazione (evento **ImpresaCreata**, §18), indipendentemente da qualunque pubblicazione | VIS01 | Imprese |
| Presenza nella piattaforma | Coincide con l'esistenza (VIS01): non è un concetto ulteriore secondo `imprese.md` | VIS01 | Imprese |
| Visibilità pubblica | Le sei condizioni cumulative di `imprese.md` §9 (stato editoriale compatibile, stato operativo compatibile, assenza di archiviazione impropria, qualità minima, presenza di un referente responsabile, eventuale moderazione) | VIS04 | Imprese (per la decisione sostanziale, condizioni 1-4); Appartenenze (per la condizione 5, presenza di un referente — dipendenza in entrata, §9 di questo documento); funzione di moderazione trasversale (condizione 6) |
| Pubblicazione | L'atto che soddisfa cumulativamente le sei condizioni, tracciato dall'evento **ImpresaPubblicata** (§18) | VIS04, S04 | Imprese |
| Moderazione | Condizione 6 di `imprese.md` §9: "può bloccare o sospendere la pubblicazione indipendentemente dal soddisfacimento delle condizioni precedenti" | S07 (§11.1) | Funzione di moderazione trasversale, non un dominio di business proprio (`imprese.md` §14: "interverrà... secondo processi che restano di competenza di un dominio trasversale, non descritto in dettaglio qui") |
| Oscuramento | Non un termine distinto in `imprese.md`: coincide con "Sospesa" (S02/S04/S07, §11.1) | VIS04 (negazione) | Imprese/moderazione |
| Ritiro | Non un termine distinto: coincide con "Sospesa" o, se definitivo, con "Archiviata" | VIS04/VR06 | Imprese |
| Archiviazione | "Archiviata" (`imprese.md` §5): "non è più proposta attivamente... in modo tendenzialmente stabile" | VR06, S08, VIS03 (consultabilità ridotta) | Imprese |
| Dati pubblici | Informazioni pubbliche (`imprese.md` §3): Nome pubblico, descrizione sintetica, presentazione estesa, Sedi/Servizi/Prodotti/Canali/Media pubblicati | D07, VIS04 | Imprese, per ciascun dato secondo la propria titolarità |
| Dati riservati | Informazioni riservate (`imprese.md` §3): dettagli operativi non ancora pronti, note interne su un'AppartenenzaImpresa | VIS06 | Imprese (per i propri dati); Appartenenze (per le note sulla relazione) |
| Dati accessibili solo in contesti specifici | Non esplicitamente distinti da `imprese.md` oltre a pubblico/riservato: nessun terzo livello di accessibilità condizionata è previsto per questo dominio | Non applicabile | — |

**Quali decisioni appartengono a Imprese; quali a Contenuti Editoriali; quali dipendono da Identità & Accessi.** La decisione se e quando l'Impresa nel suo complesso, e ciascuna delle sue Entity dipendenti, sia pubblicabile appartiene interamente a Imprese (condizioni 1-4 e 6 di `imprese.md` §9, insieme alla dipendenza in entrata dalla condizione 5 di Appartenenze). La decisione se e quando una StoriaImpresa che racconta l'Impresa sia pubblicabile appartiene interamente a Contenuti editoriali, e non è in alcun modo condizionata dallo stato di pubblicazione dell'Impresa che racconta (nessuna regola di `imprese.md` lo impone, ed è coerente con il principio generale che un contenuto non modifica i fatti che descrive, `domain-model.md` §13 decisione 18). L'applicazione tecnica di chi può concretamente vedere un dato (VIS02) dipende sempre da Identità & Accessi, che however non decide mai se un dato *debba* essere pubblico (VIS04): questa distinzione, già stabilita in `02` §15 ("Identità & Accessi applica, non decide, la visibilità sostanziale"), è qui confermata senza eccezioni per il dominio Imprese.

**Quali dati possono essere pubblicati indipendentemente dal resto.** Ogni Entity dipendente (SedeImpresa, ServizioImpresa, ProdottoImpresa, CertificazioneImpresa, CanaleImpresa, MediaImpresa) ha una propria visibilità, "che può essere più restrittiva (mai più permissiva) di quella dell'Impresa" (`imprese.md` §9): un singolo Servizio può restare in bozza mentre il resto della scheda è già pubblico, un documento riservato può coesistere con Media pubblici. Nessun singolo stato globale controlla quindi la visibilità di tutte le Entity insieme: l'Impresa pubblica è la condizione necessaria ("cancello", `imprese.md` §9) ma non sufficiente per la pubblicazione di ciascuna Entity dipendente, che richiede sempre anche la propria decisione di pubblicazione locale (S04 applicato individualmente, §11.2).

**Come evitare un singolo stato globale che controlli tutto.** Applicando esplicitamente il divieto di fusione impropria di stati (`03` §14): questo documento non introduce alcun valore composito che riassuma contemporaneamente stato sostanziale, editoriale, di verifica e di pubblicazione dell'Impresa (per esempio un improprio "stato complessivo della scheda"). Ciascuno dei quattro assi (S01, S02, S03, S04) più S07 e S08 resta distinto e indipendente, coerentemente con §11 di questo documento.

### 15.1 Rappresentazione fisica della coerenza di pubblicazione e visibilità (M7.1)

**Perimetro.** Formalizzazione fisica del ceiling Impresa → Entity owned e delle condizioni cumulative di `imprese.md` §9 / §15 di questo documento, senza introdurre strutture nuove. Pattern: contratto di **presentazione** (VIS04) documentato su colonne già esistenti; nessuna materializzazione di publishability (D05 vietato come stato sorgente).

#### 15.1.1 Responsabilità

M7.1:

- non introduce nuovi stati né nuovi vocabolari;
- non fonde gli assi già presenti su `businesses` e sulle Entity owned;
- non materializza né persiste uno stato sintetico di publishability;
- formalizza il rapporto tra: decisione di pubblicazione dell'Impresa (`publication_status`); stati editoriali, sostanziali, amministrativi e di archivio; stati locali S04/S08 delle Entity owned; presentazione pubblica effettiva (predicato di lettura).

La unit chiude i rinvii a M7.1 già presenti nelle migration M1.2 e M3–M5.

#### 15.1.2 Assi indipendenti dell'Impresa

Restano distinti e non comprimibili in un unico campo:

| Asse / fatto | Colonna o sede | Ruolo rispetto alla pubblicazione |
|---|---|---|
| S02 editoriale | `editorial_status` | Completezza redazionale per la rappresentabilità |
| S01 sostanziale | `substantial_status` | Condizione operativa; cessata ≠ presentata come attiva |
| S04 pubblicazione | `publication_status` | Decisione corrente di pubblicazione della scheda |
| S07 amministrativo | `administrative_status` | Overlay revisione/sospensione (volontaria o moderazione) |
| S08/VR06 archivio | `is_archived` | Fuori dai percorsi di discovery ordinari se `true` |
| S03 verifica | `business_verifications` (M6.1) | Indipendente dalla pubblicazione; non gate M7.1 |
| Certificazioni | `business_certifications` (M5.1) | Presentazione di validità distinta dal cancello scheda |
| Referente | Appartenenze | Condizione 5; non colonna Imprese |
| Moderazione | Dominio/funzione trasversale (+ overlay S07) | Condizione 6; non ownership Imprese |

Nessuna combinazione di questi fatti è salvata come campo sintetico di publishability.

#### 15.1.3 Pubblicazione effettiva dell'Impresa

**Predicato logico di rappresentabilità pubblica** (non SQL eseguibile). L'Impresa è pubblicamente rappresentabile nei percorsi ordinari soltanto quando tutte le condizioni seguenti sono soddisfatte simultaneamente (PF12):

1. `publication_status = public`;
2. stato editoriale compatibile: `editorial_status = complete`;
3. stato sostanziale compatibile: se `substantial_status = ceased`, la scheda non è presentata come attività in corso (consultabilità storica distinta, se ammessa);
4. non archiviazione nei percorsi ordinari: `is_archived = false`;
5. qualità minima: nome pubblico valido (già vincolo di riga su `public_name`); completezza redazionale allineata al punto 2;
6. referente valido: almeno una Persona responsabile tramite Appartenenza (fuori schema Imprese);
7. moderazione compatibile: assenza di blocco di moderazione; overlay locale `administrative_status` diverso da sospensione che ritira la visibilità (`suspended_voluntary`, `suspended_moderation`); `in_review` non autorizza da solo l'esposizione pubblica.

| Condizione | Dato già in Imprese | Dipendenza esterna | FK / schema in M7.1 |
|---|---|---|---|
| 1–5 (pubblicazione, editoriale, sostanziale, archivio, qualità) | Sì (assi M1.2 + nome) | Nessuna | Nessuna |
| 6 referente | No | **Appartenenze** (utilizzo / gate applicativo) | Nessuna |
| 7 moderazione | Solo overlay S07 | Funzione di moderazione trasversale | Nessuna |

M7.1 non introduce FK né dipendenze strutturali verso Appartenenze, Moderazione, Editoriali o Identità & Accessi.

#### 15.1.4 Ceiling Impresa → entità owned

Un'entità owned è **esposta** pubblicamente soltanto se:

1. l'Impresa è effettivamente pubblicabile secondo §15.1.3;
2. lo stato locale dell'entità è permissivo (`visibility_status = public` oppure `publication_status = published`, secondo il vocabolario della Entity);
3. l'entità non è rimossa, quando possiede uno stato S08 di composizione (`active` / `removed`).

Lo stato locale può restringere l'esposizione. Lo stato locale non rende effettiva l'esposizione pubblica quando l'Impresa non è pubblicabile. Il ceiling riguarda l'**esposizione**, non la validità della persistenza dello stato locale.

#### 15.1.5 Persistenza degli stati locali

È ammesso conservare `visibility_status = public` e `publication_status = published` anche quando l'Impresa è `unpublished` o temporaneamente non rappresentabile. Questa scelta:

- conserva l'intenzione editoriale locale;
- evita aggiornamenti distruttivi sulle owned;
- rende reversibile la depubblicazione dell'Impresa;
- elimina la necessità di history o propagazioni automatiche dedicate al ceiling;
- non produce esposizione pubblica finché il ceiling non è soddisfatto.

#### 15.1.6 Comportamento per entità

| Entità | Stato locale | Gate Impresa | Ulteriore gate locale | Stato persistito durante depubblicazione | Esposizione effettiva |
|---|---|---|---|---|---|
| `business_locations` | `visibility_status` | Impresa rappresentabile | — | Invariato (anche `public`) | Impresa ok ∧ `public` |
| `business_channels` | `visibility_status` | Impresa rappresentabile | — | Invariato | Impresa ok ∧ `public` |
| `business_media` | `visibility_status` | Impresa rappresentabile | `media_status = active` | Invariato | Impresa ok ∧ `public` ∧ `active` |
| `business_services` | `publication_status` | Impresa rappresentabile | `service_status = active` | Invariato (anche `published`) | Impresa ok ∧ `published` ∧ `active` |
| `business_products` | `publication_status` | Impresa rappresentabile | `product_status = active` | Invariato | Impresa ok ∧ `published` ∧ `active` |
| `business_certifications` | Nessun S04 locale; `certification_status` governa la **forma** di presentazione | Impresa rappresentabile | Non presentare come valida se `expired` o `revoked` | Riga e stato invariati | Impresa ok; validità secondo `certification_status` |
| Settore (`business_sector_declarations`) | Nessun S04 locale | Impresa rappresentabile | — | Invariato | Segue esclusivamente l'Impresa |
| Lingua (`business_operational_language_declarations`) | Nessun S04 locale | Impresa rappresentabile | — | Invariato | Segue esclusivamente l'Impresa |

Sedi, canali e media usano `visibility_status` (`non_public` \| `public`). Servizi e prodotti usano `publication_status` (`draft` \| `published`). Servizi/prodotti `removed` non sono esposti anche se `published`.

#### 15.1.7 Eventi

| Evento | Stato persistito | Stato effettivo | Azione database | Azione applicativa |
|---|---|---|---|---|
| 1. Owned pubblico con Impresa `unpublished` | Owned locale permissivo ammesso | Owned non esposto | Nessuna riscrittura | Non esporre; eventuale avviso UX |
| 2. Depubblicazione dell'Impresa | Owned restano ai valori locali | Scheda e owned non esposti | Nessuna riscrittura owned | Filtri di presentazione |
| 3. Ripubblicazione dell'Impresa | Assi Impresa aggiornati; owned invariati | Owned già locali permissivi tornano esposti se gli altri gate locali sono ok | Nessuna riscrittura owned | Rivalutare predicato Impresa |
| 4. Archiviazione | `is_archived = true` | Fuori discovery ordinario | Nessuna | Path storico ≠ discovery |
| 5. Cessazione sostanziale | `substantial_status = ceased` | Non presentata come attiva | Nessuna | Presentazione conforme a PC7 |
| 6. Incompletezza editoriale | `editorial_status` ≠ `complete` | Non rappresentabile come pubblica | Nessuna | Gate + filtri |
| 7. Sospensione amministrativa | `administrative_status` di sospensione | Visibilità ritirata | Nessuna | Gate + filtri |
| 8. Perdita del referente | Nessun dato Imprese | Non pubblicamente attiva senza controllo | Nessuna | Gate Appartenenze |
| 9. Moderazione negativa | Overlay S07 e/o fatto esterno | Blocco indipendente dalle altre condizioni | Nessuna in M7.1 | Gate moderazione |
| 10. Certificazione scaduta o revocata | `expired` / `revoked`; riga conservata | Non rappresentata come valida | Nessuna cancellazione | Query/presentazione |

#### 15.1.8 Enforcement

**Database.** Continua a garantire: vocabolari chiusi; integrità referenziale; vincoli di riga già esistenti; stati locali validi. M7.1 **non** introduce nuovi vincoli che garantiscano: publishability cumulativa; ceiling cross-table; presenza del referente; moderazione; presentazione effettiva.

**Applicazione / presentazione.** Garantisce: predicati di lettura pubblica; gate di presentazione; eventuali avvisi o limitazioni UX; corretta rappresentazione di cessazione, archiviazione e certificazioni non valide.

#### 15.1.9 Oggetti SQL M7.1

M7.1 prescrive esclusivamente:

- `COMMENT ON COLUMN`;
- eventuali `COMMENT ON TABLE` strettamente descrittivi e non ridondanti.

Esclusi espressamente: `ALTER TABLE` strutturali; nuove colonne; nuovi CHECK; trigger; funzioni; viste; materialized view; policy RLS; GRANT; tabelle di history; badge; score; campi derivati persistiti.

#### 15.1.10 Commenti obbligatori

La futura migration M7.1 aggiorna almeno i seguenti commenti:

**`public.businesses`:** `editorial_status`; `substantial_status`; `publication_status`; `administrative_status`; `is_archived`.

**Owned:** `business_locations.visibility_status`; `business_channels.visibility_status`; `business_media.visibility_status`; `business_media.media_status`; `business_services.publication_status`; `business_services.service_status`; `business_products.publication_status`; `business_products.product_status`; `business_certifications.certification_status`.

Eventuali `COMMENT ON TABLE` solo se aggiungono informazione non già presente nei commenti di colonna (chiusura del rinvio a M7.1; ceiling = esposizione).

#### 15.1.11 RLS e privilegi

M7.1 non introduce policy RLS definitive; non modifica lo stato RLS esistente; non esegue GRANT. VIS02 resta responsabilità di Identità & Accessi. VIS04 resta contratto di rappresentazione del dominio Imprese (questo §15 / §15.1).

#### 15.1.12 Elementi esclusi

Verifica M6 (riapertura o fusione con pubblicazione); badge; score; Appartenenze come ownership; moderazione come ownership; StoriaImpresa; Contenuti Editoriali; Storage; seed; validazione M8; history/audit di pubblicazione; nuove API fisiche di publishability (view/funzione dedicate).

**Composizione del blocco M7.** Solo **M7.1**. Nessuna M7.2 / M7.3.

---

## 16. Dati sorgente, dichiarati, derivati e aggregati

Applicando la famiglia di pattern Dato (`02` §11, D01-D09) a ciascuna categoria informativa individuata da `imprese.md` §3 e dalle altre sezioni pertinenti.

| Categoria | Esempi nel dominio Imprese | Proprietario | Fonte | Affidabilità | Aggiornabile? | Tracciabilità richiesta | Dominio responsabile | Pattern |
|---|---|---|---|---|---|---|---|---|
| Dati originari (D01) | La prima registrazione dell'esistenza dell'Impresa | Imprese | Chi ha censito l'Impresa (Persona con AppartenenzaImpresa, o processo di importazione non specificato) | Base, prima di ogni verifica | Sì | Sì — evento **ImpresaCreata** (§18) | Imprese | D01 |
| Dati dichiarati dall'Impresa (D02) | Denominazione, Nome pubblico, Descrizione, Presentazione, Forma organizzativa, Dimensione, Anno di avvio, dati delle Entity dipendenti | Imprese | L'Impresa stessa, tramite chi ha la facoltà di gestione (Appartenenze, §9) | Non implica verifica (principio di non-automatismo, §1) | Sì | Sì (S08/T07, §14) | Imprese | D02 |
| Dati dichiarati da una Persona collegata | Il ruolo dichiarato in un'AppartenenzaImpresa; l'Autorizzazione a gestire | Appartenenze | La Persona, o l'Impresa tramite chi la gestisce | Non implica verifica | Sì | Di competenza di Appartenenze | **Appartenenze**, non Imprese | D02, referenziato non posseduto |
| Dati importati da fonti esterne | Non esplicitamente previsti da `imprese.md` (nessun processo di importazione automatica è descritto) | — | — | — | — | — | Non applicabile | Non trattato in questo mapping |
| Dati verificati (D03) | Dati aziendali verificati; CertificazioneImpresa verificata; Identità della Persona verificata (referenziato) | Imprese (per i primi due); Identità & Accessi (per il terzo, referenziato) | Come da §12 | Esito di una Verifica specifica (V04), mai un giudizio complessivo | Sì, con nuovo Risultato datato | Sì | Imprese (per i propri aspetti verificati) | D03, dipende da V01-V04 |
| Dati derivati (D04) | Affidabilità osservabile complessiva di una scheda (§12, V05) | Derivato dall'insieme dei Risultati di più Verifiche | Le Verifiche sorgente (§12) | Mai un dato sorgente | Ricalcolato ad ogni nuovo Risultato | Sì | Imprese, per la propria combinazione di V04 | D04, V05 |
| Dati calcolati (D05) | Non prodotti da Imprese: eventuali Indicatori che coinvolgono Imprese sono prodotti e posseduti dall'Osservatorio (§10) | Osservatorio | Dati sorgente di Imprese (D01/D02) | — | — | Di competenza di Osservatorio | **Osservatorio**, non Imprese | D05, dipendenza in uscita da Imprese verso Osservatorio (lettura) |
| Dati aggregati (D06) | Statistiche per settore, per mercato, aggregazioni di Imprese | Osservatorio | Molte Imprese distinte | — | — | Di competenza di Osservatorio, con l'accortezza di non permettere la reidentificazione di una singola Impresa quando il dominio sorgente non la renderebbe visibile individualmente | **Osservatorio**, non Imprese | D06 |
| Dati pubblicati (D07) | Ogni dato reso visibile secondo §15 | Imprese, per ciascun dato secondo la propria titolarità | — | — | Segue lo stato di pubblicazione (S04) | Sì | Imprese | D07 |
| Dati storici (D08) | Denominazioni precedenti, sedi/settori/lingue/certificazioni/canali/media rimossi, transizioni di stato | Imprese | La condizione precedente, conservata | — | Non aggiornabile per definizione (è storia) | Sì, per costruzione | Imprese | D08, S08, T07 |
| Dati temporanei (D09) | Non individuati in questo dominio | — | — | — | — | — | Non applicabile | Nessuna Entity di Imprese ha un dato la cui scomparsa al termine di un processo limitato non costituisca perdita di storia: anche le relazioni temporanee (AppartenenzaImpresa Proposta, non ancora confermata) restano di competenza di Appartenenze, non di Imprese |

**Perché nessun dato aggregato o osservativo è attribuito a Imprese.** Applicando esplicitamente il divieto richiesto dalla struttura di questo mapping ("Non assegnare al dominio Imprese la proprietà di dati aggregati o osservativi che appartengono all'Osservatorio"): ogni riga della tabella sopra che coinvolge calcolo o aggregazione (D05, D06) dichiara esplicitamente l'Osservatorio come proprietario, mai Imprese. Imprese resta, per questi dati, esclusivamente un dato sorgente (D01/D02) soggetto a lettura, mai a scrittura da parte di Osservatorio (§10 di questo documento).

---

## 17. Documenti e prove

**Perimetro logico.** `imprese.md` non descrive un'Entity "Documento" autonoma: la nozione di supporto documentale compare in due punti distinti, con due significati diversi, che questo mapping mantiene separati per evitare l'anti-pattern "riuso apparente ma incoerente" (`03` §14).

| Concetto richiesto dalla struttura | Corrispondenza in `imprese.md` | Distinzione documento/fatto provato | Dominio proprietario | Pattern |
|---|---|---|---|---|
| Documenti identificativi, certificati, visure, attestazioni, autorizzazioni | Supporto (implicito) di CertificazioneImpresa: `imprese.md` §2 non elenca esplicitamente un "documento di certificazione", ma la natura stessa di "certificazioni... iscrizioni e attestazioni" implica tipicamente un supporto documentale nella pratica corrente, non ancora reso esplicito dal documento logico | Il fatto provato è "l'impresa possiede questa certificazione" (CertificazioneImpresa, Entity, §13); l'eventuale documento a supporto è distinto | Imprese | DOC05 (Supporto documentale) o DOC04 (Riferimento), a seconda che si tratti di un insieme generico di prove o di un riferimento puntuale — scelta non ancora determinata dal documento logico (§24) |
| Prove di sede | Non prevista esplicitamente da `imprese.md` per SedeImpresa | — | — | Non applicabile: nessuna Verifica di "sede" è censita (§12 di questo documento) |
| Prove di rappresentanza | Non prevista esplicitamente da `imprese.md` per l'Autorizzazione a gestire: il documento logico dichiara solo che la facoltà "non prova automaticamente" la rappresentanza legale reale (`imprese.md` §7), senza descrivere come un'eventuale prova di rappresentanza legale reale verrebbe registrata | — | Appartenenze, se mai modellata (§9 di questo documento) | Non applicabile in questo dominio |
| Materiali pubblici, allegati | MediaImpresa (`imprese.md` §2: "logo, copertina, immagini, video, documenti pubblici") | Qui il Documento (un documento pubblico caricato) **coincide** con il fatto: MediaImpresa non prova un fatto diverso da se stesso, è essa stessa il contenuto pubblico | Imprese | DOC01 (Documento), quando l'elemento è di natura documentale (per esempio un documento pubblico) piuttosto che puramente visiva (un'immagine o un logo, che restano più propriamente un Attributo descrittivo multimediale, non trattato come DOC01) |

**Distinzione tra il documento e il fatto che prova, applicata rigorosamente.** Per CertificazioneImpresa, il fatto è "questa Impresa possiede questa certificazione" (l'Entity stessa, con il proprio stato di verifica, §13): un documento a supporto (un certificato scansionato, per esempio) non è la certificazione, ne è solo l'evidenza documentale (DOC03/V02, quando usata per sostenere una Verifica). Per MediaImpresa, invece, non c'è un "fatto diverso" che il documento proverebbe: un documento pubblico caricato dall'Impresa è esso stesso il contenuto che si vuole rendere disponibile, non la prova di un fatto ulteriore. Questa distinzione, richiesta esplicitamente dalla struttura di questo mapping, evita di trattare allo stesso modo due concetti che il documento logico distingue chiaramente per finalità (credibilità verificabile per CertificazioneImpresa; identità visiva e comunicazione per MediaImpresa).

**Nessuna descrizione di archiviazione tecnica dei file.** Coerentemente con `02` §13 ("nessuna delle cinque forme implica alcuna decisione su come un contenuto documentale venga effettivamente conservato, trasferito o reso disponibile"), questo paragrafo non descrive alcun meccanismo di caricamento, conservazione o distribuzione dei materiali di MediaImpresa o delle eventuali evidenze documentali di CertificazioneImpresa: resta interamente rinviato alla futura rappresentazione fisica concreta (§24). In M5.2 si persiste soltanto un **riferimento dichiarativo** (`media_reference`), non un bucket né policy Storage.

### 17.1 Rappresentazione fisica futura — MediaImpresa M5.2 (`business_media`)

**Perimetro.** MediaImpresa (E02) owned dall'Impresa: materiale di presentazione della scheda. Distinto da CertificazioneImpresa (il media non è la prova del fatto certificazione), da StorieImpresa/Contenuti editoriali, da ServizioImpresa/ProdottoImpresa (nessuna FK verso `business_services` / `business_products`).

| Aspetto | Nome fisico | Tipo | Nullability | Default | Vincolo | Significato |
|---|---|---|---|---|---|---|
| Identità locale | `id` | uuid PK | NOT NULL | `gen_random_uuid()` | — | Identità locale E02 |
| Ownership | `business_id` | uuid | NOT NULL | Assente | FK → `businesses(id)` ON DELETE CASCADE | Impresa proprietaria |
| Natura | `media_kind` | text | NOT NULL | Assente | C05 chiuso sotto | Classifica il media |
| Riferimento concreto | `media_reference` | text | NOT NULL | Assente | Anti-vuoto (`btrim`) | URL/etichetta/riferimento dichiarativo; non FK Storage; non byte |
| Logo principale | `is_primary` | boolean | NOT NULL | `false` | Se `true` allora `media_kind = 'logo'`; al più un `true` attivo per Impresa | Ruolo "logo principale" (`imprese.md` §2, §10 regola 18) |
| Visibilità S04 | `visibility_status` | text | NOT NULL | `non_public` | `non_public` \| `public` | Come Sede/Canale; ceiling M7.1 |
| Rimozione S08 | `media_status` | text | NOT NULL | `active` | `active` \| `removed` | Rimozione storicizzata; riattivazione ammessa |
| Timestamp | `created_at` / `updated_at` | timestamptz | NOT NULL | `now()` | Trigger dedicato | Pattern Entity owned |

**Vocabolario C05 `media_kind`:** `logo` \| `cover` \| `image` \| `video` \| `public_document`.

**Unicità logo principale.** Indice UNIQUE parziale: un solo `(business_id)` con `is_primary = true` AND `media_kind = 'logo'` AND `media_status = 'active'`.

**Esclusi da M5.2.** Bucket Supabase; policy Storage; MIME; size; alt text; title/description CMS; ordinamento/priority generici; JSON; FK a servizi/prodotti/sedi; tabella asset centrale; relazione polimorfica; condivisione cross-Impresa dello stesso file come Entity condivisa.

**Tabella.** `public.business_media`. Indice su `business_id`. RLS + REVOKE come altre Entity owned. Soft-delete Impresa non cancella le righe; hard-delete Impresa CASCADE.

---

## 18. Eventi di dominio

Applicando la famiglia di pattern Evento (`02` §10, EV01-EV04) ai quattordici eventi elencati in `imprese.md` §13.

| Evento (`imprese.md` §13) | Significato | Causa | Aggregate coinvolto | Dominio proprietario | Pattern | Domini potenzialmente interessati |
|---|---|---|---|---|---|---|
| **ImpresaCreata** | Un nuovo soggetto economico è stato censito | Registrazione iniziale | Impresa | Imprese | EV01, EV03 (osservabile — Osservatorio, Ricerca) | Osservatorio, Ricerca pubblica |
| **ProfiloImpresaCompletato** | La scheda ha raggiunto la qualità minima per essere valutata per la pubblicazione | Transizione S02 (Bozza/Incompleta → Completa) | Impresa | Imprese | EV01, EV03 | Moderazione |
| **ImpresaInviataInRevisione** | La scheda è stata sottoposta a valutazione editoriale o di moderazione | Transizione S07 | Impresa | Imprese | EV01, EV03 | Moderazione |
| **ImpresaPubblicata** | La scheda è diventata visibile pubblicamente, la prima volta o dopo una sospensione | Transizione S04 (§15) | Impresa | Imprese | EV01, EV03 | Ricerca pubblica, Osservatorio |
| **ImpresaSospesa** | La scheda è stata temporaneamente ritirata dalla visibilità pubblica | Transizione S04/S07 | Impresa | Imprese | EV01, EV03 | Ricerca pubblica |
| **ImpresaArchiviata** | La scheda è stata ritirata dai percorsi di scoperta ordinari | Transizione S08/VR06 | Impresa | Imprese | EV01, EV04 (storico per costruzione) | Ricerca pubblica, Osservatorio |
| **AppartenenzaDichiarata** | Una relazione tra Persona e Impresa è stata dichiarata | Dichiarazione di una delle due parti | AppartenenzaImpresa/Appartenenza | **Appartenenze** — Imprese lo riporta perché elencato in `imprese.md` §13, ma la proprietà resta di Appartenenze (§9 di questo documento) | EV01, EV03 | Identità & Accessi |
| **AppartenenzaVerificata** | Una relazione dichiarata è stata confermata | Esito positivo di una Verifica | AppartenenzaImpresa/Appartenenza | **Appartenenze** | EV01, EV03 | Identità & Accessi |
| **AppartenenzaContestata** | Una relazione dichiarata è stata messa in dubbio | Contestazione di una parte o di un terzo | AppartenenzaImpresa/Appartenenza | **Appartenenze** | EV01, EV03 | Moderazione, Identità & Accessi |
| **SedeAggiunta** | Una nuova sede è stata collegata all'impresa | Dichiarazione | SedeImpresa | Imprese | EV01, EV02 (interno, nessuna conseguenza dichiarata in altri domini da `imprese.md`) | — |
| **SettorePrincipaleModificato** | Il settore economico prevalente è cambiato | Modifica della dichiarazione | SettoreImpresa | Imprese | EV01, EV03 (Osservatorio, Ricerca) | Osservatorio, Ricerca pubblica, Mercati Internazionali |
| **CertificazioneAggiunta** | Una nuova certificazione è stata dichiarata | Dichiarazione | CertificazioneImpresa | Imprese | EV01, EV02 | — |
| **CertificazioneVerificata** | Una certificazione dichiarata è stata confermata | Esito positivo di una Verifica | CertificazioneImpresa | Imprese | EV01, EV03 (Ricerca, per la presentazione come verificata) | Ricerca pubblica |
| **CertificazioneScaduta** | Una certificazione ha superato il proprio periodo di validità | Decorso del tempo (T04) | CertificazioneImpresa | Imprese | EV01, EV04 (storico, T04) | — |

**Perché AppartenenzaDichiarata, AppartenenzaVerificata e AppartenenzaContestata sono riportati ma non posseduti da Imprese.** Applicando la stessa disciplina già seguita ai §9 e §12: questi tre eventi compaiono in `imprese.md` §13 perché il documento logico li considera rilevanti dal punto di vista di Imprese, ma la loro produzione effettiva appartiene all'Aggregate Appartenenza. Questo documento li elenca per completezza rispetto all'inventario del documento logico, dichiarando esplicitamente che la loro proprietà definitiva spetta al futuro `domain-mapping/appartenenze.md`, che dovrà anche stabilirne la forma fisica autorevole.

**Conferma: tutti gli eventi rappresentano fatti già avvenuti.** Applicando `02` §10 ("nessuna delle quattro forme rappresenta un comando, un'intenzione o una richiesta futura"): ognuno dei quattordici eventi è espresso al participio passato (Creata, Completato, Pubblicata, Sospesa, Archiviata, Dichiarata, Verificata, Contestata, Aggiunta, Modificato, Scaduta) o in una forma equivalente che descrive un fatto concluso, coerentemente con la verifica già condotta trasversalmente in `reconciliation-report.md` §10.

**Nessun meccanismo tecnico descritto.** Coerentemente con `02` §10 e con i vincoli di questo documento, nessuna coda, webhook, notifica o meccanismo tecnico di propagazione è descritto: la colonna "Domini potenzialmente interessati" indica solo la rilevanza concettuale (EV03, Evento osservabile), non un meccanismo di comunicazione.

---

## 19. Dipendenze del dominio

Catalogo delle dipendenze del dominio Imprese, costruito per essere utilizzabile come input della futura `domain-dependency-map.md` (§25 della struttura richiesta da questo mapping).

### Dipendenze necessarie

| Dominio | Direzione | Motivo | Dati posseduti da Imprese | Dati posseduti dall'altro dominio | Dati solo referenziati | Rischio di accoppiamento | Convenzione applicata |
|---|---|---|---|---|---|---|---|
| **Appartenenze** | Bidirezionale (Imprese referenzia l'identità stabile di ogni Appartenenza che la coinvolge; Appartenenze referenzia l'identità stabile dell'Impresa) | Senza questa dipendenza, l'Impresa non potrebbe mai avere una Persona collegata: il significato stesso di "chi anima l'impresa" dipende da questo Aggregate esterno (`imprese.md` §1, §9 regola 5) | Nessuno di questa relazione | Ruoli, periodo, stato, visibilità, Autorizzazione a gestire | L'identità stabile dell'Aggregate Appartenenza | Basso — riferimento a un Aggregate Root esterno (`03` §10), non a un'Entity interna | RC12/RC13 (`03` §13): Imprese non ridescrive le regole della relazione |
| **Tassonomia condivisa** | Imprese → Tassonomia (in uscita) | Senza questa dipendenza, SettoreImpresa e LinguaOperativaImpresa non avrebbero un valore da referenziare (`imprese.md` §2, R4/R8) | Nessuno | Le voci di Settore e Lingua | Il valore referenziato (VO03) | Basso — VO03 è per costruzione un riferimento, non una copia | Decisione consolidata `02` §18.6 (nessuna duplicazione di pattern con significato diverso) |
| **Territori** | Imprese → Territori (in uscita) | Senza questa dipendenza, SedeImpresa non potrebbe essere localizzata (`imprese.md` §2, R12) | Nessuno | La definizione del Territorio | Il Territorio referenziato (VO03) | Basso | Come sopra |

### Dipendenze facoltative

| Dominio | Direzione | Motivo | Dati posseduti da Imprese | Dati posseduti dall'altro dominio | Dati solo referenziati | Rischio di accoppiamento | Convenzione applicata |
|---|---|---|---|---|---|---|---|
| **Mercati Internazionali** | Imprese → Mercati (in uscita, per la relazione referenziata; Mercati → Imprese in entrata, per l'aggregazione) | Arricchisce l'Impresa con la propria presenza commerciale internazionale, ma un'Impresa esiste ed è pienamente legittima anche senza alcuna MercatoImpresa (`imprese.md` §11, nessuna cardinalità minima richiesta) | Nessuno | Il significato, i confini e i contenuti aggregati del Mercato | L'identità stabile del Mercato | Basso, dopo la correzione di ownership (§10 di questo documento) | `reconciliation-report.md` §11.2 punto 1 |
| **Professionisti** | Professionisti → Imprese (in entrata) | Arricchisce il significato di un Professionista organizzato, ma non è necessaria all'esistenza dell'Impresa | Nessuno | Profilo, qualifiche, verifiche del Professionista | L'identità stabile dell'Impresa | Basso — dipendenza in entrata, non in uscita | RC31 (`03` §13) |

### Dipendenze vietate

| Dipendenza ipotetica | Perché è vietata |
|---|---|
| Imprese possiede la definizione o i confini geografici di un Mercato | Violerebbe l'ownership esclusiva di Mercati Internazionali già stabilita da `reconciliation-report.md` §11.2 punto 1; è la correzione già applicata al §10 di questo documento rispetto alla lettura letterale di `imprese.md` §2 |
| Imprese possiede il ciclo di vita, i ruoli o l'Autorizzazione a gestire dell'AppartenenzaImpresa | Violerebbe l'ownership esclusiva di Appartenenze (`domain-model.md`, decisione vincolante 4); duplicherebbe un fatto già posseduto da un altro dominio (`01` §2, principio 2) |
| Imprese possiede il contenuto, il ciclo di vita o la visibilità di una StoriaImpresa | Violerebbe l'ownership esclusiva di Contenuti editoriali (`imprese.md` §1, §14) |
| Imprese possiede report o statistiche aggregate che la riguardano | Violerebbe l'ownership esclusiva dell'Osservatorio (`imprese.md` §1: "senza mai diventarne fonte primaria né proprietario") |
| Identità & Accessi decide (non solo applica) chi può gestire una scheda Impresa | Violerebbe il principio che un dominio tecnico applica ma non decide la visibilità o la gestione sostanziale (`01` §14, `02` §15, decisione consolidata 9) |
| Un dominio esterno referenzia direttamente una SedeImpresa, un CanaleImpresa o un MediaImpresa senza passare per l'identità stabile dell'Impresa | Dipendenza sconsigliata secondo `03` §10(a): nessun documento logico dichiara questa necessità; introdurrebbe un accoppiamento su un'Entity dipendente interna, non sull'Aggregate Root |

**Nessuna dipendenza circolare non governata.** Confermato al §10 di questo documento: l'unica relazione che potrebbe apparire circolare (Mercati Internazionali) è già riconosciuta come un'unica relazione con un solo proprietario osservata da due punti di vista, non una dipendenza circolare di proprietà.

---

## 20. Classificazione delle decisioni

Ogni decisione architetturale presa in questo documento, classificata come **Locale** (vale esclusivamente per Imprese), **Riutilizzabile** (applicabile ad altri domini con adattamento) o **Fondazionale** (criterio potenzialmente comune all'intera piattaforma), secondo `03` §11 e §12 (RC34).

| # | Decisione | Classe | Principio (`01`) | Pattern (`02`) | Convenzione (`03`) | Attributo di qualità (`04`) protetto | Motivazione | Domini futuri potenzialmente interessati |
|---|---|---|---|---|---|---|---|---|
| D1 | Impresa è trattata come A01 ed E03 insieme (§3) | Riutilizzabile | §3, Aggregate Root | §3-4, A01+E03 | §3, domanda 1 | Coerenza | Stessa combinazione già confermata per Persona in `domain-mapping/persone.md` §2, §13 (Decisione 1): il secondo caso conferma che non è un'eccezione isolata | Ogni futuro dominio con un Aggregate Root ampiamente referenziato (Professionisti, Appartenenze) |
| D2 | La relazione Imprese↔Mercati Internazionali è corretta rispetto alla lettura letterale di `imprese.md` §2: la proprietà resta di Mercati Internazionali (§2, §10, §19) | Fondazionale | §2, principio 2 (nessuna duplicazione di fatti altrui) | §6, R02 | §5, "Ogni relazione mantiene un dominio proprietario" | Coerenza, Separazione delle responsabilità | Un documento di mapping deve poter correggere una lettura ambigua del proprio dominio logico quando la riconciliazione ha già stabilito la fonte autorevole, senza attendere una revisione del documento logico stesso | Ogni futura relazione simmetrica tra due domini in cui uno dei due documenti logici presenta la relazione come "propria" per abitudine descrittiva |
| D3 | AppartenenzaImpresa (`imprese.md` §2, §6) è trattata come vista di sintesi non normativa; la fonte autorevole del ciclo di vita e dei ruoli è `appartenenze.md` (§2, §9) | Fondazionale | §2, principio 1 (unico proprietario) | §6, R07 | §5, RC12/RC13 | Coerenza, Tracciabilità | Necessaria ogni volta che due documenti logici descrivono lo stesso aggregato connettivo da punti di vista diversi con diversi livelli di granularità | Ogni dominio che referenzia un Aggregate connettivo posseduto da un terzo dominio (Professionisti↔Imprese, Persone↔Eventi) |
| D4 | SettoreImpresa e LinguaOperativaImpresa applicano E02+VO03+C02 (§3, §4, §6) | Riutilizzabile | §4, criteri di persistenza; §5, VO03 | §4, E02; §5, VO03; §12, C02 | §3, domanda 3; §4, "Riuso corretto" | Coerenza, Estendibilità | Stessa combinazione già applicata a CompetenzaDichiarata/LinguaParlata in `domain-mapping/persone.md`: seconda conferma indipendente della sua riusabilità (§21) | Ogni futuro dominio con dichiarazioni multiple verso una Tassonomia condivisa |
| D5 | Forma organizzativa e Dimensione applicano C03 (Elenco controllato), non C02 (Tassonomia) (§6) | Locale | §5, criteri di Classificazione | §12, C03 | §3, criterio di scelta "è semplice classificazione" | Coerenza | `imprese.md` non dichiara per questi due concetti un catalogo con proprio ciclo di gestione: applicare C02 introdurrebbe un catalogo condiviso non richiesto dal logico | Nessuno specificamente, salvo dominio con enumerazioni chiuse simili |
| D6 | SedeImpresa applica E02+R01+VO03+C05, confermato come pattern riutilizzabile per concetti "dipendenti, classificati per tipo, localizzati su catalogo condiviso" (§7, §21) | Riutilizzabile | §4, §6, §7 | §4, E02; §6, R01; §5, VO03; §12, C05 | §3, §5 | Estendibilità, Evolvibilità | La stessa combinazione ricorre già per CanaleImpresa (§8) all'interno dello stesso documento: è quindi verificata come riutilizzabile internamente prima ancora di proiettarla su altri domini | Organizzazioni istituzionali (dominio candidato, `reconciliation-report.md` §13), se e quando modellato |
| D7 | CanaleImpresa unifica tutti i concetti di "contatto" (telefono/email commerciale, sito, social, ecc.) senza Entity "Contatto", conservando natura C05 e ValoreCanale obbligatorio (`channel_value`) (§8) | Locale | §2, principio 3; `imprese.md` §10 regola 14 | §4, E02; §5, VO01 | §3, "criterio di scelta... non presupporre" | Fedeltà al logico (non un attributo di `04`, ma criterio metodologico esplicito di `01`) | Unificare Contatto in CanaleImpresa senza ValoreCanale svuoterebbe il fatto di contatto | Nessuno — decisione locale di Imprese |
| D8 | La sequenza editoriale di Impresa (`imprese.md` §5) è scomposta in assi indipendenti S01, S02, S03 (multidimensionale), S04, S07, S08 (§11.1) | Riutilizzabile | §9, principio degli assi indipendenti | §7, S01/S02/S03/S04/S07/S08 | §6, "quando riutilizzare un asse esistente" | Coerenza, Comprensibilità | Stessa metodologia già applicata a Persona in `domain-mapping/persone.md` §6.1 (Decisione 5): seconda applicazione indipendente, che rafforza la conferma di generalità del pattern | Ogni futuro dominio con un ciclo di vita narrato come sequenza unica ma logicamente multi-asse (Eventi, Opportunità) |
| D9 | ServizioImpresa e ProdottoImpresa applicano un solo asse S04 con vocabolario Bozza/Pubblicato (`draft`/`published`), distinto dal vocabolario Non pubblico/Pubblico di Sede/Canale/Media; non S02+S04 (§11.2, §8A) | Locale | §9, "la natura della domanda, non il nome dei valori" | §7, S04 | §6, "quando riutilizzare un asse esistente" | Coerenza | `imprese.md` §2/§9 usa "stato di pubblicazione" e "bozza" per Servizio/Prodotto; "scelta come pubblicabile" per Sede/Canale/Media | Nessuno — dipende da una scelta di granularità specifica di `imprese.md` |
| D15 | ServizioImpresa persiste nome obbligatorio, descrizione/destinatari/territorio dichiarativi facoltativi; lingue come relazione a LinguaOperativaImpresa rinviata; S08 `active`/`removed`; tabella `business_services` (§8A) | Locale | §2, principio 3; `imprese.md` §10 regola 15 | §4 E02; §5 VO01; §7 S04/S08 | §3, non anticipare cataloghi | Fedeltà al logico, Minimalismo | Risolve forma fisica senza UUID Territori, senza catalogo Destinatari, senza dipendenza M2.2 in M4.1 | ProdottoImpresa (M4.2) per parallelismo controllato, non per polimorfismo |
| D10 | CertificazioneImpresa distingue "Scaduta" (T04) da "Revocata" (Annullamento), non un'unica etichetta "non più valida" (§13, §14) | Riutilizzabile | §8, scadenza vs. annullamento | §14, T04; §9, VR03 (per analogia con l'Annullamento) | §8, "Archiviazione... distinta dalla semplice sostituzione" | Coerenza, Robustezza concettuale | La distinzione tra decorso del tempo e atto deliberato di invalidazione è una domanda ricorrente per ogni concetto con validità temporale e possibilità di revoca | Ogni futuro dominio con concetti a scadenza e revocabili (Professionisti, per le qualifiche) |
| D11 | Nessuna Verifica (V01) è introdotta per aspetti (identità della Persona, relazione con l'impresa, rappresentanza) che `imprese.md` §8 elenca ma che appartengono ad altri domini (§12) | Fondazionale | §10, "la responsabilità di una verifica appartiene sempre al dominio che la possiede" | §8, V01-V05 (assenza di applicazione locale) | §7, "come aggiungere nuove verifiche" | Separazione delle responsabilità | Un documento logico può elencare, per completezza narrativa, aspetti che influenzano l'affidabilità percepita senza per questo attribuirne la proprietà al proprio dominio: il mapping deve distinguere i due piani | Ogni dominio la cui narrazione elenca verifiche "di supporto" possedute da altri domini |
| D12 | Nessun dato aggregato o derivato (D05/D06) è attribuito a Imprese: ogni Indicatore o statistica resta posseduto dall'Osservatorio (§16) | Fondazionale | §13, dati derivati; §14, dipendenze vietate | §11, D05/D06 | §9, "quando produrre dati derivati... quando evitarli" | Separazione delle responsabilità, Accoppiamento | Applicazione diretta del principio "nessun dominio duplica fatti altrui" al caso specifico dei dati calcolati e aggregati | Ogni dominio sorgente di dati per l'Osservatorio (tutti gli 11 domini) |
| D13 | MediaImpresa applica DOC01 (Documento) quando di natura documentale, distinto da CertificazioneImpresa che applica DOC05 (Supporto documentale): il documento non coincide sempre con il fatto che prova (§17) | Riutilizzabile | — (principio implicito di non confusione tra fatto e prova, coerente con `02` §13) | §13, DOC01 vs. DOC03/DOC05 | §12, "confrontabilità tra documenti" | Comprensibilità, Robustezza concettuale | La stessa distinzione (documento-che-è-il-fatto vs. documento-che-prova-il-fatto) ricorrerà in ogni dominio con materiali pubblici e con verifiche documentali insieme | Professionisti (titoli pubblici vs. evidenze di qualifica), Contenuti editoriali |
| D14 | Gli eventi AppartenenzaDichiarata, AppartenenzaVerificata e AppartenenzaContestata, elencati in `imprese.md` §13, sono riportati ma dichiarati non posseduti da Imprese (§18) | Locale (applicazione); Riutilizzabile (il criterio) | §12, eventi di dominio | §10, EV01/EV03 | §12, "indicare le decisioni architetturali applicate" | Tracciabilità | Coerente con D3: un evento elencato da un documento logico per completezza narrativa non implica automaticamente la proprietà del dominio che lo elenca | Ogni dominio che elenca eventi di un aggregato connettivo di cui non è proprietario |

---

## 21. Pattern riutilizzabili individuati

Valutazione esplicita dei pattern del Reference Model che il mapping di Imprese dimostra essere realmente riutilizzabili, secondo le dodici aree indicate dalla struttura richiesta.

| Area | Pattern (`02`) | Applicazione in Imprese | Motivo della riusabilità | Domini futuri interessati | Limiti del riutilizzo | Aspetti che restano specifici del dominio |
|---|---|---|---|---|---|---|
| **Sedi** | E02+R01+VO03+C05 | SedeImpresa: Entity dipendente, relazione strutturale con l'Aggregate, riferimento a Territorio, Tipologia locale (§7) | La stessa combinazione è già confermata due volte nello stesso documento (Sedi, §7; Canali, §8): non è un caso isolato | Organizzazioni istituzionali (`reconciliation-report.md` §13), se modellato | Non copre il caso in cui una sede debba essere referenziata individualmente da un altro dominio (non richiesto oggi, §4) | Le Tipologie specifiche (sede legale, punto vendita, ecc.) restano un vocabolario locale di Imprese |
| **Contatti/Canali digitali** | E02+R01+C05+VO01+VIS04/VIS06 | CanaleImpresa: Entity dipendente, Tipologia locale, ValoreCanale obbligatorio (`channel_value`), visibilità propria (§8) | Stessa struttura di Sedi, applicata a un concetto diverso, con valore concreto testuale al posto del VO03 Territorio | Ogni dominio con punti di contatto multipli e classificabili | Non introduce un concetto "Contatto" distinto da "Canale": tipo e valore restano nella stessa Entity | La natura specifica dei canali (sito, social, email commerciale, ecc.) resta locale |
| **Classificazioni** | E02+VO03+C02 (per Settore/Lingua); C03 (per enumerazioni chiuse come Forma organizzativa) | §6 | Identica alla combinazione già usata in Persone per CompetenzaDichiarata/LinguaParlata: seconda conferma indipendente | Ogni dominio con dichiarazioni multiple verso Tassonomie condivise | La scelta tra C02 e C03 richiede sempre una verifica esplicita dell'esistenza di un ciclo di gestione autonomo (§6) | Il contenuto specifico delle classificazioni (quali settori, quali forme) resta locale a ciascun dominio proprietario del catalogo |
| **Verifiche** | V01/V03/V04, con esclusione esplicita degli aspetti posseduti da altri domini | §12 | Conferma, in un dominio che possiede una propria ricca tassonomia di verifica (a differenza di Persone), che la disciplina di separazione tra aspetti propri e aspetti solo elencati resta applicabile anche quando le Verifiche locali sono numerose | Ogni dominio con una propria tassonomia di verifica articolata (Professionisti, Mercati Internazionali) | Non risolve automaticamente quali aspetti siano "propri": richiede sempre una verifica puntuale contro la matrice di responsabilità (`reconciliation-report.md` §3.2) | La tassonomia specifica dei sette aspetti verificati di Imprese resta locale |
| **Certificazioni** | E02+R01+V01/V03/V04+T04+S08/D08, con distinzione Scaduta/Revocata | §13 | Prima applicazione esplicita, in questo insieme di documenti di mapping, della distinzione Scadenza/Annullamento a un concetto concreto e ricorrente (certificazioni, qualifiche, accreditamenti) | Professionisti (qualifiche professionali), Mercati Internazionali (eventuali autorizzazioni all'export) | Il pattern non copre da solo la scelta se un ente emittente esterno debba diventare un Aggregate referenziato (§24) | Le cinque etichette specifiche di stato (Autodichiarata, Verificata, Scaduta, Revocata, In verifica) restano un vocabolario locale |
| **Visibilità** | VIS01/VIS03/VIS04/VIS06, condizioni cumulative per la pubblicazione | §15 | Confirma che il modello "condizioni cumulative per la pubblicazione, ciascuna Entity dipendente con visibilità propria non più permissiva del contenitore" si applica identicamente a un secondo Aggregate Root oltre a Persona | Ogni Aggregate Root con Entity dipendenti pubblicabili individualmente | Il numero e la natura delle condizioni cumulative (sei per Imprese) resta specifico di ciascun dominio | Le sei condizioni specifiche di `imprese.md` §9 restano locali |
| **Pubblicazione** | S04+VR05+VIS04, distinzione tra pubblicazione dell'Aggregate e pubblicazione delle Entity dipendenti | §11, §15 | Stessa distinzione già osservata (implicitamente) in Persone per StoriaPersonale rispetto a Persona: qui confermata esplicitamente per un intero insieme di cinque Entity dipendenti pubblicabili indipendentemente | Ogni dominio con contenuti dipendenti a pubblicazione granulare | — | — |
| **Relazioni con Persone** | R07 (appartenenza) + R06 (rappresentanza, condizionata) | §9 | Conferma, dal lato opposto rispetto a `domain-mapping/persone.md` §4 (R7), che la stessa relazione va trattata da entrambi i documenti come referenziata, mai ridescritta | Professionisti (relazione con un'eventuale struttura organizzativa) | Il pattern non stabilisce da solo quale dei due Aggregate collegati debba "citare" l'altro per primo: è una scelta editoriale di ciascun documento, non del pattern | I ruoli specifici (fondatore, titolare, socio, ecc.) restano un vocabolario locale di Appartenenze, non di Imprese |
| **Temporalità** | T03 (Decorrenza) per Impresa; T04 (Scadenza) per CertificazioneImpresa; T07 (Storia) generalizzata | §14 | Conferma che non tutti i pattern di Temporalità si applicano sempre insieme: un dominio può usare solo un sottoinsieme (qui, né T02 né T05 in modo autonomo) senza che questo sia un'omissione | Ogni dominio con temporalità semplice (solo punti di inizio/fine, senza Intervalli espliciti) | Il pattern da solo non decide quali delle sette forme si applicano: richiede sempre la verifica puntuale già condotta al §14 | — |
| **Eventi** | EV01/EV02/EV03/EV04, con distinzione esplicita tra eventi posseduti e eventi solo riportati | §18 | Conferma, per la seconda volta in questo insieme di documenti (dopo la distinzione analoga per le relazioni, sopra), che un documento logico può elencare eventi di un aggregato connettivo esterno per completezza narrativa | Ogni dominio la cui narrazione include eventi di un aggregato connettivo di cui non è proprietario | — | Il contenuto specifico dei quattordici eventi resta locale a Imprese (o, per tre di essi, ad Appartenenze) |
| **Dati derivati** | D01/D02 come sorgente; D05/D06 esplicitamente esclusi e attribuiti all'Osservatorio | §16 | Conferma diretta della decisione fondazionale D12 (§20): nessun dominio sorgente introduce mai propri dati calcolati o aggregati | Tutti gli 11 domini come potenziali sorgenti per l'Osservatorio | — | — |

**Lacune segnalate, senza modificare la baseline.** Applicando l'istruzione esplicita di questo mapping ("qualora emerga un concetto non coperto, segnalarlo... senza modificarla"): nessun concetto di questo dominio è risultato scoperto dal catalogo esistente. L'unica area di incertezza riscontrata — se un ente emittente esterno di una CertificazioneImpresa debba in futuro diventare un Aggregate referenziato di un dominio "Organizzazioni istituzionali" — non è una lacuna del Reference Model, ma una questione di inventario dei domini, già segnalata come tale in `reconciliation-report.md` §13 e qui non riproposta come nuova (§24).

---

## 22. Verifica degli attributi di qualità

Applicazione puntuale della checklist di qualità di `04` a questo documento, punto per punto.

| # | Attributo | Esito | Evidenza nel mapping | Rischio | Azione futura |
|---|---|---|---|---|---|
| 1 | Coerenza | Sì | Ogni pattern citato usa lo stesso codice e lo stesso significato del catalogo unico (`02`); l'unica correzione rispetto a una lettura letterale del logico (MercatoImpresa, D2 §20) è motivata esplicitamente con la fonte di riconciliazione, non introdotta silenziosamente | Basso | Nessuna |
| 2 | Separazione delle responsabilità | Sì | Ogni concetto (§3), relazione (§9, §10) e dipendenza (§19) dichiara un solo dominio proprietario; le relazioni possedute da Appartenenze (§9) e da Mercati Internazionali (§10) non sono ridescritte | Basso | Nessuna |
| 3 | Coesione | Sì | Ogni sezione ruota attorno alle nove entità persistenti già individuate (§3); nessun concetto estraneo al dominio (per esempio il dettaglio del ciclo di vita di AppartenenzaImpresa) è stato incorporato | Basso | Nessuna |
| 4 | Accoppiamento | Sì | Tre dipendenze necessarie (Appartenenze, Tassonomia condivisa, Territori) e due facoltative (Mercati Internazionali, Professionisti), tutte per riferimento a Aggregate Root esterni, mai a Entity dipendenti interne (§19) | Basso | Nessuna |
| 5 | Estendibilità | Sì | L'introduzione di un futuro documento di mapping per Tassonomia condivisa, Territori o Organizzazioni istituzionali non richiederà di modificare questo documento, perché ogni riferimento è già espresso per identità stabile tramite VO03 (§4, §6, §7) | Basso — condizionato dalla effettiva stabilità futura di questi riferimenti | Nessuna azione richiesta ora |
| 6 | Evolvibilità | Sì | La scomposizione degli assi di Impresa (§11.1) e la correzione di ownership di MercatoImpresa (§10) assorbono un'evoluzione della comprensione del dominio senza contraddire `imprese.md` | Basso | Nessuna |
| 7 | Manutenibilità | Sì | Ogni scelta è ricondotta a un paragrafo specifico di `imprese.md`, `02`, `03` o `reconciliation-report.md`: un futuro manutentore può individuare rapidamente l'origine di ciascuna decisione | Basso | Nessuna |
| 8 | Tracciabilità | Sì | Ogni Entity, relazione, asse, verifica, evento e dato cita il codice del pattern applicato e il paragrafo del documento logico corrispondente (§3-§19) | Basso | Nessuna |
| 9 | Auditabilità | Sì | Le decisioni di mapping (§20, §23) sono motivate in modo sufficiente a un controllo indipendente, senza richiedere di consultare l'autore di questo documento | Basso | Nessuna |
| 10 | Verificabilità | Sì | Ogni affermazione è verificabile per lettura diretta di `imprese.md`, `02`, `03`, `reconciliation-report.md`; le tabelle di §6-§19 permettono una verifica riga per riga | Basso | Nessuna |
| 11 | Comprensibilità | Sì | Ogni concetto è introdotto prima di essere usato; le tabelle riassumono senza sostituire la motivazione discorsiva; le sezioni "Perché..." rendono esplicito il ragionamento dietro ogni scelta non ovvia | Basso | Nessuna |
| 12 | Internazionalizzazione | Sì | Nessun concetto presume un solo ordinamento giuridico o una sola nazionalità; §5 tratta esplicitamente la neutralità rispetto ai Paesi e rinvia (§24) la questione degli identificativi legali variabili per giurisdizione | Medio — la questione degli identificativi legali internazionali resta aperta (§24) | Da affrontare nel futuro schema fisico o in un eventuale futuro dominio dedicato |
| 13 | Scalabilità concettuale | Sì | L'aggiunta di una futura decima entità dipendente seguirebbe uno degli schemi già confermati riutilizzabili (§21), senza impatto su questo documento | Basso | Nessuna |
| 14 | Robustezza concettuale | Sì | I casi limite di `imprese.md` §11 (impresa individuale senza dipendenti, impresa gestita da persona senza profilo pubblico, impresa contestata, impresa senza sito, fusione societaria) sono stati esaminati e, dove non risolvibili a questo livello, rinviati esplicitamente (§24), non forzati in una soluzione impropria | Medio — diverse domande aperte del livello logico (`imprese.md` §12) restano non risolte, come previsto | Monitorare l'evoluzione del documento logico su questi punti |
| 15 | Esito complessivo | Positivo, con due aree segnalate per approfondimento futuro | Il documento è corretto secondo `01`, `02`, `03` e di buona qualità secondo `04`; le due aree segnalate (identificativi legali internazionali, ownership di un eventuale ente emittente esterno) non sono difetti di questo documento, ma eredità di domande esplicitamente aperte al livello logico (`imprese.md` §12) o di domini candidati non ancora esistenti (`reconciliation-report.md` §13) | Basso — nessuna delle due aree compromette la correttezza delle decisioni già prese | Nessuna azione immediata; entrambe restano rinviate (§24) |

---

## 23. Decisioni di mapping consolidate

Raccolta sintetica e prescrittiva delle decisioni approvate in questo documento, ciascuna con citazione di principio, pattern, convenzione, attributo di qualità e classificazione (rinvio ai dettagli di §20).

1. **Impresa è l'Aggregate Root (A01) del dominio ed è trattata anche come Entity condivisa (E03)**, per l'ampiezza del suo riferimento da parte di sette domini esterni (§3). *Riutilizzabile* — `01` §3; `02` §3-4; `03` §3.
2. **La relazione con Mercati Internazionali (MercatoImpresa) è di proprietà esclusiva di Mercati Internazionali**, non di Imprese, correggendo la lettura letterale di `imprese.md` §2 secondo `reconciliation-report.md` §11.2 (§2, §10, §19). *Fondazionale* — `01` §2; `02` §6 R02; `03` §5.
3. **AppartenenzaImpresa è una vista di sintesi non normativa dell'Aggregate Appartenenza**, la cui fonte autorevole per ruoli, ciclo di vita e Autorizzazione a gestire è il futuro `domain-mapping/appartenenze.md` (§2, §9, §12, §18). *Fondazionale* — `01` §2; `02` §6 R07; `03` §5, RC12-RC13.
4. **SettoreImpresa e LinguaOperativaImpresa sono Entity dipendenti (E02) con riferimento a Tassonomia condivisa (VO03)**, non Value Object incorporati né relazioni dirette (§3, §4, §6). *Riutilizzabile* — `01` §4-5; `02` §4-5, §12; `03` §3-4.
5. **Forma organizzativa e Dimensione sono Elenchi controllati (C03), non Tassonomie condivise (C02)** (§6). *Locale* — `01` §5; `02` §12; `03` §3.
6. **SedeImpresa e CanaleImpresa applicano entrambe E02+R01+C05 con un valore di localizzazione/riferimento** (VO03 Territorio per la sede; VO01 ValoreCanale / `channel_value` per il canale), confermata riutilizzabile internamente e candidabile ad altri domini (§7, §8, §21). *Riutilizzabile* — `01` §4, §7; `02` §4, §6, §12; `03` §3-5.
7. **Nessuna Entity "Contatto" distinta da CanaleImpresa è introdotta**; CanaleImpresa assorbe natura e ValoreCanale del contatto dell'Impresa (§8; `imprese.md` §10 regola 14). *Locale* — `01` §2, principio 3.
8. **La sequenza editoriale di Impresa (`imprese.md` §5) è scomposta negli assi indipendenti S01, S02, S03 (multidimensionale), S04, S07, S08** (§11.1). *Riutilizzabile* — `01` §9; `02` §7; `03` §6.
9. **ServizioImpresa e ProdottoImpresa applicano un solo asse S04** con vocabolario Bozza/Pubblicato (`draft`/`published`), distinto dal Non pubblico/Pubblico di Sede/Canale/Media; senza S02 separato (§11.2, §8A). *Locale* — `02` §7; `03` §6.
9a. **ServizioImpresa (M4.1): `business_services` con nome obbligatorio; descrizione/destinatari/territorio testuali facoltativi; lingue rinviate; S08 `service_status`; nessun UNIQUE sul nome; ≠ ServizioProfessionale (§8A).** *Locale* — `imprese.md` §2, §10 regola 15.
9b. **ProdottoImpresa (M4.2): `business_products` con nome obbligatorio; descrizione facoltativa; S04 `draft`/`published`; S08 `product_status`; nessun destinatario/territorio/lingua/prezzo/categoria strutturata; nessun UNIQUE sul nome; tabella distinta da `business_services` (§8B).** *Locale* — `imprese.md` §2, §10 regola 16.
9c. **CertificazioneImpresa (M5.1): `business_certifications` con nome obbligatorio; issuer facoltativo; stato a cinque literal; `expires_at` opzionale; niente file/visibility; storage rinviato (§13.1).** *Locale* — `imprese.md` §2, §10 regola 17.
9d. **MediaImpresa (M5.2): `business_media` con `media_kind` C05, `media_reference` obbligatorio, `is_primary` per logo, S04 `visibility_status`, S08 `media_status`; niente bucket/FK servizi-prodotti (§17.1).** *Locale* — `imprese.md` §2, §10 regola 18.
9e. **Verifica Impresa owned (M6.1): `business_verifications` current-state per aspetto `existence` \| `company_data` \| `contested_profile`; UNIQUE `(business_id, aspect)`; certificazione resta su M5.1; aspetti Persona/Appartenenza esclusi; nessun badge unico (§12.1).** *Locale* — `imprese.md` §8, §10 regola 19.
10. **CertificazioneImpresa distingue esplicitamente Scadenza (T04) da Revoca (Annullamento)**, applicando E02+R01+V01/V03/V04+T04+S08/D08 (§13, §14). *Riutilizzabile* — `01` §8; `02` §9, §14; `03` §8.
11. **Nessuna Verifica propria è introdotta per aspetti elencati da `imprese.md` §8 ma posseduti da altri domini** (identità della Persona, relazione con l'impresa, rappresentanza) (§12, §12.1). *Fondazionale* — `01` §10; `02` §8; `03` §7.
12. **Nessun dato calcolato o aggregato (D05/D06) è attribuito a Imprese**: ogni Indicatore resta posseduto dall'Osservatorio (§16). *Fondazionale* — `01` §13; `02` §11; `03` §9.
13. **MediaImpresa applica DOC01 quando di natura documentale; CertificazioneImpresa applica DOC05/DOC03 per il proprio supporto documentale**, mantenendo distinto il documento dal fatto che prova (§17). *Riutilizzabile* — `02` §13; `03` §12.
14. **Gli eventi AppartenenzaDichiarata, AppartenenzaVerificata e AppartenenzaContestata sono riportati da `imprese.md` §13 ma non posseduti da Imprese** (§18). *Locale* (applicazione) / *Riutilizzabile* (criterio) — `01` §12; `02` §10; `03` §12.

---

## 24. Questioni aperte e aspetti rinviati

### Questioni logiche da chiarire

Eredità diretta di `imprese.md` §12, non risolte né forzate da questo documento:

1. Le ditte individuali devono avere una presentazione differenziata rispetto alle altre forme organizzative? (`imprese.md` §12) — rilevante per §6 di questo documento (Forma organizzativa).
2. I marchi, quando un'Impresa opera con più marchi, devono diventare un'Entity autonoma o restare una proprietà descrittiva? (`imprese.md` §11-§12) — rilevante per §5 di questo documento (identità pubblica).
3. I ProdottoImpresa devono poter essere raggruppati in categorie proprie? (`imprese.md` §12) — rilevante per §3, §6 di questo documento.
4. I dati fiscali dell'Impresa devono essere memorizzati come informazione propria del dominio, o solo verificati senza essere conservati? (`imprese.md` §12) — rilevante per §5, §12 di questo documento (identità legale, verifiche).
5. Chi può legittimamente rivendicare per la prima volta la gestione di una scheda Impresa già esistente ma non ancora collegata a nessuna Persona? (`imprese.md` §12) — rilevante per §9 di questo documento, ma di competenza definitiva di Appartenenze.
6. Le sedi estere di un'impresa italiana, o le unità operative italiane di un'impresa estera, richiedono regole diverse dalle sedi italiane? (`imprese.md` §12) — rilevante per §5, §7 di questo documento (internazionalizzazione, sedi).
7. Come rappresentare in modo stabile cessazioni, fusioni e trasformazioni societarie, mantenendo la continuità storica? (`imprese.md` §11-§12) — rilevante per §11, §14 di questo documento.

### Questioni metodologiche da monitorare

8. **Ownership di un eventuale ente emittente esterno di una CertificazioneImpresa.** Se un futuro dominio "Organizzazioni istituzionali" (`reconciliation-report.md` §13, dominio candidato) venisse formalizzato, la relazione tra CertificazioneImpresa e l'ente emittente dovrebbe essere rivalutata da una semplice dichiarazione descrittiva (VO01/C06, §4 di questo documento) a un riferimento a un Aggregate esterno (VO03/R02). Non è una lacuna della baseline, ma una dipendenza dall'evoluzione dell'inventario dei domini.
9. **Se la distinzione tra E02 semplice e E02+E03 debba essere applicata anche a qualche Entity dipendente di Imprese.** Nessuna delle nove Entity dipendenti di questo dominio è oggi referenziata individualmente da un altro dominio (§4, §5): questo documento lo dichiara come condizione attuale, non come impossibilità futura, e rinvia una eventuale revisione al momento in cui tale necessità venisse dichiarata da un documento logico.

### Aspetti rinviati alla rappresentazione fisica concreta

Decisioni che richiederanno il futuro schema tecnologico (PostgreSQL/Supabase o altro) e non sono anticipate da questo documento:

10. **Rappresentazione tecnica degli assi indipendenti di Impresa (S01, S02, S04, S07, S08, §11.1).** S01/S02/S04/S07/S08 sono colonne su `businesses` (M1.2). **S03** è determinato come tabella owned `business_verifications` (M6.1, §12.1), non come colonna unica su `businesses`. Eventuale history table resta rinviata.
11. **Meccanismo di garanzia dell'unicità del settore principale per Impresa (`imprese.md` §10, regola 5).** Il vincolo è logico; la sua applicazione fisica resta rinviata.
12. **Meccanismo di garanzia dell'unicità della sede principale per tipologia (`imprese.md` §10, regola 4).** Come sopra.
13. **Tecnica di storicizzazione (S08/T07/D08) per tutte le nove Entity dipendenti.** Se realizzata con tabelle storiche separate, versionamento in linea, log di audit o altra tecnica, è una decisione del futuro schema.
14. **Struttura fisica del catalogo Tassonomia condivisa (voci di Settore, Lingua) e del catalogo Territori, referenziati tramite VO03.** Nessuno dei due è ancora oggetto di un proprio documento di mapping fisico (`domain-model.md` §2): la struttura fisica del riferimento resta sospesa fino a quando questi domini non riceveranno, a loro volta, un proprio mapping.
15. **Archiviazione tecnica (bucket, policy Storage, byte) di CertificazioneImpresa e MediaImpresa (§17).** Rinviata. M5.1 non persiste file; M5.2 persiste solo `media_reference` dichiarativo (§13.1, §17.1), senza creare Storage.
16. **Meccanismo tecnico di propagazione degli eventi di dominio elencati al §18.** Coerentemente con `01` §12, nessuna tecnologia di comunicazione (coda, broker, trigger) è anticipata.
17. **Applicazione tecnica dell'accesso (S05) all'Impresa da parte di Identità & Accessi.** Rinviata al futuro `domain-mapping/identita-accessi.md`.
18. **Rappresentazione tecnica degli identificativi legali dell'Impresa, se e quando introdotti, in modo neutrale rispetto alla giurisdizione (§5).** Nessuna soluzione tecnica è anticipata; resta anche aperta la scelta se tali identificativi debbano essere conservati come dato proprio o solo verificati (questione logica 4, sopra).

### Aspetti rinviati ad altri domini

19. **Struttura fisica completa della relazione Persona-Appartenenza-Impresa, del suo ciclo di vita a nove stati su tre assi, e dell'Autorizzazione a gestire.** Rinviata integralmente al futuro `domain-mapping/appartenenze.md`, che ne è il proprietario esclusivo (§2, §9, §12, §18, §19 di questo documento).
20. **Struttura fisica della relazione MercatoImpresa, inclusi ambito, Paesi serviti e natura import/export/interesse.** Rinviata al futuro `domain-mapping/mercati-internazionali.md`, che ne è il proprietario secondo la riconciliazione logica (§10, §19 di questo documento).
21. **Struttura fisica delle StorieImpresa e del loro processo editoriale.** Rinviata al futuro `domain-mapping/contenuti-editoriali.md` (§1, §9, §10 di questo documento).
22. **Struttura fisica degli Indicatori e delle aggregazioni che coinvolgono Imprese, SettoreImpresa e MercatoImpresa.** Rinviata al futuro `domain-mapping/osservatorio.md` (§10, §16 di questo documento).
23. **Struttura fisica della relazione con Professionisti (contesto organizzativo, collaborazioni professionali).** Rinviata al futuro `domain-mapping/professionisti.md` (§10, §19 di questo documento).
24. **Relazione strutturata ServizioImpresa → LinguaOperativaImpresa** (lingue disponibili per il singolo servizio). Concetto riconosciuto (`imprese.md` §2; §4, §8A di questo documento); **rinviata fuori dal blocco M4** (né M4.1 né M4.2). Non riceve numero M4.x in questo piano.

---

## 25. Controllo finale

### Checklist di controllo

| # | Verifica | Esito |
|---|---|---|
| 1 | Coerenza con `docs/architecture/logical/imprese.md` | Verificato — ogni entità, relazione, stato, regola ed evento trattato è riconducibile a un paragrafo esplicito di `imprese.md`; le uniche letture non testuali (scomposizione degli assi di Impresa §11.1, correzione di ownership di MercatoImpresa §10) sono motivate e classificate come decisioni di mapping (§20, §23), non presentate come testo logico esistente |
| 2 | Coerenza con `docs/domain-model.md` | Verificato — i richiami alla decisione vincolante 4 (Impresa e Appartenenza sempre distinte), alla decisione 15 (assi indipendenti) e alla decisione 16 (nessun badge universale) sono coerenti con `domain-model.md` §4, §6-§7 |
| 3 | Coerenza con `reconciliation-report.md` | Verificato — la correzione di ownership di MercatoImpresa (§2, §10, §19) applica direttamente §11.2 punto 1; i riferimenti alla matrice di responsabilità (§3.2) e alla tassonomia delle verifiche (§9.1) sono coerenti con le sezioni corrispondenti |
| 4 | Conformità a `01-principi-mapping.md` | Verificato — ogni decisione cita il principio applicato (§20, §23); nessun principio è contraddetto |
| 5 | Utilizzo corretto di `02-reference-model.md` | Verificato — ogni concetto trattato cita il codice del pattern applicato (A01, E02, E03, VO01, VO03, C02, C03, C05, C06, R01, R02, R06, R07, S01-S04/S07-S08, V01-V05, VR03, VR06, EV01-EV04, D01-D02/D04-D09, DOC01/DOC03-DOC05, T01/T03-T04/T06-T07, VIS01/VIS03-VIS04/VIS06); nessun pattern non catalogato è stato introdotto (§21 conferma esplicitamente l'assenza di lacune) |
| 6 | Conformità a `03-convenzioni-architetturali.md` | Verificato — la procedura decisionale del §3 di `03` è stata applicata esplicitamente (§3, §4, §6, §20); le regole RC pertinenti sono rispettate (nessuna verifica generica introdotta, RC19; nessuna dipendenza vietata, RC30; ogni asse non applicabile dichiarato esplicitamente, RC15; ogni relazione non posseduta referenziata senza ridescrizione, RC13) |
| 7 | Applicazione di `04-quality-attributes.md` | Verificato — checklist applicata punto per punto al §22, con due aree segnalate esplicitamente (identificativi legali internazionali; ownership futura di un ente emittente esterno), non occultate |
| 8 | Conformità ad `architecture-baseline.md` | Verificato — questo documento applica integralmente la metodologia consolidata nella Design Review (baseline §4-§7), utilizzando `domain-mapping/persone.md` come precedente di confronto esplicito ove pertinente (§3, §5, §6, §11, §20, §21), senza ridefinire principi, pattern, convenzioni o attributi di qualità |
| 9 | Coerenza con il mapping di Persone | Verificato — la relazione Imprese↔Persone è trattata coerentemente da entrambi i lati (§9 di questo documento; `domain-mapping/persone.md` §4, R7): nessuno dei due documenti ridescrive le regole della relazione, entrambi la referenziano come proprietà di Appartenenze |
| 10 | Corretta separazione tra core ed ecosistema | Verificato — §3-§8 trattano esclusivamente il core (identità, classificazioni, sedi, contatti); §9-§10 trattano esplicitamente l'ecosistema (relazioni con Persone e con gli altri dieci domini), con motivazione esplicita di ogni confine (§1, "Regola fondamentale: impresa e relazioni") |
| 11 | Corretta ownership delle relazioni | Verificato — ogni relazione con un altro dominio dichiara esplicitamente il proprietario (§9, §10): Appartenenze per AppartenenzaImpresa, Mercati Internazionali per MercatoImpresa (dopo la correzione D2), Contenuti editoriali per le StorieImpresa, Osservatorio per gli Indicatori |
| 12 | Assenza di dipendenze circolari non governate | Verificato — l'unica relazione apparentemente bidirezionale (Mercati Internazionali) è riconosciuta come un'unica relazione con un solo proprietario osservata da due punti di vista (§10, §19), non una dipendenza circolare di proprietà |
| 13 | Assenza di tecnologia | Verificato — nessuna tecnologia è nominata come scelta di progetto; PostgreSQL e Supabase compaiono solo nella nota introduttiva e nella sezione delle decisioni rinviate (§24), come cosa il documento esplicitamente esclude o rinvia |
| 14 | Assenza di SQL | Verificato — nessuna istruzione SQL, nessun `CREATE TABLE` |
| 15 | Assenza di schema di database | Verificato — non è definita alcuna tabella, colonna, indice, chiave o vincolo tecnico; ogni riferimento a una futura struttura è esplicitamente rinviato al §24 |
| 16 | Assenza di tipi tecnici | Verificato — nessun tipo di dato tecnico è menzionato in alcuna sezione |
| 17 | Assenza di implementazioni | Verificato — ogni sezione descrive concetti, pattern, motivazioni e decisioni, mai passi realizzativi |
| 18 | Assenza di riferimenti incrociati errati | Verificato — ogni citazione a `imprese.md`, `02`, `03`, `04`, `architecture-baseline.md`, `reconciliation-report.md` e `domain-mapping/persone.md` è stata controllata contro il testo effettivo dei documenti durante la seconda revisione |
| 19 | Assenza di sezioni vuote | Verificato — tutte le 25 sezioni contengono contenuto sostanziale; le sotto-sezioni dichiaratamente "non applicabile" (per esempio §16, dati importati da fonti esterne) motivano sempre l'assenza, non la lasciano come vuoto silenzioso |
| 20 | Assenza di placeholder | Verificato — nessun testo segnaposto o generico è presente |
| 21 | Assenza di duplicazioni sostanziali | Verificato — le ripetizioni apparenti (per esempio la citazione della correzione di ownership di MercatoImpresa in §2, §10, §19, §20) sono richiami coerenti allo stesso fatto già stabilito una sola volta, non descrizioni indipendenti che potrebbero divergere |

### Riepilogo

Il presente documento (`docs/architecture/physical/domain-mapping/imprese.md`) applica integralmente la baseline architetturale (`01`-`04`, confermata da `architecture-baseline.md`) al dominio Imprese, in 25 sezioni più il presente riepilogo.

**Concetti persistenti individuati (9):** Impresa (A01+E03), SedeImpresa (E02), SettoreImpresa (E02+VO03), ServizioImpresa (E02), ProdottoImpresa (E02), LinguaOperativaImpresa (E02+VO03), CertificazioneImpresa (E02), CanaleImpresa (E02), MediaImpresa (E02) — §3.

**Concetti incorporati (10):** Denominazione/Nome pubblico/Descrizione/Presentazione, Anno di avvio, Dimensione, attributi di Servizio/Prodotto, Contesto d'uso di LinguaOperativaImpresa, Nome/ente emittente di CertificazioneImpresa, Natura del canale, ValoreCanale (`channel_value`), Tipologia di sede, Ruolo del media — §4, §8.

**Assi di stato applicati:** S01, S02, S03 (multidimensionale), S04, S07, S08 per Impresa; sottoinsiemi per le Entity dipendenti (§11).

**Verifiche (7 aspetti):** esistenza, dati aziendali, identità della Persona (referenziata), relazione con l'impresa (referenziata), rappresentanza (referenziata), certificazione, profilo sospetto/contestato — §12.

**Relazioni con Persone (7 ruoli + 2 attributi di relazione):** fondatore, titolare, socio, amministratore, legale rappresentante, dirigente, referente, dipendente, collaboratore, professionista esterno (ruoli); Autorizzazione a gestire, Gestore della scheda (attributi) — tutti di proprietà di Appartenenze, §9.

**Relazioni con gli altri domini (9):** Appartenenze, Professionisti, Mercati Internazionali, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi — §10.

**Dipendenze necessarie (3):** Appartenenze, Tassonomia condivisa, Territori. **Dipendenze facoltative (2):** Mercati Internazionali, Professionisti. **Dipendenze vietate (6, verificate come assenti):** proprietà di Mercati, proprietà del ciclo di vita di Appartenenza, proprietà delle StorieImpresa, proprietà di report/statistiche, decisione sostanziale di accesso da parte di Identità & Accessi, riferimento diretto a Entity dipendenti interne di altri domini — §19.

**Pattern utilizzati:** A01, E02, E03, VO01, VO03, C02, C03, C05, C06, R01, R02, R06, R07, S01-S04, S07-S08, V01, V03, V04, V05, VR03, VR06, EV01-EV04, D01-D02, D04-D09, DOC01, DOC03-DOC05, T01, T03-T04, T06-T07, VIS01, VIS03-VIS04, VIS06.

**Pattern riutilizzabili confermati (12 aree):** sedi, contatti/canali digitali, classificazioni, verifiche, certificazioni, visibilità, pubblicazione, relazioni con persone, temporalità, eventi, dati derivati, più la conferma trasversale E02+R01+VO03/C05 come combinazione generale per "Entity dipendente classificata su catalogo condiviso" — §21.

**Decisioni locali (5):** D5, D7, D9, e le due componenti locali di D14. **Decisioni riutilizzabili (7):** D1, D4, D6, D8, D10, D13, e la componente riutilizzabile di D14. **Decisioni fondazionali (4):** D2, D3, D11, D12 — §20, §23.

**Qualità raggiunta:** Esito positivo su tutti i 14 attributi verificati, con due aree segnalate per approfondimento futuro (internazionalizzazione degli identificativi legali; ownership di un eventuale ente emittente esterno), nessuna delle quali compromette la correttezza delle decisioni prese — §22.

**Questioni aperte (9) e aspetti rinviati (14):** 7 questioni logiche ereditate da `imprese.md` §12, 2 questioni metodologiche da monitorare, 9 aspetti rinviati alla rappresentazione fisica concreta, 5 aspetti rinviati ad altri domini (Appartenenze, Mercati Internazionali, Contenuti editoriali, Osservatorio, Professionisti) — §24.

**Conferma dell'assenza di contenuti tecnici e implementativi.** Nessuna istruzione SQL, nessuno schema di database, nessun riferimento a PostgreSQL o Supabase come scelta di progetto, nessun tipo di dato tecnico, nessuna API, nessun codice: ogni menzione di tecnologia è confinata alla nota introduttiva e alla sezione delle decisioni rinviate (§24), coerentemente con i vincoli inderogabili di questo mapping e con l'esito positivo della checklist di controllo (sopra).

Il documento è pronto per essere utilizzato come riferimento per il futuro piano di migrazione del dominio Imprese e come secondo caso di applicazione, dopo Persone, della metodologia consolidata in `architecture-baseline.md`.

---

## C3 Cultural Taxonomy Enrichment (addendum)

**Hybrid C.** Cultura ≠ BC. I settori CCI sono seed additivi sul catalogo condiviso `business_sectors` (VO03), non ownership Imprese e non discipline artistiche.

**C3.3** (`20260813120000`): `audiovisual`, `publishing`, `music_industry`, `live_performance`, `design_creative`, `fashion`, `artistic_crafts`, `cultural_heritage_services`. Nessun backfill dichiarazioni. C3.7 deferred.
