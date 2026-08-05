# Logical Data Model — Dominio CONTENUTI

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, CMS, componenti dell’interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md) (**sketch funzionale storico**, non contratto implicito), [`docs/architecture/logical/reconciliation-report.md`](./reconciliation-report.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md), [`docs/architecture/logical/contenuti-editoriali.md`](./contenuti-editoriali.md) (**predecessore specialistico**; questo documento ne consolida le decisioni per il ciclo 1 e supersede le parti non Physical-ready), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/opportunita.md`](./opportunita.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/logical/servizi.md`](./servizi.md), [`docs/architecture/logical/eventi.md`](./eventi.md).
> Scopo del documento: definire il modello logico **autoritativo** del dominio Contenuti (Contenuti editoriali) — già anticipato in `domain-model.md` §1–§2 come dominio di Supporto e riconciliato in `reconciliation-report.md` — in modo sufficiente a consentire, in fasi successive, Physical mapping e Migration Plan **senza nuove decisioni semantiche sostanziali**.
> Autorità delle fonti. Vincolanti: Domain Model (decisioni 9, 18, 21; ownership Contenuto/Versione/Traduzione; Storia personale vs Storia di Impresa), Reconciliation, Dependency Map D30–D37, Logical Persone (Decisione 4), Imprese, Eventi, Servizi, Opportunità. PDS §§17–19 = input storico non autoritativo. Ogni scelta non già vincolata è marcata come **decisione di questo Logical**.
> Carattere del documento. Esclusivamente logico e di dominio: nessuna decisione tecnica, nessuna implementazione, nessuna anticipazione di database, API, CMS o Storage.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Nome ufficiale del dominio | **Contenuti** (sinonimo normativo: **Contenuti editoriali**) |
| Artefatto | Logical Data Model |
| Stato | **Ciclo 1 chiuso** — M1–M5 completati; M6 assente; M7 assente; M8.1 SKIP; M8.2 ACCETTATA |
| Ciclo di riferimento | Ciclo 1 — perimetro minimo implementabile (§39) |
| Physical / Migration Plan / SQL / M8.2 | Completati; report `docs/architecture/migrations/contenuti-validation-report.md` |
| Revisione | Consolidamento autoritativo post-chiusura Eventi; chiude AR, ownership, ciclo 1 e confini adiacenti |
| Predecessore | `logical/contenuti-editoriali.md` (fondativo; non cancellato; questo file è l’autorità per Physical ciclo 1) |

---

## 2. Scopo

Definire cosa rappresenta il dominio Contenuti nella piattaforma ImmigratiImprenditori: **rappresentazioni narrative e informative** (notizie, guide, storie di Impresa, presentazioni e approfondimenti) che **raccontano** fatti di altri domini **senza mai costituirli né modificarli**, distinte da:

- i fatti economici e professionali (Persona, Impresa, Professionista, Opportunità, Evento, OffertaDiServizio, Mercato);
- i prodotti analitici dell’Osservatorio (Rapporto, Dossier, Indicatore);
- la StoriaPersonale (ancorata a Persone);
- MediaImpresa (ancorata a Imprese);
- CMS generico, page builder, media library, Storage, commenti, SEO avanzata, marketplace editoriale.

---

## 3. Fonti normative interne

| Fonte | Ruolo rispetto a questo documento |
|---|---|
| `domain-model.md` §1–§3, §9, §12 (decisioni 9, 18, 21) | Supporting; Contenuto ≠ Fatto; AR Contenuto editoriale; Storia personale vs Storia di Impresa |
| `reconciliation-report.md` §3.1, §6, §14, §18 | Inventario CE; nessuna contraddizione ownership; priorità Physical dopo Eventi |
| `domain-dependency-map.md` D30–D37, §11 | CE → soggetti/fatti narrati; CE non possiede i fatti |
| `logical/contenuti-editoriali.md` | Modello specialistico completo (tipologie, ruoli, fonti, sei assi); base semantica da consolidare |
| `logical/persone.md` Decisione 4 | StoriaPersonale resta in Persone; non unificare Storia+Notizia+Guida in un’unica AR “generica” che assorba Persone |
| `logical/imprese.md` §1, §5 | StorieImpresa possedute da Contenuti; Presentazione estesa ≠ StoriaImpresa; MediaImpresa ≠ CMS |
| `logical/eventi.md` §1, §30 | Articoli/guide/CMS/media → Contenuti; scheda Evento ≠ articolo |
| `logical/servizi.md` §23–§24 | Descrizione scheda ≠ Contenuto; CE può narrare Offerta/Richiesta |
| `logical/opportunita.md` | Articolo/guida ≠ Opportunità; notizia ≠ misura/bando |
| `logical/mercati-internazionali.md` §1 | Guide/report su Mercato → Contenuti (o Osservatorio), non MI |
| `logical/osservatorio.md` | Analisi ≠ narrazione; CE può divulgare senza possedere indicatori |
| `platform-data-specification.md` §§17–19 | Sketch Notizia/Guida/ContenutoDiMercato — **non** contratto |
| SQL correlati | `personal_stories` (Persone); `business_media` (Imprese). **Nessuna** tabella articoli/guide CMS |

