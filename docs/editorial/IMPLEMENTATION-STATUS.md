# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Checkpoint operativo della roadmap canonica `ROADMAP.md`, aggiornato al 19/08/2026. In sviluppo la produzione Vercel non è un gate: valgono Supabase sano, CI verde e Preview quando disponibile. `main` resta intatto fino a decisione esplicita di chiusura.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sezioni pubbliche e redazionali materializzate. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione, territorio e rotte globali. |
| 4. Modello dati v1 | **LIVE VERIFIED / PASS** | Modello editoriale applicato su Supabase reale con RLS; migrazioni repository riallineate alla cronologia applicata. |
| 5. Scrivania redazionale | **PASS** | Inbox, triage, assegnazione, priorità, dashboard e audit attività. |
| 6. Contribuisci | **FUNCTIONAL PASS** | Invio occasionale anonimo + contributore autenticato con read-own + area personale + UI amministrativa invito/abilitazione/revoca. Resta solo smoke di consegna email con un collaboratore reale. |
| 7. Storie e interviste | **PLATFORM PASS / INTERVIEWS PENDING** | Workflow privato candidato→contatto→intervista→fact-check→approvazione; consensi separati per pubblicazione/citazioni/immagini/video, RLS editor-only. Tutti i tre slot Voce del Numero zero hanno candidati verificati; le interviste reali restano da svolgere. |
| 8. Osservatorio v1 | **PASS V1** | Eurostat, InfoCamere/Futurae e confronto OECD; fonte, periodo, unità, metodologia e aggiornamento pubblici. Relazione strutturata contenuto↔indicatore aggiunta. |
| 9. Rapporti e ricerche | **PASS V1** | Metadata biblioteca strutturati + prime schede InfoCamere/Futurae e OECD. |
| 10. Eventi | **PASS V1** | Futuro/passato, fusi, all-day, collegamenti contenuti; One Way Summit 2026 pubblicato come primo evento qualificato. |
| 11. Radar mondiale | **FUNCTIONAL DEV PASS / CONTENT EXPANSION** | Comando manuale redazionale dry-run/import max 50; GDELT + Crossref + DataCite; dedupe e Inbox; nessuna auto-pubblicazione. Cron produzione rinviato al go-live. |
| 12. Fonti e metodologia | **PASS V1** | Registro fonti e distinzione pubblica tra fonti di discovery e fonti di evidenza. |
| 13. Identità visiva | **V1 PASS** | Bianco/nero/grigi, niente gradienti o effetti decorativi. |
| 14. Home | **V1 PASS** | Home editoriale Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING EXTERNAL** | LinkedIn, X e YouTube richiedono account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta e prudenziale: nessun pagamento attivo e nessuna promessa fiscale finché canale, trattamento amministrativo e formule fiscali non sono verificati. |
| 17. Identità AIPEL | **PASS V1** | Denominazione completa, forma associativa, sede legale, CF, P.IVA, presidente/direzione e contatto istituzionale pubblicati in modo coerente. |
| 18. SEO | **TECHNICAL V1 PASS** | Metadata, sitemap, robots, route canoniche e redirect; `/privacy` aggiunta alle route pubbliche. Multilingua successivo. |
| 19. Qualità/privacy/sicurezza | **PRIVACY V1 + ACCOUNT DELETION PASS / LAUNCH GATE PENDING** | CI, RLS e backend verificati; privacy v1 collegata ai form; cancellazione account self-service post-split con guardia ultimo amministratore. Restano verifica finale fornitori/trasferimenti e Leaked Password Protection. |
| 20. Lancio editoriale | **ANALYTICAL CORE READY / VOICE CANDIDATES READY / INTERVIEWS PENDING** | Tutti i 7 contenuti analitici sono `ready` e non pubblicati; i 3 slot Voci hanno candidati verificati e richiedono interviste originali reali. |

## Ultimi gate verificati

- Supabase `immigratiimprenditori`: `ACTIVE_HEALTHY`, PostgreSQL 17.6.
- Form pubblico anonimo via RPC: PASS con rollback.
- RLS amministratore Inbox + audit trigger: PASS con rollback.
- Contributor read-own: 1 propria / 0 altrui — PASS con rollback.
- `provision_contributor_account` / revoca ruolo: smoke transazionale PASS, zero ruoli di test residui.
- Commit `a1fda60`: CI #106 PASS — gestione inviti contributori.
- Commit `d8c64ce`: CI #107 PASS — Radar manuale redazionale.
- Commit `c990868`: CI #108 PASS — Crossref/DataCite + Radar multi-sorgente.
- Commit `c4aaade`: CI #116 PASS — workflow privato interviste e consensi.
- Commit `51405fb`: CI #117 PASS — collegamenti Numero zero ↔ Osservatorio.
- Commit `504b96e`: CI #119 PASS — identità AIPEL e pagina Sostieni.
- Commit `229c69d` + `bcf6579`: migrazioni 20/08 riallineate alla cronologia Supabase; CI #121 PASS.
- Commit `62d8109`: privacy v1 e identità AIPEL completa; CI #122 PASS.
- Migrazione `20260819181358_self_service_account_deletion_post_split`: applicata; preflight del solo amministratore attivo → `last_application_admin`, `can_proceed=false` — PASS senza modifiche dati.
- Migrazione `20260819182441_harden_self_delete_execute_privileges`: `anon EXECUTE=false`, `authenticated EXECUTE=true` per entrambe le RPC.
- CI #129 PASS — pagina/account deletion; CI #130 PASS — hardening privilegi sul relativo head.
- Vercel Preview aveva già completato con SUCCESS sull'head `e4e7fb9`; la produzione non è richiesta durante lo sviluppo.

