export type InboxDraftRecommendation = {
  recommendedType: string | null;
  recommendedCategory: string | null;
  editorialPriority: number | null;
  workingTitle: string | null;
  angle: string | null;
  outline: string[];
  cautions: string[];
};

export type InboxEditorialBrief = {
  verifiedClaims: string[];
  sourceCheckedOn: string | null;
  migrationRelevance: string | null;
  draftRecommendation: InboxDraftRecommendation | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asPositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : null;
  }
  return null;
}

export function buildInboxEditorialBrief(
  metadata: Record<string, unknown> | null | undefined,
): InboxEditorialBrief | null {
  if (!metadata) return null;

  const verifiedClaims = asStringArray(metadata.verified_claims);
  const recommendation = asRecord(metadata.draft_recommendation);
  const draftRecommendation = recommendation
    ? {
        recommendedType: asString(recommendation.recommended_type),
        recommendedCategory: asString(recommendation.recommended_category),
        editorialPriority: asPositiveInteger(recommendation.editorial_priority),
        workingTitle: asString(recommendation.working_title),
        angle: asString(recommendation.angle),
        outline: asStringArray(recommendation.outline),
        cautions: asStringArray(recommendation.cautions),
      }
    : null;

  const result: InboxEditorialBrief = {
    verifiedClaims,
    sourceCheckedOn: asString(metadata.source_checked_on),
    migrationRelevance: asString(metadata.migration_relevance),
    draftRecommendation,
  };

  const hasDraftDetails = draftRecommendation
    ? Boolean(
        draftRecommendation.recommendedType ||
          draftRecommendation.recommendedCategory ||
          draftRecommendation.editorialPriority ||
          draftRecommendation.workingTitle ||
          draftRecommendation.angle ||
          draftRecommendation.outline.length ||
          draftRecommendation.cautions.length,
      )
    : false;

  if (
    result.verifiedClaims.length === 0 &&
    !result.sourceCheckedOn &&
    !result.migrationRelevance &&
    !hasDraftDetails
  ) {
    return null;
  }

  return result;
}
