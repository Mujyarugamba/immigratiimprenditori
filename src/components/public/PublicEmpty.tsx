import { EmptyState } from "@/components/ui/EmptyState";

type PublicEmptyProps = {
  title?: string;
  description?: string;
};

export function PublicEmpty({
  title = "Nessun risultato pubblico",
  description = "Non ci sono contenuti pubblicati che corrispondono ai filtri. Prova a modificare la ricerca oppure torna più tardi.",
}: PublicEmptyProps) {
  return <EmptyState title={title} description={description} />;
}
