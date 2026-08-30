import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Settori economici | Esplora",
  description:
    "Tassonomia dei settori economici utilizzata da Immigrati Imprenditori per organizzare dati e contenuti.",
  pathname: "/esplora/settori",
});

export default function SectorsLayout({ children }: { children: ReactNode }) {
  return children;
}
