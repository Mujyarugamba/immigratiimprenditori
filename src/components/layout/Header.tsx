"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { localeFromPathname, localizedHref } from "@/lib/i18n/navigation";
import { NAV_MESSAGES } from "@/lib/i18n/messages";

export function Header() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const m = NAV_MESSAGES[locale];

  const mainNav = [
    { label: m.observatory, href: localizedHref(locale, "/osservatorio") },
    { label: m.analysis, href: localizedHref(locale, "/contenuti") },
    { label: m.events, href: localizedHref(locale, "/eventi") },
    { label: m.explore, href: localizedHref(locale, "/esplora") },
    { label: m.participate, href: localizedHref(locale, "/contribuisci") },
  ];

  return (
    <header className="site-header">
      <div className="institutional-bar">
        <div className="site-container institutional-bar-inner">
          <p>{m.institutional}</p>
          <nav aria-label="Institutional links">
            <Link prefetch={false} href={localizedHref(locale, "/cerca")}>{m.search}</Link>
            <Link prefetch={false} href={localizedHref(locale, "/chi-siamo")}>{m.about}</Link>
            <Link prefetch={false} href="/politica-editoriale">{m.editorialPolicy}</Link>
            <Link prefetch={false} href="/accedi">{m.login}</Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>

      <div className="primary-header">
        <div className="site-container primary-header-inner">
          <Link
            prefetch={false}
            href={localizedHref(locale, "/")}
            className="brand-link"
            aria-label="Immigrati Imprenditori - Home"
          >
            <Image
              src="/logo-immigrati-imprenditori.png"
              alt="Immigrati Imprenditori"
              width={360}
              height={120}
              sizes="235px"
              priority
              className="brand-logo"
            />
          </Link>

          <nav aria-label="Primary navigation" className="primary-nav">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            prefetch={false}
            href={localizedHref(locale, "/sostieni")}
            className="header-support"
          >
            {m.support}
          </Link>
        </div>
      </div>
    </header>
  );
}
