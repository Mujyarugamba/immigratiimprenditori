import { EventCard } from "@/components/home/EventCard";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { demoEvents } from "@/data/home/events";

export function EventsSection() {
  const items = demoEvents.slice(0, 3);

  return (
    <Section className="bg-surface-elevated py-10 sm:py-12">
      <Container>
        <HomeSectionHeader
          eyebrow="Eventi"
          title="Prossimi appuntamenti"
          description="Networking, workshop, fiere e incontri B2B."
          actionHref="/eventi"
          actionLabel="Vedi tutte"
          compact
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
