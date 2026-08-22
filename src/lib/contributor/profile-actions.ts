"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LIMITS = {
  displayName: 160,
  bio: 4000,
  organization: 240,
  organizationType: 120,
  role: 240,
  city: 120,
  province: 120,
  region: 120,
  country: 120,
  website: 2048,
  phone: 80,
} as const;

function field(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function updateContributorProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accedi?next=/app/contributore/profilo");

  const displayName = field(formData, "display_name");
  const bio = field(formData, "bio");
  const organizationName = field(formData, "organization_name");
  const organizationType = field(formData, "organization_type");
  const roleDescription = field(formData, "role_description");
  const city = field(formData, "city");
  const province = field(formData, "province");
  const region = field(formData, "region");
  const country = field(formData, "country") ?? "Italia";
  const websiteRaw = field(formData, "website");
  const phone = field(formData, "phone");
  const isPublic = formData.get("is_public") === "on";
  const website = safeHttpUrl(websiteRaw);

  if (
    !displayName ||
    displayName.length > LIMITS.displayName ||
    (bio?.length ?? 0) > LIMITS.bio ||
    (organizationName?.length ?? 0) > LIMITS.organization ||
    (organizationType?.length ?? 0) > LIMITS.organizationType ||
    (roleDescription?.length ?? 0) > LIMITS.role ||
    (city?.length ?? 0) > LIMITS.city ||
    (province?.length ?? 0) > LIMITS.province ||
    (region?.length ?? 0) > LIMITS.region ||
    country.length > LIMITS.country ||
    (websiteRaw?.length ?? 0) > LIMITS.website ||
    (websiteRaw && !website) ||
    (phone?.length ?? 0) > LIMITS.phone
  ) {
    redirect("/app/contributore/profilo?errore=campi");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      bio,
      organization_name: organizationName,
      organization_type: organizationType,
      role_description: roleDescription,
      city,
      province,
      region,
      country,
      website,
      phone,
      is_public: isPublic,
      published_at: isPublic ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) redirect("/app/contributore/profilo?errore=salvataggio");

  revalidatePath("/app/contributore/profilo");
  revalidatePath("/contributori");
  redirect("/app/contributore/profilo?salvato=1");
}
