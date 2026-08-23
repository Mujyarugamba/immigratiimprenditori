# Roadmap funzionale 110 — priorità di rilascio

Stato: CANONICO
Data di riferimento: 2026-08-22
Ultima verifica tecnica: 2026-08-23
Branch: `feature/research-radar-ai-knowledge-20260822`

Questa roadmap recepisce l'elenco funzionale di 110 punti approvato dall'utente e lo separa dalla roadmap esecutiva tecnica. La classificazione non cancella nessun punto: stabilisce soltanto quando deve essere completato.

## Fasce

- **A — GO-LIVE:** necessario o fortemente raccomandato per una prima pubblicazione istituzionale credibile e sicura.
- **B — POST-GO-LIVE:** da completare subito dopo la pubblicazione; aumenta profondità, distribuzione e capacità di ricerca ma non deve bloccare il lancio.
- **C — EVOLUZIONE:** capacità avanzate, programmi editoriali o di ricerca che possono essere costruiti successivamente senza indebolire il primo go-live.

## Conteggio

| Fascia | Punti | Quota |
|---|---:|---:|
| A — Go-live | 33 | 30.0% |
| B — Post-go-live | 44 | 40.0% |
| C — Evoluzione | 33 | 30.0% |
| **Totale** | **110** | **100%** |

### Stato della fascia A

- **READY:** 31/33
- **DA RIFINIRE:** 1/33
- **BLOCCANTE — CONTENUTO REALE:** 1/33

Quindi **2 punti della fascia A non sono ancora completamente go-live ready**: **#92 WCAG 2.2 AA** richiede ancora QA umano finale e **#10 Storie d'impresa** richiede almeno un contenuto editoriale reale pubblicato.

Il conteggio resta volutamente prudente: i gate automatici non vengono equiparati a una certificazione WCAG completa. Il punto **#36 Profili autore** è invece considerato READY sul piano funzionale perché l'intero ciclo redazionale è stato verificato E2E con dati effimeri; il fatto che il cold-start contenga correttamente zero autori reali è un tema di popolamento editoriale, non una mancanza della funzione.

## A — Necessari al go-live

| # | Punto | Stato go-live |
|---:|---|---|
| 1 | Identità centrale del sito | **READY** |
| 2 | Homepage editoriale molto forte | **READY** |
| 3 | Osservatorio statistico | **READY** |
| 5 | Atlante geografico | **READY** |
| 6 | Schede Paese | **READY** |
| 7 | Rotte imprenditoriali | **READY** |
| 8 | Territori | **READY** |
| 9 | Settori economici | **READY** |
| 10 | Storie d'impresa | **BLOCCANTE — CONTENUTO REALE** |
| 18 | Biblioteca / Archivio | **READY** |
| 20 | Fonti | **READY** |
| 21 | Metodologia | **READY** |
| 22 | Glossario | **READY** |
| 26 | Ricerca interna avanzata | **READY** |
| 30 | Le sette lingue principali | **READY — MATRICE CORE 70/70 PASS** |
| 33 | SEO internazionale | **READY — FOUNDATION** |
| 34 | Partecipa | **READY** |
| 36 | Profili autore | **READY — CICLO REDAZIONALE E2E + EVIDENCE GATE PASS** |
| 40 | Calendario internazionale | **READY** |
| 41 | Evento completo | **READY** |
| 48 | Il pubblico non deve registrarsi | **READY** |
| 49 | Account contributor | **READY** |
| 51 | Download dati | **READY — JSON / CSV / XLSX** |
| 59 | Provenienza dei dati | **READY** |
| 92 | WCAG 2.2 AA | **DA RIFINIRE — GATE AUTOMATICI + CONTRASTO + TASTIERA CORE PASS, QA UMANO PENDING** |
| 93 | RTL | **READY — CORE ARABO PASS** |
| 94 | Connessioni lente | **READY — TEST HIGH-LATENCY PASS** |
| 95 | MFA per amministratori | **READY — LOCAL/CI, ATTIVAZIONE PROD SEPARATA** |
| 96 | Audit log | **READY — LOCAL/CI, ATTIVAZIONE PROD SEPARATA** |
| 97 | Backup | **READY — WORKFLOW + ARCHIVE INTEGRITY PASS, ATTIVAZIONE PROD SEPARATA** |
| 98 | Rate limiting | **READY — LOCAL/CI, ATTIVAZIONE PROD SEPARATA** |
| 99 | Controlli automatici | **READY — CI + LINK INTEGRITY + RELEASE GATES AUTOMATICI PASS** |
| 100 | Analytics privacy-friendly | **READY — LOCAL/CI, ATTIVAZIONE PROD SEPARATA** |