---

## 4. Glossario

| Termine | Significato in questo dominio | Non confondere con |
|---|---|---|
| **Contenuto** | Aggregate root: unità redazionale informativa/narrativa con identità propria | Fatto di dominio descritto; prodotto Osservatorio; messaggio privato |
| **TipologiaEditoriale** | Classificazione della finalità principale (notizia, guida, storia impresa, …) | Aggregate root distinta; categoria di Servizio/Evento/Opportunità |
| **Pubblicazione** | Asse di stato del Contenuto (rilascio al pubblico) | Entità autonoma; pubblicazione di un Evento/Offerta |
| **VersioneContenuto** | Stato storicizzato del testo (concetto pieno nel predecessore; **rinviato** come motore nel ciclo 1) | EdizioneEvento; Traduzione |
| **Traduzione** | Variante linguistica del Contenuto (**rinviata** come entità owned nel ciclo 1) | Servizio linguistico Professionisti |
| **Autore** | Ruolo di produzione del testo | Titolare/proprietario del Contenuto; Account |
| **ResponsabileEditoriale** | Ruolo di responsabilità ultima della pubblicazione | Autore; moderatore Identità |
| **SoggettoDescritto** | Persona/Impresa/Professionista di cui il Contenuto parla | Titolare del Contenuto |
| **OggettoDescritto** | Fatto di dominio (Evento, Opportunità, Offerta, Mercato, …) di cui il Contenuto parla | Il fatto stesso |
| **StoriaPersonale** | Narrazione autobiografica | Owned da **Persone**; CE solo distribuzione/classificazione |
| **StoriaImpresa** | Narrazione editoriale sull’Impresa | Owned da **Contenuti**; Impresa = soggetto narrato |
| **Fonte** | Attribuzione di provenienza di un’affermazione | Archivio documentale; Storage; FEV Professionisti |
| **Corpo** | Testo principale del Contenuto | Page builder; blocco JSON; MediaImpresa |

---

## 5. Responsabilità del dominio

**Cosa rappresenta.** Produzione, organizzazione, responsabilità, pubblicazione e conservazione di **contenuti informativi e narrativi** della piattaforma: notizie, guide, approfondimenti, interviste, storie di Impresa, presentazioni di fatti di dominio e pagine informative, sempre come **rappresentazione**.

**Quali problemi risolve.**
- Distinguere sempre rappresentazione e fatto (Domain Model §9).
- Pubblicare e trovare contenuti con tipologia, lingua, temi e collegamenti ai soggetti/fatti narrati.
- Separare ownership del Contenuto, autorialità e responsabilità editoriale.
- Separare redazione, pubblicazione, visibilità e archiviazione.
- Non duplicare schede di Servizi, Eventi, Opportunità, Professionisti, Imprese, Mercati.

**Cosa rientra nel dominio.** Contenuto (AR); TipologiaEditoriale; ruoli Autore/Curatore/Responsabile come associazioni; classificazione tematica/tag; collegamenti a soggetti/oggetti descritti; testo (titolo/sintesi/corpo); lifecycle editoriale e di pubblicazione; StoriaImpresa come tipologia.

**Cosa NON rientra nel dominio.**
- Fatti di Persone, Imprese, Professionisti, Opportunità, Eventi, Servizi, Mercati, Collaborazioni, Appartenenze → rispettivi domini.
- StoriaPersonale (processo e ownership) → **Persone**.
- MediaImpresa, Presentazione estesa Impresa → **Imprese**.
- Rapporto/Dossier/Indicatore → **Osservatorio**.
- Organizzazioni come soggetti modellati → dominio futuro.
- Account, ruoli applicativi, moderazione tecnica, RLS → **Identità & Accessi**.
- CMS/page builder, Storage, media library, commenti, reazioni, analytics, SEO avanzata, pubblicità commerciale come sistema.
- Messaggistica e notifiche (consumo esterno degli eventi di dominio).

**Quali domini utilizza.** Persone, Imprese (titolare/autore/soggetto); Appartenenze (utilizzo “a nome di”); Professionisti, Eventi, Opportunità, Servizi, Mercati Internazionali, Collaborazioni, Osservatorio (riferimenti narrativi facoltativi); catalogo lingue condiviso.

