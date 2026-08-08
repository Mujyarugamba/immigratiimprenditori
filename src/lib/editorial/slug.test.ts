import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify } from "./slug";

describe("editorial slugify", () => {
  it("normalizes italian titles to slug format", () => {
    assert.equal(slugify("  Guida all'Impresa  "), "guida-allimpresa");
    assert.equal(slugify("Caffè & Mercati"), "caffe-mercati");
  });

  it("collapses dashes and strips invalid chars", () => {
    assert.equal(slugify("---Hello---World!!!---"), "hello-world");
  });
});
