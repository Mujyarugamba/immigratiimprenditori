# Vercel Production runbook — stato riconciliato 28 agosto 2026

Stato: **PRODUCTION BOUNDARY VERIFICATO / PREVIEW PROJECT FINAL CONFIG PENDING / PRODUCTION APPLICATION DEPLOY NON AUTORIZZATO**  
Branch candidato corrente: `work/pre-go-live-integration-20260826`  
PR: **#13 — DRAFT**  
Production branch applicativo: `production`

## Obiettivo

Portare ImmigratiImprenditori.it su Vercel Production con un rilascio controllato, senza promuovere un artifact Preview e senza aprire il sito al pubblico prima degli smoke finali.

Questo runbook non autorizza merge, deploy Production, DNS, migration o altre write Production.

## Confini non negoziabili

- Nessun outreach/invito/intervista prima che il sito sia online e il live smoke sia PASS.
- Il Radar può scrivere candidati review-only nella Inbox redazionale privata; non può auto-pubblicare né contattare soggetti esterni.
- Nessuna futura write database Production diversa dalla normale raccolta review-only già autorizzata senza fresh hosted-state read, backup pertinente e autorizzazione esplicita.
- I Vercel Preview restano **read-only + noindex**.
- `SUPABASE_SERVICE_ROLE_KEY` è **Production-only**, server-side e mai esposta ai Preview/client.
- Un Preview non viene promosso a Production: Preview e Production hanno contratti diversi incorporati nel build.
- `main` non viene modificato/mergeato automaticamente.
- Merge e deploy Production richiedono autorizzazioni separate.
- Il deploy applicativo Production avviene soltanto tramite avanzamento deliberato del branch Git `production`.

## 1. Topologia Vercel corrente — PRODUCTION PROJECT VERIFICATO

Team: `inquotus-projects`.

Progetti:

- Production: `immigratiimprenditori`;
- Preview canonico: `immigratiimprenditori-preview`.

Sul progetto Production è configurato:

- Production Branch: **`production`**;
- Ignored Build Step:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "production" ]; then exit 0; else exit 1; fi
```

Semantica Vercel:

- exit `0` = build ignorato;
- exit `1` = build eseguito.

Comportamento verificato su più commit consecutivi del branch candidato:

- `immigratiimprenditori` Production project: **Canceled by Ignored Build Step**;
- `immigratiimprenditori-preview`: deployment completato;
- Netlify deploy-preview: **canceled**.

Quindi:

- branch di lavoro e `main` non generano build applicativi sul progetto Production;
- soltanto il branch Git `production` è autorizzato dal progetto Production a costruire;
- il merge su `main` non equivale più a deploy Production;
- il percorso Preview canonico è `immigratiimprenditori-preview`.

`VERCEL_PRODUCTION_BOUNDARY = PASS`

### Configurazione finale progetto Preview — PENDING dashboard/Cursor

Per preservare un Preview stabile/read-only anche quando il progetto Preview tratta `main` come proprio Production Branch, verificare via dashboard/Cursor:

- Production Branch del progetto `immigratiimprenditori-preview`: `main`;
- `NEXT_PUBLIC_PREVIEW_READ_ONLY=true` nell'ambiente Production del progetto Preview;
- Ignored Build Step del progetto Preview che salti esclusivamente il branch Git `production` e permetta `main` + branch di lavoro.

Il connettore Vercel disponibile nella sessione del 28 agosto non espone i due progetti `immigratiimprenditori` (lookup 404; project list parziale), quindi questo controllo resta esplicitamente dashboard/Cursor e non viene dichiarato PASS per inferenza.

## 2. Environment matrix

### Preview

Richieste:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- `NEXT_PUBLIC_PREVIEW_READ_ONLY=true` quando il progetto Preview viene eseguito nel proprio ambiente Vercel Production/stabile.

Non configurare:

- `SUPABASE_SERVICE_ROLE_KEY`.

Il codice riconosce i Preview Vercel e il flag esplicito read-only e applica il contratto fail-closed/noindex previsto, incluso blocco delle mutazioni e analytics applicativi disabilitati.

### Production

Da verificare sul progetto Production prima del primo deploy applicativo autorizzato:

- `NEXT_PUBLIC_SUPABASE_URL` del progetto hosted corretto;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` corretta;
- `NEXT_PUBLIC_SITE_URL` uguale all'origine HTTPS Production effettiva;
- `SUPABASE_SERVICE_ROLE_KEY` presente soltanto nello scope Production e server-side;
- `NEXT_PUBLIC_PREVIEW_READ_ONLY` assente/false sul vero target Production;
- flag privacy analytics nello stato deliberatamente approvato.

Non copiare valori segreti in chat, commit, issue, PR body o log.

## 3. Regione Functions

