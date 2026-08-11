Piano di Migration — Dominio PERSONE

> Documento operativo, non architetturale: non introduce alcuna nuova decisione di progettazione, non definisce colonne/vincoli/trigger/policy ex novo. Ogni dettaglio tecnico citato qui rimanda al documento già approvato [`docs/architecture/physical/persone.md`](../physical/persone.md), che resta la fonte di verità. Questo documento si limita a sequenziare, in modo operativo e verificabile, l'applicazione di quel modello fisico al database reale.
> Non crea alcun file `.sql`. Non modifica alcun file esistente del repository, salvo la creazione di questo stesso documento. Non modifica l'architettura già approvata.
> Fonti lette: `docs/architecture/physical/persone.md`; le migration del dominio Persone (`20260718103949_create_profiles_table.sql`, `20260718112212_create_languages_table.sql`, `20260718113607_create_profile_languages_table.sql`). Sono state consultate, solo per individuarne le dipendenze dirette verso `profiles.id`, le migration di altri domini che referenziano `public.profiles` (vedi §1).

---

## 1. Scopo, ambito e stato di partenza

**Obiettivo.** Stabilire l'ordine di creazione/applicazione, le dipendenze, le precondizioni, i rischi, il rollback concettuale e i test necessari a portare il database dallo stato attuale allo stato descritto nel modello fisico del dominio Persone, senza deviare da esso.

**Ambito.** Solo le migration del dominio Persone: estensione di `profiles`, correzione di `profile_languages`, creazione di `competencies`, `profile_competencies`, `personal_stories`. Nessun'altra tabella, di nessun altro dominio, viene creata, corretta o riordinata da questo piano.

**Stato di partenza verificato.**

| Elemento | Stato reale (verificato leggendo le migration) |
|---|---|
| `20260718103949_create_profiles_table.sql` | **Applicata** al progetto Supabase collegato. Contiene `profiles` nella forma "base" (senza `is_public`/`published_at`/`deleted_at`). |
| `20260718112212_create_languages_table.sql` | **Applicata**. Nessun intervento previsto. |
| `20260718113607_create_profile_languages_table.sql` | **Creata, non applicata.** Struttura attuale del file **non** conforme al modello fisico approvato: contiene ancora `is_working_language`, `can_assist_clients`, `notes`, il vincolo `profile_languages_has_usage_check`, `proficiency_level` con il valore `'professional'` (non previsto), e una policy pubblica che verifica solo `p.is_active = true`. Va riscritta prima di essere applicata (§2, M2). |
| `public.competencies`, `public.profile_competencies`, `public.personal_stories` | **Non esistono** ancora nel repository: nessun file di migration le definisce. Vanno create da zero (§2, M3–M5). |

**Dipendenze esterne verificate (non toccate da questo piano).** Leggendo le migration esistenti, quattro tabelle di altri domini referenziano direttamente `public.profiles (id) on delete cascade`: `profile_language_services`, `training_offers`, `training_requests`, `training_provider_qualifications`. Insieme a `profile_languages` (dominio Persone), sono le "5 tabelle esterne" già citate nel modello fisico (§3.1, §8, §12 di `physical/persone.md`). Le loro policy pubbliche leggono oggi solo `p.is_active = true`: dopo l'estensione di `profiles` (M1, sotto) diventeranno **incoerenti** con la nuova formula di visibilità (mostrerebbero dati di profili non ancora pubblicati). La loro correzione appartiene ai rispettivi domini (Servizi, Formazione) e resta **fuori ambito**: viene solo segnalata come rischio trasversale (§5).

---

## 2. Ordine delle migration

