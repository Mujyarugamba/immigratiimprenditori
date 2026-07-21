# Mapping fisico — Dominio Persone

> Livello architetturale. Questo documento è il mapping fisico del dominio Persone: il passaggio tra il modello logico del dominio e la sua futura rappresentazione fisica. Non contiene schema PostgreSQL, non contiene SQL, non definisce tabelle, non usa Supabase, non usa tipi di dato tecnici, non tratta indici, chiavi, RLS, API o codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../../domain-model.md), [`docs/architecture/logical/persone.md`](../../logical/persone.md), [`docs/architecture/logical/reconciliation-report.md`](../../logical/reconciliation-report.md), [`docs/architecture/physical/01-principi-mapping.md`](../01-principi-mapping.md), [`docs/architecture/physical/02-reference-model.md`](../02-reference-model.md), [`docs/architecture/physical/03-convenzioni-architetturali.md`](../03-convenzioni-architetturali.md), [`docs/architecture/physical/04-quality-attributes.md`](../04-quality-attributes.md).
> Ruolo di questo documento nella catena di ingegnerizzazione: modello logico (`persone.md`) → riconciliazione (`reconciliation-report.md`) → principi (`01`) → Reference Model (`02`) → convenzioni (`03`) → attributi di qualità (`04`) → **mapping fisico del dominio Persone (questo documento)** → piano di migrazione → migrazioni. Questo documento applica quanto già stabilito nei sei documenti trasversali a un solo dominio concreto: non ne ripete i contenuti, li usa.

---

## Indice