### Unico blocco A di contenuto ancora aperto

- **#10 — Storie d'impresa:** il cold-start contiene 12 `insight`, 4 `guide` e 1 `institutional_page`, ma nessun `business_story`, `interview`, `testimony` o `personal_story`. Il gate resta rosso intenzionalmente finché non esiste almeno una storia/intervista/testimonianza reale, approvata e pubblicabile. Non va chiuso con placeholder, contenuti fittizi o riclassificazioni tecniche.

### Unico punto A da rifinire

- **#92 — WCAG 2.2 AA:** struttura automatizzata, landmark, H1, alt, label, nomi accessibili, skip-link, reflow e RTL passano sulle superfici core. Sono protetti anche i token di contrasto per testo piccolo/stati di errore e focus visibile, con gate automatici >=4.5:1 per testo piccolo e >=3:1 per focus su superfici chiare/scure. Il browser verifica inoltre che il primo Tab renda visibile il salto al contenuto, esponga un outline reale e che Invio trasferisca il focus a `#contenuto-principale`. Resta il QA umano completo richiesto per non equiparare i test automatici a una certificazione WCAG.

### #36 — Profili autore: funzione READY, dati reali non inventati

Il ciclo completo è stato verificato nel laboratorio Supabase locale con dati effimeri:

1. login redattore reale;
2. MFA TOTP e sessione AAL2;
3. creazione di un contenuto, passaggio a `ready` e pubblicazione;
4. creazione di un profilo autore inizialmente privato;
5. validazione e salvataggio dei dati autore;
6. collegamento autore → contenuto pubblico;
7. pubblicazione del profilo solo dopo il superamento dell'evidence gate;
8. rendering della pagina pubblica autore con collegamento al contenuto;
9. cleanup di autore, contenuto e utente effimeri.

Il cold-start continua correttamente a restituire **0 profili autore pubblici reali**. Nessun nome o identità viene inventato per far passare il gate.

### Verifica automatica del 23 agosto 2026

Head tecnico verificato: `764ab1fac82aa61361fc00d7e7fbeb5a9cc1e94a`.

- `Editorial v1 CI` run `32620148591`: **COMPLETED / SUCCESS**. Typecheck, unit test, functional gates, vulnerability audit, Auth deprecation guard, Next build, HTTP smoke e browser pubblico sono tutti PASS.
- `Supabase local migration validation` run `32620148584`: cold-start, migration replay, DB lint, RLS/security, persistent rate limiting, audit/analytics, backup archive, Auth reale, dependency install e build applicazione sono PASS. Browser E2E: **19 PASS / 1 FAIL**; l'unico failure è intenzionalmente il gate #10 Storie per assenza di una storia reale.
- **Sette lingue:** matrice core IT/EN/FR/ES/DE/AR/ZH × 10 superfici = **70/70 PASS** anche sul vero stack Supabase locale; il gate usa risposte HTTP complete per evitare falsi negativi dovuti alla cancellazione di stream durante navigazioni browser consecutive. I test browser separati continuano a verificare lingua, direzione, RTL e usabilità mobile.
- **Controlli automatici:** internal-link integrity sul vero stack locale è PASS; non restano failure tecnici mascherati dal gate Storie.
- **Profili autore:** il ciclo redazionale evidence-gated completo è PASS nel browser autenticato; il security smoke conferma `anon_public_authors = 0` dopo il cleanup.
- **Accessibilità:** struttura/reflow, contrasto/focus e salto tastiera al contenuto principale sono PASS sulle verifiche automatiche pertinenti.
- Osservatorio: almeno un indicatore navigabile verificato E2E.
- Atlante: almeno un Paese evidence-backed navigabile verificato E2E.
- Rotte: almeno una rotta evidence-backed navigabile verificata E2E; cold-start espone 11 rotte attive.
- Open Data XLSX: risposta valida e archivio XLSX verificato E2E.
- Analytics: aggregazione first-party verificata senza creazione di cookie.
- Connessione lenta: homepage verificata con latenza artificiale e budget richieste/DOMContentLoaded.
- RTL arabo e responsive mobile: verificati senza overflow orizzontale sulle superfici core.

