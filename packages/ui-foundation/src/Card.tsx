type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "article" | "div";
};

export function Card({ children, className = "", as = "article" }: CardProps) {
  const Comp = as;

  return (
    <Comp
      className={`border-line bg-surface-elevated shadow-soft h-full rounded-md border transition-shadow hover:shadow-[0_2px_10px_rgb(34_34_32_/_0.07)] ${className}`}
    >
      {children}
    </Comp>
  );
}
