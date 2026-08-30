import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Sostieni il Centro Studi";
const DESCRIPTION =
  "Sostieni ImmigratiImprenditori.it e il lavoro del Centro Studi AIPEL su dati, analisi e testimonianze dell'imprenditoria migrante.";

export const metadata: Metadata = {
  alternates: { canonical: "/sostieni" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/sostieni",
  }),
};

export default function SostieniLayout({ children }: { children: ReactNode }) {
  return children;
}
