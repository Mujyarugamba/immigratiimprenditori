import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const INDEX_URL =
  "https://home-affairs.ec.europa.eu/networks/european-migration-network-emn/emn-publications/emn-informs_en";
const HOST = "home-affairs.ec.europa.eu";
const USER_AGENT = "ImmigratiImprenditori-Radar/1.2 (+https://immigratiimprenditori.it)";
const MAX_INSERTS = 10;
const RECENT_FINGERPRINT_WINDOW = 1000;

const STRONG_SIGNALS = [
  "migrant entrepreneur",
  "immigrant entrepreneur",
  "foreign entrepreneur",
  "diaspora entrepreneur",
  "refugee entrepreneur",
  "migrant owned business",
  "immigrant owned business",
  "foreign owned business",
];

const MIGRATION_SIGNALS = [
  "migrant",
  "migration",
  "immigrant",
  "foreign born",
  "diaspora",
  "refugee",
  "third country national",
  "third country nationals",
];

const ENTREPRENEURSHIP_SIGNALS = [
  "entrepreneur",
  "entrepreneurship",
  "self employ",
  "business owner",
  "business ownership",
  "business creation",
  "enterprise creation",
  "startup",
  "start up",
  "microenterprise",
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

function normalizedText(value) {
  return value
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function canonicalTitleFingerprint(title) {
  const normalized = normalizedText(title);
  return normalized.length >= 20 ? digest(normalized) : null;
}

function normalizedUrl(raw) {
  try {
    const url = new URL(raw, INDEX_URL);
    if (url.protocol !== "https:" || url.hostname !== HOST) return null;
    if (
      !url.pathname.startsWith("/networks/european-migration-network-emn/") &&
      !url.pathname.startsWith("/whats-new/publications/")
    ) {
      return null;
    }
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function isRelevant(title, url) {
  const haystack = normalizedText(`${title} ${url}`);
  const strong = STRONG_SIGNALS.some((signal) => haystack.includes(normalizedText(signal)));
  const migration = MIGRATION_SIGNALS.some((signal) => haystack.includes(normalizedText(signal)));
  const entrepreneurship = ENTREPRENEURSHIP_SIGNALS.some((signal) =>
    haystack.includes(normalizedText(signal)),
  );
  return strong || (migration && entrepreneurship);
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
        radar_canonical_title_fingerprint: canonicalTitleFingerprint(title),
        radar_version: "1.2",
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
  const knownUrls = new Set();
  if (urls.length) {
    const { data, error } = await supabase
      .from("editorial_inbox_items")
      .select("original_url")
      .eq("source_kind", "radar")
      .in("original_url", urls);
    if (error) throw error;
    for (const row of data ?? []) if (row.original_url) knownUrls.add(row.original_url);
  }

  const { data: recentRadar, error: recentError } = await supabase
    .from("editorial_inbox_items")
    .select("title, raw_metadata")
    .eq("source_kind", "radar")
    .order("received_at", { ascending: false })
    .limit(RECENT_FINGERPRINT_WINDOW);
  if (recentError) throw recentError;

  const knownFingerprints = new Set();
  for (const row of recentRadar ?? []) {
    const stored = row.raw_metadata?.radar_canonical_title_fingerprint;
    const fingerprint =
      typeof stored === "string" && stored ? stored : canonicalTitleFingerprint(row.title ?? "");
    if (fingerprint) knownFingerprints.add(fingerprint);
  }

  const candidateFingerprints = new Set();
  const fresh = candidates
    .filter((item) => {
      if (knownUrls.has(item.original_url)) return false;
      const fingerprint = item.raw_metadata.radar_canonical_title_fingerprint;
      if (
        fingerprint &&
        (knownFingerprints.has(fingerprint) || candidateFingerprints.has(fingerprint))
      ) {
        return false;
      }
      if (fingerprint) candidateFingerprints.add(fingerprint);
      return true;
    })
    .slice(0, MAX_INSERTS);

  let inserted = 0;
  if (fresh.length) {
    const { data, error } = await supabase
      .from("editorial_inbox_items")
      .insert(fresh)
      .select("id");
    if (error) throw error;
    inserted = data?.length ?? fresh.length;
  }

  console.log(
    JSON.stringify(
      {
        source: "emn-eu",
        mode: "review_only",
        autoPublish: false,
        radarVersion: "1.2",
        discovered: candidates.length,
        alreadyKnownUrls: knownUrls.size,
        knownCanonicalFingerprints: knownFingerprints.size,
        inserted,
      },
      null,
      2,
    ),
  );
}

function selfTest() {
  assert.equal(
    isRelevant("Integration of third-country nationals", INDEX_URL),
    false,
    "generic integration must not enter the entrepreneurship radar",
  );
  assert.equal(
    isRelevant("Labour market integration of migrants", INDEX_URL),
    false,
    "generic migrant employment must not enter without entrepreneurship",
  );
  assert.equal(
    isRelevant("Migrant entrepreneurship in the EU", INDEX_URL),
    true,
    "migrant entrepreneurship must pass",
  );
  assert.equal(
    isRelevant("Self-employment pathways for third-country nationals", INDEX_URL),
    true,
    "migration plus self-employment must pass",
  );
  console.log("RADAR_EMN_SELF_TEST = PASS");
}

if (process.env.RADAR_SELF_TEST === "1") {
  selfTest();
} else {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
