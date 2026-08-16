import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Account sospeso" };

export default function AccountSospesoPage() {
  return (
    <ErrorState
      title="Account sospeso"
      description="Il tuo account è sospeso. Le operazioni riservate non sono disponibili finché non viene riattivato."
      actionHref="/"
      actionLabel="Torna al sito pubblico"
    />
  );
}
