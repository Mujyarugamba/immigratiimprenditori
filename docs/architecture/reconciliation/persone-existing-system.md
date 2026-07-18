# Riconciliazione con lo stato tecnico reale — Dominio PERSONE

> Documento di analisi. Nessun file del progetto è stato modificato per produrlo. Nessuna migration è stata creata. Nessuno schema è stato alterato.
> Fondamenti (non modificati): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), [`docs/architecture/logical/persone.md`](../logical/persone.md).
> Perimetro: esclusivamente il dominio Persone (Persona, CompetenzaDichiarata, LinguaParlata, StoriaPersonale). Gli altri domini sono citati solo per individuare dipendenze e impatti, non riprogettati.
> Metodo: analisi diretta del contenuto dei file (migration, tipi, componenti, dati, configurazione), non dei soli nomi. Verifica dello stato reale delle migration tramite `supabase migration list` (comando di sola lettura, nessuna modifica al database).

---

## Stato remoto verificato

Prima di ogni valutazione, è stato verificato quali migration sono realmente applicate al progetto Supabase collegato:

| Migration | Applicata al database remoto |
|---|---|
| `20260718103949_create_profiles_table.sql` | **Sì** |
| `20260718112212_create_languages_table.sql` | **Sì** |
| `20260718113607_create_profile_languages_table.sql` | No — creata localmente, non applicata |
| `20260718190540_create_language_service_types_table.sql` | No |
| `20260718190638_create_language_service_specializations_table.sql` | No |
| `20260718190718_create_profile_language_services_table.sql` | No |
| `20260718190814_create_profile_language_service_specializations_table.sql` | No |
| `20260718192646_create_business_sectors_table.sql` | No |
| `20260718192647_create_training_course_types_table.sql` | No |
| `20260718192648_create_training_delivery_modes_and_venue_types_tables.sql` | No |
| `20260718192650_create_training_offers_table.sql` | No |
| `20260718192651_create_training_offer_languages_table.sql` | No |
| `20260718192652_create_training_offer_sectors_table.sql` | No |
| `20260718192653_create_training_offer_venue_types_table.sql` | No |
| `20260718192654_create_training_requests_table.sql` | No |
| `20260718192655_create_training_request_languages_table.sql` | No |
| `20260718192656_create_training_provider_qualifications_table.sql` | No |

**Questa distinzione è la premessa di tutto il documento.** Solo `profiles` e `languages` sono "migration storiche" nel senso vincolante richiesto (già applicate, da non modificare). Tutte le altre — incluso `profile_languages`, che è la più rilevante per il dominio Persone dopo `profiles` — sono ancora modificabili liberamente, perché non hanno mai toccato il database reale. Questo amplia significativamente lo spazio di manovra rispetto a un'ipotesi prudenziale che le trattasse tutte come immutabili.

---

## 1. Inventario tecnico esistente

