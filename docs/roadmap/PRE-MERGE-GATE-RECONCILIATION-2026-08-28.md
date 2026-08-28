# Pre-merge gate reconciliation — Centro Studi

Data: 2026-08-28
Branch canonico: `work/pre-go-live-integration-20260826`
PR: #13 — DRAFT

Questo addendum riconcilia gli stati operativi dei documenti di roadmap, runbook e closure kit datati 22–23 agosto 2026. Dove un documento storico usa branch, hosting o gate precedenti incompatibili con lo stato qui registrato, **questo addendum prevale per la decisione pre-merge corrente**. La cronologia precedente resta conservata come evidenza storica.

## Candidato tecnico verificato

Ultimo HEAD completamente verificato prima di questo aggiornamento documentale:

`dc80a527ac84deb84f9504f025ccea57c2935e37`

Esiti:

- `Editorial v1 CI` #1053: **SUCCESS**;
- `Supabase local migration validation` #586: **SUCCESS**;
- unit/integration: **124/124 PASS**;
- public browser E2E: **12/12 PASS**;
- build, HTTP/security smoke, Lighthouse, functional gates, Radar/source-health self-test, privacy/security guards e dependency audit: **PASS**;
- migration replay, DB lint, RLS/publication, hybrid review, persistent rate limit, audit/analytics, backup archive, Auth integration, build contro Supabase locale e authenticated browser E2E: **PASS**.

Gli ultimi cambi rispetto al runtime visualmente validato riguardano test/CI e documentazione, non il layout applicativo.

## Gate già chiusi

- Production migration release: **PASS** — 25 migration di release applicate; `candidateDelta = []`; hosted max `20260824103000_harden_publication_gate_execute_privileges`.
- Production-source restore drill: **PASS**.
- Governance editoriale: **ibrida, decisa e attiva nel Production DB**.
- Production privileged MFA a livello DB/Auth: **PASS** — due amministratori applicativi attivi e almeno un TOTP verificato associato ad amministratore attivo.
- Branch protection: **Protect main ACTIVE**, required checks strict `verify` + `validate-local-database`, nessun bypass actor.
- Vercel duplicate-build boundary: **CHIUSA** — il progetto Production `immigratiimprenditori` usa Production Branch `production` e salta i ref diversi da `production`; il progetto `immigratiimprenditori-preview` resta il percorso Preview canonico.
- Netlify Git-triggered Preview: **canceled/neutralizzato**; non è il target Production.
- Lighthouse/quality gate automatico: **PASS** sul candidato corrente.
- QA visivo Preview mini-trend/header/footer/favicon/console: **PASS** su 1440×900, 390×844 e 320×844.
- Storie reali: **non sono gate pre-go-live**; superficie e workflow sono pronti, popolamento reale post-go-live.

## QA visivo registrato

Preview verificato sul commit applicativo `3c6b464f4666075a872bde6c0a6f07568450a1f7`:

`https://immigratiimprenditori-preview-rhrix8jmw-inquotus-projects.vercel.app/`

Esiti:

- mini-trend “Imprese straniere registrate”: PASS (`giu 2025` → `dic 2025`, fonte leggibile, nessuna sovrapposizione/troncamento; wrapping leggibile a 320 px);
- header logo: PASS;
- footer logo `next/image`: PASS;
- favicon: PASS, asset 200 e nessuna richiesta `/favicon.ico`;
- console/network: PASS, nessun overlay Next.js e nessuna risorsa >=400.

Dal commit visualmente validato al candidato `dc80a527ac84deb84f9504f025ccea57c2935e37` non sono state introdotte modifiche di layout alla homepage. Le modifiche successive pertinenti a questo gate sono test/CI, release metadata e boundary operativi; il QA visivo resta quindi applicabile al runtime corrente.

## #92 WCAG/device — copertura automatica corrente

Il gate automatico non equivale a una certificazione WCAG completa, ma ora copre anche:

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

Il residuo umano di #92 resta quindi concentrato su **screen reader reale, zoom browser 200/400%, dispositivi fisici e valutazione qualitativa finale di focus/ordine di lettura/RTL/moduli**.

## Gate ancora PENDING prima della decisione di merge

1. **#92 QA umano finale WCAG/device**, con residuo ristretto come sopra.
2. **Revisione legale professionale**: dossier tecnico pronto; il record di sign-off Privacy/Cookie/Termini/fornitori/retention/IP resta da compilare da professionista competente.
3. **Configurazione finale del progetto Vercel Preview**, se non ancora completata: mantenere il progetto Preview fail-closed/read-only e impedire build duplicati sul branch Git `production`.
4. **Autorizzazione esplicita alla decisione di merge**.

Non sono più gate pre-merge:

- governance editoriale;
- migration Production;
- backup/restore;
- branch protection/required checks;
- MFA logica TOTP/AAL2 in CI;
- QA visivo mini-trend/header/footer/favicon;
- contenuto reale Storie.

## Gate post-merge / pre-go-live

Dopo un eventuale merge autorizzato, ma **prima di rendere il sito pubblico**, restano:

- primo source-health run reale dal default branch;
- recheck login + TOTP/AAL2 con account amministrativo reale sul vero frontend Vercel Production;
- autorizzazione separata al deploy Production mediante avanzamento controllato del branch Git `production`;
- verifica che il workflow manuale di promozione mantenga le condizioni fail-closed e il fast-forward;
- protected Production smoke Vercel;
- performance/smoke sul target Production reale;
- live smoke sul dominio reale;
- eventuale cutover DNS solo dopo PASS e autorizzazione, senza alterare i record mail.

Merge e deploy restano due decisioni separate.

## Hosting canonico

- Preview: **Vercel `immigratiimprenditori-preview`**, fail-closed/read-only.
- Production: **Vercel `immigratiimprenditori`**, Production Branch Git **`production`**.
- Il progetto Production usa come Ignored Build Step:
  `if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "production" ]; then exit 0; else exit 1; fi`
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

`PRE_MERGE_READINESS = PENDING` finché i quattro gate pre-merge sopra non sono chiusi.
