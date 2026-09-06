import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getPublicIndicatorBySlug } from "@/lib/data/public/observatory";
import { OBSERVATORY_PERIODICITY_LABELS, OBSERVATORY_UNIT_LABELS, formatItalianDate, label } from "@/lib/public/labels";
import { observatoryDatasetStructuredData } from "@/lib/seo/observatory-dataset";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const indicator = await getPublicIndicatorBySlug(slug);
  if (!indicator) return { title: "Non trovato", robots: { index: false, follow: false } };
  const canonical = `/osservatorio/${indicator.slug}`;
  return { title: indicator.title, description: indicator.description, alternates: { canonical }, openGraph: { type: "website", url: canonical, title: indicator.title, description: indicator.description }, twitter: { card: "summary", title: indicator.title, description: indicator.description } };
}

function formatIndicatorValue(value: number, unitCode: string) {
  const maximumFractionDigits = Number.isInteger(value) ? 0 : 2;
  const formatted = new Intl.NumberFormat("it-IT", { maximumFractionDigits }).format(value);
  if (unitCode === "percent") return `${formatted} %`;
  if (unitCode === "eur") return `${formatted} €`;
  if (unitCode === "eur_thousands") return `${formatted} mila €`;
  if (unitCode === "index_points") return `${formatted} punti`;
  return formatted;
}

export default async function IndicatoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const indicator = await getPublicIndicatorBySlug(slug);
  if (!indicator) notFound();

  const sources = [...new Set(indicator.values.map((value) => value.source_name).filter((name): name is string => Boolean(name)))];
  const datasetSchema = observatoryDatasetStructuredData(indicator);
  const breadcrumbSchema = breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Osservatorio", path: "/osservatorio" }, { name: indicator.title, path: `/osservatorio/${indicator.slug}` }]);

  return (
    <main className="ii-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="ii-detail-top">
        <nav className="ii-detail-nav"><Link href="/osservatorio">← Osservatorio</Link><Link href="/esplora/dati">Data Explorer</Link></nav>
        <header className="ii-detail-header">
          <div className="ii-detail-badges flex flex-wrap gap-2"><Badge tone="soft">{label(OBSERVATORY_UNIT_LABELS, indicator.unit_code)}</Badge><Badge tone="soft">{label(OBSERVATORY_PERIODICITY_LABELS, indicator.periodicity)}</Badge></div>
          <h1 className="ii-detail-title">{indicator.title}</h1>
          <p className="ii-detail-deck">{indicator.description}</p>
        </header>
      </section>

      <div className="ii-detail-content">
        <section className="ii-detail-section"><h2>Finalità</h2><p className="ii-detail-prose whitespace-pre-wrap">{indicator.purpose_text}</p></section>
        <section className="ii-detail-section"><h2>Metodologia</h2><p className="ii-detail-prose whitespace-pre-wrap">{indicator.methodology_summary}</p></section>
        {indicator.values.length > 0 ? <section className="ii-detail-section"><h2>Valori</h2><div className="table-scroll"><table className="ii-detail-table w-full min-w-[640px] text-left text-sm"><thead><tr><th className="px-3 py-3">Periodo</th><th className="px-3 py-3">Valore</th><th className="px-3 py-3">Territorio</th><th className="px-3 py-3">Cittadinanza</th><th className="px-3 py-3">Fonte</th></tr></thead><tbody>{indicator.values.map((value) => <tr key={value.id}><td className="px-3 py-3">{formatItalianDate(value.period_start)} – {formatItalianDate(value.period_end)}</td><td className="px-3 py-3 font-semibold">{formatIndicatorValue(value.numeric_value, indicator.unit_code)}</td><td className="px-3 py-3">{value.territory_label ?? "—"}</td><td className="px-3 py-3">{value.country_label ?? "—"}</td><td className="px-3 py-3">{value.source_name ?? "—"}</td></tr>)}</tbody></table></div></section> : null}
        {sources.length > 0 ? <section className="ii-detail-section"><h2>Fonti</h2><ul className="ii-detail-prose list-inside list-disc space-y-2">{sources.map((source) => <li key={source}>{source}</li>)}</ul></section> : null}
      </div>
    </main>
  );
}
