import {
  paginated,
  parsePageParams,
  type PaginatedResult,
} from "@/lib/data/public/paging";
import { ensureEditorialInterviewWorkflow } from "@/lib/data/editorial/interviews";
import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

const LIST_PAGE_SIZE = 20;

export type EditorialContentListItem = {
  id: string;
  title: string;
  slug: string;
  type_code: string;
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
  updated_at: string;
};

export type EditorialContent = EditorialContentListItem & {
  subtitle: string | null;
  abstract: string | null;
  body: string;
  body_format: string;
  primary_category_code: string | null;
  language_id: number;
  cover_url: string | null;
  source_url: string | null;
  source_label: string | null;
  is_featured: boolean;
  published_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
};

export type EditorialContentVersionListItem = {
  id: string;
  version_number: number;
  version_label: string;
  change_summary: string;
  created_by: string | null;
  created_at: string;
};

export type EditorialContentVersion = EditorialContentVersionListItem & {
  content_id: string;
  snapshot: Record<string, unknown>;
};

const LIST_SELECT =
  "id, title, slug, type_code, editorial_status, publication_status, visibility_status, updated_at";

const DETAIL_SELECT =
  `${LIST_SELECT}, subtitle, abstract, body, body_format, primary_category_code, language_id, cover_url, source_url, source_label, is_featured, published_at, withdrawn_at, created_at`;

export type EditorialContentSearchParams = {
  q?: string;
  stato?: string;
  tipo?: string;
  page?: string;
};

export async function listEditorialContents(
  searchParams: EditorialContentSearchParams = {},
): Promise<PaginatedResult<EditorialContentListItem>> {
  const { page, from, to } = parsePageParams(searchParams, LIST_PAGE_SIZE);
  const supabase = await createClient();
  let query = supabase
    .from("contents")
    .select(LIST_SELECT, { count: "exact" })
    .eq("owned_by_editorial", true)
    .order("updated_at", { ascending: false });

  const q = searchParams.q?.trim();
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  const stato = searchParams.stato?.trim();
  if (stato) {
    query = query.eq("publication_status", stato);
  }
  const tipo = searchParams.tipo?.trim();
  if (tipo) {
    query = query.eq("type_code", tipo);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    return paginated([], 0, page, LIST_PAGE_SIZE);
  }
  return paginated(
    (data ?? []) as EditorialContentListItem[],
    count ?? 0,
    page,
    LIST_PAGE_SIZE,
  );
}

export async function getEditorialContentById(
  id: string,
): Promise<EditorialContent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .eq("owned_by_editorial", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as EditorialContent;
}

export async function listEditorialContentVersions(
  contentId: string,
): Promise<EditorialContentVersionListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_versions")
    .select("id, version_number, version_label, change_summary, created_by, created_at")
    .eq("content_id", contentId)
    .order("version_number", { ascending: false })
    .limit(100);

  // The migration is intentionally not active in production yet. Branch previews
  // backed by the current hosted schema therefore degrade to an empty timeline.
  if (error) return [];
  return (data ?? []) as EditorialContentVersionListItem[];
}

export async function getEditorialContentVersion(
  contentId: string,
  versionNumber: number,
): Promise<EditorialContentVersion | null> {
  if (!Number.isInteger(versionNumber) || versionNumber < 1) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_versions")
    .select(
      "id, content_id, version_number, version_label, change_summary, snapshot, created_by, created_at",
    )
    .eq("content_id", contentId)
    .eq("version_number", versionNumber)
    .maybeSingle();

  if (error || !data) return null;
  return data as EditorialContentVersion;
}

export type CreateEditorialContentInput = {
  type_code: string;
  language_id: number;
  title: string;
  slug: string;
  body: string;
  subtitle?: string | null;
  abstract?: string | null;
  primary_category_code?: string | null;
  body_format?: string;
  cover_url?: string | null;
  source_url?: string | null;
  source_label?: string | null;
};

export type UpdateEditorialContentPatch = Partial<
  Omit<CreateEditorialContentInput, "language_id"> & { language_id?: number }
> & {
  editorial_status?: string;
  is_featured?: boolean;
};

