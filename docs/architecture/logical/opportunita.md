# Logical Data Model — Dominio OPPORTUNITÀ

> Livello logico e di dominio. Nessun riferimento a database, SQL, PostgreSQL, Supabase, tabelle, colonne, tipi dato tecnici, chiavi primarie o esterne, indici, constraint tecnici, RLS, API, migration, backend, frontend, componenti dell'interfaccia o dettagli implementativi. Nessun codice.
> Fondamenti (non modificati da questo documento): [`docs/architecture/fundamental/opportunita-domain-thesis.md`](../fundamental/opportunita-domain-thesis.md) (**normativa** per il significato del dominio), [`docs/domain-model.md`](../../domain-model.md), [`docs/architecture/logical/persone.md`](./persone.md), [`docs/architecture/logical/imprese.md`](./imprese.md), [`docs/architecture/logical/appartenenze.md`](./appartenenze.md), [`docs/architecture/logical/mercati-internazionali.md`](./mercati-internazionali.md), [`docs/architecture/logical/professionisti.md`](./professionisti.md), [`docs/architecture/logical/collaborazioni.md`](./collaborazioni.md), [`docs/architecture/physical/domain-dependency-map.md`](../physical/domain-dependency-map.md).
> Scopo del documento: definire il modello logico del dominio Opportunità, terzo pilastro Core della piattaforma, in conformità alla Domain Thesis. Traduce il ruolo già riconosciuto dal Domain Model in entità, relazioni, cardinalità, stati e regole, restando esclusivamente sul piano concettuale.
> Ruolo strategico. Opportunità è una **possibilità azionabile strutturata**: beneficio o accesso reso disponibile sotto condizioni, a destinatari dichiarabili, in un periodo definito, rispetto al quale è possibile un'azione di accesso concreta. Non è contenitore editoriale, semplice informazione, Evento, Collaborazione o Servizio. Il menu pubblico non prova l'appartenenza al dominio: tipizzazioni ammesse solo se soddisfano il nucleo (tesi §20, §23).

---

## 1. Responsabilità del dominio

**Cosa rappresenta.** Il dominio Opportunità rappresenta una **possibilità azionabile strutturata** (tesi §20): un beneficio o un accesso reso disponibile — da un promotore e/o da una fonte — a destinatari dichiarabili, sotto condizioni e in un periodo, tale che un interessato possa compiere un'azione di accesso specifica. Il dominio possiede la **rappresentazione governata** sulla piattaforma e, quando assunti, i processi interni di accesso; **non** possiede automaticamente il fatto istituzionale esterno (norma, graduatoria ufficiale, erogazione, domanda sul sito dell'ente).

**Origine esterna e interna.** Esistono due varianti dello stesso dominio (tesi §22), non due domini: **esterna** (esiste indipendentemente; la piattaforma la censisce e rappresenta) e **interna** (creata o governata in piattaforma come sede del processo). PC2 resta aperto quanto alla possibilità di più Aggregate Root.

**Quali problemi risolve.** Rende trovabili e confrontabili occasioni disperse tra fonti eterogenee; distingue un'occasione azionabile da notizia, Evento o Collaborazione (§3); segnala compatibilità potenziale senza promettere ammissione (§6, §12); ricostruisce lo storico delle opportunità per territorio, settore o categoria di destinatari.

**Cosa rientra nel dominio.** L'Opportunità come aggregate root della rappresentazione (§2); tipologia (§4); origine esterna/interna; promotori, fonti, pubblicatori e destinatari (§5); requisiti e ammissibilità (§6); benefici dichiarati e modalità di accesso (§7); candidatura **condizionata** (§7.1); ciclo di vita multi-asse (§8); temporalità (§9); collegamenti territoriali/settoriali/mercato (§10); verifica e fonti (§11); visibilità e personalizzazione (§12).

**Cosa NON rientra nel dominio.**
- Non rientrano le **Collaborazioni**: processo collaborativo distinto (`logical/collaborazioni.md`). Una Collaborazione può registrare origine storica da un'Opportunità (**D22**, unidirezionale Collaborazioni → Opportunità); Opportunità non possiede Collaborazioni né ne condivide l'autorità. Nessuna trasformazione automatica (Domain Model, decisione 7).
- Non rientrano gli **Eventi**: fiera, corso, webinar in quanto accadimenti organizzati. Opportunità può referenziare un Evento come contesto; Eventi può referenziare Opportunità (**D27**); nessuna incorporazione reciproca di data, sede, programma, iscrizione o biglietto.
- Non rientrano i **Contenuti Editoriali**: articolo, guida, approfondimento, newsletter, alert — narrano o aggregano senza possedere l'Opportunità.
- Non rientrano **Servizi** (futuro), **ServizioProfessionale**, prodotti finanziari commerciali, erogazioni, pagamenti, contratti.
- Non rientrano l'**Impresa** e la **Persona** in quanto tali (riferimenti opachi; **D14**, **D15**; **V8**).
- Non rientra l'**Appartenenza**: utilizzo del titolo di rappresentanza (**D17**, quando applicabile), senza duplicarla.
- Non rientrano i **Professionisti** come soggetti: il Professionista è qualificazione della Persona; Opportunità può referenziare il Profilo per requisiti/destinatari (**D16** facoltativa). **DV10** (eventuale riferimento da ServizioProfessionale) resta aperta.
- Non rientrano **Osservatorio**, **identità digitale / permessi tecnici** (Identità & Accessi), **Mercati Internazionali** come concetto (solo riferimento **D18**), **Organizzazioni istituzionali** non formalizzate (riferimento informativo esterno).

