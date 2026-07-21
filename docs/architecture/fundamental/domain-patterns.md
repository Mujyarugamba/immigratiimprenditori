# Pattern architetturali comuni dei domini

> Livello architetturale, fondazionale. Questo documento non descrive un singolo dominio: estrae, formalizza e consolida le regole comuni con cui sono stati costruiti i quattro Physical Domain Mapping già approvati (Persone, Imprese, Appartenenze, Mercati Internazionali) e con cui dovranno essere costruiti tutti i domini futuri della piattaforma. Non contiene SQL, non contiene schema di database, non usa PostgreSQL o Supabase come riferimento progettuale, non indica tipi di dato tecnici, non tratta colonne, chiavi, indici, trigger, vincoli tecnici, RLS, API, framework, linguaggi o meccanismi infrastrutturali. Le uniche menzioni di tecnologie ammesse sono questa nota introduttiva e il controllo finale (§37), dove servono a verificarne l'assenza altrove nel testo.
> Fondamenti (non modificati da questo documento): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), tutti i documenti in [`docs/architecture/logical/`](../logical/), [`docs/architecture/physical/01-principi-mapping.md`](../physical/01-principi-mapping.md), [`docs/architecture/physical/02-reference-model.md`](../physical/02-reference-model.md), [`docs/architecture/physical/03-convenzioni-architetturali.md`](../physical/03-convenzioni-architetturali.md), [`docs/architecture/physical/04-quality-attributes.md`](../physical/04-quality-attributes.md), [`docs/architecture/physical/architecture-baseline.md`](../physical/architecture-baseline.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/physical/domain-mapping/persone.md`](../physical/domain-mapping/persone.md), [`docs/architecture/physical/domain-mapping/imprese.md`](../physical/domain-mapping/imprese.md), [`docs/architecture/physical/domain-mapping/appartenenze.md`](../physical/domain-mapping/appartenenze.md), [`docs/architecture/physical/domain-mapping/mercati-internazionali.md`](../physical/domain-mapping/mercati-internazionali.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: modello concettuale (`costituzione-piattaforma.md`) → modello logico di dominio → riconciliazione logica (`reconciliation-report.md`) → principi (`01`), Reference Model (`02`), convenzioni (`03`), attributi di qualità (`04`) → baseline metodologica (`architecture-baseline.md`) → Dependency Map (`domain-dependency-map.md`) → quattro Physical Domain Mapping (Persone, Imprese, Appartenenze, Mercati Internazionali) → **pattern architetturali comuni dei domini (questo documento)** → ogni futuro Physical Domain Mapping. Questo documento non sostituisce `01`-`04`: consolida ciò che l'evidenza empirica di quattro domini reali, di natura diversa (due fondazionali, uno relazionale puro, uno informativo-relazionale), ha confermato, generalizzato o smentito rispetto a quanto quei documenti trasversali avevano anticipato in astratto.

---

## Indice

1. [Nota introduttiva e perimetro](#1-nota-introduttiva-e-perimetro)
2. [Finalità normativa](#2-finalità-normativa)
3. [Documenti letti integralmente](#3-documenti-letti-integralmente)
4. [Metodo di estrazione dei pattern](#4-metodo-di-estrazione-dei-pattern)
5. [Livelli di forza delle regole](#5-livelli-di-forza-delle-regole)
6. [Definizioni fondamentali](#6-definizioni-fondamentali)
7. [Classificazione dei domini](#7-classificazione-dei-domini)
8. [Proprietà dei fatti di business](#8-proprietà-dei-fatti-di-business)
9. [Aggregate e confini di proprietà](#9-aggregate-e-confini-di-proprietà)
10. [Proprietà delle relazioni](#10-proprietà-delle-relazioni)
11. [Identità e riferimenti esterni](#11-identità-e-riferimenti-esterni)
12. [Stati e assi indipendenti](#12-stati-e-assi-indipendenti)
13. [Temporalità e storico](#13-temporalità-e-storico)
14. [Dichiarazioni, fonti ed evidenze](#14-dichiarazioni-fonti-ed-evidenze)
15. [Verifica](#15-verifica)
16. [Visibilità e pubblicazione](#16-visibilità-e-pubblicazione)
17. [Autorizzazione gestionale](#17-autorizzazione-gestionale)
18. [Contestazioni e conflitti](#18-contestazioni-e-conflitti)
19. [Eventi di dominio](#19-eventi-di-dominio)
20. [Dipendenze tra domini](#20-dipendenze-tra-domini)
21. [Prevenzione dei cicli](#21-prevenzione-dei-cicli)
22. [Derivazioni, proiezioni e aggregazioni](#22-derivazioni-proiezioni-e-aggregazioni)
23. [Vocabolari e tassonomie](#23-vocabolari-e-tassonomie)
24. [Cessazione, cancellazione e oblio](#24-cessazione-cancellazione-e-oblio)
25. [Eccezioni motivate: procedura obbligatoria](#25-eccezioni-motivate-procedura-obbligatoria)
26. [Pattern vietati](#26-pattern-vietati)
27. [Checklist obbligatoria per i futuri Domain Mapping](#27-checklist-obbligatoria-per-i-futuri-domain-mapping)
28. [Matrici di verifica](#28-matrici-di-verifica)
29. [Catalogo delle regole fondazionali](#29-catalogo-delle-regole-fondazionali)
30. [Catalogo dei pattern consolidati](#30-catalogo-dei-pattern-consolidati)
31. [Catalogo dei pattern preferenziali](#31-catalogo-dei-pattern-preferenziali)
32. [Catalogo dei pattern candidati](#32-catalogo-dei-pattern-candidati)
33. [Decisioni locali non generalizzabili](#33-decisioni-locali-non-generalizzabili)
34. [Questioni aperte](#34-questioni-aperte)
35. [Aspetti rinviati](#35-aspetti-rinviati)
36. [Impatti sulla documentazione esistente](#36-impatti-sulla-documentazione-esistente)
37. [Controllo finale](#37-controllo-finale)

[Riepilogo finale](#riepilogo-finale)

---

## 1. Nota introduttiva e perimetro

**Cosa è questo documento.** È il riferimento fondazionale con cui si progetta, verifica e collega ogni dominio della piattaforma, presente o futuro. Non è un quinto Physical Domain Mapping: non introduce un Aggregate Root, non tratta un'entità persistente propria, non descrive un dominio logico. È un documento di secondo livello, allo stesso piano di `01`-`04` e della Dependency Map, che si distingue da essi per origine: mentre `01`-`04` sono stati scritti *prima* di applicare il metodo a un dominio reale (poi verificato da `architecture-baseline.md` su Persone), questo documento è scritto *dopo* aver applicato il metodo a quattro domini reali, di natura deliberatamente diversa tra loro (due fondazionali, uno relazionale puro, uno informativo-relazionale con relazione), ed estrae ciò che quell'applicazione ha confermato, generalizzato, precisato o smentito.

**Cosa non è.** Non ridefinisce alcun principio di `01`, alcun pattern di `02`, alcuna convenzione di `03`, alcun attributo di qualità di `04`: li richiama per codice, senza duplicarne la motivazione. Non ridescrive la struttura di nessuno dei quattro domini già mappati: chi ha bisogno del dettaglio di Persone, Imprese, Appartenenze o Mercati Internazionali deve leggere il relativo Physical Domain Mapping, non questo documento. Non anticipa alcuna decisione definitiva per i domini non ancora mappati (Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi, Organizzazioni istituzionali, Servizi, e ogni altro dominio candidato non ancora riconciliato a livello logico).

**Perimetro.** Questo documento tratta esclusivamente regole, pattern e criteri di livello architetturale trasversale: quando un pattern è nato in un solo dominio e non ha ancora evidenza di ricorrenza, comparsa da una decisione fondazionale già consolidata, o necessità sistemica, questo documento lo classifica come locale (§33) o candidato (§32), non lo generalizza. Il perimetro esclude qualunque contenuto implementativo (§26 dei vincoli originari, verificato al §37).

**Perché ora, dopo quattro domini e non dopo uno solo.** `architecture-baseline.md` aveva già dichiarato, con onestà metodologica, che un solo caso di studio (Persone) non poteva dimostrare l'uniformità tra domini, solo la sufficienza dei principi. `domain-dependency-map.md` ha poi fissato *a priori* la rete di dipendenze tra gli undici domini, prima che i mapping successivi la applicassero. Imprese ha fornito il primo caso di correzione di ownership rispetto alla lettura letterale del logico (MercatoImpresa). Appartenenze ha fornito il primo dominio puramente relazionale, senza alcuna identità di soggetto propria. Mercati Internazionali ha fornito la prima conferma indipendente dello stesso principio di ownership relazionale in un contesto diverso (relazione soggetto↔mercato, non soggetto↔soggetto), dopo un processo di correzione architetturale esplicito e documentato che ha esso stesso generato evidenza preziosa su cosa NON generalizzare (§33, PL6). Con quattro casi di natura diversa, e non uno solo, esiste ora una base empirica sufficiente per distinguere una regola realmente comune da una coincidenza locale.

---

## 2. Finalità normativa

**Natura vincolante.** Questo documento è normativo nella misura dichiarata da ciascuna regola che contiene: una regola **Fondazionale** (§5) è obbligatoria per l'intera piattaforma e per ogni dominio futuro, senza eccezione non motivata; una regola **Consolidata** è vincolante salvo eccezione esplicitamente motivata secondo lo schema in tre parti (§25); una regola **Preferenziale** guida la scelta ma non la impone; una regola **Candidata** segnala un'ipotesi da verificare, non un obbligo; una regola **Locale** non si applica fuori dal dominio che l'ha originata; una regola **Vietata** non può mai essere applicata.

**A chi si applica.** A ogni futuro autore di un Physical Domain Mapping (Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi, e ogni dominio successivo), che deve consultare questo documento prima di redigere il proprio, esattamente come consulta `01`-`04` e la Dependency Map. A ogni revisore di un Physical Domain Mapping già scritto, che deve poter verificare, punto per punto, la checklist di §27. A chi in futuro dovesse proporre una revisione di `01`-`04` o della Dependency Map, che deve prima verificare se questo documento già registra l'evidenza rilevante.

**Non sostituisce, integra.** `01`-`04` restano il riferimento primario per principi, pattern, convenzioni e qualità: questo documento non li ripete, li richiama per codice (A01-A04, E01-E04, VO01-VO03, R01-R08, S01-S08, V01-V05, VR01-VR06, EV01-EV04, D01-D09, C01-C06, DOC01-DOC05, T01-T07, VIS01-VIS06, RC01-RC35, P1-P12) e aggiunge ciò che solo l'applicazione a domini reali poteva rivelare: quali combinazioni di pattern ricorrono davvero, quali principi generano evidenza empirica coerente, quale principio ha richiesto una correzione di ownership per essere applicato correttamente (§10, §21).

**Effetto sui documenti già approvati.** Questo documento non modifica `persone.md`, `imprese.md`, `appartenenze.md`, `mercati-internazionali.md`, la Dependency Map, `01`, `02`, `03` o `04`: li usa come fonte. Ogni correzione che l'analisi comparativa suggerisce per quei documenti è elencata esclusivamente al §36, distinguendo correzione necessaria, allineamento consigliato, decisione da ratificare e nessun intervento richiesto — mai applicata direttamente da questo documento.

---

## 3. Documenti letti integralmente

- `docs/costituzione-piattaforma.md`
- `docs/domain-model.md`
- `docs/platform-data-specification.md`
- `docs/architecture/logical/persone.md`, `imprese.md`, `appartenenze.md`, `mercati-internazionali.md`
- `docs/architecture/logical/reconciliation-report.md`
- `docs/architecture/physical/01-principi-mapping.md`
- `docs/architecture/physical/02-reference-model.md`
- `docs/architecture/physical/03-convenzioni-architetturali.md`
- `docs/architecture/physical/04-quality-attributes.md`
- `docs/architecture/physical/architecture-baseline.md`
- `docs/architecture/physical/domain-dependency-map.md`
- `docs/architecture/physical/domain-mapping/persone.md`
- `docs/architecture/physical/domain-mapping/imprese.md`
- `docs/architecture/physical/domain-mapping/appartenenze.md`
- `docs/architecture/physical/domain-mapping/mercati-internazionali.md`

I quattro Physical Domain Mapping sono assunti come approvati e come fonte primaria dell'evidenza comparativa (§4). La Dependency Map è assunta come vincolante per le proprie decisioni consolidate (D1-D51, V1-V12, P1-P12) e come seconda fonte primaria, essendo il documento che per primo ha classificato i domini e le dipendenze prima che i mapping li applicassero. `01`-`04` sono assunti come stabili: questo documento non ne propone alcuna revisione, ma segnala al §36 dove l'evidenza a valle suggerisce di valutarne un'estensione.

**Nota sulla revisione conclusiva.** Nella stesura iniziale di questo documento, `imprese.md` e `appartenenze.md` (Physical Domain Mapping) erano stati letti solo parzialmente, non integralmente come qui dichiarato. Una revisione conclusiva ha corretto questo problema metodologico, leggendo per intero entrambi i documenti (528 e 630 righe rispettivamente) insieme a una rilettura di `persone.md`, `mercati-internazionali.md`, `domain-dependency-map.md`, `01`, `02` e `03`, e ha verificato sistematicamente tutti i cataloghi (§29-§33) contro il testo integrale. L'elenco qui sopra descrive correttamente lo stato risultante da questa revisione, non lo stato della prima stesura. La verifica non ha richiesto modifiche sostanziali ai cataloghi né alla regola fondazionale sulla proprietà delle relazioni (§10): ha prodotto due correzioni puntuali, entrambe già applicate, riportate al §37.3.

---

## 4. Metodo di estrazione dei pattern

**Principio metodologico, ripreso senza attenuazioni.** Nessuna soluzione adottata in un singolo dominio diventa automaticamente una regola generale. Un pattern è promosso a regola comune soltanto quando ricorre in almeno due dei quattro domini letti con la stessa natura di problema (non necessariamente le stesse parole), oppure deriva direttamente da una decisione fondazionale già consolidata in `01`-`04` o nella Dependency Map, oppure è necessario per evitare duplicazioni, ambiguità, dipendenze circolari o incoerenze sistemiche già osservate nel confronto.

**Procedura seguita.** Per ciascuno dei quattro Physical Domain Mapping, è stata condotta una lettura integrale, non limitata alle sezioni omonime: le sezioni di `persone.md` (identità, stati, verifiche, temporalità, dati, eventi, dipendenze), di `imprese.md` (nucleo persistente, classificazioni, sedi, relazioni con Persone, relazioni con altri domini, assi di stato, verifiche, certificazioni, temporalità, visibilità, dati, documenti, eventi, dipendenze), di `appartenenze.md` (definizione operativa, nucleo persistente, ruoli, identità della relazione, assi di stato, temporalità, verifiche, fonti, conflitti, visibilità, relazioni con Persone/Imprese/Professionisti/Collaborazioni-Eventi-Opportunità/Identità & Accessi, eventi, dati, dipendenze, cicli) e di `mercati-internazionali.md` (definizione operativa, nucleo persistente, principio di autonomia, relazioni con soggetti e domini, assi di stato, verifiche, temporalità, visibilità, eventi, dipendenze, cicli) sono state confrontate riga per riga, non titolo per titolo.

**Cosa è stato cercato in ciascun confronto.** Per ogni argomento (identità, stati, verifiche, temporalità, fonti, visibilità, eventi, dipendenze, cicli, dati derivati, eccezioni): (a) la stessa domanda ricorre in più di un documento? (b) la risposta è la stessa forma di pattern (stesso codice di `02`), anche se i valori concreti differiscono? (c) dove le risposte divergono, la divergenza è motivata da una condizione di dominio esplicita, o è un'incoerenza non dichiarata? (d) la soluzione osservata era già anticipata come principio in `01`-`04`, o è un'evidenza nuova che quei documenti non avevano previsto in questa forma specifica?

**Cosa è stato distinto, esplicitamente.**

| Categoria | Criterio di riconoscimento | Trattamento in questo documento |
|---|---|---|
| Regola realmente comune | Stessa natura di problema, stessa forma di soluzione, in almeno due dei quattro domini, o derivazione diretta da un principio già fondazionale | Promossa a Fondazionale o Consolidata (§29-§30) |
| Variante legittima | Stessa natura di problema, valori concreti diversi, nessuna incoerenza (es. S01 assume valori diversi per Persona e per Impresa, restando lo stesso asse concettuale) | Non genera una nuova regola: conferma che l'asse/pattern generale già catalogato in `02` è sufficiente |
| Eccezione motivata | Un dominio si discosta da una soluzione altrimenti uniforme, con motivazione tracciata nello schema in tre parti (`03` §2) | Riconosciuta come eccezione, non generalizzata (§25) |
| Contraddizione apparente | Due documenti sembrano dire cose incompatibili, ma la lettura integrale rivela che riguardano aspetti diversi o che uno dei due era una vista di sintesi non normativa | Risolta esplicitamente in questo documento, mai lasciata come incoerenza residua (esempio: MercatoImpresa, §10, §21) |
| Decisione locale | Una soluzione valida ma specifica di un solo dominio, senza evidenza di ricorrenza né derivazione da un principio fondazionale | Non generalizzata: catalogata al §33 |
| Decisione matura per lo status fondazionale | Un principio già enunciato in `01`-`04` che i quattro mapping confermano senza eccezione, oppure un pattern nuovo confermato indipendentemente da almeno due domini di natura diversa | Promossa a Fondazionale (§29), con la motivazione esplicita richiesta dal principio metodologico |

**Perché la regola sulla proprietà delle relazioni (§10) supera la soglia della promozione a fondazionale.** Appartenenze (relazione soggetto↔soggetto, Persona-Impresa) e Mercati Internazionali (relazione soggetto↔contesto, Impresa/Persona/Professionista↔Mercato) sono due domini di natura diversa — il primo puramente relazionale, il secondo informativo e relazionale insieme (`domain-dependency-map.md` §3) — che applicano, in modo indipendente e con motivazione esplicita in entrambi i documenti, lo stesso identico principio: la relazione possiede la propria semantica, referenzia i soggetti coinvolti in modo opaco. Questo soddisfa il primo criterio del principio metodologico (ricorrenza coerente in più domini) e il secondo (deriva da una decisione fondazionale già consolidata: Single Owner, `01` §2 principio 1) simultaneamente: la soglia per la promozione a Fondazionale è quindi doppiamente superata, non semplicemente raggiunta.

---

## 5. Livelli di forza delle regole

| Livello | Significato | Effetto su un futuro Domain Mapping | Come si deroga |
|---|---|---|---|
| **Fondazionale** | Obbligatoria per l'intera piattaforma, senza eccezione non motivata da una condizione che nessuno degli undici domini logici oggi presenta | Deve essere applicata; la sua violazione non è un'eccezione, è un errore di mapping | Solo tramite una revisione esplicita di questo documento, con lo stesso rigore di una revisione di `01`-`04` |
| **Consolidata** | Confermata dai domini già progettati; applicabile salvo eccezione motivata | Va applicata come soluzione di default; una deroga richiede lo schema in tre parti (§25) | Eccezione motivata (§25), documentata nel Domain Mapping che deroga |
| **Preferenziale** | Soluzione raccomandata per qualità, leggibilità o coerenza redazionale, non obbligatoria | Va preferita quando non esiste un motivo specifico di dominio per un'alternativa | Nessuna procedura formale: è una raccomandazione, non un vincolo |
| **Candidata** | Pattern emerso da un solo dominio o da un'osservazione trasversale, non ancora verificato da un secondo caso indipendente | Va segnalata come ipotesi nel futuro Domain Mapping che la incontra, non assunta come già decisa | Si consolida quando un secondo dominio la confirma con la stessa natura di problema (§4); altrimenti resta candidata o retrocede a locale |
| **Locale** | Valida solo per lo specifico dominio che l'ha originata | Non va riutilizzata altrove senza rifare la verifica del §4 | Nessuna: per definizione non si generalizza |
| **Vietata** | Incompatibile con l'architettura | Non può mai comparire in un Domain Mapping approvato | Nessuna: la sua presenza è un errore da correggere, non un'eccezione da motivare |

**Come si assegna il livello.** Nessuna regola di questo documento riceve un livello superiore a quello che il proprio livello di evidenza giustifica (§4): un pattern osservato in un solo dominio, anche se elegante o promettente, non riceve mai lo status di Fondazionale o Consolidata solo per l'importanza percepita del problema che risolve. L'assegnazione del livello è dichiarata esplicitamente per ciascuna regola nei catalogi (§29-§33), con la motivazione richiesta dal principio metodologico (§4).

---

## 6. Definizioni fondamentali

Questo documento non ridefinisce i pattern di `02`: qui si fissano solo i termini di uso trasversale necessari a formulare le regole delle sezioni successive, ciascuno già coerente con `01`-`04`.

| Termine | Definizione operativa in questo documento |
|---|---|
| **Dominio** | Una porzione autonoma di responsabilità di business, con un proprio Aggregate Root (A01) o, per un dominio puramente relazionale, con la relazione stessa come Aggregate Root; corrisponde sempre a un dominio logico già riconciliato (`reconciliation-report.md` Parte 1) o a un futuro dominio che avrà superato lo stesso processo (`03` §11). |
| **Fatto di business** | Qualunque informazione che il modello logico di un dominio dichiara di possedere: un'identità, un attributo dichiarato, una relazione, uno stato, un esito di verifica, un evento. Ha sempre esattamente un dominio proprietario (PF1, §8). |
| **Proprietà** | La responsabilità esclusiva del significato, delle invarianti, del ciclo di vita e delle decisioni che modificano un fatto di business (`domain-dependency-map.md`, definizione "Proprietà"). |
| **Riferimento** | L'atto con cui un dominio richiama un fatto posseduto da un altro dominio per la sua identità stabile (§11), senza acquisirne la proprietà (R01/R02, `02` §6). |
| **Riferimento esterno opaco** | Il riferimento che un dominio relazionale (§10) utilizza per referenziare un soggetto esterno, limitato esclusivamente alla sua identità stabile: non incorpora né dipende da alcun attributo, stato interno, ciclo di vita interno, modalità di persistenza o regola applicativa propria del dominio che possiede quel soggetto. È lo stesso pattern confermato da Appartenenze verso Persone/Imprese e da Mercati Internazionali verso Imprese/Persone/Professionisti/Appartenenze (§10, §11). |
| **Utilizzo** | Il consumo di un dato esterno già referenziato per svolgere una responsabilità propria, senza modificarlo né reinterpretarlo (`domain-dependency-map.md`, definizione "Utilizzo"). |
| **Dipendenza** | La relazione, tra due domini, per cui uno dei due (dipendente) ha bisogno di riferire, utilizzare, derivare da, aggregare o pubblicare un fatto posseduto dall'altro (proprietario); classificata sempre come necessaria, facoltativa, derivativa, editoriale/rappresentativa, di supporto o vietata (§20). |
| **Verifica** | Il controllo, condotto da un soggetto verificatore secondo un metodo dichiarato, su un aspetto specifico e nominato di un fatto o di un'Entity (V01, §15); mai un giudizio complessivo. |
| **Evento di dominio** | Un fatto già avvenuto, prodotto da un dominio, potenzialmente rilevante per altri domini o funzioni trasversali (EV01, §19); mai un comando. |
| **Asse di stato** | Una dimensione indipendente del ciclo di vita di un'Entity, che risponde a una domanda specifica (S01-S08, §12); più assi possono avere valori diversi nello stesso momento senza che l'uno implichi l'altro. |
| **Visibilità** | L'insieme delle condizioni, sempre distinte dall'esistenza del fatto, che determinano chi può vedere un fatto e in quali circostanze (VIS01-VIS06, §16). |
| **Pubblicazione** | L'atto esplicito con cui il dominio proprietario di un fatto decide di renderlo visibile a un pubblico più ampio di chi vi accede per titolarità diretta (VIS04, §16); non trasferisce mai la proprietà del fatto. |
| **Storicizzazione** | La conservazione deliberata di una condizione passata di un fatto, perché il suo essere stata vera in un momento precedente resta rilevante (T07/S08/D08, §13). |
| **Dato derivato** | Un dato ottenuto elaborando uno o più dati sorgente, che non deve mai essere trattato come se fosse esso stesso un dato sorgente (D04-D06, §22). |
| **Vocabolario/Tassonomia condivisa** | Un insieme di valori governato da un unico dominio proprietario e referenziato da altri domini per identità, mai copiato (C02+VO03, §23). |
| **Autorizzazione gestionale** | Il fatto di business, distinto da qualunque ruolo relazionale, con cui un soggetto riceve la facoltà di intervenire su una rappresentazione (una scheda, un profilo) di un altro soggetto (R06, §17). |
| **Contestazione** | Il fatto di business con cui una dichiarazione, una relazione, una fonte, un ruolo o un esito di verifica viene messo in dubbio da una parte o da un terzo con titolo per farlo (§18). |

---

## 7. Classificazione dei domini

**Perimetro di questa sezione.** La Dependency Map ha già introdotto una classificazione dei ruoli prevalenti (`domain-dependency-map.md` §3-§13): Fondazionale, Relazionale, Informativo, Applicativo, Editoriale, Osservativo, Di supporto, con qualificazioni secondarie. Questo documento non sostituisce quella classificazione: la riprende, la organizza secondo le otto categorie richieste dal mandato di questo documento, e distingue esplicitamente ciò che è già confermato da un Physical Domain Mapping da ciò che resta, per ora, una previsione della sola Dependency Map, non ancora verificata da un mapping fisico.

| Categoria | Responsabilità | Caratteristiche | Dipendenze consentite | Dipendenze vietate | Esempi confermati (Physical Domain Mapping già approvato) | Casi ancora da verificare |
|---|---|---|---|---|---|---|
| **Domini fondazionali** | Possiedono l'identità di un soggetto primario della piattaforma, la cui esistenza non dipende sostanzialmente da alcuna relazione | Esistenza indipendente da ogni relazione; riferiti da un numero ampio di altri domini; dipendenze in uscita minime, quasi sempre solo verso vocabolari condivisi e Identità & Accessi (di supporto) | Riferimento a Tassonomia condivisa (VO03); dipendenza di supporto verso Identità & Accessi | Qualunque dipendenza verso un dominio relazionale, applicativo o editoriale per la propria validità sostanziale (P11, P12 di `domain-dependency-map.md`) | **Persone**, **Imprese** | — (categoria già confermata da due casi indipendenti) |
| **Domini relazionali** | Possiedono esclusivamente il significato, il ciclo di vita e lo stato di una relazione tra soggetti o tra un soggetto e un contesto, mai l'identità dei soggetti coinvolti | Nessuna identità di soggetto propria (o, per i domini informativo-relazionali, un'identità di contesto indipendente accanto alla relazione); referenzia i soggetti coinvolti tramite riferimento esterno opaco (§10, §11) | Riferimento opaco ai soggetti coinvolti; dipendenza verso altri domini relazionali per verifiche specifiche (es. titolo di rappresentanza) | Incorporazione di attributi o stati interni dei soggetti referenziati; duplicazione di ruoli o fatti già posseduti dai domini dei soggetti | **Appartenenze** (puramente relazionale); **Mercati Internazionali** (informativo e relazionale: possiede sia il Mercato come contesto geo-economico autonomo, sia la relazione soggetto↔mercato) | Collaborazioni (relazionale con componente applicativa, secondo la Dependency Map §9, non ancora confermata da un proprio mapping) |
| **Domini transazionali o di opportunità** | Possiedono un processo di incontro tra una domanda e un'offerta (annuncio, candidatura, esito), non i soggetti che vi partecipano né una relazione stabile tra essi | Il fatto posseduto è il processo, non l'identità né la relazione; tipicamente genera relazioni temporanee (R03) che possono, se il logico lo prevede, trasformarsi in relazioni storiche (R04) | Riferimento ai soggetti partecipanti per identità; riferimento a un dominio relazionale per verificare un titolo di rappresentanza quando la candidatura è presentata per conto di un'Impresa | Incorporazione della relazione strutturale che eventualmente ne deriva (che resterebbe di competenza del dominio relazionale proprietario) | — (nessun mapping fisico ancora approvato) | **Opportunità** (classificata "Applicativo/Relazionale" dalla Dependency Map §8, da confermare) |
| **Domini editoriali o di conoscenza** | Possiedono la rappresentazione narrativa, redazionale o analitica di un fatto o di un soggetto posseduto altrove, senza mai acquisirne l'ownership (P5, P10 di `domain-dependency-map.md`) | Referenziano il soggetto o il fatto narrato per identità; possiedono il proprio processo redazionale (VR01-VR06) e la propria pubblicazione, indipendenti dal ciclo di vita del soggetto narrato | Riferimento a qualunque altro dominio come soggetto raccontato o analizzato | Modifica o determinazione dei fatti operativi del dominio narrato; incorporazione della sua identità o del suo stato come proprio attributo | — (nessun mapping fisico ancora approvato; StoriaPersonale e StoriaImpresa sono referenziate come dipendenze in entrata da Persone e Imprese, non trattate come dominio proprio in questo documento) | **Contenuti Editoriali** (classificato "Editoriale" dalla Dependency Map §11, da confermare) |
| **Domini di supporto** | Forniscono capacità trasversali (accesso, autenticazione, autorizzazione tecnica) senza determinare il significato di business di alcun dominio servito (P8) | Applicano decisioni già prese da un dominio proprietario; non possiedono mai un fatto sostanziale di business | Applicazione di una decisione di accesso già presa da un dominio proprietario (S05, VIS02) | Determinazione della visibilità sostanziale (VIS04) o del significato di un ruolo di business (§17) | — (nessun mapping fisico ancora approvato) | **Identità & Accessi** (classificato "Di supporto" dalla Dependency Map §13, da confermare) |
| **Domini infrastrutturali** | Forniscono capacità puramente tecniche, prive di significato di business proprio | Nessun fatto di business posseduto; puramente strumentali | — | Qualunque acquisizione di proprietà sostanziale (P8, PV5 di questo documento) | — (nessun dominio di questa architettura, tra gli undici già riconciliati, è stato classificato come puramente infrastrutturale: anche Identità & Accessi possiede fatti di business propri, come le Deleghe e i Consensi, secondo `identita-accessi.md`) | Nessun caso attuale: categoria mantenuta per completezza dello schema, senza forzare alcun dominio esistente in essa |
| **Domini di pubblicazione o rappresentazione** | Rendono visibile, indicizzabile o consultabile un fatto posseduto altrove, senza trasferirne la proprietà (VIS04-VIS05) | Sovrapponibili, in parte, ai domini editoriali; si distinguono perché il loro compito è tipicamente la sola esposizione (ricerca, indicizzazione), non la produzione di un contenuto redazionale proprio | Riferimento a qualunque dominio come fonte pubblicabile | Alterazione del significato del dato pubblicato (§22) | — (nessun mapping fisico ancora approvato) | Una futura funzione di "Ricerca pubblica", già menzionata come destinataria di eventi osservabili in `persone.md` §10, `imprese.md` §18, `mercati-internazionali.md`, ma non ancora un dominio logico riconciliato: resta candidata, non anticipata |
| **Domini derivativi** | Possiedono indicatori, aggregazioni e metodologie derivate da fatti posseduti altrove, senza diventarne proprietari (P6, P9) | Dipendenza in lettura, mai in scrittura, verso tutti i domini sorgente; producono dati calcolati (D05) e aggregati (D06) | Lettura analitica di qualunque dominio sorgente | Scrittura o modifica dei dati sorgente; esposizione di un'aggregazione che permetta la reidentificazione di un singolo soggetto non altrimenti visibile (D06, `01` §13) | — (nessun mapping fisico ancora approvato) | **Osservatorio** (classificato "Osservativo" dalla Dependency Map §12, da confermare) |

**Perché "Fondazionale" e "Relazionale" sono le sole due categorie già doppiamente confermate.** Sono le uniche due categorie per cui questo documento dispone di almeno due Physical Domain Mapping indipendenti e di natura diversa che le confermano (Persone/Imprese per la prima; Appartenenze/Mercati Internazionali per la seconda). Le altre sei categorie riportano la classificazione già proposta dalla Dependency Map (che resta un documento vincolante per le proprie decisioni consolidate, §3) ma non hanno ancora un Physical Domain Mapping che le verifichi: questo documento le riporta esplicitamente come "da confermare", coerentemente con il divieto di anticipare decisioni sui domini non ancora progettati.

**Perché Mercati Internazionali non è classificato come "puramente relazionale".** A differenza di Appartenenze, che non possiede alcuna identità di soggetto propria, Mercati Internazionali possiede anche il Mercato come concetto informativo autonomo (un'area geo-economica con composizione, classificazioni e risorse di supporto proprie, `mercati-internazionali.md` §3-§8), la cui esistenza precede e non presuppone alcun soggetto dichiarante (`mercati-internazionali.md` §9, "un Mercato ha senso e continuità propria indipendentemente da qualunque Impresa, Persona o Professionista"). La qualificazione "Informativo/Relazionale" della Dependency Map (§3, §6) è quindi confermata da questo documento come corretta e non semplificabile a "Relazionale" tout court: un dominio relazionale può, senza contraddizione, possedere anche un catalogo di contesto proprio (PC-candidata, da verificare in eventuali futuri domini con la stessa struttura, §32).

---

## 8. Proprietà dei fatti di business

**PF1 — Single Owner (Fondazionale).** Ogni fatto di business rappresentato da un dominio ha esattamente un dominio proprietario, individuabile senza ambiguità (`01` §2 principio 1; `domain-dependency-map.md` P1). Nessuno dei quattro Physical Domain Mapping letti introduce, in nessun punto, un fatto "neutro" senza un dominio proprietario dichiarato: ogni tabella di nucleo persistente (`persone.md` §2, `imprese.md` §3, `appartenenze.md` §4, `mercati-internazionali.md` §4) include sempre una colonna "Dominio proprietario", mai omessa.

**PF2 — Nessuna duplicazione (Fondazionale).** Quando un dominio ha bisogno di un fatto posseduto da un altro dominio, lo referenzia per identità stabile, non lo copia (`01` §2 principio 2). I quattro mapping confermano questo principio nel modo più diretto possibile: Persone non possiede alcuna copia dei ruoli che le Appartenenze le attribuiscono; Imprese non possiede alcuna copia dei dati di Persone né duplica i ruoli di Appartenenze (`imprese.md` §9, "nessuno dei ruoli sopra elencati riceve... un proprio attributo persistente lato Impresa"); Appartenenze non duplica alcun dato descrittivo di Persone o Imprese (`appartenenze.md` §1, "Appartenenze non contiene né modifica alcun dato personale della Persona né alcun dato descrittivo... dell'Impresa"); Mercati Internazionali non duplica alcun dato descrittivo dei soggetti che referenzia in modo opaco (§10, §11).

**Sei verbi di dipendenza, confermati come esaustivi.** La Dependency Map distingue sei modi in cui un dominio può relazionarsi a un fatto non proprio: **possiede** (proprietà esclusiva del significato, delle invarianti, del ciclo di vita), **referenzia** (identifica o richiama senza acquisire proprietà), **utilizza** (consuma un dato già referenziato per una decisione locale, senza modificarlo), **deriva** (produce un dato nuovo da dati sorgente, mantenendo tracciabile l'origine), **aggrega** (combina più dati per una rappresentazione osservativa, senza diventarne proprietario), **pubblica** (rende visibile senza trasferire proprietà). I quattro Physical Domain Mapping non hanno introdotto un settimo verbo: ogni relazione tra un dominio e un fatto non proprio, in tutti e quattro i documenti, è sempre riconducibile a uno di questi sei (§9, §20).

**PF3 — Traccia obbligatoria a un paragrafo del logico (Fondazionale).** Ogni scelta di mapping deve essere riconducibile a un paragrafo specifico del documento logico corrispondente (`01` §2 principio 5). I quattro mapping applicano questo principio in modo identico: ogni riga di ogni tabella cita il paragrafo del proprio documento logico o della Dependency Map da cui discende. Questo documento eredita lo stesso obbligo per ogni regola che formalizza (§4).

**Differenza tra proprietà e utilizzo, confermata su un caso concreto.** Il caso più istruttivo tra i quattro mapping è l'Osservatorio (non ancora mappato) rispetto a Imprese: Imprese dichiara esplicitamente che l'Osservatorio "utilizza" (in lettura, mai scrittura) i propri dati sorgente per produrre Indicatori, senza mai diventare proprietario né dei dati sorgente né, a maggior ragione, dell'Impresa stessa (`imprese.md` §10, §16). Lo stesso principio è confermato in `persone.md` §9 e in `appartenenze.md` §20/§23. Questa distinzione — utilizzo senza proprietà, anche quando l'utilizzo è sistematico e a valle di molti domini — è **Consolidata** (§30, PC-osservatorio) come base del futuro dominio Osservatorio, senza per questo anticipare la sua struttura interna.

---

## 9. Aggregate e confini di proprietà

**Criteri per individuare un Aggregate, confermati identici nei quattro domini.** La procedura decisionale in cinque domande di `03` §3 ("È già l'Aggregate Root del dominio?", "Ha bisogno di essere referenziato individualmente?", "È interamente descritto dai propri attributi?", "Rappresenta un insieme di alternative?", "È ottenuto elaborando altri dati?") è applicata esplicitamente e nello stesso ordine da tutti e quattro i mapping (`persone.md` §13 Decisione 1-2, `imprese.md` §3/§6, `appartenenze.md` §4, `mercati-internazionali.md` §4). Nessuno dei quattro introduce una scorciatoia o un criterio aggiuntivo: **PC1 (Consolidata)**.

**Criteri per individuare l'Aggregate Root.** Un Aggregate Root è sempre il concetto che il documento logico del dominio individua come proprio centro di consistenza (`01` §3): Persona, Impresa, Appartenenza, e — punto rilevante confermato da Mercati Internazionali — non un solo Aggregate Root ma più Aggregate Root distinti appartenenti allo stesso dominio (il Mercato da un lato; Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale, Esigenza di internazionalizzazione dall'altro, ciascuno un proprio Aggregate Root, `mercati-internazionali.md` §4, §9). **PC2 (Consolidata): un dominio può possedere più di un Aggregate Root, purché ciascuno abbia una propria consistenza e un proprio confine, e la loro appartenenza allo stesso dominio proprietario resti dichiarata esplicitamente.** Questo pattern non era ancora stato osservato in Persone, Imprese o Appartenenze (ciascuno con un solo Aggregate Root); Mercati Internazionali lo introduce con una motivazione esplicita (§4, "Perché il Mercato non incorpora le relazioni d'uso come proprie Entity dipendenti"): evitare che la consistenza del Mercato dipenda da un numero enorme e mutevole di relazioni dichiarate.

**Proprietà esclusiva dei fatti di business.** Già formalizzata come PF1 (§8); qui si aggiunge il corollario applicato agli Aggregate: nessun Aggregate Root di un dominio può essere "annidato" dentro un altro Aggregate Root per comodità (`01` §3, principio 5), e nessuno dei quattro mapping lo fa: Appartenenza non è annidata né in Persona né in Impresa; Presenza/Interesse di mercato non sono annidate in Impresa (correzione esplicita rispetto alla lettura letterale di `imprese.md` §2, ratificata da `domain-dependency-map.md` §6 e da `mercati-internazionali.md` §9).

**Differenza tra proprietà e riferimento; tra utilizzo e dipendenza.** Già trattata al §8 per i sei verbi. Qui si aggiunge la precisazione, confermata identicamente nei quattro documenti, che un riferimento non autorizza mai a ridefinire il significato del fatto referenziato (`domain-dependency-map.md`, definizione "Riferimento"): Imprese referenzia l'Appartenenza ma non ridefinisce cosa significhi un "Titolare" (`imprese.md` §9); Mercati Internazionali referenzia l'Impresa dichiarante ma non ridefinisce cosa sia un'Impresa (§9, §19 di `mercati-internazionali.md`).

**Differenza tra dato incorporato e concetto autonomo.** I criteri di `01` §4-§5 (cardinalità, indipendenza del ciclo di vita, necessità di referenziabilità esterna, necessità di storicizzazione propria, frequenza di variazione) sono applicati identicamente nei quattro mapping per decidere se un concetto resta Value Object incorporato (VO01) o diventa Entity dipendente (E02): il caso più istruttivo, ricorrente in tre dei quattro domini con la stessa forma, è la coppia "dichiarazione singola + riferimento a catalogo condiviso" (CompetenzaDichiarata/LinguaParlata in Persone; SettoreImpresa/LinguaOperativaImpresa in Imprese; il vocabolario di Tipologia di attività in Mercati Internazionali, §7 di quel documento) — **PC3 (Consolidata): quando un dominio dichiara ripetutamente l'applicazione di un valore di catalogo condiviso, la singola dichiarazione è un'Entity dipendente (E02) con propria identità stabile e proprio ciclo Dichiarata→Rimossa, mai un Value Object che incorpora direttamente il valore di catalogo.**

**Differenza tra entità, value object, vocabolario condiviso e proiezione.** Confermata identicamente: un'Entity ha identità propria distinguibile anche a parità di attributi (E01-E04); un Value Object non ha identità propria (VO01-VO02); un vocabolario condiviso è posseduto da un unico dominio proprietario esterno e referenziato per identità (VO03+C02); una proiezione (§22) è una rappresentazione derivata che non trasferisce mai la proprietà. Nessuno dei quattro mapping confonde queste quattro forme: ogni tabella di "concetti incorporati" (`persone.md` §3, `imprese.md` §4, `appartenenze.md` §5) distingue esplicitamente cosa resta VO01 da cosa applica VO03, con motivazione dedicata.

**Divieto di duplicare lo stesso fatto autorevole in più domini.** Già PF2 (§8). Il caso limite osservato — e risolto correttamente in tutti e quattro i mapping — è la "vista di sintesi non normativa": un dominio può presentare, dal proprio punto di vista, una descrizione sintetica di un fatto posseduto da un altro dominio (AppartenenzaImpresa in `imprese.md` §2/§9, vista di sintesi di Appartenenza; il ciclo a sei stati di `imprese.md` §6 rispetto ai tre assi/nove stati di `appartenenze.md` §11), a condizione che dichiari esplicitamente quale documento resta la fonte autorevole. **PC4 (Consolidata): una vista di sintesi non normativa è ammessa quando dichiara esplicitamente, nello stesso punto in cui la presenta, quale dominio ne è la fonte autorevole, e non introduce alcuna regola che il dominio proprietario non abbia già stabilito.**

**Regole per l'uso di riferimenti esterni opachi.** Trattate in dettaglio al §10-§11, come corollario diretto della regola fondazionale sulla proprietà delle relazioni.

**Trattamento della cancellazione o indisponibilità del soggetto referenziato.** Trattato al §24: nessuno dei quattro mapping ammette che la cancellazione di un soggetto referenziato cancelli automaticamente una relazione storicamente valida (`imprese.md` §5, "l'identità dell'Impresa non dipende... anche quando nessuna Persona collegata ha un profilo pubblico"; `appartenenze.md` §12, indipendenza esistenziale di Persona e Impresa dalla relazione).

---

## 10. Proprietà delle relazioni

### 10.1 La regola fondazionale

**PF4 — Proprietà delle relazioni (Fondazionale, obbligatoria per tutta la piattaforma).**

> Una relazione di business autonoma appartiene al dominio che rappresenta la relazione, e non ai domini dei soggetti coinvolti.

Il dominio relazionale possiede, per intero e senza eccezione: la **semantica** della relazione; le sue **invarianti**; i **ruoli** delle parti; le **responsabilità** che ne derivano; gli **stati** (su tutti gli assi pertinenti, §12); il **ciclo di vita**; la **temporalità** (§13); le **verifiche** (§15); le **fonti** (§14); la **visibilità** (§16); lo **storico** (§13, §24); le **contestazioni** (§18); gli **eventi di dominio** che genera (§19).

I domini dei soggetti coinvolti mantengono esclusivamente la proprietà della propria **identità** e del proprio **modello interno** (attributi, stati interni, ciclo di vita interno): non possiedono, non incorporano e non ridescrivono in alcun modo la relazione, anche quando la citano dal proprio punto di vista come vista di sintesi non normativa (PC4, §9).

Il dominio relazionale referenzia i soggetti coinvolti esclusivamente tramite un **riferimento esterno opaco** (§11): non conosce e non deve mai dipendere da struttura interna, attributi, stati interni, ciclo di vita interno, modalità di persistenza o regole applicative del dominio referenziato.

**Casi di conferma.** Appartenenze possiede per intero la relazione tra una Persona e un'Impresa: ruolo, periodo, fonte, evidenza di verifica, autorizzazione gestionale (`appartenenze.md`, Regola fondamentale, §1-§4); referenzia Persona e Impresa esclusivamente per identità, senza mai incorporarne i dati (`appartenenze.md` §1, "Governa la relazione, non i soggetti collegati"). Mercati Internazionali possiede per intero la relazione tra un soggetto (Impresa, Persona, Professionista) e un Mercato — Presenza, Interesse, Attività internazionale, Relazione commerciale internazionale, Esigenza di internazionalizzazione — referenziando il soggetto dichiarante esclusivamente tramite un riferimento esterno opaco alla sua identità (`mercati-internazionali.md` §9, "il dominio possiede... referenziando il soggetto coinvolto tramite un riferimento esterno opaco alla sua identità... senza conoscerne i dettagli interni"). Entrambi i domini applicano la stessa formula, con le stesse parole concettuali, in modo del tutto indipendente l'uno dall'altro: questo è precisamente il tipo di ricorrenza che il metodo di questo documento (§4) richiede per la promozione a Fondazionale.

**Corollario immediato, già osservato nei due domini di conferma.** Un dominio relazionale può possedere anche un catalogo di contesto proprio, indipendente dai soggetti che vi si relazionano (il Mercato in Mercati Internazionali, §7); questo non contraddice la regola, perché il catalogo di contesto e la relazione restano due Aggregate Root distinti (PC2, §9) dello stesso dominio proprietario.

### 10.2 Quando una relazione merita un dominio autonomo

**Criteri positivi, confermati da Appartenenze e coerenti con Mercati Internazionali.** Una relazione merita un dominio relazionale autonomo quando presenta almeno una delle seguenti caratteristiche (`appartenenze.md` §3, criteri positivi, generalizzati qui come **PC5, Consolidata**): un significato relazionale proprio, non riducibile a un attributo descrittivo di uno dei soggetti; un ruolo o una qualificazione contestuale dichiarata; un periodo di decorrenza tracciato; uno stato autonomo su almeno uno degli assi indipendenti (§12); una fonte dichiarata (§14); la possibilità di essere sottoposta a verifica (§15); una regola di visibilità propria (§16); una responsabilità o un potere attribuito (§17); un evento di dominio proprio (§19); la possibilità di cessare senza che i soggetti collegati cessino (§24).

**Criteri negativi, confermati da Appartenenze e applicabili per analogia a ogni dominio relazionale futuro.** Una relazione non deve essere promossa a dominio autonomo quando si limita a: una menzione; un contatto occasionale; una partecipazione a un evento (senza una relazione strutturale sottostante); una collaborazione temporanea non strutturale; un accesso digitale; una citazione editoriale; un rapporto cliente-fornitore non previsto dal dominio logico; oppure quando sarebbe dedotta automaticamente da altri fatti senza una dichiarazione propria (`appartenenze.md` §3, criteri negativi; **PC6, Consolidata**, per coerenza diretta con il principio di non-automatismo già fondazionale, `domain-model.md` §1).

**Perché questi criteri sono Consolidati e non ancora Fondazionali.** A differenza della regola di ownership (PF4), i criteri positivi/negativi per *decidere se* promuovere una relazione a dominio autonomo sono oggi enunciati esplicitamente solo in `appartenenze.md` §3: Mercati Internazionali non ripete la stessa enumerazione, ma la sua pratica (distinguere Presenza da Interesse da Esperienza, ciascuna un proprio Aggregate Root con motivazione esplicita, §4/§11-§12 di quel documento) è coerente con essi. Non essendo stati enunciati come criterio esplicito in un secondo documento indipendente, restano Consolidati (applicabili salvo eccezione motivata) e non Fondazionali: un futuro dominio relazionale che li applichi con successo li farebbe salire di livello (§4).

### 10.3 Elementi obbligatori di ogni relazione posseduta da un dominio relazionale

| Elemento | Definizione | Conferma |
|---|---|---|
| **Relazione come fatto di business** | La relazione è essa stessa un fatto autonomo, non un sottoprodotto dell'esistenza dei soggetti | `appartenenze.md` §3 ("L'Appartenenza è per definizione un legame... mai un attributo incorporato"); `mercati-internazionali.md` §9 |
| **Soggetti partecipanti** | Sempre referenziati per identità stabile, mai incorporati (§11) | Entrambi i domini di conferma |
| **Ruoli delle parti** | Un catalogo di ruoli, locale al dominio relazionale (Elenco controllato C03), mai riutilizzato da un altro dominio relazionale con significato diverso (§23, PL4) | `appartenenze.md` §7 (undici Ruoli) |
| **Responsabilità** | Attribuite dal Ruolo o da un'Autorizzazione gestionale distinta (§17), mai automatiche | `appartenenze.md` §9 |
| **Direzione e reciprocità** | Dichiarate esplicitamente: la relazione può essere asimmetrica per natura (un soggetto aderisce, l'altro ospita) senza che questo la renda meno una relazione di prima classe | `appartenenze.md` §6, "Asimmetrica: la Persona aderisce al contesto, l'Impresa lo ospita" |
| **Cardinalità concettuale** | Sempre dichiarata esplicitamente (0..N per ciascuna parte, salvo vincoli di unicità specifici) | `appartenenze.md` §6; `mercati-internazionali.md` §11 |
| **Temporalità** | Decorrenza obbligatoria, fine facoltativa e apribile (§13) | Entrambi i domini di conferma |
| **Provenienza della dichiarazione** | Sempre distinta da Fonte ed Evidenza (§14) | `appartenenze.md` §14 |
| **Fonte** | V03, pattern locale al dominio relazionale (§14) | Entrambi i domini di conferma |
| **Verifica** | V01-V05, multidimensionale, mai un giudizio unico sulla relazione nel suo complesso (§15) | Entrambi i domini di conferma |
| **Visibilità** | Propria della relazione, indipendente dalla visibilità dei soggetti coinvolti (§16) | `appartenenze.md` §16; `mercati-internazionali.md` §18 |
| **Contestazione** | Pattern dedicato (§18), oggi modellato esplicitamente solo in Appartenenze | `appartenenze.md` §15 |
| **Cessazione** | Non elimina i soggetti collegati (§24) | Entrambi i domini di conferma |
| **Storico** | Conservato per default (§13) | Entrambi i domini di conferma |
| **Eventi della relazione** | Prodotti dal dominio relazionale, mai dai domini dei soggetti (§19) | Entrambi i domini di conferma |

### 10.4 Distinzioni obbligatorie tra forme di relazione

| Forma | Natura | Pattern | Esempio confermato |
|---|---|---|---|
| **Relazione strutturale** | Definisce il confine di un Aggregate: l'Entity dipendente non esiste senza l'Aggregate | R01 | Persona↔CompetenzaDichiarata; Impresa↔SedeImpresa |
| **Relazione operativa** | Un fatto di gestione quotidiana tra due Aggregate autonomi, senza costituire un vincolo organizzativo stabile | R02 | StoriaPersonale↔Impresa (contestuale, `persone.md` §4 R8) |
| **Relazione dichiarativa** | Una relazione la cui esistenza si fonda su una dichiarazione (D02) di una delle parti o di un terzo, non ancora verificata | R02/R07 + D02 | Appartenenza appena dichiarata, prima della verifica (`appartenenze.md` §11, stato "Dichiarata") |
| **Relazione verificata** | Una relazione dichiarativa su cui almeno un aspetto specifico ha ricevuto un esito di verifica positivo (V04) | R02/R07 + V01-V04 | Appartenenza con asse di verifica "Confermata" (`appartenenze.md` §11) |
| **Relazione editoriale o rappresentativa** | Il legame con cui un dominio editoriale rappresenta un soggetto o un fatto posseduto altrove, senza diventarne proprietario | VIS04 applicato da un dominio non proprietario | Non ancora confermata da un mapping fisico (Contenuti Editoriali, candidato, §32) |
| **Autorizzazione gestionale** | Un fatto di business distinto, mai un attributo automatico di un Ruolo relazionale (§17) | R06 | Autorizzazione gestionale di Appartenenze (`appartenenze.md` §4, §9) |
| **Semplice riferimento** | Nessuna relazione di prima classe: un dominio referenzia l'identità di un altro senza che il legame soddisfi alcuno dei criteri positivi del §10.2 | R01/R02 senza promozione a dominio autonomo | Imprese→Tassonomia condivisa per Settore (`imprese.md` §6) |

### 10.5 Valutazione di applicabilità futura (candidata, non anticipata)

Coerentemente con il divieto di anticipare decisioni sui domini non ancora progettati, questo documento non stabilisce se e come la regola fondazionale (PF4) si applicherà a Collaborazioni, Opportunità, Professionisti (qualora contenga relazioni autonome distinte dal semplice profilo), Eventi, Organizzazioni istituzionali, Immobiliare, Servizi o Finanziamenti. Si limita a segnalare, per ciascuno, l'indizio già presente nella Dependency Map o nei documenti logici, marcato esplicitamente come **da confermare** (§32, catalogo dei pattern candidati):

| Dominio futuro | Indizio già presente | Livello |
|---|---|---|
| Collaborazioni | Classificato "Relazionale/Applicativo" dalla Dependency Map (§9); possiede "esigenze e proposte di collaborazione e il loro possibile esito relazionale" | Candidata |
| Opportunità | Classificato "Applicativo/Relazionale" (§8); il fatto posseduto è il processo, non la relazione stabile — da verificare se genera una relazione autonoma distinta dal processo stesso | Candidata |
| Professionisti | Il Profilo professionale ha "caratteristiche fondazionali limitate" (§4 della Dependency Map): non è, di per sé, un dominio relazionale; un'eventuale relazione autonoma interna a Professionisti (es. tra Professionista e un ordine professionale) non è oggi modellata da alcun documento logico | Candidata, priorità bassa |
| Eventi | Possiede "l'evento... e la partecipazione ad essa" (§10); da verificare se la Partecipazione soddisfa i criteri positivi del §10.2 o resta una relazione temporanea (R03) senza promozione a dominio autonomo | Candidata |
| Organizzazioni istituzionali | Dominio non ancora riconciliato a livello logico (`reconciliation-report.md` §13); `appartenenze.md` §6 già anticipa, per analogia strutturale, che una futura relazione Persona↔Organizzazione o Impresa↔Organizzazione seguirebbe lo stesso pattern di Appartenenze | Candidata |
| Immobiliare, Servizi, Finanziamenti | Domini non ancora riconciliati a livello logico; nessun indizio specifico oltre alla loro citazione come "Servizi" nel Domain Model v1 (`reconciliation-report.md` §13) | Candidata, non ancora verificabile |

---

## 11. Identità e riferimenti esterni

**Le tre forme di identità confermate senza eccezioni nei quattro domini.** Identità interna/stabile, identità pubblica, identità temporanea (`01` §6) sono applicate identicamente: Persona (`persone.md` §5), Impresa (`imprese.md` §5), Appartenenza — la cui identità di relazione non deriva mai da quella di uno dei due soggetti collegati (`appartenenze.md` §10, "Vincolo esplicito. L'identità di uno dei due soggetti collegati non deve mai essere utilizzata come identità della relazione") — e ciascun Aggregate Root di Mercati Internazionali. **PF5 (Fondazionale, corollario diretto di `01` §6): l'identità stabile di una relazione non deriva mai, e non può mai derivare, dall'identità di uno dei soggetti che collega.**

**Identità temporanea: non ancora riscontrata, non ancora esclusa.** Nessuno dei quattro domini mappati modella un'identità che perde significato al termine di un processo limitato (`persone.md` §5, `imprese.md` §5, entrambi "non applicabile", dichiarato esplicitamente e non omesso). Questo documento non conclude che l'identità temporanea sia estranea all'architettura: la classifica come **candidata a comparire nei futuri domini con processi limitati nel tempo** (Opportunità: candidatura; Eventi: iscrizione/partecipazione; §32), poiché nessuno dei quattro casi disponibili aveva la natura di processo transitorio che la richiederebbe.

**Riferimento esterno opaco: formalizzazione del pattern, generalizzata dai due domini relazionali.** Già definito al §6 e alla base di PF4/PF5 (§10). Qui si aggiunge la precisazione operativa, comune ad Appartenenze e Mercati Internazionali: il riferimento opaco comprende **sempre e solo** l'identità stabile del soggetto referenziato, mai una sua proprietà descrittiva, mai un suo stato interno, mai l'esito di una sua verifica interna (che, se rilevante per la relazione, va referenziato a sua volta come fatto distinto e non incorporato: il caso della verifica del titolo di rappresentanza in Appartenenze, referenziata da Mercati Internazionali come "esito di una verifica", non come attributo interno di Appartenenze, `mercati-internazionali.md` §10, D9 di `domain-dependency-map.md`).

**Separazione tra identità di dominio e account di accesso.** Confermata identicamente: nessuno dei quattro domini incorpora né referenzia direttamente l'Account o l'identità digitale come parte del proprio modello (`persone.md` §5, "riguarda l'Account... dominio esterno"; `imprese.md` §5; `appartenenze.md` §21, relazione con Identità & Accessi trattata come dipendenza distinta, mai come parte del modello). **PF6 (Fondazionale, diretta applicazione di P8/P12 di `domain-dependency-map.md`): l'identità di un soggetto di business e l'identità digitale con cui accede alla piattaforma sono sempre concettualmente distinte; nessun dominio di business incorpora la seconda come proprio attributo.**

**Divieto di usare il modello interno di un altro dominio come parte del proprio.** Corollario diretto di PF5: nessuno dei quattro mapping introduce, come proprio Value Object o come propria Entity, una copia strutturale di un concetto di un altro dominio (§9, PF2). Ogni riferimento è sempre per identità (R01/R02), mai per struttura.

**Identità editoriale.** Non ancora confermata da alcuno dei quattro mapping (nessuno dei quattro è un dominio editoriale): resta **candidata**, da verificare quando Contenuti Editoriali riceverà il proprio Physical Domain Mapping (§32).

---

## 12. Stati e assi indipendenti

**Il principio, confermato senza eccezioni.** Nessuno dei quattro mapping comprime due assi di stato distinti in un unico valore (`01` §9, `02` §7, `03` §6, RC16). Ogni mapping applica la stessa procedura: percorrere gli otto assi già catalogati (S01-S08) e dichiarare esplicitamente, per ciascuna Entity, se si applica o no, con motivazione (`persone.md` §6, `imprese.md` §11, `appartenenze.md` §11, `mercati-internazionali.md` §15). **PF7 (Fondazionale, diretta applicazione di RC16): un singolo stato complessivo non deve mai assorbire dimensioni semanticamente indipendenti; ogni asse applicabile secondo il documento logico resta distinto nel mapping fisico, indipendentemente dal fatto che, in un dato dominio, più assi covariino sempre insieme nella pratica corrente.**

**Assi effettivamente ricorrenti nei quattro domini.**

| Asse | Persone | Imprese | Appartenenze | Mercati Internazionali | Conferma |
|---|---|---|---|---|---|
| S01 Stato sostanziale | Sì (Attiva/Inattiva-Sospesa/Cancellata) | Sì (Attiva/Cessata) | Implicito nello stato della relazione (asse 2 di 3) | Sì (dichiarata/attiva/cessata per ciascun Aggregate Root d'uso) | Ricorrente in tutti e quattro |
| S02 Stato editoriale | Sì (Registrata→Completo) | Sì (Bozza/Incompleta/Completa) | Sì (Proposta/Dichiarata, asse 1 di 3) | Non trattato come asse distinto | Ricorrente in tre su quattro |
| S03 Stato di verifica | Non applicabile (nessuna Verifica propria) | Sì, multidimensionale | Sì, sette assi indipendenti | Sì | Variante legittima: un dominio fondazionale può non possedere alcuna Verifica propria (locale a Persone, §33, PL2) |
| S04 Stato di pubblicazione | Sì | Sì, con sei condizioni cumulative | Sì (uno dei sei livelli di visibilità) | Sì | Ricorrente in tutti e quattro |
| S05 Stato di accesso | Non trattato (di competenza IA) | Non trattato (di competenza IA) | Non trattato (di competenza IA) | Non trattato (di competenza IA) | Ricorrente: nessun dominio di business tratta S05 in prima persona |
| S06 Stato di sicurezza | Non applicabile | Non applicabile | Non applicabile | Non applicabile | Ricorrente: nessuno dei quattro possiede un proprio fatto di sicurezza tecnica |
| S07 Stato amministrativo | Sì (origine della sospensione) | Sì (origine di revisione/sospensione) | Implicito nelle contestazioni (§18) | Non trattato come asse distinto | Ricorrente in tre su quattro |
| S08 Stato storico | Sì | Sì | Sì | Sì | Ricorrente in tutti e quattro, senza eccezione |

**Quando gli assi devono rimanere separati.** Sempre, per PF7: nessuna eccezione è stata riscontrata o è ammissibile senza una revisione di questo stesso documento.

**Quando possono essere derivati.** Uno stato può essere il risultato derivato della combinazione di più condizioni autonome (§16, principio della condizione cumulativa): S04 in Imprese è la conseguenza del soddisfacimento simultaneo di sei condizioni indipendenti (`imprese.md` §9), non un asse dichiarato direttamente. Questo non viola PF7: la derivazione stessa è dichiarata esplicitamente, e le condizioni sorgente restano distinte.

**Quali combinazioni sono incompatibili.** Nessuno dei quattro mapping dichiara stati incompatibili in modo esplicito come regola a priori; l'unica regola trasversale osservata è che uno stato terminale (Cancellata per Persona, Rimossa per una singola dichiarazione, Cessata per un'Appartenenza) non può coesistere con una rappresentazione come "attuale" (`imprese.md` §10, regola 6-7; `appartenenze.md` §12, regola 9). **PC7 (Consolidata): uno stato terminale di un asse è sempre incompatibile con qualunque rappresentazione che presenti il fatto come attuale o operativo, indipendentemente dal valore degli altri assi.**

**Come evitare stati onnivori o ambigui.** Confermato dall'anti-pattern "fusione impropria di stati" (`03` §14, PV3 §26): nessuno dei quattro mapping introduce un valore composito (per esempio "pubblicato-ma-non-verificato"). Il segnale d'allarme esplicitamente verificato in `persone.md` §6.4 e `imprese.md` §11.5 ("nessuna Entity richiede più assi indipendenti simultaneamente di quanti già catalogati") è **Consolidata (PC8)**: ogni futuro Domain Mapping deve condurre la stessa verifica esplicita.

**Differenza tra stato autorevole e stato derivato.** S01-S03, S07 sono sempre stati autorevoli, dichiarati direttamente dal dominio proprietario; l'Affidabilità (V05, §15) è sempre derivata, non uno stato persistente a sé. Confermato identicamente in Imprese (§12, "l'Affidabilità... non è mai un valore unico calcolato e memorizzato come giudizio complessivo") e coerente con Persone/Appartenenze/Mercati Internazionali, che non introducono alcun equivalente persistente.

---

## 13. Temporalità e storico

**I sette pattern di Temporalità, applicati con selettività motivata, non in blocco.** Nessuno dei quattro mapping applica tutti i sette pattern T01-T07 a ogni entità: ciascuno dichiara esplicitamente quali si applicano e quali no, con motivazione (`persone.md` §8, `imprese.md` §14, `appartenenze.md` §12, `mercati-internazionali.md` §17-§20 equivalenti). **PC9 (Consolidata): l'assenza di un pattern di Temporalità per una data Entity va sempre dichiarata esplicitamente con motivazione, mai omessa; l'applicazione di tutti i sette pattern a ogni entità senza distinzione è essa stessa un segnale di applicazione impropria del catalogo.**

**Intervallo aperto e chiuso.** Confermato identicamente: ogni relazione posseduta da un dominio relazionale ha una Decorrenza obbligatoria (T03) e una fine facoltativa e apribile (T05 con Scadenza T04 opzionale), mai una Decorrenza senza inizio dichiarato (`appartenenze.md` §12, "Decorrenza obbligatoria, fine facoltativa e apribile"; `mercati-internazionali.md` equivalente). **PC10 (Consolidata).**

**Data di dichiarazione, di verifica, di pubblicazione, di cessazione.** Sempre distinte, mai fuse in una sola data "ultima modifica" (RC22, coerente con l'anti-pattern "fusione impropria di stati" applicato alla dimensione temporale): confermato in tutti e quattro i mapping, ciascuno con la propria tabella dedicata a T01-T07.

**Successione delle versioni; correzione; revoca; sospensione; riattivazione.** Il pattern Versione (VR01-VR06) si applica solo dove il documento logico prevede una vera redazione: StoriaPersonale in Persone (VR01/VR02/VR05/VR06), nessun'altra Entity di Persone; nessuna Entity di Imprese lo applica in forma piena (il ciclo di CertificazioneImpresa applica Scadenza/T04 e Annullamento, non Rettifica); Appartenenze e Mercati Internazionali non applicano il pattern Versione alle proprie relazioni (che si evolvono per nuova dichiarazione e conclusione, non per redazione). **Variante legittima, non un'incoerenza: il pattern Versione si applica solo ai fatti che hanno una vera dimensione redazionale (un testo, una presentazione), non a ogni fatto che cambia nel tempo.**

**Conservazione dello storico: regola di default confermata senza eccezioni.** `03` §8 impone la conservazione più completa in assenza di indicazione contraria: tutti e quattro i mapping la applicano esplicitamente (`persone.md` §13 Decisione 7, `imprese.md` §14, `appartenenze.md` §12 regola 5, `mercati-internazionali.md` equivalente). **PF8 (Fondazionale, diretta applicazione di `01` §8 e `03` §8): in assenza di un'indicazione contraria esplicita nel documento logico, ogni fatto rilevante di un dominio è storicizzato per default con la conservazione più completa (l'intera condizione precedente), non la più economica (solo il fatto della transizione).**

**Divieto di sovrascrivere fatti storicamente rilevanti.** Corollario diretto di PF8: nessuno dei quattro mapping introduce una sostituzione che elimini la traccia della condizione precedente (`imprese.md` §14, "mai una sostituzione che elimini la traccia della dichiarazione precedente").

**Distinzione tra cronologia di dominio e audit tecnico.** Nessuno dei quattro mapping introduce, né potrebbe introdurre secondo il divieto di contenuto implementativo, un concetto di "audit tecnico" (log di sistema, tracciamento infrastrutturale): la Cronologia (T06) e la Storia (T07) restano sempre concetti di significato di business, distinti da qualunque log tecnico che le fasi successive (schema fisico, migrazioni) potranno introdurre. **PF9 (Fondazionale): la cronologia di dominio (T06/T07/S08/D08, un fatto di significato di business) è sempre concettualmente distinta da un eventuale audit tecnico (un fatto infrastrutturale, fuori dal perimetro di ogni documento di questo livello); nessun Domain Mapping deve fondere le due nozioni.**

**Quando un fatto deve essere mutabile, versionato, cessato, sostituito, conservato come evidenza storica.**

| Condizione | Trattamento | Conferma |
|---|---|---|
| Il fatto ha una dimensione redazionale (testo, presentazione) | Versionato (VR01-VR06) | StoriaPersonale |
| Il fatto è una dichiarazione singola con propria identità stabile | Mutabile solo per nuova dichiarazione + rimozione della precedente, mai per modifica in luogo | CompetenzaDichiarata, LinguaParlata, SettoreImpresa |
| Il fatto è una relazione | Cessata (non sostituita): una nuova relazione con lo stesso Ruolo richiede una nuova Appartenenza, non una modifica della precedente (`appartenenze.md` §12, regola 4, "successione dei ruoli tramite conclusione e nuova dichiarazione, non modifica in luogo") | Appartenenze |
| Il fatto ha un limite temporale previsto | Soggetto a Scadenza (T04), distinta da un Annullamento deliberato | CertificazioneImpresa |
| Il fatto è concluso, per qualunque causa | Sempre conservato come evidenza storica (S08/T07/D08), mai distrutto, salvo la questione aperta su una futura cancellazione fisica (§24, §34) | Tutti e quattro i domini |

---

## 14. Dichiarazioni, fonti ed evidenze

**Fonte (V03) come pattern locale, mai un'entità condivisa tra domini.** Confermato identicamente nei quattro mapping e già stabilito in `reconciliation-report.md` §3.2/§7: ogni dominio possiede la propria nozione di Fonte, ripetuta per ciascuna informazione dichiarata, non un'unica entità "Fonte" condivisa da più domini. **PC11 (Consolidata, già Fondazionale per derivazione da un principio di `02` §8, qui confermata empiricamente in Imprese, Appartenenze, Mercati Internazionali).**

**Distinzioni tra provenienze, mappate sui quattro domini.**

| Provenienza | Definizione | Dove è confermata |
|---|---|---|
| Dichiarazione del soggetto interessato | Il soggetto della relazione o del fatto dichiara direttamente (D02) | Persone (attributi propri); Imprese (dati aziendali); Appartenenze (autodichiarazione) |
| Dichiarazione di un soggetto collegato | Una delle due parti di una relazione dichiara per conto della relazione stessa, o l'altra parte dichiara un fatto che la coinvolge | Appartenenze (`appartenenze.md` §14, "dichiarazione dell'Impresa" come una delle tipologie di Fonte) |
| Acquisizione editoriale | Un dominio editoriale acquisisce un'informazione per la propria narrazione | Non ancora confermata da un mapping fisico (Contenuti Editoriali, candidata) |
| Fonte istituzionale | Un'informazione proviene da un registro pubblico o da un ente terzo riconosciuto | Appartenenze (`appartenenze.md` §14, "importazione da registro pubblico"); Imprese (verifica dei dati aziendali, §12) |
| Fonte documentale | Un documento (DOC01-DOC05) supporta la dichiarazione | Imprese (CertificazioneImpresa, §17) |
| Fonte pubblica | Un'informazione proviene da una fonte accessibile pubblicamente, non da una dichiarazione diretta | Non esplicitamente distinta come categoria separata in nessuno dei quattro mapping: resta una specializzazione non ancora catalogata (candidata, §32) |
| Inferenza | Un fatto dedotto da altri fatti, senza essere stato dichiarato direttamente | Esplicitamente esclusa come base di una relazione (§10.2, criteri negativi: "sarebbe dedotta automaticamente da altri fatti senza una dichiarazione propria") |
| Importazione da fonte esterna | Un processo non ancora modellato in alcuno dei quattro domini (`imprese.md` §16, "nessun processo di importazione automatica è descritto") | Non applicabile nei quattro mapping; questione aperta (§34) |
| Evidenza di verifica | L'elemento concreto che sostiene l'esito di una Verifica (V02), distinto dalla Fonte | Appartenenze (Entity dedicata, `appartenenze.md` §4); Imprese (Documento a supporto, §17) |

**PV11 (Vietato, già stabilito): un'inferenza non deve mai essere rappresentata come un fatto dichiarato (D02) o come un fatto verificato (D03).** Nessuno dei quattro mapping introduce un'eccezione a questo divieto, coerente con il principio di non-automatismo (`domain-model.md` §1) applicato in ciascuno dei quattro documenti in almeno un punto esplicito.

**Provenienza, attribuzione, affidabilità, datazione, verificabilità, revocabilità.** Confermate come attributi sempre distinti della Fonte, mai fusi in un giudizio unico: Appartenenze tratta esplicitamente la Fonte come Value Object incorporato con una tipologia (Elenco controllato) distinta dall'Evidenza e dalla Verifica (`appartenenze.md` §5, §14); Imprese distingue esplicitamente Fonte (V03), Documento (DOC01-05) ed Evidenza (V02, quando di natura documentale, DOC03) come tre concetti separati (`imprese.md` §12, §17).

**Conflitto tra fonti; prevalenza o coesistenza.** Confermato solo in Appartenenze come pattern esplicito (`appartenenze.md` §15, "conflitto tra fonte istituzionale e dichiarazione privata" tra i pattern comuni da definire per le contestazioni): resta **candidato** per gli altri domini relazionali, poiché Mercati Internazionali non tratta esplicitamente un caso di conflitto tra fonti nel proprio documento (§18, §32).

---

## 15. Verifica

**Verifica come concetto multidimensionale, mai un giudizio complessivo — confermato senza eccezioni.** Nessuno dei quattro mapping introduce un badge generico. `persone.md` §7 dichiara esplicitamente l'assenza di qualunque Verifica propria del dominio (una variante legittima, non un'eccezione alla regola: un dominio può semplicemente non possedere alcuna Verifica, §33 PL2); `imprese.md` §12 possiede sette aspetti verificati distinti, ciascuno nominato; `appartenenze.md` §13 possiede sette assi di verifica indipendenti; `mercati-internazionali.md` possiede una propria tassonomia coerente con quella consolidata. **PF10 (Fondazionale, già stabilita da `01` §10 e `02` §8, qui riconfermata senza eccezione su quattro casi indipendenti, incluso un caso di assenza totale che non contraddice la regola ma la conferma per assenza di violazione).**

**Distinzione tra verifica e...**

| Concetto da cui la Verifica è distinta | Come si manifesta la distinzione | Conferma |
|---|---|---|
| Verità assoluta | Un dato "Autodichiarato" resta un dato legittimo, non un dato falso in attesa di conferma (`imprese.md` §12, riga 1, "Non verificata / Autodichiarata / Verificata" come tre valori legittimi, non una scala di verità) | Imprese, Appartenenze |
| Pubblicazione | La pubblicazione non richiede verifica come precondizione unica (Imprese pubblica anche senza aver verificato tutti gli aspetti, §15 di `imprese.md`) | Imprese |
| Approvazione editoriale | Non ancora confermata da un mapping fisico (Contenuti Editoriali, candidata); anticipata come principio in `domain-model.md` §13 decisione 18 ("un contenuto non modifica automaticamente i fatti che descrive") | Candidata |
| Autorizzazione gestionale | Esplicitamente distinta: "la facoltà di gestione non prova la rappresentanza legale reale" (`imprese.md` §7 principio cardine; `appartenenze.md` §9) | Imprese, Appartenenze |
| Visibilità | Un fatto non verificato può comunque essere visibile, se le condizioni cumulative di pubblicazione (§16) non richiedono la verifica come condizione | Imprese (§15) |
| Esistenza della relazione | Una relazione dichiarata esiste (come fatto D02) indipendentemente dal fatto che sia già stata verificata (`appartenenze.md` §11, stato "Dichiarata" distinto da "Confermata") | Appartenenze |

**Oggetto verificato, soggetto verificatore, metodo, evidenza, esito, livello, ambito, validità temporale, scadenza, revoca, contestazione, nuova verifica.** Ogni riga della tassonomia di verifica nei quattro mapping dichiara sempre l'oggetto e, quando applicabile, la fonte/evidenza/esito distinti (RC20, §7 di `03`): confermato senza eccezioni.

**PF11 (Fondazionale, diretta applicazione di RC21): verifiche differenti che riguardano aspetti diversi dello stesso Aggregate non devono mai essere fuse in un unico esito, né presentate come se dovessero condividere la stessa data o lo stesso risultato.** Confermato esplicitamente in Imprese (§12, sette righe indipendenti) e in Appartenenze (§13, sette assi indipendenti).

**I 15 tipi di verifica della tassonomia consolidata, e quali sono confermati dai quattro domini fisici.**

| Tipo (da `reconciliation-report.md` §9.1) | Confermato da un Physical Domain Mapping | Dominio |
|---|---|---|
| Esistenza | Sì | Imprese, Mercati Internazionali |
| Identità | Sì (per riferimento, non posseduta) | Persone (riferita a IA), Imprese (riga 3, riferita a IA/Persone) |
| Contatto | No | — (candidata per Identità & Accessi) |
| Documentale | Sì | Imprese (Certificazioni) |
| Fonte | Sì | Mercati Internazionali, Contenuti editoriali (candidata) |
| Relazione | Sì | Appartenenze |
| Rappresentanza | Sì | Appartenenze, Mercati Internazionali (per referenza) |
| Professionale | No | — (candidata per Professionisti) |
| Editoriale | No | — (candidata per Contenuti Editoriali) |
| Metodologica | No | — (candidata per Osservatorio) |
| Disponibilità | No | — (candidata per Professionisti/Eventi) |
| Partecipazione | No | — (candidata per Eventi) |
| Delega | No | — (candidata per Identità & Accessi) |
| Consenso | No | — (candidata per Identità & Accessi) |
| Qualità del dato | No | — (candidata per Osservatorio) |

**Nessuna nuova tipologia introdotta.** I sette aspetti verificati di Imprese e i sette assi di Appartenenze, così come le verifiche di Mercati Internazionali, corrispondono tutti a specializzazioni delle tipologie già censite: nessuno dei quattro mapping ha richiesto un'estensione della tassonomia consolidata (RC18, §7 di `03`).

---

## 16. Visibilità e pubblicazione

**Le sei forme di Visibilità (VIS01-VIS06), applicate con la stessa gerarchia concettuale in tutti e quattro i domini.** Esistenza (VIS01) sempre indipendente dalla Pubblicazione (VIS04); Accessibilità (VIS02) sempre di competenza di Identità & Accessi, mai del dominio proprietario in prima persona (§17); Consultabilità (VIS03) sempre subordinata all'Accessibilità; Indicizzazione (VIS05) distinta dalla semplice Consultabilità; Riservatezza (VIS06) come alternativa esplicita e non residuale alla Pubblicazione.

**PF12 (Fondazionale, il principio della condizione cumulativa, diretta applicazione di VIS04 e confermata identicamente da Persone e Imprese): un fatto o una relazione è pubblicamente rappresentabile solo quando tutte le condizioni autonome richieste dal proprio dominio logico risultano soddisfatte simultaneamente; nessuna condizione singola, da sola, autorizza la pubblicazione.** Imprese enumera esplicitamente sei condizioni cumulative (stato editoriale compatibile, stato operativo compatibile, assenza di archiviazione impropria, qualità minima, presenza di un referente responsabile, assenza di blocco per moderazione — `imprese.md` §15); Persone applica lo stesso principio con un numero minore di condizioni (S02 completo + S01 attivo, §6.1 di `persone.md`); Appartenenze applica sei livelli di visibilità governati dalle stesse logiche cumulative (`appartenenze.md` §16); Mercati Internazionali applica lo stesso principio alle proprie relazioni (§18 di quel documento).

**Analisi delle componenti della condizione cumulativa, mappate sui quattro domini.**

| Componente | Persone | Imprese | Appartenenze | Mercati Internazionali |
|---|---|---|---|---|
| Volontà del soggetto | Implicita nella richiesta di pubblicazione | Implicita (chi gestisce la scheda avvia la pubblicazione) | Implicita nella dichiarazione | Implicita nella dichiarazione |
| Autorizzazione | Non applicabile (Persona gestisce sempre se stessa) | Sì (chi ha facoltà di gestione, da Appartenenze) | Sì (Autorizzazione gestionale, §17) | Referenziata (titolo di rappresentanza, D9) |
| Verifica | Non richiesta (nessuna Verifica propria) | Non è condizione esplicita di pubblicazione (una scheda può essere pubblica senza essere verificata) | Condizione per lo stato "Confermata", non per la sola esistenza | Non trattata come condizione bloccante esplicita |
| Approvazione editoriale | Sì (per StoriaPersonale, processo di revisione) | Implicita nella condizione "moderazione" | Non applicabile | Non applicabile |
| Validità temporale | Implicita nello stato sostanziale | Sì (impresa cessata non presentabile come attiva) | Sì (relazione conclusa non presentabile come attuale) | Sì |
| Assenza di sospensione/contestazione bloccante | Sì (S07) | Sì (S07, moderazione) | Sì (visibilità subordinata alla contestazione, `appartenenze.md` §12 regola 8) | Coerente per estensione |
| Protezione dei dati personali | Non trattata esplicitamente come condizione distinta nei quattro mapping (rinviata a un futuro dominio Privacy, §24, §35) | Come sopra | Come sopra | Come sopra |
| Oscuramento selettivo | Non modellato esplicitamente | Coincide con "Sospesa" (nessun termine distinto, `imprese.md` §15) | Uno dei sei livelli (§16) | Non modellato esplicitamente |
| Revoca della visibilità senza cancellazione del fatto | Sì (Sospesa ≠ Cancellata) | Sì (Sospesa ≠ Archiviata) | Sì | Sì |

**Chi decide, chi applica — confermato senza eccezioni.** In tutti e quattro i domini, la decisione sostanziale di cosa sia pubblico appartiene sempre al dominio proprietario del fatto; l'applicazione tecnica dell'accesso appartiene sempre a Identità & Accessi, mai il contrario (`02` §15, decisione 9; confermato esplicitamente in `imprese.md` §15, "Identità & Accessi applica, non decide, la visibilità sostanziale... qui confermata senza eccezioni per il dominio Imprese"). **PF13 (Fondazionale): nessun dominio di business deve mai delegare a Identità & Accessi la decisione su cosa debba essere pubblico o riservato; Identità & Accessi non deve mai acquisire questa decisione, limitandosi sempre alla sua applicazione tecnica per soggetto.**

---

## 17. Autorizzazione gestionale

**Distinzioni obbligatorie, confermate esplicitamente da Imprese e Appartenenze.**

| Distinzione | Principio | Conferma |
|---|---|---|
| Essere parte di una relazione ≠ avere un'Autorizzazione gestionale | Un Ruolo relazionale (Titolare, Socio) non attribuisce automaticamente la facoltà di gestire una scheda | `appartenenze.md` §4, "Gestore della scheda" come Ruolo cumulabile ma distinto; `imprese.md` §7 |
| Rappresentare legalmente ≠ avere responsabilità operative | La rappresentanza legale (R06) e la responsabilità operativa (un Ruolo come Dirigente) sono assi indipendenti | `appartenenze.md` §7, tabella dei Ruoli, colonna "Cumulabilità" |
| Essere referente ≠ poter modificare una scheda | Il Ruolo "Referente" è cumulabile con qualunque altro, ma non implica di per sé l'Autorizzazione gestionale | `appartenenze.md` §7 |
| Poter modificare una scheda ≠ poter pubblicare | Nessuno dei quattro mapping fonde questi due poteri in un unico concetto: la pubblicazione resta condizionata dalla condizione cumulativa (§16), non dalla sola Autorizzazione gestionale | `imprese.md` §15 |
| Poter pubblicare ≠ poter verificare | La Verifica (§15) è sempre un fatto distinto, con soggetto verificatore proprio, mai lo stesso soggetto che pubblica per definizione | Coerente in tutti e quattro i domini |
| Poter verificare ≠ poter moderare | La moderazione è "una funzione trasversale, non un dominio di business proprio" (`imprese.md` §15), distinta da qualunque Verifica di dominio | `imprese.md` §15 |

**PF14 (Fondazionale, diretta applicazione del principio cardine di `imprese.md` §7 e di R06 di `02` §6, confermata indipendentemente da Appartenenze): un ruolo di business non attribuisce mai automaticamente un privilegio applicativo; la facoltà di intervenire su una rappresentazione di un soggetto (Autorizzazione gestionale, R06) è sempre un fatto distinto, esplicito, modulabile e revocabile indipendentemente dal Ruolo che l'ha originata.**

**Identità & Accessi supporta, non possiede.** Confermato da entrambi i domini che referenziano esplicitamente questa distinzione (`imprese.md` §5/§9, "Identità & Accessi applica il significato di business della facoltà di gestione, non lo definisce"; `appartenenze.md` §21). Coerente con PF6 (§11) e P8 (`domain-dependency-map.md`).

---

## 18. Contestazioni e conflitti

**Stato dell'evidenza: un solo dominio con modellazione esplicita completa.** Tra i quattro mapping, solo Appartenenze possiede una sezione dedicata e completa alle contestazioni e ai conflitti (`appartenenze.md` §15): dichiarazioni contrastanti, contestazione della relazione, del ruolo, della fonte, della verifica, duplicazione, impersonificazione, rappresentanza non autorizzata, sovrapposizioni temporali, conflitto tra fonte istituzionale e dichiarazione privata, sospensione cautelativa, rettifica, risoluzione, conservazione dello storico. Mercati Internazionali tratta la contestazione come un valore dell'asse di stato (coerente con il pattern generale, ma senza un catalogo altrettanto articolato); Persone e Imprese trattano la contestazione solo come componente di S07 (stato amministrativo) o come "profilo sospetto o contestato" (`imprese.md` §12, riga 7), senza un catalogo dedicato.

**Perché questo pattern resta Candidato e non Consolidato per l'intera piattaforma.** Applicando rigorosamente il metodo del §4: un solo dominio con modellazione esplicita completa non soddisfa il criterio di ricorrenza in almeno due domini indipendenti. Il pattern di Appartenenze deriva però direttamente da principi già fondazionali (non-automatismo, storicizzazione obbligatoria, `01` §1/§8): questo lo qualifica come **PCa1 (Candidata, con probabilità elevata di consolidamento)**, non ancora Consolidata, in attesa che un secondo dominio relazionale (Mercati Internazionali non lo tratta con lo stesso dettaglio, Collaborazioni non è ancora mappato) lo confermi con la stessa struttura.

**Pattern comune proposto, in attesa di seconda conferma.**

| Elemento | Definizione | Fonte |
|---|---|---|
| Dichiarazioni contrastanti | Due dichiarazioni sullo stesso fatto, incompatibili tra loro | `appartenenze.md` §15 |
| Contestazione della relazione | Il fatto stesso della relazione è messo in dubbio | `appartenenze.md` §15 |
| Contestazione del ruolo | Il Ruolo dichiarato è messo in dubbio, non l'esistenza della relazione | `appartenenze.md` §15 |
| Contestazione della fonte | L'origine dell'informazione è messa in dubbio | `appartenenze.md` §15 |
| Contestazione della verifica | L'esito di una Verifica è messo in dubbio | `appartenenze.md` §15 |
| Duplicazione della dichiarazione | Due dichiarazioni discordanti sullo stesso fatto, trattato come "Dichiarazioni discordanti" da `appartenenze.md` §15 (non un termine distinto nel documento) | `appartenenze.md` §15, per assimilazione a "Dichiarazioni discordanti" — riformulazione terminologica di questo documento, non citazione letterale |
| Impersonificazione | Un soggetto dichiara di essere un altro soggetto | Non modellata esplicitamente da alcuno dei quattro mapping come proprio scenario di contestazione: il caso più vicino è l'asse di verifica "Identità" (`appartenenze.md` §13), che accerta che una Persona sia davvero chi dichiara di essere. Riportata qui solo perché richiesta esplicitamente dal mandato di questo documento, non perché confermata da un mapping: **resta candidata (PCa1), non ancora evidenziata da alcun caso reale** |
| Rappresentanza non autorizzata | Un soggetto agisce senza il titolo per farlo | `appartenenze.md` §15, "Rappresentanza non riconosciuta"; coerente con `imprese.md` §7 |
| Sovrapposizioni temporali | Due fatti con periodi di validità incompatibili | `appartenenze.md` §15 |
| Conflitto tra fonte istituzionale e dichiarazione privata | Due fonti di diversa natura in disaccordo | `appartenenze.md` §15 (§14 di questo documento) |
| Sospensione cautelativa | Una condizione di attesa, distinta dalla conclusione definitiva | `appartenenze.md` §15; coerente con S07 in Persone/Imprese |
| Rettifica | VR03, applicata al fatto contestato quando risolto con una correzione | `02` §9 |
| Risoluzione | L'esito che chiude la contestazione | `appartenenze.md` §15 |
| Conservazione dello storico | La contestazione stessa, e la sua risoluzione, restano parte della storia del fatto (§13) | `appartenenze.md` §15, coerente con PF8 |

---

## 19. Eventi di dominio

**Conferma unanime: ogni evento rappresenta un fatto già avvenuto.** Nessuno dei quattro mapping introduce un evento espresso come comando o intenzione: ogni evento è nominato al participio passato o in forma equivalente (`persone.md` §10, `imprese.md` §18, `appartenenze.md` §22, `mercati-internazionali.md` §24 equivalente). **Riconferma di PF10 già enunciata in `01` §12 e `02` §10, qui verificata su un quarto e un quinto caso indipendente senza eccezioni: PF15 (Fondazionale).**

**Differenza tra evento di dominio e operazione tecnica.** Confermata: nessuno dei quattro mapping descrive code, broker, webhook o meccanismi di propagazione (`imprese.md` §18, "nessuna coda, webhook, notifica... la colonna... indica solo la rilevanza concettuale"). Coerente con il divieto trasversale di contenuto implementativo.

**Responsabilità del dominio che lo emette.** Ogni evento è sempre attribuito a un solo dominio proprietario, anche quando un altro dominio lo riporta per la propria rilevanza dal proprio punto di vista: il caso più istruttivo è `AppartenenzaDichiarata`/`AppartenenzaVerificata`/`AppartenenzaContestata`, elencati sia in `imprese.md` §18 sia in `appartenenze.md` §22, con `imprese.md` che dichiara esplicitamente "la loro produzione effettiva appartiene all'Aggregate Appartenenza" (`imprese.md` §18). **PC12 (Consolidata): un evento può essere citato per completezza informativa nel documento di mapping di un dominio che lo riceve come rilevante, ma la sua proprietà resta sempre del documento di mapping del dominio che lo genera, e va dichiarata esplicitamente in entrambi i punti.**

**Riferimenti minimi, temporalità, causalità, correlazione.** Ogni evento nei quattro mapping porta con sé, come informazione concettuale minima: l'identità dell'Aggregate coinvolto, il momento della transizione, il valore raggiunto dell'asse o degli assi pertinenti (`persone.md` §10, colonna "Informazione persistente necessaria a ricostruirlo"; stessa struttura in `imprese.md` §18).

**Categorie di eventi confermate in tutti e quattro i domini.**

| Categoria | Esempio Persone | Esempio Imprese | Esempio Appartenenze | Esempio Mercati Internazionali |
|---|---|---|---|---|
| Creazione | `PersonaRegistrata` | `ImpresaCreata` | (implicito nella prima dichiarazione) | (implicito nella prima dichiarazione di Presenza) |
| Dichiarazione | `CompetenzaDichiarataAggiunta` | `SedeAggiunta` | `AppartenenzaDichiarata` | Dichiarazione di Presenza/Interesse |
| Verifica | — (nessuna Verifica propria) | `CertificazioneVerificata` | `AppartenenzaVerificata` | Verifica di una relazione d'uso |
| Pubblicazione | `StoriaPersonalePubblicata` | `ImpresaPubblicata` | — (visibilità propria, non un evento nominato a parte in `appartenenze.md` §22) | Coerente per estensione |
| Modifica significativa | `StoriaPersonaleAggiornata` | `SettorePrincipaleModificato` | `RuoloModificato` | Variazione della modalità operativa dichiarata |
| Cessazione | `PersonaCancellata` | `ImpresaSospesa`/`ImpresaArchiviata` | `AppartenenzaConclusa` | Cessazione della relazione d'uso |
| Revoca | — | — | `AppartenenzaRevocata`, `AutorizzazioneGestionaleRevocata` | Revoca della relazione, se dichiarata |
| Contestazione | — | (riportato da Appartenenze) | `AppartenenzaContestata` | Coerente per estensione |
| Risoluzione | — | — | (implicita nella Verifica successiva) | — |

**PF16 (Fondazionale, diretta applicazione di `01` §12): nessun documento di mapping, presente o futuro, può descrivere un meccanismo tecnico di propagazione degli eventi; ogni documento garantisce solo che l'informazione necessaria a ricostruire l'evento resti concettualmente disponibile a partire dai fatti persistenti descritti.**

---

## 20. Dipendenze tra domini

**Le sei classificazioni della Dependency Map, confermate come esaustive dai quattro mapping.**

| Classificazione | Significato | Condizioni d'uso | Direzione ammessa | Responsabilità | Effetti se il dominio esterno è indisponibile | Rischio di ciclo | Esempio confermato |
|---|---|---|---|---|---|---|---|
| **Necessaria** | Il dominio dipendente non può esprimere correttamente una propria responsabilità senza il riferimento | Riferimento a un'identità o a un fatto stabile, mai eredità dello stato | Sempre dal dipendente verso il proprietario | Il proprietario resta responsabile del fatto referenziato | Il dipendente non può creare nuove istanze del proprio fatto (es. una nuova Appartenenza non può esistere senza una Persona e un'Impresa) | Basso, se unidirezionale; da verificare se bidirezionale (§21) | Appartenenze→Persone/Imprese; Mercati Internazionali→Imprese/Persone (D7, D8) |
| **Facoltativa** | Il riferimento arricchisce ma non è necessario per la validità del nucleo | Riferimento opzionale | Dal dipendente verso il proprietario | Il proprietario resta responsabile | Il nucleo del dipendente resta pienamente valido | Basso | Imprese→Mercati Internazionali (D6, "l'impresa può referenziare le proprie presenze di mercato, senza che l'esistenza dell'impresa ne dipenda") |
| **Derivativa** | Il dominio produce dati derivati o aggregati a partire da fatti altrove posseduti | Sola lettura | Dal dominio derivativo verso ogni dominio sorgente | Il dominio sorgente resta proprietario del dato sorgente | Il dato derivato non può essere aggiornato, ma non cessa di esistere nella sua ultima forma calcolata | Nullo per costruzione (mai in scrittura) | Non ancora confermata da un mapping fisico (Osservatorio, candidata) |
| **Editoriale o rappresentativa** | Il dominio rappresenta un soggetto o un fatto posseduto altrove, senza ownership | Riferimento per identità, come soggetto raccontato | Dal dominio editoriale verso il soggetto narrato | Il soggetto narrato resta proprietario dei propri fatti operativi | La narrazione resta orfana di un riferimento valido, ma non modifica il soggetto | Nullo per costruzione | Non ancora confermata da un mapping fisico (Contenuti Editoriali, candidata; anticipata come dipendenza in entrata da Persone/Imprese) |
| **Di supporto** | Il dominio fornisce capacità trasversali senza determinare il significato del dominio servito | Applicazione di una decisione già presa altrove | Bidirezionale per natura (ogni dominio dipende da Identità & Accessi per l'accesso; Identità & Accessi dipende da ogni dominio per sapere cosa applicare) | Il dominio servito resta responsabile della decisione sostanziale | Il dominio servito resta valido concettualmente, ma la sua applicazione tecnica dell'accesso si blocca | Nullo, per costruzione: la dipendenza di supporto non riguarda mai la proprietà di un fatto sostanziale | Non ancora confermata da un mapping fisico (Identità & Accessi, candidata; anticipata come dipendenza in uscita da tutti i quattro domini mappati) |
| **Vietata** | Duplicherebbe dati, invertirebbe l'ownership, introdurrebbe un ciclo non governato, assorbirebbe un altro dominio, confonderebbe identità/accesso/soggetto, trasferirebbe responsabilità senza giustificazione | Mai ammessa | — | — | — | — | Nessuna riscontrata nei quattro mapping (verificata esplicitamente in ciascuno, es. `imprese.md` §10 "Dipendenze vietate, verificate come assenti") |

**I sei verbi di dipendenza (proprietà, riferimento, utilizzo, derivazione, aggregazione, pubblicazione).** Già trattati al §8-§9: qui si conferma che ogni riga della matrice canonica della Dependency Map (D1-D51) e ogni dipendenza dichiarata nei quattro mapping è sempre riconducibile a uno di questi sei verbi, mai a un settimo non catalogato.

**PF17 (Fondazionale, diretta applicazione di `01` §14 e confermata senza eccezione nei quattro mapping): ogni dipendenza dichiarata da un Domain Mapping deve essere classificata con esattamente una delle sei categorie di questa tabella, indicando l'Aggregate Root referenziato (non un'Entity dipendente interna, salvo motivazione esplicita come dipendenza sconsigliata secondo `03` §10) e il dominio proprietario del fatto referenziato.**

---

## 21. Prevenzione dei cicli

**Ciclo reale vs ciclo apparente: il caso di riferimento, risolto e ratificato.** Il caso Imprese↔Mercati Internazionali è, tra i quattro mapping, l'unico esempio concreto di un ciclo apparente identificato e risolto: la lettura letterale di `imprese.md` §2 presentava la relazione MercatoImpresa come se fosse in parte posseduta da Imprese; la riconciliazione logica (`reconciliation-report.md` §11.2) e la Dependency Map (`domain-dependency-map.md` §6) hanno stabilito che si tratta di un'unica relazione con un solo proprietario (Mercati Internazionali) osservata da due punti di vista, non di una dipendenza circolare di proprietà. `imprese.md` §10 lo dichiara esplicitamente: "L'unica relazione che, letta superficialmente, potrebbe apparire circolare... la riconciliazione logica ha già chiarito che si tratta di un'unica relazione con un solo proprietario... osservata da due punti di vista, non... una dipendenza circolare di proprietà". `mercati-internazionali.md` §9 ratifica la stessa lettura dal lato opposto.

**PF18 (Fondazionale, formalizzazione del criterio di risoluzione, direttamente ricavata dal caso di riferimento): quando due domini sembrano dipendere l'uno dall'altro per lo stesso fatto, la prima verifica obbligatoria è se si tratti di un'unica relazione con un solo proprietario osservata da due punti di vista (un ciclo apparente), non di una vera dipendenza circolare di proprietà. Solo se questa verifica esclude un proprietario unico, il ciclo è reale e va eliminato secondo i criteri sottostanti, mai dichiarato "gestito" senza risoluzione.**

| Tipo di dipendenza reciproca | Definizione | Ciclo reale? | Trattamento |
|---|---|---|---|
| Dipendenza reciproca di consultazione | Due domini si referenziano a vicenda solo in lettura, senza che nessuno dei due determini un fatto dell'altro | No | Ammessa come due dipendenze unidirezionali distinte, non un ciclo |
| Dipendenza di pubblicazione | Un dominio editoriale referenzia un soggetto; il soggetto non referenzia mai il dominio editoriale come proprietario di alcun proprio fatto | No | Ammessa (§20, categoria editoriale) |
| Dipendenza derivativa | Un dominio derivativo legge da un dominio sorgente; il dominio sorgente non dipende mai dal derivativo | No | Ammessa (§20, categoria derivativa) |
| Dipendenza attraverso un dominio relazionale | Due soggetti sembrano dipendere l'uno dall'altro, ma la dipendenza reale passa sempre per il dominio relazionale proprietario (Appartenenze tra Persona e Impresa) | No | Il dominio relazionale è il solo proprietario; nessun ciclo tra i due soggetti (`persone.md` §4, "Persone non ha alcuna relazione diretta con Imprese... mai per un riferimento diretto"; confermato nel verso opposto da `imprese.md` §1) |
| Dipendenza governata da riferimento opaco | Il dominio relazionale referenzia il soggetto in modo opaco; il soggetto non referenzia mai il dominio relazionale per la propria validità sostanziale | No | Coerente con PF4/PF5 |
| Duplicazione introdotta per eliminare artificialmente un ciclo | Un dominio copia un fatto altrui solo per evitare di dichiarare una dipendenza | Sì, e resta vietata anche se elimina un ciclo apparente | **PV14 (Vietato): la duplicazione di un fatto non posseduto non è mai una soluzione legittima alla prevenzione dei cicli, anche quando elimina un ciclo apparente; la soluzione corretta è sempre la corretta attribuzione dell'ownership (PF18), mai la copia** |

**Criteri per eliminare un ciclo reale, se mai se ne presentasse uno.** Nessuno dei quattro mapping ha riscontrato un vero ciclo di proprietà (ciascuno lo verifica esplicitamente in una propria sezione dedicata: `persone.md` §11.3, `imprese.md` §10, `appartenenze.md` §25, `mercati-internazionali.md` §27 equivalente). I criteri, ricavati per coerenza diretta da `01` §14 e dal caso di riferimento sopra, sono: non spostare impropriamente la proprietà dei fatti per comodità (una correzione di ownership, come nel caso di riferimento, è legittima solo quando la riconciliazione logica la conferma, non quando la propone unilateralmente un solo documento di mapping); non duplicare dati autorevoli (PV14); non fondere domini distinti per eliminare la dipendenza (violerebbe la coesione, `04` §8); non introdurre dipendenze infrastrutturali nel modello di business (violerebbe P8).

---

## 22. Derivazioni, proiezioni e aggregazioni

**Distinzioni confermate, anche se il pattern derivativo non ha ancora un proprio mapping fisico.** Tutti e quattro i domini mappati dichiarano esplicitamente il proprio confine con l'Osservatorio e, dove applicabile, con Contenuti Editoriali, senza mai attribuirsi la proprietà di un dato derivato o di una rappresentazione editoriale:

| Distinzione | Definizione | Conferma |
|---|---|---|
| Fatto autorevole | D01/D02, posseduto dal dominio sorgente | Tutti e quattro |
| Dato derivato | D04-D06, mai trattato come sorgente | `persone.md` §9, "Il confine con l'Osservatorio"; `imprese.md` §16, "nessun dato aggregato o osservativo è attribuito a Imprese" |
| Proiezione | Una rappresentazione derivata di un fatto, senza significato autonomo aggiunto | Non ancora nominata esplicitamente come termine distinto in alcuno dei quattro mapping: resta implicita nella distinzione D01→D07 (Dato pubblicato) |
| Indice | Una struttura che rende reperibile un fatto pubblicato (VIS05) | Non trattata esplicitamente (nessuno dei quattro domini possiede un proprio dominio di ricerca); coerente con l'esclusione di contenuto tecnico |
| Vista editoriale | Una rappresentazione narrativa di un fatto, posseduta da Contenuti Editoriali | Non ancora confermata da un mapping fisico (candidata) |
| Aggregazione statistica | D06, mai reidentificante un singolo soggetto non altrimenti visibile | Anticipata come vincolo in tutti e quattro i mapping (`imprese.md` §16, "con l'accortezza di non permettere la reidentificazione") |
| Rappresentazione pubblica | Il fatto reso visibile secondo la condizione cumulativa (§16) | Tutti e quattro |
| Cache concettuale | Non un pattern catalogato: nessuno dei quattro mapping introduce un dato ripetuto per sola comodità di lettura (vietato da `01` §2 principio 7) | Verificato esplicitamente come assente in tutti e quattro |
| Copia non autorevole | Vista di sintesi non normativa (PC4, §9), sempre dichiarata come tale | AppartenenzaImpresa in Imprese |

**PC13 (Consolidata, diretta applicazione di P6/P9 di `domain-dependency-map.md`, confermata identicamente in Persone, Imprese e Appartenenze): la derivazione non trasferisce mai la proprietà; una rappresentazione, per quanto sistematicamente utilizzata, non diventa mai la fonte autorevole del fatto che rappresenta; ogni aggregazione deve poter essere ricostruita risalendo ai fatti proprietari originari.**

**Domini editoriali e domini di ricerca/pubblicazione, non ancora mappati ma già vincolati.** Coerentemente con P5/P10 (`domain-dependency-map.md`), un futuro dominio editoriale potrà rappresentare i fatti di Persone, Imprese, Appartenenze o Mercati Internazionali senza mai diventarne proprietario, e senza mai modificarne il significato originario: questo vincolo è già Fondazionale per derivazione diretta da `01` §14 e non richiede attesa di un quinto mapping fisico per essere applicato (a differenza dei pattern che richiedono una seconda conferma empirica, §4).

---

## 23. Vocabolari e tassonomie

**Le sei forme di Classificazione (C01-C06), applicate con la stessa distinzione operativa nei quattro domini.** Tassonomia condivisa (C02) riservata ai cataloghi con un proprio ciclo di gestione autonomo dal ciclo di vita delle Entity che li referenziano (Lingua, Competenza, Settore, Territorio — `reconciliation-report.md` §7); Elenco controllato (C03) riservato a insiemi chiusi e stabili, parte della definizione stessa del concetto che classificano (Forma organizzativa e Dimensione in Imprese, `imprese.md` §6; i Ruoli di Appartenenze, `appartenenze.md` §7; il vocabolario di Tipologia di attività in Mercati Internazionali, §7 di quel documento).

**PC14 (Consolidata, criterio distintivo confermato identicamente in Imprese e Appartenenze): un vocabolario locale diventa Elenco controllato (C03), non Tassonomia condivisa (C02), quando nessun altro dominio dichiara di possederlo o gestirlo autonomamente e quando i suoi valori sono presentati dal documento logico come un insieme chiuso descritto direttamente nel testo, non come un catalogo con una propria vita indipendente (aggiunta, correzione, disattivazione di voci).**

**Criteri per decidere quando un concetto deve essere incorporato, governato dal dominio, condiviso, referenziato, rinviato a un futuro dominio tassonomico.**

| Condizione | Trattamento | Conferma |
|---|---|---|
| Il valore cambia sempre insieme all'Entity che lo contiene, senza bisogno di essere confrontato tra istanze diverse | Value Object incorporato (VO01) | Presentazione, Descrizione (Persone, Imprese) |
| Il valore è un insieme chiuso e stabile, parte della definizione del concetto, senza un proprio ciclo di gestione | Elenco controllato (C03), locale al dominio | Forma organizzativa, Ruoli di Appartenenza, Tipologia di attività |
| Il valore è governato da un unico dominio proprietario esterno, con un proprio ciclo di gestione, e referenziato da più domini | Tassonomia condivisa (C02) + riferimento VO03 | Lingua, Competenza, Settore, Territorio |
| Il valore ha una classificazione ufficiale esterna alla piattaforma (es. un codice normativo), non governata da alcun dominio di questa architettura | Attributo descrittivo (C06), non VO03 | "Eventuale classificazione istituzionale esterna" in Imprese (`imprese.md` §4, "nessun dominio proprietario di questa classificazione esterna") |
| Il valore richiederebbe un proprio dominio tassonomico dedicato, non ancora esistente | Rinviato: nessuno dei quattro mapping introduce un nuovo dominio tassonomico di propria iniziativa | Tassonomia condivisa stessa, che referenzia Lingua/Competenza/Settore/Territorio ma non ha ancora un proprio Physical Domain Mapping (§35) |

**PF19 (Fondazionale, diretta applicazione di `03` §11, confermata dall'assenza di violazioni nei quattro mapping): nessun documento di mapping può introdurre un nuovo dominio tassonomico globale di propria iniziativa; un nuovo catalogo condiviso richiede lo stesso processo di riconciliazione già applicato agli undici domini esistenti, non l'iniziativa isolata di un singolo Domain Mapping.** Persone e Imprese, pur avendo entrambi bisogno di referenziare Tassonomia condivisa, non ne anticipano la struttura fisica né ne propongono una versione propria: entrambi dichiarano esplicitamente la questione come rinviata (`persone.md` §14 punto 6; `imprese.md` §24).

---

## 24. Cessazione, cancellazione e oblio

**Distinzioni confermate.**

| Concetto | Definizione | Conferma |
|---|---|---|
| Cancellazione tecnica | Distruzione fisica di un dato — esplicitamente fuori dal perimetro di ogni documento a questo livello | Nessuno dei quattro mapping la tratta (correttamente, per divieto di contenuto implementativo) |
| Cancellazione logica | Un fatto smette di essere presentato come attuale, senza essere distrutto | `imprese.md` §10, regola 10, "la cancellazione logica non distrugge la storia delle relazioni" |
| Cessazione del fatto | Una relazione o uno stato termina, restando storicizzato (§13) | Tutti e quattro |
| Revoca | Una cessazione anticipata e deliberata, distinta da una Scadenza per decorso del tempo (`01` §8) | Appartenenze (`AutorizzazioneGestionaleRevocata`), Imprese (Certificazione "Revocata" distinta da "Scaduta", `imprese.md` §13) |
| Anonimizzazione | Non trattata in alcuno dei quattro mapping: resta questione aperta, rinviata a un futuro dominio Privacy | `persone.md` §14 punto 5, `domain-model.md` §11 |
| Ritiro dalla pubblicazione | Revoca della visibilità senza cancellazione del fatto (§16) | Tutti e quattro |
| Indisponibilità del soggetto referenziato | La relazione resta storicamente valida anche se il soggetto referenziato non è più attivo o pubblico | `imprese.md` §5, "l'identità dell'Impresa non dipende... anche quando nessuna Persona collegata ha un profilo pubblico"; `appartenenze.md` §12 regola 2 |
| Conservazione per obblighi storici o documentali | Regola di default (PF8, §13) | Tutti e quattro |

**PF20 (Fondazionale, diretta applicazione di `appartenenze.md` §12 regola 2 e confermata da Imprese: la scomparsa, la sospensione o l'indisponibilità di un soggetto referenziato non deve necessariamente cancellare una relazione storicamente valida che lo riguarda; la relazione resta storicizzata secondo la regola di default (PF8), indipendentemente dalla condizione corrente del soggetto referenziato.**

**Il caso locale non generalizzato: `PersonaCancellata`.** `persone.md` §10/§13 (Decisione 9) tratta la cancellazione di una Persona come un atto "esclusivo, volontario e irreversibile della Persona stessa", concettualmente più vicino a un diritto di cancellazione che a una semplice archiviazione, rinviando la decisione definitiva su un'eventuale distruzione fisica dei dati a un futuro dominio Privacy. Questo documento non generalizza questa lettura come regola per ogni futura "cancellazione richiesta da un soggetto": la registra come decisione locale (§33, PL3), perché nessun altro dei tre domini rimanenti tratta un caso equivalente (Imprese non modella un diritto di cancellazione analogo; Appartenenze e Mercati Internazionali non possiedono un soggetto la cui identità possa essere "cancellata" nello stesso senso).

---

## 25. Eccezioni motivate: procedura obbligatoria

Ogni deroga a una regola Consolidata di questo documento (§30), o a un pattern obbligatorio di `02`, deve essere documentata nel Domain Mapping che deroga secondo lo schema seguente, ripreso senza attenuazioni da `03` §2 e qui esteso esplicitamente alle regole di questo documento:

1. **Regola o soluzione attesa.** Quale regola di questo documento (o quale pattern di `02`) si applicherebbe secondo la soluzione uniforme.
2. **Motivo per cui risulta inadeguata.** Quale condizione, dichiarata esplicitamente nel documento logico del dominio che deroga, rende la soluzione uniforme inadeguata per quel caso specifico — non una preferenza di chi scrive il mapping.
3. **Soluzione applicata.** Quale soluzione alternativa si applica, con quale pattern (specializzato o combinato) la si esprime.
4. **Perimetro dell'eccezione.** A quali Entity, relazioni o dati specifici del dominio si applica, esplicitamente, senza estensione implicita ad altri concetti dello stesso dominio.
5. **Conseguenze.** Quali altre sezioni del medesimo Domain Mapping sono influenzate dall'eccezione (per esempio: un'eccezione alla storicizzazione di default influenza anche la sezione eventi e la sezione dati derivati).
6. **Documenti eventualmente impattati.** Se l'eccezione richiede di segnalare una correzione, un allineamento o una decisione da ratificare in un altro documento (da riportare secondo lo schema del §36 di quel Domain Mapping, non di questo documento).
7. **Necessità o meno di una decisione fondazionale.** Se l'eccezione, per la sua natura o per la sua ricorrenza probabile in altri domini, richiede una revisione esplicita di questo documento (nuova regola, nuovo livello, o retrocessione di una regola già Consolidata) — da segnalare, non da decidere autonomamente nel Domain Mapping che la propone.

**Divieto di modifica implicita delle regole generali.** Un'eccezione non modifica mai, per il solo fatto di esistere, la regola generale da cui deroga: la regola resta applicabile a ogni altro caso non esplicitamente escluso dal perimetro dichiarato al punto 4. Il caso già osservato — la gestione non risolutiva di `PersonaCancellata` (§24, §33 PL3) — è l'esempio di riferimento per l'applicazione corretta di questo schema: `persone.md` §13 Decisione 9 lo applica integralmente, in tutte e tre le parti richieste da `03` §2, e questo documento lo eredita come esempio operativo.

---

## 26. Pattern vietati

Il catalogo completo, con motivazione, è al §26.1; la sua forma numerata come catalogo autonomo è ripresa al §32 (Impatti) e sintetizzata di seguito. Ogni voce riprende un anti-pattern già stabilito in `03` §14, generalizzandolo con l'evidenza dei quattro domini, più tre voci nuove emerse specificamente dal confronto tra domini relazionali.

### 26.1 Catalogo

| # | Pattern vietato | Perché è vietato | Evidenza dai quattro domini |
|---|---|---|---|
| PV1 | Duplicazione dei fatti | Elimina la garanzia di unicità della fonte (`03` §14) | Verificata come assente in tutti e quattro (PF2, §8) |
| PV2 | Perdita del proprietario del dato | Rende impossibile stabilire chi ha l'autorità di modificare un fatto (`03` §14) | Ogni tabella dei quattro mapping dichiara sempre un proprietario |
| PV3 | Fusione impropria di stati | Costringe a scegliere un solo valore quando la realtà ne richiede più di uno indipendenti (`03` §14) | Verificata come assente (PF7, §12) |
| PV4 | Uso improprio delle verifiche (badge generico) | Comunica una garanzia che nessuna singola Verifica ha fornito (`03` §14) | Verificata come assente in tutti e quattro (PF10, §15) |
| PV5 | Dipendenze circolari di proprietà | Rende impossibile stabilire un ordine di verità (`03` §14) | Verificata come assente; unico caso apparente risolto (§21) |
| PV6 | Proliferazione di eccezioni non riesaminate | Segnala che la regola generale andrebbe rivista (`03` §14) | Nessuna eccezione ricorrente non motivata riscontrata nei quattro mapping |
| PV7 | Riuso apparente ma incoerente | Mina la fiducia nel catalogo condiviso (`03` §14) | Verificata come assente; ogni citazione di pattern nei quattro mapping è coerente con `02` |
| PV8 | Introduzione di pattern non catalogati | Crea un pattern "ombra" non riconoscibile altrove (`03` §14) | Nessun pattern non catalogato introdotto nei quattro mapping |
| PV9 | Confusione tra dato derivato e dato sorgente | Impedisce di sapere quando un dato derivato è diventato obsoleto (`03` §14) | Verificata come assente (§22) |
| PV10 | Incorporare una relazione autonoma come attributo del dominio di uno dei soggetti coinvolti | Viola direttamente PF4; confonde il ciclo di vita del soggetto con quello della relazione | Esplicitamente corretto nel caso MercatoImpresa (§21); mai presente nella versione finale approvata dei quattro mapping |
| PV11 | Dedurre automaticamente una relazione da un fatto diverso (menzione, contatto, partecipazione, citazione editoriale) senza una dichiarazione propria | Viola il principio di non-automatismo (`domain-model.md` §1) | Esplicitamente escluso dai criteri negativi di Appartenenze (§10.2), generalizzato come divieto per ogni dominio relazionale futuro |
| PV12 | Un dominio relazionale che dipende dal modello interno del soggetto referenziato invece del solo riferimento opaco | Viola direttamente PF5; introduce un accoppiamento non necessario tra domini | Verificata come assente in Appartenenze e Mercati Internazionali |
| PV13 | Trattare un'Affidabilità o un giudizio complessivo derivato come se fosse un dato sorgente persistente | Confonde derivazione e proprietà (`02` §8, V05) | Verificata come assente in Imprese (unico dominio con V05 esplicito) |
| PV14 | Duplicare un fatto non posseduto per eliminare artificialmente un ciclo apparente | La duplicazione resta vietata anche quando "risolverebbe" un problema di dipendenza (§21) | Non riscontrata: il caso MercatoImpresa è stato risolto per correzione di ownership, non per duplicazione |

---

## 27. Checklist obbligatoria per i futuri Domain Mapping

Ogni futuro Physical Domain Mapping deve poter rispondere positivamente a ciascuna delle righe seguenti prima di essere considerato completo. La checklist integra, senza ripeterne il contenuto, quella già stabilita in `04` §17: qui l'oggetto della verifica è la conformità a questo documento, non alla sola qualità interna del singolo mapping.

| # | Verifica | Riferimento |
|---|---|---|
| 1 | Responsabilità del dominio dichiarata in apertura, con classificazione secondo §7 (o dichiarazione esplicita che la classificazione resta da confermare) | §7 |
| 2 | Confini inclusi ed esclusi dichiarati esplicitamente, coerenti con la Dependency Map | §7, §20 |
| 3 | Proprietà di ogni fatto trattato dichiarata senza ambiguità (PF1) | §8 |
| 4 | Aggregate Root (uno o più, §9 PC2) individuato con la procedura in cinque domande di `03` §3 | §9 |
| 5 | Concetti incorporati (VO01-VO03) distinti esplicitamente dai concetti persistenti (E01-E04), con motivazione | §9 |
| 6 | Se il dominio possiede una relazione autonoma: applicazione esplicita di PF4/PF5, con riferimento esterno opaco dichiarato per ciascun soggetto referenziato | §10, §11 |
| 7 | Se il dominio possiede una relazione: verifica esplicita dei criteri positivi/negativi del §10.2 per confermare che la relazione meriti un dominio autonomo | §10 |
| 8 | Identità interna, pubblica e (se applicabile) temporanea distinte esplicitamente per ciascuna Entity | §11 |
| 9 | Ogni asse di stato (S01-S08) dichiarato applicabile o non applicabile, mai omesso (RC15) | §12 |
| 10 | Nessuna fusione di due assi indipendenti in un unico valore (PF7) | §12 |
| 11 | Ogni pattern di Temporalità (T01-T07) dichiarato applicabile o non applicabile, con motivazione | §13 |
| 12 | Regola di continuità storica di default applicata in assenza di indicazione contraria (PF8) | §13 |
| 13 | Fonte, Evidenza e Verifica distinte come tre voci separate (RC20) | §14, §15 |
| 14 | Nessun'inferenza rappresentata come dato dichiarato o verificato (PV11) | §14 |
| 15 | Ogni Verifica trattata nomina l'aspetto verificato specifico, senza badge generico (PF10) | §15 |
| 16 | Principio della condizione cumulativa applicato esplicitamente per la pubblicazione (PF12) | §16 |
| 17 | Decisione sostanziale di visibilità attribuita sempre al dominio proprietario, mai a Identità & Accessi (PF13) | §16 |
| 18 | Autorizzazione gestionale trattata come fatto distinto dal Ruolo relazionale, se applicabile (PF14) | §17 |
| 19 | Contestazioni trattate secondo il pattern candidato del §18, o dichiarata esplicitamente l'assenza di questo bisogno nel dominio | §18 |
| 20 | Ogni evento di dominio espresso al participio passato, senza alcun meccanismo tecnico descritto (PF16) | §19 |
| 21 | Ogni dipendenza classificata con una delle sei categorie del §20, con Aggregate Root referenziato esplicito | §20 |
| 22 | Verifica esplicita dell'assenza di cicli reali, con applicazione del criterio PF18 per ogni dipendenza reciproca apparente | §21 |
| 23 | Nessun dato derivato trattato come sorgente; ogni derivazione dichiara la propria origine (PC13) | §22 |
| 24 | Ogni vocabolario classificato come VO01, C02+VO03 o C03, con motivazione secondo PC14 | §23 |
| 25 | Nessun nuovo dominio tassonomico introdotto di propria iniziativa (PF19) | §23 |
| 26 | Indisponibilità o cessazione di un soggetto referenziato trattata senza cancellare relazioni storicamente valide (PF20) | §24 |
| 27 | Ogni eccezione a una regola Consolidata documentata secondo lo schema in sette punti del §25 | §25 |
| 28 | Nessun pattern vietato del §26 presente nel documento | §26 |
| 29 | Pattern riutilizzati esplicitamente citati con il codice comune, non riprodotti come soluzione apparentemente nuova (RC06) | §9, §30 |
| 30 | Decisioni locali non generalizzate a partire da questo documento senza una nuova verifica del metodo (§4) | §33 |
| 31 | Decisioni fondazionali applicabili al dominio richiamate esplicitamente, con il proprio codice PF | §29 |
| 32 | Questioni aperte e aspetti rinviati dichiarati in sezioni dedicate, mai forzati a una soluzione prematura | §34, §35 |
| 33 | Assenza di contenuto implementativo improprio (SQL, schema fisico, tecnologie, API) | §37 |
| 34 | Coerenza dichiarata esplicitamente con il Logical Data Model del dominio e con la Dependency Map, punto per punto | §36 |

---

## 28. Matrici di verifica

### 28.1 Matrice pattern → domini confermanti

| Pattern/Regola | Persone | Imprese | Appartenenze | Mercati Internazionali |
|---|---|---|---|---|
| PF1 Single Owner | ✓ | ✓ | ✓ | ✓ |
| PF2 Nessuna duplicazione | ✓ | ✓ | ✓ | ✓ |
| PF4 Proprietà delle relazioni | — (non possiede relazioni proprie) | — (non possiede relazioni proprie) | ✓ (caso di conferma primario) | ✓ (caso di conferma secondario, indipendente) |
| PF5 Riferimento esterno opaco | — | — | ✓ | ✓ |
| PF6 Identità di business ≠ identità di accesso | ✓ | ✓ | ✓ | ✓ |
| PF7 Assi indipendenti mai compressi | ✓ | ✓ | ✓ | ✓ |
| PF8 Continuità storica di default | ✓ | ✓ | ✓ | ✓ |
| PF9 Cronologia di dominio ≠ audit tecnico | ✓ (implicito) | ✓ (implicito) | ✓ (implicito) | ✓ (implicito) |
| PF10 Nessun badge generico di verifica | ✓ (per assenza totale di Verifica) | ✓ | ✓ | ✓ |
| PF12 Condizione cumulativa di pubblicazione | ✓ | ✓ (caso più articolato, sei condizioni) | ✓ | ✓ |
| PF13 Identità & Accessi applica, non decide | ✓ | ✓ | ✓ | ✓ (per referenza) |
| PF14 Ruolo di business ≠ privilegio applicativo | — | ✓ | ✓ | — (per referenza al titolo di rappresentanza) |
| PF16 Eventi come fatti già avvenuti | ✓ | ✓ | ✓ | ✓ |
| PF17 Sei classificazioni di dipendenza esaustive | ✓ | ✓ | ✓ | ✓ |
| PF18 Ciclo apparente vs ciclo reale | — (nessun caso riscontrato) | ✓ (caso di riferimento) | — | ✓ (ratifica del caso di riferimento) |
| PF19 Nessun nuovo dominio tassonomico di iniziativa | ✓ | ✓ | ✓ | ✓ |
| PF20 Indisponibilità del soggetto ≠ cancellazione della relazione | — | ✓ | ✓ | — (per estensione) |
| PC1-PC14 (pattern consolidati, dettaglio §30) | Confermano tra 3 e 5 pattern ciascuno | Confermano tra 5 e 8 pattern ciascuno | Confermano tra 4 e 7 pattern ciascuno | Confermano tra 3 e 6 pattern ciascuno |

### 28.2 Matrice pattern candidati → domini futuri da verificare

| Pattern candidato | Codice | Collaborazioni | Opportunità | Professionisti | Eventi | Contenuti Editoriali | Osservatorio | Identità & Accessi | Organizzazioni istituzionali |
|---|---|---|---|---|---|---|---|---|---|
| Applicabilità di PF4 (proprietà delle relazioni) | §10.5 | Da verificare | Da verificare | Da verificare (bassa priorità) | Da verificare | Non applicabile (non relazionale) | Non applicabile | Non applicabile | Da verificare |
| Identità temporanea | PCa3 | — | Da verificare (candidatura) | — | Da verificare (iscrizione/partecipazione) | — | — | Da verificare (sessione) | — |
| Pattern contestazioni e conflitti (§18) | PCa1 | Da verificare | — | — | — | — | — | Da verificare | — |
| Conflitto tra fonti (§14) | — | Da verificare | — | Da verificare | — | Da verificare | — | — | — |
| Dato aggregato con soglia anti-reidentificazione | PCa5 | — | — | — | — | — | Da verificare (priorità alta) | — | — |
| Documento a supporto di una qualifica (DOC01-05) | PCa6 | — | — | Da verificare | — | — | — | — | — |
| Verifica di contatto, professionale, editoriale, metodologica, disponibilità, partecipazione, delega, consenso, qualità del dato (§15) | — | — | — | Professionale, disponibilità | Disponibilità, partecipazione | Editoriale | Metodologica, qualità del dato | Contatto, delega, consenso | — |
| Vista di sintesi non normativa (PC4) | — | Da verificare | Da verificare | — | Da verificare | — | — | — | Da verificare |
| Più Aggregate Root nello stesso dominio (PC2) | — | Da verificare | Da verificare | — | Da verificare (Evento/Edizione/Sessione) | — | — | Da verificare (Account/Delega/Consenso) | — |

---

## 29. Catalogo delle regole fondazionali

| # | Regola | Sezione |
|---|---|---|
| PF1 | Ogni fatto di business ha esattamente un dominio proprietario (Single Owner) | §8 |
| PF2 | Nessun dominio duplica fatti altrui: si referenzia per identità, non si copia | §8 |
| PF3 | Ogni scelta di mapping deve essere riconducibile a un paragrafo del documento logico corrispondente | §8 |
| PF4 | Una relazione di business autonoma appartiene al dominio che rappresenta la relazione, non ai domini dei soggetti coinvolti | §10 |
| PF5 | Il riferimento esterno opaco è l'unico modo legittimo con cui un dominio relazionale referenzia un soggetto | §10, §11 |
| PF6 | L'identità di un soggetto di business e l'identità digitale di accesso sono sempre concettualmente distinte | §11 |
| PF7 | Un singolo stato complessivo non deve mai assorbire dimensioni semanticamente indipendenti | §12 |
| PF8 | In assenza di indicazione contraria, ogni fatto rilevante è storicizzato con la conservazione più completa | §13 |
| PF9 | La cronologia di dominio è sempre concettualmente distinta da un eventuale audit tecnico | §13 |
| PF10 | Non esiste e non può esistere un badge universale di "verificato" | §15 |
| PF11 | Verifiche differenti sullo stesso Aggregate non vanno mai fuse in un unico esito | §15 |
| PF12 | Un fatto o una relazione è pubblicamente rappresentabile solo quando tutte le condizioni autonome richieste sono soddisfatte simultaneamente | §16 |
| PF13 | Nessun dominio di business può delegare a Identità & Accessi la decisione su cosa sia pubblico | §16 |
| PF14 | Un ruolo di business non attribuisce mai automaticamente un privilegio applicativo | §17 |
| PF15 | Un evento di dominio rappresenta sempre un fatto già avvenuto, mai un comando | §19 |
| PF16 | Nessun documento di mapping descrive un meccanismo tecnico di propagazione degli eventi | §19 |
| PF17 | Ogni dipendenza dichiarata è classificata con esattamente una delle sei categorie (necessaria, facoltativa, derivativa, editoriale, di supporto, vietata) | §20 |
| PF18 | Davanti a una dipendenza reciproca apparente, si verifica prima se sia un'unica relazione con un solo proprietario osservata da due punti di vista | §21 |
| PF19 | Nessun documento di mapping introduce un nuovo dominio tassonomico globale di propria iniziativa | §23 |
| PF20 | L'indisponibilità o la cessazione di un soggetto referenziato non cancella automaticamente una relazione storicamente valida | §24 |

---

## 30. Catalogo dei pattern consolidati

| # | Pattern | Sezione |
|---|---|---|
| PC1 | Procedura decisionale in cinque domande (`03` §3) applicata senza scorciatoie | §9 |
| PC2 | Un dominio può possedere più di un Aggregate Root, purché ciascuno abbia una propria consistenza dichiarata | §9 |
| PC3 | Dichiarazione singola con riferimento a catalogo condiviso = Entity dipendente (E02), mai Value Object che incorpora il valore | §9 |
| PC4 | Vista di sintesi non normativa ammessa solo se dichiara esplicitamente la fonte autorevole | §9, §22 |
| PC5 | Criteri positivi per la promozione di una relazione a dominio autonomo | §10 |
| PC6 | Criteri negativi per evitare la promozione impropria di una relazione a dominio autonomo | §10 |
| PC7 | Uno stato terminale è sempre incompatibile con qualunque rappresentazione come attuale | §12 |
| PC8 | Segnale d'allarme e verifica esplicita quando sembrano necessari più assi di quanti catalogati | §12 |
| PC9 | L'assenza di un pattern di Temporalità va sempre dichiarata con motivazione, mai omessa | §13 |
| PC10 | Ogni relazione posseduta da un dominio relazionale ha Decorrenza obbligatoria e fine facoltativa e apribile | §13 |
| PC11 | Fonte (V03) come pattern locale ripetuto per dominio, mai un'entità condivisa | §14 |
| PC12 | Un evento può essere citato per completezza dal dominio che lo riceve, ma la sua proprietà resta del dominio che lo genera | §19 |
| PC13 | La derivazione non trasferisce mai la proprietà; ogni aggregazione deve poter essere ricostruita dai fatti proprietari | §22 |
| PC14 | Un vocabolario locale diventa Elenco controllato, non Tassonomia condivisa, quando nessun altro dominio lo governa autonomamente | §23 |

---

## 31. Catalogo dei pattern preferenziali

| # | Pattern | Sezione |
|---|---|---|
| PP1 | Preferire Elenco controllato (C03) a Tassonomia condivisa (C02) salvo evidenza di un ciclo di gestione autonomo | §23 |
| PP2 | Separare esplicitamente Fonte, Evidenza e Verifica anche quando nella pratica del dominio sembrano fondersi | §14, §15 |
| PP3 | Documentare ogni decisione di mapping con la tripla citazione principio + pattern + convenzione | §4 |
| PP4 | Dichiarare esplicitamente ogni asse, pattern o dipendenza non applicabile, invece di ometterlo silenziosamente | §12, §13, §20 |

---

## 32. Catalogo dei pattern candidati

| # | Pattern | Da verificare in | Sezione |
|---|---|---|---|
| PCa1 | Pattern generale di contestazioni e conflitti (oggi modellato solo in Appartenenze) | Collaborazioni, Identità & Accessi, ogni futuro dominio relazionale | §18 |
| PCa2 | Applicazione del riferimento opaco + relazione autonoma a Persona-Organizzazione, Impresa-Organizzazione | Organizzazioni istituzionali (dominio non ancora riconciliato a livello logico) | §10.5 |
| PCa3 | Identità temporanea | Opportunità (candidatura), Eventi (iscrizione/partecipazione), Identità & Accessi (sessione) | §11 |
| PCa4 | Estensione della regola fondazionale sulla proprietà delle relazioni (PF4) | Collaborazioni, Opportunità, Professionisti, Eventi, Organizzazioni istituzionali, Immobiliare, Servizi, Finanziamenti | §10.5 |
| PCa5 | Dato aggregato con soglia minima anti-reidentificazione come regola operativa esplicita | Osservatorio | §22 |
| PCa6 | Documento (DOC01-DOC05) a supporto di una qualifica dichiarata, con lo stesso significato già confermato in Imprese | Professionisti | §14 |
| PCa7 | Conflitto tra fonte istituzionale e fonte privata come pattern generale, non solo locale ad Appartenenze | Collaborazioni, Professionisti, Contenuti Editoriali | §14 |
| PCa8 | Più Aggregate Root nello stesso dominio (PC2) come pattern ricorrente, non isolato a Mercati Internazionali | Opportunità, Eventi (Evento/Edizione/Sessione), Identità & Accessi (Account/Delega/Consenso) | §9 |

---

## 33. Decisioni locali non generalizzabili

| # | Decisione locale | Dominio di origine | Perché non è generalizzabile |
|---|---|---|---|
| PL1 | La scomposizione della sequenza narrativa in esattamente gli assi S01, S02, S04, S07 (+S08) | Persone | È l'esito dell'applicazione del principio generale degli assi indipendenti (Fondazionale) al caso specifico di `persone.md` §5: il principio è generale, l'insieme specifico di assi applicabili non lo è — ogni dominio futuro deriva i propri assi dal proprio documento logico, non da questo elenco |
| PL2 | L'assenza totale di una Verifica propria | Persone | È una caratteristica del dominio specifico (nessun aspetto verificabile dichiarato in `persone.md`), non una regola che vieti ad altri domini fondazionali di possedere una propria tassonomia di verifica (Imprese infatti ne possiede una ricca) |
| PL3 | La gestione non risolutiva della discrepanza `PersonaCancellata` vs "Archiviata", rinviata a un futuro dominio Privacy | Persone | È una decisione specifica su un diritto di cancellazione dichiarato per un solo dominio; non generalizzabile come regola su come trattare ogni futura richiesta di cancellazione da parte di un soggetto |
| PL4 | Le undici voci del catalogo di Ruolo (Fondatore, Titolare, Socio, Amministratore, Legale rappresentante, Dirigente, Dipendente, Consulente, Collaboratore, Referente, Gestore della scheda) | Appartenenze | È un Elenco controllato locale al significato specifico della relazione Persona-Impresa; un futuro dominio relazionale (es. Collaborazioni) definirà il proprio catalogo secondo la propria natura, non riutilizzando queste voci |
| PL5 | Le sei nature della relazione di Appartenenza (proprietà, lavoro, collaborazione, consulenza, rappresentanza, gestione della scheda) | Appartenenze | Locali al significato specifico di quel dominio |
| PL6 | Il Mercato come catalogo geo-economico con proprie risorse di supporto, accanto alla relazione | Mercati Internazionali | È una caratteristica specifica di quel dominio (un contesto informativo autonomo accompagna la relazione); non impone che ogni futuro dominio relazionale debba avere anche un proprio catalogo di contesto indipendente — resta candidato, non fondazionale, che un futuro dominio relazionale abbia questa struttura doppia |
| PL7 | Il numero e la natura delle sei condizioni cumulative di pubblicazione dell'Impresa | Imprese | Il principio della condizione cumulativa è Fondazionale (PF12); il numero esatto e il contenuto delle sei condizioni sono specifici del dominio Imprese, non un elenco da riapplicare identicamente altrove |

---

## 34. Questioni aperte

Le questioni seguenti riguardano l'architettura trasversale nel suo complesso, non un singolo dominio, e non sono risolte da questo documento: restano segnalate per una futura decisione di prodotto o di architettura.

1. **Se e come classificare "Contestazioni e conflitti" come propria famiglia di pattern in `02-reference-model.md`.** Oggi il pattern esiste solo come sezione dedicata in `appartenenze.md`, senza un proprio codice nel Reference Model (a differenza di Stato, Verifica, Versione, Evento). Se un secondo dominio relazionale (§32, PCa1) lo confermasse con la stessa struttura, la domanda su un'eventuale estensione di `02` (nuova famiglia "CO01-CO0N") andrebbe posta esplicitamente in quella sede, non qui.
2. **Se l'identità temporanea (§11, §32 PCa3) meriti un proprio codice nel Reference Model.** `01` §6 la definisce come principio, ma `02` non le assegna un codice di famiglia proprio (a differenza di identità interna/pubblica/stabile, che restano principi trasversali senza codice dedicato). Resta aperto se, quando un dominio con vera identità temporanea verrà mappato, sia necessaria un'estensione consapevole di `02`.
3. **Come classificare in modo definitivo Professionisti**, il cui Profilo professionale ha "caratteristiche fondazionali limitate" (`domain-dependency-map.md` §4) ma non è indipendente da una Persona: se debba essere trattato come un'estensione del dominio fondazionale Persone, come un dominio applicativo a sé, o come un caso intermedio non ancora previsto dalla classificazione di §7.
4. **Se la nozione di "moderazione", oggi trattata come "funzione trasversale, non un dominio di business proprio" (`imprese.md` §15), debba in futuro ricevere un proprio dominio (con una propria proprietà di fatti, per esempio le decisioni di moderazione stesse) o restare permanentemente una funzione senza Aggregate Root proprio.** Nessuno dei quattro mapping la tratta come dominio: tutti la trattano come causa esterna di una transizione di S07, senza mai possederne il fatto stesso.
5. **Se il pattern "più Aggregate Root nello stesso dominio" (PC2, §32 PCa8) richieda una propria regola esplicita in `01-principi-mapping.md` §3**, che oggi presenta l'Aggregate Root al singolare per ciascun dominio, o se la formulazione già presente in `02` §3 ("ogni dominio ha il proprio Aggregate Root... o gli Aggregate Root") sia già sufficiente.

---

## 35. Aspetti rinviati

I punti seguenti richiedono il lavoro dei futuri Physical Domain Mapping (per i domini non ancora progettati) o l'evoluzione della documentazione fondazionale, e non sono anticipati da questo documento.

1. **Struttura fisica e Physical Domain Mapping proprio della Tassonomia condivisa.** Referenziata da tutti e quattro i domini già mappati (Lingua, Competenza, Settore, Territorio) ma non ancora oggetto di un proprio documento di mapping fisico: la sua struttura resta sospesa fino a quando quel dominio non riceverà, a sua volta, un mapping (già segnalato in `persone.md` §14 punto 6 e `imprese.md` §24; qui riconfermato come aspetto trasversale, non locale a un solo dominio).
2. **Physical Domain Mapping di Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi.** Ciascuno dovrà applicare questo documento e verificare, punto per punto, quali pattern Candidati (§32) si consolidano e quali restano isolati.
3. **Riconciliazione logica di Organizzazioni istituzionali, Servizi, Immobiliare, Finanziamenti e ogni altro dominio candidato non ancora modellato.** Nessuna decisione su questi domini è anticipata da questo documento, coerentemente con il vincolo esplicito di non anticipazione.
4. **Decisione su un futuro dominio Privacy** (anonimizzazione, diritto di cancellazione, distruzione fisica dei dati), già segnalata come necessaria da `persone.md` §14 punto 5 e da `domain-model.md` §11, non affrontata da nessuno dei quattro mapping né da questo documento.
5. **Eventuale estensione di `02-reference-model.md`** per le famiglie di pattern emerse come candidate in questo documento (Contestazione, Identità temporanea come famiglia a sé) qualora un secondo dominio le confermi.
6. **Ogni dettaglio di rappresentazione fisica** (come i pattern qui formalizzati verranno tradotti in una struttura concreta) resta interamente rinviato ai piani di migrazione, fuori dal perimetro di questo documento e di ogni documento a questo livello.

---

## 36. Impatti sulla documentazione esistente

Questo documento non modifica alcun documento esistente. Le osservazioni seguenti sono elencate esclusivamente per una futura decisione, distinguendo le quattro categorie richieste.

| # | Osservazione | Documento potenzialmente impattato | Categoria |
|---|---|---|---|
| 1 | La Tassonomia condivisa (Lingua, Competenza, Settore, Territorio) è referenziata da quattro domini su quattro già mappati, ma non ha ancora un proprio documento logico dedicato né un proprio Physical Domain Mapping | `docs/architecture/logical/` (nuovo documento), `domain-mapping/tassonomia-condivisa.md` (futuro) | Decisione da ratificare — quando la sequenza di priorità dei domini futuri verrà stabilita, valutare se anticipare il mapping di questo dominio di catalogo prima di altri, data la sua natura trasversale |
| 2 | `02-reference-model.md` non assegna un codice di famiglia dedicato al pattern "Contestazioni e conflitti", oggi modellato solo in `appartenenze.md` §15 | `docs/architecture/physical/02-reference-model.md` | Allineamento consigliato — da valutare come estensione consapevole (`02` §18 decisione 7) solo dopo che un secondo dominio relazionale confermi il pattern (§32 PCa1), non prima |
| 3 | `01-principi-mapping.md` §3 presenta l'Aggregate Root al singolare per ciascun dominio; Mercati Internazionali ha introdotto, con motivazione, un dominio con più Aggregate Root distinti | `docs/architecture/physical/01-principi-mapping.md` | Allineamento consigliato — valutare se aggiungere una riga esplicita che riconosca la possibilità di più Aggregate Root per lo stesso dominio proprietario, coerentemente con quanto `02` §3 già lascia intendere |
| 4 | La discrepanza terminologica `PersonaCancellata` vs "Archiviato" (glossario di `reconciliation-report.md` §8.2) resta esplicitamente non risolta da `persone.md` stesso, in attesa di un futuro dominio Privacy | `docs/architecture/logical/persone.md`, `docs/architecture/logical/reconciliation-report.md` | Decisione da ratificare — già segnalata da `persone.md` come questione rinviata; nessuna azione richiesta da questo documento |
| 5 | Nessuna incoerenza reale (contraddizione su chi possiede un fatto, sovrapposizione strutturale non dichiarata) è stata riscontrata tra i quattro Physical Domain Mapping durante il confronto sistematico condotto per questo documento | — | Nessun intervento richiesto — le uniche tensioni riscontrate (righe 1-4 sopra) erano già segnalate esplicitamente nei documenti stessi come questioni aperte o rinviate, non come incoerenze non dichiarate |
| 6 | Stato attuale verificato direttamente su `domain-dependency-map.md`: le righe D6, D7 e D8 (relative a Mercati Internazionali) sono già "Consolidata"; solo la riga D9 (Mercati Internazionali → Appartenenze, verifica del titolo di rappresentanza) è marcata "Provvisoria — da confermare in `domain-mapping/mercati-internazionali.md`". Il Physical Domain Mapping di Mercati Internazionali, nel proprio controllo finale, dichiara che "le righe D6-D9 sono integralmente confermate da questo mapping... nessuna modifica è proposta a quel documento" (`mercati-internazionali.md` §32 riga 5), soddisfacendo esattamente la condizione di conferma che la Dependency Map stessa poneva per la sola riga D9 | `docs/architecture/physical/domain-dependency-map.md`, riga D9 | Allineamento consigliato — aggiornare lo stato della sola riga D9 da "Provvisoria" a "Consolidata" nella Dependency Map, poiché la condizione di conferma che la riga stessa poneva ("da confermare in `domain-mapping/mercati-internazionali.md`") risulta soddisfatta; questo documento non applica la modifica, la segnala soltanto. Le righe D6-D8 non richiedono alcun intervento, essendo già "Consolidata" |

---

## 37. Controllo finale

### 37.1 Verifica di coerenza interna

| # | Verifica | Esito |
|---|---|---|
| 1 | Ogni regola Fondazionale è supportata da almeno due domini indipendenti o da una derivazione diretta da un principio già consolidato in `01`-`04` | Verificato — ciascuna regola PF1-PF20 cita esplicitamente la propria fonte (§8-§24); nessuna regola Fondazionale si basa su un solo dominio senza derivazione da un principio già consolidato |
| 2 | Nessuna decisione locale (§33) è stata generalizzata | Verificato — PL1-PL7 sono esplicitamente dichiarate non generalizzabili, con motivazione |
| 3 | Nessuna decisione di un dominio futuro non ancora progettato è stata anticipata in modo definitivo | Verificato — ogni menzione di Collaborazioni, Opportunità, Professionisti, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi, Organizzazioni istituzionali, Servizi, Immobiliare, Finanziamenti è marcata esplicitamente "da confermare" o "candidata" (§7, §10.5, §32, §34) |
| 4 | Il principio di proprietà delle relazioni (PF4) è formulato senza ambiguità | Verificato — la formulazione al §10.1 è identica, parola per parola, a quella richiesta dal mandato, con l'elenco completo di ciò che il dominio relazionale possiede e di ciò che i domini dei soggetti mantengono |
| 5 | Autonomia e isolamento non sono confusi | Verificato — §10.1 dichiara esplicitamente che il dominio relazionale referenzia i soggetti (non li ignora): l'autonomia riguarda la proprietà della semantica, non l'assenza di ogni riferimento; §7 conferma che anche i domini fondazionali, pur autonomi, dipendono da Tassonomia condivisa e da Identità & Accessi in modo di supporto |
| 6 | Riferimenti esterni e dipendenze sono distinti | Verificato — §11 definisce il riferimento esterno opaco come un caso specifico di riferimento (§6), mai equiparato a una dipendenza necessaria generica; §20 tratta le dipendenze come categoria distinta e più ampia |
| 7 | Stati, verifiche, visibilità e autorizzazioni restano assi indipendenti | Verificato — §12, §15, §16, §17 sono trattati in sezioni separate, ciascuna con la propria tabella di distinzioni; nessuna sezione fonde i concetti delle altre |
| 8 | Storico di dominio e audit tecnico non sono confusi | Verificato — PF9 (§13) li dichiara esplicitamente distinti, e nessuna sezione di questo documento introduce un concetto di log tecnico |
| 9 | Pubblicazione e proprietà del dato non sono confuse | Verificato — PF12/PF13 (§16) e PC13 (§22) dichiarano esplicitamente che la pubblicazione non trasferisce mai la proprietà |
| 10 | Ogni eccezione è esplicita e motivata | Verificato — §25 fissa la procedura in sette punti; l'unico esempio concreto citato (`PersonaCancellata`, §24/§33) è verificato come conforme allo schema |
| 11 | Nessuna contraddizione con la Dependency Map | Verificato — §7, §20, §21 riprendono le classificazioni e le decisioni della Dependency Map senza alterarle; lo stato attuale di ciascuna riga citata (incluso D9, l'unica ancora "Provvisoria" tra D6-D9) è stato controllato direttamente su `domain-dependency-map.md`, non presunto; l'unico aggiornamento suggerito (la sola riga D9, da Provvisoria a Consolidata) è segnalato al §36, non applicato direttamente |
| 12 | Nessuna contraddizione con i quattro mapping approvati | Verificato — ogni citazione da `persone.md`, `imprese.md`, `appartenenze.md`, `mercati-internazionali.md` riporta il paragrafo esatto; nessuna regola di questo documento richiede una lettura diversa da quella già approvata in quei documenti |
| 13 | Tutti i riferimenti documentali sono corretti | Verificato — ogni citazione è stata controllata contro il testo effettivo dei documenti letti integralmente (§3) durante la stesura |
| 14 | Nessun contenuto implementativo vietato è presente | Verificato — nessuna menzione di SQL, tabelle, colonne, chiavi, indici, trigger, tipi fisici, API, endpoint, framework, linguaggi, persistenza o deployment in nessuna sezione dal §1 al §36; le uniche menzioni di tecnologia sono nella nota introduttiva e in questo stesso paragrafo di verifica |
| 15 | Il riepilogo finale corrisponde al contenuto effettivo del documento | Verificato — si veda il Riepilogo finale, che riporta esclusivamente cataloghi e conteggi verificabili per lettura diretta delle sezioni corrispondenti |

### 37.2 Verifica di assenza di contenuto tecnico

| # | Verifica | Esito |
|---|---|---|
| 1 | Assenza di SQL | Verificato |
| 2 | Assenza di schema di database (tabelle, colonne, chiavi, indici, trigger, vincoli tecnici) | Verificato |
| 3 | Assenza di riferimenti a PostgreSQL o Supabase come scelta di progetto | Verificato — nominati solo nella nota introduttiva come cosa il documento esclude |
| 4 | Assenza di API, endpoint, framework, linguaggi | Verificato |
| 5 | Assenza di dettagli di persistenza o di deployment | Verificato |
| 6 | Assenza di meccanismi infrastrutturali (code, broker, trigger di propagazione) | Verificato — esplicitamente escluso anche dalla trattazione degli eventi di dominio (§19, PF16) |

### 37.3 Correzioni applicate durante la revisione conclusiva

Dopo la lettura integrale di `imprese.md` e `appartenenze.md` (Physical Domain Mapping, non letti per intero nella prima stesura) e la rilettura di `persone.md`, `mercati-internazionali.md`, `domain-dependency-map.md`, `01`, `02` e `03`, ogni voce dei cataloghi PF1-PF20, PC1-PC14, PP1-PP4, PCa1-PCa8, PL1-PL7 e PV1-PV14 è stata riverificata contro il testo integrale delle fonti citate. L'esito è che nessuna voce dei cataloghi richiedeva una riclassificazione di livello (nessuna Candidata o Locale era stata promossa indebitamente; nessuna Consolidata era priva di supporto): la struttura, la numerazione e i codici restano quelli della prima stesura. Sono state individuate e corrette due imprecisioni puntuali, nessuna delle quali incide sulla regola fondazionale sulla proprietà delle relazioni (§10) né su alcun altro catalogo:

| # | Imprecisione riscontrata | Correzione applicata |
|---|---|---|
| 1 | Il §36 (Impatti sulla documentazione esistente) affermava che le righe D6, D7, D8 e D9 della Dependency Map "erano marcate 'Provvisoria'". La lettura diretta di `domain-dependency-map.md` mostra invece che solo D9 è marcata "Provvisoria — da confermare in `domain-mapping/mercati-internazionali.md`"; D6, D7 e D8 sono già "Consolidata" | Il §36, riga 6, è stato riscritto per citare esattamente lo stato attuale (solo D9 provvisoria), lo stato proposto (D9 → Consolidata) e la motivazione (la condizione di conferma posta dalla riga D9 stessa è soddisfatta dal controllo finale di `mercati-internazionali.md`, che dichiara le righe D6-D9 "integralmente confermate... nessuna modifica è proposta a quel documento"); il §37.1 punto 11 è stato aggiornato in coerenza |
| 2 | Il §18 (Contestazioni e conflitti) attribuiva a `appartenenze.md` §15 i termini "Duplicazione" e "Impersonificazione" come propri scenari di contestazione. La lettura integrale di `appartenenze.md` mostra che quel paragrafo non tratta questi due scenari con questi termini: "Duplicazione" compare altrove nel documento (§24) con un significato diverso (duplicazione di dati tra domini, non conflitto tra dichiarazioni); "Impersonificazione" non compare affatto | La tabella del §18 è stata corretta: la riga "Duplicazione" è stata ricondotta esplicitamente a "Dichiarazioni discordanti" (lo scenario realmente descritto da `appartenenze.md` §15); la riga "Impersonificazione" è stata dichiarata esplicitamente non evidenziata da alcun mapping, riportata solo perché richiesta dal mandato di questo documento, e mantenuta come parte del pattern Candidato (PCa1) invece che presentata come già confermata |

Nessuna altra imprecisione è stata riscontrata nelle citazioni puntuali ai quattro Physical Domain Mapping, alla Dependency Map o a `01`-`04` verificate durante questa revisione.

---

## Riepilogo finale

**Natura del documento.** Questo documento è il riferimento fondazionale per la progettazione di ogni dominio della piattaforma, presente e futuro. Non descrive Persone, Imprese, Appartenenze o Mercati Internazionali: estrae, dal confronto sistematico dei loro quattro Physical Domain Mapping già approvati, le regole che quei domini condividono davvero, distinguendole rigorosamente dalle varianti legittime, dalle eccezioni motivate e dalle decisioni locali non generalizzabili (§4).

**Regola fondazionale centrale.** Formalizzata senza ambiguità al §10.1: una relazione di business autonoma appartiene al dominio che la rappresenta, non ai domini dei soggetti coinvolti, che mantengono esclusivamente la proprietà della propria identità e del proprio modello interno; il dominio relazionale referenzia quei soggetti sempre e solo tramite un riferimento esterno opaco. Confermata indipendentemente da Appartenenze (relazione soggetto↔soggetto) e da Mercati Internazionali (relazione soggetto↔contesto), la regola soddisfa doppiamente il criterio di promozione a Fondazionale stabilito dal metodo di questo stesso documento (§4). La sua applicabilità futura a Collaborazioni, Opportunità, Professionisti, Eventi, Organizzazioni istituzionali, Immobiliare, Servizi e Finanziamenti è segnalata come candidata (§10.5, §32), mai anticipata come decisione definitiva.

**Cataloghi prodotti.** Venti regole Fondazionali (§29, PF1-PF20); quattordici pattern Consolidati (§30, PC1-PC14); quattro pattern Preferenziali (§31, PP1-PP4); otto pattern Candidati (§32, PCa1-PCa8); quattordici pattern Vietati (§26.1, PV1-PV14); sette decisioni locali non generalizzabili (§33, PL1-PL7). Due matrici di verifica (§28): una che associa ogni pattern principale ai domini che lo confermano, una che indica quali pattern candidati vanno verificati in quali domini futuri. Una checklist riutilizzabile di trentaquattro punti per ogni futuro Physical Domain Mapping (§27).

**Incoerenze riscontrate nella documentazione esistente.** Nessuna incoerenza reale (contraddizione su chi possiede un fatto, sovrapposizione strutturale non dichiarata) è stata trovata tra i quattro Physical Domain Mapping durante il confronto sistematico, confermato dalla lettura integrale di tutti e quattro condotta nella revisione conclusiva (§3, §37.3). Sei osservazioni sono state registrate al §36, di cui una senza alcun intervento richiesto, tre come allineamento consigliato o decisione da ratificare (l'aggiornamento di stato della sola riga D9 della Dependency Map da Provvisoria a Consolidata — D6, D7 e D8 sono già Consolidata; l'eventuale estensione di `02` per il pattern Contestazioni; l'eventuale riconoscimento esplicito in `01` §3 di più Aggregate Root per lo stesso dominio), e due già segnalate come questioni aperte dai documenti stessi (Tassonomia condivisa priva di mapping proprio; discrepanza terminologica su `PersonaCancellata`).

**Esito della revisione conclusiva.** La lettura integrale di `imprese.md` e `appartenenze.md`, non completata nella prima stesura, non ha richiesto modifiche alla struttura, alla numerazione né ai codici dei cataloghi: ha prodotto due correzioni puntuali di citazione (lo stato esatto della riga D9 della Dependency Map; la fonte reale di due voci del pattern candidato sulle contestazioni), entrambe applicate e documentate al §37.3.

**Decisioni consolidate vs decisioni da ratificare.** Sono considerate consolidate, senza necessità di ulteriore ratifica, tutte le regole Fondazionali (PF1-PF20) e Consolidate (PC1-PC14), essendo derivate direttamente da principi già vincolanti in `01`-`04` o confermate da almeno due domini indipendenti. Richiedono ancora ratifica, tramite la conferma di un secondo dominio indipendente o tramite una decisione di prodotto esplicita: tutti i pattern Candidati (§32, PCa1-PCa8), l'eventuale estensione del Reference Model per Contestazioni e Identità temporanea (§34), e le quattro osservazioni documentali del §36 marcate "allineamento consigliato" o "decisione da ratificare".

**Cosa questo documento non ha fatto.** Non ha anticipato la struttura di alcun dominio non ancora progettato. Non ha modificato `01`-`04`, la Dependency Map o i quattro Physical Domain Mapping. Non ha introdotto alcun contenuto implementativo. Non ha promosso a Fondazionale o Consolidata alcuna soluzione che non superasse la soglia di evidenza richiesta dal proprio metodo (§4).

Questo documento è pronto per essere usato come riferimento vincolante da ciascuno dei futuri Physical Domain Mapping (Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti Editoriali, Osservatorio, Identità & Accessi, e ogni dominio successivo alla riconciliazione logica), insieme a `01`-`04` e alla Dependency Map, e come strumento di revisione incrociata per verificare, nel tempo, se un nuovo pattern candidato meriti di essere promosso, retrocesso o confermato.
