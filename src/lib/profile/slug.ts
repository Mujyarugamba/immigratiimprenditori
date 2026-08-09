import { slugify } from "@/lib/editorial/slug";

/** Public path prefix for a person profile address (routing may land later). */
export const PERSON_PUBLIC_PATH_PREFIX = "/persone/";

/**
 * Propose a profile address from display name.
 * Only for empty/undefined current slug — never overwrite an existing one.
 */
export function suggestProfileSlugFromDisplayName(
  displayName: string,
  currentSlug: string | null | undefined,
): string | null {
  if (currentSlug?.trim()) return null;
  const suggested = slugify(displayName);
  return suggested || null;
}

/** Matches profiles.slug CHECK after DB normalize_profile_slug. */
export function isValidProfileSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
