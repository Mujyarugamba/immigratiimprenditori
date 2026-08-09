import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Account disabilitato" };

export default function AccountDisabilitatoPage() {
  return (
    <ErrorState
      title="Account disabilitato"
      description="Il tuo account è disabilitato. L'accesso all'area riservata non è disponibile."
      actionHref="/"
      actionLabel="Torna al sito pubblico"
    />
  );
}
