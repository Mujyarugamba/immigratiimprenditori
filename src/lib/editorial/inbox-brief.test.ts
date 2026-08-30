import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInboxEditorialBrief } from "./inbox-brief";

describe("inbox editorial brief", () => {
  it("extracts verified claims and a structured draft recommendation", () => {
    const brief = buildInboxEditorialBrief({
      verified_claims: ["Claim one", " Claim two "],
      source_checked_on: "2026-08-30",
      migration_relevance: "direct",
      draft_recommendation: {
        recommended_type: "analysis",
        recommended_category: "culture",
        editorial_priority: 2,
        working_title: "Working title",
        angle: "Editorial angle",
        outline: ["First", "Second"],
        cautions: ["Do not generalize"],
      },
    });

    assert.ok(brief);
    assert.deepEqual(brief.verifiedClaims, ["Claim one", "Claim two"]);
    assert.equal(brief.sourceCheckedOn, "2026-08-30");
    assert.equal(brief.migrationRelevance, "direct");
    assert.equal(brief.draftRecommendation?.recommendedType, "analysis");
    assert.equal(brief.draftRecommendation?.recommendedCategory, "culture");
    assert.equal(brief.draftRecommendation?.editorialPriority, 2);
    assert.deepEqual(brief.draftRecommendation?.outline, ["First", "Second"]);
  });

  it("ignores malformed metadata instead of rendering raw objects", () => {
    const brief = buildInboxEditorialBrief({
      verified_claims: { unsafe: true },
      draft_recommendation: "not-an-object",
      source_checked_on: 123,
    });
    assert.equal(brief, null);
  });
});
