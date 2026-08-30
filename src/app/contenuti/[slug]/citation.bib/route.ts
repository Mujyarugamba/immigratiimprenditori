import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { absoluteUrl } from "@/lib/i18n/seo";

function bibEscape(value: string) {
  return value.replaceAll("{", "\\{").replaceAll("}", "\\}");
}

function bibKey(title: string, year: string) {
  const token = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "")
    .slice(0, 24);
  return `ImmigratiImprenditori${year}${token || "Content"}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const content = await getPublicContentBySlug(slug);
  if (!content) return new Response("Not found", { status: 404 });

  const year = content.published_at ? String(new Date(content.published_at).getFullYear()) : "2026";
  const authors = content.authors.map((author) => author.display_label).filter(Boolean) as string[];
  const author = authors.length > 0 ? authors.join(" and ") : "Immigrati Imprenditori";
  const url = absoluteUrl(`/contenuti/${content.slug}`);
  const entryType = ["report", "research_report", "policy_brief"].includes(content.type_code) ? "techreport" : "online";

  const bib = `@${entryType}{${bibKey(content.title, year)},\n  author = {${bibEscape(author)}},\n  title = {${bibEscape(content.title)}},\n  year = {${year}},\n  institution = {Immigrati Imprenditori — Centro Studi AIPEL},\n  url = {${url}}\n}\n`;

  return new Response(bib, {
    headers: {
      "Content-Type": "application/x-bibtex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${content.slug}.bib"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
