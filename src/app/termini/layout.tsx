import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Termini di utilizzo";
const DESCRIPTION = "Termini di utilizzo di ImmigratiImprenditori.it, Centro Studi AIPEL.";

export const metadata: Metadata = {
  alternates: { canonical: "/termini" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/termini",
  }),
};

export default function TerminiLayout({ children }: { children: ReactNode }) {
  return children;
}
