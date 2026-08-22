import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRouteDetail } from "@/lib/data/public/routes";
import { formatExplorerValue } from "@/lib/data/public/explore";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getRouteDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const title = `${detail.route.origin.name} → ${detail.route.destination.name} | Rotte`;
  const description = `Dati, analisi, storie ed eventi documentati sulla rotta imprenditoriale ${detail.route.origin.name} → ${detail.route.destination.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/rotte/${detail.route.slug}` },
  };
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getRouteDetail(slug);
  if (!detail?.hasEvidence) notFound();

  const { route } = detail;

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/rotte" className="underline underline-offset-4">← Rotte</Link>
        <Link href={`/atlante/${route.origin.slug}`} className="underline underline-offset-4">{route.origin.name}</Link>
        <Link href={`/atlante/${route.destination.slug}`} className="underline underline-offset-4">{route.destination.name}</Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Rotta · {route.origin.code} → {route.destination.code}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {route.origin.name} → {route.destination.name}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Una rotta descrive una relazione origine-destinazione supportata da evidenze esplicite.
          Le definizioni statistiche restano visibili e non vengono trasformate automaticamente in equivalenze tra cittadinanza, luogo di nascita e proprietà d&apos;impresa.
        </p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori</p><strong className="mt-2 block text-3xl">{detail.indicatorCount}</strong></div>
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Valori dati</p><strong className="mt-2 block text-3xl">{detail.dataValueCount}</strong></div>
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Analisi / storie</p><strong className="mt-2 block text-3xl">{detail.contentCount}</strong></div>
        <div className="bg-white p-5"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Eventi</p><strong className="mt-2 block text-3xl">{detail.eventCount}</strong></div>
      </section>

      {detail.indicators.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Osservatorio</p>
            <h2 className="mt-2 text-2xl font-semibold">Evidenze quantitative</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.indicators.map(({ indicator, values }) => {
              const latestPeriod = values[0]?.period_start;
              const latestValues = values.filter((value) => value.period_start === latestPeriod);
              return (
                <article key={indicator.id} className="bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {latestPeriod ? new Date(latestPeriod).getFullYear() : ""}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold"><Link href={`/osservatorio/${indicator.slug}`}>{indicator.title}</Link></h3>
                  <div className="mt-4 space-y-4">
                    {latestValues.map((value) => (
                      <div key={value.id}>
                        <p className="text-3xl font-semibold">{formatExplorerValue(value.numeric_value, indicator.unit_code, "it")}</p>
                        <p className="mt-1 text-sm text-neutral-600">{value.country_label ?? route.origin.name} → {value.territory_label ?? route.destination.name}</p>
                      </div>
                    ))}
                  </div>
                  <Link href={`/osservatorio/${indicator.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Definizione e metodologia →</Link>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {detail.contents.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Ricerca · Persone</p><h2 className="mt-2 text-2xl font-semibold">Analisi e storie</h2></div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.contents.map((item) => (
              <article key={item.id} className="bg-white p-6"><h3 className="text-xl font-semibold"><Link href={`/contenuti/${item.slug}`}>{item.title}</Link></h3>{item.abstract ? <p className="mt-3 text-sm leading-6 text-neutral-700">{item.abstract}</p> : null}<Link href={`/contenuti/${item.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Leggi →</Link></article>
            ))}
          </div>
        </section>
      ) : null}

      {detail.events.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Agenda</p><h2 className="mt-2 text-2xl font-semibold">Eventi collegati</h2></div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.events.map((event) => (
              <article key={event.id} className="bg-white p-6"><h3 className="text-xl font-semibold"><Link href={`/eventi/${event.id}`}>{event.title}</Link></h3>{event.summary ? <p className="mt-3 text-sm leading-6 text-neutral-700">{event.summary}</p> : null}<Link href={`/eventi/${event.id}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Apri l&apos;evento →</Link></article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 border-t border-black pt-8">
        <h2 className="text-xl font-semibold">Criterio della rotta</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
          Questa pagina esiste perché la relazione origine-destinazione è documentata. La presenza contemporanea di due Paesi nel database non è sufficiente a creare una rotta.
        </p>
      </section>
    </main>
  );
}
