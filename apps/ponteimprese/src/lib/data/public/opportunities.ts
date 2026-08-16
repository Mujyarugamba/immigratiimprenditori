import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import {
  deriveTemporalLabel,
  temporalLabelIt,
  type TemporalLabelCode,
} from "@/lib/opportunities/temporal-label";

const LIST_SELECT =
  "id, title, summary, origin, substantial_status, platform_published_at";

export type PublicOpportunityListItem = {
  id: string;
  title: string;
  summary: string | null;
  origin: string;
  substantial_status: string;
  platform_published_at: string | null;
  authority: string | null;
  territory: string | null;
  opensAt: string | null;
  closesAt: string | null;
  openEnded: boolean;
  temporalCode: TemporalLabelCode;
  temporalLabel: string;
  sourceLabel: string | null;
  officialUrl: string | null;
};

export type PublicOpportunityDetail = PublicOpportunityListItem & {
  description: string | null;
  purpose: string | null;
  visibility_level: string;
  publication_status: string;
  editorial_status: string;
  attribution: string | null;
};

function sourceLabelFromExternalId(externalId: string | null): string | null {
  if (!externalId) return null;
  if (externalId.startsWith("incentivi-gov:")) return "Incentivi.gov";
  if (externalId.startsWith("eu-funding:")) return "EU Funding & Tenders";
  return "Fonte ufficiale";
}

function parseAttribution(referenceText: string | null): string | null {
  if (!referenceText) return null;
  const head = referenceText.split(" | ")[0]?.trim();
  return head || null;
}

function pickPrimarySource(
  sources: Array<Record<string, unknown>> | null | undefined,
): Record<string, unknown> | null {
  if (!sources?.length) return null;
  return (
    sources.find((s) => s.is_primary && s.status === "active") ??
    sources.find((s) => s.status === "active") ??
    sources[0] ??
    null
  );
}

function pickAccessWindow(
  windows: Array<Record<string, unknown>> | null | undefined,
): Record<string, unknown> | null {
  if (!windows?.length) return null;
  return (
    windows.find((w) => w.kind === "access" && w.superseded_at == null) ??
    windows[0] ??
    null
  );
}

function mapEnrichment(row: Record<string, unknown>): {
  authority: string | null;
  territory: string | null;
  opensAt: string | null;
  closesAt: string | null;
  openEnded: boolean;
  temporalCode: TemporalLabelCode;
  temporalLabel: string;
  sourceLabel: string | null;
  officialUrl: string | null;
  attribution: string | null;
} {
  const primary = pickPrimarySource(
    row.opportunity_sources as Array<Record<string, unknown>> | undefined,
  );
  const window = pickAccessWindow(
    row.opportunity_time_windows as Array<Record<string, unknown>> | undefined,
  );
  const territories =
    (row.opportunity_market_references as Array<{ territory_label?: string }>) ??
    [];
  const opensAt = (window?.opens_at as string | null) ?? null;
  const closesAt = (window?.closes_at as string | null) ?? null;
  const openEnded = Boolean(window?.open_ended);
  const temporalCode = deriveTemporalLabel({ opensAt, closesAt, openEnded });
  const externalId = (primary?.external_identifier as string | null) ?? null;

  return {
    authority: (primary?.authority as string | null) ?? null,
    territory:
      territories.map((t) => t.territory_label).filter(Boolean).join(", ") ||
      null,
    opensAt,
    closesAt,
    openEnded,
    temporalCode,
    temporalLabel: temporalLabelIt(temporalCode),
    sourceLabel: sourceLabelFromExternalId(externalId),
    officialUrl: (primary?.url as string | null) ?? null,
    attribution: parseAttribution(
      (primary?.reference_text as string | null) ?? null,
    ),
  };
}

const ENRICH_SELECT = `
  opportunity_sources (
    authority, url, external_identifier, reference_text, status, is_primary
  ),
  opportunity_time_windows (
    opens_at, closes_at, open_ended, superseded_at, kind
  ),
  opportunity_market_references (
    territory_label
  )
`;

