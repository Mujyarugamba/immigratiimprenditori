import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("allows relative in-app paths", () => {
    assert.equal(safeRedirectPath("/app/profilo"), "/app/profilo");
  });

  it("rejects open redirects", () => {
    assert.equal(safeRedirectPath("https://evil.test"), "/app");
    assert.equal(safeRedirectPath("//evil.test"), "/app");
    assert.equal(safeRedirectPath("\\\\evil"), "/app");
    assert.equal(safeRedirectPath(null), "/app");
  });
});
