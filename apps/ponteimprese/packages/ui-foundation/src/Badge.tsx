const tones = {
  neutral: "bg-surface-muted text-ink-muted",
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent-dark",
  soft: "bg-surface-elevated text-ink-muted ring-1 ring-line",
} as const;

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: keyof typeof tones;
};

export function Badge({
  children,
  className = "",
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
