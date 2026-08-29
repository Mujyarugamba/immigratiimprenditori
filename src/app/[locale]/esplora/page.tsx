import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";

const moduleText = {
  en: ["Published Observatory values", "Territories represented in published data", "Economic-sector taxonomy", "Statistical sources used by the Observatory", "Methodological definitions", "Machine-readable public data"],
  fr: ["Valeurs publiées de l'Observatoire", "Territoires représentés dans les données publiées", "Taxonomie des secteurs économiques", "Sources statistiques de l'Observatoire", "Définitions méthodologiques", "Données publiques lisibles par machine"],
  es: ["Valores publicados del Observatorio", "Territorios presentes en los datos publicados", "Taxonomía de sectores económicos", "Fuentes estadísticas del Observatorio", "Definiciones metodológicas", "Datos públicos legibles por máquina"],
  de: ["Veröffentlichte Werte des Observatoriums", "Gebiete in veröffentlichten Daten", "Branchenklassifikation", "Statistische Quellen des Observatoriums", "Methodische Definitionen", "Maschinenlesbare öffentliche Daten"],
  ar: ["القيم المنشورة في المرصد", "الأقاليم الموجودة في البيانات المنشورة", "تصنيف القطاعات الاقتصادية", "المصادر الإحصائية للمرصد", "التعريفات المنهجية", "بيانات عامة قابلة للقراءة آلياً"],
  zh: ["观察站已发布的数据值", "已发布数据中的地区", "经济行业分类", "观察站使用的统计来源", "方法学定义", "机器可读的开放数据"],
} as const;

const metricText = {
  en: ["Indicators", "Data points", "Territories", "Sectors", "Open"],
  fr: ["Indicateurs", "Valeurs", "Territoires", "Secteurs", "Ouvrir"],
  es: ["Indicadores", "Valores", "Territorios", "Sectores", "Abrir"],
  de: ["Indikatoren", "Datenpunkte", "Regionen", "Branchen", "Öffnen"],
  ar: ["المؤشرات", "نقاط البيانات", "الأقاليم", "القطاعات", "فتح"],
  zh: ["指标", "数据点", "地区", "行业", "打开"],
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = CORE_MESSAGES[locale];
  return { title: m.exploreTitle, description: m.exploreIntro, alternates: { canonical: `/${locale}/esplora`, languages: languageAlternates("/esplora") } };
}

export default async function LocalizedExplorePage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = CORE_MESSAGES[locale];
  const snapshot = await getExplorerSnapshot();
  const texts = moduleText[locale];
  const metrics = metricText[locale];
  const arrow = localizedCtaArrow(locale);
  const modules = [
    { title: m.dataExplorer, text: texts[0], href: `/${locale}/esplora/dati` },
    { title: m.territories, text: texts[1], href: `/${locale}/esplora/territori` },
    { title: m.sectors, text: texts[2], href: `/${locale}/esplora/settori` },
    { title: m.sources, text: texts[3], href: `/${locale}/fonti` },
    { title: m.glossary, text: texts[4], href: `/${locale}/glossario` },
    { title: m.openData, text: texts[5], href: `/${locale}/open-data` },
  ];

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.exploreTitle}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.exploreIntro}</p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-4">
        <div className="bg-white p-5"><strong className="text-3xl">{snapshot.indicators.length}</strong><p className="mt-2 text-xs text-neutral-500">{metrics[0]}</p></div>
        <div className="bg-white p-5"><strong className="text-3xl">{snapshot.values.length}</strong><p className="mt-2 text-xs text-neutral-500">{metrics[1]}</p></div>
        <div className="bg-white p-5"><strong className="text-3xl">{snapshot.territories.length}</strong><p className="mt-2 text-xs text-neutral-500">{metrics[2]}</p></div>
        <div className="bg-white p-5"><strong className="text-3xl">{snapshot.sectors.length}</strong><p className="mt-2 text-xs text-neutral-500">{metrics[3]}</p></div>
      </section>

      <section className="mt-8 grid gap-px border border-black bg-black md:grid-cols-3">
        {modules.map((module) => (
          <article key={module.href} className="flex min-h-52 flex-col bg-white p-6">
            <h2 className="text-xl font-semibold text-black">{module.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-neutral-700">{module.text}</p>
            <Link href={module.href} className="mt-5 text-sm font-semibold underline underline-offset-4">{metrics[4]} {arrow}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
