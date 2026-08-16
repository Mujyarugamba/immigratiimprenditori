/** Type-only peer for the CS culture hub. Catalog organizations remain mixed (S2-GATE-ORG). */
export type PublicOrganizationListItem = {
  id: string;
  slug: string;
  name: string;
  type_code: string;
  primary_scope_code: string | null;
  summary: string | null;
  seat_city_label: string | null;
};
