import { type Route } from './biome-route-finder';

interface RouteListProps {
  routes: Route[];
}

export function RouteList({ routes }: RouteListProps) {
  if (routes.length === 0) {
    return <div className="text-gray-400 text-center">Select biomes to find routes</div>;
  }

  return (
    <div className="space-y-8">
      {routes.map((route, routeIndex) => (
        <div key={routeIndex} className="relative bg-white/5 p-4 rounded-xl">
          <div className="space-y-2">
            {route.path.map((biome, nodeIndex) => (
              <div key={nodeIndex} className="relative">
                {/* Biome node */}
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg 
                              shadow-lg border border-white/20 
                              transition-colors hover:bg-white/20">
                  <span className="text-white font-medium">{biome}</span>
                </div>
                
                {/* Arrow and probability indicator */}
                {nodeIndex < route.path.length - 1 && (
                  <div className="flex items-center my-1 pl-4">
                    <div className="h-8 w-0.5 bg-white/20"></div>
                    <div className="ml-2 text-sm text-white/60">
                      <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                        {(route.probabilities[nodeIndex] * 100).toFixed(0)}% chance
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Route number indicator */}
          <div className="absolute -left-4 -top-4 w-8 h-8 
                        bg-white/10 backdrop-blur-sm rounded-full 
                        flex items-center justify-center 
                        border border-white/20">
            <span className="text-white/80 text-sm font-medium">
              {routeIndex + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

