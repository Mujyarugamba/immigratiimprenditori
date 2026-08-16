import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicIndicatorBySlug } from "@/lib/data/public/observatory";
import {
  OBSERVATORY_PERIODICITY_LABELS,
  OBSERVATORY_UNIT_LABELS,
  formatItalianDate,
  label,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const indicator = await getPublicIndicatorBySlug(slug);
  if (!indicator) {
    return { title: "Non trovato" };
  }
  return {
    title: indicator.title,
    description: indicator.description,
  };
}

export default async function IndicatoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const indicator = await getPublicIndicatorBySlug(slug);

  if (!indicator) {
    notFound();
  }

  const sources = [
    ...new Set(
      indicator.values
        .map((value) => value.source_name)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return (
    <Section>
      <Container className="max-w-4xl space-y-8">
        <Link
          href="/osservatorio"
          className="text-brand hover:text-brand-dark text-sm font-medium"
        >
          ← Torna all&apos;osservatorio
        </Link>

        <header className="space-y-4">
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

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Finalità</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {indicator.purpose_text}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Metodologia</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {indicator.methodology_summary}
          </p>
        </section>

        {indicator.values.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-ink text-xl font-semibold">Valori</h2>
            <div className="overflow-x-auto">
              <table className="border-line w-full min-w-[640px] border text-left text-sm">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="border-line border px-3 py-2 font-medium">
                      Periodo
                    </th>
                    <th className="border-line border px-3 py-2 font-medium">
                      Valore
                    </th>
                    <th className="border-line border px-3 py-2 font-medium">
                      Territorio
                    </th>
                    <th className="border-line border px-3 py-2 font-medium">
                      Cittadinanza
                    </th>
                    <th className="border-line border px-3 py-2 font-medium">
                      Fonte
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {indicator.values.map((value) => (
                    <tr key={value.id} className="even:bg-surface-elevated/50">
                      <td className="border-line text-ink-muted border px-3 py-2">
                        {formatItalianDate(value.period_start)}
                        {" – "}
                        {formatItalianDate(value.period_end)}
                      </td>
                      <td className="border-line border px-3 py-2 font-medium">
                        {value.numeric_value}
                        {indicator.methodology_summary.includes("THS_PER") ? (
                          <span className="text-ink-muted font-normal">
                            {" "}
                            (migliaia)
                          </span>
                        ) : null}
                      </td>
                      <td className="border-line text-ink-muted border px-3 py-2">
                        {value.territory_label ?? "—"}
                      </td>
                      <td className="border-line text-ink-muted border px-3 py-2">
                        {value.country_label ?? "—"}
                      </td>
                      <td className="border-line text-ink-muted border px-3 py-2">
                        {value.source_name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {sources.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Fonti</h2>
            <ul className="text-ink-muted list-inside list-disc space-y-1 text-sm">
              {sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </Section>
  );
}
