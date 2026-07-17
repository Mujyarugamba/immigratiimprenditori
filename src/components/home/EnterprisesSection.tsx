import { EnterpriseCard } from "@/components/home/EnterpriseCard";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { demoEnterprises } from "@/data/home/enterprises";

export function EnterprisesSection() {
  const items = demoEnterprises.slice(0, 3);

  return (
    <Section className="bg-surface py-14 sm:py-16 lg:py-20">
      <Container>
        <HomeSectionHeader
          eyebrow="Imprese"
          title="Imprese in evidenza"
          description="Schede dimostrative con nomi fittizi, senza riferimenti a aziende reali."
          actionHref="/imprese"
          actionLabel="Vedi tutte"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <EnterpriseCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
