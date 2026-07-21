# Tesi architetturale del dominio OPPORTUNITÀ

> Livello architetturale, fondazionale, pre-modellazione. Questo documento NON è un modello dati, NON è un Domain Mapping (né logico né fisico), NON descrive implementazione. Non contiene tabelle di modellazione, Aggregate, Entity, Value Object come schema, eventi di dominio come schema tecnico, SQL, PostgreSQL, Supabase, API o migrazioni. Il suo scopo si esaurisce prima dell'inizio di qualunque revisione del Logical Data Model e di qualunque Physical Domain Mapping: stabilire, con rigore e a partire esclusivamente dall'architettura già approvata (escluso il Logical Model di Opportunità), quale sia il corretto significato di business del dominio Opportunità — perimetro, natura, confini, proprietà dei fatti, varianti ammesse e decisioni da lasciare aperte.
>
> Fondamenti (non modificati da questo documento): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), [`docs/architecture/fundamental/domain-patterns.md`](./domain-patterns.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), tesi e modelli di confine già approvati elencati al §3.
>
> Nota di indipendenza obbligatoria. Un documento `docs/architecture/logical/opportunita.md` esiste già. Questa tesi **non lo legge e non lo usa come fonte**. Ogni conclusione qui raggiunta deve poter essere motivata senza appoggiarsi al modo in cui quel documento ha già risolto le proprie domande. Lo stesso vale per eventuali bozze di Physical Mapping, migrazioni o codice relativi a Opportunità.

---

## Indice

