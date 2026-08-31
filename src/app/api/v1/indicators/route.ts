import { NextResponse } from "next/server";
import { fetchJoinedPublicIndicatorValues } from "@/lib/data/public/public-values";
import { createPublicReadClient } from "@/lib/supabase/public-read";
import { absoluteUrl } from "@/lib/i18n/seo";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;
const MAX_OFFSET = 1_000_000;

function boundedInteger(raw: string | null, fallback: number, minimum: number, maximum: number) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const indicatorSlug = url.searchParams.get("indicator")?.trim() || undefined;
    const territoryCode = url.searchParams.get("territory")?.trim() || undefined;
    const year = url.searchParams.get("year")?.trim() || undefined;
    const sectorId = url.searchParams.get("sector")?.trim() || undefined;
    const categoryCode = url.searchParams.get("category")?.trim() || undefined;
    const limit = boundedInteger(url.searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    const offset = boundedInteger(url.searchParams.get("offset"), 0, 0, MAX_OFFSET);

    const result = await fetchJoinedPublicIndicatorValues({
      client: createPublicReadClient(),
      filters: {
        indicatorSlug,
        territoryCode,
        year,
        sectorId,
        categoryCode,
      },
      page: { limit, offset },
      bounds: { defaultLimit: DEFAULT_LIMIT, maxLimit: MAX_LIMIT },
    });

    const records = result.rows.map((value) => {
      const indicator = value.observatory_indicators;
      return {
        indicator: {
          code: indicator.code,
          slug: indicator.slug,
          title: indicator.title,
          description: indicator.description,
          unit_code: indicator.unit_code,
        },
        value: Number(value.numeric_value),
        period: {
          start: value.period_start,
          end: value.period_end,
        },
        status: value.status,
        territory: value.territory_label
          ? {
              level: value.territory_level,
              code: value.territory_code,
              label: value.territory_label,
            }
          : null,
        category: value.country_label
          ? { code: value.country_code, label: value.country_label }
          : null,
        business_sector_id: value.business_sector_id,
        quality_code: value.quality_code,
      };
    });

    return NextResponse.json(
      {
        api_version: "v1",
        dataset: "observatory_indicators",
        generated_at: new Date().toISOString(),
        record_count: records.length,
        total_count: result.page.total,
        pagination: {
          limit: result.page.limit,
          offset: result.page.offset,
          has_more: result.page.hasMore,
        },
        filters: {
          indicator: indicatorSlug ?? null,
          territory: territoryCode ?? null,
          year: year ?? null,
          sector: sectorId ?? null,
          category: categoryCode ?? null,
        },
        methodology_url: absoluteUrl("/dati-e-fonti"),
        records,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
          "Access-Control-Allow-Origin": "*",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return NextResponse.json({ api_version: "v1", error: "data_unavailable" }, { status: 503 });
  }
}
