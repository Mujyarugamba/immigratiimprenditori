import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Politica editoriale e correzioni";
const DESCRIPTION =
  "Principi editoriali, criteri sulle fonti e politica delle correzioni di Immigrati Imprenditori.";

export const metadata: Metadata = {
  alternates: { canonical: "/politica-editoriale" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/politica-editoriale",
  }),
};

export default function PoliticaEditorialeLayout({ children }: { children: ReactNode }) {
  return children;
}
