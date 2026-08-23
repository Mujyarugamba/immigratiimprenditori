# Go-live A closure kit — Centro Studi

Data di riferimento: 2026-08-23
Stato: **OPERATIVO — NON CHIUDE I GATE DA SOLO**
Branch: `feature/research-radar-ai-knowledge-20260822`

Questo documento separa nettamente due momenti:

- **prima del go-live:** chiusura tecnica e QA umano del candidato;
- **dopo il go-live:** avvio dei contatti esterni e acquisizione delle prime storie reali.

Regola editoriale vincolante: **nessun invito, richiesta di intervista o contatto esterno prima che il sito sia online**. Nessun contenuto fittizio, nessun auto-publish e nessuna scorciatoia tecnica sono ammessi.

Non autorizza merge, migration o deploy production.

---

## A. Chiusura pre-go-live #92 — QA umano WCAG/device

### Precondizioni

Prima del QA registrare:

- commit candidato esatto;
- URL esatto del candidato Vercel usato per il controllo (Preview durante il QA pre-release; Production protetto durante lo smoke finale autorizzato);
- eventuale URL Netlify deploy-preview solo come preview tecnico secondario, non come target Production;
- data e persona che esegue il controllo;
- browser/versione;
- dispositivo reale o viewport utilizzato.

I controlli automatici già esistenti restano prerequisiti e non vengono sostituiti: landmark, H1, alt/label, skip-link, contrasto core, focus, reflow, RTL, responsive, browser E2E e Lighthouse devono essere verdi sul candidato.

La copertura automatica comprende inoltre reflow a 320/390/768 px, sette lingue e RTL arabo, navigazione stretta raggiungibile via `Tab` con focus portato nel viewport e associazione semantica dell'errore server al modulo di contribuzione. Questi controlli riducono il rischio ma **non sostituiscono** screen reader, zoom/reflow manuale, dispositivi reali e valutazione qualitativa del focus richiesti da #92.

### Matrice minima dispositivi

Eseguire almeno:

| Classe | Configurazione minima | Superfici core |
|---|---|---|
| Desktop | 1440×900 o equivalente | Home, Osservatorio, Atlante, Rotte, Storie, Contribuisci, Accedi |
| Laptop | 1366×768 o equivalente | Home, navigazione, ricerca, tabelle, moduli |
| Tablet | 768×1024 reale o equivalente | Home, navigazione, Osservatorio, Contribuisci |
| Mobile | 390×844 reale o equivalente | Home, navigazione responsive, lingua, Storie, Contribuisci |
| Mobile stretto | 320×568 o equivalente | Home, navigazione responsive, contenuti lunghi, moduli |

Quando possibile includere almeno un dispositivo fisico iOS/Safari e uno Android/Chrome. Un viewport emulato non va registrato come dispositivo fisico.

### Controllo solo tastiera

Su Home, ricerca, Contribuisci e Accedi verificare senza mouse:

1. il primo `Tab` espone chiaramente il salto al contenuto;
2. `Invio` porta il focus al contenuto principale;
3. ordine del focus coerente con l'ordine visivo e logico;
4. nessun elemento interattivo irraggiungibile;
5. nessun focus intrappolato;
6. focus sempre visibile su link, pulsanti, campi, navigazione e selettori;
7. navigazione responsive e selettore lingua raggiungibili e utilizzabili da tastiera, con il controllo focalizzato portato in vista anche su 320 px;
8. messaggi di errore dei form comprensibili e associati semanticamente al campo o al modulo pertinente;
9. nessuna funzione richiede hover o gesto puntatore esclusivo.

Il design corrente non usa un menu hamburger: il controllo mobile riguarda quindi la navigazione responsive/scrollabile effettiva, non un componente inesistente.

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

Non usare identità production reali durante il QA del Preview se non esplicitamente autorizzato.

### Registro esito #92

Il gate può essere marcato chiuso solo con un record compilato:

- commit:
- URL candidato Vercel:
- eventuale preview secondario:
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

## B. #10 — Storie d'impresa: funzione pre-go-live, contenuto reale post-go-live

La superficie pubblica `/storie`, i tipi editoriali, il workflow redazionale, l'evidence gate e la pubblicazione controllata devono essere tecnicamente pronti **prima** del go-live. Il cold-start può però contenere **zero storie reali**.

Questa assenza non blocca la messa online perché la regola approvata è:

> **prima il sito va online; solo dopo iniziano inviti, interviste e contatti esterni.**

Perciò il test pre-go-live verifica che la superficie Storie sia raggiungibile, corretta e senza errori anche a contenuto vuoto. Non deve più pretendere una storia reale prima della pubblicazione del sito.

### Divieti pre-go-live

Prima che il sito sia online:

- non inviare richieste di intervista;
- non invitare imprenditori, ricercatori o partner;
- non attribuire dichiarazioni a soggetti non intervistati;
- non creare placeholder o storie simulate per rendere verde un test;
- non pubblicare contenuti esterni senza consenso ed evidenza.

Eventuali shortlist, bozze di email o tracce di intervista possono essere preparate internamente, ma devono restare **NON INVIATE**.

### Primo obiettivo editoriale dopo il go-live

Dopo messa online e smoke live riuscito, il primo ciclo editoriale Storie può partire. Il contenuto ammesso appartiene a uno dei tipi:

- `business_story`;
- `interview`;
- `testimony`;
- `personal_story`.

Prima della pubblicazione registrare almeno:

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

### Workflow post-go-live obbligatorio

1. sito online e smoke live PASS;
2. contatto reale;
3. consenso e chiarimento finalità editoriale;
4. intervista/testimonianza;
5. bozza redazionale;
6. fact-check;
7. review umana;
8. conferma finale del soggetto quando concordata o necessaria;
9. pubblicazione controllata, mai automatica;
10. smoke pubblico su `/storie` e pagina dettaglio.

### Traccia intervista essenziale

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

Evitare domande che presuppongano una risposta, stereotipi o una narrativa obbligatoria di successo.

### Shortlist interna, non da contattare prima del go-live

- Agie Hujian Zhou / Ravioleria Sarpi;
- Paolo Privitera;
- Gianni Chiloiro e Angelo Sannino / Doppio Zero;
- Adeola Adedewe / Kredete;
- Semyon Dukach come riserva.

Questi nomi restano solo shortlist interna. Nessuna dichiarazione va attribuita senza intervista o fonte primaria utilizzabile secondo la politica editoriale.

---

## C. Sequenza corretta di avanzamento

### Prima del go-live

1. completare QA umano #92 sul candidato Vercel;
2. chiudere i gate tecnici/amministrativi esterni: legal, governance review, backup/restore, migration production autorizzate, required checks e QA finale del candidato;
3. merge e deploy soltanto con autorizzazione esplicita;
4. eseguire smoke sul Production Vercel protetto e, dopo i PASS, aprire il dominio pubblico;
5. eseguire il live smoke sul dominio reale.

### Dopo il go-live

6. iniziare i primi contatti esterni;
7. acquisire una storia/intervista/testimonianza reale;
8. fact-check + review + consenso;
9. pubblicare il primo contenuto Storie;
10. eseguire il gate editoriale post-go-live e verificare la navigazione pubblica.

Finché #92 e i gate esterni pre-release non sono chiusi:

`PRE_GO_LIVE_READINESS = NOT PASS`

L'assenza di una storia reale **non è più un blocker del primo go-live**; è il primo obiettivo editoriale dopo la messa online.
