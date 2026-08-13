/**
 * D1-C.4 — Editorial queue for Mercati internazionali (World Bank M1 resources).
 *
 * Lifecycle mapping (canonical axes on international_market_support_resources):
 *   READY        → verification=confirmed, visibility=public, substantial=active
 *                  (+ parent market editorial_status=published)
 *   QUESTIONABLE → verification=in_review, visibility=editorial (stay unpublished)
 *   REJECT       → verification=rejected, visibility=editorial (non-public)
 *
 * No parallel CMS. Importer refresh must not overwrite these axes.
 */

import { createClient } from "@/lib/supabase/server";
import {
  WB_INDICATOR_CATALOG,
  type WbIndicatorCode,
} from "@/lib/external-data/worldbank/indicators";
import { parseNaturalKey } from "@/lib/external-data/worldbank/apply-indicators";
import { mapPostgresError, type AppError } from "@/lib/errors/app-error";

const LIST_PAGE_SIZE = 50;

export type EditorialMarketResourceListItem = {
  id: string;
  name: string;
  summary: string | null;
  website_url: string | null;
  verification_status: string;
  visibility_status: string;
  substantial_status: string;
  updated_at: string;
  countryLabel: string;
  countryRef: string;
  marketCode: string;
  marketName: string;
  marketEditorialStatus: string;
  indicatorCode: string | null;
  indicatorLabel: string;
  periodYear: string | null;
  valueDisplay: string;
  unit: string | null;
  naturalKey: string | null;
  sourceLabel: string;
  editorialClass: "review" | "published" | "questionable" | "rejected";
};

export type EditorialMarketResourceDetail = EditorialMarketResourceListItem & {
  definition: string | null;
  contact_note: string | null;
  territorial_scope_note: string | null;
  resource_kind: string;
  marketId: string;
};

function firstMatch(re: RegExp, text: string | null | undefined): string | null {
  if (!text) return null;
  const m = re.exec(text);
  return m?.[1] ?? null;
}

function parseYearFromNaturalKey(nk: string | null): string | null {
  if (!nk) return null;
  const parts = nk.split(":");
  return parts[3] ?? null;
}

function parseIndicatorFromNaturalKey(nk: string | null): string | null {
  if (!nk) return null;
  const parts = nk.split(":");
  return parts[1] ?? null;
}

function parseValueFromSummary(summary: string | null): {
  valueDisplay: string;
  unit: string | null;
} {
  if (!summary) return { valueDisplay: "—", unit: null };
  // "PIL (US$ correnti) (2024): 123 current US$."
  const m = /^(.+?) \((\d{4})\): (.+)\.$/.exec(summary.trim());
  if (!m) return { valueDisplay: summary, unit: null };
  const rest = m[3] ?? summary;
  const unitMatch = /^(.+?) ((?:current US\$|persons|percent).*)$/.exec(rest);
  if (unitMatch) {
    return { valueDisplay: unitMatch[1] ?? rest, unit: unitMatch[2] ?? null };
  }
  return { valueDisplay: rest, unit: null };
}

function classifyEditorial(row: {
  verification_status: string;
  visibility_status: string;
}): EditorialMarketResourceListItem["editorialClass"] {
  if (row.verification_status === "rejected") return "rejected";
  if (
    row.visibility_status === "public" &&
    row.verification_status === "confirmed"
  ) {
    return "published";
  }
  if (
    row.verification_status === "in_review" &&
    row.visibility_status === "editorial"
  ) {
    return "review";
  }
  // Explicit QUESTIONABLE stays on review axes; treat lingering editorial as review.
  if (row.visibility_status !== "public") return "questionable";
  return "review";
}

type RawRow = {
  id: string;
  name: string;
  summary: string | null;
  website_url: string | null;
  contact_note: string | null;
  territorial_scope_note: string | null;
  resource_kind: string;
  verification_status: string;
  visibility_status: string;
  substantial_status: string;
  updated_at: string;
  market_id: string;
  international_markets:
    | {
        id: string;
        code: string;
        name: string;
        editorial_status: string;
      }
    | {
        id: string;
        code: string;
        name: string;
        editorial_status: string;
      }[]
    | null;
};

function mapRow(row: RawRow): EditorialMarketResourceDetail {
  const market = Array.isArray(row.international_markets)
    ? row.international_markets[0]
    : row.international_markets;
  const naturalKey = parseNaturalKey(row.contact_note);
  const indicatorCode = parseIndicatorFromNaturalKey(naturalKey);
  const meta =
    indicatorCode && indicatorCode in WB_INDICATOR_CATALOG
      ? WB_INDICATOR_CATALOG[indicatorCode as WbIndicatorCode]
      : null;
  const { valueDisplay, unit } = parseValueFromSummary(row.summary);
  const countryRef =
    firstMatch(/country_ref=([A-Z]{2})/i, row.territorial_scope_note) ??
    (market?.code ? market.code.toUpperCase() : "—");
  const countryLabel =
    market?.name ??
    ({ IT: "Italia", DE: "Germania", FR: "Francia" } as Record<string, string>)[
      countryRef
    ] ??
    countryRef;

  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    website_url: row.website_url,
    contact_note: row.contact_note,
    territorial_scope_note: row.territorial_scope_note,
    resource_kind: row.resource_kind,
    verification_status: row.verification_status,
    visibility_status: row.visibility_status,
    substantial_status: row.substantial_status,
    updated_at: row.updated_at,
    marketId: row.market_id,
    countryLabel,
    countryRef,
    marketCode: market?.code ?? "—",
    marketName: market?.name ?? "—",
    marketEditorialStatus: market?.editorial_status ?? "—",
    indicatorCode,
    indicatorLabel: meta?.platformLabel ?? row.name,
    periodYear: parseYearFromNaturalKey(naturalKey),
    valueDisplay,
    unit: unit ?? meta?.unit ?? null,
    naturalKey,
    sourceLabel: "World Bank",
    definition: meta?.definition ?? null,
    editorialClass: classifyEditorial(row),
  };
}

