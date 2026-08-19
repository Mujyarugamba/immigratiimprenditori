# Immigrati Imprenditori — Modello dati editoriale v1

Stato: **DESIGN APPROVED FOR IMPLEMENTATION**

## Principio

Il database standalone esistente viene esteso, non ricostruito.

Si riusano:

- `contents` come Aggregate Root dei contenuti editoriali;
- `content_authors`, `content_tag_links`, `content_subject_links`, `content_relations`;
- `events` e relative entità;
- `observatory_indicators`, `observatory_statistical_sources`, `observatory_indicator_values`;
- `profiles`, `accounts`, `account_role_assignments`;
- `business_sectors`, `languages`.

Non viene reintrodotta alcuna dipendenza da PonteImprese.

## 1. Geografia

### `geo_countries`

Catalogo globale ISO 3166-1 alpha-2.

Campi principali:

- `code` PK (2 lettere uppercase);
- `name_en`;
- `is_active`;
- timestamps.

La UI italiana può rendere il nome localizzato a partire dal codice ISO; il database conserva una label internazionale stabile.

### `geo_territories`

Territori subnazionali o sovranazionali selezionati editorialmente.

Campi:

- UUID;
- `country_code` nullable per aree sovranazionali;
- `parent_id` self-FK;
- `level_kind`;
- `code` opzionale;
- `name`;
- `slug`;
- `is_active`.

Non è necessario popolare tutti i comuni del mondo. I territori entrano quando servono a dati o contenuti.

### `migration_routes`

Relazione canonica `origine → destinazione`.

Campi:

- UUID;
- `origin_country_code`;
- `destination_country_code`;
- `slug`;
- `is_active`;
- timestamps.

L'Italia non ha alcun trattamento speciale.

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
- Paese origine/destinazione;
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

In futuro si aggiungeranno rate limiting/CAPTCHA a livello applicativo.

## 5. Contributori abituali

Non si introduce ancora un secondo sistema identità.

La futura capacità `contributore` dovrà riusare `auth.users` + `accounts` + `profiles`, estendendo in modo controllato i ruoli applicativi solo quando sarà implementata la relativa UI.

Le segnalazioni occasionali restano possibili senza account.

## 6. Storie e interviste

Non creare una tabella `stories` autonoma nella v1.

Una storia/intervista è un `contents` con:

- `type_code` appropriato;
- autori;
- soggetti;
- geografie;
- rotta/e;
- settore/i quando pertinenti;
- media/URL video nel livello applicativo iniziale.

Un eventuale `story_metadata` verrà aggiunto solo quando emergono campi strutturati non rappresentabili correttamente dal modello esistente.

## 7. Rapporti

Nella prima iterazione un rapporto può essere rappresentato come `contents` di tipo `research_report` con fonte e link ufficiale.

Una tabella biblioteca dedicata verrà introdotta in Fase 9 solo se serve distinguere nettamente “pubblicazione catalogata” e “contenuto editoriale che la presenta”.

## 8. Tassonomie

Aggiungere in modo non distruttivo i nuovi `content_types` target.

Non rinominare codici già referenziati.

I tipi commerciali legacy senza referenze vengono disattivati per nuove scelte editoriali, non eliminati.

## 9. RLS

Regole:

- cataloghi geografici: lettura pubblica; scrittura solo redattore/admin;
- collegamenti contenuto/evento: lettura pubblica condizionata alla pubblicazione del padre; scrittura editoriale;
- Inbox: solo redattore/admin;
- submissions: solo redattore/admin;
- invio anonimo esclusivamente via RPC controllata;
- service role può alimentare il radar senza policy pubbliche aggiuntive.

## 10. Audit e preservazione

La migration deve essere:

- additiva;
- idempotente per i seed controllati;
- senza `DROP TABLE`;
- senza perdita dei 18 contenuti esistenti;
- senza cambiamenti alla semantica Auth attuale;
- senza FK verso PonteImprese.

Gate richiesti dopo apply:

- tabelle preesistenti e conteggi contenuti invariati;
- nuove tabelle presenti;
- RLS attivo sulle nuove tabelle;
- anon non legge Inbox/submissions;
- anon può creare solo una submission attraverso RPC;
- nessuna pubblicazione viene generata dall'RPC;
- 0 FK verso oggetti esterni al perimetro standalone.

`DATABASE_MODEL_V1 = READY_TO_IMPLEMENT`
