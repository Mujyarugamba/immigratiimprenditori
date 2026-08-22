import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublicEvents } from "@/lib/data/public/events";
import { isPlatformLocale } from "@/lib/i18n/config";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CORE_MESSAGES } from "@/lib/i18n/pages";

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
  return { title: NAV_MESSAGES[locale].events, description: descriptions[locale], alternates: { canonical: `/${locale}/eventi` } };
}

export default async function LocalizedEventsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const result = await listPublicEvents();
  const m = NAV_MESSAGES[locale];
  const core = CORE_MESSAGES[locale];

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Events</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.events}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{descriptions[locale]}</p>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2">
        {result.items.map((event) => (
          <article key={event.id} className="flex min-h-64 flex-col bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{event.type_code.replaceAll("_", " ")}</p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-black">{event.title}</h2>
            {event.summary ? <p className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{event.summary}</p> : <div className="flex-1" />}
            {event.next_edition ? <p className="mt-4 text-xs text-neutral-500">{new Date(event.next_edition.starts_at).toLocaleString(locale)}</p> : null}
            <Link href={`/${locale}/eventi/${event.id}`} className="mt-5 text-sm font-semibold underline underline-offset-4">Open →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
