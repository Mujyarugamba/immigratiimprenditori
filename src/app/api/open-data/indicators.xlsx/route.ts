import {
  collectCanonicalPublicExportRecords,
  publicExportFilters,
} from "@/lib/data/public/exports";
import { createSimpleXlsx } from "@/lib/export/xlsx";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const values = await collectCanonicalPublicExportRecords(publicExportFilters(url.searchParams));

    const rows: Array<Array<string | number | null>> = [
      [
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
      ],
      ...values.map((value) => [
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
      ]),
    ];

    const workbook = createSimpleXlsx(rows, "Osservatorio");
    return new Response(workbook, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="immigrati-imprenditori-osservatorio.xlsx"',
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("open_data_unavailable", { status: 503 });
  }
}
