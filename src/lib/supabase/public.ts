import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";

/**
 * Cookie-free, anonymous Supabase client for public machine-readable surfaces
 * such as sitemap generation. It can never inherit an editor/admin session.
 */
export function createPublicClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