**Quali domini utilizza.**
- **Persone** e **Imprese** — identità di promotore, candidato, beneficiario (D14, D15).
- **Appartenenze** — titolo di rappresentanza (D17, utilizzo quando applicabile).
- **Professionisti** — qualificazione facoltativa (D16).
- **Mercati Internazionali** — contesto facoltativo (D18).
- **Tassonomia Condivisa** — territori e settori (§10).
- **Eventi** — riferimento contestuale facoltativo (nessuna riga Opportunità→Eventi consolidata in Dependency Map; navigabilità ammessa).
- **Identità & Accessi** — dipendenza di supporto alle scritture.

**Quali domini utilizzano Opportunità.**
- **Collaborazioni** — riferimento storico facoltativo unidirezionale (D22).
- **Eventi** — presentazione o generazione facoltativa (D27).
- **Contenuti Editoriali** — narrazione (D34).
- **Osservatorio** — dati aggregati (D42).
- **Ricerca** e **Notifiche** — trovabilità e segnalazioni.

**Perché Opportunità è un dominio autonomo.** Natura propria (tesi H8+H10), ciclo di vita multi-asse, regole di ammissibilità/compatibilità e temporalità che nessun altro dominio replica. Non è relazione stabile tra due soggetti (PF4 **non** è il pattern principale); l'identità della rappresentazione è propria e i soggetti esterni sono referenziati in modo opaco (PF5 sui riferimenti).

**Differenza tra Opportunità, Collaborazione, Evento e contenuto informativo.**

| Concetto | Natura | Elemento distintivo |
|---|---|---|
| Opportunità | Possibilità azionabile strutturata | Beneficio/accesso, condizioni, destinatari, periodo, azione di accesso possibile; rappresentazione governata in piattaforma |
| Collaborazione | Processo collaborativo | Dichiarazione, partecipanti locali, CandidaturaCollaborazione, eventuale relazione; può citare Opportunità solo come origine storica (D22) |
| Evento | Accadimento organizzato | Tempo, luogo, programma, iscrizione; ≠ modalità di accesso a un beneficio |
| Contenuto informativo | Testo o narrazione | Descrive o raggruppa Opportunità senza essere la possibilità cogliibile |

---

## 2. Entità e concetti principali

| Concetto | Natura | Sintesi |
|---|---|---|
| Opportunità | Entità autonoma (aggregate root) | La **rappresentazione governata** della possibilità azionabile sulla piattaforma (identità stabile di scheda), non il fatto istituzionale esterno in sé. PC2 resta aperto se in futuro rappresentazione e processo interno richiedessero AR distinti. |
| Origine (esterna / interna) | Classificazione della variante | Variante di origine nello stesso dominio (§1); non due Aggregate obbligatori. |
| Promotore sostanziale | Relazione/ruolo | Chi offre o istituisce la possibilità: Persona, Impresa o riferimento informativo esterno (§5); ≠ Fonte, ≠ Pubblicatore. |
| Pubblicatore | Relazione/ruolo | Chi pubblica o gestisce la scheda in piattaforma (Persona, eventualmente per Impresa via Appartenenza); può non coincidere con il promotore sostanziale. |
| Redazione / segnalatore | Ruolo di processo | Chi censisce, segnala o approva editorialmente la scheda; distinto dal promotore e dalla fonte. |
| Destinatario potenziale | Concetto descrittivo | Criteri di destinatario (§5); non elenco nominativo; Professionista non è soggetto terzo ma qualificazione della Persona. |
| Tipologia di opportunità | Concetto descrittivo (classificazione) | Catalogo §4; ammesse solo se soddisfano il nucleo azionabile; il menu non prova l'appartenenza. |
| Beneficio | Concetto descrittivo (value object) | Beneficio **dichiarato** dell'Opportunità (§7); non erogazione, pagamento, contratto o prestazione eseguita. |
| Requisito | Entità dipendente | Condizione di ammissibilità dichiarata (§6); tipicamente più di uno. |
| Criterio di ammissibilità | Relazione/concetto di sintesi | Insieme dei Requisiti considerati congiuntamente (§6). |
| Procedura / modalità di accesso | Concetto descrittivo | Come si accede (§7); elenco di modalità possibili, **non** sottotipi di un'unica entità Candidatura. |
| CandidaturaOpportunità | Concetto condizionato — modellazione entità **rinviata** | Fatto eventuale di risposta all'Opportunità (§7.1). Cardinalità concettuale se introdotta: Opportunità **1 → 0..N** CandidatureOpportunità. Mai 1..N obbligatorio. Distinta da CandidaturaCollaborazione, iscrizione Evento, richiesta Servizio, semplice interesse. |
| Periodo di validità | Concetto descrittivo (value object) | Intervallo di validità della possibilità (§9). |
| Scadenza | Concetto descrittivo | Termine di accesso, se presente (§9). |
| Ambito territoriale / settoriale / Mercato di riferimento | Relazione | Riferimenti a Territori, Settori, Mercati senza incorporazione (§10). |
| Fonte | Entità dipendente | Origine dichiarata dell'informazione (§11); pattern locale; ≠ Promotore. |
| Evidenza | Entità dipendente | Riscontro a supporto di una verifica (§11). |
| Contatto informativo | Concetto descrittivo (value object) | Come ottenere informazioni aggiuntive; distinto dalla modalità di accesso. |
| Assi di stato | Assi, non entità | Editoriale, sostanziale/reale, rappresentazione, pubblicazione, visibilità, verifica, temporalità, candidatura (solo se applicabile) — §8. |

**Principio di non duplicazione.** Nessun concetto sopra duplica Persona, Impresa, Mercato, Evento, Appartenenza, Profilo professionale o l'organizzazione promotrice: ruoli e criteri referenziano per identità opaca (PF5), mai nuove schede parallele (V8).

---

## 3. Natura dell'Opportunità