| Elemento | Percorso | Funzione attuale | Concetto rappresentato | Dipendenze | Stato apparente |
|---|---|---|---|---|---|
| Tabella `profiles` | `supabase/migrations/20260718103949_create_profiles_table.sql` | Riga 1:1 con `auth.users`, dati identificativi/descrittivi, auto-provisioning alla registrazione | Fusione di Account + Persona + (parzialmente) Impresa/Organizzazione | `auth.users` (Supabase Auth) | **Applicata**, referenziata da 5 tabelle non applicate, non consumata da alcuna pagina/componente frontend |
| Funzione/trigger `handle_new_user` | stesso file | Crea automaticamente una riga `profiles` a ogni nuovo `auth.users` | Provisioning automatico dell'Account→Persona | `auth.users`, `profiles` | Applicata, attiva |
| Funzione/trigger `normalize_profile_slug` | stesso file | Normalizza lo slug inserito/aggiornato manualmente | Regola di qualità dell'identificativo pubblico | `profiles` | Applicata, attiva |
| Tabella `languages` | `supabase/migrations/20260718112212_create_languages_table.sql` | Catalogo di 30 lingue "business", governance centrale, sola lettura pubblica | VoceDiTassonomia — specializzazione Lingua | Nessuna | **Applicata**, utilizzata (per riferimento) da `profile_languages` (non applicata) |
| Tabella `profile_languages` | `supabase/migrations/20260718113607_create_profile_languages_table.sql` | Relazione Persona↔Lingua con livello, uso lavorativo, assistenza clienti | Analogo più vicino a LinguaParlata | `profiles`, `languages` | Creata, **non applicata**, non consumata dal frontend |
| Tabella `language_service_types` | `.../20260718190540_...sql` | Catalogo servizi linguistici (dominio Servizi, non Persone) | VoceDiTassonomia di dominio esterno | Nessuna | Creata, non applicata — fuori perimetro, solo dipendente da Persone |
| Tabella `language_service_specializations` | `.../20260718190638_...sql` | Catalogo specializzazioni tematiche (dominio Servizi) | VoceDiTassonomia di dominio esterno | Nessuna | Creata, non applicata — fuori perimetro |
| Tabella `profile_language_services` | `.../20260718190718_...sql` | OffertaLinguistica (dominio Servizi) | Entità di dominio esterno, dipendente da `profiles.id` | `profiles`, `language_service_types`, `languages` | Creata, non applicata — fuori perimetro, ma dipendenza rilevante (§7) |
| Tabella `profile_language_service_specializations` | `.../20260718190814_...sql` | Bridge Servizi↔specializzazioni | Entità di dominio esterno | `profile_language_services`, `language_service_specializations` | Creata, non applicata — fuori perimetro |
| Tabella `business_sectors` | `.../20260718192646_...sql` | Catalogo settori economici | VoceDiTassonomia — specializzazione Settore | Nessuna | Creata, non applicata — fuori perimetro (Tassonomia Condivisa) |
| Tabelle `training_*` (8 migration) | `.../20260718192647_...` → `.../20260718192656_...sql` | Modulo Formazione e sicurezza multilingue (dominio Servizi) | Entità di dominio esterno, alcune dipendenti da `profiles.id` | `profiles`, `business_sectors`, `languages` | Create, non applicate — fuori perimetro, dipendenza rilevante (§7) |
| `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` | `src/lib/supabase/` | Factory per client Supabase (browser/server, gestione cookie) | Infrastruttura di accesso ai dati, non un concetto di dominio | `@supabase/ssr` | Presente e correttamente configurato, ma **non importato da nessun altro file del progetto**: infrastruttura pronta ma inutilizzata |
| Assenza di `middleware.ts` | — | — | — | — | **Mancante**: un commento nel codice di `server.ts` presuppone un middleware di refresh sessione che non esiste nel repository |
| `src/types/home.ts` | `src/types/home.ts` | Tipi per i dati demo della Home (`StoryItem`, `EnterpriseItem`, ecc.) | Tipi presentazionali, nessuna relazione con Persona/CompetenzaDichiarata/LinguaParlata/StoriaPersonale | Nessuna verso il dominio Persone | Demo, dichiarato esplicitamente (`DemoMeta`/`isDemo`) |
| `src/data/home/stories.ts`, `StoryCard.tsx`, `StoriesSection.tsx` | `src/data/home/`, `src/components/home/` | Rendering della sezione "Storie" della Home con 3 storie statiche | Superficialmente simile a StoriaPersonale, ma senza autore, stato, o legame a una Persona reale | Nessuna verso `profiles` | Demo, disconnesso |
| `src/data/home/languages.ts`, `LanguagesSection.tsx` | idem | Link di navigazione statici ("Interpreti commerciali", "Traduttori", ecc.) | Etichette di categoria, non lingue del catalogo `languages` | Nessuna verso `languages` | Demo, disconnesso, terminologia di dominio Servizi (non Persone) |
| `src/data/home/professionals.ts`, `ProfessionalsSection.tsx` | idem | Link di navigazione statici per categorie professionali | Etichette di categoria, non profili reali | Nessuna verso `profiles` | Demo, disconnesso |
| `src/data/sections.ts`, `SectionPage.tsx`, `EmptyState.tsx` | `src/data/`, `src/components/sections/` | Meccanismo generico di pagina "in preparazione" per 11 sezioni (incluse `/professionisti`, `/pubblica`) | Nessun concetto di dominio: solo un placeholder onesto | Nessuna | Attivo, coerente con il Valore 6 della Costituzione (onestà sui dati), ma privo di qualsiasi form o query |
| `src/data/navigation.ts`, `Header.tsx` | idem | CTA "Accedi" verso `/accedi` e "Pubblica" verso `/pubblica` | Identità/Accesso (aspirazionale) | Nessuna pagina `/accedi` esiste | `/accedi` è un collegamento non risolto (nessuna pagina corrispondente); `/pubblica` esiste solo come placeholder |
| `package.json` | radice | Dipendenze del progetto | — | — | Confermano l'assenza di qualunque libreria di form, validazione o data-fetching oltre ai client Supabase di base |

**Sintesi.** Il dominio Persone, a livello di codice reale, esiste oggi solo come schema di database (parzialmente applicato, parzialmente solo disegnato) e non ha alcuna controparte funzionante nel frontend. Non ci sono form, non ci sono pagine di profilo, non c'è login funzionante, non c'è alcuna query che legga o scriva `profiles` o le tabelle collegate. Questo è un dato favorevole per l'evoluzione: qualunque cambiamento allo schema oggi non romperebbe alcuna funzionalità utente reale, perché non ne esiste ancora nessuna.

---

## 2. Mappatura modello approvato → sistema esistente

