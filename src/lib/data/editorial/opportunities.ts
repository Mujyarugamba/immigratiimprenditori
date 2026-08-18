import {
  paginated,
  parsePageParams,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import type { AppError } from "@/lib/errors/app-error";
import type { TemporalLabelCode } from "@/lib/opportunities/temporal-label";

const LIST_PAGE_SIZE = 30;

export type EditorialOpportunityListItem = {
  id: string;
  title: string;
  summary: string | null;
  origin: string;
  editorial_status: string;
  publication_status: string;
  visibility_level: string;
  substantial_status: string;
  updated_at: string;
  sourceLabel: string;
  authority: string | null;
  officialUrl: string | null;
  externalIdentifier: string | null;
  consultedAt: string | null;
  sourceUpdatedAt: string | null;
  territory: string | null;
  opensAt: string | null;
  closesAt: string | null;
  openEnded: boolean;
  temporalCode: TemporalLabelCode;
  temporalLabel: string;
};

export type EditorialOpportunityDetail = EditorialOpportunityListItem & {
  description: string | null;
  purpose: string | null;
  platform_published_at: string | null;
  platform_withdrawn_at: string | null;
  referenceText: string | null;
  territories: string[];
};

export type EditorialOpportunitySearchParams = {
  q?: string;
  stato?: string;
  origine?: string;
  temporale?: string;
  page?: string;
};

export type UpdateEditorialOpportunityPatch = {
  summary?: string | null;
  description?: string | null;
  purpose?: string | null;
};

const PONTE_ONLY_ERROR: AppError = {
  code: "not_found",
  message: "La gestione delle opportunità è disponibile in PonteImprese.",
};

export async function listEditorialOpportunities(
  searchParams: EditorialOpportunitySearchParams = {},
): Promise<PaginatedResult<EditorialOpportunityListItem>> {
  const { page } = parsePageParams(searchParams, LIST_PAGE_SIZE);
  return paginated([], 0, page, LIST_PAGE_SIZE);
}

export async function getEditorialOpportunityById(
  _id: string,
): Promise<EditorialOpportunityDetail | null> {
  return null;
}

export async function updateEditorialOpportunity(
  _id: string,
  _patch: UpdateEditorialOpportunityPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function publishEditorialOpportunity(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function rejectEditorialOpportunity(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}

export async function withdrawEditorialOpportunity(
  _id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  return { ok: false, error: PONTE_ONLY_ERROR };
}
