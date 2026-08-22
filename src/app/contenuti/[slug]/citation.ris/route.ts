import { getPublicContentBySlug } from "@/lib/data/public/contents";

function risLine(tag: string, value: string | null | undefined) {
  if (!value) return "";
  return `${tag}  - ${value.replace(/[\r\n]+/g, " ").trim()}\r\n`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const content = await getPublicContentBySlug(slug);
  if (!content) return new Response("Not found", { status: 404 });

  const authors = content.authors
    .map((author) => author.display_label?.trim())
    .filter((value): value is string => Boolean(value));
  const published = content.published_at ? new Date(content.published_at) : null;
  const year = published ? String(published.getFullYear()) : "2026";
  const url = `https://immigratiimprenditori.it/contenuti/${content.slug}`;
  const reportLike = ["report", "research_report", "policy_brief", "working_paper", "dossier"].includes(
    content.type_code,
  );

  let ris = `TY  - ${reportLike ? "RPRT" : "ELEC"}\r\n`;
  ris += risLine("TI", content.title);
  for (const author of authors.length > 0 ? authors : ["Immigrati Imprenditori"]) {
    ris += risLine("AU", author);
  }
  ris += risLine("PY", year);
  ris += risLine("PB", "Immigrati Imprenditori — Centro Studi AIPEL");
  ris += risLine("UR", url);
  ris += risLine("AB", content.abstract);
  ris += "ER  - \r\n";

  return new Response(ris, {
    headers: {
      "Content-Type": "application/x-research-info-systems; charset=utf-8",
      "Content-Disposition": `attachment; filename="${content.slug}.ris"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
