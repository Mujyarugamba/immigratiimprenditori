# Rapporto di riconciliazione dell'architettura logica

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi, indici, RLS, migration, API, componenti frontend o dettagli implementativi. Nessun codice.
> Ambito. Questo rapporto riconcilia gli 11 documenti logici di dominio già completati e il documento generale `docs/domain-model.md`, che questo stesso processo di riconciliazione ha riscritto integralmente (si veda il documento aggiornato). Non affronta il livello fisico né progetta database: la riconciliazione resta un prerequisito del livello fisico, non un suo anticipo.

---

## 1. Documenti analizzati

| # | Documento | Ruolo |
|---|---|---|
| 1 | `docs/domain-model.md` | Documento generale, sintesi autorevole — riscritto integralmente da questo processo (§14) |
| 2 | `docs/architecture/logical/persone.md` | Modello logico del dominio Persone |
| 3 | `docs/architecture/logical/imprese.md` | Modello logico del dominio Imprese |
| 4 | `docs/architecture/logical/appartenenze.md` | Modello logico del dominio Appartenenze |
| 5 | `docs/architecture/logical/mercati-internazionali.md` | Modello logico del dominio Mercati Internazionali |
| 6 | `docs/architecture/logical/opportunita.md` | Modello logico del dominio Opportunità |
| 7 | `docs/architecture/logical/collaborazioni.md` | Modello logico del dominio Collaborazioni |
| 8 | `docs/architecture/logical/professionisti.md` | Modello logico del dominio Professionisti |
| 9 | `docs/architecture/logical/eventi.md` | Modello logico del dominio Eventi |
| 10 | `docs/architecture/logical/contenuti-editoriali.md` | Modello logico del dominio Contenuti editoriali |
| 11 | `docs/architecture/logical/osservatorio.md` | Modello logico del dominio Osservatorio |
| 12 | `docs/architecture/logical/identita-accessi.md` | Modello logico del dominio Identità & Accessi |

Tutti i 12 documenti sono stati letti integralmente, incluse le tabelle, le note a piè di sezione, le liste di casi limite e le domande aperte. È stata inoltre consultata la versione storica (commit `c802354`) di `docs/domain-model.md`, poiché la versione presente nella directory di lavoro al momento dell'avvio della riconciliazione era un segnaposto privo di contenuto: la versione storica è servita da riferimento per non perdere la sintesi già approvata (mappa dei domini, sottodomini, entità, aggregati, ownership, lifecycle, ricerca, notifiche, permessi concettuali, estensibilità) e per verificare cosa fosse superato dai successivi 11 documenti specialistici e cosa restasse ancora valido.

---

## 2. Metodo di confronto

La riconciliazione ha proceduto per confronto incrociato sistematico, non per revisione isolata di ciascun documento:

1. **Estrazione strutturata** — per ciascun dominio sono stati estratti: responsabilità primaria, aggregate root, entità, value object, fatti posseduti, fatti utilizzati ma non posseduti, dipendenze dichiarate (in entrambe le direzioni), eventi di dominio, assi di stato, regole invarianti, casi limite e domande aperte (Parte 1 di questo rapporto, §3.1).
2. **Confronto terminologico incrociato** — ogni termine ricorrente (es. "Fonte", "Evidenza", "Ruolo", "Verifica", "Contestato") è stato cercato in tutti gli 11 documenti per verificare se la definizione fosse coerente, se fosse la stessa entità condivisa o un pattern ripetuto localmente, e se il dominio proprietario fosse sempre lo stesso o ambiguo.
3. **Verifica dei confini dichiarati** — ogni documento dichiara esplicitamente cosa NON rientra nel proprio dominio (sezione 1 di ciascun documento) e quali domini referenzia; questi confini sono stati confrontati a coppie per verificare simmetria e assenza di incorporazione reciproca (§6 di questo rapporto).
4. **Verifica di coerenza cronologica** — poiché i documenti sono stati scritti in sequenza (Persone → Imprese → Appartenenze → Mercati Internazionali → Opportunità → Collaborazioni → Professionisti → Eventi → Contenuti editoriali → Osservatorio → Identità & Accessi), sono stati cercati riferimenti "in avanti" non ancora risolti al momento della scrittura (domande aperte ereditate) che i documenti successivi hanno di fatto già risolto, per individuare formulazioni ormai obsolete (§5).
5. **Verifica degli assi di stato e delle verifiche** — tutti gli stati e tutte le verifiche nominati in ciascun documento sono stati raccolti in un unico elenco e confrontati per famiglia semantica, non per identità testuale, per distinguere vera incompatibilità da normale autonomia di dominio (§8, §9).
6. **Verifica degli eventi di dominio** — tutti gli eventi elencati nelle sezioni "Eventi di dominio" sono stati raccolti, confrontati per forma grammaticale (participio passato), assenza di comandi, assenza di duplicati con significato diverso, e distinzione tra evento interno e conseguenza in un altro dominio (§10).
7. **Verifica di non-incorporazione e di proprietà unica** — per ogni concetto strategico è stato verificato che un solo documento ne dichiari la proprietà sostanziale, mentre gli altri lo referenzino esplicitamente senza ridefinirlo (§3.2, §12).
8. **Correzione minima e mirata** — sono state modificate solo le frasi con una contraddizione, un'ambiguità di proprietà o un riferimento non più valido; non è stata effettuata alcuna riscrittura stilistica estesa (§14).

Il confronto è stato condotto restando sempre sul piano logico e di dominio: nessuna verifica ha riguardato o introdotto strutture tecniche.

---

## 3. Quadro generale

Il quadro complessivo che emerge dal confronto è positivo: gli 11 documenti sono stati scritti in sequenza con un continuo richiamo reciproco esplicito ("Fondamenti" in testa a ogni documento, tabelle di "confini espliciti", note di coerenza terminologica, sezioni "Perché è un dominio autonomo"), il che ha prodotto un impianto già in larga parte auto-coerente. Le incoerenze reali individuate (§4) sono poche, localizzate e di natura documentale (domande aperte non aggiornate dopo che un documento successivo le ha risolte), non concettuale: non è stata trovata alcuna vera contraddizione tra due domini su chi possiede un fatto, né alcuna sovrapposizione strutturale non dichiarata. Il documento generale `docs/domain-model.md`, che nella directory di lavoro era un segnaposto, è stato riscritto integralmente (§14) come sintesi autorevole dei 12 documenti.

### 3.1 Inventario dei domini (Parte 1)

Per ciascuno degli 11 domini: responsabilità primaria, concetto centrale, principali entità, principali value object/concetti descrittivi, fatti posseduti, fatti utilizzati ma non posseduti, dipendenze in entrata/uscita, eventi principali, assi di stato e regole invarianti principali. Verificato: ogni fatto elencato come "posseduto" ha un solo dominio proprietario (le eccezioni — Fonte/Evidenza/Verifica come pattern ripetuti, non entità condivise — sono trattate esplicitamente al §12).

