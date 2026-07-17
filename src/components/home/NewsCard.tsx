import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { NewsItem } from "@/types/home";

type NewsCardProps = {
  item: NewsItem;
  layout?: "stack" | "editorial";
};

export function NewsCard({ item, layout = "stack" }: NewsCardProps) {
  if (layout === "editorial") {
    return (
      <article className="border-line grid gap-3 border-b py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
        <time className="text-ink-subtle text-xs font-medium tracking-wide uppercase">
          {item.publishedAt}
        </time>
        <div className="min-w-0 space-y-2">
          <Badge tone="soft">{item.type}</Badge>
          <h3 className="text-ink text-lg font-semibold tracking-tight">
            <Link href={item.href} className="hover:text-brand">
              {item.title}
            </Link>
          </h3>
          <p className="text-ink-muted line-clamp-2 text-sm leading-6">
            {item.description}
          </p>
        </div>
      </article>
    );
  }

  return (
    <Card className="border-line flex flex-col gap-2.5 rounded-none border-0 border-b bg-transparent p-0 pb-4 shadow-none hover:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <Badge tone="soft">{item.type}</Badge>
        <time className="text-ink-subtle text-[11px]">{item.publishedAt}</time>
      </div>
      <h3 className="text-ink line-clamp-2 text-[15px] font-semibold">
        <Link href={item.href} className="hover:text-brand">
          {item.title}
        </Link>
      </h3>
      <p className="text-ink-muted line-clamp-2 text-sm leading-5">
        {item.description}
      </p>
    </Card>
  );
}
