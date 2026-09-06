import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { searchPublicSite, type SearchResultKind } from "@/lib/data/public/search";
import { presentLocalizedContentByHrefs } from "@/lib/i18n/ai-translation/runtime";
import { isPlatformLocale } from "@/lib/i18n/config";
import { eventTranslation, indicatorTranslation } from "@/lib/i18n/public-entity-translations";
import { sectorTranslation } from "@/lib/i18n/sector-translations";
import { languageAlternates } from "@/lib/i18n/seo";

const text = {
  en: { title: "Search", intro: "Search published editorial content, Observatory data and the public knowledge network at the same time.", label: "Search the Research Centre", placeholder: "E.g. Lombardy, self-employment, credit…", button: "Search", min: "Enter at least two characters.", results: "Results for", none: "No published result matches this search.", kinds: { content: "Content", indicator: "Indicator", event: "Event", country: "Country", territory: "Territory", sector: "Sector", route: "Route", author: "Author", source: "Source" } },
  fr: { title: "Rechercher", intro: "Recherchez simultanément dans les contenus publiés, les données de l'Observatoire et le réseau public de connaissances.", label: "Rechercher dans le Centre d'études", placeholder: "Ex. Lombardie, travail indépendant, crédit…", button: "Rechercher", min: "Saisissez au moins deux caractères.", results: "Résultats pour", none: "Aucun résultat publié ne correspond à cette recherche.", kinds: { content: "Contenu", indicator: "Indicateur", event: "Événement", country: "Pays", territory: "Territoire", sector: "Secteur", route: "Route", author: "Auteur", source: "Source" } },
  es: { title: "Buscar", intro: "Busca al mismo tiempo entre contenidos publicados, datos del Observatorio y la red pública de conocimiento.", label: "Buscar en el Centro de Estudios", placeholder: "Ej. Lombardía, trabajo autónomo, crédito…", button: "Buscar", min: "Introduce al menos dos caracteres.", results: "Resultados para", none: "Ningún resultado publicado coincide con esta búsqueda.", kinds: { content: "Contenido", indicator: "Indicador", event: "Evento", country: "País", territory: "Territorio", sector: "Sector", route: "Ruta", author: "Autor", source: "Fuente" } },
  de: { title: "Suchen", intro: "Durchsuchen Sie gleichzeitig veröffentlichte Inhalte, Daten des Observatoriums und das öffentliche Wissensnetz.", label: "Im Studienzentrum suchen", placeholder: "Z. B. Lombardei, Selbstständigkeit, Kredit…", button: "Suchen", min: "Geben Sie mindestens zwei Zeichen ein.", results: "Ergebnisse für", none: "Keine veröffentlichten Ergebnisse entsprechen dieser Suche.", kinds: { content: "Inhalt", indicator: "Indikator", event: "Veranstaltung", country: "Land", territory: "Gebiet", sector: "Sektor", route: "Route", author: "Autor", source: "Quelle" } },
  ar: { title: "بحث", intro: "ابحث في الوقت نفسه ضمن المحتوى المنشور وبيانات المرصد وشبكة المعرفة العامة.", label: "البحث في مركز الدراسات", placeholder: "مثال: لومبارديا، العمل الحر، الائتمان…", button: "بحث", min: "أدخل حرفين على الأقل.", results: "نتائج البحث عن", none: "لا توجد نتائج منشورة مطابقة لهذا البحث.", kinds: { content: "محتوى", indicator: "مؤشر", event: "فعالية", country: "دولة", territory: "إقليم", sector: "قطاع", route: "مسار", author: "مؤلف", source: "مصدر" } },
  zh: { title: "搜索", intro: "同时搜索已发布内容、观察站数据和公共知识网络。", label: "搜索研究中心", placeholder: "例如：伦巴第、自雇、信贷……", button: "搜索", min: "请至少输入两个字符。", results: "搜索结果", none: "没有已发布内容与此搜索匹配。", kinds: { content: "内容", indicator: "指标", event: "活动", country: "国家", territory: "地区", sector: "行业", route: "路线", author: "作者", source: "来源" } },
} as const satisfies Record<string, { title:string; intro:string; label:string; placeholder:string; button:string; min:string; results:string; none:string; kinds:Record<SearchResultKind,string> }>;

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, robots: { index: false, follow: true }, alternates: { canonical: `/${locale}/cerca`, languages: languageAlternates("/cerca") } };
}

