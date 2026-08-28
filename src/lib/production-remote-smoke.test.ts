import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const checkerPath = "scripts/ci/remote-production-smoke.mjs";
const workflowPath = ".github/workflows/production-remote-smoke.yml";

const checker = readFileSync(checkerPath, "utf8");
const workflow = readFileSync(workflowPath, "utf8");

test("remote Production smoke remains manual, GET-only and tied to promoted main", () => {
  execFileSync(process.execPath, ["--check", checkerPath], { stdio: "pipe" });

  for (const marker of [
    "workflow_dispatch:",
    "contents: read",
    "if: github.ref == 'refs/heads/main'",
    "SMOKE_PRODUCTION",
    "git ls-remote --heads origin refs/heads/production",
    "production has not been promoted to the approved main SHA",
    "PRODUCTION_SMOKE_TARGET",
    "scripts/ci/remote-production-smoke.mjs",
  ]) {
    assert.ok(workflow.includes(marker), `missing Production smoke safety marker: ${marker}`);
  }

  assert.doesNotMatch(
    workflow,
    /^\s+(push|schedule|workflow_call|repository_dispatch|pull_request_target):/m,
    "Production smoke must remain manual-only",
  );
  assert.ok(!workflow.includes("contents: write"), "Production smoke must not receive repository write permission");
  assert.ok(!workflow.includes("secrets."), "Production smoke must not consume repository secrets");

  assert.match(checker, /method:\s*"GET"/, "remote checker must use explicit GET requests");
  assert.doesNotMatch(
    checker,
    /method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/i,
    "remote checker must not contain mutating HTTP methods",
  );
  assert.ok(!checker.includes("SUPABASE_SERVICE_ROLE_KEY"), "remote checker must remain service-role-free");
  assert.ok(checker.includes("immigratiimprenditori.it"), "official Production host allowlist missing");
  assert.ok(checker.includes('host.startsWith("immigratiimprenditori")'), "Vercel project-name host guard missing");
  assert.ok(checker.includes('.vercel.app'), "Vercel deployment host allowlist missing");
  assert.ok(checker.includes('redirect: "manual"'), "redirect-following must remain disabled");
  assert.ok(checker.includes('url.protocol !== "https:"'), "HTTPS-only target guard missing");

  for (const path of [
    "/osservatorio",
    "/atlante",
    "/storie",
    "/eventi",
    "/fonti",
    "/open-data",
    "/api/open-data/indicators",
  ]) {
    assert.ok(checker.includes(path), `remote Production smoke coverage missing: ${path}`);
  }
  for (const contractMarker of ["dataset", "record_count", "filters", "records"]) {
    assert.ok(checker.includes(contractMarker), `open-data contract marker missing: ${contractMarker}`);
  }
});
