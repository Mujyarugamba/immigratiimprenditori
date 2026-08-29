# Pre-merge gate reconciliation — Centro Studi

Data originaria: 2026-08-28  
Ultima riconciliazione: 2026-08-29  
Branch canonico: `work/pre-go-live-integration-20260826`  
PR: #13 — DRAFT

Questo addendum riconcilia gli stati operativi dei documenti di roadmap, runbook e closure kit datati 22–23 agosto 2026. Dove un documento storico usa branch, hosting o gate precedenti incompatibili con lo stato qui registrato, **questo addendum prevale per la decisione pre-merge corrente**. La cronologia precedente resta conservata come evidenza storica.

## Candidato corrente verificato

Ultimo HEAD tecnico-operativo completamente verificato prima della sola riconciliazione documentale corrente:

`5599ddf8160fc22370fa3b784f7f7e5150ea0213`

Esiti:

- `Editorial v1 CI` #1078: **SUCCESS**;
- `Supabase local migration validation` #611: **SUCCESS**;
- typecheck, suite test/guard, build, HTTP/security smoke, public browser E2E e Lighthouse: **PASS**;
- migration replay da zero, DB lint, RLS/publication, hybrid review, persistent rate limit, audit/analytics, backup archive, Auth integration, build contro Supabase locale e authenticated browser E2E: **PASS**.

Dopo questo candidato sono ammessi soltanto commit di riconciliazione documentale o correzioni di difetti reali. Ogni nuovo HEAD deve essere nuovamente verificato dai required checks prima di essere trattato come candidato congelato.

## Gate già chiusi

- Production release del 24 agosto: **PASS** — 25 migration di release applicate, hosted max `20260824103000_harden_publication_gate_execute_privileges`.
- Production-source restore drill: **PASS**.
- Governance editoriale: **ibrida, decisa e attiva nel Production DB**.
- Production privileged MFA a livello DB/Auth: **PASS** — due amministratori applicativi attivi e almeno un TOTP verificato associato ad amministratore attivo.
- Branch protection: **Protect main ACTIVE**, required checks strict `verify` + `validate-local-database`, nessun bypass actor.
- Vercel duplicate-build boundary Production: **CHIUSA** — il progetto Production `immigratiimprenditori` usa Production Branch `production` e salta i ref diversi da `production`.
- Configurazione progetto Preview: **PASS** — Vercel `immigratiimprenditori-preview`, Production Branch interno `main`, `NEXT_PUBLIC_PREVIEW_READ_ONLY=true`.
- Netlify Git-triggered Preview: **non target finale**.
- Lighthouse/quality gate automatico: **PASS** sul candidato tecnico verificato.
- QA visivo Preview mini-trend/header/footer/favicon/console: **PASS** su 1440×900, 390×844 e 320×844.
- Storie reali: **non sono gate pre-go-live**; superficie e workflow sono pronti, popolamento reale post-go-live.

## Nuovo delta candidato — traduzioni AI editoriali

Il ledger canonico `supabase/CS-PRODUCTION-RELEASE.json` registra ora:

- `appliedReleaseDelta`: **25 migration**;
- `candidateDelta`: **1 migration**;
- candidato: `20260829120000_create_content_ai_translations.sql`;
- hosted latest osservata: `20260824103000_harden_publication_gate_execute_privileges`;
- migration rows post-release già applicato: **234**.

La migration candidata **non è stata applicata a Production**.

Il candidato AI è stato validato nel replay locale e nella CI e introduce una cache separata `content_ai_translations` con RLS e vincoli di coerenza, inclusa la corrispondenza della lingua sorgente con il record `contents`.

### Boundary di sicurezza/costo AI

Sul candidato tecnico verificato:

- la sorgente inviata alla traduzione usa il body pubblico sanitizzato;
- le code tecniche di acquisizione `d1d_*` sono eliminate prima di fingerprint, fallback, validazione e invio al provider;
- il fingerprint è difensivamente insensibile alla coda tecnica;
- il runtime pubblico è **cache-only**: visite anonime e crawler non possono generare chiamate OpenAI;
- la generazione richiede un percorso esplicito `allowGenerate: true`, usato dal backfill amministrativo;
- il backfill resta **non autorizzato / non eseguito**;
- la chiamata OpenAI usa `store: false`, reasoning effort `none`, limite di output, timeout/abort e fallback sicuro;
- risposte incomplete/non completate non vengono trattate come traduzioni valide;
- `store: false` non viene presentato come Zero Data Retention;
- Privacy e Politica editoriale sono state aggiornate per descrivere il provider AI, la finalità di traduzione dei soli contenuti già pubblicati, l'assenza di decisioni automatizzate significative e la prevalenza dell'originale.