**Quali domini utilizzano Contenuti.** Ricerca, Notifiche, Osservatorio (consumo); Persone (distribuzione StoriaPersonale); Imprese (riferimento a StorieImpresa); Eventi/Servizi/Opportunità/MI come soggetti narrati senza ownership del Contenuto.

---

## 6. Aggregate root

### Decisione AR (opzione A)

| Opzione | Esito | Motivazione |
|---|---|---|
| **A. `Contenuto` unico con Tipologie** | **Adottata** | Domain Model §3; Reconciliation §3.1; `contenuti-editoriali.md` §2; tipologies come classificazione, non AR |
| B. AR distinte Articolo/Guida/Pagina/Notizia | **Scartata** | Duplicazione senza necessità; PDS stessa tratta Guida come specializzazione; tipology sufficiente |
| C. `Pubblicazione` come AR | **Scartata** | La pubblicazione è un **asse di stato** del Contenuto, non un’entità autonoma |
| D. Unificare StoriaPersonale + Notizia + Guida | **Scartata** | Persone Decisione 4 |

### Definizione AR — Contenuto

| Aspetto | Definizione |
|---|---|
| Identità concettuale | Unità redazionale stabile, indipendente dalle successive modifiche di testo e dallo stato di pubblicazione |
| Responsabilità | Titolo, sintesi, corpo, tipologia, lingua, ownership, assi redazione/pubblicazione/visibilità/archiviazione, collegamenti narrativi |
| Ownership | Esattamente uno tra: Persona; Impresa; **Redazione di piattaforma** (soggetto redazionale senza scheda Organizzazione) |
| Lifecycle | Assi separati: redazione, pubblicazione, visibilità, archiviazione (§12) |
| Invarianti | Responsabilità editoriale identificabile; non modifica i fatti descritti; tipology principale obbligatoria; corpo non vuoto quando pubblicato |
| Cardinalità | 1 Contenuto : 0..N Autori; 0..N Soggetti/Oggetti descritti; 0..N tag; 0..1 categoria primaria |
| Dati owned | Identità, testi, tipology, stati, date pubblicazione/ritiro/archivio, collegamenti e ruoli come associazioni owned |
| Dati referenced | Persona, Impresa, Professionista, Evento, Opportunità, OffertaDiServizio/RichiestaDiServizio, Mercato, Collaborazione, (futuro) prodotto Osservatorio |
| Dati derivati | Excerpt, tempo di lettura stimato, URL pubblico, conteggi — non verità owned |
| Relazioni ammesse | Narrare / presentare / approfondire fatti di altri domini |
| Relazioni vietate | Incorporare o aggiornare anagrafiche, scadenze, iscrizioni, prezzi, stati sostanziali altrui |
| Esclusioni | Ticketing, Storage, commenti, versioning engine ciclo 1, traduzioni owned ciclo 1 |

**Carve-out StoriaPersonale.** Non è un’istanza owned di questa AR. Può essere trattata come tipologia ai fini di ricerca/distribuzione, ma il processo resta in Persone.

---

## 7. Entità e classificazione

| Entità / concetto | Classificazione ciclo 1 | Note |
|---|---|---|
| Contenuto | **Aggregate root** | Incluso |
| TipologiaEditoriale | **Catalogo** | Incluso |
| Autore / Coautore / Curatore / ResponsabileEditoriale | **Associazione / ruolo** owned | Incluso (sottoinsieme ruoli) |
| SoggettoDescritto / OggettoDescritto | **Associazione** owned | Incluso |
| CategoriaContenuto | **Catalogo** proprio leggero | Incluso |
| Tag | **Catalogo** o etichetta controllata | Incluso (non libero illimitato) |
| Titolo / Sintesi / Corpo | **Value object** / componenti | Inclusi; corpo = testo unico |
| Sezione / BloccoContenuto | — | **Fuori ciclo 1** (no page builder) |
| VersioneContenuto | Entità dipendente (predecessore) | **Rinviata** come motore |
| Traduzione | Entità dipendente (predecessore) | **Rinviata** |
| Fonte / Citazione / Evidenza | Entità dipendente (predecessore) | **Rinviate** come modello FEV; ammessi riferimenti descrittivi opachi |
| Allegato / Immagine / Video / Documento | — | **Fuori ciclo 1** salvo URL/cover opachi descrittivi |
| Pubblicazione | Asse, non entità | Inclusa come stato |
| ContenutoCorrelato / InEvidenza | Associazione / flag | Correlato rinviabile; featured semplice ammesso |
| Commento / Reazione | — | **Fuori perimetro** |
| FEV / Moderazione | — | **Fuori ciclo 1** / Identità |
| PaginaInformativa / Articolo / Notizia / Guida / Approfondimento | Tipologie | Non AR distinte |
| Serie editoriale | — | **Rinviata** |
| Revisore / Fact-checker | Ruoli | **Rinviati** (workflow multiutente) |

