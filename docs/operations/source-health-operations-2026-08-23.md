# Observatory source-health operations

Data di riferimento: 2026-08-23
Stato: **TECHNICAL PASS / DEFAULT-BRANCH ACTIVATION PENDING**

Questo documento registra il comportamento operativo del controllo automatico delle fonti dell'Osservatorio. Non autorizza modifiche a production e non sostituisce il review editoriale delle fonti.

## Principio di sicurezza

`source-health-check.mjs` è un checker **read-only**. Deve leggere soltanto il registro pubblico delle fonti statistiche attive e verificare la raggiungibilità degli URL; non deve creare, modificare o pubblicare record.

La tabella `public.observatory_statistical_sources` in production è stata verificata in sola lettura il 2026-08-23:

- `anon` possiede `SELECT`;
- la policy `observatory_sources_public_read` espone soltanto righe con `lifecycle_status = 'active'`;
- le operazioni editoriali restano protette da policy separate.

Per questo motivo il checker **non necessita e non deve ricevere** `SUPABASE_SERVICE_ROLE_KEY`.

Il contratto corrente usa esclusivamente:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

La Editorial CI contiene un `Source-health least-privilege guard` che fallisce se script o workflow reintroducono `SUPABASE_SERVICE_ROLE_KEY` o se scompare il contratto della publishable key.

## Sicurezza rete / SSRF

Il checker:

- accetta solo `http:` e `https:`;
- rifiuta URL con credenziali incorporate;
- blocca localhost, `.localhost` e `.local`;
- blocca IPv4 private, loopback, link-local, metadata/reserved e multicast;
- blocca IPv6 loopback, ULA, link-local, documentation e IPv4-mapped;
- risolve DNS e rifiuta hostname che puntano anche a destinazioni private/reserved;
- segue redirect manualmente, rivalidando ogni destinazione, massimo 5 hop;
- usa timeout di rete;
- prova `HEAD` e usa un `GET` limitato come fallback per server che rifiutano `HEAD`;
- produce soltanto un artifact JSON e un riepilogo del job.

Il self-test SSRF/redirect/DNS è PASS in CI.

## Workflow GitHub

Workflow: `.github/workflows/source-health-weekly.yml`

Trigger configurati:

- `workflow_dispatch`;
- cron settimanale `15 5 * * 1`.

GitHub Actions esegue i workflow schedulati sul **default branch** e richiede che il workflow file esista sul default branch anche per `workflow_dispatch`.

Stato repository al 2026-08-23:

- il workflow esiste sul branch di lavoro e su `feature/institutional-identity`;
- il workflow **non esiste ancora su `main`**;
- `main` non viene modificato per anticipare artificialmente questo gate.

Di conseguenza il primo vero run schedulato è correttamente classificato come **gate operativo post-merge/default-branch e pre-go-live**, non come failure tecnica della feature branch.

## Configurazione richiesta prima del primo run su `main`

Prima di considerare attivo il monitoraggio devono esistere nei GitHub Actions secrets:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Non configurare `SUPABASE_SERVICE_ROLE_KEY` per questo workflow.

Se una variabile richiesta manca, lo script fallisce in modo esplicito invece di degradare silenziosamente.

## Primo run operativo — criteri di PASS

Dopo che il workflow è presente sul default branch:

1. eseguire il primo `workflow_dispatch` oppure osservare il primo cron;
2. verificare che il job utilizzi la publishable key e non una credenziale privilegiata;
3. verificare che l'artifact `observatory-source-health` sia prodotto;
4. verificare che il numero di fonti controllate sia coerente con le fonti `active` nel registro pubblico;
5. esaminare ogni redirect/failure senza modificare automaticamente la fonte;
6. se vi sono issue, aprire review editoriale/tecnica; nessuna fonte viene disattivata automaticamente;
7. registrare run ID, data, conteggio `ok/issues` nel documento di readiness.

Il gate si chiude soltanto con un run reale sul workflow del default branch. I controlli esterni manuali effettuati prima del merge sono evidenza supplementare, non un sostituto del run operativo.

## Stato corrente

- SSRF/redirect/DNS self-test: **PASS**;
- least-privilege CI guard: **PASS**;
- service-role nel checker/workflow: **RIMOSSA**;
- production RLS/grant necessari alla lettura anon: **VERIFICATI READ-ONLY**;
- cinque fonti istituzionali attive osservate nel registro production: **VERIFICATE READ-ONLY**;
- primo workflow run sul default branch: **PENDING POST-MERGE**;
- scritture production eseguite per questa verifica: **0**.
