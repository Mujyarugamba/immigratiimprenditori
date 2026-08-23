# Go-live A closure kit — Centro Studi

Data di riferimento: 2026-08-23
Stato: **OPERATIVO — NON CHIUDE I GATE DA SOLO**
Branch: `feature/research-radar-ai-knowledge-20260822`

Questo documento serve esclusivamente a chiudere i due punti ancora aperti della fascia A della roadmap funzionale 110:

- **#92 — WCAG 2.2 AA:** QA umano finale;
- **#10 — Storie d'impresa:** almeno una storia/intervista/testimonianza reale, approvata e pubblicabile.

Non autorizza merge, migration o deploy production e non modifica la regola editoriale: nessun contenuto fittizio, nessun auto-publish, nessuna scorciatoia tecnica per rendere verde il gate Storie.

---

## A. Chiusura #92 — QA umano WCAG/device

### Precondizioni

Prima del QA registrare:

- commit candidato esatto;
- URL deploy-preview Netlify corrispondente;
- data e persona che esegue il controllo;
- browser/versione;
- dispositivo reale o viewport utilizzato.

I controlli automatici già esistenti restano prerequisiti e non vengono sostituiti: landmark, H1, alt/label, skip-link, contrasto core, focus, reflow, RTL, responsive, browser E2E e Lighthouse devono essere verdi sul candidato.

### Matrice minima dispositivi

Eseguire almeno:

| Classe | Configurazione minima | Superfici core |
|---|---|---|
| Desktop | 1440×900 o equivalente | Home, Osservatorio, Atlante, Rotte, Storie, Contribuisci, Accedi |
| Laptop | 1366×768 o equivalente | Home, menu, ricerca, tabelle, moduli |
| Tablet | 768×1024 reale o equivalente | Home, navigazione, Osservatorio, Contribuisci |
| Mobile | 390×844 reale o equivalente | Home, menu, lingua, Storie, Contribuisci |
| Mobile stretto | 320×568 o equivalente | Home, navigazione, contenuti lunghi, moduli |

Quando possibile includere almeno un dispositivo fisico iOS/Safari e uno Android/Chrome. Un viewport emulato non va registrato come dispositivo fisico.

### Controllo solo tastiera

Su Home, ricerca, Contribuisci e Accedi verificare senza mouse:

1. il primo `Tab` espone chiaramente il salto al contenuto;
2. `Invio` porta il focus al contenuto principale;
3. ordine del focus coerente con l'ordine visivo e logico;
4. nessun elemento interattivo irraggiungibile;
5. nessun focus intrappolato;
6. focus sempre visibile su link, pulsanti, campi e menu;
7. menu mobile e selettore lingua apribili/chiudibili da tastiera;
8. messaggi di errore dei form comprensibili e associati al campo;
9. nessuna funzione richiede hover o gesto puntatore esclusivo.

Esito richiesto: **PASS senza eccezioni bloccanti**.

### Screen reader

Su Windows utilizzare almeno NVDA con Chrome o Firefox; su iOS, se disponibile, VoiceOver/Safari.

Verificare almeno:

- titolo pagina significativo;
- un solo H1 coerente;
- gerarchia heading comprensibile;
- landmark `header`, `nav`, `main`, `footer` navigabili;
- link distinguibili e con nome accessibile utile;
- immagini informative con testo alternativo; decorative ignorate;
- campi form annunciati con label e stato obbligatorio;
- errori annunciati e comprensibili;
- tabelle dati con intestazioni riconoscibili;
- cambio lingua e pagina araba annunciati correttamente;
- contenuto e ordine di lettura coerenti anche senza layout visivo.

### Zoom, reflow e testo

Verificare manualmente:

- zoom browser 200%;
- zoom 400% sulle superfici core più importanti;
- nessuna perdita di contenuto o funzionalità;
- nessun testo sovrapposto;
- nessuno scroll orizzontale necessario per leggere testo normale, salvo componenti bidimensionali intrinsecamente tabellari;
- ingrandimento del testo e spaziatura non devono troncare pulsanti, label o navigazione.

### Percezione e contrasto

Controllare visivamente che:

- informazioni/stati non dipendano solo dal colore;
- testo piccolo e secondario restino leggibili;
- focus, errori, link e controlli siano riconoscibili;
- nessuna informazione essenziale sia incorporata soltanto in immagini;
- grafici/tabelle mantengano etichette e contesto testuale sufficiente.

### RTL arabo

Su `/ar` e almeno Osservatorio/Contribuisci localizzati verificare:

- direzione RTL coerente;
- numeri, date e sigle leggibili;
- icone e controlli non invertiti in modo semanticamente errato;
- nessun taglio/overflow;
- ordine di tab coerente con la struttura DOM e comprensibile.

### Moduli e autenticazione

Verificare manualmente:

- `/contribuisci`: istruzioni, label, obbligatorietà, privacy, errori;
- `/accedi`: label, errori login, focus dopo errore;
- area contributor: navigabilità base tastiera;
- area redazione: MFA e operazioni privilegiate senza dipendere dal mouse.

Non usare identità production reali durante il QA del preview se non esplicitamente autorizzato.

### Registro esito #92

Il gate può essere marcato chiuso solo con un record compilato:

