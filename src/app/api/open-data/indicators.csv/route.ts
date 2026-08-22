import { getExplorerSnapshot } from "@/lib/data/public/explore";

function csvCell(value: unknown) {
  if (value == null) return "";
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  try {
    const snapshot = await getExplorerSnapshot();
    const indicatorMap = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));
    const header = [
      "indicator_code",
      "indicator_title",
      "unit_code",
      "numeric_value",
      "period_start",
      "period_end",
      "territory_level",
      "territory_code",
      "territory_label",
      "category_code",
      "category_label",
      "business_sector_id",
      "quality_code",
    ];

    const rows = snapshot.values.map((value) => {
      const indicator = indicatorMap.get(value.indicator_id);
      return [
        indicator?.code ?? "",
        indicator?.title ?? "",
        indicator?.unit_code ?? "",
        Number(value.numeric_value),
        value.period_start,
        value.period_end,
        value.territory_level,
        value.territory_code,
        value.territory_label,
        value.country_code,
        value.country_label,
        value.business_sector_id,
        value.quality_code,
      ].map(csvCell).join(",");
    });

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
