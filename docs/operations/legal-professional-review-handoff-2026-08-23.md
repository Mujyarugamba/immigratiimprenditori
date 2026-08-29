# Handoff per revisione legale professionale — Centro Studi

Data di riferimento originaria: 2026-08-23  
Ultima riconciliazione tecnica: 2026-08-29  
Stato: **DOSSIER TECNICO PRONTO / REVISIONE PROFESSIONALE PENDING**  
Branch: `work/pre-go-live-integration-20260826`  
PR: **#13 — DRAFT**

Questo documento non costituisce parere legale e non chiude il gate giuridico. Serve a consegnare al professionista un quadro tecnico-fattuale coerente con l'implementazione candidata, distinguendo ciò che il software fa realmente da ciò che deve essere confermato o corretto sul piano normativo.

La riconciliazione del 29 agosto include il candidato per traduzioni AI automatiche di **soli contenuti editoriali già pubblicati**. La migration relativa non è applicata a Production, il backfill non è stato eseguito e l'attivazione resta soggetta ad autorizzazioni tecniche separate.

## 1. Identità e natura del progetto implementate

Le superfici pubbliche identificano come titolare/promotore:

- **Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia (AIPEL)**;
- sede: **Viale Molise n. 54, 20137 Milano (MI)**;
- codice fiscale: **97342380157**;
- partita IVA: **04222160964**;
- PEC: `direzione@pec.aipel.it`;
- contatti dedicati esposti nelle singole pagine legali.

Il servizio è presentato come **Centro Studi dedicato all'imprenditoria migrante**. I Termini dichiarano che il progetto non è una testata giornalistica registrata.

Il professionista deve confermare che denominazione, qualifica giuridica, dati identificativi, contatti e formulazione sulla natura del servizio siano completi e corretti per il soggetto effettivamente titolare al go-live.

## 2. Superfici legali attualmente implementate

File canonici:

- `src/app/privacy/page.tsx` — Privacy Policy;
- `src/app/cookie/page.tsx` — Cookie Policy;
- `src/app/termini/page.tsx` — Termini di utilizzo;
- `src/app/politica-editoriale/page.tsx` — Politica editoriale;
- `src/app/contribuisci/page.tsx` — modulo pubblico di partecipazione e testi di presa d'atto/autorizzazione.

Privacy Policy e Politica editoriale sono state aggiornate tecnicamente il 29 agosto 2026 per includere il candidato di traduzione AI. Il professionista deve verificare la versione effettivamente presente sul commit sottoposto a sign-off, senza fare affidamento sulla data originaria di questo handoff.

## 3. Dati raccolti dal modulo pubblico

Il modulo `/contribuisci` accetta proposte editoriali senza registrazione.

### Obbligatori per l'invio

- tipo di proposta;
- testo della proposta;
- nome e cognome;
- email;
- presa d'atto dell'informativa privacy per ricezione, valutazione ed eventuale approfondimento della proposta.

### Facoltativi

- titolo/oggetto;
- URL originale o pagina di riferimento;
- Paese di origine;
- Paese di destinazione/operatività;
- telefono;
- organizzazione/impresa/ente;
- autorizzazione alla possibile pubblicazione del materiale.

Il modulo dichiara che l'invio è riservato a persone maggiorenni.

La presa d'atto privacy obbligatoria e l'autorizzazione alla possibile pubblicazione sono controlli distinti. La seconda è facoltativa e non determina mai pubblicazione automatica.

## 4. Workflow editoriale, pubblicazione e traduzioni automatiche

Le proposte entrano in una Inbox redazionale privata. Il sistema non dispone di un percorso di auto-pubblicazione dell'**originale editoriale** per contributi pubblici, Radar o automazioni.

La governance candidata è ibrida:

- contenuti ordinari: same-editor consentito con ruolo, ownership e audit;
- contenuti sensibili/istituzionali: seconda approvazione obbligatoria da account redazionale distinto;
- indicatori Osservatorio: seconda approvazione obbligatoria;
- correzioni pubbliche `substantive` e `retraction`: seconda approvazione obbligatoria;
- approvazioni legate al fingerprint della versione revisionata;
- self-approval vietata.

Per materiali personali, interviste, testimonianze, immagini, audio e video la documentazione tecnica prevede che possano essere richieste autorizzazioni ulteriori prima della pubblicazione.

Il candidato AI introduce una funzione distinta: **traduzione automatica di contenuti editoriali già pubblicati**. Tecnicamente:

