import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Fonti e metodologia",
  description:
    "Fonti, metodologia, limiti e criteri di utilizzo dei dati pubblicati da Immigrati Imprenditori.",
};

export default function DatiEFontiPage() {
  return (
    <LegalDocumentPage
      docId="datiEFonti"
      title="Fonti e metodologia"
      description="Fonti, criteri, limiti e metodologia dei dati e dei contenuti pubblicati."
    />
  );
}