| # | Migration | Natura | Cosa fa (rimando al modello fisico) | Nuova o correzione |
|---|---|---|---|---|
| M1 | *estensione di* `profiles` (nuovo file) | Nuova migration che **altera** una tabella già applicata | Aggiunge `is_public`, `published_at`, `deleted_at`; aggiunge il vincolo `profiles_publication_requirements_check`; aggiunge il trigger `protect_profile_lifecycle_fields`; sostituisce la policy pubblica di `select`; estende i `grant` per colonna (§3, §10.1, §11, §13 di `physical/persone.md`) | Nuova (non tocca `20260718103949_create_profiles_table.sql`, che resta intatto) |
| M2 | `profile_languages` (file esistente, riscritto) | **Correzione** di un file mai applicato (consentita, decisione 13) | Rimuove `is_working_language`/`can_assist_clients`/`notes` e il vincolo `profile_languages_has_usage_check`; aggiunge `usage_context`, `is_primary`; corregge `proficiency_level`; aggiunge il trigger `enforce_single_primary_language` e l'indice `profile_languages_single_primary_idx`; aggiorna la policy pubblica alla formula completa di visibilità (§4, §9.1, §10.2 di `physical/persone.md`) | Correzione in-place |
| M3 | `competencies` (nuovo file) | Nuova tabella (catalogo) | Crea il catalogo minimale delle competenze, sola lettura pubblica sui record attivi (§5.2 di `physical/persone.md`) | Nuova |
| M4 | `profile_competencies` (nuovo file) | Nuova tabella (bridge) | Crea la relazione Persona↔Competenza dichiarata (§5.3 di `physical/persone.md`) | Nuova |
| M5 | `personal_stories` (nuovo file) | Nuova tabella | Crea la StoriaPersonale, con stati editoriali, slug, trigger di pubblicazione e di congelamento (§6 di `physical/persone.md`) | Nuova |

**Vincolo d'ordine determinante: M1 deve essere applicata prima di M2, M4 e M5.** Le policy pubbliche di `profile_languages` (M2), `profile_competencies` (M4) e `personal_stories` (M5), come definite nel modello fisico approvato, leggono `profiles.is_public` e `profiles.deleted_at` — colonne che non esistono finché M1 non viene applicata. Applicare M2/M4/M5 prima di M1 produrrebbe un errore SQL (colonna inesistente), non un semplice comportamento sbagliato.

**Conseguenza pratica sul nome del file di M1.** `profile_languages` (M2) ha già un nome di file con timestamp `20260718113607`. Poiché in Supabase le migration pendenti vengono applicate in ordine di nome file, il nuovo file di M1 deve ricevere un timestamp **antecedente** a quello di M2 e **successivo** a quello di `languages` (`20260718112212`), ad esempio un valore nell'intervallo `20260718112213`–`20260718113606` (la scelta esatta è indifferente, purché resti in questo intervallo). In alternativa, si può assegnare a M1 un timestamp "corrente" (successivo a tutto il resto) e contestualmente rinominare il file di M2 con un timestamp ancora più avanti: entrambe le strade sono percorribili perché `profile_languages` non è mai stata applicata (decisione 13); si raccomanda la prima (inserire M1 nell'intervallo esistente) perché non richiede di rinominare alcun file già scritto. M3, M4, M5 sono file nuovi: basta che il timestamp di M4 sia successivo a quello di M3 (dipendenza FK) e che i timestamp di M4/M5 siano successivi a quello di M1; l'ordine "naturale" di creazione (M1, M2, M3, M4, M5) già lo garantisce.

**Nota su M3.** `competencies` non ha alcuna dipendenza da `profiles` estesa: potrebbe tecnicamente essere applicata in qualunque punto della sequenza, anche prima di M1. È collocata dopo M1/M2 solo per coerenza narrativa con l'ordine delle entità nel modello fisico (§3→§4→§5→§6), non per un vincolo tecnico.

---

## 3. Dipendenze

### 3.1 Dipendenze dirette (interne al dominio)

