# Application Access Model v1 — Autorizzazione e matrice RLS

> Contratto autoritativo dell’**accesso applicativo v1** sopra la baseline database già chiusa.
> Baseline: commit `420c1458533e1b55f0f111a55356d5710c43494a` · tag `v0.2.0-db-architecture-v1` · 13 domini · head `20260811110000`.
> Questo documento **non** implementa policy SQL, helper, migration o frontend. Le decisioni semantiche **B1–B6** sono **chiuse per v1** (§14–§15); la progettazione Physical/RLS è autorizzabile.

---

## Indice

1. [Principi autorizzativi](#1-principi-autorizzativi)
2. [Ruoli applicativi v1](#2-ruoli-applicativi-v1)
3. [Stati Account](#3-stati-account)
4. [Soggetti autorizzativi](#4-soggetti-autorizzativi)
5. [Operazioni standard](#5-operazioni-standard)
6. [Matrice dei 13 domini](#6-matrice-dei-13-domini)
7. [AR, tabelle owned e cataloghi](#7-ar-tabelle-owned-e-cataloghi)
8. [Visibilità pubblica per AR](#8-visibilità-pubblica-per-ar)
9. [Regola Impresa / Appartenenza](#9-regola-impresa--appartenenza)
10. [Regole chiuse: owner Persona, Redazione, Amministrazione](#10-regole-chiuse-owner-persona-redazione-amministrazione)
11. [Identità & Accessi](#11-identità--accessi)
12. [Organizzazioni](#12-organizzazioni)
13. [Osservatorio](#13-osservatorio)
14. [Decisioni B1–B6 chiuse](#14-decisioni-b1b6-chiuse)
15. [Gap residui post-v1](#15-gap-residui-post-v1)
16. [Readiness RLS e strategia tecnica](#16-readiness-rls-e-strategia-tecnica)
17. [Ordine di implementazione futuro](#17-ordine-di-implementazione-futuro)
18. [Esito del modello](#18-esito-del-modello)

---

## 1. Principi autorizzativi

Separazione rigorosa (non collassabile in policy):

| # | Concetto | Artefatto tipico | Non equivale a |
|---|---|---|---|
| 1 | Identità tecnica | `auth.users` | Account, Persona, ownership |
| 2 | Account applicativo | `accounts` | Persona, diritti sostanziali |
| 3 | Persona | `profiles` | Account, membership |
| 4 | Ruolo applicativo elevato | `account_role_assignments` | Ruolo Impresa / professionale / Org |
| 5 | Titolarità del fatto | colonne owner del dominio | Accesso automatico |
| 6 | Legittimazione per Impresa | Appartenenze (+ autorizzazione gestionale) | Ownership del fatto Impresa |
| 7 | Partecipazione a un fatto | organizer, speaker, participant, official… | Autorizzazione di scrittura |
| 8 | Pubblicazione | assi `publication_*` / `published_at` | Diritto di modifica |

**Invarianti**

1. Account e `auth.users` **non** sono owner sostanziali dei fatti di business.
2. Pubblicazione **≠** autorizzazione alla modifica.
3. Appartenenza **≠** ownership; trasferisce al più legittimazione.
4. Ruolo elevato **≠** Contesto Impresa e **≠** Contesto Organizzazione.
5. `account_registrato` è **derivato** (`account_status <> 'closed'`), non riga di ruolo.
6. Deny-by-default resta il default strutturale dei domini recenti; le policy applicative lo **aprono** in modo esplicito, non lo annullano con GRANT ampi.
7. Preferire ritiro/archiviazione alla cancellazione fisica ove il dominio lo prevede.
8. Nessun booleano `can_*` persistito in questo modello.

---

## 2. Ruoli applicativi v1

Solo i ruoli già pubblicati in Identità & Accessi:

| Ruolo | Persistenza | Significato autorizzativo v1 |
|---|---|---|
| *(visitatore)* | Assenza di Account / sessione anonima | Solo `SELECT_PUBLIC` dove il dominio lo consente |
| `account_registrato` | **Derivato** | Account non `closed`; prerequisito di azioni autenticate base |
| `redattore` | Riga `account_role_assignments` attiva | Contesto redazionale; operazioni editoriali ammesse dai domini |
| `amministratore_applicativo` | Riga attiva | Amministrazione funzionale piattaforma; **non** sovranità automatica sui fatti di business |

**Non introdotti** in v1: moderatore, superadmin, editor, organization_admin, business_admin, service_manager, event_manager, professional_manager, `can_*` persistiti.

Le autorizzazioni v1 si esprimono come combinazione di:

* Account valido (stato);
* Persona associata (contesto personale);
* Appartenenza (+ eventuale autorizzazione gestionale);
* ownership del record;
* ruolo elevato già esistente;
* stato/lifecycle del record.

---

## 3. Stati Account

Stati operativi ciclo 1 (`accounts.account_status`). La mera presenza in `auth.users` **non** concede accesso applicativo.

| Stato | Auth tecnica possibile | SELECT_PUBLIC | SELECT_OWN | INSERT fatti | UPDATE fatti | WITHDRAW/ARCHIVE | DELETE fisico | Agire per Impresa | Esercitare ruoli elevati |
|---|---|---|---|---|---|---|---|---|---|
| `registered` | Sì (se Auth attiva) | Sì (pubblici) | Limitato / assente se senza Persona | No fatti Persona/Impresa pieni | No | No | No | No | No (contesti operativi spenti) |
| `limited` | Sì | Sì | Parziale (self Account; fatti Persona se ancora collegata secondo policy stretta) | No (salvo self Account consentito) | Self Account minimo | No | No | No | No |
| `active` | Sì | Sì | Sì (con Persona associata non contestata) | Sì dove titolare/legittimato | Sì dove titolare/legittimato | Sì dove previsto | Solo dove dominio ammette e soggetto autorizzato | Sì se Appartenenza attiva (+ grant per gestione scheda) | Sì se assegnazione attiva |
| `suspended` | Auth può esistere | Sì (sola lettura pubblica tipica) | No operativo | No | No | No | No | No | No |
| `disabled` | Tipicamente bloccato applicativamente | Sì pubblici | No | No | No | No | No | No | No |
| `closed` | No contesto applicativo | Sì pubblici | No | No | No | No | No | No | No (`account_registrato` falso) |

**Contesto personale operativo** (IA Physical): `account_status = 'active'` ∧ `person_id IS NOT NULL` ∧ `person_association_status ∈ {declared, verified}` (non `contested`).

**Nota:** `active ⇒ person_id NOT NULL` è vincolo DDL. Account senza Persona resta in `registered`/`limited` (o altri non-active).

---

## 4. Soggetti autorizzativi

### 4.1 Persona

Opera sui **propri** fatti quando:

* Account `active` + associazione Persona valida;
* il record è titolare `owner_person_id` / soggetto Persona, oppure il dominio assegna esplicitamente la Persona come autore.

Non opera sui fatti altrui salvo ruolo elevato o legittimazione Impresa.

### 4.2 Impresa

Un Account/Persona opera **per** Impresa solo tramite Appartenenza (vedi §9):

* **Contesto Impresa** (agire “per conto”): membership `relation_status = 'active'`.
* **Gestione scheda Impresa** (scrittura AR Impresa e owned tipiche): membership attiva **e** `business_membership_management_authorizations.authorization_status = 'granted'`.

Appartenenza **non** trasferisce ownership dei fatti Impresa.

### 4.3 Redazione

`redattore` e `amministratore_applicativo` (assegnazione attiva + Account operativo) interagiscono con:

* ownership redazionale esplicita (`owned_by_editorial = true` dove prevista);
* ownership redazionale implicita (Osservatorio);
* pubblicazione/ritiro editoriale nei domini Contenuti e, dove deciso, altri AR a titolarità Redazione.

Non creano Contesto Impresa né Contesto Organizzazione.

### 4.4 Organizzazione

Ciclo 1: **nessuna membership Organizzazione** e **nessun Contesto Org** in Identità.

* `organization_officials` **non** è amministratore dell’Organizzazione né sostituto di membership.
* Scrittura da utente ordinario **non** è affidabilmente autorizzabile via Org.
* Gestione scheda: titolare Persona / Impresa (con regole §9 e §10) **oppure** Redazione (`redattore` su `owned_by_editorial`).

---

## 5. Operazioni standard

| Codice | Significato |
|---|---|
| `SELECT_PUBLIC` | Lettura da anonimo / autenticato di record pubblicamente visibili |
| `SELECT_OWN` | Lettura autenticata di record non pubblici del titolare/legittimato |
| `INSERT` | Creazione |
| `UPDATE` | Modifica sostanziale (esclusa sola pubblicazione se distinta) |
| `WITHDRAW_OR_ARCHIVE` | Ritiro pubblicazione e/o archiviazione lifecycle |
| `DELETE` | Cancellazione fisica (eccezionale) |

Distinzioni obbligatorie in ogni dominio: lettura pubblica ≠ lettura privata autenticata ≠ creazione ≠ modifica ≠ ritiro ≠ delete.

---

## 6. Matrice dei 13 domini

Legenda soggetti: **Anon** · **Acc+Per** (Account `active` + Persona) · **OwnP** (titolare Persona) · **LegI** (Persona legittimata per Impresa: contesto o grant come specificato) · **Red** (`redattore`) · **Adm** (`amministratore_applicativo`) · **Svc** (`service_role` / backend).

### 6.1 Sintesi tabellare

| Dominio | Lettura pubblica | Lettura propria | Creazione | Modifica | Ritiro/archiviazione | Delete | Base autorizzativa |
|---|---|---|---|---|---|---|---|
| Persone | Anon: profilo/storie pubbliche secondo assi Persone | Acc+Per: propri fatti non pubblici | Acc+Per: self; Svc provisioning | OwnP; Adm sospensione secondo Politiche | OwnP / Adm dove previsto | Preferire soft; cancel Persona solo OwnP/Politiche | Persona + Associazione Account |
| Imprese | Anon: schede pubblicamente presentabili | LegI (contesto A): bozze/private | Acc+Per può creare Impresa + membership; **primo grant solo Svc/Adm** | LegI **con grant** gestionale | LegI con grant | Eccezionale; preferire lifecycle | Appartenenza `active` + authorization `granted` (§9) |
| Appartenenze | Anon: solo membership `visibility=public` e soggetti pubblici | Acc+Per: proprie; LegI: lato Impresa | Acc+Per dichiara; LegI con facoltà per dichiarazioni “come Impresa” | Soggetti/legittimati secondo dominio | Conclusione/revoca da legittimati | Raro | Fatto owned Appartenenze; non = permesso Impresa |
| Mercati Internazionali | Anon: mercati/relazioni a livello pubblico | Acc+Per / LegI: proprie relazioni non pubbliche | Acc+Per / LegI sulle relazioni soggetto | Titolare soggetto della relazione | Titolare | Raro | Soggetto Persona/Impresa; Mercato governato piattaforma |
| Professionisti | Anon: profili pubblicati/pubblici | OwnP: bozza/privato | Acc+Per (1:1 Persona) | OwnP | OwnP | Raro | Profilo della Persona |
| Opportunità | Anon: pubblicate+pubbliche | OwnP / LegI / Red secondo titolarità | OwnP / LegI / Red | Titolare / Red dove ammesso | Titolare / Red | Raro | Ownership dominio; non Contenuti |
| Servizi | Anon: offerte/richieste pubblicate | OwnP / LegI (owner XOR) | OwnP / LegI | OwnP / LegI | OwnP / LegI | Raro | Owner Persona XOR Impresa; Org solo testo |
| Eventi | Anon: eventi pubblicati+visibilità public | OwnP / LegI | OwnP / LegI | OwnP / LegI | OwnP / LegI | Raro | Owner XOR; ruoli locali ≠ write |
| Contenuti | Anon: contenuti pubblicati+pubblici | Red / titolare se previsto | **Red**; titolare Persona/Impresa dove contratto | Red / titolare ammesso | Red / titolare | Raro | Narrazione; Adm **non** eredita Red |
| Organizzazioni | Anon: pubblicate+public | OwnP / LegI / Red su titolarità | OwnP / LegI / **Red** (`owned_by_editorial`) | Titolare; **non** via officials | Titolare / Red | Raro | Ternario Persona\|Impresa\|Redazione; no membership |
| Identità & Accessi | No elenco Account pubblico | Acc: proprio Account e propri ruoli | **Svc** / Adm provisioning | Self minimo; Adm/Svc su stati | Adm/Svc | Svc/Adm | Account ≠ Persona; no self-elevate |
| Collaborazioni | Anon: schede pubblicate | OwnP / LegI / Red | OwnP / LegI / Red | Titolare | Titolare | Raro | Dichiarativa; matching escluso |
| Osservatorio | Anon: Indicatori/Valori pubblicati | Red bozze | **Red** (ownership implicita) | Red | Red | Raro | Nessuna ownership Persona/Impresa; Adm senza Red = no write |

### 6.2 Note per dominio (scrittura / lettura)

**Persone** — Scrittura self sul profilo e satelliti owned. Staff/Adm: sospensione secondo Politiche, non ownership.

**Imprese** — Scrittura scheda e owned tipiche solo con grant gestionale (§9.2). Primo grant: solo Svc/Adm (B1). Ruolo catalogo **da solo** non autorizza.

**Appartenenze** — Creare/modificare membership ≠ ottenere grant. Evidenze/fonti tipicamente non pubbliche.

**Mercati** — Definizione Mercato: governance piattaforma (Red/Adm/Svc). Relazioni soggetto: titolare Persona/Impresa (per Impresa: §9.2).

**Professionisti** — Un profilo per Persona; non Account; non Impresa.

**Opportunità / Servizi / Eventi** — Owner XOR Persona|Impresa; per Impresa scrivere/pubblicare con grant (§9.2, B6). Partecipazioni/ruoli locali non aprono UPDATE dell’AR.

**Contenuti** — Solo `redattore` (Adm non eredita); link narrativi non concedono write sui fatti linkati.

**Organizzazioni** — Vedi §12.

**Identità** — Vedi §11.

**Collaborazioni** — Scheda dichiarativa; no diritti applicativi desunti.

**Osservatorio** — Vedi §13.

---

## 7. AR, tabelle owned e cataloghi

### 7.1 Principio sulle owned

L’accesso alle tabelle **owned** (edizioni, territori offerta, partecipanti, officials, valori indicatore, …) è **derivato dall’AR** (o dal parent owned intermedio, es. Sessione ← Edizione ← Evento).

Non progettare policy indipendenti sulle owned che siano più permissive dell’AR.

### 7.2 Inventario sintetico

| Dominio | AR | Owned tipiche | Cataloghi | Note |
|---|---|---|---|---|
| Persone | Persona (`profiles`) | lingue, competenze, storie | lingue/competenze condivisi | |
| Imprese | Impresa | sedi, settori, servizi, prodotti, canali, media, cert. | settori, lingue… | |
| Appartenenze | Appartenenza | evidenze; **authorization** 0..1 | ruoli membership | Auth gestionale = fatto owned Appartenenze |
| Mercati | Mercato (+ relazioni) | presenze, interessi, attività… | — | `country_ref` opaco |
| Professionisti | Profilo professionale | titoli, servizi, copertura… | lingue, settori, mercati | |
| Opportunità | Opportunità | requisiti/benefici/… secondo Physical | tipi locali | |
| Servizi | Offerta; Richiesta | territori, lingue, settori, mercati (offerta) | categorie, fasce | Due AR |
| Eventi | Evento | edizioni, sessioni, organizers, speakers, lingue, mercati, registrations | `event_types` | |
| Contenuti | Contenuto | autori, link, tag… | tipi/categorie | |
| Organizzazioni | Organizzazione | `organization_officials` | tipi/scopes | |
| Identità | Account | `account_role_assignments` | — | |
| Collaborazioni | Collaborazione | participants | — | |
| Osservatorio | Indicatore | Valori; Fonte = entity dominio condivisibile | — | Fonte ≠ owned-di-un-Indicatore |

### 7.3 Cataloghi — principio v1

| Principio | Regola |
|---|---|
| Lettura | `SELECT_PUBLIC` dei cataloghi **attivi** usati dall’UI (categorie servizi, tipi evento, ruoli membership, settori, lingue, …) |
| Scrittura Account ordinario | **Negata** |
| Amministrazione | `amministratore_applicativo` e/o **Svc** (seed/migration restano via backend) |

**Eccezioni:** nessuna scrittura catalogo da `redattore` salvo decisione futura esplicita. Seed normativi restano migration/Svc.

---

## 8. Visibilità pubblica per AR

Non esiste una regola globale `published_at IS NOT NULL`. Usare gli assi del dominio.

| AR | Condizione di visibilità pubblica (ciclo 1) | Fonte contrattuale |
|---|---|---|
| Persona / profilo | Profilo non cancellato/inattivo per pubblico; storie in stato pubblicato; rispetto privacy | Logical/Physical Persone |
| Impresa | Combinazione assi editoriale/operativo/visibilità + qualità minima + non moderazione bloccante (Logical Imprese) | Logical/Physical Imprese |
| Appartenenza | `visibility_status = public` ∧ Persona pubblica ∧ Impresa pubblica ∧ non presentata come corrente se conclusa/revocata/archiviata | Physical Appartenenze |
| Mercato / relazioni MI | Livello informativo pubblico; mai oltre visibilità soggetto | Logical MI |
| Profilo professionale | Editoriale pubblicato + visibilità profilo pubblico; ≤ Persona | Logical Professionisti |
| Opportunità | Pubblicazione `published` + visibilità pubblica | Logical/Physical Opp |
| Offerta / Richiesta servizio | `publication_status = published` (+ campi pubblici); bozza solo titolare | Physical Servizi |
| Evento | `publication_status = published` ∧ `visibility = public` ∧ (regola edizioni pronta dove prevista) | Physical Eventi |
| Contenuto | Pubblicato + visibilità pubblico | Physical Contenuti |
| Organizzazione | `publication_status = published` ∧ `visibility_status = public` | Physical Org |
| Collaborazione | Scheda `published` / pubblicata consultabile; bozza solo titolare | Physical Collaborazioni |
| Indicatore / Valore | Indicatore `publication_status = published`; Valore con `published_at` e status non withdrawn (come Physical) | Physical Osservatorio |
| Account | **Mai** elenco pubblico | Physical IA |

---

## 9. Regola Impresa / Appartenenza

### 9.1 Contesto Impresa (sola appartenenza attiva)

Consente di **riconoscere** che la Persona agisce in relazione a un’Impresa. **Non** consente da sola scrittura della scheda né pubblicazione di fatti owned dall’Impresa.

```
Account active
∧ Persona associata (declared|verified)
∧ ∃ business_memberships (
      person_id = Account.person_id
  ∧ business_id = :impresa
  ∧ relation_status = 'active'
)
```

### 9.2 Gestione / scrittura per Impresa (regola consolidata v1)

Un Account può **agire operativamente** per un’Impresa (creare/modificare/ritirare/archiviare/pubblicare fatti owned dall’Impresa, nei limiti del dominio — §14 B6) quando **tutte** le condizioni seguenti sono vere:

1. Account `active`;
2. `person_id` associato (`declared`|`verified`);
3. Appartenenza Persona–Impresa con `relation_status = 'active'` (non conclusa/revocata/archiviata);
4. autorizzazione gestionale `authorization_status = 'granted'` sulla stessa membership;
5. record/operazione riferiti alla **stessa** Impresa;
6. lifecycle del dominio consente l’operazione.

Questa regola concede **contesto operativo legittimato**, non ownership personale. L’ownership del record resta dell’Impresa.

**Vietato dedurre il grant da:** ruolo catalogo membership; responsibility; sola ownership “nominale”; ruolo applicativo; `organization_officials`; partecipazione Eventi/Servizi.

### 9.3 Bootstrap del primo grant (B1 — chiusa)

Il **primo** record `business_membership_management_authorizations` con `granted` per un’Impresa può essere creato **solo** da:

* backend / `service_role`;
* oppure `amministratore_applicativo` (operazione amministrativa controllata).

L’Account ordinario **non** può: auto-concedersi il primo grant; crearlo perché “owner” della scheda; dedurlo dal ruolo dell’Appartenenza.

Condizioni minime del bootstrap: Account `active` + Persona associata + Appartenenza già `active` sull’Impresa + verifica esterna/amministrativa (processo **applicativo**, non modellato nel DB v1) + registrazione da Svc/Adm.

### 9.4 Gestione successiva delle autorizzazioni (B3 — chiusa)

| Operazione | Soggetti ammessi | Vietato |
|---|---|---|
| Concedere grant (dopo bootstrap) | Svc; Adm; Persona con membership `active` **e** grant `granted` sulla **stessa** Impresa | Autoconcessione; Account senza grant |
| Revocare grant | Svc; Adm; altra Persona già autorizzata sulla stessa Impresa; autorevoca propria (senza trigger “ultimo gestore” in v1) | — |
| Modificare Appartenenza / ruoli / creare membership via grant | **No** automatico | Il grant non autorizza queste operazioni |

Regola “almeno un gestore” / “ultimo gestore”: **solo applicativa** in v1; nessun trigger DB in questa fase.

### 9.5 Prerequisiti membership (B2 — chiusa)

Per sostenere **operazioni gestionali** per Impresa bastano (oltre al grant):

* `relation_status = 'active'`;
* membership non cessata/archiviata secondo contratto;
* `authorization_status = 'granted'`.

**Non** si richiede in v1, come prerequisito RLS, `editorial_status = declared` né `is_contested = false` (possono restare controlli applicativi/UX più stretti). La sola Appartenenza **non** consente modifica scheda, creazione fatti owned, pubblicazione, né concessione di ulteriori grant.

---

## 10. Regole chiuse: owner Persona, Redazione, Amministrazione

### 10.1 Owner Persona

Un Account opera come owner Persona quando:

1. Account `active`;
2. Account associato a quella Persona (`declared`|`verified`);
3. `owner_person_id = account.person_id` (o equivalente del dominio);
4. lifecycle e vincoli del dominio consentono l’operazione.

Account `registered` / `limited`: non crea/modifica fatti personali pieni; solo funzioni limitate esplicitamente previste (self Account).

### 10.2 Redazione (`redattore`)

Un Account opera come Redazione quando:

1. Account in stato operativo ammesso (tipicamente `active`; non `suspended`/`closed`);
2. ruolo `redattore` con assegnazione **attiva**;
3. il record è `owned_by_editorial` **oppure** appartiene a dominio a ownership redazionale implicita (Osservatorio) **oppure** è Contenuto del flusso editoriale;
4. il lifecycle consente l’operazione.

`amministratore_applicativo` **senza** `redattore` **non** soddisfa questa regola (B4).

### 10.3 Amministrazione (`amministratore_applicativo`)

Un Account svolge operazioni amministrative quando:

1. Account `active`;
2. ruolo `amministratore_applicativo` attivo.

Operazioni tipiche: assegnazione/revoca ruoli elevati; bootstrap e gestione amministrativa grant Impresa; gestione amministrativa Account; interventi tecnici esplicitamente autorizzati; amministrazione cataloghi con Svc.

**Non** include automaticamente la modifica di tutti i fatti di business, né Contenuti/Osservatorio/`owned_by_editorial`.

---

## 11. Identità & Accessi

| Operazione | Chi |
|---|---|
| Leggere proprio Account | Acc (non `closed`) |
| Aggiornare campi self-service minimi | Acc `active`/`limited` (whitelist; non elevazione) |
| Vedere i propri ruoli | Acc |
| Assegnare/revocare ruoli elevati | **Svc** o Adm già attivo; **mai** self-elevate (B5) |
| Bootstrap primo Adm | Solo Svc / SQL controllato / seed amministrativo non pubblico (B5) |
| Leggere altri Account | Adm / Svc |
| Provisioning Account | **Svc** |
| Collegare Persona | Flusso esplicito |

Protezione “ultimo amministratore”: **applicativa** in v1; nessun trigger in questa fase.

---

## 12. Organizzazioni

| Aspetto | Esito v1 |
|---|---|
| Lettura pubblica | `published` + `visibility public` |
| Modifica utente ordinario | Titolare Persona, o LegI **con grant** se titolare Impresa |
| `organization_officials` | **Non** autorizza amministrazione |
| Membership / Contesto Org | Assenti — scrittura ordinaria non via Org |
| Schede `owned_by_editorial` | Solo **Red** (Adm senza Red = no) |

---

## 13. Osservatorio

| Aspetto | Esito v1 |
|---|---|
| SELECT_PUBLIC | Indicatori/Valori pubblicati; Fonti come provenance se esposte |
| Scrittura / pubblicazione | Solo **Red** |
| Adm senza Red | **No** write |
| Owner Persona/Impresa | Non inventare |

---

## 14. Decisioni B1–B6 chiuse

| ID | Decisione | Soggetto autorizzato | Soggetto vietato | Enforcement futuro | Stato |
|---|---|---|---|---|---|
| **B1** | Bootstrap primo grant Impresa | Svc; Adm | Account ordinario; autoconcessione; deduzione da ruolo membership | Policy INSERT su `business_membership_management_authorizations` | **chiusa per v1** |
| **B2** | Prerequisiti membership gestionale | Membership `active` + grant `granted` | Sola Appartenenza; ruolo/titolo descrittivo come diritto | Helper gestione Impresa | **chiusa per v1** |
| **B3** | Concessione/revoca grant dopo bootstrap | Svc; Adm; Persona già granted stessa Impresa; autorevoca | Autoconcessione; grant che modifica membership | Policy INSERT/UPDATE authorization | **chiusa per v1** |
| **B4** | Adm **non** eredita Red | Red per fatti redazionali; Adm per admin | Adm che scrive Contenuti/OSS/`owned_by_editorial` senza ruolo Red | Policy che verificano `role_code` esplicito | **chiusa per v1** |
| **B5** | Bootstrap primo Adm | Svc / SQL controllato / seed admin non pubblico | Self-elevate; seed automatico pubblico | Policy `account_role_assignments` | **chiusa per v1** |
| **B6** | Pubblicazione per Impresa | Stessa Persona con grant (§9.2) nei domini senza revisione redazionale obbligatoria, scheda owned Impresa, gate dominio OK | Contesto-only (A) per publish; Red obbligatorio su editorial/OSS/Contenuti/`owned_by_editorial` | Policy publish per dominio | **chiusa per v1** |

### 14.1 Dettaglio B6 — pubblicazione per conto di Impresa

Con grant `granted`, la Persona può tipicamente: creare, modificare, ritirare/archiviare record owned dall’Impresa.

La **pubblicazione** è consentita alla stessa Persona nei domini in cui:

* il contratto **non** prevede revisione redazionale obbligatoria;
* la scheda è owned direttamente dall’Impresa;
* i gate di pubblicazione del dominio sono soddisfatti.

**Eccezione redazionale:** `owned_by_editorial`, Osservatorio, Contenuti redazionali, schede curate → pubblicazione richiede `redattore`.

Nessun doppio workflow redazionale globale su tutte le schede Impresa: ogni dominio applica il proprio lifecycle.

---

## 15. Gap residui post-v1

### Non più bloccanti (chiusi in A1b)

Bootstrap grant Impresa; prerequisiti Appartenenza per gestione; gestione authorization; Adm vs Red; bootstrap admin; pubblicazione Impresa.

### Post-v1 (non bloccano progettazione RLS v1)

* membership / contesto Organizzazione;
* deleghe; consensi; Account di servizio tipizzato;
* protezione DB dell’ultimo amministratore;
* protezione DB dell’ultimo gestore Impresa;
* workflow di verifica del bootstrap (resta applicativo);
* audit amministrativo;
* override emergenziale sui fatti di business;
* matching Collaborazioni;
* consolidamento policy legacy foundation.

---

## 16. Readiness RLS e strategia tecnica

Dopo B1–B6 risultano **determinabili** (senza implementarli qui):

* helper Auth → Account → Persona;
* helper ruolo elevato (`redattore` / `amministratore_applicativo`);
* helper contesto Impresa (membership `active`);
* helper gestione Impresa (membership + grant `granted`);
* policy self Persona;
* policy owner Impresa (post-grant);
* policy Redazione;
* policy amministrative;
* policy cataloghi (SELECT pubblico; no write ordinario);
* policy lettura pubblica;
* policy tabelle owned derivate dall’AR.

| Elemento | Proposta | Vincoli |
|---|---|---|
| `current_person_id()` | `auth.uid()` → Account operativo → `person_id` | Preferire `SECURITY INVOKER` |
| `has_elevated_role(code)` | Assignment attiva + Account non suspended/closed | Solo i due role_code pubblicati |
| `has_business_context(id)` | §9.1 | Nessun `can_*` persistito |
| `can_manage_business(id)` | §9.2 | Post-bootstrap grant |
| Policy AR / owned | Operazione × soggetto; owned da AR | Deny-by-default di partenza |

---

## 17. Ordine di implementazione futuro

| Blocco | Contenuto | Precondizione |
|---|---|---|
| **A1** | Modello accesso (matrice) | Fatto |
| **A1b** | Chiusura B1–B6 | **Fatto** (questo aggiornamento) |
| **A2** | Physical access / RLS design | A1b |
| **A3** | Helper functions | A2 |
| **A4** | RLS Foundation (Persone, IA self, Appartenenze base, cataloghi, Imprese+grant) | A3 |
| **A5** | RLS domini business | A4 |
| **A6** | RLS redazionali e trasversali | A4 |
| **A7** | Test locale avversariale | A4–A6 |
| **A8** | Dry-run/apply remoto e validation report | A7 |

---

## 18. Esito del modello

Le decisioni B1–B6 sono **chiuse per v1**. Il modello di accesso applicativo è sufficientemente determinato per avviare la progettazione tecnica delle policy RLS, senza nuovi ruoli persistiti e senza autoassegnazioni.

**Stato:** modello **chiuso** — progettazione RLS autorizzabile.

---

## Riferimenti

* Domain Model, Dependency Map, Reconciliation Report (baseline v1)
* Logical/Physical Identità & Accessi, Appartenenze, Imprese, e Physical dei 13 domini
* Tag `v0.2.0-db-architecture-v1`
