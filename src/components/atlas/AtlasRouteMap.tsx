import {
  ATLAS_COUNTRY_CENTRES,
  ATLAS_MAP_HEIGHT,
  ATLAS_MAP_WIDTH,
  projectAtlasCoordinate,
  routeCurvePath,
} from "@/lib/atlas/map";
import type { AtlasCountrySummary } from "@/lib/data/public/atlas";
import type { RouteSummary } from "@/lib/data/public/routes";

type Props = {
  countries: AtlasCountrySummary[];
  routes: RouteSummary[];
};

const LONGITUDES = [-120, -60, 0, 60, 120];
const LATITUDES = [-60, -30, 0, 30, 60];

export function AtlasRouteMap({ countries, routes }: Props) {
  const visibleCountries = countries.filter((item) => item.hasEvidence);
  const visibleCodes = new Set(visibleCountries.map((item) => item.country.code));

  return (
    <figure className="border border-black bg-white">
      <div className="border-b border-black px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Mappa schematica · proiezione geografica
        </p>
        <figcaption className="mt-1 text-sm leading-6 text-neutral-700">
          I punti rappresentano Paesi con evidenze pubblicate. Le linee compaiono solo per rotte attive
          che dispongono di dati o contenuti verificati. La posizione è geografica; la dimensione dei punti
          non rappresenta una quantità statistica.
        </figcaption>
      </div>

      <div className="overflow-x-auto p-3 sm:p-5">
        <svg
          viewBox={`0 0 ${ATLAS_MAP_WIDTH} ${ATLAS_MAP_HEIGHT}`}
          className="h-auto min-w-[680px] w-full"
          role="img"
          aria-labelledby="atlas-route-map-title atlas-route-map-desc"
        >
          <title id="atlas-route-map-title">Mappa delle evidenze e delle rotte dell&apos;Atlante</title>
          <desc id="atlas-route-map-desc">
            Rappresentazione schematica dei Paesi coperti e delle rotte origine-destinazione con evidenze pubblicate.
          </desc>

          <rect x="0.5" y="0.5" width={ATLAS_MAP_WIDTH - 1} height={ATLAS_MAP_HEIGHT - 1} fill="white" stroke="black" />

          {LONGITUDES.map((lon) => {
            const x = projectAtlasCoordinate({ lon, lat: 0 }).x;
            return <line key={`lon-${lon}`} x1={x} y1="0" x2={x} y2={ATLAS_MAP_HEIGHT} stroke="currentColor" strokeOpacity="0.12" />;
          })}
          {LATITUDES.map((lat) => {
            const y = projectAtlasCoordinate({ lon: 0, lat }).y;
            return <line key={`lat-${lat}`} x1="0" y1={y} x2={ATLAS_MAP_WIDTH} y2={y} stroke="currentColor" strokeOpacity="0.12" />;
          })}

          <path d={`M 0 ${ATLAS_MAP_HEIGHT / 2} H ${ATLAS_MAP_WIDTH}`} stroke="currentColor" strokeOpacity="0.24" strokeWidth="1.2" />
          <path d={`M ${ATLAS_MAP_WIDTH / 2} 0 V ${ATLAS_MAP_HEIGHT}`} stroke="currentColor" strokeOpacity="0.24" strokeWidth="1.2" />

          {routes.map((item) => {
            const origin = ATLAS_COUNTRY_CENTRES[item.route.origin.code];
            const destination = ATLAS_COUNTRY_CENTRES[item.route.destination.code];
            if (!origin || !destination) return null;
            return (
              <a key={item.route.id} href={`/atlante/rotte/${item.route.slug}`} aria-label={`${item.route.origin.name} → ${item.route.destination.name}`}>
                <path
                  d={routeCurvePath(origin, destination)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeOpacity="0.72"
                />
              </a>
            );
          })}

          {visibleCountries.map((item) => {
            const coordinate = ATLAS_COUNTRY_CENTRES[item.country.code];
            if (!coordinate || !visibleCodes.has(item.country.code)) return null;
            const point = projectAtlasCoordinate(coordinate);
            return (
              <a key={item.country.code} href={`/atlante/${item.country.slug}`} aria-label={`Scheda Paese: ${item.country.name}`}>
                <circle cx={point.x} cy={point.y} r="7" fill="black" />
                <text x={point.x + 10} y={point.y - 9} fontSize="13" fontWeight="600" fill="currentColor">
                  {item.country.code}
                </text>
              </a>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
