import { createClient } from "@/lib/supabase/server";
import {
  getExplorerSnapshot,
  type ExplorerIndicator,
  type ExplorerValue,
} from "@/lib/data/public/explore";
import type { AtlasIndicatorEvidence } from "@/lib/data/public/atlas";

export type PublicSector = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type SectorDetail = {
  sector: PublicSector;
  dataValueCount: number;
  indicatorCount: number;
  indicators: AtlasIndicatorEvidence[];
  hasEvidence: boolean;
};

function indicatorEvidence(
  indicators: ExplorerIndicator[],
  values: ExplorerValue[],
): AtlasIndicatorEvidence[] {
  const grouped = new Map<string, ExplorerValue[]>();
  for (const value of values) {
    const current = grouped.get(value.indicator_id) ?? [];
    current.push(value);
    grouped.set(value.indicator_id, current);
  }
  return indicators
    .filter((indicator) => grouped.has(indicator.id))
    .map((indicator) => ({
      indicator,
      values: (grouped.get(indicator.id) ?? []).sort(
        (a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime(),
      ),
    }));
}

export async function getSectorDetail(slug: string): Promise<SectorDetail | null> {
  const supabase = await createClient();
  const [sectorResult, snapshot] = await Promise.all([
    supabase
      .from("business_sectors")
      .select("id, slug, name, description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle(),
    getExplorerSnapshot(),
  ]);

  if (sectorResult.error) throw new Error(sectorResult.error.message);
  if (!sectorResult.data) return null;

  const sector = sectorResult.data as PublicSector;
  const values = snapshot.values.filter(
    (value) => value.business_sector_id === sector.id,
  );
  const indicators = indicatorEvidence(snapshot.indicators, values);
  return {
    sector,
    dataValueCount: values.length,
    indicatorCount: indicators.length,
    indicators,
    hasEvidence: values.length > 0,
  };
}
