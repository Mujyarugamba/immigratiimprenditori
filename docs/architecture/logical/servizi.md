# Logical Data Model — Dominio SERVIZI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md) (**sketch funzionale storico**, non contratto implicito), [`docs/architecture/logical/reconciliation-report.md`](./reconciliation-report.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/eventi.md`](./eventi.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md).
> Scopo del documento: definire il modello logico autoritativo del dominio Servizi — erede del dominio “Servizi” del Domain Model v1 e area futura prioritaria di `domain-model.md` §11 / `reconciliation-report.md` §13 — in modo sufficiente a consentire, in fasi successive, Physical mapping e Migration Plan **senza nuove decisioni semantiche sostanziali**. Questo documento risolve il gate di `domain-model.md` §15: nessun passaggio al fisico è ammesso prima della chiusura di un Logical dedicato.
> Autorità delle fonti. Le decisioni già consolidate nei Logical chiusi (in particolare Professionisti §1/§7, Imprese ServizioImpresa, Opportunità, Mercati Internazionali §9, Eventi §10) sono vincolanti. La Platform Data Specification (PDS) fornisce uno sketch funzionale pre-scomposizione: è input utile, **non** autorità che impone specializzazioni, stati o meccanismi (es. ManifestazioneDiInteresse riusata) senza riesame. Ogni scelta non già vincolata dalle fonti chiuse è marcata come **decisione di questo Logical**.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API o interfaccia.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Nome ufficiale del dominio | **Servizi** |
| Artefatto | Logical Data Model |
| Stato | **Chiuso per il passaggio al Physical** (salvo decisioni rinviate esplicite al §37) |
| Ciclo di riferimento | Ciclo 1 — perimetro minimo implementabile (§32) |
| Physical / Migration Plan / SQL | **Fuori da questo documento** |

---

## 2. Scopo

Definire cosa rappresenta il dominio Servizi nella piattaforma ImmigratiImprenditori: offerte e richieste di servizio **strutturate e pubblicabili**, con regole proprie di titolarità, classificazione, ciclo di vita, pubblicazione e ricercabilità, **distinte** da:

- la dichiarazione di capacità sul Profilo professionale (`ServizioProfessionale` / `professional_services`);
- l’offerta dichiarativa owned dall’Impresa (`ServizioImpresa` / `business_services`);
- l’Opportunità come possibilità azionabile condizionata;
- l’Evento come accadimento temporale;
- il Contenuto editoriale come narrazione;
- marketplace, pagamenti, prenotazioni e contratti.

---

## 3. Fonti normative interne

| Fonte | Ruolo rispetto a questo documento |
|---|---|
| `domain-model.md` §11, §13 decisioni 24–26, §15 | Priorità del dominio futuro; servizi linguistici accessori; Formazione/Immobiliare aree future; gate Logical → Physical |
| `reconciliation-report.md` §12–§13, §16 rischio 2, §18 | Servizi candidato; rischio implementazione ad-hoc; obbligo di Logical dedicato |
| `domain-dependency-map.md` DV4, note su ServizioProfessionale / ServizioImpresa | DV4 orfane non assorbite; ServizioProfessionale ≠ dominio Servizi |
| `logical/professionisti.md` §1, §7 | Distinzione vincolante ServizioProfessionale ≠ OffertaDiServizio |
| `logical/imprese.md` ServizioImpresa | Ownership Imprese; non OffertaDiServizio |
| `logical/opportunita.md` | Opportunità ≠ servizio commerciale; accesso a servizi come beneficio dichiarato |
| `logical/collaborazioni.md` | Offerta di Collaborazione ≠ OffertaDiServizio |
| `logical/mercati-internazionali.md` §9 | Offerta linguistica strutturata → Servizi |
| `logical/eventi.md` §10 | Corso/webinar temporale → Eventi; offerta formativa strutturata → Servizi/Formazione |
| `logical/persone.md` | Persona titolare di Offerta/Richiesta; LinguaParlata ≠ OffertaLinguistica |
| `platform-data-specification.md` §12–§14 | Sketch storico Offerta/Richiesta/specializzazioni/QualificaDichiarata — **non** contratto |

---

## 4. Glossario

| Termine | Significato in questo dominio | Non confondere con |
|---|---|---|
| **OffertaDiServizio** | Aggregate root: scheda strutturata di un servizio reso disponibile e pubblicabile da un titolare | ServizioProfessionale; ServizioImpresa; Offerta (Collaborazioni) |
| **RichiestaDiServizio** | Aggregate root: scheda strutturata di un bisogno di servizio pubblicato da un richiedente | Opportunità; Collaborazione-domanda; ManifestazioneDiInteresse |
| **Titolare** | Persona o Impresa che possiede l’Offerta o la Richiesta come fatto di piattaforma | Erogatore; Promotore di Opportunità; Pubblicatore tecnico (Identità) |
| **Erogatore** | Soggetto che materialmente fornisce il servizio (Persona, Professionista via Profilo, Impresa); può coincidere col Titolare | Ownership della scheda |
| **Destinatario potenziale** | Criterio su a chi è rivolto il servizio (Persone, Imprese, entrambi, altro descrittivo) | Elenco nominativo di clienti; destinatario di Opportunità |
| **Categoria verticale** | Classificazione primaria dell’offerta/richiesta (linguistico, formativo, professionale generico, finanziario, immobiliare, supporto/altro) | Sotto-dominio autonomo; Categoria professionale di Professionisti |
| **Natura del servizio** | Descrizione tipologica dell’attività (consulenza, traduzione, mediazione, formazione, assistenza, ecc.) | Natura del ServizioProfessionale (catalogo Professionisti) |
| **Fascia economica indicativa** | Indicazione descrittiva di costo/gratuità/“su richiesta” | Prezzo vincolante; listino; transazione |
| **Area di disponibilità** | Dichiarazione di dove/come il servizio è erogabile (territorio, remoto, presenza) | Copertura M5 del Profilo professionale; SedeImpresa |
| **ServizioProfessionale** | Dichiarazione owned da Professionisti | OffertaDiServizio |
| **ServizioImpresa** | Dichiarazione owned da Imprese | OffertaDiServizio |
| **Prestazione** | Esecuzione concreta di un incarico | Fuori perimetro (non modellata) |
| **Capacità** | Abilità/competenze del soggetto | Di Persone/Professionisti/Imprese, non di questo dominio |
| **Marketplace** | Mercato transazionale con ordini/pagamenti/matching automatico | Fuori perimetro |

