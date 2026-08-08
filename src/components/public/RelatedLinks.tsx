import Link from "next/link";

export type RelatedLinkItem = {
  href: string;
  title: string;
  meta?: string;
};

export type RelatedLinkGroup = {
  title: string;
  links: RelatedLinkItem[];
};

type RelatedLinksProps = {
  groups: RelatedLinkGroup[];
};

export function RelatedLinks({ groups }: RelatedLinksProps) {
  const visible = groups.filter((g) => g.links.length > 0);
  if (visible.length === 0) return null;

  return (
    <section className="space-y-6" aria-labelledby="related-network-heading">
      <h2
        id="related-network-heading"
        className="text-ink text-xl font-semibold tracking-tight"
      >
        Nella rete
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {visible.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-ink text-sm font-semibold tracking-wide uppercase">
              {group.title}
            </h3>
            <ul className="space-y-1.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand hover:text-brand-dark text-sm font-medium"
                  >
                    {link.title}
                  </Link>
                  {link.meta ? (
                    <span className="text-ink-muted ml-2 text-xs">
                      {link.meta}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
