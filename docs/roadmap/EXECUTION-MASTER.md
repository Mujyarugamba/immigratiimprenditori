# Immigrati Imprenditori — Execution Master

Stato: CANONICO
Data di riferimento: 2026-08-22
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
| 12 | Multilingua — infrastruttura | IN CORSO | Chiudere routing, switch, RTL, fallback |
| 13 | Multilingua — interfaccia | IN CORSO | Completare pagine pubbliche nelle 7 lingue |
| 14 | Multilingua — traduzioni contenuti | PREPARATO / LOCAL DB PASS | Attivare modello gruppi/versioni solo dopo decisione production |
| 15 | SEO internazionale | PASS — FOUNDATION | Mantenere hreflang/canonical/sitemap/noindex preview; QA finale prima del go-live |
| 16 | Osservatorio — struttura | BASE PASS | Ampliare indicatori |
| 17 | Osservatorio — popolamento | IN CORSO | Ampliare dati nel perimetro Atlante approvato |
| 18 | Metodologia | PASS | Ampliare glossario/comparabilità solo con nuove esigenze reali |
| 19 | Data Explorer | BASE PASS | Filtri e grafici avanzati |
| 20 | Open Data | BASE PASS | XLSX e dataset builder |
| 21 | Download dati | IN CORSO | XLSX, dataset builder |
| 22 | Territori | BASE PASS | Applicare/popolare dataset territoriali verificati |
| 23 | Schede Paese | BASE PASS | Ampliare evidenze reali per i 20 Paesi |
| 24 | Settori economici | BASE PASS | Applicare dati settoriali verificati |
| 25 | Rotte imprenditoriali | BASE PASS / DATI PREPARATI | Applicare dataset rotte dopo review DB |
| 26 | Atlante mondiale | BASE PASS | Ampliare copertura senza superare perimetro approvato |
| 27 | GIS / mappe quantitative | BASE PASS | QA cartografico e nuovi indicatori compatibili |
| 28 | Analisi e ricerche | BASE PASS | Filtri, autori, raccolte |
| 29 | Storie e voci | BASE PASS / SHORTLIST READY | Nessun outreach ora; scelta candidati solo nel pre-lancio |
| 30 | Autori | BASE PASS / PROFILI PREPARATI | Applicare identità stabili, bio, affiliazione, ORCID dopo decisione production |
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
| 50 | Contributor account | AUTH INTEGRATION PASS / BROWSER QA PENDING | Login password reale, provisioning, separazione contributore/redattore, JWT/RPC, proposta e RLS verificati nel laboratorio locale; resta E2E browser autenticato |
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
| 79 | Analytics privacy-friendly | DA FARE | Prima del go-live |
| 80 | Accessibilità WCAG 2.2 AA | BASE | Audit reale prima del go-live |
| 81 | Responsive reale | BASE | QA umano desktop/tablet/mobile |
| 82 | Performance | DA FARE | Lighthouse/caching/bundle |
| 83 | Security headers/CSP | IN CORSO | CSP definitiva |
| 84 | Rate limiting persistente | API PASS / FORM LOCAL PASS / LOGIN PENDING | API Netlify 60 req/min PASS; form DB 5 invii/ora per email e 200/ora globali validato localmente; chiudere protezione login prima go-live |
| 85 | Leaked Password Protection | NON DISPONIBILE SU FREE / TOTP MITIGATION | Funzione Supabase non disponibile sul piano Free; mitigazione prevista con MFA TOTP, da rendere obbligatoria prima go-live |
| 86 | Hardening form pubblico | PREPARATO / LOCAL DB PASS | Chiavi rate-limit solo SHA-256 e sesto invio respinto nel smoke; production activation separata |
| 87 | MFA amministratori | TOTP PREPARATA / VERIFY PASS / ENFORCEMENT PENDING | Enrollment, challenge e verify reali Supabase verificati; rendere obbligatoria per redattori/admin solo dopo QA anti-lockout |
| 88 | Audit log | BASE / LOCAL DB PASS | Inbox activity presente; policy insert validata localmente, activation production separata |
| 89 | Backup / recovery | DA FARE | Piano DB/media/documenti |
| 90 | Test E2E | AUTH INTEGRATION PASS / BROWSER AUTH BLOCKER | Auth/API locale reale PASS; resta il vero browser E2E autenticato per ruoli/login/contributi/pubblicazione |
| 91 | Branch protection | BLOCKER | Prima del merge |
| 92 | Registro correzioni | PREPARATO / LOCAL DB PASS | Schema validato localmente; pagina pubblica solo con avvisi reali |
| 93 | Quality gate finale | BLOCKER | Security/a11y/responsive/performance/dati/legale |
| 94 | Merge PR → main | BLOCCATO | Solo dopo gate |
| 95 | Go-live completo | BLOCCATO | Ultimo passo |

## Verifica sicurezza/autenticazione — 2026-08-22

- Commit `43a3f46b0ab25ae13dc02830676893722fa74fed`: `Editorial v1 CI` completamente PASS, inclusi HTTP smoke e Public browser E2E Chromium.
- Commit `f6a0cb8674b0373b5a1016375cd17b24aa5102fd`: `Supabase local migration validation` completamente PASS su stack locale effimero completo.
- Cold-start standalone, lint PostgreSQL, publication/RLS security smoke e persistent rate-limit smoke: PASS.
- Auth integration smoke: login password reale, provisioning account, JWT/RPC, separazione `contributore`/`redattore`, divieto di auto-elevazione, proposta contributore + RLS: PASS.
- Cleanup utenti/account/proposta effimeri: PASS; nessuna identità di test conservata.
- Il workflow Supabase è esposto anche sulle pull request per poter diventare in seguito un required check; la branch protection non è ancora attivata.
- Nessuna migration è stata applicata al database production; nessun merge e nessun deploy production sono stati eseguiti.

## Sequenza vincolante

1. **12–15** — multilingua e SEO internazionale.
2. **16–27** — Osservatorio, dati, Paesi, settori, rotte, Atlante.
3. **28–43** — ricerca, storie, fonti, pubblicazioni, eventi.
4. **44–58** — ricerca avanzata, Radar, AI, Knowledge Graph.
5. **59–78** — newsletter, API, network, partnership, sostegno.
6. **79–95** — analytics, accessibilità, performance, sicurezza, E2E, production gate, merge, go-live.

Questa sequenza è il riferimento operativo master. Ogni cambio di priorità va registrato qui, non gestito implicitamente.
