"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app/amministrazione", label: "Dashboard", exact: true },
  { href: "/app/amministrazione/account", label: "Account" },
  { href: "/app/amministrazione/ruoli", label: "Ruoli" },
  { href: "/app/amministrazione/imprese", label: "Autorizzazioni imprese" },
] as const;

const linkClass =
  "text-ink-muted hover:text-ink block rounded-sm px-2 py-1.5 text-sm font-medium transition-colors";

const activeClass =
  "text-ink bg-surface-muted block rounded-sm px-2 py-1.5 text-sm font-semibold";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-line mb-6 flex flex-wrap gap-1 border-b pb-4"
      aria-label="Amministrazione"
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
