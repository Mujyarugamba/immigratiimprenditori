import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Territori | Esplora",
  description:
    "Territori con dati, analisi, storie o eventi già pubblicati dal Centro Studi Immigrati Imprenditori.",
  pathname: "/esplora/territori",
});

export default function TerritoriesLayout({ children }: { children: ReactNode }) {
  return children;
}
