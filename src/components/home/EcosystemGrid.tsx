import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ecosystems } from "@/data/ecosystems";

export function EcosystemGrid() {
  return (
    <Section className="bg-surface-elevated py-12 sm:py-16">
      <Container>
        <div className="mb-8 max-w-2xl space-y-3">
          <h2 className="text-ink text-2xl font-semibold tracking-tight sm:text-3xl">
            Cinque porte d&apos;ingresso, una rete
          </h2>
          <p className="text-ink-muted text-base leading-7">
            Esplora persone, imprese, opportunità, mercati e servizi e scopri
            le relazioni che li collegano.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ecosystems.map((eco, index) => (
            <li key={eco.id}>
              <Link
                href={eco.href}
                className="border-line bg-surface hover:border-brand/40 focus-visible:outline-brand flex h-full flex-col rounded-md border p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-ink mt-2 text-base font-semibold">
                  {eco.label}
                </span>
                <span className="text-ink-muted mt-1.5 text-xs leading-5">
                  {eco.tagline}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
