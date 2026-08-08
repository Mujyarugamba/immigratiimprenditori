export const DEFAULT_PAGE_SIZE = 12;

export type PageParams = {
  page: number;
  pageSize: number;
  from: number;
  to: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function parsePageParams(
  searchParams: Record<string, string | string[] | undefined>,
  pageSize = DEFAULT_PAGE_SIZE,
): PageParams {
  const raw = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const page = Math.max(1, Number.parseInt(raw ?? "1", 10) || 1);
  const from = (page - 1) * pageSize;
  return { page, pageSize, from, to: from + pageSize - 1 };
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function param(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = searchParams[key];
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

export function buildQueryString(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined> = {},
): string {
  const merged = { ...base, ...overrides };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value && value.length > 0) qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}
