import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublicEvents } from "@/lib/data/public/events";
import { isPlatformLocale } from "@/lib/i18n/config";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";
import { eventTranslation, eventTypeLabel } from "@/lib/i18n/public-entity-translations";
import { TRANSLATION_FALLBACK_NOTICE } from "@/lib/i18n/translation-note";

const descriptions = {
  en: "Events, conferences and initiatives relevant to migrant entrepreneurship, research and economic integration.",
  fr: "Événements, conférences et initiatives liés à l'entrepreneuriat migrant, à la recherche et à l'intégration économique.",
  es: "Eventos, conferencias e iniciativas relacionadas con el emprendimiento migrante, la investigación y la integración económica.",
  de: "Veranstaltungen, Konferenzen und Initiativen zu migrantischem Unternehmertum, Forschung und wirtschaftlicher Integration.",
  ar: "فعاليات ومؤتمرات ومبادرات مرتبطة بريادة الأعمال المهاجرة والبحث والاندماج الاقتصادي.",
  zh: "与移民创业、研究和经济融合相关的活动、会议和倡议。",
} as const;

const kicker = {
  en: "Immigrati Imprenditori · Events",
  fr: "Immigrati Imprenditori · Événements",
  es: "Immigrati Imprenditori · Eventos",
  de: "Immigrati Imprenditori · Veranstaltungen",
  ar: "Immigrati Imprenditori · الفعاليات",
  zh: "Immigrati Imprenditori · 活动",
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
  const m = NAV_MESSAGES[locale];
  const open = COLLECTION_MESSAGES[locale].open;
  const arrow = localizedCtaArrow(locale);
  const missingTranslation = result.items.some((event) => !eventTranslation(locale, event.id));

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{kicker[locale]}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.events}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{descriptions[locale]}</p>
        {missingTranslation ? <p className="mt-3 text-sm leading-6 text-neutral-600">{TRANSLATION_FALLBACK_NOTICE[locale]}</p> : null}
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2">
        {result.items.map((event) => {
          const translated = eventTranslation(locale, event.id);
          return (
            <article key={event.id} className="flex min-h-64 flex-col bg-white p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{eventTypeLabel(locale, event.type_code)}</p>
              <h2 className="mt-2 text-xl font-semibold leading-7 text-black">{translated?.title ?? event.title}</h2>
              {(translated?.summary ?? event.summary) ? <p className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{translated?.summary ?? event.summary}</p> : <div className="flex-1" />}
              {event.next_edition ? <p className="mt-4 text-xs text-neutral-500">{new Date(event.next_edition.starts_at).toLocaleString(locale)}</p> : null}
              <Link href={`/${locale}/eventi/${event.id}`} className="mt-5 text-sm font-semibold underline underline-offset-4">{open} {arrow}</Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
