import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { contentQualifiesForCultureHub } from "@/lib/data/public/culture";
import { relatedForContent } from "@/lib/data/public/related";
import { absoluteUrl } from "@/lib/i18n/seo";
import { CONTENT_TYPES, formatItalianDate, label } from "@/lib/public/labels";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content) return { title: "Non trovato", robots: { index: false, follow: false } };
  const canonical = `/contenuti/${content.slug}`;
  const description = content.abstract ?? undefined;
  return {
    title: content.title,
    description,
    alternates: { canonical },
    openGraph: { type: "article", url: canonical, title: content.title, description, publishedTime: content.published_at ?? undefined, images: content.cover_url ? [{ url: content.cover_url, alt: `Copertina di ${content.title}` }] : undefined },
    twitter: { card: content.cover_url ? "summary_large_image" : "summary", title: content.title, description, images: content.cover_url ? [content.cover_url] : undefined },
  };
}

function citationText(content: { title: string; slug: string; published_at: string | null; authors: Array<{ display_label: string | null }> }) {
  const year = content.published_at ? new Date(content.published_at).getFullYear() : new Date().getFullYear();
  const authors = content.authors.map((author) => author.display_label).filter(Boolean) as string[];
  const byline = authors.length > 0 ? authors.join(", ") : "Immigrati Imprenditori";
  return `${byline} (${year}). ${content.title}. Immigrati Imprenditori — Centro Studi AIPEL. ${absoluteUrl(`/contenuti/${content.slug}`)}`;
}

export default async function ContenutoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content) notFound();

  const isPlainText = content.body_format === "plain_text";
  const [related, showCulture] = await Promise.all([
    relatedForContent({ subject_links: content.subject_links, event_links: content.event_links, opportunity_links: content.opportunity_links }).catch(() => []),
    contentQualifiesForCultureHub({ primaryCategoryCode: content.primary_category_code, eventIds: content.event_links.map((l) => l.event_id) }).catch(() => false),
  ]);
  const authorNames = content.authors.map((author) => author.display_label).filter(Boolean) as string[];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["report", "research_report", "policy_brief", "working_paper", "dossier"].includes(content.type_code) ? "Report" : "Article",
    headline: content.title,
    description: content.abstract ?? undefined,
    datePublished: content.published_at ?? undefined,
    image: content.cover_url ?? undefined,
    url: absoluteUrl(`/contenuti/${content.slug}`),
    author: authorNames.length > 0 ? authorNames.map((name) => ({ "@type": "Person", name })) : { "@type": "Organization", name: "Immigrati Imprenditori" },
    publisher: { "@type": "Organization", name: "Immigrati Imprenditori — Centro Studi AIPEL", url: absoluteUrl("/") },
    isAccessibleForFree: true,
  };
  const breadcrumbSchema = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Analisi e ricerche", path: "/contenuti" },
    { name: content.title, path: `/contenuti/${content.slug}` },
  ]);

  return (
    <main className="ii-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="ii-detail-top">
        <nav className="ii-detail-nav"><Link href="/contenuti">← Analisi e ricerche</Link>{showCulture ? <Link href="/cultura">Cultura</Link> : null}</nav>
        <header className="ii-detail-header">
          <div className="ii-detail-badges flex flex-wrap gap-2"><Badge tone="brand">{label(CONTENT_TYPES, content.type_code)}</Badge>{content.is_featured ? <Badge tone="accent">In evidenza</Badge> : null}</div>
          <h1 className="ii-detail-title">{content.title}</h1>
          {content.abstract ? <p className="ii-detail-deck">{content.abstract}</p> : null}
          {authorNames.length > 0 ? <p className="ii-detail-byline mt-5 text-sm font-medium">Di {authorNames.join(", ")}</p> : null}
          {content.published_at ? <p className="ii-detail-date mt-2 text-sm">Pubblicato il {formatItalianDate(content.published_at)}</p> : null}
        </header>
      </section>

      {content.cover_url ? <img src={content.cover_url} alt={`Copertina di ${content.title}`} className="ii-detail-cover" /> : null}

      <div className="ii-detail-content">
        <section className="ii-detail-section"><h2>Testo</h2>{isPlainText ? <div className="ii-detail-prose">{content.body.split("\n\n").map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}</div> : <pre className="ii-detail-callout overflow-x-auto whitespace-pre-wrap text-sm leading-7">{content.body}</pre>}</section>
        {content.source_url ? <section className="ii-detail-section"><h2>Fonte</h2><a href={content.source_url} rel="noopener noreferrer" target="_blank" className="font-semibold text-[var(--ii-green)]">Apri la fonte originale →</a></section> : null}
        <section className="ii-detail-section"><h2>Come citare</h2><p className="ii-detail-callout text-sm leading-6">{citationText(content)}</p><div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold"><a href={`/contenuti/${content.slug}/citation.bib`}>Scarica BibTeX →</a><a href={`/contenuti/${content.slug}/citation.ris`}>Scarica RIS →</a></div></section>
        <RelatedLinks groups={related} />
      </div>
    </main>
  );
}
