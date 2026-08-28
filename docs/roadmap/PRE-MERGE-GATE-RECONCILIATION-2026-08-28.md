# Pre-merge gate reconciliation — Centro Studi

Data: 2026-08-28
Branch canonico: `work/pre-go-live-integration-20260826`
PR: #13 — DRAFT

Questo addendum riconcilia gli stati operativi dei documenti di roadmap e closure kit datati 22–23 agosto 2026. Dove un documento storico usa branch, hosting o gate precedenti incompatibili con lo stato qui registrato, **questo addendum prevale per la decisione pre-merge corrente**. La cronologia precedente resta conservata come evidenza storica.

## Gate già chiusi

- Production migration release: **PASS** — 25 migration di release applicate; `candidateDelta = []`; hosted max `20260824103000_harden_publication_gate_execute_privileges`.
- Production-source restore drill: **PASS**.
- Governance editoriale: **ibrida, decisa e attiva nel Production DB**.
- Branch protection: **Protect main ACTIVE**, required checks strict `verify` + `validate-local-database`, nessun bypass actor.
- Vercel duplication: **CHIUSA** — il progetto Production ignora branch diversi da `main`; il progetto Preview resta il percorso canonico per i branch.
- Netlify Git-triggered Preview: **canceled/neutralizzato**; non è il target Production.
- Lighthouse: Accessibility 100, Best Practices 100, SEO 100; mediana Performance 98. Favicon 404 chiuso.
- QA visivo Preview mini-trend/header/footer/favicon/console: **PASS** su 1440×900, 390×844 e 320×844.
- Storie reali: **non sono gate pre-go-live**; superficie e workflow sono pronti, popolamento reale post-go-live.

## QA visivo registrato

Preview verificato sul commit applicativo `3c6b464f4666075a872bde6c0a6f07568450a1f7`:

`https://immigratiimprenditori-preview-rhrix8jmw-inquotus-projects.vercel.app/`

Esiti:

- mini-trend “Imprese straniere registrate”: PASS (`giu 2025` → `dic 2025`, fonte leggibile, nessuna sovrapposizione/troncamento; wrapping leggibile a 320 px);
- header logo: PASS;
- footer logo `next/image`: PASS;
- favicon: PASS, asset 200 e nessuna richiesta `/favicon.ico`;
- console/network: PASS, nessun overlay Next.js e nessuna risorsa >=400.

Tra questo commit applicativo e il candidato successivo `2fe0e5071652d34252515581508b824cb264c6a5` sono cambiate soltanto documentazione/evidenze di release e `supabase/CS-PRODUCTION-RELEASE.json`, non il runtime applicativo; il QA è quindi trasferibile al runtime corrente.

## Gate ancora PENDING prima della decisione di merge

1. **#92 QA umano WCAG/device completo**: tastiera, screen reader, zoom/reflow, RTL e device reali ove disponibili. I gate automatici non equivalgono a certificazione WCAG.
2. **Revisione legale professionale**: il dossier tecnico è pronto, ma il record di sign-off Privacy/Cookie/Termini/fornitori/retention/IP resta da compilare da professionista competente.
3. **MFA frontend reale**: la logica TOTP/AAL2 è già PASS in E2E autenticato; resta un recheck sul vero frontend Vercel/ambiente reale.
4. **Performance sul target reale**: la mediana CI è verde; un primo run Lighthouse isolato ha mostrato cold-start anomalo, quindi resta opportuno un controllo sul Preview/live reale.
5. **Autorizzazione esplicita alla decisione di merge**.

## Gate post-merge / pre-go-live

- primo source-health run reale dal default branch;
- autorizzazione separata al deploy Production;
- protected Production smoke Vercel;
- live smoke sul dominio reale;
- eventuale cutover DNS solo dopo PASS e autorizzazione, senza alterare i record mail.

## Radar e outreach

`editorial-radar-nightly` può raccogliere candidati `status=new` nella Inbox redazionale privata. Questa write review-only è consentita e non costituisce pubblicazione.

Vincoli invarianti:

- `auto_publish=false`;
- nessun invito, email, richiesta di intervista, messaggio o altro contatto esterno prima del go-live + live smoke PASS;
- shortlist, candidati e bozze possono restare internamente in redazione in attesa di verifica;
- nessun contenuto fittizio o placeholder per chiudere gate editoriali.

## Hosting canonico

- Preview branch: **Vercel `immigratiimprenditori-preview`**.
- Production: **Vercel `immigratiimprenditori`**, solo `main` e solo dopo autorizzazione.
- `vercel.json` non separa i due progetti; contiene solo la regione `cdg1`.
- il Deploy Hook Production `Immi-hook` su `main` non va invocato prima dell'autorizzazione al vero build Production.
- Netlify non è il target Production corrente.

`PRE_MERGE_READINESS = PENDING` finché i cinque gate pre-merge sopra non sono chiusi.
