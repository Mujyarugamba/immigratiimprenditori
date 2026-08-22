"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, localizedHref } from "@/lib/i18n/navigation";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { COLLECTION_MESSAGES } from "@/lib/i18n/collections";

export function Footer() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const m = NAV_MESSAGES[locale];
  const core = CORE_MESSAGES[locale];
  const collections = COLLECTION_MESSAGES[locale];

  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-shell">
            <img
              src="/logo-immigrati-imprenditori.png"
              alt="Immigrati Imprenditori"
              width="300"
              height="100"
              className="footer-logo"
            />
          </div>
          <p>{m.institutional}</p>
        </div>

        <div>
          <h2>{m.footerResearch}</h2>
          <Link href={localizedHref(locale, "/osservatorio")}>{m.observatory}</Link>
          <Link href={localizedHref(locale, "/esplora/dati")}>{core.dataExplorer}</Link>
          <Link href={localizedHref(locale, "/esplora/territori")}>{core.territories}</Link>
          <Link href={localizedHref(locale, "/esplora/settori")}>{core.sectors}</Link>
          <Link href={localizedHref(locale, "/open-data")}>{m.openData}</Link>
        </div>

        <div>
          <h2>{m.footerCenter}</h2>
          <Link href={localizedHref(locale, "/contenuti")}>{m.analysis}</Link>
          <Link href={localizedHref(locale, "/ricerca")}>{collections.researchTitle}</Link>
          <Link href={localizedHref(locale, "/storie")}>{collections.storiesTitle}</Link>
          <Link href={localizedHref(locale, "/eventi")}>{m.events}</Link>
          <Link href={localizedHref(locale, "/contribuisci")}>{m.participate}</Link>
          <Link href={localizedHref(locale, "/chi-siamo")}>{m.about}</Link>
          <Link href={localizedHref(locale, "/sostieni")}>{m.support}</Link>
          <a href="mailto:info@immigratiimprenditori.it">{m.contacts}</a>
        </div>

        <div>
          <h2>{m.footerMethod}</h2>
          <Link href={localizedHref(locale, "/fonti")}>{core.sources}</Link>
          <Link href={localizedHref(locale, "/dati-e-fonti")}>{m.sourcesMethod}</Link>
          <Link href={localizedHref(locale, "/glossario")}>{m.glossary}</Link>
          <Link href="/politica-editoriale">{m.editorialPolicy}</Link>
          <Link href="/privacy">{m.privacy}</Link>
          <Link href="/cookie">{m.cookie}</Link>
          <Link href="/termini">{m.terms}</Link>
          <a href="/feed.xml">{m.rss}</a>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <span>© 2026 Immigrati Imprenditori · Centro Studi AIPEL</span>
        <span>{m.tagline}</span>
      </div>
    </footer>
  );
}
