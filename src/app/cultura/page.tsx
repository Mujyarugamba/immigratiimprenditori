import type { Metadata } from "next";
import Link from "next/link";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { loadCultureHub } from "@/lib/data/public/culture";
import {
  EVENT_DELIVERY_MODES,
  formatItalianDateTime,
  label,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Cultura",
  description:
    "Eventi, storie e approfondimenti dedicati alla cultura e alle industrie creative.",
};

export default async function CulturaHubPage() {
  const { events, contents } = await loadCultureHub();

  return (
    <>
      <Section>
        <Container className="max-w-3xl space-y-6">
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            Cultura, incontri, storie.
          </h1>
          <p className="text-ink-muted text-lg leading-7">
            Eventi culturali, esperienze e approfondimenti raccolti dal Centro
            Studi in un unico spazio editoriale.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link className="text-brand hover:text-brand-dark" href="/eventi">
              Tutti gli eventi
            </Link>
            <Link className="text-brand hover:text-brand-dark" href="/contenuti">
              Tutti i contenuti
            </Link>
          </div>
        </Container>
      </Section>

      <Section id="incontri" className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 max-w-2xl space-y-2">
            <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
              Incontri
            </p>
            <h2 className="text-ink text-2xl font-semibold tracking-tight">
              Eventi culturali
            </h2>
            <p className="text-ink-muted text-sm leading-6">
              Concerti, mostre, festival e altri appuntamenti culturali.
            </p>
          </div>
          {events.length === 0 ? (
            <PublicEmpty title="Nessun incontro culturale in programma." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={`/eventi/${item.id}`}
                  title={item.title}
                  description={item.summary}
                  badges={[label(EVENT_DELIVERY_MODES, item.delivery_mode)]}
                  meta={
                    item.next_edition
                      ? ([
                          formatItalianDateTime(item.next_edition.starts_at),
                          item.next_edition.city_text ?? undefined,
                        ].filter(Boolean) as string[])
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section id="storie" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 max-w-2xl space-y-2">
            <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
              Storie e approfondimenti
            </p>
            <h2 className="text-ink text-2xl font-semibold tracking-tight">
              Cultura da leggere
            </h2>
            <p className="text-ink-muted text-sm leading-6">
              Notizie, guide, esperienze e racconti selezionati dal Centro Studi.
            </p>
          </div>
          {contents.length === 0 ? (
            <PublicEmpty title="Nessun contenuto culturale disponibile." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contents.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={`/contenuti/${item.slug}`}
                  title={item.title}
                  description={item.abstract}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
