import { createClient } from "@supabase/supabase-js";

const INDEX_URL = "https://home-affairs.ec.europa.eu/networks/european-migration-network-emn/emn-publications/emn-informs_en";
const HOST = "home-affairs.ec.europa.eu";
const USER_AGENT = "ImmigratiImprenditori-Radar/1.0 (+https://immigratiimprenditori.it)";
const MAX_INSERTS = 10;
const KEYWORDS = [
  "entrepreneur",
  "self-employ",
  "business",
  "labour market",
  "labor market",
  "labour migration",
  "labor migration",
  "foreign talent",
  "foreign talents",
  "employment",
  "skills",
  "integration",
];

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function cleanText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedUrl(raw) {
  try {
    const url = new URL(raw, INDEX_URL);
    if (url.protocol !== "https:" || url.hostname !== HOST) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function isRelevant(title, url) {
  const haystack = `${title} ${url}`.toLowerCase();
  return KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function candidatesFromHtml(html) {
  const rows = [];
  const seen = new Set();
  const anchorRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRe.exec(html)) !== null) {
    const title = cleanText(match[2] ?? "");
    if (title.length < 12 || title.length > 300) continue;
    const originalUrl = normalizedUrl(match[1] ?? "");
    if (!originalUrl || seen.has(originalUrl) || !isRelevant(title, originalUrl)) continue;
    seen.add(originalUrl);
    rows.push({
      source_kind: "radar",
      item_kind: "report",
      title,
      original_url: originalUrl,
      source_label: "European Migration Network (European Commission)",
      relevance_band: "europe_migrant_entrepreneurship",
      priority: "normal",
      status: "new",
      raw_metadata: {
        radar_source_code: "emn-eu",
        radar_index_url: INDEX_URL,
        radar_discovered_at: new Date().toISOString(),
        radar_mode: "metadata_link_only",
        auto_publish: false,
      },
    });
  }
  return rows.slice(0, 30);
}

async function main() {
  const response = await fetch(INDEX_URL, {
    redirect: "follow",
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`EMN: HTTP ${response.status}`);

  const candidates = candidatesFromHtml(await response.text());
  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const urls = candidates.map((item) => item.original_url);
  const known = new Set();
  if (urls.length) {
    const { data, error } = await supabase
      .from("editorial_inbox_items")
      .select("original_url")
      .eq("source_kind", "radar")
      .in("original_url", urls);
    if (error) throw error;
    for (const row of data ?? []) if (row.original_url) known.add(row.original_url);
  }

  const fresh = candidates.filter((item) => !known.has(item.original_url)).slice(0, MAX_INSERTS);
  let inserted = 0;
  if (fresh.length) {
    const { data, error } = await supabase.from("editorial_inbox_items").insert(fresh).select("id");
    if (error) throw error;
    inserted = data?.length ?? fresh.length;
  }

  console.log(JSON.stringify({ source: "emn-eu", mode: "review_only", autoPublish: false, discovered: candidates.length, alreadyKnown: known.size, inserted }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
