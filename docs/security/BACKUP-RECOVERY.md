# Backup e recovery — Centro Studi

Stato: **GO-LIVE BASELINE PREPARATA / CI RESTORE DRILL PASS / PRODUCTION-SOURCE DRILL PENDING**  
Data: 2026-08-23

## Perimetro attuale

1. **Database Supabase/PostgreSQL** — backup Production cifrato automatizzabile tramite `.github/workflows/production-backup.yml`; percorso logico Supabase verificato separatamente nel laboratorio CI.
2. **Documenti, codice e media attuali** — sono versionati nel repository Git e quindi coperti dalla storia Git/remota.
3. **Supabase Storage / media esterni** — non risultano oggi parte del flusso applicativo canonico. Se verranno introdotti, il backup degli oggetti diventa un gate obbligatorio prima del loro uso in Production.

## Sicurezza del backup Production

Il workflow Production:

- gira soltanto su `main`;
- richiede i secret `SUPABASE_DB_URL` e `BACKUP_ENCRYPTION_PASSPHRASE`;
- crea un dump PostgreSQL custom-format;
- verifica l'indice del dump con `pg_restore --list`;
- cifra il dump con GnuPG/AES-256 **prima** dell'upload;
- elimina il dump in chiaro dal runner;
- conserva soltanto file cifrato + SHA-256;
- usa retention GitHub Actions di 14 giorni.

I secret non devono mai essere salvati nel repository o stampati nei log.

Questo archivio cifrato è il percorso di conservazione Production. Il drill pre-release usa inoltre il percorso logico ufficiale Supabase (`roles.sql` + `schema.sql` + `data.sql`) perché deve provare la ricostruzione dentro un **nuovo progetto Supabase-managed**, non dentro un PostgreSQL generico.

## Attivazione prima del go-live

Prima del merge/go-live:

1. configurare `SUPABASE_DB_URL` come GitHub Actions secret con connessione Production SSL;
2. configurare una passphrase lunga e casuale in `BACKUP_ENCRYPTION_PASSPHRASE`;
3. eseguire manualmente `Production encrypted backup` da `main`;
4. verificare che l'artifact contenga soltanto `.dump.gpg` e `.sha256`;
5. scaricare il primo backup cifrato e conservarne almeno una copia in un secondo luogo controllato;
6. da una macchina amministrativa controllata ottenere anche il dump logico Production tramite Supabase CLI;
7. ripristinare quel dump logico in un progetto Supabase non-Production pulito;
8. eseguire post-restore hooks e smoke completi prima di dichiarare `PRODUCTION_READINESS = PASS`.

## Restore logico Supabase — procedura canonica del drill

Su una macchina amministrativa controllata, con Supabase CLI e PostgreSQL client:

```bash
# 1. Dump logico della sorgente controllata
supabase db dump -f roles.sql --role-only
supabase db dump -f schema.sql
supabase db dump -f data.sql --use-copy --data-only \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes"

# 2. Verifica che i tre componenti siano presenti e non vuoti
test -s roles.sql
test -s schema.sql
test -s data.sql

# 3. Ripristina SOLO su un progetto Supabase-managed vuoto/non-Production
psql "$RESTORE_DATABASE_URL" \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql

# 4. Riaggancia gli hook applicativi che puntano allo schema Auth gestito
psql "$RESTORE_DATABASE_URL" \
  --variable ON_ERROR_STOP=1 \
  --file scripts/ci/post-restore-auth-hooks.sql
```

### Normalizzazione minima dei ruoli gestiti

Il role-only dump Supabase può contenere privilegi su parametri PostgreSQL gestiti dalla piattaforma che una normale connessione di progetto non può reimpostare. Nel laboratorio CI è stato osservato:

```sql
GRANT SET ON PARAMETER "log_min_messages" TO "supabase_realtime_admin";
```

`scripts/ci/backup-archive-smoke.sh` elimina **solo** le forme note relative a `log_min_messages` (`ALTER ROLE ...` oppure `GRANT SET ON PARAMETER ...`) e fallisce se compare una forma non riconosciuta. Nessun altro ruolo, membership o parameter grant viene filtrato.

### Hook applicativo su `auth.users`

Lo schema `auth` è gestito da Supabase e non deve essere trattato come schema applicativo da sovrascrivere. Il logical dump ripristina `public.handle_new_user()`, ma l'hook applicativo su `auth.users` va riagganciato esplicitamente.

`scripts/ci/post-restore-auth-hooks.sql`:

- verifica la presenza di `auth.users`;
- verifica la presenza di `public.handle_new_user()`;
- ricrea in modo idempotente `on_auth_user_created`;
- verifica che esista esattamente un trigger applicativo con quel nome e funzione;
- non copia o modifica utenti, credenziali, sessioni, MFA o altri oggetti Auth gestiti.

## Verifiche minime del restore drill

Controllare almeno:

- presenza e conteggio di `public.languages`;
- presenza di `public.contents`;
- presenza di `public.observatory_indicators` e valori associati;
- presenza delle tabelle editoriali private;
- RLS attiva sulle tabelle private;
- presenza di `auth.users` sul target Supabase-managed;
- presenza del trigger applicativo `on_auth_user_created` dopo il post-restore;
- creazione di utenti Auth effimeri con provisioning dei relativi `public.profiles`;
- separazione contributor/redattore e auto-elevazione negata;
- build applicativa contro il database ripristinato;
- HTTP/security smoke;
- browser E2E autenticato e cleanup degli utenti effimeri.

## Evidenza CI del 23/08/2026

Sul branch candidato `feature/research-radar-ai-knowledge-20260822` il laboratorio ha provato con successo:

- dump logico `roles/schema/data`;
- normalizzazione chirurgica del solo privilegio gestito `log_min_messages`;
- avvio di un nuovo stack Supabase-managed senza migration applicative;
- restore completo di ruoli, schema e dati;
- `POST_RESTORE_AUTH_HOOKS = PASS`;
- `BACKUP_POST_RESTORE_AUTH_HOOK = PASS`;
- `BACKUP_EPHEMERAL_RESTORE = PASS`;
- Auth integration smoke con utenti effimeri reali = PASS;
- build, HTTP/security smoke e browser E2E autenticato sul database ripristinato = PASS.

**CI_EPHEMERAL_RESTORE_DRILL = PASS.**

Questo risultato dimostra la correttezza tecnica del percorso di recovery ma **non sostituisce** il gate pre-release con un dump logico proveniente dalla Production reale. Quel passaggio richiede credenziali DB controllate e un target non-Production pulito ed è ancora PENDING.

## Recovery objective iniziale

Per la prima pubblicazione:

- **RPO target:** massimo 24 ore per il database;
- **RTO target:** ripristino amministrativo entro una giornata lavorativa;
- conservazione cifrata automatica: 14 giorni, da integrare con almeno una copia secondaria controllata.

Questi valori possono essere ridotti quando volume, criticità e frequenza editoriale aumenteranno.
