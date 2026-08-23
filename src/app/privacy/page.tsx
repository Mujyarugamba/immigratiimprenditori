import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sul trattamento dei dati personali di ImmigratiImprenditori.it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Documenti legali · aggiornamento 23 agosto 2026
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questa informativa descrive come AIPEL tratta i dati personali nell&apos;ambito di
          ImmigratiImprenditori.it, inclusi navigazione, accesso alle aree riservate e invio
          di proposte editoriali.
        </p>
      </header>

      <div className="mt-10 max-w-3xl space-y-10 text-base leading-7 text-neutral-700">
        <section>
          <h2 className="text-2xl font-semibold text-black">1. Titolare del trattamento</h2>
          <p className="mt-4">
            Il titolare del trattamento è <strong className="text-black">Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia (AIPEL)</strong>, ente promotore del progetto ImmigratiImprenditori.it.
          </p>
          <p className="mt-3">
            Sede: <strong className="text-black">Viale Molise n. 54, 20137 Milano (MI)</strong>. Codice fiscale: <strong className="text-black">97342380157</strong>. Partita IVA: <strong className="text-black">04222160964</strong>.
          </p>
          <p className="mt-3">
            PEC: <a className="underline underline-offset-4" href="mailto:direzione@pec.aipel.it">direzione@pec.aipel.it</a>. Contatto per informazioni e richieste privacy: <a className="underline underline-offset-4" href="mailto:info@aipel.it">info@aipel.it</a>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">2. Dati trattati</h2>
          <p className="mt-4">A seconda delle funzioni utilizzate possono essere trattati:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>dati tecnici di navigazione e sicurezza, come indirizzo IP, data e ora, richieste al server e informazioni tecniche del browser;</li>
            <li>dati di account e autenticazione per redattori, amministratori e contributori abituali;</li>
            <li>nome, email, telefono, organizzazione e informazioni geografiche fornite attraverso i moduli di partecipazione;</li>
            <li>testi, link, materiali e informazioni contenuti nelle proposte editoriali;</li>
            <li>prese d&apos;atto, consensi e autorizzazioni registrati in relazione alla gestione delle proposte, alla pubblicazione e ai materiali audiovisivi;</li>
            <li>comunicazioni inviate ad AIPEL e dati necessari a gestire richieste, segnalazioni e rapporti istituzionali.</li>
          </ul>
          <p className="mt-3">
            Non chiediamo di inserire categorie particolari di dati personali se non sono
            realmente necessarie alla proposta. Chi invia materiali è invitato a evitare dati
            sensibili o dati di terzi non pertinenti.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">3. Finalità e basi giuridiche</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6">
            <li><strong className="text-black">funzionamento e sicurezza del sito:</strong> interesse legittimo del titolare a garantire integrità, prevenire abusi e mantenere il servizio;</li>
            <li><strong className="text-black">gestione degli account:</strong> esecuzione del servizio richiesto e interesse legittimo alla gestione della redazione e dei collaboratori autorizzati;</li>
            <li><strong className="text-black">ricezione, valutazione e approfondimento delle proposte:</strong> trattamento necessario per dare seguito alla richiesta dell&apos;interessato e interesse legittimo editoriale alla verifica dei materiali ricevuti; i recapiti obbligatori possono essere utilizzati per chiarimenti e verifiche strettamente collegati alla proposta;</li>
            <li><strong className="text-black">eventuale pubblicazione di testimonianze e materiali personali:</strong> avviene solo dopo valutazione editoriale e sulla base della base giuridica e delle autorizzazioni appropriate al caso concreto; l&apos;autorizzazione facoltativa presente nel modulo non determina alcuna pubblicazione automatica;</li>
            <li><strong className="text-black">misurazione aggregata del funzionamento del sito:</strong> quando la funzione è attivata, interesse legittimo a misurare in forma aggregata l&apos;utilizzo delle pagine per migliorare il servizio, con minimizzazione dei dati e senza profilazione;</li>
            <li><strong className="text-black">adempimenti legali e tutela dei diritti:</strong> obblighi di legge e interesse legittimo alla difesa di AIPEL e degli interessati.</li>
          </ul>
          <p className="mt-3">
            Quando uno specifico trattamento è fondato sul consenso, il consenso può essere revocato in
            qualsiasi momento senza pregiudicare la liceità del trattamento svolto prima della revoca.
            La presa d&apos;atto obbligatoria nel modulo di partecipazione documenta invece che l&apos;informativa
            è stata resa per il trattamento necessario a gestire la proposta e non costituisce consenso a finalità ulteriori.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">4. Storie, segnalazioni e materiali editoriali</h2>
          <p className="mt-4">
            Le proposte inviate attraverso i moduli di partecipazione entrano in una Inbox redazionale
            privata e non vengono pubblicate automaticamente. La redazione può verificare,
            approfondire, assegnare, archiviare o rifiutare una proposta.
          </p>
          <p className="mt-3">
            Fotografie, audio, video, interviste e altri materiali che richiedano autorizzazioni
            specifiche possono essere oggetto di richieste aggiuntive prima della pubblicazione.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">5. Destinatari e fornitori</h2>
          <p className="mt-4">
            I dati sono accessibili soltanto a persone autorizzate e ai fornitori necessari al
            funzionamento del progetto, secondo i rispettivi ruoli e contratti. Tra i fornitori
            utilizzati rientrano, in particolare:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Supabase, per database, autenticazione e servizi applicativi; il progetto attualmente collegato è configurato nella regione primaria UE <strong className="text-black">eu-west-3 (Parigi)</strong>;</li>
            <li>Vercel, per hosting e deployment dell&apos;applicazione web in produzione; Netlify può essere mantenuto per ambienti tecnici di anteprima e collaudo non destinati alla pubblicazione;</li>
            <li>fornitori di dominio e posta elettronica utilizzati da AIPEL, inclusi Aruba e i servizi Google quando impiegati per la gestione delle comunicazioni;</li>
            <li>consulenti o soggetti istituzionali quando la comunicazione sia necessaria per obblighi di legge o per la tutela di diritti.</li>
          </ul>
          <p className="mt-3">I dati non vengono venduti a terzi.</p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">6. Trasferimenti internazionali</h2>
          <p className="mt-4">
            La regione primaria del progetto Supabase determina la localizzazione dei dati primari del progetto, ma alcuni fornitori o loro sub-responsabili possono comportare trattamenti fuori dallo Spazio Economico Europeo. In tali casi i trasferimenti vengono gestiti mediante gli strumenti previsti dal GDPR, come decisioni di adeguatezza o clausole contrattuali standard, quando applicabili.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">7. Conservazione</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6">
            <li>le proposte non pubblicate sono conservate per il tempo necessario alla valutazione e, di regola, non oltre 24 mesi dalla decisione editoriale, salvo esigenze documentali o legali;</li>
            <li>i dati degli account sono conservati per la durata del rapporto e per il periodo successivo necessario a chiusura, sicurezza e tutela dei diritti;</li>
            <li>i materiali pubblicati e i relativi atti editoriali possono essere conservati nell&apos;archivio del Centro Studi finché permane la finalità editoriale, storica o documentale, fatti salvi diritti, correzioni e richieste legittime degli interessati;</li>
            <li>i log tecnici e di sicurezza sono conservati per periodi proporzionati alla prevenzione di abusi e alle configurazioni dei fornitori;</li>
            <li>le misurazioni applicative, quando abilitate, sono registrate direttamente come conteggi giornalieri aggregati per percorso e lingua, senza conservare nell&apos;archivio analytics IP, user-agent, identificatori cookie, account o eventi grezzi.</li>
          </ul>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">8. Conferimento dei dati e maggiore età</h2>
          <p className="mt-4">
            Per inviare una proposta sono necessari il tipo di proposta, il testo, il nome e un indirizzo email valido.
            Il modulo richiede inoltre la presa d&apos;atto dell&apos;informativa relativa alla gestione e all&apos;eventuale
            approfondimento della proposta. Senza questi elementi la richiesta non può essere trasmessa alla redazione.
          </p>
          <p className="mt-3">
            Titolo, telefono, organizzazione, contesto geografico e link sono facoltativi, salvo che diventino necessari
            nel caso concreto per verificare il materiale. L&apos;autorizzazione alla possibile pubblicazione è facoltativa e
            distinta dalla presa d&apos;atto necessaria per l&apos;invio.
          </p>
          <p className="mt-3">
            L&apos;invio di proposte e l&apos;attivazione di account riservati sono destinati a persone che abbiano compiuto <strong className="text-black">18 anni</strong>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">9. Diritti degli interessati</h2>
          <p className="mt-4">
            Nei casi previsti dal GDPR è possibile chiedere accesso, rettifica, cancellazione,
            limitazione, opposizione e portabilità dei dati, nonché revocare il consenso quando il trattamento si basa su di esso.
            Le richieste possono essere inviate a <a className="underline underline-offset-4" href="mailto:info@aipel.it">info@aipel.it</a>.
          </p>
          <p className="mt-3">
            È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">10. Decisioni automatizzate</h2>
          <p className="mt-4">
            ImmigratiImprenditori.it non adotta decisioni che producano effetti giuridici o
            analogamente significativi sull&apos;interessato basate unicamente su trattamenti automatizzati.
            Eventuali sistemi automatici di raccolta o classificazione editoriale supportano la redazione,
            che mantiene la decisione finale.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">11. Misurazione aggregata del sito</h2>
          <p className="mt-4">
            Quando abilitata, la misurazione applicativa invia a un endpoint dello stesso sito soltanto il percorso della
            pagina, senza query string, e la lingua della piattaforma. La richiesta non include credenziali applicative e
            l&apos;archivio analytics registra immediatamente solo conteggi aggregati per giorno, percorso e lingua.
          </p>
          <p className="mt-3">
            Il sistema applicativo non registra nell&apos;archivio analytics indirizzi IP, user-agent, identificatori cookie,
            account o una cronologia individuale di navigazione. La raccolta viene inoltre disattivata quando il browser
            segnala Global Privacy Control o Do Not Track. Restano distinti i dati tecnici di connessione che i fornitori
            infrastrutturali possono trattare per erogazione e sicurezza del servizio.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">12. Cookie e strumenti tecnici</h2>
          <p className="mt-4">
            Le informazioni sugli strumenti tecnici utilizzati dal sito sono disponibili nella
            nostra <Link href="/cookie" className="underline underline-offset-4">Cookie Policy</Link>.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">13. Aggiornamenti</h2>
          <p className="mt-4">
            Questa informativa viene aggiornata quando cambiano funzioni, fornitori o trattamenti.
            La data indicata in testa identifica la versione pubblicata.
          </p>
        </section>
      </div>
    </main>
  );
}
