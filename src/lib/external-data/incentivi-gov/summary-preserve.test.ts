import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHash } from "node:crypto";

/** Mirrors apply-opendata summary preservation rule (source vs editorial). */
function summaryLooksSourceControlled(input: {
  description: string | null;
  purpose: string | null;
  prevSummarySha: string;
  currentSummary: string;
}): boolean {
  const currentSha = createHash("sha256")
    .update(input.currentSummary, "utf8")
    .digest("hex");
  return (
    !input.description &&
    !input.purpose &&
    (input.prevSummarySha === "" || input.prevSummarySha === currentSha)
  );
}

describe("D1-B.2 source vs editorial summary separation", () => {
  it("allows refresh overwrite when summary still matches source sha", () => {
    const summary = "Sintesi ufficiale dalla fonte.";
    const sha = createHash("sha256").update(summary, "utf8").digest("hex");
    assert.equal(
      summaryLooksSourceControlled({
        description: null,
        purpose: null,
        prevSummarySha: sha,
        currentSummary: summary,
      }),
      true,
    );
  });

  it("preserves human-edited summary (sha mismatch)", () => {
    const source = "Sintesi ufficiale dalla fonte.";
    const edited = "Sintesi riscritta dalla redazione.";
    const sha = createHash("sha256").update(source, "utf8").digest("hex");
    assert.equal(
      summaryLooksSourceControlled({
        description: null,
        purpose: null,
        prevSummarySha: sha,
        currentSummary: edited,
      }),
      false,
    );
  });

  it("preserves summary once editorial description/purpose exist", () => {
    const summary = "Sintesi ufficiale dalla fonte.";
    const sha = createHash("sha256").update(summary, "utf8").digest("hex");
    assert.equal(
      summaryLooksSourceControlled({
        description: "Nota redazionale",
        purpose: null,
        prevSummarySha: sha,
        currentSummary: summary,
      }),
      false,
    );
  });
});
