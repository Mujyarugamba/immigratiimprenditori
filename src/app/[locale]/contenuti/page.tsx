import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { listPublicContents } from "@/lib/data/public/contents";
import { presentLocalizedContentCards } from "@/lib/i18n/ai-translation/runtime";
import { contentTypeLabel, resultCountLabel } from "@/lib/i18n/archive-labels";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { isPlatformLocale } from "@/lib/i18n/config";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { EDITORIAL_VISUAL_COPY } from "@/lib/i18n/editorial-visual";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { languageAlternates } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const descriptions = {
  en: "Published analysis, research, interviews and documented stories from the Research Centre.",
  fr: "Analyses, recherches, entretiens et récits documentés publiés par le Centre d'études.",
  es: "Análisis, investigaciones, entrevistas e historias documentadas publicadas por el Centro de Estudios.",
  de: "Veröffentlichte Analysen, Forschung, Interviews und dokumentierte Geschichten des Studienzentrums.",
  ar: "تحليلات وأبحاث ومقابلات وقصص موثقة منشورة من مركز الدراسات.",
  zh: "研究中心发布的分析、研究、访谈和经记录的创业故事。",
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  return {
    title: NAV_MESSAGES[locale].analysis,
    description: descriptions[locale],
    alternates: { canonical: `/${locale}/contenuti`, languages: languageAlternates("/contenuti") },
    ...pageSocialMetadata({ title: NAV_MESSAGES[locale].analysis, description: descriptions[locale], pathname: `/${locale}/contenuti` }),
  };
}

export default async function LocalizedContentsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const result = await listPublicContents();
  const presented = await presentLocalizedContentCards(result.items, locale);
  const visual = EDITORIAL_VISUAL_COPY[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const core = CORE_MESSAGES[locale];

  return (
    <main id="contenuto" className="public-list-page">
      <section className="public-page-hero-shell">
        <Container className="public-list-container">
          <PublicPageHeader title={NAV_MESSAGES[locale].analysis} description={descriptions[locale]} kicker={visual.kicker} motionWords={visual.motionWords} />
        </Container>
      </section>
      <Section className="public-list-section">
        <Container className="public-list-container">
          {presented.some((item) => !item.isAiTranslation) ? <p className="mb-5 max-w-3xl text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p> : null}
          <p className="public-results-count">{resultCountLabel(locale, result.total)}</p>
          <div className="public-results-grid">
            {presented.map((item) => (
              <PublicResultCard
                key={item.id}
                href={`/${locale}/contenuti/${item.slug}`}
                title={item.title}
                description={item.abstract}
                badges={[contentTypeLabel(locale, item.type_code)]}
                ctaLabel={open}
                ctaArrow={arrow}
                notice={item.isAiTranslation ? (
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
              />
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
