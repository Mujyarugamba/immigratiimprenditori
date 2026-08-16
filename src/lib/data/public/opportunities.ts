import type { TemporalLabelCode } from "@/lib/opportunities/temporal-label";

/** Type-only peer for the CS culture hub. Full opportunities module remains Ponte. */
export type PublicOpportunityListItem = {
  id: string;
  title: string;
  summary: string | null;
  origin: string;
  substantial_status: string;
  platform_published_at: string | null;
  authority: string | null;
  territory: string | null;
  opensAt: string | null;
  closesAt: string | null;
  openEnded: boolean;
  temporalCode: TemporalLabelCode;
  temporalLabel: string;
  sourceLabel: string | null;
  officialUrl: string | null;
};
