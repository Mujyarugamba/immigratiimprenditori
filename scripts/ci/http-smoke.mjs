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

function extractInternalAnchors(sourcePath, body) {
  const links = new Map();
  const matcher = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi;
  for (const match of body.matchAll(matcher)) {
    const rawHref = (match[1] ?? match[2] ?? "").replaceAll("&amp;", "&").trim();
    if (!rawHref || rawHref.startsWith("#")) continue;
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(rawHref)) continue;

    let url;
    try {
      url = new URL(rawHref, `${ORIGIN}${sourcePath}`);
    } catch {
      fail(`${sourcePath}: invalid anchor href ${JSON.stringify(rawHref)}`);
    }
    if (url.origin !== ORIGIN) continue;
    url.hash = "";
    links.set(`${url.pathname}${url.search}`, { sourcePath, rawHref });
  }
  return links;
}

async function checkInternalLink(path, sourcePath, rawHref) {
  const response = await fetch(`${ORIGIN}${path}`, { redirect: "manual" });
  if (response.status >= 200 && response.status < 300) return;

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) fail(`${sourcePath}: ${rawHref} redirects without Location`);
    const target = new URL(location, `${ORIGIN}${path}`);
    if (target.origin !== ORIGIN) {
      fail(`${sourcePath}: internal link ${rawHref} redirects outside the site to ${target.href}`);
    }
    const targetResponse = await fetch(target, { redirect: "manual" });
    if (targetResponse.status >= 200 && targetResponse.status < 300) return;
    fail(`${sourcePath}: ${rawHref} -> ${target.pathname} returned HTTP ${targetResponse.status}`);
  }

  fail(`${sourcePath}: internal link ${rawHref} returned HTTP ${response.status}`);
}

async function checkInternalLinkIntegrity(surfaces) {
  const links = new Map();
  for (const { path, body } of surfaces) {
    for (const [target, context] of extractInternalAnchors(path, body)) {
      if (!links.has(target)) links.set(target, context);
    }
  }

  const queue = [...links.entries()];
  const workers = Array.from({ length: Math.min(6, queue.length || 1) }, async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) return;
      const [target, context] = entry;
      await checkInternalLink(target, context.sourcePath, context.rawHref);
    }
  });
  await Promise.all(workers);
  return links.size;
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
    expectHeader(home.response, "strict-transport-security", /max-age=63072000/i);
    expectHeader(home.response, "content-security-policy", /default-src 'self'/i);
    expectHeader(home.response, "referrer-policy", "strict-origin-when-cross-origin");

    const english = await expectText("/en", ['<html lang="en" dir="ltr"', 'data-platform-locale="en"']);
    const arabic = await expectText("/ar", ['<html lang="ar" dir="rtl"', 'data-platform-locale="ar"']);

    const about = await expectText("/chi-siamo", ["Chi siamo", "Trasparenza istituzionale"]);
    const support = await expectText("/sostieni", ["Sostieni l&#x27;Osservatorio", "Pagamenti online non ancora attivati"]);

    const checkedInternalLinks = await checkInternalLinkIntegrity([
      { path: "/", body: home.body },
      { path: "/en", body: english.body },
      { path: "/ar", body: arabic.body },
      { path: "/chi-siamo", body: about.body },
      { path: "/sostieni", body: support.body },
    ]);
    if (checkedInternalLinks < 8) {
      fail(`internal link integrity: expected at least 8 unique public links, checked ${checkedInternalLinks}`);
    }

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
        "localized document lang/dir",
        `internal link integrity (${checkedInternalLinks} unique public links)`,
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
