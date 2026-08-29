import type { ElementType, ReactNode } from "react";
import { originalContentLanguageAttrs } from "@/lib/i18n/content-direction";

type OriginalLanguageTextProps = {
  languageId?: number | null;
  as?: "p" | "h1" | "h2" | "h3" | "div" | "span";
  className?: string;
  children: ReactNode;
};

export function OriginalLanguageText({
  languageId,
  as: Tag = "p",
  className,
  children,
}: OriginalLanguageTextProps) {
  const { dir, lang } = originalContentLanguageAttrs(languageId);
  const Component = Tag as ElementType;

  return (
    <Component
      className={className}
      dir={dir}
      lang={lang}
      data-original-language={lang ?? "und"}
      style={{ unicodeBidi: "isolate" }}
    >
      {children}
    </Component>
  );
}
