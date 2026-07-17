import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { observatoryItems } from "@/data/home/observatory";

export function ObservatorySection() {
  const items = observatoryItems.slice(0, 3);

  return (
    <Section className="bg-ink py-14 text-white sm:py-16 lg:py-20">
      <Container>
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-brand-soft text-[11px] font-semibold tracking-[0.16em] uppercase">
              Osservatorio
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Dati, rapporti e analisi
            </h2>
            <p className="text-base leading-7 text-white/70">
              Stato di avanzamento degli indicatori in preparazione. Nessuna
              statistica inventata.
            </p>
          </div>
          <ButtonLink
            href="/osservatorio"
            variant="secondary"
            className="shrink-0 border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Vedi tutte
          </ButtonLink>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border-white/10 bg-white/5 p-4 text-white shadow-none hover:bg-white/10 hover:shadow-none"
            >
              <h3 className="text-sm font-semibold">{item.label}</h3>
              <Badge
                tone="soft"
                className="mt-2 bg-white/10 text-white ring-white/15"
              >
                {item.status}
              </Badge>
              <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/70">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
