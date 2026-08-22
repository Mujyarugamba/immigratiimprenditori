import { NextResponse } from "next/server";
import {
  getPublicKnowledgeNeighborhood,
  getPublicKnowledgeSnapshot,
} from "@/lib/data/public/knowledge";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
  "Access-Control-Allow-Origin": "*",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind")?.trim() ?? "";
  const key = url.searchParams.get("key")?.trim() ?? "";

  if (Boolean(kind) !== Boolean(key)) {
    return NextResponse.json(
      {
        error: "kind e key devono essere specificati insieme",
      },
      { status: 400, headers: HEADERS },
    );
  }

  if (kind && key) {
    const neighborhood = await getPublicKnowledgeNeighborhood(kind, key);
    if (!neighborhood) {
      return NextResponse.json(
        { error: "entità pubblica non trovata" },
        { status: 404, headers: HEADERS },
      );
    }

    return NextResponse.json(
      {
        graph_version: "v1-derived",
        generated_from: "published_verified_public_data",
        mode: "neighborhood",
        connection_count: neighborhood.connections.length,
        ...neighborhood,
      },
      { headers: HEADERS },
    );
  }

  const graph = await getPublicKnowledgeSnapshot();
  return NextResponse.json(
    {
      graph_version: "v1-derived",
      generated_from: "published_verified_public_data",
      mode: "snapshot",
      node_count: graph.nodes.length,
      edge_count: graph.edges.length,
      ...graph,
    },
    { headers: HEADERS },
  );
}
