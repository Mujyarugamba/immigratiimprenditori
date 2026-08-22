"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, localizedHref } from "@/lib/i18n/navigation";
import { NAV_MESSAGES } from "@/lib/i18n/messages";

export function Footer() {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const m = NAV_MESSAGES[locale];

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
          <Link href="/esplora/dati">Data Explorer</Link>
          <Link href="/esplora/territori">{m.territories ?? "Territori"}</Link>
          <Link href="/esplora/settori">{m.sectors ?? "Settori"}</Link>
          <Link href="/open-data">{m.openData}</Link>
        </div>

        <div>
          <h2>{m.footerCenter}</h2>
          <Link href={localizedHref(locale, "/contenuti")}>{m.analysis}</Link>
          <Link href={localizedHref(locale, "/eventi")}>{m.events}</Link>
          <Link href={localizedHref(locale, "/contribuisci")}>{m.participate}</Link>
          <Link href={localizedHref(locale, "/chi-siamo")}>{m.about}</Link>
          <Link href="/sostieni">{m.support}</Link>
          <a href="mailto:info@immigratiimprenditori.it">{m.contacts}</a>
        </div>

        <div>
          <h2>{m.footerMethod}</h2>
          <Link href="/dati-e-fonti">{m.sourcesMethod}</Link>
          <Link href="/glossario">{m.glossary}</Link>
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
