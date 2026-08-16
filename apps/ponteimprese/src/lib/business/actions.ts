"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createBusinessWithSelfMembership,
  getBusinessCapabilitiesFromDb,
  updateBusinessAsManager,
} from "@/lib/data/authenticated/businesses";
import { pickBusinessActUpdate } from "@/lib/business/whitelist";
import { concludeOwnMembership } from "@/lib/data/authenticated/memberships";
import {
  bootstrapBusinessGrant,
  grantBusinessManagement,
  revokeBusinessManagement,
} from "@/lib/data/rpc/business-management";
import { setSelectedBusinessId } from "@/lib/business/selected-business";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { toUserMessage, type AppError } from "@/lib/errors/app-error";
import { getApplicationSession } from "@/lib/session/get-application-session";

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

async function requireActivePersona() {
  const session = await getApplicationSession();
  if (!session) {
    return { ok: false as const, message: "Sessione scaduta. Accedi di nuovo." };
  }
  if (!session.personId || !session.isActiveAccount) {
    return {
      ok: false as const,
      message: "Completa il profilo per usare l'area riservata.",
    };
  }
  return {
    ok: true as const,
    session,
    personId: session.personId,
  };
}

export async function selectBusinessAction(formData: FormData): Promise<void> {
  const businessId = String(formData.get("business_id") ?? "").trim();
  const gate = await requireActivePersona();
  if (!gate.ok) {
    redirect("/accedi?next=/app/imprese");
  }

  if (!businessId) {
    await setSelectedBusinessId(null);
    redirect("/app/imprese");
  }

  // Selection only if CTX; never invent ACT.
  const caps = await getBusinessCapabilitiesFromDb(businessId);
  if (!caps.isMember) {
    redirect("/app/imprese");
  }

  await setSelectedBusinessId(businessId);
  const next = String(formData.get("next") ?? "").trim();
  redirect(safeRedirectPath(next, `/app/imprese/${businessId}`));
}

export async function createBusinessAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireActivePersona();
  if (!gate.ok) return { ok: false, message: gate.message };

  const legal_name = String(formData.get("legal_name") ?? "");
  const public_name = String(formData.get("public_name") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const role_id = String(formData.get("role_id") ?? "founder");

  const result = await createBusinessWithSelfMembership(gate.personId, {
    legal_name,
    public_name,
    summary,
    role_id,
  });

  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  await setSelectedBusinessId(result.businessId);
  revalidatePath("/app/imprese");
  revalidatePath("/app");
  redirect(`/app/imprese/${result.businessId}`);
}

export async function updateBusinessAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireActivePersona();
  if (!gate.ok) return { ok: false, message: gate.message };

  const businessId = String(formData.get("business_id") ?? "").trim();
  if (!businessId) {
    return { ok: false, message: "Impresa non indicata." };
  }

  const caps = await getBusinessCapabilitiesFromDb(businessId);
  if (!caps.canManage) {
    return {
      ok: false,
      message: "Serve l'autorizzazione di gestione per modificare la scheda.",
    };
  }

  const patch = pickBusinessActUpdate(Object.fromEntries(formData.entries()));
  // Reject ownership-like keys if ever posted.
  if ("id" in Object.fromEntries(formData.entries())) {
    // ignored by whitelist
  }

  const result = await updateBusinessAsManager(businessId, patch);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath(`/app/imprese/${businessId}`);
  revalidatePath("/app/imprese");
  return { ok: true, message: "Scheda Impresa aggiornata." };
}

export async function grantManagementAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireActivePersona();
  if (!gate.ok) return { ok: false, message: gate.message };

  const membershipId = String(formData.get("membership_id") ?? "").trim();
  const businessId = String(formData.get("business_id") ?? "").trim();
  if (!membershipId) {
    return { ok: false, message: "Collegamento non indicato." };
  }

  const result = await grantBusinessManagement(membershipId);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  if (businessId) {
    revalidatePath(`/app/imprese/${businessId}`);
  }
  return { ok: true, message: "Gestione concessa." };
}

export async function revokeManagementAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireActivePersona();
  if (!gate.ok) return { ok: false, message: gate.message };

  const authorizationId = String(formData.get("authorization_id") ?? "").trim();
  const businessId = String(formData.get("business_id") ?? "").trim();
  if (!authorizationId) {
    return { ok: false, message: "Autorizzazione assente." };
  }

  const result = await revokeBusinessManagement(authorizationId);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  if (businessId) {
    revalidatePath(`/app/imprese/${businessId}`);
  }
  return {
    ok: true,
    message:
      "Gestione revocata. Attenzione: l'impresa può restare senza gestori attivi.",
  };
}

export async function bootstrapGrantAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await getApplicationSession();
  if (!session?.isApplicationAdmin) {
    return {
      ok: false,
      message:
        "Solo un amministratore può abilitare la prima autorizzazione di gestione.",
    };
  }

  const membershipId = String(formData.get("membership_id") ?? "").trim();
  if (!membershipId) {
    return { ok: false, message: "ID del collegamento obbligatorio." };
  }

  const result = await bootstrapBusinessGrant(membershipId);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  revalidatePath("/app/amministrazione");
  revalidatePath("/app/imprese");
  return { ok: true, message: "Prima autorizzazione di gestione abilitata." };
}

export async function concludeMembershipAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const gate = await requireActivePersona();
  if (!gate.ok) return { ok: false, message: gate.message };

  const membershipId = String(formData.get("membership_id") ?? "").trim();
  const businessId = String(formData.get("business_id") ?? "").trim();
  if (!membershipId) {
    return { ok: false, message: "Collegamento non indicato." };
  }

  const result = await concludeOwnMembership(membershipId, gate.personId);
  if (!result.ok) {
    return { ok: false, message: toUserMessage(result.error as AppError) };
  }

  if (businessId) {
    revalidatePath(`/app/imprese/${businessId}`);
  }
  revalidatePath("/app/imprese");
  return { ok: true, message: "Collegamento all'impresa concluso." };
}
