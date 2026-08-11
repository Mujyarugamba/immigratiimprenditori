import { createClient } from "@/lib/supabase/server";
import type { RelatedLinkGroup } from "@/components/public/RelatedLinks";

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Batch-related public nodes for a business. RLS filters non-public rows.
 */
export async function relatedForBusiness(
  businessId: string,
): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [pros, offers, requests, collabs, events, presences] =
    await Promise.all([
      supabase
        .from("professional_profiles")
        .select("id, headline")
        .eq("context_business_id", businessId)
        .limit(6),
      supabase
        .from("service_offers")
        .select("id, title")
        .eq("owner_business_id", businessId)
        .limit(6),
      supabase
        .from("service_requests")
        .select("id, title")
        .eq("owner_business_id", businessId)
        .limit(6),
      supabase
        .from("collaborations")
        .select("slug, title")
        .eq("owner_business_id", businessId)
        .limit(6),
      supabase
        .from("events")
        .select("id, title")
        .eq("owner_business_id", businessId)
        .limit(6),
      supabase
        .from("international_market_presences")
        .select("id, international_markets ( code, name )")
        .eq("business_id", businessId)
        .limit(6),
    ]);

  const marketLinks = (
    (presences.data as
      | {
          international_markets:
            | { code: string; name: string }
            | { code: string; name: string }[]
            | null;
        }[]
      | null) ?? []
  )
    .map((row) => asOne(row.international_markets))
    .filter((m): m is { code: string; name: string } => Boolean(m))
    .map((m) => ({
      href: `/mercati/${m.code}`,
      title: m.name,
      meta: m.code,
    }));

  return [
    {
      title: "Professionisti collegati",
      links: (pros.data ?? []).map((p) => ({
        href: `/professionisti/${p.id}`,
        title: p.headline || "Professionista",
      })),
    },
    {
      title: "Offerte di servizio",
      links: (offers.data ?? []).map((o) => ({
        href: `/servizi/offerte/${o.id}`,
        title: o.title,
      })),
    },
    {
      title: "Richieste di servizio",
      links: (requests.data ?? []).map((r) => ({
        href: `/servizi/richieste/${r.id}`,
        title: r.title,
      })),
    },
    {
      title: "Collaborazioni",
      links: (collabs.data ?? []).map((c) => ({
        href: `/collaborazioni/${c.slug}`,
        title: c.title,
      })),
    },
    {
      title: "Eventi",
      links: (events.data ?? []).map((e) => ({
        href: `/eventi/${e.id}`,
        title: e.title,
      })),
    },
    {
      title: "Mercati",
      links: marketLinks,
    },
  ];
}

export async function relatedForProfessional(profile: {
  id: string;
  person_id: string;
  context_business_id: string | null;
}): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [business, offers, requests] = await Promise.all([
    profile.context_business_id
      ? supabase
          .from("businesses")
          .select("id, public_name")
          .eq("id", profile.context_business_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("service_offers")
      .select("id, title")
      .eq("owner_person_id", profile.person_id)
      .limit(6),
    supabase
      .from("service_requests")
      .select("id, title")
      .eq("owner_person_id", profile.person_id)
      .limit(6),
  ]);

  return [
    {
      title: "Impresa collegata",
      links: business.data
        ? [
            {
              href: `/imprese/${business.data.id}`,
              title: business.data.public_name,
            },
          ]
        : [],
    },
    {
      title: "Offerte di servizio",
      links: (offers.data ?? []).map((o) => ({
        href: `/servizi/offerte/${o.id}`,
        title: o.title,
      })),
    },
    {
      title: "Richieste di servizio",
      links: (requests.data ?? []).map((r) => ({
        href: `/servizi/richieste/${r.id}`,
        title: r.title,
      })),
    },
  ];
}

