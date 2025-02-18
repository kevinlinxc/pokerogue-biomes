import { type Route } from './biome-route-finder';
import { BiomeGraph } from './biome-graph';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface RouteListProps {
  routes: Route[];
  mode: 'route' | 'cycle';
}

export function RouteList({ routes, mode }: RouteListProps) {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {routes.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="space-y-8"
          >
            <div className="h-full flex items-center justify-center mb-8">
              <p className="text-slate-400">
                {mode === 'cycle' ? 'Select a biome to find cycles' : 'Select biomes to find routes'}
              </p>
            </div>
            <BiomeGraph activePath={[]} activeProbs={[]} />
          </motion.div>
        ) : (
          <motion.div
            key="routes-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="space-y-8"
          >
            {/* Route cards */}
            <div className="space-y-4">
              {routes.map((route, routeIndex) => (
                <motion.div
                  key={routeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  onClick={() => setSelectedRouteIndex(routeIndex)}
                  className={`relative bg-white/50 p-6 rounded-xl shadow-sm cursor-pointer
                    transition-all duration-200 hover:bg-white/60
                    ${selectedRouteIndex === routeIndex ? 'ring-2 ring-blue-500 bg-white/70' : ''}`}
                >
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {route.path.map((biome, nodeIndex) => (
                      <div key={nodeIndex} className="flex items-center">
                        {/* Biome node */}
                        <div className="bg-white shadow-md px-4 py-2 rounded-lg border border-slate-200 transition-colors hover:bg-slate-50">
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
                  <div className="absolute -left-3 -top-3 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-slate-200">
                    <span className="text-slate-600 text-sm font-medium">{routeIndex + 1}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Graph visualization */}
            <BiomeGraph
              activePath={routes[selectedRouteIndex]?.path || []}
              activeProbs={routes[selectedRouteIndex]?.probabilities || []}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
