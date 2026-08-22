import { existsSync, readFileSync } from "node:fs";

function fail(message) {
  throw new Error(`GO_LIVE_GATE: ${message}`);
}

function file(path) {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

function includes(path, tokens) {
  const source = file(path);
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${path} missing ${JSON.stringify(token)}`);
  }
}

const requiredRoutes = [
  "src/app/osservatorio/page.tsx",
  "src/app/atlante/page.tsx",
  "src/app/atlante/rotte/page.tsx",
  "src/app/storie/page.tsx",
  "src/app/contributori/[slug]/page.tsx",
  "src/app/open-data/page.tsx",
  "src/app/api/open-data/indicators/route.ts",
  "src/app/api/open-data/indicators.csv/route.ts",
  "src/app/api/open-data/indicators.xlsx/route.ts",
  "src/app/api/analytics/page-view/route.ts",
];

for (const path of requiredRoutes) file(path);

includes("src/lib/i18n/config.ts", [
  '{ code: "it"',
  '{ code: "en"',
  '{ code: "fr"',
  '{ code: "es"',
  '{ code: "de"',
  '{ code: "ar"',
  '{ code: "zh"',
  'direction: "rtl"',
]);

includes("src/app/[locale]/page.tsx", [
  "languageAlternates",
  "alternates: { canonical:",
]);

includes("src/app/layout.tsx", [
  "PrivacyFriendlyAnalytics",
  'type="application/ld+json"',
  "SkipLink",
]);

includes("src/app/open-data/page.tsx", ["JSON · CSV · XLSX", "indicators.xlsx"]);
includes("src/lib/export/xlsx.ts", ["createSimpleXlsx", "0x06054b50"]);
includes("src/app/contributori/[slug]/page.tsx", [
  '.eq("is_public", true)',
  '"@type": "Person"',
]);

includes("supabase/migrations/20260822210500_go_live_audit_analytics.sql", [
  "editorial_content_activity",
  "site_analytics_daily",
  "record_site_page_view",
  "log_editorial_content_activity",
]);

includes(".github/workflows/production-backup.yml", [
  "pg_dump",
  "gpg",
  "retention-days: 14",
  "SUPABASE_DB_URL",
  "BACKUP_ENCRYPTION_PASSPHRASE",
]);

file("docs/security/BACKUP-RECOVERY.md");
file("scripts/ci/backup-archive-smoke.sh");
file("scripts/ci/go-live-db-smoke.sql");
file("e2e/go-live-local.spec.ts");
file("e2e/public-readonly.spec.ts");
file(".github/dependabot.yml");
file(".github/workflows/source-health-weekly.yml");

// Privacy baseline: analytics remains first-party and opt-in at deployment.
includes("src/components/analytics/PrivacyFriendlyAnalytics.tsx", [
  "globalPrivacyControl",
  "doNotTrack",
  'credentials: "omit"',
  "NEXT_PUBLIC_PRIVACY_ANALYTICS_ENABLED",
]);
includes("src/app/api/analytics/page-view/route.ts", [
  "PRIVACY_ANALYTICS_WRITE_ENABLED",
  "record_site_page_view",
  '"Cache-Control": "private, no-store"',
]);

// Accessibility/RTL baseline files must stay wired into the application shell.
file("src/app/accessibility.css");
file("src/app/responsive-overrides.css");
includes("e2e/public-readonly.spec.ts", [
  "all seven platform languages",
  "canonical and hreflang",
  "Arabic RTL",
  "do not overflow mobile",
]);

console.log("GO_LIVE_FUNCTIONAL_GATES = PASS");