export async function relatedForMarket(marketId: string): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [presences, events] = await Promise.all([
    supabase
      .from("international_market_presences")
      .select("id, businesses ( id, public_name )")
      .eq("market_id", marketId)
      .limit(8),
    supabase
      .from("event_markets")
      .select("event_id, events ( id, title )")
      .eq("market_id", marketId)
      .limit(6),
  ]);

  const businessLinks = (
    (presences.data as
      | {
          businesses:
            | { id: string; public_name: string }
            | { id: string; public_name: string }[]
            | null;
        }[]
      | null) ?? []
  )
    .map((row) => asOne(row.businesses))
    .filter((b): b is { id: string; public_name: string } => Boolean(b))
    .map((b) => ({
      href: `/imprese/${b.id}`,
      title: b.public_name,
    }));

  const eventLinks = (
    (events.data as
      | {
          events:
            | { id: string; title: string }
            | { id: string; title: string }[]
            | null;
        }[]
      | null) ?? []
  )
    .map((row) => asOne(row.events))
    .filter((e): e is { id: string; title: string } => Boolean(e))
    .map((e) => ({
      href: `/eventi/${e.id}`,
      title: e.title,
    }));

  return [
    { title: "Imprese presenti", links: businessLinks },
    { title: "Eventi collegati", links: eventLinks },
  ];
}

export async function relatedForOpportunity(
  opportunityId: string,
): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [events, offers, contents] = await Promise.all([
    supabase
      .from("events")
      .select("id, title")
      .eq("context_opportunity_id", opportunityId)
      .limit(6),
    supabase
      .from("service_offers")
      .select("id, title")
      .eq("context_opportunity_id", opportunityId)
      .limit(6),
    supabase
      .from("content_opportunity_links")
      .select("contents ( slug, title )")
      .eq("opportunity_id", opportunityId)
      .limit(6),
  ]);

  const contentLinks = (
    (contents.data as
      | {
          contents:
            | { slug: string; title: string }
            | { slug: string; title: string }[]
            | null;
        }[]
      | null) ?? []
  )
    .map((row) => asOne(row.contents))
    .filter((c): c is { slug: string; title: string } => Boolean(c))
    .map((c) => ({
      href: `/contenuti/${c.slug}`,
      title: c.title,
    }));

  return [
    {
      title: "Eventi collegati",
      links: (events.data ?? []).map((e) => ({
        href: `/eventi/${e.id}`,
        title: e.title,
      })),
    },
    {
      title: "Servizi collegati",
      links: (offers.data ?? []).map((o) => ({
        href: `/servizi/offerte/${o.id}`,
        title: o.title,
      })),
    },
    { title: "Notizie e guide", links: contentLinks },
    {
      title: "Scopri anche",
      links: [
        {
          href: "/collaborazioni",
          title: "Esplora anche le collaborazioni",
        },
      ],
    },
  ];
}

