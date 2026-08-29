"use server";

import { revalidatePath } from "next/cache";
import {
  approveEditorialSecondaryReview,
  requestEditorialSecondaryReview,
  revokeEditorialSecondaryReview,
  type EditorialReviewEntityKind,
  type EditorialReviewScope,
} from "@/lib/data/editorial/reviews";
import { toUserMessage } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";

export type ReviewActionState = {
  ok: boolean;
  message?: string;
};

async function requireEditorialSession() {
  const session = await getApplicationSession();
  if (!session?.isActiveAccount || (!session.isEditor && !session.isApplicationAdmin)) {
    return { ok: false as const, message: "Accesso redazionale richiesto." };
  }
  if (!session.accountId) {
    return { ok: false as const, message: "Account redazionale non risolto." };
  }
  return { ok: true as const, session };
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function revalidateEntity(entityKind: EditorialReviewEntityKind, entityId: string) {
  if (entityKind === "content") {
    revalidatePath(`/app/redazione/contenuti/${entityId}`);
    revalidatePath("/app/redazione/contenuti");
  } else if (entityKind === "observatory_indicator") {
    revalidatePath(`/app/redazione/osservatorio/indicatori/${entityId}`);
    revalidatePath("/app/redazione/osservatorio/indicatori");
  }
}

function parseEntityKind(value: string): EditorialReviewEntityKind | null {
  return ["content", "observatory_indicator", "content_correction"].includes(value)
    ? (value as EditorialReviewEntityKind)
    : null;
}

function parseScope(value: string): EditorialReviewScope | null {
  return ["publication", "substantive_correction"].includes(value)
    ? (value as EditorialReviewScope)
    : null;
}

export async function requestSecondaryReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const gate = await requireEditorialSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const entityKind = parseEntityKind(str(formData, "entity_kind"));
  const entityId = str(formData, "entity_id");
  const reviewScope = parseScope(str(formData, "review_scope"));
  const reasonCode = str(formData, "reason_code") || "editorial_secondary_review";
  const forceContentReview = str(formData, "force_content_review") === "true";

  if (!entityKind || !entityId || !reviewScope) {
    return { ok: false, message: "Richiesta di revisione non valida." };
  }

  const result = await requestEditorialSecondaryReview({
    entityKind,
    entityId,
    reviewScope,
    reasonCode,
    forceContentReview,
  });
  if (!result.ok) return { ok: false, message: toUserMessage(result.error) };

  revalidateEntity(entityKind, entityId);
  return {
    ok: true,
    message: "Seconda revisione richiesta. Deve approvare un altro redattore.",
  };
}

export async function approveSecondaryReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const gate = await requireEditorialSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const reviewId = str(formData, "review_id");
  const entityKind = parseEntityKind(str(formData, "entity_kind"));
  const entityId = str(formData, "entity_id");
  if (!reviewId || !entityKind || !entityId) {
    return { ok: false, message: "Review non valida." };
  }

  const result = await approveEditorialSecondaryReview(reviewId);
  if (!result.ok) return { ok: false, message: toUserMessage(result.error) };

  revalidateEntity(entityKind, entityId);
  return { ok: true, message: "Seconda approvazione registrata." };
}

export async function revokeSecondaryReviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const gate = await requireEditorialSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const reviewId = str(formData, "review_id");
  const entityKind = parseEntityKind(str(formData, "entity_kind"));
  const entityId = str(formData, "entity_id");
  if (!reviewId || !entityKind || !entityId) {
    return { ok: false, message: "Review non valida." };
  }

  const result = await revokeEditorialSecondaryReview(reviewId);
  if (!result.ok) return { ok: false, message: toUserMessage(result.error) };

  revalidateEntity(entityKind, entityId);
  return { ok: true, message: "Review revocata." };
}