function localizedEntityHref(locale: Exclude<Parameters<typeof indicatorTranslation>[0], never>, kind: SearchResultKind, href: string) {
  if (kind === "indicator") {
    const slug = href.match(/\/osservatorio\/([^/?#]+)/)?.[1];
    return slug ? `/${locale}/osservatorio/${slug}` : `/${locale}/osservatorio`;
  }
  if (kind === "event") {
    const id = href.match(/\/eventi\/([^/?#]+)/)?.[1];
    return id ? `/${locale}/eventi/${id}` : `/${locale}/eventi`;
  }
  if (kind === "sector") return `/${locale}/esplora/settori`;
  if (kind === "source") return `/${locale}/fonti`;
  if (kind === "territory" || kind === "country" || kind === "route") return `/${locale}/esplora/territori`;
  if (kind === "author") return `/${locale}/contenuti`;
  return href;
}

export default async function LocalizedSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const query = await searchParams;
  const q = (query.q ?? "").trim();
  const results = q.length >= 2 ? await searchPublicSite(q) : [];
  const presentedBySlug = await presentLocalizedContentByHrefs(results.filter((result) => result.kind === "content").map((result) => result.href), locale);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p></header>
      <form method="get" className="mt-8 flex max-w-3xl gap-3"><label className="sr-only" htmlFor="site-search-localized">{m.label}</label><input id="site-search-localized" name="q" type="search" minLength={2} maxLength={160} defaultValue={q} placeholder={m.placeholder} className="min-w-0 flex-1 border border-black px-4 py-3"/><button type="submit" className="border border-black bg-black px-5 py-3 text-sm font-semibold text-white">{m.button}</button></form>
      {q.length > 0 && q.length < 2 ? <p className="mt-5 text-sm text-neutral-600">{m.min}</p> : null}
      {q.length >= 2 ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-black pb-3"><h2 className="text-2xl font-semibold text-black">{m.results} “{q}”</h2><span className="text-sm text-neutral-600">{results.length}</span></div>
          <div className="divide-y divide-neutral-300">
            {results.map((result) => {
              const contentSlug = result.kind === "content" ? result.href.match(/\/contenuti\/([^/?#]+)/)?.[1] : null;
              const presented = contentSlug ? presentedBySlug.get(contentSlug) : undefined;
              let title = presented?.title ?? result.title;
              let excerpt = presented ? presented.abstract : result.excerpt;
              let href = presented && contentSlug ? `/${locale}/contenuti/${presented.slug}` : localizedEntityHref(locale, result.kind, result.href);
              let languageCode = presented?.displayLanguageCode;
              if (result.kind === "indicator") {
                const slug = result.href.match(/\/osservatorio\/([^/?#]+)/)?.[1];
                const translated = slug ? indicatorTranslation(locale, slug) : null;
                if (translated) { title = translated.title; excerpt = translated.description; languageCode = locale; }
              } else if (result.kind === "event") {
                const id = result.href.match(/\/eventi\/([^/?#]+)/)?.[1];
                const translated = id ? eventTranslation(locale, id) : null;
                if (translated) { title = translated.title; excerpt = translated.summary; languageCode = locale; }
              } else if (result.kind === "sector") {
                const slug = result.href.match(/\/settori\/([^/?#]+)/)?.[1];
                const translated = slug ? sectorTranslation(locale, slug) : null;
                if (translated) { title = translated.name; excerpt = translated.description; languageCode = locale; }
              }
              return (
                <article key={`${result.kind}-${result.href}`} className="py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{m.kinds[result.kind]}</p>
                  <h3 className="mt-2 text-xl font-semibold text-black"><Link href={href} className="underline-offset-4 hover:underline"><OriginalLanguageText as="span" languageCode={languageCode}>{title}</OriginalLanguageText></Link></h3>
                  {excerpt ? <OriginalLanguageText languageCode={languageCode} className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{excerpt}</OriginalLanguageText> : null}
                  {presented?.isAiTranslation ? <EditorialTranslationNotice locale={locale} sourceLanguageId={presented.language_id} displayLanguageCode={presented.displayLanguageCode} isAiTranslation isViewingOriginal={false} originalHref={`/${locale}/contenuti/${presented.slug}?original=1`} translationHref={`/${locale}/contenuti/${presented.slug}`} compact /> : null}
                </article>
              );
            })}
            {results.length === 0 ? <p className="py-8 text-neutral-600">{m.none}</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