| Migration | Dipende da | Tipo di dipendenza |
|---|---|---|
| M1 (estensione `profiles`) | `profiles` già applicata | Deve esistere la tabella da alterare |
| M2 (`profile_languages`) | M1 applicata; `languages` già applicata | La policy pubblica legge `profiles.is_public`/`deleted_at` (da M1); la FK legge `languages.id` (già applicata) |
| M3 (`competencies`) | Nessuna dipendenza dal dominio Persone | Tabella catalogo autonoma, stesso pattern di `languages` |
| M4 (`profile_competencies`) | M1 applicata; M3 applicata | La policy pubblica legge `profiles.is_public`/`deleted_at` (da M1); la FK legge `competencies.id` (da M3) |
| M5 (`personal_stories`) | M1 applicata | La policy pubblica legge `profiles.is_public`/`deleted_at` (da M1); la FK legge `profiles.id` (già applicata) |

### 3.2 Dipendenze esterne (fuori ambito, solo segnalate)

| Dipendenza | Natura | Impatto su questo piano |
|---|---|---|
| `auth.users` | `profiles.id` è FK verso `auth.users(id) on delete cascade`, già applicata | Nessuna migration di questo piano tocca `auth.users`; M1 aggiunge solo colonne a `profiles`, senza toccare la FK esistente (§3.1, §8 di `physical/persone.md`) |
| `profile_language_services`, `training_offers`, `training_requests`, `training_provider_qualifications` (altri domini, non applicate) | FK dirette verso `profiles.id`; policy pubbliche basate solo su `is_active` | Non modificate da questo piano. Dopo M1, le loro policy pubbliche diventano semanticamente incoerenti con la nuova formula di visibilità (§5, rischio trasversale). La loro correzione è un piano separato, di competenza dei rispettivi domini |
| Bridge table di altri domini che verificano `p.is_active = true` in join (`training_offer_languages`, `training_request_languages`, `profile_language_service_specializations`, `training_offer_sectors`, `training_offer_venue_types`) | Nessuna FK diretta a `profiles`, ma RLS che passa attraverso le tabelle sopra | Stesso impatto indiretto, stessa esclusione dall'ambito |

---

## 4. Precondizioni

### 4.1 Precondizioni generali (valide per l'intera sequenza)

| # | Precondizione | Come verificarla |
|---|---|---|
| 1 | Il documento `physical/persone.md` è approvato e non cambia durante l'esecuzione del piano | Verifica documentale, non tecnica |
| 2 | Lo stato remoto reale corrisponde a quello assunto al §1 (solo `profiles` e `languages` applicate) | `supabase migration list` sul progetto collegato, confrontato con l'elenco locale |
| 3 | Nessun dato reale è ancora presente nelle tabelle coinvolte (assunzione esplicita del modello fisico, §1 e §15 decisione 1) | Query di conteggio (`select count(*) from public.profiles`, ecc.) prima di iniziare; se il conteggio non è più zero, rivedere le precondizioni di backfill (§15 decisione 1 di `physical/persone.md`) prima di procedere |
| 4 | Non esiste un ambiente Docker locale funzionante per testare le migration prima del push (limite già noto in questo progetto) | Verificato nelle sessioni precedenti; i test (§6) vanno quindi eseguiti con query manuali post-applicazione, idealmente su un ambiente di anteprima separato prima del progetto collegato in produzione, se disponibile |
| 5 | Nessuna migration già applicata (`profiles`, `languages`) viene modificata | Confronto testuale dei due file con la versione già applicata prima di ogni push |
| 6 | Backup/point-in-time recovery disponibile sul progetto Supabase collegato | Verifica nel pannello del progetto prima di applicare qualunque migration, anche in assenza di dati reali |

### 4.2 Precondizioni specifiche per step

| Step | Precondizione specifica |
|---|---|
| M1 | Nessuna, oltre alle generali: `profiles` esiste già |
| M2 | M1 applicata con successo e verificata (§6); il file `profile_languages` è stato riscritto secondo §4 di `physical/persone.md` **prima** di questo push, non dopo |
| M3 | Nessuna, oltre alle generali |
| M4 | M1 e M3 applicate con successo e verificate |
| M5 | M1 applicata con successo e verificata |

