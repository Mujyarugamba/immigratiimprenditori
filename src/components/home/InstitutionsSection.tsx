import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { institutionCategories } from "@/data/home/institutions";

export function InstitutionsSection() {
  const items = institutionCategories.slice(0, 4);

  return (
    <Section className="bg-surface-elevated py-6 sm:py-7">
      <Container>
        <div className="border-line bg-surface flex flex-col gap-4 rounded-md border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="max-w-xl space-y-1.5">
            <p className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
              Enti e istituzioni
            </p>
            <h2 className="text-ink text-lg font-semibold tracking-tight">
              Spazio per enti, istituzioni e organizzazioni
            </h2>
            <p className="text-ink-muted text-sm">
              Pubblicate opportunità, eventi e servizi rivolti alle imprese.
            </p>
            <ul className="text-ink-muted flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="hover:text-brand">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ButtonLink href="/pubblica" variant="secondary" className="shrink-0">
            Partecipa come ente
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
