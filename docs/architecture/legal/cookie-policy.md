# Cookie Policy

**Cookie e tecnologie di memorizzazione — Immigrati Imprenditori**
**Versione bozza revisionata:** 11 agosto 2026
**Stato:** bozza di lavoro — da pubblicare solo dopo chiusura dei punti bloccanti indicati nel Legal Review Report

---

DOCUMENTO DA REVISIONARE PRIMA DELLA PUBBLICAZIONE DEFINITIVA. Recepisce l’audit tecnico L1.1 (Case A) e le decisioni del Titolare del 11 agosto 2026. Non costituisce attestazione di conformità legale assoluta.

## 1. Cosa utilizza oggi il sito

Sulla base dell’audit tecnico L1.1, il sito ricade attualmente nel **Case A**: non sono stati rilevati nel codice strumenti di analytics, pixel pubblicitari, CMP o tracker di marketing. Sono presenti soltanto meccanismi tecnici collegati al funzionamento della piattaforma.

## 2. Cookie/sessione di autenticazione

Supabase Auth, integrato con l’applicazione Next.js, utilizza meccanismi di sessione necessari a riconoscere l’utente autenticato e mantenere l’accesso all’area riservata. Nomi, durata e attributi effettivi dei cookie di autenticazione devono essere verificati rispetto alla configurazione runtime e alla documentazione corrente del fornitore prima della pubblicazione definitiva.

**Finalità:** autenticazione e sicurezza della sessione.
**Classificazione tecnica:** necessari al servizio richiesto dall’utente autenticato.
**Consenso preventivo:** non richiesto quando ricorrono i presupposti previsti per i cookie tecnici/necessari.

## 3. Preferenza impresa selezionata

La piattaforma utilizza il cookie `ii_selected_business_id` per ricordare l’impresa selezionata nell’area riservata. L’audit lo ha classificato come cookie funzionale/tecnico, HttpOnly, SameSite=Lax, Secure in produzione, con durata tecnica indicata di 90 giorni.

**Finalità:** preferenza di interfaccia nell’area riservata.
**Classificazione tecnica:** funzionale/tecnico (non marketing, non analytics).
**Consenso preventivo:** non richiesto secondo la valutazione attuale, fermo restando il riesame giuridico prima della pubblicazione definitiva.

## 4. Cosa non è stato rilevato

- Google Analytics o Google Tag Manager;
- Meta/Facebook Pixel;
- LinkedIn Insight Tag;
- Hotjar, Microsoft Clarity, PostHog o Plausible;
- Vercel Analytics o Speed Insights integrati nel codice applicativo;
- cookie di marketing o profilazione;
- piattaforme CMP/consent management.

## 5. Consenso e banner

Alla data della presente bozza, l’audit non ha rilevato tecnologie non necessarie che richiedano un meccanismo di consenso preventivo. **Non è previsto un banner di consenso meramente formale** per lo stato tecnico attuale.

Se in futuro verranno introdotti strumenti non necessari (analytics, advertising, profilazione, embed di terzi che lo richiedano), la piattaforma dovrà aggiornare questa policy e, ove necessario, impedire l’attivazione di tali strumenti fino alla scelta dell’utente.

## 6. Servizi infrastrutturali

Il sito è erogato tramite **Vercel** e utilizza **Supabase**. Tali fornitori possono trattare dati tecnici nell’ambito dell’erogazione, sicurezza e gestione dei propri servizi. Questa Cookie Policy descrive le tecnologie rilevate nell’applicazione; gli aspetti contrattuali e i trattamenti infrastrutturali devono essere coordinati con la Privacy Policy.

## 7. Local storage e altre tecnologie

L’audit non ha rilevato un utilizzo applicativo rilevante di localStorage, sessionStorage, IndexedDB o tecnologie analoghe per finalità di analytics, marketing o profilazione. Qualunque futura introduzione dovrà essere rivalutata prima del rilascio.

## 8. Futuri analytics o servizi di terzi

Se in futuro verranno introdotti analytics non necessari, strumenti pubblicitari, social embed o altri servizi che richiedano consenso, la piattaforma dovrà aggiornare questa policy e, ove necessario, attivare un meccanismo di consenso adeguato **prima** dell’attivazione di tali strumenti.

## 9. Gestione e cancellazione

L’utente può gestire o cancellare i cookie tramite le impostazioni del proprio browser. La rimozione dei cookie tecnici di sessione può comportare la disconnessione o impedire il corretto funzionamento di alcune funzioni riservate.

## 10. Titolare e contatti

**Titolare:** Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia (AIPEL), Associazione, Viale Molise n. 54, 20137 Milano (MI) — C.F. 97342380157 — P.IVA 04222160964.

**Contatto privacy/cookie:** **info@immigratiimprenditori.it**
(non è prevista, allo stato, una casella privacy@ separata).

## 11. Aggiornamenti

La presente Cookie Policy deve essere riesaminata ogni volta che vengono introdotti nuovi strumenti di analytics, advertising, embed, CMP o tecnologie di memorizzazione lato utente.

---

*Fine Cookie Policy (bozza)*
