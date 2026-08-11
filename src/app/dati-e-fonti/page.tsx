import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Dati e fonti esterne",
  description:
    "Informativa e disclaimer su dati, open data, opportunità e fonti esterne.",
};

export default function DatiEFontiPage() {
  return (
    <LegalDocumentPage
      docId="datiEFonti"
      title="Dati e fonti esterne"
      description="Provenienza, limiti e riuso di dati e fonti esterne."
    />
  );
}
