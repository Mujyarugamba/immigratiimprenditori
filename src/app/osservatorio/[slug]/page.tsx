import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicIndicatorBySlug } from "@/lib/data/public/observatory";
import {
  OBSERVATORY_PERIODICITY_LABELS,
  OBSERVATORY_UNIT_LABELS,
  formatItalianDate,
  label,
} from "@/lib/public/labels";
import {
  OBSERVATORY_QUALITY_LABELS,
  OBSERVATORY_VALUE_STATUS_LABELS,
  formatObservatoryPeriod,
  formatObservatoryValue,
} from "@/lib/public/observatory-format";
import { safeHttpsUrl } from "@/lib/public/story-media";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const indicator = await getPublicIndicatorBySlug(slug);
    if (!indicator) return { title: "Indicatore non trovato" };
    return {
      title: indicator.title,
      description: indicator.description,
    };
  } catch {
    return { title: "Indicatore — Osservatorio" };
  }
}

export default async function IndicatorePage({ params }: Props) {
  const { slug } = await params;
  let indicator;
  try {
    indicator = await getPublicIndicatorBySlug(slug);
  } catch {
    return (
      <main id="contenuto" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold text-black">Indicatore non disponibile</h1>
        <p className="mt-3 text-neutral-600">
          Si è verificato un problema temporaneo nel caricamento dei dati.
        </p>
        <Link href="/osservatorio" className="mt-6 inline-block underline underline-offset-4">
          Torna all&apos;Osservatorio
        </Link>
      </main>
    );
  }
  if (!indicator) notFound();

  const latest = indicator.values[0] ?? null;
  const sources = Array.from(
    new Map(
      indicator.values
        .map((value) => value.source)
        .filter((source): source is NonNullable<typeof source> => Boolean(source))
        .map((source) => [source.id, source]),
    ).values(),
  );

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/osservatorio"
        className="text-sm font-medium text-black underline underline-offset-4"
      >
        ← Osservatorio
      </Link>

      <article className="mt-8">
        <header className="grid gap-8 border-b border-black pb-8 md:grid-cols-[1fr_260px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Indicatore · {indicator.code}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl">
              {indicator.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
              {indicator.description}
            </p>
          </div>
          <dl className="border-t border-black pt-4 text-sm md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div className="border-b border-neutral-300 pb-3">
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Periodicità</dt>
              <dd className="mt-1 font-medium text-black">
                {label(OBSERVATORY_PERIODICITY_LABELS, indicator.periodicity)}
              </dd>
            </div>
            <div className="border-b border-neutral-300 py-3">
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Unità</dt>
              <dd className="mt-1 font-medium text-black">
                {label(OBSERVATORY_UNIT_LABELS, indicator.unit_code)}
              </dd>
            </div>
            <div className="pt-3">
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Scheda aggiornata</dt>
              <dd className="mt-1 font-medium text-black">
                {formatItalianDate(indicator.updated_at)}
              </dd>
            </div>
          </dl>
        </header>

        {latest ? (
          <section className="grid gap-8 border-b border-black py-9 md:grid-cols-[0.8fr_1.2fr]" aria-labelledby="latest-heading">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Ultimo valore disponibile
              </p>
              <p className="mt-2 text-5xl font-semibold tracking-tight text-black sm:text-6xl">
                {formatObservatoryValue(latest.numeric_value, indicator.unit_code)}
              </p>
              <p className="mt-3 text-sm font-medium text-black">
                {formatObservatoryPeriod(latest.period_start, latest.period_end, indicator.periodicity)}
              </p>
            </div>
            <div>
              <h2 id="latest-heading" className="sr-only">Dettagli dell&apos;ultimo valore</h2>
              <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Qualità</dt>
                  <dd className="mt-1 font-medium text-black">
                    {OBSERVATORY_QUALITY_LABELS[latest.quality_code] ?? latest.quality_code}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Stato</dt>
                  <dd className="mt-1 font-medium text-black">
                    {OBSERVATORY_VALUE_STATUS_LABELS[latest.status] ?? latest.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Territorio</dt>
                  <dd className="mt-1 font-medium text-black">
                    {latest.territory_label ?? latest.country_label ?? "Dato generale"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Settore</dt>
                  <dd className="mt-1 font-medium text-black">
                    {latest.sector_name ?? "Tutti i settori"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">Fonte</dt>
                  <dd className="mt-1 font-medium text-black">
                    {latest.source?.producer_name ?? latest.source?.name ?? "Fonte statistica associata"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        ) : (
          <section className="border-b border-black py-9">
            <p className="text-neutral-600">Non sono ancora disponibili valori pubblici per questo indicatore.</p>
          </section>
        )}

        <section className="grid gap-8 border-b border-black py-9 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-black">Che cosa misura</h2>
            <p className="mt-3 leading-7 text-neutral-700">{indicator.purpose_text}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black">Metodologia</h2>
            <p className="mt-3 leading-7 text-neutral-700">{indicator.methodology_summary}</p>
          </div>
        </section>

        {indicator.values.length > 0 ? (
          <section className="border-b border-black py-9" aria-labelledby="series-heading">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Serie disponibile</p>
                <h2 id="series-heading" className="mt-2 text-2xl font-semibold text-black">
                  Valori pubblicati
                </h2>
              </div>
              <p className="text-sm text-neutral-500">{indicator.values.length} osservazioni</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-y border-black">
                    <th className="py-3 pr-5 font-semibold">Periodo</th>
                    <th className="py-3 pr-5 font-semibold">Valore</th>
                    <th className="py-3 pr-5 font-semibold">Territorio</th>
                    <th className="py-3 pr-5 font-semibold">Qualità</th>
                    <th className="py-3 font-semibold">Fonte</th>
                  </tr>
                </thead>
                <tbody>
                  {indicator.values.map((value) => (
                    <tr key={value.id} className="border-b border-neutral-300 align-top">
                      <td className="py-4 pr-5 font-medium text-black">
                        {formatObservatoryPeriod(value.period_start, value.period_end, indicator.periodicity)}
                      </td>
                      <td className="py-4 pr-5 font-semibold text-black">
                        {formatObservatoryValue(value.numeric_value, indicator.unit_code)}
                      </td>
                      <td className="py-4 pr-5 text-neutral-700">
                        {value.territory_label ?? value.country_label ?? "Generale"}
                      </td>
                      <td className="py-4 pr-5 text-neutral-700">
                        {OBSERVATORY_QUALITY_LABELS[value.quality_code] ?? value.quality_code}
                        {value.status !== "final" ? (
                          <span className="block text-xs text-neutral-500">
                            {OBSERVATORY_VALUE_STATUS_LABELS[value.status] ?? value.status}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-4 text-neutral-700">
                        {value.source?.producer_name ?? value.source?.name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {sources.length > 0 ? (
          <section className="border-b border-black py-9" aria-labelledby="sources-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Provenienza</p>
            <h2 id="sources-heading" className="mt-2 text-2xl font-semibold text-black">
              Fonti statistiche
            </h2>
            <div className="mt-6 divide-y divide-black border-y border-black">
              {sources.map((source) => {
                const url = safeHttpsUrl(source.url);
                return (
                  <article key={source.id} className="grid gap-4 py-6 md:grid-cols-[1fr_220px]">
                    <div>
                      <h3 className="text-lg font-semibold text-black">{source.name}</h3>
                      <p className="mt-1 text-sm text-neutral-700">
                        {source.producer_name} · {source.publication_title}
                      </p>
                      {source.methodology_note ? (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                          {source.methodology_note}
                        </p>
                      ) : null}
                      {source.license_note ? (
                        <p className="mt-2 text-xs leading-5 text-neutral-500">
                          Licenza / utilizzo: {source.license_note}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-sm">
                      {source.source_published_on ? (
                        <p className="text-neutral-500">
                          Pubblicata: {formatItalianDate(source.source_published_on)}
                        </p>
                      ) : null}
                      {source.edition_label ? (
                        <p className="mt-1 text-neutral-500">Edizione: {source.edition_label}</p>
                      ) : null}
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block font-medium text-black underline underline-offset-4"
                        >
                          Apri la fonte primaria
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <footer className="py-7 text-xs leading-5 text-neutral-500">
          <p>
            Indicatore pubblicato nell&apos;Osservatorio Immigrati Imprenditori. Le revisioni dei valori sono conservate nel sistema e lo stato di qualità è mostrato separatamente dalla fonte.
          </p>
        </footer>
      </article>
    </main>
  );
}
