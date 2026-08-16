"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export function HomeSearch() {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const suffix = params.toString();
    router.push(suffix ? `/imprese?${suffix}` : "/imprese");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Ricerca imprese"
      className="border-line bg-surface-elevated shadow-soft w-full rounded-md border p-2 sm:p-2.5"
    >
      <label htmlFor={inputId} className="sr-only">
        Cerca un&apos;impresa
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          id={inputId}
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca un’impresa per nome o attività…"
          autoComplete="off"
          className="border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-brand focus:bg-surface-elevated min-h-11 w-full flex-1 rounded-sm border px-3 text-sm focus:outline-none"
        />
        <Button type="submit" className="min-h-11 sm:min-w-28">
          Cerca
        </Button>
      </div>
    </form>
  );
}
