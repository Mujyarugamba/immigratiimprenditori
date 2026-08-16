import type { ReactNode } from "react";

type Props = {
  markdown: string;
};

/**
 * Minimal markdown renderer for legal pages (headings, paragraphs, lists, tables, links, bold).
 * No HTML passthrough.
 */
export function LegalMarkdown({ markdown }: Props) {
  const blocks = splitBlocks(markdown);
  return (
    <div className="legal-prose space-y-5 text-sm leading-7 text-ink-muted">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" };

function Block({ block }: { block: Block }) {
  if (block.type === "hr") {
    return <hr className="border-line my-6" />;
  }
  if (block.type === "h1") {
    return (
      <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
        {inline(block.text)}
      </h1>
    );
  }
  if (block.type === "h2") {
    return (
      <h2 className="text-ink pt-2 text-xl font-semibold tracking-tight">
        {inline(block.text)}
      </h2>
    );
  }
  if (block.type === "h3") {
    return (
      <h3 className="text-ink text-base font-semibold tracking-tight">
        {inline(block.text)}
      </h3>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="border-line w-full border-collapse border text-left text-sm">
          <thead>
            <tr className="bg-surface-muted">
              {block.headers.map((h, i) => (
                <th key={i} className="border-line text-ink border px-3 py-2 font-medium">
                  {inline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-line border px-3 py-2 align-top">
                    {inline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <p>{inline(block.text)}</p>;
}

function splitBlocks(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.trim() === "---") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i += 1;
      continue;
    }
    if (line.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const headers = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("|")) {
        rows.push(splitRow(lines[i] ?? ""));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }
    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("- ")) {
        items.push((lines[i] ?? "").trim().slice(2));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !(lines[i] ?? "").startsWith("#") &&
      !(lines[i] ?? "").trim().startsWith("- ") &&
      !(lines[i] ?? "").trim().startsWith("|") &&
      (lines[i] ?? "").trim() !== "---"
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ").trim() });
  }
  return blocks;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function inline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index));
    }
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="text-ink font-medium">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = m[2] ?? "";
      const href = m[3] ?? "#";
      parts.push(
        <a
          key={key++}
          href={href}
          className="text-brand hover:text-brand-dark underline-offset-2 hover:underline"
        >
          {label}
        </a>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length ? parts : text;
}
