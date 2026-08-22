type ChartRow = {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
};

type Props = {
  title: string;
  rows: ChartRow[];
};

export function ExplorerBarChart({ title, rows }: Props) {
  if (rows.length === 0) return null;
  const ordered = [...rows].sort((a, b) => b.value - a.value).slice(0, 20);
  const max = Math.max(...ordered.map((row) => Math.abs(row.value)), 1);

  return (
    <figure className="border border-black bg-white">
      <div className="border-b border-black px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Visualizzazione</p>
        <figcaption className="mt-1 text-lg font-semibold text-black">{title}</figcaption>
      </div>
      <div className="space-y-4 p-5">
        {ordered.map((row) => {
          const width = Math.max(1.5, (Math.abs(row.value) / max) * 100);
          return (
            <div key={row.id}>
              <div className="mb-1.5 flex items-end justify-between gap-4 text-sm">
                <span className="min-w-0 font-medium text-neutral-800">{row.label}</span>
                <strong className="shrink-0 text-black">{row.formattedValue}</strong>
              </div>
              <div className="h-3 border border-black" aria-hidden="true">
                <div className="h-full bg-black" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {rows.length > 20 ? (
        <p className="border-t border-black px-5 py-3 text-xs text-neutral-600">
          Grafico limitato ai 20 valori più alti; la tabella conserva tutti i risultati filtrati.
        </p>
      ) : null}
    </figure>
  );
}
