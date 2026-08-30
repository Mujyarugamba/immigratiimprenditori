import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublicContents } from "@/lib/data/public/contents";
import { isPlatformLocale } from "@/lib/i18n/config";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { presentLocalizedContentCards } from "@/lib/i18n/ai-translation/runtime";
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
    ...pageSocialMetadata({
      title: NAV_MESSAGES[locale].analysis,
      description: descriptions[locale],
      pathname: `/${locale}/contenuti`,
    }),
  };
}

export default async function LocalizedContentsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = NAV_MESSAGES[locale];
  const core = CORE_MESSAGES[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const result = await listPublicContents();
  const presented = await presentLocalizedContentCards(result.items, locale);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Research Centre</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.analysis}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{descriptions[locale]}</p>
        {presented.some((item) => !item.isAiTranslation) ? (
          <p className="mt-3 text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
        {presented.map((item) => (
          <article key={item.id} className="flex min-h-72 flex-col bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{item.type_code.replaceAll("_", " ")}</p>
            <OriginalLanguageText as="h2" languageCode={item.displayLanguageCode} className="mt-2 text-xl font-semibold leading-7 text-black">{item.title}</OriginalLanguageText>
            {item.abstract ? <OriginalLanguageText languageCode={item.displayLanguageCode} className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</OriginalLanguageText> : <div className="flex-1" />}
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
            <Link href={`/${locale}/contenuti/${item.slug}`} className="mt-5 text-sm font-semibold underline underline-offset-4">{open} {arrow}</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