1. [Scopo](#1-scopo)
2. [Nota di indipendenza](#2-nota-di-indipendenza)
3. [Documenti letti](#3-documenti-letti)
4. [Documenti esclusi dalla lettura](#4-documenti-esclusi-dalla-lettura)
5. [Contesto del dominio](#5-contesto-del-dominio)
6. [Domanda fondativa](#6-domanda-fondativa)
7. [Metodo di analisi](#7-metodo-di-analisi)
8. [Ipotesi H1](#8-ipotesi-h1--opportunità-come-informazione-utile)
9. [Ipotesi H2](#9-ipotesi-h2--opportunità-come-possibilità-esterna)
10. [Ipotesi H3](#10-ipotesi-h3--opportunità-come-procedura-di-accesso)
11. [Ipotesi H4](#11-ipotesi-h4--opportunità-come-rappresentazione-di-una-fonte-esterna)
12. [Ipotesi H5](#12-ipotesi-h5--opportunità-interna-alla-piattaforma)
13. [Ipotesi H6](#13-ipotesi-h6--opportunità-come-famiglia-di-sottotipi)
14. [Ipotesi H7](#14-ipotesi-h7--opportunità-come-aggregatore-editoriale)
15. [Ipotesi H8](#15-ipotesi-h8--opportunità-come-possibilità-azionabile)
16. [Ipotesi H9](#16-ipotesi-h9--opportunità-come-relazione-tra-offerta-e-destinatario)
17. [Ipotesi H10](#17-ipotesi-h10--dominio-autonomo)
18. [Confronto sintetico delle ipotesi](#18-confronto-sintetico-delle-ipotesi)
19. [Interpretazione selezionata](#19-interpretazione-selezionata)
20. [Definizione del dominio](#20-definizione-del-dominio)
21. [Opportunità sostanziale e rappresentazione](#21-opportunità-sostanziale-e-rappresentazione)
22. [Opportunità esterna e interna](#22-opportunità-esterna-e-interna)
23. [Categorie pubbliche](#23-categorie-pubbliche)
24. [Proprietà dei fatti](#24-proprietà-dei-fatti)
25. [Fatti esclusi](#25-fatti-esclusi)
26. [Nascita, ciclo di vita e conclusione](#26-nascita-ciclo-di-vita-e-conclusione)
27. [Candidatura, valutazione e assegnazione](#27-candidatura-valutazione-e-assegnazione)
28. [Stati, temporalità, pubblicazione e visibilità](#28-stati-temporalità-pubblicazione-e-visibilità)
29. [Fonti, evidenze, verifiche e contestazioni](#29-fonti-evidenze-verifiche-e-contestazioni)
30. [Confini con gli altri domini](#30-confini-con-gli-altri-domini)
31. [Dipendenze e cicli](#31-dipendenze-e-cicli)
32. [Applicazione dei Domain Patterns](#32-applicazione-dei-domain-patterns)
33. [Rischi architetturali](#33-rischi-architetturali)
34. [Conseguenze per il Logical Model](#34-conseguenze-per-il-logical-model)
35. [Conseguenze per il Physical Domain Mapping](#35-conseguenze-per-il-physical-domain-mapping)
36. [Questioni aperte](#36-questioni-aperte)
37. [Checklist finale](#37-checklist-finale)
38. [Conclusione](#38-conclusione)

---

## 1. Scopo

**Cosa deve dimostrare questo documento.** Prima di qualunque revisione del Logical Data Model di Opportunità e prima del Physical Domain Mapping, occorre stabilire — non presumere — quale sia il significato di business del dominio: che cosa rende un fatto un’Opportunità; perché il dominio esiste in autonomia; quali fatti possiede; quali utilizza; quali esclude; quando nasce e quando cessa; quale rapporto abbia con pubblicazione, candidatura, valutazione, assegnazione e Collaborazione; quali varianti appartengano allo stesso dominio; quali decisioni restino aperte.

**Cosa NON è questo documento.**
- Non è un modello dati né un Domain Mapping.
- Non revisiona `logical/opportunita.md`.
- Non crea il Physical Domain Mapping.
- Non introduce dettagli di database, API o implementazione.
- Non tratta la struttura del menu pubblico come prova di appartenenza al dominio.

**Effetto sui documenti esistenti.** Nessuno: questo documento non modifica alcun file esistente. Eventuali incoerenze con il Logical Model esistente (non letto) o con altre fonti sono soltanto segnalabili a valle, nel riepilogo operativo di chi userà questa tesi.

---

## 2. Nota di indipendenza

La tesi è condotta **indipendentemente** dal Logical Model di Opportunità. Fonti ammesse: Costituzione, Domain Model, Platform Data Specification (come prova storica a grana larga, non come autorità sul perimetro attuale), Domain Patterns, Dependency Map, tesi e mapping dei domini di confine già approvati, modelli logici dei domini di confine **escluso** Opportunità.

La Platform Data Specification (§8) e la Costituzione (§6.3) mostrano uno stadio in cui “Opportunità” e “Collaborazioni” erano ancora fusi o parzialmente indifferenziati (tipi che includono collaborazione, fornitura, personale, bando). Il Domain Model ha poi scomposto il dominio strategico in due domini Core distinti. Questa tesi assume quella scomposizione come vincolo architetturale già deciso (`domain-model.md` §13, decisione 7) e ne ricava il significato di Opportunità **dopo** la separazione, non prima.

---

## 3. Documenti letti

Letti integralmente per questa tesi:

| Documento | Ruolo |
|---|---|
| `docs/costituzione-piattaforma.md` | Ecosistema §6.3; opportunità azionabili; bandi come esempio di partner; menu e aggregazioni (§8–§9) come contesto di prodotto, non come prova di dominio |
| `docs/domain-model.md` | Classificazione Core; responsabilità sintetica; confini con Collaborazioni/Eventi; eventi di dominio; decisioni vincolanti; questioni aperte su strutturazione economica |
| `docs/platform-data-specification.md` | Stadio storico pre-scomposizione (tipo opportunità che include collaborazione/bando; ManifestazioneDiInteresse) — prova storica, non autorità attuale |
| `docs/architecture/fundamental/domain-patterns.md` | PF1–PF20, PC2, PL4, PCa1, Fonte/Evidenza/verifica/pubblicazione/temporalità |
| `docs/architecture/physical/domain-dependency-map.md` | §8 Opportunità; D14–D18, D16, D22; V8; cicli; DV9/DV10 |
| `docs/architecture/fundamental/professionisti-domain-thesis.md` | Professionista come qualificazione; confine Servizi |
| `docs/architecture/fundamental/collaborazioni-domain-thesis.md` | Confine prioritario; D22; candidature collaborative |
| `docs/architecture/logical/persone.md` | Identità Persona; indipendenza dalle relazioni |
| `docs/architecture/logical/imprese.md` | Identità Impresa; non-incorporazione di opportunità |
| `docs/architecture/logical/appartenenze.md` | Rappresentanza; criteri relazione autonoma |
| `docs/architecture/logical/mercati-internazionali.md` | Esigenza di internazionalizzazione ≠ Opportunità |
| `docs/architecture/logical/professionisti.md` | Qualificazione; ServizioProfessionale |
| `docs/architecture/logical/collaborazioni.md` | Processo collaborativo; CandidaturaCollaborazione; origine storica |
| `docs/architecture/physical/domain-mapping/persone.md` | Riferimenti opachi in entrata |
| `docs/architecture/physical/domain-mapping/imprese.md` | Impresa non possiede Opportunità |
| `docs/architecture/physical/domain-mapping/appartenenze.md` | Titolo di rappresentanza; non generazione da processi |
| `docs/architecture/physical/domain-mapping/mercati-internazionali.md` | Nessuna dipendenza in uscita verso Opportunità |
| `docs/architecture/physical/domain-mapping/professionisti.md` | D16; osservazione DV10 su ServizioProfessionale |
| `docs/architecture/physical/domain-mapping/collaborazioni.md` | D22; confine processo; candidature locali |

**Tesi assenti** (verificato): `persone-domain-thesis.md`, `imprese-domain-thesis.md`, `appartenenze-domain-thesis.md`, `mercati-internazionali-domain-thesis.md`.

Convenzioni/principi/qualità fisica (`01`–`04`, baseline) sono applicati tramite Domain Patterns e Dependency Map, già letti integralmente.

---

## 4. Documenti esclusi dalla lettura

Deliberatamente **non** letti:
- `docs/architecture/logical/opportunita.md`
- eventuali bozze di Physical Mapping di Opportunità
- schemi di database o migrazioni relativi a Opportunità
- codice applicativo del dominio
- pagine front-end che implementano Opportunità

---

## 5. Contesto del dominio

**Posizione strategica.** Opportunità è Core e terzo pilastro del modello (`domain-model.md` §2–§3): “rappresentare un beneficio o accesso strutturato, disponibile per un periodo, offerto da un Promotore”. Non gestisce l’esecuzione della relazione una volta stabilita; non diventa automaticamente una Collaborazione (decisione vincolante 7).

**Contesto di prodotto pubblico.** La sezione pubblica “Opportunità” aggrega oggi, a livello di navigazione, bandi, finanziamenti, incentivi, fiere, formazione, gare e convenzioni. **Il menu non prova l’appartenenza al dominio.** Questa tesi verifica criticamente quali di queste voci siano varianti dello stesso concetto, quali siano aggregazioni editoriali, e quali appartengano ad altri domini (Eventi, Collaborazioni, Servizi futuri, Contenuti Editoriali).

**Storia concettuale.** Costituzione §6.3 e Platform Data Specification §8 trattavano ancora un ecosistema unico “Opportunità e Collaborazioni” con tipi misti (collaborazione, fornitura, bando). La scomposizione in due domini Core è già avvenuta nel Domain Model: la tesi lavora su Opportunità **dopo** quella separazione.

---

## 6. Domanda fondativa

> Che cosa rende un fatto una “Opportunità” e non semplicemente un contenuto editoriale, una proposta commerciale, una collaborazione, un evento, un servizio o una segnalazione?

La risposta non può essere “ciò che compare nel menu Opportunità”. Deve basarsi su: struttura della possibilità; azionabilità; condizioni e periodo; proprietà dei fatti; confine con gli altri domini già progettati.

---

## 7. Metodo di analisi

1. Isolare dalle fonti ammesse ogni affermazione su beneficio, accesso, promotore, candidatura, pubblicazione, confine con Collaborazioni/Eventi/Editoriali.
2. Formulare per H1–H10 l’argomento più forte a favore, poi i limiti e i conflitti.
3. Applicare i criteri di autonomia di dominio e i pattern PF/PC senza forzare PF4/PF5.
4. Confrontare con Dependency Map (D14–D18, D16, D22, V8, cicli) senza modificarla.
5. Separare sempre: fatto sostanziale esterno; rappresentazione sulla piattaforma; processo interno; aggregazione editoriale di menu.
6. Lasciare aperte le decisioni di prodotto e di Aggregate (PC2) dove i documenti non autorizzano una chiusura.

---

## 8. Ipotesi H1 — Opportunità come informazione utile

**Definizione.** Qualunque informazione che consenta a Persona o Impresa di ottenere un vantaggio economico, professionale, formativo o relazionale.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Copre l’ampiezza percepita dalla sezione pubblica; allinea la “utilità” della Costituzione |
| Limiti | Eccessivamente ampia: include notizie, guide, alert, raccomandazioni, semplici segnalazioni |
| Fatti proprietari | Quasi ogni contenuto “utile” — ownership impossibile da delimitare |
| Fatti esterni | Nessun confine stabile |
| Conflitti | Sovrapposizione totale con Contenuti Editoriali; invasione di Eventi e Servizi |
| Logical / Physical | Aggregate onnicomprensivo; tassonomie irriducibili |
| Pattern / Map | Viola PF1/PF2; confligge con P5/P10 (pubblicazione ≠ proprietà) |
| Rischi | Contenitore universale |

**Conclusione.** Rigettata come definizione primaria. L’utilità è necessaria ma non sufficiente.

---

## 9. Ipotesi H2 — Opportunità come possibilità esterna

**Definizione.** Possibilità offerta da un soggetto (spesso esterno), con condizioni di accesso, destinatari, periodo e possibile beneficio.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Spiega bandi, incentivi, finanziamenti agevolati, gare; distingue la notizia dalla possibilità |
| Limiti | Da sola non spiega le Opportunità interne create sulla piattaforma; “esterna” non è l’unico caso |
| Fatti proprietari | Condizioni, destinatari, periodo, beneficio dichiarati; non necessariamente la procedura completa |
| Fatti esterni | Norma, graduatoria ufficiale, erogazione, domanda sul sito dell’ente |
| Conflitti | Se “esterna” è obbligatoria, esclude H5 |
| Pattern / Map | Compatibile con fonti/evidenze locali; D14–D15 per soggetti |

**Conclusione.** Accolta come componente: molte Opportunità sono possibilità con fonte/promotore, ma non tutte sono esterne.

---

## 10. Ipotesi H3 — Opportunità come procedura di accesso

**Definizione.** Esiste solo se vi è processo formalizzato: requisiti, domanda/candidatura, valutazione, selezione/assegnazione, scadenza.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Nucleo chiaro per bandi e gare; spiega candidatura/valutazione/assegnazione |
| Limiti | Esclude o forza procedure su fiere, formazione aperta, segnalazioni azionabili senza valutazione; rischio di fare della piattaforma il gestore di procedure amministrative esterne |
| Fatti proprietari | Intero processo — spesso non governabile |
| Conflitti | Appropriazione di processi esterni; confusione con Procedure future |
| Pattern / Map | Compatibile solo con variante interna o con registrazione dichiarativa di esiti esterni |

**Conclusione.** Accolta come **variante frequente**, non come condizione necessaria di esistenza del dominio.

---

## 11. Ipotesi H4 — Opportunità come rappresentazione di una fonte esterna

**Definizione.** La piattaforma non possiede l’Opportunità sostanziale; possiede una scheda informativa che rappresenta una possibilità governata altrove.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Rispetta la proprietà dei fatti esterni; spiega fonte, verifica, aggiornamento, ritiro editoriale |
| Limiti | Da sola nega le Opportunità interne e i processi di candidatura governati in piattaforma |
| Fatti proprietari | Scheda, classificazione, pubblicazione, verifica della rappresentazione, link ufficiale |
| Fatti esterni | Istituzione, requisiti giuridici, graduatoria, assegnazione sostanziale |
| Conflitti | Se esclusiva, contraddice Costituzione (pubblicazione e candidatura come funzioni) e Domain Model (processo) |
| Pattern | Forte su Fonte/Evidenza, assi di pubblicazione/verifica |

**Conclusione.** Accolta come **modalità dominante per le Opportunità esterne**, non come unica natura del dominio.

---

## 12. Ipotesi H5 — Opportunità interna alla piattaforma

**Definizione.** La piattaforma (o un soggetto che la usa come sede del processo) crea e governa Opportunità proprie con candidature, valutazioni e assegnazioni interne.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Allinea Costituzione (pubblicazione, candidatura, ciclo di vita); spiega ManifestazioneDiInteresse storica in PDS |
| Limiti | Responsabilità, contestazioni, autorizzazioni di business; non deve assorbire processi amministrativi pubblici |
| Fatti proprietari | Processo interno completo (nei limiti dichiarati) |
| Conflitti | Se separata in altro dominio, duplica il nucleo di H2/H8 |
| Pattern / Map | D14–D17; V8 (no ownership dei soggetti) |

**Conclusione.** Accolta come **variante di origine** dello stesso dominio, non come dominio distinto.

---

## 13. Ipotesi H6 — Opportunità come famiglia di sottotipi

**Definizione.** Bando, incentivo, finanziamento, gara, convenzione, formazione e fiera sono sottotipi dello stesso concetto.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Spiega il menu; catalogazione utile |
| Limiti | Differenze irriducibili: fiera-come-Evento, convenzione-come-accordo, finanziamento-come-prodotto bancario |
| Rischi | Aggregate generico onnicomprensivo; violazione PL4 se si riusano ruoli altrui |
| Conclusione | **Parzialmente accettata**: sottotipi ammessi solo se soddisfano la definizione selezionata (§19–§20); altrimenti esclusi o aggregati solo editorialmente |

---

## 14. Ipotesi H7 — Opportunità come aggregatore editoriale

**Definizione.** “Opportunità” è solo una categoria di navigazione che aggrega oggetti di altri domini.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Spiega il menu misto |
| Limiti | Contraddice Domain Model (Core, terzo pilastro), Dependency Map §8, eventi `OpportunitàPubblicata/Chiusa/Revocata` |
| Conclusione | **Rigettata** come eliminazione del dominio. L’aggregazione di menu può esistere **sopra** il dominio, non al suo posto |

---

## 15. Ipotesi H8 — Opportunità come possibilità azionabile

**Definizione.** Possibilità strutturata rispetto alla quale un destinatario può compiere un’azione specifica entro condizioni e tempi (candidarsi, presentare domanda, iscriversi, partecipare, richiedere, aderire, manifestare interesse).

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Nucleo comune tra bandi, misure, iscrizioni condizionate, adesioni; distingue da notizia passiva (Costituzione: “non solo informazione passiva”) |
| Limiti | L’azione può essere fuori piattaforma; va distinta da iscrizione Evento e da CandidaturaCollaborazione |
| Fatti proprietari | Struttura della possibilità, condizioni, periodo, modalità di accesso, eventuale processo |
| Pattern / Map | Compatibile con Domain Model (“beneficio o accesso strutturato… per un periodo”) |

**Conclusione.** Accolta come **nucleo definitorio primario**.

---

## 16. Ipotesi H9 — Opportunità come relazione tra offerta e destinatario potenziale

**Definizione.** Relazione potenziale tra offerente, possibilità, destinatari eleggibili, beneficio, condizioni, periodo.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Spiega eleggibilità e matching concettuale |
| Limiti | Prima della candidatura non c’è relazione tra due soggetti individuati; è una possibilità offerta, non una relazione Appartenenza-like |
| PF4 / PF5 | **PF4 non è la regola primaria**: Opportunità non è un dominio relazionale di legame tra due soggetti; referenzia soggetti. PF5 si applica ai riferimenti opachi, non a un’identità di relazione |
| Conclusione | Accolta solo come **lettura secondaria** (struttura offerta–destinatari), non come natura relazionale PF4 |

---

## 17. Ipotesi H10 — Dominio autonomo

**Definizione.** Dominio con identità propria, ciclo di vita, fatti proprietari, dipendenze, possibili processi di candidatura, rappresentazione pubblica.

| Aspetto | Valutazione |
|---|---|
| Vantaggi | Coerente con Domain Model Core e Dependency Map |
| Limiti | L’autonomia riguarda la **rappresentazione governata** e l’eventuale **processo interno**, non la proprietà della norma o della procedura amministrativa esterna |
| Conclusione | **Accolta**, con la precisazione di §21–§22 |

---

## 18. Confronto sintetico delle ipotesi

| Ipotesi | Esito | Ruolo nella decisione |
|---|---|---|
| H1 Informazione utile | Rigettata come primaria | Troppo ampia |
| H2 Possibilità esterna | Parziale | Componente tipica |
| H3 Procedura formale | Parziale | Variante, non necessità |
| H4 Solo rappresentazione | Parziale | Modalità esterna dominante |
| H5 Interna | Parziale | Variante di origine |
| H6 Famiglia di sottotipi | Filtrata | Solo se azionabili strutturati |
| H7 Solo aggregatore | Rigettata | Menu ≠ dominio |
| H8 Possibilità azionabile | **Primaria** | Nucleo |
| H9 Relazione potenziale | Secondaria | Non PF4 |
| H10 Dominio autonomo | **Confermata** | Con limiti di ownership |

---

## 19. Interpretazione selezionata

**Combinazione motivata: H8 + H10, integrate da H2/H4 (variante esterna) e H5 (variante interna), con H6 filtrata e H3 come capacità opzionale del processo.**

1. **Opportunità è un dominio autonomo Core.**
2. **Possiede** la possibilità azionabile strutturata come fatto di piattaforma: identità, tipologia, origine (esterna/interna), oggetto/finalità, destinatari dichiarati, requisiti dichiarati (come rappresentazione o come regole del processo interno), beneficio dichiarato, territorio/contesto, periodo/scadenze della possibilità, modalità di accesso, pubblicazione/visibilità/verifica della scheda, e — **solo quando governati in piattaforma** — candidatura, valutazione e assegnazione proprie.
3. **Non possiede** automaticamente l’Opportunità sostanziale istituzionale esterna (norma, graduatoria ufficiale, erogazione, domanda sul sito dell’ente).
4. **Può esistere un’Opportunità interna** governata sulla piattaforma.
5. **Esterne e interne appartengono allo stesso dominio**, come varianti di origine, non come due domini.
6. **La candidatura non appartiene sempre** a Opportunità: solo se registrata o gestita dal dominio; altrimenti resta esterna o è semplice interesse/salvataggio utente.
7. **Valutazione e assegnazione** appartengono a Opportunità solo nel processo interno, o come **registrazione dichiarativa** di un esito esterno; non si appropriano della valutazione amministrativa ufficiale.
8. **Categorie pubbliche**: incluse solo se soddisfano H8 (si veda §23).
9. **Menu**: può aggregare editorialmente oggetti di altri domini senza trasferirne la proprietà.
10. **Nascita / fine**: si veda §26.

---

## 20. Definizione del dominio

**Definizione.** Un’Opportunità è una **possibilità azionabile strutturata**: un beneficio o un accesso reso disponibile — da un promotore sostanziale e/o da una fonte — rispetto a destinatari dichiarati o classificabili, sotto condizioni e in un periodo definiti, tale che un potenziale interessato possa compiere un’azione di accesso specifica (candidarsi, presentare domanda, iscriversi a condizioni, aderire, richiedere, manifestare interesse formale, partecipare sotto requisiti).

**Non è Opportunità**, di per sé:
- una notizia, guida, approfondimento o alert (Contenuti Editoriali);
- una dichiarazione collaborativa o relazione collaborativa (Collaborazioni);
- un Evento (fiera, corso, webinar) in quanto accadimento organizzato;
- un catalogo di servizi o un ServizioProfessionale;
- un prodotto finanziario commerciale generico;
- una convenzione già costituita come accordo/appartenenza;
- una semplice segnalazione priva di struttura di accesso.

**Promotore.** Soggetto che offre o istituisce la possibilità (Persona, Impresa, o ente/organizzazione non ancora modellati come dominio — referenziati in modo informativo senza creare Organizzazioni).

**Fonte.** Origine dichiarata dell’informazione; può non coincidere con il promotore né con chi pubblica sulla piattaforma.

---

## 21. Opportunità sostanziale e rappresentazione

### Opportunità sostanziale

La possibilità effettivamente resa disponibile da ente pubblico, finanziatore, impresa, associazione, istituzione, organizzatore o dalla piattaforma stessa. Include, quando esistono: atto istitutivo, requisiti giuridici, dotazione, procedura ufficiale, graduatoria, assegnazione sostanziale, erogazione.

### Rappresentazione dell’Opportunità

La scheda governata dalla piattaforma: titolo, sintesi, destinatari, beneficio, requisiti dichiarati, scadenza, area, fonte, collegamento ufficiale, classificazioni, stati di verifica/pubblicazione/aggiornamento.

| Fatto | Ownership tipica |
|---|---|
| Istituzione sostanziale esterna | Esterna (non Opportunità) |
| Identità della scheda / Opportunità di piattaforma | **Opportunità** |
| Snapshot di requisiti/beneficio/scadenza | **Opportunità** (rappresentazione; non norma) |
| Link e riferimenti alla fonte | **Opportunità** |
| Classificazioni editoriali di scheda | **Opportunità** (locali) vs editoriali di articolo (**Contenuti Editoriali**) |
| Graduatoria ufficiale / erogazione | Esterna |
| Articolo/guida sulla misura | Contenuti Editoriali |
| Verifica della rappresentazione e della fonte | **Opportunità** (verifiche proprie, non “veridicità assoluta”) |
| Pubblicazione / ritiro scheda | **Opportunità** |

**Regola.** Non attribuire alla piattaforma la proprietà di fatti dichiarati da una fonte esterna oltre la rappresentazione e gli eventuali processi interni esplicitamente assunti.

---

## 22. Opportunità esterna e interna

| | Esterna | Interna |
|---|---|---|
| Esistenza | Indipendente dalla piattaforma | Creata/governata in piattaforma (o sede del processo) |
| Piattaforma può | Censire, rappresentare, verificare fonte, classificare, pubblicare, aggiornare, ritirare | Definire requisiti operativi, ricevere candidature, valutare, selezionare, assegnare, comunicare esiti |
| Piattaforma non necessariamente | Riceve domande, valuta, assegna, modifica requisiti ufficiali, proroga scadenze ufficiali | — |
| Aggregate | Stesso dominio; **PC2 aperto** se rappresentazione e processo interno richiedano AR distinti | Stesso dominio; processo può essere Entity/AR dipendente o secondo AR (aperto) |
| Dominio Procedure | Non introdotto; eventuale futura separazione resta questione aperta | Idem |

**Decisione.** Un solo dominio Opportunità; due **varianti di origine**. Non due domini. Non anticipare un dominio Procedure.

---

## 23. Categorie pubbliche

Il menu non è prova. Criterio: soddisfano H8?

### Bandi
**Incluse** come variante tipica. Opportunità possiede la rappresentazione (e l’eventuale processo interno). Restano esterni: atto, procedura ufficiale, domanda sul sito ente, graduatoria ufficiale, erogazione.

### Finanziamenti
**Incluse** solo come misure agevolative / accessi strutturati a finanziamento. **Esclusi** dal nucleo: catalogo prodotti bancari, offerte commerciali generiche, consulenza finanziaria come servizio (futuro Servizi / Professionisti).

### Incentivi
**Incluse** come misure agevolative azionabili. **Non** proprietà della norma o del regime fiscale.

### Gare
**Incluse** come possibilità di partecipazione/accesso (segnalazione strutturata; eventuale processo interno). Restano esterni o futuri: procedura di gara completa, offerta economica, aggiudicazione contrattuale, contratto.

### Convenzioni
**Non automaticamente sottotipo.** Possono essere: opportunità di adesione (incluse se azionabili); accordo già esistente / Collaborazione; Appartenenza; contenuto informativo; servizio. Decisione di classificazione caso per caso — questione aperta per il Logical.

### Formazione
**Distinguere:**
- corso/webinar come **Evento**;
- catalogo / servizio formativo (futuro Servizi; formazione sicurezza multilingue non forzata qui);
- **Opportunità formativa** = accesso strutturato (iscrizione condizionata, bando formativo, finanziamento della formazione).

Solo l’ultimo rientra nel dominio quando azionabile strutturato.

### Fiere
**Distinguere:**
- fiera come **Evento**;
- opportunità di partecipazione/esposizione agevolata, bando per stare in fiera, missione con requisiti → **Opportunità** (può referenziare l’Evento);
- incontro B2B collaborativo → spesso **Collaborazioni**;
- articolo → **Contenuti Editoriali**.

---

## 24. Proprietà dei fatti

### Fatti candidati proprietari di Opportunità

| Fatto | Ownership |
|---|---|
| Identità dell’Opportunità (di piattaforma) | Proprietario |
| Natura/tipologia (variante) | Proprietario (catalogo locale) |
| Origine interna/esterna | Proprietario |
| Promotore sostanziale (riferimento) | Riferimento a Persone/Imprese/(enti informativi) |
| Fonte | Proprietario come pattern locale (PC11) |
| Oggetto / finalità | Proprietario (dichiarativo/rappresentativo) |
| Destinatari dichiarati | Proprietario (criteri, non elenco di soggetti) |
| Requisiti dichiarati | Proprietario come rappresentazione o regole interne; non competenza/qualifica del candidato |
| Beneficio dichiarato | Proprietario come descrizione/classificazione; non modello finanziario generale |
| Territorio / mercato obiettivo | Riferimento a Territori / Mercati; non possesso |
| Periodo / scadenza della possibilità | Proprietario (snapshot storico obbligatorio) |
| Modalità di accesso | Proprietario |
| Procedura | Proprietario solo se interna o come descrizione della procedura esterna |
| Candidatura | Proprietario **condizionato** (solo se gestita/registrata) |
| Valutazione / assegnazione | Proprietario **condizionato** (interno o registrazione esito esterno) |
| Pubblicazione / visibilità / verifica scheda | Proprietario (assi separati) |
| Aggiornamento / ritiro / chiusura rappresentazione | Proprietario |
| Note redazionali sulla scheda | Proprietario o Editoriali — da precisare in Logical (aperto) |

### Requisiti — precisazione

Opportunità può possedere requisiti strutturati, destinatari, criteri di ammissibilità, condizioni, vincoli, esclusioni, documenti richiesti, prerequisiti **come fatti della possibilità**. Distinguere: requisito dichiarato dalla fonte; interpretato editorialmente; verificato dalla piattaforma; applicato a candidatura interna. Non confondere con competenza personale, qualifica professionale, caratteristica Impresa, Appartenenza, Mercato, documento del soggetto.

### Destinatari ed eleggibilità

| Concetto | Ownership |
|---|---|
| Destinatario dichiarato (criterio) | Opportunità |
| Soggetto potenzialmente eleggibile | Derivato/valutativo, non possesso dell’identità |
| Eleggibilità verificata (processo interno) | Opportunità (esito locale) |
| Candidato | Opportunità (riferimento a Persona/Impresa) |
| Assegnatario / beneficiario (processo interno o registrato) | Opportunità (riferimento) |
| Professionista | Qualificazione via Professionisti (D16), non soggetto terzo |

### Beneficio

Trattato come descrizione strutturata / classificazione / Value Object concettuale — non Entity economico generale. Tipi: contributo, finanziamento agevolato, agevolazione, premio, accesso, partecipazione, formazione, visibilità, supporto, spazio. Non creare modello finanziario non richiesto.

### Promotore, ente, fonte

Distinti: promotore sostanziale; ente finanziatore; ente gestore; pubblicatore in piattaforma; fonte ufficiale; fonte secondaria; redazione; segnalatore. Assenza di dominio Organizzazioni: riferimenti informativi esterni ammessi; **non** creare il dominio in questa tesi.

---

## 25. Fatti esclusi

Opportunità **non** possiede:
- identità di Persone o Imprese;
- Profili Professionali, Qualifiche, Servizi Professionali;
- Appartenenze (ruoli strutturali, periodi, verifiche di relazione);
- Mercati, Presenze, Interessi;
- Eventi (programma, sede, iscrizione, biglietto);
- articoli, guide, newsletter, raccomandazioni editoriali;
- Collaborazioni derivate (solo eventuale navigazione/aggregazione non proprietaria);
- contratti, pagamenti, erogazione economica;
- normativa e regimi fiscali;
- graduatoria ufficiale esterna;
- domanda presentata fuori piattaforma (salvo registrazione dichiarativa esplicita);
- messaggistica generale;
- documenti originali della fonte (salvo riferimento o copia autorizzata come evidenza);
- esecuzione successiva all’assegnazione;
- CandidaturaCollaborazione, Manifestazione di interesse collaborativa, Inviti, Abbinamenti.

---

## 26. Nascita, ciclo di vita e conclusione

### Nascita

| Momento | Significato |
|---|---|
| Istituzione presso la fonte esterna | Nascita **sostanziale esterna** — non nasce il fatto di piattaforma |
| Conoscenza / censimento | Ingresso operativo |
| Scheda completata / verificata | Maturazione della rappresentazione |
| Pubblicazione | Visibilità — **non** nascita |
| Apertura periodo di accesso | Stato temporale della possibilità |

**Nascita del fatto posseduto dalla piattaforma:** il **censimento / registrazione** dell’Opportunità come fatto di dominio (identità stabile), anche se ancora non pubblicata. Per le esterne: nascita della rappresentazione ≠ nascita sostanziale.

### Conclusione — concetti distinti (non un unico stato)

Scadenza; chiusura; esaurimento fondi; revoca; annullamento; sospensione; assegnazione completata (processo interno); ritiro editoriale; archiviazione; sostituzione; proroga. Ciascuno appartiene ad assi diversi (§28).

### Ciclo di vita (concettuale)

1. Registrazione (nascita rappresentazione / istanza interna)  
2. Completamento e verifica della scheda  
3. Approvazione editoriale (se applicabile)  
4. Pubblicazione  
5. Periodo di accesso aperto / sospeso / prorogato  
6. Eventuale ricezione candidature (variante)  
7. Eventuale valutazione/assegnazione (variante)  
8. Chiusura sostanziale o di accesso  
9. Ritiro pubblicazione / archiviazione  

Esistenza ≠ pubblicazione ≠ apertura ≠ verifica.

---

## 27. Candidatura, valutazione e assegnazione

### Distinzioni obbligatorie

| Concetto | Dominio |
|---|---|
| Candidatura a Opportunità | Opportunità (se gestita/registrata) |
| CandidaturaCollaborazione | Collaborazioni |
| Manifestazione di interesse collaborativa | Collaborazioni |
| Iscrizione a Evento | Eventi |
| Richiesta di Servizio | Futuro Servizi / non Opportunità |
| Domanda sul sito dell’ente | Esterna |
| Salvataggio / interesse utente | Non candidatura (fuori o supporto UX) |

### Tre scenari

| Scenario | Proprietà | Ciclo / esito |
|---|---|---|
| 1. Interamente fuori piattaforma | Nessuna candidatura di Opportunità; solo link/modalità di accesso | Esito esterno non posseduto; eventuale registrazione dichiarativa facoltativa |
| 2. Registrata come fatto dichiarato | Opportunità possiede la registrazione dichiarativa | Stati limitati; nessuna pretesa di gestione ufficiale |
| 3. Gestita internamente | Opportunità possiede candidatura, ammissibilità, valutazione, selezione, assegnazione locali | Responsabilità di business della piattaforma/promotore interno |

**Non ogni Opportunità deve possedere candidature.**

### Valutazione, selezione, assegnazione

Separare: verifica ammissibilità; valutazione; graduatoria; selezione; assegnazione; aggiudicazione; concessione; ammissione; rifiuto; rinuncia.  
- Esterne ufficiali → fuori dominio (eventuale rappresentazione/registrazione).  
- Interne → fatti di Opportunità.  
Non creare una generica “Esito” che nasconda processi diversi senza motivazione (aperto al Logical come naming, vietato come fusione concettuale).

### Confine con Collaborazioni (prioritario)

- Opportunità termina la propria responsabilità all’assegnazione/chiusura della possibilità; **non** esegue la relazione.
- Un assegnatario **non** diventa automaticamente partecipante di una Collaborazione.
- L’assegnazione può generare **zero, una o più** Collaborazioni (nessun automatismo; decisione vincolante 7).
- Collaborazioni conserva solo l’**origine storica** (D22).
- Opportunità può aggregare/navigare Collaborazioni derivate **senza possederle**.
- **Nessun ciclo autorevole** Opportunità↔Collaborazioni: sola dipendenza consolidata Collaborazioni → Opportunità (D22); Opportunità non possiede Collaborazioni.

---

## 28. Stati, temporalità, pubblicazione e visibilità

### Assi da tenere separati (PF7)

1. **Stato sostanziale della possibilità:** annunciata, aperta, sospesa, chiusa, revocata, annullata, esaurita.  
2. **Stato della rappresentazione:** acquisita, da completare, aggiornata, obsoleta, ritirata.  
3. **Stato editoriale:** bozza, in revisione, approvata, respinta.  
4. **Stato di pubblicazione:** non pubblicata, programmata, pubblicata, ritirata.  
5. **Visibilità:** privata, redazionale, riservata, di rete, pubblica.  
6. **Stato di verifica:** non verificata, in verifica, verificata, non verificabile, contestata (se PCa1 applicato).  
7. **Stato temporale:** futura, aperta, in scadenza, scaduta, prorogata.  
8. **Stato candidatura** (solo se posseduta): bozza, presentata, ritirata, ammessa, esclusa, in valutazione, selezionata, respinta, assegnata, rinunciata.

### Distinzioni

Esistenza ≠ pubblicazione; pubblicazione ≠ verifica; pubblicazione ≠ apertura; visibilità ≠ pubblicazione; scadenza ≠ ritiro editoriale; ritiro ≠ cancellazione; archiviazione ≠ annullamento.

### Temporalità

Istanti/intervalli distinti: istituzione (esterna), pubblicazione ufficiale, apertura/chiusura accesso, scadenza, proroga, sospensione/riapertura, revoca, aggiornamento scheda, ultimo controllo fonte, validità rappresentazione, periodi di candidatura/valutazione/assegnazione, archiviazione. Storico obbligatorio per scadenze e condizioni rilevanti (PF8).

---

## 29. Fonti, evidenze, verifiche e contestazioni

### Fonti ed evidenze (PC11, PP2)

Pattern **locali** a Opportunità: fonte ufficiale, secondaria, documento istitutivo, pagina ufficiale, comunicazione, allegato, verifica manuale, data ultimo controllo, attendibilità, conflitto fonti, fonte non raggiungibile.  
Fonte ≠ Evidenza ≠ Verifica. Nessuna certificazione di veridicità assoluta (PF10/PF11).

### Verifiche (non un unico badge)

Distinguere: esistenza/fonte ufficiale; aggiornamento; fatti rappresentati; verifica editoriale; requisiti (processo interno); eleggibilità; candidatura; assegnazione.  
Verifiche di Persona/Impresa/Appartenenza/Professionista restano dei rispettivi domini (utilizzo esiti).

### Contestazione (PCa1 — candidata)

Può riguardare esistenza, fonte, requisito, scadenza, beneficio, destinatari, valutazione, esclusione, assegnazione, rappresentazione. Distinta da rettifica, aggiornamento, ricorso amministrativo esterno, errore, rifiuto, sospensione, revoca. Pattern **candidato**, non forzato a consolidato.

### Autorizzazioni di business (≠ Identità & Accessi)

Chi può: censire; dichiararsi promotore; modificare; verificare; approvare editorialmente; pubblicare; ritirare; aprire candidature; candidarsi; verificare ammissibilità; valutare; assegnare; registrare esito esterno.  
Ruoli di business locali (PL4): fonte, promotore, ente gestore, redazione, piattaforma, candidato, valutatore, amministratore — distinti da account/permessi tecnici (PF13/PF14).

---

## 30. Confini con gli altri domini

### Collaborazioni
Si veda §27. Processo collaborativo vs possibilità strutturata con requisiti/esito di accesso. D22 unidirezionale.

### Contenuti Editoriali
Narrazione, guide, alert, raccomandazioni, stelle, homepage highlights → Editoriali. Scheda Opportunità → Opportunità. Titolo/sintesi della scheda ≠ articolo.

### Eventi
Evento possiede tempo, luogo, programma, iscrizione. Opportunità può referenziare un Evento come contesto; un Evento può presentare un’Opportunità (bidirezionalità di riferimento ammissibile, non di ownership — Dependency Map Eventi↔Opportunità apparente/governata). Decisioni di dettaglio rinviate al mapping Eventi (anche DV9 lato Collaborazioni).

### Professionisti
Utilizzo per requisiti/destinatari qualificati (D16 facoltativa). Non crea Profili, non verifica qualifiche, non possiede Servizi Professionali. Professionista ≠ soggetto. DV10: eventuale riferimento da ServizioProfessionale verso Opportunità resta aperto, non introdotto qui come dipendenza nuova.

### Persone e Imprese
Riferimenti opachi a promotore, candidato, beneficiario, segnalatore. Dipendenze necessarie come capacità di referenziare soggetti (allineate a D14/D15). Non ogni istanza richiede entrambi.

### Appartenenze
Utilizzo del titolo di rappresentanza (D17, necessaria quando applicabile). Nessuna duplicazione; nessuna generazione di Appartenenza da candidatura.

### Mercati Internazionali
Riferimento facoltativo (D18) a mercato/territorio obiettivo. Distinguere territorio di applicazione, del promotore, mercato obiettivo. Non crea Presenze/Interessi. Esigenza di internazionalizzazione può generare Opportunità senza coincidere con essa.

### Servizi (futuro)
Non creato. Beneficio “accesso a un servizio” ≠ possesso del servizio. ServizioProfessionale resta di Professionisti.

### Organizzazioni (futuro)
Non creato. Enti come riferimenti informativi.

### Identità & Accessi
Di supporto per scritture. Non confondere account con candidato/promotore/valutatore.

---

## 31. Dipendenze e cicli

Confronto con la Dependency Map (**senza modificarla**):

| Dipendenza | Direzione | Natura candidata (tesi) | Coerenza Map |
|---|---|---|---|
| Opportunità → Persone | → | Necessaria (capacità / quando soggetto individuale) | D14 Necessaria Consolidata |
| Opportunità → Imprese | → | Necessaria (capacità / quando soggetto impresa) | D15 Necessaria Consolidata |
| Opportunità → Professionisti | → | Facoltativa | D16 Facoltativa Consolidata |
| Opportunità → Appartenenze | → | Necessaria quando applicabile (utilizzo) | D17 Provvisoria in Map — da confermare nel mapping Opportunità |
| Opportunità → Mercati Internazionali | → | Facoltativa | D18 Provvisoria |
| Opportunità → Collaborazioni | → | **Non** ownership; eventuale navigazione/aggregazione non proprietaria | Nessuna riga di ownership; ciclo eliminato (solo D22 inversa) |
| Opportunità → Eventi | → | Facoltativa **candidata** (contesto); **non** ancora censita come riga di matrice | In Map oggi: D27 Eventi→Opportunità (Facoltativa, Provvisoria); ciclo Eventi↔Opportunità apparente/governato per navigabilità, non per ownership. Nessuna riga consolidata Opportunità→Eventi |
| Opportunità → Contenuti Editoriali | → | Non necessaria; Editoriali → Opportunità è editoriale | D34 |
| Opportunità → Identità & Accessi | → | Di supporto | D49 |
| Opportunità → Organizzazioni/Servizi | — | Non operative | DV3/DV4 |
| Collaborazioni → Opportunità | ← | Facoltativa storica | D22 Consolidata |
| V8 | — | Vietata appropriazione soggetti | Confermato |
| DV10 | — | ServizioProfessionale → Opportunità non consolidata | Confermato come aperta |
| DV9 | — | Collaborazioni → Eventi | Fuori perimetro diretto; non crea Opportunità→Eventi obbligata |

**Cicli.** Opportunità↔Collaborazioni: nessun ciclo di autorità. Opportunità↔Professionisti: solo D16 in uscita da Opportunità. Opportunità↔Eventi: riferimenti facoltativi su oggetti distinti.

---

## 32. Applicazione dei Domain Patterns

| Pattern | Esito | Motivazione |
|---|---|---|
| PF1 Single Owner | Applicabile, confermato | Un solo proprietario per ciascun fatto di scheda/processo |
| PF2 No duplicazione | Applicabile, confermato | Non duplicare Eventi, Collaborazioni, profili, norme |
| PF3 | Applicabile | Non-automatismo: pubblicazione ≠ assegnazione ≠ Collaborazione |
| PF4 Proprietà relazioni | **Non applicabile come regola primaria** | Opportunità non è relazione tra due soggetti; è possibilità/processo. Non forzata |
| PF5 Riferimento opaco | **Applicabile ai riferimenti** (non come identità di relazione) | Promotore/candidato per identità stabile |
| PF6 Business ≠ accesso | Applicabile | |
| PF7 Assi indipendenti | Applicabile, centrale | §28 |
| PF8 Continuità storica | Applicabile | Scadenze/condizioni storicizzate |
| PF9 Cronologia ≠ audit | Applicabile | |
| PF10/PF11 No badge unico | Applicabile | |
| PF12 Condizioni pubblicazione | Applicabile | |
| PF13 IA applica non decide | Applicabile | |
| PF14 Ruolo business ≠ privilegio | Applicabile | PL4 cataloghi locali |
| PF15 Evento = fatto avvenuto | Applicabile | Candidati eventi di dominio |
| PF16 | Applicabile per analogia | |
| PF17 Classi dipendenza | Applicabile | |
| PF18 Ciclo apparente/reale | Applicabile | D22; Eventi |
| PF19 | Da verificare in mapping | |
| PF20 | Applicabile per analogia | Soggetto cessato ≠ cancellazione storico Opportunità |
| PL4 | Applicabile | Ruoli candidatura/valutazione locali, non di Appartenenze |
| PC2 | **Candidato / rinviato** | Valutare AR multipli: Opportunità vs Candidatura vs (eventuale) Procedura interna; esterna vs interna |
| PCa1 Contestazione | Candidato | §29 |
| Fonte/Evidenza/Verifica | Applicabili (PC11, PP2) | Locali al dominio |
| Pubblicazione/Visibilità | Applicabili | Assi separati |
| Temporalità | Applicabile | §28 |

### Eventi di dominio candidati

**Sempre / rappresentazione:** Opportunità censita; fonte registrata; rappresentazione completata; verificata; approvata editorialmente; pubblicata; apertura registrata; scadenza aggiornata; prorogata; sospesa; revocata; chiusa; scaduta; pubblicazione ritirata; archiviata.

**Solo variante interna (o registrazione):** candidatura avviata/presentata/ritirata/ammessa/esclusa/valutata; assegnazione registrata/comunicata.

**Non di Opportunità:** Collaborazione derivata (evento di Collaborazioni); istituzione sostanziale esterna non osservabile; iscrizione Evento.

Allineamento nominale con Domain Model: `OpportunitàPubblicata`, `OpportunitàChiusa`, `OpportunitàRevocata` restano coerenti; altri eventi sono candidati.

---

## 33. Rischi architetturali

| # | Rischio | Causa | Conseguenza | Prevenzione |
|---|---|---|---|---|
| 1 | Contenitore universale | Menu come prova | Perdita di confini | Criterio H8 |
| 2 | Duplicazione Editoriali | Scheda = articolo | Ownership confusa | §30 |
| 3 | Duplicazione Eventi | Fiera/corso come Opportunità | Doppi calendari | Evento vs accesso |
| 4 | Duplicazione Collaborazioni | Tipi PDS storici | Due processi fusi | Decisione 7; D22 |
| 5 | Duplicazione ServiziProf. | Beneficio-servizio | Possesso indebito | Riferimento |
| 6 | Appropriazione processi esterni | H3 totalizzante | Responsabilità illegittima | §21–§22 |
| 7 | Fonte = promotore | Sinonimi | Errori di attribuzione | Distinzione §24 |
| 8 | Requisito = tratto candidato | Confusione | Verifiche duplicate | §24 requisiti |
| 9 | Candidatura esterna/interna | Un solo modello | Falsi esiti | §27 scenari |
| 10 | Scadenza = pubblicazione | Assi fusi | Ritiri errati | §28 |
| 11 | Stato onnicomprensivo | Un enum | Perdita significato | PF7 |
| 12 | Tassonomie improprie | Menu | PL4/VO03 violati | Cataloghi locali vs condivisi |
| 13 | Dipendenze simmetriche | Navigazione | Cicli falsi | PF18 |
| 14 | Duplicazione rappresentanza | Copia Appartenenza | V10-like | D17 utilizzo |
| 15 | Modifica Opportunità esterna | Edit requisiti ufficiali | Falsificazione | Snapshot + fonte |
| 16 | Assegnazione esterna come interna | Registrazione ambigua | Contenzioso | Scenario 2 esplicito |
| 17 | Fiera/corso duplicati | H6 cieca | Conflitto Eventi | §23 |
| 18 | Convenzione duplicata | Auto-sottotipo | Conflitto Collab/App | §23 |
| 19 | Finanziamento = prodotto bancario | Ampiezza menu | Dominio finanziario | §23 |
| 20 | Violazione PL4 | Riuso ruoli Appartenenze | Confusione | Cataloghi locali |
| 21 | Anticipo Organizzazioni/Servizi | Enti/servizi | Domini fantasma | Divieto tesi |
| 22 | Aggregate enorme | H3+H6 | Inconsistenza | PC2 aperto |
| 23 | Candidatura obbligatoria | Assunzione | Rumore | §27 |
| 24 | Perdita storico fonti/scadenze | Sovrascrittura | Non auditabile | PF8 |
| 25 | Stelle editoriali = verifica | Badge unico | PF10 | Assi separati |

---

## 34. Conseguenze per il Logical Model

La futura revisione di `logical/opportunita.md` (non eseguita qui) dovrà:
1. Adottare la definizione H8+H10 e le varianti esterna/interna.
2. Separare rappresentazione e processo interno senza fondere gli assi di stato.
3. Non modellare come sottotipi obbligatori tutte le voci di menu.
4. Distinguere candidatura a Opportunità da CandidaturaCollaborazione e da iscrizione Evento.
5. Non appropriarsi di graduatorie/erogazioni esterne.
6. Mantenere D22 come origine storica unidirezionale lato Collaborazioni.
7. Tenere aperti PC2 (AR), PCa1, confine Convenzioni/Formazione/Gare, strutturazione economica (già questione in Domain Model §14).
8. Non introdurre Organizzazioni o Servizi come domini.

---

## 35. Conseguenze per il Physical Domain Mapping

Il futuro mapping dovrà:
1. Dichiarare dipendenze in uscita allineate a D14–D18 e proporre consolidamento di D17/D18.
2. Non introdurre Opportunità → Collaborazioni come ownership.
3. Valutare PC2 esplicitamente (scheda, candidatura, eventuale procedura).
4. Applicare Fonte/Evidenza/Verifica locali.
5. Confermare V8.
6. Trattare DV10 solo come osservazione fino a decisione esplicita.
7. Non anticipare database o API.

---

## 36. Questioni aperte

1. Raffinamento definitivo del catalogo tipologico interno (oltre al filtro H8).  
2. Uno o più Aggregate Root (PC2): sostanziale/rappresentazione; esterna/interna; candidatura.  
3. Grado di strutturazione di budget/graduatorie (Domain Model §14).  
4. Appartenenza fine di valutazione/assegnazione nei casi ibridi.  
5. Convenzioni: criterio operativo di classificazione.  
6. Formazione sicurezza multilingue: Eventi vs Servizi vs Opportunità.  
7. Gare: profondità massima della rappresentazione.  
8. Beneficio economico strutturato vs descrittivo.  
9. Dominio Organizzazioni / Servizi.  
10. Obsolescenza automatica vs controllo redazionale.  
11. Contestazione (PCa1) — perimetro esatto.  
12. Tassonomie condivise vs locali.  
13. Anonimizzazione candidati.  
14. Gestione massiva candidature esterne solo dichiarative.  
15. Regole di generazione Collaborazioni post-assegnazione (prodotto).  
16. Relazione con ServizioProfessionale (DV10).  
17. Rappresentanza del candidato (solo utilizzo Appartenenze?).  
18. Eventuale futuro dominio Procedure.  
19. Proprietà delle note redazionali sulla scheda vs Editoriali.  
20. Bidirezionalità di riferimento con Eventi — dettaglio al mapping Eventi; eventuale censimento di Opportunità→Eventi (oggi assente in matrice; esiste D27).  
21. Chi è il titolare pubblicante: Costituzione (§6.1) indica pubblicazione da Persona anche per conto Impresa; Platform Data Specification ammette titolare Persona o Impresa con Appartenenza abilitante — da allineare in Logical/Physical.  
22. «Bandi e finanziamenti» come voce di contenuto separata in Costituzione §8 rispetto all’inclusione dei bandi nell’ecosistema 6.3 — classificazione di prodotto vs dominio.  
23. Missioni commerciali: elenco opportunità (Costituzione 6.3) vs tipologia Evento (fiere/missioni) — ownership da non duplicare.

Non risolvere arbitrariamente questioni di prodotto.

---

## 37. Checklist finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Logical Model Opportunità non letto | Sì |
| 2 | Coerenza Domain Model (Core, decisione 7, eventi) | Sì |
| 3 | Domain Patterns applicati senza forzare PF4 | Sì |
| 4 | Dependency Map confrontata, non modificata | Sì |
| 5 | Confine Collaborazioni / D22 | Sì |
| 6 | Confine Professionisti / D16 / DV10 | Sì |
| 7 | Persone, Imprese, Appartenenze | Sì |
| 8 | Eventi e Contenuti Editoriali | Sì |
| 9 | Menu non usato come prova | Sì |
| 10 | Sostanziale vs rappresentazione | Sì |
| 11 | Esterna vs interna | Sì |
| 12 | Candidature distinte | Sì |
| 13 | No ownership fatti esterni ufficiali | Sì |
| 14 | No dominio Servizi/Organizzazioni | Sì |
| 15 | Assi di stato separati | Sì |
| 16 | Pubblicazione/visibilità/verifica/apertura/scadenza distinte | Sì |
| 17 | PF4/PF5 motivati | Sì |
| 18 | PC2 valutato | Sì (aperto) |
| 19 | Nessun dettaglio implementativo | Sì |
| 20 | Nessun altro documento modificato | Sì (da conferma operativa) |

---

## 38. Conclusione

Opportunità è un **dominio Core autonomo** il cui nucleo è la **possibilità azionabile strutturata** (H8), non l’informazione generica, non l’aggregatore di menu, non la Collaborazione, non l’Evento e non il Servizio.

Il dominio possiede la **rappresentazione governata** sulla piattaforma e, quando assunto, il **processo interno** di accesso (candidatura, valutazione, assegnazione). Non possiede la norma, la procedura amministrativa ufficiale, l’erogazione né l’esecuzione della relazione successiva.

Opportunità esterne e interne sono **varianti dello stesso dominio**. Le categorie del menu pubblico sono ammesse solo se soddisfano il nucleo; altrimenti restano di Eventi, Collaborazioni, Editoriali o di domini futuri.

Il confine con Collaborazioni resta unidirezionale sul piano dell’autorità (D22): nessuna trasformazione automatica, nessun ciclo di ownership.

Le decisioni su Aggregate multipli, profondità tipologica, contestazioni e confini fini con Formazione/Gare/Convenzioni restano aperte per Logical e Physical Mapping.

---

*Fine della Domain Thesis di Opportunità. Nessun Logical Model revisionato. Nessun Physical Domain Mapping creato. Nessun altro documento modificato da questo file.*
