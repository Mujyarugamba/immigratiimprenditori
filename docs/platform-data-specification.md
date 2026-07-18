# Platform Data Specification — ImmigratiImprenditori.it

> Specifica funzionale completa dei dati della piattaforma. Traduzione del Domain Model in schede di dettaglio per ogni entità.
> Fondamenti: [`docs/costituzione-piattaforma.md`](./costituzione-piattaforma.md) e [`docs/domain-model.md`](./domain-model.md). Nessuno dei due documenti è modificato da questo.
> Questo documento è indipendente dalla tecnologia: non contiene riferimenti a database, tabelle, SQL, indici, chiavi esterne o migrazioni. Descrive COSA deve esistere e QUALI informazioni deve contenere, non COME verrà implementato.

---

## Come è organizzato questo documento

Il documento è diviso per domini, nello stesso ordine del Domain Model. Per ogni entità viene compilata una scheda con una struttura fissa, descritta di seguito, per garantire che nessuna decisione funzionale resti implicita.

### Convenzioni trasversali (valide per ogni scheda, salvo eccezioni indicate)

**Livelli di visibilità delle informazioni** — ogni attributo di ogni entità è classificato secondo uno di questi livelli:

- **Pubblico** — visibile a chiunque, anche a visitatori non registrati.
- **Utenti registrati** — visibile solo a chi ha effettuato l'accesso alla piattaforma.
- **Solo proprietario** — visibile solo alla Persona o all'Impresa/Organizzazione titolare dell'informazione, e alle Persone con Appartenenza attiva e ruolo abilitante quando il titolare è un'Impresa/Organizzazione.
- **Amministrazione** — visibile solo allo Staff di piattaforma.
- **Partner autorizzati** — visibile ai Partner con accordo attivo pertinente all'informazione in questione.

**Metadati standard** — ogni entità, salvo diversamente indicato, conserva sempre:
- data di creazione;
- autore/creatore (Persona, ed eventualmente a nome di quale Impresa/Organizzazione);
- data dell'ultima modifica;
- autore dell'ultima modifica;
- stato corrente, secondo il ciclo di vita proprio dell'entità;
- cronologia degli stati (data e transizione di ogni cambio di stato);
- motivazione dell'archiviazione/chiusura/rifiuto, quando l'entità prevede questi stati.

Le schede riportano solo i metadati aggiuntivi rispetto a questo standard.

**Struttura di ogni scheda entità**

1. Nome, Descrizione, Scopo, Perché esiste
2. Chi la crea, Chi la modifica, Chi la consulta
3. Relazioni logiche
4. Stato iniziale, Stati possibili, Fine del ciclo di vita
5. Attributi (tabella: nome, significato, obbligatorio/facoltativo, valore singolo/multiplo, modificabile, visibilità, cronologia)
6. Validazioni funzionali
7. Regole di visibilità (solo se richiedono precisazioni oltre alla tabella attributi)
8. Metadati (solo le aggiunte rispetto allo standard)
9. Ricerca (ricercabile per, in risultati, filtri)
10. Ordinamenti
11. Tag applicabili
12. Eventi importanti
13. Notifiche generate
14. Estensioni future

**Nota sulle entità specializzate.** Alcune entità (le Offerte/Richieste di Servizio, le voci di Tassonomia) esistono in una forma generica e in più specializzazioni verticali. Per evitare ripetizioni, la forma generica riceve una scheda completa; ogni specializzazione riceve solo gli attributi e le regole *aggiuntive* rispetto alla forma generica, che resta valida per tutto il resto (stati, visibilità, metadati, ricerca, tag, eventi, notifiche).

---

## Dominio: PERSONE

### 1. Persona

**Descrizione.** L'individuo che utilizza la piattaforma: la sua identità pubblica, il modo in cui si presenta, dove si trova, come può essere contattato.

**Scopo.** Essere il nodo stabile a cui si ricollegano tutte le attività, i contenuti e le relazioni della piattaforma.

**Perché esiste.** Il principio fondante della piattaforma è che la persona precede e sopravvive a qualsiasi ruolo o impresa che assume nel tempo (Costituzione, Valore 1).

**Chi la crea.** La Persona stessa, al momento della registrazione (creazione minimale automatica) e del successivo completamento del profilo.

**Chi la modifica.** Esclusivamente la Persona stessa, per i propri dati. Lo Staff di piattaforma può intervenire solo per moderazione (es. disattivazione per violazione delle regole).

**Chi la consulta.** Chiunque, per i dati pubblici. La Persona stessa, per la totalità dei propri dati. Lo Staff, per finalità di moderazione.

**Relazioni logiche.** Collegata a Impresa/OrganizzazioneIstituzionale tramite Appartenenza. Autrice di Opportunità, OffertaDiServizio, RichiestaDiServizio, ContenutoEditoriale (Storia personale). Partecipante a Evento. Titolare di CompetenzaDichiarata e LinguaParlata. Soggetto di PresenzaDiMercato.

**Stato iniziale.** Registrata (profilo minimo, non ancora completato).

**Stati possibili.** Registrata → Attiva (profilo completo e visibile) → Inattiva/Sospesa (temporaneamente non visibile, per scelta propria o per moderazione) → Attiva (ripristino) → Cancellata (definitivo, su richiesta).

