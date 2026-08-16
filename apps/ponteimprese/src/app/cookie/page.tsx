import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie e tecnologie di memorizzazione utilizzati da Immigrati Imprenditori.",
};

export default function CookiePage() {
  return (
    <LegalDocumentPage
      docId="cookie"
      title="Cookie Policy"
      description="Informazioni su cookie e tecnologie di memorizzazione."
    />
  );
}
