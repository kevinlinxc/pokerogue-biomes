import { type Route } from './biome-route-finder';
import { BiomeGraph } from './biome-graph';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

function formatRouteForClipboard(route: Route, mode: 'route' | 'cycle', routeType: 'shortest' | 'highest-probability', source: string, destination?: string): string {
  const pathText = route.path.reduce((acc, biome, index) => {
    if (index === route.path.length - 1) return acc + biome;
    return acc + biome + ` → ${(route.probabilities[index] * 100).toFixed(0)}% → `;
  }, '');

  let prefix = '';
  if (mode === 'route') {
    prefix = routeType === 'shortest'
      ? `The shortest route from ${source} to ${destination} is: `
      : `The highest probability route from ${source} to ${destination} is: `;
  } else {
    prefix = `The shortest cycle containing ${source} is: `;
  }

  return prefix + pathText + '\naccording to https://pokerogue-biomes.vercel.app/';
}

interface RouteListProps {
  routes: Route[];
  mode: 'route' | 'cycle';
  routeType: 'shortest' | 'highest-probability';
  sourceBiome: string;
  destinationBiome?: string;
}

export function RouteList({ routes, mode, routeType, sourceBiome, destinationBiome }: RouteListProps) {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (route: Route, index: number) => {
    const text = formatRouteForClipboard(route, mode, routeType, sourceBiome, destinationBiome);
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
  };

  return (
    <div className="space-y-4 lg:space-y-8">
      <AnimatePresence mode="wait">
        {routes.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4 lg:space-y-8"
          >
            <div className="h-full flex items-center justify-center mb-8">
              <p className="text-slate-400">
                {mode === 'cycle' ? 'Select a biome to find cycles' : 'Select biomes to find routes'}
              </p>
            </div>
            <div className="h-[60vh] lg:h-[800px]">
              <BiomeGraph activePath={[]} activeProbs={[]} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="routes-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4 lg:space-y-8"
          >
            {/* Route cards - Modified for responsive layout */}
            <div className="space-y-3 lg:space-y-4">
              {routes.map((route, routeIndex) => (
                <motion.div
                  key={routeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  onClick={() => setSelectedRouteIndex(routeIndex)}
                  className={`relative bg-white/50 p-4 lg:p-6 rounded-xl shadow-sm cursor-pointer
                    transition-all duration-200 hover:bg-white/60 text-sm lg:text-base group
                    ${selectedRouteIndex === routeIndex ? 'ring-2 ring-blue-500 bg-white/70' : ''}`}
                >
                  {/* Add copy button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent route selection
                      handleCopy(route, routeIndex);
                    }}
                    className="absolute right-2 top-2 p-2 rounded-lg 
                             transition-all duration-100 
                             opacity-80 group-hover:opacity-100
                             hover:bg-slate-200/50"
                  >
                    <AnimatePresence mode="wait">
                      {copiedIndex === routeIndex ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          key="check"
                        >
                          <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          key="copy"
                        >
                          <ClipboardDocumentIcon className="w-5 h-5 text-slate-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

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
            <div className="h-[60vh] lg:h-[800px]">
              <BiomeGraph
                activePath={routes[selectedRouteIndex]?.path || []}
                activeProbs={routes[selectedRouteIndex]?.probabilities || []}
              />
            </div>
          </motion.div>

        )}
      </AnimatePresence>


    </div>
  );
}
