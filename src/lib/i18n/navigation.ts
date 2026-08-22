import { DEFAULT_LOCALE, isPlatformLocale, type PlatformLocale } from "@/lib/i18n/config";

const LOCALIZED_EXACT_PATHS = new Set([
  "/",
  "/osservatorio",
  "/contenuti",
  "/eventi",
  "/esplora",
  "/contribuisci",
  "/chi-siamo",
]);

const LOCALIZED_DYNAMIC_PREFIXES = [
  "/osservatorio/",
  "/contenuti/",
  "/eventi/",
] as const;

export function localeFromPathname(pathname: string): PlatformLocale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isPlatformLocale(first) ? first : DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && isPlatformLocale(parts[0])) parts.shift();
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

export function hasLocalizedRoute(pathname: string) {
  const base = stripLocalePrefix(pathname);
  return (
    LOCALIZED_EXACT_PATHS.has(base) ||
    LOCALIZED_DYNAMIC_PREFIXES.some((prefix) => base.startsWith(prefix))
  );
}

export function localizePath(locale: PlatformLocale, pathname: string) {
  const base = stripLocalePrefix(pathname);
  if (locale === DEFAULT_LOCALE) return base;
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}

/**
 * Returns a localized route only when that route actually exists. Public pages
 * that have not yet been translated remain on their canonical Italian URL.
 */
export function localizedHref(locale: PlatformLocale, pathname: string) {
  const base = stripLocalePrefix(pathname);
  if (!hasLocalizedRoute(base)) return base;
  return localizePath(locale, base);
}

/**
 * Used by the language switcher. If the current page has no translated route,
 * switch to the selected language home rather than generating a 404 URL.
 */
export function languageSwitchHref(locale: PlatformLocale, pathname: string) {
  const base = stripLocalePrefix(pathname);
  if (hasLocalizedRoute(base)) return localizePath(locale, base);
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}