- l'originale non viene sovrascritto;
- le traduzioni sono memorizzate in una cache separata;
- la versione originale resta accessibile e prevale in caso di dubbio o discrepanza;
- le traduzioni sono indicate come automatiche e possono essere mostrate senza preventiva revisione umana della singola traduzione;
- il traffico pubblico è cache-only e non genera chiamate OpenAI;
- la generazione è riservata a percorsi server-side espliciti e controllati;
- bozze, proposte non pubblicate e contenuti Inbox non fanno parte della sorgente prevista per la traduzione AI.

Il professionista deve confermare in particolare:

1. il rapporto tra base giuridica del trattamento, consenso/autorizzazione editoriale, diritti di immagine/voce e eventuale conservazione archivistica dopo pubblicazione;
2. se e come la traduzione automatica di contenuti pubblici che possano contenere dati personali richieda precisazioni ulteriori nell'informativa o nella documentazione interna;
3. se le avvertenze sulla natura automatica della traduzione e sulla prevalenza dell'originale siano adeguate;
4. se occorrano regole più restrittive per categorie particolari di contenuti o interessati.

## 5. Basi giuridiche dichiarate nella Privacy Policy

La policy corrente associa:

- funzionamento e sicurezza del sito → interesse legittimo;
- gestione account → esecuzione del servizio richiesto + interesse legittimo alla gestione di redazione/collaboratori;
- ricezione/valutazione/approfondimento proposte → trattamento necessario a dare seguito alla richiesta + interesse legittimo editoriale;
- pubblicazione di testimonianze/materiali personali → base giuridica e autorizzazioni appropriate al caso concreto;
- misurazione aggregata del sito → interesse legittimo, con minimizzazione e senza profilazione;
- adempimenti legali/tutela diritti → obblighi di legge + interesse legittimo.

La policy distingue espressamente la presa d'atto obbligatoria dell'informativa da un consenso a finalità ulteriori.

La versione candidata descrive inoltre OpenAI come fornitore utilizzato per la traduzione di contenuti editoriali già pubblicati e specifica che tale funzione non viene usata per decisioni automatizzate con effetti giuridici o analogamente significativi sugli interessati.

Questa tassonomia deve essere validata dal professionista, inclusa l'eventuale necessità di una base o motivazione più specifica per la traduzione tramite fornitore esterno e per casi particolari o categorie di interessati/contenuti.

## 6. Analytics applicativo realmente implementato

L'endpoint `POST /api/analytics/page-view` è disabilitato salvo attivazione contemporanea di due flag applicativi.

Quando attivo:

- accetta solo richieste same-origin;
- riceve esclusivamente `path` e `locale`;
- rifiuta query string e fragment nel path;
- limita il payload;
- registra tramite RPC soltanto conteggi aggregati;
- la documentazione applicativa prevede conteggi giornalieri per percorso e lingua;
- non esiste nel contratto applicativo un identificatore visitatore, cookie analytics o cronologia individuale.

Le pagine Privacy/Cookie dichiarano inoltre che la raccolta non viene inviata quando il browser segnala Global Privacy Control o Do Not Track.

Il professionista deve confermare:

1. che questa configurazione possa restare senza banner preventivo finché non vengono introdotti strumenti non tecnici;
2. che la base giuridica e l'informativa siano adeguate alla misurazione aggregata effettivamente attivata;
3. che eventuali log infrastrutturali di Vercel/Supabase siano descritti con sufficiente chiarezza come trattamento distinto.

## 7. Cookie e strumenti tecnici

La Cookie Policy corrente dichiara:

- cookie/sessione tecnici per autenticazione e sicurezza delle aree riservate;
- nessun Google Analytics, pixel advertising, remarketing o Hotjar;
- nessun embed social/YouTube caricato automaticamente con cookie non tecnici;
- nessun banner “Accetta tutto” perché non risultano attivati strumenti non tecnici che richiedano scelta preventiva;
- eventuali futuri strumenti non tecnici devono essere preceduti da informativa e meccanismi di consenso appropriati.

Il professionista deve verificare la coerenza di questa impostazione con la configurazione realmente attiva al giorno del go-live e con le linee guida applicabili del Garante.

## 8. Fornitori, OpenAI e trasferimenti

La Privacy Policy candidata indica in particolare:

