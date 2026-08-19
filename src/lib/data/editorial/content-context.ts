import { createClient } from "@/lib/supabase/server";

export type EditorialContentGeography = {
  id: string;
  country_code: string;
  relation_kind: "focus" | "origin" | "destination" | "context";
  sort_order: number;
};

export type EditorialContentSector = {
  id: string;
  business_sector_id: number;
  relation_kind: "focus" | "related";
  sort_order: number;
  sector_name: string;
  sector_slug: string;
};

export async function listEditorialContentGeographies(
  contentId: string,
): Promise<EditorialContentGeography[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_geographies")
    .select("id, country_code, relation_kind, sort_order")
    .eq("content_id", contentId)
    .not("country_code", "is", null)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id as string,
    country_code: row.country_code as string,
    relation_kind: row.relation_kind as EditorialContentGeography["relation_kind"],
    sort_order: Number(row.sort_order),
  }));
}

export async function listEditorialContentSectors(
  contentId: string,
): Promise<EditorialContentSector[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_sectors")
    .select(
      "id, business_sector_id, relation_kind, sort_order, business_sectors ( slug, name )",
    )
    .eq("content_id", contentId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data ?? []).map((row) => {
    const sector = Array.isArray(row.business_sectors)
      ? row.business_sectors[0]
      : row.business_sectors;
    return {
      id: row.id as string,
      business_sector_id: Number(row.business_sector_id),
      relation_kind: row.relation_kind as EditorialContentSector["relation_kind"],
      sort_order: Number(row.sort_order),
      sector_name: sector?.name ?? String(row.business_sector_id),
      sector_slug: sector?.slug ?? String(row.business_sector_id),
    };
  });
}
