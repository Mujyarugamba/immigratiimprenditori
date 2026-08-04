# Logical Data Model — Dominio EVENTI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md) (**sketch funzionale storico**, non contratto implicito), [`docs/architecture/logical/reconciliation-report.md`](./reconciliation-report.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/servizi.md`](./servizi.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md).
> Scopo del documento: definire il modello logico **autoritativo** del dominio Eventi — già anticipato in `domain-model.md` §1–§2 come dominio di Supporto e riconciliato in `reconciliation-report.md` — in modo sufficiente a consentire, in fasi successive, Physical mapping e Migration Plan **senza nuove decisioni semantiche sostanziali**. Questo documento supersede lo sketch PDS §§15–16 ovunque contrasti con le decisioni qui consolidate e con i Logical chiusi (in particolare Servizi §23).
> Autorità delle fonti. Vincolanti: Domain Model (decisioni 8, 13; mappa ownership Evento–Edizione–Sessione), Reconciliation, Dependency Map D24–D29, Logical Persone/Imprese/Appartenenze/Professionisti/Opportunità/Servizi/Contenuti. PDS = input storico non autoritativo. Ogni scelta non già vincolata è marcata come **decisione di questo Logical**.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API o interfaccia.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Nome ufficiale del dominio | **Eventi** |
| Artefatto | Logical Data Model |
| Stato | **Chiuso per il passaggio al Physical** (salvo decisioni rinviate esplicite al §42) |
| Ciclo di riferimento | Ciclo 1 — perimetro minimo implementabile (§37) |
| Physical / Migration Plan / SQL | **Fuori da questo documento** |
| Revisione | Riscrittura autoritativa post-chiusura Servizi; chiude AR, ownership, ciclo 1 e confini adiacenti |

---

## 2. Scopo

Definire cosa rappresenta il dominio Eventi nella piattaforma ImmigratiImprenditori: **accadimenti organizzati nel tempo** (iniziative con identità, organizzatore, collocazione temporale, modalità di partecipazione e, quando previsto, programma e iscrizioni), **distinti** da:

- l’OffertaDiServizio / RichiestaDiServizio (disponibilità strutturata di una prestazione, non un momento nel tempo);
- l’Opportunità (possibilità azionabile condizionata: bando, misura, accesso);
- il Contenuto editoriale (narrazione o comunicazione dell’accadimento);
- la Collaborazione (relazione ricercata o avviata tra soggetti);
- marketplace, ticketing, pagamenti, calendari personali e motori di ricorrenza complessi.

---

## 3. Fonti normative interne

| Fonte | Ruolo rispetto a questo documento |
|---|---|
| `domain-model.md` §1–§3, §10, §12–§13 (decisione 8) | Natura Supporting; ownership Evento–Edizione–Sessione; Partecipazione owned Eventi; eventi di dominio; Formazione futura |
| `reconciliation-report.md` §3.1, §6–§7 | AR Evento; inventario; confini Opportunità/Formazione; glossario Edizione/Sessione |
| `domain-dependency-map.md` D24–D29, §10 | Dipendenze Persone/Imprese/Professionisti/Opportunità/Appartenenze/Mercati |
| `logical/servizi.md` §5, §23, §29 | Sessioni/calendari/iscrizioni evento → Eventi; Offerta ≠ Evento |
| `logical/opportunita.md` | Fiera/corso/webinar come Evento ≠ misura/bando; iscrizione ≠ candidatura |
| `logical/professionisti.md` | Relatori/formatori fuori da Professionisti; D26 facoltativa |
| `logical/persone.md`, `imprese.md`, `appartenenze.md` | Soggetti referenziati; rappresentanza via Appartenenze |
| `logical/mercati-internazionali.md` | Fiera/missione come Evento con riferimento a Mercato |
| `logical/contenuti-editoriali.md` | Narrazione senza ownership dell’Evento |
| `platform-data-specification.md` §§15–16 | Sketch storico Evento/Partecipazione — **non** contratto (sessioni “future” nella PDS restano **core** nel Domain Model) |

---

## 4. Glossario

