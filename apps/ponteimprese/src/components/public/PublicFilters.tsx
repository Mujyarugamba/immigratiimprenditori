import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildQueryString } from "@/lib/data/public/paging";

export type FilterField =
  | {
      kind: "text";
      name: string;
      label: string;
      placeholder?: string;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
    };

type PublicFiltersProps = {
  action: string;
  fields: FilterField[];
  values: Record<string, string>;
  hiddenValues?: Record<string, string>;
};

export function PublicFilters({
  action,
  fields,
  values,
  hiddenValues = {},
}: PublicFiltersProps) {
  const hasActive = Object.values(values).some((v) => v.length > 0);

  return (
    <form
      method="get"
      action={action}
      className="border-line bg-surface-elevated mt-6 grid gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink font-medium">{field.label}</span>
          {field.kind === "text" ? (
            <input
              type="search"
              name={field.name}
              defaultValue={values[field.name] ?? ""}
              placeholder={field.placeholder}
              className="border-line bg-surface text-ink rounded-md border px-3 py-2 text-sm"
            />
          ) : (
            <select
              name={field.name}
              defaultValue={values[field.name] ?? ""}
              className="border-line bg-surface text-ink rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Tutti</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
        <Button type="submit" size="sm">
          Applica filtri
        </Button>
        {hasActive ? (
          <Link
            href={action}
            className="text-ink-muted hover:text-ink text-sm font-medium"
          >
            Reset
          </Link>
        ) : null}
        {/* Preserve page reset when filtering */}
        <input type="hidden" name="page" value="1" />
        {Object.entries(hiddenValues).map(([name, value]) =>
          value ? (
            <input key={name} type="hidden" name={name} value={value} />
          ) : null,
        )}
      </div>
      {/* Keep unused params out; buildQueryString helper available for links */}
      <span className="sr-only">{buildQueryString(values)}</span>
    </form>
  );
}
