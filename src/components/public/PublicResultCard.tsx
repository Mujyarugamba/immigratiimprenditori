import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type PublicResultCardProps = {
  href: string;
  title: string;
  description?: string | null;
  meta?: string[];
  badges?: string[];
  ctaLabel?: string;
  ctaArrow?: string;
  notice?: React.ReactNode;
};

export function PublicResultCard({
  href,
  title,
  description,
  meta = [],
  badges = [],
  ctaLabel = "Apri",
  ctaArrow = "→",
  notice,
}: PublicResultCardProps) {
  return (
    <Card className="public-result-card flex h-full flex-col p-5">
      <div className="flex flex-1 flex-col gap-3">
        <h2 className="public-result-title text-ink text-base font-semibold tracking-tight">
          <Link href={href} className="hover:text-brand transition-colors">
            {title}
          </Link>
        </h2>
        {meta.length > 0 ? (
          <p className="public-result-meta text-ink-muted text-xs leading-5">{meta.join(" · ")}</p>
        ) : null}
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(0, 4).map((badge) => (
              <Badge key={badge} tone="soft">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
        {description ? (
          <p className="public-result-description text-ink-muted line-clamp-3 text-sm leading-6">
            {description}
          </p>
        ) : null}
        {notice}
        <div className="public-result-cta border-line mt-auto border-t pt-3">
          <Link
            href={href}
            className="text-brand hover:text-brand-dark text-sm font-semibold"
          >
            {ctaLabel} {ctaArrow}
          </Link>
        </div>
      </div>
    </Card>
  );
}
