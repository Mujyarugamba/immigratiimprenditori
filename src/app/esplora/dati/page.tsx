import type { Metadata } from "next";
import Link from "next/link";
import { formatExplorerValue, getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Data Explorer | Osservatorio",
  description:
    "Esplora e filtra i valori pubblicati dall'Osservatorio di Immigrati Imprenditori per indicatore, territorio e periodo.",
  alternates: { canonical: "/esplora/dati" },
};

type Props = {
  searchParams: Promise<{
    indicatore?: string;
    territorio?: string;
    anno?: string;
  }>;
};

export default async function DataExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const snapshot = await getExplorerSnapshot();
  const indicatorMap = new Map(snapshot.indicators.map((item) => [item.id, item]));

  const years = Array.from(
    new Set(snapshot.values.map((value) => new Date(value.period_start).getFullYear())),
  ).sort((a, b) => b - a);

  const filtered = snapshot.values.filter((value) => {
    const indicator = indicatorMap.get(value.indicator_id);
    if (!indicator) return false;
    if (params.indicatore && indicator.slug !== params.indicatore) return false;
    if (params.territorio && value.territory_code !== params.territorio) return false;
    if (params.anno && String(new Date(value.period_start).getFullYear()) !== params.anno) return false;
    return true;
  });

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

      <form className="mt-8 grid gap-5 border border-black p-5 md:grid-cols-4" method="get">
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Indicatore
          <select name="indicatore" defaultValue={params.indicatore ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {snapshot.indicators.map((indicator) => (
              <option key={indicator.id} value={indicator.slug}>{indicator.title}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Territorio
          <select name="territorio" defaultValue={params.territorio ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {snapshot.territories.filter((territory) => territory.code).map((territory) => (
              <option key={`${territory.level}-${territory.code}-${territory.label}`} value={territory.code ?? ""}>{territory.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Anno
          <select name="anno" defaultValue={params.anno ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            <option value="">Tutti</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">Filtra</button>
          <Link href="/esplora/dati" className="px-2 py-2.5 text-sm underline underline-offset-4">Azzera</Link>
        </div>
      </form>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-black pb-3">
        <h2 className="text-2xl font-semibold text-black">Valori</h2>
        <span className="text-sm text-neutral-600">{filtered.length} risultati</span>
      </div>

      <div className="mt-5 overflow-x-auto border border-black">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100 text-black">
            <tr>
              <th className="border-b border-black px-4 py-3">Indicatore</th>
              <th className="border-b border-black px-4 py-3">Territorio</th>
              <th className="border-b border-black px-4 py-3">Gruppo / categoria</th>
              <th className="border-b border-black px-4 py-3">Periodo</th>
              <th className="border-b border-black px-4 py-3 text-right">Valore</th>
              <th className="border-b border-black px-4 py-3">Qualità</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((value) => {
              const indicator = indicatorMap.get(value.indicator_id)!;
              return (
                <tr key={value.id} className="border-b border-neutral-300 last:border-b-0">
                  <td className="px-4 py-3 align-top">
                    <Link href={`/osservatorio/${indicator.slug}`} className="font-semibold underline underline-offset-4">{indicator.title}</Link>
                  </td>
                  <td className="px-4 py-3 align-top">{value.territory_label ?? "—"}</td>
                  <td className="px-4 py-3 align-top">{value.country_label ?? "—"}</td>
                  <td className="px-4 py-3 align-top">
                    {value.period_start === value.period_end
                      ? value.period_start
                      : `${value.period_start} → ${value.period_end}`}
                  </td>
                  <td className="px-4 py-3 text-right align-top font-semibold">
                    {formatExplorerValue(Number(value.numeric_value), indicator.unit_code)}
                  </td>
                  <td className="px-4 py-3 align-top">{value.quality_code}</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-600">Nessun valore corrisponde ai filtri selezionati.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-5 max-w-4xl text-sm leading-6 text-neutral-600">
        Il Data Explorer non sostituisce la lettura della scheda metodologica. Le categorie come cittadinanza,
        luogo di nascita, impresa straniera e lavoro autonomo descrivono popolazioni statistiche differenti.
      </p>
    </main>
  );
}
