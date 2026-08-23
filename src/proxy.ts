import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const previewReadOnly = process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY === "true";

export async function proxy(request: NextRequest) {
  if (previewReadOnly && !SAFE_METHODS.has(request.method.toUpperCase())) {
    return new NextResponse("Deploy Preview is read-only.", {
      status: 405,
      headers: {
        Allow: "GET, HEAD, OPTIONS",
        "Cache-Control": "no-store",
        "X-Preview-Read-Only": "true",
      },
    });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
