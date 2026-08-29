# Human WCAG/device QA record — Centro Studi

Data preparazione record: 2026-08-28
Branch candidato: `work/pre-go-live-integration-20260826`
Candidato tecnico/operativo verificato prima di questo record: `3475f3b4fd9900ed5aedf729a5f12fe6de00679b`
PR: #13 — DRAFT
Stato record: **MANUAL QA PENDING**

Questo record serve esclusivamente a chiudere il residuo umano del gate #92. Non sostituisce una certificazione professionale di accessibilità e non autorizza merge o deploy Production.

## 1. Evidenza già chiusa — NON ripetere salvo regressioni visibili

### CI e browser automatici

Sul candidato sono già PASS:

- `Editorial v1 CI` #1058;
- `Supabase local migration validation` #591;
- unit/integration: 124/124;
- public browser E2E: 12/12;
- Lighthouse mobile gate;
- reflow automatico 320/390/768 px;
- WCAG text-spacing;
- target size minimo;
- skip-link e focus visibile;
- navigazione header stretta via tastiera con focus portato nel viewport;
- `/cerca`: input, filtri e submit raggiungibili via tastiera;
- `/accedi`: email, password e submit raggiungibili via tastiera;
- `/contribuisci`: controlli essenziali fino a privacy/autorizzazione e submit raggiungibili via tastiera;
- scroll nativo del focus a 320 px;
- sette lingue e `dir=rtl` arabo;
- `/ar`, `/ar/osservatorio`, `/ar/contribuisci`: assenza di overflow orizzontale a 320 px;
- associazione semantica degli errori server al modulo.

### QA visivo già registrato

Sul runtime applicativo trasferibile al candidato corrente sono già stati verificati:

- 1440×900;
- 390×844;
- 320×844;
- mini-trend reale e relative etichette/fonte;
- logo header;
- logo footer;
- favicon;
- console/network senza errori >=400 o overlay Next.js.

Nessuna modifica successiva ha introdotto cambi di layout della homepage che invalidino questo QA.

## 2. Precondizioni per la prova umana

Compilare prima di iniziare:

- data/ora: ____________________
- esecutore: ____________________
- commit verificato: ____________________
- URL Preview Vercel esatto: ____________________
- browser/versione desktop: ____________________
- dispositivo/i fisico/i: ____________________
- eventuale screen reader/versione: ____________________

Usare il Preview Vercel corrente. Non usare Production e non eseguire submit/mutazioni reali.

## 3. Prova A — screen reader reale

Minimo richiesto: NVDA + Chrome/Firefox su Windows. Se disponibile, aggiungere VoiceOver + Safari iOS.

Superfici minime:

- Home;
- Osservatorio;
- Contribuisci;
- Accedi;
- una pagina araba, preferibilmente `/ar/osservatorio`.

Verificare:

- [ ] titolo pagina annunciato in modo significativo;
- [ ] un solo H1 principale coerente;
- [ ] gerarchia heading comprensibile;
- [ ] landmark `header`, `nav`, `main`, `footer` navigabili;
- [ ] link/pulsanti con nome accessibile comprensibile fuori contesto;
- [ ] immagini informative annunciate utilmente e decorative non disturbanti;
- [ ] campi form annunciati con label e stato obbligatorio;
- [ ] checkbox privacy e autorizzazione distinguibili e correttamente annunciate;
- [ ] eventuale errore form comprensibile/annunciato;
- [ ] tabelle dati, se presenti, con intestazioni comprensibili;
- [ ] cambio lingua e contenuto arabo annunciati con lingua/direzione coerenti;
- [ ] ordine di lettura logico senza dipendere dal layout visivo.

Esito screen reader: **PASS / FAIL / PENDING**

Note/difetti: ________________________________________________

## 4. Prova B — zoom browser reale 200% e 400%

Eseguire con browser desktop reale; non simulare solo cambiando viewport CSS.

Superfici minime:

- Home;
- Osservatorio;
- Atlante;
- Cerca;
- Contribuisci;
- Accedi.

