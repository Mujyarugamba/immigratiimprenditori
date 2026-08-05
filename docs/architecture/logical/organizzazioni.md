# Logical Data Model — Dominio ORGANIZZAZIONI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, CMS, componenti dell’interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md) (**sketch funzionale storico**, non contratto implicito), [`docs/architecture/logical/reconciliation-report.md`](./reconciliation-report.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/servizi.md`](./servizi.md), [`docs/architecture/logical/eventi.md`](./eventi.md), [`docs/architecture/logical/contenuti.md`](./contenuti.md).
> Scopo del documento: definire il modello logico **autoritativo** del dominio Organizzazioni — candidato dichiarato in `domain-model.md` §11 e in `reconciliation-report.md` §12–§13 come **Organizzazioni istituzionali** — in modo sufficiente a consentire Physical mapping e Migration Plan **senza nuove decisioni semantiche sostanziali**.
> Autorità delle fonti. Vincolanti: Domain Model (§11 candidato; principio Impresa = soggetto economico), Reconciliation (§12 vuoto di ownership; rischio §16 #8 contro estensione Imprese), Dependency Map (DC2, DV3, Persona–Organizzazione / Impresa–Organizzazione via Appartenenze), Logical Imprese/Appartenenze/Eventi/Servizi/Contenuti/Opportunità/Mercati/Professionisti (confini già chiusi). PDS §6 OrganizzazioneIstituzionale = **input storico**, non contratto. Ogni scelta non già vincolata è marcata come **decisione di questo Logical**.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API, Storage o Identità & Accessi.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Nome ufficiale del dominio | **Organizzazioni** |
| Sinonimo normativo | **Organizzazioni istituzionali** (`domain-model.md` §11; `reconciliation-report.md` §12–§13) |
| Artefatto | Logical Data Model |
| Stato | **Chiuso per il passaggio al Physical** (salvo decisioni rinviate esplicite al §44) |
| Ciclo di riferimento | Ciclo 1 — perimetro minimo implementabile (§39) |
| Physical / Migration Plan / SQL | **Fuori da questo documento** |
| Revisione | Prima redazione autoritativa post-chiusura Contenuti; chiude AR, ownership, ciclo 1 e confini adiacenti |
| Predecessore Logical | **Assente** (nessun `logical/organizzazioni.md` preesistente) |

---

## 2. Scopo

Definire cosa rappresenta il dominio Organizzazioni nella piattaforma ImmigratiImprenditori: **soggetti collettivi non riducibili a Impresa economica** (associazioni, enti, camere, fondazioni, reti istituzionali e analoghi) che possono essere descritti con una **scheda propria**, **senza** assorbire:

- l’identità economica dell’Impresa (`logical/imprese.md`);
- le relazioni di appartenenza Persona–Impresa già chiuse in Appartenenze;
- le membership Persona–Organizzazione / Impresa–Organizzazione (competenza futura di Appartenenze, Dependency Map DC2);
- i fatti di Eventi, Servizi, Contenuti, Opportunità, Professionisti o Mercati già modellati con etichette opache o ownership Locale;
- CRM, HR, organigrammi, payroll, contabilità, gestione documentale, multi-tenant o Identità & Accessi.

---

## 3. Fonti normative interne

| Fonte | Ruolo rispetto a questo documento |
|---|---|
| `domain-model.md` §1 (storia “Impresa & Organizzazioni”), §11 | Candidato “Organizzazioni istituzionali”; da valutare; riferimenti esterni senza scheda propria |
| `reconciliation-report.md` §4.2 #2, §7 (glossario Organizzazione/Ente), §12–§13, §16 #8 | Vuoto di ownership; dominio a sé vs estensione Imprese; rischio di scivolare soggetti non economici in Imprese |
| `domain-dependency-map.md` §5, DC2, DV3, §7 Professionisti | Appartenenze possiede Persona–Org / Impresa–Org quando Org esisterà; fino ad allora VO01/C06 |
| `logical/imprese.md` §2 | Impresa = soggetto economico; forma organizzativa include cooperativa ed ente **economico**; non copre soggetti non economici |
| `logical/appartenenze.md` | Ciclo 1 = solo Persona–Impresa; nessuna modellazione Org |
| `logical/eventi.md` §5–§7, §11 | Org come dominio futuro; titolare Persona\|Impresa; etichetta esterna |
| `logical/servizi.md` §22 | Riferimento testuale; nessuna FK obbligatoria Org |
| `logical/contenuti.md` §5, §8 | Redazione senza FK Org; Org non titolare obbligatorio |
| `logical/opportunita.md` | Promotori istituzionali come riferimento informativo |
| `logical/mercati-internazionali.md` §2, §6 | Risorsa di supporto (camera, ambasciata, associazione) ownership locale MI |
| `logical/professionisti.md` | Ordini/associazioni come etichette; relazioni future via Appartenenze |
| `platform-data-specification.md` §6 OrganizzazioneIstituzionale | Sketch storico tipologie/attributi — **non** contratto |

---

## 4. Glossario

| Termine | Significato in questo dominio | Non confondere con |
|---|---|---|
| **Organizzazione** | Aggregate root: soggetto collettivo istituzionale o associativo con scheda propria sulla piattaforma | Impresa; Account; gruppo auth; Redazione piattaforma |
| **TipologiaOrganizzativa** | Classificazione tipologica principale dell’Organizzazione (catalogo di dominio) | Forma organizzativa di Impresa; `profiles.organization_type` legacy |
| **Titolare della scheda** | Chi assume responsabilità della scheda Organizzazione sulla piattaforma (Persona \| Impresa \| Redazione) | Rappresentante legale; amministratore Account; membro |
| **Rappresentante** | Ruolo istituzionale dichiarato (es. presidente) riferito a Persona o etichetta | Delega Identità; Autorizzazione gestionale Appartenenza |
| **Referente** | Punto di contatto pubblico/operativo dichiarato | Rappresentante legale; HR |
| **SedeDescrittiva** | Collocazione dichiarativa principale (testuale/territoriale) | Catalogo geografico; multi-sede operativa completa |
| **Impresa collegata** | Riferimento facoltativo a un’Impresa quando esiste continuità o doppia natura dichiarata | Fusione automatica delle anagrafiche; ownership dell’Impresa |
| **Appartenenza a Organizzazione** | Relazione Persona–Org o Impresa–Org | **Fuori ownership di questo dominio**; competenza Appartenenze (futura) |
| **Etichetta organizzazione esterna** | Nome opaco usato da Eventi/Servizi/Contenuti/Opportunità/Professionisti | Scheda Organizzazione di questo dominio |
| **Risorsa di supporto al mercato** | Entità locale di Mercati Internazionali | Non assorbita automaticamente in ciclo 1 |
| **Gruppo informale** | Collettivo senza struttura riconoscibile sufficiente a una scheda | Non è Organizzazione di ciclo 1 |
| **Redazione piattaforma** | Soggetto redazionale interno (come in Contenuti) | Non implica scheda Organizzazione |

---

## 5. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Organizzazioni rappresenta **schede anagrafiche e istituzionali** di soggetti collettivi **non economici in senso di Impresa** (o non riducibili a Impresa), utili come riferimento stabile per ricerca, narrazione, contesti di mercato e — in fasi successive — per Appartenenze Persona–Organizzazione / Impresa–Organizzazione.

**Quali problemi risolve.**
- Dare un’identità di piattaforma a associazioni, camere, enti, fondazioni e analoghi oggi ridotti a etichette opache.
- Distinguere nettamente Organizzazione da Impresa e da Appartenenza.
- Evitare di estendere Imprese a soggetti non economici (`reconciliation-report.md` §16 #8).
- Preparare, senza anticiparla, l’estensione Appartenenze verso Org (Dependency Map DC2).

**Cosa non risolve / non comprende.**
- Membership, affiliazioni operative, organigrammi, HR, payroll, contabilità.
- Titolarità obbligatoria di Eventi, Servizi, Contenuti, Opportunità (domini già chiusi).
- Assorbimento automatico delle Risorse di supporto MI.
- Account, ruoli applicativi, inviti, policy RLS, multi-tenant.
- CRM, gestione documentale, workflow approvativi, directory aziendale.

**Dipendenze dichiarate (ciclo 1).**
- **Persone** — titolare/referente/rappresentante referenziati.
- **Imprese** — titolare e/o collegamento facoltativo.
- **Appartenenze** — non usate in ciclo 1 per Org; restano proprietarie future delle membership.
- **Mercati / Eventi / Servizi / Contenuti / Opportunità / Professionisti** — riferimenti narrativi/contestuali **non obbligatori** e **non retroattivi**.

---

## 6. Aggregate root

### Decisione strutturale (decisione di questo Logical)

| Opzione | Esito |
|---|---|
| **A. `Organizzazione` unica con tipologie** | **Adottata** |
| B. AR distinte per associazioni/enti/fondazioni/reti | **Rifiutata** — non sostenuta dalle fonti; moltiplicherebbe i confini Appartenenze |
| C. `SoggettoCollettivo` generico | **Rifiutata** — troppo ampio; confonderebbe Impresa ed Org |
| D. Estensione di Imprese | **Rifiutata per ciclo 1** — contraddice Impresa = soggetto economico e rischio reconciliation §16 #8 |

### Organizzazione (unico AR)

| Aspetto | Definizione |
|---|---|
| Identità concettuale | Soggetto collettivo istituzionale/associativo con scheda propria |
| Responsabilità | Anagrafica, tipology, descrizione istituzionale, lifecycle di scheda, sede descrittiva, referenti/rappresentanti dichiarati |
| Ownership della scheda | Esattamente uno: **Persona** XOR **Impresa** XOR **Redazione piattaforma** |
| Lifecycle | Assi separati: redazione, pubblicazione, attività operativa, archiviazione (§12–§14) |
| Invarianti | Tipology obbligatoria; titolare XOR; ≠ Impresa; ≠ Appartenenza; no Account |
| Cardinalità | 1 Organizzazione → 0..1 Impresa collegata; 0..N referenti; 0..1 sede descrittiva principale ciclo 1 |
| Dati owned | Identità, tipology, testi, assi stato, sede descrittiva, referenti/rappresentanti dichiarati, eventuali ambiti |
| Dati referenced | Persona, Impresa (titolare/collegata), eventualmente lingua/territorio come riferimenti opachi |
| Dati derivati | Completezza, conteggi membri/partner/eventi — **non persistiti** |
| Relazioni ammesse | Link facoltativo a Impresa; riferimenti descrittivi ad altri domini senza ownership |
| Relazioni vietate | Incorporare membership; possedere Eventi/Servizi/Contenuti; FK obbligatorie retroattive |
| Esclusioni | HR, organigramma, documenti costitutivi, FEV, Storage, grafo federativo complesso |

---

## 7. Entità e classificazione

| Entità / concetto | Classificazione ciclo 1 | Note |
|---|---|---|
| Organizzazione | Aggregate Root | Unica |
| TipologiaOrganizzativa | Catalogo di dominio | Una tipology principale per AR |
| AmbitoDiAttività | Catalogo o etichetta controllata | Opzionale; ≠ settori Impresa |
| SedeDescrittiva | Value / owned minimale | Una sede principale dichiarativa |
| RappresentanteDichiarato | Entity owned | Persona oppure etichetta (XOR); ruolo chiuso |
| ReferenteDichiarato | Entity owned | Contatto pubblico/operativo |
| RelazioneOrganizzazione–Organizzazione | — | **Rinviata** |
| Membership Persona–Org / Impresa–Org | — | **Appartenenze (futuro)** |
| DocumentoCostitutivo / Statuto | — | **Rinviato** |
| Fonte / Evidenza / Verifica (FEV) | — | **Rinviata** |
| Media / Logo Storage | — | Solo URL logo opaco opzionale |
| Unità organizzativa / Dipartimento | — | **Esclusa** |
| Gruppo informale | — | **Escluso** dal ciclo 1 |

---

## 8. Ownership

| Aspetto | Decisione ciclo 1 |
|---|---|
| Titolare della scheda | Esattamente uno: **Persona** XOR **Impresa** XOR **Redazione piattaforma** |
| Organizzazione “proprietaria di sé” | **No** come titolare di scheda nel ciclo 1 (evita circolarità e anticipazione Identità) |
| Rappresentante legale | Ruolo dichiarato, distinto dal titolare della scheda |
| Referente | Ruolo dichiarato, distinto dal titolare |
| Autore della descrizione | Coincide tipicamente col titolare o con Redazione; non è Account |
| Amministratore applicativo | **Identità & Accessi (futuro)** |
| `auth.users` | **Vietato** come owner |
| Appartenenza | Non confertitolare; non owned da Organizzazioni |

**Decisione di questo Logical.** Il pattern di titolarità allinea Contenuti/Eventi/Servizi (soggetti Persona|Impresa + Redazione per schede istituzionali di piattaforma), senza introdurre Organizzazione come titolare di sé prima di Identità.

---

## 9. Organizzazione

Elementi minimi di una Organizzazione ciclo 1:

1. Identità stabile  
2. Denominazione (non blank)  
3. Tipologia organizzativa principale  
4. Titolare della scheda (Persona \| Impresa \| Redazione)  
5. Descrizione o missione (almeno una forma testuale sostanziale)  
6. Stato di redazione  
7. Stato di pubblicazione  
8. Stato operativo (attività)  
9. Visibilità sostanziale  

Elementi facoltativi ciclo 1: denominazione breve; anno di fondazione; sito; email/telefono dichiarativi; logo URL opaco; sede descrittiva; lingua principale; ambiti; rappresentanti/referenti; collegamento facoltativo a Impresa.

---

## 10. Tipologie organizzative

Catalogo chiuso di **finalità/natura istituzionale principale** (una tipology primaria; non AR multiple).

| Tipologia ciclo 1 | Inclusa | Note |
|---|---|---|
| Associazione | Sì | Inclusi casi di associazioni di categoria / imprenditoriali |
| Fondazione | Sì | |
| Ente pubblico / organismo pubblico | Sì | |
| Camera di commercio | Sì | |
| Ambasciata / Consolato | Sì | |
| Ordine / Collegio professionale | Sì | ≠ iscrizione professionale (Professionisti) |
| Università / Ente di formazione (come soggetto) | Sì | ≠ Corso/Evento; ≠ Mercato |
| ONG / Ente non profit | Sì | |
| Rete / Consorzio istituzionale | Sì | Rete come tipology, non grafo |
| Comunità organizzata | Sì | Solo se strutturalmente riconoscibile |
| Altro | Sì | Residuo governato |
| Cooperativa | **No come tipology Org** | Se economica → **Impresa** (`organization_form`); se associativa non economica → tipology Associazione |
| Gruppo informale | **Escluso** | Insufficiente per scheda |
| Partito politico | **Escluso** ciclo 1 | Categoria sensibile senza mandato funzionale |
| Organizzazione religiosa | **Esclusa** ciclo 1 | Idem |
| Sindacato | **Rinviato** | Valutabile come tipology futura |
| Organismo internazionale | **Rinviato** o tipology Ente/Altro | Non obbligatorio ciclo 1 |
| Scuola (non universitaria) | **Rinviata** | |

**Decisione di questo Logical.** Tipologie derivate da PDS §6 + reconciliation §12 + tipi MI support / legacy `profiles.organization_type`, **ricondotte** a un catalogo unico di dominio, senza importare il CHECK legacy su `profiles`.

---

## 11. Identità organizzativa

| Dato | Ciclo 1 | Note |
|---|---|---|
| Denominazione | Owned obbligatoria | Non blank |
| Denominazione breve | Opzionale | |
| Descrizione / missione | Owned (almeno una) | Testo unico; no page builder |
| Tipologia | Owned obbligatoria | Catalogo §10 |
| Anno di fondazione | Opzionale | Dichiarativo |
| Stato di attività | Asse operativo §14 | |
| Codice fiscale / P.IVA / registro / albo | **Rinviati** | Verifica amministrativa futura |
| Sito web, email, telefono | Opzionali dichiarativi | Non CRM |
| Logo | URL opaco opzionale | ≠ Storage |
| Social | **Rinviati** o testo opaco minimo | Non social graph |
| Lingua principale | Opzionale | Riferimento a Lingua (Persone/catalogo) |
| Territorio / sede | §15–§16 | |
| Slug / URL pubblico | Derivabile / forma fisica | Logical: identità pubblica dichiarabile |

---

## 12. Lifecycle

Assi **separati** (principio Domain Model / reconciliation §8):

| Asse | Valori ciclo 1 | Significato |
|---|---|---|
| Redazione | `draft` \| `ready` | Completezza editoriale della scheda |
| Pubblicazione | `unpublished` \| `published` \| `withdrawn` | Disponibilità della scheda come rappresentazione |
| Attività operativa | `active` \| `inactive` \| `suspended` \| `dissolved` | Natura sostanziale del soggetto collettivo |
| Archiviazione | `archived_at` assente/presente | Scheda storicizzata come non corrente |

**Transizioni (concettuali).**
- Pubblicazione `published` richiede redazione `ready` e titolare valido.
- `dissolved` non implica automaticamente `withdrawn` (la scheda può restare pubblica come memoria).
- `withdrawn` non implica dissoluzione.
- Archiviazione è indipendente dalla dissoluzione.

**Non usato:** unico stato che mescola natura giuridica, attività e pubblicazione.

---

## 13. Pubblicazione

| Aspetto | Decisione |
|---|---|
| Valori | `unpublished` \| `published` \| `withdrawn` |
| Visibilità | `private` \| `public` (sostanziale; non policy RLS) |
| Scheduling | **Escluso** ciclo 1 |
| Pubblicabilità | `published` ⇒ redazione `ready` |
| Modificabilità | Consentita anche se published; ritiro esplicito via `withdrawn` |

---

## 14. Stato operativo

| Valore | Significato |
|---|---|
| `active` | Soggetto collettivo operativo |
| `inactive` | Non operativo senza dissoluzione formale |
| `suspended` | Sospensione dichiarata/temporanea |
| `dissolved` | Cessazione/dissoluzione dichiarata |

Date correlate ammissibili (opzionali): data inizio attività dichiarata; data cessazione. Non sostituiscono gli assi.

---

## 15. Sedi

| Aspetto | Ciclo 1 |
|---|---|
| Sede principale descrittiva | **Inclusa** (0..1) |
| Sede legale distinta | **Rinviata** se distinta dalla principale |
| Multi-sede operativa | **Rinviata** |
| Indirizzo testuale / città / paese | Dichiarativi opachi o riferimenti territoriali semplici |
| Sede online | URL/sito già in identità; non “sede virtuale” separata obbligatoria |

**Decisione.** Una sola sede descrittiva evita cataloghi geografici e tabelle sedi complesse nel ciclo 1.

---

## 16. Territori

| Aspetto | Ciclo 1 |
|---|---|
| Territorio di riferimento | Opzionale dichiarativo (testo o riferimento opaco) |
| Area operativa / territorio servito multiplo | **Rinviato** |
| Cataloghi geografici nuovi | **Vietati** |
| Presenza di mercato | Resta in **Mercati Internazionali** |

---

## 17. Rappresentanti

| Aspetto | Decisione ciclo 1 |
|---|---|
| Inclusione | Sì, forma minimale owned |
| Soggetto | Persona **oppure** etichetta esterna (XOR); Professional Profile **non obbligatorio** |
| Ruoli chiusi | `legal_representative`, `president`, `director`, `secretary`, `spokesperson`, `board_member`, `other` |
| Cardinalità | 0..N; al più un flag “principale” opzionale |
| Periodo | Opzionale (inizio/fine) |
| HR / organigramma | **Esclusi** |
| Impresa come rappresentante | **No** (usa Persona o etichetta) |

---

## 18. Referenti

| Aspetto | Decisione ciclo 1 |
|---|---|
| Inclusione | Sì, distinta da rappresentante |
| Ruoli | `public_contact`, `operational_contact` |
| Soggetto | Persona XOR etichetta |
| Contatti | Email/telefono dichiarativi opzionali sul referente o sulla scheda |
| ≠ | Amministratore Account; Gestore scheda Impresa (Appartenenze) |

---

## 19. Appartenenze

| Aspetto | Decisione |
|---|---|
| Ownership membership | **Appartenenze**, non Organizzazioni |
| Ciclo 1 Appartenenze attuale | Solo Persona–Impresa (già chiuso) |
| Persona–Organizzazione / Impresa–Organizzazione | **Future** quando Appartenenze sarà esteso (Dependency Map DC2) |
| Questo dominio in ciclo 1 | Solo anagrafica; **nessuna** membership owned |
| Affiliazione / partnership / adesione formale | Relazioni di Appartenenze future o relazioni Org–Org rinviate |
| Partecipazione informale | Non crea Organizzazione |

**Invariante.** Organizzazioni non duplica `memberships` né introduce FK polimorfiche Persona/Impresa.

---

## 20. Relazioni tra Organizzazioni

| Aspetto | Ciclo 1 |
|---|---|
| Federazione / affiliazione / parent / capitolo | **Rinviate** |
| Partnership Org–Org tipizzata | **Rinviata** |
| Grafo organizzativo | **Vietato** nel ciclo 1 |
| Nota descrittiva “fa parte di…” | Testo libero opzionale ammesso, senza grafo |

---

## 21. Settori e ambiti

| Aspetto | Ciclo 1 |
|---|---|
| Ambiti di attività propri (catalogo leggero) | Opzionali |
| Settori economici Impresa (`business_sectors`) | **Non duplicati**; eventuale riferimento futuro, non obbligatorio |
| Target / comunità servite / temi | Testo o tag rinviati / minimali |
| Mercati | Riferimento descrittivo; Presenza resta in MI |

---

## 22. Lingue

| Aspetto | Ciclo 1 |
|---|---|
| Lingua principale | Opzionale (riferimento a Lingua esistente) |
| Lingue operative multiple | **Rinviate** |
| Duplicazione strutture Professionisti/Servizi | **Vietata** |

---

## 23. Relazioni con Persone

| Relazione | Ciclo 1 |
|---|---|
| Persona titolare della scheda | Sì |
| Persona rappresentante/referente | Sì (owned) |
| Persona membro/associato | **Appartenenze future** |
| Persona come soggetto narrato in Contenuti | Contenuti (già chiuso); Org non obbligatoria |

---

## 24. Relazioni con Imprese

| Relazione | Ciclo 1 |
|---|---|
| Impresa titolare della scheda | Sì |
| Link facoltativo Organizzazione → Impresa | **Sì** (0..1), per doppia natura o continuità dichiarata |
| Duplicazione automatica cooperativa/Impresa | **Vietata** |
| Impresa associata/fondatrice/controllata | Relazioni strutturate **rinviate** (oltre il link 0..1) |
| Modifiche retroattive a Imprese | **Vietate** |

**Chiusura Impresa vs Organizzazione.**
- Impresa resta owned da Imprese.
- Cooperativa economica = Impresa (`organization_form`), non tipology Org.
- Un’Organizzazione può referenziare un’Impresa senza fondersi.
- Nessuna doppia anagrafica obbligatoria: il link è facoltativo e dichiarativo.

---

## 25. Relazioni con Appartenenze

| Aspetto | Decisione |
|---|---|
| Ciclo 1 | Nessuna dipendenza operativa |
| Futuro | Appartenenze estende AR per Persona–Org e Impresa–Org |
| Organizzazioni | Non possiede né definisce Ruoli di membership Impresa |

---

## 26. Relazioni con Professionisti

| Aspetto | Ciclo 1 |
|---|---|
| Ordine/associazione come tipology Org | Sì (scheda) |
| Iscrizione/credenziale professionale | Resta in **Professionisti** (etichette esistenti) |
| Conversione automatica etichette → FK Org | **Rinviata** |
| Professionista “appartenente” | Appartenenze future |

---

## 27. Relazioni con Servizi

| Aspetto | Decisione |
|---|---|
| Titolare Offerta/Richiesta | Resta Persona\|Impresa (Servizi chiuso) |
| Org come promotrice/partner | Solo riferimento informativo futuro; **nessuna FK obbligatoria retroattiva** |
| `external_organization_label` | Resta valida; eventuale allineamento futuro non è ciclo 1 Org |
| Duplicazione schede Servizi | **Vietata** |

---

## 28. Relazioni con Eventi

| Aspetto | Decisione |
|---|---|
| Titolare Evento | Resta Persona\|Impresa |
| Organizzatore/sponsor/partner istituzionale | Etichetta esterna già ammessa; **nessuna FK obbligatoria** da questo ciclo |
| Org come titolare Evento | **Rinviato** |
| Modifica migration Eventi | **Vietata** |

---

## 29. Relazioni con Contenuti

| Aspetto | Decisione |
|---|---|
| Titolare Contenuto | Persona\|Impresa\|Redazione (chiuso) |
| Org come editore/autore istituzionale | **Rinviato** come FK; etichetta opaca già ammessa |
| Org come soggetto descritto | Futuro possibile via link tipizzato Contenuti; **non** imposto ora |
| Redazione ≠ scheda Org | Redazione resta meccanismo di ownership CE, non istanza Org obbligatoria |

---

## 30. Relazioni con Opportunità

| Aspetto | Decisione |
|---|---|
| Promotore/erogatore istituzionale | Riferimento informativo (già ammesso) |
| Scheda Org | Non sostituisce né possiede Opportunità |
| FK obbligatoria retroattiva | **Vietata** |

---

## 31. Relazioni con Mercati Internazionali

| Aspetto | Decisione |
|---|---|
| Risorsa di supporto MI | Resta owned da MI nel ciclo 1 |
| Assorbimento in Org | **Rinviato** (MI già prevede possibilità futura) |
| Org “attiva su mercato” | Non crea Presenza/Interesse/Attività |
| Camera/ambasciata come tipology | Sì in Org; dual writing con MI **non** imposto |

---

## 32. Relazioni con Identità & Accessi

| Aspetto | Decisione |
|---|---|
| Account / membri autenticati / inviti | **Esclusi** |
| Ruoli applicativi / permessi / policy | **Esclusi** |
| Multi-tenancy / gruppi auth | **Esclusi** |
| Esigenza futura | Tradurre titolarità scheda e (future) Appartenenze Org in permessi tecnici, **senza** creare fatti sostanziali |

---

## 33. FEV e verifica

| Aspetto | Ciclo 1 |
|---|---|
| Fonti / evidenze / verifiche strutturali | **Escluse** |
| Importazione FEV Professionisti | **Vietata** |
| Verifica tipologica/amministrativa | **Rinviata** |
| Autodichiarazione | Default del ciclo 1 |

---

## 34. Documenti e allegati

| Aspetto | Ciclo 1 |
|---|---|
| Statuto, atti, registri, licenze | **Esclusi** |
| Gestione documentale | **Vietata** |
| Riferimento URL opaco a documento pubblico | Opzionale minimo ammesso, senza library |

---

## 35. Media e Storage

| Aspetto | Ciclo 1 |
|---|---|
| Logo | URL opaco opzionale |
| Gallery / brochure / video / bucket | **Esclusi** |
| Storage | **Non progettato** |

---

## 36. Invarianti

1. Esiste un solo Aggregate Root: **Organizzazione**.  
2. Organizzazione ≠ Impresa; Impresa resta soggetto economico.  
3. Organizzazione ≠ Appartenenza; membership non owned qui.  
4. Titolare scheda = Persona XOR Impresa XOR Redazione.  
5. Tipology principale obbligatoria e del catalogo di dominio.  
6. Gruppo informale non è Organizzazione ciclo 1.  
7. Nessuna FK concettuale obbligatoria verso Eventi, Servizi, Contenuti, Opportunità già chiusi.  
8. Nessun `auth.users` come owner.  
9. Nessun organigramma/HR/CRM.  
10. Contatori e completezza sono derivati, non fatti primari.  
11. Legacy `profiles.organization_type` non è il catalogo di questo dominio.  
12. Cooperativa economica non diventa tipology Org.

---

## 37. Dati derivati

Non persistiti come fatti primari: numero membri; numero sedi; numero partner; numero eventi/servizi collegati; score di completezza; “presenza internazionale”; URL pubblico costruito.

---

## 38. Dati vietati

Organigramma; payroll; contabilità; CRM pipeline; ticket HR; ruoli applicativi; account; policy; multi-tenant; JSONB page builder; Storage library; FEV completo; grafo federativo; ownership Evento/Servizio/Contenuto; membership duplicate; settori Impresa copiati; partiti/religioni come tipology ciclo 1.

---

## 39. Perimetro ciclo 1

**Obiettivo minimo.** Pubblicare schede anagrafiche istituzionali ricercabili, con tipology, ownership di scheda, lifecycle slim, sede descrittiva e referenti/rappresentanti minimali, senza rompere i domini chiusi.

| Elemento | Incluso |
|---|---|
| AR Organizzazione | Sì |
| Catalogo tipologie | Sì |
| Ambiti opzionali | Sì (leggeri) |
| Sede descrittiva 0..1 | Sì |
| Rappresentanti / referenti | Sì |
| Link facoltativo a Impresa | Sì |
| Lingua principale opzionale | Sì |
| Lifecycle 4 assi | Sì |
| Membership Appartenenze Org | No |
| Relazioni Org–Org | No |
| FEV / documenti / Storage | No |
| FK retroattive Eventi/Servizi/CE/Opp | No |
| Assorbimento Risorse MI | No |

**Criterio di completamento ciclo 1.** Physical può mappare AR + catalogo + owned minimali + confini senza nuove decisioni semantiche sostanziali.

---

## 40. Fuori perimetro

HR; organigrammi; unità organizzative; membership; grafo federativo; FEV; documenti costitutivi; media library; Identità & Accessi; CRM; contabilità; ticketing; partiti/religioni; assorbimento forzato etichette legacy; titolarità Eventi/Servizi/Contenuti; Formazione; Osservatorio come owner.

---

## 41. Dipendenze

| Direzione | Dipendenza | Natura ciclo 1 |
|---|---|---|
| Org → Persone | Titolare / rappresentante / referente | Necessaria quando usati |
| Org → Imprese | Titolare e/o link facoltativo | Facoltativa (link); necessaria se titolare Impresa |
| Org → Appartenenze | — | Nessuna operativa |
| Org → Eventi/Servizi/CE/Opp/MI/Professionisti | — | Nessuna FK obbligatoria |
| Domini chiusi → Org | — | Restano etichette; cutover futuro |
| Identità → Org | — | Futura, solo accesso |

**Assenza cicli.** Organizzazioni non richiede ownership reciproca dai domini chiusi.

---

## 42. Eventi di dominio

| Evento | Significato |
|---|---|
| SchedaOrganizzazioneCreata | Nasce l’AR |
| SchedaOrganizzazionePubblicata | Pubblicazione |
| SchedaOrganizzazioneAggiornata | Modifica anagrafica |
| SchedaOrganizzazioneSospesa / Cessata | Asse operativo |
| SchedaOrganizzazioneRitirata | Pubblicazione withdrawn |
| SchedaOrganizzazioneArchiviata | Archiviazione |
| ReferenteDichiarato / RappresentanteDichiarato | Ruoli owned |
| CollegamentoImpresaDichiarato | Link facoltativo a Impresa |

Non sono audit log tecnici né eventi Identità.

---

## 43. Questioni risolte

1. Dominio **a sé**, non estensione di Imprese.  
2. AR unica **Organizzazione** con tipologies (opzione A).  
3. Impresa vs Organizzazione chiusa; cooperativa economica resta Impresa.  
4. Appartenenze resta owner delle membership; ciclo 1 Org senza membership.  
5. Ownership scheda Persona\|Impresa\|Redazione; no `auth.users`.  
6. Nessuna FK obbligatoria retroattiva a Eventi/Servizi/Contenuti/Opportunità.  
7. Sede unica descrittiva; multi-sede rinviata.  
8. Relazioni Org–Org rinviate (no grafo).  
9. FEV/documenti/Storage esclusi.  
10. PDS §6 e legacy `profiles.organization_type` non sono contratti Physical.  
11. Risorse di supporto MI non assorbite in ciclo 1.  
12. Redazione CE ≠ istanza Org obbligatoria.

---

## 44. Decisioni rinviate

1. Estensione Appartenenze Persona–Org / Impresa–Org (vocabolario ruoli dedicato).  
2. Cutover etichette `external_organization_label` → riferimenti Org.  
3. Assorbimento o dual-write delle Risorse di supporto MI.  
4. Org come titolare di Eventi/Servizi/Contenuti.  
5. Relazioni Org–Org tipizzate / parent / federazione.  
6. Multi-sede e territori serviti.  
7. FEV e documenti costitutivi.  
8. Tipology sindacato / organismo internazionale / scuola.  
9. Conversione etichette Professionisti (ordini/associazioni).  
10. Se e come Redazione piattaforma possa essere rappresentata anche come Org.  
11. Continuità storica fusioni/trasformazioni istituzionali.  
12. Priorità di verifica amministrativa (CF, registri).

Non bloccano il Physical del ciclo 1 anagrafico.

---

## 45. Criteri per il Physical

Il Physical dovrà:

1. Mappare un’unica AR e il catalogo tipologie.  
2. Realizzare ownership ternaria Persona\|Impresa\|Redazione senza Org self-owner.  
3. Separare assi redazione / pubblicazione / attività / archiviazione.  
4. Owned minimali: sede descrittiva, rappresentanti, referenti.  
5. Link facoltativo a Impresa (0..1), senza fusione.  
6. Non creare tabelle membership Org.  
7. Non modificare migration Eventi/Servizi/Contenuti/Opportunità/Appartenenze/MI.  
8. Non introdurre Storage, FEV, grafo Org–Org, organigrammi.  
9. Non riusare `profiles.organization_type` come catalogo autorevole.  
10. RLS deny-by-default coerente coi domini chiusi (decisione di forma fisica, non di questo Logical).

---

## 46. Criteri di accettazione

Logical accettabile se: AR non ambigua; Org ≠ Impresa ≠ Appartenenza; ownership chiara; tipologies chiuse; ciclo 1 anagrafico sufficiente; confini domini chiusi rispettati; nessuna anticipazione Identità/CRM/HR; PDS trattato come sketch; sufficiente al Physical senza nuove decisioni semantiche sostanziali.

---

## 47. Stato finale

**Logical Organizzazioni chiuso per il passaggio al Physical del ciclo 1**, con Aggregate Root unico **Organizzazione**, tipologies a catalogo, ownership di scheda Persona\|Impresa\|Redazione, lifecycle a assi separati, sede e referenti minimali, link facoltativo a Impresa, membership e grafo rinviate ad Appartenenze/fasi successive, e confini espliciti verso tutti i domini già pubblicati e verso Identità & Accessi.

Physical, Migration Plan e SQL restano fasi successive.
