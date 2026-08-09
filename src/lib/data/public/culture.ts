/**
 * Culture hub aggregation — transversal, app-only (C0-B / C2 / C4 V2).
 * Hybrid C: direct domain scope/classification first; event links as enrichment.
 * No Cultura BC. C3.7 disciplines deferred.
 */

import { createClient } from "@/lib/supabase/server";
import type { PublicBusinessListItem } from "@/lib/data/public/businesses";
import type { PublicCollaborationListItem } from "@/lib/data/public/collaborations";
import type { PublicContentListItem } from "@/lib/data/public/contents";
import type {
  PublicEventEdition,
  PublicEventListItem,
} from "@/lib/data/public/events";
import type { PublicMarketListItem } from "@/lib/data/public/markets";
import type { PublicOpportunityListItem } from "@/lib/data/public/opportunities";
import type { PublicOrganizationListItem } from "@/lib/data/public/organizations";
import type { PublicProfessionalListItem } from "@/lib/data/public/professionals";
import type {
  PublicServiceOfferListItem,
  PublicServiceRequestListItem,
} from "@/lib/data/public/services";

/** Event typology that anchors Culture (unchanged from C2). */
export const CULTURAL_EVENT_TYPE_CODE = "cultural" as const;

/** Legacy + C3.2 cultural/creative professional category codes (allow-list). */
export const CULTURE_PROFESSIONAL_CATEGORY_CODE =
  "cultural_mediation" as const;

export const CULTURE_PROFESSIONAL_CATEGORY_CODES = [
  "cultural_mediation",
  "performing_artist",
  "visual_artist",
  "musician",
  "audiovisual_professional",
  "writer_editorial_professional",
  "designer_creative",
  "cultural_producer",
] as const;

export const CULTURE_PROFESSIONAL_GROUP_CODE = "cultural_creative" as const;

/** Shared activity-scope codes (Org / Opp / Collab). */
export const CULTURE_ACTIVITY_SCOPE_CODES = [
  "culture",
  "heritage",
  "creative_industries",
] as const;

/** CCI business sector slugs from C3.3. */
export const CULTURE_BUSINESS_SECTOR_SLUGS = [
  "audiovisual",
  "publishing",
  "music_industry",
  "live_performance",
  "design_creative",
  "fashion",
  "artistic_crafts",
  "cultural_heritage_services",
] as const;

export const CULTURE_CONTENT_CATEGORY_CODE = "culture" as const;
export const CULTURE_SERVICE_CATEGORY_CODE = "cultural_creative" as const;

const EVENT_LIST_SELECT =
  "id, title, summary, type_code, delivery_mode, audience_kind, economic_kind";
const EDITION_SELECT =
  "id, starts_at, ends_at, occurrence_status, city_text, country_ref";
const OPP_LIST_SELECT =
  "id, title, summary, origin, substantial_status, platform_published_at";
const CONTENT_LIST_SELECT =
  "id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at";
const MARKET_LIST_SELECT =
  "id, code, name, market_kind, substantial_status, summary";
const PROF_LIST_SELECT =
  "id, headline, summary, practice_mode_code, availability_status, person_id, context_business_id";
const ORG_LIST_SELECT =
  "id, slug, name, type_code, primary_scope_code, summary, seat_city_label";
const BUSINESS_LIST_SELECT =
  "id, public_name, legal_name, summary, organization_form, substantial_status, founding_year";
const COLLAB_LIST_SELECT =
  "id, slug, title, form_code, operational_status, object_text, purpose_text, activity_scope_code";
const SERVICE_OFFER_SELECT =
  "id, title, summary, category_code, delivery_mode, audience_kind, economic_kind, availability_status, owner_person_id, owner_business_id";
const SERVICE_REQUEST_SELECT =
  "id, title, summary, category_code, delivery_mode, audience_kind, economic_kind, process_status, owner_person_id, owner_business_id";

export type CultureHubBundle = {
  events: PublicEventListItem[];
  opportunities: PublicOpportunityListItem[];
  collaborations: PublicCollaborationListItem[];
  professionals: PublicProfessionalListItem[];
  organizations: PublicOrganizationListItem[];
  businesses: PublicBusinessListItem[];
  serviceOffers: PublicServiceOfferListItem[];
  serviceRequests: PublicServiceRequestListItem[];
  contents: PublicContentListItem[];
  markets: PublicMarketListItem[];
};

