import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Partecipa al Centro Studi",
  description:
    "Proponi storie, contributi di ricerca, interviste, eventi, pubblicazioni e altri materiali alla redazione di Immigrati Imprenditori.",
  pathname: "/contribuisci",
});

export default function ContributeLayout({ children }: { children: ReactNode }) {
  return children;
}
