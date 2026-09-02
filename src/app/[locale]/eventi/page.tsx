import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { listPublicEvents } from "@/lib/data/public/events";
import { deliveryModeLabel, resultCountLabel } from "@/lib/i18n/archive-labels";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { isPlatformLocale } from "@/lib/i18n/config";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { EDITORIAL_VISUAL_COPY } from "@/lib/i18n/editorial-visual";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { eventTranslation, eventTypeLabel } from "@/lib/i18n/public-entity-translations";
import { TRANSLATION_FALLBACK_NOTICE } from "@/lib/i18n/translation-note";
import { languageAlternates } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const descriptions = {
  en: "Events, conferences and initiatives relevant to migrant entrepreneurship, research and economic integration.",
  fr: "Événements, conférences et initiatives liés à l'entrepreneuriat migrant, à la recherche et à l'intégration économique.",
  es: "Eventos, conferencias e iniciativas relacionadas con el emprendimiento migrante, la investigación y la integración económica.",
  de: "Veranstaltungen, Konferenzen und Initiativen zu migrantischem Unternehmertum, Forschung und wirtschaftlicher Integration.",
  ar: "فعاليات ومؤتمرات ومبادرات مرتبطة بريادة الأعمال المهاجرة والبحث والاندماج الاقتصادي.",
  zh: "与移民创业、研究和经济融合相关的活动、会议和倡议。",
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  return {
    title: NAV_MESSAGES[locale].events,
    description: descriptions[locale],
    alternates: { canonical: `/${locale}/eventi`, languages: languageAlternates("/eventi") },
    ...pageSocialMetadata({ title: NAV_MESSAGES[locale].events, description: descriptions[locale], pathname: `/${locale}/eventi` }),
  };
}

export default async function LocalizedEventsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const result = await listPublicEvents();
  const visual = EDITORIAL_VISUAL_COPY[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const missingTranslation = result.items.some((event) => !eventTranslation(locale, event.id));

  return (
    <main id="contenuto" className="public-list-page">
      <section className="public-page-hero-shell">
        <Container className="public-list-container">
          <PublicPageHeader title={NAV_MESSAGES[locale].events} description={descriptions[locale]} kicker={visual.kicker} motionWords={visual.motionWords} />
        </Container>
      </section>
      <Section className="public-list-section">
        <Container className="public-list-container">
          {missingTranslation ? <p className="mb-5 max-w-3xl text-sm leading-6 text-neutral-600">{TRANSLATION_FALLBACK_NOTICE[locale]}</p> : null}
          <p className="public-results-count">{resultCountLabel(locale, result.total)}</p>
          <div className="public-results-grid">
            {result.items.map((event) => {
              const translated = eventTranslation(locale, event.id);
              const meta = event.next_edition ? [
                new Date(event.next_edition.starts_at).toLocaleString(locale),
                event.next_edition.city_text ?? event.next_edition.venue_label ?? undefined,
                event.external_organization_label ?? undefined,
              ].filter(Boolean) as string[] : event.external_organization_label ? [event.external_organization_label] : [];
              return (
                <PublicResultCard
                  key={event.id}
                  href={`/${locale}/eventi/${event.id}`}
                  title={translated?.title ?? event.title}
                  description={translated?.summary ?? event.summary}
                  badges={[eventTypeLabel(locale, event.type_code), deliveryModeLabel(locale, event.delivery_mode)]}
                  meta={meta}
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
