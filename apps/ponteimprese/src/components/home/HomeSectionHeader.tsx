import Link from "next/link";

type HomeSectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
};

export function HomeSectionHeader({
  title,
  description,
  eyebrow,
  actionHref,
  actionLabel,
  compact = false,
}: HomeSectionHeaderProps) {
  return (
    <div
      className={`grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-8 ${
        compact ? "mb-4" : "mb-5 sm:mb-6"
      }`}
    >
      <div className={`max-w-2xl ${compact ? "space-y-1.5" : "space-y-2"}`}>
        {eyebrow ? (
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`text-ink font-semibold tracking-tight ${
            compact
              ? "text-xl sm:text-2xl"
              : "text-2xl sm:text-3xl"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={`text-ink-muted max-w-xl ${
              compact ? "text-sm leading-6" : "text-base leading-7"
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="text-brand decoration-brand/30 hover:text-brand-dark hover:decoration-brand shrink-0 self-start text-sm font-semibold underline underline-offset-4 transition-colors sm:pt-6"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
