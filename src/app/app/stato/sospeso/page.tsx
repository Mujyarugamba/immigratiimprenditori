import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Account sospeso" };

export default function AccountSospesoPage() {
  return (
    <ErrorState
      title="Account sospeso"
      description="L'Account è in stato suspended. Le operazioni riservate non sono disponibili."
      actionHref="/"
      actionLabel="Torna al sito pubblico"
    />
  );
}
