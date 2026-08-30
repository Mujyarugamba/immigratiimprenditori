import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTerritoryDetail } from "@/lib/data/public/territories";
import { formatExplorerValue } from "@/lib/data/public/explore";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

const LEVEL_LABELS: Record<string, string> = {
  region: "Regione",
  province_state: "Provincia / Stato",
  metropolitan_area: "Area metropolitana",
  municipality_city: "Città",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getTerritoryDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const canonical = `/territori/${detail.territory.slug}`;
  const title = `${detail.territory.name} | Territori`;
  const description = `Dati, analisi, storie ed eventi disponibili per ${detail.territory.name} nel Centro Studi Immigrati Imprenditori.`;
  return {
    title,
    description,
    alternates: { canonical },
    ...pageSocialMetadata({ title, description, pathname: canonical }),
  };
}

export default async function TerritoryPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getTerritoryDetail(slug);
  if (!detail?.hasEvidence) notFound();

  const { territory } = detail;
  const levelLabel = LEVEL_LABELS[territory.level_kind] ?? "Territorio";
  const breadcrumbSchema = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Esplora", path: "/esplora" },
    { name: "Territori", path: "/esplora/territori" },
    { name: territory.name, path: `/territori/${territory.slug}` },
  ]);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-6">
        <Link href="/esplora/territori" className="text-sm font-semibold underline underline-offset-4">
          ← Torna ai territori
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          {levelLabel}{territory.code ? ` · ${territory.code}` : ""}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {territory.name}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Evidenze territoriali già pubblicate dal Centro Studi. La scheda riunisce dati e contenuti senza creare confronti automatici tra definizioni statistiche diverse.
        </p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori</p>
          <strong className="mt-2 block text-3xl">{detail.indicatorCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Valori dati</p>
          <strong className="mt-2 block text-3xl">{detail.dataValueCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Analisi / storie</p>
          <strong className="mt-2 block text-3xl">{detail.contentCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Eventi</p>
          <strong className="mt-2 block text-3xl">{detail.eventCount}</strong>
        </div>
      </section>

      {detail.indicators.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Osservatorio</p>
            <h2 className="mt-2 text-2xl font-semibold">Indicatori territoriali</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.indicators.map(({ indicator, values }) => {
              const latest = values[0];
              return (
                <article key={indicator.id} className="bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {new Date(latest.period_start).getFullYear()}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    <Link href={`/osservatorio/${indicator.slug}`}>{indicator.title}</Link>
                  </h3>
                  <p className="mt-4 text-3xl font-semibold">
                    {formatExplorerValue(latest.numeric_value, indicator.unit_code, "it")}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600">Qualità {latest.quality_code}</p>
                  <Link href={`/osservatorio/${indicator.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
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
            <h2 className="mt-2 text-2xl font-semibold">Analisi e storie</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.contents.map((item) => (
              <article key={item.id} className="bg-white p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{item.type_code.replaceAll("_", " ")}</p>
                <h3 className="mt-2 text-xl font-semibold"><Link href={`/contenuti/${item.slug}`}>{item.title}</Link></h3>
                {item.abstract ? <p className="mt-3 text-sm leading-6 text-neutral-700">{item.abstract}</p> : null}
                <Link href={`/contenuti/${item.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Leggi →</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {detail.events.length > 0 ? (
        <section className="mt-12">
          <div className="border-b border-black pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Agenda</p>
            <h2 className="mt-2 text-2xl font-semibold">Eventi collegati</h2>
          </div>
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
            {detail.events.map((event) => (
              <article key={event.id} className="bg-white p-6">
                <h3 className="text-xl font-semibold"><Link href={`/eventi/${event.id}`}>{event.title}</Link></h3>
                {event.summary ? <p className="mt-3 text-sm leading-6 text-neutral-700">{event.summary}</p> : null}
                <Link href={`/eventi/${event.id}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Apri l&apos;evento →</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {detail.children.length > 0 ? (
        <section className="mt-12 border-t border-black pt-8">
          <h2 className="text-xl font-semibold">Territori collegati</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700">
            I territori sottostanti fanno parte della gerarchia geografica del Centro Studi. Vengono collegati pubblicamente soltanto quando possiedono evidenze proprie.
          </p>
        </section>
      ) : null}
    </main>
  );
}
