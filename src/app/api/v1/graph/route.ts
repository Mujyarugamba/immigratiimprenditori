import { NextResponse } from "next/server";
import { getPublicKnowledgeSnapshot } from "@/lib/data/public/knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  const graph = await getPublicKnowledgeSnapshot();
  return NextResponse.json(
    {
      graph_version: "v1-derived",
      generated_from: "published_verified_public_data",
      node_count: graph.nodes.length,
      edge_count: graph.edges.length,
      ...graph,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
