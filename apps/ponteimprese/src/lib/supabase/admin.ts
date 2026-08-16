import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getServiceRoleKey } from "@/lib/env";

/**
 * Service-role client — server-only.
 * Use exclusively for Access RPCs that require service_role (e.g. access_provision_account).
 * Never import this module from Client Components.
 */
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
