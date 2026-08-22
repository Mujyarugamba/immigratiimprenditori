import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/env";
import { getPlatformLanguage, isPlatformLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";

function documentLocale(request: NextRequest) {
  const first = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const locale = first && isPlatformLocale(first) ? first : DEFAULT_LOCALE;
  return getPlatformLanguage(locale);
}

function responseFor(request: NextRequest) {
  const language = documentLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-platform-locale", language.code);
  requestHeaders.set("x-platform-direction", language.direction);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * Refresh and validate the Supabase Auth session for SSR requests.
 * Authorization remains in the protected application layouts/actions.
 * The proxy also injects a validated locale/direction header so the root HTML
 * element can expose the correct lang/dir attributes for accessibility and SEO.
 */
export async function updateSession(request: NextRequest) {
  let response = responseFor(request);
  const { url, publishableKey } = getPublicSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = responseFor(request);

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(cacheHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // getClaims validates the JWT and triggers refresh when required.
  await supabase.auth.getClaims();

  return response;
}