---

## 5. Rischi

### 5.1 Rischi per step

| Step | Rischio | Gravità | Mitigazione |
|---|---|---|---|
| M1 | La nuova policy pubblica sostituisce quella già applicata (`is_active = true`): qualunque consumatore esterno che si affidasse implicitamente al comportamento attuale smette di vedere profili "attivi ma non pubblicati" | Bassa oggi (nessun dato reale, nessun frontend collegato, confermato nel modello fisico) | Verificare, prima del push, che nessun codice applicativo dipenda dalla policy attuale (già verificato: nessuna query reale esiste) |
| M1 | Il vincolo `profiles_publication_requirements_check` blocca anche `is_active = false` con `is_public = true` contemporanei: una futura scrittura di moderazione che imposti solo `is_active = false` senza toccare `is_public` fallirebbe | Bassa oggi (nessun flusso di moderazione esiste ancora) | Documentare il vincolo per chi implementerà la moderazione (§15 decisione 6 di `physical/persone.md`); non serve una mitigazione ora |
| M2 | Riscrivere il file elimina colonne (`is_working_language`, `can_assist_clients`, `notes`) e un vincolo (`profile_languages_has_usage_check`) mai esistiti a database, quindi senza rischio di perdita dati reali; il rischio è puramente "di disegno": se la riscrittura non fosse fedele al modello fisico approvato, si applicherebbe una struttura sbagliata | Bassa, mitigabile con revisione testuale | Confronto riga per riga tra il file riscritto e §4/§9.1/§10.2/§11 di `physical/persone.md` prima del push |
| M2 | Se applicata prima di M1 (errore di sequenza), la policy pubblica che referenzia `profiles.is_public`/`deleted_at` fallisce con errore SQL in fase di applicazione | Alta se l'ordine non viene rispettato, nulla se rispettato | Vincolo d'ordine esplicito al §2; verifica di `supabase migration list` prima del push |
| M3 | Nessun rischio significativo: tabella catalogo isolata, stesso pattern già validato per `languages` | Bassa | — |
| M4 | Stesso rischio di sequenza di M2, se applicata prima di M1 o M3 | Alta se l'ordine non viene rispettato | Vincolo d'ordine esplicito al §2 |
| M5 | Il trigger `protect_personal_story_lifecycle_fields`, se applicato con una condizione scritta in modo errato, potrebbe bloccare anche l'inserimento iniziale (che non ha ancora un `OLD`) | Bassa, mitigabile con test esplicito | Test dedicato all'inserimento di una nuova storia (§6, M5) prima di considerare il deploy concluso |

### 5.2 Rischi trasversali (validi per l'intera sequenza)

| Rischio | Descrizione | Mitigazione |
|---|---|---|
| Incoerenza con le tabelle esterne | Dopo M1, le policy pubbliche di `profile_language_services`, `training_offers`, `training_requests`, `training_provider_qualifications` (non applicate, altri domini) diventano semanticamente incoerenti con la nuova formula di visibilità di `profiles` | Non risolvibile in questo piano (fuori ambito); da segnalare esplicitamente prima di applicare quei domini, così che vengano corretti insieme o prima di andare in produzione con dati reali |
| Assenza di un ambiente di test locale | Nessun container Docker locale disponibile per validare le migration prima del push (limite noto) | Applicare uno step alla volta sul progetto collegato, verificando con query manuali (§6) dopo ciascuno, invece di applicare tutta la sequenza in un solo push |
| Comparsa di dati reali durante l'esecuzione del piano | Se tra la stesura di questo piano e la sua esecuzione emergono i primi utenti reali, alcune assunzioni (nessun backfill necessario, rollback a basso rischio) non sono più valide | Ripetere la verifica di precondizione 4.1.3 immediatamente prima di ogni push, non solo all'inizio del piano |
| Cascata da `auth.users` | Il vincolo già applicato `profiles.id references auth.users(id) on delete cascade` resta invariato; nessuno degli step di questo piano lo tocca, ma resta un rischio strutturale preesistente (già documentato in §8 di `physical/persone.md`) | Nessuna azione in questo piano: è un rischio già accettato e già descritto, non generato da queste migration |
| Errore umano nell'ordine di applicazione | `supabase db push` applica tutte le migration pendenti nell'ordine dei nomi file: un timestamp assegnato per errore fuori sequenza (§2) romperebbe silenziosamente l'ordine corretto | Verificare `supabase migration list` (colonna locale ordinata) immediatamente prima di ogni push, non fidarsi della sola data di creazione del file |

