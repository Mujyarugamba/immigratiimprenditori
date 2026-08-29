# Numero zero — bozze di invito alle interviste

Data: 22 agosto 2026
Stato: **DRAFT / NON INVIATO**

Questi testi sono preparati per il lavoro redazionale. Non costituiscono contatto effettuato e non autorizzano alcun invio automatico.

## 1. Agie Hujian Zhou / Ravioleria Sarpi — italiano

**Oggetto:** Invito a un’intervista — Immigrati Imprenditori, Centro Studi AIPEL

Gentile Agie Zhou,

sono Augustin Mujyarugamba, direttore editoriale di **Immigrati Imprenditori**, il Centro Studi promosso da AIPEL dedicato all’imprenditoria generata dalle migrazioni, in Italia e nel mondo.

Stiamo preparando il primo nucleo editoriale del progetto e vorremmo raccontare, attraverso un’intervista originale, l’esperienza della **Ravioleria Sarpi**: la nascita dell’attività, il rapporto con Milano e con il quartiere Paolo Sarpi, la collaborazione con realtà storiche locali e il modo in cui culture e tradizioni imprenditoriali diverse possono incontrarsi concretamente.

L’intervista avrebbe carattere editoriale e di ricerca, non promozionale. Prima della pubblicazione verificheremmo con lei dati biografici, citazioni e gli eventuali materiali fotografici o audiovisivi utilizzati.

Se è disponibile, sarei lieto di concordare un colloquio nel formato per lei più comodo, anche online.

Un cordiale saluto,

**Ing. Augustin Mujyarugamba**  
Direzione editoriale — Immigrati Imprenditori / Centro Studi AIPEL  
redazione@immigratiimprenditori.it

---

## 2. Gianni Chiloiro e Angelo Sannino / Doppio Zero — italiano

**Oggetto:** Intervista su imprenditoria italiana negli Stati Uniti — Immigrati Imprenditori

Gentili Gianni Chiloiro e Angelo Sannino,

sono Augustin Mujyarugamba, direttore editoriale di **Immigrati Imprenditori**, Centro Studi promosso da AIPEL.

Il nostro progetto studia l’imprenditoria migrante **in qualunque direzione geografica**: non soltanto le imprese create da immigrati in Italia, ma anche l’esperienza degli italiani che costruiscono impresa all’estero. Per questo vorremmo dedicare un’intervista originale alla vostra esperienza con **Doppio Zero** nella Bay Area.

Ci interessa approfondire il passaggio dall’Italia agli Stati Uniti, l’adattamento dell’impresa al mercato americano, il rapporto tra identità italiana e crescita aziendale, le differenze di contesto economico e regolatorio e i legami che restano con il Paese d’origine.

L’intervista sarebbe un contenuto editoriale e di ricerca. Citazioni, dati biografici e materiali utilizzati verrebbero verificati prima della pubblicazione.

Se siete disponibili, possiamo concordare un colloquio online in una data e in un orario compatibili con il fuso della California.

Cordiali saluti,

**Ing. Augustin Mujyarugamba**  
Direzione editoriale — Immigrati Imprenditori / Centro Studi AIPEL  
redazione@immigratiimprenditori.it

---

## 3. Adeola Adedewe / Kredete — English

**Subject:** Interview invitation — migrant entrepreneurship, diaspora finance and Kredete

Dear Mr. Adedewe,

My name is Augustin Mujyarugamba and I lead the editorial work of **Immigrati Imprenditori**, a research center promoted by AIPEL in Italy and focused on migrant entrepreneurship across countries and migration routes.

We are preparing the first editorial edition of the project and would be pleased to invite you to an original interview about your entrepreneurial journey and the development of **Kredete**.

Our interest is research-oriented rather than promotional. We would like to explore how your experience as a migrant shaped the problem you chose to address, the relationship between remittances and credit access, the challenges of building cross-border financial infrastructure, and the broader economic role of diasporas between countries of origin and destination.

Before publication, we would verify biographical facts, quotations and any financial or company metrics mentioned in the conversation. Images, audio or video would only be used with the appropriate permission.

If you are available, we would be glad to arrange an online interview at a convenient time.

Kind regards,

**Augustin Mujyarugamba, Eng.**  
Editorial Director — Immigrati Imprenditori / AIPEL Research Center  
redazione@immigratiimprenditori.it

---

# Checklist operativa per ogni intervista

Il database dispone già del workflow:

`candidate → contacted → scheduled → interviewed → fact_check → approved → closed`

con possibili uscite `declined`.

## Prima del contatto

- verificare identità, ruolo e fonti principali;
- definire l’angolo editoriale e il collegamento con la missione del Centro Studi;
- preparare domande specifiche, evitando domande che presuppongano fatti non verificati;
- non copiare biografie o testi promozionali come se fossero contenuto redazionale originale.

## Al contatto

- chiarire che l’intervista è editoriale/di ricerca;
- non promettere la pubblicazione prima della revisione;
- chiarire eventuale registrazione audio/video prima di avviarla;
- registrare la data di contatto nel workflow solo dopo il contatto reale.

## Dopo l’intervista

- segnare `interviewed_at` soltanto quando l’intervista è effettivamente avvenuta;
- verificare nomi, date, numeri, cariche, sedi e claim aziendali;
- distinguere esplicitamente testimonianza personale e dato statistico;
- confrontare, quando pertinente, le affermazioni con fonti indipendenti;
- collegare soltanto indicatori metodologicamente compatibili.

## Consensi prima della pubblicazione

Gestire separatamente:

- **publication_consent_status** — consenso/autorizzazione alla pubblicazione dell’intervista o materiale personale;
- **quote_approval_status** — approvazione delle citazioni quando prevista dal processo editoriale;
- **image_consent_status** — utilizzo fotografie/immagini;
- **video_consent_status** — utilizzo video, se richiesto.

Un consenso `granted` deve avere la relativa data registrata. La mancanza di consenso necessario mantiene il materiale fuori dal percorso di pubblicazione.

## Fact-check finale

- fonti e link ancora accessibili;
- date e dati numerici confermati;
- citazioni attribuite correttamente;
- eventuali conflitti o interessi dichiarati quando pertinenti;
- titolo e abstract non più forti delle evidenze;
- nessuna inferenza sull’intera comunità derivata da un singolo caso;
- revisione umana finale prima del passaggio ad `approved`.
