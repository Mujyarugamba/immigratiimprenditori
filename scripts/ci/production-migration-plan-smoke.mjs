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
if (!Array.isArray(candidates) || candidates.length === 0) {
  fail("production migration plan must declare a non-empty candidateDelta");
}

const uniqueCandidates = new Set(candidates);
if (uniqueCandidates.size !== candidates.length) {
  fail("candidateDelta contains duplicate filenames");
}

const sortedCandidates = [...candidates].sort((a, b) => a.localeCompare(b));
if (JSON.stringify(sortedCandidates) !== JSON.stringify(candidates)) {
  fail("candidateDelta must stay in chronological filename order");
}

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

const repositoryFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((filename) => timestampOf(filename))
  .sort((a, b) => a.localeCompare(b));

for (const filename of [...aliases, ...candidates]) {
  if (!repositoryFiles.includes(filename)) {
    fail(`release plan references missing repository migration: ${filename}`);
  }
}

const postCutoffRepositoryFiles = repositoryFiles.filter((filename) => {
  const timestamp = timestampOf(filename);
  return timestamp !== null && timestamp > cutoff;
});
const accountedPostCutoff = [...aliases, ...candidates].sort((a, b) => a.localeCompare(b));

if (JSON.stringify(postCutoffRepositoryFiles) !== JSON.stringify(accountedPostCutoff)) {
  const missingFromPlan = postCutoffRepositoryFiles.filter(
    (filename) => !accountedPostCutoff.includes(filename),
  );
  const stalePlanEntries = accountedPostCutoff.filter(
    (filename) => !postCutoffRepositoryFiles.includes(filename),
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
      postCutoffRepositoryFiles: postCutoffRepositoryFiles.length,
      destructiveSchemaOperations: 0,
    },
    null,
    2,
  ),
);
