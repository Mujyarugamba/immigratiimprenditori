import type { Metadata } from "next";
import Link from "next/link";
import { ExplorerBarChart } from "@/components/data/ExplorerBarChart";
import { formatExplorerValue, getExplorerIndex } from "@/lib/data/public/explore";
import { queryPublicIndicatorValues } from "@/lib/data/public/observatory";

export const metadata: Metadata = {
  title: "Data Explorer | Osservatorio",
  description:
    "Esplora e filtra i valori pubblicati dall'Osservatorio di Immigrati Imprenditori per indicatore, territorio, periodo, settore e categoria.",
  alternates: { canonical: "/esplora/dati" },
};

const PAGE_SIZE = 100;

type Props = {
  searchParams: Promise<{
    indicatore?: string;
    territorio?: string;
    anno?: string;
    settore?: string;
    categoria?: string;
    pagina?: string;
  }>;
};

function clean(value?: string) {
  return value?.trim() || undefined;
}

export default async function DataExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const filters = {
    indicatorSlug: clean(params.indicatore),
    territoryCode: clean(params.territorio),
    year: clean(params.anno),
    sectorId: clean(params.settore),
    categoryCode: clean(params.categoria),
  };

  const [index, result] = await Promise.all([
    getExplorerIndex(),
    queryPublicIndicatorValues(filters, {
      limit: PAGE_SIZE,
      offset: (requestedPage - 1) * PAGE_SIZE,
    }),
  ]);
  const indicatorMap = new Map(index.indicators.map((item) => [item.id, item]));
  const sectorMap = new Map(index.sectors.map((item) => [item.id, item]));
  const filtered = result.items.filter((value) => indicatorMap.has(value.indicator_id));
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  const exportParams = new URLSearchParams();
  for (const key of ["indicatore", "territorio", "anno", "settore", "categoria"] as const) {
    const value = clean(params[key]);
    if (value) exportParams.set(key, value);
  }
  const csvHref = `/api/open-data/indicators.csv${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  const pageHref = (page: number) => {
    const qs = new URLSearchParams(exportParams);
    if (page > 1) qs.set("pagina", String(page));
    return `/esplora/dati${qs.size ? `?${qs.toString()}` : ""}`;
  };

  const visibleIndicatorIds = Array.from(new Set(filtered.map((value) => value.indicator_id)));
  const chartIndicator = visibleIndicatorIds.length === 1 ? indicatorMap.get(visibleIndicatorIds[0]) : undefined;
  const chartRows = chartIndicator
    ? filtered.map((value) => {
        const year = new Date(value.period_start).getFullYear();
        const sector = value.business_sector_id == null ? null : sectorMap.get(value.business_sector_id);
        const parts = [
          value.territory_label,
          value.country_label,
          sector?.name,
          String(year),
        ].filter(Boolean);
        return {
          id: value.id,
          label: parts.join(" · ") || String(year),
          value: Number(value.numeric_value),
          formattedValue: formatExplorerValue(Number(value.numeric_value), chartIndicator.unit_code),
        };
      })
    : [];

  return (
    <main id="contenuto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Osservatorio · Esplora
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">Data Explorer</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Filtra i valori già pubblicati dal Centro Studi. Le definizioni e la comparabilità dipendono dalla
          singola scheda indicatore: valori appartenenti a indicatori diversi non vanno sommati automaticamente.
        </p>
      </header>

      <form className="mt-8 grid gap-5 border border-black p-5 md:grid-cols-2 xl:grid-cols-6" method="get">
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Indicatore
          <select name="indicatore" defaultValue={params.indicatore ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {index.indicators.map((indicator) => (
              <option key={indicator.id} value={indicator.slug}>{indicator.title}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Territorio
          <select name="territorio" defaultValue={params.territorio ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {index.territories.filter((territory) => territory.code).map((territory) => (
              <option key={`${territory.level}-${territory.code}-${territory.label}`} value={territory.code ?? ""}>{territory.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Anno
          <select name="anno" defaultValue={params.anno ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {index.years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Settore
          <select name="settore" defaultValue={params.settore ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {index.sectors.map((sector) => (
              <option key={sector.id} value={String(sector.id)}>{sector.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Gruppo / categoria
          <select name="categoria" defaultValue={params.categoria ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {index.categories.map((category) => <option key={category.code} value={category.code}>{category.label}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">Filtra</button>
          <Link href="/esplora/dati" className="px-2 py-2.5 text-sm underline underline-offset-4">Azzera</Link>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-black pb-3">
        <div>
          <h2 className="text-2xl font-semibold text-black">Valori</h2>
          <span className="text-sm text-neutral-600">
            {result.total} risultati · pagina {Math.min(requestedPage, pageCount)} di {pageCount}
          </span>
        </div>
        <a href={csvHref} className="border border-black px-4 py-2 text-sm font-semibold">
          Scarica CSV filtrato
        </a>
      </div>

      {chartIndicator && chartRows.length > 0 ? (
        <section className="mt-6" aria-labelledby="explorer-chart-heading">
          <h2 id="explorer-chart-heading" className="sr-only">Grafico dei risultati</h2>
          <ExplorerBarChart title={`${chartIndicator.title} · pagina corrente`} rows={chartRows} />
        </section>
      ) : filtered.length > 0 ? (
        <p className="mt-5 max-w-4xl text-sm leading-6 text-neutral-600">
          Seleziona un singolo indicatore per ottenere anche la visualizzazione grafica della pagina corrente senza mescolare unità o definizioni diverse.
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto border border-black">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100 text-black">
            <tr>
              <th className="border-b border-black px-4 py-3">Indicatore</th>
              <th className="border-b border-black px-4 py-3">Territorio</th>
              <th className="border-b border-black px-4 py-3">Gruppo / categoria</th>
              <th className="border-b border-black px-4 py-3">Settore</th>
              <th className="border-b border-black px-4 py-3">Periodo</th>
              <th className="border-b border-black px-4 py-3 text-right">Valore</th>
              <th className="border-b border-black px-4 py-3">Stato</th>
              <th className="border-b border-black px-4 py-3">Qualità</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((value) => {
              const indicator = indicatorMap.get(value.indicator_id)!;
              const sector = value.business_sector_id == null ? null : sectorMap.get(value.business_sector_id);
              return (
                <tr key={value.id} className="border-b border-neutral-300 last:border-b-0">
                  <td className="px-4 py-3 align-top">
                    <Link href={`/osservatorio/${indicator.slug}`} className="font-semibold underline underline-offset-4">{indicator.title}</Link>
                  </td>
                  <td className="px-4 py-3 align-top">{value.territory_label ?? "—"}</td>
                  <td className="px-4 py-3 align-top">{value.country_label ?? "—"}</td>
                  <td className="px-4 py-3 align-top">{sector?.name ?? "—"}</td>
                  <td className="px-4 py-3 align-top">
                    {value.period_start === value.period_end
                      ? value.period_start
                      : `${value.period_start} → ${value.period_end}`}
                  </td>
                  <td className="px-4 py-3 text-right align-top font-semibold">
                    {formatExplorerValue(Number(value.numeric_value), indicator.unit_code)}
                  </td>
                  <td className="px-4 py-3 align-top">{value.status}</td>
                  <td className="px-4 py-3 align-top">{value.quality_code}</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-600">Nessun valore corrisponde ai filtri selezionati.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <nav className="mt-6 flex flex-wrap items-center justify-between gap-4" aria-label="Paginazione valori">
          {requestedPage > 1 ? (
            <Link href={pageHref(requestedPage - 1)} className="border border-black px-4 py-2 text-sm font-semibold">← Pagina precedente</Link>
          ) : <span />}
          {requestedPage < pageCount ? (
            <Link href={pageHref(requestedPage + 1)} className="border border-black px-4 py-2 text-sm font-semibold">Pagina successiva →</Link>
          ) : null}
        </nav>
      ) : null}

      <p className="mt-5 max-w-4xl text-sm leading-6 text-neutral-600">
        Il Data Explorer non sostituisce la lettura della scheda metodologica. Le categorie come cittadinanza,
        luogo di nascita, impresa straniera e lavoro autonomo descrivono popolazioni statistiche differenti.
      </p>
    </main>
  );
}
