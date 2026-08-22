import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { searchPublicSite } from "@/lib/data/public/search";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";

const text = {
  en: { title: "Search", intro: "Search published editorial content, Observatory indicators and events at the same time.", label: "Search the Research Centre", placeholder: "E.g. Lombardy, self-employment, credit…", button: "Search", min: "Enter at least two characters.", results: "Results for", none: "No published result matches this search.", content: "Content", indicator: "Indicator", event: "Event" },
  fr: { title: "Rechercher", intro: "Recherchez simultanément dans les contenus éditoriaux publiés, les indicateurs de l'Observatoire et les événements.", label: "Rechercher dans le Centre d'études", placeholder: "Ex. Lombardie, travail indépendant, crédit…", button: "Rechercher", min: "Saisissez au moins deux caractères.", results: "Résultats pour", none: "Aucun résultat publié ne correspond à cette recherche.", content: "Contenu", indicator: "Indicateur", event: "Événement" },
  es: { title: "Buscar", intro: "Busca al mismo tiempo entre contenidos editoriales publicados, indicadores del Observatorio y eventos.", label: "Buscar en el Centro de Estudios", placeholder: "Ej. Lombardía, trabajo autónomo, crédito…", button: "Buscar", min: "Introduce al menos dos caracteres.", results: "Resultados para", none: "Ningún resultado publicado coincide con esta búsqueda.", content: "Contenido", indicator: "Indicador", event: "Evento" },
  de: { title: "Suchen", intro: "Durchsuchen Sie gleichzeitig veröffentlichte redaktionelle Inhalte, Indikatoren des Observatoriums und Veranstaltungen.", label: "Im Studienzentrum suchen", placeholder: "Z. B. Lombardei, Selbstständigkeit, Kredit…", button: "Suchen", min: "Geben Sie mindestens zwei Zeichen ein.", results: "Ergebnisse für", none: "Keine veröffentlichten Ergebnisse entsprechen dieser Suche.", content: "Inhalt", indicator: "Indikator", event: "Veranstaltung" },
  ar: { title: "بحث", intro: "ابحث في الوقت نفسه ضمن المحتوى التحريري المنشور ومؤشرات المرصد والفعاليات.", label: "البحث في مركز الدراسات", placeholder: "مثال: لومبارديا، العمل الحر، الائتمان…", button: "بحث", min: "أدخل حرفين على الأقل.", results: "نتائج البحث عن", none: "لا توجد نتائج منشورة مطابقة لهذا البحث.", content: "محتوى", indicator: "مؤشر", event: "فعالية" },
  zh: { title: "搜索", intro: "同时搜索已发布的编辑内容、观察站指标和活动。", label: "搜索研究中心", placeholder: "例如：伦巴第、自雇、信贷……", button: "搜索", min: "请至少输入两个字符。", results: "搜索结果", none: "没有已发布内容与此搜索匹配。", content: "内容", indicator: "指标", event: "活动" },
} as const;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, robots: { index: false, follow: true }, alternates: { canonical: `/${locale}/cerca`, languages: languageAlternates("/cerca") } };
}

export default async function LocalizedSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const query = await searchParams;
  const q = (query.q ?? "").trim();
  const results = q.length >= 2 ? await searchPublicSite(q) : [];
  const kinds = { content: m.content, indicator: m.indicator, event: m.event } as const;

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>
      <form method="get" className="mt-8 flex max-w-3xl gap-3">
        <label className="sr-only" htmlFor="site-search-localized">{m.label}</label>
        <input id="site-search-localized" name="q" type="search" minLength={2} maxLength={160} defaultValue={q} placeholder={m.placeholder} className="min-w-0 flex-1 border border-black px-4 py-3" />
        <button type="submit" className="border border-black bg-black px-5 py-3 text-sm font-semibold text-white">{m.button}</button>
      </form>
      {q.length > 0 && q.length < 2 ? <p className="mt-5 text-sm text-neutral-600">{m.min}</p> : null}
      {q.length >= 2 ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-black pb-3">
            <h2 className="text-2xl font-semibold text-black">{m.results} “{q}”</h2><span className="text-sm text-neutral-600">{results.length}</span>
          </div>
          <div className="divide-y divide-neutral-300">
            {results.map((result) => (
              <article key={`${result.kind}-${result.href}`} className="py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{kinds[result.kind]}</p>
                <h3 className="mt-2 text-xl font-semibold text-black"><Link href={result.href} className="underline-offset-4 hover:underline">{result.title}</Link></h3>
                {result.excerpt ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{result.excerpt}</p> : null}
              </article>
            ))}
            {results.length === 0 ? <p className="py-8 text-neutral-600">{m.none}</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
