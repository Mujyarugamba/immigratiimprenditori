# Physical Data Model — Dominio PERSONE

> Livello fisico (PostgreSQL/Supabase). Documento di progettazione: non crea migration, non modifica codice applicativo, non modifica alcun file esistente del repository.
> Fondamenti (non modificati): [`docs/costituzione-piattaforma.md`](../../costituzione-piattaforma.md), [`docs/domain-model.md`](../../domain-model.md), [`docs/platform-data-specification.md`](../../platform-data-specification.md), [`docs/architecture/logical/persone.md`](../logical/persone.md), [`docs/architecture/reconciliation/persone-existing-system.md`](../reconciliation/persone-existing-system.md).
> Ruolo di questo documento: essere l'anello successivo della catena di ingegnerizzazione — traduce il Logical Data Model del dominio Persone, riconciliato con lo stato tecnico reale, in una progettazione fisica PostgreSQL/Supabase completa, pronta per diventare la base diretta di un piano di migration additivo.

---

## 1. Scopo e confini

**Obiettivo.** Definire la struttura fisica completa (tabelle, colonne, tipi, vincoli, indici, RLS, trigger, funzioni) necessaria a implementare il dominio Persone così come approvato nel Logical Data Model, senza creare un secondo modello della Persona, senza toccare le migration già applicate e senza anticipare la progettazione di domini esterni.

**Entità comprese.** Le quattro entità del Logical Data Model:
1. **Persona**, implementata tramite `public.profiles` (esistente, applicata, estesa additivamente).
2. **LinguaParlata**, implementata tramite `public.profile_languages` (esistente, creata ma non applicata, corretta in questa sede).
3. **CompetenzaDichiarata**, implementata tramite una nuova tabella `public.profile_competencies`, appoggiata a un nuovo catalogo minimale `public.competencies`.
4. **StoriaPersonale**, implementata tramite una nuova tabella `public.personal_stories`.

**Entità escluse.** Impresa/OrganizzazioneIstituzionale, Appartenenza, Mercati Internazionali (PresenzaDiMercato), Opportunità, Servizi (OffertaDiServizio/RichiestaDiServizio, incluso OffertaLinguistica), Formazione e sicurezza sul lavoro, Eventi, Partnership, Contenuti Editoriali redazionali (Notizia/Guida), Osservatorio, Identità & Accessi (ruoli applicativi, autorizzazioni, staff). Questi domini sono citati **solo** per individuarne le dipendenze verso Persone (§8, §12), non vengono progettati.

**Decisioni già approvate, assunte come definitive (non rimesse in discussione).**

| # | Decisione |
|---|---|
| 1 | `auth.users` rappresenta l'identità di autenticazione. |
| 2 | `profiles` viene mantenuta e rappresenta fisicamente la Persona. |
| 3 | Non viene creata una seconda tabella `people`/`persons` o equivalente. |
| 4 | Il collegamento `profiles` ↔ `auth.users` resta 1:1 nell'attuale implementazione. |
| 5 | La registrazione non rende automaticamente pubblico il profilo. |
| 6 | I dati dell'impresa non appartengono a `profiles`. |
| 7 | I dati personali sono separati da impresa, appartenenze, servizi professionali, autorizzazioni, ruoli applicativi. |
| 8 | Le lingue parlate appartengono al dominio Persone. |
| 9 | I servizi erogabili in una lingua non appartengono al dominio Persone. |
| 10 | Le competenze dichiarate sono distinte da professioni, qualifiche, servizi e settori d'impresa. |
| 11 | La biografia breve è distinta dalla StoriaPersonale editoriale. |
| 12 | La progettazione è non distruttiva e compatibile con le migration già applicate. |
| 13 | Le migration locali mai applicate sono correggibili ora; quelle applicate no. |
| 14 | Nessuna progettazione fisica di altri domini, salvo indicarne le dipendenze. |

**Stato attuale del database remoto (verificato, non modificato in questa sede).** Solo due migration sono applicate al progetto Supabase collegato: `20260718103949_create_profiles_table.sql` (tabella `profiles`) e `20260718112212_create_languages_table.sql` (tabella `languages`). Tutte le altre migration esistenti nel repository — incluse `profile_languages`, l'intero dominio Servizi Linguistici e l'intero modulo Formazione — sono state create ma **non** applicate. Questa distinzione è la base di ogni raccomandazione del presente documento: ciò che è applicato viene esteso solo per addizione (nuove colonne, nuove policy accanto a quelle esistenti, mai `DROP`/`RENAME` distruttivi su ciò che già esiste); ciò che non è applicato (in particolare `profile_languages`) viene liberamente corretto, perché non comporta alcun rischio di perdita dati.

---

## 2. Principi di progettazione

1. **Evoluzione additiva.** Ogni nuova capacità si traduce in nuove colonne (nullable o con default sicuro) o nuove tabelle. Nessuna colonna esistente in `profiles` o `languages` (le due migration applicate) viene rimossa o rinominata in questa progettazione.
2. **Nessuna duplicazione del concetto Persona.** `profiles` resta l'unica riga tecnica della Persona. Nessuna nuova tabella "persons"/"people" viene introdotta; ogni nuova entità (LinguaParlata, CompetenzaDichiarata, StoriaPersonale) è strutturalmente **dipendente** da `profiles.id`, mai un suo sostituto o doppione.
3. **Separazione tra autenticazione e Persona.** `auth.users` resta l'unica fonte dei dati di accesso (credenziali, provider, sessioni). `profiles` non contiene e non conterrà mai colonne di autenticazione: l'unico punto di contatto resta la chiave condivisa `id`.
4. **Separazione Persona–Impresa.** Nessuna nuova colonna relativa a impresa, settore, organizzazione o ruolo aziendale viene introdotta in questa progettazione. I campi legacy già esistenti (`organization_name`, `organization_type`) non vengono toccati né estesi (§3.5).
5. **Privacy by default.** Ogni nuovo segnale di visibilità introdotto in questa progettazione parte da uno stato "non pubblico" per default. Nessuna riga diventa visibile pubblicamente per il solo fatto di esistere.
6. **Pubblicazione volontaria.** La visibilità pubblica di una Persona (e, per derivazione, delle sue LinguaParlata e CompetenzaDichiarata) è sempre il risultato di un'azione esplicita del titolare, mai un effetto collaterale della registrazione o dell'inserimento di un dato.
7. **Compatibilità con dati e riferimenti esistenti.** Ogni chiave (`profiles.id`, `languages.id`) mantiene lo stesso significato e la stessa stabilità già garantita oggi, poiché 5 tabelle disegnate nel dominio Servizi/Formazione la referenziano già (`docs/architecture/reconciliation/persone-existing-system.md`, §7).
8. **Evoluzione futura senza sovraprogettazione.** Dove un bisogno reale non è ancora dimostrato (tassonomia complessa delle competenze, ricerca testuale, verifica di terze parti, revisione editoriale con ruoli Staff), la progettazione lascia lo spazio per introdurlo in seguito, ma non lo implementa ora.

---

## 3. Tabella `profiles`

`profiles` (applicata) viene **mantenuta** ed **estesa additivamente**. Nessuna colonna esistente viene rimossa. Le modifiche descritte in questa sezione (nuove colonne, nuovo trigger, policy pubblica corretta) sono da realizzare, quando si passerà al piano di migration, tramite una **nuova migration successiva** che altera la tabella già applicata — non tramite la modifica del file `20260718103949_create_profiles_table.sql`, che resta intatto.

### 3.1 Dati tecnici

| Colonna | Tipo | Nullable | Default | Significato | Vincoli | Stato | Motivazione |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | No | — | Chiave primaria; identico a `auth.users.id` | PK; FK → `auth.users(id)` `on delete cascade` | Esistente, mantenuta | Identità tecnica stabile, già referenziata da 5 tabelle esterne (§8, §12) |
| `created_at` | `timestamptz` | No | `now()` | Data di creazione della riga | — | Esistente, mantenuta | Metadato standard richiesto dalla Data Specification |
| `updated_at` | `timestamptz` | No | `now()` | Data dell'ultima modifica | Aggiornata dal trigger esistente `profiles_set_updated_at` | Esistente, mantenuta | Metadato standard |
| `is_active` | `boolean` | No | `true` | Segnale di **moderazione/attivazione**: `false` = profilo sospeso (per scelta propria o dello Staff), reversibile | — | Esistente, **da reinterpretare** | Oggi è l'unico segnale usato anche per la visibilità pubblica; da qui in avanti governa solo la sospensione, non la pubblicazione (separata in `is_public`, sotto) |
| `is_public` | `boolean` | No | `false` | Segnale di **pubblicazione volontaria** e insieme atto di **consenso esplicito** della Persona a rendere visibile il proprio profilo | `constraint profiles_publication_requirements_check check (is_public = false or (deleted_at is null and is_active = true and length(trim(display_name)) > 0))` — vedi §3.3 per i requisiti minimi di pubblicazione | **Nuova** | Implementa la decisione 5: la riga nasce sempre con `is_public = false`; il passaggio a `true` è di per sé l'atto di consenso richiesto, e il vincolo garantisce che avvenga solo su un profilo non cancellato, attivo e con un'identità pubblica minima valida |
| `published_at` | `timestamptz` | Sì | `NULL` | Data della **prima** pubblicazione: valorizzata dal sistema, **mai azzerata in seguito** — nemmeno se il profilo torna privato (`is_public = false`) | Non aggiornabile dal client (nessun grant diretto); scritta esclusivamente dal trigger `protect_profile_lifecycle_fields` alla prima transizione di `is_public` da `false` a `true` | **Nuova** | Corrisponde all'attributo "Data di pubblicazione" implicito nel ciclo di vita della Persona; resta un metadato storico ("da quando è pubblico per la prima volta"), distinto dalla visibilità corrente, che può cambiare più volte senza intaccarlo |
| `deleted_at` | `timestamptz` | Sì | `NULL` | Cancellazione volontaria della Persona (soft-delete): la riga e le sue entità figlie restano nel database ma diventano invisibili pubblicamente e non più modificabili tramite le policy ordinarie | Ownership per la Persona in scrittura, monotono per il proprietario: nessuna policy né `grant` a `authenticated` consente di riportarlo a `NULL` (trigger `protect_profile_lifecycle_fields`, §11) | **Nuova** | Implementa lo stato terminale "Cancellata" del Logical Data Model senza eliminare fisicamente la riga né le sue entità figlie, preservando l'integrità referenziale delle 5 tabelle esterne dipendenti. Il dato non viene mai distrutto: un ripristino resta **tecnicamente possibile**, ma solo mediante una procedura amministrativa autorizzata, eseguita fuori dal percorso ordinario esposto agli utenti (dominio Identità & Accessi, non progettata qui) — non tramite le normali policy RLS o i `grant` per colonna |

