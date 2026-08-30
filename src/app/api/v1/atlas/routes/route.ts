import { NextResponse } from "next/server";
import { listPublishedRouteSummaries } from "@/lib/data/public/routes";
import { absoluteUrl } from "@/lib/i18n/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const routes = await listPublishedRouteSummaries();
    const records = routes.map((item) => ({
      slug: item.route.slug,
      origin: {
        code: item.route.origin.code,
        iso3: item.route.origin.iso3,
        slug: item.route.origin.slug,
        name: item.route.origin.name,
      },
      destination: {
        code: item.route.destination.code,
        iso3: item.route.destination.iso3,
        slug: item.route.destination.slug,
        name: item.route.destination.name,
      },
      evidence: {
        indicator_count: item.indicatorCount,
        data_value_count: item.dataValueCount,
        content_count: item.contentCount,
        event_count: item.eventCount,
      },
      url: absoluteUrl(`/atlante/rotte/${item.route.slug}`),
    }));

    return NextResponse.json(
      {
        api_version: "v1",
        dataset: "atlas_routes",
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
