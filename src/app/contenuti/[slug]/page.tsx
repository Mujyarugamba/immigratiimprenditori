import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/public/MarkdownArticle";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { listRelatedContents } from "@/lib/data/public/content-relations";
import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { contentQualifiesForCultureHub } from "@/lib/data/public/culture";
import { relatedForContent } from "@/lib/data/public/related";
import { getSiteUrl } from "@/lib/env";
import { DEFAULT_LANGUAGE_TAG, localizedPath } from "@/lib/i18n/config";
import { CONTENT_TYPES, formatItalianDate, label } from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function publicCanonicalPath(slug: string): string {
  return localizedPath(`/contenuti/${encodeURIComponent(slug)}`);
}

function absoluteAssetUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const origin = getSiteUrl();
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content) return { title: "Non trovato", robots: { index: false, follow: false } };

  const isPublic =
    content.publication_status === "published" && content.visibility_status === "public";
  if (!isPublic) {
    return {
      title: `Anteprima — ${content.title}`,
      description: content.abstract ?? undefined,
      robots: { index: false, follow: false },
    };
  }

  const canonical = publicCanonicalPath(content.slug);
  const image = absoluteAssetUrl(content.cover_url);
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
      locale: "it_IT",
      publishedTime: content.published_at ?? undefined,
      images: image ? [{ url: image, alt: content.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: content.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ContenutoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content) notFound();

  const isPublic =
    content.publication_status === "published" && content.visibility_status === "public";
  const isPlainText = content.body_format === "plain_text";
  const visibleAuthors = content.authors.filter((author) => Boolean(author.display_label));
  const [related, relatedContents, showCulture] = await Promise.all([
    relatedForContent({
      subject_links: content.subject_links,
      event_links: content.event_links,
      opportunity_links: content.opportunity_links,
    }).catch(() => []),
    listRelatedContents(content.id).catch(() => []),
    contentQualifiesForCultureHub({
      primaryCategoryCode: content.primary_category_code,
      eventIds: content.event_links.map((link) => link.event_id),
    }).catch(() => false),
  ]);

  const relatedGroups = relatedContents.length > 0
    ? [{ title: "Approfondimenti e fonti", links: relatedContents }, ...related]
    : related;

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${publicCanonicalPath(content.slug)}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    headline: content.title,
    description: content.abstract ?? undefined,
    datePublished: content.published_at ?? undefined,
    inLanguage: DEFAULT_LANGUAGE_TAG,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    image: absoluteAssetUrl(content.cover_url),
    isBasedOn: content.source_url ?? undefined,
    author: visibleAuthors.length > 0
      ? visibleAuthors.map((author) => ({
          "@type": author.person_id ? "Person" : "Organization",
          name: author.display_label,
        }))
      : undefined,
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  return (
    <main id="contenuto">
      <Section>
        {isPublic ? <JsonLd data={articleJsonLd} /> : null}
        <Container className="max-w-3xl space-y-8">
          {!isPublic ? (
            <aside className="border-2 border-black bg-neutral-100 p-4" role="status">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
                Anteprima privata
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                Questo contenuto non è pubblicato e non è visibile agli utenti anonimi.
              </p>
              <Link
                href={`/app/redazione/contenuti/${content.id}`}
                className="mt-3 inline-block text-sm font-semibold text-black underline underline-offset-4"
              >
                Torna alla modifica in redazione
              </Link>
            </aside>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/contenuti" className="text-brand hover:text-brand-dark text-sm font-medium">← Torna a notizie e guide</Link>
            {showCulture ? <Link href="/cultura" className="text-brand hover:text-brand-dark text-sm font-medium">Esplora Cultura</Link> : null}
          </div>

          <header className="space-y-4 border-b border-black pb-7">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{label(CONTENT_TYPES, content.type_code)}</Badge>
              {content.is_featured ? <Badge tone="accent">In evidenza</Badge> : null}
            </div>
            <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">{content.title}</h1>
            {content.abstract ? <p className="text-ink-muted text-lg leading-7">{content.abstract}</p> : null}
            {visibleAuthors.length > 0 ? (
              <p className="text-sm font-medium text-neutral-700">
                Di {visibleAuthors.map((author) => author.display_label).join(", ")}
              </p>
            ) : null}
            {content.published_at ? <p className="text-ink-muted text-sm">Pubblicato il {formatItalianDate(content.published_at)}</p> : null}
          </header>

          {content.cover_url ? (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.cover_url} alt="" className="border-line max-h-[32rem] w-full border object-cover" />
            </figure>
          ) : null}

          <article aria-label="Articolo">
            {isPlainText ? (
              <div className="space-y-5 text-[0.98rem] leading-7 text-neutral-800">
                {content.body.split("\n\n").map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}
              </div>
            ) : (
              <MarkdownArticle markdown={content.body} />
            )}
          </article>

          {content.source_url ? (
            <section className="border-t border-neutral-300 pt-6">
              <h2 className="text-ink text-lg font-semibold">Fonte originale</h2>
              <a href={content.source_url} className="mt-3 inline-block text-sm font-medium text-black underline underline-offset-4" rel="noopener noreferrer" target="_blank">Consulta la fonte →</a>
            </section>
          ) : null}

          <RelatedLinks groups={relatedGroups} />
        </Container>
      </Section>
    </main>
  );
}
