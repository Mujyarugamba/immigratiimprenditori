import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Territori | Esplora",
  description: "Territori presenti nelle serie statistiche pubblicate dall'Osservatorio di Immigrati Imprenditori.",
  alternates: { canonical: "/esplora/territori" },
};

export default async function TerritoriPage() {
  const snapshot = await getExplorerSnapshot();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Esplora · Territori</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Territori</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          I territori qui elencati sono quelli effettivamente presenti nei valori pubblicati dell&apos;Osservatorio.
          Il numero indica quanti valori statistici pubblicati fanno riferimento a ciascun territorio.
        </p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.territories.map((territory) => (
          <article key={`${territory.level}-${territory.code}-${territory.label}`} className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{territory.level ?? "territorio"}</p>
            <h2 className="mt-2 text-xl font-semibold text-black">{territory.label}</h2>
            <p className="mt-3 text-sm text-neutral-700">{territory.valueCount} valori pubblicati</p>
            {territory.code ? (
              <Link href={`/esplora/dati?territorio=${encodeURIComponent(territory.code)}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
                Esplora i dati →
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
