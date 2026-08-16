/** Type-only peer for the CS culture hub. Full services module remains Ponte. */
export type PublicServiceOfferListItem = {
  id: string;
  title: string;
  summary: string | null;
  category_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  availability_status: string;
  owner_person_id: string | null;
  owner_business_id: string | null;
};

export type PublicServiceRequestListItem = {
  id: string;
  title: string;
  summary: string | null;
  category_code: string;
  delivery_mode: string;
  audience_kind: string;
  economic_kind: string;
  process_status: string;
  owner_person_id: string | null;
  owner_business_id: string | null;
};
