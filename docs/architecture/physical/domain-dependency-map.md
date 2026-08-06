# Domain Dependency Map — Architettura database v1

> Fotografia autoritativa delle dipendenze tra i **13 domini** pubblicati allo stato conclusivo dell’architettura database v1.
> Non sostituisce i Physical di dominio (contratti DDL, colonne, vincoli). Non è un inventario colonna-per-colonna delle FK.
> Fonti prevalenti in caso di contrasto: (1) Physical definitivo del dominio, (2) Logical definitivo, (3) Domain Model consolidato. Questa mappa corregge le revisioni precedenti basate su Logical incompleti o domini “non ancora mappati”.

---

## Indice

1. [Scopo](#1-scopo)
2. [Tassonomia delle dipendenze](#2-tassonomia-delle-dipendenze)
3. [Inventario e schede dei 13 domini](#3-inventario-e-schede-dei-13-domini)
4. [Matrice consolidata](#4-matrice-consolidata)
5. [Dipendenze future](#5-dipendenze-future)
6. [Ordine architetturale](#6-ordine-architetturale)
7. [Analisi dei cicli](#7-analisi-dei-cicli)
8. [Stato v1](#8-stato-v1)
9. [Riferimenti](#9-riferimenti)

---

## 1. Scopo

Questa Dependency Map:

* dichiara le **dipendenze strutturali** realmente implementate nello schema pubblicato;
* distingue **derivazione**, **riferimenti testuali** e **rinvii intenzionali**;
* consolida l’**ordine architetturale** e l’**assenza di cicli di ownership**;
* allinea la documentazione al Domain Model v1 e ai 13 Physical definitivi.

Non descrive policy RLS applicative, API, frontend, matching o dashboard. Non introduce FK nuove.

**Head migration locale e remoto:** `20260811110000` · **Pending:** 0 · **Architettura database v1:** completata.

---

## 2. Tassonomia delle dipendenze

| Categoria | Significato | Esempio tipico v1 |
|---|---|---|
| **Strutturale** | FK o contratto fisico diretto necessario allo schema pubblicato | `professional_profiles.person_id` → `profiles` |
| **Di derivazione** | Il dominio legge/interpreta fatti altrui senza possederli e senza necessariamente avere FK | Identità legge Appartenenze per contesto Impresa; Osservatorio aggrega senza FK individuali |
| **Futura** | Relazione esplicitamente rinviata oltre il ciclo 1 | Membership Persona/Impresa–Organizzazione |
| **Infrastrutturale** | Dipendenza da servizi tecnici (`auth.users`, Storage futuro), non ownership di business | Account → `auth.users` |

**Non confondere**

* **ordine di migrazione** ≠ ownership;
* **collegamento editoriale** (Contenuti) ≠ ownership del fatto narrato;
* **etichetta testuale** (es. `external_organization_label`) ≠ FK strutturale verso Organizzazioni;
* **utilizzo applicativo** (policy future) ≠ dipendenza di schema già chiusa.

---

## 3. Inventario e schede dei 13 domini

Tutti i domini sotto hanno stato v1: **pubblicato** (Logical + Physical + Migration Plan + SQL applicato).

### 3.1 Persone

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Persona |
| **Dipendenze strutturali** | Cataloghi foundation (lingue, competenze, ecc. già presenti). Collegamento tecnico legacy `profiles` ↔ Auth dove storicamente presente; **non** implica ownership da Identità. |
| **Dipendenze di derivazione** | Nessuna dipendenza semantica da Identità per esistere. |
| **Dipendenze future** | Decoupling da Auth legacy; evoluzioni Account-centric senza fondere Persona e Account. |
| **Consumatori principali** | Appartenenze, Professionisti, Mercati, Opportunità, Servizi, Eventi, Contenuti, Organizzazioni, Identità, Collaborazioni. |
| **Confini** | Persone ≠ Account, ≠ membership, ≠ qualifiche professionali. |

### 3.2 Imprese

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Impresa |
| **Dipendenze strutturali** | Cataloghi foundation (settori, lingue, territori/sedi secondo Physical). |
| **Dipendenze di derivazione** | Lettura delle Appartenenze che la riguardano (senza ownership della relazione). |
| **Dipendenze future** | Membership verso Organizzazioni; fusione schede Org–Impresa **vietata**. |
| **Consumatori principali** | Appartenenze, Mercati, Professionisti (contesto), Opportunità, Servizi, Eventi, Contenuti, Organizzazioni (`linked_business_id`), Collaborazioni. |
| **Confini** | Impresa ≠ Organizzazione istituzionale; cooperative economiche restano Imprese. |

### 3.3 Appartenenze

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Appartenenza |
| **Dipendenze strutturali** | Persone (`profiles`); Imprese (`businesses`); cataloghi ruoli/autorizzazioni owned del dominio. |
| **Dipendenze di derivazione** | Identità (contesto Impresa); Collaborazioni e altri domini per legittimazione/rappresentanza. |
| **Dipendenze future** | Persona–Organizzazione; Impresa–Organizzazione; membership Organizzazioni. |
| **Consumatori principali** | Identità & Accessi; Collaborazioni (snapshot opzionale); utilizzo da Opportunità/Eventi/Servizi dove previsto. |
| **Confini** | Possiede relazioni stabili Persona–Impresa; **≠ Collaborazione**; non trasferisce ownership. |

### 3.4 Mercati Internazionali

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Mercato internazionale (con relazioni/presenze owned secondo Physical) |
| **Dipendenze strutturali** | Soggetti `profiles` / `businesses`; opzionale membership; settori; `country_ref` opaco (senza catalogo paesi strutturale). |
| **Dipendenze di derivazione** | Contesto per Eventi/Contenuti/Servizi che referenziano mercati. |
| **Dipendenze future** | Cataloghi geografici/paesi; soggetto Professionista; Organizzazioni come risorse di supporto; derivazione Osservatorio. |
| **Consumatori principali** | Professionisti, Servizi, Eventi, Contenuti; Osservatorio solo come sorgente aggregabile. |
| **Confini** | Nessuna ownership da Organizzazioni nel ciclo 1; Mercato ≠ catalogo Stato/Paese. |

### 3.5 Professionisti

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Profilo professionale |
| **Dipendenze strutturali** | Persone (obbligatoria); opzionale Imprese (contesto ≠ membership); lingue, competenze, settori, mercati. |
| **Dipendenze di derivazione** | Appartenenze (utilizzo, senza FK obbligatoria di membership). |
| **Dipendenze future** | Membership; OffertaDiServizio come provenienza; Organizzazioni; FEV/territori avanzati; link Opportunità/Collaborazioni. |
| **Consumatori principali** | Eventi (speaker); Contenuti; Servizi (ref opzionale profilo/servizi professionali); Opportunità (via Persona / ref futuri). |
| **Confini** | Professionista ≠ Persona autonoma; ≠ Impresa; ≠ Account; ServizioProfessionale ≠ OffertaDiServizio. |

### 3.6 Opportunità

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Opportunità |
| **Dipendenze strutturali** | Persone e cataloghi (es. settori) secondo Physical pubblicato; parti/ruoli riferiti. |
| **Dipendenze di derivazione** | Appartenenze per rappresentanza (snapshot/utilizzo); Professionisti per qualifiche. |
| **Dipendenze future** | Rafforzamento FK Impresa/membership/mercato; Collaborazioni; Organizzazioni strutturali; Osservatorio. |
| **Consumatori principali** | Eventi (contesto opzionale); Contenuti (link narrativo); Servizi (ref opzionale). |
| **Confini** | Scheda Opportunità non owned da Contenuti; ≠ erogazione/contratto. |

### 3.7 Servizi

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | **OffertaDiServizio** e **RichiestaDiServizio** (due AR) |
| **Dipendenze strutturali** | Persone, Imprese; opz. Professionisti / servizi professionali o di Impresa; Opportunità; lingue, settori, mercati. Organizzazioni: **solo etichetta testuale**. |
| **Dipendenze di derivazione** | Relazione concettuale con Professionisti (copertura ≠ offerta strutturata). |
| **Dipendenze future** | Matching, contratti, pagamenti, CRM; FK Organizzazioni; membership; Osservatorio. |
| **Consumatori principali** | Eventi (`service_offers` contesto); Contenuti (link offerte/richieste). |
| **Confini** | Nessun CRM/contratto/pagamento nel ciclo 1. |

### 3.8 Eventi

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | **Evento** (Edizione e Sessione owned, non AR) |
| **Dipendenze strutturali** | Persone, Imprese; opz. Professionisti, Opportunità, Offerte di servizio; lingue; mercati. Organizzazioni: **etichetta testuale**. |
| **Dipendenze di derivazione** | Nessuna ownership dei fatti collegati. |
| **Dipendenze future** | FK Organizzazioni; membership; ticketing/check-in/RRULE; Osservatorio. |
| **Consumatori principali** | **Contenuti** → Eventi (`content_event_links`). **Eventi non dipende da Contenuti** nel ciclo 1. |
| **Confini** | Evento ≠ Contenuto; collegamenti non creano ownership inversa. |

### 3.9 Contenuti

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Contenuto |
| **Dipendenze strutturali** | Persone, Imprese; opz. Professionisti; lingue; Eventi; Opportunità; Servizi (offerte/richieste); Mercati. Ownership ternaria Persona \| Impresa \| Redazione. |
| **Dipendenze di derivazione** | Narrazione di fatti esterni senza possederli. |
| **Dipendenze future** | Link Collaborazioni; Organizzazioni; prodotti narrativi su indicatori Osservatorio; CMS/Storage. |
| **Consumatori principali** | Nessun dominio di business dipende strutturalmente da Contenuti per la propria validità. |
| **Confini** | Fonte autoritativa Logical: `logical/contenuti.md` (`contenuti-editoriali.md` = legacy). Narrazione ≠ fatto. |

### 3.10 Organizzazioni

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Organizzazione |
| **Dipendenze strutturali** | Persone, Imprese (owner XOR + `linked_business_id` dichiarativo); lingue; `organization_officials` owned. |
| **Dipendenze di derivazione** | Nessuna membership nel ciclo 1. |
| **Dipendenze future** | Membership Appartenenze; grafo Org–Org; multi-sede; contesto Identità; link strutturali Eventi/Servizi/Contenuti/Opportunità/Mercati; Fonte Osservatorio. |
| **Consumatori principali** | **Nessuno strutturale nel ciclo 1** (altri domini usano etichette testuali). |
| **Confini** | **Pubblicato**, non candidato. Org ≠ Impresa; nessuna membership/grafo/multi-sede nel ciclo 1. |

### 3.11 Identità & Accessi

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Account |
| **Dipendenze strutturali** | Infrastrutturale: `auth.users`; strutturale opzionale: Persone (`profiles`). Ruoli elevati minimi owned (`account_role_assignments`). |
| **Dipendenze di derivazione** | Appartenenze (`business_memberships`) e Imprese per contesto “per conto di” (senza ownership). |
| **Dipendenze future** | Contesto Organizzazione; deleghe; consensi; Account di servizio; policy RLS applicative trasversali. |
| **Consumatori principali** | Tutti i domini, in fase applicativa futura (supporto accesso); **nessuna ownership** dei fatti di business. |
| **Confini** | Non possiede Persone/Imprese/Organizzazioni; non crea Appartenenze; Account ≠ `auth.users` ≠ Persona. |

### 3.12 Collaborazioni

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | Collaborazione (partecipanti owned) |
| **Dipendenze strutturali** | Persone, Imprese; Appartenenza opzionale/storica (`business_memberships` SET NULL). |
| **Dipendenze di derivazione** | Identità per accesso futuro; Appartenenze per legittimazione. |
| **Dipendenze future** | Organizzazioni; Professionisti; Opportunità; Mercati; matching; fase relazionale; contratti. |
| **Consumatori principali** | Contenuti (narrazione futura, senza FK outbound obbligatoria dal ciclo 1 Collaborazioni). |
| **Confini** | Collaborazione ≠ Appartenenza; non crea diritti applicativi; promotore/controparti ≠ Account. |

### 3.13 Osservatorio

| Voce | Contenuto |
|---|---|
| **Aggregate Root** | **Indicatore** (unico). Valore subordinato all’Indicatore; Fonte statistica = entity owned dal dominio, condivisibile, non AR e non owned da un singolo Indicatore |
| **Dipendenze strutturali** | Unica FK esterna opzionale: `business_sectors` sul Valore. Ogni Valore referenzia obbligatoriamente una Fonte; nessuna relazione obbligatoria Indicatore–Fonte diretta. |
| **Dipendenze di derivazione** | Tutti i domini sorgente come produttori di dati **aggregabili** (nessuna FK ad AR individuali). |
| **Dipendenze future** | Fonte→Organizzazioni; link narrativi→Contenuti; cataloghi geo/paesi; dataset; feed/ETL. |
| **Consumatori principali** | Nessuno per validità sostanziale; prodotti narrativi futuri in Contenuti. |
| **Confini** | Solo aggregati; **nessun microdato**; Fonte ≠ Organizzazione (`producer_name` testuale); nessun ciclo OSS → domini sorgente via FK inverse. |

---

## 4. Matrice consolidata

Relazioni significative (non ogni FK tecnica). Direzione: **sorgente → dipendente** = il dipendente dipende dal sorgente.

| Dominio sorgente | Dominio dipendente | Tipo | Stato v1 | Motivazione |
|---|---|---|---|---|
| Cataloghi foundation | Persone, Imprese, … | Strutturale / infra | Pubblicato | Lingue, settori, competenze condivise |
| Persone | Appartenenze | Strutturale | Pubblicato | Relazione Persona–Impresa |
| Imprese | Appartenenze | Strutturale | Pubblicato | Relazione Persona–Impresa |
| Persone | Professionisti | Strutturale | Pubblicato | Profilo richiede Persona |
| Persone / Imprese | Mercati Internazionali | Strutturale | Pubblicato | Soggetto presenza/interesse |
| Persone / Imprese | Servizi | Strutturale | Pubblicato | Owner XOR offerte/richieste |
| Persone / Imprese | Eventi | Strutturale | Pubblicato | Owner XOR e ruoli |
| Persone / Imprese | Collaborazioni | Strutturale | Pubblicato | Promotore e controparti |
| Persone / Imprese | Organizzazioni | Strutturale | Pubblicato | Owner XOR; link Impresa dichiarativo |
| Persone / Imprese | Contenuti | Strutturale | Pubblicato | Autori/soggetti / ownership ternaria |
| Appartenenze | Collaborazioni | Strutturale (opt.) | Pubblicato | Snapshot titolo / membership |
| Appartenenze | Identità & Accessi | Derivazione | Pubblicato | Contesto Impresa (senza ownership) |
| Professionisti | Eventi | Strutturale (opt.) | Pubblicato | Speaker / profilo |
| Professionisti | Servizi | Strutturale (opt.) | Pubblicato | Provenienza profilo/servizio professionale |
| Professionisti | Contenuti | Strutturale (opt.) | Pubblicato | Link narrativo |
| Opportunità | Eventi | Strutturale (opt.) | Pubblicato | Contesto edizione/evento |
| Opportunità | Servizi | Strutturale (opt.) | Pubblicato | Contesto offerta/richiesta |
| Opportunità | Contenuti | Strutturale | Pubblicato | Link narrativo |
| Servizi (offerte) | Eventi | Strutturale (opt.) | Pubblicato | Contesto servizio |
| Servizi | Contenuti | Strutturale | Pubblicato | Link offerte/richieste |
| Mercati | Eventi / Servizi / Contenuti / Professionisti | Strutturale (opt.) | Pubblicato | Contesto internazionale |
| Eventi | Contenuti | Strutturale | Pubblicato | `content_event_links` → eventi |
| `auth.users` | Identità & Accessi | Infrastrutturale | Pubblicato | Account ancorato all’utente Auth |
| Persone | Identità & Accessi | Strutturale (opt.) | Pubblicato | Associazione Account–Persona |
| `business_sectors` | Osservatorio | Strutturale (opt.) | Pubblicato | Dimensione settore sul Valore |
| Domini sorgente (tutti) | Osservatorio | Derivazione | Documentata | Aggregazione senza FK individuali |
| Identità & Accessi | Domini di business | Derivazione / supporto | Parziale | Accesso futuro; non ownership |
| Organizzazioni | Altri domini di fatto | — | **Assente** strutturalmente | Etichette testuali altrove; FK Org rinviate |

---

## 5. Dipendenze future

| Dipendenza futura | Dominio proprietario | Stato | Motivo del rinvio |
|---|---|---|---|
| Membership Persona–Organizzazione | Appartenenze (+ Org) | Rinviata | Fuori ciclo 1 Org |
| Membership Impresa–Organizzazione | Appartenenze (+ Org) | Rinviata | Fuori ciclo 1 Org |
| Grafo Organizzazione–Organizzazione | Organizzazioni | Rinviata | Scelta ciclo 1 |
| Multi-sede Organizzazioni | Organizzazioni | Rinviata | Sede descrittiva sola |
| Contesto Organizzazione in Identità | Identità & Accessi | Rinviata | Dipende da membership |
| Deleghe e consensi | Identità & Accessi | Rinviata | Oltre ruoli elevati minimi |
| Account di servizio | Identità & Accessi | Rinviata | Non nel ciclo 1 |
| Matching Collaborazioni | Collaborazioni (+ app) | Rinviata | Scheda dichiarativa sola |
| Fase relazionale Collaborazioni | Collaborazioni | Rinviata | Post scheda |
| FK Collaborazioni → Professionisti / Opportunità / Mercati | Collaborazioni | Rinviata | Ciclo 1 minimale |
| Dataset / feed / ETL Osservatorio | Osservatorio | Rinviata | Solo registro aggregati |
| Link Osservatorio ↔ Contenuti | Osservatorio / Contenuti | Rinviata | Narrazione separata |
| Fonte statistica → Organizzazioni | Osservatorio | Rinviata | `producer_name` testuale |
| Cataloghi geografici / paesi | Infra / tassonomia | Rinviata | `country_ref` opaco |
| Storage / media / documenti | Infra | Rinviata | Non importati nei domini |
| FEV | Trasversale | Rinviata | Verifica avanzata |
| Policy RLS applicative | Identità + tutti | Rinviata | Fuori chiusura schema v1 |
| FK strutturali Eventi/Servizi/Contenuti → Organizzazioni | Domini consumatori | Rinviata | Etichette nel ciclo 1 |
| FK retroattive Opportunità raffinate | Opportunità | Rinviata / evolutiva | Secondo Physical Opp |

I rinvii sono **scelte deliberate**, non incomplezze accidentali della v1.

---

## 6. Ordine architetturale

### 6.1 Ordine storico di implementazione (sintesi)

Sequenza effettiva dei cicli pubblicati (timestamp migration / chiusura dominio):

1. Foundation / cataloghi e Persone (anagrafica su `profiles`)
2. Opportunità (nucleo precoce nello storico migration)
3. Imprese e Appartenenze
4. Mercati Internazionali
5. Professionisti
6. Servizi
7. Eventi
8. Contenuti
9. Organizzazioni
10. Identità & Accessi
11. Collaborazioni
12. Osservatorio (chiusura schema v1 — head `20260811110000`)

L’ordine storico non coincide sempre con i livelli di dipendenza (es. Opportunità precoce rispetto a Servizi/Eventi).

### 6.2 Ordine di dipendenza (cluster aciclici)

Ricostruito dai Physical pubblicati:

| Livello | Domini | Ruolo |
|---|---|---|
| **L0 — Foundation** | Cataloghi condivisi; **Persone**; **Imprese** | Soggetti e tassonomie di base |
| **L1 — Relazioni** | **Appartenenze**; **Mercati Internazionali**; **Professionisti** | Relazioni e profili che richiedono L0 |
| **L2 — Prodotti/fatti** | **Opportunità**; **Servizi**; **Eventi**; **Contenuti**; **Organizzazioni** | Fatti pubblicabili e schede; Contenuti dopo Eventi (FK eventi) |
| **L3 — Trasversale** | **Identità & Accessi**; **Collaborazioni** | Accesso e schede dichiarative; Collaborazioni dopo Appartenenze |
| **L4 — Analitico** | **Osservatorio** | Aggregati unidirezionali; nessuna FK verso AR individuali |

**Vincoli d’ordine rilevanti**

* Contenuti **dopo** Eventi (e tipicamente dopo Servizi/Opportunità/Mercati/Professionisti referenziati).
* Collaborazioni **dopo** Appartenenze (FK opzionale membership).
* Identità **dopo** Persone (e Auth); Org non è precondizione strutturale di Account nel ciclo 1.
* Osservatorio **indipendente** dai fatti individuali (solo `business_sectors` opzionale).

---

## 7. Analisi dei cicli

**Esito:** nessun ciclo di **ownership**. I cicli apparenti si risolvono con derivazione, narrazione o etichette.

| Ciclo apparente | Meccanismo di risoluzione | Stato |
|---|---|---|
| Identità ↔ Persone | Account riferisce Persona opzionale; Persona non dipende da Account per esistere | Risolto |
| Identità ↔ Appartenenze | Identità **deriva** contesto da Appartenenze senza possederle né crearne | Risolto |
| Contenuti ↔ Eventi / Opp / Servizi | Solo **Contenuti → fatti**; i fatti non possiedono la narrazione | Risolto |
| Eventi ↔ domini collegati | Eventi collega senza ownership inversa dei soggetti | Risolto |
| Osservatorio ↔ domini sorgente | Derivazione unidirezionale; **nessuna FK** a Persone/Imprese/Org/Contenuti | Risolto |
| Organizzazioni ↔ Imprese | Link dichiarativo / owner XOR; **nessuna fusione** né membership | Risolto |
| Organizzazioni ↔ altri domini | Consumo futuro; ciclo 1 solo etichette testuali verso Org | Risolto (assenza) |
| Appartenenze ↔ Collaborazioni | Tipi distinti; Collaborazioni può snapshot-are Appartenenza senza ownership | Risolto |
| Servizi ↔ Professionisti | Ref opzionale; AR e semantica distinti | Risolto |

---

## 8. Stato v1

| Voce | Dichiarazione |
|---|---|
| Domini pubblicati | **13/13** |
| Physical | Presenti per tutti i 13 |
| Migration | Applicati; head **`20260811110000`** |
| DB locale / remoto | Allineati; pending **0** |
| Dipendenze strutturali | Chiuse per il perimetro ciclo 1 di ciascun dominio |
| Derivazioni | Documentate (Identità, Osservatorio, narrazione Contenuti, legittimazioni) |
| Dipendenze future | Rinviate intenzionalmente (§5) |
| Cicli di ownership | **Nessuno bloccante** |
| Dependency Map | **Consolidata** come fotografia v1 |
| Accesso applicativo / policy RLS complete | **Fuori perimetro** della chiusura schema |

Questa mappa non afferma che la piattaforma sia production-ready.

---

## 9. Riferimenti

| Dominio | Physical | Logical |
|---|---|---|
| Persone | `domain-mapping/persone.md` | `logical/persone.md` |
| Imprese | `domain-mapping/imprese.md` | `logical/imprese.md` |
| Appartenenze | `domain-mapping/appartenenze.md` | `logical/appartenenze.md` |
| Mercati Internazionali | `domain-mapping/mercati-internazionali.md` | `logical/mercati-internazionali.md` |
| Professionisti | `domain-mapping/professionisti.md` | `logical/professionisti.md` |
| Opportunità | `domain-mapping/opportunita.md` | `logical/opportunita.md` |
| Servizi | `domain-mapping/servizi.md` | `logical/servizi.md` |
| Eventi | `domain-mapping/eventi.md` | `logical/eventi.md` |
| Contenuti | `domain-mapping/contenuti.md` | **`logical/contenuti.md`** |
| Organizzazioni | `domain-mapping/organizzazioni.md` | `logical/organizzazioni.md` |
| Identità & Accessi | `domain-mapping/identita-accessi.md` | `logical/identita-accessi.md` |
| Collaborazioni | `domain-mapping/collaborazioni.md` | `logical/collaborazioni.md` |
| Osservatorio | `domain-mapping/osservatorio.md` | `logical/osservatorio.md` |

* Domain Model consolidato: `docs/domain-model.md`
* Reconciliation Report consolidato: `docs/architecture/logical/reconciliation-report.md` (decisioni bloccanti chiuse; questioni residue esplicitamente post-v1; coerente con questa Dependency Map e con i 13 domini pubblicati)
* Legacy: `logical/contenuti-editoriali.md` non è la fonte principale

---

**Dependency Map v1 consolidata**, reciprocamente coerente con Domain Model e Reconciliation Report. Nessun ulteriore aggiornamento obbligatorio di questi documenti prima del commit della baseline.
