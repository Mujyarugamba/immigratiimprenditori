# Vercel Production runbook — stato riconciliato 28 agosto 2026

Stato: **PREVIEW ALLINEATO / PRODUCTION APPLICATION DEPLOY NON AUTORIZZATO**  
Branch candidato corrente: `work/pre-go-live-integration-20260826`  
PR: **#13 — DRAFT**  
Production branch: `main`

## Obiettivo

Portare ImmigratiImprenditori.it su Vercel Production con un rilascio controllato, senza promuovere un artifact Preview e senza aprire il sito al pubblico prima degli smoke finali.

Questo runbook non autorizza merge, deploy Production, DNS, migration o altre write Production.

## Confini non negoziabili

- Nessun outreach/invito/intervista prima che il sito sia online e il live smoke sia PASS.
- Nessuna futura write database Production senza fresh hosted-state read, backup pertinente e autorizzazione esplicita.
- I Vercel Preview restano **read-only + noindex**.
- `SUPABASE_SERVICE_ROLE_KEY` è **Production-only**, server-side e mai esposta ai Preview/client.
- Un Preview non viene promosso a Production: Preview e Production hanno contratti diversi incorporati nel build.
- `main` non viene modificato/mergeato automaticamente.
- Merge e deploy Production richiedono autorizzazioni separate.

## 1. Topologia Vercel corrente — VERIFICATA

Team: `inquotus-projects`.

Progetti:

- Production: `immigratiimprenditori`;
- Preview canonico: `immigratiimprenditori-preview`.

Sul solo progetto Production è configurato l'Ignored Build Step:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; else exit 1; fi
```

Semantica Vercel:

- exit `0` = build ignorato;
- exit `1` = build eseguito.

Comportamento verificato su più commit consecutivi del branch:

- `immigratiimprenditori` Production project: **Canceled by Ignored Build Step**;
- `immigratiimprenditori-preview`: deployment completato;
- Netlify deploy-preview: **canceled**.

Quindi:

- i branch non-`main` non generano più un secondo build Vercel sul progetto Production;
- `main` resta autorizzato a costruire sul progetto Production quando verrà deliberatamente usato;
- il percorso Preview canonico è `immigratiimprenditori-preview`.

`VERCEL_PREVIEW_DUPLICATION = CLOSED`

## 2. Environment matrix

### Preview

Richieste:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Non configurare:

- `SUPABASE_SERVICE_ROLE_KEY`.

Il codice riconosce `VERCEL_ENV=preview` e applica il contratto read-only/noindex previsto, incluso blocco delle mutazioni e analytics applicativi disabilitati.

### Production

Da verificare sul progetto Production prima del primo deploy applicativo autorizzato:

- `NEXT_PUBLIC_SUPABASE_URL` del progetto hosted corretto;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` corretta;
- `NEXT_PUBLIC_SITE_URL` uguale all'origine HTTPS Production effettiva;
- `SUPABASE_SERVICE_ROLE_KEY` presente soltanto nello scope Production e server-side;
- flag privacy analytics nello stato deliberatamente approvato.

Non copiare valori segreti in chat, commit, issue, PR body o log.

## 3. Regione Functions

`vercel.json` mantiene `cdg1` come regione primaria delle Functions. Supabase è in `eu-west-3` (Parigi). Non modificare `vercel.json` per gestire la separazione Preview/Production: quella separazione è ora project-level tramite Ignored Build Step.

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

**Non applicare le vecchie 22/24/25 migration come se fossero ancora candidate.** Con `candidateDelta=[]` non c'è alcuna migration da applicare.

Ogni futura migration richiede un nuovo piano basato su fresh hosted-state read.

## 5. Backup / recovery — GATE STORICI CHIUSI

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

Il vecchio stato “zero fattori MFA” è superato.

Stato del rilascio database chiuso:

- amministratori applicativi attivi: **2**;
- fattori TOTP verificati collegati a un amministratore attivo: **1**;
- enforcement AAL2 applicato;
- `PRODUCTION_PRIVILEGED_MFA = PASS`.

