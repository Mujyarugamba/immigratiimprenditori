# Physical Domain Mapping — Dominio Collaborazioni

## Nota introduttiva di esclusione

Questo documento rappresenta il passaggio tra il modello logico del dominio Collaborazioni e la sua futura rappresentazione fisica. Non crea uno schema di database, non scrive SQL, non crea tabelle, non usa PostgreSQL o Supabase come riferimento progettuale, non indica tipi di dato, non parla di colonne, chiavi, indici, trigger, vincoli tecnici, RLS, API o codice, non descrive endpoint o implementazioni, non anticipa decisioni implementative.

Le eventuali menzioni tecnologiche compaiono esclusivamente in questa nota, in §30 e in §32, per confermarne l'assenza altrove nel testo.

Il documento applica la Domain Thesis (`collaborazioni-domain-thesis.md`), il Logical Data Model revisionato (`logical/collaborazioni.md`), la baseline (`architecture-baseline.md`), il Reference Model (`02-reference-model.md`), le convenzioni (`03-convenzioni-architetturali.md`), gli attributi di qualità (`04-quality-attributes.md`), la Dependency Map (`domain-dependency-map.md`) e i Physical Domain Mapping già approvati (Persone, Imprese, Appartenenze, Mercati Internazionali, Professionisti). Non ridefinisce il significato del dominio: lo traduce in decisioni concettuali di livello fisico.

---

## Indice

