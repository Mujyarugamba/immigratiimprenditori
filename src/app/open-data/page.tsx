import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Open data | Immigrati Imprenditori",
  description: "Accesso ai dati pubblicati dall'Osservatorio di Immigrati Imprenditori in formato consultabile, JSON e CSV.",
  alternates: { canonical: "/open-data" },
};

const FILTERS = [
  ["indicatore", "slug dell'indicatore", "imprese-straniere-registrate"],
  ["territorio", "codice territorio", "IT-25"],
  ["anno", "anno del periodo", "2025"],
  ["settore", "ID numerico del settore canonico", "12"],
  ["categoria", "codice del gruppo/categoria della fonte", "FB"],
] as const;

export default async function OpenDataPage() {
  const snapshot = await getExplorerSnapshot();

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Osservatorio · Open data</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Open data</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          I valori già pubblicati dall&apos;Osservatorio sono disponibili anche in formato strutturato.
          Le definizioni, le fonti e le note metodologiche restano parte integrante dell&apos;interpretazione del dato.
        </p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-3">
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori</p>
          <strong className="mt-2 block text-3xl">{snapshot.indicators.length}</strong>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Record</p>
          <strong className="mt-2 block text-3xl">{snapshot.values.length}</strong>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Formati</p>
          <strong className="mt-2 block text-3xl">JSON · CSV</strong>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Dataset pubblico</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Gli endpoint restituiscono soltanto indicatori pubblicati e valori finali resi pubblici dall&apos;Osservatorio.
          Non espongono aree riservate, dati personali o contenuti redazionali non pubblicati.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="border border-black p-5">
            <h3 className="font-semibold text-black">JSON</h3>
            <code className="mt-3 block overflow-x-auto bg-neutral-50 p-3 text-sm">/api/open-data/indicators</code>
            <a href="/api/open-data/indicators" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Apri JSON →</a>
          </div>
          <div className="border border-black p-5">
            <h3 className="font-semibold text-black">CSV</h3>
            <code className="mt-3 block overflow-x-auto bg-neutral-50 p-3 text-sm">/api/open-data/indicators.csv</code>
            <a href="/api/open-data/indicators.csv" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Scarica CSV →</a>
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Filtri degli endpoint</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          JSON e CSV accettano gli stessi parametri. I filtri possono essere combinati e coincidono con quelli del Data Explorer.
        </p>
        <div className="mt-5 overflow-x-auto border border-black">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="border-b border-black px-4 py-3">Parametro</th>
                <th className="border-b border-black px-4 py-3">Significato</th>
                <th className="border-b border-black px-4 py-3">Esempio</th>
              </tr>
            </thead>
            <tbody>
              {FILTERS.map(([name, meaning, example]) => (
                <tr key={name} className="border-b border-neutral-300 last:border-b-0">
                  <td className="px-4 py-3"><code>{name}</code></td>
                  <td className="px-4 py-3">{meaning}</td>
                  <td className="px-4 py-3"><code>{example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <code className="mt-5 block overflow-x-auto bg-neutral-50 p-4 text-sm">
          /api/open-data/indicators.csv?indicatore=imprese-straniere-registrate&amp;territorio=IT-25&amp;anno=2025
        </code>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Uso corretto e condizioni di riuso</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Un valore non va separato dalla definizione dell&apos;indicatore. In particolare cittadinanza, luogo di nascita,
          impresa straniera e lavoro autonomo non sono categorie equivalenti. Prima di riutilizzare o confrontare i dati,
          consulta la metodologia e la fonte originale. Le condizioni di riuso e le licenze possono dipendere dalla fonte primaria:
          la presenza nell&apos;endpoint del Centro Studi non sostituisce i termini della fonte originaria.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">Fonti e metodologia →</Link>
          <Link href="/esplora/dati" className="underline underline-offset-4">Data Explorer →</Link>
          <Link href="/fonti" className="underline underline-offset-4">Catalogo delle fonti →</Link>
        </div>
      </section>
    </main>
  );
}
