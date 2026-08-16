# PonteImprese

Piattaforma B2B per l'ecosistema imprenditoriale.

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
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `LEGAL_SUBJECT_HMAC_SECRET` (server-only, min 32 caratteri)

## Migration

Ownership copiata in `supabase/`. Manifesto: `supabase/PI-MIGRATION-MANIFEST.md`.

`PI_DATABASE_BOOTSTRAP = SPLIT_3_PENDING`

Non eseguire queste migration come catena autonoma prima di SPLIT-3.

## Confini

Nessuna dipendenza da Centro Studi. Package UI e product-config sono locali in `packages/`.
