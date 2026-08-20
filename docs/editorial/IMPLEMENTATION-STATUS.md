# Immigrati Imprenditori — Stato di implementazione

Branch di lavoro: `editorial-desk-v1`.

Checkpoint operativo della roadmap canonica `ROADMAP.md`, aggiornato al 20/08/2026. In sviluppo la produzione Vercel non è un gate: valgono Supabase sano, CI verde e Preview quando disponibile. `main` resta intatto fino a decisione esplicita di chiusura.

| Fase | Stato | Nota |
| --- | --- | --- |
| 1. Fondazione editoriale | **PASS** | Progetto editoriale canonico. |
| 2. Architettura informazione | **PASS** | Sezioni pubbliche e redazionali materializzate. |
| 3. Tassonomie internazionali | **PASS** | Origine, destinazione, territorio e rotte globali. |
| 4. Modello dati v1 | **LIVE VERIFIED / PASS** | Modello editoriale applicato su Supabase reale con RLS; migrazioni repository riallineate alla cronologia applicata. |
| 5. Scrivania redazionale | **PASS** | Inbox, triage, assegnazione, priorità, dashboard e audit attività. |
| 6. Contribuisci | **FUNCTIONAL PASS** | Invio occasionale anonimo + contributore autenticato con read-own + area personale + UI amministrativa invito/abilitazione/revoca. Resta solo smoke di consegna email con un collaboratore reale. |
| 7. Storie e interviste | **PLATFORM PASS / INTERVIEWEES DEFERRED** | Workflow privato candidato→contatto→intervista→fact-check→approvazione; consensi separati per pubblicazione/citazioni/immagini/video, RLS editor-only. Nessun intervistato è selezionato automaticamente e nessun contatto va effettuato durante lo sviluppo. La selezione finale degli intervistati sarà fatta dal responsabile del progetto. |
| 8. Osservatorio v1 | **PASS V1** | Eurostat, InfoCamere/Futurae e confronto OECD; fonte, periodo, unità, metodologia e aggiornamento pubblici. Relazione strutturata contenuto↔indicatore aggiunta. |
| 9. Rapporti e ricerche | **PASS V1** | Metadata biblioteca strutturati + prime schede InfoCamere/Futurae e OECD. |
| 10. Eventi | **PASS V1** | Futuro/passato, fusi, all-day, collegamenti contenuti; One Way Summit 2026 pubblicato come primo evento qualificato. |
| 11. Radar mondiale | **FUNCTIONAL DEV PASS / NETLIFY READY** | GDELT + Crossref + DataCite; dedupe e Inbox; nessuna auto-pubblicazione. Vercel cron già presente; compatibilità Netlify scheduled→background aggiunta, fail-closed senza `CRON_SECRET`. |
| 12. Fonti e metodologia | **PASS V1** | Registro fonti e distinzione pubblica tra fonti di discovery e fonti di evidenza. |
| 13. Identità visiva | **V1 PASS** | Bianco/nero/grigi, niente gradienti o effetti decorativi. |
| 14. Home | **V1 PASS** | Home editoriale Dati · Analisi · Voci. |
| 15. Social istituzionali | **PENDING EXTERNAL** | LinkedIn, X e YouTube richiedono account esterni. |
| 16. Sostieni | **PAGE PASS / PAYMENTS PENDING** | Pagina pronta e prudenziale: nessun pagamento attivo e nessuna promessa fiscale finché canale, trattamento amministrativo e formule fiscali non sono verificati. |
| 17. Identità AIPEL | **PASS V1** | Denominazione completa, forma associativa, sede legale, CF, P.IVA, presidente/direzione e contatto istituzionale pubblicati in modo coerente. |
| 18. SEO e internazionalizzazione | **SEO_FOUNDATION = PASS** | Sitemap dinamica per contenuti/eventi pubblici, canonical, OpenGraph/Twitter, JSON-LD Organization/Article/Event, `noindex` per record non pubblici e base tecnica locale `it` pronta per future lingue senza hreflang fittizi. |
| 19. Qualità/privacy/sicurezza | **PRIVACY V1 + ACCOUNT DELETION PASS / HOSTING + BROWSER GATES OPEN** | CI, RLS e backend verificati; privacy v1 e cancellazione account self-service operative. Restano Leaked Password Protection, smoke hosting reale e verifica browser finale accessibilità/mobile. |
| 20. Lancio editoriale | **ANALYTICAL CORE READY / INTERVIEWEE SELECTION DEFERRED** | I 7 contenuti analitici sono `ready`, non pubblicati e firmati dalla Redazione. Gli intervistati non sono ancora selezionati: la scelta sarà effettuata dal responsabile del progetto più avanti. |

