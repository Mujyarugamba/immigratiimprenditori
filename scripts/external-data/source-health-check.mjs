import assert from "node:assert/strict";
import { lookup } from "node:dns/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import { createClient } from "@supabase/supabase-js";

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 15000;

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function isPrivateIPv4(address) {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
    return true;
  }
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateAddress(address) {
  const normalized = address.toLowerCase().split("%")[0];
  const family = isIP(normalized);
  if (family === 4) return isPrivateIPv4(normalized);
  if (family !== 6) return true;

  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized)
  ) {
    return true;
  }

  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);

  return false;
}

function parsePublicHttpUrl(raw) {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
      return null;
    }
    if (isIP(host) && isPrivateAddress(host)) return null;
    return url;
  } catch {
    return null;
  }
}

async function assertPublicDestination(url) {
  const host = url.hostname;
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error("private destination blocked");
    return;
  }

  const addresses = await lookup(host, { all: true, verbatim: true });
  if (addresses.length === 0) throw new Error("source hostname has no DNS address");
  if (addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("source hostname resolves to a private/reserved address");
  }
}

async function fetchOne(url, method) {
  await assertPublicDestination(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "ImmigratiImprenditori-SourceHealth/1.1",
        ...(method === "GET" ? { Range: "bytes=0-2047" } : {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithSafeRedirects(initialUrl, method) {
  let current = initialUrl;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetchOne(current, method);
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    if (redirectCount === MAX_REDIRECTS) throw new Error("too many redirects");
    const location = response.headers.get("location");
    if (!location) throw new Error(`redirect ${response.status} without Location`);
    const next = parsePublicHttpUrl(new URL(location, current).toString());
    if (!next) throw new Error("unsafe redirect destination blocked");
    current = next;
    if (response.status === 303 && method !== "HEAD") method = "GET";
  }
  throw new Error("redirect loop");
}

async function checkSource(source) {
  const url = parsePublicHttpUrl(source.url);
  if (!url) {
    return {
      ...source,
      status: "invalid_url",
      http_status: null,
      final_url: null,
      checked_at: new Date().toISOString(),
    };
  }

  try {
    let response = await requestWithSafeRedirects(url, "HEAD");
    if ([403, 405, 406].includes(response.status)) {
      response = await requestWithSafeRedirects(url, "GET");
    }
    const ok = response.status >= 200 && response.status < 400;
    return {
      ...source,
      status: ok ? "ok" : "http_error",
      http_status: response.status,
      final_url: response.url,
      checked_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...source,
      status: "network_error",
      http_status: null,
      final_url: null,
      error: error instanceof Error ? error.message : String(error),
      checked_at: new Date().toISOString(),
    };
  }
}

async function main() {
  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: sources, error } = await supabase
    .from("observatory_statistical_sources")
    .select("id, name, producer_name, url, external_identifier, lifecycle_status")
    .neq("lifecycle_status", "withdrawn")
    .not("url", "is", null)
    .order("producer_name");

  if (error) throw new Error(error.message);

  const results = [];
  const queue = [...(sources ?? [])];
  const workers = Array.from({ length: Math.min(4, queue.length || 1) }, async () => {
    while (queue.length > 0) {
      const source = queue.shift();
      if (!source) return;
      results.push(await checkSource(source));
    }
  });
  await Promise.all(workers);
  results.sort((a, b) => a.producer_name.localeCompare(b.producer_name));

  const summary = {
    checked_at: new Date().toISOString(),
    total: results.length,
    ok: results.filter((item) => item.status === "ok").length,
    issues: results.filter((item) => item.status !== "ok").length,
    results,
  };

  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/source-health.json", JSON.stringify(summary, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({ total: summary.total, ok: summary.ok, issues: summary.issues }));
  for (const item of results.filter((row) => row.status !== "ok")) {
    console.warn(`[source-health] ${item.status} ${item.http_status ?? "-"} ${item.name} ${item.url}`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## Observatory source health",
      "",
      `Checked: **${summary.total}** · OK: **${summary.ok}** · Issues: **${summary.issues}**`,
      "",
    ];
    for (const item of results.filter((row) => row.status !== "ok")) {
      lines.push(`- ${item.name}: ${item.status}${item.http_status ? ` (${item.http_status})` : ""}`);
    }
    await writeFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n", { flag: "a" });
  }

  if (summary.issues > 0) process.exitCode = 2;
}

function selfTest() {
  assert.equal(parsePublicHttpUrl("https://example.com/report")?.hostname, "example.com");
  assert.equal(parsePublicHttpUrl("http://127.0.0.1/admin"), null);
  assert.equal(parsePublicHttpUrl("http://10.0.0.1/data"), null);
  assert.equal(parsePublicHttpUrl("http://169.254.169.254/latest/meta-data"), null);
  assert.equal(parsePublicHttpUrl("http://[::1]/admin"), null);
  assert.equal(parsePublicHttpUrl("file:///etc/passwd"), null);
  assert.equal(parsePublicHttpUrl("https://user:pass@example.com/private"), null);
  assert.equal(isPrivateAddress("192.168.1.1"), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
  assert.equal(isPrivateAddress("fc00::1"), true);
  assert.equal(isPrivateAddress("2001:4860:4860::8888"), false);
  console.log("SOURCE_HEALTH_SELF_TEST = PASS");
}

if (process.env.SOURCE_HEALTH_SELF_TEST === "1") {
  selfTest();
} else {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
}