`vercel.json` mantiene `cdg1` come regione primaria delle Functions. Supabase è in `eu-west-3` (Parigi). Non modificare `vercel.json` per gestire la separazione Preview/Production: la separazione è project-level e branch-level.

## 4. Stato database Production — GIÀ ALLINEATO

La precedente versione di questo runbook descriveva una futura applicazione di migration. Quella fase è conclusa e non deve essere ripetuta.

Stato canonico corrente in `supabase/CS-PRODUCTION-RELEASE.json`:

- schema manifest: **v2**;
- baseline hosted pre-release: `20260820160000_prepare_events_external_ingestion_rls`;
- hosted latest post-release: `20260824103000_harden_publication_gate_execute_privileges`;
- migration rows post-apply: **234**;
- `appliedReleaseDelta`: **25**;
- `candidateDelta`: **0**.

Evidenze apply:

- fase #1–#19: run `32699707002` — SUCCESS;
- fase #20–#24: run `32706028947` — SUCCESS;
- hardening #25: run `32707529881` — SUCCESS.

**Non applicare le vecchie migration come se fossero ancora candidate.** Con `candidateDelta=[]` non c'è alcuna migration da applicare.

Ogni futura migration richiede un nuovo piano basato su fresh hosted-state read.

## 5. Backup / recovery — GATE CHIUSI

- `CI_EPHEMERAL_RESTORE_DRILL = PASS`;
- `PRODUCTION_SOURCE_RESTORE_DRILL = PASS`.

Evidenza canonica restore:

`docs/operations/production-source-restore-drill-2026-08-23.md`

Evidenza security patch:

`docs/operations/production-security-patch-2026-08-24.md`

Per la patch #25 è registrato l'artifact cifrato `9512852962` con digest:

`sha256:bc96aa18621f58cd397cae13dfc869cdae67924df28796445412ee6e6eee5cb6`

Gli artifact GitHub hanno retention finita e non sostituiscono un fresh backup prima di future write Production.

## 6. MFA reale Production

Stato DB/Auth già chiuso:

- amministratori applicativi attivi: **2**;
- fattori TOTP verificati collegati a un amministratore attivo: **1**;
- enforcement AAL2 applicato;
- `PRODUCTION_PRIVILEGED_MFA = PASS`.

La logica applicativa TOTP/AAL2 è inoltre coperta dall'E2E autenticato locale: enrollment TOTP reale, verifica OTP, passaggio AAL1→AAL2 e accesso redazionale sono PASS.

Resta un controllo distinto **post-merge / pre-go-live**: verificare login + challenge TOTP/AAL2 dell'account amministrativo reale attraverso il vero frontend Vercel Production prima della rimozione di eventuali safety fallback.

## 7. Required checks `main`

Ruleset GitHub `Protect main`: **ACTIVE**.

Required status checks con strict policy:

- `verify`;
- `validate-local-database`.

Il ruleset blocca deletion e non-fast-forward e richiede pull request. Non risultano bypass actors.

Il check Vercel Preview non è attualmente un required status check del ruleset; resta un controllo operativo esplicito del candidato.

## 8. Gate pre-merge ancora aperti

Sul candidato `bf498e288e1aa0a5735e30749b1becd3adb47b3c`:

- Editorial v1 CI #1054: **SUCCESS**;
- Supabase local migration validation #587: **SUCCESS**;
- QA visivo Preview mini-trend/header/footer/favicon/console: **PASS**;
- QA automatico #92 ampliato: **PASS** per tastiera core/form, RTL 320, reflow, text-spacing e target-size.

Restano prima della decisione finale di merge:

1. **QA umano WCAG/device #92** nel residuo non sostituibile onestamente dall'automazione: screen reader reale, zoom browser 200/400%, device fisici e valutazione qualitativa finale;
2. **revisione legale professionale** con sign-off;
3. **verifica finale dashboard/Cursor della configurazione del progetto Preview** descritta nella sezione 1;
4. **autorizzazione esplicita al merge**.

Le Storie reali non sono un gate pre-go-live: `/storie` deve essere sana anche a zero contenuti; outreach e popolamento reale iniziano soltanto dopo sito online + live smoke PASS.

## 9. Promozione e build Production Vercel — SOLO DOPO AUTORIZZAZIONE

Merge e deploy sono separati.

Dopo un eventuale merge autorizzato su `main`, il deploy Production richiede un'ulteriore autorizzazione e l'avanzamento controllato del branch Git `production` al commit di `main` approvato.

Il workflow `promote-production.yml` è manual-only (`workflow_dispatch`) e deve continuare a richiedere:

- esecuzione dal ref `main`;
- SHA completo di `main` approvato;
- conferma letterale `DEPLOY_PRODUCTION`;
- verifica che `GITHUB_SHA` corrisponda ancora al `main` corrente;
- verifica ancestry/fast-forward di `production` rispetto a `main`;
- nessun force-push.

