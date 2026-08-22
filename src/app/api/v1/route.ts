import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      name: "Immigrati Imprenditori — Public API",
      version: "v1",
      status: "stable-foundation",
      documentation: "https://immigratiimprenditori.it/open-data/api",
      methodology: "https://immigratiimprenditori.it/dati-e-fonti",
      endpoints: {
        indicators: "/api/v1/indicators",
        atlas_countries: "/api/v1/atlas/countries",
        atlas_routes: "/api/v1/atlas/routes",
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
