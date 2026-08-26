import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, "supabase", "CS-PRODUCTION-RELEASE.json");
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");
const BASELINE_DIR = path.join(ROOT, "supabase", "baseline");

function fail(message) {
  throw new Error(message);
}

function timestampOf(filename) {
  const match = /^(\d{14})_.+\.sql$/.exec(filename);
  return match?.[1] ?? null;
}

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n\r]*/g, " ");
}

const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const cutoff = plan?.observedHostedLatestMigration?.version;
if (!/^\d{14}$/.test(cutoff ?? "")) {
  fail("production migration plan: invalid observed hosted cutoff");
}

if (plan.releasePolicy?.forbidWholeDirectoryDbPush !== true) {
  fail("production migration plan must explicitly forbid whole-directory db push");
}
if (plan.releasePolicy?.productionApplyRequiresExplicitAuthorization !== true) {
  fail("production migration plan must require explicit production authorization");
}

const baseline = plan.canonicalColdStartBaseline ?? [];
if (!Array.isArray(baseline) || baseline.length !== 4) {
  fail("production migration plan must declare the four canonical cold-start baseline files");
}
for (const filename of baseline) {
  const fullPath = path.join(BASELINE_DIR, filename);
  if (!fs.existsSync(fullPath)) fail(`missing canonical baseline file: ${filename}`);
}

const aliases = Object.keys(plan.alreadyAppliedRepositoryAliases ?? {});
const candidates = plan.candidateDelta ?? [];
if (!Array.isArray(candidates)) {
  fail("production migration plan must declare candidateDelta as an array");
}

const uniqueCandidates = new Set(candidates);
if (uniqueCandidates.size !== candidates.length) {
  fail("candidateDelta contains duplicate filenames");
}

const sortedCandidates = [...candidates].sort((a, b) => a.localeCompare(b));
if (JSON.stringify(sortedCandidates) !== JSON.stringify(candidates)) {
  fail("candidateDelta must stay in chronological filename order");
}

const repositoryFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((filename) => timestampOf(filename))
  .sort((a, b) => a.localeCompare(b));

// These migrations are release-critical security/governance invariants. They
// remain required in the repository even when candidateDelta is empty because
// Production has already applied them. The general drift check below prevents
// unclassified future files, while this explicit set prevents a cleanup from
// deleting a critical file after it left the candidate list.
const requiredSecurityMigrations = [
  "20260822172000_harden_content_publication_gate.sql",
  "20260822183000_persistent_public_submission_rate_limits.sql",
  "20260822184500_editorial_login_rate_limits.sql",
  "20260822190000_enforce_privileged_mfa_aal2.sql",
  "20260822210500_go_live_audit_analytics.sql",
  "20260822211500_fix_public_rls_mfa_compatibility.sql",
  "20260822213000_hybrid_editorial_review_governance.sql",
  "20260822213100_fix_hybrid_null_category_classifier.sql",
  "20260824103000_harden_publication_gate_execute_privileges.sql",
];
for (const filename of requiredSecurityMigrations) {
  if (!repositoryFiles.includes(filename)) {
    fail(`release-critical security migration missing from repository: ${filename}`);
  }
}

for (const filename of candidates) {
  const timestamp = timestampOf(filename);
  if (timestamp === null || timestamp <= cutoff) {
    fail(
      `candidateDelta must not include migrations at or before hosted cutoff ${cutoff}: ${filename}`,
    );
  }
}

const securityIndexesInDelta = requiredSecurityMigrations
  .map((filename) => candidates.indexOf(filename))
  .filter((index) => index >= 0);
for (let index = 1; index < securityIndexesInDelta.length; index += 1) {
  if (!(securityIndexesInDelta[index - 1] < securityIndexesInDelta[index])) {
    fail(
      "release-critical security migrations must remain ordered in candidateDelta: publication gate -> public rate limit -> login rate limit -> MFA -> audit -> hybrid review governance -> null-category classifier fix -> publication-gate execute privileges",
    );
  }
}

const aliasSet = new Set(aliases);
for (const filename of aliases) {
  if (uniqueCandidates.has(filename)) {
    fail(`migration cannot be both already-applied alias and candidate: ${filename}`);
  }
  const alias = plan.alreadyAppliedRepositoryAliases[filename];
  if (!/^\d{14}$/.test(alias?.hostedVersion ?? "")) {
    fail(`invalid hostedVersion for alias ${filename}`);
  }
  if (alias.hostedVersion > cutoff) {
    fail(`already-applied alias ${filename} points beyond observed hosted cutoff`);
  }
}

for (const filename of [...aliases, ...candidates]) {
  if (!repositoryFiles.includes(filename)) {
    fail(`release plan references missing repository migration: ${filename}`);
  }
}

const postCutoffRepositoryFiles = repositoryFiles.filter((filename) => {
  const timestamp = timestampOf(filename);
  return timestamp !== null && timestamp > cutoff;
});
const futurePostCutoff = postCutoffRepositoryFiles.filter(
  (filename) => !aliasSet.has(filename),
);

if (JSON.stringify(futurePostCutoff) !== JSON.stringify(candidates)) {
  const missingFromPlan = futurePostCutoff.filter(
    (filename) => !uniqueCandidates.has(filename),
  );
  const stalePlanEntries = candidates.filter(
    (filename) => !futurePostCutoff.includes(filename),
  );
  fail(
    `post-cutoff migration drift: unclassified=${JSON.stringify(missingFromPlan)} stale=${JSON.stringify(stalePlanEntries)}`,
  );
}

const destructivePatterns = [
  ["DROP TABLE", /\bdrop\s+table\b/i],
  ["DROP SCHEMA", /\bdrop\s+schema\b/i],
  ["TRUNCATE", /\btruncate(?:\s+table)?\b/i],
  ["DROP COLUMN", /\balter\s+table[\s\S]{0,500}?\bdrop\s+column\b/i],
];

for (const filename of candidates) {
  const sql = stripSqlComments(fs.readFileSync(path.join(MIGRATIONS_DIR, filename), "utf8"));
  for (const [label, pattern] of destructivePatterns) {
    if (pattern.test(sql)) {
      fail(`${filename}: destructive schema operation ${label} requires a separately reviewed release plan`);
    }
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      hostedProjectRef: plan.hostedProjectRef,
      observedHostedLatestMigration: plan.observedHostedLatestMigration,
      canonicalBaselineFiles: baseline.length,
      alreadyAppliedAliases: aliases.length,
      candidateDelta: candidates.length,
      requiredSecurityMigrations: requiredSecurityMigrations.length,
      postCutoffRepositoryFiles: postCutoffRepositoryFiles.length,
      destructiveSchemaOperations: 0,
    },
    null,
    2,
  ),
);
