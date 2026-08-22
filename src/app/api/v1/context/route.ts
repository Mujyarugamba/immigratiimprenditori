import { NextResponse } from "next/server";
import { buildResearchContext } from "@/lib/data/public/research-context";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 160);
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") ?? "12", 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(requestedLimit, 20))
    : 12;

  if (q.length < 2) {
    return NextResponse.json(
      {
        error: "query_too_short",
        message: "Il parametro q deve contenere almeno due caratteri.",
      },
      { status: 400 },
    );
  }

  const items = await buildResearchContext(q, limit);
  return NextResponse.json(
    {
      query: q,
      retrieval_mode: "verified_public_lexical",
      generated_answer: false,
      count: items.length,
      items,
      note:
        "Questo endpoint restituisce contesto verificabile e citabile. Non genera risposte AI e non sostituisce la lettura delle fonti e delle schede metodologiche.",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
