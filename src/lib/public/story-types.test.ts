import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStoryContentType, STORY_CONTENT_TYPES } from "./story-types";

describe("story content types", () => {
  it("recognizes every canonical story type", () => {
    for (const typeCode of STORY_CONTENT_TYPES) {
      assert.equal(isStoryContentType(typeCode), true);
    }
  });

  it("rejects non-story editorial types", () => {
    assert.equal(isStoryContentType("analysis"), false);
    assert.equal(isStoryContentType("research_report"), false);
    assert.equal(isStoryContentType("news"), false);
  });
});
