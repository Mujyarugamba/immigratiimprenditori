import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";

const labels = {
  en: { back: "Back to analysis", text: "Text", source: "Source", cite: "How to cite", open: "Open original source" },
  fr: { back: "Retour aux analyses", text: "Texte", source: "Source", cite: "Comment citer", open: "Ouvrir la source originale" },
  es: { back: "Volver a análisis", text: "Texto", source: "Fuente", cite: "Cómo citar", open: "Abrir fuente original" },
  de: { back: "Zurück zu Analysen", text: "Text", source: "Quelle", cite: "Zitierempfehlung", open: "Originalquelle öffnen" },
  ar: { back: "العودة إلى التحليلات", text: "النص", source: "المصدر", cite: "طريقة الاستشهاد", open: "فتح المصدر الأصلي" },
  zh: { back: "返回分析", text: "正文", source: "来源", cite: "引用方式", open: "打开原始来源" },
} as const;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const content = await getPublicContentBySlug(slug);
  if (!content) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: content.title,
    description: content.abstract ?? undefined,
    alternates: { canonical: `/contenuti/${content.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function LocalizedContentPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const content = await getPublicContentBySlug(slug);
  if (!content) notFound();
  const l = labels[locale];
  const core = CORE_MESSAGES[locale];
  const authors = content.authors.map((a) => a.display_label).filter(Boolean) as string[];
  const year = content.published_at ? new Date(content.published_at).getFullYear() : new Date().getFullYear();
  const citation = `${authors.length ? authors.join(", ") : "Immigrati Imprenditori"} (${year}). ${content.title}. Immigrati Imprenditori — Centro Studi AIPEL.`;

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link href={`/${locale}/contenuti`} className="text-sm font-semibold underline underline-offset-4">← {l.back}</Link>
      <header className="mt-6 border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{content.type_code.replaceAll("_", " ")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{content.title}</h1>
        {content.abstract ? <p className="mt-5 text-lg leading-8 text-neutral-700">{content.abstract}</p> : null}
        {authors.length > 0 ? <p className="mt-4 text-sm font-semibold text-black">{authors.join(", ")}</p> : null}
        <p className="mt-3 text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-black">{l.text}</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
          {content.body.split("\n\n").map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}
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
        <p className="mt-3 border border-black bg-neutral-50 p-4 text-sm leading-6">{citation}</p>
        <a href={`/contenuti/${content.slug}/citation.bib`} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">BibTeX →</a>
      </section>
    </main>
  );
}
