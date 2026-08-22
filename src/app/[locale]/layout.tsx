import { notFound } from "next/navigation";
import { getPlatformLanguage, isPlatformLocale, PLATFORM_LOCALES } from "@/lib/i18n/config";

export function generateStaticParams() {
  return PLATFORM_LOCALES.filter((locale) => locale !== "it").map((locale) => ({ locale }));
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
