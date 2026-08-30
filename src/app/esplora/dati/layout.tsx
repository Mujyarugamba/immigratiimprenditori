import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Data Explorer | Osservatorio",
  description:
    "Esplora e filtra i valori pubblicati dall'Osservatorio di Immigrati Imprenditori per indicatore, territorio, periodo, settore e categoria.",
  pathname: "/esplora/dati",
});

export default function DataExplorerLayout({ children }: { children: ReactNode }) {
  return children;
}