Prima della promozione verificare almeno:

- SHA esatto e required checks verdi;
- progetto Production esatto;
- environment variables/scopes senza esporre segreti;
- `NEXT_PUBLIC_SITE_URL` coerente con il target;
- QA umano e legal PASS;
- configurazione Preview separata e non duplicante `production`.

Il merge **non** autorizza automaticamente il deploy Production.

## 10. Smoke del deployment Production protetto

Solo dopo promozione/deploy autorizzati verificare almeno:

- `/` 200, H1 e canonical;
- `/osservatorio`, `/atlante`, rotte e dati reali;
- `/storie` sana anche con zero storie reali;
- `/eventi`, `/fonti`, `/open-data` + JSON/CSV/XLSX;
- `/privacy`, `/cookie`, `/termini`;
- `/contribuisci` e rate limiting;
- `/accedi`;
- login + MFA AAL2 reale;
- redazione privata e separazione contributor/editor;
- governance ibrida sulle superfici sensibili;
- proposta pubblica → Inbox senza auto-publish;
- CSP/HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy;
- assenza del `noindex` sul vero target Production destinato al pubblico;
- performance/LCP live;
- log Vercel/Supabase senza errori critici.

Lo smoke remoto automatizzato resta GET-only e allowlisted sul dominio Production o su host Vercel `immigratiimprenditori*.vercel.app`; non sostituisce i controlli autenticati/manuali.

## 11. Source-health dopo merge

Il checker source-health è technical/security PASS e read-only. Il workflow schedulato esiste sul branch candidato ma non ancora su `main`.

Il primo vero `workflow_dispatch`/cron sul default branch è quindi un gate **post-merge / pre-go-live**, non un blocker pre-merge.

## 12. QA umano prima dell'apertura pubblica

Usare il record previsto in:

`docs/operations/go-live-a-closure-kit-2026-08-23.md`

La copertura automatica già PASS include reflow 320/390/768, sette lingue/RTL, skip-link/focus, tastiera su header `/cerca` `/accedi` `/contribuisci`, scroll nativo del focus a 320, text-spacing e target-size.

Il residuo umano resta: screen reader, zoom 200/400%, dispositivi fisici e valutazione qualitativa finale. L'automazione non sostituisce questo gate.

## 13. Dominio e apertura pubblica

Solo dopo deploy Production protetto + smoke PASS + autorizzazione al cutover.

Regole:

1. non cambiare i nameserver come parte ordinaria del go-live web;
2. fotografare/esportare la zona DNS prima del cutover;
3. non modificare MX, SPF, DKIM, DMARC o altri record mail;
4. verificare i valori DNS richiesti dal dashboard Vercel nel momento del cutover; non usare valori storici non riconfermati;
5. associare apex e `www` al progetto Production corretto prima di spostare il traffico;
6. mantenere un solo URL canonico pubblico;
7. verificare TLS, canonical, hreflang, sitemap e robots sul dominio reale;
8. eseguire live smoke completo subito dopo il cutover.

### Rollback dominio

Se il cutover espone un deployment errato/instabile:

- riattivare la protezione se disponibile;
- ripristinare soltanto i precedenti record web A/AAAA/CNAME annotati nel preflight;
- non modificare i record mail;
- fermarsi e diagnosticare prima di ulteriori cambi.

## 14. Rollback applicativo / database

Se il deployment applicativo fallisce ma il database è sano:

- rollback Vercel all'ultimo deployment Production noto funzionante, se esistente;
- mantenere il sito protetto/non pubblico;
- diagnosticare prima di un nuovo tentativo.

Se il problema è database:

- non improvvisare rollback SQL distruttivi;
- fermare la release;
- preferire forward-fix revisionata quando lo stato è integro;
- usare recovery da backup pertinente quando lo stato è corrotto/non deterministico;
- qualsiasi restore/cutover Production richiede decisione esplicita.

## 15. Stato sintetico

- Production DB migration #1–#25: **PASS**;
- `candidateDelta`: **0**;
- Production-source restore: **PASS**;
- MFA privilegiato Production DB/Auth: **PASS**;
- governance ibrida DB: **ATTIVA**;
- required checks `main`: **ACTIVE**;
- Production project branch boundary (`production`): **PASS**;
- Netlify deploy-preview: **CANCELED**;
- QA visivo Preview: **PASS**;
- CI candidato: **PASS** (#1054 / #587 sul pre-runbook HEAD);
- Preview project final config: **PENDING dashboard/Cursor**;
- QA umano/device: **PENDING**;
- legal professionale: **PENDING**;
- Production application deploy: **NON ESEGUITO / NON AUTORIZZATO**;
- DNS cutover: **NON ESEGUITO**.

`PRODUCTION_READINESS = NOT PASS` finché i gate rimanenti non sono chiusi e il deploy Production non è autorizzato separatamente.
