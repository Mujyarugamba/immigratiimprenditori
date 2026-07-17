import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { StoryCard } from "@/components/home/StoryCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { demoStories } from "@/data/home/stories";

export function StoriesSection() {
  const items = demoStories.slice(0, 3);
  const [featured, ...rest] = items;

  return (
    <Section className="bg-surface-elevated py-16 sm:py-20 lg:py-24">
      <Container>
        <HomeSectionHeader
          eyebrow="Storie"
          title="Storie di impresa"
          description="Percorsi imprenditoriali raccontati in chiave editoriale."
          actionHref="/notizie-e-guide"
          actionLabel="Vedi tutte"
        />
        <div className="space-y-4">
          {featured ? <StoryCard item={featured} featured /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            {rest.map((item) => (
              <StoryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