Un'Opportunità (come fatto di piattaforma) si distingue da una semplice notizia per la presenza contemporanea di almeno questi elementi:

- **Beneficio o accesso potenziale** — qualcosa di concreto da ottenere o a cui accedere (§7), non solo informazione.
- **Destinatari individuabili** — criteri su chi può accedere (§5).
- **Condizioni o requisiti** — anche minimi (§6).
- **Periodo di validità** — collocazione temporale, anche senza scadenza precisa (§9).
- **Fonte e/o promotore riconoscibili** — distinti tra loro quando necessario (§5, §11).
- **Modalità di accesso o fruizione** — come se ne può beneficiare (§7); **non** implica obbligatoriamente una candidatura (§7.1).
- **Azione concreta possibile** — candidarsi, presentare domanda, iscriversi a condizioni, aderire, richiedere, manifestare interesse formale, partecipare sotto requisiti, o accedere direttamente (§7).

### Opportunità sostanziale e rappresentazione

| Piano | Significato | Ownership tipica |
|---|---|---|
| **Opportunità sostanziale** | Possibilità effettivamente resa disponibile da ente, finanziatore, impresa, istituzione o piattaforma (atto, procedura ufficiale, erogazione, graduatoria ufficiale) | Spesso esterna alla piattaforma |
| **Rappresentazione** | Scheda governata: titolo, sintesi, destinatari, beneficio dichiarato, requisiti dichiarati, scadenze, fonte, link, classificazioni, stati | **Questo dominio** |

La nascita del fatto di piattaforma è il **censimento/registrazione** della rappresentazione (§9), distinta dall'istituzione sostanziale esterna e dalla pubblicazione.

**Principio.** Un contenuto editoriale può descrivere un'Opportunità senza coincidere con essa. Una notizia priva di destinatari, condizioni, fonte e modalità di accesso non è ancora un'Opportunità di questo dominio.

---

## 4. Tipologie di Opportunità

La classificazione è ampia ma **filtrata dal nucleo** (tesi §23): una voce di menu o di catalogo appartiene al dominio solo se è possibilità azionabile strutturata. Un'Opportunità può assumere una o più tipologie contemporaneamente (non esclusività, come in `logical/mercati-internazionali.md` §5).

| Tipologia | Significato | Nota di confine |
|---|---|---|
| Bandi e contributi | Procedure che assegnano un contributo secondo criteri | Rappresentazione in dominio; atto/graduatoria/erogazione ufficiali restano esterni se esterni |
| Finanziamenti agevolati / misure | Accesso strutturato a finanziamento o misura | **Non** catalogo di prodotti bancari commerciali |
| Incentivi fiscali o economici | Vantaggi economici condizionati | **Non** proprietà della norma o del regime fiscale |
| Agevolazioni | Condizioni favorevoli di accesso a risorsa o servizio | Beneficio dichiarato; non possesso del servizio |
| Gare e appalti (come accesso) | Possibilità di partecipare / segnalazione strutturata | Procedura completa, offerta, contratto: esterni o futuri |
| Convenzioni (solo se adesione azionabile) | Condizioni di adesione strutturate | **Non** automaticamente: accordo già esistente, Collaborazione, Appartenenza, contenuto informativo |
| Formazione (come opportunità di accesso) | Iscrizione condizionata, bando formativo, finanziamento della formazione | Corso/webinar come Evento; catalogo/servizio formativo → futuro Servizi |
| Accelerazione e incubazione | Programmi di supporto strutturato | — |
| Investimento (accesso strutturato) | Occasioni di ottenere/fornire capitale con condizioni | Distinguere da semplice proposta commerciale |
| Internazionalizzazione | Orientate a un Mercato estero (§10) | Riferimento a Mercati; non Presenza/Interesse |
| Fiere e missioni (misure di partecipazione) | Partecipazione/esposizione agevolata, bando per stare in fiera | La fiera in sé = Evento |
| Premi e riconoscimenti | Riconoscimento formale, con o senza beneficio economico | — |
| Accesso a servizi / spazi / reti | Possibilità di fruire a condizioni dichiarate | Non crea dominio Servizi; non possiede ServizioProfessionale |
| Opportunità commerciali / programmi dedicati | Residuali se azionabili strutturate | — |
| Opportunità occupazionali o professionali | Coerenti con la missione | Confine da precisare (§15); non portale lavoro generico |

**Esclusi dal nucleo automatico:** Evento puro; corso/webinar; servizio generico; convenzione non azionabile; prodotto finanziario commerciale; articolo; guida.

---

## 5. Promotori, fonti, pubblicatori e destinatari

**Ruoli distinti (non sinonimi).**
- **Promotore sostanziale** — chi offre o istituisce la possibilità.
- **Ente finanziatore / gestore** — chi finanzia o gestisce la procedura sostanziale (può differire dal promotore).
- **Fonte** — origine dichiarata dell'informazione sulla scheda (§11); non coincide necessariamente con il promotore.
- **Pubblicatore** — chi pubblica o aggiorna la scheda in piattaforma.
- **Redazione / segnalatore** — chi censisce o segnala senza essere necessariamente promotore.

**Possibili Promotori.** Enti pubblici; Unione Europea; amministrazioni; camere di commercio; associazioni; fondazioni; università; incubatori; acceleratori; Imprese (identità opaca); istituzioni finanziarie; reti; organizzazioni internazionali; enti del terzo settore; soggetti privati; la piattaforma stessa (variante interna).

**Principio sui Promotori.** Un Promotore non ha necessariamente scheda propria: Impresa/Persona referenziate per identità; soggetti esterni come riferimento informativo (senza creare dominio Organizzazioni), analogamente a `logical/mercati-internazionali.md` (§6).

