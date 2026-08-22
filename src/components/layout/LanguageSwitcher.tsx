"use client";

import { usePathname, useRouter } from "next/navigation";
import { PLATFORM_LANGUAGES } from "@/lib/i18n/config";
import { languageSwitchHref, localeFromPathname } from "@/lib/i18n/navigation";
import { NAV_MESSAGES } from "@/lib/i18n/messages";

export function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const locale = localeFromPathname(pathname);
  const messages = NAV_MESSAGES[locale];

  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold" aria-label={messages.language}>
      <span className="sr-only">{messages.language}</span>
      <select
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as (typeof PLATFORM_LANGUAGES)[number]["code"];
          router.push(languageSwitchHref(nextLocale, pathname));
        }}
        className="border border-current bg-transparent px-2 py-1 text-xs font-semibold"
      >
        {PLATFORM_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="bg-white text-black">
            {language.code.toUpperCase()} · {language.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
