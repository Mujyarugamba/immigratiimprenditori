# Physical Domain Mapping — Dominio Opportunità

## Nota introduttiva di esclusione

Questo documento rappresenta il passaggio tra il modello logico del dominio Opportunità e la sua futura rappresentazione fisica. Non crea uno schema di database eseguibile, non scrive SQL, non crea tabelle, non usa PostgreSQL o Supabase come riferimento progettuale operativo, non descrive endpoint, API o codice applicativo.

Le sezioni **Fonte** (§13) ed **Evidenza** (§14) incorporano gli **invarianti strutturali approvati** dalle micro-review M3.1 e M3.2 (attributi, ownership, cancellazione, FK composta, unique tecnico) per mantenere il mapping allineato alle decisioni operative già congelate. Le sezioni **Verifica** (§24, M7.1) e **Pubblicazione e visibilità** (§26, M7.2) incorporano gli invarianti DDL-deterministici della fase M7 (current-state; senza storico pubblicazioni; senza mini-CMS), senza trasformare questo documento in un dump di schema eseguibile.

Le eventuali menzioni tecnologiche compaiono esclusivamente in questa nota e in §41–§43, per confermarne l'assenza altrove nel testo.

Il documento applica la Domain Thesis (`opportunita-domain-thesis.md`), il Logical Data Model revisionato (`logical/opportunita.md`), i Domain Patterns, la Dependency Map e i Physical Domain Mapping già approvati. Non ridefinisce il significato del dominio: lo traduce in decisioni concettuali di livello fisico.

---

## Indice