**Possibili Destinatari (criteri).** Persone; Imprese; startup; cooperative; Persone con qualificazione professionale (Professionista = qualificazione, non soggetto autonomo; D16); aspiranti imprenditori; categorie dichiarate dal promotore.

**Principio sui Destinatari.** Nessuna esclusiva su origine immigrata (decisione §15). Distinguere: destinatario dichiarato (criterio); eleggibile potenziale; eleggibile verificato (processo interno); candidato; assegnatario/beneficiario — questi ultimi solo quando il processo o la registrazione lo prevedono (§7.1).

---

## 6. Requisiti, ammissibilità e compatibilità

**Piani del requisito (da non fondere).**
- **Requisito dichiarato** — come riportato da fonte/promotore sulla scheda (snapshot di rappresentazione).
- **Requisito strutturato** — espresso in forma classificata (territorio, settore, soglia, ecc.).
- **Requisito verificabile** — per il quale esiste un controllo possibile in piattaforma o dal promotore interno.
- **Requisito applicato a candidatura interna** — usato nel processo interno (§7.1), distinto dal solo testo della scheda.

**Tipologie operative (invariate nella sostanza).**
- **Requisito obbligatorio** — assenza esclude l'accesso.
- **Criterio preferenziale** — favorisce senza escludere.
- **Condizione di esclusione** — presenza esclude.
- **Documento richiesto** — categoria concettuale di prova (non oggetto tecnico).
- **Requisito territoriale / settoriale / economico / dimensionale / temporale / soggettivo / di mercato** — come già descritti; il requisito di mercato **referenzia** fatti di Mercati Internazionali senza crearli; il requisito professionale **referenzia** Professionisti (D16) senza verificare qualifiche in autonomia; il titolo di rappresentanza **utilizza** Appartenenze (D17) senza duplicarle.

**Compatibilità e ammissibilità.**
- **Compatibilità presunta** — segnalazione preliminare senza garanzia (§12).
- **Ammissibilità verificata** — esito di valutazione del Promotore o del processo interno; non automatica.

**Principio cardine.** La piattaforma non dichiara ammissibilità automatica in assenza di informazioni sufficienti. Non duplica fatti autorevoli di Persone, Imprese, Appartenenze, Professionisti o Mercati.

---

## 7. Benefici e modalità di accesso

**Tipologie di beneficio (dichiarato).** Contributo; finanziamento agevolato; credito agevolato; garanzia; agevolazione; servizio agevolato (come beneficio dichiarato, non come possesso del servizio); formazione; consulenza; accesso a reti; visibilità; partecipazione a fiere; accesso a mercati; spazio; strumento; premio; beneficio non monetario residuale.

**Cosa Beneficio non è.** Erogazione economica eseguita; pagamento; contratto; prestazione erogata; graduatoria ufficiale esterna.

**Modalità di accesso (elenco aperto, non un'unica entità).** Candidatura; domanda; iscrizione (all'Opportunità, **≠** iscrizione Evento); adesione; selezione; graduatoria; procedura competitiva; accesso diretto; invito; manifestazione di interesse formale; prenotazione; partecipazione libera.

**Principio.** Più benefici e più modalità possono combinarsi. Non esiste corrispondenza fissa tipologia↔modalità. Le modalità sono alternative o componibili: **non** sono sottotipi di una singola entità generica `Candidatura`.

### 7.1 Candidatura — concetto condizionato (decisione vincolante)

**La candidatura non è obbligatoria.** Un'Opportunità può esistere, essere pubblicata e concludersi **senza** alcuna candidatura. La candidatura **non** è invariante del dominio. Si applica **solo** quando la modalità di accesso lo richiede.

**Tre scenari di proprietà** (tesi §27):

| Scenario | Proprietà | Note |
|---|---|---|
| **Esterna** | Nessuna candidatura in questo dominio | Domanda sul sito dell'ente / procedura fuori piattaforma; la scheda indica solo la modalità e il link |
| **Esterna registrata** | Registrazione dichiarativa facoltativa in Opportunità | Fatto dichiarato; non gestisce la procedura ufficiale |
| **Interna** | Posseduta da Opportunità quando il processo è in piattaforma | Candidatura, ammissibilità, valutazione, selezione, assegnazione locali |

**Cardinalità concettuale** (quando l'entità sarà introdotta nel Physical Mapping): Opportunità **1 → 0..N** CandidatureOpportunità. Mai **1..N** obbligatorio. In questo Logical Model l'entità autonoma **non è ancora introdotta**: resta concetto condizionato esplicito (§2), modellazione rinviata.

**Distinzioni obbligatorie.**
- Candidatura a Opportunità ≠ `CandidaturaCollaborazione` (`logical/collaborazioni.md`)
- ≠ iscrizione a Evento
- ≠ richiesta di Servizio / ServizioProfessionale
- ≠ semplice salvataggio o interesse utente
- ≠ Manifestazione di interesse collaborativa

**Valutazione e assegnazione.** Appartengono a Opportunità solo nel processo interno o come registrazione dichiarativa di esito esterno; non si appropriano di graduatoria/aggiudicazione ufficiali esterne (§15, questione aperta su strutturazione).

---

## 8. Ciclo di vita dell'Opportunità

Il percorso è descritto da **assi distinti** che non devono mai essere compressi in un unico stato (PF7; tesi §28). Esistenza ≠ pubblicazione ≠ verifica ≠ apertura ≠ scadenza ≠ ritiro editoriale.

**a) Stato editoriale (fase redazionale).**
- *Individuata* — notata, non ancora formalizzata.
- *Segnalata* — comunicata formalmente.
- *In valutazione* — valutazione redazionale se/come trattarla.
- *Programmata* / *Approvata* / *Respinta* — esito editoriale rispetto alla pubblicazione.

