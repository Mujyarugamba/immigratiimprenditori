# SPLIT-2A — Contratti di confine tra PonteImprese e Centro Studi

Documento ricostruito in SPLIT-2A-RECOVERY. Complemento di `split-2-target-architecture.md` e `split-2-migration-waves.csv`. Solo documentale.

Le etichette `G1`–`G5`, `G4=15` e `W2.1=18` non sono contratti e non vincolano i confini.

## 1. Responsabilità PonteImprese

Ownership definitiva da SPLIT-1 §8 e mapping route §7:

- Account, autenticazione, ruoli operativi, profili operativi, onboarding.
- Imprese, membership, autorizzazioni, riassegnazioni, chiusura/sospensione account.
- Professionisti, servizi (richieste/offerte), opportunità, collaborazioni, matching.
- Organizzazioni **commerciali** / operatori B2B.
- Mercati e internazionalizzazione commerciale.
- Contatti, consensi, privacy, termini, cookie, retention, cancellazione self-service (finché non esiste set legale autonomo CS).
- Pipeline opportunità / Incentivi.gov.
- Route pubbliche e riservate classificate `PONTE_IMPRESE` (inventario file + tabella route).
- Deploy, SEO, analytics, identità grafica e dominio `ponteimprese.com`.

PonteImprese deve funzionare senza moduli interni del Centro Studi.

## 2. Responsabilità Centro Studi

- Contenuti editoriali, cultura, notizie e guide di ricerca, dati e fonti, storie e pubblicazioni.
- Eventi scientifici/editoriali/attuali classificati `CENTRO_STUDI`.
- Osservatorio: indicatori, valori, fonti statistiche, serie, dati territoriali/comparativi (sottodominio interno, non prodotto).
- Fonti e metodologia; allowlist ISMU/PIM/MLPS/EMN/Futurae/Unioncamere e dati acquisiti relativi.
- Pipeline World Bank / Eurostat.
- Sotto-aree redazionali classificate `CENTRO_STUDI` nell’inventario SPLIT-1 (non l’intero albero `redazione/**`), incluse in particolare `src/app/app/redazione/contenuti/**`, `src/app/app/redazione/eventi/**`, `src/app/app/redazione/osservatorio/**` e la pagina indice redazione se allocate CS.
- Route pubbliche allocate `CENTRO_STUDI`.
- Deploy, SEO, analytics, identità grafica e dominio attuale.

Non è una regola generale `src/app/app/redazione/** → CENTRO_STUDI`. Restano `PONTE_IMPRESE` (SPLIT-1 §7):

- `src/app/app/redazione/mercati-internazionali/**`
- `src/app/app/redazione/opportunita/**`
- `src/app/app/redazione/organizzazioni/**`

Ogni altro path redazione segue la riga inventario; nessuna riclassificazione in questo documento.

Route pubbliche organizzazioni (SPLIT-1 definitivo): `src/app/organizzazioni/page.tsx` e `src/app/organizzazioni/[slug]/page.tsx` sono `PONTE_IMPRESE`. `src/app/organizzazioni/loading.tsx` resta `CONDIVISO` (residuo con gate `S2-GATE-ORG-LOADING`). Una futura decisione potrà mantenerlo condiviso, duplicarlo o assegnarlo a PonteImprese solo dopo verifica del comportamento route/layout. Non inferirlo dallo `[slug]`.

Route pubbliche eventi (SPLIT-1 definitivo, §7): `src/app/eventi/page.tsx` e `src/app/eventi/[id]/page.tsx` sono `CENTRO_STUDI`. `src/app/eventi/loading.tsx` resta `PONTE_IMPRESE` (file) con oggetto `EventiLoading` ancora `CONDIVISO` (residuo preesistente, gate `S2-GATE-EVENTI-LOADING`). Non inferire il loading dalle `page.tsx`. Esiti futuri possibili, senza deciderli ora: allineamento a Centro Studi, permanenza Ponte, duplicazione, o altra soluzione dimostrata dopo verifica route/layout e coerenza file/oggetto.

Il Centro Studi deve funzionare senza matching, membership, richieste/offerte o funzioni commerciali di PonteImprese.

## 3. Responsabilità condivise

Limitate a quanto classificato `CONDIVISO` nell’inventario, con modalità esplicita:

| Modalità inventario | Significato di confine |
|---|---|
| `DUPLICAZIONE_CONTROLLATA` | Copia specializzabile; non è un runtime condiviso |
| `SCHEMA_TEMPLATE_DUPLICATO` | Schema da copiare; dati separati; in SPLIT-2 non si tocca SQL |
| `PACKAGE_VERSIONATO` | Candidato a package solo se neutro e senza migration |

Cataloghi strutturali (paesi, lingue, territori, settori): template o export versionato, non database operativo comune (SPLIT-1 §15).

`CONDIVISO` non autorizza stessa grafica, stessi cookie, stessa SEO o stesso comportamento applicativo.

Gate esplicito sul residuo `src/app/organizzazioni/loading.tsx` (`S2-GATE-ORG-LOADING`): originale inventario `CONDIVISO`; **chiuso lato PI** in `S2-PI-CORE-01` (duplicato nell’app). Dettaglio sotto.

Gate esplicito sul residuo `src/app/eventi/loading.tsx` (`S2-GATE-EVENTI-LOADING`, onda `S2-PI-APP-01`): file `PONTE_IMPRESE`, oggetto `EventiLoading` `CONDIVISO`; incoerenza preesistente non risolta per inferenza.

Gate esplicito `S2-GATE-SAFE-REDIRECT` (onda `S2-COND-UTIL-01`): originale root resta `CONDIVISO`. **Risolto lato Ponte** in `S2-PI-CORE-01`: copia in `apps/ponteimprese` con fallback `"/app"`. Estrazione neutra in `packages/core` non necessaria per autonomia PI.

Gate esplicito `S2-GATE-APP-ERROR` (onda `S2-COND-UTIL-01`): originale root resta `CONDIVISO`. **Risolto lato Ponte** in `S2-PI-CORE-01`: modulo completo copiato in `apps/ponteimprese` (mapping PostgreSQL/membership/grant/impresa). `packages/core` non creato.

Gate esplicito `S2-GATE-SUPABASE-CLIENT` (onda `S2-COND-LIB-01`): **risolto lato Ponte e Centro Studi**. Copie `client.ts` / `server.ts` in entrambe le app. Nessun `.env*`, nessun segreto, nessuna chiamata DB. Originale root preservato.

Gate esplicito `S2-GATE-ORG-LOADING` (onda `S2-COND-LIB-01`, closeout `S2-PI-CORE-01`): **chiuso lato PI**. `apps/ponteimprese/src/app/organizzazioni/loading.tsx` duplicato perché le page PI `/organizzazioni` e `/organizzazioni/[slug]` lo richiedono. Inventario SPLIT-1 resta `CONDIVISO`. Non inferito dallo `[slug]` da solo: la verifica è la presenza delle page PI del catalogo organizzazioni.

`S2-GATE-EVENTI-LOADING`: **chiuso lato CS** in `S2-CS-CORE-01`. Variante locale con `LoadingState`. Il file inventario `src/app/eventi/loading.tsx` resta `PONTE_IMPRESE` (copia PI esistente). Non inferito dalle page CS.

`S2-GATE-LINGUE-MERCATI`: **RESOLVED_FOR_PRODUCT_WORKSPACES**. `LINGUE_MERCATI_APP_OWNERSHIP = PONTEIMPRESE`. Redirect `/lingue-e-mercati` → `/mercati` copiato in `apps/ponteimprese`. `/mercati` è PonteImprese. Originale CONDIVISO in root. Non copiato in Centro Studi.

`S2-GATE-CONTENUTI-GUIDE`: **RESOLVED_FOR_PRODUCT_WORKSPACES**. `CONTENUTI_GUIDE_APP_OWNERSHIP = CENTRO_STUDI`. `/notizie-e-guide` è CS e redirect a `/contenuti` (CS). Nessuna modifica database.

`S2-GATE-PI-EDITORIAL-SUPPORT`: invariato. Originali CS ora anche in `apps/centro-studi`; copie PI restano.

`S2-GATE-PI-LEGAL-DOCS`: **chiuso** in `S2-PI-FINAL-01`. I quattro markdown runtime (privacy, cookie, termini, dati/fonti) vivono in `apps/ponteimprese/docs/architecture/legal`. `loadPublicLegalMarkdown` risolve la directory dall’app (`ponteImpreseLegalDocsDir`), non dalla root. `PI_RUNTIME_LEGAL_ROOT_DEPENDENCY = 0`.

`S2-PI-CORE-01`: 159 file PI copiati in `apps/ponteimprese` (root intatta). Dipendenze TypeScript verso root `src/` = 0. Package: `@immigrati/ui-foundation`, `@immigrati/product-config`.

