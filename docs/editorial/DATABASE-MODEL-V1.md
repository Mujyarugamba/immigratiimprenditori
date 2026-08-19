# Immigrati Imprenditori — Modello dati editoriale v1

Stato: **IMPLEMENTATO**

## Principio

Il database standalone esistente è stato esteso, non ricostruito.

Si riusano:

- `contents` come Aggregate Root dei contenuti editoriali;
- `content_authors`, `content_tag_links`, `content_subject_links`, `content_relations`;
- `events` e relative entità;
- `observatory_indicators`, `observatory_statistical_sources`, `observatory_indicator_values`;
- `profiles`, `accounts`, `account_role_assignments`;
- `business_sectors`, `languages`.

Non è stata reintrodotta alcuna dipendenza da PonteImprese.

## 1. Geografia

### Paesi

Non esiste una tabella `geo_countries` nella v1.

I Paesi sono rappresentati da codici **ISO 3166-1 alpha-2** in maiuscolo nei campi normalizzati (`IT`, `US`, `FR`, ecc.). Questa scelta evita di precaricare e mantenere un catalogo globale che non aggiunge valore editoriale nella prima fase.

Per le segnalazioni pubbliche sono inoltre conservate `origin_country_label` e `destination_country_label` in testo libero. Una persona può quindi scrivere “Italia” o “Stati Uniti” senza conoscere codici ISO; la redazione potrà successivamente normalizzare il dato.

### `geo_territories`

Territori subnazionali o sovranazionali creati solo quando servono editorialmente.

Campi principali:

- UUID;
- `country_code` nullable per aree sovranazionali;
- `parent_id` self-FK;
- `level_kind`;
- `code` opzionale;
- `name`;
- `slug`;
- `is_active`.

Non è necessario popolare tutti i comuni del mondo.

### `migration_routes`

Relazione canonica `origine → destinazione`.

Campi:

- UUID;
- `origin_country_code`;
- `destination_country_code`;
- `slug`;
- `is_active`;
- timestamps.

L'Italia non ha alcun trattamento tecnico speciale.

## 2. Collegamenti geografici

### `content_geographies`

Collega un contenuto a Paese o territorio con relazione:

- `focus`;
- `origin`;
- `destination`;
- `context`.

### `content_routes`

Collega contenuto e rotta (`focus | related`).

### `event_geographies`

Stessa logica per gli eventi.

### `event_routes`

Stessa logica per le rotte pertinenti agli eventi.

## 3. Inbox redazionale

### `editorial_inbox_items`

Unifica tutti gli arrivi:

- radar automatico;
- segnalazione pubblica;
- contributore;
- inserimento manuale della redazione.

Campi principali:

- UUID;
- `source_kind`;
- `item_kind`;
- titolo;
- URL originale;
- fonte;
- data della fonte;
- sintesi di lavoro;
- Paese origine/destinazione, sia codice normalizzato sia label quando necessario;
- territorio;
- fascia geografica editoriale;
- priorità;
- stato;
- duplicato di;
- assegnatario;
- eventuale contenuto/evento generato;
- timestamps.

Nessuna lettura anonima.

## 4. Segnalazioni pubbliche

### `editorial_submissions`

Dati specifici delle proposte umane, collegati 1:1 a un item Inbox.

Campi minimi:

- tipo proposta;
- nome del proponente;
- email;
- telefono opzionale;
- organizzazione opzionale;
- Paese di origine/destinazione dichiarati;
- testo del contributo/proposta;
- consenso a essere ricontattato;
- consenso eventuale alla pubblicazione del materiale inviato;
- timestamp.

Non è pubblicamente leggibile.

### RPC `submit_editorial_contribution(...)`

È l'unico ingresso anonimo iniziale.

La funzione:

1. valida campi obbligatori e tipo di proposta;
2. crea `editorial_inbox_items` con stato `new`;
3. crea `editorial_submissions`;
4. restituisce solo l'ID della proposta;
5. non crea contenuti pubblici;
6. non concede accesso alla Inbox.

In futuro si aggiungeranno rate limiting/CAPTCHA a livello applicativo se necessari.

## 5. Contributori abituali

Non si introduce un secondo sistema identità.

La futura capacità `contributore` riuserà `auth.users` + `accounts` + `profiles`, estendendo in modo controllato i ruoli applicativi solo quando verrà implementata la relativa UI.

Le segnalazioni occasionali restano possibili senza account.

## 6. Storie e interviste

Non è stata creata una tabella `stories` autonoma.

Una storia/intervista è un `contents` con:

- `type_code` appropriato;
- autori;
- soggetti;
- geografie;
- rotta/e;
- settore/i quando pertinenti;
- media/URL video a livello applicativo iniziale.

Un eventuale `story_metadata` verrà aggiunto solo se emergono campi strutturati che il modello esistente non rappresenta correttamente.

## 7. Rapporti

Nella prima iterazione un rapporto può essere rappresentato come `contents` di tipo `research_report` con fonte e link ufficiale.

Una biblioteca dedicata verrà introdotta nella Fase 9 solo se sarà utile distinguere “pubblicazione catalogata” e “contenuto editoriale che la presenta”.

## 8. Tassonomie

Sono stati aggiunti in modo non distruttivo i nuovi `content_types`:

- `analysis`;
- `testimony`;
- `research_report`;
- `data_note`;
- `policy_brief`;
- `event_report`.

Sono stati inoltre aggiunti 22 temi editoriali al catalogo esistente `content_tags`.

I codici legacy commerciali senza referenze (`opportunity_presentation`, `service_presentation`, `market_content`) sono stati **disattivati**, non eliminati.

## 9. RLS

Regole implementate:

- geografia/rotte: lettura pubblica quando attive; scrittura redattore/admin;
- collegamenti contenuto/evento: lettura pubblica solo se il padre è pubblicato e pubblico; scrittura editoriale;
- Inbox: solo redattore/admin;
- submissions: solo redattore/admin;
- invio anonimo esclusivamente via RPC controllata;
- nessun grant diretto anon su Inbox/submissions.

## 10. Migrazioni applicate

- `editorial_foundation_v1`
- `editorial_submission_country_labels`

Le corrispondenti SQL versionate sono:

- `supabase/migrations/20260820170000_editorial_foundation_v1.sql`
- `supabase/migrations/20260820171000_editorial_submission_country_labels.sql`

## 11. Gate verificati

Dopo l'apply:

- contenuti esistenti: **18**, invariati;
- contenuti pubblicati: **17**, invariati;
- 8 nuove tabelle editoriali/geografiche con RLS attivo;
- 6 nuovi tipi di contenuto attivi;
- 22 temi editoriali attivi;
- 3 tipi commerciali legacy disattivati e con zero referenze;
- anon non può leggere direttamente Inbox/submissions;
- anon può creare una proposta soltanto via RPC;
- test RPC effettuato in transazione con `ROLLBACK`, nessun dato di prova residuo;
- nessun contenuto viene creato automaticamente dall'RPC.

`DATABASE_MODEL_V1 = PASS`
