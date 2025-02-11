import { type Route } from './biome-route-finder';

interface RouteListProps {
  routes: Route[];
}

export function RouteList({ routes }: RouteListProps) {
  if (routes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Select biomes to find routes</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {routes.map((route, routeIndex) => (
        <div key={routeIndex} className="relative bg-white/50 p-6 rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-2 items-center">
            {route.path.map((biome, nodeIndex) => (
              <div key={nodeIndex} className="flex items-center">
                {/* Biome node */}
                <div className="bg-white shadow-md px-4 py-2 rounded-lg 
                              border border-slate-200
                              transition-colors hover:bg-slate-50">
                  <span className="text-slate-700 font-medium whitespace-nowrap">{biome}</span>
                </div>
                
                {/* Arrow and probability */}
                {nodeIndex < route.path.length - 1 && (
                  <div className="flex items-center mx-2">
                    <div className="flex items-center gap-1">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        {(route.probabilities[nodeIndex] * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Route number */}
          <div className="absolute -left-3 -top-3 w-8 h-8 
                        bg-white shadow-md rounded-full 
                        flex items-center justify-center 
                        border border-slate-200">
            <span className="text-slate-600 text-sm font-medium">
              {routeIndex + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

