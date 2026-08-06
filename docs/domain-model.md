# Domain Model — ImmigratiImprenditori.it (Architettura database v1)

> Sintesi autoritativa consolidata dell’architettura di dominio della piattaforma allo stato della **architettura database v1**.
> Non sostituisce i documenti Logical e Physical di ciascun dominio: per contratti dettagliati, vocabolari, colonne e vincoli si rimanda sempre a quei documenti.
> Storia. Le versioni precedenti descrivevano 11 domini logici con Physical ancora da avviare e alcune aree come “future”. Questa versione riflette i **13 domini** pubblicati (Logical + Physical + SQL) e l’allineamento del database remoto.

---

## Indice

1. [Scopo](#1-scopo)
2. [Principi generali](#2-principi-generali)
3. [Stato dell’architettura database v1](#3-stato-dellarchitettura-database-v1)
4. [Inventario dei domini](#4-inventario-dei-domini)
5. [Aggregate Root principali](#5-aggregate-root-principali)
6. [Confini definitivi](#6-confini-definitivi)
7. [Ownership](#7-ownership)
8. [Relazioni tra domini](#8-relazioni-tra-domini)
9. [Lifecycle e pubblicazione](#9-lifecycle-e-pubblicazione)
10. [Derivazioni non persistite](#10-derivazioni-non-persistite)
11. [Elementi rinviati](#11-elementi-rinviati)
12. [Sicurezza e accesso](#12-sicurezza-e-accesso)
13. [Invarianti generali](#13-invarianti-generali)
14. [Riferimenti documentali](#14-riferimenti-documentali)
15. [Questioni aperte post-v1](#15-questioni-aperte-post-v1)

---

## 1. Scopo

ImmigratiImprenditori.it rappresenta, connette e valorizza Persone e Imprese (con attenzione ai percorsi di origine immigrata, senza automatismi), le opportunità e i servizi accessibili, le relazioni internazionali, le collaborazioni dichiarate, gli eventi, i contenuti editoriali e la lettura aggregata dell’Osservatorio.

Questo Domain Model:

* fissa il linguaggio comune e i confini tra i **13 domini** pubblicati;
* dichiara lo **stato conclusivo dello schema database v1**;
* distingue ciò che è **pubblicato** da ciò che resta **rinviato intenzionalmente**;
* non anticipa API, frontend, policy RLS applicative complete né dati di prodotto.

---

## 2. Principi generali

1. **Un fatto, un dominio proprietario.** Solo il dominio proprietario definisce e modifica il fatto; gli altri lo riferiscono, lo narrano o lo aggregano.
2. **Riferimento ≠ incorporazione.** I domini si riferiscono per identità stabile, senza duplicare attributi sostanziali.
3. **Account ≠ Persona ≠ Impresa ≠ Organizzazione.** Concetti distinti; l’accesso non crea diritti sostanziali.
4. **Pubblicazione ≠ autorizzazione di accesso.** Lo stato editoriale/pubblicazione è del dominio proprietario; l’accesso tecnico è fase successiva (Identità & Accessi + policy).
5. **Lifecycle ≠ cancellazione.** Si preferiscono stati, archiviazione e conservazione storica alle cancellazioni distruttive.
6. **Physical traduce Logical.** Il Physical e le migration non inventano semantica oltre i Logical chiusi del ciclo 1.
7. **Derivati non persistiti** salvo contratto esplicito (§10).

---

## 3. Stato dell’architettura database v1

| Voce | Stato |
|---|---|
| Domini di business/supporto pubblicati | **13** |
| Logical | Completati per i 13 domini |
| Physical (domain-mapping) | Completati per i 13 domini |
| Migration Plan | Completati per i 13 domini |
| SQL / migration | Pubblicati su `main` e applicati |
| Head migration locale e remoto | **`20260811110000`** |
| Pending migration | **0** |
| Architettura database v1 | **Completata** |
| Accesso applicativo (policy RLS complete, contesti, API) | **Non incluso** nella chiusura schema |
| Frontend e dati di prodotto | **Non inclusi** |

La chiusura riguarda lo **schema dati e i confini di dominio**. Non implica piattaforma production-ready né prodotto v1 completo.

---

## 4. Inventario dei domini

| Dominio | Responsabilità | Aggregate Root | Stato v1 | Principali rinvii |
|---|---|---|---|---|
| **Persone** | Anagrafica e profilo personale, lingue/competenze/storie personali | Persona | Pubblicato | Account, membership, qualifiche professionali |
| **Imprese** | Soggetto economico, sedi, settori, canali, certificazioni, media | Impresa | Pubblicato | Membership Org; fusione Org–Impresa |
| **Appartenenze** | Relazioni datate Persona–Impresa, titoli, evidenze | Appartenenza | Pubblicato | Membership Persona/Impresa–Organizzazione |
| **Mercati Internazionali** | Mercati, paesi, presenze, interessi, attività, relazioni, esigenze | Mercato internazionale | Pubblicato | Cataloghi geografici esterni avanzati |
| **Professionisti** | Profilo professionale, titoli, servizi, copertura | Profilo professionale | Pubblicato | FEV avanzato; catalogo territori |
| **Opportunità** | Opportunità strutturate, fonti, requisiti, benefici, verifiche | Opportunità | Pubblicato | Processo candidatura avanzato |
| **Servizi** | Offerte e richieste di servizio pubblicabili | OffertaDiServizio; RichiestaDiServizio | Pubblicato | Matching, contratti, pagamenti, CRM |
| **Eventi** | Evento, edizioni, sessioni, ruoli, iscrizioni dichiarative | Evento | Pubblicato | Ticketing, check-in, RRULE, Org strutturali |
| **Contenuti** | Unità redazionali narrative/informative e collegamenti | Contenuto | Pubblicato | CMS esterno, Storage come dominio |
| **Organizzazioni** | Schede istituzionali/associative non economiche | Organizzazione | Pubblicato | Membership; grafo Org–Org; multi-sede |
| **Identità & Accessi** | Account applicativo, associazione Persona, ruoli elevati minimi | Account | Pubblicato | Deleghe, consensi, contesto Org, account di servizio |
| **Collaborazioni** | Schede dichiarative di collaborazione, promotore, controparti | Collaborazione | Pubblicato | Matching; fase relazionale operativa; contratti |
| **Osservatorio** | Indicatori, fonti statistiche, valori aggregati | Indicatore | Pubblicato | Microdati; dataset; feed ETL; dashboard persistite |

**Descrizione sintetica**

* **Persone** — soggetto sociale/anagrafico; non Account, non membership, non qualifica professionale.
* **Imprese** — soggetto economico e fatti owned; non Persone incorporate.
* **Appartenenze** — relazione stabile Persona–Impresa; legittima azioni “per conto”, senza trasferire ownership.
* **Mercati Internazionali** — contesto e relazioni internazionali; non incorpora Impresa/Opportunità.
* **Professionisti** — profilo e copertura di una Persona; ≠ Impresa che offre servizi strutturati (Servizi).
* **Opportunità** — beneficio/accesso strutturato; non diventa automaticamente Collaborazione.
* **Servizi** — offerte e richieste di servizio; ≠ marketplace, pagamenti, HR.
* **Eventi** — iniziativa e occorrenze (Edizione owned); ≠ Contenuto che la racconta.
* **Contenuti** — narrazione editoriale; non modifica i fatti descritti; ≠ indicatori Osservatorio.
* **Organizzazioni** — scheda istituzionale; ≠ Impresa (cooperative economiche restano Imprese).
* **Identità & Accessi** — Account e ruoli di accesso; non possiede fatti sostanziali; non è `auth.users`.
* **Collaborazioni** — scheda dichiarativa ciclo 1; ≠ Appartenenza; ≠ messaggistica/contratti.
* **Osservatorio** — soli aggregati statistici; ownership redazionale implicita; ≠ microdati, rapporti narrativi.

Funzioni trasversali **non** elevate a dominio v1 dedicato: Tassonomia condivisa (cataloghi già usati), Ricerca, Notifiche.

---

## 5. Aggregate Root principali

| Dominio | Aggregate Root principale | Note ciclo 1 |
|---|---|---|
| Persone | Persona | Realizzata su `profiles` e satelliti |
| Imprese | Impresa | |
| Appartenenze | Appartenenza | |
| Mercati Internazionali | Mercato internazionale | Relazioni/presenze owned o collegate |
| Professionisti | Profilo professionale | |
| Opportunità | Opportunità | |
| Servizi | **OffertaDiServizio** e **RichiestaDiServizio** | Due AR distinte |
| Eventi | **Evento** | Edizione e Sessione sono owned, non AR |
| Contenuti | Contenuto | |
| Organizzazioni | Organizzazione | |
| Identità & Accessi | Account | |
| Collaborazioni | Collaborazione | Partecipanti owned |
| Osservatorio | **Indicatore** | Valore subordinato all’Indicatore; Fonte statistica entity di dominio condivisibile (non AR; non owned da un singolo Indicatore) |

---

## 6. Confini definitivi

### Organizzazione ≠ Impresa

Organizzazioni istituzionali/associative non economiche hanno scheda propria. Le cooperative e soggetti economici restano in Imprese. Nessuna fusione di schede; eventuali link sono espliciti e non trasferiscono ownership.

### Account ≠ Persona

Account è costrutto applicativo di Identità & Accessi, distinto da `auth.users` e da `profiles`. L’associazione Account–Persona è opzionale e non crea Persona. L’accesso non crea membership, rappresentanza o ownership.

### Appartenenza ≠ Collaborazione

Appartenenza è relazione stabile Persona–Impresa. Collaborazione (ciclo 1) è scheda dichiarativa di ricerca/offerta/partnership. Nessuna delle due genera automaticamente ruoli applicativi o permessi.

### Professionista ≠ Persona

Il Professionista è un profilo/ruolo della Persona nel dominio Professionisti. Le qualifiche restano lì; non si duplicano in Persone, Imprese o Servizi.

### Servizi ≠ Professionisti ≠ Imprese

Servizi possiede Offerta/Richiesta strutturate. `professional_services` / `business_services` restano fatti di altri domini, eventualmente riferiti come provenienza opzionale.

### Osservatorio ≠ Contenuti

Osservatorio persiste indicatori e valori aggregati. Contenuti possiede la narrazione (anche su temi statistici). Rapporti/dossier narrativi non sono AR dell’Osservatorio nel ciclo 1.

### Evento ≠ Contenuto

Evento/Edizione appartengono a Eventi. La comunicazione editoriale dell’evento appartiene a Contenuti (collegamenti narrativi, non ownership del fatto).

---

## 7. Ownership

* I fatti appartengono al dominio che li definisce.
* **Account** e **`auth.users`** non sono owner sostanziali dei fatti di business.
* Ownership **Persona | Impresa | Redazione** esiste solo dove il Logical/Physical del dominio lo contrattualizzano (es. Contenuti, Organizzazioni, Collaborazioni con Persona XOR Impresa XOR Redazione, altri assi editoriali).
* **Identità & Accessi** interpreta ruoli e contesti di accesso; non crea ownership.
* **Appartenenze** fornisce legittimazione relazionale; non trasferisce ownership dei fatti Impresa/Persona.
* **Osservatorio**: ownership redazionale **implicita** (nessuna colonna owner Persona/Impresa/Account nel ciclo 1). Unico AR: Indicatore. I Valori sono subordinati all’Indicatore; le Fonti statistiche sono entità condivisibili owned dal dominio e referenziate obbligatoriamente dai Valori (Fonte ≠ Organizzazione; ente produttore testuale nel ciclo 1).
* **Contenuti** possiede la narrazione, non i fatti narrati.
* **Organizzazioni** non assorbe Imprese né Persone.

---

## 8. Relazioni tra domini

| Relazione | Semantica | Forma tipica v1 |
|---|---|---|
| Identità → Persone | Associazione Account–Persona | FK / legame strutturale opzionale |
| Identità → Appartenenze | Contesto “per conto di” (futuro pieno) | Rinvio parziale; ciclo 1 minimo |
| Appartenenze → Persone, Imprese | Relazione owned | FK strutturali |
| Collaborazioni → Persone, Imprese | Owner/promotore/controparti | FK strutturali; Appartenenza opzionale |
| Professionisti → Persone | Profilo senza Persona sottostante impossibile | FK strutturale |
| Servizi → Persone, Imprese | Owner XOR; provider/source opzionali | FK strutturali / SET NULL |
| Eventi → Persone, Imprese | Owner XOR; ruoli e iscrizioni | FK strutturali |
| Eventi → Professionisti | Relatore opzionale | FK strutturale opzionale |
| Eventi → Opportunità, Servizi | Contesto facoltativo | FK SET NULL |
| Eventi → Mercati, Lingue | Link owned | FK |
| Contenuti → altri domini | Collegamenti narrativi | Link owned; non ownership |
| Osservatorio → business_sectors | Dimensione settore opzionale sui valori | FK RESTRICT opzionale |
| Osservatorio → altri domini | Solo sorgenti concettuali aggregate | Nessuna FK a Persone/Imprese/Org/Contenuti nel ciclo 1 |
| Organizzazioni → Imprese | Link facoltativo non fusione | Secondo Physical Org |
| Organizzazioni → membership | — | **Rinviato** |

Riferimenti puramente testuali (es. etichetta organizzazione esterna) non sostituiscono FK strutturali.

---

## 9. Lifecycle e pubblicazione

Principi comuni (i vocabolari restano owned da ciascun dominio):

* **Lifecycle operativo** e **pubblicazione** sono assi distinti.
* **Archiviazione** ≠ cancellazione; lo storico va conservato dove previsto.
* Non esiste un lifecycle globale unico imposto a tutti i domini.
* Pubblicazione di un fatto **non** equivale a GRANT/policy di lettura.
* Visibilità sostanziale (`public`/`private` ove prevista) ≠ policy RLS applicativa.

---

## 10. Derivazioni non persistite

Salvo contratto esplicito di un dominio, **non** si persistono:

* booleani `can_*` e permessi risultanti;
* contesti applicativi materializzati;
* matching, ranking, score di compatibilità;
* dashboard, trend, serie calcolabili, conteggi UI;
* stato “ultimo” denormalizzato;
* diritti desunti da Appartenenza/Account;
* aggregazioni di sola presentazione.

Queste capacità restano query, servizi applicativi o fasi future.

---

## 11. Elementi rinviati

Scelte deliberate, non incompletezze accidentali dello schema v1.

| Elemento rinviato | Dominio proprietario o fase futura | Motivo |
|---|---|---|
| Membership Persona/Impresa–Organizzazione | Appartenenze (+ Org) | Fuori ciclo 1 Org |
| Relazioni Organizzazione–Organizzazione | Organizzazioni / Appartenenze | Grafo rinviato |
| Multi-sede Organizzazioni | Organizzazioni | Ciclo 1 minimale |
| Deleghe e consensi | Identità & Accessi (+ Privacy futura) | Fuori ciclo 1 Identità |
| Contesto Organizzazione in Identità | Identità & Accessi | Dipende da membership |
| Account di servizio | Identità & Accessi | Non nel ciclo 1 |
| Matching Collaborazioni | Collaborazioni (applicativo) | Invariante non SQL |
| Fase relazionale Collaborazioni | Collaborazioni | Rinviata operativamente |
| Dataset, feed ETL, scraping Osservatorio | Osservatorio / infra | Ciclo 1 solo registro+valori |
| Cataloghi geografici / paesi ISO | Tassonomia | Opachi o assenti dove previsto |
| Storage / media documentali / FEV | Domini proprietari + infra | Non importati implicitamente |
| Policy RLS applicative complete | Trasversale / Identità | Fase post-schema |
| Integrazioni retroattive extra tra domini | Vari | Evitare FK speculative |

Aree di prodotto ancora fuori inventario domini v1 (non confuse con i 13 pubblicati): Formazione didattica avanzata, Immobiliare verticale, Reputazione aggregata, Pagamenti, Contratti, Privacy come bounded context dedicato.

---

## 12. Sicurezza e accesso

* RLS è abilitata sulle tabelle pubbliche dello schema.
* I domini recenti adottano tipicamente **deny-by-default** (RLS on, FORCE off, zero policy, REVOKE verso `anon`/`authenticated`).
* Esiste un **subset storico** (fondazione Persone/training/cataloghi) con policy/GRANT preesistenti: richiede consolidamento trasversale successivo.
* Le **policy applicative complete** non fanno parte della chiusura architetturale v1.
* Identità & Accessi supporta i futuri contesti applicativi; **non** possiede password, token, OAuth o MFA come fatti di dominio.
* La piattaforma **non** è dichiarata production-ready da questo documento.

---

## 13. Invarianti generali

1. Ogni fatto ha un unico dominio proprietario.
2. Account non crea Persona, membership o ownership.
3. Organizzazione è distinta da Impresa.
4. Appartenenza è distinta da Collaborazione.
5. Le qualifiche professionali restano in Professionisti.
6. Contenuti possiede la narrazione, non i fatti narrati.
7. Osservatorio persiste solo aggregati del ciclo 1.
8. Nessun microdato statistico nel ciclo 1 Osservatorio.
9. Documenti e Storage non sono implicitamente importati nei domini.
10. Autorizzazioni e RLS non sono desunte automaticamente dai fatti.
11. I rinvii non devono essere anticipati da FK speculative.
12. Le entità derivate non vengono persistite senza necessità.
13. Il database conserva storico e usa lifecycle invece di cancellazioni distruttive ove previsto.
14. I domini recenti adottano deny-by-default.
15. Il Physical traduce il Logical, non inventa semantica.

---

## 14. Riferimenti documentali

Per ciascun dominio: Logical, Physical, Migration Plan e report di chiusura (M8.2 o equivalente).

| Dominio | Logical | Physical | Migration Plan | Chiusura |
|---|---|---|---|---|
| Persone | `logical/persone.md` | `domain-mapping/persone.md` | `migrations/persone-migration-plan.md` | Fondazione / tag storico (M8.2 formale assente) |
| Imprese | `logical/imprese.md` | `domain-mapping/imprese.md` | `migrations/imprese-migration-plan.md` | `imprese-m8.2-validation-report.md` |
| Appartenenze | `logical/appartenenze.md` | `domain-mapping/appartenenze.md` | `migrations/appartenenze-migration-plan.md` | `appartenenze-m8.2-validation-report.md` |
| Mercati Internazionali | `logical/mercati-internazionali.md` | `domain-mapping/mercati-internazionali.md` | `migrations/mercati-internazionali-migration-plan.md` | `mercati-internazionali-m8.2-validation-report.md` |
| Professionisti | `logical/professionisti.md` | `domain-mapping/professionisti.md` | `migrations/professionisti-migration-plan.md` | `professionisti-validation-report.md` (M8.2) |
| Opportunità | `logical/opportunita.md` | `domain-mapping/opportunita.md` | `migrations/opportunita-migration-plan.md` | `opportunita-m8.2-validation-report.md` |
| Servizi | `logical/servizi.md` | `domain-mapping/servizi.md` | `migrations/servizi-migration-plan.md` | `servizi-m8.2-validation-report.md` |
| Eventi | `logical/eventi.md` | `domain-mapping/eventi.md` | `migrations/eventi-migration-plan.md` | `eventi-m8.2-validation-report.md` |
| Contenuti | **`logical/contenuti.md`** | `domain-mapping/contenuti.md` | `migrations/contenuti-migration-plan.md` | `contenuti-validation-report.md` (M8.2) |
| Organizzazioni | `logical/organizzazioni.md` | `domain-mapping/organizzazioni.md` | `migrations/organizzazioni-migration-plan.md` | `organizzazioni-m8.2-validation-report.md` |
| Identità & Accessi | `logical/identita-accessi.md` | `domain-mapping/identita-accessi.md` | `migrations/identita-accessi-migration-plan.md` | `identita-accessi-m8.2-validation-report.md` |
| Collaborazioni | `logical/collaborazioni.md` | `domain-mapping/collaborazioni.md` | `migrations/collaborazioni-migration-plan.md` | `collaborazioni-m8.2-validation-report.md` |
| Osservatorio | `logical/osservatorio.md` | `domain-mapping/osservatorio.md` | `migrations/osservatorio-migration-plan.md` | `osservatorio-m8.2-validation-report.md` |

**Legacy:** `docs/architecture/logical/contenuti-editoriali.md` resta documento storico; il riferimento autoritativo corrente è **`contenuti.md`**.

Trasversali consolidati v1: `logical/reconciliation-report.md` (riconciliazione trasversale dei 13 domini pubblicati; decisioni bloccanti chiuse; residue post-v1), `physical/domain-dependency-map.md` (fotografia delle dipendenze v1, coerente con Logical/Physical e con questo Domain Model), `physical/architecture-baseline.md` e convenzioni. Nessuno dei due richiede un ulteriore aggiornamento obbligatorio nel consolidamento documentale corrente.

---

## 15. Questioni aperte post-v1

Le questioni sotto sono **evoluzione futura**, non blocchi dello schema v1 già pubblicato.

| Tema | Natura |
|---|---|
| Consolidamento policy RLS trasversale (legacy vs deny-by-default) | Applicativo / sicurezza |
| Deleghe, consensi, contesto Org, account di servizio | Identità & Accessi |
| Membership e grafo Organizzazioni | Appartenenze / Org |
| Matching e fase relazionale Collaborazioni | Collaborazioni + app |
| Feed, dataset, soglia editoriale operativa Osservatorio | Osservatorio + app |
| Cataloghi geografici/paesi e Storage/FEV | Infra / tassonomia |
| Formazione didattica, Immobiliare, Reputazione, Pagamenti, Contratti, Privacy dedicata | Domini/prodotti futuri |
| Priorità e profondità delle verifiche dichiarate | Prodotto |
| Continuity storica fusioni/cessioni Imprese | Prodotto / Imprese |

Sono **chiuse** rispetto allo stato v1 (non riaprire): esistenza di Servizi, Eventi, Organizzazioni, Identità ciclo 1, Collaborazioni ciclo 1, Osservatorio ciclo 1 come domini pubblicati; passaggio al Physical “non ancora iniziato”; Organizzazioni come solo “candidato”.

---

**Architettura database v1 consolidata a livello Domain Model**, con Dependency Map e Reconciliation Report allineati. Nessun ulteriore aggiornamento obbligatorio di questi tre documenti prima del commit della baseline.
