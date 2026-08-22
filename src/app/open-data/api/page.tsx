import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API pubblica v1 | Open data",
  description:
    "Documentazione dell'API pubblica v1 di Immigrati Imprenditori per indicatori, Atlante, contesto di ricerca verificabile e relazioni del Knowledge Graph.",
  alternates: { canonical: "/open-data/api" },
};

const endpoints = [
  {
    path: "/api/v1/indicators",
    title: "Indicatori e valori",
    description: "Restituisce i valori finali degli indicatori pubblicati dall'Osservatorio.",
    filters: "indicator, territory, year, sector, category",
  },
  {
    path: "/api/v1/atlas/countries",
    title: "Paesi dell'Atlante",
    description: "Restituisce soltanto i Paesi del perimetro che dispongono di evidenze pubblicate.",
    filters: "—",
  },
  {
    path: "/api/v1/atlas/routes",
    title: "Rotte dell'Atlante",
    description: "Restituisce soltanto le rotte origine-destinazione che dispongono di evidenze pubblicate.",
    filters: "—",
  },
  {
    path: "/api/v1/context?q=termine",
    title: "Contesto di ricerca verificabile",
    description:
      "Restituisce risultati pubblici ordinati per pertinenza con riferimenti citabili. Non genera risposte AI.",
    filters: "q, limit",
  },
  {
    path: "/api/v1/graph",
    title: "Knowledge Graph derivato",
    description:
      "Espone nodi e relazioni ricavati dai dati pubblicati tra Paesi, indicatori, settori e rotte.",
    filters: "—",
  },
] as const;

export default function ApiDocsPage() {
  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-6">
        <Link href="/open-data" className="text-sm font-semibold underline underline-offset-4">
          ← Open data
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Open data · API
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          API pubblica v1
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          L&apos;API espone in sola lettura dati e relazioni già pubblicati dal Centro Studi. La versione <code>v1</code>
          stabilizza i percorsi pubblici senza sostituire le pagine metodologiche e le fonti originarie.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-black">Endpoint</h2>
        <div className="mt-5 grid gap-4">
          {endpoints.map((endpoint) => (
            <article key={endpoint.path} className="border border-black p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-black">{endpoint.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">{endpoint.description}</p>
                </div>
                <a href={endpoint.path} className="text-sm font-semibold underline underline-offset-4">
                  Apri JSON →
                </a>
              </div>
              <code className="mt-4 block overflow-x-auto bg-neutral-50 p-3 text-sm">GET {endpoint.path}</code>
              <p className="mt-3 text-sm text-neutral-600">Filtri: <code>{endpoint.filters}</code></p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Esempio</h2>
        <code className="mt-4 block overflow-x-auto bg-neutral-50 p-4 text-sm">
          GET /api/v1/indicators?indicator=imprese-straniere-registrate&amp;territory=IT-25&amp;year=2025
        </code>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
          Le risposte includono versione, data di generazione, numero di record e filtri applicati quando pertinenti.
          Il campo <code>quality_code</code> conserva la qualificazione editoriale del valore. Gli endpoint di contesto
          e grafo espongono soltanto relazioni o risultati riconducibili a materiale pubblico.
        </p>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Regole di utilizzo</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          L&apos;API è pubblica e in sola lettura. Non garantisce che indicatori differenti siano comparabili tra loro.
          Definizione, unità, popolazione osservata, periodo, metodologia e condizioni di riuso della fonte primaria
          devono essere considerate prima di ogni elaborazione o redistribuzione.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">Metodologia →</Link>
          <Link href="/fonti" className="underline underline-offset-4">Fonti →</Link>
          <Link href="/relazioni" className="underline underline-offset-4">Relazioni →</Link>
          <a href="/api/v1" className="underline underline-offset-4">Discovery JSON →</a>
        </div>
      </section>
    </main>
  );
}