1. [Scopo](#1-scopo)
2. [Documenti letti](#2-documenti-letti)
3. [Tesi vincolante del dominio](#3-tesi-vincolante-del-dominio)
4. [Responsabilità del dominio](#4-responsabilità-del-dominio)
5. [Confini del dominio](#5-confini-del-dominio)
6. [Fatti proprietari](#6-fatti-proprietari)
7. [Fatti esclusi](#7-fatti-esclusi)
8. [Decisione sugli Aggregate](#8-decisione-sugli-aggregate)
9. [Aggregate Root](#9-aggregate-root)
10. [Entity](#10-entity)
11. [Value Object](#11-value-object)
12. [Elenchi controllati](#12-elenchi-controllati)
13. [Riferimenti esterni](#13-riferimenti-esterni)
14. [Fase dichiarativa](#14-fase-dichiarativa)
15. [Fase relazionale](#15-fase-relazionale)
16. [Partecipanti e rappresentanza](#16-partecipanti-e-rappresentanza)
17. [Manifestazioni, candidature, inviti e abbinamenti](#17-manifestazioni-candidature-inviti-e-abbinamenti)
18. [Accordo preliminare](#18-accordo-preliminare)
19. [Assi di stato](#19-assi-di-stato)
20. [Transizioni e ciclo di vita](#20-transizioni-e-ciclo-di-vita)
21. [Temporalità e storico](#21-temporalità-e-storico)
22. [Verifiche e contestazioni](#22-verifiche-e-contestazioni)
23. [Visibilità e pubblicazione](#23-visibilità-e-pubblicazione)
24. [Autorizzazioni di business](#24-autorizzazioni-di-business)
25. [Eventi di dominio](#25-eventi-di-dominio)
26. [Dipendenze e cicli](#26-dipendenze-e-cicli)
27. [Invarianti](#27-invarianti)
28. [Applicazione dei Domain Patterns](#28-applicazione-dei-domain-patterns)
29. [Classificazione finale dei concetti](#29-classificazione-finale-dei-concetti)
30. [Questioni aperte](#30-questioni-aperte)
31. [Impatti sulla Dependency Map](#31-impatti-sulla-dependency-map)
32. [Checklist finale](#32-checklist-finale)
33. [Riepilogo conclusivo](#33-riepilogo-conclusivo)

---

## 1. Scopo

**Obiettivo.** Tradurre in decisioni concettuali di Physical Domain Mapping le responsabilità, i fatti, i confini e i cicli di vita già stabiliti dalla Domain Thesis e dal Logical Data Model di Collaborazioni, senza aggiungere significati non previsti e senza perderne alcuno (`01-principi-mapping.md` §2).

**Cosa NON è.** Non è una riscrittura della tesi né del modello logico. Non è uno schema di database. Non introduce contratti, pagamenti, messaggistica, esecuzione operativa o gestione progettuale.

**Cosa decide.** Aggregate Root; Entity dipendenti; Value Object; elenchi controllati; riferimenti esterni opachi; identità; cardinalità; invarianti; assi di stato; temporalità; verifiche; visibilità; pubblicazione; autorizzazioni di business; eventi di dominio; dipendenze e cicli; classificazione finale dei concetti; impatti proposti (non applicati) sulla Dependency Map.

---

## 2. Documenti letti

Letti integralmente per questo mapping:

- `docs/costituzione-piattaforma.md`
- `docs/domain-model.md`
- `docs/platform-data-specification.md`
- `docs/architecture/fundamental/domain-patterns.md`
- `docs/architecture/fundamental/collaborazioni-domain-thesis.md`
- `docs/architecture/physical/domain-dependency-map.md`
- `docs/architecture/logical/persone.md`
- `docs/architecture/logical/imprese.md`
- `docs/architecture/logical/appartenenze.md`
- `docs/architecture/logical/mercati-internazionali.md`
- `docs/architecture/logical/professionisti.md`
- `docs/architecture/logical/opportunita.md`
- `docs/architecture/logical/collaborazioni.md`
- `docs/architecture/physical/01-principi-mapping.md`
- `docs/architecture/physical/02-reference-model.md`
- `docs/architecture/physical/03-convenzioni-architetturali.md`
- `docs/architecture/physical/04-quality-attributes.md`
- `docs/architecture/physical/architecture-baseline.md`
- `docs/architecture/physical/domain-mapping/persone.md`
- `docs/architecture/physical/domain-mapping/imprese.md`
- `docs/architecture/physical/domain-mapping/appartenenze.md`
- `docs/architecture/physical/domain-mapping/mercati-internazionali.md`
- `docs/architecture/physical/domain-mapping/professionisti.md`

I cinque Physical Domain Mapping elencati sono assunti come approvati. La Domain Thesis e il Logical Model revisionato di Collaborazioni sono vincolanti per il significato; questo documento ne decide la traduzione fisica concettuale.

---

## 3. Tesi vincolante del dominio

Collaborazioni è un dominio autonomo (tesi §5, §17; logico §1, §15).

Possiede un **processo collaborativo** che:
1. nasce in una fase dichiarativa unilaterale;
2. può ricevere manifestazioni, candidature o altre forme di interesse;
3. può produrre un abbinamento;
4. può eventualmente evolvere in una relazione collaborativa bilaterale o multilaterale;
5. può concludersi senza mai raggiungere la fase relazionale.

La Collaborazione esiste già nella fase dichiarativa. Non rappresenta esclusivamente una relazione bilaterale. Fase dichiarativa e fase relazionale appartengono allo stesso dominio; la Domain Thesis e il Logical Model mantengono un solo Aggregate Root come scelta provvisoria (tesi §16 punto 2; logico §2). Questo mapping conferma o motiva il superamento di tale scelta al §8.

---

## 4. Responsabilità del dominio

Il dominio Collaborazioni è responsabile, in esclusiva, di:

1. l'esistenza e l'identità della Collaborazione come processo;
2. il ciclo di vita complessivo su assi indipendenti (PF7);
3. l'esigenza o l'offerta/proposta collaborativa iniziale;
4. i partecipanti locali e i loro ruoli locali (PL4);
5. manifestazioni di interesse, candidature collaborative, inviti e abbinamenti;
6. l'eventuale accordo preliminare (non giuridico);
7. la relazione collaborativa attiva come fase del medesimo processo (PF4);
8. temporalità, verifiche proprie, visibilità e pubblicazione della Collaborazione;
9. l'origine storica facoltativa da un'Opportunità (D22);
10. gli eventi di dominio propri (EV01).

---

## 5. Confini del dominio

| Dominio adiacente | Cosa fa Collaborazioni | Cosa NON fa Collaborazioni |
|---|---|---|
| Persone | Referenzia Persona per identità opaca (D19) | Non duplica anagrafica, biografia, contatti, stati |
| Imprese | Referenzia Impresa per identità opaca (D20) | Non duplica sedi, settori, certificazioni, servizi |
| Professionisti | Referenzia facoltativamente Profilo professionale (D21) | Non possiede qualifiche, servizi professionali, verifiche professionali; Professionista non è terzo tipo di partecipante |
| Appartenenze | Utilizza titolo di rappresentanza (D23; R06) | Non crea, modifica, presume o assorbe Appartenenze (V10; DA11) |
| Opportunità | Referenzia origine storica facoltativa (D22) | Non incorpora annuncio, requisiti formali, candidatura a Opportunità, esito binario |
| Mercati Internazionali | Referenzia Mercato facoltativamente | Non crea Presenza, Interesse, Esigenza di internazionalizzazione |
| Eventi | Può referenziare Evento come contesto occasionale | Non gestisce iscrizioni, edizioni, sessioni, capienze |
| Identità & Accessi | Dipendenza di supporto | Non decide autenticazione né permessi tecnici (PF13) |
| Servizi (futuro) | Nessuna anticipazione | Non cataloga offerte di servizio strutturate |
| Organizzazioni istituzionali (futuro) | Solo riferimento informativo esterno | Non introduce schede di enti/associazioni/università |
| Contratti / Pagamenti / Messaggistica | Esclusi | Nessun possesso |

---

## 6. Fatti proprietari

| Fatto | Motivazione |
|---|---|
| Esistenza e identità della Collaborazione | Fatto costitutivo; PF5 (tesi §6) |
| Esigenza e/o Offerta dichiarate | Fatti generativi (Dependency Map §9; logico §2, §4) |
| Partecipanti locali e Ruoli | Locali alla Collaborazione (tesi §9–§10; PL4) |
| Manifestazione, CandidaturaCollaborazione, Invito, Abbinamento | Percorso aperto di incontro (logico §9–§10; tesi §11) |
| Accordo preliminare | Intesa di business, non contratto (logico §1, §8) |
| Fase relazionale attiva e suoi stati | Eventi CollaborazioneAvviata/Conclusa (`domain-model.md` §10) |
| Assi di stato, temporalità, verifiche proprie, visibilità, pubblicazione | Coordinamento del processo (logico §8, §12) |
| Riferimento a Opportunità di origine | D22, possesso del fatto di provenienza, non dell'Opportunità |
| Utilizzo storico del titolo di rappresentanza | Contesto della Collaborazione; proprietà del titolo resta ad Appartenenze |
| Eventi di dominio | Prodotti da Collaborazioni (PC12) |

---

## 7. Fatti esclusi

| Fatto escluso | Proprietario corretto |
|---|---|
| Identità Persona / Impresa | Persone / Imprese |
| Profilo professionale, qualifiche, servizi professionali | Professionisti |
| Relazione strutturale Persona–Impresa, Ruolo organizzativo, Periodo di appartenenza | Appartenenze |
| Annuncio, requisiti formali, candidatura a Opportunità, esito di accesso | Opportunità |
| Mercato, Presenza, Interesse, Esigenza di internazionalizzazione | Mercati Internazionali |
| Evento, edizione, sessione, iscrizione | Eventi |
| Contratti, pagamenti, fatturazione, messaggi, esecuzione operativa, project management | Fuori perimetro / futuri domini |
| Account, credenziali, permessi tecnici | Identità & Accessi |
| Schede di associazioni/enti/università | Organizzazioni istituzionali (non formalizzato) |
| OffertaDiServizio strutturata | Servizi (futuro) |

---

## 8. Decisione sugli Aggregate

### 8.1 Ipotesi confrontate

| Ipotesi | Contenuto |
|---|---|
| **A — Un solo Aggregate Root `Collaborazione`** | Governa fase dichiarativa, partecipanti, manifestazioni, candidature, abbinamenti, eventuale fase relazionale, conclusione |
| **B — Due o più Aggregate Root** | Es. DichiarazioneCollaborativa + RelazioneCollaborativa; oppure Collaborazione + Manifestazione/Candidatura come AR distinti |

### 8.2 Procedura PC1 sui concetti critici

| Concetto | (a) già AR? | (b) referenziabilità esterna individuale? | (c) solo attributi? | (d) alternative? | (e) derivato? | Natura |
|---|---|---|---|---|---|---|
| Collaborazione | Sì (logico §2) | Sì — D35, D43, eventi osservabili | No | No | No | **A01** |
| Esigenza | No | No — altri domini referenziano la Collaborazione | No | No | No | **E02** |
| Offerta | No | No | No | No | No | **E02** |
| PartecipanteCollaborazione | No | No — referenziato tramite Collaborazione | No | No | No | **E02** |
| ManifestazioneInteresse | No | No oggi documentata | No | No | No | **E02** |
| CandidaturaCollaborazione | No | No oggi documentata | No | No | No | **E02** |
| Invito | No | No | No | No | No | **E02** |
| Abbinamento | No | No | No | No | Parzialmente (può essere rilevato) | **E02** (con componente R05) |
| AccordoPreliminare | No | No | No | No | No | **E02** |
| Relazione collaborativa attiva | No | No — è fase dello stesso processo | — | — | — | **Fase / asse S01**, non AR |

### 8.3 Argomenti a favore di A

1. **Identità unica attraverso le fasi.** Gli eventi `CollaborazioneAvviata` e `CollaborazioneConclusa` presuppongono la stessa identità della dichiarazione iniziale (tesi §6; PF5).
2. **Consistenza del processo.** Manifestazione, Candidatura e Abbinamento non hanno senso fuori da una Collaborazione specifica; la loro consistenza è subordinata all'AR.
3. **Cardinalità e referenziabilità.** Contenuti Editoriali e Osservatorio referenziano la Collaborazione, non le singole Manifestazioni (D35, D43).
4. **Rischio di duplicazione.** Due AR (Dichiarazione + Relazione) creerebbero due fatti per lo stesso percorso, in contrasto con "non creare due copie dello stesso fatto".
5. **Allineamento a tesi e logico.** Entrambi mantengono un solo AR; il Physical non deve superarli senza evidenza PC1 (b) positiva.

### 8.4 Argomenti a favore di B (non sufficienti oggi)

1. PF4 si applica solo alla fase relazionale — differenza di natura, non automaticamente di confine Aggregate.
2. Manifestazione/Candidatura potrebbero un giorno richiedere referenziabilità esterna individuale — oggi assente.
3. Aggregate "ampio" — mitigato tenendo Manifestazione/Candidatura/Abbinamento come E02 con cicli propri, senza promuovere AR.

### 8.5 Decisione

**Si conferma l'Ipotesi A: un solo Aggregate Root `Collaborazione` (A01).**

PC2 resta **aperto** (§30): se in futuro Manifestazione o la fase relazionale dimostrassero referenziabilità esterna individuale e consistenza indipendente, la promozione andrebbe motivata in una revisione di questo mapping, non introdotta qui per simmetria.

---

## 9. Aggregate Root

**Collaborazione — unico Aggregate Root (A01).**

| Aspetto | Decisione | Motivazione |
|---|---|---|
| **Identità** | Identità stabile propria, indipendente dai partecipanti e dall'Opportunità di origine (PF5) | La stessa coppia/gruppo può avere più Collaborazioni; l'origine storica non è chiave di identità |
| **Responsabilità** | Consistenza dell'intero processo dichiarativo→relazionale | Tesi §5–§6; logico §2 |
| **Ciclo di vita** | Multi-asse (§19): processo, editoriale, pubblicazione, visibilità, verifica, temporale/operativo, archiviazione | PF7; logico §8 |
| **Composizione** | Contiene E02: Esigenza, Offerta, PartecipanteCollaborazione, Requisito, Preferenza, ManifestazioneInteresse, CandidaturaCollaborazione, Invito, Abbinamento, AccordoPreliminare, Fonte, Evidenza; VO e C03 locali | §10–§12 |
| **Partecipanti** | Almeno un PartecipanteCollaborazione con Ruolo promotore/proponente; in fase relazionale almeno due partecipanti effettivi | §16, §27 |
| **Invarianti** | §27 | — |
| **Riferimenti esterni** | Persona, Impresa, Profilo (fac.), Appartenenza (utilizzo), Opportunità (fac.), Mercato (fac.), Evento (fac.) | §13 |
| **Regole di modifica** | Modifica dichiarazione ammissibile finché non Archiviata; modifiche rilevanti producono eventi e storico (PF8) | logico §14 CollaborazioneModificata |
| **Conclusione** | Possibile senza fase relazionale (Non riuscita, Ritirata, Annullata, Scaduta) o dopo fase attiva (Conclusa) | tesi §11–§12 |
| **Archiviazione** | Stato storico S08 dopo esito terminale; non elimina lo storico | PF8, PF20 |

**Ampiezza dell'Aggregate.** L'AR è ampio ma non eccessivo: le E02 hanno cicli propri; nessun altro dominio deve attraversare i loro dettagli interni. Concetti che restano interni perché privi di autonomia: Esigenza, Offerta, Requisito, Preferenza, Invito, AccordoPreliminare. Concetti che *potrebbero* diventare AR in futuro (non oggi): ManifestazioneInteresse, CandidaturaCollaborazione, e l'eventuale RelazioneCollaborativa separata (PC2, §30).

---

## 10. Entity

| Entity (E02) | Responsabilità | Ciclo di vita proprio | Perché non AR |
|---|---|---|---|
| **Esigenza** | Bisogno dichiarato ("cerco X") | Dichiarata → Aggiornata → Ritirata/Soddisfatta/Scaduta (nel contesto della Collaborazione) | Nessuna referenziabilità esterna individuale; PC3 |
| **Offerta** | Disponibilità dichiarata ("offro X"); forma di proposta di disponibilità | Dichiarata → Aggiornata → Ritirata/Accettata/Scaduta | Idem; ≠ OffertaDiServizio / ServizioProfessionale |
| **PartecipanteCollaborazione** | Legame locale soggetto↔Collaborazione con Ruolo e, se applicabile, utilizzo rappresentanza | Invitato/Interessato/Candidato → Accettato → Attivo → Ritirato/Escluso | Ha senso solo dentro la Collaborazione; riferimenti opachi a Persona/Impresa |
| **RequisitoControparte** | Condizione vincolante sulla controparte | Dichiarato → Rimosso | PC3-like; dipendente |
| **Preferenza** | Condizione non vincolante | Dichiarata → Rimossa | Idem |
| **ManifestazioneInteresse** | Segnale di interesse verso la Collaborazione | Presentata → Ritirata / In valutazione / Accettata / Rifiutata / Scaduta / Esclusa | Nessun bisogno di referenza esterna individuale oggi; R03 |
| **CandidaturaCollaborazione** | Risposta strutturata per essere selezionati come controparte | Presentata → … (stesso spettro della Manifestazione, più contenuto) | Qualificata rispetto alla candidatura di Opportunità (§17) |
| **Invito** | Contatto diretto del promotore verso un soggetto specifico | Emesso → Accettato / Rifiutato / Scaduto / Ritirato | Sostenuto dal logico §9; E02 |
| **Abbinamento** | Rilevamento di possibile corrispondenza | Rilevato → Proposto → Accettato / Rifiutato / Annullato / Superato | Non crea automaticamente relazione; può avere componente derivata (R05) |
| **AccordoPreliminare** | Intesa di massima tra partecipanti | Raggiunto → Superato (da fase attiva) / Ritirato / Contestato | Non contratto; non AR |
| **Fonte** | Provenienza di un'informazione di questo dominio | Pattern V03 locale (PC11) | Non Entity condivisa tra domini |
| **Evidenza** | Sostegno concreto a una verifica propria | Dichiarata → Utilizzata | Analogia Appartenenze |

**Esigenza e Offerta — decisione.** Sono **due Entity distinte** (non un unico VO), forme alternative o componibili di dichiarazione collaborativa: possono coesistere (es. partnership con contributo reciproco), essere mutuamente esclusive in Collaborazioni direzionali, o essere entrambe assenti nella sola "disponibilità a valutare" (logico §4). Non si trasformano l'una nell'altra per automatismo; lo storico conserva ciascuna dichiarazione (PF8). Distinte da: esigenza di internazionalizzazione; OffertaDiServizio; ServizioProfessionale; Opportunità pubblicata; candidatura a Opportunità.

---

## 11. Value Object

| Value Object | Incorporato in | Motivazione |
|---|---|---|
| **OggettoCollaborazione** | Collaborazione | Descrizione di cosa è al centro; senza identità propria |
| **Finalità** | Collaborazione | Perché esiste la Collaborazione |
| **ControparteRicercata** | Collaborazione | Criteri descrittivi della controparte cercata (non soggetto nominato) |
| **DurataPrevista** | Collaborazione | Durata della relazione una volta avviata (T03/T05) |
| **DisponibilitàTemporale** | Collaborazione | Finestra in cui la dichiarazione è ricercabile/aperta (T04) |
| **CondizioneNegoziabile** | Collaborazione / AccordoPreliminare | Termine economico o non, potenzialmente negoziabile |
| **Esito** | Collaborazione | Risultato qualitativo (positivo, negativo, parziale, non comunicato) — asse f del logico |
| **ModalitàContattoConsentita** | Collaborazione / Partecipante | Preferenza locale; non è un contatto né un messaggio |
| **SnapshotTitoloRappresentanza** (minimo) | PartecipanteCollaborazione | Solo se necessario a dimostrare quale titolo era utilizzato in un momento: riferimento all'Appartenenza + etichetta del titolo al tempo t; non duplica Fonte/Evidenza/Periodo di Appartenenze |

---

## 12. Elenchi controllati

| Elenco (C03) | Fonte | Motivazione C03 (non C02) |
|---|---|---|
| **TipologiaCollaborazione** | logico §5 | Catalogo locale ampio; nessun altro dominio lo governa |
| **RuoloPartecipante** | logico §6; tesi §10; PL4 | Catalogo **proprio** di Collaborazioni — mai i Ruoli di Appartenenze |
| **FormaDichiarazione** | logico §4 | Ricerca / Offerta / Partnership / Progetto comune / Disponibilità aperta |
| **TipoFonteCollaborazione** | logico §2, §12 | Pattern locale PC11 |
| **EsitoQualitativo** | logico §8 | Valori chiusi dell'Esito |
| **GradoAbbinamento** | logico §10 | Compatibilità potenziale → Accordo (gradazione) |

Valori minimi di **RuoloPartecipante** (catalogo raffinabile, §30): Promotore/Proponente; Richiedente; Offerente; Destinatario; Interessato; Candidato; Invitato; Partner; Referente; RappresentanteOperativo; OsservatoreAutorizzato. "Professionista di supporto" non è un Ruolo di soggetto terzo: è un Ruolo locale assegnato a un PartecipanteCollaborazione che referenzia una Persona con Profilo professionale facoltativo.

---

## 13. Riferimenti esterni

Tutti opachi: sola identità stabile, mai attributi interni (PF2, PF5).

| Riferimento | Dominio | Natura | Motivazione |
|---|---|---|---|
| Persona | Persone | Necessario (D19), R01/R02 | Promotore o controparte individuale |
| Impresa | Imprese | Necessario (D20), R01/R02 | Promotore o controparte impresa |
| ProfiloProfessionale | Professionisti | Facoltativo (D21), R02 | Qualificazione coinvolta — mai incorporata |
| Appartenenza | Appartenenze | Utilizzo quando applicabile (D23), R06 | Titolo di rappresentanza; non riferimento sostanziale alla struttura |
| Opportunità | Opportunità | Facoltativo (D22), R02 | Origine storica; unidirezionale |
| Mercato | Mercati Internazionali | Facoltativo, R02 | Contesto / obiettivo / criterio — mai nuova Presenza |
| Evento | Eventi | Facoltativo, R02 | Contesto occasionale; non possesso dell'Evento |
| Settore / Territorio / Lingua | Tassonomia condivisa | VO03 | Ambito settoriale/territoriale/linguistico |
| Soggetto esterno non registrato | Nessuno | Riferimento informativo | Senza identità piena; §30 |

---

## 14. Fase dichiarativa

**Definizione.** Fase in cui la Collaborazione esiste con almeno un promotore e una dichiarazione (Esigenza e/o Offerta e/o disponibilità aperta), **anche senza controparte individuata**.

**Contiene almeno:** Esigenza o Offerta (o forma aperta); Finalità; Oggetto; ControparteRicercata (criteri) oppure Destinatario/Invito; Requisiti/Preferenze; DisponibilitàTemporale; apertura o meno alla ricezione di interessi.

**Identità.** Stessa identità A01 della Collaborazione (non un secondo AR).

**PF4.** Non applicabile: non esiste ancora relazione bilaterale piena.

**PF5.** Applicabile: l'identità della dichiarazione non deriva dal solo promotore.

**Può terminare qui:** Ritirata, Annullata, Scaduta, Non riuscita, senza mai attivare lo stato della relazione.

---

## 15. Fase relazionale

**Definizione.** Fase in cui esiste una cooperazione effettiva riconosciuta da almeno due partecipanti effettivi (o pluralità multilaterale), con stato della relazione Avviata/Attiva (o Sospesa).

**Precondizioni (minime, non tutte obbligatorie insieme):**
- almeno due PartecipanteCollaborazione in stato Accettato/Attivo;
- consenso sufficiente (accettazione reciproca e/o AccordoPreliminare);
- ruoli assegnati;
- opzionale: AccordoPreliminare, Abbinamento accettato, obiettivo condiviso, DurataPrevista.

**Accordo preliminare:** non sempre necessario (logico: "incontro diretto nei casi più semplici"). **Abbinamento:** non sufficiente da solo. **Accettazione reciproca:** può essere sufficiente.

**PF4.** Applicabile: la relazione collaborativa effettiva è posseduta da Collaborazioni (A01), non dai partecipanti, non da Appartenenze, non da Opportunità. Identificata dall'identità della Collaborazione in fase relazionale; nasce con CollaborazioneAvviata; termina con Conclusa/Non riuscita/…; storicizzata (PF8).

**Multilateralità.** Una sola identità A01 può avere N partecipanti effettivi (tesi §9; logico §13).

---

## 16. Partecipanti e rappresentanza

### 16.1 PartecipanteCollaborazione (E02)

Modella la partecipazione **locale**. Non è Aggregate separato. Compone:
- riferimento opaco a Persona **oppure** Impresa (soggetto partecipante);
- opzionale: riferimento a ProfiloProfessionale (qualificazione della Persona, non terzo tipo);
- RuoloPartecipante (C03);
- opzionale: PersonaOperante (Persona che agisce) + ImpresaRappresentata + utilizzo Appartenenza / SnapshotTitoloRappresentanza;
- stato locale del partecipante;
- temporalità della partecipazione.

**Professionista.** Non è tipo autonomo di partecipante. È Persona + riferimento facoltativo al Profilo (tesi §9).

**Organizzazioni istituzionali.** Solo riferimento informativo esterno finché il dominio non è formalizzato; nessuna scheda interna.

### 16.2 Rappresentanza

Quando una Persona agisce per un'Impresa:
- soggetto partecipante = Impresa (o entrambi, secondo il caso);
- PersonaOperante = Persona;
- titolo = utilizzo di Appartenenza esistente (D23; DA10);
- Collaborazioni registra l'utilizzo storico nel contesto, senza creare Appartenenza (V10; DA11);
- non verifica autonomamente in parallelo la relazione strutturale: utilizza l'esito autorevole di Appartenenze.

### 16.3 Cardinalità partecipanti

| Regola | Valore |
|---|---|
| Promotori per Collaborazione | ≥ 1 |
| Partecipanti in fase dichiarativa | ≥ 1 (il solo promotore) |
| Partecipanti effettivi in fase relazionale | ≥ 2 |
| Collaborazioni per soggetto | 0..N |
| Profili professionali referenziati | 0..N (facoltativo) |

---

## 17. Manifestazioni, candidature, inviti e abbinamenti

### 17.1 ManifestazioneInteresse (E02)

| Aspetto | Decisione |
|---|---|
| Proprietario | Collaborazioni (dentro A01) |
| Identità | Propria all'interno della Collaborazione; non temporanea obbligatoria oggi (§30) |
| Soggetto | PartecipanteCollaborazione / Persona o Impresa referenziata |
| Ciclo | Presentata → Ritirata / In valutazione / Accettata / Rifiutata / Scaduta / Esclusa |
| Autonomia | Non AR: nessuna referenziabilità esterna individuale documentata |
| Non è | Candidatura a Opportunità; messaggio; partecipazione accettata; abbinamento |

### 17.2 CandidaturaCollaborazione (E02)

**Termine qualificato.** Il fatto proprietario di Collaborazioni è la **CandidaturaCollaborazione**, distinta dalla candidatura/procedura di accesso di Opportunità (`opportunita.md` §7). Stesso vocabolario generico, processi diversi: qui percorso aperto senza requisiti formali obbligatori né esito binario di ammissibilità a un beneficio strutturato.

Differenze: più strutturata della Manifestazione; non è Proposta (che è Offerta/Esigenza del promotore); non è Invito (direzione opposta); non è candidatura a Opportunità.

### 17.3 Invito (E02)

Sostenuto da logico §9. Distinto da Manifestazione (direzione), Candidatura (struttura e iniziativa), Abbinamento (non è matching), messaggistica (non è contenuto di messaggio). Ciclo: Emesso → Accettato/Rifiutato/Scaduto/Ritirato.

### 17.4 Abbinamento (E02)

| Aspetto | Decisione |
|---|---|
| Natura | Entity dipendente; può originarsi da rilevamento (componente R05) o da decisione redazionale/promotore |
| Non è | Consenso bilaterale definitivo; garanzia di successo (PF10); ammissibilità di Opportunità |
| Cardinalità | 0..N per Collaborazione; può coinvolgere due o più soggetti |
| Ciclo | Rilevato/Proposto → Accettato / Rifiutato / Annullato / Superato (da fase relazionale) |
| Effetto | Non crea automaticamente relazione attiva |

### 17.5 Cardinalità interesse/abbinamento

| Regola | Valore |
|---|---|
| Manifestazioni per Collaborazione | 0..N |
| Manifestazioni per soggetto sulla stessa Collaborazione | tipicamente 0..1 attiva (raffinabile §30) |
| CandidatureCollaborazione per Collaborazione | 0..N |
| Inviti per Collaborazione | 0..N |
| Abbinamenti per Collaborazione | 0..N |

---

## 18. Accordo preliminare

| Aspetto | Decisione |
|---|---|
| Natura | **E02** AccordoPreliminare |
| Non è | Contratto; obbligazioni giuridiche; pagamenti; esecuzione; fatturazione |
| Contenuto minimo | Data; partecipanti che aderiscono (riferimenti); sintesi dell'intesa (VO); eventuale Fonte/Evidenza |
| Ciclo | Raggiunto → Superato (fase attiva) / Ritirato / Contestato |
| Necessità | Non obbligatoria per avviare la fase relazionale nei casi semplici |
| Evento | AccordoPreliminareRaggiunto (EV01) |

---

## 19. Assi di stato

Assi rigorosamente separati (PF7). **Contestata, Sospesa, Archiviata non sono valori di Visibilità.**

### 19.1 Stato del processo collaborativo (ricerca / percorso)

Dichiarativo → Aperto all'interesse → Interesse ricevuto → In contatto → In valutazione reciproca → Negoziazione → Accordo preliminare → (poi fase relazionale sugli assi sottostanti) → Concluso percorso senza relazione / Annullato / Scaduto.

Allineato allo "Stato della ricerca" del logico §8b.

### 19.2 Stato della relazione (fase relazionale — S01)

Non applicabile prima dell'impegno concreto. Valori: Avviata; Attiva; Sospesa; Conclusa; Non riuscita; Ritirata; Annullata; (poi Archiviata su S08).

### 19.3 Stato editoriale (S02)

Bozza → Proposta → Segnalata → In valutazione → (pronto per pubblicazione).

### 19.4 Stato di pubblicazione (S04)

Non pubblicato → Programmato → Pubblicato → Ritirato.

### 19.5 Visibilità

Privata; Visibile solo su invito; Visibile a una rete; Visibile a soggetti compatibili; Pubblica; Riservata alla redazione; Anonima verso il pubblico; Con identità rivelata dopo accettazione.

### 19.6 Stato di verifica (S03)

Non verificata; In verifica; Verificata (per aspetto); Non verificabile; Contestata (PCa1 candidata).

### 19.7 Stato temporale/operativo

Non iniziato; Attivo (finestra di ricezione); Sospeso (solo fase relazionale); Concluso; Scaduto; Annullato.

### 19.8 Stato di archiviazione (S08)

Corrente; Archiviato.

### 19.9 Esito (asse qualitativo)

Positivo; Negativo; Parziale; Non comunicato — distinto dallo stato della relazione.

---

## 20. Transizioni e ciclo di vita

| Transizione | Precondizioni | Fatti modificati | Evento | Divieti |
|---|---|---|---|---|
| Creazione | Promotore Persona/Impresa esistente | Collaborazione in Bozza | CollaborazioneCreata | — |
| Completamento dichiarazione | Oggetto + finalità | Editoriale → Proposta | CollaborazioneProposta | — |
| Apertura interessi | Dichiarazione sufficiente | Processo → Aperto | CollaborazioneAperta | Non implica pubblicazione |
| Pubblicazione | Condizioni cumulative (§23) | S04 Pubblicato | CollaborazionePubblicata | Non implica verifica né fase relazionale |
| Manifestazione ricevuta | Aperta (o invito) | Manifestazione Presentata | ManifestazioneInteressePresentata | Non crea relazione |
| Ritiro Manifestazione | Presentata | Ritirata | ManifestazioneInteresseRitirata | — |
| Accettazione/Rifiuto Manifestazione | Presentata | Accettata/Rifiutata | …Accettata/…Rifiutata | Non = accordo |
| Invito emesso | Promotore autorizzato | Invito Emesso | InvitoEmesso | Non = messaggio |
| Invito accettato/rifiutato | Emesso | Accettato/Rifiutato | InvitoAccettato/Rifiutato | — |
| Abbinamento proposto | Criteri disponibili | Abbinamento Proposto | AbbinamentoProposto | Non = consenso |
| Abbinamento accettato/rifiutato | Proposto | Accettato/Rifiutato | … | Non avvia da solo fase relazionale |
| Partecipante aggiunto | Accettazione | Partecipante Accettato | PartecipanteAggiunto | Non crea Appartenenza |
| Fase relazionale avviata | ≥2 partecipanti effettivi + consenso sufficiente | S01 Avviata | CollaborazioneAvviata | Non crea Appartenenza (V10) |
| Accordo preliminare | Parti d'accordo | AccordoPreliminare | AccordoPreliminareRaggiunto | Non = contratto |
| Sospensione / Riattivazione | S01 Attiva / Sospesa | S01 | CollaborazioneSospesa / Riattivata | ≠ archiviazione |
| Conclusione | Fase attiva o percorso | S01 Conclusa + Esito | CollaborazioneConclusa | — |
| Annullamento / Scadenza / Ritiro | Varie fasi | Stati terminali | …Annullata/… / CollaborazioneRitirata | Distinti tra loro |
| Contestazione | Qualunque fase | S03 Contestata | CollaborazioneContestata | ≠ rifiuto/sospensione |
| Archiviazione | Stato terminale | S08 Archiviato | CollaborazioneArchiviata | Non cancella storico |

---

## 21. Temporalità e storico

| Concetto | Pattern | Note |
|---|---|---|
| Creazione | T01 | Istante CollaborazioneCreata |
| Apertura / Decorrenza disponibilità | T03 | Inizio finestra di ricezione |
| Scadenza disponibilità | T04 | Distinta da Annullamento |
| Periodo ricezione interessi | T05 | Intervallo |
| Data Manifestazione / Invito / Abbinamento / Accordo | T01 | Istanti |
| Validità Invito | T04 | Opzionale |
| Inizio fase relazionale | T03 | CollaborazioneAvviata |
| Sospensione / Riattivazione | T05 | Intervalli |
| Conclusione / Annullamento / Cessazione | T01/T05 | Distinti |
| Archiviazione | S08/T07 | Conservazione |
| Storico | PF8, T06/T07 | Nessuna sovrascrittura di fatti rilevanti |

DurataPrevista e DisponibilitàTemporale restano VO distinti (logico §2).

---

## 22. Verifiche e contestazioni

### 22.1 Verifiche — proprietà del fatto

| Aspetto | Chi verifica / produce esito | Collaborazioni |
|---|---|---|
| Identità Persona | Persone | Utilizza esito |
| Identità/esistenza Impresa | Imprese | Utilizza esito |
| Rappresentanza | Appartenenze | Utilizza esito (D23) |
| Qualificazione professionale | Professionisti | Utilizza esito (D21) |
| Esistenza/validità Opportunità di origine | Opportunità | Utilizza esito (D22) |
| Autenticità Manifestazione / coerenza partecipazione / accettazioni / AccordoPreliminare / evidenze proprie | **Collaborazioni** | Verifica propria (V01) |
| Autenticità esigenza/offerta dichiarata | Collaborazioni (propria) | Distinta da verifica dei soggetti |

Nessun badge unico "Collaborazione verificata" (PF10, PF11).

### 22.2 Contestazione (PCa1 — candidata)

Può riguardare: Collaborazione intera; Manifestazione; CandidaturaCollaborazione; Partecipante nel contesto; AccordoPreliminare; Abbinamento; dichiarazione specifica (Esigenza/Offerta).

**Non è:** rifiuto; sospensione; annullamento; errore editoriale; esito negativo di verifica.

Effetti: asse S03 Contestata; eventuale restrizione di presentazione pubblica; nessun procedimento tecnico definito qui. Pattern resta **candidato**.

---

## 23. Visibilità e pubblicazione

### 23.1 Pubblicazione (S04)

Pubblicabile: rappresentazione della Collaborazione (oggetto, finalità, tipologia, criteri di controparte), secondo regole di visibilità.

**Non reso automaticamente pubblico:** elenco partecipanti; contatti; accordo; manifestazioni/candidature; evidenze; dettagli dell'origine da Opportunità oltre al riferimento consentito.

Precondizioni cumulative (PF12, analogia): stato editoriale adeguato; coerenza con visibilità di Persona/Impresa coinvolte; assenza di vincoli di contestazione che vietino la presentazione.

Pubblicazione ≠ verifica ≠ disponibilità ≠ fase relazionale.

### 23.2 Visibilità

Indipendente da processo, verifica, pubblicazione, sospensione, contestazione, archiviazione.

Differenziabile per: Collaborazione; promotore; partecipanti; Manifestazioni; ruoli; modalità di contatto; accordi; evidenze; origine Opportunità.

Ammesse: anonimizzazione; rivelazione identità dopo accettazione; riservatezza redazione; rete; soggetti compatibili; pubblica.

---

## 24. Autorizzazioni di business

Distinte dall'autorizzazione tecnica di Identità & Accessi (PF14).

| Azione | Tipicamente |
|---|---|
| Crea / modifica dichiarazione | Promotore (Persona o rappresentante di Impresa con titolo) |
| Apre/chiude ricezione interessi | Promotore |
| Invita | Promotore |
| Valuta Manifestazioni/Candidature | Promotore |
| Accetta partecipanti | Promotore |
| Propone Abbinamento | Piattaforma/redazione o promotore |
| Accetta Abbinamento | Parti coinvolte |
| Avvia fase relazionale | Parti con consenso sufficiente |
| Sospende / conclude / annulla | Promotore e/o partecipanti secondo natura; redazione per casi di piattaforma |
| Pubblica / ritira pubblicazione | Promotore e/o redazione |

La responsabilità della piattaforma nella fase attiva resta questione aperta di prodotto (`domain-model.md` §14; §30).

---

## 25. Eventi di dominio

Tutti EV01, participio passato, proprietario Collaborazioni (PF15, PC12).

| Evento | Fase | Fatto che cambia |
|---|---|---|
| CollaborazioneCreata | Dichiarativa | Esistenza |
| DichiarazioneCompletata / CollaborazioneProposta | Dichiarativa | Editoriale |
| EsigenzaDichiarata / OffertaDichiarata | Dichiarativa | Esigenza/Offerta |
| CollaborazioneAperta | Dichiarativa | Processo aperto |
| CollaborazionePubblicata | Pubblicazione | S04 |
| ManifestazioneInteressePresentata / Ritirata / Accettata / Rifiutata | Interesse | Manifestazione |
| CandidaturaCollaborazionePresentata / Accettata / Rifiutata | Interesse | CandidaturaCollaborazione |
| InvitoEmesso / Accettato / Rifiutato | Interesse | Invito |
| AbbinamentoProposto / Accettato / Rifiutato / Annullato | Matching | Abbinamento |
| ContattoAutorizzato | Interesse | Autorizzazione contatto (non messaggio) |
| PartecipanteAggiunto / Ritirato | Partecipazione | Partecipante |
| AccordoPreliminareRaggiunto | Pre-relazionale | Accordo |
| CollaborazioneAvviata | Relazionale | S01 Avviata (PF4) |
| CollaborazioneSospesa / Riattivata | Relazionale | S01 |
| CollaborazioneConclusa / NonRiuscita / Ritirata / Annullata / Scaduta | Terminale | Stati terminali |
| CollaborazioneContestata | Trasversale | S03 |
| PubblicazioneRitirata | Pubblicazione | S04 |
| CollaborazioneArchiviata | Storico | S08 |
| VisibilitàCollaborazioneModificata | Visibilità | Visibilità |
| FonteCollaborazioneAggiornata | Verifica | Fonte |

**Eventi vietati in questo dominio:** qualunque evento che modifichi Persona, Impresa, Appartenenza, Opportunità, Profilo, Mercato, Evento pubblico.

---

## 26. Dipendenze e cicli

### 26.1 Dipendenze in uscita

| ID | Destinazione | Natura | Oggetto | Stato proposto |
|---|---|---|---|---|
| D19 | Persone | Necessaria | Identità promotore/destinatario | Confermata Consolidata |
| D20 | Imprese | Necessaria | Identità promotore/destinatario | Confermata Consolidata |
| D21 | Professionisti | Facoltativa | Profilo / qualificazione | Proposta: Consolidata (conferma da questo mapping) |
| D22 | Opportunità | Facoltativa | Origine storica | Proposta: Consolidata; unidirezionale |
| D23 | Appartenenze | Necessaria quando applicabile | Utilizzo titolo rappresentanza | Proposta: Consolidata lato utilizzo |
| — | Mercati Internazionali | Facoltativa | Mercato di riferimento | Segnalata; da censire se assente in matrice |
| — | Eventi | Facoltativa | Contesto | Segnalata; da censire se assente |
| — | Identità & Accessi | Di supporto | Accesso scrittura | Confermata |
| — | Organizzazioni / Servizi | Futura | — | Non anticipata |

### 26.2 Dipendenze in entrata (informative)

D35 Contenuti Editoriali → Collaborazioni (editoriale); D43 Osservatorio → Collaborazioni (derivativa).

### 26.3 Vietate

**V10** confermata: Collaborazioni non assorbe Appartenenze stabili.

### 26.4 Cicli

| Coppia | Esito |
|---|---|
| Opportunità ↔ Collaborazioni | **Nessun ciclo reale** — solo Collaborazioni → Opportunità (D22) |
| Appartenenze ↔ Collaborazioni | Nessun ciclo — utilizzo unidirezionale D23 |
| Professionisti ↔ Collaborazioni | Nessun ciclo — D21 unidirezionale |
| Mercati / Eventi ↔ Collaborazioni | Nessun ciclo se solo riferimenti in uscita da Collaborazioni |

---

## 27. Invarianti

1. Ogni Collaborazione ha identità autonoma (PF5).
2. Ogni Collaborazione ha almeno un promotore valido (Persona o Impresa).
3. Il promotore referenzia un soggetto esistente.
4. La fase dichiarativa può esistere con un solo soggetto.
5. La fase relazionale richiede almeno due partecipanti effettivi.
6. Nessun partecipante duplica Persona o Impresa.
7. Professionista non è tipo autonomo di partecipante.
8. Persona che rappresenta Impresa utilizza titolo da Appartenenze.
9. Riferimento a Opportunità non trasferisce ownership dei fatti dell'Opportunità.
10. Manifestazione ≠ partecipazione automatica.
11. Abbinamento ≠ accordo automatico.
12. Accordo preliminare ≠ contratto.
13. Pubblicazione ≠ verifica.
14. Visibilità ≠ pubblicazione.
15. Sospensione ≠ archiviazione.
16. Contestazione ≠ sospensione.
17. Conclusione ≠ annullamento ≠ scadenza ≠ ritiro.
18. La Collaborazione può concludersi senza fase relazionale.
19. La stessa coppia/gruppo può avere più Collaborazioni.
20. Una Collaborazione multilaterale ha un'unica identità.
21. I fatti storici rilevanti non sono sovrascritti (PF8).
22. Nessuna verifica autorevole altrui è duplicata.
23. Messaggi, pagamenti, contratti, esecuzione non appartengono all'Aggregate.
24. I ruoli locali non modificano i ruoli strutturali (Appartenenze).
25. Nessun evento di Collaborazioni modifica direttamente fatti di altri domini.
26. Esigenza di Collaborazioni ≠ Esigenza di internazionalizzazione.
27. CandidaturaCollaborazione ≠ candidatura a Opportunità.
28. Contestata/Sospesa/Archiviata non sono valori di Visibilità.
29. Una Collaborazione non diventa né presume un'Appartenenza (V10).

---

## 28. Applicazione dei Domain Patterns

| Pattern | Esito | Motivazione |
|---|---|---|
| PF1 | Applicabile, confermato | Single Owner dei fatti §6 |
| PF2 | Applicabile, confermato | Nessuna duplicazione soggetti/relazioni |
| PF3 | Applicabile | Ogni scelta riconducibile a logico/tesi |
| PF4 | **Solo fase relazionale** | Tesi §14; §15 di questo mapping |
| PF5 | Applicabile (processo + fase relazionale) | Identità indipendente dai partecipanti |
| PF6 | Applicabile | Identità business ≠ accesso |
| PF7 | Applicabile, confermato | Assi §19 separati |
| PF8 | Applicabile | Storico default |
| PF9 | Applicabile | Cronologia ≠ audit tecnico |
| PF10 | Applicabile | Nessun badge unico |
| PF11 | Applicabile | Verifiche non fuse |
| PF12 | Applicabile | Condizioni cumulative pubblicazione |
| PF13 | Applicabile | IA applica, non decide |
| PF14 | Applicabile | Ruoli business ≠ privilegi |
| PF15 | Applicabile | Eventi = fatti avvenuti |
| PF16 | Applicabile | Nessuna propagazione tecnica descritta |
| PF17 | Applicabile | Classi di dipendenza §26 |
| PF18 | Applicabile | Cicli apparenti eliminati |
| PF19 | Applicabile | Elenchi C03 locali; riuso VO03 |
| PF20 | Applicabile | Indisponibilità soggetto ≠ cancellazione storico |
| PL4 | Applicabile, confermato | Catalogo Ruoli proprio |
| PC1 | Applicato | §8 |
| PC2 | **Candidato / rinviato** | Un solo AR oggi; apertura futura §30 |
| PC3 | Applicabile | Esigenza/Offerta/Requisito |
| PC5/PC6 | Applicati | Autonomia dominio; esclusione contatti informali |
| PC7 | Applicabile | Terminali non presentati come attuali |
| PC9 | Applicabile | Temporalità dichiarata |
| PC10 | Applicabile | Intervalli aperti/chiusi |
| PC11 | Applicabile | Fonte locale |
| PC12 | Applicabile | Ownership eventi |
| PC13 | Applicabile | Derivazioni Osservatorio |
| PC14 / PP1 | Applicabile | C03 locali |
| PCa1 | **Candidato** | Contestazione §22 |
| PCa4 | Confermato per fase relazionale | Estensione PF4 |

---

## 29. Classificazione finale dei concetti

| Concetto | Classificazione |
|---|---|
| Collaborazione | **Aggregate Root (A01)** |
| Esigenza | **Entity (E02)** |
| Offerta / Proposta di disponibilità | **Entity (E02)** |
| PartecipanteCollaborazione | **Entity (E02)** |
| RuoloPartecipante | **Elenco controllato (C03)** + attributo del Partecipante |
| ManifestazioneInteresse | **Entity (E02)** |
| CandidaturaCollaborazione | **Entity (E02)** |
| Invito | **Entity (E02)** |
| Abbinamento | **Entity (E02)** (+ componente derivata R05 possibile) |
| AccordoPreliminare | **Entity (E02)** |
| Relazione collaborativa attiva | **Fase / asse di stato** dello stesso A01 (non Entity separata) |
| Opportunità di origine | **Riferimento esterno (R02)** |
| Persona / Impresa | **Riferimento esterno** |
| Profilo professionale | **Riferimento esterno facoltativo** |
| Appartenenza utilizzata | **Utilizzo (R06)** + eventuale snapshot VO minimo |
| Mercato | **Riferimento esterno facoltativo** |
| Evento pubblico | **Riferimento esterno facoltativo** |
| Periodo (Durata / Disponibilità) | **Value Object (VO01)** |
| Fonte | **V03 locale** (pattern, non Entity condivisa) |
| Evidenza | **Entity (E02)** |
| Stati / Visibilità / Pubblicazione | **Assi di stato**, non Entity |
| Contestazione | **Stato di verifica (PCa1 candidata)** |
| TipologiaCollaborazione | **Elenco controllato (C03)** |
| ControparteRicercata, Oggetto, Esito, Condizione | **Value Object (VO01)** |
| Contratto, pagamento, messaggio, esecuzione, Appartenenza, Opportunità, Profilo | **Fatto escluso** |

---

## 30. Questioni aperte

1. Eventuale promozione futura a più Aggregate Root (PC2): Manifestazione, CandidaturaCollaborazione, o Relazione collaborativa separata.
2. Autonomia e referenziabilità esterna di Manifestazione / CandidaturaCollaborazione / Abbinamento.
3. Distinzione operativa raffinata Esigenza vs Offerta/Proposta (anche Dependency Map).
4. Catalogo definitivo dei Ruoli (PL4).
5. Identità temporanea per Manifestazione/Invito/Abbinamento.
6. Responsabilità della piattaforma nella fase relazionale attiva.
7. Consolidamento di Contestato (PCa1).
8. Dominio Servizi e Organizzazioni istituzionali.
9. Documenti contrattuali esterni (solo riferimento futuro, non possesso).
10. Confine con gestione progetti/esecuzione.
11. Regole di matching (criteri automatici).
12. Anonimizzazione operativa dei partecipanti.
13. Validità/scadenza di default delle Manifestazioni.
14. Dettaglio operativo delle collaborazioni multilaterali (ruoli congiunti).
15. Cardinalità "una sola Manifestazione attiva per soggetto" — preferenza, non ancora invariante dura.
16. Dipendenze facoltative verso Mercati Internazionali ed Eventi da formalizzare in Dependency Map.

---

## 31. Impatti sulla Dependency Map

**Non si modifica** `domain-dependency-map.md`. Si propongono:

| Voce | Impatto proposto | Motivazione |
|---|---|---|
| D19, D20 | Conferma Consolidata | Mapping proprietario allineato |
| D21 | Da Provvisoria a **Consolidata** | Riferimento facoltativo Profilo confermato; Professionista non è partecipante autonomo |
| D22 | Da Provvisoria a **Consolidata** | Origine storica unidirezionale confermata; nessun ciclo |
| D23 | Da Provvisoria a **Consolidata** (utilizzo) | Allineato a DA10/DA11 di Appartenenze |
| V10 | Conferma vietata | Esplicita in invarianti e confini |
| Nuova riga facoltativa Collaborazioni → Mercati Internazionali | Da censire | Riferimento Mercato già nel logico §11 |
| Nuova riga facoltativa Collaborazioni → Eventi | Da valutare | Contesto occasionale, non strutturale |
| Ciclo Opportunità↔Collaborazioni | Conferma **Eliminato** | Solo D22 in uscita |

---

## 32. Checklist finale

| # | Verifica | Esito |
|---|---|---|
| 1 | Documento riletto integralmente | Sì |
| 2 | Coerenza Domain Thesis | Sì |
| 3 | Coerenza Logical Model revisionato | Sì |
| 4 | Allineamento stilistico ai mapping approvati | Sì (codici A01/E02/VO/C03/R/S/T/V/EV) |
| 5 | Pattern PF1–PF20, PL4, PC2, PCa1 | Sì §28 |
| 6 | Confini Opportunità e Appartenenze | Sì §5, §7, §17, V10 |
| 7 | PF4 solo fase relazionale; PF5 identità | Sì §8, §14–§15 |
| 8 | Professionista non partecipante autonomo | Sì §16 |
| 9 | Assi di stato separati | Sì §19 |
| 10 | Contestata/Sospesa/Archiviata ≠ Visibilità | Sì §19 |
| 11 | Nessun contratto/pagamento/messaggio/esecuzione | Sì §7, §18 |
| 12 | Nessuna duplicazione fatti autorevoli | Sì §13, §22 |
| 13 | Ogni A01/E02/VO motivato | Sì §8–§12 |
| 14 | Cardinalità esplicite | Sì §16–§17 |
| 15 | Nessun dettaglio implementativo | Sì (nota esclusione) |
| 16 | Nessun altro file modificato | Sì — creato solo questo file |

---

## 33. Riepilogo conclusivo

Il Physical Domain Mapping di Collaborazioni conferma **un solo Aggregate Root `Collaborazione`**, che esiste già in fase dichiarativa e può evolvere in fase relazionale (PF4) senza cambiare identità (PF5). Esigenza e Offerta, partecipanti locali, Manifestazione, CandidaturaCollaborazione, Invito, Abbinamento e AccordoPreliminare sono Entity dipendenti. I ruoli sono un Elenco controllato locale (PL4). Professionista resta qualificazione facoltativa della Persona. Appartenenze fornisce solo l'utilizzo del titolo (V10). Opportunità è origine storica facoltativa unidirezionale (D22). PC2 e PCa1 restano aperti. Nessun dettaglio di database o API è introdotto.
