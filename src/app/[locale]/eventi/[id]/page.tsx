import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicEventById } from "@/lib/data/public/events";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";

const labels = {
  en: { back: "Back to events", description: "Description", organization: "Organization", audience: "Audience", access: "Access", editions: "Editions", calendar: "Calendar" },
  fr: { back: "Retour aux événements", description: "Description", organization: "Organisation", audience: "Public", access: "Accès", editions: "Éditions", calendar: "Calendrier" },
  es: { back: "Volver a eventos", description: "Descripción", organization: "Organización", audience: "Público", access: "Acceso", editions: "Ediciones", calendar: "Calendario" },
  de: { back: "Zurück zu Veranstaltungen", description: "Beschreibung", organization: "Organisation", audience: "Zielgruppe", access: "Zugang", editions: "Termine", calendar: "Kalender" },
  ar: { back: "العودة إلى الفعاليات", description: "الوصف", organization: "الجهة المنظمة", audience: "الجمهور", access: "الدخول", editions: "المواعيد", calendar: "التقويم" },
  zh: { back: "返回活动", description: "说明", organization: "主办方", audience: "受众", access: "参与方式", editions: "场次", calendar: "日历" },
} as const;

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const event = await getPublicEventById(id);
  if (!event) return { title: "Not found", robots: { index: false, follow: false } };
  return { title: event.title, description: event.summary ?? undefined, alternates: { canonical: `/${locale}/eventi/${event.id}` } };
}

export default async function LocalizedEventPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const event = await getPublicEventById(id);
  if (!event) notFound();
  const l = labels[locale];
  const core = CORE_MESSAGES[locale];

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link href={`/${locale}/eventi`} className="text-sm font-semibold underline underline-offset-4">← {l.back}</Link>
      <header className="mt-6 border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{event.type_code.replaceAll("_", " ")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{event.title}</h1>
        {event.summary ? <p className="mt-5 text-lg leading-8 text-neutral-700">{event.summary}</p> : null}
        <p className="mt-3 text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
      </header>

      <section className="mt-8"><h2 className="text-xl font-semibold text-black">{l.description}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">{event.description}</p></section>
      {event.external_organization_label ? <section className="mt-8 border-t border-black pt-6"><h2 className="text-xl font-semibold text-black">{l.organization}</h2><p className="mt-3 text-sm text-neutral-700">{event.external_organization_label}</p></section> : null}

      {event.editions.length > 0 ? (
        <section className="mt-8 border-t border-black pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-black">{l.editions}</h2><a href={`/eventi/${event.id}/calendar.ics`} className="text-sm font-semibold underline underline-offset-4">{l.calendar} (.ics) →</a></div>
          <ul className="mt-4 space-y-4">
            {event.editions.map((edition) => (
              <li key={edition.id} className="border border-black p-4 text-sm leading-6 text-neutral-700">
                <strong className="text-black">{new Date(edition.starts_at).toLocaleString(locale)}</strong>
                {edition.ends_at ? <span> – {new Date(edition.ends_at).toLocaleString(locale)}</span> : null}
                <div className="mt-2">{[edition.venue_label, edition.city_text, edition.country_ref].filter(Boolean).join(", ")}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