export async function relatedForEvent(event: {
  id: string;
  context_opportunity_id: string | null;
  context_service_offer_id: string | null;
  owner_business_id: string | null;
}): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [opportunity, offer, business, markets] = await Promise.all([
    event.context_opportunity_id
      ? supabase
          .from("opportunities")
          .select("id, title")
          .eq("id", event.context_opportunity_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    event.context_service_offer_id
      ? supabase
          .from("service_offers")
          .select("id, title")
          .eq("id", event.context_service_offer_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    event.owner_business_id
      ? supabase
          .from("businesses")
          .select("id, public_name")
          .eq("id", event.owner_business_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("event_markets")
      .select("international_markets ( code, name )")
      .eq("event_id", event.id)
      .limit(6),
  ]);

  const marketLinks = (
    (markets.data as
      | {
          international_markets:
            | { code: string; name: string }
            | { code: string; name: string }[]
            | null;
        }[]
      | null) ?? []
  )
    .map((row) => asOne(row.international_markets))
    .filter((m): m is { code: string; name: string } => Boolean(m))
    .map((m) => ({
      href: `/mercati/${m.code}`,
      title: m.name,
    }));

  return [
    {
      title: "Opportunità",
      links: opportunity.data
        ? [
            {
              href: `/opportunita/${opportunity.data.id}`,
              title: opportunity.data.title,
            },
          ]
        : [],
    },
    {
      title: "Servizio",
      links: offer.data
        ? [
            {
              href: `/servizi/offerte/${offer.data.id}`,
              title: offer.data.title,
            },
          ]
        : [],
    },
    {
      title: "Impresa organizzatrice",
      links: business.data
        ? [
            {
              href: `/imprese/${business.data.id}`,
              title: business.data.public_name,
            },
          ]
        : [],
    },
    { title: "Mercati", links: marketLinks },
  ];
}

export async function relatedForServiceOffer(offer: {
  id: string;
  owner_business_id: string | null;
  owner_person_id: string | null;
  context_opportunity_id: string | null;
}): Promise<RelatedLinkGroup[]> {
  const supabase = await createClient();
  const [business, opportunity, professional] = await Promise.all([
    offer.owner_business_id
      ? supabase
          .from("businesses")
          .select("id, public_name")
          .eq("id", offer.owner_business_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    offer.context_opportunity_id
      ? supabase
          .from("opportunities")
          .select("id, title")
          .eq("id", offer.context_opportunity_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    offer.owner_person_id
      ? supabase
          .from("professional_profiles")
          .select("id, headline")
          .eq("person_id", offer.owner_person_id)
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return [
    {
      title: "Impresa",
      links: business.data
        ? [
            {
              href: `/imprese/${business.data.id}`,
              title: business.data.public_name,
            },
          ]
        : [],
    },
    {
      title: "Professionista",
      links: professional.data
        ? [
            {
              href: `/professionisti/${professional.data.id}`,
              title: professional.data.headline || "Professionista",
            },
          ]
        : [],
    },
    {
      title: "Opportunità collegata",
      links: opportunity.data
        ? [
            {
              href: `/opportunita/${opportunity.data.id}`,
              title: opportunity.data.title,
            },
          ]
        : [],
    },
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
  const supabase = await createClient();
  const businessIds = detail.subject_links
    .map((l) => l.business_id)
    .filter((id): id is string => Boolean(id));
  const professionalIds = detail.subject_links
    .map((l) => l.professional_profile_id)
    .filter((id): id is string => Boolean(id));
  const eventIds = detail.event_links.map((l) => l.event_id);
  const opportunityIds = detail.opportunity_links.map((l) => l.opportunity_id);

  const [businesses, professionals, events, opportunities] = await Promise.all([
    businessIds.length
      ? supabase
          .from("businesses")
          .select("id, public_name")
          .in("id", businessIds)
      : Promise.resolve({ data: [] }),
    professionalIds.length
      ? supabase
          .from("professional_profiles")
          .select("id, headline")
          .in("id", professionalIds)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabase.from("events").select("id, title").in("id", eventIds)
      : Promise.resolve({ data: [] }),
    opportunityIds.length
      ? supabase
          .from("opportunities")
          .select("id, title")
          .in("id", opportunityIds)
      : Promise.resolve({ data: [] }),
  ]);

  return [
    {
      title: "Imprese narrate",
      links: (businesses.data ?? []).map((b) => ({
        href: `/imprese/${b.id}`,
        title: b.public_name,
      })),
    },
    {
      title: "Professionisti",
      links: (professionals.data ?? []).map((p) => ({
        href: `/professionisti/${p.id}`,
        title: p.headline || "Professionista",
      })),
    },
    {
      title: "Eventi",
      links: (events.data ?? []).map((e) => ({
        href: `/eventi/${e.id}`,
        title: e.title,
      })),
    },
    {
      title: "Opportunità",
      links: (opportunities.data ?? []).map((o) => ({
        href: `/opportunita/${o.id}`,
        title: o.title,
      })),
    },
  ];
}
