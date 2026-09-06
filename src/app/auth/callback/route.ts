import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeRecoveryTarget(raw: string | null): string {
  const value = (raw ?? "").trim();
  if (value === "/aggiorna-password" || value.startsWith("/aggiorna-password?")) {
    return value;
  }
  return "/aggiorna-password";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeRecoveryTarget(url.searchParams.get("next"));
  const supabase = await createClient();

  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/accedi?error=recovery", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