| Termine | Significato in questo dominio | Non confondere con |
|---|---|---|
| **Evento** | Aggregate root: iniziativa organizzata con identità propria, indipendente dalle singole occorrenze | Contenuto che lo racconta; Opportunità presentata; OffertaDiServizio |
| **EdizioneEvento** | Entity owned: specifica occorrenza temporale dell’Evento (data/luogo/programma propri) | Replica di marketing; “versione” di un contenuto |
| **SessioneEvento** | Entity owned dell’Edizione: parte interna del programma (giornata, intervento, laboratorio) | Sessione di autenticazione (Identità); slot di prenotazione servizio |
| **Programma** | Value object / composizione ordinata delle Sessioni di un’Edizione | Articolo editoriale; piano formativo didattico |
| **Titolare / Organizzatore primario** | Persona **oppure** Impresa che assume la responsabilità primaria dell’Evento sulla piattaforma | Promotore; Sponsor; soggetto Organizzazione futura; Account |
| **Relatore** | Ruolo di intervento in una Sessione o Edizione | Titolarità dell’Evento; ServizioProfessionale |
| **IscrizioneEvento** | Entity owned: richiesta/registrazione di partecipazione formalizzata | Candidatura a Opportunità; Iscrizione professionale (Ordine); Partecipazione effettiva |
| **Partecipazione effettiva** | Fatto a consuntivo: presenza registrata | Iscrizione; Invito; Accreditamento |
| **Capienza** | Limite dichiarativo di posti | Biglietto; inventario ticketing |
| **ModalitàEvento** | In presenza / online / ibrido | Modalità di erogazione di un servizio |
| **TipologiaEvento** | Classificazione tipologica (webinar, fiera, corso, convegno, …) | TipologiaOpportunità; CategoriaServizio |
| **Ricorrenza** | Più Edizioni dello stesso Evento nel tempo | Motore RRULE; calendario personale |
| **OffertaDiServizio** | Dominio Servizi | Non è un Evento anche se formativo |
| **Corso (dimensione temporale)** | Evento di tipologia formativa | Percorso didattico / attestato (Formazione futura) |

---

## 5. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Eventi rappresenta **iniziative collocate nel tempo** — organizzate per informare, formare, mettere in relazione, promuovere, presentare Opportunità o sviluppare attività economiche e professionali — insieme a edizioni, sessioni/programma, ruoli organizzativi e di intervento, e al processo minimo di iscrizione/partecipazione.

**Quali problemi risolve.**
- Pubblicare e trovare un accadimento organizzato con criteri di tipologia, tempo, modalità, territorio, lingua.
- Distinguere sempre l’Evento dal contenuto che lo racconta, dall’Opportunità che presenta, dal servizio che promuove e dalla Collaborazione che facilita.
- Comporre Evento → Edizione → Sessione senza perdere lo storico delle edizioni.
- Distinguere iscrizione, partecipazione prevista e partecipazione effettiva.
- Separare assi di redazione, pubblicazione, svolgimento temporale, iscrizioni e archiviazione.

**Cosa rientra nel dominio.** Evento (AR); EdizioneEvento e SessioneEvento owned; organizzatori e relatori come ruoli referenziati; tipologizzazione e modalità; tempo e ricorrenza per edizioni; luoghi/collegamenti dichiarativi; iscrizione e capienza dichiarativa; lingue dell’Evento; riferimenti opachi ammessi (§25–§31); eventi di dominio (§40).

**Cosa NON rientra nel dominio.**
- OffertaDiServizio / RichiestaDiServizio, disponibilità generica, marketplace → **Servizi**.
- Bandi, candidature, misure di accesso a fiere → **Opportunità** (la fiera in sé resta Evento).
- Articoli, guide, CMS, custodianship media → **Contenuti editoriali**.
- Anagrafiche Persona/Impresa/Professionista, Appartenenze → rispettivi domini.
- Organizzazioni istituzionali come soggetti modellati → dominio futuro **Organizzazioni**.
- Account, ruoli applicativi, RLS, check-in autenticato → **Identità & Accessi**.
- Ticketing, pagamenti, fatturazione, biglietti, commissioni.
- Motore RRULE, calendario personale, prenotazione slot di servizio.
- Esiti didattici, attestati di apprendimento → **Formazione** futura.
- FEV multi-asse completo, recensioni, rating.

**Quali domini utilizza.** Persone, Imprese (titolare/organizzatore/partecipante); Appartenenze (utilizzo rappresentanza); Professionisti (relatore facoltativo, D26); Opportunità / Mercati Internazionali / Servizi (riferimenti contestuali facoltativi); Tassonomia condivisa (lingue, settori quando strutturati).

**Quali domini utilizzano Eventi.** Contenuti (narrazione); Ricerca, Notifiche, Osservatorio; Opportunità/Collaborazioni possono reagire a fatti pubblicati senza ownership.

**Perché Eventi è autonomo.** Ha composizione temporale, partecipazione e ciclo di vita che nessun altro dominio replica (`domain-model.md` decisione 8; `servizi.md` §23).

---

## 6. Aggregate root

### Decisione AR (chiusa)

**Modello adottato: C esteso (decisione di questo Logical, vincolata dal Domain Model).**

- **Unico Aggregate Root: Evento.**
- **EdizioneEvento** e **SessioneEvento** sono **entity owned** (E02), non Aggregate Root distinte.
- Non esiste AR “Sessione” autonoma.
- Non esiste AR “Partecipazione” autonoma: IscrizioneEvento / partecipazione sono owned dall’aggregato Evento (tipicamente ancorate all’Edizione).

Questa decisione chiude l’ambiguità terminologica storica “entità autonome” del Logical precedente: **autonome rispetto ad altri domini**, non Aggregate Root multiple.

### 6.1 Evento (AR)