**Ownership dei campi di ciclo di vita.** Ogni campo ha un solo responsabile logico, mai due contemporaneamente:

| Colonna | Titolarità |
|---|---|
| `is_public` | La **Persona proprietaria**: sceglie autonomamente di pubblicare o ritirare il proprio profilo (soggetto ai requisiti minimi del §3.3) |
| `is_active` | **Sistema/moderazione**: non è concessa in scrittura a `authenticated` (§10.1); il suo cambiamento è riservato a un futuro flusso di sospensione (Staff o automazione, dominio Identità & Accessi) |
| `deleted_at` | **Procedura controllata di cancellazione**: la Persona la avvia con un'azione propria, ma l'irreversibilità per il percorso ordinario è imposta dal sistema (trigger); un ripristino richiede una procedura amministrativa autorizzata distinta |
| `published_at` | **Sistema**: mai scritta direttamente da alcun ruolo, solo dal trigger alla prima pubblicazione |

**Nota sulla cascata da `auth.users`.** Il vincolo `id references auth.users(id) on delete cascade` resta quello già applicato e **non viene modificato**. Rappresenta un meccanismo di sicurezza riservato esclusivamente alla procedura separata di cancellazione definitiva dell'identità (§8, punto 2). La cancellazione **ordinaria** della Persona, quella che l'utente attiva dal proprio profilo, non deve mai comportare l'eliminazione diretta della riga `auth.users`, perché farebbe scattare questo `cascade` ed eliminerebbe fisicamente `profiles` e tutte le entità dipendenti: è implementata esclusivamente con `deleted_at` (soft, non distruttiva) — si veda l'analisi completa al §8.

### 3.2 Dati personali

| Colonna | Tipo | Nullable | Default | Significato | Vincoli | Stato | Motivazione |
|---|---|---|---|---|---|---|---|
| `display_name` | `text` | No | — | Nome con cui la Persona si presenta pubblicamente | Non vuoto (già implicito dal `not null`; si raccomanda in futuro un `check (length(trim(display_name)) > 0)`, non urgente) | Esistente, mantenuta | Corrisponde a "Nome visualizzato" della Data Specification |
| `slug` | `text` | No | — | Identificativo pubblico univoco | `unique`; `check` sul formato (già presente); normalizzato dal trigger esistente | Esistente, mantenuta | Corrisponde a "Identificativo pubblico" |
| `bio` | `text` | Sì | `NULL` | Breve biografia/presentazione | — | Esistente, mantenuta | Corrisponde a "Biografia"; resta **distinta** da StoriaPersonale (decisione 11, §6) |
| `role_description` | `text` | Sì | `NULL` | Qualifica sintetica personale (es. "consulente export") | — | Esistente, **ambigua, da reinterpretare** | Vedi nota sotto: mantenuta come attributo di Persona ("Ruolo professionale breve"), ma il suo uso storico è ambiguo rispetto a un ruolo *dentro* un'organizzazione |
| `city` / `province` / `region` | `text` | Sì | `NULL` | Localizzazione personale | — | Esistenti, mantenute | Corrispondono a "Localizzazione" |
| `country` | `text` | No | `'Italia'` | Paese di riferimento | — | Esistente, mantenuta | Idem |
| `website` / `phone` | `text` | Sì | `NULL` | Recapiti pubblicabili | — | Esistenti, mantenute | Corrispondono a "Contatti" (versione semplificata, senza visibilità per singolo canale — vedi limite dichiarato sotto) |
| `avatar_url` | `text` | Sì | `NULL` | Immagine profilo | — | Esistente, mantenuta | Corrisponde a "Immagine profilo" |

**Nota su `role_description`.** La Data Specification definisce "Ruolo professionale breve" come un attributo personale (es. "imprenditore nel settore edile"), non legato a una specifica organizzazione. Nell'uso storico della colonna non è possibile escludere che sia stata pensata anche per descrivere un ruolo *dentro* `organization_name`/`organization_type`. Si raccomanda di trattarla, da qui in avanti, esclusivamente come tagline personale della Persona (indipendente da qualsiasi impresa), e di **non** usarla per rappresentare un ruolo di Appartenenza: quando quel dominio verrà progettato, un eventuale "ruolo nell'impresa" sarà un attributo proprio dell'aggregato Appartenenza, non di questa colonna.

**Limite dichiarato su "Contatti".** La Data Specification prevede contatti multipli con visibilità scelta canale per canale (pubblico / utenti registrati). La struttura storica (`website`, `phone` come singole colonne su `profiles`) non implementava quella granularità.

**Addendum L1.1b (applicato).** È stata introdotta la tabella dipendente `person_contact_channels` (1:1 su `profiles.id`) con `phone`, `contact_email` e flag `share_*_with_network` (default false). Lettura rete via RPC mascherate; anon senza SELECT sulla tabella. `website` resta su `profiles` (superficie di presentazione pubblica). La colonna legacy `profiles.phone` è svuotata e vincolata a `NULL`. Dettaglio: `docs/architecture/legal/l1.1b-contact-visibility-model.md`.

**Attributi previsti dalla Data Specification e non implementati in questa fase.** "Lingua preferita d'interfaccia" (attributo di Persona secondo la Data Specification) non viene aggiunta come colonna in questa progettazione: nel repository non esiste oggi alcun sistema di internazionalizzazione dell'interfaccia che la consumerebbe (confermato in `persone-existing-system.md`, Inventario). Aggiungerla ora sarebbe introdurre un dato senza alcun lettore, in contrasto con il principio di non sovraprogettazione. È una colonna candidata a un'estensione futura, puramente additiva (`preferred_interface_locale text null`, senza FK verso `languages`, poiché quella tabella rappresenta lingue commerciali/professionali, non lingue di interfaccia — si veda il commento già presente su `public.languages`).

### 3.3 Visibilità e pubblicazione

**Scelta:** campi separati (`is_active`, `is_public`, `deleted_at`), non un `enum`/stato unico.

**Alternative valutate:**

| Opzione | Descrizione | Perché scartata / accettata |
|---|---|---|
| Stato unico (`status` testuale con `check`, es. `'draft' \| 'published' \| 'suspended' \| 'deleted'`) | Un solo campo rappresenta l'intero ciclo di vita | Scartata: replicherebbe fedelmente le 4 fasi del Logical Data Model, ma richiederebbe di ritirare la colonna `is_active` già applicata (o duplicarla), violando il principio di evoluzione additiva; inoltre mescolerebbe in un solo campo tre decisioni prese da attori diversi (la Persona sceglie la pubblicazione; la Persona o lo Staff decidono la sospensione; solo la Persona decide la cancellazione, in modo irreversibile) |
| `enum` nativo PostgreSQL (`create type profile_status as enum (...)`) | Come sopra, ma con un tipo dedicato | Scartata per lo stesso motivo, più un secondo problema: nessuna migration del progetto usa oggi un `enum` nativo (tutte le enumerazioni sono `text` + `check`, verificato su tutte le migration esistenti); introdurlo qui romperebbe la coerenza interna e sarebbe più rigido da evolvere (`ALTER TYPE ... ADD VALUE` ha vincoli transazionali) |
| Campi separati (`is_active`, `is_public`, `deleted_at`) | **Scelta adottata** | Ogni segnale ha un solo responsabile logico, è additivo rispetto allo schema applicato, ed è composto da tipi elementari (`boolean`, `timestamptz`) senza bisogno di manutenere un vocabolario di stati |

**Formula di visibilità pubblica risultante.** Un profilo è visibile pubblicamente se e solo se:

```
is_public = true AND is_active = true AND deleted_at IS NULL
```

Questa combinazione realizza l'attributo concettuale unico "Stato attivo" della Data Specification (che descrive l'*effetto* — "il profilo è visibile pubblicamente sì/no" — non l'implementazione) mantenendo distinti, a livello fisico, i tre eventi che lo determinano. `published_at` non entra nella formula: è un metadato storico ("da quando è pubblico per la prima volta"), non un gate di accesso.

**La riga non implica pubblicazione.** `handle_new_user` (trigger esistente, non modificato) inserisce solo `id`, `display_name`, `slug`: `is_public` assume il proprio default (`false`), quindi ogni nuovo profilo nasce privato, soddisfacendo direttamente la decisione 5.

