import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { GLOSSARY_MESSAGES } from "@/lib/i18n/glossary";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = GLOSSARY_MESSAGES[locale];
  return {
    title: m.title,
    description: m.intro,
    alternates: { canonical: `/${locale}/glossario`, languages: languageAlternates("/glossario") },
    ...pageSocialMetadata({
      title: m.title,
      description: m.intro,
      pathname: `/${locale}/glossario`,
    }),
  };
}

export default async function LocalizedGlossaryPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = GLOSSARY_MESSAGES[locale];
  const arrow = localizedCtaArrow(locale);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>

      <dl className="mt-8 divide-y divide-black border-y border-black">
        {m.entries.map((entry) => (
          <div key={entry.term} className="grid gap-3 py-6 md:grid-cols-[16rem_1fr] md:gap-8">
            <dt className="text-lg font-semibold text-black">{entry.term}</dt>
            <dd className="text-base leading-7 text-neutral-700">{entry.text}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 max-w-3xl text-sm leading-6 text-neutral-600">{m.note}</p>
      <Link href="/dati-e-fonti" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
        {m.methodologyLink} {arrow}
      </Link>
    </main>
  );
}
