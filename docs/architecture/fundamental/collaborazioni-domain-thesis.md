# Tesi architetturale del dominio COLLABORAZIONI

> Livello architetturale, fondazionale, pre-modellazione. Questo documento NON è un modello dati, NON è un Domain Mapping (né logico né fisico), NON descrive implementazione. Non contiene tabelle di modellazione, Aggregate, Entity, Value Object, eventi di dominio come schema, schema logico, schema fisico, SQL, PostgreSQL, Supabase, API o migrazioni. Il suo scopo si esaurisce prima dell'inizio di qualunque modellazione: stabilire, con rigore e a partire esclusivamente dall'architettura già approvata, quale sia il corretto significato di business del dominio Collaborazioni — perimetro, natura, confini — e il motivo per cui esiste come dominio autonomo.
>
> Fondamenti (non modificati da questo documento): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), [`docs/architecture/fundamental/domain-patterns.md`](./domain-patterns.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/logical/persone.md`](../logical/persone.md), [`docs/architecture/logical/imprese.md`](../logical/imprese.md), [`docs/architecture/logical/appartenenze.md`](../logical/appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](../logical/mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](../logical/professionisti.md), [`docs/architecture/physical/domain-mapping/persone.md`](../physical/domain-mapping/persone.md), [`docs/architecture/physical/domain-mapping/imprese.md`](../physical/domain-mapping/imprese.md), [`docs/architecture/physical/domain-mapping/appartenenze.md`](../physical/domain-mapping/appartenenze.md), [`docs/architecture/physical/domain-mapping/mercati-internazionali.md`](../physical/domain-mapping/mercati-internazionali.md), [`docs/architecture/physical/domain-mapping/professionisti.md`](../physical/domain-mapping/professionisti.md).
>
> Nota di trasparenza obbligatoria. Un documento `docs/architecture/logical/collaborazioni.md` esiste già, così come un documento `docs/architecture/logical/opportunita.md`. Questa tesi non li legge e non li usa come fonte: la lista dei documenti da leggere, stabilita esplicitamente per questo compito, li esclude entrambi, a differenza di quanto accaduto per la tesi di Professionisti (che aveva incluso il proprio documento logico "per trasparenza, non come fonte di autorità"). Questa scelta è più radicale, non un'omissione: significa che ogni conclusione qui raggiunta deve poter essere motivata senza mai appoggiarsi, nemmeno per conferma, al modo in cui `logical/collaborazioni.md` ha già risolto le proprie domande. Il vuoto che questo documento colma non è quindi "l'assenza di una verifica indipendente di una soluzione già scritta" (come per Professionisti), ma qualcosa di più a monte: la dimostrazione, condotta esclusivamente dai documenti fondativi e dai quattro Physical Domain Mapping già approvati più il quinto già scritto per Professionisti, di che cosa il dominio Collaborazioni debba significare — un esercizio che, se e quando sarà confrontato con `logical/collaborazioni.md`, potrà confermarlo, divergere da esso, o segnalare un'ambiguità, ma che non lo presuppone in alcun punto.

---

## Indice

1. [Scopo](#1-scopo)
2. [Documenti letti](#2-documenti-letti)
3. [Domanda fondamentale](#3-domanda-fondamentale)
4. [Analisi delle ipotesi](#4-analisi-delle-ipotesi)
5. [Definizione del dominio](#5-definizione-del-dominio)
6. [Natura della Collaborazione](#6-natura-della-collaborazione)
7. [Fatti proprietari](#7-fatti-proprietari)
8. [Fatti esclusi](#8-fatti-esclusi)
9. [Partecipanti](#9-partecipanti)
10. [Ruoli](#10-ruoli)
11. [Ciclo di vita](#11-ciclo-di-vita)
12. [Temporalità](#12-temporalità)
13. [Relazioni con gli altri domini](#13-relazioni-con-gli-altri-domini)
14. [Applicazione dei Domain Patterns](#14-applicazione-dei-domain-patterns)
15. [Rischi architetturali](#15-rischi-architetturali)
16. [Questioni aperte](#16-questioni-aperte)
17. [Decisione finale](#17-decisione-finale)
18. [Checklist di coerenza](#18-checklist-di-coerenza)

[Revisione finale e riepilogo](#revisione-finale-e-riepilogo)

---

## 1. Scopo

**Cosa deve dimostrare questo documento.** Prima che possa esistere un modello logico di Collaborazioni, occorre stabilire — non presumere — quale sia il significato di business del dominio: che cosa rappresenta una Collaborazione, quali fatti le appartengono in esclusiva, quali fatti appartengono invece ad altri domini, quali sono i suoi confini rispetto a ciascuno degli altri dieci domini della piattaforma, quale sia la sua natura (fatto, relazione, accordo, intenzione, processo o stato) e per quale motivo essa debba esistere come dominio autonomo piuttosto che come parte di un altro dominio già progettato.

**Cosa NON è questo documento.**
- Non è un modello dati: non introduce Entity, attributi, cardinalità o Value Object.
- Non è un Domain Mapping, né logico né fisico.
- Non descrive alcuna implementazione: nessun riferimento a database, schema, API o codice.
- Non anticipa alcun Aggregate: dove questo documento individua un fatto proprietario, lo fa per stabilirne l'appartenenza di dominio, non per proporne una struttura interna.
- Non è una sintesi di `logical/collaborazioni.md`: per costruzione (nota di trasparenza sopra), questo documento non lo legge.

**Perché ora, e perché in questa forma.** Collaborazioni è già classificato "Core" (`domain-model.md` §2) e componente del più ampio dominio strategico "Opportunità e Collaborazioni" (`costituzione-piattaforma.md` §6.3), ma è anche l'unico, tra i domini già toccati da un documento logico, per cui la Dependency Map segnala esplicitamente più di una questione di confine non ancora risolta con certezza (la distinzione operativa tra esigenza e proposta, riga 848 della Dependency Map; l'applicabilità di PF4, `domain-patterns.md` §10.5) e per cui la storia stessa del progetto mostra un'origine concettuale condivisa con Opportunità, poi deliberatamente separata (si veda §5). Una verifica esplicita del significato del dominio, condotta con lo stesso metodo comparativo già usato per Professionisti ma senza fare leva sul documento logico già scritto, è quindi il passo necessario prima di qualunque futura modellazione o revisione.

**Effetto sui documenti esistenti.** Questo documento non modifica alcun documento esistente. Non stabilisce se `logical/collaborazioni.md` debba essere rivisto: si limita a fissare, in modo indipendente e motivato, il significato del dominio che ogni sua futura lettura, conferma o revisione dovrà rispettare.

---

## 2. Documenti letti

Letti integralmente per questa tesi, nell'ordine e nei limiti stabiliti dal compito:

| Documento | Ruolo nell'analisi |
|---|---|
| `docs/costituzione-piattaforma.md` | §6.3 "Opportunità e Collaborazioni": il dominio strategico unificato, "motore operativo della piattaforma"; contenuti (richieste/offerte di collaborazione, partnership, clienti, fornitori, distributori, personale, investitori, immobili, bandi); funzioni (pubblicazione, ricerca, candidatura o contatto diretto, gestione del ciclo di vita); relazione con Persone e Imprese ("collega sempre almeno due nodi tra Persone e Imprese") — la fonte più alta e più antica per la funzione economica del dominio |
| `docs/domain-model.md` | §2 (Collaborazioni: Core, componente di "Opportunità & Collaborazioni", trattata come documento autonomo per complessità); §3 (responsabilità sintetica: "rappresentare la ricerca, l'offerta o la relazione concreta tra soggetti che intendono sviluppare un'attività comune"; "può esistere senza alcuna Opportunità di origine"); §5 (relazione Opportunità–Collaborazione, non automatica, unidirezionale); §10 (eventi CollaborazioneAvviata, CollaborazioneConclusa); §11 (Contratti "distinta dall'Accordo preliminare di Collaborazioni"); §12 (glossario: "Opportunità/Collaborazione: beneficio offerto da un Promotore / relazione o intenzione di relazione cercata"); §13 decisione vincolante 7 ("Opportunità e Collaborazione restano distinte: un'Opportunità non diventa automaticamente una Collaborazione"); §14 (questione aperta: "responsabilità della piattaforma nelle Collaborazioni attive"); nota storica in apertura (la v1 trattava "Opportunità e Collaborazioni" come un unico dominio non ancora scomposto) — la fonte più direttamente autorevole e più ricca per questa tesi |
| `docs/platform-data-specification.md` | Documento più antico e a grana più larga (`domain-model.md`, nota storica): tratta "Collaborazione" come un semplice valore del campo "Tipo di opportunità" (insieme a fornitura, personale, cliente, distribuzione, investimento, immobile, bando), non come dominio autonomo — prova storica diretta dello stato concettuale precedente alla scomposizione, decisiva per l'analisi dell'ipotesi H9 (§4) e per la risposta alla domanda "perché Collaborazioni esiste come dominio autonomo" (§5) |
| `docs/architecture/fundamental/domain-patterns.md` | §7 (classificazione dei domini: Collaborazioni unico caso di "relazionale con componente applicativa", non ancora confermato da un proprio Physical Domain Mapping); §9-§10 (criteri PC1-PC6 per Aggregate e per la promozione di una relazione a dominio autonomo, inclusi i criteri negativi che citano esplicitamente "una collaborazione temporanea non strutturale" come caso da non promuovere — usato al §4/§15 per una distinzione terminologica cruciale); §10.1 (PF4, regola fondazionale sulla proprietà delle relazioni); §10.5 (Collaborazioni segnalata come caso "Candidato" per PF4, con l'indizio già registrato: "possiede esigenze e proposte di collaborazione e il loro possibile esito relazionale"); §11 (PF5, identità di relazione); §32 (Collaborazioni candidata per PCa1 contestazioni, PCa4 estensione di PF4, PCa7 conflitto di fonti; PL4, il catalogo di Ruolo di Appartenenze "mai riutilizzato da un altro dominio relazionale... un futuro dominio relazionale, es. Collaborazioni, definirà il proprio catalogo") — la griglia di verifica per §14 di questo documento |
| `docs/architecture/physical/domain-dependency-map.md` | §9 (sezione dedicata: definizione, dipendenze analizzate D19-D23, distinzioni concettuali da non confondere — la fonte fisica più direttamente dedicata a Collaborazioni oggi disponibile); §8 (Opportunità, per il confronto diretto su cui si fonda l'ipotesi H9); §18 (analisi dei cicli: Opportunità↔Collaborazioni "Eliminato", relazione unidirezionale); §19 (V10, dipendenza vietata: "Collaborazioni → appartenenze stabili... assorbimento di una relazione già consolidata come se fosse una proposta"); §15 (righe D35, D43: Contenuti Editoriali e Osservatorio verso Collaborazioni) |
| `docs/architecture/logical/persone.md` | Perimetro e confini di Persone; l'indipendenza esistenziale della Persona da ogni relazione o ruolo — la base per stabilire perché Collaborazioni referenzia la Persona senza mai incorporarla |
| `docs/architecture/logical/imprese.md` | Perimetro e confini di Imprese; l'indipendenza esistenziale dell'Impresa da ogni relazione — la base simmetrica per l'Impresa come possibile partecipante |
| `docs/architecture/logical/appartenenze.md` | §3 (criteri positivi/negativi per promuovere una relazione a dominio autonomo, generalizzati da `domain-patterns.md` come PC5/PC6); §14 (Fonte); il confine esplicito, ripreso ovunque nella Dependency Map, tra un legame strutturato e duraturo (Appartenenza) e un legame non ancora consolidato (Collaborazione) |
| `docs/architecture/logical/mercati-internazionali.md` | §8 (Esigenza di internazionalizzazione come bisogno dichiarato, esplicitamente distinto da un'Opportunità o una Collaborazione che può generare, "ma non coincide con esse"); §9 (principio di autonomia del dominio relazionale, riferimento esterno opaco) — il confronto diretto più utile per non confondere l'Esigenza di Collaborazioni con l'Esigenza di internazionalizzazione |
| `docs/architecture/logical/professionisti.md` | Il confine tra qualificazione professionale (posseduta da Professionisti) e coinvolgimento in una proposta collaborativa (posseduto da Collaborazioni); la qualificazione è sempre referenziata, mai incorporata |
| `docs/architecture/physical/domain-mapping/persone.md` | §di sintesi sulle dipendenze in entrata: Collaborazioni (insieme ad altri) referenzia la Persona per identità stabile, dipendenza descritta come di competenza del futuro documento di mapping di Collaborazioni, non di questo documento |
| `docs/architecture/physical/domain-mapping/imprese.md` | Tabella delle relazioni con gli altri domini: "Collaborazioni: Impresa come parte che cerca o offre una collaborazione... Il ciclo di vita e le regole della Collaborazione non sono incorporate nell'entità Impresa"; conferma dell'assenza di cicli (dipendenza unidirezionale, Collaborazioni→Imprese) |
| `docs/architecture/physical/domain-mapping/appartenenze.md` | §19-§20, la sezione più ricca e diretta oggi disponibile sul confine con Collaborazioni: le fasi già nominate (manifestazione di interesse, candidatura, abbinamento, selezione, accordo, collaborazione attiva); il principio "una Collaborazione non diventa mai, di per sé, un'Appartenenza"; DA10/DA11 (il titolo di rappresentanza è sempre di Appartenenze; nessuna Collaborazione genera, modifica o presume un'Appartenenza) |
| `docs/architecture/physical/domain-mapping/mercati-internazionali.md` | §22, "Relazione con Opportunità, Collaborazioni ed Eventi": un'Esigenza di internazionalizzazione può generare un'Opportunità o una Collaborazione, ma Mercati Internazionali non acquisisce mai una dipendenza in uscita verso di esse; conferma dell'assenza di cicli |
| `docs/architecture/physical/domain-mapping/professionisti.md` | §21.2, D21: la qualificazione professionale coinvolta in una Collaborazione resta "Provvisoria", di competenza del futuro mapping di Collaborazioni; §7 del logico: un Servizio professionale può essere "collegato a Collaborazioni... referenziato senza incorporazione" |

---

## 3. Domanda fondamentale

**Che cos'è una Collaborazione? Non dal punto di vista informatico. Dal punto di vista del business.**

Una Collaborazione è il fatto per cui una Persona o un'Impresa — da sola, senza ancora conoscere una controparte, oppure già in dialogo con una controparte specifica — dichiara l'intenzione di sviluppare un'attività comune con un altro soggetto, e ciò che ne segue: la ricerca di quella controparte, l'eventuale incontro e accordo tra le parti, e l'eventuale periodo in cui la cooperazione è effettivamente in corso, fino alla sua conclusione. Non è, in origine, un contratto né un rapporto già stabilito: è, prima di tutto, un'intenzione dichiarata di cooperare — che può restare tale, senza mai trovare una controparte, oppure evolvere fino a diventare una relazione concreta, senza però mai acquisire la stabilità organizzativa che caratterizza un'Appartenenza né il formalismo di annuncio e requisiti che caratterizza un'Opportunità.

Questa risposta non è una premessa arbitraria: è il risultato a cui converge, in modo indipendente, la fonte più alta (`costituzione-piattaforma.md` §6.3, "il luogo in cui la domanda e l'offerta si incontrano concretamente"), la fonte più sintetica e autorevole (`domain-model.md` §3, "la ricerca, l'offerta o la relazione concreta tra soggetti che intendono sviluppare un'attività comune"; §12, "relazione o intenzione di relazione cercata") e la fonte più operativa (`domain-dependency-map.md` §9, "l'intenzione o la ricerca di un rapporto di cooperazione tra soggetti"). Nessuna delle tre fonti riduce la Collaborazione a un solo momento (solo l'intenzione, o solo la relazione già stabilita): tutte e tre la descrivono come un arco che va dall'intenzione alla relazione concreta, passando per la ricerca — la base per la dimostrazione del §5 e per la determinazione della natura del dominio al §6.

---

## 4. Analisi delle ipotesi

Per ciascuna ipotesi: vantaggi, limiti, conflitti con l'architettura esistente, conseguenze architetturali. Nessuna ipotesi è scartata per assunzione: ciascuna riceve l'argomento più forte che i documenti letti permettono di costruire, prima di essere valutata.

### H1 — Collaborazione come semplice relazione Persona ↔ Persona

**Vantaggi.** È il caso più semplice da concepire: due individui che decidono di cooperare, senza la complessità di un soggetto collettivo.

**Limiti.** Esclude a priori ogni caso in cui una delle due parti sia un'Impresa — che `costituzione-piattaforma.md` §6.3 elenca esplicitamente come possibile controparte ("collega sempre almeno due nodi tra Persone e Imprese") e che la Dependency Map classifica come dipendenza **Necessaria** esattamente allo stesso livello di Persone (D19, D20, entrambe "Necessaria"), non come caso accessorio.

**Conflitti con l'architettura esistente.** Diretto con `domain-dependency-map.md` D20 e con `costituzione-piattaforma.md` §6.3, che trattano Persona e Impresa come due categorie di soggetto equivalenti e non gerarchiche per questo dominio.

**Conseguenze architetturali.** Costringerebbe a modellare altrove (o non modellare affatto) ogni collaborazione che coinvolga un'Impresa — la maggioranza dei casi reali descritti dalla Costituzione (partnership, fornitura, distribuzione, personale) — oppure a introdurre un secondo dominio parallelo per quei casi, violando PF2 (nessuna duplicazione, `domain-patterns.md` §8).

**Conclusione.** Rigettata: troppo restrittiva rispetto ai soggetti già riconosciuti come necessari.

### H2 — Collaborazione come relazione Persona ↔ Impresa

**Vantaggi.** Copre un numero elevato di casi reali (un libero professionista che collabora con un'azienda, una persona che propone una collaborazione a un'impresa). È la forma più vicina all'asimmetria già vista in Appartenenze (Persona che aderisce, Impresa che ospita).

**Limiti.** Esclude il caso Impresa↔Impresa (due imprese che stringono una partnership, una distribuzione, una fornitura reciproca) — esplicitamente elencato tra i contenuti dell'ecosistema unificato (`costituzione-piattaforma.md` §6.3: "partnership... fornitori, distributori") e non riconducibile, per definizione, a una relazione con una Persona come parte.

**Conflitti con l'architettura esistente.** `domain-model.md` §3 tratta Persone e Imprese come una coppia di soggetti simmetrica ("Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità (opzionale)"), non come una diade obbligata Persona-Impresa.

**Conseguenze architetturali.** Richiederebbe un secondo dominio (o una duplicazione interna) per i casi Impresa↔Impresa, violando PF2 esattamente come H1, solo con un perimetro leggermente più ampio.

**Conclusione.** Rigettata: più vicina alla realtà di H1, ma ancora arbitrariamente restrittiva sulla combinazione dei soggetti.

### H3 — Collaborazione come relazione Impresa ↔ Impresa

**Vantaggi.** Copre i casi B2B (partnership, fornitura, distribuzione) esplicitamente citati da `costituzione-piattaforma.md` §6.3.

**Limiti.** Esclude simmetricamente ogni caso in cui una Persona partecipi a titolo individuale (un libero professionista, un socio potenziale) — esplicitamente necessario per D19.

**Conflitti con l'architettura esistente.** Diretto con `domain-dependency-map.md` D19 (Persone, Necessaria).

**Conseguenze architetturali.** Le stesse di H2, speculari.

**Conclusione.** Rigettata, per lo stesso motivo strutturale di H1/H2: nessuna delle tre ipotesi che fissa a priori la combinazione dei soggetti partecipanti è coerente con la doppia dipendenza Necessaria (Persone e Imprese) già stabilita.

### H4 — Collaborazione come relazione Professionista ↔ Impresa

**Vantaggi.** Coglie un caso frequente e importante (un consulente o un libero professionista che collabora con un'azienda), coerente con quanto `professionisti.md` (§7 del logico, richiamato da `domain-mapping/professionisti.md` §21.2) descrive come un Servizio professionale "collegato a Collaborazioni".

**Limiti.** La dipendenza di Collaborazioni verso Professionisti è **Facoltativa** (D21), non Necessaria: "una proposta può essere specificamente rivolta a una qualificazione professionale, ma non tutte le collaborazioni lo richiedono" (`domain-dependency-map.md` §9). Fissare Professionista come parte costitutiva della relazione eleverebbe un caso facoltativo al rango di caso definitorio, un errore di livello logico analogo a quello già escluso per Professionisti stesso (che non è, di per sé, un soggetto nuovo, ma una qualificazione facoltativa della Persona, secondo la propria tesi architetturale).

**Conflitti con l'architettura esistente.** Con la gerarchia di necessità stessa della Dependency Map (D19/D20 Necessarie, D21 Facoltativa): un'ipotesi che promuove il caso facoltativo a caso costitutivo la contraddice direttamente.

**Conseguenze architetturali.** Costringerebbe ogni Persona partecipante a essere trattata come se fosse necessariamente un Professionista anche quando non dichiara alcuna qualificazione — violazione di PF2 rispetto al confine già stabilito da `professionisti.md` (una qualificazione professionale è sempre facoltativa e referenziata, mai un prerequisito di partecipazione a una relazione).

**Conclusione.** Rigettata come descrizione del nucleo del dominio; confermata come caso facoltativo legittimo, già coperto da D21 come riferimento, non come relazione costitutiva.

### H5 — Collaborazione come qualunque relazione tra due soggetti

**Vantaggi.** Massima apertura: non esclude a priori nessuna combinazione di soggetti, coerente con il linguaggio della Costituzione ("Qualsiasi persona o impresa della piattaforma, sia come domanda che come offerta", `costituzione-piattaforma.md` §6.3) e con l'assenza, nella Dependency Map, di un limite esplicito sui tipi di soggetto oltre a Persone/Imprese.

**Limiti — una distinzione terminologica necessaria.** Presa alla lettera e senza qualificazione, questa ipotesi confonde due significati diversi della parola "collaborazione". `domain-patterns.md` §10.2 elenca esplicitamente, tra i criteri negativi per promuovere una relazione a dominio autonomo (PC6, generalizzati da `appartenenze.md` §3), il caso di "una collaborazione temporanea non strutturale" — usando qui il termine nel suo senso generico e informale (una qualunque cooperazione occasionale tra due soggetti, come sinonimo di "cooperare"), non come riferimento al dominio Collaborazioni. Se H5 fosse interpretata in questo senso generico — "ogni interazione cooperativa tra due soggetti, per il solo fatto di essere cooperativa, appartiene a questo dominio" — violerebbe direttamente PC6: un contatto occasionale, una menzione, un rapporto non dichiarato non diventano automaticamente un fatto di Collaborazioni, esattamente come non lo diventano un'Appartenenza.

**Conflitti con l'architettura esistente.** Un'apertura priva di qualificazione rischierebbe anche di sovrapporsi ad Appartenenze (assorbendo relazioni già stabili, esplicitamente vietato da V10, `domain-dependency-map.md` §19) e di rendere ambiguo il confine con un "semplice contatto", che la stessa Dependency Map esclude esplicitamente dal perimetro di Collaborazioni (§9, "Collaborazione vs. semplice contatto... resta un'interazione non modellata da alcun dominio sostanziale").

**Conseguenze architetturali.** Senza qualificazione, l'ipotesi produrrebbe un dominio senza confini verificabili, violando il principio Single Owner (quale fatto, esattamente, sarebbe posseduto?) e la distinzione già stabilita tra fatto dichiarato e fatto dedotto o informale (`domain-patterns.md` §10.2, criteri negativi).

**Conclusione.** Rigettata nella forma letterale e non qualificata; contiene però un nucleo corretto, che sarà ripreso al §9: il dominio non deve limitare a priori i *tipi* di soggetto partecipante (Persona, Impresa, e in futuro altri soggetti fondazionali) sulla sola base della loro categoria, ma deve restare vincolato a fatti *dichiarati* (un'intenzione, una ricerca, una proposta), mai a interazioni dedotte o puramente informali.

### H6 — Collaborazione come richiesta di collaborazione

**Vantaggi.** Coglie correttamente il momento generativo del dominio: la Dependency Map elenca "le esigenze" e "le proposte" come i primi fatti posseduti (`domain-dependency-map.md` §9), e questo momento — un bisogno o un'offerta dichiarata, senza ancora una controparte — è indubbiamente un fatto proprio del dominio.

**Limiti.** Riduce il dominio alla sola fase iniziale, escludendo ciò che accade dopo un abbinamento riuscito. `domain-model.md` §3 descrive esplicitamente il dominio come comprendente anche "la relazione concreta", non solo "la ricerca" o "l'offerta"; §10 elenca un evento `CollaborazioneAvviata` (l'inizio di una cooperazione già in corso) e un evento `CollaborazioneConclusa` (la sua fine) — entrambi eventi che presuppongono una fase successiva alla semplice richiesta.

**Conflitti con l'architettura esistente.** Diretto con `domain-model.md` §3 e §10: se il dominio fosse solo "la richiesta", questi due eventi (che descrivono l'inizio e la fine di una relazione già avviata, non di una richiesta) dovrebbero appartenere a un altro dominio — ma nessun altro documento li attribuisce altrove.

**Conseguenze architetturali.** Costringerebbe a inventare un secondo dominio (non altrimenti giustificato da alcun documento) per la fase "attiva" della cooperazione, oppure a trattare quella fase come priva di padrone — violazione di PF1 (Single Owner).

**Conclusione.** Rigettata come descrizione esaustiva; confermata come descrizione corretta della fase generativa/iniziale del dominio, una delle fasi del ciclo di vita analizzato al §11, non l'intero dominio.

### H7 — Collaborazione come accordo

**Vantaggi.** `domain-model.md` §11 menziona esplicitamente un "Accordo preliminare di Collaborazioni", distinto dai Contratti (area esclusa dal perimetro della piattaforma): un'evidenza diretta che il dominio possiede una nozione di intesa raggiunta tra le parti.

**Limiti.** Un accordo presuppone che le parti si siano già incontrate e abbiano raggiunto un'intesa: non copre la fase precedente (l'esigenza o la proposta dichiarata, prima di qualunque incontro), che la Dependency Map elenca come fatto posseduto a pieno titolo (§9) e che può esistere anche senza mai sfociare in un accordo (un'esigenza che scade senza trovare risposta).

**Conflitti con l'architettura esistente.** Il rischio più diretto è di lettura, non di contraddizione: "accordo" potrebbe essere confuso con un impegno vincolante o contrattuale, cosa che `domain-model.md` §11 esclude esplicitamente qualificandolo come "preliminare" e distinto dai Contratti (area a bassa maturità, "esclusa" dal perimetro attuale della piattaforma, §11). Un'ipotesi che non mantenesse questa qualificazione violerebbe l'esclusione già dichiarata dei Contratti.

**Conseguenze architetturali.** Se preso come sola descrizione del dominio, escluderebbe la fase di ricerca (violazione simmetrica a H6); se preso senza la qualificazione "preliminare, non vincolante", rischierebbe di anticipare un dominio Contratti non progettato.

**Conclusione.** Rigettata come descrizione esaustiva; confermata, con la qualificazione "preliminare e non vincolante", come una delle fasi possibili del ciclo di vita (il momento in cui le parti si dichiarano reciprocamente d'accordo a procedere), non l'intero dominio.

### H8 — Collaborazione come progetto condiviso

**Vantaggi.** Riprende fedelmente il fine dichiarato dal dominio: "sviluppare un'attività comune" (`domain-model.md` §3).

**Limiti.** Un "progetto" implica, nel linguaggio corrente, una gestione operativa dell'esecuzione: attività, scadenze intermedie, risorse assegnate. Nessun documento letto attribuisce questo livello di dettaglio a Collaborazioni. Al contrario, `domain-model.md` §3 esclude esplicitamente che il dominio sia "un sistema di messaggistica, contratti o pagamenti", e la responsabilità della piattaforma "una volta che una relazione è avviata" è dichiarata esplicitamente come questione aperta, non come fatto già di competenza del dominio (`domain-model.md` §14, "Responsabilità della piattaforma nelle Collaborazioni attive — quale ruolo, se alcuno, assume").

**Conflitti con l'architettura esistente.** Anticiperebbe impropriamente un livello di dettaglio (gestione dell'esecuzione, delle attività, delle risorse) che nessun dominio della piattaforma possiede oggi e che nessun documento evoca nemmeno come area futura sotto questo nome.

**Conseguenze architetturali.** Trasformerebbe Collaborazioni in un dominio di project management, in contraddizione diretta con l'esclusione esplicita di messaggistica/contratti/pagamenti e con la questione aperta non ancora risolta al §14 del Domain Model.

**Conclusione.** Rigettata: il fine dichiarato ("attività comune") descrive correttamente la motivazione della relazione, non la sua gestione operativa, che il dominio non possiede.

### H9 — Collaborazione come opportunità pubblicata

**Vantaggi.** È l'unica ipotesi con una prova documentale storica diretta a proprio favore: `platform-data-specification.md`, il documento più antico e a grana più larga della piattaforma, modella "Collaborazione" letteralmente come un valore del campo "Tipo di opportunità" (riga 450, insieme a fornitura, personale, cliente, distribuzione, investimento, immobile, bando) — cioè come una categoria di un'unica entità Opportunità, non come dominio autonomo.

**Limiti.** `domain-model.md`, il documento che ha sostituito quel modello a grana più larga dopo "la scomposizione e l'approfondimento avvenuti nel frattempo" (nota storica in apertura), promuove Opportunità e Collaborazioni a due domini Core distinti e autonomi (§2, righe 60-61) precisamente perché la loro fusione in un unico concetto non superava più l'analisi. La differenza dichiarata non è cosmetica: Opportunità "descrive un processo strutturato con un annuncio pubblico, requisiti espliciti e un esito (accettazione/rifiuto)"; Collaborazioni "descrive un legame più aperto, spesso senza un processo formale di candidatura" (`domain-dependency-map.md` §8-§9). Una Collaborazione può quindi esistere anche come semplice contatto diretto tra due parti, senza mai passare per un "annuncio pubblicato" nel senso di Opportunità (`costituzione-piattaforma.md` §6.3, "candidatura o contatto diretto").

**Conflitti con l'architettura esistente.** Diretto con la decisione vincolante 7 del Domain Model ("Opportunità e Collaborazione restano distinte: un'Opportunità non diventa automaticamente una Collaborazione", `domain-model.md` §13) e con l'analisi dei cicli della Dependency Map, che qualifica la relazione Opportunità→Collaborazioni come **facoltativa e unidirezionale** (D22, "Origine storica da un'opportunità... non un requisito"), non come una relazione di sottotipo (is-a): se Collaborazione fosse semplicemente un'Opportunità pubblicata, la dipendenza sarebbe strutturale e obbligatoria, non facoltativa e storica.

**Conseguenze architetturali.** Ridurre Collaborazioni a un caso di Opportunità collasserebbe due domini Core distinti in uno, perdendo esattamente la caratteristica che la Dependency Map attribuisce in esclusiva a Collaborazioni — l'assenza di un processo formale — e reintrodurrebbe, di fatto, il modello indifferenziato che la piattaforma ha già superato.

**Conclusione.** Rigettata nella sua forma matura attuale; confermata come prova storica preziosa: è precisamente perché un concetto unico "Opportunità" indifferenziato risultava insufficiente a rappresentare sia i processi formali sia i legami informali di cooperazione che il progetto ha promosso Collaborazioni a dominio autonomo — un argomento diretto per la risposta alla domanda "perché esiste" (§5).

### H10 — Collaborazione come dominio autonomo che descrive una relazione collaborativa con un proprio ciclo di vita

**Vantaggi.** È la sintesi dei nuclei corretti isolati da H1-H9: non fissa a priori la combinazione dei soggetti partecipanti (superando i limiti di H1-H5, con la qualificazione di H5 ripresa al §9); non si riduce a una sola fase (superando H6/H7, le cui fasi restano comunque parte del ciclo di vita al §11); non anticipa un'esecuzione operativa non modellata (superando H8); non collassa in un altro dominio Core già distinto (superando H9).

**Verifica di non-arbitrarietà.** Questa non è la conclusione scelta per esclusione delle alternative sole: converge, indipendentemente, da almeno tre fonti di natura diversa — (1) `domain-model.md` §2, che classifica Collaborazioni Core e autonomo con motivazione propria ("trattata come documento autonomo per la propria complessità"); (2) `domain-dependency-map.md` §9, che le attribuisce fatti proprietari propri (esigenze, proposte, relazioni collaborative) con una propria tabella di dipendenze strutturata esattamente come quella di ogni altro dominio già confermato; (3) `domain-patterns.md` §7, che la colloca in una categoria distinta ("relazionale con componente applicativa") dalle categorie già doppiamente confermate (Fondazionale, Relazionale) e dagli altri domini candidati, sulla base di un'analisi comparativa indipendente condotta per l'intera piattaforma, non per il solo caso di Collaborazioni.

**Conclusione.** È l'interpretazione corretta. La dimostrazione completa, con le proprie prove, è al §5.

---

## 5. Definizione del dominio

**Tesi.** Il dominio Collaborazioni rappresenta il fatto di business per cui una Persona o un'Impresa dichiara — da sola o già in relazione con una controparte — l'intenzione di sviluppare un'attività comune con un altro soggetto: un dominio che possiede per intero l'arco che va dall'esigenza o dalla proposta dichiarata, attraverso l'eventuale ricerca e abbinamento di una controparte, fino all'eventuale accordo preliminare e all'eventuale periodo di cooperazione attiva e alla sua conclusione — senza mai raggiungere, per definizione, la stabilità organizzativa di un'Appartenenza, il formalismo di annuncio e requisiti espliciti di un'Opportunità, o l'esecuzione operativa di un progetto.

**Prova per convergenza indipendente.** Questa conclusione non deriva da un solo documento: è raggiunta indipendentemente da fonti di natura diversa, nessuna delle quali cita le altre come propria motivazione originaria.
1. `costituzione-piattaforma.md` §6.3 — la fonte strategica più alta, che descrive la funzione economica (il "motore operativo" dove domanda e offerta si incontrano) prima che esistesse alcuna scomposizione in documenti di dominio.
2. `domain-model.md` §2-§3, §12-§13 — la fonte architetturale generale, che classifica il dominio Core, gli attribuisce una responsabilità sintetica e lo distingue da Opportunità con una decisione vincolante dedicata.
3. `domain-dependency-map.md` §9 — la fonte fisica più operativa, che gli attribuisce fatti proprietari propri e una tabella di dipendenze verso Persone, Imprese, Professionisti, Opportunità e Appartenenze costruita con lo stesso metodo già applicato a tutti gli altri domini.
4. `domain-patterns.md` §7, §10.5, §32 — la fonte di sintesi comparativa tra tutti gli undici domini, che colloca Collaborazioni in una categoria propria ("relazionale con componente applicativa") non condivisa con nessun altro dominio già confermato.

Quattro percorsi indipendenti che convergono sulla stessa caratterizzazione soddisfano il criterio di ricorrenza già usato in questa architettura per promuovere una regola da Candidata a Fondazionale (`domain-patterns.md` §4); qui lo stesso criterio è applicato non a una regola trasversale ma alla caratterizzazione di un singolo dominio, con lo stesso rigore.

**Prova per esclusione sistematica (§4).** Ciascuna delle nove ipotesi alternative è stata respinta per una ragione specifica e diversa dalle altre: H1-H3 per una restrizione arbitraria e non motivata della combinazione dei soggetti partecipanti, contraddetta dalla doppia dipendenza Necessaria (D19, D20); H4 per la promozione indebita di una dipendenza Facoltativa (D21) al rango di caso costitutivo; H5 per l'assenza di qualificazione, che confonderebbe il senso tecnico del dominio con il senso generico e informale della parola "collaborazione", esplicitamente escluso dai criteri negativi PC6; H6-H8 per la riduzione del dominio a una sola delle sue fasi o per l'anticipazione indebita di un livello di dettaglio (l'esecuzione operativa) non modellato da alcun documento; H9 per la contraddizione diretta con la decisione vincolante 7 del Domain Model e con la natura facoltativa e unidirezionale della relazione con Opportunità. Nessuna delle nove alternative è stata respinta con lo stesso argomento usato per un'altra.

**Perché Collaborazioni esiste come dominio autonomo — la motivazione diretta.**
1. **Perché il fatto che possiede non è riducibile a un attributo di Persona o Impresa.** Un'intenzione di cooperare, una ricerca di controparte, un eventuale accordo e periodo di cooperazione attiva hanno un proprio significato, una propria evoluzione temporale e propri eventi (`domain-model.md` §10, `CollaborazioneAvviata`/`CollaborazioneConclusa`) che nessuno dei due domini fondazionali possiede né potrebbe assorbire senza comprimere assi di stato indipendenti (violazione di PF7, `domain-patterns.md` §12).
2. **Perché non è riducibile a un caso di Opportunità.** La storia stessa del progetto (da `platform-data-specification.md`, dove "Collaborazione" era un semplice valore di categoria, a `domain-model.md`, dove è un dominio Core autonomo) dimostra che la fusione dei due concetti produceva un modello indifferenziato, incapace di rappresentare sia i processi formali con annuncio e requisiti espliciti sia i legami informali senza tale processo (`domain-dependency-map.md` §8-§9); la decisione vincolante 7 del Domain Model formalizza questa distinzione come non negoziabile.
3. **Perché non è riducibile a un caso di Appartenenze.** Appartenenze possiede relazioni già stabili, strutturate e durature; Collaborazioni possiede per definizione un legame non ancora consolidato in quella forma — un'assimilazione dell'una nell'altra è esplicitamente vietata in entrambe le direzioni (V10, `domain-dependency-map.md` §19; DA11, `domain-mapping/appartenenze.md` §20).
4. **Perché non è riducibile a un caso di Professionisti.** La qualificazione professionale coinvolta in una Collaborazione è sempre facoltativa (D21) e mai costitutiva: il dominio deve poter rappresentare una proposta di cooperazione priva di qualunque requisito professionale.
5. **Perché soddisfa i criteri positivi già stabiliti per l'autonomia di un dominio relazionale.** Applicando PC5 (`domain-patterns.md` §10.2, generalizzato da `appartenenze.md` §3): un significato proprio non riducibile a un attributo descrittivo dei soggetti coinvolti; una possibilità di essere referenziato da altri domini (Opportunità per l'origine storica, D22; Contenuti Editoriali per la narrazione, D35; Osservatorio per l'aggregazione, D43); propri eventi di dominio (`domain-model.md` §10); la possibilità di cessare senza che i soggetti collegati cessino. Nessuno di questi criteri è soddisfatto per caso: sono tutti già confermati da documenti indipendenti.

---

## 6. Natura della Collaborazione

**Determinare se una Collaborazione rappresenta un fatto, una relazione, un accordo, un'intenzione, un processo o uno stato.**

**Metodo.** Nessuna di queste sei categorie è trattata come reciprocamente esclusiva per assunzione: ciascuna viene verificata contro l'evidenza già raccolta al §4-§5, per stabilire se descriva l'intera natura del dominio, una sua fase, o nessuna delle due.

**Non è (solo) uno stato.** Uno stato è un valore statico in un dato momento. Ridurre la Collaborazione a uno stato comprimerebbe in un solo valore fasi che la stessa architettura tratta come temporalmente distinte e dotate di propri eventi (l'esigenza dichiarata, l'eventuale accordo, la cooperazione attiva, la conclusione, `domain-model.md` §10) — una violazione diretta di PF7 (`domain-patterns.md` §12, "un singolo stato complessivo non deve mai assorbire dimensioni semanticamente indipendenti").

**Non è (solo) un fatto atomico.** Un fatto atomico, isolato e immutabile, non spiegherebbe perché il dominio possieda eventi distinti che descrivono transizioni (`CollaborazioneAvviata`, poi eventualmente `CollaborazioneConclusa`): un evento, per definizione, descrive un cambiamento di un fatto che permane e si evolve, non un fatto puntuale e chiuso in sé.

**Non è (solo) un accordo.** Un accordo presuppone che le parti si siano già incontrate; esclude, per costruzione, la fase iniziale (l'esigenza o la proposta dichiarata da un solo soggetto, prima di qualunque incontro), che la Dependency Map elenca come fatto posseduto a pieno titolo, indipendentemente dal fatto che porti o no a un accordo (§4, ipotesi H7).

**Non è (solo) un'intenzione.** Un'intenzione, da sola, non spiega l'esistenza di un evento come `CollaborazioneAvviata`, che descrive l'inizio di qualcosa di più di un'intenzione dichiarata: una cooperazione effettivamente in corso, riconosciuta da entrambe le parti (§4, ipotesi H6).

**Non è (solo) una relazione nel senso pieno di PF4.** Una relazione, nel senso già confermato da Appartenenze e da Mercati Internazionali (`domain-patterns.md` §10.1), presuppone sempre almeno due soggetti già identificati e collegati. Ma una Collaborazione, nella sua fase iniziale, può esistere con un solo soggetto dichiarante e nessuna controparte ancora individuata (un'esigenza pubblicata, in attesa di trovare risposta): in questa fase non c'è ancora una relazione tra due parti, ma un fatto dichiarato su un solo soggetto, strutturalmente più vicino a una dichiarazione con riferimento a catalogo (PC3) che a una relazione in senso PF4. Questa distinzione è cruciale e viene ripresa in profondità al §14.

**È, per costruzione, un processo — che nelle sue fasi successive produce, di volta in volta, un'intenzione, una proposta e, se le condizioni si verificano, una relazione.** Le tre fonti indipendenti già citate al §5 non descrivono mai la Collaborazione come un singolo tipo di fatto, ma sempre come un arco: "la ricerca, l'offerta **o** la relazione concreta" (`domain-model.md` §3, disgiunzione non esclusiva: sono fasi dello stesso processo, non tre categorie separate di Collaborazione); "relazione **o** intenzione di relazione cercata" (`domain-model.md` §12, stessa struttura); "l'intenzione **o** la ricerca di un rapporto di cooperazione" (`domain-dependency-map.md` §9). Un processo, in questo senso, è precisamente ciò che permette a fatti di natura diversa (un'intenzione unilaterale; una proposta, ancora unilaterale ma diretta o pubblicata; un'eventuale relazione bilaterale attiva) di appartenere allo stesso dominio senza contraddizione, perché il dominio non possiede "una cosa", ma la traiettoria stessa e ciascuno dei suoi punti rilevanti. Questa è, non a caso, la stessa ragione per cui `domain-dependency-map.md` §3 e `domain-patterns.md` §7 classificano Collaborazioni come "Relazionale/Applicativo" — un'etichetta doppia, non un compromesso: applicativo per la componente di processo (analoga a Opportunità), relazionale per l'eventuale esito (analogo, ma non identico, ad Appartenenze).

**Identità della Collaborazione: possiede una propria identità indipendente?**

Sì, e la motivazione discende direttamente da quanto sopra. Un'esigenza o una proposta dichiarata deve poter essere identificata e referenziata indipendentemente dal soggetto che l'ha dichiarata, per almeno tre ragioni concrete, ciascuna già confermata da un documento indipendente:
1. **Cardinalità indipendente.** Lo stesso soggetto (una Persona o un'Impresa) può avere più esigenze o proposte contemporaneamente o in successione (una collaborazione conclusa non esaurisce la possibilità di proporne una nuova): l'identità della Collaborazione non può quindi coincidere con quella del soggetto dichiarante, che ne resta indipendente.
2. **Necessità di referenziabilità esterna.** Altri domini hanno bisogno di referenziare la singola Collaborazione, non il soggetto che l'ha proposta: Opportunità la referenzia come propria origine storica facoltativa (D22, in direzione inversa rispetto a quanto sopra: una Collaborazione referenzia l'Opportunità di origine, non il contrario, ma il principio di identità distinta vale in entrambe le direzioni), Contenuti Editoriali la referenzia come soggetto narrato (D35), Osservatorio la referenzia come fatto sorgente per propri indicatori (D43).
3. **Necessità di storicizzazione propria.** Gli eventi `CollaborazioneAvviata` e `CollaborazioneConclusa` (`domain-model.md` §10) presuppongono un'identità che persiste attraverso la transizione da una fase all'altra: non avrebbe senso un evento "conclusa" se l'identità della Collaborazione conclusa non fosse la stessa di quella avviata.

Per lo stesso principio già stabilito per ogni relazione o dichiarazione di questa architettura (PF5, `domain-patterns.md` §11), questa identità non deve mai derivare dall'identità di uno dei soggetti coinvolti: due Collaborazioni distinte proposte dalla stessa Persona restano due fatti distinti, non due stati dello stesso fatto.

---

## 7. Fatti proprietari

Per ciascun fatto: perché appartiene a Collaborazioni, e perché non appartiene a ciascuno degli altri domini rilevanti.

### Fatto 1 — L'esistenza e il ciclo di vita di un'esigenza o di una proposta di collaborazione

- **Perché a Collaborazioni.** È il fatto generativo del dominio, esplicitamente elencato come tale (`domain-dependency-map.md` §9, "esigenze" e "proposte"); nessun altro dominio possiede un concetto equivalente di ricerca dichiarata di cooperazione.
- **Perché non a Persone/Imprese.** Nessuno dei due documenti logici attribuisce a Persona o Impresa un proprio processo di ricerca di collaborazione: entrambe restano soggetti referenziati, mai proprietari del processo.
- **Perché non a Mercati Internazionali.** Quel dominio possiede l'Esigenza di internazionalizzazione, un bisogno dichiarato ma esplicitamente scoping al contesto di un Mercato specifico; `mercati-internazionali.md` §8 dichiara esplicitamente che una tale esigenza "può generare, in altri domini, un'Opportunità o una Collaborazione, ma non coincide con esse" — la prova più diretta che i due concetti restano distinti anche quando entrambi descrivono un "bisogno dichiarato".
- **Perché non a Opportunità.** Un'esigenza o proposta di Collaborazioni può restare informale, senza annuncio pubblico né requisiti espliciti — l'elemento che, per costruzione, distingue Collaborazioni da Opportunità (§4, §5).

### Fatto 2 — L'eventuale relazione collaborativa attiva risultante da un abbinamento riuscito

- **Perché a Collaborazioni.** È il fatto che gli eventi `CollaborazioneAvviata`/`CollaborazioneConclusa` presuppongono (`domain-model.md` §10); nessun altro dominio possiede il significato di "cooperazione in corso, non ancora stabilizzata in un rapporto organizzativo".
- **Perché non ad Appartenenze.** Appartenenze possiede relazioni già stabili e strutturate; una relazione collaborativa attiva, per definizione, non ha ancora raggiunto quella stabilità — e se la raggiungesse, il fatto stabile richiederebbe una nuova, distinta dichiarazione di Appartenenza, non una conversione automatica (`domain-mapping/appartenenze.md` §20; V10 di `domain-dependency-map.md` §19).
- **Perché non a Opportunità.** Opportunità "non gestisce l'esecuzione della relazione una volta stabilita" (`domain-model.md` §3): la fase attiva della cooperazione, quando esiste, resta di competenza di Collaborazioni.

### Fatto 3 — Il riferimento facoltativo all'origine storica da un'Opportunità

- **Perché a Collaborazioni.** È un dato di provenienza proprio della Collaborazione (D22, `domain-dependency-map.md` §9, "Origine storica da un'opportunità... non un requisito"): la Collaborazione possiede il fatto di sapere da dove proviene, senza che questo implichi la proprietà dell'Opportunità stessa.
- **Perché non a Opportunità.** Opportunità non referenzia mai una Collaborazione (relazione unidirezionale, confermata priva di ciclo da `domain-dependency-map.md` §18): il fatto "questa Collaborazione proviene da quell'Opportunità" è un dato che solo Collaborazioni ha motivo di possedere.

### Fatto 4 — Il ciclo di vita, gli stati e gli eventi di dominio della Collaborazione nel suo complesso

- **Perché a Collaborazioni.** È il fatto di coordinamento che rende le fasi elencate al §11 un insieme coerente e tracciabile, con propri eventi (`domain-model.md` §10) distinti da quelli di ogni altro dominio.
- **Perché non ad altri domini.** Nessun altro dominio genera `CollaborazioneAvviata` o `CollaborazioneConclusa`: per il principio "gli eventi di una relazione sono prodotti dal dominio relazionale, mai dai domini dei soggetti" (`domain-patterns.md` §10.3), questi eventi appartengono esclusivamente a Collaborazioni.

### Fatto 5 — Il riferimento facoltativo a una qualificazione professionale coinvolta

- **Perché a Collaborazioni.** È il fatto "questa proposta è rivolta (anche) a chi possiede una data qualificazione", un dato descrittivo della proposta stessa (D21, `domain-dependency-map.md` §9).
- **Perché non a Professionisti.** Professionisti possiede la qualificazione in sé (titoli, iscrizioni, servizi dichiarati); Collaborazioni la referenzia soltanto, come requisito facoltativo, senza mai incorporarne gli attributi (`domain-mapping/professionisti.md` §21.2, "riferimento facoltativo... senza incorporazione").

### Fatto 6 — L'utilizzo del titolo di rappresentanza quando il promotore agisce per conto di un'Impresa

- **Perché a Collaborazioni (come utilizzo, non come proprietà).** Il fatto che sia necessario verificare la legittimità di chi propone una collaborazione a nome di un'Impresa è un fatto che Collaborazioni deve poter consultare per la propria validità operativa (D23, `domain-dependency-map.md` §9, "Necessaria quando applicabile").
- **Perché non a Collaborazioni come proprietà.** Il titolo di rappresentanza resta sempre posseduto da Appartenenze (DA10, `domain-mapping/appartenenze.md` §19-§20, principio "Fondazionale"): Collaborazioni lo utilizza, senza mai crearlo, verificarlo autonomamente o duplicarlo.

---

## 8. Fatti esclusi

Tutto ciò che Collaborazioni non deve possedere, con motivazione e dominio proprietario corretto.

| Fatto escluso | Dominio proprietario corretto | Motivazione |
|---|---|---|
| Identità, biografia, dati di contatto della Persona partecipante | Persone | Collaborazioni referenzia la Persona per identità stabile; duplicarne i dati violerebbe PF2 (§7, Fatto 1) |
| Identità, dati descrittivi, sedi, certificazioni dell'Impresa partecipante | Imprese | Stesso principio, simmetrico (`domain-mapping/imprese.md`, "il ciclo di vita e le regole della Collaborazione non sono incorporate nell'entità Impresa") |
| Qualificazione professionale, titoli, servizi dichiarati del soggetto coinvolto | Professionisti | Collaborazioni referenzia la qualificazione come requisito facoltativo, mai la incorpora (§7, Fatto 5) |
| La relazione stabile e strutturata risultante, quando il legame si consolida in un rapporto organizzativo duraturo | Appartenenze | Una Collaborazione non diventa mai, di per sé, un'Appartenenza; il fatto stabile richiede una nuova, distinta dichiarazione (V10, `domain-dependency-map.md` §19; DA11, `domain-mapping/appartenenze.md` §20) |
| Il titolo di rappresentanza con cui una Persona agisce per conto di un'Impresa | Appartenenze | Fatto Fondazionale di quel dominio; Collaborazioni lo utilizza senza mai crearlo o verificarlo autonomamente (DA10, `domain-mapping/appartenenze.md` §19) |
| Il processo formale con annuncio pubblico, requisiti espliciti ed esito binario (accettazione/rifiuto) | Opportunità | È precisamente l'elemento che distingue le due Opportunità da Collaborazioni (decisione vincolante 7, `domain-model.md` §13); una Collaborazione può facoltativamente originare da un'Opportunità (D22) senza mai incorporarne il processo |
| L'Esigenza di internazionalizzazione, il Mercato come contesto, le relazioni di Presenza/Interesse/Attività internazionale | Mercati Internazionali | Concetti distinti anche quando entrambi descrivono un "bisogno dichiarato"; un'Esigenza di internazionalizzazione può generare una Collaborazione ma non coincide con essa (`mercati-internazionali.md` §8) |
| L'evento organizzato (fiera, missione commerciale) con tempo, luogo, edizioni e sessioni | Eventi | Nessun documento attribuisce a Collaborazioni la gestione di un accadimento organizzato; un Evento può generare occasioni per nuove Collaborazioni, senza automatismo |
| La narrazione editoriale di una collaborazione avvenuta | Contenuti Editoriali | Una narrazione non trasferisce la proprietà del fatto narrato (P5, P10; D35, `domain-dependency-map.md` §9, "Collaborazione vs. contenuto editoriale... resta una rappresentazione, non il fatto") |
| Statistiche, indicatori e aggregazioni relative alle Collaborazioni | Osservatorio | Un indicatore derivato non trasferisce mai la proprietà del fatto sorgente (D43, `domain-dependency-map.md` §15) |
| Messaggistica privata, contratti vincolanti, pagamenti | Fuori perimetro di ogni dominio attuale | Esplicitamente esclusi: "non è un sistema di messaggistica, contratti o pagamenti" (`domain-model.md` §3); l'Accordo preliminare resta distinto dai Contratti (§11 dello stesso documento) |
| Esecuzione operativa della cooperazione (attività, scadenze intermedie, risorse assegnate a un progetto condiviso) | Nessun dominio attuale | Anticiperebbe un livello di dettaglio non modellato da alcun documento; la responsabilità della piattaforma nelle collaborazioni attive resta esplicitamente una questione aperta (`domain-model.md` §14) |
| Autenticazione, account, credenziali, permessi applicativi | Identità & Accessi | Nessun fatto di questo dominio genera un permesso tecnico; l'azione di proporre, accettare o rifiutare richiede un account solo come fatto di supporto, non come parte del significato di business |
| Organizzazioni professionali, associazioni, enti, università come entità proprie con una propria scheda | Nessun dominio attuale (Organizzazioni istituzionali, dominio candidato non riconciliato) | "Compaiono come riferimenti esterni in più documenti, senza un dominio che ne rivendichi una scheda propria" (`domain-model.md` §11) |
| Offerta strutturata, pubblicata e ricercabile di un servizio con proprie regole di pubblicazione | Servizi (futuro dominio, non ancora progettato) | Una Collaborazione può nascere dall'incontro con un bisogno di servizio, ma l'offerta strutturata resta, se e quando quel dominio sarà progettato, di sua competenza |

---

## 9. Partecipanti

**Analisi dei soggetti candidati.**

- **Persona.** Ammessa, dipendenza **Necessaria** (D19): ogni esigenza o proposta ha un soggetto dichiarante, che può essere una Persona a titolo individuale.
- **Impresa.** Ammessa, dipendenza **Necessaria** (D20), sullo stesso piano di Persona: nessuna gerarchia tra le due, coerente con `costituzione-piattaforma.md` §6.3.
- **Professionista.** Non è, di per sé, una terza categoria di soggetto: per la stessa conclusione già raggiunta dalla propria tesi architetturale, un Professionista è sempre e comunque una Persona che assume un ruolo di qualificazione. Il suo coinvolgimento in una Collaborazione è quindi sempre riconducibile al soggetto Persona già ammesso, con l'aggiunta facoltativa di un riferimento alla propria qualificazione (D21, Fatto 5 al §7) — non un tipo di partecipante ulteriore.
- **Associazione, Ente, Università, Istituzione.** Nessuno di questi soggetti è oggi referenziabile da alcun dominio fondazionale esistente: compaiono, in più documenti, solo come riferimenti esterni non ancora strutturati, in attesa di un futuro dominio "Organizzazioni istituzionali" non ancora riconciliato a livello logico (`domain-model.md` §11, "Da valutare... senza un dominio che ne rivendichi una scheda propria"). Ammetterli oggi come partecipanti a pieno titolo richiederebbe di inventare, all'interno di questo stesso documento, un'identità referenziabile che nessun documento fondativo garantisce — un'anticipazione indebita del dominio non ancora progettato.

**Il dominio deve essere limitato oppure generalizzato?**

Entrambe le cose, in due sensi diversi che non si contraddicono. **È limitato, oggi, nei soggetti effettivamente referenziabili**: solo Persona e Impresa possiedono, allo stato attuale dell'architettura, un'identità stabile e fondazionale a cui Collaborazioni possa riferirsi senza inventare nulla (§4, ipotesi H5, versione qualificata). **È generalizzato nella propria struttura concettuale**: il significato del dominio — l'intenzione o la ricerca di un rapporto di cooperazione (§3, §5) — non presuppone nulla di specifico sulla natura di "Persona" o "Impresa" in quanto tali, ed è quindi predisposto, per costruzione, ad accogliere un domani un ulteriore tipo di soggetto (un'Organizzazione istituzionale, un'Università), senza che questo richieda alcuna revisione del significato qui stabilito — esattamente come Mercati Internazionali referenzia oggi "Impresa, Persona o Professionista" in modo opaco, senza che l'eventuale aggiunta di un quarto tipo di soggetto richieda di ridefinire cosa sia una Presenza o un Interesse di mercato (`mercati-internazionali.md` §9). Questa distinzione — limitato nei soggetti disponibili, generalizzato nella struttura — è la stessa che evita sia l'arbitrarietà di H1-H4 (fissare a priori la combinazione dei soggetti) sia l'anticipazione indebita che ammettere oggi soggetti non ancora modellati comporterebbe.

---

## 10. Ruoli

**I ruoli appartengono alla Collaborazione o ai partecipanti?**

Appartengono alla Collaborazione, non ai partecipanti. La motivazione è la stessa già stabilita per ogni dominio relazionale di questa architettura (§10.3 di `domain-patterns.md`, "Ruoli delle parti: un catalogo di ruoli, locale al dominio relazionale... mai riutilizzato da un altro dominio relazionale con significato diverso"), ed è confermata da un'evidenza testuale diretta: `domain-mapping/appartenenze.md` §7 nomina esplicitamente, come esempio di ruolo che non deve mai essere confuso con un Ruolo di Appartenenza, "un ruolo in una Collaborazione (Soggetto proponente, Soggetto destinatario — dominio Collaborazioni)" — attribuendo quei ruoli, senza ambiguità, al dominio Collaborazioni stesso, non ai domini Persone o Imprese di cui i partecipanti sono soggetti.

**Motivazione strutturale, indipendente dalla sola citazione testuale.** Un ruolo come "proponente" o "destinatario" ha significato solo all'interno di una specifica Collaborazione: lo stesso soggetto (una Persona o un'Impresa) può essere proponente in una Collaborazione e destinatario in un'altra, simultaneamente. Se il ruolo fosse un attributo persistente del partecipante (Persona o Impresa), quel soggetto dovrebbe accumulare un numero potenzialmente illimitato di attributi "ruolo in questa Collaborazione, ruolo in quella Collaborazione..." — una violazione diretta di PF7 (nessuna compressione di assi indipendenti) e un carico improprio su un dominio fondazionale la cui esistenza, per principio, non deve dipendere da alcuna relazione (`domain-dependency-map.md`, principio già confermato per Persone e Imprese). Il ruolo deve quindi restare un fatto locale e contestuale, posseduto dalla singola istanza di Collaborazione, esattamente come il Ruolo di un'Appartenenza (Titolare, Socio, Dipendente...) non è mai un attributo persistente della Persona o dell'Impresa, ma un fatto della relazione stessa.

**Conseguenza per il futuro catalogo di Ruolo.** Per PL4 (`domain-patterns.md` §32, "un futuro dominio relazionale, es. Collaborazioni, definirà il proprio catalogo secondo la propria natura, non riutilizzando queste voci"), il catalogo dei ruoli di Collaborazioni (almeno Soggetto proponente e Soggetto destinatario, già nominati; eventuali altri da stabilire) dovrà essere un catalogo proprio del dominio, mai una ripetizione o un'estensione del catalogo di Ruolo già posseduto da Appartenenze.

---

## 11. Ciclo di vita

**Solo significato di business, nessuno stato implementativo.**

Il ciclo di vita di una Collaborazione, per come emerge dalle fonti già citate (`domain-model.md` §3/§10; `domain-dependency-map.md` §9; `domain-mapping/appartenenze.md` §20, che nomina esplicitamente più fasi: "manifestazione di interesse, candidatura, abbinamento, selezione, accordo, collaborazione attiva"), attraversa i seguenti momenti di significato business, senza che ciascuno debba necessariamente verificarsi per tutte le Collaborazioni:

1. **Dichiarazione dell'intenzione o dell'offerta.** Un soggetto (Persona o Impresa) dichiara un'esigenza (cerca una cooperazione) o una proposta (offre una cooperazione), con o senza una controparte già individuata. È il momento generativo, sempre presente (§7, Fatto 1).
2. **Ricerca e visibilità.** L'esigenza o la proposta diventa scopribile da potenziali controparti, secondo le proprie regole di visibilità (§14, PF12) — una fase facoltativa, perché una proposta può anche essere diretta fin dall'origine a una controparte specifica, senza passare per una fase di ricerca pubblica.
3. **Interesse reciproco o abbinamento.** Una controparte manifesta interesse, o viene individuata una possibile corrispondenza tra un'esigenza e una proposta — il momento in cui il fatto, da unilaterale, comincia a coinvolgere una seconda parte identificata.
4. **Accordo preliminare.** Le parti dichiarano reciprocamente l'intenzione di procedere (`domain-model.md` §11, "Accordo preliminare di Collaborazioni") — un'intesa di business, non un impegno contrattuale vincolante.
5. **Collaborazione attiva.** La cooperazione è effettivamente in corso, riconosciuta da entrambe le parti — il momento che l'evento `CollaborazioneAvviata` rende osservabile ad altri domini.
6. **Conclusione.** La cooperazione attiva termina (con esito positivo, per decisione di una o entrambe le parti, o altrimenti) — il momento che l'evento `CollaborazioneConclusa` rende osservabile.

**Percorsi alternativi, sempre legittimi.** Non ogni Collaborazione attraversa tutte le fasi: un'esigenza può restare priva di risposta e scadere (senza mai raggiungere la fase 3); una proposta può essere ritirata prima di un accordo; un accordo preliminare può non tradursi mai in una collaborazione attiva. Nessuna di queste interruzioni è un'anomalia: per il principio di non-automatismo già fondazionale in questa architettura, nessuna fase implica necessariamente la successiva.

**Cosa questo ciclo di vita non è.** Non è un ciclo che, una volta raggiunta la fase 5, si trasforma automaticamente in un'Appartenenza: se la cooperazione si stabilizza in un rapporto organizzativo duraturo, quel fatto stabile richiede una nuova, distinta dichiarazione in un altro dominio (§7, §8), mantenendo se opportuno un riferimento storico alla Collaborazione di origine.

---

## 12. Temporalità

- **Inizio.** Coincide con la dichiarazione dell'esigenza o della proposta (fase 1 del §11), non con l'eventuale collaborazione attiva: è il momento in cui il fatto comincia a esistere come dichiarazione, indipendentemente dal suo esito.
- **Fine.** Può verificarsi a qualunque fase: prima di un abbinamento (per scadenza o ritiro), dopo un accordo mai attivato, o dopo una collaborazione effettivamente conclusa. La "fine" non è quindi un singolo evento, ma una famiglia di esiti distinti, ciascuno con un proprio significato.
- **Sospensione.** Ha significato di business solo per una collaborazione già attiva, temporaneamente interrotta senza che le parti dichiarino la sua conclusione — un asse distinto dalla conclusione stessa, per lo stesso principio di indipendenza degli assi già applicato in ogni altro dominio di questa architettura (PF7).
- **Annullamento.** Il ritiro deliberato di un'esigenza o di una proposta prima di qualunque abbinamento o accordo — un fatto distinto dalla scadenza (che segue invece l'esaurimento di un termine, non una decisione) e dalla conclusione (che presuppone una collaborazione già avviata).
- **Scadenza.** Un'esigenza o una proposta può avere un termine oltre il quale, se non ha trovato risposta, decade automaticamente — distinta dall'annullamento deliberato, per lo stesso principio già applicato altrove in questa architettura alla differenza tra Scadenza e Annullamento di una Certificazione d'impresa.
- **Conclusione.** L'esito naturale di una collaborazione attiva, per completamento dell'attività comune o per decisione, unilaterale o reciproca, di porre fine alla cooperazione — distinta dall'annullamento pre-accordo.
- **Storico.** In assenza di un'indicazione contraria, ogni fase rilevante del percorso (esigenza o proposta dichiarata, eventuale abbinamento, eventuale accordo, eventuale collaborazione attiva, eventuale conclusione) resta storicizzata per default, con la conservazione più completa, non la più economica (PF8, `domain-patterns.md` §13): gli stessi eventi di dominio già confermati (`CollaborazioneAvviata`, `CollaborazioneConclusa`) sono, per costruzione, fatti già avvenuti e non sovrascrivibili (PF15, corollario del principio generale "evento = fatto già avvenuto", `domain-model.md` §10).

---

## 13. Relazioni con gli altri domini

Per ciascun dominio richiesto: cosa possiede Collaborazioni, cosa referenzia, cosa non deve mai possedere.

### Persone

- **Cosa possiede Collaborazioni.** Nulla dell'identità della Persona: solo il fatto che una data Persona è promotrice o destinataria di una data Collaborazione.
- **Cosa referenzia.** L'identità stabile della Persona (D19, Necessaria), sempre per riferimento, mai per incorporazione.
- **Cosa non deve possedere.** Dati anagrafici, biografia, competenze o lingue dichiarate dalla Persona: restano interamente di competenza di Persone.

### Imprese

- **Cosa possiede Collaborazioni.** Nulla dell'identità dell'Impresa: solo il fatto che una data Impresa è promotrice o destinataria di una data Collaborazione.
- **Cosa referenzia.** L'identità stabile dell'Impresa (D20, Necessaria), confermata anche dal punto di vista di Imprese stesso (`domain-mapping/imprese.md`: "Impresa come parte che cerca o offre una collaborazione... riferimento in entrata").
- **Cosa non deve possedere.** Sedi, settori, certificazioni, servizi descritti dall'Impresa: restano interamente di competenza di Imprese, che a sua volta non incorpora "il ciclo di vita e le regole della Collaborazione" (`domain-mapping/imprese.md`, citazione diretta).

### Professionisti

- **Cosa possiede Collaborazioni.** Il fatto facoltativo che una data proposta è rivolta (anche) a una qualificazione professionale specifica.
- **Cosa referenzia.** L'identità del Profilo professionale (D21, Facoltativa), "senza incorporarne gli attributi (qualificazioni, portfolio, valutazioni)" (`domain-dependency-map.md` §7, sezione Professionisti).
- **Cosa non deve possedere.** Titoli, iscrizioni, abilitazioni, servizi professionali dichiarati: restano interamente di competenza di Professionisti; nessuna Collaborazione deve mai duplicare o ridefinire una qualifica professionale.

### Appartenenze

- **Cosa possiede Collaborazioni.** Il fatto (facoltativo, ma frequente) che una Collaborazione fa uso della verifica del titolo di rappresentanza già stabilita da un'Appartenenza, quando il promotore agisce per un'Impresa.
- **Cosa referenzia (per utilizzo, non per riferimento sostanziale).** L'esistenza e la validità corrente di un'Appartenenza, per verificare la legittimità di chi agisce a nome di un'Impresa (D23, Necessaria quando applicabile; principio "utilizzo, non riferimento sostanziale" già stabilito da `domain-mapping/appartenenze.md` §20).
- **Cosa non deve possedere.** Il Ruolo, il Periodo, la Fonte, l'Evidenza di verifica di un'Appartenenza; e soprattutto — divieto esplicito, non generico — non deve mai generare, modificare o presumere un'Appartenenza sulla sola base di una proposta, una candidatura o una partecipazione (DA11, `domain-mapping/appartenenze.md` §20, "Fondazionale"); non deve mai assorbire una relazione già consolidata come se fosse una propria proposta (V10, `domain-dependency-map.md` §19).

### Mercati Internazionali

- **Cosa possiede Collaborazioni.** Nulla del Mercato in sé; eventualmente, il fatto che una Collaborazione è contestualizzata rispetto a un Mercato specifico (riferimento facoltativo, per analogia con quanto già confermato per Opportunità, `domain-mapping/mercati-internazionali.md` §22).
- **Cosa referenzia.** L'identità del Mercato, se e quando la Collaborazione scelga di qualificarsi rispetto a esso; mai il contrario (Mercati Internazionali non acquisisce alcuna dipendenza in uscita verso Collaborazioni, `domain-mapping/mercati-internazionali.md` §22, "senza che questo introduca alcuna dipendenza in uscita da Mercati Internazionali verso Opportunità o Collaborazioni").
- **Cosa non deve possedere.** Il Mercato come concetto, la Presenza, l'Interesse, l'Attività internazionale, l'Esigenza di internazionalizzazione: quest'ultima "può generare... un'Opportunità o una Collaborazione, ma non coincide con esse" (`mercati-internazionali.md` §8) — un'Esigenza di collaborazione e un'Esigenza di internazionalizzazione restano sempre due fatti distinti, anche quando la seconda genera la prima.

### Opportunità

- **Cosa possiede Collaborazioni.** Il fatto facoltativo della propria origine storica da un'Opportunità (D22): un dato di provenienza, non una relazione strutturale.
- **Cosa referenzia.** L'identità dell'Opportunità di origine, quando esiste; mai il contrario (relazione unidirezionale, confermata priva di ciclo, `domain-dependency-map.md` §18).
- **Cosa non deve possedere.** L'annuncio pubblico, i requisiti espliciti, l'esito binario e il processo di candidatura formale che caratterizzano Opportunità: se una Collaborazione li possedesse, cesserebbe di essere distinguibile da un'Opportunità (decisione vincolante 7, `domain-model.md` §13); e Collaborazioni non deve mai presumere che un'Opportunità si trasformi automaticamente in una Collaborazione, o viceversa.

### Eventi

- **Cosa possiede Collaborazioni.** Nulla dell'Evento in sé; nessuna dipendenza censita nella matrice canonica in questa direzione.
- **Cosa referenzia.** Eventualmente, e solo per analogia strutturale con quanto già osservato per Opportunità (entrambe raggruppate con Eventi in `domain-dependency-map.md` come domini che dipendono da Persone/Imprese per l'identità e da Appartenenze per il titolo di rappresentanza), il fatto che un Evento può generare l'occasione per una nuova Collaborazione — un riferimento facoltativo e non automatico, non ancora censito come riga strutturale.
- **Cosa non deve possedere.** La gestione di edizioni, sessioni, iscrizioni o capienze di un Evento: restano interamente di competenza di Eventi; una partecipazione a un Evento non genera mai, di per sé, una Collaborazione.

### Organizzazioni (istituzionali)

- **Cosa possiede Collaborazioni.** Nulla, oggi: nessun documento fondativo attribuisce a Collaborazioni un riferimento a un'Organizzazione istituzionale come soggetto proprio.
- **Cosa referenzia.** Nulla, per lo stesso motivo: il dominio "Organizzazioni istituzionali" non è ancora riconciliato a livello logico (`domain-model.md` §11).
- **Cosa non deve possedere.** Una propria modellazione di associazioni, camere di commercio, enti pubblici o università come entità con una propria scheda: fino alla formalizzazione di quel dominio, Collaborazioni non deve introdurne una propria (per analogia diretta con il medesimo vincolo già stabilito per Professionisti rispetto a Ordini e Collegi).

### Servizi

- **Cosa possiede Collaborazioni.** Nulla dell'offerta strutturata di un servizio; eventualmente, il fatto che una Collaborazione nasce dall'incontro con un bisogno di servizio non ancora strutturato.
- **Cosa referenzia.** Nulla oggi: il dominio Servizi non è ancora progettato ("erede diretto del Domain Model v1, già parzialmente disambiguato da Professionisti", `domain-model.md` §11).
- **Cosa non deve possedere.** Un'offerta di servizio pubblicata, ricercabile e governata da regole proprie di pubblicazione: se e quando Servizi sarà progettato, quell'offerta resterà di sua competenza, non di Collaborazioni, per lo stesso principio già applicato a Professionisti rispetto allo stesso dominio futuro.

### Identità & Accessi

- **Cosa possiede Collaborazioni.** Nessun fatto tecnico: restano fatti di business puro (l'esigenza, la proposta, l'accordo, la relazione attiva).
- **Cosa referenzia.** Nulla in modo sostanziale: Identità & Accessi applica, a valle, le decisioni di accesso già prese da Collaborazioni (necessario per ogni azione di scrittura — proporre, accettare, rifiutare — facoltativo per la sola consultazione pubblica, `domain-dependency-map.md` §9), senza mai deciderle.
- **Cosa non deve possedere.** Nessuna decisione di visibilità sostanziale delegata a Identità & Accessi; nessun permesso tecnico che dimostri o crei una qualificazione, una verifica o un'affidabilità di una parte coinvolta.

---

## 14. Applicazione dei Domain Patterns

**Metodo.** Ogni pattern è verificato nel caso specifico di Collaborazioni, dichiarando esplicitamente se è confermato, applicabile solo in parte, non applicabile, o se richiede una qualificazione — mai omesso (PP4, `domain-patterns.md` §32).

### PF4 — Proprietà delle relazioni: analisi approfondita, come richiesto

**La domanda.** Una relazione di business autonoma appartiene al dominio che la rappresenta, mai ai domini dei soggetti coinvolti (`domain-patterns.md` §10.1). Collaborazioni possiede una simile relazione?

**Perché la risposta non può essere un sì o un no unico.** Il §6 ha già stabilito che la Collaborazione non è un singolo tipo di fatto, ma un processo che attraversa fasi di natura diversa: alcune fasi (l'esigenza o la proposta dichiarata da un solo soggetto, senza controparte ancora individuata) non presuppongono affatto una relazione tra due parti — sono dichiarazioni con riferimento a catalogo, strutturalmente più vicine a PC3 (`domain-patterns.md` §9) che a PF4; altre fasi (l'accordo, la collaborazione attiva) presuppongono per definizione due parti identificate, ruoli reciproci (§10) e uno stato proprio, e soddisfano quindi i criteri positivi PC5 già verificati per Appartenenze e Mercati Internazionali (§10.2 di `domain-patterns.md`: significato relazionale proprio; ruoli dichiarati; possibilità di verifica; visibilità propria; possibilità di cessare senza che i soggetti cessino).

**Conclusione motivata.** **PF4 è applicabile, ma non all'intero dominio in blocco: si applica specificamente alla relazione collaborativa attiva (e, con più cautela, all'eventuale accordo preliminare che la precede), non alla fase puramente dichiarativa e unilaterale (esigenza, proposta).** Questa conclusione:
- è coerente con la cautela già espressa da `domain-patterns.md` §10.5, che classifica Collaborazioni come "Candidata" per PF4 senza decidere, segnalando l'indizio "possiede esigenze e proposte di collaborazione e il loro possibile esito relazionale" — un indizio che distingue già, nella propria formulazione, "esigenze e proposte" (il possesso dichiarativo) da un "esito relazionale" (l'eventuale relazione);
- è coerente con il precedente già stabilito da Mercati Internazionali, che distingue esplicitamente un'Esigenza dichiarata (un fatto non ancora relazionale, `mercati-internazionali.md` §8) da una Presenza o un Interesse già in relazione con un Mercato — la stessa struttura a due nature, applicata a un caso diverso;
- non pretende di anticipare la modellazione: non stabilisce se la fase dichiarativa e la fase relazionale debbano essere due Aggregate Root distinti (PC2) o un unico concetto con stati diversi — una decisione riservata al futuro Logical Model (§16).

### PF5 — Identità della relazione

**Corollario diretto di PF4, applicabile con la stessa distinzione.** Per la fase relazionale (accordo, collaborazione attiva), l'identità della relazione non deve mai derivare dall'identità di uno dei soggetti coinvolti — stesso principio già confermato per Appartenenze. Per la fase dichiarativa (esigenza, proposta), la stessa regola vale per analogia: l'identità dell'esigenza o della proposta non deve mai derivare dall'identità del soggetto dichiarante, per le tre ragioni già motivate al §6 ("Identità della Collaborazione"). **PF5 è quindi applicabile a entrambe le fasi, con una motivazione specifica e distinta per ciascuna, non con un'unica motivazione generica.**

### Altri pattern rilevanti

| Codice | Esito nel caso Collaborazioni | Nota |
|---|---|---|
| PF1 Single Owner | **Applicabile, confermato** | Ogni fatto (esigenza, proposta, eventuale relazione) ha un solo dominio proprietario, distinto da Persone/Imprese/Professionisti/Appartenenze/Opportunità/Mercati Internazionali (§7-§8) |
| PF2 Nessuna duplicazione | **Applicabile, confermato** | Nessun fatto elencato al §7 duplica un fatto già posseduto da un altro dominio; il divieto esplicito V10 rafforza questo principio nella direzione più a rischio (verso Appartenenze) |
| PF6 Identità business ≠ identità di accesso | **Applicabile, confermato** | Nessun fatto di Collaborazioni genera un permesso tecnico (§13, Identità & Accessi) |
| PF7 Assi indipendenti mai compressi | **Applicabile, confermato ed è la motivazione centrale del §6** | Fase dichiarativa, fase di abbinamento, eventuale accordo, eventuale collaborazione attiva, sospensione, conclusione restano assi e momenti distinti, mai fusi in un unico stato |
| PF8 Continuità storica di default | **Applicabile, confermato** | Ogni fase resta storicizzata per default (§12) |
| PF9 Cronologia di dominio ≠ audit tecnico | **Applicabile implicitamente** | Nessun documento introduce un meccanismo di audit tecnico per Collaborazioni |
| PF10/PF11 Nessun badge generico, verifiche non fuse | **Applicabile per analogia, da confermare in dettaglio nel Logical Model** | Nessun documento oggi letto introduce un badge unico "collaborazione verificata"; eventuali verifiche (es. del titolo di rappresentanza, utilizzato da Appartenenze) restano distinte per aspetto |
| PF12 Condizione cumulativa di pubblicazione | **Applicabile per analogia** | La visibilità pubblica di un'esigenza o proposta dipenderà, per coerenza con gli altri domini, dal soddisfacimento simultaneo di più condizioni indipendenti, non da un singolo interruttore |
| PF13 Identità & Accessi applica, non decide | **Applicabile, confermato** | Nessuna decisione di visibilità sostanziale è delegata a Identità & Accessi (§13) |
| PF14 Ruolo di business ≠ privilegio applicativo | **Applicabile, confermato in modo diretto** | I ruoli "Soggetto proponente"/"Soggetto destinatario" (§10) sono ruoli di business locali alla relazione, non privilegi applicativi |
| PF15 Evento = fatto già avvenuto | **Applicabile, confermato** | `CollaborazioneAvviata`, `CollaborazioneConclusa` sono nominati con participio passato, coerenti con la forma già uniforme di tutta l'architettura (`domain-model.md` §10) |
| PF17 Sei classificazioni di dipendenza esaustive | **Applicabile, confermato** | Le dipendenze già censite (D19-D23, più D22/D35/D43 in entrata o in uscita) coprono Necessaria, Facoltativa, Di supporto, Derivativa ed Editoriale/rappresentativa — cinque delle sei categorie già osservate per questo solo dominio |
| PF18 Ciclo apparente vs ciclo reale | **Applicabile, confermato** | Opportunità↔Collaborazioni già verificato privo di ciclo reale (`domain-dependency-map.md` §18); nessun altro ciclo apparente riscontrato da questa tesi |
| PF20 Indisponibilità soggetto ≠ cancellazione relazione | **Applicabile per analogia** | L'eventuale cessazione di una Persona o Impresa partecipante non deve cancellare retroattivamente lo storico di una Collaborazione già conclusa |
| PC1 (procedura in cinque domande per l'Aggregate) | **Da applicare nel futuro Logical/Physical Model** | Questa tesi non la conduce in dettaglio (contenuto di modellazione, vietato qui) |
| PC2 (più Aggregate Root nello stesso dominio) | **Possibile evoluzione, non decisa qui** | Se la fase dichiarativa (Esigenza/Proposta) e la fase relazionale (Relazione collaborativa attiva) risultassero, in fase di modellazione, due Aggregate Root distinti (sul modello di Mercati Internazionali), questo pattern sarebbe applicabile; non è deciso da questa tesi |
| PC3 (dichiarazione + catalogo = Entity dipendente) | **Applicabile alla fase dichiarativa** | Un'Esigenza o una Proposta, prima di un abbinamento, è strutturalmente vicina al pattern già confermato per CompetenzaDichiarata/Esigenza di internazionalizzazione |
| PC5/PC6 (criteri positivi/negativi per un dominio relazionale autonomo) | **Usati in questa tesi per l'intera dimostrazione (§5, §6, §14 PF4)** | Collaborazioni soddisfa i criteri positivi per la fase relazionale; la fase dichiarativa e il senso informale della parola "collaborazione" restano distinti (§4, H5) |
| PCa1 (contestazioni) | **Candidato, segnalato non deciso** | `domain-patterns.md` §32 elenca già Collaborazioni tra i domini in cui questo pattern potrebbe consolidarsi; questa tesi non lo decide |
| PCa4 (estensione di PF4) | **L'analisi di questa stessa sezione è un contributo diretto a questo pattern candidato** | La distinzione fase dichiarativa/fase relazionale qui proposta è un input utile per una futura consolidazione, non una decisione su `domain-patterns.md` |
| PCa7 (conflitto tra fonti) | **Candidato, segnalato non deciso** | Nessun documento letto tratta in dettaglio un conflitto di fonti specifico per Collaborazioni |
| PL4 (catalogo di Ruolo locale, mai riutilizzato) | **Applicabile, confermato con citazione diretta (§10)** | Il catalogo di Ruolo di Collaborazioni deve essere proprio, non una ripetizione di quello di Appartenenze |

---

## 15. Rischi architetturali

| Rischio | Come si manifesterebbe | Principio che lo evita |
|---|---|---|
| **Duplicazione con Appartenenze** | Trattare un legame collaborativo consolidato come se fosse ancora una proposta, o trattare un'Appartenenza esistente come se fosse essa stessa una Collaborazione | V10 (`domain-dependency-map.md` §19); DA11 (`domain-mapping/appartenenze.md` §20); §7-§8 di questa tesi |
| **Duplicazione con Opportunità** | Ricreare, dentro Collaborazioni, un processo di annuncio pubblico e requisiti espliciti già di competenza di Opportunità, oppure trattare ogni Opportunità come automaticamente generativa di una Collaborazione | Decisione vincolante 7 (`domain-model.md` §13); relazione unidirezionale e facoltativa D22 (`domain-dependency-map.md` §9) |
| **Sovrapposizione con Mercati Internazionali** | Confondere l'Esigenza di collaborazione con l'Esigenza di internazionalizzazione, o duplicare il concetto di Mercato come attributo interno di una Collaborazione | `mercati-internazionali.md` §8 (distinzione esplicita); §13, Mercati Internazionali di questa tesi |
| **Sovrapposizione con Professionisti** | Incorporare qualifiche, titoli o servizi professionali come attributi propri di una proposta, invece di referenziare il Profilo professionale | `domain-mapping/professionisti.md` §21.2 ("riferimento facoltativo... senza incorporazione"); §7, Fatto 5 di questa tesi |
| **Relazione impropria: Professionista trattato come soggetto partecipante autonomo** | Introdurre "Professionista" come una categoria di partecipante distinta da Persona, invece di un suo ruolo/qualificazione facoltativa | §9 di questa tesi, per coerenza diretta con la tesi architetturale di Professionisti |
| **Confusione terminologica: "collaborazione" generica vs. dominio Collaborazioni** | Trattare qualunque interazione cooperativa informale, contatto occasionale o menzione come un fatto del dominio | PC6 (`domain-patterns.md` §10.2); §4, ipotesi H5 di questa tesi |
| **Dipendenza circolare apparente con Opportunità** | Introdurre, in una futura modellazione, un riferimento da Opportunità verso Collaborazioni | Già verificato assente e classificato "Eliminato" (`domain-dependency-map.md` §18); nessuna nuova evidenza in senso contrario riscontrata da questa tesi |
| **Violazione di PL4** | Riutilizzare, per i Ruoli di Collaborazioni, lo stesso catalogo già posseduto da Appartenenze (Titolare, Socio, Dipendente...) | PL4 (`domain-patterns.md` §32); §10 di questa tesi |
| **Violazione del principio "utilizzo, non riferimento sostanziale"** | Introdurre una propria logica di verifica del titolo di rappresentanza, parallela e duplicata rispetto a quella di Appartenenze | DA10 (`domain-mapping/appartenenze.md` §19); §7, Fatto 6 di questa tesi |
| **Anticipazione indebita: esecuzione operativa** | Modellare attività, scadenze intermedie o risorse di un "progetto condiviso" | §4, ipotesi H8 rigettata; questione aperta esplicita al §14 di `domain-model.md` |
| **Anticipazione indebita: Organizzazioni istituzionali, Servizi** | Introdurre una propria modellazione di associazioni, enti, università, o di un'offerta di servizio strutturata | §13 di questa tesi, sezioni Organizzazioni e Servizi |
| **Trattare la Collaborazione come un singolo stato o come un solo tipo di fatto** | Fondere esigenza, proposta, accordo e relazione attiva in un unico valore o in un'unica Entity indistinta | PF7 (`domain-patterns.md` §12); §6 di questa tesi |

---

## 16. Questioni aperte

Decisioni che non possono essere prese da questa tesi e che dovranno essere risolte dal futuro Logical Model di Collaborazioni.

1. **Distinzione operativa esatta tra Esigenza e Proposta.** Già segnalata come questione aperta dalla stessa Dependency Map ("Distinzione operativa tra esigenza e proposta in Collaborazioni — rinviata a `domain-mapping/collaborazioni.md`", `domain-dependency-map.md` riga 848): questa tesi ne conferma la rilevanza (§6, §7) senza risolverla.
2. **Se la fase dichiarativa e la fase relazionale richiedano uno o due Aggregate Root distinti** (PC2, §14) — decisione di modellazione, non di questa tesi.
3. **Il catalogo esatto dei Ruoli locali di Collaborazioni**, oltre a "Soggetto proponente" e "Soggetto destinatario" già nominati da `domain-mapping/appartenenze.md` §7 — se siano sufficienti o ne richiedano altri (es. un ruolo per un soggetto di supporto o intermediario).
4. **Grado di consolidamento di PCa1 (Contestazioni)** per Collaborazioni — se un'esigenza, una proposta o un accordo possano essere "contestati" con la stessa struttura già osservata in Appartenenze; segnalato come candidato da `domain-patterns.md` §32, non deciso qui.
5. **Grado di strutturazione della Temporalità** (§12) — se Scadenza, Sospensione e Annullamento richiedano una rappresentazione esplicita e distinta o restino descritti in modo meno strutturato.
6. **Responsabilità della piattaforma nelle Collaborazioni attive.** Questione già aperta al livello più generale dell'architettura ("quale ruolo, se alcuno, assume [la piattaforma] una volta che una relazione è avviata", `domain-model.md` §14): rilevante direttamente per il perimetro esatto del Fatto 2 al §7 di questa tesi, e non risolvibile senza una decisione di prodotto che eccede questo documento.
7. **Trattamento futuro dei soggetti non ancora modellati** (Organizzazioni istituzionali, Università) come partecipanti — rinviato fino alla riconciliazione di quel dominio (§9 di questa tesi).
8. **Confine esatto con un futuro dominio Servizi**, quando sarà progettato — quale parte di un'esigenza di collaborazione che comporti uno scambio di servizi resterà di competenza di Collaborazioni e quale di Servizi (§8, §13 di questa tesi).
9. **Se e come qualificare esplicitamente l'assenza di identità temporanea** (`domain-patterns.md` §11 la segnala già come "candidata a comparire nei futuri domini con processi limitati nel tempo", nominando esplicitamente Opportunità ma non Collaborazioni: da verificare se una candidatura o un abbinamento in corso richiedano un'identità di questo tipo).

---

## 17. Decisione finale

1. **Collaborazioni è un dominio autonomo**, con classificazione "Relazionale/Applicativo" (`domain-dependency-map.md` §3, §9; `domain-patterns.md` §7) — una classificazione che questa tesi conferma con un'analisi indipendente condotta senza fare leva su `logical/collaborazioni.md`.
2. **Collaborazioni non è**: una relazione limitata a una sola combinazione di soggetti (H1-H3, H4); qualunque interazione cooperativa informale non qualificata (H5); la sola fase di richiesta (H6) o di accordo (H7); un progetto con esecuzione operativa (H8); un caso o un sottotipo di Opportunità (H9).
3. **Collaborazioni è**: il dominio che possiede per intero il fatto di business — dichiarativo prima, eventualmente relazionale dopo — per cui una Persona o un'Impresa dichiara l'intenzione di sviluppare un'attività comune con un altro soggetto, dalla sua origine (esigenza o proposta) fino alla sua eventuale conclusione, passando per un eventuale abbinamento, un eventuale accordo preliminare e un'eventuale fase di cooperazione attiva — la sintesi dimostrata come H10 al §5.
4. **La sua natura non è un singolo tipo di fatto, ma un processo** che produce, in fasi successive, un'intenzione dichiarata, una proposta ed eventualmente una relazione (§6) — e per questo possiede una propria identità indipendente, non derivata da alcuno dei soggetti coinvolti.
5. **PF4 e PF5 si applicano con una distinzione esplicita tra fase dichiarativa e fase relazionale**, non in blocco e non per esclusione totale (§14) — la stessa cautela già segnalata da `domain-patterns.md` §10.5 come "Candidata", qui approfondita con un'analisi indipendente che la qualifica invece di lasciarla indecisa.
6. **I Ruoli (Soggetto proponente, Soggetto destinatario) appartengono alla Collaborazione, non ai partecipanti** (§10), e dovranno costituire un catalogo proprio del dominio, mai una ripetizione di quello di Appartenenze (PL4).
7. **I partecipanti ammessi oggi sono Persona e Impresa** (dipendenza Necessaria per entrambi), con Professionista trattato come qualificazione facoltativa della Persona, non come terza categoria; il dominio resta concettualmente generalizzabile a futuri soggetti fondazionali senza bisogno di ridefinire il proprio significato (§9).
8. **Questa tesi non introduce alcuna nuova regola architetturale.** Conferma, con un metodo di verifica indipendente, quanto già stabilito da `costituzione-piattaforma.md` §6.3, da `domain-model.md` (§2-§3, §12-§13), da `domain-dependency-map.md` §9 e da `domain-patterns.md` (§7, §10.5, §32); non contraddice `domain-patterns.md` e non ne propone alcuna modifica, limitandosi a verificarne il comportamento nel caso Collaborazioni (§14) e a segnalarne input per una futura revisione (§16, punti 4 e 9), senza applicarli.
9. **Questo documento è pronto per essere confrontato con `logical/collaborazioni.md`**, senza averlo letto: se le due conclusioni convergono, la convergenza è essa stessa una seconda dimostrazione indipendente; se divergono, la divergenza dovrà essere trattata come segnalazione da risolvere in una futura revisione, non come un errore automatico di uno dei due documenti.

---

## 18. Checklist di coerenza

| # | Verifica | Esito |
|---|---|---|
| 1 | Nessun modello logico è stato creato | Verificato — nessuna Entity, attributo, cardinalità o Value Object introdotto in alcuna sezione |
| 2 | Nessun modello fisico è stato creato | Verificato — nessun riferimento a database, schema, tabelle, SQL, PostgreSQL, Supabase |
| 3 | Nessuna Entity è stata introdotta | Verificato — ogni "fatto" al §7-§8 è descritto come fatto di business, non come struttura dati |
| 4 | Nessun database è stato progettato | Verificato |
| 5 | Nessuna riga di SQL è stata scritta | Verificato |
| 6 | Nessuna API è stata progettata | Verificato — nessun endpoint, nessun riferimento a interfacce tecniche |
| 7 | Nessun Aggregate è stato anticipato | Verificato — dove l'esistenza di più Aggregate Root è stata discussa (PC2, §14), è dichiarata esplicitamente come questione aperta (§16, punto 2), non come decisione |
| 8 | Il significato del dominio è stabilito | Verificato — §5, §6, §17 |
| 9 | I fatti che appartengono al dominio sono elencati e motivati | Verificato — §7, ciascuno con motivazione contro gli altri domini rilevanti |
| 10 | I fatti che non appartengono al dominio sono elencati e motivati | Verificato — §8, tabella con dominio proprietario corretto e motivazione per ciascuna riga |
| 11 | I confini con tutti gli altri dieci domini richiesti sono analizzati | Verificato — §13, una sottosezione dedicata per ciascuno dei dieci domini richiesti (Persone, Imprese, Professionisti, Appartenenze, Mercati Internazionali, Opportunità, Eventi, Organizzazioni, Servizi, Identità & Accessi) |
| 12 | La natura della collaborazione è determinata e motivata | Verificato — §6, con verifica esplicita contro tutte le sei categorie richieste (fatto, relazione, accordo, intenzione, processo, stato) |
| 13 | Il motivo per cui Collaborazioni esiste come dominio autonomo è esplicito | Verificato — §5, sezione dedicata con cinque motivazioni numerate |
| 14 | Ogni conclusione è motivata | Verificato — nessuna sezione si limita ad affermare una conclusione senza citare almeno un documento fondativo a supporto |
| 15 | PF4 e PF5 sono stati analizzati in profondità | Verificato — §14, sezioni dedicate con una conclusione qualificata (applicabilità distinta per fase), non un sì/no generico |
| 16 | Tutte le dieci ipotesi richieste (H1-H10) sono state analizzate | Verificato — §4, ciascuna con vantaggi, limiti, conflitti, conseguenze architetturali e conclusione motivata |

---

## Revisione finale e riepilogo

Rilettura integrale condotta contro la checklist richiesta (si veda anche §18 per il dettaglio punto per punto): nessuna Entity introdotta, nessun modello logico o fisico creato, nessun Aggregate anticipato, ogni conclusione motivata da almeno un documento fondativo, PF4 e PF5 analizzati in profondità con una conclusione qualificata e non generica.

**Riepilogo.**

1. **File creato.** `docs/architecture/fundamental/collaborazioni-domain-thesis.md`.
2. **Documenti letti.** I quindici documenti elencati al §2: `costituzione-piattaforma.md`, `domain-model.md`, `platform-data-specification.md`, `domain-patterns.md`, `domain-dependency-map.md`, i cinque documenti logici (Persone, Imprese, Appartenenze, Mercati Internazionali, Professionisti), i cinque Physical Domain Mapping corrispondenti (Persone, Imprese, Appartenenze, Mercati Internazionali, Professionisti). Per scelta esplicita del compito, `logical/collaborazioni.md` e `logical/opportunita.md` non sono stati letti né usati come fonte, pur essendo già esistenti (nota di trasparenza in apertura).
3. **Ipotesi analizzate.** Tutte le dieci richieste (H1-H10, §4): relazione Persona↔Persona; Persona↔Impresa; Impresa↔Impresa; Professionista↔Impresa; qualunque relazione tra due soggetti; richiesta di collaborazione; accordo; progetto condiviso; opportunità pubblicata; dominio autonomo con proprio ciclo di vita.
4. **Interpretazione scelta.** H10, qualificata: Collaborazioni è un dominio autonomo che possiede il processo — dichiarativo e, eventualmente, relazionale — con cui una Persona o un'Impresa dichiara e persegue l'intenzione di sviluppare un'attività comune con un altro soggetto (§5, §17).
5. **Fatti proprietari.** Sei fatti individuati e motivati al §7: esistenza e ciclo di vita di un'esigenza o proposta; eventuale relazione collaborativa attiva; riferimento facoltativo all'origine da un'Opportunità; ciclo di vita ed eventi di dominio nel complesso; riferimento facoltativo a una qualificazione professionale; utilizzo (non possesso) del titolo di rappresentanza.
6. **Fatti esclusi.** Quattordici fatti elencati al §8, ciascuno con il proprio dominio proprietario corretto (Persone, Imprese, Professionisti, Appartenenze, Opportunità, Mercati Internazionali, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi, o nessun dominio attuale) e una motivazione specifica.
7. **Applicazione dei pattern.** PF4 e PF5 analizzati in profondità al §14, con conclusione qualificata (applicabili alla fase relazionale, non alla fase dichiarativa unilaterale); tutti gli altri pattern rilevanti (PF1-PF2, PF6-PF20, PC1-PC6, PCa1/PCa4/PCa7, PL4) verificati in una tabella dedicata, nessuno omesso.
8. **Rischi individuati.** Dodici rischi elencati al §15, ciascuno con il principio architetturale che lo evita: duplicazioni (con Appartenenze, Opportunità), sovrapposizioni (con Mercati Internazionali, Professionisti), relazioni improprie (Professionista come soggetto autonomo), confusione terminologica (collaborazione generica vs. dominio), dipendenza circolare apparente (già verificata assente), violazioni di pattern (PL4, principio di utilizzo non sostanziale), anticipazioni indebite (esecuzione operativa, Organizzazioni istituzionali, Servizi), e il rischio di comprimere il dominio in un unico stato.
9. **Questioni aperte.** Nove questioni elencate al §16, tutte rinviate esplicitamente al futuro Logical Model o a decisioni di prodotto che eccedono questo documento, nessuna risolta qui.
10. **Conferma.** Nessun altro documento esistente è stato modificato durante la stesura di questa tesi: l'unica modifica al repository è la creazione del file indicato al punto 1.
