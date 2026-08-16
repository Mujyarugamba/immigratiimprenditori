import { EmptyState } from "@/components/ui/EmptyState";

type PublicEmptyProps = {
  title?: string;
  description?: string;
};

export function PublicEmpty({
  title = "Nessun risultato.",
  description,
}: PublicEmptyProps) {
  return <EmptyState title={title} description={description} />;
}
