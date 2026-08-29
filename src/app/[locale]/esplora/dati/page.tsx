import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatExplorerValue, getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";

const text = {
  en: { kicker: "Observatory · Explore", title: "Data Explorer", intro: "Filter values already published by the Research Centre. Definitions and comparability depend on each indicator page; values from different indicators must not be added automatically.", indicator: "Indicator", territory: "Territory", year: "Year", all: "All", filter: "Filter", reset: "Reset", values: "Values", results: "results", category: "Group / category", period: "Period", value: "Value", quality: "Quality", none: "No values match the selected filters.", note: "The Data Explorer does not replace the methodological record. Citizenship, place of birth, foreign enterprise and self-employment describe different statistical populations." },
  fr: { kicker: "Observatoire · Explorer", title: "Explorateur de données", intro: "Filtrez les valeurs déjà publiées par le Centre d'études. Les définitions et la comparabilité dépendent de chaque fiche indicateur ; les valeurs d'indicateurs différents ne doivent pas être additionnées automatiquement.", indicator: "Indicateur", territory: "Territoire", year: "Année", all: "Tous", filter: "Filtrer", reset: "Réinitialiser", values: "Valeurs", results: "résultats", category: "Groupe / catégorie", period: "Période", value: "Valeur", quality: "Qualité", none: "Aucune valeur ne correspond aux filtres sélectionnés.", note: "L'Explorateur de données ne remplace pas la fiche méthodologique. Citoyenneté, lieu de naissance, entreprise étrangère et travail indépendant décrivent des populations statistiques différentes." },
  es: { kicker: "Observatorio · Explorar", title: "Explorador de datos", intro: "Filtra los valores ya publicados por el Centro de Estudios. Las definiciones y la comparabilidad dependen de cada ficha de indicador; los valores de indicadores diferentes no deben sumarse automáticamente.", indicator: "Indicador", territory: "Territorio", year: "Año", all: "Todos", filter: "Filtrar", reset: "Restablecer", values: "Valores", results: "resultados", category: "Grupo / categoría", period: "Periodo", value: "Valor", quality: "Calidad", none: "Ningún valor coincide con los filtros seleccionados.", note: "El Explorador de datos no sustituye la ficha metodológica. Ciudadanía, lugar de nacimiento, empresa extranjera y trabajo autónomo describen poblaciones estadísticas diferentes." },
  de: { kicker: "Observatorium · Entdecken", title: "Daten-Explorer", intro: "Filtern Sie bereits vom Studienzentrum veröffentlichte Werte. Definitionen und Vergleichbarkeit richten sich nach der jeweiligen Indikatorseite; Werte unterschiedlicher Indikatoren dürfen nicht automatisch addiert werden.", indicator: "Indikator", territory: "Region", year: "Jahr", all: "Alle", filter: "Filtern", reset: "Zurücksetzen", values: "Werte", results: "Ergebnisse", category: "Gruppe / Kategorie", period: "Zeitraum", value: "Wert", quality: "Qualität", none: "Keine Werte entsprechen den gewählten Filtern.", note: "Der Daten-Explorer ersetzt nicht die methodische Dokumentation. Staatsangehörigkeit, Geburtsort, ausländisches Unternehmen und Selbstständigkeit beschreiben unterschiedliche statistische Populationen." },
  ar: { kicker: "المرصد · استكشف", title: "مستكشف البيانات", intro: "صفِّ القيم التي نشرها مركز الدراسات بالفعل. تعتمد التعريفات وقابلية المقارنة على صفحة كل مؤشر، ولا ينبغي جمع قيم مؤشرات مختلفة تلقائياً.", indicator: "المؤشر", territory: "الإقليم", year: "السنة", all: "الكل", filter: "تصفية", reset: "إعادة ضبط", values: "القيم", results: "نتائج", category: "المجموعة / الفئة", period: "الفترة", value: "القيمة", quality: "الجودة", none: "لا توجد قيم تطابق عوامل التصفية المحددة.", note: "لا يحل مستكشف البيانات محل السجل المنهجي. فالجنسية ومكان الميلاد والمنشأة الأجنبية والعمل الحر تصف مجموعات إحصائية مختلفة." },
  zh: { kicker: "观察站 · 探索", title: "数据探索器", intro: "筛选研究中心已经发布的数据值。定义和可比性取决于各指标页面；不同指标的数据不能自动相加。", indicator: "指标", territory: "地区", year: "年份", all: "全部", filter: "筛选", reset: "重置", values: "数据值", results: "项结果", category: "组别 / 类别", period: "时期", value: "数值", quality: "质量", none: "没有数据符合所选筛选条件。", note: "数据探索器不能替代方法说明。国籍、出生地、外国企业和自雇描述的是不同的统计总体。" },
} as const;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ indicatore?: string; territorio?: string; anno?: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/esplora/dati`, languages: languageAlternates("/esplora/dati") } };
}

export default async function LocalizedDataExplorerPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const filters = await searchParams;
  const snapshot = await getExplorerSnapshot();
  const indicatorMap = new Map(snapshot.indicators.map((item) => [item.id, item]));
  const years = Array.from(new Set(snapshot.values.map((value) => new Date(value.period_start).getFullYear()))).sort((a, b) => b - a);
  const filtered = snapshot.values.filter((value) => {
    const indicator = indicatorMap.get(value.indicator_id);
    if (!indicator) return false;
    if (filters.indicatore && indicator.slug !== filters.indicatore) return false;
    if (filters.territorio && value.territory_code !== filters.territorio) return false;
    if (filters.anno && String(new Date(value.period_start).getFullYear()) !== filters.anno) return false;
    return true;
  });

  return (
    <main id="contenuto" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>

      <form className="mt-8 grid gap-5 border border-black p-5 md:grid-cols-4" method="get">
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">{m.indicator}<select name="indicatore" defaultValue={filters.indicatore ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal"><option value="">{m.all}</option>{snapshot.indicators.map((indicator) => <option key={indicator.id} value={indicator.slug}>{indicator.title}</option>)}</select></label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">{m.territory}<select name="territorio" defaultValue={filters.territorio ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal"><option value="">{m.all}</option>{snapshot.territories.filter((territory) => territory.code).map((territory) => <option key={`${territory.level}-${territory.code}-${territory.label}`} value={territory.code ?? ""}>{territory.label}</option>)}</select></label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-black">{m.year}<select name="anno" defaultValue={filters.anno ?? ""} className="border border-neutral-400 bg-white px-3 py-2.5 font-normal"><option value="">{m.all}</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
        <div className="flex items-end gap-3"><button type="submit" className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white">{m.filter}</button><Link href={`/${locale}/esplora/dati`} className="px-2 py-2.5 text-sm underline underline-offset-4">{m.reset}</Link></div>
      </form>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-black pb-3"><h2 className="text-2xl font-semibold text-black">{m.values}</h2><span className="text-sm text-neutral-600">{filtered.length} {m.results}</span></div>
      <div className="mt-5 overflow-x-auto border border-black">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100 text-black"><tr><th className="border-b border-black px-4 py-3">{m.indicator}</th><th className="border-b border-black px-4 py-3">{m.territory}</th><th className="border-b border-black px-4 py-3">{m.category}</th><th className="border-b border-black px-4 py-3">{m.period}</th><th className="border-b border-black px-4 py-3 text-right">{m.value}</th><th className="border-b border-black px-4 py-3">{m.quality}</th></tr></thead>
          <tbody>
            {filtered.map((value) => { const indicator = indicatorMap.get(value.indicator_id)!; return <tr key={value.id} className="border-b border-neutral-300 last:border-b-0"><td className="px-4 py-3 align-top"><Link href={`/osservatorio/${indicator.slug}`} className="font-semibold underline underline-offset-4"><OriginalLanguageText as="span">{indicator.title}</OriginalLanguageText></Link></td><td className="px-4 py-3 align-top"><OriginalLanguageText as="span">{value.territory_label ?? "—"}</OriginalLanguageText></td><td className="px-4 py-3 align-top"><OriginalLanguageText as="span">{value.country_label ?? "—"}</OriginalLanguageText></td><td className="px-4 py-3 align-top">{value.period_start === value.period_end ? value.period_start : `${value.period_start} → ${value.period_end}`}</td><td className="px-4 py-3 text-right align-top font-semibold">{formatExplorerValue(Number(value.numeric_value), indicator.unit_code, locale)}</td><td className="px-4 py-3 align-top">{value.quality_code}</td></tr>; })}
            {filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-600">{m.none}</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="mt-5 max-w-4xl text-sm leading-6 text-neutral-600">{m.note}</p>
    </main>
  );
}
