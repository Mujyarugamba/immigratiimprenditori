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

Gate esplicito sul residuo `src/app/organizzazioni/loading.tsx` (`S2-GATE-ORG-LOADING`, onda `S2-COND-LIB-01`): file ancora `CONDIVISO`; ownership di prodotto non assegnata. Dettaglio closeout in `S2-COND-FINAL-01` sotto.

Gate esplicito sul residuo `src/app/eventi/loading.tsx` (`S2-GATE-EVENTI-LOADING`, onda `S2-PI-APP-01`): file `PONTE_IMPRESE`, oggetto `EventiLoading` `CONDIVISO`; incoerenza preesistente non risolta per inferenza.

Gate esplicito `S2-GATE-SAFE-REDIRECT` (onda `S2-COND-UTIL-01`): `src/lib/auth/safe-redirect.ts` e `src/lib/auth/safe-redirect.test.ts` restano `CONDIVISO` nei path originali. La validazione di redirect relativo è tecnicamente neutra; il default/fallback `"/app"` (e i test su `/app`, `/app/profilo`) è policy applicativa PonteImprese. Non estratti in `packages/core`. Decisioni future ammesse, senza sceglierle ora: (1) separare una funzione neutra di validazione/normalizzazione e lasciare il fallback a PonteImprese; (2) ownership integrale PonteImprese; (3) altra soluzione dimostrata che non introduca policy di prodotto nel package condiviso.

Gate esplicito `S2-GATE-APP-ERROR` (onda `S2-COND-UTIL-01`): `src/lib/errors/app-error.ts` e `src/lib/errors/app-error.test.ts` restano `CONDIVISO` nei path originali. Nucleo potenzialmente neutro: tipi errore, `appError`, `toUserMessage`. Parte non neutra: `mapPostgresError`, SQLSTATE/schema, `profiles_slug_key`, mapping membership/grant/impresa/bootstrap (dominio PonteImprese). File misto: nessun trasferimento integrale in `packages/core` e nessuno split in questa unità. Decisioni future ammesse, senza sceglierle ora: (1) estrarre solo il nucleo neutro in `packages/core` e lasciare mapping PostgreSQL/dominio a PonteImprese; (2) ownership integrale PonteImprese; (3) altra soluzione dimostrata.

Gate esplicito `S2-GATE-ENV-EXAMPLE` (onda `S2-COND-TOOL-01`): root `env.example` resta `CONDIVISO` nel path originale. Documenta nomi di variabili, non valori segreti. Parte potenzialmente comune: URL/chiavi pubbliche Supabase locali. Parte PonteImprese: `SUPABASE_SERVICE_ROLE_KEY` per `access_provision_account`, `LEGAL_SUBJECT_HMAC_SECRET` / `legal_retention_records`, checklist Vercel. Non duplicato verso le app. Decisioni future ammesse, senza sceglierle ora: (1) esempi per-app distinti; (2) restare solo root fino al cut-over; (3) altra soluzione dimostrata. Non copiare il file così com’è in Centro Studi.

Gate esplicito `S2-GATE-HOME-LAYOUT` (onda `S2-COND-COMP-01`): `src/components/layout/Header.tsx`, `Footer.tsx` e i sette file `src/components/home/**` restano `CONDIVISO` in sede. Brand «Immigrati Imprenditori», copy ecosistemi, route `/imprese` `/registrati` `/app` `/accedi`. Non estratti in package. Decisioni future: duplicare e specializzare per app nelle onde PI/CS; non package condiviso.

Gate esplicito `S2-GATE-APP-COMPONENTS` (onda `S2-COND-COMP-01`): i 15 file `src/components/app/**` e `src/components/auth/AuthForm.tsx` restano in sede. Area riservata, imprese, membership, admin, redazione mista, server actions. Non package. Decisioni future: duplicare per app dopo il trasferimento delle route; la redazione mista segue i gate già aperti.

Gate esplicito `S2-GATE-PUBLIC-LEGAL-COMP` (onda `S2-COND-COMP-01`): `src/components/public/**` (9 file), `legal/**` (2 file) e `src/components/sections/SectionPage.tsx` restano in sede. Catalogo pubblico del sito misto; `PersonNetworkContact` usa `/accedi`; `LegalDocumentPage` carica documenti legali PI. Non package. Decisioni future: duplicare con le page pubbliche; equivalenti CS dopo `S2-GATE-LEGAL-CS`.

Gate esplicito `S2-GATE-LINGUE-MERCATI` (onda `S2-COND-LIB-01`, closeout `S2-COND-FINAL-01`): `src/app/lingue-e-mercati/page.tsx` resta `CONDIVISO` in sede. Il file esegue solo `redirect("/mercati")`. Non inferire ownership dalle page mercati. Decisioni future: duplicare, contratto, o assegnare dopo verifica route; non in questa unità.

Gate esplicito `S2-GATE-ORG-LOADING` (onda `S2-COND-LIB-01`, closeout `S2-COND-FINAL-01`): `src/app/organizzazioni/loading.tsx` resta `CONDIVISO`. Usa `LoadingState` da `states.tsx` con copy «Caricamento organizzazioni…». Non inferirlo da `organizzazioni/[slug]/page.tsx` (`PONTE_IMPRESE`). Decisioni future: mantenere condiviso, duplicare, o assegnare a PonteImprese dopo verifica route/layout.