---

## 5. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Servizi rappresenta **offerte e richieste di servizio strutturate** sulla piattaforma: schede con identità propria, titolare, classificazione, condizioni dichiarative di erogazione, ciclo di vita di pubblicazione e regole di visibilità/ricerca. Non rappresenta la capacità anagrafica del Professionista né il catalogo interno dell’Impresa; non rappresenta bandi né eventi.

**Quali problemi risolve.**
- Rendere trovabili e confrontabili servizi disponibili (e bisogni dichiarati) oltre la sola scheda profilo/impresa.
- Separare **“so / dichiaro di offrire”** (Professionisti, Imprese) da **“pubblico un’offerta strutturata”** (questo dominio).
- Coprire verticali richiamati dal Domain Model v1 e dalla PDS (linguistico, formativo, professionale generico, finanziario, immobiliare) come **classificazioni**, senza creare sotto-domini prematuri.
- Mantenere i servizi linguistici **accessori e trasversali** (decisione vincolante 24), senza trasformare la piattaforma in portale generalista di traduzione.

**Cosa rientra nel dominio.** OffertaDiServizio e RichiestaDiServizio (§6–§10); titolare, erogatore e destinatari potenziali (§11); categorie e specializzazioni dichiarative (§12); lifecycle e pubblicazione (§13–§14); condizioni economiche descrittive (§15); area di disponibilità, lingue di erogazione e disponibilità dichiarativa dell’offerta (§16–§18); riferimenti opachi ammessi verso Persone, Imprese, Professionisti, Mercati, Opportunità (§19–§21); eventi di dominio (§35).

**Cosa NON rientra nel dominio.**
- ServizioProfessionale, Qualifiche, Iscrizioni, Abilitazioni, FEV del Profilo → **Professionisti**.
- ServizioImpresa, ProdottoImpresa, anagrafica Impresa → **Imprese**.
- Opportunità, bandi, finanziamenti agevolati, candidatura a opportunità → **Opportunità**.
- Offerta/domanda di Collaborazione → **Collaborazioni**.
- Sessioni, calendari, iscrizioni evento, webinar come accadimento → **Eventi**.
- Articoli, guide, CMS → **Contenuti editoriali**.
- Organizzazioni istituzionali come soggetti modellati → dominio futuro **Organizzazioni**.
- Account, ruoli, permessi, RLS → **Identità & Accessi**.
- Pagamenti, ordini, checkout, commissioni, fatturazione, contratti, prenotazioni vincolanti, matching marketplace.
- Prestazione eseguita, SLA operativo, gestione documentale generica, Storage.
- Assorbimento automatico delle strutture DV4 (`language_service_*`, `training_*`) (§26).

**Quali domini utilizza.**
- **Persone**, **Imprese** — titolare / richiedente / erogatore (riferimento opaco).
- **Appartenenze** — titolo di rappresentanza quando una Persona agisce per un’Impresa (utilizzo, senza ownership).
- **Professionisti** — riferimento facoltativo a Profilo / ServizioProfessionale come base dichiarativa o erogatore qualificato.
- **Mercati Internazionali** — contesto facoltativo di mercato servito/richiesto.
- **Tassonomia condivisa** — lingue e settori quando strutturati; territori solo se/quando catalogo condiviso disponibile (ciclo 1: area dichiarativa, §16).
- **Opportunità** — collegamento facoltativo contestuale (es. servizio di supporto all’accesso), senza ownership.
- **Eventi**, **Contenuti**, **Organizzazioni**, **Identità & Accessi** — solo riferimenti futuri o responsabilità rinviate (§22–§25).

**Quali domini utilizzano Servizi.**
- **Ricerca**, **Notifiche**, **Osservatorio** — trovabilità, segnalazioni, aggregati.
- **Contenuti editoriali** — possono narrare un’offerta senza possederla.
- **Eventi** — possono referenziare un’offerta formativa/linguistica come contesto, senza incorporarla.
- **Professionisti** / **Imprese** — possono suggerire la pubblicazione di un’Offerta a partire da una dichiarazione, senza fondere le entità (reazione a fatti, non ownership inversa).

**Perché Servizi è un dominio autonomo.** Ha regole di pubblicazione, classificazione verticale, ciclo di vita dell’offerta/richiesta e ricercabilità che non coincidono con il Profilo professionale, con la scheda Impresa, né con Opportunità/Collaborazioni/Eventi. La distinzione è già vincolante in Professionisti §7 e riconfermata dalla riconciliazione.

---

## 6. Aggregate root

### Decisione (B) — due aggregate root distinte

**Decisione di questo Logical.** Il dominio adotta **due aggregate root distinte**:

1. **OffertaDiServizio**
2. **RichiestaDiServizio**

Non si adotta un unico AR comune con specializzazioni polimorfiche (opzione C): offerta e richiesta hanno lifecycle, direzione (offerta vs domanda) e invarianti diversi. Non si adotta la sola Offerta (opzione A) come unico concetto di dominio: la Richiesta appartiene semanticamente a Servizi (PDS §13; Persone come autrice), ma il **ciclo 1 fisico** può realizzarla in unità successive rispetto all’Offerta senza negarne lo status di AR (§32).

