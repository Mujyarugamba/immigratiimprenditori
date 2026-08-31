import { NextResponse } from "next/server";
import {
  collectPublicExportRows,
  publicExportFilters,
} from "@/lib/data/public/export-values";
import { absoluteUrl } from "@/lib/i18n/seo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = publicExportFilters(url.searchParams);
    const rows = await collectPublicExportRows(filters);
    const records = rows.map((value) => {
      const indicator = value.observatory_indicators;
      return {
        indicator_code: indicator.code,
        indicator_slug: indicator.slug,
        indicator_title: indicator.title,
        unit_code: indicator.unit_code,
        numeric_value: Number(value.numeric_value),
        period_start: value.period_start,
        period_end: value.period_end,
        status: value.status,
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
        filters: {
          indicatore: filters.indicatorSlug ?? null,
          territorio: filters.territoryCode ?? null,
          anno: filters.year ?? null,
          settore: filters.sectorId ?? null,
          categoria: filters.categoryCode ?? null,
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
    return NextResponse.json({ error: "open_data_unavailable" }, { status: 503 });
  }
}
