# Immigrati Imprenditori — Roadmap di sviluppo

Questa è la sequenza operativa canonica. Le correzioni sono ammesse, ma ogni modifica sostanziale deve aggiornare questo documento.

## Stato di avanzamento

- Fase 1 — Fondazione editoriale: **PASS**
- Fase 2 — Architettura dell'informazione: **PASS**
- Fase 3 — Tassonomie editoriali internazionali: **PASS**
- Fase 4 — Modello dati v1: **PASS**
- Fase 5 — Scrivania redazionale: **PASS**
- Fase 6 — Contribuisci: **PASS**
- Fase 7 — Storie e interviste: **IMPLEMENTED_PENDING_GATES**
- Fase 8 — Osservatorio v1: **NEXT**

## Fase 1 — Fondazione editoriale

Obiettivo: fissare identità, missione, pubblico, perimetro globale, equilibrio geografico, governance, social, partecipazione e tono.

Artefatto: `docs/editorial/EDITORIAL-PROJECT.md`.

Gate: `EDITORIAL_FOUNDATION = PASS`.

## Fase 2 — Architettura dell'informazione

Obiettivo: definire sitemap pubblica, home, sezioni, area redazione e migrazione dalle route esistenti.

Artefatto: `docs/editorial/INFORMATION-ARCHITECTURE.md`.

Gate: `INFORMATION_ARCHITECTURE = PASS`.

## Fase 3 — Tassonomie editoriali internazionali

Definire in modo stabile:

- tipi di contenuto;
- temi;
- Paesi e territori;
- Paese d'origine e destinazione;
- rotte;
- settori;
- tipi di fonte;
- tipi di evento;
- formati storie/interviste;
- stati editoriali;
- livelli di rilevanza geografica.

Gate: `EDITORIAL_TAXONOMY = PASS`.

## Fase 4 — Modello dati v1

Adeguare Supabase senza dipendenze da PonteImprese.

Oggetti target principali:

- geografia e rotte;
- contributori;
- proposte editoriali;
- Inbox redazionale;
- storie/interviste;
- rapporti/pubblicazioni;
- metadati di fonte;
- collegamenti tra contenuti, territori, rotte e settori.

Preservare contenuti, eventi e osservatorio esistenti.

Gate: `DATABASE_MODEL_V1 = PASS`.

## Fase 5 — Scrivania redazionale

Sviluppare `/app/redazione` come back-office completo:

- Inbox;
- assegnazione;
- bozze;
- revisione;
- pubblicazione;
- scarto/archivio;
- audit dello stato.

Gate: `EDITORIAL_DESK = PASS`.

## Fase 6 — Contribuisci

Flussi pubblici senza account obbligatorio:

- racconta la tua storia;
- proponi intervista;
- segnala evento;
- segnala ricerca;
- invia pubblicazione.

Account `contributore` solo per collaborazione abituale.

Gate: `CONTRIBUTION_FLOW = PASS`.

## Fase 7 — Storie e interviste

Sezione prioritaria con forte dignità editoriale e supporto a testo, immagini, video, trascrizioni, citazioni, geografia e settore.

Implementazione v1:

- `/storie` e `/storie/[slug]`;
- riuso di `contents`, senza CMS parallelo;
- tipi intervista / storia d'impresa / testimonianza / storia personale;
- origine e destinazione tramite `content_geographies`;
- settori tramite `content_sectors` e catalogo `business_sectors`;
- video/audio/documenti tramite `content_media`;
- YouTube in modalità privacy-enhanced;
- note sui diritti media visibili solo alla redazione;
- gestione geografia, settori e media dentro l'editor contenuti;
- CTA permanente verso `/contribuisci`;
- nessun contenuto fittizio inserito per riempire l'archivio.

Gate: `STORIES_INTERVIEWS = PASS` dopo CI, Vercel e smoke Production.

## Fase 8 — Osservatorio v1

Costruire un nucleo ristretto ma affidabile di indicatori con fonte, periodo, unità, territorio, metodologia e aggiornamento.

Gate: `OBSERVATORY_V1 = PASS`.

## Fase 9 — Rapporti e ricerche

Biblioteca strutturata di rapporti AIPEL, dossier, ricerche accademiche e pubblicazioni istituzionali.

Gate: `REPORTS_LIBRARY = PASS`.

## Fase 10 — Eventi

Calendario e archivio qualificato, con la stessa logica geografica dell'intero Osservatorio.

Gate: `EVENTS = PASS`.

## Fase 11 — Radar mondiale

Costruire acquisizione periodica/notturna di nuove notizie, studi, dataset, rapporti, normative ed eventi.

Regola: nessuna pubblicazione automatica. Tutto entra nella Inbox redazionale.

Gate: `NEWS_INTELLIGENCE = PASS`.

## Fase 12 — Fonti e metodologia

Registro pubblico delle fonti, metodologia, definizioni, limiti e politica delle correzioni.

Gate: `SOURCES_METHODOLOGY = PASS`.

## Fase 13 — Identità visiva

Direzione obbligatoria:

- nero su bianco;
- sobria;
- editoriale;
- istituzionale;
- tipografia forte;
- niente gradienti;
- niente palette decorative;
- colore solo funzionale.

Gate: `VISUAL_IDENTITY = PASS`.

## Fase 14 — Home definitiva

Home editoriale basata su Dati · Analisi · Voci, con invito a contribuire e forte visibilità per storie/interviste.

Gate: `HOME_V1 = PASS`.

## Fase 15 — Canali social istituzionali

Solo:

- LinkedIn;
- X/Twitter;
- YouTube.

Il sito resta fonte e archivio originale.

Gate: `SOCIAL_CHANNELS = PASS`.

## Fase 16 — Sostieni l'Osservatorio

Pagina e sistema di sostegno discreti, trasparenti e separati dalle decisioni editoriali.

Gate: `SUPPORT = PASS`.

## Fase 17 — Identità istituzionale AIPEL

Footer, chi siamo, governance, direzione editoriale, contatti e dati amministrativi completi.

Gate: `INSTITUTIONAL_IDENTITY = PASS`.

## Fase 18 — SEO e internazionalizzazione

SEO per territori, Paesi, rotte, settori, rapporti, autori, eventi e indicatori. Preparazione tecnica multilingua senza traduzione massiva obbligatoria nella v1.

Gate: `SEO_FOUNDATION = PASS`.

## Fase 19 — Qualità, privacy e sicurezza

Verificare:

- RLS e ruoli;
- autenticazione;
- workflow di pubblicazione;
- privacy e consensi;
- diritti su immagini/video;
- accessibilità;
- performance;
- mobile;
- fonti e link;
- tracciabilità delle correzioni.

Gate: `PRODUCTION_READINESS = PASS`.

## Fase 20 — Lancio editoriale v1

Non lanciare un guscio vuoto. Preparare un numero zero con:

- nucleo dati Lombardia/Italia;
- storie/interviste forti;
- almeno un confronto internazionale;
- rapporti selezionati;
- eventi;
- home viva.

Gate finale: `IMMIGRATI_IMPRENDITORI_V1 = LIVE`.

## Metodo operativo

Per ogni fase:

1. ricognizione dello stato esistente;
2. definizione del delta minimo necessario;
3. implementazione su branch dedicato quando il cambiamento è significativo;
4. test tecnici e funzionali;
5. verifica dati e sicurezza quando coinvolge Supabase;
6. Preview Vercel;
7. merge su `main` solo con gate PASS;
8. smoke Production;
9. aggiornamento della roadmap.

Principio permanente: **preservare ciò che funziona, non ricostruire inutilmente, non reintrodurre dipendenze da PonteImprese**.