`S2-PI-FINAL-01`: `PONTEIMPRESE_AUTONOMOUS = YES`. Docs 77, test 28, migration 126 copiati. `PI_MIGRATION_OWNERSHIP = COPIED`. `PI_DATABASE_BOOTSTRAP = SPLIT_3_PENDING`. Navigazione verso sezioni CS: `CROSS_PRODUCT_NAVIGATION_PENDING_CUTOVER` (non è import di codice). `PI_LOCAL_EDITORIAL_SUPPORT = INTENTIONAL_DUPLICATION` (chiuso applicativamente in `S2-CLEANUP-ARCH-01`).

`S2-CS-CORE-01`: 62 file CS copiati in `apps/centro-studi` (root intatta; Ponte invariato). `CS_TO_PI_IMPORTS = 0`. `CS_EXTERNAL_APP_FILE_DEPENDENCIES = 0`. `CENTRO_STUDI_CORE_AUTONOMOUS = PARTIAL` (superato da `S2-CS-FINAL-01`).

`S2-CS-FINAL-01`: `CENTRO_STUDI_AUTONOMOUS = YES`. Docs 23, test 9, migration 21 copiati. `CS_MIGRATION_OWNERSHIP = COPIED`. `CS_DATABASE_BOOTSTRAP = SPLIT_3_PENDING`. `CS_RUNTIME_ROOT_DOCUMENT_DEPENDENCIES = 0`. Legal CS: `S2-GATE-LEGAL-CS` aperto (placeholder locale; nessun markdown PI). Helper e2e PI e guard ingest ARCHIVIO copiati come supporto script/test. `CS_SSO_CUTOVER = PENDING`. Typecheck CS/PI/root = 0. `PONTEIMPRESE_AUTONOMOUS = YES` invariato.

`S2-CLEANUP-ARCH-01`: 85/85 ARCHIVIO in root (classificati; zero delete). Guard ingest copiata in PI e CS. `PI_LOCAL_EDITORIAL_SUPPORT = INTENTIONAL_DUPLICATION`. Env example per-app. `WORKSPACE_LOCK_CONSISTENT = YES`. `EVENTI_APP_OWNERSHIP = CENTRO_STUDI`. `CS_LEGAL_CONTENT = CUTOVER_BLOCKER`. `BRAND_DOMAIN_CUTOVER = PENDING`. Script PI eventi: non duplicato il motore CS.

`S2-EXTRACT-01`: package workspace localizzati in ciascuna app (`packages/ui-foundation` neutro duplicato; `packages/product-config` variante per prodotto). Import `@immigrati/*` risolti sotto `apps/<prodotto>/`. `PI_EVENT_SCRIPT_STANDALONE = EXCLUDED_LEGACY_CROSS_PRODUCT` (copia `d1-d8a-events-dry-run` rimossa da PI; originale root intatto). `PI_STANDALONE_EXTERNAL_FILE_DEPENDENCIES = 0`. `CS_STANDALONE_EXTERNAL_FILE_DEPENDENCIES = 0`. `PONTEIMPRESE_REPO_READY = YES`. `CENTRO_STUDI_REPO_READY = YES`. Root `packages/*` preservati. Nessun npm install. Nessun SPLIT-3.

Gate esplicito `S2-GATE-ENV-EXAMPLE` (onda `S2-COND-TOOL-01`): **RESOLVED_FOR_PRODUCT_WORKSPACES**. Esempi in `apps/ponteimprese/env.example` e `apps/centro-studi/env.example` (solo placeholder). Root `env.example` resta legacy.

Gate esplicito `S2-GATE-HOME-LAYOUT` / `S2-GATE-APP-COMPONENTS` / `S2-GATE-PUBLIC-LEGAL-COMP` (onda `S2-COND-COMP-01`): originali restano `CONDIVISO` in root. **Duplicati lato PI** in `S2-PI-CORE-01`. **Lato CS** in `S2-CS-CORE-01`: Header/Footer minimi propri (non copia PI); public list e renderer legal copiati; `AuthForm`/home PI non copiati.

`src/lib/data/README.md` resta root (baseline del data layer misto del monorepo). `src/lib/data/public/organizations.ts` resta in sede sotto `S2-GATE-ORG` (letture pubbliche organizzazioni + join `organization_officials`/`profiles`; non package). Il cluster Eventi `allowlist.ts` / `acquisition.ts` / `dry-run.ts` (+ test) resta in sede sotto `S2-GATE-EVENTI`: l’allowlist è specifica di prodotto (fonti PIM/MinLavoro/Unioncamere/EMN); il motore importa l’allowlist e non è estraibile senza split. Nessun `packages/core` creato per uno o due file.

