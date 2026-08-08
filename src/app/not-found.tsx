import { ErrorState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <ErrorState
      title="Pagina non trovata"
      description="La risorsa richiesta non esiste o non è disponibile."
      actionHref="/"
      actionLabel="Torna alla home"
    />
  );
}
