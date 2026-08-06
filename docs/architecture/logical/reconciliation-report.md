# Reconciliation Report — Architettura database v1

> Documento di riconciliazione **trasversale**: chiarisce sovrapposizioni, responsabilità, Aggregate Root, ownership, dipendenze, confini e decisioni chiuse tra i **13 domini** pubblicati.
> Non sostituisce Domain Model, Dependency Map, Logical o Physical di dominio. Non inventaria colonne, DDL, FK complete, migration history, test runtime o report M8.2.
> Storia. Le revisioni precedenti riconciliavano 11 Logical pre-fisici e lasciavano aperte questioni poi chiuse da Logical/Physical/SQL. Questa versione allinea il rapporto allo **stato conclusivo dello schema v1**.

---

## Indice

1. [Stato architetturale](#1-stato-architetturale)
2. [Scopo e metodo](#2-scopo-e-metodo)
3. [Inventario delle decisioni](#3-inventario-delle-decisioni)
4. [Persone e Identità](#4-persone-e-identità)
5. [Imprese e Organizzazioni](#5-imprese-e-organizzazioni)
6. [Appartenenze e Collaborazioni](#6-appartenenze-e-collaborazioni)
7. [Professionisti](#7-professionisti)
8. [Opportunità, Servizi ed Eventi](#8-opportunità-servizi-ed-eventi)
9. [Contenuti](#9-contenuti)
10. [Osservatorio](#10-osservatorio)
11. [Ownership trasversale](#11-ownership-trasversale)
12. [Dipendenze e cicli](#12-dipendenze-e-cicli)
13. [Lifecycle e pubblicazione](#13-lifecycle-e-pubblicazione)
14. [Sicurezza e autorizzazioni](#14-sicurezza-e-autorizzazioni)
15. [Rinvii intenzionali](#15-rinvii-intenzionali)
16. [Questioni residue post-v1](#16-questioni-residue-post-v1)
17. [Decisioni chiuse](#17-decisioni-chiuse)
18. [Stato v1](#18-stato-v1)
19. [Riferimenti](#19-riferimenti)

---

## 1. Stato architetturale

| Voce | Dichiarazione |
|---|---|
| Domini riconciliati e pubblicati | **13** |
| Logical / Physical | Completati per i 13 |
| Migration Plan / SQL | Completati e applicati |
| DB locale e remoto | Allineati |
| Head migration | **`20260811110000`** |
| Pending migration | **0** |
| Domini roadmap v1 ancora “candidati” | **Nessuno** |
| Questioni aperte bloccanti per lo schema v1 | **Nessuna** |
| Rinvii intenzionali | Separati dalle decisioni chiuse (§15) |
| Policy RLS applicative e prodotto | **Fuori** dalla chiusura dello schema |

I 13 domini: Persone, Imprese, Appartenenze, Mercati Internazionali, Professionisti, Opportunità, Servizi, Eventi, Contenuti, Organizzazioni, Identità & Accessi, Collaborazioni, Osservatorio.

---

## 2. Scopo e metodo

Questo rapporto:

* assegna responsabilità e chiude sovrapposizioni tra domini;
* registra Aggregate Root e ownership trasversali;
* sintetizza dipendenze e cicli apparenti (dettaglio in Dependency Map);
* classifica decisioni come `chiusa`, `rinviata post-v1` o `esclusa`;
* mantiene solo questioni **realmente** future.

**Precedenza in contrasto:** (1) Logical definitivo del dominio, (2) Physical definitivo, (3) Domain Model consolidato, (4) Dependency Map consolidata, (5) questo rapporto (documento da correggere se obsoleto).

**Non fa:** secondo Domain Model; copia dei Physical; inventario DDL/FK; storia migration; M8.2.

---

## 3. Inventario delle decisioni

| ID | Tema | Decisione v1 | Dominio proprietario | Stato |
|---|---|---|---|---|
| D01 | Persona vs Account | Persona = anagrafica; Account = AR Identità; distinti da `auth.users` | Persone / Identità | chiusa |
| D02 | Impresa vs Organizzazione | Impresa economica; Org istituzionale non economica; no fusione AR | Imprese / Organizzazioni | chiusa |
| D03 | Appartenenza vs Collaborazione | Relazione stabile ≠ scheda dichiarativa | Appartenenze / Collaborazioni | chiusa |
| D04 | Persona vs Professionista | Professionista = profilo/ruolo della Persona nel dominio Professionisti | Professionisti | chiusa |
| D05 | Evento vs Contenuto | Scheda/edizioni in Eventi; narrazione in Contenuti | Eventi / Contenuti | chiusa |
| D06 | Osservatorio vs Contenuti | Aggregati in Osservatorio; rapporti narrativi in Contenuti | Osservatorio / Contenuti | chiusa |
| D07 | Ownership schede | Ogni fatto un solo owner; Persona\|Impresa\|Redazione solo dove contratto | Dominio proprietario | chiusa |
| D08 | Membership Organizzazioni | Persona/Impresa–Org **non** nel ciclo 1 | Appartenenze (+ Org) | rinviata post-v1 |
| D09 | Contesto Org in Identità | Dipende da membership; escluso ciclo 1 | Identità & Accessi | rinviata post-v1 |
| D10 | Deleghe e consensi | Fuori ciclo 1 Identità | Identità (+ Privacy futura) | rinviata post-v1 |
| D11 | Matching Collaborazioni | Non nello schema ciclo 1 | Collaborazioni / app | rinviata post-v1 |
| D12 | Dataset e feed Osservatorio | Solo registro indicatori/fonti/valori aggregati | Osservatorio | rinviata post-v1 |
| D13 | Documenti / Storage / FEV | Non importati implicitamente nei domini | Infra / domini | rinviata post-v1 |
| D14 | Policy RLS applicative | Deny-by-default strutturale recente; policy complete fuori chiusura | Trasversale / Identità | rinviata post-v1 |
| D15 | Servizi come dominio | Offerta + Richiesta AR; pubblicato | Servizi | chiusa |
| D16 | Organizzazioni come dominio | Pubblicato (non candidato) | Organizzazioni | chiusa |
| D17 | Microdati Osservatorio | Esclusi dal ciclo 1 | Osservatorio | esclusa |
| D18 | CRM / contratti / pagamenti Servizi | Esclusi dal ciclo 1 | Servizi | esclusa |
| D19 | Lifecycle globale unico | Escluso; assi owned per dominio | Trasversale | esclusa |
| D20 | Derivazione automatica diritti | Esclusa; membership/ownership ≠ permesso | Identità / tutti | esclusa |

---

## 4. Persone e Identità

| Principio | Esito v1 |
|---|---|
| Persona | Fatto anagrafico/sociale; AR Persone |
| Account | AR di Identità & Accessi |
| Distinzioni | Account ≠ `auth.users` ≠ Persona |
| Associazione | Account–Persona **0..1 / 0..1** nel ciclo 1 |
| Account senza Persona | Limitato/transitorio secondo contratto Identità |
| `account_registrato` | Derivato, non fatto sostanziale di ownership |
| Ruoli elevati | Minimi persistiti in Identità |
| Accesso | Non crea membership, rappresentanza o ownership |
| Legacy `profiles.id = auth.users.id` | Debito evolutivo; **non** riaprire come decisione semantica v1 |

**Rinviati:** multi-Account; Account di servizio; deleghe; consensi; contesto Organizzazione.

---

## 5. Imprese e Organizzazioni

| Principio | Esito v1 |
|---|---|
| Impresa | Soggetto economico |
| Organizzazione | Soggetto istituzionale/associativo **non** economico; dominio **pubblicato** |
| Cooperative economiche | Restano in Imprese |
| Fusione AR | Vietata |
| Ownership scheda Org | Ternaria secondo Logical/Physical Org |
| Link Impresa | Opzionale (`linked_business_id` o equivalente); ≠ owner; ≠ membership |
| `organization_officials` | Distinto da membership Appartenenze |
| Membership Org | **Assente** ciclo 1 |
| Grafo Org–Org | **Assente** ciclo 1 |
| Multi-sede | **Assente** ciclo 1 (sede descrittiva) |

Organizzazioni **non** è più dominio candidato.

---

## 6. Appartenenze e Collaborazioni

### Appartenenze

* Relazioni stabili **Persona–Impresa**.
* Ruoli, titoli, autorizzazioni gestionali owned dal dominio.
* Base del contesto Impresa per Identità (derivazione, senza ownership Identità sulla membership).

### Collaborazioni

* Scheda **dichiarativa** (ciclo 1).
* Promotore e controparti; ownership **Persona XOR Impresa XOR Redazione** secondo contratto.
* **Nessun** matching, fase relazionale operativa, contratto o autorizzazione applicativa automatica.

**Rinviati:** membership Organizzazioni; matching; inviti; candidature avanzate; accordi; fase relazionale.

---

## 7. Professionisti

| Principio | Esito v1 |
|---|---|
| Natura | Non è un terzo soggetto alternativo alla Persona |
| AR | Profilo professionale (dominio Professionisti) |
| Qualifiche / registrazioni / autorizzazioni / certificazioni | Restano in Professionisti |
| Servizi professionali e copertura | Owned dal dominio |
| Altri domini | Possono riferire senza duplicare i fatti |
| Account | Non certifica la qualifica professionale |

Domande sul confine Persona/Professionista: **chiuse**.

---

## 8. Opportunità, Servizi ed Eventi

### Opportunità

* AR e fatti di opportunità (fonti, beneficiari, requisiti, evidenze secondo Logical).
* Narrazione distinta (Contenuti).
* Collegamenti senza trasferimento di ownership.

### Servizi

* AR: **OffertaDiServizio** e **RichiestaDiServizio**.
* Ownership implementata Persona XOR Impresa.
* Organizzazione **non** strutturale (etichetta/testo nel ciclo 1).
* Nessun CRM, contratto o pagamento.
* Schema **pubblicato**.

### Eventi

* AR: **Evento**; Edizioni (e sessioni) subordinate.
* Registrazioni e ruoli locali owned.
* Collegamenti interdominio pubblicati (Persone, Imprese, Professionisti, Opportunità, offerte servizio, mercati, lingue…).
* Organizzazione: sola etichetta nel ciclo 1.
* Contenuti distinto dalla scheda Evento; **nessuna** dipendenza Eventi → Contenuti nello schema ciclo 1.
* Schema **pubblicato**.

Servizi ed Eventi **non** sono domini futuri o incompleti.

---

## 9. Contenuti

| Principio | Esito v1 |
|---|---|
| AR | Contenuto |
| Responsabilità | Dominio proprietario della **narrazione** |
| Fatti | Autori, relazioni, pubblicazione secondo contratto |
| Non possiede | Opportunità, Eventi, Servizi, dati Osservatorio |
| Link | Non trasferiscono ownership |
| Logical autoritativo | **`logical/contenuti.md`** |
| Legacy | `logical/contenuti-editoriali.md` storico |

Sovrapposizione narrazione / fatti di dominio: **chiusa** (narrazione ≠ fatto).

---

## 10. Osservatorio

| Principio | Esito v1 |
|---|---|
| AR | **Indicatore** (unico) |
| ValoreIndicatore | Subordinato all’Indicatore |
| FonteStatistica | Entity owned dal dominio, autonoma come identità tecnica, **condivisibile** da più Valori/Indicatori; non AR; non owned da un singolo Indicatore |
| Valore → Fonte | Obbligatoria; nessuna relazione obbligatoria Indicatore–Fonte diretta |
| Persistenza | Solo valori aggregati numerici |
| Microdati | **Esclusi** |
| FK individuali Persona/Impresa | **Assenti** |
| Fonte ≠ Organizzazione | Ente produttore testuale nel ciclo 1 |
| Serie / trend / dashboard / ranking | Derivati (non persistiti come AR) |
| Rapporti narrativi / dossier | Dominio **Contenuti** |
| Dipendenza strutturale esterna ciclo 1 | `business_sectors` (opzionale sul Valore) |
| Paese / territorio | Senza cataloghi inventati |
| Revisioni | Con storico |
| Soglia 5 | Applicativa/editoriale, non CHECK universale inventato |

**Rinviati:** dataset; ETL; feed; cataloghi geografici; collegamenti strutturali a Contenuti e Organizzazioni.

---

## 11. Ownership trasversale

| Principio | Esito |
|---|---|
| Unicità | Ogni fatto ha un solo dominio proprietario |
| Account / `auth.users` | Non owner sostanziali dei fatti di business |
| Persona / Impresa / Redazione | Solo dove il contratto di dominio le definisce |
| Ownership ≠ accesso | Ownership non implica permesso applicativo |
| Partecipazione ≠ ownership | Ruoli locali / iscrizioni non trasferiscono ownership |
| Appartenenza | Non trasferisce ownership di Persone/Imprese |
| Autore registrazione ≠ titolare | Distinti dove previsto |
| Contenuti | Possiede la narrazione |
| Osservatorio | Ownership redazionale **implicita** (ciclo 1) |

---

## 12. Dipendenze e cicli

Sintesi dalla Dependency Map consolidata (non duplicata integralmente).

| Categoria | Sintesi v1 |
|---|---|
| Strutturali | Soggetti L0 (Persone/Imprese) → relazioni (Appartenenze, Mercati, Professionisti) → fatti (Opp, Servizi, Eventi, Contenuti, Org) → trasversali (Identità, Collaborazioni) → analitico (Osservatorio) |
| Derivazioni | Identità legge Appartenenze; Osservatorio aggrega senza FK individuali; Contenuti narra senza possedere |
| Future | Membership Org, matching Collab, feed OSS, FK Org nei consumatori, RLS applicative, cataloghi geo |
| Cicli ownership | **Assenti** |

| Ciclo apparente | Soluzione v1 |
|---|---|
| Identità ↔ Appartenenze | Identità **deriva** contesto; non possiede né crea membership |
| Contenuti ↔ fatti narrati | Solo Contenuti → fatti; narrazione ≠ ownership |
| Osservatorio ↔ domini sorgente | Derivazione unidirezionale; nessuna FK ad AR individuali |
| Organizzazioni ↔ Appartenenze | Membership **rinviata**; officials ≠ membership |
| Collaborazioni ↔ Appartenenze | Tipi distinti; snapshot membership opzionale senza ownership |

---

## 13. Lifecycle e pubblicazione

* Lifecycle **specifici per dominio** (nessun lifecycle globale uniforme).
* Asse **operativo** distinto da **pubblicazione**.
* **Archiviazione** distinta dalla cancellazione; storico conservato.
* Ritiro/dismissione preferiti alla cancellazione distruttiva ove previsto.
* Pubblicazione **≠** autorizzazione di accesso.
* Visibilità applicativa futura governata da RLS/policy (fase successiva).

---

## 14. Sicurezza e autorizzazioni

* RLS abilitata sulle tabelle pubbliche.
* Domini recenti: tipicamente **deny-by-default**.
* Subset storico con policy/GRANT legacy da consolidare.
* Identità & Accessi = supporto ai contesti; **non** proprietario dei fatti.
* Policy RLS applicative complete = fase successiva.
* Nessuna derivazione automatica dei diritti da membership, ownership, partecipazione o ruolo professionale.
* Password, token, OAuth, MFA fuori ownership dei domini di business.
* La piattaforma **non** è dichiarata production-ready da questo rapporto.

---

## 15. Rinvii intenzionali

| ID | Elemento | Dominio proprietario o fase futura | Tipo di rinvio | Stato |
|---|---|---|---|---|
| R01 | Membership Organizzazioni | Appartenenze (+ Org) | Schema / relazione | rinviato post-v1 |
| R02 | Grafo Org–Org | Organizzazioni | Schema | rinviato post-v1 |
| R03 | Multi-sede Org | Organizzazioni | Schema | rinviato post-v1 |
| R04 | Contesto Organizzazione | Identità & Accessi | Accesso | rinviato post-v1 |
| R05 | Deleghe | Identità & Accessi | Accesso | rinviato post-v1 |
| R06 | Consensi | Identità (+ Privacy) | Accesso / legale | rinviato post-v1 |
| R07 | Account di servizio | Identità & Accessi | Account | rinviato post-v1 |
| R08 | Matching Collaborazioni | Collaborazioni / app | Applicativo | rinviato post-v1 |
| R09 | Fase relazionale Collaborazioni | Collaborazioni | Processo | rinviato post-v1 |
| R10 | Dataset / feed Osservatorio | Osservatorio / infra | Dati | rinviato post-v1 |
| R11 | Cataloghi geografici | Tassonomia / infra | Catalogo | rinviato post-v1 |
| R12 | Catalogo paesi | Tassonomia / infra | Catalogo | rinviato post-v1 |
| R13 | Storage / media / documenti | Infra / domini | Media | rinviato post-v1 |
| R14 | FEV | Trasversale | Verifica | rinviato post-v1 |
| R15 | Policy RLS applicative | Identità + tutti | Sicurezza | rinviato post-v1 |
| R16 | Integrazioni retroattive extra | Vari | FK / link | rinviato post-v1 |
| R17 | Consolidamento legacy Auth/Profile | Persone / Identità / infra | Debito tecnico | rinviato post-v1 |

---

## 16. Questioni residue post-v1

Solo evoluzione futura. Nessuna blocca lo schema v1.

| Questione | Dominio proprietario | Dipendenze | Perché non blocca v1 | Fase suggerita |
|---|---|---|---|---|
| Modello policy RLS trasversale (legacy vs deny-by-default) | Identità + sicurezza | Tutti i domini | Schema già deny-by-default sui recenti; policy complete fuori chiusura | Post-schema / accesso |
| Provisioning Account | Identità & Accessi | `auth.users`, Persone | Account ciclo 1 già pubblicato | Applicativo |
| Migrazione legacy Auth/Profile | Persone / Identità / infra | Auth, `profiles` | Debito evolutivo; semantica Account≠Persona già chiusa | Evoluzione infra |
| Membership Organizzazioni | Appartenenze / Org | Org pubblicata | Esplicitamente fuori ciclo 1 | Ciclo Org successivo |
| Deleghe e consensi | Identità (+ Privacy) | Account, Appartenenze | Ruoli elevati minimi sufficienti allo schema | Identità avanzata |
| Cataloghi territoriali / paesi | Tassonomia | Mercati, Eventi, Servizi… | `country_ref` opaco accettato | Cataloghi |
| Storage e documenti | Infra | Domini con media | Non importati nei domini v1 | Media layer |
| Feed / dataset Osservatorio | Osservatorio | Indicatori | Registro aggregati sufficiente | Osservatorio dati |
| Matching Collaborazioni | Collaborazioni / app | Schede Collab | Scheda dichiarativa già sufficiente | Matching layer |
| Evoluzioni applicative (API, UI, prodotti) | Prodotto | Schema v1 | Schema chiuso indipendentemente | Prodotto |

Aree di prodotto **non** elevate a dominio v1: Formazione didattica avanzata, Immobiliare verticale, Reputazione aggregata, Pagamenti, Contratti, Privacy come bounded context dedicato.

---

## 17. Decisioni chiuse

| Decisione | Esito v1 | Fonte autoritativa |
|---|---|---|
| Organizzazioni dominio autonomo | Pubblicato; ≠ Impresa | Logical/Physical Organizzazioni |
| Account AR Identità | Account ≠ Persona ≠ `auth.users` | Logical/Physical Identità |
| Collaborazione AR unico ciclo 1 | Scheda dichiarativa | Logical/Physical Collaborazioni |
| Indicatore AR Osservatorio | Valore subordinato; Fonte entity di dominio condivisibile | Logical/Physical Osservatorio |
| Evento con Edizioni | Edizione owned, non AR | Logical/Physical Eventi |
| Offerta/Richiesta AR Servizi | Due AR distinte | Logical/Physical Servizi |
| Contenuti proprietario della narrazione | Fatti restano nei domini | Logical `contenuti.md` |
| No microdati Osservatorio | Solo aggregati | Logical/Physical Osservatorio |
| Deny-by-default strutturale (recenti) | RLS on, policy applicative future | Physical domini recenti |
| Membership Org rinviata | Fuori ciclo 1 | Logical Org / Appartenenze |
| Appartenenza ≠ Collaborazione | Tipi e ownership distinti | Logical Appartenenze / Collaborazioni |
| Professionista ≠ Persona autonoma | Profilo della Persona | Logical Professionisti |
| Evento ≠ Contenuto | Link Contenuti → Eventi | Logical Eventi / Contenuti |
| Osservatorio ≠ Contenuti | Aggregati vs narrazione | Logical Osservatorio / Contenuti |
| Ownership non implica accesso | Pubblicazione ≠ permesso | Domain Model / Identità |
| Account non crea ownership | Supporto accesso | Logical Identità |
| Org officials ≠ membership | Officials owned Org | Logical/Physical Org |
| Servizi senza CRM/pagamenti | Esclusi ciclo 1 | Logical Servizi |
| Nessun lifecycle globale unico | Assi per dominio | Domain Model / Logical |
| Nessun ciclo ownership | Cicli apparenti risolti per derivazione | Dependency Map |
| Logical Contenuti autoritativo | `contenuti.md`; editoriali = legacy | Domain Model / Contenuti |
| 13 domini roadmap v1 | Tutti pubblicati; nessuno candidato | Domain Model / checkpoint v1 |

---

## 18. Stato v1

* Tutte le riconciliazioni **bloccanti** per lo schema sono chiuse.
* **13** domini pubblicati; Logical / Physical / Plan / SQL allineati.
* DB locale e remoto allineati a head **`20260811110000`**.
* Nessun ciclo di ownership bloccante.
* Nessuna domanda semantica necessaria allo schema v1 resta aperta.
* Le questioni residue sono **tutte post-v1**.
* Prodotto e accesso applicativo **non** inclusi nella chiusura dello schema.

---

## 19. Riferimenti

| Dominio | Logical autoritativo |
|---|---|
| Persone | `logical/persone.md` |
| Imprese | `logical/imprese.md` |
| Appartenenze | `logical/appartenenze.md` |
| Mercati Internazionali | `logical/mercati-internazionali.md` |
| Professionisti | `logical/professionisti.md` |
| Opportunità | `logical/opportunita.md` |
| Servizi | `logical/servizi.md` |
| Eventi | `logical/eventi.md` |
| Contenuti | **`logical/contenuti.md`** |
| Organizzazioni | `logical/organizzazioni.md` |
| Identità & Accessi | `logical/identita-accessi.md` |
| Collaborazioni | `logical/collaborazioni.md` |
| Osservatorio | `logical/osservatorio.md` |

* Domain Model: `docs/domain-model.md`
* Dependency Map: `docs/architecture/physical/domain-dependency-map.md`
* Physical: `docs/architecture/physical/domain-mapping/*.md`
* Legacy: `logical/contenuti-editoriali.md` (storico)

---

**Reconciliation Report v1 consolidato**, coerente con Domain Model e Dependency Map. Decisioni bloccanti chiuse; questioni residue post-v1. Nessun ulteriore aggiornamento obbligatorio di questi tre documenti prima del commit della baseline.