### 6.1 OffertaDiServizio

| Aspetto | Definizione |
|---|---|
| Identità concettuale | Scheda stabile di un servizio reso disponibile sulla piattaforma |
| Proprietario (titolare) | Esattamente una **Persona** oppure un’**Impresa** |
| Lifecycle | Assi separati: esistenza/redazione, pubblicazione, disponibilità dichiarata, archiviazione (§13) |
| Invarianti | Ha sempre un titolare; appartiene a esattamente una categoria verticale primaria; titolo e descrizione obbligatori per pubblicazione; non è ServizioProfessionale né ServizioImpresa |
| Cardinalità | Un titolare → 0..N Offerte; un’Offerta → 1 titolare |
| Relazioni ammesse | Riferimenti opachi a erogatore (Persona/Profilo professionale/Impresa); riferimento facoltativo a ServizioProfessionale e/o ServizioImpresa di origine; Mercato; Opportunità contestuale; Evento contestuale (futuro) |
| Relazioni vietate | Ownership di Profilo, Qualifiche, FEV Professionisti; ownership di ServizioImpresa; incorporazione di Evento/Contenuto; FK obbligatoria a Organizzazioni non modellate |
| Dati owned | Identità scheda; titolo; descrizione sostanziale dell’offerta; categoria; natura/modalità dichiarative; area di disponibilità; lingue di erogazione; fascia economica; stati propri; destinatari potenziali |
| Dati referenced | Persona/Impresa titolare; eventuale Profilo/ServizioProfessionale; eventuale ServizioImpresa; lingue/settori/mercati di catalogo |
| Dati derivati | Trovabilità aggregata; eventuali suggerimenti “da dichiarazione a offerta” (non persistiti come verità) |
| Escluso | Transazione, pagamento, prenotazione, prestazione eseguita, recensioni, matching automatico |

### 6.2 RichiestaDiServizio

| Aspetto | Definizione |
|---|---|
| Identità concettuale | Scheda stabile di un bisogno di servizio dichiarato |
| Proprietario (titolare) | Esattamente una **Persona** oppure un’**Impresa** |
| Lifecycle | Redazione/pubblicazione; valutazione; conclusione/scadenza/archiviazione (§13) |
| Invarianti | Ha sempre un titolare; categoria verticale primaria; titolo e descrizione obbligatori se pubblicata; ≠ Opportunità |
| Cardinalità | Un titolare → 0..N Richieste; una Richiesta → 1 titolare |
| Relazioni ammesse | Contatto/interesse futuro (non marketplace); riferimento facoltativo a Opportunità/Collaborazione come contesto |
| Relazioni vietate | Trasformazione automatica in Opportunità; ownership di CandidaturaOpportunità |
| Dati owned | Identità; titolo; descrizione; categoria; urgenza/scadenza dichiarative; area/lingue richieste; stati |
| Dati referenced | Persona/Impresa titolare |
| Escluso | Assegnazione vincolante di fornitore; pagamento; matching automatico |

---

## 7. Entità e classificazione

| Concetto | Classificazione | Ciclo 1 |
|---|---|---|
| OffertaDiServizio | Aggregate root | Inclusa |
| RichiestaDiServizio | Aggregate root | Inclusa nel Logical; realizzazione fisica ammissibile nello stesso ciclo o immediatamente a seguire (§32) |
| Titolare | Ruolo/relazione (riferimento) | Inclusa |
| Erogatore | Ruolo/relazione (riferimento, facoltativo se = titolare) | Inclusa (dichiarativa) |
| Destinatario potenziale | Value object / criterio descrittivo | Inclusa |
| Categoria verticale | Catalogo/classificazione governata del dominio | Inclusa |
| Natura del servizio | Value object o catalogo leggero locale | Inclusa (dichiarativa) |
| Modalità di erogazione | Value object (presenza / remoto / entrambe) | Inclusa |
| Area di disponibilità | Owned dichiarativo dell’AR | Inclusa |
| Lingua di erogazione / coppia linguistica | Owned o associazione verso catalogo lingue | Inclusa dove pertinente |
| Settore servito | Associazione facoltativa a tassonomia settori | Facoltativa ciclo 1 |
| Fascia economica | Value object | Inclusa |
| Disponibilità dell’offerta | Asse/value object sull’AR (non calendario) | Inclusa |
| Pubblicazione / visibilità | Assi sull’AR | Inclusa |
| Riferimento a ServizioProfessionale | Associazione facoltativa outbound | Facoltativa |
| Riferimento a ServizioImpresa | Associazione facoltativa outbound | Facoltativa |
| ManifestazioneDiInteresse / candidatura a servizio | Associazione/processo | **Rinviata** |
| QualificaDichiarata (PDS §14) | — | **Fuori**: responsabilità Professionisti (e analoghi Imprese) |
| Accreditamento / FEV Servizi | Evidenza/verifica | **Rinviata** |
| Recensione / valutazione | — | **Fuori** (reputazione futura) |
| Prenotazione / Sessione / Calendario | — | **Fuori** → Eventi / futuro |
| Allegato / Storage | — | **Rinviata** |
| Proiezione di matching domanda/offerta | Dato derivato | **Fuori** ciclo 1 |

---

## 8. Ownership

**Principio.** Ogni OffertaDiServizio e ogni RichiestaDiServizio ha **un solo titolare** (Persona **oppure** Impresa). La scheda è owned dal dominio Servizi; i soggetti sono referenziati, non incorporati.

