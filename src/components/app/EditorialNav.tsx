"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app/redazione", label: "Dashboard Redazione", exact: true },
  { href: "/app/redazione/inbox", label: "Inbox" },
  { href: "/app/redazione/radar", label: "Radar" },
  { href: "/app/redazione/ai", label: "AI redazionale" },
  { href: "/app/redazione/contenuti", label: "Contenuti" },
  { href: "/app/redazione/eventi", label: "Eventi" },
  { href: "/app/redazione/osservatorio", label: "Osservatorio" },
] as const;

const linkClass =
  "text-ink-muted hover:text-ink block rounded-sm px-2 py-1.5 text-sm font-medium transition-colors";

const activeClass =
  "text-ink bg-surface-muted block rounded-sm px-2 py-1.5 text-sm font-semibold";

export function EditorialNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-line mb-6 flex flex-wrap gap-1 border-b pb-4"
      aria-label="Redazione Centro Studi"
    >
      {links.map(({ href, label, ...rest }) => {
        const exact = "exact" in rest && rest.exact;
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={active ? activeClass : linkClass}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
