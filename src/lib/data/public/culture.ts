import { createClient } from "@/lib/supabase/server";
import type { PublicBusinessListItem } from "@/lib/data/public/businesses";
import type { PublicCollaborationListItem } from "@/lib/data/public/collaborations";
import {
  listPublicContents,
  type PublicContentListItem,
} from "@/lib/data/public/contents";
import {
  listHomeEvents,
  type PublicEventListItem,
} from "@/lib/data/public/events";
import type { PublicMarketListItem } from "@/lib/data/public/markets";
import type { PublicOpportunityListItem } from "@/lib/data/public/opportunities";
import type { PublicOrganizationListItem } from "@/lib/data/public/organizations";
import type { PublicProfessionalListItem } from "@/lib/data/public/professionals";
import type {
  PublicServiceOfferListItem,
  PublicServiceRequestListItem,
} from "@/lib/data/public/services";

/**
 * Centro Studi Cultura hub after SPLIT-3.
 *
 * The CS database owns events, contents and their local relations. Ponte-owned
 * domains are intentionally represented only as empty typed collections here.
 * A future cross-product integration must use an explicit API/service boundary;
 * this module must never query Ponte tables from the CS Supabase database.
 */

export const CULTURAL_EVENT_TYPE_CODE = "cultural" as const;
export const CULTURE_PROFESSIONAL_CATEGORY_CODE = "cultural_mediation" as const;

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

export const CULTURE_ACTIVITY_SCOPE_CODES = [
  "culture",
  "heritage",
  "creative_industries",
] as const;

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

export function isCultureOpportunity(input: {
  hasCulturalScopeAssignment: boolean;
  linkedViaCulturalEvent: boolean;
}): boolean {
  return input.hasCulturalScopeAssignment || input.linkedViaCulturalEvent;
}

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

export function isCultureContent(input: {
  primaryCategoryCode?: string | null;
  linkedEventTypeCodes: readonly (string | null | undefined)[];
}): boolean {
  if (input.primaryCategoryCode === CULTURE_CONTENT_CATEGORY_CODE) return true;
  return input.linkedEventTypeCodes.some(isCulturalEventType);
}

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

export function isCultureClassifiedOrganization(input: {
  typeCode: string | null | undefined;
  primaryScopeCode?: string | null;
}): boolean {
  void input.typeCode;
  return isCultureActivityScope(input.primaryScopeCode);
}

export function isCultureClassifiedBusiness(input: {
  sectorSlugs: readonly (string | null | undefined)[];
}): boolean {
  return input.sectorSlugs.some(
    (slug) =>
      typeof slug === "string" &&
      (CULTURE_BUSINESS_SECTOR_SLUGS as readonly string[]).includes(slug),
  );
}

export function isCultureClassifiedCollaboration(input: {
  activityScopeCode?: string | null;
  formCode?: string | null;
}): boolean {
  void input.formCode;
  return isCultureActivityScope(input.activityScopeCode);
}

export function isCultureClassifiedService(input: {
  categoryCode: string | null | undefined;
}): boolean {
  return input.categoryCode === CULTURE_SERVICE_CATEGORY_CODE;
}

function hasUpcomingEdition(event: PublicEventListItem): boolean {
  const edition = event.next_edition;
  if (!edition) return false;
  if (edition.occurrence_status === "ongoing") return true;
  if (edition.occurrence_status !== "scheduled") return false;
  return new Date(edition.starts_at).getTime() >= Date.now();
}

export async function listUpcomingCulturalEvents(
  limit = 6,
): Promise<PublicEventListItem[]> {
  const rows = await listHomeEvents(Math.max(limit * 4, 24));
  return rows
    .filter((event) => isCulturalEventType(event.type_code))
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

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureOpportunities(
  _limit = 4,
): Promise<PublicOpportunityListItem[]> {
  return [];
}

export async function listCultureLinkedOpportunities(
  limit = 4,
): Promise<PublicOpportunityListItem[]> {
  return listCultureOpportunities(limit);
}

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureProfessionals(
  _limit = 4,
): Promise<PublicProfessionalListItem[]> {
  return [];
}

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureOrganizations(
  _limit = 4,
): Promise<PublicOrganizationListItem[]> {
  return [];
}

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureBusinesses(
  _limit = 4,
): Promise<PublicBusinessListItem[]> {
  return [];
}

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureCollaborations(
  _limit = 4,
): Promise<PublicCollaborationListItem[]> {
  return [];
}

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureServiceOffers(
  _limit = 3,
): Promise<PublicServiceOfferListItem[]> {
  return [];
}

/** Ponte-owned after SPLIT-3: no local CS query. */
export async function listCultureServiceRequests(
  _limit = 3,
): Promise<PublicServiceRequestListItem[]> {
  return [];
}

export async function listCultureContents(
  limit = 4,
): Promise<PublicContentListItem[]> {
  const supabase = await createClient();
  const [categoryResult, eventResult] = await Promise.all([
    listPublicContents({ categoria: CULTURE_CONTENT_CATEGORY_CODE }),
    supabase
      .from("events")
      .select("id")
      .eq("type_code", CULTURAL_EVENT_TYPE_CODE)
      .limit(200),
  ]);

  const fromCategory = categoryResult.items;
  if (eventResult.error) throw new Error(eventResult.error.message);
  const eventIds = (eventResult.data ?? []).map((row) => row.id);

  if (eventIds.length === 0) {
    return fromCategory.slice(0, limit);
  }

  const { data, error } = await supabase
    .from("content_event_links")
    .select(
      "content_id, contents!inner ( id, slug, title, abstract, type_code, primary_category_code, language_id, is_featured, published_at )",
    )
    .in("event_id", eventIds)
    .limit(Math.max(limit * 3, 12));

  if (error) throw new Error(error.message);

  const linked: PublicContentListItem[] = [];
  for (const row of data ?? []) {
    const value = row.contents as
      | PublicContentListItem
      | PublicContentListItem[]
      | null;
    const item = Array.isArray(value) ? (value[0] ?? null) : value;
    if (item?.id) linked.push(item);
  }

  return dedupeById([...fromCategory, ...linked])
    .sort((a, b) => {
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export async function listCultureLinkedContents(
  limit = 4,
): Promise<PublicContentListItem[]> {
  return listCultureContents(limit);
}

/** Market IDs are opaque external references in CS after SPLIT-3. */
export async function listCultureLinkedMarkets(
  _limit = 4,
): Promise<PublicMarketListItem[]> {
  return [];
}

/** Opportunity details live in Ponte after SPLIT-3. */
export async function opportunityQualifiesForCultureHub(
  _opportunityId: string,
): Promise<boolean> {
  return false;
}

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

export async function loadCultureHub(): Promise<CultureHubBundle> {
  const [events, contents] = await Promise.all([
    listUpcomingCulturalEvents(6).catch(() => []),
    listCultureContents(4).catch(() => []),
  ]);

  return {
    events,
    opportunities: [],
    collaborations: [],
    professionals: [],
    organizations: [],
    businesses: [],
    serviceOffers: [],
    serviceRequests: [],
    contents,
    markets: [],
  };
}