| Fatto | Owner |
|---|---|
| Scheda Offerta / Richiesta, stati, testo, classificazione, condizioni dichiarative | **Servizi** |
| Identità Persona | Persone |
| Identità Impresa, ServizioImpresa | Imprese |
| Profilo, ServizioProfessionale, FEV profilo | Professionisti |
| Appartenenza / rappresentanza | Appartenenze (utilizzo da Servizi) |
| Mercato internazionale | Mercati Internazionali |
| Opportunità / candidatura opportunità | Opportunità |
| Evento / sessione / iscrizione | Eventi |
| Articolo / guida | Contenuti editoriali |
| Permessi di scrittura | Identità & Accessi (futuro) |

**Ownership dei servizi pubblicati.** L’Offerta pubblicata è della Persona o Impresa titolare della scheda. Un Professionista non “possiede” l’Offerta in quanto Professionista: la Persona sottostante (o l’Impresa) è titolare; il Profilo può essere referenziato come erogatore qualificato.

---

## 9. OffertaDiServizio

**Responsabilità.** Rendere disponibile, pubblicabile e ricercabile un servizio concreto con attributi sufficienti al confronto, senza costituire impegno contrattuale né canale di pagamento.

**Dati obbligatori (concettuali).** Titolare; titolo; descrizione; categoria verticale; stato redazionale/di pubblicazione secondo assi (§13).

**Dati opzionali.** Natura; modalità di erogazione; area di disponibilità; lingue/coppie; settori; fascia economica; flag “su richiesta”; destinatari potenziali; riferimento a ServizioProfessionale; riferimento a ServizioImpresa; Mercato; note; collegamento contestuale a Opportunità/Evento.

**Dati vietati sull’Offerta.** Prezzo vincolante di checkout; valuta di regolamento obbligatorio; quantità di magazzino; commissione piattaforma; stato ordine; esito prestazione; badge reputazionale unico; copia delle qualifiche professionali.

**Pubblicabilità.** Un’Offerta esiste già in bozza; la pubblicazione è un asse distinto (§14).

---

## 10. RichiestaDiServizio

**Responsabilità.** Rendere visibile un bisogno di servizio, indipendente da chi potrà rispondervi, con attributi propri per categoria.

**Simmetrie con l’Offerta.** Stessa idea di scheda strutturata, stesso titolare Persona/Impresa, stessa categoria verticale, stesso divieto di marketplace.

**Differenze.** Direzione domanda; stati orientati a valutazione/conclusione/scadenza; assenza di “erogatore” obbligatorio; condizioni economiche tipicamente come vincolo dichiarato del richiedente (opzionale), non come offerta di prezzo.

**Incontro domanda/offerta (ciclo 1).** Consentito solo come **contatto umano / interesse dichiarato futuro**, non come motore di matching, ranking commerciale o assegnazione automatica. Nessun ordine.

**Decisione di questo Logical.** La PDS che riusa ManifestazioneDiInteresse di Opportunità **non** viene adottata come obbligo: Servizi potrà, in un ciclo successivo, definire un meccanismo proprio di “interesse/risposta” oppure riusare un pattern analogo **senza** condividere l’entità di Opportunità.

---

## 11. Erogatori e destinatari

**Chi può offrire.** Persona e/o Impresa come **titolare** dell’Offerta. L’erogatore dichiarato può essere:
- la stessa Persona;
- un Profilo professionale (qualificazione della Persona);
- un’Impresa;
- in casi misti, Impresa titolare con erogatore Persona/Professionista referenziato.

**Chi può richiedere.** Persona o Impresa come titolare della Richiesta.

**Destinatari potenziali.** Criteri dichiarativi (rivolto a Persone, Imprese, entrambi, pubblico specifico descrittivo). Non elenco clienti.

**Organizzazione.** Finché Organizzazioni non è formalizzato, enti esterni restano **riferimento informativo** (nome/testo), non FK obbligatoria a soggetto inesistente (§22).

---

## 12. Tipologie e specializzazioni

**Decisione di questo Logical.** Le tipologie PDS (linguistico, formativo, professionale generico, finanziario, immobiliare) e eventuali “supporto/altro” sono **categorie verticali di classificazione** all’interno di un **unico dominio Servizi**, non sotto-domini autonomi nel ciclo 1.

| Tipologia | Trattamento ciclo 1 | Nota di confine |
|---|---|---|
| Linguistico / interculturale | Categoria + attributi dichiarativi (tipo servizio, coppia lingue, direzione, specializzazioni tematiche testuali) | Accessorio/trasversale (decisione 24); ≠ portale traduzione |
| Formativo | Categoria + attributi dichiarativi minimi | Dimensione temporale corso/webinar → Eventi; esiti didattici → Formazione futura |
| Professionale generico | Categoria + riferimento facoltativo a ServizioProfessionale / categoria professionale | Non duplica catalogo Professionisti |
| Finanziario | Categoria + attributi dichiarativi | ≠ prodotto bancario come Opportunità; ≠ pagamento in piattaforma |
| Immobiliare | Categoria + attributi dichiarativi minimi | Immobile come entità → dominio Immobiliare futuro; qui solo offerta/richiesta di servizio/annuncio leggero dichiarato |
| Supporto / altro | Categoria residuale | Evitare dumping di concetti non servizi |

**Specializzazioni profonde** (listini formativi completi, scheda immobile ricca, prodotti finanziari strutturati) restano **verticali futuri** o domini dedicati (Formazione, Immobiliare), referenziabili senza essere assorbite ora.

---

## 13. Lifecycle e stati

**Principio.** Esistenza, pubblicazione, disponibilità dichiarata e archiviazione restano **assi distinti** (decisione vincolante 15). Non si comprime tutto in un unico enum “Bozza/Attiva/…”.

### 13.1 OffertaDiServizio — assi

