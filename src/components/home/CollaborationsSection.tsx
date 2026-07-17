import { CollaborationCard } from "@/components/home/CollaborationCard";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { demoCollaborations } from "@/data/home/collaborations";

export function CollaborationsSection() {
  const items = demoCollaborations.slice(0, 3);
  const [featured, ...rest] = items;

  return (
    <Section className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
      <Container>
        <HomeSectionHeader
          eyebrow="Collaborazioni"
          title="Domanda e offerta tra imprese"
          description="Richieste di fornitura, partnership e servizi professionali."
          actionHref="/collaborazioni"
          actionLabel="Vedi tutte"
        />
        <div className="space-y-3">
          {featured ? (
            <CollaborationCard item={featured} layout="horizontal" />
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {rest.map((item) => (
              <CollaborationCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
