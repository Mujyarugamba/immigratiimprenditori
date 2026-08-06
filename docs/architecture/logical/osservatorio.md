# Logical Data Model — Dominio OSSERVATORIO

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, dashboard, strumenti di business intelligence, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/reconciliation-report.md`](./reconciliation-report.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/eventi.md`](./eventi.md), [`docs/architecture/logical/contenuti.md`](./contenuti.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md) (predecessore), [`docs/architecture/logical/organizzazioni.md`](./organizzazioni.md), [`docs/architecture/logical/identita-accessi.md`](./identita-accessi.md).
> Scopo del documento: definire il modello logico del dominio Osservatorio, già anticipato in `docs/domain-model.md` §1 come dominio di "Supporto" ("aggregare dati provenienti da altri domini... in report e statistiche leggibili... non è fonte primaria di dati: consuma e sintetizza, non genera fatti economici") e richiamato dai documenti logici dei domini sorgente come destinatario di dati aggregabili, mai come loro proprietario. Questo documento conferma Osservatorio come dominio autonomo. **Questa revisione chiude il perimetro del ciclo 1** (§15.A–§15.D) sufficiente a un Physical DDL-ready senza nuove decisioni semantiche.
> Carattere autonomo del dominio. Osservatorio rappresenta la produzione di conoscenza aggregata, documentata e metodologicamente trasparente sull'imprenditoria immigrata in Italia. Nel modello generale ciò include fenomeni, indicatori, serie, confronti, qualità e prodotti analitici. **Nel ciclo 1** il dominio si riduce a un **registro di indicatori statistici e valori aggregati pubblicabili**, non a una piattaforma di business intelligence (§15.A).
> Principio della conoscenza derivata. L'Osservatorio **non possiede** i dati operativi dei domini sorgente: produce conoscenza **derivata**, mai conoscenza operativa alternativa. Un dato aggregato non sostituisce né modifica i fatti dei domini sorgente (flusso unidirezionale).
> Distinzione tra dato operativo, dato esterno, indicatore, analisi e contenuto editoriale. Un **dato operativo** vive nel dominio sorgente. Un **dato esterno** proviene da una Fonte esterna. Un **Indicatore** è una definizione metodologica stabile. Un'**analisi** interpreta valori. Un **Contenuto** (`logical/contenuti.md`) è narrazione distinta dal dato statistico. Nel ciclo 1 i prodotti analitici narrativi (Rapporto, Dossier, Scheda) restano di Contenuti, non di Osservatorio (§15.A, §15.C).
> Carattere del documento. Esclusivamente logico e di dominio. I §§1–14 descrivono il modello generale metodologico; **dove il ciclo 1 restringe, prevale §15**.

## Indice

