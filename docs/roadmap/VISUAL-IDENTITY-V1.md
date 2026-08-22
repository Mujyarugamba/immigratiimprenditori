# Immigrati Imprenditori — Design System Editoriale v1

Stato: CANONICO
Data: 2026-08-22

## Principio

Immigrati Imprenditori deve apparire come un Centro Studi e una pubblicazione editoriale autorevole, non come una startup, un marketplace o una dashboard commerciale.

La gerarchia visiva deve nascere da tipografia, spaziatura, griglia, contenuto e qualità delle immagini. Il colore non sostituisce la gerarchia.

## 1. Palette

### Base

- bianco `#FFFFFF`: superficie primaria;
- nero quasi pieno `#111111`: testo, bordi forti, pannelli editoriali scuri;
- nero profondo `#0A0A0A`: barre istituzionali e footer;
- grigi caldi/neutri: superfici secondarie, note, metadati, separatori.

### Accento

È ammesso un solo accento cromatico contenuto, attualmente bronzo/oro scuro (`#9A6B24`), esclusivamente come segnale funzionale: focus, azione primaria selezionata, stato o dettaglio di orientamento.

Non deve essere usato per creare decorazione, varietà cromatica tra card o sezioni.

## 2. Cose vietate

- gradienti decorativi;
- card multicolori;
- ombre da interfaccia startup;
- raggi ampi e pillole decorative come linguaggio dominante;
- background colorati alternati senza funzione editoriale;
- illustrazioni astratte puramente ornamentali;
- effetti glow, glassmorphism o blur come elemento estetico;
- badge promozionali o CTA da SaaS.

## 3. Tipografia

### Titoli

Serif editoriale: Georgia / Times New Roman come fallback disponibile nel progetto.

Uso:

- titoli di pagina;
- titoli di articoli e studi;
- numeri chiave;
- headline editoriali.

Caratteristiche:

- peso medio, non eccessivamente bold;
- tracking leggermente negativo sui grandi titoli;
- interlinea compatta ma leggibile.

### Struttura e metadati

Sans-serif di sistema per:

- navigazione;
- etichette;
- metadati;
- filtri;
- form;
- tabelle;
- CTA.

Le eyebrow possono essere maiuscole con tracking controllato, ma non devono diventare decorazione dominante.

## 4. Griglia e spaziatura

- contenitore principale massimo circa 1180 px;
- allineamenti condivisi tra header, hero, sezioni dati, contenuti e footer;
- separazione tra moduli tramite spazio e linee, non tramite colori differenti;
- bordi neri o grigi sottili per strutturare registri, dati e card;
- densità maggiore nelle aree dati, respiro maggiore nelle aree editoriali.

## 5. Immagini

Le immagini sono materiale editoriale/documentario, non decorazione.

Sono appropriate per:

- persone intervistate;
- imprese e luoghi reali;
- eventi;
- copertine di studi e rapporti;
- fotografie con valore informativo.

Se un contenuto non possiede un'immagine reale e pertinente, è preferibile una superficie neutra tipografica a una stock image generica.

## 6. Grafici e dati

- nero, bianco e grigi come base;
- una sola tinta funzionale quando indispensabile per distinguere una serie o uno stato;
- assi e griglie sottili;
- niente effetti 3D, gradienti, ombre o palette rainbow;
- fonte, territorio, periodo e unità sempre leggibili vicino al dato;
- il grafico deve poter essere compreso anche senza affidarsi esclusivamente al colore.

## 7. Componenti

### Header

Bianco, bordo inferiore netto, navigazione testuale. La barra istituzionale può essere nera. La CTA di sostegno può usare l'accento perché è un'azione funzionale esplicita.

### Hero Home

Può usare una fotografia editoriale reale con overlay nero uniforme. In assenza di immagine: fondo nero pieno. Nessun gradiente.

### Card editoriali

Bianco su griglia, separatori sottili, immagine reale opzionale. Nessuna famiglia di colori per distinguere i tipi di contenuto.

### Osservatorio / numeri

Superficie chiara simile a una pagina di rapporto. Numeri grandi, fonte e contesto visibili. Non deve sembrare una dashboard finanziaria SaaS.

### Storie e interviste

È ammesso un pannello nero unico con fotografie documentarie. La differenza rispetto ai dati deriva dal contenuto umano, non da una palette diversa.

### Contribuisci

Sezione editoriale sobria con una sola azione primaria. Deve comunicare processo di raccolta e verifica, non marketing.

### Footer

Nero, tipografia sobria, link istituzionali e informativi.

## 8. Accessibilità

- contrasto testo/sfondo compatibile con WCAG 2.2 AA;
- focus sempre visibile;
- il colore non è l'unico segnale di stato;
- dimensioni interattive adeguate su mobile;
- le immagini informative devono avere alternative testuali appropriate dove necessarie.

## 9. Implementazione corrente

Lo strato canonico è `src/app/editorial-identity.css`, importato dopo `globals.css` e `responsive-overrides.css`.

Questo ordine è intenzionale: consente di neutralizzare progressivamente gli stili legacy senza destabilizzare layout e responsive già verificati.

Per la Home corrente:

- gradienti legacy: neutralizzati;
- ombre decorative: neutralizzate;
- palette multicolore: neutralizzata;
- fascia dati: convertita a superficie chiara;
- pannello voci: nero unico;
- CTA e focus: unico accento funzionale;
- immagini: mantenute solo come materiale editoriale.

## 10. Gate

`VISUAL_IDENTITY = PASS` richiede:

1. assenza di gradienti visibili nelle pagine principali;
2. nessuna card multicolore come sistema di classificazione;
3. nessuna ombra/raggio decorativo dominante;
4. nero/bianco/grigi come linguaggio base;
5. un solo accento cromatico funzionale;
6. Home, header, footer, Osservatorio e sezione Voci coerenti;
7. CI applicativa e Deploy Preview verdi.

Il gate non impedisce future rifiniture tipografiche o fotografiche: impedisce regressioni verso un'estetica commerciale/startup.
