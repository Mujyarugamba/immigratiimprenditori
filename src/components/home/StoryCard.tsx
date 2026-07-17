import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { StoryItem } from "@/types/home";

type StoryCardProps = {
  item: StoryItem;
  featured?: boolean;
};

export function StoryCard({ item, featured = false }: StoryCardProps) {
  if (featured) {
    return (
      <Card className="grid gap-0 overflow-hidden p-0 md:grid-cols-[0.32fr_0.68fr]">
        <div className="bg-brand flex flex-col justify-between p-6 text-white sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase">
            {item.sector}
          </p>
          <p className="text-xs text-white/70">Storia in evidenza</p>
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <h3 className="text-ink text-2xl font-semibold tracking-tight sm:text-3xl">
            {item.title}
          </h3>
          <p className="text-ink-muted text-base leading-7">
            {item.introduction}
          </p>
          <Link
            href={item.href}
            className="text-brand hover:text-brand-dark text-sm font-semibold"
          >
            Leggi l’introduzione
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col gap-2.5 p-4">
      <p className="text-brand text-[11px] font-semibold tracking-[0.14em] uppercase">
        {item.sector}
      </p>
      <h3 className="text-ink line-clamp-2 text-[15px] font-semibold">
        {item.title}
      </h3>
      <p className="text-ink-muted line-clamp-3 text-sm leading-6">
        {item.introduction}
      </p>
      <div className="border-line mt-auto border-t pt-3">
        <Link
          href={item.href}
          className="text-brand hover:text-brand-dark text-sm font-semibold"
        >
          Leggi l’introduzione
        </Link>
      </div>
    </Card>
  );
}
