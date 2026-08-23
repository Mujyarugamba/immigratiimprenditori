# Immigrati Imprenditori — Execution Master

Stato: CANONICO
Data di riferimento: 2026-08-22
Ultima verifica tecnica: 2026-08-23
Branch di lavoro attuale: `feature/research-radar-ai-knowledge-20260822`
Base di integrazione: `feature/institutional-identity`

## Regola operativa

- Si lavora sul branch di sviluppo; `main` non si modifica finché i gate di pubblicazione non sono chiusi.
- Le funzioni pubbliche devono essere reali e utilizzabili: niente placeholder o promesse di funzioni future.
- Le modifiche strutturali al database vengono preparate come migration, validate nel laboratorio Supabase locale effimero e applicate alla produzione solo dopo verifica/autorizzazione esplicita.
- Nessun branch Supabase hosted a pagamento viene creato se la validazione locale è sufficiente; la parità hosted si rivaluta solo nel pre-release se necessaria.
- Ogni blocco viene chiuso con CI, controllo SEO, sicurezza, accessibilità e responsive quando pertinenti.

## Cronologia esecutiva

| # | Blocco | Stato | Prossima azione |
|---:|---|---|---|
| 0 | Metodo di lavoro / sicurezza progetto | PASS | Regola permanente |
| 1 | Identità Centro Studi | PASS | Rifiniture solo se necessarie |
| 2 | Terminologia istituzionale | PASS | Regola permanente |
| 3 | Identità visiva editoriale | PASS | Solo QA umano finale desktop/tablet/mobile prima del go-live |
| 4 | Homepage | PASS | Popolare progressivamente con contenuti reali; nessun placeholder fittizio |
| 5 | Navigazione principale | BASE PASS | Consolidare IA completa |
| 6 | Partecipa | BASE PASS | Integrare pienamente con area contributore |
| 7 | Contatti istituzionali | PASS | Mantenere matrice canonica |
| 8 | Privacy / Cookie / Termini | BASE PASS | Revisione legale finale |
| 9 | Social istituzionali | CONFIG PASS / PROFILI ESTERNI PENDING | LinkedIn, X, YouTube restano disabilitati finché URL reali non verificati |
| 10 | Catalogo lingue DB | PASS | Mantenere catalogo editoriale |
| 11 | 7 lingue prioritarie | PASS | IT EN FR ES DE AR ZH |
| 12 | Multilingua — infrastruttura | PASS — CORE VERIFIED | Routing, switch, `lang`/`dir`, RTL e matrice core verificati |
| 13 | Multilingua — interfaccia | GO-LIVE CORE PASS — 70/70 | 7 lingue × 10 superfici core verificate sul vero stack locale; ampliare contenuti reali nel tempo |
| 14 | Multilingua — traduzioni contenuti | PREPARATO / LOCAL DB PASS | Attivare modello gruppi/versioni solo dopo decisione production |
| 15 | SEO internazionale | PASS — FOUNDATION / BROWSER VERIFIED | Hreflang/canonical verificati; mantenere sitemap/noindex preview e QA finale |
| 16 | Osservatorio — struttura | GO-LIVE CORE PASS — E2E | Superficie reale + almeno un indicatore navigabile verificati; ampliare indicatori nel tempo |
| 17 | Osservatorio — popolamento | GO-LIVE CORE PASS / EXPANSION IN CORSO | Base reale sufficiente al numero zero; ampliare dati nel perimetro approvato |
| 18 | Metodologia | PASS | Ampliare glossario/comparabilità solo con nuove esigenze reali |
| 19 | Data Explorer | BASE PASS | Filtri e grafici avanzati |
| 20 | Open Data | GO-LIVE CORE PASS | JSON, CSV e XLSX operativi; dataset builder resta post-go-live |
| 21 | Download dati | GO-LIVE PASS — JSON/CSV/XLSX | Mantenere contratti export; dataset builder separato |
| 22 | Territori | BASE PASS | Applicare/popolare dataset territoriali verificati |
| 23 | Schede Paese | GO-LIVE CORE PASS — E2E | Almeno un Paese evidence-backed navigabile verificato; ampliare copertura reale |
| 24 | Settori economici | BASE PASS | Applicare dati settoriali verificati |
| 25 | Rotte imprenditoriali | GO-LIVE CORE PASS — 11 ROUTES / E2E | 11 rotte attive con evidenze Futurae/InfoCamere/Unioncamere nel cold-start; ampliare solo con fonti verificate |
| 26 | Atlante mondiale | GO-LIVE CORE PASS — E2E | Superficie reale e Paese evidence-backed verificati; ampliare senza superare perimetro approvato |
| 27 | GIS / mappe quantitative | BASE PASS | QA cartografico e nuovi indicatori compatibili |
| 28 | Analisi e ricerche | BASE PASS | Filtri, autori, raccolte |
| 29 | Storie e voci | **BLOCCANTE — CONTENUTO REALE MANCANTE** / SHORTLIST READY | Pubblicare almeno una storia/intervista/testimonianza reale; nessun contenuto fittizio o riclassificazione artificiale |
| 30 | Autori | **GO-LIVE FUNCTION READY — FULL E2E** | MFA AAL2, profilo privato, attribuzione, evidence gate, pubblicazione e cleanup verificati; popolare solo identità reali quando esistono |
| 31 | Fonti | PASS | Registro evidence-gated; mantenere fonte → dati → copertura → periodicità → metodo/limiti |
| 32 | Glossario scientifico | BASE PASS | Ampliare e tradurre |
| 33 | Rapporti Centro Studi | ARCHITETTURA PREPARATA | Attivare collana solo con un rapporto reale del Centro Studi |
| 34 | Working Papers | ARCHITETTURA PREPARATA | Attivare collana solo con un working paper reale |
| 35 | Policy Brief | ARCHITETTURA PREPARATA | Attivare collana solo con un policy brief reale |
| 36 | Dossier tematici | ARCHITETTURA PREPARATA | Attivare collana solo con un dossier reale |
| 37 | Biblioteca / archivio | BASE PASS | Pubblicazioni pubbliche operative; ampliare metadati |
| 38 | Bibliografia scientifica | BASE PASS | Ampliare con nuovi titoli verificati |
| 39 | Citazioni bibliografiche | BASE PASS | BibTeX + RIS operativi; valutare APA/Chicago |
| 40 | DOI / versionamento | PREPARATO / LOCAL DB PASS | Schema versioni/correzioni validato localmente; DOI solo con infrastruttura persistente |
| 41 | Eventi | BASE PASS | Filtri, speaker, materiali |
| 42 | Calendar export | BASE PASS | Rifinire Outlook/Apple |
| 43 | RSS | PASS | Feed generale + ricerca + pubblicazioni + storie + eventi |
| 44 | Ricerca interna | BASE PASS AVANZATO | Ranking per pertinenza + filtri tipo/anno; ampliare entità indicizzate |
| 45 | Ricerca semantica | ARCHITETTURA PREPARATA / LOCAL DB PASS | pgvector/search_documents validati localmente; indicizzare solo dopo decisione production |
| 46 | Chiedi al Centro Studi | RETRIEVAL FOUNDATION | Endpoint contesto verificabile operativo; generazione AI resta disattivata finché RAG non è validato |
| 47 | Knowledge Graph | BASE PASS | Grafo pubblico derivato da evidenze operative; schema persistente preparato |
| 48 | Pagine relazionali automatiche | BASE PASS | `/relazioni` operativo su Paesi, indicatori, settori e rotte documentati |
| 49 | Timeline | BASE PASS | Vista integrata operativa; ampliare filtri Paese/tema/rotta |
| 50 | Contributor account | AUTH + BROWSER E2E PASS | Login password reale, provisioning, proposta personale e separazione contributore/redattore verificati nel laboratorio locale |
| 51 | Profili contributor | BASE PASS | Editor profilo privato/pubblico + pagina pubblica evidence-gated; ampliare attribuzioni |
| 52 | Workflow redazionale | IN CORSO AVANZATO | Assegnazione a sé, stati e cronologia attività; completare versioni/review |
| 53 | Radar internazionale | IN CORSO AVANZATO | Core Radar review-only + sorgente EMN UE; continuare qualità parser/fonti |
| 54 | Alert nuove fonti/dataset | ARCHITETTURA PREPARATA / LOCAL DB PASS | Tabelle/regole private validate localmente; attivare solo dopo decisione production |
| 55 | Controllo automatico fonti | SCRIPT/WORKFLOW PREPARATI | Validare al primo run schedulato/esterno utile |
| 56 | AI per redazione | ARCHITETTURA PREPARATA / LOCAL DB PASS | Audit provider/modello/prompt/review pronto; nessun output pubblico automatico |
| 57 | Traduzione assistita AI | ARCHITETTURA PREPARATA / LOCAL DB PASS | Coda machine draft → human review → approved; attivare solo dopo decisione production |
| 58 | Trascrizioni/sottotitoli | ARCHITETTURA PREPARATA / LOCAL DB PASS | Asset transcript/subtitle con human review; attivare quando esistono media reali |
| 59 | Newsletter | DA FARE | Newsletter generale |
| 60 | Newsletter tematiche | DA FARE | Paese/tema/settore |
| 61 | Alert personalizzati | DA FARE | Preferenze account |
| 62 | API pubblica | BASE PASS / HARDENING API PASS | `/api/*` limitata su Netlify a 60 req/min per IP+dominio; indicatori paginati con default 500 e massimo 1.000; mantenere QA prima go-live |
| 63 | API docs | BASE PASS | Documentati endpoint dati, Atlas, contesto e grafo; estendere contratti |
| 64 | Widget incorporabili | DA FARE | Grafici e indicatori embed |
| 65 | Dataset Builder | DA FARE | Export personalizzato |
| 66 | Network ricercatori | DA FARE | Research Network |
| 67 | Comitato scientifico | DA FARE | Solo quando costituito realmente |
| 68 | Referenti Paese | DA FARE | Network territoriale |
| 69 | Partnership | DA FARE | Università/fondazioni/istituzioni |
| 70 | Progetti di ricerca congiunti | DA FARE | Bandi e ricerche |
| 71 | Survey / ricerca primaria | DA FARE | Questionari scientifici |
| 72 | Panel longitudinale | DA FARE | Ricerca longitudinale |
| 73 | Indicatori proprietari | DA FARE | Solo con metodologia robusta |
| 74 | Video / YouTube | CANALE PREPARATO / ACCOUNT PENDING | Format editoriali; nessun profilo pubblico finché non verificato |
| 75 | Podcast | DA FARE | Audio + trascrizioni |
| 76 | Sostieni Centro Studi | PAGE PASS / PAYMENTS DISABLED | Attivare checkout solo dopo verifica amministrativa |
| 77 | Donazioni / pagamenti | INTENTIONALLY DISABLED | Provider, conto, dati amministrativi e formulazione fiscale prima dell'attivazione |
| 78 | Sponsorizzazioni / commissioned research | DA FARE | Governance e trasparenza |
| 79 | Analytics privacy-friendly | LOCAL/CI PASS — COOKIELESS | Aggregazione first-party senza cookie verificata E2E; attivazione production separata |
| 80 | Accessibilità WCAG 2.2 AA | AUTOMATED CORE + CONTRAST + KEYBOARD PASS / HUMAN QA PENDING | Struttura, reflow, contrasto/focus e skip-link verificati; audit umano completo ancora necessario |
| 81 | Responsive reale | BROWSER PASS — 320/390/768 | Reflow e navigazione mobile verificati automaticamente; resta QA umano su dispositivi reali |
| 82 | Performance | SLOW-NETWORK CORE PASS / LIGHTHOUSE PENDING | Homepage passa test high-latency; completare Lighthouse/caching/bundle nel pre-release |
| 83 | Security headers/CSP | HEADERS PASS / FINAL CSP QA PENDING | Header di sicurezza coperti dallo smoke; chiudere CSP definitiva nel pre-release |
| 84 | Rate limiting persistente | API + FORM + LOGIN LOCAL/CI PASS | API Netlify e limiti DB/form verificati; login persistente verificato lato DB e browser, activation production separata |
| 85 | Leaked Password Protection | FREE UNAVAILABLE / PRIVILEGED MFA MITIGATION PASS LOCAL/CI | Funzione Supabase non disponibile sul piano Free; redattori/admin protetti da TOTP obbligatorio, activation production separata |
| 86 | Hardening form pubblico | PREPARATO / LOCAL DB PASS | Chiavi rate-limit solo SHA-256 e sesto invio respinto nel smoke; production activation separata |
| 87 | MFA amministratori | LOCAL/CI PASS — TOTP + AAL2 ENFORCED | Enrollment/challenge/verify reali, redattore AAL1 negato e AAL2 persistito su nuove richieste; activation production separata |
| 88 | Audit log | LOCAL/CI PASS | Activity log e policy insert validate nel cold-start; activation production separata |
| 89 | Backup / recovery | WORKFLOW + ARCHIVE INTEGRITY LOCAL/CI PASS | PostgreSQL 17 dump/restore + cifratura/retention predisposti; configurare secret e run production solo nel pre-release autorizzato |
| 90 | Test E2E | LOCAL/CI PASS — 19 PASS / UNICO GATE ROSSO: STORIE | Auth, MFA, autori, rate limit, superfici pubbliche, a11y, lingue, RTL, responsive, XLSX, analytics e rete lenta passano; resta solo contenuto reale Storie |
| 91 | Branch protection | MAIN PROTECTED / REQUIRED CHECKS OFF | `main` è protected, ma required status checks risultano `enforcement_level: off` e senza context/check; decisione di governance pre-release |
| 92 | Registro correzioni | PREPARATO / LOCAL DB PASS | Schema validato localmente; pagina pubblica solo con avvisi reali |
| 93 | Quality gate finale | BLOCKER | Chiudere Storie reali, QA umano WCAG/device, performance/Lighthouse, legal e gate production |
| 94 | Merge PR → main | BLOCCATO | Solo dopo gate; PR #9 resta draft |
| 95 | Go-live completo | BLOCCATO | Ultimo passo, dopo autorizzazione production |