1. [Scopo del mapping](#1-scopo-del-mapping)
2. [Concetti persistenti](#2-concetti-persistenti)
3. [Concetti incorporati](#3-concetti-incorporati)
4. [Relazioni](#4-relazioni)
5. [Identità](#5-identità)
6. [Stati](#6-stati)
7. [Verifiche](#7-verifiche)
8. [Temporalità](#8-temporalità)
9. [Dati derivati](#9-dati-derivati)
10. [Eventi](#10-eventi)
11. [Dipendenze](#11-dipendenze)
12. [Verifica della qualità](#12-verifica-della-qualità)
13. [Decisioni di mapping](#13-decisioni-di-mapping)
14. [Questioni rinviate](#14-questioni-rinviate)
15. [Controllo finale](#15-controllo-finale)

---

## 1. Scopo del mapping

**Responsabilità del dominio.** Il dominio Persone rappresenta l'individuo che utilizza la piattaforma come entità autonoma e continuativa — chi è, come si presenta, quali competenze e lingue dichiara, quale racconto in prima persona del proprio percorso pubblica — indipendentemente da qualsiasi ruolo, Impresa o Mercato a cui sia o sia stata collegata (`persone.md` §1). È il dominio referenziato da ogni altro dominio della piattaforma come titolare, autore o soggetto (`domain-model.md` §2), e l'unico dominio la cui esistenza non dipende sostanzialmente da nessun altro (§11 di questo documento).

**Obiettivo di questo mapping.** Tradurre le quattro entità logiche del dominio (Persona, CompetenzaDichiarata, LinguaParlata, StoriaPersonale, `persone.md` §2), le loro relazioni (§3), i loro stati (§5), le loro regole di business e vincoli (§6-§7) in un insieme di decisioni concettuali di livello fisico — quali concetti richiedono una rappresentazione persistente autonoma, quali pattern del Reference Model (`02`) si applicano a ciascuno, quali dipendenze verso altri domini ne derivano — senza introdurre alcun significato che il documento logico non abbia già previsto (`01` §2, principio 4) e senza anticipare alcuna decisione di schema (§14).

**Confini di questo documento.** Questo documento tratta esclusivamente il dominio Persone, così come delimitato in `persone.md` §1: non tratta Appartenenza (dominio proprio, che referenzia la Persona senza farne parte), non tratta Imprese, Mercati Internazionali, Opportunità, Servizi, Eventi, Contenuti editoriali redazionali (Notizia, Guida) né Identità & Accessi. Dove questi domini compaiono in questo documento, compaiono esclusivamente come dipendenze referenziate (§11) o come destinatari di eventi (§10), mai come oggetto di una decisione di mapping: le loro regole restano di competenza dei rispettivi, futuri documenti di mapping (`03` §5, "Ogni relazione mantiene un dominio proprietario"; RC13).

**Metodo applicato.** Ogni concetto trattato nelle sezioni seguenti applica, senza ripeterne la motivazione generale, i principi di `01`, i pattern con codice stabile di `02`, le procedure decisionali di `03` e i criteri di qualità di `04`. Ogni scelta è riconducibile a un paragrafo specifico del documento logico `persone.md` (`01` §2, principio 5): dove questo documento introduce una lettura o una precisazione che il solo testo di `persone.md` non rendeva già del tutto esplicita, la precisazione è motivata e segnalata come decisione di mapping (§13), non presentata come se fosse già scritta nel logico.

---

## 2. Concetti persistenti

Le quattro entità logiche di `persone.md` §2 richiedono tutte una rappresentazione persistente autonoma: ciascuna ha un'identità propria, una cardinalità non limitata nel tempo, e almeno uno dei criteri di `01` §4 (referenziabilità esterna, ciclo di vita, storicizzazione, variabilità) la qualifica come tale. Nessun concetto è qui presentato come struttura tecnica: si indica solo la sua natura concettuale (con il codice del pattern applicato, `02` §17), la sua responsabilità, il suo ciclo di vita e il suo dominio proprietario.

| Concetto | Natura (pattern) | Responsabilità | Ciclo di vita | Dominio proprietario |
|---|---|---|---|---|
| **Persona** | Aggregate Root (**A01**) ed Entity condivisa (**E03**) — è l'esempio con cui `02` §4 introduce E03: un'Entity di un solo dominio proprietario, ma sistematicamente referenziata da tutti gli altri | Rappresentare l'identità dell'individuo sulla piattaforma: chi è, come si presenta, dove si trova, come può essere contattato (`persone.md` §2) | Multi-asse: la sequenza narrata in `persone.md` §5 (Registrata → Attiva → Inattiva/Sospesa → Attiva → Cancellata) attraversa più assi indipendenti, distinti in §6 di questo documento | Persone |
| **CompetenzaDichiarata** | Entity dipendente (**E02**) — esiste solo nel confine dell'Aggregate Persona (**A02**), non ha senso concettuale al di fuori di esso, ma richiede una rappresentazione individuale per la propria cardinalità (0..N per Persona) e per le proprie proprietà (livello, esperienza, note) | Rappresentare una singola dichiarazione di competenza fatta da una Persona (`persone.md` §2) | Minimale: Dichiarata → Rimossa (terminale), per scelta deliberata (`persone.md`, sezione Decisioni architetturali, Decisione 5): nessun processo di pubblicazione o revisione | Persone |
| **LinguaParlata** | Entity dipendente (**E02**), per gli stessi criteri di CompetenzaDichiarata | Rappresentare una singola dichiarazione di uso linguistico fatta da una Persona, con contesto d'uso e livello (`persone.md` §2) | Minimale: Dichiarata → Rimossa (terminale), stessa motivazione di CompetenzaDichiarata | Persone |
| **StoriaPersonale** | Entity dipendente (**E02**) *e* Entity condivisa (**E03**): dipende dal confine dell'Aggregate Persona (l'autore è sempre esattamente una Persona, `persone.md` §7), ma è referenziata individualmente — non solo per il tramite della Persona — dal dominio Contenuti editoriali, che la tratta come un proprio tipo di contenuto per distribuzione e tag trasversali (`persone.md` §9, `reconciliation-report.md` §3.2, riga "Storia personale") | Rappresentare un racconto in prima persona del percorso di una Persona, con un proprio processo di pubblicazione (`persone.md` §2) | Articolato: Bozza → In revisione → Pubblicata → Aggiornata → Archiviata, motivato da un vero processo editoriale (`persone.md` §5) | Persone |

**Perché nessun quinto concetto persistente autonomo emerge da questo dominio.** `persone.md` §2 individua esattamente queste quattro entità logiche; nessun attributo descrittivo di Persona, CompetenzaDichiarata, LinguaParlata o StoriaPersonale soddisfa, isolatamente, i criteri di separazione di `01` §4 (§3 di questo documento tratta esplicitamente perché tali attributi restano incorporati). Coerentemente con la convenzione di decomposizione (`03` §3, criterio "diventa dominio autonomo"), questo documento non propone né riconosce alcun quinto Aggregate Root: l'inventario dei domini resta quello già chiuso da `reconciliation-report.md` Parte 1.

**Perché Persona è, allo stesso tempo, A01 ed E03.** Non è una combinazione anomala: `02` §4 usa esplicitamente Persona come caso di riferimento per il pattern E03 ("Entity condivisa"), proprio perché un concetto può essere insieme il centro di consistenza del proprio dominio (A01) e, dal punto di vista di chi lo osserva da fuori, un concetto ampiamente referenziato (E03) — la condivisione riguarda l'uso da parte di altri domini, non la proprietà, che resta sempre di Persone (`01` §2, principio 1; `02` §4).

---

## 3. Concetti incorporati

I concetti seguenti non ricevono una rappresentazione persistente autonoma: restano incorporati nel concetto che li contiene, secondo i criteri di `01` §5 e i pattern Value Object di `02` §5.

| Concetto | Pattern | Motivazione dell'incorporazione |
|---|---|---|
| Attributi descrittivi della Persona (come si presenta, dove si trova, come può essere contattata pubblicamente) | Value Object incorporato (**VO01**), usato con finalità descrittiva (**C06**, Attributo descrittivo) | Cambiano sempre solidalmente con la Persona che li contiene, non hanno un proprio ciclo di vita né una propria cardinalità: sono ciò che risponde a "come si presenta" una singola Persona, non un fatto distinto da tracciare autonomamente (`01` §5; `persone.md` §2, responsabilità di Persona) |
| Livello dichiarato, anni di esperienza, note (attributi di CompetenzaDichiarata) | Value Object incorporato (**VO01**) | Non richiedono di essere referenziati da altri concetti, cambiano insieme alla singola dichiarazione a cui appartengono, e la loro validazione non eccede quella già applicabile alla dichiarazione stessa (`01` §5, criteri; `02` §5, VO01) |
| Contesto d'uso e livello dichiarato (attributi di LinguaParlata) | Value Object incorporato (**VO01**) | Stessa motivazione di CompetenzaDichiarata: descrivono la singola dichiarazione, non un fatto autonomo |
| Testo e struttura redazionale della singola redazione di una StoriaPersonale | Value Object incorporato (**VO01**), trattato secondo il pattern Versione (**VR01**, §8 di questo documento) | Il contenuto redazionale in sé non ha un'identità distinta dalla Versione che lo veicola: cambia con essa, non separatamente da essa (`02` §9) |

**Perché il riferimento a Competenza e Lingua non diventa un secondo Value Object locale.** CompetenzaDichiarata e LinguaParlata referenziano ciascuna esattamente una voce della Tassonomia condivisa (Competenza, Lingua). Questo riferimento non è un Value Object incorporato (VO01) né un Value Object condiviso di forma comune (VO02): è un Value Object riutilizzato da catalogo (**VO03**), perché la voce referenziata è posseduta da un unico dominio proprietario esterno — Tassonomia condivisa, non ancora oggetto di un proprio documento di mapping (§14) — e Persone la referenzia senza mai copiarla né ridefinirla (`01` §2, principio 2; `02` §5, VO03; `reconciliation-report.md` §7, "Competenza": "Catalogo: Tassonomia condivisa; dichiarazione: Persone"). Il valore stesso (per esempio, la voce "italiano" della Tassonomia Lingua) non è duplicato in Persone: CompetenzaDichiarata e LinguaParlata restano Entity dipendenti (E02) che referenziano quel valore per identità stabile (§5 di questo documento), non entità che lo incorporano.

**Perché "periodo di validità" non compare come concetto separato.** `persone.md` non attribuisce a CompetenzaDichiarata, LinguaParlata o StoriaPersonale alcuna scadenza o periodo di validità distinto dal loro semplice stato (Dichiarata/Rimossa, o il ciclo redazionale di StoriaPersonale): non esiste, nel documento logico, un fatto di dominio del tipo "questa lingua dichiarata scade il...". Introdurre un simile concetto non sarebbe una traduzione, ma un'aggiunta non autorizzata dal logico (`01` §2, principio 3): il pattern Validità (**T01**) non trova quindi applicazione autonoma per queste entità (§8 di questo documento).

---

## 4. Relazioni

La tabella seguente riprende le nove relazioni logiche di `persone.md` §3 (R1-R9), qualificandole con il pattern del catalogo Relazione (`02` §6) o Value Object (`02` §5) applicabile, seguendo la procedura di scelta di `03` §5.

| # (logico) | Relazione | Pattern applicato | Dominio proprietario | Motivazione |
|---|---|---|---|---|
| R1 | Persona — CompetenzaDichiarata | **R01** (Relazione strutturale) | Persone | Definisce il confine stesso dell'Aggregate (**A02**): CompetenzaDichiarata non esiste senza la Persona che la possiede (`persone.md` §3, §7) |
| R2 | Persona — LinguaParlata | **R01** | Persone | Stessa motivazione di R1 |
| R3 | Persona — StoriaPersonale | **R01** | Persone | Stessa motivazione di R1; si combina con **E03** per la referenziabilità individuale da parte di Contenuti editoriali (§2 di questo documento) |
| R4 | CompetenzaDichiarata — voce di Tassonomia Competenza | **VO03** (Value Object riutilizzato da catalogo), non un pattern di Relazione tra Aggregate autonomi | Tassonomia condivisa (per la voce), Persone (per la dichiarazione che la referenzia) | La voce di Tassonomia non è un Aggregate che Persone referenzia alla pari di un altro dominio di business: è un catalogo condiviso: il riferimento coincide con l'uso previsto di VO03 (`02` §5), non con R02 |
| R5 | LinguaParlata — voce di Tassonomia Lingua | **VO03** | Tassonomia condivisa / Persone | Stessa motivazione di R4 |
| R6 | Persona — Appartenenza | Non descritta da questo documento: relazione di proprietà di **Appartenenze** (**R07**, Relazione di appartenenza) | Appartenenze | Persone è solo la controparte referenziata per identità stabile; le regole della relazione (ruolo, periodo, titolo di rappresentanza) sono di competenza esclusiva del futuro `domain-mapping/appartenenze.md` (`03` §5, "Ogni relazione mantiene un dominio proprietario"; RC13) |
| R7 | Persona — Impresa/Organizzazione (indiretta, tramite Appartenenza) | Non descritta da questo documento: dipendenza transitiva, mai diretta | Appartenenze (per la mediazione) | Persone non ha alcuna relazione diretta con Imprese: qualunque necessità di attraversare questo legame passa sempre per l'Aggregate Appartenenza, mai per un riferimento diretto (`persone.md` §3, nota su R6/R7) |
| R8 | StoriaPersonale — Impresa (opzionale) | **R02** (Relazione contestuale) | Persone (per la relazione stessa, in quanto attributo opzionale di una propria Entity dipendente), Imprese (per l'Impresa referenziata) | Le due parti restano autonome; il legame aggiunge un significato narrativo valido solo nel contesto di quella StoriaPersonale, senza costituire un vincolo organizzativo stabile (che sarebbe **R07**, di competenza di Appartenenze) — coerente con `03` §5, "Relazioni contestuali" |
| R9 | StoriaPersonale — voci di Tassonomia (Tema, Settore, Mercato, Territorio) | **VO03** in combinazione con **C02** (Tassonomia) e **R02** per la molteplicità del tag | Tassonomia condivisa (per le voci), Persone (per la StoriaPersonale che le referenzia) | Relazione di classificazione (tag), molti-a-molti, senza alcun possesso reciproco: stessa natura di R4/R5, con cardinalità estesa a più voci contemporaneamente |

**Regola di ownership applicata (RC12, RC13).** Per ogni relazione elencata, questo documento indica un solo dominio proprietario della struttura e delle regole: Persone per R1-R3, R8-R9 (relazioni che possiede o cui contribuisce come parte non subordinata); Tassonomia condivisa per la componente di catalogo di R4-R5, R9; Appartenenze per R6-R7, che questo documento non ridescrive in alcun dettaglio, limitandosi a riconoscerne l'esistenza come dipendenza in entrata verso Persone (§11).

**Perché R4/R5/R9 non sono trattate come R02 "puro".** Un riferimento a una voce di Tassonomia condivisa potrebbe apparire, a prima vista, una Relazione contestuale (R02) tra due Aggregate autonomi. La convenzione di riuso (`03` §4) impone però di riconoscere che il problema di rappresentazione qui non è "due Aggregate che si scambiano un contesto", ma "un dominio che referenzia un valore di un catalogo condiviso e governato altrove": il pattern più fedele, già catalogato per questo scopo specifico, è VO03 (`02` §5), non R02. Applicare R02 per comodità terminologica, quando VO03 esiste appositamente per questo caso, sarebbe un riuso apparente ma incoerente (`03` §14).

---

## 5. Identità

Applicando la distinzione di `01` §6 a ciascuno dei quattro concetti persistenti (§2), senza mai far dipendere un riferimento tra domini da un'identità mutabile.

**Identità stabile e identità interna — Persona.** La Persona è il caso più critico di questo principio nell'intera architettura: è referenziata per identità stabile da tutti gli altri dieci domini (`reconciliation-report.md` §3.1, riga Persone, "Dipendono da esso"). Coerentemente con `01` §6, questa identità non deve mai cambiare per l'intera durata di vita della Persona, indipendentemente da come cambiano i suoi attributi pubblici — nome mostrato, presentazione, contatti — e indipendentemente dalle transizioni di stato che percorre (§6). Nessun dominio esterno può basare un proprio riferimento sull'identità pubblica di una Persona (sotto): lo fa sempre sull'identità stabile.

**Identità stabile — CompetenzaDichiarata, LinguaParlata, StoriaPersonale.** Le tre Entity dipendenti hanno ciascuna una propria identità stabile, distinta da quella della Persona che le possiede: è ciò che permette a CompetenzaDichiarata e LinguaParlata di essere individuate singolarmente per l'applicazione della regola di unicità (`persone.md` §6, regola 8: "una sola dichiarazione attiva per voce"), e a StoriaPersonale di essere referenziata individualmente da Contenuti editoriali (§2, pattern E03) — un riferimento che, per essere legittimo secondo `01` §6, deve appoggiarsi alla sua identità stabile, non a un suo attributo mutabile come il titolo del racconto.

**Identità pubblica — Persona.** `persone.md` §7 impone un vincolo esplicito: "l'identificativo pubblico di una Persona deve essere univoco su tutta la piattaforma". Questo identificativo è, per definizione, un'identità pubblica (`01` §6): un modo con cui la Persona è riconoscibile e citabile da chi la osserva dall'esterno, distinto dall'identità interna/stabile, e che può cambiare nel tempo (per esempio se la Persona corregge il proprio nome pubblico) senza mai richiedere una nuova identità interna né rompere i riferimenti già stabiliti da altri domini.

**Identità pubblica — CompetenzaDichiarata, LinguaParlata, StoriaPersonale.** CompetenzaDichiarata e LinguaParlata non hanno, secondo `persone.md`, alcuna identità pubblica propria: non sono mai citate o riconosciute da un osservatore esterno indipendentemente dalla Persona che le possiede (si conoscono sempre come "la competenza X di questa Persona", non come un riferimento pubblico autonomo). StoriaPersonale, diversamente, ha bisogno di un'identità pubblica propria — un titolo o un riferimento con cui viene citata, distribuita e referenziata da Contenuti editoriali — perché è l'oggetto stesso di quella distribuzione (§2, pattern E03).

**Identità temporanea — non applicabile.** Nessuna delle quattro entità di questo dominio ha un'identità che perde significato al termine di un processo limitato: non esiste, in `persone.md`, alcun concetto assimilabile a una candidatura, una sessione o un accesso provvisorio (`01` §6). Concetti di questa natura, quando riguardano una Persona (per esempio una sessione di autenticazione), appartengono al dominio Identità & Accessi, non a Persone: questo documento dichiara esplicitamente, secondo la convenzione di non omissione (`03` §6, RC15 applicato per analogia all'identità), che l'identità temporanea non trova alcuna applicazione in questo dominio.

**Identità derivate — non applicabile come categoria distinta.** `01` §6 non cataloga una quarta forma di identità oltre a interna, pubblica, stabile e temporanea: non esiste, in questo o in altri documenti trasversali, un pattern denominato "identità derivata". Verificato che nessun concetto di questo dominio ha un'identità calcolata a partire da altri identificativi (a differenza, per esempio, di un futuro Indicatore dell'Osservatorio, la cui identità potrebbe dipendere dalla combinazione di più fonti): questo documento non introduce una categoria non catalogata (`02` §2, regola 1) e dichiara che, per il dominio Persone, la distinzione richiesta si esaurisce nelle tre forme sopra (stabile/interna, pubblica, temporanea — quest'ultima non applicabile).

---

## 6. Stati

Per ciascuna delle quattro entità, questo documento percorre gli otto assi catalogati (`02` §7, S01-S08), dichiarando per ciascuno se si applica e perché, secondo la convenzione che vieta l'omissione silenziosa (`03` §6, RC15).

### 6.1 Persona

**Premessa: dalla sequenza narrata alla scomposizione in assi indipendenti.** `persone.md` §5 descrive un'unica sequenza per Persona (Registrata → Attiva → Inattiva/Sospesa → Attiva → Cancellata). `domain-model.md` §6, nella propria sintesi trasversale, afferma invece che "una Persona ha uno stato editoriale del profilo, uno stato di pubblicazione e lo stato indipendente di ciascuna propria dichiarazione", e cita esplicitamente Persone come uno dei domini con "cicli di vita multi-asse" (`01` §9). Questo documento non introduce un significato nuovo: rende espliciti, come impone il pattern obbligatorio degli assi indipendenti (`02` §7, `03` §6), gli assi che la sequenza narrativa di `persone.md` §5 tiene concettualmente distinti anche se li presenta come un'unica linea temporale.

| Asse | Applicabile | Valori (da `persone.md`) | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì | Attiva / Inattiva-Sospesa / Cancellata | Risponde alla domanda "la presenza della Persona sulla piattaforma è oggi effettiva, temporaneamente interrotta, o definitivamente conclusa" — la condizione operativa di fatto (`persone.md` §5, transizioni Attiva↔Sospesa e →Cancellata) |
| **S02** Stato editoriale | Sì | Registrata (profilo minimo) → Completo | Risponde a una domanda diversa da S01: "il profilo contiene le informazioni minime dichiarate dalla Persona". `persone.md` §5 motiva "Registrata" con "profilo minimo alla registrazione, completamento successivo": è un giudizio sulla completezza redazionale, non sulla condizione operativa — una Persona Registrata ma non ancora Completa è comunque, per costruzione, non ancora entrata nell'asse S01 (che comincia con Attiva) |
| **S03** Stato di verifica | Non applicabile | — | Persone non possiede alcuna Verifica propria (§7 di questo documento): l'identità della Persona è verificata da Identità & Accessi, non da Persone (`reconciliation-report.md` §3.2, riga Persona: "IA (identità)... ciascuno un aspetto proprio, non 'la Persona'") |
| **S04** Stato di pubblicazione | Sì | Non pubblicato (Registrata/Sospesa) / Pubblicato (Attiva) | Risponde a "il profilo è visibile pubblicamente": `persone.md` Flusso 4 conferma che, alla sospensione, "il profilo non è più visibile pubblicamente". Distinto da S01 perché risponde a una domanda diversa (visibilità, non condizione operativa), anche se nella narrazione attuale di `persone.md` le due condizioni covariano sempre insieme — questo documento le mantiene distinte per costruzione (`02` §7, principio "perché restano assi distinti"), poiché nulla nel documento logico esclude che possano un giorno divergere (per esempio una sospensione tecnica temporanea senza perdita di visibilità pubblica) |
| **S05** Stato di accesso | Non trattato in questo documento | — | L'applicazione tecnica dell'accesso a una Persona è di competenza di Identità & Accessi (`01` §14); Persone si limita a stabilire la decisione sostanziale di visibilità (S04), di cui S05 è l'applicazione (`02` §7) |
| **S06** Stato di sicurezza | Non applicabile | — | Riguarda l'Account, non la Persona (`identita-accessi.md`, dominio esterno); Persone non possiede alcun fatto di sicurezza tecnica |
| **S07** Stato amministrativo | Sì, come qualificazione aggiuntiva di S01 | Sospensione volontaria / Sospensione per moderazione | `persone.md` §6, regola 9, distingue esplicitamente due origini della sospensione: "la sospensione... può essere avviata anche dallo Staff per moderazione", oltre alla scelta della Persona stessa. S07 risponde a "chi ha causato questa condizione e con quale titolo", una domanda distinta da S01 ("qual è la condizione"): la stessa condizione operativa (Sospesa) può avere due origini amministrativamente diverse |
| **S08** Stato storico | Sì | — | Ogni transizione di S01, S02, S04, S07 deve restare ricostruibile anche dopo che lo stato corrente è cambiato più volte, coerentemente con il principio generale di storicizzazione (`01` §8) e con la regola di continuità di default (`03` §8) in assenza di un'indicazione contraria in `persone.md` |

### 6.2 CompetenzaDichiarata e LinguaParlata

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Sì | Dichiarata / Rimossa (terminale) | L'unico asse effettivamente modellato da `persone.md` §5 per queste due entità, per scelta deliberata (`persone.md`, sezione Decisioni architetturali, Decisione 5) |
| **S02** Stato editoriale | Non applicabile | — | Nessun processo di completamento redazionale: la dichiarazione è diretta e immediata (`persone.md` §5, motivazione esplicita) |
| **S03** Stato di verifica | Non applicabile | — | Nessuna Verifica di competenza generica è modellata in Persone (§7); una verifica di competenza professionale, se esiste, appartiene a Professionisti su un concetto distinto (Qualifica professionale), non su CompetenzaDichiarata |
| **S04** Stato di pubblicazione | Non applicabile a livello di singola dichiarazione | — | La visibilità di una CompetenzaDichiarata o di una LinguaParlata segue integralmente quella della Persona che la possiede (S04 di Persona, §6.1): non esiste un atto di pubblicazione distinto per la singola dichiarazione |
| **S05-S07** | Non applicabili | — | Nessun fatto amministrativo, di sicurezza o di accesso distinto è modellato per queste entità |
| **S08** Stato storico | Sì (per default, §13) | — | In assenza di un'indicazione contraria in `persone.md`, la regola di default di `03` §8 impone la conservazione più completa: il fatto che una Persona abbia dichiarato una determinata competenza o lingua, e per quanto tempo, resta un fatto storicamente rilevante anche dopo la rimozione |

### 6.3 StoriaPersonale

| Asse | Applicabile | Valori | Motivazione |
|---|---|---|---|
| **S01** Stato sostanziale | Non applicabile in modo distinto | — | Non esiste, per StoriaPersonale, una condizione operativa distinta dal proprio ciclo redazionale/di pubblicazione (a differenza di Persona, dove S01 è distinto da S02/S04): l'intera sequenza di `persone.md` §5 per questa entità è già interamente spiegata da S02, S04 e S08 |
| **S02** Stato editoriale | Sì | Bozza → In revisione | Un vero processo di redazione e possibile revisione, motivato dalla natura narrativa e dal coinvolgimento redazionale (`persone.md` §5); coincide anche con il pattern **VR02** (Revisione, §8 di questo documento) quando il passaggio "In revisione" produce un esame formale |
| **S03** Stato di verifica | Non applicabile | — | La revisione redazionale di una StoriaPersonale non è una Verifica di un aspetto dichiarato (V01): è un controllo editoriale di forma e appropriatezza, non un accertamento di un fatto verificabile. Coerente con il principio generale, valido anche per questo dominio, che un contenuto non modifica né verifica i fatti che descrive (`domain-model.md` §13, decisione 18; `persone.md`, sezione Decisioni architetturali, Decisione 4, sulla natura editoriale e non sostanziale di StoriaPersonale); nessuna verifica della veridicità sostanziale del racconto è mai menzionata in `persone.md` |
| **S04** Stato di pubblicazione | Sì | Non pubblicata (Bozza/In revisione) → Pubblicata → Aggiornata (ancora pubblicata, nuova redazione) | Coincide con il pattern **VR05** (Pubblicazione di una versione, §8 di questo documento): l'atto che rende disponibile all'esterno una redazione determinata |
| **S05-S07** | Non applicabili | — | Nessun fatto di accesso tecnico, sicurezza o intervento amministrativo distinto è modellato per StoriaPersonale in `persone.md`; un'eventuale rimozione per moderazione non è distinta esplicitamente dall'Archiviazione volontaria (segnalato come questione aperta, §14) |
| **S08** Stato storico | Sì, in combinazione con **VR06** (Archiviazione) | Archiviata | `persone.md` §5 distingue esplicitamente l'Archiviazione ("quando il racconto non è più in evidenza") sia dalla cancellazione (mai menzionata per questa entità) sia dalla semplice sostituzione tra redazioni successive (Aggiornata) |

### 6.4 Segnale di allarme verificato e non confermato

Applicando la convenzione di `03` §6 ("quando evitare la proliferazione degli stati"), questo documento ha verificato che nessuna delle tre entità richiede più assi indipendenti simultaneamente di quanti già catalogati: Persona applica quattro assi (S01, S02, S04, S07) più S08, ben entro il limite di otto; nessuna scomposizione ulteriore delle Entity in nuove Entity distinte è risultata necessaria.

---

## 7. Verifiche

**Persone non possiede alcuna Verifica propria.** Applicando il modello multidimensionale di `01` §10 e `02` §8 al dominio Persone, la conclusione è negativa: nessuno dei quattro concetti persistenti di questo dominio è soggetto, secondo `persone.md`, a un controllo condotto da un soggetto verificatore secondo un metodo dichiarato. Questa non è un'omissione di questo documento: è una constatazione già presente nel rapporto di riconciliazione, che a differenza di quasi tutti gli altri dieci domini logici non attribuisce a Persone alcuna voce nella tassonomia delle 15 verifiche (`reconciliation-report.md` §9.1) né alcuna cella della matrice di responsabilità che indichi Persone come dominio verificatore (`reconciliation-report.md` §3.2, riga "Persona": la colonna "Può verificarne aspetti" elenca esclusivamente IA, PRO e APP, mai PER).

**Cosa questo significa concretamente.**

- L'identità della Persona (chi afferma di essere) è verificata da Identità & Accessi come verifica dell'identità (`reconciliation-report.md` §9.1), un aspetto dell'Account/Identità digitale, non un fatto scritto o posseduto da Persone.
- Le qualifiche professionali eventualmente collegate a una Persona sono verificate da Professionisti, su un concetto distinto (Qualifica professionale) e non su CompetenzaDichiarata.
- La relazione tra una Persona e un'Impresa è verificata da Appartenenze, su un concetto distinto (Appartenenza) e non sulla Persona in sé.
- Nessuna di queste tre verifiche, singolarmente o insieme, costituisce né implica una "Persona verificata": `domain-model.md` §7 vieta esplicitamente ogni badge generico di questo tipo, e questo documento non introduce alcuna eccezione per il dominio Persone.

**Conseguenza per il mapping.** Poiché nessuna Verifica (V01-V05) è posseduta da questo dominio, nessuna delle quattro entità persistenti riceve, in questo documento, un asse S03 applicato (§6) né una qualificazione D03 (Dato verificato, §9): un dato dichiarato da una Persona (il proprio nome, la propria competenza, la propria lingua) resta un dato dichiarato (**D02**) fino a prova contraria, e questo documento non introduce alcuna presunzione di verifica implicita — coerente con il principio di non-automatismo che attraversa l'intera architettura, per cui una dichiarazione non implica di per sé una verifica (`domain-model.md` §1, principio di non-automatismo).

**Perché questo non è un difetto del dominio.** L'assenza di verifica propria non riduce la qualità del mapping: è la fedele traduzione di una scelta di dominio già presa a livello logico, coerente con il principio "il dominio governa sempre il modello fisico" (`01` §16, decisione 1). Introdurre una Verifica non richiesta dal logico, per uniformità con altri domini che invece la possiedono, sarebbe una violazione diretta di `01` §2, principio 3.

---

## 8. Temporalità

Applicando i sette pattern di Temporalità (`02` §14, T01-T07) ai quattro concetti persistenti del dominio.

| Pattern | Applicabile | A quali entità | Motivazione |
|---|---|---|---|
| **T01** Validità | Non applicabile | Nessuna | Nessuna delle quattro entità ha una scadenza o un periodo dopo il quale il fatto dichiarato cessa automaticamente di produrre effetti (`persone.md` non menziona alcuna scadenza): la conclusione di CompetenzaDichiarata/LinguaParlata (Rimossa) e di StoriaPersonale (Archiviata) è sempre un atto deliberato, non il decorso di un termine (§3 di questo documento) |
| **T02** Efficacia | Non applicabile | Nessuna | Nessun fatto di questo dominio è dichiarato in un momento e diventa efficace in un momento successivo diverso: dichiarazione e decorrenza coincidono sempre in `persone.md` |
| **T03** Decorrenza | Sì | Persona (registrazione/attivazione), CompetenzaDichiarata, LinguaParlata (dichiarazione), StoriaPersonale (creazione, pubblicazione) | Ogni fatto di questo dominio ha un momento di inizio rilevante, necessario per ricostruire la sequenza narrata nei quattro Flussi di `persone.md` §8 |
| **T04** Scadenza | Non applicabile | Nessuna | Conseguenza diretta dell'assenza di T01: non esiste un punto di fine previsto dal decorso del tempo per nessuna entità di questo dominio |
| **T05** Intervallo | Non applicabile in forma propria | Nessuna | In assenza di una Scadenza (T04), non emerge un intervallo delimitato da due estremi: le entità di questo dominio hanno una Decorrenza (T03) ma non un periodo chiuso |
| **T06** Cronologia | Sì | Tutte e quattro | Ogni entità percorre una sequenza ordinata di fatti (transizioni di stato, redazioni successive per StoriaPersonale) che deve restare ricostruibile nell'ordine in cui è avvenuta, indipendentemente dal suo significato di conservazione (§8, T07) |
| **T07** Storia | Sì | Tutte e quattro | Coincide con quanto già stabilito per l'asse S08 (§6): le condizioni passate di Persona, CompetenzaDichiarata, LinguaParlata e StoriaPersonale restano conservate come fatto realmente avvenuto, per la regola di default di conservazione completa (`03` §8) |

**Perché l'assenza di T01/T02/T04/T05 è una caratteristica distintiva di questo dominio, non un'omissione.** A differenza di domini come Imprese (certificazioni con scadenza) o Identità & Accessi (deleghe e consensi con periodo di validità), il dominio Persone non modella, in nessuna delle proprie quattro entità, un fatto che scade per il semplice decorso del tempo: ogni conclusione è sempre un atto deliberato (rimozione, archiviazione, cancellazione) o l'esito di un processo (revisione, pubblicazione). Questo documento non introduce una scadenza non richiesta dal logico, coerentemente con `01` §2, principio 3.

---

## 9. Dati derivati

Applicando le nove forme del pattern Dato (`02` §11, D01-D09) ai dati trattati da questo dominio.

| Pattern | Applicabile | Dove | Motivazione |
|---|---|---|---|
| **D01** Dato sorgente | Sì | Base di ogni altro dato di questo dominio | Ogni fatto di Persone (attributi della Persona, dichiarazioni, testo delle StoriePersonali) è originale, non ottenuto elaborando altri dati |
| **D02** Dato dichiarato | Sì | Attributi della Persona; CompetenzaDichiarata; LinguaParlata; testo di StoriaPersonale | Forma specifica e prevalente di D01 in questo dominio: ogni fatto è fornito direttamente dalla Persona che ne ha titolo, senza che questo implichi controllo esterno (`01` §13; principio di non-automatismo) |
| **D03** Dato verificato | Non applicabile all'interno di questo dominio | — | Nessun dato di Persone è qualificabile come D03 sulla base di una Verifica posseduta da Persone, per la constatazione già stabilita al §7: nessuna Verifica è di questo dominio. Un dato di Persone potrebbe essere preso in considerazione da una Verifica di un altro dominio (per esempio l'identità, verificata da Identità & Accessi), ma quella Verifica resta un fatto di IA, non qualifica retroattivamente il dato di Persone come D03 |
| **D04** Dato derivato | Non applicabile | — | Nessun dato di questo dominio è ottenuto elaborando altri dati sorgente: Persone non calcola né aggrega alcun proprio fatto |
| **D05** Dato calcolato | Non applicabile | — | Conseguenza di D04: nessuna formula o metodologia produce un dato di Persone |
| **D06** Dato aggregato | Non applicabile all'interno di questo dominio | — | Persone non aggrega dati relativi a più soggetti; l'aggregazione di dati provenienti da (tra gli altri) Persone è compito esclusivo di Osservatorio, un dominio esterno che non modifica né possiede i dati sorgente di Persone (`01` §13, §14) |
| **D07** Dato pubblicato | Sì | Attributi della Persona (quando S04 = pubblicato), StoriaPersonale (quando S04 = pubblicata/aggiornata) | Coerente con §6: la pubblicazione è sempre un evento o uno stato aggiunto al dato dichiarato (D02), mai una sua caratteristica intrinseca |
| **D08** Dato storico | Sì | Ogni transizione storicizzata per S08/T07 (§6, §8) | Le condizioni passate di tutte e quattro le entità restano conservate deliberatamente |
| **D09** Dato temporaneo | Non applicabile | — | Nessun dato di questo dominio è valido solo per la durata di un processo limitato (coerente con l'assenza di identità temporanea, §5) |

**Il confine con l'Osservatorio.** I dati sorgente e dichiarati di Persone (D01, D02) possono essere letti da Osservatorio per produrre, altrove, Misure e Indicatori aggregati (D05, D06 — pattern posseduti da Osservatorio, non da Persone). Questo documento non tratta né anticipa alcuna decisione su come tali aggregazioni avverranno: si limita a confermare che Persone resta sempre il dominio sorgente autorevole, mai modificato dall'aggregazione (`01` §13, §14; `04` §15, "Robustezza concettuale" applicata all'assenza di scorciatoie).

---

## 10. Eventi

Gli eventi seguenti sono quelli già elencati in `persone.md` §11, qualificati con il pattern Evento (`02` §10, EV01-EV04). Coerentemente con `01` §12 e `02` §10, nessun evento qui elencato è un comando: ciascuno descrive un fatto già avvenuto, ed è nominato al participio passato.

| Evento (nome da `persone.md`) | Pattern | Genera conseguenza dichiarata in altri domini? | Informazione persistente necessaria a ricostruirlo |
|---|---|---|---|
| `PersonaRegistrata` | **EV01**, **EV03** (osservabile) | Sì — `domain-model.md` §10 lo elenca come origine di reazioni in Identità & Accessi e Osservatorio | Identità della Persona coinvolta (§5), momento della transizione (§8, T03), valore raggiunto dell'asse S02 |
| `PersonaAttivata` | **EV01** | Non dichiarato esplicitamente in `domain-model.md` §10, ma coerente con la transizione dell'asse S01 verso "Attiva" | Identità della Persona, momento della transizione, valori raggiunti degli assi S01 e S04 |
| `PersonaSospesa` | **EV01**, **EV02** (interno, salvo diversa indicazione) | Non elencato esplicitamente tra le conseguenze trasversali di `domain-model.md` §10 | Identità della Persona, momento, valore raggiunto di S01, e valore di S07 (origine della sospensione: volontaria o per moderazione) |
| `PersonaRiattivata` | **EV01**, **EV02** | Come sopra | Identità della Persona, momento, valore raggiunto di S01 |
| `PersonaCancellata` | **EV01**, **EV03** (osservabile, per analogia con `PersonaArchiviata` di `domain-model.md` §10 — si veda la nota sotto) | Sì, per analogia | Identità della Persona, momento, valore raggiunto di S01 (terminale) |
| `CompetenzaDichiarataAggiunta` | **EV01**, **EV02** | Non dichiarato | Identità della CompetenzaDichiarata e della Persona, voce di Tassonomia referenziata, momento |
| `CompetenzaDichiarataRimossa` | **EV01**, **EV02** | Non dichiarato | Identità della CompetenzaDichiarata, momento della rimozione |
| `LinguaParlataAggiunta` | **EV01**, **EV02** | Non dichiarato | Identità della LinguaParlata e della Persona, voce di Tassonomia referenziata, momento |
| `LinguaParlataRimossa` | **EV01**, **EV02** | Non dichiarato | Identità della LinguaParlata, momento della rimozione |
| `StoriaPersonaleCreata` | **EV01**, **EV02** | Non dichiarato | Identità della StoriaPersonale e dell'autore, momento |
| `StoriaPersonaleInviataInRevisione` | **EV01**, **EV02** | Non dichiarato | Identità della StoriaPersonale, momento, transizione di S02 |
| `StoriaPersonalePubblicata` | **EV01**, **EV03** (osservabile: rende la storia disponibile a Contenuti editoriali per distribuzione, coerente con il pattern E03 già riconosciuto al §2) | Sì | Identità della StoriaPersonale, momento, transizione di S04, versione pubblicata (**VR05**) |
| `StoriaPersonaleAggiornata` | **EV01**, **EV02** | Non dichiarato | Identità della StoriaPersonale, momento, nuova Versione (**VR01**) |
| `StoriaPersonaleArchiviata` | **EV01**, **EV02** | Non dichiarato | Identità della StoriaPersonale, momento, transizione di S08/**VR06** |

**Nota su una discrepanza terminologica tra `persone.md` e `domain-model.md`.** La tabella degli eventi trasversali di `domain-model.md` §10 elenca, per il dominio Persone, gli eventi `PersonaRegistrata` e `PersonaArchiviata`. Il documento logico specialistico `persone.md` §11, tuttavia, non elenca alcun evento denominato `PersonaArchiviata`: l'evento terminale effettivamente modellato è `PersonaCancellata`. Coerentemente con il principio che il documento logico di dominio resta la fonte di dettaglio autorevole quando `docs/domain-model.md` dichiara esplicitamente di non duplicare i dettagli specialistici (`domain-model.md`, nota introduttiva: "Per il dettaglio di ciascun dominio, questo documento rimanda sempre al relativo documento logico specialistico"), questo mapping adotta `PersonaCancellata` come nome autorevole e tratta la citazione di `PersonaArchiviata` in `domain-model.md` §10 come un residuo terminologico da segnalare, non come una fonte alternativa da cui derivare un quinto evento. Questa discrepanza non è stata corretta da questo documento, che non ha mandato per modificare `domain-model.md` o `persone.md`: è segnalata qui come osservazione, non come decisione di mapping (si veda anche §14).

**Perché `PersonaCancellata` non è trattato come sinonimo di "Archiviata".** Il glossario di `reconciliation-report.md` §8.2 registra che il termine "Cancellato/a" non è usato come stato di dominio in nessuno degli undici documenti logici, a favore di "Archiviato" per preservare lo storico — eppure `persone.md` usa proprio "Cancellata" come stato terminale di Persona, con una motivazione esplicita e diversa da una semplice archiviazione (`persone.md` §6, regola 9: "atto esclusivo della Persona stessa..., mai automatico... ed è irreversibile"). Questo documento non risolve questa tensione tra il glossario generale e il documento logico specifico: la tratta come una decisione di mapping da motivare esplicitamente (§13, decisione 9) e come una questione la cui implicazione fisica resta rinviata (§14).

---

## 11. Dipendenze

Applicando la classificazione a tre categorie di `03` §10 (consentite, sconsigliate, vietate) alle dipendenze effettive del dominio Persone, distinguendo le dipendenze in uscita (di cui questo documento è responsabile) dalle dipendenze in entrata (di competenza dei rispettivi documenti di mapping altrui, richiamate qui solo per completezza informativa, coerentemente con RC13).

### 11.1 Dipendenze in uscita (Persone dipende da...)

| Dipendenza verso | Categoria | Aggregate/catalogo referenziato | Motivazione |
|---|---|---|---|
| Tassonomia condivisa | **Consentita** | Voce di Tassonomia Competenza; voce di Tassonomia Lingua | Riferimento per identità stabile a un catalogo posseduto da un unico dominio proprietario esterno, tramite il pattern **VO03** (§3, §4 di questo documento); coerente con `reconciliation-report.md` §3.1, riga Persone, "Dipende da: Tassonomia condivisa" — l'unica dipendenza in uscita dichiarata dal documento logico |

**Osservazione architetturale.** Persone è, tra gli undici domini già riconciliati, quello con il minor numero di dipendenze in uscita: una sola, verso un dominio di puro catalogo (Tassonomia condivisa), che non è esso stesso uno degli undici domini di business già modellati (§14). Nessuna dipendenza verso Appartenenze, Imprese, Mercati Internazionali o qualsiasi altro dominio di business è dichiarata o necessaria: questo è la conseguenza diretta del principio fondante "la persona precede l'impresa" (`persone.md` §2, motivo dell'esistenza di Persona) e conferma, dal punto di vista del mapping fisico, perché Persona può essere sempre il primo dominio a essere tradotto fisicamente nella sequenza di migrazione (già osservato in `reconciliation-report.md` §18).

**Accoppiamento massimo accettabile (verifica, `03` §10).** Persone dichiara, nel proprio documento logico, esattamente una dipendenza in entrata di catalogo. Questo documento non introduce alcun riferimento diretto aggiuntivo verso altri Aggregate Root: nessuna dipendenza sconsigliata è stata riscontrata in uscita da questo dominio.

### 11.2 Dipendenze in entrata (chi dipende da Persone) — informative, non ridescritte

| Dominio dipendente | Cosa referenzia | Categoria (dal punto di vista del dominio dipendente) | Nota |
|---|---|---|---|
| Appartenenze | Persona (**A01**/**E03**), per identità stabile | Consentita | La struttura e le regole della relazione (R6/R7, §4) restano di competenza esclusiva del futuro `domain-mapping/appartenenze.md` |
| Imprese, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Osservatorio, Identità & Accessi | Persona, per identità stabile, come titolare/autore/soggetto | Consentita, in ciascun caso | Nessuna di queste dipendenze è descritta in dettaglio da questo documento: ciascuna appartiene al futuro documento di mapping del dominio dipendente |
| Contenuti editoriali | Persona (come soggetto narrato) e, in modo distinto, StoriaPersonale (**E02**+**E03**) individualmente, per distribuzione e tag trasversali | Consentita, per Persona; da verificare come consentita/sconsigliata caso per caso per StoriaPersonale nel futuro `domain-mapping/contenuti-editoriali.md`, poiché referenzia un'Entity dipendente (E02) di un altro Aggregate (`03` §10, categoria (a)) — questo documento segnala la condizione, non la qualifica definitivamente, perché la qualificazione finale appartiene al documento di mapping del dominio dipendente, non a quello del dominio referenziato | Il pattern E03 (`02` §4) esiste precisamente per riconoscere che StoriaPersonale, pur essendo un'Entity dipendente, ha una cardinalità e una necessità di referenziabilità individuale che giustificano questo caso, coerentemente con il criterio di priorità di `03` §3 ("la necessità di referenziabilità esterna... prevale sempre") |

**Perché questo documento non descrive queste relazioni nel dettaglio.** Coerentemente con `03` §5 ("Ogni relazione mantiene un dominio proprietario") e con RC13, il documento di mapping di un dominio referenziato non ridescrive le regole di una relazione posseduta da un altro dominio: si limita a confermare che referenziare Persona (o StoriaPersonale) per identità stabile è sempre legittimo, e a non introdurre alcun vincolo che il documento logico di Persone non abbia già previsto per gli altri dieci domini.

### 11.3 Nessuna dipendenza vietata

Verificato secondo i quattro criteri di `01` §14: nessun altro dominio duplica un fatto di Persone (ogni riferimento osservato nei documenti logici è per identità, mai per copia); nessun dominio modifica un fatto di Persone (coerente con `persone.md` §9, che dichiara sempre relazioni di sola referenza in uscita dagli altri domini); nessun dominio tecnico o trasversale diventa proprietario di un fatto sostanziale di Persone (Identità & Accessi applica l'accesso, non lo possiede, §6); nessuna dipendenza circolare di proprietà coinvolge Persone (l'unica dipendenza in uscita, verso Tassonomia condivisa, non richiede a sua volta nulla da Persone).

---

## 12. Verifica della qualità

Applicazione puntuale della checklist di qualità di `04` §17 a questo documento, punto per punto, come richiesto da quella stessa sezione ("riutilizzabile senza modifiche per tutti gli 11 domini").

| # | Attributo | Il mapping lo soddisfa? | Perché |
|---|---|---|---|
| 1 | Coerenza | Sì | Ogni pattern citato usa lo stesso codice e lo stesso significato del catalogo unico (`02`); dove è emersa una tensione terminologica reale (§10, `PersonaCancellata` vs. "Archiviata") è stata segnalata esplicitamente, non occultata |
| 2 | Separazione delle responsabilità | Sì | Ogni concetto (§2), relazione (§4) e dipendenza (§11) dichiara un solo dominio proprietario; le relazioni possedute da Appartenenze (R6/R7) non sono ridescritte |
| 3 | Coesione | Sì | Ogni sezione ruota attorno alle quattro entità già individuate da `persone.md` §2; nessun concetto estraneo al dominio è stato introdotto |
| 4 | Accoppiamento | Sì | Una sola dipendenza in uscita (Tassonomia condivisa, §11); nessuna dipendenza diretta verso Appartenenze, Imprese o altri domini di business |
| 5 | Estendibilità | Sì | L'introduzione di un futuro documento di mapping per Tassonomia condivisa (§14) non richiederà di modificare questo documento, perché il riferimento è già espresso per identità stabile tramite VO03, non per struttura interna |
| 6 | Evolvibilità | Sì | La scomposizione degli assi di Persona (§6.1) rende esplicite dimensioni già distinte nella sintesi trasversale (`domain-model.md` §6), assorbendo un'evoluzione della comprensione del dominio senza contraddire `persone.md` |
| 7 | Manutenibilità | Sì | Ogni scelta è ricondotta a un paragrafo specifico di `persone.md`, `02` o `03`: un futuro manutentore può individuare rapidamente l'origine di ciascuna decisione |
| 8 | Tracciabilità | Sì | Ogni Entity, relazione, asse, evento e dato cita il codice del pattern applicato e il paragrafo del documento logico corrispondente |
| 9 | Auditabilità | Sì | Le decisioni di mapping (§13) sono motivate in modo sufficiente a un controllo indipendente, senza richiedere di consultare l'autore di questo documento |
| 10 | Verificabilità | Sì | Ogni affermazione di questo documento è verificabile per lettura diretta di `persone.md`, `02`, `03`; le tabelle di §6, §8, §9 permettono una verifica riga per riga |
| 11 | Comprensibilità | Sì | Ogni concetto è introdotto prima di essere usato; le tabelle riassumono senza sostituire la motivazione discorsiva |
| 12 | Internazionalizzazione | Sì | Nessun concetto di questo documento presume una sola lingua o un solo ordinamento giuridico; LinguaParlata e la sua indipendenza da Tassonomia condivisa (§3) sono coerenti con la vocazione multilingue della piattaforma |
| 13 | Scalabilità concettuale | Sì | L'aggiunta di una futura quinta entità dipendente (per esempio una "CertificazioneDichiarata", già anticipata come pattern riutilizzabile in `persone.md` §10) seguirebbe esattamente lo stesso schema di CompetenzaDichiarata/LinguaParlata (E02, VO03), senza impatto su questo documento |
| 14 | Robustezza concettuale | Sì | Il caso limite della discrepanza `PersonaCancellata`/"Archiviata" (§10) non è stato forzato in una soluzione impropria: è stato segnalato e rinviato (§14), coerentemente con `04` §15 |
| 15 | Esito complessivo | Positivo, con un'area segnalata per miglioramento | Il documento è corretto secondo `01`, `02`, `03` e di buona qualità secondo `04`; l'unica area segnalata (non un difetto di questo documento, ma un'eredità del livello logico) è la tensione terminologica su `PersonaCancellata`, esplicitamente riportata come questione rinviata (§14) e non risolta unilateralmente da questo mapping |

---

## 13. Decisioni di mapping

Ogni decisione cita il principio di `01`, il pattern di `02` e la convenzione di `03` che la giustificano, secondo il formato richiesto.

**Decisione 1 — Persona è trattata come A01 ed E03 insieme.**
- Principio (`01`): §3, "Aggregate Root" — ogni dominio ha un concetto centrale attorno al quale organizza la propria consistenza.
- Pattern (`02`): §4, E03 ("Entity condivisa"), che usa esplicitamente Persona come esempio.
- Convenzione (`03`): §3, domanda 1 della procedura decisionale ("È già l'Aggregate Root del dominio?"): risposta positiva, la decomposizione si ferma a questo livello per Persona.

**Decisione 2 — CompetenzaDichiarata e LinguaParlata sono Entity dipendenti (E02), non Value Object.**
- Principio (`01`): §4, criteri di persistenza di un'Entity (cardinalità, proprietà proprie).
- Pattern (`02`): §4, E02.
- Convenzione (`03`): §3, domanda 3 ("È interamente descritto dai propri attributi...?"): risposta negativa, perché due dichiarazioni della stessa voce da parte della stessa Persona sarebbero comunque due fatti distinguibili nel tempo (coerente con `persone.md`, sezione Decisioni architetturali, Decisione 2).

**Decisione 3 — Il riferimento a una voce di Tassonomia condivisa applica VO03, non un pattern di Relazione.**
- Principio (`01`): §2, principio 2 (nessuna duplicazione di fatti altrui) e §5 (Value Object riutilizzato da catalogo).
- Pattern (`02`): §5, VO03.
- Convenzione (`03`): §4, "Riuso corretto" — il codice VO03 è citato esplicitamente, non una soluzione equivalente non dichiarata.

**Decisione 4 — StoriaPersonale applica sia E02 sia E03.**
- Principio (`01`): §4, criterio di referenziabilità esterna.
- Pattern (`02`): §4, E02 ed E03 combinati (non mutuamente esclusivi, come dichiarato in §4 di `02`).
- Convenzione (`03`): §3, "criterio di scelta tra 'resta incorporato' e 'viene separato'" — la necessità di referenziabilità esterna da parte di Contenuti editoriali prevale sugli altri criteri.

**Decisione 5 — La sequenza narrativa di Persona in `persone.md` §5 è scomposta in quattro assi indipendenti (S01, S02, S04, S07) più S08.**
- Principio (`01`): §9, principio degli assi indipendenti, che cita esplicitamente Persone come dominio con ciclo di vita multi-asse.
- Pattern (`02`): §7, S01/S02/S04/S07/S08.
- Convenzione (`03`): §6, "quando riutilizzare un asse esistente" — la natura della domanda, non il nome dei valori, determina l'asse applicabile.

**Decisione 6 — Nessuna Verifica (V01-V05) è posseduta dal dominio Persone.**
- Principio (`01`): §10, "la responsabilità di una verifica appartiene sempre al dominio che la possiede secondo il documento logico".
- Pattern (`02`): §8, assenza di applicazione di V01-V05 per questo dominio.
- Convenzione (`03`): §7, "come aggiungere nuove verifiche" — nessuna verifica è stata aggiunta perché nessun aspetto verificato è dichiarato in `persone.md` per questo dominio.

**Decisione 7 — CompetenzaDichiarata, LinguaParlata e StoriaPersonale applicano S08/T07/D08 per default, in assenza di indicazione contraria in `persone.md`.**
- Principio (`01`): §8, "la storicizzazione non deve mai far perdere la possibilità di ricostruire... chi ha dichiarato o determinato cosa, e quando".
- Pattern (`02`): §7 (S08), §14 (T07), §11 (D08).
- Convenzione (`03`): §8, "regola di default... è la continuità completa, non la più economica".

**Decisione 8 — Il ciclo redazionale di StoriaPersonale applica la famiglia di pattern Versione (VR01-VR06).**
- Principio (`01`): §11, versioni, redazione, revisione, pubblicazione come momenti distinti.
- Pattern (`02`): §9, VR01 (redazione/Aggiornata), VR02 (In revisione), VR05 (Pubblicata), VR06 (Archiviata).
- Convenzione (`03`): §8, "Revisione" — i tre momenti (avvio, esame, effetto) restano distinti anche quando `persone.md` non usa letteralmente la parola "Revisione" per ogni passaggio.

**Decisione 9 — La discrepanza terminologica su `PersonaCancellata` (rispetto a "Archiviata") è segnalata, non risolta unilateralmente da questo mapping.**
- Principio (`01`): §2, principio 3 ("il modello fisico non modifica il modello logico... se emerge una contraddizione, si corregge il logico esplicitamente, non si introduce nel fisico una soluzione non autorizzata").
- Pattern (`02`): §9, VR06 (Archiviazione) come pattern generale a cui `persone.md` deliberatamente non ricorre per la conclusione di Persona.
- Convenzione (`03`): §2, "le eccezioni devono essere motivate" secondo lo schema in tre parti: (a) soluzione uniforme attesa — Archiviazione (VR06), usata da tutti gli altri domini per preservare lo storico; (b) condizione dichiarata in `persone.md` che la rende diversa — la cancellazione è un atto esclusivo, volontario e irreversibile della Persona stessa (§6, regola 9), concettualmente più vicino a un diritto di cancellazione che a una semplice archiviazione; (c) soluzione applicata: questo documento mantiene comunque S08/T07 (storicizzazione della transizione) per default (Decisione 7), perché `persone.md` non dichiara esplicitamente che il dato venga distrutto — solo che la transizione è irreversibile — rinviando la decisione definitiva su un'eventuale cancellazione fisica dei dati a un futuro dominio Privacy (§14; `domain-model.md` §11).

**Decisione 10 — Nessuna dipendenza in uscita oltre a Tassonomia condivisa.**
- Principio (`01`): §14, "dipendenze ammesse... per riferimento a un'identità stabile, mai per incorporazione".
- Pattern (`02`): §5, VO03, come unico pattern di dipendenza in uscita applicato.
- Convenzione (`03`): §10, "accoppiamento massimo accettabile" — nessun riferimento diretto aggiuntivo non corrispondente a una dipendenza già censita in `persone.md`.

**Decisione 11 — L'identità pubblica di Persona e di StoriaPersonale è sempre distinta dalla loro identità stabile.**
- Principio (`01`): §6, "nessun riferimento tra domini deve mai basarsi sull'identità pubblica (mutabile) invece che su quella stabile (immutabile)".
- Pattern (`02`): richiamo diretto a `01` §6 (l'identità non ha una propria famiglia di pattern codificata in `02`, che la tratta come principio trasversale).
- Convenzione (`03`): §12, "confrontabilità tra documenti" — questa distinzione è trattata separatamente da relazioni e stati, come richiesto.

**Decisione 12 — Identità temporanea e identità derivata sono dichiarate esplicitamente non applicabili a questo dominio.**
- Principio (`01`): §6, "identità temporanea... non deve essere confusa con l'identità stabile del soggetto".
- Pattern (`02`): nessun pattern applicabile (assenza dichiarata, non omessa).
- Convenzione (`03`): §6, principio di non-omissione applicato per analogia dagli assi di stato all'identità.

---

## 14. Questioni rinviate

Le decisioni seguenti richiederanno il futuro schema fisico (PostgreSQL/Supabase) e non sono anticipate da questo documento, che si limita a segnalarle.

1. **Rappresentazione tecnica degli assi indipendenti di Persona (S01, S02, S04, S07, S08, §6.1).** Se saranno realizzati come colonne distinte, tabelle distinte, o altra struttura, resta una decisione del futuro schema.
2. **Meccanismo di garanzia dell'unicità dell'identificativo pubblico della Persona su tutta la piattaforma (§5).** Nessuna soluzione tecnica è anticipata.
3. **Meccanismo di garanzia della regola "una sola dichiarazione attiva per voce" per CompetenzaDichiarata e LinguaParlata (`persone.md` §6, regola 8).** Il vincolo è logico; la sua applicazione fisica resta rinviata.
4. **Tecnica di storicizzazione (S08/T07/D08) per tutte e quattro le entità.** Se realizzata con tabelle storiche separate, versionamento in linea, log di audit, o altra tecnica, è una decisione del futuro schema, non di questo documento.
5. **Se la cancellazione di una Persona (`PersonaCancellata`) comporterà, a livello fisico, la distruzione effettiva dei dati o solo una loro storicizzazione con visibilità ritirata.** Questa decisione dipende dalla futura definizione di un dominio Privacy (`domain-model.md` §11), non ancora modellato: questo documento non la anticipa (Decisione 9, §13).
6. **Struttura fisica del catalogo Tassonomia condivisa (voci di Competenza e di Lingua) referenziato tramite VO03.** Tassonomia condivisa non è ancora uno degli undici domini con un proprio documento di mapping fisico (`domain-model.md` §2, "domini generici non ancora oggetto di un documento logico dedicato"): la struttura fisica del riferimento VO03 resta sospesa fino a quando quel dominio non riceverà, a sua volta, un proprio mapping.
7. **Tecnica di versionamento fisico per il ciclo redazionale di StoriaPersonale (VR01-VR06, §8).** Se le versioni precedenti saranno conservate come righe distinte, come un log applicativo, o con altra tecnica, non è deciso da questo documento.
8. **Meccanismo tecnico di propagazione degli eventi di dominio elencati al §10.** Coerentemente con `01` §12, nessuna tecnologia di comunicazione (coda, broker, trigger) è anticipata: questo documento garantisce solo che l'informazione necessaria a ricostruire ciascun evento resti concettualmente disponibile.
9. **Applicazione tecnica dell'accesso (S05) alla Persona da parte di Identità & Accessi.** Rinviata al futuro `domain-mapping/identita-accessi.md`.
10. **Struttura fisica delle relazioni R6-R7 (Persona-Appartenenza-Impresa).** Rinviata integralmente al futuro `domain-mapping/appartenenze.md`, che ne è il proprietario (§4, §11).

---

## 15. Controllo finale

### Checklist di controllo

| # | Verifica | Esito |
|---|---|---|
| 1 | Coerenza con il dominio logico (`persone.md`) | Verificato — ogni entità, relazione, stato, regola ed evento trattato è riconducibile a un paragrafo esplicito di `persone.md`; le uniche letture non testuali (scomposizione degli assi di Persona, §6.1) sono motivate e segnalate come decisioni di mapping (§13), non presentate come testo logico esistente |
| 2 | Coerenza con `docs/domain-model.md` | Verificato — i richiami alla matrice di responsabilità, al principio degli assi indipendenti e alla tassonomia delle verifiche sono coerenti con `domain-model.md` §4, §6, §7; la discrepanza terminologica riscontrata (§10) è stata segnalata esplicitamente, non occultata né corretta unilateralmente |
| 3 | Applicazione dei pattern (`02`) | Verificato — ogni concetto trattato cita il codice del pattern applicato (A01, E02, E03, VO01, VO03, C02, R01, R02, S01-S02/S04/S07-S08, VR01/VR02/VR05/VR06, EV01-EV03, D01-D02/D07-D08, T03/T06-T07); nessun pattern non catalogato è stato introdotto |
| 4 | Applicazione delle convenzioni (`03`) | Verificato — la procedura decisionale di §3 di `03` è stata applicata esplicitamente (§2, §13); le regole RC01-RC35 pertinenti a questo dominio sono rispettate (nessuna verifica generica introdotta, RC19; nessuna dipendenza vietata, RC30; ogni asse non applicabile dichiarato esplicitamente, RC15) |
| 5 | Rispetto degli attributi di qualità (`04`) | Verificato — checklist applicata punto per punto al §12, con un'unica area segnalata esplicitamente (discrepanza terminologica su `PersonaCancellata`), non occultata |
| 6 | Assenza di tecnologia | Verificato — nessuna tecnologia è nominata come scelta di progetto; PostgreSQL e Supabase compaiono solo nella nota introduttiva, come cosa il documento esclude |
| 7 | Assenza di SQL | Verificato — nessuna istruzione SQL, nessun `CREATE TABLE` |
| 8 | Assenza di schema fisico | Verificato — non è definita alcuna tabella, colonna, indice, chiave o vincolo tecnico; ogni riferimento a una futura struttura è esplicitamente rinviato al §14 |
| 9 | Assenza di implementazioni | Verificato — ogni sezione descrive concetti, pattern, motivazioni e decisioni, mai passi realizzativi |

### Riepilogo

**Pattern utilizzati.** Aggregate (A01); Entity (E02, E03); Value Object (VO01, VO03); Relazione (R01, R02); Classificazione (C02, C06); Stato (S01, S02, S04, S07, S08); Verifica — nessuno, assenza motivata (§7); Versione (VR01, VR02, VR05, VR06); Evento (EV01, EV02, EV03); Dato (D01, D02, D07, D08); Temporalità (T03, T06, T07); Identità (interna/stabile, pubblica — pattern trasversale di `01` §6, senza codice dedicato in `02`).

**Decisioni di mapping.** Dodici decisioni consolidate (§13), ciascuna motivata con principio, pattern e convenzione: dalla doppia natura A01/E03 di Persona, alla scomposizione degli assi indipendenti della sua sequenza narrativa, all'assenza di Verifiche proprie del dominio, alla gestione esplicitamente non risolutiva della discrepanza terminologica su `PersonaCancellata`.

**Qualità raggiunta.** Il documento soddisfa i quindici criteri della checklist di `04` §17 (§12 di questo documento), con un'unica area segnalata per un possibile miglioramento futuro — non un difetto di questo mapping, ma un'eredità del livello logico che questo documento non ha il mandato di correggere.

**Aspetti rinviati allo schema fisico.** Dieci punti (§14): dalla rappresentazione tecnica degli assi di stato, alla tecnica di storicizzazione, al meccanismo di garanzia dell'unicità dei vincoli logici, alla decisione — esplicitamente sospesa in attesa di un futuro dominio Privacy — su cosa comporti fisicamente la cancellazione di una Persona.

Questo documento è pronto per essere usato come riferimento per il futuro piano di migrazione del dominio Persone, secondo lo stesso processo già seguito per le migrazioni M1-M5 già implementate, e come modello di confronto per i futuri documenti di mapping degli altri dieci domini.
