import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Come entrare in contatto con Immigrati Imprenditori.",
};

export default function ContattiPage() {
  const email = `info@${siteConfig.domain}`;

  return (
    <Section>
      <Container className="max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            Contatti
          </h1>
          <p className="text-ink-muted text-lg leading-7">
            Per informazioni sulla piattaforma, scrivici. Ti risponderemo appena
            possibile.
          </p>
        </header>

        <div className="border-line bg-surface-elevated rounded-md border p-5">
          <p className="text-ink-subtle text-xs font-semibold tracking-[0.14em] uppercase">
            Email
          </p>
          <a
            href={`mailto:${email}`}
            className="text-brand mt-2 inline-block text-base font-semibold hover:underline"
          >
            {email}
          </a>
        </div>
      </Container>
    </Section>
  );
}
