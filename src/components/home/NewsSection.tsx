import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { NewsCard } from "@/components/home/NewsCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { demoNews } from "@/data/home/news";

export function NewsSection() {
  const items = demoNews.slice(0, 3);

  return (
    <Section className="bg-surface py-10 sm:py-12">
      <Container>
        <HomeSectionHeader
          eyebrow="Notizie e guide"
          title="Aggiornamenti utili"
          description="Notizie, normative e guide pratiche in formato editoriale compatto."
          actionHref="/notizie-e-guide"
          actionLabel="Vedi tutte"
          compact
        />
        <div className="border-line border-t">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} layout="editorial" />
          ))}
        </div>
      </Container>
    </Section>
  );
}
