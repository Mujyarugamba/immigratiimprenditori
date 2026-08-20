import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  eventTemporalStatus,
  getPublicEventById,
  type PublicEventEdition,
} from "@/lib/data/public/events";
import { relatedForEvent } from "@/lib/data/public/related";
import { getSiteUrl } from "@/lib/env";
import { DEFAULT_LANGUAGE_TAG, localizedPath } from "@/lib/i18n/config";
import {
  EDITION_STATUSES,
  EVENT_AUDIENCE,
  EVENT_DELIVERY_MODES,
  EVENT_ECONOMIC,
  EVENT_TYPES,
  label,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

const TEMPORAL_LABELS = {
  upcoming: "Futuro",
  ongoing: "In corso",
  past: "Passato",
} as const;

function formatEditionWhen(edition: PublicEventEdition): string {
  const dateFormatter = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeZone: edition.timezone,
  });
  const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: edition.timezone,
  });
  const start = new Date(edition.starts_at);
  const end = edition.ends_at ? new Date(edition.ends_at) : null;
  if (edition.all_day) {
    const startLabel = dateFormatter.format(start);
    const endLabel = end ? dateFormatter.format(end) : null;
    return endLabel && endLabel !== startLabel
      ? `${startLabel} – ${endLabel}`
      : startLabel;
  }
  const startLabel = dateTimeFormatter.format(start);
  const endLabel = end ? dateTimeFormatter.format(end) : null;
  return endLabel ? `${startLabel} – ${endLabel}` : startLabel;
}

