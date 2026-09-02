import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuantitativeTerritoryMap } from "@/components/data/QuantitativeTerritoryMap";
import { coordinateForTerritoryCode } from "@/lib/atlas/territory-map";
import { formatExplorerValue, getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";

const TEXT = {
  en: { kicker: "Observatory · Geography of data", title: "Quantitative map", intro: "View one published indicator by territory. Different statistical groups are never added or overlaid.", indicator: "Indicator", year: "Year", category: "Group / category", select: "Select", update: "Update map", table: "Table", choose: "Select one statistical group to build a comparable map.", none: "No mapped territorial values are available for the selected combination.", interpretation: "Interpretation", interpretationText: "This proportional-symbol map does not represent administrative boundaries and never assigns values to areas without data. Consult the indicator record for definition, source and quality.", record: "Indicator record", eyebrow: "Quantitative map · proportional symbols", mapDescription: "Circle area varies with the value. Points are representative geographic anchors, not statistical centroids.", territoriesLabel: "territories represented" },
  fr: { kicker: "Observatoire · Géographie des données", title: "Carte quantitative", intro: "Visualisez un indicateur publié par territoire. Des groupes statistiques différents ne sont jamais additionnés ni superposés.", indicator: "Indicateur", year: "Année", category: "Groupe / catégorie", select: "Sélectionner", update: "Mettre à jour", table: "Tableau", choose: "Sélectionnez un groupe statistique pour construire une carte comparable.", none: "Aucune valeur territoriale cartographiée n’est disponible pour la combinaison sélectionnée.", interpretation: "Interprétation", interpretationText: "Cette carte à symboles proportionnels ne représente pas les frontières administratives et n’attribue aucune valeur aux zones sans données. Consultez la fiche indicateur pour la définition, la source et la qualité.", record: "Fiche indicateur", eyebrow: "Carte quantitative · symboles proportionnels", mapDescription: "La surface des cercles varie avec la valeur. Les points sont des repères géographiques représentatifs, pas des centroïdes statistiques.", territoriesLabel: "territoires représentés" },
  es: { kicker: "Observatorio · Geografía de los datos", title: "Mapa cuantitativo", intro: "Visualiza un indicador publicado por territorio. Los grupos estadísticos diferentes nunca se suman ni se superponen.", indicator: "Indicador", year: "Año", category: "Grupo / categoría", select: "Selecciona", update: "Actualizar mapa", table: "Tabla", choose: "Selecciona un grupo estadístico para construir un mapa comparable.", none: "No hay valores territoriales cartografiados para la combinación seleccionada.", interpretation: "Interpretación", interpretationText: "Este mapa de símbolos proporcionales no representa límites administrativos ni asigna valores a áreas sin datos. Consulta la ficha del indicador para definición, fuente y calidad.", record: "Ficha del indicador", eyebrow: "Mapa cuantitativo · símbolos proporcionales", mapDescription: "El área de los círculos varía con el valor. Los puntos son anclajes geográficos representativos, no centroides estadísticos.", territoriesLabel: "territorios representados" },
  de: { kicker: "Observatorium · Geografie der Daten", title: "Quantitative Karte", intro: "Zeigen Sie einen veröffentlichten Indikator nach Region. Unterschiedliche statistische Gruppen werden niemals addiert oder überlagert.", indicator: "Indikator", year: "Jahr", category: "Gruppe / Kategorie", select: "Auswählen", update: "Karte aktualisieren", table: "Tabelle", choose: "Wählen Sie eine statistische Gruppe für eine vergleichbare Karte.", none: "Für die gewählte Kombination sind keine kartierten Regionalwerte verfügbar.", interpretation: "Interpretation", interpretationText: "Diese Karte mit proportionalen Symbolen bildet keine Verwaltungsgrenzen ab und weist Gebieten ohne Daten keine Werte zu. Definition, Quelle und Qualität stehen im Indikatoreintrag.", record: "Indikatoreintrag", eyebrow: "Quantitative Karte · proportionale Symbole", mapDescription: "Die Kreisfläche variiert mit dem Wert. Die Punkte sind repräsentative geografische Anker, keine statistischen Zentroiden.", territoriesLabel: "Regionen dargestellt" },
  ar: { kicker: "المرصد · جغرافية البيانات", title: "الخريطة الكمية", intro: "اعرض مؤشراً منشوراً واحداً حسب الإقليم. لا تُجمع المجموعات الإحصائية المختلفة ولا تُعرض فوق بعضها.", indicator: "المؤشر", year: "السنة", category: "المجموعة / الفئة", select: "اختر", update: "تحديث الخريطة", table: "الجدول", choose: "اختر مجموعة إحصائية واحدة لبناء خريطة قابلة للمقارنة.", none: "لا تتوفر قيم إقليمية قابلة للتمثيل على الخريطة للمجموعة المختارة.", interpretation: "التفسير", interpretationText: "لا تمثل خريطة الرموز المتناسبة هذه الحدود الإدارية ولا تنسب قيماً إلى مناطق بلا بيانات. راجع بطاقة المؤشر للتعريف والمصدر والجودة.", record: "بطاقة المؤشر", eyebrow: "خريطة كمية · رموز متناسبة", mapDescription: "تتغير مساحة الدوائر بحسب القيمة. النقاط مراسي جغرافية تمثيلية وليست مراكز إحصائية.", territoriesLabel: "أقاليم ممثلة" },
  zh: { kicker: "观察站 · 数据地理", title: "定量地图", intro: "按地区查看一个已发布指标。不同统计组别的数据绝不会相加或叠加。", indicator: "指标", year: "年份", category: "组别 / 类别", select: "请选择", update: "更新地图", table: "表格", choose: "请选择一个统计组别，以生成可比较的地图。", none: "所选组合没有可用于地图展示的地区数据。", interpretation: "解读", interpretationText: "这张比例符号地图不表示行政边界，也不会给没有数据的区域赋值。定义、来源和质量请查看指标页面。", record: "指标页面", eyebrow: "定量地图 · 比例符号", mapDescription: "圆的面积随数值变化。点位是代表性地理锚点，而非统计质心。", territoriesLabel: "个地区" },
} as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ indicatore?: string; categoria?: string; anno?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = TEXT[locale];
  return { title: m.title, description: m.intro };
}

export default async function LocalizedQuantitativeMapPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = TEXT[locale];
  const paramsQuery = await searchParams;
  const snapshot = await getExplorerSnapshot();
  const indicator = snapshot.indicators.find((item) => item.slug === paramsQuery.indicatore) ?? snapshot.indicators[0];
  const indicatorValues = indicator ? snapshot.values.filter((value) => value.indicator_id === indicator.id) : [];

  const years = Array.from(new Set(indicatorValues.map((value) => String(new Date(value.period_start).getFullYear()))).sort((a, b) => Number(b) - Number(a));
  const selectedYear = paramsQuery.anno && years.includes(paramsQuery.anno) ? paramsQuery.anno : years[0];

  const categoryMap = new Map<string, string>();
  for (const value of indicatorValues) {
    if (value.country_code && value.country_label) categoryMap.set(value.country_code, value.country_label);
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => a[1].localeCompare(b[1], "it"));
  const requiresCategory = categories.length > 1;
  const selectedCategory = requiresCategory
    ? categories.some(([code]) => code === paramsQuery.categoria)
      ? paramsQuery.categoria
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

  const mapTitle = `${indicator?.title ?? ""}${selectedYear ? ` · ${selectedYear}` : ""}${selectedCategory ? ` · ${categoryMap.get(selectedCategory) ?? selectedCategory}` : ""}`;

  return (
    <main id="contenuto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>

      <form method="get" className="mt-8 grid gap-5 border border-black p-5 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          {m.indicator}
          <select name="indicatore" defaultValue={indicator?.slug ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            {snapshot.indicators.map((item) => <option key={item.id} value={item.slug}>{item.title}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          {m.year}
          <select name="anno" defaultValue={selectedYear ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">
          {m.category}
          <select name="categoria" defaultValue={selectedCategory ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal" disabled={!requiresCategory}>
            {requiresCategory ? <option value="">{m.select}</option> : null}
            {categories.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">{m.update}</button>
          <Link href={`/${locale}/esplora/dati`} className="px-2 py-2.5 text-sm underline underline-offset-4">{m.table}</Link>
        </div>
      </form>

      {requiresCategory && !selectedCategory ? (
        <section className="mt-8 border border-black p-6"><p className="max-w-3xl text-base leading-7 text-neutral-700">{m.choose}</p></section>
      ) : mapRows.length > 0 && indicator ? (
        <section className="mt-8"><QuantitativeTerritoryMap title={mapTitle} rows={mapRows} eyebrow={m.eyebrow} description={m.mapDescription} territoriesLabel={m.territoriesLabel} /></section>
      ) : (
        <section className="mt-8 border border-black p-6"><p className="max-w-3xl text-base leading-7 text-neutral-700">{m.none}</p></section>
      )}

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">{m.interpretation}</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-700">{m.interpretationText}</p>
        {indicator ? <Link href={`/${locale}/osservatorio/${indicator.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">{m.record} →</Link> : null}
      </section>
    </main>
  );
}
