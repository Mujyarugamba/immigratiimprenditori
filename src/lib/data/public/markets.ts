/** Type-only peer for the CS culture hub. Full markets module remains Ponte. */
export type PublicMarketListItem = {
  id: string;
  code: string;
  name: string;
  market_kind: string;
  substantial_status: string;
  summary: string | null;
};
