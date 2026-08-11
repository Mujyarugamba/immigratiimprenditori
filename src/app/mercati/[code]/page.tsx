import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicMarketByCode } from "@/lib/data/public/markets";
import { relatedForMarket } from "@/lib/data/public/related";
import {
  label,
  MARKET_KINDS,
  MARKET_STATUSES,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const market = await getPublicMarketByCode(code);
  if (!market) {
    return { title: "Non trovato" };
  }
  return {
    title: market.name,
    description: market.summary ?? undefined,
  };
}

export default async function MercatoDetailPage({ params }: PageProps) {
  const { code } = await params;
  const market = await getPublicMarketByCode(code);

  if (!market) {
    notFound();
  }

  const related = await relatedForMarket(market.id).catch(() => []);

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <Link
          href="/mercati"
          className="text-brand hover:text-brand-dark text-sm font-medium"
        >
          ← Torna all&apos;elenco mercati
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{label(MARKET_KINDS, market.market_kind)}</Badge>
            <Badge tone="soft">
              {label(MARKET_STATUSES, market.substantial_status)}
            </Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {market.name}
          </h1>
          {market.summary ? (
            <p className="text-ink-muted text-lg leading-7">{market.summary}</p>
          ) : null}
        </header>

        {market.description ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {market.description}
            </p>
          </section>
        ) : null}

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
