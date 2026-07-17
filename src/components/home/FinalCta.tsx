import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function FinalCta() {
  return (
    <Section className="bg-surface py-16 sm:py-20">
      <Container>
        <div className="border-line bg-surface-elevated flex flex-col gap-6 border px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12">
          <div className="max-w-xl space-y-3">
            <h2 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
              Cerchi qualcosa per la tua impresa?
            </h2>
            <p className="text-ink-muted text-base leading-7">
              Pubblica una richiesta, presenta la tua impresa o condividi
              un’opportunità di collaborazione.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink href="/pubblica" variant="accent">
              Pubblica una richiesta
            </ButtonLink>
            <ButtonLink href="/pubblica" variant="secondary">
              Presenta la tua impresa
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
