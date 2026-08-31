import assert from "node:assert/strict";
import test from "node:test";
import {
  canApproveInterview,
  canEditInterviewConsents,
  canTransitionInterview,
} from "@/lib/editorial/interview-workflow";

test("la pipeline non consente scorciatoie verso approvato", () => {
  assert.equal(canTransitionInterview("candidate", "approved"), false);
  assert.equal(canTransitionInterview("candidate", "contacted"), true);
  assert.equal(canTransitionInterview("contacted", "interviewed"), true);
  assert.equal(canTransitionInterview("interviewed", "fact_check"), true);
  assert.equal(canTransitionInterview("fact_check", "approved"), true);
});

test("i consensi non sono modificabili prima del contatto o dopo la chiusura editoriale", () => {
  assert.equal(canEditInterviewConsents("candidate"), false);
  assert.equal(canEditInterviewConsents("contacted"), true);
  assert.equal(canEditInterviewConsents("scheduled"), true);
  assert.equal(canEditInterviewConsents("interviewed"), true);
  assert.equal(canEditInterviewConsents("fact_check"), true);
  assert.equal(canEditInterviewConsents("approved"), false);
  assert.equal(canEditInterviewConsents("declined"), false);
});

test("l'approvazione richiede fact-check e i due consensi essenziali", () => {
  assert.equal(
    canApproveInterview({
      workflowStatus: "fact_check",
      publicationConsentStatus: "granted",
      quoteApprovalStatus: "granted",
    }),
    true,
  );
  assert.equal(
    canApproveInterview({
      workflowStatus: "interviewed",
      publicationConsentStatus: "granted",
      quoteApprovalStatus: "granted",
    }),
    false,
  );
  assert.equal(
    canApproveInterview({
      workflowStatus: "fact_check",
      publicationConsentStatus: "pending",
      quoteApprovalStatus: "granted",
    }),
    false,
  );
  assert.equal(
    canApproveInterview({
      workflowStatus: "fact_check",
      publicationConsentStatus: "granted",
      quoteApprovalStatus: "pending",
    }),
    false,
  );
});
