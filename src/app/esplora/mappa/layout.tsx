import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Mappa dati | Osservatorio",
  description:
    "Visualizza geograficamente un indicatore pubblicato dall'Osservatorio di Immigrati Imprenditori senza mescolare definizioni statistiche differenti.",
  pathname: "/esplora/mappa",
});

export default function QuantitativeMapLayout({ children }: { children: ReactNode }) {
  return children;
}