// ---------------------------------------------------------------------------
// Pure inclusion predicates (unit-tested; no DB)
// ---------------------------------------------------------------------------

export function dedupeById<T extends { id: string }>(items: readonly T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return [...byId.values()];
}

export function isCulturalEventType(typeCode: string | null | undefined): boolean {
  return typeCode === CULTURAL_EVENT_TYPE_CODE;
}

export function isCultureActivityScope(
  scopeCode: string | null | undefined,
): boolean {
  return (
    typeof scopeCode === "string" &&
    (CULTURE_ACTIVITY_SCOPE_CODES as readonly string[]).includes(scopeCode)
  );
}

export function isCultureProfessionalCategory(
  categoryCode: string | null | undefined,
): boolean {
  return (
    typeof categoryCode === "string" &&
    (CULTURE_PROFESSIONAL_CATEGORY_CODES as readonly string[]).includes(
      categoryCode,
    )
  );
}

export function isCultureProfessionalGroup(
  groupCode: string | null | undefined,
): boolean {
  return groupCode === CULTURE_PROFESSIONAL_GROUP_CODE;
}

/** Opportunity: direct scope assignment OR cultural-event context link. */
export function isCultureOpportunity(input: {
  hasCulturalScopeAssignment: boolean;
  linkedViaCulturalEvent: boolean;
}): boolean {
  return input.hasCulturalScopeAssignment || input.linkedViaCulturalEvent;
}

/** @deprecated Prefer isCultureOpportunity — kept for C2 regression naming. */
export function isCultureLinkedOpportunity(input: {
  opportunityId: string;
  culturalEventContextOpportunityIds: readonly (string | null | undefined)[];
}): boolean {
  const linked = new Set(
    input.culturalEventContextOpportunityIds.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    ),
  );
  return linked.has(input.opportunityId);
}

/** Content: category culture OR link to cultural event. events_community alone ≠ culture. */
export function isCultureContent(input: {
  primaryCategoryCode?: string | null;
  linkedEventTypeCodes: readonly (string | null | undefined)[];
}): boolean {
  if (input.primaryCategoryCode === CULTURE_CONTENT_CATEGORY_CODE) return true;
  return input.linkedEventTypeCodes.some(isCulturalEventType);
}

/** @deprecated Prefer isCultureContent. */
export function isCultureLinkedContent(input: {
  linkedEventTypeCodes: readonly (string | null | undefined)[];
  primaryCategoryCode?: string | null;
}): boolean {
  return isCultureContent(input);
}

export function isCultureLinkedMarket(input: {
  linkedEventTypeCodes: readonly (string | null | undefined)[];
}): boolean {
  return input.linkedEventTypeCodes.some(isCulturalEventType);
}

/** Org: structured activity scope only — never organization type alone. */
export function isCultureClassifiedOrganization(input: {
  typeCode: string | null | undefined;
  primaryScopeCode?: string | null;
}): boolean {
  void input.typeCode;
  return isCultureActivityScope(input.primaryScopeCode);
}

/** Business: CCI sector slug from C3.3 allow-list. */
export function isCultureClassifiedBusiness(input: {
  sectorSlugs: readonly (string | null | undefined)[];
}): boolean {
  return input.sectorSlugs.some(
    (slug) =>
      typeof slug === "string" &&
      (CULTURE_BUSINESS_SECTOR_SLUGS as readonly string[]).includes(slug),
  );
}

/** Collaboration: activity_scope_code — never form_code proxy. */
export function isCultureClassifiedCollaboration(input: {
  activityScopeCode?: string | null;
  formCode?: string | null;
}): boolean {
  void input.formCode;
  return isCultureActivityScope(input.activityScopeCode);
}

