# SPLIT-1 — Riconciliazione completa dei due prodotti

## 1. Esito sintetico

**PASS documentale corretto.** Il repository corrente è stato letto solo come baseline di riferimento; le decisioni di destinazione sono state rese coerenti e definitive senza anticipare modifiche fisiche di SPLIT-2. Sono censiti **713 file** e **1.959 oggetti/occorrenze**; il totale complessivo resta invariato. Nessuna categoria legacy `OSSERVATORIO` è mantenuta come destinazione di prodotto: l’Osservatorio è un sottodominio statistico interno al Centro Studi.

## 2. Stato Git iniziale

- Directory: `C:\Users\151702\Desktop\PROGETTI-WEB\immigrati-imprenditori`
- Branch: `main`
- HEAD iniziale: `958406c0000e7249d310f15d4711ac3d7a8b5537`
- `origin/main` localmente disponibile: `958406c0000e7249d310f15d4711ac3d7a8b5537`
- Ahead/behind: `0/0`
- Staging iniziale: vuoto.
- Modificati preesistenti: `package.json`, `package-lock.json`.
- Non tracciati preesistenti: `scripts/external-data/d1-d8a-events-dry-run.ts`, `src/lib/external-data/events/dry-run.ts`, `src/lib/external-data/events/dry-run.test.ts`.
- I file estranei ai tre deliverable sono stati preservati e non toccati.

## 3. Metodo e perimetro

Lettura limitata ai tre deliverable SPLIT-1 e ai riferimenti direttamente indispensabili per escludere ambiguità. Nessun nuovo inventario, nessuna modifica a codice, database, migration o file esterni. I CSV sono l'inventario analitico autoritativo del documento; questo file ne sintetizza le decisioni definitive.

## 4. Definizione autoritativa dei prodotti

- **PonteImprese:** prodotto B2B operativo e commerciale dedicato a imprese, professionisti, organizzazioni, collaborazioni, opportunità, servizi, matching, mercati, internazionalizzazione, relazioni commerciali e monetizzazione futura.
- **IMMIGRATI IMPRENDITORI — CENTRO STUDI SULL’IMPRENDITORIA MIGRANTE:** prodotto di ricerca, analisi, divulgazione, conoscenza, statistiche, studi territoriali, rapporti, fonti istituzionali, storie e contributo degli imprenditori migranti, contenuti editoriali e eventi attuali legati alla tematica migratoria.
- **Osservatorio:** sottodominio statistico interno al Centro Studi, non prodotto autonomo. Preserva i nomi tecnici legacy contenenti `osservatorio` senza rinominarli, ma li definisce sempre come parte del Centro Studi.
- Confine obbligatorio: repository, database, deployment, ruoli e identità distinti; le integrazioni future restano da separare in SPLIT-2, senza anticipare scelte fisiche.

## 5. Regole di classificazione

`PONTE_IMPRESE` contiene finalità operative e B2B; `CENTRO_STUDI` contiene finalità di studio, ricerca, analisi, eventi attuali, contenuti, fonti istituzionali, statistiche e Osservatorio; `CONDIVISO` è limitato a infrastruttura realmente comune e componenti tecnici/identità/ruoli generali; `ARCHIVIO` conserva solo elementi obsoleti o storici non attivi. Le decisioni sono chiuse e definitive: nessun elemento resta in stato non definito.

## 6. Conteggi complessivi

### File

| Categoria | Conteggio |
|---|---:|
| PONTE_IMPRESE | 386 |
| CENTRO_STUDI | 118 |
| CONDIVISO | 124 |
| ARCHIVIO | 85 |
| **Totale** | **713** |

Tipi principali: 180 migration SQL, 154 documenti Markdown, 161 file TS/TSX applicativi non-test, 70 pagine, 46 file test, 19 script, 17 MJS, 11 loading UI, 6 asset e 6 DOCX.

