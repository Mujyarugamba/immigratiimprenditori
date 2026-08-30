import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";

const rawTarget = process.env.PRODUCTION_SMOKE_TARGET ?? "";
const approvedSha = process.env.PRODUCTION_SMOKE_APPROVED_SHA ?? "";
const artifactPath = "artifacts/production-remote-smoke.json";
const canonicalOrigin = "https://immigratiimprenditori.it";

const allowedExactHosts = new Set([
  "immigratiimprenditori.it",
  "www.immigratiimprenditori.it",
]);

function fail(message) {
  throw new Error(message);
}

function normalizeTarget(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail("PRODUCTION_SMOKE_TARGET must be a valid absolute URL");
  }

  if (url.protocol !== "https:") fail("Production smoke target must use HTTPS");
  if (url.username || url.password) fail("Production smoke target must not contain credentials");
  if (url.search || url.hash) fail("Production smoke target must not contain query or fragment components");

  const host = url.hostname.toLowerCase();
  const allowedVercelHost = host.startsWith("immigratiimprenditori") && host.endsWith(".vercel.app");
  const allowed = allowedExactHosts.has(host) || allowedVercelHost;
  if (!allowed) {
    fail(`Production smoke target host is not allowlisted: ${host}`);
  }

  url.pathname = "/";
  return url;
}

async function get(target, path) {
  const url = new URL(path, target);
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      "user-agent": "centro-studi-production-smoke/1.0",
      accept: "text/html,text/plain,application/json,application/xml;q=0.9,*/*;q=0.1",
    },
  });
  return { url, response };
}

function expectStatus(path, response, expected) {
  if (response.status !== expected) {
    fail(`${path}: expected HTTP ${expected}, received ${response.status}`);
  }
}

