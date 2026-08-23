# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit: 2026-08-23
Branch: `feature/research-radar-ai-knowledge-20260822`
Ultimo head applicativo/security verificato: `4ffa299caf05938e4628ec536d5f0f9f129cb9c5`

Questo documento registra lo stato verificato del gate di sicurezza e rilascio. Un elemento è PASS soltanto quando è stato verificato sul codice, nel laboratorio locale/CI o in lettura sul servizio collegato. Le verifiche locali/CI non autorizzano né implicano applicazione al database o deploy di produzione.

## 1. Database e RLS

### SEC-RLS-01 — RLS sulle tabelle public
**PASS**

Verifica live Supabase in sola lettura: le tabelle ordinarie dello schema `public` mantengono RLS e policy coerenti con il modello applicativo.

### SEC-RLS-02 — Inbox e account non leggibili da anon
**PASS**

Gli smoke locali/CI verificano che Inbox editoriale, account e superfici private non siano leggibili dal ruolo anonimo.

### SEC-RLS-03 — Pubblicazione controllata
**PASS LOCAL/CI**

Le superfici pubbliche espongono soltanto contenuti/eventi `ready + published + public` e non archiviati. Il publication gate DB vieta bypass di pubblicazione e richiede ruoli editoriali appropriati.

### SEC-RLS-04 — Performance policy advisor
**NON BLOCCANTE / TUNING POST-GO-LIVE**

Il Performance Advisor production segnala più policy permissive `SELECT` sovrapposte per il ruolo `authenticated` su diverse tabelle pubbliche/editoriali. Il pattern deriva in larga parte dalla coesistenza di lettura pubblica e lettura editor/self-service.

È un warning di costo RLS, non un'esposizione aggiuntiva. Non viene eseguita una riscrittura ampia delle policy alla vigilia del rilascio senza evidenza di un problema di query plan. La correttezza RLS ha priorità sulla micro-ottimizzazione.

Gli `unused_index` segnalati dal Performance Advisor sono classificati **INFO**. Il database production ha ancora un volume/uso limitato: nessun indice viene rimosso automaticamente sulla sola base del contatore di utilizzo attuale.

## 2. Funzioni SECURITY DEFINER

### SEC-FUNC-01 — Self-service account
**PASS / WARNING INTENZIONALE**

Security Advisor production segnala `access_self_close_account()` e `access_self_delete_preflight()` perché sono `SECURITY DEFINER`. Audit live in sola lettura conferma:

- grant client soltanto a `authenticated`;
- `search_path=''`;
- identità derivata da `auth.uid()`;
- operazioni limitate all'account corrente;
- protezione dell'ultimo amministratore applicativo.

Il warning è quindi intenzionale e non va eliminato automaticamente.

### SEC-FUNC-02 — Contributo editoriale pubblico
**HARDENING PREPARATO / LOCAL CI PASS — PRODUCTION APPLY OBBLIGATORIO PRIMA DEL FORM LIVE**

`submit_editorial_contribution()` deve restare eseguibile da `anon` perché `/contribuisci` non richiede account. Security Advisor segnala correttamente la funzione come `SECURITY DEFINER` esposta a ruoli client.

La versione production corrente è ancora precedente al rate limiting persistente del branch. La migration già preparata e validata:

`20260822183000_persistent_public_submission_rate_limits.sql`

introduce:

- tabella contatori privata con RLS e nessun accesso client;
- chiavi memorizzate esclusivamente come SHA-256;
- primitive atomiche non eseguibili da `anon`/`authenticated`;
- trigger `BEFORE INSERT` su `editorial_submissions`;
- limite globale di 200 invii/ora;
- limite di 5 invii/ora per e-mail;
- bypass soltanto per service/editor/admin.

Smoke locale: `PERSISTENT_RATE_LIMIT_SECURITY = PASS`.

**Regola di release:** il form pubblico non va considerato production-hardened finché questa migration non è applicata nel set autorizzato e riverificata live.

## 3. Form pubblico / anti-abuso

### SEC-FORM-01 — Validazione server-side
**PASS SUL BRANCH**