export async function listPublicOpportunities(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicOpportunityListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const origine = param(searchParams, "origine");
  const stato = param(searchParams, "stato");
  const ambito = param(searchParams, "ambito");
  const supabase = await createClient();

  // Explicit public gate (defense-in-depth): editor/admin RLS can SELECT drafts;
  // public pages must never surface unpublished/private rows for any session.
  let query = ambito
    ? supabase
        .from("opportunities")
        .select(
          `${LIST_SELECT}, ${ENRICH_SELECT}, opportunity_activity_scope_assignments!inner (
            activity_scope_code
          )`,
          { count: "exact" },
        )
        .eq("publication_status", "published")
        .eq("visibility_level", "public")
        .is("deleted_at", null)
        .eq(
          "opportunity_activity_scope_assignments.activity_scope_code",
          ambito,
        )
        .order("platform_published_at", { ascending: false, nullsFirst: false })
        .range(from, to)
    : supabase
        .from("opportunities")
        .select(`${LIST_SELECT}, ${ENRICH_SELECT}`, { count: "exact" })
        .eq("publication_status", "published")
        .eq("visibility_level", "public")
        .is("deleted_at", null)
        .order("platform_published_at", { ascending: false, nullsFirst: false })
        .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (origine) {
    query = query.eq("origin", origine);
  }
  if (stato) {
    query = query.eq("substantial_status", stato);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const items = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const enrichment = mapEnrichment(r);
    return {
      id: r.id as string,
      title: r.title as string,
      summary: (r.summary as string | null) ?? null,
      origin: r.origin as string,
      substantial_status: r.substantial_status as string,
      platform_published_at: (r.platform_published_at as string | null) ?? null,
      authority: enrichment.authority,
      territory: enrichment.territory,
      opensAt: enrichment.opensAt,
      closesAt: enrichment.closesAt,
      openEnded: enrichment.openEnded,
      temporalCode: enrichment.temporalCode,
      temporalLabel: enrichment.temporalLabel,
      sourceLabel: enrichment.sourceLabel,
      officialUrl: enrichment.officialUrl,
    };
  });

  return paginated(items, count ?? 0, page, pageSize);
}

export async function getPublicOpportunityById(
  id: string,
): Promise<PublicOpportunityDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      `
      id, title, summary, origin, substantial_status, platform_published_at,
      description, purpose, visibility_level, publication_status, editorial_status,
      ${ENRICH_SELECT}
    `,
    )
    .eq("id", id)
    .eq("publication_status", "published")
    .eq("visibility_level", "public")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const r = data as Record<string, unknown>;
  const enrichment = mapEnrichment(r);

  return {
    id: r.id as string,
    title: r.title as string,
    summary: (r.summary as string | null) ?? null,
    origin: r.origin as string,
    substantial_status: r.substantial_status as string,
    platform_published_at: (r.platform_published_at as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    purpose: (r.purpose as string | null) ?? null,
    visibility_level: r.visibility_level as string,
    publication_status: r.publication_status as string,
    editorial_status: r.editorial_status as string,
    authority: enrichment.authority,
    territory: enrichment.territory,
    opensAt: enrichment.opensAt,
    closesAt: enrichment.closesAt,
    openEnded: enrichment.openEnded,
    temporalCode: enrichment.temporalCode,
    temporalLabel: enrichment.temporalLabel,
    sourceLabel: enrichment.sourceLabel,
    officialUrl: enrichment.officialUrl,
    attribution: enrichment.attribution,
  };
}

export async function listHomeOpportunities(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(`${LIST_SELECT}, ${ENRICH_SELECT}`)
    .eq("publication_status", "published")
    .eq("visibility_level", "public")
    .is("deleted_at", null)
    .order("platform_published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const enrichment = mapEnrichment(r);
    return {
      id: r.id as string,
      title: r.title as string,
      summary: (r.summary as string | null) ?? null,
      origin: r.origin as string,
      substantial_status: r.substantial_status as string,
      platform_published_at: (r.platform_published_at as string | null) ?? null,
      authority: enrichment.authority,
      territory: enrichment.territory,
      opensAt: enrichment.opensAt,
      closesAt: enrichment.closesAt,
      openEnded: enrichment.openEnded,
      temporalCode: enrichment.temporalCode,
      temporalLabel: enrichment.temporalLabel,
      sourceLabel: enrichment.sourceLabel,
      officialUrl: enrichment.officialUrl,
    } satisfies PublicOpportunityListItem;
  });
}
