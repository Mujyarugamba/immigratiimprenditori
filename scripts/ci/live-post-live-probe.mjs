import { chromium } from "@playwright/test";

const rawTarget = process.env.POST_LIVE_TARGET ?? "https://www.immigratiimprenditori.it";
const runId = process.env.GITHUB_RUN_ID ?? String(Date.now());
const markerEmail = `postlive-ci-${runId}@example.invalid`;
const markerTitle = `TEST POST-LIVE ${runId} — da eliminare`;

function fail(message) {
  throw new Error(message);
}

function expectStatus(label, response, expected = 200) {
  if (response.status !== expected) fail(`${label}: expected ${expected}, got ${response.status}`);
}

const target = new URL(rawTarget);
if (target.protocol !== "https:") fail("POST_LIVE_TARGET must use HTTPS");
if (!["immigratiimprenditori.it", "www.immigratiimprenditori.it"].includes(target.hostname)) {
  fail(`Unexpected target host: ${target.hostname}`);
}

const canonicalOrigin = "https://immigratiimprenditori.it";

const robots = await fetch(new URL("/robots.txt", target), { redirect: "follow" });
expectStatus("robots.txt", robots);
const robotsBody = await robots.text();
for (const sitemap of [
  `${canonicalOrigin}/sitemap.xml`,
  `${canonicalOrigin}/sitemap-contributors.xml`,
]) {
  if (!robotsBody.includes(`Sitemap: ${sitemap}`)) fail(`robots.txt missing ${sitemap}`);
}
if (!robotsBody.includes("Disallow: /app/")) fail("robots.txt must keep /app/ private");

for (const path of ["/sitemap.xml", "/sitemap-contributors.xml"]) {
  const response = await fetch(new URL(path, target), { redirect: "follow" });
  expectStatus(path, response);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("xml")) fail(`${path}: expected XML content-type`);
  const body = await response.text();
  if (!body.includes("<urlset")) fail(`${path}: missing urlset root`);
  if (path === "/sitemap.xml" && !body.includes(canonicalOrigin)) {
    fail("sitemap.xml does not reference the canonical origin");
  }
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  const home = await page.goto(target.toString(), { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (!home?.ok()) fail(`homepage did not return 2xx (${home?.status()})`);
  const homeCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  if (homeCanonical !== `${canonicalOrigin}/`) fail(`unexpected homepage canonical: ${homeCanonical}`);

  const contribution = await page.goto(new URL("/contribuisci", target).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  if (!contribution?.ok()) fail(`/contribuisci did not return 2xx (${contribution?.status()})`);
  const contributionCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  if (contributionCanonical !== `${canonicalOrigin}/contribuisci`) {
    fail(`unexpected /contribuisci canonical: ${contributionCanonical}`);
  }

  await page.locator('select[name="submission_kind"]').selectOption("research");
  await page.locator('input[name="title"]').fill(markerTitle);
  await page.locator('textarea[name="contribution_text"]').fill(
    "Test tecnico post-live del modulo pubblico. Record effimero da eliminare dopo il collaudo.",
  );
  await page.locator('input[name="submitter_name"]').fill("Post-live CI");
  await page.locator('input[name="submitter_email"]').fill(markerEmail);
  await page.locator('input[name="organization_name"]').fill("Centro Studi — collaudo tecnico");
  await page.locator('input[name="consent_contact"]').check();
  await page.getByRole("button", { name: /Invia alla redazione/i }).click();
  await page.waitForURL(/\/contribuisci\?inviato=1$/, { timeout: 45_000 });
  const statusText = await page.getByRole("status").textContent();
  if (!statusText?.includes("Proposta ricevuta")) fail("success confirmation not rendered");

  console.log(JSON.stringify({
    ok: true,
    target: target.origin,
    canonicalOrigin,
    markerEmail,
    markerTitle,
    checked: ["canonical", "robots", "sitemap.xml", "sitemap-contributors.xml", "public contribution form"],
  }, null, 2));
} finally {
  await browser.close();
}
