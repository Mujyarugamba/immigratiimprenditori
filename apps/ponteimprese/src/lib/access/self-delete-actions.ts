"use server";

import { redirect } from "next/navigation";
import { banAuthUser } from "@/lib/access/ban-auth-user";
import {
  parseSelfDeletePreflight,
  SELF_DELETE_CONFIRM_PHRASE,
  SELF_DELETE_USER_COPY,
  selfDeleteBlockerMessage,
  type SelfDeletePreflight,
} from "@/lib/access/self-delete";
import { createClient } from "@/lib/supabase/server";

export type SelfDeleteActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  authBanFailed?: boolean;
};

export async function loadSelfDeletePreflight(): Promise<
  | { ok: true; preflight: SelfDeletePreflight }
  | { ok: false; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Devi accedere per continuare." };
  }

  const { data, error } = await supabase.rpc("access_self_delete_preflight");
  if (error) {
    return {
      ok: false,
      message: "Non è stato possibile verificare la cancellazione.",
    };
  }
  const preflight = parseSelfDeletePreflight(data);
  if (!preflight) {
    return { ok: false, message: "Risposta preflight non valida." };
  }
  return { ok: true, preflight };
}

/**
 * Ordered: password re-auth → preflight → DB RPC → Auth ban → signOut → redirect.
 * Never accepts account_id from the client.
 */
export async function selfDeleteAccountAction(
  _prev: SelfDeleteActionState,
  formData: FormData,
): Promise<SelfDeleteActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPhrase = String(formData.get("confirm_phrase") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!password) fieldErrors.password = "Inserisci la password.";
  if (confirmPhrase !== SELF_DELETE_CONFIRM_PHRASE) {
    fieldErrors.confirm_phrase = `Digita esattamente ${SELF_DELETE_CONFIRM_PHRASE}.`;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Conferma incompleta.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, message: "Sessione non valida." };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (reauthError) {
    return {
      ok: false,
      message: "Password non corretta.",
      fieldErrors: { password: "Password non corretta." },
    };
  }

  const { data: preflightRaw, error: preflightError } = await supabase.rpc(
    "access_self_delete_preflight",
  );
  if (preflightError) {
    return {
      ok: false,
      message: "Non è stato possibile verificare la cancellazione.",
    };
  }
  const preflight = parseSelfDeletePreflight(preflightRaw);
  if (!preflight) {
    return { ok: false, message: "Risposta preflight non valida." };
  }
  if (!preflight.can_proceed) {
    return {
      ok: false,
      message:
        selfDeleteBlockerMessage(preflight) ??
        SELF_DELETE_USER_COPY.blockedLastAdmin,
    };
  }

  const { data: deleteRaw, error: deleteError } = await supabase.rpc(
    "access_self_delete_account",
  );
  if (deleteError) {
    const msg = (deleteError.message ?? "").toLowerCase();
    if (msg.includes("last_application_admin") || msg.includes("self_delete_blocked")) {
      return { ok: false, message: SELF_DELETE_USER_COPY.blockedLastAdmin };
    }
    return {
      ok: false,
      message: "Cancellazione non riuscita. Nessuna modifica applicata.",
    };
  }
  if (!deleteRaw || typeof deleteRaw !== "object" || !(deleteRaw as { ok?: boolean }).ok) {
    return {
      ok: false,
      message: "Cancellazione non riuscita. Nessuna modifica applicata.",
    };
  }

  const ban = await banAuthUser(user.id);
  await supabase.auth.signOut();

  if (!ban.ok) {
    // Account already closed — primary security holds; surface controlled message then leave area.
    redirect(
      `/?account_deleted=partial&reason=${encodeURIComponent("auth_ban_retry")}`,
    );
  }

  redirect("/?account_deleted=1");
}
