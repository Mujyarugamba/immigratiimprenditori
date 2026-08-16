import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  label,
  name,
  error,
  hint,
  children,
  type = "text",
  ...inputProps
}: FormFieldProps) {
  const id = inputProps.id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          name={name}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className="border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-60"
          {...inputProps}
        />
      )}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-ink-subtle text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-accent-dark text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
