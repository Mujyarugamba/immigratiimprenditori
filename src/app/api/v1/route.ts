import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/i18n/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      name: "Immigrati Imprenditori — Public API",
      version: "v1",
      status: "stable-foundation",
      documentation: absoluteUrl("/open-data/api"),
      methodology: absoluteUrl("/dati-e-fonti"),
      endpoints: {
        indicators: "/api/v1/indicators",
        atlas_countries: "/api/v1/atlas/countries",
        atlas_routes: "/api/v1/atlas/routes",
        research_context: "/api/v1/context?q=termine",
        knowledge_graph: "/api/v1/graph",
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
