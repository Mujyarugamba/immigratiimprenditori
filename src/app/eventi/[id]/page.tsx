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
    return { title: "Non trovato" };
  }
  return {
    title: event.title,
    description: event.summary ?? undefined,
  };
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

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
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
              {event.editions.map((edition) => (
                <li
                  key={edition.id}
                  className="border-line bg-surface-elevated rounded-md border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink text-sm font-medium">
                      {formatItalianDateTime(edition.starts_at)}
                      {edition.ends_at
                        ? ` – ${formatItalianDateTime(edition.ends_at)}`
                        : null}
                    </p>
                    <Badge tone="soft">
                      {label(EDITION_STATUSES, edition.occurrence_status)}
                    </Badge>
                  </div>
                  {edition.city_text || edition.country_ref ? (
                    <p className="text-ink-muted mt-2 text-sm">
                      {[edition.city_text, edition.country_ref]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
