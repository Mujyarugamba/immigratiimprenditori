type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "Contenuti in arrivo",
  description = "Questa sezione è in fase di allestimento. I contenuti verranno pubblicati progressivamente, senza dati provvisori inventati.",
}: EmptyStateProps) {
  return (
    <div className="border-line bg-surface mt-8 rounded-md border border-dashed px-5 py-8">
      <h2 className="text-ink text-lg font-medium">{title}</h2>
      <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
        {description}
      </p>
    </div>
  );
}
