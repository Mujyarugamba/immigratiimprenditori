import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";
import { SectionIntro } from "@/components/ui/SectionIntro";
import type { SectionContent } from "@/types/section";

type SectionPageProps = SectionContent;

export function SectionPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: SectionPageProps) {
  return (
    <Section>
      <Container>
        <SectionIntro title={title} description={description} />
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Container>
    </Section>
  );
}
