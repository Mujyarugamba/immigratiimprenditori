import { createClient } from "@/lib/supabase/server";
import type { RelatedLinkGroup } from "@/components/public/RelatedLinks";

type ContentRow = { slug: string; title: string };
type EventRow = { id: string; title: string };

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function contentLinks(
  rows:
    | { contents: ContentRow | ContentRow[] | null }[]
    | null
    | undefined,
) {
  return (rows ?? [])
    .map((row) => asOne(row.contents))
    .filter((item): item is ContentRow => Boolean(item))
    .map((item) => ({ href: `/contenuti/${item.slug}`, title: item.title }));
}

function eventLinks(rows: EventRow[] | null | undefined) {
  return (rows ?? []).map((item) => ({
    href: `/eventi/${item.id}`,
    title: item.title,
  }));
}

/**
 * Centro Studi-only related graph after SPLIT-3.
 *
 * Ponte identifiers stored by CS are opaque UUID references. They may be used
 * to find CS-owned rows that point at the same external object, but this module
 * never queries Ponte-owned tables to resolve names/details.
 */
export async function relatedForBusiness(
  businessId: string,
): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [contents, events] = await Promise.all([
    supabase
      .from("content_subject_links")
      .select("contents ( slug, title )")
      .eq("business_id", businessId)
      .limit(6),
    supabase
      .from("events")
      .select("id, title")
      .eq("owner_business_id", businessId)
      .limit(6),
  ]);

  return [
    {
      title: "Notizie e guide",
      links: contentLinks(
        contents.data as
          | { contents: ContentRow | ContentRow[] | null }[]
          | null,
      ),
    },
    { title: "Eventi", links: eventLinks(events.data as EventRow[] | null) },
  ];
}

export async function relatedForProfessional(profile: {
  id: string;
  person_id: string;
  context_business_id: string | null;
}): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_subject_links")
    .select("contents ( slug, title )")
    .eq("professional_profile_id", profile.id)
    .limit(6);

  return [
    {
      title: "Notizie e guide",
      links: contentLinks(
        data as { contents: ContentRow | ContentRow[] | null }[] | null,
      ),
    },
  ];
}

export async function relatedForMarket(
  marketId: string,
): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [contents, eventRefs] = await Promise.all([
    supabase
      .from("content_market_links")
      .select("contents ( slug, title )")
      .eq("market_id", marketId)
      .limit(6),
    supabase
      .from("event_markets")
      .select("event_id")
      .eq("market_id", marketId)
      .limit(6),
  ]);

  const ids = (eventRefs.data ?? []).map((row) => row.event_id);
  const events = ids.length
    ? await supabase.from("events").select("id, title").in("id", ids)
    : { data: [] as EventRow[] };

  return [
    {
      title: "Notizie e guide",
      links: contentLinks(
        contents.data as
          | { contents: ContentRow | ContentRow[] | null }[]
          | null,
      ),
    },
    { title: "Eventi", links: eventLinks(events.data as EventRow[] | null) },
  ];
}

export async function relatedForOpportunity(
  opportunityId: string,
): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [contents, events] = await Promise.all([
    supabase
      .from("content_opportunity_links")
      .select("contents ( slug, title )")
      .eq("opportunity_id", opportunityId)
      .limit(6),
    supabase
      .from("events")
      .select("id, title")
      .eq("context_opportunity_id", opportunityId)
      .limit(6),
  ]);

  return [
    {
      title: "Notizie e guide",
      links: contentLinks(
        contents.data as
          | { contents: ContentRow | ContentRow[] | null }[]
          | null,
      ),
    },
    { title: "Eventi", links: eventLinks(events.data as EventRow[] | null) },
  ];
}

export async function relatedForEvent(event: {
  id: string;
  context_opportunity_id: string | null;
  context_service_offer_id: string | null;
  owner_business_id: string | null;
}): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_event_links")
    .select("contents ( slug, title )")
    .eq("event_id", event.id)
    .limit(8);

  return [
    {
      title: "Notizie e guide",
      links: contentLinks(
        data as { contents: ContentRow | ContentRow[] | null }[] | null,
      ),
    },
  ];
}

export async function relatedForServiceOffer(offer: {
  id: string;
  owner_business_id: string | null;
  owner_person_id: string | null;
  context_opportunity_id: string | null;
}): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [contents, events] = await Promise.all([
    supabase
      .from("content_service_links")
      .select("contents ( slug, title )")
      .eq("service_offer_id", offer.id)
      .limit(6),
    supabase
      .from("events")
      .select("id, title")
      .eq("context_service_offer_id", offer.id)
      .limit(6),
  ]);

  return [
    {
      title: "Notizie e guide",
      links: contentLinks(
        contents.data as
          | { contents: ContentRow | ContentRow[] | null }[]
          | null,
      ),
    },
    { title: "Eventi", links: eventLinks(events.data as EventRow[] | null) },
  ];
}

export async function relatedForContent(detail: {
  subject_links: {
    person_id: string | null;
    business_id: string | null;
    professional_profile_id: string | null;
  }[];
  event_links: { event_id: string }[];
  opportunity_links: { opportunity_id: string }[];
}): Promise<RelatedLinkGroup[]> {
  const eventIds = [...new Set(detail.event_links.map((link) => link.event_id))];
  if (eventIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title")
    .in("id", eventIds)
    .limit(8);

  return [
    { title: "Eventi", links: eventLinks(data as EventRow[] | null) },
  ];
}
