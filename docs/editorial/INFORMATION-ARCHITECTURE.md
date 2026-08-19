# Immigrati Imprenditori — Architettura dell'informazione v1

Stato: **CANONICO v1**

Questa architettura traduce il Progetto Editoriale nella struttura pubblica e redazionale del sito.

## 1. Navigazione pubblica primaria

Ordine iniziale consigliato:

1. **Osservatorio** — `/osservatorio`
2. **Storie e interviste** — `/storie`
3. **Rapporti e ricerche** — `/rapporti`
4. **Territori e rotte** — `/territori`
5. **Eventi** — `/eventi`
6. **Politiche e normative** — `/politiche`
7. **Fonti e metodologia** — `/fonti`

Elementi secondari:

- **Contribuisci** — `/contribuisci`
- **Sostieni l'Osservatorio** — `/sostieni`
- **Chi siamo** — `/chi-siamo`
- **Accedi** — `/accedi` (accesso discreto, non CTA primaria pubblica)

## 2. Home page

La home non deve essere una landing commerciale. Deve funzionare come prima pagina editoriale dell'Osservatorio.

Gerarchia prevista:

1. testata: “Immigrati Imprenditori — Osservatorio sull'imprenditoria migrante”;
2. un dato/indicatore in evidenza;
3. un rapporto o una ricerca in evidenza;
4. **Le voci dell'imprenditoria migrante** — storia/intervista principale;
5. notizie e nuove pubblicazioni selezionate;
6. territori/rotte in evidenza;
7. eventi qualificati;
8. invito visibile a contribuire;
9. fonti/metodologia;
10. sostegno discreto;
11. footer istituzionale AIPEL.

La home deve rendere immediatamente percepibili le tre gambe: **Dati · Analisi · Voci**.

## 3. Osservatorio — `/osservatorio`

Sottosezioni previste:

- `/osservatorio/indicatori`
- `/osservatorio/territori`
- `/osservatorio/settori`
- `/osservatorio/confronti`
- `/osservatorio/rotte`

Ogni indicatore deve esporre fonte, periodo, unità, copertura geografica, metodologia e data di aggiornamento.

## 4. Storie e interviste — `/storie`

Sezione prioritaria e altamente visibile.

Formati iniziali:

- storia d'impresa;
- intervista;
- testimonianza;
- profilo imprenditoriale;
- conversazione con esperto;
- diaspora economica;
- ritorno/seconda generazione;
- ostacoli e fallimenti;
- passaggio generazionale;
- relazioni economiche origine-destinazione.

Ogni contenuto può essere collegato a:

- persona/contributore;
- Paese d'origine;
- Paese di destinazione;
- territorio;
- settore economico;
- impresa citata;
- temi;
- fonti;
- video YouTube o altro materiale audiovisivo.

CTA permanente: **Racconta la tua storia**.

## 5. Rapporti e ricerche — `/rapporti`

Contiene:

- rapporti AIPEL;
- dossier Immigrati Imprenditori;
- ricerche esterne selezionate;
- studi accademici;
- pubblicazioni istituzionali;
- working paper e documenti pertinenti.

Scheda minima: titolo, autore/ente, anno, abstract, area geografica, temi, lingua, fonte originale, eventuale PDF/link ufficiale.

## 6. Territori e rotte — `/territori`

Due modi complementari di navigare il fenomeno.

### Territori

- Lombardia e province;
- regioni italiane;
- Italia;
- Paesi europei;
- Paesi extraeuropei;
- città/aree metropolitane quando il dato è significativo.

### Rotte

Relazioni `origine → destinazione`, con contenuti, indicatori, storie e fonti associate.

Esempio URL futuro: `/rotte/italia/stati-uniti`.

## 7. Eventi — `/eventi`

Filtri principali:

- prossimi / passati;
- territorio/Paese;
- tema;
- tipo di evento;
- rilevanza geografica.

Gli eventi non pertinenti all'imprenditoria migrante o alle sue politiche economiche non entrano nel catalogo.

## 8. Politiche e normative — `/politiche`

Contiene materiali documentati su:

- accesso all'impresa;
- integrazione economica;
- credito e finanza;
- riconoscimento qualifiche;
- politiche migratorie con impatto economico;
- politiche per diaspora e internazionalizzazione;
- norme e programmi pertinenti.

Nessun posizionamento partitico. Separare norma, dato e commento.

## 9. Fonti e metodologia — `/fonti`

È una sezione di autorevolezza, non un semplice footer tecnico.

Comprende:

- registro delle fonti;
- metodologia degli indicatori;
- note sui limiti dei dati;
- definizioni utilizzate;
- cronologia degli aggiornamenti;
- politica delle correzioni.

## 10. Contribuisci — `/contribuisci`

Punto unico di ingresso pubblico verso la redazione.

Percorsi:

- `/contribuisci/storia`
- `/contribuisci/intervista`
- `/contribuisci/evento`
- `/contribuisci/ricerca`
- `/contribuisci/pubblicazione`

Contributo occasionale senza account. Account contributore disponibile solo per collaborazione abituale.

## 11. Sostieni — `/sostieni`

Pagina sobria con:

- missione;
- cosa viene finanziato;
- trasparenza;
- donazione;
- partnership e sostegno istituzionale.

Non è una landing commerciale e non deve prevalere sui contenuti.

## 12. Chi siamo — `/chi-siamo`

Contiene:

- Immigrati Imprenditori come Osservatorio e Centro Studi AIPEL;
- missione;
- AIPEL come ente promotore;
- direzione editoriale;
- governance;
- redazione e collaboratori;
- contatti;
- dati amministrativi quando completi.

## 13. Area redazione privata

Percorso radice: `/app/redazione`.

Navigazione interna target:

1. **Inbox** — `/app/redazione/inbox`
2. **Contenuti** — `/app/redazione/contenuti`
3. **Storie e interviste** — `/app/redazione/storie`
4. **Rapporti** — `/app/redazione/rapporti`
5. **Eventi** — `/app/redazione/eventi`
6. **Osservatorio** — `/app/redazione/osservatorio`
7. **Fonti** — `/app/redazione/fonti`
8. **Contributori** — `/app/redazione/contributori`

La Inbox è il punto di ingresso comune per radar automatico e segnalazioni umane.

## 14. Stati editoriali canonici

- `new`
- `to_review`
- `needs_research`
- `assigned`
- `draft`
- `in_review`
- `published`
- `rejected`
- `archived`

Il database potrà utilizzare codici tecnici, ma la UI deve mostrare etichette italiane chiare.

## 15. Regole UX

- nessun obbligo di login per consultare contenuti pubblici;
- accesso redazione discreto;
- CTA di partecipazione visibile senza diventare promozionale;
- fonti sempre raggiungibili;
- interviste/storie devono avere forte dignità visiva;
- ogni pagina deve privilegiare leggibilità e gerarchia editoriale;
- design nero su bianco, sobrio e istituzionale.

## 16. Migrazione dalle route esistenti

Route esistenti da preservare temporaneamente o reindirizzare senza rotture:

- `/contenuti` → futura aggregazione editoriale / archivio;
- `/cultura` → i contenuti pertinenti confluiscono in storie, rapporti o eventi;
- `/dati-e-fonti` → futura `/fonti` con redirect compatibile;
- `/notizie-e-guide` → futura selezione news/archivio, senza mantenere la parola “guide” se non pertinente.

Non eliminare URL pubblici indicizzati senza strategia di redirect.

`INFORMATION_ARCHITECTURE = PASS`