**Fine del ciclo di vita.** Cancellazione su richiesta esplicita della Persona (irreversibile), oppure, in casi eccezionali, disattivazione permanente decisa dallo Staff per violazione delle regole della piattaforma.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Nome visualizzato | Nome con cui la persona si presenta pubblicamente | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Identificativo pubblico | Identificativo leggibile e univoco usato per raggiungere il profilo | Obbligatorio | Singolo | Sì (con vincolo di unicità) | Pubblico | Sì |
| Biografia | Descrizione libera del proprio percorso | Facoltativo | Singolo | Sì | Pubblico | No |
| Ruolo professionale breve | Qualifica sintetica (es. "imprenditore nel settore edile") | Facoltativo | Singolo | Sì | Pubblico | No |
| Localizzazione | Città, provincia, regione, paese di riferimento | Facoltativo (raccomandato) | Singolo (composto) | Sì | Pubblico | No |
| Contatti | Telefono, email di contatto, sito web, canali social | Facoltativo | Multiplo | Sì | Pubblico o Utenti registrati, a scelta della Persona per singolo canale | No |
| Immagine profilo | Fotografia o immagine rappresentativa | Facoltativo | Singolo | Sì | Pubblico | No |
| Email account | Email di accesso all'account (dato di autenticazione) | Obbligatorio | Singolo | Sì (con verifica) | Solo proprietario / Amministrazione | Sì |
| Stato attivo | Indica se il profilo è visibile pubblicamente | Obbligatorio | Singolo | Solo tramite azioni di ciclo di vita controllate | Pubblico (l'effetto) | Sì |
| Lingua preferita d'interfaccia | Lingua in cui la persona preferisce usare la piattaforma | Facoltativo | Singolo | Sì | Solo proprietario | No |

**Validazioni funzionali**
- Il nome visualizzato non può essere vuoto.
- L'identificativo pubblico deve essere univoco su tutta la piattaforma.
- Una Persona corrisponde a un solo account: non sono ammessi account duplicati per lo stesso individuo (garantito al momento della registrazione, non rinforzabile a posteriori senza verifica documentale, fuori dallo scope attuale).
- Deve sempre esistere un'email account valida, anche quando non pubblica.

**Metadati aggiuntivi.** Data dell'ultimo accesso (utile per rilevanza in ricerca e per politiche di inattività).

**Ricerca.** Ricercabile per: nome visualizzato, biografia, ruolo professionale breve, competenze dichiarate, lingue parlate, localizzazione. In risultati: nome visualizzato, ruolo professionale breve, localizzazione sintetica, immagine profilo. Filtri: competenza, lingua, territorio, settore (derivato dalle Appartenenze attive), mercato (derivato da PresenzaDiMercato).

**Ordinamenti.** Per rilevanza rispetto alla ricerca; per data di ultima attività; alfabetico; per distanza geografica (se disponibile e ricerca geolocalizzata).

**Tag applicabili.** Competenze, Lingue, Territori (dichiarati direttamente); Settori e Mercati per derivazione (tramite Appartenenza/PresenzaDiMercato), non dichiarati direttamente sulla Persona.

**Eventi importanti.** Registrazione; Completamento profilo; Pubblicazione (il profilo diventa visibile); Aggiornamento; Disattivazione volontaria; Sospensione per moderazione; Riattivazione; Cancellazione.

**Notifiche generate.** Verso terzi che seguono un ambito (competenza/mercato/settore) quando una nuova Persona rilevante si registra (estensione futura). Nessuna notifica di routine per la semplice modifica del profilo.

**Estensioni future.** Verifica d'identità documentale; punteggio di reputazione aggregato; fasi di percorso dichiarate esplicitamente per personalizzare i contenuti; portfolio di lavori/progetti.

---

### 2. CompetenzaDichiarata

**Descrizione.** Una competenza che la Persona dichiara di possedere.

**Scopo.** Rendere la persona trovabile per competenza e qualificare la propria offerta professionale.

**Perché esiste.** La piattaforma deve permettere ricerche mirate ("trova chi sa fare X"): è un'applicazione diretta del Valore 2 della Costituzione (concretezza operativa).

**Chi la crea.** La Persona stessa.

**Chi la modifica.** La Persona stessa (aggiunta, rimozione, modifica del livello).

**Chi la consulta.** Chiunque, se il profilo della Persona è pubblico.

**Relazioni logiche.** Collegata a una Persona (titolare) e a una VoceDiTassonomia di tipo Competenza.

**Stato iniziale.** Dichiarata.

**Stati possibili.** Dichiarata → (Verificata, se in futuro introdotta una verifica da terzi) → Rimossa.

**Fine del ciclo di vita.** Rimozione volontaria da parte della Persona.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Competenza di riferimento | Riferimento alla voce di Tassonomia Competenza | Obbligatorio | Singolo (per dichiarazione) | No (si rimuove e si ricrea) | Pubblico | No |
| Livello dichiarato | Livello di padronanza (base, intermedio, avanzato, esperto) | Facoltativo | Singolo | Sì | Pubblico | No |
| Anni di esperienza dichiarati | Indicazione facoltativa dell'esperienza | Facoltativo | Singolo | Sì | Pubblico | No |
| Note | Dettaglio libero | Facoltativo | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Una Persona non può dichiarare due volte la stessa competenza.
- La competenza di riferimento deve essere una voce attiva della Tassonomia Condivisa.

**Regole di visibilità.** Pubblica se il profilo della Persona è pubblico; altrimenti visibile solo al proprietario.

**Ricerca.** Ricercabile/filtrabile per competenza di riferimento e livello dichiarato. Compare nei risultati di ricerca Persona come tag.

**Ordinamenti.** All'interno del profilo, per livello o per data di dichiarazione.

**Tag applicabili.** Competenze (è essa stessa un collegamento a un tag).

**Eventi importanti.** Dichiarazione; Modifica del livello; Rimozione.

**Notifiche generate.** Nessuna notifica diretta; contribuisce a notifiche verso la Persona quando compare in ricerche o RichiesteDiServizio compatibili.

**Estensioni future.** Verifica da parte di terzi (es. un'impresa che ha collaborato con la persona conferma la competenza); endorsement da altre persone.

---

### 3. LinguaParlata

**Descrizione.** Una lingua che la Persona utilizza, con relativo contesto d'uso.

**Scopo.** Rendere la persona trovabile per lingua ed essere il fondamento dei Servizi Linguistici.

**Perché esiste.** Il multilinguismo reale è un valore fondante della piattaforma (Costituzione, Valore 3).

**Chi la crea / modifica.** La Persona stessa.

**Chi la consulta.** Chiunque, se il profilo è pubblico.

**Relazioni logiche.** Persona (titolare) → VoceDiTassonomia di tipo Lingua; base per OffertaLinguistica/RichiestaLinguistica.

**Stato iniziale.** Dichiarata. **Stati possibili.** Dichiarata → Rimossa. **Fine del ciclo di vita.** Rimozione volontaria.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Lingua di riferimento | Riferimento alla voce di Tassonomia Lingua | Obbligatorio | Singolo (per dichiarazione) | No (si rimuove e si ricrea) | Pubblico | No |
| Contesto d'uso | Personale, professionale, entrambi | Facoltativo (default: entrambi) | Singolo | Sì | Pubblico | No |
| Livello dichiarato | Madrelingua, fluente, intermedio, base | Facoltativo | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Una Persona non può dichiarare due volte la stessa lingua.
- La lingua deve essere una voce attiva della Tassonomia.

**Ricerca.** Filtrabile per lingua di riferimento, livello dichiarato, contesto d'uso.

**Ordinamenti.** Per livello, per data di dichiarazione.

**Tag applicabili.** Lingue.

**Eventi importanti.** Dichiarazione; Modifica; Rimozione.

**Notifiche generate.** Nessuna diretta; contribuisce a notifiche di compatibilità per RichiesteDiServizio linguistiche.

**Estensioni future.** Certificazioni linguistiche formali dichiarate, con ente ed eventuale scadenza.

---

### 4. StoriaPersonale

**Descrizione.** Un racconto in prima persona del proprio percorso.

**Scopo.** Dare voce narrativa e credibilità alla Persona, alimentando la sezione Contenuti Editoriali senza duplicazione.

**Perché esiste.** Le storie sono un contenuto chiave per costruire fiducia (Costituzione, Strategia di crescita, punto 3).

**Chi la crea.** La Persona stessa (bozza); la pubblicazione può essere soggetta a revisione redazionale.

**Chi la modifica.** La Persona, per il contenuto; lo Staff, solo per moderazione/qualità editoriale.

**Chi la consulta.** Chiunque, se pubblicata.

**Relazioni logiche.** Persona (autore/soggetto); può referenziare un'Impresa (se la storia riguarda la propria impresa), un Mercato, Settori, Temi.

**Stato iniziale.** Bozza. **Stati possibili.** Bozza → In revisione → Pubblicata → Aggiornata → Archiviata. **Fine del ciclo di vita.** Archiviazione (resta nello storico ma non più in evidenza) o eliminazione su richiesta dell'autore.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Titolo del racconto | Obbligatorio | Singolo | Sì | Pubblico (se pubblicata) | Sì |
| Testo | Contenuto narrativo | Obbligatorio | Singolo | Sì | Pubblico (se pubblicata) | Sì |
| Immagine di copertina | Immagine rappresentativa | Facoltativo | Singolo | Sì | Pubblico | No |
| Data di pubblicazione | Quando la storia è stata resa pubblica | Automatico | Singolo | No | Pubblico | No |
| Impresa collegata | Riferimento opzionale all'Impresa di cui si racconta la crescita | Facoltativo | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Deve avere sempre un autore.
- Titolo e testo non vuoti per poter essere pubblicata.
- Se collegata a un'Impresa, l'autore deve avere (o avere avuto) un'Appartenenza verso quell'Impresa.

**Regole di visibilità.** In stato Bozza/In revisione, visibile solo all'autore e allo Staff.

**Metadati aggiuntivi.** Motivazione di eventuale rifiuto in fase di revisione.

**Ricerca.** Ricercabile per titolo, testo, temi/settori/mercati collegati, nome dell'autore. In risultati: titolo, estratto, autore, immagine. Filtri: tema, settore, mercato, territorio.

**Ordinamenti.** Per data di pubblicazione, per rilevanza, per popolarità (se in futuro introdotte metriche di lettura).

**Tag applicabili.** Temi, Settori, Mercati, Territori.

**Eventi importanti.** Creazione bozza; Invio in revisione; Pubblicazione; Aggiornamento; Archiviazione; Eliminazione.

**Notifiche generate.** Verso chi segue l'autore (se introdotto il concetto di "seguire" una Persona); verso lo Staff alla sottomissione per revisione.

**Estensioni future.** Commenti dei lettori; traduzione in più lingue; collegamento a più imprese nel tempo (percorso pregresso).

---

## Dominio: IMPRESE & ORGANIZZAZIONI

### 5. Impresa

**Descrizione.** Il soggetto economico (azienda, cooperativa, studio professionale, attività economica) come strumento della/e persona/e che la animano.

**Scopo.** Dare identità pubblica e credibilità all'attività economica.

**Perché esiste.** L'impresa deve essere visibile, ricercabile e collegabile a opportunità e servizi, restando sempre riconducibile a chi la anima (Costituzione, "l'impresa è strumento della persona").

**Chi la crea.** Una Persona, che assume automaticamente un ruolo di Appartenenza abilitante (es. titolare) al momento della creazione.

**Chi la modifica.** Le Persone con Appartenenza attiva e ruolo abilitante.

**Chi la consulta.** Chiunque, per i dati pubblici; lo Staff, per moderazione.

**Relazioni logiche.** Collegata a una o più Persone tramite Appartenenza. Autrice di Opportunità, OffertaDiServizio, RichiestaDiServizio. Soggetto di PresenzaDiMercato. Può essere oggetto di un accordo Partner.

**Stato iniziale.** Bozza.

**Stati possibili.** Bozza → Pubblicata → Aggiornata (ciclicamente) → Archiviata/Cessata.

**Fine del ciclo di vita.** Archiviazione quando l'attività cessa, dichiarata da chi ha ruolo abilitante, oppure per moderazione.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Nome | Denominazione dell'impresa | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Identificativo pubblico | Identificativo leggibile univoco | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione | Presentazione dell'attività | Facoltativo | Singolo | Sì | Pubblico | No |
| Forma giuridica o tipo | Es. società, cooperativa, studio professionale, ditta individuale (dichiarato) | Facoltativo | Singolo | Sì | Pubblico | No |
| Anno di fondazione | Anno indicativo | Facoltativo | Singolo | Sì | Pubblico | No |
| Dimensione indicativa | Fascia dimensionale dichiarata | Facoltativo | Singolo | Sì | Pubblico | No |
| Localizzazione | Sede/i (città, provincia, regione, paese) | Facoltativo | Multiplo (più sedi possibili) | Sì | Pubblico | No |
| Contatti | Telefono, email, sito web, social | Facoltativo | Multiplo | Sì | Pubblico o Utenti registrati, a scelta per canale | No |
| Logo e immagini | Logo, eventuale galleria | Facoltativo | Multiplo | Sì | Pubblico | No |
| Settori dichiarati | Uno o più settori di attività | Obbligatorio (almeno uno) | Multiplo | Sì | Pubblico | No |
| Stato attivo | Visibilità pubblica corrente | Obbligatorio | Singolo | Solo tramite eventi di ciclo di vita | Pubblico (effetto) | Sì |

**Validazioni funzionali**
- Un'Impresa deve avere sempre almeno un referente attivo (almeno un'Appartenenza attiva con ruolo abilitante): un'impresa senza alcuna persona collegata non può esistere.
- Deve dichiarare almeno un settore.
- Il nome non può essere vuoto.
- Non può essere pubblicata se in stato di completamento insufficiente (nome o settore mancanti).

**Regole di visibilità.** I singoli canali di contatto sono a discrezione del titolare (pubblico o utenti registrati); lo stato attivo è gestito dall'amministrazione/eventi di ciclo di vita ma il suo valore corrente è sempre visibile pubblicamente.

**Metadati aggiuntivi.** Motivazione di cessazione/archiviazione, dichiarata da chi archivia.

**Ricerca.** Ricercabile per nome, descrizione, settori, mercati (derivati da PresenzaDiMercato), localizzazione. In risultati: nome, settori, localizzazione sintetica, logo. Filtri: settore, mercato, territorio, dimensione, forma giuridica.

**Ordinamenti.** Per rilevanza; per data di pubblicazione/fondazione; alfabetico; per distanza geografica; per numero di opportunità/servizi attivi (proxy di vitalità).

**Tag applicabili.** Settori, Mercati (tramite PresenzaDiMercato), Territori.

**Eventi importanti.** Creazione; Pubblicazione; Aggiornamento; Cambio di referente (nuova/terminata Appartenenza); Archiviazione/Cessazione; Eliminazione.

**Notifiche generate.** Verso i referenti, per candidature/manifestazioni su opportunità pubblicate a nome dell'impresa; verso chi segue settore/mercato dell'impresa, alla pubblicazione.

**Estensioni future.** Verifica camerale/documentale; punteggio o badge di affidabilità; dati economici aggregati per fascia; certificazioni aziendali (qualità, sostenibilità).

---

### 6. OrganizzazioneIstituzionale

**Descrizione.** Il soggetto non economico: associazione, ente, istituzione, ambasciata, camera di commercio, fondazione.

**Scopo.** Dare identità e canale di comunicazione a soggetti che generano credibilità, contenuti e partnership più che transazioni economiche dirette.

**Perché esiste.** La Costituzione distingue esplicitamente questi soggetti dalle imprese economiche, pur trattandoli con una struttura analoga.

**Chi la crea / modifica.** Come Impresa: una Persona rappresentante con Appartenenza abilitante crea; le Persone con ruolo abilitante modificano.

**Chi la consulta.** Chiunque, per i dati pubblici.

**Relazioni logiche.** Come Impresa: collegata a Persone tramite Appartenenza; può pubblicare ContenutoEditoriale ed Evento a proprio nome; può diventare Partner.

**Stato iniziale / Stati possibili / Fine del ciclo di vita.** Identici a Impresa.

**Attributi.** Sostanzialmente analoghi a Impresa (Nome, Identificativo pubblico, Descrizione, Anno di fondazione, Localizzazione, Contatti, Logo e immagini, Stato attivo — stessa natura e visibilità), con le seguenti differenze:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Tipo di organizzazione | Associazione, ente pubblico, istituzione, ambasciata/consolato, camera di commercio, fondazione, altro | Obbligatorio | Singolo | Sì | Pubblico | No |
| Ambito di attività | Descrizione della missione/ambito | Facoltativo | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Deve avere sempre almeno un referente attivo, come l'Impresa.
- Deve dichiarare un tipo di organizzazione valido.

**Ricerca.** Ricercabile per nome, tipo di organizzazione, ambito di attività, mercati/territori collegati. Filtri: tipo di organizzazione, territorio, mercato.

**Tag applicabili.** Territori, Mercati, Temi (più rilevanti dei Settori economici per questo tipo di soggetto, sebbene non esclusi).

**Eventi importanti / Notifiche generate.** Come Impresa; inoltre notifiche verso i propri membri/seguaci alla pubblicazione di un Evento o ContenutoEditoriale.

**Estensioni future.** Verifica dello status istituzionale/giuridico; area riservata per i propri membri.

---

## Dominio: APPARTENENZA

### 7. Appartenenza

**Descrizione.** Il legame nel tempo tra una Persona e un'Impresa/OrganizzazioneIstituzionale, con un ruolo.

**Scopo.** Rendere esplicito, qualificato e storicizzabile "chi anima cosa".

**Perché esiste.** È il dominio connettivo che realizza concretamente il principio "l'impresa è strumento della persona" (Domain Model, Aggregati).

**Chi la crea.** Una Persona con ruolo abilitante nell'Impresa/Organizzazione (invito), oppure la Persona stessa al momento della creazione di una nuova Impresa/Organizzazione (auto-assegnazione del ruolo fondativo).

**Chi la modifica.** Chi detiene un ruolo abilitante (per i ruoli altrui) e la Persona stessa (per accettare/rifiutare/terminare la propria).

**Chi la consulta.** Pubblicamente visibile se relativa a un'Impresa/Organizzazione pubblica (mostra "chi fa parte di"); eventuali dettagli interni restano riservati.

**Relazioni logiche.** Persona (un lato) ↔ Impresa/OrganizzazioneIstituzionale (altro lato); riferimento di ruolo a una VoceDiTassonomia di tipo Professione/Ruolo, se applicabile.

**Stato iniziale.** Proposta (se creata come invito) o Attiva (se auto-assegnata alla fondazione).

**Stati possibili.** Proposta → Attiva → Terminata. Una Persona può avere più Appartenenze, anche verso la stessa Impresa in periodi diversi.

**Fine del ciclo di vita.** Terminazione per scelta della Persona, per revoca da parte di chi ha ruolo abilitante, o per archiviazione dell'Impresa/Organizzazione collegata.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Persona di riferimento | La Persona coinvolta | Obbligatorio | Singolo | No | Solo proprietario/Impresa collegata | No |
| Impresa/Organizzazione di riferimento | L'entità collettiva coinvolta | Obbligatorio | Singolo | No | Come sopra | No |
| Ruolo | Titolare, dipendente, collaboratore, consulente, rappresentante | Obbligatorio | Singolo (per Appartenenza) | Sì | Pubblico o Utenti registrati, a scelta dell'impresa | Sì |
| Data di inizio | Inizio del periodo | Obbligatorio | Singolo | No, dopo la conferma | Come il ruolo | No |
| Data di fine | Fine del periodo, se terminata | Facoltativo | Singolo | Solo alla terminazione | Come il ruolo | No |
| È ruolo abilitante | Indica se il ruolo consente di modificare la scheda e gestire altre Appartenenze | Obbligatorio (derivato dal ruolo) | Singolo | No (deriva dal ruolo) | Amministrativo/interno | Sì |

**Validazioni funzionali**
- Deve avere sempre esattamente una Persona e un'Impresa/Organizzazione di riferimento.
- Non possono esistere due Appartenenze Attive identiche (stessa Persona, stessa Impresa, stesso ruolo) sovrapposte nello stesso periodo.
- Un'Impresa/Organizzazione deve avere sempre almeno un'Appartenenza Attiva con ruolo abilitante: la terminazione dell'ultima Appartenenza abilitante deve essere bloccata o richiedere una riassegnazione preventiva.
- La data di fine, se presente, deve essere successiva alla data di inizio.

**Regole di visibilità.** Il ruolo e il periodo sono visibili pubblicamente se l'Impresa/Organizzazione è pubblica; la Persona può scegliere di non mostrare pubblicamente Appartenenze concluse, mantenendo visibile solo quella attiva corrente.

**Metadati aggiuntivi.** Cronologia obbligatoria dei cambi di ruolo e di stato.

**Ricerca.** Non è un'entità cercata direttamente; è un filtro derivato: permette di trovare "le persone di un'impresa" e "le imprese di una persona". Filtri: ruolo, stato (attiva/passata).

**Ordinamenti.** Per data di inizio, per ruolo.

**Tag applicabili.** Nessuno proprio (eredita quelli di Persona/Impresa).

**Eventi importanti.** Proposta; Accettazione; Rifiuto; Attivazione; Cambio di ruolo; Terminazione.

**Notifiche generate.** Verso la Persona invitata (nuova proposta); verso chi ha ruolo abilitante (accettazione/rifiuto, terminazione da parte della persona); verso tutti i titolari di ruolo abilitante quando l'ultima Appartenenza abilitante sta per essere rimossa.

**Estensioni future.** Livelli di autorizzazione più granulari (es. può pubblicare opportunità ma non modificare la scheda); compenso/quota, se in futuro rilevante; visibilità differenziata per singolo ruolo.

---

## Dominio: OPPORTUNITÀ & COLLABORAZIONI

### 8. Opportunità

**Descrizione.** Una richiesta o un'offerta pubblicata: collaborazione, fornitura, personale, cliente, investimento, immobile, bando.

**Scopo.** Far incontrare domanda e offerta in modo concreto e azionabile.

**Perché esiste.** È il motore operativo della piattaforma (Costituzione, Ecosistema 3).

**Chi la crea.** Una Persona, a proprio nome o a nome di un'Impresa/Organizzazione, se ha Appartenenza abilitante.

**Chi la modifica.** L'autore/titolare pubblicante.

**Chi la consulta.** Chiunque, se pubblicata e attiva; lo Staff, per moderazione.

**Relazioni logiche.** Pubblicata da una Persona o Impresa/Organizzazione (titolare unico); riceve ManifestazioniDiInteresse; può essere collegata a Mercato, Settore.

**Stato iniziale.** Bozza.

**Stati possibili.** Bozza → Pubblicata → Con manifestazioni di interesse → Chiusa (con esito / senza esito) → Archiviata.

**Fine del ciclo di vita.** Archiviazione dopo la chiusura, o eliminazione se mai stata pubblicata.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Sintesi della richiesta/offerta | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione | Dettaglio completo | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Tipo di opportunità | Collaborazione, fornitura, personale, cliente, distribuzione, investimento, immobile, bando | Obbligatorio | Singolo | No, dopo la pubblicazione | Pubblico | No |
| Natura | Domanda oppure offerta | Obbligatorio | Singolo | No | Pubblico | No |
| Titolare pubblicante | Persona o Impresa/Organizzazione a nome di chi è pubblicata | Obbligatorio | Singolo | No | Pubblico | No |
| Data di scadenza | Termine oltre il quale l'opportunità si considera scaduta | Facoltativo | Singolo | Sì | Pubblico | No |
| Localizzazione di riferimento | Dove si svolge/è rilevante l'opportunità | Facoltativo | Singolo o multiplo | Sì | Pubblico | No |
| Requisiti | Requisiti richiesti a chi risponde | Facoltativo | Singolo | Sì | Pubblico | No |
| Modalità di contatto | Come rispondere (candidatura in piattaforma, contatto diretto) | Obbligatorio | Singolo | Sì | Pubblico | No |
| Stato | Stato corrente nel ciclo di vita | Obbligatorio | Singolo | Sì, secondo le transizioni consentite | Pubblico | Sì |
| Esito | Esito dichiarato alla chiusura | Facoltativo | Singolo | Solo alla chiusura | Solo proprietario/Amministrazione | No |

**Validazioni funzionali**
- Deve avere sempre esattamente un titolare pubblicante.
- Titolo e descrizione non vuoti per poter essere pubblicata.
- Non può ricevere nuove ManifestazioniDiInteresse se in stato Chiusa o Archiviata.
- Se ha una data di scadenza, questa deve essere futura al momento della pubblicazione.
- Il tipo "bando" richiede sempre una data di scadenza.

**Regole di visibilità.** L'elenco delle ManifestazioniDiInteresse ricevute è visibile solo al titolare (mai pubblico, per tutela di chi risponde).

**Metadati aggiuntivi.** Motivazione di chiusura (se dichiarata); numero di manifestazioni ricevute (derivato, non editabile).

**Ricerca.** Ricercabile per titolo, descrizione, tipo, requisiti. In risultati: titolo, tipo, natura, titolare, localizzazione, scadenza. Filtri: tipo di opportunità, natura, settore, mercato, territorio, stato.

**Ordinamenti.** Per data di pubblicazione (più recenti prima); per scadenza (più urgenti prima); per rilevanza; per numero di manifestazioni (in forma aggregata, come proxy di popolarità).

**Tag applicabili.** Settori, Mercati, Territori, Competenze (se richieste), Temi.

**Eventi importanti.** Creazione; Pubblicazione; Ricezione di una manifestazione di interesse; Aggiornamento; Chiusura; Archiviazione; Eliminazione.

**Notifiche generate.** Verso il titolare (nuova manifestazione, avvicinarsi della scadenza); verso chi segue settore/mercato/territorio collegato (nuova opportunità pubblicata); verso chi ha manifestato interesse (cambio di stato, chiusura).

**Estensioni future.** Budget/fascia economica indicativa; possibilità di allegare documenti; numero massimo di posizioni per opportunità di tipo "personale".

---

### 9. ManifestazioneDiInteresse

**Descrizione.** La candidatura o il contatto di una Persona/Impresa verso un'Opportunità.

**Scopo.** Collegare chi risponde a un'Opportunità, mantenendo lo storico delle risposte senza alterare l'Opportunità stessa.

**Perché esiste.** Senza questa entità, un'Opportunità non potrebbe avere più risposte distinte con stati di avanzamento propri.

**Chi la crea.** La Persona/Impresa che risponde.

**Chi la modifica.** Chi l'ha creata (fino a un certo stato) e il titolare dell'Opportunità (per aggiornarne lo stato di avanzamento).

**Chi la consulta.** Chi l'ha creata e il titolare dell'Opportunità; nessun altro.

**Relazioni logiche.** Opportunità (aggregato contenitore) ↔ Persona/Impresa (chi risponde).

**Stato iniziale.** Inviata.

**Stati possibili.** Inviata → In valutazione → Accettata / Non selezionata → Archiviata.

**Fine del ciclo di vita.** Archiviazione alla chiusura dell'Opportunità collegata, o ritiro volontario da parte di chi l'ha creata.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Opportunità di riferimento | L'Opportunità a cui risponde | Obbligatorio | Singolo | No | Solo proprietario/titolare opportunità | No |
| Autore | Persona/Impresa che risponde | Obbligatorio | Singolo | No | Come sopra | No |
| Messaggio | Testo di presentazione/motivazione | Facoltativo | Singolo | Sì, fino all'invio | Come sopra | No |
| Data di invio | Quando è stata inviata | Automatico | Singolo | No | Come sopra | No |
| Stato | Inviata/In valutazione/Accettata/Non selezionata/Archiviata | Obbligatorio | Singolo | Solo dal titolare dell'Opportunità (salvo il ritiro, che spetta all'autore) | Come sopra | Sì |

