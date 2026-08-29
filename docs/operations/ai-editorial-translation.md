# Traduzione AI dei contenuti editoriali pubblici

La cache di traduzione automatica riguarda **solo i contenuti editoriali già pubblici**. L’interfaccia resta sul sistema i18n esistente e l’originale editoriale non viene mai sovrascritto.

## Modello operativo

Il traffico pubblico è **cache-only**: home, liste, ricerca e dettaglio localizzato possono leggere traduzioni già presenti, ma una visita anonima non genera chiamate OpenAI.

La generazione è un’operazione server-side controllata tramite backfill esplicito. Prima del fingerprint e prima di qualsiasi invio al modello viene usato il corpo pubblico canonico, con rimozione dei trailer tecnici di acquisizione `d1d_*` mediante la stessa funzione usata dalle superfici pubbliche.

Le richieste OpenAI usano `store: false`, reasoning `none`, timeout e limite di output. Un errore, timeout, output incompleto o validazione fallita produce fallback all’originale pubblico e non viene scritto in cache.

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

## Gate prima dell’attivazione

Non configurare `AI_TRANSLATION_ENABLED=true`, non applicare la migration su Production e non eseguire backfill hosted finché non sono soddisfatte tutte queste condizioni:

1. replay completo della migration chain e security smoke verdi;
2. test unitari, typecheck, build, HTTP smoke ed E2E verdi sullo stesso HEAD;
3. verifica che nessun trailer tecnico `d1d_*` entri nel fingerprint o nella richiesta OpenAI;
4. verifica Preview read-only e frontend pubblico cache-only;
5. Politica editoriale e Privacy aggiornate per descrivere le traduzioni automatiche;
6. dry-run del backfill verificato;
7. applicazione della migration Production autorizzata separatamente secondo il release plan;
8. primo backfill eseguito per target/limite controllato, con verifica di errori e token reali prima di estenderlo.

L’originale resta sempre la fonte prevalente e deve rimanere accessibile dalla stessa route localizzata tramite `original=1`.
