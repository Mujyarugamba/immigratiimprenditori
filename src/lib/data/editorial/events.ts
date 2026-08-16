import {
  paginated,
  parsePageParams,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

const LIST_PAGE_SIZE = 20;

export type EditorialEventEdition = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  delivery_mode: string;
  venue_label: string | null;
  address_text: string | null;
  city_text: string | null;
  country_ref: string | null;
  online_reference: string | null;
  occurrence_status: string;
};

export type EditorialEventListItem = {
  id: string;
  title: string;
  type_code: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  external_source_code: string | null;
  source_label: string | null;
  updated_at: string;
  next_starts_at: string | null;
};

export type EditorialEvent = EditorialEventListItem & {
  summary: string | null;
  description: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  external_organization_label: string | null;
  source_url: string | null;
  external_id: string | null;
  canonical_url: string | null;
  external_natural_key: string | null;
  acquisition_fingerprint: string | null;
  acquired_at: string | null;
  source_updated_at: string | null;
  editorial_internal_notes: string | null;
  published_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
  editions: EditorialEventEdition[];
};

const LIST_SELECT =
  "id, title, type_code, editorial_status, publication_status, visibility_status, external_source_code, source_label, updated_at";

const DETAIL_SELECT = `${LIST_SELECT}, summary, description, delivery_mode, audience_kind, economic_kind, external_organization_label, source_url, external_id, canonical_url, external_natural_key, acquisition_fingerprint, acquired_at, source_updated_at, editorial_internal_notes, published_at, withdrawn_at, created_at`;

const EDITION_SELECT =
  "id, starts_at, ends_at, timezone, delivery_mode, venue_label, address_text, city_text, country_ref, online_reference, occurrence_status";

export type EditorialEventSearchParams = {
  q?: string;
  stato?: string;
  fonte?: string;
  tipo?: string;
  page?: string;
};

export async function listEditorialEvents(
  searchParams: EditorialEventSearchParams = {},
): Promise<PaginatedResult<EditorialEventListItem>> {
  const { page, from, to } = parsePageParams(searchParams, LIST_PAGE_SIZE);
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select(
      `${LIST_SELECT}, event_editions ( starts_at )`,
      { count: "exact" },
    )
    .eq("owned_by_editorial", true)
    .order("updated_at", { ascending: false });

  const q = searchParams.q?.trim();
  if (q) query = query.ilike("title", `%${q}%`);
  const stato = searchParams.stato?.trim();
  if (stato) query = query.eq("publication_status", stato);
  const fonte = searchParams.fonte?.trim();
  if (fonte) query = query.eq("external_source_code", fonte);
  const tipo = searchParams.tipo?.trim();
  if (tipo) query = query.eq("type_code", tipo);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    return paginated([], 0, page, LIST_PAGE_SIZE);
  }

  const items = (data ?? []).map((row) => {
    const editions = Array.isArray(row.event_editions)
      ? row.event_editions
      : row.event_editions
        ? [row.event_editions]
        : [];
    const starts = editions
      .map((e: { starts_at?: string }) => e.starts_at)
      .filter(Boolean)
      .sort() as string[];
    return {
      id: row.id as string,
      title: row.title as string,
      type_code: row.type_code as string,
      editorial_status: row.editorial_status as string,
      publication_status: row.publication_status as string,
      visibility_status: row.visibility_status as string,
      external_source_code: (row.external_source_code as string | null) ?? null,
      source_label: (row.source_label as string | null) ?? null,
      updated_at: row.updated_at as string,
      next_starts_at: starts[0] ?? null,
    } satisfies EditorialEventListItem;
  });

  return paginated(items, count ?? 0, page, LIST_PAGE_SIZE);
}

