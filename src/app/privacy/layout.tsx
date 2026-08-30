import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

export const metadata: Metadata = pageSocialMetadata({
  title: "Privacy Policy",
  description: "Informativa sul trattamento dei dati personali di ImmigratiImprenditori.it.",
  pathname: "/privacy",
});

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
