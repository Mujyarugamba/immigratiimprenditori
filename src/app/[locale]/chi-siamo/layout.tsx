import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return {};
  const m = CORE_MESSAGES[locale];
  return pageSocialMetadata({
    title: m.aboutTitle,
    description: m.aboutIntro,
    pathname: `/${locale}/chi-siamo`,
  });
}

export default function LocalizedAboutLayout({ children }: Props) {
  return children;
}
