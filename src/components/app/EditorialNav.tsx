"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app/redazione", label: "Dashboard", exact: true },
  { href: "/app/redazione/numero-zero", label: "Numero zero" },
  { href: "/app/redazione/radar", label: "Radar" },
  { href: "/app/redazione/inbox", label: "Inbox" },
  { href: "/app/redazione/storie", label: "Storie e interviste" },
  { href: "/app/redazione/rapporti", label: "Rapporti" },
  { href: "/app/redazione/contenuti", label: "Contenuti" },
  { href: "/app/redazione/eventi", label: "Eventi" },
  { href: "/app/redazione/osservatorio", label: "Osservatorio" },
  { href: "/app/redazione/osservatorio/fonti", label: "Fonti" },
] as const;

const adminLinks = [{ href: "/app/redazione/contributori", label: "Contributori" }] as const;
const linkClass = "text-ink-muted hover:text-ink block rounded-sm px-2 py-1.5 text-sm font-medium transition-colors";
const activeClass = "text-ink bg-surface-muted block rounded-sm px-2 py-1.5 text-sm font-semibold";

export function EditorialNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const visibleLinks = isAdmin ? [...links, ...adminLinks] : links;
  return (
    <nav className="border-line mb-6 flex flex-wrap gap-1 border-b pb-4" aria-label="Redazione Centro Studi">
      {visibleLinks.map(({ href, label, ...rest }) => {
        const exact = "exact" in rest && rest.exact;
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} className={active ? activeClass : linkClass} aria-current={active ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
