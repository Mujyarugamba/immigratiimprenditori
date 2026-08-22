# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit: 2026-08-22

Questo documento registra lo stato verificato del gate 19 della roadmap. Un elemento è PASS solo quando è stato verificato sul codice o sul servizio collegato; gli elementi non verificati restano aperti. Le verifiche locali/CI non autorizzano né implicano applicazione al database o al deploy di produzione.

## 1. Database e RLS

### SEC-RLS-01 — RLS sulle tabelle public
**PASS**

Verifica live Supabase: tutte le tabelle ordinarie dello schema `public` risultano con Row Level Security attiva e almeno una policy.

### SEC-RLS-02 — Inbox e account non leggibili da anon
**PASS**

Test con ruolo `anon`:

- `editorial_inbox_items`: `SELECT` negato;
- `accounts`: `SELECT` negato.

La coda redazionale e gli account non sono quindi consultabili anonimamente.

### SEC-RLS-03 — Solo contenuti pubblicati visibili ad anon
**PASS**

Test con ruolo `anon`:

- contenuti visibili: esclusivamente `editorial_status=ready`, `publication_status=published`, `visibility_status=public`;
- eventi visibili: esclusivamente `editorial_status=ready`, `publication_status=published`, `visibility_status=public`.

## 2. Funzioni SECURITY DEFINER

### SEC-FUNC-01 — Self-service account deletion
**PASS / WARNING INTENZIONALE**

`access_self_close_account()` e `access_self_delete_preflight()` sono `SECURITY DEFINER`, ma:

- richiedono utente autenticato;
- richiedono `auth.uid()`;
- hanno `search_path=''`;
- lavorano soltanto sull'account associato all'utente corrente;
- impediscono la chiusura dell'ultimo amministratore applicativo.

Il warning del Supabase Security Advisor è quindi previsto e non va rimosso automaticamente.

### SEC-FUNC-02 — Contributo editoriale pubblico
**HARDENING PREPARATO / LOCAL CI PASS — PRODUCTION APPLY PENDING**

`submit_editorial_contribution()` deve restare eseguibile da `anon` perché `/contribuisci` funziona senza account.

L'hardening preparato aggiunge:

- limiti massimi agli input;
- consenso al ricontatto obbligatorio anche nel database;
- URL ammessi solo `http://` e `https://`;
- normalizzazione email;
- grant espliciti soltanto a `anon` e `authenticated` dopo revoca da `public`;
- rate limiting persistente con chiavi non reversibili.

Il laboratorio Supabase standalone ricostruito da zero e gli smoke di sicurezza risultano PASS. L'applicazione al database production resta un'operazione separata e non è stata eseguita.

## 3. Form pubblico / anti-abuso

### SEC-FORM-01 — Validazione server-side
**PASS SUL BRANCH**

La Server Action di `/contribuisci` verifica tipo di proposta, campi obbligatori, consenso, limiti di lunghezza e URL HTTP/HTTPS.

### SEC-FORM-02 — Honeypot
**PASS SUL BRANCH**

Aggiunto honeypot senza cookie o tracker esterni per filtrare bot elementari.

### SEC-FORM-03 — Rate limiting persistente
**PASS LOCAL/CI — PRODUCTION ACTIVATION PENDING**

Il rate limiting persistente è verificato nel laboratorio locale/CI per form e login. Il browser E2E prova anche il blocco del login dopo la soglia prevista. La produzione non è stata modificata.

## 4. Autenticazione

### SEC-AUTH-01 — Leaked Password Protection
**NON DISPONIBILE SUL PIANO FREE / MITIGAZIONE PRIVILEGIATI PASS LOCAL/CI**

La funzione Supabase Leaked Password Protection non è disponibile nel perimetro Free attuale. Per gli account privilegiati la mitigazione applicativa è MFA TOTP obbligatoria. L'attivazione/configurazione production resta separata dal test locale.

### SEC-AUTH-02 — Separazione ruoli redazionali
**PASS LOCAL/CI**

Sono verificati:

- account attivo;
- assegnazione separata dei ruoli `contributore`, `redattore`, `amministratore_applicativo`;
- auto-elevazione del contributore negata;
- contributore ammesso alla propria proposta e negato alla redazione;
- redattore con sola password riconosciuto come assegnato ma privo dei privilegi editoriali.

