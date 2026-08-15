# SPLIT-2 — Piano esecutivo della separazione

## Perimetro e principi vincolanti

Questo piano attua esclusivamente la separazione applicativa nel monorepo. Le decisioni architetturali di prodotto sono definitive: PonteImprese e **Immigrati Imprenditori — Centro Studi** sono due applicazioni Next.js, con identità, navigazione, SEO, configurazione e deploy indipendenti. Il repository corrente resta la fonte autoritativa finché entrambe le applicazioni non hanno superato la relativa verifica.

SPLIT-2 non modifica database, migration, Supabase, dati, servizi esterni, DNS o domini. Non è prevista alcuna cancellazione del codice esistente; ogni trasferimento successivo usa `git mv` per preservare la storia.

## Struttura target del monorepo

```text
.
├── apps/
│   ├── ponteimprese/                 # App Next.js PonteImprese
│   │   ├── src/app/
│   │   ├── src/lib/
│   │   ├── public/
│   │   └── configurazioni autonome (Next, SEO, test, deploy)
│   └── centro-studi/                 # App Next.js Immigrati Imprenditori — Centro Studi
│       ├── src/app/
│       ├── src/lib/
│       ├── public/
│       └── configurazioni autonome (Next, SEO, test, deploy)
├── packages/
│   ├── core/                         # Funzioni pure, validazione e normalizzazione
│   ├── contracts/                    # Tipi e contratti versionati senza logica di prodotto
│   ├── ui-primitives/                # Primitivi UI realmente neutrali, se verificati tali
│   └── tooling-config/               # Configurazioni tecniche riusabili, senza secret
├── docs/
│   ├── architecture/
│   ├── reconciliation/
│   └── archive/                      # Evidenze e documentazione storica conservate
├── scripts/                           # Transitorio; poi script tecnici o script proprietari di app
├── supabase/                          # Catena storica immutabile; nessuna modifica in SPLIT-2
└── src/                               # Sorgente originale, mantenuto fino alla verifica finale
```

La struttura `packages/` contiene solo componenti tecnici neutrali e versionati. Configurazioni runtime, credenziali, client con comportamento proprietario, route, server action, dati e branding restano in `apps/*`. L'esistenza di una directory target non autorizza un'estrazione: ogni contenuto entra in un pacchetto soltanto dopo la classificazione prevista da SPLIT-1.

## Responsabilità delle applicazioni

**PonteImprese** possiede account, auth, ruoli, profili operativi, imprese e membership, professionisti, servizi, opportunità, collaborazioni, organizzazioni commerciali, mercati e internazionalizzazione commerciale, contatti, consensi e lifecycle. Include le route pubbliche e riservate assegnate a `PONTE_IMPRESE` nell'inventario.

**Immigrati Imprenditori — Centro Studi** possiede contenuti e cultura, ricerche e rapporti, eventi scientifici/editoriali, fonti e metodologia, collaborazioni editoriali, tassonomie dedicate e Osservatorio (indicatori, valori, serie storiche e dati territoriali/comparativi). Include le route e le aree redazionali assegnate a `CENTRO_STUDI`.

Nessuna applicazione importa moduli interni dell'altra. Un riferimento tra prodotti è consentito solo tramite contratto versionato, identificatore esterno non sensibile, snapshot approvato o API read-only tollerante all'indisponibilità.

## Pacchetti condivisi

I candidati sono: utility pure, validator e normalizzatori, checksum e deduplica; tipi e contratti di scambio; cataloghi tecnici non proprietari; harness di test neutri; configurazioni di toolchain; primitivi UI privi di copy, token, asset o comportamento di brand. Le pipeline condivisibili espongono soltanto meccanismi generici: allowlist, tassonomie, mapping, dati acquisiti e policy restano del rispettivo prodotto.

I cataloghi di paesi, lingue, territori e settori sono gestiti come schema template duplicato o export versionato, non come database operativo comune. Schema tecnico di eventi e organizzazioni segue lo stesso modello, con dati separati.

## Due identità grafiche

Ogni app mantiene nel proprio perimetro layout, header, footer, favicon, CSS/theme tokens, asset, copy, navigazione, metadata, sitemap, robots e canonical. `ui-primitives` può offrire soltanto primitive accessibili e senza brand; ciascuna app le compone applicando il proprio design system. Non sono condivisi favicon, CSS globali, header/footer, copy, configurazione SEO o mapping di dominio.

## Deploy e domini

