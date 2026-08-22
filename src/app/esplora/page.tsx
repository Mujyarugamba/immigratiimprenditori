import type { Metadata } from "next";
import Link from "next/link";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Esplora il Centro Studi",
  description:
    "Esplora dati, mappe, territori, settori, autori, analisi, pubblicazioni, storie, eventi e fonti di Immigrati Imprenditori.",
  alternates: { canonical: "/esplora" },
};

const modules = [
  {
    title: "Data Explorer",
    text: "Interroga i valori pubblicati dall'Osservatorio per indicatore, territorio, periodo, settore e categoria.",
    href: "/esplora/dati",
  },
  {
    title: "Mappa quantitativa",
    text: "Visualizza geograficamente un singolo indicatore con simboli proporzionali e senza mescolare definizioni diverse.",
    href: "/esplora/mappa",
  },
  {
    title: "Territori",
    text: "Naviga i territori già presenti nelle serie dell'Osservatorio.",
    href: "/esplora/territori",
  },
  {
    title: "Settori",
    text: "Consulta la tassonomia dei settori economici utilizzata dal Centro Studi.",
    href: "/esplora/settori",
  },
  {
    title: "Autori e contributori",
    text: "Scopri le firme presenti nei contenuti pubblicati.",
    href: "/esplora/autori",
  },
  {
    title: "Analisi e ricerche",
    text: "Ricerche, analisi, interviste e approfondimenti verificati dalla redazione.",
    href: "/contenuti",
  },
  {
    title: "Pubblicazioni",
    text: "Consulta rapporti e studi pubblicati con metadati bibliografici, fonte e strumenti di citazione.",
    href: "/pubblicazioni",
  },
  {
    title: "Eventi",
    text: "Incontri, convegni e iniziative pertinenti all'imprenditoria migrante.",
    href: "/eventi",
  },
  {
    title: "Fonti e metodologia",
    text: "Definizioni, criteri di comparabilità, fonti e metodo di lavoro.",
    href: "/dati-e-fonti",
  },
  {
    title: "Open data",
    text: "Accesso ai dati pubblicati in formato leggibile da persone e sistemi.",
    href: "/open-data",
  },
] as const;

export default async function EsploraPage() {
  const snapshot = await getExplorerSnapshot();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Immigrati Imprenditori · Centro Studi
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Esplora
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Un unico punto di accesso a dati, mappe, analisi, pubblicazioni, territori, settori, persone, eventi e fonti.
          Ogni dato dell&apos;Osservatorio rimanda alla propria scheda metodologica e alla fonte.
        </p>
      </header>

      <section className="grid gap-px border border-black bg-black md:grid-cols-4">
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori pubblicati</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.indicators.length}</strong>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Valori consultabili</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.values.length}</strong>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Territori presenti</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.territories.length}</strong>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Settori classificati</p>
          <strong className="mt-2 block text-3xl text-black">{snapshot.sectors.length}</strong>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Strumenti e archivi</h2>
        <div className="mt-6 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <article key={module.href} className="flex min-h-56 flex-col bg-white p-6">
              <h3 className="text-xl font-semibold text-black">{module.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-neutral-700">{module.text}</p>
              <Link className="mt-6 text-sm font-semibold underline underline-offset-4" href={module.href}>
                Apri →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">Contribuisci alla conoscenza</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          Imprenditori, professionisti, ricercatori, docenti, università, associazioni e istituzioni
          possono proporre storie, contributi di ricerca, pubblicazioni, eventi, dati e fonti alla redazione.
        </p>
        <Link href="/contribuisci" className="mt-5 inline-block border border-black px-5 py-3 text-sm font-semibold">
          Partecipa al Centro Studi →
        </Link>
      </section>
    </main>
  );
}