### Stato Production del delta AI

`AI_TRANSLATION_MIGRATION_PRODUCTION = PENDING / NOT AUTHORIZED`

`AI_TRANSLATION_BACKFILL = PENDING / NOT AUTHORIZED`

Il verde della CI non costituisce autorizzazione a:

- applicare la migration candidata a Production;
- inserire il secret OpenAI in uno scope non ancora autorizzato;
- eseguire il backfill;
- abilitare generazione on-demand pubblica.

Prima di una futura write Production restano obbligatori nuova lettura hosted, fresh backup quando previsto, verifica del delta e autorizzazione esplicita secondo la release policy.

## Configurazione Vercel Preview verificata — PASS

Progetto: `immigratiimprenditori-preview`.

Configurazione canonica:

- Production Branch = **`main`**;
- Ignored Build Step:
  `if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" = "production" ]; then exit 0; else exit 1; fi`
- il progetto Preview salta esclusivamente il branch Git `production` e costruisce `main` + branch di lavoro;
- `NEXT_PUBLIC_PREVIEW_READ_ONLY=true` confermato nello scope Production del progetto Preview.

Il runtime Preview resta fail-closed/read-only rispetto alle mutazioni e all'indicizzazione.

## QA visivo registrato

Preview verificato sul commit applicativo `3c6b464f4666075a872bde6c0a6f07568450a1f7`:

`https://immigratiimprenditori-preview-rhrix8jmw-inquotus-projects.vercel.app/`

Esiti:

- mini-trend “Imprese straniere registrate”: PASS (`giu 2025` → `dic 2025`, fonte leggibile, nessuna sovrapposizione/troncamento; wrapping leggibile a 320 px);
- header logo: PASS;
- footer logo `next/image`: PASS;
- favicon: PASS;
- console/network: PASS, nessun overlay Next.js e nessuna risorsa >=400.

Le modifiche successive non hanno introdotto cambi di layout alla homepage che invalidino questo QA.

## #92 WCAG/device — copertura automatica corrente

Il gate automatico non equivale a una certificazione WCAG completa, ma copre:

- reflow 320/390/768 px;
- sette lingue e `dir=rtl` per l'arabo;
- skip-link e focus visibile;
- navigazione header stretta via tastiera con focus portato nel viewport;
- `/cerca`: input, filtri e submit raggiungibili da tastiera;
- `/accedi`: email, password e submit raggiungibili da tastiera;
- `/contribuisci`: controlli essenziali fino a privacy/autorizzazione e submit raggiungibili via `Tab`, incluso scroll nativo del focus a 320 px;
- `/ar`, `/ar/osservatorio`, `/ar/contribuisci`: RTL e assenza di overflow orizzontale a 320 px;
- associazione semantica degli errori server al modulo;
- WCAG text-spacing e target-size automatici sulle superfici pertinenti.

Il residuo umano di #92 resta concentrato su **screen reader reale, zoom browser 200/400%, dispositivi fisici e valutazione qualitativa finale di focus/ordine di lettura/RTL/moduli**.

## Documenti legali — stato corrente

I testi applicativi sono stati aggiornati tecnicamente per il candidato AI:

- Privacy: OpenAI dichiarato come provider per traduzione di contenuti editoriali già pubblicati; finalità, trasferimenti, cache e assenza di decisioni automatizzate con effetti giuridici o analogamente significativi esplicitati;
- Politica editoriale: traduzioni automatiche distinguibili dall'originale, possibile assenza di revisione umana preventiva, original language version prevalente in caso di dubbio/discrepanza;
- i guard legali verificano le disclosure sostanziali senza dipendere da whitespace JSX fragile.

Questo aggiornamento tecnico **non sostituisce** la revisione legale professionale. Il sign-off resta necessario su basi giuridiche, cookie/banner, fornitori/trasferimenti, retention, IP/media/minori/responsabilità e documentazione interna applicabile, inclusa la configurazione definitiva del trattamento con provider AI.

## Smoke remoto Production — pronto

Il percorso post-deploy è predisposto con workflow manuale e checker GET-only.

Il checker remoto verifica:

- homepage e security headers;
- `/chi-siamo`, `/privacy`, `/cookie`, `/termini`, `/accedi`;
- `/osservatorio`, `/atlante`, `/storie`, `/eventi`, `/fonti`, `/open-data`;
- `/api/open-data/indicators` con contratto JSON `dataset`, `record_count`, `filters`, `records`;
- `robots.txt` crawlable in Production con `/app/` esclusa;
- `/app/redazione` protetta e rediretta a `/accedi`.

