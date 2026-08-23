import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(ROOT, "src");
const RUNTIME_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

const forbiddenRuntimePatterns = [
  ["Google Tag Manager", /googletagmanager\.com/i],
  ["Google Analytics", /google-analytics\.com/i],
  ["Meta Pixel", /connect\.facebook\.net|facebook\.com\/tr/i],
  ["Hotjar", /static\.hotjar\.com|script\.hotjar\.com/i],
  ["Microsoft Clarity", /(?:www\.)?clarity\.ms/i],
  ["Microsoft/Bing Ads", /bat\.bing\.com/i],
  ["LinkedIn Insight Tag", /snap\.licdn\.com/i],
  ["TikTok analytics", /analytics\.tiktok\.com/i],
  ["YouTube embed", /youtube(?:-nocookie)?\.com\/embed/i],
  ["Vimeo embed", /player\.vimeo\.com\/video/i],
  ["iframe embed", /<iframe\b/i],
  ["gtag runtime", /\bgtag\s*\(/i],
  ["fbq runtime", /\bfbq\s*\(/i],
];

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (RUNTIME_EXTENSIONS.has(path.extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

const findings = [];
for (const fullPath of walk(SOURCE_ROOT)) {
  const source = readFileSync(fullPath, "utf8");
  for (const [label, pattern] of forbiddenRuntimePatterns) {
    const match = source.match(pattern);
    if (!match) continue;
    findings.push({
      file: path.relative(ROOT, fullPath),
      label,
      match: match[0],
    });
  }
}

if (findings.length) {
  console.error("PRIVACY_RUNTIME_GUARD = FAIL");
  console.error(
    "External tracker/embed markers were found in runtime source. Review Cookie/Privacy policy and consent architecture before allowing them.",
  );
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.label} (${finding.match})`);
  }
  process.exit(1);
}

const analyticsRoutePath = path.join(
  SOURCE_ROOT,
  "app",
  "api",
  "analytics",
  "page-view",
  "route.ts",
);
const analyticsRoute = readFileSync(analyticsRoutePath, "utf8");
const requiredAnalyticsFlags = [
  "NEXT_PUBLIC_PRIVACY_ANALYTICS_ENABLED",
  "PRIVACY_ANALYTICS_WRITE_ENABLED",
];
for (const flag of requiredAnalyticsFlags) {
  if (!analyticsRoute.includes(`process.env.${flag} !== \"true\"`)) {
    console.error("PRIVACY_RUNTIME_GUARD = FAIL");
    console.error(
      `Analytics write endpoint must fail closed unless ${flag}=true.`,
    );
    process.exit(1);
  }
}

console.log("PRIVACY_RUNTIME_GUARD = PASS");
console.log(
  "Checked runtime source for known trackers/external embeds and enforced dual analytics activation gates.",
);
