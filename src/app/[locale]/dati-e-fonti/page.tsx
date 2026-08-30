import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { METHODOLOGY_MESSAGES } from "@/lib/i18n/methodology";
import { languageAlternates } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = METHODOLOGY_MESSAGES[locale];
  return {
    title: m.title,
    description: m.intro,
    alternates: { canonical: `/${locale}/dati-e-fonti`, languages: languageAlternates("/dati-e-fonti") },
    ...pageSocialMetadata({
      title: m.title,
      description: m.intro,
      pathname: `/${locale}/dati-e-fonti`,
    }),
  };
}

export default async function LocalizedMethodologyPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = METHODOLOGY_MESSAGES[locale];

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Observatory</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>

      <div className="divide-y divide-neutral-300">
        {m.sections.map((section) => (
          <section key={section.title} className="py-8">
            <h2 className="text-2xl font-semibold text-black">{section.title}</h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-neutral-700">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-6">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <p className="border-t border-black pt-6 text-sm leading-6 text-neutral-700">
        {m.contactLead} <a href="mailto:redazione@immigratiimprenditori.it" className="font-semibold underline underline-offset-4">redazione@immigratiimprenditori.it</a>.
      </p>
    </main>
  );
}