| Concetto del Logical Data Model | Cosa esiste | Dove | Corrispondenza | Differenze semantiche | Informazioni mancanti | Sovrapposizioni |
|---|---|---|---|---|---|---|
| **Persona** | Tabella `profiles` | `20260718103949_create_profiles_table.sql` | **Parziale** | `profiles` è contemporaneamente Account (1:1 `auth.users`), Persona (dati descrittivi) e, in parte, Impresa/Organizzazione (`organization_name`, `organization_type`, `role_description`) in un'unica riga | Nessun supporto per più Appartenenze; nessuna distinzione Persona/Impresa; nessuno stato esplicito "Registrata/Attiva/Sospesa/Cancellata" oltre al singolo booleano `is_active` | `organization_name`/`organization_type`/`role_description` — concettualmente dominio Impresa/Appartenenza, oggi colonne di `profiles` |
| **VoceDiTassonomia — Lingua** | Tabella `languages` | `20260718112212_create_languages_table.sql` | **Completa** (per il sotto-tipo Lingua) | Implementata come tabella dedicata, non come specializzazione di un concetto generico "VoceDiTassonomia" — scelta legittima e coerente con il resto del progetto (vedi §11, decisione 1) | Nessuna rilevante per l'uso da parte del dominio Persone | Nessuna |
| **VoceDiTassonomia — Competenza** | — | — | **Concetto assente** | — | Intero catalogo | — |
| **LinguaParlata** | Tabella `profile_languages` | `20260718113607_create_profile_languages_table.sql` (non applicata) | **Parziale**, ma vicina | Vocabolario del livello di padronanza in inglese e con etichette diverse (`native/fluent/professional/intermediate/basic` vs `madrelingua/fluente/intermedio/base`); "contesto d'uso" non esplicito ma approssimato da due booleani (`is_working_language`, `can_assist_clients`) più orientati al business che al concetto generale del modello logico | Nessuna informazione strutturale mancante di rilievo | Vincolo aggiuntivo non previsto nella Data Specification: almeno un segnale di utilizzo deve essere presente (`profile_languages_has_usage_check`) — non in conflitto, ma da valutare se mantenere |
| **CompetenzaDichiarata** | — | — | **Concetto assente** | — | Intera entità e il relativo catalogo Competenza | — |
| **StoriaPersonale** | — (a livello di database) | — | **Concetto assente** a livello reale | — | Intera entità con ciclo di vita | **Concetto duplicato/omonimo** a livello di facciata: `StoryItem`/`demoStories`/`StoryCard` nel frontend usano il nome "storia" ma rappresentano tutt'altro (testo statico, senza autore, senza persistenza, senza legame a una Persona) |
| **Appartenenza** (dominio esterno, citata per dipendenza) | — come entità propria | — | **Concetto assente**, simulato impropriamente | I campi `organization_name`/`organization_type`/`role_description` di `profiles` simulano un'unica Appartenenza fissa per account, senza periodo, senza storicizzazione, senza possibilità di più ruoli/imprese | Intera entità (periodo, ruolo abilitante, storicizzazione) | Si sovrappone esattamente ai campi di `profiles` citati sopra: **concetto presente ma collocato nel dominio sbagliato** |
| **Identità/Account** (`auth.users`, generico) | Gestito da Supabase Auth | Infrastruttura Supabase | **Completa** come account tecnico, ma fusa 1:1 e automaticamente con "Persona" | Il modello logico non prevede una fusione automatica e obbligatoria; oggi ogni account ha sempre esattamente una riga `profiles`, senza possibilità di un account "senza" Persona o di una Persona non ancora attivata in modo distinto | — | — |
| Sezione "Storie" e "Lingue e mercati" della Home (demo) | `src/data/home/*`, componenti collegati | `src/components/home/` | Non applicabile (fuori schema) | — | — | **Elemento tecnico esistente non più coerente**: se in futuro si collegherà la Home a dati reali, questi elementi andranno sostituiti integralmente, non evoluti, perché non hanno alcuna struttura riutilizzabile verso il modello approvato |

---

## 3. Analisi specifica di `profiles`

**Cosa rappresenta oggi, esattamente.** `profiles` è definita come "Public profile data for each auth.users account" (commento sulla tabella) ed è legata **1:1 e obbligatoriamente** a `auth.users` tramite `id` (chiave primaria e insieme chiave esterica verso `auth.users`, con `on delete cascade`). Un trigger (`handle_new_user`, `security definer`) crea automaticamente una riga `profiles` ad ogni nuova registrazione, derivando `display_name` e uno `slug` univoco. Non esiste alcun modo, nello schema attuale, di avere un account senza una riga `profiles` corrispondente, né di avere più righe `profiles` per lo stesso account.

**Rappresenta l'account?** In parte sì: l'identificatore (`id`) è condiviso con `auth.users` e la riga nasce automaticamente alla registrazione. Ma `profiles` non contiene dati di autenticazione (password, provider, token): quelli restano interamente nello schema `auth`, fuori da `public`. Quindi `profiles` non È l'account, ma è **indissolubilmente agganciata** a esso.

**Rappresenta la Persona?** Sì, per la maggior parte dei suoi campi: `display_name`, `slug`, `bio`, `role_description`, `city`, `province`, `region`, `country`, `website`, `phone`, `avatar_url` corrispondono, quasi attributo per attributo, a ciò che la Data Specification definisce per l'entità Persona (nome visualizzato, identificativo pubblico, biografia, ruolo professionale breve, localizzazione, contatti, immagine profilo).

**Rappresenta contemporaneamente Persona e Impresa?** Sì, ed è qui il punto architetturale più rilevante: `organization_name` e `organization_type` (con un vincolo `check` che ammette valori come `company`, `professional`, `association`, `institution`, `embassy`, `consulate`, `chamber_of_commerce`, `foundation`, `cooperative`, `public_body`, `other`, oppure `NULL`) permettono a una riga `profiles` di descriversi anche come un'organizzazione. Questo significa che, tecnicamente, oggi **un singolo account può essere "o" una persona "o" un'organizzazione**, ma non entrambe le cose distintamente, e soprattutto **non può avere più organizzazioni collegate**, né storicizzare ruoli diversi nel tempo. È l'esatto punto in cui il sistema attuale si allontana dal Logical Data Model, che invece prevede Persona, Impresa/OrganizzazioneIstituzionale e Appartenenza come tre concetti distinti.

