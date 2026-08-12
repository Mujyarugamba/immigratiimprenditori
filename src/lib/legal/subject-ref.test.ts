import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { subjectRefForAccountId, subjectRefsEqual } from "./subject-ref";

describe("subject_ref HMAC (M3)", () => {
  const secret = "x".repeat(32);
  const accountId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  it("is opaque, prefixed, and stable", () => {
    const a = subjectRefForAccountId(accountId, secret);
    const b = subjectRefForAccountId(accountId, secret);
    assert.match(a, /^ls_[0-9a-f]{64}$/);
    assert.equal(a, b);
    assert.ok(subjectRefsEqual(a, b));
  });

  it("does not embed email or raw account id", () => {
    const ref = subjectRefForAccountId(accountId, secret);
    assert.equal(ref.includes("@"), false);
    assert.equal(ref.includes(accountId), false);
    assert.equal(ref.includes("aaaa"), false);
  });

  it("changes when secret changes", () => {
    const a = subjectRefForAccountId(accountId, secret);
    const b = subjectRefForAccountId(accountId, "y".repeat(32));
    assert.notEqual(a, b);
  });

  it("rejects non-uuid account ids", () => {
    assert.throws(() => subjectRefForAccountId("not-a-uuid", secret));
  });
});
