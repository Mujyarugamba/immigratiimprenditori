# Numero zero — stato al 22 agosto 2026

Branch: `feature/research-radar-ai-knowledge-20260822`
Database interrogato in sola lettura: progetto Supabase `immigratiimprenditori`
Produzione: **non modificata**

## Requisito roadmap

Il punto 20 richiede, prima del lancio pubblico:

- nucleo dati Lombardia / Italia;
- alcune storie molto buone;
- almeno un confronto internazionale;
- rapporti selezionati;
- eventi;
- home già viva.

Il gate finale `IMMIGRATI_IMPRENDITORI_V1 = LIVE` non viene assegnato automaticamente: la qualità delle storie e l'approvazione del rilascio restano decisioni umane.

## Inventario pubblico attuale

### Osservatorio

- **3 indicatori pubblicati**
- **28 valori finali**

Copertura utile al numero zero:

- Italia — valori pubblici nazionali presenti;
- Lombardia (`IT-25`) — valore pubblico regionale presente;
- confronto OECD — valori pubblici su più Paesi/territori.

Esempi del nucleo esistente:

- Imprese straniere registrate, Italia, 31 dicembre 2025: **673.103**;
- Imprese straniere registrate, Lombardia, 30 giugno 2025: **135.249**;
- Tasso di lavoro autonomo per luogo di nascita, Italia, 2022: **13,7% nati all'estero / 19,8% nati nel Paese**;
- la stessa serie permette confronto con Francia, Germania, Spagna, Paesi Bassi, Portogallo, Repubblica Ceca e aggregato OECD37.

Questi numeri restano sempre subordinati alle definizioni e metodologie pubblicate nelle rispettive schede dell'Osservatorio.

### Contenuti

- **21 contenuti pubblici pubblicati**
- di cui **2 `research_report`**:
  1. `L’imprenditoria straniera in Italia — I semestre 2025` — InfoCamere / Unioncamere / Ministero del Lavoro e delle Politiche Sociali;
  2. `Migrant entrepreneurship in OECD countries` — OECD.

### Eventi

- **1 evento pubblico qualificato**:
  - `One Way Summit 2026` — San Francisco, 28–30 ottobre 2026, evento internazionale dedicato agli immigrant founders.

### Storie e interviste

- **0** contenuti pubblicati nei tipi `business_story`, `interview`, `personal_story`, `testimony`.
- La Inbox privata contiene **5 proposte di intervista**, tutte ad alta priorità e in stato `needs_research`.

Shortlist editoriale preparata per il numero zero:

1. Agie Hujian Zhou / Ravioleria Sarpi — Lombardia, Cina → Italia;
2. Gianni Chiloiro e Angelo Sannino / Doppio Zero — italiani all'estero, Italia → USA;
3. Adeola Adedewe / Kredete — dimensione internazionale, Nigeria → USA / diaspora africana.

La shortlist è un research pack: **nessun contatto inviato e nessuna pubblicazione automatica**.

## Gate misurabile

| Criterio | Stato attuale |
| --- | --- |
| Nucleo dati Lombardia | PASS |
| Nucleo dati Italia | PASS |
| Confronto internazionale | PASS |
| Rapporti selezionati | PASS |
| Evento qualificato | PASS |
| Storie/interviste pubblicate | **FAIL — 0** |
| Home viva | BRANCH_READY / VISUAL_QA_PENDING |

Interpretazione tecnica del plurale “alcune storie”: minimo **2** storie/interviste/testimonianze pubblicate. Questo è soltanto un requisito quantitativo minimo e non certifica la qualità editoriale.

## Decisione attuale

- `NUMBER_ZERO_DATA = PASS`
- `NUMBER_ZERO_REPORTS = PASS`
- `NUMBER_ZERO_EVENTS = PASS`
- `NUMBER_ZERO_STORIES = BLOCKED`
- `NUMBER_ZERO_AUTOMATIC_EVIDENCE = FAIL`
- `IMMIGRATI_IMPRENDITORI_V1 = NOT_LIVE`

Il blocco principale del numero zero non è tecnico: è editoriale. Prima del lancio servono almeno due storie/interviste realizzate, verificate e approvate, più il visual QA finale e i gate di produzione già elencati nel documento `PRODUCTION-READINESS-2026-08-22.md`.
