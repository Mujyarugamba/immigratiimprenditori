import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicFilters, type FilterField } from "@/components/public/PublicFilters";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import type { PaginatedResult } from "@/lib/data/public/paging";

export type PublicListCard = {
  href: string;
  title: string;
  description?: string | null;
  meta?: string[];
  badges?: string[];
};

type PublicListLayoutProps<T> = {
  title: string;
  description: string;
  basePath: string;
  filters: FilterField[];
  filterValues: Record<string, string>;
  result: PaginatedResult<T>;
  mapItem: (item: T) => PublicListCard;
  emptyTitle?: string;
  emptyDescription?: string;
  banner?: React.ReactNode;
};

export function PublicListLayout<T>({
  title,
  description,
  basePath,
  filters,
  filterValues,
  result,
  mapItem,
  emptyTitle,
  emptyDescription,
  banner,
}: PublicListLayoutProps<T>) {
  return (
    <Section>
      <Container>
        <PublicPageHeader title={title} description={description} />
        {banner}
        {filters.length > 0 ? (
          <PublicFilters
            action={basePath}
            fields={filters}
            values={filterValues}
          />
        ) : null}

        {result.total === 0 ? (
          <PublicEmpty title={emptyTitle} description={emptyDescription} />
        ) : (
          <>
            <p className="text-ink-muted mt-6 text-sm">
              {result.total} risultat{result.total === 1 ? "o" : "i"}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((item, index) => {
                const card = mapItem(item);
                return (
                  <PublicResultCard
                    key={`${card.href}-${index}`}
                    href={card.href}
                    title={card.title}
                    description={card.description}
                    meta={card.meta}
                    badges={card.badges}
                  />
                );
              })}
            </div>
            <PublicPagination
              basePath={basePath}
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              filters={filterValues}
            />
          </>
        )}
      </Container>
    </Section>
  );
}