Sono previsti due progetti di deploy indipendenti, con build command, preview, variabili, log, analytics, sitemap, robots e accessi amministrativi autonomi. `ponteimprese.com` è assegnato a PonteImprese; il dominio attuale è assegnato al Centro Studi. Il cut-over DNS avviene solo in W3, dopo il gate umano, con rollback documentato verso l'ultima configurazione verificata. Nessuna variabile, incluso un eventuale service-role, è condivisa tra i due deploy.

## Supabase nella fase transitoria

Le due app usano temporaneamente lo stesso progetto Supabase esclusivamente attraverso configurazioni applicative separate e accessi minimi necessari. In SPLIT-2 non si cambiano database, schema, RLS, migration, bucket, policy, dati, project ref o credenziali. Non è autorizzata la replica di account, contatti, dati personali, membership, autorizzazioni, richieste, offerte o dati commerciali. La successiva separazione fisica e la baseline dei database sono materia di SPLIT-3.

## Regole contro dipendenze circolari

1. Direzione ammessa: `apps/* -> packages/*`; i pacchetti non importano app e un'app non importa l'altra.
2. `packages/*` non dipende da Next, route, server action, client Supabase, secret, branding o dati proprietari, salvo un pacchetto dichiarato esplicitamente tecnico e senza dipendenza inversa.
3. I contratti sono unidirezionali, semanticamente versionati e privi di import runtime dell'altro prodotto.
4. Ogni dipendenza condivisa ha owner tecnico, API pubblica minima, test contrattuale e divieto di deep import.
5. Link incrociati usano URL/ID esterni o API read-only; nessuna FK, sessione, ruolo o oggetto runtime è assunto comune fra le app.
6. Ogni eccezione richiede gate umano e aggiornamento dell'inventario di provenienza prima del trasferimento.

## Trattamento delle categorie SPLIT-1

| Categoria | Trattamento in SPLIT-2 |
| --- | --- |
| `PONTE_IMPRESE` | Trasferire progressivamente con `git mv` in `apps/ponteimprese`, insieme a test e documentazione di dominio. |
| `CENTRO_STUDI` | Trasferire progressivamente con `git mv` in `apps/centro-studi`, scindendo link commerciali in contratti/API read-only ove necessario. |
| `CONDIVISO` | Estrarre soltanto se neutro; applicare package versionato, schema template duplicato, export/import o duplicazione controllata come indicato dall'inventario. |
| `ARCHIVIO` | Conservare senza cancellare, con metadati e collocazione documentale; non renderlo dipendenza runtime delle app. |

## Onde implementative

### W1 — Struttura monorepo e shell delle due app

**Input.** Commit di split approvato, inventari SPLIT-1, presente sorgente originale, decisioni di dominio e mapping delle route.

**Operazioni.** Creare workspace monorepo, `apps/ponteimprese`, `apps/centro-studi` e i confini iniziali di `packages/`; predisporre shell Next minime, configurazioni separate e marker di ownership. Non spostare, modificare o cancellare alcun codice originale; `src/`, `scripts/` e `supabase/` restano invariati.

**Verifiche.** Controllare che entrambe le shell siano isolabili come app, che non esistano import app-to-app, che ogni configurazione runtime sia locale all'app e che il sorgente originario sia ancora presente e invariato.

**Rollback.** Rimuovere esclusivamente le nuove shell e configurazioni W1 dalla branch di lavoro; nessun ripristino del codice originario è necessario perché non è stato spostato.

**Gate umano.** Approvazione della struttura, dei nomi package, dei confini di ownership e della checklist di configurazioni separate.

**Condizione di completamento.** Due shell riconoscibili e indipendenti, pacchetti vuoti o tecnici senza dipendenze circolari, sorgente originale intatto e gate umano registrato.

### W2 — Trasferimento progressivo di PonteImprese, Centro Studi e condiviso

**Input.** W1 completata e approvata; assegnazione riga-per-riga SPLIT-1; elenco delle dipendenze incrociate e decisioni umane pertinenti.

**Operazioni.** Trasferire per tranche coerenti, sempre con `git mv`, le route, i moduli, i test, gli asset e la documentazione di PonteImprese in `apps/ponteimprese` e quelli del Centro Studi in `apps/centro-studi`. Estrarre in `packages/*` solo elementi classificati `CONDIVISO`; duplicare o versionare secondo la modalità prevista. Conservare Archivio e catena storica Supabase. Ridurre i riferimenti incrociati a contratti, snapshot o API read-only.

