# Immigrati Imprenditori — Production Readiness

Stato: **GATE APERTO — NON PASS**

Data audit: 2026-08-20

Questo documento registra lo stato verificato del gate 19 della roadmap. Un elemento è PASS solo quando è stato verificato sul codice o sul progetto Supabase collegato; gli elementi non verificati restano aperti.

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

Test live con ruolo `anon`:

- contenuti visibili: esclusivamente `editorial_status=ready`, `publication_status=published`, `visibility_status=public`;
- eventi visibili: esclusivamente `editorial_status=ready`, `publication_status=published`, `visibility_status=public`.

## 2. Funzioni SECURITY DEFINER

### SEC-FUNC-01 — Self-service account deletion
**PASS / WARNING INTENZIONALE**

`access_self_close_account()` e `access_self_delete_preflight()` sono `SECURITY DEFINER`, ma:

- richiedono `auth.role() = authenticated`;
- richiedono `auth.uid()`;
- hanno `search_path=''`;
- lavorano soltanto sull'account associato all'utente corrente;
- impediscono la chiusura dell'ultimo amministratore applicativo.

Il warning del Supabase Security Advisor è quindi previsto e non va rimosso automaticamente.

### SEC-FUNC-02 — Contributo editoriale pubblico
**HARDENING PREPARATO — APPLY PENDING**

`submit_editorial_contribution()` deve restare eseguibile da `anon` perché `/contribuisci` funziona senza account.

Hardening preparato nella migration:

`20260820173000_harden_editorial_public_submission.sql`

La migration aggiunge:

- limiti massimi agli input;
- consenso al ricontatto obbligatorio anche nel database;
- URL ammessi solo `http://` e `https://`;
- normalizzazione email;
- grant espliciti soltanto a `anon` e `authenticated` dopo revoca da `public`.

Non applicare alla produzione finché il branch non ha superato build/test.

## 3. Form pubblico / anti-abuso

### SEC-FORM-01 — Validazione server-side
**PASS SUL BRANCH**

La Server Action di `/contribuisci` verifica tipo di contributo, campi obbligatori, consenso, limiti di lunghezza e URL HTTP/HTTPS.

### SEC-FORM-02 — Honeypot
**PASS SUL BRANCH**

Aggiunto honeypot senza cookie o tracker esterni per filtrare bot elementari.

### SEC-FORM-03 — Rate limiting persistente
**BLOCKER**

Manca ancora un rate limit persistente affidabile per login e invio contributi. L'honeypot non sostituisce il rate limiting.

## 4. Autenticazione

### SEC-AUTH-01 — Leaked Password Protection
**BLOCKER**

Il Supabase Security Advisor segnala:

`Leaked Password Protection Disabled`

Da abilitare nelle impostazioni Auth del progetto prima del go-live.

### SEC-AUTH-02 — Separazione ruoli redazionali
**PASS DI BASE**

L'accesso alla redazione verifica:

- account attivo;
- ruolo redattore oppure amministratore applicativo;
- redirect fuori dall'area privata in caso di ruolo non ammesso.

Resta necessario il test E2E completo dei ruoli prima del go-live.

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

### SEC-INDEX-01 — Aree riservate fuori dall'indice
**PASS SUL BRANCH**

- `/app/` esclusa da `robots.txt`;
- `/accedi` esclusa da `robots.txt`;
- login con `robots: noindex, nofollow`;
- layout redazione con `robots: noindex, nofollow`.

## 7. Dipendenze e CI

### SEC-DEPS-01 — Dependabot
**PASS SUL BRANCH**

Aggiunta configurazione settimanale npm in `.github/dependabot.yml`.

### SEC-CI-01 — CI applicativa
**PARZIALE**

Il repository ha CI su pull request verso `main` con:

- `npm ci`;
- typecheck;
- test.

### SEC-CI-02 — Verifica ultimo branch
**BLOCKED DA HOSTING**

L'ultimo deploy Vercel non è stato eseguito per `build-rate-limit`. Questo non è un errore di compilazione, ma impedisce di dichiarare il branch verificato.

## 8. Privacy e documenti legali

### LEGAL-01 — Privacy Policy
**BLOCKER**

Da completare rispetto ai fornitori realmente usati e ai contatti del titolare.

### LEGAL-02 — Cookie Policy
**BLOCKER**

Da completare. Nella configurazione iniziale mantenere solo strumenti tecnici finché non viene definito un meccanismo di consenso per eventuali strumenti non tecnici.

### LEGAL-03 — Termini di utilizzo
**BLOCKER**

Da completare per account, contributi, materiali editoriali, proprietà intellettuale, abusi e sospensione account.

### LEGAL-04 — Materiali editoriali / autorizzazioni
**PARZIALE**

Il flusso `Contribuisci` registra consenso al ricontatto e consenso facoltativo alla possibile pubblicazione; immagini, audio e video richiedono autorizzazioni dedicate.

## 9. Identità istituzionale

### INST-01 — AIPEL
**QUASI PASS**

Pubblicati sul branch:

- denominazione AIPEL;
- forma associativa;
- sede;
- codice fiscale;
- partita IVA;
- Presidente;
- direzione editoriale;
- natura del progetto come Osservatorio e Centro Studi, non testata giornalistica.

Mancano ancora recapiti istituzionali e contatto privacy da pubblicare.

## 10. Gate residui prima di PRODUCTION_READINESS = PASS

1. build/test del branch senza rate-limit Vercel;
2. applicazione e verifica della migration di hardening contributi;
3. rate limiting persistente su login e contributi;
4. Leaked Password Protection Supabase attiva;
5. CSP progettata e verificata;
6. Privacy Policy, Cookie Policy e Termini completi;
7. recapiti istituzionali/privacy AIPEL;
8. test E2E finale ruoli, bozze, escalation, pubblicazione e mobile/accessibilità;
9. verifica branch protection e controlli obbligatori su `main`.

Fino alla chiusura di questi punti:

`PRODUCTION_READINESS = NOT PASS`
