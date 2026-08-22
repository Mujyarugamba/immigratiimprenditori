import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedRouteSummaries } from "@/lib/data/public/routes";

export const metadata: Metadata = {
  title: "Rotte imprenditoriali | Atlante",
  description:
    "Relazioni origine-destinazione documentate da dati, analisi, storie o eventi del Centro Studi Immigrati Imprenditori.",
  alternates: { canonical: "/rotte" },
};

export default async function RoutesPage() {
  const routes = await listPublishedRouteSummaries();
  if (routes.length === 0) notFound();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Atlante · Rotte
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Rotte imprenditoriali
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Le rotte collegano un Paese di origine a un Paese di destinazione soltanto quando il Centro Studi dispone di evidenze esplicite.
          Non vengono inferite automaticamente dalla sola presenza di una nazionalità o di un territorio.
        </p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((item) => (
          <article key={item.route.id} className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.route.origin.code} → {item.route.destination.code}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-black">
              <Link href={`/rotte/${item.route.slug}`}>
                {item.route.origin.name} → {item.route.destination.name}
              </Link>
            </h2>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-500">Indicatori</dt>
                <dd className="mt-1 text-lg font-semibold text-black">{item.indicatorCount}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Valori dati</dt>
                <dd className="mt-1 text-lg font-semibold text-black">{item.dataValueCount}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Analisi / storie</dt>
                <dd className="mt-1 text-lg font-semibold text-black">{item.contentCount}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Eventi</dt>
                <dd className="mt-1 text-lg font-semibold text-black">{item.eventCount}</dd>
              </div>
            </dl>
            <Link href={`/rotte/${item.route.slug}`} className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">
              Apri la rotta →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
