import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

export type PersonContactChannels = {
  person_id: string;
  phone: string | null;
  contact_email: string | null;
  share_phone_with_network: boolean;
  share_contact_email_with_network: boolean;
};

export type PersonContactUpdate = {
  phone?: string | null;
  contact_email?: string | null;
  share_phone_with_network?: boolean;
  share_contact_email_with_network?: boolean;
};

const SELECT =
  "person_id, phone, contact_email, share_phone_with_network, share_contact_email_with_network";

export async function getOwnPersonContact(
  personId: string,
): Promise<PersonContactChannels | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("person_contact_channels")
    .select(SELECT)
    .eq("person_id", personId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as PersonContactChannels;
}

export async function upsertOwnPersonContact(
  personId: string,
  patch: PersonContactUpdate,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const row = {
    person_id: personId,
    phone: normalizeOptionalText(patch.phone),
    contact_email: normalizeOptionalText(patch.contact_email),
    share_phone_with_network: Boolean(patch.share_phone_with_network),
    share_contact_email_with_network: Boolean(
      patch.share_contact_email_with_network,
    ),
  };

  const { error } = await supabase
    .from("person_contact_channels")
    .upsert(row, { onConflict: "person_id" });

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export type NetworkPersonContact = {
  phone: string | null;
  contact_email: string | null;
};

/** Anon-safe: whether to show “Accedi per vedere i contatti” (no values). */
export async function personHasSharedNetworkContact(
  personId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "person_has_shared_network_contact",
    { p_person_id: personId },
  );
  if (error) return false;
  return Boolean(data);
}

/** Registered active accounts only — RPC masks unshared fields. */
export async function getNetworkPersonContact(
  personId: string,
): Promise<NetworkPersonContact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("person_contact_network_get", {
    p_person_id: personId,
  });

  if (error || !data) {
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    return null;
  }

  const phone =
    "phone" in row && typeof row.phone === "string" ? row.phone : null;
  const contact_email =
    "contact_email" in row && typeof row.contact_email === "string"
      ? row.contact_email
      : null;

  if (!phone && !contact_email) {
    return null;
  }

  return { phone, contact_email };
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}
