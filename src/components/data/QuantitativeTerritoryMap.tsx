import { coordinateForTerritoryCode, isItalianRegionCode } from "@/lib/atlas/territory-map";

type MapRow = {
  id: string;
  territoryCode: string;
  territoryLabel: string;
  value: number;
  formattedValue: string;
};

type Props = {
  title: string;
  rows: MapRow[];
};

const WIDTH = 960;
const HEIGHT = 520;

function worldProject(lon: number, lat: number) {
  return {
    x: ((lon + 180) / 360) * WIDTH,
    y: ((90 - lat) / 180) * HEIGHT,
  };
}

function italyProject(lon: number, lat: number) {
  const minLon = 5.5;
  const maxLon = 19.5;
  const minLat = 35.0;
  const maxLat = 48.5;
  return {
    x: ((lon - minLon) / (maxLon - minLon)) * WIDTH,
    y: ((maxLat - lat) / (maxLat - minLat)) * HEIGHT,
  };
}

export function QuantitativeTerritoryMap({ title, rows }: Props) {
  const mappable = rows
    .map((row) => ({ ...row, coordinate: coordinateForTerritoryCode(row.territoryCode) }))
    .filter((row): row is typeof row & { coordinate: { lon: number; lat: number } } => Boolean(row.coordinate));

  if (mappable.length === 0) return null;
  const italyOnly = mappable.every((row) => isItalianRegionCode(row.territoryCode));
  const max = Math.max(...mappable.map((row) => Math.abs(row.value)), 1);
  const project = italyOnly ? italyProject : worldProject;

  return (
    <figure className="border border-black bg-white">
      <div className="border-b border-black px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Mappa quantitativa · simboli proporzionali
        </p>
        <figcaption className="mt-1 text-lg font-semibold text-black">{title}</figcaption>
        <p className="mt-2 max-w-4xl text-xs leading-5 text-neutral-600">
          L&apos;area dei cerchi varia con il valore. I punti sono ancore cartografiche rappresentative del territorio,
          non centroidi statistici. La mappa mostra un solo indicatore e non somma categorie diverse.
        </p>
      </div>
      <div className="overflow-x-auto p-3 sm:p-5">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto min-w-[680px] w-full"
          role="img"
          aria-label={`${title}. ${mappable.length} territori rappresentati.`}
        >
          <rect x="0.5" y="0.5" width={WIDTH - 1} height={HEIGHT - 1} fill="white" stroke="black" />
          {Array.from({ length: 9 }, (_, index) => {
            const x = (WIDTH / 10) * (index + 1);
            return <line key={`x-${index}`} x1={x} y1="0" x2={x} y2={HEIGHT} stroke="currentColor" strokeOpacity="0.08" />;
          })}
          {Array.from({ length: 5 }, (_, index) => {
            const y = (HEIGHT / 6) * (index + 1);
            return <line key={`y-${index}`} x1="0" y1={y} x2={WIDTH} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
          })}

          {mappable.map((row) => {
            const point = project(row.coordinate.lon, row.coordinate.lat);
            const radius = 6 + Math.sqrt(Math.abs(row.value) / max) * 24;
            return (
              <g key={row.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  fill="black"
                  fillOpacity="0.72"
                  stroke="black"
                  strokeWidth="1.5"
                >
                  <title>{`${row.territoryLabel}: ${row.formattedValue}`}</title>
                </circle>
                <text x={point.x + radius + 5} y={point.y + 4} fontSize="12" fontWeight="600" fill="currentColor">
                  {row.territoryLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="border-t border-black px-5 py-4">
        <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[...mappable]
            .sort((a, b) => b.value - a.value)
            .map((row) => (
              <li key={row.id} className="flex justify-between gap-3 border-b border-neutral-200 pb-2">
                <span>{row.territoryLabel}</span>
                <strong>{row.formattedValue}</strong>
              </li>
            ))}
        </ul>
      </div>
    </figure>
  );
}