Questi PASS descrivono lo stato del branch/laboratorio locale; **non equivalgono ad attivazione in produzione**.

## B — Subito dopo il go-live

- **#4 — Data Explorer**
- **#11 — Interviste**
- **#14 — Rapporti del Centro Studi**
- **#15 — Working Papers**
- **#16 — Policy Brief**
- **#17 — Dossier tematici**
- **#19 — Bibliografia scientifica**
- **#23 — Monitoraggio mondiale — Radar**
- **#24 — Alert sui dati**
- **#25 — Controllo automatico delle fonti**
- **#27 — Ricerca semantica con AI**
- **#29 — AI per la redazione**
- **#31 — Tutte le altre lingue**
- **#32 — Traduzione assistita AI + revisione umana**
- **#35 — Ricercatori e professori**
- **#42 — Esporta calendario**
- **#43 — Eventi del Centro Studi**
- **#45 — Newsletter settimanale**
- **#52 — API pubblica**
- **#53 — API documentata**
- **#55 — PDF professionali**
- **#56 — Citazione bibliografica**
- **#58 — Versionamento**
- **#60 — Registro delle correzioni**
- **#61 — Livello di affidabilità**
- **#62 — Revisione scientifica**
- **#63 — Osservatorio normativo**
- **#71 — Guide**
- **#74 — Partnership**
- **#76 — Richiesta dati / ricerca**
- **#77 — Sostieni**
- **#81 — LinkedIn**
- **#82 — X**
- **#83 — YouTube**
- **#84 — RSS / Atom**
- **#85 — Dati strutturati Schema.org**
- **#86 — Google Dataset Search**
- **#87 — Google Scholar**
- **#88 — Knowledge Graph**
- **#89 — Pagine generate dalle relazioni**
- **#90 — Timeline**
- **#91 — Mappe GIS**
- **#101 — Ricerca interna come segnale editoriale**
- **#109 — Dataset builder**

## C — Evoluzione futura

- **#12 — Video**
- **#13 — Podcast**
- **#28 — Chiedi al Centro Studi**
- **#37 — Comitato scientifico**
- **#38 — Network internazionale**
- **#39 — Correspondent / referenti Paese**
- **#44 — Conferenza annuale**
- **#46 — Newsletter specialistiche**
- **#47 — Alert personalizzati**
- **#50 — Dashboard personale**
- **#54 — Widget incorporabili**
- **#57 — DOI**
- **#64 — Policy tracker**
- **#65 — Comparatore Paesi**
- **#66 — Sondaggi**
- **#67 — Panel longitudinale**
- **#68 — Questionari**
- **#69 — Calcolatori e strumenti**
- **#70 — Indicatori proprietari**
- **#72 — Webinar**
- **#73 — Materiale didattico**
- **#75 — Progetti di ricerca congiunti**
- **#78 — Sponsorizzazioni**
- **#79 — Rapporti commissionati**
- **#80 — Grant e fondazioni**
- **#102 — Osservatorio predittivo**
- **#103 — Network graph**
- **#104 — Migrant Entrepreneurship Knowledge Base**
- **#105 — Citation graph**
- **#106 — Research Assistant**
- **#107 — Traduzione istantanea dei contenuti storici**
- **#108 — Trascrizione e sottotitoli automatici**
- **#110 — Embeddable Research Cards**

## Gate di rilascio esterni ai 110 punti

La roadmap funzionale non sostituisce i gate tecnici e amministrativi. Anche con la fascia A chiusa, il go-live resta subordinato a:

- revisione finale Privacy / Cookie / Termini e coerenza con i servizi realmente attivi;
- CSP/security headers finali e security QA;
- autorizzazione e applicazione controllata delle migration di produzione;
- verifica definitiva della branch protection e dei required checks effettivamente configurati;
- quality gate finale su dati, responsive, accessibilità e performance;
- merge controllato della PR di integrazione;
- deploy di produzione Netlify, DNS/HTTPS e smoke test live.

## Regola di avanzamento

1. Non lavorare sui punti C finché esistono blocchi A aperti, salvo dipendenze tecniche inevitabili.
2. I punti B già presenti nel codice possono essere mantenuti e corretti, ma non devono rallentare la chiusura della fascia A.
3. Un punto A passa a READY solo quando il suo nucleo è realmente utilizzabile e ha superato il QA pertinente.
4. `main` e produzione restano separati finché tutti i gate di rilascio non sono chiusi.