**Persone** (`logical/persone.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare la Persona come soggetto sociale e anagrafico continuativo, indipendente da qualsiasi Impresa, Account o ruolo applicativo |
| Aggregate root | Persona |
| Entità principali | Persona, CompetenzaDichiarata (per riferimento a Competenza), LinguaParlata, StoriaPersonale |
| Value object / concetti descrittivi | Livello di competenza, contesto d'uso di una lingua, periodo di validità |
| Fatti posseduti | Identità sociale/anagrafica pubblica della Persona; competenze dichiarate; lingue parlate; storie personali (proprietà narrativa, non distributiva) |
| Fatti usati non posseduti | Competenza e Lingua come voci di catalogo condiviso (non definite da Persone) |
| Dipende da | Tassonomia condivisa (Competenze, Lingue) |
| Dipendono da esso | Appartenenze, Imprese, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi (tutti referenziano la Persona) |
| Eventi principali | PersonaRegistrata, ProfiloCompletato, ProfiloPubblicato, CompetenzaDichiarata, LinguaDichiarata, StoriaPersonalePubblicata, PersonaArchiviata |
| Assi di stato | Stato editoriale del profilo; stato di pubblicazione; stato della singola dichiarazione (competenza/lingua/storia) |
| Regole invarianti | Una Persona può esistere senza alcuna Appartenenza; l'origine dichiarata non implica competenza o mercato; le dichiarazioni non sono automaticamente verificate |

**Imprese** (`logical/imprese.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare il soggetto economico (identità pubblica, sedi, settori, mercati dichiarati, certificazioni, canali) |
| Aggregate root | Impresa |
| Entità principali | Impresa, SedeImpresa, SettoreImpresa, MercatoImpresa, CertificazioneImpresa, CanaleImpresa, MediaImpresa |
| Value object / concetti descrittivi | Denominazione vs nome pubblico, forma organizzativa, stato operativo |
| Fatti posseduti | Identità pubblica e presentazione dell'Impresa; sedi; settori dichiarati; certificazioni; canali; stato operativo/editoriale |
| Fatti usati non posseduti | Persone collegate (referenziate tramite Appartenenza, non possedute); Mercati (referenziati, non definiti); Territori e Settori di tassonomia condivisa |
| Dipende da | Persone (tramite Appartenenza), Appartenenze, Mercati Internazionali, Tassonomia condivisa, Identità & Accessi |
| Dipendono da esso | Opportunità, Collaborazioni, Eventi, Contenuti editoriali (StorieImpresa), Osservatorio, Mercati Internazionali, Professionisti |
| Eventi principali | ImpresaCreata, ProfiloImpresaCompletato, ImpresaPubblicata, ImpresaSospesa, ImpresaArchiviata, CertificazioneAggiunta, CertificazioneVerificata, CertificazioneScaduta |
| Assi di stato | Stato operativo (attiva/cessata); stato editoriale (bozza/completa/incompleta); stato di pubblicazione; stato di verifica (per certificazioni) |
| Regole invarianti | Un'Impresa non possiede le Persone collegate, le referenzia tramite Appartenenza; la cessazione non implica cancellazione della scheda storica |

**Appartenenze** (`logical/appartenenze.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare la relazione datata e qualificata tra una Persona e un'Impresa: ruolo, periodo, stato, titolo di rappresentanza |
| Aggregate root | Appartenenza |
| Entità principali | Appartenenza, Ruolo, Qualifica (di ruolo), Periodo, Fonte, Evidenza di verifica, Autorizzazione gestionale |
| Value object / concetti descrittivi | Decorrenza, cessazione, natura del titolo di rappresentanza |
| Fatti posseduti | Il fatto stesso della relazione Persona–Impresa; il ruolo e la sua qualifica; il titolo per agire per conto dell'Impresa (Autorizzazione gestionale) |
| Fatti usati non posseduti | Identità della Persona (Persone) e dell'Impresa (Imprese), che referenzia senza duplicare |
| Dipende da | Persone, Imprese |
| Dipendono da esso | Imprese (vista di sintesi), Identità & Accessi (titolo per l'Associazione operativa con Impresa), Opportunità, Collaborazioni (titolo per agire a nome di un'Impresa) |
| Eventi principali | AppartenenzaDichiarata, AppartenenzaConfermata, AppartenenzaVerificata, AppartenenzaContestata, AppartenenzaRevocata, AppartenenzaConclusa |
| Assi di stato | Stato della relazione (dichiarata/attiva/conclusa/revocata/contestata); stato di verifica (multi-asse, §10) |
| Regole invarianti | L'Appartenenza non contiene i dati descrittivi né della Persona né dell'Impresa; la rappresentanza non è automatica ma richiede un'Autorizzazione gestionale esplicita |

**Mercati Internazionali** (`logical/mercati-internazionali.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare il contesto economico e geografico internazionale e la relazione (presenza, interesse, attività) tra soggetti della piattaforma e quel contesto |
| Aggregate root | Mercato internazionale |
| Entità principali | Mercato internazionale, Presenza di mercato, Interesse di mercato, Attività internazionale, Esigenza di internazionalizzazione, Risorsa di supporto |
| Value object / concetti descrittivi | Ambito della presenza, natura della relazione (import/export/interesse) |
| Fatti posseduti | Definizione e confini del Mercato; la relazione dichiarata (presenza/interesse/attività) tra un soggetto e quel Mercato |
| Fatti usati non posseduti | Identità di Persone/Imprese che dichiarano una relazione (referenziate, non possedute) |
| Dipende da | Persone, Imprese, Appartenenze (per il titolo con cui una Persona dichiara per un'Impresa) |
| Dipendono da esso | Imprese (vista aggregata "chi opera in questo Mercato"), Opportunità, Collaborazioni, Eventi, Professionisti, Osservatorio |
| Eventi principali | PresenzaDiMercatoDichiarata, PresenzaDiMercatoVerificata, InteresseDiMercatoDichiarato, PresenzaDiMercatoRevocata |
| Assi di stato | Stato della relazione (dichiarata/attiva/revocata); stato di verifica |
| Regole invarianti | Il Mercato non incorpora le Imprese o le Opportunità che lo riguardano; l'origine personale non implica competenza o relazione di mercato |

**Opportunità** (`logical/opportunita.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare un beneficio o un accesso strutturato, disponibile per un periodo, che qualcuno rende disponibile ad altri |
| Aggregate root | Opportunità |
| Entità principali | Opportunità, Promotore, Destinatario potenziale, Beneficio, Requisito, Candidatura/Manifestazione di interesse |
| Value object / concetti descrittivi | Modalità di accesso, temporalità/scadenza, ammissibilità |
| Fatti posseduti | Esistenza, contenuto, requisiti, beneficio e ciclo di vita dell'Opportunità stessa |
| Fatti usati non posseduti | Identità del Promotore (Persona/Impresa), Mercato riguardato, titolo di rappresentanza (Appartenenza) |
| Dipende da | Persone, Imprese, Appartenenze, Mercati Internazionali |
| Dipendono da esso | Collaborazioni (può derivare da un'Opportunità), Eventi (può essere presentata tramite un Evento), Osservatorio |
| Eventi principali | OpportunitàPubblicata, OpportunitàModificata, CandidaturaRicevuta, OpportunitàChiusa, OpportunitàRevocata, OpportunitàAnnullata, OpportunitàArchiviata |
| Assi di stato | Stato editoriale; stato di pubblicazione; stato di ammissibilità/validità temporale; stato della singola candidatura |
| Regole invarianti | Un'Opportunità non diventa automaticamente una Collaborazione; l'accesso a un'Opportunità non è mai garantito dalla sola dichiarazione di un requisito |

**Collaborazioni** (`logical/collaborazioni.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare la ricerca, l'offerta o la relazione concreta tra soggetti che intendono sviluppare un'attività comune |
| Aggregate root | Collaborazione |
| Entità principali | Collaborazione, Soggetto coinvolto (con ruolo), Oggetto della collaborazione, Manifestazione di interesse/Candidatura, Esito |
| Value object / concetti descrittivi | Tipologia di collaborazione, condizioni, compatibilità |
| Fatti posseduti | Esistenza, natura, ciclo di vita e soggetti coinvolti della Collaborazione stessa |
| Fatti usati non posseduti | Identità dei soggetti coinvolti (Persone/Imprese), Mercato/territorio/settore di contesto, eventuale Opportunità di origine |
| Dipende da | Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità (origine opzionale) |
| Dipendono da esso | Osservatorio (dati aggregabili) |
| Eventi principali | CollaborazioneProposta, ManifestazioneInteresseRicevuta, CollaborazioneAvviata, CollaborazioneConclusa, CollaborazioneAnnullata, CollaborazioneContestata |
| Assi di stato | Stato editoriale; stato della relazione (proposta/in valutazione/avviata/conclusa/annullata); stato della singola candidatura |
| Regole invarianti | Una Collaborazione può esistere senza alcuna Opportunità di origine; candidatura, manifestazione di interesse, proposta e collaborazione attiva restano distinte |

**Professionisti** (`logical/professionisti.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare il profilo professionale di una Persona: qualifiche, titoli, iscrizioni, abilitazioni, servizi, territori, lingue operative, disponibilità |
| Aggregate root | Profilo professionale (di una Persona) |
| Entità principali | Profilo professionale, Categoria/Specializzazione, Qualifica professionale, Titolo, Iscrizione, Abilitazione, Servizio professionale |
| Value object / concetti descrittivi | Modalità di esercizio, esperienza, disponibilità |
| Fatti posseduti | Il fatto di essere Professionista; le qualifiche, i titoli, le iscrizioni, le abilitazioni e i servizi professionali dichiarati |
| Fatti usati non posseduti | Identità della Persona (Persone); eventuale contesto organizzativo (Imprese); Mercati e territori serviti |
| Dipende da | Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni |
| Dipendono da esso | Opportunità, Collaborazioni, Eventi (professionista come relatore/formatore), Osservatorio |
| Eventi principali | ProfiloProfessionaleDichiarato, QualificaAggiunta, QualificaVerificata, ProfiloProfessionalePubblicato, ProfiloProfessionaleSospeso, ProfiloProfessionaleArchiviato |
| Assi di stato | Stato del profilo (dichiarato/pubblicato/sospeso/cessato/archiviato); stato di verifica (multi-asse per qualifica/titolo/iscrizione/abilitazione) |
| Regole invarianti | Professionista è un ruolo di Persona, non un dominio di soggetti nuovi; competenza personale generica e qualifica professionale restano distinte |

**Eventi** (`logical/eventi.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare un accadimento organizzato collocato nel tempo e nello spazio, con edizioni, sessioni e partecipazione |
| Aggregate root | Evento |
| Entità principali | Evento, Edizione, Sessione, Organizzatore/Promotore, Iscrizione/Partecipazione |
| Value object / concetti descrittivi | Modalità (fisica/digitale/ibrida), ricorrenza, ruolo del partecipante |
| Fatti posseduti | Esistenza, programma, edizioni, sessioni e partecipazione dell'Evento stesso |
| Fatti usati non posseduti | Identità di organizzatori e partecipanti (Persone/Imprese/Professionisti); Opportunità e Collaborazioni eventualmente presentate o originate |
| Dipende da | Persone, Imprese, Professionisti, Mercati Internazionali, Opportunità, Collaborazioni |
| Dipendono da esso | Collaborazioni (può originarne una), Contenuti editoriali (può generare materiale narrativo), Osservatorio |
| Eventi principali | EventoPubblicato, EdizioneProgrammata, SessioneProgrammata, IscrizioneEventoConfermata, EventoConcluso, EventoCancellato, EventoArchiviato |
| Assi di stato | Stato editoriale; stato temporale (programmato/in corso/concluso); stato di verifica; stato di partecipazione |
| Regole invarianti | Un Evento non incorpora automaticamente tutte le Opportunità collegate; partecipazione all'Evento e accesso all'Opportunità restano distinti |

**Contenuti editoriali** (`logical/contenuti-editoriali.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Rappresentare contenuti narrativi e informativi che descrivono fatti di altri domini, senza modificarli |
| Aggregate root | Contenuto editoriale |
| Entità principali | Contenuto editoriale, Versione, Autore/Curatore/Responsabile editoriale, Fonte editoriale, Traduzione |
| Value object / concetti descrittivi | Tipologia editoriale, stato di validità informativa |
| Fatti posseduti | Il Contenuto stesso: testo, versioni, autorialità, traduzioni, ciclo editoriale |
| Fatti usati non posseduti | I fatti descritti (Persona, Impresa, Mercato, Evento, Opportunità...), referenziati come soggetto narrato, non modificati |
| Dipende da | Persone, Imprese, Mercati Internazionali, Opportunità, Collaborazioni, Eventi, Professionisti, Osservatorio (come soggetti narrabili) |
| Dipendono da esso | Osservatorio (in modo narrativo, non analitico), Ricerca |
| Eventi principali | ContenutoCreato, ContenutoPubblicato, ContenutoRettificato, ContenutoRitirato, ContenutoArchiviato, TraduzioneAggiunta |
| Assi di stato | Stato editoriale; stato di pubblicazione; stato di validità informativa; stato di verifica editoriale |
| Regole invarianti | Il contenuto non modifica automaticamente i fatti descritti; una dichiarazione editoriale non diventa automaticamente un fatto verificato |

**Osservatorio** (`logical/osservatorio.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Aggregare, misurare e interpretare fenomeni derivati da dati di altri domini, senza possedere né modificare i dati sorgente |
| Aggregate root | Indicatore |
| Entità principali | Fenomeno osservato, Indicatore, Valore dell'indicatore, Fonte (dati), Rapporto/Dossier |
| Value object / concetti descrittivi | Dimensione di analisi, unità di misura, livello di aggregazione |
| Fatti posseduti | La metodologia, il calcolo, la versione e la pubblicazione di ogni Indicatore e dei relativi Valori; i prodotti analitici (Rapporto, Dossier) |
| Fatti usati non posseduti | I dati operativi sorgente di tutti gli altri domini, che aggrega senza mai modificarli |
| Dipende da | Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Contenuti editoriali |
| Dipendono da esso | Contenuti editoriali (per la divulgazione narrativa dei risultati), Ricerca |
| Eventi principali | IndicatorePubblicato, ValoreIndicatoreCalcolato, ValoreIndicatoreRevisionato, RapportoPubblicato, IndicatoreContestato |
| Assi di stato | Stato di elaborazione; stato di verifica metodologica; stato di pubblicazione; stato di validità temporale |
| Regole invarianti | L'Osservatorio non modifica i dati sorgente; misura e interpretazione restano distinte; l'aggregazione non deve permettere la reidentificazione di soggetti individuali |

**Identità & Accessi** (`logical/identita-accessi.md`)
| Attributo | Contenuto |
|---|---|
| Responsabilità primaria | Decidere chi accede, con quale identità digitale, per conto di chi, con quale titolo, a quali risorse logiche, entro quali limiti |
| Aggregate root | Account |
| Entità principali | Identità digitale, Account, Metodo di autenticazione, Delega, Consenso, Sessione concettuale, Evento di sicurezza |
| Value object / concetti descrittivi | Ruolo applicativo, Permesso, Contesto di azione, Politica di accesso |
| Fatti posseduti | Identità digitale, Account, credenziali, ruoli applicativi, permessi, deleghe, consensi, sessioni, decisioni di accesso |
| Fatti usati non posseduti | Fatti sostanziali di tutti gli altri domini (chi è una Persona, chi possiede un'Impresa, chi è Professionista...), che applica senza possedere |
| Dipende da | Persone (associazione Account–Persona), Imprese, Appartenenze (titolo per agire per un'Impresa), Professionisti (stato di verifica), Contenuti editoriali (ruoli editoriali), Osservatorio (accesso a dati riservati) |
| Dipendono da esso | Tutti gli 11 domini (per applicare le rispettive regole di visibilità/accesso, senza che questo dominio ne diventi proprietario) |
| Eventi principali | AccountRegistrato, AccountAttivato, AccountAssociatoAPersona, RuoloApplicativoAssegnato, DelegaConcessa, DelegaRevocata, ConsensoEspresso, ConsensoRevocato, AccountSospeso, AccountChiuso |
| Assi di stato | Stato dell'Account; stato dell'identità digitale; stato dei metodi di autenticazione; stato delle deleghe; stato dei consensi; stato di sicurezza (8 assi indipendenti, §11) |
| Regole invarianti | L'accesso non crea diritti sostanziali; un ruolo applicativo non equivale a una qualifica di dominio; la visibilità è stabilita dal dominio proprietario, non da questo dominio |

### 3.2 Matrice delle responsabilità (Parte 2)

Legenda: PER=Persone, IMP=Imprese, APP=Appartenenze, MER=Mercati Internazionali, OPP=Opportunità, COL=Collaborazioni, PRO=Professionisti, EVE=Eventi, CE=Contenuti editoriali, OSS=Osservatorio, IA=Identità & Accessi. "Descrivere" indica una rappresentazione narrativa (tipicamente CE), non una modifica del fatto. "Applicare visibilità/accesso" è sempre IA, per principio architetturale (§8 di `docs/domain-model.md` riscritto); è indicato comunque in ogni riga per completezza della matrice richiesta.

| Concetto | Dominio proprietario | Può referenziarlo | Può descriverlo (narrativamente) | Può verificarne aspetti | Può aggregarne i dati | Applica visibilità/accesso | Non deve modificarlo |
|---|---|---|---|---|---|---|---|
| Persona | PER | tutti gli altri 10 domini | CE | IA (identità), PRO (qualifiche), APP (relazione) — ciascuno un aspetto proprio, non "la Persona" | OSS | IA | tutti gli altri 10 domini |
| Impresa | IMP | tutti gli altri 10 domini | CE | APP (relazione/rappresentanza), MER (presenza dichiarata) | OSS, MER | IA | tutti gli altri 10 domini |
| Appartenenza | APP | IMP (vista sintetica), IA, OPP, COL | CE (raro, non tipico) | APP stessa (multi-asse), IA (titolo per decisione di accesso) | OSS | IA | IMP, PER, IA |
| Profilo professionale | PRO | OPP, COL, EVE, MER | CE | PRO stesso (multi-asse titoli/iscrizioni/abilitazioni) | OSS | IA | PER, IMP |
| Opportunità | OPP | COL (origine), EVE (presentazione), MER | CE | OPP stessa | OSS | IA | COL, EVE |
| Collaborazione | COL | OPP (non incorpora), EVE (occasione) | CE | COL stessa | OSS | IA | OPP, EVE |
| Evento | EVE | OPP, COL, PRO | CE | EVE stesso | OSS | IA | OPP, COL |
| Edizione | EVE (componente di Evento) | come Evento | CE | EVE stesso | OSS | IA | domini esterni a EVE |
| Sessione di Evento | EVE (componente di Evento) | come Evento | CE | EVE stesso | OSS | IA | domini esterni a EVE |
| Mercato internazionale | MER | IMP, OPP, COL, EVE, PRO | CE | MER stesso | OSS | IA | IMP, OPP, COL, EVE, PRO |
| Contenuto editoriale | CE | OSS (divulgazione), tutti i domini narrati (come soggetto) | — (è il mezzo stesso di descrizione) | CE stesso (editoriale/metodologica) | OSS, Ricerca (generico) | IA | tutti i domini descritti |
| Fonte | Nessun proprietario unico: pattern locale ripetuto in APP, MER, OPP, COL, PRO, EVE, CE, OSS, IA | il dominio che la definisce | CE (se citata in un contenuto) | il dominio che la definisce | OSS | IA | domini diversi da quello che la definisce |
| Indicatore | OSS | CE (divulgazione) | CE | OSS stesso | OSS (self) | IA | domini sorgente |
| Valore dell'indicatore | OSS | CE | CE | OSS stesso | OSS (self) | IA | domini sorgente |
| Account | IA | tutti (per associazione) | — | IA stesso | — (non modellato come oggetto di Osservatorio) | IA (self) | tutti i domini di business |
| Identità digitale | IA | tutti (indirettamente, tramite Account) | — | IA stesso | — | IA (self) | tutti i domini di business |
| Delega | IA | APP, IMP (per titolo compatibile) | — | IA stesso | — | IA (self) | APP, IMP |
| Consenso | IA | tutti i domini con una finalità di trattamento | — | IA stesso | — | IA (self) | tutti i domini di business |
| Ruolo applicativo | IA | CE (funzione editoriale), tutti | — | IA stesso | — | IA (self) | APP (Ruolo di dominio), PRO (Qualifica professionale) |
| Qualifica professionale | PRO | OPP, COL, EVE, MER | CE | PRO stesso | OSS | IA | IA (non la crea), APP (Qualifica di ruolo resta distinta) |
| Rappresentanza (Titolo di rappresentanza) | APP | IMP, OPP, COL | CE (raro) | APP stesso; IA la verifica come condizione di accesso, senza crearla | OSS | IA | IA (non la crea) |
| Partecipazione | EVE | OPP, COL (distinta da candidatura/manifestazione di interesse) | CE | EVE stesso | OSS | IA | OPP, COL (che mantengono propri concetti distinti: Candidatura, Manifestazione di interesse) |
| Storia personale | PER (proprietà sostanziale) | CE (tipo di contenuto distribuito) | CE | PER/CE (verifica editoriale della forma, non della sostanza) | OSS | IA | CE (non modifica il fatto sostanziale della Persona) |
| Storia di Impresa | CE (proprietà editoriale, a differenza della Storia personale) | IMP (soggetto raccontato) | CE | CE stesso | OSS | IA | IMP (non modifica il Contenuto), CE (non modifica l'Impresa) |
| Traduzione | CE | tutti i contenuti multilingue | CE | CE stesso | — | IA | — |
| Verifica | Nessun proprietario unico: pattern locale, ciascun dominio verifica i propri fatti (APP §10, MER §10, OPP §11, COL §12, PRO §11, EVE §12, CE §11/§13, OSS §10, IA §10) | il dominio che la esegue | CE (se il risultato è narrato) | il dominio che la esegue | OSS | IA (la considera come condizione di una decisione di accesso, senza gestirne il processo) | domini diversi da quello che la esegue |
| Visibilità | Nessuna entità unica: principio distribuito — ogni dominio proprietario stabilisce la visibilità sostanziale del proprio fatto | tutti (ogni dominio la dichiara per i propri fatti) | — | il dominio proprietario del fatto | — | IA (applica, non possiede, §7 `identita-accessi.md`) | IA (non ridefinisce la visibilità sostanziale) |

**Esito della verifica di proprietà unica (Parte 1, richiesta di verifica finale).** Ogni concetto della matrice ha un proprietario sostanziale unico e identificabile, con due categorie esplicitamente riconosciute come eccezione consapevole e non come errore: **Fonte** e **Verifica** sono pattern concettuali ripetuti localmente in ciascun dominio (ogni dominio possiede le proprie Fonti e le proprie Verifiche sui propri fatti, senza che esista un'entità condivisa "Fonte" o "Verifica" sovraordinata); **Visibilità** è un principio, non un'entità, distribuito per costruzione tra dominio proprietario (che la stabilisce) e Identità & Accessi (che la applica). Nessuna di queste eccezioni produce ambiguità, perché in nessun caso due domini rivendicano la proprietà dello stesso fatto specifico.

---

## 4. Incoerenze trovate

### 4.1 Incoerenze reali (richiedono correzione)

| # | Incoerenza | Dove | Natura |
|---|---|---|---|
| 1 | `docs/domain-model.md` presente nella directory di lavoro come segnaposto senza contenuto, mentre i riferimenti "Fondamenti" in testa a `persone.md`, `opportunita.md`, `identita-accessi.md` e altri lo citano come se contenesse la sintesi generale | `docs/domain-model.md` | Gap architetturale: il documento generale non rispecchiava più gli 11 documenti specialistici |
| 2 | Quattro documenti (`imprese.md`, `mercati-internazionali.md`, `opportunita.md`, `collaborazioni.md`) contengono ancora la domanda aperta "Professionisti, se confermato come dominio distinto", benché `professionisti.md` abbia già risolto la domanda confermandolo come dominio autonomo | `imprese.md` §1/§12/§14, `mercati-internazionali.md` §6, `opportunita.md` §1/§15, `collaborazioni.md` §1/§6/§15 | Obsolescenza documentale: una domanda aperta ereditata non è stata aggiornata dopo che un documento successivo l'ha risolta |

### 4.2 Differenze legittime (non richiedono correzione, solo documentazione)

| # | Osservazione | Dove | Perché non è un'incoerenza |
|---|---|---|---|
| 1 | Il dominio "Servizi" (con le sue specializzazioni: professionali generici, formazione e sicurezza, linguistici e interculturali, finanziari, immobiliare, utility) è ancora citato da più documenti (`professionisti.md` §7, riferimenti impliciti in `opportunita.md`, `collaborazioni.md`, `mercati-internazionali.md`) come dominio della Costituzione/Domain Model v1, ma non ha ancora un proprio documento logico dedicato tra gli 11 | Trasversale | Non è una contraddizione tra i documenti esistenti (tutti lo trattano in modo reciprocamente coerente, distinguendolo correttamente da Professionisti), ma un'area del Domain Model non ancora elaborata a livello logico di dettaglio — trattata al §13 di questo rapporto come dominio futuro candidato, non forzata in una nuova modellazione qui |
| 2 | Le "Organizzazioni istituzionali" non economiche (associazioni, camere di commercio, ambasciate, enti pubblici) compaiono come riferimenti esterni in più documenti (`mercati-internazionali.md` §6 "Risorsa di supporto", `eventi.md` §5, `imprese.md` §2 "ente economico") senza un singolo dominio che ne dichiari la proprietà di una eventuale scheda propria | Trasversale | Non è una contraddizione: nessun documento rivendica la proprietà di questo fatto, e tutti lo trattano coerentemente come riferimento esterno alla piattaforma. È un vuoto di modellazione futura, non un conflitto — trattato al §12 di questo rapporto |
| 3 | `eventi.md` §10 dichiara che un Evento può generare una Collaborazione (CollaborazioneGeneraDaEvento) e che Opportunità ed Eventi possono referenziarsi reciprocamente, ma `collaborazioni.md` (scritto prima di `eventi.md`) modella esplicitamente solo l'Opportunità come possibile origine di una Collaborazione, non l'Evento | `eventi.md` §10, `collaborazioni.md` §2/§4 | Non è una contraddizione: la relazione Evento→Collaborazione è narrativa/contestuale ("in occasione di"), non strutturale come quella con Opportunità; `collaborazioni.md` non nega la possibilità, semplicemente non la formalizza. Segnalata come possibile miglioramento editoriale futuro non urgente, non come errore da correggere ora |
| 4 | `imprese.md` continua a usare il nome locale "AppartenenzaImpresa" per la relazione Persona–Impresa, mentre `appartenenze.md` (documento successivo e autoritativo) usa "Appartenenza" | `imprese.md`, in tutto il documento | Già riconosciuto e reciprocamente referenziato dai due documenti stessi (`appartenenze.md` nota di apertura e §15; `imprese.md` come vista di sintesi non contraddittoria): è una differenza di vista (sintesi locale vs. modello autoritativo), non un conflitto di significato. Trattata nel glossario (§7) affinché non sia percepita come ambiguità |
| 5 | Lo stato "Contestato/a" appare sia come asse di verifica di un fatto sostanziale (Appartenenza, Mercato, Opportunità, Collaborazione, Professionista, Evento, Contenuto) sia come stato operativo di un Account (`identita-accessi.md` §11, "Account contestato" per titolarità dell'Account in dubbio) | Trasversale | Stesso concetto di fondo (una condizione dichiarata è messa in dubbio) applicato a due famiglie di assi diverse (verifica di un fatto di business vs. stato operativo di un costrutto di accesso): non è un'incompatibilità di significato, ma un'applicazione dello stesso principio a due livelli distinti. Documentata al §8 |

Nessuna delle incoerenze reali individuate riguarda la proprietà di un fatto sostanziale, una contraddizione tra due domini su chi possiede cosa, o una regola invariante violata: entrambe sono di natura documentale (riferimenti non aggiornati), non concettuale.

---

## 5. Incoerenze corrette

Entrambe le incoerenze reali individuate al §4.1 sono state corrette:

1. **`docs/domain-model.md` segnaposto** — risolta riscrivendo integralmente il documento (§14, ora sintesi autorevole coerente con gli 11 documenti specialistici, secondo la struttura a 15 punti richiesta).
2. **Domanda aperta su Professionisti non aggiornata** — risolta modificando le frasi specifiche in `imprese.md` (§1, §12, §14), `mercati-internazionali.md` (§6), `opportunita.md` (§1, §15) e `collaborazioni.md` (§1, §6, §15), sostituendo l'ipotesi sospesa "se confermato come dominio distinto" con un riferimento esplicito a `logical/professionisti.md` come dominio ora confermato autonomo. Il dettaglio riga per riga di ogni modifica è riportato al §14.

Le cinque differenze legittime elencate al §4.2 non sono state corrette, in coerenza con il vincolo "non effettuare modifiche puramente stilistiche estese" e perché nessuna costituisce una contraddizione: sono state invece esplicitamente documentate in questo rapporto (glossario §7, assi di stato §8, dipendenze §11, domini futuri §13) affinché restino visibili e tracciate senza alterare il testo dei documenti specialistici.

---

## 6. Sovrapposizioni verificate e risolte (Parte 3)

Ciascun confine richiesto dal mandato è stato verificato leggendo entrambi i documenti coinvolti fianco a fianco. Esito: tutti i confini risultano già rispettati dai documenti esistenti; nessuna correzione è stata necessaria in questa sezione.

**Persone / Identità & Accessi.** Verificato che restano distinti: Persona (`persone.md`, soggetto sociale/anagrafico, può esistere senza Account), identità reale, identità dichiarata, identità digitale, Account, profilo pubblico (di dominio esterno), profilo di accesso (di IA), verifica dell'identità (multi-asse, §10 `identita-accessi.md`) e credenziale. `identita-accessi.md` §3 dedica una tabella esplicita a questa distinzione e §7 dell'introduzione la dichiara come principio cardine. Nessuna sovrapposizione: confermato.

**Imprese / Appartenenze.** Verificato che: l'Impresa possiede la propria identità economica/organizzativa (`imprese.md` §1-§5) senza incorporare le Persone collegate come fatti propri (dichiarato esplicitamente in `imprese.md` §1, "Cosa NON comprende"); le Appartenenze possiedono la relazione Persona–Impresa (`appartenenze.md` §1); proprietà, amministrazione, lavoro, collaborazione e rappresentanza restano relazioni contestualizzate tramite Ruolo e Qualifica (`appartenenze.md` §4); Identità & Accessi non crea rappresentanza, ma la verifica come condizione di una decisione di accesso (`identita-accessi.md` §5, regola 9). Confermato, con la sola nota già trattata al §4.2/#4 sulla vista di sintesi "AppartenenzaImpresa" in `imprese.md`.

**Persone / Professionisti.** Verificato che: Professionista è un ruolo di Persona, non un soggetto nuovo (`professionisti.md` §1, "Distinzione tra Persona, Professionista e Impresa"); il Profilo professionale appartiene interamente a Professionisti; competenze personali generiche (`persone.md` §2, CompetenzaDichiarata) e qualifiche professionali (`professionisti.md` §6) restano distinte per esplicita dichiarazione reciproca; titolo, qualifica, iscrizione, certificazione ed esperienza sono modellati come concetti distinti in `professionisti.md` §6 (tabella dedicata). Confermato.

**Opportunità / Collaborazioni.** Verificato che: l'Opportunità rappresenta un beneficio o accesso disponibile offerto da un Promotore (`opportunita.md` §3); la Collaborazione rappresenta una relazione concreta o l'intenzione di trovarla (`collaborazioni.md` introduzione, "Distinzione da Opportunità"); candidatura, manifestazione di interesse, proposta e collaborazione attiva restano distinte (`collaborazioni.md` §9, §8); un'Opportunità non diventa automaticamente una Collaborazione — è dichiarato esplicitamente come possibilità, non automatismo, in entrambi i documenti (`opportunita.md` §15 decisione, `collaborazioni.md` §2). Confermato.

**Eventi / Opportunità.** Verificato che: l'Evento rappresenta un accadimento organizzato (`eventi.md` §3); un'Opportunità può essere presentata o resa accessibile tramite un Evento senza che l'Evento la incorpori (`eventi.md` §10, `opportunita.md` §1); partecipazione all'Evento e accesso all'Opportunità restano distinti (concetti "Iscrizione/Partecipazione" vs. "Candidatura" mai unificati); una fiera o missione non incorpora automaticamente tutte le Opportunità collegate — `eventi.md` §13 regola invariante lo dichiara esplicitamente. Confermato.

**Eventi / Formazione.** Verificato che: il Corso può essere rappresentato come Evento nella sola dimensione temporale (`eventi.md` §10, nota esplicita); risultati didattici, attestazioni, apprendimento e percorsi formativi non sono posseduti da Eventi (dichiarato in "Cosa NON comprende" di `eventi.md` §1); Formazione resta un dominio futuro possibile, non ancora modellato (`eventi.md` §15 domande aperte, coerente con questo rapporto §13); la formazione multilingue sulla sicurezza resta una funzione importante ma esplicitamente non trasforma la piattaforma in un portale linguistico generalista (`eventi.md` §15, domanda aperta esplicita che lo dichiara come limite di ambito). Confermato.

**Contenuti editoriali / tutti i fatti di dominio.** Verificato che: contenuto e fatto descritto restano distinti in tutta l'architettura di `contenuti-editoriali.md` (§1, §3, §8); intervista, articolo, storia, guida e comunicato non modificano automaticamente i domini descritti (`contenuti-editoriali.md` §8, principio esplicito "Il collegamento con i fatti di dominio"); una dichiarazione editoriale non diventa automaticamente un fatto verificato (`contenuti-editoriali.md` §7, distinzione Fonte/Evidenza/Verifica editoriale); autore, soggetto descritto e fonte restano distinti (§5, §7); storia personale e storia d'impresa hanno una responsabilità coerente e non ambigua, esplicitamente riconciliata tra `persone.md` (proprietaria della Storia personale) e `contenuti-editoriali.md` (proprietario delle Storie di impresa, che distribuisce anche la Storia personale come tipo di contenuto senza diventarne proprietario) — si veda la voce dedicata nel glossario (§7). Confermato.

**Contenuti editoriali / Osservatorio.** Verificato che: l'Osservatorio produce misure, indicatori, aggregazioni e interpretazioni analitiche (`osservatorio.md` §1, §8); i Contenuti editoriali producono rappresentazioni narrative e informative (`contenuti-editoriali.md` §1); Rapporto, Dossier, Scheda territoriale e Scheda settoriale sono collocati esplicitamente in Osservatorio come prodotti analitici (`osservatorio.md` §2, §12), mentre la loro eventuale divulgazione narrativa (un articolo che racconta i risultati) è un Contenuto editoriale distinto che li referenzia senza incorporarli (`contenuti-editoriali.md` §8); il prodotto analitico e la sua pubblicazione editoriale restano distinguibili (§12 di entrambi i documenti); misura e interpretazione restano distinte (`osservatorio.md` §3, §8). Confermato.

**Mercati internazionali / Imprese / Opportunità.** Verificato che: il Mercato internazionale rappresenta il contesto economico e geografico (`mercati-internazionali.md` §3); un'Impresa può dichiarare o dimostrare presenza o interesse in un Mercato tramite Presenza/Interesse di mercato (§4), relazione posseduta da Mercati Internazionali e non da Imprese (che la referenzia soltanto, `imprese.md` §1 "MercatoImpresa referenzia un Mercato, non lo definisce"); un'Opportunità può riguardare un Mercato per riferimento descrittivo (`opportunita.md` §10); il Mercato non incorpora Imprese o Opportunità (`mercati-internazionali.md` §1, "Cosa NON comprende"); dichiarazione di operatività, evidenza di attività e interesse futuro restano distinti (§4, §5 di `mercati-internazionali.md`, tre concetti separati: Presenza, Attività internazionale, Interesse). Confermato.

**Identità & Accessi / tutti gli altri domini.** Verificato che: applica l'accesso ma non definisce il significato sostanziale della visibilità (`identita-accessi.md` §7, principio esplicito, coerente con `contenuti-editoriali.md` §12 e `osservatorio.md` §12); ruolo applicativo e ruolo di dominio restano distinti (§6, tabella dedicata); permesso, delega, consenso, Appartenenza e rappresentanza restano distinti (§1 tabella di apertura, §8, §9); un accesso consentito non crea diritti sostanziali (introduzione, principio cardine, §13 regola 11); la chiusura dell'Account non cancella automaticamente fatti economici o editoriali (§3, §11, §13 regole 4 e 18, e casi limite 45-46 che lo confermano esplicitamente per Collaborazioni e Contenuti). Confermato.

---

## 7. Termini uniformati — Glossario canonico (Parte 4)

Glossario canonico dell'architettura logica. Per ogni termine: forma principale da usare, sinonimi/varianti da evitare, significato sintetico, dominio proprietario, condizione d'uso da parte di altri domini. Questo glossario è stato inserito, in forma sintetica, anche in `docs/domain-model.md` §12; qui è riportato nella sua versione completa.

| Termine | Sinonimi/varianti da evitare | Significato | Dominio proprietario | Uso da altri domini |
|---|---|---|---|---|
| **Persona** | Utente (quando indica il soggetto sociale), Individuo | Soggetto sociale e anagrafico rappresentato dalla piattaforma, indipendente da un Account | Persone | Per riferimento stabile, mai duplicando i dati |
| **Utente** | — (il termine stesso è da evitare come concetto di dominio) | Termine di linguaggio comune, ambiguo tra Visitatore, Account e Persona | Nessuno: non è un concetto di dominio | Solo in prosa discorsiva non normativa, mai nei modelli |
| **Account** | Utente, Login | Costrutto di accesso che consente autenticazione e azione | Identità & Accessi | Referenziato da tutti per sapere "chi ha agito", mai duplicato |
| **Identità digitale** | Identità (da sola) | Insieme di credenziali e metodi di autenticazione riconducibili a un Account | Identità & Accessi | Referenziata, non incorporata |
| **Profilo** | — (da non usare senza qualificatore) | Termine ambiguo: va sempre qualificato (pubblico / professionale / di accesso) | Dipende dal qualificatore | — |
| **Profilo pubblico** | — | Rappresentazione pubblica di una Persona o di un'Impresa | Persone (per la Persona), Imprese (per l'Impresa) | Referenziato da Identità & Accessi come oggetto distinto dall'Account |
| **Profilo professionale** | — | Rappresentazione professionale di una Persona (qualifiche, servizi, disponibilità) | Professionisti | Referenziato da Opportunità, Collaborazioni, Eventi, Mercati Internazionali |
| **Profilo di accesso** | — | Insieme di ruoli, permessi e condizioni disponibili per un Account in un Contesto | Identità & Accessi | Concetto interno, non referenziato da altri domini |
| **Impresa** | Azienda (accettabile in prosa), Ditta | Il soggetto economico | Imprese | Referenziata da tutti come titolare/soggetto economico |
| **Organizzazione** | — (da non usare come sinonimo di Impresa) | Termine storico (Domain Model v1) per soggetto non economico; non ancora un'entità logica autonoma | Nessuno attuale — area futura (§13) | Da evitare come sinonimo di Impresa |
| **Ente** | — (da qualificare sempre: "ente pubblico", "ente economico") | Ambiguo se isolato; "ente economico" è una forma organizzativa di Impresa (`imprese.md` §2) | Dipende dal contesto | Da qualificare sempre |
| **Appartenenza** | AppartenenzaImpresa (nome locale storico in `imprese.md`), Membership | Relazione datata e qualificata tra una Persona e un'Impresa | Appartenenze | Referenziata da Imprese, Identità & Accessi, Opportunità, Collaborazioni |
| **Partecipazione** | — | Relazione tra un soggetto e un Evento (iscritto, relatore, organizzatore) | Eventi | Da non confondere con Candidatura/Manifestazione di interesse (Opportunità/Collaborazioni) |
| **Collaborazione** | — | Relazione concreta o intenzione di relazione tra soggetti che cercano un incontro | Collaborazioni | Referenziata da Eventi (occasione), Osservatorio |
| **Opportunità** | — | Beneficio o accesso strutturato reso disponibile da un Promotore | Opportunità | Referenziata da Collaborazioni (origine), Eventi (presentazione) |
| **Evento** | — | Accadimento organizzato collocato nel tempo e nello spazio | Eventi | Referenziato da Opportunità, Collaborazioni, Professionisti |
| **Edizione** | — | Occorrenza specifica e ricorrente di un Evento | Eventi | Componente interna, referenziata insieme all'Evento |
| **Sessione** | — (da qualificare sempre) | Due significati distinti: "Sessione di Evento" (Eventi, programma) e "Sessione concettuale" (Identità & Accessi, intervallo di autenticazione) | Eventi / Identità & Accessi secondo il qualificatore | Da qualificare sempre esplicitamente |
| **Fonte** | — (da qualificare sempre con il dominio) | Origine dichiarata di un'informazione usata da un dominio per una propria Verifica o Evidenza | Nessun proprietario unico: pattern locale in più domini (§3.2) | Ogni dominio definisce e usa le proprie Fonti |
| **Evidenza** | — | Riscontro concreto a supporto di una Verifica | Nessun proprietario unico: pattern locale, introdotto in `appartenenze.md` §2 | Ogni dominio definisce e usa le proprie Evidenze |
| **Verifica** | — (da qualificare sempre con l'aspetto verificato) | Accertamento indipendente di un aspetto specifico di un fatto | Nessun proprietario unico: ogni dominio verifica i propri fatti (§9) | Mai usata come giudizio generico senza oggetto specificato |
| **Validazione** | — | Preferire "Verifica"; "Validazione metodologica" ha significato tecnico specifico solo in Osservatorio | Osservatorio (per il significato tecnico specifico); altrove sinonimo evitabile di Verifica | — |
| **Approvazione** | — | Superamento di una fase di controllo editoriale/di moderazione, distinta da Verifica e da Pubblicazione | Ciascun dominio per il proprio ciclo editoriale/di pubblicazione | — |
| **Stato** | — (da non usare senza qualificare l'asse) | Termine da qualificare sempre con l'asse di appartenenza (operativo, editoriale, di verifica, di pubblicazione, di visibilità...) | Ciascun dominio per i propri assi (§8) | Mai un'entità "stato" unica e complessiva |
| **Visibilità** | — | Principio distribuito, non un'entità: ogni dominio stabilisce la visibilità sostanziale del proprio fatto | Il dominio proprietario del fatto stabilisce; Identità & Accessi applica | Identità & Accessi non ridefinisce la visibilità sostanziale |
| **Accesso** | — | Facoltà tecnico-applicativa di raggiungere una risorsa logica, mai sinonimo di diritto sostanziale | Identità & Accessi (per la decisione) | Il diritto sostanziale a cui l'accesso si applica resta del dominio proprietario |
| **Autorizzazione** | — (da qualificare sempre) | "Autorizzazione gestionale" (Appartenenze, titolo per agire per un'Impresa) è distinta da "Autorizzazione temporanea"/Permesso (Identità & Accessi) | Appartenenze / Identità & Accessi secondo il qualificatore | Da qualificare sempre |
| **Permesso** | — | Facoltà tecnica di compiere un'azione o accedere a un'informazione | Identità & Accessi | Non equivale a un diritto sostanziale nel dominio interessato |
| **Delega** | — | Trasferimento dichiarato di una porzione limitata di accesso | Identità & Accessi | Non crea proprietà né rappresentanza |
| **Consenso** | — | Espressione di volontà rispetto a una finalità di accesso o trattamento | Identità & Accessi | Distinto da Delega e Permesso |
| **Ruolo** | — (da qualificare sempre) | "Ruolo applicativo" (Identità & Accessi, permesso tecnico) ≠ "Ruolo" di un'Appartenenza (fatto di business) ≠ "Ruolo organizzativo" (Imprese) | Identità & Accessi / Appartenenze / Imprese secondo il qualificatore | Mai usato da solo senza qualificatore |
| **Qualifica** | QualificaDichiarata (termine storico Domain Model v1) | Tre concetti distinti con la stessa radice: "Qualifica" di un'Appartenenza (precisazione del Ruolo) ≠ "Qualifica professionale" (Professionisti) ≠ concetto storico v1 | Appartenenze / Professionisti secondo il qualificatore | Massima attenzione: mai usato senza specificare quale dei tre |
| **Titolo** | — (da qualificare sempre) | "Titolo di rappresentanza" (Appartenenze/Identità & Accessi) ≠ "Titolo" professionale, es. laurea (Professionisti) | Appartenenze / Professionisti secondo il qualificatore | Da qualificare sempre |
| **Certificazione** | — (da qualificare sempre per soggetto) | "CertificazioneImpresa" (Imprese) ≠ certificazione professionale (Professionisti) | Imprese / Professionisti secondo il soggetto | Da qualificare sempre |
| **Competenza** | — | "CompetenzaDichiarata" generica non verificata (Persone) ≠ "Qualifica professionale" verificabile su assi multipli (Professionisti) | Catalogo: Tassonomia condivisa; dichiarazione: Persone o Professionisti | Da non confondere i due livelli |
| **Mercato** | Mercato (da solo, ambiguo con senso commerciale generico) | Preferire sempre "Mercato internazionale" | Mercati Internazionali | Referenziato da Imprese, Opportunità, Collaborazioni, Eventi, Professionisti |
| **Paese** | — | Componente descrittivo di un Mercato internazionale o di un Territorio | Non è un'entità autonoma nei documenti attuali | — |
| **Territorio** | — | Geografia italiana (città, provincia, regione), distinta da Mercato internazionale (estero) | Tassonomia condivisa (generico, non ancora documento logico dedicato) | Referenziato da Imprese, Eventi, Professionisti |
| **Settore** | — | Settore economico, voce di Tassonomia condivisa | Tassonomia condivisa | Referenziato da Imprese, Opportunità, Eventi, Professionisti |
| **Contenuto** | Contenuto (da solo, ambiguo) | Preferire sempre "Contenuto editoriale" per evitare ambiguità con il contenuto generico di qualsiasi entità | Contenuti editoriali | — |
| **Versione** | — | Storicizzazione delle modifiche a un Contenuto editoriale | Contenuti editoriali | — |
| **Traduzione** | — | Adattamento linguistico di un Contenuto editoriale, distinguibile dall'originale | Contenuti editoriali | Referenziata da qualsiasi dominio con contenuti multilingue |
| **Indicatore** | — | Sintesi analitica calcolata secondo una metodologia dichiarata | Osservatorio | Referenziato da Contenuti editoriali per divulgazione narrativa |
| **Misura** | — | Componente elementare di un Indicatore, distinta dall'Indicatore che la interpreta | Osservatorio | — |
| **Osservazione** | — | Dato elementare raccolto da una Fonte, prima dell'elaborazione in Misura/Indicatore | Osservatorio | — |
| **Analisi** | — | Attività interpretativa applicata agli Indicatori, distinta dalla misura stessa | Osservatorio | — |
| **Rapporto** | — | Prodotto analitico strutturato dell'Osservatorio, distinto da un articolo editoriale che ne racconta i risultati | Osservatorio | Referenziato (non incorporato) da Contenuti editoriali |
| **Dossier** | — | Prodotto analitico dell'Osservatorio, più ampio/tematico del Rapporto | Osservatorio | Come Rapporto |
| **Storia** | — (da qualificare sempre) | "Storia personale" (proprietà sostanziale di Persone, distribuita come contenuto) ≠ "Storia di Impresa" (proprietà editoriale piena) | Persone (Storia personale) / Contenuti editoriali (Storia di Impresa) | Mai usato da solo senza qualificatore |
| **Affidabilità** | — (da evitare come giudizio unico) | Si esprime sempre come combinazione di assi di verifica specifici, mai come punteggio unico | Nessun dominio possiede un'entità "Affidabilità" autonoma | — |
| **Reputazione** | — | Esplicitamente esclusa dal perimetro attuale | Nessun proprietario attuale — dominio futuro candidato (§13) | Non modellata da alcun dominio attuale |

**Nota sull'uso ambiguo di "utente".** In coerenza con il vincolo esplicito del mandato, "Utente" non è mai usato in questo rapporto né raccomandato nei documenti di dominio come sinonimo di Persona, Account o Visitatore: ciascuno di questi tre concetti ha una propria definizione precisa e un proprio dominio (Persone; Identità & Accessi; nessuno — il Visitatore anonimo è uno stato di assenza di Account, non un'entità).

---

## 8. Stati uniformati (Parte 5)

Principio guida, già adottato spontaneamente da tutti gli 11 documenti e qui confermato come decisione vincolante: **non esiste un modello universale unico degli stati**. Ogni dominio mantiene la propria autonomia sugli assi che gli sono rilevanti; questo rapporto uniforma il *significato* delle famiglie concettuali comuni, non la loro struttura.

### 8.1 Famiglie di assi di stato

| Famiglia | Significato comune | Dove compare |
|---|---|---|
| Stato reale/sostanziale | La condizione di fatto nel mondo, indipendente da come è rappresentata (es. un'Impresa è realmente attiva o cessata) | Persone (esistenza), Imprese (stato operativo), Appartenenze (relazione in essere), Mercati Internazionali (presenza reale), Professionisti (esercizio reale della professione) |
| Stato editoriale | Il grado di completezza e lavorazione redazionale di una scheda o contenuto, prima della pubblicazione | Persone, Imprese, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Professionisti |
| Stato di lavorazione | L'avanzamento di un processo interno non ancora concluso (es. una candidatura "in valutazione") | Opportunità (candidature), Collaborazioni (manifestazioni di interesse), Osservatorio (elaborazione di un Indicatore) |
| Stato di verifica | Il livello di riscontro indipendente raggiunto su un aspetto specifico (mai un giudizio unico, §9) | Tutti gli 11 domini, ciascuno sui propri fatti |
| Stato di approvazione | Il superamento di un controllo editoriale o di moderazione, distinto dalla Verifica di un fatto sostanziale | Imprese, Opportunità, Eventi, Contenuti editoriali |
| Stato di pubblicazione | La transizione tra non visibile e visibile pubblicamente | Persone, Imprese, Appartenenze (raro), Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Professionisti, Osservatorio |
| Stato di validità | Il periodo durante il quale un fatto dichiarato resta presentabile come attuale (es. una Certificazione, un'Opportunità, un Consenso) | Imprese (certificazioni), Opportunità (temporalità), Professionisti (qualifiche/iscrizioni), Contenuti editoriali (validità informativa), Identità & Accessi (deleghe, consensi, metodi di autenticazione) |
| Stato di visibilità | Chi può conoscere un fatto o un contenuto, distinto dallo stato di pubblicazione (che riguarda la disponibilità generale) | Tutti gli 11 domini (visibilità sostanziale) + Identità & Accessi (applicazione tecnica) |
| Stato di disponibilità | La possibilità concreta di fruire di un'offerta in un dato momento (es. disponibilità di un Professionista, capienza di un Evento) | Professionisti, Eventi, Opportunità |
| Stato di partecipazione | La condizione di un soggetto rispetto a un Evento o a una Collaborazione/Opportunità (iscritto, confermato, presente) | Eventi (Partecipazione), Opportunità (Candidatura), Collaborazioni (Manifestazione di interesse) |
| Stato di accesso | L'esito tecnico-applicativo di una richiesta (consentito, negato, limitato...) | Identità & Accessi (esclusivo) |
| Stato di sicurezza | Il livello di allerta concettuale relativo a un Account, indipendente dal suo stato operativo | Identità & Accessi (esclusivo) |
| Stato di contestazione | Una condizione dichiarata è stata messa in dubbio da una parte con titolo per farlo | Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Contenuti editoriali, Identità & Accessi (Account e Associazione con Persona) |
| Stato di archiviazione | La conservazione di un fatto o contenuto non più corrente, per valore storico, distinta dalla cancellazione | Persone, Imprese, Appartenenze (raro), Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Identità & Accessi |

### 8.2 Verifica dei termini specifici richiesti

| Termine | Verifica di compatibilità tra domini |
|---|---|
| **Attivo/a** | Usato in tutti i domini con significato coerente: "in vigore/operativo ora", sempre come stato reale o operativo (Impresa attiva, Appartenenza attiva, Account attivo, Delega efficace/attiva). Nessuna incompatibilità |
| **Sospeso/a** | Coerente in tutti i domini: interruzione temporanea e reversibile, con motivazione dichiarata (Impresa, Profilo professionale, Account, Metodo di autenticazione, Delega). Famiglia semantica unica: "sospensione temporanea reversibile" |
| **Chiuso/a** | Coerente: raggiungimento naturale del termine di un ciclo (Opportunità chiusa, Account chiuso) — sempre distinto da Revocato/Annullato (che implicano un atto deliberato) |
| **Cessato/a** | Coerente: termine definitivo di un'attività reale (Impresa cessata, esercizio professionale cessato) — riservato allo stato reale/sostanziale, non usato per contenuti o account |
| **Scaduto/a** | Coerente in tutti i domini: naturale superamento di un periodo di validità dichiarato (Certificazione, Delega, Consenso, validità informativa di un Contenuto), sempre distinto da Revocato (atto deliberato) |
| **Ritirato/a** | Usato prevalentemente in Contenuti editoriali (contenuto ritirato dalla pubblicazione) e Opportunità (ritirata dal promotore); significato coerente: rimozione volontaria dalla visibilità, senza indicare necessariamente un difetto — coerente con "Revocata"/"Annullata" ma a iniziativa del proprietario del fatto, non di terzi |
| **Archiviato/a** | Coerente in tutti i domini: conservazione per valore storico di un fatto non più corrente, mai equivalente a cancellazione (§8.1) |
| **Verificato/a** | Coerente solo se sempre accompagnato dall'aspetto verificato (§9): nessun dominio lo usa come giudizio generico isolato |
| **Validato/a** | Usato con significato tecnico specifico solo in Osservatorio (validazione metodologica); altrove non usato come stato autonomo — nessuna incompatibilità perché non c'è sovrapposizione di uso |
| **Approvato/a** | Coerente: superamento di un controllo editoriale/di moderazione, distinto da Verificato (fatto sostanziale) |
| **Pubblicato/a** | Coerente in tutti i domini: transizione a visibilità pubblica ordinaria, sempre distinto da Verificato e da Approvato |
| **Contestato/a** | Due applicazioni dello stesso principio di fondo, non incompatibili: (a) stato dell'asse di verifica di un fatto sostanziale nella maggior parte dei domini; (b) stato operativo di un Account in Identità & Accessi (titolarità dell'Account in dubbio). Trattato come differenza legittima al §4.2/#5 |
| **Revocato/a** | Coerente: invalidazione deliberata da parte di chi ha titolo per farlo, di un fatto/diritto/grant precedentemente valido (Appartenenza, Certificazione, Opportunità, Qualifica professionale, Delega, Consenso, Account/Metodo di autenticazione, Associazione con Persona) — sempre distinto da Scaduto (naturale) e da Annullato (nessun difetto riconosciuto, §8.2 riga successiva) |
| **Annullato/a** | Coerente: cessazione decisa senza che sia riconosciuto un difetto specifico (Opportunità annullata, Collaborazione annullata) — distinto da Revocato (che tipicamente implica un difetto o una violazione) |
| **Cancellato/a** | Non usato come stato di dominio in nessuno degli 11 documenti (deliberatamente: si preferisce sempre "Archiviato" per preservare lo storico, coerente con la regola di conservazione trasversale, §13 regola 18 di `identita-accessi.md` e analoghe in altri domini) — nessuna incompatibilità, il termine è correttamente evitato |
| **Completato/a** | Usato con significato coerente di raggiungimento naturale di un traguardo (Recupero dell'accesso completato, Profilo completato) — coerente con "Chiuso" ma riferito a un processo, non a un ciclo di vita di un'entità |

**Esito.** Nessun termine risulta usato con significati incompatibili tra domini. L'unica sovrapposizione di superficie ("Contestato" applicato sia a fatti sostanziali sia allo stato di un Account) è già dichiarata esplicitamente nei rispettivi documenti come applicazione dello stesso principio a due livelli distinti, e viene qui confermata come differenza legittima, non come incoerenza da correggere.

---

## 9. Verifiche uniformate (Parte 6)

### 9.1 Tipi di verifica distinti nei documenti

| Tipo di verifica | Dove è modellata | Cosa accerta |
|---|---|---|
| Verifica dell'esistenza | Imprese (§8, esistenza del soggetto economico), Mercati Internazionali (§10, esistenza di una presenza dichiarata) | Che il soggetto o il fatto dichiarato esista realmente |
| Verifica dell'identità | Identità & Accessi (§10, identità civile/digitale), Persone (indirettamente, tramite Identità & Accessi) | Che l'identità dichiarata corrisponda a chi agisce |
| Verifica del contatto | Identità & Accessi (§10, "Contatto verificato") | Che un canale di contatto sia effettivamente controllato dal soggetto |
| Verifica documentale | Imprese (§8, certificazioni), Professionisti (§11, titoli/iscrizioni/abilitazioni) | Che un documento dichiarato corrisponda a un riscontro reale |
| Verifica della fonte | Contenuti editoriali (§7), Osservatorio (§7), Mercati Internazionali (§10) | Che l'origine di un'informazione sia attendibile |
| Verifica della relazione | Appartenenze (§10, relazione Persona-Impresa), Identità & Accessi (§10, "Relazione organizzativa verificata") | Che un legame dichiarato tra due soggetti sia reale |
| Verifica della rappresentanza | Appartenenze (§8, Autorizzazione gestionale), Identità & Accessi (§5, Titolo di rappresentanza) | Che chi agisce per un'Impresa abbia effettivamente il titolo per farlo |
| Verifica professionale | Professionisti (§11, multi-asse: titolo, iscrizione, abilitazione, esperienza) | Che le qualifiche professionali dichiarate corrispondano a un riscontro reale |
| Verifica editoriale | Contenuti editoriali (§7, §11) | Che un contenuto rispetti gli standard editoriali dichiarati, distinta dalla verità sostanziale dei fatti narrati |
| Verifica metodologica | Osservatorio (§8, §12, "Validazione metodologica") | Che il metodo di calcolo di un Indicatore sia corretto e riproducibile |
| Verifica della disponibilità | Professionisti (§9), Eventi (§8, capienza) | Che una disponibilità dichiarata sia reale al momento della richiesta |
| Verifica della partecipazione | Eventi (§9, presenza effettiva vs. iscrizione) | Che una Partecipazione dichiarata (iscritto) corrisponda a una presenza effettiva |
| Verifica della delega | Identità & Accessi (§8, §10, "Delega verificata") | Che il Delegante avesse il potere di concedere la Delega |
| Verifica del consenso | Identità & Accessi (§9) | Che un Consenso sia stato effettivamente espresso dal soggetto titolare |
| Verifica della qualità del dato | Osservatorio (§10, completezza/incertezza) | Che un dato aggregato soddisfi requisiti minimi di qualità prima della pubblicazione |

Tutti i 15 tipi richiesti dal mandato sono stati trovati modellati in almeno un documento, con una responsabilità sempre riconducibile al dominio proprietario del fatto verificato. Nessuna verifica è trasversale a più domini con lo stesso significato: ogni dominio la esegue sui propri fatti (coerente con la nota su "Fonte"/"Evidenza"/"Verifica" al §3.2 e §7).

### 9.2 Conferma dell'assenza di un badge universale generico

Confermato, per lettura diretta di tutti gli 11 documenti, che **non esiste** in nessuno di essi un badge generico e privo di indicazione dell'aspetto verificato:

- **"Persona verificata"** — non esiste; `persone.md` non introduce alcun badge di verifica complessiva della Persona (la verifica dell'identità è delegata a Identità & Accessi, §10 di quel documento, sempre su assi specifici).
- **"Impresa verificata"** — non esiste; `imprese.md` §8 modella verifiche specifiche (es. su singole certificazioni), mai un giudizio complessivo unico.
- **"Professionista verificato"** — non esiste; `professionisti.md` §11 dichiara esplicitamente il principio "si evita un badge unico verificato" e modella assi distinti (titolo, iscrizione, abilitazione, esperienza).
- **"Evento verificato"** — non esiste; `eventi.md` §12 distingue verifica dell'organizzatore, del luogo, del programma.
- **"Contenuto verificato"** — non esiste; `contenuti-editoriali.md` §7/§11 distingue verifica editoriale da verifica dei fatti narrati (che resta del dominio descritto).
- **"Dato verificato"** — non esiste come giudizio unico; Osservatorio §10 modella dimensioni distinte di qualità (completezza, incertezza, tracciabilità metodologica).
- **"Utente verificato"** — non esiste; `identita-accessi.md` §10 dichiara esplicitamente il medesimo principio già adottato in `appartenenze.md` §10 e `osservatorio.md` §10 ("si evita deliberatamente un unico badge generico"), con almeno 13 assi distinti elencati.

**Esito.** Il principio "nessun badge universale generico" risulta applicato in modo uniforme e senza eccezioni in tutti gli 11 documenti. Viene qui elevato a decisione vincolante dell'intera architettura (riportata anche in `docs/domain-model.md` §7).

---

## 10. Eventi di dominio uniformati (Parte 8)

**Metodo.** Tutti gli eventi elencati nelle sezioni "Eventi di dominio" degli 11 documenti (oltre 140 eventi complessivi) sono stati raccolti e confrontati per: forma grammaticale, assenza di comandi, assenza di duplicati con significato differente, distinzione tra fatto interno e conseguenza esterna.

**Uniformità dei nomi e uso coerente del passato.** Verificato: tutti gli eventi sono nominati con un participio passato riferito a un fatto già accaduto (es. *Pubblicata, Dichiarata, Sospesa, Registrato, Concluso, Rilevato*), mai con un imperativo o un infinito che suggerirebbe un comando (non esiste, ad esempio, "SospendiAccount" o "PubblicaContenuto" come nome di evento). Lo stile varia leggermente da dominio a dominio per riflettere il proprio linguaggio (es. Imprese usa "ImpresaCreata" per un fatto di censimento, Persone usa "PersonaRegistrata" per un processo di registrazione effettivo): questa variazione è una scelta di linguaggio di dominio appropriata (Ubiquitous Language DDD), non un'incoerenza — ogni dominio nomina i propri eventi con il verbo che meglio rappresenta la propria natura (censire vs. registrarsi vs. dichiarare vs. pubblicare).

**Distinzione tra fatto avvenuto e comando desiderato.** Verificato in tutti gli 11 documenti: nessun evento è formulato come un comando o un'intenzione futura; ogni evento descrive qualcosa che è già accaduto, con eventuali condizioni concettuali che devono essere state soddisfatte prima che l'evento potesse verificarsi (pattern coerente in tutte le tabelle "Evento | Significato | Condizioni concettuali | Possibili conseguenze di dominio", introdotto in `osservatorio.md` §14 e `identita-accessi.md` §14, e presente in forma equivalente negli altri documenti).

**Distinzione tra evento interno al dominio e conseguenza in un altro dominio.** Verificato: ogni documento chiude la propria sezione "Eventi di dominio" con una nota esplicita sulle "conseguenze di dominio" o "dipendenze con i futuri domini", che elenca quali altri domini possono voler reagire a un evento senza che il dominio che lo genera debba conoscerne la reazione (pattern "fatti accaduti" già stabilito nel Domain Model v1 §10 e qui confermato come principio architetturale, `docs/domain-model.md` §10 riscritto).

**Assenza di eventi duplicati con significati differenti.** Non è stato trovato alcun evento con lo stesso nome e significati incompatibili tra domini diversi. Sono stati trovati invece **eventi con lo stesso nome e significato compatibile ma descritti a due livelli di dettaglio diversi**, sempre nella coppia Imprese/Appartenenze:

| Evento | In `imprese.md` (vista di sintesi) | In `appartenenze.md` (modello autoritativo) | Valutazione |
|---|---|---|---|
| AppartenenzaDichiarata | "una relazione tra una Persona e un'Impresa è stata dichiarata da una delle due parti" | Stesso significato, con dettaglio aggiuntivo su Ruolo/Qualifica/Periodo (§14 di `appartenenze.md`) | Compatibile: `imprese.md` è dichiaratamente una vista di sintesi non contraddittoria (nota di apertura e §15 di `imprese.md`) |
| AppartenenzaVerificata | "una relazione dichiarata è stata confermata secondo uno dei processi di verifica previsti" | "sintesi del raggiungimento di un livello di verifica ritenuto sufficiente sugli assi rilevanti... distinto da AppartenenzaConfermata" | Compatibile: la definizione di `imprese.md` è una semplificazione corretta di quella più precisa di `appartenenze.md` |
| AppartenenzaContestata | "una relazione dichiarata è stata messa in dubbio da una delle parti o da un terzo con titolo per farlo" | Stesso significato, con riferimento esplicito al processo di contestazione (§13 di `appartenenze.md`) | Compatibile |

Questa relazione vista/modello-autoritativo è già dichiarata esplicitamente da entrambi i documenti (§4.2/#4 di questo rapporto) e non richiede correzione.

**Eventi trasversali principali — mappatura sui nomi effettivamente usati.** L'elenco esemplificativo fornito dal mandato usa nomi illustrativi generici; la mappatura sui nomi effettivi già presenti nei documenti è la seguente (nessuna incoerenza: le differenze sono scelte di linguaggio di dominio, non errori):

| Nome illustrativo del mandato | Nome effettivo nei documenti | Dominio |
|---|---|---|
| PersonaCreata | PersonaRegistrata | Persone |
| PersonaArchiviata | PersonaArchiviata | Persone |
| ImpresaCreata | ImpresaCreata | Imprese |
| ImpresaCessata | (transizione dello stato operativo a "cessata"; non modellato come evento nominato a parte in `imprese.md` §13) | Imprese |
| AppartenenzaConfermata | AppartenenzaConfermata | Appartenenze |
| AppartenenzaRevocata | AppartenenzaRevocata | Appartenenze |
| ProfiloProfessionalePubblicato | ProfiloProfessionalePubblicato | Professionisti |
| OpportunitàPubblicata | OpportunitàPubblicata | Opportunità |
| OpportunitàScaduta | OpportunitàChiusa (la Scadenza è un attributo di temporalità, non un evento nominato a parte) | Opportunità |
| CollaborazioneAvviata | CollaborazioneAvviata | Collaborazioni |
| CollaborazioneConclusa | CollaborazioneConclusa | Collaborazioni |
| EventoPubblicato | EventoPubblicato | Eventi |
| EventoAnnullato | EventoCancellato | Eventi |
| PartecipazioneEventoConfermata | IscrizioneEventoConfermata | Eventi |
| ContenutoPubblicato | ContenutoPubblicato | Contenuti editoriali |
| ContenutoRettificato | ContenutoRettificato | Contenuti editoriali |
| IndicatorePubblicato | IndicatorePubblicato | Osservatorio |
| ValoreIndicatoreRevisionato | ValoreIndicatoreRevisionato | Osservatorio |
| AccountAssociatoAPersona | AccountAssociatoAPersona | Identità & Accessi |
| AccountSospeso | AccountSospeso | Identità & Accessi |
| DelegaRevocata | DelegaRevocata | Identità & Accessi |

**Esito.** Gli eventi di dominio risultano già uniformi per stile, forma grammaticale e distinzione fatto/comando. Non sono state necessarie correzioni.

---

## 11. Dipendenze tra domini e dipendenze circolari (Parte 7)

### 11.1 Mappa delle dipendenze principali

| Dominio sorgente | Dominio consumatore | Tipo di riferimento | Dipendenza | Natura |
|---|---|---|---|---|
| Persone | Appartenenze, Imprese, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi | Riferimento per identità | Necessaria (tutti devono referenziare una Persona esistente) | Riferimento, mai accoppiamento proprietario |
| Imprese | Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Eventi, Contenuti editoriali, Osservatorio, Professionisti | Riferimento per identità | Necessaria dove l'Impresa è titolare/soggetto | Riferimento |
| Appartenenze | Imprese (vista sintetica), Identità & Accessi (titolo), Opportunità, Collaborazioni | Riferimento + evento di dominio | Necessaria per stabilire un titolo di rappresentanza | Relazione di rappresentanza, con proprietario unico (Appartenenze) |
| Mercati Internazionali | Imprese (aggregazione), Opportunità, Collaborazioni, Eventi, Professionisti, Osservatorio | Riferimento descrittivo | Facoltativa (un'Opportunità può non riguardare alcun Mercato) | Relazione di contesto, mai di accoppiamento proprietario |
| Opportunità | Collaborazioni (origine opzionale), Eventi (presentazione), Osservatorio | Riferimento + evento di dominio | Facoltativa in entrambe le direzioni | Relazione legittimamente bidirezionale con Eventi (§11.2) |
| Collaborazioni | Osservatorio | Informazione derivata (aggregata) | Facoltativa | Relazione analitica |
| Professionisti | Opportunità, Collaborazioni, Eventi, Mercati Internazionali, Osservatorio | Riferimento per identità | Facoltativa | Riferimento |
| Eventi | Opportunità (presentazione), Collaborazioni (occasione), Contenuti editoriali (materiale narrativo), Osservatorio | Riferimento + evento di dominio | Facoltativa | Relazione narrativa verso Contenuti editoriali; relazione legittimamente bidirezionale con Opportunità |
| Contenuti editoriali | Osservatorio (divulgazione narrativa), Ricerca (generico) | Riferimento narrativo | Facoltativa | Relazione narrativa, mai di modifica dei fatti descritti |
| Osservatorio | Contenuti editoriali (fonte per divulgazione), Ricerca | Informazione derivata | Facoltativa | Relazione analitica, mai di modifica dei dati sorgente |
| Identità & Accessi | Tutti gli 11 domini (applicazione delle decisioni di accesso) | Applicazione, non riferimento di contenuto | Necessaria per ogni azione di scrittura, facoltativa per la sola consultazione pubblica | Relazione di accesso, mai di proprietà dei contenuti |

### 11.2 Dipendenze bidirezionali legittime

Individuate due relazioni realmente bidirezionali, entrambe già dichiarate esplicitamente dai documenti coinvolti e con proprietari e significati chiari — nessuna richiede eliminazione:

1. **Imprese ↔ Mercati Internazionali.** `imprese.md` dichiara la relazione "MercatoImpresa" (un'Impresa che dichiara una presenza) mentre `mercati-internazionali.md` aggrega, per ciascun Mercato, le Imprese che vi dichiarano una relazione. È la stessa relazione osservata da due punti di vista: il fatto (Presenza di mercato) è posseduto da Mercati Internazionali (`mercati-internazionali.md` §4, decisione esplicita al §15); Imprese la referenzia senza duplicarla. Non è una dipendenza circolare proprietaria, ma una relazione con un solo proprietario osservata da entrambi i lati.
2. **Eventi ↔ Opportunità.** Un Evento può presentare un'Opportunità; un'Opportunità può richiamare un Evento come contesto (`opportunita.md` §1, `eventi.md` §10). Nessuno dei due domini incorpora l'altro: è una relazione di riferimento reciproco, non di possesso reciproco. Ciascun fatto (l'Opportunità, l'Evento) resta posseduto dal proprio dominio.

### 11.3 Relazioni solo narrative, analitiche, di accesso e di rappresentanza

| Tipo di relazione | Esempio | Proprietà |
|---|---|---|
| Narrativa | Contenuti editoriali → qualsiasi dominio (StoriaPersonale, StorieImpresa, articoli su Mercati/Eventi/Opportunità) | Il Contenuto non modifica mai il fatto narrato; il fatto non "possiede" il Contenuto che lo racconta |
| Analitica | Osservatorio → tutti i domini sorgente | L'Osservatorio non modifica mai i dati sorgente; produce conoscenza derivata a parte |
| Di accesso | Identità & Accessi → tutti i domini | Identità & Accessi applica la visibilità stabilita dal dominio proprietario, senza mai ridefinirla o diventarne proprietario |
| Di rappresentanza | Appartenenze → Imprese, Identità & Accessi | Il titolo per agire per un'Impresa è sempre posseduto da Appartenenze; Identità & Accessi lo verifica come condizione, senza crearlo (`identita-accessi.md` §5, regola 9) |

### 11.4 Dipendenze circolari

**Esito della verifica.** Non è stata individuata alcuna dipendenza circolare problematica, cioè nessuna coppia di domini in cui ciascuno rivendichi la proprietà di un fatto posseduto dall'altro, né alcuna catena di riferimenti che renda impossibile stabilire un ordine di lettura/costruzione coerente. Le uniche relazioni "a doppio senso" individuate (§11.2) sono relazioni di riferimento reciproco con un proprietario chiaramente unico per ciascun fatto coinvolto, non dipendenze circolari di proprietà. Anche il flusso verso l'Osservatorio (che dipende da tutti i domini sorgente) resta strettamente unidirezionale per costruzione esplicita (nessun dominio sorgente dipende dall'Osservatorio per il proprio funzionamento operativo, coerente con `osservatorio.md` §1 e §15 decisione 19 del vincolo architetturale del mandato).

---

## 12. Concetti senza un proprietario definitivo

Distinzione preliminare importante: **Fonte**, **Evidenza**, **Verifica** e **Visibilità** (§3.2, §7) non sono concetti senza proprietario — hanno un proprietario chiaro per ciascuna istanza (il dominio che li definisce sui propri fatti); sono invece pattern concettuali ripetuti, non entità condivise. Non sono quindi elencati qui.

I concetti seguenti, per contro, compaiono già nei documenti esistenti come riferimenti a qualcosa che nessun dominio rivendica come proprio, in modo esplicito o implicito:

| Concetto | Dove appare come riferimento | Perché non ha ancora un proprietario definitivo | Trattamento raccomandato |
|---|---|---|---|
| **Organizzazione istituzionale** (associazione, camera di commercio, ambasciata, ente pubblico, fondazione, università come soggetto, non come mercato) | `mercati-internazionali.md` §6 ("Risorsa di supporto al mercato"), `eventi.md` §5 (organizzatori/promotori istituzionali), `imprese.md` §2 ("ente economico" come forma organizzativa, che copre solo il caso economico) | Nessun documento dichiara di possedere una eventuale scheda propria per un soggetto non economico; tutti la trattano come riferimento esterno alla piattaforma | Non richiede una correzione ora (nessun documento la tratta come "già definitiva"); da valutare come possibile estensione futura di Imprese (per la forma organizzativa) o come dominio a sé se la piattaforma deciderà di dare loro una scheda propria (§13) |
| **Servizio verticale strutturato** (finanziario, immobiliare, utility, professionale generico non coperto da Professionisti) | Citato implicitamente in `professionisti.md` §7 (che lo distingue da "Servizio professionale" senza definirlo), in `opportunita.md`/`collaborazioni.md` (come possibile tipologia non ancora strutturata) | Erede diretto del dominio "Servizi" del Domain Model v1, non ancora tradotto in un documento logico dedicato | Trattato come dominio futuro candidato al §13, non forzato ora |
| **Immobile / Annuncio immobiliare** | `collaborazioni.md` §13 ("Oggetto della collaborazione", quando riguarda la ricerca di un immobile), `professionisti.md` §5 (categoria "agente immobiliare"), `eventi.md` §8 (questione aperta su un futuro dominio Luoghi) | Nessun documento possiede una scheda propria dell'immobile come entità (solo la relazione che lo riguarda) | Dominio futuro candidato "Immobiliare" (§13), coerente con la decisione vincolante n. 26 del mandato |
| **Luogo fisico** (sede di un Evento, indirizzo di una Sessione) | `eventi.md` §8 (modalità e luoghi), che tratta il luogo come attributo descrittivo, non come entità con vita propria | Nessun dominio possiede una "Scheda luogo" riusabile tra più Eventi/Imprese | Dominio futuro candidato "Luoghi" (§13); nella prima versione resta un attributo descrittivo locale di chi lo referenzia (Eventi, Imprese) |
| **Reputazione / punteggio di affidabilità aggregato** | Esplicitamente evocato come futuro in `professionisti.md` §15 e `collaborazioni.md` §15, mai definito | Nessun documento lo modella; è esplicitamente escluso dal perimetro attuale | Dominio futuro candidato (§13), esplicitamente non anticipato in nessun documento attuale |

**Esito.** Nessuno di questi cinque concetti produce ambiguità operativa nei documenti esistenti, perché nessun documento ne rivendica la proprietà in modo implicito o contraddittorio: sono tutti trattati coerentemente come riferimenti esterni o come questioni esplicitamente aperte. Vengono qui segnalati non come incoerenze, ma come promemoria esplicito per la Parte 9 (§13) e per una futura assegnazione di proprietà quando la piattaforma deciderà di modellarli.

---

## 13. Domini futuri candidati (Parte 9)

Per ciascun concetto: se può restare trasversale; se appartiene già a un dominio; se richiede un dominio futuro; se va escluso dalla prima versione; quali domini attuali lo referenziano; quale rischio di sovrapposizione presenta. Nessun nuovo documento di dominio è stato creato in questa fase.

| Concetto | Trattamento | Appartiene già a | Dominio futuro? | Escludere dalla v1? | Referenziato da | Rischio di sovrapposizione |
|---|---|---|---|---|---|---|
| **Formazione** | Dominio futuro possibile, esplicitamente previsto | Nessuno (Eventi ne rappresenta solo la dimensione temporale, `eventi.md` §10) | Sì, candidato esplicito e già discusso in più documenti | No, ma non richiesto nella prima versione | Eventi, Professionisti (categoria formatore), Mercati Internazionali (formazione multilingue) | Con Eventi (dimensione temporale del Corso) — già disambiguato: Eventi non possiede risultati didattici |
| **Servizi** (verticali: finanziari, immobiliare, utility, professionali generici) | Dominio futuro/da completare, erede del dominio "Servizi" del Domain Model v1 | Parzialmente: Professionisti copre la componente di servizio personale-professionale; il resto resta non modellato | Sì | No per la componente già coperta da Professionisti; sì per il resto nella v1 | Professionisti (disambiguazione esplicita, §7), Opportunità, Collaborazioni | Con Professionisti — già disambiguato esplicitamente (§7 di `professionisti.md`); nessun rischio residuo per la parte già scritta |
| **Ricerca** | Concetto trasversale/generico, non richiede modello logico dedicato in questa fase | Dominio Generico già previsto dal Domain Model v1 | No, resta trasversale | Sì per un documento logico dedicato nella v1 | Tutti gli 11 domini (come consumatori del proprio contenuto indicizzabile) | Nessuno significativo: il principio "Ricerca non decide le regole di visibilità" è già rispettato ovunque (`identita-accessi.md` §7) |
| **Notifiche** | Concetto trasversale/generico | Dominio Generico già previsto dal Domain Model v1 | No, resta trasversale | Sì per un documento logico dedicato nella v1 | Tutti gli 11 domini (come produttori di eventi di dominio) | Nessuno: reagisce ai fatti, non li possiede (principio "fatti accaduti") |
| **Comunicazioni** | Concetto trasversale, sovrapposto a Notifiche | Non ancora un dominio proprio | Possibile, ma di priorità bassa | Sì | Identità & Accessi (§9, "Iscrizione a comunicazioni" come Preferenza) | Con Notifiche: da chiarire se restano lo stesso concetto o due domini distinti |
| **Messaggistica** | Non presente in alcun documento attuale | Nessuno | Possibile dominio futuro, non ancora evocato | Sì | Nessuno esplicitamente | Con Collaborazioni (che esclude esplicitamente la messaggistica dal proprio perimetro, §2 di `collaborazioni.md`) |
| **Moderazione** | Funzione trasversale esercitata da uno Staff/Redazione concettuale, non un dominio a sé | Esercitata all'interno di ogni dominio (Imprese §9, Contenuti editoriali §10-§12) come parte del proprio ciclo editoriale | Improbabile come dominio autonomo; più probabile restare funzione trasversale | Sì come dominio a sé | Imprese, Opportunità, Eventi, Contenuti editoriali | Con Identità & Accessi (Ruolo applicativo "moderatore", già distinto da un dominio Moderazione autonomo) |
| **Privacy** | Dominio futuro esplicitamente evocato | Identità & Accessi ne gestisce solo la componente di Consenso/accesso (§9, §15, domanda aperta esplicita "relazione con un futuro dominio Privacy dedicato") | Sì, esplicitamente evocato come necessario | No come componente minima (Consenso) già presente; sì come disciplina legale completa | Identità & Accessi | Con Identità & Accessi: già dichiarato che quel dominio "non sostituisce un futuro modello legale completo della privacy" (`identita-accessi.md` §9) |
| **Reputazione** | Dominio futuro esplicitamente escluso dal perimetro attuale | Nessuno | Sì, candidato esplicito (evocato in `professionisti.md` §15, `collaborazioni.md` §15) | Sì | Professionisti, Collaborazioni | Con Verifica (§9): un futuro dominio Reputazione non deve diventare un badge generico; dovrà restare distinto dagli assi di verifica specifici |
| **Segnalazioni** | Parzialmente presente come entità locale ("Segnalazione" di sicurezza in Identità & Accessi §2); assente come funzione generale di moderazione dei contenuti | Identità & Accessi (solo per la sicurezza dell'Account) | Possibile dominio futuro per segnalazioni di contenuto/comportamento | Sì per l'estensione generale | Identità & Accessi | Con Moderazione: da chiarire se sono lo stesso concetto |
| **Pagamenti** | Esplicitamente escluso da tutti i documenti che lo evocano | Nessuno | Sì, dominio futuro esplicito | Sì | Eventi, Collaborazioni, Professionisti (tutti lo escludono esplicitamente dal proprio perimetro) | Nessuno attuale: esclusione coerente e ripetuta in tutti i documenti |
| **Contratti** | Esplicitamente escluso | Nessuno | Sì, dominio futuro esplicito, distinto da Accordo preliminare | Sì | Collaborazioni (lo esclude esplicitamente, §1) | Con Collaborazioni: già disambiguato (l'Accordo preliminare non è un Contratto) |
| **Documenti** | Presente solo come riferimento/attribuzione locale (Riferimento documentale in Contenuti editoriali, Documento richiesto in Opportunità), non come sistema di gestione documentale | Nessun dominio possiede una "libreria documenti" condivisa | Possibile dominio futuro se necessaria una gestione documentale strutturata (es. upload/verifica documenti) | Sì | Contenuti editoriali, Opportunità, Professionisti (evidenze) | Con Fonte/Evidenza (pattern già distribuito): un futuro dominio Documenti dovrebbe restare un servizio di supporto, non un nuovo proprietario dei fatti che i documenti attestano |
| **Luoghi** | Concetto descrittivo locale (attributo di Evento/Impresa), non entità condivisa | Nessuno lo possiede come entità riusabile | Possibile dominio futuro, esplicitamente evocato in `eventi.md` §8/§15 | Sì | Eventi, Imprese (sedi) | Con Immobiliare: da chiarire se un futuro dominio Luoghi includerebbe anche gli immobili o resterebbe distinto |
| **Territori** | Già esistente come Tassonomia condivisa (geografia italiana), non manca | Tassonomia condivisa (dominio Generico del Domain Model v1) | No, già gestito, ma senza documento logico dedicato tra gli 11 | No | Imprese, Eventi, Professionisti, Persone (indirettamente) | Nessuno: distinzione da Mercato internazionale già stabilita ovunque |
| **Settori e classificazioni** | Già esistente come Tassonomia condivisa | Tassonomia condivisa | No | No | Imprese, Opportunità, Eventi, Professionisti | Nessuno |
| **Immobiliare** | Dominio futuro esplicitamente evocato più volte | Nessuno (solo riferimenti locali, §12) | Sì, esplicitamente evocato (`collaborazioni.md` §15, `eventi.md` §15, `professionisti.md` §15) e confermato come area futura distinta dai profili utente dalla decisione vincolante n. 26 del mandato | Sì | Collaborazioni, Professionisti, Eventi | Con Luoghi (sovrapposizione possibile, da chiarire in futuro) |
| **Organizzazioni istituzionali** | Vedi §12 | Nessuno in modo esplicito | Possibile estensione di Imprese o dominio a sé | Da valutare | Mercati Internazionali, Eventi, Imprese | Con Imprese: se estesa lì, deve restare distinta la natura non economica |
| **Sondaggi e questionari** | Esplicitamente evocato come dominio futuro | Nessuno | Sì (`osservatorio.md` §15, "futura gestione di sondaggi e questionari come Fonte diretta strutturata") | Sì | Osservatorio | Con Osservatorio: dovrebbe restare uno strumento di raccolta (una Fonte), non un nuovo tipo di Indicatore |
| **Media e allegati** | Concetto trasversale gestito localmente da ciascun dominio (MediaImpresa in Imprese, Contenuto multimediale in Contenuti editoriali) | Ciascun dominio possiede i propri media | No, non richiede un dominio dedicato nella prima versione | No come funzione locale; sì come libreria condivisa | Imprese, Contenuti editoriali, Eventi | Minimo: nessun dominio ne rivendica la proprietà condivisa, ogni dominio gestisce i propri allegati |

**Sintesi.** Formazione, Immobiliare, Reputazione, Pagamenti, Contratti e Privacy sono i candidati più maturi e più volte evocati esplicitamente dai documenti stessi come domini futuri; Servizi è un dominio parzialmente ereditato dal Domain Model v1 che richiede ancora un proprio documento logico per la parte non coperta da Professionisti; Ricerca, Notifiche, Territori, Settori/classificazioni e Media/allegati restano correttamente concetti trasversali o generici senza necessità di un documento dedicato nella prima versione; Comunicazioni, Messaggistica, Moderazione, Segnalazioni, Documenti, Luoghi, Organizzazioni istituzionali e Sondaggi/questionari sono aree emergenti non ancora mature per una decisione, da tenere monitorate.

---

## 14. Modifiche apportate a ogni file (Parte 11)

| File | Sezione | Problema | Correzione | Motivazione |
|---|---|---|---|---|
| `docs/domain-model.md` | Intero documento | Il file presente nella directory di lavoro era un segnaposto senza contenuto, mentre gli 11 documenti specialistici lo citano come fondamento generale | Riscrittura integrale secondo la struttura a 15 punti richiesta dal mandato (§10), come sintesi autorevole coerente con gli 11 documenti | Il documento generale deve rispecchiare l'architettura logica realmente esistente; un segnaposto avrebbe reso inaffidabile ogni riferimento incrociato dei documenti specialistici |
| `docs/architecture/logical/imprese.md` | §1 ("Cosa NON comprende" e "Quali domini dipendono da esso") | La domanda aperta "se un professionista individuale debba essere modellato come un'Impresa... resta una domanda aperta" era già risolta da `logical/professionisti.md`, non ancora esistente al momento della scrittura di questo documento | Sostituita l'ipotesi sospesa con un riferimento esplicito a `logical/professionisti.md` come dominio confermato autonomo, chiarendo che un professionista è una Persona con quel ruolo, e che può coesistere con la titolarità di un'Impresa senza confondersi con essa | Evitare che un documento più vecchio contraddica implicitamente una decisione già presa da un documento più recente e autoritativo sulla stessa domanda |
| `docs/architecture/logical/imprese.md` | §11 (Casi limite, "Professionista con partita IVA") | La stessa ipotesi sospesa compariva anche nella descrizione del caso limite | Riformulato il caso limite per distinguere esplicitamente il fatto di essere Professionista dal fatto di essere titolare di un'Impresa, coerentemente con `professionisti.md` | Stessa motivazione del punto precedente, applicata al caso limite specifico |
| `docs/architecture/logical/imprese.md` | §12 (Domande aperte) | La domanda "I professionisti individuali devono appartenere al dominio Imprese o a un dominio Professionisti distinto?" era ormai risolta | Rimossa la domanda dall'elenco delle domande ancora aperte | Una domanda già risolta da un documento successivo non deve restare elencata come aperta |
| `docs/architecture/logical/imprese.md` | §14 (Dipendenze con i futuri domini) | La voce "Professionisti — se confermato come dominio distinto (§12)" era una previsione ipotetica ormai superata | Aggiornata la voce per riflettere che il dominio è confermato e autonomo | Coerenza con la decisione presa in `professionisti.md` |
| `docs/architecture/logical/imprese.md` | §1 (tabella "Confini espliciti") | La riga "Professionisti \| Confine da chiarire (§12) \| Da chiarire (§12)" non è stata individuata nella prima passata di correzione e lasciava un confine dichiarato "da chiarire" nonostante la questione fosse già risolta altrove nel documento | Sostituita con una descrizione esplicita del confine (referenziato come contesto organizzativo/collaborazione professionale, mai come proprietario del profilo professionale) | Evitare che una singola tabella riproponga, in forma isolata, una domanda già risolta nel resto del documento |
| `docs/architecture/logical/imprese.md` | §15 (Decisioni finali del modello) | L'elenco delle domande volutamente aperte citava ancora "confine con i Professionisti" tra le questioni in sospeso | Aggiunta una decisione esplicita che dichiara il confine risolto, e rimosso il riferimento ai Professionisti dall'elenco delle domande di dettaglio ancora aperte | Coerenza tra la sezione delle decisioni finali e le correzioni già applicate al resto del documento |
| `docs/architecture/logical/mercati-internazionali.md` | §6 (Soggetti e relazioni coinvolte, tabella) | La cella "Professionisti \| Persone, o dominio Professionisti se distinto (questione aperta ereditata da `imprese.md` §12)" era obsoleta | Sostituita con il riferimento diretto a `logical/professionisti.md` come dominio confermato | Stessa motivazione: aggiornare un riferimento a una domanda ormai risolta |
| `docs/architecture/logical/opportunita.md` | §1 (Cosa NON rientra) | La frase "Non rientrano i Professionisti, se confermati come dominio distinto..." era obsoleta | Aggiornata la frase con il riferimento a `logical/professionisti.md` come dominio confermato autonomo | Stessa motivazione |
| `docs/architecture/logical/opportunita.md` | §15 (Domande aperte) | La domanda "Qual è il collegamento esatto con un futuro dominio Professionisti, se confermato distinto da Imprese..." era ormai risolta nella sua premessa | Rimossa la domanda dall'elenco | Una domanda la cui premessa (l'esistenza del dominio) è già risolta non deve restare elencata come aperta nella sua formulazione originaria |
| `docs/architecture/logical/collaborazioni.md` | §1 (Cosa NON rientra) | Stessa ipotesi sospesa su Professionisti | Aggiornata con riferimento a `logical/professionisti.md` come dominio confermato | Stessa motivazione |
| `docs/architecture/logical/collaborazioni.md` | §6 (Soggetti e ruoli, tabella) | Cella "Professionista \| Persone, o dominio Professionisti se distinto (questione aperta ereditata da `imprese.md` §12)" obsoleta | Sostituita con riferimento diretto a `logical/professionisti.md` | Stessa motivazione |
| `docs/architecture/logical/collaborazioni.md` | §15 (Domande aperte) | Domanda sul collegamento con un "futuro dominio Professionisti, se confermato" ormai risolta nella sua premessa | Rimossa la domanda dall'elenco | Stessa motivazione |

**File specialistici non modificati.** `persone.md`, `appartenenze.md`, `professionisti.md`, `eventi.md`, `contenuti-editoriali.md`, `osservatorio.md` e `identita-accessi.md` non hanno richiesto alcuna modifica: non contengono contraddizioni, ambiguità di proprietà, termini incompatibili, relazioni incoerenti, stati sovrapposti, eventi con nomi contraddittori, dipendenze circolari non governate, o riferimenti a domini inesistenti trattati come già definitivi. Le differenze legittime individuate in questi documenti (§4.2) sono state documentate in questo rapporto senza alterare il testo, in coerenza con il vincolo "non effettuare modifiche puramente stilistiche estese".

**Nuovo file creato.** `docs/architecture/logical/reconciliation-report.md` (questo documento).

---

## 15. Questioni ancora aperte

Le domande aperte elencate nelle sezioni "§15 Decisioni finali e domande aperte" (o equivalenti) degli 11 documenti sono numerose (oltre 90 in totale) e in parte si sovrappongono. Sono qui raggruppate per tema, eliminando le duplicazioni, distinguendole dai domini futuri candidati (già trattati integralmente al §13) e dalle differenze legittime (§4.2, non sono "questioni aperte" ma scelte già fatte e documentate).

**Priorità e implementazione dei livelli di verifica.** Quali dei livelli di verifica descritti (Imprese §8, Mercati §10, Opportunità §11, Professionisti §11, Eventi §12, Contenuti editoriali §11-§13) saranno realmente implementati per primi, e con quali risorse — è una decisione di prodotto/roadmap, non di modello, ricorrente in quasi tutti i documenti.

**Continuità storica delle entità economiche.** Come rappresentare in modo stabile fusioni, cessioni e trasformazioni societarie mantenendo la continuità delle relazioni (Imprese §11-§12); come gestire cambi di rappresentante e le deleghe del rappresentante precedente (Appartenenze, Identità & Accessi §13 caso 20).

**Identità e accessi — famiglia di questioni più ampia.** Rapporto massimo tra Account e Persona (uno-a-uno o più Account per Persona in casi motivati); gestione di Account compromessi, duplicati o di soggetti deceduti; criteri di verifica per soggetti esteri e minorenni; uso di pseudonimi pubblici; governance dei permessi e delle deleghe a catena, e relativa durata massima; relazione con un futuro dominio Privacy dedicato; criteri di accesso per operatori di assistenza, collaboratori esterni e ricercatori (`identita-accessi.md` §15, elenco completo di 38 domande, non riprodotto qui per intero).

**Governance e priorità dell'Osservatorio.** Quali informazioni dei singoli domini alimenteranno realmente l'Osservatorio, con quale livello di aggregazione/anonimizzazione (ricorrente in quasi tutti i documenti sorgente); gestione futura di sondaggi e questionari come Fonte diretta (`osservatorio.md` §15).

**Moderazione e conservazione editoriale.** Come gestire operativamente commenti e segnalazioni sui Contenuti editoriali; per quanto tempo mantenere consultabile lo storico di Opportunità concluse/annullate prima di un'archiviazione più profonda (`opportunita.md` §15, `contenuti-editoriali.md` §15).

**Aspetti operativi di Eventi internazionali.** Regole operative per Eventi con più lingue e più fusi orari; responsabilità precisa tra Eventi, Professionisti e un eventuale dominio Servizi linguistici per la formazione multilingue (`eventi.md` §15).

**Strutturazione di dati economici in Opportunità.** Se le risorse economiche complessive di un'Opportunità (es. budget di un bando) debbano diventare un dato strutturato o restare descrittive; come trattare graduatorie ed esiti di una procedura competitiva (`opportunita.md` §15).

**Responsabilità della piattaforma nelle Collaborazioni attive.** Quale responsabilità assume la piattaforma, se alcuna, nei rapporti tra le parti una volta che una Collaborazione è avviata; come gestire operativamente le contestazioni (`collaborazioni.md` §15).

**Classificazione futura dei Professionisti.** Se professionisti regolamentati e non regolamentati dovranno diventare sotto-domini distinti, e se "Servizi" resterà un dominio unico o si articolerà in sotto-domini (`professionisti.md` §15).

Queste questioni restano intenzionalmente aperte: nessuna richiede una correzione dei documenti esistenti, perché nessuna riguarda una contraddizione, ma una decisione di prodotto, di implementazione o di roadmap non ancora presa. Sono riportate in forma sintetica anche in `docs/domain-model.md` §14.

---

## 16. Rischi architetturali residui

| # | Rischio | Descrizione | Mitigazione raccomandata |
|---|---|---|---|
| 1 | Modello a molti assi indipendenti | Quasi ogni entità ha 4-8 assi di stato indipendenti (§8): un'implementazione affrettata potrebbe comprimerli in un singolo campo "stato", violando il principio più ripetuto dell'intera architettura | Portare esplicitamente questo rapporto e i relativi paragrafi di ciascun documento logico come riferimento vincolante nella fase di modello fisico, non solo come nota storica |
| 2 | "Servizi" non ancora modellato a livello logico | Il dominio erede del Domain Model v1 (finanziario, immobiliare, utility, professionale generico) rischia di essere implementato ad-hoc, senza la stessa disciplina degli 11 domini già riconciliati, se il progetto avanzasse verso il fisico senza prima produrne il modello logico | Produrre un documento logico dedicato prima di modellare fisicamente qualsiasi tabella per questi verticali |
| 3 | Domini futuri numerosi e non prioritizzati | Formazione, Immobiliare, Reputazione, Privacy, Pagamenti, Contratti, Organizzazioni istituzionali, Luoghi, Documenti, Sondaggi (§13) sono tutti candidati legittimi ma senza una priorità dichiarata: il rischio è che vengano introdotti nel fisico in modo incoerente tra loro, ciascuno con le proprie convenzioni | Stabilire, come decisione di prodotto separata da questa riconciliazione, un ordine di introduzione dei domini futuri, applicando a ciascuno lo stesso processo concettuale→logico→fisico già seguito per gli 11 domini attuali |
| 4 | Pattern "Fonte/Evidenza/Verifica" ripetuto in 9 domini | È una scelta logica corretta (ogni dominio verifica i propri fatti), ma un'implementazione fisica ingenua potrebbe generare nove strutture tecniche quasi identiche senza alcuna astrazione tecnica comune, con rischio di manutenzione elevato | In fase di modello fisico, valutare (senza anticiparlo qui) se un meccanismo tecnico condiviso di "evidenza a supporto di una verifica" sia opportuno, mantenendo comunque la proprietà logica distinta per dominio |
| 5 | Rischio di reidentificazione nell'Osservatorio | Già riconosciuto esplicitamente da `osservatorio.md` §11 come responsabilità specifica del dominio, ma resta un rischio reale quando i domini sorgente sono molti e le popolazioni aggregate possono essere piccole (es. "professionisti di una specifica nazionalità in una piccola provincia") | Nessuna azione nel modello logico oltre a quanto già previsto; da trattare con priorità alta nel modello fisico e nelle regole di aggregazione minima |
| 6 | Domande aperte numerose (oltre 90, §15) senza governance centralizzata | Il rischio è che, durante la progettazione fisica, alcune di queste domande vengano risolte implicitamente da scelte tecniche (es. un vincolo di unicità) senza una decisione esplicita a livello di prodotto | Istituire un processo per cui ogni domanda aperta elencata in questo rapporto (§15) venga esplicitamente chiusa con una decisione di dominio prima di tradursi in un vincolo fisico, non il contrario |
| 7 | Obsolescenza documentale ricorrente | La causa delle due incoerenze reali corrette in questa riconciliazione (§4.1) è stata l'ordine cronologico di scrittura: un documento successivo risolve una domanda che un documento precedente aveva lasciato aperta, senza che quest'ultimo venga aggiornato. Il rischio si ripresenterà se in futuro verranno scritti altri documenti logici (es. per i domini futuri del §13) | Introdurre una prassi leggera di verifica di coerenza (anche solo una ricerca testuale delle domande aperte risolte) ogni volta che un nuovo documento logico viene completato, prima di considerarlo definitivo |
| 8 | Confine ancora indefinito per le Organizzazioni istituzionali | Se in futuro si decidesse di estendere il dominio Imprese per includerle, il rischio è di far scivolare in Imprese soggetti non economici, contraddicendo il principio "Impresa come soggetto economico" ripetuto in tutta l'architettura | Se e quando questo dominio verrà affrontato, valutare con la stessa attenzione dedicata alla distinzione Persona/Impresa (`persone.md`, `imprese.md`) se meriti un dominio a sé o una vera estensione di Imprese, non una scorciatoia implementativa |

Nessuno di questi rischi è già un problema architetturale presente negli 11 documenti: sono tutti rischi di **implementazione futura** che questa riconciliazione rende visibili in anticipo, non difetti del modello logico attuale.

---

## 17. Valutazione finale di coerenza

L'architettura logica risultante dagli 11 documenti è **coerente nel suo insieme**. Gli elementi a supporto di questa valutazione:

1. **Proprietà unica dei fatti sostanziali** — verificata per tutti i concetti della matrice (§3.2): nessun fatto ha due proprietari in conflitto.
2. **Confini espliciti e reciprocamente rispettati** — tutti i dieci confini critici richiesti dal mandato (§6) risultano già rispettati dai documenti esistenti, senza eccezioni.
3. **Terminologia sostanzialmente uniforme** — le uniche vere aree di attenzione terminologica (Ruolo, Qualifica, Titolo, Servizio/Offerta, Fonte/Evidenza/Verifica) erano già disambiguate nei singoli documenti; questo rapporto le consolida in un glossario unico (§7) senza dover correggere il testo dei documenti.
4. **Assi di stato compatibili** — nessuna incompatibilità di significato tra domini per gli stessi termini di stato (§8); un'unica sovrapposizione di superficie ("Contestato") è già dichiarata come applicazione dello stesso principio a due livelli.
5. **Verifica multidimensionale rispettata ovunque** — nessun badge generico di "verificato" esiste in nessuno degli 11 documenti (§9).
6. **Eventi di dominio coerenti** — uso uniforme del participio passato, nessun comando, nessuna duplicazione con significato incompatibile (§10).
7. **Nessuna dipendenza circolare problematica** — le uniche relazioni bidirezionali sono legittime e con proprietari chiari (§11).
8. **Due incoerenze reali, entrambe minori e documentali** — non concettuali, entrambe corrette (§4, §5, §14).
9. **Un solo gap architetturale reale** — il documento generale `docs/domain-model.md` era un segnaposto; è stato riscritto integralmente come parte di questa riconciliazione.

Le aree che restano da chiarire (§13, §15, §16) sono **aree di sviluppo futuro dichiarato**, non difetti del modello attuale: la maggior parte è già esplicitamente segnalata come tale dagli stessi documenti specialistici, il che è di per sé un segnale di maturità architetturale (i documenti riconoscono onestamente i propri limiti anziché presumere di aver già risposto a tutto).

**Valutazione sintetica: architettura logica riconciliata e internamente coerente**, con un numero contenuto e ben identificato di questioni di prodotto/roadmap ancora da decidere, nessuna delle quali blocca la comprensione del modello nella sua interezza.

---

## 18. Raccomandazione sul passaggio al modello fisico

**Il passaggio al modello fisico è raccomandato, con perimetro esplicito.**

1. **Per gli 11 domini riconciliati** (Persone, Imprese, Appartenenze, Mercati Internazionali, Opportunità, Collaborazioni, Professionisti, Eventi, Contenuti editoriali, Osservatorio, Identità & Accessi): il passaggio al modello fisico è ora consentito, dominio per dominio, seguendo lo stesso processo già validato per il dominio Persone (modello logico → riconciliazione → modello fisico → piano di migrazione → migrazioni). Questa riconciliazione soddisfa la decisione vincolante n. 29 del mandato ("il modello logico deve precedere il modello fisico") e la n. 30 ("il passaggio al modello fisico è consentito solo dopo la riconciliazione") per questi 11 domini.
2. **Per i domini futuri candidati** (§13): il passaggio al modello fisico **non** è raccomandato prima che ciascuno abbia un proprio documento logico dedicato, con lo stesso livello di rigore degli 11 esistenti. In particolare, "Servizi" merita priorità perché è già evocato operativamente da più documenti esistenti.
3. **Priorità raccomandata per il modello fisico**, in base a dipendenze e maturità: Imprese e Appartenenze (secondo e terzo dominio, dopo Persone già completato) → Mercati Internazionali → Opportunità e Collaborazioni → Professionisti → Eventi → Contenuti editoriali → Osservatorio → Identità & Accessi (spesso necessario in anticipo o in parallelo, essendo infrastruttura abilitante trasversale). Questa priorità rispecchia le dipendenze mappate al §11 e può essere adattata da chi guida il progetto.
4. **Condizione di attenzione, non di blocco**: durante il modello fisico, ogni asse di stato multiplo (§8), ogni pattern Fonte/Evidenza/Verifica (§9, §16 rischio 4) e ogni principio di non-automatismo dichiarato nei documenti logici deve essere preservato nella struttura fisica, anche quando questo richiede più complessità tecnica di un singolo campo di stato.

**Raccomandazione finale: procedere al modello fisico per gli 11 domini riconciliati, mantenendo tracciabilità esplicita verso i paragrafi corrispondenti dei rispettivi documenti logici e di questo rapporto.**

---

## Controllo finale del rapporto

1. **Tutti gli 11 documenti letti integralmente** — verificato (§1, §2): incluse tabelle, note, casi limite e domande aperte di ciascuno.
2. **`docs/domain-model.md` aggiornato** — verificato: riscritto integralmente (si veda il documento).
3. **`docs/architecture/logical/reconciliation-report.md` creato** — verificato: questo documento.
4. **Ogni concetto centrale ha un dominio proprietario** — verificato (§3.2), con le due eccezioni consapevoli e dichiarate (Fonte/Evidenza/Verifica come pattern locali, Visibilità come principio distribuito), nessuna delle quali produce ambiguità reale.
5. **Nessuna contraddizione nota non dichiarata** — verificato (§4): le due incoerenze reali trovate sono state corrette (§5, §14); le cinque differenze legittime sono dichiarate esplicitamente come tali, non presentate come irrisolte.
6. **Tutte le modifiche ai documenti sono elencate nel rapporto** — verificato (§14): tabella completa file/sezione/problema/correzione/motivazione.
7. **Glossario canonico coerente** — verificato (§7): 51 termini definiti, ciascuno con una sola forma principale, sinonimi da evitare esplicitati, dominio proprietario indicato.
8. **Assi di stato compatibili** — verificato (§8): 14 famiglie di assi, 16 termini specifici richiesti dal mandato, nessuna incompatibilità di significato.
9. **Verifiche multidimensionali** — verificato (§9): 15 tipi di verifica distinti individuati, nessun badge generico in nessuno degli 11 documenti.
10. **Eventi di dominio formulati come fatti avvenuti** — verificato (§10): participio passato uniforme, nessun comando, nessuna duplicazione con significato incompatibile.
11. **Domini futuri non descritti come già implementati** — verificato (§13): ogni dominio futuro candidato è esplicitamente qualificato come tale, mai presentato come esistente.
12. **Nessun riferimento tecnico o di database introdotto** — verificato: né in questo rapporto né nelle correzioni apportate ai documenti specialistici compaiono riferimenti a database, SQL, tabelle, colonne, chiavi, indici, RLS, API, migration o componenti implementativi.

### Riepilogo finale

**Esito complessivo.** Riconciliazione completata con successo. L'architettura logica dei 11 domini è internamente coerente; le due incoerenze reali individuate sono state corrette; le differenze legittime sono state documentate senza alterare i documenti specialistici.

**File creati.** `docs/architecture/logical/reconciliation-report.md`; `docs/domain-model.md` è stato riscritto (non creato ex novo, il file esisteva già come segnaposto).

**File modificati.** `docs/domain-model.md` (riscrittura integrale); `docs/architecture/logical/imprese.md` (4 correzioni puntuali, §14); `docs/architecture/logical/mercati-internazionali.md` (1 correzione puntuale, §14); `docs/architecture/logical/opportunita.md` (2 correzioni puntuali, §14); `docs/architecture/logical/collaborazioni.md` (3 correzioni puntuali, §14).

**File non modificati.** `docs/architecture/logical/persone.md`, `appartenenze.md`, `professionisti.md`, `eventi.md`, `contenuti-editoriali.md`, `osservatorio.md`, `identita-accessi.md`.

**Incoerenze trovate.** 2 reali (documentali, §4.1) + 5 differenze legittime non correttive (§4.2).

**Incoerenze corrette.** 2/2 (§5, §14).

**Decisioni consolidate.** Le 30 decisioni vincolanti elencate nel mandato sono state tutte verificate come già rispettate dagli 11 documenti esistenti (si veda la loro conferma puntuale nei §§6, 8, 9, 11 di questo rapporto e in `docs/domain-model.md` §13).

**Questioni ancora aperte.** Raggruppate per tema al §15; nessuna blocca la comprensione del modello nel suo complesso.

**Valutazione sull'idoneità al passaggio al modello fisico.** Idoneo per gli 11 domini riconciliati, con priorità e condizioni di attenzione indicate al §18. Non idoneo, prima di un proprio documento logico dedicato, per i domini futuri candidati elencati al §13.
