import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicBusinessById } from "@/lib/data/public/businesses";
import { isCultureClassifiedBusiness } from "@/lib/data/public/culture";
import { relatedForBusiness } from "@/lib/data/public/related";
import { label, ORGANIZATION_FORMS } from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await getPublicBusinessById(id);
  if (!business) {
    return { title: "Non trovato" };
  }
  return {
    title: business.public_name,
    description: business.summary ?? undefined,
  };
}

export default async function ImpresaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const business = await getPublicBusinessById(id);

  if (!business) {
    notFound();
  }

  const primarySectors = business.sectors.filter((s) => s.is_primary);
  const otherSectors = business.sectors.filter((s) => !s.is_primary);
  const related = await relatedForBusiness(business.id).catch(() => []);
  const showCulture = isCultureClassifiedBusiness({
    sectorSlugs: business.sectors.map((s) => s.slug),
  });

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/imprese"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;elenco imprese
          </Link>
          {showCulture ? (
            <Link
              href="/cultura"
              className="text-brand hover:text-brand-dark text-sm font-medium"
            >
              Esplora Cultura
            </Link>
          ) : null}
        </div>

        <header className="space-y-4">
          {business.organization_form ? (
            <Badge tone="brand">
              {label(ORGANIZATION_FORMS, business.organization_form)}
            </Badge>
          ) : null}
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {business.public_name}
          </h1>
          {business.legal_name !== business.public_name ? (
            <p className="text-ink-muted text-sm">{business.legal_name}</p>
          ) : null}
          {business.summary ? (
            <p className="text-ink-muted text-lg leading-7">{business.summary}</p>
          ) : null}
        </header>

        {business.description ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Presentazione</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {business.description}
            </p>
          </section>
        ) : null}

        {business.sectors.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Settori</h2>
            <div className="flex flex-wrap gap-2">
              {primarySectors.map((sector) => (
                <Badge key={sector.id} tone="accent">
                  {sector.name}
                </Badge>
              ))}
              {otherSectors.map((sector) => (
                <Badge key={sector.id} tone="soft">
                  {sector.name}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {business.locations.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Presenza territoriale</h2>
            <ul className="text-ink-muted list-inside list-disc space-y-1 text-sm">
              {business.locations.map((location) => (
                <li key={location.territory_reference}>
                  {location.territory_reference}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {business.organization_form ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Forma organizzativa</h2>
            <p className="text-ink-muted text-sm">
              {label(ORGANIZATION_FORMS, business.organization_form)}
            </p>
          </section>
        ) : null}

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
