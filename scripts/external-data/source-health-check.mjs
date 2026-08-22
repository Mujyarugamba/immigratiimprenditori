import { mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isPrivateHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host.endsWith(".local")) return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
  const match = host.match(/^172\.(\d+)\./);
  if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return true;
  return false;
}

function safeUrl(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (isPrivateHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function requestWithTimeout(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "ImmigratiImprenditori-SourceHealth/1.0",
        ...(method === "GET" ? { Range: "bytes=0-2047" } : {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkSource(source) {
  const url = safeUrl(source.url);
  if (!url) {
    return { ...source, status: "invalid_url", http_status: null, final_url: null, checked_at: new Date().toISOString() };
  }

  try {
    let response = await requestWithTimeout(url, "HEAD");
    if ([403, 405, 406].includes(response.status)) {
      response = await requestWithTimeout(url, "GET");
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