| Aspetto | Definizione |
|---|---|
| Identità | Iniziativa riconoscibile, stabile attraverso le Edizioni |
| Proprietario di piattaforma (titolare) | Esattamente **una** Persona **oppure** **una** Impresa (XOR), analogo al titolare Servizi |
| Organizzatore primario | Coincide col titolare nel ciclo 1, salvo co-ruoli aggiuntivi non titolari |
| Lifecycle | Assi separati §15–§16 |
| Invarianti | Finalità; titolare; almeno una collocazione temporale a livello Edizione quando pubblicabile; ≠ Contenuto/Opportunità/Servizio |
| Cardinalità | 1 Evento → 0..N Edizioni (ciclo 1: Evento pubblicabile richiede ≥1 Edizione) |
| Owned | Edizioni, Sessioni (via Edizioni), ruoli strutturali, Iscrizioni, classificazioni locali, dichiarazioni di luogo/link/lingua/capienza |
| Referenced | Persona, Impresa, (fac.) Professionista, Opportunità, Mercato, OffertaDiServizio, settore/lingua condivisi |
| Escluso | Ticketing, pagamenti, FEV completo, Organizzazione AR, auth |

### 6.2 Non-AR

| Concetto | Classificazione |
|---|---|
| EdizioneEvento | Entity owned dell’Evento |
| SessioneEvento | Entity owned dell’Edizione |
| IscrizioneEvento | Entity owned (ciclo 1) |
| RuoloOrganizzatore / RuoloRelatore | Entity owned o composizione di ruolo (riferimenti esterni) |
| Programma, Capienza, CollegamentoOnline, Periodo/Orario, CostoDichiarativo | Value object / attributi |
| Invito, Accreditamento, ListaAttesa, Biglietto | **Rinviati** oltre ciclo 1 (concetti riconosciuti, non implementati nel ciclo 1) |
| Fonte/Evidenza/Verifica locali | Pattern riconosciuto; **FEV Eventi fuori ciclo 1** |

---

## 7. Entità e classificazione

| Concetto | Natura | Ciclo 1 |
|---|---|---|
| Evento | AR | **Incluso** |
| EdizioneEvento | Owned | **Incluso** |
| SessioneEvento | Owned | **Incluso** (0..N; può essere vuoto) |
| Programma | VO / ordinamento Sessioni | Incluso come composizione |
| Organizzatore primario | Ruolo su Persona\|Impresa | **Incluso** |
| Co-organizzatore / Promotore / Partner / Sponsor | Ruoli | Parziale: testo opaco o riferimento Persona/Impresa; profondità rinviata |
| Relatore / Moderatore | Ruoli | **Incluso** (minimo Relatore) |
| Ospite | Ruolo | Rinvio / assorbibile in Relatore |
| IscrizioneEvento | Owned | **Incluso** (pipeline ridotta) |
| Partecipazione effettiva | Fatto owned o stato dell’Iscrizione | Dichiarativo minimale; check-in rinvio |
| Capienza | VO | **Incluso** (dichiarativo) |
| ListaAttesa | Concetto | **Rinvio** |
| Invito / Accreditamento | Concetti | **Rinvio** |
| Prenotazione / Biglietto / Pagamento | — | **Esclusi** |
| Ricorrenza (motore) | — | **Esclusa**; ricorrenza = più Edizioni |
| Sede/Luogo catalogo | — | **Rinvio** (Luoghi futuro); ciclo 1 = dichiarazione opaca |
| CollegamentoOnline | VO | **Incluso** |
| TipologiaEvento / ModalitàEvento | Catalogo o vocabolario chiuso | **Incluso** |
| Categoria/tema/target | Classificazione | Dichiarativa; no duplicazione cataloghi Opportunità/Professionisti |
| ContenutoCollegato / ServizioCollegato / OpportunitàCollegata | Riferimenti | Facoltativi |
| Fonte / Evidenza / Verifica | Pattern | **Fuori ciclo 1** |
| Allegato / Locandina / Registrazione | — | **Fuori** (Contenuti / futuro) |
| Attestato / Certificato partecipazione | — | **Fuori** (Formazione futura) |

---

## 8. Ownership

| Fatto | Owner | Forma |
|---|---|---|
| Esistenza e identità dell’Evento | Eventi | AR |
| Edizioni e Sessioni | Eventi | Owned |
| Programma | Eventi | Owned via Sessioni |
| Iscrizioni all’Edizione/Evento | Eventi | Owned |
| Capienza dichiarata | Eventi | Attributo/VO |
| Titolarità organizzativa di piattaforma | Eventi | Riferimento XOR Persona\|Impresa |
| Anagrafica Persona/Impresa | Persone / Imprese | Referenced |
| Profilo professionale del relatore | Professionisti | Referenced facoltativo |
| Titolo “per conto di” | Appartenenze | Utilizzo, non ownership Eventi |
| Opportunità presentata | Opportunità | Referenced |
| OffertaDiServizio contestuale | Servizi | Referenced |
| Narrazione / media | Contenuti | Referenced / fuori |
| Account e permessi | Identità | Fuori |