Tipo proposta, campi obbligatori, acknowledgement privacy, limiti di lunghezza e URL HTTP/HTTPS sono validati lato server/DB nel candidato.

### SEC-FORM-02 — Honeypot
**PASS SUL BRANCH**

Filtro anti-bot elementare senza tracker o cookie esterni.

### SEC-FORM-03 — Rate limiting persistente
**PASS LOCAL/CI — PRODUCTION ACTIVATION PENDING**

Form e login hanno rate-limit persistenti verificati nel laboratorio. La production non è stata modificata.

## 4. Autenticazione e privilegi

### SEC-AUTH-01 — Leaked Password Protection
**WARNING PRODUCTION / PIANO FREE — MFA PRIVILEGIATI COME MITIGAZIONE**

Security Advisor production conferma `Leaked Password Protection` disabilitato. Nel perimetro corrente del piano Free non viene rappresentato come attivo.

Per `redattore` e `amministratore_applicativo`, la mitigazione verificata nel laboratorio è TOTP + AAL2 obbligatorio. L'attivazione/configurazione Auth production resta un passo separato.

### SEC-AUTH-02 — Separazione ruoli
**PASS LOCAL/CI**

Verificati login reale, provisioning account, JWT/RPC, separazione contributor/editor, auto-elevazione negata, accesso contributor alla propria proposta e negazione della redazione.

### SEC-AUTH-03 — MFA TOTP / AAL2
**PASS LOCAL/CI — PRODUCTION ACTIVATION PENDING**

Il browser autenticato verifica password → AAL1 → MFA obbligatoria → enrollment/challenge/verify TOTP → AAL2 persistito → operazioni editoriali privilegiate.

### SEC-AUTH-04 — Session user trust boundary
**PASS + CI GUARD**

Il codice applicativo usa `auth.getUser()` per autenticare l'identità server-side prima delle decisioni di autorizzazione. `getApplicationSession()` risolve poi account/ruoli tramite RPC; il layout redazione aggiunge ruolo editor/admin e AAL2.

La CI contiene ora `Supabase unsafe session-user guard`: una chiamata diretta `.auth.getSession(` dentro `src/**` fa fallire il workflow.

Il warning emesso dalla libreria Supabase durante `getAuthenticatorAssuranceLevel()` non viene usato come fonte di identità o autorizzazione applicativa.

### SEC-AUTH-05 — Service-role boundary
**PASS SUL BRANCH / BUILD VERIFIED**

`src/lib/supabase/service.ts` importa `server-only`: un import diretto o indiretto del client service-role in un Client Component diventa errore di build. Build standard e build contro Supabase locale: PASS.

## 5. HTTP security / CSP

### SEC-HTTP-01 — Header baseline
**PASS SUL BRANCH / CI**

Verificati:

