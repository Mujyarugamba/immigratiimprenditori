import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatExplorerValue } from "@/lib/data/public/explore";
import { getSectorDetail } from "@/lib/data/public/sectors";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

const SITE_URL = "https://www.immigratiimprenditori.it";

type PageProps = {
  params: Promise<{ sector: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sector: slug } = await params;
  const detail = await getSectorDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }
  const canonical = `/settori/${detail.sector.slug}`;
  const description = `Indicatori e dati verificati disponibili per il settore ${detail.sector.name} nel Centro Studi Immigrati Imprenditori.`;
  return {
    title: `${detail.sector.name} | Settori`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${canonical}`,
      title: `${detail.sector.name} | Immigrati Imprenditori`,
      description,
    },
  };
}

export default async function SectorDetailPage({ params }: PageProps) {
  const { sector: slug } = await params;
  const detail = await getSectorDetail(slug);
  if (!detail?.hasEvidence) notFound();
  const breadcrumbSchema = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Esplora", path: "/esplora" },
    { name: "Settori", path: "/esplora/settori" },
    { name: detail.sector.name, path: `/settori/${detail.sector.slug}` },
  ]);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-6">
        <Link href="/esplora/settori" className="text-sm font-semibold underline underline-offset-4">
          ← Tutti i settori
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Osservatorio · Settore economico
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {detail.sector.name}
        </h1>
        {detail.sector.description ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{detail.sector.description}</p>
        ) : null}
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2">
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori</p>
          <strong className="mt-2 block text-3xl text-black">{detail.indicatorCount}</strong>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Valori pubblicati</p>
          <strong className="mt-2 block text-3xl text-black">{detail.dataValueCount}</strong>
        </div>
      </section>

      <section className="mt-12">
        <div className="border-b border-black pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Osservatorio</p>
          <h2 className="mt-2 text-2xl font-semibold text-black">Dati disponibili</h2>
        </div>
        <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2">
          {detail.indicators.map(({ indicator, values }) => (
            <article key={indicator.id} className="bg-white p-6">
              <h3 className="text-xl font-semibold text-black">
                <Link href={`/osservatorio/${indicator.slug}`}>{indicator.title}</Link>
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{indicator.description}</p>
              <div className="mt-5 space-y-4">
                {values.slice(0, 8).map((value) => (
                  <div key={value.id} className="border-t border-neutral-200 pt-3 first:border-t-0 first:pt-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="text-sm text-neutral-600">
                        {value.territory_label ?? "—"} · {new Date(value.period_start).getFullYear()}
                      </span>
                      <strong className="text-xl text-black">
                        {formatExplorerValue(value.numeric_value, indicator.unit_code, "it")}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={`/esplora/dati?indicatore=${encodeURIComponent(indicator.slug)}&settore=${detail.sector.id}`}
                className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
              >
                Esplora questi dati →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">Criterio di classificazione</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
          La presenza di un valore in questa scheda richiede un collegamento esplicito al settore canonico del Centro Studi.
          Non vengono attribuiti dati a un settore quando la classificazione della fonte non è sufficientemente equivalente.
        </p>
        <Link href="/dati-e-fonti" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
          Fonti e metodologia →
        </Link>
      </section>
    </main>
  );
}
