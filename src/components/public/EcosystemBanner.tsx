import Link from "next/link";

type EcosystemBannerProps = {
  title: string;
  description: string;
  links: { href: string; label: string }[];
};

export function EcosystemBanner({
  title,
  description,
  links,
}: EcosystemBannerProps) {
  return (
    <aside className="border-brand/20 bg-brand-soft/40 mb-6 rounded-md border px-4 py-4 sm:px-5">
      <h2 className="text-ink text-base font-semibold">{title}</h2>
      <p className="text-ink-muted mt-1.5 text-sm leading-6">{description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-brand hover:text-brand-dark text-sm font-semibold"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
