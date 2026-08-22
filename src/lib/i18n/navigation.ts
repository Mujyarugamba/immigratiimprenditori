import { DEFAULT_LOCALE, isPlatformLocale, type PlatformLocale } from "@/lib/i18n/config";

export function localeFromPathname(pathname: string): PlatformLocale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isPlatformLocale(first) ? first : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && isPlatformLocale(parts[0])) parts.shift();
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

export function localizePath(locale: PlatformLocale, pathname: string) {
  const base = stripLocalePrefix(pathname);
  if (locale === DEFAULT_LOCALE) return base;
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}