**Verifiche.** Per ogni tranche: corrispondenza con l'inventario, conservazione della storia di rename, assenza di import tra app, assenza di deep import nei package, proprietà univoca di route/azione/test e nessun cambiamento a migration o database. Eseguire controlli mirati di typecheck/test solo per i confini trasferiti, secondo i comandi definiti dalle app.

**Rollback.** Revertire la singola tranche `git mv` e gli adattamenti strettamente collegati, tornando al percorso originario senza cancellare file o dati; non procedere con tranche successive.

**Gate umano.** Approvazione per tranche di domini ambigui: eventi, contenuti/guide, persone-autori/speaker, organizzazioni ibride, mercati e ruoli redazionali; approvazione editoriale riga-per-riga per dati o contenuti già acquisiti prima di qualunque trasferimento futuro.

**Condizione di completamento.** Tutti gli elementi operativi hanno una sola ownership applicativa o una modalità condivisa esplicita; Archivio è conservato; le due app non dipendono internamente l'una dall'altra; il repository originario resta confrontabile fino alla verifica concordata.

### W3 — Build, test, deploy separati e cut-over domini

**Input.** W2 completata e approvata; due app complete; configurazioni e segreti separati; checklist SEO, legale, osservabilità e rollback approvate.

**Operazioni.** Eseguire build e suite di test per ciascuna app, creare preview e deploy indipendenti, verificare SEO e routing, quindi effettuare il cut-over: `ponteimprese.com` verso PonteImprese e dominio attuale verso Centro Studi. Conservare monitoraggio, log e una finestra di osservazione; non introdurre separazione Supabase.

**Verifiche.** Build, typecheck, test mirati e suite prevista per ciascuna app; verifica manuale di route critiche, auth, SEO/canonical/sitemap/robots, configurazioni, osservabilità, accessi amministrativi e assenza di contaminazione di dominio. Confermare l'operatività dei due deploy e la reversibilità del routing.

**Rollback.** Ripristinare ciascun deploy alla release verificata precedente e ripuntare il relativo dominio alla configurazione pre-cut-over; bloccare ulteriori trasferimenti e conservare evidenze del difetto.

**Gate umano.** GO esplicito per deploy, per ciascun dominio e per DNS; approvazione conclusiva dopo finestra di osservazione e verifica di entrambe le applicazioni.

**Condizione di completamento.** Due deploy autonomi e verificati, domini assegnati correttamente, SEO e osservabilità distinti, rollback provato o prontamente eseguibile e repository corrente ancora disponibile come fonte autoritativa fino alla chiusura formale.

## Rischi principali e mitigazioni

| Rischio | Mitigazione |
| --- | --- |
| Coupling residuo fra route, server action, layout o branding | Ownership per inventario, trasferimenti a tranche, divieto di import app-to-app e verifica dei confini. |
| Link, FK o identità condivise | ID esterni non sensibili, snapshot/API read-only, tolleranza all'indisponibilità; nessuna modifica DB in SPLIT-2. |
| Replica impropria di dati personali o commerciali | Data minimization, divieto di trasferimento dati per default, gate umano e rinvio a SPLIT-3. |
| Divergenza di cataloghi e pipeline | Template/export versionati, owner definiti, contratti e test contrattuali. |
| Confusione di brand o perdita SEO | Asset e SEO per app, preview separati, checklist canonical/sitemap/robots e cut-over reversibile. |
| Fallimento del deploy o del cut-over | Deploy indipendenti, release precedente conservata, osservabilità separata e rollback per dominio. |
| Perdita di tracciabilità | `git mv`, tranche piccole, inventario di provenienza, Archivio conservato e zero cancellazioni. |

## Operazioni rinviate a SPLIT-3

- Separazione fisica del progetto Supabase e creazione delle baseline database autonome.
- Qualunque modifica a schema, migration, RLS, grant/revoke, trigger, view, enum, policy, bucket o configurazione Supabase.
- Migrazione, replica, anonimizzazione o cancellazione di dati, inclusi account, contatti, profili, membership, autorizzazioni e dati commerciali.
- Mapping e trasferimento di dati editoriali/statistici approvati, con conteggi, provenienza, data minimization e autorizzazioni necessarie.
- Definizione di ruoli e identità editoriali autonomi nel Centro Studi e risoluzione dei casi di ownership dati rimasti ambigui.
- Eventuale rimozione del codice storico o chiusura della catena Supabase originale, soltanto dopo verifica formale delle due applicazioni e autorizzazione dedicata.
