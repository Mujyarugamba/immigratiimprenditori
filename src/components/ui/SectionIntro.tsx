type SectionIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function SectionIntro({
  title,
  description,
  eyebrow = "Sezione in preparazione",
}: SectionIntroProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-ink-muted text-base leading-7 sm:text-lg">
        {description}
      </p>
    </div>
  );
}
