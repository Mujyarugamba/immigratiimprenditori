import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Termini d’uso",
  description: "Condizioni di utilizzo della piattaforma Immigrati Imprenditori.",
};

export default function TerminiPage() {
  return (
    <LegalDocumentPage
      docId="termini"
      title="Termini d’uso"
      description="Condizioni di utilizzo della piattaforma."
    />
  );
}