- Supabase per database, autenticazione e servizi applicativi, con progetto primario in **eu-west-3 (Parigi)**;
- Vercel come hosting/deployment Production previsto;
- Netlify come possibile ambiente tecnico di preview/collaudo non destinato alla pubblicazione;
- Aruba e servizi Google quando impiegati per dominio/posta/comunicazioni;
- **OpenAI** come fornitore per generare traduzioni automatiche di contenuti editoriali già pubblicati.

Per il candidato OpenAI, il contratto tecnico implementato usa `store: false`; la documentazione applicativa specifica espressamente che questa opzione **non viene equiparata a Zero Data Retention**. L'eventuale disponibilità/configurazione di ZDR è un controllo separato a livello account/progetto e non viene presunta dal software.

La policy segnala che fornitori o sub-responsabili possono comportare trattamenti fuori SEE e richiama strumenti come decisioni di adeguatezza o SCC quando applicabili.

Prima del go-live e prima dell'attivazione della funzione AI il professionista deve chiedere/confermare almeno:

- ruolo privacy di ciascun fornitore rilevante;
- DPA/accordi ex art. 28 ove necessari;
- elenco e localizzazione dei sub-responsabili materialmente usati;
- meccanismi di trasferimento internazionale applicabili;
- coerenza tra disclosure pubblica e configurazione effettiva Production;
- ruolo e condizioni contrattuali applicabili a OpenAI rispetto ai contenuti inviati;
- retention effettivamente applicabile alle richieste API e distinzione tra `store: false` ed eventuale Zero Data Retention;
- eventuale necessità di valutazione/documentazione aggiuntiva per contenuti pubblici che includano dati personali o dati di terzi;
- coerenza tra la configurazione tecnica finale e quanto dichiarato in Privacy Policy al momento dell'attivazione.

## 9. Conservazione dichiarata

La Privacy Policy corrente prevede, tra l'altro:

- proposte non pubblicate: tempo necessario alla valutazione e, di regola, non oltre 24 mesi dalla decisione editoriale, salvo esigenze documentali o legali;
- account: durata del rapporto + periodo successivo necessario a chiusura, sicurezza e tutela diritti;
- materiali pubblicati/atti editoriali: conservazione nell'archivio finché permane finalità editoriale, storica o documentale, fatti salvi diritti/correzioni/richieste legittime;
- log tecnici/sicurezza: periodi proporzionati alle finalità e configurazioni dei fornitori;
- analytics applicativo: conteggi aggregati giornalieri senza archivio di IP, user-agent, cookie ID, account o eventi grezzi;
- traduzioni AI generate: cache applicativa separata collegata al fingerprint della sorgente pubblica, soggetta a invalidazione/rigenerazione quando cambia la sorgente.

Il professionista deve validare i termini temporali, gli eventuali obblighi di cancellazione/limitazione, la durata della cache di traduzione e il bilanciamento tra diritti degli interessati e finalità archivistico-editoriali.

## 10. Maggiore età

Privacy Policy, Termini e modulo indicano 18 anni come requisito per inviare proposte e attivare account riservati.

Da confermare professionalmente:

- se il requisito di 18 anni sia adeguato e sufficiente per tutte le funzioni previste;
- se servano meccanismi o formulazioni aggiuntive per gestire segnalazioni/materiali che riguardino minori o dati di minori;
- se contenuti pubblici riguardanti minori o categorie particolari debbano essere esclusi o gestiti con regole specifiche prima di eventuale traduzione automatica.

## 11. Termini, contributi e proprietà intellettuale

I Termini correnti stabiliscono tra l'altro che:

- la consultazione pubblica non richiede account;
- gli account sono personali e destinati a soggetti autorizzati;
- l'invio di materiale non genera diritto alla pubblicazione;
- il mittente dichiara, per quanto a propria conoscenza, correttezza e disponibilità dei diritti/autorizzazioni necessari;
- l'invio non trasferisce automaticamente la proprietà intellettuale ad AIPEL;
- la redazione può ricevere, conservare e riprodurre internamente il materiale nella misura necessaria alla valutazione;
- per pubblicazione/usi ulteriori possono essere richieste autorizzazioni specifiche;
- sono vietati materiali illeciti, diffamatori, fraudolenti, discriminatori, lesivi di diritti di terzi o contenenti malware;
- contenuti e dati pubblicati hanno finalità di studio/documentazione/informazione e non sostituiscono consulenze individuali;
- legge italiana applicabile; tutela del foro del consumatore per consumatori; Foro di Milano previsto per utenti professionali/istituzionali salvo norme inderogabili.

