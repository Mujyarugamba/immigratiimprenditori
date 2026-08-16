"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { moreNav, primaryNav } from "@/data/navigation";
import { siteConfig } from "@/lib/site";
import type { NavItem } from "@/types/navigation";

const participateLinks: NavItem[] = [
  { label: "Crea il tuo profilo", href: "/registrati" },
  { label: "Presenta la tua impresa", href: "/app/imprese" },
  { label: "Pubblica", href: "/pubblica" },
];

/** Footer “Rete” column order (labels from moreNav; no domains dropped). */
const RETE_ORDER = [
  "/professionisti",
  "/collaborazioni",
  "/eventi",
  "/cultura",
  "/contenuti",
  "/osservatorio",
  "/organizzazioni",
  "/chi-siamo",
] as const;

function footerReteLinks(): NavItem[] {
  const byHref = new Map(moreNav.map((item) => [item.href, item]));
  const ordered = RETE_ORDER.map((href) => byHref.get(href)).filter(
    (item): item is NavItem => Boolean(item),
  );
  const extras = moreNav.filter(
    (item) => !RETE_ORDER.includes(item.href as (typeof RETE_ORDER)[number]),
  );
  return [...ordered, ...extras];
}

function FooterNavColumn({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  return (
    <nav aria-label={title}>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm leading-5 text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/accedi") ||
    pathname.startsWith("/registrati") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  const reteLinks = footerReteLinks();

  return (
    <footer className="bg-brand-dark mt-auto text-white">
      <Container className="grid gap-6 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-5 lg:py-7">
        <div className="space-y-2">
          <p className="text-sm leading-tight">
            <span className="text-brand-soft font-semibold">Immigrati</span>{" "}
            <span className="font-medium text-white">Imprenditori</span>
          </p>
          <p className="max-w-xs text-sm leading-5 text-white/70 lg:max-w-none">
            {siteConfig.description}
          </p>
        </div>

        <FooterNavColumn title="Esplora" items={primaryNav} />
        <FooterNavColumn title="Rete" items={reteLinks} />
        <FooterNavColumn title="Partecipa" items={participateLinks} />

        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Contatti
          </p>
          <ul className="space-y-1 text-sm leading-5 text-white/75">
            <li>
              <a
                href={`mailto:info@${siteConfig.domain}`}
                className="hover:text-white"
              >
                info@{siteConfig.domain}
              </a>
            </li>
            <li>
              <Link href="/contatti" className="hover:text-white">
                Scrivici
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-3 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.domain}
          </p>
          <nav
            aria-label="Documenti legali"
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/cookie" className="hover:text-white">
              Cookie
            </Link>
            <Link href="/termini" className="hover:text-white">
              Termini
            </Link>
            <Link href="/dati-e-fonti" className="hover:text-white">
              Dati e fonti
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