**a) Stato redazionale / esistenza**
- *Bozza* — scheda in preparazione; esiste già come Offerta.
- *Pronta* — completa nei dati minimi per poter essere pubblicata (opzionale come stato esplicito; può coincidere con “non bozza”).

**b) Stato di pubblicazione**
- *Non pubblicata*
- *Pubblicata*
- *Ritirata* (non più nei percorsi pubblici; scheda conservata)

**c) Disponibilità dichiarata dell’offerta** (≠ calendario)
- *Disponibile*
- *In pausa* (temporaneamente non offerta)
- *Non più disponibile*

**d) Archiviazione**
- *Corrente* / *Archiviata* (fuori dai percorsi correnti, storica)

**Relazione con lo sketch PDS (Bozza → Attiva → In pausa → Archiviata).** I significati PDS sono **ricondotti** agli assi sopra: “Attiva” ≈ Pubblicata + Disponibile; “In pausa” è sull’asse disponibilità; “Archiviata” sull’asse archiviazione. Non si importa un unico stato PDS come contratto.

### 13.2 RichiestaDiServizio — assi

**a) Redazione/pubblicazione:** Bozza / Pubblicata / Ritirata
**b) Percorso sostanziale dichiarato:** Aperta / In valutazione / Conclusa (con o senza fornitore individuato fuori piattaforma) / Scaduta
**c) Archiviazione:** Corrente / Archiviata

Nessuna “Assegnata” vincolante di piattaforma nel ciclo 1 (evita marketplace).

### 13.3 Moderazione

Eventuale sospensione per moderazione è un fatto di processo **rinviato** a governance/Identità & Accessi; il dominio può prevedere un asse futuro “Contestata/Sospesa da moderazione” senza definirlo operativamente ora.

---

## 14. Pubblicazione e visibilità

- Ogni Offerta/Richiesta **può** essere pubblicabile; la bozza **è già** un’entità del dominio.
- **Esistenza ≠ pubblicazione ≠ visibilità** (assi distinti).
- Visibilità tipica ciclo 1: bozza solo titolare (e chi agisce per rappresentanza); pubblicata consultabile pubblicamente nei limiti dei campi pubblici; dettagli economici secondo regole della fascia (§15).
- Data di pubblicazione / ritiro: metadati concettuali ammessi.
- Chi controlla la pubblicazione: il titolare (Persona o Impresa tramite rappresentanza). Permessi tecnici → Identità & Accessi.
- Moderazione redazionale di piattaforma: rinviata.

---

## 15. Prezzi e condizioni economiche

**Ammesso nel ciclo 1 (descrittivo):**
- gratuito;
- agevolato (dichiarativo);
- su richiesta / preventivo fuori piattaforma;
- fascia economica indicativa (range descrittivo o etichetta);
- note economiche testuali.

**Non ammesso nel ciclo 1:**
- prezzo fisso vincolante di vendita;
- tariffa oraria come listino eseguibile;
- valuta di regolamento obbligatoria;
- transazione, pagamento, ordine, checkout, commissione, fatturazione;
- marketplace.

**Distinzioni.** Fascia economica = informazione descrittiva. Listino strutturato = estensione futura (PDS). Transazione/pagamento = fuori dominio (e tipicamente fuori piattaforma nel modello attuale).

---

## 16. Territori

| Concetto | Owner / trattamento |
|---|---|
| Area di disponibilità dell’Offerta | **Owned dichiarativa** dell’Offerta (ciclo 1: testo e/o riferimenti leggeri; non catalogo Territori obbligatorio) |
| Area della Richiesta | Owned dichiarativa della Richiesta |
| Territorio di esercizio del Professionista | Professionisti (M5) — **non duplicato** |
| Territorio servito ServizioImpresa | Imprese — **non duplicato** |
| Modalità presenza / remoto | Sull’Offerta (e/o Richiesta), indipendente dalla copertura profilo |
| Luogo puntuale di una sessione | Eventi |

**Principio.** La copertura dell’offerta **appartiene all’offerta**. Non si copia automaticamente la copertura M5 Professionisti né le sedi Impresa. Un riferimento “allineato al profilo” può essere suggerito in UX futura, non è invariante di dominio.

---

## 17. Lingue

| Concetto | Trattamento |
|---|---|
| Lingua della scheda (testo) | Metadato descrittivo; multilingua editoriale pieno → Contenuti se narrativo |
| Lingua di erogazione | Owned/associazione Offerta → catalogo lingue (quando strutturata) |
| Coppia linguistica / direzione | Owned dall’Offerta (categoria linguistica) |
| Lingua richiesta | Owned dalla Richiesta |
| LinguaParlata Persona | Persone — riferimento concettuale, non copia |
| Lingue operative professionali | Professionisti — non duplicate sull’Offerta per default |
| LinguaOperativaImpresa | Imprese — non duplicate; ServizioImpresa può già riferirle |
| `language_service_*` / `profile_language_services` | DV4 — **non assorbite** (§26) |

---

## 18. Disponibilità

| Concetto | Dove vive |
|---|---|
| Disponibilità generale del Professionista | Professionisti §9 |
| Disponibilità dichiarata dell’Offerta (disponibile / in pausa / non più) | **Servizi** sull’Offerta |
| Calendario, fasce orarie, sessioni, prenotazioni slot | **Eventi** (o fuori perimetro) |
| Capacità/carico | Non modellata come entità; al più nota dichiarativa |
| Sospensione temporanea offerta | Asse disponibilità Offerta |

---

## 19. Relazioni con Professionisti

| Concetto | Dominio | Relazione |
|---|---|---|
| `professional_services` / ServizioProfessionale | Professionisti | Dichiarazione descrittiva sul Profilo |
| OffertaDiServizio | Servizi | Oggetto autonomo pubblicabile |
| Collegamento | Facoltativo | Offerta **può** referenziare un ServizioProfessionale di origine; **nessuna** dipendenza obbligatoria; **nessuna** sincronizzazione automatica dei campi |
| Categorie / competenze / copertura M4–M5 | Professionisti | Restano lì; Offerta non le duplica |
| Erogatore professionista | Riferimento | Offerta può indicare Profilo come erogatore |

