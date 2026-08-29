# Immigrati Imprenditori — Politica delle lingue

Stato: **CANONICO v1**

## Lingue prioritarie della piattaforma

Le sette lingue prioritarie per l'interfaccia e per la futura architettura multilingua del sito sono, nell'ordine:

1. **Italiano (`it`)** — lingua principale e istituzionale del progetto;
2. **English (`en`)** — ricerca internazionale, università, istituzioni e pubblico globale;
3. **Français (`fr`)** — Francia, Belgio, Svizzera, Africa francofona e rotte migratorie europee;
4. **Español (`es`)** — Spagna, America Latina e ampia diffusione internazionale;
5. **Deutsch (`de`)** — Germania e area economica germanofona, inclusa l'imprenditoria italiana all'estero;
6. **العربية (`ar`)** — Nord Africa, Medio Oriente e comunità imprenditoriali con forti relazioni con Italia ed Europa;
7. **中文 (`zh`)** — comunità imprenditoriale cinese in Italia e rilevanza economica globale.

La lingua predefinita è **italiano (`it`)**. L'arabo usa direzione di testo **RTL**; le altre sei lingue prioritarie usano **LTR**.

## Criteri di priorità

La priorità delle lingue non dipende soltanto dal numero di immigrati presenti in Italia. La scelta considera insieme:

- presenza e rilevanza delle comunità imprenditoriali migranti in Italia;
- diffusione internazionale della lingua;
- importanza per i flussi migratori e imprenditoriali europei;
- disponibilità di fonti statistiche, istituzionali e accademiche;
- capacità del Centro Studi di mantenere traduzioni e contenuti con qualità editoriale verificabile.

## Lingue della piattaforma e lingue editoriali

Le sette lingue prioritarie riguardano l'interfaccia del sito e la futura navigazione multilingua. Non limitano le lingue dei contenuti, delle fonti, delle interviste o degli eventi.

Il catalogo `languages` del database resta più ampio e può essere esteso. Un contenuto può essere registrato nella propria lingua originale anche quando quella lingua non appartiene alle sette lingue prioritarie della piattaforma.

La redazione non traduce automaticamente ogni contenuto in tutte le sette lingue. Ogni traduzione deve essere trattata come una versione editoriale verificata del contenuto originale, con collegamento esplicito tra le versioni linguistiche.

## Implementazione

La configurazione applicativa canonica è in `src/lib/i18n/config.ts`.

Nel database le sette lingue prioritarie hanno `sort_order` da 1 a 7 nello stesso ordine; le altre lingue attive restano disponibili con priorità editoriale secondaria.

Prima dell'attivazione pubblica del selettore lingua devono essere completati:

- routing per locale;
- collegamento tra versioni tradotte dello stesso contenuto;
- metadata localizzati e `hreflang`;
- gestione RTL per l'arabo;
- fallback verso la lingua originale quando una traduzione non esiste;
- verifica SEO, accessibilità e responsive per tutte le lingue attivate.

`LANGUAGE_POLICY = PASS`
