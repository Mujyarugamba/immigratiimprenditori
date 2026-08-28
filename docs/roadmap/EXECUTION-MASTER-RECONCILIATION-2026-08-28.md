# Execution Master — riconciliazione stato corrente 2026-08-28

Stato: **ADDENDUM CANONICO DI RICONCILIAZIONE**  
Data: 2026-08-28  
Branch di integrazione corrente: `work/pre-go-live-integration-20260826`  
PR corrente: **#13 — DRAFT**  
Base: `main`  
HEAD tecnico verificato al momento di questo addendum: `3c6b464f4666075a872bde6c0a6f07568450a1f7`

Questo addendum non cancella la cronologia di `docs/roadmap/EXECUTION-MASTER.md`. Serve a correggere in modo esplicito le sole righe diventate storiche o contraddette da evidenze successive. In caso di conflitto tra il master del 22–23 agosto e questo addendum, **prevale questo addendum per lo stato operativo corrente**.

Non autorizza merge, migration, deploy Production, modifiche DNS o altre write Production.

## 1. Branch e integrazione

Le intestazioni storiche del master:

- `feature/research-radar-ai-knowledge-20260822` come branch di lavoro;
- `feature/institutional-identity` come base di integrazione;
- PR #9 come PR corrente;

sono superate.

Stato corrente:

- branch di integrazione: `work/pre-go-live-integration-20260826`;
- base: `main`;
- PR corrente: **#13 — Pre-go-live integration — Centro Studi**;
- PR #13 resta **DRAFT**, non merged;
- `main` non è stato modificato da questo ciclo.

## 2. Stato migration Production

La frase storica “nessuna migration è stata applicata al database production” non descrive più lo stato corrente.

Il manifest canonico `supabase/CS-PRODUCTION-RELEASE.json`, verificato in sola lettura il 2026-08-24, registra:

- ultima migration hosted osservata: `20260824103000_harden_publication_gate_execute_privileges`;
- `candidateDelta: []`;
- le due alias repository foundation restano già riconciliate con le corrispondenti versioni hosted precedenti.

Conseguenza operativa: **non esiste oggi un delta migration candidato da applicare secondo quel manifest**. Rimane comunque obbligatoria una nuova lettura hosted prima di qualsiasi futura write Production, come stabilito dalla release policy.

## 3. Governance editoriale

La riga #52 del master che indica `REVIEW GOVERNANCE PENDING` è superata.

La governance è **DECISA — modello ibrido**:

- stesso editor ammesso per contenuti ordinari;
- seconda approvazione distinta richiesta per contenuti sensibili/istituzionali;
- seconda approvazione distinta richiesta per indicatori Osservatorio;
- seconda approvazione distinta richiesta per correzioni sostanziali/retraction;
- la governance ibrida e la forward-fix sul classificatore `NULL` sono coperte dai test locali/CI.

Il gate residuo non è più “decidere 4-eyes vs same-editor”, ma verificare il comportamento live soltanto quando un rilascio Production sarà esplicitamente autorizzato.

## 4. Storie e interviste

Le righe #29, #90, #93 e la sezione “Roadmap A sintetica” del master trattano ancora l'assenza di una Storia reale come blocker pre-go-live. Questo è superato dalla regola editoriale approvata e documentata nel closure kit.

Stato corrente:

- `/storie`, tipi editoriali, workflow, evidence gate e fallback a zero contenuti devono essere tecnicamente sani prima del go-live;
- **una storia/intervista/testimonianza reale NON è una precondizione del go-live**;
- outreach, inviti e interviste iniziano soltanto dopo sito online + live smoke PASS;
- restano vietati placeholder, storie simulate, attribuzioni inventate e auto-publish.

Il popolamento editoriale Storie/Interviste resta quindi **PENDING POST-GO-LIVE / EDITORIALE**, non gate tecnico pre-go-live.

## 5. Backup / recovery

