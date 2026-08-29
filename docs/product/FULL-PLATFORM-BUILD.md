# Immigrati Imprenditori — Full Platform Build

Stato: **PROGRAMMA VINCOLANTE DI SVILUPPO**  
Obiettivo: costruire ImmigratiImprenditori.it come Centro Studi, Osservatorio, archivio scientifico, atlante, piattaforma dati, archivio di storie e rete di ricerca internazionale.

## Regola di pubblicazione

Una funzione viene resa visibile al pubblico solo quando è realmente utilizzabile. Il progetto può essere sviluppato integralmente sul branch di lavoro, ma il sito pubblico non mostra placeholder, moduli vuoti, pagamenti non operativi o strumenti annunciati come futuri.

## A. Core editoriale e istituzionale

- [x] Identità Centro Studi / Osservatorio / redazione
- [x] Homepage editoriale
- [x] Chi siamo
- [x] Politica editoriale e correzioni
- [x] Privacy, Cookie, Termini
- [x] Matrice contatti pubblici
- [x] Partecipa come ingresso generale
- [x] Sostieni il Centro Studi, senza pagamenti non operativi
- [x] Ricerca interna pubblica
- [x] RSS

## B. Osservatorio e dati

- [x] Indicatori pubblici
- [x] Schede indicatore con fonte e metodologia
- [x] Data Explorer iniziale
- [x] Catalogo territori presenti nei dati
- [x] Tassonomia settori
- [x] Open data JSON read-only
- [x] Catalogo fonti statistiche
- [x] Glossario metodologico
- [ ] Export CSV/XLSX del Data Explorer
- [ ] Grafici configurabili nel Data Explorer
- [ ] Confronto multi-territorio e multi-periodo
- [ ] Mappe GIS
- [ ] Dataset builder personalizzato
- [ ] API pubblica versionata e documentata
- [ ] Widget dati incorporabili

## C. Ricerca e pubblicazioni

- [x] Raccolta pubblica Ricerca
- [x] Analisi e ricerche
- [ ] Collana Rapporti del Centro Studi
- [ ] Working Papers numerati
- [ ] Policy Brief
- [ ] Dossier tematici
- [ ] Citazione APA / Chicago / BibTeX
- [ ] Versionamento delle pubblicazioni
- [ ] Registro pubblico delle correzioni
- [ ] DOI quando amministrativamente e tecnicamente attivabile

## D. Persone e storie

- [x] Raccolta Storie e voci
- [x] Interviste e testimonianze nel modello contenuti
- [x] Contributi esterni con revisione redazionale
- [x] Autori presenti nei contenuti pubblicati
- [ ] Profili autore permanenti
- [ ] ORCID / affiliazione / biografia
- [ ] Schede imprenditore e impresa quando sostenute da dati pubblicabili
- [ ] Trascrizioni audio/video
- [ ] Sottotitoli multilingua
- [ ] Podcast

## E. Geografia e rotte

- [x] Territori presenti nelle serie statistiche
- [x] Modello migration_routes nel database
- [x] Modello content_routes ed event_routes
- [ ] Atlante mondiale
- [ ] Schede Paese
- [ ] Schede regione/città
- [ ] Schede rotta origine → destinazione
- [ ] Mappe delle rotte imprenditoriali
- [ ] Confrontatore Paesi

Le pagine Paese/rotta non vengono pubblicate finché non dispongono di dati o contenuti reali sufficienti.

## F. Multilingua

Lingue piattaforma prioritarie: **IT · EN · FR · ES · DE · AR · ZH**.

- [x] Catalogo lingue database
- [x] Priorità 1–7 e direzione RTL per arabo
- [x] Configurazione canonica i18n
- [ ] Routing internazionale per lingua
- [ ] Selettore lingua
- [ ] Traduzione interfaccia
- [ ] Collegamento tra versioni tradotte dello stesso contenuto
- [ ] hreflang
- [ ] sitemap internazionale
- [ ] traduzione assistita + revisione umana
- [ ] gestione completa RTL

