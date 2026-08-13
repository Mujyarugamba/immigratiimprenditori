import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  getPublicMarketByCode,
  listPublicMarketSupportResources,
} from "@/lib/data/public/markets";
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

  const [related, supportResources] = await Promise.all([
    relatedForMarket(market.id).catch(() => []),
    listPublicMarketSupportResources(market.id).catch(() => []),
  ]);

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

        {supportResources.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-ink text-xl font-semibold">
              Indicatori di contesto
            </h2>
            <p className="text-ink-muted text-sm leading-6">
              Dati World Bank (CC BY 4.0). Valori annuali selezionati dalla
              redazione.
            </p>
            <ul className="space-y-4">
              {supportResources.map((res) => (
                <li key={res.id} className="border-line border-t pt-4">
                  <h3 className="text-ink text-base font-semibold">
                    {res.indicatorLabel}
                  </h3>
                  <p className="text-ink mt-1 text-sm tabular-nums">
                    {res.periodYear ? `${res.periodYear}: ` : null}
                    {res.valueDisplay}
                    {res.unit ? (
                      <span className="text-ink-muted"> · {res.unit}</span>
                    ) : null}
                  </p>
                  <p className="text-ink-muted mt-1 text-xs">
                    Fonte: {res.sourceLabel}
                    {res.indicatorCode ? (
                      <span className="font-mono"> · {res.indicatorCode}</span>
                    ) : null}
                    {res.websiteUrl ? (
                      <>
                        {" · "}
                        <a
                          href={res.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline"
                        >
                          dati ufficiali
                        </a>
                      </>
                    ) : null}
                  </p>
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