function expectHeader(response, name, expected) {
  const actual = response.headers.get(name) ?? "";
  if (expected instanceof RegExp) {
    if (!expected.test(actual)) fail(`${name}: unexpected value ${JSON.stringify(actual)}`);
    return;
  }
  if (actual !== expected) fail(`${name}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

function expectHeaderAbsent(response, name) {
  const actual = response.headers.get(name);
  if (actual !== null) fail(`${name}: expected header to be absent, received ${JSON.stringify(actual)}`);
}

function expectProductionCsp(response) {
  const csp = response.headers.get("content-security-policy") ?? "";
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ]) {
    if (!csp.includes(directive)) fail(`content-security-policy: missing ${JSON.stringify(directive)}`);
  }
  if (csp.includes("'unsafe-eval'")) fail("content-security-policy: unsafe-eval must not be enabled");
}

function expectHtml(path, response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    fail(`${path}: expected text/html response, received ${JSON.stringify(contentType)}`);
  }
}

function expectXml(path, response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("xml")) {
    fail(`${path}: expected XML response, received ${JSON.stringify(contentType)}`);
  }
}

function expectCanonical(path, body, expectedPath) {
  const canonicalTag = body.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  if (!canonicalTag) fail(`${path}: canonical link not found`);
  const href = canonicalTag.match(/\bhref=["']([^"']+)["']/i)?.[1];
  if (!href) fail(`${path}: canonical link has no href`);

  let actual;
  try {
    actual = new URL(href, canonicalOrigin);
  } catch {
    fail(`${path}: canonical href is not a valid URL: ${JSON.stringify(href)}`);
  }
  const expected = new URL(expectedPath, `${canonicalOrigin}/`);
  if (actual.origin !== expected.origin || actual.pathname !== expected.pathname) {
    fail(`${path}: expected canonical ${expected.href}, received ${actual.href}`);
  }
  if (actual.search || actual.hash) {
    fail(`${path}: canonical must not contain query or fragment components`);
  }
}

async function run() {
  if (!/^[0-9a-f]{40}$/.test(approvedSha)) {
    fail("PRODUCTION_SMOKE_APPROVED_SHA must be a full lowercase 40-character Git SHA");
  }

  const target = normalizeTarget(rawTarget);
  const checks = [];

  const home = await get(target, "/");
  expectStatus("/", home.response, 200);
  expectHtml("/", home.response);
  const homeBody = await home.response.text();
  if (!homeBody.includes("<h1")) fail("/: primary h1 not found");
  if (!homeBody.includes("Studiare l&#x27;imprenditoria migrante") && !homeBody.includes("Studiare l’imprenditoria migrante")) {
    fail("/: expected institutional homepage heading not found");
  }
  expectCanonical("/", homeBody, "/");
  expectHeader(home.response, "x-content-type-options", "nosniff");
  expectHeader(home.response, "x-frame-options", "DENY");
  expectHeader(home.response, "strict-transport-security", /max-age=63072000/i);
  expectHeader(home.response, "referrer-policy", "strict-origin-when-cross-origin");
  expectHeader(home.response, "permissions-policy", "camera=(), microphone=(), geolocation=()");
  expectHeaderAbsent(home.response, "x-powered-by");
  expectProductionCsp(home.response);
  checks.push("homepage + canonical + security headers");

  for (const path of ["/chi-siamo", "/privacy", "/cookie", "/termini", "/accedi"]) {
    const page = await get(target, path);
    expectStatus(path, page.response, 200);
    expectHtml(path, page.response);
    checks.push(`${path} GET 200`);
  }

  const contribute = await get(target, "/contribuisci");
  expectStatus("/contribuisci", contribute.response, 200);
  expectHtml("/contribuisci", contribute.response);
  const contributeBody = await contribute.response.text();
  expectCanonical("/contribuisci", contributeBody, "/contribuisci");
  if (!contributeBody.includes("<form")) fail("/contribuisci: contribution form not found");
  checks.push("/contribuisci form + canonical");

  const corePublicPaths = [
    "/osservatorio",
    "/atlante",
    "/storie",
    "/eventi",
    "/fonti",
    "/open-data",
  ];
  for (const path of corePublicPaths) {
    const page = await get(target, path);
    expectStatus(path, page.response, 200);
    expectHtml(path, page.response);
    checks.push(`${path} public surface GET 200`);
  }

  const openData = await get(target, "/api/open-data/indicators");
  expectStatus("/api/open-data/indicators", openData.response, 200);
  const openDataType = openData.response.headers.get("content-type") ?? "";
  if (!openDataType.toLowerCase().includes("application/json")) {
    fail(`/api/open-data/indicators: expected application/json, received ${JSON.stringify(openDataType)}`);
  }
  const openDataPayload = await openData.response.json();
  if (!openDataPayload || typeof openDataPayload !== "object") {
    fail("/api/open-data/indicators: JSON payload is not an object");
  }
  if (typeof openDataPayload.dataset !== "string" || !openDataPayload.dataset.includes("Osservatorio")) {
    fail("/api/open-data/indicators: dataset marker missing");
  }
  if (!Number.isInteger(openDataPayload.record_count) || openDataPayload.record_count < 0) {
    fail("/api/open-data/indicators: record_count must be a non-negative integer");
  }
  if (!openDataPayload.filters || typeof openDataPayload.filters !== "object" || Array.isArray(openDataPayload.filters)) {
    fail("/api/open-data/indicators: filters object missing");
  }
  if (!Array.isArray(openDataPayload.records)) {
    fail("/api/open-data/indicators: records array missing");
  }
  if (openDataPayload.record_count !== openDataPayload.records.length) {
    fail("/api/open-data/indicators: record_count does not match records length");
  }
  checks.push("open-data indicators JSON contract");

  const robots = await get(target, "/robots.txt");
  expectStatus("/robots.txt", robots.response, 200);
  const robotsBody = await robots.response.text();
  if (/^Disallow:\s*\/\s*$/im.test(robotsBody)) {
    fail("/robots.txt: Production target is still globally disallowed for crawlers");
  }
  if (!robotsBody.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
    fail("/robots.txt: canonical sitemap is not advertised");
  }
  if (!robotsBody.includes(`Sitemap: ${canonicalOrigin}/sitemap-contributors.xml`)) {
    fail("/robots.txt: contributor sitemap is not advertised");
  }
  if (!robotsBody.includes("Disallow: /app/")) {
    fail("/robots.txt: private /app/ area is not disallowed");
  }
  checks.push("robots crawlable + both sitemaps advertised + /app private");

  for (const path of ["/sitemap.xml", "/sitemap-contributors.xml"]) {
    const sitemap = await get(target, path);
    expectStatus(path, sitemap.response, 200);
    expectXml(path, sitemap.response);
    const sitemapBody = await sitemap.response.text();
    if (!/<urlset\b/i.test(sitemapBody)) fail(`${path}: sitemap urlset not found`);
    if (path === "/sitemap.xml" && !sitemapBody.includes(canonicalOrigin)) {
      fail(`${path}: canonical origin not found in sitemap`);
    }
    checks.push(`${path} valid XML sitemap`);
  }

  const protectedRoute = await get(target, "/app/redazione");
  if (![307, 308].includes(protectedRoute.response.status)) {
    fail(`/app/redazione: expected auth redirect, received ${protectedRoute.response.status}`);
  }
  const location = protectedRoute.response.headers.get("location") ?? "";
  const redirectUrl = new URL(location, target);
  if (redirectUrl.pathname !== "/accedi") {
    fail(`/app/redazione: unexpected redirect target ${redirectUrl.pathname}`);
  }
  checks.push("protected editorial route redirects to login");

  return {
    ok: true,
    mode: "GET-only",
    target: target.origin,
    approvedSha,
    checkedAt: new Date().toISOString(),
    checks,
    note: "The supplied target URL is operator-selected; this smoke records the approved Git SHA but does not independently query Vercel deployment metadata.",
  };
}

await mkdir("artifacts", { recursive: true });

try {
  const report = await run();
  await writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const report = {
    ok: false,
    mode: "GET-only",
    target: rawTarget,
    approvedSha,
    checkedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  };
  await writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
}
