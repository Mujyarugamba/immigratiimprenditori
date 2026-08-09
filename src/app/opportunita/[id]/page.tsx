import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { opportunityQualifiesForCultureHub } from "@/lib/data/public/culture";
import { getPublicOpportunityById } from "@/lib/data/public/opportunities";
import { relatedForOpportunity } from "@/lib/data/public/related";
import {
  formatItalianDate,
  label,
  OPPORTUNITY_ORIGINS,
  OPPORTUNITY_STATUSES,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getPublicOpportunityById(id);
  if (!opportunity) {
    return { title: "Non trovato" };
  }
  return {
    title: opportunity.title,
    description: opportunity.summary ?? undefined,
  };
}

export default async function OpportunitaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const opportunity = await getPublicOpportunityById(id);

  if (!opportunity) {
    notFound();
  }

  const [related, showCulture] = await Promise.all([
    relatedForOpportunity(opportunity.id).catch(() => []),
    opportunityQualifiesForCultureHub(opportunity.id).catch(() => false),
  ]);

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/opportunita"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;elenco opportunità
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
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">
              {label(OPPORTUNITY_ORIGINS, opportunity.origin)}
            </Badge>
            <Badge tone="soft">
              {label(OPPORTUNITY_STATUSES, opportunity.substantial_status)}
            </Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {opportunity.title}
          </h1>
          {opportunity.summary ? (
            <p className="text-ink-muted text-lg leading-7">{opportunity.summary}</p>
          ) : null}
          {opportunity.platform_published_at ? (
            <p className="text-ink-muted text-sm">
              Pubblicata il {formatItalianDate(opportunity.platform_published_at)}
            </p>
          ) : null}
        </header>

        {opportunity.description ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {opportunity.description}
            </p>
          </section>
        ) : null}

        {opportunity.purpose ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Finalità</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {opportunity.purpose}
            </p>
          </section>
        ) : null}

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
