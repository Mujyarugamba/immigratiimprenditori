import { describe, expect, it } from "vitest";
import {
  canCreateContentDraftFromInbox,
  suggestedContentTypeForInboxKind,
} from "@/lib/editorial/inbox-draft";

describe("inbox draft routing", () => {
  it("maps editorial source kinds to valid content types", () => {
    expect(suggestedContentTypeForInboxKind("report")).toBe("research_report");
    expect(suggestedContentTypeForInboxKind("academic_paper")).toBe("research_report");
    expect(suggestedContentTypeForInboxKind("policy")).toBe("policy_brief");
    expect(suggestedContentTypeForInboxKind("story_tip")).toBe("business_story");
    expect(suggestedContentTypeForInboxKind("interview_proposal")).toBe("interview");
  });

  it("keeps Observatory and event arrivals out of the content-draft shortcut", () => {
    expect(canCreateContentDraftFromInbox("dataset")).toBe(false);
    expect(canCreateContentDraftFromInbox("statistical_release")).toBe(false);
    expect(canCreateContentDraftFromInbox("event")).toBe(false);
    expect(suggestedContentTypeForInboxKind("event")).toBeNull();
  });
});
