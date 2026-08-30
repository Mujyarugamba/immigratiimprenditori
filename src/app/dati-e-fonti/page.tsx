import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Fonti e metodologia";
const DESCRIPTION =
  "Fonti, metodologia, limiti e criteri di utilizzo dei dati pubblicati da Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/dati-e-fonti",
  }),
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