---

## 8. Ownership

| Aspetto | Decisione ciclo 1 |
|---|---|
| Titolare del Contenuto | Esattamente uno: **Persona** XOR **Impresa** XOR **Redazione piattaforma** |
| Redazione piattaforma | Soggetto redazionale interno, **senza** FK obbligatoria a Organizzazioni |
| Autore | Ruolo distinto dal titolare; 0..N; ordine e flag “principale” ammessi |
| Autore esterno | Etichetta opaca (nome) ammessa, senza scheda Organizzazione |
| “A nome di” | Contesto dichiarativo; rappresentanza via Appartenenze (utilizzo, non ownership CE) |
| StoriaImpresa | Owned da Contenuti; Impresa = SoggettoDescritto |
| StoriaPersonale | Owned da Persone |
| Organizzazioni | Non titolare obbligatorio; non modellate |

---

## 9. Contenuto

Elementi minimi di un Contenuto:

1. Identità stabile  
2. Tipologia editoriale principale  
3. Titolo  
4. Corpo informativo (anche breve)  
5. Lingua principale  
6. Titolare (Persona | Impresa | Redazione)  
7. Responsabilità editoriale identificabile (titolare redazione e/o ruolo Responsabile)  
8. Stato di redazione  
9. Stato di pubblicazione  
10. Visibilità  

Un materiale senza questi elementi non è un Contenuto di dominio (resta nota interna o comunicazione).

---

## 10. Tipologie editoriali

Catalogo chiuso di **finalità principale** (un Contenuto ha una tipology principale; classificazioni secondarie ammesse come tag/categoria, non come seconda AR).

| Tipologia ciclo 1 | Inclusa | Note |
|---|---|---|
| `news` — Notizia | Sì | Attualità |
| `guide` — Guida | Sì | Approfondimento pratico/normativo |
| `insight` — Approfondimento | Sì | Analisi/editoriale leggero |
| `interview` — Intervista | Sì | Voce/testimonianza |
| `business_story` — Storia di Impresa | Sì | Owned CE; soggetto Impresa |
| `event_presentation` — Presentazione Evento | Sì | Narrazione ≠ scheda Evento |
| `opportunity_presentation` — Presentazione Opportunità | Sì | Narrazione ≠ scheda Opportunità |
| `service_presentation` — Presentazione Servizio | Sì | Narrazione ≠ Offerta/Richiesta |
| `market_content` — Contenuto su Mercato | Sì | Contesto MI; ≠ Presenza/Interesse |
| `institutional_page` — Pagina informativa | Sì | Contenuto stabile istituzionale |
| `personal_story` — Storia personale | Solo classificazione | Ownership **Persone** |
| Comunicato / FAQ / Dossier / Reportage / Glossario | Rinviate o come tipology future | Non obbligatorie ciclo 1 |
| Contenuto sponsorizzato / promozionale | Dichiarabile come tipology/flag futuro | Trasparenza; no ad-ops ciclo 1 |

**Decisione.** Tipologie = catalogo, non tabelle-AR verticali.

---

## 11. Pubblicazione

| Aspetto | Decisione |
|---|---|
| Esistenza vs pubblicazione | Distinte: un Contenuto esiste in bozza senza essere pubblicato |
| Forma | **Asse di stato**, non entità |
| Valori ciclo 1 | `unpublished` \| `published` \| `withdrawn` |
| Date | `published_at` quando published; `withdrawn_at` quando withdrawn |
| Ripubblicazione | Ammessa (da withdrawn/unpublished a published) con nuove date |
| Programmazione | **Esclusa** dal ciclo 1 (no scheduling complesso) |
| Gate | Published ⇒ redazione `ready` e `published_at` valorizzato |
| Invariante | Published ⇒ corpo e titolo non blank; responsabilità editoriale presente |

---

## 12. Lifecycle

Assi separati (pattern Eventi/Servizi). Il modello a sei assi del predecessore resta **valido come visione completa**; il ciclo 1 ne implementa un sottoinsieme.

| Asse | Valori ciclo 1 | Note |
|---|---|---|
| Redazione | `draft` \| `ready` | Workflow `in_review` / `approved` / `rejected` **rinviato** |
| Pubblicazione | `unpublished` \| `published` \| `withdrawn` | Vedi §11 |
| Visibilità | `private` \| `public` | Vedi §13 |
| Archiviazione | `archived_at` nullable | NULL = corrente |
| Verifica / FEV | — | **Rinviata** |
| Contestazione legale | — | **Rinviata** (ritiro sufficiente nel ciclo 1) |

