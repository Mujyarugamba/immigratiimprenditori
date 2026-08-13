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

  const deadlineLabel = opportunity.openEnded
    ? "Senza scadenza indicata"
    : opportunity.closesAt
      ? formatItalianDate(opportunity.closesAt)
      : "Non indicata";

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
            <Badge tone="soft">{opportunity.temporalLabel}</Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {opportunity.title}
          </h1>
          {opportunity.summary ? (
            <p className="text-ink-muted text-lg leading-7">{opportunity.summary}</p>
          ) : null}
        </header>

        <dl className="border-line grid gap-4 border-y py-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">Ente</dt>
            <dd className="text-ink mt-1">{opportunity.authority ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Territorio</dt>
            <dd className="text-ink mt-1">{opportunity.territory ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Scadenza / sportello</dt>
            <dd className="text-ink mt-1">
              {deadlineLabel}
              {opportunity.temporalCode !== "open_ended" &&
              opportunity.temporalCode !== "unknown" ? (
                <span className="text-ink-muted"> · {opportunity.temporalLabel}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted">Fonte</dt>
            <dd className="text-ink mt-1">
              {opportunity.sourceLabel ?? "Fonte ufficiale"}
              {opportunity.attribution ? (
                <span className="text-ink-muted block text-xs leading-5">
                  {opportunity.attribution}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        {opportunity.officialUrl ? (
          <p>
            <a
              href={opportunity.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-brand text-brand-fg inline-flex rounded-md px-4 py-2 text-sm font-medium hover:opacity-95"
            >
              Vai alla pagina ufficiale
            </a>
          </p>
        ) : null}

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

        {opportunity.platform_published_at ? (
          <p className="text-ink-muted text-sm">
            Pubblicata sul portale il{" "}
            {formatItalianDate(opportunity.platform_published_at)}
          </p>
        ) : null}

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