1. [Responsabilità del dominio](#1-responsabilità-del-dominio)
2. [Entità e concetti principali](#2-entità-e-concetti-principali)
3. [Natura del dato osservato](#3-natura-del-dato-osservato)
4. [Fenomeni e ambiti di osservazione](#4-fenomeni-e-ambiti-di-osservazione)
5. [Perimetri, popolazioni e unità di osservazione](#5-perimetri-popolazioni-e-unità-di-osservazione)
6. [Dimensioni di analisi e classificazioni](#6-dimensioni-di-analisi-e-classificazioni)
7. [Fonti e provenienza dei dati](#7-fonti-e-provenienza-dei-dati)
8. [Indicatori, misure e regole di calcolo](#8-indicatori-misure-e-regole-di-calcolo)
9. [Serie storiche, confronti e comparabilità](#9-serie-storiche-confronti-e-comparabilità)
10. [Qualità, completezza e incertezza](#10-qualità-completezza-e-incertezza)
11. [Aggregazione, anonimizzazione e riservatezza](#11-aggregazione-anonimizzazione-e-riservatezza)
12. [Ciclo di vita, revisione e pubblicazione](#12-ciclo-di-vita-revisione-e-pubblicazione)
13. [Regole, invarianti e casi limite](#13-regole-invarianti-e-casi-limite)
14. [Eventi di dominio](#14-eventi-di-dominio)
15. [Decisioni finali, ciclo 1 e prontezza Physical](#15-decisioni-finali-ciclo-1-e-prontezza-physical)

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Osservatorio rappresenta la produzione di conoscenza aggregata, documentata e metodologicamente trasparente sui fenomeni collettivi dell'imprenditoria di origine immigrata in Italia: quali fenomeni vengono osservati, con quale perimetro e popolazione di riferimento, attraverso quali fonti e metodologie, con quali indicatori e valori, con quale qualità e incertezza, e attraverso quali prodotti analitici (rapporti, dossier, schede) tali conoscenze vengono pubblicate.

**Quali problemi risolve.** Rende possibile leggere fenomeni collettivi (nascita e crescita delle imprese, occupazione generata, apertura ai Mercati internazionali, partecipazione a Opportunità ed Eventi) senza intaccare né esporre i dati individuali dei domini sorgente (§8, §11); distingue sempre un dato operativo da un dato derivato, un'osservazione da un indicatore, un valore calcolato da un'interpretazione (§3, §8); gestisce la qualità del dato come insieme di dimensioni indipendenti, evitando un giudizio unico e ingannevole (§10); previene la reidentificazione di soggetti individuali attraverso soglie di aggregazione e anonimizzazione (§11); consente confronti territoriali, settoriali e temporali solo quando metodologicamente validi, evitando di scambiare una correlazione per una causalità (§9); costituisce, insieme a Persone, Imprese, Opportunità e Mercati Internazionali, una delle funzioni strategiche della piattaforma, non un semplice sottoprodotto statistico (introduzione strategica).

**Cosa rientra nel dominio.** Nel modello generale: fenomeni e perimetri (§4, §5); fonti, misure e indicatori (§7, §8); aggregazioni e serie (§9, §11); metodologie (§8); qualità (§10); revisioni e pubblicazione (§12); interpretazioni e prodotti analitici (§2). **Nel ciclo 1 prevale §15**: solo Indicatore (AR), FonteStatistica e Valori aggregati pubblicabili, con dimensioni e lifecycle ridotti; rapporti/dossier/schede/interpretazioni non sono owned da Osservatorio.

**Cosa NON rientra nel dominio.**
- Non rientrano i dati operativi di **Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi** e **Mercati internazionali**: restano posseduti dai rispettivi domini sorgente, che l'Osservatorio referenzia e aggrega senza mai incorporarli né duplicarli (introduzione, principio della conoscenza derivata).
- Non rientrano i **Contenuti editoriali**: un Contenuto può essere generato a partire da un'analisi dell'Osservatorio (`logical/contenuti-editoriali.md` §1, §3, §7, §13), ma il Contenuto è una rappresentazione narrativa distinta dal dato statistico che lo origina; l'Osservatorio non gestisce redazione, autorialità o pubblicazione editoriale.
- Non rientrano le **fonti statistiche** in senso di archivio: l'Osservatorio modella la Fonte come concetto di provenienza e attribuzione (§7), non come un sistema di gestione o conservazione documentale.
- Non rientrano i **documenti**: un documento a supporto di una Fonte è referenziato (§7), non gestito come libreria propria di questo dominio.
- Non rientra la **ricerca generale**: il dominio Ricerca può rendere trovabili i prodotti analitici dell'Osservatorio, ma le regole di ricerca restano di competenza di quel dominio.
- Non rientra la **reportistica operativa** né il **monitoraggio tecnico**: l'Osservatorio produce conoscenza di interesse pubblico sui fenomeni economici e sociali osservati, non cruscotti gestionali interni sul funzionamento della piattaforma.
- Non rientrano **Identità & Accessi**: nessuna informazione di questo dominio genera di per sé un permesso tecnico o un diritto di accesso (§11, §12).

**Chiarimenti espliciti.** L'Osservatorio:
- **non governa Persone o Imprese**: non ne definisce l'identità, le qualifiche o lo stato, che restano di competenza esclusiva dei rispettivi domini;
- **non assegna identità**: un'unità di osservazione (§5) è sempre un riferimento a un'entità già esistente in un dominio sorgente, mai una nuova identità creata da questo dominio;
- **non determina automaticamente verità individuali**: un valore aggregato descrive un fenomeno collettivo, non uno specifico soggetto (§3, §11);
- **non attribuisce qualifiche**: un Indicatore non genera una CompetenzaDichiarata, una QualificaProfessionale o alcun altro attributo dei domini sorgente;
- **non produce diritti di accesso**: nessun risultato di questo dominio genera un permesso tecnico;
- **non modifica automaticamente i domini sorgente**: un dato aggregato non retroagisce mai sui fatti operativi che lo hanno originato (principio della conoscenza derivata, §13, regola 5).

**Quali domini utilizza.**
- **Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Eventi, Mercati Internazionali** — come domini sorgente di dati aggregabili, referenziati senza essere incorporati (§4, §5, §7).
- **Contenuti Editoriali** — come possibile destinatario delle proprie analisi, e occasionalmente come fonte di contesto narrativo.
- **Tassonomia Condivisa** — per Dimensioni di analisi e Classificazioni comuni (territorio, settore, lingua, §6).
- **Fonti esterne** — istituti statistici, camere di commercio, enti pubblici, università, organizzazioni internazionali (§7).

**Quali domini utilizzano Osservatorio.**
- **Contenuti Editoriali** — per generare Contenuti a partire da analisi o sintesi dell'Osservatorio (`logical/contenuti-editoriali.md` §3, §13), senza che l'Osservatorio ne gestisca la redazione.
- **Ricerca** — per rendere trovabili i prodotti analitici pubblicati (rapporti, dossier, schede, §2).
- La piattaforma nel suo complesso — come funzione strategica di interesse pubblico, accanto a Persone, Imprese, Opportunità e Mercati Internazionali (introduzione strategica).

**Perché Osservatorio è un dominio autonomo.** L'Osservatorio ha un proprio modello di qualità multidimensionale (§10) che nessun dominio sorgente replica; una propria disciplina metodologica versionata e storicizzabile (§8, §12); un proprio ciclo di vita a più assi capace di distinguere acquisizione, elaborazione, verifica, pubblicazione, validità temporale, visibilità e contestazione (§12); e una responsabilità specifica — prevenire la reidentificazione di soggetti individuali attraverso l'aggregazione (§11) — che richiede regole proprie, indipendenti da quelle di visibilità dei singoli domini sorgente pur rispettandole. Comprimere l'Osservatorio in una funzione di reportistica di un altro dominio impedirebbe di rispondere a domande proprie del dominio — con quale metodologia è stato calcolato un valore, quanto è affidabile, è comparabile con un anno precedente — e di trattarlo come pilastro strategico a pari titolo con Persone, Imprese, Opportunità e Mercati Internazionali.

**Differenza tra dato operativo, dato statistico, osservazione, misura, indicatore, analisi, rapporto e contenuto editoriale.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Dato operativo | Fatto vivo in un dominio sorgente | Esiste e si evolve indipendentemente da qualsiasi osservazione statistica (§3) |
| Dato statistico | Dato trattato secondo criteri statistici (§3) | Può derivare da un dato operativo, ma ne è una trasformazione, non una copia |
| Osservazione | Entità dipendente (§2) | Un dato elementare raccolto per un fenomeno, in un dato momento, secondo una Fonte |
| Misura | Operazione concettuale (§8) | L'operazione che trasforma una o più Osservazioni in un valore quantitativo o qualitativo |
| Indicatore | Entità autonoma (§2, §8) | Una definizione metodologica stabile che permette di misurare un Fenomeno nel tempo |
| Analisi | Prodotto interpretativo | L'elaborazione e l'interpretazione di uno o più valori di Indicatore secondo un perimetro dichiarato |
| Rapporto | Entità dipendente (§2) | Un prodotto analitico strutturato che raccoglie una o più Analisi, con una propria pubblicazione |
| Contenuto editoriale | Dominio distinto (`logical/contenuti-editoriali.md`) | La narrazione che può raccontare un'Analisi o un Rapporto, restando sempre distinta dal dato che racconta |

---

## 2. Entità e concetti principali

**Nota su Aggregate Root — decisione definitiva per il ciclo 1.** Esiste **un solo Aggregate Root: Indicatore** (§15.A). La Fonte statistica e il Valore dell’Indicatore appartengono al dominio Osservatorio come oggetti del ciclo 1 (Valore subordinato all’Indicatore; Fonte owned dal dominio e referenziabile). Serie, Osservazione, Interpretazione, Rapporto, Dossier, Scheda e Revisione come Aggregate Root autonomi **non** sono ammessi nel ciclo 1: la serie storica è la sequenza dei Valori dello stesso Indicatore; i prodotti narrativi appartengono a Contenuti; le revisioni sono modellate come sostituzione/storicizzazione dei Valori (§15.A).

**Entità del modello generale** — il catalogo seguente descrive il vocabolario metodologico completo; **nel ciclo 1 prevale §15** (solo Indicatore come AR; Fonte e Valore come oggetti inclusi):

| Entità | Descrizione | Ciclo 1 |
|---|---|---|
| **Indicatore** | Definizione metodologica stabile che permette di misurare un Fenomeno osservato nel tempo, con nome, finalità, unità di misura e regola di calcolo dichiarati (§8) | **AR unico** |
| **Metodologia** | Descrizione documentata e versionabile del modo in cui una Fonte, un'Osservazione o un Indicatore vengono trattati per produrre un valore (§8) | Sintetica sull’Indicatore (incluso); versionamento complesso **rinviato** |
| **Fonte** (statistica, amministrativa, interna, esterna) | Origine dichiarata di un'Osservazione o di un dato utilizzato dall'Osservatorio, con responsabile, copertura e limiti propri (§7) | **FonteStatistica** owned (§15.A) |
| **Osservazione** | Dato elementare raccolto per un Fenomeno, riferito a un'unità di osservazione, un periodo e una Fonte (§3, §5) | **Rinviata** / esclusa come persistenza di microdato |
| **Valore dell'Indicatore** | Occorrenza calcolata di un Indicatore per un determinato perimetro e periodo, distinta dalla definizione dell'Indicatore stesso (§8) | **Subordinato all’AR** |
| **Serie storica** | Sequenza ordinata di Valori di uno stesso Indicatore su periodi successivi e comparabili (§9) | **Derivata** (non AR / non tabella autonoma) |
| **Rapporto** | Prodotto analitico strutturato che raccoglie una o più Analisi e Valori, con una propria pubblicazione (§12) | **Escluso** da OSS; narrativo → Contenuti |
| **Dossier** | Prodotto analitico di approfondimento su un fenomeno specifico, tipicamente più estenso e monografico di un Rapporto (§12) | **Escluso** da OSS; narrativo → Contenuti |
| **Scheda territoriale** | Prodotto analitico che sintetizza gli Indicatori disponibili per un Territorio di riferimento (§6, §12) | **Esclusa** da OSS; editoriale → Contenuti |
| **Scheda settoriale** | Prodotto analitico che sintetizza gli Indicatori disponibili per un Settore di riferimento (§6, §12) | **Esclusa** da OSS; editoriale → Contenuti |
| **Interpretazione** | Testo analitico che spiega il significato di uno o più Valori, distinto dalla misura stessa (§8, §13) | **Esclusa** da OSS; → Contenuti |
| **Revisione** | Fatto storicizzato che documenta la modifica di una Metodologia o di un Valore precedentemente pubblicato, senza cancellarlo (§9, §12) | Modello semplice di rettifica Valore (§15.A); non AR |

**Concetti descrittivi e classificazioni** — non hanno vita propria indipendente, ma qualificano le entità autonome o i loro valori:

| Concetto | Descrizione |
|---|---|
| **Fenomeno osservato** | L'oggetto collettivo di osservazione (es. nascita delle Imprese, occupazione generata, §4) |
| **Perimetro di osservazione** | L'insieme di condizioni (territorio, periodo, popolazione) che delimita a cosa un'Osservazione o un Valore si riferiscono (§5) |
| **Unità di osservazione** | L'entità concreta osservata (una Persona, un'Impresa, un territorio, un periodo, §5) |
| **Popolazione di riferimento** | L'insieme di unità a cui un risultato viene riferito (§5) |
| **Universo statistico** | L'insieme teorico completo delle unità che potrebbero essere osservate (§5) |
| **Campione** | Un sottoinsieme dell'universo effettivamente osservato secondo un metodo dichiarato (§5) |
| **Misura** | L'operazione che trasforma una o più Osservazioni in un valore quantitativo o qualitativo (§8) |
| **Dimensione di analisi** | Un asse secondo cui un Valore può essere letto o suddiviso (territorio, settore, periodo, §6) |
| **Classificazione** | Un sistema di categorie usato per assegnare un'unità a una Dimensione (§6) |
| **Variabile** | Un attributo osservabile e misurabile di un'unità di osservazione (§6) |
| **Aggregazione** | L'operazione che combina più Osservazioni o Valori in un unico Valore di livello superiore (§11) |
| **Disaggregazione** | L'operazione che scompone un Valore aggregato secondo una o più Dimensioni (§6, §11) |
| **Periodo di riferimento** | L'intervallo temporale a cui un'Osservazione o un Valore si riferiscono (§5, §9) |
| **Territorio di riferimento** | La Dimensione geografica a cui un'Osservazione o un Valore si riferiscono, coerente con la Tassonomia Condivisa |
| **Settore di riferimento** | La Dimensione settoriale/economica a cui un'Osservazione o un Valore si riferiscono, coerente con la Tassonomia Condivisa |
| **Mercato internazionale di riferimento** | Il riferimento a un Mercato (`logical/mercati-internazionali.md`) quando il Fenomeno osservato lo riguarda |
| **Regola di calcolo** | La formula o il criterio dichiarato che, applicato a una o più Osservazioni, produce un Valore (§8) |
| **Qualità del dato**, **Copertura**, **Completezza**, **Affidabilità**, **Comparabilità** | Dimensioni indipendenti che descrivono l'attendibilità di un'Osservazione o di un Valore (§10) |
| **Stima** | Un Valore prodotto quando l'osservazione diretta non è disponibile o completa, secondo un metodo dichiarato (§3, §8) |
| **Margine di incertezza** | La quantificazione (o qualificazione) dell'incertezza associata a un Valore, in particolare se stimato (§10) |
| **Nota metodologica** | Un testo che documenta limiti, scelte e avvertenze relative a una Metodologia o a un Valore (§8) |
| **Stato di elaborazione**, **Stato di verifica**, **Stato di pubblicazione**, **Visibilità** | Assi di stato distinti applicabili a Osservazioni, Valori, Rapporti e prodotti analitici (§12) |

**Relazioni verso altri domini** — mai incorporazione, sempre riferimento:

| Riferimento | Verso il dominio | Significato |
|---|---|---|
| Unità di osservazione → Persona/Impresa/Appartenenza/Professionista | `logical/persone.md`, `logical/imprese.md`, `logical/appartenenze.md`, `logical/professionisti.md` | L'entità concreta osservata, mai incorporata (§5) |
| Fenomeno → Opportunità/Collaborazione/Evento/Mercato | `logical/opportunita.md`, `logical/collaborazioni.md`, `logical/eventi.md`, `logical/mercati-internazionali.md` | L'ambito applicativo osservato, referenziato per l'aggregazione (§4) |
| Rapporto/Analisi → Contenuto editoriale | `logical/contenuti-editoriali.md` | Un Contenuto può raccontare un'Analisi, restando un'entità distinta (§1, §13) |

**Prodotti analitici (modello generale)** — Rapporto, Dossier, Scheda territoriale, Scheda settoriale: nel modello generale sono prodotti che raccolgono Valori e Interpretazioni. **Nel ciclo 1** non sono owned da Osservatorio: la narrazione e le schede editoriali appartengono a Contenuti; dashboard e serie restano derivate dai Valori (§15.A, §15.C).

---

## 3. Natura del dato osservato

Il dato trattato dall'Osservatorio non è un blocco unico: attraversa una catena di trasformazioni, e ogni stadio ha un significato distinto.

| Tipo di dato | Definizione |
|---|---|
| **Fatto operativo** | Un evento o uno stato realmente accaduto in un dominio sorgente (es. un'Impresa è stata costituita); vive ed evolve in quel dominio, indipendentemente da qualsiasi osservazione |
| **Dato elementare** | La più piccola unità di informazione raccolta su un'unità di osservazione per un Fenomeno, prima di qualsiasi elaborazione |
| **Dato dichiarato** | Un dato riferito da un soggetto (una Persona, un'Impresa) senza verifica indipendente, coerente con il principio di non-automatismo già stabilito in `logical/persone.md` §1 e `logical/professionisti.md` §1 |
| **Dato verificato** | Un dato per cui esiste un riscontro indipendente dalla sola dichiarazione, secondo le regole di verifica del dominio sorgente |
| **Dato amministrativo** | Un dato prodotto da un ente pubblico o da un registro ufficiale nell'esercizio delle proprie funzioni (§7) |
| **Dato statistico** | Un dato trattato secondo criteri e metodologie statistiche, tipicamente derivato da uno o più dati elementari |
| **Dato aggregato** | Un dato ottenuto combinando più Osservazioni o Valori secondo una regola dichiarata, riferito a una popolazione e non a un singolo soggetto (§11) |
| **Dato disaggregato** | Un dato aggregato scomposto secondo una o più Dimensioni di analisi, restando sempre riferito a un insieme e non a un singolo soggetto |
| **Dato stimato** | Un Valore prodotto quando l'osservazione diretta e completa non è disponibile, secondo un metodo dichiarato e con un margine di incertezza esplicito |
| **Dato derivato** | Un Valore calcolato a partire da uno o più altri Valori o Osservazioni, secondo una Regola di calcolo |
| **Dato normalizzato** | Un dato ricondotto a una scala, unità o classificazione comune per renderlo comparabile con altri dati |
| **Dato anonimizzato** | Un dato aggregato trattato in modo tale che non permetta, singolarmente o in combinazione, di identificare un soggetto (§11) |
| **Dato sintetico** | Un Valore che riassume in un unico numero o categoria un fenomeno complesso, tipicamente un Indicatore composito (§8) |
| **Dato provvisorio** | Un Valore pubblicato prima del completamento del ciclo di verifica o di acquisizione, soggetto a possibile revisione (§12) |
| **Dato definitivo** | Un Valore che ha completato il ciclo di verifica e non è più soggetto a revisioni ordinarie salvo rettifica motivata |
| **Dato rettificato** | Un Valore precedentemente pubblicato che è stato corretto a seguito di un errore riconosciuto, con lo storico conservato (§9, §12) |
| **Dato storico** | Un Valore riferito a un periodo passato, conservato come parte di una Serie storica anche dopo eventuali revisioni successive (§9) |

**Principi.**
1. Il dato dell'Osservatorio è sempre **contestualizzato**: non esiste un Valore "in assoluto", ma solo un Valore riferito a un perimetro e a un periodo.
2. Ogni Valore deve avere un **perimetro di osservazione** dichiarato (§5).
3. Ogni Valore deve avere un **periodo di riferimento** dichiarato (§9).
4. Ogni Valore deve avere almeno una **Fonte** o una **Metodologia** dichiarata (§7, §8).
5. Lo stesso Fenomeno può produrre **Valori differenti** con **Metodologie differenti**: la differenza non è un errore, ma una conseguenza di scelte metodologiche distinte, che devono essere dichiarate (§8, §9).
6. Un **dato aggregato non deve essere riutilizzato come fatto individuale**: un Valore riferito a una popolazione non deve mai essere interpretato o presentato come se descrivesse un singolo soggetto (§11, §13).

---

## 4. Fenomeni e ambiti di osservazione

I Fenomeni osservabili dall'Osservatorio sono definiti in modo aperto, ma devono sempre essere riconducibili a un dominio sorgente o a una fonte esterna dichiarata. Sono organizzati per area tematica, senza che questa organizzazione costituisca una classificazione ufficiale (§6):

**Presenza e struttura imprenditoriale**
- Presenza di imprenditori di origine immigrata; numero e distribuzione delle Imprese (`logical/imprese.md`); nascita, crescita, trasformazione e cessazione delle Imprese; sopravvivenza e longevità; dimensione; forma organizzativa; settore; distribuzione territoriale e settoriale.

**Occupazione ed economia**
- Occupazione generata; lavoratori impiegati; contributo economico e sociale; accesso al credito; accesso a incentivi e Opportunità (`logical/opportunita.md`); accesso ai servizi.

**Relazioni e reti**
- Partecipazione a Collaborazioni (`logical/collaborazioni.md`); reti associative; relazioni istituzionali.

**Apertura internazionale**
- Apertura ai Mercati internazionali (`logical/mercati-internazionali.md`); export; import.

**Servizi professionali e formazione**
- Presenza di Professionisti (`logical/professionisti.md`); formazione; sicurezza sul lavoro.

**Partecipazione a iniziative**
- Partecipazione a Eventi e relativa affluenza (`logical/eventi.md`).

**Sostenibilità e innovazione**
- Innovazione; digitalizzazione; sostenibilità; energia; immobili e spazi per attività.

**Altri fenomeni**
- Ogni altro fenomeno coerente con la missione della piattaforma, purché riconducibile a un Fenomeno osservato dichiarato e a un Perimetro di osservazione esplicito (§5).

**Principio.** L'osservazione di una correlazione tra due Fenomeni (es. partecipazione a un Evento e successiva apertura a un Mercato) non implica automaticamente una relazione causale tra i due: l'attribuzione di causalità richiede un'analisi metodologica dedicata e deve essere sempre dichiarata come tale, mai presentata come fatto acquisito (§9, §13).

---

## 5. Perimetri, popolazioni e unità di osservazione

| Concetto | Definizione |
|---|---|
| **Popolazione totale** | L'insieme completo di unità che, in linea di principio, potrebbero essere pertinenti al Fenomeno osservato |
| **Popolazione osservabile** | Il sottoinsieme della popolazione totale per cui esiste, in linea di principio, una via di osservazione (una Fonte, un dominio sorgente) |
| **Popolazione effettivamente osservata** | Il sottoinsieme della popolazione osservabile per cui esiste effettivamente un'Osservazione raccolta |
| **Universo teorico** | La definizione concettuale e completa delle unità pertinenti al Fenomeno, indipendentemente dalla loro effettiva disponibilità |
| **Universo disponibile** | Le unità dell'universo teorico effettivamente accessibili attraverso le Fonti disponibili alla piattaforma |
| **Campione** | Un sottoinsieme dell'universo disponibile selezionato secondo un metodo dichiarato, usato per stimare caratteristiche dell'universo teorico |
| **Sottoinsieme** | Una porzione qualsiasi di una popolazione, definita secondo uno o più criteri, senza necessariamente costituire un Campione statistico |
| **Coorte** | Un insieme di unità che condividono un'origine temporale comune (es. le Imprese costituite in un dato anno), osservate nel tempo |
| **Gruppo di confronto** | Un insieme di unità usato come termine di paragone rispetto a un altro insieme, secondo criteri di comparabilità dichiarati (§9) |
| **Unità di osservazione** | L'entità concreta su cui viene raccolta un'Osservazione (una Persona, un'Impresa, un territorio, un periodo) |
| **Unità di analisi** | Il livello a cui un Valore viene effettivamente calcolato e presentato, che può coincidere con l'unità di osservazione o rappresentarne un'aggregazione |
| **Soglia minima di aggregazione** | Il numero minimo di unità di osservazione richiesto perché un Valore possa essere calcolato o pubblicato, a tutela della riservatezza (§11) |

**Le unità di osservazione possono riguardare:**
Persone (`logical/persone.md`); Imprese (`logical/imprese.md`); Appartenenze (`logical/appartenenze.md`); Professionisti (`logical/professionisti.md`); Opportunità (`logical/opportunita.md`); Collaborazioni (`logical/collaborazioni.md`); Eventi (`logical/eventi.md`); Mercati (`logical/mercati-internazionali.md`); territori; settori; periodi; organizzazioni esterne (Fonti, §7).

**Distinzioni sempre da mantenere.**
- **Unità osservata** — l'entità concreta da cui proviene un'Osservazione.
- **Fenomeno misurato** — il concetto astratto che l'Osservazione documenta (§4).
- **Livello di aggregazione** — il grado a cui le Osservazioni vengono combinate per produrre un Valore.
- **Popolazione a cui il risultato viene riferito** — l'insieme di unità a cui il Valore finale, dopo aggregazione, viene effettivamente attribuito; può essere più ampio, più ristretto o diverso rispetto all'unità osservata originaria, e questa differenza deve essere sempre dichiarata.

---

## 6. Dimensioni di analisi e classificazioni

**Dimensioni di analisi previste (almeno):** territorio; settore; attività economica; forma organizzativa; dimensione d'impresa; anno di nascita; anzianità; stato dell'Impresa; mercato servito; Paese; area geografica; fascia temporale; genere (solo se lecito, dichiarato e metodologicamente giustificato); fascia di età (solo in forma compatibile con riservatezza e finalità); tipo di Opportunità; tipo di Collaborazione; categoria professionale; tipologia di Evento; lingua (quando pertinente e non dedotta automaticamente, coerente con `logical/persone.md` §13 e `logical/mercati-internazionali.md` §9 sul divieto di deduzione automatica); modalità di partecipazione; stato di verifica; fonte; livello di qualità.

**Distinzioni tra tipi di classificazione.**

| Tipo | Definizione |
|---|---|
| **Classificazione interna** | Un sistema di categorie definito e mantenuto dalla piattaforma per proprie esigenze analitiche |
| **Classificazione ufficiale** | Un sistema di categorie definito da un ente esterno riconosciuto (es. una classificazione settoriale nazionale), adottato come riferimento |
| **Classificazione derivata** | Una classificazione ottenuta applicando una regola a una o più classificazioni preesistenti, senza costituire una fonte autonoma |
| **Classificazione temporanea** | Una classificazione usata in attesa di consolidamento, dichiarata come non definitiva |
| **Riclassificazione** | L'operazione di attribuire a un'unità già classificata una categoria diversa, a seguito di un cambiamento del criterio o dell'unità stessa |
| **Mappatura tra classificazioni diverse** | La corrispondenza dichiarata tra categorie di due sistemi di classificazione differenti, necessaria per confronti tra fonti eterogenee (§7, §9) |

**Principio.** Lo stesso dato deve poter essere analizzato secondo più Dimensioni contemporaneamente (es. per territorio e per settore) senza che questo alteri il significato originario del dato: la Dimensione è una lente di lettura, non una trasformazione del Fenomeno osservato.

---

## 7. Fonti e provenienza dei dati

**Tipi di Fonte previsti (almeno):** dati dei domini interni della piattaforma; fonti amministrative; registri pubblici; camere di commercio; istituti statistici; enti pubblici; università; centri di ricerca; associazioni; fondazioni; organizzazioni internazionali; rilevazioni dirette; questionari; interviste; dati dichiarati; dati osservati; studi di terzi; documenti ufficiali; fonti giornalistiche; fonti aperte; fonti proprietarie; fonti non verificabili; fonti non più disponibili.

**Per ogni Fonte, informazioni descritte (almeno):**
- soggetto responsabile;
- periodo di riferimento;
- copertura;
- metodo di raccolta;
- livello di dettaglio;
- limiti;
- eventuali condizioni di utilizzo;
- aggiornamento;
- comparabilità;
- affidabilità;
- data di acquisizione o consultazione.

**Principio.** Una Fonte ufficiale (es. un registro pubblico o un istituto statistico) non deve essere considerata automaticamente completa, aggiornata o metodologicamente compatibile con altre Fonti: ogni Fonte richiede una valutazione propria di copertura, aggiornamento e comparabilità (§9, §10), anche quando proviene da un ente autorevole.

---

## 8. Indicatori, misure e regole di calcolo

**Tipi di Misura previsti (almeno):** misura diretta; conteggio; somma; media; mediana; rapporto; percentuale; tasso; indice; variazione; differenza; distribuzione; quota; incidenza; concentrazione; crescita; sopravvivenza; stima; indicatore composito; indicatore qualitativo.

**Ogni Indicatore deve dichiarare almeno:**
- denominazione;
- finalità;
- Fenomeno misurato;
- unità di misura;
- Perimetro;
- Periodo;
- Dimensioni utilizzabili;
- Regola di calcolo;
- Fonti;
- livello di Qualità;
- limiti interpretativi;
- politica di revisione.

**Distinzioni da mantenere sempre.**

| Concetto | Definizione |
|---|---|
| **Definizione dell'Indicatore** | La descrizione metodologica stabile dell'Indicatore, indipendente da qualsiasi calcolo specifico |
| **Valore calcolato** | Il risultato di un'applicazione della Regola di calcolo a un insieme di Osservazioni, per un Perimetro e Periodo determinati |
| **Valore pubblicato** | Il Valore calcolato che ha completato il ciclo di pubblicazione ed è stato reso visibile secondo le regole del dominio (§12) |
| **Valore stimato** | Un Valore calcolato in assenza di osservazione diretta e completa, con margine di incertezza dichiarato (§3, §10) |
| **Valore revisionato** | Un Valore che ha sostituito, a seguito di una Revisione, un Valore precedentemente pubblicato per lo stesso Perimetro e Periodo, senza cancellarlo (§9, §12) |

**Principio.** Lo stesso nome di Indicatore non deve essere utilizzato per due Regole di calcolo differenti senza una distinzione esplicita (es. una versione della Metodologia): la coerenza del nome nel tempo presuppone la coerenza della definizione, altrimenti va introdotta una nuova denominazione o una versione esplicitamente dichiarata.

---

## 9. Serie storiche, confronti e comparabilità

| Concetto | Definizione |
|---|---|
| **Punto temporale** | Un singolo istante o intervallo minimo a cui un'Osservazione o un Valore sono riferiti |
| **Periodo** | Un intervallo temporale delimitato (es. un anno, un trimestre) usato come riferimento per un Valore |
| **Intervallo** | Lo spazio temporale tra due Periodi o Punti temporali |
| **Serie storica** | Una sequenza ordinata di Valori dello stesso Indicatore su Periodi successivi (§2) |
| **Anno base** / **Periodo base** | Il Periodo scelto come riferimento per calcolare variazioni o indici relativi |
| **Frequenza** | La cadenza con cui una Serie storica viene aggiornata (es. annuale, trimestrale) |
| **Continuità** | La proprietà di una Serie storica di non presentare interruzioni nella sequenza dei Periodi |
| **Interruzione di serie** | Un'assenza di Valori per uno o più Periodi in una Serie storica altrimenti continua |
| **Revisione metodologica** | Un cambiamento della Metodologia o della Regola di calcolo di un Indicatore, che può alterare la comparabilità dei Valori precedenti (§8, §12) |
| **Ricostruzione storica** | Il ricalcolo di Valori per Periodi passati secondo una Metodologia aggiornata, mantenendo tracciabile la versione originaria |
| **Confronto territoriale** | Il confronto di Valori dello stesso Indicatore tra Territori di riferimento differenti |
| **Confronto settoriale** | Il confronto di Valori dello stesso Indicatore tra Settori di riferimento differenti |
| **Confronto temporale** | Il confronto di Valori dello stesso Indicatore tra Periodi differenti |
| **Confronto tra popolazioni** | Il confronto di Valori riferiti a Popolazioni di riferimento differenti (§5) |
| **Benchmarking** | Il confronto sistematico di uno o più Valori con un Valore di riferimento esterno o interno assunto come termine di paragone |
| **Gruppo di controllo** | Un Gruppo di confronto (§5) usato specificamente per isolare l'effetto di un Fenomeno rispetto a un andamento di base |
| **Valore di riferimento** | Un Valore assunto come base per un confronto, un Benchmarking o un indice relativo |

**Un confronto è valido solo quando:**
- i Perimetri sono compatibili;
- le definizioni (dell'Indicatore, della Classificazione) sono compatibili;
- le Unità di osservazione sono compatibili;
- i Periodi sono comparabili;
- le Fonti sono sufficientemente coerenti tra loro;
- le eventuali differenze metodologiche sono dichiarate esplicitamente.

**Principio.** Una variazione osservata tra due Periodi, Territori o Popolazioni non implica automaticamente una relazione di causalità: descrive un cambiamento, non ne spiega necessariamente la causa (coerente con §4).

---

## 10. Qualità, completezza e incertezza

La qualità di un'Osservazione o di un Valore non è un giudizio unico: è l'insieme di più dimensioni indipendenti, ciascuna valutata separatamente. L'Osservatorio evita deliberatamente un unico badge generico di "dato verificato".

**Dimensioni di qualità modellate separatamente (almeno):** accuratezza; completezza; copertura; tempestività; coerenza; comparabilità; stabilità; rappresentatività; granularità; tracciabilità; affidabilità; rischio di duplicazione; rischio di sottorappresentazione; rischio di sovrarappresentazione; errore di classificazione; margine di errore; intervallo di confidenza; incertezza; dato mancante; valore anomalo; valore contestato.

**Distinzioni tra "assenza" di un dato — mai confuse tra loro.**

| Concetto | Definizione |
|---|---|
| **Assenza del fenomeno** | Il Fenomeno osservato non si è verificato per l'unità o il Perimetro considerato |
| **Valore pari a zero** | Un Valore calcolato che risulta effettivamente zero, distinto dall'assenza di osservazione |
| **Dato non disponibile** | Un'Osservazione che non è stata reperita per il Perimetro o Periodo richiesto |
| **Dato non raccolto** | Un'Osservazione che non è stata oggetto di rilevazione, per scelta o per limite della Fonte |
| **Dato non applicabile** | Un'Osservazione che non ha significato per l'unità o il Fenomeno considerato |
| **Dato riservato** | Un'Osservazione esistente ma non divulgabile per ragioni di riservatezza (§11) |
| **Dato insufficiente** | Un insieme di Osservazioni che non raggiunge la Soglia minima di aggregazione richiesta (§5, §11) |
| **Dato non pubblicabile** | Un Valore che, per ragioni di qualità o riservatezza, non soddisfa i criteri minimi per la pubblicazione (§11, §12) |

**Principio.** Un dato mancante non equivale a un valore pari a zero: le due situazioni devono restare sempre distinguibili nella presentazione dei risultati (coerente con §13, regola 8).

---

## 11. Aggregazione, anonimizzazione e riservatezza

| Concetto | Definizione |
|---|---|
| **Aggregazione** | L'operazione che combina Osservazioni relative a più unità in un unico Valore riferito alla popolazione (§2) |
| **Soglia minima** | Il numero minimo di unità sottostanti richiesto perché un Valore aggregato sia calcolabile o pubblicabile (§5) |
| **Raggruppamento** | L'assegnazione di più unità a un'unica categoria di Dimensione prima dell'Aggregazione |
| **Soppressione** | La decisione di non pubblicare un Valore che, pur calcolabile, comporterebbe un rischio di reidentificazione o di esposizione di informazioni riservate |
| **Generalizzazione** | La riduzione del livello di dettaglio di una Dimensione (es. da comune a regione) per ridurre il rischio di identificazione |
| **Anonimizzazione** | Il trattamento di un dato aggregato tale per cui non sia più possibile, né singolarmente né in combinazione con altre informazioni, ricondurlo a un soggetto identificabile |
| **Pseudonimizzazione** | Concetto distinto dall'Anonimizzazione: sostituzione di un identificativo diretto con un riferimento indiretto, che mantiene comunque la possibilità teorica di ricondurre il dato al soggetto tramite informazioni aggiuntive; l'Osservatorio non tratta dati pseudonimizzati come se fossero anonimi |
| **Dato individuale** | Un dato riferito a una singola unità di osservazione identificabile, che l'Osservatorio non pubblica come tale |
| **Dato potenzialmente identificabile** | Un dato aggregato che, per la ridotta numerosità della popolazione sottostante o per la combinazione di più Dimensioni, potrebbe permettere di risalire a un soggetto specifico |
| **Dato sensibile** | Un dato la cui divulgazione, anche in forma aggregata, comporterebbe un rischio elevato per i soggetti coinvolti, coerente con le classificazioni di riservatezza dei domini sorgente |
| **Rischio di reidentificazione** | La possibilità che, combinando più Dimensioni o Fonti, un dato aggregato torni a identificare un soggetto specifico |
| **Combinazione di dimensioni** | L'incrocio di più Dimensioni di analisi che, aumentando la specificità di un Valore, può aumentare anche il Rischio di reidentificazione |
| **Pubblicazione limitata** | La messa a disposizione di un Valore o prodotto analitico a un pubblico ristretto e dichiarato, non al pubblico generale (§12) |
| **Accesso riservato** | La condizione di un Valore o prodotto accessibile solo a soggetti autorizzati secondo regole esterne a questo dominio (§12) |
| **Uso interno** | L'utilizzo di un dato esclusivamente all'interno della piattaforma, senza pubblicazione (§12) |
| **Uso pubblico** | L'utilizzo di un dato con piena visibilità pubblica, secondo le regole di pubblicazione del dominio (§12) |

**Principio.** L'Osservatorio deve evitare che dati aggregati consentano di ricostruire informazioni personali, professionali o commerciali riservate, anche quando nessuna delle informazioni prese singolarmente sarebbe di per sé identificativa.

**Le soglie di pubblicazione possono variare in base a:**
- sensibilità del Fenomeno;
- numerosità della popolazione sottostante;
- Territorio;
- Settore;
- combinazione delle Dimensioni utilizzate;
- finalità della pubblicazione;
- Rischio di reidentificazione stimato.

**Principio.** L'Osservatorio non deve pubblicare dati individuali mascherandoli impropriamente come statistici: un Valore riferito a una popolazione talmente ridotta da coincidere, di fatto, con una singola unità osservabile non deve essere presentato come se fosse un'informazione aggregata.

---

## 12. Ciclo di vita, revisione e pubblicazione

Coerentemente con il pattern multi-asse già adottato in tutti i domini precedenti (`logical/persone.md` §11, `logical/eventi.md` §11, `logical/contenuti-editoriali.md` §11), il ciclo di vita di un'Osservazione, di un Valore o di un prodotto analitico dell'Osservatorio non è un singolo stato, ma **otto assi indipendenti**. I 18 stati concettuali richiesti sono distribuiti su questi assi in modo che nessun asse comprima concetti eterogenei.

**Stati concettuali complessivi (18):** proposto; definito; in acquisizione; in elaborazione; in verifica; provvisorio; validato; approvato; pubblicato; aggiornato; revisionato; rettificato; contestato; sospeso; ritirato; superato; archiviato; respinto.

| Asse | Stati che lo compongono | Significato dell'asse |
|---|---|---|
| **Stato dell'acquisizione** | proposto → in acquisizione → (acquisito) / respinto | Descrive il percorso di un Fenomeno o di una Fonte dalla proposta alla effettiva raccolta di Osservazioni, o al suo rigetto se non praticabile |
| **Stato dell'elaborazione** | definito → in elaborazione → provvisorio | Descrive il percorso di un Indicatore o di un Valore dalla definizione metodologica al calcolo, fino a un primo risultato non ancora verificato |
| **Stato metodologico** | (stabile) → revisionato | Descrive se la Metodologia applicata è quella originaria o è stata nel frattempo aggiornata; una Metodologia revisionata non invalida automaticamente i Valori già pubblicati con la versione precedente (§9) |
| **Stato di verifica** | in verifica → validato → approvato | Descrive il percorso di controllo di un Valore prima della pubblicazione, distinto dal semplice calcolo |
| **Stato di pubblicazione** | pubblicato → aggiornato → superato | Descrive se un Valore è stato rilasciato, se ha ricevuto un aggiornamento successivo, o se è stato sostituito da un Valore più recente per lo stesso Perimetro e Periodo |
| **Validità temporale** | (valido) → archiviato | Descrive se un Valore o prodotto analitico è ancora considerato corrente o è stato conservato come riferimento storico non più aggiornato |
| **Visibilità** | vedi elenco dedicato sotto | Descrive chi può accedere a un Valore o prodotto analitico, indipendentemente dal suo stato di elaborazione o verifica |
| **Contestazione** | contestato → rettificato / sospeso / ritirato | Descrive l'eventuale messa in discussione di un Valore o Fonte, e il suo esito: correzione, sospensione temporanea o ritiro definitivo |

**Visibilità previste (almeno):**
- privato;
- visibile al gruppo di ricerca;
- visibile ai revisori;
- visibile ai partner autorizzati;
- sotto embargo;
- pubblico;
- pubblico solo in forma aggregata;
- riservato;
- ritirato ma conservato;
- archiviato.

**Principio.** Una Revisione metodologica o di un Valore deve poter produrre nuovi Valori senza cancellare automaticamente quelli precedentemente pubblicati: la Serie storica conserva sempre la traccia del Valore originario, anche quando un Valore più recente lo supera (§9, §3).

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Indicatore deve avere una definizione e una Regola di calcolo identificabili (§8).
2. Ogni Valore deve essere associato a un Periodo e a un Perimetro (§3, §5, §9).
3. Ogni Valore deve avere una provenienza ricostruibile — una Fonte, una Metodologia, o entrambe (§3, §7, §8).
4. Il dato aggregato non sostituisce il fatto individuale (§3, §11).
5. L'Osservatorio non modifica automaticamente i domini sorgente (§1, introduzione).
6. Una correlazione non equivale a causalità (§4, §9).
7. Una Fonte ufficiale non è automaticamente completa o comparabile (§7).
8. Un dato mancante non equivale a zero (§10).
9. Un dato provvisorio non equivale a dato definitivo (§3, §12).
10. Una Revisione non deve cancellare automaticamente i Valori precedenti (§9, §12).
11. Indicatori con definizioni differenti non devono essere confrontati senza dichiarazione esplicita (§8, §9).
12. Un dato stimato deve essere distinguibile da un dato osservato (§3, §8).
13. Un Valore aggregato non deve consentire reidentificazione (§11).
14. L'Osservatorio non attribuisce qualifiche, affidabilità o diritti (§1).
15. Osservatorio e Contenuti editoriali restano distinti (§1).
16. L'Interpretazione deve essere distinguibile dalla Misura (§2, §8).
17. Le Metodologie devono poter essere storicizzate (§8, §9, §12).
18. I risultati devono esporre limiti e qualità del dato (§8, §10).
19. L'origine, la nazionalità, la lingua o lo status migratorio non devono essere dedotti in modo improprio (§6, coerente con `logical/mercati-internazionali.md` §9).
20. Il dominio deve rispettare la visibilità e la riservatezza definite dai domini sorgente (§11, §12).

**Casi limite.**

| # | Caso | Trattamento previsto |
|---|---|---|
| 1 | Stesso Indicatore calcolato con due Metodologie | I due Valori restano entrambi disponibili, con la Metodologia dichiarata per ciascuno; non vengono confrontati senza dichiarazione esplicita (§8, §9) |
| 2 | Valore corretto dopo la pubblicazione | Diventa un Dato rettificato; il Valore originario resta storicizzato (§3, §12) |
| 3 | Fonte ufficiale modificata retroattivamente | La modifica viene trattata come nuova Osservazione datata; i Valori già calcolati non si aggiornano automaticamente (§7, §9) |
| 4 | Serie storica interrotta | L'interruzione è dichiarata esplicitamente nella Serie, senza interpolazione automatica (§9) |
| 5 | Variazione di classificazione settoriale | Richiede una Mappatura tra classificazioni per mantenere la comparabilità della Serie storica (§6, §9) |
| 6 | Variazione dei confini territoriali | Richiede una Nota metodologica che dichiari la non piena comparabilità dei Valori prima e dopo la variazione (§6, §9) |
| 7 | Dati provenienti da periodi differenti | Non vengono combinati in un unico Valore senza normalizzazione temporale dichiarata (§9) |
| 8 | Dati non confrontabili | Il confronto non viene pubblicato, o viene pubblicato con dichiarazione esplicita dei limiti (§9) |
| 9 | Territorio con pochissime Imprese | Il Valore è soggetto a Soglia minima di aggregazione; se non raggiunta, il dato è soppresso o generalizzato (§5, §11) |
| 10 | Settore con un solo soggetto dominante | Il Valore rischia di identificare quel soggetto; si applica Soppressione o Generalizzazione (§11) |
| 11 | Dato pari a zero | Pubblicato come Valore zero, distinto da assenza di osservazione (§10) |
| 12 | Dato mancante | Dichiarato come non disponibile, mai sostituito con zero (§10) |
| 13 | Dato non applicabile | Dichiarato come tale, escluso dal calcolo dell'Indicatore per quell'unità (§10) |
| 14 | Dato soppresso per riservatezza | Non pubblicato; la soppressione stessa può essere dichiarata senza rivelare il Valore (§11) |
| 15 | Dato stimato | Pubblicato con margine di incertezza e Metodologia di stima dichiarati (§3, §8, §10) |
| 16 | Dato provvisorio | Pubblicato con etichetta esplicita di provvisorietà, soggetto a possibile Revisione (§12) |
| 17 | Dato contestato | Reso visibile con l'indicazione della contestazione in corso, senza rimozione automatica (§12) |
| 18 | Fonte non più disponibile | I Valori già calcolati restano validi; nuove Osservazioni da quella Fonte non sono più possibili (§7) |
| 19 | Fonti discordanti | Entrambe le Fonti restano dichiarate; il Valore pubblicato indica la Fonte prevalente e la discrepanza (§7, §10) |
| 20 | Duplicazione di Imprese tra Fonti | Richiede una regola di deduplicazione dichiarata prima dell'Aggregazione, per evitare doppio conteggio (§7, §11) |
| 21 | Persona collegata a più Imprese | L'unità di osservazione "Impresa" resta distinta da "Persona"; il conteggio dichiara quale delle due unità sta misurando (§5) |
| 22 | Impresa con più Territori o Settori | Il Valore aggregato dichiara la regola di attribuzione (es. sede principale, tutte le Dimensioni) per evitare doppio conteggio implicito (§6) |
| 23 | Cambiamento di stato dell'Impresa | Trattato come evento nel tempo; la Serie storica riflette lo stato all'epoca dell'Osservazione, non retroattivamente (§9, coerente con `logical/imprese.md`) |
| 24 | Cessazione successivamente rettificata | Trattata come Dato rettificato; la Serie storica conserva entrambe le versioni (§3, §9) |
| 25 | Opportunità pubblicata ma non effettivamente disponibile | L'Osservatorio misura la pubblicazione come fatto dichiarato dal dominio sorgente, non ne verifica la disponibilità effettiva (coerente con `logical/opportunita.md`) |
| 26 | Collaborazione senza esito dichiarato | Trattata come dato incompleto per gli Indicatori che richiedono l'esito; esclusa da quei calcoli, non stimata come esito positivo o negativo (coerente con `logical/collaborazioni.md`) |
| 27 | Partecipazione a Evento non verificata | Trattata secondo lo stato di verifica dichiarato dal dominio Eventi; l'Osservatorio non attribuisce una verifica propria (coerente con `logical/eventi.md`) |
| 28 | Titolo professionale non verificato | Trattato secondo lo stato di verifica dichiarato dal dominio Professionisti; non influisce sul conteggio salvo Dimensione dedicata "stato di verifica" (§6, coerente con `logical/professionisti.md`) |
| 29 | Mercato internazionale dichiarato ma non confermato | Trattato secondo la distinzione Presenza/Interesse già stabilita in `logical/mercati-internazionali.md`; l'Osservatorio distingue i due Fenomeni nei propri Indicatori |
| 30 | Indicatore basato su dati interni non rappresentativi dell'intera popolazione | La Nota metodologica dichiara esplicitamente il limite di rappresentatività (§8, §10) |
| 31 | Questionario con forte autoselezione | Trattato come limite di rappresentatività da dichiarare nella Metodologia, non nascosto (§7, §10) |
| 32 | Dato proveniente da campione non rappresentativo | Il Valore è pubblicato come indicativo, con limite dichiarato, non come misura dell'intera Popolazione di riferimento (§5, §10) |
| 33 | Confronto tra Territori con diversa copertura | Il confronto dichiara la differenza di copertura come limite, o viene evitato (§7, §9) |
| 34 | Serie storica ricostruita | Dichiarata come Ricostruzione storica, distinta dai Valori originariamente calcolati nel Periodo (§9) |
| 35 | Pubblicazione di un dato potenzialmente reidentificabile | Bloccata prima della pubblicazione tramite Soppressione o Generalizzazione (§11) |
| 36 | Modifica retroattiva della Metodologia | Genera una Revisione metodologica; i Valori storici restano etichettati con la Metodologia con cui sono stati originariamente calcolati, salvo Ricostruzione esplicita (§8, §9, §12) |
| 37 | Interpretazione editoriale in contrasto con il dato | L'Interpretazione resta distinta dalla Misura (§8); un eventuale contrasto con un Contenuto editoriale è gestito come contestazione (§12) e non modifica il Valore |
| 38 | Risultato politicamente o socialmente sensibile | Non altera le regole di qualità o pubblicazione: il Valore segue gli stessi criteri metodologici di ogni altro, con particolare attenzione alla Nota metodologica (§8, §10) |
| 39 | Uso improprio di categorie riferite all'origine | Vietato: l'origine, la nazionalità, la lingua o lo status migratorio non sono dedotti impropriamente né usati come categoria surrettizia (regola 19) |
| 40 | Richiesta di rimozione di un dato aggregato | Valutata secondo le regole di Contestazione (§12); un dato aggregato legittimo non viene rimosso solo perché sgradito, ma può essere sospeso in attesa di verifica |
| 41 | Impossibilità di replicare un calcolo storico | Dichiarata esplicitamente come limite di tracciabilità (§10); il Valore resta pubblicato con questa limitazione annotata |

---

## 14. Eventi di dominio

Coerentemente con il meccanismo dei "fatti accaduti" già stabilito in `docs/domain-model.md` §10, ogni evento descrive un fatto concluso di questo dominio, senza descrivere alcuna implementazione tecnica.

| Evento | Significato | Condizioni concettuali | Possibili conseguenze di dominio |
|---|---|---|---|
| **FenomenoOsservatoDefinito** | Un nuovo Fenomeno è stato definito come oggetto di osservazione | Il Fenomeno ha una descrizione e un ambito dichiarati (§4) | Diventa possibile associare Perimetri, Fonti e Indicatori a quel Fenomeno |
| **PerimetroOsservazioneDefinito** | Un Perimetro di osservazione è stato definito per un Fenomeno | Popolazione, Territorio e Periodo sono dichiarati (§5) | Diventa possibile raccogliere Osservazioni entro quel Perimetro |
| **FonteOsservatorioAssociata** | Una Fonte è stata collegata a un Fenomeno o a un Indicatore | La Fonte ha le informazioni minime dichiarate (§7) | Le Osservazioni provenienti da quella Fonte diventano utilizzabili |
| **FonteOsservatorioAggiornata** | Una Fonte già associata ha ricevuto un aggiornamento | La Fonte esisteva già; l'aggiornamento è datato | I Valori calcolati successivamente possono differire da quelli precedenti |
| **FonteOsservatorioContestata** | L'affidabilità o la validità di una Fonte è stata messa in discussione | Esiste un motivo dichiarato di contestazione | I Valori derivati da quella Fonte possono transitare verso lo stato "contestato" (§12) |
| **MetodologiaDefinita** | Una nuova Metodologia è stata documentata | La Metodologia descrive Regola di calcolo e limiti (§8) | Diventa possibile calcolare Valori secondo quella Metodologia |
| **MetodologiaRevisionata** | Una Metodologia esistente è stata aggiornata | La versione precedente resta storicizzata (§9, §12) | I nuovi Valori dichiarano la versione aggiornata; i Valori storici restano etichettati con la versione originaria |
| **IndicatoreDefinito** | Un nuovo Indicatore è stato definito | L'Indicatore dichiara gli attributi minimi (§8) | Diventa possibile calcolare Valori per quell'Indicatore |
| **IndicatoreModificato** | La definizione di un Indicatore esistente è stata modificata | La modifica è dichiarata e non retroattiva sui Valori già pubblicati | I nuovi Valori seguono la definizione aggiornata; può essere necessaria una nuova denominazione o versione (§8, regola 11) |
| **IndicatoreRitirato** | Un Indicatore non è più mantenuto | L'Indicatore aveva Valori pubblicati | I Valori storici restano consultabili come archiviati (§12); non vengono più calcolati nuovi Valori |
| **OsservazioneAcquisita** | Un'Osservazione è stata raccolta con successo | L'Osservazione ha un'unità, un Periodo e una Fonte dichiarati | L'Osservazione diventa disponibile per il calcolo di Misure e Valori |
| **OsservazioneScartata** | Un'Osservazione candidata non è stata acquisita | Esiste un motivo dichiarato (es. Fonte non attendibile, dato non applicabile) | L'Osservazione non entra nel calcolo di alcun Valore |
| **MisuraCalcolata** | Una Misura è stata eseguita su una o più Osservazioni | Le Osservazioni coinvolte sono disponibili | Diventa disponibile un risultato intermedio utilizzabile da uno o più Indicatori |
| **ValoreIndicatoreCalcolato** | Un Valore è stato calcolato per un Indicatore, Perimetro e Periodo | La Regola di calcolo è stata applicata | Il Valore entra nello stato di elaborazione (§12) |
| **ValoreIndicatoreStimato** | Un Valore è stato prodotto per stima, in assenza di osservazione diretta completa | Il margine di incertezza è dichiarato (§3, §10) | Il Valore è etichettato come stimato, distinto da un Valore osservato |
| **ValoreIndicatoreValidato** | Un Valore ha superato il controllo di verifica | Il controllo dichiarato è stato eseguito (§12) | Il Valore può proseguire verso l'approvazione e la pubblicazione |
| **ValoreIndicatorePubblicato** | Un Valore è stato reso visibile secondo la Visibilità dichiarata | Il Valore è stato approvato (§12) | Il Valore diventa consultabile secondo le regole di visibilità; può alimentare una Serie storica (§9) |
| **ValoreIndicatoreRevisionato** | Un Valore pubblicato è stato aggiornato da un nuovo calcolo | Il Valore precedente resta storicizzato | La Serie storica riflette entrambe le versioni con relativa tracciabilità (§9, §12) |
| **ValoreIndicatoreRettificato** | Un Valore pubblicato è stato corretto per errore riconosciuto | Il motivo della rettifica è dichiarato | Il Valore originario resta storicizzato come superato; il nuovo Valore lo sostituisce nella lettura corrente (§3, §12) |
| **ValoreIndicatoreContestato** | Un Valore pubblicato è stato messo in discussione | Esiste un motivo di contestazione dichiarato | Il Valore transita nello stato "contestato" (§12) in attesa di verifica o rettifica |
| **SerieStoricaCreata** | Una nuova Serie storica è stata avviata per un Indicatore | Esiste almeno un Valore pubblicato per quell'Indicatore | La Serie diventa disponibile per confronti temporali (§9) |
| **SerieStoricaInterrotta** | Una Serie storica ha subito un'interruzione nella sequenza dei Periodi | Manca un Valore per uno o più Periodi attesi | L'interruzione è dichiarata esplicitamente nella Serie (§9, caso limite 4) |
| **SerieStoricaRicostruita** | Una Serie storica è stata ricalcolata secondo una Metodologia aggiornata | La Ricostruzione è dichiarata e distinta dai Valori originari (§9) | Diventano disponibili due letture della stessa Serie, entrambe tracciabili |
| **QualitàDatoValutata** | Una o più Dimensioni di qualità sono state valutate per un'Osservazione o un Valore | La valutazione dichiara le Dimensioni considerate (§10) | Il Valore espone il proprio profilo di qualità multidimensionale |
| **DatoSoppressoPerRiservatezza** | Un Valore calcolabile non è stato pubblicato per rischio di reidentificazione | La Soglia minima non è raggiunta, o il Rischio è stato valutato come eccessivo (§11) | Il Valore resta non pubblico; la sua assenza può essere dichiarata senza rivelarne il contenuto |
| **AggregazioneCreata** | Un nuovo Valore aggregato è stato prodotto combinando più Osservazioni o Valori | La regola di Aggregazione è dichiarata (§11) | Il Valore aggregato diventa disponibile per la pubblicazione, soggetto alle regole di riservatezza |
| **RapportoOsservatorioCreato** | Un nuovo Rapporto è stato composto | Il Rapporto raccoglie una o più Analisi o Valori (§2) | Il Rapporto entra nel proprio ciclo di elaborazione (§12) |
| **RapportoOsservatorioPubblicato** | Un Rapporto ha completato il proprio ciclo di pubblicazione | Il Rapporto è stato approvato (§12) | Il Rapporto diventa consultabile secondo la Visibilità dichiarata; può essere referenziato da un Contenuto editoriale (§1) |
| **SchedaTerritorialeCreata** | Una nuova Scheda territoriale è stata composta per un Territorio | Esistono Valori pubblicati pertinenti a quel Territorio (§2, §6) | La Scheda entra nel proprio ciclo di pubblicazione (§12) |
| **SchedaSettorialeCreata** | Una nuova Scheda settoriale è stata composta per un Settore | Esistono Valori pubblicati pertinenti a quel Settore (§2, §6) | La Scheda entra nel proprio ciclo di pubblicazione (§12) |
| **InterpretazioneAssociata** | Un'Interpretazione è stata collegata a uno o più Valori | L'Interpretazione dichiara i Valori a cui si riferisce, restando distinta dalla Misura (§8, regola 16) | Il Valore acquisisce un contesto analitico esplicito, senza che l'Interpretazione ne alteri il calcolo |
| **VisibilitàDatoModificata** | La Visibilità di un Valore o prodotto analitico è stata cambiata | La nuova Visibilità è tra quelle previste (§12) | L'accesso al Valore o prodotto cambia di conseguenza, senza alterarne il contenuto |
| **EmbargoOsservatorioImpostato** | Un Valore o prodotto è stato posto sotto embargo temporaneo | Una data o condizione di rilascio è dichiarata (§12) | Il Valore resta non pubblico fino al termine dell'embargo |
| **EmbargoOsservatorioTerminato** | Un embargo precedentemente impostato è terminato | La condizione di rilascio dichiarata si è verificata | Il Valore transita verso la Visibilità pubblica prevista |
| **ProdottoOsservatorioArchiviato** | Un Rapporto, Dossier o Scheda non è più considerato corrente | Un prodotto più recente lo ha superato, o il contenuto non è più aggiornato (§12) | Il prodotto resta consultabile come riferimento storico, non più come informazione corrente |

**Conseguenze di dominio.** Ogni evento di questo elenco è un fatto accaduto che altri domini (Contenuti Editoriali, Ricerca, Notifiche) possono voler conoscere per reagire — ad esempio Contenuti Editoriali può proporre un nuovo Contenuto alla pubblicazione di un RapportoOsservatorioPubblicato, o Ricerca può aggiornare i propri risultati alla pubblicazione di una nuova SchedaTerritorialeCreata — senza che l'Osservatorio debba conoscere né gestire direttamente tali reazioni (coerente con il meccanismo "fatti accaduti" del Domain Model, §10).

---

## 15. Decisioni finali, ciclo 1 e prontezza Physical

> **Autorità.** Questa sezione chiude il ciclo 1. In caso di contrasto con §§1–14 (modello generale metodologico), **prevale §15**.

### Decisioni vincolanti (modello generale, confermate)

1. Osservatorio è un dominio autonomo (§1; `domain-model.md`).
2. L'Osservatorio non possiede i dati operativi dei domini sorgente (§1).
3. L'Osservatorio produce conoscenza derivata; non modifica i fatti sorgente (§1).
4. Dato operativo, Indicatore, Valore e Contenuto restano concetti distinti (§1, §2, §3).
5. Definizione dell'Indicatore e Valore dell'Indicatore sono distinti (§8).
6. Fonte ≠ Organizzazione ≠ Documento ≠ Contenuto (§7, §15.C).
7. Una correlazione non equivale a causalità (§4, §9).
8. Un dato mancante non equivale a zero (§10).
9. I dati aggregati non devono consentire la reidentificazione (§11).
10. L'Osservatorio non attribuisce qualifiche, rappresentanza o diritti di accesso (§1).
11. I diritti di accesso restano di Identità & Accessi (§1; PF13).
12. Osservatorio e Contenuti restano domini distinti (§1, §15.C).
13. L'origine, la nazionalità, la lingua e lo status migratorio non devono essere dedotti impropriamente (§6).

---

### 15.A Decisioni del ciclo 1 (chiuse)

#### Obiettivo minimo

Il ciclo 1 è un **registro di indicatori statistici e valori aggregati pubblicabili**: definire un Indicatore, registrare metodologia essenziale e Fonte, registrare Valori numerici aggregati con periodo, dimensioni minime, stato e qualità, pubblicare o ritirare. Non è una piattaforma di BI, né un data lake, né un CMS analitico.

#### Aggregate Root e oggetti

| Oggetto | Ruolo ciclo 1 |
|---|---|
| **Indicatore** | **Unico Aggregate Root** |
| **FonteStatistica** | Oggetto owned dal dominio Osservatorio; referenziabile; **non** AR |
| **ValoreIndicatore** | Fatto **subordinato** all’Indicatore; **non** AR |
| Serie storica | **Derivata** dalla sequenza dei Valori; non AR / non tabella autonoma |
| Osservazione, Interpretazione, Rapporto, Dossier, Scheda, Revisione-AR | **Non** AR nel ciclo 1 |

#### Contratto Indicatore

| Attributo | Decisione |
|---|---|
| Codice stabile | Obbligatorio, univoco, immutabile dopo la prima pubblicazione |
| Titolo | Obbligatorio |
| Descrizione | Obbligatoria |
| Finalità | Obbligatoria (sintetica) |
| Metodologia sintetica | Obbligatoria (testo breve sull’Indicatore) |
| Natura del valore | Una sola, insieme chiuso (§ sotto) |
| Unità di misura | Una sola, insieme chiuso, coerente con la natura; definita sull’Indicatore |
| Periodicità | Una sola: `annual` \| `quarterly` \| `monthly` \| `point_in_time` |
| Stato operativo | `draft` \| `active` \| `deprecated` \| `retired` — default `draft` |
| Pubblicazione | `unpublished` \| `published` \| `withdrawn` — default `unpublished` |
| Date | `published_at` quando published; `withdrawn_at` quando withdrawn; date di creazione/aggiornamento |
| Ownership | **Redazionale** (titolarità di piattaforma/redazione); nessuna Persona/Impresa/Account/`auth.users` come owner |
| Amministrabilità | Indicatori **amministrabili** nel tempo; **nessun seed obbligatorio**; possono essere aggiunti; possono essere dismessi (`deprecated`/`retired`) **senza cancellare** i Valori storici |

#### Natura e formato del valore

Nature ammesse (chiuse): `count` \| `percentage` \| `currency` \| `ratio` \| `index`.

Unità ammesse (chiuse, non catalogo amministrabile): `units` \| `percent` \| `eur` \| `eur_thousands` \| `ratio` \| `index_points`.

Coerenza obbligatoria Indicatore:

| Natura | Unità ammesse |
|---|---|
| `count` | `units` |
| `percentage` | `percent` |
| `currency` | `eur`, `eur_thousands` |
| `ratio` | `ratio` |
| `index` | `index_points` |

Esclusi dal ciclo 1: testi qualitativi; booleani; intervalli; distribuzioni; vettori; JSON; valori multicolonna.

#### Contratto ValoreIndicatore

| Attributo | Decisione |
|---|---|
| Appartenenza | Esattamente un Indicatore |
| Valore numerico | Unico numero decimale ad alta precisione (concettuale); nessuna altra forma |
| Periodo | Strutturato: `period_start` obbligatoria; `period_end` obbligatoria e ≥ start; anno di riferimento **derivabile**; granularità coerente con la periodicità dell’Indicatore; **nessun periodo testuale libero** |
| Fonte | Riferimento obbligatorio a una FonteStatistica |
| Stato dato | `provisional` \| `final` \| `revised` \| `withdrawn` |
| Qualità | `official` \| `estimated` \| `derived` \| `self_reported` — distinta da stato e da Fonte |
| Nota metodologica | Opzionale, sintetica |
| Pubblicazione valore | `published_at` quando reso pubblico; ritiro senza cancellazione silenziosa |
| Sostituzione | Collegamento opzionale al Valore sostituito; storico conservato |
| Dimensioni | Zero o più tra le tre ammesse; **al massimo una valorizzazione per asse** |

Esclusi sul Valore: microdati; formule; query salvate; risultati UI; JSON; elenchi di soggetti sottostanti.

#### Stato del Valore

| Stato | Significato |
|---|---|
| `provisional` | Valore provvisorio, soggetto a conferma |
| `final` | Valore considerato definitivo per il periodo/dimensioni |
| `revised` | Valore che rettifica un precedente; il precedente resta in storico |
| `withdrawn` | Valore ritirato dalla pubblicazione corrente; non cancellato |

Un solo Valore **corrente non ritirato** per combinazione logica: Indicatore + periodo + dimensioni (territorio, settore, paese). Nessun workflow di approvazione complesso.

#### Qualità del Valore

| Qualità | Significato |
|---|---|
| `official` | Proveniente da fonte ufficiale dichiarata |
| `estimated` | Stima metodologica dichiarata |
| `derived` | Derivato da calcoli su dati di piattaforma o altre misure |
| `self_reported` | Basato su dati dichiarati dai soggetti (sempre aggregati) |

Qualità ≠ stato ≠ Fonte ≠ score di accuratezza. Score avanzati, intervalli di confidenza: **rinviati**.

#### Dimensioni ammesse

Un Valore può avere 0..3 dimensioni, al più una per asse:

1. **Territorio** (opzionale): livello chiuso `italy` \| `region` \| `province` \| `municipality` \| `other`; etichetta obbligatoria se presente; codice esterno opzionale. **Nessun** catalogo ISTAT/NUTS nuovo nel ciclo 1.
2. **Settore economico** (opzionale): riferimento opzionale al catalogo pubblicato `business_sectors`, oppure assente.
3. **Paese / nazionalità statistica** (opzionale): etichetta obbligatoria se presente; codice esterno opzionale (es. riferimento opaco). **Nessun** catalogo `countries` dedicato risulta pubblicato nel repository; **nessuna** FK inventata. Non usare `international_market_countries` (composizione Mercati, non catalogo paesi).

Escluse: genere, età, forma giuridica, classe dimensionale, mercato, professione, tipologie OPP/COL/Eventi/Servizi, combinazioni multidimensionali avanzate.

#### FonteStatistica

Owned da Osservatorio. Attributi minimi: denominazione; ente produttore **testuale**; titolo pubblicazione/rilevazione; URL opzionale; identificativo esterno opzionale; edizione/versione opzionale; data pubblicazione; licenza/condizioni opzionali; nota metodologica; stato `active` \| `deprecated` \| `unavailable`.

Ciclo 1: **nessuna** FK obbligatoria a Organizzazioni; nessun documento/file/Storage/dataset a righe; nessuna pubblicazione autonoma della Fonte. Fonte = provenienza e tracciabilità, non archivio.

#### Ownership e autore

| Fatto | Ownership ciclo 1 |
|---|---|
| Indicatore | Redazionale (piattaforma); non Persona/Impresa/Account/`auth.users` |
| FonteStatistica | Redazionale (dominio); non Organizzazione come owner |
| ValoreIndicatore | Owned dall’Indicatore; nessuna ownership autonoma |
| Autore operativo | Derivato da Identità & Accessi in applicazione; **non** fatto di dominio obbligatorio nel ciclo 1 |

#### Lifecycle Indicatore

| Asse | Valori | Note |
|---|---|---|
| Operativo | `draft` → `active` → `deprecated` → `retired` | Default `draft`. Dismissione senza cancellazione dei Valori |
| Pubblicazione | `unpublished` \| `published` \| `withdrawn` | Default `unpublished`. Gate: `published` richiede metodologia sintetica, natura, unità, periodicità. `published_at` / `withdrawn_at` |

Pubblicazione **non** implica validazione scientifica assoluta.

#### Lifecycle Fonte

`active` \| `deprecated` \| `unavailable`. Nessuna pubblicazione autonoma nel ciclo 1.

#### Privacy e soglia

- Solo valori aggregati; nessun microdato identificabile; nessuna FK a singole Persone o Imprese; nessuna copia anagrafica.
- Il dominio non pubblica valori che rappresentino direttamente un singolo soggetto identificabile.
- Per conteggi derivati da soggetti: soglia minima pubblicabile **5 unità**, salvo fonte ufficiale già pubblicata che legittimi un valore inferiore.
- Valori sotto soglia: soppressi o generalizzati **prima** dell’inserimento come dato pubblicabile.
- Regola **applicativa/editoriale**: non richiede necessariamente un CHECK numerico universale (alcuni indicatori possono legittimamente valere meno di 5).
- Nessun flag di anonimizzazione né microdato di soppressione persistito.

#### Deny-by-default

I fatti del ciclo 1 non generano permessi. Visibilità pubblica dei Valori/`published` è governata dalle regole di pubblicazione del dominio e da Identità & Accessi. Struttura ≠ policy applicative.

---

### 15.B Matrice ciclo 1 — incluso / rinviato / escluso

| Elemento | Incluso | Rinviato | Escluso | Motivazione |
|---|---|---|---|---|
| Indicatore (AR) | ✓ | | | Nucleo ciclo 1 |
| Codice, titolo, descrizione, finalità | ✓ | | | Contratto minimo |
| Metodologia sintetica sull’Indicatore | ✓ | | | Essenziale |
| Natura + unità chiuse | ✓ | | | Modello valore chiuso |
| Periodicità chiusa | ✓ | | | Periodo strutturato |
| FonteStatistica | ✓ | | | Provenienza |
| ValoreIndicatore numerico | ✓ | | | Fatto subordinato |
| Periodo strutturato | ✓ | | | Nessun testo libero |
| Stato valore (`provisional`…`withdrawn`) | ✓ | | | Slim |
| Qualità (`official`…`self_reported`) | ✓ | | | Distinta da stato |
| Rettifica / sostituzione con storico | ✓ | | | Un corrente per chiave logica |
| Territorio (livello + etichetta) | ✓ | | | Dimensione minima |
| Settore (`business_sectors` opzionale) | ✓ | | | Catalogo già pubblicato |
| Paese (etichetta + codice opzionale) | ✓ | | | Nessun catalogo countries pubblicato |
| Serie storica come tabella/AR | | | ✓ | Derivata dai Valori |
| Dataset / righe sorgente | | ✓ | | Non registro indicatori |
| Microdati identificabili | | | ✓ | Privacy |
| Osservazione persistita | | ✓ | | Non necessaria al registro |
| Rapporti / Dossier / Schede owned OSS | | | ✓ | → Contenuti |
| Interpretazione owned OSS | | | ✓ | → Contenuti |
| Dashboard / grafici / mappe persistiti | | | ✓ | Viste derivate |
| Ranking / trend / confronti persistiti | | | ✓ | Derivati |
| Metodologia versionata complessa | | ✓ | | Sintetica sufficiente |
| Workflow approvazione / audit scientifico | | ✓ | | Fuori ciclo 1 |
| Dimensioni avanzate (genere, età, …) | | ✓ | | Non supportabili |
| FK Organizzazioni | | ✓ | | Ente testuale in Fonte |
| FK Contenuti | | ✓ | | Nessuna ownership crociata |
| Feed automatici / ETL / import | | ✓ | | Manuale/editoriale ciclo 1 |
| Sondaggi / questionari strutturati | | ✓ | | Fonte futura |
| Indicatori compositi complessi | | ✓ | | Nature semplici |
| Intervalli di confidenza / score qualità | | ✓ | | Qualità chiusa basta |
| Cataloghi ISTAT / NUTS nuovi | | | ✓ | Non inventare |
| Account / `auth.users` owner | | | ✓ | Identità & Accessi |
| Documenti / Storage / scraping / data lake / BI / cache / export / CRM | | | ✓ | Fuori dominio |
| JSON generico | | | ✓ | Nessuna semantica deferita |
| FK individuali Persone / Imprese | | | ✓ | Solo aggregati |

---

### 15.C Relazioni con altri domini (congelate per ciclo 1)

| Dominio | Relazione ciclo 1 | Natura |
|---|---|---|
| **Contenuti** | Articoli, report narrativi, dossier, schede editoriali, interpretazioni, storytelling: **owned da Contenuti**. Nessuna tabella Rapporto/Dossier/Scheda in OSS; nessuna FK obbligatoria | Confine chiuso |
| **Organizzazioni** | Ente produttore **testuale** in Fonte; nessuna FK strutturale; nessun duplicato anagrafico | Rinviato collegamento |
| **Persone** | Nessuna FK individuale; nessun microdato; eventuale derivazione aggregata senza ownership | Derivazione senza FK |
| **Imprese** | Nessuna FK individuale; nessun microdato; eventuale derivazione aggregata senza ownership | Derivazione senza FK |
| **business_sectors** | Riferimento opzionale sulla dimensione settore del Valore | Strutturale opzionale |
| **Catalogo paesi** | Non pubblicato come tabella dedicata; paese = etichetta + codice opzionale | Nessuna FK inventata |
| **Appartenenze / Professionisti / Opportunità / Eventi / Servizi / Collaborazioni / Mercati** | Possono alimentare calcoli esterni; **nessuna** FK ai loro AR individuali nel ciclo 1 | Derivazione / futura |
| **Identità & Accessi** | Accesso e azioni di scrittura; non possiede fatti statistici; deny-by-default | Supporto |
| **Ricerca / Notifiche** | Consumatori di pubblicazioni; nessuna ownership inbound | Fuori ownership |

**Assenza cicli di ownership.** Flusso unidirezionale: domini sorgente → (derivazione) → Osservatorio; Contenuti narra senza acquisire ownership dei Valori (coerente con D37–D45, P6, P9).

---

### 15.D Prontezza Physical

Il Logical Osservatorio è **chiuso per il ciclo 1**.

Il Physical del ciclo 1 **deve** limitarsi a tradurre:

* **AR** Indicatore (definizione, natura, unità, periodicità, lifecycle operativo + pubblicazione);
* **FonteStatistica** owned dal dominio;
* **ValoreIndicatore** subordinato (numero, periodo strutturato, fonte, stato, qualità, dimensioni 0..3, rettifica);
* **insiemi chiusi** natura/unità/periodicità/stati/qualità/livelli territoriali;
* **privacy** aggregata e soglia editoriale 5;
* **confini** §15.A–§15.C (Contenuti, Organizzazioni, Persone/Imprese, no JSON, deny-by-default).

Il Physical **non** deve:

* inventare un secondo Aggregate Root;
* persistere Serie/Osservazione/Rapporto/Dossier/Scheda/Interpretazione/dashboard/grafici;
* introdurre microdati o FK a Persone/Imprese individuali;
* inventare cataloghi geografici ISTAT/NUTS o un catalogo countries inesistente;
* introdurre FK obbligatorie a Organizzazioni o Contenuti;
* lasciare aperte nature/unità/dimensioni/lifecycle;
* usare JSON generico per dimensioni o valori;
* attribuire ownership a Account/`auth.users`.

I nomi di tabelle/colonne/CHECK restano decisione del Physical. Il Migration Plan, quando autorizzato, potrà tradurre questo modello in DDL **senza nuove decisioni semantiche**.

**Criterio di completamento.** Con §15.A–§15.D il ciclo 1 è completo e il Physical DDL-ready è **autorizzabile**.

---

### Domande aperte (non bloccanti per il Physical ciclo 1)

- raffinamento post-ciclo-1 di feed automatici e contratti di campo per-dominio;
- collegamento facoltativo Fonte → Organizzazioni;
- collegamento facoltativo Valori/Indicatori → Contenuti;
- dimensioni avanzate e soglie per-fenomeno più granulari;
- metodologia versionata, audit scientifico, sondaggi strutturati;
- eventuale catalogo paesi condiviso quando sarà pubblicato;
- definizione giuridica ampia di “imprenditore di origine immigrata” (non richiesta per registrare indicatori amministrati);
- futura separazione rilevazioni / indicatori / prodotti come sotto-domini.

---

## Controllo finale (ciclo 1)

1. **§15 autoritativa presente** — verificato: §15.A–§15.D chiudono AR, oggetti, valori, dimensioni, fonti, lifecycle, privacy, confini.
2. **Un solo AR** — Indicatore; Fonte e Valore non sono AR.
3. **Nessun microdato** — verificato §15.A / §15.B.
4. **Nessuna dashboard / rapporto narrativo owned** — verificato §15.A / §15.C.
5. **Nessuna FK individuale Persone/Imprese** — verificato §15.C.
6. **Nessuna decisione semantica aperta bloccante** — le domande residue sono esplicitamente non bloccanti.
7. **Coerenza Domain Model / reconciliation / dependency-map** — conoscenza derivata, P6/P9, confine CE, nessun ciclo ownership.
8. **Nessun riferimento tecnico/SQL** — il documento resta logico; i riferimenti a `business_sectors` indicano solo cataloghi già pubblicati come dipendenze strutturali opzionali, senza anticipare DDL di Osservatorio.

### Riepilogo finale

**Ciclo 1.** Registro di Indicatori e Valori aggregati pubblicabili, con FonteStatistica, periodo strutturato, tre dimensioni massime, nature/unità chiuse, lifecycle slim, privacy aggregata.

**Physical.** Autorizzato a tradurre §15 senza inventare semantica.

**LOGICAL OSSERVATORIO REVISIONATO E APPROVATO — PHYSICAL AUTORIZZABILE**
