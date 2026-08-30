import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Cookie Policy";
const DESCRIPTION =
  "Informazioni sui cookie e sugli strumenti tecnici utilizzati da ImmigratiImprenditori.it.";

export const metadata: Metadata = {
  alternates: { canonical: "/cookie" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/cookie",
  }),
};

export default function CookieLayout({ children }: { children: ReactNode }) {
  return children;
}
