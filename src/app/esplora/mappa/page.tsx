import type { Metadata } from "next";
import Link from "next/link";
import { QuantitativeTerritoryMap } from "@/components/data/QuantitativeTerritoryMap";
import { coordinateForTerritoryCode } from "@/lib/atlas/territory-map";
import { formatExplorerValue, getExplorerSnapshot } from "@/lib/data/public/explore";

export const metadata: Metadata = {
  title: "Mappa dati | Osservatorio",
  description:
    "Visualizza geograficamente un indicatore pubblicato dall'Osservatorio di Immigrati Imprenditori senza mescolare definizioni statistiche differenti.",
  alternates: { canonical: "/esplora/mappa" },
};

type Props = {
  searchParams: Promise<{
    indicatore?: string;
    categoria?: string;
    anno?: string;
  }>;
};

export default async function QuantitativeMapPage({ searchParams }: Props) {
  const params = await searchParams;
  const snapshot = await getExplorerSnapshot();
  const indicator = snapshot.indicators.find((item) => item.slug === params.indicatore) ?? snapshot.indicators[0];
  const indicatorValues = indicator
    ? snapshot.values.filter((value) => value.indicator_id === indicator.id)
    : [];

  const years = Array.from(
    new Set(indicatorValues.map((value) => String(new Date(value.period_start).getFullYear()))),
  ).sort((a, b) => Number(b) - Number(a));
  const selectedYear = params.anno && years.includes(params.anno) ? params.anno : years[0];

  const categoryMap = new Map<string, string>();
  for (const value of indicatorValues) {
    if (value.country_code && value.country_label) categoryMap.set(value.country_code, value.country_label);
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => a[1].localeCompare(b[1], "it"));
  const requiresCategory = categories.length > 1;
  const selectedCategory = requiresCategory
    ? categories.some(([code]) => code === params.categoria)
      ? params.categoria
      : null
    : categories[0]?.[0] ?? null;

  const filtered = indicatorValues.filter((value) => {
    if (selectedYear && String(new Date(value.period_start).getFullYear()) !== selectedYear) return false;
    if (requiresCategory && selectedCategory && value.country_code !== selectedCategory) return false;
    if (requiresCategory && !selectedCategory) return false;
    return Boolean(value.territory_code && coordinateForTerritoryCode(value.territory_code));
  });

  const mapRows = indicator
    ? filtered.map((value) => ({
        id: value.id,
        territoryCode: value.territory_code!,
        territoryLabel: value.territory_label ?? value.territory_code!,
        value: Number(value.numeric_value),
        formattedValue: formatExplorerValue(Number(value.numeric_value), indicator.unit_code),
      }))
    : [];

  return (
    <main id="contenuto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Osservatorio · Geografia dei dati
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Mappa quantitativa
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Visualizza un singolo indicatore per territorio. Quando la fonte distingue più gruppi o categorie,
          la mappa richiede di sceglierne uno: valori con definizioni diverse non vengono sommati o sovrapposti.
        </p>
      </header>

      <form method="get" className="mt-8 grid gap-5 border border-black p-5 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Indicatore
          <select name="indicatore" defaultValue={indicator?.slug ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            {snapshot.indicators.map((item) => (
              <option key={item.id} value={item.slug}>{item.title}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Anno
          <select name="anno" defaultValue={selectedYear ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          Gruppo / categoria
          <select name="categoria" defaultValue={selectedCategory ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal" disabled={!requiresCategory}>
            {requiresCategory ? <option value="">Seleziona</option> : null}
            {categories.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">
            Aggiorna mappa
          </button>
          <Link href="/esplora/dati" className="px-2 py-2.5 text-sm underline underline-offset-4">Tabella</Link>
        </div>
      </form>

      {requiresCategory && !selectedCategory ? (
        <section className="mt-8 border border-black p-6" aria-live="polite">
          <p className="max-w-3xl text-base leading-7 text-neutral-700">
            Questo indicatore distingue più gruppi statistici. Seleziona una categoria per costruire una mappa confrontabile.
          </p>
        </section>
      ) : mapRows.length > 0 && indicator ? (
        <section className="mt-8">
          <QuantitativeTerritoryMap
            title={`${indicator.title}${selectedYear ? ` · ${selectedYear}` : ""}${selectedCategory ? ` · ${categoryMap.get(selectedCategory) ?? selectedCategory}` : ""}`}
            rows={mapRows}
          />
        </section>
      ) : (
        <section className="mt-8 border border-black p-6" aria-live="polite">
          <p className="max-w-3xl text-base leading-7 text-neutral-700">
            Per la combinazione selezionata non sono disponibili valori territoriali con un&apos;ancora cartografica nel perimetro dell&apos;Atlante.
          </p>
        </section>
      )}

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">Interpretazione</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-700">
          Questa è una mappa quantitativa a simboli proporzionali. Non rappresenta confini amministrativi e non attribuisce
          valori a superfici prive di dati. Per definizione, fonte e qualità del dato consulta sempre la scheda dell&apos;indicatore.
        </p>
        {indicator ? (
          <Link href={`/osservatorio/${indicator.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
            Scheda indicatore →
          </Link>
        ) : null}
      </section>
    </main>
  );
}
