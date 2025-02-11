import { type Route } from './biome-route-finder';

interface RouteListProps {
  routes: Route[];
}

export function RouteList({ routes }: RouteListProps) {
  if (routes.length === 0) {
    return <div className="text-gray-400 text-center">Select biomes to find routes</div>;
  }

  return (
    <div className="space-y-4">
      {routes.map((route, i) => (
        <div key={i} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <div className="text-white">
            {route.path.map((biome, j) => (
              <span key={j}>
                {biome}
                {j < route.path.length - 1 && (
                  <span className="mx-2">
                    →ₚ{route.probabilities[j]}→
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