/** Service: cultural_creative only — linguistic ≠ culture. */
export function isCultureClassifiedService(input: {
  categoryCode: string | null | undefined;
}): boolean {
  return input.categoryCode === CULTURE_SERVICE_CATEGORY_CODE;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

function mapEditionRows(
  rows: PublicEventEdition[] | PublicEventEdition | null | undefined,
): PublicEventEdition[] {
  if (!rows) return [];
  const list = Array.isArray(rows) ? rows : [rows];
  return list
    .map((e) => ({
      id: e.id,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      occurrence_status: e.occurrence_status,
      city_text: e.city_text,
      country_ref: e.country_ref,
    }))
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
}

function pickNextEdition(
  editions: PublicEventEdition[],
): PublicEventEdition | null {
  if (editions.length === 0) return null;
  const now = Date.now();
  const preferred = editions
    .filter(
      (e) =>
        e.occurrence_status === "scheduled" ||
        e.occurrence_status === "ongoing",
    )
    .filter(
      (e) =>
        e.occurrence_status === "ongoing" ||
        new Date(e.starts_at).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  if (preferred.length > 0) return preferred[0];
  const sorted = [...editions].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  return sorted[0] ?? null;
}

function mapEventRow(row: {
  id: string;
  title: string;
  summary: string | null;
  type_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  event_editions?: PublicEventEdition[] | null;
}): PublicEventListItem {
  const editions = mapEditionRows(row.event_editions);
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    type_code: row.type_code,
    delivery_mode: row.delivery_mode,
    audience_kind: row.audience_kind,
    economic_kind: row.economic_kind,
    next_edition: pickNextEdition(editions),
  };
}

function hasUpcomingEdition(event: PublicEventListItem): boolean {
  const ed = event.next_edition;
  if (!ed) return false;
  if (ed.occurrence_status === "ongoing") return true;
  if (ed.occurrence_status !== "scheduled") return false;
  return new Date(ed.starts_at).getTime() >= Date.now();
}

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

async function listCulturalEventAnchors(): Promise<
  { id: string; context_opportunity_id: string | null }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, context_opportunity_id")
    .eq("type_code", CULTURAL_EVENT_TYPE_CODE)
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; context_opportunity_id: string | null }[];
}

