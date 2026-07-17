import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { EventItem } from "@/types/home";

type EventCardProps = {
  item: EventItem;
};

export function EventCard({ item }: EventCardProps) {
  return (
    <Card className="flex gap-3 overflow-hidden p-0">
      <div className="bg-brand flex w-[4.5rem] shrink-0 flex-col items-center justify-center px-2 py-4 text-center text-white">
        <span className="text-[10px] font-semibold tracking-wide uppercase opacity-80">
          Data
        </span>
        <span className="mt-1 text-xs leading-snug font-semibold">
          {item.dateLabel.replace(/^Data dimostrativa:\s*/i, "")}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-3 pr-3">
        <Badge tone="brand" className="w-fit">
          {item.type}
        </Badge>
        <h3 className="text-ink line-clamp-2 text-[15px] font-semibold">
          {item.title}
        </h3>
        <p className="text-ink-muted text-xs font-medium">{item.territory}</p>
        <p className="text-ink-muted line-clamp-2 text-sm leading-5">
          {item.description}
        </p>
        <div className="mt-auto pt-1">
          <Link
            href={item.href}
            className="text-brand hover:text-brand-dark text-sm font-semibold"
          >
            Scopri l’evento
          </Link>
        </div>
      </div>
    </Card>
  );
}
