import { NextResponse, type NextRequest } from "next/server";
import { resolveDeploymentEnvironment } from "@/lib/deployment/environment";
import { updateSession } from "@/lib/supabase/proxy";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const deployment = resolveDeploymentEnvironment(process.env);

// Keep the NEXT_PUBLIC flag as a direct process.env reference: Next.js replaces
// it at build time. Hosted-provider detection remains runtime-capable, while CI
// can remove the runtime flag and still prove that a preview build stays closed.
const previewReadOnly =
  process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY === "true" || deployment.isHostedPreview;

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
