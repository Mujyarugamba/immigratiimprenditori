import { getExplorerSnapshot } from "@/lib/data/public/explore";

function csvCell(value: unknown) {
  if (value == null) return "";
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  try {
    const snapshot = await getExplorerSnapshot();
    const indicatorMap = new Map(snapshot.indicators.map((indicator) => [indicator.id, indicator]));
    const url = new URL(request.url);
    const indicatorSlug = url.searchParams.get("indicatore")?.trim() || null;
    const territoryCode = url.searchParams.get("territorio")?.trim() || null;
    const year = url.searchParams.get("anno")?.trim() || null;
    const sectorId = url.searchParams.get("settore")?.trim() || null;
    const categoryCode = url.searchParams.get("categoria")?.trim() || null;

    const values = snapshot.values.filter((value) => {
      const indicator = indicatorMap.get(value.indicator_id);
      if (!indicator) return false;
      if (indicatorSlug && indicator.slug !== indicatorSlug) return false;
      if (territoryCode && value.territory_code !== territoryCode) return false;
      if (year && String(new Date(value.period_start).getFullYear()) !== year) return false;
      if (sectorId && String(value.business_sector_id ?? "") !== sectorId) return false;
      if (categoryCode && value.country_code !== categoryCode) return false;
      return true;
    });

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

    const rows = values.map((value) => {
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
