import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Account disabilitato" };

export default function AccountDisabilitatoPage() {
  return (
    <ErrorState
      title="Account disabilitato"
      description="L'Account è in stato disabled. L'accesso applicativo non è operativo."
      actionHref="/"
      actionLabel="Torna al sito pubblico"
    />
  );
}
