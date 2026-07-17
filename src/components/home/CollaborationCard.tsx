import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { CollaborationRequest } from "@/types/home";

type CollaborationCardProps = {
  item: CollaborationRequest;
  layout?: "classic" | "horizontal";
};

export function CollaborationCard({
  item,
  layout = "classic",
}: CollaborationCardProps) {
  if (layout === "horizontal") {
    return (
      <Card className="border-l-brand flex flex-col gap-4 border-l-[3px] p-5 sm:flex-row sm:items-stretch sm:gap-8 sm:p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{item.type}</Badge>
            <span className="text-ink-subtle text-xs">{item.territory}</span>
          </div>
          <h3 className="text-ink text-xl font-semibold tracking-tight sm:text-2xl">
            {item.title}
          </h3>
          <p className="text-ink-muted text-sm font-medium">
            {item.sector}
            {item.languages?.length ? ` · ${item.languages.join(", ")}` : ""}
          </p>
          <p className="text-ink-muted max-w-2xl text-base leading-7">
            {item.description}
          </p>
        </div>
        <div className="border-line flex shrink-0 flex-col justify-between gap-4 border-t pt-4 sm:w-44 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <span className="text-ink-subtle text-xs">{item.publishedAt}</span>
          <Link
            href={item.href}
            className="text-brand hover:text-brand-dark text-sm font-semibold"
          >
            Scopri la richiesta
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-l-brand flex h-full flex-col gap-3 border-l-[3px] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{item.type}</Badge>
        <span className="text-ink-subtle text-xs">{item.territory}</span>
      </div>
      <h3 className="text-ink line-clamp-2 text-[15px] font-semibold">
        {item.title}
      </h3>
      <p className="text-ink-muted text-xs font-medium">
        {item.sector}
        {item.languages?.length ? ` · ${item.languages.join(", ")}` : ""}
      </p>
      <p className="text-ink-muted line-clamp-2 text-sm leading-5">
        {item.description}
      </p>
      <div className="border-line mt-auto flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-ink-subtle text-[11px]">{item.publishedAt}</span>
        <Link
          href={item.href}
          className="text-brand hover:text-brand-dark text-sm font-semibold"
        >
          Scopri
        </Link>
      </div>
    </Card>
  );
}
