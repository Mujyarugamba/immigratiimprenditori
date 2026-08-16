"use client";

import { selectBusinessAction } from "@/lib/business/actions";
import type { BusinessListItem } from "@/types/business";

type Props = {
  items: BusinessListItem[];
  selectedBusinessId: string | null;
};

export function BusinessSwitcher({ items, selectedBusinessId }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <form action={selectBusinessAction} className="flex flex-col gap-1">
      <label
        htmlFor="business-switcher"
        className="text-ink-subtle text-[11px] font-medium tracking-wide uppercase"
      >
        Impresa selezionata
      </label>
      <select
        id="business-switcher"
        name="business_id"
        defaultValue={selectedBusinessId ?? ""}
        className="border-line bg-surface text-ink rounded-sm border px-2 py-1.5 text-sm"
        onChange={(event) => {
          event.currentTarget.form?.requestSubmit();
        }}
      >
        {items.map((item) => (
          <option key={item.business.id} value={item.business.id}>
            {item.business.public_name}
            {item.canManage ? " · gestibile" : " · collegata"}
          </option>
        ))}
      </select>
      <p className="text-ink-subtle text-[11px] leading-snug">
        Cambiare impresa qui non modifica i permessi di gestione.
      </p>
    </form>
  );
}