**Divieto di ownership ambigua.** Nessun Evento ha titolare Organizzazione prima del dominio Organizzazioni: solo etichetta informativa esterna opzionale.

---

## 9. Evento

**Responsabilità.** Scheda radice dell’iniziativa: denominazione, finalità, tipologia, pubblico destinatario, regole di pubblicazione/visibilità, relazione con le Edizioni.

**Dati obbligatori (logici).** Identità/titolo; finalità; titolare Persona XOR Impresa; almeno una Tipologia; Modalità a livello Evento o Edizione.

**Dati opzionali.** Sintesi/descrizione sostanziale; natura/tema; audience note; etichetta organizzazione esterna; riferimenti Opportunità/Servizi/Mercati; lingue; condizioni economiche dichiarative (gratuito / a pagamento / su invito economico — **senza** transazione).

**Pubblici e privati.** Il dominio include Eventi **pubblici** e **privati** (asse visibilità). “Non in elenco” è una modalità di visibilità, non un tipo ontologico distinto.

**Incontri, webinar, corsi.** Sono **tipologie** di Evento (o Edizione), non domini separati. Un webinar/corso è Evento per la dimensione temporale; non diventa OffertaDiServizio per il solo fatto di avere una data (`servizi.md` §23, §29).

---

## 10. SessioneEvento (e Edizione)

### 10.1 EdizioneEvento

**Responsabilità.** Occorrenza concreta: Periodo/Orario, luogo/link, capienza, stato temporale di svolgimento, apertura iscrizioni, programma.

**Ownership.** Cascata logica dall’Evento. Una nuova Edizione **non** sovrascrive le precedenti (`domain-model` / invarianti storici).

**Ciclo 1.** Obbligatoria ≥1 Edizione per Evento pubblicabile. Evento a occorrenza unica = una sola Edizione.

### 10.2 SessioneEvento

**Responsabilità.** Unità di programma all’interno di un’Edizione: titolo, ordine, finestra temporale interna, sala/traccia dichiarativa, relatori associati.

**Ownership.** Dell’Edizione (quindi dell’aggregato Evento).

**Cardinalità.** 0..N. Un’Edizione semplice (webinar monolitico) può avere zero Sessioni esplicite: il programma coincide con l’Edizione.

**Divieto.** Sessione ≠ appuntamento di servizio; ≠ calendario personale; ≠ sessione auth.

---

## 11. Organizzatori

| Ruolo | Ciclo 1 | Forma |
|---|---|---|
| Organizzatore primario / titolare | Obbligatorio | Riferimento **Persona XOR Impresa** |
| Co-organizzatore | Facoltativo | Stesso pattern di riferimento o etichetta |
| Promotore / Partner / Sponsor / Ospitante / Patrocinatore | Facoltativo | Etichetta opaca e/o riferimento Persona/Impresa; nessun soggetto Organizzazione obbligatorio |
| Referente operativo | Facoltativo | Contatto dichiarativo |

**Rappresentanza.** Se una Persona organizza “per conto di” un’Impresa, il titolo proviene da **Appartenenze** (utilizzo). Il ruolo Evento non crea Appartenenza.

**Soggetti esterni.** Ammessa etichetta informativa (nome ente) senza scheda; verifica/FEV rinviate.

---

## 12. Relatori e ospiti

| Ruolo | Forma ciclo 1 |
|---|---|
| Relatore | Riferimento a Persona e/o Profilo professionale (D26 facoltativo); oppure etichetta se esterno |
| Moderatore / Facilitatore / Formatore | Assorbibili come specializzazione di ruolo Relatore o rinvio |
| Ospite | Rinvio / sinonimo operativo di Relatore non strutturato |

**Divieto.** Nessun riferimento polimorfico generico `entity_type`/`entity_id`. Nessuna duplicazione anagrafica. Nessuna copia di qualifiche/FEV Professionisti.

---

## 13. Partecipanti

Il **Partecipante** non è una scheda anagrafica: è un ruolo assunto da Persona (e, se dichiarato, “per conto di” Impresa via Appartenenza) attraverso un’**IscrizioneEvento** (e, a consuntivo, partecipazione effettiva).

**Ciclo 1.** Iscrizione → conferma/cancellazione; presenza effettiva dichiarativa opzionale.
**Fuori ciclo 1.** Invito strutturato, selezione, accreditamento, sostituzione avanzata, check-in gate.

---

## 14. Tipologie e categorie

**TipologiaEvento (ciclo 1).** Vocabolario/catalogo locale Eventi, gruppi tipici già riconosciuti: networking/incontro; convegno/webinar/workshop; fiera/esposizione; missione; visita; istituzionale/associativo; corso/attività formativa; premiazione; culturale/sociale; altro.

**Non duplicare:** `TipologiaOpportunità`, categorie professionali, `service_categories`.
**Settori / temi / target.** Dichiarativi o riferimenti a cataloghi condivisi esistenti; non nuovi cataloghi verticali obbligatori.