---

## 6. Rollback concettuale

**Principio generale.** Nessuna migration già applicata viene mai modificata o eliminata: un rollback, se necessario dopo l'applicazione, si realizza sempre con una **nuova migration compensativa** in avanti, mai con la cancellazione o la modifica del file originale — lo stesso principio già seguito per `profiles` e `languages`. Prima che una migration sia stata applicata, il "rollback" è semplicemente non applicarla (o correggerla e riprovare, per M2).

| Step | Se non ancora applicata | Se già applicata (rollback tramite nuova migration compensativa) | Attenzione |
|---|---|---|---|
| M1 | Correggere il file e non pushare | `drop constraint profiles_publication_requirements_check`; `drop trigger protect_profile_lifecycle_fields`; ripristinare la policy pubblica precedente (`is_active = true`) o rimuoverla; **non** droppare le colonne `is_public`/`published_at`/`deleted_at` se esiste anche un solo profilo reale che le usa — altrimenti si perderebbe la cronologia di pubblicazione/cancellazione; se non esiste alcun dato reale (verificato, §4.1.3), le colonne possono essere droppate senza perdita |
| M2 | Correggere il file e non pushare (è l'unico step di questo piano ancora modificabile in-place senza vincoli, perché mai applicato) | Se applicata con una struttura sbagliata: nuova migration correttiva (`alter table` per aggiungere/rimuovere colonne, `drop`/`create policy`); **non** un semplice ritorno alla vecchia struttura con `is_working_language`/`can_assist_clients`, che sarebbe un passo indietro rispetto al modello approvato — si corregge in avanti, non all'indietro |
| M3 | Non pushare | `drop table public.competencies` **solo se** `profile_competencies` (M4) non è ancora stata applicata o è stata rimossa per prima (vincolo FK `on delete restrict`) | Ordine di rollback inverso obbligatorio: M4 prima di M3 |
| M4 | Non pushare | `drop table public.profile_competencies` | Nessuna dipendenza in uscita: rollback semplice |
| M5 | Non pushare | `drop table public.personal_stories` se non esistono storie reali già pubblicate; se esistono, valutare l'esportazione prima della rimozione (stesso principio del §8 di `physical/persone.md` per la cancellazione dell'identità: non distruggere contenuto pubblicato senza un passaggio di conservazione) | Rollback distruttivo solo in assenza di contenuto reale |

**Nota conclusiva sul rollback.** Con lo stato di partenza descritto al §1 (nessun dato reale in nessuna delle tabelle coinvolte), ogni rollback descritto sopra è oggi a **rischio nullo di perdita dati**. La tabella resta comunque valida come riferimento operativo per quando il dominio Persone sarà in produzione con utenti reali.

---

## 7. Test da eseguire

### 7.1 Test per step

