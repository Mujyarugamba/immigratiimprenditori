import type { Metadata } from "next";
import Link from "next/link";
import { listAtlasCountrySummaries } from "@/lib/data/public/atlas";

export const metadata: Metadata = {
  title: "Atlante dell'imprenditoria migrante",
  description:
    "Paesi e territori letti attraverso dati, ricerche, storie ed eventi verificati dal Centro Studi Immigrati Imprenditori.",
  alternates: { canonical: "/atlante" },
};

export default async function AtlantePage() {
  const summaries = await listAtlasCountrySummaries();
  const published = summaries.filter((item) => item.hasEvidence);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Osservatorio · Atlante
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Atlante dell&apos;imprenditoria migrante
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Una lettura per Paese che riunisce soltanto evidenze già disponibili:
          indicatori, analisi, storie ed eventi. Le schede vengono rese pubbliche
          quando esiste materiale sostanziale; non vengono create pagine vuote.
        </p>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Copertura disponibile
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-black">
              {published.length} {published.length === 1 ? "Paese" : "Paesi"} con evidenze pubblicate
            </h2>
          </div>
          <Link href="/esplora/dati" className="text-sm font-semibold underline underline-offset-4">
            Apri il Data Explorer →
          </Link>
        </div>

        {published.length > 0 ? (
          <div className="mt-6 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
            {published.map((item) => (
              <article key={item.country.code} className="bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {item.country.code} · {item.country.iso3}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-black">
                  <Link href={`/atlante/${item.country.slug}`}>
                    {item.country.name}
                  </Link>
                </h2>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-neutral-500">Indicatori</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.indicatorCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Valori dati</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.dataValueCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Analisi / storie</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.contentCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Eventi</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.eventCount}</dd>
                  </div>
                </dl>
                <Link
                  href={`/atlante/${item.country.slug}`}
                  className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Apri la scheda Paese →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 max-w-3xl text-base leading-7 text-neutral-700">
            Nessuna scheda Paese soddisfa ancora il criterio di pubblicazione dell&apos;Atlante.
          </p>
        )}
      </section>
    </main>
  );
}