## Ultimi gate verificati

- Supabase `immigratiimprenditori`: `ACTIVE_HEALTHY`, PostgreSQL 17.6.
- Form pubblico anonimo via RPC: PASS con rollback.
- RLS amministratore Inbox + audit trigger: PASS con rollback.
- Contributor read-own: 1 propria / 0 altrui — PASS con rollback.
- `provision_contributor_account` / revoca ruolo: smoke transazionale PASS, zero ruoli di test residui.
- CI #116 PASS — workflow interviste.
- CI #117 PASS — collegamenti Numero zero ↔ Osservatorio.
- CI #119 PASS — identità AIPEL e Sostieni.
- CI #121 PASS — riconciliazione migrazioni.
- CI #122 PASS — privacy v1 e identità completa.
- Migrazione `20260819181358_self_service_account_deletion_post_split`: applicata; preflight del solo amministratore attivo → `last_application_admin`, `can_proceed=false` — PASS senza modifiche dati.
- Migrazione `20260819182441_harden_self_delete_execute_privileges`: `anon EXECUTE=false`, `authenticated EXECUTE=true` per entrambe le RPC.
- CI #129 PASS — pagina/account deletion; CI #130 PASS — hardening privilegi; CI #131 PASS — checkpoint successivo.
- CI #135 PASS — compatibilità Netlify/background Radar.
- CI #143 PASS — SEO foundation: sitemap dinamica, canonical, structured data e base i18n.
- Test RLS sitemap con ruolo `anon`: 19 contenuti pubblici + 1 evento pubblico, 0 contenuti privati visibili.
- Migrazione `20260820083240_number_zero_editorial_collective_authors`: firma `Redazione Immigrati Imprenditori` applicata 7/7 ai contenuti analitici READY.
- Test RLS autori: 0 firme dei draft visibili ad `anon` prima della pubblicazione.
- CI #146 PASS — rendering autori, JSON-LD attribution e build completa.
- Le fonti principali dei 7 contenuti READY risultano raggiungibili: Ministero del Lavoro, OECD, Istat e Commissione europea.
- Compatibilità Netlify aggiunta: `netlify/functions/editorial-radar-schedule.mjs` invoca un background worker protetto che richiama lo stesso endpoint Radar.
- Vercel sull'head recente può fallire per `build-rate-limit`; questo non è considerato un errore applicativo quando GitHub CI resta verde.

## Hosting / privacy production

Vercel resta utilizzabile per sviluppo e preview, ma il piano Hobby non viene assunto come gate privacy concluso. Per evitare un costo obbligatorio, è stata preparata una seconda strada production su Netlify.

La variante Netlify usa un trigger schedulato breve che invoca un worker background; il job resta inattivo se `CRON_SECRET` non è configurato. Il passaggio a Netlify non è ancora un cut-over: nessun DNS è stato modificato e Vercel non è stato spento. Prima di abilitare `CRON_SECRET` su Netlify va evitata una doppia schedulazione sul vecchio hosting.

## Numero zero — nucleo analitico

