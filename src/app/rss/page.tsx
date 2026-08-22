import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed RSS",
  description: "Feed RSS del Centro Studi Immigrati Imprenditori per seguire aggiornamenti, ricerca, pubblicazioni, storie ed eventi.",
  alternates: { canonical: "/rss" },
};

const feeds = [
  {
    title: "Tutti gli aggiornamenti",
    description: "Il flusso generale dei nuovi contenuti pubblici.",
    href: "/feed.xml",
  },
  {
    title: "Ricerca",
    description: "Analisi, ricerche, rapporti e note dati.",
    href: "/feed/ricerca.xml",
  },
  {
    title: "Pubblicazioni",
    description: "Rapporti e studi presenti nella biblioteca pubblica.",
    href: "/feed/pubblicazioni.xml",
  },
  {
    title: "Storie e voci",
    description: "Interviste, testimonianze e storie pubblicate.",
    href: "/feed/storie.xml",
  },
  {
    title: "Eventi",
    description: "Eventi e appuntamenti pubblici del Centro Studi.",
    href: "/feed/eventi.xml",
  },
] as const;

export default function RssPage() {
  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Distribuzione · RSS
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Feed RSS</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          I feed consentono di seguire gli aggiornamenti senza account e senza dipendere dagli algoritmi dei social network.
        </p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2">
        {feeds.map((feed) => (
          <article key={feed.href} className="bg-white p-6">
            <h2 className="text-xl font-semibold text-black">{feed.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-700">{feed.description}</p>
            <a href={feed.href} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
              Apri il feed →
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
