# Traduzione AI dei contenuti editoriali pubblici

La cache di traduzione automatica riguarda **solo i contenuti editoriali già pubblici**. L’interfaccia resta sul sistema i18n esistente.

## Variabili server-only

Nomi, senza valori:

- `OPENAI_API_KEY`
- `AI_TRANSLATION_ENABLED`
- `AI_TRANSLATION_MODEL`

Default modello: `gpt-5.6-terra`.

`AI_TRANSLATION_ENABLED` è fail-closed: la generazione avviene soltanto se il valore è esattamente `true`.

`NEXT_PUBLIC_PREVIEW_READ_ONLY=true` prevale: nessuna chiamata OpenAI, nessuna scrittura, nessun uso del service role per traduzioni. La Preview può leggere traduzioni già presenti.

Queste variabili non devono essere prefissate `NEXT_PUBLIC_` né inserite nel bundle client.

## Operatività locale

Dry-run di default:

```bash
npm run i18n:backfill-ai-translations -- --dry-run
npm run i18n:backfill-ai-translations -- --apply --target=en
npm run i18n:backfill-ai-translations -- --apply --target=all --limit=20
```

Lo script rifiuta Preview read-only e il progetto hosted Production. Il file `supabase/CS-PRODUCTION-RELEASE.json` elenca la migration come `candidateDelta` per il drift CI; questo non autorizza l’applicazione su Production.
