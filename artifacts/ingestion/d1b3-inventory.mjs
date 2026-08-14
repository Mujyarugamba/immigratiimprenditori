/**
 * D1-B.3 — read-only inventory of Production Incentivi.gov pilot rows.
 * Loads service_role via supabase CLI (never prints secrets).
 *
 *   node artifacts/ingestion/d1b3-inventory.mjs
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

const REF = "hvfvfatlaspcpszgizhg";

function loadServiceRole() {
  const r = spawnSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", REF, "--reveal", "-o", "json"],
    { encoding: "utf8", shell: true },
  );
  if (r.status !== 0) {
    throw new Error(`api-keys failed: ${r.stderr || r.stdout}`);
  }
  const keys = JSON.parse(r.stdout);
  const svc = keys.find((k) => k.name === "service_role" && k.api_key);
  if (!svc?.api_key) throw new Error("service_role key not found");
  return svc.api_key;
}

function deriveTemporalLabel({ opensAt, closesAt, openEnded, now = new Date() }) {
  const t = now.getTime();
  if (openEnded || (opensAt == null && closesAt == null)) {
    return openEnded ? "open_ended" : "unknown";
  }
  if (closesAt) {
    const close = Date.parse(closesAt);
    if (!Number.isNaN(close) && close < t) return "expired";
    if (!Number.isNaN(close) && close - t <= 14 * 24 * 60 * 60 * 1000) return "expiring";
  }
  if (opensAt) {
    const open = Date.parse(opensAt);
    if (!Number.isNaN(open) && open > t) return "scheduled";
  }
  return "open";
}

const sb = createClient(`https://${REF}.supabase.co`, loadServiceRole(), {
  auth: { persistSession: false },
});

const { data: sources, error } = await sb
  .from("opportunity_sources")
  .select(
    `
    id, external_identifier, url, authority, consulted_at, version, reference_text, status, is_primary,
    opportunities!inner(
      id, title, summary, description, purpose, origin,
      editorial_status, publication_status, visibility_level, substantial_status,
      platform_published_at, deleted_at, updated_at,
      opportunity_time_windows(opens_at, closes_at, open_ended, superseded_at, kind),
      opportunity_market_references(territory_label)
    )
  `,
  )
  .eq("status", "active")
  .like("external_identifier", "incentivi-gov:%")
  .order("external_identifier");

if (error) throw error;

const rows = (sources ?? []).map((s) => {
  const o = s.opportunities;
  const windows = (o.opportunity_time_windows ?? []).filter(
    (w) => w.kind === "access" && w.superseded_at == null,
  );
  const w = windows[0] ?? o.opportunity_time_windows?.[0] ?? null;
  const opensAt = w?.opens_at ?? null;
  const closesAt = w?.closes_at ?? null;
  const openEnded = Boolean(w?.open_ended);
  const territories = (o.opportunity_market_references ?? [])
    .map((t) => t.territory_label)
    .filter(Boolean);
  const temporal = deriveTemporalLabel({ opensAt, closesAt, openEnded });
  const reviewOnly =
    o.editorial_status === "in_review" &&
    o.publication_status === "unpublished" &&
    o.visibility_level === "private";
  return {
    id: o.id,
    externalId: s.external_identifier,
    title: o.title,
    summary: o.summary,
    description: o.description,
    purpose: o.purpose,
    issuer: s.authority,
    territory: territories.join(", ") || null,
    territoryCount: territories.length,
    opensAt,
    closesAt,
    openEnded,
    sourceStatus: o.substantial_status,
    temporal,
    officialUrl: s.url,
    retrievedAt: s.consulted_at,
    sourceUpdatedAt:
      s.version && s.version !== "source_updated_at_unavailable" ? s.version : null,
    editorialStatus: o.editorial_status,
    publicationStatus: o.publication_status,
    visibility: o.visibility_level,
    origin: o.origin,
    publishedAt: o.platform_published_at,
    deletedAt: o.deleted_at,
    reviewOnly,
    hasHttpUrl: String(s.url || "").startsWith("http"),
    provenanceLen: String(s.reference_text || "").length,
    summaryShaMatch: (() => {
      const m = /source_summary_sha=([a-f0-9]{64})/i.exec(s.reference_text || "");
      if (!m) return null;
      const cur = createHash("sha256")
        .update(o.summary ?? "", "utf8")
        .digest("hex");
      return m[1] === cur;
    })(),
  };
});

const published = rows.filter((r) => r.publicationStatus === "published");
const reviewOnly = rows.filter((r) => r.reviewOnly);
const expired = rows.filter((r) => r.temporal === "expired");

const out = {
  total: rows.length,
  uniqueKeys: new Set(rows.map((r) => r.externalId)).size,
  reviewOnly: reviewOnly.length,
  published: published.length,
  expired: expired.length,
  missingUrl: rows.filter((r) => !r.hasHttpUrl).length,
  deleted: rows.filter((r) => r.deletedAt).length,
  rows: rows.sort((a, b) => a.externalId.localeCompare(b.externalId)),
};

writeFileSync(
  "artifacts/ingestion/d1b3-inventory-out.json",
  JSON.stringify(out, null, 2),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      total: out.total,
      uniqueKeys: out.uniqueKeys,
      reviewOnly: out.reviewOnly,
      published: out.published,
      expired: out.expired,
      missingUrl: out.missingUrl,
      deleted: out.deleted,
      titles: out.rows.map((r) => ({
        externalId: r.externalId,
        id: r.id,
        title: r.title,
        issuer: r.issuer,
        temporal: r.temporal,
        closesAt: r.closesAt,
        openEnded: r.openEnded,
        reviewOnly: r.reviewOnly,
        publicationStatus: r.publicationStatus,
        editorialStatus: r.editorialStatus,
        url: r.officialUrl,
        territoryCount: r.territoryCount,
        retrievedAt: r.retrievedAt,
      })),
    },
    null,
    2,
  ),
);
