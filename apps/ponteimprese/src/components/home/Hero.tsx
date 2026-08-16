import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  PLATFORM_IDENTITY,
  PLATFORM_VALUE_PROPOSITION,
} from "@/data/ecosystems";
import { HomeSearch } from "@/components/home/HomeSearch";

export function Hero() {
  return (
    <Section className="border-line bg-surface border-b py-8 sm:py-11">
      <Container>
        <div className="max-w-3xl space-y-4">
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            Rete economica digitale
          </p>
          <h1 className="text-ink text-4xl font-semibold tracking-tight sm:text-5xl">
            {PLATFORM_IDENTITY}
          </h1>
          <p className="text-ink-muted max-w-2xl text-base leading-7 sm:text-lg">
            {PLATFORM_VALUE_PROPOSITION}
          </p>
        </div>

        <div className="mt-7 max-w-2xl">
          <HomeSearch />
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/persone">Esplora le persone</ButtonLink>
          <ButtonLink href="/imprese" variant="accent">
            Scopri le imprese
          </ButtonLink>
          <ButtonLink href="/registrati" variant="secondary">
            Entra nella rete
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
