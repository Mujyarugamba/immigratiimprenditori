import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { isPlatformLocale } from "@/lib/i18n/config";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { presentLocalizedContentDetail } from "@/lib/i18n/ai-translation/runtime";

const labels = {
  en: { back: "Back to analysis", text: "Text", source: "Source", cite: "How to cite", open: "Open original source" },
  fr: { back: "Retour aux analyses", text: "Texte", source: "Source", cite: "Comment citer", open: "Ouvrir la source originale" },
  es: { back: "Volver a análisis", text: "Texto", source: "Fuente", cite: "Cómo citar", open: "Abrir fuente original" },
  de: { back: "Zurück zu Analysen", text: "Text", source: "Quelle", cite: "Zitierempfehlung", open: "Originalquelle öffnen" },
  ar: { back: "العودة إلى التحليلات", text: "النص", source: "المصدر", cite: "طريقة الاستشهاد", open: "فتح المصدر الأصلي" },
  zh: { back: "返回分析", text: "正文", source: "来源", cite: "引用方式", open: "打开原始来源" },
} as const;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ original?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const query = await searchParams;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const content = await getPublicContentBySlug(slug);
  if (!content) return { title: "Not found", robots: { index: false, follow: false } };
  const preferOriginal = query.original === "1";
  const presented = await presentLocalizedContentDetail(content, locale, {
    preferOriginal,
    allowGenerate: false,
  });
  return {
    title: presented.title,
    description: presented.abstract ?? undefined,
    alternates: { canonical: `/contenuti/${content.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function LocalizedContentPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const query = await searchParams;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const content = await getPublicContentBySlug(slug);
  if (!content) notFound();
  const preferOriginal = query.original === "1";
  const presented = await presentLocalizedContentDetail(content, locale, { preferOriginal });
  const l = labels[locale];
  const arrow = localizedCtaArrow(locale);
  const authors = content.authors.map((a) => a.display_label).filter(Boolean) as string[];
  const year = content.published_at ? new Date(content.published_at).getFullYear() : new Date().getFullYear();
  const citation = `${authors.length ? authors.join(", ") : "Immigrati Imprenditori"} (${year}). ${content.title}. Immigrati Imprenditori — Centro Studi AIPEL.`;
  const translationHref = `/${locale}/contenuti/${content.slug}`;
  const originalHref = `${translationHref}?original=1`;

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link href={`/${locale}/contenuti`} className="text-sm font-semibold underline underline-offset-4">← {l.back}</Link>
      <header className="mt-6 border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{content.type_code.replaceAll("_", " ")}</p>
        <OriginalLanguageText as="h1" languageCode={presented.displayLanguageCode} className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{presented.title}</OriginalLanguageText>
        {presented.subtitle ? <OriginalLanguageText languageCode={presented.displayLanguageCode} className="mt-4 text-xl leading-7 text-neutral-800">{presented.subtitle}</OriginalLanguageText> : null}
        {presented.abstract ? <OriginalLanguageText languageCode={presented.displayLanguageCode} className="mt-5 text-lg leading-8 text-neutral-700">{presented.abstract}</OriginalLanguageText> : null}
        {authors.length > 0 ? <p className="mt-4 text-sm font-semibold text-black">{authors.join(", ")}</p> : null}
        <EditorialTranslationNotice
          locale={locale}
          sourceLanguageId={content.language_id}
          displayLanguageCode={presented.displayLanguageCode}
          isAiTranslation={presented.isAiTranslation}
          isViewingOriginal={presented.isViewingOriginal}
          originalHref={originalHref}
          translationHref={translationHref}
        />
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-black">{l.text}</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
          {presented.body.split("\n\n").map((paragraph, index) => (
            <OriginalLanguageText key={index} languageCode={presented.displayLanguageCode} className="whitespace-pre-wrap">{paragraph}</OriginalLanguageText>
          ))}
        </div>
      </section>

      {content.source_url ? (
        <section className="mt-8 border-t border-black pt-6">
          <h2 className="text-xl font-semibold text-black">{l.source}</h2>
          <a href={content.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">{l.open} ↗</a>
        </section>
      ) : null}

      <section className="mt-8 border-t border-black pt-6">
        <h2 className="text-xl font-semibold text-black">{l.cite}</h2>
        <OriginalLanguageText languageId={content.language_id} className="mt-3 border border-black bg-neutral-50 p-4 text-sm leading-6">{citation}</OriginalLanguageText>
        <a href={`/contenuti/${content.slug}/citation.bib`} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">BibTeX {arrow}</a>
      </section>
    </main>
  );
}
