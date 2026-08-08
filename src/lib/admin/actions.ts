"use server";

import { revalidatePath } from "next/cache";
import { closeAccount } from "@/lib/data/admin/accounts";
import { linkPersonToAccount } from "@/lib/data/admin/link-person";
import {
  assignRole,
  revokeRole,
} from "@/lib/data/admin/roles";
import {
  WHITELISTED_APPLICATION_ROLES,
  type WhitelistedApplicationRole,
} from "@/lib/admin/labels";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { requireApplicationAdmin } from "@/lib/session/guards";

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function isWhitelistedRole(value: string): value is WhitelistedApplicationRole {
  return (WHITELISTED_APPLICATION_ROLES as readonly string[]).includes(value);
}

async function requireAdminSession() {
  const session = await getApplicationSession();
  const guard = requireApplicationAdmin(session);
  if (!guard.ok || !session?.accountId) {
    return {
      ok: false as const,
      message: "Solo Amministratore applicativo può eseguire l'operazione.",
    };
  }
  return { ok: true as const, session, accountId: session.accountId };
}

export async function assignRoleAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireAdminSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const targetAccountId = String(formData.get("account_id") ?? "").trim();
  const roleCode = String(formData.get("role_code") ?? "").trim();

  if (!targetAccountId) {
    return { ok: false, message: "Account target obbligatorio." };
  }
  if (!isWhitelistedRole(roleCode)) {
    return { ok: false, message: "Ruolo non consentito." };
  }
  if (targetAccountId === gate.accountId) {
    return {
      ok: false,
      message: "Non puoi assegnarti un ruolo elevato (auto-promozione bloccata).",
    };
  }

  const result = await assignRole(targetAccountId, roleCode);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath("/app/amministrazione");
  revalidatePath("/app/amministrazione/ruoli");
  revalidatePath(`/app/amministrazione/account/${targetAccountId}`);
  return { ok: true, message: "Ruolo assegnato." };
}

export async function revokeRoleAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireAdminSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const assignmentId = String(formData.get("assignment_id") ?? "").trim();
  const accountId = String(formData.get("account_id") ?? "").trim();

  if (!assignmentId) {
    return { ok: false, message: "Assegnazione assente." };
  }

  const result = await revokeRole(assignmentId);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath("/app/amministrazione");
  revalidatePath("/app/amministrazione/ruoli");
  if (accountId) {
    revalidatePath(`/app/amministrazione/account/${accountId}`);
  }
  return { ok: true, message: "Ruolo revocato." };
}

export async function closeAccountAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireAdminSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const accountId = String(formData.get("account_id") ?? "").trim();
  if (!accountId) {
    return { ok: false, message: "Account assente." };
  }

  const result = await closeAccount(accountId);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath("/app/amministrazione");
  revalidatePath("/app/amministrazione/account");
  revalidatePath(`/app/amministrazione/account/${accountId}`);
  return { ok: true, message: "Account chiuso." };
}

export async function linkPersonAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireAdminSession();
  if (!gate.ok) return { ok: false, message: gate.message };

  const accountId = String(formData.get("account_id") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();

  if (!accountId || !personId) {
    return {
      ok: false,
      message: "Account e Persona (profiles.id) sono obbligatori.",
    };
  }

  const result = await linkPersonToAccount({ accountId, personId });
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath(`/app/amministrazione/account/${accountId}`);
  revalidatePath("/app/amministrazione/account");
  return { ok: true, message: "Persona collegata (associazione verificata)." };
}
