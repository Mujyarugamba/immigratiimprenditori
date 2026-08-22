import type { Metadata } from "next";
import Link from "next/link";
import { searchPublicSite } from "@/lib/data/public/search";

export const metadata: Metadata = {
  title: "Cerca | Immigrati Imprenditori",
  description: "Cerca tra analisi, ricerche, indicatori ed eventi pubblicati da Immigrati Imprenditori.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

const labels = {
  content: "Contenuto",
  indicator: "Indicatore",
  event: "Evento",
} as const;

export default async function CercaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const results = q.length >= 2 ? await searchPublicSite(q) : [];

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Centro Studi</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Cerca</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Cerca contemporaneamente tra contenuti editoriali, indicatori dell&apos;Osservatorio ed eventi pubblicati.
        </p>
      </header>

      <form method="get" className="mt-8 flex max-w-3xl gap-3">
        <label className="sr-only" htmlFor="site-search">Cerca nel Centro Studi</label>
        <input
          id="site-search"
          name="q"
          type="search"
          minLength={2}
          maxLength={160}
          defaultValue={q}
          placeholder="Es. Lombardia, lavoro autonomo, credito…"
          className="min-w-0 flex-1 border border-black px-4 py-3"
        />
        <button type="submit" className="border border-black bg-black px-5 py-3 text-sm font-semibold text-white">Cerca</button>
      </form>

      {q.length > 0 && q.length < 2 ? <p className="mt-5 text-sm text-neutral-600">Inserisci almeno due caratteri.</p> : null}

      {q.length >= 2 ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-black pb-3">
            <h2 className="text-2xl font-semibold text-black">Risultati per “{q}”</h2>
            <span className="text-sm text-neutral-600">{results.length}</span>
          </div>
          <div className="divide-y divide-neutral-300">
            {results.map((result) => (
              <article key={`${result.kind}-${result.href}`} className="py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{labels[result.kind]}</p>
                <h3 className="mt-2 text-xl font-semibold text-black">
                  <Link href={result.href} className="underline-offset-4 hover:underline">{result.title}</Link>
                </h3>
                {result.excerpt ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{result.excerpt}</p> : null}
              </article>
            ))}
            {results.length === 0 ? <p className="py-8 text-neutral-600">Nessun risultato pubblicato corrisponde alla ricerca.</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
