import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlatformLanguage, isPlatformLocale, PLATFORM_LOCALES } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";

const OG_LOCALES = {
  en: "en_GB",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  ar: "ar_AR",
  zh: "zh_CN",
} as const;

export function generateStaticParams() {
  return PLATFORM_LOCALES.filter((locale) => locale !== "it").map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return {};
  const m = CORE_MESSAGES[locale];
  return {
    openGraph: {
      type: "website",
      locale: OG_LOCALES[locale],
      siteName: "Immigrati Imprenditori",
      title: "Immigrati Imprenditori",
      description: m.homeIntro,
      images: [{ url: "/logo-immigrati-imprenditori.png", alt: "Immigrati Imprenditori" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Immigrati Imprenditori",
      description: m.homeIntro,
      images: ["/logo-immigrati-imprenditori.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const language = getPlatformLanguage(locale);

  return (
    <div lang={locale} dir={language.direction} data-platform-locale={locale}>
      {children}
    </div>
  );
}