- commit:
- deploy-preview:
- data:
- esecutore:
- desktop PASS/FAIL:
- tablet PASS/FAIL:
- mobile PASS/FAIL:
- tastiera PASS/FAIL:
- screen reader PASS/FAIL:
- zoom/reflow PASS/FAIL:
- RTL PASS/FAIL:
- moduli/auth PASS/FAIL:
- difetti aperti:
- decisione finale: **PASS / NON PASS**.

---

## B. Chiusura #10 — prima Storia reale

### Contenuto ammesso al gate

Il gate accetta almeno un contenuto pubblico realmente appartenente a uno dei tipi editoriali:

- `business_story`;
- `interview`;
- `testimony`;
- `personal_story`.

Il contenuto deve essere reale, verificabile, attribuito e navigabile nella superficie pubblica Storie. Un `guide`, `insight` o `institutional_page` rinominato non chiude il gate.

### Requisiti minimi di evidenza

Prima di passare a `ready` registrare almeno:

- nome reale della persona o soggetto intervistato;
- ruolo e impresa/progetto, quando pertinenti;
- Paese/territorio e contesto geografico pertinente;
- settore economico, quando pertinente;
- data dell'intervista o della testimonianza;
- autore/redattore responsabile;
- fonte/evidenza per i fatti esterni citati;
- note di fact-check;
- consenso alla pubblicazione del testo;
- consenso separato per immagini/video/audio quando presenti;
- eventuali limitazioni o richieste di anonimizzazione concordate.

### Workflow obbligatorio

1. **Contatto reale** — nessuna intervista simulata.
2. **Consenso** — chiarire finalità editoriale e uso delle dichiarazioni.
3. **Intervista/testimonianza** — conservare note o trascrizione di lavoro in area privata.
4. **Bozza redazionale** — distinguere chiaramente dichiarazioni, fatti verificati e contesto redazionale.
5. **Fact-check** — verificare nomi, date, impresa, luoghi, numeri e fonti esterne.
6. **Review umana** — stato Inbox/ready secondo governance editoriale vigente.
7. **Conferma finale del soggetto** quando concordata o necessaria per accuratezza/consenso.
8. **Pubblicazione controllata** — mai automatica.
9. **Smoke pubblico** — `/storie` mostra il contenuto e la pagina dettaglio è navigabile.

### Traccia intervista essenziale

Domande base, da adattare alla persona:

1. Qual è la sua attività e come è iniziata?
2. Qual è stato il passaggio decisivo che l'ha portata a fare impresa nel luogo in cui opera oggi?
3. Quali ostacoli concreti ha incontrato all'inizio?
4. Quali reti, competenze o relazioni sono state più importanti?
5. In che modo il percorso migratorio o internazionale ha inciso sulle scelte imprenditoriali?
6. Quali aspetti del mercato locale ha dovuto imparare o reinterpretare?
7. Che ruolo hanno avuto lingua, accesso al credito, burocrazia e clienti?
8. Qual è stato un errore importante e cosa ha imparato?
9. Quali cambiamenti vede oggi nel proprio settore?
10. Quale consiglio darebbe a una persona con un percorso simile che vuole avviare un'impresa?
11. C'è un punto che ritiene importante chiarire perché spesso viene raccontato male dall'esterno?
12. Quali dati o informazioni della storia desidera verificare prima della pubblicazione?

Evitare domande che presuppongano una risposta, stereotipi o una narrativa obbligatoria di successo. Il soggetto deve poter correggere fatti e contesto senza alterare l'indipendenza editoriale.

### Shortlist già presente nel lavoro editoriale

La documentazione/PR precedente ha già indicato come candidati da contattare, senza considerare alcuna intervista acquisita:

- Agie Hujian Zhou / Ravioleria Sarpi;
- Paolo Privitera;
- Gianni Chiloiro e Angelo Sannino / Doppio Zero;
- Adeola Adedewe / Kredete;
- Semyon Dukach come riserva.

Questi nomi sono **shortlist**, non contenuti acquisiti. Nessuna dichiarazione va attribuita loro senza intervista o fonte primaria utilizzabile secondo la politica editoriale.

### Criterio tecnico di chiusura #10

Dopo pubblicazione autorizzata, il laboratorio/go-live smoke deve rilevare almeno un record pubblico appartenente ai tipi Storie e la pagina deve essere raggiungibile dalla superficie `/storie`.

Il test E2E deve diventare verde **perché esiste il contenuto reale**, non perché il test viene indebolito o escluso.

---

## C. Sequenza di chiusura della fascia A

1. completare e registrare QA umano #92 sul candidato Netlify;
2. acquisire una storia/intervista/testimonianza reale;
3. fact-check + review + consenso;
4. pubblicare nel candidato/ambiente autorizzato secondo workflow;
5. rieseguire E2E: atteso **23/23 PASS**;
6. aggiornare `ROADMAP-110-PRIORITIES.md` da 31/33 a 33/33 solo dopo evidenza reale;
7. proseguire quindi con i gate esterni di rilascio: legal, governance review, source-health su default branch, backup/restore, migration production autorizzate, QA preview finale, merge/deploy autorizzati.

Finché #92 e #10 non sono entrambi chiusi, la regola resta:

`GO_LIVE_A = NOT PASS`
