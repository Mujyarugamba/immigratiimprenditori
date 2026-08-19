import { createClient } from "@/lib/supabase/server";

export type PublicTerritory = {
  id: string;
  country_code: string | null;
  level_kind: string;
  code: string | null;
  name: string;
  slug: string;
};

export type PublicMigrationRoute = {
  id: string;
  origin_country_code: string;
  destination_country_code: string;
  slug: string;
};

export async function listPublicTerritories(): Promise<PublicTerritory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("geo_territories")
    .select("id, country_code, level_kind, code, name, slug")
    .eq("is_active", true)
    .order("country_code", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicTerritory[];
}

export async function listPublicMigrationRoutes(): Promise<PublicMigrationRoute[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("migration_routes")
    .select("id, origin_country_code, destination_country_code, slug")
    .eq("is_active", true)
    .order("origin_country_code", { ascending: true })
    .order("destination_country_code", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicMigrationRoute[];
}