export async function createEditorialContent(
  input: CreateEditorialContentInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contents")
    .insert({
      owned_by_editorial: true,
      owner_person_id: null,
      owner_business_id: null,
      type_code: input.type_code,
      language_id: input.language_id,
      title: input.title.trim(),
      slug: input.slug.trim(),
      body: input.body.trim(),
      subtitle: input.subtitle?.trim() || null,
      abstract: input.abstract?.trim() || null,
      primary_category_code: input.primary_category_code || null,
      body_format: input.body_format ?? "markdown",
      cover_url: input.cover_url?.trim() || null,
      source_url: input.source_url?.trim() || null,
      source_label: input.source_label?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }

  const contentId = data.id as string;
  if (input.type_code === "interview") {
    const workflow = await ensureEditorialInterviewWorkflow(contentId);
    if (!workflow.ok) {
      const { error: cleanupError } = await supabase
        .from("contents")
        .delete()
        .eq("id", contentId)
        .eq("owned_by_editorial", true);

      if (cleanupError) {
        return {
          ok: false,
          error: {
            code: "conflict",
            message: `${workflow.error.message} La bozza ${contentId} esiste ma il workflow intervista non è stato inizializzato.`,
          },
        };
      }
      return { ok: false, error: workflow.error };
    }
  }

  return { ok: true, id: contentId };
}

export async function updateEditorialContent(
  id: string,
  patch: UpdateEditorialContentPatch,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: Record<string, unknown> = {};
  const fields: (keyof UpdateEditorialContentPatch)[] = [
    "type_code",
    "language_id",
    "title",
    "slug",
    "body",
    "subtitle",
    "abstract",
    "primary_category_code",
    "body_format",
    "cover_url",
    "source_url",
    "source_label",
    "editorial_status",
    "is_featured",
  ];
  for (const key of fields) {
    if (key in patch) {
      const val = patch[key];
      if (typeof val === "string") {
        allowed[key] = val.trim();
      } else if (val === null || val === undefined) {
        allowed[key] = null;
      } else {
        allowed[key] = val;
      }
    }
  }

  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: { code: "validation", message: "Nessun campo da aggiornare." },
    };
  }

  const supabase = await createClient();
  const targetTypeCode =
    typeof allowed.type_code === "string" ? allowed.type_code : null;
  let previousTypeCode: string | null = null;

  if (targetTypeCode !== null) {
    const { data: current, error: currentError } = await supabase
      .from("contents")
      .select("type_code")
      .eq("id", id)
      .eq("owned_by_editorial", true)
      .maybeSingle();

    if (currentError) {
      return { ok: false, error: mapPostgresError(currentError) };
    }
    if (!current) {
      return {
        ok: false,
        error: { code: "conflict", message: "Contenuto non trovato." },
      };
    }

    previousTypeCode = current.type_code as string;
    if (previousTypeCode === "interview" && targetTypeCode !== "interview") {
      return {
        ok: false,
        error: {
          code: "conflict",
          message:
            "Il tipo Intervista non può essere modificato dopo l’inizializzazione del workflow.",
        },
      };
    }
  }

  const { data: updated, error } = await supabase
    .from("contents")
    .update(allowed)
    .eq("id", id)
    .eq("owned_by_editorial", true)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  if (!updated) {
    return {
      ok: false,
      error: { code: "conflict", message: "Contenuto non trovato." },
    };
  }

  if (targetTypeCode === "interview") {
    const workflow = await ensureEditorialInterviewWorkflow(id);
    if (!workflow.ok) {
      if (previousTypeCode && previousTypeCode !== "interview") {
        const { error: rollbackError } = await supabase
          .from("contents")
          .update({ type_code: previousTypeCode })
          .eq("id", id)
          .eq("owned_by_editorial", true);

        if (rollbackError) {
          return {
            ok: false,
            error: {
              code: "conflict",
              message: `${workflow.error.message} Il contenuto ${id} è stato convertito in intervista ma il workflow non è stato inizializzato e il ripristino del tipo precedente non è riuscito.`,
            },
          };
        }
      }
      return { ok: false, error: workflow.error };
    }
  }

  return { ok: true };
}

export type PublishEditorialContentResult =
  | { ok: true; authorInserted: boolean; authorError?: string }
  | { ok: false; error: AppError };

/** Publish editorial content; optionally insert editorial_responsible author. */
export async function publishEditorialContent(
  id: string,
  personId: string | null,
): Promise<PublishEditorialContentResult> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  let authorInserted = false;
  let authorError: string | undefined;

  if (personId) {
    const { error: authorErr } = await supabase.from("content_authors").insert({
      content_id: id,
      role_kind: "editorial_responsible",
      person_id: personId,
      is_primary: false,
      sort_order: 0,
    });
    if (authorErr) {
      authorError = mapPostgresError(authorErr).message;
    } else {
      authorInserted = true;
    }
  }

  const { error } = await supabase
    .from("contents")
    .update({
      editorial_status: "ready",
      publication_status: "published",
      visibility_status: "public",
      published_at: now,
      withdrawn_at: null,
    })
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, authorInserted, authorError };
}

export async function withdrawEditorialContent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contents")
    .update({
      publication_status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owned_by_editorial", true);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}
