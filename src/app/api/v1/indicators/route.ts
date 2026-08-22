import { NextResponse } from "next/server";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const snapshot = await getExplorerSnapshot();
    const indicatorMap = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));
    const url = new URL(request.url);
    const indicatorSlug = url.searchParams.get("indicator")?.trim() || null;
    const territoryCode = url.searchParams.get("territory")?.trim() || null;
    const year = url.searchParams.get("year")?.trim() || null;
    const sectorId = url.searchParams.get("sector")?.trim() || null;
    const categoryCode = url.searchParams.get("category")?.trim() || null;

    const records = snapshot.values
      .filter((value) => {
        const indicator = indicatorMap.get(value.indicator_id);
        if (!indicator) return false;
        if (indicatorSlug && indicator.slug !== indicatorSlug) return false;
        if (territoryCode && value.territory_code !== territoryCode) return false;
        if (year && String(new Date(value.period_start).getFullYear()) !== year) return false;
        if (sectorId && String(value.business_sector_id ?? "") !== sectorId) return false;
        if (categoryCode && value.country_code !== categoryCode) return false;
        return true;
      })
      .map((value) => {
        const indicator = indicatorMap.get(value.indicator_id)!;
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
        filters: {
          indicator: indicatorSlug,
          territory: territoryCode,
          year,
          sector: sectorId,
          category: categoryCode,
        },
        methodology_url: "https://immigratiimprenditori.it/dati-e-fonti",
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
