import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Settori economici | Esplora",
  description: "Tassonomia dei settori economici utilizzata da Immigrati Imprenditori per organizzare dati e contenuti.",
  alternates: { canonical: "/esplora/settori" },
};

export default async function SettoriPage() {
  const snapshot = await getExplorerSnapshot();
  const counts = new Map<number, number>();
  for (const value of snapshot.values) {
    if (value.business_sector_id == null) continue;
    counts.set(value.business_sector_id, (counts.get(value.business_sector_id) ?? 0) + 1);
  }

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Esplora · Tassonomia</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Settori economici</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questa tassonomia consente di collegare nel tempo indicatori, ricerche, storie ed eventi agli stessi ambiti economici.
          Un settore compare qui perché è attivo nel modello del Centro Studi; una scheda dati è disponibile soltanto quando esistono valori pubblicati con una corrispondenza metodologicamente valida.
        </p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.sectors.map((sector) => {
          const valueCount = counts.get(sector.id) ?? 0;
          return (
            <article key={sector.id} className="bg-white p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Settore</p>
              <h2 className="mt-2 text-xl font-semibold text-black">
                {valueCount > 0 ? <Link href={`/settori/${sector.slug}`}>{sector.name}</Link> : sector.name}
              </h2>
              {sector.description ? <p className="mt-3 text-sm leading-6 text-neutral-700">{sector.description}</p> : null}
              <p className="mt-4 text-xs text-neutral-500">Valori Osservatorio collegati: {valueCount}</p>
              {valueCount > 0 ? (
                <Link href={`/settori/${sector.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
                  Apri la scheda settore →
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}
