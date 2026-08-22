import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectorDetail } from "@/lib/data/public/sectors";
import { formatExplorerValue } from "@/lib/data/public/explore";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getSectorDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }
  return {
    title: `${detail.sector.name} | Settori`,
    description: `Indicatori e dati pubblicati dal Centro Studi per il settore ${detail.sector.name}.`,
    alternates: { canonical: `/settori/${detail.sector.slug}` },
  };
}

export default async function SectorPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getSectorDetail(slug);
  if (!detail?.hasEvidence) notFound();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-6">
        <Link href="/esplora/settori" className="text-sm font-semibold underline underline-offset-4">
          ← Torna ai settori
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Esplora · Settore</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{detail.sector.name}</h1>
        {detail.sector.description ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{detail.sector.description}</p>
        ) : null}
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2">
        <div className="bg-white p-6"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Indicatori</p><strong className="mt-2 block text-3xl">{detail.indicatorCount}</strong></div>
        <div className="bg-white p-6"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Valori pubblicati</p><strong className="mt-2 block text-3xl">{detail.dataValueCount}</strong></div>
      </section>

      <section className="mt-12">
        <div className="border-b border-black pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Osservatorio</p>
          <h2 className="mt-2 text-2xl font-semibold">Dati disponibili</h2>
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
                      <p className="mt-1 text-sm text-neutral-600">{value.territory_label ?? ""}</p>
                    </div>
                  ))}
                </div>
                <Link href={`/osservatorio/${indicator.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Definizione e metodologia →</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12 border-t border-black pt-8">
        <h2 className="text-xl font-semibold">Criterio di classificazione</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700">
          I dati vengono associati a questo settore soltanto quando la corrispondenza con la classificazione della fonte è sufficientemente precisa. Il Centro Studi non forza equivalenze tra categorie economiche diverse.
        </p>
      </section>
    </main>
  );
}