## G. Eventi

- [x] Eventi pubblici
- [x] Edizioni, sessioni, relatori e lingue nel modello dati
- [ ] Calendario filtrabile
- [ ] Export .ics / Google / Outlook / Apple Calendar
- [ ] Archivio materiali post-evento
- [ ] Eventi propri del Centro Studi
- [ ] Conferenza / Forum annuale quando effettivamente organizzato

## H. Radar e redazione

- [x] Inbox redazionale privata
- [x] Radar review-only
- [x] Nessuna pubblicazione automatica
- [ ] Connettori/API specifici per fonti ad alta priorità
- [ ] Alert aggiornamento dataset
- [ ] Verifica link rotti e revisioni metodologiche
- [ ] Deduplica semantica avanzata
- [ ] Suggerimento automatico di tag e geografie

## I. Ricerca e AI

- [ ] Ricerca semantica
- [ ] “Chiedi al Centro Studi” con risposte solo da fonti interne citate
- [ ] Assistente redazionale privato
- [ ] Estrazione strutturata da rapporti
- [ ] Controllo citazioni e incongruenze
- [ ] Knowledge Graph persona → impresa → Paese → settore → fonte → indicatore → evento
- [ ] Research Assistant per query e dataset

Nessuna funzione AI può pubblicare autonomamente.

## J. Newsletter e account

- [ ] Newsletter generale
- [ ] Newsletter tematiche
- [ ] Alert personalizzati
- [ ] Salvataggio ricerche
- [ ] Indicatori seguiti
- [x] Account contributore previsto dal modello
- [ ] Dashboard personale

Queste funzioni richiedono rate limiting, consenso/privacy e schema dedicato prima dell'esposizione pubblica.

## K. Ricerca primaria

- [ ] Survey del Centro Studi
- [ ] Questionari scientifici
- [ ] Panel longitudinale
- [ ] Dataset originali
- [ ] Indicatori proprietari con metodologia pubblica

Qualsiasi raccolta di dati personali richiede progettazione privacy specifica prima dell'attivazione.

## L. Distribuzione, SEO e citabilità

- [x] Sitemap dinamica
- [x] Canonical sulle sezioni principali
- [x] Open Graph / Twitter
- [x] Organization + WebSite structured data
- [x] RSS
- [ ] Dataset structured data
- [ ] Event structured data completo
- [ ] Article / Report structured data completo
- [ ] Google Dataset Search readiness
- [ ] Citazione automatica e metadati accademici
- [ ] SEO internazionale multilingua

## M. Sicurezza, qualità e accessibilità

- [x] RLS base
- [x] Header HTTP baseline
- [x] Honeypot form pubblico
- [ ] Rate limiting persistente
- [ ] Leaked Password Protection Supabase
- [ ] CSP definitiva
- [ ] hardening migration contributi applicata e verificata
- [ ] E2E ruoli e pubblicazione
- [ ] WCAG 2.2 AA finale
- [ ] audit visuale desktop/tablet/mobile
- [ ] audit log editoriale completo
- [ ] backup e restore verificati

## N. Sostenibilità e partnership

- [x] Pagina Sostieni istituzionale
- [x] Separazione sostegno / decisioni editoriali
- [ ] Donazioni solo quando amministrativamente operative
- [ ] Partnership scientifiche
- [ ] Progetti di ricerca congiunti
- [ ] Rapporti commissionati con disclosure
- [ ] Grant / bandi / fondazioni
- [ ] Research Network internazionale
- [ ] Comitato scientifico quando formalmente costituito

## O. Principio finale

L'obiettivo non è aumentare il numero di pagine, ma costruire una rete coerente di oggetti verificabili:

**dato → fonte → metodologia → territorio → settore → persona → storia → ricerca → evento → rotta**.

Il Centro Studi deve apparire completo perché le funzioni visibili sono reali, documentate e collegate; non perché mostra menu di servizi ancora vuoti.
