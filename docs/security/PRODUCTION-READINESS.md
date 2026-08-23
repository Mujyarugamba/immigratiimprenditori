# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit: 2026-08-23
Branch: `feature/research-radar-ai-knowledge-20260822`
Candidato applicativo di riferimento prima di questo aggiornamento documentale: `a4e75c6eaf40f3079bd79ccc241226e37646f20f`

Questo documento registra il **perimetro corrente di rilascio**. Non sostituisce i check GitHub del commit candidato e non trasforma verifiche locali o di preview in autorizzazioni Production.

Regola editoriale vincolante:

> **Prima il sito va online e supera il live smoke; solo dopo iniziano inviti, interviste e altri contatti esterni.**

Di conseguenza una storia reale **non è un blocker del primo go-live**. Il cold-start può avere zero storie reali purché `/storie`, workflow, evidence gate e pubblicazione controllata siano tecnicamente pronti.

---

## 1. Stato sintetico Go-Live A

Roadmap canonica: `docs/roadmap/ROADMAP-110-PRIORITIES.md`.

- **READY: 32/33**
- **DA RIFINIRE: 1/33** — #92 WCAG 2.2 AA human/device QA
- **blocker di contenuto reale prima del primo go-live: 0**

`PRODUCTION_READINESS = NOT PASS` finché i gate esterni e di rilascio indicati in fondo non sono chiusi.

---

## 2. Pubblicazione e integrità editoriale

### EDIT-01 — No auto-publish
**PASS SUL CANDIDATO**

Contributi pubblici, Radar e strumenti AI non dispongono di un percorso di auto-pubblicazione. La decisione di pubblicazione resta umana e role-gated.

### EDIT-02 — Storie d'impresa
**FUNZIONE PRE-GO-LIVE READY / CONTENUTO REALE POST-GO-LIVE**

Prima del go-live devono essere pronti:

- `/storie` anche in stato vuoto;
- tipi editoriali Storie/intervista/testimonianza;
- Inbox e workflow redazionale;
- evidence/fact-check gate;
- pubblicazione umana controllata.

Prima del go-live è vietato:

- inviare inviti o richieste di intervista;
- contattare imprenditori, partner o ricercatori per popolare Storie;
- simulare testimonianze;
- usare placeholder fittizi per rendere verde un gate.

Dopo sito online + live smoke PASS può iniziare l'acquisizione delle prime storie reali.

### EDIT-03 — Review governance
**DECISIONE PENDING**

La Politica editoriale pubblica richiede responsabilità e verifica umane ma **non promette oggi un doppio revisore**.

Resta quindi da decidere internamente:

- `same-editor`: chi verifica può anche portare il contenuto a ready/published;
- `4-eyes`: pubblicazione subordinata a una seconda persona diversa dal redattore/autore della modifica.

La decisione non viene inventata tecnicamente senza approvazione esplicita.

### EDIT-04 — Versioning / audit
**IMPLEMENTATO E VALIDATO NEL LABORATORIO / ATTIVAZIONE PRODUCTION PENDING**

Il candidato conserva versioning editoriale, correzioni e audit. L'attivazione live resta parte del set di release autorizzato e non viene anticipata.

---

## 3. Preview e confine Production

### HOST-01 — Preview read-only
**PASS SUL CANDIDATO**

Vercel Preview e Netlify Deploy Preview sono trattati come read-only/noindex.

Il proxy blocca le mutazioni in Preview e il client service-role è fail-closed in ambiente Preview anche qualora un secret privilegiato venisse configurato per errore.

### HOST-02 — Vercel Production
**PENDING RILASCIO AUTORIZZATO**

Vercel è il percorso Production selezionato. Il runbook è:

`docs/operations/vercel-production-runbook-2026-08-23.md`

Il primo candidato Production deve essere un vero build Production, non la promozione di un artifact Preview.

Quando possibile usare un flusso equivalente a:

`vercel --prod --skip-domain`

così il deployment Production può essere collaudato prima del cutover del dominio.

### HOST-03 — Deployment Protection
**DISPONIBILE / ATTIVAZIONE DA VERIFICARE SUL PROGETTO**

