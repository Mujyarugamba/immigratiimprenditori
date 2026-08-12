import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export type HomeCard = {
  href: string;
  title: string;
  description?: string | null;
  meta?: string[];
  badges?: string[];
};

type HomeDomainSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  items: HomeCard[];
  /** Background / border utilities only — vertical padding is density-aware. */
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

function stripPy(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token && !/^py-/.test(token) && !/^sm:py-/.test(token) && !/^lg:py-/.test(token))
    .join(" ");
}

export function HomeDomainSection({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  items,
  className = "bg-surface",
  emptyTitle = "Nessun risultato.",
  emptyDescription,
}: HomeDomainSectionProps) {
  const empty = items.length === 0;
  const tone = stripPy(className);
  const padding = empty ? "py-6 sm:py-7" : "py-8 sm:py-10";

  return (
    <Section className={`${tone} ${padding}`.trim()}>
      <Container>
        <HomeSectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actionHref={actionHref}
          actionLabel={actionLabel}
          compact={empty}
        />
        {empty ? (
          <PublicEmpty title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PublicResultCard
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
                meta={item.meta}
                badges={item.badges}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
