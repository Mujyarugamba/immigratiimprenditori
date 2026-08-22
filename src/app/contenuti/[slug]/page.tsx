import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { contentQualifiesForCultureHub } from "@/lib/data/public/culture";
import { relatedForContent } from "@/lib/data/public/related";
import { CONTENT_TYPES, formatItalianDate, label } from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content) {
    return { title: "Non trovato", robots: { index: false, follow: false } };
  }

  const canonical = `/contenuti/${content.slug}`;
  const description = content.abstract ?? undefined;

  return {
    title: content.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: content.title,
      description,
      publishedTime: content.published_at ?? undefined,
      images: content.cover_url
        ? [{ url: content.cover_url, alt: `Copertina di ${content.title}` }]
        : undefined,
    },
    twitter: {
      card: content.cover_url ? "summary_large_image" : "summary",
      title: content.title,
      description,
      images: content.cover_url ? [content.cover_url] : undefined,
    },
  };
}

function citationText(content: {
  title: string;
  slug: string;
  published_at: string | null;
  authors: Array<{ display_label: string | null }>;
}) {
  const year = content.published_at ? new Date(content.published_at).getFullYear() : new Date().getFullYear();
  const authors = content.authors.map((author) => author.display_label).filter(Boolean) as string[];
  const byline = authors.length > 0 ? authors.join(", ") : "Immigrati Imprenditori";
  return `${byline} (${year}). ${content.title}. Immigrati Imprenditori — Centro Studi AIPEL. https://immigratiimprenditori.it/contenuti/${content.slug}`;
}

export default async function ContenutoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const isPlainText = content.body_format === "plain_text";
  const [related, showCulture] = await Promise.all([
    relatedForContent({
      subject_links: content.subject_links,
      event_links: content.event_links,
      opportunity_links: content.opportunity_links,
    }).catch(() => []),
    contentQualifiesForCultureHub({
      primaryCategoryCode: content.primary_category_code,
      eventIds: content.event_links.map((l) => l.event_id),
    }).catch(() => false),
  ]);

  const authorNames = content.authors.map((author) => author.display_label).filter(Boolean) as string[];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["report", "research_report", "policy_brief"].includes(content.type_code) ? "Report" : "Article",
    headline: content.title,
    description: content.abstract ?? undefined,
    datePublished: content.published_at ?? undefined,
    image: content.cover_url ?? undefined,
    url: `https://immigratiimprenditori.it/contenuti/${content.slug}`,
    author:
      authorNames.length > 0
        ? authorNames.map((name) => ({ "@type": "Person", name }))
        : { "@type": "Organization", name: "Immigrati Imprenditori" },
    publisher: {
      "@type": "Organization",
      name: "Immigrati Imprenditori — Centro Studi AIPEL",
      url: "https://immigratiimprenditori.it",
    },
    isAccessibleForFree: true,
  };

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/contenuti" className="text-brand hover:text-brand-dark text-sm font-medium">
            ← Torna ad analisi e ricerche
          </Link>
          {showCulture ? (
            <Link href="/cultura" className="text-brand hover:text-brand-dark text-sm font-medium">Esplora Cultura</Link>
          ) : null}
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{label(CONTENT_TYPES, content.type_code)}</Badge>
            {content.is_featured ? <Badge tone="accent">In evidenza</Badge> : null}
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">{content.title}</h1>
          {content.abstract ? <p className="text-ink-muted text-lg leading-7">{content.abstract}</p> : null}
          {authorNames.length > 0 ? (
            <p className="text-ink text-sm font-medium">Di {authorNames.join(", ")}</p>
          ) : null}
          {content.published_at ? (
            <p className="text-ink-muted text-sm">Pubblicato il {formatItalianDate(content.published_at)}</p>
          ) : null}
        </header>

        {content.cover_url ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Copertina</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.cover_url} alt={`Copertina di ${content.title}`} className="border-line max-h-80 w-full rounded-md border object-cover" />
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Testo</h2>
          {isPlainText ? (
            <div className="text-ink-muted space-y-4 text-sm leading-7">
              {content.body.split("\n\n").map((paragraph, index) => (
                <p key={index} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          ) : (
            <pre className="text-ink-muted bg-surface-elevated border-line overflow-x-auto rounded-md border p-4 text-sm leading-7 whitespace-pre-wrap">{content.body}</pre>
          )}
        </section>

        {content.source_url ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Fonte</h2>
            <a href={content.source_url} className="text-brand hover:text-brand-dark text-sm font-medium underline-offset-2 hover:underline" rel="noopener noreferrer" target="_blank">
              Apri la fonte originale
            </a>
          </section>
        ) : null}

        <section className="space-y-3 border-t border-black pt-6">
          <h2 className="text-ink text-xl font-semibold">Come citare</h2>
          <p className="border-line bg-surface-elevated rounded-md border p-4 text-sm leading-6 text-neutral-700">
            {citationText(content)}
          </p>
          <a href={`/contenuti/${content.slug}/citation.bib`} className="inline-block text-sm font-semibold underline underline-offset-4">
            Scarica BibTeX →
          </a>
        </section>

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