## Verifica sicurezza/autenticazione — 2026-08-22

- Commit `7f3a39a70bca4f728442855a85ed3fc2f72fbbb3`: `Editorial v1 CI` e `Supabase local migration validation` completamente PASS.
- Cold-start standalone, lint PostgreSQL, publication/RLS security smoke, persistent rate-limit smoke e build applicativa contro Supabase locale: PASS.
- Auth integration smoke: login password reale, provisioning account, JWT/RPC, separazione `contributore`/`redattore`, divieto di auto-elevazione, proposta contributore + RLS e negazione privilegi redattore ad AAL1: PASS.
- Browser E2E autenticato: contributor login → propria proposta → redazione negata; redattore password → MFA TOTP → sessione AAL2 persistita su nuova richiesta → creazione contenuto → ready → pubblicazione → pagina pubblica: PASS.
- Browser E2E login throttling: primi tentativi invalidi gestiti come credenziali errate e soglia successiva bloccata dal rate limiter persistente: PASS.
- TOTP locale è abilitato esplicitamente nel laboratorio CI; nessun default implicito viene assunto.
- Cleanup utenti/account/proposte/contenuti effimeri: PASS; nessuna identità di test conservata.
- `main` risulta protetto. I required status checks non sono attualmente imposti e non vengono modificati in questo ciclo.
- Nessuna migration è stata applicata al database production; nessun merge e nessun deploy production sono stati eseguiti.

