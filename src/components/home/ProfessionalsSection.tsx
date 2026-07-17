import Link from "next/link";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { professionalCategories } from "@/data/home/professionals";

export function ProfessionalsSection() {
  const items = professionalCategories.slice(0, 4);

  return (
    <Section className="bg-surface py-10 sm:py-12">
      <Container>
        <HomeSectionHeader
          eyebrow="Professionisti"
          title="Competenze a supporto delle imprese"
          description="Categorie essenziali per avviare e far crescere un’attività."
          actionHref="/professionisti"
          actionLabel="Vedi tutte"
          compact
        />
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="border-line bg-surface-elevated text-ink hover:border-brand/30 hover:bg-brand-soft hover:text-brand focus-visible:outline-brand inline-flex items-center rounded-sm border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
