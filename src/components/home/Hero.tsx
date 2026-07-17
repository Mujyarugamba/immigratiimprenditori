import { HomeSearch } from "@/components/home/HomeSearch";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Hero() {
  return (
    <Section className="border-line bg-surface border-b py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl space-y-5">
          <h1 className="text-ink text-4xl font-semibold tracking-tight sm:text-5xl">
            Persone. Imprese. Opportunità.
          </h1>
          <p className="text-ink-muted max-w-2xl text-base leading-7 sm:text-lg">
            Cerca imprese, opportunità, professionisti e collaborazioni. Filtra
            per settore, territorio e lingua, oppure pubblica una richiesta in
            pochi minuti.
          </p>
        </div>

        <div className="mt-7 max-w-2xl">
          <HomeSearch />
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/imprese">Cerca imprese</ButtonLink>
          <ButtonLink href="/opportunita" variant="accent">
            Trova opportunità
          </ButtonLink>
          <ButtonLink href="/pubblica" variant="secondary">
            Pubblica una richiesta
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
