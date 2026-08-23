# Vercel Production runbook — 23 agosto 2026

## Obiettivo

Portare ImmigratiImprenditori.it su Vercel Production con un rilascio controllato, senza riutilizzare un artifact Preview e senza aprire il sito al pubblico prima degli smoke finali.

## Confini non negoziabili

- Nessun outreach/invito/intervista prima che il sito sia online e il live smoke sia PASS.
- Nessuna migration Production prima di backup verificato, fresh migration-history read e autorizzazione esplicita.
- I Vercel Preview restano automaticamente **read-only + noindex**.
- `SUPABASE_SERVICE_ROLE_KEY` è **Production-only**, server-side e mai esposta ai Preview/client.
- Un Preview non viene promosso a Production: il comportamento Preview è intenzionalmente diverso e viene incorporato nel build.
- `main` non viene modificato/mergeato automaticamente.

## 1. Verifica Vercel dopo upgrade Pro

Prima di qualsiasi deploy:

1. verificare che il team `inquotus-projects` risulti Pro;
2. identificare in modo univoco il progetto Vercel Production collegato al repository;
3. verificare branch production, root directory e framework Next.js;
4. verificare che le System Environment Variables Vercel siano disponibili (`VERCEL=1`, `VERCEL_ENV`);
5. attivare Deployment Protection/Vercel Authentication sul target Production durante il collaudo iniziale, se disponibile sul piano;
6. non collegare ancora il dominio pubblico se questo renderebbe il candidato accessibile prima dello smoke.

## 2. Environment matrix

### Preview

Richieste:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Non configurare:

- `SUPABASE_SERVICE_ROLE_KEY`

Il codice riconosce automaticamente `VERCEL_ENV=preview` e applica:

- GET/HEAD/OPTIONS soltanto;
- HTTP 405 sulle mutazioni;
- `X-Preview-Read-Only: true`;
- CSP senza connessione client a Supabase;
- `X-Robots-Tag: noindex, nofollow, noarchive`;
- analytics applicativi disabilitati.

### Production

Obbligatorie, validate fail-fast durante il build:

