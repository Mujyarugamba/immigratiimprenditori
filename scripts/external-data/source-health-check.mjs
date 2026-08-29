import assert from "node:assert/strict";
import { lookup } from "node:dns/promises";
import { mkdir, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { createClient } from "@supabase/supabase-js";

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 15000;
const BOT_RESTRICTED_HOSTS = new Set(["www.oecd.org"]);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function normalizedHostname(url) {
  return url.hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

function isPrivateIPv4(address) {
  const octets = address.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
  ) {
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
  const normalized = address.toLowerCase().split("%")[0].replace(/^\[/, "").replace(/\]$/, "");
  const family = isIP(normalized);
  if (family === 4) return isPrivateIPv4(normalized);
  if (family !== 6) return true;

  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith("2001:db8:") ||
    normalized.startsWith("::ffff:")
  ) {
    return true;
  }

  return false;
}

function parsePublicHttpUrl(raw) {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    const host = normalizedHostname(url);
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
      return null;
    }
    if (isIP(host) && isPrivateAddress(host)) return null;
    return url;
  } catch {
    return null;
  }
}

function classifyHttpResponse(rawUrl, status) {
  if (status >= 200 && status < 400) return "ok";
  try {
    const host = normalizedHostname(new URL(rawUrl));
    // OECD currently returns 403 to GitHub-hosted automated probes while the
    // public article remains browser-accessible. Keep that visible as a warning
    // instead of misclassifying the source as broken. Other 403s still fail.
    if (status === 403 && BOT_RESTRICTED_HOSTS.has(host)) return "access_restricted";
  } catch {
    // Invalid URLs are handled before network requests; fall through safely.
  }
  return "http_error";
}

async function resolvePublicDestination(url) {
  const host = normalizedHostname(url);
  const literalFamily = isIP(host);
  if (literalFamily) {
    if (isPrivateAddress(host)) throw new Error("private destination blocked");
    return { address: host, family: literalFamily };
  }

  const addresses = await lookup(host, { all: true, verbatim: true });
  if (addresses.length === 0) throw new Error("source hostname has no DNS address");
  if (addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("source hostname resolves to a private/reserved address");
  }

  // Pin one address from the set that was actually validated. The HTTP client
  // receives this address through a custom lookup callback, preventing a second
  // DNS resolution between validation and connection (DNS-rebinding/TOCTOU).
  return addresses[0];
}

function pinnedLookup(resolved) {
  return (_hostname, options, callback) => {
    if (options?.all) {
      callback(null, [{ address: resolved.address, family: resolved.family }]);
      return;
    }
    callback(null, resolved.address, resolved.family);
  };
}

async function requestOne(url, method) {
  const resolved = await resolvePublicDestination(url);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      url,
      {
        method,
        agent: false,
        lookup: pinnedLookup(resolved),
        headers: {
          "User-Agent": "ImmigratiImprenditori-SourceHealth/1.2",
          ...(method === "GET" ? { Range: "bytes=0-2047" } : {}),
        },
      },
      (response) => {
        const remoteAddress = response.socket.remoteAddress;
        if (!remoteAddress || isPrivateAddress(remoteAddress)) {
          response.destroy();
          reject(new Error("private/reserved connected address blocked"));
          return;
        }

        const location = Array.isArray(response.headers.location)
          ? response.headers.location[0]
          : response.headers.location;
        const status = response.statusCode ?? 0;

        // We only need headers/status. Do not download a large body when a
        // server ignores Range on the GET fallback.
        response.on("error", () => {});
        response.destroy();
        resolve({ status, location, url: url.toString() });
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error("source request timed out"));
    });
    request.once("error", reject);
    request.end();
  });
}

async function requestWithSafeRedirects(initialUrl, method) {
  let current = initialUrl;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await requestOne(current, method);
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    if (redirectCount === MAX_REDIRECTS) throw new Error("too many redirects");
    const location = response.location;
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
    return {
      ...source,
      status: classifyHttpResponse(response.url, response.status),
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
  // The source registry exposes active rows through anon SELECT + RLS. This
  // external read-only checker therefore uses the public publishable key and
  // must never receive a privileged service-role credential.
  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: sources, error } = await supabase
    .from("observatory_statistical_sources")
    .select("id, name, producer_name, url, external_identifier, lifecycle_status")
    .eq("lifecycle_status", "active")
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
    warnings: results.filter((item) => item.status === "access_restricted").length,
    issues: results.filter(
      (item) => item.status !== "ok" && item.status !== "access_restricted",
    ).length,
    results,
  };

  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/source-health.json", JSON.stringify(summary, null, 2) + "\n", "utf8");

  console.log(
    JSON.stringify({
      total: summary.total,
      ok: summary.ok,
      warnings: summary.warnings,
      issues: summary.issues,
    }),
  );
  for (const item of results.filter((row) => row.status !== "ok")) {
    console.warn(`[source-health] ${item.status} ${item.http_status ?? "-"} ${item.name} ${item.url}`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## Observatory source health",
      "",
      `Checked: **${summary.total}** · OK: **${summary.ok}** · Warnings: **${summary.warnings}** · Issues: **${summary.issues}**`,
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
  assert.equal(parsePublicHttpUrl("http://[::ffff:7f00:1]/admin"), null);
  assert.equal(parsePublicHttpUrl("file:///etc/passwd"), null);
  assert.equal(parsePublicHttpUrl("https://user:pass@example.com/private"), null);
  assert.equal(isPrivateAddress("192.168.1.1"), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
  assert.equal(isPrivateAddress("fc00::1"), true);
  assert.equal(isPrivateAddress("2001:db8::1"), true);
  assert.equal(isPrivateAddress("2001:4860:4860::8888"), false);
  assert.equal(classifyHttpResponse("https://example.com/report", 200), "ok");
  assert.equal(classifyHttpResponse("https://www.oecd.org/report", 403), "access_restricted");
  assert.equal(classifyHttpResponse("https://example.com/report", 403), "http_error");
  assert.equal(classifyHttpResponse("https://example.com/report", 404), "http_error");

  const pinned = pinnedLookup({ address: "8.8.8.8", family: 4 });
  pinned("example.com", {}, (error, address, family) => {
    assert.equal(error, null);
    assert.equal(address, "8.8.8.8");
    assert.equal(family, 4);
  });
  pinned("example.com", { all: true }, (error, addresses) => {
    assert.equal(error, null);
    assert.deepEqual(addresses, [{ address: "8.8.8.8", family: 4 }]);
  });

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