**Validazioni funzionali**
- Deve sempre riferirsi a un'Opportunità in stato Pubblicata o Con manifestazioni di interesse (non Bozza, Chiusa o Archiviata).
- Uno stesso autore non può inviare più di una manifestazione attiva sulla stessa Opportunità (può ritirarla e reinviarla).

**Regole di visibilità.** Visibile esclusivamente a chi l'ha creata e al titolare dell'Opportunità; mai pubblica, mai visibile ad altri candidati.

**Ricerca.** Non ricercabile pubblicamente; consultabile dal titolare come elenco filtrabile per stato.

**Ordinamenti.** Per data di invio, per stato.

**Tag applicabili.** Nessuno proprio (eredita quelli dell'Opportunità).

**Eventi importanti.** Invio; Valutazione; Accettazione; Non selezione; Ritiro; Archiviazione.

**Notifiche generate.** Verso il titolare dell'Opportunità (nuovo invio); verso l'autore (cambio di stato).

**Estensioni future.** Possibilità di allegare documenti (portfolio, preventivo); scambio di messaggi strutturato successivo all'invio.

---

## Dominio: MERCATI INTERNAZIONALI

### 10. Mercato

**Descrizione.** Un Paese o un'area economica trattata come ecosistema navigabile.

**Scopo.** Aggregare in un'unica lente tutto ciò che riguarda un contesto geografico/economico internazionale.

**Perché esiste.** È uno dei quattro pilastri della piattaforma (Costituzione, Identità della piattaforma).

**Chi lo crea.** Lo Staff di piattaforma (governance centrale).

**Chi lo modifica.** Lo Staff di piattaforma; i Partner con accordo attivo su quel mercato possono proporre contenuti/aggiornamenti soggetti ad approvazione.

**Chi lo consulta.** Chiunque.

**Relazioni logiche.** Riferito da PresenzaDiMercato, Opportunità, OffertaDiServizio/RichiestaDiServizio, Evento, ContenutoDiMercato; può avere Partner dedicati.

**Stato iniziale.** Proposto.

**Stati possibili.** Proposto → Attivo → (in evidenza/sponsorizzato, variante di visibilità non di stato) → In manutenzione → Attivo.

**Fine del ciclo di vita.** I Mercati non vengono tipicamente eliminati, poiché rappresentano Paesi/aree reali; possono essere rese non attive/non in evidenza se la piattaforma decide di non presidiarli più operativamente.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Nome | Nome del Paese/area | Obbligatorio | Singolo | Sì (raro) | Pubblico | No |
| Identificativo pubblico | Identificativo leggibile univoco | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione sintetica | Presentazione del mercato | Obbligatorio (per essere Attivo) | Singolo | Sì | Pubblico | No |
| Area geografica | Macro-area di appartenenza (es. Nord Africa, Africa Subsahariana, Medio Oriente, Asia, Europa dell'Est) | Obbligatorio | Singolo | Sì | Pubblico | No |
| Lingue prevalenti | Lingue principali del mercato | Facoltativo | Multiplo | Sì | Pubblico | No |
| Settori di rilievo | Settori economicamente rilevanti | Facoltativo | Multiplo | Sì | Pubblico | No |
| Note operative | Informazioni pratiche sintetiche (dettaglio maggiore delegato a ContenutoDiMercato) | Facoltativo | Singolo | Sì | Pubblico | No |
| Immagine di copertina | Immagine rappresentativa | Facoltativo | Singolo | Sì | Pubblico | No |
| In evidenza | Indica se il mercato è promosso/sponsorizzato in un dato periodo | Facoltativo | Singolo | Solo Staff | Pubblico (effetto) / Amministrazione (gestione) | Sì |

**Validazioni funzionali**
- Deve avere sempre nome e area geografica.
- Non può essere Attivo senza una descrizione sintetica minima.
- Non è ammessa la duplicazione di due Mercati con lo stesso nome/area.

**Regole di visibilità.** Interamente pubblico, salvo note interne di gestione (es. priorità di espansione), che restano Amministrazione.

**Ricerca.** Ricercabile per nome, area geografica, lingue prevalenti, settori di rilievo. In risultati: nome, area geografica, immagine, numero indicativo di Persone/Imprese collegate. Filtri: area geografica, lingua, settore.

**Ordinamenti.** Alfabetico; per numero di Persone/Imprese collegate (rilevanza/popolarità); per mercati in evidenza.

**Tag applicabili.** Lingue, Settori (come attributi propri del Mercato, non solo come classificazione esterna).

**Eventi importanti.** Creazione; Pubblicazione/Attivazione; Aggiornamento; Messa in evidenza; Messa in manutenzione; Disattivazione.

**Notifiche generate.** Verso chi ha una PresenzaDiMercato attiva o segue il mercato, per aggiornamenti rilevanti o nuovi contenuti/eventi collegati.

**Estensioni future.** Dati statistici strutturati (collegati a ReportOsservatorio); indicatori di facilità di business; normative specifiche strutturate; valuta e fuso orario.

---

### 11. PresenzaDiMercato

**Descrizione.** La relazione dichiarata tra una Persona/Impresa e un Mercato.

**Scopo.** Qualificare la natura della relazione con il mercato (esporta verso, ha sede in, cerca partner in, importa da).

**Perché esiste.** Senza questa entità, il collegamento a un Mercato sarebbe un semplice tag senza significato operativo.

**Chi la crea.** La Persona (a proprio nome o a nome di un'Impresa con Appartenenza abilitante).

**Chi la modifica.** Chi l'ha creata.

**Chi la consulta.** Chiunque, se il soggetto collegato è pubblico.

**Relazioni logiche.** Persona/Impresa ↔ Mercato.

**Stato iniziale.** Dichiarata. **Stati possibili.** Dichiarata → Attiva → Revocata. **Fine del ciclo di vita.** Revoca volontaria.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Soggetto di riferimento | Persona o Impresa/Organizzazione | Obbligatorio | Singolo | No | Pubblico | No |
| Mercato di riferimento | Il Mercato collegato | Obbligatorio | Singolo | No | Pubblico | No |
| Ruolo della relazione | Esporta verso, importa da, ha sede in, cerca partner in, altro | Obbligatorio | Singolo (per relazione; più relazioni con ruoli diversi ammesse) | Sì | Pubblico | Sì |
| Note | Dettaglio libero | Facoltativo | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Non può esistere più di una PresenzaDiMercato Attiva con lo stesso soggetto, lo stesso mercato e lo stesso ruolo della relazione.
- Il mercato di riferimento deve essere in stato Attivo.

**Ricerca.** Usata come filtro (trova Persone/Imprese per Mercato, trova Mercati per Persona/Impresa); non ricercabile come entità autonoma con testo libero.

**Ordinamenti.** Per data di dichiarazione, per ruolo della relazione.

**Tag applicabili.** Eredita quelli del Mercato collegato.

**Eventi importanti.** Dichiarazione; Modifica del ruolo; Revoca.

**Notifiche generate.** Verso chi gestisce il Mercato (Staff/Partner), quando una nuova Persona/Impresa dichiara una presenza.

**Estensioni future.** Intensità/volume dichiarato della relazione (es. fascia di fatturato export); documentazione di supporto.

---

## Dominio: SERVIZI

### 12. OffertaDiServizio (forma generica)

**Descrizione.** Un servizio offerto da una Persona/Impresa in una delle categorie verticali della piattaforma (linguistico, formativo, professionale generico, finanziario, immobiliare).

**Scopo.** Rendere trovabile e comparabile un servizio disponibile.

**Perché esiste.** La piattaforma deve accompagnare bisogni molto diversi con un linguaggio comune, per restare estendibile (Domain Model, Principio di estensibilità).

**Chi la crea.** La Persona/Impresa fornitrice.

**Chi la modifica.** Il titolare.

**Chi la consulta.** Chiunque, se attiva.

**Relazioni logiche.** Persona/Impresa (titolare); può avere QualificaDichiarata collegate; si specializza in una delle categorie verticali elencate di seguito (§12a-e).

**Stato iniziale.** Bozza.

**Stati possibili.** Bozza → Attiva → In pausa → Attiva → Archiviata.

**Fine del ciclo di vita.** Archiviazione volontaria o per cessazione del titolare.

**Attributi comuni a tutte le specializzazioni**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Nome sintetico del servizio | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione | Dettaglio del servizio offerto | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Categoria verticale | Linguistico, formativo, professionale generico, finanziario, immobiliare | Obbligatorio | Singolo | No | Pubblico | No |
| Titolare | Persona/Impresa che offre il servizio | Obbligatorio | Singolo | No | Pubblico | No |
| Modalità di erogazione | In presenza, a distanza, entrambe | Facoltativo | Singolo | Sì | Pubblico | No |
| Area di disponibilità | Territorio/mercato in cui il servizio è disponibile | Facoltativo | Multiplo | Sì | Pubblico | No |
| Fascia economica indicativa | Indicazione di massima del costo (non un prezzo vincolante) | Facoltativo | Singolo | Sì | Pubblico (se non "su richiesta") | No |
| È su richiesta | Indica se il prezzo è comunicato solo a richiesta | Facoltativo (default falso) | Singolo | Sì | Pubblico | No |
| Stato | Bozza/Attiva/In pausa/Archiviata | Obbligatorio | Singolo | Sì, secondo transizioni consentite | Pubblico | Sì |

**Validazioni funzionali comuni**
- Deve avere sempre un titolare.
- Titolo e descrizione obbligatori per poter essere Attiva.
- Deve appartenere a esattamente una categoria verticale.

**Regole di visibilità.** La fascia economica è pubblica solo se "è su richiesta" è falso.

**Ricerca.** Ricercabile per titolo, descrizione, categoria verticale. In risultati: titolo, categoria, titolare, area di disponibilità. Filtri: categoria verticale, settore, mercato, lingua, territorio, fascia economica.

**Ordinamenti.** Per rilevanza; per data di pubblicazione; per fascia economica; per distanza/territorio.

**Tag applicabili.** Settori, Mercati, Lingue, Competenze, Professioni/categorie di servizio, Territori (secondo la specializzazione).

**Eventi importanti.** Creazione; Pubblicazione/Attivazione; Aggiornamento; Messa in pausa; Archiviazione.

**Notifiche generate.** Verso chi ha pubblicato una RichiestaDiServizio compatibile; verso il titolare per nuovi contatti/candidature ricevute (tramite ManifestazioneDiInteresse, riusata anche in questo dominio).

**Estensioni future.** Listino prezzi strutturato; disponibilità a calendario; recensioni.

---

#### 12a. Specializzazione — OffertaLinguistica

Eredita interamente OffertaDiServizio (stesso scopo, ciclo di vita, metadati, visibilità salvo indicato). Attributi aggiuntivi:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Tipo di servizio linguistico | Riferimento a VoceDiTassonomia (traduzione, interpretariato, mediazione, ecc.) | Obbligatorio | Singolo | Sì | Pubblico | No |
| Lingua di partenza / Lingua di destinazione | Coppia linguistica, se il servizio la richiede | Facoltativo (dipende dal tipo) | Singolo per coppia (multiplo a livello di offerta) | Sì | Pubblico | No |
| Direzione | Mono o bidirezionale | Facoltativo (solo se ha coppia linguistica) | Singolo | Sì | Pubblico | No |
| Specializzazioni tematiche | Es. giuridico, tecnico, commerciale | Facoltativo | Multiplo | Sì | Pubblico | No |

**Validazioni aggiuntive.** Se il tipo di servizio linguistico richiede una coppia linguistica, questa deve essere presente e le due lingue devono essere diverse.

---

#### 12b. Specializzazione — OffertaFormativa

Eredita OffertaDiServizio. Attributi aggiuntivi:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Tipo di corso | Riferimento a VoceDiTassonomia (sicurezza generale, sicurezza specifica di settore, linguistico professionale, ecc.) | Obbligatorio | Singolo | Sì | Pubblico | No |
| È dichiarato obbligatorio per legge | Dichiarazione del fornitore, non verifica della piattaforma | Facoltativo | Singolo | Sì | Pubblico (con avviso di dichiarazione non verificata) | No |
| Durata in ore | Durata indicativa | Facoltativo | Singolo | Sì | Pubblico | No |
| Validità dichiarata in mesi | Validità dichiarata dell'attestato | Facoltativo | Singolo | Sì | Pubblico (con lo stesso avviso) | No |
| Fascia partecipanti | Numero minimo/massimo | Facoltativo | Singolo (composto) | Sì | Pubblico | No |
| Lingue disponibili | Lingue in cui il corso è erogabile, con livello di supporto (corso completo, supporto del formatore, interprete disponibile, materiali tradotti) | Facoltativo | Multiplo | Sì | Pubblico | No |
| Settori target | Settori per cui il corso è pensato | Facoltativo | Multiplo | Sì | Pubblico | No |
| Modalità in presenza | Presso il fornitore, presso il cliente, in cantiere/sede operativa | Facoltativo | Multiplo | Sì | Pubblico | No |

**Validazioni aggiuntive.** Se "è dichiarato obbligatorio per legge" è vero, deve essere presente un tipo di corso coerente; il minimo della fascia partecipanti non può superare il massimo.

---

#### 12c. Specializzazione — OffertaProfessionaleGenerica

Eredita OffertaDiServizio. Attributi aggiuntivi:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Categoria professionale | Riferimento a VoceDiTassonomia Professione (es. commercialista, consulente digitale, recruiter) | Obbligatorio | Singolo | Sì | Pubblico | No |
| Ambiti di intervento | Dettaglio libero o tag aggiuntivi | Facoltativo | Multiplo | Sì | Pubblico | No |

---

#### 12d. Specializzazione — OffertaFinanziaria

Eredita OffertaDiServizio. Attributi aggiuntivi:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Tipo di prodotto finanziario | Finanziamento, assicurazione, mutuo, investimento | Obbligatorio | Singolo | Sì | Pubblico | No |
| Destinatario | Persona, impresa, entrambi | Facoltativo | Singolo | Sì | Pubblico | No |
| Requisiti generali | Descrizione libera dei requisiti di accesso | Facoltativo | Singolo | Sì | Pubblico | No |

---

#### 12e. Specializzazione — OffertaImmobiliare

Eredita OffertaDiServizio. Attributi aggiuntivi:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Tipo di immobile | Prima casa, seconda casa, commerciale, industriale, terreno | Obbligatorio | Singolo | Sì | Pubblico | No |
| Finalità | Vendita, affitto, investimento | Obbligatorio | Singolo | Sì | Pubblico | No |
| Localizzazione immobile | Indirizzo/zona dell'immobile | Obbligatorio | Singolo | Sì | Pubblico a livello di zona; indirizzo esatto riservato fino al contatto | No |
| Caratteristiche sintetiche | Superficie indicativa, numero vani, altre caratteristiche descrittive | Facoltativo | Singolo/Multiplo | Sì | Pubblico | No |

**Validazioni aggiuntive.** La localizzazione immobile è sempre richiesta (a differenza della forma generica, dove l'area di disponibilità è facoltativa).

---

### 13. RichiestaDiServizio (forma generica)

**Descrizione.** Un bisogno di servizio pubblicato da una Persona/Impresa.

**Scopo.** Rendere visibile una domanda concreta di servizio, indipendente da chi potrà risponderle.

**Perché esiste.** Simmetrico a OffertaDiServizio, per completare l'incontro domanda/offerta nei Servizi — distinto da Opportunità perché specifico dei verticali di servizio, con attributi propri per tipo.

**Chi la crea.** La Persona/Impresa richiedente. **Chi la modifica.** Il titolare. **Chi la consulta.** Chiunque, se pubblicata (salvo dettagli sensibili).

**Relazioni logiche.** Persona/Impresa (titolare); riceve risposte tramite ManifestazioneDiInteresse (stesso meccanismo di Opportunità).

**Stato iniziale.** Pubblicata.

**Stati possibili.** Pubblicata → In valutazione → Assegnata → Conclusa, oppure Pubblicata → Scaduta.

**Fine del ciclo di vita.** Conclusione o scadenza, seguita da archiviazione.

**Attributi comuni**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Sintesi del bisogno | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione | Dettaglio della richiesta | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Categoria verticale | Come per OffertaDiServizio | Obbligatorio | Singolo | No | Pubblico | No |
| Titolare | Persona/Impresa richiedente | Obbligatorio | Singolo | No | Pubblico | No |
| Data di scadenza | Termine per ricevere risposte | Facoltativo | Singolo | Sì | Pubblico | No |
| Urgenza | Bassa/media/alta | Facoltativo | Singolo | Sì | Pubblico | No |
| Stato | Pubblicata/In valutazione/Assegnata/Conclusa/Scaduta | Obbligatorio | Singolo | Sì | Pubblico | Sì |

**Validazioni funzionali.** Analoghe a Opportunità: titolare unico obbligatorio; titolo e descrizione obbligatori; nessuna nuova risposta se Conclusa o Scaduta.

**Regole di visibilità, Metadati, Ricerca, Ordinamenti, Tag, Eventi importanti, Notifiche.** Analoghi a Opportunità (§8), applicati al contesto dei Servizi.

**Estensioni future.** Come OffertaDiServizio: possibilità di ricevere più proposte comparabili strutturate.

---

#### 13a-e. Specializzazioni — RichiestaLinguistica, RichiestaFormativa, RichiestaProfessionaleGenerica, RichiestaFinanziaria, RichiestaImmobiliare

Ereditano RichiestaDiServizio con attributi aggiuntivi simmetrici alle rispettive Offerte (§12a-e): stesso tipo di servizio/corso/prodotto/immobile richiesto, invece che offerto. In particolare, per **RichiestaFormativa**, attributi aggiuntivi specifici:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Gruppi linguistici richiesti | Lingua, numero di partecipanti, livello di supporto richiesto (corso completo, lingua del formatore, interprete, solo materiali, da valutare) | Facoltativo | Multiplo | Sì | Pubblico | No |
| Numero partecipanti totale | Totale complessivo previsto | Facoltativo | Singolo | Sì | Pubblico | No |
| Data preferita di inizio | Quando si vorrebbe iniziare | Facoltativo | Singolo | Sì | Pubblico | No |
| Preferenza di modalità | In presenza, a distanza, indifferente | Facoltativo | Singolo | Sì | Pubblico | No |

---

### 14. QualificaDichiarata

**Descrizione.** Una qualifica o certificazione che un fornitore di servizio dichiara di possedere.

**Scopo.** Distinguere sempre ciò che è dichiarato da ciò che è verificato.

**Perché esiste.** Valore fondante "onestà sui dati" della Costituzione (Valore 6).

**Chi la crea.** La Persona/Impresa fornitrice.

**Chi la modifica.** Il titolare, per i dati dichiarativi; lo Staff, esclusivamente per lo stato di verifica.

**Chi la consulta.** Chiunque, se il profilo/servizio collegato è pubblico.

**Relazioni logiche.** Persona/Impresa (titolare) → tipo di corso/servizio a cui si riferisce.

**Stato iniziale.** Dichiarata.

**Stati possibili.** Dichiarata → In verifica → Verificata / Rifiutata → Scaduta (se a validità temporale).

**Fine del ciclo di vita.** Scadenza o rimozione volontaria.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Nome qualifica | Denominazione dichiarata | Obbligatorio | Singolo | Sì | Pubblico | No |
| Ente rilasciante | Chi ha rilasciato la qualifica (dichiarato) | Facoltativo | Singolo | Sì | Pubblico | No |
| Data di rilascio | Quando dichiarata come rilasciata | Facoltativo | Singolo | Sì | Pubblico | No |
| Data di scadenza | Se applicabile | Facoltativo | Singolo | Sì | Pubblico | No |
| Stato di verifica | Dichiarata/in verifica/verificata/rifiutata/scaduta | Obbligatorio | Singolo | Solo dallo Staff | Pubblico (il valore, non il processo interno) | Sì |
| Note | Dettaglio libero | Facoltativo | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Il titolare non può impostare autonomamente lo stato di verifica su "Verificata": solo lo Staff può farlo.
- Se presente una data di scadenza già trascorsa, lo stato deve transitare a Scaduta.

**Regole di visibilità.** Dati dichiarativi pubblici; eventuali documenti di supporto (se introdotti in futuro) riservati ad Amministrazione.

**Metadati aggiuntivi.** Cronologia obbligatoria del processo di verifica.

**Ricerca.** Filtrabile per nome qualifica, stato di verifica (es. "solo fornitori verificati").

**Ordinamenti.** Per data di rilascio, per stato di verifica.

**Tag applicabili.** Professione/categoria di servizio a cui la qualifica si riferisce.

**Eventi importanti.** Dichiarazione; Invio a verifica; Verifica completata (esito); Scadenza; Rimozione.

**Notifiche generate.** Verso il titolare, per l'esito della verifica e per promemoria di scadenza; verso lo Staff, per nuove richieste di verifica.

**Estensioni future.** Caricamento di documenti probatori; verifica automatizzata tramite integrazione con enti terzi.

---

## Dominio: EVENTI

### 15. Evento

**Descrizione.** Un momento di aggregazione: conferenza, fiera, missione commerciale, webinar.

**Scopo.** Generare relazioni e opportunità concentrate in un momento definito.

**Perché esiste.** È una leva di crescita esplicita della Costituzione (Strategia di crescita, punto 4).

**Chi lo crea.** Una Persona, Impresa, Organizzazione o Partner.

**Chi lo modifica.** L'organizzatore.

**Chi lo consulta.** Chiunque, se pubblicato.

**Relazioni logiche.** Organizzatore (Persona/Impresa/Organizzazione/Partner); riceve Partecipazioni; può essere collegato a Mercato, Settore, Tema.

**Stato iniziale.** Programmato.

**Stati possibili.** Programmato → Pubblicato → In corso → Concluso → Archiviato.

**Fine del ciclo di vita.** Archiviazione dopo la conclusione.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Nome dell'evento | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione | Dettaglio | Obbligatorio | Singolo | Sì | Pubblico | No |
| Tipo di evento | Conferenza, fiera, missione commerciale, webinar, altro | Obbligatorio | Singolo | Sì | Pubblico | No |
| Organizzatore | Persona/Impresa/Organizzazione/Partner | Obbligatorio | Singolo | No | Pubblico | No |
| Data e ora di inizio | Quando comincia | Obbligatorio | Singolo | Sì (con cronologia se cambia dopo la pubblicazione) | Pubblico | Sì (se cambia) |
| Data e ora di fine | Quando finisce, per eventi di durata definita | Facoltativo | Singolo | Sì | Pubblico | No |
| Modalità | In presenza, online, ibrido | Obbligatorio | Singolo | Sì | Pubblico | No |
| Luogo | Indirizzo/città, se in presenza | Facoltativo (obbligatorio se la modalità prevede presenza) | Singolo | Sì | Pubblico | No |
| Link di partecipazione | Canale online, mostrato solo a chi si iscrive | Facoltativo | Singolo | Sì | Utenti registrati con Partecipazione confermata | No |
| Capienza massima | Numero massimo di partecipanti | Facoltativo | Singolo | Sì | Pubblico | No |
| Stato | Come sopra | Obbligatorio | Singolo | Sì | Pubblico | Sì |

**Validazioni funzionali**
- Deve avere sempre almeno una data (data e ora di inizio).
- Deve avere un organizzatore.
- Se la modalità prevede la presenza, deve avere un luogo.
- Non può accettare nuove Partecipazioni oltre la capienza massima, se definita.

**Regole di visibilità.** Il link di partecipazione è riservato a chi ha una Partecipazione confermata.

**Ricerca.** Ricercabile per titolo, descrizione, tipo di evento. In risultati: titolo, data, modalità, organizzatore, luogo/mercato. Filtri: tipo di evento, modalità, settore, mercato, territorio, periodo temporale.

**Ordinamenti.** Per data (i più imminenti prima); per rilevanza; per numero di partecipanti (popolarità).

**Tag applicabili.** Settori, Mercati, Temi, Territori, Lingue (lingua dell'evento).

**Eventi importanti.** Creazione; Pubblicazione; Apertura iscrizioni; Inizio; Conclusione; Archiviazione; Annullamento.

**Notifiche generate.** Verso chi si è iscritto (promemoria, variazioni di data/luogo, annullamento); verso chi segue mercato/settore collegato (nuovo evento pubblicato).

**Estensioni future.** Agenda/programma strutturato con più sessioni; biglietteria/pagamento; registrazione video post-evento.

---

### 16. Partecipazione

**Descrizione.** Il legame tra una Persona/Impresa e un Evento.

**Scopo.** Qualificare il ruolo di ciascun partecipante (iscritto, relatore, organizzatore, sponsor).

**Perché esiste.** Analogo a ManifestazioneDiInteresse per le Opportunità: dà struttura e stato a chi partecipa.

**Chi la crea.** La Persona/Impresa che si iscrive, o l'organizzatore (per relatori/sponsor invitati).

**Chi la modifica.** Chi l'ha creata (per annullare) e l'organizzatore (per confermare/gestire).

**Chi la consulta.** Il partecipante stesso e l'organizzatore; l'elenco pubblico dei partecipanti è mostrato solo se l'organizzatore lo rende pubblico (es. lista relatori, sempre pubblica; lista iscritti generici, di norma riservata).

**Relazioni logiche.** Evento (aggregato contenitore) ↔ Persona/Impresa.

**Stato iniziale.** Richiesta/Iscritta.

**Stati possibili.** Richiesta → Confermata → Presente/Assente (a consuntivo) → Archiviata.

**Fine del ciclo di vita.** Archiviazione dopo la conclusione dell'Evento.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Evento di riferimento | L'Evento collegato | Obbligatorio | Singolo | No | Solo proprietario/organizzatore | No |
| Partecipante | Persona/Impresa coinvolta | Obbligatorio | Singolo | No | Come sopra | No |
| Ruolo | Iscritto, relatore, organizzatore, sponsor | Obbligatorio | Singolo | Solo dall'organizzatore | Pubblico se relatore/sponsor/organizzatore; riservato se iscritto semplice | Sì |
| Stato | Richiesta/Confermata/Presente/Assente/Archiviata | Obbligatorio | Singolo | Sì | Come sopra | Sì |
| Data di iscrizione | Automatica | Singolo | No | Come sopra | No |

**Validazioni funzionali**
- Non può esistere più di una Partecipazione attiva per la stessa coppia Evento-partecipante.
- Non può essere Confermata se l'Evento ha raggiunto la capienza massima (salvo ruoli non soggetti a limite, es. relatore).

**Ricerca.** Non ricercabile pubblicamente come entità propria; utile come filtro interno per l'organizzatore.

**Ordinamenti.** Per data di iscrizione, per ruolo.

**Tag applicabili.** Nessuno proprio.

**Eventi importanti.** Richiesta; Conferma; Annullamento; Consuntivo presenza; Archiviazione.

**Notifiche generate.** Verso il partecipante (conferma, promemoria); verso l'organizzatore (nuova iscrizione).

**Estensioni future.** Valutazione post-evento da parte del partecipante; attestato di partecipazione.

---

## Dominio: CONTENUTI EDITORIALI

> Nota di raccordo con il dominio Persone: StoriaPersonale (§4) è a tutti gli effetti un Contenuto Editoriale nel modello di ricerca e di tag, ma la sua scheda completa resta nel dominio Persone per evitare duplicazioni, secondo il principio del Domain Model §9 ("un contenuto può appartenere a più ecosistemi senza essere duplicato").

### 17. Notizia

**Descrizione.** Contenuto di attualità.

**Scopo.** Informare, generare traffico e fiducia.

**Perché esiste.** Leva di crescita esplicita della Costituzione (Strategia di crescita, punto 3).

**Chi la crea.** Lo Staff di piattaforma, o un Partner autorizzato nel proprio ambito.

**Chi la modifica.** Chi l'ha creata; lo Staff, sempre, per moderazione.

**Chi la consulta.** Chiunque, se pubblicata.

**Relazioni logiche.** Può referenziare Mercato, Settore, Tema, Impresa, Persona (soggetti della notizia).

**Stato iniziale.** Bozza. **Stati possibili.** Bozza → In revisione → Pubblicata → Aggiornata → Archiviata. **Fine del ciclo di vita.** Archiviazione (l'eliminazione è riservata a errori editoriali gravi).

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Titolo della notizia | Obbligatorio | Singolo | Sì | Pubblico (se pubblicata) | Sì |
| Testo | Contenuto | Obbligatorio | Singolo | Sì | Pubblico (se pubblicata) | Sì |
| Immagine di copertina | Immagine rappresentativa | Facoltativo | Singolo | Sì | Pubblico | No |
| Autore editoriale | Persona/Staff/Partner che firma | Obbligatorio | Singolo | No | Pubblico | No |
| Data di pubblicazione | Automatica | Singolo | No | Pubblico | No |
| Soggetti collegati | Mercati/Imprese/Persone di cui si parla | Facoltativo | Multiplo | Sì | Pubblico | No |

**Validazioni funzionali**
- Titolo e testo obbligatori per la pubblicazione.
- Deve avere un autore editoriale.

**Regole di visibilità.** Bozza/In revisione riservata all'autore e allo Staff.

**Metadati aggiuntivi.** Cronologia delle revisioni.

**Ricerca.** Ricercabile per titolo, testo, soggetti collegati. Filtri: tema, settore, mercato, territorio, periodo.

**Ordinamenti.** Per data di pubblicazione, per rilevanza.

**Tag applicabili.** Temi, Settori, Mercati, Territori.

**Eventi importanti.** Creazione; Invio in revisione; Pubblicazione; Aggiornamento; Archiviazione.

**Notifiche generate.** Verso chi segue il tema/mercato/settore collegato.

**Estensioni future.** Commenti; newsletter automatica basata su interessi dichiarati.

---

### 18. Guida

**Descrizione.** Contenuto di approfondimento pratico/normativo.

**Scopo.** Accompagnare una decisione concreta dell'utente (es. come aprire un'impresa in un settore, come muoversi in un mercato).

Eredita per intero la struttura di Notizia (chi la crea/modifica/consulta, relazioni, ciclo di vita, validazioni, visibilità, metadati, ricerca, ordinamenti, tag, eventi, notifiche). Attributi aggiuntivi:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Ambito pratico | Es. "come aprire un'impresa nel settore X", "normativa doganale per il mercato Y" | Obbligatorio | Singolo | Sì | Pubblico | No |
| Livello di approfondimento | Sintetico/completo | Facoltativo | Singolo | Sì | Pubblico | No |

**Estensioni future.** Guide interattive (checklist, passo-passo); versioni tradotte in più lingue collegate come varianti dello stesso contenuto.

---

### 19. ContenutoDiMercato

**Descrizione.** Una Guida o una Notizia specificamente legata a un Mercato.

**Scopo.** Specializzazione di Guida/Notizia strutturalmente legata a un Mercato, distinta dal semplice tag.

Eredita Guida o Notizia (secondo il caso) con un attributo aggiuntivo obbligatorio:

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Mercato di riferimento | Il Mercato a cui il contenuto appartiene in modo strutturale (non solo taggato, ma "ospitato" nella sezione di quel mercato) | Obbligatorio | Singolo | No | Pubblico | No |

**Validazione aggiuntiva.** Il mercato di riferimento deve essere in stato Attivo.

---

## Dominio: PARTNERSHIP

### 20. Partner

**Descrizione.** L'accordo formale tra la piattaforma e un'Organizzazione/Impresa esterna.

**Scopo.** Qualificare la relazione business-to-platform.

**Perché esiste.** È distinta dal profilo pubblico dell'organizzazione: un'organizzazione può avere un profilo senza essere partner, e un accordo può esistere anche prima che il profilo pubblico sia completo.

**Chi lo crea.** Lo Staff di piattaforma, a seguito di una trattativa.

**Chi lo modifica.** Lo Staff; il soggetto esterno può proporre modifiche/rinnovi soggetti ad approvazione.

**Chi lo consulta.** Lo Staff, sempre; il soggetto esterno, per il proprio accordo; il pubblico vede solo l'effetto (badge "Partner", sezione mercato in evidenza), non i termini.

**Relazioni logiche.** Riferisce un'Impresa/OrganizzazioneIstituzionale; può riferire uno o più Mercati/Settori di ambito.

**Stato iniziale.** In trattativa.

**Stati possibili.** In trattativa → Attivo → Sospeso → Attivo → Terminato/Scaduto.

**Fine del ciclo di vita.** Terminazione o scadenza naturale dell'accordo.

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Soggetto esterno | Impresa/OrganizzazioneIstituzionale collegata | Obbligatorio | Singolo | No | Pubblico (l'esistenza dell'accordo) | No |
| Tipo di partnership | Istituzionale, commerciale, altro | Obbligatorio | Singolo | Sì | Amministrazione (mostrabile pubblicamente secondo policy editoriale) | No |
| Ambito | Mercati/Settori/Temi su cui si applica l'accordo | Facoltativo | Multiplo | Sì | Pubblico | No |
| Periodo di validità | Data di inizio/fine | Obbligatorio (data di inizio) | Singolo | Sì | Amministrazione | No |
| Termini dell'accordo | Dettaglio contrattuale | Facoltativo | Singolo | Sì | Amministrazione (mai pubblico) | No |
| Stato | In trattativa/Attivo/Sospeso/Terminato/Scaduto | Obbligatorio | Singolo | Sì | Pubblico (l'effetto) | Sì |

**Validazioni funzionali**
- Deve sempre riferire un'unica Impresa/Organizzazione.
- Non può essere Attivo senza un periodo di validità con data di inizio definita.

**Regole di visibilità.** L'esistenza e l'ambito pubblico del partenariato sono pubblici (badge, sezione dedicata); i termini contrattuali sono sempre Amministrazione.

**Metadati aggiuntivi.** Cronologia dei rinnovi.

**Ricerca.** Filtrabile per tipo di partnership e ambito (per mostrare, ad esempio, tutti i Partner di un Mercato).

**Ordinamenti.** Per data di attivazione, per ambito.

**Tag applicabili.** Mercati, Settori, Temi (come ambito).

**Eventi importanti.** Apertura trattativa; Attivazione; Sospensione; Rinnovo; Terminazione/Scadenza.

**Notifiche generate.** Verso il soggetto esterno (attivazione, promemoria di scadenza/rinnovo); verso lo Staff (richieste di rinnovo).

**Estensioni future.** Livelli/piani di partnership con diritti differenziati; reportistica dedicata per il partner.

---

## Dominio: OSSERVATORIO

### 21. ReportOsservatorio

**Descrizione.** Un contenuto statistico/analitico su un settore, mercato o fenomeno.

**Scopo.** Sintetizzare dati aggregati provenienti da altri domini in un formato leggibile.

**Perché esiste.** Valore analitico e istituzionale della piattaforma (Ecosistema Mercati Internazionali; monetizzazione tramite report premium).

**Chi lo crea.** Lo Staff di piattaforma, con eventuale contributo di Partner/enti.

**Chi lo modifica.** Lo Staff.

**Chi lo consulta.** Chiunque, per i report pubblici; solo utenti registrati o partner autorizzati, per report riservati/premium.

**Relazioni logiche.** Riferisce uno o più Mercati/Settori/Temi.

**Stato iniziale.** Bozza. **Stati possibili.** Bozza → Pubblicato → Aggiornato → Archiviato. **Fine del ciclo di vita.** Archiviazione quando i dati diventano obsoleti (mai eliminazione, per continuità storica).

**Attributi**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Titolo | Titolo del report | Obbligatorio | Singolo | Sì | Pubblico | No |
| Sintesi | Estratto leggibile pubblicamente | Obbligatorio | Singolo | Sì | Pubblico | No |
| Contenuto completo | Dettaglio analitico | Facoltativo | Singolo | Sì | Secondo il livello di accesso dichiarato | No |
| Periodo di riferimento | Intervallo temporale a cui si riferiscono i dati | Obbligatorio | Singolo | No | Pubblico | No |
| Livello di accesso | Pubblico, utenti registrati, riservato (premium/partner) | Obbligatorio | Singolo | Sì | Amministrazione | No |
| Fonte dei dati | Dichiarazione della provenienza dei dati aggregati | Obbligatorio | Singolo | Sì | Pubblico | No |

**Validazioni funzionali**
- Deve dichiarare sempre una fonte dei dati.
- Deve riferirsi ad almeno un Mercato, Settore o Tema.

**Regole di visibilità.** Secondo il livello di accesso dichiarato per singolo report.

**Ricerca.** Ricercabile per titolo, sintesi, mercato/settore/tema collegato, periodo di riferimento.

**Ordinamenti.** Per data di pubblicazione, per periodo di riferimento, per mercato/settore.

**Tag applicabili.** Mercati, Settori, Temi.

**Eventi importanti.** Creazione; Pubblicazione; Aggiornamento (nuova rilevazione); Archiviazione.

**Notifiche generate.** Verso chi segue il Mercato/Settore collegato o ha un abbonamento/partnership con accesso a report riservati.

**Estensioni future.** Dati interattivi/grafici collegati a fonti aggiornate automaticamente; abbonamento dedicato ai report.

---

## Dominio: TASSONOMIA CONDIVISA

### 22. VoceDiTassonomia (forma generica)

**Descrizione.** Una voce di catalogo condiviso: lingua, settore, competenza, tema, professione/categoria di servizio, territorio.

**Scopo.** Fornire un riferimento stabile e univoco a cui ogni altro dominio si collega.

**Perché esiste.** È il tessuto connettivo che evita duplicazioni e rende possibile la ricerca trasversale (Domain Model §9).

**Chi la crea / modifica.** Esclusivamente lo Staff di piattaforma (governance centrale).

**Chi la consulta.** Chiunque: le voci attive sono di fatto pubbliche, essendo usate come filtri di ricerca.

**Relazioni logiche.** Referenziata da qualunque altra entità della piattaforma che necessiti di un tag trasversale.

**Stato iniziale.** Proposta.

**Stati possibili.** Proposta → Attiva → Deprecata.

**Fine del ciclo di vita.** Una voce non viene mai eliminata definitivamente se già referenziata da contenuti esistenti (per non lasciare riferimenti orfani): viene Deprecata (non più selezionabile per nuovi contenuti, ma resta visibile su quelli storici che la referenziano).

**Attributi comuni**

| Nome | Significato | Obbligatorio | Valore | Modificabile | Visibilità | Cronologia |
|---|---|---|---|---|---|---|
| Categoria di tassonomia | Lingua/Settore/Competenza/Tema/Professione/Territorio | Obbligatorio | Singolo | No | Pubblico | No |
| Identificativo pubblico | Identificativo univoco all'interno della categoria | Obbligatorio | Singolo | Sì (raro) | Pubblico | No |
| Nome | Etichetta leggibile | Obbligatorio | Singolo | Sì | Pubblico | Sì |
| Descrizione | Dettaglio facoltativo | Facoltativo | Singolo | Sì | Pubblico | No |
| Ordine di visualizzazione | Per liste ordinate manualmente (es. lingue più comuni prima) | Facoltativo | Singolo | Sì | Pubblico (effetto) / Amministrazione (gestione) | No |
| Stato | Proposta/Attiva/Deprecata | Obbligatorio | Singolo | Sì | Pubblico | Sì |

**Validazioni funzionali**
- Non possono esistere due voci attive con lo stesso nome all'interno della stessa categoria di tassonomia.
- Una voce Deprecata non può essere selezionata per nuove associazioni, ma resta valida su quelle esistenti.

**Regole di visibilità.** Interamente pubblica (è vocabolario di navigazione).

**Ricerca.** Le voci di tassonomia sono esse stesse i filtri di ricerca principali di tutta la piattaforma (Domain Model §11); sono inoltre selezionabili in autocompletamento quando un utente compila un attributo taggato.

**Ordinamenti.** Per ordine di visualizzazione, alfabetico, per frequenza d'uso (popolarità).

**Tag applicabili.** Non ha tag proprie: è essa stessa un tag.

**Eventi importanti.** Proposta; Attivazione; Rinomina; Deprecazione.

**Notifiche generate.** Nessuna verso utenti finali; verso lo Staff in caso di proposta di nuova voce da parte della community (estensione futura).

**Estensioni future.** Possibilità per utenti qualificati di proporre nuove voci soggette ad approvazione; relazioni gerarchiche tra voci (es. un settore con sotto-settori); traduzioni della stessa voce in più lingue di interfaccia.

**Attributi propri per specializzazione (oltre a quelli comuni):**

| Specializzazione | Attributi aggiuntivi |
|---|---|
| Lingua | Codice lingua (riferimento standard); Direzione di scrittura (sinistra-destra / destra-sinistra) |
| Settore | Nessuno oltre ai comuni |
| Competenza | Ambito di riferimento (es. tecnico, gestionale, linguistico), come ulteriore classificazione facoltativa |
| Tema | Nessuno oltre ai comuni |
| Professione / Categoria di servizio | Categoria verticale di riferimento (a quale sotto-dominio di Servizi appartiene tipicamente) |
| Territorio | Livello (città/provincia/regione); Riferimento al territorio superiore (una città appartiene a una provincia, una provincia a una regione) |

---

## Conclusione

Ogni scheda di questo documento definisce, per ciascuna entità del Domain Model, cosa deve esistere e quali informazioni deve contenere: descrizione, scopo, chi crea/modifica/consulta, relazioni, ciclo di vita completo, attributi con tutte le loro proprietà funzionali, validazioni, visibilità, metadati, ricerca, ordinamenti, tag, eventi e notifiche, estensioni future.

Nessuna scelta tecnica è stata anticipata: la traduzione di questo documento in un database, in API, in un frontend, in un sistema di permessi, in un motore di ricerca e in un sistema di notifiche è un passaggio successivo, che potrà avvenire senza dover tornare a decidere cosa significa ciascuna entità, quali informazioni porta e come si comporta nel tempo.

**Nota di continuità con il lavoro tecnico già avviato.** Come già segnalato nel Domain Model, il profilo utente attualmente esistente nel progetto (un profilo per account, senza distinzione tra Persona e Impresa) rappresenta un punto di partenza coerente ma parziale rispetto alla scheda Persona/Impresa/Appartenenza qui definita. Analogamente, il lavoro già avviato sui servizi linguistici e sulla formazione multilingue è coerente nella sostanza con le schede OffertaLinguistica, RichiestaLinguistica, OffertaFormativa, RichiestaFormativa e QualificaDichiarata qui descritte, e potrà essere ricondotto a questo modello senza perdita di significato.