`S2-COND-DOCS-01` (closeout `S2-COND-FINAL-01`): i 12 `docs/%` `CONDIVISO` restano root. Baseline comune (`architecture-baseline`, `costituzione-piattaforma`, `domain-model`, `platform-data-specification`). Docs D1 opportunità (`d1-b1`, `d1-b2`): destinazione futura PonteImprese; copie PI di inventario `PONTE_IMPRESE` in `S2-PI-FINAL-01`. Docs D1 eventi: template/gate `S2-GATE-EVENTI`. Docs organizzazioni: `S2-GATE-ORG`. I 12 CONDIVISO non sono duplicati nelle app.

`S2-COND-MIG-01` (closeout `S2-COND-FINAL-01`): 34 file `supabase/%` CONDIVISO immutati a root. In `S2-PI-FINAL-01` i 126 file PI sono copiati in `apps/ponteimprese/supabase` (`PI_MIGRATION_OWNERSHIP = COPIED`); il bootstrap DB resta `SPLIT_3_PENDING`. Nessuna esecuzione SQL.

## 4. Dipendenze ammesse

1. `apps/*` → `packages/*` (API pubblica del package).
2. Contratto versionato, identificatore esterno non sensibile, snapshot approvato, API read-only tollerante all’indisponibilità.
3. Duplicazione di configurazione toolchain e client Supabase (istanze separate).
4. Lettura di URL pubblici dell’altro prodotto, senza sessione condivisa.

## 5. Dipendenze vietate

1. Import runtime `apps/ponteimprese` ↔ `apps/centro-studi`.
2. `packages/*` → `apps/*`.
3. Deep import nei package.
4. Package dipendenti da route, server action, secret, branding, copy, client Supabase proprietario (salvo UI primitive dichiarate e senza brand).
5. FK, sessioni, ruoli o oggetti runtime assunti comuni fra le due app.
6. Replica di account, contatti, membership, autorizzazioni, richieste, offerte, dati commerciali verso il Centro Studi.
7. Un ruolo editoriale CS che erediti privilegi commerciali Ponte.
8. Allowlist, credenziali pipeline o artefatti di ingestion condivisi fra owner diversi.
9. Cancellazione di `ARCHIVIO` senza GO umano.

## 6. Contratti API

Fino a SPLIT-3 non si implementano API nuove in questa unità. I contratti previsti, da versionare in `packages/contracts` quando un’onda lo richiederà, sono:

| Contratto | Direzione | Payload minimo | Indisponibilità |
|---|---|---|---|
| `cs.read.public_content` | CS → consumatori esterni / eventuale Ponte | ID esterno, titolo, URL canonico, data, tipo | Tollerare 404/vuoto |
| `pi.read.public_org_ref` | Ponte → CS (solo se gate `S2-GATE-ORG`) | ID esterno non personale, nome pubblico, URL | Non esporre membership |
| `catalog.export.geo` | template/export | Codici paese/lingua/territorio/settore | Snapshot versionato |
| `events.ref` | per prodotto, non misto | ID esterno evento, tipo, owner | Nessun join cross-DB |

Nessun contratto implica accesso service-role dell’altro prodotto. Semantic versioning obbligatorio. Nessun import runtime dell’altro app.

Riferimenti editoriali a entità commerciali: `API_READ_ONLY` (SPLIT-1 §15), non FK.

## 7. Confini dati

| Classe | Restano su Ponte | Restano su Centro Studi | Template/export |
|---|---|---|---|
| Identità e consensi | account, profili operativi, contatti, consensi, retention | record editoriali minimi autori/speaker solo dopo `S2-GATE-PERSONE-AUTORI` | no |
| Commerciale | imprese, membership, servizi, opportunità, matching | no | no |
| Editoriale/statistico | no (salvo link pubblici) | contenuti, fonti, Osservatorio, eventi CS | no |
| Cataloghi | istanza Ponte | istanza CS | sì |
| Eventi | eventi B2B se discriminati | eventi CS | schema tecnico duplicabile |
| Organizzazioni | operatori B2B | università/centri ricerca se discriminati | schema tecnico duplicabile |

## 8. Record che devono restare separati

Non trasferire e non replicare di default:

