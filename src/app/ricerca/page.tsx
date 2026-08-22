import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedContentsByTypes, RESEARCH_CONTENT_TYPES } from "@/lib/data/public/collections";

export const metadata: Metadata = {
  title: "Ricerca | Immigrati Imprenditori",
  description: "Rapporti, ricerche, analisi, note dati e policy brief pubblicati dal Centro Studi.",
  alternates: { canonical: "/ricerca" },
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function RicercaPage() {
  const items = await listPublishedContentsByTypes(RESEARCH_CONTENT_TYPES);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Centro Studi · Ricerca</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Ricerca</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Rapporti, ricerche, analisi, note dati e policy brief organizzati in un archivio unico e verificabile.
        </p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flex min-h-72 flex-col bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{item.type_code.replaceAll("_", " ")}</p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-black">
              <Link href={`/contenuti/${item.slug}`} className="underline-offset-4 hover:underline">{item.title}</Link>
            </h2>
            {item.abstract ? <p className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</p> : <div className="flex-1" />}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-300 pt-4 text-xs text-neutral-600">
              <span>{formatDate(item.published_at)}</span>
              <Link href={`/contenuti/${item.slug}`} className="font-semibold text-black">Apri →</Link>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="bg-white p-8 text-neutral-600">Nessun contenuto disponibile in questa raccolta.</p> : null}
      </div>
    </main>
  );
}
