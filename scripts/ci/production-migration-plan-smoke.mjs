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

function assertSortedUnique(label, files) {
  if (!Array.isArray(files)) fail(`${label} must be an array`);
  if (new Set(files).size !== files.length) fail(`${label} contains duplicates`);
  const sorted = [...files].sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(sorted) !== JSON.stringify(files)) {
    fail(`${label} must stay in chronological filename order`);
  }
}

const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const observed = plan?.observedHostedLatestMigration?.version;
const releaseBaseline = plan?.releaseBaselineHostedLatestMigration?.version;

if (!/^\d{14}$/.test(observed ?? "")) {
  fail("production migration plan: invalid observed hosted latest migration");
}
if (!/^\d{14}$/.test(releaseBaseline ?? "")) {
  fail("production migration plan: invalid release baseline hosted migration");
}
if (observed < releaseBaseline) {
  fail("observed hosted migration cannot precede the release baseline");
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
const applied = plan.appliedReleaseDelta ?? [];
const candidates = plan.candidateDelta ?? [];
assertSortedUnique("appliedReleaseDelta", applied);
assertSortedUnique("candidateDelta", candidates);

const releaseDelta = [...applied, ...candidates];
assertSortedUnique("combined release delta", releaseDelta);

const allTracked = [...aliases, ...releaseDelta];
if (new Set(allTracked).size !== allTracked.length) {
  fail("a migration cannot appear in more than one release-plan bucket");
}

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
  if (!releaseDelta.includes(filename)) {
    fail(`release-critical security migration missing from release delta: ${filename}`);
  }
}

const requiredOrder = [
  "20260822172000_harden_content_publication_gate.sql",
  "20260822183000_persistent_public_submission_rate_limits.sql",
  "20260822184500_editorial_login_rate_limits.sql",
  "20260822190000_enforce_privileged_mfa_aal2.sql",
  "20260822210500_go_live_audit_analytics.sql",
  "20260822213000_hybrid_editorial_review_governance.sql",
  "20260822213100_fix_hybrid_null_category_classifier.sql",
  "20260824103000_harden_publication_gate_execute_privileges.sql",
];
let previousIndex = -1;
for (const filename of requiredOrder) {
  const index = releaseDelta.indexOf(filename);
  if (index <= previousIndex) {
    fail("release-critical security migrations are not in the required chronological order");
  }
  previousIndex = index;
}

for (const filename of aliases) {
  const alias = plan.alreadyAppliedRepositoryAliases[filename];
  if (!/^\d{14}$/.test(alias?.hostedVersion ?? "")) {
    fail(`invalid hostedVersion for alias ${filename}`);
  }
  if (alias.hostedVersion > observed) {
    fail(`already-applied alias ${filename} points beyond observed hosted state`);
  }
}

for (const filename of applied) {
  const timestamp = timestampOf(filename);
  if (timestamp === null || timestamp > observed) {
    fail(`applied release migration is beyond observed hosted state: ${filename}`);
  }
}
for (const filename of candidates) {
  const timestamp = timestampOf(filename);
  if (timestamp === null || timestamp <= observed) {
    fail(`candidate migration must be newer than observed hosted state: ${filename}`);
  }
}

const repositoryFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((filename) => timestampOf(filename))
  .sort((a, b) => a.localeCompare(b));

for (const filename of allTracked) {
  if (!repositoryFiles.includes(filename)) {
    fail(`release plan references missing repository migration: ${filename}`);
  }
}

const postBaselineRepositoryFiles = repositoryFiles.filter((filename) => {
  const timestamp = timestampOf(filename);
  return timestamp !== null && timestamp > releaseBaseline;
});
const accountedPostBaseline = [...allTracked].sort((a, b) => a.localeCompare(b));

if (JSON.stringify(postBaselineRepositoryFiles) !== JSON.stringify(accountedPostBaseline)) {
  const missingFromPlan = postBaselineRepositoryFiles.filter(
    (filename) => !accountedPostBaseline.includes(filename),
  );
  const stalePlanEntries = accountedPostBaseline.filter(
    (filename) => !postBaselineRepositoryFiles.includes(filename),
  );
  fail(
    `post-baseline migration drift: unclassified=${JSON.stringify(missingFromPlan)} stale=${JSON.stringify(stalePlanEntries)}`,
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
      releaseBaselineHostedLatestMigration: plan.releaseBaselineHostedLatestMigration,
      observedHostedLatestMigration: plan.observedHostedLatestMigration,
      canonicalBaselineFiles: baseline.length,
      alreadyAppliedAliases: aliases.length,
      appliedReleaseDelta: applied.length,
      candidateDelta: candidates.length,
      requiredSecurityMigrations: requiredSecurityMigrations.length,
      postBaselineRepositoryFiles: postBaselineRepositoryFiles.length,
      candidateDestructiveSchemaOperations: 0,
    },
    null,
    2,
  ),
);