- account, sessioni, ruoli operativi, membership, grant;
- contatti e dati personali;
- richieste/offerte, opportunità commerciali, matching;
- consensi e log di cancellazione/riassegnazione;
- dati acquisiti da allowlist CS (non condividerli con Ponte);
- artefatti `ARCHIVIO`.

Eventi e contenuti già acquisiti: trasferimento solo con approvazione editoriale riga per riga (`S2-GATE-DATI-ACQUISITI`).

## 9. Autenticazione

- Transitorio: stesso progetto Supabase, configurazioni app separate; cookie e host destinati a divergere al cut-over.
- Target: identità CS autonome; eventuale SSO solo con `S2-GATE-SSO` e senza fusione privilegi.
- Sessioni non condivise fra prodotti dopo il cut-over dei domini.
- Cancellazione self-service e retention restano flussi Ponte finché CS non ha policy proprie.
- Retention, cancellazione self-service, anonimizzazione/minimizzazione e eventuale conservazione per obblighi legali o tutela dei diritti sono operazioni fisiche di **SPLIT-3**, non di SPLIT-2.

## 10. Autorizzazioni

| Ruolo | Può | Non può |
|---|---|---|
| Admin / ruoli operativi Ponte | amministrare account, imprese, matching Ponte | pubblicare o moderare come redazione CS per il solo fatto di essere admin Ponte |
| Editor / redazione CS | contenuti, eventi CS, Osservatorio secondo policy esistenti | membership, offerte, opportunità, dati commerciali Ponte |
| Utente autenticato Ponte | perimetro B2B | area redazione CS |
| Anonimo | solo pubblicato secondo RLS esistenti | review-only, dati personali, service-role |

Ogni eccezione richiede gate umano e aggiornamento inventario.

## 11. Privacy

- Finalità distinte: operativa/commerciale vs ricerca/divulgazione.
- Consensi non si considerano trasferibili fra prodotti.
- Documenti legali, cookie configuration e retention: distinti a target; transitorio: testi attuali restano delle route `PONTE_IMPRESE` finché `S2-GATE-LEGAL-CS` non produce l’equivalente CS.
- Retention, cancellazione self-service, anonimizzazione/minimizzazione e eventuale conservazione per obblighi legali o tutela dei diritti: disciplina fisica in SPLIT-3, senza implementazione in SPLIT-2.
- DPIA/valutazione legale rinviata come mitigazione SPLIT-1 §23, non eseguita qui.
- Nessuna lettura di `.env*` in questa unità.

## 12. Pipeline

Un solo owner operativo per ciascuna pipeline (vedi architettura target §16).

Regole:

- importer, publisher, scheduler, dry-run e credenziali seguono l’owner;
- allowlist non si mescolano;
- motore generico (normalizzazione, checksum, deduplica) può stare in `packages/core` solo se privo di allowlist e di dati;
- evidenze e manifest finiscono in `ARCHIVIO` o in docs di dominio, mai come dipendenza runtime dell’altra app.

## 13. Migration ownership

- Catena `supabase/migrations/**` immutabile in SPLIT-2.
- Ownership documentale per categoria file inventario (`PONTE_IMPRESE` / `CENTRO_STUDI` / `CONDIVISO` / `ARCHIVIO`).
- Oggetti SQL (1.959 occorrenze) restano legati al database proprietario: RLS, grant, revoke, trigger, indici, vincoli non si “condividono” operativamente.
- Baseline nuove: solo SPLIT-3, senza riscrivere la storia.
- `SCHEMA_TEMPLATE_DUPLICATO` e `PACKAGE_VERSIONATO` su file `migration_sql` non autorizzano `git mv` delle migration in SPLIT-2.
- Closeout `S2-COND-MIG-01`: i 34 `CONDIVISO` restano contabilizzati `CONDIVISO` (partizione 713 invariata). Destinazione **futura** (non trasferimento fisico):
  - cataloghi lingue/settori/paesi e nucleo schema eventi → `TEMPLATE_COMUNE` / SPLIT-3;
  - join `profile_*` / `business_*` / `professional_*` / `service_*` / `training_*` → destinazione DB Ponte;
  - `event_organizers` / `event_speakers` / `event_registrations` e `organization_officials` → `MISTO_GATE` (FK verso `profiles`/`businesses`; in SPLIT-3 non copiare le identità Ponte);
  - schema organizzazioni / RLS / seed culturale → `S2-GATE-ORG`.

## 14. Package condivisi

Contratto di package:

