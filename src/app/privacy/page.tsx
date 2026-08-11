import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa sul trattamento dei dati personali di Immigrati Imprenditori.",
};

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      docId="privacy"
      title="Privacy Policy"
      description="Informativa sul trattamento dei dati personali."
    />
  );
}
