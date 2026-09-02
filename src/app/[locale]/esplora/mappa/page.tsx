import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuantitativeTerritoryMap } from "@/components/data/QuantitativeTerritoryMap";
import { coordinateForTerritoryCode } from "@/lib/atlas/territory-map";
import { formatExplorerValue, getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { indicatorTranslation } from "@/lib/i18n/public-entity-translations";
import { localizedTerritoryLabel } from "@/lib/i18n/territory-translations";
import { languageAlternates } from "@/lib/i18n/seo";

const text = {
  en: { kicker: "Observatory · Geography of data", title: "Quantitative map", intro: "View one indicator by territory. When a source distinguishes several groups or categories, choose one: values with different definitions are never added or overlaid.", indicator: "Indicator", year: "Year", category: "Group / category", select: "Select", update: "Update map", table: "Table", choose: "This indicator distinguishes several statistical groups. Select one category to build a comparable map.", none: "No territorial values with a mapped anchor are available for the selected combination.", interpretation: "Interpretation", interpretationText: "This is a proportional-symbol quantitative map. It does not represent administrative boundaries and does not assign values to areas without data. Always consult the indicator record for definition, source and data quality.", record: "Indicator record", eyebrow: "Quantitative map · proportional symbols", mapDescription: "Circle area varies with the value. Points are representative geographic anchors, not statistical centroids. The map shows one indicator and never adds different categories.", territoriesLabel: "territories represented" },
  fr: { kicker: "Observatoire · Géographie des données", title: "Carte quantitative", intro: "Visualisez un seul indicateur par territoire. Lorsque la source distingue plusieurs groupes ou catégories, choisissez-en un : des valeurs ayant des définitions différentes ne sont jamais additionnées ni superposées.", indicator: "Indicateur", year: "Année", category: "Groupe / catégorie", select: "Sélectionner", update: "Mettre à jour la carte", table: "Tableau", choose: "Cet indicateur distingue plusieurs groupes statistiques. Sélectionnez une catégorie pour construire une carte comparable.", none: "Aucune valeur territoriale disposant d’un point cartographique n’est disponible pour la combinaison sélectionnée.", interpretation: "Interprétation", interpretationText: "Il s’agit d’une carte quantitative à symboles proportionnels. Elle ne représente pas les frontières administratives et n’attribue pas de valeur aux zones sans données. Consultez toujours la fiche de l’indicateur pour la définition, la source et la qualité des données.", record: "Fiche indicateur", eyebrow: "Carte quantitative · symboles proportionnels", mapDescription: "La surface des cercles varie avec la valeur. Les points sont des repères géographiques représentatifs et non des centroïdes statistiques. La carte montre un seul indicateur et n’additionne jamais des catégories différentes.", territoriesLabel: "territoires représentés" },
  es: { kicker: "Observatorio · Geografía de los datos", title: "Mapa cuantitativo", intro: "Visualiza un solo indicador por territorio. Cuando la fuente distingue varios grupos o categorías, elige uno: nunca se suman ni superponen valores con definiciones diferentes.", indicator: "Indicador", year: "Año", category: "Grupo / categoría", select: "Selecciona", update: "Actualizar mapa", table: "Tabla", choose: "Este indicador distingue varios grupos estadísticos. Selecciona una categoría para construir un mapa comparable.", none: "No hay valores territoriales con anclaje cartográfico disponibles para la combinación seleccionada.", interpretation: "Interpretación", interpretationText: "Este es un mapa cuantitativo de símbolos proporcionales. No representa límites administrativos ni asigna valores a superficies sin datos. Consulta siempre la ficha del indicador para la definición, la fuente y la calidad del dato.", record: "Ficha del indicador", eyebrow: "Mapa cuantitativo · símbolos proporcionales", mapDescription: "El área de los círculos varía con el valor. Los puntos son anclajes geográficos representativos, no centroides estadísticos. El mapa muestra un solo indicador y nunca suma categorías diferentes.", territoriesLabel: "territorios representados" },
  de: { kicker: "Observatorium · Geografie der Daten", title: "Quantitative Karte", intro: "Stellen Sie einen einzelnen Indikator nach Region dar. Wenn die Quelle mehrere Gruppen oder Kategorien unterscheidet, wählen Sie eine aus: Werte mit unterschiedlichen Definitionen werden nie addiert oder überlagert.", indicator: "Indikator", year: "Jahr", category: "Gruppe / Kategorie", select: "Auswählen", update: "Karte aktualisieren", table: "Tabelle", choose: "Dieser Indikator unterscheidet mehrere statistische Gruppen. Wählen Sie eine Kategorie, um eine vergleichbare Karte zu erstellen.", none: "Für die gewählte Kombination sind keine territorialen Werte mit Kartenanker verfügbar.", interpretation: "Interpretation", interpretationText: "Dies ist eine quantitative Karte mit proportionalen Symbolen. Sie bildet keine Verwaltungsgrenzen ab und weist Flächen ohne Daten keine Werte zu. Definition, Quelle und Datenqualität finden Sie immer im Indikatoreintrag.", record: "Indikatoreintrag", eyebrow: "Quantitative Karte · proportionale Symbole", mapDescription: "Die Kreisfläche variiert mit dem Wert. Die Punkte sind repräsentative geografische Anker und keine statistischen Zentroiden. Die Karte zeigt einen Indikator und addiert niemals unterschiedliche Kategorien.", territoriesLabel: "Regionen dargestellt" },
  ar: { kicker: "المرصد · جغرافية البيانات", title: "الخريطة الكمية", intro: "اعرض مؤشراً واحداً حسب الإقليم. عندما يميز المصدر بين عدة مجموعات أو فئات، اختر واحدة منها: لا تُجمع القيم ذات التعريفات المختلفة ولا تُعرض فوق بعضها.", indicator: "المؤشر", year: "السنة", category: "المجموعة / الفئة", select: "اختر", update: "تحديث الخريطة", table: "الجدول", choose: "يميز هذا المؤشر بين عدة مجموعات إحصائية. اختر فئة لبناء خريطة قابلة للمقارنة.", none: "لا تتوفر قيم إقليمية ذات مرساة خرائطية للمجموعة المختارة.", interpretation: "التفسير", interpretationText: "هذه خريطة كمية برموز متناسبة. لا تمثل الحدود الإدارية ولا تنسب قيماً إلى مناطق لا تتوفر عنها بيانات. راجع دائماً بطاقة المؤشر لمعرفة التعريف والمصدر وجودة البيانات.", record: "بطاقة المؤشر", eyebrow: "خريطة كمية · رموز متناسبة", mapDescription: "تتغير مساحة الدوائر بحسب القيمة. النقاط مراسي جغرافية تمثيلية وليست مراكز إحصائية. تعرض الخريطة مؤشراً واحداً ولا تجمع فئات مختلفة.", territoriesLabel: "أقاليم ممثلة" },
  zh: { kicker: "观察站 · 数据地理", title: "定量地图", intro: "按地区查看单一指标。当来源区分多个组别或类别时，请选择其中一个；不同定义的数据绝不会相加或叠加。", indicator: "指标", year: "年份", category: "组别 / 类别", select: "请选择", update: "更新地图", table: "表格", choose: "该指标区分多个统计组别。请选择一个类别，以生成可比较的地图。", none: "所选组合没有可用于地图定位的地区数据。", interpretation: "解读", interpretationText: "这是一张比例符号定量地图。它不表示行政边界，也不会给没有数据的区域赋值。有关定义、来源和数据质量，请始终查看指标页面。", record: "指标页面", eyebrow: "定量地图 · 比例符号", mapDescription: "圆的面积随数值变化。点位是代表性的地理锚点，而非统计质心。地图仅显示一个指标，不会合并不同类别。", territoriesLabel: "个地区" },
} as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ indicatore?: string; categoria?: string; anno?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/esplora/mappa`, languages: languageAlternates("/esplora/mappa") } };
}

export default async function LocalizedQuantitativeMapPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const query = await searchParams;
  const snapshot = await getExplorerSnapshot();
  const indicator = snapshot.indicators.find((item) => item.slug === query.indicatore) ?? snapshot.indicators[0];
  const indicatorValues = indicator ? snapshot.values.filter((value) => value.indicator_id === indicator.id) : [];
  const years = Array.from(new Set(indicatorValues.map((value) => String(new Date(value.period_start).getFullYear()))).sort((a, b) => Number(b) - Number(a));
  const selectedYear = query.anno && years.includes(query.anno) ? query.anno : years[0];

  const categoryMap = new Map<string, string>();
  for (const value of indicatorValues) {
    if (value.country_code && value.country_label) categoryMap.set(value.country_code, localizedTerritoryLabel(locale, value.country_code, value.country_label));
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => a[1].localeCompare(b[1], locale));
  const requiresCategory = categories.length > 1;
  const selectedCategory = requiresCategory
    ? categories.some(([code]) => code === query.categoria) ? query.categoria : null
    : categories[0]?.[0] ?? null;

  const filtered = indicatorValues.filter((value) => {
    if (selectedYear && String(new Date(value.period_start).getFullYear()) !== selectedYear) return false;
    if (requiresCategory && selectedCategory && value.country_code !== selectedCategory) return false;
    if (requiresCategory && !selectedCategory) return false;
    return Boolean(value.territory_code && coordinateForTerritoryCode(value.territory_code));
  });

  const translatedIndicator = indicator ? indicatorTranslation(locale, indicator.slug) : null;
  const mapRows = indicator ? filtered.map((value) => ({
    id: value.id,
    territoryCode: value.territory_code!,
    territoryLabel: localizedTerritoryLabel(locale, value.territory_code, value.territory_label),
    value: Number(value.numeric_value),
    formattedValue: formatExplorerValue(Number(value.numeric_value), indicator.unit_code, locale),
  })) : [];
  const indicatorTitle = translatedIndicator?.title ?? indicator?.title ?? "";
  const mapTitle = `${indicatorTitle}${selectedYear ? ` · ${selectedYear}` : ""}${selectedCategory ? ` · ${categoryMap.get(selectedCategory) ?? selectedCategory}` : ""}`;

  return (
    <main id="contenuto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>

      <form method="get" className="mt-8 grid gap-5 border border-black p-5 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">{m.indicator}
          <select name="indicatore" defaultValue={indicator?.slug ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            {snapshot.indicators.map((item) => <option key={item.id} value={item.slug}>{indicatorTranslation(locale, item.slug)?.title ?? item.title}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">{m.year}
          <select name="anno" defaultValue={selectedYear ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal">
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">{m.category}
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
        <section className="mt-8 border border-black p-6" aria-live="polite"><p className="max-w-3xl text-base leading-7 text-neutral-700">{m.choose}</p></section>
      ) : mapRows.length > 0 && indicator ? (
        <section className="mt-8"><QuantitativeTerritoryMap title={mapTitle} rows={mapRows} eyebrow={m.eyebrow} description={m.mapDescription} territoriesLabel={m.territoriesLabel} /></section>
      ) : (
        <section className="mt-8 border border-black p-6" aria-live="polite"><p className="max-w-3xl text-base leading-7 text-neutral-700">{m.none}</p></section>
      )}

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-xl font-semibold text-black">{m.interpretation}</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-neutral-700">{m.interpretationText}</p>
        {indicator ? <Link href={`/${locale}/osservatorio/${indicator.slug}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">{m.record} →</Link> : null}
      </section>
    </main>
  );
}
