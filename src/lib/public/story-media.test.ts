import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeHttpsUrl, youtubePrivacyEmbedUrl } from "./story-media";

describe("story media helpers", () => {
  it("builds privacy-enhanced YouTube embed URLs", () => {
    assert.equal(
      youtubePrivacyEmbedUrl("dQw4w9WgXcQ"),
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("rejects malformed YouTube ids", () => {
    assert.equal(youtubePrivacyEmbedUrl("bad/id"), null);
    assert.equal(youtubePrivacyEmbedUrl(null), null);
  });

  it("accepts only valid https external URLs", () => {
    assert.equal(safeHttpsUrl("https://example.org/file.pdf"), "https://example.org/file.pdf");
    assert.equal(safeHttpsUrl("http://example.org/file.pdf"), null);
    assert.equal(safeHttpsUrl("javascript:alert(1)"), null);
    assert.equal(safeHttpsUrl("not a url"), null);
  });
});