**Divieto.** Duplicare tabelle/concetti M4–M5 Professionisti (nature, servizi dichiarati, territori/lingue/mercati/settori di profilo) come owned Servizi.

**Risposta alla domanda aperta Professionisti §15.** Evitare duplicazioni quando un ServizioProfessionale “diventa” Offerta: si crea un’**Offerta nuova** con eventuale riferimento all’origine; i due fatti restano distinti; aggiornamenti non si propagano automaticamente.

---

## 20. Relazioni con Imprese

| Concetto | Dominio | Relazione |
|---|---|---|
| `business_services` / ServizioImpresa | Imprese | Owned Imprese; scheda impresa |
| OffertaDiServizio a titolarità Impresa | Servizi | Offerta pubblicabile autonoma |
| Impresa come erogatore | Riferimento | Ammesso |
| Impresa come destinatario potenziale | Criterio | Ammesso |
| Collegamento ServizioImpresa → Offerta | Facoltativo | Come per Professionisti |

**Divieto.** Duplicare anagrafica Impresa, sedi, canali, capacità già in ServizioImpresa.

---

## 21. Relazioni con Opportunità

| | Servizi | Opportunità |
|---|---|---|
| Natura | Offerta/bisogno di prestazione di servizio | Possibilità azionabile condizionata (beneficio/accesso) |
| Esempi tipici | Traduzione, consulenza, corso come servizio offerto | Bando, contributo, misura, call |
| Richiesta | RichiestaDiServizio | Candidatura / interesse a opportunità |
| Finanziamento | Non è il focus; al più categoria finanziaria come servizio commerciale dichiarato | Beneficio/finanziamento agevolato strutturato |

**Collegamento ammesso.** Riferimento facoltativo Offerta/Richiesta ↔ Opportunità come contesto (es. servizio di accompagnamento a un bando), senza ownership né trasformazione automatica.

**ManifestazioneDiInteresse.** Resta responsabilità/pattern di Opportunità (e storia PDS); non è entità ciclo 1 di Servizi (§10).

---

## 22. Relazioni con Organizzazioni

Organizzazioni è dominio **successivo** e non formalizzato.

- Nessuna dipendenza obbligatoria verso oggetti inesistenti.
- Ruoli possibili futuri (erogatore, sponsor, accreditatore, proprietario istituzionale) restano **rinviate**.
- Nel ciclo 1: solo riferimento informativo testuale a ente esterno, se necessario.
- Nessuna ownership ambigua: titolare ciclo 1 = Persona o Impresa.

---

## 23. Relazioni con Eventi

| Appartiene a Eventi | Può essere solo referenziato da Servizi |
|---|---|
| Appuntamenti, sessioni, edizioni, calendari | Offerta formativa/linguistica come “cosa si offre” |
| Webinar/corso come accadimento temporale | — |
| Iscrizioni, capienze, biglietti | — |
| Prenotazioni temporali di slot | — |

Un’OffertaFormativa **non** è un Evento. Un Corso può esistere come Evento per la logistica e, separatamente, come Offerta se si pubblica la disponibilità strutturata del servizio formativo. Nessuna incorporazione reciproca obbligatoria nel ciclo 1.

---

## 24. Relazioni con Contenuti

| In Servizi | In Contenuti editoriali |
|---|---|
| Descrizione sostanziale dell’offerta/richiesta (campi della scheda) | Articoli, guide, pagine, newsletter che parlano del servizio |
| — | Traduzioni editoriali di narrazioni |

Il dominio Servizi **non** gestisce il CMS. Un Contenuto può referenziare un’Offerta senza modificarla (decisione vincolante 9/18).

---

## 25. Relazioni con Identità & Accessi

**Non introdotto qui:** utenti, ruoli applicativi, account, permessi, moderatori, policy RLS, ownership auth, workflow di autorizzazione.

**Rinviato concettualmente:** chi può creare/modificare/pubblicare schede per conto di un’Impresa (oltre al titolo di Appartenenza); moderazione staff; enforcement tecnico della visibilità.

---

## 26. DV4 e strutture esistenti

| Struttura | Dominio/stato attuale | Relazione con Servizi | Decisione |
|---|---|---|---|
| `professional_services` | Professionisti (ciclo 1 chiuso) | Possibile riferimento facoltativo da Offerta | **Riferimento**; non assorbimento |
| `business_services` | Imprese (ciclo 1) | Possibile riferimento facoltativo da Offerta | **Riferimento**; non assorbimento |
| `professional_service_natures` | Professionisti | Non è catalogo Offerta | **Esclusione** (riuso solo se esplicita decisione Physical futura di mapping concettuale, non copia) |
| `language_service_types` / `language_service_specializations` | Pre-metodologia / **DV4** | Tematicamente affini alla categoria linguistica | **Riconciliazione rinviata** — non assorbire nel ciclo 1 Logical come owned |
| `profile_language_services` (+ specializations) | DV4 / legacy su profilo | Sovrappone rischiamente ServizioProfessionale + Offerta | **Esclusione** dal perimetro ciclo 1; migrazione/riconciliazione futura |
| `training_*` | DV4 / confine Formazione–Eventi–Servizi | Non owned Servizi senza Logical Formazione | **Esclusione**; riconciliazione rinviata |

**Principio DV4.** L’esistenza di migration storiche **non** conferisce ownership al dominio Servizi. Nessuna tabella DV4 è parte del modello logico ciclo 1.

---

