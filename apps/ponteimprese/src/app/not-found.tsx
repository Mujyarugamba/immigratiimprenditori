import { ErrorState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <ErrorState
      title="Pagina non trovata"
      description="La pagina richiesta non esiste o non è più disponibile."
      actionHref="/"
      actionLabel="Torna alla home"
    />
  );
}
