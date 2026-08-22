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
  "src/app/autori/[slug]/page.tsx",
  "src/app/esplora/autori/page.tsx",
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
includes("src/lib/i18n/seo.ts", ["PLATFORM_LOCALES", 'languages["x-default"]']);
includes("src/app/sitemap.ts", ["fullyLocalizedCoreRoutes", '"x-default"']);

includes("src/app/layout.tsx", [
  "PrivacyFriendlyAnalytics",
  'type="application/ld+json"',
  "SkipLink",
]);

includes("src/app/open-data/page.tsx", ["JSON · CSV · XLSX", "indicators.xlsx"]);
includes("src/lib/export/xlsx.ts", ["createSimpleXlsx", "0x06054b50"]);

// Reviewed author identities are distinct from account/contributor profiles.
includes("src/lib/data/public/authors.ts", [
  'from("author_profiles")',
  '.eq("is_public", true)',
  'from("content_authors")',
]);
includes("src/app/autori/[slug]/page.tsx", [
  "getPublicAuthorProfile",
  "listPublicAuthorContents",
  "ORCID",
  "Pubblicazioni e contributi",
]);
includes("src/app/esplora/autori/page.tsx", ["listPublicAuthorProfiles", "/autori/"]);

includes("supabase/migrations/20260822210500_go_live_audit_analytics.sql", [
  "editorial_content_activity",
  "site_analytics_daily",
  "record_site_page_view",
  "log_editorial_content_activity",
]);
includes("supabase/migrations/20260822211500_fix_public_rls_mfa_compatibility.sql", [
  "geo_territories_public_read",
  "migration_routes_public_read",
  "author_profiles_public_read",
  "using (is_active)",
  "using (is_public)",
  "revoke all on function public.access_is_editor() from anon",
]);
includes("supabase/migrations/20260822212000_backfill_futurae_route_evidence.sql", [
  "mlps:futurae:imprenditoria-straniera:2025h1",
  "OBS-IT-IND-FIRM-BIRTH-ATLAS",
  "56642::numeric",
  "5515::numeric",
]);
includes("scripts/ci/go-live-db-smoke.sql", [
  "GO_LIVE_ATLAS_FUTURAE_SOURCE_MISSING",
  "GO_LIVE_ATLAS_ROUTE_EVIDENCE_COUNT_FAILED",
  "GO_LIVE_ATLAS_ROUTE_COUNT_FAILED",
]);

includes(".github/workflows/production-backup.yml", [
  "postgres:17-alpine",
  "pg_dump",
  "pg_restore",
  "gpg",
  "retention-days: 14",
  "SUPABASE_DB_URL",
  "BACKUP_ENCRYPTION_PASSPHRASE",
]);

file("docs/security/BACKUP-RECOVERY.md");
file("scripts/ci/backup-archive-smoke.sh");
file("e2e/go-live-local.spec.ts");
file("e2e/public-readonly.spec.ts");
file("e2e/public-smoke.spec.ts");
file(".github/dependabot.yml");
file(".github/workflows/source-health-weekly.yml");

// The placeholder public browser run must stay data-independent; the full
// public/accessibility audit belongs to the real local Supabase laboratory.
includes("playwright.public.config.ts", ['testMatch: "public-smoke.spec.ts"']);
includes("playwright.auth-ci.config.ts", [
  '"editorial.spec.ts"',
  '"go-live-local.spec.ts"',
  '"public-readonly.spec.ts"',
]);
includes(".github/workflows/supabase-local-validation.yml", [
  '"e2e/public-readonly.spec.ts"',
  '"e2e/public-smoke.spec.ts"',
  '"src/app/autori/**"',
]);

// Privacy baseline: analytics remains first-party and explicitly enabled at deployment.
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
  "externalRequestOrigin",
  "allowedOrigins.has(origin)",
]);

// Accessibility, language, international SEO and RTL are enforced by browser gates.
file("src/app/accessibility.css");
includes("src/components/public/PublicListLayout.tsx", ["<main>", "</main>"]);
includes("src/app/responsive-overrides.css", [
  ".data-stories-grid,",
  ".home-chart-head > *",
  "width: 100%",
  "grid-template-columns: minmax(0, 1fr)",
  "flex-wrap: wrap",
  "overflow: hidden",
  ".institutional-bar,",
  "overflow-x: hidden",
  "max-width: 100%",
  "flex-direction: column",
]);
includes("e2e/public-readonly.spec.ts", [
  "automated accessibility structure gate",
  "all seven platform languages",
  "canonical and hreflang",
  "Arabic RTL",
  "reflow without horizontal overflow",
  "duplicate IDs",
  "unlabeled form controls",
  "offenders=",
]);

// Local go-live E2E must prove evidence-backed data surfaces and slow-network usability.
includes("e2e/go-live-local.spec.ts", [
  "Atlas must expose at least one navigable evidence-backed country",
  "Routes must expose at least one navigable evidence-backed origin-destination route",
  "Stories must expose at least one published navigable story, interview or testimony",
  "published-types=",
  "Open Data exposes a valid XLSX archive",
  "privacy analytics endpoint aggregates a page view without cookies",
  "simulated high-latency delivery",
]);

console.log("GO_LIVE_FUNCTIONAL_GATES = PASS");