---

## 13. Visibilità

Ciclo 1: `private` \| `public`.

Esclusi dal ciclo 1 (predecessore §12): embargo, rete, destinatari selezionati, non indicizzato, visibilità differenziata fonti/note. Restano decisioni future / Identità.

Visibilità ≠ permesso tecnico (Identità & Accessi).

---

## 14. Autori

| Aspetto | Decisione |
|---|---|
| Natura | Ruolo associato al Contenuto |
| Soggetti ammessi | Persona; Professionista (facoltativo); Impresa; etichetta opaca esterna |
| Cardinalità | 0..N; al più un “autore principale” |
| Ordinamento | `sort_order` ammesso |
| XOR | Non entrambi Persona e Impresa sullo stesso ruolo-riga; label può coesistere con uno dei due |
| Distinzione | Autore ≠ titolare; Autore ≠ ResponsabileEditoriale |

---

## 15. Curatori ed editori

| Ruolo ciclo 1 | Incluso | Note |
|---|---|---|
| Curatore | Facoltativo | Organizza senza necessariamente scrivere |
| ResponsabileEditoriale | Obbligatorio in senso logico | Può coincidere con titolare Redazione o Persona redazionale |
| Revisore / Fact-checker / Approver | No | Workflow multiutente rinviato |
| Editore organizzativo | No | Dominio Organizzazioni futuro; etichetta opaca ammessa |

---

## 16. Testo e struttura

| Elemento | Ciclo 1 |
|---|---|
| Titolo | Obbligatorio, non blank |
| Sottotitolo / Sintesi (abstract) | Facoltativo |
| Corpo | **Testo editoriale unico** (plain/Markdown concettuale) |
| Sezioni / blocchi / callout strutturati | **Esclusi** come modello owned |
| Indice / FAQ strutturali | Esclusi o testo nel corpo |
| JSONB / page builder | **Vietati** come scorciatoia concettuale |

**Decisione.** Il ciclo 1 non introduce un sistema di blocchi. Un’eventuale infrastruttura CMS a blocchi è rinvio esplicito.

---

## 17. Categorie

- Catalogo proprio leggero `CategoriaContenuto` (temi editoriali di alto livello).
- **Non** duplicare `business_sectors`, `professional_categories`, `service_categories`, `event_types`, tipologhe Opportunità.
- Gerarchia categorie: **fuori ciclo 1** (lista piatta).
- Categoria primaria: al più una per Contenuto.

---

## 18. Tag

- Tag **controllati** (catalogo o vocabolario chiuso gestito), non tag liberi illimitati.
- Cardinalità 0..N.
- Distinti da settori/mercati strutturati (che restano collegamenti tipizzati quando servono).

---

## 19. Lingue

- Ogni Contenuto ha **una lingua principale** (catalogo `languages` concettuale).
- Ciclo 1: **una sola lingua** per Contenuto.
- Multilingue completo: rinviato (§20).

---

## 20. Traduzioni

| Aspetto | Ciclo 1 |
|---|---|
| Traduzione come entità owned | **Esclusa** |
| Contenuti autonomi per lingua | Non adottati come modello primario |
| Fallback / stato traduzione | Rinviate |
| Principio futuro (predecessore) | Traduzione distinguibile; automatica dichiarata; servizi linguistici accessori |

---

## 21. Versioni e revisioni

| Aspetto | Ciclo 1 |
|---|---|
| Motore versioni storiche | **Escluso** |
| Bozze multiple parallele | Escluse |
| Aggiornamento corrente | Il testo corrente si aggiorna; storico pieno rinviato |
| Rettifica con conservazione versione | Visione predecessore; **rinviata** come enforcement |
| Audit log | Non introdotto |

---

## 22. Media e allegati

| Aspetto | Ciclo 1 |
|---|---|
| Storage / bucket / MIME / hash | **Esclusi** |
| Media library / gallerie / video owned | Esclusi |
| Cover / immagine | Solo **riferimento descrittivo opaco** (URL/etichetta) facoltativo |
| Allegati PDF / documenti scaricabili | Esclusi |
| Locandine / registrazioni Evento | Custodianship futura; Eventi non le gestisce come CMS; CE non introduce Storage |
| MediaImpresa | Resta in Imprese |

---

## 23. SEO e indicizzazione

| Elemento | Ciclo 1 |
|---|---|
| Slug | Ammesso come dato editoriale owned |
| title/description SEO avanzati | Rinviate |
| Canonical / sitemap / robots | Infrastruttura web; fuori dominio |
| Featured / pinning semplice | Flag editoriale ammesso |
| Analytics / ranking | Fuori |

---

## 24. Fonti e citazioni

