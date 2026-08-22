import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAtlasCountryBySlug } from "@/lib/atlas/scope";
import { getAtlasCountryDetail } from "@/lib/data/public/atlas";
import { formatExplorerValue } from "@/lib/data/public/explore";

const SITE_URL = "https://immigratiimprenditori.it";

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getAtlasCountryBySlug(slug);
  if (!country) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const detail = await getAtlasCountryDetail(country).catch(() => null);
  if (!detail?.hasEvidence) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const canonical = `/atlante/${country.slug}`;
  const description = `Dati, indicatori, analisi, storie ed eventi disponibili per ${country.name} nell'Atlante dell'imprenditoria migrante.`;

  return {
    title: `${country.name} | Atlante`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${canonical}`,
      title: `${country.name} | Atlante dell'imprenditoria migrante`,
      description,
    },
  };
}

export default async function AtlasCountryPage({ params }: PageProps) {
  const { country: slug } = await params;
  const country = getAtlasCountryBySlug(slug);
  if (!country) notFound();

  const detail = await getAtlasCountryDetail(country);
  if (!detail.hasEvidence) notFound();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-6">
        <Link href="/atlante" className="text-sm font-semibold underline underline-offset-4">
          ← Torna all&apos;Atlante
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Atlante · {country.code} · {country.iso3}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {country.name}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Scheda Paese costruita a partire dalle evidenze già pubblicate dal Centro Studi.
          I dati mantengono la propria definizione metodologica e rimandano agli indicatori originali.
        </p>
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
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Osservatorio</p>
              <h2 className="mt-2 text-2xl font-semibold text-black">Dati disponibili</h2>
            </div>
            <Link
              href={`/esplora/dati?territorio=${encodeURIComponent(country.iso3)}`}
              className="text-sm font-semibold underline underline-offset-4"
            >
              Esplora tutti i valori →
            </Link>
          </div>

          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.indicators.map(({ indicator, values }) => {
              const latest = values[0];
              return (
                <article key={indicator.id} className="bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {new Date(latest.period_start).getFullYear()}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-black">
                    <Link href={`/osservatorio/${indicator.slug}`}>{indicator.title}</Link>
                  </h3>
                  <p className="mt-4 text-3xl font-semibold text-black">
                    {formatExplorerValue(latest.numeric_value, indicator.unit_code, "it")}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">
                    {latest.territory_label ?? country.name} · qualità {latest.quality_code}
                  </p>
                  <Link
                    href={`/osservatorio/${indicator.slug}`}
                    className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
                  >
                    Definizione e metodologia →
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
            <h2 className="mt-2 text-2xl font-semibold text-black">Analisi e storie</h2>
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
                {item.abstract ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-700">{item.abstract}</p>
                ) : null}
                <Link
                  href={`/contenuti/${item.slug}`}
                  className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Leggi →
                </Link>
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
                {event.summary ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-700">{event.summary}</p>
                ) : null}
                <Link
                  href={`/eventi/${event.id}`}
                  className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Apri l&apos;evento →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">Come leggere questa scheda</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
          La presenza di un dato in questa pagina non implica che indicatori costruiti con definizioni diverse siano confrontabili.
          Cittadinanza, luogo di nascita, impresa straniera e lavoro autonomo restano categorie distinte.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">Fonti e metodologia →</Link>
          <Link href="/glossario" className="underline underline-offset-4">Glossario →</Link>
        </div>
      </section>
    </main>
  );
}
