import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Open data | Immigrati Imprenditori",
  description: "Accesso ai dati pubblicati dall'Osservatorio di Immigrati Imprenditori in formato consultabile e JSON.",
  alternates: { canonical: "/open-data" },
};

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
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Formato API</p>
          <strong className="mt-2 block text-3xl">JSON</strong>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Endpoint pubblico</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          L&apos;endpoint restituisce soltanto indicatori pubblicati e valori finali resi pubblici dall&apos;Osservatorio.
          Non espone aree riservate, dati personali o contenuti redazionali non pubblicati.
        </p>
        <code className="mt-5 block overflow-x-auto border border-black bg-neutral-50 p-4 text-sm">/api/open-data/indicators</code>
        <a href="/api/open-data/indicators" className="mt-5 inline-block border border-black px-5 py-3 text-sm font-semibold">
          Apri il dataset JSON →
        </a>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Uso corretto</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Un valore non va separato dalla definizione dell&apos;indicatore. In particolare cittadinanza, luogo di nascita,
          impresa straniera e lavoro autonomo non sono categorie equivalenti. Prima di riutilizzare o confrontare i dati,
          consulta la metodologia e la fonte originale.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">Fonti e metodologia →</Link>
          <Link href="/esplora/dati" className="underline underline-offset-4">Data Explorer →</Link>
        </div>
      </section>
    </main>
  );
}
