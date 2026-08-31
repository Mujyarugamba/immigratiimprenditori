import {
  collectCanonicalPublicExportRecords,
  publicExportFilters,
} from "@/lib/data/public/exports";
import { csvCell } from "@/lib/export/csv";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const values = await collectCanonicalPublicExportRecords(publicExportFilters(url.searchParams));

    const header = [
      "indicator_code",
      "indicator_title",
      "unit_code",
      "numeric_value",
      "period_start",
      "period_end",
      "status",
      "territory_level",
      "territory_code",
      "territory_label",
      "category_code",
      "category_label",
      "business_sector_id",
      "quality_code",
    ];

    const rows = values.map((value) => [
      value.indicator_code,
      value.indicator_title,
      value.unit_code,
      value.numeric_value,
      value.period_start,
      value.period_end,
      value.status,
      value.territory_level,
      value.territory_code,
      value.territory_label,
      value.category_code,
      value.category_label,
      value.business_sector_id,
      value.quality_code,
    ].map(csvCell).join(","));

    const body = `\uFEFF${header.map(csvCell).join(",")}\n${rows.join("\n")}\n`;
    return new Response(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="immigrati-imprenditori-osservatorio.csv"',
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("open_data_unavailable", { status: 503 });
  }
}
