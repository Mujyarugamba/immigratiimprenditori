import { createClient } from "@supabase/supabase-js";
import {
  getPublicSupabaseEnv,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

/**
 * Privileged Supabase client for narrow server-only operations.
 * Never import this module from a Client Component.
 */
export function createServiceRoleClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
