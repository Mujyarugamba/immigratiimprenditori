import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Chi siamo | Immigrati Imprenditori";
const DESCRIPTION =
  "Immigrati Imprenditori è il Centro Studi promosso da AIPEL per studiare, misurare e raccontare l'imprenditoria migrante tra Paesi e territori.";

export const metadata: Metadata = {
  alternates: { canonical: "/chi-siamo" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/chi-siamo",
  }),
};

export default function ChiSiamoLayout({ children }: { children: ReactNode }) {
  return children;
}