### Oggetti/occorrenze

| Categoria | Conteggio |
|---|---:|
| PONTE_IMPRESE | 475 |
| CENTRO_STUDI | 496 |
| CONDIVISO | 984 |
| ARCHIVIO | 4 |
| **Totale** | **1.959** |

Decisioni: 1.959 definitive, senza elementi provvisori o aperti. Il conteggio SQL è per occorrenza nelle migration, quindi lo stesso oggetto può ricorrere in creazione, hardening, policy, grant o modifica.

## 7. Mappa delle pagine e route

La versione Next.js locale conferma che ogni `page.tsx` espone una route, i layout si annidano e `route.ts` definisce handler HTTP. Sono presenti 70 pagine, quattro layout (`root`, `/app`, amministrazione, redazione), un handler `/auth/callback`, metadata `robots.ts` e `sitemap.ts`; nessun `middleware.ts`, mentre `src/proxy.ts` gestisce il proxy/sessione.

| Route | File | Allocazione |
|---|---|---|
| `/accedi` | `src/app/accedi/page.tsx` | PONTE_IMPRESE |
| `/app/amministrazione/account/[id]` | `src/app/app/amministrazione/account/[id]/page.tsx` | PONTE_IMPRESE |
| `/app/amministrazione/account` | `src/app/app/amministrazione/account/page.tsx` | PONTE_IMPRESE |
| `/app/amministrazione/imprese` | `src/app/app/amministrazione/imprese/page.tsx` | PONTE_IMPRESE |
| `/app/amministrazione` | `src/app/app/amministrazione/page.tsx` | PONTE_IMPRESE |
| `/app/amministrazione/riassegnazioni` | `src/app/app/amministrazione/riassegnazioni/page.tsx` | PONTE_IMPRESE |
| `/app/amministrazione/ruoli` | `src/app/app/amministrazione/ruoli/page.tsx` | PONTE_IMPRESE |
| `/app/forbidden` | `src/app/app/forbidden/page.tsx` | PONTE_IMPRESE |
| `/app/imprese/[id]` | `src/app/app/imprese/[id]/page.tsx` | PONTE_IMPRESE |
| `/app/imprese` | `src/app/app/imprese/page.tsx` | PONTE_IMPRESE |
| `/app/onboarding` | `src/app/app/onboarding/page.tsx` | PONTE_IMPRESE |
| `/app` | `src/app/app/page.tsx` | PONTE_IMPRESE |
| `/app/profilo` | `src/app/app/profilo/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/contenuti/[id]` | `src/app/app/redazione/contenuti/[id]/page.tsx` | CENTRO_STUDI |
| `/app/redazione/contenuti/nuovo` | `src/app/app/redazione/contenuti/nuovo/page.tsx` | CENTRO_STUDI |
| `/app/redazione/contenuti` | `src/app/app/redazione/contenuti/page.tsx` | CENTRO_STUDI |
| `/app/redazione/eventi/[id]` | `src/app/app/redazione/eventi/[id]/page.tsx` | CENTRO_STUDI |
| `/app/redazione/eventi` | `src/app/app/redazione/eventi/page.tsx` | CENTRO_STUDI |
| `/app/redazione/mercati-internazionali/[id]` | `src/app/app/redazione/mercati-internazionali/[id]/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/mercati-internazionali` | `src/app/app/redazione/mercati-internazionali/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/opportunita/[id]` | `src/app/app/redazione/opportunita/[id]/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/opportunita` | `src/app/app/redazione/opportunita/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/organizzazioni/[id]` | `src/app/app/redazione/organizzazioni/[id]/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/organizzazioni/nuovo` | `src/app/app/redazione/organizzazioni/nuovo/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/organizzazioni` | `src/app/app/redazione/organizzazioni/page.tsx` | PONTE_IMPRESE |
| `/app/redazione/osservatorio/fonti` | `src/app/app/redazione/osservatorio/fonti/page.tsx` | CENTRO_STUDI |
| `/app/redazione/osservatorio/indicatori/[id]` | `src/app/app/redazione/osservatorio/indicatori/[id]/page.tsx` | CENTRO_STUDI |
| `/app/redazione/osservatorio/indicatori/nuovo` | `src/app/app/redazione/osservatorio/indicatori/nuovo/page.tsx` | CENTRO_STUDI |
| `/app/redazione/osservatorio/indicatori` | `src/app/app/redazione/osservatorio/indicatori/page.tsx` | CENTRO_STUDI |
| `/app/redazione/osservatorio` | `src/app/app/redazione/osservatorio/page.tsx` | CENTRO_STUDI |
| `/app/redazione/osservatorio/valori` | `src/app/app/redazione/osservatorio/valori/page.tsx` | CENTRO_STUDI |
| `/app/redazione` | `src/app/app/redazione/page.tsx` | CENTRO_STUDI |
| `/app/stato/chiuso` | `src/app/app/stato/chiuso/page.tsx` | PONTE_IMPRESE |
| `/app/stato/disabilitato` | `src/app/app/stato/disabilitato/page.tsx` | PONTE_IMPRESE |
| `/app/stato/sospeso` | `src/app/app/stato/sospeso/page.tsx` | PONTE_IMPRESE |
| `/chi-siamo` | `src/app/chi-siamo/page.tsx` | PONTE_IMPRESE |
| `/collaborazioni/[slug]` | `src/app/collaborazioni/[slug]/page.tsx` | PONTE_IMPRESE |
| `/collaborazioni` | `src/app/collaborazioni/page.tsx` | PONTE_IMPRESE |
| `/contatti` | `src/app/contatti/page.tsx` | PONTE_IMPRESE |
| `/contenuti/[slug]` | `src/app/contenuti/[slug]/page.tsx` | CENTRO_STUDI |
| `/contenuti` | `src/app/contenuti/page.tsx` | CENTRO_STUDI |
| `/cookie` | `src/app/cookie/page.tsx` | PONTE_IMPRESE |
| `/cultura` | `src/app/cultura/page.tsx` | CENTRO_STUDI |
| `/dati-e-fonti` | `src/app/dati-e-fonti/page.tsx` | CENTRO_STUDI |
| `/eventi/[id]` | `src/app/eventi/[id]/page.tsx` | CENTRO_STUDI |
| `/eventi` | `src/app/eventi/page.tsx` | CENTRO_STUDI |
| `/imprese/[id]` | `src/app/imprese/[id]/page.tsx` | PONTE_IMPRESE |
| `/imprese` | `src/app/imprese/page.tsx` | PONTE_IMPRESE |
| `/lingue-e-mercati` | `src/app/lingue-e-mercati/page.tsx` | CONDIVISO |
| `/mercati/[code]` | `src/app/mercati/[code]/page.tsx` | PONTE_IMPRESE |
| `/mercati` | `src/app/mercati/page.tsx` | PONTE_IMPRESE |
| `/notizie-e-guide` | `src/app/notizie-e-guide/page.tsx` | CENTRO_STUDI |
| `/opportunita/[id]` | `src/app/opportunita/[id]/page.tsx` | PONTE_IMPRESE |
| `/opportunita` | `src/app/opportunita/page.tsx` | PONTE_IMPRESE |
| `/organizzazioni/[slug]` | `src/app/organizzazioni/[slug]/page.tsx` | PONTE_IMPRESE |
| `/organizzazioni` | `src/app/organizzazioni/page.tsx` | PONTE_IMPRESE |
| `/osservatorio/[slug]` | `src/app/osservatorio/[slug]/page.tsx` | CENTRO_STUDI |
| `/osservatorio` | `src/app/osservatorio/page.tsx` | CENTRO_STUDI |
| `/` | `src/app/page.tsx` | PONTE_IMPRESE |
| `/persone/[slug]` | `src/app/persone/[slug]/page.tsx` | PONTE_IMPRESE |
| `/persone` | `src/app/persone/page.tsx` | PONTE_IMPRESE |
| `/privacy` | `src/app/privacy/page.tsx` | PONTE_IMPRESE |
| `/professionisti/[id]` | `src/app/professionisti/[id]/page.tsx` | PONTE_IMPRESE |
| `/professionisti` | `src/app/professionisti/page.tsx` | PONTE_IMPRESE |
| `/pubblica` | `src/app/pubblica/page.tsx` | PONTE_IMPRESE |
| `/registrati` | `src/app/registrati/page.tsx` | PONTE_IMPRESE |
| `/servizi/offerte/[id]` | `src/app/servizi/offerte/[id]/page.tsx` | PONTE_IMPRESE |
| `/servizi` | `src/app/servizi/page.tsx` | PONTE_IMPRESE |
| `/servizi/richieste/[id]` | `src/app/servizi/richieste/[id]/page.tsx` | PONTE_IMPRESE |
| `/termini` | `src/app/termini/page.tsx` | PONTE_IMPRESE |