## 27. FEV, accreditamenti e recensioni

**Ciclo 1:** non include fonti/evidenze/verifiche proprie del dominio Servizi; non importa il FEV Professionisti; non include accreditamenti, recensioni, valutazioni, attestazioni di qualità della prestazione.

**Rinvio.** Un eventuale FEV sull’autenticità della scheda Offerta (non sulla qualità della prestazione) potrà essere introdotto in un ciclo successivo come pattern **locale** (decisione vincolante 12), distinto da Professionisti.

**QualificaDichiarata (PDS §14).** Non riproposta in Servizi: le qualifiche professionali restano di Professionisti; eventuali certificazioni Impresa restano di Imprese.

---

## 28. Documenti e allegati

Ciclo 1: **nessun** possesso di allegati/Storage. Ammissibile solo riferimento informativo (link esterno dichiarativo) come value object testuale. Media editoriali → Contenuti. Documenti probatori → rinvio (con eventuale FEV futuro).

---

## 29. Invarianti

1. Ogni OffertaDiServizio ha esattamente un titolare Persona **oppure** Impresa.
2. Ogni RichiestaDiServizio ha esattamente un titolare Persona **oppure** Impresa.
3. Offerta ≠ ServizioProfessionale ≠ ServizioImpresa ≠ Offerta (Collaborazioni) ≠ Opportunità ≠ Evento ≠ Contenuto.
4. Un’Offerta pubblicabile richiede titolo, descrizione e categoria verticale.
5. Esistenza, pubblicazione, disponibilità dichiarata e archiviazione non si comprimono in un unico stato.
6. La fascia economica, se presente, è descrittiva e non costituisce impegno di vendita.
7. Nessuna Offerta/Richiesta introduce ordini, pagamenti o prenotazioni.
8. I riferimenti a Professionisti/Imprese/Opportunità/Mercati sono opachi e non trasferiscono ownership.
9. La copertura territoriale/linguistica dell’Offerta non sostituisce né cancella quella di Professionisti/Imprese.
10. Servizi linguistici restano accessori e trasversali, non fine della piattaforma.
11. Nessuna dipendenza obbligatoria verso Organizzazioni non formalizzate.
12. Nessun assorbimento automatico di strutture DV4.
13. Qualifica professionale verificata (Professionisti) non è possesso di Servizi e non garantisce qualità della prestazione.
14. Una Richiesta non è un’Opportunità anche se descrive un bisogno.
15. Un corso/webinar temporale non è un’Offerta per il solo fatto di avere una data.

---

## 30. Dati derivati

- Compatibilità indicativa domanda/offerta (futuro) — non verità owned.
- Suggerimento “pubblica un’Offerta dal ServizioProfessionale” — processo UX, non entità.
- Conteggi Osservatorio / indici di ricerca — fuori ownership Servizi.

---

## 31. Dati vietati

- Marketplace, carrello, ordine, pagamento, commissione, fatturazione.
- Prenotazione slot, calendario owned, capienza.
- Recensioni/score unici di reputazione.
- Copia di FEV/qualifiche Professionisti o anagrafica Impresa.
- Soggetto Organizzazione come titolare obbligatorio prima del dominio Organizzazioni.
- Policy RLS / ruoli applicativi.
- Assorbimento DV4 come verità di dominio.
- JSONB/campi generici “payload” come sostituto di modellazione (vincolo per il futuro Physical: vietato eludere il modello).

---

## 32. Perimetro ciclo 1

**Obiettivo minimo.** Consentire a Persona/Impresa di creare e pubblicare **OfferteDiServizio** strutturate, classificabili e ricercabili, con condizioni economiche e di copertura **dichiarative**, e di modellare **RichiestaDiServizio** come seconda AR dello stesso dominio (anche se le unità fisiche dell’Offerta possono precedere quelle della Richiesta).

**Incluse (logico ciclo 1).**
- OffertaDiServizio (AR)
- RichiestaDiServizio (AR)
- Categoria verticale
- Natura/modalità/destinatari (dichiarativi)
- Area di disponibilità e lingue di erogazione (owned dall’AR)
- Fascia economica indicativa / gratuito / su richiesta
- Assi redazione, pubblicazione, disponibilità, archiviazione
- Riferimenti opachi a Persona, Impresa; riferimenti facoltativi a Profilo/ServizioProfessionale e ServizioImpresa
- Riferimento facoltativo a Mercato / settore

**Escluse dal ciclo 1.**
- ManifestazioneDiInteresse / candidatura / matching
- FEV, accreditamenti, recensioni
- Allegati/Storage
- Specializzazioni verticali profonde (Immobiliare ricco, Formazione didattica, prodotti finanziari strutturati)
- Calendario/sessioni/prenotazioni
- Organizzazioni come soggetti
- Identità & Accessi
- Assorbimento DV4
- Marketplace e pagamenti

**Dipendenze ammesse per il futuro Physical.** Persone, Imprese, (facoltativo) Professionisti, (facoltativo) Mercati Internazionali, cataloghi lingue/settori esistenti; Appartenenze solo come utilizzo di rappresentanza a livello applicativo futuro.

**Criteri di completamento del Logical.** Questo documento chiude le decisioni semantiche necessarie al Physical del ciclo 1 (§38–§39).

---

## 33. Fuori perimetro (sintesi)

Marketplace; pagamenti; contratti; prestazione eseguita; Eventi; Contenuti CMS; Organizzazioni; Identità & Accessi; Formazione come dominio didattico; Immobiliare come dominio dell’immobile; Reputazione; DV4 legacy; FEV Servizi; recensioni.

---

## 34. Dipendenze