export async function listEditorialMarketResources(params: {
  q?: string;
  stato?: string;
  page?: string;
}): Promise<{
  items: EditorialMarketResourceListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const from = (page - 1) * LIST_PAGE_SIZE;
  const to = from + LIST_PAGE_SIZE - 1;
  const supabase = await createClient();

  let query = supabase
    .from("international_market_support_resources")
    .select(
      `
      id, name, summary, website_url, contact_note, territorial_scope_note,
      resource_kind, verification_status, visibility_status, substantial_status,
      updated_at, market_id,
      international_markets!inner(id, code, name, editorial_status)
    `,
      { count: "exact" },
    )
    .ilike("contact_note", "%natural_key=worldbank:%")
    .order("updated_at", { ascending: false })
    .range(from, to);

  const stato = params.stato ?? "review";
  if (stato === "review") {
    query = query
      .eq("verification_status", "in_review")
      .eq("visibility_status", "editorial");
  } else if (stato === "published") {
    query = query
      .eq("verification_status", "confirmed")
      .eq("visibility_status", "public");
  } else if (stato === "rejected") {
    query = query.eq("verification_status", "rejected");
  } else if (stato === "questionable") {
    // QUESTIONABLE shares review axes; filter uses same in_review/editorial.
    // Dedicated filter reserved for future note flag — currently aliases review.
    query = query
      .eq("verification_status", "in_review")
      .eq("visibility_status", "editorial");
  }

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,summary.ilike.%${params.q}%,contact_note.ilike.%${params.q}%`,
    );
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    items: ((data ?? []) as RawRow[]).map(mapRow),
    total: count ?? 0,
    page,
    pageSize: LIST_PAGE_SIZE,
  };
}

export async function getEditorialMarketResourceById(
  id: string,
): Promise<EditorialMarketResourceDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("international_market_support_resources")
    .select(
      `
      id, name, summary, website_url, contact_note, territorial_scope_note,
      resource_kind, verification_status, visibility_status, substantial_status,
      updated_at, market_id,
      international_markets!inner(id, code, name, editorial_status)
    `,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as RawRow);
}

/** READY → publish resource + ensure parent market published. */
export async function publishEditorialMarketResource(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const current = await getEditorialMarketResourceById(id);
  if (!current) {
    return {
      ok: false,
      error: { code: "not_found", message: "Risorsa mercato non trovata." },
    };
  }
  if (current.verification_status === "rejected") {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Una risorsa REJECT non può essere pubblicata.",
      },
    };
  }

  const { error: marketErr } = await supabase
    .from("international_markets")
    .update({
      editorial_status: "published",
      substantial_status: "active",
    })
    .eq("id", current.marketId);
  if (marketErr) return { ok: false, error: mapPostgresError(marketErr) };

  const { error } = await supabase
    .from("international_market_support_resources")
    .update({
      verification_status: "confirmed",
      visibility_status: "public",
      substantial_status: "active",
    })
    .eq("id", id);
  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

/** QUESTIONABLE — keep unpublished on review axes. */
export async function markQuestionableEditorialMarketResource(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("international_market_support_resources")
    .update({
      verification_status: "in_review",
      visibility_status: "editorial",
      substantial_status: "signaled",
    })
    .eq("id", id);
  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

/** REJECT — non-public; never deleted. */
export async function rejectEditorialMarketResource(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const current = await getEditorialMarketResourceById(id);
  if (!current) {
    return {
      ok: false,
      error: { code: "not_found", message: "Risorsa mercato non trovata." },
    };
  }
  if (current.visibility_status === "public") {
    return {
      ok: false,
      error: {
        code: "validation",
        message: "Ritira prima la risorsa pubblicata, poi escludila.",
      },
    };
  }

  const { error } = await supabase
    .from("international_market_support_resources")
    .update({
      verification_status: "rejected",
      visibility_status: "editorial",
      substantial_status: "archived",
    })
    .eq("id", id);
  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}

/** Withdraw a published READY back to review-only (not auto). */
export async function withdrawEditorialMarketResource(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("international_market_support_resources")
    .update({
      verification_status: "in_review",
      visibility_status: "editorial",
      substantial_status: "signaled",
    })
    .eq("id", id);
  if (error) return { ok: false, error: mapPostgresError(error) };
  return { ok: true };
}