## 8. Mappa dei domini applicativi

| Dominio | Destinazione | Decisione |
|---|---|---|
| Account, auth, ruoli, profili operativi | PonteImprese | DEFINITIVA |
| Imprese, membership, autorizzazioni | PonteImprese | DEFINITIVA |
| Professionisti, servizi, opportunità, collaborazioni | PonteImprese | DEFINITIVA |
| Mercati e internazionalizzazione commerciale | PonteImprese | DEFINITIVA |
| Indicatori, valori, fonti statistiche | Centro Studi / sottodominio Osservatorio | DEFINITIVA |
| Contenuti editoriali e cultura | Centro Studi | DEFINITIVA |
| Eventi attuali | Centro Studi | DEFINITIVA |
| Organizzazioni commerciali | PonteImprese | DEFINITIVA |
| Paesi, lingue, territori, settori | Condiviso strutturale | DEFINITIVA |
| Privacy, termini, retention | PonteImprese | DEFINITIVA |

## 9. Mappa completa del database

Le 180 migration definiscono nuclei: persone/profili e lingue; formazione legacy; opportunità; imprese e membership; mercati internazionali; professionisti; servizi; eventi; contenuti; organizzazioni; account e ruoli; collaborazioni; osservatorio; access/RLS; cultura; contatti; termini/retention/cancellazione/riassegnazione; ingestion esterna.

