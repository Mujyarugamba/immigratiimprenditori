import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { EnterpriseItem } from "@/types/home";

type EnterpriseCardProps = {
  item: EnterpriseItem;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function EnterpriseCard({ item }: EnterpriseCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="bg-brand flex items-center gap-3 px-4 py-4 text-white">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/15 text-sm font-semibold"
          aria-hidden="true"
        >
          {initials(item.name)}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[15px] font-semibold">
            {item.name}
          </h3>
          <p className="mt-0.5 text-xs text-white/70">
            {item.sector} · {item.territory}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {item.languages.slice(0, 3).map((language) => (
            <Badge key={language} tone="soft">
              {language}
            </Badge>
          ))}
        </div>
        <p className="text-ink-muted line-clamp-2 text-sm leading-5">
          {item.description}
        </p>
        <div className="bg-surface text-ink-muted space-y-1.5 rounded-sm px-3 py-2 text-xs leading-5">
          <p>
            <span className="text-ink font-semibold">Offre:</span> {item.offers}
          </p>
          <p>
            <span className="text-ink font-semibold">Cerca:</span> {item.seeks}
          </p>
        </div>
        <div className="border-line mt-auto border-t pt-3">
          <Link
            href={item.href}
            className="text-brand hover:text-brand-dark text-sm font-semibold"
          >
            Vai al profilo
          </Link>
        </div>
      </div>
    </Card>
  );
}
