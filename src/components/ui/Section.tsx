type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/** Avoid stacking conflicting py-* when callers pass their own vertical padding. */
function withDefaultPadding(className: string): string {
  const hasPy = /\bpy-/.test(className);
  const base = hasPy ? "" : "py-8 sm:py-10 ";
  return `${base}${className}`.trim();
}

export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={withDefaultPadding(className)}>
      {children}
    </section>
  );
}
