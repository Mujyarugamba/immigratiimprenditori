const CONTENT_DRAFT_TYPE_BY_INBOX_KIND: Record<string, string> = {
  news: "news",
  report: "research_report",
  academic_paper: "research_report",
  policy: "policy_brief",
  law_regulation: "policy_brief",
  story_tip: "business_story",
  interview_proposal: "interview",
  user_testimony: "testimony",
  publication_submission: "research_report",
  other: "insight",
};

/**
 * Inbox kinds that naturally become editorial contents.
 * Datasets/statistical releases belong to the Observatory workflow and events
 * belong to the dedicated event desk, so they must not be silently converted.
 */
export function canCreateContentDraftFromInbox(itemKind: string): boolean {
  return Object.hasOwn(CONTENT_DRAFT_TYPE_BY_INBOX_KIND, itemKind);
}

export function suggestedContentTypeForInboxKind(itemKind: string): string | null {
  return CONTENT_DRAFT_TYPE_BY_INBOX_KIND[itemKind] ?? null;
}

/**
 * Radar metadata can provide a non-binding category suggestion. The editor can
 * always change it before creating the draft. Public-submission metadata is
 * treated only as a hint and never as an authorization signal.
 */
export function suggestedCategoryForInboxMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata) return null;
  const topic = metadata.topic;
  if (Array.isArray(topic) && topic.some((value) => value === "culture")) {
    return "culture";
  }
  if (metadata.cultural_scope === "creative_industries") return "culture";
  return null;
}
