import type { AppError } from "@/lib/errors/app-error";

const LIST_PAGE_SIZE = 50;

export type EditorialMarketResourceListItem = {
  id: string;
  name: string;
  summary: string | null;
  website_url: string | null;
  verification_status: string;
  visibility_status: string;
  substantial_status: string;
  updated_at: string;
  countryLabel: string;
  countryRef: string;
  marketCode: string;
  marketName: string;
  marketEditorialStatus: string;
  indicatorCode: string | null;
  indicatorLabel: string;
  periodYear: string | null;
  valueDisplay: string;
  unit: string | null;
  naturalKey: string | null;
  sourceLabel: string;
  editorialClass: "review" | "published" | "questionable" | "rejected";
};

export type EditorialMarketResourceDetail = EditorialMarketResourceListItem & {
  definition: string | null;
  contact_note: string | null;
  territorial_scope_note: string | null;
  resource_kind: string;
  marketId: string;
};

const PONTE_ONLY_ERROR: AppError = {
  code: "not_found",
  message: "La gestione dei mercati internazionali è disponibile in PonteImprese.",
};

export async function listEditorialMarketResources(params: {
  q?: string;
  stato?: string;
  page?: string;
}): Promise<{
  items: EditorialMarketResourceListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  return { items: [], total: 0, page, pageSize: LIST_PAGE_SIZE };
}

export async function getEditorialMarketResourceById(
  _id: string,
): Promise<EditorialMarketResourceDetail | null> {
  return null;
}

export async function publishEditorialMarketResource(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function markQuestionableEditorialMarketResource(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function rejectEditorialMarketResource(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function withdrawEditorialMarketResource(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}