Resta un controllo distinto **applicativo** prima del go-live: verificare login + challenge TOTP/AAL2 del nuovo account reale attraverso il frontend Vercel corretto prima di rimuovere eventuali amministratori/credenziali di prova conservati come safety fallback.

## 7. Required checks `main`

Ruleset GitHub `Protect main`: **ACTIVE**.

Required status checks con strict policy:

- `verify`;
- `validate-local-database`.

Il ruleset blocca deletion e non-fast-forward e richiede pull request. Non risultano bypass actors.

Il check Vercel Preview non è attualmente un required status check del ruleset; resta un controllo operativo esplicito del candidato.

## 8. Gate applicativi pre-merge ancora aperti

Prima di una decisione finale di merge devono essere chiusi o esplicitamente deliberati:

1. CI verde sul HEAD finale;
2. QA visivo diretto del Preview canonico, incluso mini-trend con dati reali e viewport 390/320;
3. QA umano WCAG 2.2 AA/device con record completo;
4. revisione legale professionale con sign-off;
5. login + MFA/AAL2 del nuovo amministratore attraverso il frontend Vercel corretto, se non già documentato da evidenza successiva;
6. autorizzazione esplicita al merge.

Le Storie reali non sono un gate pre-go-live: `/storie` deve essere sana anche a zero contenuti; outreach e popolamento reale iniziano dopo live smoke PASS.

## 9. Build Production Vercel — SOLO DOPO AUTORIZZAZIONE

Il primo rilascio applicativo deve essere un **vero build target Production**, non la promozione di un Preview esistente.

Prima del deploy verificare almeno:

- HEAD esatto e required checks verdi;
- progetto Production esatto;
- environment variables/scopes senza esporre segreti;
- `NEXT_PUBLIC_SITE_URL` coerente con il target;
- QA umano e legal PASS;
- MFA/AAL2 frontend reale verificato;
- Deployment Protection/configurazione di collaudo, se prevista per il candidato iniziale.

Il merge non autorizza automaticamente il deploy Production.

## 10. Smoke del deployment Production protetto

Solo dopo deploy autorizzato verificare almeno:

- `/` 200, H1 e canonical;
- `/osservatorio`, `/atlante`, rotte e dati reali;
- `/storie` sana anche con zero storie reali;
- `/eventi`, `/fonti`, `/open-data` + JSON/CSV/XLSX;
- `/privacy`, `/cookie`, `/termini`;
- `/contribuisci` e rate limiting;
- `/accedi`;
- login + MFA AAL2;
- redazione privata e separazione contributor/editor;
- governance ibrida sulle superfici sensibili;
- proposta pubblica → Inbox senza auto-publish;
- CSP/HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy;
- assenza del `noindex` sul vero target Production destinato al pubblico;
- performance/LCP live;
- log Vercel/Supabase senza errori critici.

## 11. Source-health dopo merge

Il checker source-health è technical/security PASS e read-only. Il workflow schedulato esiste sul branch candidato ma non ancora su `main`.

Il primo vero `workflow_dispatch`/cron sul default branch è quindi un gate **post-merge / pre-go-live**, non un blocker pre-merge.

## 12. QA umano prima dell'apertura pubblica

Usare il record previsto in:

`docs/operations/go-live-a-closure-kit-2026-08-23.md`

Copertura minima: desktop, laptop, tablet, mobile 390, mobile 320, tastiera/focus, screen reader, zoom/reflow, RTL, moduli/Auth/MFA.

L'automazione non sostituisce questo gate.

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
- MFA privilegiato Production: **PASS**;
- governance ibrida DB: **ATTIVA**;
- Vercel duplicate branch build: **CHIUSO**;
- Netlify deploy-preview: **CANCELED**;
- required checks `main`: **ACTIVE**;
- Production application deploy: **NON ESEGUITO / NON AUTORIZZATO**;
- QA visivo Preview: **PENDING**;
- QA umano/device: **PENDING**;
- legal professionale: **PENDING**;
- DNS cutover: **NON ESEGUITO**.

`PRODUCTION_READINESS = NOT PASS` finché i gate rimanenti non sono chiusi e il deploy Production non è autorizzato separatamente.
