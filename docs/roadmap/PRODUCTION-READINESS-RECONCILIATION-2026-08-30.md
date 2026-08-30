# Production Readiness — riconciliazione 2026-08-30

Stato: **ADDENDUM OPERATIVO CORRENTE**  
Data: 2026-08-30  
Repository: `Mujyarugamba/immigratiimprenditori`

Questo addendum aggiorna esclusivamente lo stato hosting/release e i gate Production Readiness osservati il 30 agosto 2026. Non cancella la cronologia dei documenti precedenti. In caso di conflitto sullo stato corrente di Vercel, branch Git o release candidate, prevale questo addendum.

Non autorizza migration, backfill, deploy Production, DNS cutover o altre write Production.

## 1. Stato Git osservato

Al momento della riconciliazione:

- `main`: `a17a59cd1df0c3dd90acdaa86c7695b71e52cc0c`;
- `production`: `2d4526c2f47b05803da4c30702a9fa2bfad9af2c`;
- `production` è antenato di `main`;
- delta `production` → `main`: 13 commit, 49 file;
- nel delta Git corrente non risultano file `supabase/` modificati.

La separazione tra integrazione applicativa e rilascio live resta quindi attiva: aggiornare `main` non equivale a promuovere `production`.

## 2. Vercel — stato corrente

La configurazione descritta nei documenti del 28–29 agosto con due progetti Vercel distinti non rappresenta più lo stato corrente.

Il progetto ridondante `immigratiimprenditori-preview` è stato eliminato. Le verifiche successive hanno mostrato:

- sui branch `feature/*`: nessuno status/build Vercel osservato;
- sui merge a `main`: un solo status `Vercel` relativo a `immigratiimprenditori`;
- gli ultimi merge verificati su `main` hanno completato quella singola build con esito `success`.

Non viene qui ricostruita o assunta una configurazione Vercel interna non leggibile dal connettore. La regola operativa verificata è il comportamento osservabile sopra: niente build Vercel sui feature branch e una sola build sui merge a `main`.

## 3. Branch protection — finding Production

`main` è protetto dal ruleset repository `Protect main`, attivo e strict. Il ruleset richiede:

- pull request;
- blocco delete;
- blocco non-fast-forward;
- required status checks `verify` e `validate-local-database`;
- nessun bypass actor.

Il branch `production`, invece, è stato osservato con `protected: false`. La collection dei ruleset repository contiene soltanto `Protect main`, applicato al default branch.

Conseguenza: **il branch che governa il deploy live non ha oggi una protezione GitHub equivalente** e può teoricamente essere aggiornato fuori dal percorso canonico di promozione.

Stato:

`PRODUCTION_BRANCH_PROTECTION = PENDING / MANUAL GITHUB SETTINGS`

Configurazione richiesta prima di una futura promozione live:

- ruleset dedicato a `production`;
- regola attiva **Restrict updates**;
- blocco deletion;
- blocco non-fast-forward;
- aggiornamenti limitati agli attori in bypass;
- percorso esplicito compatibile con il workflow canonico `.github/workflows/promote-production.yml`;
- nessun bypass generico o non documentato;
- verifica reale del comportamento prima di un deploy autorizzato.

GitHub documenta che **Restrict updates** permette il push soltanto agli attori con bypass. L'identità/bypass esatto da usare per la promozione non viene inventato in questo documento: va configurato e verificato nella UI GitHub prima del rilascio.

## 4. Hardening del workflow di promozione

Il workflow canonico resta manuale (`workflow_dispatch`) e conserva i controlli già esistenti su:

- esecuzione da `main`;
- conferma esatta `DEPLOY_PRODUCTION`;
- SHA completo e uguale al `main` corrente;
- `production` antenato di `main`;
- fast-forward senza force push;
- verifica del ref dopo il push.

A questo si aggiunge un preflight fail-closed basato sulle **regole attive realmente applicate al branch**. Il workflow interroga l'endpoint GitHub `GET /repos/{owner}/{repo}/rules/branches/production`, che restituisce soltanto le regole attive applicabili, e richiede contemporaneamente:

- `update` — Restrict updates;
- `deletion` — protezione dalla cancellazione;
- `non_fast_forward` — protezione dai force/non-fast-forward update.

Se la chiamata API fallisce, la risposta non è valida o manca anche una sola delle tre regole, la promozione viene rifiutata prima dell'autorizzazione al deploy.

