# Social istituzionali v1

## Perimetro

Il perimetro v1 comprende soltanto:

| Canale | Nome visibile | Handle/slug pianificato | Uso editoriale | Stato |
| --- | --- | --- | --- | --- |
| LinkedIn | Immigrati Imprenditori | `immigrati-imprenditori` | ricerca, rapporti, partnership, contenuti istituzionali | da creare/verificare |
| X | Immigrati Imprenditori | `@ImmImprenditori` | notizie, dati, segnalazioni, aggiornamenti | da creare/verificare |
| YouTube | Immigrati Imprenditori | `@immigratiimprenditori` | interviste, testimonianze, convegni, presentazioni | da creare/verificare |

Il sito `immigratiimprenditori.it` resta l'archivio originale. I social distribuiscono e rimandano ai contenuti del sito; non sostituiscono le pagine canoniche.

## Regola tecnica

I tre URL sono registrati in `src/lib/social/channels.ts` come pianificati ma con `enabled: false`.

Un canale può diventare `enabled: true` solo dopo:

1. creazione effettiva dell'account;
2. verifica del nome visibile e dell'handle finale;
3. verifica dell'URL pubblico in sessione non autenticata;
4. inserimento di logo, descrizione e link al sito coerenti con l'identità istituzionale;
5. conferma che non esista un account omonimo o una redirezione imprevista.

Finché il canale non è abilitato, footer, metadata e structured data non devono esporre il relativo URL.

## Profili

### LinkedIn

Descrizione breve proposta:

> Centro Studi AIPEL sull'imprenditoria migrante. Dati, analisi, rapporti, storie e relazioni economiche tra Paesi e territori.

### X

Descrizione breve proposta:

> Dati, ricerca, storie e aggiornamenti sull'imprenditoria migrante nel mondo. Centro Studi AIPEL.

### YouTube

Descrizione breve proposta:

> Interviste, testimonianze, convegni e presentazioni del Centro Studi AIPEL dedicato all'imprenditoria migrante.

## Stato gate

`SOCIAL_CHANNELS = EXTERNAL_SETUP_PENDING`

La configurazione editoriale e tecnica è pronta sul branch. Il gate non passa finché i tre account esterni non sono realmente creati e verificati.
