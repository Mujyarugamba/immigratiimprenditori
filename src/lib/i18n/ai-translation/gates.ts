export type PublicContentGateInput = {
  editorial_status?: string | null;
  publication_status?: string | null;
  visibility_status?: string | null;
  archived_at?: string | null;
};

export function isPublicEditorialContent(content: PublicContentGateInput | null | undefined): boolean {
  if (!content) return false;
  return (
    content.editorial_status === "ready" &&
    content.publication_status === "published" &&
    content.visibility_status === "public" &&
    content.archived_at == null
  );
}
