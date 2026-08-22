import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatExplorerValue } from "@/lib/data/public/explore";
import { getRouteDetail } from "@/lib/data/public/routes";

const SITE_URL = "https://immigratiimprenditori.it";

type PageProps = {
  params: Promise<{ route: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { route: slug } = await params;
  const detail = await getRouteDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const canonical = `/atlante/rotte/${detail.route.slug}`;
  const title = `${detail.route.origin.name} → ${detail.route.destination.name} | Atlante`;
  const description = `Dati e contenuti verificati sulla rotta imprenditoriale ${detail.route.origin.name} → ${detail.route.destination.name}.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${canonical}`,
      title,
      description,
    },
  };
}

export default async function AtlasRouteDetailPage({ params }: PageProps) {
  const { route: slug } = await params;
  const detail = await getRouteDetail(slug);
  if (!detail?.hasEvidence) notFound();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/atlante/rotte" className="underline underline-offset-4">
          ← Tutte le rotte
        </Link>
        <Link href="/atlante" className="underline underline-offset-4">
          Atlante
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Rotta · {detail.route.origin.code} → {detail.route.destination.code}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {detail.route.origin.name} → {detail.route.destination.name}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questa pagina riunisce soltanto evidenze attribuibili alla relazione tra Paese di origine e Paese di destinazione.
          Ogni indicatore conserva definizione, popolazione osservata, periodo e fonte originali.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href={`/atlante/${detail.route.origin.slug}`} className="underline underline-offset-4">
            Scheda {detail.route.origin.name} →
          </Link>
          <Link href={`/atlante/${detail.route.destination.slug}`} className="underline underline-offset-4">
            Scheda {detail.route.destination.name} →
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori</p>
          <strong className="mt-2 block text-3xl text-black">{detail.indicatorCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Valori dati</p>
          <strong className="mt-2 block text-3xl text-black">{detail.dataValueCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Analisi / storie</p>
          <strong className="mt-2 block text-3xl text-black">{detail.contentCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Eventi</p>
          <strong className="mt-2 block text-3xl text-black">{detail.eventCount}</strong>
        </div>
      </section>

      {detail.indicators.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Osservatorio</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Dati della rotta</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.indicators.map(({ indicator, values }) => {
              const latest = values[0];
              return (
                <article key={indicator.id} className="bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {new Date(latest.period_start).getFullYear()} · {latest.quality_code}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-black">
                    <Link href={`/osservatorio/${indicator.slug}`}>{indicator.title}</Link>
                  </h3>
                  <p className="mt-4 text-3xl font-semibold text-black">
                    {formatExplorerValue(latest.numeric_value, indicator.unit_code, "it")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {latest.country_label ?? detail.route.origin.name} → {latest.territory_label ?? detail.route.destination.name}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-neutral-700">{indicator.description}</p>
                  <Link
                    href={`/osservatorio/${indicator.slug}`}
                    className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
                  >
                    Fonte e metodologia →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {detail.contents.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Ricerca · Persone</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Analisi e storie collegate</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.contents.map((item) => (
              <article key={item.id} className="bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {item.type_code.replaceAll("_", " ")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-black">
                  <Link href={`/contenuti/${item.slug}`}>{item.title}</Link>
                </h3>
                {item.abstract ? <p className="mt-3 text-sm leading-6 text-neutral-700">{item.abstract}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {detail.events.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Agenda</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Eventi collegati</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.events.map((event) => (
              <article key={event.id} className="bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {event.type_code.replaceAll("_", " ")}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-black">
                  <Link href={`/eventi/${event.id}`}>{event.title}</Link>
                </h3>
                {event.summary ? <p className="mt-3 text-sm leading-6 text-neutral-700">{event.summary}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">Nota metodologica</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
          “Origine” non significa sempre cittadinanza. A seconda della fonte può indicare luogo di nascita,
          cittadinanza o altra classificazione dichiarata. La scheda dell&apos;indicatore specifica sempre quale definizione è stata utilizzata.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">Fonti e metodologia →</Link>
          <Link href="/glossario" className="underline underline-offset-4">Glossario →</Link>
        </div>
      </section>
    </main>
  );
}
