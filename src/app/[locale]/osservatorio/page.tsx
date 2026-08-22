import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { languageAlternates } from "@/lib/i18n/seo";
import { listPublicIndicators } from "@/lib/data/public/observatory";

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
  };
}

export default async function LocalizedObservatoryPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = NAV_MESSAGES[locale];
  const core = CORE_MESSAGES[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const result = await listPublicIndicators();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Observatory</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.observatory}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{descriptions[locale]}</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
        {result.items.map((indicator) => (
          <article key={indicator.id} className="flex min-h-64 flex-col bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{indicator.code}</p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-black">{indicator.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-neutral-700">{indicator.description}</p>
            <Link href={`/${locale}/osservatorio/${indicator.slug}`} className="mt-5 text-sm font-semibold underline underline-offset-4">{open} →</Link>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href={`/${locale}/esplora/dati`} className="underline underline-offset-4">{core.dataExplorer} →</Link>
        <Link href={`/${locale}/open-data`} className="underline underline-offset-4">{core.openData} →</Link>
      </div>
    </main>
  );
}
