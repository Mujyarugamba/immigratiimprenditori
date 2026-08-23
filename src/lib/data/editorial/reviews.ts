import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

export type EditorialReviewEntityKind =
  | "content"
  | "observatory_indicator"
  | "content_correction";

export type EditorialReviewScope = "publication" | "substantive_correction";

export type EditorialSecondaryReview = {
  id: string;
  entity_kind: EditorialReviewEntityKind;
  entity_id: string;
  review_scope: EditorialReviewScope;
  reason_code: string;
  basis_fingerprint: string;
  requested_by_account_id: string;
  requested_at: string;
  status: "pending" | "approved" | "revoked";
  approved_by_account_id: string | null;
  approved_at: string | null;
  revoked_by_account_id: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type EditorialReviewState = {
  available: boolean;
  forceSecondaryReview: boolean;
  reviews: EditorialSecondaryReview[];
  latest: EditorialSecondaryReview | null;
};

const REVIEW_SELECT =
  "id, entity_kind, entity_id, review_scope, reason_code, basis_fingerprint, requested_by_account_id, requested_at, status, approved_by_account_id, approved_at, revoked_by_account_id, revoked_at, created_at";

export function isContentAutomaticallySensitive(content: {
  type_code: string;
  primary_category_code: string | null;
}): boolean {
  return (
    [
      "research_report",
      "data_note",
      "interview",
      "testimony",
      "policy_brief",
      "institutional_page",
    ].includes(content.type_code) ||
    ["regulation_compliance", "stories"].includes(
      content.primary_category_code ?? "",
    )
  );
}

export async function getEditorialReviewState(
  entityKind: EditorialReviewEntityKind,
  entityId: string,
  reviewScope: EditorialReviewScope,
): Promise<EditorialReviewState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("editorial_secondary_reviews")
    .select(REVIEW_SELECT)
    .eq("entity_kind", entityKind)
    .eq("entity_id", entityId)
    .eq("review_scope", reviewScope)
    .order("created_at", { ascending: false })
    .limit(10);

  // Preview currently reads the pre-migration hosted schema. The review panel
  // therefore degrades explicitly until the candidate migration is activated.
  if (error) {
    return {
      available: false,
      forceSecondaryReview: false,
      reviews: [],
      latest: null,
    };
  }

  let forceSecondaryReview = false;
  if (entityKind === "content") {
    const { data: contentGovernance, error: governanceError } = await supabase
      .from("contents")
      .select("force_secondary_review")
      .eq("id", entityId)
      .maybeSingle();

    if (governanceError) {
      return {
        available: false,
        forceSecondaryReview: false,
        reviews: [],
        latest: null,
      };
    }
    forceSecondaryReview = contentGovernance?.force_secondary_review === true;
  }

  const reviews = (data ?? []) as EditorialSecondaryReview[];
  return {
    available: true,
    forceSecondaryReview,
    reviews,
    latest: reviews[0] ?? null,
  };
}

export async function requestEditorialSecondaryReview(input: {
  entityKind: EditorialReviewEntityKind;
  entityId: string;
  reviewScope: EditorialReviewScope;
  reasonCode: string;
  forceContentReview?: boolean;
}): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();

  if (input.entityKind === "content" && input.forceContentReview) {
    const { error: escalationError } = await supabase
      .from("contents")
      .update({ force_secondary_review: true })
      .eq("id", input.entityId)
      .eq("owned_by_editorial", true);

    if (escalationError) {
      return { ok: false, error: mapPostgresError(escalationError) };
    }
  }

  const { error } = await supabase.from("editorial_secondary_reviews").insert({
    entity_kind: input.entityKind,
    entity_id: input.entityId,
    review_scope: input.reviewScope,
    reason_code: input.reasonCode,
  });

  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

export async function approveEditorialSecondaryReview(
  reviewId: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("editorial_secondary_reviews")
    .update({ status: "approved" })
    .eq("id", reviewId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) {
    return {
      ok: false,
      error: {
        code: "conflict",
        message: "La richiesta non è più in attesa di approvazione.",
      },
    };
  }
  return { ok: true };
}

export async function revokeEditorialSecondaryReview(
  reviewId: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("editorial_secondary_reviews")
    .update({ status: "revoked" })
    .eq("id", reviewId)
    .in("status", ["pending", "approved"])
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: mapPostgresError(error) };
  if (!data) {
    return {
      ok: false,
      error: { code: "conflict", message: "La review non è più revocabile." },
    };
  }
  return { ok: true };
}
