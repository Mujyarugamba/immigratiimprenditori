import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { OpportunityItem } from "@/types/home";

type OpportunityCardProps = {
  item: OpportunityItem;
  featured?: boolean;
};

export function OpportunityCard({
  item,
  featured = false,
}: OpportunityCardProps) {
  if (featured) {
    return (
      <Card className="bg-accent-soft flex h-full flex-col gap-4 p-6 sm:p-7">
        <Badge tone="accent" className="w-fit">
          {item.type}
        </Badge>
        <h3 className="text-ink text-2xl font-semibold tracking-tight">
          {item.title}
        </h3>
        <p className="text-accent-dark text-sm font-semibold">
          {item.territory}
        </p>
        <p className="text-ink-muted flex-1 text-base leading-7">
          {item.description}
        </p>
        <div className="border-accent/25 mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-ink-subtle text-xs">{item.publishedAt}</span>
          <Link
            href={item.href}
            className="text-accent-dark hover:text-accent text-sm font-semibold"
          >
            Apri opportunità
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-elevated flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{item.type}</Badge>
      </div>
      <h3 className="text-ink line-clamp-2 text-[15px] font-semibold">
        {item.title}
      </h3>
      <p className="text-accent-dark text-xs font-medium">{item.territory}</p>
      <p className="text-ink-muted line-clamp-2 text-sm leading-5">
        {item.description}
      </p>
      <div className="border-line mt-auto flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-ink-subtle text-[11px]">{item.publishedAt}</span>
        <Link
          href={item.href}
          className="text-accent-dark hover:text-accent text-sm font-semibold"
        >
          Apri
        </Link>
      </div>
    </Card>
  );
}