- `NEXT_PUBLIC_SUPABASE_URL=https://hvfvfatlaspcpszgizhg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = chiave publishable moderna del progetto;
- `SUPABASE_SERVICE_ROLE_KEY` = secret server-only.

Da impostare esplicitamente:

- `NEXT_PUBLIC_SITE_URL` = origine effettiva del sito Production;
- `NEXT_PUBLIC_PRIVACY_ANALYTICS_ENABLED=false` al primo rilascio;
- `PRIVACY_ANALYTICS_WRITE_ENABLED=false` al primo rilascio.

Gli analytics si abilitano soltanto in un secondo momento, portando **entrambi** i flag a `true` dopo verifica privacy/runtime.

Non incollare segreti in chat, commit, issue, PR body o log.

## 3. Regione Functions

`vercel.json` fissa `cdg1` come regione primaria delle Vercel Functions. Supabase è in `eu-west-3` (Parigi), quindi le chiamate server-side restano geograficamente vicine al database. La distribuzione degli asset statici/CDN rimane globale.

## 4. Backup prima delle migration

Prima di scrivere sul database hosted:

1. configurare i secret GitHub Actions:
   - `SUPABASE_DB_URL`;
   - `BACKUP_ENCRYPTION_PASSPHRASE`;
2. eseguire il workflow `Production encrypted backup` da `main` quando autorizzato;
3. verificare:
   - `pg_dump` PostgreSQL 17 riuscito;
   - `pg_restore --list` riuscito;
   - artifact cifrato AES-256 presente;
   - checksum SHA-256 presente;
   - nessun dump plaintext nell'artifact;
4. eseguire restore drill non-production e verificare schema/dati/RLS critici.

Il laboratorio CI esegue già un restore reale su database locale effimero; questo non sostituisce il backup reale hosted.

## 5. Database Production

Subito prima dell'apply:

1. rileggere la migration history hosted;
2. verificare che il cutoff atteso sia ancora `20260820160000_prepare_events_external_ingestion_rls`;
3. verificare che nessuno abbia applicato migration nel frattempo;
4. applicare esclusivamente le 22 candidate ordinate in `supabase/CS-PRODUCTION-RELEASE.json`;
5. non riprodurre le 2 migration alias già presenti hosted;
6. vietato `supabase db push` sull'intera storia;
7. interrompere immediatamente l'apply in caso di drift o errore non previsto.

Dopo l'apply eseguire:

- security/RLS smoke;
- publication gate smoke;
- public submission rate-limit smoke;
- login rate-limit smoke;
- audit/analytics smoke;
- verifica assenza di bypass di pubblicazione.

## 6. MFA reale

Production contiene un account privilegiato e, all'audit del 23 agosto, zero fattori MFA verificati.

Prima di usare la redazione Production:

1. login con account privilegiato;
2. routing obbligatorio a `/app/mfa` da sessione AAL1;
3. registrare TOTP tramite QR/secret con app autenticatore;
4. verificare codice a 6 cifre;
5. confermare sessione AAL2;
6. confermare accesso alla redazione;
7. confermare che AAL1 non autorizzi operazioni editor/admin privilegiate.

## 7. Build Production Vercel

Creare un **nuovo deployment target Production**, non promuovere un Preview esistente.

Motivo: Preview e Production hanno contratti diversi (read-only/noindex vs writable/crawlable) e alcune variabili vengono incorporate durante il build.

Prima del deploy devono essere verdi:

- typecheck;
- unit tests;
- functional gates;
- dependency audit;
- public browser E2E;
- Supabase migration/Auth/MFA/RLS laboratory;
- Netlify/Vercel Preview safety tests.

Il build Production deve fallire automaticamente se mancano URL Supabase, publishable key o service-role key.

## 8. Smoke del deployment Production protetto

Con accesso ancora protetto verificare almeno:

- `/` 200;
- `/osservatorio` 200 e dati reali leggibili;
- `/atlante` e rotte evidence-backed;
- `/storie` sana anche con zero storie reali;
- `/eventi`;
- `/fonti`;
- `/open-data` + JSON/CSV/XLSX;
- `/privacy`, `/cookie`, `/termini`;
- `/accedi`;
- login rate-limit;
- MFA AAL2;
- redazione privata;
- contributore separato dal redattore;
- proposta pubblica → Inbox, mai auto-publish;
- header CSP/HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy;
- nessun `X-Robots-Tag: noindex` sul vero target Production destinato al pubblico;
- nessun errore applicativo nei log Vercel del rilascio.

## 9. QA umano prima dell'apertura pubblica

Il gate #92 resta umano. Registrare PASS/FAIL per:

- desktop 1440×900;
- laptop 1366×768;
- tablet 768×1024;
- mobile 390×844;
- narrow mobile 320×568;
- tastiera/skip-link/focus;
- NVDA + Chrome/Firefox;
- VoiceOver/Safari se disponibile;
- zoom 200% e reflow core a 400%;
- Arabic RTL;
- form/errori/auth/MFA.

I test automatici riducono il rischio ma non sostituiscono questo gate.

## 10. Dominio e apertura pubblica

Solo dopo i PASS precedenti:

1. associare/verificare `immigratiimprenditori.it` sul progetto Production;
2. impostare `NEXT_PUBLIC_SITE_URL=https://immigratiimprenditori.it`;
3. verificare DNS/TLS;
4. rimuovere la Deployment Protection destinata al collaudo;
5. verificare canonical, hreflang, sitemap e robots sul dominio reale;
6. eseguire live smoke completo;
7. controllare i log Production immediatamente dopo l'apertura.

## 11. Dopo il live smoke

Soltanto a questo punto:

- iniziare inviti/outreach;
- svolgere interviste/testimonianze reali;
- raccogliere autorizzazioni/consensi necessari;
- fact-check;
- review umana;
- pubblicazione editoriale controllata.

## Rollback

Se il deployment applicativo fallisce ma il database è sano:

- rollback Vercel al deployment Production precedente, se esistente;
- mantenere il sito protetto/non pubblico;
- diagnosticare prima di un nuovo tentativo.

Se il problema è una migration:

- non improvvisare rollback SQL distruttivi;
- fermare la release;
- valutare recovery/forward-fix sulla base del backup verificato e dell'errore concreto.
