import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const LOCALES = new Set(["it", "en", "fr", "es", "de", "ar", "zh"]);

function noContent() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function externalRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || requestUrl.protocol.replace(":", "");

  if (!host || (protocol !== "http" && protocol !== "https")) {
    return requestUrl.origin;
  }

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return requestUrl.origin;
  }
}

export async function POST(request: Request) {
  // Fail closed until the production environment explicitly enables collection.
  // This keeps previews, local development and CI free of analytics writes.
  if (process.env.PRIVACY_ANALYTICS_WRITE_ENABLED !== "true") {
    return noContent();
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([requestUrl.origin, externalRequestOrigin(request)]);
  if (origin && !allowedOrigins.has(origin)) {
    return new Response("forbidden", { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 512) {
    return new Response("payload_too_large", { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("invalid_json", { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return new Response("invalid_payload", { status: 400 });
  }

  const rawPath = "path" in payload ? (payload as { path?: unknown }).path : null;
  const rawLocale = "locale" in payload ? (payload as { locale?: unknown }).locale : null;
  if (typeof rawPath !== "string" || typeof rawLocale !== "string") {
    return new Response("invalid_payload", { status: 400 });
  }

  const path = rawPath.trim();
  const locale = rawLocale.trim().toLowerCase();
  if (
    path.length < 1 ||
    path.length > 200 ||
    !path.startsWith("/") ||
    path.includes("?") ||
    path.includes("#") ||
    !LOCALES.has(locale)
  ) {
    return new Response("invalid_payload", { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.rpc("record_site_page_view", {
      p_path: path,
      p_locale: locale,
    });
    if (error) {
      console.error(`[analytics] aggregate write failed: ${error.code ?? "unknown"}`);
      return new Response("analytics_unavailable", { status: 503 });
    }
    return noContent();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "unknown";
    console.error(`[analytics] aggregate write unavailable: ${message}`);
    return new Response("analytics_unavailable", { status: 503 });
  }
}
