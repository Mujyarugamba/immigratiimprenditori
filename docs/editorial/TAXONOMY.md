# Immigrati Imprenditori — Tassonomia editoriale internazionale v1

Stato: **CANONICO v1**

Obiettivo: classificare contenuti, dati, storie, eventi e fonti senza assumere che l'Italia sia sempre il Paese di destinazione.

## 1. Principio geografico

Ogni oggetto editoriale può avere zero, uno o più contesti geografici. Quando esiste una relazione migratoria/imprenditoriale, devono essere distinti:

- `origin_country` — Paese d'origine;
- `destination_country` — Paese di destinazione;
- `territory` — territorio specifico studiato o raccontato;
- `route` — relazione canonica origine → destinazione.

L'Italia non ha alcun ruolo tecnico speciale nel modello.

## 2. Livelli geografici canonici

- `global`
- `continent`
- `supranational` (es. Unione europea)
- `country`
- `region`
- `province_state`
- `metropolitan_area`
- `municipality_city`
- `other`

I codici Paese devono usare ISO 3166-1 alpha-2 quando disponibili. I territori subnazionali possono usare codici ufficiali nazionali/NUTS quando disponibili, mantenendo comunque una label editoriale.

## 3. Fasce editoriali geografiche

Servono per equilibrio editoriale e priorità, non per rappresentare la geografia reale:

- `lombardy`
- `italy`
- `italians_abroad`
- `europe_migrant_entrepreneurship`
- `rest_of_world`

Target iniziale indicativo: 20% ciascuno. Nessun vincolo automatico di pubblicazione.

## 4. Tipi di contenuto target

Catalogo editoriale v1:

- `news` — notizia selezionata e verificata;
- `analysis` — analisi/approfondimento;
- `interview` — intervista;
- `business_story` — storia d'impresa;
- `testimony` — testimonianza diretta;
- `research_report` — rapporto/ricerca presentata o prodotta;
- `data_note` — nota dati / lettura di un indicatore;
- `policy_brief` — politica pubblica, norma, programma o dossier normativo;
- `event_report` — resoconto o contenuto derivato da evento;
- `institutional_page` — pagina istituzionale/metodologica.

### Compatibilità con catalogo esistente

Valori esistenti da mantenere fino alla migrazione completa dei contenuti:

- `insight` → concettualmente `analysis`;
- `guide` → da riclassificare caso per caso (`analysis`, `policy_brief` o altro);
- `personal_story` → concettualmente `testimony`/`business_story`;
- `event_presentation` → contenuto legato a evento, distinto dall'evento stesso;
- `opportunity_presentation`, `service_presentation`, `market_content` → residui storici: non usare per nuovi contenuti; non cancellare finché non è verificato che siano inutilizzati;
- `institutional_page` → resta valido.

Stato rilevato al 19/08/2026 sui 18 contenuti esistenti:

- `insight`: 12;
- `guide`: 4;
- `institutional_page`: 2;
- nessun contenuto usa attualmente i tipi commerciali residui.

## 5. Formati della sezione Voci

Classificazione editoriale secondaria:

- `entrepreneur_interview`
- `expert_interview`
- `institutional_interview`
- `first_person_testimony`
- `business_profile`
- `migration_business_story`
- `diaspora_story`
- `return_story`
- `second_generation_story`
- `failure_lessons`
- `barriers_access`
- `generational_transition`

Questa classificazione non sostituisce `content_type`; descrive il formato specifico della sezione Storie e interviste.

## 6. Temi editoriali principali

- `entrepreneurship`
- `migration_and_business`
- `employment`
- `business_demography`
- `sectors`
- `territories`
- `diaspora`
- `internationalization`
- `trade_links`
- `access_to_credit`
- `finance`
- `innovation`
- `digitalization`
- `skills_and_qualifications`
- `second_generation`
- `return_migration`
- `integration_policy`
- `migration_policy`
- `business_regulation`
- `discrimination_and_barriers`
- `community_impact`
- `culture_and_identity`
- `women_entrepreneurs`
- `youth_entrepreneurship`

La lista può crescere, ma nuovi temi devono essere riusabili e non duplicare sinonimi.

## 7. Settori economici

Riutilizzare `business_sectors` come catalogo canonico, senza creare un secondo catalogo per il Centro Studi.

Le classificazioni ufficiali (ATECO/NACE/NAICS ecc.) potranno essere collegate in una fase successiva senza sostituire il catalogo editoriale.

## 8. Tipi di fonte

- `official_statistics`
- `government_institution`
- `supranational_institution`
- `academic`
- `research_center`
- `foundation`
- `chamber_of_commerce`
- `association`
- `media`
- `company_primary_source`
- `direct_testimony`
- `other`

Qualità/evidenza separata dal tipo:

- `primary`
- `secondary`
- `self_reported`
- `derived`

## 9. Tipi di arrivo nella Inbox redazionale

- `news`
- `report`
- `academic_paper`
- `dataset`
- `statistical_release`
- `event`
- `policy`
- `law_regulation`
- `story_tip`
- `interview_proposal`
- `user_testimony`
- `publication_submission`
- `other`

Origine dell'arrivo:

- `radar`
- `public_submission`
- `contributor`
- `editorial_manual`

## 10. Stati Inbox

- `new`
- `to_review`
- `needs_research`
- `assigned`
- `draft_created`
- `rejected`
- `archived`

## 11. Stati del contenuto

Il database esistente usa assi distinti e va preservato:

- `editorial_status`: `draft | ready`;
- `publication_status`: `unpublished | published | withdrawn`;
- `visibility_status`: `private | public`.

Il workflow di redazione più ricco deve essere gestito nella scrivania/InBox senza deformare questi assi già corretti.

## 12. Eventi

Il catalogo esistente `event_types` è riutilizzabile. Per la selezione editoriale si aggiunge una dimensione di pertinenza tematica/geografica, non un duplicato del tipo evento.

Tipi esistenti: networking, conference, fair, mission, visit, institutional, course, award, cultural, other.

Un evento può essere pubblicato solo se la redazione ne riconosce la pertinenza sostanziale con l'imprenditoria migrante o con politiche economiche direttamente collegate.

## 13. Rapporti e pubblicazioni

Tipologie consigliate:

- `aipel_report`
- `immigrati_imprenditori_dossier`
- `institutional_report`
- `academic_research`
- `working_paper`
- `statistical_report`
- `policy_report`
- `book_or_chapter`
- `other_publication`

## 14. Priorità editoriale

Valore interno redazionale:

- `critical`
- `high`
- `normal`
- `low`

Non è un ranking pubblico e non deve essere mostrato ai visitatori.

## 15. Criteri minimi di pubblicazione

Un contenuto non deve essere pubblicato solo perché è arrivato nel radar. La redazione valuta almeno:

1. pertinenza con imprenditoria migrante;
2. attendibilità della fonte;
3. novità o valore documentale;
4. equilibrio geografico del progetto;
5. possibilità di verifica;
6. valore per il pubblico dell'Osservatorio;
7. assenza di duplicati sostanziali.

## 16. Regola di migrazione

Non cancellare né rinominare codici già referenziati direttamente. La convergenza verso la tassonomia v1 avviene con:

1. aggiunta dei nuovi codici;
2. blocco dell'uso futuro dei codici residui;
3. riclassificazione controllata dei contenuti esistenti;
4. disattivazione dei codici legacy solo quando il conteggio referenze è zero;
5. nessun `DROP` necessario nella prima iterazione.

`EDITORIAL_TAXONOMY = PASS`
