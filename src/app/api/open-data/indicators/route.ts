import { NextResponse } from "next/server";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getExplorerSnapshot();
    const indicatorMap = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));

    const records = snapshot.values.map((value) => {
      const indicator = indicatorMap.get(value.indicator_id);
      return {
        indicator_code: indicator?.code ?? null,
        indicator_slug: indicator?.slug ?? null,
        indicator_title: indicator?.title ?? null,
        unit_code: indicator?.unit_code ?? null,
        numeric_value: Number(value.numeric_value),
        period_start: value.period_start,
        period_end: value.period_end,
        territory_level: value.territory_level,
        territory_code: value.territory_code,
        territory_label: value.territory_label,
        category_code: value.country_code,
        category_label: value.country_label,
        business_sector_id: value.business_sector_id,
        quality_code: value.quality_code,
      };
    });

    return NextResponse.json(
      {
        dataset: "Immigrati Imprenditori — Osservatorio",
        generated_at: new Date().toISOString(),
        record_count: records.length,
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
    return NextResponse.json({ error: "open_data_unavailable" }, { status: 503 });
  }
}