## Numero zero — nucleo analitico

Sette contenuti sono `editorial_status=ready` e restano `publication_status=unpublished`: L1 Lombardia, I1 Italia, I2 Futurae/InfoCamere, A2 italiani all'estero, E1 confronto europeo, E2 Action Plan UE e M1 OECD. L1/I1/I2/E1/M1 sono collegati agli indicatori dell'Osservatorio dove metodologicamente pertinente. M1 non descrive il perimetro OECD come dato mondiale; A2 usa una source map e non somma definizioni incompatibili.

## Storie e interviste — workflow privato

`content_interview_workflow` gestisce candidatura/origine, primo contatto, programmazione, intervista, fact-check, consensi separati per pubblicazione/citazioni/immagini/video e note interne minimizzate. RLS attiva, nessun `SELECT` anonimo.

Candidati prioritari già in Inbox: Agie Hujian Zhou / Ravioleria Sarpi (L2); Paolo Privitera e Gianni Chiloiro + Angelo Sannino / Doppio Zero (A1); Adeola Adedewe / Kredete (M2); Semyon Dukach / One Way Ventures come riserva M2. Nessun messaggio è stato inviato automaticamente.

## Privacy operativa v1

La route `/privacy` descrive il trattamento effettivamente implementato per dati tecnici/sicurezza, account, invii `Contribuisci`, workflow privato delle interviste e ricerca editoriale su fonti pubbliche. Identifica AIPEL e il contatto `info@immigratiimprenditori.it`, esplicita finalità, basi giuridiche, destinatari, conservazione, diritti, assenza di decisioni automatizzate e cookie tecnici di sessione.

La cancellazione account è self-service nel perimetro post-split: `/app/account` esegue una preflight sul solo account autenticato; l'ultimo amministratore attivo è bloccato; la conferma richiede `ELIMINA`; la RPC revoca i ruoli e chiude l'Account; il server elimina lo stesso utente Supabase Auth con `service_role` server-side. Profili e materiali editoriali restano soggetti a separata richiesta privacy/valutazione di conservazione.

Prima del go-live restano da verificare in via definitiva i fornitori tecnici, gli eventuali trasferimenti extra-SEE e le garanzie contrattuali applicabili.

## Radar mondiale — regola operativa

Il Radar scopre candidati e li porta nella Inbox. Non pubblica mai automaticamente. GDELT è discovery web/notizie; Crossref e DataCite forniscono metadati; il redattore può fare dry-run o importare al massimo 50 URL nuovi per esecuzione. Il cron produzione può attendere il go-live.

## Nucleo Osservatorio

Tre famiglie restano separate: Eurostat `lfsa_esgan` (persone/LFS); InfoCamere/Futurae (imprese straniere registrate, Italia `678.004` e Lombardia `135.249` al 30/06/2025); OECD 2022 (self-employment per luogo di nascita). `content_observatory_indicator_links` collega formalmente contenuti e indicatori quando pertinente.

## Riconciliazione migrazioni — PASS

Le sette migrazioni `20260820100000` → `20260820160000` sono presenti nel repository e riallineate alla cronologia applicata; non sono state rieseguite. Il confronto ha corretto tre refusi `acccess_*` nella `20260820110000` e la tautologia `market_id = market_id` nella `20260820130000`; le altre cinque erano già coerenti.

## Advisor Supabase

- `submit_editorial_contribution`: warning `SECURITY DEFINER` intenzionale; è il confine controllato del form pubblico e `anon` non ha DML diretto sulle tabelle.
- `access_self_delete_preflight` e `access_self_close_account`: warning `SECURITY DEFINER` per `authenticated` intenzionale; entrambe sono vincolate a `auth.uid()`. Hardening verificato: `anon` non ha EXECUTE.
- Leaked Password Protection: da attivare/verificare prima del lancio; il connettore Supabase disponibile non espone la modifica della configurazione Auth.
- Nessuna rimozione automatica di indici `unused` in fase di basso traffico.

## Regola di merge

PR #7 resta Draft. Nessun merge su `main` durante la costruzione. Il gate di sviluppo richiede CI verde e backend verificato; produzione Vercel, cron definitivo, verifica finale privacy/fornitori e configurazioni esterne vengono chiusi al go-live.