| Step | Test | Esito atteso |
|---|---|---|
| M1 | Creare un nuovo utente (o simulare l'inserimento) e verificare `is_public = false`, `published_at is null`, `deleted_at is null` sulla riga `profiles` risultante | Valori di default corretti (§3.1) |
| M1 | Tentare `update profiles set is_public = true` su un profilo con `display_name` vuoto, o `is_active = false`, o `deleted_at` non nullo | Violazione del vincolo `profiles_publication_requirements_check` |
| M1 | Impostare `is_public = true` su un profilo valido, poi tornare a `is_public = false` | `published_at` viene scritto alla prima transizione e non viene mai azzerato dopo (§3.1, §11) |
| M1 | Tentare `update` su una riga con `deleted_at` già impostato, come proprietario (`authenticated`) | Il trigger `protect_profile_lifecycle_fields` rifiuta la modifica |
| M1 | Selezionare `profiles` come `anon` | Vengono restituite solo le righe con `is_public = true and is_active = true and deleted_at is null` |
| M1 | Selezionare `profiles` come proprietario (`authenticated`, `auth.uid() = id`) su una riga privata/cancellata/sospesa | La riga è comunque visibile al proprietario |
| M1 | Tentare `update` diretto di `is_active` o `published_at` come proprietario | Negato dai `grant` per colonna |
| M2 | Inserire due volte la stessa coppia `(profile_id, language_id)` | Violazione della chiave primaria composta |
| M2 | Inserire una riga con `language_id` di una lingua con `is_active = false` | Rifiutata dalla policy/`with check` di `insert` |
| M2 | Impostare `is_primary = true` su due lingue diverse dello stesso profilo, in due operazioni separate | La seconda operazione, tramite il trigger `enforce_single_primary_language`, azzera `is_primary` sulla prima; l'indice `profile_languages_single_primary_idx` non viene mai violato |
| M2 | Selezionare `profile_languages` come `anon` per un profilo con `is_public = false` | Nessuna riga restituita, anche se il profilo ha `is_active = true` (verifica la correzione rispetto alla vecchia policy) |
| M2 | Selezionare `profile_languages` come proprietario per le proprie lingue, indipendentemente dallo stato di visibilità del profilo | Le righe sono sempre visibili al proprietario |
| M3 | Selezionare `competencies` come `anon` | Solo le righe con `is_active = true` |
| M3 | Tentare `insert`/`update`/`delete` su `competencies` come `authenticated` | Negato (nessun `grant` di scrittura previsto) |
| M4 | Inserire due volte la stessa coppia `(profile_id, competency_id)` | Violazione della chiave primaria composta |
| M4 | Tentare `delete` su una riga di `competencies` referenziata da almeno una `profile_competencies` | Violazione del vincolo `on delete restrict` |
| M4 | Selezionare `profile_competencies` come `anon` per un profilo privato o per una competenza disattivata | Nessuna riga restituita |
| M5 | Inserire una nuova storia con `status` diverso da `'draft'` | Rifiutata dal `with check` della policy di `insert` |
| M5 | Inserire una storia con `title` o `content` vuoti/solo spazi | Violazione dei rispettivi `check` |
| M5 | Portare una storia da `draft` a `published`, poi a `archived` | `published_at` viene scritto alla prima transizione a `published` e non viene mai azzerato, nemmeno dopo l'archiviazione (§6.1, §11) |
| M5 | Selezionare `personal_stories` come `anon` per una storia `archived` o `draft` | Nessuna riga restituita, anche se l'autore è pubblico |
| M5 | Selezionare `personal_stories` come `anon` per una storia `published` di un autore diventato privato/sospeso dopo la pubblicazione | Nessuna riga restituita (comportamento accettato, §8 di `physical/persone.md`) |
| M5 | Tentare `delete` diretto su una storia, come autore | Negato (nessun `grant` di `delete`); solo `update` di `deleted_at` è consentito |
| M5 | Tentare `update` su una storia con `deleted_at` già impostato | Il trigger `protect_personal_story_lifecycle_fields` rifiuta la modifica |

### 7.2 Test trasversali (dopo ogni step e a fine sequenza)

| Test | Perché |
|---|---|
| `npm run lint` | Nessun file applicativo viene toccato da queste migration, ma va comunque confermato che il repository resti pulito dopo la creazione dei nuovi file `.sql` |
| `npx tsc --noEmit` | Idem: nessuna regressione attesa, ma da confermare, dato che nessun tipo TypeScript esiste ancora per queste tabelle |
| `supabase migration list` | Confrontare lo stato locale/remoto prima e dopo ogni push, per accertarsi che solo la migration prevista sia stata applicata, nell'ordine previsto |
| Verifica manuale delle 5 tabelle esterne dipendenti (§3.2) | Dopo M1, controllare (in sola lettura, senza modificarle) che le policy pubbliche di `profile_language_services`/`training_*` restino coerenti con l'uso previsto nella fase attuale (nessun dato reale, nessun frontend collegato): non è un test bloccante per questo piano, ma un controllo di consapevolezza prima di procedere con l'applicazione di quei domini |

**Nota sull'assenza di un ambiente locale.** In mancanza di un container Docker locale per `supabase start`, i test sopra vanno eseguiti con query dirette (SQL editor o client autenticato con ruoli diversi) sul progetto reale, **uno step alla volta**, verificando l'esito prima di procedere allo step successivo — non applicando l'intera sequenza M1–M5 in un solo push.

---

## 8. Checklist sintetica finale

| # | Azione | Esito richiesto prima di procedere |
|---|---|---|
| 1 | Verificare le precondizioni generali (§4.1) | Tutte confermate |
| 2 | Creare/riscrivere M1 (estensione `profiles`) con timestamp nell'intervallo corretto (§2) | File pronto, non ancora applicato |
| 3 | Applicare M1, eseguire i test di §7.1 relativi a M1 | Tutti superati |
| 4 | Riscrivere M2 (`profile_languages`) secondo §4 di `physical/persone.md` | File coerente con il modello fisico |
| 5 | Applicare M2, eseguire i test di §7.1 relativi a M2 | Tutti superati |
| 6 | Creare M3 (`competencies`), applicarla, eseguire i test relativi | Tutti superati |
| 7 | Creare M4 (`profile_competencies`), applicarla, eseguire i test relativi | Tutti superati |
| 8 | Creare M5 (`personal_stories`), applicarla, eseguire i test relativi | Tutti superati |
| 9 | Eseguire i test trasversali (§7.2) | Tutti superati |
| 10 | Segnalare formalmente ai domini Servizi/Formazione l'incoerenza introdotta in M1 sulle loro policy pubbliche (§3.2, §5.2) | Segnalazione effettuata, nessuna correzione qui |

---

## Addendum L1.1b (fuori dalla sequenza M1–M5 storica)

Migration additive già applicate sul progetto collegato:

- `20260814100000_create_person_contact_channels.sql`
- `20260814110000_harden_legacy_profiles_phone.sql`

Non sostituiscono M1–M5; estendono i recapiti professionali come da `physical/persone.md` (addendum Contatti) e `docs/architecture/legal/l1.1b-contact-visibility-model.md`.

---

## Conclusione

Questo piano non modifica né reinterpreta alcuna decisione del modello fisico approvato: si limita a stabilire in quale ordine, con quali precondizioni e con quali verifiche le cinque migration del dominio Persone (estensione di `profiles`, correzione di `profile_languages`, creazione di `competencies`, `profile_competencies`, `personal_stories`) possano essere create e applicate senza rompere le migration già applicate, senza introdurre incoerenze interne, e con un percorso di rollback definito per ciascuno step. L'unico vincolo tecnico rigido è l'ordine relativo tra M1 e (M2, M4, M5), dovuto alla dipendenza delle rispettive policy pubbliche dalle nuove colonne di `profiles`; tutto il resto della sequenza è organizzato per chiarezza narrativa, non per necessità tecnica. Il rischio principale che questo piano non può risolvere, perché fuori dal proprio ambito, è l'incoerenza che M1 introduce nelle policy pubbliche di quattro tabelle di altri domini non ancora applicate: viene segnalato esplicitamente, non corretto.
