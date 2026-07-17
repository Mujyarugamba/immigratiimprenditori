import Link from "next/link";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-dark focus-visible:outline-brand shadow-soft",
  secondary:
    "border border-line bg-surface-elevated text-ink hover:border-line-strong hover:bg-surface focus-visible:outline-line-strong",
  accent:
    "bg-accent text-white hover:bg-accent-dark focus-visible:outline-accent shadow-soft",
  ghost:
    "text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-line-strong",
} as const;

const sizes = {
  sm: "rounded-sm px-3 py-1.5 text-sm",
  md: "rounded-sm px-4 py-2.5 text-sm",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className"
  > & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClasses(variant: Variant, size: Size, className: string) {
  return [
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const classes = buttonClasses(variant, size, className);

  if ("href" in props && props.href) {
    const { href } = props;
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