function publicCanonicalPath(id: string): string {
  return localizedPath(`/eventi/${encodeURIComponent(id)}`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEventById(id);
  if (!event) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const isPublic =
    event.publication_status === "published" && event.visibility_status === "public";
  if (!isPublic) {
    return {
      title: `Anteprima — ${event.title}`,
      description: event.summary ?? undefined,
      robots: { index: false, follow: false },
    };
  }

  const canonical = publicCanonicalPath(event.id);
  return {
    title: event.title,
    description: event.summary ?? undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: event.title,
      description: event.summary ?? undefined,
      locale: "it_IT",
    },
    twitter: {
      card: "summary",
      title: event.title,
      description: event.summary ?? undefined,
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

function attendanceMode(mode: string): string | undefined {
  if (mode === "online") return "https://schema.org/OnlineEventAttendanceMode";
  if (mode === "hybrid") return "https://schema.org/MixedEventAttendanceMode";
  if (mode === "in_presence") return "https://schema.org/OfflineEventAttendanceMode";
  return undefined;
}

function schemaEventStatus(status: string): string | undefined {
  if (status === "postponed") return "https://schema.org/EventPostponed";
  if (status === "cancelled") return "https://schema.org/EventCancelled";
  if (status === "scheduled" || status === "ongoing" || status === "concluded") {
    return "https://schema.org/EventScheduled";
  }
  return undefined;
}

function schemaLocation(edition: PublicEventEdition): Record<string, unknown> | Array<Record<string, unknown>> | undefined {
  const locations: Array<Record<string, unknown>> = [];
  const physicalLabel = [edition.venue_label, edition.city_text, edition.country_ref]
    .filter(Boolean)
    .join(", ");

  if (physicalLabel) {
    locations.push({
      "@type": "Place",
      name: edition.venue_label ?? physicalLabel,
      address: [edition.city_text, edition.country_ref].filter(Boolean).join(", ") || undefined,
    });
  }

  if (
    (edition.delivery_mode === "online" || edition.delivery_mode === "hybrid") &&
    edition.online_reference
  ) {
    locations.push({
      "@type": "VirtualLocation",
      url: edition.online_reference,
    });
  }

  if (locations.length === 0) return undefined;
  return locations.length === 1 ? locations[0] : locations;
}

export default async function EventoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getPublicEventById(id);

  if (!event) {
    notFound();
  }

  const isPublic =
    event.publication_status === "published" && event.visibility_status === "public";
  const related = await relatedForEvent({
    id: event.id,
    context_opportunity_id: event.context_opportunity_id,
    context_service_offer_id: event.context_service_offer_id,
    owner_business_id: event.owner_business_id,
  }).catch(() => []);

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${publicCanonicalPath(event.id)}`;
  const eventGraph = event.editions.map((edition) => ({
    "@type": "Event",
    "@id": `${canonicalUrl}#edition-${edition.id}`,
    name: event.title,
    description: event.summary ?? event.description,
    url: canonicalUrl,
    startDate: edition.starts_at,
    endDate: edition.ends_at ?? undefined,
    eventAttendanceMode: attendanceMode(edition.delivery_mode),
    eventStatus: schemaEventStatus(edition.occurrence_status),
    location: schemaLocation(edition),
    organizer: event.external_organization_label
      ? { "@type": "Organization", name: event.external_organization_label }
      : undefined,
    isAccessibleForFree:
      event.economic_kind === "free"
        ? true
        : event.economic_kind === "paid"
          ? false
          : undefined,
    inLanguage: DEFAULT_LANGUAGE_TAG,
  }));
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@graph": eventGraph.length > 0
      ? eventGraph
      : [{
          "@type": "Event",
          "@id": `${canonicalUrl}#event`,
          name: event.title,
          description: event.summary ?? event.description,
          url: canonicalUrl,
          inLanguage: DEFAULT_LANGUAGE_TAG,
        }],
  };

  return (
    <main id="contenuto">
      <Section>
        {isPublic ? <JsonLd data={eventJsonLd} /> : null}
        <Container className="max-w-3xl space-y-8">
          {!isPublic ? (
            <aside className="border-2 border-black bg-neutral-100 p-4" role="status">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
                Anteprima privata
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                Questo evento non è pubblicato e non è visibile agli utenti anonimi.
              </p>
              <Link
                href={`/app/redazione/eventi/${event.id}`}
                className="mt-3 inline-block text-sm font-semibold text-black underline underline-offset-4"
              >
                Torna alla modifica in redazione
              </Link>
            </aside>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/eventi"
              className="text-brand hover:text-brand-dark text-sm font-medium"
            >
              ← Torna all&apos;elenco eventi
            </Link>
            {event.type_code === "cultural" ? (
              <Link
                href="/cultura"
                className="text-brand hover:text-brand-dark text-sm font-medium"
              >
                Esplora Cultura
              </Link>
            ) : null}
          </div>

          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{label(EVENT_TYPES, event.type_code)}</Badge>
              <Badge tone="soft">
                {label(EVENT_DELIVERY_MODES, event.delivery_mode)}
              </Badge>
            </div>
            <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
              {event.title}
            </h1>
            {event.summary ? (
              <p className="text-ink-muted text-lg leading-7">{event.summary}</p>
            ) : null}
          </header>

          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {event.description}
            </p>
          </section>

          {(event.external_organization_label || event.source_url || event.source_label) && (
            <section className="space-y-3">
              <h2 className="text-ink text-xl font-semibold">Organizzazione</h2>
              {event.external_organization_label ? (
                <p className="text-ink-muted text-sm">{event.external_organization_label}</p>
              ) : null}
              {event.source_label ? (
                <p className="text-ink-muted text-sm">Fonte: {event.source_label}</p>
              ) : null}
              {event.source_url ? (
                <p className="text-sm">
                  <a
                    href={event.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                  >
                    Link ufficiale →
                  </a>
                </p>
              ) : null}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Destinatari</h2>
            <p className="text-ink-muted text-sm">
              {label(EVENT_AUDIENCE, event.audience_kind)}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Accesso</h2>
            <p className="text-ink-muted text-sm">
              {label(EVENT_ECONOMIC, event.economic_kind)}
            </p>
          </section>

          {event.editions.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-ink text-xl font-semibold">Edizioni</h2>
              <ul className="space-y-4">
                {event.editions.map((edition) => {
                  const place = placeLine(edition);
                  const temporal = eventTemporalStatus(edition);
                  return (
                    <li
                      key={edition.id}
                      className="border-line bg-surface-elevated rounded-md border p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-ink text-sm font-medium">
                          {formatEditionWhen(edition)}
                        </p>
                        {temporal ? (
                          <Badge tone="soft">{TEMPORAL_LABELS[temporal]}</Badge>
                        ) : null}
                        <Badge tone="soft">
                          {label(EDITION_STATUSES, edition.occurrence_status)}
                        </Badge>
                        <Badge tone="soft">
                          {label(EVENT_DELIVERY_MODES, edition.delivery_mode)}
                        </Badge>
                      </div>
                      {!edition.all_day ? (
                        <p className="text-ink-muted mt-2 text-sm">
                          Fuso: {edition.timezone}
                        </p>
                      ) : null}
                      {place ? (
                        <p className="text-ink-muted mt-1 text-sm">{place}</p>
                      ) : null}
                      {edition.online_reference &&
                      (edition.delivery_mode === "online" || edition.delivery_mode === "hybrid") ? (
                        <p className="mt-2 text-sm">
                          <a
                            href={edition.online_reference}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                          >
                            Collegamento online →
                          </a>
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
              <p className="text-ink-muted text-sm">
                Nessuna edizione disponibile.
              </p>
            </section>
          )}

          <RelatedLinks groups={related} />
        </Container>
      </Section>
    </main>
  );
}