**b) Stato sostanziale / reale della possibilità.** (asse della disponibilità della possibilità, non della sola scheda)
- *Annunciata* / *Aperta* — accessibile secondo la modalità di accesso (§7).
- *In scadenza* — segnale temporale (§9).
- *Prorogata* — termine posticipato.
- *Sospesa* — non accessibile in modo reversibile.
- *Chiusa* — termine naturale o chiusura ordinaria.
- *Esaurita* — risorse/posti esauriti prima del termine.
- *Revocata* / *Annullata* — ritiro formale o procedura che non avrà luogo.
- *Archiviata* — conservazione storica fuori dai percorsi correnti.

**c) Stato della rappresentazione.** *Acquisita* / *Da completare* / *Aggiornata* / *Obsoleta* / *Ritirata* — qualità e aggiornamento della scheda, distinto da (b).

**d) Stato di pubblicazione.** *Non pubblicata* / *Programmata* / *Pubblicata* / *Ritirata* — distinto da visibilità e da apertura.

**e) Stato di verifica.** *Non verificata* / *In verifica* / *Verificata* / *Non verificabile* / *Contestata* — assi di verifica §11, senza badge unico.

**f) Visibilità.** Trattata al §12 (privata, redazionale, selezionata, pubblica, di rete, ecc.).

**g) Disponibilità per il destinatario.** Se la possibilità è concreta per un destinatario specifico; non altera (b).

**h) Stato della candidatura (solo se applicabile — §7.1).** Mai obbligatorio per l'esistenza dell'Opportunità. Esempi: bozza, presentata, ritirata, ammessa, esclusa, in valutazione, selezionata, respinta, assegnata, rinunciata — relativi alla candidatura, non all'Opportunità nel suo insieme.

**Perché gli assi restano separati.** Un'Opportunità può essere pubblicata ma non ancora aperta; aperta e non verificata; chiusa senza candidature; con rappresentazione obsoleta ma ancora pubblicata; con candidature solo nella variante interna. Comprimerli falsificherebbe combinazioni reali.

---

## 9. Temporalità e scadenze

Momenti da tenere distinti (tesi §26–§28): **istituzione sostanziale** (esterna o interna); **censimento/registrazione** (nascita del fatto di piattaforma); **pubblicazione**; **apertura**; **chiusura**; **scadenza**; **proroga**; **revoca**; **archiviazione**; ultimo controllo fonte; periodi di candidatura/valutazione/assegnazione **solo se applicabili**.

- **Data di apertura** — da quando la possibilità è effettivamente accessibile.
- **Scadenza** — termine di accesso, quando presente.
- **Finestra di candidatura** — intervallo dedicato alle candidature **solo se** la modalità di accesso prevede candidatura (§7.1); altrimenti assente.
- **Opportunità senza scadenza** — legittima: non tutte le Opportunità hanno un termine noto o previsto.
- **Opportunità continuativa** — un'Opportunità pensata per restare aperta stabilmente, senza un'edizione unica (es. un servizio agevolato sempre disponibile).
- **Scadenza indicativa** — un termine noto ma non garantito con certezza dalla fonte (§11), da trattare con la cautela conseguente.
- **Proroga** — un posticipo del termine originario (§8); non deve cancellare la scadenza precedente (§13, invariante), che resta un dato storicizzato.
- **Sospensione** — un'interruzione temporanea e reversibile della disponibilità (§8).
- **Riapertura** — il ritorno allo stato Aperta dopo una Sospensione, senza che questo costituisca una nuova Opportunità.
- **Esaurimento anticipato delle risorse** — corrisponde allo stato "Esaurita" (§8): la disponibilità termina prima del termine naturale.
- **Più finestre temporali** — un'Opportunità può prevedere più finestre distinte (es. più scadenze intermedie all'interno dello stesso periodo di validità).
- **Edizioni successive** — quando un programma si ripete nel tempo (es. un bando annuale), ogni edizione è trattata come un'Opportunità distinta, eventualmente collegata alle precedenti da un riferimento comune (es. l'appartenenza a uno stesso programma), senza che questo implichi continuità automatica di stato o di requisiti.
- **Opportunità ricorrente** — un caso particolare di edizioni successive, quando la ricorrenza è essa stessa una caratteristica nota e attesa (es. un bando che si ripete ogni anno con cadenza regolare).

**Principio.** Una nuova edizione non deve necessariamente sostituire o cancellare lo storico della precedente (§13, invariante): ogni edizione resta un'Opportunità a sé, con il proprio ciclo di vita (§8) e la propria storicizzazione, anche quando condivide con le altre edizioni la stessa tipologia, lo stesso Promotore o lo stesso ambito.

---

## 10. Territori, settori e Mercati Internazionali

**Collegamenti previsti.** Territorio; Comune; Provincia; Regione; Italia; Unione Europea; Paese estero; area economica; settore; filiera; Mercato internazionale.

**Distinzioni da mantenere sempre separate**, coerenti con l'esigenza già evidenziata in altri domini di non confondere ruoli simili:

- **Luogo del promotore** — dove si trova o è basato chi promuove l'Opportunità.
- **Territorio di applicazione** — dove l'Opportunità produce i propri effetti o è valida (es. un incentivo valido solo per attività svolte in una Regione).
- **Sede richiesta al destinatario** — un eventuale Requisito territoriale (§6) che il destinatario deve soddisfare per essere ammissibile.
- **Territorio in cui si realizza l'attività** — dove concretamente avviene l'attività beneficiaria dell'Opportunità (che può differire dalla sede legale del destinatario).
- **Mercato a cui l'Opportunità consente di accedere** — quando l'Opportunità è di natura internazionale (§4), il Mercato (dominio Mercati Internazionali) che diventa raggiungibile o più accessibile grazie ad essa.

