# Immigrati Imprenditori — Execution Master

Stato: CANONICO
Data di riferimento: 2026-08-22
Branch di lavoro: `feature/institutional-identity`

## Regola operativa

- Si lavora sul branch di sviluppo; `main` non si modifica finché i gate di pubblicazione non sono chiusi.
- Le funzioni pubbliche devono essere reali e utilizzabili: niente placeholder o promesse di funzioni future.
- Le modifiche strutturali al database vengono preparate come migration e applicate alla produzione solo dopo verifica esplicita.
- Ogni blocco viene chiuso con CI, controllo SEO, sicurezza, accessibilità e responsive quando pertinenti.

## Cronologia esecutiva

| # | Blocco | Stato | Prossima azione |
|---:|---|---|---|
| 0 | Metodo di lavoro / sicurezza progetto | PASS | Regola permanente |
| 1 | Identità Centro Studi | PASS | Rifiniture solo se necessarie |
| 2 | Terminologia istituzionale | PASS | Regola permanente |
| 3 | Identità visiva editoriale | BASE PASS | QA finale su nuove sezioni |
| 4 | Homepage | BASE PASS | Integrare progressivamente nuovi moduli |
| 5 | Navigazione principale | BASE PASS | Consolidare IA completa |
| 6 | Partecipa | BASE PASS | Contributor workspace successivo |
| 7 | Contatti istituzionali | PASS | Mantenere matrice canonica |
| 8 | Privacy / Cookie / Termini | BASE PASS | Revisione legale finale |
| 9 | Social istituzionali | PASS | Distribuzione contenuti |
| 10 | Catalogo lingue DB | PASS | Mantenere catalogo editoriale |
| 11 | 7 lingue prioritarie | PASS | IT EN FR ES DE AR ZH |
| 12 | Multilingua — infrastruttura | IN CORSO | Chiudere routing, switch, RTL, fallback |
| 13 | Multilingua — interfaccia | IN CORSO | Completare pagine pubbliche nelle 7 lingue |
| 14 | Multilingua — traduzioni contenuti | PREPARATO | Applicare modello gruppi/versioni dopo review DB |
| 15 | SEO internazionale | IN CORSO | hreflang, canonical, sitemap, metadata |
| 16 | Osservatorio — struttura | BASE PASS | Ampliare indicatori |
| 17 | Osservatorio — popolamento | IN CORSO | Ampliare dati nel perimetro Atlante approvato |
| 18 | Metodologia | BASE PASS | Glossario e comparabilità |
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
| 29 | Storie e voci | BASE PASS | Biblioteca storie/interviste |
| 30 | Autori | BASE PASS / PROFILI PREPARATI | Applicare identità stabili, bio, affiliazione, ORCID dopo review DB |
| 31 | Fonti | BASE PASS | Catalogo ora limitato alle fonti che sostengono dati pubblici |
| 32 | Glossario scientifico | BASE PASS | Ampliare e tradurre |
| 33 | Rapporti Centro Studi | ARCHITETTURA PREPARATA | Attivare collana solo con un rapporto reale del Centro Studi |
| 34 | Working Papers | ARCHITETTURA PREPARATA | Attivare collana solo con un working paper reale |
| 35 | Policy Brief | ARCHITETTURA PREPARATA | Attivare collana solo con un policy brief reale |
| 36 | Dossier tematici | ARCHITETTURA PREPARATA | Attivare collana solo con un dossier reale |
| 37 | Biblioteca / archivio | BASE PASS | Pubblicazioni pubbliche operative; ampliare metadati |
| 38 | Bibliografia scientifica | BASE PASS | Ampliare con nuovi titoli verificati |
| 39 | Citazioni bibliografiche | BASE PASS | BibTeX + RIS operativi; valutare APA/Chicago |
| 40 | DOI / versionamento | PREPARATO | Schema versioni/correzioni pronto; DOI solo con infrastruttura persistente |
| 41 | Eventi | BASE PASS | Filtri, speaker, materiali |
| 42 | Calendar export | BASE PASS | Rifinire Outlook/Apple |
| 43 | RSS | PASS | Feed generale + ricerca + pubblicazioni + storie + eventi |
| 44 | Ricerca interna | BASE PASS | Filtri/ranking |
| 45 | Ricerca semantica | DA FARE | Semantic search |
| 46 | Chiedi al Centro Studi | DA FARE | RAG con sole fonti verificate |
| 47 | Knowledge Graph | DA FARE | Entità e relazioni |
| 48 | Pagine relazionali automatiche | DA FARE | Dopo Knowledge Graph |
| 49 | Timeline | DA FARE | Paese/tema/indicatore/rotta |
| 50 | Contributor account | DA FARE | Bozze e stato proposte |
| 51 | Profili contributor | DA FARE | Ricercatori/esperti/enti |
| 52 | Workflow redazionale | IN CORSO | Assegnazione/revisione/versioni |
| 53 | Radar internazionale | IN CORSO | Fonti/parser/affidabilità |
| 54 | Alert nuove fonti/dataset | DA FARE | Dopo Radar |
| 55 | Controllo automatico fonti | DA FARE | Link/metodologia/aggiornamenti |
| 56 | AI per redazione | DA FARE | Riassunti/classificazione/estrazione |
| 57 | Traduzione assistita AI | DA FARE | Automatica → revisione → pubblicazione |
| 58 | Trascrizioni/sottotitoli | DA FARE | Audio/video multilingua |
| 59 | Newsletter | DA FARE | Newsletter generale |
| 60 | Newsletter tematiche | DA FARE | Paese/tema/settore |
| 61 | Alert personalizzati | DA FARE | Preferenze account |
| 62 | API pubblica | BASE PASS | `/api/v1` operativo; rate limit prima del go-live |
| 63 | API docs | BASE PASS | Estendere esempi e contratti endpoint |
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
| 74 | Video / YouTube | CANALE PRONTO | Format editoriali |
| 75 | Podcast | DA FARE | Audio + trascrizioni |
| 76 | Sostieni Centro Studi | BASE PASS | Attivare pagamenti solo quando pronti |
| 77 | Donazioni / pagamenti | DA FARE | Dopo verifica amministrativa |
| 78 | Sponsorizzazioni / commissioned research | DA FARE | Governance e trasparenza |
| 79 | Analytics privacy-friendly | DA FARE | Prima del go-live |
| 80 | Accessibilità WCAG 2.2 AA | BASE | Audit reale prima del go-live |
| 81 | Responsive reale | BASE | QA desktop/tablet/mobile |
| 82 | Performance | DA FARE | Lighthouse/caching/bundle |
| 83 | Security headers/CSP | IN CORSO | CSP definitiva |
| 84 | Rate limiting persistente | BLOCKER | Form/login/API |
| 85 | Leaked Password Protection | BLOCKER | Supabase |
| 86 | Hardening form pubblico | PREPARATO | Migration da applicare dopo verifica |
| 87 | MFA amministratori | DA FARE | Prima del go-live |
| 88 | Audit log | DA FARE | Tracciare azioni editoriali |
| 89 | Backup / recovery | DA FARE | Piano DB/media/documenti |
| 90 | Test E2E | BLOCKER | Ruoli/login/contributi/pubblicazione |
| 91 | Branch protection | BLOCKER | Prima del merge |
| 92 | Registro correzioni | PREPARATO | Schema predisposto; pagina pubblica solo con avvisi reali |
| 93 | Quality gate finale | BLOCKER | SEO/security/a11y/responsive/dati/legale |
| 94 | Merge PR → main | BLOCCATO | Solo dopo gate |
| 95 | Go-live completo | BLOCCATO | Ultimo passo |

## Sequenza vincolante

1. **12–15** — multilingua e SEO internazionale.
2. **16–27** — Osservatorio, dati, Paesi, settori, rotte, Atlante.
3. **28–43** — ricerca, storie, fonti, pubblicazioni, eventi.
4. **44–58** — ricerca avanzata, Radar, AI, Knowledge Graph.
5. **59–78** — newsletter, API, network, partnership, sostegno.
6. **79–95** — analytics, accessibilità, performance, sicurezza, E2E, production gate, merge, go-live.

Questa sequenza è il riferimento operativo master. Ogni cambio di priorità va registrato qui, non gestito implicitamente.
