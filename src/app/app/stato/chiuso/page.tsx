import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Account chiuso" };

export default function AccountChiusoPage() {
  return (
    <ErrorState
      title="Account chiuso"
      description="L'Account è in stato closed. La sessione applicativa non è operativa."
      actionHref="/"
      actionLabel="Torna al sito pubblico"
    />
  );
}