**ModalitàEvento.** `in_presence` | `online` | `hybrid` (vocabolario chiuso).

---

## 15. Lifecycle

Assi **separati** (non un unico stato PDS). Compressione vietata.

| Asse | Significato | Valori ciclo 1 (chiusi) |
|---|---|---|
| **Redazione** | Maturità della scheda | `draft` \| `ready` |
| **Pubblicazione** | Esposizione sulla piattaforma | `unpublished` \| `published` \| `withdrawn` |
| **Svolgimento** | Percorso temporale reale dell’Edizione | `scheduled` \| `ongoing` \| `concluded` \| `postponed` \| `cancelled` |
| **Iscrizioni** | Apertura del canale di registrazione | `not_open` \| `open` \| `closed` |
| **Archiviazione** | Conservazione storica | `archived_at` assente/presente |

**Fuori asse unico.** “Programmato/Pubblicato/In corso” della PDS è **decomposto** qui.
**Fuori ciclo 1 (assi/valori).** Ideato/Segnalato/In valutazione/Contestato come stati operativi pieni; verifica multi-aspetto; disponibilità posti come asse indipendente persistito (può restare derivata).

**Regole di coerenza.**
- `published` richiede redazione `ready` e ≥1 Edizione con Periodo (anche indicativo).
- `ongoing` / `concluded` coerenti col Periodo dell’Edizione (regole applicative rinforzabili in Physical).
- `cancelled` / `postponed` **conservano** date precedenti (invariante storico).
- Archiviazione indipendente da svolgimento (un cancellato può essere archiviato).

---

## 16. Pubblicazione e visibilit�

| Concetto | Ciclo 1 |
|---|---|
| Pubblicazione | Asse §15 |
| `published_at` / `withdrawn_at` | Metadati di pubblicazione |
| Visibilità sostanziale | `private` \| `public` (estensioni rete/invito = rinvio) |
| Non in elenco | Rinvio o specializzazione futura di visibilità |
| Policy RLS / auth | **Identità** — non qui |

Visibilità ≠ permesso tecnico. Deny-by-default dei privilegi è decisione Physical/Identità, non di questo Logical.

---

## 17. Tempo e durata

Per Edizione (e Sessione se presente):

- inizio / fine (data-ora);
- fuso orario di riferimento (obbligatorio se online/internazionale);
- durata derivabile;
- flag intera giornata (ammesso);
- Periodo indicativo ammesso prima della conferma.

**Distinzione vincolante.** Data di svolgimento ≠ data di pubblicazione.

---

## 18. Ricorrenze

| Approccio | Decisione |
|---|---|
| Ricorrenza ciclo 1 | **Più Edizioni** dello stesso Evento |
| Motore RRULE / eccezioni / calendario avanzato | **Escluso** |
| Replica commerciale | Non è un concetto owned distinto; al più nuova Edizione o Sessione |

---

## 19. Luoghi

| Forma | Ciclo 1 |
|---|---|
| `country_ref` / territorio opaco | Ammesso (nessuna FK geografica inventata) |
| Etichetta sede / indirizzo testuale | Ammesso |
| Città / note | Ammessi |
| Catalogo Luoghi / Immobiliare | **Rinvio** |
| Equivalenza a `SedeImpresa` | **Vietata** (luogo Evento ≠ sede Impresa) |

---

## 20. Modalit�

`in_presence` | `online` | `hybrid`.
Presenza richiede luogo dichiarativo (anche incompleto temporaneamente). Online richiede CollegamentoOnline dichiarativo prima della partecipazione effettiva (il link può restare riservato ai soli iscritti confermati — regola di esposizione, non di Identità).

---

## 21. Programma e sessioni

Ciclo 1 include Sessioni come owned 0..N con: titolo, descrizione breve, ordine, finestra temporale, traccia/sala dichiarativa, associazione Relatori.
Agenda avanzata multi-traccia, appunti interni organizzatori, materiali di sessione → rinvio / Contenuti.

---

## 22. Partecipazione e iscrizioni

**Pipeline ciclo 1 (ridotta).**

1. Iscrizione presentata (da Persona; eventuale “per conto di” Impresa).
2. Iscrizione confermata oppure cancellata.
3. (Opzionale) partecipazione effettiva dichiarata a consuntivo.

**Modalità di accesso dichiarate sull’Edizione.** Libera / iscrizione richiesta / su invito (il flusso Invito strutturato è **rinviato**: in ciclo 1 “su invito” è vincolo dichiarativo di accesso, non entità Invito).

**Distinzioni vincolanti.**

| Concetto | ≠ |
|---|---|
| IscrizioneEvento | Candidatura Opportunità; Iscrizione professionale; RichiestaDiServizio |
| Partecipazione effettiva | Iscrizione confermata |
| Prenotazione/biglietto | Fuori dominio |

---

## 23. Capienza e lista d’attesa