export async function getEditorialEventById(
  id: string,
): Promise<EditorialEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${DETAIL_SELECT}, event_editions ( ${EDITION_SELECT} )`)
    .eq("id", id)
    .eq("owned_by_editorial", true)
    .maybeSingle();

  if (error || !data) return null;

  const editionsRaw = Array.isArray(data.event_editions)
    ? data.event_editions
    : data.event_editions
      ? [data.event_editions]
      : [];

  const editions = (editionsRaw as EditorialEventEdition[]).sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  return {
    id: data.id,
    title: data.title,
    type_code: data.type_code,
    editorial_status: data.editorial_status,
    publication_status: data.publication_status,
    visibility_status: data.visibility_status,
    external_source_code: data.external_source_code,
    source_label: data.source_label,
    updated_at: data.updated_at,
    next_starts_at: editions[0]?.starts_at ?? null,
    summary: data.summary,
    description: data.description,
    delivery_mode: data.delivery_mode,
    audience_kind: data.audience_kind,
    economic_kind: data.economic_kind,
    external_organization_label: data.external_organization_label,
    source_url: data.source_url,
    external_id: data.external_id,
    canonical_url: data.canonical_url,
    external_natural_key: data.external_natural_key,
    acquisition_fingerprint: data.acquisition_fingerprint,
    acquired_at: data.acquired_at,
    source_updated_at: data.source_updated_at,
    editorial_internal_notes: data.editorial_internal_notes,
    published_at: data.published_at,
    withdrawn_at: data.withdrawn_at,
    created_at: data.created_at,
    editions,
  };
}

export type UpdateEditorialEventPatch = {
  title?: string;
  summary?: string | null;
  description?: string;
  type_code?: string;
  delivery_mode?: string;
  audience_kind?: string;
  economic_kind?: string;
  external_organization_label?: string | null;
  source_url?: string | null;
  source_label?: string | null;
  editorial_status?: "draft" | "ready";
  editorial_internal_notes?: string | null;
};

export async function updateEditorialEvent(
  id: string,
  patch: UpdateEditorialEventPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: Record<string, unknown> = {};
  const fields: (keyof UpdateEditorialEventPatch)[] = [
    "title",
    "summary",
    "description",
    "type_code",
    "delivery_mode",
    "audience_kind",
    "economic_kind",
    "external_organization_label",
    "source_url",
    "source_label",
    "editorial_status",
    "editorial_internal_notes",
  ];
  for (const key of fields) {
    if (key in patch) {
      const val = patch[key];
      if (typeof val === "string") allowed[key] = val.trim();
      else if (val === null || val === undefined) allowed[key] = null;
      else allowed[key] = val;
    }
  }
  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: { code: "validation", message: "Nessun campo da aggiornare." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update(allowed)
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export type UpdateEditorialEventEditionPatch = {
  starts_at?: string;
  ends_at?: string | null;
  timezone?: string;
  delivery_mode?: string;
  venue_label?: string | null;
  address_text?: string | null;
  city_text?: string | null;
  country_ref?: string | null;
  online_reference?: string | null;
  occurrence_status?: string;
};

export async function updateEditorialEventEdition(
  eventId: string,
  editionId: string,
  patch: UpdateEditorialEventEditionPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(patch)) {
    if (val === undefined) continue;
    if (typeof val === "string") allowed[key] = val.trim();
    else allowed[key] = val;
  }
  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: { code: "validation", message: "Nessun campo edizione da aggiornare." },
    };
  }

  const supabase = await createClient();
  const { data: parent } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owned_by_editorial", true)
    .maybeSingle();
  if (!parent) {
    return {
      ok: false,
      error: { code: "not_found", message: "Evento non trovato in redazione." },
    };
  }

  const { error } = await supabase
    .from("event_editions")
    .update(allowed)
    .eq("id", editionId)
    .eq("event_id", eventId);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export async function publishEditorialEvent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const event = await getEditorialEventById(id);
  if (!event) {
    return {
      ok: false,
      error: { code: "not_found", message: "Evento non trovato." },
    };
  }
  if (event.editorial_status !== "ready") {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Imposta lo stato redazionale READY prima di pubblicare.",
      },
    };
  }
  if (event.editions.length === 0 || !event.editions[0]?.starts_at) {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Serve almeno un'edizione con data di inizio.",
      },
    };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("events")
    .update({
      editorial_status: "ready",
      publication_status: "published",
      visibility_status: "public",
      published_at: now,
      withdrawn_at: null,
    })
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export async function withdrawEditorialEvent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      publication_status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}
