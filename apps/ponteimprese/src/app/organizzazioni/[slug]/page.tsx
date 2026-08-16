import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { isCultureClassifiedOrganization } from "@/lib/data/public/culture";
import { getPublicOrganizationBySlug } from "@/lib/data/public/organizations";
import { label, OFFICIAL_ROLES, ORGANIZATION_TYPES } from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const organization = await getPublicOrganizationBySlug(slug);
  if (!organization) {
    return { title: "Non trovato" };
  }
  return {
    title: organization.name,
    description: organization.summary ?? undefined,
  };
}

export default async function OrganizzazioneDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const organization = await getPublicOrganizationBySlug(slug);

  if (!organization) {
    notFound();
  }

  const seat = [
    organization.seat_city_label,
    organization.seat_region_label,
    organization.seat_country_label,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/organizzazioni"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;elenco organizzazioni
          </Link>
          {isCultureClassifiedOrganization({
            typeCode: organization.type_code,
            primaryScopeCode: organization.primary_scope_code,
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
          <Badge tone="brand">
            {label(ORGANIZATION_TYPES, organization.type_code)}
          </Badge>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {organization.name}
          </h1>
          {organization.summary ? (
            <p className="text-ink-muted text-lg leading-7">{organization.summary}</p>
          ) : null}
        </header>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {organization.description}
          </p>
        </section>

        {seat ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Sede</h2>
            <p className="text-ink-muted text-sm">{seat}</p>
          </section>
        ) : null}

        {organization.officials.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Referenti</h2>
            <ul className="text-ink-muted space-y-2 text-sm">
              {organization.officials.map((official) => (
                <li key={official.id}>
                  <span className="text-ink font-medium">{official.name}</span>
                  {" — "}
                  {label(OFFICIAL_ROLES, official.role_kind)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </Section>
  );
}
