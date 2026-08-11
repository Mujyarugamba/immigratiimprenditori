"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  appAreaCta,
  loginCta,
  moreNav,
  primaryNav,
  publishCta,
  signupCta,
} from "@/data/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className="shrink-0 text-[15px] leading-tight tracking-tight"
      onClick={onNavigate}
    >
      <span className="text-brand font-semibold">Immigrati</span>{" "}
      <span className="text-ink font-medium">Imprenditori</span>
    </Link>
  );
}

function navLinkClass(active: boolean) {
  return [
    "whitespace-nowrap px-1 py-1.5 text-[13px] transition-colors lg:py-0",
    active
      ? "font-semibold text-brand"
      : "font-medium text-ink-muted hover:text-ink",
  ].join(" ");
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const navId = useId();
  const moreId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const morePanelRef = useRef<HTMLDivElement>(null);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setMoreOpen(false);
  }

  useEffect(() => {
    if (!open && !moreOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (moreOpen) {
          setMoreOpen(false);
          moreButtonRef.current?.focus();
          return;
        }
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (
        moreOpen &&
        morePanelRef.current &&
        !morePanelRef.current.contains(event.target as Node) &&
        !moreButtonRef.current?.contains(event.target as Node)
      ) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, moreOpen]);

  const moreActive = moreNav.some((item) => isActivePath(pathname, item.href));
  const isAppChrome =
    pathname.startsWith("/app") ||
    pathname.startsWith("/accedi") ||
    pathname.startsWith("/registrati") ||
    pathname.startsWith("/auth");

  if (isAppChrome) {
    return (
      <header className="border-line bg-surface-elevated/95 sticky top-0 z-40 border-b backdrop-blur-sm">
        <Container className="flex items-center justify-between gap-3 py-2.5">
          <BrandMark />
          <div className="flex items-center gap-3">
            {pathname.startsWith("/app") ? (
              <Link
                href="/"
                className="text-ink-muted hover:text-ink text-[13px] font-medium"
              >
                Torna al sito
              </Link>
            ) : (
              <>
                <Link
                  href={loginCta.href}
                  className="text-ink-muted hover:text-ink text-[13px] font-medium"
                >
                  {loginCta.label}
                </Link>
                <Button href={signupCta.href} size="sm">
                  {signupCta.label}
                </Button>
              </>
            )}
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className="border-line bg-surface-elevated/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <Container className="flex items-center gap-3 py-2.5 lg:gap-4">
        <BrandMark onNavigate={() => setOpen(false)} />

        <nav
          id={navId}
          className={`${
            open ? "flex" : "hidden"
          } border-line bg-surface-elevated shadow-soft absolute top-full right-0 left-0 z-30 max-h-[min(80vh,32rem)] flex-col gap-0.5 overflow-y-auto border-b px-4 py-3 lg:static lg:ml-auto lg:flex lg:max-h-none lg:flex-row lg:flex-nowrap lg:items-center lg:gap-x-3 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
          aria-label="Navigazione principale"
        >
          {primaryNav.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="relative hidden lg:block" ref={morePanelRef}>
            <button
              ref={moreButtonRef}
              type="button"
              className={navLinkClass(moreActive || moreOpen)}
              aria-expanded={moreOpen}
              aria-controls={moreId}
              onClick={() => setMoreOpen((value) => !value)}
            >
              Esplora
            </button>
            {moreOpen ? (
              <div
                id={moreId}
                className="border-line bg-surface-elevated shadow-soft absolute top-full right-0 mt-2 min-w-44 rounded-md border p-1.5"
              >
                {moreNav.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-sm px-3 py-2 text-[13px] ${
                        active
                          ? "bg-brand-soft text-brand font-semibold"
                          : "text-ink-muted hover:bg-surface hover:text-ink"
                      }`}
                      onClick={() => {
                        setMoreOpen(false);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="border-line mt-1 border-t pt-2 lg:hidden">
            <p className="text-ink-subtle px-1 pb-1 text-[11px] font-medium tracking-wide uppercase">
              Esplora
            </p>
            {moreNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block ${navLinkClass(active)}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-line mt-2 flex flex-col gap-2 border-t pt-3 sm:hidden">
            <Button href={loginCta.href} variant="ghost" className="w-full">
              {loginCta.label}
            </Button>
            <Button href={signupCta.href} variant="secondary" className="w-full">
              {signupCta.label}
            </Button>
            <Button href={appAreaCta.href} variant="ghost" className="w-full">
              {appAreaCta.label}
            </Button>
            <Button href={publishCta.href} className="w-full">
              {publishCta.label}
            </Button>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <Link
            href={loginCta.href}
            className="text-ink-muted hover:text-ink hidden text-[13px] font-medium transition-colors sm:inline"
          >
            {loginCta.label}
          </Link>
          <Link
            href={signupCta.href}
            className="text-ink-muted hover:text-ink hidden text-[13px] font-medium transition-colors md:inline"
          >
            {signupCta.label}
          </Link>
          <Button
            href={publishCta.href}
            size="sm"
            className="hidden sm:inline-flex"
            aria-current={
              isActivePath(pathname, publishCta.href) ? "page" : undefined
            }
          >
            {publishCta.label}
          </Button>

          <button
            ref={menuButtonRef}
            type="button"
            className="border-line text-ink inline-flex items-center justify-center rounded-sm border px-3 py-1.5 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={
              open ? "Chiudi menu di navigazione" : "Apri menu di navigazione"
            }
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Chiudi" : "Menu"}
          </button>
        </div>
      </Container>
    </header>
  );
}
