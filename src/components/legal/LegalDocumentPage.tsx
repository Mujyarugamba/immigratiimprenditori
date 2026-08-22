import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { loadPublicLegalMarkdown } from "@/lib/legal/load-public-document";
import type { LegalDocId } from "@/lib/legal/versions";

type Props = {
  docId: LegalDocId;
  title: string;
  description: string;
};

export function LegalDocumentPage({ docId, title, description }: Props) {
  const markdown = loadPublicLegalMarkdown(docId);
  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-ink-subtle text-xs font-medium tracking-[0.14em] uppercase">
            Metodo e fonti
          </p>
          <h1 className="sr-only">{title}</h1>
          <p className="text-ink-muted text-sm leading-6">{description}</p>
        </header>
        <LegalMarkdown markdown={markdown} />
      </Container>
    </Section>
  );
}