Il professionista deve convalidare soprattutto clausole IP/licenze, responsabilità, gestione dei materiali di terzi, correzioni/ritiri, foro e distinzione consumatore/professionista, nonché verificare se la traduzione automatica dei contenuti pubblicati richieda precisazioni contrattuali o autorizzazioni ulteriori rispetto ai diritti sui materiali sorgente.

## 12. Diritti degli interessati e contatti

La Privacy Policy espone accesso, rettifica, cancellazione, limitazione, opposizione, portabilità e revoca del consenso ove applicabile, oltre al diritto di reclamo al Garante.

Contatto privacy corrente: `info@aipel.it`.

Da verificare prima del go-live:

- chi riceve e gestisce operativamente le richieste;
- tempi/procedura interna di risposta;
- eventuale necessità di ulteriori contatti o ruoli (es. DPO, se applicabile);
- coerenza con eventuali procedure di cancellazione account e retention implementate nel database;
- gestione di richieste di rettifica/cancellazione quando il dato compare anche in una traduzione AI in cache.

## 13. Punti che devono restare esplicitamente PENDING fino al parere professionale

Il dossier tecnico non autorizza a dichiarare PASS nessuno dei seguenti punti:

1. correttezza finale delle basi giuridiche;
2. validità della formulazione su cookie/banner e analytics;
3. completezza delle informative sui fornitori/sub-responsabili/trasferimenti;
4. adeguatezza dei periodi di conservazione;
5. disciplina di interviste, testimonianze, immagini, audio/video e dati di terzi;
6. clausole IP e licenze dei contributi;
7. limiti di responsabilità e foro;
8. trattamento di dati/minori;
9. eventuale necessità di DPIA, registro trattamenti, LIA o altra documentazione interna;
10. obblighi informativi derivanti dalla forma giuridica e dall'attività effettiva di AIPEL;
11. ruolo/DPA/sub-responsabili e trasferimenti applicabili a OpenAI;
12. retention delle richieste API e adeguatezza della distinzione tra `store: false` ed eventuale ZDR;
13. base giuridica e cautele per tradurre tramite provider esterno contenuti pubblici che possano contenere dati personali o dati di terzi;
14. adeguatezza delle disclosure sulla natura automatica della traduzione e sulla prevalenza dell'originale.

## 14. Evidenze tecniche da consegnare insieme al dossier

- `src/app/privacy/page.tsx`;
- `src/app/cookie/page.tsx`;
- `src/app/termini/page.tsx`;
- `src/app/politica-editoriale/page.tsx`;
- `src/app/contribuisci/page.tsx`;
- `src/app/api/analytics/page-view/route.ts`;
- `src/lib/i18n/ai-translation/`;
- `docs/operations/ai-editorial-translation.md`;
- `docs/editorial/HYBRID-REVIEW-GOVERNANCE.md`;
- `docs/security/PRODUCTION-READINESS.md`;
- `docs/roadmap/PRE-MERGE-GATE-RECONCILIATION-2026-08-28.md`;
- `supabase/CS-PRODUCTION-RELEASE.json`;
- ultima CI Editorial PASS sul commit esaminato;
- ultima Supabase local migration validation PASS sul commit esaminato;
- elenco definitivo dei fornitori/servizi effettivamente attivi al go-live.

## 15. Record di sign-off da compilare

- professionista/revisore:
- qualifica:
- data:
- versione/commit esaminato:
- Privacy Policy: PASS / DA MODIFICARE
- Cookie Policy: PASS / DA MODIFICARE
- Termini: PASS / DA MODIFICARE
- Politica editoriale / disclosure traduzioni AI: PASS / DA MODIFICARE
- modulo Contribuisci: PASS / DA MODIFICARE
- fornitori/trasferimenti: PASS / DA MODIFICARE
- OpenAI — ruolo/DPA/sub-responsabili/trasferimenti: PASS / DA MODIFICARE
- OpenAI — retention / `store: false` / eventuale ZDR: PASS / DA MODIFICARE
- traduzione AI di contenuti pubblici e dati di terzi: PASS / DA MODIFICARE
- retention: PASS / DA MODIFICARE
- IP/materiali editoriali: PASS / DA MODIFICARE
- note/correzioni richieste:
- decisione finale gate legale: **PASS / NON PASS**

Finché questo record non è compilato da un professionista competente:

`LEGAL_PROFESSIONAL_REVIEW = PENDING`
