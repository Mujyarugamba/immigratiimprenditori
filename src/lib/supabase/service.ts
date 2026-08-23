import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  getPublicSupabaseEnv,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

/**
 * Privileged Supabase client for narrow server-only operations.
 * The server-only marker makes accidental Client Component imports fail at build time.
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
