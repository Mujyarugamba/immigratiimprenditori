# Brief 04 — Lombardia: mappa territoriale dell'imprenditoria migrante

Stato: **BRIEF REDAZIONALE — DATI DA COMPLETARE — NON PUBBLICATO**

Fascia: Lombardia  
Formato target: `data_note` + successivi approfondimenti provinciali  
Priorità: alta

## Titolo di lavoro

**Imprese migranti in Lombardia: una mappa che parte dai territori**

Titolo definitivo ammesso solo dopo avere completato la copertura regionale con dati omogenei.

## Perché partire dalla Lombardia

La Lombardia è il laboratorio territoriale prioritario dell'Osservatorio. L'obiettivo non è produrre una sola classifica regionale, ma costruire progressivamente una struttura provincia → territorio → settore → storie, mantenendo le stesse definizioni statistiche.

## Fonti ufficiali già individuate

### Milano, Monza Brianza, Lodi — 2025

Camera di Commercio Milano Monza Brianza Lodi / Unioncamere Open Government. Dati InfoCamere StockView su imprese straniere per settore ATECO nelle tre province, anno 2025.

URL:
https://opengovernment.unioncamere.gov.it/dataset/milano-monza-brianza-lodi-imprese-straniere-settore-sul-totale-delle-tre-province-anno-2025

Metadati verificati:

- periodo 2025;
- fonte InfoCamere StockView;
- licenza CC BY 4.0;
- disponibilità di distribuzione per settore economico ATECO.

### Cremona, Mantova, Pavia — 2025

Camera di Commercio Cremona-Mantova-Pavia / Unioncamere Open Government. Sedi di imprese straniere attive e addetti al 31 dicembre 2025.

URL:
https://opengovernment.unioncamere.gov.it/dataset/cremona-mantova-pavia-imprese-straniere-e-addetti-anno-2025

Metadati verificati:

- dati al 31 dicembre 2025;
- imprese straniere **attive** e addetti;
- distribuzioni provinciali separate e cumulativa;
- licenza CC BY 4.0.

## Vincolo metodologico

Le due fonti non devono essere sommate automaticamente: occorre verificare che misurino lo stesso universo (`registrate` vs `attive`, grado di imprenditorialità, periodo, ATECO e altri criteri).

La pagina camerale di Milano specifica che per imprese straniere/femminili/giovanili il grado di imprenditorialità dipende dalla forma giuridica e dal peso di cariche, quote, soci o amministratori. Questa definizione deve essere riportata nella nota metodologica dell'Osservatorio, non nascosta.

## Copertura da completare

Prima di chiamare il dato “Lombardia” vanno ricercate fonti omogenee per le province mancanti, tra cui:

- Bergamo;
- Brescia;
- Como;
- Lecco;
- Sondrio;
- Varese;
- Lodi se non separabile dal dataset aggregato;
- eventuali altre articolazioni camerali necessarie.

Se non è possibile ottenere un'unica fonte regionale omogenea, la prima pubblicazione deve dichiararsi esplicitamente **mappa parziale dei territori disponibili**.

## Struttura proposta

### 1. Che cosa misuriamo

Definizione camerale di impresa straniera e differenza tra impresa registrata/attiva.

### 2. Milano e area metropolitana allargata

Estrarre totale, settori principali e forme giuridiche dal dataset 2025.

### 3. Cremona, Mantova e Pavia

Estrarre imprese attive, addetti e differenze territoriali.

### 4. Completare il resto della Lombardia

Non usare inferenze: aggiungere province solo quando la fonte è omogenea e verificata.

### 5. Settori

Confrontare composizione settoriale soltanto con classificazione ATECO coerente. Dal II trimestre 2025 alcune dashboard camerali adottano ATECO 2025; evitare confronti storici meccanici con classificazioni precedenti.

### 6. Dati + Voci

Collegare la mappa a una prima intervista originale lombarda, non scelta perché “rappresentativa” statisticamente ma perché documenta una traiettoria imprenditoriale significativa.

## Visualizzazioni previste

Solo dopo completamento dati:

1. tabella province con imprese attive/registrate, specificando l'universo;
2. quota per settore o top settori, con classificazione ATECO indicata;
3. eventuale mappa essenziale della Lombardia, senza colori decorativi.

## Prima Voce lombarda

Criteri:

- imprenditore migrante con attività verificabile;
- sede/operatività in Lombardia;
- disponibilità a discutere anche ostacoli, errori e percorso reale;
- possibilità di verificare almeno i principali elementi dell'attività;
- preferibile, ma non obbligatorio, un collegamento economico tra Paese d'origine e Lombardia.

## Elementi da NON fare

- Non chiamare “Lombardia” un aggregato di sole 3-6 province.
- Non sommare registrate e attive.
- Non confrontare ATECO 2007/2022/2025 senza raccordo.
- Non interpretare “impresa straniera” come identità personale o percorso migratorio senza dati aggiuntivi.
- Non scegliere la storia umana per confermare una tesi già decisa dai numeri.

## Gate prima della bozza pubblicabile

- [ ] scaricate le distribuzioni 2025 individuate;
- [ ] verificati i criteri registrata/attiva e grado di imprenditorialità;
- [ ] cercate fonti per tutte le province lombarde;
- [ ] deciso se pubblicare quadro regionale completo o perimetro territoriale parziale dichiarato;
- [ ] scelta e contattata prima Voce lombarda;
- [ ] revisione metodologica.

`BRIEF_LOMBARDIA_04 = READY_FOR_DATA_EXTRACTION`
