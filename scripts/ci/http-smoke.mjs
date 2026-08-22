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

    console.log(JSON.stringify({
      ok: true,
      checks: [
        "home",
        "institutional transparency",
        "support fail-closed state",
        "robots",
        "primary sitemap",
        "contributor sitemap",
        "legacy route canonical redirect",
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
