import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const LIST_SELECT =
  "id, title, summary, type_code, delivery_mode, audience_kind, economic_kind";

const EDITION_SELECT =
  "id, starts_at, ends_at, occurrence_status, city_text, country_ref";

export type PublicEventEdition = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  occurrence_status: string;
  city_text: string | null;
  country_ref: string | null;
};

export type PublicEventListItem = {
  id: string;
  title: string;
  summary: string | null;
  type_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  next_edition: PublicEventEdition | null;
};

export type PublicEventDetail = {
  id: string;
  title: string;
  summary: string | null;
  type_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  description: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  context_opportunity_id: string | null;
  context_service_offer_id: string | null;
  owner_business_id: string | null;
  editions: PublicEventEdition[];
};

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

function mapEditionRows(
  rows:
    | PublicEventEdition[]
    | PublicEventEdition
    | null
    | undefined,
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

export async function listPublicEvents(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicEventListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const tipo = param(searchParams, "tipo");
  const modalita = param(searchParams, "modalita");
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select(`${LIST_SELECT}, event_editions ( ${EDITION_SELECT} )`, {
      count: "exact",
    })
    .order("title", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (tipo) {
    query = query.eq("type_code", tipo);
  }
  if (modalita) {
    query = query.eq("delivery_mode", modalita);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const items = (data ?? []).map((row) => {
    const editions = mapEditionRows(
      row.event_editions as PublicEventEdition[] | null,
    );
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
  });

  return paginated(items, count ?? 0, page, pageSize);
}

export async function getPublicEventById(
  id: string,
): Promise<PublicEventDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, title, summary, type_code, delivery_mode, audience_kind, economic_kind,
      description, editorial_status, publication_status, visibility_status,
      context_opportunity_id, context_service_offer_id, owner_business_id,
      event_editions ( ${EDITION_SELECT} )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    type_code: data.type_code,
    delivery_mode: data.delivery_mode,
    audience_kind: data.audience_kind,
    economic_kind: data.economic_kind,
    description: data.description,
    editorial_status: data.editorial_status,
    publication_status: data.publication_status,
    visibility_status: data.visibility_status,
    context_opportunity_id: data.context_opportunity_id,
    context_service_offer_id: data.context_service_offer_id,
    owner_business_id: data.owner_business_id,
    editions: mapEditionRows(
      data.event_editions as PublicEventEdition[] | null,
    ),
  };
}

export async function listHomeEvents(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${LIST_SELECT}, event_editions ( ${EDITION_SELECT} )`)
    .order("title", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const editions = mapEditionRows(
      row.event_editions as PublicEventEdition[] | null,
    );
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
  }) as PublicEventListItem[];
}
