/**
 * Server-only Auth ban after successful self-delete DB path.
 * Never import from Client Components.
 */

import { createAdminClient } from "@/lib/supabase/admin";

/** Long-lived ban (~100y). Prefer ban over Auth hard-delete while Persona FK hub survives. */
const BAN_DURATION = "876000h";

export type BanAuthUserResult =
  | { ok: true }
  | { ok: false; message: string };

export async function banAuthUser(authUserId: string): Promise<BanAuthUserResult> {
  if (typeof window !== "undefined") {
    throw new Error("banAuthUser must not run in the browser");
  }
  if (!/^[0-9a-f-]{36}$/i.test(authUserId)) {
    return { ok: false, message: "Identificativo Auth non valido." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(authUserId, {
      ban_duration: BAN_DURATION,
    });
    if (error) {
      return {
        ok: false,
        message: "Chiusura accesso non completata. Contatta il supporto.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Chiusura accesso non completata. Contatta il supporto.",
    };
  }
}
