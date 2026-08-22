import type { Metadata } from "next";
import Link from "next/link";
import { searchPublicSite, type SearchResult } from "@/lib/data/public/search";

export const metadata: Metadata = {
  title: "Cerca | Immigrati Imprenditori",
  description: "Cerca tra analisi, ricerche, indicatori ed eventi pubblicati da Immigrati Imprenditori.",
  robots: { index: false, follow: true },
};

type SearchKind = "all" | SearchResult["kind"];

type Props = {
  searchParams: Promise<{ q?: string; tipo?: string; anno?: string }>;
};

const labels = {
  content: "Contenuto",
  indicator: "Indicatore",
  event: "Evento",
} as const;

function normalizeKind(value: string | undefined): SearchKind {
  if (value === "content" || value === "indicator" || value === "event") return value;
  return "all";
}

function normalizeYear(value: string | undefined) {
  return /^\d{4}$/.test(value ?? "") ? value! : "all";
}

export default async function CercaPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const kind = normalizeKind(params.tipo);
  const year = normalizeYear(params.anno);
  const allResults = q.length >= 2 ? await searchPublicSite(q) : [];
  const years = Array.from(
    new Set(
      allResults
        .map((result) => result.publishedAt ? String(new Date(result.publishedAt).getFullYear()) : null)
        .filter((value): value is string => Boolean(value) && value !== "NaN"),
    ),
  ).sort((a, b) => Number(b) - Number(a));
  const results = allResults.filter((result) => {
    if (kind !== "all" && result.kind !== kind) return false;
    if (year !== "all") {
      if (!result.publishedAt) return false;
      if (String(new Date(result.publishedAt).getFullYear()) !== year) return false;
    }
    return true;
  });

  const counts = allResults.reduce(
    (acc, result) => {
      acc[result.kind] += 1;
      return acc;
    },
    { content: 0, indicator: 0, event: 0 },
  );

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Centro Studi</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Cerca</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Cerca contemporaneamente tra contenuti editoriali, indicatori dell&apos;Osservatorio ed eventi pubblicati.
          I risultati sono ordinati per pertinenza e poi per data, con filtri per tipo e anno.
        </p>
      </header>

      <form method="get" className="mt-8 grid max-w-5xl gap-3 md:grid-cols-[minmax(0,1fr)_11rem_8rem_auto]">
        <label className="sr-only" htmlFor="site-search">Cerca nel Centro Studi</label>
        <input
          id="site-search"
          name="q"
          type="search"
          minLength={2}
          maxLength={160}
          defaultValue={q}
          placeholder="Es. Lombardia, lavoro autonomo, credito…"
          className="min-w-0 border border-black px-4 py-3"
        />
        <label className="sr-only" htmlFor="search-kind">Tipo di risultato</label>
        <select id="search-kind" name="tipo" defaultValue={kind} className="border border-black bg-white px-3 py-3">
          <option value="all">Tutto</option>
          <option value="indicator">Indicatori</option>
          <option value="content">Contenuti</option>
          <option value="event">Eventi</option>
        </select>
        <label className="sr-only" htmlFor="search-year">Anno</label>
        <select id="search-year" name="anno" defaultValue={year} className="border border-black bg-white px-3 py-3">
          <option value="all">Tutti gli anni</option>
          {years.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button type="submit" className="border border-black bg-black px-5 py-3 text-sm font-semibold text-white">Cerca</button>
      </form>

      {q.length > 0 && q.length < 2 ? <p className="mt-5 text-sm text-neutral-600">Inserisci almeno due caratteri.</p> : null}

      {q.length >= 2 ? (
        <section className="mt-10">
          <div className="border-b border-black pb-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-2xl font-semibold text-black">Risultati per “{q}”</h2>
              <span className="text-sm text-neutral-600">{results.length}</span>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Totale {allResults.length} · Indicatori {counts.indicator} · Contenuti {counts.content} · Eventi {counts.event}
            </p>
          </div>
          <div className="divide-y divide-neutral-300">
            {results.map((result) => (
              <article key={`${result.kind}-${result.href}`} className="py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{labels[result.kind]}</p>
                <h3 className="mt-2 text-xl font-semibold text-black">
                  <Link href={result.href} className="underline-offset-4 hover:underline">{result.title}</Link>
                </h3>
                {result.publishedAt ? (
                  <p className="mt-2 text-xs text-neutral-500">{new Date(result.publishedAt).getFullYear()}</p>
                ) : null}
                {result.excerpt ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{result.excerpt}</p> : null}
              </article>
            ))}
            {results.length === 0 ? <p className="py-8 text-neutral-600">Nessun risultato pubblicato corrisponde alla ricerca e ai filtri selezionati.</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
