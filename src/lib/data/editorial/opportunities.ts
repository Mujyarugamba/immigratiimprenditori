import {
  paginated,
  parsePageParams,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import {
  deriveTemporalLabel,
  temporalLabelIt,
  type TemporalLabelCode,
} from "@/lib/opportunities/temporal-label";
import { createClient } from "@/lib/supabase/server";

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

function sourceLabelFromExternalId(externalId: string | null): string {
  if (!externalId) return "Rete / inserimento diretto";
  if (externalId.startsWith("incentivi-gov:")) return "Incentivi.gov";
  if (externalId.startsWith("eu-funding:")) return "EU Funding & Tenders";
  return "Fonte esterna";
}

function parseSourceUpdated(version: string | null): string | null {
  if (!version || version === "source_updated_at_unavailable") return null;
  const ms = Date.parse(version);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

export async function listEditorialOpportunities(
  searchParams: EditorialOpportunitySearchParams = {},
): Promise<PaginatedResult<EditorialOpportunityListItem>> {
  const { page, from, to } = parsePageParams(searchParams, LIST_PAGE_SIZE);
  const supabase = await createClient();

  let query = supabase
    .from("opportunities")
    .select(
      `
      id, title, summary, origin, editorial_status, publication_status,
      visibility_level, substantial_status, updated_at,
      opportunity_sources (
        authority, url, external_identifier, consulted_at, version, status, is_primary
      ),
      opportunity_time_windows (
        opens_at, closes_at, open_ended, superseded_at, kind
      ),
      opportunity_market_references (
        territory_label
      )
    `,
      { count: "exact" },
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const q = searchParams.q?.trim();
  if (q) query = query.ilike("title", `%${q}%`);

  const stato = searchParams.stato?.trim();
  if (stato === "review") {
    query = query
      .eq("editorial_status", "in_review")
      .eq("publication_status", "unpublished");
  } else if (stato === "published") {
    query = query.eq("publication_status", "published");
  } else if (stato === "withdrawn") {
    query = query.eq("publication_status", "withdrawn");
  }

  const origine = searchParams.origine?.trim();
  if (origine === "external" || origine === "internal") {
    query = query.eq("origin", origine);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    return paginated([], 0, page, LIST_PAGE_SIZE);
  }

  const temporale = searchParams.temporale?.trim();
  const items = (data ?? [])
    .map((row) => mapListRow(row as Record<string, unknown>))
    .filter((item) => {
      if (!temporale) return true;
      return item.temporalCode === temporale;
    });

  return paginated(items, count ?? items.length, page, LIST_PAGE_SIZE);
}

function mapListRow(row: Record<string, unknown>): EditorialOpportunityListItem {
  const sources = (row.opportunity_sources as Array<Record<string, unknown>>) ?? [];
  const primary =
    sources.find((s) => s.is_primary && s.status === "active") ??
    sources.find((s) => s.status === "active") ??
    sources[0];
  const windows =
    (row.opportunity_time_windows as Array<Record<string, unknown>>) ?? [];
  const window =
    windows.find((w) => w.kind === "access" && w.superseded_at == null) ??
    windows[0];
  const territories =
    (row.opportunity_market_references as Array<{ territory_label?: string }>) ??
    [];
  const opensAt = (window?.opens_at as string | null) ?? null;
  const closesAt = (window?.closes_at as string | null) ?? null;
  const openEnded = Boolean(window?.open_ended);
  const temporalCode = deriveTemporalLabel({
    opensAt,
    closesAt,
    openEnded,
  });
  const externalId = (primary?.external_identifier as string | null) ?? null;

  return {
    id: row.id as string,
    title: row.title as string,
    summary: (row.summary as string | null) ?? null,
    origin: row.origin as string,
    editorial_status: row.editorial_status as string,
    publication_status: row.publication_status as string,
    visibility_level: row.visibility_level as string,
    substantial_status: row.substantial_status as string,
    updated_at: row.updated_at as string,
    sourceLabel: sourceLabelFromExternalId(externalId),
    authority: (primary?.authority as string | null) ?? null,
    officialUrl: (primary?.url as string | null) ?? null,
    externalIdentifier: externalId,
    consultedAt: (primary?.consulted_at as string | null) ?? null,
    sourceUpdatedAt: parseSourceUpdated(
      (primary?.version as string | null) ?? null,
    ),
    territory: territories.map((t) => t.territory_label).filter(Boolean).join(", ") || null,
    opensAt,
    closesAt,
    openEnded,
    temporalCode,
    temporalLabel: temporalLabelIt(temporalCode),
  };
}

export async function getEditorialOpportunityById(
  id: string,
): Promise<EditorialOpportunityDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      `
      id, title, summary, description, purpose, origin, editorial_status,
      publication_status, visibility_level, substantial_status, updated_at,
      platform_published_at, platform_withdrawn_at,
      opportunity_sources (
        authority, url, external_identifier, consulted_at, version,
        reference_text, status, is_primary
      ),
      opportunity_time_windows (
        opens_at, closes_at, open_ended, superseded_at, kind
      ),
      opportunity_market_references (
        territory_label
      )
    `,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  const base = mapListRow(data as Record<string, unknown>);
  const sources =
    ((data as Record<string, unknown>).opportunity_sources as Array<
      Record<string, unknown>
    >) ?? [];
  const primary =
    sources.find((s) => s.is_primary && s.status === "active") ?? sources[0];
  const territories =
    ((data as Record<string, unknown>).opportunity_market_references as Array<{
      territory_label?: string;
    }>) ?? [];

  return {
    ...base,
    description: ((data as Record<string, unknown>).description as string | null) ?? null,
    purpose: ((data as Record<string, unknown>).purpose as string | null) ?? null,
    platform_published_at:
      ((data as Record<string, unknown>).platform_published_at as string | null) ??
      null,
    platform_withdrawn_at:
      ((data as Record<string, unknown>).platform_withdrawn_at as string | null) ??
      null,
    referenceText: (primary?.reference_text as string | null) ?? null,
    territories: territories
      .map((t) => t.territory_label)
      .filter((t): t is string => Boolean(t)),
  };
}

export type UpdateEditorialOpportunityPatch = {
  summary?: string | null;
  description?: string | null;
  purpose?: string | null;
};

export async function updateEditorialOpportunity(
  id: string,
  patch: UpdateEditorialOpportunityPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("opportunities")
    .update({
      summary: patch.summary,
      description: patch.description,
      purpose: patch.purpose,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export async function publishEditorialOpportunity(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("opportunities")
    .update({
      editorial_status: "approved",
      publication_status: "published",
      visibility_level: "public",
      platform_published_at: new Date().toISOString(),
      platform_scheduled_for: null,
      platform_withdrawn_at: null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export async function withdrawEditorialOpportunity(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data: current, error: loadErr } = await supabase
    .from("opportunities")
    .select("platform_published_at")
    .eq("id", id)
    .maybeSingle();
  if (loadErr) return { ok: false, error: mapPostgresError(loadErr) };
  if (!current?.platform_published_at) {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Solo opportunità già pubblicate possono essere ritirate.",
      },
    };
  }

  const { error } = await supabase
    .from("opportunities")
    .update({
      publication_status: "withdrawn",
      visibility_level: "private",
      platform_withdrawn_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}
