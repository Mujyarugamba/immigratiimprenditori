import Link from "next/link";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { quickAccessItems } from "@/data/home/quick-access";

const iconById: Record<string, IconName> = {
  imprese: "building",
  opportunita: "spark",
  collaborazioni: "users",
  professionisti: "briefcase",
  interprete: "globe",
  eventi: "calendar",
  racconta: "publish",
};

const highlighted = new Set([
  "imprese",
  "opportunita",
  "interprete",
  "racconta",
]);

export function QuickAccess() {
  return (
    <Section className="bg-surface-elevated py-10 sm:py-12">
      <Container>
        <HomeSectionHeader
          title="Di cosa ha bisogno oggi la tua impresa?"
          compact
        />
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {quickAccessItems.map((item) => {
            const featured = highlighted.has(item.id);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`focus-visible:outline-brand flex h-full flex-col rounded-md border p-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    featured
                      ? "border-brand/25 bg-brand-soft/50 hover:border-brand/40 hover:bg-brand-soft"
                      : "border-line bg-surface hover:border-line-strong hover:bg-surface-muted"
                  }`}
                >
                  <Icon
                    name={iconById[item.id] ?? "building"}
                    className={`mb-2.5 h-5 w-5 ${featured ? "text-brand" : "text-ink-muted"}`}
                  />
                  <span className="text-ink text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="text-ink-muted mt-1 line-clamp-2 text-xs leading-5">
                    {item.description}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
