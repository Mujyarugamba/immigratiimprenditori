import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const MAX_INSERTS_PER_RUN = 30;
const RECENT_FINGERPRINT_WINDOW = 1000;
const USER_AGENT = "ImmigratiImprenditori-Radar/1.1 (+https://immigratiimprenditori.it)";
const TIMEOUT_MS = 20000;

const KEYWORDS = [
  "immigraz",
  "immigrant",
  "immigré",
  "migrant",
  "migration",
  "stranier",
  "foreign entrepreneur",
  "migrant entrepreneur",
  "entrepreneurship",
  "entrepreneur",
  "imprenditor",
  "self-employ",
  "self employ",
  "diaspora",
  "business owner",
  "business ownership",
];

const STRONG_SIGNALS = [
  "foreign entrepreneur",
  "migrant entrepreneur",
  "immigrant entrepreneur",
  "diaspora entrepreneur",
  "imprenditoria immigrata",
  "imprenditoria straniera",
  "imprese straniere",
  "foreign-owned business",
  "migrant-owned business",
];

const DOCUMENT_SIGNALS = [
  "dataset",
  "open data",
  "statistics",
  "statistical",
  "report",
  "rapporto",
  "study",
  "studio",
  "research",
  "ricerca",
  "working paper",
  "policy",
  "regulation",
  "law",
  "legge",
  "event",
  "conference",
  "convegno",
];

const SOURCES = [
  {
    code: "mlps",
    sourceLabel: "Ministero del Lavoro e delle Politiche Sociali",
    indexUrl: "https://www.lavoro.gov.it/documenti-e-norme/studi-e-statistiche",
    allowedHosts: ["lavoro.gov.it", "www.lavoro.gov.it"],
    relevanceBand: "italy",
    defaultKind: "report",
  },
  {
    code: "unioncamere-open-data",
    sourceLabel: "Open Government Unioncamere",
    indexUrl: "https://opengovernment.unioncamere.gov.it/dataset",
    allowedHosts: ["opengovernment.unioncamere.gov.it"],
    relevanceBand: "italy",
    defaultKind: "dataset",
  },
  {
    code: "unioncamere",
    sourceLabel: "Unioncamere",
    indexUrl: "https://www.unioncamere.gov.it/",
    allowedHosts: ["unioncamere.gov.it", "www.unioncamere.gov.it"],
    relevanceBand: "italy",
    defaultKind: "news",
  },
  {
    code: "eurostat",
    sourceLabel: "Eurostat",
    indexUrl: "https://ec.europa.eu/eurostat/en/news/news-articles",
    allowedHosts: ["ec.europa.eu"],
    relevanceBand: "europe_migrant_entrepreneurship",
    defaultKind: "statistical_release",
  },
  {
    code: "ismu",
    sourceLabel: "Fondazione ISMU ETS",
    indexUrl: "https://www.ismu.org/pubblicazioni/",
    allowedHosts: ["ismu.org", "www.ismu.org"],
    relevanceBand: "italy",
    defaultKind: "report",
  },
  {
    code: "oecd",
    sourceLabel: "OECD",
    indexUrl: "https://www.oecd.org/en/topics/sub-issues/international-migration.html",
    allowedHosts: ["oecd.org", "www.oecd.org"],
    relevanceBand: "rest_of_world",
    defaultKind: "report",
  },
];

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function textOnly(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, " "))
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

function titleFingerprint(sourceLabel, title) {
  return createHash("sha256")
    .update(`${normalizedText(sourceLabel)}|${normalizedText(title)}`)
    .digest("hex")
    .slice(0, 24);
}

function relevanceScore(title, url) {
  const haystack = `${title} ${url}`.toLowerCase();
  let score = 0;

  const strongMatches = STRONG_SIGNALS.filter((signal) => haystack.includes(signal));
  score += strongMatches.length * 35;

  const keywordMatches = KEYWORDS.filter((keyword) => haystack.includes(keyword));
  score += Math.min(keywordMatches.length, 5) * 10;

  const documentMatches = DOCUMENT_SIGNALS.filter((signal) => haystack.includes(signal));
  score += Math.min(documentMatches.length, 3) * 4;

  if (/entrepreneur|imprenditor|self[- ]?employ|business owner/.test(haystack)) score += 12;
  if (/migrant|migration|immigrant|immigraz|stranier|diaspora|foreign/.test(haystack)) score += 12;

  return Math.min(score, 100);
}

function priorityForScore(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "normal";
  return "low";
}

function relevant(title, url) {
  return relevanceScore(title, url) >= 20;
}

function classify(title, url, fallback) {
  const haystack = `${title} ${url}`.toLowerCase();
  if (/dataset|open[ -]?data|statistic|statistics|indicator|dati/.test(haystack)) {
    return "dataset";
  }
  if (/event|conference|convegno|seminar|webinar/.test(haystack)) {
    return "event";
  }
  if (/law|regulation|normativ|decreto|legge/.test(haystack)) {
    return "law_regulation";
  }
  if (/policy|politic[ah] pubblic/.test(haystack)) {
    return "policy";
  }
  if (/paper|academic|journal|working paper/.test(haystack)) {
    return "academic_paper";
  }
  if (/report|rapporto|study|studio|research|ricerca|publication|pubblicazione/.test(haystack)) {
    return "report";
  }
  return fallback;
}