| Direzione | Dipendenza | Natura |
|---|---|---|
| Servizi → Persone | Titolare / erogatore Persona | Necessaria quando titolare=Persona |
| Servizi → Imprese | Titolare / erogatore Impresa | Necessaria quando titolare=Impresa |
| Servizi → Appartenenze | Rappresentanza | Utilizzo futuro (non ownership) |
| Servizi → Professionisti | Profilo / ServizioProfessionale | Facoltativa |
| Servizi → Mercati Internazionali | Contesto | Facoltativa |
| Servizi → Opportunità | Contesto | Facoltativa |
| Servizi → Eventi / Contenuti / Organizzazioni | Contesto | Rinviate / facoltative future |
| Altri → Servizi | Ricerca, Notifiche, Osservatorio, Contenuti | Consumo senza ownership |

Nessun ciclo di dipendenza nuovo introdotto verso domini non chiusi.

---

## 35. Eventi di dominio

Fatti accaduti (non audit SQL):

- **OffertaDiServizioCreata** (anche in bozza)
- **OffertaDiServizioPubblicata**
- **OffertaDiServizioAggiornata**
- **OffertaDiServizioInPausa** / **OffertaDiServizioRiattivata**
- **OffertaDiServizioRitirata** / **OffertaDiServizioArchiviata**
- **RichiestaDiServizioCreata**
- **RichiestaDiServizioPubblicata**
- **RichiestaDiServizioAggiornata**
- **RichiestaDiServizioConclusa** / **RichiestaDiServizioScaduta** / **RichiestaDiServizioArchiviata**

Eventi di candidatura/interesse: **rinviato** (ciclo successivo).

Altri domini (Notifiche, Ricerca, Osservatorio) possono reagire senza che Servizi gestisca le reazioni.

---

## 36. Questioni risolte

1. Servizi è dominio autonomo dedicato alle schede strutturate Offerta/Richiesta.
2. Aggregate root: **OffertaDiServizio** e **RichiestaDiServizio** (opzione B).
3. Dichiarare ≠ pubblicare: ServizioProfessionale/ServizioImpresa ≠ OffertaDiServizio.
4. Titolare ciclo 1: Persona o Impresa.
5. Tipologie verticali = categorie, non sotto-domini ciclo 1.
6. PDS non è contratto: stati multi-asse; ManifestazioneDiInteresse non obbligatoria.
7. QualificaDichiarata PDS non è owned Servizi.
8. DV4 non assorbite.
9. Prezzi solo descrittivi; marketplace escluso.
10. Territori/lingue dell’offerta owned dall’offerta, senza duplicare M5 Professionisti.
11. Calendario/sessioni → Eventi.
12. Descrizione scheda ≠ Contenuto editoriale.
13. Organizzazioni e Identità non anticipate.
14. FEV/recensioni rinviati.
15. Ciclo 1 = Offerta (+ Richiesta come AR) senza matching.

---

## 37. Decisioni rinviate

- Forma esatta del collegamento fisico Offerta ↔ ServizioProfessionale / ServizioImpresa (solo riferimento; cardinalità 0..1 vs 0..N).
- Ordine delle unità fisiche Offerta vs Richiesta all’interno del ciclo 1.
- Meccanismo di interesse/risposta (entità propria vs pattern analogo a Opportunità).
- Catalogo Territori condiviso vs area solo dichiarativa a medio termine.
- Profondità attributi per verticale finanziario/immobiliare/formativo.
- Sotto-domini futuri vs dominio unico (domanda già in Professionisti §15 / domain-model §14).
- Riconciliazione DV4 (`language_service_*`, `training_*`).
- FEV locale sull’Offerta; allegati; moderazione operativa.
- Formazione e Immobiliare come domini dedicati.
- Ruolo delle Organizzazioni (accredito, sponsor, erogatore istituzionale).

Queste rinviate **non** bloccano il Physical del nucleo Offerta/Richiesta dichiarato al §32.

---

## 38. Criteri per il futuro Physical

Il Physical dovrà:
1. Partire da questo Logical senza reinventare AR o ownership.
2. Mappare OffertaDiServizio (e RichiestaDiServizio) come radici distinte.
3. Usare riferimenti opachi a `people`/`profiles` e `businesses` (o equivalenti già esistenti) secondo i contratti reali delle migration chiuse — verificando tipi e PK, senza dedurre dai nomi.
4. Trattare riferimenti a `professional_services` / `business_services` come facoltativi e non duplicativi.
5. Non creare tabelle FEV/recensioni/prenotazioni/pagamenti nel ciclo 1.
6. Non assorbire DV4 senza decisione esplicita di riconciliazione.
7. Non introdurre Organizzazioni o Identità come prerequisiti.
8. Non usare JSONB come sostituto di attributi già individuati qui.
9. Distinguere assi di stato (redazione, pubblicazione, disponibilità, archiviazione).
10. Documentare esplicitamente ogni attributo verticale opzionale come fase/unità.

---

## 39. Criteri di accettazione del Logical

Il documento è accettabile se e solo se:
- l’aggregate root non è ambigua (§6);
- i confini con Professionisti, Imprese, Opportunità, Eventi, Contenuti sono chiusi (§19–§24);
- DV4 e prezzi/marketplace sono espliciti (§15, §26);
- il perimetro ciclo 1 è sufficiente a redigere un Physical senza nuove scelte semantiche sostanziali (§32, §38);
- nessuna decisione SQL è presente;
- le proposte non supportate dalle fonti chiuse sono marcate come decisioni di questo Logical.

---

## 40. Stato finale del documento

**Logical Servizi redatto e sufficiente** per autorizzare la fase successiva di Physical mapping del ciclo 1, nei limiti del perimetro §32 e delle decisioni rinviate §37.

Fine del documento logico. Nessun Physical, Migration Plan o SQL è autorizzato da questo solo file oltre al permesso metodologico di *iniziare* il Physical — che resta incarico separato.
