# SPLIT-3 — Production cutover COMPLETE

Data: 19/08/2026.

## Risultato

`IMMIGRATI_SPLIT3 = COMPLETE`
`PRODUCTION_CUTOVER = PASS`

Il Centro Studi è fisicamente separato dal precedente monolite. Database e Auth restano sul progetto Supabase `immigratiimprenditori` (`hvfvfatlaspcpszgizhg`).

## Runtime

Il runtime standalone è stato promosso su `main` con merge commit `be9fe3da10f6817a50c96c5e3bca1d2cff280bb0`.

Prima della cleanup del database, entrambi i deploy Vercel collegati al repository hanno raggiunto `success`. Lo smoke Production pre-cleanup ha verificato:

- `/` = 200
- `/accedi` = 200
- `/cultura` = 200
- `/osservatorio` = 200
- `/app/redazione` anonimo = 307

## Database hosted

La cleanup è stata prima eseguita integralmente in transazione con `ROLLBACK`: `IMMIGRATI_SPLIT3_DRY_RUN = PASS`.

Successivamente è stata applicata come migration Supabase gestita `split3_immigrati_production_cleanup`, seguita da `split3_immigrati_postcutover_performance_hardening`.

Postflight:

- tabelle `public`: 29
- policy RLS: 57
- FK cross-product verso PonteImprese: 0
- sequenze `public`: 2, entrambe necessarie ai cataloghi locali
- contenuti: 18 totali / 17 pubblici
- content types: 11
- content categories: 9
- event types: 10
- eventi: 0
- osservatorio: 1 indicatore / 1 fonte / 6 valori
- lingue: 30
- settori: 21

## Auth e redazione

Sono preservati:

- 1 utente Supabase Auth
- 1 profilo
- 1 account attivo e collegato

L'account editoriale esistente ha ruolo attivo `amministratore_applicativo`. Il test sotto ruolo `authenticated` ha verificato account/person resolution e autorizzazione admin.

Le funzioni `public` residue sono solo quelle del boundary Centro Studi; gli helper di lettura sono `SECURITY INVOKER`, mentre le funzioni `SECURITY DEFINER` rimaste sono limitate al provisioning/trigger Auth con `search_path` fissato e privilegi ridotti.

## Smoke dopo la separazione

GitHub Actions run `32227055756`, job `95988772199`: `success`.

Risultato live dopo la rimozione del monolite:

- `/` = 200
- `/accedi` = 200
- `/cultura` = 200
- `/osservatorio` = 200
- `/app/redazione` anonimo = 307
- `IMMIGRATI_POST_CLEANUP_LIVE_SMOKE = PASS`

## Advisor

Il security advisor non segnala più esposizioni `SECURITY DEFINER` o `search_path` mutabili. Rimane un solo warning di configurazione Auth: Leaked Password Protection disabilitata. È una preferenza di sicurezza del servizio Supabase Auth, non una dipendenza o un errore dello SPLIT-3.

Gli advisor performance residui sono ottimizzazioni non bloccanti (indici appena creati/non ancora usati e policy permissive multiple). I warning su FK non indicizzate e `auth.uid()` initplan sono stati corretti nel post-cutover hardening.

## Regola futura

- `supabase/baseline/00..03` è la baseline standalone canonica per cold start.
- `supabase/migrations/` pre-SPLIT-3 è storico e non va riapplicato come catena.
- ogni nuova migration deve restare nel perimetro Centro Studi e non introdurre dipendenze da PonteImprese.
