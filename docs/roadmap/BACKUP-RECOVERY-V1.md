# Backup & Recovery v1 — Centro Studi

Data: 22 agosto 2026

## Stato verificato

- progetto Supabase: `immigratiimprenditori`;
- organizzazione Supabase: piano **Free**;
- database: PostgreSQL 17, regione `eu-west-3`;
- nessun branch hosted a pagamento necessario durante lo sviluppo;
- le migration correnti sono validate nel laboratorio Supabase locale effimero, non applicate automaticamente alla produzione.

## Vincolo del piano Free

La documentazione Supabase corrente garantisce i backup giornalieri accessibili ai progetti Pro, Team ed Enterprise e raccomanda esplicitamente ai progetti Free di eseguire regolarmente export logici con `supabase db dump` e di mantenerne copie off-site.

Un backup del database **non include gli oggetti di Supabase Storage**: il DB contiene soltanto i relativi metadati. Eventuali file/media dovranno quindi avere una strategia di copia separata quando lo Storage verrà usato per asset non ricostruibili.

## Policy v1 senza costi aggiuntivi

### Prima di ogni migration di produzione

1. creare un dump logico del database di produzione;
2. salvare il dump fuori dal repository Git pubblico;
3. calcolare e conservare un checksum del file;
4. registrare data/ora, commit candidato e migration da applicare;
5. verificare che il dump sia leggibile prima di procedere;
6. applicare la migration solo dopo il quality gate del commit candidato.

### Backup periodico

Fino a quando il progetto resta sul piano Free:

- frequenza obiettivo: almeno **giornaliera** dopo il go-live se sono presenti nuovi contributi/account/dati editoriali non facilmente ricostruibili;
- destinazione: archivio off-site privato e cifrato, mai artifact pubblico GitHub;
- conservazione iniziale consigliata: 7 copie giornaliere + 4 copie settimanali;
- nessuna password, connection string o chiave deve essere inclusa nel nome file, log o repository.

### Restore test

Almeno prima del go-live e dopo modifiche strutturali importanti:

1. partire da PostgreSQL/Supabase locale vuoto;
2. ripristinare il dump logico in un ambiente effimero non-production;
3. eseguire lint/schema check;
4. eseguire gli smoke RLS/pubblicazione/rate-limit;
5. verificare conteggi minimi delle entità critiche;
6. distruggere l'ambiente di restore dopo il test.

## Recovery objectives iniziali

Per il primo rilascio del Centro Studi:

- **RPO obiettivo:** 24 ore massimo, da ridurre con backup più frequenti se aumenta il volume di contributi;
- **RTO obiettivo operativo:** ripristino nello stesso giorno lavorativo per un incidente DB ordinario;
- in caso di corruption o migration difettosa, priorità a fermare le scritture, preservare evidenze/log e ripristinare l'ultimo dump verificato.

Questi obiettivi sono iniziali e vanno rivalutati quando il traffico e il valore dei dati crescono.

## Storage/media

Quando saranno archiviati file non ricostruibili in Supabase Storage, il gate `BACKUP_RECOVERY` non potrà considerarsi completo finché non esisterà anche:

- inventario dei bucket;
- copia off-site degli oggetti;
- verifica periodica di integrità;
- procedura di restore coerente con i metadati DB.

## Gate

- `BACKUP_POLICY = PASS`
- `FREE_PLAN_BACKUP_STRATEGY = PASS`
- `OFFSITE_BACKUP_EXECUTION = PRE_GO_LIVE_PENDING`
- `RESTORE_DRILL = PRE_GO_LIVE_PENDING`
- `STORAGE_BACKUP = NOT_REQUIRED_UNTIL_NON_REBUILDABLE_MEDIA_EXISTS`

La policy non sostituisce un backup reale: impedisce però che una migration production venga applicata senza un punto di ripristino verificabile.