async function fetchOpportunitiesByIds(
  ids: string[],
  limit: number,
): Promise<PublicOpportunityListItem[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(OPP_LIST_SELECT)
    .in("id", ids)
    .order("platform_published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicOpportunityListItem[];
}

// ---------------------------------------------------------------------------
// Domain list queries
// ---------------------------------------------------------------------------

export async function listUpcomingCulturalEvents(
  limit = 6,
): Promise<PublicEventListItem[]> {
  const supabase = await createClient();
  const fetchLimit = Math.max(limit * 4, 24);
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_LIST_SELECT}, event_editions ( ${EDITION_SELECT} )`)
    .eq("type_code", CULTURAL_EVENT_TYPE_CODE)
    .limit(fetchLimit);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => mapEventRow(row as Parameters<typeof mapEventRow>[0]))
    .filter(hasUpcomingEdition)
    .sort((a, b) => {
      const aTime = a.next_edition
        ? new Date(a.next_edition.starts_at).getTime()
        : Number.POSITIVE_INFINITY;
      const bTime = b.next_edition
        ? new Date(b.next_edition.starts_at).getTime()
        : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, limit);
}

export async function listCultureOpportunities(
  limit = 4,
): Promise<PublicOpportunityListItem[]> {
  const supabase = await createClient();

  const [scopeRes, anchors] = await Promise.all([
    supabase
      .from("opportunity_activity_scope_assignments")
      .select("opportunity_id")
      .in("scope_code", [...CULTURE_ACTIVITY_SCOPE_CODES])
      .limit(200),
    listCulturalEventAnchors(),
  ]);

  if (scopeRes.error) throw new Error(scopeRes.error.message);

  const scopeIds = (scopeRes.data ?? []).map(
    (r) => (r as { opportunity_id: string }).opportunity_id,
  );
  const linkedIds = anchors
    .map((e) => e.context_opportunity_id)
    .filter((id): id is string => Boolean(id));

  const ids = [...new Set([...scopeIds, ...linkedIds])];
  return fetchOpportunitiesByIds(ids, limit);
}

/** @deprecated Prefer listCultureOpportunities. */
export async function listCultureLinkedOpportunities(
  limit = 4,
): Promise<PublicOpportunityListItem[]> {
  return listCultureOpportunities(limit);
}

export async function listCultureProfessionals(
  limit = 4,
): Promise<PublicProfessionalListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select(
      `${PROF_LIST_SELECT}, professional_profile_categories!inner ( category_code )`,
    )
    .in(
      "professional_profile_categories.category_code",
      [...CULTURE_PROFESSIONAL_CATEGORY_CODES],
    )
    .order("headline", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return dedupeById(
    (data ?? []).map((row) => {
      const r = row as PublicProfessionalListItem;
      return {
        id: r.id,
        headline: r.headline,
        summary: r.summary,
        practice_mode_code: r.practice_mode_code,
        availability_status: r.availability_status,
        person_id: r.person_id,
        context_business_id: r.context_business_id,
      };
    }),
  );
}

export async function listCultureOrganizations(
  limit = 4,
): Promise<PublicOrganizationListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORG_LIST_SELECT)
    .in("primary_scope_code", [...CULTURE_ACTIVITY_SCOPE_CODES])
    .order("name", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicOrganizationListItem[];
}

export async function listCultureBusinesses(
  limit = 4,
): Promise<PublicBusinessListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `${BUSINESS_LIST_SELECT}, business_sector_declarations!inner (
        declaration_status,
        business_sectors!inner ( slug )
      )`,
    )
    .eq("business_sector_declarations.declaration_status", "declared")
    .in(
      "business_sector_declarations.business_sectors.slug",
      [...CULTURE_BUSINESS_SECTOR_SLUGS],
    )
    .order("public_name", { ascending: true })
    .limit(Math.max(limit * 3, 12));

  if (error) throw new Error(error.message);

  return dedupeById(
    (data ?? []).map((row) => {
      const r = row as PublicBusinessListItem;
      return {
        id: r.id,
        public_name: r.public_name,
        legal_name: r.legal_name,
        summary: r.summary,
        organization_form: r.organization_form,
        substantial_status: r.substantial_status,
        founding_year: r.founding_year,
      };
    }),
  ).slice(0, limit);
}

export async function listCultureCollaborations(
  limit = 4,
): Promise<PublicCollaborationListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select(COLLAB_LIST_SELECT)
    .in("activity_scope_code", [...CULTURE_ACTIVITY_SCOPE_CODES])
    .order("title", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []) as PublicCollaborationListItem[];
}

export async function listCultureServiceOffers(
  limit = 3,
): Promise<PublicServiceOfferListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_offers")
    .select(SERVICE_OFFER_SELECT)
    .eq("category_code", CULTURE_SERVICE_CATEGORY_CODE)
    .order("title", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicServiceOfferListItem[];
}

export async function listCultureServiceRequests(
  limit = 3,
): Promise<PublicServiceRequestListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select(SERVICE_REQUEST_SELECT)
    .eq("category_code", CULTURE_SERVICE_CATEGORY_CODE)
    .order("title", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicServiceRequestListItem[];
}

export async function listCultureContents(
  limit = 4,
): Promise<PublicContentListItem[]> {
  const supabase = await createClient();
  const anchors = await listCulturalEventAnchors();
  const eventIds = anchors.map((e) => e.id);

  const [categoryRes, linkRes] = await Promise.all([
    supabase
      .from("contents")
      .select(CONTENT_LIST_SELECT)
      .eq("primary_category_code", CULTURE_CONTENT_CATEGORY_CODE)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit),
    eventIds.length === 0
      ? Promise.resolve({ data: [] as unknown[], error: null })
      : supabase
          .from("content_event_links")
          .select(`content_id, contents!inner ( ${CONTENT_LIST_SELECT} )`)
          .in("event_id", eventIds)
          .limit(Math.max(limit * 3, 12)),
  ]);

  if (categoryRes.error) throw new Error(categoryRes.error.message);
  if (linkRes.error) throw new Error(linkRes.error.message);

  const fromCategory = (categoryRes.data ?? []) as PublicContentListItem[];
  const fromLinks: PublicContentListItem[] = [];
  for (const row of linkRes.data ?? []) {
    const contents = (
      row as {
        contents: PublicContentListItem | PublicContentListItem[] | null;
      }
    ).contents;
    const item = asOne(contents);
    if (!item?.id) continue;
    fromLinks.push({
      id: item.id,
      slug: item.slug,
      title: item.title,
      abstract: item.abstract,
      type_code: item.type_code,
      primary_category_code: item.primary_category_code,
      language_id: item.language_id,
      is_featured: item.is_featured,
      published_at: item.published_at,
    });
  }

  return dedupeById([...fromCategory, ...fromLinks])
    .sort((a, b) => {
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

/** @deprecated Prefer listCultureContents. */
export async function listCultureLinkedContents(
  limit = 4,
): Promise<PublicContentListItem[]> {
  return listCultureContents(limit);
}

export async function listCultureLinkedMarkets(
  limit = 4,
): Promise<PublicMarketListItem[]> {
  const anchors = await listCulturalEventAnchors();
  const eventIds = anchors.map((e) => e.id);
  if (eventIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_markets")
    .select(
      `market_id, international_markets!inner ( ${MARKET_LIST_SELECT} )`,
    )
    .in("event_id", eventIds)
    .limit(Math.max(limit * 3, 12));

  if (error) throw new Error(error.message);

  const byId = new Map<string, PublicMarketListItem>();
  for (const row of data ?? []) {
    const markets = (
      row as {
        international_markets:
          | PublicMarketListItem
          | PublicMarketListItem[]
          | null;
      }
    ).international_markets;
    const item = asOne(markets);
    if (!item?.id || byId.has(item.id)) continue;
    byId.set(item.id, {
      id: item.id,
      code: item.code,
      name: item.name,
      market_kind: item.market_kind,
      substantial_status: item.substantial_status,
      summary: item.summary,
    });
  }

  return [...byId.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "it"))
    .slice(0, limit);
}

/** Detail-page helper: opportunity qualifies for Cultura cross-link. */
export async function opportunityQualifiesForCultureHub(
  opportunityId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const [scopeRes, eventRes] = await Promise.all([
    supabase
      .from("opportunity_activity_scope_assignments")
      .select("opportunity_id")
      .eq("opportunity_id", opportunityId)
      .in("scope_code", [...CULTURE_ACTIVITY_SCOPE_CODES])
      .limit(1),
    supabase
      .from("events")
      .select("id")
      .eq("type_code", CULTURAL_EVENT_TYPE_CODE)
      .eq("context_opportunity_id", opportunityId)
      .limit(1),
  ]);
  if (scopeRes.error || eventRes.error) return false;
  return (scopeRes.data?.length ?? 0) > 0 || (eventRes.data?.length ?? 0) > 0;
}

/** Detail-page helper: content qualifies for Cultura cross-link. */
export async function contentQualifiesForCultureHub(input: {
  primaryCategoryCode: string | null;
  eventIds: readonly string[];
}): Promise<boolean> {
  if (input.primaryCategoryCode === CULTURE_CONTENT_CATEGORY_CODE) return true;
  if (input.eventIds.length === 0) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .in("id", [...input.eventIds])
    .eq("type_code", CULTURAL_EVENT_TYPE_CODE)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/** Parallel hub fetch; each section fails soft to []. */
export async function loadCultureHub(): Promise<CultureHubBundle> {
  const [
    events,
    opportunities,
    collaborations,
    professionals,
    organizations,
    businesses,
    serviceOffers,
    serviceRequests,
    contents,
    markets,
  ] = await Promise.all([
    listUpcomingCulturalEvents(6).catch(() => []),
    listCultureOpportunities(4).catch(() => []),
    listCultureCollaborations(4).catch(() => []),
    listCultureProfessionals(4).catch(() => []),
    listCultureOrganizations(4).catch(() => []),
    listCultureBusinesses(4).catch(() => []),
    listCultureServiceOffers(3).catch(() => []),
    listCultureServiceRequests(3).catch(() => []),
    listCultureContents(4).catch(() => []),
    listCultureLinkedMarkets(4).catch(() => []),
  ]);

  return {
    events,
    opportunities,
    collaborations,
    professionals,
    organizations,
    businesses,
    serviceOffers,
    serviceRequests,
    contents,
    markets,
  };
}
