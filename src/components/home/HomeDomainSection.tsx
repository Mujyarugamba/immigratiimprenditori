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
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function HomeDomainSection({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  items,
  className = "bg-surface py-14 sm:py-16 lg:py-20",
  emptyTitle = "Ancora niente da mostrare",
  emptyDescription = "Quando ci saranno contenuti in questa sezione, li troverai qui.",
}: HomeDomainSectionProps) {
  return (
    <Section className={className}>
      <Container>
        <HomeSectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actionHref={actionHref}
          actionLabel={actionLabel}
        />
        {items.length === 0 ? (
          <PublicEmpty title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
