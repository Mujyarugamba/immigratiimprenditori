import Link from "next/link";
import { buildQueryString } from "@/lib/data/public/paging";

type PublicPaginationProps = {
  basePath: string;
  page: number;
  pageCount: number;
  total: number;
  filters: Record<string, string>;
};

export function PublicPagination({
  basePath,
  page,
  pageCount,
  total,
  filters,
}: PublicPaginationProps) {
  if (total === 0 || pageCount <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < pageCount ? page + 1 : null;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
      aria-label="Paginazione"
    >
      <p className="text-ink-muted text-sm">
        Pagina {page} di {pageCount} · {total} risultati
      </p>
      <div className="flex gap-3">
        {prev ? (
          <Link
            href={`${basePath}${buildQueryString(filters, { page: String(prev) })}`}
            className="text-brand text-sm font-semibold"
          >
            Precedente
          </Link>
        ) : (
          <span className="text-ink-muted text-sm">Precedente</span>
        )}
        {next ? (
          <Link
            href={`${basePath}${buildQueryString(filters, { page: String(next) })}`}
            className="text-brand text-sm font-semibold"
          >
            Successiva
          </Link>
        ) : (
          <span className="text-ink-muted text-sm">Successiva</span>
        )}
      </div>
    </nav>
  );
}
