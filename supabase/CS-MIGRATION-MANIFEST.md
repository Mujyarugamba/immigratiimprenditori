# Centro Studi — migration ownership dopo SPLIT-3

`CS_MIGRATION_OWNERSHIP = STANDALONE`
`CS_DATABASE_BOOTSTRAP = SPLIT_3_COMPLETE`
`CS_HOSTED_PROJECT = hvfvfatlaspcpszgizhg`

## Catena canonica

La baseline autonoma del Centro Studi è in `supabase/baseline/`:

1. `00000000000000_baseline_immigratiimprenditori.sql`
2. `00000000000001_runtime_link_compatibility.sql`
3. `00000000000002_seed_immigrati_public_data.sql`
4. `00000000000003_auth_identity_gate.sql`

Questa baseline è stata validata con cold start, RLS pubblico e Auth identity/rollback prima del cutover Production.

## Hosted Production

Il 19/08/2026 il progetto Supabase storico `hvfvfatlaspcpszgizhg` è stato convertito in-place al perimetro standalone Centro Studi mediante le migration gestite:

- `split3_immigrati_production_cleanup`
- `split3_immigrati_postcutover_performance_hardening`

Stato verificato dopo il cutover:

- 29 tabelle `public`
- 57 policy RLS
- 0 FK verso tabelle PonteImprese
- 18 contenuti totali / 17 pubblici
- 10 tipi evento / 0 eventi
- Osservatorio 1 indicatore / 1 fonte / 6 valori
- 30 lingue / 21 settori
- 1 `auth.users` / 1 profilo / 1 account
- 1 ruolo attivo `amministratore_applicativo`

## `supabase/migrations/`

I file SQL pre-SPLIT-3 presenti in `supabase/migrations/` sono **storico di ownership** proveniente dal precedente monolite. Non sono una catena di bootstrap standalone e non devono essere concatenati o riapplicati al database Centro Studi.

Per un cold start usare esclusivamente `supabase/baseline/00..03`. Per evoluzioni successive creare migration nuove e revisionate sul perimetro standalone; non reintrodurre oggetti o FK PonteImprese.
