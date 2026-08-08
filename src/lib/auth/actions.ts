"use server";

import { redirect } from "next/navigation";
import { ensureAccountProvisioned } from "@/lib/access/ensure-account";
import { linkOwnPerson } from "@/lib/access/link-person";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function fail(message: string, fieldErrors?: Record<string, string>): AuthActionState {
  return { ok: false, message, fieldErrors };
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(String(formData.get("next") ?? "/app"));

  if (!email || !password) {
    return fail("Inserisci email e password.", {
      email: !email ? "Obbligatoria" : "",
      password: !password ? "Obbligatoria" : "",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return fail("Credenziali non valide.");
  }

  const provision = await ensureAccountProvisioned(data.user.id);
  if (!provision.accountId && provision.errorMessage) {
    return fail(provision.errorMessage);
  }

  redirect(next);
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    return fail("Inserisci email e password.");
  }
  if (password.length < 8) {
    return fail("La password deve avere almeno 8 caratteri.", {
      password: "Minimo 8 caratteri",
    });
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: origin
        ? `${origin}/auth/callback?next=/app/onboarding`
        : undefined,
    },
  });

  if (error) {
    return fail(error.message || "Registrazione non riuscita.");
  }

  if (data.user && data.session) {
    const provision = await ensureAccountProvisioned(data.user.id);
    if (!provision.accountId && provision.errorMessage) {
      return fail(provision.errorMessage);
    }
    redirect("/app/onboarding");
  }

  return {
    ok: true,
    message:
      "Registrazione avviata. Controlla la email per confermare l'account, poi accedi.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function completeOnboardingAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const displayName = String(formData.get("display_name") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("Sessione scaduta. Accedi di nuovo.");
  }

  const provision = await ensureAccountProvisioned(user.id);
  if (!provision.accountId) {
    return fail(
      provision.errorMessage ??
        "Account non disponibile. Contatta l'assistenza.",
    );
  }

  const linked = await linkOwnPerson({
    accountId: provision.accountId,
    authUserId: user.id,
  });

  if (!linked.ok) {
    return fail(toUserMessage(linked.error as AppError));
  }

  if (displayName) {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    if (error) {
      // Link succeeded; profile update is best-effort for onboarding.
      console.error("profile display_name update failed", error);
    }
  }

  redirect("/app");
}
