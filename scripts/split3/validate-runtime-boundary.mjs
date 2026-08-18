import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appRoot = path.join(root, "src", "app");

const forbiddenRouteDirs = new Set([
  "persone",
  "imprese",
  "professionisti",
  "opportunita",
  "mercati",
  "servizi",
  "collaborazioni",
  "organizzazioni",
]);

const forbiddenDbPatterns = [
  /\.from\(["']businesses["']\)/,
  /\.from\(["']business_memberships["']\)/,
  /\.from\(["']professional_profiles["']\)/,
  /\.from\(["']professional_profile_categories["']\)/,
  /\.from\(["']service_offers["']\)/,
  /\.from\(["']service_requests["']\)/,
  /\.from\(["']opportunities["']\)/,
  /\.from\(["']opportunity_activity_scope_assignments["']\)/,
  /\.from\(["']organizations["']\)/,
  /\.from\(["']organization_types["']\)/,
  /\.from\(["']organization_activity_scopes["']\)/,
  /\.from\(["']collaborations["']\)/,
  /\.from\(["']international_markets["']\)/,
  /\.from\(["']international_market_presences["']\)/,
  /\.from\(["']international_market_interests["']\)/,
  /\.from\(["']international_commercial_relations["']\)/,
  /\.from\(["']internationalization_needs["']\)/,
  /\.from\(["']training_offers["']\)/,
  /\.from\(["']training_requests["']\)/,
];

const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) out.push(absolute);
  }
  return out;
}

for (const entry of fs.readdirSync(appRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && forbiddenRouteDirs.has(entry.name)) {
    failures.push(`forbidden Ponte route directory in Immigrati: src/app/${entry.name}`);
  }
}

const activeRuntimeFiles = [
  path.join(root, "src", "lib", "data", "public", "culture.ts"),
  path.join(root, "src", "lib", "data", "public", "related.ts"),
  path.join(root, "src", "lib", "data", "public", "contents.ts"),
  path.join(root, "src", "lib", "data", "public", "events.ts"),
  path.join(root, "src", "lib", "data", "public", "observatory.ts"),
  path.join(root, "src", "lib", "data", "editorial", "contents.ts"),
  path.join(root, "src", "lib", "data", "editorial", "events.ts"),
  path.join(root, "src", "lib", "data", "editorial", "observatory.ts"),
].filter(fs.existsSync);

for (const file of activeRuntimeFiles) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file).replaceAll("\\", "/");
  for (const pattern of forbiddenDbPatterns) {
    if (pattern.test(text)) {
      failures.push(`${rel}: Ponte-owned database query remains (${pattern})`);
    }
  }
}

if (failures.length) {
  console.error("SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = PASS");