Ciclo 1: **riferimenti descrittivi opachi** (etichetta/URL di fonte) facoltativi.

Esclusi: modello Fonte/Evidenza/Attribuzione completo, scoring affidabilità, fact-checking processuale, importazione FEV Professionisti.

Principio invariante (sempre valido): dichiarazione riportata ≠ fatto verificato del dominio narrato.

---

## 25. Contenuti correlati

- Collegamento facoltativo Contenuto↔Contenuto (correlati) **rinviabile** al Physical se non essenziale.
- Serie editoriali: rinviate.
- Featured: flag sul Contenuto, non entità separata obbligatoria.

---

## 26. Relazioni con Servizi

| Aspetto | Regola |
|---|---|
| Natura | Narrazione / presentazione di Offerta o Richiesta |
| Ownership | Contenuto owned da CE; Offerta/Richiesta restano Servizi |
| Cardinalità | 0..N collegamenti facoltativi |
| Divieto | Non duplicare condizioni economiche, copertura, stati di disponibilità |
| Tipology tipica | `service_presentation` |

---

## 27. Relazioni con Eventi

| Aspetto | Regola |
|---|---|
| Natura | Promozione, resoconto, materiali narrativi |
| Scheda Evento vs articolo | Distinte: data/luogo/iscrizione/programma restano Eventi |
| Cardinalità | 0..N collegamenti facoltativi |
| Divieto | Non duplicare iscrizioni, capienza, occurrence status |
| Tipology tipica | `event_presentation` |
| Media evento | Non Storage CE ciclo 1 |

---

## 28. Relazioni con Opportunità

| Aspetto | Regola |
|---|---|
| Natura | Articolo/guida informativa; presentazione bando/call |
| Divieto | Non duplicare scadenze, requisiti, stato sostanziale, candidature |
| Tipology tipica | `opportunity_presentation` |

---

## 29. Relazioni con Professionisti

| Aspetto | Regola |
|---|---|
| Natura | Soggetto narrato; Autore/relatore intervistato; profilo come contesto |
| Divieto | Non duplicare qualifiche, FEV, ServizioProfessionale |
| D32 | Riferimento outbound; consolidamento Dependency Map in fase Physical |

---

## 30. Relazioni con Imprese

| Aspetto | Regola |
|---|---|
| Natura | Titolare; Autore; SoggettoDescritto; StoriaImpresa |
| StoriaImpresa | Owned CE |
| Presentazione estesa / MediaImpresa | Restano Imprese |
| Divieto | Non modificare stato sostanziale/verifica Impresa |

---

## 31. Relazioni con Mercati Internazionali

| Aspetto | Regola |
|---|---|
| Natura | Contesto / soggetto di guide e notizie di mercato |
| Tipology tipica | `market_content` |
| Divieto | Non duplicare PresenzaDiMercato, Interesse, Attività internazionale |
| ContenutoDiMercato PDS | Assorbito come tipology + riferimento Mercato, non AR separata |

---

## 32. Relazioni con Organizzazioni

- Dominio **successivo**: nessuna ownership obbligatoria.
- Editore/sponsor/partner organizzativi: etichette opache o rinvio.
- Nessuna FK concettuale necessaria al ciclo 1.

---

## 33. Relazioni con Identità & Accessi

Contenuti **non** introduce: account, utenti, ruoli editoriali applicativi, permessi, moderatori, workflow autorizzativi, RLS, `auth.users` come owner, audit accessi, firme.

Descrive solo fatti di visibilità sostanziale (`private`/`public`) che Identità applicherà in futuro.

Chiusura Account ≠ ritiro automatico Contenuti (coerente con Identità): decisione operativa futura.

---

## 34. Commenti, reazioni e interazioni

**Esclusi** dal dominio e dal ciclo 1: commenti, like, rating, condivisioni, segnalazioni community, discussioni, moderazione community.

---

## 35. FEV e verifica editoriale

- Nessun FEV multi-asse importato da Professionisti.
- Nessun badge generico “contenuto verificato”.
- Verifica per-fonte e fact-checking: **rinviati**.
- Ciclo 1: trasparenza dichiarativa (tipology, autore, riferimenti opachi).

---

## 36. Invarianti

1. Ogni Contenuto ha responsabilità editoriale identificabile.  
2. Il Contenuto non coincide con il fatto descritto e non lo modifica.  
3. Pubblicare un Contenuto non verifica il soggetto/oggetto narrato.  
4. Dichiarazione riportata ≠ fatto accertato.  
5. Titolare = esattamente uno tra Persona, Impresa, Redazione.  
6. Tipologia principale obbligatoria.  
7. Published ⇒ ready + published_at + titolo/corpo non blank.  
8. StoriaPersonale non è owned da Contenuti.  
9. StoriaImpresa è owned da Contenuti.  
10. Nessuna anticipazione Organizzazioni/Identità come ownership.  
11. Nessun CMS a blocchi / Storage / commenti nel ciclo 1.  
12. Visibilità ≠ permesso tecnico.  

