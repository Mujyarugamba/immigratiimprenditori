import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";

const rawTarget = process.env.PRODUCTION_SMOKE_TARGET ?? "";
const approvedSha = process.env.PRODUCTION_SMOKE_APPROVED_SHA ?? "";
const artifactPath = "artifacts/production-remote-smoke.json";

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
  const allowed = allowedExactHosts.has(host) || host.endsWith(".vercel.app");
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
      accept: "text/html,text/plain,application/xml;q=0.9,*/*;q=0.1",
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

async function run() {
  if (!/^[0-9a-f]{40}$/.test(approvedSha)) {
    fail("PRODUCTION_SMOKE_APPROVED_SHA must be a full lowercase 40-character Git SHA");
  }

  const target = normalizeTarget(rawTarget);
  const checks = [];

  const home = await get(target, "/");
  expectStatus("/", home.response, 200);
  const homeBody = await home.response.text();
  if (!homeBody.includes("<h1")) fail("/: primary h1 not found");
  if (!homeBody.includes("Studiare l&#x27;imprenditoria migrante") && !homeBody.includes("Studiare l’imprenditoria migrante")) {
    fail("/: expected institutional homepage heading not found");
  }
  expectHeader(home.response, "x-content-type-options", "nosniff");
  expectHeader(home.response, "x-frame-options", "DENY");
  expectHeader(home.response, "strict-transport-security", /max-age=63072000/i);
  expectHeader(home.response, "referrer-policy", "strict-origin-when-cross-origin");
  expectHeader(home.response, "permissions-policy", "camera=(), microphone=(), geolocation=()");
  expectHeaderAbsent(home.response, "x-powered-by");
  expectProductionCsp(home.response);
  checks.push("homepage + security headers");

  for (const path of ["/chi-siamo", "/privacy", "/cookie", "/termini", "/accedi"]) {
    const page = await get(target, path);
    expectStatus(path, page.response, 200);
    checks.push(`${path} GET 200`);
  }

  const robots = await get(target, "/robots.txt");
  expectStatus("/robots.txt", robots.response, 200);
  const robotsBody = await robots.response.text();
  if (/^Disallow:\s*\/\s*$/im.test(robotsBody)) {
    fail("/robots.txt: Production target is still globally disallowed for crawlers");
  }
  if (!robotsBody.includes("Sitemap: https://immigratiimprenditori.it/sitemap.xml")) {
    fail("/robots.txt: canonical sitemap is not advertised");
  }
  if (!robotsBody.includes("Disallow: /app/")) {
    fail("/robots.txt: private /app/ area is not disallowed");
  }
  checks.push("robots crawlable + /app private");

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