La riga #89 e l'elenco storico dei gate esterni non riflettono più completamente il lavoro già chiuso.

È documentato e verificato:

- backup cifrato della sorgente Production reale: PASS;
- backup staging pre-overwrite: PASS;
- restore atomico Production → staging: PASS;
- confronto read-only post-restore: PASS;
- parità verificata per migration ledger, dati chiave, RLS, grants, funzioni e Auth applicativo;
- nessuna write Production durante il restore drill.

Il drill storico non sostituisce il requisito di un **fresh Production backup immediatamente prima di una futura write Production autorizzata**.

## 6. CI, E2E, accessibilità e performance — HEAD corrente

Sul HEAD `3c6b464f4666075a872bde6c0a6f07568450a1f7`:

- `Editorial v1 CI` #1033: **PASS**;
- `Supabase local migration validation` #566: **PASS**;
- cold-start/migration replay: PASS;
- DB lint: PASS;
- RLS/security smoke: PASS;
- hybrid review smoke: PASS;
- rate-limit smoke: PASS;
- audit/analytics: PASS;
- backup/restore CI: PASS;
- Auth integration: PASS;
- authenticated browser E2E: PASS;
- unit/integration suite: **120/120 PASS**;
- browser E2E quality: **9/9 PASS**;
- reflow 320/390/768: PASS.

Lighthouse sullo stesso HEAD:

- Performance: **98–99**;
- Accessibility: **100**;
- Best Practices: **100**;
- SEO: **100**;
- LCP < 2,5 s nei tre run;
- CLS = 0 nei tre run;
- precedente 404 favicon: **CHIUSO**;
- precedente rilievo image delivery ~403 KB: ridotto a ~16 KB residui, non bloccanti.

Quindi la riga #82 conserva il significato PASS, ma i valori storici 1.00/0.98/0.98 non sono più l'unica fotografia corrente; la nuova baseline è quella sopra.

## 7. Vercel Preview

Il precedente problema di doppio build Vercel sullo stesso branch è **CHIUSO**.

Sul solo progetto Production `immigratiimprenditori` è configurato l'Ignored Build Step:

```sh
if [ -n "${VERCEL_GIT_COMMIT_REF:-}" ] && [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; else exit 1; fi
```

Verifica reale su due commit consecutivi del branch:

- `immigratiimprenditori` Production project: **Canceled by Ignored Build Step**;
- `immigratiimprenditori-preview`: deployment Preview completato;
- Netlify deploy-preview: canceled.

Regola corrente:

- `main` può continuare a costruire sul progetto Production;
- i branch non-`main` vengono ignorati dal progetto Production;
- i Preview di branch restano di competenza di `immigratiimprenditori-preview`.

## 8. PENDING che restano realmente aperti

Questo addendum non dichiara il progetto pronto al merge. Restano aperti almeno i gate non chiusi da evidenza corrente, tra cui:

1. QA visivo diretto del Preview corrente, incluso mini-trend con dati reali e viewport 390/320;
2. QA umano WCAG/device previsto dal closure kit, se non ancora registrato con record completo;
3. revisione legale finale, se non ancora formalmente chiusa in un record successivo;
4. eventuali gate Production che richiedono verifica live e autorizzazione esplicita;
5. decisione finale separata su merge PR #13 e deploy Production.

Il micro-rilievo Lighthouse di ~16 KB sul sizing del logo non è bloccante e non giustifica da solo un nuovo ciclo completo di CI.

## 9. Regola di sicurezza invariata

Restano inderogabili:

- nessun merge automatico;
- nessuna modifica a `main` prima della decisione finale;
- nessuna migration/write Production senza autorizzazione esplicita e fresh hosted-state read;
- nessun deploy Production senza autorizzazione separata;
- nessun contenuto, autore, attribuzione o evidenza inventati per chiudere un gate.

Questo documento è il delta operativo canonico al 2026-08-28 e deve essere letto insieme alla cronologia completa di `EXECUTION-MASTER.md`.