- **PonteImprese DB:** account, profili operativi, imprese, membership, professionisti, servizi, opportunità, collaborazioni, mercati commerciali, contatti, consensi e lifecycle.
- **Centro Studi DB:** contenuti editoriali, rapporti, ricerche, storie, eventi scientifici, fonti, metodologia, collaborazioni e tassonomie dedicate; al suo interno il sottodominio Osservatorio possiede indicatori, valori, serie storiche e dati territoriali o comparativi.
- **Duplicare come template:** paesi/lingue/territori/settori, schema tecnico eventi, sicurezza tecnica necessaria a ciascun prodotto.
- **Non trasferire automaticamente:** account, contatti, dati personali, membership, autorizzazioni, richieste/offerte e dati commerciali.
- Storage: non risultano bucket o policy Storage creati nelle migration censite; `supabase/config.toml` è configurazione locale e dovrà essere duplicata e specializzata.
- Viste, enum e oggetti creati/modificati sono riportati per occorrenza nel CSV oggetti; vincoli, indici, trigger, RLS, grant e revoke restano legati al database proprietario.

## 10. Mappa delle migration

Tutte le **180 migration** sono censite singolarmente nel CSV file e come oggetto `migration` nel CSV oggetti. Le migration sono storiche e immutabili. La futura separazione deve produrre baseline nuove per ciascun database, mantenendo nel repository storico la catena originale. Blocchi: luglio 2026 fondazioni/persona/opportunità/imprese; 2–11 agosto mercati, professionisti, servizi, eventi, contenuti, organizzazioni, account, collaborazioni e osservatorio; 12 agosto access/RLS; 13–20 agosto cultura, privacy/lifecycle e ingestion.