**Capienza.** Dichiarativa sull’Edizione (e facoltativamente sulla Sessione). Posti esauriti = condizione derivabile o flag; blocca nuove conferme se dichiarato.

**Lista d’attesa.** Concetto riconosciuto, **fuori ciclo 1**.

---

## 24. Lingue

Ciclo 1: lingue dell’Evento/Edizione come riferimenti al catalogo lingue condiviso (una o più), più note su traduzione/interpretariato **dichiarative**.
Nessuna deduzione automatica dalla nazionalità delle Persone.
Supporto linguistico per formazione sicurezza = attributo rilevante, non portale di traduzione (`servizi.md` / Professionisti restano per offerte linguistiche strutturate).

---

## 25. Relazioni con Servizi

| Appartiene a Eventi | Appartiene a Servizi |
|---|---|
| Accadimento temporale, edizioni, sessioni | Offerta/Richiesta strutturata pubblicabile |
| Iscrizioni evento, capienze | Disponibilità dichiarativa dell’offerta |
| Webinar/corso come momento | Corso come servizio offerto (scheda) |
| Prenotazione temporale dell’evento | Prenotazione/calendario servizio (**fuori entrambi** nel ciclo 1 Servizi; Eventi non assorbe calendari di servizio) |

**Regole.**
- Un servizio **non** è un evento.
- Un evento può **promuovere/presentare** un’OffertaDiServizio tramite riferimento facoltativo, senza ownership.
- Nessuna duplicazione di `service_offers` / `service_requests`.
- Le disponibilità generali del servizio **non** appartengono a Eventi.

---

## 26. Relazioni con Opportunit�

| | Eventi | Opportunità |
|---|---|---|
| Natura | Accadimento organizzato | Possibilità azionabile |
| Fiera | L’evento-fiera | Misura/bando di partecipazione a fiera |
| Corso/webinar | Accadimento | “Formazione (accesso)” strutturata ≠ corso |
| Registrazione | IscrizioneEvento | Candidatura / interesse |
| Scadenza | Periodo Evento | Finestra di accesso Opportunità |

**Collegamento.** Riferimento facoltativo Evento/Edizione → Opportunità (D27, ancora **provisional** a livello Dependency Map): presentazione senza incorporazione.
**Nessuna** FK obbligatoria. Call/bando/scadenza Opportunità **non** sono Eventi.

---

## 27. Relazioni con Professionisti

- Relatore/formatore può referenziare un Profilo professionale (D26, facoltativo).
- L’Evento resta valido senza Profilo.
- Nessuna gestione di iscrizioni/capienze in Professionisti.
- Nessuna duplicazione di qualifiche, lingue operative, territori serviti.

---

## 28. Relazioni con Imprese

- Impresa come titolare/organizzatore, sponsor, ospitante, partecipante “per conto di”.
- Nessuna iscrizione/capienza owned da Imprese.
- Luogo Evento ≠ SedeImpresa.

---

## 29. Relazioni con Organizzazioni

Dominio **successivo**.
Ciclo 1: nessuna dipendenza obbligatoria; solo etichetta esterna informativa.
Organizzatore/sponsor/partner istituzionali strutturati → rinvio.
Nessuna ownership ambigua verso oggetti inesistenti.

---

## 30. Relazioni con Contenuti

| In Eventi | In Contenuti |
|---|---|
| Descrizione sostanziale della scheda | Articoli, guide, comunicati, pagine |
| — | Immagini/video/registrazioni come narrazione o media |
| — | Materiali post-evento in custodianship editoriale |

Eventi **non** gestisce il CMS. Un Contenuto può referenziare un Evento senza modificarlo.

---

## 31. Relazioni con Identità & Accessi

**Non introdotto:** account, ruoli applicativi, permessi, moderatori, policy RLS, credenziali, check-in autenticato, ownership `auth`.

**Rinviato:** chi può pubblicare per un’Impresa (oltre Appartenenza); visibilità tecnica dei partecipanti; enforcement della visibilità privata.

---

## 32. FEV, recensioni e attestazioni

**Ciclo 1:** nessun FEV Eventi; nessun badge “Evento verificato”; nessuna importazione del FEV Professionisti; nessuna recensione/rating; nessun attestato/certificato di partecipazione.

**Rinvio.** Pattern locale Fonte/Evidenza/Verifica multi-aspetto (data, luogo, organizzatore, …) in cicli successivi, coerente con il rifiuto dei badge generici (`domain-model.md` §7).

---

## 33. Documenti e allegati

Ciclo 1: **nessun** possesso Storage. Ammesso link esterno dichiarativo. Locandine/registrazioni/atti → Contenuti o rinvio.

---

## 34. Invarianti

