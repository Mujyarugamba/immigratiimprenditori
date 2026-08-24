# Main required checks proposal — 2026-08-24

Status: **PROPOSTA — NESSUNA BRANCH-PROTECTION WRITE ESEGUITA**

Questo documento prepara la decisione sui required checks di `main` senza modificare la protezione del branch.

## Stato corrente

`main` resta a:

`8b1511598dc6dc3225098aa77c38c13a35a395e9`

La protezione esistente non impone attualmente required status checks.

## Set minimo proposto

Prima del merge/go-live del Centro Studi, il set minimo consigliato è:

1. `Editorial v1 CI / verify`
2. `Supabase local migration validation / validate-local-database`
3. check Vercel Preview del progetto Centro Studi corretto, **solo dopo** avere risolto l'attuale problema di visibilità/control-plane e aver confermato il nome/context stabile del check.

## Perché questi check

### Editorial v1 CI / verify

Copre il candidato applicativo: typecheck, test, source/security/privacy gates, dependency audit, build, HTTP smoke, browser E2E pubblico e Lighthouse.

### Supabase local migration validation / validate-local-database

Copre il cold-start canonico, release-plan guard, lint PostgreSQL, RLS/publication gate, governance ibrida due-redattori, rate limit, audit/analytics, backup/restore, Auth integration reale locale, build contro Supabase, HTTP smoke ed E2E autenticato.

### Vercel Preview

Serve a garantire che il commit che si vuole promuovere sia costruibile anche dal provider di hosting finale. Non deve essere attivato come required check finché non è certo quale progetto/context Vercel sia quello definitivo.

## Check da NON rendere required per il percorso finale

- Netlify deploy-preview: il target finale deciso è Vercel Pro; mantenere Netlify come required check renderebbe il rilascio dipendente da un provider che non deve essere parte del percorso finale.
- workflow operativi temporanei di backup/restore/migration apply: sono strumenti di runbook e non devono diventare prerequisiti permanenti per ogni commit.
- check manuali/one-shot con nomi non stabili.

## Condizioni prima di qualsiasi write sulla branch protection

1. CI corrente verde sul HEAD candidato;
2. Vercel project/control-plane identificato con certezza;
3. context string del check Vercel verificata come stabile;
4. decisione esplicita del proprietario del repository;
5. applicazione della protezione senza merge/deploy automatico.

`MAIN_REQUIRED_CHECKS = PENDING DECISION / NO WRITE`
