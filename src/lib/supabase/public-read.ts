import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

/**
 * Cookie-free public read client for Server Components, route handlers and
 * other server-side public loaders. Publishable key only: no cookies, no
 * session persistence, no token refresh, no service-role.
 */
export function createPublicReadClient(): SupabaseClient {
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