## 11. Funzioni e servizi applicativi

Censiti 556 simboli funzione e 152 costanti/arrow esportate, oltre a entry point e componenti. I gruppi principali sono: session/guard/auth/admin/business per Ponte; data public per i domini commerciali; editorial actions da scindere; normalizzatori/validatori/deduplicatori candidati a package versionato; client Supabase da duplicare con configurazioni autonome. Le server action sono concentrate in `src/lib/**/actions.ts` e seguono il proprietario del dominio.

## 12. Pipeline e fonti esterne

- World Bank ed Eurostat: Osservatorio, inclusi mapping, indicatori, apply e test.
- ISMU/PIM/MLPS/EMN/Futurae/Unioncamere: allowlist, note e contratti del Centro Studi; non condividere dati acquisiti.
- Incentivi.gov/opportunità: PonteImprese.
- Contenuti: motore generico candidato condiviso; allowlist, tassonomie e manifest al Centro Studi.
- Eventi: acquisizione/normalizzazione/deduplica candidata condivisa; allowlist e dati da separare per evento B2B o del Centro Studi.
- Gli artefatti di ingestion restano in Archivio. Nessuna pipeline è stata eseguita.

## 13. Mappa dei test

Censiti **47** test/unità: 12 E2E, test di accesso/auth/business/legal/pubblico, test editoriali e delle pipeline, più il test locale non tracciato eventi. Futuro: duplicare solo harness neutri; spostare i test di dominio col prodotto; creare suite contrattuali per API/export tra prodotti.

## 14. Documentazione e asset

La documentazione logica/fisica e i piani di migration seguono il relativo dominio. Report di validation/deployment, DOCX di revisione e artefatti sono Archivio. Baseline e convenzioni generali si duplicano e poi si specializzano. Favicon, CSS, header/footer e copy contengono identità attuale: sono provvisori e dovranno essere sostituiti in SPLIT successivi, non condivisi come brand.

## 15. Elementi condivisi e modalità

- Utilità pure, validazione, normalizzazione, checksum, deduplica: `PACKAGE_VERSIONATO`.
- Cataloghi paesi/lingue/territori/settori: `SCHEMA_TEMPLATE_DUPLICATO` o export versionato.
- Schema tecnico eventi/organizzazioni: `SCHEMA_TEMPLATE_DUPLICATO`, dati separati.
- Riferimenti editoriali a entità commerciali: `API_READ_ONLY`.
- Config, test harness e componenti UI realmente neutri: `DUPLICAZIONE_CONTROLLATA`.
- Snapshot periodici non sensibili: `EXPORT_IMPORT`.
Nessuna modalità implica schema operativo o deployment condiviso.

## 16. Elementi da archiviare

Artefatti di ingestion, report di validazione/deployment conclusi, revisioni legali DOCX, prove e documenti storici non normativi. Azione unica: conservare con metadati; **zero cancellazioni**.

## 17. Casi ambigui e decisioni umane

1. Eventi: definire tassonomia discriminante, owner e trattamento degli eventi ibridi.
2. Contenuti: decidere se guide commerciali restano in Ponte o sono lette dal Centro Studi via API.
3. Persone: non replicare profili/account; decidere se autori e speaker abbiano record editoriali minimali autonomi.
4. Organizzazioni: separare operatori B2B da università/associazioni/centri ricerca e scegliere owner per record ibridi.
5. Mercati: distinguere schede commerciali da indicatori statistici territoriali.
6. Ruoli/redazione: creare identità e ruoli editoriali autonomi nel Centro Studi.
7. Eventi e contenuti già acquisiti: approvazione editoriale riga per riga prima di ogni trasferimento.

