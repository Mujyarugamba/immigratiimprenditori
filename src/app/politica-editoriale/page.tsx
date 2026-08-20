import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica editoriale e correzioni",
  description:
    "Principi editoriali, criteri sulle fonti e politica delle correzioni di Immigrati Imprenditori.",
};

export default function PoliticaEditorialePage() {
  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Immigrati Imprenditori · Centro Studi AIPEL
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Politica editoriale e correzioni
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Immigrati Imprenditori nasce per studiare e raccontare l&apos;imprenditoria migrante
          con un metodo riconoscibile: fonti identificabili, distinzione tra dati e interpretazioni,
          responsabilità umana della redazione e correzione trasparente degli errori.
        </p>
      </header>

      <div className="mt-10 max-w-3xl space-y-10 text-base leading-7 text-neutral-700">
        <section>
          <h2 className="text-2xl font-semibold text-black">1. Indipendenza editoriale</h2>
          <p className="mt-4">
            Le decisioni su cosa studiare, verificare e pubblicare spettano alla redazione.
            Donazioni, partnership, sponsorizzazioni e rapporti istituzionali non attribuiscono
            alcun diritto di approvazione preventiva, modifica o rimozione dei contenuti editoriali.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">2. Dati, analisi e opinioni</h2>
          <p className="mt-4">
            Il progetto distingue, per quanto possibile, tre livelli: dati o fatti documentabili,
            analisi e interpretazioni della redazione o degli autori, opinioni attribuite alle persone
            intervistate o ai soggetti citati. Una testimonianza non viene presentata come dato statistico
            e un&apos;interpretazione non viene presentata come fatto accertato.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">3. Gerarchia e trasparenza delle fonti</h2>
          <p className="mt-4">Le fonti vengono valutate in relazione alla natura del contenuto. Il registro editoriale distingue almeno:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>fonti ufficiali e statistiche;</li>
            <li>ricerca accademica;</li>
            <li>istituzioni e organismi pubblici;</li>
            <li>centri studi, fondazioni e organismi indipendenti;</li>
            <li>associazioni e organizzazioni di rappresentanza;</li>
            <li>stampa e media;</li>
            <li>testimonianze e interviste dirette.</li>
          </ul>
          <p className="mt-3">
            Quando un dato è pubblicato, devono essere indicati, ove pertinenti, fonte, periodo,
            unità di misura, territorio, metodologia, data di aggiornamento ed eventuali limiti.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">4. Verifica</h2>
          <p className="mt-4">
            La redazione cerca la fonte primaria quando disponibile, confronta informazioni rilevanti
            e valuta l&apos;attendibilità delle fonti secondarie. Affermazioni controverse o potenzialmente
            lesive richiedono un livello di verifica proporzionato alla loro gravità.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">5. Storie, interviste e testimonianze</h2>
          <p className="mt-4">
            Le voci delle persone sono parte essenziale del progetto, ma non sostituiscono la verifica.
            Le citazioni devono rispettare il senso delle dichiarazioni rese. Fotografie, audio, video e
            materiali personali sono pubblicati solo quando la redazione dispone delle autorizzazioni
            e delle basi necessarie al caso concreto.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">6. Contributi esterni</h2>
          <p className="mt-4">
            Segnalazioni e proposte inviate tramite “Contribuisci” non vengono pubblicate automaticamente.
            Entrano nella Inbox privata e possono essere verificate, approfondite, assegnate, rifiutate o
            archiviate. La responsabilità della pubblicazione resta alla redazione.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">7. Correzioni e aggiornamenti</h2>
          <p className="mt-4">
            Un errore fattuale verificato viene corretto senza attendere che diventi rilevante mediaticamente.
            Quando la modifica incide in modo sostanziale sul significato del contenuto, la pagina deve indicare
            che è stata corretta o aggiornata e, quando utile, la natura della modifica e la data.
          </p>
          <p className="mt-3">
            Correzioni meramente tipografiche o formali che non modificano il significato possono essere effettuate
            senza nota separata. Un contenuto può essere ritirato quando non sia possibile correggerlo in modo
            sufficiente o quando emergano ragioni giuridiche o di tutela adeguatamente motivate.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">8. Conflitti d&apos;interesse</h2>
          <p className="mt-4">
            Autori e collaboratori devono segnalare alla redazione interessi professionali, economici o personali
            direttamente rilevanti per il contenuto. Quando il conflitto è significativo per il lettore, viene
            dichiarato nel contenuto o gestito mediante diversa assegnazione editoriale.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">9. Automazione e strumenti di intelligenza artificiale</h2>
          <p className="mt-4">
            Sistemi automatici possono supportare ricerca, monitoraggio, classificazione, trascrizione o attività
            preparatorie. Non pubblicano autonomamente contenuti. La verifica delle fonti, la decisione editoriale
            e la responsabilità della pubblicazione restano umane.
          </p>
        </section>

        <section className="border-t border-black pt-8">
          <h2 className="text-2xl font-semibold text-black">10. Richieste di correzione</h2>
          <p className="mt-4">
            Segnalazioni motivate di errori possono essere inviate a
            {" "}<a href="mailto:info@aipel.it" className="underline underline-offset-4">info@aipel.it</a>,
            indicando la pagina interessata e gli elementi che consentono di verificare la richiesta.
          </p>
        </section>
      </div>
    </main>
  );
}