1. Ogni Evento ha esattamente un titolare Persona **oppure** Impresa.
2. Evento ≠ Edizione ≠ SessioneEvento, pur componendo un’unica struttura (`domain-model` decisione 8).
3. Evento ≠ Contenuto ≠ Opportunità ≠ OffertaDiServizio ≠ Collaborazione ≠ Corso didattico completo.
4. Una nuova Edizione non sovrascrive le precedenti.
5. Iscrizione ≠ partecipazione effettiva ≠ candidatura a Opportunità.
6. Redazione, pubblicazione, svolgimento, iscrizioni e archiviazione restano assi distinti.
7. Rinvio/cancellazione conservano lo storico delle date.
8. Ruoli Evento non creano Appartenenza né permessi Identità.
9. Nessun ticketing/pagamento/biglietto nel dominio.
10. Nessuna dipendenza obbligatoria verso Organizzazioni non formalizzate.
11. Nessun riferimento polimorfico generico.
12. Luogo Evento ≠ SedeImpresa; SessioneEvento ≠ disponibilità servizio.
13. Lingue non dedotte dall’origine delle Persone.
14. La piattaforma non garantisce qualità, riuscita o sicurezza dell’Evento.

---

## 35. Dati derivati

- Posti rimanenti (da capienza − iscrizioni confermate).
- Viste calendario personali / aggregati ricerca.
- Metriche Osservatorio.
- Suggerimenti “collega Opportunità/Servizio” — UX, non verità owned.

---

## 36. Dati vietati

- Ticketing, ordini, pagamenti, commissioni, fatture, biglietti.
- Motore RRULE / calendari complessi / prenotazione slot servizio.
- Marketplace matching partecipanti.
- `entity_type` / `entity_id` polimorfici.
- JSONB modellante come sostituto del modello.
- Titolarità Organizzazione obbligatoria.
- Policy RLS / ruoli auth.
- FEV/recensioni/attestati nel ciclo 1.
- Duplicazione anagrafiche Persone/Imprese/Professionisti.
- Assorbimento di OffertaDiServizio o Opportunità.

---

## 37. Perimetro ciclo 1

**Obiettivo minimo.** Consentire a Persona/Impresa di creare e pubblicare Eventi con almeno un’Edizione, modalità e luogo/link dichiarativi, tipologia, lifecycle a assi separati, Sessioni opzionali, iscrizione base e capienza dichiarativa — sufficienti al Physical senza nuove decisioni semantiche.

**Incluse.**
- Evento (AR)
- EdizioneEvento (≥1 se pubblicato)
- SessioneEvento (0..N)
- Titolare/organizzatore Persona XOR Impresa
- Relatore (riferimento minimale)
- Tipologia + Modalit�
- Tempo/fuso; luogo opaco; CollegamentoOnline
- Lingue
- IscrizioneEvento (presentata/confermata/cancellata)
- Capienza dichiarativa
- Assi redazione, pubblicazione, svolgimento, iscrizioni, archiviazione
- Riferimenti facoltativi: Professionista, Opportunità, Mercato, OffertaDiServizio
- Etichetta organizzazione esterna

**Escluse dal ciclo 1.**
- Invito/Accreditamento/Lista attesa/selezione
- Check-in, biglietti, pagamenti
- FEV, recensioni, attestati
- RRULE / calendario personale
- Organizzazioni AR
- Identità & Accessi
- Collaborazione come owned
- Formazione didattica
- Allegati/Storage
- Physical/SQL

**Dipendenze ammesse per il futuro Physical.** Persone, Imprese; facoltativi Professionisti, Opportunità, Mercati Internazionali, Servizi (riferimento), lingue/settori condivisi; Appartenenze solo come utilizzo applicativo di rappresentanza.

**Criteri di completamento.** Questo documento chiude le decisioni semantiche necessarie al Physical del ciclo 1 (§43–§44).

---

## 38. Fuori perimetro (sintesi)

Ticketing; pagamenti; marketplace; RRULE; calendario personale; FEV Eventi; recensioni; attestati; CMS; Organizzazioni; Identità; Formazione didattica; Luoghi catalogo; Inviti/Accrediti/Liste attesa strutturati; prenotazioni di servizio.

---

## 39. Dipendenze

| Direzione | Dipendenza | Natura |
|---|---|---|
| Eventi → Persone | Titolare / partecipante / relatore | Necessaria (titolare o soggetto) |
| Eventi → Imprese | Titolare / partecipante / sponsor | Necessaria quando titolare=Impresa |
| Eventi → Appartenenze | “Per conto di” | Utilizzo futuro |
| Eventi → Professionisti | Relatore | Facoltativa (D26) |
| Eventi → Opportunità | Contesto presentato | Facoltativa (D27 provisional) |
| Eventi → Mercati Internazionali | Contesto | Facoltativa (D29 provisional) |
| Eventi → Servizi | Contesto Offerta | Facoltativa |
| Eventi → Organizzazioni / Identità | — | Rinviate |
| Contenuti / Osservatorio / Notifiche → Eventi | Consumo | Senza ownership |

Nessun ciclo di ownership nuovo verso domini non chiusi.

---

## 40. Eventi di dominio

Fatti avvenuti (participio passato), non comandi. Sottoinsieme ciclo 1 rilevante:

- EventoPubblicato, EventoRitirato, EventoArchiviato
- EdizioneProgrammata, EdizioneRinviata, EdizioneCancellata, EventoIniziato, EventoConcluso
- SessioneEventoCreata, SessioneEventoCancellata (se usata)
- IscrizioneEventoPresentata, IscrizioneEventoConfermata, IscrizioneEventoAnnullata
- RelatoreAssociato
- OpportunitàAssociataAEvento (se riferimento usato)

Estensioni (Invito, Accreditamento, CollaborazioneGenerata, FEV, …) restano nel vocabolario storico ma **fuori ciclo 1**.

---

## 41. Questioni risolte

1. AR unico = Evento; Edizione/Sessione owned (modello C esteso).
2. Rapporto Evento/Sessione chiuso; Sessione non è AR.
3. Titolare = Persona XOR Impresa; Organizzazioni non obbligatorie.
4. Eventi pubblici e privati ammessi (visibilità).
5. Webinar/corsi/incontri = tipologie Evento, non domini separati.
6. PDS §§15–16 non autoritativa su lifecycle unico e “sessioni future”.
7. Ciclo 1 include Edizioni + Sessioni 0..N + Iscrizione base; esclude ticketing/RRULE/FEV/Inviti strutturati.
8. Confine Servizi chiuso (`servizi.md` §23 riconfermato).
9. Confine Opportunità: fiera-evento ≠ misura; iscrizione ≠ candidatura.
10. Relatori senza polimorfismo; D26 facoltativa.
11. Lifecycle a assi separati (non stato unico).
12. Ricorrenza = più Edizioni, non RRULE.
13. Luogo dichiarativo opaco; non SedeImpresa.
14. Capienza sì; lista d’attesa no (ciclo 1).
15. FEV/recensioni/attestati fuori ciclo 1.
16. Identità & Accessi solo rinvio concettuale.

---

## 42. Decisioni rinviate

1. Flussi Invito / Accreditamento / Lista attesa / selezione.
2. FEV multi-aspetto e contestazione operativa.
3. Visibilità avanzata (rete, invito, non in elenco) oltre private/public.
4. Check-in e presenza strumentata.
5. Attestati e dominio Formazione.
6. Catalogo Luoghi / Immobiliare.
7. Soggetti Organizzazione strutturati.
8. Custodia media post-evento (confine operativo Contenuti).
9. Consolidamento Dependency Map D27/D28/D29 oltre provisional.
10. Regole operative dettagliate di riverifica fonti esterne.
11. Calendario personale e notifiche (domini/funzioni consumatrici).
12. Collaborazione “generata da Evento” come fatto strutturale vs narrativo.

Queste **non** bloccano il Physical del ciclo 1.

---

## 43. Criteri per il futuro Physical

Il Physical dovrà, senza riaprire semantica:

1. Mappare **una** AR `Evento` e owned Edizione/Sessione/Iscrizione/ruoli secondo §6–§13.
2. Usare FK reali verso `profiles` / `businesses` (XOR titolare); riferimenti facoltativi a Professionisti/Opportunità/Mercati/Servizi.
3. **Non** introdurre `entity_type`/`entity_id`, JSONB modellante, ticketing, RRULE, Organizzazioni AR, `auth.users` come owner.
4. Separare colonne/assi per redazione, pubblicazione, svolgimento, iscrizioni, archiviazione.
5. Conservare storico edizioni/rinvii/cancellazioni.
6. Abilitare RLS deny-by-default senza policy Identità nel ciclo 1 Eventi (pattern già usato negli altri domini).
7. Trattare `country_ref`/sede come opachi; lingue via catalogo esistente (`bigint` se coerente col resto della piattaforma).
8. Non creare tabelle Invito/Accredito/ListaAttesa/FEV/Storage nel ciclo 1.
9. Non assorbire `service_*` né tipologizzare Opportunità come Evento.

---

## 44. Criteri di accettazione

Il Logical è accettabile per il Physical se e solo se:

- AR e owned sono non ambigui;
- Evento/Edizione/Sessione sono distinti e compositi;
- ciclo 1 include/esclude è esplicito;
- confini Servizi, Opportunità, Contenuti, Professionisti, Imprese, Organizzazioni, Identità sono chiusi;
- nessun ticketing/marketplace/RRULE inventato;
- nessun dettaglio SQL è prescritto oltre i criteri §43;
- le decisioni rinviate non sono necessarie al mapping ciclo 1.

---

## 45. Stato finale

**Logical Eventi chiuso per il passaggio al Physical del ciclo 1**, con Aggregate Root unico **Evento**, composizione owned **EdizioneEvento** e **SessioneEvento**, titolarità Persona|Impresa, lifecycle a assi separati, iscrizione e capienza dichiarative, e confini espliciti verso Servizi (post-chiusura), Opportunità, Contenuti e domini futuri.

Physical mapping, Migration Plan e SQL **non** sono parte di questo documento e restano fasi successive autorizzate solo dopo accettazione di questo Logical.
