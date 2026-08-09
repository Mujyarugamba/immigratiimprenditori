import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { isCultureClassifiedService } from "@/lib/data/public/culture";
import { getPublicServiceOfferById } from "@/lib/data/public/services";
import { relatedForServiceOffer } from "@/lib/data/public/related";
import {
  label,
  SERVICE_CATEGORIES,
  SERVICE_DELIVERY_MODES,
  SERVICE_OFFER_AVAILABILITY,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = await getPublicServiceOfferById(id);
  if (!offer) {
    return { title: "Non trovato" };
  }
  return {
    title: offer.title,
    description: offer.summary ?? undefined,
  };
}

export default async function ServizioOffertaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const offer = await getPublicServiceOfferById(id);

  if (!offer) {
    notFound();
  }

  const related = await relatedForServiceOffer(offer).catch(() => []);

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/servizi"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;elenco servizi
          </Link>
          {isCultureClassifiedService({
            categoryCode: offer.category_code,
          }) ? (
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
            <Badge tone="brand">Offerta</Badge>
            <Badge tone="soft">
              {label(SERVICE_CATEGORIES, offer.category_code)}
            </Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {offer.title}
          </h1>
          {offer.summary ? (
            <p className="text-ink-muted text-lg leading-7">{offer.summary}</p>
          ) : null}
        </header>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {offer.description}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Modalità di erogazione</h2>
          <p className="text-ink-muted text-sm">
            {label(SERVICE_DELIVERY_MODES, offer.delivery_mode)}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Disponibilità</h2>
          <p className="text-ink-muted text-sm">
            {label(SERVICE_OFFER_AVAILABILITY, offer.availability_status)}
          </p>
        </section>

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
