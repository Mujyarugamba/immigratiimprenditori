import { NextResponse } from "next/server";
import { listAtlasCountrySummaries } from "@/lib/data/public/atlas";
import { absoluteUrl } from "@/lib/i18n/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summaries = await listAtlasCountrySummaries();
    const records = summaries
      .filter((item) => item.hasEvidence)
      .map((item) => ({
        code: item.country.code,
        iso3: item.country.iso3,
        slug: item.country.slug,
        name: item.country.name,
        evidence: {
          indicator_count: item.indicatorCount,
          data_value_count: item.dataValueCount,
          content_count: item.contentCount,
          event_count: item.eventCount,
        },
        url: absoluteUrl(`/atlante/${item.country.slug}`),
      }));

    return NextResponse.json(
      {
        api_version: "v1",
        dataset: "atlas_countries",
        generated_at: new Date().toISOString(),
        record_count: records.length,
        publication_rule: "evidence-backed-only",
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
