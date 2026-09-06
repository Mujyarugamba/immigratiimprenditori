import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { loadPublicLegalMarkdown } from "@/lib/legal/load-public-document";
import type { LegalDocId } from "@/lib/legal/versions";

type Props = {
  docId: LegalDocId;
  title: string;
  description: string;
};

export function LegalDocumentPage({ docId, title, description }: Props) {
  const markdown = loadPublicLegalMarkdown(docId);
  return (
    <main className="preview-legal-page">
      <header className="preview-legal-hero">
        <div className="preview-legal-hero-inner">
          <p className="legal-kicker">Centro Studi · Metodo e trasparenza</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <div className="preview-legal-content">
        <div className="preview-legal-markdown">
          <LegalMarkdown markdown={markdown} />
        </div>
      </div>
    </main>
  );
}
