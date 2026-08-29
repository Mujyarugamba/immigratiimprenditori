# Immigrati Imprenditori — Homepage editoriale v1

Stato: CANONICO
Data: 2026-08-22

## Obiettivo

La Home non è una vetrina aziendale. In pochi secondi deve comunicare che Immigrati Imprenditori studia, misura e ascolta l'imprenditoria migrante nel mondo.

La pagina deve tenere insieme il doppio carattere permanente del progetto: **dati + persone**.

## Moduli obbligatori

### 1. Un dato importante

Implementazione: sezione `I numeri chiave` alimentata dagli indicatori pubblici dell'Osservatorio.

Ogni valore mostra almeno:

- titolo indicatore;
- valore e unità;
- periodo;
- territorio/Paese quando disponibile;
- fonte quando disponibile;
- link all'Osservatorio per metodo e dettaglio.

La Home non crea numeri propri e non mostra valori se il caricamento pubblico non restituisce un indicatore utilizzabile.

### 2. Un rapporto o studio

Implementazione: feature principale selezionata preferendo tipi `report`, `research`, `research_report`, `policy_brief` o `data_note` tra i contenuti pubblici disponibili.

Se non esiste uno studio pubblico, la pagina rimanda alla biblioteca di ricerca senza inventare un titolo editoriale falso.

### 3. Una storia o intervista

Implementazione: sezione `Le voci dell'imprenditoria migrante` alimentata esclusivamente da contenuti pubblici dei tipi intervista/storia/testimonianza.

Se non esistono storie pubbliche, la sezione dichiara esplicitamente l'assenza del materiale invece di sostituirlo con stock content o testimonianze simulate.

### 4. Un evento o tema attuale

Implementazione: primo evento pubblico qualificato restituito dal data layer.

Mostra titolo, sintesi quando disponibile, data e contesto geografico/organizzativo quando disponibili.

Se non esiste un evento pubblico, viene mostrato un messaggio neutro con link al calendario.

### 5. Contenuti recenti

Implementazione: griglia `In evidenza`, con selezione di contenuti pubblici non duplicati rispetto alle feature principali.

La differenziazione è editoriale e tipografica; non usa una palette differente per ogni tipo di contenuto.

### 6. Invito a contribuire

Implementazione: sezione `Contribuisci al Centro Studi`.

L'azione pubblica invita a:

- raccontare una storia;
- proporre un'intervista;
- segnalare un evento;
- segnalare una ricerca o un rapporto.

Il testo esplicita che tutto entra nella Inbox redazionale e che verifica e valutazione precedono qualsiasi pubblicazione.

## Gerarchia

Ordine corrente:

1. hero istituzionale + studio/rapporto;
2. contenuti/evento in evidenza;
3. numeri dell'Osservatorio;
4. trend + storie/interviste;
5. contribuisci.

La sequenza è intenzionale: identità e ricerca → attualità editoriale → evidenza quantitativa → voce umana → partecipazione.

## Regole sui fallback

- gli errori di lettura non devono rompere la Home;
- i fallback devono essere espliciti e non presentarsi come dati/contenuti reali;
- nessuna informazione statistica viene simulata;
- nessuna storia/intervista viene simulata;
- nessun evento viene inventato;
- le feature opzionali degradano verso link reali alle sezioni del sito.

## Identità visiva

La Home applica `VISUAL-IDENTITY-V1.md`:

- nero/bianco/grigi come base;
- fotografie soltanto se editorialmente reali;
- nessun gradiente visibile;
- niente card multicolori;
- fascia dati simile a un rapporto, non a una dashboard SaaS;
- pannello Voci nero unico;
- un solo accento funzionale.

## Responsive

Le griglie principali degradano progressivamente:

- desktop: hero a due colonne, griglie dati/contenuti complete;
- tablet: griglie ridotte e sezioni a una colonna quando necessario;
- mobile: card e metriche in colonna, voci su griglia compatta, CTA contributo impilata.

Il controllo responsive finale rientra comunque nel gate di production readiness.

## Gate

`HOME_V1 = PASS` richiede:

1. presenza dei sei moduli obbligatori;
2. nessun contenuto fittizio presentato come reale;
3. collegamenti alle sezioni di approfondimento;
4. coerenza con il design system editoriale;
5. typecheck, test, build e HTTP smoke verdi;
6. Deploy Preview Netlify verde.

Il popolamento editoriale del Numero Zero resta un gate separato prima del go-live.
