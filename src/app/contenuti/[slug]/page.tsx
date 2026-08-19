import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/public/MarkdownArticle";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { listRelatedContents } from "@/lib/data/public/content-relations";
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
  if (!content) return { title: "Non trovato" };
  return { title: content.title, description: content.abstract ?? undefined };
}

export default async function ContenutoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content) notFound();

  const isPlainText = content.body_format === "plain_text";
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

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
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
  );
}