Il workflow è `workflow_dispatch`, `contents: read`, senza service-role e senza metodi mutanti; richiede che `production` sia già sullo stesso SHA approvato di `main`. Il target è HTTPS allowlisted e i redirect non vengono seguiti automaticamente. L'artifact JSON viene caricato anche in caso di FAIL.

## Gate ancora PENDING prima della decisione di merge

Restano **tre gate pre-merge**:

1. **#92 QA umano finale WCAG/device**, con residuo ristretto come sopra.
2. **Revisione legale professionale** e relativo sign-off.
3. **Autorizzazione esplicita alla decisione di merge**.

Non sono gate pre-merge:

- governance editoriale;
- release Production già applicato del 24 agosto;
- backup/restore;
- branch protection/required checks;
- configurazione Vercel Production/Preview;
- MFA logica TOTP/AAL2 in CI;
- QA visivo mini-trend/header/footer/favicon;
- contenuto reale Storie.

La migration AI candidata e il backfill sono invece gate di **release/attivazione Production separati**: possono restare non applicati/non eseguiti anche dopo una decisione di merge, finché non arriva un'autorizzazione esplicita dedicata.

## Gate post-merge / pre-go-live

Dopo un eventuale merge autorizzato, ma **prima di rendere il sito pubblico**, restano:

1. primo source-health run reale dal default branch;
2. decisione separata sulla migration candidata AI e, se autorizzata, fresh backup + apply puntuale + postflight;
3. eventuale dry-run/backfill AI controllato e verifica cache/costi;
4. recheck login + TOTP/AAL2 con account amministrativo reale sul vero frontend Vercel Production;
5. autorizzazione separata al deploy Production mediante avanzamento controllato del branch Git `production`;
6. verifica che il workflow manuale di promozione mantenga le condizioni fail-closed e il fast-forward;
7. Production smoke Vercel;
8. performance/security smoke sul target Production reale;
9. live smoke sul dominio reale;
10. eventuale cutover DNS solo dopo PASS e autorizzazione, senza alterare i record mail.

Merge, migration AI/backfill e deploy restano decisioni separate.

## Hosting canonico

- Preview: **Vercel `immigratiimprenditori-preview`**, Production Branch interno `main`, fail-closed/read-only tramite `NEXT_PUBLIC_PREVIEW_READ_ONLY=true`.
- Production: **Vercel `immigratiimprenditori`**, Production Branch Git **`production`**.
- Il progetto Production usa come Ignored Build Step:
  `if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "production" ]; then exit 0; else exit 1; fi`
- Il progetto Preview usa come Ignored Build Step:
  `if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" = "production" ]; then exit 0; else exit 1; fi`
- `main` può quindi essere integrato senza promuovere automaticamente l'applicazione Production.
- `vercel.json` non contiene logica di branch separation; resta condiviso e non va usato per distinguere i due progetti.
- il vecchio Deploy Hook `Immi-hook` collegato a `main` non è il percorso canonico di promozione e non va invocato per il go-live;
- Netlify non è il target Production corrente.

## Radar e outreach

`editorial-radar-nightly` può raccogliere candidati `status=new` nella Inbox redazionale privata. Questa write review-only è consentita e non costituisce pubblicazione.

Vincoli invarianti:

- `auto_publish=false`;
- nessun invito, email, richiesta di intervista, messaggio o altro contatto esterno prima del go-live + live smoke PASS;
- shortlist, candidati e bozze possono restare internamente in redazione in attesa di verifica;
- nessun contenuto fittizio o placeholder per chiudere gate editoriali.

## Decisione pre-merge corrente

Stato tecnico automatico dell'ultimo candidato applicativo verificato: **PASS**.

Il nuovo HEAD documentale deve a sua volta completare i due required checks prima di essere congelato come candidato finale.

Gate umani/professionali ancora aperti:

- `HUMAN_WCAG_DEVICE_QA = PENDING`;
- `LEGAL_PROFESSIONAL_REVIEW = PENDING`;
- `MERGE_AUTHORIZATION = PENDING`.

Gate AI Production separati:

- `AI_TRANSLATION_MIGRATION_PRODUCTION = PENDING`;
- `AI_TRANSLATION_BACKFILL = PENDING`.

`PRE_MERGE_READINESS = PENDING` finché i tre gate pre-merge non sono chiusi.
