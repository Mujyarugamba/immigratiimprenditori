import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sostieni l'Osservatorio",
  description:
    "Sostieni ImmigratiImprenditori.it e il lavoro del Centro Studi AIPEL su dati, analisi e testimonianze dell'imprenditoria migrante.",
};

const areeDiSostegno = [
  {
    title: "Ricerca e dati",
    text: "Raccolta, verifica e aggiornamento di indicatori, serie storiche, fonti e confronti territoriali.",
  },
  {
    title: "Storie e interviste",
    text: "Ricerca, preparazione e realizzazione di testimonianze, interviste e storie d'impresa documentate.",
  },
  {
    title: "Rapporti e pubblicazioni",
    text: "Produzione di dossier, analisi, rapporti e materiali di approfondimento accessibili e citabili.",
  },
  {
    title: "Produzione audiovisiva",
    text: "Registrazione, montaggio, trascrizione e pubblicazione di interviste, testimonianze, incontri e presentazioni.",
  },
] as const;

export default function SostieniPage() {
  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Immigrati Imprenditori · Osservatorio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Sostieni l&apos;Osservatorio
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          ImmigratiImprenditori.it è un progetto del Centro Studi AIPEL dedicato
          alla conoscenza dell&apos;imprenditoria migrante attraverso dati, analisi
          e testimonianze. Il sostegno ricevuto contribuisce alla ricerca, alla
          raccolta e verifica dei dati, alla realizzazione di interviste e alla
          produzione di rapporti e contenuti audiovisivi.
        </p>
      </header>

      <section className="py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Che cosa sostieni
        </h2>
        <div className="mt-6 grid gap-px border border-black bg-black sm:grid-cols-2">
          {areeDiSostegno.map((area) => (
            <article key={area.title} className="bg-white p-6">
              <h3 className="text-lg font-semibold text-black">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-black py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Indipendenza editoriale
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Donazioni, partnership e sponsorizzazioni non attribuiscono alcun diritto
          di intervento sulla selezione delle fonti, sui dati, sulle conclusioni,
          sulle interviste o sulle decisioni della redazione. Il sostegno economico
          rimane separato dall&apos;attività editoriale e di ricerca.
        </p>
      </section>

      <section className="border-t border-black py-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Donazioni
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Le modalità di donazione online saranno pubblicate in questa pagina dopo
          il completamento e la verifica del sistema di pagamento dedicato ad AIPEL.
          Fino ad allora non vengono raccolti pagamenti attraverso il sito.
        </p>
      </section>

      <section className="border-t border-black pt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Partnership e sostegno istituzionale
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Enti, fondazioni, università, associazioni e imprese possono contribuire
          a specifiche attività di ricerca, raccolta dati, produzione editoriale o
          iniziative pubbliche. Ogni collaborazione deve rispettare la missione e
          l&apos;indipendenza dell&apos;Osservatorio.
        </p>
      </section>
    </main>
  );
}