function normalizeUrl(href, baseUrl, allowedHosts) {
  try {
    const url = new URL(href, baseUrl);
    if (url.protocol !== "https:") return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    if (!allowedHosts.includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractCandidates(html, source) {
  const candidates = [];
  const seen = new Set();
  const anchorRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorRe.exec(html)) !== null) {
    const title = textOnly(match[2] ?? "");
    if (title.length < 8 || title.length > 280) continue;
    const url = normalizeUrl(match[1] ?? "", source.indexUrl, source.allowedHosts);
    if (!url || seen.has(url) || !relevant(title, url)) continue;

    const score = relevanceScore(title, url);
    const fingerprint = titleFingerprint(source.sourceLabel, title);
    seen.add(url);
    candidates.push({
      title,
      original_url: url,
      source_label: source.sourceLabel,
      item_kind: classify(title, url, source.defaultKind),
      relevance_band: source.relevanceBand,
      priority: priorityForScore(score),
      status: "new",
      raw_metadata: {
        radar_source_code: source.code,
        radar_index_url: source.indexUrl,
        radar_discovered_at: new Date().toISOString(),
        radar_mode: "metadata_link_only",
        radar_relevance_score: score,
        radar_title_fingerprint: fingerprint,
        radar_version: "1.1",
        auto_publish: false,
      },
    });
  }

  return candidates
    .sort(
      (a, b) =>
        b.raw_metadata.radar_relevance_score - a.raw_metadata.radar_relevance_score ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 20);
}

async function fetchIndex(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(source.indexUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) {
      throw new Error(`${source.code}: HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const discovered = [];
  const sourceResults = [];

  for (const source of SOURCES) {
    try {
      const html = await fetchIndex(source);
      const candidates = extractCandidates(html, source);
      discovered.push(...candidates);
      sourceResults.push({
        source: source.code,
        ok: true,
        candidates: candidates.length,
        highPriority: candidates.filter((candidate) => candidate.priority === "high").length,
      });
    } catch (error) {
      sourceResults.push({
        source: source.code,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const byUrl = new Map();
  for (const candidate of discovered) {
    const existing = byUrl.get(candidate.original_url);
    if (
      !existing ||
      candidate.raw_metadata.radar_relevance_score > existing.raw_metadata.radar_relevance_score
    ) {
      byUrl.set(candidate.original_url, candidate);
    }
  }
  const unique = [...byUrl.values()];

  const existingUrls = new Set();
  for (let start = 0; start < unique.length; start += 100) {
    const urls = unique.slice(start, start + 100).map((item) => item.original_url);
    if (!urls.length) continue;
    const { data, error } = await supabase
      .from("editorial_inbox_items")
      .select("original_url")
      .eq("source_kind", "radar")
      .in("original_url", urls);
    if (error) throw error;
    for (const row of data ?? []) {
      if (row.original_url) existingUrls.add(row.original_url);
    }
  }

  const { data: recentRadar, error: recentError } = await supabase
    .from("editorial_inbox_items")
    .select("title, source_label, raw_metadata")
    .eq("source_kind", "radar")
    .order("received_at", { ascending: false })
    .limit(RECENT_FINGERPRINT_WINDOW);
  if (recentError) throw recentError;

  const existingFingerprints = new Set();
  for (const row of recentRadar ?? []) {
    const stored = row.raw_metadata?.radar_title_fingerprint;
    if (typeof stored === "string" && stored) {
      existingFingerprints.add(stored);
      continue;
    }
    if (row.title) {
      existingFingerprints.add(titleFingerprint(row.source_label ?? "", row.title));
    }
  }

  const candidateFingerprints = new Set();
  const fresh = unique
    .sort(
      (a, b) =>
        b.raw_metadata.radar_relevance_score - a.raw_metadata.radar_relevance_score ||
        a.title.localeCompare(b.title),
    )
    .filter((item) => {
      if (existingUrls.has(item.original_url)) return false;
      const fingerprint = item.raw_metadata.radar_title_fingerprint;
      if (existingFingerprints.has(fingerprint) || candidateFingerprints.has(fingerprint)) {
        return false;
      }
      candidateFingerprints.add(fingerprint);
      return true;
    })
    .slice(0, MAX_INSERTS_PER_RUN)
    .map((item) => ({ source_kind: "radar", ...item }));

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
        mode: "review_only",
        autoPublish: false,
        radarVersion: "1.1",
        sources: sourceResults,
        discovered: discovered.length,
        uniqueUrls: unique.length,
        alreadyKnownUrls: existingUrls.size,
        recentFingerprints: existingFingerprints.size,
        inserted,
        insertedByPriority: {
          high: fresh.filter((item) => item.priority === "high").length,
          normal: fresh.filter((item) => item.priority === "normal").length,
          low: fresh.filter((item) => item.priority === "low").length,
        },
        maxInserts: MAX_INSERTS_PER_RUN,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