**Principio.** Un'Opportunità internazionale può referenziare uno o più Mercati Internazionali (`logical/mercati-internazionali.md` §2) per contestualizzarsi, senza diventare parte di quel dominio: il Mercato resta governato e definito esclusivamente da `logical/mercati-internazionali.md`, mentre questo dominio si limita a dichiarare la relazione (analoga, per ruolo, a `MercatoImpresa` già descritto in `logical/imprese.md` e ripreso in `logical/mercati-internazionali.md` §15, decisione 4).

---

## 11. Fonti, verifica e affidabilità

**Fonte ≠ Promotore ≠ Pubblicatore ≠ Segnalatore** (§5). La Fonte è pattern locale del dominio (PC11): origine dichiarata dell'informazione sulla scheda, con tipizzazione, datazione e attendibilità proprie, distinta dall'Evidenza e dalla Verifica (PP2).

Coerente con l'approccio già adottato in `logical/imprese.md` §8, `logical/appartenenze.md` §10 e `logical/mercati-internazionali.md` §10, la verifica di un'Opportunità non è un singolo indicatore, ma un insieme di **assi indipendenti**:

- **Esistenza dell'Opportunità** — la piattaforma ha potuto confermare che l'Opportunità dichiarata esiste realmente.
- **Identità del promotore** — la piattaforma ha potuto confermare chi è realmente il Promotore.
- **Validità temporale** — la piattaforma ha potuto confermare le date dichiarate (apertura, scadenza, §9).
- **Beneficio** — la piattaforma ha potuto confermare la natura e l'entità del beneficio dichiarato (§7).
- **Requisiti** — la piattaforma ha potuto confermare che i Requisiti dichiarati (§6) corrispondono a quelli realmente richiesti.
- **Modalità di accesso** — la piattaforma ha potuto confermare la Procedura di accesso dichiarata (§7).
- **Scadenza** — la piattaforma ha potuto confermare che la scadenza dichiarata è quella reale e attuale (distinta dalla Validità temporale complessiva, per il suo frequente bisogno di aggiornamento, §9).
- **Disponibilità delle risorse** — la piattaforma ha potuto confermare che le risorse o i posti disponibili non sono già esauriti (§8).
- **Eventuali modifiche o revoche** — la piattaforma ha potuto confermare se l'Opportunità ha subito modifiche sostanziali o una revoca formale rispetto alla dichiarazione originaria.

**Fonti previste.** Fonte ufficiale; portale istituzionale; Promotore; ente partner; associazione; professionista; redazione della piattaforma; segnalazione di un utente; comunicazione pubblica; documento ufficiale.

**Distinzioni tra fonti.**
- **Fonte primaria** — proviene direttamente dal Promotore o da un canale ufficiale da esso controllato.
- **Fonte secondaria** — riporta o commenta un'informazione originata altrove, senza esserne l'origine diretta.
- **Fonte non verificata** — non è stato ancora possibile stabilirne l'attendibilità.
- **Fonte scaduta** — era attendibile, ma le informazioni che riportava non sono più aggiornate.
- **Fonte contraddittoria** — in conflitto con un'altra fonte relativa alla stessa Opportunità, situazione che richiede una risoluzione esplicita prima di considerare l'informazione affidabile.

**Perché non un badge unico.** Un badge generico "Opportunità verificata" nasconderebbe quale specifico aspetto è stato confermato: un'Opportunità può avere l'Esistenza confermata ma la Disponibilità delle risorse non verificata; può avere la Validità temporale confermata ma i Requisiti non ancora controllati nel dettaglio. Mantenere gli assi separati, ciascuno con la propria Fonte ed Evidenza (§2), permette di comunicare con precisione cosa la piattaforma sa per certo, coerente con il medesimo principio già adottato per Imprese, Appartenenze e Mercati Internazionali.

---

## 12. Visibilità, pubblicazione e personalizzazione

