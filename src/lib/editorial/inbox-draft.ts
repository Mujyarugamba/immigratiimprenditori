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
