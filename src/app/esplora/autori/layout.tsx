import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Autori e contributori | Esplora",
  description:
    "Profili pubblici revisionati di autori e contributori del Centro Studi Immigrati Imprenditori.",
  pathname: "/esplora/autori",
});

export default function AuthorsLayout({ children }: { children: ReactNode }) {
  return children;
}