Sette contenuti sono `editorial_status=ready` e restano `publication_status=unpublished`: L1 Lombardia, I1 Italia, I2 Futurae/InfoCamere, A2 italiani all'estero, E1 confronto europeo, E2 Action Plan UE e M1 OECD.

QA editoriale verificata:

- slug presente 7/7;
- abstract sostanziale 7/7;
- corpo completo 7/7;
- fonte originale 7/7;
- almeno una geografia 7/7;
- 2–4 tag per contenuto;
- L1/I1/I2/E1/M1 collegati a indicatori Osservatorio dove metodologicamente pertinente;
- A2 ed E2 non forzano collegamenti a indicatori non omogenei;
- firma collettiva `Redazione Immigrati Imprenditori` 7/7.

M1 non descrive il perimetro OECD come dato mondiale; A2 usa una source map e non somma definizioni incompatibili.

## Storie e interviste — regola operativa durante lo sviluppo

`content_interview_workflow` gestisce candidatura/origine, primo contatto, programmazione, intervista, fact-check, consensi separati per pubblicazione/citazioni/immagini/video e note interne minimizzate. RLS attiva, nessun `SELECT` anonimo.

Eventuali nomi già presenti nella Inbox o nella ricerca restano **solo un pool di ricerca non selezionato**. Non equivalgono a una scelta editoriale. Durante lo sviluppo:

- nessun contatto;
- nessuna email o messaggio;
- nessun dossier candidato considerato definitivo;
- nessuno slot del Numero zero assegnato automaticamente.

La scelta degli intervistati sarà effettuata più avanti dal responsabile del progetto.

## SEO foundation

La sitemap non è più soltanto statica: include automaticamente i record realmente pubblicati e visibili, usando un client Supabase anonimo senza cookie per evitare che una sessione redazionale possa contaminare la sitemap con bozze/private URL.

Le route `/contenuti/[slug]` e `/eventi/[id]` hanno canonical esplicito, OpenGraph/Twitter e JSON-LD. I contenuti non pubblici ricevono `noindex`. L'identità AIPEL è pubblicata come `Organization` schema.org e gli articoli espongono autore e publisher distinti.

La preparazione multilingua v1 è intenzionalmente minima: locale predefinito `it`, builder di path locale-aware e nessun `hreflang` verso lingue che non esistono ancora.

## Privacy operativa v1

La route `/privacy` descrive il trattamento effettivamente implementato per dati tecnici/sicurezza, account, invii `Contribuisci`, workflow privato delle interviste e ricerca editoriale su fonti pubbliche. Identifica AIPEL e il contatto `info@immigratiimprenditori.it`, esplicita finalità, basi giuridiche, destinatari, conservazione, diritti, assenza di decisioni automatizzate e cookie tecnici di sessione.

La cancellazione account è self-service nel perimetro post-split: `/app/account` esegue una preflight sul solo account autenticato; l'ultimo amministratore attivo è bloccato; la conferma richiede `ELIMINA`; la RPC revoca i ruoli e chiude l'Account; il server elimina lo stesso utente Supabase Auth con `service_role` server-side. Profili e materiali editoriali restano soggetti a separata richiesta privacy/valutazione di conservazione.

## Advisor Supabase

- `submit_editorial_contribution`: warning `SECURITY DEFINER` intenzionale; è il confine controllato del form pubblico e `anon` non ha DML diretto sulle tabelle.
- `access_self_delete_preflight` e `access_self_close_account`: warning `SECURITY DEFINER` per `authenticated` intenzionale; entrambe sono vincolate a `auth.uid()`. Hardening verificato: `anon` non ha EXECUTE.
- Leaked Password Protection: da attivare/verificare prima del lancio; il connettore Supabase disponibile non espone la modifica della configurazione Auth.

## Regola di merge

PR #7 resta Draft. Nessun merge su `main` durante la costruzione. Il gate di sviluppo richiede CI verde e backend verificato; hosting production, smoke browser reale, Leaked Password Protection e configurazioni esterne vengono chiusi al go-live.
