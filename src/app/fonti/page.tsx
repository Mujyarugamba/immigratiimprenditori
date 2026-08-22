import type { Metadata } from "next";
import Link from "next/link";
import { listPublicStatisticalSources } from "@/lib/data/public/sources";

export const metadata: Metadata = {
  title: "Catalogo delle fonti | Immigrati Imprenditori",
  description: "Fonti statistiche utilizzate dall'Osservatorio di Immigrati Imprenditori, con produttore, pubblicazione e note metodologiche.",
  alternates: { canonical: "/fonti" },
};

export default async function FontiPage() {
  const sources = await listPublicStatisticalSources();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Osservatorio · Provenienza</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Catalogo delle fonti</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Le fonti statistiche dell&apos;Osservatorio sono registrate separatamente dai valori che alimentano.
          Questo consente di documentare produttore, pubblicazione, edizione, licenza e metodologia quando disponibili.
        </p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2">
        {sources.map((source) => (
          <article key={source.id} className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{source.producer_name}</p>
            <h2 className="mt-2 text-xl font-semibold text-black">{source.publication_title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{source.name}</p>
            {source.edition_label ? <p className="mt-3 text-sm text-neutral-700">Edizione: {source.edition_label}</p> : null}
            {source.source_published_on ? <p className="mt-1 text-sm text-neutral-700">Pubblicata: {source.source_published_on}</p> : null}
            {source.methodology_note ? <p className="mt-4 text-sm leading-6 text-neutral-700">{source.methodology_note}</p> : null}
            {source.license_note ? <p className="mt-3 text-xs leading-5 text-neutral-500">Licenza/uso: {source.license_note}</p> : null}
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
                Apri la fonte originale ↗
              </a>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
        <Link href="/dati-e-fonti" className="underline underline-offset-4">Metodo e comparabilità →</Link>
        <Link href="/glossario" className="underline underline-offset-4">Glossario →</Link>
      </div>
    </main>
  );
}
