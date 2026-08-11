import {
  PROFILE_SELF_EDITABLE_FIELDS,
  type ProfileSelfUpdate,
} from "@/types/business";

/** Whitelist payload to Access A4.2 column grants. */
export function pickProfileSelfUpdate(
  input: Record<string, unknown>,
): ProfileSelfUpdate {
  const out: ProfileSelfUpdate = {};
  for (const key of PROFILE_SELF_EDITABLE_FIELDS) {
    if (!(key in input)) continue;
    const value = input[key];
    if (key === "is_public") {
      out.is_public = value === true || value === "true" || value === "on";
      continue;
    }
    // phone / contact_email live on person_contact_channels (L1.1b), not profiles.
    if (value === undefined) continue;
    if (value === null || value === "") {
      if (key === "display_name" || key === "slug") continue;
      (out as Record<string, unknown>)[key] = null;
      continue;
    }
    (out as Record<string, unknown>)[key] = String(value);
  }
  return out;
}
