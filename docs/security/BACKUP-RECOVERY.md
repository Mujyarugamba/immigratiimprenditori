# Backup e recovery — Centro Studi

Stato: **PRODUCTION BACKUP ATTIVO / PRODUCTION-SOURCE ISOLATED RESTORE DRILL PASS**  
Ultima verifica reale: 2026-08-31

## Perimetro attuale

1. **Database Supabase/PostgreSQL** — backup logico Production cifrato automatico tramite `.github/workflows/production-backup.yml`.
2. **Codice, documenti e media versionati** — coperti dalla storia Git e dal repository remoto.
3. **Supabase Storage / oggetti esterni** — gli oggetti binari non fanno parte del percorso applicativo canonico attuale. Se verranno introdotti, il loro backup diventa un gate obbligatorio prima dell'uso in Production.
4. **Copia secondaria off-platform** — ancora da attivare. Il backup GitHub Actions non deve essere considerato l'unica copia definitiva a lungo termine.

## Sicurezza del backup Production

Il workflow `Production encrypted backup`:

- parte soltanto da `main`;
- gira automaticamente ogni giorno alle **02:17 UTC** ed è anche avviabile manualmente;
- serializza le esecuzioni (`cancel-in-progress: false`) per evitare backup concorrenti;
- richiede i secret `SUPABASE_DB_URL` e `BACKUP_ENCRYPTION_PASSPHRASE`;
- usa Supabase CLI **2.115.0**;
- esporta separatamente `roles.sql`, `schema.sql` e `data.sql`;
- esclude dal data dump i metadati Storage gestiti non portabili `storage.buckets_vectors` e `storage.vector_indexes`;
- verifica che componenti e sentinelle applicative essenziali siano presenti prima di cifrare;
- crea un archivio `tar.gz` e lo cifra con **GnuPG / AES-256** prima dell'upload;
- elimina directory e archivio in chiaro dal runner;
- pubblica soltanto `*.tar.gz.gpg` e relativo `*.sha256`;
- conserva l'artifact cifrato in GitHub Actions per **30 giorni**;
- usa action GitHub e setup Supabase bloccati a commit SHA immutabili, verificati anche dal go-live functional gate.

I secret non devono mai essere salvati nel repository o stampati nei log.

## Restore drill Production-source

Il workflow `.github/workflows/production-backup-restore-drill.yml` è deliberatamente **solo manuale** e può essere eseguito soltanto da `main` con un `backup_run_id` esplicito.

Il drill:

1. scarica l'artifact cifrato del run indicato;
2. verifica il checksum SHA-256;
3. normalizza soltanto i metadati Storage gestiti necessari alla portabilità del target isolato;
4. decifra l'archivio nel runner;
5. inizializza uno stack Supabase locale/effimero;
6. abilita TOTP MFA soltanto nella configurazione Auth locale del laboratorio;
7. ripristina ruoli, schema e dati nel PostgreSQL locale;
8. verifica struttura applicativa, RLS e dati sentinella provenienti dalla Production;
9. esegue Auth integration smoke con utenti effimeri;
10. esegue build dell'applicazione contro il database ripristinato;
11. esegue HTTP/security smoke ed E2E browser autenticato;
12. elimina input di restore e stack locale anche in caso di errore.

Il target del restore è esclusivamente locale al runner. **Production non è mai un target del drill.**

Anche questo workflow usa concorrenza serializzata e action GitHub bloccate a commit SHA immutabili.

## Evidenza reale del 31/08/2026

### Backup Production reale

Workflow: `Production encrypted backup`  
Run ID: **33406592097**

Evidenze osservate nel run:

- `BACKUP_SECRET_GATE = PASS`;
- export `roles.sql` = completato;
- export `schema.sql` = completato;
- export `data.sql` = completato;
- `BACKUP_SUPABASE_LOGICAL_EXPORT = PASS`;
- `BACKUP_ENCRYPTION = PASS`;
- artifact `centro-studi-encrypted-backup-33406592097` caricato correttamente;
- artifact composto dal backup cifrato e dal relativo checksum;
- nessun dump SQL in chiaro è stato caricato come artifact.

Il run originale riportò un errore successivo nel controllo di cleanup per un pattern troppo ampio che considerava anche il file cifrato come materiale plaintext. L'artifact cifrato era già stato creato e caricato correttamente; il controllo è stato poi corretto e il backup è stato realmente utilizzato dal restore drill.

### Restore isolato del backup Production reale

Workflow: `Production backup isolated restore drill`  
Run ID: **33414599035**  
Esito: **SUCCESS**

Il run ha completato con successo:

- download dell'artifact Production reale;
- verifica checksum;
- decifratura;
- restore nello stack Supabase locale isolato;
- verifiche database e RLS;
- Auth integration smoke;
- configurazione TOTP MFA locale;
- build applicativa sul database ripristinato;
- HTTP/security smoke;
- browser E2E autenticato;
- cleanup finale dello stack e dei file temporanei.

**PRODUCTION_SOURCE_ISOLATED_RESTORE_DRILL = PASS.**

Questa è evidenza che l'artifact Production realmente prodotto può essere decifrato, ripristinato e utilizzato dall'applicazione in un ambiente Supabase isolato senza scrivere su Production.

## Verifiche minime per i drill futuri

Ogni drill deve mantenere almeno questi gate:

- checksum dell'artifact valido;
- archivio cifrato leggibile con la passphrase autorizzata;
- presenza delle tabelle applicative attese;
- RLS attiva sulle tabelle protette;
- presenza di dati sentinella Production nel database ripristinato;
- Auth locale funzionante con TOTP abilitato nel solo laboratorio;
- provisioning e separazione dei ruoli applicativi;
- auto-elevazione negata;
- build applicativa contro il restore;
- HTTP/security smoke;
- browser E2E autenticato;
- cleanup del target effimero.

## Recovery objective

Baseline attuale:

- **RPO target:** massimo 24 ore per il database;
- **RTO target:** ripristino amministrativo entro una giornata lavorativa;
- backup cifrato automatico: giornaliero;
- retention GitHub Actions: **30 giorni**;
- restore Production-source: **provato con successo** il 31/08/2026;
- copia secondaria indipendente da GitHub: **PENDING**.

## Gap residuo: copia off-platform

Per eliminare il single-provider risk resta da scegliere e attivare almeno un secondo luogo controllato per i backup cifrati. Requisiti minimi:

- storage privato, non pubblico;
- cifratura già applicata prima del trasferimento;
- credenziali separate da quelle del database Production;
- retention almeno equivalente o superiore a 30 giorni;
- possibilità di verificare periodicamente checksum e download;
- nessuna chiave/passphrase di decifratura conservata insieme all'archivio;
- procedura di restore periodicamente testata anche dalla copia secondaria.

La scelta del provider off-platform è una decisione operativa separata e non deve essere inventata nel codice senza approvazione esplicita.
