import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedContentsByTypes, VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import { isPlatformLocale } from "@/lib/i18n/config";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { presentLocalizedContentCards } from "@/lib/i18n/ai-translation/runtime";
import { contentTypeLabel } from "@/lib/i18n/archive-labels";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const motion = {
  en: "people · journeys · enterprise ·",
  fr: "personnes · parcours · entreprise ·",
  es: "personas · trayectorias · empresa ·",
  de: "Menschen · Wege · Unternehmen ·",
  ar: "أشخاص · مسارات · ريادة ·",
  zh: "人物 · 轨迹 · 创业 ·",
} as const;

const contribution = {
  en: { title: "Have a story to propose?", text: "Proposals enter the private editorial Inbox and are reviewed before any publication.", cta: "Contribute to knowledge" },
  fr: { title: "Une histoire à proposer ?", text: "Les propositions arrivent dans l’Inbox éditoriale privée et sont évaluées avant toute publication.", cta: "Contribuer à la connaissance" },
  es: { title: "¿Tienes una historia que proponer?", text: "Las propuestas entran en la Inbox editorial privada y se evalúan antes de cualquier publicación.", cta: "Contribuir al conocimiento" },
  de: { title: "Eine Geschichte vorschlagen?", text: "Vorschläge gelangen in die private redaktionelle Inbox und werden vor jeder Veröffentlichung geprüft.", cta: "Zum Wissen beitragen" },
  ar: { title: "هل لديك قصة تقترحها؟", text: "تدخل المقترحات إلى صندوق التحرير الخاص وتُراجع قبل أي نشر.", cta: "ساهم في المعرفة" },
  zh: { title: "有故事想推荐吗？", text: "推荐内容会进入私密编辑收件箱，并在任何发布前接受审核。", cta: "参与知识积累" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = COLLECTION_MESSAGES[locale];
  return {
    title: m.storiesTitle,
    description: m.storiesIntro,
    alternates: { canonical: `/${locale}/storie`, languages: languageAlternates("/storie") },
    ...pageSocialMetadata({ title: m.storiesTitle, description: m.storiesIntro, pathname: `/${locale}/storie` }),
  };
}

export default async function LocalizedStoriesPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = COLLECTION_MESSAGES[locale];
  const c = contribution[locale];
  const arrow = localizedCtaArrow(locale);
  const items = await listPublishedContentsByTypes(VOICE_CONTENT_TYPES);
  const presented = await presentLocalizedContentCards(items, locale);

  return (
    <main id="contenuto" className="preview-hub-page">
      <section className="preview-hub-hero stories">
        <div className="preview-hub-motion" aria-hidden="true"><span>{motion[locale]}</span><span>{motion[locale]}</span></div>
        <div className="preview-hub-inner">
          <p className="preview-hub-kicker">{m.centre} · {m.storiesTitle}</p>
          <h1>{m.storiesTitle}</h1>
          <p className="hub-intro">{m.storiesIntro}</p>
        </div>
      </section>

      <div className="preview-hub-body">
        {presented.some((item) => !item.isAiTranslation) ? <p className="mb-5 max-w-3xl text-sm leading-6 text-neutral-600">{m.originalNotice}</p> : null}
        {presented.length > 0 ? (
          <div className="preview-index-grid">
            {presented.map((item) => (
              <article key={item.id} className="preview-index-card">
                <p className="index-meta">{contentTypeLabel(locale, item.type_code)}</p>
                <OriginalLanguageText as="h2" languageCode={item.displayLanguageCode}>
                  <Link href={`/${locale}/contenuti/${item.slug}`}>{item.title}</Link>
                </OriginalLanguageText>
                {item.abstract ? <OriginalLanguageText languageCode={item.displayLanguageCode}>{item.abstract}</OriginalLanguageText> : null}
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
                <div className="index-footer"><Link href={`/${locale}/contenuti/${item.slug}`}>{m.open} {arrow}</Link></div>
              </article>
            ))}
          </div>
        ) : <p>{m.empty}</p>}

        <section className="preview-hub-cta">
          <h2>{c.title}</h2>
          <p>{c.text}</p>
          <Link href={`/${locale}/contribuisci`}>{c.cta} {arrow}</Link>
        </section>
      </div>
    </main>
  );
}