import { spawn } from "node:child_process";
import process from "node:process";

const PORT = 3100;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const TIMEOUT_MS = 30_000;

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
  if (csp.includes("'unsafe-eval'")) {
    fail("content-security-policy: unsafe-eval must not be enabled");
  }
}

async function main() {
  const server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL:
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "ci-placeholder-key",
        NEXT_PUBLIC_SITE_URL:
          process.env.NEXT_PUBLIC_SITE_URL ?? "https://preview.example.invalid",
      },
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

    await expectText("/en", ['<html lang="en" dir="ltr"', 'data-platform-locale="en"']);
    await expectText("/ar", ['<html lang="ar" dir="rtl"', 'data-platform-locale="ar"']);

    await expectText("/chi-siamo", ["Chi siamo", "Trasparenza istituzionale"]);
    await expectText("/sostieni", ["Sostieni l&#x27;Osservatorio", "Pagamenti online non ancora attivati"]);

    const robots = await expectText("/robots.txt", [
      "Sitemap: https://immigratiimprenditori.it/sitemap.xml",
      "Sitemap: https://immigratiimprenditori.it/sitemap-contributors.xml",
      "Disallow: /app/",
    ]);
    if (!robots.response.headers.get("content-type")?.includes("text/plain")) {
      fail("/robots.txt: unexpected Content-Type");
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
      checks: [
        "home",
        "security response headers",
        "strict CSP directives, exact Supabase connect origin and unsafe-eval exclusion",
        "framework fingerprint header disabled",
        "localized document lang/dir",
        "institutional transparency",
        "support fail-closed state",
        "robots",
        "primary sitemap",
        "contributor sitemap",
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
