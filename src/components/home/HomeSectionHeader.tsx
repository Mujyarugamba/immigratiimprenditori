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
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${
        compact ? "mb-6 sm:mb-7" : "mb-8 sm:mb-10"
      }`}
    >
      <div className={`max-w-2xl ${compact ? "space-y-2" : "space-y-3"}`}>
        {eyebrow ? (
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`text-ink font-semibold tracking-tight ${
            compact
              ? "text-2xl sm:text-3xl"
              : "text-3xl sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-ink-muted max-w-xl text-base leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="text-brand decoration-brand/30 hover:text-brand-dark hover:decoration-brand shrink-0 text-sm font-semibold underline underline-offset-4 transition-colors"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
