import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { HOME_V4_MESSAGES } from "@/lib/i18n/home-v4";
import { languageAlternates } from "@/lib/i18n/seo";
import { listHomeContents } from "@/lib/data/public/contents";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { presentLocalizedContentCards } from "@/lib/i18n/ai-translation/runtime";

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
  const v4 = HOME_V4_MESSAGES[locale];
  const metricLabels = metrics[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const [snapshot, contents] = await Promise.all([
    getExplorerSnapshot().catch(() => null),
    listHomeContents(6).catch(() => []),
  ]);
  const presented = await presentLocalizedContentCards(contents, locale).catch(() =>
    contents.map((item) => ({
      ...item,
      title: item.title,
      subtitle: null,
      abstract: item.abstract,
      body: "",
      displayLanguageCode: "und",
      sourceLanguageCode: "und",
      isAiTranslation: false,
      isViewingOriginal: false,
      openaiCalls: 0,
      writes: 0,
      usage: { inputTokens: null, outputTokens: null },
    })),
  );

  return (
    <>
      <link rel="stylesheet" href="/home-light-v1.css" />
      <link rel="stylesheet" href="/home-motion-v3.css" />
      <link rel="stylesheet" href="/home-motion-v4.css" />

      <main id="contenuto" className="localized-home-v4">
        <section className="preview-hero-v4" aria-labelledby="localized-preview-hero-title">
          <div className="preview-v4-media" aria-hidden="true">
            <video
              className="preview-v4-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="https://images.pexels.com/photos/34164499/pexels-photo-34164499.jpeg?auto=compress&cs=tinysrgb&w=2000"
              tabIndex={-1}
            >
              <source src="https://www.pexels.com/download/video/8869632/" type="video/mp4" />
            </video>
          </div>
          <div className="preview-v4-veil" aria-hidden="true" />

          <div className="preview-v4-meta" aria-hidden="true">
            <span>{v4.metaLeft}</span>
            <span>{v4.metaRight}</span>
          </div>

          <div className="preview-v4-payoff" dir={locale === "ar" ? "rtl" : "ltr"}>
            <h1 id="localized-preview-hero-title">
              <span className="preview-v4-line preview-v4-line-a">{v4.lineA}</span>
              <span className="preview-v4-line preview-v4-line-b"><em>{v4.lineB}</em></span>
            </h1>
          </div>

          <div className="site-container preview-v4-bottom">
            <p>{v4.summary}</p>
            <nav className="preview-v4-actions" aria-label={v4.metaLeft}>
              <Link href={`/${locale}/osservatorio`}>{v4.observatory} {arrow}</Link>
              <Link href={`/${locale}/contenuti`}>{v4.research} {arrow}</Link>
            </nav>
          </div>
          <span className="preview-v4-scroll" aria-hidden="true">{v4.scroll}</span>
        </section>

        <div className="preview-motion-rail" aria-label={v4.railLabel}>
          <div className="preview-motion-track">
            {[...v4.topics, ...v4.topics].map((topic, index) => (
              <span key={`${topic}-${index}`} aria-hidden={index >= v4.topics.length ? "true" : undefined}>
                {topic}<b aria-hidden="true">✦</b>
              </span>
            ))}
          </div>
        </div>

        <section className="localized-home-snapshot">
          <div className="localized-home-snapshot-head">
            <div>
              <p className="eyebrow">{v4.snapshotKicker}</p>
              <h2>{v4.snapshotTitle}</h2>
            </div>
            <p>{v4.snapshotIntro}</p>
          </div>
          <dl className="localized-home-metrics">
            <div><dt>{metricLabels[0]}</dt><dd>{snapshot?.indicators.length ?? "—"}</dd></div>
            <div><dt>{metricLabels[1]}</dt><dd>{snapshot?.values.length ?? "—"}</dd></div>
            <div><dt>{metricLabels[2]}</dt><dd>{snapshot?.territories.length ?? "—"}</dd></div>
            <div><dt>{metricLabels[3]}</dt><dd>{snapshot?.sectors.length ?? "—"}</dd></div>
          </dl>
        </section>

        <section className="localized-home-research">
          <div className="localized-home-section-title">
            <h2>{m.latestResearch}</h2>
            <Link href={`/${locale}/contenuti`}>{open} {arrow}</Link>
          </div>
          {presented.some((item) => !item.isAiTranslation) ? (
            <p className="localized-home-original-note">{m.originalLanguageNotice}</p>
          ) : null}
          <div className="localized-home-grid">
            {presented.slice(0, 6).map((item) => (
              <article key={item.id} className="localized-home-card">
                <p>{item.type_code.replaceAll("_", " ")}</p>
                <OriginalLanguageText as="h3" languageCode={item.displayLanguageCode}>
                  <Link href={`/${locale}/contenuti/${item.slug}`}>{item.title}</Link>
                </OriginalLanguageText>
                {item.abstract ? (
                  <OriginalLanguageText languageCode={item.displayLanguageCode} className="localized-home-card-copy">{item.abstract}</OriginalLanguageText>
                ) : <div className="localized-home-card-copy" />}
                {item.isAiTranslation ? (
                  <EditorialTranslationNotice
                    locale={locale}
                    sourceLanguageId={item.language_id}
                    displayLanguageCode={item.displayLanguageCode}
                    isAiTranslation
                    isViewingOriginal={false}
                    originalHref={`/${locale}/contenuti/${item.slug}?original=1`}
                    translationHref={`/${locale}/contenuti/${item.slug}`}
                    compact
                  />
                ) : null}
                <Link href={`/${locale}/contenuti/${item.slug}`}>{open} {arrow}</Link>
              </article>
            ))}
          </div>
        </section>

        <nav className="localized-home-paths" aria-label={m.exploreTitle}>
          <Link href={`/${locale}/esplora`}>{m.exploreTitle} {arrow}</Link>
          <Link href={`/${locale}/contribuisci`}>{m.participateTitle} {arrow}</Link>
          <Link href={`/${locale}/open-data`}>{m.openData} {arrow}</Link>
        </nav>
      </main>
    </>
  );
}
