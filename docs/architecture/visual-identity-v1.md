# Identità visiva v1 — Immigrati Imprenditori

## Direzione

L'interfaccia deve comunicare un Centro Studi e una rivista istituzionale, non una startup o un prodotto SaaS.

Principi permanenti:

- prevalenza assoluta di nero, bianco e grigi neutri;
- un solo colore secondario, usato come segnale funzionale e non decorativo;
- nessun gradiente decorativo;
- nessun sistema di card multicolori;
- nessuna ombra usata per simulare profondità di prodotto;
- bordi, griglie e spaziature sono preferiti a box-shadow e superfici flottanti;
- fotografie solo quando hanno funzione editoriale o documentaria;
- grafici essenziali, leggibili e citabili;
- tipografia con gerarchia forte e ampio uso dello spazio bianco.

## Palette

- Nero principale: `#111111`
- Nero profondo: `#0a0a0a`
- Bianco: `#ffffff`
- Fondo neutro: `#f5f4f0`
- Linea: `#d7d7d2`
- Testo secondario: `#5f5f5a`
- Accento funzionale: `#9a6b24`

L'accento funzionale è riservato soprattutto a call to action istituzionali importanti e focus/accessibilità. Non va usato per differenziare sezioni, tipi di contenuto o card.

## Tipografia

- Sans-serif per navigazione, metadati, interfaccia e testi funzionali.
- Serif per titoli editoriali, dati chiave e passaggi di forte gerarchia.
- Titoli grandi ma non pubblicitari; niente effetti display gratuiti.
- Etichette in maiuscolo solo per metadati, kicker e tassonomie.

## Griglia

- Contenitore editoriale massimo circa 1180 px.
- Allineamenti coerenti tra header, hero, sezioni dati, contenuti e footer.
- Separazioni affidate a linee da 1 px e spaziatura, non a card flottanti.
- Mobile: struttura a colonna singola senza perdere ordine editoriale.

## Header

- Barra istituzionale nera per identità, ricerca, policy, accesso e lingue.
- Header principale bianco con logo, navigazione primaria e una sola CTA di sostegno.
- Hover tramite sottolineatura, non cambio cromatico decorativo.

## Home

- Hero editoriale: fotografia documentaria se disponibile; in assenza, fondo nero.
- Overlay uniforme, senza gradienti.
- Contenuto in evidenza trattato come richiamo editoriale, non card promozionale.
- Fascia indicatori in fondo neutro chiaro, come pagina di rapporto/ricerca.
- Sezione Storie e voci in nero per distinguere il materiale umano e documentario.

## Dati e grafici

- Linee e punti grafici neri su fondo neutro/bianco.
- Colore non usato per suggerire significato se il significato può essere espresso con etichette, forma o posizione.
- Fonte, periodo, unità e territorio restano visibili vicino al dato.

## Footer

- Nero pieno, colonne informative ordinate, logo monocromatico.
- Nessuna call to action decorativa; collegamenti sottolineati su hover.

## Implementazione

Il layer `src/app/editorial-identity.css` è importato dopo gli stili globali e responsive preesistenti. Questo consente di:

- applicare la nuova direzione senza riscrivere immediatamente tutto il legacy CSS;
- mantenere il passaggio reversibile durante la fase di preview;
- estendere la palette monocromatica anche alle utility Tailwind tramite override delle variabili di tema;
- procedere successivamente alla pulizia del CSS legacy dopo validazione visiva.

## Gate

`VISUAL_IDENTITY` può essere considerato `PASS` solo dopo:

1. typecheck e test verdi;
2. build Next completa verde;
3. Deploy Preview Netlify pronto;
4. controllo visivo di home, header/footer, Osservatorio, Fonti e almeno una pagina editoriale;
5. assenza di regressioni responsive evidenti.