- **Opportunità privata** — nota solo a chi l'ha segnalata o dichiarata.
- **In valutazione redazionale** — nota alla redazione, non ancora pubblica (coerente con lo stato editoriale "In valutazione", §8).
- **Visibile a soggetti selezionati** — condivisa con un insieme specifico di destinatari, senza essere pubblica in senso generale.
- **Pubblica** — visibile a chiunque consulti la piattaforma.
- **Riservata a una rete** — visibile solo a chi appartiene a una determinata rete o comunità (es. i membri di un'associazione).
- **Riservata a determinati destinatari** — visibile solo a chi soddisfa criteri specifici dichiarati come condizione di visibilità, distinta dall'ammissibilità (§6).
- **Non più pubblicata ma conservata nello storico** — corrisponde allo stato "Archiviata" (§8): non compare più nei percorsi correnti, ma resta consultabile come riferimento storico.
- **Contestata** — visibile con un'indicazione esplicita che la sua veridicità è in dubbio (§8, §11).
- **Sospesa** — temporaneamente non visibile pubblicamente, in modo reversibile (§8).
- **Archiviata** — coerente con "non più pubblicata ma conservata nello storico".

**Personalizzazione.** Il dominio può suggerire Opportunità pertinenti sulla base di: caratteristiche della Persona; caratteristiche dell'Impresa; territorio; settore; Mercati Internazionali di interesse o presenza dichiarati; interessi dichiarati; requisiti conosciuti.

**Principio cardine.** La personalizzazione deve sempre essere presentata come **compatibilità potenziale**, mai come certezza di ammissione (§6): un'Opportunità suggerita a una Persona o un'Impresa sulla base di una corrispondenza parziale non equivale a un'Ammissibilità verificata, e la piattaforma non deve mai comunicare il contrario, nemmeno implicitamente attraverso il modo in cui il suggerimento viene presentato.

---

## 13. Regole, invarianti e casi limite

**Regole e invarianti.**

1. Ogni Opportunità di piattaforma deve avere una fonte identificabile (§11).
2. Un'Opportunità deve offrire un beneficio o un accesso concreto (§3); altrimenti resta contenuto informativo.
3. Una notizia non è automaticamente un'Opportunità (§1, §3).
4. Un Evento non è automaticamente un'Opportunità (§1); Opportunità non ne possiede iscrizioni.
5. Una Collaborazione non è automaticamente un'Opportunità (§1). L'origine storica è solo Collaborazioni → Opportunità (**D22**); nessun ciclo di autorità; nessun automatismo di conversione.
6. Una scadenza trascorsa non implica cancellazione dello storico (§9).
7. Dichiarata ≠ verificata ≠ pubblicata ≠ aperta (§8, §11).
8. Compatibilità ≠ ammissibilità (§6, §12).
9. Ammissibilità ≠ ottenimento del beneficio (§6).
10. Una proroga non cancella la scadenza precedente (§9).
11. Modifiche sostanziali della rappresentazione devono poter essere storicizzate (§8, §14); la piattaforma non modifica i fatti istituzionali esterni come se fossero propri.
12. La visibilità pubblica non eccede quanto consentito dalla fonte e dagli assi di pubblicazione (§11, §12).
13. Il dominio non assegna permessi tecnici (Identità & Accessi); può definire autorizzazioni di business (chi pubblica, valuta, assegna).
14. Il dominio alimenta l'Osservatorio con aggregati senza compromettere riservatezza (§1).
15. **Candidatura non è invariante** (§7.1): Opportunità può nascere, pubblicarsi e chiudersi senza candidature; cardinalità futura 0..N.
16. Candidatura a Opportunità ≠ CandidaturaCollaborazione ≠ iscrizione Evento ≠ richiesta Servizio ≠ semplice interesse (§7.1).
17. Professionista non è soggetto autonomo; riferimenti professionali via D16 senza possesso di Profili o Servizi Professionali.
18. PF4 non è il pattern principale del dominio (non è relazione stabile tra due soggetti); PF5 governa i riferimenti opachi ai soggetti; **PC2 resta aperto**.

**Casi limite.**

**Bando senza data certa di apertura.** Corrisponde a un'Opportunità Programmata (§8) con Periodo di validità non ancora precisato (§9): resta un'Opportunità legittima, non ancora Aperta.

**Fondo esaurito prima della scadenza.** Corrisponde allo stato "Esaurita" (§8, §9): distinto da una Chiusura ordinaria, e da segnalare esplicitamente per evitare che i destinatari tentino di accedere inutilmente.

**Proroga comunicata informalmente.** Genera un conflitto tra Fonte primaria (assente o non ancora aggiornata) e una comunicazione informale: da trattare come informazione con Fonte non verificata (§11) fino a conferma, senza modificare lo stato reale sulla sola base della comunicazione informale.

**Opportunità disponibile solo su invito.** Corrisponde alla modalità di accesso "Invito" (§7) e alla visibilità "Visibile a soggetti selezionati" (§12): pienamente prevista dal modello.

**Opportunità con requisiti contraddittori.** Situazione da segnalare come Fonte contraddittoria o come motivo di Contestazione (§8, §11), senza che il dominio debba risolvere autonomamente la contraddizione: la responsabilità di chiarire resta del Promotore.

**Più enti promotori.** Il modello ammette più di un Promotore per la stessa Opportunità (§5), quando la fonte lo dichiara esplicitamente (es. un bando co-promosso da più enti).

**Opportunità rivolta sia a Persone sia a Imprese.** Pienamente prevista (§5): i Destinatari potenziali possono comprendere più categorie contemporaneamente.

**Opportunità riservata a una categoria non rappresentata direttamente dalla piattaforma.** Il modello non richiede che ogni categoria di Destinatario abbia una rappresentazione propria sulla piattaforma: può restare un criterio descrittivo (§2, Destinatario potenziale) anche quando nessuna Persona o Impresa registrata rientra ancora in quella categoria.

**Edizioni annuali dello stesso programma.** Trattato al §9: ogni edizione è un'Opportunità distinta, con un riferimento facoltativo al programma comune, senza continuità automatica di stato.

**Opportunità internazionale con più Paesi.** Corrisponde a un'Opportunità che referenzia più Mercati Internazionali o più Paesi (§10), quando la Fonte lo dichiara esplicitamente.

**Gara annullata.** Corrisponde allo stato "Annullata" (§8): l'intera procedura non avrà più luogo, distinto da una Revoca che presuppone un vizio riconosciuto su un'Opportunità già efficace.

**Finanziamento modificato durante il periodo di apertura.** Genera l'evento BeneficioOpportunitàModificato o RequisitiOpportunitàModificati (§14), con storicizzazione della versione precedente (regola 11).

**Fonte ufficiale temporaneamente non disponibile.** Non deve comportare automaticamente una modifica dello stato reale dell'Opportunità: l'indisponibilità della Fonte è un fatto distinto dallo stato dell'Opportunità stessa, salvo che non impedisca di fatto l'accesso (nel qual caso può motivare una Sospensione, §8).

**Opportunità segnalata da un utente.** Corrisponde allo stato editoriale "Segnalata" (§8) con Fonte "Segnalazione di un utente" (§11): richiede tipicamente un passaggio in valutazione redazionale prima di una eventuale pubblicazione (questione aperta sulla pubblicazione di default, §15).

**Beneficio non economico.** Pienamente previsto (§7): un'Opportunità può offrire visibilità, accesso a reti, o un premio non monetario, senza che questo la renda meno rilevante o gestita con criteri diversi dal modello.

**Opportunità senza procedura formale.** Corrisponde alla modalità di accesso "Accesso diretto" o "Partecipazione libera" (§7): un'Opportunità è legittima anche senza procedura competitiva o selettiva e **senza candidature** (§7.1).

**Opportunità con sola scheda e link esterno.** Variante esterna tipica: nessuna candidatura interna; accesso fuori piattaforma.

**Programma continuativo.** Corrisponde a un'Opportunità continuativa (§9): resta Aperta per un periodo indefinito, senza che questo la trasformi in un'entità di natura diversa.

**Opportunità locale promossa da ente nazionale.** Distinzione esplicita tra Luogo del promotore (nazionale) e Territorio di applicazione (locale), coerente con §10: le due dimensioni restano indipendenti.

**Contenuto editoriale che raggruppa più Opportunità.** Il contenuto referenzia più Opportunità come soggetti trattati (§1, §2), senza che questo generi alcuna nuova Opportunità né alcuna fusione tra quelle esistenti: resta una relazione di riferimento narrativo, non di possesso.

---

## 14. Eventi di dominio

**Sempre / rappresentazione** (condizionati all'accadimento, non obbligatori in ogni istanza):
- **OpportunitàCensita** / **OpportunitàIndividuata** / **OpportunitàSegnalata**
- **OpportunitàVerificata**, **OpportunitàPubblicata**, **OpportunitàAperta**
- **OpportunitàModificata**, **RequisitiOpportunitàModificati**, **BeneficioOpportunitàModificato**, **FonteOpportunitàAggiornata**, **VisibilitàOpportunitàModificata**
- **OpportunitàProrogata**, **OpportunitàSospesa**, **OpportunitàChiusa**, **OpportunitàEsaurita**, **OpportunitàRevocata**, **OpportunitàAnnullata**, **OpportunitàContestata**, **OpportunitàArchiviata**
- **CompatibilitàOpportunitàRilevata**

**Solo se applicabile (§7.1) — mai obbligatori per ogni Opportunità:** eventi di candidatura (avviata, presentata, ritirata, ammessa, esclusa, valutata) e di assegnazione (registrata, comunicata). Distinti dai fatti esterni ufficiali. **Collaborazione derivata** non è evento di questo dominio (appartiene a Collaborazioni; D22).

**Conseguenze di dominio.** Ogni evento è un fatto accaduto (PF15) osservabile da Notifiche, Ricerca, Osservatorio, Collaborazioni, senza che questo dominio gestisca le reazioni altrui.

---

## 15. Decisioni finali e domande aperte

**Decisioni consolidate.**

1. Opportunità è dominio Core autonomo: possibilità azionabile strutturata; possiede la rappresentazione governata, non automaticamente il fatto istituzionale esterno (§1, tesi).
2. Varianti **esterna** e **interna** nello stesso dominio; PC2 aperto (§1, §2).
3. Opportunità ≠ Collaborazione; origine storica solo Collaborazioni → Opportunità (**D22**); nessun automatismo (§1, §13.5).
4. Opportunità ≠ Evento; riferimenti contestuali senza incorporazione; D27 in entrata da Eventi (§1).
5. Opportunità ≠ Contenuti Editoriali (§1, §3).
6. Riferimenti opachi a Persone/Imprese (D14/D15; V8); Professionisti facoltativo (D16); Appartenenze utilizzo (D17); Mercati facoltativo (D18); DV10 aperta.
7. Compatibilità ≠ ammissibilità ≠ ottenimento del beneficio (§6, §12).
8. Assi di stato separati: sostanziale, rappresentazione, editoriale, pubblicazione, visibilità, verifica, temporalità, candidatura se applicabile (§8).
9. **Candidatura condizionata, non invariante** (§7.1): esistenza/pubblicazione/chiusura senza candidature ammesse; entità rinviata con cardinalità futura 0..N.
10. Modalità di accesso = elenco aperto, non un'unica entità generica (§7).
11. Beneficio = dichiarato; non erogazione/pagamento/contratto (§7).
12. Fonte ≠ promotore ≠ pubblicatore (§5, §11).
13. PF4 non pattern principale; PF5 sui riferimenti; PC2 aperto (§13.18).
14. Tipologie filtrate dal nucleo azionabile; menu non prova appartenenza (§4).
15. Non assegna permessi tecnici; Identità & Accessi di supporto (§13.13).
16. Nessuna esclusiva sui destinatari per origine immigrata (§5).
17. Alimenta l'Osservatorio senza compromettere riservatezza (§1).

**Domande aperte.**

- Struttura fisica di CandidaturaOpportunità (quando introdotta) e dettaglio degli scenari esterno/registrato/interno.
- PC2: uno o più Aggregate Root (rappresentazione vs processo interno vs candidatura).
- Confine operativo Convenzioni / Formazione / Gare / missioni commerciali vs Eventi.
- Opportunità occupazionali senza diventare portale lavoro generico.
- Granularità Requisiti; soglia di compatibilità presunta; responsabilità piattaforma sull'ammissibilità.
- Budget/graduatorie strutturati vs descrittivi; eventuale futuro dominio Procedure.
- DV10 (ServizioProfessionale → Opportunità); formalizzazione Organizzazioni/Servizi.
- Titolare pubblicante: allineamento Costituzione (Persona) vs Impresa come titolare.
- Frequenza di ricontrollo fonti; anonimizzazione Osservatorio; profondità storico pubblico.
- Eventuale censimento Opportunità → Eventi in Dependency Map.

Queste domande restano per il Physical Domain Mapping e decisioni di prodotto, senza alterare le decisioni consolidate sopra.

