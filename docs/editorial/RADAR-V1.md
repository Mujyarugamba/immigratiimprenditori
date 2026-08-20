# Immigrati Imprenditori — Radar mondiale v1

Stato: **CODE READY / PRODUCTION ACTIVATION PENDING**

## Scopo

Il Radar mondiale segnala alla redazione nuove fonti potenzialmente pertinenti all'imprenditoria migrante. Non crea mai contenuti pubblici e non sostituisce il giudizio editoriale.

Flusso canonico:

`fonte esterna → normalizzazione → deduplicazione → editorial_inbox_items → valutazione umana → eventuale bozza → revisione → pubblicazione`

## Sorgente v1

La prima sorgente è **GDELT DOC 2.0**, utilizzata esclusivamente come strumento di scoperta della copertura giornalistica globale. Le query iniziali cercano, tra le altre, espressioni equivalenti a migrant/immigrant/diaspora entrepreneurship e foreign-born/immigrant-owned business.

Il Radar conserva soltanto i metadati necessari alla redazione: titolo, URL originale normalizzato, dominio/fonte, data quando disponibile e pochi metadati tecnici. Non copia il testo completo degli articoli.

## Scrittura

Ogni nuovo elemento viene inserito in `editorial_inbox_items` con:

- `source_kind = radar`;
- `item_kind = news` nella sorgente GDELT v1;
- `status = new`;
- `priority = normal`;
- `original_url` normalizzato;
- `raw_metadata.adapter = gdelt-doc-2`.

Prima dell'inserimento vengono eliminati duplicati interni allo stesso run e URL già presenti nella Inbox.

## Sicurezza

Endpoint interno: `/api/cron/editorial-radar`.

Requisiti server-only:

- `SUPABASE_SERVICE_ROLE_KEY`;
- `CRON_SECRET`.

Il cron accetta soltanto richieste con `Authorization: Bearer <CRON_SECRET>`. Nessun secret è esposto nel browser o committato nel repository.

## Pianificazione

`vercel.json` configura un'esecuzione giornaliera alle `03:00 UTC`. La pianificazione diventa attiva solo dopo un Production deployment che contiene la configurazione e dopo l'impostazione di `CRON_SECRET` nell'ambiente Vercel.

## Evoluzione

La v1 privilegia un adapter piccolo e verificabile. Estensioni successive possono aggiungere, senza cambiare il contratto della Inbox:

- fonti istituzionali e statistiche dirette;
- nuovi rapporti e dataset;
- letteratura accademica;
- eventi;
- normative e policy;
- fonti nazionali/linguistiche prioritarie.

Ogni nuovo adapter deve avere deduplicazione, provenienza esplicita e nessuna pubblicazione automatica.

`NEWS_INTELLIGENCE_CODE = PASS`
`NEWS_INTELLIGENCE_PRODUCTION = PENDING`
