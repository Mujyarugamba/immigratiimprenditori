import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { languageAlternates } from "@/lib/i18n/seo";
import { listHomeContents } from "@/lib/data/public/contents";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";

const metrics = {
  en: ["Indicators", "Data points", "Territories", "Sectors"],
  fr: ["Indicateurs", "Valeurs", "Territoires", "Secteurs"],
  es: ["Indicadores", "Valores", "Territorios", "Sectores"],
  de: ["Indikatoren", "Datenpunkte", "Regionen", "Branchen"],
  ar: ["المؤشرات", "نقاط البيانات", "الأقاليم", "القطاعات"],
  zh: ["指标", "数据点", "地区", "行业"],
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = CORE_MESSAGES[locale];
  return {
    title: m.homeTitle,
    description: m.homeIntro,
    alternates: { canonical: `/${locale}`, languages: languageAlternates("/") },
  };
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = CORE_MESSAGES[locale];
  const metricLabels = metrics[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const [snapshot, contents] = await Promise.all([
    getExplorerSnapshot().catch(() => null),
    listHomeContents(6).catch(() => []),
  ]);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <section className="grid gap-10 border-b border-black pb-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.homeKicker}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-6xl">{m.homeTitle}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-700">{m.homeIntro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/${locale}/osservatorio`} className="border border-black bg-black px-5 py-3 text-sm font-semibold text-white">{m.observatoryCta} {arrow}</Link>
            <Link href={`/${locale}/chi-siamo`} className="border border-black px-5 py-3 text-sm font-semibold">{m.aboutCta}</Link>
          </div>
        </div>

        <aside className="border border-black p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Immigrati Imprenditori</p>
          <dl className="mt-5 grid grid-cols-2 gap-px bg-black">
            <div className="bg-white p-4"><dt className="text-xs text-neutral-500">{metricLabels[0]}</dt><dd className="mt-1 text-2xl font-semibold">{snapshot?.indicators.length ?? "—"}</dd></div>
            <div className="bg-white p-4"><dt className="text-xs text-neutral-500">{metricLabels[1]}</dt><dd className="mt-1 text-2xl font-semibold">{snapshot?.values.length ?? "—"}</dd></div>
            <div className="bg-white p-4"><dt className="text-xs text-neutral-500">{metricLabels[2]}</dt><dd className="mt-1 text-2xl font-semibold">{snapshot?.territories.length ?? "—"}</dd></div>
            <div className="bg-white p-4"><dt className="text-xs text-neutral-500">{metricLabels[3]}</dt><dd className="mt-1 text-2xl font-semibold">{snapshot?.sectors.length ?? "—"}</dd></div>
          </dl>
        </aside>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4 border-b border-black pb-3">
          <h2 className="text-2xl font-semibold text-black">{m.latestResearch}</h2>
          <Link href={`/${locale}/contenuti`} className="text-sm font-semibold underline underline-offset-4">{arrow}</Link>
        </div>
        <p className="mt-4 text-sm leading-6 text-neutral-600">{m.originalLanguageNotice}</p>
        <div className="mt-5 grid gap-px border border-black bg-black md:grid-cols-3">
          {contents.slice(0, 6).map((item) => (
            <article key={item.id} className="flex min-h-56 flex-col bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{item.type_code.replaceAll("_", " ")}</p>
              <OriginalLanguageText as="h3" languageId={item.language_id} className="mt-2 text-lg font-semibold leading-6 text-black">{item.title}</OriginalLanguageText>
              {item.abstract ? <OriginalLanguageText languageId={item.language_id} className="mt-3 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</OriginalLanguageText> : <div className="flex-1" />}
              <Link href={`/${locale}/contenuti/${item.slug}`} className="mt-4 text-sm font-semibold underline underline-offset-4">{open} {arrow}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-px border border-black bg-black sm:grid-cols-3">
        <Link href={`/${locale}/esplora`} className="bg-white p-6 text-lg font-semibold">{m.exploreTitle} {arrow}</Link>
        <Link href={`/${locale}/contribuisci`} className="bg-white p-6 text-lg font-semibold">{m.participateTitle} {arrow}</Link>
        <Link href={`/${locale}/open-data`} className="bg-white p-6 text-lg font-semibold">{m.openData} {arrow}</Link>
      </section>
    </main>
  );
}
