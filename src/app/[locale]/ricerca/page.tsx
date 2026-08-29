import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedContentsByTypes, RESEARCH_CONTENT_TYPES } from "@/lib/data/public/collections";
import { isPlatformLocale } from "@/lib/i18n/config";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = COLLECTION_MESSAGES[locale];
  return {
    title: m.researchTitle,
    description: m.researchIntro,
    alternates: { canonical: `/${locale}/ricerca`, languages: languageAlternates("/ricerca") },
  };
}

function formatDate(value: string | null, locale: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function LocalizedResearchPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = COLLECTION_MESSAGES[locale];
  const arrow = localizedCtaArrow(locale);
  const items = await listPublishedContentsByTypes(RESEARCH_CONTENT_TYPES);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.centre}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.researchTitle}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.researchIntro}</p>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{m.originalNotice}</p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flex min-h-72 flex-col bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{item.type_code.replaceAll("_", " ")}</p>
            <OriginalLanguageText as="h2" languageId={item.language_id} className="mt-2 text-xl font-semibold leading-7 text-black">{item.title}</OriginalLanguageText>
            {item.abstract ? <OriginalLanguageText languageId={item.language_id} className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</OriginalLanguageText> : <div className="flex-1" />}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-300 pt-4 text-xs text-neutral-600">
              <span>{formatDate(item.published_at, locale)}</span>
              <Link href={`/contenuti/${item.slug}`} className="font-semibold text-black">{m.open} {arrow}</Link>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="bg-white p-8 text-neutral-600">{m.empty}</p> : null}
      </div>
    </main>
  );
}
