import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicIndicatorBySlug } from "@/lib/data/public/observatory";
import { getSiteUrl } from "@/lib/env";
import { DEFAULT_LANGUAGE_TAG, localizedPath } from "@/lib/i18n/config";
import {
  OBSERVATORY_PERIODICITY_LABELS,
  OBSERVATORY_UNIT_LABELS,
  formatItalianDate,
  label,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatNumericValue(
  rawValue: number,
  unitCode: string,
  methodology: string,
): string {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return String(rawValue);

  const isThousands = methodology.includes("THS_PER");
  const maximumFractionDigits = isThousands
    ? 1
    : unitCode === "percent"
      ? 2
      : Number.isInteger(value)
        ? 0
        : 2;

  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits,
  }).format(value);
}

function formatPeriod(start: string, end: string): string {
  if (start === end) return formatItalianDate(start);
  return `${formatItalianDate(start)} – ${formatItalianDate(end)}`;
}

function canonicalPath(slug: string): string {
  return localizedPath(`/osservatorio/${encodeURIComponent(slug)}`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const indicator = await getPublicIndicatorBySlug(slug);
  if (!indicator) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  if (indicator.publication_status !== "published") {
    return {
      title: indicator.title,
      description: indicator.description,
      robots: { index: false, follow: false },
    };
  }

  const canonical = canonicalPath(indicator.slug);
  return {
    title: indicator.title,
    description: indicator.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: indicator.title,
      description: indicator.description,
      locale: "it_IT",
    },
    twitter: {
      card: "summary",
      title: indicator.title,
      description: indicator.description,
    },
  };
}

export default async function IndicatoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const indicator = await getPublicIndicatorBySlug(slug);

  if (!indicator) {
    notFound();
  }

  const sources = Array.from(
    new Map(
      indicator.values
        .filter((value) => value.source_name)
        .map((value) => [
          value.source_url ?? value.source_name ?? value.id,
          {
            name: value.source_name as string,
            url: value.source_url,
            edition: value.source_edition_label,
            publishedOn: value.source_published_on,
          },
        ]),
    ).values(),
  );

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${canonicalPath(indicator.slug)}`;
  const territoryNames = Array.from(
    new Set(
      indicator.values
        .map((value) => value.territory_label ?? value.country_label)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const periods = indicator.values.flatMap((value) => [
    value.period_start,
    value.period_end,
  ]);
  const temporalCoverage = periods.length > 0
    ? `${periods.reduce((a, b) => (a < b ? a : b))}/${periods.reduce((a, b) => (a > b ? a : b))}`
    : undefined;
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${canonicalUrl}#dataset`,
    name: indicator.title,
    description: indicator.description,
    url: canonicalUrl,
    inLanguage: DEFAULT_LANGUAGE_TAG,
    creator: { "@id": `${siteUrl}/#organization` },
    publisher: { "@id": `${siteUrl}/#organization` },
    measurementTechnique: indicator.methodology_summary,
    temporalCoverage,
    spatialCoverage: territoryNames.length > 0
      ? territoryNames.map((name) => ({ "@type": "Place", name }))
      : undefined,
    variableMeasured: {
      "@type": "PropertyValue",
      name: indicator.title,
      unitText: label(OBSERVATORY_UNIT_LABELS, indicator.unit_code),
    },
    isBasedOn: sources
      .filter((source) => source.url)
      .map((source) => source.url as string),
  };

  return (
    <main id="contenuto">
      {indicator.publication_status === "published" ? (
        <JsonLd data={datasetJsonLd} />
      ) : null}
      <Section>
        <Container className="max-w-5xl space-y-8">
          <Link
            href="/osservatorio"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;osservatorio
          </Link>

          <header className="max-w-4xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="soft">
                {label(OBSERVATORY_UNIT_LABELS, indicator.unit_code)}
              </Badge>
              <Badge tone="soft">
                {label(OBSERVATORY_PERIODICITY_LABELS, indicator.periodicity)}
              </Badge>
            </div>
            <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
              {indicator.title}
            </h1>
            <p className="text-ink-muted text-lg leading-7">{indicator.description}</p>
          </header>

          <section className="max-w-4xl space-y-3">
            <h2 className="text-ink text-xl font-semibold">Finalità</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {indicator.purpose_text}
            </p>
          </section>

          <section className="max-w-4xl space-y-3">
            <h2 className="text-ink text-xl font-semibold">Metodologia</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {indicator.methodology_summary}
            </p>
          </section>

          {indicator.values.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-ink text-xl font-semibold">Valori</h2>
              <div className="overflow-x-auto">
                <table className="border-line w-full min-w-[760px] border text-left text-sm">
                  <thead className="bg-surface-muted">
                    <tr>
                      <th className="border-line border px-3 py-2 font-medium">Periodo</th>
                      <th className="border-line border px-3 py-2 font-medium">Valore</th>
                      <th className="border-line border px-3 py-2 font-medium">Territorio</th>
                      <th className="border-line border px-3 py-2 font-medium">Cittadinanza / gruppo</th>
                      <th className="border-line border px-3 py-2 font-medium">Fonte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicator.values.map((value) => (
                      <Fragment key={value.id}>
                        <tr>
                          <td className="border-line text-ink-muted border px-3 py-2">
                            {formatPeriod(value.period_start, value.period_end)}
                          </td>
                          <td className="border-line border px-3 py-2 font-medium">
                            {formatNumericValue(
                              value.numeric_value,
                              indicator.unit_code,
                              indicator.methodology_summary,
                            )}
                            {indicator.methodology_summary.includes("THS_PER") ? (
                              <span className="text-ink-muted font-normal"> (migliaia)</span>
                            ) : indicator.unit_code === "percent" ? (
                              <span className="text-ink-muted font-normal"> %</span>
                            ) : null}
                          </td>
                          <td className="border-line text-ink-muted border px-3 py-2">
                            {value.territory_label ?? "—"}
                          </td>
                          <td className="border-line text-ink-muted border px-3 py-2">
                            {value.country_label ?? "—"}
                          </td>
                          <td className="border-line text-ink-muted border px-3 py-2">
                            {value.source_url && value.source_name ? (
                              <a
                                href={value.source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-black underline underline-offset-4"
                              >
                                {value.source_name} ↗
                              </a>
                            ) : (
                              value.source_name ?? "—"
                            )}
                          </td>
                        </tr>
                        <tr className="bg-surface-elevated/50">
                          <td
                            colSpan={5}
                            className="border-line text-ink-muted border px-3 py-2 text-xs leading-5"
                          >
                            {value.methodology_note ? (
                              <>
                                <strong className="text-ink font-medium">Nota metodologica:</strong>{" "}
                                {value.methodology_note}{" · "}
                              </>
                            ) : null}
                            <strong className="text-ink font-medium">Aggiornamento Osservatorio:</strong>{" "}
                            {formatItalianDate(value.updated_at.slice(0, 10))}
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {sources.length > 0 ? (
            <section className="max-w-4xl space-y-3">
              <h2 className="text-ink text-xl font-semibold">Fonti originali</h2>
              <ul className="text-ink-muted list-inside list-disc space-y-2 text-sm leading-6">
                {sources.map((source) => (
                  <li key={source.url ?? source.name}>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-black underline underline-offset-4"
                      >
                        {source.name} ↗
                      </a>
                    ) : (
                      source.name
                    )}
                    {source.edition ? ` — ${source.edition}` : ""}
                    {source.publishedOn
                      ? ` · pubblicazione fonte: ${formatItalianDate(source.publishedOn)}`
                      : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Container>
      </Section>
    </main>
  );
}
