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

## Migration

Ownership copiata in `supabase/`. Manifesto: `supabase/CS-MIGRATION-MANIFEST.md`.

`CS_DATABASE_BOOTSTRAP = SPLIT_3_PENDING`

Non eseguire queste migration come catena autonoma prima di SPLIT-3.

## Residui di prodotto

- `CS_SSO_CUTOVER = PENDING` — nessun SSO nuovo; ruoli editoriali locali.
- `CS_LEGAL_CONTENT = CUTOVER_BLOCKER` — placeholder su `/dati-e-fonti`, non testo giuridico definitivo.

## Confini

Nessuna dipendenza da PonteImprese. Package UI e product-config sono locali in `packages/`.
