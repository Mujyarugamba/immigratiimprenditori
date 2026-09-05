import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { getPublicEventById } from "@/lib/data/public/events";
import { relatedForEvent } from "@/lib/data/public/related";
import { absoluteUrl } from "@/lib/i18n/seo";
import { EDITION_STATUSES, EVENT_AUDIENCE, EVENT_DELIVERY_MODES, EVENT_ECONOMIC, EVENT_TYPES, formatItalianDateTime, label } from "@/lib/public/labels";
import { breadcrumbStructuredData, schemaEventStatus } from "@/lib/seo/structured-data";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id);
  if (!event) return { title: "Non trovato", robots: { index: false, follow: false } };
  const canonical = `/eventi/${event.id}`;
  const description = event.summary ?? undefined;
  return { title: event.title, description, alternates: { canonical }, openGraph: { type: "website", url: canonical, title: event.title, description }, twitter: { card: "summary", title: event.title, description } };
}

function placeLine(edition: { venue_label: string | null; city_text: string | null; country_ref: string | null; online_reference: string | null; delivery_mode: string }): string | null {
  const parts = [edition.venue_label, edition.city_text, edition.country_ref].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if ((edition.delivery_mode === "online" || edition.delivery_mode === "hybrid") && edition.online_reference) return "Online";
  return null;
}

function googleCalendarUrl(event: { title: string; summary: string | null; source_url: string | null; id: string }, edition: { starts_at: string; ends_at: string | null; venue_label: string | null; city_text: string | null; country_ref: string | null }) {
  const compact = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${compact(edition.starts_at)}/${compact(edition.ends_at ?? edition.starts_at)}`, details: event.summary ?? absoluteUrl(`/eventi/${event.id}`), location: [edition.venue_label, edition.city_text, edition.country_ref].filter(Boolean).join(", ") });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getPublicEventById(id);
  if (!event) notFound();

  const related = await relatedForEvent({ id: event.id, context_opportunity_id: event.context_opportunity_id, context_service_offer_id: event.context_service_offer_id, owner_business_id: event.owner_business_id }).catch(() => []);
  const upcomingOrOngoing = event.editions.filter((e) => ["scheduled", "ongoing", "postponed", "concluded"].includes(e.occurrence_status));
  const calendarEdition = upcomingOrOngoing.find((edition) => edition.occurrence_status === "scheduled" || edition.occurrence_status === "ongoing") ?? upcomingOrOngoing[0] ?? null;

  const structuredData = calendarEdition ? {
    "@context": "https://schema.org", "@type": "Event", name: event.title, description: event.summary ?? event.description, startDate: calendarEdition.starts_at, endDate: calendarEdition.ends_at ?? undefined, eventStatus: schemaEventStatus(calendarEdition.occurrence_status),
    eventAttendanceMode: calendarEdition.delivery_mode === "online" ? "https://schema.org/OnlineEventAttendanceMode" : calendarEdition.delivery_mode === "hybrid" ? "https://schema.org/MixedEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: calendarEdition.delivery_mode === "online" ? { "@type": "VirtualLocation", url: calendarEdition.online_reference ?? event.source_url ?? undefined } : { "@type": "Place", name: calendarEdition.venue_label ?? calendarEdition.city_text ?? undefined, address: [calendarEdition.city_text, calendarEdition.country_ref].filter(Boolean).join(", ") || undefined },
    organizer: event.external_organization_label ? { "@type": "Organization", name: event.external_organization_label } : undefined,
    url: absoluteUrl(`/eventi/${event.id}`),
  } : null;
  const breadcrumbSchema = breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Eventi", path: "/eventi" }, { name: event.title, path: `/eventi/${event.id}` }]);

  return (
    <main className="ii-detail-page">
      {structuredData ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="ii-detail-top">
        <nav className="ii-detail-nav"><Link href="/eventi">← Eventi</Link>{event.type_code === "cultural" ? <Link href="/cultura">Cultura</Link> : null}</nav>
        <header className="ii-detail-header">
          <div className="ii-detail-badges flex flex-wrap gap-2"><Badge tone="brand">{label(EVENT_TYPES, event.type_code)}</Badge><Badge tone="soft">{label(EVENT_DELIVERY_MODES, event.delivery_mode)}</Badge></div>
          <h1 className="ii-detail-title">{event.title}</h1>
          {event.summary ? <p className="ii-detail-deck">{event.summary}</p> : null}
        </header>
      </section>

      <div className="ii-detail-content">
        <section className="ii-detail-section"><h2>Descrizione</h2><p className="ii-detail-prose whitespace-pre-wrap">{event.description}</p></section>
        {(event.external_organization_label || event.source_url || event.source_label) ? <section className="ii-detail-section"><h2>Organizzazione</h2>{event.external_organization_label ? <p className="ii-detail-prose">{event.external_organization_label}</p> : null}{event.source_label ? <p className="ii-detail-prose">Fonte: {event.source_label}</p> : null}{event.source_url ? <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--ii-green)]">Link ufficiale →</a> : null}</section> : null}
        <section className="ii-detail-section"><h2>Destinatari</h2><p className="ii-detail-prose">{label(EVENT_AUDIENCE, event.audience_kind)}</p></section>
        <section className="ii-detail-section"><h2>Accesso</h2><p className="ii-detail-prose">{label(EVENT_ECONOMIC, event.economic_kind)}</p></section>

        <section className="ii-detail-section">
          <div className="flex flex-wrap items-end justify-between gap-4"><h2>Edizioni</h2>{calendarEdition ? <div className="flex flex-wrap gap-4 text-sm font-semibold"><a href={`/eventi/${event.id}/calendar.ics`}>Scarica .ics →</a><a href={googleCalendarUrl(event, calendarEdition)} target="_blank" rel="noreferrer">Google Calendar ↗</a></div> : null}</div>
          {upcomingOrOngoing.length > 0 ? <ul className="ii-detail-editions mt-5">{upcomingOrOngoing.map((edition) => { const place = placeLine(edition); return <li key={edition.id} className="ii-detail-edition"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{formatItalianDateTime(edition.starts_at)}{edition.ends_at ? ` – ${formatItalianDateTime(edition.ends_at)}` : null}</p><Badge tone="soft">{label(EDITION_STATUSES, edition.occurrence_status)}</Badge><Badge tone="soft">{label(EVENT_DELIVERY_MODES, edition.delivery_mode)}</Badge></div><p className="mt-2 text-sm">Fuso: {edition.timezone}</p>{place ? <p className="mt-1 text-sm">{place}</p> : null}{edition.online_reference && (edition.delivery_mode === "online" || edition.delivery_mode === "hybrid") ? <p className="mt-2"><a href={edition.online_reference} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--ii-green)]">Collegamento online →</a></p> : null}</li>; })}</ul> : <p className="ii-detail-prose">Nessuna edizione attiva da mostrare.</p>}
        </section>
        <RelatedLinks groups={related} />
      </div>
    </main>
  );
}
