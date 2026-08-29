"use client";

import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/i18n/navigation";

const LABELS = {
  it: "Vai al contenuto",
  en: "Skip to content",
  fr: "Aller au contenu",
  es: "Ir al contenido",
  de: "Zum Inhalt springen",
  ar: "الانتقال إلى المحتوى",
  zh: "跳至主要内容",
} as const;

export function SkipLink() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);

  return (
    <a
      href="#contenuto-principale"
      className="fixed left-3 top-3 z-[100] -translate-y-24 border border-black bg-white px-4 py-2 text-sm font-semibold text-black shadow-none transition-transform focus:translate-y-0 focus:outline focus:outline-2 focus:outline-offset-2"
    >
      {LABELS[locale]}
    </a>
  );
}
