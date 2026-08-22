import assert from "node:assert/strict";
import test from "node:test";
import { evaluateNumberZeroReadiness } from "./launch-readiness";

test("number zero fails when stories/voices are missing", () => {
  const result = evaluateNumberZeroReadiness({
    lombardyDataValues: 1,
    italyDataValues: 8,
    internationalComparisonTerritories: 8,
    selectedReports: 2,
    publishedStoriesVoices: 0,
    publishedEvents: 1,
    interviewCandidatesInResearch: 5,
  });

  assert.equal(result.automaticPass, false);
  const stories = result.criteria.find((criterion) => criterion.key === "stories_voices");
  assert.ok(stories);
  assert.equal(stories.pass, false);
  assert.equal(stories.actual, 0);
  assert.equal(result.humanQualityReviewRequired, true);
});

test("number zero automatic evidence passes only when every measurable requirement is present", () => {
  const result = evaluateNumberZeroReadiness({
    lombardyDataValues: 1,
    italyDataValues: 3,
    internationalComparisonTerritories: 3,
    selectedReports: 2,
    publishedStoriesVoices: 2,
    publishedEvents: 1,
    interviewCandidatesInResearch: 0,
  });

  assert.equal(result.automaticPass, true);
  assert.equal(result.criteria.every((criterion) => criterion.pass), true);
  assert.equal(result.humanQualityReviewRequired, true);
});