## 18. Dipendenze incrociate da sciogliere

Link contenuto-evento/opportunità/servizio/mercato; organizzazioni usate da eventi e redazione; profili usati come autori/speaker; cataloghi referenziati da entrambi; azioni editoriali nello stesso modulo; navigation/layout/branding unificati; RLS basata sugli stessi account e ruoli. Sostituire con ID esterni non sensibili, snapshot o API read-only e tollerare indisponibilità.

## 19. Proposta per i database

Confermare l'attuale database come origine della baseline Ponte, poi creare un database Centro Studi nuovo. Generare per ciascuno una baseline verificata a partire dallo stato logico, non riscrivendo le migration storiche. Trasferire al Centro Studi solo dati editoriali/statistici approvati; nessun dato personale/commerciale per default.

## 20. Proposta per i repository

Conservare la storia fino al commit di split in entrambi. Repository A rinominato/brandizzato PonteImprese; repository B derivato per il Centro Studi. Dopo il tag di split, rimuovere nei rispettivi follow-up solo con GO dedicato e mantenere manifest di provenienza.

## 21. Proposta per i deployment

Due progetti Vercel, domini, variabili, Supabase project ref, log, analytics, sitemap, robots e policy di retention autonomi. Nessuna variabile o service-role condivisa. Separare anteprime e accessi amministrativi.

## 22. Sequenza futura di separazione

1. Approvare le decisioni umane e congelare il punto di split.
2. Taggare e derivare i due repository.
3. Generare baseline DB autonome e mapping dati autorizzato.
4. Estrarre prima i contratti neutrali, poi scindere route/UI/azioni.
5. Separare auth, ruoli, RLS e configurazioni.
6. Migrare solo dati approvati con report di conteggio e provenienza.
7. Applicare branding, SEO e documenti legali autonomi.
8. Eseguire test, preview, cutover e rollback rehearsal.
Questa sequenza non è stata eseguita.

## 23. Rischi

- Tecnici: FK/link incrociati, divergenza cataloghi, RLS dipendente da ruoli comuni, doppia pubblicazione e deduplica.
- Privacy: replica non autorizzata di profili/contatti, finalità incompatibili, retention e consensi non separati.
- SEO: URL duplicati, canonical errati, sitemap e redirect non coordinati.
- Operativi: ownership editoriale ambigua, pipeline duplicate, secret/config condivisi, rollback incompleto.
Mitigazioni: data minimization, DPIA/valutazione legale, contract tests, registri export, idempotenza e osservabilità separate.

## 24. Verifica di completezza

- 710/710 file tracciati censiti; tre file locali non tracciati pertinenti censiti.
- 70 pagine, una route handler, quattro layout e proxy censiti.
- 180/180 migration censite e non modificate.
- Simboli applicativi esportati, entry point, pipeline, allowlist, test e principali occorrenze SQL censiti.
- Ogni riga ha categoria; ogni riga `CONDIVISO` ha modalità esplicita; nessun `ARCHIVIO` propone cancellazione.
- Directory tecniche escluse non lette internamente; nessun `.env*` letto.
- I dettagli riga-per-riga sono nei due CSV.

## 25. Stato Git finale

- Branch `main`; HEAD e `origin/main` invariati a `958406c0000e7249d310f15d4711ac3d7a8b5537`; ahead/behind `0/0`.
- Staging vuoto; `git diff --check` concluso con exit code 0.
- Le modifiche locali iniziali a `package.json` e `package-lock.json` e i tre file eventi non tracciati sono invariati e preservati.
- Gli unici nuovi file sono i tre deliverable SPLIT-1 in `docs/architecture/reconciliation/`.
- Nessun commit, push, reset, stash, cancellazione, modifica a codice o migration.