### SEC-AUTH-03 — MFA TOTP e AAL2 per ruoli privilegiati
**PASS LOCAL/CI — PRODUCTION ACTIVATION PENDING**

Per `redattore` e `amministratore_applicativo` l'autorizzazione privilegiata richiede `aal2` anche nei helper DB/RLS/RPC. Il browser E2E reale verifica:

1. login password → `aal1`;
2. accesso diretto alla redazione → redirect MFA;
3. enrollment TOTP reale;
4. challenge + verify reale;
5. sessione promossa e persistita `aal2` su una nuova richiesta server;
6. accesso a `/app/redazione/contenuti/nuovo`;
7. creazione → `ready` → pubblicazione → pagina pubblica.

Il laboratorio CI abilita esplicitamente TOTP nella configurazione Auth effimera per non dipendere da default impliciti. Nessuna configurazione Auth production è stata cambiata.

## 5. HTTP security

### SEC-HTTP-01 — Header baseline
**PASS SUL BRANCH**

Configurati globalmente:

- `Strict-Transport-Security`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` con camera, microfono e geolocalizzazione disattivati.

### SEC-HTTP-02 — Content Security Policy
**BLOCKER PRE-GO-LIVE**

CSP non ancora applicata. Va costruita dopo l'inventario definitivo di Supabase, media/embed e altri servizi esterni. Non introdurre una CSP improvvisata che rompa Next.js.

## 6. SEO / aree private

### SEO-INDEX-01 — Aree riservate fuori dall'indice
**PASS SUL BRANCH**

- `/app/` esclusa da `robots.txt`;
- `/accedi` esclusa da `robots.txt`;
- login con `robots: noindex, nofollow`;
- layout redazione con `robots: noindex, nofollow`.

### SEO-BASE-02 — Base pubblica
**PASS DI BASE**

Sono presenti metadata globali, dominio canonico, `robots.txt` e `sitemap.xml` per le rotte pubbliche principali.

### SEO-FINAL-03 — Audit pagina per pagina
**PENDING**

Prima del go-live verificare title e description specifici, canonical, gerarchia H1/H2, Open Graph, immagini/alt, contenuti dinamici in sitemap e dati strutturati dove utili.

## 7. Dipendenze, CI e hosting

### SEC-DEPS-01 — Dependabot
**PASS SUL BRANCH**

Configurazione settimanale npm presente in `.github/dependabot.yml`.

### SEC-CI-01 — CI applicativa e laboratorio Supabase
**PASS SUL BRANCH**

Sul commit `7f3a39a70bca4f728442855a85ed3fc2f72fbbb3` risultano completamente PASS:

- `Editorial v1 CI / verify`;
- `Supabase local migration validation / validate-local-database`.

La validazione comprende typecheck, test, Auth deprecation guard, Next build, HTTP smoke, browser pubblico, cold-start standalone Supabase, lint PostgreSQL, RLS/security smoke, rate-limit smoke, Auth integration, build contro Supabase locale e browser E2E autenticato con MFA.

### SEC-CI-02 — Protezione `main`
**PASS — RULESET ATTIVO**

GitHub restituisce `main` come `protected: true` dopo l'attivazione del ruleset sul default branch. I required status checks non vengono dichiarati attivi finché non saranno verificati separatamente; questa distinzione va mantenuta.

### HOST-NETLIFY-01 — Deploy branch
**PASS DI INFRASTRUTTURA / HEAD DA RIVERIFICARE**

Netlify resta il solo ambiente preview previsto per questo branch. Prima della chiusura del gate va verificato che il deploy preview corrente corrisponda all'ultimo commit approvato e che non vi siano regressioni runtime. Nessun deploy production è parte di questo audit.

## 8. Privacy e documenti legali

### LEGAL-01 — Privacy Policy
**CONTENUTO AGGIORNATO / REVISIONE FINALE PENDING**

La pagina identifica AIPEL come titolare, pubblica codice fiscale `97342380157`, PEC `direzione@pec.aipel.it` e contatto privacy `info@aipel.it`; indica inoltre i fornitori applicativi effettivamente usati, inclusi Supabase e Netlify. Resta necessaria una revisione finale rispetto alla configurazione reale al go-live e agli obblighi giuridici applicabili.

### LEGAL-02 — Cookie Policy
**CONTENUTO AGGIORNATO / VERIFICA TECNICA PENDING**

La pagina descrive l'uso di strumenti tecnici e l'assenza di profilazione e usa `cookies@aipel.it` come contatto dedicato. Prima del go-live va verificato tecnicamente che non siano caricati strumenti non tecnici o embed che richiedano consenso.

### LEGAL-03 — Termini di utilizzo
**CONTENUTO AGGIORNATO / REVISIONE FINALE PENDING**

I termini identificano AIPEL, pubblicano codice fiscale `97342380157`, PEC `direzione@pec.aipel.it` e il contatto dedicato `termini@aipel.it`; coprono account, proposte editoriali, materiali, proprietà intellettuale, abusi, modifiche del servizio e responsabilità. Resta la revisione giuridica finale.

### LEGAL-04 — Materiali editoriali / autorizzazioni
**PARZIALE**

Il flusso pubblico registra consenso al ricontatto e consenso facoltativo alla possibile pubblicazione; immagini, audio e video possono richiedere autorizzazioni dedicate.

## 9. Identità istituzionale e continuità

### INST-01 — AIPEL, dati amministrativi e matrice contatti
**PASS SECONDO REGOLA EDITORIALE CORRENTE**

Le pagine HTML pubbliche utilizzano la sigla `AIPEL`. Denominazione completa e sede non vengono esposte finché non sono aggiornate e stabilizzate. Codice fiscale e PEC compaiono nelle pagine legali pertinenti.

Matrice corrente:

- `info@immigratiimprenditori.it` — contatto generale del Centro Studi;
- `direzione@immigratiimprenditori.it` — rapporti istituzionali e partnership;
- `redazione@immigratiimprenditori.it` — contatti editoriali, fonti e correzioni;
- `info@aipel.it` — richieste privacy e informazioni istituzionali AIPEL quando pertinenti;
- `direzione@pec.aipel.it` — comunicazioni formali PEC;
- `termini@aipel.it` — Termini di utilizzo;
- `cookies@aipel.it` — Cookie Policy.

### INST-02 — Terminologia
**PASS SULLE PAGINE AUDITATE**

Regola canonica:

- `Immigrati Imprenditori` = progetto;
- `Centro Studi` = struttura complessiva;
- `Osservatorio` = sezione dati, indicatori e metodologia;
- `redazione` = persone responsabili dei contenuti.

### INST-03 — Continuità istituzionale
**PASS SULLE PAGINE PUBBLICHE AUDITATE**

Il progetto non viene presentato come nuovo o in avvio. Rimossi dalle pagine pubbliche auditate i riferimenti a “nasce”, “numero zero”, “fase iniziale”, “in preparazione”, funzioni “in arrivo” e placeholder di servizi non disponibili. La regola è permanente nel progetto editoriale.

## 10. Responsive e accessibilità

### UI-RESP-01 — Responsive nel codice
**PASS DI BASE**

La UI include breakpoint e ricomposizioni per desktop, tablet e mobile, comprese griglie, header, hero, dati e footer.

### UI-RESP-02 — Verifica visuale reale
**PENDING**

Prima del go-live eseguire controllo visuale almeno su desktop, laptop, tablet e smartphone, verificando overflow, menu, logo, gerarchie tipografiche, tabelle, grafici e moduli.

### UI-A11Y-01 — Accessibilità finale
**PENDING**

Verificare tastiera, focus, contrasto, etichette, struttura semantica, testi alternativi e principali flussi assistivi.

## 11. Gate residui prima di PRODUCTION_READINESS = PASS

1. applicare soltanto dopo autorizzazione le migration/hardening già validate localmente e ripetere gli smoke sulla configurazione production;
2. attivare e verificare MFA TOTP per i ruoli privilegiati nella configurazione Auth production;
3. decidere formalmente il trattamento del limite Leaked Password Protection del piano Free, mantenendo almeno la mitigazione MFA privilegiati;
4. progettare e verificare CSP;
5. completare revisione legale e verifica tecnica di Privacy, Cookie e Termini;
6. completare audit SEO pagina per pagina;
7. completare test responsive e accessibilità reali;
8. completare performance/Lighthouse e piano backup/recovery;
9. verificare separatamente i required status checks del ruleset `main` se devono diventare obbligatori per il merge;
10. verificare il preview Netlify sull'head finale approvato e chiudere il quality gate complessivo.

Fino alla chiusura di questi punti:

`PRODUCTION_READINESS = NOT PASS`
