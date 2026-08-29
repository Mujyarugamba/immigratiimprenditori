import type { ElementType, ReactNode } from "react";
import {
  catalogLanguageCodeFromId,
  writingDirectionForLanguageCode,
} from "@/lib/i18n/content-direction";

type OriginalLanguageTextProps = {
  languageId?: number | null;
  languageCode?: string | null;
  as?: "p" | "h1" | "h2" | "h3" | "div" | "span";
  className?: string;
  children: ReactNode;
};

export function OriginalLanguageText({
  languageId,
  languageCode,
  as: Tag = "p",
  className,
  children,
}: OriginalLanguageTextProps) {
  const lang = languageCode ?? catalogLanguageCodeFromId(languageId);
  const dir = writingDirectionForLanguageCode(lang);
  const Component = Tag as ElementType;

  return (
    <Component
      className={className}
      dir={dir}
      lang={lang}
      data-original-language={lang ?? "und"}
      data-content-direction={dir}
      style={{ unicodeBidi: "isolate" }}
    >
      {children}
    </Component>
  );
}
