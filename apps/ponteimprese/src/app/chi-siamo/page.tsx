import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  PLATFORM_IDENTITY,
  PLATFORM_VALUE_PROPOSITION,
} from "@/data/ecosystems";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "Chi c’è dietro Immigrati Imprenditori e perché esiste questa rete.",
};

export default function ChiSiamoPage() {
  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <header className="space-y-4">
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            Chi siamo
          </h1>
          <p className="text-ink-muted text-lg leading-7">
            {siteConfig.description}
          </p>
        </header>

        <div className="space-y-4">
          <p className="text-ink text-base font-semibold tracking-tight">
            {PLATFORM_IDENTITY}
          </p>
          <p className="text-ink-muted text-sm leading-7">
            {PLATFORM_VALUE_PROPOSITION}
          </p>
          <p className="text-ink-muted text-sm leading-7">
            Persone, imprese, professionisti e organizzazioni possono
            presentarsi, trovare opportunità, collaborare, offrire o cercare
            servizi, partecipare a eventi ed esplorare mercati internazionali.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/registrati" variant="accent">
            Entra nella rete
          </ButtonLink>
          <ButtonLink href="/persone" variant="secondary">
            Esplora le persone
          </ButtonLink>
          <ButtonLink href="/contatti" variant="ghost">
            Contattaci
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