Gate esplicito `S2-GATE-SUPABASE-CLIENT` (onda `S2-COND-LIB-01`, closeout `S2-COND-FINAL-01`): `src/lib/supabase/client.ts` e `src/lib/supabase/server.ts` restano root legacy. Factory `@supabase/ssr` + `getPublicSupabaseEnv`. Non estratti in package. Non duplicati ora in `apps/*` (onde PI/CS non eseguite). Target: un client per app con env distinti.

`src/lib/data/README.md` resta root (baseline del data layer misto del monorepo). `src/lib/data/public/organizations.ts` resta in sede sotto `S2-GATE-ORG` (letture pubbliche organizzazioni + join `organization_officials`/`profiles`; non package). Il cluster Eventi `allowlist.ts` / `acquisition.ts` / `dry-run.ts` (+ test) resta in sede sotto `S2-GATE-EVENTI`: l’allowlist è specifica di prodotto (fonti PIM/MinLavoro/Unioncamere/EMN); il motore importa l’allowlist e non è estraibile senza split. Nessun `packages/core` creato per uno o due file.

`S2-COND-DOCS-01` (closeout `S2-COND-FINAL-01`): i 12 `docs/%` `CONDIVISO` restano root. Baseline comune (`architecture-baseline`, `costituzione-piattaforma`, `domain-model`, `platform-data-specification`). Docs D1 opportunità (`d1-b1`, `d1-b2`): destinazione futura PonteImprese, non spostati (onda PI docs non eseguita). Docs D1 eventi: template/gate `S2-GATE-EVENTI`. Docs organizzazioni: `S2-GATE-ORG`. Nessuna duplicazione fisica nelle app finché il monorepo è fonte autoritativa.

`S2-COND-MIG-01` (closeout `S2-COND-FINAL-01`): 34 file `supabase/%` immutati. Ownership futura in architettura target §9 e in §13 sotto. Nessuna esecuzione SQL. Nessun albero duplicato.

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
6. `ui-foundation`: zero copy di prodotto, zero token di brand (i token restano nei CSS di app). Include `FormField` da `S2-COND-COMP-01`. Header/Footer/home/app/admin **non** entrano nel package.
7. `product-config`: dopo `S2-GATE-BRAND` solo chiavi non grafiche (id prodotto, dominio previsto).
8. `core`: non creato da `S2-COND-UTIL-01` né da `S2-COND-LIB-01`. Nessuna policy di prodotto (`"/app"`, mapping dominio/DB, allowlist Eventi, client Supabase) nel package. Popolamento ammesso solo dopo i gate UTIL e dopo eventuale split dimostrabile del motore Eventi. Client Supabase: `S2-GATE-SUPABASE-CLIENT`, non package.
9. `tooling-config`: non creato da `S2-COND-TOOL-01` (14 file inventario, 0 duplicati). Il tooling monorepo resta a root finché `src/` legacy lo richiede. `env.example` solo dopo `S2-GATE-ENV-EXAMPLE`.

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

1. Aggregato **W2 completa** chiuso: tutte le onde `S2-COND-*`, `S2-PI-*`, `S2-CS-*` e `S2-ARCH-01` (`ordine` 1–18) completate o esplicitamente rinviate con GO. Un’onda con gate aperti (oggi `S2-COND-UTIL-01` / `S2-GATE-SAFE-REDIRECT` / `S2-GATE-APP-ERROR`, `S2-COND-TOOL-01` / `S2-GATE-ENV-EXAMPLE`, `S2-COND-COMP-01` / `S2-GATE-HOME-LAYOUT` / `S2-GATE-APP-COMPONENTS` / `S2-GATE-PUBLIC-LEGAL-COMP`, `S2-COND-LIB-01` / `S2-GATE-LINGUE-MERCATI` / `S2-GATE-ORG` / `S2-GATE-EVENTI` / `S2-GATE-ORG-LOADING` / `S2-GATE-SUPABASE-CLIENT`) **non** soddisfa la propria condizione di completamento finale. `S2-CUTOVER-01` non può partire dopo sole `S2-PI-APP-01`, `S2-CS-APP-01` e `S2-ARCH-01`, né mentre quei gate restano irrisolti. L’insieme delle 18 dipendenze W2 è invariato. `S2-COND-DOCS-01` e `S2-COND-MIG-01` sono chiuse in sede documentale (12 docs a root; 34 SQL immutati con ownership futura registrata); non sbloccano il cut-over da sole.
2. Nessun import app-to-app.
3. Tag di split sul monorepo.
4. Derivazione dei due repository conservando la storia.
5. Rimozione del perimetro non di competenza solo con GO dedicato e manifest di provenienza.
6. Non cancellare `ARCHIVIO` né la catena Supabase originale in quell’atto.
7. Database fisicamente separati solo in SPLIT-3, dopo le baseline.
8. DNS e secret già distinti (`S2-CUTOVER-01` / `S2-GATE-CUTOVER`).

Fine documento. Closeout `S2-COND-FINAL-01`: 57 file CONDIVISO residui classificati; 0 git mv; 0 SQL; gate residui assegnati. Nessuna onda PI/CS/ARCH/CUTOVER.
