import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "API pubblica v1 | Open data",
  description:
    "Documentazione dell'API pubblica v1 di Immigrati Imprenditori per indicatori, Atlante, contesto di ricerca verificabile e relazioni del Knowledge Graph.",
  pathname: "/open-data/api",
});

export default function PublicApiDocsLayout({ children }: { children: ReactNode }) {
  return children;
}
