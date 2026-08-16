/** Type-only peer for the CS culture hub. Full collaborations module remains Ponte. */
export type PublicCollaborationListItem = {
  id: string;
  slug: string;
  title: string;
  form_code: string;
  operational_status: string;
  object_text: string;
  purpose_text: string;
  activity_scope_code: string | null;
};
