export const DEFAULT_LOCALE = "it" as const;

export const PLATFORM_LANGUAGES = [
  { code: "it", nativeName: "Italiano", direction: "ltr", priority: 1 },
  { code: "en", nativeName: "English", direction: "ltr", priority: 2 },
  { code: "fr", nativeName: "Français", direction: "ltr", priority: 3 },
  { code: "es", nativeName: "Español", direction: "ltr", priority: 4 },
  { code: "de", nativeName: "Deutsch", direction: "ltr", priority: 5 },
  { code: "ar", nativeName: "العربية", direction: "rtl", priority: 6 },
  { code: "zh", nativeName: "中文", direction: "ltr", priority: 7 },
] as const;

export type PlatformLocale = (typeof PLATFORM_LANGUAGES)[number]["code"];

export const PLATFORM_LOCALES = PLATFORM_LANGUAGES.map((language) => language.code);

export function isPlatformLocale(value: string): value is PlatformLocale {
  return PLATFORM_LANGUAGES.some((language) => language.code === value);
}

export function getPlatformLanguage(locale: PlatformLocale) {
  return PLATFORM_LANGUAGES.find((language) => language.code === locale)!;
}
