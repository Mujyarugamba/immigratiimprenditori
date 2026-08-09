/**
 * Culture hub aggregation — app-only transversal view (C0-B / C1-A / C2).
 * Does not invent a DB bounded context. Inclusion is structural only.
 */

import { createClient } from "@/lib/supabase/server";
import type { PublicContentListItem } from "@/lib/data/public/contents";
import type {
  PublicEventEdition,
  PublicEventListItem,
} from "@/lib/data/public/events";
import type { PublicMarketListItem } from "@/lib/data/public/markets";
import type { PublicOpportunityListItem } from "@/lib/data/public/opportunities";
import type { PublicProfessionalListItem } from "@/lib/data/public/professionals";

/** Sole event typology that anchors Culture in C1-A. */
export const CULTURAL_EVENT_TYPE_CODE = "cultural" as const;

/** Sole professional category allowed in Culture hub (C1 verified). */
export const CULTURE_PROFESSIONAL_CATEGORY_CODE =
  "cultural_mediation" as const;

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

export type CultureHubBundle = {
  events: PublicEventListItem[];
  opportunities: PublicOpportunityListItem[];
  professionals: PublicProfessionalListItem[];
  contents: PublicContentListItem[];
  markets: PublicMarketListItem[];
};

// ---------------------------------------------------------------------------
// Pure inclusion predicates (unit-tested; no DB)
// ---------------------------------------------------------------------------

export function isCulturalEventType(typeCode: string | null | undefined): boolean {
  return typeCode === CULTURAL_EVENT_TYPE_CODE;
}

export function isCultureProfessionalCategory(
  categoryCode: string | null | undefined,
): boolean {
  return categoryCode === CULTURE_PROFESSIONAL_CATEGORY_CODE;
}

/** Opportunity enters Culture only via cultural event.context_opportunity_id. */
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

/** Content enters Culture only via content_event_links → cultural event. */
export function isCultureLinkedContent(input: {
  linkedEventTypeCodes: readonly (string | null | undefined)[];
  primaryCategoryCode?: string | null;
}): boolean {
  // Explicitly reject category-only proxy (e.g. events_community).
  void input.primaryCategoryCode;
  return input.linkedEventTypeCodes.some(isCulturalEventType);
}

export function isCultureLinkedMarket(input: {
  linkedEventTypeCodes: readonly (string | null | undefined)[];
}): boolean {
  return input.linkedEventTypeCodes.some(isCulturalEventType);
}

/** Org types alone never classify Culture (association/foundation/ngo…). */
export function isCultureClassifiedOrganization(input: {
  typeCode: string | null | undefined;
  primaryScopeCode?: string | null;
}): boolean {
  void input.typeCode;
  void input.primaryScopeCode;
  return false;
}

/** Service categories alone never classify Culture (incl. linguistic). */
export function isCultureClassifiedService(input: {
  categoryCode: string | null | undefined;
}): boolean {
  void input.categoryCode;
  return false;
}

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

export async function listCultureLinkedOpportunities(
  limit = 4,
): Promise<PublicOpportunityListItem[]> {
  const anchors = await listCulturalEventAnchors();
  const opportunityIds = [
    ...new Set(
      anchors
        .map((e) => e.context_opportunity_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (opportunityIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select(OPP_LIST_SELECT)
    .in("id", opportunityIds)
    .order("platform_published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicOpportunityListItem[];
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
    .eq(
      "professional_profile_categories.category_code",
      CULTURE_PROFESSIONAL_CATEGORY_CODE,
    )
    .order("headline", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
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
  });
}

export async function listCultureLinkedContents(
  limit = 4,
): Promise<PublicContentListItem[]> {
  const anchors = await listCulturalEventAnchors();
  const eventIds = anchors.map((e) => e.id);
  if (eventIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_event_links")
    .select(`content_id, contents!inner ( ${CONTENT_LIST_SELECT} )`)
    .in("event_id", eventIds)
    .limit(Math.max(limit * 3, 12));

  if (error) throw new Error(error.message);

  const byId = new Map<string, PublicContentListItem>();
  for (const row of data ?? []) {
    const contents = (
      row as {
        contents:
          | PublicContentListItem
          | PublicContentListItem[]
          | null;
      }
    ).contents;
    const item = Array.isArray(contents) ? contents[0] : contents;
    if (!item?.id || byId.has(item.id)) continue;
    byId.set(item.id, {
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

  return [...byId.values()]
    .sort((a, b) => {
      const aTime = a.published_at
        ? new Date(a.published_at).getTime()
        : 0;
      const bTime = b.published_at
        ? new Date(b.published_at).getTime()
        : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
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
    const item = Array.isArray(markets) ? markets[0] : markets;
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

/** Parallel hub fetch; each section fails soft to []. */
export async function loadCultureHub(): Promise<CultureHubBundle> {
  const [events, opportunities, professionals, contents, markets] =
    await Promise.all([
      listUpcomingCulturalEvents(6).catch(() => []),
      listCultureLinkedOpportunities(4).catch(() => []),
      listCultureProfessionals(4).catch(() => []),
      listCultureLinkedContents(4).catch(() => []),
      listCultureLinkedMarkets(4).catch(() => []),
    ]);

  return { events, opportunities, professionals, contents, markets };
}
