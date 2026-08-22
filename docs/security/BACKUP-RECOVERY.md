# Backup e recovery — Centro Studi

Stato: **GO-LIVE BASELINE PREPARATA / PRODUCTION ACTIVATION PENDING**  
Data: 2026-08-22

## Perimetro attuale

1. **Database Supabase/PostgreSQL** — backup giornaliero automatizzabile tramite `.github/workflows/production-backup.yml`.
2. **Documenti, codice e media attuali** — sono versionati nel repository Git e quindi coperti dalla storia Git/remota.
3. **Supabase Storage / media esterni** — non risultano oggi parte del flusso applicativo canonico. Se verranno introdotti, il backup degli oggetti diventa un gate obbligatorio prima del loro uso in produzione.

## Sicurezza del backup production

Il workflow production:

- gira soltanto su `main`;
- richiede i secret `SUPABASE_DB_URL` e `BACKUP_ENCRYPTION_PASSPHRASE`;
- crea un dump PostgreSQL custom-format;
- verifica l'indice del dump con `pg_restore --list`;
- cifra il dump con GnuPG/AES-256 **prima** dell'upload;
- elimina il dump in chiaro dal runner;
- conserva soltanto file cifrato + SHA-256;
- usa retention GitHub Actions di 14 giorni.

I secret non devono mai essere salvati nel repository o stampati nei log.

## Attivazione prima del go-live

Prima del merge/go-live:

1. configurare `SUPABASE_DB_URL` come GitHub Actions secret con connessione production SSL;
2. configurare una passphrase lunga e casuale in `BACKUP_ENCRYPTION_PASSPHRASE`;
3. eseguire manualmente `Production encrypted backup` da `main`;
4. verificare che l'artifact contenga soltanto `.dump.gpg` e `.sha256`;
5. scaricare il primo backup cifrato e conservarne almeno una copia in un secondo luogo controllato;
6. eseguire un restore drill in un database non-production prima di dichiarare `PRODUCTION_READINESS = PASS`.

## Procedura di ripristino

Su una macchina amministrativa controllata, con PostgreSQL client e GnuPG:

```bash
# 1. Verifica integrità del file cifrato
sha256sum -c centro-studi-YYYYMMDDTHHMMSSZ.dump.gpg.sha256

# 2. Decifra localmente
printf '%s' "$BACKUP_ENCRYPTION_PASSPHRASE" \
  | gpg --batch --pinentry-mode loopback --passphrase-fd 0 \
    --decrypt --output centro-studi.restore.dump \
    centro-studi-YYYYMMDDTHHMMSSZ.dump.gpg

# 3. Ispeziona il contenuto prima del restore
pg_restore --list centro-studi.restore.dump | less

# 4. Ripristina SOLO su database vuoto/non-production per il drill
pg_restore \
  --no-owner \
  --no-privileges \
  --dbname="$RESTORE_DATABASE_URL" \
  centro-studi.restore.dump

# 5. Elimina il plaintext appena concluse le verifiche
rm -f centro-studi.restore.dump
```

## Verifiche minime del restore drill

Controllare almeno:

- presenza e conteggio di `public.languages`;
- presenza di `public.contents`;
- presenza di `public.observatory_indicators` e valori associati;
- presenza delle tabelle editoriali private;
- RLS attiva sulle tabelle private;
- capacità dell'applicazione di leggere il database ripristinato in modalità non-production.

## CI locale

`scripts/ci/backup-archive-smoke.sh` crea un dump dal Supabase locale effimero, verifica che il custom archive sia leggibile e lo materializza in SQL senza alterare il database di test. Questo prova continuamente che il percorso tecnico di dump/lettura dell'archivio non sia rotto.

## Recovery objective iniziale

Per la prima pubblicazione:

- **RPO target:** massimo 24 ore per il database;
- **RTO target:** ripristino amministrativo entro una giornata lavorativa;
- conservazione cifrata automatica: 14 giorni, da integrare con almeno una copia secondaria controllata.

Questi valori possono essere ridotti quando volume, criticità e frequenza editoriale aumenteranno.