Questo evita un falso positivo importante: il semplice flag GitHub `protected: true` non sarebbe sufficiente, perché una protezione parziale potrebbe non impedire un fast-forward manuale.

Finché `production` non possiede le tre regole attive richieste, il percorso canonico di promozione deve quindi rifiutare il deploy.

Questo hardening non sostituisce il ruleset manuale e non prova da solo che l'attore del workflow sia correttamente autorizzato al bypass. Dopo la configurazione del ruleset va eseguito un test controllato del percorso di promozione; se l'attore non è ammesso al bypass, il push resterà correttamente bloccato.

## 5. Supabase Production — stato separato

Il manifest `supabase/CS-PRODUCTION-RELEASE.json`, verificato in sola lettura il 2026-08-30, registra:

- hosted latest osservata: `20260824104000_fix_public_profile_column_grants`;
- `appliedReleaseDelta`: 26 migration;
- `candidateDelta`: una sola migration:
  - `20260829120000_create_content_ai_translations.sql`.

La migration AI non è autorizzata né applicata da questo ciclo.

Restano obbligatori, prima di una futura write DB Production:

- fresh hosted migration audit;
- backup cifrato previsto dalla release policy;
- verifica puntuale del candidate delta;
- autorizzazione esplicita;
- apply una migration alla volta con postflight.

Stati invariati:

- `AI_TRANSLATION_MIGRATION_PRODUCTION = PENDING / NOT AUTHORIZED`;
- `AI_TRANSLATION_BACKFILL = PENDING / NOT AUTHORIZED`.

Promozione del codice e attivazione AI restano decisioni separate.

## 6. Source-health reale

`.github/workflows/source-health-weekly.yml` è verificato come read-only:

- `permissions: contents: read`;
- Supabase publishable key, nessun service-role;
- checker senza mutation/RPC;
- artifact di report;
- failure esplicita in presenza di sorgenti problematiche.

Il registry Production espone attualmente 5 sorgenti attive con URL, appartenenti a 3 produttori. Un controllo esterno supplementare del 30 agosto non ha mostrato URL palesemente scomparsi; tale controllo non replica però DNS pinning, redirect safety e fallback HEAD/GET del checker canonico e non viene usato per chiudere il gate.

Il connettore GitHub disponibile in questo ciclo non espone `workflow_dispatch` e non consente di enumerare affidabilmente la cronologia del workflow per filename. Non viene quindi dichiarato un run reale non osservato.

Stato:

`SOURCE_HEALTH_FIRST_REAL_RUN = PENDING`

Il run potrà essere avviato dalla UI GitHub sul default branch e valutato tramite job + artifact, senza write Production.

## 7. QA umano e legal review

Le coperture automatiche restano PASS, incluse CI, browser E2E, Lighthouse, reflow, RTL, text-spacing, target-size, focus e smoke di sicurezza.

Il record `docs/operations/HUMAN-WCAG-QA-RECORD-2026-08-28.md` resta però non compilato nelle prove umane richieste:

- screen reader reale;
- zoom browser reale 200% / 400%;
- dispositivi fisici iOS / Android;
- valutazione qualitativa focus, ordine di lettura, RTL e moduli.

Stato:

`HUMAN_WCAG_DEVICE_QA = PENDING`

Il dossier `docs/operations/legal-professional-review-handoff-2026-08-23.md` risulta già riconciliato tecnicamente al 29 agosto e include la candidata traduzione AI, OpenAI, `store: false`, trasferimenti, retention, minori e proprietà intellettuale. La revisione professionale resta però distinta dai guard tecnici e non può essere autocertificata dalla CI.

Stato:

`LEGAL_PROFESSIONAL_REVIEW = PENDING`

## 8. Decisioni che restano separate

Al 30 agosto non sono autorizzati automaticamente:

- protezione/configurazione GitHub di `production`;
- promozione `main` → `production`;
- migration AI Production;
- backfill AI;
- deploy/cutover live;
- modifiche DNS.

Prima di una futura promozione Production devono risultare almeno:

1. `production` protetto con `update`, `deletion` e `non_fast_forward` attivi e percorso di bypass compatibile con il workflow canonico;
2. required checks del candidato finale verdi;
3. gate umani/professionali richiesti chiusi o esplicitamente deliberati secondo la governance del progetto;
4. autorizzazione separata al deploy sullo SHA esatto;
5. smoke remoto/live dopo la promozione.

Questo addendum è la fotografia operativa corrente e deve essere letto insieme al manifest release e ai runbook storici, senza reinterpretare i PASS storici come autorizzazioni future.
