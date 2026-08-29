import "server-only";

import { createClient } from "@supabase/supabase-js";
import { resolveDeploymentEnvironment } from "@/lib/deployment/environment";
import {
  getPublicSupabaseEnv,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

/**
 * Privileged Supabase client for narrow server-only operations.
 * The server-only marker makes accidental Client Component imports fail at build time.
 * Hosted/read-only previews are also denied at runtime even if a privileged secret is
 * accidentally configured there: Preview must never acquire service-role capability.
 */
export function createServiceRoleClient() {
  if (resolveDeploymentEnvironment(process.env).isReadOnlyPreview) {
    throw new Error("Supabase service-role client is disabled in Preview environments.");
  }

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
