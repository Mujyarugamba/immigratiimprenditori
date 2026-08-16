"use server";

import { redirect } from "next/navigation";
import { ensureAccountProvisioned } from "@/lib/access/ensure-account";
import { linkOwnPerson } from "@/lib/access/link-person";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import {
  ensureSignupTermsAcceptanceIfIntended,
  parseTermsAcceptedFromForm,
  recordSignupTermsAcceptance,
  signupTermsMetadata,
  TERMS_ACCEPTANCE_REQUIRED_MESSAGE,
} from "@/lib/legal/record-terms-acceptance";
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

  if (provision.accountId) {
    const terms = await ensureSignupTermsAcceptanceIfIntended(
      supabase,
      data.user,
      provision.accountId,
    );
    if (!terms.ok) {
      await supabase.auth.signOut();
      return fail(terms.message);
    }
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

  if (!parseTermsAcceptedFromForm(formData)) {
    return fail(TERMS_ACCEPTANCE_REQUIRED_MESSAGE, {
      accept_terms: TERMS_ACCEPTANCE_REQUIRED_MESSAGE,
    });
  }

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
  const termsMeta = signupTermsMetadata();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...(fullName ? { full_name: fullName } : {}),
        ...termsMeta,
      },
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
    if (!provision.accountId) {
      await supabase.auth.signOut();
      return fail(
        provision.errorMessage ??
          "Account non disponibile. Contatta l'assistenza.",
      );
    }

    const recorded = await recordSignupTermsAcceptance(
      supabase,
      provision.accountId,
    );
    if (!recorded.ok) {
      // Fail-safe: do not leave a fully active session without Terms evidence.
      // Auth+Account may already exist; metadata retains intent for login retry.
      await supabase.auth.signOut();
      return fail(recorded.message);
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

  const terms = await ensureSignupTermsAcceptanceIfIntended(
    supabase,
    user,
    provision.accountId,
  );
  if (!terms.ok) {
    return fail(terms.message);
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