Vercel Authentication / Standard Deployment Protection può proteggere deployment e URL generati senza richiedere l'add-on Advanced. Non viene dichiarato attivo finché la configurazione effettiva del progetto non è verificata.

### HOST-04 — Dominio
**CUTOVER PREPARATO / DNS NON MODIFICATO**

Per il go-live:

- mantenere i nameserver e la zona DNS presso il provider corrente salvo decisione separata;
- non modificare MX, SPF, DKIM, DMARC e record mail;
- cambiare soltanto i record web necessari dopo verifica Vercel `domains inspect`/dashboard;
- apex canonico: `https://immigratiimprenditori.it`;
- `www` come alias/redirect verso apex;
- TLS, canonical, hreflang, sitemap e robots da riverificare dopo il cutover.

---

## 4. HTTP security e dipendenze

### SEC-HTTP-01 — Header baseline
**PASS CI SUL CANDIDATO PRECEDENTE / FINAL LIVE SMOKE PENDING**

Il candidato verifica almeno:

- HSTS;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- assenza di `X-Powered-By`;
- CSP con origini esplicite e senza `unsafe-eval`.

Il vero deployment Production dovrà ripetere lo smoke.

### SEC-DEPS-01 — Dipendenze Production
**PASS NELLA CI APPLICATIVA**

`npm audit --omit=dev --audit-level=high` è un gate del workflow Editorial. Il risultato valido è sempre quello del commit candidato corrente, non un run ID congelato in questo documento.

---

## 5. Autenticazione, ruoli e database

**Stato backend non riletto né modificato nel ciclo frontend/documentale corrente.** Le evidenze sottostanti restano quelle già validate prima di questo aggiornamento.

### SEC-AUTH-01 — Separazione ruoli
**PASS LABORATORIO / LIVE RECHECK PENDING**

Contributor, editor e amministratore sono separati; auto-elevazione negata nel laboratorio.

### SEC-AUTH-02 — MFA privilegiati
**PASS LABORATORIO / PRODUCTION ACTIVATION PENDING**

TOTP/AAL2 per le operazioni privilegiate è validato nel laboratorio. Resta la verifica con account privilegiato Production prima dell'uso della redazione live.

### SEC-RLS-01 — RLS e publication gate
**PASS LABORATORIO / PRODUCTION APPLY + RECHECK PENDING**

RLS, publication gate, rate-limit persistenti e audit sono parte del candidato validato. Nessuna nuova applicazione Production è implicata da questo documento.

### SEC-MIGRATION-01 — Apply Production
**NON AUTORIZZATO**

Prima dell'apply servono ancora:

1. restore drill non-production riuscito;
2. fresh migration-history read;
3. controllo assenza drift;
4. autorizzazione esplicita;
5. apply ordinato del solo set candidato;
6. smoke Security/RLS/rate-limit dopo apply.

---

## 6. Backup / recovery

### BACKUP-01 — Backup cifrato Production
**PENDING PRE-RELEASE**

Il workflow e le verifiche di archivio sono preparati, ma il gate di release richiede backup Production reale + restore drill non-production riuscito.

Il restore drill è un gate di **recovery**, non un motivo per riscrivere la logica applicativa o la roadmap editoriale.

---

## 7. Privacy e documenti legali

### LEGAL-01 — Privacy
**TECNICAMENTE ALLINEATA / REVISIONE PROFESSIONALE PENDING**

La raccolta proposta distingue il trattamento necessario per ricezione/valutazione dalla possibile autorizzazione alla pubblicazione.

### LEGAL-02 — Cookie
**RUNTIME COERENTE / REVISIONE PROFESSIONALE PENDING**

Il runtime non introduce tracker o embed comportamentali senza revisione deliberata. L'analytics applicativo resta first-party, aggregato e governato da flag espliciti.

### LEGAL-03 — Termini
**TECNICAMENTE ALLINEATI / REVISIONE PROFESSIONALE PENDING**

La matrice contatti pubblica approvata resta preservata:

