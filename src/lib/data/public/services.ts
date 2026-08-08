import { createClient } from "@/lib/supabase/server";
import {
  paginated,
  parsePageParams,
  param,
  type PaginatedResult,
} from "@/lib/data/public/paging";

const OFFER_LIST_SELECT =
  "id, title, summary, category_code, delivery_mode, audience_kind, economic_kind, availability_status, owner_person_id, owner_business_id";

const REQUEST_LIST_SELECT =
  "id, title, summary, category_code, delivery_mode, audience_kind, economic_kind, process_status, owner_person_id, owner_business_id";

export type PublicServiceOfferListItem = {
  id: string;
  title: string;
  summary: string | null;
  category_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  availability_status: string;
  owner_person_id: string | null;
  owner_business_id: string | null;
};

export type PublicServiceOfferDetail = PublicServiceOfferListItem & {
  description: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  context_opportunity_id: string | null;
};

export type PublicServiceRequestListItem = {
  id: string;
  title: string;
  summary: string | null;
  category_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  process_status: string;
  owner_person_id: string | null;
  owner_business_id: string | null;
};

export type PublicServiceRequestDetail = PublicServiceRequestListItem & {
  description: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
};

export async function listPublicServiceOffers(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicServiceOfferListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const categoria = param(searchParams, "categoria");
  const erogazione = param(searchParams, "erogazione");
  const supabase = await createClient();

  let query = supabase
    .from("service_offers")
    .select(OFFER_LIST_SELECT, { count: "exact" })
    .order("title", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (categoria) {
    query = query.eq("category_code", categoria);
  }
  if (erogazione) {
    query = query.eq("delivery_mode", erogazione);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicServiceOfferListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicServiceOfferById(
  id: string,
): Promise<PublicServiceOfferDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_offers")
    .select(
      `
      id, title, summary, category_code, delivery_mode, audience_kind,
      economic_kind, availability_status, owner_person_id, owner_business_id,
      context_opportunity_id,
      description, editorial_status, publication_status, visibility_status
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return data as PublicServiceOfferDetail;
}

export async function listHomeServiceOffers(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_offers")
    .select(OFFER_LIST_SELECT)
    .order("title", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicServiceOfferListItem[];
}

export async function listPublicServiceRequests(
  searchParams: Record<string, string | string[] | undefined> = {},
): Promise<PaginatedResult<PublicServiceRequestListItem>> {
  const { page, pageSize, from, to } = parsePageParams(searchParams);
  const q = param(searchParams, "q");
  const categoria = param(searchParams, "categoria");
  const erogazione = param(searchParams, "erogazione");
  const supabase = await createClient();

  let query = supabase
    .from("service_requests")
    .select(REQUEST_LIST_SELECT, { count: "exact" })
    .order("title", { ascending: true })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  if (categoria) {
    query = query.eq("category_code", categoria);
  }
  if (erogazione) {
    query = query.eq("delivery_mode", erogazione);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return paginated(
    (data ?? []) as PublicServiceRequestListItem[],
    count ?? 0,
    page,
    pageSize,
  );
}

export async function getPublicServiceRequestById(
  id: string,
): Promise<PublicServiceRequestDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      `
      id, title, summary, category_code, delivery_mode, audience_kind,
      economic_kind, process_status, owner_person_id, owner_business_id,
      description, editorial_status, publication_status, visibility_status
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return data as PublicServiceRequestDetail;
}

export async function listHomeServiceRequests(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select(REQUEST_LIST_SELECT)
    .order("title", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicServiceRequestListItem[];
}
