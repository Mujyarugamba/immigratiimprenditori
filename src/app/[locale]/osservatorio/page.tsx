import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { listPublicIndicators } from "@/lib/data/public/observatory";
import { isPlatformLocale } from "@/lib/i18n/config";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { EDITORIAL_VISUAL_COPY } from "@/lib/i18n/editorial-visual";
import { resultCountLabel } from "@/lib/i18n/archive-labels";
import { indicatorTranslation } from "@/lib/i18n/public-entity-translations";
import { TRANSLATION_FALLBACK_NOTICE } from "@/lib/i18n/translation-note";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const descriptions = {
  en: "Published indicators from the Observatory, with definitions, sources, periods and methodology.",
  fr: "Indicateurs publiés par l'Observatoire, avec définitions, sources, périodes et méthodologie.",
  es: "Indicadores publicados por el Observatorio, con definiciones, fuentes, periodos y metodología.",
  de: "Veröffentlichte Indikatoren des Observatoriums mit Definitionen, Quellen, Zeiträumen und Methodik.",
  ar: "مؤشرات منشورة من المرصد مع التعريفات والمصادر والفترات والمنهجية.",
  zh: "观察站已发布的指标，包括定义、来源、时期和方法说明。",
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  return {
    title: NAV_MESSAGES[locale].observatory,
    description: descriptions[locale],
    alternates: { canonical: `/${locale}/osservatorio`, languages: languageAlternates("/osservatorio") },
    ...pageSocialMetadata({ title: NAV_MESSAGES[locale].observatory, description: descriptions[locale], pathname: `/${locale}/osservatorio` }),
  };
}

export default async function LocalizedObservatoryPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const result = await listPublicIndicators();
  const visual = EDITORIAL_VISUAL_COPY[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const missingTranslation = result.items.some((indicator) => !indicatorTranslation(locale, indicator.slug));

  return (
    <main id="contenuto" className="public-list-page">
      <section className="public-page-hero-shell">
        <Container className="public-list-container">
          <PublicPageHeader title={NAV_MESSAGES[locale].observatory} description={descriptions[locale]} kicker={visual.kicker} motionWords={visual.motionWords} />
        </Container>
      </section>
      <Section className="public-list-section">
        <Container className="public-list-container">
          {missingTranslation ? <p className="mb-5 max-w-3xl text-sm leading-6 text-neutral-600">{TRANSLATION_FALLBACK_NOTICE[locale]}</p> : null}
          <p className="public-results-count">{resultCountLabel(locale, result.total)}</p>
          <div className="public-results-grid">
            {result.items.map((indicator) => {
              const translated = indicatorTranslation(locale, indicator.slug);
              return (
                <PublicResultCard
                  key={indicator.id}
                  href={`/${locale}/osservatorio/${indicator.slug}`}
                  title={translated?.title ?? indicator.title}
                  description={translated?.description ?? indicator.description}
                  meta={[indicator.code]}
                  ctaLabel={open}
                  ctaArrow={arrow}
                />
              );
            })}
          </div>
        </Container>
      </Section>
    </main>
  );
}