1. [Scopo e perimetro](#1-scopo-e-perimetro)
2. [Documenti normativi e fonti](#2-documenti-normativi-e-fonti)
3. [Definizione fisica del dominio](#3-definizione-fisica-del-dominio)
4. [Decisione sugli Aggregate Root](#4-decisione-sugli-aggregate-root)
5. [Motivazione della scelta dell'Aggregate](#5-motivazione-della-scelta-dellaggregate)
6. [Classificazione completa dei concetti](#6-classificazione-completa-dei-concetti)
7. [Aggregate Root Opportunità](#7-aggregate-root-opportunità)
8. [Identità dell'Opportunità](#8-identità-dellopportunità)
9. [Opportunità sostanziale e rappresentazione governata](#9-opportunità-sostanziale-e-rappresentazione-governata)
10. [Opportunità esterna e Opportunità interna](#10-opportunità-esterna-e-opportunità-interna)
11. [Origine dell'Opportunità](#11-origine-dellopportunità)
12. [Tipologia e classificazioni](#12-tipologia-e-classificazioni)
13. [Fonte](#13-fonte)
14. [Evidenza](#14-evidenza)
15. [Promotore, gestore, finanziatore, segnalatore e pubblicatore](#15-promotore-gestore-finanziatore-segnalatore-e-pubblicatore)
16. [Destinatari](#16-destinatari)
17. [Requisiti e criteri](#17-requisiti-e-criteri)
18. [Benefici](#18-benefici)
19. [Modalità e procedura di accesso](#19-modalità-e-procedura-di-accesso)
20. [CandidaturaOpportunità](#20-candidaturaopportunità)
21. [Valutazione e ammissibilità](#21-valutazione-e-ammissibilità)
22. [Graduatoria ed esiti](#22-graduatoria-ed-esiti)
23. [Assegnazione e beneficiario](#23-assegnazione-e-beneficiario)
24. [Verifica](#24-verifica)
25. [Contestazione e rettifica](#25-contestazione-e-rettifica)
26. [Pubblicazione e visibilità](#26-pubblicazione-e-visibilità)
27. [Assi di stato](#27-assi-di-stato)
28. [Temporalità](#28-temporalità)
29. [Cardinalità](#29-cardinalità)
30. [Ciclo di vita dell'Opportunità](#30-ciclo-di-vita-dellopportunità)
31. [Ciclo di vita della Candidatura](#31-ciclo-di-vita-della-candidatura)
32. [Business permissions](#32-business-permissions)
33. [Rappresentanza e snapshot storici](#33-rappresentanza-e-snapshot-storici)
34. [Domain Events](#34-domain-events)
35. [Invarianti](#35-invarianti)
36. [Dipendenze e autorità esterne](#36-dipendenze-e-autorità-esterne)
37. [Analisi dei cicli](#37-analisi-dei-cicli)
38. [Applicazione dei Domain Patterns](#38-applicazione-dei-domain-patterns)
39. [Transazioni concettuali](#39-transazioni-concettuali)
40. [Rischi architetturali](#40-rischi-architetturali)
41. [Questioni aperte](#41-questioni-aperte)
42. [Impatto potenziale sulla Dependency Map](#42-impatto-potenziale-sulla-dependency-map)
43. [Checklist finale di conformità](#43-checklist-finale-di-conformità)
44. [Conclusione](#44-conclusione)

---

## 1. Scopo e perimetro

**Obiettivo.** Tradurre in decisioni concettuali di Physical Domain Mapping le responsabilità, i fatti, i confini e i cicli di vita stabiliti dalla Domain Thesis e dal Logical Data Model di Opportunità (`01-principi-mapping.md` §2).

**Cosa NON è.** Non è riscrittura della tesi né del logico. Non è schema di database. Non introduce erogazioni, contratti, pagamenti, norme, procedure amministrative ufficiali o dominio Servizi/Organizzazioni.

**Cosa decide.** Aggregate Root; Entity; Value Object; elenchi controllati; riferimenti opachi; snapshot; evidence; identità; cardinalità; invarianti; assi di stato; temporalità; candidatura condizionata; eventi di dominio; dipendenze; impatti *proposti* (non applicati) sulla Dependency Map.

---

## 2. Documenti normativi e fonti

**Fonti normative (ordine di autorità):** Domain Thesis Opportunità → Logical `opportunita.md` revisionato → Domain Patterns → Dependency Map → Physical Mapping approvati (Persone, Imprese, Appartenenze, Mercati Internazionali, Professionisti, Collaborazioni) → Domain Model / Costituzione / PDS (contesto storico, non autorità di perimetro attuale).

**Letti integralmente:** costituzione; domain-model; platform-data-specification; domain-patterns; opportunita-domain-thesis; domain-dependency-map; logical di Persone, Imprese, Appartenenze, Mercati, Professionisti, Collaborazioni, Opportunità; physical mapping dei sei domini approvati; `01`–`04` e architecture-baseline.

**Non usati come autorità:** migrazioni, schema DB, codice, front-end, API, ORM, bozze non approvate.

---

## 3. Definizione fisica del dominio

Opportunità è dominio **Core autonomo**. Fatto fisico di piattaforma: **possibilità azionabile strutturata** — beneficio o accesso, condizioni, destinatari, periodo, azione di accesso possibile — come **rappresentazione governata**, più eventuale **processo interno** quando assunto.

**Possiede:** scheda/identità; origine; tipizzazione; ruoli di processo (riferimenti); requisiti; benefici dichiarati; modalità di accesso; finestre temporali; fonti; evidenze; verifiche di rappresentazione; pubblicazione/visibilità; eventuali CandidatureOpportunità (0..N); eventuali valutazioni/assegnazioni interne o registrate.

**Non possiede:** fatto istituzionale esterno; norma; domanda ufficiale fuori piattaforma; graduatoria ufficiale; aggiudicazione/contratto/pagamento/erogazione; Evento; Collaborazione; Contenuto Editoriale; Servizio; Profilo Professionale; Appartenenza; Mercato.

---

## 4. Decisione sugli Aggregate Root

### 4.1 Ipotesi confrontate

| Ipotesi | Contenuto |
|---|---|
| **A — Un solo Aggregate Root `Opportunità`** | Governa rappresentazione, origine, classificazione, destinatari, requisiti, benefici, modalità, temporalità, fonti, evidenze, verifica, pubblicazione, e — se presenti — candidature/valutazioni/assegnazioni come Entity dipendenti |
| **B — Due o più Aggregate Root** | Candidati: RappresentazioneOpportunità; CandidaturaOpportunità; ProceduraAccesso; Valutazione; Assegnazione; Fonte; Evidenza |

### 4.2 Procedura PC1 sui concetti critici

| Concetto | (a) già AR? | (b) referenziabilità esterna individuale? | (c) solo attributi? | (d) alternative? | (e) derivato? | Natura |
|---|---|---|---|---|---|---|
| Opportunità | Sì (tesi; logico §2) | Sì — D22, D27, D34 referenziano l'Opportunità | No | No | No | **A01** |
| RappresentazioneOpportunità | No | No — coincide con la scheda | — | — | — | **= A01** (non seconda identità) |
| Fonte | No | No oggi documentata | No | No | No | **E02** |
| Evidenza | No | No | No | No | No | **E02** / Evidence |
| Requisito | No | No | No | No | No | **E02** |
| Beneficio | No | No | Sì (composizione) | VO | No | **VO** |
| ModalitàAccesso | No | No | Sì (classificazione) | C05 | No | **Controlled List** |
| Verifica | No | No | No | No | No | **E02** |
| CandidaturaOpportunità | No | No oggi documentata | No | No | No | **E02** (condizionata; PC2 aperto) |
| Valutazione | No | No oggi documentata | No | No | No | **E02**/VO (condizionata; PC2 aperto) |
| Assegnazione | No | No oggi documentata | No | No | No | **E02** (condizionata; PC2 aperto) |
| Graduatoria | No | No | Parzialmente | Snapshot/Evidence | Parzialmente | **Snapshot/Evidence** o E02 interna (PC2 aperto) |
| Contestazione | No | No | — | — | — | **Open Candidate (PCa1)** |

### 4.3 Decisione

**Si conferma l'Ipotesi A: un solo Aggregate Root `Opportunità` (A01).**

PC2 resta **aperto** (§41): se in futuro `CandidaturaOpportunità`, `Valutazione`, `Assegnazione` o `Fonte` dimostrassero referenziabilità esterna individuale e consistenza indipendente, la promozione andrebbe motivata in una revisione di questo mapping, non introdotta qui per simmetria.

---

## 5. Motivazione della scelta dell'Aggregate

### 5.1 Argomenti a favore di A

| Criterio | Valutazione |
|---|---|
| Identità autonoma | Una sola identità di scheda di piattaforma; la “rappresentazione” non ha ciclo di vita separato dalla scheda |
| Ciclo di vita | Censimento→pubblicazione→apertura→chiusura è un unico percorso della scheda |
| Ownership | Un solo Single Owner (PF1) per il fatto di piattaforma |
| Invarianti | Nucleo azionabile e assi di stato appartengono alla stessa unità di consistenza |
| Cardinalità | Candidature 0..N; assenza di candidature non spezza l'AR |
| Transazioni | Censire, verificare, pubblicare, aggiornare scadenza sono operazioni sulla scheda |
| Volume | Candidature possono crescere, ma restano subordinate all'Opportunità (come in Collaborazioni E02) |
| Riuso da altri domini | Altri domini referenziano l'Opportunità (D22, D27, D34), non le candidature individuali (oggi) — PC1 (b) negativo per le E02 |
| Rischio AR enorme | Mitigato: processo interno/registrato è opzionale; Entity condizionate; PC2 aperto |
| Allineamento tesi/logico | Entrambi mantengono un solo AR; il Physical non li supera senza evidenza PC1 (b) positiva |

### 5.2 Argomenti a favore di B (non sufficienti oggi)

1. Volume potenziale di candidature — mitigato tenendo `CandidaturaOpportunità` come E02 con ciclo proprio.
2. Autonomia percepita di Fonte/Valutazione/Assegnazione — non supportata da referenziabilità esterna individuale documentata.
3. Distinzione esterna/interna — è variante di autorità sullo stesso A01, non due AR.

**Perché non B ora.** Separare Rappresentazione da Opportunità creerebbe due identità senza cicli di vita davvero autonomi (tesi §21; logico §3). Separare Candidatura come AR senza riferimenti inbound consolidati da altri mapping violerebbe il criterio “non più AR solo perché esistono più entità”.
---

## 6. Classificazione completa dei concetti

| Concetto | Classificazione | Note |
|---|---|---|
| Opportunità | **Aggregate Root** | A01; coincide con rappresentazione governata |
| RappresentazioneOpportunità | Concetto = AR (non seconda identità) | Distinzione concettuale vs sostanziale esterna |
| OrigineOpportunità | Attributo controllato dell'AR | `external` \| `internal`; non catalogo/tabella separata |
| TipologiaOpportunità | Controlled List | Multivalore ammesso; non gerarchia di sottotipo |
| Oggetto / Finalità | Value Object | Testo/struttura dichiarativa |
| Fonte | Entity (E02) | Pattern locale; ≠ promotore; ≠ Evidenza; ≠ file/documento |
| Evidenza | Entity (E02) / Evidence | Riscontro owned dall'Opportunità; ≠ Fonte; ≠ Verifica; nessun stato locale |
| Promotore | Reference | Persona / Impresa / esterno informativo |
| EnteFinanziatore / EnteGestore | Reference | Opachi o informativi |
| Segnalatore / SoggettoCensitore | Reference | Ruoli di processo |
| Pubblicatore | Reference | ≠ promotore |
| Redazione | Business role (PL4 locale) | Non AR |
| Destinatario / CategoriaDestinatario | Controlled List locale (C05) + associazione M:N | M4.1; criteri di pubblico dichiarato; ≠ Requisito; ≠ soggetto concreto; ≠ beneficiario |
| Requisito | Entity (E02) | Dichiarato/strutturato/verificabile |
| CriterioAmmissibilità | Derived / composizione | Aggrega Requisiti |
| Beneficio | Value Object | Dichiarato; 1..N per Opportunità |
| ModalitàAccesso | Controlled List (+ VO composizione) | Non = Candidatura |
| ProceduraAccesso | Value Object descrittivo | M4.4; istruzioni + URL operativo; 0..1; ≠ ModalitàAccesso; ≠ procedura ufficiale esterna |
| FinestraAccesso / PeriodoValidità | Value Object | Temporalità M5; tabella `opportunity_time_windows` 0..N; ≠ pubblicazione M7 |
| TerritorioApplicazione / MercatoObiettivo | Reference | Territori / Mercati |
| Verifica / EsitoVerifica | Entity (E02) | Assi di verifica rappresentazione |
| Contestazione | Open Candidate (PCa1) | Non consolidata come processo pieno |
| CandidaturaOpportunità | Entity (E02) condizionata | 0..N; scenari B/C |
| CandidaturaEsternaRegistrata | Variante di CandidaturaOpportunità | Autorità dichiarativa |
| CandidaturaInterna | Variante di CandidaturaOpportunità | Autorità governata |
| Valutazione / Ammissibilità / EsitoValutazione | Entity (E02) o VO su candidatura | Solo interno o registrato |
| Graduatoria | Snapshot / Evidence (esterna) o E02 (interna) | PC2 aperto |
| Assegnazione / Beneficiario | Entity (E02) condizionata | ≠ erogazione |
| CollaborazioneDerivata | Reference inversa derivata | Non ownership; D22 |
| EventoCollegato | Reference | Facoltativo; D27 inbound |
| ContenutoEditorialeCollegato | Reference inversa / Editorial | Non ownership |
| ServizioProfessionaleCollegato | Reference | DV10 non consolidata |
| SnapshotRappresentanza | Snapshot | Da Appartenenze; non autorità corrente |
| Stati (sostanziale, rappresentazione, editoriale, pubblicazione, visibilità, verifica, temporale, candidatura) | Controlled List / proprietà assiali | Assi separati |
| Norma / procedura ufficiale / domanda esterna non registrata / erogazione / contratto / pagamento | **Excluded Concept** | — |
| CandidaturaCollaborazione / iscrizione Evento / richiesta Servizio | **Excluded Concept** (altri domini) | — |

---

## 7. Aggregate Root Opportunità

**Opportunità — unico Aggregate Root (A01).**

| Aspetto | Decisione |
|---|---|
| **Responsabilità** | Unità di consistenza della scheda di possibilità azionabile e del suo ciclo di vita di piattaforma |
| **Composizione** | Contiene E02: Fonte, Evidenza, Requisito, Verifica, eventuali CandidaturaOpportunità, Valutazione, Assegnazione; VO Beneficio, Finestra/Periodo, ProceduraAccesso; SnapshotRappresentanza; C05 locali |
| **Non contiene** | Identità Persona/Impresa; Appartenenza; Mercato; Evento; Collaborazione; articolo; Servizio |
| **Nascita** | Censimento/registrazione della scheda |
| **Fine logica** | Archiviazione (storico conservato; PF8) |

**Ampiezza dell'Aggregate.** L'AR è ampio ma non eccessivo: le E02 di processo sono opzionali (0..N); nessun altro dominio deve attraversare i loro dettagli interni. Concetti interni perché privi di autonomia oggi: Fonte, Evidenza, Requisito, Verifica. Concetti che *potrebbero* diventare AR in futuro (non oggi): CandidaturaOpportunità, Valutazione, Assegnazione, Fonte, Graduatoria (PC2, §41).

### 7.1 Entity dipendenti (E02)

| Entity (E02) | Responsabilità | Ciclo di vita proprio | Perché non AR |
|---|---|---|---|
| **Fonte** | Provenienza dichiarata dell'informazione sulla scheda | `active` → `replaced` / `unreachable` / `contradictory` / `historical` | Nessuna referenziabilità esterna individuale oggi; pattern locale PC11 |
| **Evidenza** | Riscontro a supporto di un fatto rappresentato (esistenza, scadenza, beneficio, requisito, promotore) | **Nessuno stato locale**; conservazione tramite retention delle istanze | Owned esclusivamente dall'Opportunità; non condivisa; ≠ Fonte; ≠ Verifica |
| **Requisito** | Condizione dichiarata/strutturata/verificabile | Dichiarato → Aggiornato / Superato | Non referenziato individualmente da altri domini |
| **Verifica** | Controllo su esistenza, fonte, rappresentazione, scadenze, ecc. | Avviata → Esito → Eventuale superamento | Locale alla scheda; assi PF10/PF11 |
| **CandidaturaOpportunità** | Registrazione (B) o processo governato (C) di accesso | Avviata → Presentata → … → Chiusura (variante C); stati dichiarati (B) | PC1 (b) negativo oggi; 0..N; PC2 aperto (§41) |
| **Valutazione** | Ammissibilità/valutazione su candidatura (interno o registrato) | Avviata → Esito | Subordinata a Candidatura/Opportunità; PC2 aperto |
| **Assegnazione** | Registrazione di beneficiario (interno o esterno registrato) | Registrata → Eventuale revoca | ≠ erogazione; nessuna referenziabilità inbound consolidata; PC2 aperto |

Sostituzione, contraddizione o superamento informativo appartengono allo stato della **Fonte** o all'asse **Verifica** (eventualmente PCa1), non a uno stato persistito dell'Evidenza.

---

## 8. Identità dell'Opportunità

Identità **interna stabile** autonoma rispetto a: URL fonte; codice bando; ID esterno; promotore; Evento; articolo; Collaborazione; procedura; finestra.

| Situazione | Trattamento |
|---|---|
| Aggiornamento stessi requisiti/scadenze | Stessa Opportunità; storicizzazione |
| Proroga | Stessa Opportunità; evento Prorogata |
| Nuova edizione sostanzialmente autonoma | Nuova Opportunità; riferimento facoltativo a programma comune |
| Nuova finestra sullo stesso programma | Valutare: stessa Opportunità con più finestre **oppure** nuova edizione — criterio: continuità di identità sostanziale dichiarata dalla fonte |
| Duplicati da fonti diverse | Questione aperta (deduplicazione semantica, non algoritmo tecnico) |
| Identificativi esterni multipli | VO/Reference su Fonte; non sostituiscono l'identità interna |

---

## 9. Opportunità sostanziale e rappresentazione governata

| Piano | Ownership | Ciclo |
|---|---|---|
| Sostanziale esterna | Autorità esterna | Istituzione/revoca ufficiale fuori dominio |
| Rappresentazione (= A01) | Opportunità | Censimento→…→archiviazione indipendente dalla sopravvivenza sostanziale |

**Decisione.** Non due identità fisiche. La distinzione è di **ownership e autorità**, non di doppio AR. La rappresentazione può nascere, restare bozza, essere verificata, pubblicata, aggiornata, diventare obsoleta, ritirata, archiviata anche se il fatto esterno continua o cessa.

---

## 10. Opportunità esterna e Opportunità interna

| Aspetto | Esterna | Interna |
|---|---|---|
| Autorità sostanziale | Esterna | Piattaforma / promotore interno |
| Entità comuni | A01, Fonte, Evidenza, Requisito, Beneficio, Modalità, Verifica, pubblicazione | Idem |
| Solo interna (tipiche) | — | CandidaturaInterna, Valutazione governata, Assegnazione governata |
| Registrazione esterna | CandidaturaEsternaRegistrata, esiti dichiarati, snapshot graduatoria | — |
| Invarianti | Non trasferire autorità istituzionale | Deve esistere soggetto responsabile interno |
| Eventi | Censimento, verifica scheda, pubblicazione | + candidatura/valutazione/assegnazione |

Stesso A01. PC2 aperto su eventuale futura separazione procedura/candidatura.

---

## 11. Origine dell'Opportunità

**Attributo controllato dell'Aggregate Root** (non Controlled List / catalogo / tabella separata): `external` | `internal`.

Obbligatoria. Condiziona autorità su requisiti ufficiali, candidature e assegnazioni. Non coincide con “chi ha segnalato”, “chi ha pubblicato”, né con la Fonte.

---

## 12. Tipologia e classificazioni

**C03/C05 — TipologiaOpportunità** (elenco controllato locale, multivalore ammesso): bando; incentivo; misura agevolativa; finanziamento agevolato; gara (accesso); formazione (accesso); partecipazione fiera; missione; premio; contributo; convenzione (solo adesione azionabile); accesso a servizi/spazi/reti; opportunità interna; altra azionabile.

**Non** gerarchia fisica di sottotipi con lifecycle diversi. **Non** voci di menu come sottotipi tecnici. Esclusi automatici: Evento puro; prodotto bancario commerciale; articolo; guida; convenzione non azionabile.

---

## 13. Fonte

**E02 — Fonte** (pattern locale PC11). Owned dall'Opportunità: `opportunity_id` obbligatorio; cancellazione dell'Opportunità elimina le Fonti (CASCADE).

**Attributi approvati (micro-review M3.1):**

| Attributo | Natura | Note |
|---|---|---|
| `authority` | Testo opzionale | Autorità dichiarata; non FK a Promotore/Persona/Impresa |
| `url` | Testo opzionale | Locator URL; forma alternativa di identificazione |
| `external_identifier` | Testo opzionale | Codice/atto/protocollo esterno; forma alternativa di identificazione |
| `reference_text` | Testo opzionale | Estremi/citazione testuale quando URL/id non bastano |
| `status` | Vocabolario chiuso | `active` \| `replaced` \| `unreachable` \| `contradictory` \| `historical` — stato **della Fonte**, non verifica né pubblicazione |
| `is_primary` | Boolean | Designa la Fonte principale della scheda (al più una) |
| `information_relation` | Opzionale | `primary` \| `secondary` — rapporto informativo; distinto da `is_primary` |
| `language_code` | Testo opzionale | Codice lingua del materiale; non FK a catalogo lingue |
| `version` | Testo opzionale | Etichetta di versione; non catena di versioning |
| `consulted_at` | Timestamp opzionale | Momento di consultazione; ≠ audit di riga |
| `created_at` / `updated_at` | Audit | Sistema |

`url`, `external_identifier` e `reference_text` sono forme alternative di identificazione della provenienza; una Fonte può esistere anche senza URL.

**Vincolo tecnico di coerenza (non chiave di business):** `UNIQUE (id, opportunity_id)` sulla Fonte. Serve esclusivamente come candidate key per la FK composta dell'Evidenza (stessa Opportunità). Non introduce una nuova identità della Fonte: la PK resta `id`.

**Esclusi (non attributi previsti):** catalogo/tipologia Fonte (`source_types` / `source_type`); attendibilità / `reliability` / `reliability_level`; estratti; esiti di verifica; storage di file/documenti/allegati.

**Non** Aggregate autonomo oggi. **Non** coincide con promotore/finanziatore/gestore/pubblicatore/segnalatore. **Non** è Evidenza, Documento memorizzato o File. Cardinalità: Opportunità 1 → 1..N Fonti (almeno una per pubblicabilità; principale designabile via `is_primary`).

---

## 14. Evidenza

**E02 — Evidenza** (Evidence object). Owned sempre dall'Opportunità: `opportunity_id` obbligatorio; cancellazione dell'Opportunità elimina le Evidenze (CASCADE).

**Attributi approvati (micro-review M3.2):**

| Attributo | Natura | Note |
|---|---|---|
| `id` | Identità | Stabile |
| `opportunity_id` | Owner | NOT NULL; CASCADE dall'Opportunità |
| `source_id` | Provenance opzionale | NULL ammesso; se valorizzato, la Fonte deve appartenere alla **stessa** Opportunità |
| `supports_aspect` | Classificazione opzionale | Al più un aspetto per istanza; NULL = aspetto non dichiarato |
| `extract` | Testo opzionale | Estratto fedele e minimale; non sintesi, nota editoriale, traduzione o interpretazione |
| `citation_locator` | Testo opzionale | Puntatore locale nella Fonte (pagina, sezione, articolo, paragrafo); non duplica la triade identificativa della Fonte |
| `created_at` / `updated_at` | Audit | Sistema |

**`supports_aspect` — valori ammessi (chiusi):** `existence` | `deadline` | `benefit` | `requirement` | `promoter`.

| Valore | Significato |
|---|---|
| `existence` | Riscontro sull'esistenza documentata dell'Opportunità come possibilità; ≠ pubblicazione piattaforma |
| `deadline` | Riscontro su data/finestra temporale dichiarata; ≠ lifecycle dell'Evidenza |
| `benefit` | Riscontro su beneficio/accesso dichiarato sulla scheda; nessuna FK a Benefici (M4) |
| `requirement` | Riscontro su requisito/condizione dichiarata sulla scheda; nessuna FK a Requisiti (M4) |
| `promoter` | Riscontro sul promotore dichiarato; nessuna FK/relazione a Promotori (M6) |

**Esclusi:** `outcome`; `update`; `other`; catalogo `evidence_types`; array; relazione M:N; default; stato locale (`status`, `active`/`superseded`, `is_superseded`, ecc.).

**Provenance e cancellazione.** Il collegamento Evidenza → Fonte è opzionale e enforceato con FK composta `(source_id, opportunity_id)` → Fonte `(id, opportunity_id)` (MATCH SIMPLE; non MATCH FULL; nessuna FK semplice parallela su solo `source_id`). Cancellazione fisica della Fonte: `ON DELETE SET NULL (source_id)` — l'Evidenza resta, `opportunity_id` resta invariato, solo `source_id` diventa NULL. Owner dell'Evidenza resta sempre l'Opportunità.

**Non** è Fonte, Documento, File, Allegato o Verifica. Non certifica verità né approvazione. Cardinalità: Opportunità 1 → 0..N Evidenze.

---

## 15. Promotore, gestore, finanziatore, segnalatore, pubblicatore e riferimenti interdominio (M6)

### 15.1 Scopo

Formalizzare i **riferimenti interdominio** dell'Opportunità (Migration Plan M6.1–M6.3; D14–D18; PF5), con precisione sufficiente alle migration SQL strutturali, senza anticipare candidature, pubblicazione/visibilità (M7), Eventi, Collaborazioni outbound, Organizzazioni o Servizi.

Risponde a: *Chi è collegato alla scheda, in quale ruolo, e con quali riferimenti opachi a Persone/Imprese/Appartenenze/Professionisti/Mercati?*

### 15.2 Principi trasversali M6

1. **PF5** — solo identità opaca (o etichetta esterna); nessun import di attributi, stati o lifecycle del soggetto referenziato.  
2. **Ownership** — i legami appartengono all'Opportunità; i soggetti restano dei loro domini.  
3. **Nessun dominio Organizzazioni** — enti non in piattaforma = `subject_kind = external`.  
4. **Candidato / beneficiario** — **non** modellati in M6 (rinviato con CandidaturaOpportunità / PC2); il Plan consente solo hook futuri senza strutture di candidatura → **esclusi** da queste tabelle.  
5. **Redazione** — ruolo di business (PL4), **non** riga di riferimento soggetto in M6.  
6. **Pubblicatore (identità)** ≠ **pubblicazione piattaforma** (M7).  
7. **Bozza** — nessuna obbligatorietà SQL di minimo un promotore; ≥1 promotore = gate di pubblicabilità **M7**.  
8. Target PostgreSQL **17.6.1**. Niente JSONB/EAV/enum nativi/SECURITY DEFINER/seed/policy/GRANT.

### 15.3 Panorama delle unit

| Unit | Nome migration | Oggetti creati |
|---|---|---|
| **M6.1** | `create_opportunity_party_references` | `public.opportunity_party_references` |
| **M6.2** | `create_opportunity_representation_utilizations` | `public.opportunity_representation_utilizations` |
| **M6.3** | `create_opportunity_context_references` | `public.opportunity_professional_references`; `public.opportunity_market_references`; `public.opportunity_sector_references` |

---

### 15.A M6.1 — Riferimenti di parte (Persone / Imprese / esterni)

#### 15.A.1 Natura

**R02 — riferimento di composizione** owned dall'AR (non E02 autonoma; non C05 del soggetto; non VO di solo testo quando esiste identità piattaforma).

Ogni riga dichiara: *questa Opportunità referenzia questo soggetto in questo ruolo*.

#### 15.A.2 Ownership e lifecycle

Owned da Opportunity. Non condivisa. Soft-delete AR non rimuove le righe; delete fisico AR → **CASCADE**.  
Lifecycle riga: insert / update / delete. Nessun `is_active`. Nessuna supersessione obbligatoria (diversa da M5).  
`id` uuid **solo tecnico**; nessuna FK inbound da altri domini verso la riga.

#### 15.A.3 Cardinalità

| Relazione | Strutturale DB | Note |
|---|---|---|
| Opportunità → riferimenti parte | **0..N** | Bozza senza parti ammissibile |
| Ruolo `promoter` | 0..N | ≥1 a pubblicabilità → **M7** |
| Ruolo `publisher` | **0..1** | Enforce UNIQUE parziale |
| Ruoli `funder`, `manager`, `implementer`, `signaler`, `related` | 0..N | — |

#### 15.A.4 Tabella

```text
public.opportunity_party_references
```

#### 15.A.5 Colonne

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | Identificatore di riga |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | Opportunità proprietaria |
| `role` | `text` | Sì | — | NOT NULL; CHECK chiuso | Ruolo del soggetto sulla scheda |
| `subject_kind` | `text` | Sì | — | NOT NULL; CHECK chiuso | Modalità di risoluzione del soggetto |
| `person_id` | `uuid` | No | — | NULL; FK → `profiles` | Riferimento opaco Persona (D14) |
| `business_id` | `uuid` | No | — | NULL; **senza FK in M6.1** | Riferimento opaco Impresa (D15); FK differita |
| `external_label` | `text` | No | — | NULL oppure anti-blank | Denominazione dichiarata del soggetto esterno |
| `external_identifier` | `text` | No | — | NULL oppure anti-blank | Identificatore esterno opaco (non CF/P.IVA strutturati obbligatori) |
| `sort_order` | `integer` | Sì | `0` | NOT NULL; `>= 0` | Ordine editoriale tra parti dello stesso ruolo |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | Creazione riga |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | Ultimo aggiornamento |

Nessun'altra colonna. **Non** introdurre: `is_active`; `status`; attributi di Persona/Impresa (nome, sede, ATECO, …); `candidate`/`beneficiary`; `published_at`; JSONB; `membership_id` (→ M6.2).

#### 15.A.6 Valori `role` (chiusi)

| Valore | Significato |
|---|---|
| `promoter` | Promotore sostanziale |
| `funder` | Ente finanziatore |
| `manager` | Ente gestore |
| `implementer` | Ente attuatore |
| `signaler` | Segnalatore / censitore |
| `publisher` | Pubblicatore della scheda (identità; ≠ asse pubblicazione M7) |
| `related` | Soggetto collegato dichiarato, senza ruolo più specifico |

#### 15.A.7 Valori `subject_kind` (chiusi)

| Valore | Risoluzione |
|---|---|
| `person` | `person_id` NOT NULL; `business_id` NULL; `external_label` NULL |
| `business` | `business_id` NOT NULL; `person_id` NULL |
| `external` | `external_label` NOT NULL; `person_id` NULL; `business_id` NULL |

`external_identifier` è sempre opzionale (solo con `subject_kind = external` o come supplemento; se valorizzato deve essere anti-blank). Per `person`/`business` deve essere NULL.

#### 15.A.8 CHECK obbligatori

1. `role in ('promoter','funder','manager','implementer','signaler','publisher','related')`.  
2. `subject_kind in ('person','business','external')`.  
3. Risoluzione esclusiva (XOR dei tre modi), equivalente a:

```text
(
  subject_kind = 'person'
  and person_id is not null
  and business_id is null
  and external_label is null
  and external_identifier is null
)
or (
  subject_kind = 'business'
  and business_id is not null
  and person_id is null
  and external_label is null
  and external_identifier is null
)
or (
  subject_kind = 'external'
  and external_label is not null
  and btrim(external_label) <> ''
  and person_id is null
  and business_id is null
  and (
    external_identifier is null
    or btrim(external_identifier) <> ''
  )
)
```

4. Ruoli Persona-only: se `role in ('signaler','publisher')` allora `subject_kind = 'person'`.  
5. `sort_order >= 0`.  
6. Anti-blank già incluso per `external_label` / `external_identifier` nel ramo external.

#### 15.A.9 FK e ON DELETE

| FK | Target | ON DELETE | Note |
|---|---|---|---|
| `opportunity_id` | `public.opportunities(id)` | **CASCADE** | Ownership |
| `person_id` | `public.profiles(id)` | **RESTRICT** | Opaco; non cancella la Persona; impedisce delete fisico profilo ancora referenziato |

**`business_id`:** colonna uuid **senza FK in M6.1** perché la tabella Impresa non è ancora nello schema. Semantica: identificatore stabile futuro dell'Impresa. Quando esisterà `public.businesses` (o nome AR Impresa approvato), una migration **additiva successiva** (fuori dal perimetro minimo M6.1 se non ancora disponibile) dovrà aggiungere:

```text
FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE RESTRICT
```

Fino ad allora, l'integrità di `business_id` è applicativa; i soggetti Impresa non ancora in piattaforma usano `subject_kind = 'external'`.

Nessuna FK verso: sources, evidences, requirements, benefits, access_modes, appartenenze, markets, collaborations, events, `auth.users` (solo via `profiles`).

#### 15.A.10 UNIQUE e indici

1. Indice non-unique: `opportunity_party_references_opportunity_id_idx` su `(opportunity_id)`.  
2. Indice non-unique: `opportunity_party_references_person_id_idx` su `(person_id)` WHERE `person_id IS NOT NULL`.  
3. Indice non-unique: `opportunity_party_references_business_id_idx` su `(business_id)` WHERE `business_id IS NOT NULL`.  
4. **Unicità publisher 0..1:**

```text
CREATE UNIQUE INDEX opportunity_party_references_one_publisher_uidx
  ON public.opportunity_party_references (opportunity_id)
  WHERE role = 'publisher';
```

5. **Unicità stesso soggetto+ruolo (Persona):**

```text
CREATE UNIQUE INDEX opportunity_party_references_person_role_uidx
  ON public.opportunity_party_references (opportunity_id, role, person_id)
  WHERE person_id IS NOT NULL;
```

6. **Unicità stesso soggetto+ruolo (Impresa):**

```text
CREATE UNIQUE INDEX opportunity_party_references_business_role_uidx
  ON public.opportunity_party_references (opportunity_id, role, business_id)
  WHERE business_id IS NOT NULL;
```

Nessuna UNIQUE su `external_label`. Nessuna UNIQUE che imponga un solo `promoter`.

#### 15.A.11 Trigger `updated_at`

`public.set_opportunity_party_references_updated_at()` — `SECURITY INVOKER`, `SET search_path = ''`, BEFORE UPDATE FOR EACH ROW; trigger `opportunity_party_references_set_updated_at`.

#### 15.A.12 RLS e privilegi

ENABLE RLS; nessuna policy; `REVOKE ALL` da `anon`, `authenticated`; nessun GRANT.

#### 15.A.13 Commenti SQL previsti

Commenti su tabella e su ogni colonna: VO/R02 di composizione; PF5; ruoli; `subject_kind`; publisher ≠ M7; `business_id` senza FK finché manca Impresa; assenza candidature; id tecnico; CASCADE da Opportunity.

#### 15.A.14 Seed

Nessun seed.

#### 15.A.15 Dipendenze M6.1

- `public.opportunities` (M1.1)  
- `public.profiles` (Persone)  
- `gen_random_uuid()`; PL/pgSQL  

Non dipende da M2–M5, M6.2, M6.3, M7, Imprese-in-DB, Appartenenze, Professionisti, Mercati.

#### 15.A.16 Scenari

| Scenario | Persistenza |
|---|---|
| Promotore Persona in piattaforma | `role=promoter`, `subject_kind=person`, `person_id` |
| Promotore Impresa in piattaforma (quando `business_id` noto) | `role=promoter`, `subject_kind=business`, `business_id` |
| Promotore ente esterno | `role=promoter`, `subject_kind=external`, `external_label` |
| Più co-promotori | Più righe `promoter` |
| Pubblicatore Persona | Al più una riga `publisher` |
| Pubblicatore per conto Impresa | Riga `publisher` Persona + utilizzo M6.2 |
| Bozza senza parti | Zero righe |
| Segnalatore | Solo `subject_kind=person` |

#### 15.A.17 Invarianti e accettazione M6.1

Esiste `opportunity_party_references` con colonne §15.A.5; CHECK risoluzione e ruoli; publisher 0..1; FK Opportunity CASCADE; FK profiles RESTRICT; `business_id` senza FK; RLS+REVOKE; nessun seed/policy; nessun candidato/beneficiario; nessun attributo soggetto copiato.

---

### 15.B M6.2 — Utilizzo Appartenenza / snapshot di rappresentanza

#### 15.B.1 Natura

**Snapshot di utilizzo (R02 + snapshot minimo)** owned dall'Opportunità: registra che una **Persona** referenziata sulla scheda agisce **per conto di un'Impresa** in virtù di un titolo di rappresentanza, senza creare/modificare Appartenenze e senza usare lo snapshot come autorità corrente (D17).

Non è Entity Appartenenza; non è verifica del titolo; non è Assi di Appartenenze.

#### 15.B.2 Ownership e lifecycle

Owned da Opportunity. Delete fisico AR → CASCADE sulle utilizzazioni. Delete della `party_reference` collegata → CASCADE.  
Lifecycle: insert / update / delete. Nessun `is_active`.

#### 15.B.3 Cardinalità

Opportunità → utilizzazioni **0..N**.  
Una stessa `party_reference` può avere **0..1** utilizzazione corrente tipica; strutturalmente ammesso 0..N storici se si conservano più snapshot (nessun minimo).

#### 15.B.4 Tabella

```text
public.opportunity_representation_utilizations
```

#### 15.B.5 Colonne

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | Identificatore di riga |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | Opportunità proprietaria |
| `party_reference_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | Riga M6.1 della Persona agente |
| `membership_id` | `uuid` | No | — | NULL; **senza FK in M6.2** | Id opaco Appartenenza (quando il dominio esisterà in DB) |
| `represented_business_id` | `uuid` | No | — | NULL; **senza FK in M6.2** | Impresa per cui si agisce (opaco) |
| `snapshot_role_label` | `text` | No | — | NULL oppure anti-blank | Titolo/ruolo dichiarato al momento dell'utilizzo (es. «legale rappresentante») |
| `snapshot_note` | `text` | No | — | NULL oppure anti-blank | Nota minima non autoritativa |
| `captured_at` | `timestamptz` | Sì | `now()` | NOT NULL | Momento di cattura dello snapshot |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | Creazione riga |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | Ultimo aggiornamento |

Nessun'altra colonna. **Non** introdurre: stato Appartenenza; validità corrente; esito verifica; copia di attributi Impresa/Persona; JSONB; autorità di accesso.

#### 15.B.6 CHECK

1. `snapshot_role_label IS NULL OR btrim(snapshot_role_label) <> ''`.  
2. `snapshot_note IS NULL OR btrim(snapshot_note) <> ''`.  
3. Ancora minima di contenuto: almeno uno tra `membership_id`, `represented_business_id`, `snapshot_role_label` è NOT NULL.

Invariante documentale (non trigger): `party_reference_id` deve puntare a una riga M6.1 con `subject_kind = 'person'` della **stessa** `opportunity_id`. Enforce applicativo; opzionale in futuro con trigger dedicato fuori da questa unit se necessario.

#### 15.B.7 FK e ON DELETE

| FK | Target | ON DELETE |
|---|---|---|
| `opportunity_id` | `public.opportunities(id)` | **CASCADE** |
| `party_reference_id` | `public.opportunity_party_references(id)` | **CASCADE** |

`membership_id` / `represented_business_id`: senza FK finché Appartenenze/Imprese non sono in schema; future FK additive con `ON DELETE SET NULL` (lo snapshot resta come fatto storico dichiarato anche se il fatto remoto sparisce — allineato a PF8/PF20 sul non-cancellare lo storico locale).

#### 15.B.8 Indici

- `opportunity_representation_utilizations_opportunity_id_idx` su `(opportunity_id)`.  
- `opportunity_representation_utilizations_party_reference_id_idx` su `(party_reference_id)`.  
- Nessuna UNIQUE obbligatoria su `party_reference_id` (ammessi più snapshot storici).

#### 15.B.9 Trigger / RLS / privilegi / seed

Funzione `public.set_opportunity_representation_utilizations_updated_at()` INVOKER `search_path=''`; trigger BEFORE UPDATE dedicato.  
ENABLE RLS; no policy; REVOKE anon/authenticated; no GRANT; no seed.

#### 15.B.10 Commenti SQL previsti

Snapshot ≠ autorità; D17 utilizzo; non crea Appartenenze; publisher-for-business tipico; id tecnici; FK differite.

#### 15.B.11 Dipendenze M6.2

- M6.1 (`opportunity_party_references`)  
- `public.opportunities`  

Non richiede tabelle Appartenenze/Imprese presenti. Se Appartenenze assente: unit comunque applicabile con soli campi snapshot testuali / uuid opachi.

#### 15.B.12 Scenari

| Scenario | Persistenza |
|---|---|
| Persona pubblica per Impresa | `publisher` in M6.1 + riga M6.2 con `represented_business_id` e/o `snapshot_role_label` |
| Titolo noto in piattaforma (futuro) | Anche `membership_id` valorizzato |
| Nessuna rappresentanza | Zero righe M6.2 |

#### 15.B.13 Accettazione M6.2

Tabella presente; FK a opportunities e party_references CASCADE; nessun possesso Appartenenza; snapshot non autoritativo; RLS+REVOKE; nessun seed.

---

### 15.C M6.3 — Riferimenti Professionisti, Mercati e settori (facoltativi)

#### 15.C.1 Natura

Tre composizioni R02 **facoltative** (D16, D18; riuso catalogo settori condiviso): arricchimento di contesto, non necessarie al nucleo azionabile. Unit **saltabile** se i target non servono; le tabelle si creano comunque in greenfield per schema stabile, ma restano vuote.

Professionista = qualificazione della Persona (non soggetto autonomo). Mercato/territorio = riferimento opaco o etichetta; **non** Presenza/Interesse/Esperienza. Settore = VO03 su `business_sectors` già esistente.

#### 15.C.2 Tabella professionali

```text
public.opportunity_professional_references
```

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | — |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | — |
| `person_id` | `uuid` | Sì | — | NOT NULL; FK → `profiles` RESTRICT | Persona la cui qualificazione è rilevante (D16) |
| `service_ref` | `uuid` | No | — | NULL; **senza FK** | Futuro ServizioProfessionale opaco; non ownership del servizio |
| `note` | `text` | No | — | NULL oppure anti-blank | Contesto dichiarato minimo |
| `sort_order` | `integer` | Sì | `0` | NOT NULL; `>= 0` | Ordine editoriale |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |

CHECK: `note` anti-blank se valorizzata; `sort_order >= 0`.  
UNIQUE: `(opportunity_id, person_id)` — una sola riga professionale per Persona per scheda.  
Indici: `(opportunity_id)`; `(person_id)`.  
Trigger updated_at dedicato INVOKER; RLS+REVOKE; no seed.

**Non** introdurre: verifica qualifiche; erogazione servizio; tabella Professionisti locale; candidature.

#### 15.C.3 Tabella mercati / territori

```text
public.opportunity_market_references
```

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | — |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | — |
| `market_id` | `uuid` | No | — | NULL; **senza FK in M6.3** | Id opaco Mercato (D18) quando il dominio esisterà in DB |
| `territory_label` | `text` | No | — | NULL oppure anti-blank | Etichetta territoriale/mercato dichiarata se manca id |
| `sort_order` | `integer` | Sì | `0` | NOT NULL; `>= 0` | Ordine editoriale |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |

CHECK:

```text
(
  market_id is not null
  and territory_label is null
)
or (
  market_id is null
  and territory_label is not null
  and btrim(territory_label) <> ''
)
```

UNIQUE parziale: `(opportunity_id, market_id)` WHERE `market_id IS NOT NULL`.  
UNIQUE parziale: `(opportunity_id, territory_label)` WHERE `territory_label IS NOT NULL` (etichette distinte per scheda).  
Indice `(opportunity_id)`. Trigger INVOKER; RLS+REVOKE; no seed.  
Future FK: `market_id → mercati` con `ON DELETE RESTRICT` quando disponibile.

**Non** introdurre: PresenzaInternazionale; InteresseMercato; EsperienzaInternazionale; catalogo geopolitico locale.

#### 15.C.4 Tabella settori (catalogo condiviso)

```text
public.opportunity_sector_references
```

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | — |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | — |
| `sector_id` | `bigint` | Sì | — | NOT NULL; FK → `business_sectors` | Settore di contesto (non Destinatario) |
| `sort_order` | `integer` | Sì | `0` | NOT NULL; `>= 0` | Ordine editoriale |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |

FK `sector_id` → `public.business_sectors(id)` **ON DELETE RESTRICT**.  
UNIQUE `(opportunity_id, sector_id)`.  
Indice `(opportunity_id)`. Trigger INVOKER; RLS+REVOKE; no seed.

Settore ≠ Destinatario (M4.1); ≠ Requisito (può restare testo in M4.2); qui è solo **contesto classificatorio** della scheda.

#### 15.C.5 Cardinalità M6.3

Tutte **0..N** strutturali; nessuna obbligatorietà SQL; completezza eventuale → M7 se il gate lo richiederà.

#### 15.C.6 Dipendenze M6.3

- `public.opportunities`  
- `public.profiles` (professional)  
- `public.business_sectors` (sector)  
- Mercati/Professionisti-as-table: **non** richiesti (uuid opachi / etichette)

#### 15.C.7 Migration M6.3

Una sola unit file:

```text
create_opportunity_context_references
```

Crea le tre tabelle §15.C.2–§15.C.4 nello stesso file, in ordine: professional → market → sector.

#### 15.C.8 Accettazione M6.3

Tre tabelle presenti; solo FK authorize verso opportunities, profiles, business_sectors; nessun possesso Mercati/Professionisti; RLS+REVOKE; no seed; unit omettibile operativamente (tabelle vuote) senza bloccare M7.

---

### 15.4 Confini con altre unit e domini

| Confine | Regola |
|---|---|
| M1 | Identità scheda; M6 aggiunge solo legami |
| M2 | ModalitàAccesso ≠ soggetto |
| M3 | Fonte ≠ Promotore ≠ Pubblicatore |
| M4 | Destinatario = categorie; ≠ elenco nominativo parti |
| M5 | Temporalità ≠ soggetto |
| M7 | Assi pubblicazione/visibilità/verifica; M6 fornisce al più l'identità del `publisher` |
| Candidature | Fuori M6 |
| Collaborazioni / Eventi | Nessun riferimento outbound |
| Editoriali | Nessuna integrazione |
| Organizzazioni / Servizi | Non creati; esterni via `external` |

### 15.5 Storicizzazione

- Parti (M6.1): mutabili per update/delete; **nessuna** history table in M6.  
- Utilizzi (M6.2): lo snapshot è il fatto storico minimo; più righe ammesse nel tempo.  
- Contesto (M6.3): update/delete; nessuna history table.

### 15.6 Anti-pattern esclusi (M6 intero)

JSONB/EAV; enum nativi; catalogo ruoli C05 separato (i ruoli sono CHECK); copia anagrafica soggetti; `is_active` su legami; status pubblicazione; workflow; candidature; FK Eventi/Collaborazioni; ownership Appartenenze; Presenza/Interesse mercato; Servizio come erogazione; minimo-uno SQL promotore; SECURITY DEFINER; policy; GRANT; seed.

### 15.7 Ordine di applicazione consigliato

```text
M6.1 create_opportunity_party_references
 → M6.2 create_opportunity_representation_utilizations
 → M6.3 create_opportunity_context_references
```

M6.2 richiede M6.1. M6.3 dipende solo da M1.1 (+ profiles/sectors) e può in teoria applicare dopo M1.1, ma l'ordine Plan resta M6.1→M6.2→M6.3. M7 non dipende strutturalmente da M6 (nucleo pubblicabile anche con M6 parziale/vuoto), coerente col Plan.

### 15.8 Criteri di accettazione complessivi M6

1. M6.1–M6.3 determinabili in DDL senza decisioni ulteriori.  
2. PF5 rispettato (nessun attributo soggetto persistito oltre label/id opachi).  
3. Publisher 0..1; promoter 0..N senza minimo SQL.  
4. Snapshot Appartenenza non autoritativo.  
5. Nessuna candidatura; nessuna pubblicazione M7; nessun Evento/Collaborazione outbound.  
6. FK differite documentate per Imprese/Appartenenze/Mercati/ServizioProfessionale.  
7. RLS enabled + REVOKE su ogni nuova tabella; nessuna policy; nessun seed.

---

## 16. Destinatari

### 16.1 Definizione fisica (M4.1)

**CategoriaDestinatario** (Destinatario dichiarato) è la classificazione del **pubblico potenzialmente interessato** a cui l'Opportunità si rivolge, come fatto dichiarato della scheda.

Risponde a: *A quale categoria generale di soggetti è rivolta l'Opportunità?*

| È | Non è |
|---|---|
| Criterio di pubblico dichiarato, multivalore | Elenco di soggetti reali (Persona, Impresa, Professionista, Appartenenza) |
| Caratteristica classificatoria owned dall'Opportunità | Candidatura, domanda, partecipazione |
| Compatibile con più categorie sulla stessa scheda | Prova di ammissibilità o eleggibilità verificata |
| Distinto da Promotore e da Beneficiario/Assegnatario | Requisito quantitativo, documentale, territoriale, economico, temporale |
| Derivato dal contenuto ufficiale della scheda/fonte | Profilazione di utenti piattaforma; inferenza automatica |

Distinzioni di processo (Logical §5): Destinatario dichiarato ≠ eleggibile potenziale ≠ eleggibile verificato ≠ candidato ≠ assegnatario/beneficiario. Solo il **Destinatario dichiarato** è oggetto di M4.1.

### 16.2 Destinatario vs Requisito

| | Destinatario (M4.1) | Requisito (M4.2) |
|---|---|---|
| Domanda | A chi è rivolta? | Quali condizioni specifiche? |
| Esempio | `micro_enterprises` (se in catalogo) o `enterprises` | «meno di 10 addetti e fatturato sotto soglia» |
| Forma | Voce di lista controllata + associazione | Entity E02 testuale ordinata (`statement`); strutturazione rinviata (§17) |

Settore, territorio, mercato, soglie, documenti, età, cittadinanza, sede, ATECO, ISEE **non** sono Destinatari: appartengono a Requisiti, Temporalità o riferimenti M5/M6.

### 16.3 Alternative di pattern valutate

| Alt. | Forma | Vantaggi | Svantaggi | Esito |
|---|---|---|---|---|
| **A** | Campo testo/array su `opportunities` | Semplice | Poca uniformità; ricerca debole; non C05 | Scartata |
| **B** | Lista controllata + ponte M:N | Allineata a Tipologia/ModalitàAccesso (M2); classificabile; senza soggetti | Vocabolario da governare | **Scelta** |
| **C** | Entity owned free-text per riga | Flessibile | Debole classificazione; rischio note=Requisiti | Scartata |
| **D** | Ibrido B + nota contestuale su ponte | Spiega la voce | Nota tende a duplicare Requisiti | Nota **esclusa** in M4.1 |

**Decisione.** Pattern **B**: Controlled List locale del dominio Opportunità (non condivisa) + associazione classificatoria M:N, stesso stile di M2.1/M2.2. Nessun campo descrittivo sul ponte in M4.1.

### 16.4 Naming

| Ruolo | Nome fisico | Motivo |
|---|---|---|
| Catalogo | `opportunity_audience_types` | «audience» = pubblico dichiarato; evita `beneficiaries`/`recipients`/`targets`/`users` |
| Ponte | `opportunity_audience_type_assignments` | Parallelo a `opportunity_type_assignments` |

Nome logico: **CategoriaDestinatario** / associazione Opportunità–CategoriaDestinatario.

### 16.5 Catalogo `opportunity_audience_types`

| Aspetto | Decisione |
|---|---|
| Pattern | C05 Controlled List locale (come `opportunity_types`) |
| Ownership | Dominio Opportunità; **non** catalogo condiviso |
| PK | `bigint` identity |
| Colonne | `code` (unique case-insensitive), `name`, `description` opzionale, `is_active` default true, `sort_order` ≥ 0, `created_at`, `updated_at` |
| Check code | formato `^[a-z][a-z0-9_]*$`; not-blank su code/name |
| Soft delete | No; disattivazione via `is_active` |
| RLS | ENABLE; nessuna policy in M4.1 |
| Privilegi | `REVOKE ALL` da `anon`, `authenticated` |
| Trigger | `updated_at` table-local, `SECURITY INVOKER`, `search_path = ''` |

### 16.6 Vocabolario iniziale (seed M4.1)

Seed **piccolo e stabile**, allineato a Logical §5. Codici inglesi immutabili; `name` italiano.

| code | name | Inclusione |
|---|---|---|
| `natural_persons` | Persone fisiche | Sì |
| `enterprises` | Imprese | Sì |
| `startups` | Startup | Sì |
| `cooperatives` | Cooperative | Sì |
| `professionals` | Professionisti | Sì (categoria; ≠ FK Profilo) |
| `aspiring_entrepreneurs` | Aspiranti imprenditori | Sì |
| `associations` | Associazioni | Sì |
| `third_sector_entities` | Enti del Terzo settore | Sì |
| `public_entities` | Enti pubblici | Sì |
| `other_audience` | Altra categoria dichiarata | Sì (residuale non enciclopedico) |

**Esclusi dal seed iniziale** (estendibili in seguito solo se dichiarati dalla fonte ufficiale, mai inferiti, mai legati a profili): `micro_enterprises` / PMI dimensionali; `students`; `unemployed_people`; `young_people`; `women`; `migrants`; `foreign_citizens`; `disabled_people`; `vulnerable_people`; `educational_institutions`; `research_entities`; `self_employed`; `large_enterprises`; ecc. Dimensioni d'impresa e condizioni soggettive sensibili, se soglie/documenti, → **Requisiti (M4.2)**; se mera etichetta di pubblico ufficiale, potranno entrare nel catalogo con migration additiva dedicata.

**Categorie sensibili.** Ogni voce di catalogo descrive solo il pubblico **dichiarato dall'Opportunità**. Non attribuisce caratteristiche agli utenti; non è dato personale; non genera FK; non si usa per profilazione o matching automatico in M4.1.

### 16.7 Associazione `opportunity_audience_type_assignments`

| Aspetto | Decisione |
|---|---|
| Colonne | `opportunity_id`, `opportunity_audience_type_id`, `created_at` |
| PK | `(opportunity_id, opportunity_audience_type_id)` — impedisce duplicati |
| FK Opportunità | `ON DELETE CASCADE` |
| FK catalogo | `ON DELETE RESTRICT` (disattivare con `is_active`, non delete fisico se usata) |
| ON UPDATE | nessuna azione speciale |
| Campi extra | **Nessuno** (`qualification_text` / note contestuali esclusi: rischio duplicare Requisiti) |
| Soft delete | No |
| `updated_at` | No (sostituzione delete/insert) |
| Indice extra | su `opportunity_audience_type_id` (lookup inverso + FK) |
| RLS / revoke | Come M2.2 |

### 16.8 Cardinalità

| Livello | Cardinalità | Enforce |
|---|---|---|
| Strutturale DB (M4.1) | Opportunità → CategoriaDestinatario **0..N** | Solo max N via PK; bozze senza destinatari ammesse |
| Concettuale pubblicabilità | **1..N** (≥1) | Gate M7 / completezza; **non** trigger in M4.1 |

### 16.9 Confini e divieti M4.1

**Nessuna FK** verso: `profiles`, persone, imprese, professionisti, appartenenze, `auth.users`, organizzazioni, mercati, territori, paesi.

**Non modellare:** beneficiario effettivo, assegnatario, candidato, partecipante, eleggibilità strutturata, requisiti, soglie, ATECO, fatturato, dipendenti, età, genere, cittadinanza, residenza, permesso di soggiorno, albi, graduatorie, verifiche, pubblicazione, workflow.

Promotore (§15) resta ruolo distinto; non condivide tabelle con Destinatari.

### 16.10 Conseguenze per la migration M4.1

Una sola migration futura dovrà: (1) creare `opportunity_audience_types` + seed; (2) creare `opportunity_audience_type_assignments`; (3) RLS+REVOKE; (4) trigger `updated_at` sul solo catalogo; (5) nessun ponte verso altri domini; (6) dipendere solo da `opportunities` (M1.1). Non implementare M4.2–M7.

---

## 17. Requisiti e criteri

### 17.1 Definizione e responsabilità

**Requisito** è la condizione di ammissibilità **dichiarata** nella scheda dell'Opportunità: enuncia ciò che deve essere soddisfatto (o la cui presenza esclude) per accedere alla possibilità, come fatto di rappresentazione della scheda.

Risponde a: *Quale condizione specifica deve essere soddisfatta?*

| È | Non è |
|---|---|
| Condizione dichiarata owned dall'Opportunità | Categoria di destinatario / pubblico (M4.1, §16) |
| Fatto della scheda, tipicamente più di uno | Beneficio dichiarato (M4.3, §18) |
| Distinto dalla modalità di accesso (C05, §19) | Criterio o asse di Verifica (M7, §24) |
| Distinto dall'applicazione a un soggetto | Esito di istruttoria, candidatura, valutazione |
| Espressione testuale ordinata in M4.2 | Motore di regole, matching, scoring, EAV |

Piani concettuali (Logical §6; Thesis §24), **non fusi** in M4.2: requisito **dichiarato** (oggetto di questa sezione); requisito strutturato (rinviato, §17.20); requisito verificabile / Verifica di rappresentazione (M7); requisito applicato a candidatura interna (processo, fuori M4.2).

### 17.2 Natura E02 e ownership

**E02 — Requisito.** Entity dipendente dell'Aggregate Root Opportunità (§4, §7.1).

| Aspetto | Decisione |
|---|---|
| Perché E02 | Identità stabile per riga; più istanze per Opportunità; ciclo dichiarato → aggiornato / non attivo; non referenziato individualmente da altri domini |
| Perché non VO | Non è un valore senza identità incorporato nell'AR |
| Perché non C05 | Non è un vocabolario riusabile di categorie; il contenuto è specifico della scheda |
| Perché non testo sull'AR | Cardinalità 0..N, ordinamento e mutazione per voce |

Ogni requisito appartiene a **una sola** Opportunità e **non** è condiviso tra Opportunità diverse. Soft-delete dell'AR (`deleted_at`) non rimuove le righe; la cancellazione fisica dell'Opportunità elimina i requisiti (CASCADE, §17.9).

### 17.3 Cardinalità

| Livello | Cardinalità | Enforce |
|---|---|---|
| Strutturale DB (M4.2) | Opportunità → Requisito **0..N** | Nessun minimo al INSERT; bozze senza requisiti ammesse |
| Tipica / nucleo concettuale | 1..N | Logical §3: condizioni anche minime |
| Pubblicabilità | Eventuale ≥1 o completezza condizioni | **Gate M7**; **non** imposto nel database in M4.2 |

Allineamento a §29: Opportunità → Requisito **0..N** (tipico 1..N).

### 17.4 Modello testuale

M4.2 adotta **requisiti testuali ordinati**.

Il contenuto della condizione è rappresentato da **un solo** attributo obbligatorio:

| Attributo | Ruolo |
|---|---|
| `statement` | Enunciazione integrale della condizione dichiarata («testo della scheda», Logical §6) |

**Non** introdurre: `title`; `description`; un secondo campo `text`; `label`; `name`; `summary`.

Motivazione: i documenti fondativi non autorizzano la scomposizione titolo + descrizione; il requisito dichiarato è il testo della condizione. `name`/`description` appartengono al pattern C05 dei cataloghi (§16), non all'istanza E02 di condizione.

### 17.5 Classificazione operativa

Attributo `kind` con valori **chiusi**:

| Valore | Significato |
|---|---|
| `mandatory` | Condizione obbligatoria: l'assenza esclude l'accesso (Logical §6) |
| `preferential` | Criterio preferenziale: favorisce senza escludere |
| `exclusion` | Condizione di esclusione: la presenza esclude |

**Non** utilizzare: `is_mandatory` (booleano insufficiente); `requirement_type` dimensionale; cataloghi di tipologie; Controlled List `opportunity_requirement_types`.

Classificazioni territoriali, economiche, settoriali, dimensionali, professionali, amministrative o documentali **non** sono persistite come tipologia in M4.2: restano espresse nello `statement` (o in future strutturazioni additive, §17.20).

### 17.6 Modello fisico

Tabella fisica raccomandata (M4.2):

```text
public.opportunity_requirements
```

Una sola tabella E02; nessun catalogo; nessun ponte verso Destinatari o altri domini.

### 17.7 Attributi

| Attributo | Significato | Obbl. | Tipo | Default | Vincoli | Motivazione |
|---|---|---|---|---|---|---|
| `id` | Identità stabile interna della riga Requisito | Sì | `uuid` PK | `gen_random_uuid()` | PK | Identità E02 indipendente dal testo; allineata a Fonte/Evidenza |
| `opportunity_id` | Opportunità proprietaria (AR) | Sì | `uuid` | — | NOT NULL; FK | Ownership esclusiva |
| `statement` | Enunciazione integrale della condizione dichiarata | Sì | `text` | — | NOT NULL; anti-blank | Unico contenuto testuale autorizzato |
| `kind` | Classificazione operativa chiusa | Sì | `text` | — | NOT NULL; CHECK chiuso | Obbligatorio / preferenziale / esclusione |
| `is_active` | Condizione corrente vs storicamente presente ma non corrente | Sì | `boolean` | `true` | NOT NULL | Disattivazione senza delete; ≠ verifica |
| `sort_order` | Ordine di presentazione amministrativa sulla scheda | Sì | `integer` | `0` | NOT NULL; `>= 0` | Requisiti testuali ordinati |
| `created_at` | Creazione riga | Sì | `timestamptz` | `now()` | NOT NULL | Pattern E02 dominio |
| `updated_at` | Ultimo aggiornamento riga | Sì | `timestamptz` | `now()` | NOT NULL | Mantenuto da trigger (§17.12) |

Nessun altro attributo in M4.2.

### 17.8 Vincoli

- Primary key su `id`.
- Foreign key su `opportunity_id` (§17.9).
- CHECK anti-stringa-vuota su `statement`: `length(trim(statement)) > 0`.
- CHECK su `kind`: solo `mandatory` | `preferential` | `exclusion`.
- CHECK `sort_order >= 0`.
- **Nessuna** UNIQUE su `statement`.
- **Nessuna** UNIQUE su `(opportunity_id, statement)`.
- Duplicati testuali **tecnicamente ammessi** (stessa formulazione ripetuta o da fonti diverse).
- **Nessun** codice naturale (`code`) sul Requisito.

### 17.9 PK, FK e cancellazione

| Relazione | Specifica |
|---|---|
| PK | `id` |
| FK | `opportunity_id` → `public.opportunities(id)` |
| ON DELETE | **CASCADE** (delete fisico dell'Opportunità elimina i requisiti owned) |
| Soft-delete AR | `deleted_at` sull'Opportunità **non** rimuove le righe requisito |

**Unica FK ammessa** in M4.2: verso `public.opportunities`.

**FK vietate** verso: `profiles`; imprese/businesses; memberships/appartenenze; professionals; markets; collaborations; `languages`; `business_sectors`; `auth.users`; `opportunity_audience_types`; `opportunity_audience_type_assignments`; `opportunity_sources`; `opportunity_evidences`.

Nessun ponte Requisito–Destinatario. Il requisito vale per l'**intera** Opportunità nella prima implementazione.

### 17.10 Indici

Indice **necessario** (ownership e recupero per scheda):

```text
opportunity_requirements_opportunity_id_idx
on public.opportunity_requirements (opportunity_id)
```

Ordinamento applicativo tipico: `opportunity_id`, poi `is_active`, poi `sort_order`. Eventuali indici compositi di supporto a tale ordinamento sono **valutabili** in implementazione; **non** sono obbligatori in questo mapping e **non** deve esistere un indice UNIQUE sull'ordinamento.

### 17.11 Lifecycle

Stati operativi ammessi in M4.2 (senza colonna di stato di processo):

| Situazione | Come si rappresenta |
|---|---|
| Dichiarato | Riga creata, `is_active = true` |
| Aggiornato | Mutazione di `statement` / `kind` / `sort_order`; `updated_at` avanza |
| Non attivo | `is_active = false` — condizione storicamente presente ma non corrente |

**Non** introdurre in M4.2: `verification_status`; `publication_status`; `review_status`; `superseded_at`; `deleted_at` sul requisito; `valid_from`; `valid_to`.

`is_active` **non** è stato di verifica, pubblicazione o istruttoria.

### 17.12 Trigger e aggiornamento timestamp

Funzione/trigger table-local su `opportunity_requirements`, coerente con Fonte, Evidenza e cataloghi:

- `BEFORE UPDATE` `FOR EACH ROW`;
- aggiorna solo `updated_at`;
- `SECURITY INVOKER`;
- `SET search_path = ''`.

Nessun trigger di minimo-uno, pubblicabilità o cascade applicativo oltre all'FK.

### 17.13 RLS e privilegi

Coerente con M1–M4.1:

- Row Level Security **ENABLED**;
- **nessuna** policy in M4.2;
- `REVOKE ALL` da `anon` e da `authenticated`;
- nessun grant applicativo aggiuntivo;
- nessun workflow editoriale anticipato.

### 17.14 Seed

**Nessun seed.** I requisiti sono dati di istanza dell'Opportunità, non valori di catalogo controllato.

### 17.15 Dipendenze

| Dipendenza | Natura |
|---|---|
| `public.opportunities` (M1.1) | **Tecnica obbligatoria** (FK) |
| M4.1 Destinatari | **Non** dipendenza tecnica della tabella Requisiti |
| M3 Fonti/Evidenze | Nessuna FK; Evidenza può usare aspect `requirement` senza riferire la riga (§14) |
| Altri domini (D14–D18) | Nessuna FK in M4.2; riferimenti opachi strutturati → fasi successive |

### 17.16 Confini con Destinatari

| | Destinatario (§16, M4.1) | Requisito (M4.2) |
|---|---|---|
| Domanda | A chi è rivolta? | Quale condizione deve essere soddisfatta? |
| Forma | C05 + ponte M:N | E02 testuale owned |
| Esempio | `enterprises` | «meno di 10 addetti e fatturato sotto soglia» |

Settore, territorio, soglie, documenti, età, ecc. **non** sono Destinatari: restano nello `statement` (o Temporalità / riferimenti M5–M6 quando strutturati). Nessun ponte requisito↔audience in M4.2.

### 17.17 Confini con Benefici

Beneficio (§18, M4.3) risponde a *cosa si ottiene*. Requisito ≠ beneficio; ≠ erogazione; ≠ importo del beneficio. Nessuna colonna di beneficio in M4.2.

### 17.18 Confini con Temporalità

Temporalità (§28, M5) risponde a *quando* (finestre, scadenze, proroghe). Un vincolo temporale di ammissibilità dichiarato come condizione resta testo in `statement` in M4.2; finestre strutturali appartengono a M5.

### 17.19 Confini con Verifica

Verifica (§24, M7) risponde a *quanto è affidabile o verificata la rappresentazione* (assi PF10/PF11), incluso l'asse sui requisiti **dichiarati**.

M4.2 **non** anticipa: esito di verifica; stato verificato/non verificato; workflow redazionale di controllo; prova documentale strutturata; ammissibilità del candidato. Candidatura e istruttoria **applicano** il requisito a un soggetto e non appartengono a M4.2.

### 17.20 Requisiti strutturati rinviati

**Fuori da M4.2** (richiedono decisione architetturale separata, migration additive):

`value_type`; `operator`; `threshold_value`; `minimum_value`; `maximum_value`; `numeric_value`; `boolean_value`; `date_value`; `unit`; `currency`; `structured_value`; JSONB; EAV; espressioni di regole; formule; matching automatico.

Soglie, età, fatturato, numero di dipendenti, territorio, settore, forma giuridica, documenti e qualifiche restano espressi nello **`statement`**. Nessun possesso di fatti di Persone, Imprese, Professionisti, Appartenenze o Mercati.

### 17.21 Migration prevista

Una sola migration unit:

```text
create_opportunity_requirements
```

(dipendenza tecnica: `public.opportunities`). Crea la tabella, vincoli, indice su `opportunity_id`, funzione/trigger `updated_at`, RLS+REVOKE. Nessun seed. Non implementa M4.3–M7. M4.1 non è prerequisito tecnico.

### 17.22 Decisioni vietate o rinviate

| Vietato / rinviato in M4.2 | Destinazione |
|---|---|
| `title` / `description` / dualità testuale | Vietato (modello a `statement` unico) |
| Controlled List tipologie / tipi dimensionali | Rinviato / vietato come C05 unica |
| Motore regole, JSONB, EAV, soglie strutturate | Rinviato (§17.20) |
| Ponte requisito–destinatario | Rinviato (fuori prima implementazione) |
| FK interdominio | M6 o decision dedicata |
| Verifica, pubblicazione, minimo-uno DB | M7 |
| Candidatura, valutazione, ammissibilità applicata | Fuori M4.2 |
| Benefici | M4.3 |
| Temporalità strutturale | M5 |

### 17.23 Sintesi conclusiva

M4.2 formalizza il Requisito come **E02 testuale ordinato** owned dall'Opportunità: tabella `opportunity_requirements` con `statement` unico, `kind` operativo chiuso (`mandatory` \| `preferential` \| `exclusion`), `is_active`, `sort_order`, timestamps; cardinalità strutturale **0..N**; CASCADE da Opportunità; nessuna FK diversa dall'AR; RLS senza policy; nessun seed; nessun motore di regole. Destinatario, Beneficio, Temporalità, Verifica e candidatura restano concetti distinti e fuori dallo scope di questa unit.

---

## 18. Benefici

### 18.1 Scopo

Formalizzare il Beneficio dichiarato dell'Opportunità come Value Object di composizione (M4.3), con precisione sufficiente alla futura migration `create_opportunity_benefits`, senza anticipare M5–M7, candidature, concessioni o un motore finanziario.

### 18.2 Definizione

**Beneficio** è ciò che l'Opportunità **dichiara** di offrire o rendere accessibile sulla scheda.

Risponde a: *Cosa si ottiene o a cosa si può accedere?*

Può descrivere, in forma **testuale** nello `statement`: contributi; agevolazioni; finanziamenti; garanzie; voucher; premi; servizi (come beneficio dichiarato, non possesso del servizio); formazione; consulenza; mentoring; visibilità; networking; accesso a mercati, reti, spazi o strumenti; altre utilità monetarie o non monetarie.

| È | Non è |
|---|---|
| Beneficio o accesso **dichiarato** sulla scheda | Beneficio richiesto, assegnato, concesso, erogato o fruito |
| Fatto di rappresentazione owned dall'Opportunità | Importo effettivamente riconosciuto; rendicontazione; spesa sostenuta |
| Distinto da Destinatario, Requisito, ModalitàAccesso | Esito di candidatura; risultato economico realmente conseguito |
| Compatibile con più voci sulla stessa scheda | Motore finanziario, scoring, regola computabile |

### 18.3 Natura architetturale

**VO — Beneficio** (Value Object di composizione dell'AR Opportunità; Thesis §24; Logical §2/§7; PC1 §4.2).

| Non è | Motivo |
|---|---|
| Entity E02 | Nessuna referenziabilità esterna individuale; nessun lifecycle di dominio autonomo (PC1) |
| Controlled List / catalogo riusabile | Contenuto specifico della scheda, non vocabolario condiviso |
| Processo / candidatura / concessione / erogazione | Fuori ownership del VO dichiarato |

### 18.4 Ownership

Ogni Beneficio appartiene a **una sola** Opportunità. **Non** è condiviso tra Opportunità. Soft-delete dell'AR (`deleted_at`) non rimuove le righe di composizione; la cancellazione fisica dell'Opportunità elimina i benefici (**CASCADE**, §18.22).

### 18.5 Identità tecnica e assenza di identità di dominio

La persistenza usa un `id` uuid come **chiave tecnica** di riga.

L'`id` **non** costituisce identità autonoma di dominio: non autorizza referenziabilità da altri domini, né FK inbound verso la singola riga di beneficio (coerente con Evidenza `supports_aspect = benefit` senza FK a Benefici, §14).

### 18.6 Cardinalità concettuale e strutturale

| Livello | Cardinalità | Enforce |
|---|---|---|
| Concettuale / pubblicabile | **1..N** (≥1 beneficio o accesso) | Nucleo azionabile; completezza |
| Strutturale DB (M4.3) | **0..N** | Nessun minimo SQL; bozze senza benefici ammesse |
| Pubblicabilità | ≥1 | **Gate futuro (M7)**; non vincolo in M4.3 |

Allineamento a §29: strutturale 0..N; obbligo 1..N fuori dal DB di M4.3.

### 18.7 Modello di persistenza

Composizione multivalore: **più** benefici testuali ordinati per Opportunità.

**Non** incorporare un unico campo `benefit` su `public.opportunities` (contraddirebbe Logical «più benefici» e Physical 1..N).

### 18.8 Tabella fisica

```text
public.opportunity_benefits
```

Una sola tabella di composizione VO; nessun catalogo; nessun ponte.

### 18.9 Colonne

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | Identificatore di riga; non identità di dominio |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | Opportunità proprietaria |
| `statement` | `text` | Sì | — | NOT NULL; anti-blank | Enunciazione integrale del beneficio dichiarato |
| `sort_order` | `integer` | Sì | `0` | NOT NULL; `>= 0` | Ordine editoriale di presentazione |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | Creazione riga |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | Ultimo aggiornamento (trigger §18.26) |

Nessun'altra colonna in M4.3.

### 18.10 Decisione su `is_active`

**Escluso da M4.3.**

Thesis, Logical, Physical preesistente (§18 precedente) e Migration Plan **non** autorizzano esplicitamente la disattivazione individuale di un beneficio mantenuto nella composizione. L'analogia con `is_active` dei Requisiti (E02, §17) **non** è sufficiente: il Beneficio è VO, non Entity dipendente con lifecycle Dichiarato→Non attivo.

Lifecycle ammesso in M4.3: **inserimento**, **aggiornamento** dello `statement`/`sort_order`, **eliminazione** della riga. Nessuno stato attivo/inattivo persistito.

### 18.11 Statement testuale unico

`statement` rappresenta **integralmente** il beneficio dichiarato («testo della scheda»).

**Non** introdurre: `title`; `description`; `label`; `name`; `summary`; dualità titolo+corpo.

Motivazione: stessa regola documentale già chiusa per M4.2 — i fondativi non autorizzano la scomposizione; il VO è descritto dal proprio contenuto dichiarato.

### 18.12 Ordinamento

`sort_order` governa l'ordine editoriale di presentazione (valori minori prima). **Non** UNIQUE; **non** priorità, scoring o identità.

### 18.13 Strutturazione economica rinviata

Importi, percentuali, massimali, valute, unità e altre proprietà economiche possono comparire **nello `statement`** come dichiarati dalla fonte.

**Non** diventano colonne strutturate in M4.3. Motivi: non tutti i benefici sono monetari; modelli economici eterogenei; Thesis (Q aperta su strutturato vs descrittivo) e domain-model §14 tengono la questione aperta; colonne premature genererebbero nullable incoerenti; M4.3 **non** è un motore finanziario.

«Quantitativo/qualitativo/condizionato/stimato» (concetto Physical) resta esprimibile nel testo; non autorizza DDL economico in questa unit.

### 18.14 Tipologie rinviate

**Non** creare: `opportunity_benefit_types`; cataloghi; enum PostgreSQL; CHECK tipologici; seed tipologici.

Le categorie del Logical (§7) e gli esempi (contributo, formazione, visibilità, servizio dichiarato, …) descrivono **possibili contenuti**, non una tassonomia fisica chiusa. La tipologia resta incorporata semanticamente nello `statement`.

### 18.15 Confine con Destinatari

Destinatari (§16, M4.1) rispondono a *a chi è rivolta*. Beneficio risponde a *cosa si offre*. Nessun ponte beneficio↔audience.

### 18.16 Confine con Requisiti

Requisiti (§17, M4.2) rispondono a *quali condizioni*. Beneficio ≠ requisito; ≠ importo usato come soglia di ammissibilità (quella resta nello `statement` del Requisito se condizione).

### 18.17 Confine con Modalità di accesso

ModalitàAccesso (§19.A, M2) classifica il *tipo* di accesso. ProceduraAccesso (§19.B, M4.4) descrive *come procedere* (istruzioni/link). «Accesso a reti/mercati/spazi» come **utilità dichiarata** è Beneficio, non procedura.

### 18.18 Confine con Temporalità

Temporalità (§28, M5) risponde a *quando*. Durata/periodicità del beneficio, se dichiarate, restano nello `statement` in M4.3; finestre strutturali → M5.

### 18.19 Confine con Fonti ed Evidenze

Fonti (§13) = provenienza della rappresentazione. Evidenze (§14) possono usare `supports_aspect = benefit` **senza** FK verso `opportunity_benefits`. Nessuna FK Beneficio→Fonte/Evidenza in M4.3.

### 18.20 Confine con Verifica

Verifica (§24, M7) riguarda affidabilità/completezza della scheda (incluso asse beneficio dichiarato). **Nessuna** colonna di verifica sulla tabella Benefici in M4.3.

### 18.21 Confine con candidature, concessioni ed erogazioni

Candidature, ammissibilità applicata, concessioni, assegnazioni, erogazioni e fruizione riguardano soggetti e processi — **fuori da M4.3**. Beneficio dichiarato ≠ beneficio ottenuto.

### 18.22 PK, FK e ON DELETE

| Aspetto | Decisione |
|---|---|
| PK | `id` (tecnica) |
| FK | Solo `opportunity_id` → `public.opportunities(id)` |
| ON DELETE | **CASCADE** |
| Soft-delete AR | Non rimuove le righe beneficio |

**FK assenti** verso: `opportunity_sources`; `opportunity_evidences`; `opportunity_requirements`; `opportunity_audience_types`; `profiles`; businesses; memberships; professionals; markets; collaborations; `languages`; `business_sectors`; `auth.users`.

Dipendenza tecnica M4.3: solo `public.opportunities`.

### 18.23 Vincoli

- PK su `id`.
- `opportunity_id` NOT NULL + FK CASCADE.
- `statement` NOT NULL + CHECK anti-stringa-vuota (`btrim(statement) <> ''` o equivalente).
- `sort_order` NOT NULL DEFAULT 0 + CHECK `>= 0`.
- `created_at` / `updated_at` NOT NULL DEFAULT `now()`.

Nessun vincolo economico, tipologico, di minimo-uno, o tra Benefici e Destinatari/Requisiti.

### 18.24 Duplicati e assenza di UNIQUE

- **Nessuna** UNIQUE su `statement`.
- **Nessuna** UNIQUE su `(opportunity_id, statement)`.
- **Nessuna** UNIQUE su `(opportunity_id, sort_order)`.
- Duplicati testuali **tecnicamente ammessi**.

### 18.25 Indici

Solo:

```text
opportunity_benefits_opportunity_id_idx
on public.opportunity_benefits (opportunity_id)
```

Nessun altro indice obbligatorio in M4.3.

### 18.26 Trigger `updated_at`

Pattern dedicato (come Fonte/Evidenza/Requisiti):

- funzione `public.set_opportunity_benefits_updated_at()`;
- `RETURNS trigger`; `LANGUAGE plpgsql`; `SECURITY INVOKER`; `SET search_path = ''`;
- `NEW.updated_at = now()`; `RETURN NEW`;
- trigger `BEFORE UPDATE` `FOR EACH ROW` su `opportunity_benefits`.

Il nome esatto in SQL potrà coincidere con questo pattern nella migration.

### 18.27 RLS, policy e privilegi

Coerente con M1–M4.2:

- `ENABLE ROW LEVEL SECURITY`;
- **nessuna** policy in M4.3;
- `REVOKE ALL` da `anon` e `authenticated`;
- nessun GRANT applicativo;
- nessun workflow editoriale anticipato.

### 18.28 Seed

**Nessun seed.** I benefici sono dati di istanza delle singole Opportunità.

### 18.29 Suddivisione della migration

Una sola migration unit:

```text
create_opportunity_benefits
```

Crea: tabella; vincoli; indice; funzione/trigger `updated_at`; RLS; REVOKE; commenti SQL. Nessuna migration catalogo o seed. Non implementa M5–M7.

### 18.30 Compatibilità PostgreSQL

Target **PostgreSQL 17.6.1**. Niente enum PostgreSQL; JSONB; EAV; estensioni ulteriori; SQL dinamico non necessario.

### 18.31 Decisioni rinviate

| Rinviato | Destinazione |
|---|---|
| Colonne importo/valuta/percentuale/unità | Estensione economica futura (questione aperta) |
| Tipologie persistite / C05 / CHECK tipologici | Solo se decisione architetturale dedicata |
| `is_active` o soft-state sul VO | Non autorizzato oggi |
| Minimo-uno in DB | Gate pubblicabilità M7 |
| FK interdominio; legami a Requisiti/Destinatari | Fuori M4.3 |
| Candidatura, concessione, erogazione | Processi successivi / esterni |

### 18.32 Invarianti fisiche

1. Ogni Beneficio appartiene a una sola Opportunità.  
2. Nessun Beneficio è condiviso.  
3. Il Beneficio è Value Object, non Entity E02.  
4. L'`id` è esclusivamente tecnico.  
5. Nessun altro dominio referenzia il singolo Beneficio.  
6. Il contenuto persistito è un solo `statement`.  
7. Non esistono `title` e `description`.  
8. Non esistono tipologie persistite in M4.3.  
9. Non esistono importi o percentuali strutturati in M4.3.  
10. La cardinalità DB è **0..N**.  
11. L'obbligo **1..N** appartiene alla pubblicabilità futura.  
12. L'unica FK è verso `opportunities`.  
13. Delete fisico dell'Opportunità → **CASCADE**.  
14. Nessun seed.  
15. Una sola migration.  
16. Nessuna FK verso Fonte o Evidenza.  
17. Nessuna candidatura, concessione o erogazione.  
18. Nessun JSONB.  
19. Nessun EAV.  
20. Nessun motore finanziario.  
21. `is_active` **assente**, per mancanza di fondamento documentale esplicito sul VO Beneficio.

### 18.33 Criteri di accettazione

M4.3 è fisicamente accettabile quando: esiste `opportunity_benefits` con le sole colonne §18.9; `statement` anti-blank; ordinamento non unique; CASCADE da Opportunità; solo indice su `opportunity_id`; trigger INVOKER; RLS senza policy + REVOKE; assenza di cataloghi/seed/importi/tipi/`is_active`; nessuna FK diversa dall'AR; bozza senza benefici inseribile; pubblicabilità ≥1 non enforceata in SQL.

---

## 19. Modalità e procedura di accesso

Questa sezione distingue due concetti già presenti nel mapping e nel Migration Plan:

| Concetto | Forma | Unit | Domanda |
|---|---|---|---|
| **ModalitàAccesso** | C05 + ponte M:N | **M2.1 / M2.2** (già implementata) | *Che tipo di accesso è dichiarato?* |
| **ProceduraAccesso** | VO dichiarativo | **M4.4** | *Come procedere operativamente sulla scheda?* |

---

### 19.A ModalitàAccesso (M2 — invariata)

**C05 — ModalitàAccesso** (elenco controllato locale): candidatura; domanda; adesione; iscrizione (≠ Evento); prenotazione; manifestazione interesse formale; accesso diretto; partecipazione libera; procedura esterna; procedura interna; invito; selezione.

Tabelle fisiche già definite in M2: `opportunity_access_modes`, `opportunity_access_mode_assignments`.  
**M4.4 non le modifica e non le duplica.**

| Modalità (esempi) | Implica CandidaturaOpportunità? |
|---|---|
| Accesso diretto / partecipazione libera / solo link esterno | No (scenario A) |
| Candidatura/domanda con registrazione | Sì, scenario B o C |
| Iscrizione Evento | No — dominio Eventi |
| Manifestazione Collaborazioni | No — Collaborazioni |
| Richiesta Servizio | No — futuro Servizi / Professionisti |

Cardinalità: strutturale **0..N**; concettuale/pubblicabile **1..N** (gate M7; non enforceato in M2.2).

---

### 19.B ProceduraAccesso (M4.4)

#### 19.1 Scopo

Formalizzare la **ProceduraAccesso** dichiarata come Value Object owned dall'Opportunità (Migration Plan M4.4), con precisione sufficiente alla migration `create_opportunity_access_procedure`, senza anticipare candidature, Temporalità (M5), Verifica (M7) o Contatti strutturati.

#### 19.2 Definizione

**ProceduraAccesso** è la descrizione dichiarata, sulla scheda, di *come* il potenziale interessato può procedere per richiedere, utilizzare, prenotare o partecipare all'Opportunità: istruzioni operative e, quando pertinente, canale/link operativo.

Risponde a: *Come si procede concretamente?*

| È | Non è |
|---|---|
| Istruzioni e canale **dichiarati** sulla scheda | ModalitàAccesso (classificazione C05, M2) |
| Fatto di rappresentazione owned dall'Opportunità | Candidatura, domanda o prenotazione **effettive** |
| Distinto dall'URL di Fonte informativa (M3.1) | Pratica, protocollo, istruttoria, upload |
| Compatibile con scenario esterno «scheda + link» | Possesso della procedura ufficiale esterna; workflow applicativo |

#### 19.3 Natura architetturale

**VO — ProceduraAccesso** (Value Object dichiarativo di composizione; Thesis §24; Logical §7; PC1: non referenziabile individualmente → non E02).

| Non è | Motivo |
|---|---|
| Entity E02 | Nessuna referenziabilità inbound; nessun lifecycle di dominio autonomo |
| Controlled List / catalogo | Non è vocabolario riusabile (quello è ModalitàAccesso) |
| Candidatura / pratica / erogazione | Fuori scope M4.4 |

#### 19.4 Ownership

La ProceduraAccesso appartiene a **una sola** Opportunità. **Non** è condivisa. Soft-delete dell'AR non rimuove la riga; delete fisico dell'Opportunità → **CASCADE**.

#### 19.5 Identità tecnica

Eventuale `id` uuid è **solo tecnico**. Non autorizza FK inbound da Evidenze, Fonti, altri domini o candidature.

#### 19.6 Cardinalità

| Livello | Cardinalità | Enforce |
|---|---|---|
| Strutturale DB (M4.4) | Opportunità → ProceduraAccesso **0..1** | Al più una procedura dichiarativa per scheda |
| Concettuale | Presente quando la scheda espone istruzioni/canale | Scenario A tipico: Modalità + procedura/link |
| Pubblicabilità | Eventuale obbligo di completezza | **Gate M7**; non minimo SQL in M4.4 |

**Perché 0..1 e non 0..N.** Physical e Logical trattano ProceduraAccesso come VO descrittivo singolare (descrizione + link + indicazioni). La molteplicità dei *tipi* di accesso è già coperta da ModalitàAccesso M:N. Canali/passaggi multipli restano nel testo dello `statement`.

#### 19.7 Modello di persistenza

Tabella di composizione VO (non colonne sparse sull'AR), allineata al pattern Beneficio/Requisito per ownership/CASCADE/RLS, con vincolo di unicità su `opportunity_id` per imporre 0..1.

```text
public.opportunity_access_procedures
```

#### 19.8 Colonne

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | Identificatore di riga; non identità di dominio |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; UNIQUE; FK CASCADE | Opportunità proprietaria; al più una procedura |
| `statement` | `text` | Sì | — | NOT NULL; anti-blank | Istruzioni/indicazioni dichiarate (testo integrale) |
| `operational_url` | `text` | No | — | NULL oppure anti-blank | Link/canale operativo dichiarato; ≠ URL Fonte |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | Creazione riga |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | Ultimo aggiornamento (trigger) |

Nessun'altra colonna in M4.4. **Non** introdurre: `title`/`description` separati; `is_active`; `kind`/`access_type`; `sort_order` (inutile in 0..1); email/PEC/telefono strutturati; `source_id`; scadenze; JSONB.

#### 19.9 Decisione su `is_active`

**Escluso.** Come Beneficio (VO): nessun fondamento per soft-state; lifecycle = insert / update / delete della riga.

#### 19.10 Statement e URL operativo

- `statement`: unico contenuto istruttivo (descrizione + indicazioni del Physical preesistente). Plain text; no Markdown/HTML/JSONB.
- `operational_url`: opzionale; quando presente non blank. È il link di accesso/candidatura/portale/modulo **dichiarato**, distinto da `opportunity_sources.url` (provenienza informativa, M3.1).
- Contatti (email, PEC, telefono, sede): restano nello `statement` o in un futuro modello Contatti; **non** colonne dedicate in M4.4.

#### 19.11 Confini

| Confine | Regola |
|---|---|
| ModalitàAccesso | Tipo di accesso (C05); già M2 |
| Destinatari | A chi; nessun ponte |
| Requisiti | Condizioni da soddisfare ≠ istruzioni «come presentare» |
| Benefici | Cosa si ottiene ≠ come richiederlo |
| Temporalità | Apertura/scadenza → M5; non colonne data in M4.4 |
| Fonti | URL informativo ≠ `operational_url` |
| Evidenze | Nessuna FK; nessun aspect dedicato obbligatorio |
| Candidature / workflow | Fuori M4.4 |

#### 19.12 PK, FK e ON DELETE

- PK: `id`.
- FK unica: `opportunity_id` → `public.opportunities(id)` **ON DELETE CASCADE**.
- UNIQUE: `(opportunity_id)` — enforce 0..1.
- Nessuna FK verso sources, evidences, requirements, audience, profiles, businesses, auth.users, access_modes.

#### 19.13 Vincoli e duplicati

- Anti-blank su `statement`.
- Anti-blank su `operational_url` quando non NULL.
- Nessuna UNIQUE su `statement` o URL.
- Nessun minimo-uno SQL.

#### 19.14 Indici

L'UNIQUE su `opportunity_id` copre il lookup per Opportunità. Nessun altro indice obbligatorio.

#### 19.15 Trigger `updated_at`

`public.set_opportunity_access_procedures_updated_at()` — `SECURITY INVOKER`, `search_path = ''`, BEFORE UPDATE FOR EACH ROW. Pattern come M3/M4.2/M4.3.

#### 19.16 RLS, policy e privilegi

ENABLE RLS; nessuna policy in M4.4; `REVOKE ALL` da `anon` e `authenticated`; nessun GRANT. Coerente con M1–M4.3.

#### 19.17 Seed

Nessun seed.

#### 19.18 Migration prevista

Una sola unit (Migration Plan):

```text
create_opportunity_access_procedure
```

Dipendenza: solo `public.opportunities` (M1.1). Non dipende da M2–M4.3. Non modifica ModalitàAccesso.

#### 19.19 Compatibilità PostgreSQL

Target **17.6.1**. Niente enum, JSONB, EAV, SECURITY DEFINER.

#### 19.20 Invarianti fisiche M4.4

1. ProceduraAccesso è VO, non E02 e non C05.  
2. ModalitàAccesso resta esclusivamente M2.  
3. Al più una procedura per Opportunità (0..1).  
4. Contenuto: `statement` (+ `operational_url` opzionale).  
5. Nessun `is_active`.  
6. Unica FK verso `opportunities`, CASCADE.  
7. Nessuna FK a Fonte/Evidenza/Requisiti/Destinatari/soggetti.  
8. Nessuna candidatura, pratica, upload, scadenza strutturale.  
9. Nessun seed; nessuna policy; RLS+REVOKE.  
10. `id` solo tecnico; nessuna referenziabilità inbound.

#### 19.21 Criteri di accettazione

Esiste `opportunity_access_procedures` con le colonne §19.8; UNIQUE su `opportunity_id`; anti-blank; CASCADE; trigger INVOKER; RLS senza policy; assenza di cataloghi/candidature/`is_active`; bozza senza procedura inseribile; ModalitàAccesso M2 invariata.

---

## 20. CandidaturaOpportunità

### Decisione

**E02 dipendente di Opportunità**, cardinalità **0..N**, **non obbligatoria**, **non invariante**. Non Aggregate Root autonomo oggi (PC2 aperto).

### Tre scenari

| Scenario | Entità | Autorità |
|---|---|---|
| A — esterna non registrata | Nessuna | ModalitàAccesso (M2) + ProceduraAccesso/link operativo (M4.4) |
| B — esterna registrata | CandidaturaOpportunità (autorità dichiarativa) | Dichiarazione utente; non procedura ufficiale |
| C — interna | CandidaturaOpportunità (autorità governata) | Invio, ritiro, integrazione, ammissibilità, valutazione, esito |

Scenari B e C condividono l'Entity con discriminante di autorità; non due AR.

### Distinzioni

≠ CandidaturaCollaborazione; ≠ ManifestazioneInteresse/Invito/Abbinamento; ≠ iscrizione Evento; ≠ richiesta Servizio; ≠ prenotazione generica; ≠ salvataggio/preferenza/interesse; ≠ domanda ufficiale non registrata.

---

## 21. Valutazione e ammissibilità

| Concetto | Forma | Quando |
|---|---|---|
| Compatibilità presunta | Derived Fact | Sempre possibile come segnale |
| Ammissibilità | Esito su candidatura (VO/E02) | Interno o registrato |
| Valutazione | E02 su candidatura o VO | Interno; o registrazione esito esterno |
| Separazioni | Verifica rappresentazione ≠ verifica requisiti ≠ ammissibilità ≠ valutazione ≠ decisione ≠ assegnazione | Obbligatorie |

Non obbligatoria. Non appropria valutazione ufficiale esterna.

---

## 22. Graduatoria ed esiti

- **Esterna ufficiale:** non posseduta; eventuale **Snapshot/Evidence** di registrazione dichiarativa.
- **Interna:** E02 opzionale del processo; PC2 aperto se diventa AR autonomo.
- Esito candidatura: VO/stato su CandidaturaOpportunità.

---

## 23. Assegnazione e beneficiario

**E02 — Assegnazione** (0..N), condizionata.

Può essere interna o registrazione di fatto esterno. Reference a Persona/Impresa beneficiaria. **≠** erogazione, contratto, pagamento, esecuzione, Collaborazione.

Assegnazione → 0..N Collaborazioni possibili; Opportunità **non** possiede Collaborazioni (solo aggregazione inversa non autorevole). Evento `AssegnazioneRegistrata` non crea Appartenenza né Collaborazione automatica.

---

## 24. Verifica (M7.1)

### 24.1 Scopo

Formalizzare la **Verifica di rappresentazione della scheda** Opportunity (Migration Plan M7.1; Thesis §28–§29; PF10/PF11) con precisione sufficiente alla migration SQL `create_opportunity_verifications`, senza anticipare assi editoriali/pubblicazione/visibilità (M7.2), senza importare workflow di Contenuti Editoriali, e senza fondere la verifica con la pubblicazione o con la temporalità M5.

Risponde a: *per quali aspetti della scheda la piattaforma ha un riscontro corrente, e con quale esito?*

### 24.2 Natura

| È | Non è |
|---|---|
| **E02** — Entity dipendente owned da Opportunity | Aggregate Root autonomo |
| Composizione locale della scheda | Workflow / assegnazioni / versioni di Contenuti Editoriali |
| Current-state **per aspetto** | History table; transition log; audit generale |
| Controllo di rappresentazione (PF10/PF11) | Approvazione editoriale M7.2; pubblicazione piattaforma; certificazione legale |
| 0..N righe (al più una per `aspect`) | Badge unico “verificata”; obbligo SQL di avere verifiche |

### 24.3 Ownership e lifecycle

Ogni riga appartiene a **una sola** Opportunity. Soft-delete dell'AR (`deleted_at`) **non** rimuove le righe. Delete fisico dell'Opportunity → **ON DELETE CASCADE**. Lifecycle: insert / update / delete fisico; stato corrente; nessuna supersessione; nessun soft-delete sulla verifica; nessun append-only.

### 24.4 Tabella

```text
public.opportunity_verifications
```

### 24.5 Colonne

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | — |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK → `opportunities` **ON DELETE CASCADE** | Scheda proprietaria |
| `aspect` | `text` | Sì | — | NOT NULL; CHECK chiuso §24.6 | Aspetto verificato |
| `status` | `text` | Sì | — | NOT NULL; CHECK chiuso §24.7 | Esito corrente |
| `verified_at` | `timestamptz` | No | — | NULL; regole §24.7–§24.8 | Momento di **conclusione** della verifica corrente (positiva, negativa o della verifica poi scaduta); NULL solo se `pending` |
| `expires_at` | `timestamptz` | No | — | NULL; regole §24.7–§24.8 | Limite di validità della verifica positiva corrente, oppure istante/ancora dell'obsolescenza se `expired` |
| `source_note` | `text` | No | — | NULL oppure anti-blank | Nota sintetica locale non pubblica; ≠ Entity Fonte |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | — |

**Nessuna** altra colonna in M7.1: niente `*_by`, niente motivazioni strutturate, niente FK a fonti/evidenze/profili, niente JSON/JSONB/array.

### 24.6 Aspect (controlled vocabulary) e mapping Thesis → Physical

Vocabolario fisico chiuso (CHECK text; nessun enum PostgreSQL; nessun catalogo seed):

```text
aspect IN (
  'existence',
  'identity',
  'source',
  'timing',
  'benefit',
  'requirements'
)
```

| Valore fisico | Significato operativo |
|---|---|
| `existence` | Riscontro che l'Opportunità dichiarata **esiste** come possibilità (Logical §11 «Esistenza»; Thesis §29 «esistenza») |
| `identity` | Riscontro sull'**identità del promotore/ente** dichiarato sulla scheda (Logical §11 «Identità del promotore»); non auth; non copia di `profiles` |
| `source` | Attendibilità/riscontro della **fonte** dichiarata, incluso il carattere ufficiale/istituzionale della fonte quando rilevante (Thesis §29 «fonte ufficiale»; Logical §11 fonti); **non** sostituisce `opportunity_sources` / Evidenze |
| `timing` | Attendibilità delle **date e finestre dichiarate** (Logical «Validità temporale» + «Scadenza»); usa i fatti M5 senza possederli né duplicarli |
| `benefit` | Attendibilità del **beneficio/accesso dichiarato** sulla scheda (Logical §11 «Beneficio»); non erogazione |
| `requirements` | Attendibilità di **requisiti, condizioni e destinatari dichiarati** sulla scheda (Logical §11 «Requisiti»; Thesis «requisiti» come fatto di rappresentazione); **non** eleggibilità di un candidato, non valutazione, non candidatura |

#### 24.6.1 Mapping esplicito Thesis / Logical → Physical

| Piano fondativo (Thesis §29 / Logical §11) | Trattamento M7.1 | Note |
|---|---|---|
| Esistenza dell'Opportunità | **Presente** come `existence` | Fondativo; era assente nella bozza precedente |
| Identità del promotore | **Presente** come `identity` | — |
| Fonte / fonte ufficiale / attendibilità fonte | **Presente** come `source` | Il carattere «ufficiale» della fonte è **assorbito** in `source` (non serve un aspect `officiality` separato) |
| Validità temporale | **Presente** in `timing` | — |
| Scadenza (asse verifica date) | **Assorbito** in `timing` | Stesso aspect; non nuova finestra M5 |
| Beneficio dichiarato | **Presente** come `benefit` | — |
| Requisiti dichiarati | **Presente** in `requirements` | — |
| Destinatari / condizioni dichiarate (come fatti di scheda) | **Assorbito** in `requirements` | Non eleggibilità individuale |
| Modalità / procedura di accesso (verifica del canale dichiarato) | **Rinviato** | Nessun aspect dedicato in M7.1; eventuale estensione futura del CHECK, non inventata ora |
| Disponibilità delle risorse | **Rinviato** | Affiora sull'asse sostanziale / aggiornamento scheda; non aspect M7.1 |
| Modifiche o revoche sostanziali | **Rinviato** | Asse sostanziale / rappresentazione; non aspect M7.1 |
| Aggiornamento della rappresentazione | **Rinviato** | Processo di aggiornamento scheda; non aspect di verifica persistito |
| Fatti rappresentati (piano generico Thesis) | **Assorbito** | Coperto dalla combinazione degli aspect persistiti (`existence`…`requirements`), non da un aspect generico `representation` |
| Verifica editoriale | **Escluso** da M7.1 | Appartiene all'asse `editorial_status` (M7.2), non alla Verifica |
| Eleggibilità (di un soggetto/candidato) | **Escluso** | Processo / candidatura; ≠ `requirements` |
| Candidatura / assegnazione (verifiche di processo) | **Escluso** | Fuori M7; candidature rinviate |
| Contatti / rubrica (`contact`) | **Escluso** | Non compare come asse di verifica in Thesis §29 né Logical §11; **non** introdotto |
| `officiality` come aspect autonomo | **Escluso** (assorbito) | Vedi riga «Fonte ufficiale» → `source` |
| `eligibility` come aspect autonomo | **Escluso** (sostituito) | Sostituito da `requirements` per evitare collisione semantica con eleggibilità candidato |
| publication / content / translation / seo / legal / security / CMS | **Escluso** | Fuori dominio Verifica scheda |

Nessun valore `aspect` è arbitrario: ogni valore persistito deriva da Thesis e/o Logical, oppure è dichiarato assorbito/rinviato/escluso nella tabella sopra.

### 24.7 Status (controlled vocabulary) — semantica chiusa

```text
status IN (
  'pending',
  'verified',
  'failed',
  'expired'
)
```

#### `pending`

| | |
|---|---|
| **Significato** | Verifica prevista o avviata, **non ancora conclusa** |
| **Quando** | Prima di un esito positivo o negativo; oppure reset applicativo a «da verificare» |
| **`verified_at`** | **Deve essere NULL** (non esiste conclusione) |
| **`expires_at`** | **Deve essere NULL** (non esiste validità di un esito assente) |
| **Non significa** | `in_review` editoriale (M7.2); «non verificabile»; rigetto editoriale |

#### `verified`

| | |
|---|---|
| **Significato** | Aspetto **concluso positivamente**; la verifica corrente è tuttora considerata valida |
| **Quando** | Esito positivo registrato; resta `verified` finché non fallisce un nuovo controllo o non si marca obsolescenza |
| **`verified_at`** | **Deve essere NOT NULL** (istante della conclusione positiva) |
| **`expires_at`** | **Opzionale**: NULL = nessuna scadenza dichiarata della verifica; se valorizzato, è il limite di validità dichiarato (**deve essere** `> verified_at`). Il passaggio automatico a `expired` al passare di `now()` **non** è SQL |
| **Non significa** | Approvazione editoriale; pubblicazione; «non verificabile» |

#### `failed`

| | |
|---|---|
| **Significato** | Verifica **conclusa negativamente** (controllo eseguito con esito negativo) |
| **Quando** | Il riscontro non conferma l'aspetto; distinto da «ancora da fare» (`pending`) e da «un tempo ok ma non più» (`expired`) |
| **`verified_at`** | **Deve essere NOT NULL** (istante della conclusione negativa) |
| **`expires_at`** | **Deve essere NULL** (un fallimento non ha finestra di validità positiva; non è un'obsolescenza di successo) |
| **Non significa** | `rejected` editoriale (M7.2); Thesis «non verificabile» (assenza di possibilità di controllo — **rinviato**, non modellato come `failed`); ritiro pubblicazione |

#### `expired`

| | |
|---|---|
| **Significato** | Esisteva una verifica **positiva** che **non è più attuale** (obsolescenza esplicita della verifica corrente) |
| **Quando** | L'applicazione marca l'obsolescenza (es. superato il limite dichiarato, o rivalutazione che invalida il successo precedente) **senza** trigger SQL su `now()` |
| **`verified_at`** | **Deve essere NOT NULL** (istante della conclusione positiva originaria ancora tracciata nello stato corrente) |
| **`expires_at`** | **Deve essere NOT NULL** e **`> verified_at`** (ancora temporale dell'obsolescenza / limite superato) |
| **Non significa** | Scadenza M5 dell'Opportunity; ritiro pubblicazione; soft-delete; archiviazione; `failed` |

**Esclusi** da `status`: `approved`, `rejected`, `published`, `draft`, `in_review`, `withdrawn` (M7.2 o altri assi); `contested` / `contestata` (PCa1, §25); `non_verifiable` (Thesis «non verificabile» — **rinviato**, nessun valore fisico in M7.1).

### 24.8 Coerenza status / timestamp (CHECK SQL)

I CHECK derivano dalla semantica §24.7 (non il contrario). Implementare vincoli deterministici equivalenti a:

```text
(
  (
    status = 'pending'
    and verified_at is null
    and expires_at is null
  )
  or (
    status = 'verified'
    and verified_at is not null
    and (
      expires_at is null
      or expires_at > verified_at
    )
  )
  or (
    status = 'failed'
    and verified_at is not null
    and expires_at is null
  )
  or (
    status = 'expired'
    and verified_at is not null
    and expires_at is not null
    and expires_at > verified_at
  )
)
```

Più i CHECK di vocabolario:

```text
aspect IN ('existence', 'identity', 'source', 'timing', 'benefit', 'requirements')
status IN ('pending', 'verified', 'failed', 'expired')
```

**Combinazioni vietate (impossibili via SQL):**  
`pending` con qualsiasi timestamp; `verified` senza `verified_at`; `verified` con `expires_at <= verified_at`; `failed` senza `verified_at`; `failed` con `expires_at` valorizzato; `expired` senza `verified_at`; `expired` senza `expires_at`; `expired` con `expires_at <= verified_at`; aspect/status fuori vocabolario.

**Combinazioni ammesse:**  
`pending` + entrambi NULL; `verified` + `verified_at` + `expires_at` NULL; `verified` + entrambi con `expires_at > verified_at`; `failed` + `verified_at` + `expires_at` NULL; `expired` + entrambi con `expires_at > verified_at`.

**Non** imporre via SQL: auto-transizione a `expired` al passare di `now()`; scheduling; trigger che mutano `status`; coerenza con finestre M5 oltre all'uso informativo applicativo di `timing`.

### 24.9 Source note

`source_note text` nullable; se valorizzata: `btrim(source_note) <> ''`.  
Nota sintetica locale di supporto al riscontro; **non** Entity Fonte; **non** audit; **non** verbale di revisione; **non** contenuto pubblico; **non** motivazione editoriale M7.2; **non** copia di Evidenza/Fonte.

### 24.10 Cardinalità e UNIQUE

| Livello | Cardinalità | Enforce |
|---|---|---|
| Strutturale DB | Opportunità → Verifica **0..N** | Nessun minimo |
| Per aspetto | Al più **una** riga corrente per `(opportunity_id, aspect)` | `UNIQUE (opportunity_id, aspect)` |
| Pubblicabilità | Eventuale completezza verifiche | **Gate applicativo**; non minimo SQL |

Aggiornamenti: sulla stessa riga (current-state). **Nessuno storico** in M7.1; eventuale history → fase futura distinta (non M7.3 ora).

### 24.11 Indici

1. Ordinario btree su `opportunity_id` — nome: `opportunity_verifications_opportunity_id_idx`.
2. UNIQUE su `(opportunity_id, aspect)` — nome: `opportunity_verifications_opportunity_aspect_uidx` (oppure constraint UNIQUE equivalente).
3. Ordinario btree su `status` — nome: `opportunity_verifications_status_idx`.

**Non** creare indici su `verified_at`, `expires_at`, `source_note`; no full-text/GIN/GiST/BRIN/trigram.

### 24.12 Timestamp, funzione, trigger

Colonne: `created_at`, `updated_at` come §24.5.

Funzione dedicata:

```text
public.set_opportunity_verifications_updated_at
```

- `RETURNS trigger`; `LANGUAGE plpgsql`; `SECURITY INVOKER`; `SET search_path = ''`;
- nessun parametro; assegna solo `NEW.updated_at = now()`; restituisce `NEW`;
- non SECURITY DEFINER; nessuna lettura di altre tabelle.

Trigger:

```text
opportunity_verifications_set_updated_at
```

- `BEFORE UPDATE` su `public.opportunity_verifications`; `FOR EACH ROW`;
- esegue la funzione dedicata;
- nessun trigger su INSERT/DELETE; nessun trigger di workflow/sincronizzazione.

### 24.13 RLS e privilegi

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (no FORCE).
- Nessuna policy in M7.1.
- `REVOKE ALL ON TABLE public.opportunity_verifications FROM anon, authenticated`.
- Nessun GRANT.

### 24.14 Commenti SQL richiesti

`COMMENT ON TABLE` + `COMMENT ON COLUMN` per tutte e nove le colonne. I commenti devono dichiarare: E02 owned; current-state per aspetto; non workflow; non audit; non approvazione editoriale; non pubblicazione; CASCADE; assenza di storico; distinzione da M7.2 e da Contenuti Editoriali.

Commenti **obbligatoriamente inequivoci** sulle colonne di vocabolario/tempo:

- `aspect` — elencare i sei valori; rimandare al mapping Thesis/Logical (§24.6.1); chiarire che `requirements` ≠ eleggibilità candidato; `source` assorbe il carattere ufficiale della fonte; `timing` ≠ finestre M5.
- `status` — elencare i quattro valori; `pending`/`verified`/`failed`/`expired` come da §24.7; `failed` ≠ `rejected` editoriale; `expired` ≠ scadenza Opportunity M5.
- `verified_at` — istante di conclusione; NULL solo con `pending`; obbligatorio per `verified`/`failed`/`expired`.
- `expires_at` — NULL con `pending`/`failed`; opzionale con `verified`; obbligatorio con `expired`; se valorizzato sempre `> verified_at`; nessun automatismo su `now()`.
- `source_note` — nota locale ≠ Entity Fonte.

### 24.15 Dipendenze M7.1

Consentite: `public.opportunities`; `gen_random_uuid()`; PL/pgSQL.  
**Vietate:** `profiles`, `auth.users`, Contenuti Editoriali, FK a M5/fonti/evidenze/M6, candidature, Eventi, Collaborazioni, notifiche, analytics.

### 24.16 Migration M7.1

Una sola unit file:

```text
create_opportunity_verifications
```

Crea: tabella; CHECK; UNIQUE; indici; funzione; trigger; RLS; REVOKE; commenti. Nessun seed. Nessuna policy. Nessun ALTER su altre tabelle.

### 24.17 Accettazione M7.1

Tabella presente con le nove colonne; FK CASCADE; UNIQUE per aspect; CHECK `aspect` sui sei valori §24.6; CHECK `status` + coerenza timestamp §24.8 (incluso `expired` con entrambi i timestamp; `failed` senza `expires_at`; `pending` senza timestamp); anti-blank `source_note`; trigger INVOKER; RLS+REVOKE; zero righe ammesse (0..N); mapping Thesis→Physical presente; nessuna pubblicazione/editoriale; nessuna history.

---

## 25. Contestazione e rettifica

**PCa1 — candidato, non consolidato.** Contestazione può riguardare fonte, scadenza, requisito, beneficio, promotore, rappresentazione, valutazione, esclusione, assegnazione. Distinta da rettifica, aggiornamento, ricorso amministrativo esterno, rifiuto, sospensione, revoca.

**Confine con M7.1.** Il vocabolario `status` di `opportunity_verifications` **non** include `contested` / `contestata`. Il processo pieno di contestazione resta rinviato; non è introdotto da M7.1 né da M7.2.

---

## 26. Pubblicazione e visibilità (M7.2)

### 26.1 Scopo

Formalizzare gli **assi current-state** di editoriale, pubblicazione piattaforma e visibilità sull'Aggregate Root (Migration Plan M7.2; Thesis §28; PF7/PF12/PF13), con precisione sufficiente alla migration SQL `add_opportunity_publication_state`, distinti da M5, da `external_official_published_at`, da `representation_status` (archiviazione), da soft-delete, e dal dominio Contenuti Editoriali.

### 26.2 Riconciliazione Logical (dichiarazione esplicita)

Il Logical (§8) usa termini aggiuntivi per la fase redazionale (*Individuata*, *Segnalata*, *In valutazione*, e *Programmata* anche sull'asse editoriale).  
**Autorità conclusiva per il Physical M7.2:** Thesis §28 e review architetturale M7.

Vocabolario concettuale Thesis: `bozza | in_revisione | approvata | respinta`.  
Valori fisici snake_case:

| Concettuale Thesis | Fisico M7.2 |
|---|---|
| bozza | `draft` |
| in revisione | `in_review` |
| approvata | `approved` |
| respinta | `rejected` |

- “Individuata”, “Segnalata”, “In valutazione” **non** sono valori fisici di `editorial_status`.
- “Programmata” appartiene all'asse **pubblicazione** (`publication_status = 'scheduled'`), non all'asse editoriale.
- Questa sezione **non** modifica il documento Logical; l'eventuale riallineamento Logical è fase documentale separata.

### 26.3 Natura e boundary Aggregate

| È | Non è |
|---|---|
| Proprietà/assi **current-state** dell'AR `public.opportunities` | Entity/tabella separata M7.2 |
| Cardinalità 1:1 con l'Opportunity | Record 0..1 opzionale creato lazy |
| Fatto pubblicativo della scheda | Workflow CMS; versioni; assegnazioni revisori |
| Distinto da Verifica (M7.1) | Gate SQL di completezza multi-tabella |

**Motivazione anti-tabella dedicata:** tre assi correnti, nessun lifecycle autonomo, nessuno storico 0..N in questa fase → `ALTER TABLE public.opportunities` soltanto.

### 26.4 Colonne da aggiungere (esattamente sei)

| Colonna | Tipo | Obbl. | Default | Vincoli |
|---|---|---|---|---|
| `editorial_status` | `text` | Sì | `'draft'` | NOT NULL; CHECK §26.5 |
| `publication_status` | `text` | Sì | `'unpublished'` | NOT NULL; CHECK §26.6 |
| `visibility_level` | `text` | Sì | `'private'` | NOT NULL; CHECK §26.7 |
| `platform_scheduled_for` | `timestamptz` | No | — | NULL; regole §26.8 / §26.11 |
| `platform_published_at` | `timestamptz` | No | — | NULL; regole §26.9 / §26.11 |
| `platform_withdrawn_at` | `timestamptz` | No | — | NULL; regole §26.10 / §26.11 |

**Colonne vietate in M7.2:** `published_at` (ambiguo vs M5.2); `visible_from`; `visible_until`; `archived_at`; `approved_at`; `reviewed_at`; `rejected_at`; `publication_note`; `withdrawal_reason`; qualsiasi `*_by`; booleani derivabili (`is_public`, `is_visible`, `is_scheduled`, `is_archived`, `is_open`, `is_expired`, `is_complete`, `is_publishable`).

### 26.5 Editorial status

```text
editorial_status text NOT NULL DEFAULT 'draft'
CHECK (editorial_status IN ('draft', 'in_review', 'approved', 'rejected'))
```

| Valore | Significato |
|---|---|
| `draft` | Scheda esistente ma non sottoposta o non pronta alla revisione |
| `in_review` | Scheda sottoposta a controllo editoriale della piattaforma |
| `approved` | Scheda approvata editorialmente e **potenzialmente** pubblicabile |
| `rejected` | Scheda non approvata nello stato corrente |

`approved` **non** implica `published`. `rejected` **non** implica cancellazione. Transizioni = applicative; nessuno storico; workflow dettagliato (assegnazioni, commenti, versioni) = Contenuti Editoriali / processi fuori Opportunità.

### 26.6 Publication status

```text
publication_status text NOT NULL DEFAULT 'unpublished'
CHECK (publication_status IN ('unpublished', 'scheduled', 'published', 'withdrawn'))
```

| Valore | Significato |
|---|---|
| `unpublished` | Non pubblicata sulla piattaforma |
| `scheduled` | Pubblicazione piattaforma programmata |
| `published` | Pubblicata sulla piattaforma |
| `withdrawn` | Pubblicazione ritirata dalla piattaforma |

**Non coincide** con: `external_official_published_at` (M5.2); finestre/stato temporale M5; `visibility_level`; `deleted_at`; `representation_status` (incluso `archived`); apertura/chiusura candidature.

### 26.7 Visibility level

```text
visibility_level text NOT NULL DEFAULT 'private'
CHECK (visibility_level IN ('private', 'editorial', 'restricted', 'network', 'public'))
```

| Valore | Significato |
|---|---|
| `private` | Conoscibile solo nei flussi applicativi autorizzati |
| `editorial` | Accessibile ai ruoli redazionali (business), non al pubblico |
| `restricted` | Accessibile a soggetti autorizzati non pubblici |
| `network` | Visibile nella rete/community autorizzata |
| `public` | Visibile pubblicamente |

Autorizzazione concreta = applicativa / RLS **futura**. M7.2 fondazionale **non** crea policy. `public` ≠ candidatura aperta. Una scheda scaduta (M5) **può** restare `public` + `published`. Visibilità ≠ pubblicazione.

### 26.8 `platform_scheduled_for`

Istante previsto per la pubblicazione **sulla piattaforma**. ≠ `opens_at`/`closes_at` M5; ≠ milestone esterna; ≠ intervallo di visibilità generale (non esistono `visible_from`/`visible_until` in M7).

Regole (CHECK compositi §26.11): obbligatorio se `publication_status = 'scheduled'`; deve essere NULL se `publication_status IN ('unpublished', 'published', 'withdrawn')`.  
Nessun trigger temporale che cambi automaticamente lo stato al raggiungimento dell'istante.

### 26.9 `platform_published_at`

Istante della pubblicazione piattaforma **corrente** (modello current-state). **Distinto obbligatoriamente** da `external_official_published_at`.

Regole: obbligatorio se `publication_status IN ('published', 'withdrawn')`; NULL se `publication_status IN ('unpublished', 'scheduled')`.  
In ritiro: conserva il valore di pubblicazione precedente. In ripubblicazione: può essere aggiornato alla nuova pubblicazione corrente. **Non** preserva l'elenco storico degli eventi.

### 26.10 `platform_withdrawn_at`

Istante di ritiro dalla pubblicazione piattaforma. ≠ soft-delete; ≠ scadenza M5; ≠ archiviazione (`representation_status`).

Regole: obbligatorio se `publication_status = 'withdrawn'`; NULL se `publication_status IN ('unpublished', 'scheduled', 'published')`; se valorizzato ⇒ `platform_withdrawn_at >= platform_published_at`.

### 26.11 CHECK di coerenza editoriale / pubblicazione / timestamp

Un unico vincolo composito (o CHECK equivalenti) deve imporre:

1. **`scheduled`:**  
   `editorial_status = 'approved'`  
   AND `platform_scheduled_for IS NOT NULL`  
   AND `platform_published_at IS NULL`  
   AND `platform_withdrawn_at IS NULL`

2. **`published`:**  
   `editorial_status = 'approved'`  
   AND `platform_scheduled_for IS NULL`  
   AND `platform_published_at IS NOT NULL`  
   AND `platform_withdrawn_at IS NULL`

3. **`withdrawn`:**  
   `platform_scheduled_for IS NULL`  
   AND `platform_published_at IS NOT NULL`  
   AND `platform_withdrawn_at IS NOT NULL`  
   AND `platform_withdrawn_at >= platform_published_at`  
   (**non** richiede `editorial_status = 'approved'`)

4. **`unpublished`:**  
   `platform_scheduled_for IS NULL`  
   AND `platform_published_at IS NULL`  
   AND `platform_withdrawn_at IS NULL`

Nomi constraint suggeriti (deterministici):  
`opportunities_publication_state_check` (composito) oppure vincoli dedicati equivalenti non ambigui.

### 26.12 CHECK visibilità / pubblicazione

1. Se `visibility_level = 'public'` ⇒ `publication_status = 'published'`.
2. Se `publication_status = 'withdrawn'` ⇒ `visibility_level <> 'public'`.

**Non** imporre: che ogni `published` sia `public` (ammessi `private` / `editorial` / `restricted` / `network` / `public`); invisibilità automatica a scadenza M5; legami SQL a candidature/fonti/evidenze/M6; completezza.

Nome constraint suggerito: `opportunities_visibility_publication_check`.

### 26.13 Archiviazione

M7 **non** introduce `archived` né `archived_at`.  
L'archiviazione rappresentativa resta su `representation_status` (M1; valore `archived` già nel vocabolario di rappresentazione).  
`withdrawn` ≠ `archived`. Una scheda può essere ritirata senza essere archiviata. M7 non ridefinisce l'archiviazione.

### 26.14 Ripubblicazione

Ammessa **applicativamente**. M7.2 conserva solo current-state. Nessuna tabella eventi; nessuna M7.3.  
Quando si torna a `published`: `platform_withdrawn_at` deve essere NULL; `platform_published_at` può essere aggiornato. Storico 0..N = fase futura separata.

### 26.15 Bozza

Ogni Opportunity possiede **sempre** le sei colonne M7.2 (default `draft` / `unpublished` / `private`). Nessuna tabella/record M7.2 separato. La bozza **non** richiede righe in `opportunity_verifications`. Opportunity può esistere con zero verifiche.

### 26.16 Completezza e pubblicabilità

Completezza minima, qualità editoriale, fonti, evidenze, temporalità, riferimenti M6, coerenza assi = **gate applicativi** (PF12).  
**Non** introdurre: trigger multi-tabella; CHECK con subquery; deferred trigger; `is_complete` / `is_publishable`.

### 26.17 Indici (solo questi)

Nomi deterministici sul pattern `<tabella>_<colonna>_idx` / predicato:

1. `opportunities_editorial_status_idx` su `editorial_status`
2. `opportunities_publication_status_idx` su `publication_status`
3. `opportunities_visibility_level_idx` su `visibility_level`
4. `opportunities_platform_scheduled_for_idx` su `platform_scheduled_for` **WHERE** `publication_status = 'scheduled'`
5. `opportunities_platform_published_at_idx` su `platform_published_at` **WHERE** `publication_status IN ('published', 'withdrawn')`

Niente UNIQUE aggiuntive; niente indice su `platform_withdrawn_at`; niente indici combinati speculativi; niente GIN/GiST/BRIN/trigram/full-text.

### 26.18 Lifecycle

Current-state sull'AR; aggiornabile; nessuna history/supersessione/append-only; nessun soft-delete aggiuntivo; nessun trigger di workflow. Cancellazione = lifecycle Opportunity (soft `deleted_at` M1; hard delete cascada sulle owned, colonne AR eliminate con la riga).

### 26.19 Updated_at (nessuna nuova funzione M7.2)

Confermato da M1.1 (`20260720225301_create_opportunities_core.sql`):

- funzione: `public.set_opportunities_updated_at`
- trigger: `opportunities_set_updated_at` (`BEFORE UPDATE` su `public.opportunities`)

M7.2 **non** duplica il meccanismo. Ogni UPDATE degli assi M7.2 continua a passare da quel trigger.

### 26.20 RLS e privilegi

`public.opportunities` ha già RLS enabled + REVOKE anon/authenticated (M1).  
M7.2 **non** ri-abilita RLS, **non** aggiunge policy, **non** GRANT, **non** apre lettura pubblica.  
`visibility_level = 'public'` **non** equivale a una policy RLS.

### 26.21 Commenti SQL richiesti

`COMMENT ON COLUMN` per le sei nuove colonne. Distinguere obbligatoriamente:

- `editorial_status` ≠ workflow Contenuti Editoriali;
- `publication_status` ≠ visibilità; ≠ M5; ≠ soft-delete; ≠ archiviazione;
- `platform_published_at` ≠ `external_official_published_at`;
- `platform_scheduled_for` ≠ finestre `opportunity_time_windows`;
- `platform_withdrawn_at` ≠ delete / scadenza / `representation_status = archived`;
- `visibility_level` ≠ policy applicativa automatica;
- current-state ≠ storico pubblicazioni.

Aggiornare `COMMENT ON TABLE public.opportunities` solo per esplicitare che l'AR possiede anche il current-state M7 (editoriale/pubblicazione/visibilità), senza alterare il significato di Aggregate Root.

### 26.22 Dipendenze M7.2

Consentite: `public.opportunities`; trigger `updated_at` già esistente.  
**Vietate:** nuove FK a `profiles`/auth/Editoriali/M5/fonti/evidenze/M6/candidature/Eventi/Collaborazioni.

### 26.23 Confine Contenuti Editoriali

Contenuti Editoriali (D34) può narrare un'Opportunity senza modificarne gli assi.  
M7.2 **non** crea: versioni, assegnazioni revisori, commenti redazionali, motivazioni, priorità, audit editoriale, scheduling di articoli, SEO, traduzioni.

Ruolo business **Redazione** (PL4) opera sugli assi della scheda; non è un Aggregate Root né una tabella.

### 26.24 Distinzioni obbligatorie (riepilogo)

| Concetto | Dove |
|---|---|
| Pubblicazione ufficiale esterna | `external_official_published_at` (M5.2) |
| Apertura/scadenza/accesso | `opportunity_time_windows` (M5.1); stato temporale **derivato** |
| Pubblicazione piattaforma | `publication_status` + `platform_*` (M7.2) |
| Visibilità scheda | `visibility_level` (M7.2) |
| Archiviazione rappresentazione | `representation_status` (M1) |
| Soft-delete tecnico | `deleted_at` (M1) |
| Verifica per aspetto | `opportunity_verifications` (M7.1) |
| Narrazione / CMS | Contenuti Editoriali |

### 26.25 Migration M7.2

Una sola unit file:

```text
add_opportunity_publication_state
```

Oggetti: `ALTER TABLE public.opportunities` (sei colonne); CHECK vocabolari + coerenza §26.11–§26.12; cinque indici §26.17; `COMMENT ON COLUMN` (×6); eventuale aggiornamento `COMMENT ON TABLE`.  
Nessun seed; nessuna policy; nessun GRANT; nessuna nuova funzione/trigger; nessun M7.3.

### 26.26 Ordine di applicazione M7

```text
M7.1 create_opportunity_verifications
 → (review M7.1)
 → M7.2 add_opportunity_publication_state
 → (review M7.2)
```

M7.2 non dipende strutturalmente da M7.1 (defaults indipendenti; zero verifiche ammesse). L'ordine Plan resta M7.1 → M7.2. Nessuna M7.3 in questa fase.

### 26.27 Assenze obbligatorie M7 (intero)

Candidature; candidati; beneficiari; selezioni; esiti individuali; Eventi; Collaborazioni; notifiche; newsletter; analytics; views; click; preferiti; ranking; sponsorizzazione; traduzioni; SEO; allegati; messaggistica; commenti pubblici; audit generale; versioning contenuti; workflow Redazione/Contenuti; revision assignments; approvazioni nominative; colonne `*_by`; policy; GRANT; seed; enum PostgreSQL; JSON/JSONB; array; history; event sourcing; supersessione; `visible_from`/`visible_until`; `archived_at`; `published_at` ambiguo.

### 26.28 Accettazione M7.2

Sei colonne presenti con default; CHECK vocabolari e coerenze; indici previsti; nessun nuovo trigger; RLS/REVOKE AR invariati; nessuna policy; distinzione M5/M5.2/archiviazione/Editoriali documentata nei commenti; DDL traducibile in PostgreSQL 17.6.1 senza decisioni ulteriori.

---

## 27. Assi di stato

| Asse | Valori fisici | Autorità | Stato implementativo |
|---|---|---|---|
| Sostanziale (`substantial_status`) | **Implementati:** `announced`, `suspended`, `closed`, `revoked`, `cancelled`. **Rinviati:** `open`, `exhausted` | Dominio / fonte | M1.1–M1.2 |
| Rappresentazione (`representation_status`) | **Implementati:** `censused`, `obsolete`, `withdrawn`, `archived`. **Rinviati:** `incomplete`, `updated` | Dominio | M1.1–M1.2 — **archiviazione qui**, non in M7 |
| Editoriale (`editorial_status`) | `draft`, `in_review`, `approved`, `rejected` | Dominio (ruolo PL4 redazione) | **M7.2** — §26 |
| Pubblicazione (`publication_status`) | `unpublished`, `scheduled`, `published`, `withdrawn` | Dominio (pubblicatore/redazione) | **M7.2** — §26 |
| Visibilità (`visibility_level`) | `private`, `editorial`, `restricted`, `network`, `public` | Dominio | **M7.2** — §26 |
| Verifica (per aspetto) | `pending`, `verified`, `failed`, `expired` su `opportunity_verifications.status` | Dominio | **M7.1** — §24; **non** colonna unica sull'AR |
| Temporale (derivato) | futura, aperta, in scadenza, scaduta, prorogata | Derivato da date M5 | M5 — **non** colonna status |
| Candidatura | solo se E02 presente | Processo B/C | Rinviato |
| **Evidenza** | — | — | **Nessun asse/stato locale** (M3.2) |
| Fonte (`status`) | `active`, `replaced`, `unreachable`, `contradictory`, `historical` | Dominio | M3.1 |

Nessun stato unico onnicomprensivo (PF7). PCa1 non introduce valori in M7.1. I valori rinviati sostanziale/rappresentazione **non** sono implementati da M7.

---

## 28. Temporalità

### 28.1 Scopo

Formalizzare la **Temporalità di accesso/validità** dell'Opportunità come Value Object di composizione (Migration Plan M5; review architetturale M5), con precisione sufficiente alle migration `create_opportunity_time_windows` (M5.1) e `add_opportunity_temporal_milestones` (M5.2), senza anticipare pubblicazione/visibilità/archiviazione (M7), candidature, workflow o scheduling.

### 28.2 Definizione

**FinestraAccesso / PeriodoValidità** descrive *quando* la possibilità è (o sarà) accessibile secondo le date **dichiarate** sulla scheda: apertura, chiusura/scadenza, eventuali finestre multiple, casi senza termine o continuativi, e lo storico delle proroghe.

Risponde a: *Quando si può accedere?*

| È | Non è |
|---|---|
| Date/finestre di accesso **dichiarate** | Pubblicazione / ritiro / visibilità piattaforma (M7) |
| Fatto di rappresentazione owned dall'Opportunità | Archiviazione / obsolescenza della scheda |
| Base per lo **stato temporale derivato** | Asse status onnicomprensivo persistito |
| Compatibile con 0..N finestre e storico proroghe | Edizione successiva (nuova Opportunità) |
| Distinto da ProceduraAccesso (che può citare date in testo) | Candidatura, pratica, scheduling, notifiche |

### 28.3 Natura architetturale

**VO — FinestraAccesso / PeriodoValidità** (Thesis §28; Logical §9; §6 di questo mapping).

| Non è | Motivo |
|---|---|
| Entity E02 | Nessuna referenziabilità inbound; nessun lifecycle di dominio autonomo |
| Controlled List | Non è vocabolario riusabile |
| Asse di stato primario | Lo stato temporale è **derivato** dalle date (§27) |
| Pubblicazione / Verifica | M7 |

### 28.4 Ownership

Ogni finestra appartiene a **una sola** Opportunità. **Non** è condivisa. Soft-delete dell'AR non rimuove le righe; delete fisico dell'Opportunità → **CASCADE**.

### 28.5 Identità tecnica

`id` uuid è **solo tecnico**. Non autorizza FK inbound (Evidenza `supports_aspect = deadline` resta sull'Opportunità, senza FK alla riga-finestra).

### 28.6 Cardinalità

| Livello | Cardinalità | Enforce |
|---|---|---|
| Strutturale DB (M5.1) | Opportunità → FinestraAccesso **0..N** | Più finestre / scadenze / storico |
| Senza scadenza / continuativa | Zero chiusura, o riga `open_ended` | Legittimo (Logical §9) |
| Pubblicabilità | Eventuale completezza temporale | **Gate M7**; non minimo SQL in M5 |
| Edizione successiva | Nuova Opportunità | Non nuova finestra della precedente |

### 28.7 Confine M5 vs altri moduli

| Momento / fatto | Modulo |
|---|---|
| Finestre di accesso; scadenze; proroghe storicizzate; senza scadenza; continuativa | **M5** |
| Milestone singolare: pubblicazione ufficiale **esterna** dichiarata (se nota) | **M5.2** (colonna AR) |
| Censimento / `created_at` | **M1** (già presente) |
| Pubblicazione / programmazione / ritiro **piattaforma** | **M7** |
| Visibilità | **M7** |
| Archiviazione / rappresentazione obsoleta | **M7** / asse rappresentazione |
| Verifica della scadenza | **M7** (usa date M5) |
| Sospensione / riapertura / revoca / annullamento / esaurimento | Asse **sostanziale** (M1/estensioni) — **non** tipizzate come finestre M5 in questa release |
| Finestra di candidatura | `kind = application` **solo se** pertinente; non crea CandidaturaOpportunità |
| Date citate solo in ProceduraAccesso.`statement` | M4.4 testo; non sostituiscono M5 |

### 28.8 Modello di persistenza M5.1

Tabella di composizione VO (non sole colonne sparse sull'AR per le finestre):

```text
public.opportunity_time_windows
```

### 28.9 Colonne M5.1

| Colonna | Tipo | Obbl. | Default | Vincoli | Significato |
|---|---|---|---|---|---|
| `id` | `uuid` PK | Sì | `gen_random_uuid()` | PK tecnica | Identificatore di riga; non identità di dominio |
| `opportunity_id` | `uuid` | Sì | — | NOT NULL; FK CASCADE | Opportunità proprietaria |
| `kind` | `text` | Sì | — | NOT NULL; CHECK chiuso | Tipo di finestra dichiarata |
| `opens_at` | `timestamptz` | No | — | NULL ammessi | Inizio accesso / apertura dichiarata |
| `closes_at` | `timestamptz` | No | — | NULL ammessi | Fine accesso / scadenza dichiarata |
| `open_ended` | `boolean` | Sì | `false` | NOT NULL | Continuità / senza termine di chiusura noto |
| `note` | `text` | No | — | NULL oppure anti-blank | Caveat editoriale (es. scadenza indicativa); non HTML/JSON |
| `sort_order` | `integer` | Sì | `0` | NOT NULL; `>= 0` | Ordine tra finestre concorrenti della stessa scheda |
| `superseded_at` | `timestamptz` | No | — | NULL = dichiarazione corrente/storica attiva | Non NULL = riga sostituita da proroga (PF8) |
| `created_at` | `timestamptz` | Sì | `now()` | NOT NULL | Creazione riga |
| `updated_at` | `timestamptz` | Sì | `now()` | NOT NULL | Ultimo aggiornamento (trigger) |

**Valori ammessi di `kind` (chiusi in M5):**

| Valore | Significato |
|---|---|
| `access` | Periodo/finestra di accesso alla possibilità |
| `application` | Periodo dedicato alle candidature **solo se** la modalità lo prevede; assente altrimenti |

Nessun'altra colonna in M5.1. **Non** introdurre: `is_active`; `status` temporale persistito; `published_at` piattaforma; `archived_at`; `valid_from`/`valid_to` generici oltre al modello sopra; JSONB; FK a Fonti/Evidenze/Candidature; `person_id`/`business_id`.

### 28.10 Vincoli CHECK M5.1

1. `kind in ('access', 'application')`.
2. Anti-blank su `note` quando non NULL: `note IS NULL OR btrim(note) <> ''`.
3. `sort_order >= 0`.
4. Intervallo coerente: `opens_at IS NULL OR closes_at IS NULL OR opens_at <= closes_at`.
5. Continuità: `NOT (open_ended AND closes_at IS NOT NULL)`.
6. Ancora temporale minima: `open_ended OR opens_at IS NOT NULL OR closes_at IS NOT NULL`.

### 28.11 Decisione su `is_active` e stato temporale

**`is_active` escluso** (come Beneficio VO).  
**Stato temporale** (`futura`, `aperta`, `in scadenza`, `scaduta`, `prorogata`) **non** è colonna: è **derivato** da `opens_at` / `closes_at` / `open_ended` / `superseded_at` e dal tempo di lettura. Non fondere con pubblicazione o stato sostanziale (PF7).

### 28.12 Proroga e PF8

Una **proroga** non cancella il termine precedente:

1. sulla riga corrente impostare `superseded_at` (timestamp della sostituzione);
2. inserire una **nuova** riga con il nuovo `closes_at` (e gli altri campi dichiarati);
3. vietata la sovrascrittura silenziosa di `closes_at` come unico modo di rappresentare una proroga.

Correzioni di errore materiale (typo di data) restano aggiornamenti della stessa riga, distinte dalla proroga.

### 28.13 Senza scadenza e continuativa

- **Senza scadenza nota:** `open_ended = true`, `closes_at` NULL; `opens_at` opzionale.  
- **Continuativa:** stesso pattern; non richiede edizioni periodiche.  
- **Edizione ricorrente annuale:** nuova Opportunità (Logical §9), non nuova sola finestra della precedente.

### 28.14 Sospensione e riapertura

In M5 **non** si modellano come `kind` dedicati. Restano sull'asse **sostanziale** (`suspended` / ritorno ad apertura sostanziale). Eventuali intervalli di sospensione strutturati sono **rinviabili** oltre M5 senza bloccare M5.1.

### 28.15 M5.2 — Milestone sull'AR

Complemento alle finestre, **non** sostituto. Su `public.opportunities`, una sola colonna nuova in M5.2:

| Colonna | Tipo | Obbl. | Significato |
|---|---|---|---|
| `external_official_published_at` | `timestamptz` | No | Data di pubblicazione ufficiale **esterna** dichiarata (se nota); ≠ pubblicazione piattaforma M7; ≠ `opens_at` di accesso |

Nessun'altra milestone temporale sull'AR in M5.2. Censimento resta `created_at` (M1). Apertura/scadenza **non** si denormalizzano sull'AR.

### 28.16 PK, FK, indici

**M5.1**

- PK: `id`.
- FK unica: `opportunity_id` → `public.opportunities(id)` **ON DELETE CASCADE**.
- Indice non-unique su `opportunity_id` (lookup 0..N; pattern Beneficio).
- Nessuna UNIQUE su `opportunity_id` (cardinalità 0..N).
- Nessuna FK verso sources, evidences, requirements, benefits, access procedures, profiles, businesses, access_modes.

**M5.2**

- Solo ADD COLUMN su `opportunities`; nessuna FK nuova.

### 28.17 Trigger `updated_at` (M5.1)

`public.set_opportunity_time_windows_updated_at()` — `SECURITY INVOKER`, `search_path = ''`, BEFORE UPDATE FOR EACH ROW. Pattern M3/M4.

### 28.18 RLS, policy, privilegi (M5.1)

ENABLE RLS; nessuna policy in M5; `REVOKE ALL` da `anon` e `authenticated`; nessun GRANT.

### 28.19 Seed

Nessun seed.

### 28.20 Migration previste

```text
create_opportunity_time_windows          — M5.1
add_opportunity_temporal_milestones      — M5.2
```

Dipendenza: solo `public.opportunities` (M1.1). Non dipende da M2–M4 né da M7. Non introduce assi di pubblicazione.

### 28.21 Compatibilità PostgreSQL

Target **17.6.1**. Niente enum nativi (CHECK testuale come Requisiti); niente JSONB/EAV; niente SECURITY DEFINER.

### 28.22 Invarianti fisiche M5

1. Temporalità di accesso = VO composizione, non E02 e non C05.  
2. Cardinalità strutturale **0..N**; bozza senza finestre ammissibile.  
3. Stato temporale **derivato**, non colonna status.  
4. Pubblicazione/ritiro/visibilità/archiviazione **fuori** M5 (M7).  
5. Proroga storicizzata via `superseded_at` + nuova riga (PF8).  
6. Unica FK verso `opportunities`, CASCADE.  
7. Nessuna FK a Fonti/Evidenze/Candidature/soggetti.  
8. Sospensione/riapertura non tipizzate come finestre in M5.  
9. Edizione ≠ proroga.  
10. Nessun seed; nessuna policy; RLS+REVOKE.  
11. M5.2: solo `external_official_published_at` sull'AR.

### 28.23 Criteri di accettazione

Esiste `opportunity_time_windows` con le colonne §28.9; `kind` chiuso; CHECK intervallo/`open_ended`; indice su `opportunity_id`; CASCADE; trigger INVOKER; RLS senza policy; assenza di pubblicazione/archiviazione/`is_active`; M5.2 aggiunge solo `external_official_published_at`; bozza senza finestre inseribile; ModalitàAccesso e ProceduraAccesso invariate.

---

## 29. Cardinalità

| Relazione | Cardinalità | Ownership | Note |
|---|---|---|---|
| Opportunità → Origine | 1 | AR | Obbligatoria |
| Opportunità → Tipologia | 1..N | AR | Almeno una |
| Opportunità → Fonte | 1..N | E02 | ≥1 (pubblicabilità); CASCADE delete da Opportunità |
| Opportunità → Evidenza | 0..N | E02 | CASCADE delete da Opportunità; nessun stato locale |
| Evidenza → Fonte | 0..1 | provenance | Opzionale; stessa Opportunità (FK composta); delete Fonte → `SET NULL (source_id)` |
| Opportunità → Promotore | 1..N | R02 | ≥1 |
| Opportunità → EnteGestore/Finanziatore | 0..N | R02 | — |
| Opportunità → Pubblicatore | 0..1 (tipico) | R02 | — |
| Opportunità → Destinatario (CategoriaDestinatario) | 0..N strutturale; 1..N per pubblicabilità | C05 + ponte | M4.1; min 1 non enforceato in DB; ≠ soggetti concreti |
| Opportunità → Requisito | 0..N (tipico 1..N) | E02 | Nucleo richiede condizioni |
| Opportunità → Beneficio | 0..N strutturale; 1..N per pubblicabilità | VO | M4.3; min 1 non enforceato in DB; ≠ erogazione |
| Opportunità → ModalitàAccesso | 0..N strutturale; 1..N per pubblicabilità | C05 + ponte | M2; min 1 non enforceato in DB |
| Opportunità → ProceduraAccesso | **0..1** | VO | M4.4; istruzioni + URL operativo opzionale; ≠ Fonte; ≠ Candidatura |
| Opportunità → FinestraAccesso | **0..N** | VO | M5.1 `opportunity_time_windows`; proroghe via `superseded_at`; ≠ pubblicazione M7 |
| Opportunità → Territorio / Mercato | 0..N | R02 | D18 |
| Opportunità → Verifica | 0..N | E02 | — |
| Opportunità → CandidaturaOpportunità | **0..N** | E02 | Mai 1..N obbligatorio |
| Opportunità → Valutazione | 0..N | E02/VO | Condizionata |
| Opportunità → Assegnazione | 0..N | E02 | Condizionata |
| Opportunità → Evento | 0..N | R02 | Facoltativo |
| Opportunità → Contenuto Editoriale | 0..N | Inversa | Non ownership |
| Opportunità → Collaborazione | 0..N | Inversa derivata | D22 inverso aggregativo |
| Opportunità → ServizioProfessionale | 0..N | R02 | DV10 aperta |

---

## 30. Ciclo di vita dell'Opportunità

Percorso principale (non unico asse): censimento → completamento → verifica → revisione editoriale → approvazione → pubblicazione → apertura → aggiornamento/proroga/sospensione → chiusura/revoca → ritiro → archiviazione.

**Percorsi alternativi ammessi:** mai pubblicata; respinta editorialmente; ritirata prima dell'apertura; esterna già scaduta al censimento; senza candidatura; senza selezione; chiusa senza assegnazione; riaperta; duplicata (gestione aperta); obsoleta; fonte non disponibile (non cancellazione automatica).

---

## 31. Ciclo di vita della Candidatura

Solo se E02 presente:

| Autorità | Percorso |
|---|---|
| Interna (C) | avvio → bozza → presentazione → integrazione → ritiro \| ammissione/esclusione → valutazione → approvazione/respinta → eventuale assegnazione → chiusura |
| Registrata (B) | stati **dichiarati** (presentata, ritirata, esito dichiarato); non lifecycle governato pieno |
| Esterna A | nessun lifecycle |

Stato dichiarato ≠ stato governato ≠ stato verificato.

---

## 32. Business permissions

Ruoli di business locali (PL4, ≠ privilegi tecnici PF14):

| Azione | Ruoli tipici |
|---|---|
| Censire / segnalare | Segnalatore, redazione, censitore |
| Completare / modificare scheda | Pubblicatore, redazione, promotore interno |
| Verificare | Verificatore |
| Approvare / pubblicare / ritirare / archiviare | Redazione, amministratore dominio |
| Registrare candidatura esterna | Candidato dichiarante, redazione |
| Presentare/ritirare candidatura interna | Candidato (Persona; Impresa via rappresentanza) |
| Valutare / assegnare | Valutatore, promotore interno, amministratore |
| Contestare | Soggetti legittimati (se PCa1) |

Account/sessioni/permessi tecnici → Identità & Accessi (D49).

---

## 33. Rappresentanza e snapshot storici

Appartenenze autorevole su Persona–Impresa (D17, utilizzo). Opportunità può conservare **SnapshotRappresentanza** minimo per candidatura, presentazione, valutazione, assegnazione, contestazione, audit storico concettuale. Snapshot ≠ autorità corrente; non crea Appartenenza.

---

## 34. Domain Events

**Proprietari Opportunità (AR):** OpportunitàCensita; Completata; OrigineRegistrata; FonteAggiunta/Sostituita; EvidenzaAggiunta; Verificata; VerificaSuperata; Approvata/RespintaEditorialmente; Pubblicata; PubblicazioneProgrammata/Ritirata; Aperta; ScadenzaRegistrata/Prorogata; Sospesa; Riaperta; Chiusa; Revocata; Annullata; DichiarataObsoleta; Archiviata.

**Condizionati candidatura:** CandidaturaOpportunitàAvviata/Presentata/Ritirata/Integrata/Ammessa/Esclusa/Valutata; EsitoCandidaturaRegistrato.

**Condizionati assegnazione:** AssegnazioneRegistrata/Revocata; BeneficiarioRegistrato.

**Altri domini (non emessi qui):** CollaborazioneCreataDaOpportunità (Collaborazioni); EventoPubblicato; IscrizioneEventoRegistrata; ContenutoEditorialePubblicato; AppartenenzaVerificata; ProfiloProfessionaleVerificato.

Ogni evento: fatto avvenuto (PF15); senza payload tecnico; variante esterna/interna dichiarata dove rilevante.

---

## 35. Invarianti

1. Identità autonoma interna.  
2. Azionabilità (nucleo H8).  
3. ≥1 beneficio o accesso.  
4. Destinatari o criteri di destinatario.  
5. ≥1 modalità di accesso.  
6. Periodo o condizione temporale (salvo eccezione motivata, es. continuativa).  
7. Origine esplicita.  
8. Esterna ≠ trasferimento autorità istituzionale.  
9. Interna ⇒ soggetto responsabile.  
10–11. Fonte ≠ promotore; promotore ≠ pubblicatore.  
12–14. Destinatario ≠ candidato ≠ beneficiario; beneficio ≠ erogazione.  
15–19. Pubblicazione ≠ apertura ≠ verifica; visibilità ≠ pubblicazione; scadenza ≠ ritiro; chiusura ≠ archiviazione.  
20–26. Esistenza/chiusura senza candidature; candidatura non obbligatoria; 0..N; esterna non posseduta automaticamente; registrata con autorità limitata; interna governata.  
27–30. Distinzioni da CandidaturaCollaborazione, iscrizione Evento, richiesta Servizio, interesse.  
31–37. Valutazione/assegnazione/graduatoria non obbligatorie; esterna non appropriata; assegnazione ≠ erogazione/contratto/Collaborazione.  
38–41. ≠ Evento, Collaborazione, Editoriale, Servizio; prodotto finanziario commerciale non automatico.  
42–45. Professionista non soggetto; Appartenenze/Mercati autorevoli; snapshot non autorità.  
46–50. Collaborazioni derivate non owned; assi separati; storico; no duplica verifiche altrui; no processo esterno→interno implicito.  
51–56. Fonte irraggiungibile ≠ cancellazione; aggiornamento scheda ≠ modifica fatto esterno; proroga ≠ nuova Opportunità; edizione autonoma ≠ sola proroga; pubblicazione ≠ autorità istituzionale; aggregazioni inverse ≠ ownership.

---

## 36. Dipendenze e autorità esterne

| ID | Direzione | Classificazione | Maturità Map | Applicazione |
|---|---|---|---|---|
| D14 | → Persone | Necessaria | Consolidata | Promotore/candidato/beneficiario |
| D15 | → Imprese | Necessaria | Consolidata | Idem |
| D16 | → Professionisti | Facoltativa | Consolidata | Requisiti/destinatari qualificati |
| D17 | → Appartenenze | Necessaria quando applicabile | Provvisoria | Titolo rappresentanza (utilizzo) |
| D18 | → Mercati | Facoltativa | Provvisoria | Contesto |
| D22 | Collaborazioni → Opportunità | Facoltativa storica | Consolidata | Solo inbound storico |
| D27 | Eventi → Opportunità | Facoltativa | Provvisoria | Presentazione |
| D49 | → Identità & Accessi | Di supporto | Consolidata | Scritture |
| DV10 | Professionisti →? | Osservazione | Aperta | Non consolidata |
| DV9 | Collaborazioni → Eventi | — | Tangenziale | — |
| V8 | Vietata | — | Consolidata | No ownership soggetti |

PF5 su tutti i R02. Nessuna Opportunità → Collaborazioni di ownership.

---

## 37. Analisi dei cicli

| Coppia | Esito |
|---|---|
| Opportunità ↔ Collaborazioni | **Eliminato** — solo D22; aggregazione inversa non ownership |
| Opportunità ↔ Eventi | **Apparente** — D27 + eventuale R02 Opportunità→Evento (navigazione); oggetti distinti |
| Opportunità ↔ Professionisti | **Eliminato** — solo D16; DV10 non introduce ciclo |
| Opportunità ↔ Editoriali | **Eliminato** — D34 inbound editoriale |
| Opportunità ↔ Appartenenze | **Eliminato** — utilizzo D17 |
| Opportunità ↔ Mercati | **Eliminato** — D18 facoltativa |
| Opportunità ↔ Persone/Imprese | **Eliminato** — R02 identità; V8 |

---

## 38. Applicazione dei Domain Patterns

| Pattern | Esito | Note |
|---|---|---|
| PF1–PF3 | Applicabili | — |
| PF4 | **Non principale** | Eventuale su candidatura/assegnazione come legami di processo, non sul dominio intero |
| PF5 | Applicabile | R02 opachi |
| PF6–PF9 | Applicabili | — |
| PF10–PF11 | Applicabili | No badge unico |
| PF12–PF14 | Applicabili | — |
| PF15–PF18 | Applicabili | — |
| PF19–PF20 | Applicabili / per analogia | — |
| PL4 | Applicabile | Ruoli locali di business |
| PC1 | Applicato | §4.2 |
| PC2 | **Candidato / rinviato** | Un solo AR oggi; apertura futura §41 |
| PCa1 | **Candidato**, non consolidato | §25; non forzata |
| Fonte/Evidenza/Snapshot/Pubblicazione/Verifica/Temporalità | Applicabili | Pattern locali |

---

## 39. Transazioni concettuali

| Transazione | Aggregate | Note |
|---|---|---|
| Censire | Opportunità | Crea A01 + Fonte minima |
| Aggiungere Fonte / Evidenza | Opportunità | E02 |
| Completare / verificare / approvare / pubblicare | Opportunità | Assi editoriale/verifica/pubblicazione |
| Modificare scadenza / proroga / ritiro / obsolescenza / archiviare | Opportunità | Storico |
| Registrare candidatura esterna | Opportunità + E02 Candidatura | Autorità dichiarativa |
| Avviare/presentare candidatura interna | Opportunità + E02 | Autorità governata |
| Valutare / assegnare | Opportunità (+ Candidatura) | Solo B/C |
| Consistenza | Locale all'AR | Nessuna TX DB |

---

## 40. Rischi architetturali

| # | Rischio | Decisione / mitigazione |
|---|---|---|
| 1 | AR enorme | Entity condizionate; PC2 aperto |
| 2–5 | Fonte/Evidenza/Promotore/Pubblicatore confusi | Ruoli e E02 distinti |
| 6–7 | Appropriazione istituzionale/procedura | Origine esterna; esclusi |
| 8–9 | Candidatura obbligatoria/generica | 0..N; scenari; distinzioni |
| 10–12 | Valutazione/graduatoria/assegnazione improprie | Snapshot/registrazione; ≠ erogazione |
| 13–19 | Duplicazioni Eventi/Collab/Editoriali/Servizi/Professionista/Appartenenze/Mercati | Confini + R02 |
| 20–21 | Stato unico / perdita storico | Assi PF7; PF8 |
| 22–23 | Tipologie/menu rigidi | C05 filtrato |
| 24–27 | Dipendenze/cicli | D22/D27/D16 governati |
| 28–29 | PC2 prematuro/ignorato | Esplicitamente aperto |
| 30–35 | Contestazione/snapshot/dedup/verifica/origine/riapertura | PCa1 candidato; regole §8–§11 |

---

## 41. Questioni aperte

1. Eventuale promozione futura a più Aggregate Root (**PC2**): CandidaturaOpportunità, Valutazione, Assegnazione, Fonte, Graduatoria — riconosciuta esplicitamente, non decisa qui.
2. Procedure interne future e autonomia della procedura di accesso.
3. Edizioni, versionamento, deduplicazione semantica, riaperture vs nuova edizione.
4. Contestazione e rettifica (**PCa1**) come processo pieno.
5. Anonimizzazione; opportunità riservate; titolare pubblicante.
6. Soggetti non modellati; futuro dominio Organizzazioni; futuro dominio Servizi.
7. Confine con Eventi e eventuale censimento Opportunità → Eventi nella Dependency Map.
8. DV9; DV10.
9. Formazione, gare, convenzioni, missioni; prodotti finanziari commerciali.
10. Benefici multipli strutturali; requisiti computabili; matching; raccomandazioni.
11. Erogazioni e contratti successivi; Collaborazioni derivate come UX aggregativa.

---

## 42. Impatto potenziale sulla Dependency Map

**Non si modifica** `domain-dependency-map.md`. Si propongono:

| Voce | Impatto proposto | Motivazione |
|---|---|---|
| **D17** | Da Provvisoria a **Consolidata** (quando applicabile) | Utilizzo titolo di rappresentanza per candidatura/pubblicazione (§33); questo mapping fornisce la motivazione |
| **D18** | Da Provvisoria a **Consolidata** (facoltativa) | Mercato/territorio come contesto (§16, §29) |
| **Opportunità → Eventi** | Da censire come Facoltativa, se stabilizzata | Oggi solo D27 inbound + R02 navigabile (§36); non consolidata qui |
| **DV10** | Mantenere **aperta** | Nessuna Professionisti → Opportunità consolidata |
| **Opportunità → Collaborazioni** | Non introdurre ownership | Solo aggregazione inversa; D22 resta unidirezionale |
| Ciclo Opportunità ↔ Collaborazioni | Conferma **Eliminato** | §37 |

---

## 43. Checklist finale di conformità

| # | Verifica | Esito |
|---|---|---|
| 1–5 | Core, H8, rappresentazione, esterna/interna, AR motivato | Sì |
| 6–12 | Classificazione, Fonte/Evidenza, ruoli, destinatario/candidato, beneficio/erogazione, modalità≠candidatura | Sì |
| 13–18 | Candidatura 0..N, tre scenari, distinzioni | Sì |
| 19–26 | Valutazione/graduatoria/assegnazione; ≠ Evento/Collab/Editoriale/Servizio; Professionista; Appartenenze; Mercati | Sì |
| 27–37 | Assi, lifecycle, temporalità, pubblicaz./verifica/apertura/visibilità/scadenza/chiusura, storico | Sì |
| 38–42 | PF4/PF5/PC2/PCa1, dipendenze, cicli | Sì |
| 43–47 | Aggregazioni inverse, no Organizzazioni/Servizi | Sì |
| 48–50 | No implementazione; solo questo file; rilettura | Sì |

---

## 44. Conclusione

Il Physical Domain Mapping di Opportunità adotta **un solo Aggregate Root `Opportunità`**, coincidente con la **rappresentazione governata** della possibilità azionabile strutturata. Fonte ed Evidenza sono Entity dipendenti owned dall'Opportunità, con invarianti M3.1/M3.2 (§13–§14): Fonte con stato locale e senza tipologia/attendibilità; Evidenza senza stato locale, con `supports_aspect` opzionale chiuso e provenance opzionale via FK composta. Requisito resta Entity dipendente; Beneficio e ProceduraAccesso (M4.4, VO 0..1 con istruzioni e URL operativo opzionale) sono Value Object; la **Temporalità di accesso** (§28, M5) è VO di composizione `opportunity_time_windows` (**0..N**) con stato temporale **derivato**, distinta da pubblicazione/ritiro/visibilità piattaforma (M7.2) e da `external_official_published_at` (M5.2). **M7.1** formalizza `opportunity_verifications` (E02, 0..N, current-state per aspetto); **M7.2** aggiunge sull'AR gli assi `editorial_status` / `publication_status` / `visibility_level` e i timestamp `platform_*` (§24, §26), senza storico pubblicazioni, senza mini-CMS e senza archiviazione (resta `representation_status`). ModalitàAccesso è elenco controllato (M2), distinto dalla ProceduraAccesso; Origine è attributo controllato dell'AR (`external`|`internal`), non catalogo. **CandidaturaOpportunità** è Entity dipendente **opzionale (0..N)** con tre scenari di autorità; valutazione e assegnazione sono condizionate. PF4 non è il pattern principale; PF5 governa i riferimenti; **PC2 e PCa1 restano aperti**. Gli impatti sulla Dependency Map sono proposti, non applicati.

---

---

## 45. C3 Cultural Taxonomy Enrichment (addendum)

**Hybrid C.** Cultura non è BC e non è Aggregate Root. `opportunity_types` classifica la **natura** (call/incentive/…); non l’ambito culturale.

**C3.5** (`20260813140000_create_opportunity_activity_scopes.sql`):
- catalogo `opportunity_activity_scopes` (C03; seed `culture`, `heritage`, `creative_industries`);
- bridge `opportunity_activity_scope_assignments` (PK `(opportunity_id, scope_code)`; CASCADE da Opportunity; RESTRICT su catalogo);
- RLS mirror di `opportunity_type_assignments` (SELECT pubblico su Opp published+public; INSERT/UPDATE party roles);
- nessun backfill da Evento/titolo; discipline C3.7 deferred.

Un’Opportunità culturale può esistere **senza** Evento tramite assignment di scope.

*Fine del Physical Domain Mapping di Opportunità.*