- HSTS;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` con camera/microfono/geolocalizzazione disabilitati;
- `X-Powered-By` assente.

### SEC-HTTP-02 — Content Security Policy
**PASS SUL CANDIDATO / FINAL LIVE SMOKE PENDING**

La CSP è applicata e lo smoke CI la verifica. Il candidato corrente include:

- `default-src 'self'`;
- `base-uri 'self'`;
- `object-src 'none'`;
- `frame-ancestors 'none'`;
- `frame-src 'none'`;
- `form-action 'self'`;
- `connect-src` ristretto all'esatta origine Supabase configurata per l'ambiente e alla corrispondente origine WebSocket;
- nessun wildcard `*.supabase.co`;
- nessun `'unsafe-eval'`;
- `upgrade-insecure-requests`.

`'unsafe-inline'` resta per script/style perché la rimozione corretta richiederebbe una deliberata architettura nonce/hash compatibile con Next.js. Non viene sostituita con una modifica improvvisata che rischi di rompere SSR/hydration.

Lo smoke fallisce se ricompaiono wildcard Supabase o `unsafe-eval`.

## 6. SEO / aree private

### SEO-INDEX-01 — Aree riservate fuori dall'indice
**PASS**

`/app/` e `/accedi` restano esclusi/`noindex`; i deploy-preview Netlify hanno `X-Robots-Tag: noindex, nofollow, noarchive`.

### SEO-BASE-02 — Canonical / hreflang / metadata
**PASS — FOUNDATION + BROWSER VERIFIED**

Metadata, canonical, hreflang, JSON-LD, sitemap e noindex preview sono coperti dai test automatici sulle superfici core.

### SEO-FINAL-03 — QA candidato/live
**PENDING**

Resta il controllo finale sul candidato effettivamente autorizzato e poi sul live.

## 7. CI, performance e hosting

### SEC-CI-01 — Editorial v1 CI
**PASS**

Head applicativo/security `4ffa299caf05938e4628ec536d5f0f9f129cb9c5`:

- run `32630712208`: **COMPLETED / SUCCESS**;
- TypeScript, test, functional gates, Radar, source-health self-test, privacy guard, dependency audit, Auth deprecation guard, unsafe-session guard, build, HTTP/CSP smoke, public browser E2E e Lighthouse: PASS.

### SEC-CI-02 — Supabase local migration validation
**PASS TECNICO / 22 PASS + 1 BLOCCO EDITORIALE INTENZIONALE**

Run `32630712281`:

- migration plan: PASS;
- cold-start: PASS;
- PostgreSQL lint: PASS;
- RLS/publication smoke: PASS;
- persistent form/login rate-limit: PASS;
- audit/analytics: PASS;
- backup archive: PASS;
- Auth integration: PASS;
- build contro Supabase locale: PASS;
- browser: **22 PASS / 1 FAIL**.

L'unico failure è il gate Storie: cold-start pubblica `guide:4`, `insight:12`, `institutional_page:1` e volutamente zero storie/interviste/testimonianze reali.

### SEC-CI-03 — Protezione `main`
**PROTECTED / REQUIRED CHECKS OFF**

`main` è protetto, ma i required status checks risultano ancora `enforcement_level: off` e senza context/check obbligatori. È una decisione di governance pre-release, non viene cambiata automaticamente.

### PERF-01 — Lighthouse mobile
**PASS CI — 3/3**

Evidenza verificata sul candidato applicativo precedente e preservata dai successivi hardening:

- LCP 1.223 s / 2.440 s / 2.368 s;
- CLS 0 / 0 / 0;
- performance 1.00 / 0.98 / 0.98.

Le soglie hard non sono state abbassate. Anche il workflow `32630712208` con CSP/service-role hardening ha superato Lighthouse.

### HOST-NETLIFY-01 — Deploy preview corrente
**PASS INFRASTRUTTURA / VISUAL DEVICE QA PENDING**

Deploy-preview Netlify del commit `4ffa299caf05938e4628ec536d5f0f9f129cb9c5`:

- deploy id `6a8abb4679db3c0008a38095`;
- state `ready`;
- context `deploy-preview`;
- `published_at = null`;
- plugin Next success;
- server function + edge function deployate;
- nessun production deploy.

Il runtime collegato non ha potuto aprire direttamente lo screenshot/URL non indicizzato: non viene quindi dichiarato completato il QA visuale umano/device.

## 8. Backup / recovery

### SEC-BACKUP-01 — Archive integrity
**PASS LOCAL/CI**

Dump/restore integrity PostgreSQL 17: PASS nel laboratorio.

### SEC-BACKUP-02 — Production backup + restore drill
**PENDING PRE-RELEASE**

Prima delle migration live servono backup production cifrato/checksum e restore drill su ambiente non-production. Nessuna operazione live è stata avviata.

## 9. Privacy e documenti legali

### LEGAL-01 — Privacy
**CONTENUTO TECNICAMENTE ALLINEATO / REVISIONE PROFESSIONALE PENDING**

La raccolta proposta distingue trattamento necessario per ricezione/valutazione dal consenso facoltativo alla pubblicazione. Analytics first-party resta aggregato/cookie-less.

### LEGAL-02 — Cookie
**RUNTIME GUARD PASS / REVISIONE FINALE PENDING**

Il privacy runtime guard fallisce CI se vengono introdotti tracker/embed noti o iframe senza revisione deliberata.

### LEGAL-03 — Termini
**CONTENUTO TECNICAMENTE ALLINEATO / REVISIONE PROFESSIONALE PENDING**

Resta la revisione legale finale sul servizio effettivamente attivato.

## 10. Integrità editoriale

### EDIT-01 — No auto-publish
**PASS**

Contributi pubblici, Radar e AI non dispongono di un percorso di auto-pubblicazione. La pubblicazione resta umana e role-gated.

### EDIT-02 — Versioning / audit
**PASS LOCAL/E2E — PRODUCTION MIGRATION PENDING**

Audit Inbox canonico DB-trigger, ledger privato `content_versions`, v1/v2/v3 e snapshot storico sono verificati nel laboratorio. La relativa migration non è stata applicata al live.

### EDIT-03 — Review governance
**DECISIONE PENDING**

Resta da stabilire se la review può coincidere con l'editor che porta il contenuto a `ready` oppure richiede un secondo soggetto/4-eyes. Non viene inventata una policy tecnica senza decisione esplicita.

### EDIT-04 — Storia reale
**BLOCKER CONTENUTO**

Il numero zero richiede almeno una storia/intervista/testimonianza reale. Non è ammesso chiudere il gate con placeholder o riclassificazioni artificiali.

## 11. Responsive e accessibilità

### UI-RESP-01 — Browser automatico
**PASS**

Reflow e navigazione mobile coperti su 320/390/768 px; matrice core multilingua 70/70 PASS.

### UI-RESP-02 — Device/visual QA umano
**PENDING**

Resta controllo su desktop/laptop/tablet/smartphone reali e sul deploy-preview candidato finale.

### UI-A11Y-01 — Baseline automatica
**PASS**

Landmark, H1, alt/label, nomi accessibili, contrasto token, focus e skip-link sono coperti dai test pertinenti.

### UI-A11Y-02 — WCAG 2.2 AA umano
**PENDING**

Screen reader, zoom, tastiera completa e valutazione percettiva richiedono ancora QA umano; i gate automatici non vengono presentati come certificazione WCAG.

## 12. Production Advisor snapshot — 2026-08-23

Audit eseguito in sola lettura, senza modificare production.

**Security Advisor:**

- warning `SECURITY DEFINER` sui due RPC self-service account: valutati intenzionali e circoscritti;
- warning `SECURITY DEFINER` sulla submission pubblica: intenzionale come accesso anonimo, ma rate-limit production ancora da attivare tramite migration già validata;
- Leaked Password Protection disabilitato: noto/accettato nel perimetro Free, con MFA privilegiati come mitigazione applicativa da attivare live.

**Performance Advisor:**

- `unused_index`: INFO; nessuna rimozione automatica;
- `multiple_permissive_policies`: WARN di performance; nessuna riscrittura RLS pre-release senza query-plan evidence.

## 13. Gate residui prima di `PRODUCTION_READINESS = PASS`

1. acquisire/approvare/pubblicare almeno una storia/intervista/testimonianza reale;
2. completare QA umano WCAG 2.2 AA + dispositivi reali;
3. completare revisione professionale Privacy / Cookie / Termini;
4. decidere governance editoriale same-editor vs 4-eyes;
5. osservare il primo run source-health schedulato reale;
6. attivare/verificare configurazione Auth production, incluso TOTP/AAL2 privilegiati;
7. eseguire backup production cifrato + restore drill non-production;
8. rileggere lo storico migration hosted subito prima del rilascio;
9. applicare il set migration autorizzato in ordine controllato, **incluso il persistent rate-limit prima di rendere live il form pubblico**;
10. ripetere Security/HTTP/RLS/rate-limit smoke sulla configurazione production;
11. decidere required status checks su `main`;
12. completare QA visuale/device sul deploy-preview finale;
13. autorizzare esplicitamente merge e deploy production;
14. eseguire smoke live finale dopo il deploy autorizzato.

Fino alla chiusura di questi punti:

`PRODUCTION_READINESS = NOT PASS`
