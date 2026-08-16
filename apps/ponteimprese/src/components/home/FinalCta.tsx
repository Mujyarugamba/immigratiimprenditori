import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function FinalCta() {
  return (
    <Section className="bg-surface py-10 sm:py-12">
      <Container>
        <div className="border-line bg-surface-elevated flex flex-col gap-5 border px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
          <div className="max-w-xl space-y-2">
            <h2 className="text-ink text-2xl font-semibold tracking-tight sm:text-3xl">
              Entra nella rete e fatti conoscere
            </h2>
            <p className="text-ink-muted text-base leading-7">
              Crea il profilo, presenta l&apos;impresa, pubblica un&apos;opportunità
              o indica i tuoi mercati. Accedi per pubblicare; tutti possono
              esplorare.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/registrati" variant="accent">
              Crea il tuo profilo
            </ButtonLink>
            <ButtonLink href="/app/imprese" variant="secondary">
              Collega la tua impresa
            </ButtonLink>
            <ButtonLink href="/pubblica" variant="secondary">
              Pubblica
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