**Quali campi appartengono realmente alla Persona (secondo il modello approvato).** `display_name`, `slug`, `bio`, `role_description` (con cautela: nel modello approvato è un attributo di Persona, "ruolo professionale breve", ma può risultare ambiguo quando la riga descrive un'organizzazione), `city`/`province`/`region`/`country`, `website`, `phone`, `avatar_url`, `is_active`.

**Quali appartengono ad altri domini.** `organization_name`, `organization_type` appartengono concettualmente al dominio Impresa/OrganizzazioneIstituzionale (nome, tipo di organizzazione). Non esiste oggi un campo che appartenga esplicitamente al dominio Appartenenza (ruolo, periodo): l'informazione di ruolo è oggi solo implicita e indistinta in `organization_type`/`role_description`.

**Quali moduli dipendono da `profiles`.** Direttamente, tramite chiave esterna verso `profiles.id`: `profile_languages`, `profile_language_services`, `training_offers` (`provider_profile_id`), `training_requests` (`requester_profile_id`), `training_provider_qualifications` (`profile_id`) — tutte non ancora applicate, tutte con `on delete cascade`. Indirettamente: tutte le policy RLS di queste tabelle, che verificano `p.is_active = true` su `profiles` per decidere la visibilità pubblica. Il trigger `handle_new_user` sullo schema `auth` scrive direttamente in `profiles`.

**Quali rischi comporterebbe modificarlo o sostituirlo.**
- *Sostituirlo* (creare una nuova tabella "persons" accanto a `profiles`) creerebbe immediatamente un secondo modello parallelo della Persona, esattamente ciò che questo documento deve evitare, e romperebbe le 5 chiavi esterne già disegnate senza alcun beneficio.
- *Modificarlo* in modo distruttivo (rimuovere colonne, cambiare il significato di `is_active` o di `id`) romperebbe silenziosamente tutte le RLS già scritte nelle migration non applicate, che le referenziano esplicitamente.
- *Estenderlo* con nuove colonne è invece a basso rischio, poiché nessuna migration esistente assume un insieme chiuso di colonne.
- *Separare* `organization_*` in un'altra tabella è concettualmente corretto secondo il modello approvato, ma **non è materia di questo documento** (è competenza di un futuro documento di riconciliazione per il dominio Imprese/Appartenenza) e comporta comunque un rischio nullo oggi, poiché non esiste alcun dato reale da migrare (il progetto non è ancora in uso).

**Conclusione di questa sezione.** `profiles` non deve essere eliminata né rinominata. È una base tecnica ragionevole che può **evolvere gradualmente** verso il concetto di Persona: la strada più coerente è mantenerla come "riga tecnica" della Persona (con eventuale, futura, migrazione dei soli campi `organization_*` verso il dominio Impresa, quando quel dominio verrà affrontato), estendendola con le tabelle figlie mancanti (CompetenzaDichiarata, StoriaPersonale) seguendo lo stesso pattern già usato con successo per `profile_languages`.

---

## 4. Identità e Persona

Nel sistema attuale sono presenti solo due dei quattro livelli concettuali distinti dal Logical Data Model:

| Livello concettuale | Esiste oggi? | Dove | Osservazioni |
|---|---|---|---|
| Account autenticato | Sì | `auth.users` (schema Supabase Auth, fuori da `public`) | Correttamente esterno allo schema applicativo; non modellato nei documenti di riferimento perché è infrastruttura generica (dominio Identità & Accessi) |
| Identità tecnica (legame Account↔Persona) | Sì, ma rigido | Relazione 1:1 obbligatoria `profiles.id = auth.users.id`, creata automaticamente dal trigger `handle_new_user` | Il legame è già correttamente disaccoppiato a livello di schema (due tabelle distinte in due schemi distinti), ma è "automatico e obbligatorio 1:1" senza eccezioni: non è possibile, oggi, avere un Account senza una Persona associata, né separare i due concetti nel tempo |
| Persona della piattaforma (identità professionale continuativa) | Parzialmente | `profiles`, mescolata con dati di organizzazione | Corrisponde bene per i campi puramente personali; la fusione con i dati di organizzazione è il problema principale |
| Profilo pubblico (la porzione visibile di Persona) | Implicito | Derivato dalle policy RLS di `profiles` (pubblico se `is_active = true`) | Non esiste come proiezione/vista distinta, ma il comportamento risultante (quali campi sono visibili a chi) è già ragionevolmente coerente con i livelli di visibilità del modello approvato |

**Cosa è già separato.** Lo strato di autenticazione (`auth.users`) è già correttamente esterno e disaccoppiato dallo schema applicativo: questa è una buona base, non un problema da risolvere.

**Cosa è oggi accorpato.** Il problema non è la separazione Account/Persona (già adeguata), ma la fusione Persona/Impresa all'interno della stessa riga `profiles`, e l'assenza di un vero concetto di Appartenenza che possa rendere quella fusione una relazione invece che un insieme di colonne.

**Decisioni che serviranno (non risolte in questo documento).**
- Se e quando introdurre formalmente l'aggregato Appartenenza (dominio esterno al perimetro di oggi).
- Se il futuro profilo pubblico debba restare implicito nelle RLS o diventare una proiezione esplicita, quando la superficie pubblica crescerà (es. con l'aggiunta di CompetenzaDichiarata e StoriaPersonale visibili pubblicamente).
- Se un Account debba poter esistere, in futuro, senza una Persona completamente attivata (oggi impossibile per costruzione).

---

## 5. Lingue e competenze

**Catalogo centrale delle lingue.** Esiste, applicato, corretto: `languages` (30 lingue, codice ISO 639-1, nome inglese, nome nativo, direzione di scrittura, stato attivo, ordine). Nessuna scrittura consentita a utenti normali (nessuna policy di insert/update/delete): coerente al 100% con il principio di governance centrale della Tassonomia Condivisa.

**Collegamenti tra Persona e lingua.** Esiste, non applicato: `profile_languages`, chiave composta (`profile_id`, `language_id`), quindi al massimo una dichiarazione per coppia Persona-Lingua — coerente con il vincolo logico "una Persona non può dichiarare due volte la stessa lingua".

**Livelli di conoscenza.** Presenti in `profile_languages.proficiency_level`, con vocabolario in inglese (`native`, `fluent`, `professional`, `intermediate`, `basic`), facoltativo. Il Logical Data Model usa un vocabolario descrittivo in italiano (madrelingua, fluente, intermedio, base) più uno "anni di esperienza"/"note" non presenti nello schema attuale.

**Servizi linguistici.** Esistono, non applicati, e sono correttamente **un altro dominio**: `profile_language_services` (OffertaLinguistica) dipende da `profiles.id` ma non fa parte del dominio Persone. Il commento nella migration lo dichiara esplicitamente ("profile_id is a generic reference to public.profiles... not only a single person"), confermando che chi ha scritto quella migration era già consapevole della distinzione concettuale.

**Direzioni linguistiche.** Presenti, ma solo nel dominio Servizi (`profile_language_services.direction`, `one_way`/`bidirectional`), non nel dominio Persone: coerente, perché nel modello approvato la "direzione" è un attributo di un servizio (OffertaLinguistica), non di una dichiarazione personale (LinguaParlata non ha direzione, una persona "parla" una lingua, non la "traduce in una direzione").

**Competenze dichiarate.** Assenti del tutto: nessuna tabella, nessun campo, nessun riferimento nel codice.

**Tassonomie già disponibili.** Solo `languages` (Lingua) e, fuori perimetro, `business_sectors` (Settore) e i cataloghi del dominio Servizi/Formazione. Nessuna tassonomia di Competenza, Tema, Professione o Territorio esiste ancora.

**Distinzione da mantenere chiara (già rispettata nello schema attuale, da preservare):**
- *Lingua come voce di tassonomia* → `languages` (catalogo, governance centrale).
- *LinguaParlata come dichiarazione della Persona* → `profile_languages` (relazione Persona↔Lingua con proprietà).
- *OffertaLinguistica come servizio di un altro dominio* → `profile_language_services` (dominio Servizi, fuori perimetro Persone).

Questa distinzione è già presente nel codice reale, correttamente, in tre tabelle separate: è uno dei punti di massimo allineamento tra modello approvato e sistema esistente.

---

## 6. StoriaPersonale

**Biografie/storie/testimonianze esistenti.** Due elementi, di natura completamente diversa, sono stati trovati:

1. `profiles.bio` (colonna testo libero, facoltativa) — una **breve biografia del profilo**, senza titolo, senza stato, senza processo di pubblicazione: è semplicemente un campo descrittivo come `role_description` o `city`. Corrisponde all'attributo "Biografia" della Persona già definito nella Data Specification, non a StoriaPersonale.
2. `src/data/home/stories.ts` (`demoStories`, tipo `StoryItem`) — un elenco statico di 3 elementi testuali (`title`, `sector`, `introduction`, `href`) usato per popolare la sezione "Storie" della Home tramite `StoryCard.tsx`/`StoriesSection.tsx`. Nessuno di questi elementi ha un autore, uno stato, una persistenza in database, o un legame con una Persona reale: sono **testo dimostrativo per il design della pagina**, esplicitamente marcato `isDemo: true`.

**Contenuti editoriali collegati alle persone.** Non esistono ancora: non c'è alcuna tabella `news`/`guides`/`stories` nello schema, né alcun componente che legga contenuti editoriali da un database.

**Campi testuali impropriamente utilizzati.** Non risultano abusi evidenti: `bio` è usato in modo coerente con il suo scopo dichiarato (breve descrizione), e non viene "forzato" a contenere un racconto strutturato.

**Chiarimento delle tre nozioni, per evitare confusione futura:**
- *Breve biografia del profilo* (`profiles.bio`) → un campo, non un'entità. Resta parte della scheda Persona anche dopo l'introduzione di StoriaPersonale: non sono in conflitto, hanno scopi diversi (presentazione sintetica vs racconto editoriale).
- *StoriaPersonale* (secondo il modello approvato) → un'entità con titolo, testo, stato (bozza/in revisione/pubblicata/aggiornata/archiviata), autore obbligatorio, tag trasversali. **Non esiste ancora nel sistema reale**, in nessuna forma tecnica.
- *Intervista o contenuto editoriale redazionale* → appartiene al dominio Contenuti Editoriali (Notizia/Guida), non al dominio Persone, e non esiste nemmeno quello nel sistema reale. Il materiale demo `demoStories` è, semanticamente, più vicino a questa terza categoria (testo curato per la Home, senza un vero autore-Persona) che a una vera StoriaPersonale — un'ulteriore ragione per non riutilizzarlo come base tecnica quando StoriaPersonale verrà introdotta.

---

## 7. Dipendenze esterne

| Origine | Destinazione | Motivo | Rischio di rottura | Compatibilità temporanea |
|---|---|---|---|---|
| `profile_language_services` (dominio Servizi, non applicata) | `profiles.id` | Il servizio linguistico ha sempre un titolare-profilo | Basso oggi (non applicata, nessun dato reale); diventerebbe alto solo dopo l'applicazione e l'uso reale | Alta, se l'evoluzione di Persona mantiene `id` come riferimento stabile (raccomandato, §9) |
| `training_offers.provider_profile_id` (dominio Formazione, non applicata) | `profiles.id` | Il fornitore di un corso è un profilo | Come sopra | Come sopra |
| `training_requests.requester_profile_id` (dominio Formazione, non applicata) | `profiles.id` | Il richiedente di una formazione è un profilo | Come sopra | Come sopra |
| `training_provider_qualifications.profile_id` (dominio Formazione, non applicata) | `profiles.id` | La qualifica dichiarata appartiene a un profilo | Come sopra | Come sopra |
| Trigger `handle_new_user` (schema `auth`, applicato) | `profiles` (insert di `id`, `display_name`, `slug`) | Provisioning automatico | **Alto**: qualunque evoluzione di `profiles` deve garantire che un insert con solo questi tre valori resti valido, oppure il trigger va aggiornato in modo sincrono | Alta se si aggiungono solo colonne facoltative (nessun impatto); nulla se si rendono obbligatorie nuove colonne senza aggiornare il trigger |
| Policy RLS di `profile_languages`, `profile_language_services`, `training_*` (non applicate) | `profiles.is_active` | Determinano la visibilità pubblica dei record collegati | Alto se il significato o la posizione di `is_active` cambia, perché è referenziato testualmente in almeno 6 policy già scritte | Alta se `is_active` resta un booleano con lo stesso significato |
| Nessuna (frontend) | `profiles` e tabelle collegate | — | **Nullo**: nessun componente, pagina o query del frontend legge o scrive oggi queste tabelle | Totale: qualunque evoluzione dello schema non impatta il frontend esistente |
| `loginCta` (`src/data/navigation.ts`) | `/accedi` (pagina inesistente) | Collegamento di navigazione aspirazionale | Nullo dal punto di vista dei dati; è un debito di prodotto, non tecnico | Non applicabile |

---

## 8. Gap analysis

**Elementi già conformi.**
- `languages` come catalogo Lingua a governance centrale: pienamente coerente con il modello approvato.
- Pattern RLS generale (pubblico solo se attivo; il proprietario legge/scrive solo il proprio; nessun insert/delete diretto su `profiles` da parte dell'utente): coerente con i permessi concettuali del Domain Model.
- Separazione già corretta tra Lingua (catalogo), LinguaParlata (dichiarazione) e OffertaLinguistica (servizio di altro dominio).
- Trigger di auto-provisioning e normalizzazione slug: meccanismo riutilizzabile e coerente con l'idea di identificativo pubblico stabile e univoco.
- Onestà dei contenuti demo (`isDemo: true`, pagine "in preparazione" senza dati inventati): coerente con il Valore 6 della Costituzione.

**Elementi riutilizzabili con adattamenti.**
- `profile_languages` → base solida per LinguaParlata; richiede solo armonizzazione terminologica (livelli, contesto d'uso), non una riprogettazione.
- Le colonne descrittive pubbliche di `profiles` (`display_name`, `slug`, `bio`, `role_description`, localizzazione, contatti, `avatar_url`) → già quasi identiche agli attributi di Persona della Data Specification.

**Elementi mancanti.**
- CompetenzaDichiarata e il relativo catalogo Competenza: assenti del tutto.
- StoriaPersonale: assente come entità reale con ciclo di vita.
- Appartenenza come entità propria (fuori perimetro Persone, ma la sua assenza è la causa tecnica della fusione Persona/Impresa in `profiles`).

**Elementi da deprecare (gradualmente, fuori dal perimetro di oggi).**
- I campi `organization_name`/`organization_type`/`role_description` su `profiles`, solo quando (in un futuro documento dedicato al dominio Imprese/Appartenenza) verrà introdotto un vero aggregato Impresa/Appartenenza. Non decidibile né avviabile qui.

**Debito tecnico.**
- Nessun `middleware.ts` per il refresh della sessione Supabase, nonostante un commento nel codice lo presupponga.
- Link di navigazione "Accedi" verso una route inesistente.
- Vocabolario disomogeneo tra i livelli di lingua nel database (inglese tecnico) e nei documenti di riferimento (italiano descrittivo) — da mappare in interfaccia, non necessariamente da cambiare nei valori memorizzati (vedi decisione 4, §11).

**Rischi.**
- Introdurre prematuramente una separazione Persona/Impresa senza pianificare la migrazione dei futuri dati reali di `organization_*` potrebbe creare una fase prolungata "a doppio binario". Oggi il rischio pratico è nullo (nessun dato reale esiste), ma la finestra si chiuderà non appena il progetto entrerà in uso.
- Creare una nuova tabella "persons" parallela a `profiles` (anche in buona fede, per "fare le cose bene da subito") ricreerebbe esattamente il problema che questo documento deve evitare.

**Decisioni ancora aperte.** Elencate in modo strutturato al §11.

---

## 9. Strategia di evoluzione raccomandata

**Principio guida.** `profiles` resta l'unica riga tecnica della Persona. Non si introduce alcuna tabella "persons"/"personas" parallela. Ogni nuovo concetto mancante (CompetenzaDichiarata, StoriaPersonale) viene aggiunto come **nuova tabella dipendente**, seguendo esattamente il pattern già validato da `profile_languages` (chiave verso `profiles.id`, RLS "pubblico se attivo / gestione solo del proprio", trigger `updated_at` dove serve).

**Cosa mantenere.** `profiles` come riga tecnica attuale (Account + Persona + i campi di organizzazione, per ora, senza modificarli); `languages`; `profile_languages` nella sua struttura portante.

**Cosa estendere.** `profile_languages`, solo nel vocabolario (livelli, contesto d'uso), senza cambiarne la forma; nessuna estensione di `profiles` con nuovi campi "Impresa" (per non aumentare il debito già identificato).

**Cosa introdurre (additivamente).**
- Un catalogo Competenza (nuova tabella, pattern identico a `languages`).
- Una tabella CompetenzaDichiarata (pattern identico a `profile_languages`).
- Una tabella StoriaPersonale, con proprio ciclo di vita, indipendente dal campo `bio` esistente (che resta invariato).

**Cosa rinviare.**
- La separazione strutturale Persona/Impresa (Appartenenza): dominio esterno, da trattare in un futuro documento di riconciliazione dedicato.
- Un catalogo Competenza troppo ampio al lancio: meglio iniziare minimale, come già fatto (dopo revisione) per i servizi linguistici.
- Qualunque collegamento StoriaPersonale→Impresa: il modello approvato lo prevede come attributo opzionale, ma senza un vero aggregato Appartenenza non esiste nulla a cui collegarlo in modo strutturato (vedi decisione 3, §11).
- La sostituzione dei contenuti demo del frontend: nessuna urgenza, sono chiaramente etichettati e non generano confusione nello stato attuale.

**Cosa deprecare gradualmente.** Nulla, nel dominio Persone, in modo imminente. Il debito `organization_*` su `profiles` è segnalato e "congelato" (si raccomanda di non estenderlo ulteriormente), ma la sua rimozione effettiva è compito di un futuro documento dedicato al dominio Imprese/Appartenenza, che dovrà anche definire come migrare eventuali dati reali già presenti a quel momento.

**Come garantire compatibilità con il codice esistente.** Mantenere `id` (uguale a `auth.users.id`) come riferimento stabile in ogni nuova tabella; non alterare il significato di `is_active`, già referenziato in tutte le RLS collegate; introdurre le nuove tabelle con policy coerenti con i pattern già stabiliti; non toccare in alcun modo `profiles` e `languages` (uniche migration storiche applicate).

**Come evitare un secondo modello parallelo della Persona.** Ogni evoluzione avviene *estendendo* `profiles` e le sue tabelle figlie, mai duplicandole. Nessuna nuova tabella deve avere l'ambizione di "diventare" la Persona in alternativa a `profiles`: deve sempre dipendere da essa.

---

## 10. Sequenza di implementazione proposta

**Passaggio 1 — Catalogo Competenza**
- *Obiettivo.* Introdurre il catalogo centrale delle competenze dichiarabili.
- *Elementi interessati.* Nuova tabella catalogo, sul modello di `languages`/`business_sectors`.
- *Prerequisiti.* Nessuno: pattern già validato due volte nel progetto.
- *Rischi.* Minimi: nessuna tabella esistente viene toccata.
- *Criterio di completamento.* Catalogo popolato con un elenco iniziale minimale, coerente con il pattern di governance centrale (sola lettura pubblica sui record attivi, nessuna scrittura utente).
- *Rollback concettuale.* Eliminare la tabella: nessun'altra struttura la referenzia ancora, impatto nullo.

**Passaggio 2 — CompetenzaDichiarata**
- *Obiettivo.* Colmare il gap principale del dominio Persone.
- *Elementi interessati.* Nuova tabella dipendente da `profiles` e dal catalogo Competenza, sul modello di `profile_languages`.
- *Prerequisiti.* Passaggio 1 completato.
- *Rischi.* Minimi: additivo puro, nessuna tabella esistente modificata.
- *Criterio di completamento.* La relazione Persona↔Competenza è rappresentabile con le proprietà previste (livello, anni di esperienza, note) e rispetta le regole di business del Logical Data Model (una sola dichiarazione per voce, per persona).
- *Rollback concettuale.* Eliminare la tabella: nessun'altra struttura dipende da essa.

**Passaggio 3 — Armonizzazione di `profile_languages`**
- *Obiettivo.* Eliminare la piccola divergenza terminologica rispetto al Logical Data Model, senza cambiare la struttura portante della tabella.
- *Elementi interessati.* Solo `profile_languages` (non applicata: nessun vincolo di migrazione storica).
- *Prerequisiti.* Nessuno.
- *Rischi.* Nullo: la migration non è mai stata applicata, può essere corretta liberamente.
- *Criterio di completamento.* Vocabolario coerente con quanto definito nella Data Specification (o mappatura esplicita e documentata, se si decide di mantenere il vocabolario tecnico in inglese — vedi decisione 4, §11).
- *Rollback concettuale.* Non necessario: si tratta di una correzione pre-applicazione.

**Passaggio 4 — StoriaPersonale**
- *Obiettivo.* Introdurre il contenuto narrativo personale con un proprio ciclo di vita.
- *Elementi interessati.* Nuova tabella dipendente da `profiles`, indipendente da `bio` (che resta invariato) e dai contenuti demo del frontend (che non vengono riutilizzati come base tecnica).
- *Prerequisiti.* Opportuno dopo i Passaggi 1-2, per coerenza di lavoro, ma non strettamente necessario.
- *Rischi.* Minimi, additivo puro; attenzione a mantenere il confine netto con i futuri Contenuti Editoriali redazionali (dominio esterno), da non introdurre in questo stesso passaggio.
- *Criterio di completamento.* Entità con ciclo di vita completo (bozza/in revisione/pubblicata/aggiornata/archiviata) e autore obbligatorio; il collegamento opzionale a un'Impresa **non** viene implementato in questo passaggio (vedi decisione 3, §11).
- *Rollback concettuale.* Eliminare la tabella: nessun'altra struttura dipende da essa.

**Passaggio 5 — Disciplina di non estensione (misura organizzativa, non tecnica)**
- *Obiettivo.* Evitare che il debito tecnico su `organization_*` in `profiles` cresca ulteriormente prima che il dominio Imprese/Appartenenza venga affrontato.
- *Elementi interessati.* Nessuno tecnicamente: è una linea guida di squadra ("nessun nuovo campo di tipo Impresa su `profiles`").
- *Prerequisiti.* Nessuno.
- *Rischi.* Nessuno.
- *Criterio di completamento.* Condivisione della linea guida con chi lavorerà sul progetto.
- *Rollback concettuale.* Non applicabile.

**Esplicitamente escluso da questa sequenza.** La separazione Persona/Impresa tramite un vero aggregato Appartenenza. Richiede un documento di riconciliazione dedicato al dominio Imprese, quando quel dominio verrà affrontato, e non viene avviata né preparata con modifiche tecniche in questa sede.

Ogni passaggio della sequenza è additivo: nessuno tocca `profiles` o `languages` (le due migration storiche applicate), e nessuno modifica le migration del dominio Servizi/Formazione già disegnate, che continueranno a referenziare `profiles.id` esattamente come oggi.

---

## 11. Decisioni richieste

| # | Decisione | Opzioni disponibili | Raccomandazione | Motivazione | Impatto | Urgenza |
|---|---|---|---|---|---|---|
| 1 | Forma del catalogo Competenza | (a) Tabella dedicata `competencies`, come `languages`/`business_sectors`; (b) Tabella generica `taxonomy_terms` con colonna categoria, condivisa tra Lingua/Competenza/Settore/Tema/Professione/Territorio | (a) Tabella dedicata | Coerenza con le 5 migration "catalogo" già scritte nel progetto reale (`languages`, `business_sectors`, `language_service_types`, `language_service_specializations`, `training_course_types`): sono tutte tabelle dedicate, mai una tabella generica. Introdurre ora l'astrazione generica romperebbe la coerenza interna già stabilita, anche se il Domain Model la ammette come possibilità teorica | Nessuno sulle tabelle esistenti; una nuova tabella indipendente | **Necessaria prima del Passaggio 1** |
| 2 | Ampiezza iniziale del catalogo Competenza | (a) Elenco minimale iniziale, ampliabile nel tempo; (b) Elenco ampio fin dal lancio | (a) Elenco minimale | Replica l'esito già raggiunto (dopo revisione esplicita) per i servizi linguistici: un catalogo troppo granulare è stato riconosciuto come errore da evitare | Solo quantitativo, nessun impatto strutturale | Necessaria prima del popolamento (Passaggio 1) |
| 3 | Collegamento StoriaPersonale↔Impresa prima che esista Appartenenza | (a) Nessun collegamento in questa fase; (b) Riferimento provvisorio non strutturato, da sostituire poi | (a) Nessun collegamento | Introdurre una struttura provvisoria creerebbe essa stessa nuovo debito tecnico da smontare in seguito; contraddice il vincolo esplicito di non introdurre cambiamenti prematuri nei domini esterni | La StoriaPersonale nasce senza il campo "impresa collegata" previsto dal Logical Data Model, da aggiungere quando Appartenenza esisterà | Da decidere prima del Passaggio 4, ma rinviabile nella sostanza (la risposta di default è "nessun collegamento") |
| 4 | Vocabolario dei livelli linguistici (inglese tecnico vs italiano descrittivo) | (a) Mantenere valori tecnici in inglese (coerente con tutte le enumerazioni già presenti nel progetto, es. `organization_type`, `direction`, `text_direction`) e tradurre solo in interfaccia; (b) Passare a valori in italiano | (a) Mantenere l'inglese | Coerenza con la convenzione già adottata in ogni migration esistente | Minimo | Rinviabile, ma da chiarire prima del Passaggio 3 |
| 5 | Quando e come introdurre l'aggregato Appartenenza e separare `organization_*` da `profiles` | — | — | — | — | **Appartiene al dominio Imprese/Appartenenza**, non decidibile in questo documento |
| 6 | Quando implementare pagine reali (login, modifica profilo) e collegare il frontend alle tabelle | — | — | — | — | **Appartiene alla fase di progettazione UX/frontend**, fuori dal perimetro architetturale di questo documento |

---

## Conclusione

Il sistema tecnico reale è, oggi, molto più semplice del previsto: due sole migration applicate (`profiles`, `languages`), un frontend interamente statico e onestamente etichettato come demo, e nessuna funzionalità utente reale che dipenda dal dominio Persone. Questo riduce drasticamente il rischio di qualunque evoluzione immediata, ma non elimina la necessità di procedere in modo disciplinato: `profiles` deve restare l'unica riga tecnica della Persona, le entità mancanti (CompetenzaDichiarata, StoriaPersonale) vanno introdotte per addizione seguendo il pattern già validato da `profile_languages`, e la separazione Persona/Impresa resta consapevolmente rinviata a un momento successivo, dedicato al dominio Imprese.

Nessun file è stato modificato per produrre questo documento. Nessuna migration è stata creata. Nessuna decisione elencata al §11 è stata presa automaticamente.
