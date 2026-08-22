import { DEFAULT_LOCALE, PLATFORM_LOCALES, type PlatformLocale } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/navigation";

export const SITE_URL = "https://immigratiimprenditori.it";

export function absoluteLocalizedUrl(locale: PlatformLocale, pathname: string) {
  return `${SITE_URL}${localizePath(locale, pathname)}`;
}

export function languageAlternates(pathname: string) {
  const languages: Record<string, string> = {};
  for (const locale of PLATFORM_LOCALES) {
    languages[locale] = absoluteLocalizedUrl(locale, pathname);
  }
  languages["x-default"] = `${SITE_URL}${localizePath(DEFAULT_LOCALE, pathname)}`;
  return languages;
}
