import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canCreateContentDraftFromInbox,
  suggestedCategoryForInboxMetadata,
  suggestedContentTypeForInboxKind,
} from "./inbox-draft";

describe("inbox draft routing", () => {
  it("maps editorial source kinds to valid content types", () => {
    assert.equal(suggestedContentTypeForInboxKind("report"), "research_report");
    assert.equal(suggestedContentTypeForInboxKind("academic_paper"), "research_report");
    assert.equal(suggestedContentTypeForInboxKind("policy"), "policy_brief");
    assert.equal(suggestedContentTypeForInboxKind("story_tip"), "business_story");
    assert.equal(suggestedContentTypeForInboxKind("interview_proposal"), "interview");
  });

  it("keeps Observatory and event arrivals out of the content-draft shortcut", () => {
    assert.equal(canCreateContentDraftFromInbox("dataset"), false);
    assert.equal(canCreateContentDraftFromInbox("statistical_release"), false);
    assert.equal(canCreateContentDraftFromInbox("event"), false);
    assert.equal(suggestedContentTypeForInboxKind("event"), null);
  });

  it("suggests the culture category only from explicit culture metadata", () => {
    assert.equal(
      suggestedCategoryForInboxMetadata({ topic: ["culture", "migration"] }),
      "culture",
    );
    assert.equal(
      suggestedCategoryForInboxMetadata({ cultural_scope: "creative_industries" }),
      "culture",
    );
    assert.equal(
      suggestedCategoryForInboxMetadata({ topic: ["entrepreneurship"] }),
      null,
    );
  });
});
