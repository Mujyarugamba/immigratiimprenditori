"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { mainNav, publishCta } from "@/data/navigation";
import { siteConfig } from "@/lib/site";

const participateLinks = [
  { label: "Pubblica una richiesta", href: "/pubblica" },
  { label: "Presenta la tua impresa", href: "/pubblica" },
  { label: "Partecipa come ente", href: "/pubblica" },
];

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

  return (
    <footer className="bg-brand-dark mt-auto text-white">
      <Container className="grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="space-y-3 lg:col-span-1">
          <p className="text-sm leading-tight">
            <span className="text-brand-soft font-semibold">Immigrati</span>{" "}
            <span className="font-medium text-white">Imprenditori</span>
          </p>
          <p className="text-sm leading-6 text-white/70">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="Navigazione footer">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Navigazione
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Partecipa
          </p>
          <ul className="space-y-1.5">
            {participateLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={publishCta.href}
                className="text-accent-soft text-sm font-semibold transition-colors hover:text-white"
              >
                {publishCta.label}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Contatti
          </p>
          <ul className="space-y-1.5 text-sm text-white/75">
            <li>
              <Link href="/contatti" className="hover:text-white">
                Contatti
              </Link>
            </li>
            <li>
              <a
                href={`mailto:info@${siteConfig.domain}`}
                className="hover:text-white"
              >
                info@{siteConfig.domain}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-1 py-4 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.domain}
          </p>
          <p>
            Contenuto provvisorio in fase di sviluppo. Nessun dato statistico
            ufficiale pubblicato in questa versione.
          </p>
        </Container>
      </div>
    </footer>
  );
}
