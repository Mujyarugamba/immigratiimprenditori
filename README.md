# Centro Studi sull'imprenditoria migrante

Prodotto editoriale e di ricerca. Non è la piattaforma commerciale PonteImprese.

## Sviluppo

```bash
npm run dev
npm run typecheck
npm test
```

Copia `env.example` in `.env.local`. Solo placeholder: nessun secret nel repository.

## Env richieste

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (opzionale)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, ingest)

## Database e Auth

Database e autenticazione sono entrambi sul progetto Supabase `immigratiimprenditori` (`hvfvfatlaspcpszgizhg`).

La baseline autonoma SPLIT-3 è in `supabase/baseline/` (`00..03`). Il database hosted è stato convertito in-place al perimetro Centro Studi il 19/08/2026.

`CS_DATABASE_BOOTSTRAP = SPLIT_3_COMPLETE`

Le SQL in `supabase/migrations/` precedenti allo SPLIT-3 sono conservate esclusivamente come storico di ownership/migrazione e non costituiscono la catena di bootstrap standalone.

## Identità editoriale

`CS_SSO_CUTOVER = COMPLETE` — Supabase Auth locale, account locale e ruoli editoriali locali; nessuna dipendenza Auth da PonteImprese.

## Residui di prodotto

- `CS_LEGAL_CONTENT = CUTOVER_BLOCKER` — placeholder su `/dati-e-fonti`, non testo giuridico definitivo.

## Confini

Nessuna dipendenza runtime o FK da PonteImprese. Package UI e product-config sono locali in `packages/`.