## Verifica go-live A — 2026-08-23

Codice verificato: `764ab1fac82aa61361fc00d7e7fbeb5a9cc1e94a`.

- `Editorial v1 CI` run `32620148591`: **SUCCESS completo**, inclusi typecheck, unit/contract test, source gate, dependency audit, Auth guard, build, HTTP smoke e browser pubblico.
- `Supabase local migration validation` run `32620148584`: cold-start, DB lint, RLS/security, rate limiting, audit+analytics, backup, Auth e build **PASS**.
- Browser laboratorio: **19 PASS / 1 FAIL**. L'unico failure è il gate Storie perché non esiste ancora una storia/intervista/testimonianza reale pubblicata.
- Ciclo autore completo: redattore AAL2 → contenuto pubblicato → autore privato → attribuzione → evidence gate → profilo pubblico → pagina autore → cleanup: **PASS**.
- Accessibilità automatica: skip link visibile al primo Tab, outline non nullo e trasferimento focus al contenuto principale con Invio: **PASS**.
- Osservatorio, Atlante e Rotte vengono verificati prima dell'assert sulle Storie e passano: indicatore navigabile, Paese evidence-backed e rotta evidence-backed presenti.
- Cold-start: 34 territori attivi e 11 rotte attive; evidenze Futurae collegate alle rotte.
- Open Data XLSX valido; analytics cookie-less; homepage high-latency; RTL arabo; accessibilità strutturale; reflow 320/390/768 e navigazione mobile: PASS.
- Nessuna di queste verifiche attiva automaticamente produzione: database live, secrets, backup schedulato, MFA production e analytics production restano separati fino ad autorizzazione.

## Roadmap A sintetica

- **READY: 31/33**
- **DA RIFINIRE: 1/33 — #92 WCAG 2.2 AA, QA umano finale**
- **BLOCCANTE CONTENUTO REALE: 1/33 — #10 Storie d'impresa**

#36 Profili autore è ora READY funzionalmente: l'assenza di autori reali nel cold-start è intenzionale e non va colmata con identità fittizie.

## Sequenza vincolante

1. **12–15** — multilingua e SEO internazionale.
2. **16–27** — Osservatorio, dati, Paesi, settori, rotte, Atlante.
3. **28–43** — ricerca, storie, fonti, pubblicazioni, eventi.
4. **44–58** — ricerca avanzata, Radar, AI, Knowledge Graph.
5. **59–78** — newsletter, API, network, partnership, sostegno.
6. **79–95** — analytics, accessibilità, performance, sicurezza, E2E, production gate, merge, go-live.

Questa sequenza è il riferimento operativo master. Ogni cambio di priorità va registrato qui, non gestito implicitamente.