### 200%

- [ ] nessuna perdita di contenuto o funzionalità;
- [ ] testo leggibile senza sovrapposizioni;
- [ ] controlli essenziali utilizzabili;
- [ ] focus visibile;
- [ ] nessun contenuto importante tagliato.

### 400%

- [ ] contenuto core ancora leggibile/utilizzabile;
- [ ] nessuna sovrapposizione distruttiva;
- [ ] moduli utilizzabili;
- [ ] navigazione raggiungibile;
- [ ] eventuale scroll orizzontale limitato ai componenti che lo richiedono realmente, non all'intera pagina per testo ordinario.

Esito zoom/reflow manuale: **PASS / FAIL / PENDING**

Note/difetti: ________________________________________________

## 5. Prova C — dispositivi fisici

Quando disponibili, usare almeno:

### iOS / Safari

- dispositivo/modello: ____________________
- iOS/Safari: ____________________
- [ ] Home e navigazione;
- [ ] selettore lingua;
- [ ] Osservatorio;
- [ ] Contribuisci;
- [ ] nessun clipping/overflow evidente;
- [ ] focus/tap target usabili;
- [ ] rotazione portrait/landscape senza perdita di funzionalità core.

### Android / Chrome

- dispositivo/modello: ____________________
- Android/Chrome: ____________________
- [ ] Home e navigazione;
- [ ] selettore lingua;
- [ ] Osservatorio;
- [ ] Contribuisci;
- [ ] nessun clipping/overflow evidente;
- [ ] focus/tap target usabili;
- [ ] rotazione portrait/landscape senza perdita di funzionalità core.

Esito dispositivi fisici: **PASS / FAIL / PENDING**

Note/difetti: ________________________________________________

## 6. Prova D — verifica qualitativa focus / ordine / RTL / moduli

Questa è la parte che l'automazione non può decidere in modo affidabile.

- [ ] ordine del focus percepito coerente con ordine visivo/logico;
- [ ] nessun salto sorprendente tra regioni della pagina;
- [ ] focus sempre distinguibile senza sforzo;
- [ ] pagina araba leggibile e naturale nella disposizione RTL;
- [ ] numeri, date, icone e controlli misti LTR/RTL non risultano confusi;
- [ ] form Contribuisci comprensibile dall'inizio alla fine senza istruzioni esterne;
- [ ] distinzione tra presa d'atto privacy obbligatoria e autorizzazione pubblicazione facoltativa evidente;
- [ ] errori e stati di successo comprensibili;
- [ ] nessun controllo richiede esclusivamente mouse/hover/gesto complesso.

Esito qualitativo: **PASS / FAIL / PENDING**

Note/difetti: ________________________________________________

## 7. Registro difetti

| ID | Superficie | Ambiente/device | Descrizione | Gravità | Bloccante? | Stato |
|---|---|---|---|---|---|---|
| — | — | — | Nessun difetto registrato finché la prova non viene eseguita | — | — | PENDING |

Classificazione suggerita:

- **BLOCKER**: impedisce accesso/uso di funzione core o comprensione essenziale;
- **MAJOR**: problema serio ma con percorso alternativo praticabile;
- **MINOR**: difetto non bloccante da correggere/hardening successivo.

## 8. Decisione gate #92

Compilare soltanto dopo aver eseguito le prove A–D.

- Screen reader: PASS / FAIL / PENDING
- Zoom 200/400%: PASS / FAIL / PENDING
- Device fisici: PASS / FAIL / PENDING
- Focus/ordine/RTL/moduli qualitativo: PASS / FAIL / PENDING
- Difetti BLOCKER aperti: sì / no

Decisione finale:

`HUMAN_WCAG_DEVICE_QA = PASS / FAIL / PENDING`

Esecutore: ____________________
Data: ____________________
Firma/nome record: ____________________

Finché una delle quattro prove è PENDING o esiste un BLOCKER aperto:

`HUMAN_WCAG_DEVICE_QA = PENDING`
