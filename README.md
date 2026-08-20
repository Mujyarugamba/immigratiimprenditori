# Immigrati Imprenditori

Piattaforma editoriale e Osservatorio AIPEL dedicato all'imprenditoria migrante in Italia e nel mondo.

## Stato sviluppo

Il lavoro editoriale v1 è raccolto nel branch `editorial-desk-v1` e nella PR #7. `main` resta il ramo stabile finché i gate di lancio non sono chiusi.

## Stack

- Next.js 16 / App Router
- Supabase per database e autenticazione
- GitHub Actions per CI
- Vercel per preview/sviluppo
- Compatibilità Netlify pronta come opzione di produzione self-serve

## Radar editoriale

Il Radar non pubblica automaticamente. Raccoglie candidati da GDELT, Crossref e DataCite, normalizza/deduplica e li porta nella Inbox della redazione.

Sono disponibili due modalità di schedulazione:

- Vercel: `/api/cron/editorial-radar` protetto da `CRON_SECRET` e configurato in `vercel.json`;
- Netlify: scheduled trigger → background worker → lo stesso endpoint protetto. Senza `CRON_SECRET` il percorso Netlify resta fail-closed e non esegue ingestione.

## Variabili ambiente

Vedi `env.example`. I segreti reali non devono essere committati.

## Documentazione editoriale

La roadmap e lo stato di implementazione sono in `docs/editorial/`.
