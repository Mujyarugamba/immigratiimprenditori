import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const appRoot = path.join(srcRoot, "app");
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"];

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

const forbiddenHrefFragments = [
  'href="/persone',
  'href="/imprese',
  'href="/professionisti',
  'href="/opportunita',
  'href="/mercati',
  'href="/servizi',
  'href="/collaborazioni',
  'href="/organizzazioni',
  'href: "/persone',
  'href: "/imprese',
  'href: "/professionisti',
  'href: "/opportunita',
  'href: "/mercati',
  'href: "/servizi',
  'href: "/collaborazioni',
  'href: "/organizzazioni',
];

const forbiddenDbPatterns = [
  /\.from\(["']businesses["']\)/,
  /\.from\(["']business_(?!sectors["'])[^"']+["']\)/,
  /\.from\(["']professional_[^"']+["']\)/,
  /\.from\(["']service_offers["']\)/,
  /\.from\(["']service_requests["']\)/,
  /\.from\(["']service_[^"']+["']\)/,
  /\.from\(["']opportunities["']\)/,
  /\.from\(["']opportunity_activity_scope_assignments["']\)/,
  /\.from\(["']opportunity_party_references["']\)/,
  /\.from\(["']opportunity_professional_references["']\)/,
  /\.from\(["']opportunity_sources["']\)/,
  /\.from\(["']opportunity_time_windows["']\)/,
  /\.from\(["']opportunity_market_references["']\)/,
  /\.from\(["']organizations["']\)/,
  /\.from\(["']organization_[^"']+["']\)/,
  /\.from\(["']collaborations["']\)/,
  /\.from\(["']collaboration_[^"']+["']\)/,
  /\.from\(["']international_market[^"']*["']\)/,
  /\.from\(["']international_commercial_relations["']\)/,
  /\.from\(["']internationalization_[^"']+["']\)/,
  /\.from\(["']training_[^"']+["']\)/,
  /\.from\(["']person_contact_channels["']\)/,
  /\.from\(["']personal_stories["']\)/,
  /\.from\(["']profile_languages["']\)/,
  /\.from\(["']profile_language_services["']\)/,
  /\.from\(["']profile_competencies["']\)/,
];

const forbiddenReachableModules = [
  /\/src\/lib\/data\/public\/(?:people|businesses|professionals|opportunities|markets|services|organizations|collaborations)\.(?:ts|tsx|js|jsx|mjs)$/,
  /\/src\/lib\/data\/editorial\/(?:markets|opportunities|organizations)\.(?:ts|tsx|js|jsx|mjs)$/,
];

const failures = [];

function normalize(file) {
  return file.replaceAll("\\", "/");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(absolute);
  }
  return out;
}

function resolveModule(specifier, fromFile) {
  let base;
  if (specifier.startsWith("@/")) {
    base = path.join(srcRoot, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [
    base,
    ...extensions.map((ext) => `${base}${ext}`),
    ...extensions.map((ext) => path.join(base, `index${ext}`)),
  ];
  return candidates.find(
    (candidate) =>
      fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  ) ?? null;
}

function runtimeImportSpecifiers(text) {
  const specs = [];
  const runtimeText = text.replace(
    /(^|\n)\s*import\s+type\b[\s\S]*?;\s*/g,
    "$1",
  );

  for (const match of runtimeText.matchAll(
    /(?:^|\n)\s*(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s*["']([^"']+)["'];?/gm,
  )) {
    if (match[1]) specs.push(match[1]);
  }

  for (const match of runtimeText.matchAll(
    /(?:^|\n)\s*import\s*["']([^"']+)["'];?/gm,
  )) {
    if (match[1]) specs.push(match[1]);
  }

  for (const match of runtimeText.matchAll(
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  )) {
    if (match[1]) specs.push(match[1]);
  }

  for (const match of runtimeText.matchAll(
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  )) {
    if (match[1]) specs.push(match[1]);
  }

  return specs;
}

for (const entry of fs.readdirSync(appRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && forbiddenRouteDirs.has(entry.name)) {
    failures.push(
      `forbidden Ponte route directory in Immigrati: src/app/${entry.name}`,
    );
  }
}

const reachable = new Set();
const queue = walk(appRoot);

while (queue.length) {
  const file = queue.pop();
  if (!file || reachable.has(file)) continue;
  reachable.add(file);

  const text = fs.readFileSync(file, "utf8");
  for (const specifier of runtimeImportSpecifiers(text)) {
    const resolved = resolveModule(specifier, file);
    if (resolved && !reachable.has(resolved)) queue.push(resolved);
  }
}

for (const file of reachable) {
  const text = fs.readFileSync(file, "utf8");
  const rel = normalize(path.relative(root, file));
  const normalizedAbsolute = `/${normalize(file)}`;

  for (const pattern of forbiddenReachableModules) {
    if (pattern.test(normalizedAbsolute)) {
      failures.push(`${rel}: Ponte module is reachable from Immigrati routes`);
    }
  }

  for (const fragment of forbiddenHrefFragments) {
    if (text.includes(fragment)) {
      failures.push(`${rel}: local Ponte href remains (${fragment})`);
    }
  }

  for (const pattern of forbiddenDbPatterns) {
    if (pattern.test(text)) {
      failures.push(`${rel}: Ponte-owned database query remains (${pattern})`);
    }
  }
}

if (failures.length) {
  console.error("SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = FAIL");
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SPLIT3_IMMIGRATI_RUNTIME_REACHABLE_FILES = ${reachable.size}`);
console.log("SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = PASS");
