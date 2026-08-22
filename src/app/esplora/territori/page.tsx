import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedTerritorySummaries } from "@/lib/data/public/territories";

export const metadata: Metadata = {
  title: "Territori | Esplora",
  description:
    "Territori con dati, analisi, storie o eventi già pubblicati dal Centro Studi Immigrati Imprenditori.",
  alternates: { canonical: "/esplora/territori" },
};

const LEVEL_LABELS: Record<string, string> = {
  region: "Regione",
  province_state: "Provincia / Stato",
  metropolitan_area: "Area metropolitana",
  municipality_city: "Città",
};

export default async function TerritoriPage() {
  const territories = await listPublishedTerritorySummaries();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Esplora · Territori</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Territori</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Sono pubblicati soltanto i territori per i quali esistono evidenze reali nel Centro Studi:
          dati dell&apos;Osservatorio, analisi, storie o eventi. Le anagrafiche geografiche prive di contenuti non generano pagine vuote.
        </p>
      </header>

      {territories.length > 0 ? (
        <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
          {territories.map((item) => (
            <article key={item.territory.id} className="bg-white p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                {LEVEL_LABELS[item.territory.level_kind] ?? item.territory.level_kind}
                {item.territory.code ? ` · ${item.territory.code}` : ""}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-black">
                <Link href={`/territori/${item.territory.slug}`}>{item.territory.name}</Link>
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-neutral-500">Indicatori</dt>
                  <dd className="font-semibold text-black">{item.indicatorCount}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Valori</dt>
                  <dd className="font-semibold text-black">{item.dataValueCount}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Analisi / storie</dt>
                  <dd className="font-semibold text-black">{item.contentCount}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Eventi</dt>
                  <dd className="font-semibold text-black">{item.eventCount}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href={`/territori/${item.territory.slug}`} className="underline underline-offset-4">
                  Apri la scheda →
                </Link>
                {item.territory.code ? (
                  <Link
                    href={`/esplora/dati?territorio=${encodeURIComponent(item.territory.code)}`}
                    className="underline underline-offset-4"
                  >
                    Dati →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-8 max-w-3xl text-base leading-7 text-neutral-700">
          Nessun territorio soddisfa ancora il criterio di pubblicazione.
        </p>
      )}
    </main>
  );
}
