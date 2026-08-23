# Governance editoriale ibrida — same-editor + 4-eyes selettivo

Stato: **DECISIONE APPROVATA / IMPLEMENTAZIONE CANDIDATA, NON ATTIVA IN PRODUCTION**  
Decisione: **23 agosto 2026**

## Principio

Il Centro Studi adotta un modello ibrido:

- il lavoro editoriale ordinario può essere completato e pubblicato dallo stesso redattore, purché restino validi autenticazione, ruolo redazionale, ownership editoriale e audit trail;
- i contenuti sensibili o istituzionali richiedono una seconda approvazione da un account redazionale diverso da quello che ha richiesto la revisione;
- Radar, automazioni, AI e service-role non ricevono alcun bypass di pubblicazione.

Questa scelta evita di bloccare una redazione piccola su ogni contenuto, ma introduce il principio dei quattro occhi dove l'errore avrebbe maggiore impatto reputazionale, metodologico, legale o personale.

## Perimetro 4-eyes automatico

Per i `contents` la seconda revisione è obbligatoria quando il tipo è uno dei seguenti:

- `research_report` — rapporto / ricerca;
- `data_note` — nota dati;
- `interview` — intervista;
- `testimony` — testimonianza;
- `policy_brief` — politiche e normative;
- `institutional_page` — pagina informativa/istituzionale.

È inoltre obbligatoria per le categorie:

- `regulation_compliance` — normativa e adempimenti;
- `stories` — storie e testimonianze.

Un contenuto ordinario può essere volontariamente elevato a 4-eyes tramite `force_secondary_review`.

## Dati e correzioni

Sono sempre soggetti a seconda approvazione prima della pubblicazione:

- gli indicatori dell'Osservatorio;
- le correzioni pubbliche `substantive`;
- le `retraction` pubbliche.

Le correzioni sostanziali/retraction devono quindi essere preparate inizialmente con `public_notice=false`, sottoposte a review e rese pubbliche solo dopo approvazione valida.

## Integrità dell'approvazione

La review non è un semplice flag. Il registro `editorial_secondary_reviews` conserva:

- entità e scope;
- account richiedente;
- account approvatore;
- timestamp;
- motivo;
- fingerprint del contenuto/dato effettivamente revisionato;
- stato della review.

Richiedente e approvatore devono essere account diversi. Se il testo, i metadati sostanziali, la metodologia o il dato cambiano, cambia il fingerprint: una vecchia approvazione non soddisfa più il gate di pubblicazione.

Il registro non è cancellabile dagli utenti applicativi; le revoche restano tracciate.

## Same-editor ordinario

Il modello ibrido non introduce un doppio passaggio obbligatorio per notizie, guide, approfondimenti o altri contenuti ordinari non classificati come sensibili, salvo escalation manuale. Restano comunque obbligatori i gate preesistenti:

- editor/admin autenticato;
- ownership editoriale;
- nessun auto-publish;
- nessun bypass service-role;
- versioning/audit quando attivo.

## Confine di rilascio

La migration candidata è `20260822213000_hybrid_editorial_review_governance.sql`.

La sua presenza nel branch e nel piano di rilascio **non autorizza** l'apply Production. Restano obbligatori restore drill, fresh migration-history read, autorizzazione esplicita, apply ordinato e smoke post-migration.
