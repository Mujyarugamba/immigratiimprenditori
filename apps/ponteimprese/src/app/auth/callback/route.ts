import { NextResponse } from "next/server";
import { ensureAccountProvisioned } from "@/lib/access/ensure-account";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { ensureSignupTermsAcceptanceIfIntended } from "@/lib/legal/record-terms-acceptance";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/app");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const provision = await ensureAccountProvisioned(data.user.id);
      if (provision.accountId) {
        const terms = await ensureSignupTermsAcceptanceIfIntended(
          supabase,
          data.user,
          provision.accountId,
        );
        if (!terms.ok) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/accedi?error=callback`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/accedi?error=callback`);
}
