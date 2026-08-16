/** Type-only peer for the CS culture hub. Full public businesses module remains Ponte. */
export type PublicBusinessListItem = {
  id: string;
  public_name: string;
  legal_name: string;
  summary: string | null;
  organization_form: string | null;
  substantial_status: string;
  founding_year: number | null;
};
