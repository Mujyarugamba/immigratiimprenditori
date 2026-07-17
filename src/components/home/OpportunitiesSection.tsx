import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { OpportunityCard } from "@/components/home/OpportunityCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { demoOpportunities } from "@/data/home/opportunities";

export function OpportunitiesSection() {
  const items = demoOpportunities.slice(0, 3);
  const [featured, ...rest] = items;

  return (
    <Section className="bg-accent-soft/35 py-10 sm:py-12">
      <Container>
        <HomeSectionHeader
          eyebrow="Opportunità"
          title="Opportunità in evidenza"
          description="Bandi, finanziamenti e occasioni utili alle imprese."
          actionHref="/opportunita"
          actionLabel="Vedi tutte"
          compact
        />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {featured ? <OpportunityCard item={featured} featured /> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {rest.map((item) => (
              <OpportunityCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
