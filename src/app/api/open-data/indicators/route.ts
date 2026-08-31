import { NextResponse } from "next/server";
import {
  collectCanonicalPublicExportRecords,
  publicExportFilters,
} from "@/lib/data/public/exports";
import { absoluteUrl } from "@/lib/i18n/seo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = publicExportFilters(url.searchParams);
    const records = await collectCanonicalPublicExportRecords(filters);

    return NextResponse.json(
      {
        dataset: "Immigrati Imprenditori — Osservatorio",
        generated_at: new Date().toISOString(),
        record_count: records.length,
        filters: {
          indicatore: filters.indicatorSlug ?? null,
          territorio: filters.territoryCode ?? null,
          anno: filters.year ?? null,
          settore: filters.sectorId ?? null,
          categoria: filters.categoryCode ?? null,
        },
        methodology_url: absoluteUrl("/dati-e-fonti"),
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
    return NextResponse.json({ error: "open_data_unavailable" }, { status: 503 });
  }
}
