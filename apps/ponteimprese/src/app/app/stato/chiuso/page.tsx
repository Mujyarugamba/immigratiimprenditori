import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Account chiuso" };

export default function AccountChiusoPage() {
  return (
    <ErrorState
      title="Account chiuso"
      description="Il tuo account è chiuso. L'accesso all'area riservata non è più disponibile."
      actionHref="/"
      actionLabel="Torna al sito pubblico"
    />
  );
}
