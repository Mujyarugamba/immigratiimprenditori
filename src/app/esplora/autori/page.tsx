import type { Metadata } from "next";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Autori e contributori | Esplora",
  description: "Autori e contributori presenti nei contenuti pubblicati da Immigrati Imprenditori.",
  alternates: { canonical: "/esplora/autori" },
};

export default async function AutoriPage() {
  const snapshot = await getExplorerSnapshot();

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Esplora · Persone</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Autori e contributori</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Le firme qui mostrate provengono esclusivamente da contenuti già pubblicati e pubblicamente visibili.
          Il numero indica quanti contributi pubblicati risultano attribuiti a ciascun nome.
        </p>
      </header>

      <div className="mt-8 divide-y divide-black border-y border-black">
        {snapshot.authors.map((author) => (
          <article key={author.label} className="flex items-baseline justify-between gap-6 py-5">
            <h2 className="text-lg font-semibold text-black">{author.label}</h2>
            <span className="text-sm text-neutral-600">{author.contributionCount} contributi</span>
          </article>
        ))}
        {snapshot.authors.length === 0 ? (
          <p className="py-8 text-neutral-600">Nessuna firma pubblica disponibile.</p>
        ) : null}
      </div>
    </main>
  );
}
