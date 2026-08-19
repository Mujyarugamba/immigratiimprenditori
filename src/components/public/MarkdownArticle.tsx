import type { ReactNode } from "react";

type MarkdownArticleProps = {
  markdown: string;
};

type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "code"; value: string }
  | { kind: "link"; label: string; href: string };

const INLINE_TOKEN_RE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s<]+)/g;

function safeHttpUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function tokenizeMarkdownInline(value: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;

  for (const match of value.matchAll(INLINE_TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push({ kind: "text", value: value.slice(cursor, index) });
    const raw = match[0];

    if (raw.startsWith("**") && raw.endsWith("**")) {
      tokens.push({ kind: "strong", value: raw.slice(2, -2) });
    } else if (raw.startsWith("`") && raw.endsWith("`")) {
      tokens.push({ kind: "code", value: raw.slice(1, -1) });
    } else if (raw.startsWith("[")) {
      const close = raw.indexOf("](");
      const label = raw.slice(1, close);
      const href = safeHttpUrl(raw.slice(close + 2, -1));
      tokens.push(href ? { kind: "link", label, href } : { kind: "text", value: raw });
    } else {
      const trailing = raw.match(/[.,;:!?]+$/)?.[0] ?? "";
      const candidate = trailing ? raw.slice(0, -trailing.length) : raw;
      const href = safeHttpUrl(candidate);
      if (href) {
        tokens.push({ kind: "link", label: candidate, href });
        if (trailing) tokens.push({ kind: "text", value: trailing });
      } else {
        tokens.push({ kind: "text", value: raw });
      }
    }
    cursor = index + raw.length;
  }

  if (cursor < value.length) tokens.push({ kind: "text", value: value.slice(cursor) });
  return tokens;
}

function renderInline(value: string, keyPrefix: string): ReactNode[] {
  return tokenizeMarkdownInline(value).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.kind === "strong") return <strong key={key} className="font-semibold text-black">{token.value}</strong>;
    if (token.kind === "code") return <code key={key} className="border border-neutral-300 bg-neutral-50 px-1 py-0.5 font-mono text-[0.92em] text-black">{token.value}</code>;
    if (token.kind === "link") return <a key={key} href={token.href} target="_blank" rel="noopener noreferrer" className="font-medium text-black underline underline-offset-4">{token.label}</a>;
    return token.value;
  });
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const parts = cells(line);
  return parts.length > 0 && parts.every((part) => /^:?-{3,}:?$/.test(part));
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";
  if (!line.trim()) return true;
  if (/^#{1,4}\s+/.test(line) || /^```/.test(line) || /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line) || /^\s*>\s?/.test(line) || /^\s*([-*_])\1\1+\s*$/.test(line)) return true;
  return Boolean(lines[index + 1] && line.includes("|") && isTableSeparator(lines[index + 1]));
}

function heading(level: number, children: ReactNode[], key: string) {
  if (level === 1) return <h2 key={key} className="mt-10 text-2xl font-semibold tracking-tight text-black">{children}</h2>;
  if (level === 2) return <h2 key={key} className="mt-10 text-2xl font-semibold tracking-tight text-black">{children}</h2>;
  if (level === 3) return <h3 key={key} className="mt-8 text-xl font-semibold text-black">{children}</h3>;
  return <h4 key={key} className="mt-6 text-base font-semibold text-black">{children}</h4>;
}

export function MarkdownArticle({ markdown }: MarkdownArticleProps) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockIndex = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trimEnd();
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push(heading(headingMatch[1].length, renderInline(headingMatch[2], `h-${blockIndex}`), `h-${blockIndex}`));
      blockIndex += 1;
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        <pre key={`code-${blockIndex}`} className="overflow-x-auto border border-neutral-300 bg-neutral-50 p-4 text-sm leading-6 text-black">
          <code data-language={language || undefined}>{code.join("\n")}</code>
        </pre>,
      );
      blockIndex += 1;
      continue;
    }

    if (lines[index + 1] && line.includes("|") && isTableSeparator(lines[index + 1])) {
      const headers = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim() && lines[index].includes("|")) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${blockIndex}`} className="my-7 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead><tr>{headers.map((cell, column) => <th key={column} className="border-y border-black px-3 py-2 font-semibold text-black">{renderInline(cell, `th-${blockIndex}-${column}`)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-neutral-300">{headers.map((_, column) => <td key={column} className="px-3 py-2.5 align-top text-neutral-700">{renderInline(row[column] ?? "", `td-${blockIndex}-${rowIndex}-${column}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      blockIndex += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${blockIndex}`} className="my-5 list-disc space-y-2 pl-6 text-[0.98rem] leading-7 text-neutral-800">
          {items.map((item, itemIndex) => {
            const task = item.match(/^\[([ xX])\]\s*(.*)$/);
            return <li key={itemIndex} className={task ? "list-none -ml-5" : undefined}>{task ? <><span aria-hidden="true" className="mr-2">{task[1].toLowerCase() === "x" ? "☑" : "☐"}</span>{renderInline(task[2], `ul-${blockIndex}-${itemIndex}`)}</> : renderInline(item, `ul-${blockIndex}-${itemIndex}`)}</li>;
          })}
        </ul>,
      );
      blockIndex += 1;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={`ol-${blockIndex}`} className="my-5 list-decimal space-y-2 pl-6 text-[0.98rem] leading-7 text-neutral-800">{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `ol-${blockIndex}-${itemIndex}`)}</li>)}</ol>);
      blockIndex += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(<blockquote key={`quote-${blockIndex}`} className="my-6 border-l-2 border-black pl-4 text-[0.98rem] leading-7 text-neutral-700">{renderInline(quote.join(" "), `quote-${blockIndex}`)}</blockquote>);
      blockIndex += 1;
      continue;
    }

    if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${blockIndex}`} className="my-8 border-0 border-t border-neutral-300" />);
      blockIndex += 1;
      index += 1;
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`p-${blockIndex}`} className="text-[0.98rem] leading-7 text-neutral-800">{renderInline(paragraph.join(" "), `p-${blockIndex}`)}</p>);
    blockIndex += 1;
  }

  return <div className="space-y-5">{blocks}</div>;
}