---

## 37. Dati derivati

| Dato | Natura |
|---|---|
| Excerpt automatico | Derivabile dal corpo |
| Tempo di lettura stimato | Derivabile |
| URL pubblico | Infrastruttura / proiezione |
| Conteggio visualizzazioni / analytics | **Fuori** |
| Numero collegamenti | Derivabile |
| Completezza redazionale | Criterio applicativo |
| Contenuti correlati automatici | Applicativo / rinviato |

---

## 38. Dati vietati

- Page builder, blocchi JSON come modello, CMS completo  
- Storage, MIME, hash, signed URL, bucket  
- Commenti, reazioni, rating, community moderation  
- Versioning engine e audit log ciclo 1  
- Traduzioni owned ciclo 1  
- Scheduling avanzato / embargo  
- SEO engine completo  
- Copia di scadenze/requisiti/iscrizioni/prezzi da altri domini  
- Organizzazione come titolare obbligatorio  
- `auth.users` come owner  
- Policy RLS / ruoli applicativi  
- Marketplace/pubblicità come sistema commerciale  
- Assorbimento `personal_stories` / `business_media` come tabelle CE  

---

## 39. Perimetro ciclo 1

**Obiettivo minimo.** Consentire la creazione, classificazione e pubblicazione di **Contenuti** informativi/narrativi con tipology, lingua, ownership Persona|Impresa|Redazione, autori, collegamenti facoltativi ai fatti narrati, senza CMS/Storage/versioning/traduzioni.

**Incluse.**
- AR Contenuto  
- Catalogo TipologiaEditoriale (seed normativo delle tipologies §10)  
- Catalogo CategoriaContenuto (leggero) e Tag controllati  
- Ruoli Autore/Curatore/Responsabile (associazioni)  
- Collegamenti SoggettoDescritto / OggettoDescritto  
- Testo: titolo, sintesi, corpo unico  
- Assi: redazione draft/ready; pubblicazione unpublished/published/withdrawn; visibilità private/public; archiviazione  
- Slug e flag featured semplici  
- Cover/URL opachi facoltativi  
- StoriaImpresa come tipology  

**Escluse.**
- Versioni storiche, traduzioni owned, sezioni/blocchi  
- Fonti/FEV/citazioni strutturate  
- Media/allegati/Storage  
- Commenti/reazioni  
- Scheduling/embargo  
- Workflow in_review/approved/rejected  
- Serie editoriali  
- Organizzazioni, Identità  
- Assorbimento StoriaPersonale  

**Dipendenze ammesse per il futuro Physical.** Persone, Imprese, languages; facoltativi: Professionisti, Eventi, Opportunità, service_offers/service_requests, international_markets; Appartenenze solo utilizzo.

**Criteri di completamento.** Questo documento chiude le decisioni semantiche necessarie al Physical del ciclo 1 (§45–§46).

---

## 40. Fuori perimetro (sintesi)

CMS; page builder; Storage; media library; commenti; analytics; SEO avanzata; versioning; traduzioni; FEV; Organizzazioni; Identità; Osservatorio come ownership; StoriaPersonale; MediaImpresa; marketplace editoriale; Formazione didattica.

---

## 41. Dipendenze

| Direzione | Dipendenza | Natura |
|---|---|---|
| Contenuti → Persone | Titolare / Autore / Soggetto | Necessaria quando Persona |
| Contenuti → Imprese | Titolare / Autore / Soggetto / StoriaImpresa | Necessaria quando Impresa |
| Contenuti → Appartenenze | “A nome di” | Utilizzo futuro |
| Contenuti → Professionisti | Autore / Soggetto | Facoltativa (D32) |
| Contenuti → Eventi | OggettoDescritto | Facoltativa (D36) |
| Contenuti → Opportunità | OggettoDescritto | Facoltativa (D34) |
| Contenuti → Servizi | OggettoDescritto | Facoltativa (nuova rispetto a D-map; non ciclica) |
| Contenuti → Mercati Internazionali | Contesto | Facoltativa (D33) |
| Contenuti → Collaborazioni | Contesto | Facoltativa (D35); non prioritaria ciclo 1 |
| Contenuti → Osservatorio | Fonte/divulgazione | Facoltativa (D37); non ownership |
| Contenuti → Organizzazioni / Identità | — | Non anticipate |
| Altri → Contenuti | Ricerca, Notifiche, Osservatorio | Consumo |

Grafo aciclico rispetto ai fatti narrati: CE referenzia, non è referenziato come fatto economico.

