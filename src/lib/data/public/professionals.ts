/** Type-only peer for the CS culture hub. Full professionals module remains Ponte. */
export type PublicProfessionalListItem = {
  id: string;
  headline: string | null;
  summary: string | null;
  practice_mode_code: string | null;
  availability_status: string;
  person_id: string;
  context_business_id: string | null;
};
