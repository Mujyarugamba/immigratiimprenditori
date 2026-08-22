import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicEventById } from "@/lib/data/public/events";
import { relatedForEvent } from "@/lib/data/public/related";
import {
  EDITION_STATUSES,
  EVENT_AUDIENCE,
  EVENT_DELIVERY_MODES,
  EVENT_ECONOMIC,
  EVENT_TYPES,
  formatItalianDateTime,
  label,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id);
  if (!event) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const canonical = `/eventi/${event.id}`;
  const description = event.summary ?? undefined;
  return {
    title: event.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: event.title,
      description,
    },
    twitter: {
      card: "summary",
      title: event.title,
      description,
    },
  };
}

function placeLine(edition: {
  venue_label: string | null;
  city_text: string | null;
  country_ref: string | null;
  online_reference: string | null;
  delivery_mode: string;
}): string | null {
  const parts = [
    edition.venue_label,
    edition.city_text,
    edition.country_ref,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if (
    (edition.delivery_mode === "online" || edition.delivery_mode === "hybrid") &&
    edition.online_reference
  ) {
    return "Online";
  }
  return null;
}

function googleCalendarUrl(event: {
  title: string;
  summary: string | null;
  source_url: string | null;
  id: string;
}, edition: {
  starts_at: string;
  ends_at: string | null;
  venue_label: string | null;
  city_text: string | null;
  country_ref: string | null;
}) {
  const compact = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compact(edition.starts_at)}/${compact(edition.ends_at ?? edition.starts_at)}`,
    details: event.summary ?? `https://immigratiimprenditori.it/eventi/${event.id}`,
    location: [edition.venue_label, edition.city_text, edition.country_ref].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getPublicEventById(id);

  if (!event) {
    notFound();
  }

  const related = await relatedForEvent({
    id: event.id,
    context_opportunity_id: event.context_opportunity_id,
    context_service_offer_id: event.context_service_offer_id,
    owner_business_id: event.owner_business_id,
  }).catch(() => []);

  const upcomingOrOngoing = event.editions.filter(
    (e) =>
      e.occurrence_status === "scheduled" ||
      e.occurrence_status === "ongoing" ||
      e.occurrence_status === "postponed" ||
      e.occurrence_status === "concluded",
  );
  const calendarEdition = upcomingOrOngoing.find(
    (edition) => edition.occurrence_status === "scheduled" || edition.occurrence_status === "ongoing",
  ) ?? upcomingOrOngoing[0] ?? null;

  const structuredData = calendarEdition
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.summary ?? event.description,
        startDate: calendarEdition.starts_at,
        endDate: calendarEdition.ends_at ?? undefined,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode:
          calendarEdition.delivery_mode === "online"
            ? "https://schema.org/OnlineEventAttendanceMode"
            : calendarEdition.delivery_mode === "hybrid"
              ? "https://schema.org/MixedEventAttendanceMode"
              : "https://schema.org/OfflineEventAttendanceMode",
        location:
          calendarEdition.delivery_mode === "online"
            ? {
                "@type": "VirtualLocation",
                url: calendarEdition.online_reference ?? event.source_url ?? undefined,
              }
            : {
                "@type": "Place",
                name: calendarEdition.venue_label ?? calendarEdition.city_text ?? undefined,
                address: [calendarEdition.city_text, calendarEdition.country_ref].filter(Boolean).join(", ") || undefined,
              },
        organizer: event.external_organization_label
          ? { "@type": "Organization", name: event.external_organization_label }
          : undefined,
        url: `https://immigratiimprenditori.it/eventi/${event.id}`,
      }
    : null;

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        {structuredData ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/eventi" className="text-brand hover:text-brand-dark text-sm font-medium">
            ← Torna all&apos;elenco eventi
          </Link>
          {event.type_code === "cultural" ? (
            <Link href="/cultura" className="text-brand hover:text-brand-dark text-sm font-medium">
              Esplora Cultura
            </Link>
          ) : null}
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{label(EVENT_TYPES, event.type_code)}</Badge>
            <Badge tone="soft">{label(EVENT_DELIVERY_MODES, event.delivery_mode)}</Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
          {event.summary ? <p className="text-ink-muted text-lg leading-7">{event.summary}</p> : null}
        </header>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">{event.description}</p>
        </section>

        {(event.external_organization_label || event.source_url || event.source_label) && (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Organizzazione</h2>
            {event.external_organization_label ? <p className="text-ink-muted text-sm">{event.external_organization_label}</p> : null}
            {event.source_label ? <p className="text-ink-muted text-sm">Fonte: {event.source_label}</p> : null}
            {event.source_url ? (
              <p className="text-sm">
                <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Link ufficiale →</a>
              </p>
            ) : null}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Destinatari</h2>
          <p className="text-ink-muted text-sm">{label(EVENT_AUDIENCE, event.audience_kind)}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Accesso</h2>
          <p className="text-ink-muted text-sm">{label(EVENT_ECONOMIC, event.economic_kind)}</p>
        </section>

        {upcomingOrOngoing.length > 0 ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-ink text-xl font-semibold">Edizioni</h2>
              {calendarEdition ? (
                <div className="flex flex-wrap gap-3 text-sm">
                  <a href={`/eventi/${event.id}/calendar.ics`} className="font-medium underline underline-offset-4">Scarica .ics</a>
                  <a href={googleCalendarUrl(event, calendarEdition)} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">Google Calendar ↗</a>
                </div>
              ) : null}
            </div>
            <ul className="space-y-4">
              {upcomingOrOngoing.map((edition) => {
                const place = placeLine(edition);
                return (
                  <li key={edition.id} className="border-line bg-surface-elevated rounded-md border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-ink text-sm font-medium">
                        {formatItalianDateTime(edition.starts_at)}
                        {edition.ends_at ? ` – ${formatItalianDateTime(edition.ends_at)}` : null}
                      </p>
                      <Badge tone="soft">{label(EDITION_STATUSES, edition.occurrence_status)}</Badge>
                      <Badge tone="soft">{label(EVENT_DELIVERY_MODES, edition.delivery_mode)}</Badge>
                    </div>
                    <p className="text-ink-muted mt-2 text-sm">Fuso: {edition.timezone}</p>
                    {place ? <p className="text-ink-muted mt-1 text-sm">{place}</p> : null}
                    {edition.online_reference && (edition.delivery_mode === "online" || edition.delivery_mode === "hybrid") ? (
                      <p className="mt-2 text-sm">
                        <a href={edition.online_reference} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Collegamento online →</a>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Edizioni</h2>
            <p className="text-ink-muted text-sm">Nessuna edizione attiva da mostrare.</p>
          </section>
        )}

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