---

## 42. Eventi di dominio

Fatti accaduti (non audit SQL), ciclo 1:

- **ContenutoCreato** (anche in bozza)  
- **ContenutoAggiornato**  
- **ContenutoPronto** (redazione ready)  
- **ContenutoPubblicato**  
- **ContenutoRitirato**  
- **ContenutoRipubblicato**  
- **ContenutoArchiviato**  
- **AutoreAssociato** / **ResponsabileEditorialeAssociato**  
- **SoggettoDescrittoAssociato** / **OggettoDescrittoAssociato**  

Eventi di revisione, traduzione, fonte, contestazione, embargo: **rinviabili** (visione predecessore §14).

---

## 43. Questioni risolte

1. Dominio autonomo Supporting: rappresentazione ≠ fatto.  
2. AR unica **Contenuto** + Tipologie (opzione A).  
3. Pubblicazione = asse, non AR.  
4. Ownership: Persona XOR Impresa XOR Redazione.  
5. Autore ≠ titolare.  
6. StoriaPersonale = Persone; StoriaImpresa = Contenuti.  
7. Tipologie = catalogo, non AR multiple.  
8. Ciclo 1: testo unico; no page builder/JSONB.  
9. Ciclo 1: no versioning engine; no traduzioni owned; no Storage.  
10. Lifecycle slim allineato a Eventi/Servizi; sei assi del predecessore restano visione futura.  
11. Confini Servizi/Eventi/Opportunità/Professionisti/Imprese/MI chiusi.  
12. Organizzazioni e Identità non anticipate.  
13. Commenti/reazioni esclusi.  
14. PDS non contratto.  
15. `contenuti.md` è autorità Physical; `contenuti-editoriali.md` resta predecessore.  

---

## 44. Decisioni rinviate

1. Motore VersioneContenuto e rettifiche storicizzate.  
2. Traduzioni owned / multilingue.  
3. Workflow in_review / approved / rejected / revisori.  
4. Fonti/Evidenze/Attribuzioni e fact-checking.  
5. Contestazione, diritto di replica, anonimizzazione.  
6. Sezioni/blocchi CMS.  
7. Media/allegati/Storage.  
8. Scheduling/embargo/visibilità avanzate.  
9. Serie editoriali e correlati avanzati.  
10. Consolidamento formale D32–D37 (+ CE→Servizi) in Dependency Map.  
11. Editore Organizzazione.  
12. Policy Identità e ruoli editoriali applicativi.  
13. Commenti futuri.  
14. Integrazione Osservatorio oltre riferimento facoltativo.  

Non bloccano il Physical ciclo 1.

---

## 45. Criteri per il Physical

Il Physical dovrà:

1. Mappare AR `Contenuto` in una tabella radice unica.  
2. Realizzare TipologiaEditoriale come catalogo C03 con seed tipologies ciclo 1.  
3. Realizzare ownership XOR Persona/Impresa e forma redazione senza Organizzazioni.  
4. Realizzare ruoli Autore/Curatore/Responsabile con FK reali o label opache (no polimorfismo `entity_type`/`entity_id`).  
5. Realizzare collegamenti tipizzati a soggetti/oggetti (FK reali ai domini già chiusi).  
6. Realizzare assi redazione/pubblicazione/visibilità/archiviazione come nel §12.  
7. Non introdurre versioni, traduzioni, Storage, policy, GRANT, JSONB modellante.  
8. Non assorbire `personal_stories` né `business_media`.  
9. Documentare invarianti applicative non DDL-garantibili.  
10. Una tabella per responsabilità chiara; ordine di creazione aciclico.  

---

## 46. Criteri di accettazione

Logical accettabile se: AR non ambigua; contenuto≠pubblicazione≠documento; ownership chiara; tipologies non duplicate in AR; confini Servizi/Eventi/Opportunità chiusi; StoriaPersonale/StoriaImpresa corrette; nessun CMS/Storage/Identità/Organizzazioni anticipate; ciclo 1 sufficiente al Physical senza nuove decisioni semantiche sostanziali.

---

## 47. Stato finale

**Logical Contenuti — ciclo 1 chiuso.**

Aggregate Root unico **Contenuto**, tipologie a catalogo, ownership Persona|Impresa|Redazione, lifecycle slim, testo unico, collegamenti narrativi facoltativi ai domini chiusi, e confini espliciti verso StoriaPersonale, MediaImpresa, Osservatorio, Organizzazioni, Identità, CMS e Storage.

Stato operativo: **M1–M5 completati**; **M6 assente**; **M7 assente**; **M8.1 SKIP**; **M8.2 ACCETTATA**.

Report: `docs/architecture/migrations/contenuti-validation-report.md`.
