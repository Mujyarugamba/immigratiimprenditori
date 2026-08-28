import { spawn } from "node:child_process";
import process from "node:process";

const PORT = 3100;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const TIMEOUT_MS = 30_000;
const PREVIEW_READ_ONLY = process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY === "true";

function fail(message) {
  throw new Error(message);
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < TIMEOUT_MS) {
    try {
      const response = await fetch(`${ORIGIN}/robots.txt`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail(`Next server did not become ready within ${TIMEOUT_MS}ms`);
}

async function expectStatus(path, expected) {
  const response = await fetch(`${ORIGIN}${path}`, { redirect: "manual" });
  if (response.status !== expected) {
    fail(`${path}: expected HTTP ${expected}, received ${response.status}`);
  }
  return response;
}

async function expectText(path, snippets) {
  const response = await expectStatus(path, 200);
  const body = await response.text();
  for (const snippet of snippets) {
    if (!body.includes(snippet)) fail(`${path}: missing expected text ${JSON.stringify(snippet)}`);
  }
  return { response, body };
}

function expectHeader(response, header, expected) {
  const actual = response.headers.get(header) ?? "";
  if (expected instanceof RegExp) {
    if (!expected.test(actual)) fail(`${header}: unexpected value ${JSON.stringify(actual)}`);
    return;
  }
  if (actual !== expected) fail(`${header}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

function expectHeaderAbsent(response, header) {
  const actual = response.headers.get(header);
  if (actual !== null) fail(`${header}: expected header to be absent, received ${JSON.stringify(actual)}`);
}

function expectedSupabaseConnectDirective() {
  if (PREVIEW_READ_ONLY) return "connect-src 'self'";

  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";
  const httpUrl = new URL(raw);
  const websocketUrl = new URL(httpUrl.origin);
  websocketUrl.protocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
  return `connect-src 'self' ${httpUrl.origin} ${websocketUrl.origin}`;
}

function expectCsp(response) {
  const csp = response.headers.get("content-security-policy") ?? "";
  const requiredDirectives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    expectedSupabaseConnectDirective(),
    "upgrade-insecure-requests",
  ];

  for (const directive of requiredDirectives) {
    if (!csp.includes(directive)) {
      fail(`content-security-policy: missing directive ${JSON.stringify(directive)} in ${JSON.stringify(csp)}`);
    }
  }
  if (csp.includes("https://*.supabase.co") || csp.includes("wss://*.supabase.co")) {
    fail("content-security-policy: wildcard Supabase connect origins must not be enabled");
  }
  if (PREVIEW_READ_ONLY && /connect-src[^;]*supabase/i.test(csp)) {
    fail("content-security-policy: read-only preview browser must not connect directly to Supabase");
  }
  if (csp.includes("'unsafe-eval'")) {
    fail("content-security-policy: unsafe-eval must not be enabled");
  }
}

async function expectPreviewMutationBlocked(path) {
  const response = await fetch(`${ORIGIN}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (response.status !== 405) {
    fail(`${path}: read-only preview expected HTTP 405 for POST, received ${response.status}`);
  }
  expectHeader(response, "x-preview-read-only", "true");
  expectHeader(response, "allow", "GET, HEAD, OPTIONS");
  expectHeader(response, "cache-control", "no-store");
}

async function expectNormalMutationPathNotFirewalled() {
  const response = await fetch(`${ORIGIN}/api/analytics/page-view`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (response.status === 405 || response.headers.has("x-preview-read-only")) {
    fail("normal build: analytics POST was incorrectly intercepted by preview read-only firewall");
  }
}

async function main() {
  const runtimeEnv = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "ci-placeholder-key",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://preview.example.invalid",
  };

  // Netlify config-file variables configure the build but are not guaranteed to
  // exist in Function/Edge runtime. In preview-mode CI, deliberately remove the
  // flag before `next start`: the mutation firewall must survive because the
  // NEXT_PUBLIC flag was inlined into the candidate during `next build`.
  if (PREVIEW_READ_ONLY) delete runtimeEnv.NEXT_PUBLIC_PREVIEW_READ_ONLY;

  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: runtimeEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let logs = "";
  server.stdout.on("data", (chunk) => { logs += chunk.toString(); });
  server.stderr.on("data", (chunk) => { logs += chunk.toString(); });

  try {
    await waitForServer();

    const home = await expectText("/", [
      '<html lang="it"',
      'id="contenuto"',
      "Studiare l&#x27;imprenditoria migrante",
      "Contribuisci al Centro Studi",
    ]);
    if (!home.body.includes("<h1")) fail("/: missing primary h1");
    expectHeader(home.response, "x-content-type-options", "nosniff");
    expectHeader(home.response, "x-frame-options", "DENY");
    expectHeader(home.response, "strict-transport-security", /max-age=63072000;\s*includeSubDomains/i);
    expectHeader(home.response, "referrer-policy", "strict-origin-when-cross-origin");
    expectHeader(home.response, "permissions-policy", "camera=(), microphone=(), geolocation=()");
    expectHeaderAbsent(home.response, "x-powered-by");
    expectCsp(home.response);
    if (PREVIEW_READ_ONLY) {
      expectHeader(home.response, "x-robots-tag", "noindex, nofollow, noarchive");
    } else {
      expectHeaderAbsent(home.response, "x-robots-tag");
    }

    if (PREVIEW_READ_ONLY) {
      await expectPreviewMutationBlocked("/contribuisci");
      await expectPreviewMutationBlocked("/accedi");
      await expectPreviewMutationBlocked("/api/analytics/page-view");
    } else {
      await expectNormalMutationPathNotFirewalled();
    }

    await expectText("/en", ['<html lang="en" dir="ltr"', 'data-platform-locale="en"']);
    await expectText("/ar", ['<html lang="ar" dir="rtl"', 'data-platform-locale="ar"']);

    await expectText("/chi-siamo", ["Chi siamo", "Trasparenza istituzionale"]);
    await expectText("/sostieni", ["Sostieni l&#x27;Osservatorio", "Pagamenti online non ancora attivati"]);

    const robots = await expectText(
      "/robots.txt",
      PREVIEW_READ_ONLY
        ? ["Disallow: /"]
        : [
            "Sitemap: https://immigratiimprenditori.it/sitemap.xml",
            "Sitemap: https://immigratiimprenditori.it/sitemap-contributors.xml",
            "Disallow: /app/",
          ],
    );
    if (!robots.response.headers.get("content-type")?.includes("text/plain")) {
      fail("/robots.txt: unexpected Content-Type");
    }
    if (PREVIEW_READ_ONLY && robots.body.includes("Sitemap:")) {
      fail("/robots.txt: read-only preview must not advertise production sitemaps");
    }

    const sitemap = await expectText("/sitemap.xml", [
      "https://immigratiimprenditori.it/osservatorio",
      "https://immigratiimprenditori.it/atlante",
    ]);
    if (!sitemap.response.headers.get("content-type")?.includes("xml")) {
      fail("/sitemap.xml: expected XML Content-Type");
    }

    const contributorSitemap = await expectText("/sitemap-contributors.xml", [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]);
    if (!contributorSitemap.response.headers.get("content-type")?.includes("xml")) {
      fail("/sitemap-contributors.xml: expected XML Content-Type");
    }

    const legacyRoutes = await fetch(`${ORIGIN}/rotte`, { redirect: "manual" });
    if (![307, 308].includes(legacyRoutes.status)) {
      fail(`/rotte: expected permanent/temporary redirect, received ${legacyRoutes.status}`);
    }
    const location = legacyRoutes.headers.get("location") ?? "";
    if (!location.endsWith("/atlante/rotte")) {
      fail(`/rotte: unexpected redirect location ${location}`);
    }

    const protectedLaunch = await fetch(`${ORIGIN}/app/redazione/lancio`, {
      redirect: "manual",
    });
    if (![307, 308].includes(protectedLaunch.status)) {
      fail(`/app/redazione/lancio: expected auth redirect, received ${protectedLaunch.status}`);
    }
    const protectedLaunchLocation = protectedLaunch.headers.get("location") ?? "";
    if (!protectedLaunchLocation.includes("/accedi")) {
      fail(`/app/redazione/lancio: unexpected auth redirect ${protectedLaunchLocation}`);
    }

    console.log(JSON.stringify({
      ok: true,
      previewReadOnly: PREVIEW_READ_ONLY,
      checks: [
        "home",
        "security response headers",
        PREVIEW_READ_ONLY
          ? "strict CSP with browser Supabase connections disabled"
          : "strict CSP directives, exact Supabase connect origin and unsafe-eval exclusion",
        PREVIEW_READ_ONLY
          ? "preview mutation firewall for contribution, login and analytics POST"
          : "normal mutation path is not intercepted by preview firewall",
        PREVIEW_READ_ONLY
          ? "read-only robots noindex without advertised sitemaps"
          : "production robots with advertised sitemaps",
        "framework fingerprint header disabled",
        "localized document lang/dir",
        "institutional transparency",
        "support fail-closed state",
        "primary sitemap route",
        "contributor sitemap route",
        "legacy route canonical redirect",
        "protected number-zero editorial dashboard",
      ],
    }, null, 2));
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 2_000);
      server.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
    if (server.exitCode && server.exitCode !== 0) {
      console.error(logs);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