**Requisiti minimi per la pubblicazione.** Impostare `is_public = true` richiede che siano contemporaneamente veri, al momento della scrittura:
1. il profilo non sia cancellato (`deleted_at is null`);
2. il profilo sia attivo (`is_active = true`);
3. esista un nome pubblico valido (`display_name` non vuoto — oggi l'unico attributo disponibile; se in futuro verranno introdotti `nome`/`cognome` distinti, il requisito si applicherà alla loro combinazione, non a `display_name`);
4. sia presente il consenso esplicito alla pubblicazione — che è l'atto stesso di impostare `is_public = true`, non un campo separato.

Questi quattro requisiti sono realizzati con un solo vincolo `check` sulla riga (`profiles_publication_requirements_check`, §3.1), non con un trigger: sono condizioni sulla sola riga corrente, non dipendono da un valore precedente, quindi un `check` è sufficiente e più trasparente. Deliberatamente **non** si richiede altro (bio, città, immagine, ecc.): un requisito minimo più ampio non è specificato da alcun documento approvato, e aggiungerlo ora sarebbe un requisito eccessivo per la prima versione.

**Effetto collaterale utile.** Lo stesso vincolo impedisce anche la combinazione inversa: non è possibile avere `is_active = false` mentre `is_public = true`. Se in futuro un'azione di moderazione imposterà `is_active = false` su un profilo pubblico, quella stessa scrittura dovrà impostare anche `is_public = false` — una coerenza che il database garantisce già da ora, prima ancora che esista un vero flusso di moderazione.

### 3.4 Campi impropri o legacy

| Colonna | Perché non appartiene a Persona | Come mantenerla ora | Verso quale dominio futuro | Utilizzabile da nuove funzionalità? |
|---|---|---|---|---|
| `organization_name` | Nome di un soggetto economico: appartiene concettualmente a Impresa/OrganizzazioneIstituzionale | Non toccata, resta leggibile e scrivibile come oggi | Impresa/OrganizzazioneIstituzionale (dominio esterno, non progettato ora) | **No.** Nessuna nuova tabella o policy di questa progettazione (LinguaParlata, CompetenzaDichiarata, StoriaPersonale) legge o referenzia questa colonna |
| `organization_type` | Tipologia di organizzazione (azienda, associazione, ente, ecc.): stesso motivo di sopra | Idem | Idem | **No**, stesso motivo |

**Nota.** Non viene proposta né la rimozione né la migrazione di questi due campi in questa sede: è una decisione che appartiene a un futuro documento di riconciliazione/progettazione fisica dedicato al dominio Imprese/Appartenenza, quando quel dominio verrà affrontato. Coerentemente con il principio "nessun nuovo campo di tipo Impresa su `profiles`" (già raccomandato in `persone-existing-system.md`, §9), questa progettazione **non aggiunge** ulteriori colonne di questa natura.

**Verifica positiva.** `profiles` non contiene, e non ha mai contenuto in questa fase del progetto, alcuna colonna di ruolo applicativo o autorizzazione (nessun campo `role`/`permission`): la separazione richiesta dalla decisione 7 rispetto ad "autorizzazioni" e "ruoli applicativi" è già rispettata dallo stato attuale e non richiede alcun intervento.

### 3.5 Riepilogo colonne (stato)

| Colonna | Stato |
|---|---|
| `id`, `created_at`, `updated_at`, `display_name`, `slug`, `bio`, `city`, `province`, `region`, `country`, `website`, `phone`, `avatar_url` | Esistenti, mantenute invariate |
| `is_active` | Esistente, da reinterpretare (solo moderazione, non più visibilità) |
| `role_description` | Esistente, ambigua — da reinterpretare come tagline personale |
| `organization_name`, `organization_type` | Esistenti, legacy — mantenute, congelate, non usate da nuove funzionalità |
| `is_public`, `published_at`, `deleted_at` | Nuove |
| `preferred_interface_locale` | Candidata futura, non implementata ora |

---

## 4. Tabella delle lingue parlate — `profile_languages`

**Denominazione.** Mantenuta: `public.profile_languages`. Non è indispensabile rinominarla — rappresenta già, nel nome, esattamente la relazione "una Persona dichiara di conoscere/utilizzare una lingua"; una nuova denominazione non aggiungerebbe chiarezza e romperebbe la continuità con il file di migration già scritto (anche se non applicato).

**Correzioni rispetto alla versione attualmente disegnata (consentite: migration non applicata, regola 13).** Vengono rimosse `is_working_language`, `can_assist_clients` e `notes`: nessuna delle tre è un attributo previsto dalla Data Specification per LinguaParlata (che ne definisce solo tre: lingua di riferimento, contesto d'uso, livello dichiarato). `is_working_language`/`can_assist_clients` erano un'approssimazione orientata al dominio Servizi, non al concetto generale di "una Persona che dichiara di usare una lingua"; la loro rimozione elimina anche il vincolo `profile_languages_has_usage_check`, che diventa privo di oggetto.

| Colonna | Tipo | Nullable | Default | Significato | Vincoli | Stato | Motivazione |
|---|---|---|---|---|---|---|---|
| `profile_id` | `uuid` | No | — | La Persona che dichiara la lingua | FK → `profiles(id)` `on delete cascade`; PK (composta) | Esistente, mantenuta | — |
| `language_id` | `bigint` | No | — | La lingua dichiarata | FK → `languages(id)` `on delete restrict`; PK (composta) | Esistente, mantenuta | Il catalogo non può mai perdere una lingua referenziata: si disattiva (`is_active = false`), non si elimina |
| `usage_context` | `text` | No | `'both'` | Contesto d'uso della lingua | `check (usage_context in ('personal', 'professional', 'both'))` | **Nuova** (sostituisce `is_working_language`/`can_assist_clients`) | Corrisponde esattamente a "Contesto d'uso: personale, professionale, entrambi" della Data Specification. Descrive **soltanto** in quale ambito la Persona utilizza la lingua: non è un indicatore di capacità commerciale e non implica in alcun modo la disponibilità a offrire servizi professionali in quella lingua (vedi nota di confine sotto) |
| `proficiency_level` | `text` | Sì | `NULL` | Livello di padronanza dichiarato | `check (proficiency_level is null or proficiency_level in ('native', 'fluent', 'intermediate', 'basic'))` | Esistente, **corretta** (rimosso il valore `'professional'`, non previsto dalla Data Specification) | Vedi §7 per la scelta del vocabolario |
| `is_primary` | `boolean` | No | `false` | Indica se questa è la lingua principale dichiarata dalla Persona | Al massimo una per Persona, garantito da un indice univoco parziale (§9.1), non da un `check` di riga | **Nuova** | Risolve il requisito "al massimo una lingua principale per Persona" (vedi paragrafo dedicato sotto) |
| `created_at` / `updated_at` | `timestamptz` | No | `now()` | Metadati standard | Trigger esistente di aggiornamento | Esistenti, mantenute | — |

**Livelli linguistici: sistema scelto e motivazione.**

| Opzione valutata | Perché scartata / accettata |
|---|---|
| Livelli CEFR (A1–C2) | Scartata per la prima versione: troppo formale per un'autodichiarazione su una piattaforma di impresa; la Data Specification riserva esplicitamente le certificazioni formali (CEFR o equivalenti, con ente e scadenza) a un'estensione futura di LinguaParlata, non alla dichiarazione base |
| Categorie semplificate (adottata) | Coerenti con l'attributo "Livello dichiarato: madrelingua, fluente, intermedio, base" già approvato; 4 valori stabili, facilmente comprensibili da un utente non specialista |
| `enum` nativo PostgreSQL | Scartato per coerenza con il resto del progetto (nessuna migration usa `create type ... as enum`) e per mantenere l'evoluzione del vocabolario semplice (basta correggere un `check`, non alterare un tipo) |
| Tabella catalogo per i livelli | Scartata: 4 valori stabili e trasversali non giustificano una tabella con relativa gestione RLS/indici; sarebbe complessità senza beneficio reale |
| `check constraint` su `text` (adottata) | **Scelta finale**, per i motivi sopra |

I valori sono memorizzati in inglese tecnico (`native`/`fluent`/`intermediate`/`basic`) e tradotti solo in interfaccia, per coerenza con tutte le altre enumerazioni già presenti nel progetto (`organization_type`, `direction`, `text_direction` sono tutte in inglese). Questo risolve, per il dominio Persone, la decisione lasciata aperta al punto 4 della riconciliazione.

**Unicità Persona–Lingua.** Garantita dalla chiave primaria composta `(profile_id, language_id)`: non è possibile dichiarare due volte la stessa lingua, esattamente come richiesto dalla validazione funzionale della Data Specification. Nessun vincolo aggiuntivo necessario.

**Visibilità.** Non è prevista una colonna di visibilità propria: la riga eredita interamente la visibilità del profilo (pubblica se e solo se il profilo è pubblico, secondo la formula del §3.3). Aggiungere una visibilità indipendente per singola lingua non risponde a nessun requisito approvato ed è stata valutata e scartata per non sovraprogettare.

**"Lingua principale".** Implementata con la nuova colonna `is_primary` (sopra), vincolata da un **indice univoco parziale**:

```
create unique index profile_languages_single_primary_idx
  on public.profile_languages (profile_id)
  where is_primary = true;
```

Questo garantisce a livello di database che una Persona non possa avere più di una lingua principale, senza bisogno di una colonna aggiuntiva su `profiles` né di una tabella dedicata: un indice univoco parziale (o soluzione equivalente) è lo strumento corretto perché la regola "al massimo una riga con questa proprietà per gruppo" coinvolge più righe della stessa tabella, cosa che un semplice `check` per riga non può esprimere. Per evitare che l'utente debba "spegnere" manualmente la lingua principale precedente prima di poterne impostare una nuova (rischiando altrimenti una violazione dell'indice), un trigger leggero (`enforce_single_primary_language`, §11) azzera automaticamente `is_primary` sulle altre righe della stessa Persona quando una riga viene marcata come principale. Nessuna lingua è obbligatoriamente principale: il default `false` per tutte è uno stato legittimo (nessuna lingua principale dichiarata).

**Verifica di terze parti.** Non implementata: la Data Specification la riserva a un'estensione futura (certificazioni con ente). Nessuna colonna di stato di verifica viene introdotta ora.

**Confine con il dominio Servizi.** `public.profile_language_services` (dominio Servizi, non applicata) **non** rappresenta LinguaParlata: rappresenta un servizio commerciale (OffertaLinguistica) offerto da un profilo, con una propria direzione, un proprio tipo di servizio e proprie specializzazioni. Le due tabelle restano concettualmente e fisicamente distinte; questa progettazione non le unifica né le fa dipendere l'una dall'altra. In particolare, `usage_context = 'professional'` significa solo che la Persona utilizza la lingua nella propria attività (es. per leggere contratti, comunicare con fornitori esteri), non che offra un servizio linguistico a pagamento: quella disponibilità, se esiste, va dichiarata esclusivamente in `profile_language_services`, mai dedotta da `usage_context`.

---

## 5. Tabella delle competenze dichiarate

### 5.1 Alternative valutate

**Alternativa A — competenza testuale dichiarata.** La Persona inserisce direttamente il nome della competenza in un campo di testo libero.

- *Vantaggi.* Nessuna tabella catalogo da governare; implementazione immediata; nessuna limitazione sui termini che l'utente può usare.
- *Svantaggi.* Frammenta la ricerca (es. "web design", "progettazione siti", "sviluppo web" diventano tre valori distinti e non collegabili); non è compatibile con la Data Specification già approvata, che lega esplicitamente CompetenzaDichiarata a una "VoceDiTassonomia di tipo Competenza" (non a un valore libero); rende impossibile un filtro di ricerca affidabile per competenza, esplicitamente richiesto dalla Data Specification.

**Alternativa B — catalogo competenze più relazione.** Una tabella catalogo (`public.competencies`) contiene voci normalizzate; la Persona seleziona una voce esistente.

- *Vantaggi.* Coerente con la Data Specification già approvata; ricerca e filtro affidabili; stesso pattern già validato per `languages` e per gli altri catalughi del progetto (`business_sectors`, `language_service_types`, `language_service_specializations`, `training_course_types`), nessuno dei quali è mai stato realizzato come testo libero; governance centrale (la piattaforma controlla qualità e non duplicazione del vocabolario).
- *Svantaggi.* Richiede una nuova tabella catalogo da popolare e mantenere; una competenza realmente necessaria ma non ancora presente nel catalogo non può essere dichiarata finché non viene aggiunta (mitigabile con un processo leggero di richiesta/aggiunta, fuori dallo scope di questo documento).

**Scelta consigliata per la prima versione: Alternativa B**, con un catalogo **deliberatamente minimale** (indicativamente 15–25 voci ad ampio spettro, es. "Export e internazionalizzazione", "Digital marketing", "E-commerce", "Gestione finanziaria", "Contrattualistica", "Comunicazione interculturale" — l'elenco esatto è materia della futura migration, non di questo documento), evitando la tassonomia completa e granulare che è già stata riconosciuta come un errore da non ripetere (vedi la revisione dei servizi linguistici in una fase precedente del progetto).

### 5.2 Catalogo `public.competencies` (nuovo)

| Colonna | Tipo | Nullable | Default | Vincoli |
|---|---|---|---|---|
| `id` | `bigint generated always as identity` | No | — | PK |
| `slug` | `text` | No | — | `unique` |
| `name` | `text` | No | — | — |
| `description` | `text` | Sì | `NULL` | — |
| `is_active` | `boolean` | No | `true` | — |
| `sort_order` | `integer` | No | `100` | — |
| `created_at` / `updated_at` | `timestamptz` | No | `now()` | — |

Stesso pattern di governance centrale già validato per `languages`/`business_sectors`: nessuna scrittura utente, sola lettura pubblica sui record attivi.

### 5.3 Tabella `public.profile_competencies` (nuova)

| Colonna | Tipo | Nullable | Default | Significato | Vincoli |
|---|---|---|---|---|---|
| `profile_id` | `uuid` | No | — | La Persona che dichiara la competenza | FK → `profiles(id)` `on delete cascade`; PK (composta) |
| `competency_id` | `bigint` | No | — | La competenza dichiarata | FK → `competencies(id)` `on delete restrict`; PK (composta) |
| `proficiency_level` | `text` | Sì | `NULL` | Livello dichiarato | `check (proficiency_level is null or proficiency_level in ('basic', 'intermediate', 'advanced', 'expert'))` |
| `years_of_experience` | `smallint` | Sì | `NULL` | Anni di esperienza dichiarati | `check (years_of_experience is null or years_of_experience between 0 and 80)` |
| `notes` | `text` | Sì | `NULL` | Dettaglio libero | — |
| `created_at` / `updated_at` | `timestamptz` | No | `now()` | Metadati standard | Trigger di aggiornamento, stesso pattern di `profile_languages` |

**Perché non si confonde con altri concetti.** Nessuna colonna di questa tabella referenzia o assume una professione, un titolo di studio, un'abilitazione, un servizio offerto o un settore economico: l'unico riferimento esterno è alla voce di catalogo Competenza, per costruzione priva di questi significati (il catalogo contiene solo aree di competenza, non titoli né servizi).

**Livelli dichiarati.** Quattro valori (`base/intermedio/avanzato/esperto` nella Data Specification, memorizzati come `basic/intermediate/advanced/expert` per coerenza con la convenzione inglese già adottata nel progetto — stessa motivazione del §4). Deliberatamente **diversi** dai livelli di LinguaParlata (`native/fluent/intermediate/basic`): sono due scale concettualmente distinte (padronanza di una lingua vs. padronanza di una competenza) e la Data Specification le definisce con vocabolari differenti; unificarle in un'unica scala condivisa creerebbe una falsa equivalenza.

**Unicità/prevenzione duplicati.** Garantita dalla chiave primaria composta `(profile_id, competency_id)`: una Persona non può dichiarare due volte la stessa competenza.

**Visibilità e ordinamento.** Come per LinguaParlata: nessuna colonna di visibilità propria (eredita quella del profilo); l'ordinamento "per livello o per data di dichiarazione" richiesto dalla Data Specification è soddisfatto lato query (`order by proficiency_level`/`order by created_at`), senza bisogno di una colonna `sort_order` dedicata per la prima versione.

---

## 6. Tabella `personal_stories`

**Denominazione.** `public.personal_stories`, coerente con la convenzione in inglese di tutte le tabelle esistenti (`profiles`, `languages`, `training_offers`, ecc.).

**Confini espliciti.**
- `bio` (su `profiles`) resta la presentazione breve e statica della Persona: non viene toccata, non viene unificata con questa tabella.
- Una StoriaImpresa (racconto della crescita di un'impresa, non di una persona) **non** appartiene a questa tabella: se in futuro verrà introdotta, sarà un'entità del dominio Imprese, eventualmente collegata a una o più Persone tramite Appartenenza, non l'inverso.
- Non si progetta un CMS generale: questa tabella copre esclusivamente il racconto autobiografico in prima persona, con il minimo di struttura richiesto dalla Data Specification.
- Una storia pubblicata può richiedere revisione editoriale: il vocabolario degli stati la prevede (`in_review`), ma l'**approvazione** con ruoli Staff non viene progettata qui (dipendenza esterna, §12).
- Le **modifiche** a una storia già pubblicata sono già rappresentate da `updated_at`: non esiste uno stato `updated` distinto da `published`. Un'eventuale gestione differenziata delle revisioni editoriali (es. tracciare ogni versione pubblicata, richiedere una nuova approvazione dopo una modifica sostanziale) resta un'**estensione futura**, non necessaria alla prima versione.

### 6.1 Struttura

| Colonna | Tipo | Nullable | Default | Significato | Vincoli |
|---|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Identificativo tecnico | PK |
| `profile_id` | `uuid` | No | — | Autore e protagonista del racconto | FK → `profiles(id)` `on delete cascade` |
| `slug` | `text` | No | — | Identificativo pubblico dell'URL della storia | `unique`; `check` sul formato (stesso pattern di `profiles.slug`) |
| `title` | `text` | No | — | Titolo | `check (length(trim(title)) > 0)` |
| `summary` | `text` | Sì | `NULL` | Estratto breve per gli elenchi | — |
| `content` | `text` | No | — | Testo narrativo completo | `check (length(trim(content)) > 0)` |
| `cover_image_url` | `text` | Sì | `NULL` | Immagine di copertina | — |
| `status` | `text` | No | `'draft'` | Stato editoriale | `check (status in ('draft', 'in_review', 'published', 'archived'))` |
| `rejection_reason` | `text` | Sì | `NULL` | Motivazione di un eventuale rifiuto in revisione | — |
| `published_at` | `timestamptz` | Sì | `NULL` | Data della prima pubblicazione, mai azzerata in seguito (anche se la storia viene poi archiviata) | Non aggiornabile dal client; scritta dal trigger `handle_personal_story_publication` |
| `created_at` / `updated_at` | `timestamptz` | No | `now()` | Metadati standard | Trigger di aggiornamento |
| `deleted_at` | `timestamptz` | Sì | `NULL` | Eliminazione volontaria (soft-delete), irreversibile | Monotono (trigger, §11) |

**Perché una `check` invece di un trigger per "impedire la pubblicazione incompleta".** `title` e `content` sono sempre obbligatori e sempre non vuoti (anche in bozza): la Data Specification richiede "titolo e testo non vuoti per poter essere pubblicata", ma è più semplice e trasparente imporlo sempre (un `check` sulla riga) piuttosto che condizionarlo allo stato con un trigger dedicato — nessuna bozza reale ha bisogno di essere salvata con un titolo vuoto.

**Visibilità delle storie archiviate.** Una storia in stato `archived` **non è pubblicamente visibile**: la sua visibilità pubblica è equivalente a quella di una bozza, riservata al solo autore (§10.4). L'archiviazione rappresenta quindi un ritiro effettivo dalla consultazione pubblica, non una semplice esclusione dagli elenchi "in evidenza" con permalink ancora attivo — quest'ultima interpretazione, valutata in una versione precedente di questo documento, è stata scartata (§14) perché nessun documento approvato la richiede e per evitare una condizione di visibilità pubblica differenziata per stato non necessaria alla prima versione.

**Metadati aggiuntivi rispetto allo standard.** `rejection_reason`, come richiesto esplicitamente dalla Data Specification per questa entità.

**Impresa collegata: intenzionalmente assente.** La Data Specification prevede un attributo opzionale "Impresa collegata". Questa progettazione **non** lo implementa: farlo richiederebbe una chiave esterna verso un'entità Impresa che non esiste ancora come aggregato proprio (oggi esisterebbe solo, impropriamente, come `organization_name`/`organization_type` su `profiles` di un altro profilo). Aggiungere ora un riferimento provvisorio creerebbe una struttura da smontare in seguito — esattamente il tipo di debito tecnico che la decisione 14 e il principio di non sovraprogettazione impongono di evitare. La colonna (nullable, quindi additiva) sarà introdotta quando il dominio Appartenenza esisterà.

**Autore: limite noto, non risolvibile in questa sede.** `profile_id` referenzia `profiles.id` senza distinguere se quella riga rappresenta oggi una Persona "pura" o un profilo con `organization_type` non nullo (cioè una riga che, nell'attuale fusione Persona/Impresa, si comporta come un'organizzazione). Poiché quella distinzione non esiste ancora a livello di schema (`persone-existing-system.md`, §3), questa tabella non può imporla con un vincolo. È un limite ereditato, non introdotto da questa progettazione.

---

## 7. Tipi, enum e vincoli

Nessun `enum` nativo PostgreSQL viene introdotto: **nessuna migration del progetto ne usa già uno** (verificato su tutte le migration esistenti), e ogni enumerazione qui proposta segue la stessa convenzione già in uso, `text` + `check constraint`. Motivazione trasversale: un `check` si corregge con un semplice `alter table ... drop constraint / add constraint`, mentre un `enum` nativo richiede `ALTER TYPE ... ADD VALUE` (irreversibile per la rimozione di valori, con vincoli transazionali in alcune versioni di PostgreSQL) — meno adatto a un dominio che, per sua natura, evolverà.

| Campo | Valori | Significato | Evoluzione | Alternativa valutata |
|---|---|---|---|---|
| `profiles.is_active` (esistente) | `true` / `false` | Sospeso/non sospeso (moderazione) | Nessuna evoluzione prevista: è un semplice interruttore | — |
| `profiles.is_public` (nuovo) | `true` / `false` | Pubblicato/non pubblicato per scelta della Persona | Nessuna evoluzione prevista | Si è valutato e scartato un `status` unico (§3.3) |
| `profile_languages.usage_context` | `personal` / `professional` / `both` | Contesto d'uso della lingua | Può accogliere nuovi contesti con una modifica al `check`, se mai necessario | Si è valutato e scartato un `enum` nativo |
| `profile_languages.proficiency_level` | `native` / `fluent` / `intermediate` / `basic` | Livello linguistico | Estendibile a livelli CEFR come attributo aggiuntivo futuro (non sostitutivo) | CEFR, tabella catalogo, `enum` nativo (tutti scartati, §4) |
| `profile_competencies.proficiency_level` | `basic` / `intermediate` / `advanced` / `expert` | Livello di competenza | Come sopra | Come sopra |
| `personal_stories.status` | `draft` / `in_review` / `published` / `archived` | Stato editoriale | Un futuro stato aggiuntivo (es. `rejected` esplicito, oggi implicito tramite ritorno a `draft` + `rejection_reason`; oppure una vera gestione delle revisioni editoriali, distinta da una semplice modifica tracciata da `updated_at`) si aggiunge con una modifica al `check` | Si è valutato uno `status` più granulare con stati distinti per "rifiutata" e per "aggiornata dopo la pubblicazione" (`updated`); entrambi scartati per la prima versione: `rejection_reason` non `NULL` unito a `status = 'draft'` rappresenta già un rifiuto, e `updated_at` rappresenta già ogni modifica — incluse quelle successive alla pubblicazione — senza bisogno di un quinto stato |

**Attenzione particolare agli stati richiesti dall'incarico.**
- *Stato del profilo* → `is_active` + `is_public` + `deleted_at` (§3.3), non un `enum`.
- *Stato di verifica* → non implementato in questa fase per nessuna entità (né LinguaParlata né CompetenzaDichiarata): la Data Specification lo riserva a estensioni future.
- *Visibilità* → mai una colonna propria per le entità figlie (LinguaParlata, CompetenzaDichiarata): sempre derivata dal profilo. Per StoriaPersonale, la visibilità è derivata da `status` + `deleted_at` + visibilità del profilo autore, non da una colonna aggiuntiva.
- *Pubblicazione* → `is_public`/`published_at` per il profilo; `status`/`published_at` per la storia. Due meccanismi paralleli ma non identici, perché rispondono a esigenze diverse (un profilo è "on/off"; una storia ha un vero flusso editoriale a più fasi). La pubblicazione del profilo è inoltre condizionata a requisiti minimi verificati da un `check` (§3.3): profilo non cancellato, attivo, con nome pubblico valido; l'atto stesso di impostare `is_public = true` costituisce il consenso esplicito richiesto.
- *Competenza* → `proficiency_level` con 4 valori, `text` + `check`.
- *Storia personale* → `status` con 4 valori, `text` + `check`.

**Vincoli non enumerativi introdotti in questa revisione.**
- `profiles_publication_requirements_check` (§3.1, §3.3): condiziona `is_public = true` a profilo non cancellato, attivo e con nome pubblico valido.
- `profile_languages_single_primary_idx` (§4, §9.1): indice univoco parziale che garantisce al massimo una lingua principale per Persona; non è un `check` perché la regola coinvolge più righe della stessa tabella, cosa che un `check` per riga non può esprimere.

---

## 8. Chiavi, relazioni e cardinalità

| # | Relazione | Cardinalità | FK | `ON DELETE` | `ON UPDATE` | Motivazione | Conseguenze sulla conservazione dei dati |
|---|---|---|---|---|---|---|---|
| R1 | `auth.users` → `profiles` | 1:1 (obbligatoria, condivisione di `id`) | `profiles.id → auth.users.id` | `cascade` (esistente, non modificato) | Nessuna azione (chiave immutabile) | Comportamento già applicato; un cambiamento qui richiederebbe alterare una migration già applicata, non consentito in questa fase | **Rischio esplicito**: l'eliminazione reale dell'account Supabase elimina a cascata `profiles` e, di conseguenza, tutte le sue righe figlie (R2–R5). È un evento raro e non self-service (si veda raccomandazione sotto) |
| R2 | `profiles` → `profile_languages` | 1:N (0..N per Persona) | `profile_languages.profile_id → profiles.id` | `cascade` | Nessuna | Le lingue dichiarate non hanno significato senza la Persona che le dichiara | Cancellazione della Persona elimina le sue dichiarazioni linguistiche: dato di scarso valore storico esterno, perdita accettabile |
| R3 | `languages` → `profile_languages` | N:1 (1 lingua per riga; una lingua è usata da 0..N righe) | `profile_languages.language_id → languages.id` | `restrict` | Nessuna | Il catalogo non deve mai perdere una voce ancora referenziata: si disattiva, non si elimina | Nessuna perdita: l'integrità referenziale forte impedisce eliminazioni accidentali del catalogo |
| R4 | `profiles` → `profile_competencies` | 1:N (0..N per Persona) | `profile_competencies.profile_id → profiles.id` | `cascade` | Nessuna | Come R2 | Come R2 |
| R4b | `competencies` → `profile_competencies` | N:1 | `profile_competencies.competency_id → competencies.id` | `restrict` | Nessuna | Come R3 | Come R3 |
| R5 | `profiles` → `personal_stories` | 1:N (0..N per Persona) | `personal_stories.profile_id → profiles.id` | `cascade` | Nessuna | Una storia non ha senso senza il suo autore | **Punto delicato**, approfondito sotto |

**La domanda del punto 8 dell'incarico: cancellazione dell'account vs. conservazione della Persona in stato archiviato.**

Si distinguono deliberatamente due eventi diversi, che nel sistema attuale sono invece un unico evento:

1. **Cancellazione "ordinaria" della Persona** (azione self-service, iniziata dalla Persona stessa dal proprio profilo). Realizzata impostando `profiles.deleted_at`. È **soft**: la riga `profiles` resta, così come le sue righe figlie (`profile_languages`, `profile_competencies`, `personal_stories`), ma diventano tutte invisibili pubblicamente (la formula di visibilità del §3.3 richiede `deleted_at is null`) e non più modificabili tramite le policy ordinarie (trigger di congelamento, §11). Questo è l'equivalente pratico di "conservare la Persona in stato archiviato": nessun dato viene perso, nessuna storia pubblicata scompare dalla base dati, nessuna tabella esterna (Servizi, Formazione) perde la riga a cui punta la propria chiave esterna. Questa azione **non deve mai** comportare, nemmeno indirettamente, l'eliminazione della riga `auth.users`.
2. **Cancellazione definitiva dell'identità** (`auth.users`), evento raro e **volutamente non self-service**. Se eseguita direttamente, farebbe scattare l'attuale `on delete cascade` già applicato, con perdita fisica e definitiva di `profiles` e di tutte le sue righe figlie — incluse eventuali `personal_stories` già pubblicate. Per questo è trattata come una **procedura separata e successiva** alla cancellazione ordinaria (1), non progettata nel dettaglio in questa sede (appartiene al dominio Identità & Accessi), ma che deve rispettare almeno questa sequenza minima prima di poter eliminare `auth.users`:
   1. **Esportazione** dei dati della Persona su richiesta (continuità del diritto alla portabilità);
   2. **Anonimizzazione o gestione esplicita** delle entità che non possono semplicemente scomparire senza conseguenze (es. `personal_stories` già pubblicate e referenziate altrove, o righe di tabelle esterne come `profile_language_services`/`training_*` che dipendono da `profiles.id`, §12);
   3. **Verifica delle dipendenze** residue (le tabelle esterne del dominio Servizi/Formazione, oltre a quelle di questo dominio) prima di procedere;
   4. Solo a quel punto, eliminazione della riga `auth.users`, che farà scattare il `cascade` già applicato in modo consapevole e controllato — mai come effetto collaterale di un'azione diretta dell'utente. L'interfaccia utente futura dovrà quindi offrire "cancella il mio profilo" come azione (1), non come richiesta diretta di eliminazione dell'account Supabase.

**Raccomandazione.** Il flusso self-service di cancellazione della Persona usa **esclusivamente** `deleted_at` e non deve poter raggiungere, nemmeno indirettamente, un'eliminazione della riga `auth.users`. La cascata da `auth.users` resta un meccanismo già applicato, riservato esclusivamente alla procedura separata di cancellazione definitiva dell'identità descritta al punto 2, accettato consapevolmente perché già in produzione e perché toccarlo violerebbe la regola di non modificare le migration applicate. Il tema "con quali strumenti concreti e in quali tempi eseguire export, anonimizzazione e verifica delle dipendenze" resta una decisione aperta di natura legale/prodotto (§15), non tecnica.

---

## 9. Indici

### 9.1 Indispensabili nella prima migration

| Indice | Tabella | Definizione | Motivazione |
|---|---|---|---|
| (esistenti) `profiles_display_name_idx`, `profiles_city_idx`, `profiles_organization_*_idx`, unique su `slug` | `profiles` | Non modificati | Già applicati, non toccati |
| `profiles_public_listing_idx` | `profiles` | `btree (published_at) where is_public = true and is_active = true and deleted_at is null` | Supporta direttamente la query più comune: "elenco dei profili pubblici", ordinabile per data di pubblicazione |
| (esistente) `profile_languages_language_id_idx` | `profile_languages` | Non modificato | Ricerca inversa "chi parla questa lingua" |
| `profile_languages_single_primary_idx` | `profile_languages` | `unique btree (profile_id) where is_primary = true` | Vincolo di integrità (non solo ottimizzazione): garantisce al massimo una lingua principale per Persona (§4) |
| `profile_competencies_competency_id_idx` | `profile_competencies` | `btree (competency_id)` | Stesso motivo, simmetrico a `profile_languages` (la PK composta copre già `profile_id` come colonna guida) |
| `personal_stories_slug_key` | `personal_stories` | `unique (slug)` | Risoluzione diretta dell'URL pubblico |
| `personal_stories_profile_id_idx` | `personal_stories` | `btree (profile_id)` | "Le storie di una Persona" (gestione lato autore) |
| `personal_stories_public_listing_idx` | `personal_stories` | `btree (published_at) where status = 'published' and deleted_at is null` | Elenco pubblico ordinato per data, la query di listing più prevedibile; le storie `archived` sono escluse perché non pubblicamente visibili (§6.1) |

### 9.2 Rinviabili

- `profile_languages_proficiency_level_idx`, `profile_languages_usage_context_idx`: utili solo quando esisterà un vero filtro di ricerca per livello/contesto; oggi nessuna interfaccia lo richiede.
- `profile_competencies_proficiency_level_idx`: stesso motivo.
- Indice su `profiles.country`/`profiles.region` per ricerca geografica aggregata: nessuna funzionalità di ricerca geografica esiste oggi nel frontend.
- `personal_stories_status_idx` (senza `published_at`) per una coda "in revisione" lato Staff: rinviabile, perché non esiste ancora alcuna interfaccia di revisione editoriale (dipende dal dominio Identità & Accessi, §12).

### 9.3 Prematuri (da non creare ora)

- Indici full-text (`GIN` su `tsvector`) su `profiles.bio`, `personal_stories.title`/`content`: nessuna funzionalità di ricerca testuale esiste nel frontend (confermato in `persone-existing-system.md`); crearli ora significherebbe indicizzare per un consumatore che non esiste.
- Indici compositi speculativi per filtri di ricerca cross-entità (competenza + lingua + territorio simultaneamente): appartengono a un futuro motore di ricerca trasversale (Domain Model, modello di ricerca), non alla prima migration additiva del solo dominio Persone.
- Indice su `profiles.role_description`: prematuro, vista la sua natura "da reinterpretare" (§3.2).

---

## 10. Row Level Security

Tutte le policy sotto descritte per `profiles` sono espresse come **modifiche da introdurre in una nuova migration futura** (sostituzione della sola policy pubblica, aggiunta delle nuove), non come modifica del file già applicato. Le policy per `profile_languages` sono invece la versione corretta del file non applicato (regola 13). Quelle per `profile_competencies` e `personal_stories` sono nuove.

### 10.1 `profiles`

| # | Operazione | Ruolo | `USING` | `WITH CHECK` | Dipendenze | Rischi |
|---|---|---|---|---|---|---|
| 1 | `select` | `public` | `is_public = true and is_active = true and deleted_at is null` | — | Nuove colonne `is_public`, `deleted_at` | **Sostituisce** l'attuale policy pubblica (`is_active = true`); nessun rischio di perdita dati, ma cambia il comportamento: profili oggi "attivi" e non ancora pubblicati smettono di essere pubblici, come richiesto dalla decisione 5 |
| 2 | `select` | `authenticated` | `auth.uid() = id` | — | Nessuna | Nessuno: già presente, non modificata; il proprietario vede sempre la propria riga, anche cancellata o sospesa |
| 3 | `update` | `authenticated` | `auth.uid() = id` | `auth.uid() = id` | Trigger `protect_profile_lifecycle_fields` (§11) | Il controllo fine (quali colonne, quali transizioni) è demandato ai `grant` per colonna e al trigger, non alla policy stessa |
| 4 | `insert`/`delete` | — | — | — | — | **Rimasti negati** a `authenticated` (già così oggi): nessuna riga viene creata o eliminata direttamente dall'utente, solo tramite `handle_new_user` (system) e `deleted_at` (soft) |
| — | Accesso amministrativo (Staff/moderazione) | — | — | — | Dominio Identità & Accessi (ruoli applicativi) | **Non progettato qui**: quando quel dominio esisterà, si aggiungerà una policy separata condizionata a un ruolo/claim, senza toccare le policy sopra |

**Grant per colonna (estensione dell'elenco già esistente).** Restano aggiornabili dall'utente le colonne descrittive già previste, più `is_public` e `deleted_at` — quest'ultima scrivibile dalla Persona **solo per impostarla** (da `NULL` a un timestamp): il trigger `protect_profile_lifecycle_fields` blocca qualunque tentativo di riportarla a `NULL` (§11), coerentemente con l'ownership "procedura controllata di cancellazione" (§3.1); un ripristino resta possibile solo tramite procedura amministrativa autorizzata, fuori da questo percorso. Restano **non concesse** (come oggi per `id`, `is_active`, `created_at`, `updated_at`): `published_at` (scritta solo dal trigger), `is_active` (riservata a un flusso di sospensione che oggi non ha un attore diverso dall'utente stesso, e quindi resta gestita a livello applicativo con lo stesso meccanismo attuale, non estesa in questa sede).

### 10.2 `profile_languages`

| # | Operazione | Ruolo | `USING` | `WITH CHECK` | Dipendenze | Rischi |
|---|---|---|---|---|---|---|
| 1 | `select` | `public` | Esiste una riga in `profiles` con `id = profile_languages.profile_id` e `is_public = true and is_active = true and deleted_at is null`, e una riga in `languages` con `id = profile_languages.language_id` e `is_active = true` | — | Formula di visibilità di `profiles` (§3.3) | **Corregge** la versione originale (che usava solo `is_active`): senza questa correzione, le lingue di un profilo non ancora pubblicato risulterebbero comunque visibili, contraddicendo la decisione 5 |
| 2 | `select` | `authenticated` | `auth.uid() = profile_id` | — | — | Nessuno, invariato |
| 3 | `insert` | `authenticated` | — | `auth.uid() = profile_id` e la lingua referenziata è attiva | — | Invariato |
| 4 | `update` | `authenticated` | `auth.uid() = profile_id` | Come sopra | — | Invariato |
| 5 | `delete` | `authenticated` | `auth.uid() = profile_id` | — | — | Invariato |

### 10.3 `profile_competencies` (nuova)

| # | Operazione | Ruolo | `USING` | `WITH CHECK` | Dipendenze | Rischi |
|---|---|---|---|---|---|---|
| 1 | `select` | `public` | Profilo pubblico (stessa formula) e competenza attiva | — | `profiles`, `competencies` | Coerente da subito con la decisione 5 (nessuna correzione futura necessaria, a differenza di `profile_languages`) |
| 2 | `select` | `authenticated` | `auth.uid() = profile_id` | — | — | — |
| 3 | `insert` | `authenticated` | — | `auth.uid() = profile_id` e la competenza referenziata è attiva | — | — |
| 4 | `update` | `authenticated` | `auth.uid() = profile_id` | Come sopra | — | — |
| 5 | `delete` | `authenticated` | `auth.uid() = profile_id` | — | — | — |

### 10.4 `personal_stories` (nuova)

| # | Operazione | Ruolo | `USING` | `WITH CHECK` | Dipendenze | Rischi |
|---|---|---|---|---|---|---|
| 1 | `select` | `public` | `deleted_at is null and status = 'published'` e il profilo autore è pubblico (stessa formula) | — | `profiles` | Una storia `archived` non soddisfa questa condizione e non è quindi mai pubblicamente visibile (§6.1). Se l'autore viene sospeso/cancellato dopo la pubblicazione, la storia smette di essere pubblicamente visibile pur restando `published`: comportamento accettato e coerente (§8), ma da comunicare chiaramente in interfaccia quando esisterà |
| 2 | `select` | `authenticated` (autore) | `auth.uid() = profile_id` | — | — | L'autore vede sempre le proprie storie, incluse bozze e storie cancellate (soft), per poterne verificare lo stato |
| 3 | `insert` | `authenticated` | — | `auth.uid() = profile_id and status = 'draft'` | — | Ogni nuova storia nasce sempre in bozza: nessuna pubblicazione diretta in fase di creazione |
| 4 | `update` | `authenticated` (autore) | `auth.uid() = profile_id` | `auth.uid() = profile_id` | Trigger `protect_personal_story_lifecycle_fields`, `handle_personal_story_publication` | Il controllo su quali transizioni di stato sono lecite e sulla protezione di `published_at`/`deleted_at` è demandato ai trigger, non alla policy |
| 5 | `delete` | — | — | — | — | **Negato** a `authenticated`: nessuna eliminazione fisica diretta, solo soft-delete tramite `deleted_at` (coerente con "non progettare un CMS generale" e con la conservazione della cronologia) |
| — | Approvazione editoriale (transizione a `published` con revisione di uno Staff) | — | — | — | Dominio Identità & Accessi | **Non progettata qui**: per la prima versione, l'autore può auto-pubblicare (nessun ruolo Staff esiste ancora); quando il dominio dei ruoli applicativi esisterà, si introdurrà una policy/trigger aggiuntivo che condiziona la transizione a `published` all'approvazione, senza inventare ora un sistema di autorizzazione incompleto |

---

## 11. Trigger e funzioni

| Trigger/funzione | Tabella | Momento | Stato | Cosa fa | Perché un trigger e non un'alternativa più semplice |
|---|---|---|---|---|---|
| `handle_new_user` | `auth.users` → `profiles` | `after insert` | Esistente, **non modificato** | Crea automaticamente la riga `profiles` | Le nuove colonne (`is_public`, `published_at`, `deleted_at`) assumono i propri default senza bisogno di toccare questa funzione |
| `profiles_set_updated_at` | `profiles` | `before update` | Esistente, non modificato | Aggiorna `updated_at` | — |
| `profiles_normalize_slug` | `profiles` | `before insert or update` | Esistente, non modificato | Normalizza lo `slug` | — |
| `protect_profile_lifecycle_fields` (nuovo) | `profiles` | `before update` | Nuovo | Per il percorso ordinario (ruolo `authenticated`, tramite le policy standard): se `OLD.deleted_at is not null`, rifiuta qualunque modifica (la riga resta congelata); imposta `NEW.published_at := now()` la prima volta che `is_public` passa da `false` a `true` e `published_at` è ancora `NULL`, senza mai azzerarlo in seguito, nemmeno se `is_public` torna `false` | Necessario: la protezione "una volta cancellata la riga non cambia più per il percorso ordinario" e "la prima pubblicazione fissa una data che non si azzera" dipendono dal valore precedente (`OLD`), non esprimibile con un semplice `check` (che vede solo la riga corrente) né con un `grant` (che non sa distinguere "prima volta" da "volte successive"). Il blocco è specifico del percorso ordinario esposto agli utenti: un ripristino di `deleted_at` resta tecnicamente possibile solo tramite una procedura amministrativa autorizzata, eseguita fuori da questo percorso (dominio Identità & Accessi, non progettata qui) |
| `enforce_single_primary_language` (nuovo) | `profile_languages` | `before insert or update` | Nuovo | Quando `NEW.is_primary = true`, azzera `is_primary` sulle altre righe della stessa Persona | Una regola che coinvolge più righe della stessa tabella non è esprimibile con un `check` per riga; l'indice univoco parziale (§9.1) resta comunque la garanzia ultima a livello di database — il trigger è solo una comodità per evitare errori di violazione del vincolo durante l'uso normale |
| `set_profile_competencies_updated_at` (nuovo) | `profile_competencies` | `before update` | Nuovo | Aggiorna `updated_at` | Stesso pattern minimo già usato per `profile_languages`; non serve altro |
| `set_personal_stories_updated_at` (nuovo) | `personal_stories` | `before update` | Nuovo | Aggiorna `updated_at` | Idem |
| `normalize_personal_story_slug` (nuovo) | `personal_stories` | `before insert or update` | Nuovo | Normalizza lo `slug` (stessa logica di `profiles_normalize_slug`) | Riuso dello stesso pattern già approvato per `profiles`, non una nuova invenzione |
| `handle_personal_story_publication` (nuovo) | `personal_stories` | `before update` | Nuovo | Imposta `NEW.published_at := now()` la prima volta che `status` entra in `'published'` da uno stato diverso, se `published_at` è ancora `NULL`; non lo azzera mai in seguito, anche se la storia viene poi archiviata | Come per il profilo: dipende dal valore precedente di `status`, non esprimibile con un `check` |
| `protect_personal_story_lifecycle_fields` (nuovo) | `personal_stories` | `before update` | Nuovo | Se `OLD.deleted_at is not null`, rifiuta qualunque modifica per il percorso ordinario | Stesso motivo di `protect_profile_lifecycle_fields`, incluso il limite del blocco al solo percorso ordinario |

**Cosa si è deliberatamente scelto di non fare con un trigger.**
- *Generazione automatica dello slug da titolo/nome*, se assente: lasciata all'applicazione (come già oggi, `profiles` non genera uno slug da un campo diverso in fase di modifica manuale, lo normalizza soltanto). Un trigger che "inventa" uno slug leggibile da un titolo aggiungerebbe complessità (gestione delle collisioni) senza un beneficio chiaro rispetto a un default proposto lato client e poi normalizzato dal database.
- *Validazione dei requisiti minimi di pubblicazione*: non richiede un trigger. È risolta con il vincolo `profiles_publication_requirements_check` (§3.1, §3.3), perché dipende solo dalla riga corrente al momento della scrittura. Si è deliberatamente evitato di aggiungere requisiti ulteriori (bio, città, immagine, ecc.), non richiesti da alcun documento approvato: sarebbero eccessivi per la prima versione.
- *Normalizzazione delle competenze testuali*: non applicabile, poiché si è scelta l'Alternativa B (catalogo), che non richiede alcuna normalizzazione di testo libero.

---

## 12. Compatibilità con il sistema esistente

| Elemento | Stato remoto/locale | Decisione | Impatto | Azione futura | Rischio | Compatibilità |
|---|---|---|---|---|---|---|
| `profiles` (tabella) | Applicata | Estesa additivamente (+`is_public`, `+published_at`, `+deleted_at`, +vincolo `profiles_publication_requirements_check`); nessuna colonna rimossa; policy pubblica sostituita | Nessuna perdita dati; la RLS pubblica cambia semantica | Nuova migration futura con `alter table add column` + `add constraint` + `drop policy`/`create policy` + nuovo trigger; **non** si tocca il file già applicato | Nullo oggi (nessun dato reale, confermato in `persone-existing-system.md`) | Piena, additiva |
| `languages` (tabella) | Applicata | Nessuna modifica | Nessuno | Nessuna | Nessuno | Piena |
| `profile_languages` (tabella) | Creata, non applicata | Corretta in questa sede (rimossi `is_working_language`/`can_assist_clients`/`notes`; aggiunto `usage_context`; aggiunto `is_primary` con indice univoco parziale; livelli allineati; RLS aggiornata alla formula di visibilità di `profiles`) | Nessuno (mai applicata) | Riscrivere il file locale prima di applicarlo | Nullo | Piena |
| `profile_language_services` (dominio Servizi) | Creata, non applicata | Nessuna modifica in questa sede (fuori perimetro) | Le sue policy pubbliche referenziano oggi solo `profiles.is_active`; con l'introduzione di `is_public`/`deleted_at` diventano incoerenti con la decisione 5 (mostrerebbero servizi di profili non ancora pubblicati) | Correzione futura di competenza del dominio Servizi, quando verrà riconciliato | Basso oggi (non applicata); da risolvere prima che entrambi i domini vengano applicati insieme | Compatibile solo dopo quella correzione futura |
| Migration remote applicate (`profiles`, `languages`) | Applicate | Non toccate | Nessuno | — | Nessuno | Piena |
| Migration locali non applicate del dominio Formazione (8 file) e Servizi Linguistici (4 file) | Non applicate | Non toccate (fuori perimetro) | Stessa osservazione di `profile_language_services` per le rispettive policy pubbliche | Correzione futura, di competenza dei rispettivi domini | Basso oggi | Come sopra, dopo correzione futura |
| Tipi TypeScript esistenti | Nessun tipo `Profile`/`Persona` nel repository (verificato) | Nessuna modifica: nessun file da toccare | Nessuno | I tipi verranno scritti ex novo quando si costruirà la UI reale, con piena libertà di rispecchiare questa progettazione | Nessuno | Piena |
| Dati demo (`src/data/home/*`, in particolare `stories.ts`, `languages.ts`, `professionals.ts`) | Statici, disconnessi dal database | Nessuna modifica | Nessuno oggi | Andranno sostituiti (non evoluti) quando la Home si collegherà a dati reali: non hanno struttura riutilizzabile verso `personal_stories`/`profile_languages` | Nessuno | Non applicabile (fuori schema) |
| `src/lib/supabase/client.ts`/`server.ts` | Presenti, non usati altrove | Nessuna modifica | Nessuno | Diventeranno il punto di accesso reale quando si scriveranno le prime query verso queste tabelle | Nessuno | Piena |

---

## 13. Modello fisico finale

### `public.profiles` (estensione additiva di una tabella applicata)

| Colonna | Tipo | PK/FK | Unique | Check | Default |
|---|---|---|---|---|---|
| `id` | `uuid` | PK; FK → `auth.users(id)` `on delete cascade` | — | — | — |
| `display_name` | `text` | — | — | `not null` | — |
| `slug` | `text` | — | `unique` | Formato slug | — |
| `bio` | `text` | — | — | — | `null` |
| `organization_name` | `text` | — | — | — | `null` *(legacy, congelato)* |
| `organization_type` | `text` | — | — | Lista valori esistente | `null` *(legacy, congelato)* |
| `role_description` | `text` | — | — | — | `null` |
| `city`/`province`/`region` | `text` | — | — | — | `null` |
| `country` | `text` | — | — | — | `'Italia'` |
| `website`/`phone` | `text` | — | — | — | `null` |
| `avatar_url` | `text` | — | — | — | `null` |
| `is_active` | `boolean` | — | — | — | `true` |
| `is_public` **(nuova)** | `boolean` | — | — | `profiles_publication_requirements_check` (vedi sotto) | `false` |
| `published_at` **(nuova)** | `timestamptz` | — | — | Non aggiornabile dal client; mai azzerata dopo la prima scrittura | `null` |
| `deleted_at` **(nuova)** | `timestamptz` | — | — | Monotono per il proprietario (trigger); ripristino solo via procedura amministrativa autorizzata | `null` |
| `created_at`/`updated_at` | `timestamptz` | — | — | — | `now()` |

**Vincolo di tabella (nuovo):** `constraint profiles_publication_requirements_check check (is_public = false or (deleted_at is null and is_active = true and length(trim(display_name)) > 0))`.

Indici: esistenti + `profiles_public_listing_idx` (§9.1). RLS: §10.1. Trigger: esistenti + `protect_profile_lifecycle_fields`. Dipendenze in ingresso: `auth.users`. Dipendenze in uscita (chi referenzia `profiles.id`): `profile_languages`, `profile_competencies`, `personal_stories` (questo dominio); `profile_language_services`, `training_offers`, `training_requests`, `training_provider_qualifications` (domini esterni, non modificati).

### `public.profile_languages` (correzione di una migration non applicata)

| Colonna | Tipo | PK/FK | Unique | Check | Default |
|---|---|---|---|---|---|
| `profile_id` | `uuid` | PK (composta); FK → `profiles(id)` `on delete cascade` | — | — | — |
| `language_id` | `bigint` | PK (composta); FK → `languages(id)` `on delete restrict` | — | — | — |
| `usage_context` | `text` | — | — | `in ('personal','professional','both')` | `'both'` |
| `proficiency_level` | `text` | — | — | `null or in ('native','fluent','intermediate','basic')` | `null` |
| `is_primary` **(nuova)** | `boolean` | — | — | Al massimo una per Persona, via indice univoco parziale | `false` |
| `created_at`/`updated_at` | `timestamptz` | — | — | — | `now()` |

Indici: PK (copre `profile_id`) + `language_id` + `profile_languages_single_primary_idx` (unique parziale su `is_primary`, §9.1). RLS: §10.2. Trigger: aggiornamento `updated_at` (pattern esistente) + `enforce_single_primary_language`. Dipendenze: `profiles`, `languages`.

### `public.competencies` (nuovo catalogo)

| Colonna | Tipo | PK/FK | Unique | Default |
|---|---|---|---|---|
| `id` | `bigint generated always as identity` | PK | — | — |
| `slug` | `text` | — | `unique` | — |
| `name` | `text` | — | — | — |
| `description` | `text` | — | — | `null` |
| `is_active` | `boolean` | — | — | `true` |
| `sort_order` | `integer` | — | — | `100` |
| `created_at`/`updated_at` | `timestamptz` | — | — | `now()` |

RLS: sola lettura pubblica su record attivi, nessuna scrittura utente (stesso pattern di `languages`). Dipendenze: nessuna in ingresso; in uscita, `profile_competencies`.

### `public.profile_competencies` (nuova)

| Colonna | Tipo | PK/FK | Check | Default |
|---|---|---|---|---|
| `profile_id` | `uuid` | PK (composta); FK → `profiles(id)` `on delete cascade` | — | — |
| `competency_id` | `bigint` | PK (composta); FK → `competencies(id)` `on delete restrict` | — | — |
| `proficiency_level` | `text` | — | `null or in ('basic','intermediate','advanced','expert')` | `null` |
| `years_of_experience` | `smallint` | — | `null or between 0 and 80` | `null` |
| `notes` | `text` | — | — | `null` |
| `created_at`/`updated_at` | `timestamptz` | — | — | `now()` |

Indici: PK + `competency_id` (§9.1). RLS: §10.3. Trigger: aggiornamento `updated_at`. Dipendenze: `profiles`, `competencies`.

### `public.personal_stories` (nuova)

| Colonna | Tipo | PK/FK | Unique | Check | Default |
|---|---|---|---|---|---|
| `id` | `uuid` | PK | — | — | `gen_random_uuid()` |
| `profile_id` | `uuid` | FK → `profiles(id)` `on delete cascade` | — | — | — |
| `slug` | `text` | — | `unique` | Formato slug | — |
| `title` | `text` | — | — | `length(trim(title)) > 0` | — |
| `summary` | `text` | — | — | — | `null` |
| `content` | `text` | — | — | `length(trim(content)) > 0` | — |
| `cover_image_url` | `text` | — | — | — | `null` |
| `status` | `text` | — | — | `in ('draft','in_review','published','archived')` | `'draft'` |
| `rejection_reason` | `text` | — | — | — | `null` |
| `published_at` | `timestamptz` | — | — | Non aggiornabile dal client | `null` |
| `created_at`/`updated_at` | `timestamptz` | — | — | — | `now()` |
| `deleted_at` | `timestamptz` | — | — | Monotono (trigger) | `null` |

Indici: `slug` unique, `profile_id`, `personal_stories_public_listing_idx` (§9.1). RLS: §10.4. Trigger: aggiornamento `updated_at`, normalizzazione `slug`, `handle_personal_story_publication`, `protect_personal_story_lifecycle_fields`. Dipendenze: `profiles`. Colonna intenzionalmente assente: riferimento a Impresa (§6).

---

## 14. Alternative scartate

| Alternativa | Perché scartata |
|---|---|
| Nuova tabella `people`/`persons` | Duplicherebbe il concetto di Persona già rappresentato da `profiles`, violando la decisione 3 (già approvata) e il principio di non duplicazione (§2.2) |
| `auth.users` come tabella Persona | `auth.users` è gestita da Supabase Auth e deve restare priva di colonne applicative; non è pensata per RLS di dominio né per l'estensione con attributi di business |
| Mantenimento indefinito di Persona e Impresa nella stessa tabella | In contrasto con le decisioni 6/7 (già approvate); accettato solo come stato **transitorio** per i campi legacy già esistenti, non come destinazione finale (§3.4) |
| Competenze interamente libere, senza normalizzazione (Alternativa A, §5.1) | Frammenterebbe la ricerca per competenza e contraddirebbe la Data Specification già approvata, che lega CompetenzaDichiarata a una voce di Tassonomia |
| Tassonomia completa delle competenze nella prima versione | Ripeterebbe l'errore già corretto una volta per i servizi linguistici (catalogo troppo granulare); si adotta un elenco minimale, ampliabile |
| StoriaPersonale memorizzata integralmente in `profiles.bio` | Confonderebbe due concetti distinti per scopo e ciclo di vita (decisione 11, già approvata): `bio` è statica e senza revisione, StoriaPersonale ha un vero flusso editoriale |
| Pubblicazione automatica del profilo dopo la registrazione | Viola direttamente la decisione 5; è la ragione stessa per cui `is_public` nasce con default `false`, distinto da `is_active` |
| Stato unico (`enum`/`status` testuale) per la visibilità del profilo, invece di campi separati | Valutata al §3.3: mescolerebbe tre decisioni prese da attori diversi in un solo campo e richiederebbe di ritirare `is_active` già applicato |
| `enum` nativo PostgreSQL per uno qualunque dei vocabolari introdotti | Nessuna migration del progetto ne usa già uno; più rigido da evolvere di un `check` su `text` (§7) |
| Livelli CEFR per LinguaParlata nella prima versione | Troppo formale per un'autodichiarazione; la Data Specification riserva le certificazioni formali a un'estensione futura (§4) |
| Storie `archived` pubblicamente leggibili tramite permalink, escluse solo dagli elenchi "in evidenza" | Scartata in questa revisione (era la scelta di una versione precedente di questo documento): nessun documento approvato la richiede; si adotta invece la regola più semplice "archiviata = non pubblicamente visibile" (§6.1, §10.4) |
| Nessun requisito minimo per la pubblicazione del profilo | Scartata: avrebbe permesso di pubblicare un profilo cancellato, sospeso o senza un nome pubblico valido; sostituita da un vincolo minimo esplicito e non eccessivo (§3.3) |
| `deleted_at` pienamente irreversibile anche per via amministrativa | Scartata: il soft-delete non distrugge alcun dato, quindi non ha senso escludere a priori un ripristino tecnico; si lascia aperta questa possibilità, riservandola a una procedura amministrativa autorizzata e distinta dal percorso ordinario (§3.1, §8) |
| `is_primary` gestita solo a livello applicativo, senza vincolo di database | Scartata: un controllo solo lato client/applicazione non impedirebbe due lingue principali in caso di race condition, bug o accesso diretto al database; l'indice univoco parziale lo garantisce in modo certo (§4) |

---

## 15. Decisioni eventualmente ancora aperte

Nessuna delle 14 decisioni già approvate viene qui rimessa in discussione. Rispetto alla versione precedente di questo documento, sono state **risolte** in questa revisione: la validazione minima di pubblicazione del profilo (ora un vincolo esplicito, §3.3), la visibilità delle storie archiviate (ora sempre privata, §6.1/§10.4) e la "lingua principale" (ora implementata con `is_primary` e indice univoco parziale, §4/§9.1). Le decisioni residue, tutte di dettaglio o rinviabili a una fase successiva, sono le seguenti.

| # | Decisione | Alternative | Raccomandazione | Impatto | Urgenza | Momento entro cui risolvere |
|---|---|---|---|---|---|---|
| 1 | Backfill di `is_public`/`published_at` per eventuali righe preesistenti al momento dell'applicazione della migration | (a) Lasciare tutte private per default, rigorosamente coerente con la decisione 5; (b) impostare `is_public = true` per le righe già `is_active = true` al momento della migrazione, per continuità di comportamento | (a), salvo che esistano già utenti reali al momento dell'applicazione | Nullo oggi (nessun dato reale, confermato) | Bassa | Prima di scrivere la migration reale, solo se nel frattempo saranno comparsi dati reali |
| 2 | Nome definitivo e ampiezza del seed del catalogo competenze | (a) `competencies`, elenco minimale (15–25 voci, raccomandato); (b) elenco più ampio dal lancio | (a) | Solo quantitativo | Media | Prima di scrivere la migration reale del catalogo |
| 3 | "Lingua preferita d'interfaccia" della Persona | (a) Non implementata ora (scelta di questo documento); (b) aggiungere `preferred_interface_locale` ora | (a) | Nessuno se rinviata (nullable, additiva quando servirà) | Bassa | Quando esisterà un sistema di internazionalizzazione dell'interfaccia |
| 4 | Meccanismo di revisione editoriale reale per `personal_stories` (ruoli Staff, approvazione) | — | Non decidibile in questo documento | — | Media | Quando il dominio Identità & Accessi/ruoli applicativi verrà progettato |
| 5 | Procedura operativa di cancellazione definitiva dell'identità (`auth.users`) | La sequenza minima (export → anonimizzazione/gestione delle dipendenze → verifica → cancellazione) è ora definita al §8; restano aperti gli strumenti concreti, i tempi e le eventuali soglie legali (es. GDPR) | Non decidibile in questo documento (natura legale/prodotto, non tecnica) | — | Bassa oggi | Prima del lancio reale con utenti veri |
| 6 | Procedura amministrativa autorizzata per il ripristino di `deleted_at`/`is_active` | Non progettata qui (dipende dal dominio Identità & Accessi: ruoli Staff, audit trail) | Non decidibile in questo documento | — | Bassa oggi | Quando il dominio Identità & Accessi verrà progettato |

---

## 16. Criteri di accettazione

| Criterio | Verifica |
|---|---|
| Non crea un secondo modello di Persona | `profiles` resta l'unica riga tecnica della Persona (§2.2, §14) |
| Mantiene `profiles` | Nessuna colonna esistente rimossa; solo estensione additiva (§3) |
| Separa Persona e Impresa | `organization_name`/`organization_type` identificati, congelati, non estesi (§3.4); nessuna nuova colonna di dominio Impresa (§2.4) |
| Definisce LinguaParlata | `profile_languages`, corretta e allineata alla Data Specification (§4) |
| Definisce CompetenzaDichiarata | `competencies` + `profile_competencies`, nuove (§5) |
| Distingue biografia e StoriaPersonale | `profiles.bio` invariata; `personal_stories` nuova e distinta, con confini espliciti (§6) |
| Contiene colonne, tipi, vincoli, indici e RLS | §3–§10, per ogni tabella |
| Considera lo stato remoto reale delle migration | §1 (verifica esplicita), §12 (tabella di compatibilità) |
| Definisce requisiti minimi di pubblicazione del profilo, senza eccedere | `profiles_publication_requirements_check`: non cancellato, attivo, nome pubblico valido; il consenso è l'atto stesso di pubblicare (§3.1, §3.3) |
| Garantisce al massimo una lingua principale per Persona | `profile_languages.is_primary` + indice univoco parziale `profile_languages_single_primary_idx` (§4, §9.1) |
| Distingue la cancellazione ordinaria dalla cancellazione definitiva dell'identità | Cancellazione ordinaria via `deleted_at` (soft, mai tocca `auth.users`); cancellazione dell'identità come procedura separata con export, anonimizzazione, verifica delle dipendenze (§8) |
| Chiarisce l'ownership dei campi di ciclo di vita | Tabella dedicata al §3.1: `is_public` (Persona), `is_active` (sistema/moderazione), `deleted_at` (procedura controllata), `published_at` (sistema) |
| Non modifica il repository oltre alla creazione del documento richiesto | Nessun file esistente è stato letto per essere modificato; solo consultato |
| Non crea migration | Nessun file `.sql` creato |
| Non implementa codice | Nessun file `.ts`/`.tsx` creato o modificato |
| Non progetta domini esterni | Impresa, Appartenenza, Servizi, Formazione, Contenuti, Identità & Accessi citati solo come dipendenze (§8, §12), mai progettati |
| Consente un piano di migration completamente additivo | §13 fornisce la base diretta; §9–§11 separano già ciò che è indispensabile da ciò che è rinviabile |

---

## Conclusione

Questo documento traduce il dominio Persone in una progettazione fisica completa senza toccare nessuna migration già applicata, senza duplicare il concetto di Persona e senza anticipare la progettazione di alcun dominio esterno. `profiles` resta l'unica riga tecnica della Persona, estesa in modo additivo con tre nuove colonne (`is_public`, `published_at`, `deleted_at`) che separano finalmente la pubblicazione volontaria dalla semplice esistenza dell'account, e con un vincolo esplicito che fissa i requisiti minimi di pubblicazione senza eccedere. `profile_languages` viene corretta (essendo ancora non applicata) per allinearsi esattamente alla Data Specification, incluso il supporto a una lingua principale garantito a livello di database. CompetenzaDichiarata e StoriaPersonale, oggi del tutto assenti, vengono introdotte come nuove tabelle dipendenti, seguendo lo stesso pattern già validato nel progetto. Nessuna decisione tra quelle già approvate è stata rimessa in discussione; le decisioni residue elencate al §15 sono tutte di dettaglio, rinviabili, o di competenza di altri domini.

Questa revisione ha inoltre chiuso tre decisioni rimaste aperte nella prima versione (requisiti minimi di pubblicazione, visibilità delle storie archiviate, lingua principale) e ha precisato in modo netto la separazione tra cancellazione ordinaria della Persona — sempre soft, sempre tramite `deleted_at`, mai in grado di eliminare `auth.users` — e cancellazione definitiva dell'identità, trattata come procedura amministrativa separata e successiva a esportazione, anonimizzazione e verifica delle dipendenze.

