export const DEFAULT_LOCALE = "it" as const;
export const SUPPORTED_LOCALES = [DEFAULT_LOCALE] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LANGUAGE_TAG = "it-IT" as const;

/**
 * Locale-aware path builder prepared for future languages.
 * The default Italian v1 keeps existing URLs stable and unprefixed.
 */
export function localizedPath(path: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? normalized : `/${locale}${normalized}`;
}