1. API pubblica minima ed esportata.
2. Nessun deep import.
3. Nessun secret.
4. Test contrattuale quando il package lascia lo stato scaffold.
5. Owner tecnico dichiarato nell’onda che lo popola.
6. `ui-foundation`: zero copy di prodotto, zero token di brand (i token restano nei CSS di app). Include `FormField` da `S2-COND-COMP-01`. Header/Footer/home/app/admin **non** entrano nel package. In `S2-EXTRACT-01` duplicato in `apps/ponteimprese/packages/ui-foundation` e `apps/centro-studi/packages/ui-foundation`. Root `packages/ui-foundation` preservato.
7. `product-config`: dopo `S2-GATE-BRAND` solo chiavi non grafiche (id prodotto, dominio previsto). In `S2-EXTRACT-01` ciascuna app ha una variante locale: PI esporta solo `ponteImpreseConfig`; CS esporta solo `centroStudiConfig`. Nessun dominio produzione inventato. Root `packages/product-config` (misto) preservato.
8. `core`: non creato. Copie PI di `safe-redirect` e `app-error` vivono in `apps/ponteimprese` (`S2-PI-CORE-01`). Originale root CONDIVISO. Client Supabase: copie PI in app; originale root.
9. `tooling-config`: non creato da `S2-COND-TOOL-01` (14 file inventario, 0 duplicati). Il tooling monorepo resta a root finché `src/` legacy lo richiede. `env.example` solo dopo `S2-GATE-ENV-EXAMPLE`.
10. Dopo `S2-EXTRACT-01` le app **non** dipendono dai package root per lo sviluppo standalone: `file:./packages/*` + `tsconfig` paths intra-app. `PI_ROOT_PACKAGE_DEPENDENCIES = 0`. `CS_ROOT_PACKAGE_DEPENDENCIES = 0`.

## 15. Regole anti-accoppiamento

1. Direzione unica `apps → packages`.
2. Un’app non importa l’altra.
3. Link incrociati = URL o ID esterni, non tabelle condivise.
4. Tolleranza all’indisponibilità dell’altro prodotto.
5. Navigation, layout e branding non sono package.
6. Client Supabase duplicati, env distinti.
7. Eccezioni: gate + riga inventario aggiornata **prima** del trasferimento.

## 16. Regole per future estrazioni in repository separati

Precondizioni (SPLIT-1 §20–22, piano W3):

1. Aggregato **W2 completa** chiuso: tutte le onde `S2-COND-*`, `S2-PI-*`, `S2-CS-*` e `S2-ARCH-01` (`ordine` 1–18) completate o esplicitamente rinviate con GO. I gate applicativi di workspace sono `RESOLVED_FOR_PRODUCT_WORKSPACES` (inclusi `S2-GATE-LINGUE-MERCATI` e `S2-GATE-CONTENUTI-GUIDE` in `S2-EXTRACT-01`). Restano aperti solo `SPLIT_3_PENDING` (`S2-GATE-ORG`, `S2-GATE-EVENTI`, `S2-GATE-MERCATI`, `S2-GATE-PERSONE-AUTORI`, `S2-GATE-DATI-ACQUISITI`) e `CUTOVER_PENDING` (`S2-GATE-SSO`, `S2-GATE-LEGAL-CS`, `S2-GATE-ANALYTICS`, `S2-GATE-CUTOVER`). `S2-CUTOVER-01` resta Prompt 8: DNS/deploy, non estrazione repository. L’insieme delle 18 dipendenze W2 è invariato. `S2-COND-DOCS-01` e `S2-COND-MIG-01` sono chiuse in sede documentale (12 docs a root; 34 SQL immutati con ownership futura registrata); non sbloccano il cut-over da sole.
2. Nessun import app-to-app.
3. Tag di split sul monorepo.
4. Derivazione dei due repository conservando la storia.
5. Rimozione del perimetro non di competenza solo con GO dedicato e manifest di provenienza.
6. Non cancellare `ARCHIVIO` né la catena Supabase originale in quell’atto.
7. Database fisicamente separati solo in SPLIT-3, dopo le baseline.
8. DNS e secret già distinti (`S2-CUTOVER-01` / `S2-GATE-CUTOVER`).

Fine documento. Closeout `S2-CS-CORE-01`: core Centro Studi in `apps/centro-studi`; PonteImprese invariato; residui CS-DOCS/TEST/MIG, legal, brand/SSO, SPLIT-3. Nessuna onda ARCH/CUTOVER.