- privacy/AIPEL: `info@aipel.it`;
- PEC: `direzione@pec.aipel.it`;
- Termini: `termini@aipel.it`;
- Cookie: `cookies@aipel.it`;
- redazione: `redazione@immigratiimprenditori.it`;
- contatto Centro Studi: `info@immigratiimprenditori.it`.

La revisione professionale deve validare almeno base giuridica/formulazione analytics, fornitori e trasferimenti, clausola foro, maggiore età, contributi/licenze e autorizzazioni media.

---

## 8. Accessibilità e responsive

### UI-A11Y-01 — Automazione
**COPERTURA ESTESA / RISULTATO DEL CURRENT HEAD DA LEGGERE IN CI**

La suite automatica copre fra l'altro:

- skip-link e focus sul main;
- H1 e immagini alt;
- 7 lingue e Arabic RTL;
- reflow 320/390/768 px;
- navigazione e selettore lingua solo tastiera a 320 px;
- errori server del form Contribuisci associati semanticamente al form;
- errori login associati semanticamente al form;
- target size minimo dei principali controlli mobile;
- text spacing WCAG a 320 px sulle superfici core.

Il test text-spacing ha individuato un overflow reale dell'indirizzo editoriale lungo su `/contribuisci`; il candidato è stato corretto consentendo il wrapping dell'indirizzo. Lo stesso hardening è applicato preventivamente ai contatti lunghi su Chi siamo e Politica editoriale.

### UI-A11Y-02 — Human/device QA #92
**PENDING — UNICO PUNTO A NON READY**

Restano obbligatori i controlli umani/documentati su:

- desktop 1440×900;
- laptop 1366×768;
- tablet 768×1024;
- mobile 390×844;
- narrow mobile 320×568;
- tastiera completa;
- NVDA + Chrome/Firefox;
- VoiceOver/Safari quando disponibile;
- zoom 200% e reflow core a 400%;
- Arabic RTL;
- form/errori/auth/MFA.

L'automazione non viene presentata come certificazione WCAG.

---

## 9. GitHub release governance

### GH-01 — Catena di merge
**VERIFICATA / NESSUN MERGE AUTORIZZATO**

Catena corrente:

1. PR #9 → `feature/institutional-identity`;
2. PR #8 (`feature/institutional-identity`) → `main`.

Entrambe restano draft. PR #9 non va retargettata direttamente a `main` senza una decisione deliberata.

I vecchi PR draft #5, #6 e #7 hanno storie divergenti e non vengono chiusi automaticamente.

### GH-02 — Required checks `main`
**DECISIONE PENDING**

La protezione legacy dei required status checks risulta senza context obbligatori. Prima del merge finale va scelta e applicata una governance minima.

Proposta tecnica, da attivare solo quando tutti i relativi gate sono realmente verdi:

1. `Editorial v1 CI / verify`;
2. `Supabase local migration validation / validate-local-database`;
3. `Vercel – immigratiimprenditori`.

Netlify e il progetto Vercel Preview duplicato non sono proposti come required release checks.

---

## 10. Gate residui prima di `PRODUCTION_READINESS = PASS`

1. restore drill reale non-production;
2. QA umano WCAG 2.2 AA + dispositivi (#92);
3. revisione professionale Privacy / Cookie / Termini;
4. decisione same-editor vs 4-eyes;
5. configurazione/verifica privilegi e MFA Production;
6. fresh migration-history read immediatamente prima dell'apply;
7. apply Production esplicitamente autorizzato e ordinato;
8. Security/RLS/HTTP/rate-limit smoke dopo apply;
9. attivazione required checks scelti per `main`;
10. merge soltanto con autorizzazione esplicita;
11. vero deployment Vercel Production protetto e smoke;
12. cutover dominio controllato;
13. live smoke sul dominio reale.

**Non compare tra i blocker pre-go-live l'acquisizione di una storia reale.**

Dopo il live smoke PASS iniziano i contatti esterni e il primo ciclo editoriale Storie.

Fino alla chiusura dei punti sopra:

`PRODUCTION_READINESS = NOT PASS`
