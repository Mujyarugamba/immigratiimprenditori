import { Button, type ButtonProps } from "./Button";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: NonNullable<ButtonProps["variant"]>;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <Button href={href} variant={variant} className={className}>
      {children}
    </Button>
  );
}
