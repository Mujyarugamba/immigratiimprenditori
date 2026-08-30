import { DEFAULT_LOCALE, PLATFORM_LOCALES, type PlatformLocale } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/navigation";

export const SITE_URL = "https://www.immigratiimprenditori.it";

export function absoluteUrl(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalized}`;
}

export function absoluteLocalizedUrl(locale: PlatformLocale, pathname: string) {
  return absoluteUrl(localizePath(locale, pathname));
}

export function languageAlternates(pathname: string) {
  const languages: Record<string, string> = {};
  for (const locale of PLATFORM_LOCALES) {
    languages[locale] = absoluteLocalizedUrl(locale, pathname);
  }
  languages["x-default"] = absoluteUrl(localizePath(DEFAULT_LOCALE, pathname));
  return languages;
}
